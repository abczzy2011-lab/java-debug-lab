// src/perf-check.js — Stage A/B/C of the hard performance gate (6.1-6.3).
// Pure functions: pass a mocked `env` object; no WebGPU calls at import time.
// Stage D (GPU benchmark) lives in perf-benchmark.js.

export const GATE_CODES = {
  PASS: 'PASS', NO_SECURE: 'NO_SECURE', NO_WEBGPU: 'NO_WEBGPU', NO_ADAPTER: 'NO_ADAPTER',
  NO_DEVICE: 'NO_DEVICE', NO_F16: 'NO_F16', UNSUPPORTED_BROWSER: 'UNSUPPORTED_BROWSER',
  GPU_LIMITS: 'GPU_LIMITS', LOW_MEMORY: 'LOW_MEMORY', MEM_UNKNOWN: 'MEM_UNKNOWN',
  LOW_CPU: 'LOW_CPU', LOW_STORAGE: 'LOW_STORAGE', SLOW_GPU: 'SLOW_GPU',
};

const LIMIT_REQUIREMENTS = {
  // 手机 GPU 的 maxBufferSize 常见只有 128–256MB；0.5B 模型用不到 512MB 单缓冲。
  maxStorageBufferBindingSize: 128 * 1024 * 1024,
  maxComputeWorkgroupStorageSize: 16 * 1024,
  maxComputeInvocationsPerWorkgroup: 256,
};

function check(id, label, ok, detail) { return { id, label, ok: !!ok, detail }; }

/**
 * Run stage A/B/C. `env` shape:
 * { secureContext, gpu, adapter, device, ua, deviceMemory, hardwareConcurrency,
 *   storage: {quota, usage}, storagePersisted }
 * Returns gate result object per 6.6 (without Stage D gflops).
 */
export function evaluateEnvironment(env = {}) {
  const checks = [];
  let code = 'PASS';

  const A = (id, label, ok, failCode, detail) => {
    checks.push(check(id, label, ok, detail));
    if (!ok && code === 'PASS') code = failCode;
  };

  // Stage A
  A('secure', '安全上下文 (HTTPS/localhost)', env.secureContext === true, 'NO_SECURE', String(env.secureContext));
  A('webgpu', 'WebGPU API', !!env.gpu, 'NO_WEBGPU', env.gpu ? 'present' : 'missing');
  A('adapter', 'GPU 适配器', !!env.adapter, 'NO_ADAPTER', env.adapter?.info?.description || '');
  A('device', 'GPU 设备', !!env.device, 'NO_DEVICE', '');
  const hasF16 = !!(env.device && env.device.features && env.device.features.has?.('shader-f16'));
  A('f16', 'shader-f16 支持', hasF16, 'NO_F16', '');

  // Safari 26+ / Chrome 113+ / 移动端 Safari 与 Chrome 都已支持 WebGPU。
  // 是否真的能跑由 adapter/limits/benchmark 决定，不再用 UA 直接拒绝 Safari 或手机。
  const ua = String(env.ua || '');
  // 国产手机浏览器常带厂商 token 或只有 Android/Mobile，不能因为 UA 不在白名单就拒绝。
  const mobile = /Android|iPhone|iPad|iPod|Mobile|Tablet|Phone|HarmonyOS|OpenHarmony|OppoBrowser|VivoBrowser|HeyTapBrowser|MiuiBrowser|HuaweiBrowser|HonorBrowser|UCBrowser|Quark|QQBrowser|MQQBrowser|SamsungBrowser/i.test(ua);
  const knownBrowser = /Chrome|Chromium|CriOS|Edg|EdgiOS|Safari|Firefox|FxiOS|OppoBrowser|VivoBrowser|HeyTapBrowser|MiuiBrowser|HuaweiBrowser|HonorBrowser|UCBrowser|Quark|QQBrowser|MQQBrowser|SamsungBrowser|baidubrowser|SogouMobileBrowser|QihooBrowser/i.test(ua);
  // 手机厂商浏览器即使 UA 没带白名单 token，只要有 WebKit/Android 特征也按真实浏览器放行。
  const browserLike = knownBrowser || (mobile && /AppleWebKit|Linux; Android|iPhone|iPad/i.test(ua));
  A('browser', '现代浏览器（Safari / Chrome / Edge / 手机厂商浏览器）', browserLike,
    'UNSUPPORTED_BROWSER', (mobile ? '移动端 · ' : '桌面端 · ') + ua.slice(0, 72));

  // Stage B
  const limits = env.adapter?.limits || {};
  const requirements = { ...LIMIT_REQUIREMENTS, maxBufferSize: (mobile ? 128 : 512) * 1024 * 1024 };
  for (const [name, min] of Object.entries(requirements)) {
    const val = limits[name];
    const ok = typeof val === 'number' && val >= min;
    checks.push(check('limit.' + name, 'GPU 限制 ' + name, ok, `${val} (需 >= ${min})`));
    if (!ok && code === 'PASS') code = 'GPU_LIMITS';
  }

  // Stage C
  const mem = env.deviceMemory;               // GiB or undefined
  const minMemory = mobile ? 4 : 8;
  if (typeof mem === 'number') {
    checks.push(check('memory', `内存 >= ${minMemory} GiB`, mem >= minMemory, mem + ' GiB'));
    if (mem < minMemory && code === 'PASS') code = 'LOW_MEMORY';
  } else {
    checks.push(check('memory', '内存未知（依赖基准测试）', true, 'MEM_UNKNOWN'));
    if (code === 'PASS') code = 'MEM_UNKNOWN'; // soft: benchmark may still pass
  }
  const cores = env.hardwareConcurrency || 0;
  checks.push(check('cpu', 'CPU >= 4 核', cores >= 4, cores + ' 核'));
  if (cores < 4 && code === 'PASS') code = 'LOW_CPU';

  const storage = env.storage || {};
  const free = (Number(storage.quota) || 0) - (Number(storage.usage) || 0);
  const minStorage = (mobile ? 1 : 1.5) * 1024 ** 3;
  checks.push(check('storage', `可用存储 >= ${mobile ? '1' : '1.5'}GB`, free >= minStorage,
    (free / 1024 ** 3).toFixed(2) + ' GiB'));
  if (free < minStorage && code === 'PASS') code = 'LOW_STORAGE';
  // persist() denial is a warning only, never a fail
  checks.push(check('persist', '持久化存储授权（仅提示）', true,
    env.storagePersisted === false ? '缓存可能被系统清理' : '已授权或未知'));

  const hardPass = code === 'PASS' || code === 'MEM_UNKNOWN';
  return {
    ok: hardPass,
    code: hardPass ? (code === 'MEM_UNKNOWN' ? 'PASS' : code) : code,
    checks,
    metrics: {
      deviceMemory: mem ?? null, cores, storageFree: free,
      adapter: env.adapter?.info?.description || env.adapter?.info?.architecture || '',
      limits,
    },
    canInstall: false,   // only true after Stage D + consent
    mode: hardPass ? 'local' : 'search',
    softWarnings: env.storagePersisted === false ? ['缓存可能被系统清理'] : [],
  };
}

/** Merge Stage D benchmark result into an environment gate result (6.6). */
export function withBenchmark(gate, benchmark) {
  const gflops = Number(benchmark?.gflops) || 0;
  const ok = gate.ok && gflops >= 15 && !benchmark?.software;
  const checks = gate.checks.concat(
    check('benchmark', 'GPU 基准 >= 15 GFLOPS', gflops >= 15 && !benchmark?.software,
      `${gflops.toFixed(1)} GFLOPS${benchmark?.software ? ' (software adapter)' : ''}`)
  );
  return {
    ...gate,
    ok,
    code: ok ? 'PASS' : (gflops < 15 ? 'SLOW_GPU' : gate.code),
    checks,
    metrics: { ...gate.metrics, gflops, software: !!benchmark?.software },
    mode: ok ? 'local' : 'search',
  };
}

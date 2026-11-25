// src/assistant.js — WebLLM wrapper: pinned model, explicit install, load/stream/stop/unload.
// No model bytes fetched at import; dynamic import only in load(). No main HTML edits.

// Three local sizes are exposed. 1.5B is the default for an 8GB M3 Air:
// WebLLM reports ~1.63GB VRAM, while 3B needs ~2.5GB and can spill on 8GB.
export const MODELS = {
  '0.5b': {
    key: '0.5b',
    id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
    label: '0.5B',
    size: '约 0.4GB',
    vram: '约 0.9GB',
    recommended: false,
    // baseline flag only: a low-memory phone recommendation, never a hard block
    mobileRecommended: true,
    note: '低内存手机优先：体积最小，最不容易被系统回收',
  },
  '1.5b': {
    key: '1.5b',
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    label: '1.5B',
    size: '约 1.1GB',
    vram: '约 1.6GB',
    recommended: true,
    mobileRecommended: false,
    note: '中高端手机或 8GB 桌面首选：速度、内存和回答质量最平衡',
  },
  '3b': {
    key: '3b',
    id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
    label: '3B',
    size: '约 2.0GB',
    vram: '约 2.5GB',
    recommended: false,
    mobileRecommended: false,
    note: '回答更强，但下载和内存占用最高；手机上可能被系统回收',
  },
};
export const DEFAULT_MODEL_KEY = '1.5b';
export const DEFAULT_MOBILE_MODEL_KEY = '0.5b';

/* 各档位的建议阈值。手机端 3B 只有大内存 + 高跑分才推荐；所有档位仍可手动选择。
 * Chrome 的 navigator.deviceMemory 受隐私策略限制，最多上报 8GB；因此手机 3B 的
 * “8GB+”是上限语义，代表设备至少 8GB，无法再区分 12/16GB。是否推荐仍同时看
 * GPU 跑分和可用存储，不把 8GB 当成“必然能跑 3B”。 */
export const MODEL_FIT = {
  '0.5b': { storageGB: 0.4, mobileMemoryGB: 4, mobileGflops: 15, desktopMemoryGB: 8 },
  '1.5b': { storageGB: 1.1, mobileMemoryGB: 6, mobileGflops: 28, desktopMemoryGB: 8 },
  '3b':   { storageGB: 2.0, mobileMemoryGB: 8, mobileGflops: 80, desktopMemoryGB: 16 },
};

/**
 * Pick a recommendation, not a gate. Every model stays selectable/downloadable;
 * this only decides which card gets the "推荐" badge.
 * Safari mobile is capped at 1.5B because its per-tab memory limit is tighter
 * than Chromium Android; 3B remains manually selectable with a warning.
 * storageFree is bytes from navigator.storage.estimate(); when a model would
 * not fit, the recommendation steps down instead of suggesting a doomed download.
 */
export function recommendModelKey({ portable = false, safari = false, gflops = 0, deviceMemory = null, storageFree = null, cores = 0 } = {}) {
  const gf = Number(gflops) || 0;
  const memKnown = deviceMemory !== null && deviceMemory !== undefined && deviceMemory !== '';
  const mem = memKnown ? Number(deviceMemory) : null;
  const storageKnown = storageFree !== null && storageFree !== undefined && storageFree !== '';
  const storageBytes = storageKnown ? Number(storageFree) : NaN;
  const storageGB = Number.isFinite(storageBytes) && storageBytes >= 0 ? storageBytes / 1024 ** 3 : null;
  const fitsStorage = key => storageGB === null || storageGB >= MODEL_FIT[key].storageGB * 1.05;
  const downshift = key => {
    if (fitsStorage(key)) return key;
    if (key === '3b') return fitsStorage('1.5b') ? '1.5b' : '0.5b';
    return '0.5b';
  };
  if (portable) {
    if (!safari && mem !== null && mem >= MODEL_FIT['3b'].mobileMemoryGB && gf >= MODEL_FIT['3b'].mobileGflops) return downshift('3b');
    if (gf >= MODEL_FIT['1.5b'].mobileGflops && (mem === null || mem >= MODEL_FIT['1.5b'].mobileMemoryGB)) return downshift('1.5b');
    return '0.5b';
  }
  if (safari) {
    if (mem !== null && mem >= MODEL_FIT['1.5b'].desktopMemoryGB && gf >= MODEL_FIT['1.5b'].mobileGflops) return downshift('1.5b');
    if (mem === null && gf >= 35) return downshift('1.5b');
    return '0.5b';
  }
  if (mem !== null && mem >= MODEL_FIT['3b'].desktopMemoryGB && gf >= 50) return downshift('3b');
  return downshift('1.5b');
}
export const MODEL_ID = MODELS[DEFAULT_MODEL_KEY].id;
export const MODEL_PROXY_BASE = 'https://javis-model-proxy.abczzy2011.workers.dev/model';
export const WEBLLM_VERSION = '0.2.79'; // pinned; verify against registry at ship time
export const GEN = { temperature: 0.2, top_p: 0.9, max_tokens: 320, repetition_penalty: 1.05 };
export const LOAD_TIMEOUT_MS = 30 * 60 * 1000; // 1.5B/3B 模型在慢网/国内网络下需要更长的下载窗口
export const WARMUP_TIMEOUT_MS = 30000;
export const FIRST_TOKEN_TIMEOUT_MS = 60000;

// WebLLM 默认从 huggingface.co 直接拉 mlc-chat-config.json 和权重，跨域会被 CORS 拦。
// 这里走自己的 Worker 代理（/model/<key>/...），代理补上 ACAO:*，权重仍然由 HF 提供。
export const WEBLLM_APP_CONFIG = {
  // Safari / iOS 上优先用 Cache API；IndexedDB 大 blob 写入在 iOS 27 有膨胀 bug。
  useIndexedDBCache: false,
  model_list: [
    {
      // 0.5B 也走本站模型代理：Safari 直连 HF 的 307/缓存链在线上 Origin 会被 CORS 拦截。
      model: `${MODEL_PROXY_BASE}/qwen05/resolve/main/`,
      model_id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
      // wasm 也走本站代理：raw.githubusercontent 在国内移动网络经常不可达。
      model_lib: 'https://javis-model-proxy.abczzy2011.workers.dev/libs/v0_2_48/Qwen2-0.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm',
      low_resource_required: true,
      vram_required_MB: 944.62,
      // 0.5B 主要跑在手机/低内存设备；2048 上下文足够助教短问答，能少占 KV cache。
      overrides: { context_window_size: 2048 },
    },
    {
      model: `${MODEL_PROXY_BASE}/qwen15/resolve/main/`,
      model_id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
      model_lib: 'https://javis-model-proxy.abczzy2011.workers.dev/libs/v0_2_48/Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm',
      low_resource_required: true,
      vram_required_MB: 1629.75,
      overrides: { context_window_size: 4096 },
    },
    {
      model: `${MODEL_PROXY_BASE}/qwen3/resolve/main/`,
      model_id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
      model_lib: 'https://javis-model-proxy.abczzy2011.workers.dev/libs/v0_2_48/Qwen2.5-3B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm',
      low_resource_required: true,
      vram_required_MB: 2504.76,
      overrides: { context_window_size: 4096 },
    },
  ],
};

/**
 * 检查 WebLLM 的三类 Cache API 缓存是否完整：config、wasm、model。
 * 返回 complete / missing / partial / unknown。unknown 表示浏览器不支持
 * Cache API 或读取失败，此时调用方应保留原有“已下载”标记，不能误删。
 */
export async function inspectModelCache(modelId, { cacheStorage = globalThis.caches } = {}) {
  const rec = WEBLLM_APP_CONFIG.model_list.find(m => m.model_id === modelId);
  if (!rec || !cacheStorage?.open) return 'unknown';
  try {
    const configCache = await cacheStorage.open('webllm/config');
    if (!(await configCache.match(rec.model + 'mlc-chat-config.json'))) return 'missing';

    const wasmCache = await cacheStorage.open('webllm/wasm');
    if (!(await wasmCache.match(rec.model_lib))) return 'missing';

    const modelCache = await cacheStorage.open('webllm/model');
    const manifestRes = await modelCache.match(rec.model + 'ndarray-cache.json');
    if (!manifestRes) return 'missing';
    if (!(await modelCache.match(rec.model + 'tokenizer.json'))) return 'partial';
    const manifest = await manifestRes.json();
    const dataPaths = Array.isArray(manifest?.records)
      ? manifest.records.map(r => r?.dataPath).filter(Boolean)
      : [];
    if (!dataPaths.length) return 'partial';
    for (const dataPath of dataPaths) {
      if (!(await modelCache.match(rec.model + dataPath))) return 'partial';
    }
    return 'complete';
  } catch {
    return 'unknown';
  }
}

export function createAssistant({ engineFactory = null, now = Date.now, modelId = MODEL_ID, warmupTimeoutMs = WARMUP_TIMEOUT_MS } = {}) {
  let engine = null, loading = false, broken = false, currentAbort = null, deviceLost = false, loadCtl = null;
  const resolvedId = modelId || MODEL_ID;

  async function load(onProgress = () => {}) {
    if (engine) return engine;
    if (broken) throw new Error('LOCAL_BROKEN');
    loading = true;
    let failureCode = '';
    try {
      // Dynamic import: never on page boot
      const webllm = engineFactory ? { CreateMLCEngine: engineFactory }
        : await import('https://esm.run/@mlc-ai/web-llm@' + WEBLLM_VERSION);
      const ctl = new AbortController();
      loadCtl = ctl;
      const timer = setTimeout(() => {
        failureCode = 'MODEL_TIMEOUT';
        ctl.abort(new Error('LOAD_TIMEOUT'));
      }, LOAD_TIMEOUT_MS);
      try {
        engine = await webllm.CreateMLCEngine(resolvedId, {
          initProgressCallback: p => onProgress(p),
          signal: ctl.signal,
          appConfig: WEBLLM_APP_CONFIG,
        });
      } finally {
        clearTimeout(timer);
        if (loadCtl === ctl) loadCtl = null;
      }

      // Stage E warmup (6.5). 必须把 signal 真正传给推理请求：原实现只 abort
      // 了一个没被引用的 controller，下载到 100% 后可能永远卡在 warmup。
      const wt = setTimeout(() => {
        failureCode = 'WARMUP_TIMEOUT';
        try { currentAbort?.abort(new Error('WARMUP_TIMEOUT')); } catch {}
      }, warmupTimeoutMs);
      const warmCtl = new AbortController();
      currentAbort = warmCtl;
      try {
        await engine.chat.completions.create({
          messages: [{ role: 'user', content: '回复 OK' }],
          max_tokens: 8, stream: false, signal: warmCtl.signal,
        });
      } finally {
        clearTimeout(wt);
        if (currentAbort === warmCtl) currentAbort = null;
      }
      return engine;
    } catch (e) {
      broken = true;
      const failedEngine = engine;
      engine = null;
      // 预热超时/加载失败时，CreateMLCEngine 可能已经把权重放进显存；
      // 只把 engine 置空会泄漏，下一档下载更容易 OOM。
      if (failedEngine?.unload) {
        try { await failedEngine.unload(); } catch {}
      }
      const msg = String(failureCode || e?.message || e);
      throw new Error(/LOAD_TIMEOUT|MODEL_TIMEOUT/i.test(msg) ? 'MODEL_TIMEOUT'
        : /WARMUP_TIMEOUT/i.test(msg) ? 'WARMUP_TIMEOUT'
        : /abort|cancel/i.test(msg) ? 'ABORTED'
        : (/memory|oom/i.test(msg) ? 'OOM' : 'MODEL_LOAD'));
    } finally { loading = false; }
  }

  /** Stream tokens; onToken(text); returns full answer. Abort via stop(). */
  async function ask(messages, { onToken = () => {}, timeout = FIRST_TOKEN_TIMEOUT_MS } = {}) {
    if (!engine) throw new Error('MODEL_NOT_LOADED');
    if (deviceLost) throw new Error('DEVICE_LOST');
    const ctl = new AbortController();
    currentAbort = ctl;
    let first = true, failureCode = '';
    const ft = setTimeout(() => {
      if (first) {
        failureCode = 'FIRST_TOKEN_TIMEOUT';
        ctl.abort(new Error('FIRST_TOKEN_TIMEOUT'));
      }
    }, timeout);
    try {
      const stream = await engine.chat.completions.create({
        messages, ...GEN, stream: true, signal: ctl.signal,
      });
      let full = '';
      for await (const chunk of stream) {
        const tok = chunk?.choices?.[0]?.delta?.content || '';
        if (!tok) continue;
        if (first) { first = false; clearTimeout(ft); }
        full += tok; onToken(tok);
      }
      return full;
    } catch (e) {
      const msg = String(failureCode || ctl.signal?.reason?.message || e?.message || e);
      if (/device.*lost/i.test(msg)) deviceLost = true;
      throw new Error(/first_token/i.test(msg) ? 'FIRST_TOKEN_TIMEOUT'
        : /abort/i.test(msg) ? 'ABORTED' : 'GENERATION');
    } finally { clearTimeout(ft); currentAbort = null; }
  }

  function stop() { try { currentAbort?.abort(new Error('ABORTED')); } catch {} }
  function cancelLoad() { try { loadCtl?.abort(new Error('ABORTED')); } catch {} }
  async function unload() {
    cancelLoad();
    stop();
    try { await engine?.unload?.(); } catch {}
    engine = null; loading = false;
  }
  function markDeviceLost() { deviceLost = true; engine = null; broken = true; }
  function reset() {
    cancelLoad();
    stop();
    engine = null; loading = false; broken = false; deviceLost = false;
  }

  return {
    load, ask, stop, unload, reset, cancelLoad, markDeviceLost,
    get state() {
      return { loaded: !!engine, loading, broken, deviceLost };
    },
    modelId: resolvedId,
  };
}

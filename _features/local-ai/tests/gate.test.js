import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateEnvironment, withBenchmark } from '../src/perf-check.js';

function baseEnv(over = {}) {
  return {
    secureContext: true, gpu: {}, ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X) Chrome/126.0',
    adapter: {
      limits: {
        maxBufferSize: 512 * 1024 ** 2, maxStorageBufferBindingSize: 128 * 1024 ** 2,
        maxComputeWorkgroupStorageSize: 16 * 1024, maxComputeInvocationsPerWorkgroup: 256,
      }, info: { description: 'Apple M2' },
    },
    device: { features: new Set(['shader-f16']) },
    deviceMemory: 16, hardwareConcurrency: 8,
    storage: { quota: 100 * 1024 ** 3, usage: 10 * 1024 ** 3 }, storagePersisted: true,
    ...over,
  };
}

test('gate PASS on capable desktop', () => {
  const g = evaluateEnvironment(baseEnv());
  assert.equal(g.ok, true);
  assert.equal(g.code, 'PASS');
  assert.equal(g.canInstall, false);  // no consent yet
});

test('missing WebGPU -> NO_WEBGPU, mode search', () => {
  const g = evaluateEnvironment(baseEnv({ gpu: null, adapter: null, device: null }));
  assert.equal(g.ok, false);
  assert.equal(g.code, 'NO_WEBGPU');
  assert.equal(g.mode, 'search');
  assert.equal(g.canInstall, false);
});

test('no f16 -> NO_F16', () => {
  const g = evaluateEnvironment(baseEnv({ device: { features: new Set() } }));
  assert.equal(g.code, 'NO_F16');
});

test('mobile Safari UA is allowed; performance still decides', () => {
  const g = evaluateEnvironment(baseEnv({
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1',
    deviceMemory: undefined,
  }));
  assert.equal(g.ok, true);
  assert.equal(g.code, 'PASS');
});

test('OPPO / vivo / UC vendor browsers are allowed; WebGPU still decides', () => {
  for (const ua of [
    'Mozilla/5.0 (Linux; Android 14; PHK110) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/122.0.0.0 Mobile Safari/537.36 HeyTapBrowser/40.10.10.1.0',
    'Mozilla/5.0 (Linux; Android 14; V2309A) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/122.0.0.0 Mobile Safari/537.36 VivoBrowser/15.0.0.0',
    'Mozilla/5.0 (Linux; Android 14; 22101316C) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/122.0.0.0 Mobile Safari/537.36 UCBrowser/15.5.0.0',
    'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/122.0.0.0 Mobile Safari/537.36',
  ]) {
    const g = evaluateEnvironment(baseEnv({ ua, deviceMemory: 6 }));
    assert.equal(g.ok, true, ua);
    assert.equal(g.code, 'PASS', ua);
  }
});

test('unknown non-browser UA -> UNSUPPORTED_BROWSER', () => {
  const g = evaluateEnvironment(baseEnv({ ua: 'SomeBot/1.0' }));
  assert.equal(g.code, 'UNSUPPORTED_BROWSER');
});

test('desktop 4GB -> LOW_MEMORY', () => {
  const g = evaluateEnvironment(baseEnv({ deviceMemory: 4 }));
  assert.equal(g.code, 'LOW_MEMORY');
});

test('mobile 4GB passes the memory stage; benchmark still decides', () => {
  const g = evaluateEnvironment(baseEnv({
    ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36',
    deviceMemory: 4,
  }));
  assert.equal(g.ok, true);
  assert.equal(g.code, 'PASS');
});

test('mobile 3GB still fails LOW_MEMORY', () => {
  const g = evaluateEnvironment(baseEnv({
    ua: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/126.0 Mobile Safari/537.36',
    deviceMemory: 3,
  }));
  assert.equal(g.code, 'LOW_MEMORY');
});

test('unknown memory is soft pass, deferred to benchmark', () => {
  const g = evaluateEnvironment(baseEnv({ deviceMemory: undefined }));
  assert.equal(g.ok, true);
  assert.ok(g.checks.find(c => c.id === 'memory'));
});

test('low storage -> LOW_STORAGE', () => {
  const g = evaluateEnvironment(baseEnv({ storage: { quota: 2 * 1024 ** 3, usage: 1 * 1024 ** 3 } }));
  assert.equal(g.code, 'LOW_STORAGE');
});

test('GPU limit failure -> GPU_LIMITS', () => {
  const env = baseEnv();
  env.adapter.limits.maxBufferSize = 128 * 1024 ** 2;
  const g = evaluateEnvironment(env);
  assert.equal(g.code, 'GPU_LIMITS');
});

test('benchmark below 15 GFLOPS -> SLOW_GPU', () => {
  const g = withBenchmark(evaluateEnvironment(baseEnv()), { gflops: 9.4, software: false });
  assert.equal(g.ok, false);
  assert.equal(g.code, 'SLOW_GPU');
});

test('software adapter fails even with high measured GFLOPS', () => {
  const g = withBenchmark(evaluateEnvironment(baseEnv()), { gflops: 40, software: true });
  assert.equal(g.ok, false);
});

test('benchmark pass keeps PASS', () => {
  const g = withBenchmark(evaluateEnvironment(baseEnv()), { gflops: 22.5, software: false });
  assert.equal(g.ok, true);
  assert.equal(g.metrics.gflops, 22.5);
});

test('storage persist denial is warning only', () => {
  const g = evaluateEnvironment(baseEnv({ storagePersisted: false }));
  assert.equal(g.ok, true);
  assert.ok(g.softWarnings.some(w => w.includes('清理')));
});

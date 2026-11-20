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

test('mobile UA -> UNSUPPORTED_BROWSER', () => {
  const g = evaluateEnvironment(baseEnv({ ua: 'Mozilla/5.0 (iPhone) Mobile Safari' }));
  assert.equal(g.code, 'UNSUPPORTED_BROWSER');
});

test('low memory -> LOW_MEMORY', () => {
  const g = evaluateEnvironment(baseEnv({ deviceMemory: 4 }));
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

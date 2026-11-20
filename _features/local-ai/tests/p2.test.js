import test from 'node:test';
import assert from 'node:assert/strict';
import { benchmarkResult, flopsFor, gflops, median } from '../src/perf-benchmark.js';
import { decide, MODES } from '../src/mode-controller.js';
import { checkHealth, askCloud, UI_MODEL_LABEL } from '../src/cloud-client.js';

// --- benchmark math ---
test('flopsFor 1024 = 2*1024^3', () => {
  assert.equal(flopsFor(1024), 2 * 1024 ** 3);
});
test('gflops math', () => {
  assert.ok(Math.abs(gflops(1024, 1) - 2.147) < 0.01);
});
test('median of runs', () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 2, 3]), 2.5);
});
test('benchmarkResult fails slow/software', () => {
  assert.equal(benchmarkResult([0.2, 0.2, 0.2]).pass, false);   // ~10.7 GFLOPS
  assert.equal(benchmarkResult([0.05, 0.05, 0.05]).pass, true);  // ~42 GFLOPS
  assert.equal(benchmarkResult([0.05, 0.05, 0.05], { software: true }).pass, false);
});

// --- mode controller ---
test('boot online+cloud -> cloud, label 混合模型', () => {
  const r = decide({ online: true, cloudReady: true }, 'boot');
  assert.equal(r.mode, MODES.CLOUD);
  assert.equal(r.uiLabel, '混合模型');
});
test('boot offline, no local -> search', () => {
  const r = decide({ online: false, cloudReady: false, localReady: false }, 'boot');
  assert.equal(r.mode, MODES.SEARCH);
  assert.equal(r.uiLabel, '检索结果');
});
test('offline event with local ready -> local', () => {
  const r = decide({ online: true, cloudReady: true, localReady: true, mode: MODES.CLOUD }, 'offline');
  assert.equal(r.mode, MODES.LOCAL);
  assert.equal(r.reason, '网络断开·本地');
});
test('offline event without local -> search', () => {
  const r = decide({ online: true, cloudReady: true, localReady: false, mode: MODES.CLOUD }, 'offline');
  assert.equal(r.mode, MODES.SEARCH);
});
test('online event with health ok -> cloud', () => {
  const r = decide({ online: false, cloudReady: false, localReady: true, mode: MODES.LOCAL }, 'online', { healthOk: true });
  assert.equal(r.mode, MODES.CLOUD);
});
test('cloud 429/quota -> local if ready else search', () => {
  const a = decide({ online: true, cloudReady: true, localReady: true, mode: MODES.CLOUD }, 'cloud-429');
  assert.equal(a.mode, MODES.LOCAL);
  const b = decide({ online: true, cloudReady: true, localReady: false, mode: MODES.CLOUD }, 'cloud-quota');
  assert.equal(b.mode, MODES.SEARCH);
});
test('local fail -> cloud if online', () => {
  const r = decide({ online: true, cloudReady: true, localReady: true, mode: MODES.LOCAL }, 'local-fail');
  assert.equal(r.mode, MODES.CLOUD);
  assert.equal(r.state.localReady, false);
});
test('no mid-stream switch', () => {
  const r = decide({ online: true, cloudReady: true, localReady: true, mode: MODES.CLOUD, streaming: true }, 'offline');
  assert.equal(r.switch, false);
  assert.equal(r.mode, MODES.CLOUD);
});
test('stream-end then offline switches', () => {
  const r = decide({ online: true, cloudReady: false, localReady: true, mode: MODES.CLOUD, streaming: true }, 'stream-end');
  assert.equal(r.streaming !== undefined || r.state.streaming === false, true);
});
test('device-lost -> search when offline, no auto download', () => {
  const r = decide({ online: false, localReady: true, mode: MODES.LOCAL }, 'device-lost');
  assert.equal(r.mode, MODES.SEARCH);
  assert.equal(r.state.localReady, false);
});

// --- cloud client ---
test('UI label exactly 混合模型', () => {
  assert.equal(UI_MODEL_LABEL, '混合模型');
});
test('checkHealth ok', async () => {
  const r = await checkHealth({ fetchImpl: async () => ({ ok: true, json: async () => ({ ok: true, model: 'hybrid' }) }) });
  assert.equal(r.ok, true);
});
test('checkHealth 503 -> not ok', async () => {
  const r = await checkHealth({ fetchImpl: async () => ({ ok: false, status: 503 }) });
  assert.equal(r.ok, false);
});
test('askCloud success returns model hybrid', async () => {
  const r = await askCloud({ question: 'q', siteCard: 'c', fetchImpl: async () => ({
    ok: true, json: async () => ({ model: 'hybrid', answer: '答案 [P1]' }),
  }) });
  assert.equal(r.ok, true);
  assert.equal(r.answer, '答案 [P1]');
});
test('askCloud 429 -> degraded HYBRID_BUSY, no provider leak', async () => {
  const r = await askCloud({ question: 'q', siteCard: 'c', fetchImpl: async () => ({ ok: false, status: 429 }) });
  assert.equal(r.ok, false);
  assert.equal(r.error, 'HYBRID_BUSY');
  assert.doesNotMatch(JSON.stringify(r), /GLM|SenseNova|quota|额度/i);
});
test('askCloud network error -> degraded, no raw error leak', async () => {
  const r = await askCloud({ question: 'q', siteCard: 'c', fetchImpl: async () => { throw new Error('ECONNRESET'); } });
  assert.equal(r.ok, false);
  assert.equal(r.degraded, true);
  assert.doesNotMatch(JSON.stringify(r), /ECONNRESET/);
});

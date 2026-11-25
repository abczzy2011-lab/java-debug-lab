import test from 'node:test';
import assert from 'node:assert/strict';
import { createAssistant, MODEL_ID, MODELS, DEFAULT_MODEL_KEY, DEFAULT_MOBILE_MODEL_KEY, recommendModelKey, MODEL_FIT, WEBLLM_APP_CONFIG, GEN, inspectModelCache } from '../src/assistant.js';

function mockEngine({ fail = null, warm = true } = {}) {
  const calls = [];
  return {
    calls,
    factory: async (modelId, opts) => {
      calls.push(['create', modelId]);
      if (fail) throw new Error(fail);
      return {
        unload: async () => calls.push(['unload']),
        chat: { completions: {
          create: async (args) => {
            calls.push(['gen', args]);
            if (!warm && args.max_tokens === 8) throw new Error('OOM out of memory');
            if (args.stream) return (async function* () {
              yield { choices: [{ delta: { content: '你' } }] };
              yield { choices: [{ delta: { content: '好' } }] };
            })();
            return { choices: [{ message: { content: 'OK' } }] };
          },
        } },
      };
    },
  };
}

test('MODEL_ID pinned to recommended 1.5B', () => {
  assert.equal(DEFAULT_MODEL_KEY, '1.5b');
  assert.equal(MODEL_ID, 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC');
  assert.equal(MODELS['3b'].id, 'Qwen2.5-3B-Instruct-q4f16_1-MLC');
  assert.equal(GEN.temperature, 0.2);
});

test('mobile recommendation scales with WebGPU score and memory', () => {
  assert.equal(recommendModelKey({ portable: true, gflops: 12, deviceMemory: 4 }), '0.5b');
  assert.equal(recommendModelKey({ portable: true, gflops: 32, deviceMemory: 8 }), '1.5b');
  assert.equal(recommendModelKey({ portable: true, gflops: 90, deviceMemory: 8 }), '3b', 'Chrome caps deviceMemory at 8GB; high-end 8GB is reachable');
  assert.equal(recommendModelKey({ portable: true, gflops: 70, deviceMemory: 8 }), '1.5b', 'a mid-range score keeps 8GB phones on 1.5B');
  assert.equal(recommendModelKey({ portable: true, gflops: 90, deviceMemory: 12 }), '3b');
  assert.equal(recommendModelKey({ portable: true, gflops: 90, deviceMemory: 6 }), '1.5b', '6GB stays below 3B');
  assert.equal(recommendModelKey({ portable: true, gflops: 40, deviceMemory: 8 }), '1.5b', 'GPU still gates 3B');
  assert.equal(recommendModelKey({ portable: true, safari: true, gflops: 90, deviceMemory: 8 }), '1.5b', 'Safari tab cap stays below 3B');
  assert.equal(recommendModelKey({ portable: true, gflops: 0, deviceMemory: null }), '0.5b');
  assert.equal(recommendModelKey({ portable: true, gflops: 90, deviceMemory: 8, storageFree: 2.5 * 1024 ** 3 }), '3b');
  assert.equal(recommendModelKey({ portable: true, gflops: 90, deviceMemory: 8, storageFree: 1.2 * 1024 ** 3 }), '1.5b', '3B downgraded when storage is tight');
  assert.equal(recommendModelKey({ portable: true, gflops: 90, deviceMemory: 8, storageFree: 0 }), '0.5b', 'zero free storage is not unknown storage');
  assert.equal(recommendModelKey({ portable: true, gflops: 32, deviceMemory: 8, storageFree: 0.8 * 1024 ** 3 }), '0.5b', '1.5B downgraded when storage cannot fit');
  assert.equal(recommendModelKey({ gflops: 60, deviceMemory: 16, storageFree: 1.8 * 1024 ** 3 }), '1.5b', 'desktop 3B downgraded when storage is tight');
  assert.equal(recommendModelKey({ gflops: 0 }), '1.5b');
  assert.equal(MODEL_FIT['3b'].mobileMemoryGB, 8, 'phone 3B threshold is the Chrome deviceMemory ceiling');
  assert.ok(MODEL_FIT['3b'].mobileMemoryGB > MODEL_FIT['1.5b'].mobileMemoryGB);
});

test('all three sizes remain registered for phone selection', () => {
  assert.equal(DEFAULT_MOBILE_MODEL_KEY, '0.5b');
  assert.deepEqual(Object.keys(MODELS).sort(), ['0.5b', '1.5b', '3b']);
  for (const key of Object.keys(MODELS)) {
    assert.match(MODELS[key].id, /^Qwen2\.5-.*-MLC$/);
    assert.ok(MODELS[key].size);
    assert.ok(MODELS[key].vram);
  }
  const rec = WEBLLM_APP_CONFIG.model_list.find(m => m.model_id === MODELS['0.5b'].id);
  assert.ok(rec);
  assert.match(rec.model, /javis-model-proxy\.abczzy2011\.workers\.dev\/model\/qwen05\/resolve\/main\//);
  assert.match(rec.model_lib, /Qwen2-0\.5B-Instruct-q4f16_1/);
  assert.equal(WEBLLM_APP_CONFIG.useIndexedDBCache, false);
});

test('assistant can load the 3B model when selected', async () => {
  const m = mockEngine();
  const a = createAssistant({ engineFactory: m.factory, modelId: MODELS['3b'].id });
  await a.load();
  assert.ok(m.calls.some(c => c[0] === 'create' && c[1] === MODELS['3b'].id));
});

test('assistant loads with pinned model and warms up', async () => {
  const m = mockEngine();
  const a = createAssistant({ engineFactory: m.factory });
  const progress = [];
  await a.load(p => progress.push(p));
  assert.equal(a.state.loaded, true);
  assert.ok(m.calls.some(c => c[0] === 'create' && c[1] === MODEL_ID));
  assert.ok(m.calls.some(c => c[0] === 'gen' && c[1].max_tokens === 8)); // warmup
});

test('ask streams tokens and returns full answer', async () => {
  const m = mockEngine();
  const a = createAssistant({ engineFactory: m.factory });
  await a.load();
  const toks = [];
  const out = await a.ask([{ role: 'user', content: 'hi' }], { onToken: t => toks.push(t) });
  assert.equal(out, '你好');
  assert.deepEqual(toks, ['你', '好']);
});

test('OOM during warmup marks broken', async () => {
  const m = mockEngine({ warm: false });
  const a = createAssistant({ engineFactory: m.factory });
  await assert.rejects(() => a.load(), e => /OOM/.test(e.message));
  assert.equal(a.state.broken, true);
});

test('load failure marks broken', async () => {
  const m = mockEngine({ fail: 'network error' });
  const a = createAssistant({ engineFactory: m.factory });
  await assert.rejects(() => a.load());
  assert.equal(a.state.broken, true);
});

test('ask without load throws MODEL_NOT_LOADED', async () => {
  const a = createAssistant({ engineFactory: mockEngine().factory });
  await assert.rejects(() => a.ask([]), e => e.message === 'MODEL_NOT_LOADED');
});

test('unload clears engine', async () => {
  const m = mockEngine();
  const a = createAssistant({ engineFactory: m.factory });
  await a.load();
  await a.unload();
  assert.equal(a.state.loaded, false);
  assert.ok(m.calls.some(c => c[0] === 'unload'));
});

test('markDeviceLost makes state broken', async () => {
  const m = mockEngine();
  const a = createAssistant({ engineFactory: m.factory });
  await a.load();
  a.markDeviceLost();
  assert.equal(a.state.deviceLost, true);
  assert.equal(a.state.loaded, false);
});

test('reset allows retry after a failed load', async () => {
  let failOnce = true;
  const m = mockEngine();
  const factory = async (modelId, opts) => {
    if (failOnce) { failOnce = false; throw new Error('network error'); }
    return m.factory(modelId, opts);
  };
  const a = createAssistant({ engineFactory: factory });
  await assert.rejects(() => a.load());
  assert.equal(a.state.broken, true);
  a.reset();
  assert.equal(a.state.broken, false);
  await a.load();
  assert.equal(a.state.loaded, true);
});

test('cancelLoad aborts a pending download/load', async () => {
  let seenSignal = null;
  const factory = (_id, opts = {}) => new Promise((_resolve, reject) => {
    seenSignal = opts.signal;
    opts.signal?.addEventListener('abort', () => reject(new Error('ABORTED')));
  });
  const a = createAssistant({ engineFactory: factory });
  const pending = a.load();
  await new Promise(r => setTimeout(r, 0));
  assert.ok(seenSignal instanceof AbortSignal);
  a.cancelLoad();
  await assert.rejects(pending, /ABORTED/);
});

test('warmup receives a real abort signal and reports WARMUP_TIMEOUT', async () => {
  let warmupSignal = null, unloaded = false;
  const factory = (_id) => ({
    modelId: _id,
    chat: { completions: { create: (args) => {
      if (args.max_tokens === 8) {
        warmupSignal = args.signal;
        return new Promise((_resolve, reject) => {
          args.signal?.addEventListener('abort', () => reject(new Error(String(args.signal.reason?.message || 'aborted'))));
        });
      }
      return Promise.resolve({});
    } } },
    unload: async () => { unloaded = true; },
  });
  const a = createAssistant({ engineFactory: factory, warmupTimeoutMs: 40 });
  await assert.rejects(() => a.load(), /WARMUP_TIMEOUT/);
  assert.ok(warmupSignal instanceof AbortSignal);
  assert.equal(warmupSignal.aborted, true);
  assert.equal(unloaded, true);
  assert.equal(a.state.broken, true);
});

test('first-token timeout is not misreported as a user cancel', async () => {
  const factory = (_id) => ({
    modelId: _id,
    chat: { completions: { create: (args) => {
      if (!args.stream) return Promise.resolve({ choices: [{ message: { content: 'OK' } }] });
      return Promise.resolve({
        [Symbol.asyncIterator]() {
          return {
            next() {
              return new Promise((_resolve, reject) => {
                // WebLLM 实际抛的是通用 AbortError，不会帮我们保留 abort 的 reason；
                // 因此 ask 必须自己记住 FIRST_TOKEN_TIMEOUT。
                args.signal?.addEventListener('abort', () => reject(new Error('The operation was aborted')));
              });
            },
          };
        },
      });
    } } },
    unload: async () => {},
  });
  const a = createAssistant({ engineFactory: factory });
  await a.load();
  await assert.rejects(() => a.ask([{ role: 'user', content: 'hi' }], { timeout: 40 }), /FIRST_TOKEN_TIMEOUT/);
});

function cacheStorageFor(rec, { config = true, wasm = true, manifest = true, tokenizer = true, shards = ['params_shard_0.bin', 'params_shard_1.bin'], cachedShards = shards } = {}) {
  const entries = {
    'webllm/config': new Set(config ? [rec.model + 'mlc-chat-config.json'] : []),
    'webllm/wasm': new Set(wasm ? [rec.model_lib] : []),
    'webllm/model': new Set([
      ...(manifest ? [rec.model + 'ndarray-cache.json'] : []),
      ...(tokenizer ? [rec.model + 'tokenizer.json'] : []),
      ...cachedShards.map(s => rec.model + s),
    ]),
  };
  const manifestBody = { records: shards.map(dataPath => ({ dataPath })) };
  return {
    open: async name => ({
      match: async url => {
        if (!entries[name]?.has(url)) return null;
        if (name === 'webllm/model' && url.endsWith('ndarray-cache.json')) {
          return { json: async () => manifestBody };
        }
        return {};
      },
    }),
  };
}

test('inspectModelCache distinguishes complete, missing, partial and unknown', async () => {
  const rec = WEBLLM_APP_CONFIG.model_list.find(m => m.model_id === MODELS['0.5b'].id);
  assert.ok(rec);
  assert.equal(await inspectModelCache(rec.model_id, { cacheStorage: cacheStorageFor(rec) }), 'complete');
  assert.equal(await inspectModelCache(rec.model_id, { cacheStorage: cacheStorageFor(rec, { config: false }) }), 'missing');
  assert.equal(await inspectModelCache(rec.model_id, { cacheStorage: cacheStorageFor(rec, { cachedShards: ['params_shard_0.bin'] }) }), 'partial');
  assert.equal(await inspectModelCache(rec.model_id, { cacheStorage: cacheStorageFor(rec, { tokenizer: false }) }), 'partial');
  assert.equal(await inspectModelCache(rec.model_id, { cacheStorage: {} }), 'unknown');
  assert.equal(await inspectModelCache('not-a-model', { cacheStorage: cacheStorageFor(rec) }), 'unknown');
});

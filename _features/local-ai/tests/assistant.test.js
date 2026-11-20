import test from 'node:test';
import assert from 'node:assert/strict';
import { createAssistant, MODEL_ID, GEN } from '../src/assistant.js';

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

test('MODEL_ID pinned', () => {
  assert.equal(MODEL_ID, 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC');
  assert.equal(GEN.temperature, 0.2);
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

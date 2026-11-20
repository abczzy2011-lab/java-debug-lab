// src/assistant.js — WebLLM wrapper: pinned model, explicit install, load/stream/stop/unload.
// No model bytes fetched at import; dynamic import only in load(). No main HTML edits.

export const MODEL_ID = 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC';
export const WEBLLM_VERSION = '0.2.79'; // pinned; verify against registry at ship time
export const GEN = { temperature: 0.2, top_p: 0.9, max_tokens: 256, repetition_penalty: 1.05 };
export const LOAD_TIMEOUT_MS = 15 * 60 * 1000; // 280MB 模型在慢网/国内网络下需要更长的下载窗口
export const WARMUP_TIMEOUT_MS = 30000;
export const FIRST_TOKEN_TIMEOUT_MS = 30000;

export function createAssistant({ engineFactory = null, now = Date.now } = {}) {
  let engine = null, loading = false, broken = false, currentAbort = null, deviceLost = false;

  async function load(onProgress = () => {}) {
    if (engine) return engine;
    if (broken) throw new Error('LOCAL_BROKEN');
    loading = true;
    try {
      // Dynamic import: never on page boot
      const webllm = engineFactory ? { CreateMLCEngine: engineFactory }
        : await import('https://esm.run/@mlc-ai/web-llm@' + WEBLLM_VERSION);
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(new Error('LOAD_TIMEOUT')), LOAD_TIMEOUT_MS);
      try {
        engine = await webllm.CreateMLCEngine(MODEL_ID, {
          initProgressCallback: p => onProgress(p),
          signal: ctl.signal,
        });
      } finally { clearTimeout(timer); }

      // Stage E warmup (6.5)
      const wt = setTimeout(() => { currentAbort?.abort(new Error('WARMUP_TIMEOUT')); }, WARMUP_TIMEOUT_MS);
      currentAbort = new AbortController();
      try {
        await engine.chat.completions.create({
          messages: [{ role: 'user', content: '回复 OK' }],
          max_tokens: 8, stream: false,
        });
      } finally { clearTimeout(wt); currentAbort = null; }
      return engine;
    } catch (e) {
      broken = true; engine = null;
      const msg = String(e?.message || e);
      throw new Error(/abort|timeout/i.test(msg) ? 'MODEL_TIMEOUT' : (/memory|oom/i.test(msg) ? 'OOM' : 'MODEL_LOAD'));
    } finally { loading = false; }
  }

  /** Stream tokens; onToken(text); returns full answer. Abort via stop(). */
  async function ask(messages, { onToken = () => {}, timeout = FIRST_TOKEN_TIMEOUT_MS } = {}) {
    if (!engine) throw new Error('MODEL_NOT_LOADED');
    if (deviceLost) throw new Error('DEVICE_LOST');
    const ctl = new AbortController();
    currentAbort = ctl;
    let first = true;
    const ft = setTimeout(() => { if (first) ctl.abort(new Error('FIRST_TOKEN_TIMEOUT')); }, timeout);
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
      const msg = String(e?.message || e);
      if (/device.*lost/i.test(msg)) deviceLost = true;
      throw new Error(/abort/i.test(msg) ? 'ABORTED' : (/first_token/i.test(msg) ? 'FIRST_TOKEN_TIMEOUT' : 'GENERATION'));
    } finally { clearTimeout(ft); currentAbort = null; }
  }

  function stop() { try { currentAbort?.abort(new Error('ABORTED')); } catch {} }
  async function unload() {
    stop();
    try { await engine?.unload?.(); } catch {}
    engine = null; loading = false;
  }
  function markDeviceLost() { deviceLost = true; engine = null; broken = true; }

  return {
    load, ask, stop, unload, markDeviceLost,
    get state() {
      return { loaded: !!engine, loading, broken, deviceLost };
    },
    modelId: MODEL_ID,
  };
}

// src/assistant.js — WebLLM wrapper: pinned model, explicit install, load/stream/stop/unload.
// No model bytes fetched at import; dynamic import only in load(). No main HTML edits.

// Two local sizes are exposed. 1.5B is the default for an 8GB M3 Air:
// WebLLM reports ~1.63GB VRAM, while 3B needs ~2.5GB and can spill on 8GB.
export const MODELS = {
  '1.5b': {
    key: '1.5b',
    id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
    label: '1.5B',
    size: '约 1.1GB',
    vram: '约 1.6GB',
    recommended: true,
    note: '8GB MacBook Air 推荐：速度、内存和回答质量最平衡',
  },
  '3b': {
    key: '3b',
    id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
    label: '3B',
    size: '约 2.0GB',
    vram: '约 2.5GB',
    recommended: false,
    note: '回答更强，但 8GB 机器更容易卡顿或挤内存',
  },
};
export const DEFAULT_MODEL_KEY = '1.5b';
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
  model_list: [
    {
      model: `${MODEL_PROXY_BASE}/qwen15`,
      model_id: 'Qwen2.5-1.5B-Instruct-q4f16_1-MLC',
      model_lib: 'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_48/Qwen2-1.5B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm',
      low_resource_required: true,
      vram_required_MB: 1629.75,
      overrides: { context_window_size: 4096 },
    },
    {
      model: `${MODEL_PROXY_BASE}/qwen3`,
      model_id: 'Qwen2.5-3B-Instruct-q4f16_1-MLC',
      model_lib: 'https://raw.githubusercontent.com/mlc-ai/binary-mlc-llm-libs/main/web-llm-models/v0_2_48/Qwen2.5-3B-Instruct-q4f16_1-ctx4k_cs1k-webgpu.wasm',
      low_resource_required: true,
      vram_required_MB: 2504.76,
      overrides: { context_window_size: 4096 },
    },
  ],
};

export function createAssistant({ engineFactory = null, now = Date.now, modelId = MODEL_ID } = {}) {
  let engine = null, loading = false, broken = false, currentAbort = null, deviceLost = false;
  const resolvedId = modelId || MODEL_ID;

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
        engine = await webllm.CreateMLCEngine(resolvedId, {
          initProgressCallback: p => onProgress(p),
          signal: ctl.signal,
          appConfig: WEBLLM_APP_CONFIG,
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
    modelId: resolvedId,
  };
}

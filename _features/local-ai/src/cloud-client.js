// src/cloud-client.js — browser client for our Worker (/api/health, /api/chat).
// Pure enough to test with injected fetch; no provider URL/key in this module.

export const CLOUD_ENDPOINT = '/api/chat';
export const HEALTH_ENDPOINT = '/api/health';

export async function checkHealth({ fetchImpl = fetch, timeout = 2500, base = '' } = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetchImpl(base + HEALTH_ENDPOINT, { signal: ctl.signal, cache: 'no-store' });
    if (!res.ok) return { ok: false, status: res.status };
    const d = await res.json();
    return { ok: d.ok === true && d.model === 'hybrid', data: d };
  } catch (e) {
    return { ok: false, reason: String(e?.message || e) };
  } finally { clearTimeout(timer); }
}

/**
 * Ask the hybrid cloud. Returns {ok, answer, citations, fromCache, degraded, error}.
 * Never exposes provider names/errors to caller; HYBRID_BUSY maps to degraded:true.
 */
export async function askCloud({ question, siteCard, courseCard = '', passages = [],
  fetchImpl = fetch, timeout = 15000, base = '' } = {}) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetchImpl(base + CLOUD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctl.signal,
      body: JSON.stringify({ question, siteCard, courseCard, passages }),
    });
    if (res.status === 429 || res.status === 503) {
      return { ok: false, degraded: true, error: 'HYBRID_BUSY' };
    }
    if (!res.ok) return { ok: false, degraded: true, error: 'CLOUD_UNAVAILABLE' };
    const d = await res.json();
    if (d.error === 'HYBRID_BUSY') return { ok: false, degraded: true, error: 'HYBRID_BUSY' };
    if (typeof d.answer !== 'string') return { ok: false, degraded: true, error: 'BAD_RESPONSE' };
    return {
      ok: true, model: 'hybrid', answer: d.answer,
      fromCache: !!d.fromCache,
      fallback_from: undefined, // never shown in UI
    };
  } catch (e) {
    const msg = String(e?.message || e);
    return { ok: false, degraded: true, error: /abort/i.test(msg) ? 'TIMEOUT' : 'NETWORK' };
  } finally { clearTimeout(timer); }
}

// UI label contract: exactly `混合模型`; never provider/quota text.
export const UI_MODEL_LABEL = '混合模型';

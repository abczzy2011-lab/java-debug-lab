// src/gatekeeper.js — Admission rule (user directive 2026-11-20):
//   gate PASS  -> must download the local model before AI can be used; no AI until downloaded.
//   gate FAIL  -> search-only. No AI, no download entry, no cloud fallback.
// Pure logic for tests; no DOM, no model fetch at import.

export const DECI = {
  DOWNLOAD_REQUIRED: 'DOWNLOAD_REQUIRED', // gate passed, model missing -> force download first
  READY: 'READY',                          // gate passed, model present -> AI usable (local)
  DOWNLOADING: 'DOWNLOADING',              // download in progress, AI locked
  DOWNLOAD_FAILED: 'DOWNLOAD_FAILED',      // retry offered, AI locked
  SEARCH_ONLY: 'SEARCH_ONLY',              // gate failed -> search only, no install UI
  NOT_CHECKED: 'NOT_CHECKED',              // gate not run yet
};

/**
 * Decide admission and UI capabilities.
 * state: { gateResult: {ok}|null, modelDownloaded: bool, downloading: bool,
 *          downloadError: string|null, aiRequested: bool }
 */
export function admission(state = {}) {
  const gate = state.gateResult;
  const downloaded = !!state.modelDownloaded;
  const downloading = !!state.downloading;
  const err = state.downloadError || null;

  // gate not run -> nothing but a check action
  if (!gate) {
    return {
      decision: DECI.NOT_CHECKED,
      aiAllowed: false,
      canDownload: false,       // cannot download before gate passes
      showDownload: false,
      showCheck: true,
      mode: 'search',
      label: '检索结果',
      reason: '尚未检测本机性能',
    };
  }

  // gate failed -> permanent search-only for this session, no download entry
  if (!gate.ok) {
    return {
      decision: DECI.SEARCH_ONLY,
      aiAllowed: false,
      canDownload: false,
      showDownload: false,
      showCheck: true,          // allow re-check only
      mode: 'search',
      label: '检索结果',
      reason: gate.code ? `本机不达标（${gate.code}），只能检索` : '本机不达标，只能检索',
    };
  }

  // gate passed: local model is mandatory
  if (downloading) {
    return {
      decision: DECI.DOWNLOADING,
      aiAllowed: false,
      canDownload: false,
      showDownload: true,
      showCheck: false,
      mode: 'search',
      label: '检索结果',
      reason: '正在下载本地模型，下载完成前只能检索',
      progress: state.downloadProgress || 0,
    };
  }
  if (err) {
    return {
      decision: DECI.DOWNLOAD_FAILED,
      aiAllowed: false,
      canDownload: true,        // retry
      showDownload: true,
      showCheck: false,
      mode: 'search',
      label: '检索结果',
      reason: '本地模型下载失败，可重试；完成前只能检索',
      error: err,
    };
  }
  if (!downloaded) {
    return {
      decision: DECI.DOWNLOAD_REQUIRED,
      aiAllowed: false,
      canDownload: true,
      showDownload: true,
      showCheck: false,
      mode: 'search',
      label: '检索结果',
      reason: '本机性能达标，但需先下载本地模型（1.5B 约 1.1GB / 3B 约 2.0GB）才能使用 AI',
    };
  }
  return {
    decision: DECI.READY,
    aiAllowed: true,
    canDownload: false,
    showDownload: false,
    showCheck: false,
    mode: 'local',
    label: '本地',
    reason: '本地模型已就绪',
  };
}

/** What happens when the user clicks "ask" in each state. */
export function onAsk(state = {}) {
  const a = admission(state);
  if (a.aiAllowed) return { action: 'ANSWER_LOCAL', ...a };
  if (a.decision === DECI.DOWNLOAD_REQUIRED) return { action: 'PROMPT_DOWNLOAD', ...a };
  if (a.decision === DECI.DOWNLOAD_FAILED) return { action: 'PROMPT_RETRY', ...a };
  if (a.decision === DECI.DOWNLOADING) return { action: 'SHOW_PROGRESS', ...a };
  if (a.decision === DECI.SEARCH_ONLY) return { action: 'SEARCH_ONLY_ANSWER', ...a };
  return { action: 'RUN_GATE_FIRST', ...a };
}

/** Success/failure from the mandatory download updates admission state. */
export function downloadDone(state = {}, ok = true, error = null) {
  return {
    ...state,
    downloading: false,
    modelDownloaded: ok ? true : !!state.modelDownloaded,
    downloadError: ok ? null : (error || 'DOWNLOAD_ERROR'),
  };
}

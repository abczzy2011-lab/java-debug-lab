// src/mode-controller.js — P2C hybrid state machine (14.1/14.2).
// Pure logic: events in, {mode, reason} out. No direct DOM/fetch/model dependencies.

export const MODES = { CLOUD: 'cloud', LOCAL: 'local', SEARCH: 'search' };

/**
 * State: { cloudReady, localReady, localLoaded, online, streaming }
 * Returns new state + mode + reason. Switch only between requests (streaming keeps current mode).
 */
export function decide(state = {}, event = 'init', payload = {}) {
  const s = {
    online: state.online !== false,
    cloudReady: !!state.cloudReady,
    localReady: !!state.localReady,
    localLoaded: !!state.localLoaded,
    streaming: !!state.streaming,
    mode: state.mode || MODES.SEARCH,
    reason: state.reason || 'init',
  };

  // A streaming answer is never switched mid-flight.
  if (s.streaming && event !== 'stream-end') {
    return {
      state: s, switch: false, mode: s.mode, reason: s.reason,
      uiLabel: s.mode === MODES.CLOUD ? '混合模型' : (s.mode === MODES.LOCAL ? '本地' : '检索结果'),
    };
  }

  let next = s.mode, reason = s.reason, sw = false;
  const set = (m, r) => {
    if (m !== s.mode) { next = m; reason = r; sw = true; }
    else { reason = r; }
  };

  switch (event) {
    case 'boot':
      set(s.cloudReady && s.online ? MODES.CLOUD : (s.localReady ? MODES.LOCAL : MODES.SEARCH),
        s.cloudReady ? '联网正常' : (s.localReady ? '本地就绪' : '检索兜底'));
      break;
    case 'online':
      s.online = true;
      if (payload.healthOk) set(MODES.CLOUD, '云端已恢复');
      else set(s.localReady ? MODES.LOCAL : MODES.SEARCH, s.localReady ? '本地继续' : '云端不可用');
      break;
    case 'offline':
      s.online = false; s.cloudReady = false;
      set(s.localReady ? MODES.LOCAL : MODES.SEARCH,
        s.localReady ? '网络断开·本地' : '断网且本地未安装');
      break;
    case 'cloud-429':
    case 'cloud-quota':
    case 'cloud-5xx':
    case 'cloud-timeout':
      s.cloudReady = false;
      set(s.localReady ? MODES.LOCAL : MODES.SEARCH,
        s.localReady ? '云端不可用·本地' : '云端不可用·检索');
      break;
    case 'health-ok':
      s.cloudReady = true;
      if (s.online) set(MODES.CLOUD, '联网正常');
      break;
    case 'health-fail':
      s.cloudReady = false;
      set(s.localReady ? MODES.LOCAL : MODES.SEARCH, '云端不可用');
      break;
    case 'local-ready':
      s.localReady = true;
      if (!s.cloudReady && !s.online) set(MODES.LOCAL, '本地就绪');
      break;
    case 'local-fail':
    case 'local-oob':
    case 'device-lost':
      s.localReady = false; s.localLoaded = false;
      set(s.online && s.cloudReady ? MODES.CLOUD : MODES.SEARCH,
        s.online && s.cloudReady ? '本地不可用·云端' : '本地不可用·检索');
      break;
    case 'stream-start':
      s.streaming = true; break;
    case 'stream-end':
      s.streaming = false; break;
    case 'install-consent':
      // never auto-install; consent only enables the download action
      break;
    default: break;
  }

  return {
    state: { ...s, mode: next, reason },
    mode: next,
    reason,
    switch: sw,
    uiLabel: next === MODES.CLOUD ? '混合模型' : (next === MODES.LOCAL ? '本地' : '检索结果'),
  };
}

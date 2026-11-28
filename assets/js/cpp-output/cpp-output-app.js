(() => {
  'use strict';

  const BANK = window.CPP_OUTPUT_BANK;
  const TASKS = BANK && Array.isArray(BANK.tasks) ? BANK.tasks : [];
  const LEVELS = BANK && Array.isArray(BANK.levels) ? BANK.levels : [];
  const RULES = (BANK && BANK.rules) || { correctness: 85, speed: 15 };
  const STORE_KEY = 'cpp-output-lab:v1';
  const app = document.getElementById('app');
  const toastEl = document.getElementById('toast');
  const engineBadge = document.getElementById('engineBadge');
  const engineText = document.getElementById('engineText');
  const topProgress = document.getElementById('topProgress');

  const state = {
    taskId: null,
    busy: false,
    workToken: 0,
    abort: null,
    probePromise: null,
    judge: { endpoint: null, label: '未连接判题后端', detail: '', status: 'bad' },
    store: loadStore()
  };

  function loadStore() {
    const base = { best: {}, bestMs: {}, code: {}, filter: 'all', status: 'all', query: '' };
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      const out = { ...base, filter: raw.filter || 'all', status: raw.status || 'all', query: '' };
      for (const bag of ['best', 'bestMs', 'code']) {
        const src = raw[bag];
        if (!src || typeof src !== 'object') continue;
        for (const [id, value] of Object.entries(src)) {
          if (bag === 'code' && typeof value === 'string') out[bag][id] = value;
          if (bag !== 'code' && Number.isFinite(Number(value)) && Number(value) >= 0) out[bag][id] = Number(value);
        }
      }
      if (!LEVELS.some(l => l.id === out.filter)) out.filter = 'all';
      if (!['all', 'todo', 'done'].includes(out.status)) out.status = 'all';
      return out;
    } catch (_) {
      return base;
    }
  }

  function persistStore() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state.store));
    } catch (_) {
      /* 隐私模式或存储已满时，功能仍可继续，只是不保留成绩。 */
    }
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function taskById(id) {
    return TASKS.find(t => t.id === id) || null;
  }

  function currentTask() {
    return taskById(state.taskId);
  }

  function levelById(id) {
    return LEVELS.find(l => l.id === id) || { name: id, kicker: '' };
  }

  function levelName(id) {
    return levelById(id).name;
  }

  function round1(n) {
    return Math.round((Number(n) || 0) * 10) / 10;
  }

  function formatScore(n) {
    const v = round1(n);
    return Number.isInteger(v) ? String(v) : v.toFixed(1);
  }

  function formatMs(n) {
    const v = Number(n);
    return Number.isFinite(v) && v >= 0 ? String(Math.round(v)) : '—';
  }

  function taskNumber(task) {
    return String(task.no).padStart(2, '0');
  }

  function isDone(task) {
    return Number(state.store.best[task.id] || 0) >= Number(RULES.correctness);
  }

  function doneCount() {
    return TASKS.filter(isDone).length;
  }

  function matchQuery(task, query) {
    const q = String(query || '').trim().toLowerCase();
    if (!q) return true;
    return [task.id, task.no, task.title, task.subtitle, task.brief, task.goal, (task.concepts || []).join(' '), levelName(task.level)]
      .join(' ').toLowerCase().includes(q);
  }

  function visibleTasks() {
    return TASKS.filter(task => {
      if (state.store.filter !== 'all' && task.level !== state.store.filter) return false;
      if (state.store.status === 'todo' && isDone(task)) return false;
      if (state.store.status === 'done' && !isDone(task)) return false;
      return matchQuery(task, state.store.query);
    });
  }

  function updateProgress() {
    if (topProgress) topProgress.textContent = `${doneCount()} / ${TASKS.length}`;
  }

  function progressPct() {
    return TASKS.length ? Math.round(doneCount() / TASKS.length * 100) : 0;
  }

  function emptyResultHtml() {
    return `<div class="result-empty">
      <div class="term-icon" aria-hidden="true">&gt;_</div>
      <div>
        <h2>运行结果会显示在这里</h2>
        <p>先运行公开样例检查空格和换行，再提交全部 3 组测试。</p>
        <div class="result-tip">真实 GCC 14.1 编译 · C++20 · 输出逐行比对 · 运行毫秒</div>
      </div>
    </div>`;
  }

  function normalizeOutput(value) {
    return String(value == null ? '' : value)
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .split('\n')
      .map(line => line.replace(/[ \t]+$/g, ''))
      .join('\n')
      .replace(/\n+$/g, '');
  }

  function compareOutput(actual, expected) {
    return normalizeOutput(actual) === normalizeOutput(expected);
  }

  function firstDiffLine(actual, expected) {
    const a = normalizeOutput(actual).split('\n');
    const b = normalizeOutput(expected).split('\n');
    const total = Math.max(a.length, b.length);
    for (let i = 0; i < total; i++) {
      if ((a[i] == null ? '' : a[i]) !== (b[i] == null ? '' : b[i])) return i + 1;
    }
    return 0;
  }

  function calculateScore(passed, total, avgMs, fastMs) {
    const correctnessMax = Number(RULES.correctness) || 85;
    const speedMax = Number(RULES.speed) || 15;
    const count = Math.max(0, Number(total) || 0);
    const pass = Math.min(count, Math.max(0, Number(passed) || 0));
    const correctness = count > 0 ? (pass / count) * correctnessMax : 0;
    let speed = 0;
    if (count > 0 && pass === count) {
      const f = Math.max(1, Number(fastMs) || 150);
      const avg = Math.max(0, Number(avgMs) || 0);
      speed = speedMax * Math.min(1, Math.max(0, (3 * f - avg) / (2 * f)));
    }
    const totalScore = correctness + speed;
    return {
      correctness: round1(correctness),
      speed: round1(speed),
      total: round1(totalScore),
      passed: pass,
      count
    };
  }

  function encodeBase64(text) {
    const bytes = new TextEncoder().encode(String(text == null ? '' : text));
    let binary = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }

  function decodeBase64(value) {
    if (!value) return '';
    try {
      const binary = atob(String(value));
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    } catch (_) {
      return String(value);
    }
  }

  class LabError extends Error {
    constructor(code, message, detail) {
      super(message || code);
      this.name = 'LabError';
      this.code = code;
      this.detail = detail || '';
    }
  }

  function timeoutFetch(url, options, ms) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    return fetch(url, { ...options, signal: controller.signal })
      .finally(() => clearTimeout(timer));
  }

  function setEngineBadge(status, text, detail) {
    state.judge.status = status;
    state.judge.detail = detail || state.judge.detail || '';
    if (engineBadge) {
      engineBadge.classList.remove('probing', 'ok', 'warn', 'bad');
      engineBadge.classList.add(status);
    }
    if (engineText) engineText.textContent = text;
    if (!detail && engineBadge) engineBadge.title = text;
  }

  async function probeJudge() {
    const params = new URLSearchParams(window.location.search);
    const override = (params.get('judge') || '').trim();
    const endpoint = (/^https?:\/\//i.test(override) ? override : 'https://ce.judge0.com').replace(/\/+$/, '');
    state.judge = {
      endpoint,
      label: 'Judge0 · GCC 14.1',
      detail: 'C++20 · -std=c++20 -O2 · 公共判题节点',
      status: 'ok'
    };
    setEngineBadge('ok', 'GCC 14.1 · C++20', state.judge.detail);
  }

  async function ensureJudge() {
    if (state.probePromise) await state.probePromise;
    if (!state.judge.endpoint) {
      throw new LabError('NO_JUDGE', '没有可用的判题节点。');
    }
    return state.judge;
  }

  async function executeCase(code, stdin, expected, workToken) {
    const judge = await ensureJudge();
    if (workToken != null && workToken !== state.workToken) {
      throw new LabError('ABORTED', '判题请求已取消。');
    }
    const endpoint = judge.endpoint.replace(/\/+$/, '');
    const controller = new AbortController();
    state.abort = controller;
    let timer = null;
    let timedOut = false;
    try {
      timer = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, 26000);
      const response = await fetch(
        `${endpoint}/submissions?base64_encoded=true&wait=true`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            source_code: encodeBase64(code),
            stdin: encodeBase64(stdin),
            language_id: 105,
            compiler_options: '-std=c++20 -O2',
            cpu_time_limit: 4,
            wall_time_limit: 8
          }),
          signal: controller.signal
        }
      );
      if (!response.ok) {
        throw new LabError('HTTP_' + response.status, `判题服务返回 HTTP ${response.status}。`);
      }
      const data = await response.json();
      const status = (data.status && data.status.description) || 'Unknown';
      const stdout = decodeBase64(data.stdout);
      const stderr = decodeBase64(data.stderr);
      const compileOutput = decodeBase64(data.compile_output);
      const timeMs = Number.isFinite(Number(data.time_ms))
        ? Math.max(0, Number(data.time_ms))
        : Math.max(0, Math.round((parseFloat(data.time) || 0) * 1000));
      return {
        status,
        stdout,
        stderr,
        compileOutput,
        timeMs,
        exitCode: data.exit_code,
        passed: status === 'Accepted' && compareOutput(stdout, expected),
        expected
      };
    } catch (error) {
      if (error instanceof LabError) throw error;
      if (timedOut) throw new LabError('TIMEOUT', '判题请求超过 26 秒仍未返回。');
      if (error && (error.name === 'AbortError' || error.code === 20)) {
        throw new LabError('ABORTED', '判题请求已取消。');
      }
      throw new LabError('NETWORK', '无法连接 Judge0 判题节点，请检查网络或稍后重试。', endpoint);
    } finally {
      clearTimeout(timer);
      if (state.abort === controller) state.abort = null;
    }
  }

  function cancelWork() {
    state.workToken++;
    if (state.abort) {
      try { state.abort.abort(); } catch (_) {}
      state.abort = null;
    }
    state.busy = false;
  }

  function setBusy(busy, hint) {
    state.busy = busy;
    const run = document.querySelector('[data-action="run"]');
    const submit = document.querySelector('[data-action="submit"]');
    const code = document.getElementById('lineInput');
    if (run) run.disabled = busy;
    if (submit) submit.disabled = busy;
    if (code) code.readOnly = busy;
    const hintEl = document.getElementById('actionHint');
    if (hintEl) {
      hintEl.innerHTML = busy
        ? (hint || '正在判题…')
        : '运行样例只跑公开用例，不计成绩；提交会跑 <b>3</b> 组测试。';
    }
  }

  function toast(message, tone) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.remove('err', 'ok');
    if (tone) toastEl.classList.add(tone);
    toastEl.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toastEl.classList.remove('show'), 3000);
  }

  function updateEngineBadgeFromError(error) {
    if (!error) return;
    if (state.judge.status === 'ok' || state.judge.status === 'warn') {
      setEngineBadge('bad', '判题后端无响应', state.judge.endpoint || '');
    }
  }

  function showServiceError(error) {
    const panel = document.querySelector('.result-panel');
    if (!panel) return;
    const message = esc(error && error.message ? error.message : '判题服务暂时不可用。');
    const endpoint = esc((state.judge && state.judge.endpoint) || 'https://ce.judge0.com');
    panel.innerHTML = `<div class="result-head"><div class="result-head-left"><span class="result-kicker">JUDGE SERVICE</span><span class="status-badge bad">未连接</span></div></div>
      <div class="judge-error">
        <h2>没有拿到判题结果</h2>
        <p>${message}</p>
        <p>当前判题节点：<code>${endpoint}</code></p>
        <p>这个页面使用公共 Judge0 的 GCC 14.1 执行 C++20 代码；需要正常网络连接。若浏览器拦截了跨域请求，请刷新后重试，或在支持 CORS 的网络环境下访问。</p>
        <p>代码不会上传到本项目的服务器：提交时只发送到 Judge0，用于编译和运行。</p>
      </div>`;
    panel.dataset.hasResult = '1';
    updateEngineBadgeFromError(error);
    toast('判题节点没有响应', 'err');
  }

  function renderLoading(title, detail, pct) {
    const panel = document.querySelector('.result-panel');
    if (!panel) return;
    panel.dataset.hasResult = '1';
    panel.innerHTML = `<div class="result-head"><div class="result-head-left"><span class="result-kicker">RUNNING</span><span class="status-badge warn">运行中</span></div></div>
      <div class="judge-progress">
        <div class="spinner" aria-hidden="true"></div>
        <div style="min-width:0;flex:1">
          <h2>${esc(title)}</h2>
          <p>${esc(detail)}</p>
          <div class="progress-line"><i style="width:${Math.max(2, Math.min(100, Number(pct) || 2))}%"></i></div>
        </div>
      </div>`;
  }

  function renderDiff(actual, expected, passed) {
    return `<div class="diff-shell">
      <div class="diff-col expected"><div class="diff-col-head"><span>目标输出</span><span>EXPECTED</span></div><pre>${esc(expected || '（空）')}</pre></div>
      <div class="diff-col actual ${passed ? 'pass' : 'fail'}"><div class="diff-col-head"><span>实际输出</span><span>${passed ? 'MATCH' : 'ACTUAL'}</span></div><pre>${esc(actual || '（无输出）')}</pre></div>
    </div>`;
  }

  function renderDiagnostics(result) {
    let out = '';
    if (result.compileOutput) {
      out += `<div class="stderr-box"><h4>COMPILER OUTPUT</h4><pre>${esc(result.compileOutput)}</pre></div>`;
    }
    if (result.stderr) {
      out += `<div class="stderr-box"><h4>STDERR</h4><pre>${esc(result.stderr)}</pre></div>`;
    }
    return out;
  }

  function mismatchText(result) {
    if (result.status !== 'Accepted' && result.status !== 'Wrong Answer') return '';
    if (result.passed) return '';
    const n = firstDiffLine(result.stdout, result.expected);
    if (!result.stdout) return '<div class="mismatch-note"><b>实际输出为空</b>；确认程序是否真的写到了标准输出。</div>';
    return `<div class="mismatch-note">第 <b>${n || 1}</b> 行开始不一致；行首空格、空行位置和大小写都会参与比较。</div>`;
  }

  function renderRunResult(result, task) {
    const panel = document.querySelector('.result-panel');
    if (!panel) return;
    const badgeClass = result.passed ? 'pass' : (result.status === 'Compilation Error' ? 'bad' : 'fail');
    const badge = result.passed ? '通过' : (result.status === 'Accepted' ? '输出不一致' : (result.status === 'Compilation Error' ? '编译失败' : result.status));
    panel.dataset.hasResult = '1';
    panel.innerHTML = `<div class="result-head">
        <div class="result-head-left"><span class="result-kicker">公开样例</span><span class="status-badge ${badgeClass}">${esc(badge)}</span></div>
        <div class="run-time"><b>${formatMs(result.timeMs)}</b> ms</div>
      </div>
      <div class="result-body">
        ${(result.compileOutput || result.stderr) ? renderDiagnostics(result) : renderDiff(result.stdout, result.expected, result.passed)}
        ${mismatchText(result)}
        <div class="case-note">这次只运行了公开样例，不计成绩。提交后会继续跑 <b>${task.testCases.length - 1}</b> 组隐藏参数。</div>
      </div>
      <div class="result-actions">
        <div class="left"><button class="lab-btn small" type="button" data-action="run">再跑一次</button></div>
        <div class="right"><button class="lab-btn small primary" type="button" data-action="submit">提交全部 ${task.testCases.length} 组</button></div>
      </div>`;
    syncActionsForBusy();
  }

  function statusLabel(result) {
    if (result.passed) return '通过';
    if (result.status === 'Accepted') return '输出不一致';
    if (result.status === 'Compilation Error') return '编译失败';
    if (result.status === 'Runtime Error (NZEC)') return '运行异常';
    if (result.status === 'Time Limit Exceeded') return '超时';
    if (result.status === 'Internal Error') return '后端错误';
    return result.status || '未通过';
  }

  function statusClass(result) {
    if (result.passed) return 'pass';
    if (result.status === 'Compilation Error' || result.status === 'Runtime Error (NZEC)' || result.status === 'Time Limit Exceeded') return 'bad';
    return 'fail';
  }

  function caseRow(result, index, task) {
    const tc = result.testCase || task.testCases[index] || { label: `用例 ${index + 1}`, stdin: '', expected: '' };
    const badge = statusLabel(result);
    let body = '';
    if (result.compileFailure) {
      body = `<div class="stderr-box"><h4>COMPILER OUTPUT</h4><pre>${esc(result.compileOutput || result.stderr || '编译器没有返回诊断信息。')}</pre></div>`;
    } else if (result.passed) {
      body = `<div class="case-pass-copy">输出与目标一致 · 实际 ${normalizeOutput(result.stdout) ? normalizeOutput(result.stdout).split('\n').length : 0} 行输出</div>`;
    } else {
      body = `<div class="case-diagnostics">${renderDiff(result.stdout, result.expected || tc.expected, false)}${mismatchText(result)}${renderDiagnostics(result)}</div>`;
    }
    return `<div class="case-row ${result.passed ? 'pass' : 'fail'}">
      <div class="case-row-head">
        <span class="case-name">${esc(tc.label)}</span>
        <span class="case-input" title="${esc(tc.stdin)}">输入：${esc(String(tc.stdin).replace(/\n/g, ' ↵ '))}</span>
        <span class="status-badge ${statusClass(result)}">${esc(badge)}</span>
        <span class="run-time"><b>${formatMs(result.timeMs)}</b> ms</span>
      </div>
      <div class="case-body">${body}</div>
    </div>`;
  }

  function renderSubmitResult(task, results, breakdown, avgMs, compileFailure) {
    const panel = document.querySelector('.result-panel');
    if (!panel) return;
    const score = breakdown.total;
    const ringClass = score >= RULES.correctness ? '' : (score >= 50 ? 'mid' : 'low');
    const caseRows = compileFailure
      ? `<div class="case-row fail"><div class="case-row-head"><span class="case-name">编译阶段</span><span class="status-badge bad">编译失败</span><span class="run-time"><b>—</b> ms</span></div><div class="case-body"><div class="stderr-box"><h4>COMPILER OUTPUT</h4><pre>${esc(results[0].compileOutput || results[0].stderr || '编译器没有返回诊断信息。')}</pre></div></div></div>`
      : results.map((r, i) => caseRow(r, i, task)).join('');
    const allPass = breakdown.passed === breakdown.count;
    panel.dataset.hasResult = '1';
    const headBadge = compileFailure ? '编译失败' : (allPass ? '全部通过' : `${breakdown.passed} / ${breakdown.count} 通过`);
    const headClass = compileFailure ? 'bad' : (allPass ? 'pass' : 'fail');
    panel.innerHTML = `<div class="result-head">
        <div class="result-head-left"><span class="result-kicker">提交结果 · ${esc(task.title)}</span><span class="status-badge ${headClass}">${headBadge}</span></div>
        <div class="run-time"><b>${formatMs(avgMs)}</b> ms 平均</div>
      </div>
      <div class="score-summary">
        <div class="score-ring ${ringClass}" style="--pct:${Math.max(0, Math.min(100, score))}%"><div><b>${formatScore(score)}</b><span>/ 100</span></div></div>
        <div class="score-copy">
          <h2>${compileFailure ? '先把编译错误清掉' : (allPass ? '三组测试全部通过' : `还有 ${breakdown.count - breakdown.passed} 组没对上`)}</h2>
          <p>${compileFailure ? '编译阶段失败，本次不计正确性分数。下方是 GCC 的原始诊断。' : `正确性 <b>${formatScore(breakdown.correctness)}</b> / ${RULES.correctness} · 速度 <b>${formatScore(breakdown.speed)}</b> / ${RULES.speed}。`}</p>
          <p>${allPass ? '最佳成绩已保存到本机。' : '输出正确率决定主要得分；三组全过之后才计入速度分。'}</p>
        </div>
        <div class="score-time"><b>${formatMs(avgMs)}</b><span>AVG RUN MS</span></div>
      </div>
      <div class="score-breakdown">
        <div class="break-item"><div class="break-label"><span>输出正确性</span><b>${formatScore(breakdown.correctness)} / ${RULES.correctness}</b></div><div class="break-bar"><i style="width:${Math.round(breakdown.correctness / RULES.correctness * 100)}%"></i></div></div>
        <div class="break-item"><div class="break-label"><span>运行速度</span><b>${formatScore(breakdown.speed)} / ${RULES.speed}</b></div><div class="break-bar gold"><i style="width:${Math.round(breakdown.speed / RULES.speed * 100)}%"></i></div></div>
      </div>
      <div class="score-note">速度基准 ${task.fastMs} ms；平均达到 3 倍基准值时速度分为 0。运行时间由后端进程计时，不含编译与网络。</div>
      <div class="case-list">${caseRows}</div>
      <div class="result-actions">
        <div class="left"><button class="lab-btn small" type="button" data-action="run">只跑样例</button><button class="lab-btn small" type="button" data-action="reset">重置代码</button></div>
        <div class="right"><button class="lab-btn small primary" type="button" data-action="submit">再提交一次</button>${nextButton(task)}</div>
      </div>`;
    syncActionsForBusy();
  }

  function nextButton(task) {
    const index = TASKS.findIndex(t => t.id === task.id);
    if (index < 0 || TASKS.length < 2) return '';
    const next = TASKS[(index + 1) % TASKS.length];
    return `<button class="lab-btn small" type="button" data-action="open-task" data-task="${esc(next.id)}">下一题 · ${esc(next.title)}</button>`;
  }

  function syncActionsForBusy() {
    const run = document.querySelector('[data-action="run"]');
    const submit = document.querySelector('[data-action="submit"]');
    const reset = document.querySelector('[data-action="reset"]');
    if (run) run.disabled = state.busy;
    if (submit) submit.disabled = state.busy;
    if (reset) reset.disabled = state.busy;
    const code = document.getElementById('lineInput');
    if (code) code.readOnly = state.busy;
  }

  function markStale() {
    const panel = document.querySelector('.result-panel');
    if (!panel || !panel.dataset.hasResult) return;
    if (panel.querySelector('.stale-bar')) return;
    panel.insertAdjacentHTML('afterbegin', '<div class="stale-bar">代码已修改，下面仍是上一版代码的运行结果。</div>');
  }

  function previewOutput(task) {
    const lines = normalizeOutput(task.sampleStdout).split('\n');
    const head = lines.slice(0, 4).join('\n');
    return head + (lines.length > 4 ? '\n…' : '');
  }

  function taskCard(task) {
    const best = Number(state.store.best[task.id] || 0);
    const bestMs = Number(state.store.bestMs[task.id] || 0);
    const done = isDone(task);
    const stateText = best ? `最佳 ${formatScore(best)}${bestMs ? ` · ${formatMs(bestMs)}ms` : ''}` : '未开始';
    return `<button class="task-card ${done ? 'done' : ''}" type="button" data-action="open-task" data-task="${esc(task.id)}" aria-label="打开第 ${task.no} 题 ${esc(task.title)}">
      <div class="task-top"><span class="task-no">NO.${taskNumber(task)}</span><span class="task-state">${esc(stateText)}</span></div>
      <h3>${esc(task.title)}</h3>
      <p class="task-brief">${esc(task.brief)}</p>
      <div class="task-preview"><div class="task-preview-label"><span>目标输出</span><span>SAMPLE</span></div><pre>${esc(previewOutput(task))}</pre></div>
      <div class="task-card-foot"><span>${esc(levelName(task.level))} · <b>${esc((task.concepts || []).join(' / '))}</b></span><span class="arrow" aria-hidden="true">→</span></div>
    </button>`;
  }

  function statusCount(status) {
    if (status === 'todo') return TASKS.filter(t => !isDone(t)).length;
    if (status === 'done') return TASKS.filter(isDone).length;
    return TASKS.length;
  }

  function emptyBankHtml() {
    if (state.store.query.trim()) {
      return `<div class="bank-empty"><b>没有匹配的题目</b><p>换个关键词，或清空搜索回到全部 ${TASKS.length} 题。</p><button class="lab-btn small" type="button" data-action="clear-filters">清空筛选</button></div>`;
    }
    if (state.store.status === 'done') return '<div class="bank-empty"><b>这一档还没有通过的题</b><p>先运行公开样例，再提交三组测试。</p></div>';
    if (state.store.status === 'todo') return '<div class="bank-empty"><b>这一档已经全部通过</b><p>可以切到「已通过」回看，或挑战另一档难度。</p></div>';
    return '<div class="bank-empty">这个难度下暂时没有题目。</div>';
  }

  function renderBank(focusSearch) {
    const filter = state.store.filter || 'all';
    const visible = visibleTasks();
    const groups = LEVELS.map(level => {
      const tasks = visible.filter(t => t.level === level.id);
      if (!tasks.length) return '';
      return `<section class="level-section" aria-labelledby="level-${esc(level.id)}">
        <div class="level-head">
          <div><span class="level-kicker">${esc(level.kicker)}</span><h2 id="level-${esc(level.id)}">${esc(level.name)}</h2><p>${esc(level.desc)}</p></div>
          <span class="level-count">${tasks.length} 题 · 完成 ${tasks.filter(isDone).length}</span>
        </div>
        <div class="task-grid">${tasks.map(taskCard).join('')}</div>
      </section>`;
    }).join('');

    const firstUndone = visible.find(t => !isDone(t)) || visible[0] || TASKS.find(t => !isDone(t)) || TASKS[0];
    const done = doneCount();
    const pct = progressPct();
    app.innerHTML = `<section class="lab-hero">
      <span class="kicker">C++ · OUTPUT → CODE · ${TASKS.length} TASKS</span>
      <h1>给你输出，<span>从零写出完整程序</span></h1>
      <p class="sub">没有待改的错误代码，也没有可抄的答案。先看目标输出，再从 <b>main.cpp</b> 的空白程序开始写；提交后由真实 GCC 编译运行，按 <b>3 组用例</b>比对 stdout，并把 <b>运行毫秒</b>计入评分。</p>
      <div class="hero-progress" aria-label="题库完成进度">
        <div class="hero-progress-head"><span>整体进度</span><b>${done} / ${TASKS.length}</b></div>
        <div class="hero-progress-track"><i style="width:${pct}%"></i></div>
        <span class="hero-progress-note">三档各 ${TASKS.length / LEVELS.length} 题 · 已通过 ${pct}%</span>
      </div>
      <div class="hero-stats">
        <span><b>${LEVELS.length}</b> 档难度</span>
        <span><b>${TASKS.length}</b> 道题</span>
        <span><b>${TASKS.reduce((n, t) => n + t.testCases.length, 0)}</b> 组测试</span>
        <span class="hot">输出 85 分 + 速度 15 分</span>
        <span>C++20 · GCC 14</span>
      </div>
      <div class="hero-actions">
        <button class="lab-btn primary" type="button" data-action="start-first">${done < TASKS.length ? '继续未完成' : '从第一题开始'} <span aria-hidden="true">→</span></button>
        <button class="lab-btn" type="button" data-action="scroll-rules">评分规则</button>
      </div>
      <div class="hero-note">判题由公共 <b>Judge0</b> 的 GCC 14.1 执行，需要联网；代码在本机编辑，成绩和草稿只保存在这台设备。</div>
    </section>
    <div class="bank-toolbar">
      <div class="bank-search-row">
        <label class="search-box" for="taskSearch">
          <span class="search-icon" aria-hidden="true"></span>
          <input id="taskSearch" type="search" inputmode="search" autocomplete="off" spellcheck="false" placeholder="搜索题名、考点或题号，例如 vector、排序、b20" value="${esc(state.store.query)}" aria-label="搜索输出题">
          <kbd>/</kbd>
        </label>
        <div class="status-tabs" role="group" aria-label="按完成状态筛选">
          <button type="button" class="${state.store.status === 'all' ? 'active' : ''}" data-action="filter-status" data-status="all">全部 <b>${statusCount('all')}</b></button>
          <button type="button" class="${state.store.status === 'todo' ? 'active' : ''}" data-action="filter-status" data-status="todo">未完成 <b>${statusCount('todo')}</b></button>
          <button type="button" class="${state.store.status === 'done' ? 'active' : ''}" data-action="filter-status" data-status="done">已通过 <b>${statusCount('done')}</b></button>
        </div>
      </div>
      <div class="bank-filter-row">
        <div class="filter-tabs" role="group" aria-label="按难度筛选">
          <button type="button" class="${filter === 'all' ? 'active' : ''}" data-action="filter" data-filter="all">全部难度 <b>${TASKS.length}</b></button>
          ${LEVELS.map(l => `<button type="button" class="${filter === l.id ? 'active' : ''}" data-action="filter" data-filter="${esc(l.id)}">${esc(l.name)} <b>${TASKS.filter(t => t.level === l.id).length}</b></button>`).join('')}
        </div>
        <div class="bank-note">当前显示 <b>${visible.length}</b> 题 · 最佳成绩保存在本机${firstUndone ? ` · <button class="link-btn" type="button" data-action="open-task" data-task="${esc(firstUndone.id)}">继续 ${esc(firstUndone.title)} →</button>` : ''}</div>
      </div>
    </div>
    ${groups || emptyBankHtml()}
    <section class="bank-rules" id="judgingRules">
      <div class="rules-title"><span class="kicker">SCORING · 100</span><h2>分数只看两件可验证的事</h2></div>
      <div class="rules-grid">
        <div><b>85</b><span>输出正确性</span><p>3 组用例按通过比例计分。比较前只忽略每行行尾空格和文件末尾空行，行首空格、空行位置、大小写都保留。</p></div>
        <div><b>15</b><span>运行速度</span><p>三组全部通过后才计入。平均运行时间 ≤ 该题基准值得满分，达到 3 倍基准值时降为 0。</p></div>
        <div><b>ms</b><span>真实进程计时</span><p>后端从进程启动到退出计时，不含 GCC 编译、HTTP 传输和浏览器渲染。</p></div>
      </div>
    </section>`;
    updateProgress();
    if (focusSearch) {
      const input = document.getElementById('taskSearch');
      if (input) {
        input.focus();
        const end = input.value.length;
        try { input.setSelectionRange(end, end); } catch (_) {}
      }
    }
  }

  function renderLineNumbers(textarea) {
    const inner = document.querySelector('.line-numbers-inner');
    if (!inner || !textarea) return;
    const count = Math.min(1600, Math.max(1, textarea.value.split('\n').length));
    inner.innerHTML = Array.from({ length: count }, (_, i) => `<span>${i + 1}</span>`).join('');
    inner.style.transform = `translateY(${-textarea.scrollTop}px)`;
  }

  function updateEditorMeta(textarea) {
    const meta = document.getElementById('codeStats');
    if (!meta || !textarea) return;
    const value = textarea.value;
    const before = value.slice(0, textarea.selectionStart);
    const line = before.split('\n').length;
    const chars = value.length;
    meta.innerHTML = `第 <b>${line}</b> 行 · <b>${chars}</b> 字符`;
  }

  function renderTask(task) {
    const code = typeof state.store.code[task.id] === 'string' ? state.store.code[task.id] : task.starter;
    const index = TASKS.findIndex(t => t.id === task.id);
    const prev = TASKS[(index - 1 + TASKS.length) % TASKS.length];
    const next = TASKS[(index + 1) % TASKS.length];
    const hidden = task.testCases.length - 1;
    const best = Number(state.store.best[task.id] || 0);
    app.innerHTML = `<section class="task-shell">
      <div class="task-nav">
        <div class="task-nav-left">
          <button class="lab-btn small" type="button" data-action="back">← 全部题目</button>
          <button class="lab-btn small ghost" type="button" data-action="open-task" data-task="${esc(prev.id)}" aria-label="上一题 ${esc(prev.title)}">← 上一题</button>
        </div>
        <span class="task-nav-mid">NO.${taskNumber(task)} / ${TASKS.length} · ${esc(levelName(task.level))}</span>
        <div class="task-nav-right">
          <button class="lab-btn small ghost" type="button" data-action="open-task" data-task="${esc(next.id)}" aria-label="下一题 ${esc(next.title)}"><span class="next-label">下一题</span> →</button>
        </div>
      </div>
      <div class="work-grid">
        <aside class="brief-panel">
          <div class="task-overline"><span class="level-tag">${esc(levelName(task.level))}</span><span class="mono">NO.${taskNumber(task)}</span>${best ? `<span class="mono">最佳 ${formatScore(best)}</span>` : ''}</div>
          <h1>${esc(task.title)}</h1>
          <p class="subtitle">${esc(task.subtitle)}</p>
          <p class="brief">${esc(task.goal)}</p>
          <div class="spec-two">
            <div class="spec-block"><h3>输入格式</h3><p>${esc(task.input)}</p></div>
            <div class="spec-block"><h3>输出格式</h3><p>${esc(task.output)}</p></div>
          </div>
          <div class="target-block">
            <div class="target-head"><h3>目标输出 · 公开样例</h3><button class="lab-btn small copy-btn" type="button" data-action="copy-target">复制</button></div>
            <div class="target-meta"><span>stdin = ${esc(task.sampleStdin)}</span><span>${task.testCases.length} 组测试</span></div>
            <pre id="targetOutput">${esc(task.sampleStdout)}</pre>
          </div>
          <div class="case-note">提交后会换成 <b>${hidden}</b> 组隐藏参数再测。隐藏用例不会提前显示输入，但结果页会列出它们的输入、期望和实际输出。</div>
          <div class="hints-box"><details><summary>卡住时看提示</summary><ul class="hints-list">${(task.hints || []).map(h => `<li>${esc(h)}</li>`).join('')}</ul></details></div>
          <div class="rules-box"><details><summary>评分与比较规则</summary><div class="rules-copy"><p>${esc(RULES.normalize)}</p><p>${esc(RULES.speedRule)}</p><p>${esc(RULES.msRule)}</p></div></details></div>
          <div class="doc-callout">
            <div class="doc-callout-copy">
              <span class="doc-callout-kicker">C++ API · 站内速查</span>
              <p>做题时边写边查：容器、算法、字符串、并发与文件系统条目，全部在站内完成。</p>
            </div>
            <a class="lab-btn" href="./cpp-api.html?v=20261128z119">打开 C++ API 速查 →</a>
          </div>
        </aside>
        <section class="workspace-main">
          <div class="editor-card">
            <div class="editor-head">
              <div class="editor-file">main.cpp <span>C++20 · GCC 14.1</span></div>
              <div class="editor-actions">
                <a class="lab-btn small" href="./cpp-api.html?v=20261128z119">API 速查</a>
                <button class="lab-btn small" type="button" data-action="reset">重置模板</button>
              </div>
            </div>
            <div class="editor-wrap">
              <div class="line-numbers" aria-hidden="true"><div class="line-numbers-inner"></div></div>
              <textarea id="lineInput" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="C++ 代码编辑器" placeholder="// 从 main.cpp 的空白程序开始写"></textarea>
            </div>
            <div class="editor-foot"><span id="codeStats">第 1 行 · 0 字符</span><span>Tab = 4 空格 · ⌘/Ctrl + Enter 提交</span></div>
          </div>
          <div class="action-bar">
            <button class="lab-btn run-btn" type="button" data-action="run">▶ 运行公开样例</button>
            <button class="lab-btn gold submit-btn" type="button" data-action="submit">提交评分 · ${task.testCases.length} 组测试</button>
            <span class="action-hint" id="actionHint">运行样例只跑公开用例，不计成绩；提交会跑 <b>${task.testCases.length}</b> 组测试。</span>
          </div>
          <div class="result-panel" aria-live="polite">${emptyResultHtml()}</div>
        </section>
      </div>
    </section>`;

    const textarea = document.getElementById('lineInput');
    if (textarea) {
      textarea.value = code;
      renderLineNumbers(textarea);
      updateEditorMeta(textarea);
      textarea.addEventListener('input', () => {
        renderLineNumbers(textarea);
        updateEditorMeta(textarea);
        markStale();
        clearTimeout(textarea._saveTimer);
        textarea._saveTimer = setTimeout(() => saveCode(textarea.value), 220);
      });
      textarea.addEventListener('scroll', () => {
        const inner = document.querySelector('.line-numbers-inner');
        if (inner) inner.style.transform = `translateY(${-textarea.scrollTop}px)`;
      }, { passive: true });
      textarea.addEventListener('keydown', event => onEditorKeydown(event, textarea));
      textarea.addEventListener('click', () => updateEditorMeta(textarea));
      textarea.addEventListener('keyup', () => updateEditorMeta(textarea));
    }
    updateProgress();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function saveCode(code) {
    if (!state.taskId) return;
    state.store.code[state.taskId] = String(code);
    persistStore();
  }

  function saveActiveCode() {
    const textarea = document.getElementById('lineInput');
    if (textarea && state.taskId) saveCode(textarea.value);
  }

  function onEditorKeydown(event, textarea) {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      if (!state.busy) submitAll();
      return;
    }
    if (event.key === 'Tab') {
      event.preventDefault();
      const value = textarea.value;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end && !event.shiftKey) {
        textarea.setRangeText('    ', start, end, 'end');
      } else {
        const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
        const block = value.slice(lineStart, end);
        const changed = block.split('\n').map(line => event.shiftKey ? line.replace(/^ {1,4}/, '') : '    ' + line).join('\n');
        textarea.setRangeText(changed, lineStart, end, 'select');
      }
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    if (event.key === 'Enter' && !event.shiftKey && textarea.selectionStart === textarea.selectionEnd) {
      const value = textarea.value;
      const start = textarea.selectionStart;
      const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
      const line = value.slice(lineStart, start);
      const indent = (line.match(/^\s*/) || [''])[0];
      const extra = /\{\s*$/.test(line) ? '    ' : '';
      event.preventDefault();
      textarea.setRangeText(`\n${indent}${extra}`, start, start, 'end');
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  async function runSample() {
    const task = currentTask();
    if (!task || state.busy) return;
    const textarea = document.getElementById('lineInput');
    if (!textarea) return;
    const code = textarea.value;
    if (!code.trim()) {
      toast('先写一点 C++ 代码，再运行。', 'err');
      textarea.focus();
      return;
    }
    saveCode(code);
    const token = ++state.workToken;
    state.busy = true;
    syncActionsForBusy();
    setBusy(true, '正在用 GCC 14.1 编译并运行公开样例…');
    renderLoading('正在编译 main.cpp', 'GCC 14.1 · C++20 · 只运行公开样例', 18);
    const tc = task.testCases[0];
    try {
      const result = await executeCase(code, tc.stdin, tc.expected, token);
      if (token !== state.workToken) return;
      renderRunResult(result, task);
    } catch (error) {
      if (token !== state.workToken) return;
      showServiceError(error);
    } finally {
      if (token === state.workToken) {
        state.busy = false;
        syncActionsForBusy();
        setBusy(false);
      }
    }
  }

  async function submitAll() {
    const task = currentTask();
    if (!task || state.busy) return;
    const textarea = document.getElementById('lineInput');
    if (!textarea) return;
    const code = textarea.value;
    if (!code.trim()) {
      toast('先写一点 C++ 代码，再提交。', 'err');
      textarea.focus();
      return;
    }
    saveCode(code);
    const token = ++state.workToken;
    state.busy = true;
    syncActionsForBusy();
    setBusy(true, `正在运行 1 / ${task.testCases.length} 组测试…`);
    renderLoading('正在编译 main.cpp', `准备运行 ${task.testCases.length} 组测试`, 5);

    const results = [];
    let compileFailure = false;
    try {
      for (let i = 0; i < task.testCases.length; i++) {
        if (token !== state.workToken) return;
        const tc = task.testCases[i];
        updateProgressText(`正在运行 ${i + 1} / ${task.testCases.length} 组测试…`, `${tc.label} · 输入 ${tc.stdin}`, ((i + 1) / task.testCases.length) * 55 + 5);
        setBusy(true, `正在运行 ${i + 1} / ${task.testCases.length} 组测试…`);
        const result = await executeCase(code, tc.stdin, tc.expected, token);
        if (token !== state.workToken) return;
        const enriched = { ...result, testCase: tc };
        results.push(enriched);
        if (result.status === 'Compilation Error') {
          compileFailure = true;
          break;
        }
      }
      if (token !== state.workToken) return;
      if (compileFailure) {
        results[0].compileFailure = true;
        const breakdown = calculateScore(0, task.testCases.length, 0, task.fastMs);
        renderSubmitResult(task, results, breakdown, 0, true);
        toast('编译失败，先看 GCC 诊断。', 'err');
      } else {
        const total = task.testCases.length;
        let passed = 0;
        for (let i = 0; i < results.length; i++) {
          const tc = task.testCases[i];
          if (results[i] && results[i].status === 'Accepted' && compareOutput(results[i].stdout, tc.expected)) passed++;
        }
        const times = results.map(r => Number(r.timeMs)).filter(n => Number.isFinite(n) && n >= 0);
        const avgMs = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
        const breakdown = calculateScore(passed, total, avgMs, task.fastMs);
        renderSubmitResult(task, results, breakdown, avgMs, false);
        if (passed === total) {
          const oldBest = Number(state.store.best[task.id] || 0);
          if (breakdown.total > oldBest) state.store.best[task.id] = breakdown.total;
          const oldMs = Number(state.store.bestMs[task.id] || 0);
          if (!oldMs || avgMs < oldMs) state.store.bestMs[task.id] = round1(avgMs);
          persistStore();
          updateProgress();
          toast(breakdown.total >= 100 ? '满分通过，速度也拿满。' : '三组全部通过，已保存最佳成绩。', 'ok');
        } else if (passed > 0) {
          toast(`通过 ${passed} / ${total} 组，继续改输出。`, 'err');
        } else {
          toast('还没有用例通过，先对照公开样例检查。', 'err');
        }
      }
    } catch (error) {
      if (token !== state.workToken) return;
      showServiceError(error);
    } finally {
      if (token === state.workToken) {
        state.busy = false;
        syncActionsForBusy();
        setBusy(false);
      }
    }
  }

  function updateProgressText(title, detail, pct) {
    const h2 = document.querySelector('.judge-progress h2');
    const p = document.querySelector('.judge-progress p');
    const bar = document.querySelector('.progress-line i');
    if (h2) h2.textContent = title;
    if (p) p.textContent = detail;
    if (bar) bar.style.width = `${Math.max(2, Math.min(100, pct))}%`;
  }

  function resetCode() {
    const task = currentTask();
    if (!task || state.busy) return;
    if (!window.confirm('重置为空白模板？当前代码会被覆盖，但最佳成绩会保留。')) return;
    const textarea = document.getElementById('lineInput');
    if (!textarea) return;
    textarea.value = task.starter;
    saveCode(task.starter);
    renderLineNumbers(textarea);
    updateEditorMeta(textarea);
    const panel = document.querySelector('.result-panel');
    if (panel) {
      delete panel.dataset.hasResult;
      panel.innerHTML = emptyResultHtml();
    }
    textarea.focus();
    toast('已重置为空白模板');
  }

  async function copyTarget() {
    const task = currentTask();
    if (!task) return;
    const text = task.sampleStdout;
    try {
      await navigator.clipboard.writeText(text);
      toast('目标输出已复制', 'ok');
    } catch (_) {
      const fake = document.createElement('textarea');
      fake.value = text;
      fake.style.position = 'fixed';
      fake.style.opacity = '0';
      document.body.appendChild(fake);
      fake.select();
      try { document.execCommand('copy'); toast('目标输出已复制', 'ok'); }
      catch (__) { toast('复制失败，请手动选中目标输出。', 'err'); }
      fake.remove();
    }
  }

  function openTask(id) {
    const task = taskById(id);
    if (!task) return;
    saveActiveCode();
    cancelWork();
    state.taskId = id;
    if (location.hash !== `#${id}`) {
      history.pushState({ task: id }, '', `#${id}`);
    }
    renderTask(task);
  }

  function goBank() {
    saveActiveCode();
    cancelWork();
    state.taskId = null;
    history.replaceState({}, '', location.pathname + location.search);
    renderBank();
    window.scrollTo({ top: 0, behavior: 'auto' });
  }

  function routeFromHash() {
    let id = (location.hash || '').replace(/^#/, '');
    try { id = decodeURIComponent(id); } catch (_) { return null; }
    if (id && taskById(id)) return id;
    return null;
  }

  function handleHistory() {
    const id = routeFromHash();
    if (id === state.taskId) return;
    saveActiveCode();
    cancelWork();
    state.taskId = id;
    if (id) renderTask(taskById(id));
    else {
      renderBank();
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  function setFilter(id) {
    if (id !== 'all' && !LEVELS.some(l => l.id === id)) return;
    state.store.filter = id;
    persistStore();
    renderBank();
  }

  function setStatus(status) {
    if (!['all', 'todo', 'done'].includes(status)) return;
    state.store.status = status;
    persistStore();
    renderBank();
  }

  function setQuery(query) {
    state.store.query = String(query || '');
    persistStore();
    renderBank(true);
  }

  function clearFilters() {
    state.store.filter = 'all';
    state.store.status = 'all';
    state.store.query = '';
    persistStore();
    renderBank();
  }

  function startFirst() {
    const visible = visibleTasks();
    const first = visible.find(t => !isDone(t)) || visible[0] || TASKS.find(t => !isDone(t)) || TASKS[0];
    if (first) openTask(first.id);
  }

  app.addEventListener('click', event => {
    const trigger = event.target.closest('[data-action]');
    if (!trigger) return;
    const action = trigger.dataset.action;
    if (action === 'open-task') {
      event.preventDefault();
      openTask(trigger.dataset.task);
    } else if (action === 'back') {
      event.preventDefault();
      goBank();
    } else if (action === 'filter') {
      event.preventDefault();
      setFilter(trigger.dataset.filter || 'all');
    } else if (action === 'filter-status') {
      event.preventDefault();
      setStatus(trigger.dataset.status || 'all');
    } else if (action === 'clear-filters') {
      event.preventDefault();
      clearFilters();
    } else if (action === 'start-first') {
      event.preventDefault();
      startFirst();
    } else if (action === 'scroll-rules') {
      event.preventDefault();
      const rules = document.getElementById('judgingRules');
      if (rules) rules.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (action === 'copy-target') {
      event.preventDefault();
      copyTarget();
    } else if (action === 'run') {
      event.preventDefault();
      runSample();
    } else if (action === 'submit') {
      event.preventDefault();
      submitAll();
    } else if (action === 'reset') {
      event.preventDefault();
      resetCode();
    }
  });

  app.addEventListener('input', event => {
    if (event.target && event.target.id === 'taskSearch') {
      clearTimeout(event.target._searchTimer);
      event.target._searchTimer = setTimeout(() => setQuery(event.target.value), 180);
    }
  });

  app.addEventListener('keydown', event => {
    if (event.target && event.target.id === 'taskSearch' && event.key === 'Escape') {
      event.preventDefault();
      event.target.value = '';
      state.store.query = '';
      persistStore();
      renderBank();
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
    const tag = (event.target && event.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'textarea' || (event.target && event.target.isContentEditable)) return;
    if (state.taskId) return;
    const input = document.getElementById('taskSearch');
    if (input) {
      event.preventDefault();
      input.focus();
    }
  });

  if (engineBadge) {
    engineBadge.addEventListener('click', () => {
      if (state.judge.endpoint) {
        const detail = [state.judge.label, state.judge.endpoint, state.judge.detail].filter(Boolean).join(' · ');
        toast(detail, state.judge.status === 'bad' ? 'err' : 'ok');
      } else {
        toast('判题节点是公共 Judge0 的 GCC 14.1。', 'err');
      }
    });
  }

  window.addEventListener('popstate', handleHistory);
  window.addEventListener('hashchange', handleHistory);

  window.__CPP_OUTPUT_LAB__ = {
    normalizeOutput,
    compareOutput,
    firstDiffLine,
    calculateScore
  };

  // 启动
  updateProgress();
  state.probePromise = probeJudge();
  const initial = routeFromHash();
  if (initial) {
    state.taskId = initial;
    renderTask(taskById(initial));
  } else {
    renderBank();
  }
})();

(() => {
  'use strict';

  const BANK = window.JS_OUTPUT_BANK;
  const TASKS = BANK && Array.isArray(BANK.tasks) ? BANK.tasks : [];
  const LEVELS = BANK && Array.isArray(BANK.levels) ? BANK.levels : [];
  const RULES = (BANK && BANK.rules) || { correctness: 85, speed: 15 };
  const STORE_KEY = 'javascript-output-lab:v1';
  const WORKER_URL = '../assets/js/javascript-output/js-output-worker.js?v=20261125z73';
  const app = document.getElementById('app');
  const toastEl = document.getElementById('toast');
  const topProgress = document.getElementById('topProgress');

  const state = {
    taskId: null,
    busy: false,
    workToken: 0,
    worker: null,
    store: loadStore()
  };

  function loadStore() {
    const base = { best: {}, bestMs: {}, code: {}, filter: 'all' };
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      const out = { ...base, filter: raw.filter || 'all' };
      for (const bag of ['best', 'bestMs', 'code']) {
        const src = raw[bag];
        if (!src || typeof src !== 'object') continue;
        for (const [id, value] of Object.entries(src)) {
          if (bag === 'code' && typeof value === 'string') out[bag][id] = value;
          if (bag !== 'code' && Number.isFinite(Number(value)) && Number(value) >= 0) out[bag][id] = Number(value);
        }
      }
      if (!LEVELS.some(level => level.id === out.filter)) out.filter = 'all';
      return out;
    } catch (_) {
      return base;
    }
  }

  function persistStore() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state.store));
    } catch (_) {
      /* 本地存储不可用时继续做题，只是不保留成绩。 */
    }
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function taskById(id) {
    return TASKS.find(task => task.id === id) || null;
  }

  function currentTask() {
    return taskById(state.taskId);
  }

  function levelById(id) {
    return LEVELS.find(level => level.id === id) || { name: id, kicker: '' };
  }

  function levelName(id) {
    return levelById(id).name;
  }

  function round1(n) {
    return Math.round((Number(n) || 0) * 10) / 10;
  }

  function formatScore(n) {
    const value = round1(n);
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  function formatMs(n) {
    const value = Number(n);
    return Number.isFinite(value) && value >= 0 ? String(Math.round(value)) : '—';
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

  function updateProgress() {
    if (topProgress) topProgress.textContent = `${doneCount()} / ${TASKS.length}`;
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
      const fast = Math.max(1, Number(fastMs) || 50);
      const avg = Math.max(0, Number(avgMs) || 0);
      speed = speedMax * Math.min(1, Math.max(0, (3 * fast - avg) / (2 * fast)));
    }
    return {
      correctness: round1(correctness),
      speed: round1(speed),
      total: round1(correctness + speed),
      passed: pass,
      count
    };
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

  function emptyResultHtml() {
    return `<div class="result-empty">
      <div class="term-icon" aria-hidden="true">&gt;_</div>
      <div>
        <h2>运行结果会显示在这里</h2>
        <p>先运行公开样例检查空格和换行，再提交全部 3 组测试。</p>
        <div class="result-tip">浏览器 Worker 执行 · 输出逐行比对 · 真实运行毫秒</div>
      </div>
    </div>`;
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

  function statusLabel(result) {
    if (result.passed) return '通过';
    if (result.status === 'Compilation Error') return '语法错误';
    if (result.status === 'Runtime Error') return '运行异常';
    if (result.status === 'Time Limit Exceeded') return '超时';
    return '输出不一致';
  }

  function statusClass(result) {
    if (result.passed) return 'pass';
    if (result.status === 'Compilation Error' || result.status === 'Runtime Error' || result.status === 'Time Limit Exceeded') return 'bad';
    return 'fail';
  }

  function mismatchText(result) {
    if (result.passed) return '';
    const line = firstDiffLine(result.stdout, result.expected);
    if (!result.stdout) return '<div class="mismatch-note"><b>实际输出为空</b>；确认代码真的调用了 console.log，而且没有提前抛错。</div>';
    return `<div class="mismatch-note">第 <b>${line || 1}</b> 行开始不一致；行首空格、空行位置和大小写都会参与比较。</div>`;
  }

  function renderRunResult(result, task) {
    const panel = document.querySelector('.result-panel');
    if (!panel) return;
    const badgeClass = result.passed ? 'pass' : (result.status === 'Compilation Error' || result.status === 'Runtime Error' ? 'bad' : 'fail');
    panel.dataset.hasResult = '1';
    panel.innerHTML = `<div class="result-head">
        <div class="result-head-left"><span class="result-kicker">公开样例</span><span class="status-badge ${badgeClass}">${esc(statusLabel(result))}</span></div>
        <div class="run-time"><b>${formatMs(result.timeMs)}</b> ms</div>
      </div>
      <div class="result-body">
        ${result.stderr ? `<div class="stderr-box"><h4>JAVASCRIPT RUNTIME</h4><pre>${esc(result.stderr)}</pre></div>` : renderDiff(result.stdout, result.expected, result.passed)}
        ${mismatchText(result)}
        <div class="case-note">这次只运行了公开样例，不计成绩。提交后会继续跑 <b>${task.testCases.length - 1}</b> 组隐藏参数。</div>
      </div>
      <div class="result-actions">
        <div class="left"><button class="lab-btn small" type="button" data-action="run">再跑一次</button></div>
        <div class="right"><button class="lab-btn small primary" type="button" data-action="submit">提交全部 ${task.testCases.length} 组</button></div>
      </div>`;
    syncActionsForBusy();
  }

  function caseRow(result, index, task) {
    const testCase = result.testCase || task.testCases[index] || { label: `用例 ${index + 1}`, stdin: '', expected: '' };
    let body = '';
    if (result.stderr) {
      body = `<div class="stderr-box"><h4>JAVASCRIPT RUNTIME</h4><pre>${esc(result.stderr)}</pre></div>`;
    } else if (result.passed) {
      body = `<div class="case-pass-copy">输出与目标一致 · 实际 ${normalizeOutput(result.stdout) ? normalizeOutput(result.stdout).split('\n').length : 0} 行输出</div>`;
    } else {
      body = `<div class="case-diagnostics">${renderDiff(result.stdout, result.expected || testCase.expected, false)}${mismatchText(result)}</div>`;
    }
    return `<div class="case-row ${result.passed ? 'pass' : 'fail'}">
      <div class="case-row-head">
        <span class="case-name">${esc(testCase.label)}</span>
        <span class="case-input" title="${esc(testCase.stdin)}">输入：${esc(String(testCase.stdin).replace(/\n/g, ' ↵ '))}</span>
        <span class="status-badge ${statusClass(result)}">${esc(statusLabel(result))}</span>
        <span class="run-time"><b>${formatMs(result.timeMs)}</b> ms</span>
      </div>
      <div class="case-body">${body}</div>
    </div>`;
  }

  function renderSubmitResult(task, results, breakdown, avgMs, compileError) {
    const panel = document.querySelector('.result-panel');
    if (!panel) return;
    const score = breakdown.total;
    const ringClass = score >= RULES.correctness ? '' : (score >= 50 ? 'mid' : 'low');
    const allPass = breakdown.passed === breakdown.count;
    const caseRows = compileError
      ? `<div class="case-row fail"><div class="case-row-head"><span class="case-name">语法检查</span><span class="status-badge bad">语法错误</span><span class="run-time"><b>—</b> ms</span></div><div class="case-body"><div class="stderr-box"><h4>JAVASCRIPT SYNTAX</h4><pre>${esc(compileError)}</pre></div></div></div>`
      : results.map((result, index) => caseRow(result, index, task)).join('');
    const headBadge = compileError ? '语法错误' : (allPass ? '全部通过' : `${breakdown.passed} / ${breakdown.count} 通过`);
    const headClass = compileError ? 'bad' : (allPass ? 'pass' : 'fail');
    panel.dataset.hasResult = '1';
    panel.innerHTML = `<div class="result-head">
        <div class="result-head-left"><span class="result-kicker">提交结果 · ${esc(task.title)}</span><span class="status-badge ${headClass}">${headBadge}</span></div>
        <div class="run-time"><b>${compileError ? '—' : formatMs(avgMs)}</b>${compileError ? '' : ' ms 平均'}</div>
      </div>
      <div class="score-summary">
        <div class="score-ring ${ringClass}" style="--pct:${Math.max(0, Math.min(100, score))}%"><div><b>${formatScore(score)}</b><span>/ 100</span></div></div>
        <div class="score-copy">
          <h2>${compileError ? '先把语法错误清掉' : (allPass ? '三组测试全部通过' : `还有 ${breakdown.count - breakdown.passed} 组没对上`)}</h2>
          <p>${compileError ? '语法检查失败，本次不计正确性分数。下方是浏览器的原始诊断。' : `正确性 <b>${formatScore(breakdown.correctness)}</b> / ${RULES.correctness} · 速度 <b>${formatScore(breakdown.speed)}</b> / ${RULES.speed}。`}</p>
          <p>${allPass ? '最佳成绩已保存到本机。' : '输出正确率决定主要得分；三组全过之后才计入速度分。'}</p>
        </div>
        <div class="score-time"><b>${compileError ? '—' : formatMs(avgMs)}</b><span>AVG RUN MS</span></div>
      </div>
      <div class="score-breakdown">
        <div class="break-item"><div class="break-label"><span>输出正确性</span><b>${formatScore(breakdown.correctness)} / ${RULES.correctness}</b></div><div class="break-bar"><i style="width:${Math.round(breakdown.correctness / RULES.correctness * 100)}%"></i></div></div>
        <div class="break-item"><div class="break-label"><span>运行速度</span><b>${formatScore(breakdown.speed)} / ${RULES.speed}</b></div><div class="break-bar gold"><i style="width:${Math.round(breakdown.speed / RULES.speed * 100)}%"></i></div></div>
      </div>
      <div class="score-note">速度基准 ${task.fastMs} ms；平均达到 3 倍基准值时速度分为 0。毫秒由浏览器 Worker 计时，不含页面渲染和网络。</div>
      <div class="case-list">${caseRows}</div>
      <div class="result-actions">
        <div class="left"><button class="lab-btn small" type="button" data-action="run">只跑样例</button><button class="lab-btn small" type="button" data-action="reset">重置代码</button></div>
        <div class="right"><button class="lab-btn small primary" type="button" data-action="submit">再提交一次</button>${nextButton(task)}</div>
      </div>`;
    syncActionsForBusy();
  }

  function nextButton(task) {
    const index = TASKS.findIndex(item => item.id === task.id);
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
      <div class="task-preview"><div class="task-preview-label"><span>目标输出</span><span>PUBLIC SAMPLE</span></div><pre>${esc(previewOutput(task))}</pre></div>
      <div class="task-card-foot"><span>${esc(levelName(task.level))} · <b>${esc((task.concepts || []).join(' / '))}</b></span><span class="arrow" aria-hidden="true">→</span></div>
    </button>`;
  }

  function renderBank() {
    const filter = state.store.filter || 'all';
    const filtered = filter === 'all' ? TASKS : TASKS.filter(task => task.level === filter);
    const groups = LEVELS.map(level => {
      const tasks = filtered.filter(task => task.level === level.id);
      if (!tasks.length) return '';
      return `<section class="level-section" aria-labelledby="level-${esc(level.id)}">
        <div class="level-head">
          <div><span class="level-kicker">${esc(level.kicker)}</span><h2 id="level-${esc(level.id)}">${esc(level.name)}</h2><p>${esc(level.desc)}</p></div>
          <span class="level-count">${tasks.length} 题</span>
        </div>
        <div class="task-grid">${tasks.map(taskCard).join('')}</div>
      </section>`;
    }).join('');

    app.innerHTML = `<section class="lab-hero">
      <span class="kicker">JAVASCRIPT · OUTPUT → CODE · 3 TEST CASES</span>
      <h1>给你输出，<span>从零写出完整程序</span></h1>
      <p class="sub">先在左边看目标输出，再在 <b>main.js</b> 里自己写解析、计算和打印。提交后由浏览器 <b>Worker</b> 真实执行，按 <b>3 组用例</b>逐行比对 stdout，并把运行毫秒计入评分。</p>
      <div class="hero-stats">
        <span><b>${LEVELS.length}</b> 档难度</span>
        <span><b>${TASKS.length}</b> 道题</span>
        <span><b>${TASKS.reduce((n, task) => n + task.testCases.length, 0)}</b> 组测试</span>
        <span class="hot">输出 85 分 + 速度 15 分</span>
        <span>浏览器 Worker</span>
      </div>
      <div class="hero-actions">
        <button class="lab-btn primary" type="button" data-action="start-first">开始一题 <span aria-hidden="true">→</span></button>
        <button class="lab-btn" type="button" data-action="scroll-rules">评分规则</button>
      </div>
      <div class="hero-note">没有待改的错误代码，也没有可抄的答案。代码只在本机浏览器 Worker 中运行，不上传服务器，成绩和草稿也都保存在这台设备。</div>
    </section>
    <div class="bank-toolbar">
      <div class="filter-tabs" role="group" aria-label="按难度筛选">
        <button type="button" class="${filter === 'all' ? 'active' : ''}" data-action="filter" data-filter="all">全部 <b>${TASKS.length}</b></button>
        ${LEVELS.map(level => `<button type="button" class="${filter === level.id ? 'active' : ''}" data-action="filter" data-filter="${esc(level.id)}">${esc(level.name)} <b>${TASKS.filter(task => task.level === level.id).length}</b></button>`).join('')}
      </div>
      <div class="bank-note">已完成 <b>${doneCount()}</b> / ${TASKS.length} · 最佳成绩保存在本机</div>
    </div>
    ${groups || '<div class="bank-empty">这个难度下暂时没有题目。</div>'}
    <section class="bank-rules" id="judgingRules">
      <div class="rules-title"><span class="kicker">SCORING · 100</span><h2>分数只看两件可验证的事</h2></div>
      <div class="rules-grid">
        <div><b>85</b><span>输出正确性</span><p>3 组用例按通过比例计分。只忽略每行行尾空格和文件末尾空行，行首空格、空行位置、大小写都保留。</p></div>
        <div><b>15</b><span>运行速度</span><p>三组全部通过后才计入。平均运行时间不超过该题基准值得满分，达到 3 倍基准值时降为 0。</p></div>
        <div><b>ms</b><span>浏览器真实计时</span><p>从 Worker 开始执行到当前用例 stdout 完成计时，不含页面渲染、网络传输和人工点击。</p></div>
      </div>
    </section>`;
    updateProgress();
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
    const before = textarea.value.slice(0, textarea.selectionStart);
    const line = before.split('\n').length;
    meta.innerHTML = `第 <b>${line}</b> 行 · <b>${textarea.value.length}</b> 字符`;
  }

  function renderTask(task) {
    const code = typeof state.store.code[task.id] === 'string' ? state.store.code[task.id] : task.starter;
    const index = TASKS.findIndex(item => item.id === task.id);
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
            <div class="target-meta"><span>input = ${esc(task.sampleStdin)}</span><span>${task.testCases.length} 组测试</span></div>
            <pre id="targetOutput">${esc(task.sampleStdout)}</pre>
          </div>
          <div class="case-note">提交后会换成 <b>${hidden}</b> 组隐藏参数再测。隐藏用例不会提前显示输入，但结果页会列出它们的输入、期望和实际输出。</div>
          <div class="hints-box"><details><summary>卡住时看提示</summary><ul class="hints-list">${(task.hints || []).map(hint => `<li>${esc(hint)}</li>`).join('')}</ul></details></div>
          <div class="rules-box"><details><summary>评分与比较规则</summary><div class="rules-copy"><p>${esc(RULES.normalize)}</p><p>${esc(RULES.speedRule)}</p><p>${esc(RULES.msRule)}</p></div></details></div>
          <div class="doc-callout">
            <div class="doc-callout-copy">
              <span class="doc-callout-kicker">JAVASCRIPT API · CHEATSHEET</span>
              <p>需要查数组、字符串、Map、Promise？打开 JavaScript API 速查。</p>
            </div>
            <a class="lab-btn" href="./javascript-api.html?v=20261125z73" target="_blank" rel="noopener">打开 API</a>
          </div>
        </aside>
        <section class="workspace-main">
          <div class="editor-card">
            <div class="editor-head">
              <div class="editor-file">main.js <span>JavaScript · Browser Worker</span></div>
              <div class="editor-actions">
                <a class="lab-btn small doc-btn" href="./javascript-api.html?v=20261125z73" target="_blank" rel="noopener"><span class="doc-mark" aria-hidden="true">JS</span>JavaScript API</a>
                <button class="lab-btn small" type="button" data-action="reset">重置模板</button>
              </div>
            </div>
            <div class="editor-wrap">
              <div class="line-numbers" aria-hidden="true"><div class="line-numbers-inner"></div></div>
              <textarea id="lineInput" wrap="off" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="JavaScript 代码编辑器" placeholder="// 从空白开始写你的 JavaScript 程序"></textarea>
            </div>
            <div class="editor-foot"><span id="codeStats">第 1 行 · 0 字符</span><span>Tab = 2 空格 · ⌘/Ctrl + Enter 提交</span></div>
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
        textarea.setRangeText('  ', start, end, 'end');
      } else {
        const lineStart = value.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
        const block = value.slice(lineStart, end);
        const changed = block.split('\n').map(line => event.shiftKey ? line.replace(/^ {1,2}/, '') : '  ' + line).join('\n');
        textarea.setRangeText(changed, lineStart, end, 'select');
      }
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function setBusy(busy, hint) {
    state.busy = busy;
    syncActionsForBusy();
    const hintEl = document.getElementById('actionHint');
    if (hintEl) {
      hintEl.innerHTML = busy
        ? esc(hint || '正在运行…')
        : '运行样例只跑公开用例，不计成绩；提交会跑 <b>3</b> 组测试。';
    }
  }

  function cancelWork() {
    state.workToken++;
    if (state.worker) {
      try { state.worker.terminate(); } catch (_) {}
      state.worker = null;
    }
    state.busy = false;
  }

  function executeCases(code, cases, workToken) {
    return new Promise((resolve, reject) => {
      if (state.worker) {
        try { state.worker.terminate(); } catch (_) {}
        state.worker = null;
      }
      let worker;
      try {
        worker = new Worker(new URL(WORKER_URL, window.location.href));
      } catch (error) {
        reject(new Error('当前浏览器无法启动 Worker，请换用 Chrome、Edge 或 Safari 最新版。'));
        return;
      }
      state.worker = worker;
      let done = false;
      const finish = (error, value) => {
        if (done) return;
        done = true;
        clearTimeout(timeout);
        try { worker.terminate(); } catch (_) {}
        if (state.worker === worker) state.worker = null;
        if (workToken != null && workToken !== state.workToken) {
          reject(new Error('运行已取消。'));
          return;
        }
        if (error) reject(error);
        else resolve(value);
      };
      const timeout = window.setTimeout(() => finish(new Error('执行超过 6 秒，可能是死循环。请检查 while/for 的退出条件。')), 6000);
      worker.onmessage = event => {
        const data = event.data || {};
        if (!data.ok) {
          finish(null, { compileError: data.compileError || 'JavaScript 语法错误。' });
          return;
        }
        finish(null, { results: Array.isArray(data.results) ? data.results : [] });
      };
      worker.onerror = event => {
        finish(new Error(event.message || 'Worker 执行器报错。'));
      };
      worker.postMessage({ code, cases });
    });
  }

  function makeResults(raw, task) {
    return raw.map((item, index) => {
      const testCase = task.testCases[index];
      const stdout = item && item.stdout != null ? item.stdout : '';
      const stderr = item && item.stderr ? item.stderr : '';
      const passed = !stderr && compareOutput(stdout, testCase.expected);
      return {
        status: stderr ? 'Runtime Error' : (passed ? 'Accepted' : 'Wrong Answer'),
        stdout,
        stderr,
        timeMs: item && Number.isFinite(Number(item.timeMs)) ? Number(item.timeMs) : 0,
        expected: testCase.expected,
        testCase,
        passed
      };
    });
  }

  async function runSample() {
    const task = currentTask();
    if (!task || state.busy) return;
    const textarea = document.getElementById('lineInput');
    if (!textarea) return;
    const code = textarea.value;
    if (!code.trim()) {
      toast('先写一点 JavaScript 代码，再运行。', 'err');
      textarea.focus();
      return;
    }
    saveCode(code);
    const token = ++state.workToken;
    setBusy(true, '正在执行公开样例…');
    renderLoading('正在启动浏览器 Worker', '真实执行 main.js · 只运行公开样例', 18);
    try {
      const data = await executeCases(code, [task.testCases[0]], token);
      if (data.compileError) {
        renderRunResult({ status: 'Compilation Error', stderr: data.compileError, stdout: '', expected: task.sampleStdout, timeMs: 0, passed: false }, task);
      } else {
        const result = makeResults(data.results, task)[0];
        renderRunResult(result, task);
      }
    } catch (error) {
      renderRuntimeError(error);
    } finally {
      if (token === state.workToken) setBusy(false);
    }
  }

  async function submitAll() {
    const task = currentTask();
    if (!task || state.busy) return;
    const textarea = document.getElementById('lineInput');
    if (!textarea) return;
    const code = textarea.value;
    if (!code.trim()) {
      toast('先写一点 JavaScript 代码，再提交。', 'err');
      textarea.focus();
      return;
    }
    saveCode(code);
    const token = ++state.workToken;
    setBusy(true, `正在运行 ${task.testCases.length} 组测试…`);
    renderLoading('正在执行全部测试', '只创建一个 Worker，依次运行 3 组参数', 10);
    try {
      const data = await executeCases(code, task.testCases.slice(), token);
      if (data.compileError) {
        const breakdown = calculateScore(0, task.testCases.length, 0, task.fastMs);
        renderSubmitResult(task, [], breakdown, 0, data.compileError);
        toast('语法错误，先看下方诊断。', 'err');
        return;
      }
      const results = makeResults(data.results, task);
      const passed = results.filter(result => result.passed).length;
      const times = results.map(result => Number(result.timeMs)).filter(n => Number.isFinite(n) && n >= 0);
      const avgMs = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
      const breakdown = calculateScore(passed, task.testCases.length, avgMs, task.fastMs);
      renderSubmitResult(task, results, breakdown, avgMs, '');
      if (passed === task.testCases.length) {
        if (breakdown.total > Number(state.store.best[task.id] || 0)) state.store.best[task.id] = breakdown.total;
        const oldMs = Number(state.store.bestMs[task.id] || 0);
        if (!oldMs || avgMs < oldMs) state.store.bestMs[task.id] = round1(avgMs);
        persistStore();
        updateProgress();
        toast(breakdown.total >= 100 ? '满分通过，速度也拿满。' : '三组全部通过，已保存最佳成绩。', 'ok');
      } else if (passed > 0) {
        toast(`通过 ${passed} / ${task.testCases.length} 组，继续对输出。`, 'err');
      } else {
        toast('还没有用例通过，先对照公开样例检查。', 'err');
      }
    } catch (error) {
      renderRuntimeError(error);
    } finally {
      if (token === state.workToken) setBusy(false);
    }
  }

  function renderRuntimeError(error) {
    const panel = document.querySelector('.result-panel');
    if (!panel) return;
    panel.dataset.hasResult = '1';
    panel.innerHTML = `<div class="result-head"><div class="result-head-left"><span class="result-kicker">WORKER</span><span class="status-badge bad">执行失败</span></div></div>
      <div class="judge-error"><h2>没有拿到运行结果</h2><p>${esc(error && error.message ? error.message : '浏览器 Worker 暂时不可用。')}</p><p>可以刷新页面重试；如果仍然失败，检查浏览器是否禁用了 Worker。</p></div>`;
    toast('浏览器 Worker 没有响应', 'err');
  }

  function resetCode() {
    const task = currentTask();
    if (!task || state.busy) return;
    if (!window.confirm('重置为起始模板？当前代码会被覆盖，但最佳成绩会保留。')) return;
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
    toast('已重置为起始模板');
  }

  async function copyTarget() {
    const task = currentTask();
    if (!task) return;
    try {
      await navigator.clipboard.writeText(task.sampleStdout);
      toast('目标输出已复制', 'ok');
    } catch (_) {
      const fake = document.createElement('textarea');
      fake.value = task.sampleStdout;
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
    if (location.hash !== `#${id}`) history.pushState({ task: id }, '', `#${id}`);
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
    return id && taskById(id) ? id : null;
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
    if (id !== 'all' && !LEVELS.some(level => level.id === id)) return;
    state.store.filter = id;
    persistStore();
    renderBank();
  }

  function startFirst() {
    const first = TASKS.find(task => !isDone(task)) || TASKS[0];
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

  window.addEventListener('popstate', handleHistory);
  window.addEventListener('hashchange', handleHistory);
  window.addEventListener('beforeunload', cancelWork);

  window.__JS_OUTPUT_LAB__ = {
    normalizeOutput,
    compareOutput,
    firstDiffLine,
    calculateScore
  };

  updateProgress();
  const initial = routeFromHash();
  if (initial) {
    state.taskId = initial;
    renderTask(taskById(initial));
  } else {
    renderBank();
  }
})();

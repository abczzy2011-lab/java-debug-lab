/* JavaScript 改错实验室：题库、原地修复、Worker 执行、逐用例评分 */
(function () {
  'use strict';

  var tasks = (window.JS_DEBUG_TASKS || []).slice();
  var LEVELS = {
    basic: { label: '入门', short: 'B', note: '语法、循环与数组基础' },
    medium: { label: '进阶', short: 'M', note: '算法、标准库与边界' },
    hard: { label: '挑战', short: 'H', note: '数据结构、动态规划与陷阱' }
  };
  var STORE_KEY = 'javascriptDebug.best.v1';
  var DRAFT_KEY = 'javascriptDebug.drafts.v1';
  var state = {
    filter: 'all',
    current: null,
    best: loadJSON(STORE_KEY, {}),
    drafts: loadJSON(DRAFT_KEY, {}),
    hints: 0,
    analysisShown: false,
    submitted: false,
    running: false,
    runToken: 0,
    worker: null,
    timer: 0,
    lastResults: null,
    lastMode: '',
    lastScore: null
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function loadJSON(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    } catch (err) { return fallback; }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) {}
  }
  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function inline(value) {
    var text = escapeHTML(value);
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return text;
  }
  function fmt(value) {
    try {
      var json = JSON.stringify(value);
      return json === undefined ? String(value) : json;
    } catch (err) { return String(value); }
  }
  function levelOf(task) { return LEVELS[task.level] || LEVELS.basic; }
  function levelCount(level) {
    return tasks.filter(function (task) { return task.level === level; }).length;
  }
  function solvedCount() {
    return tasks.filter(function (task) {
      var best = state.best[task.id];
      return best && best.score >= 85;
    }).length;
  }
  function taskById(id) {
    for (var i = 0; i < tasks.length; i += 1) if (tasks[i].id === id) return tasks[i];
    return null;
  }
  function publicCases(task) {
    return task.tests.filter(function (test) { return test.public; });
  }

  function showToast(message) {
    var toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () { toast.classList.remove('show'); }, 1900);
  }

  function updateTop() {
    var count = $('#topSolved');
    if (count) count.textContent = solvedCount() + ' / ' + tasks.length;
  }

  function renderBank() {
    state.current = null;
    state.lastResults = null;
    stopWorker();
    var visible = tasks.filter(function (task) {
      return state.filter === 'all' || task.level === state.filter;
    });
    var cards = visible.map(function (task) {
      var level = levelOf(task);
      var best = state.best[task.id];
      var status = best ? (best.score >= 85 ? '已通过 · ' + best.score + ' 分' : '最佳 ' + best.score + ' 分') : '未开始';
      return '<a class="bug-card" href="#task/' + escapeHTML(task.id) + '">' +
        '<div class="card-top"><span class="level level-' + escapeHTML(task.level) + '">' + level.label + '</span>' +
          '<span class="card-no">' + level.short + String(task.order).padStart(2, '0') + '</span></div>' +
        '<h2>' + escapeHTML(task.title) + '</h2>' +
        '<p>' + inline(task.summary) + '</p>' +
        '<div class="card-meta"><span>' + escapeHTML(task.minutes) + ' 分钟</span><span class="' + (best && best.score >= 85 ? 'is-pass' : '') + '">' + escapeHTML(status) + '</span></div>' +
        '<div class="card-foot"><span>' + task.tests.length + ' 个用例</span><span>开始改错 <b aria-hidden="true">→</b></span></div>' +
      '</a>';
    }).join('');
    $('#content').innerHTML = '<div class="bank">' +
      '<section class="hero">' +
        '<div class="hero-inner">' +
          '<div class="kicker">JAVASCRIPT · DEBUG LAB · 3 LEVELS</div>' +
          '<h1>JavaScript 改错实验室</h1>' +
          '<p class="sub">不是选择题。每题给你一段带 bug 的 <code>solve()</code>，在编辑器里原地修，浏览器里真实跑，按 <strong>公开 + 隐藏用例</strong>逐条比对；正确性 85 分，速度 15 分。</p>' +
          '<div class="stats">' +
            '<span class="stat"><b>' + tasks.length + '</b> 道题</span>' +
            '<span class="stat"><b>' + (tasks.reduce(function (n, t) { return n + t.tests.length; }, 0)) + '</b> 个用例</span>' +
            '<span class="stat"><b>3</b> 档难度</span>' +
            '<span class="stat"><b>85 + 15</b> 评分</span>' +
            '<span class="stat"><b>' + solvedCount() + '</b> 已通过</span>' +
          '</div>' +
          '<div class="hero-note"><span>真实 Worker 执行</span><span>逐用例比对</span><span>本地保存进度</span><span>可看解析复盘</span></div>' +
        '</div>' +
      '</section>' +
      '<div class="bank-head">' +
        '<div class="tabs" role="tablist" aria-label="难度筛选">' +
          tabButton('all', '全部', tasks.length) +
          tabButton('basic', '入门', levelCount('basic')) +
          tabButton('medium', '进阶', levelCount('medium')) +
          tabButton('hard', '挑战', levelCount('hard')) +
        '</div>' +
        '<span class="bank-hint">先运行公开样例，再提交隐藏用例</span>' +
      '</div>' +
      '<div class="bug-grid">' + (cards || '<div class="empty">这一档暂时没有题目。</div>') + '</div>' +
      '<div class="bank-note">题面取材于书单中的 JavaScript 教材，错误类型包括：条件写反、边界漏判、大小写、join 分隔符、浅拷贝、排序不稳定、Map 顺序、贪心失效等。每题都有可运行的修复代码与解析，提交后解锁。</div>' +
    '</div>';
    updateTop();
    document.title = 'JavaScript 改错实验室 · 18 题';
    window.scrollTo(0, 0);
  }

  function tabButton(key, label, count) {
    return '<button class="tab' + (state.filter === key ? ' active' : '') + '" type="button" role="tab" aria-selected="' + (state.filter === key) + '" data-filter="' + key + '">' +
      label + '<span>' + count + '</span></button>';
  }

  function renderTask(id) {
    var task = taskById(id);
    if (!task) { renderBank(); return; }
    if (!state.current || state.current.id !== id) state.hints = 0;
    state.current = task;
    state.analysisShown = false;
    state.submitted = !!state.best[task.id];
    state.lastResults = null;
    state.lastMode = '';
    state.lastScore = null;
    stopWorker();

    var level = levelOf(task);
    var best = state.best[task.id];
    var code = state.drafts[task.id] != null ? state.drafts[task.id] : task.code;
    var cases = publicCases(task);
    var caseList = cases.map(function (test, index) {
      return '<div class="case-line"><b>#' + (index + 1) + '</b><div><span>输入</span><code>' + escapeHTML(fmt(test.args)) + '</code><span>期望</span><code>' + escapeHTML(fmt(test.expected)) + '</code></div></div>';
    }).join('');
    var hintList = (task.hints || []).slice(0, state.hints).map(function (hint) {
      return '<li>' + inline(hint) + '</li>';
    }).join('');

    $('#content').innerHTML = '<div class="task-shell">' +
      '<aside class="brief">' +
        '<a class="back" href="#bank"><span aria-hidden="true">←</span> 返回题库</a>' +
        '<div class="task-eyebrow"><span class="level level-' + escapeHTML(task.level) + '">' + level.label + '</span><span>' + level.short + String(task.order).padStart(2, '0') + '</span><span>' + escapeHTML(task.minutes) + ' 分钟</span></div>' +
        '<h1>' + escapeHTML(task.title) + '</h1>' +
        '<p class="prompt">' + inline(task.prompt) + '</p>' +
        '<div class="source-line"><b>取材</b>' + escapeHTML(task.source) + '</div>' +
        '<div class="bug-note"><b>故障现象</b><p>' + inline(task.summary) + '</p></div>' +
        '<section class="brief-block"><div class="block-head"><h2>公开样例</h2><span>' + cases.length + ' 条可见</span></div>' +
          '<div class="case-list">' + caseList + '</div>' +
          '<p class="block-note">还有 1 条隐藏用例，提交后才会显示结果。</p>' +
        '</section>' +
        '<section class="brief-block"><div class="block-head"><h2>提示</h2><span id="hintCount">' + state.hints + ' / ' + task.hints.length + '</span></div>' +
          '<ul class="hint-list" id="hintList">' + (hintList || '<li class="hint-empty">先自己定位，再看提示。</li>') + '</ul>' +
          '<button class="hint-btn" type="button" id="hintBtn"' + (state.hints >= task.hints.length ? ' disabled' : '') + '>看下一条提示</button>' +
        '</section>' +
        '<div class="best-card"><span>本题最佳</span><b>' + (best ? best.score + ' 分' : '—') + '</b><small>' + (best ? '已提交 ' + best.passed + ' / ' + best.total + ' 用例' : '提交后记录正确率与耗时') + '</small></div>' +
      '</aside>' +
      '<main class="workbench">' +
        '<div class="editor-head"><div class="editor-file"><i></i><i></i><i></i><span>solve.js</span></div><span class="run-status" id="runStatus">就绪</span></div>' +
        '<div class="editor-wrap"><div class="gutter" id="gutter" aria-hidden="true"></div><textarea class="code-input" id="codeInput" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" aria-label="JavaScript 代码编辑器">' + escapeHTML(code) + '</textarea></div>' +
        '<div class="run-bar"><div class="run-actions">' +
          '<button class="run-btn primary" type="button" id="runBtn"><span aria-hidden="true">▶</span> 运行公开样例</button>' +
          '<button class="run-btn" type="button" id="submitBtn"><span aria-hidden="true">✓</span> 提交评分</button>' +
          '<button class="run-btn ghost" type="button" id="resetBtn">重置代码</button>' +
        '</div><div class="run-meta"><span id="runTimer">0 ms</span><span>⌘/Ctrl + Enter 运行</span></div></div>' +
        '<div class="result-area" id="resultArea"><div class="result-empty"><b>还没有运行</b><p>修好代码后先点「运行公开样例」，通过后再提交；提交会运行全部用例并计算分数。</p></div></div>' +
        '<section class="analysis" id="analysis"' + (state.analysisShown ? '' : ' hidden') + '></section>' +
      '</main>' +
    '</div>' +
    '<div class="task-foot"><a href="#bank">← 题库</a><span>进度保存在本机，不会上传代码。</span></div>';

    var textarea = $('#codeInput');
    textarea.value = code;
    refreshGutter();
    textarea.addEventListener('input', function () {
      state.drafts[task.id] = textarea.value;
      saveJSON(DRAFT_KEY, state.drafts);
      refreshGutter();
    });
    textarea.addEventListener('scroll', function () { $('#gutter').scrollTop = textarea.scrollTop; });
    textarea.addEventListener('keydown', function (event) {
      if (event.key === 'Tab') {
        event.preventDefault();
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        textarea.value = textarea.value.slice(0, start) + '  ' + textarea.value.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        textarea.dispatchEvent(new Event('input'));
      }
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        if (state.running) return;
        runTests(event.shiftKey ? 'submit' : 'run');
      }
    });
    $('#runBtn').addEventListener('click', function () { runTests('run'); });
    $('#submitBtn').addEventListener('click', function () { runTests('submit'); });
    $('#resetBtn').addEventListener('click', function () {
      textarea.value = task.code;
      state.drafts[task.id] = task.code;
      saveJSON(DRAFT_KEY, state.drafts);
      refreshGutter();
      clearResults();
      showToast('已恢复题目初始代码');
    });
    $('#hintBtn').addEventListener('click', function () {
      if (state.hints >= task.hints.length) return;
      state.hints += 1;
      var list = $('#hintList');
      var empty = list.querySelector('.hint-empty');
      if (empty) empty.remove();
      var li = document.createElement('li');
      li.innerHTML = inline(task.hints[state.hints - 1]);
      list.appendChild(li);
      $('#hintCount').textContent = state.hints + ' / ' + task.hints.length;
      if (state.hints >= task.hints.length) $('#hintBtn').disabled = true;
    });
    updateTop();
    document.title = task.title + ' · JavaScript 改错实验室';
    window.scrollTo(0, 0);
  }

  function refreshGutter() {
    var textarea = $('#codeInput');
    var gutter = $('#gutter');
    if (!textarea || !gutter) return;
    var count = textarea.value.split('\n').length;
    var lines = [];
    for (var i = 1; i <= count; i += 1) lines.push('<span>' + i + '</span>');
    gutter.innerHTML = lines.join('');
    gutter.scrollTop = textarea.scrollTop;
  }

  function setRunning(running) {
    state.running = running;
    var runBtn = $('#runBtn');
    var submitBtn = $('#submitBtn');
    var status = $('#runStatus');
    if (runBtn) runBtn.disabled = running;
    if (submitBtn) submitBtn.disabled = running;
    if (status) status.textContent = running ? '运行中…' : '就绪';
  }

  function stopWorker() {
    state.runToken += 1;
    if (state.worker) {
      try { state.worker.terminate(); } catch (err) {}
      state.worker = null;
    }
    window.clearTimeout(state.timer);
    state.timer = 0;
    setRunning(false);
  }

  function clearResults() {
    state.lastResults = null;
    state.lastScore = null;
    var area = $('#resultArea');
    if (area) area.innerHTML = '<div class="result-empty"><b>还没有运行</b><p>修好代码后先点「运行公开样例」，通过后再提交；提交会运行全部用例并计算分数。</p></div>';
    var analysis = $('#analysis');
    if (analysis) { analysis.hidden = true; analysis.innerHTML = ''; }
    state.analysisShown = false;
  }

  function runTests(mode) {
    if (state.running || !state.current) return;
    var task = state.current;
    var code = $('#codeInput').value;
    var cases = mode === 'submit' ? task.tests.slice() : publicCases(task);
    state.lastMode = mode;
    state.runToken += 1;
    var token = state.runToken;
    if (state.worker) {
      try { state.worker.terminate(); } catch (err) {}
      state.worker = null;
    }
    window.clearTimeout(state.timer);
    setRunning(true);
    var startedAt = performance.now();
    updateTimer(0);
    var worker;
    try {
      worker = new Worker(new URL('../assets/js/javascript-foundations/js-debug-worker.js?v=20261125z65', window.location.href));
    } catch (err) {
      setRunning(false);
      showFatal('无法启动执行器', String(err && err.message || err));
      return;
    }
    state.worker = worker;
    var timer = window.setInterval(function () { updateTimer(performance.now() - startedAt); }, 40);
    state.timer = timer;
    var timeout = window.setTimeout(function () {
      if (token !== state.runToken) return;
      window.clearInterval(timer);
      try { worker.terminate(); } catch (err) {}
      state.worker = null;
      setRunning(false);
      showFatal('执行超时（7 秒）', '代码可能在死循环，或某个用例的计算量过大。先检查 while/for 的终止条件，再缩小输入。');
    }, 7000);

    worker.onmessage = function (event) {
      if (token !== state.runToken) return;
      window.clearTimeout(timeout);
      window.clearInterval(timer);
      setRunning(false);
      try { worker.terminate(); } catch (err) {}
      state.worker = null;
      var payload = event.data || {};
      if (payload.fatal) {
        showFatal(payload.fatal.message || '代码执行失败', '错误类型：' + (payload.fatal.name || 'Error') + (payload.logs && payload.logs.length ? '\n\nconsole 输出：\n' + payload.logs.join('\n') : ''));
        return;
      }
      state.lastResults = payload;
      renderResults(payload, mode, task);
    };
    worker.onerror = function (event) {
      if (token !== state.runToken) return;
      window.clearTimeout(timeout);
      window.clearInterval(timer);
      setRunning(false);
      try { worker.terminate(); } catch (err) {}
      state.worker = null;
      showFatal('执行器报错', event.message || 'Worker 内部错误');
    };
    worker.postMessage({ code: code, cases: cases });
  }

  function updateTimer(ms) {
    var node = $('#runTimer');
    if (node) node.textContent = Math.max(0, Math.round(ms)) + ' ms';
  }

  function showFatal(title, detail) {
    state.lastResults = { fatal: { message: title } };
    var area = $('#resultArea');
    if (area) {
      area.innerHTML = '<div class="fatal"><b>' + escapeHTML(title) + '</b><pre>' + escapeHTML(detail || '') + '</pre><p>改完再试一次；如果代码没问题，检查是否保留了 <code>solve</code> 函数名。</p></div>';
    }
    state.lastScore = null;
  }

  function renderResults(payload, mode, task) {
    var results = payload.results || [];
    var passed = results.filter(function (item) { return item.passed; }).length;
    var total = results.length;
    var totalMs = payload.totalMs != null ? payload.totalMs : results.reduce(function (n, item) { return n + (item.ms || 0); }, 0);
    var isSubmit = mode === 'submit';
    var score = null;
    var speed = 0;
    if (isSubmit) {
      var correctness = total ? passed / total * 85 : 0;
      if (passed === total && total > 0) {
        var target = Math.max(1, task.targetMs || 12);
        speed = Math.min(15, 15 * target / Math.max(totalMs, 0.1));
      }
      score = Math.round(correctness + speed);
      state.lastScore = { score: score, passed: passed, total: total, ms: totalMs };
      var previous = state.best[task.id];
      if (!previous || score > previous.score || (score === previous.score && totalMs < previous.ms)) {
        state.best[task.id] = { score: score, passed: passed, total: total, ms: totalMs, at: Date.now() };
        saveJSON(STORE_KEY, state.best);
      }
      state.submitted = true;
      updateTop();
      var bestNode = $('.best-card');
      if (bestNode) {
        var saved = state.best[task.id] || { score: score, passed: passed, total: total };
        bestNode.innerHTML = '<span>本题最佳</span><b>' + saved.score + ' 分</b><small>已提交 ' + saved.passed + ' / ' + saved.total + ' 用例</small>';
      }
    }

    var rows = results.map(function (item, index) {
      var status = item.passed ? 'pass' : 'fail';
      var label = item.public ? '公开' : '隐藏';
      return '<div class="test-row ' + status + '">' +
        '<div class="test-state">' + (item.passed ? '✓' : '✕') + '</div>' +
        '<div class="test-body"><div class="test-title"><b>用例 ' + (index + 1) + '</b><span class="test-tag">' + label + '</span><span class="test-name">' + escapeHTML(item.label) + '</span><span class="test-ms">' + Number(item.ms || 0).toFixed(1) + ' ms</span></div>' +
          '<div class="test-io"><span>输入</span><code>' + escapeHTML(fmt(item.args)) + '</code></div>' +
          '<div class="test-io"><span>期望</span><code>' + escapeHTML(item.expectedText) + '</code></div>' +
          '<div class="test-io actual"><span>实际</span><code>' + escapeHTML(item.actualText) + '</code></div>' +
          (item.error ? '<div class="test-error">' + escapeHTML(item.error) + '</div>' : '') +
        '</div>' +
      '</div>';
    }).join('');

    var summary = '<div class="result-summary ' + (passed === total ? 'ok' : 'no') + '">' +
      '<div><span class="summary-kicker">' + (isSubmit ? '提交结果' : '公开样例') + '</span><b>' + passed + ' / ' + total + '</b><small>' + (isSubmit ? (passed === total ? '全部用例通过' : '还有用例未通过') : '公开用例通过数') + '</small></div>' +
      (isSubmit ? '<div class="score-box"><span>本题得分</span><b>' + score + '</b><small>正确性 ' + Math.round(total ? passed / total * 85 : 0) + ' + 速度 ' + Math.round(speed) + '</small></div>' : '') +
      '<div class="time-box"><span>总耗时</span><b>' + Number(totalMs).toFixed(1) + '</b><small>毫秒</small></div>' +
    '</div>';

    var logs = (payload.logs && payload.logs.length) ? '<div class="log-box"><b>console 输出</b><pre>' + escapeHTML(payload.logs.join('\n')) + '</pre></div>' : '';
    var area = $('#resultArea');
    area.innerHTML = summary + logs + '<div class="test-list">' + rows + '</div>' +
      (isSubmit && passed === total ? '<div class="pass-note">通过。可以点「查看解析」对照修复思路，或回到题库继续下一题。</div>' :
        (isSubmit ? '<div class="fail-note">先看失败用例的「实际」和「期望」差在哪里，再决定改条件、边界还是数据结构。</div>' : '<div class="run-note">公开样例通过后再提交；提交会额外运行 1 条隐藏用例。</div>'));
    renderAnalysisButton(task, isSubmit);
  }

  function renderAnalysisButton(task, isSubmit) {
    var analysis = $('#analysis');
    if (!analysis) return;
    var canShow = state.submitted || isSubmit;
    analysis.innerHTML = '<div class="analysis-head"><h2>解析与修复对照</h2><button class="analysis-btn" type="button" id="analysisBtn"' + (canShow ? '' : ' disabled') + '>' + (state.analysisShown ? '收起解析' : '查看解析') + '</button></div>' +
      '<div class="analysis-body"' + (state.analysisShown ? '' : ' hidden') + '>' +
        '<p>' + inline(task.analysis) + '</p>' +
        '<div class="fixed-code"><div class="fixed-head"><span>参考修复</span><button type="button" class="copy-btn" data-copy="' + escapeHTML(encodeURIComponent(task.fixed)) + '">复制</button></div><pre><code>' + escapeHTML(task.fixed) + '</code></pre></div>' +
        '<p class="analysis-note">参考实现不是唯一答案；只要通过全部用例且没有副作用，你的写法同样有效。</p>' +
      '</div>';
    analysis.hidden = false;
    var btn = $('#analysisBtn');
    if (btn) btn.addEventListener('click', function () {
      state.analysisShown = !state.analysisShown;
      $('.analysis-body').hidden = !state.analysisShown;
      btn.textContent = state.analysisShown ? '收起解析' : '查看解析';
    });
    var copy = $('.copy-btn');
    if (copy) copy.addEventListener('click', function () {
      copyText(decodeURIComponent(copy.getAttribute('data-copy') || '')).then(function () {
        copy.textContent = '已复制';
        showToast('修复代码已复制');
        window.setTimeout(function () { copy.textContent = '复制'; }, 1500);
      }).catch(function () { showToast('复制失败，请手动选择'); });
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', 'readonly');
      area.style.position = 'fixed';
      area.style.left = '-9999px';
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); resolve(); } catch (err) { reject(err); }
      document.body.removeChild(area);
    });
  }

  function route() {
    var hash = (window.location.hash || '').replace(/^#/, '');
    if (hash.indexOf('task/') === 0) {
      renderTask(hash.slice(5));
      return;
    }
    renderBank();
  }

  function init() {
    if (!tasks.length) {
      $('#content').innerHTML = '<div class="empty">题库数据未载入。请检查 assets/js/javascript-foundations/js-debug-data.js。</div>';
      return;
    }
    document.addEventListener('click', function (event) {
      var tab = event.target.closest('[data-filter]');
      if (!tab) return;
      state.filter = tab.getAttribute('data-filter');
      renderBank();
    });
    window.addEventListener('hashchange', route);
    route();
  }

  init();
})();

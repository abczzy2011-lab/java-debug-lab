/* C++ 改错实验室：102 题、原地修复、Judge0 GCC 14.1 真实编译、逐用例评分 */
(function () {
  'use strict';

  var BANK = window.CPP_DEBUG_TASKS;
  var tasks = BANK && Array.isArray(BANK.tasks) ? BANK.tasks.slice() : [];
  var LEVELS = {
    basic: { label: '入门', short: 'B', note: '循环、边界与输入输出' },
    medium: { label: '进阶', short: 'M', note: '容器、算法与字符串' },
    hard: { label: '挑战', short: 'H', note: '图、动态规划与大数' }
  };
  var STORE_KEY = 'cppDebug.best.v1';
  var DRAFT_KEY = 'cppDebug.drafts.v1';
  var state = {
    filter: 'all',
    status: 'all',
    query: '',
    current: null,
    best: loadJSON(STORE_KEY, {}),
    drafts: loadJSON(DRAFT_KEY, {}),
    hints: 0,
    analysisShown: false,
    submitted: false,
    running: false,
    runToken: 0,
    controller: null,
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
  function showToast(message) {
    var toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () { toast.classList.remove('show'); }, 2200);
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
  function updateTop() {
    var count = $('#topSolved');
    if (count) count.textContent = solvedCount() + ' / ' + tasks.length;
  }
  function normalizeOutput(value) {
    return String(value == null ? '' : value)
      .replace(/\r\n/g, '\n').replace(/\r/g, '\n')
      .split('\n').map(function (line) { return line.replace(/[ \t]+$/g, ''); })
      .join('\n').replace(/\n+$/g, '');
  }
  function compareOutput(actual, expected) {
    return normalizeOutput(actual) === normalizeOutput(expected);
  }
  function fmtText(value) {
    return String(value == null ? '' : value).replace(/\n/g, ' ↵ ');
  }
  function round1(n) { return Math.round((Number(n) || 0) * 10) / 10; }

  function matchQuery(task, query) {
    var q = String(query || '').trim().toLowerCase();
    if (!q) return true;
    return [task.id, task.title, task.summary, task.prompt, task.source, task.level, task.order]
      .join(' ').toLowerCase().indexOf(q) >= 0;
  }
  function visibleTasks() {
    var rank = { basic: 0, medium: 1, hard: 2 };
    return tasks.filter(function (task) {
      if (state.filter !== 'all' && task.level !== state.filter) return false;
      var best = state.best[task.id];
      var done = !!(best && best.score >= 85);
      if (state.status === 'todo' && done) return false;
      if (state.status === 'done' && !done) return false;
      return matchQuery(task, state.query);
    }).slice().sort(function (a, b) {
      return (rank[a.level] - rank[b.level]) || (a.order - b.order);
    });
  }
  function statusCount(status) {
    if (status === 'done') return solvedCount();
    if (status === 'todo') return tasks.length - solvedCount();
    return tasks.length;
  }
  function emptyBank() {
    if (state.query.trim()) return '<div class="empty"><b>没有匹配的题目</b><p>换个关键词，或清空搜索回到全部 ' + tasks.length + ' 题。</p><button class="clear-btn" type="button" data-clear-filters>清空筛选</button></div>';
    if (state.status === 'done') return '<div class="empty"><b>这一档还没有通过的题</b><p>先运行公开样例，再提交评分。</p></div>';
    if (state.status === 'todo') return '<div class="empty"><b>这一档已经全部通过</b><p>可以切到「已通过」回看，或挑战另一档难度。</p></div>';
    return '<div class="empty">这一档暂时没有题目。</div>';
  }

  function renderBank() {
    state.current = null;
    state.lastResults = null;
    stopRun();
    var visible = visibleTasks();
    var groups = ['basic', 'medium', 'hard'].map(function (levelId) {
      var level = LEVELS[levelId];
      var group = visible.filter(function (task) { return task.level === levelId; });
      if (!group.length) return '';
      var cards = group.map(function (task) {
        var best = state.best[task.id];
        var done = !!(best && best.score >= 85);
        var status = best ? (done ? '已通过 · ' + best.score + ' 分' : '最佳 ' + best.score + ' 分') : '未开始';
        return '<a class="bug-card' + (done ? ' is-done' : '') + '" href="#task/' + escapeHTML(task.id) + '">' +
          '<div class="card-top"><span class="level level-' + escapeHTML(task.level) + '">' + level.label + '</span>' +
            '<span class="card-no">' + level.short + String(task.order).padStart(2, '0') + '</span></div>' +
          '<h2>' + escapeHTML(task.title) + '</h2>' +
          '<p>' + inline(task.summary) + '</p>' +
          '<div class="card-meta"><span>' + escapeHTML(task.minutes) + ' 分钟</span><span class="' + (done ? 'is-pass' : '') + '">' + escapeHTML(status) + '</span></div>' +
          '<div class="card-foot"><span>' + task.tests.length + ' 个用例</span><span>' + (done ? '再练一次' : '开始改错') + ' <b aria-hidden="true">→</b></span></div>' +
        '</a>';
      }).join('');
      return '<section class="level-section" aria-labelledby="level-' + levelId + '">' +
        '<div class="level-head"><div><span class="level-kicker">' + level.short + ' · ' + level.note + '</span><h2 id="level-' + levelId + '">' + level.label + '</h2></div>' +
          '<span class="level-count">' + group.length + ' 题 · 完成 ' + group.filter(function (task) { var b = state.best[task.id]; return b && b.score >= 85; }).length + '</span></div>' +
        '<div class="bug-grid">' + cards + '</div></section>';
    }).join('');
    var done = solvedCount();
    var pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;
    var firstUndone = visible.filter(function (task) { var b = state.best[task.id]; return !(b && b.score >= 85); })[0] || visible[0] || tasks.filter(function (task) { var b = state.best[task.id]; return !(b && b.score >= 85); })[0] || tasks[0];
    $('#content').innerHTML = '<div class="bank">' +
      '<section class="hero">' +
        '<div class="hero-inner">' +
          '<div class="kicker">C++ · DEBUG LAB · ' + tasks.length + ' TASKS</div>' +
          '<h1>C++ 改错实验室</h1>' +
          '<p class="sub">不是选择题。每题给你一段带 bug 的 <code>main.cpp</code>，在编辑器里原地修，提交后由 GCC 14.1 按 <strong>C++20</strong> 真实编译运行，按 <strong>公开 + 隐藏用例</strong>逐条比对；正确性 85 分，速度 15 分。</p>' +
          '<div class="hero-progress"><div class="hero-progress-head"><span>整体进度</span><b>' + done + ' / ' + tasks.length + '</b></div><div class="hero-progress-track"><i style="width:' + pct + '%"></i></div><span class="hero-progress-note">三档各 ' + (tasks.length / 3) + ' 题 · 已通过 ' + pct + '%</span></div>' +
          '<div class="stats">' +
            '<span class="stat"><b>' + tasks.length + '</b> 道题</span>' +
            '<span class="stat"><b>' + (tasks.reduce(function (n, t) { return n + t.tests.length; }, 0)) + '</b> 个用例</span>' +
            '<span class="stat"><b>3</b> 档难度</span>' +
            '<span class="stat"><b>85 + 15</b> 评分</span>' +
            '<span class="stat"><b>' + solvedCount() + '</b> 已通过</span>' +
          '</div>' +
          '<div class="hero-actions"><a class="hero-btn primary" href="#task/' + escapeHTML(firstUndone.id) + '">' + (done < tasks.length ? '继续未完成' : '从第一题开始') + ' <span aria-hidden="true">→</span></a><button class="hero-btn" type="button" data-scroll-rules>评分规则</button><a class="hero-btn" href="./cpp-api.html?v=20261128z117">API 速查 <span aria-hidden="true">→</span></a></div>' +
          '<div class="hero-note"><span>真实 Judge0 执行</span><span>逐用例比对</span><span>本地保存进度</span><span>可看解析复盘</span></div>' +
        '</div>' +
      '</section>' +
      '<div class="bank-toolbar">' +
        '<div class="bank-search-row"><label class="search-box" for="debugSearch"><span class="search-icon" aria-hidden="true"></span><input id="debugSearch" type="search" autocomplete="off" spellcheck="false" placeholder="搜索故障、题名或题号，例如 边界、b13、字符串" value="' + escapeHTML(state.query) + '" aria-label="搜索改错题"><kbd>/</kbd></label>' +
          '<div class="status-tabs" role="group" aria-label="按完成状态筛选">' +
            '<button type="button" class="' + (state.status === 'all' ? 'active' : '') + '" data-status="all">全部 <b>' + statusCount('all') + '</b></button>' +
            '<button type="button" class="' + (state.status === 'todo' ? 'active' : '') + '" data-status="todo">未完成 <b>' + statusCount('todo') + '</b></button>' +
            '<button type="button" class="' + (state.status === 'done' ? 'active' : '') + '" data-status="done">已通过 <b>' + statusCount('done') + '</b></button>' +
          '</div></div>' +
        '<div class="bank-filter-row"><div class="tabs" role="tablist" aria-label="难度筛选">' +
          tabButton('all', '全部难度', tasks.length) + tabButton('basic', '入门', levelCount('basic')) + tabButton('medium', '进阶', levelCount('medium')) + tabButton('hard', '挑战', levelCount('hard')) +
        '</div><span class="bank-hint">当前显示 <b>' + visible.length + '</b> 题 · 先跑公开样例，再提交全部用例</span></div>' +
      '</div>' +
      (groups || emptyBank()) +
      '<div class="rules-card" id="debugRules"><div><span class="kicker">SCORING · 100</span><h2>正确性优先，速度只在全过后计算</h2></div><div class="rules-grid"><div><b>85</b><span>公开 + 隐藏用例</span><p>按通过比例给分；编译失败记 0 分，运行异常或超时按未通过处理。</p></div><div><b>15</b><span>速度分</span><p>全部用例通过后，总运行时间越接近该题基准值，速度分越高。</p></div><div><b>3</b><span>组固定用例</span><p>第一组公开，后两组隐藏；提交后逐条显示输入、期望和实际输出。</p></div></div></div>' +
      '<div class="bank-note">题面取材于 8 本 C++ 教材，错误类型覆盖循环边界、整数除法、getline、unique 去重、栈顶配对、闰年规则、排序键、最大堆、背包遍历方向、图遍历与动态规划。每题都有可运行的参考修复与解析，提交后解锁。</div>' +
    '</div>';
    updateTop();
    document.title = 'C++ 改错实验室 · ' + tasks.length + ' 题';
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
    stopRun();

    var level = levelOf(task);
    var best = state.best[task.id];
    var code = state.drafts[task.id] != null ? state.drafts[task.id] : task.code;
    var cases = publicCases(task);
    var caseList = cases.map(function (test, index) {
      return '<div class="case-line"><b>#' + (index + 1) + '</b><div><span>stdin</span><code>' + escapeHTML(fmtText(test.stdin)) + '</code><span>期望</span><code>' + escapeHTML(fmtText(test.expected)) + '</code></div></div>';
    }).join('');
    var hintList = (task.hints || []).slice(0, state.hints).map(function (hint) {
      return '<li>' + inline(hint) + '</li>';
    }).join('');
    var rank = { basic: 0, medium: 1, hard: 2 };
    var ordered = tasks.slice().sort(function (a, b) { return (rank[a.level] - rank[b.level]) || (a.order - b.order); });
    var pos = ordered.findIndex(function (item) { return item.id === task.id; });
    var prev = ordered[(pos - 1 + ordered.length) % ordered.length];
    var next = ordered[(pos + 1) % ordered.length];

    $('#content').innerHTML = '<div class="task-topnav"><a class="back" href="#bank"><span aria-hidden="true">←</span> 返回题库</a>' +
      '<span class="task-topnav-mid">' + level.short + String(task.order).padStart(2, '0') + ' / ' + tasks.length + ' · ' + level.label + '</span>' +
      '<div class="task-topnav-links"><a class="api-quick" href="./cpp-api.html?v=20261128z117" aria-label="打开站内 C++ API 速查">API 速查</a><a href="#task/' + escapeHTML(prev.id) + '" aria-label="上一题 ' + escapeHTML(prev.title) + '">← 上一题</a><a href="#task/' + escapeHTML(next.id) + '" aria-label="下一题 ' + escapeHTML(next.title) + '">下一题 →</a></div></div>' +
      '<div class="task-shell">' +
      '<aside class="brief">' +
        '<div class="task-eyebrow"><span class="level level-' + escapeHTML(task.level) + '">' + level.label + '</span><span>' + level.short + String(task.order).padStart(2, '0') + '</span><span>' + escapeHTML(task.minutes) + ' 分钟</span></div>' +
        '<h1>' + escapeHTML(task.title) + '</h1>' +
        '<p class="prompt">' + inline(task.prompt) + '</p>' +
        '<div class="source-line"><b>取材：</b>' + escapeHTML(task.source) + '</div>' +
        '<div class="bug-note"><b>故障现象</b><p>' + inline(task.summary) + '</p></div>' +
        '<section class="brief-block"><div class="block-head"><h2>公开样例</h2><span>' + cases.length + ' 条可见</span></div>' +
          '<div class="case-list">' + caseList + '</div>' +
          '<p class="block-note">还有 ' + (task.tests.length - cases.length) + ' 条隐藏用例，提交后才会显示结果。</p>' +
        '</section>' +
        '<section class="brief-block"><div class="block-head"><h2>提示</h2><span id="hintCount">' + state.hints + ' / ' + task.hints.length + '</span></div>' +
          '<ul class="hint-list" id="hintList">' + (hintList || '<li class="hint-empty">先自己定位，再看提示。</li>') + '</ul>' +
          '<button class="hint-btn" type="button" id="hintBtn"' + (state.hints >= task.hints.length ? ' disabled' : '') + '>看下一条提示</button>' +
        '</section>' +
        '<div class="best-card"><span>本题最佳</span><b>' + (best ? best.score + ' 分' : '—') + '</b><small>' + (best ? '已提交 ' + best.passed + ' / ' + best.total + ' 用例' : '提交后记录正确率与耗时') + '</small></div>' +
      '</aside>' +
      '<main class="workbench">' +
        '<div class="editor-head"><div class="editor-file"><i></i><i></i><i></i><span>main.cpp</span></div><span class="run-status" id="runStatus">就绪</span></div>' +
        '<div class="editor-wrap"><div class="gutter" id="gutter" aria-hidden="true"></div><textarea class="code-input" id="codeInput" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" aria-label="C++ 代码编辑器">' + escapeHTML(code) + '</textarea></div>' +
        '<div class="run-bar"><div class="run-actions">' +
          '<button class="run-btn primary" type="button" id="runBtn"><span aria-hidden="true">▶</span> 运行公开样例</button>' +
          '<button class="run-btn" type="button" id="submitBtn"><span aria-hidden="true">✓</span> 提交评分</button>' +
          '<button class="run-btn ghost" type="button" id="resetBtn">重置代码</button>' +
        '</div><div class="run-meta"><span id="runTimer">0 ms</span><span>⌘/Ctrl + Enter 运行 · Shift + Enter 提交</span></div></div>' +
        '<div class="result-area" id="resultArea"><div class="result-empty"><b>还没有运行</b><p>修好代码后先点「运行公开样例」，通过后再提交；提交会运行全部用例并计算分数。</p></div></div>' +
        '<section class="analysis" id="analysis"' + (state.analysisShown ? '' : ' hidden') + '></section>' +
      '</main>' +
    '</div>' +
    '<div class="task-foot"><div class="task-foot-links"><a href="#task/' + escapeHTML(prev.id) + '">← ' + escapeHTML(prev.title) + '</a><a href="#task/' + escapeHTML(next.id) + '">' + escapeHTML(next.title) + ' →</a></div><span>代码只发送到 Judge0 编译运行；草稿与成绩保存在本机。</span></div>';

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
        textarea.value = textarea.value.slice(0, start) + '    ' + textarea.value.slice(end);
        textarea.selectionStart = textarea.selectionEnd = start + 4;
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
    document.title = task.title + ' · C++ 改错实验室';
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

  function stopRun() {
    state.runToken += 1;
    if (state.controller) {
      try { state.controller.abort(); } catch (err) {}
      state.controller = null;
    }
    window.clearInterval(state.timer);
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

  function encodeBase64(text) {
    var bytes = new TextEncoder().encode(String(text == null ? '' : text));
    var binary = '';
    var chunk = 0x8000;
    for (var i = 0; i < bytes.length; i += chunk) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    }
    return btoa(binary);
  }
  function decodeBase64(value) {
    if (!value) return '';
    try {
      var binary = atob(String(value));
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    } catch (err) { return String(value); }
  }

  async function executeCase(code, stdin, expected, token) {
    var params = new URLSearchParams(window.location.search);
    var override = (params.get('judge') || '').trim();
    var endpoint = (/^https?:\/\//i.test(override) ? override : 'https://ce.judge0.com').replace(/\/+$/, '');
    if (token !== state.runToken) throw new Error('已取消');
    var controller = new AbortController();
    state.controller = controller;
    var timer = window.setTimeout(function () { controller.abort(); }, 30000);
    try {
      var response = await fetch(endpoint + '/submissions?base64_encoded=true&wait=true', {
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
      });
      if (!response.ok) throw new Error('判题节点返回 HTTP ' + response.status);
      var data = await response.json();
      var status = (data.status && data.status.description) || 'Unknown';
      var stdout = decodeBase64(data.stdout);
      var stderr = decodeBase64(data.stderr);
      var compileOutput = decodeBase64(data.compile_output);
      var timeMs = Number.isFinite(Number(data.time_ms))
        ? Number(data.time_ms)
        : Math.round((parseFloat(data.time) || 0) * 1000);
      return {
        status: status,
        stdout: stdout,
        stderr: stderr,
        compileOutput: compileOutput,
        timeMs: Math.max(0, timeMs),
        passed: status === 'Accepted' && compareOutput(stdout, expected)
      };
    } finally {
      window.clearTimeout(timer);
      if (state.controller === controller) state.controller = null;
    }
  }

  function updateTimer(ms) {
    var node = $('#runTimer');
    if (node) node.textContent = Math.max(0, Math.round(ms)) + ' ms';
  }

  function showFatal(title, detail) {
    state.lastResults = { fatal: true };
    var area = $('#resultArea');
    if (area) {
      area.innerHTML = '<div class="fatal"><b>' + escapeHTML(title) + '</b><pre>' + escapeHTML(detail || '') + '</pre><p>检查网络后重试；如果只是代码问题，先看「运行公开样例」的编译器诊断。</p></div>';
    }
    state.lastScore = null;
  }

  async function runTests(mode) {
    if (state.running || !state.current) return;
    var task = state.current;
    var code = $('#codeInput').value;
    if (!code.trim()) { showToast('先写一点 C++ 代码。'); return; }
    var cases = mode === 'submit' ? task.tests.slice() : publicCases(task);
    state.lastMode = mode;
    state.runToken += 1;
    var token = state.runToken;
    state.running = true;
    setRunning(true);
    window.clearInterval(state.timer);
    var startedAt = performance.now();
    updateTimer(0);
    state.timer = window.setInterval(function () { updateTimer(performance.now() - startedAt); }, 50);

    var area = $('#resultArea');
    if (area) area.innerHTML = '<div class="result-empty"><b>正在编译 main.cpp</b><p>GCC 14.1 · C++20 · 逐条运行 ' + cases.length + ' 个用例…</p></div>';

    var results = [];
    var compileFailure = false;
    try {
      for (var i = 0; i < cases.length; i++) {
        if (token !== state.runToken) return;
        var tc = cases[i];
        var status = $('#runStatus');
        if (status) status.textContent = '运行 ' + (i + 1) + ' / ' + cases.length;
        var result = await executeCase(code, tc.stdin, tc.expected, token);
        if (token !== state.runToken) return;
        results.push({ result: result, test: tc });
        if (result.status === 'Compilation Error') { compileFailure = true; break; }
      }
      if (token !== state.runToken) return;
      window.clearInterval(state.timer);
      state.timer = 0;
      var totalMs = results.reduce(function (n, item) { return n + (item.result.timeMs || 0); }, 0);
      var payload = { results: results, totalMs: totalMs, compileFailure: compileFailure };
      state.lastResults = payload;
      renderResults(payload, mode, task);
    } catch (err) {
      if (token !== state.runToken) return;
      window.clearInterval(state.timer);
      state.timer = 0;
      showFatal('没有拿到判题结果', String(err && err.message ? err.message : err || '未知错误'));
    } finally {
      if (token === state.runToken) {
        state.running = false;
        state.controller = null;
        setRunning(false);
        window.clearInterval(state.timer);
        state.timer = 0;
      }
    }
  }

  function renderResults(payload, mode, task) {
    var results = payload.results || [];
    var passed = results.filter(function (item) { return item.result.passed; }).length;
    var total = mode === 'submit' ? task.tests.length : results.length;
    var totalMs = payload.totalMs != null ? payload.totalMs : results.reduce(function (n, item) { return n + (item.result.timeMs || 0); }, 0);
    var isSubmit = mode === 'submit';
    var score = null;
    var speed = 0;
    var compileFailure = !!payload.compileFailure;
    if (isSubmit) {
      var correctness = total ? passed / total * 85 : 0;
      if (passed === total && total > 0) {
        speed = Math.min(15, 15 * (Number(task.targetMs) || 80) / Math.max(totalMs, 1));
      }
      score = compileFailure ? 0 : Math.round(correctness + speed);
      state.lastScore = { score: score, passed: passed, total: total, ms: totalMs };
      var previous = state.best[task.id];
      if (!compileFailure && (!previous || score > previous.score || (score === previous.score && totalMs < previous.ms))) {
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
      var res = item.result;
      var test = item.test;
      var status = res.passed ? 'pass' : 'fail';
      var label = item.test.public ? '公开' : '隐藏';
      if (res.status === 'Compilation Error') {
        return '<div class="test-row fail"><div class="test-state">✕</div><div class="test-body"><div class="test-title"><b>编译阶段</b><span class="test-tag">全部用例</span><span class="test-ms">— ms</span></div>' +
          '<div class="test-error">' + escapeHTML(res.compileOutput || res.stderr || 'GCC 没有返回诊断信息。') + '</div></div></div>';
      }
      return '<div class="test-row ' + status + '">' +
        '<div class="test-state">' + (res.passed ? '✓' : '✕') + '</div>' +
        '<div class="test-body"><div class="test-title"><b>用例 ' + (index + 1) + '</b><span class="test-tag">' + label + '</span><span class="test-name">' + escapeHTML(test.label) + '</span><span class="test-ms">' + Number(res.timeMs || 0).toFixed(1) + ' ms</span></div>' +
          '<div class="test-io"><span>stdin</span><code>' + escapeHTML(fmtText(test.stdin)) + '</code></div>' +
          '<div class="test-io"><span>期望</span><code>' + escapeHTML(fmtText(test.expected)) + '</code></div>' +
          '<div class="test-io actual"><span>实际</span><code>' + escapeHTML(fmtText(res.stdout)) + '</code></div>' +
          (res.stderr && !res.passed ? '<div class="test-error">' + escapeHTML(res.stderr) + '</div>' : '') +
        '</div>' +
      '</div>';
    }).join('');

    var summary = '<div class="result-summary ' + (passed === total && !compileFailure ? 'ok' : 'no') + '">' +
      '<div><span class="summary-kicker">' + (isSubmit ? '提交结果' : '公开样例') + '</span><b>' + passed + ' / ' + total + '</b><small>' + (isSubmit ? (passed === total && !compileFailure ? '全部用例通过' : '还有用例未通过') : '公开用例通过数') + '</small></div>' +
      (isSubmit ? '<div class="score-box"><span>本题得分</span><b>' + score + '</b><small>正确性 ' + Math.round(total ? passed / total * 85 : 0) + ' + 速度 ' + Math.round(speed) + '</small></div>' : '') +
      '<div class="time-box"><span>总耗时</span><b>' + Number(totalMs).toFixed(1) + '</b><small>毫秒 · 不含编译</small></div>' +
    '</div>';

    var area = $('#resultArea');
    area.innerHTML = summary + '<div class="test-list">' + rows + '</div>' +
      (isSubmit && passed === total && !compileFailure ? '<div class="pass-note">通过。可以点「查看解析」对照修复思路，或回到题库继续下一题。</div>' :
        (compileFailure ? '<div class="fail-note">先修编译错误：看下方的 GCC 诊断，确认头文件、命名空间和 main 函数都完整。</div>' :
          (isSubmit ? '<div class="fail-note">先看失败用例的「实际」和「期望」差在哪里，再决定改条件、边界还是数据结构。</div>' : '<div class="run-note">公开样例通过后再提交；提交会额外运行 ' + Math.max(0, task.tests.length - 1) + ' 条隐藏用例。</div>')));
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
      $('#content').innerHTML = '<div class="empty">题库数据未载入。请检查 assets/js/cpp-foundations/cpp-debug-data.js。</div>';
      return;
    }
    document.addEventListener('click', function (event) {
      var tab = event.target.closest('[data-filter]');
      if (tab) {
        state.filter = tab.getAttribute('data-filter');
        renderBank();
        return;
      }
      var statusBtn = event.target.closest('[data-status]');
      if (statusBtn) {
        state.status = statusBtn.getAttribute('data-status');
        renderBank();
        return;
      }
      if (event.target.closest('[data-clear-filters]')) {
        state.filter = 'all';
        state.status = 'all';
        state.query = '';
        renderBank();
        return;
      }
      if (event.target.closest('[data-scroll-rules]')) {
        var rules = $('#debugRules');
        if (rules) rules.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
    document.addEventListener('input', function (event) {
      if (!event.target || event.target.id !== 'debugSearch') return;
      window.clearTimeout(event.target._searchTimer);
      event.target._searchTimer = window.setTimeout(function () {
        state.query = event.target.value;
        renderBank();
        var input = $('#debugSearch');
        if (input) { input.focus(); var end = input.value.length; try { input.setSelectionRange(end, end); } catch (err) {} }
      }, 180);
    });
    document.addEventListener('keydown', function (event) {
      if (event.target && event.target.id === 'debugSearch' && event.key === 'Escape') {
        event.target.value = '';
        state.query = '';
        renderBank();
        return;
      }
      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        var tag = (event.target && event.target.tagName || '').toLowerCase();
        if (tag === 'input' || tag === 'textarea' || state.current) return;
        var input = $('#debugSearch');
        if (input) { event.preventDefault(); input.focus(); }
      }
    });
    window.addEventListener('hashchange', route);
    route();
  }

  init();
})();

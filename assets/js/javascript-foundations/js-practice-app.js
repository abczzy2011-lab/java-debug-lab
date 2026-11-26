(function () {
  'use strict';

  var levels = window.JS_PRACTICE_LEVELS || [];
  var questions = window.JS_PRACTICE_QUESTIONS || [];
  var byId = {};
  questions.forEach(function (q) { byId[q.id] = q; });
  var levelById = {};
  levels.forEach(function (level) { levelById[level.id] = level; });

  var SESSION_KEY = 'jsPractice.session.v1';
  var STATS_KEY = 'jsPractice.stats.v1';
  var WRONG_KEY = 'jsPractice.wrong.v1';
  var filter = 'all';
  var session = loadSession();
  var stats = loadStats();
  var wrongIds = loadWrong();
  var toastTimer = 0;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function getJSON(key, fallback) {
    try {
      var value = JSON.parse(localStorage.getItem(key) || 'null');
      return value == null ? fallback : value;
    } catch (err) { return fallback; }
  }

  function setJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (err) {}
  }

  function loadSession() {
    try {
      var raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !Array.isArray(data.order) || !data.order.length) return null;
      if (!data.order.every(function (id) { return byId[id]; })) return null;
      return data;
    } catch (err) { return null; }
  }

  function saveSession() {
    try {
      if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      else sessionStorage.removeItem(SESSION_KEY);
    } catch (err) {}
  }

  function loadStats() {
    var value = getJSON(STATS_KEY, {});
    return {
      attempted: Number(value.attempted) || 0,
      correct: Number(value.correct) || 0,
      sessions: Number(value.sessions) || 0,
      solved: value.solved && typeof value.solved === 'object' ? value.solved : {}
    };
  }

  function loadWrong() {
    var value = getJSON(WRONG_KEY, []);
    return Array.isArray(value) ? value.filter(function (id) { return byId[id]; }) : [];
  }

  function saveStats() { setJSON(STATS_KEY, stats); }
  function saveWrong() { setJSON(WRONG_KEY, wrongIds); }

  function solvedCount() {
    return Object.keys(stats.solved).filter(function (id) { return stats.solved[id] === true; }).length;
  }

  function accuracy() {
    if (!stats.attempted) return 0;
    return Math.round(stats.correct / stats.attempted * 100);
  }

  function updateHeader() {
    var el = $('#topProgress');
    if (el) el.textContent = solvedCount() + ' / ' + questions.length;
  }

  function shuffle(list) {
    var out = list.slice();
    for (var i = out.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = out[i];
      out[i] = out[j];
      out[j] = temp;
    }
    return out;
  }

  function start(orderIds, mode, title) {
    if (!orderIds.length) return;
    session = {
      order: orderIds.slice(),
      idx: 0,
      answers: {},
      mode: mode,
      title: title,
      finished: false,
      startedAt: Date.now()
    };
    saveSession();
    go('quiz');
  }

  function go(hash) {
    if (location.hash === '#' + hash) route();
    else location.hash = hash;
  }

  function questionOrderForLevel(levelId) {
    return questions.filter(function (q) { return q.level === levelId; }).map(function (q) { return q.id; });
  }

  function renderOverview() {
    filter = filter || 'all';
    var filtered = filter === 'all' ? questions : questions.filter(function (q) { return q.level === filter; });
    var groups = levels.filter(function (level) { return filter === 'all' || level.id === filter; });
    var wrongCount = wrongIds.length;
    var solved = solvedCount();
    var pct = accuracy();
    var cards = groups.map(function (level) {
      var list = filtered.filter(function (q) { return q.level === level.id; }).map(function (q, i) {
        var isSolved = stats.solved[q.id] === true;
        return '<button class="q-card' + (isSolved ? ' solved' : '') + '" type="button" data-id="' + esc(q.id) + '">' +
          '<span class="q-card-no">' + esc(level.label) + ' · ' + String(i + 1).padStart(2, '0') + '</span>' +
          '<span class="q-card-title">' + esc(q.title) + '</span>' +
          '<span class="q-card-foot"><span>输出预测 · ' + q.options.length + ' 个选项</span><span class="q-state">' + (isSolved ? '✓ 已答对' : '开始 →') + '</span></span>' +
        '</button>';
      }).join('');
      return '<section class="level-block">' +
        '<div class="level-head"><div><span class="level-kicker">' + esc(level.en) + '</span><h2>' + esc(level.label) + ' · ' + esc(level.title) + '</h2>' +
        '<p>' + esc(level.summary) + '</p></div>' +
        '<button class="level-start" type="button" data-start-level="' + esc(level.id) + '">练这一档 <span aria-hidden="true">→</span></button></div>' +
        '<div class="q-grid">' + list + '</div>' +
      '</section>';
    }).join('');

    $('#app').innerHTML = '<div class="panel">' +
      '<section class="practice-hero">' +
        '<div class="kicker">JAVASCRIPT · PRACTICE · 54 QUESTIONS</div>' +
        '<h1>把“看懂”变成“答对”</h1>' +
        '<p class="sub">3 档、54 道输出预测题。选择答案后立即判分，给出运行结果、原因和一条可迁移的结论；不执行你输入的代码，也不依赖后端。</p>' +
        '<div class="hero-stats">' +
          '<span class="stat"><b>' + questions.length + '</b> 道题</span>' +
          '<span class="stat"><b>3</b> 档难度</span>' +
          '<span class="stat"><b>' + solved + '</b> 道已答对</span>' +
          '<span class="stat"><b>' + pct + '%</b> 累计正确率</span>' +
        '</div>' +
        '<div class="hero-actions">' +
          '<button class="btn" type="button" data-start-mode="random">随机 8 题 <span aria-hidden="true">→</span></button>' +
          '<button class="btn ghost" type="button" data-start-mode="basic">从基础 18 题开始</button>' +
          '<button class="btn ghost" type="button" data-start-mode="all">全部 54 题</button>' +
          (wrongCount ? '<button class="btn warn" type="button" data-start-mode="wrong">重练错题 · ' + wrongCount + '</button>' : '') +
        '</div>' +
        '<div class="outcomes">' +
          '<div class="outcome"><b>即时反馈</b><p>选完立刻看到对错，不用等提交；错误选项也会标出，不靠猜。</p></div>' +
          '<div class="outcome"><b>解释到原因</b><p>每题给运行结果、判分理由和一个可迁移结论，而不是只给答案。</p></div>' +
          '<div class="outcome"><b>错题留在本机</b><p>答错自动进入错题本；答对后移出，可随时只重练错题。</p></div>' +
        '</div>' +
      '</section>' +
      '<div class="practice-toolbar">' +
        '<div class="filter-tabs" role="group" aria-label="按难度筛选">' +
          '<button type="button" data-filter="all" class="' + (filter === 'all' ? 'active' : '') + '">全部 <b>' + questions.length + '</b></button>' +
          levels.map(function (level) {
            return '<button type="button" data-filter="' + esc(level.id) + '" class="' + (filter === level.id ? 'active' : '') + '">' + esc(level.label) + ' <b>' + questions.filter(function (q) { return q.level === level.id; }).length + '</b></button>';
          }).join('') +
        '</div>' +
        '<span class="toolbar-note">点击单题可直接开始；答完自动记录</span>' +
      '</div>' +
      '<div class="level-list">' + cards + '</div>' +
      '<div class="tool-foot">题目全部为选择题，浏览器内静态判分。进度、正确率和错题只保存在本机 localStorage，不上传服务器。</div>' +
    '</div>';

    bindOverview();
    updateHeader();
    window.scrollTo(0, 0);
    document.title = 'JavaScript 练习场 · ' + questions.length + ' 题';
  }

  function renderQuiz() {
    if (!session) { go('overview'); return; }
    var q = byId[session.order[session.idx]];
    if (!q) { renderResult(); return; }
    var level = levelById[q.level] || { label: q.level, title: '' };
    var answer = session.answers[q.id];
    var answered = typeof answer === 'number';
    var correctCount = session.order.reduce(function (count, id) {
      var item = byId[id];
      return count + (typeof session.answers[id] === 'number' && session.answers[id] === item.answer ? 1 : 0);
    }, 0);
    var optionHtml = q.options.map(function (option, index) {
      var cls = '';
      if (answered) {
        if (index === q.answer) cls = ' correct';
        else if (index === answer) cls = ' wrong';
        else cls = ' muted';
      }
      return '<button class="option' + cls + '" type="button" data-option="' + index + '"' + (answered ? ' disabled' : '') + '>' +
        '<span class="opt-letter">' + String.fromCharCode(65 + index) + '</span><span class="opt-text">' + esc(option) + '</span>' +
        '<span class="opt-mark">' + (answered && index === q.answer ? '✓' : (answered && index === answer ? '✕' : '')) + '</span>' +
      '</button>';
    }).join('');

    $('#app').innerHTML = '<div class="panel quiz-panel">' +
      '<div class="quiz-top">' +
        '<button class="back-link" type="button" data-back="overview"><span aria-hidden="true">←</span> 返回题库</button>' +
        '<div class="quiz-progress"><span>第 <b>' + (session.idx + 1) + '</b> / ' + session.order.length + ' 题</span><span>已答对 <b>' + correctCount + '</b></span></div>' +
      '</div>' +
      '<div class="quiz-body">' +
        '<div class="quiz-meta"><span class="level-tag">' + esc(level.label) + '</span><span class="q-no">Q ' + String(questions.indexOf(q) + 1).padStart(2, '0') + '</span><span>' + esc(session.title) + '</span></div>' +
        '<h1 class="quiz-title">' + esc(q.title) + '</h1>' +
        '<p class="quiz-prompt">' + esc(q.prompt) + '</p>' +
        '<div class="code-card quiz-code"><div class="code-head"><span>javascript</span><button class="copy" type="button" data-copy="' + esc(encodeURIComponent(q.code)) + '">复制</button></div><pre><code>' + esc(q.code) + '</code></pre></div>' +
        '<div class="options" role="group" aria-label="选项">' + optionHtml + '</div>' +
        (answered ? feedbackHTML(q, answer) : '') +
      '</div>' +
      '<footer class="quiz-foot">' +
        '<span class="quiz-hint">' + (answered ? '答案已记录。' : '选一个选项，立即判分。') + '</span>' +
        '<button class="btn next-btn" type="button" data-next' + (answered ? '' : ' disabled') + '>' + (session.idx === session.order.length - 1 ? '查看结果' : '下一题') + ' <span aria-hidden="true">→</span></button>' +
      '</footer>' +
    '</div>';

    bindQuiz(q);
    var opts = $all('.option', $('#app'));
    opts.forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (typeof session.answers[q.id] === 'number') return;
        session.answers[q.id] = Number(btn.getAttribute('data-option'));
        saveSession();
        renderQuiz();
        var fb = $('.feedback', $('#app'));
        if (fb && fb.scrollIntoView) {
          try { fb.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (err) {}
        }
      });
    });
    updateHeader();
    window.scrollTo(0, 0);
    document.title = q.title + ' · JavaScript 练习';
  }

  function bindQuiz() {
    var next = $('[data-next]', $('#app'));
    if (next) next.addEventListener('click', function () {
      if (!session || typeof session.answers[byId[session.order[session.idx]].id] !== 'number') return;
      if (session.idx >= session.order.length - 1) {
        session.finished = true;
        saveSession();
        finishSession();
        go('result');
      } else {
        session.idx += 1;
        saveSession();
        renderQuiz();
      }
    });
    var back = $('[data-back]', $('#app'));
    if (back) back.addEventListener('click', function () { go('overview'); });
  }

  function feedbackHTML(q, answer) {
    var isRight = answer === q.answer;
    return '<section class="feedback ' + (isRight ? 'right' : 'wrong') + '" aria-live="polite">' +
      '<div class="fb-head"><span class="fb-badge">' + (isRight ? '✓ 答对了' : '✕ 再想一步') + '</span>' +
      '<span class="fb-answer">正确答案：' + String.fromCharCode(65 + q.answer) + ' · ' + esc(q.options[q.answer]) + '</span></div>' +
      '<div class="output"><span>运行结果</span><pre>' + esc(q.output) + '</pre></div>' +
      '<p class="fb-text"><b>为什么：</b>' + esc(q.why) + '</p>' +
      '<p class="fb-point"><b>带走一条：</b>' + esc(q.point) + '</p>' +
    '</section>';
  }

  function finishSession() {
    if (!session || session.statsApplied) return;
    var correct = 0;
    session.order.forEach(function (id) {
      var q = byId[id];
      var answer = session.answers[id];
      if (typeof answer !== 'number') return;
      var isRight = answer === q.answer;
      if (isRight) {
        correct += 1;
        stats.solved[id] = true;
        wrongIds = wrongIds.filter(function (wrongId) { return wrongId !== id; });
      } else {
        stats.solved[id] = false;
        if (wrongIds.indexOf(id) === -1) wrongIds.push(id);
      }
    });
    stats.attempted += Object.keys(session.answers).length;
    stats.correct += correct;
    stats.sessions += 1;
    session.statsApplied = true;
    session.correct = correct;
    saveSession();
    saveStats();
    saveWrong();
  }

  function renderResult() {
    if (!session) { go('overview'); return; }
    finishSession();
    var correctCount = session.correct == null ? session.order.reduce(function (count, id) {
      var q = byId[id];
      return count + (session.answers[id] === q.answer ? 1 : 0);
    }, 0) : session.correct;
    var total = session.order.length;
    var pct = total ? Math.round(correctCount / total * 100) : 0;
    var wrong = session.order.filter(function (id) { return session.answers[id] !== byId[id].answer; });
    var breakdown = levels.map(function (level) {
      var ids = session.order.filter(function (id) { return byId[id].level === level.id; });
      var right = ids.filter(function (id) { return session.answers[id] === byId[id].answer; }).length;
      if (!ids.length) return '';
      var width = Math.round(right / ids.length * 100);
      return '<div class="break-row"><div class="break-label"><span>' + esc(level.label) + '</span><b>' + right + ' / ' + ids.length + '</b></div><div class="break-bar"><i style="width:' + width + '%"></i></div></div>';
    }).join('');
    var wrongList = wrong.length
      ? '<div class="wrong-list">' + wrong.map(function (id, index) {
          var q = byId[id];
          return '<button class="wrong-row" type="button" data-single="' + esc(id) + '"><span class="wrong-no">' + String(index + 1).padStart(2, '0') + '</span><span class="wrong-title">' + esc(q.title) + '</span><span class="wrong-answer">正确：' + String.fromCharCode(65 + q.answer) + '</span></button>';
        }).join('') + '</div>'
      : '<div class="all-right"><b>全对。</b> 这一轮没有错题；可以直接加难度或去课程里复习对应小节。</div>';

    $('#app').innerHTML = '<div class="panel result-panel">' +
      '<section class="result-hero">' +
        '<div class="result-ring" style="--pct:' + pct + '%"><div><b>' + pct + '%</b><span>正确率</span></div></div>' +
        '<div class="result-copy"><div class="kicker">ROUND COMPLETE</div><h1>' + (pct === 100 ? '这一轮全对' : (pct >= 70 ? '基础已经稳了' : '把错题再过一遍')) + '</h1>' +
        '<p>' + esc(session.title) + ' · 答对 <b>' + correctCount + ' / ' + total + '</b>。' + (wrong.length ? '错题已写入本机错题本。' : '没有新增错题。') + '</p>' +
        '<div class="result-actions">' +
          (wrong.length ? '<button class="btn" type="button" data-retry-wrong>重练这 ' + wrong.length + ' 道错题</button>' : '') +
          '<button class="btn ghost" type="button" data-new-round>再来一轮随机 8 题</button>' +
          '<button class="btn ghost" type="button" data-back="overview">返回题库</button>' +
        '</div>' +
        '</div>' +
      '</section>' +
      '<div class="result-grid">' +
        '<section class="result-card"><h2>本轮分档</h2>' + breakdown + '</section>' +
        '<section class="result-card"><h2>错题 / 复习入口</h2>' + wrongList + '</section>' +
      '</div>' +
      '<div class="tool-foot">成绩只保存在本机。错题重练会开启新的单轮，不会清空历史正确率。</div>' +
    '</div>';

    var retry = $('[data-retry-wrong]', $('#app'));
    if (retry) retry.addEventListener('click', function () { start(wrong, 'wrong', '错题重练'); });
    var fresh = $('[data-new-round]', $('#app'));
    if (fresh) fresh.addEventListener('click', function () {
      start(shuffle(questions.map(function (q) { return q.id; })).slice(0, 8), 'random', '随机 8 题');
    });
    var back = $('[data-back]', $('#app'));
    if (back) back.addEventListener('click', function () { go('overview'); });
    $all('[data-single]', $('#app')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-single');
        start([id], 'single', '单题复习');
      });
    });
    updateHeader();
    window.scrollTo(0, 0);
    document.title = '练习结果 · ' + pct + '%';
  }

  function bindOverview() {
    $all('[data-filter]', $('#app')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        filter = btn.getAttribute('data-filter');
        renderOverview();
      });
    });
    $all('[data-start-mode]', $('#app')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var mode = btn.getAttribute('data-start-mode');
        if (mode === 'random') {
          start(shuffle(questions.map(function (q) { return q.id; })).slice(0, 8), 'random', '随机 8 题');
        } else if (mode === 'basic') {
          start(questionOrderForLevel('basic'), 'level', '基础 · ' + questionOrderForLevel('basic').length + ' 题');
        } else if (mode === 'all') {
          start(questions.map(function (q) { return q.id; }), 'all', '全部 54 题');
        } else if (mode === 'wrong') {
          start(wrongIds.slice(), 'wrong', '错题重练');
        }
      });
    });
    $all('[data-start-level]', $('#app')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var levelId = btn.getAttribute('data-start-level');
        var level = levelById[levelId];
        start(questionOrderForLevel(levelId), 'level', (level ? level.label : levelId) + ' · ' + questionOrderForLevel(levelId).length + ' 题');
      });
    });
    $all('.q-card', $('#app')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-id');
        var q = byId[id];
        start([id], 'single', q ? q.title : '单题练习');
      });
    });
  }

  function route() {
    var hash = (location.hash || '').replace(/^#/, '');
    if (hash === 'quiz') {
      if (session) renderQuiz();
      else go('overview');
      return;
    }
    if (hash === 'result') {
      if (session && session.finished) renderResult();
      else go('overview');
      return;
    }
    renderOverview();
  }

  function showToast(message) {
    var toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.left = '-9999px';
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); resolve(); } catch (err) { reject(err); }
      document.body.removeChild(area);
    });
  }

  function init() {
    if (!levels.length || !questions.length) {
      $('#app').innerHTML = '<div class="panel"><div class="empty">练习数据未载入。请检查 assets/js/javascript-foundations/js-practice-data.js。</div></div>';
      return;
    }
    route();
    window.addEventListener('hashchange', function () {
      if (session && session.finished === false) {
        if (location.hash === '#overview') {
          session = null;
          saveSession();
        }
      }
      route();
    });
    document.addEventListener('click', function (event) {
      var copy = event.target.closest ? event.target.closest('[data-copy]') : null;
      if (!copy) return;
      copyText(decodeURIComponent(copy.getAttribute('data-copy') || '')).then(function () {
        var old = copy.textContent;
        copy.textContent = '已复制';
        copy.classList.add('ok');
        setTimeout(function () { copy.textContent = old; copy.classList.remove('ok'); }, 1400);
      }).catch(function () { showToast('复制失败，请手动选择'); });
    });
  }

  init();
})();

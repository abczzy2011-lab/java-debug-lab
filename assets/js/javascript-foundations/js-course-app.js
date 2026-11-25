(function () {
  'use strict';

  var modules = (window.JS_COURSE_MODULES || []).slice();
  var allLessons = [];
  modules.forEach(function (module) {
    (module.lessons || []).forEach(function (lesson) {
      allLessons.push({ module: module, lesson: lesson });
    });
  });
  var total = allLessons.length;
  var STORE_KEY = 'jsCourse.progress.v1';
  var LAST_KEY = 'jsCourse.lastLesson.v1';
  var completed = new Set(loadJSON(STORE_KEY, []));
  var currentId = '';
  var navOpen = false;
  var toastTimer = 0;

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

  function replaceBracketCode(text) {
    var out = '';
    var i = 0;
    while (i < text.length) {
      if (text.charAt(i) === '[' && text.charAt(i + 1) === '[') {
        var start = i + 2;
        var found = -1;
        for (var j = start; j < text.length - 1; j += 1) {
          if (text.charAt(j) !== ']' || text.charAt(j + 1) !== ']') continue;
          var balance = 0;
          var ok = true;
          for (var k = start; k < j; k += 1) {
            if (text.charAt(k) === '[') balance += 1;
            if (text.charAt(k) === ']') balance -= 1;
            if (balance < 0) { ok = false; break; }
          }
          if (ok && balance === 0) { found = j; break; }
        }
        if (found >= 0) {
          out += '<code>' + text.slice(start, found) + '</code>';
          i = found + 2;
          continue;
        }
      }
      out += text.charAt(i);
      i += 1;
    }
    return out;
  }

  function inline(value) {
    var text = escapeHTML(value);
    text = replaceBracketCode(text);
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return text;
  }

  function paragraphs(value) {
    return String(value == null ? '' : value)
      .split(/\n{2,}/)
      .map(function (part) { return part.trim(); })
      .filter(Boolean)
      .map(function (part) { return '<p>' + inline(part) + '</p>'; })
      .join('');
  }

  function displayTitle(lesson) {
    return String(lesson && lesson.title || '').replace(/^\d+\.\d+\s*/, '');
  }

  function lessonById(id) {
    for (var i = 0; i < modules.length; i += 1) {
      var lessons = modules[i].lessons || [];
      for (var j = 0; j < lessons.length; j += 1) {
        if (lessons[j].id === id) return { module: modules[i], lesson: lessons[j], moduleIndex: i, lessonIndex: j };
      }
    }
    return null;
  }

  function firstLesson(module) {
    return (module.lessons && module.lessons[0]) ? module.lessons[0].id : '';
  }

  function lessonAt(id) {
    for (var i = 0; i < allLessons.length; i += 1) {
      if (allLessons[i].lesson.id === id) return i;
    }
    return -1;
  }

  function nextLesson(id) {
    var at = lessonAt(id);
    return at >= 0 && at < allLessons.length - 1 ? allLessons[at + 1].lesson.id : '';
  }

  function prevLesson(id) {
    var at = lessonAt(id);
    return at > 0 ? allLessons[at - 1].lesson.id : '';
  }

  function moduleDone(module) {
    var lessons = module.lessons || [];
    return lessons.filter(function (lesson) { return completed.has(lesson.id); }).length;
  }

  function totalContentChars() {
    var totalChars = 0;
    modules.forEach(function (module) {
      (module.lessons || []).forEach(function (lesson) {
        (lesson.sections || []).forEach(function (section) {
          ['h', 'p', 'code', 'output', 'tip'].forEach(function (key) {
            if (section[key]) totalChars += String(section[key]).length;
          });
        });
        ['lead', 'practice'].forEach(function (key) {
          if (lesson[key]) totalChars += String(lesson[key]).length;
        });
      });
    });
    return totalChars;
  }

  function updateProgress() {
    var done = allLessons.filter(function (item) { return completed.has(item.lesson.id); }).length;
    var pct = total ? Math.round(done / total * 100) : 0;
    var top = $('#topProgress');
    var side = $('#sideCount');
    var bar = $('#sideBar');
    if (top) top.textContent = done + ' / ' + total;
    if (side) side.textContent = done + ' / ' + total + ' 已完成';
    if (bar) bar.style.width = pct + '%';
  }

  function renderNav() {
    var nav = $('#courseNav');
    if (!nav) return;
    nav.innerHTML = modules.map(function (module, index) {
      var done = moduleDone(module);
      var number = String(module.number || index + 1).padStart(2, '0');
      var lessons = (module.lessons || []).map(function (lesson, lessonIndex) {
        var isDone = completed.has(lesson.id);
        var isActive = lesson.id === currentId;
        return '<a class="les' + (isDone ? ' done' : '') + (isActive ? ' active' : '') + '" href="#' + escapeHTML(lesson.id) + '"' +
          (isActive ? ' aria-current="page"' : '') + '>' +
          '<span class="num">' + number + '.' + String(lessonIndex + 1) + '</span>' +
          '<span class="txt">' + escapeHTML(displayTitle(lesson)) + '</span>' +
          '<span class="ok" aria-label="已完成">✓</span></a>';
      }).join('');
      return '<div class="ch">' +
        '<a class="ch-head" href="#' + escapeHTML(firstLesson(module)) + '">' +
          '<span class="ch-no">' + number + '</span>' +
          '<span class="ch-name">' + escapeHTML(module.title) +
            '<span>' + done + ' / ' + (module.lessons || []).length + ' 节完成</span></span>' +
        '</a>' +
        '<div class="lessons">' + lessons + '</div>' +
      '</div>';
    }).join('');
    var active = nav.querySelector('.les.active');
    if (active && active.scrollIntoView) {
      try { active.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (err) {}
    }
  }

  function renderOverview() {
    currentId = '';
    var done = allLessons.filter(function (item) { return completed.has(item.lesson.id); }).length;
    var last = '';
    try { last = localStorage.getItem(LAST_KEY) || ''; } catch (err) {}
    var resume = lessonById(last) ? last : (allLessons.filter(function (item) { return !completed.has(item.lesson.id); })[0] || {}).lesson;
    var resumeId = resume ? resume.id : '';
    var resumeTitle = resume ? displayTitle(resume) : '从第 1 节开始';
    var chars = totalContentChars();
    var cards = modules.map(function (module, index) {
      var doneCount = moduleDone(module);
      var number = String(module.number || index + 1).padStart(2, '0');
      var lessons = (module.lessons || []).map(function (lesson, lessonIndex) {
        return '<span><b>' + number + '.' + String(lessonIndex + 1) + '</b>' + escapeHTML(displayTitle(lesson)) + '</span>';
      }).join('');
      return '<a class="module-card" href="#' + escapeHTML(firstLesson(module)) + '">' +
        '<div class="module-card-top"><span class="module-card-no">MODULE ' + number + '</span>' +
          '<span class="module-card-status">' + (doneCount === (module.lessons || []).length ? '已完成' : '完整课程') + '</span></div>' +
        '<h3>' + escapeHTML(module.title) + '</h3>' +
        '<p>' + inline(module.summary) + '</p>' +
        '<div class="module-card-list">' + lessons + '</div>' +
        '<div class="module-card-foot"><span>' + doneCount + ' / ' + (module.lessons || []).length + ' 节完成</span><span aria-hidden="true">→</span></div>' +
      '</a>';
    }).join('');

    $('#content').innerHTML = '<div class="panel"><div class="overview">' +
      '<section class="hero-box">' +
        '<div class="kicker">JAVASCRIPT · FULL COURSE · 6 MODULES</div>' +
        '<h1>JavaScript 系统课程</h1>' +
        '<p class="sub">从<strong>值、比较和控制流</strong>开始，经过<strong>函数、闭包、对象、数组</strong>，再进入 <strong>DOM、事件、表单和异步</strong>，最后用 ESM 与 npm 把代码拆成可维护的工程。每一节都配可复制代码、输出和坑点。</p>' +
        '<div class="hero-stats">' +
          '<span class="stat"><b>' + modules.length + '</b> 个模块</span>' +
          '<span class="stat"><b>' + total + '</b> 节正文</span>' +
          '<span class="stat"><b>' + Math.max(1, Math.round(chars / 10000)) + '</b> 万字课程</span>' +
          '<span class="stat"><b>' + done + '</b> 节已完成</span>' +
        '</div>' +
        '<div class="hero-actions">' +
          (resumeId ? '<a class="btn" href="#' + escapeHTML(resumeId) + '">继续学习 · ' + escapeHTML(resumeTitle) + ' <span aria-hidden="true">→</span></a>' : '') +
          '<a class="btn ghost" href="#' + escapeHTML(firstLesson(modules[0])) + '">从第 1 节开始</a>' +
          '<a class="btn ghost" href="./javascript-practice.html?v=20261125z53">做练习 <span aria-hidden="true">→</span></a>' +
          '<a class="btn ghost" href="./javascript-reference.html?v=20261125z53">查 API</a>' +
        '</div>' +
        '<div class="outcomes">' +
          '<div class="outcome"><b>先会跑，再会讲</b><p>每个概念都配一段可执行代码和可核对输出，不把语法停在名词解释。</p></div>' +
          '<div class="outcome"><b>把坑点写进正文</b><p>相等比较、this、闭包、浅拷贝、事件委托、事件循环、fetch 404 都在对应小节拆开。</p></div>' +
          '<div class="outcome"><b>一条完整路径</b><p>24 节从语法走到模块化；学完能读能写页面逻辑，也能继续接框架和工程化。</p></div>' +
        '</div>' +
      '</section>' +
      '<div class="sec-title"><h2>6 个模块 · 24 节</h2><span>' + modules.length + ' MODULES · ' + total + ' LESSONS</span></div>' +
      '<section class="module-grid">' + cards + '</section>' +
      '<div class="reader-note">建议按模块顺序推进：01–02 打基础，03–04 学数据与对象，05–06 进入浏览器、异步和模块化。进度只保存在本机浏览器。</div>' +
    '</div></div>';
    renderNav();
    var sidebar = $('#sidebar');
    if (sidebar) sidebar.scrollTop = 0;
    updateProgress();
    window.scrollTo(0, 0);
    document.title = 'JavaScript 系统课程 · 6 模块 24 节';
  }

  function renderSection(section, index) {
    var out = '<section class="section" aria-labelledby="sec-' + index + '">' +
      '<div class="section-no">SECTION ' + String(index + 1).padStart(2, '0') + '</div>' +
      '<h2 id="sec-' + index + '">' + inline(section.h) + '</h2>' +
      paragraphs(section.p);
    if (section.code) {
      out += '<div class="code-card">' +
        '<div class="code-head"><span>javascript</span><button class="copy" type="button" data-copy="' + escapeHTML(encodeURIComponent(section.code)) + '" aria-label="复制这段代码">复制</button></div>' +
        '<pre><code>' + escapeHTML(section.code) + '</code></pre>' +
      '</div>';
    }
    if (section.output) {
      out += '<div class="output"><span>运行结果</span><pre>' + escapeHTML(section.output) + '</pre></div>';
    }
    if (section.tip) {
      out += '<div class="tip"><b>坑点 / 记住这一点：</b>' + inline(section.tip) + '</div>';
    }
    out += '</section>';
    return out;
  }

  function renderLesson(id) {
    var found = lessonById(id);
    if (!found) { renderOverview(); return; }
    var module = found.module;
    var lesson = found.lesson;
    var moduleIndex = found.moduleIndex;
    var lessonIndex = found.lessonIndex;
    currentId = id;
    try { localStorage.setItem(LAST_KEY, id); } catch (err) {}

    var sections = (lesson.sections || []).map(renderSection).join('');
    var points = (lesson.points || []).length
      ? '<div class="points">' + lesson.points.map(function (point, i) {
          return '<div class="point"><b>KEY ' + String(i + 1).padStart(2, '0') + '</b>' + inline(point) + '</div>';
        }).join('') + '</div>'
      : '';
    var brief = lessonIndex === 0
      ? '<aside class="chapter-brief"><h2>这个模块要解决什么</h2><p>' + inline(module.summary) +
        ((module.goals && module.goals.length) ? ' <b>学完应该能：</b>' + inline(module.goals.join('；')) + '。' : '') + '</p></aside>'
      : '';
    var prev = prevLesson(id);
    var next = nextLesson(id);
    var isDone = completed.has(id);
    var number = String(module.number || moduleIndex + 1).padStart(2, '0');

    $('#content').innerHTML = '<div class="panel"><div class="reader">' +
      '<div class="breadcrumb"><a href="#overview">课程总览</a><i>/</i><a href="#' + escapeHTML(firstLesson(module)) + '">' + escapeHTML(module.title) + '</a><i>/</i><span>' + escapeHTML(displayTitle(lesson)) + '</span></div>' +
      '<header class="lesson-head">' +
        '<div class="lesson-eyebrow"><span>模块 ' + number + '</span><span>第 ' + String(lessonIndex + 1) + ' 节</span><span>' + escapeHTML(lesson.minutes || 22) + ' 分钟</span></div>' +
        '<h1>' + escapeHTML(displayTitle(lesson)) + '</h1>' +
        '<p class="lesson-lead">' + inline(lesson.lead) + '</p>' +
        '<div class="lesson-meta"><span>模块 <b>' + escapeHTML(module.title) + '</b></span><span>' + (lesson.sections || []).length + ' 个小节</span><span>可复制代码</span><span>浏览器 / Node</span></div>' +
      '</header>' +
      brief + sections + points +
      (lesson.practice ? '<div class="practice"><h2>本节练习 / 动手检查</h2><p>' + inline(lesson.practice) + '</p></div>' : '') +
      '<footer class="lesson-foot">' +
        '<div class="foot-links">' +
          '<a class="foot-btn" href="#overview"><span aria-hidden="true">←</span> 总览</a>' +
          '<a class="foot-btn" ' + (prev ? 'href="#' + escapeHTML(prev) + '"' : 'aria-disabled="true"') + '><span aria-hidden="true">←</span> 上一节</a>' +
          '<a class="foot-btn" ' + (next ? 'href="#' + escapeHTML(next) + '"' : 'aria-disabled="true"') + '>下一节 <span aria-hidden="true">→</span></a>' +
        '</div>' +
        '<button class="done-btn' + (isDone ? ' is-done' : '') + '" type="button" id="markDone" ' + (isDone ? 'disabled' : '') + '>' +
          (isDone ? '✓ 本节已完成' : '标记本节完成') +
        '</button>' +
      '</footer>' +
      '<div class="reader-note">读完一节再标记完成；进度只保存在本机浏览器，不上传服务器。当前共 ' + total + ' 节。</div>' +
    '</div></div>';

    var doneBtn = $('#markDone');
    if (doneBtn && !isDone) {
      doneBtn.addEventListener('click', function () {
        completed.add(id);
        saveJSON(STORE_KEY, Array.from(completed));
        doneBtn.classList.add('is-done');
        doneBtn.textContent = '✓ 本节已完成';
        doneBtn.disabled = true;
        renderNav();
        updateProgress();
        showToast('已完成：' + displayTitle(lesson));
      });
    }

    renderNav();
    updateProgress();
    document.title = displayTitle(lesson) + ' · JavaScript 系统课程';
    window.scrollTo(0, 0);
  }

  function showToast(message) {
    var toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove('show'); }, 1900);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
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

  function setNav(open) {
    navOpen = open;
    var sidebar = $('#sidebar');
    var scrim = $('#scrim');
    var toggle = $('#navToggle');
    if (!sidebar || !scrim || !toggle) return;
    sidebar.classList.toggle('open', open);
    scrim.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  function route() {
    var id = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    if (!id || id === 'overview') { renderOverview(); return; }
    if (lessonById(id)) { renderLesson(id); return; }
    renderOverview();
  }

  function init() {
    if (!modules.length) {
      $('#content').innerHTML = '<div class="panel"><div class="empty">课程数据未载入。请检查 assets/js/javascript-foundations/js-course-data.js。</div></div>';
      return;
    }
    renderOverview();
    route();
    window.addEventListener('hashchange', function () {
      if (navOpen) setNav(false);
      route();
    });
    var toggle = $('#navToggle');
    if (toggle) toggle.addEventListener('click', function () { setNav(!navOpen); });
    var scrim = $('#scrim');
    if (scrim) scrim.addEventListener('click', function () { setNav(false); });
    document.addEventListener('click', function (event) {
      var copy = event.target.closest ? event.target.closest('[data-copy]') : null;
      if (!copy) return;
      var text = decodeURIComponent(copy.getAttribute('data-copy') || '');
      copyText(text).then(function () {
        var old = copy.textContent;
        copy.textContent = '已复制';
        copy.classList.add('ok');
        setTimeout(function () { copy.textContent = old; copy.classList.remove('ok'); }, 1500);
      }).catch(function () { showToast('复制失败，请手动选择'); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navOpen) setNav(false);
    });
  }

  init();
})();

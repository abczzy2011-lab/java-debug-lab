(function () {
  'use strict';

  var cfg = null;
  var chapters = [];
  var allLessons = [];
  var total = 0;
  var PART_META = {};
  var STORE_KEY = '';
  var LAST_KEY = '';
  var completed = new Set();
  var toastTimer = 0;
  var currentId = '';
  var navOpen = false;
  var renderSeq = 0;

  function partOf(chapter) {
    if (chapter && chapter.part) return Number(chapter.part) || 1;
    return 1;
  }
  function chapterNo(chapter, index) {
    return String(chapter && chapter.number || String(index + 1).padStart(2, '0'));
  }
  function lessonWord() {
    return cfg && cfg.lessonUnit || '节';
  }
  function cleanGoal(goal) {
    return String(goal || '').replace(/[。；;.！!]+$/, '');
  }
  function chapterGoals(chapter) {
    return (chapter && chapter.goals && chapter.goals.length) ? chapter.goals.map(cleanGoal) : [];
  }
  function sourceLabel() {
    return cfg && cfg.defaultSource || '教材综合改写';
  }

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
    for (var i = 0; i < chapters.length; i += 1) {
      var lessons = chapters[i].lessons || [];
      for (var j = 0; j < lessons.length; j += 1) {
        if (lessons[j].id === id) return { chapter: chapters[i], lesson: lessons[j], chapterIndex: i, lessonIndex: j };
      }
    }
    return null;
  }

  function firstLesson(chapter) {
    return (chapter.lessons && chapter.lessons[0]) ? chapter.lessons[0].id : '';
  }

  function nextLesson(id) {
    var at = allLessons.findIndex(function (lesson) { return lesson.id === id; });
    return at >= 0 && at < allLessons.length - 1 ? allLessons[at + 1].id : '';
  }

  function prevLesson(id) {
    var at = allLessons.findIndex(function (lesson) { return lesson.id === id; });
    return at > 0 ? allLessons[at - 1].id : '';
  }

  function chapterDone(chapter) {
    var lessons = chapter.lessons || [];
    return lessons.filter(function (lesson) { return completed.has(lesson.id); }).length;
  }

  function updateProgress() {
    var done = allLessons.filter(function (lesson) { return completed.has(lesson.id); }).length;
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
    var lastPart = 0;
    nav.innerHTML = chapters.map(function (chapter, index) {
      var done = chapterDone(chapter);
      var part = partOf(chapter);
      var prefix = '';
      if (part !== lastPart) {
        var meta = PART_META[part] || PART_META[1] || { title: '', note: '' };
        prefix = '<div class="part-label"><b>PART ' + String(part).padStart(2, '0') + '</b><span>' + escapeHTML(meta.title) + '</span></div>';
        lastPart = part;
      }
      var lessons = (chapter.lessons || []).map(function (lesson, lessonIndex) {
        var isDone = completed.has(lesson.id);
        var isActive = lesson.id === currentId;
        return '<a class="les' + (isDone ? ' done' : '') + (isActive ? ' active' : '') + '" href="#' + escapeHTML(lesson.id) + '"' +
          (isActive ? ' aria-current="page"' : '') + '>' +
          '<span class="num">' + escapeHTML(chapterNo(chapter, index)) + '.' + String(lessonIndex + 1) + '</span>' +
          '<span class="txt">' + escapeHTML(displayTitle(lesson)) + '</span>' +
          '<span class="ok" aria-label="已完成">✓</span></a>';
      }).join('');
      return prefix + '<div class="ch">' +
        '<a class="ch-head" href="#' + escapeHTML(firstLesson(chapter)) + '">' +
          '<span class="ch-no">' + escapeHTML(chapterNo(chapter, index)) + '</span>' +
          '<span class="ch-name">' + escapeHTML(chapter.title) + '<span>' + done + ' / ' + (chapter.lessons || []).length + ' ' + lessonWord() + '完成</span></span>' +
        '</a>' +
        '<div class="lessons">' + lessons + '</div>' +
      '</div>';
    }).join('');
    var active = nav.querySelector('.les.active');
    if (active && active.scrollIntoView) {
      try { active.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (err) {}
    }
  }

  function totalContentChars(list) {
    var total = 0;
    (list || []).forEach(function (chapter) {
      (chapter.lessons || []).forEach(function (lesson) {
        if (lesson.chars) { total += Number(lesson.chars) || 0; return; }
        (lesson.sections || []).forEach(function (section) {
          ['h', 'p', 'code', 'output', 'tip'].forEach(function (key) {
            if (section[key]) total += String(section[key]).length;
          });
        });
      });
    });
    return total;
  }

  function renderOverview() {
    renderSeq += 1;
    currentId = '';
    var done = allLessons.filter(function (lesson) { return completed.has(lesson.id); }).length;
    var last = '';
    try { last = localStorage.getItem(LAST_KEY) || ''; } catch (err) {}
    var resume = lessonById(last) ? last : (allLessons.find(function (lesson) { return !completed.has(lesson.id); }) || {}).id;
    var resumeLesson = resume ? lessonById(resume) : null;
    var resumeTitle = resumeLesson ? displayTitle(resumeLesson.lesson) : '从第 1 ' + lessonWord() + '开始';
    var chars = totalContentChars(chapters);
    var parts = [];
    chapters.forEach(function (chapter, index) {
      var part = partOf(chapter);
      var group = parts.filter(function (item) { return item.part === part; })[0];
      if (!group) {
        group = { part: part, meta: PART_META[part] || PART_META[1] || { title: '', note: '' }, chapters: [] };
        parts.push(group);
      }
      group.chapters.push({ chapter: chapter, index: index });
    });
    var partSections = parts.map(function (group) {
      var cards = group.chapters.map(function (entry) {
        var chapter = entry.chapter, index = entry.index;
        var doneCount = chapterDone(chapter);
        var lessons = (chapter.lessons || []).map(function (lesson, lessonIndex) {
          return '<span><b>' + escapeHTML(chapterNo(chapter, index)) + '.' + String(lessonIndex + 1) + '</b>' + escapeHTML(displayTitle(lesson)) + '</span>';
        }).join('');
        return '<a class="ch-card" href="#' + escapeHTML(firstLesson(chapter)) + '">' +
          '<div class="ch-card-top"><span class="ch-card-no">CHAPTER ' + escapeHTML(chapterNo(chapter, index)) + '</span>' +
            '<span class="ch-card-status">' + (doneCount === (chapter.lessons || []).length ? '已完成' : '已上线') + '</span></div>' +
          '<h3>' + escapeHTML(chapter.title) + '</h3>' +
          '<p>' + inline(chapter.summary) + '</p>' +
          '<div class="ch-card-list">' + lessons + '</div>' +
          '<div class="ch-card-foot"><span>' + doneCount + ' / ' + (chapter.lessons || []).length + ' ' + lessonWord() + '完成</span><span aria-hidden="true">→</span></div>' +
        '</a>';
      }).join('');
      return '<section class="part-block" id="part-' + group.part + '">' +
        '<div class="part-title"><div><div class="part-kicker">PART ' + String(group.part).padStart(2, '0') + '</div>' +
        '<h2>第' + ['一','二','三','四','五'][group.part - 1] + '篇 · ' + escapeHTML(group.meta.title) + '</h2></div>' +
        '<p>' + escapeHTML(group.meta.note) + '</p></div>' +
        '<div class="chapter-grid">' + cards + '</div>' +
      '</section>';
    }).join('');
    var outcomes = (cfg.outcomes || []).map(function (item) {
      return '<div class="outcome"><b>' + escapeHTML(item.title) + '</b><p>' + escapeHTML(item.desc) + '</p></div>';
    }).join('');

    $('#content').innerHTML = '<div class="panel"><div class="overview">' +
      '<section class="hero-box">' +
        '<div class="kicker">' + escapeHTML(cfg.kicker) + '</div>' +
        '<h1>' + escapeHTML(cfg.overviewTitle) + '</h1>' +
        '<p class="sub">' + cfg.overviewSub + '</p>' +
        '<div class="hero-stats">' +
          '<span class="stat"><b>' + chapters.length + '</b> 章</span>' +
          '<span class="stat"><b>' + total + '</b> ' + lessonWord() + '</span>' +
          '<span class="stat"><b>' + parts.length + '</b> 篇</span>' +
          '<span class="stat"><b>' + Math.round(chars / 10000) + '</b> 万字 · ' + escapeHTML(cfg.materialLabel || '教材') + '</span>' +
          '<span class="stat"><b>' + done + '</b> ' + lessonWord() + '已完成</span>' +
        '</div>' +
        '<div class="hero-actions">' +
          (resume ? '<a class="btn" href="#' + escapeHTML(resume) + '">继续学习 · ' + escapeHTML(resumeTitle) + ' <span aria-hidden="true">→</span></a>' : '') +
          '<a class="btn ghost" href="#' + escapeHTML(chapters[0] ? firstLesson(chapters[0]) : '') + '">从第 1 ' + lessonWord() + '开始</a>' +
          (cfg.apiHref ? '<a class="btn ghost" href="' + escapeHTML(cfg.apiHref) + '">' + escapeHTML(cfg.apiLabel || '查 API') + ' <span aria-hidden="true">→</span></a>' : '') +
        '</div>' +
        '<div class="outcomes">' + outcomes + '</div>' +
      '</section>' +
      '<div class="sec-title"><h2>五篇课程目录</h2><span>' + chapters.length + ' CHAPTERS · ' + total + ' LESSONS</span></div>' +
      partSections +
      '<div class="reader-note">' + escapeHTML(cfg.routeNote) + '</div>' +
    '</div></div>';
    renderNav();
    var sidebar = $('#sidebar');
    if (sidebar) sidebar.scrollTop = 0;
    updateProgress();
    window.scrollTo(0, 0);
    document.title = cfg.overviewDocTitle || cfg.overviewTitle;
  }

  function renderSection(section, index) {
    var out = '<section class="section" aria-labelledby="sec-' + index + '">' +
      '<div class="section-no">SECTION ' + String(index + 1).padStart(2, '0') + '</div>' +
      '<h2 id="sec-' + index + '">' + inline(section.h) + '</h2>' +
      paragraphs(section.p);
    if (section.code) {
      out += '<div class="code-card">' +
        '<div class="code-head"><span>' + escapeHTML(cfg.languageLabel || 'code') + '</span><button class="copy" type="button" data-copy="' + escapeHTML(encodeURIComponent(section.code)) + '" aria-label="复制这段代码">复制</button></div>' +
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

  async function renderLesson(id) {
    var seq = ++renderSeq;
    var found = lessonById(id);
    if (!found) { renderOverview(); return; }
    var chapter = found.chapter;
    var lesson = found.lesson;
    var chapterIndex = found.chapterIndex;
    var lessonIndex = found.lessonIndex;
    currentId = id;
    try { localStorage.setItem(LAST_KEY, id); } catch (err) {}

    if (!lesson.sections && cfg.loadLessonBody) {
      $('#content').innerHTML = '<div class="panel"><div class="reader">' +
        '<div class="breadcrumb"><a href="#overview">课程总览</a><i>/</i><span>' + escapeHTML(displayTitle(lesson)) + '</span></div>' +
        '<header class="lesson-head"><div class="lesson-eyebrow"><span>第 ' + String(chapterIndex + 1).padStart(2, '0') + ' 章</span><span>第 ' + String(lessonIndex + 1) + ' ' + lessonWord() + '</span></div>' +
        '<h1>' + escapeHTML(displayTitle(lesson)) + '</h1><p class="lesson-lead">' + inline(lesson.lead) + '</p></header>' +
        '<div class="empty">正在载入本' + lessonWord() + '正文…</div></div></div>';
      try {
        await cfg.loadLessonBody(lesson);
      } catch (err) {
        if (seq === renderSeq) {
          $('#content').innerHTML = '<div class="panel"><div class="reader"><div class="empty">本' + lessonWord() + '正文载入失败。请确认本地服务已启动，然后刷新重试。</div></div></div>';
        }
        return;
      }
      if (seq !== renderSeq || currentId !== id) return;
    }

    var sections = (lesson.sections || []).map(renderSection).join('');
    var points = (lesson.points || []).length
      ? '<div class="points">' + lesson.points.map(function (point, i) {
          return '<div class="point"><b>KEY ' + String(i + 1).padStart(2, '0') + '</b>' + inline(point) + '</div>';
        }).join('') + '</div>'
      : '';
    var brief = lessonIndex === 0
      ? '<aside class="chapter-brief"><h2>本章要解决什么</h2><p>' + inline(chapter.summary) +
        (chapterGoals(chapter).length ? ' <b>学完本章，你应该能：</b>' + inline(chapterGoals(chapter).join('；')) + '。' : '') + '</p></aside>'
      : '';
    var prev = prevLesson(id);
    var next = nextLesson(id);
    var isDone = completed.has(id);
    var sectionCount = (lesson.sections || []).length || lesson.sectionsCount || 0;

    $('#content').innerHTML = '<div class="panel"><div class="reader">' +
      '<div class="breadcrumb"><a href="#overview">课程总览</a><i>/</i><a href="#' + escapeHTML(firstLesson(chapter)) + '">' + escapeHTML(chapter.title) + '</a><i>/</i><span>' + escapeHTML(displayTitle(lesson)) + '</span></div>' +
      '<header class="lesson-head">' +
        '<div class="lesson-eyebrow"><span>第 ' + String(chapterIndex + 1).padStart(2, '0') + ' 章</span><span>第 ' + String(lessonIndex + 1) + ' ' + lessonWord() + '</span><span>' + escapeHTML(lesson.minutes || 25) + ' 分钟</span></div>' +
        '<h1>' + escapeHTML(displayTitle(lesson)) + '</h1>' +
        '<p class="lesson-lead">' + inline(lesson.lead) + '</p>' +
        '<div class="lesson-meta"><span>所属章节 <b>' + escapeHTML(chapter.title) + '</b></span><span>' + sectionCount + ' 个小节</span><span>可运行代码</span><span>来源：' + escapeHTML(lesson.source || sourceLabel()) + '</span></div>' +
      '</header>' +
      brief + sections + points +
      (lesson.practice ? '<div class="practice"><h2>本节练习 / 动手检查</h2><p>' + inline(lesson.practice) + '</p></div>' : '') +
      (lesson.source ? '<div class="source"><b>取材与改写：</b>' + escapeHTML(lesson.source) + '。' + escapeHTML(cfg.sourceNote || '正文为课程改写，不逐字复制原书段落。') + '</div>' : '') +
      (cfg.extraLessonHtml ? cfg.extraLessonHtml(lesson, chapter) : '') +
      '<footer class="lesson-foot">' +
        '<div class="foot-links">' +
          '<a class="foot-btn" href="#overview"><span aria-hidden="true">←</span> 总览</a>' +
          '<a class="foot-btn" ' + (prev ? 'href="#' + escapeHTML(prev) + '"' : 'aria-disabled="true"') + '><span aria-hidden="true">←</span> 上一' + lessonWord() + '</a>' +
          '<a class="foot-btn" ' + (next ? 'href="#' + escapeHTML(next) + '"' : 'aria-disabled="true"') + '>下一' + lessonWord() + ' <span aria-hidden="true">→</span></a>' +
        '</div>' +
        '<button class="done-btn' + (isDone ? ' is-done' : '') + '" type="button" id="markDone" ' + (isDone ? 'disabled' : '') + '>' +
          (isDone ? '✓ 本' + lessonWord() + '已完成' : '标记本' + lessonWord() + '完成') +
        '</button>' +
      '</footer>' +
      '<div class="reader-note">读完一' + lessonWord() + '再标记完成；进度只保存在本机浏览器，不上传服务器。' + (total ? ' 当前共 ' + total + ' ' + lessonWord() + '。' : '') + '</div>' +
    '</div></div>';

    var doneBtn = $('#markDone');
    if (doneBtn && !isDone) {
      doneBtn.addEventListener('click', function () {
        completed.add(id);
        saveJSON(STORE_KEY, Array.from(completed));
        showToast('已完成：' + displayTitle(lesson));
        renderLesson(id);
        renderNav();
        updateProgress();
      });
    }

    renderNav();
    updateProgress();
    document.title = displayTitle(lesson) + ' · ' + (cfg.lessonDocSuffix || cfg.overviewTitle);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (open) {
      var active = sidebar.querySelector('.les.active') || sidebar.querySelector('.ch-head');
      if (active) {
        active.focus({ preventScroll: true });
        try { active.scrollIntoView({ block: 'center', inline: 'nearest' }); } catch (err) {}
      }
    } else {
      toggle.focus({ preventScroll: true });
    }
  }

  function route() {
    var id = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    if (!id || id === 'overview') { renderOverview(); return; }
    if (lessonById(id)) { renderLesson(id); return; }
    renderOverview();
  }

  function init() {
    if (!chapters.length) {
      $('#content').innerHTML = '<div class="panel"><div class="empty">' + escapeHTML(cfg.emptyMessage || '课程数据未载入。') + '</div></div>';
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
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && navOpen) setNav(false);
    });
    document.addEventListener('click', function (event) {
      var copy = event.target.closest('[data-copy]');
      if (!copy) return;
      var text = decodeURIComponent(copy.getAttribute('data-copy') || '');
      copyText(text).then(function () {
        copy.classList.add('ok');
        copy.textContent = '已复制';
        showToast('代码已复制到剪贴板');
        window.setTimeout(function () { copy.classList.remove('ok'); copy.textContent = '复制'; }, 1600);
      }).catch(function () {
        showToast('复制失败，请手动选择代码');
      });
    });
    document.addEventListener('click', function (event) {
      var link = event.target.closest('.les, .ch-head');
      if (link && navOpen) setNav(false);
    });
  }

  function start(config) {
    cfg = config || {};
    chapters = (cfg.chapters || []).slice();
    allLessons = [];
    chapters.forEach(function (ch) {
      (ch.lessons || []).forEach(function (lesson) { allLessons.push(lesson); });
    });
    total = allLessons.length;
    PART_META = cfg.partMeta || {};
    STORE_KEY = cfg.storageKey || 'courseReader.progress.v1';
    LAST_KEY = cfg.lastKey || 'courseReader.lastLesson.v1';
    completed = new Set(loadJSON(STORE_KEY, []));
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
      init();
    }
  }

  window.CourseReader = { start: start };
})();

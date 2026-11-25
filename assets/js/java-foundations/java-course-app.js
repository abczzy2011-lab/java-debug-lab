(function () {
  'use strict';

  var chapters = (window.JAVA_COURSE_CHAPTERS || []).slice();
  var parts = window.JAVA_COURSE_PARTS || [];
  var partMeta = {};
  parts.forEach(function (part, index) { partMeta[index + 1] = part; });

  var bodyCache = Object.create(null);
  var bodyPending = Object.create(null);

  function loadLessonBody(lesson) {
    if (lesson.sections) return Promise.resolve(lesson.sections);
    if (bodyCache[lesson.id]) {
      lesson.sections = bodyCache[lesson.id];
      return Promise.resolve(lesson.sections);
    }
    if (!bodyPending[lesson.id]) {
      bodyPending[lesson.id] = fetch(lesson.bodyUrl, { cache: 'force-cache' })
        .then(function (response) {
          if (!response.ok) throw new Error('HTTP ' + response.status);
          return response.json();
        })
        .then(function (body) {
          bodyCache[lesson.id] = body;
          lesson.sections = body;
          return body;
        })
        .finally(function () { delete bodyPending[lesson.id]; });
    }
    return bodyPending[lesson.id];
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function extraLessonHtml(lesson) {
    var links = lesson.links || [];
    if (!links.length) return '';
    return '<div class="source ref-block"><b>延伸资料 / 参考：</b><div class="ref-list">' +
      links.map(function (link) {
        return '<a href="' + escapeHTML(link.u || '#') + '" target="_blank" rel="noopener noreferrer">↗ ' + escapeHTML(link.t || link.u || '参考') + '</a>';
      }).join('') +
      '</div></div>';
  }

  window.CourseReader.start({
    chapters: chapters,
    partMeta: partMeta,
    storageKey: 'javaFoundations.progress.v1',
    lastKey: 'javaFoundations.lastLesson.v1',
    lessonUnit: '课',
    languageLabel: 'java',
    kicker: 'JAVA · Full Course · Five Parts',
    overviewTitle: 'Java 核心编程与工程实战',
    overviewSub: '把《Head First Java》3E 的 18 章与 50 门主题课压成一条能走完的路：<strong>从变量、对象、继承和异常，走到集合、Stream、并发、JVM、GC 与 JIT</strong>。每一课都按主题合并原书小节，正文按需载入。',
    materialLabel: 'Head First Java 3E',
    outcomes: [
      { title: '先会跑，再会讲', desc: '每个概念都配可运行代码、输出与逐行讲解，不把语法停留在名词解释。' },
      { title: '把错误当线索', desc: '编译期报错、空指针、并发竞态、OOM 与 GC 停顿都在正文里拆开。' },
      { title: '一条工程主线', desc: '从语法到集合、并发、JVM 与调优，最后能解释真实项目里的性能与稳定性问题。' }
    ],
    apiHref: './api.html?v=20261125z51b',
    apiLabel: '查 JDK 26 API',
    routeNote: '建议按篇推进；第 1–4 章打语法与面向对象，第 5–8 章学异常、API 与现代 Java，第 9–12 章进入 JVM 与底层，第 13–15 章练类型系统与函数式，第 16–18 章完成工程化与高级并发。',
    overviewDocTitle: 'Java 核心编程与工程实战 · 五篇 18 章 50 课',
    lessonDocSuffix: 'Java 核心编程',
    defaultSource: 'Head First Java 3E；Oracle Java 教程',
    sourceNote: '正文按主题合并自《Head First Java》3E 与 Oracle 教程。',
    emptyMessage: 'Java 课程数据未载入。请检查 assets/js/java-foundations/java-course-data.js。',
    loadLessonBody: loadLessonBody,
    extraLessonHtml: extraLessonHtml
  });
})();

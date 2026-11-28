(function () {
  'use strict';

  var chapters = (window.CPP_COURSE_CHAPTERS || []).slice();
  var parts = window.CPP_COURSE_PARTS || [];
  var partMeta = {};
  parts.forEach(function (part, index) { partMeta[index + 1] = part; });

  function extraLessonHtml(lesson) {
    var links = lesson.links || [];
    if (!links.length) return '';
    return '<div class="source ref-block"><b>延伸资料 / 参考：</b><div class="ref-list">' +
      links.map(function (link) {
        return '<a href="' + escapeHTML(link.u || '#') + '" target="_blank" rel="noopener noreferrer">↗ ' + escapeHTML(link.t || link.u || '参考') + '</a>';
      }).join('') +
      '</div></div>';
  }

  function escapeHTML(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  window.CourseReader.start({
    chapters: chapters,
    partMeta: partMeta,
    storageKey: 'cppFoundations.progress.v1',
    lastKey: 'cppFoundations.lastLesson.v1',
    lessonUnit: '课',
    languageLabel: 'cpp',
    kicker: 'CPP · Full Course · Five Parts',
    overviewTitle: 'C++ 现代编程与工程实战',
    overviewSub: '把 8 本 C++ 书压成一条能走完的路：<strong>从编译链接、类型、指针与内存，走到类、RAII、模板、STL、C++20 与并发工程</strong>。每一课都按主题重写，配可运行代码、实际输出与坑点，正文直接内联，不依赖额外请求。',
    materialLabel: '8 本 C++ 教材综合',
    outcomes: [
      { title: '先会跑，再会讲', desc: '每个概念都配 g++/clang++ 可运行的代码、输出与逐行解释，不把语法停留在名词解释。' },
      { title: '把错误当线索', desc: '编译错误、悬垂指针、迭代器失效、数据竞争与 UB 都在正文里拆开，并给出可复现的修法。' },
      { title: '一条工程主线', desc: '从语言底座到 RAII、STL、C++20、并发与 CMake，最后能解释真实项目里的性能与稳定性问题。' }
    ],
    apiHref: './cpp-api.html?v=20261128z117',
    apiLabel: '查 C++ API',
    routeNote: '建议按篇推进：第 1–4 章打语言底座，第 5–8 章学对象与泛型，第 9–12 章进 STL 与现代 C++，第 13–15 章补 C++20 与性能，第 16–18 章完成并发与工程化。每课末尾的坑点优先于“多写代码”记忆。',
    overviewDocTitle: 'C++ 现代编程与工程实战 · 五篇 18 章 96 课',
    lessonDocSuffix: 'C++ 现代编程',
    defaultSource: 'A Tour of C++ 3E；C++ Primer Plus 6E；Beginning C++17；C++ PL 4E；Effective Modern C++；C++20 - The Complete Guide；C++ Concurrency in Action 2E',
    sourceNote: '正文按主题合并自 8 本 C++ 教材；示例以 C++20 为目标，线上判题使用 GCC 14.1 并显式传入 -std=c++20。',
    emptyMessage: 'C++ 课程数据未载入。请检查 assets/js/cpp-foundations/cpp-course-data.js。',
    extraLessonHtml: extraLessonHtml
  });
})();

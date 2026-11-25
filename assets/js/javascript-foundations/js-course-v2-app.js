(function () {
  'use strict';

  window.CourseReader.start({
    chapters: (window.JS_COURSE_CHAPTERS || []).slice(),
    partMeta: {
      1: { title: '语言与运行现场', note: '浏览器/Node、值、控制流、函数与 this' },
      2: { title: '函数、对象与模块', note: '调用、闭包、高阶函数、原型、class 与模块' },
      3: { title: '数据与标准库', note: '数组、统计、迭代器、Map/Set、正则与 JSON' },
      4: { title: '浏览器与异步', note: 'DOM、事件、存储、网络、事件循环与并发' },
      5: { title: '工程与项目', note: 'ESM、测试、设计模式与离线任务看板' }
    },
    storageKey: 'javascriptFoundations.progress.v2',
    lastKey: 'javascriptFoundations.lastLesson.v2',
    lessonUnit: '节',
    languageLabel: 'javascript',
    kicker: 'JavaScript · Full Course · Five Parts',
    overviewTitle: 'JavaScript 核心编程与浏览器实战',
    overviewSub: '把书单里的 12 本 JavaScript 教材压成一条能走完的路：<strong>从浏览器与 Node 的运行现场开始，走到函数、对象、DOM、异步、标准库和工程化</strong>，最后用离线任务看板把全部能力串起来。每一节都是可以逐段运行的正文，不是术语表。',
    materialLabel: '12 本教材',
    outcomes: [
      { title: '先会跑，再会讲', desc: '每个概念都配可运行代码和可核对输出，不把语法停留在名词解释。' },
      { title: '把错误当线索', desc: '每章至少一个真实坑点：空槽、this、闭包、原型、跨域、微任务都在正文里拆开。' },
      { title: '一条项目主线', desc: '从值、函数、对象一路写到 DOM、网络和异步，最后汇成可离线使用的任务看板。' }
    ],
    apiHref: './javascript-reference.html?v=20261125z65',
    apiLabel: '查 JavaScript API',
    routeNote: '建议按篇推进；第 1–4 章打语言基础，第 5–9 章学函数、对象与模块，第 10–13 章练数据与标准库，第 14–17 章进入 DOM、网络与异步，第 18 章完成综合项目。',
    overviewDocTitle: 'JavaScript 核心编程与浏览器实战 · 五篇 18 章 76 节',
    lessonDocSuffix: 'JavaScript 核心编程',
    defaultSource: '12 本 JavaScript 教材综合改写',
    sourceNote: '正文为课程改写，不逐字复制原书段落。',
    emptyMessage: '课程数据未载入。请检查 assets/js/javascript-foundations/course/ 下的章节文件。'
  });
})();

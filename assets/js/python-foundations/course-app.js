(function () {
  'use strict';

  window.CourseReader.start({
    chapters: (window.PY_FOUNDATIONS_CHAPTERS || []).slice(),
    partMeta: {
      1: { title: '基础与数据', note: '环境、文本、序列、字典、控制流、函数与生成器' },
      2: { title: '代码组织', note: '模块、包、虚拟环境、文件、异常、日志与调试' },
      3: { title: '对象与工程化', note: '类、继承、类型提示、测试、项目结构与发布' },
      4: { title: '网络、数据与自动化', note: 'HTTP/API、网页抓取、NumPy/pandas、办公自动化与并发' },
      5: { title: '综合项目', note: '游泳成绩清洗与报表系统：从 CSV 到打包、定时运行与复盘' }
    },
    storageKey: 'pythonFoundations.progress.v1',
    lastKey: 'pythonFoundations.lastLesson.v1',
    lessonUnit: '节',
    languageLabel: 'python',
    kicker: 'Python · Full Course · Five Parts',
    overviewTitle: 'Python 核心编程与项目实战',
    overviewSub: '把三本教材压成一条能走完的路：<strong>从解释器、变量和字符串开始，走到类、类型、测试、HTTP/API、pandas、自动化与并发</strong>，最后用游泳成绩报表系统把全部能力串起来。每一节都是可以逐段运行的正文，不是术语表。',
    materialLabel: '3 本教材',
    outcomes: [
      { title: '先会跑，再会讲', desc: '每个概念都配可运行代码和可核对输出，不把语法停留在名词解释。' },
      { title: '把错误当线索', desc: '每章至少一个真实坑点：编码、拷贝、真值、作用域、导入、事务、时区都在正文里拆开。' },
      { title: '一条项目主线', desc: '成绩单、游泳队名单与日志文件贯穿全篇，最后汇成可安装、可定时、可告警的成绩报表系统。' }
    ],
    apiHref: './python-api.html?v=20261124z50g',
    apiLabel: '查 Python API',
    routeNote: '建议按篇推进；第 1–7 章打基础，第 8–9 章学组织代码与处理文件，第 10–13 章进入对象与工程化，第 14–17 章做 HTTP/API、数据、自动化与并发，第 18 章完成综合项目。',
    overviewDocTitle: 'Python 核心编程与项目实战 · 五篇 18 章 76 节',
    lessonDocSuffix: 'Python 综合课程',
    defaultSource: '三本教材综合改写',
    sourceNote: '正文为课程改写，不直接复制原书段落。',
    emptyMessage: '课程数据未载入。请检查 assets/js/python-foundations/ 下的章节文件。'
  });
})();

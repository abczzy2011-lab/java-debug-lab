/* ============================================================
   z95 · 全站光影与滚动节奏（z101 打磨版）
   - 首页 / 学科入口 / 课程目录 / 终端 / 考试页的轻量入场
   - IntersectionObserver 滚动揭示，动画完即清理类，恢复原有 hover
   - 桌面精细指针下的卡片微倾
   - 顶部阅读进度条
   只使用 transform / opacity；减少动画时不挂载。
   ============================================================ */
(function(){
  'use strict';
  var root = document.documentElement;
  var reduceQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var motionOn = false;
  var observer = null;
  var introEls = [];
  var revealEls = [];
  var tiltEls = [];
  var raf = 0;
  var glassPending = null;
  var tiltPending = null;
  var tiltRaf = 0;

  function slice(list){ return Array.prototype.slice.call(list); }
  function canMove(){ return !(reduceQuery && reduceQuery.matches); }

  // rAF 在后台/被节流的窗口里可能不执行；所有仅用于“开始动画”的首帧
  // 都用这个兜底，避免 Hero 一直停在 opacity:0。
  function nextFrame(fn){
    var called = false, frame = 0;
    function run(){
      if(called) return;
      called = true;
      if(frame) window.cancelAnimationFrame(frame);
      fn();
    }
    frame = window.requestAnimationFrame(run);
    window.setTimeout(run, 120);
  }

  function boot(){
    addProgress();
    try { initMotion(); } catch (err) { root.classList.remove('fx-motion'); }
    bindEnvironment();
    bindPointer();
    initQuickNav();
  }

  function addProgress(){
    if(!document.body) return;
    var bar = document.createElement('div');
    bar.className = 'fx-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var barRaf = 0;
    function update(){
      barRaf = 0;
      var body = document.body;
      var max = Math.max(0, (body.scrollHeight || 0) - (window.innerHeight || 0));
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      var ratio = max > 140 ? Math.min(1, Math.max(0, y / max)) : 0;
      bar.style.transform = 'scaleX(' + ratio.toFixed(4) + ')';
      bar.classList.toggle('fx-on', max > 140);
    }
    function schedule(){
      if(!barRaf) barRaf = window.requestAnimationFrame(update);
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('load', schedule, { once: true });
    update();
  }

  function initMotion(){
    if(!canMove() || root.classList.contains('fs-motion')) return;
    if(!('IntersectionObserver' in window)) return;
    if(root.classList.contains('fx-motion')) return;
    root.classList.add('fx-motion');
    motionOn = true;

    // 如果窗口被遮挡、后台节流或 frame clock 暂停，动画永远不会前进。
    // 300ms 内没有拿到一帧，就退回静态页面，绝不让内容停在 opacity:0。
    var frameSeen = false;
    window.requestAnimationFrame(function(){ frameSeen = true; });
    window.setTimeout(function(){ if(!frameSeen) clearMotion(); }, 300);

    markIntro();
    startIntro(introEls);
    markReveal();
    observer = new IntersectionObserver(onIntersect, {
      rootMargin: '0px 0px -7% 0px',
      threshold: 0
    });
    revealEls.forEach(function(item){ observer.observe(item.el); });

    // 已在视口中的元素也走一次观察，避免首屏出现半截。
    function revealInView(){
      var vh = window.innerHeight || document.documentElement.clientHeight || 720;
      revealEls.forEach(function(item){
        if(item.el.getBoundingClientRect().top < vh * 0.96) {
          reveal(item.el);
        }
      });
    }
    nextFrame(revealInView);
    window.setTimeout(revealInView, 360);
    window.setTimeout(revealInView, 900);

    buildTilt();
  }

  function markIntro(){
    var home = document.getElementById('subject');
    if(home){
      addIntro(home.querySelector('.brand'), 0);
      addIntro(home.querySelector('.landing-sub'), .075);
      addIntro(home.querySelector('.subject-actions'), .15);
    }
    [
      '.hero > *',
      '.hub-hero > *',
      '.hero-box > *',
      '.term-hero-copy > *',
      '.guide-hero-copy > *',
      '.quiz-hero-copy > *',
      '.exam-hero > *',
      '.hero-icon',
      '.hero-kicker',
      '.hero-title',
      '.hero-sub',
      '.hero-actions'
    ].forEach(function(sel){
      var nodes = slice(document.querySelectorAll(sel));
      nodes.slice(0, 9).forEach(function(el){
        addIntro(el);
      });
    });
  }

  function addIntro(el, delay){
    if(!el || el.classList.contains('fx-intro')) return false;
    if(el.dataset && el.dataset.fxDone) return false;
    if(!el.getClientRects().length) return false;
    if(delay == null) delay = 0.025 + introEls.length * 0.055;
    el.classList.add('fx-intro');
    el.style.setProperty('--fx-delay', delay.toFixed(3) + 's');
    el.addEventListener('animationend', function(e){
      if(e.animationName === 'fx-rise') finish(el);
    }, { once: true });
    introEls.push({ el: el, timeout: 0 });
    return true;
  }

  function startIntro(items){
    if(!items.length) return;
    nextFrame(function(){
      items.forEach(function(item){
        item.el.classList.add('fx-in');
        item.timeout = window.setTimeout(function(){ finish(item.el); }, 1500);
      });
    });
  }

  function markReveal(){
    var specs = [
      { sel: '#subject .subject-cards > *', step: 0.05 },
      { sel: '#subject .utility-cards > *', step: 0.05 },
      { sel: '.fullstack-subjects .fs-sub-head', step: 0 },
      { sel: '.fullstack-subjects .fs-sub-grid > *', step: 0.045 },
      { sel: '.fullstack-subjects .fs-sub-note', step: 0 },
      { sel: '#subject .landing-footer', step: 0 },
      { sel: '.hub .entry-grid > *', step: 0.055 },
      { sel: '.hub .output-spotlight', step: 0 },
      { sel: '.hub .note', step: 0 },
      { sel: '.hub-shell .entry-grid > *', step: 0.055 },
      { sel: '.hub-shell .hub-sec-title', step: 0 },
      { sel: '.content .part-title', step: 0 },
      { sel: '.content .ch-card', step: 0.045 },
      { sel: '.content .module-card', step: 0.04 },
      { sel: '.exam-blueprint .exam-section-head', step: 0 },
      { sel: '.exam-blueprint .exam-scope > *', step: 0.045 },
      { sel: '.term-window', step: 0 },
      { sel: '.guide-route', step: 0 },
      { sel: '.quiz-window', step: 0 }
    ];
    specs.forEach(function(spec){
      var nodes = [];
      try { nodes = slice(document.querySelectorAll(spec.sel)); } catch (e) { nodes = []; }
      var n = 0;
      nodes.forEach(function(el){
        if(!el.getClientRects().length || el.classList.contains('fx-intro')) return;
        // 超长容器（如终端指令总面板）不做整层透明动画：既看不到揭示，也会制造巨大的合成层。
        if(el.offsetHeight > window.innerHeight * 2) return;
        if(el.dataset && el.dataset.fxDone) return;
        if(!el.classList.contains('fx-reveal')){
          el.classList.add('fx-reveal');
          el.style.setProperty('--fx-delay', (n * spec.step).toFixed(3) + 's');
          el.addEventListener('animationend', function(e){
            if(e.animationName === 'fx-reveal') finish(el);
          }, { once: true });
          revealEls.push({ el: el, timeout: 0 });
          n++;
        }
      });
    });
  }

  function onIntersect(entries){
    entries.forEach(function(entry){
      if(entry.isIntersecting) reveal(entry.target);
    });
  }

  function reveal(el){
    var item = null;
    for(var i = 0; i < revealEls.length; i++){
      if(revealEls[i].el === el){ item = revealEls[i]; break; }
    }
    if(!item || el.classList.contains('fx-in')) return;
    if(el.dataset && el.dataset.fxDone) return;
    el.classList.add('fx-in');
    item.timeout = window.setTimeout(function(){ finish(el); }, 1500);
    if(observer) observer.unobserve(el);
  }

  function finish(el){
    if(!el) return;
    if(el.dataset) el.dataset.fxDone = '1';
    el.classList.remove('fx-intro', 'fx-reveal', 'fx-in');
    el.style.removeProperty('--fx-delay');
  }


  function refreshMotion(){
    if(!motionOn || !observer) return;
    var introBefore = introEls.length;
    markIntro();
    startIntro(introEls.slice(introBefore));
    buildTilt();
    var revealBefore = revealEls.length;
    markReveal();
    revealEls.slice(revealBefore).forEach(function(item){
      observer.observe(item.el);
      if(item.el.getBoundingClientRect().top < window.innerHeight * 0.96) reveal(item.el);
    });
  }

  function clearMotion(){
    if(observer){ observer.disconnect(); observer = null; }
    slice(document.querySelectorAll('.fx-intro,.fx-reveal,.fx-tilt')).forEach(function(el){
      el.classList.remove('fx-intro', 'fx-reveal', 'fx-in', 'fx-tilt');
      el.style.removeProperty('--fx-delay');
      el.style.removeProperty('--fx-rx');
      el.style.removeProperty('--fx-ry');
      el.style.removeProperty('--fx-gx');
      el.style.removeProperty('--fx-gy');
    });
    introEls = [];
    revealEls = [];
    tiltEls = [];
    root.classList.remove('fx-motion');
    motionOn = false;
  }

  function buildTilt(){
    if(!canMove() || !window.matchMedia) return;
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if(!fine || window.innerWidth <= 760) return;
    var selector = '';
    if(document.getElementById('subject')) selector = '.subject-card,.fs-subject';
    else if(document.querySelector('.hub,.hub-shell')) selector = '.entry';
    else if(document.querySelector('.ch-card,.module-card')) selector = '.ch-card,.module-card';
    if(!selector) return;
    var nodes = slice(document.querySelectorAll(selector));
    nodes.forEach(function(el){
      if(!el.getClientRects().length || el.classList.contains('fx-tilt')) return;
      el.classList.add('fx-tilt');
      var wantGlint = !el.classList.contains('subject-card');
      if(wantGlint) el.classList.add('fx-glint-host');
      if(wantGlint && !el.querySelector('.fx-glint')){
        var glint = document.createElement('span');
        glint.className = 'fx-glint';
        glint.setAttribute('aria-hidden', 'true');
        el.appendChild(glint);
      }
      el.addEventListener('pointerenter', resetTilt, { passive: true });
      el.addEventListener('pointerleave', resetTilt, { passive: true });
      tiltEls.push(el);
    });
  }

  function resetTilt(event){
    var el = event.currentTarget;
    if(!el) return;
    el.style.setProperty('--fx-rx', '0deg');
    el.style.setProperty('--fx-ry', '0deg');
    el.style.setProperty('--fx-gx', '50%');
    el.style.setProperty('--fx-gy', '50%');
  }

  function bindPointer(){
    var needGlass = !window.__JGL_POINTER__ && !root.dataset.jglPointer;
    var GLASS = '.subject-card,.card,.study-card,.lesson-item,.sec-card,.wb-card,.wb-stat .box,.dict-item,.hw-qcard,.logic-qcard,.review,.to-box,.panel-card,.panel-card.elevated,.score-card,.trial-card,.bug-card,.know-card,.lq-rcard,.term-card,.api-cn-item,.study-wrap,.hw-opt,.logic-choice,.subject-icon';
    document.addEventListener('pointermove', function(e){
      if(e.pointerType === 'touch') return;
      var glass = needGlass && e.target && e.target.closest ? e.target.closest(GLASS) : null;
      if(glass){
        var r = glass.getBoundingClientRect();
        glassPending = { el: glass, x: e.clientX - r.left, y: e.clientY - r.top };
      }
      var tilt = e.target && e.target.closest ? e.target.closest('.fx-tilt') : null;
      if(tilt){
        var tr = tilt.getBoundingClientRect();
        var nx = (e.clientX - tr.left) / Math.max(1, tr.width) - 0.5;
        var ny = (e.clientY - tr.top) / Math.max(1, tr.height) - 0.5;
        tiltPending = {
          el: tilt,
          ry: (-nx * 3).toFixed(2) + 'deg',
          rx: (ny * 2.4).toFixed(2) + 'deg',
          gx: ((e.clientX - tr.left) / Math.max(1, tr.width) * 100).toFixed(1) + '%',
          gy: ((e.clientY - tr.top) / Math.max(1, tr.height) * 100).toFixed(1) + '%'
        };
      }
      if((glassPending || tiltPending) && !raf) raf = window.requestAnimationFrame(paintPointer);
    }, { passive: true });
  }

  function paintPointer(){
    raf = 0;
    if(glassPending){
      glassPending.el.style.setProperty('--jgl-x', glassPending.x.toFixed(1) + 'px');
      glassPending.el.style.setProperty('--jgl-y', glassPending.y.toFixed(1) + 'px');
      glassPending = null;
    }
    if(tiltPending){
      tiltPending.el.style.setProperty('--fx-rx', tiltPending.rx);
      tiltPending.el.style.setProperty('--fx-ry', tiltPending.ry);
      tiltPending.el.style.setProperty('--fx-gx', tiltPending.gx);
      tiltPending.el.style.setProperty('--fx-gy', tiltPending.gy);
      tiltPending = null;
    }
  }

  function bindEnvironment(){
    function wake(){
      if(motionOn || !canMove() || root.classList.contains('fx-motion')) return;
      try { initMotion(); } catch (err) { root.classList.remove('fx-motion'); }
    }
    window.addEventListener('focus', wake);
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) wake(); });
    if(reduceQuery){
      var handler = function(){
        if(reduceQuery.matches){
          clearMotion();
        } else {
          try { initMotion(); } catch (err) { root.classList.remove('fx-motion'); }
        }
      };
      if(reduceQuery.addEventListener) reduceQuery.addEventListener('change', handler);
      else if(reduceQuery.addListener) reduceQuery.addListener(handler);
    }
    var resizeTimer = 0;
    window.addEventListener('resize', function(){
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function(){
        if(window.innerWidth <= 760){
          tiltEls.forEach(function(el){
            el.classList.remove('fx-tilt');
            el.style.removeProperty('--fx-rx');
            el.style.removeProperty('--fx-ry');
            el.style.removeProperty('--fx-gx');
            el.style.removeProperty('--fx-gy');
          });
          tiltEls = [];
        } else if(motionOn && !tiltEls.length){
          buildTilt();
        }
      }, 160);
    }, { passive: true });
  }

  /* ==========================================================
     z118 · 全站快速跳转
     43 个页面入口 + 本地最近记录；⌘K / Ctrl+K 或左下角入口打开。
     只在顶层页面挂载，iframe 内不重复注入。
     ========================================================== */
  var NAV_PAGES = [
    {r:'index.html', n:'学科地图', d:'Java / Python / JavaScript / AI / 全栈 / 终端与题库总入口', c:'学科', b:'MAP', h:'home', t:'首页 主页 学科 地图 导航 学习中心 错题本 全栈 终端 题库 考试'},
    {r:'subjects/java-hub.html', n:'Java 学科', d:'改错 / 基础 / 课程 / API / 算法 / 输出实现场', c:'学科', b:'JAVA', h:'java', t:'java 学科 入口 改错 基础 api 算法 输出'},
    {r:'subjects/java.html', n:'Java 改错实验室', d:'练习室入口 · 三档难度与真实编译运行', c:'题库', b:'JAVA', h:'java', t:'java 改错 实验室 练习室 debug'},
    {r:'subjects/java-basics.html', n:'Java 基础练习室', d:'基础语法与面向对象练习入口', c:'题库', b:'JAVA', h:'java', t:'java 基础 语法 练习 练习室'},
    {r:'subjects/java-course.html', n:'Java 核心编程', d:'五篇 18 章 50 课 · 从语法到工程实战', c:'课程', b:'JAVA', h:'java', t:'java 课程 核心 编程 学习资料 18章 50课'},
    {r:'subjects/java-output.html', n:'Java 输出实现场', d:'54 题 162 组 · 从空白写完整程序', c:'题库', b:'JAVA', h:'java', t:'java 输出 实现场 判题 javac 54题'},
    {r:'subjects/api.html', n:'Java API 文档', d:'Java API 完整文档与练习室', c:'速查', b:'API', h:'java', t:'java api 文档 完整 速查 练习室'},
    {r:'subjects/algorithm.html', n:'算法与代码逻辑', d:'算法与代码逻辑练习室', c:'题库', b:'ALGO', h:'java', t:'算法 代码逻辑 练习室 algorithm'},
    {r:'subjects/python.html', n:'Python 科目', d:'改错 / 输出 / 课程 / API 全量索引', c:'学科', b:'PY', h:'python', t:'python 科目 入口 改错 输出 课程 api'},
    {r:'python-debug-lab.html', n:'Python 改错实验室', d:'三档难度 · 真实 CPython 判题', c:'题库', b:'PY', h:'python', t:'python 改错 实验室 练习室 cpython debug'},
    {r:'subjects/python-course.html', n:'Python 核心编程', d:'五篇 18 章 76 节 · 三本教材综合版', c:'课程', b:'PY', h:'python', t:'python 课程 核心 编程 学习资料 18章 76节'},
    {r:'subjects/python-output.html', n:'Python 输出实现场', d:'60 题 180 组 · 真实 CPython 运行', c:'题库', b:'PY', h:'python', t:'python 输出 实现场 判题 cpython 60题'},
    {r:'subjects/python-api.html', n:'Python API 全量索引', d:'18,700+ 条 Python 3.13 官方文档', c:'速查', b:'PY', h:'python', t:'python api 索引 官方文档 全量 速查'},
    {r:'subjects/cpp-hub.html', n:'C++ 学科', d:'课程 / 改错 / 输出 / 站内 API 速查', c:'学科', b:'C++', h:'cpp', t:'cpp c++ 学科 入口 课程 改错 输出 api'},
    {r:'subjects/cpp-course.html', n:'C++ 现代编程', d:'五篇 18 章 96 课 · C++20 工程实战', c:'课程', b:'C++', h:'cpp', t:'cpp c++ 课程 现代 编程 学习资料 18章 96课'},
    {r:'subjects/cpp-output.html', n:'C++ 输出实现场', d:'102 题 306 组 · GCC 14.1 真实编译', c:'题库', b:'C++', h:'cpp', t:'cpp c++ 输出 实现场 判题 gcc 102题'},
    {r:'subjects/cpp-debug-lab.html', n:'C++ 改错实验室', d:'3 档 102 题 · C++20 改错与用例比对', c:'题库', b:'C++', h:'cpp', t:'cpp c++ 改错 实验室 练习室 102题'},
    {r:'subjects/cpp-api.html', n:'C++ API 速查', d:'12 组 164 条高频标准库条目', c:'速查', b:'API', h:'cpp', t:'cpp c++ api 标准库 速查 164条'},
    {r:'subjects/javascript-hub.html', n:'JavaScript 学科', d:'课程 / 改错 / 输出 / 练习 / 速查', c:'学科', b:'JS', h:'js', t:'javascript js 学科 入口 课程 改错 输出 练习 api'},
    {r:'subjects/javascript-course.html', n:'JavaScript 核心编程', d:'五篇 18 章 76 节 · 浏览器实战', c:'课程', b:'JS', h:'js', t:'javascript js 课程 核心 编程 学习资料 18章 76节'},
    {r:'subjects/javascript-debug-lab.html', n:'JavaScript 改错实验室', d:'3 档 84 题 · Worker 真实运行', c:'题库', b:'JS', h:'js', t:'javascript js 改错 实验室 练习室 84题'},
    {r:'subjects/javascript-output.html', n:'JavaScript 输出实现场', d:'3 档 66 题 · 198 组用例', c:'题库', b:'JS', h:'js', t:'javascript js 输出 实现场 判题 66题'},
    {r:'subjects/javascript-practice.html', n:'JavaScript 练习场', d:'3 档 54 题 · 输出预测与错题本', c:'题库', b:'JS', h:'js', t:'javascript js 练习 练习场 54题 错题本'},
    {r:'subjects/javascript-reference.html', n:'JavaScript API 速查', d:'8 组 97 条高频 API 与坑点', c:'速查', b:'JS', h:'js', t:'javascript js api 速查 97条'},
    {r:'subjects/ai-hub.html', n:'AI 学科', d:'人工智能 / 大模型 / 硬件知识', c:'学科', b:'AI', h:'ai', t:'ai 人工智能 大模型 llm 硬件 学科 入口'},
    {r:'subjects/ai.html', n:'AI 练习室', d:'人工智能练习入口', c:'题库', b:'AI', h:'ai', t:'ai 人工智能 练习室 练习'},
    {r:'subjects/llm.html', n:'大模型 LLM 全景', d:'大模型知识与练习入口', c:'题库', b:'LLM', h:'ai', t:'大模型 llm 练习室 练习 全景'},
    {r:'subjects/hardware.html', n:'硬件知识答题', d:'硬件知识答题练习室', c:'题库', b:'HW', h:'ai', t:'硬件 知识 答题 练习室 hardware'},
    {r:'subjects/fullstack.html', n:'全栈开发路线', d:'10 大科目 558 课与毕业标准', c:'课程', b:'FS', h:'fs', t:'全栈 fullstack 路线 课程 毕业 标准 558课'},
    {r:'subjects/fullstack-exam.html', n:'全栈结业考试', d:'10 科 60 题 · 100 分结业考试', c:'题库', b:'EXAM', h:'fs', t:'全栈 结业 考试 60题 100分 测评'},
    {r:'subjects/foundation-course.html', n:'工程基础与 Git', d:'Git / Linux / 调试 / 工程基础', c:'课程', b:'GIT', h:'fs', t:'git linux 工程 基础 调试 课程'},
    {r:'subjects/backend-course.html', n:'后端工程', d:'Spring Boot / FastAPI / Express', c:'课程', b:'BE', h:'fs', t:'后端 backend spring boot fastapi express 课程'},
    {r:'subjects/frontend-course.html', n:'前端工程', d:'TypeScript / React / Vue / Vite', c:'课程', b:'FE', h:'fs', t:'前端 frontend typescript react vue vite 课程'},
    {r:'subjects/network-course.html', n:'计算机网络与 HTTP', d:'TCP/IP / DNS / TLS / HTTP', c:'课程', b:'NET', h:'fs', t:'网络 network tcp ip dns tls http 课程'},
    {r:'subjects/database-course.html', n:'数据库系统', d:'SQL / 建模 / 事务 / 索引 / Redis', c:'课程', b:'DB', h:'fs', t:'数据库 database sql 建模 事务 索引 redis 课程'},
    {r:'subjects/api-auth-course.html', n:'API 设计与认证', d:'REST / OpenAPI / GraphQL / 认证', c:'课程', b:'API', h:'fs', t:'api 认证 auth rest openapi graphql 课程'},
    {r:'subjects/testing-course.html', n:'测试与质量', d:'单元 / 集成 / 组件 / CI 质量门禁', c:'课程', b:'TEST', h:'fs', t:'测试 testing 质量 ci 单元 集成 课程'},
    {r:'subjects/devops-course.html', n:'DevOps 与云部署', d:'Linux / Docker / Nginx / K8s', c:'课程', b:'OPS', h:'fs', t:'devops 云部署 linux docker nginx k8s 课程'},
    {r:'subjects/security-performance-course.html', n:'安全、性能与架构', d:'OWASP / XSS / CSRF / 性能', c:'课程', b:'SEC', h:'fs', t:'安全 性能 架构 owasp xss csrf 课程'},
    {r:'subjects/capstone-course.html', n:'全栈项目实战', d:'从选题、PRD 到部署与监控', c:'课程', b:'CAP', h:'fs', t:'全栈 项目 实战 capstone 部署 监控 课程'},
    {r:'subjects/terminal.html', n:'终端指令全集', d:'3,095 条三平台命令与 45 道题', c:'速查', b:'TERM', h:'term', t:'终端 terminal 命令 三平台 macos linux windows 速查'},
    {r:'subjects/terminal-guide.html', n:'终端入门教程', d:'macOS / Linux / Windows 手把手 8 节', c:'课程', b:'TERM', h:'term', t:'终端 terminal 教程 入门 macos linux windows'},
    {r:'subjects/terminal-quiz.html', n:'终端指令题库', d:'45 道三平台场景单选题', c:'题库', b:'TERM', h:'term', t:'终端 terminal 指令 题库 45题 单选'}
  ];
  var QUICK_CATS = ['全部', '学科', '课程', '题库', '速查'];
  var QUICK_GROUPS = ['学科', '课程', '题库', '速查'];
  var quickWrap = null;
  var quickTrigger = null;
  var quickInput = null;
  var quickList = null;
  var quickCount = null;
  var quickChips = null;
  var quickClear = null;
  var quickRows = [];
  var quickActive = 0;
  var quickFilter = '全部';
  var quickOpen = false;
  var quickBuilt = false;
  var quickLastFocus = null;
  var quickPrevOverflow = '';
  var quickHideTimer = 0;

  function quickEsc(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function quickNorm(value){
    return String(value == null ? '' : value).toLowerCase().replace(/\s+/g, ' ').trim();
  }

  function quickRoot(){
    var path = location.pathname || '/';
    if(/\/$/.test(path)){
      return /\/subjects\/$/.test(path) ? path.replace(/subjects\/$/, '') : path;
    }
    if(/\/[^/]+\.[^/]+$/.test(path)) path = path.replace(/\/[^/]+$/, '/');
    else path += '/';
    return /\/subjects\/$/.test(path) ? path.replace(/subjects\/$/, '') : path;
  }

  function quickPageByRoute(route){
    for(var i = 0; i < NAV_PAGES.length; i += 1){
      if(NAV_PAGES[i].r === route) return NAV_PAGES[i];
    }
    return null;
  }

  function quickCurrentPage(){
    var last = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    if(last === 'java-debug-lab.html') return quickPageByRoute('index.html');
    if(last === 'python-study.html') return quickPageByRoute('subjects/python-course.html');
    for(var i = 0; i < NAV_PAGES.length; i += 1){
      if(NAV_PAGES[i].r.split('/').pop().toLowerCase() === last) return NAV_PAGES[i];
    }
    return null;
  }

  function quickHref(page){
    return quickRoot() + page.r;
  }

  function readQuickRecent(){
    try{
      var list = JSON.parse(localStorage.getItem('fxQuickRecent.v1') || '[]');
      if(!Array.isArray(list)) return [];
      return list.filter(function(route){ return typeof route === 'string' && quickPageByRoute(route); }).slice(0, 6);
    }catch(err){ return []; }
  }

  function noteQuickRecent(route){
    try{
      var list = readQuickRecent();
      list = list.filter(function(item){ return item !== route; });
      list.unshift(route);
      localStorage.setItem('fxQuickRecent.v1', JSON.stringify(list.slice(0, 6)));
    }catch(err){}
  }

  function buildQuickNav(){
    if(quickBuilt || !document.body) return;
    quickBuilt = true;
    var isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || '');
    var keyLabel = isMac ? '⌘K' : 'Ctrl K';
    var searchIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.8"></circle><path d="m16 16 4.2 4.2"></path></svg>';

    quickTrigger = document.createElement('button');
    quickTrigger.type = 'button';
    quickTrigger.className = 'fx-quick-trigger';
    quickTrigger.setAttribute('aria-label', '打开全站快速跳转');
    quickTrigger.setAttribute('aria-haspopup', 'dialog');
    quickTrigger.setAttribute('aria-controls', 'fxPalette');
    quickTrigger.setAttribute('aria-expanded', 'false');
    quickTrigger.innerHTML = '<span class="fx-quick-icon" aria-hidden="true">' + searchIcon + '</span>' +
      '<span class="fx-quick-label">快速跳转</span>' +
      '<kbd class="fx-quick-kbd">' + keyLabel + '</kbd>';
    quickTrigger.addEventListener('click', openQuickNav);
    document.body.appendChild(quickTrigger);

    quickWrap = document.createElement('div');
    quickWrap.className = 'fx-palette';
    quickWrap.id = 'fxPalette';
    quickWrap.hidden = true;
    quickWrap.setAttribute('aria-hidden', 'true');
    quickWrap.innerHTML = '<div class="fx-palette-scrim" data-fx-palette-close></div>' +
      '<section class="fx-palette-panel" role="dialog" aria-modal="true" aria-labelledby="fxPaletteTitle">' +
        '<header class="fx-palette-head">' +
          '<div class="fx-palette-heading"><span class="fx-palette-kicker">QUICK NAV · 43 PAGES</span><h2 id="fxPaletteTitle">全站快速跳转</h2></div>' +
          '<button class="fx-palette-close" type="button" data-fx-palette-close aria-label="关闭快速跳转"><span>关闭</span><kbd>ESC</kbd></button>' +
        '</header>' +
        '<div class="fx-palette-search">' +
          '<span class="fx-palette-search-icon" aria-hidden="true">' + searchIcon + '</span>' +
          '<input id="fxPaletteInput" type="search" inputmode="search" autocomplete="off" spellcheck="false" placeholder="搜索学科、课程、题库、API…" aria-label="搜索全站页面" aria-controls="fxPaletteList" aria-autocomplete="list">' +
          '<button class="fx-palette-clear" type="button" aria-label="清除搜索" hidden>清除</button>' +
        '</div>' +
        '<div class="fx-palette-chips" role="group" aria-label="页面分类"></div>' +
        '<div class="fx-palette-list" id="fxPaletteList" role="listbox" aria-label="页面结果"></div>' +
        '<footer class="fx-palette-foot">' +
          '<span id="fxPaletteCount"></span>' +
          '<span class="fx-palette-keys"><kbd>↑</kbd><kbd>↓</kbd> 选择 <kbd>↵</kbd> 打开 <kbd>ESC</kbd> 关闭</span>' +
        '</footer>' +
      '</section>';
    document.body.appendChild(quickWrap);

    quickInput = document.getElementById('fxPaletteInput');
    quickList = document.getElementById('fxPaletteList');
    quickCount = document.getElementById('fxPaletteCount');
    quickChips = quickWrap.querySelector('.fx-palette-chips');
    quickClear = quickWrap.querySelector('.fx-palette-clear');

    QUICK_CATS.forEach(function(cat){
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'fx-palette-chip';
      chip.dataset.filter = cat;
      chip.textContent = cat;
      chip.addEventListener('click', function(){
        quickFilter = cat;
        updateQuickChips();
        renderQuick(quickInput.value);
      });
      quickChips.appendChild(chip);
    });
    updateQuickChips();

    quickWrap.addEventListener('click', function(event){
      if(event.target.closest('[data-fx-palette-close]')) closeQuickNav();
    });
    quickList.addEventListener('click', function(event){
      var row = event.target.closest('.fx-palette-row');
      if(!row) return;
      var route = row.getAttribute('data-route');
      if(row.getAttribute('data-current') === '1'){
        event.preventDefault();
        closeQuickNav();
        return;
      }
      noteQuickRecent(route);
    });
    quickInput.addEventListener('input', function(){
      quickClear.hidden = !quickInput.value;
      renderQuick(quickInput.value);
    });
    quickClear.addEventListener('click', function(){
      quickInput.value = '';
      quickClear.hidden = true;
      renderQuick('');
      quickInput.focus();
    });
    quickInput.addEventListener('keydown', function(event){
      if(event.isComposing) return;
      if(event.key === 'ArrowDown'){
        event.preventDefault();
        moveQuick(1);
      } else if(event.key === 'ArrowUp'){
        event.preventDefault();
        moveQuick(-1);
      } else if(event.key === 'Home'){
        event.preventDefault();
        if(quickRows.length){ quickActive = 0; updateQuickActive(); }
      } else if(event.key === 'End'){
        event.preventDefault();
        if(quickRows.length){ quickActive = quickRows.length - 1; updateQuickActive(); }
      } else if(event.key === 'Enter'){
        event.preventDefault();
        chooseQuick();
      }
    });
    document.addEventListener('keydown', onQuickKeydown);
  }

  function updateQuickChips(){
    if(!quickChips) return;
    slice(quickChips.querySelectorAll('.fx-palette-chip')).forEach(function(chip){
      var on = chip.dataset.filter === quickFilter;
      chip.classList.toggle('is-on', on);
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  function quickRowHTML(page, index, current){
    var now = current ? '<span class="fx-palette-now">当前</span>' : '';
    return '<a class="fx-palette-row' + (current ? ' is-current' : '') + '"' +
      ' href="' + quickEsc(quickHref(page)) + '"' +
      ' id="fxPaletteOpt' + index + '"' +
      ' data-index="' + index + '"' +
      ' data-route="' + quickEsc(page.r) + '"' +
      ' role="option" aria-selected="false"' +
      (current ? ' data-current="1" aria-current="page"' : '') + '>' +
      '<span class="fx-palette-badge fx-tone-' + quickEsc(page.h) + '" aria-hidden="true">' + quickEsc(page.b) + '</span>' +
      '<span class="fx-palette-copy"><b>' + quickEsc(page.n) + '</b><small>' + quickEsc(page.d) + '</small></span>' +
      '<span class="fx-palette-meta"><em>' + quickEsc(page.c) + '</em>' + now + '<i aria-hidden="true">↵</i></span>' +
      '</a>';
  }

  function renderQuick(value){
    if(!quickList) return;
    var query = quickNorm(value);
    var current = quickCurrentPage();
    var items = NAV_PAGES.filter(function(page){
      if(quickFilter !== '全部' && page.c !== quickFilter) return false;
      if(!query) return true;
      var haystack = quickNorm(page.n + ' ' + page.d + ' ' + page.c + ' ' + page.b + ' ' + page.t + ' ' + page.r);
      return query.split(' ').every(function(part){ return haystack.indexOf(part) >= 0; });
    });
    var html = '';
    var index = 0;
    function addGroup(label, pages){
      if(!pages.length) return;
      html += '<div class="fx-palette-label">' + quickEsc(label) + '</div>';
      pages.forEach(function(page){
        html += quickRowHTML(page, index, current && page.r === current.r);
        index += 1;
      });
    }

    if(!query && quickFilter === '全部'){
      if(current) addGroup('当前页面', [current]);
      var recentRoutes = readQuickRecent();
      var recentPages = [];
      recentRoutes.forEach(function(route){
        var page = quickPageByRoute(route);
        if(page && (!current || page.r !== current.r) && recentPages.indexOf(page) < 0) recentPages.push(page);
      });
      if(recentPages.length) addGroup('最近打开', recentPages.slice(0, 4));
      var used = [];
      if(current) used.push(current.r);
      recentPages.slice(0, 4).forEach(function(page){ used.push(page.r); });
      QUICK_GROUPS.forEach(function(group){
        addGroup(group, items.filter(function(page){
          return page.c === group && used.indexOf(page.r) < 0;
        }));
      });
    } else {
      addGroup(query ? '搜索结果' : '全部页面', items);
    }

    if(!index){
      html = '<div class="fx-palette-empty"><b>没有找到匹配页面</b><span>试试 “java”、“python”、“api”、“终端” 或 “课程”</span><button type="button" data-fx-palette-empty-clear>清除搜索</button></div>';
    }
    quickList.innerHTML = html;
    quickRows = slice(quickList.querySelectorAll('.fx-palette-row'));
    quickActive = 0;
    if(quickRows.length) updateQuickActive();
    else quickInput.removeAttribute('aria-activedescendant');
    quickCount.textContent = (query || quickFilter !== '全部') ? (quickRows.length + ' 个结果') : (NAV_PAGES.length + ' 个页面');
    quickClear.hidden = !quickInput.value;
    var emptyClear = quickList.querySelector('[data-fx-palette-empty-clear]');
    if(emptyClear){
      emptyClear.addEventListener('click', function(){
        quickInput.value = '';
        quickFilter = '全部';
        updateQuickChips();
        renderQuick('');
        quickInput.focus();
      });
    }
  }

  function updateQuickActive(){
    if(!quickRows.length) return;
    if(quickActive < 0) quickActive = quickRows.length - 1;
    if(quickActive >= quickRows.length) quickActive = 0;
    quickRows.forEach(function(row, index){
      var on = index === quickActive;
      row.classList.toggle('is-active', on);
      row.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    var active = quickRows[quickActive];
    quickInput.setAttribute('aria-activedescendant', active.id);
    if(quickOpen) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function moveQuick(delta){
    if(!quickRows.length) return;
    quickActive = (quickActive + delta + quickRows.length) % quickRows.length;
    updateQuickActive();
  }

  function chooseQuick(){
    if(!quickRows.length) return;
    quickRows[quickActive].click();
  }

  function openQuickNav(){
    if(quickOpen || !quickBuilt) return;
    quickOpen = true;
    quickLastFocus = document.activeElement;
    quickPrevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('fx-palette-open');
    window.clearTimeout(quickHideTimer);
    quickWrap.hidden = false;
    quickWrap.setAttribute('aria-hidden', 'false');
    quickTrigger.setAttribute('aria-expanded', 'true');
    quickInput.value = '';
    quickFilter = '全部';
    updateQuickChips();
    renderQuick('');
    window.requestAnimationFrame(function(){ quickWrap.classList.add('is-open'); });
    window.setTimeout(function(){
      if(quickOpen) quickInput.focus({ preventScroll: true });
    }, 60);
  }

  function closeQuickNav(){
    if(!quickOpen) return;
    quickOpen = false;
    quickWrap.classList.remove('is-open');
    document.documentElement.classList.remove('fx-palette-open');
    quickTrigger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = quickPrevOverflow;
    window.clearTimeout(quickHideTimer);
    quickHideTimer = window.setTimeout(function(){
      if(quickOpen) return;
      quickWrap.hidden = true;
      quickWrap.setAttribute('aria-hidden', 'true');
    }, 220);
    if(quickLastFocus && quickLastFocus.focus){
      try{ quickLastFocus.focus({ preventScroll: true }); }catch(err){}
    }
  }

  function onQuickKeydown(event){
    if(event.isComposing) return;
    var key = event.key;
    if((event.metaKey || event.ctrlKey) && (key === 'k' || key === 'K')){
      event.preventDefault();
      if(quickOpen) closeQuickNav();
      else openQuickNav();
      return;
    }
    if(!quickOpen) return;
    if(key === 'Escape'){
      event.preventDefault();
      event.stopPropagation();
      closeQuickNav();
      return;
    }
    if(key !== 'Tab') return;
    var focusables = slice(quickWrap.querySelectorAll('button, input, a[href], [tabindex]:not([tabindex="-1"])')).filter(function(el){
      return el.offsetParent !== null;
    });
    if(!focusables.length) return;
    var first = focusables[0];
    var last = focusables[focusables.length - 1];
    if(event.shiftKey && document.activeElement === first){
      event.preventDefault();
      last.focus();
    } else if(!event.shiftKey && document.activeElement === last){
      event.preventDefault();
      first.focus();
    }
  }

  function initQuickNav(){
    if(window.self !== window.top) return;
    if(location.search.indexOf('embed=1') >= 0) return;
    if(document.documentElement.classList.contains('fx-quick-off')) return;
    buildQuickNav();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else {
    boot();
    if(document.readyState === 'interactive') document.addEventListener('DOMContentLoaded', refreshMotion, { once: true });
  }
})();

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

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else {
    boot();
    if(document.readyState === 'interactive') document.addEventListener('DOMContentLoaded', refreshMotion, { once: true });
  }
})();

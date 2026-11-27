(function () {
  'use strict';

  var reduceQuery = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = !!(reduceQuery && reduceQuery.matches);

  var host = document.getElementById('fsModules');
  var root = document.documentElement;
  if (!host || !root) return;

  if (!reduced) root.classList.add('fs-motion');

  var revealItems = [];
  var markReveal = function (node, delay) {
    if (!node) return;
    node.classList.add('fs-reveal');
    if (delay) node.style.setProperty('--reveal-delay', delay + 'ms');
    revealItems.push(node);
  };

  Array.prototype.forEach.call(host.querySelectorAll('.fs-stage-head'), function (head) {
    markReveal(head, 0);
  });
  Array.prototype.forEach.call(host.querySelectorAll('.fs-grid'), function (grid) {
    Array.prototype.forEach.call(grid.querySelectorAll('.fs-module'), function (card, index) {
      markReveal(card, Math.min(index, 5) * 55);
    });
  });
  Array.prototype.forEach.call(
    document.querySelectorAll('.status-board, .bases, .build-order, .graduation, .fs-foot'),
    function (block) { markReveal(block, 0); }
  );

  var finishReveal = function (node) {
    node.classList.remove('fs-reveal', 'is-visible');
    node.style.removeProperty('--reveal-delay');
  };
  var reveal = function (node) {
    if (node.classList.contains('is-visible')) return;
    node.classList.add('is-visible');
    var cleanup = function (event) {
      if (event && event.target !== node) return;
      if (event && event.animationName && event.animationName !== 'fs-reveal-in') return;
      finishReveal(node);
    };
    node.addEventListener('animationend', cleanup, { once: true });
    window.setTimeout(function () { finishReveal(node); }, 1500);
  };
  var revealAll = function () {
    revealItems.forEach(reveal);
  };

  if (!('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        reveal(entry.target);
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: 0.06 });

    requestAnimationFrame(function () {
      var vh = window.innerHeight || 800;
      revealItems.forEach(function (node) {
        var box = node.getBoundingClientRect();
        if (box.top < vh * 0.94 && box.bottom > 0) reveal(node);
        else io.observe(node);
      });
    });
  }

  var statNodes = Array.prototype.slice.call(document.querySelectorAll('.status-board .stat b'));
  var statTargets = statNodes.map(function (node) { return node.textContent.trim(); });
  if (statNodes.length && !reduced) {
    statNodes.forEach(function (node) { node.textContent = '0'; });
    window.setTimeout(function () {
      statNodes.forEach(function (node, index) {
        var target = Number(statTargets[index].replace(/[^\d]/g, ''));
        if (!target || target < 3) {
          node.textContent = statTargets[index];
          return;
        }
        var started = null;
        var duration = 880 + index * 70;
        var frame = function (now) {
          if (started === null) started = now;
          var progress = Math.min(1, (now - started) / duration);
          var eased = 1 - Math.pow(1 - progress, 3);
          node.textContent = String(Math.round(target * eased));
          if (progress < 1) requestAnimationFrame(frame);
          else node.textContent = statTargets[index];
        };
        requestAnimationFrame(frame);
      });
    }, 360);
  }

  var tabs = Array.prototype.slice.call(document.querySelectorAll('.fs-stage-tab'));
  var sections = Array.prototype.slice.call(document.querySelectorAll('.fs-stage'));
  var ticking = false;
  var syncStage = function () {
    var line = Math.max(180, Math.min(420, Math.round((window.innerHeight || 800) * 0.36)));
    var current = null;
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= line) current = section;
    });
    tabs.forEach(function (tab) {
      var active = !!current && tab.getAttribute('href') === '#stage-' + current.id.replace('stage-', '');
      tab.classList.toggle('is-active', active);
      if (active) tab.setAttribute('aria-current', 'true');
      else tab.removeAttribute('aria-current');
    });
    ticking = false;
  };
  var onScroll = function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(syncStage);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  syncStage();

  var canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduced && canHover && window.innerWidth > 760) {
    Array.prototype.forEach.call(host.querySelectorAll('.fs-module'), function (card) {
      var spot = document.createElement('span');
      spot.className = 'fs-spot';
      spot.setAttribute('aria-hidden', 'true');
      card.insertBefore(spot, card.firstChild);
    });

    var activeCard = null;
    var pointerX = 0;
    var pointerY = 0;
    var pointerFrame = 0;
    host.addEventListener('pointermove', function (event) {
      var card = event.target && event.target.closest ? event.target.closest('.fs-module') : null;
      if (!card || !host.contains(card)) return;
      activeCard = card;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (pointerFrame) return;
      pointerFrame = requestAnimationFrame(function () {
        pointerFrame = 0;
        if (!activeCard) return;
        var box = activeCard.getBoundingClientRect();
        if (!box.width || !box.height) return;
        activeCard.style.setProperty('--mx', ((pointerX - box.left) / box.width * 100).toFixed(1) + '%');
        activeCard.style.setProperty('--my', ((pointerY - box.top) / box.height * 100).toFixed(1) + '%');
      });
    }, { passive: true });
  }

  if (reduceQuery && reduceQuery.addEventListener) {
    reduceQuery.addEventListener('change', function (event) {
      if (event.matches) {
        root.classList.remove('fs-motion');
        revealAll();
      }
    });
  }
})();

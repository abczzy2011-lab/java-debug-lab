/* 三端课程阅读器 · 黑白主题开关（在页面 CSS 之前载入，避免刷新闪色） */
(function () {
  'use strict';

  var KEY = 'courseReader.theme.v1';
  var root = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  var darkMetaColor = meta ? meta.getAttribute('content') : '#080A0E';
  var lightMetaColor = '#F6F2E8';

  function normalize(value) {
    return value === 'light' ? 'light' : 'dark';
  }

  function storedTheme() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (err) {}
    return 'dark';
  }

  function updateButton(theme) {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    var icon = btn.querySelector('.theme-icon');
    var text = btn.querySelector('.theme-text');
    var isLight = theme === 'light';
    if (icon) icon.textContent = isLight ? '☾' : '☀';
    if (text) text.textContent = isLight ? '深色' : '浅色';
    btn.setAttribute('aria-label', isLight ? '切换到深色主题' : '切换到浅色主题');
    btn.setAttribute('title', isLight ? '切换到深色主题' : '切换到浅色主题');
  }

  function apply(theme, persist) {
    theme = normalize(theme);
    root.setAttribute('data-theme', theme);
    if (meta) meta.setAttribute('content', theme === 'light' ? lightMetaColor : darkMetaColor);
    if (persist) {
      try { localStorage.setItem(KEY, theme); } catch (err) {}
    }
    updateButton(theme);
    return theme;
  }

  function bindToggle() {
    var btn = document.getElementById('themeToggle');
    if (!btn || btn.getAttribute('data-theme-bound') === '1') return;
    btn.setAttribute('data-theme-bound', '1');
    updateButton(normalize(root.getAttribute('data-theme')));
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(next, true);
      // 让页面里可能存在的主题监听器同步更新，例如 JS 阅读器的自定义状态。
      try {
        window.dispatchEvent(new CustomEvent('reader-theme-change', { detail: { theme: next } }));
      } catch (err) {}
    });
  }

  // 页面 CSS 载入前先落主题，避免先闪深色再切浅色。
  apply(storedTheme(), false);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindToggle, { once: true });
  } else {
    bindToggle();
  }

  // 多标签页同步：另一个阅读页切换后，本页跟随更新。
  window.addEventListener('storage', function (event) {
    if (event.key === KEY && (event.newValue === 'light' || event.newValue === 'dark')) {
      apply(event.newValue, false);
    }
  });

  window.ReaderTheme = {
    apply: function (theme) { return apply(theme, true); },
    current: function () { return normalize(root.getAttribute('data-theme')); },
    key: KEY
  };
})();

/* Java Doc 共用抽屉控制器：要求页面存在 #docOverlay/#docFrame。
   页面可通过 window.__JAVA_DOC_LINKS__ 返回当前题目相关链接。 */
(function () {
  'use strict';
  const overlay = document.getElementById('docOverlay');
  const frame = document.getElementById('docFrame');
  const quick = document.getElementById('docQuick');
  const loading = document.getElementById('docLoading');
  const newWindow = document.getElementById('docNewWindow');
  const closeButton = document.getElementById('docClose');
  if (!overlay || !frame) return;

  const FALLBACK_DOCS = [
    { label: 'String', path: 'java.base/java/lang/String.html' },
    { label: 'StringBuilder', path: 'java.base/java/lang/StringBuilder.html' },
    { label: 'Arrays', path: 'java.base/java/util/Arrays.html' },
    { label: 'ArrayList', path: 'java.base/java/util/ArrayList.html' },
    { label: 'HashMap', path: 'java.base/java/util/HashMap.html' },
    { label: 'Scanner', path: 'java.base/java/util/Scanner.html' }
  ];
  let lastFocus = null;

  function base(path) {
    return 'api-docs/api/' + String(path || '').replace(/^\/+/, '');
  }

  function docs() {
    try {
      if (typeof window.__JAVA_DOC_LINKS__ === 'function') {
        const list = window.__JAVA_DOC_LINKS__();
        if (Array.isArray(list) && list.length) return list;
      }
    } catch (_) {}
    return FALLBACK_DOCS;
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[ch]));
  }

  function renderQuick() {
    if (!quick) return;
    const list = docs();
    const label = typeof window.__JAVA_DOC_LINKS__ === 'function' ? '本题相关' : '常用 API';
    quick.innerHTML = `<span class="doc-quick-label">${label}</span>` +
      list.map(doc => `<button class="doc-chip" type="button" data-doc-path="${esc(doc.path)}">${esc(doc.label)}</button>`).join('') +
      `<button class="doc-chip search" type="button" data-doc-search="1">搜索文档</button>`;
  }

  function showLoading() {
    if (loading) loading.classList.remove('hidden');
  }

  function load(path) {
    const url = base(path);
    showLoading();
    frame.src = url;
    if (newWindow) newWindow.href = url;
  }

  function open() {
    lastFocus = document.activeElement;
    renderQuick();
    if (!frame.getAttribute('src') || frame.getAttribute('src') === 'about:blank') {
      frame.src = frame.dataset.src || base('index.html');
      showLoading();
    }
    overlay.hidden = false;
    document.body.classList.add('doc-open');
    if (closeButton) closeButton.focus();
  }

  function close() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    document.body.classList.remove('doc-open');
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  frame.addEventListener('load', function () {
    if (!frame.getAttribute('src') || frame.getAttribute('src') === 'about:blank') return;
    if (loading) loading.classList.add('hidden');
    try {
      frame.contentDocument.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') close();
      });
    } catch (_) {}
  });

  if (quick) {
    quick.addEventListener('click', function (event) {
      const chip = event.target.closest('[data-doc-path]');
      if (chip) {
        quick.querySelectorAll('[data-doc-path]').forEach(item => item.classList.toggle('active', item === chip));
        load(chip.dataset.docPath);
        return;
      }
      if (event.target.closest('[data-doc-search]')) {
        quick.querySelectorAll('.doc-chip').forEach(item => item.classList.remove('active'));
        load('search.html');
      }
    });
  }

  if (closeButton) closeButton.addEventListener('click', close);
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) close();
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !overlay.hidden) {
      event.preventDefault();
      close();
    }
  });

  window.openJavaDoc = open;
  window.closeJavaDoc = close;
})();

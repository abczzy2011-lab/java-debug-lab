(function () {
  'use strict';

  var DATA = window.__PYAPI_INDEX__ || { items: [], counts: {}, total: 0, base: '../python-docs/python-3.13-docs-html/' };
  var ITEMS = DATA.items || [];
  var BASE = DATA.base || '../python-docs/python-3.13-docs-html/';
  var MAX_RESULTS = 200;

  var LABELS = {
    module: '模块', class: '类', function: '函数', method: '方法',
    exception: '异常', attribute: '属性', keyword: '关键字', doc: '文档',
    label: '章节', term: '术语', 'c-api': 'C API', pdb: 'PDB',
    cmdoption: '命令行', envvar: '环境变量', opcode: '操作码',
    token: '词法', file: '文件', program: '程序', manpage: '手册',
    option: '选项', other: '其他'
  };
  var MAIN_KINDS = ['module', 'class', 'function', 'method', 'exception', 'attribute', 'keyword', 'doc', 'c-api'];

  var CURATED = [
    'len', 'print', 'range', 'str', 'list', 'dict', 'int', 'float',
    'pathlib.Path', 'json.loads', 'csv.DictReader', 'asyncio.run',
    'dataclasses.dataclass', 'typing.Optional', 'os.path.join', 're.sub',
    'collections.Counter', 'subprocess.run', 'logging.getLogger',
    'sqlite3.connect', 'unittest.mock.patch', 'ValueError', 'dict.get',
    'list.append', 'str.format', 'open', 'enumerate', 'zip', 'sorted', 'map'
  ];

  var qEl = document.getElementById('q');
  var catEl = document.getElementById('cat');
  var resultsEl = document.getElementById('results');
  var countEl = document.getElementById('count');
  var countLabelEl = document.getElementById('countLabel');
  var totalEl = document.getElementById('total');
  var filtersEl = document.getElementById('filters');
  var titleEl = document.getElementById('viewerTitle');
  var kindEl = document.getElementById('viewerKind');
  var frameEl = document.getElementById('docFrame');
  var emptyEl = document.getElementById('viewerEmpty');
  var openEl = document.getElementById('openDoc');
  var copyEl = document.getElementById('copyLink');
  var toastEl = document.getElementById('toast');
  var viewerEl = document.querySelector('.viewer');
  var footTotalEl = document.getElementById('footTotal');

  var state = { kind: 'all', query: '', matches: [], shown: [], active: -1, currentUrl: '' };
  var timer = 0;
  var toastTimer = 0;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function label(kind) { return LABELS[kind] || '其他'; }

  function norm(value) { return String(value == null ? '' : value).toLowerCase(); }

  function fmt(n) { return Number(n || 0).toLocaleString('zh-CN'); }

  function relPath(url) {
    var out = String(url || '');
    if (out.indexOf(BASE) === 0) out = out.slice(BASE.length);
    return out.replace(/^\.\//, '');
  }

  function score(item, terms) {
    var name = item._n;
    var display = item._d;
    var role = item._r;
    var s = 0;
    for (var i = 0; i < terms.length; i += 1) {
      var t = terms[i];
      if (name === t) s += 12000;
      else if (name.indexOf(t) === 0) s += 9000;
      else if (name.indexOf('.' + t) >= 0) s += 7000;
      else if (name.indexOf(t) >= 0) s += 4200;
      else if (display.indexOf(t) >= 0) s += 1600;
      else if (role.indexOf(t) >= 0) s += 400;
      else return -1;
    }
    if (item.k === 'module') s += 30;
    if (item.k === 'class') s += 20;
    if (item.k === 'function') s += 15;
    if (item.k === 'method') s += 10;
    return s;
  }

  function highlight(text, terms) {
    var safe = esc(text);
    if (!terms.length) return safe;
    var pattern = terms
      .filter(function (t) { return t.length >= 2; })
      .map(function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); })
      .join('|');
    if (!pattern) return safe;
    try {
      return safe.replace(new RegExp('(' + pattern + ')', 'ig'), '<mark>$1</mark>');
    } catch (err) { return safe; }
  }

  function curatedItems() {
    var byName = {};
    ITEMS.forEach(function (item) {
      if (!byName[item.n]) byName[item.n] = item;
    });
    return CURATED.map(function (name) { return byName[name]; }).filter(Boolean).slice(0, 24);
  }

  function compute() {
    var query = norm(state.query).trim();
    var terms = query ? query.split(/\s+/).filter(Boolean) : [];
    var kind = state.kind;
    var pool = ITEMS;
    if (kind !== 'all') {
      pool = ITEMS.filter(function (item) { return item.k === kind; });
    }

    if (!query) {
      if (kind === 'all') {
        state.matches = curatedItems();
      } else {
        state.matches = pool.slice(0, MAX_RESULTS);
      }
      return;
    }

    var scored = [];
    for (var i = 0; i < pool.length; i += 1) {
      var item = pool[i];
      var s = score(item, terms);
      if (s >= 0) scored.push({ item: item, score: s });
    }
    scored.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.item.n.length - b.item.n.length || a.item.n.localeCompare(b.item.n);
    });
    state.matches = scored.slice(0, MAX_RESULTS).map(function (x) { return x.item; });
  }

  function renderResults() {
    var query = norm(state.query).trim();
    var terms = query ? query.split(/\s+/).filter(Boolean) : [];
    state.shown = state.matches.slice(0, MAX_RESULTS);
    state.active = state.shown.length ? 0 : -1;

    if (!state.shown.length) {
      resultsEl.innerHTML = '<div class="empty"><b>没有匹配条目。</b><br>试试更短的名称，比如 <code>dict</code>、<code>Path</code>，或切换类别。</div>';
      countEl.textContent = '0';
      countLabelEl.textContent = '条结果';
      return;
    }

    var html = state.shown.map(function (item, index) {
      var path = relPath(item.u);
      return '<button class="result" type="button" role="option" data-i="' + index + '" aria-current="' + (index === 0 ? 'true' : 'false') + '">' +
        '<span class="result-k k-' + esc(item.k) + '">' + esc(label(item.k)) + '</span>' +
        '<span class="result-body">' +
          '<span class="result-name">' + highlight(item.n, terms) + '</span>' +
          '<span class="result-desc">' + highlight(item.d, terms) + '</span>' +
          '<span class="result-path">' + esc(path) + '</span>' +
        '</span></button>';
    }).join('');

    if (state.matches.length > 0 && query) {
      html += '<div class="empty">显示前 ' + state.shown.length + ' 条；继续输入可缩小范围。</div>';
    } else if (!query && state.kind !== 'all') {
      html += '<div class="empty">该类别共 ' + fmt(ITEMS.filter(function (i) { return i.k === state.kind; }).length) + ' 条，显示前 ' + state.shown.length + ' 条。</div>';
    }

    resultsEl.innerHTML = html;
    countEl.textContent = fmt(state.matches.length);
    countLabelEl.textContent = query ? '条结果' : '个常用入口';
  }

  function setActive(index, scroll) {
    if (index < 0 || index >= state.shown.length) return;
    state.active = index;
    var nodes = resultsEl.querySelectorAll('.result');
    for (var i = 0; i < nodes.length; i += 1) {
      nodes[i].setAttribute('aria-current', i === index ? 'true' : 'false');
    }
    var node = nodes[index];
    if (node && scroll) node.scrollIntoView({ block: 'nearest' });
  }

  function openItem(item, scrollToViewer) {
    if (!item) return;
    titleEl.textContent = item.n;
    kindEl.textContent = label(item.k) + ' · ' + item.r;
    openEl.href = item.u;
    emptyEl.style.display = 'none';
    state.currentUrl = item.u;
    frameEl.src = item.u;
    if (scrollToViewer && viewerEl && window.matchMedia('(max-width:760px)').matches) {
      viewerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function selectIndex(index, scrollToViewer) {
    var item = state.shown[index];
    if (!item) return;
    setActive(index, true);
    openItem(item, scrollToViewer);
  }

  function renderFilters() {
    var counts = {};
    ITEMS.forEach(function (item) { counts[item.k] = (counts[item.k] || 0) + 1; });
    var kinds = MAIN_KINDS.filter(function (k) { return counts[k]; });
    Object.keys(counts).forEach(function (k) {
      if (MAIN_KINDS.indexOf(k) < 0 && counts[k] >= 20) kinds.push(k);
    });
    var html = '<div class="filter-group"><div class="filter-title">全部</div>' +
      '<button class="filter" type="button" data-k="all" aria-pressed="' + (state.kind === 'all') + '">' +
      '<span class="dot"></span><span class="txt">全部类别</span><span class="num">' + fmt(DATA.total || ITEMS.length) + '</span></button></div>' +
      '<div class="filter-group"><div class="filter-title">按类型</div>' +
      kinds.map(function (k) {
        return '<button class="filter" type="button" data-k="' + esc(k) + '" aria-pressed="' + (state.kind === k) + '">' +
          '<span class="dot"></span><span class="txt">' + esc(label(k)) + '</span><span class="num">' + fmt(counts[k]) + '</span></button>';
      }).join('') + '</div>';
    filtersEl.innerHTML = html;
  }

  function update() {
    compute();
    renderResults();
    if (state.shown.length) {
      openItem(state.shown[0], false);
    }
  }

  function scheduleUpdate() {
    window.clearTimeout(timer);
    timer = window.setTimeout(update, 120);
  }

  function showToast(text) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove('show'); }, 1800);
  }

  function init() {
    totalEl.textContent = fmt(DATA.total || ITEMS.length) + ' 条';
    if (footTotalEl) footTotalEl.textContent = fmt(DATA.total || ITEMS.length);
    ITEMS.forEach(function (item) {
      item._n = norm(item.n);
      item._d = norm(item.d);
      item._r = norm(item.r);
    });

    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (q) qEl.value = q;
    state.query = q || '';

    renderFilters();
    update();

    qEl.addEventListener('input', function () {
      state.query = qEl.value;
      scheduleUpdate();
    });

    qEl.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setActive(Math.min(state.active + 1, state.shown.length - 1), true);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setActive(Math.max(state.active - 1, 0), true);
      } else if (event.key === 'Enter') {
        event.preventDefault();
        selectIndex(state.active, false);
      } else if (event.key === 'Escape') {
        qEl.value = '';
        state.query = '';
        update();
      }
    });

    catEl.addEventListener('change', function () {
      state.kind = catEl.value;
      renderFilters();
      update();
    });

    filtersEl.addEventListener('click', function (event) {
      var btn = event.target.closest('.filter');
      if (!btn) return;
      state.kind = btn.getAttribute('data-k') || 'all';
      catEl.value = state.kind;
      renderFilters();
      update();
      qEl.focus();
    });

    resultsEl.addEventListener('click', function (event) {
      var btn = event.target.closest('.result');
      if (!btn) return;
      selectIndex(Number(btn.getAttribute('data-i')), true);
    });

    copyEl.addEventListener('click', function () {
      var item = state.shown[state.active];
      if (!item) { showToast('先选择一个条目'); return; }
      var url = new URL(item.u, window.location.href).href;
      var done = function () { showToast('已复制链接'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done, function () { showToast('复制失败，请手动打开新标签'); });
      } else {
        showToast('复制失败，请手动打开新标签');
      }
    });

    frameEl.addEventListener('load', function () {
      var url = state.currentUrl || '';
      var hash = url.indexOf('#') >= 0 ? url.slice(url.indexOf('#') + 1) : '';
      if (!hash) return;
      try {
        var id = decodeURIComponent(hash);
        var doc = frameEl.contentDocument;
        if (!doc) return;
        var target = doc.getElementById(id) || (doc.getElementsByName(id) || [])[0];
        if (!target) return;
        var root = doc.documentElement || doc.body;
        var body = doc.body || root;
        var top = target.getBoundingClientRect().top + (root.scrollTop || body.scrollTop || 0) - 86;
        root.scrollTop = top;
        body.scrollTop = top;
      } catch (err) {}
    });

    window.addEventListener('message', function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

(function () {
  'use strict';

  var groups = window.CPP_API_GROUPS || [];
  var apis = window.CPP_API_APIS || [];
  var byId = {};
  var groupById = {};
  apis.forEach(function (api) { byId[api.id] = api; });
  groups.forEach(function (group) { groupById[group.id] = group; });

  var query = '';
  var filter = 'all';
  var toastTimer = 0;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function groupLabel(id) {
    return groupById[id] ? groupById[id].label : id;
  }

  function matches(api) {
    if (filter !== 'all' && api.group !== filter) return false;
    if (!query) return true;
    var group = groupById[api.group] || {};
    var haystack = [api.name, api.short, api.summary, api.syntax, api.header, api.returns, api.tip, group.label, group.en].join(' ').toLowerCase();
    return query.toLowerCase().split(/\s+/).filter(Boolean).every(function (token) {
      return haystack.indexOf(token) !== -1;
    });
  }

  function searchScore(api) {
    if (!query) return 0;
    var q = query.toLowerCase();
    var name = api.name.toLowerCase();
    var short = String(api.short || '').toLowerCase();
    var syntax = String(api.syntax || '').toLowerCase();
    var summary = String(api.summary || '').toLowerCase();
    var score = 0;
    if (name === q) score += 20;
    else if (name.indexOf(q) === 0) score += 14;
    else if (name.indexOf(q) !== -1) score += 10;
    if (short.indexOf(q) !== -1) score += 6;
    if (syntax.indexOf(q) !== -1) score += 3;
    if (summary.indexOf(q) !== -1) score += 2;
    return score;
  }

  function countExamples() {
    return apis.filter(function (api) { return api.example; }).length;
  }

  function renderHome() {
    $('#app').innerHTML = '<div class="panel">' +
      '<section class="ref-hero">' +
        '<div class="kicker">CPP · STANDARD LIBRARY · ' + apis.length + ' ENTRIES</div>' +
        '<h1>C++ API 速查</h1>' +
        '<p class="sub">12 组 ' + apis.length + ' 条 C++20 高频 API：头文件、签名、说明、返回值、是否修改对象、可复制示例、运行结果和坑点。全部离线，搜索与详情都在站内完成。</p>' +
        '<div class="hero-stats">' +
          '<span class="stat"><b>' + apis.length + '</b> 个条目</span>' +
          '<span class="stat"><b>' + groups.length + '</b> 组</span>' +
          '<span class="stat"><b>' + countExamples() + '</b> 段示例</span>' +
          '<span class="stat"><b>C++20</b> 标准</span>' +
        '</div>' +
        '<div class="search-wrap">' +
          '<span class="search-icon" aria-hidden="true">⌕</span>' +
          '<input id="refSearch" class="ref-search" type="search" placeholder="搜索 vector、sort、filesystem、mutex…" autocomplete="off" aria-label="搜索 C++ API">' +
          '<button class="search-clear" id="searchClear" type="button" aria-label="清空搜索" hidden>清空</button>' +
          '<kbd class="search-kbd">/</kbd>' +
        '</div>' +
      '</section>' +
      '<div class="ref-toolbar">' +
        '<div class="ref-chips" role="group" aria-label="按主题筛选">' +
          '<button type="button" data-group="all" class="' + (filter === 'all' ? 'active' : '') + '">全部 <b>' + apis.length + '</b></button>' +
          groups.map(function (group) {
            return '<button type="button" data-group="' + esc(group.id) + '" class="' + (filter === group.id ? 'active' : '') + '">' + esc(group.label) + ' <b>' + apis.filter(function (api) { return api.group === group.id; }).length + '</b></button>';
          }).join('') +
        '</div>' +
        '<div class="ref-meta"><span id="refCount">' + apis.length + ' / ' + apis.length + ' 条</span><span>或按 <kbd>Ctrl</kbd> + <kbd>K</kbd> 搜索</span></div>' +
      '</div>' +
      '<div class="ref-results" id="refResults"></div>' +
      '<div class="tool-foot">条目覆盖 C++20 标准库高频工具：容器、算法、字符串、流、文件系统、并发、内存、时间、类型工具、数值、正则与错误处理。示例是可直接改造的最小片段，签名以 C++20 为目标。</div>' +
    '</div>';

    var input = $('#refSearch');
    input.value = query;
    input.addEventListener('input', function () {
      query = input.value.trim();
      toggleClear();
      renderResults();
    });
    var clear = $('#searchClear');
    if (clear) clear.addEventListener('click', clearSearch);
    renderResults();
    bindChips();
    updateHeader();
    window.scrollTo(0, 0);
    document.title = 'C++ API 速查 · ' + groups.length + ' 组 ' + apis.length + ' 条';
  }

  function bindChips() {
    $all('[data-group]', $('#app')).forEach(function (btn) {
      btn.addEventListener('click', function () {
        filter = btn.getAttribute('data-group');
        $all('[data-group]', $('#app')).forEach(function (chip) {
          chip.classList.toggle('active', chip.getAttribute('data-group') === filter);
        });
        renderResults();
      });
    });
  }

  function renderResults() {
    var result = $('#refResults');
    if (!result) return;
    var visible = apis.filter(matches);
    if (query) visible.sort(function (a, b) { return searchScore(b) - searchScore(a); });
    var count = $('#refCount');
    if (count) count.textContent = visible.length + ' / ' + apis.length + ' 条';
    if (!visible.length) {
      result.innerHTML = '<div class="ref-empty"><b>没有匹配的条目</b><p>试试更短的关键词：<code>map</code>、<code>Promise</code>、<code>事件</code> 或 <code>深拷贝</code>。</p><button type="button" class="btn ghost" data-clear-empty>清空搜索</button></div>';
      var emptyBtn = $('[data-clear-empty]', result);
      if (emptyBtn) emptyBtn.addEventListener('click', clearSearch);
      return;
    }
    if (query) {
      result.innerHTML = '<section class="ref-group">' +
        '<div class="ref-group-head"><div><span class="ref-group-en">SEARCH RESULTS</span><h2>“' + esc(query) + '” 的结果</h2><p>名称命中优先排序；点击卡片查看签名、示例和坑点。</p></div>' +
        '<span class="ref-group-count">' + visible.length + ' 条</span></div>' +
        '<div class="api-grid">' + visible.map(apiCard).join('') + '</div>' +
      '</section>';
    } else {
      var shownGroups = groups.filter(function (group) {
        return filter === 'all' || group.id === filter;
      });
      result.innerHTML = shownGroups.map(function (group) {
      var items = visible.filter(function (api) { return api.group === group.id; });
      if (!items.length) return '';
      return '<section class="ref-group">' +
        '<div class="ref-group-head"><div><span class="ref-group-en">' + esc(group.en) + '</span><h2>' + esc(group.label) + '</h2><p>' + esc(group.summary) + '</p></div>' +
        '<span class="ref-group-count">' + items.length + ' 条</span></div>' +
        '<div class="api-grid">' + items.map(apiCard).join('') + '</div>' +
        '</section>';
      }).join('');
    }
    $all('[data-api]', result).forEach(function (card) {
      card.addEventListener('click', function () { location.hash = 'api=' + card.getAttribute('data-api'); });
    });
  }

  function apiCard(api) {
    return '<button class="api-card" type="button" data-api="' + esc(api.id) + '">' +
      '<div class="api-top"><span class="api-name">' + esc(api.name) + '</span><span class="api-short">' + esc(api.short) + '</span></div>' +
      '<p class="api-sum">' + esc(api.summary) + '</p>' +
      '<code class="api-syntax">' + esc(api.syntax) + '</code>' +
      '<div class="api-foot"><span class="api-group">' + esc(groupLabel(api.group)) + '</span><span class="api-badge ' + (api.mutates ? 'mutates' : '') + '">' + (api.mutates ? '会修改原值' : '返回新值 / 只读') + '</span></div>' +
    '</button>';
  }

  function clearSearch() {
    query = '';
    var input = $('#refSearch');
    if (input) { input.value = ''; input.focus(); }
    toggleClear();
    renderResults();
  }

  function toggleClear() {
    var clear = $('#searchClear');
    var input = $('#refSearch');
    if (clear) clear.hidden = !(input && input.value);
  }

  function renderDetail(api) {
    var group = groupById[api.group] || { label: api.group, summary: '' };
    var groupApis = apis.filter(function (item) { return item.group === api.group; });
    var at = groupApis.indexOf(api);
    var prev = at > 0 ? groupApis[at - 1] : null;
    var next = at >= 0 && at < groupApis.length - 1 ? groupApis[at + 1] : null;
    var related = groupApis.filter(function (item) { return item.id !== api.id; }).slice(0, 3);

    $('#app').innerHTML = '<div class="panel api-detail">' +
      '<div class="detail-top"><button class="back-link" type="button" data-back><span aria-hidden="true">←</span> 返回速查</button>' +
        '<span class="detail-top-group">' + esc(group.label) + ' · ' + String(at + 1).padStart(2, '0') + ' / ' + String(groupApis.length).padStart(2, '0') + '</span></div>' +
      '<div class="detail-body">' +
        '<div class="detail-eyebrow"><span>' + esc(group.en) + '</span><span class="detail-badge">' + esc(api.header) + '</span><span class="detail-badge ' + (api.mutates ? 'mutates' : '') + '">' + (api.mutates ? '会修改对象' : '不修改对象') + '</span><span class="detail-badge">' + esc(api.returns) + '</span></div>' +
        '<header class="detail-head"><h1>' + esc(api.name) + '</h1><p>' + esc(api.summary) + '</p></header>' +
        '<div class="detail-syntax"><span>签名</span><code>' + esc(api.syntax) + '</code></div>' +
        '<section class="detail-section"><div class="detail-sec-title"><span>EXAMPLE</span><h2>可复制示例</h2><div class="spacer"></div><button class="copy" type="button" data-copy="' + esc(encodeURIComponent(api.example)) + '">复制代码</button></div>' +
          '<div class="code-card"><div class="code-head"><span>cpp</span><span class="code-note">C++20 / GCC</span></div><pre><code>' + esc(api.example) + '</code></pre></div>' +
          '<div class="output"><span>运行结果</span><pre>' + esc(api.output) + '</pre></div>' +
        '</section>' +
        '<section class="detail-point"><b>坑点 / 记住这一点</b><p>' + esc(api.tip) + '</p></section>' +
        '<div class="detail-facts"><div><span>头文件</span><b>' + esc(api.header) + '</b></div><div><span>返回值</span><b>' + esc(api.returns) + '</b></div><div><span>是否修改对象</span><b>' + (api.mutates ? '是' : '否') + '</b></div></div>' +
        '<section class="related"><div class="detail-sec-title"><span>RELATED</span><h2>同一主题</h2></div><div class="related-grid">' +
          related.map(function (item) {
            return '<button class="related-card" type="button" data-related="' + esc(item.id) + '"><span>' + esc(item.short) + '</span><p>' + esc(item.summary) + '</p></button>';
          }).join('') +
        '</div></section>' +
        '<div class="detail-actions"><button class="btn ghost" type="button" data-copy="' + esc(encodeURIComponent(api.syntax)) + '">复制签名</button><button class="btn ghost" type="button" data-related-group>查看本组 ' + groupApis.length + ' 条</button></div>' +
      '</div>' +
      '<footer class="detail-foot">' +
        '<button class="foot-btn" type="button" data-prev ' + (prev ? 'data-target="' + esc(prev.id) + '"' : 'aria-disabled="true"') + '><span aria-hidden="true">←</span> ' + (prev ? esc(prev.short) : '已经是第一条') + '</button>' +
        '<button class="foot-btn" type="button" data-next ' + (next ? 'data-target="' + esc(next.id) + '"' : 'aria-disabled="true"') + '>' + (next ? esc(next.short) : '已经是最后一条') + ' <span aria-hidden="true">→</span></button>' +
      '</footer>' +
    '</div>';

    $('[data-back]', $('#app')).addEventListener('click', function () { location.hash = 'reference'; });
    var prevBtn = $('[data-prev]', $('#app'));
    if (prevBtn && prevBtn.getAttribute('data-target')) prevBtn.addEventListener('click', function () { location.hash = 'api=' + prevBtn.getAttribute('data-target'); });
    var nextBtn = $('[data-next]', $('#app'));
    if (nextBtn && nextBtn.getAttribute('data-target')) nextBtn.addEventListener('click', function () { location.hash = 'api=' + nextBtn.getAttribute('data-target'); });
    $all('[data-related]', $('#app')).forEach(function (btn) {
      btn.addEventListener('click', function () { location.hash = 'api=' + btn.getAttribute('data-related'); });
    });
    var groupBtn = $('[data-related-group]', $('#app'));
    if (groupBtn) groupBtn.addEventListener('click', function () {
      filter = api.group;
      location.hash = 'reference';
    });
    updateHeader();
    window.scrollTo(0, 0);
    document.title = api.name + ' · C++ API 速查';
  }

  function updateHeader() {
    var el = $('#topProgress');
    if (el) el.textContent = apis.length + ' 条';
  }

  function route() {
    var hash = decodeURIComponent((location.hash || '').replace(/^#/, ''));
    if (hash.indexOf('api=') === 0) {
      var api = byId[hash.slice(4)];
      if (api) { renderDetail(api); return; }
    }
    renderHome();
  }

  function showToast(message) {
    var toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.left = '-9999px';
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); resolve(); } catch (err) { reject(err); }
      document.body.removeChild(area);
    });
  }

  function init() {
    if (!groups.length || !apis.length) {
      $('#app').innerHTML = '<div class="panel"><div class="empty">速查数据未载入。请检查 assets/js/cpp-api/cpp-api-data.js。</div></div>';
      return;
    }
    var initialQuery = new URLSearchParams(location.search).get('q');
    if (initialQuery) query = initialQuery.trim();
    route();
    window.addEventListener('hashchange', route);
    document.addEventListener('click', function (event) {
      var copy = event.target.closest ? event.target.closest('[data-copy]') : null;
      if (!copy) return;
      copyText(decodeURIComponent(copy.getAttribute('data-copy') || '')).then(function () {
        var old = copy.textContent;
        copy.textContent = '已复制';
        copy.classList.add('ok');
        setTimeout(function () { copy.textContent = old; copy.classList.remove('ok'); }, 1400);
      }).catch(function () { showToast('复制失败，请手动选择'); });
    });
    document.addEventListener('keydown', function (event) {
      var key = event.key.toLowerCase();
      var isSearchShortcut = (event.metaKey || event.ctrlKey) && key === 'k';
      var input = $('#refSearch');
      if (isSearchShortcut && input) {
        event.preventDefault();
        input.focus();
        input.select();
      } else if (event.key === '/' && input && document.activeElement !== input) {
        event.preventDefault();
        input.focus();
      } else if (event.key === 'Escape' && document.activeElement === input && input.value) {
        event.preventDefault();
        clearSearch();
      }
    });
  }

  init();
})();

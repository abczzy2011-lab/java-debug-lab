/* 终端常用指令 · 页面渲染
 * 数据在 terminal-commands.js；本文件只负责平台切换、筛选、复制和掌握进度。
 */
(() => {
  'use strict';

  const DATA = window.TERMINAL_DATA;
  if (!DATA || !DATA.platforms) return;

  const DATA_VERSION = encodeURIComponent(DATA.version || '20261127z92n');
  const DATA_URL = id => `../assets/data/terminal-${id}.json?v=${DATA_VERSION}`;
  const LS_KEY = 'jdl.terminal.mastered.v2';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (value = '') => String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));

  const loadMastered = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      return raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    } catch {
      return {};
    }
  };

  const PAGE_SIZE = 120;
  const flatCache = new Map();
  const loads = new Map();
  let fallbackLoad = null;
  let searchTimer = 0;
  const state = {
    platform: 'macos',
    group: 'all',
    query: '',
    limit: PAGE_SIZE,
    mastered: loadMastered(),
    loading: '',
  };

  const els = {
    tabs: $('#termOsTabs'),
    filters: $('#termFilters'),
    grid: $('#termGrid'),
    search: $('#termSearch'),
    count: $('#termResultCount'),
    title: $('#termPanelTitle'),
    subtitle: $('#termPanelSubtitle'),
    progress: $('#termProgress'),
    heroCount: $('#termHeroCount'),
    heroGroups: $('#termHeroGroups'),
    empty: $('#termEmpty'),
    reset: $('#termReset'),
    loadMore: $('#termLoadMore'),
    showAll: $('#termShowAll'),
    more: $('#termMore'),
    toast: $('#termToast'),
  };

  const platform = () => DATA.platforms[state.platform] || DATA.platforms.macos;
  const isReady = (id) => {
    const p = DATA.platforms[id];
    return Boolean(p && p.commands && Object.keys(p.commands).length);
  };
  const groups = () => DATA.groups.map(g => {
    const override = platform().groupOverrides && platform().groupOverrides[g.id];
    return override ? { ...g, ...override } : g;
  });

  const FIRST = [
    'pwd', 'ls', 'cd', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'cat', 'less', 'grep',
    'chmod', 'ps', 'kill', 'curl', 'ssh', 'git', 'docker', 'tar', 'brew',
    'powershell', 'pwsh', 'dir', 'get-childitem', 'winget',
  ];
  const rank = (id) => {
    const i = FIRST.indexOf(String(id).toLowerCase());
    return i === -1 ? FIRST.length : i;
  };
  const allCommands = () => {
    if (!isReady(state.platform)) return [];
    if (flatCache.has(state.platform)) return flatCache.get(state.platform);
    const p = platform();
    const rows = groups().flatMap((g, gi) => (p.commands && p.commands[g.id]
      ? p.commands[g.id].map((c, ci) => ({ ...c, group: g, _gi: gi, _ci: ci }))
      : []));
    flatCache.set(state.platform, rows);
    return rows;
  };

  const keyOf = (cmd) => `${state.platform}:${cmd.group.id}:${cmd.id}`;

  const isMastered = (cmd) => Boolean(state.mastered[keyOf(cmd)]);

  const masteredCount = () => allCommands().filter(isMastered).length;

  const groupCount = (groupId) => {
    const p = platform();
    if (p.groupCounts && typeof p.groupCounts[groupId] === 'number') return p.groupCounts[groupId];
    return p.commands && p.commands[groupId] ? p.commands[groupId].length : 0;
  };

  const loadFallback = () => {
    if (fallbackLoad) return fallbackLoad;
    fallbackLoad = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `../assets/js/terminal-commands.js?v=${DATA_VERSION}`;
      script.onload = () => {
        const full = window.TERMINAL_DATA;
        if (!full || !full.platforms) {
          reject(new Error('fallback data missing'));
          return;
        }
        DATA.platforms = full.platforms;
        DATA.groups = full.groups || DATA.groups;
        DATA.total = full.total || Object.values(full.platforms).reduce((sum, p) =>
          sum + Object.values(p.commands || {}).reduce((n, rows) => n + rows.length, 0), 0);
        flatCache.clear();
        resolve();
      };
      script.onerror = () => reject(new Error('fallback load failed'));
      document.head.appendChild(script);
    });
    return fallbackLoad;
  };

  const loadPlatform = (id) => {
    if (isReady(id)) return Promise.resolve();
    if (loads.has(id)) return loads.get(id);
    const promise = fetch(DATA_URL(id), { credentials: 'same-origin' })
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then(payload => {
        if (!payload || !payload.commands) throw new Error('invalid platform data');
        DATA.platforms[id] = { ...DATA.platforms[id], ...payload };
        flatCache.delete(id);
      })
      .catch(error => {
        console.warn(`终端数据 ${id} 加载失败，回退到全量脚本`, error);
        return loadFallback().then(() => {
          if (!isReady(id)) throw error;
        });
      })
      .finally(() => loads.delete(id));
    loads.set(id, promise);
    return promise;
  };

  const renderLoading = (id) => {
    if (!els.grid) return;
    const p = DATA.platforms[id] || {};
    els.grid.classList.remove('is-planned');
    els.grid.innerHTML = `<div class="term-empty" style="grid-column:1/-1"><strong>正在载入 ${esc(p.label || id)} 指令…</strong><span>已先显示平台、分组和快捷键，命令正文按需加载。</span></div>`;
    if (els.title) els.title.textContent = `${p.label || id} 指令全集`;
    if (els.subtitle) els.subtitle.textContent = '正在按平台载入命令数据…';
    if (els.count) els.count.textContent = `${p.label || id} · 载入中`;
    if (els.more) els.more.hidden = true;
    if (els.empty) els.empty.hidden = true;
    if (els.search) {
      els.search.disabled = true;
      els.search.placeholder = `${p.label || id} 数据载入中…`;
    }
    renderProgress();
  };

  const renderError = (id) => {
    if (!els.grid) return;
    const p = DATA.platforms[id] || {};
    els.grid.innerHTML = `<div class="term-empty" style="grid-column:1/-1"><strong>${esc(p.label || id)} 数据加载失败</strong><span>请检查网络后刷新页面，其他平台仍可切换。</span></div>`;
    if (els.title) els.title.textContent = `${p.label || id} 指令全集`;
    if (els.subtitle) els.subtitle.textContent = '命令数据加载失败，请检查网络后刷新';
    if (els.count) els.count.textContent = `${p.label || id} · 加载失败`;
    if (els.more) els.more.hidden = true;
    if (els.empty) els.empty.hidden = true;
    if (els.search) els.search.disabled = true;
  };

  const matches = (cmd) => {
    if (state.group !== 'all' && cmd.group.id !== state.group) return false;
    const q = state.query.trim().toLowerCase();
    if (!q) return true;
    const haystack = [
      cmd.syntax, cmd.title, cmd.desc, cmd.example, cmd.note,
      (cmd.keywords || []).join(' '), cmd.group.name,
    ].join(' ').toLowerCase();
    return q.split(/\s+/).every(part => haystack.includes(part));
  };

  // 有搜索词时，命令本体命中优先于说明文字命中；避免搜 Get-ChildItem 先看到 ls 的等价说明。
  const searchScore = (cmd) => {
    const q = state.query.trim().toLowerCase();
    if (!q) return 0;
    const syntax = String(cmd.copy || cmd.syntax || '').toLowerCase();
    const first = syntax.split(/\s+/)[0];
    const id = String(cmd.id || '').toLowerCase();
    const kw = (cmd.keywords || []).map(k => String(k).toLowerCase());
    if (syntax === q || first === q || id === q || kw[0] === q) return 0;
    if (syntax.startsWith(q) || id.startsWith(q) || kw.some(k => k.startsWith(q))) return 1;
    if (syntax.includes(q) || id.includes(q) || kw.some(k => k.includes(q))) return 2;
    if (String(cmd.title || '').toLowerCase().includes(q)) return 3;
    if (String(cmd.desc || '').toLowerCase().includes(q)) return 4;
    if (String(cmd.example || '').toLowerCase().includes(q)) return 5;
    return 6;
  };

  const renderTabs = () => {
    if (!els.tabs) return;
    els.tabs.innerHTML = Object.entries(DATA.platforms).map(([id, p]) => `
      <button class="term-os-tab ${id === state.platform ? 'is-active' : ''}" type="button"
        role="tab" aria-selected="${id === state.platform}" data-os="${id}">
        <span class="term-os-glyph" aria-hidden="true">${id === 'macos' ? '⌘' : id === 'linux' ? 'L' : 'W'}</span>
        <span class="term-os-copy"><b>${esc(p.label)}</b><em>${esc(p.status === 'ready' ? p.badge : p.badge)}</em></span>
        <span class="term-os-state ${p.status === 'ready' ? 'ready' : 'planned'}">${p.status === 'ready' ? '已上线' : '框架'}</span>
      </button>
    `).join('');
  };

  const renderFilters = () => {
    if (!els.filters) return;
    const p = platform();
    const total = typeof p.count === 'number' ? p.count : allCommands().length;
    els.filters.innerHTML = [
      `<button class="term-filter ${state.group === 'all' ? 'is-active' : ''}" type="button"
        data-group="all" aria-pressed="${state.group === 'all'}" ${p.status === 'planned' ? 'disabled' : ''}>
        全部<span>${total}</span>
      </button>`,
      ...groups().map(g => `<button class="term-filter ${state.group === g.id ? 'is-active' : ''}" type="button"
        data-group="${g.id}" aria-pressed="${state.group === g.id}" ${p.status === 'planned' ? 'disabled' : ''}>
        ${esc(g.short)}<span>${groupCount(g.id)}</span>
      </button>`),
    ].join('');
  };

  const cleanText = (value = '') => String(value)
    .replace(/`([^`]+)`/g, '「$1」')
    .replace(/`/g, '');

  const commandCard = (cmd, index) => {
    const mastered = isMastered(cmd);
    const prompt = state.platform === 'windows' ? 'PS>' : '$';
    const title = cleanText(cmd.title);
    const desc = cleanText(cmd.desc);
    const note = cleanText(cmd.note);
    return `
      <article class="term-card ${cmd.danger ? 'is-danger' : ''} ${mastered ? 'is-mastered' : ''}"
        style="--card-tone:var(--tone-${esc(cmd.group.tone)})"
        data-key="${esc(keyOf(cmd))}" data-command-id="${esc(cmd.id)}">
        <div class="term-card-top">
          <span class="term-card-no">${esc(cmd.group.no)}.${String(index + 1).padStart(2, '0')}</span>
          <span class="term-card-tag">${esc(cmd.group.short)}</span>
          ${cmd.danger ? '<span class="term-card-danger">谨慎</span>' : ''}
          <button class="term-copy" type="button" data-copy="${esc(cmd.copy || cmd.syntax)}"
            aria-label="复制命令：${esc(cmd.syntax)}" title="复制命令">复制</button>
        </div>
        <div class="term-code"><span class="term-code-prompt" aria-hidden="true">${prompt}</span><code>${esc(cmd.syntax)}</code></div>
        <h3>${esc(title)}</h3>
        <p class="term-desc">${esc(desc)}</p>
        <div class="term-example"><span>示例</span><pre>${esc(cmd.example || cmd.syntax)}</pre></div>
        <div class="term-note"><span>提示</span><p>${esc(note)}</p></div>
        <button class="term-master ${mastered ? 'is-on' : ''}" type="button"
          aria-pressed="${mastered}" data-master="${esc(keyOf(cmd))}">
          ${mastered ? '✓ 已掌握' : '标记已掌握'}
        </button>
      </article>
    `;
  };

  const renderPlanned = () => {
    if (!els.grid) return;
    els.grid.classList.add('is-planned');
    els.grid.innerHTML = groups().map(g => `
      <article class="term-skeleton" style="--skeleton-tone:var(--tone-${g.tone})">
        <div class="term-card-top">
          <span class="term-card-no">${esc(g.no)}</span>
          <span class="term-card-tag">${esc(g.short)}</span>
          <span class="term-card-reserved">框架已预留</span>
        </div>
        <h3>${esc(g.name)}</h3>
        <p>${esc(g.blurb)}</p>
        <div class="term-skeleton-line"></div>
        <div class="term-skeleton-line short"></div>
        <div class="term-skeleton-foot"><span>内容下一版补</span><span>0 条</span></div>
      </article>
    `).join('');
    if (els.empty) els.empty.hidden = true;
  };

  const renderProgress = () => {
    if (!els.progress) return;
    const p = platform();
    if (!isReady(state.platform)) {
      els.progress.innerHTML = '<span class="term-progress-plan">载入中…</span>';
      return;
    }
    if (p.status !== 'ready') {
      els.progress.innerHTML = `<span class="term-progress-plan">${DATA.groups.length} 个分组已预留</span>`;
      return;
    }
    els.progress.innerHTML = `<b>${masteredCount()}</b><i>/</i><span>${allCommands().length}</span><em>已掌握</em>`;
  };

  const renderGrid = () => {
    if (!els.grid) return;
    if (!isReady(state.platform)) {
      renderLoading(state.platform);
      return;
    }
    const p = platform();
    els.grid.classList.remove('is-planned');
    if (p.status !== 'ready') {
      renderPlanned();
      if (els.count) els.count.textContent = `${DATA.groups.length} 个分组 · 内容下一版补`;
      if (els.title) els.title.textContent = `${p.label} 常用指令 · 框架`;
      if (els.subtitle) els.subtitle.textContent = p.summary;
      if (els.search) { els.search.value = ''; els.search.disabled = true; els.search.placeholder = `${p.label} 框架已预留，内容下一版补`; }
      renderProgress();
      return;
    }

    if (els.search) { els.search.disabled = false; els.search.value = state.query; els.search.placeholder = '搜索 pwd、权限、端口、日志…'; }
    if (els.title) els.title.textContent = `${p.label} 指令全集`;
    if (els.subtitle) els.subtitle.textContent = p.summary;

    const q = state.query.trim().toLowerCase();
    const rows = allCommands().filter(matches).sort((a, b) => {
      if (q) {
        const diff = searchScore(a) - searchScore(b);
        if (diff) return diff;
      }
      return rank(a.id) - rank(b.id) || a._gi - b._gi || a._ci - b._ci;
    });
    const shown = rows.slice(0, state.limit);
    if (els.count) {
      els.count.textContent = rows.length > shown.length
        ? `${rows.length} 条指令 · 当前显示 ${shown.length}`
        : `${rows.length} 条指令`;
    }
    els.grid.innerHTML = shown.map((cmd, i) => commandCard(cmd, i)).join('');
    if (els.empty) els.empty.hidden = rows.length > 0;
    if (els.more) {
      els.more.hidden = rows.length <= shown.length;
      if (els.loadMore) els.loadMore.textContent = `显示更多（剩余 ${rows.length - shown.length} 条）`;
    }
    renderProgress();
  };

  const renderHero = () => {
    const total = typeof DATA.total === 'number'
      ? DATA.total
      : Object.values(DATA.platforms).reduce((sum, p) =>
        sum + Object.values(p.commands || {}).reduce((n, rows) => n + (Array.isArray(rows) ? rows.length : 0), 0), 0);
    if (els.heroCount) els.heroCount.textContent = total.toLocaleString('en-US');
    if (els.heroGroups) els.heroGroups.textContent = String(DATA.groups.length);
  };

  const renderAll = () => {
    renderHero();
    renderTabs();
    renderFilters();
    renderGrid();
  };

  const showToast = (text) => {
    if (!els.toast) return;
    els.toast.textContent = text;
    els.toast.classList.add('is-show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => els.toast.classList.remove('is-show'), 1600);
  };

  const fallbackCopy = (text) => {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    ta.remove();
    return ok;
  };

  const copyText = async (text, button) => {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      ok = fallbackCopy(text);
    }
    if (ok) {
      const old = button.textContent;
      button.textContent = '已复制';
      button.classList.add('is-copied');
      showToast('命令已复制，去终端里粘贴试试');
      setTimeout(() => { button.textContent = old; button.classList.remove('is-copied'); }, 1600);
    } else {
      showToast('复制失败，请手动选中命令');
    }
  };

  const toggleMastered = (button, key) => {
    if (state.mastered[key]) delete state.mastered[key];
    else state.mastered[key] = 1;
    try { localStorage.setItem(LS_KEY, JSON.stringify(state.mastered)); } catch {}
    const card = button.closest('.term-card');
    const on = Boolean(state.mastered[key]);
    card?.classList.toggle('is-mastered', on);
    button.classList.toggle('is-on', on);
    button.setAttribute('aria-pressed', String(on));
    button.textContent = on ? '✓ 已掌握' : '标记已掌握';
    renderProgress();
  };

  const switchTo = async (id) => {
    if (!DATA.platforms[id]) return;
    if (id === state.platform && isReady(id)) return;
    state.platform = id;
    state.group = 'all';
    state.query = '';
    state.limit = PAGE_SIZE;
    if (els.search) els.search.value = '';
    if (isReady(id)) {
      state.loading = '';
      renderAll();
      return;
    }
    state.loading = id;
    renderTabs();
    renderFilters();
    renderLoading(id);
    try {
      await loadPlatform(id);
    } catch {
      if (state.platform === id) {
        state.loading = '';
        renderError(id);
      }
      return;
    }
    if (state.platform !== id) return;
    state.loading = '';
    renderAll();
  };

  const prefetch = (id) => {
    if (!DATA.platforms[id] || id === state.platform || isReady(id)) return;
    loadPlatform(id).catch(() => {});
  };

  els.tabs?.addEventListener('click', e => {
    const tab = e.target.closest('[data-os]');
    if (!tab) return;
    switchTo(tab.dataset.os);
  });
  els.tabs?.addEventListener('pointerover', e => {
    const tab = e.target.closest('[data-os]');
    if (tab) prefetch(tab.dataset.os);
  });
  els.tabs?.addEventListener('focusin', e => {
    const tab = e.target.closest('[data-os]');
    if (tab) prefetch(tab.dataset.os);
  });

  els.filters?.addEventListener('click', e => {
    const chip = e.target.closest('[data-group]');
    if (!chip || chip.disabled) return;
    state.group = chip.dataset.group;
    state.limit = PAGE_SIZE;
    renderFilters();
    renderGrid();
  });

  els.search?.addEventListener('input', () => {
    state.query = els.search.value;
    state.limit = PAGE_SIZE;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      if (isReady(state.platform)) renderGrid();
    }, 90);
  });

  els.reset?.addEventListener('click', () => {
    state.group = 'all';
    state.query = '';
    state.limit = PAGE_SIZE;
    if (els.search) els.search.value = '';
    clearTimeout(searchTimer);
    renderFilters();
    renderGrid();
    els.search?.focus();
  });

  els.loadMore?.addEventListener('click', () => {
    state.limit += PAGE_SIZE;
    renderGrid();
  });

  els.showAll?.addEventListener('click', () => {
    state.limit = allCommands().filter(matches).length || 1;
    renderGrid();
  });

  els.grid?.addEventListener('click', e => {
    const copyBtn = e.target.closest('[data-copy]');
    if (copyBtn) {
      copyText(copyBtn.dataset.copy, copyBtn);
      return;
    }
    const masterBtn = e.target.closest('[data-master]');
    if (masterBtn) toggleMastered(masterBtn, masterBtn.dataset.master);
  });

  const boot = async () => {
    renderHero();
    renderTabs();
    if (isReady('macos')) {
      renderAll();
      return;
    }
    state.loading = 'macos';
    renderTabs();
    renderFilters();
    renderLoading('macos');
    try {
      await loadPlatform('macos');
    } catch {
      state.loading = '';
      renderError('macos');
      return;
    }
    if (state.platform !== 'macos') return;
    state.loading = '';
    renderAll();
  };

  boot();
})();

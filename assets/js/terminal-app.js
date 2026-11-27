/* 终端常用指令 · 页面渲染
 * 数据在 terminal-commands.js；本文件只负责平台切换、筛选、复制和掌握进度。
 */
(() => {
  'use strict';

  const DATA = window.TERMINAL_DATA;
  if (!DATA || !DATA.platforms) return;

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
  const state = {
    platform: 'macos',
    group: 'all',
    query: '',
    limit: PAGE_SIZE,
    mastered: loadMastered(),
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
    const p = platform();
    return groups().flatMap((g, gi) => (p.commands && p.commands[g.id]
      ? p.commands[g.id].map((c, ci) => ({ ...c, group: g, _gi: gi, _ci: ci }))
      : []));
  };

  const keyOf = (cmd) => `${state.platform}:${cmd.group.id}:${cmd.id}`;

  const isMastered = (cmd) => Boolean(state.mastered[keyOf(cmd)]);

  const masteredCount = () => allCommands().filter(isMastered).length;

  const groupCount = (groupId) => {
    const p = platform();
    return p.commands && p.commands[groupId] ? p.commands[groupId].length : 0;
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
    const total = allCommands().length;
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
    if (p.status !== 'ready') {
      els.progress.innerHTML = `<span class="term-progress-plan">${DATA.groups.length} 个分组已预留</span>`;
      return;
    }
    els.progress.innerHTML = `<b>${masteredCount()}</b><i>/</i><span>${allCommands().length}</span><em>已掌握</em>`;
  };

  const renderGrid = () => {
    if (!els.grid) return;
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

    const rows = allCommands().filter(matches).sort((a, b) =>
      rank(a.id) - rank(b.id) || a._gi - b._gi || a._ci - b._ci);
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
    const total = Object.values(DATA.platforms).reduce((sum, p) =>
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

  els.tabs?.addEventListener('click', e => {
    const tab = e.target.closest('[data-os]');
    if (!tab) return;
    const next = tab.dataset.os;
    if (!DATA.platforms[next] || next === state.platform) return;
    state.platform = next;
    state.group = 'all';
    state.query = '';
    state.limit = PAGE_SIZE;
    renderAll();
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
    renderGrid();
  });

  els.reset?.addEventListener('click', () => {
    state.group = 'all';
    state.query = '';
    state.limit = PAGE_SIZE;
    if (els.search) els.search.value = '';
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

  renderAll();
})();

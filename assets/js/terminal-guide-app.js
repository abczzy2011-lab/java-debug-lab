/* 终端入门教程 · 页面渲染
 * 数据在 terminal-guide.js；本文件负责平台切换、课时进度、复制和对照表。
 */
(() => {
  'use strict';

  const DATA = window.TERMINAL_GUIDE;
  if (!DATA || !Array.isArray(DATA.tracks)) return;

  const LS_KEY = 'jdl.terminal.guide.v1';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (value = '') => String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));

  const loadState = () => {
    try {
      const raw = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { platform: 'macos', lesson: 0, done: {} };
      const valid = DATA.tracks.some(t => t.id === raw.platform);
      return {
        platform: valid ? raw.platform : 'macos',
        lesson: Number.isInteger(raw.lesson) && raw.lesson >= 0 ? raw.lesson : 0,
        // 兼容旧版直接存 { "macos:01": 1 } 的格式
        done: raw.done && typeof raw.done === 'object' && !Array.isArray(raw.done) ? raw.done : raw,
      };
    } catch {
      return { platform: 'macos', lesson: 0, done: {} };
    }
  };

  const saved = loadState();
  const state = {
    platform: saved.platform,
    lesson: Math.min(saved.lesson, (DATA.tracks.find(t => t.id === saved.platform) || DATA.tracks[0]).lessons.length - 1),
    done: saved.done,
  };

  const els = {
    tabs: $('#guideOsTabs'),
    rail: $('#guideRailList'),
    lesson: $('#guideLesson'),
    progress: $('#guideProgress'),
    toast: $('#guideToast'),
    compare: $('#guideCompareBody'),
    library: $('#guideLibraryCount'),
    railMeta: $('#guideRailMeta'),
  };

  const track = () => DATA.tracks.find(t => t.id === state.platform) || DATA.tracks[0];
  const lessons = () => track().lessons;
  const current = () => lessons()[state.lesson] || lessons()[0];
  const doneKey = (no) => `${state.platform}:${no}`;
  const isDone = (no) => Boolean(state.done[doneKey(no)]);
  const doneCount = () => lessons().filter(l => isDone(l.no)).length;

  const renderTabs = () => {
    if (!els.tabs) return;
    els.tabs.innerHTML = DATA.tracks.map(t => `
      <button class="guide-os-tab ${t.id === state.platform ? 'is-active' : ''}" type="button"
        role="tab" aria-selected="${t.id === state.platform}" data-guide-os="${esc(t.id)}">
        <span class="guide-os-glyph" aria-hidden="true">${esc(t.glyph)}</span>
        <span class="guide-os-copy"><b>${esc(t.label)}</b><em>${esc(t.shell)} · ${esc(t.badge)}</em></span>
        <span class="guide-os-state ${doneCount() === lessons().length && t.id === state.platform ? 'ready' : ''}">
          ${t.id === state.platform ? `${doneCount()}/${lessons().length}` : '可切换'}
        </span>
      </button>
    `).join('');
  };

  const renderRail = () => {
    if (!els.rail) return;
    els.rail.innerHTML = lessons().map((l, i) => `
      <button class="guide-rail-item ${i === state.lesson ? 'is-active' : ''} ${isDone(l.no) ? 'is-done' : ''}"
        type="button" data-guide-lesson="${i}" aria-current="${i === state.lesson ? 'true' : 'false'}">
        <span class="guide-rail-no">${esc(l.no)}</span>
        <span class="guide-rail-copy"><b>${esc(l.title)}</b><em>${esc(l.time)}${isDone(l.no) ? ' · 已完成' : ''}</em></span>
        <span class="guide-rail-state" aria-hidden="true">${isDone(l.no) ? '✓' : '→'}</span>
      </button>
    `).join('');
    if (els.railMeta) els.railMeta.textContent = `${lessons().length} 节 · ${doneCount()} 已完成`;
  };

  const stepHtml = (step, index) => `
    <div class="guide-step ${step.danger ? 'is-danger' : ''}">
      <div class="guide-step-no">${String(index + 1).padStart(2, '0')}</div>
      <div class="guide-step-body">
        <div class="guide-step-head">
          <b>${esc(step.title)}</b>
          ${step.danger ? '<span class="guide-danger">谨慎 · 会改数据</span>' : ''}
          <button class="guide-copy" type="button" data-guide-copy="${esc(step.cmd)}" aria-label="复制命令：${esc(step.cmd)}">复制</button>
        </div>
        <div class="guide-cmd"><span class="guide-prompt" aria-hidden="true">${state.platform === 'windows' ? 'PS>' : '$'}</span><code>${esc(step.cmd)}</code></div>
        <div class="guide-out"><span>预期输出</span><pre>${esc(step.out)}</pre></div>
        <p class="guide-note">${esc(step.note)}</p>
      </div>
    </div>
  `;

  const renderLesson = () => {
    if (!els.lesson) return;
    const t = track();
    const l = current();
    const index = state.lesson;
    const total = lessons().length;
    els.lesson.innerHTML = `
      <div class="guide-lesson-head">
        <div class="guide-lesson-meta">
          <span class="guide-lesson-no">${esc(l.no)}</span>
          <span class="guide-lesson-time">${esc(l.time)}</span>
          <span class="guide-lesson-flag ${isDone(l.no) ? 'is-on' : ''}">${isDone(l.no) ? '已完成' : '进行中'}</span>
        </div>
        <h3>${esc(l.title)}</h3>
        <p class="guide-goal">${esc(l.goal)}</p>
      </div>
      <div class="guide-why"><b>为什么先做这一节</b><p>${esc(l.why)}</p></div>
      <div class="guide-steps">${l.steps.map(stepHtml).join('')}</div>
      <div class="guide-check">
        <div><span>本节验收</span><p>${esc(l.check)}</p></div>
        <button class="guide-master ${isDone(l.no) ? 'is-on' : ''}" type="button" data-guide-master="${esc(l.no)}"
          aria-pressed="${isDone(l.no)}">${isDone(l.no) ? '✓ 已完成' : '标记本节完成'}</button>
      </div>
      <div class="guide-tip"><b>避坑</b><p>${esc(l.tip)}</p></div>
      <div class="guide-nav">
        <button class="guide-nav-btn" type="button" data-guide-prev ${index === 0 ? 'disabled' : ''}>← 上一节</button>
        <span>${esc(l.no)} / ${String(total).padStart(2, '0')} · ${esc(t.label)}</span>
        <button class="guide-nav-btn is-next" type="button" data-guide-next>
          ${index >= total - 1 ? '回到命令库' : '下一节 →'}
        </button>
      </div>
    `;
    if (els.tabs) {
      const active = $('.guide-os-tab.is-active', els.tabs);
      if (active) active.querySelector('.guide-os-state').textContent = `${doneCount()}/${lessons().length}`;
    }
  };

  const renderProgress = () => {
    if (els.progress) {
      els.progress.innerHTML = `<b>${doneCount()}</b><i>/</i><span>${lessons().length}</span><em>已完成</em>`;
    }
    renderTabs();
    renderRail();
  };

  const renderCompare = () => {
    if (!els.compare) return;
    els.compare.innerHTML = DATA.compare.map(row => `
      <tr>
        <th scope="row">${esc(row.job)}</th>
        <td><code>${esc(row.macos)}</code></td>
        <td><code>${esc(row.linux)}</code></td>
        <td><code>${esc(row.windows)}</code></td>
      </tr>
    `).join('');
  };

  const renderAll = () => {
    if (els.library) els.library.textContent = Number(DATA.libraryCount || 0).toLocaleString('en-US');
    renderTabs();
    renderRail();
    renderProgress();
    renderLesson();
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
    if (!ok) {
      showToast('复制失败，请手动选中命令');
      return;
    }
    const old = button.textContent;
    button.textContent = '已复制';
    button.classList.add('is-copied');
    showToast('命令已复制，粘贴到终端里试试');
    setTimeout(() => { button.textContent = old; button.classList.remove('is-copied'); }, 1600);
  };

  const saveState = () => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        platform: state.platform,
        lesson: state.lesson,
        done: state.done,
      }));
    } catch {}
  };

  const toggleDone = (button, no) => {
    const key = doneKey(no);
    if (state.done[key]) delete state.done[key];
    else state.done[key] = 1;
    saveState();
    const on = Boolean(state.done[key]);
    button.classList.toggle('is-on', on);
    button.setAttribute('aria-pressed', String(on));
    button.textContent = on ? '✓ 已完成' : '标记本节完成';
    const flag = $('.guide-lesson-flag', els.lesson);
    if (flag) {
      flag.classList.toggle('is-on', on);
      flag.textContent = on ? '已完成' : '进行中';
    }
    renderProgress();
    if (on) showToast(`第 ${no} 节完成，继续下一节`);
  };

  const go = (index) => {
    const total = lessons().length;
    if (index >= total) {
      location.href = 'terminal.html?v=20261127z90n';
      return;
    }
    state.lesson = Math.max(0, Math.min(total - 1, index));
    saveState();
    renderRail();
    renderLesson();
    const stage = $('#guideStage');
    if (stage) stage.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  els.tabs?.addEventListener('click', e => {
    const tab = e.target.closest('[data-guide-os]');
    if (!tab) return;
    const next = tab.dataset.guideOs;
    if (!next || next === state.platform) return;
    state.platform = next;
    state.lesson = 0;
    saveState();
    renderAll();
  });

  els.rail?.addEventListener('click', e => {
    const item = e.target.closest('[data-guide-lesson]');
    if (!item) return;
    go(Number(item.dataset.guideLesson));
  });

  els.lesson?.addEventListener('click', e => {
    const copyBtn = e.target.closest('[data-guide-copy]');
    if (copyBtn) {
      copyText(copyBtn.dataset.guideCopy, copyBtn);
      return;
    }
    const master = e.target.closest('[data-guide-master]');
    if (master) {
      toggleDone(master, master.dataset.guideMaster);
      return;
    }
    if (e.target.closest('[data-guide-prev]')) go(state.lesson - 1);
    if (e.target.closest('[data-guide-next]')) go(state.lesson + 1);
  });

  renderCompare();
  renderAll();
})();

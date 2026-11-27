/* 终端指令题库 · 交互与判分 */
(() => {
  'use strict';

  const DATA = window.TERMINAL_QUIZ;
  if (!DATA || !Array.isArray(DATA.questions)) return;

  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = (value = '') => String(value).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));

  const els = {
    tabs: $('#quizTabs'),
    meta: $('#quizMeta'),
    score: $('#quizScore'),
    progress: $('#quizProgress'),
    stage: $('#quizStage'),
    nav: $('#quizNav'),
    prev: $('#quizPrev'),
    next: $('#quizNext'),
    note: $('#quizNavNote'),
    result: $('#quizResult'),
  };
  if (!els.tabs || !els.stage) return;

  const PLATFORM_LABEL = {
    macos: 'macOS',
    linux: 'Linux',
    windows: 'Windows',
  };
  const PLATFORM_GLYPH = { all: '45', macos: '⌘', linux: '>_', windows: 'PS' };

  const state = {
    platform: 'all',
    mode: 'quiz',
    list: [],
    idx: 0,
    answers: {},
    finished: false,
    baseList: [],
  };

  const allQuestions = DATA.questions;
  const platformQuestions = (platform) => platform === 'all'
    ? allQuestions.slice()
    : allQuestions.filter(q => q.platform === platform);

  const answerOf = (q) => state.answers[q.id] || null;
  const answeredCount = () => state.list.filter(q => answerOf(q)).length;
  const correctCount = () => state.list.filter(q => answerOf(q)?.correct).length;
  const percent = () => {
    const total = state.list.length;
    return total ? Math.round(correctCount() / total * 100) : 0;
  };

  const startQuiz = (platform) => {
    state.platform = platform;
    state.mode = 'quiz';
    state.list = platformQuestions(platform);
    state.baseList = state.list.slice();
    state.idx = 0;
    state.answers = {};
    state.finished = false;
    els.result.hidden = true;
    els.nav.hidden = false;
    renderTabs();
    renderQuestion();
    updateProgress();
  };

  const retryWrong = () => {
    const wrong = state.list.filter(q => answerOf(q) && !answerOf(q).correct);
    if (!wrong.length) return;
    state.mode = 'retry';
    state.list = wrong;
    state.idx = 0;
    state.answers = {};
    state.finished = false;
    els.result.hidden = true;
    els.nav.hidden = false;
    renderTabs();
    renderQuestion();
    updateProgress();
  };

  const backToFull = () => {
    if (state.mode === 'retry') {
      state.list = state.baseList.slice();
      state.mode = 'quiz';
      state.idx = 0;
      state.answers = {};
      state.finished = false;
      els.result.hidden = true;
      els.nav.hidden = false;
      renderTabs();
      renderQuestion();
      updateProgress();
      return;
    }
    startQuiz(state.platform);
  };

  const renderTabs = () => {
    const tabs = [
      { id: 'all', label: '全部', sub: `${allQuestions.length} 题` },
      ...DATA.platforms.map(p => ({
        id: p.id,
        label: p.label,
        sub: `${allQuestions.filter(q => q.platform === p.id).length} 题`,
      })),
    ];
    els.tabs.innerHTML = tabs.map(tab => {
      const active = state.platform === tab.id && state.mode === 'quiz';
      return `<button class="term-os-tab${active ? ' is-active' : ''}" type="button" role="tab" aria-selected="${active}" data-platform="${tab.id}">
        <span class="term-os-glyph" aria-hidden="true">${esc(PLATFORM_GLYPH[tab.id] || '?')}</span>
        <span class="term-os-copy"><b>${esc(tab.label)}</b><em>${esc(tab.sub)}</em></span>
      </button>`;
    }).join('');
  };

  const renderMeta = () => {
    const total = state.list.length;
    if (!total) {
      els.meta.textContent = '暂无题目';
      els.score.textContent = '答对 0';
      return;
    }
    const q = state.list[state.idx];
    const label = state.mode === 'retry' ? '错题重练' : '终端题库';
    els.meta.innerHTML = `${label} · 第 <b>${state.idx + 1}</b> / ${total} 题 · ${esc(PLATFORM_LABEL[q?.platform] || '')}`;
    els.score.innerHTML = `已答 <b>${answeredCount()}</b> / ${total} · 答对 <b>${correctCount()}</b>`;
  };

  const updateProgress = () => {
    renderMeta();
    els.progress.innerHTML = `<b>${answeredCount()}</b><i>/</i><span>${state.list.length}</span><em>已答</em>`;
    const answered = Boolean(answerOf(state.list[state.idx]));
    els.next.disabled = !answered || !state.list.length;
    els.prev.disabled = state.idx <= 0;
    els.next.textContent = state.idx >= state.list.length - 1 ? '查看成绩' : '下一题';
  };

  const optionClass = (q, index) => {
    const answer = answerOf(q);
    if (!answer) return '';
    if (index === q.answer) return ' is-correct';
    if (answer.choice === index) return ' is-wrong';
    return ' is-muted';
  };

  const renderQuestion = () => {
    if (state.finished || !state.list.length) return;
    const q = state.list[state.idx];
    if (!q) return;
    const answer = answerOf(q);
    const platform = PLATFORM_LABEL[q.platform] || q.platform;
    const options = q.options.map((text, index) => `
      <button class="quiz-option${optionClass(q, index)}" type="button" data-choice="${index}" ${answer ? 'disabled' : ''} aria-label="选项 ${String.fromCharCode(65 + index)}：${esc(text)}">
        <span class="quiz-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
        <span class="quiz-option-text">${esc(text)}</span>
      </button>`).join('');

    const feedback = answer ? `
      <div class="quiz-feedback ${answer.correct ? 'good' : 'bad'}" role="status" aria-live="polite">
        <div class="quiz-feedback-head">${answer.correct ? '✓ 回答正确' : '✕ 回答错误'} · 正确答案 ${String.fromCharCode(65 + q.answer)}</div>
        <p>${esc(q.explain)}</p>
      </div>` : '';

    els.stage.innerHTML = `
      <article class="quiz-card">
        <div class="quiz-card-top">
          <span class="quiz-chip platform-${esc(q.platform)}">${esc(platform)}</span>
          <span class="quiz-chip ghost">${esc(q.group)}</span>
          ${state.mode === 'retry' ? '<span class="quiz-chip">错题重练</span>' : ''}
          <span class="quiz-qno">${String(state.idx + 1).padStart(2, '0')} / ${String(state.list.length).padStart(2, '0')}</span>
        </div>
        <p class="quiz-prompt">${esc(q.prompt)}</p>
        <p class="quiz-hint">选出最准确的一条；作答后会立即显示解析，答错也能继续下一题。</p>
        <div class="quiz-options" role="group" aria-label="选项">${options}</div>
        ${feedback}
      </article>`;
  };

  const showResult = () => {
    state.finished = true;
    els.nav.hidden = true;
    const total = state.list.length;
    const correct = correctCount();
    const pct = percent();
    const grade = pct >= 90 ? '终端老手' : pct >= 75 ? '基本熟练' : pct >= 60 ? '还需练习' : '建议重刷';
    const groups = [...new Set(state.list.map(q => q.group))];
    const weak = groups.map(group => {
      const items = state.list.filter(q => q.group === group);
      const wrong = items.filter(q => answerOf(q) && !answerOf(q).correct).length;
      return { group, total: items.length, wrong };
    }).filter(x => x.wrong > 0).sort((a, b) => b.wrong - a.wrong);
    const platformStats = ['macos', 'linux', 'windows'].map(p => {
      const items = state.list.filter(q => q.platform === p);
      const right = items.filter(q => answerOf(q)?.correct).length;
      return { p, total: items.length, right };
    }).filter(x => x.total);

    els.stage.innerHTML = `
      <div class="quiz-result">
        <div class="quiz-result-card">
          <div class="quiz-result-kicker">TERMINAL QUIZ RESULT · ${state.mode === 'retry' ? 'RETRY WRONG' : 'SESSION'}</div>
          <div class="quiz-result-score"><b>${pct}</b><span>分 · ${correct} / ${total} 题答对</span></div>
          <p class="quiz-result-title">${esc(grade)}</p>
          <p class="quiz-result-sub">${pct >= 75 ? '命令的场景判断已经比较稳。下一步可以回到命令库，把没掌握的命令加入进度。' : '先把错题解析看懂，再只练错题；回到命令库搜索对应命令，结合示例再记一次。'}</p>
          <div class="quiz-result-grid">
            ${platformStats.map(s => `<div class="quiz-result-stat"><b>${s.right}/${s.total}</b><span>${esc(PLATFORM_LABEL[s.p])} 答对</span></div>`).join('')}
            <div class="quiz-result-stat"><b>${answeredCount()}/${total}</b><span>已完成</span></div>
          </div>
          <div class="quiz-result-weak">
            <b>需要回看的场景</b>
            <p>${weak.length ? weak.map(x => `${x.group}（错 ${x.wrong} / ${x.total}）`).join(' · ') : '本轮没有错题，保持这个状态。'}</p>
          </div>
          <div class="quiz-result-actions">
            <button class="quiz-btn primary" type="button" id="quizRetryWrong" ${weak.length ? '' : 'disabled'}>只练错题</button>
            <button class="quiz-btn" type="button" id="quizRestart">重新挑战</button>
            ${state.mode === 'retry' ? '<button class="quiz-btn" type="button" id="quizBackFull">回到完整题库</button>' : ''}
          </div>
          <p class="quiz-result-note">切换平台会重新开始当前平台的题库；掌握进度仍在终端命令库的卡片里单独记录。</p>
        </div>
      </div>`;
    els.result.hidden = false;
    updateProgress();
  };

  const goNext = () => {
    if (!state.list.length) return;
    if (!answerOf(state.list[state.idx])) return;
    if (state.idx >= state.list.length - 1) {
      showResult();
      return;
    }
    state.idx += 1;
    renderQuestion();
    updateProgress();
  };

  const goPrev = () => {
    if (state.idx <= 0) return;
    state.idx -= 1;
    renderQuestion();
    updateProgress();
  };

  const pick = (choice) => {
    const q = state.list[state.idx];
    if (!q || answerOf(q)) return;
    const correct = choice === q.answer;
    state.answers[q.id] = { choice, correct };
    renderQuestion();
    updateProgress();
  };

  els.tabs.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-platform]');
    if (!tab) return;
    const platform = tab.dataset.platform;
    if (!['all', 'macos', 'linux', 'windows'].includes(platform)) return;
    startQuiz(platform);
  });

  els.stage.addEventListener('click', (event) => {
    const option = event.target.closest('[data-choice]');
    if (option) {
      pick(Number(option.dataset.choice));
      return;
    }
    if (event.target.closest('#quizRetryWrong')) retryWrong();
    if (event.target.closest('#quizRestart')) backToFull();
    if (event.target.closest('#quizBackFull')) backToFull();
  });

  els.next.addEventListener('click', goNext);
  els.prev.addEventListener('click', goPrev);

  document.addEventListener('keydown', (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target && /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    const q = state.list[state.idx];
    if (!q || state.finished) return;
    if (event.key >= '1' && event.key <= '4' && !answerOf(q)) {
      event.preventDefault();
      pick(Number(event.key) - 1);
    }
    if (event.key === 'Enter' && answerOf(q)) {
      event.preventDefault();
      goNext();
    }
  });

  renderTabs();
  startQuiz('all');
})();

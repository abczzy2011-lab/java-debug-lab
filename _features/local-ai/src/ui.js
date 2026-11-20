// src/ui.js — drawer state + copy renderers (no DOM writes; pure helpers for tests).
// Integration owner will bind these to real DOM in P4.

import { UI_MODEL_LABEL } from './cloud-client.js';

export const COPY = {
  betaTitle: 'AI 助手 · Beta',
  smart: '智能（联网云端 / 断网本地）',
  cloudOnly: '仅云端',
  localOnly: '仅本地',
  searchOnly: '仅检索（0MB）',
  localMissing: '本地未安装（断网将用检索）',
  localPass: '本地已就绪',
  localFail: '本机不满足本地 AI 最低性能，只能使用云端或检索',
  noBasis: '没有在本站课程中找到足够依据，试试换关键词。',
  searchLabel: '检索结果',
  cloudLabel: '云端',
  localLabel: '本地',
  busy: '混合模型暂时不可用，已切换检索/本地',
  quick: ['第 8 课讲什么', '多态和重载的区别', '本节有哪些练习', '这个概念在哪一课'],
  installCopy: [
    '智能模式：联网时用云端模型，断网自动切到本地模型；本地模型需先下载（1.5B 约 1.1GB / 3B 约 2.0GB）。',
    '云端模式：问题和相关课节会发送给云端模型提供方，不发送整站；免费额度用完会切本地或检索。',
    '本地模式：全部在浏览器本机运行，问题和课文内容不会上传；首次需下载本地模型（1.5B 约 1.1GB / 3B 约 2.0GB）。',
    '本地启用前会检测 WebGPU/内存/存储/跑分；不达标则只能云端或检索。',
    '1.5B/3B 本地模型能力弱于云端，但断网时仍可用。',
  ],
};

/** Status chip text from mode state; never shows provider/quota. */
export function statusChip(mode, reason = '') {
  const base = mode === 'cloud' ? UI_MODEL_LABEL
    : mode === 'local' ? COPY.localLabel : COPY.searchLabel;
  return reason ? `${base} · ${reason}` : base;
}

/** Render chat messages safely. Only citation links from trusted map are anchors. */
export function renderMessages(messages = [], resolve = {}) {
  return messages.map(m => {
    if (m.role === 'user') {
      const safe = String(m.text || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
      return `<div class="msg user">${safe}</div>`;
    }
    let html = String(m.text || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    html = html.replace(/\[([PCS])(\d+)\]/g, (whole, k, n) => {
      const t = resolve[k + n];
      return t ? `<a class="cite" href="${String(t.url || '#').replace(/"/g, '')}">[${k}${n}]</a>` : `[${k}${n}]`;
    });
    const foot = m.citations?.length ? `<div class="msg-foot">参考：${m.citations.map(c => resolve[c]?.title || c).join(' / ')}</div>` : '';
    return `<div class="msg ai">${html}${foot}</div>`;
  }).join('');
}

export function failureView(failedChecks = []) {
  return {
    title: COPY.localFail,
    items: failedChecks.map(c => `${c.label}：${c.detail}`),
    actions: ['重新检测', '仅使用云端', '仅使用检索'],
  };
}

export function installModal() {
  return { title: COPY.betaTitle, paragraphs: COPY.installCopy,
    buttons: ['智能（推荐）', '仅云端', '检测本地', '仅使用检索'] };
}

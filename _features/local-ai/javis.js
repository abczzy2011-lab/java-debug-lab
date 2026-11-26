// Javis — 本站专属助教（全局悬浮窗）。
// 复用 _features/local-ai/src 下已经测试过的检索、性能门禁与 WebLLM 封装。
// 默认路径：先做本地性能门禁；通过 => 必须下载本地模型后才能用 AI；不通过 => 仅站内检索。

import { buildCatalog, siteStats, siteCard, compactCatalog, courseCard } from './src/catalog.js';
import { routeIntent, contextPlan } from './src/router.js?v=20261123a';
import { renderAnswer, validateCitations } from './src/citations.js';
import { evaluateEnvironment, withBenchmark } from './src/perf-check.js?v=20261121c';
import { runBenchmark } from './src/perf-benchmark.js?v=20261121b';
import { admission, downloadDone, DECI } from './src/gatekeeper.js';
import { createAssistant, MODELS, DEFAULT_MODEL_KEY, recommendModelKey, MODEL_FIT, inspectModelCache } from './src/assistant.js?v=20261123d';
import { checkHealth, askCloud } from './src/cloud-client.js?v=20261122b';
import { analyzeQuestion } from './src/query.js?v=20261123a';
import { answerSiteQuestion } from './src/site-answer.js?v=20261122c';
import { buildLocalMessages, trimHistory } from './src/tutor-prompt.js?v=20261122b';
import { compactAnswer } from './src/answer-format.js?v=20261122c';

window.__JAVIS_STAGE = 'imported';
const CLOUD_BASE = (() => { try { return String(window.__JAVIS_CLOUD_BASE__ || ''); } catch { return ''; } })();
const LS = {
  modelReady: 'jdl.javis.modelReady.v2',
  modelChoice: 'jdl.javis.modelChoice.v1',
  source: 'jdl.javis.source.v1',
  panel: 'jdl.javis.panel.v1',
  pos: 'jdl.javis.pos.v1',
  size: 'jdl.javis.size.v1',
  orbPos: 'jdl.javis.orbPos.v1',
  orbMinimized: 'jdl.javis.orbMinimized.v1',
  localUnloaded: 'jdl.javis.localUnloaded.v1',
};

// 最后一条退路：不摆在明面上，也不在 AI 正常时打扰。AI 失败后才会露出「锦囊」，
// 里面放的不是高级课，而是初学者真的能看懂、能搜到人话的地方。
const KIT_SITES = [
  {
    name: 'CSDN', url: 'https://www.csdn.net/', tag: '中文社区 · 搜报错',
    why: '把完整报错原样粘进搜索框，先看别人有没有踩过同一个坑。优先挑带完整代码、能复现、评论里有纠错的那篇。',
  },
  {
    name: 'GitHub', url: 'https://github.com/', tag: '真实项目 · 从 README 开始',
    why: '不会读源码也能用：先看 README 的安装步骤和目录，再翻 issue 里别人怎么描述问题。搜同主题小项目，比只看教程更接近真实工程。',
  },
  {
    name: 'Stack Overflow', url: 'https://stackoverflow.com/', tag: '英文问答 · 找根因',
    why: '报错最后一行直接搜，英文答案往往更接近根因。读不动就用浏览器翻译，代码块不用翻。',
  },
  {
    name: '博客园', url: 'https://www.cnblogs.com/', tag: '中文长文 · 工程笔记',
    why: '很多老工程师把完整实现和踩坑过程写在这里。适合耐心啃一篇长文，而不是只看三行结论。',
  },
  {
    name: '菜鸟教程', url: 'https://www.runoob.com/', tag: '从零补基础',
    why: '例子短、目录直，HTML、Java、Python、SQL 都能先跑一遍。看不懂课时，用它把最小例子跑通。',
  },
  {
    name: '廖雪峰', url: 'https://liaoxuefeng.com/', tag: '系统教程 · 中文',
    why: 'Java、Python、JavaScript 都有完整的中文主线。适合发现自己缺一整块基础时，从头顺一遍。',
  },
  {
    name: 'MDN Web Docs', url: 'https://developer.mozilla.org/zh-CN/', tag: 'Web 标准 · 最稳',
    why: 'JavaScript、DOM、HTTP、浏览器行为的第一手说明书。前端概念打架时，以这里为准。',
  },
  {
    name: 'freeCodeCamp 中文', url: 'https://www.freecodecamp.org/chinese/', tag: '边写边学 · 免费',
    why: '完全不知道下一步做什么时，先做一小节交互练习。手先动起来，比继续盯着概念有用。',
  },
];

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isPortableDevice = () => {
  try {
    const ua = String(navigator.userAgent || '');
    if (/Android|iPhone|iPad|iPod|Mobile|Tablet|Phone|HarmonyOS|OpenHarmony|OppoBrowser|VivoBrowser|HeyTapBrowser|MiuiBrowser|HuaweiBrowser|HonorBrowser|UCBrowser|Quark|QQBrowser|MQQBrowser|SamsungBrowser/i.test(ua)) return true;
    // iPadOS 默认桌面 UA、部分厂商浏览器不带 Mobile token；再用触控和屏幕尺寸兜底。
    if (navigator.userAgentData?.mobile === true) return true;
    const coarse = window.matchMedia?.('(pointer: coarse)')?.matches === true;
    const touch = (navigator.maxTouchPoints || 0) > 1;
    const shortSide = Math.min(Number(screen?.width) || 9999, Number(screen?.height) || 9999);
    return coarse && touch && shortSide <= 820;
  } catch { return false; }
};
const isSafariBrowser = () => /Safari/i.test(String(navigator.userAgent || '')) && !/Chrome|Chromium|CriOS|Edg|EdgiOS|FxiOS|Android|OppoBrowser|VivoBrowser|HeyTapBrowser|MiuiBrowser|HuaweiBrowser|HonorBrowser|UCBrowser|Quark|QQBrowser|MQQBrowser|SamsungBrowser/i.test(String(navigator.userAgent || ''));
// 不按机型一刀切：按 WebGPU 跑分、内存、可用存储和是否 Safari 给推荐；所有档位都可手动选择。
const preferredModelKey = () => recommendModelKey({
  portable: isPortableDevice(), safari: isSafariBrowser(), gflops: 0,
  deviceMemory: navigator.deviceMemory, cores: navigator.hardwareConcurrency,
});

const state = {
  corpus: null, index: null, studyMap: null, catalog: null, stats: null,
  corpusPromise: null, loadingCorpus: false, docById: null,
  gate: null, gateRunning: false, gateError: null,
  downloading: false, downloadProgress: 0, downloadStatus: '', downloadAttempted: false, downloadSeq: 0,
  modelReady: false, localUnloaded: false, assistant: null, modelKey: DEFAULT_MODEL_KEY, downloadedModels: {}, modelPickerOpen: false, modelChoiceExplicit: false,
  activeSource: 'local', preferredSource: 'cloud', cloudReady: false, cloudChecking: false, cloudOnly: false, sourceNotice: '', localFault: false,
  messages: [], history: [], busy: false, chatStarted: false, answerAbort: null, answerSeq: 0, stopRequested: false,
  siteFocus: null, sitePending: null,
  searchOpen: false, searchQuery: '', searchBusy: false, searchError: '', searchResults: null,
  forceSearch: false, searchOnlyReason: '',
  resolveByMsg: {}, nextId: 1,
  panelOpen: false, orbMinimized: false, kitOpen: false, initialized: false,
};

let panel, orb, orbMinBtn, orbRestoreBtn, gateBox, chatBox, msgBox, input, sendBtn, statusEl, searchView, searchInput, searchResultsBox;



/* ===================== UI ===================== */
function uiMarkup() {
  return `
  <button class="jv-orb" id="jv-orb" type="button" aria-label="打开 Javis 助教；可拖动换位置；右上角减号可最小化" aria-controls="jv-panel" aria-expanded="false" title="Javis · 拖动换位置 · ⌘K · 右上角 − 最小化">
    <span class="jv-orb-halo"></span>
    <span class="jv-orb-glass" aria-hidden="true">
      <span class="jv-orb-fluid a"></span>
      <span class="jv-orb-fluid b"></span>
      <span class="jv-orb-caustic"></span>
      <span class="jv-orb-sheen"></span>
      <span class="jv-orb-grain"></span>
    </span>
    <span class="jv-orb-label" aria-hidden="true">问 Javis</span>
    <span class="jv-orb-glyph">J</span><span class="jv-orb-dot"></span>
  </button>
  <button class="jv-orb-min" id="jv-orb-min" type="button" aria-label="最小化 Javis，收起为角落小圆点" title="最小化 Javis，收起为角落小圆点" hidden><span class="jv-min-glyph" aria-hidden="true"></span></button>
  <button class="jv-orb-restore" id="jv-orb-restore" type="button" aria-label="打开 Javis 助手" title="打开 Javis" hidden><span class="jv-restore-glyph" aria-hidden="true">J</span></button>
  <div class="jv-edge-halo" id="jv-edge-halo" aria-hidden="true"></div>
  <div class="jv-activation" id="jv-activation" hidden aria-hidden="true">
    <span class="jv-act-beam"></span>
    <span class="jv-act-ring a"></span><span class="jv-act-ring b"></span><span class="jv-act-ring c"></span><span class="jv-act-ring d"></span>
    <span class="jv-act-flash"></span>
    ${Array.from({length:12},(_,i)=>`<span class="jv-act-spark" style="--a:${i*30}deg"></span>`).join('')}
    <span class="jv-act-core"></span>
    <span class="jv-act-ambient" aria-hidden="true"></span>
  </div>
  <section class="jv-panel" id="jv-panel" hidden aria-label="Javis 助教窗口">
    <header class="jv-head" id="jv-head">
      <div class="jv-avatar">J</div>
      <div class="jv-id">
        <div class="jv-title">Javis <span class="jv-beta">BETA</span><button class="jv-model-chip" id="jv-model-chip" type="button" data-jv-action="picker" title="切换本地模型" hidden>混合模型</button></div>
        <div class="jv-sub"><span class="jv-live" id="jv-live"></span><span id="jv-status">本站专属助教</span></div>
      </div>
      <div class="jv-head-actions">
        <button class="jv-icon-btn" id="jv-clear" type="button" title="清空对话" aria-label="清空对话">⌫</button>
        <button class="jv-icon-btn jv-back-btn" id="jv-close" type="button" title="返回页面" aria-label="返回页面"><span class="jv-back-glyph" aria-hidden="true">←</span><span class="jv-back-label">返回</span></button>
      </div>
    </header>
    <div class="jv-body" id="jv-body">
      <div id="jv-gate"></div>
      <div id="jv-chat" hidden>
        <div class="jv-chat" id="jv-messages"></div>
        <div class="jv-quick" id="jv-quick"></div>
      </div>
    </div>
    <div class="jv-search" id="jv-search" hidden aria-label="站内检索窗口">
      <div class="jv-search-head">
        <div>
          <div class="jv-search-kicker">站内检索</div>
          <div class="jv-search-sub">只查本站课程，不调用 AI</div>
        </div>
        <button class="jv-icon-btn" id="jv-search-close" type="button" aria-label="关闭检索">×</button>
      </div>
      <form class="jv-search-form" id="jv-search-form">
        <input class="jv-search-input" id="jv-search-input" type="search" placeholder="搜课程、小节或 Java 术语" autocomplete="off" />
        <button class="jv-search-go" id="jv-search-go" type="submit">搜索</button>
      </form>
      <div class="jv-search-body" id="jv-search-results"></div>
    </div>
    <div class="jv-composer">
      <form class="jv-form" id="jv-form">
        <textarea class="jv-input" id="jv-input" rows="1" placeholder="问 Javis：第 8 课讲什么？双亲委派是什么？" autocomplete="off"></textarea>
        <button class="jv-retrieve" id="jv-retrieve" type="button" data-jv-action="retrieve" title="打开站内检索窗口，不调用 AI" aria-label="打开站内检索窗口">检索</button>
        <button class="jv-send" id="jv-send" type="submit" title="发送" aria-label="发送">↑</button>
      </form>
      <div class="jv-foot">
        <span id="jv-foot-left">模型直答 · 不读取站内资料</span>
        <div class="jv-foot-right">
          <div class="jv-source-switch" id="jv-source-switch" role="group" aria-label="回答来源" hidden><button type="button" data-jv-action="source" data-source="cloud">云端</button><button type="button" data-jv-action="source" data-source="local">本地</button></div>
          <button class="jv-local-action" id="jv-local-action" type="button" data-jv-action="unload" title="卸载本地 AI，释放显存；下载的权重仍保留" hidden>卸载本地</button>
          <span>⌘K</span>
        </div>
      </div>
    </div>
    <div class="jv-resize" id="jv-resize" title="拖动调整大小"></div>
  </section>
  <div class="jv-kit-layer" id="jv-kit-layer" hidden>
    <section class="jv-kit-sheet" role="dialog" aria-modal="true" aria-labelledby="jv-kit-title" aria-describedby="jv-kit-copy">
      <button class="jv-kit-close" type="button" data-kit-close aria-label="收起锦囊">×</button>
      <div class="jv-kit-head">
        <div class="jv-kit-kicker">LAST RESORT · 无路可走时才打开</div>
        <h2 id="jv-kit-title">最后一扇门，给还在硬撑的你</h2>
        <p id="jv-kit-copy">如果你已经试过所有按钮，把同一句报错读到眼睛发酸，还是不懂——先停一下。不是你笨，也不是你不适合学编程，是这条解释线真的走到头了。</p>
        <p class="jv-kit-only">我不保证门后一定有标准答案；但在你已经无路可走的这一刻，这是本站唯一还亮着的地方。</p>
        <div class="jv-kit-oath">这不是认输。是你终于愿意换一条路，把自己带出去。</div>
      </div>
      <div class="jv-kit-grid" id="jv-kit-grid"></div>
      <div class="jv-kit-searchnote">
        <b>推门前，先把问题缩成三行：</b>
        <span>① 我在做什么　② 我期望发生什么　③ 实际发生了什么（附完整报错最后一行）</span>
        <em>带着这三行去搜，命中率会比只搜“为什么报错”高很多。</em>
      </div>
      <div class="jv-kit-foot">
        <span>今晚不用全部学会，先找到一句能让你继续走下去的话。</span>
        <button type="button" data-kit-close>收好这扇门，回去再试</button>
      </div>
    </section>
  </div>`;
}

function mount() {
  if (state.initialized) return;
  document.body.insertAdjacentHTML('beforeend', uiMarkup());
  orb = $('#jv-orb'); orbMinBtn = $('#jv-orb-min'); orbRestoreBtn = $('#jv-orb-restore');
  panel = $('#jv-panel'); gateBox = $('#jv-gate'); chatBox = $('#jv-chat');
  msgBox = $('#jv-messages'); input = $('#jv-input'); sendBtn = $('#jv-send'); statusEl = $('#jv-status');
  searchView = $('#jv-search'); searchInput = $('#jv-search-input'); searchResultsBox = $('#jv-search-results');
  const storedKey = safeGet(LS.modelChoice);
  // 保留用户明确选过的档位（手机也可以选 1.5B/3B）；没有选择时再按设备性能给推荐。
  state.modelChoiceExplicit = !!MODELS[storedKey];
  const selectedKey = state.modelChoiceExplicit ? storedKey : preferredModelKey();
  state.modelKey = MODELS[selectedKey] ? selectedKey : preferredModelKey();
  try { state.downloadedModels = JSON.parse(safeGet(LS.modelReady) || '{}') || {}; } catch { state.downloadedModels = {}; }
  state.localUnloaded = safeGet(LS.localUnloaded) === '1';
  state.modelReady = !!state.downloadedModels[state.modelKey] && !state.localUnloaded;
  state.preferredSource = safeGet(LS.source) === 'local' ? 'local' : 'cloud';
  state.initialized = true;
  bindUi();
  restorePanel();
  renderAll();
  // 先按最终尺寸建立玻璃折射贴图，再播放召唤动画，避免按缩放后的尺寸计算。
  applyOrbGlass();
  // 首次出现时从右下角“召唤”出来；标签只短暂出现，不遮挡页面。
  orb.classList.add('is-summoning');
  setTimeout(() => {
    orb.classList.remove('is-summoning');
    syncOrbBadge();
  }, 960);
}

function modelMeta(key = state.modelKey) { return MODELS[key] || MODELS[DEFAULT_MODEL_KEY]; }
function modelLabel(key = state.modelKey) { return modelMeta(key).label; }
function currentRecommendationKey() {
  const m = state.gate?.metrics || {};
  return recommendModelKey({
    portable: isPortableDevice(), safari: isSafariBrowser(),
    gflops: m.gflops, deviceMemory: m.deviceMemory, storageFree: m.storageFree, cores: m.cores,
  });
}
function recommendedModelLine() {
  const key = currentRecommendationKey();
  const details = modelFitNote(key);
  return `本机推荐 ${modelLabel(key)}${details ? `（${details}）` : ''}`;
}
function persistModels() { safeSet(LS.modelReady, JSON.stringify(state.downloadedModels)); }
function modelFitNote(key) {
  const fit = MODEL_FIT[key];
  if (!fit) return '';
  const m = state.gate?.metrics || {};
  const parts = [];
  if (m.gflops) parts.push(`本机 GPU ${Math.round(m.gflops)} GFLOPS`);
  // Chrome 的 deviceMemory 最多上报 8GB；显示 8GB+，不要把 16GB 桌面写成 8GB。
  if (m.deviceMemory) parts.push(`${m.deviceMemory >= 8 ? '8GB+' : m.deviceMemory + 'GB'} 内存`);
  if (Number.isFinite(m.storageFree) && m.storageFree < fit.storageGB * 1024 ** 3 * 1.05) {
    parts.push(`可用存储约 ${(m.storageFree / 1024 ** 3).toFixed(1)}GB，可能不足`);
  }
  return parts.join(' · ');
}
function invalidateLocalCache(reason = 'LOCAL_CACHE_MISSING') {
  state.modelReady = false;
  delete state.downloadedModels[state.modelKey];
  persistModels();
  state.modelPickerOpen = false;
  state.gateError = reason;
  state.downloadAttempted = true;
  if (state.activeSource === 'local') state.activeSource = state.cloudReady ? 'cloud' : 'local';
}
async function verifyCachedModel() {
  if (!state.modelReady) return true;
  const cached = await inspectModelCache(modelMeta().id);
  if (cached === 'missing' || cached === 'partial') {
    invalidateLocalCache('LOCAL_CACHE_MISSING');
    return false;
  }
  return true;
}

function safeGet(k) { try { return localStorage.getItem(k); } catch { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch {} }

function bindUi() {
  orb.addEventListener('click', () => state.panelOpen ? closePanel() : openPanel());
  orbMinBtn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); minimizeOrb(); });
  orbRestoreBtn.addEventListener('click', () => restoreOrb({ open: true }));
  $('#jv-close').addEventListener('click', closePanel);
  $('#jv-clear').addEventListener('click', clearChat);
  $('#jv-search-close').addEventListener('click', closeSearch);
  $('#jv-search-form').addEventListener('submit', e => { e.preventDefault(); runSearch(); });
  const kitLayer = $('#jv-kit-layer');
  if (kitLayer) kitLayer.addEventListener('click', e => {
    if (e.target === kitLayer || e.target.closest('[data-kit-close]')) closeKit();
  });
  $('#jv-form').addEventListener('submit', e => { e.preventDefault(); submit(); });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  });
  input.addEventListener('input', () => {
    input.style.height = 'auto'; input.style.height = Math.min(96, input.scrollHeight) + 'px';
  });
  panel.addEventListener('click', e => {
    const cite = e.target.closest('.jv-cite');
    if (cite) { openCitation(cite.dataset.msg, cite.dataset.k); return; }
    const action = e.target.closest('[data-jv-action]');
    if (action) { handleAction(action.dataset.jvAction, action); }
  });
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); state.panelOpen ? closePanel() : openPanel(); }
    if (e.key === 'Escape' && state.kitOpen) { closeKit(); return; }
    if (e.key === 'Escape' && state.searchOpen) { closeSearch(); return; }
    if (e.key === 'Escape' && state.panelOpen) closePanel();
  });
  setupDrag();
  setupResize();
  setupOrbDrag();
  restoreOrbPosition();
  // 页面在“学科首页 / 练习视图”之间切换时，只改 html 的 subjects-home；
  // 悬浮球从 display:none 恢复后没有 resize 事件，需要在这里重新贴一次减号。
  const refreshBadgeSoon = () => {
    if (!state.orbMinimized) requestAnimationFrame(syncOrbBadge);
  };
  if (window.MutationObserver) {
    new MutationObserver(refreshBadgeSoon).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
  }
  window.addEventListener('load', refreshBadgeSoon, { once: true });
  window.addEventListener('pageshow', refreshBadgeSoon);
  const startMinimized = safeGet(LS.orbMinimized) === '1';
  if (startMinimized) {
    orbMinBtn.hidden = true;
    requestAnimationFrame(() => minimizeOrb({ persist: false, focus: false, animate: false }));
  } else {
    requestAnimationFrame(syncOrbBadge);
  }
}

function restorePanel() {
  // 窄屏不使用桌面端记住的坐标/尺寸，否则会把面板恢复到屏幕外。
  if (innerWidth <= 640) {
    panel.style.left = panel.style.top = panel.style.right = panel.style.bottom = '';
    panel.style.width = panel.style.height = '';
    return;
  }
  const pos = safeGet(LS.pos), size = safeGet(LS.size);
  try {
    if (pos) { const p = JSON.parse(pos); if (p.left != null) { panel.style.left = p.left + 'px'; panel.style.top = p.top + 'px'; panel.style.right = 'auto'; panel.style.bottom = 'auto'; } }
    if (size) { const s = JSON.parse(size); if (s.w) panel.style.width = s.w + 'px'; if (s.h) panel.style.height = s.h + 'px'; }
  } catch {}
}

function applyPanelGlass() {
  try {
    if (!panel || !window.Hyalite || !Hyalite.supported()) return;
    if (!panel.dataset.hyalite) {
      Hyalite.attach(panel, {
        bevel: 28, thickness: 38, slope: 2.2, shape: 'squircle',
        blur: 12, dispersion: 1.1, shade: 0.28, rim: 1.25,
        edgeW: 8, edge: 0.28
      });
      panel.dataset.hyalite = '1';
    } else {
      Hyalite.refresh(panel);
    }
  } catch (e) {}
}

let orbGlassTimer = 0;
let panelCloseTimer = 0;
let panelOpenTimer = 0;
let orbActivateTimer = 0;
let orbTuckTimer = 0;
let orbArriveTimer = 0;
function applyOrbGlass() {
  try {
    if (!orb || !window.Hyalite || !Hyalite.supported()) return;
    if (!orb.dataset.hyalite) {
      Hyalite.attach(orb, {
        bevel: 16, thickness: 22, slope: 1.5, shape: 'circle',
        blur: 1.6, dispersion: 1.35, shade: 0.12, rim: 1.55,
        edgeW: 3.6, sat: 1.24, edge: 0.30, light: 130, materialize: 650
      });
      orb.dataset.hyalite = '1';
    } else {
      Hyalite.refresh(orb);
    }
  } catch (e) {}
}

let kitCloseTimer = 0;
function renderKit() {
  const grid = $('#jv-kit-grid');
  if (!grid) return;
  grid.innerHTML = KIT_SITES.map((site, i) => `<a class="jv-kit-card" href="${esc(site.url)}" target="_blank" rel="noopener noreferrer" aria-label="在新窗口打开 ${esc(site.name)}">
    <span class="jv-kit-no">${String(i + 1).padStart(2, '0')}</span>
    <span class="jv-kit-name">${esc(site.name)}</span>
    <span class="jv-kit-tag">${esc(site.tag)}</span>
    <span class="jv-kit-why">${esc(site.why)}</span>
    <span class="jv-kit-go">去看看 <i aria-hidden="true">↗</i></span>
  </a>`).join('');
}

function openKit() {
  const layer = $('#jv-kit-layer');
  if (!layer || state.kitOpen) return;
  clearTimeout(kitCloseTimer);
  state.kitOpen = true;
  renderKit();
  layer.hidden = false;
  document.body.classList.add('jv-kit-lock');
  void layer.offsetWidth;
  layer.classList.add('is-open');
  try { $('#jv-kit-layer .jv-kit-close')?.focus({ preventScroll: true }); } catch {}
}

function closeKit() {
  const layer = $('#jv-kit-layer');
  if (!layer || !state.kitOpen) return;
  state.kitOpen = false;
  layer.classList.remove('is-open');
  document.body.classList.remove('jv-kit-lock');
  clearTimeout(kitCloseTimer);
  kitCloseTimer = setTimeout(() => { if (!state.kitOpen) layer.hidden = true; }, 180);
  try { if (state.panelOpen) input?.focus({ preventScroll: true }); } catch {}
}

function openPanel() {
  if (state.orbMinimized) restoreOrb({ open: false, focus: false, animate: false });
  if (state.panelOpen) return;
  clearTimeout(panelCloseTimer);
  clearTimeout(panelOpenTimer);
  clearTimeout(orbActivateTimer);
  panel.classList.remove('is-closing');
  // 窄屏一律清掉桌面端拖动留下的内联坐标，避免面板从屏幕右侧外面长出来。
  if (innerWidth <= 640) {
    panel.style.left = panel.style.top = panel.style.right = panel.style.bottom = '';
    panel.style.width = panel.style.height = '';
  }
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  const narrow = innerWidth <= 640;
  // 先把内容排好，避免面板第一次出现时才开始排版。
  renderAll();
  state.panelOpen = true;
  orb.setAttribute('aria-expanded', 'true');
  playActivation();
  orb.classList.add('is-activating');
  // 让光圈先亮半拍，面板再从悬浮球的位置接上；手机从底部上浮。
  setTimeout(() => {
    if (!state.panelOpen) return;
    panel.hidden = false;
    applyPanelGlass();
    const p = panel.getBoundingClientRect();
    const o = orb.getBoundingClientRect();
    if (!narrow) {
      const ox = Math.max(10, Math.min(p.width - 10, (o.left + o.width / 2) - p.left));
      const oy = Math.max(10, Math.min(p.height - 10, (o.top + o.height / 2) - p.top));
      panel.style.transformOrigin = `${ox}px ${oy}px`;
    } else {
      panel.style.transformOrigin = '';
    }
    panel.classList.remove('is-opening');
    if (!reduced) {
      void panel.offsetWidth;
      panel.classList.add('is-opening');
      panelOpenTimer = setTimeout(() => panel.classList.remove('is-opening'), 520);
    }
    orb.classList.add('is-open');
    setTimeout(() => {
      if (!state.panelOpen) return;
      try { input.focus(); } catch {}
    }, reduced ? 0 : (narrow ? 380 : 260));
  }, reduced ? 0 : (narrow ? 120 : 160));
  orbActivateTimer = setTimeout(() => orb.classList.remove('is-activating'), reduced ? 0 : 620);
  // 门禁放在开窗动画之后启动，避免检测条在面板还在长大时就换页。
  if (!state.gate && !state.gateRunning) setTimeout(() => { if (state.panelOpen) runGate(); }, (reduced ? 0 : (narrow ? 120 : 160)) + (reduced ? 0 : 560));
}

const activationTimers = { edge: 0, hide: 0, edgeHide: 0 };

function playEdgeHalo() {
  const el = $('#jv-edge-halo');
  if (!el) return;
  clearTimeout(activationTimers.edgeHide);
  el.classList.remove('on', 'is-holding', 'is-ending');
  void el.offsetWidth;
  el.classList.add('on');
}

// 面板内每次按按钮都重播一次全屏边缘光；它和面板同层级，改为压过面板，
// 不能再只亮面板四周的缝。
document.addEventListener('pointerdown', (e) => {
  if (!state.panelOpen) return;
  const button = e.target && e.target.closest ? e.target.closest('.jv-panel button') : null;
  if (!button || button.disabled) return;
  playEdgeHalo();
}, { passive: true });

function playActivation() {
  const el = $('#jv-activation');
  if (!el || !orb) return;
  clearTimeout(activationTimers.edge);
  clearTimeout(activationTimers.hide);
  clearTimeout(activationTimers.edgeHide);
  const r = orb.getBoundingClientRect();
  el.style.left = (r.left + r.width / 2) + 'px';
  el.style.top = (r.top + r.height / 2) + 'px';
  el.hidden = false;
  el.classList.remove('on', 'is-ending');
  void el.offsetWidth;
  el.classList.add('on');
  // 面板出现时，边缘光同步接入；爆发结束后把整个启动层收掉。
  activationTimers.edge = setTimeout(() => {
    if (state.panelOpen) playEdgeHalo();
  }, 240);
  activationTimers.hide = setTimeout(() => {
    if (!state.panelOpen) return;
    el.classList.add('is-ending');
    activationTimers.hide = setTimeout(() => {
      el.hidden = true;
      el.classList.remove('on', 'is-ending');
    }, 320);
  }, 1120);
}

function stopActivation() {
  clearTimeout(activationTimers.edge);
  const el = $('#jv-activation');
  if (el) {
    el.classList.remove('on');
    el.classList.add('is-ending');
    clearTimeout(activationTimers.hide);
    activationTimers.hide = setTimeout(() => {
      el.hidden = true;
      el.classList.remove('is-ending');
    }, 420);
  }
  const edge = $('#jv-edge-halo');
  if (edge) {
    edge.classList.remove('on');
    edge.classList.add('is-ending');
    clearTimeout(activationTimers.edgeHide);
    activationTimers.edgeHide = setTimeout(() => edge.classList.remove('is-ending'), 480);
  }
}

function closePanel() {
  if (!state.panelOpen && !panel.classList.contains('is-closing')) return;
  if (state.kitOpen) closeKit();
  clearTimeout(panelCloseTimer);
  clearTimeout(panelOpenTimer);
  clearTimeout(orbActivateTimer);
  state.panelOpen = false;
  state.searchOpen = false;
  if (searchView) searchView.hidden = true;
  panel.classList.remove('is-opening');
  panel.classList.add('is-closing');
  orb.classList.remove('is-open', 'is-activating');
  orb.setAttribute('aria-expanded', 'false');
  stopActivation();
  try { orb.focus({ preventScroll: true }); } catch {}
  panelCloseTimer = setTimeout(function(){
    panel.hidden = true;
    panel.classList.remove('is-closing');
  }, 240);
  setTimeout(syncOrbBadge, 260);
}

function orbCorner() {
  if (!orb) return 'br';
  const r = orb.getBoundingClientRect();
  const right = r.left + r.width / 2 >= innerWidth / 2;
  const bottom = r.top + r.height / 2 >= innerHeight / 2;
  return `${bottom ? 'b' : 't'}${right ? 'r' : 'l'}`;
}

function syncOrbBadge() {
  if (!orbMinBtn || !orb || state.orbMinimized) { if (orbMinBtn) orbMinBtn.hidden = true; return; }
  // 首页会通过 html.subjects-home 隐藏悬浮球；没有布局盒时不要留下一个漂在左上角的孤儿减号。
  if (!orb.getClientRects().length) { orbMinBtn.hidden = true; return; }
  const r = orb.getBoundingClientRect();
  const pad = 20;
  orbMinBtn.style.left = Math.round(Math.max(pad, Math.min(innerWidth - pad, r.right + 2))) + 'px';
  orbMinBtn.style.top = Math.round(Math.max(pad, Math.min(innerHeight - pad, r.top + 4))) + 'px';
  orbMinBtn.hidden = false;
}

function minimizeOrb({ persist = true, focus = true, animate = true } = {}) {
  if (!orb || state.orbMinimized) return;
  if (state.panelOpen) closePanel();
  clearTimeout(orbTuckTimer);
  clearTimeout(orbArriveTimer);
  orb.classList.remove('is-untucking', 'is-tucking', 'is-scrolling', 'is-gliding');
  orb.style.setProperty('--jv-shift', '0px');
  orb.style.setProperty('--jv-tilt', '0deg');
  orb.style.setProperty('--jv-glow', '0');
  orb.style.setProperty('--jv-lean', '0deg');
  orb.style.setProperty('--jv-trail-x', '0px');
  orb.style.setProperty('--jv-trail-y', '0px');
  orb.style.removeProperty('--jv-untuck-x');
  orb.style.removeProperty('--jv-untuck-y');
  state.orbMinimized = true;
  if (persist) safeSet(LS.orbMinimized, '1');
  orbMinBtn.hidden = true;
  const corner = orbCorner();
  orbRestoreBtn.dataset.corner = corner;
  orb.setAttribute('aria-hidden', 'true');
  orb.tabIndex = -1;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  if (!animate || reduced) {
    orb.classList.add('is-minimized');
    orbRestoreBtn.hidden = false;
    if (focus) { try { orbRestoreBtn.focus({ preventScroll: true }); } catch {} }
    return;
  }
  // 让“收起”不是原地消失：先沿最短路径飞向角落，缩成与恢复点完全重合的圆点。
  orbRestoreBtn.hidden = false;
  orbRestoreBtn.style.visibility = 'hidden';
  const rr = orbRestoreBtn.getBoundingClientRect();
  orbRestoreBtn.style.visibility = '';
  orbRestoreBtn.hidden = true;
  const r = orb.getBoundingClientRect();
  const targetX = rr.left + rr.width / 2;
  const targetY = rr.top + rr.height / 2;
  orb.style.setProperty('--jv-tuck-x', Math.round((targetX - (r.left + r.width / 2)) * 10) / 10 + 'px');
  orb.style.setProperty('--jv-tuck-y', Math.round((targetY - (r.top + r.height / 2)) * 10) / 10 + 'px');
  orb.classList.add('is-tucking');
  orbTuckTimer = setTimeout(() => {
    if (!state.orbMinimized) return;
    orb.classList.remove('is-tucking');
    orb.classList.add('is-minimized');
    orb.style.removeProperty('--jv-tuck-x');
    orb.style.removeProperty('--jv-tuck-y');
    orbRestoreBtn.hidden = false;
    orbRestoreBtn.classList.remove('is-arriving');
    void orbRestoreBtn.offsetWidth;
    orbRestoreBtn.classList.add('is-arriving');
    clearTimeout(orbArriveTimer);
    orbArriveTimer = setTimeout(() => orbRestoreBtn.classList.remove('is-arriving'), 320);
    if (focus) { try { orbRestoreBtn.focus({ preventScroll: true }); } catch {} }
  }, 500);
}

function restoreOrb({ open = false, focus = true, animate = true } = {}) {
  if (!orb || !state.orbMinimized) return;
  clearTimeout(orbTuckTimer);
  clearTimeout(orbArriveTimer);
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches === true;
  const shouldAnimate = animate && !reduced;
  state.orbMinimized = false;
  safeSet(LS.orbMinimized, '0');
  orb.removeAttribute('aria-hidden');
  orb.tabIndex = 0;
  if (!shouldAnimate) {
    orbRestoreBtn.hidden = true;
    orb.classList.remove('is-minimized', 'is-tucking', 'is-untucking');
    orb.style.removeProperty('--jv-tuck-x');
    orb.style.removeProperty('--jv-tuck-y');
    orb.style.removeProperty('--jv-untuck-x');
    orb.style.removeProperty('--jv-untuck-y');
    syncOrbBadge();
    if (open) openPanel();
    else if (focus) { try { orb.focus({ preventScroll: true }); } catch {} }
    return;
  }
  const rr = orbRestoreBtn.getBoundingClientRect();
  orbRestoreBtn.hidden = true;
  const r = orb.getBoundingClientRect();
  orb.style.setProperty('--jv-untuck-x', Math.round((rr.left + rr.width / 2 - (r.left + r.width / 2)) * 10) / 10 + 'px');
  orb.style.setProperty('--jv-untuck-y', Math.round((rr.top + rr.height / 2 - (r.top + r.height / 2)) * 10) / 10 + 'px');
  orb.classList.remove('is-minimized', 'is-tucking');
  orb.classList.add('is-untucking');
  orbTuckTimer = setTimeout(() => {
    orb.classList.remove('is-untucking');
    orb.style.removeProperty('--jv-untuck-x');
    orb.style.removeProperty('--jv-untuck-y');
    syncOrbBadge();
    if (open) openPanel();
    else if (focus) { try { orb.focus({ preventScroll: true }); } catch {} }
  }, 520);
}

function orbBounds() {
  const w = orb.offsetWidth || 74;
  const h = orb.offsetHeight || 74;
  const pad = 6;
  return {
    w,
    h,
    pad,
    maxX: Math.max(pad, innerWidth - w - pad),
    maxY: Math.max(pad, innerHeight - h - pad),
  };
}

function placeOrb(left, top, bounds) {
  const b = bounds || orbBounds();
  const x = Math.max(b.pad, Math.min(b.maxX, left));
  const y = Math.max(b.pad, Math.min(b.maxY, top));
  // 拖拽时保留亚像素坐标，避免 1px 取整让球在慢速移动时“一格一格”跳。
  orb.style.left = Math.round(x * 100) / 100 + 'px';
  orb.style.top = Math.round(y * 100) / 100 + 'px';
  orb.style.right = 'auto';
  orb.style.bottom = 'auto';
  return { left: x, top: y, bounds: b };
}

function saveOrbPosition(left, top, bounds) {
  const b = bounds || orbBounds();
  safeSet(LS.orbPos, JSON.stringify({
    x: Math.max(0, Math.min(1, left / b.maxX)),
    y: Math.max(0, Math.min(1, top / b.maxY)),
  }));
}

function restoreOrbPosition() {
  const raw = safeGet(LS.orbPos);
  if (!raw) return;
  try {
    const p = JSON.parse(raw);
    if (typeof p.x !== 'number' || typeof p.y !== 'number') return;
    const b = orbBounds();
    const maxX = Math.max(1, b.maxX);
    const maxY = Math.max(1, b.maxY);
    placeOrb(p.x * maxX, p.y * maxY, b);
  } catch {}
}

function setupOrbDrag() {
  if (!orb) return;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)') || { matches: false };
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  let drag = null;
  let drawFrame = 0;
  let glideFrame = 0;
  let suppressClickUntil = 0;

  const resetMotionVars = () => {
    orb.style.setProperty('--jv-lean', '0deg');
    orb.style.setProperty('--jv-trail-x', '0px');
    orb.style.setProperty('--jv-trail-y', '0px');
    orb.style.setProperty('--jv-motion', '0');
  };

  const motionVars = (vx, vy) => {
    // vx / vy 是 px·ms⁻¹；倾斜跟手、光晕反向拖尾，让玻璃球像有惯性。
    const lean = clamp(vx * 9, -7, 7);
    const trailX = clamp(-vx * 15, -12, 12);
    const trailY = clamp(-vy * 15, -12, 12);
    orb.style.setProperty('--jv-lean', lean.toFixed(2) + 'deg');
    orb.style.setProperty('--jv-trail-x', trailX.toFixed(2) + 'px');
    orb.style.setProperty('--jv-trail-y', trailY.toFixed(2) + 'px');
    orb.style.setProperty('--jv-motion', clamp(Math.hypot(vx, vy) * 0.22, 0, 0.2).toFixed(3));
  };

  const finishGlide = () => {
    if (glideFrame) { cancelAnimationFrame(glideFrame); glideFrame = 0; }
    orb.classList.remove('is-gliding');
    resetMotionVars();
    const left = parseFloat(orb.style.left);
    const top = parseFloat(orb.style.top);
    if (Number.isFinite(left) && Number.isFinite(top)) saveOrbPosition(left, top);
    syncOrbBadge();
  };

  const glide = (x, y, vx, vy, bounds) => {
    if (glideFrame) cancelAnimationFrame(glideFrame);
    orb.classList.add('is-gliding');
    let last = performance.now();
    const step = now => {
      const dt = Math.min(34, Math.max(1, now - last));
      last = now;
      x += vx * dt;
      y += vy * dt;
      if (x <= bounds.pad) { x = bounds.pad; vx = Math.abs(vx) * 0.42; }
      if (x >= bounds.maxX) { x = bounds.maxX; vx = -Math.abs(vx) * 0.42; }
      if (y <= bounds.pad) { y = bounds.pad; vy = Math.abs(vy) * 0.42; }
      if (y >= bounds.maxY) { y = bounds.maxY; vy = -Math.abs(vy) * 0.42; }
      placeOrb(x, y, bounds);
      motionVars(vx, vy);
      const speed = Math.hypot(vx, vy);
      const damping = Math.pow(0.90, dt / 16.667);
      vx *= damping;
      vy *= damping;
      if (speed < 0.02) { finishGlide(); return; }
      glideFrame = requestAnimationFrame(step);
    };
    glideFrame = requestAnimationFrame(step);
  };

  const release = (e, allowGlide) => {
    if (!drag) return;
    if (drawFrame) { cancelAnimationFrame(drawFrame); drawFrame = 0; }
    // 收尾时把最后一段还没绘制的位移补上，松手不会比指针慢半帧。
    if (e && Number.isFinite(e.clientX)) {
      drag.x = drag.left + e.clientX - drag.startX;
      drag.y = drag.top + e.clientY - drag.startY;
      drag.x = clamp(drag.x, drag.m.pad, drag.m.maxX);
      drag.y = clamp(drag.y, drag.m.pad, drag.m.maxY);
    }
    placeOrb(drag.x, drag.y, drag.m);
    const data = drag;
    const moved = data.moved;
    const pointerId = data.pointerId;
    const idleFor = performance.now() - data.lastT;
    // 160ms 内松手才继承速度：覆盖 30fps 触控采样，又不会让“停住再松手”突然滑走。
    const vx = idleFor > 160 ? 0 : data.vx;
    const vy = idleFor > 160 ? 0 : data.vy;
    drag = null;
    orb.classList.remove('is-dragging');
    try { orb.releasePointerCapture?.(pointerId); } catch {}
    if (!moved) {
      resetMotionVars();
      syncOrbBadge();
      return;
    }
    // 拖拽结束会补发一次 click；暂时吞掉，避免松手时误开面板。
    suppressClickUntil = performance.now() + 520;
    if (allowGlide && !reduce.matches && Math.hypot(vx, vy) > 0.06) {
      glide(data.x, data.y, vx, vy, data.m);
    } else {
      resetMotionVars();
      saveOrbPosition(data.x, data.y, data.m);
      syncOrbBadge();
    }
  };

  orb.addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (glideFrame) { cancelAnimationFrame(glideFrame); glideFrame = 0; }
    orb.classList.remove('is-gliding', 'is-scrolling');
    // 先把滚动形变和位移归零，再取基准坐标，避免从缩小/上浮状态起手时跳一下。
    orb.style.setProperty('--jv-shift', '0px');
    orb.style.setProperty('--jv-tilt', '0deg');
    orb.style.setProperty('--jv-glow', '0');
    orb.style.setProperty('--jv-spin-duration', '9s');
    orb.classList.add('is-dragging');
    resetMotionVars();
    void orb.offsetWidth;
    const layoutW = orb.offsetWidth || 74;
    const layoutH = orb.offsetHeight || 74;
    const r = orb.getBoundingClientRect();
    // is-dragging 会把球放大 4.5%；rect 是放大后的视觉盒，先还原到未缩放的布局坐标。
    const layoutLeft = r.left + (r.width - layoutW) / 2;
    const layoutTop = r.top + (r.height - layoutH) / 2;
    drag = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      lastT: performance.now(),
      vx: 0,
      vy: 0,
      left: layoutLeft,
      top: layoutTop,
      x: layoutLeft,
      y: layoutTop,
      moved: false,
      m: orbBounds(),
    };
    try { orb.setPointerCapture?.(e.pointerId); } catch {}
  });

  orb.addEventListener('pointermove', e => {
    if (!drag || e.pointerId !== drag.pointerId) return;
    const now = performance.now();
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved) {
      if (Math.hypot(dx, dy) < 7) return;
      drag.moved = true;
    }
    if (e.cancelable) e.preventDefault();
    const dt = Math.max(4, now - drag.lastT);
    if (dt < 160) {
      const ivx = (e.clientX - drag.lastX) / dt;
      const ivy = (e.clientY - drag.lastY) / dt;
      drag.vx = clamp(drag.vx * 0.55 + ivx * 0.45, -1.1, 1.1);
      drag.vy = clamp(drag.vy * 0.55 + ivy * 0.45, -1.1, 1.1);
    } else {
      drag.vx = drag.vy = 0;
    }
    drag.lastX = e.clientX;
    drag.lastY = e.clientY;
    drag.lastT = now;
    drag.x = clamp(drag.left + dx, drag.m.pad, drag.m.maxX);
    drag.y = clamp(drag.top + dy, drag.m.pad, drag.m.maxY);
    if (!drawFrame) {
      drawFrame = requestAnimationFrame(() => {
        drawFrame = 0;
        if (!drag) return;
        placeOrb(drag.x, drag.y, drag.m);
        motionVars(drag.vx, drag.vy);
      });
    }
  });

  orb.addEventListener('pointerup', e => release(e, true));
  orb.addEventListener('pointercancel', e => release(e, false));
  orb.addEventListener('dragstart', e => e.preventDefault());
  // capture 阶段先于原来的 click，拖拽松手不会误触“打开/收起”。
  orb.addEventListener('click', e => {
    if (performance.now() < suppressClickUntil) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  }, true);

  window.addEventListener('resize', () => {
    if (glideFrame) { cancelAnimationFrame(glideFrame); glideFrame = 0; }
    orb.classList.remove('is-gliding');
    resetMotionVars();
    restoreOrbPosition();
    if (state.orbMinimized) { orbRestoreBtn.dataset.corner = orbCorner(); }
    else syncOrbBadge();
    clearTimeout(orbGlassTimer);
    orbGlassTimer = setTimeout(applyOrbGlass, 220);
  }, { passive: true });
}

function setupDrag() {
  const head = $('#jv-head'); let drag = null;
  head.addEventListener('pointerdown', e => {
    if (e.target.closest('button')) return;
    if (innerWidth <= 640) return;
    const r = panel.getBoundingClientRect();
    drag = { x: e.clientX, y: e.clientY, l: r.left, t: r.top };
    head.setPointerCapture?.(e.pointerId);
  });
  head.addEventListener('pointermove', e => {
    if (!drag) return;
    const w = panel.offsetWidth, h = panel.offsetHeight;
    const left = Math.max(8, Math.min(innerWidth - w - 8, drag.l + e.clientX - drag.x));
    const top = Math.max(8, Math.min(innerHeight - h - 8, drag.t + e.clientY - drag.y));
    panel.style.left = left + 'px'; panel.style.top = top + 'px'; panel.style.right = 'auto'; panel.style.bottom = 'auto';
  });
  head.addEventListener('pointerup', () => {
    if (!drag) return;
    drag = null;
    safeSet(LS.pos, JSON.stringify({ left: panel.offsetLeft, top: panel.offsetTop }));
  });
}
function setupResize() {
  const handle = $('#jv-resize'); let rs = null;
  handle.addEventListener('pointerdown', e => {
    if (innerWidth <= 640) return;
    const r = panel.getBoundingClientRect(); rs = { x: e.clientX, y: e.clientY, w: r.width, h: r.height };
    handle.setPointerCapture?.(e.pointerId); e.preventDefault();
  });
  handle.addEventListener('pointermove', e => {
    if (!rs) return;
    const w = Math.max(340, Math.min(innerWidth - 24, rs.w + e.clientX - rs.x));
    const h = Math.max(420, Math.min(innerHeight - 24, rs.h + e.clientY - rs.y));
    panel.style.width = w + 'px'; panel.style.height = h + 'px';
  });
  handle.addEventListener('pointerup', () => {
    if (!rs) return; rs = null;
    safeSet(LS.size, JSON.stringify({ w: panel.offsetWidth, h: panel.offsetHeight }));
  });
}

/* ===================== 状态 / 渲染 ===================== */
function currentAdmission() {
  return admission({
    gateResult: state.gate,
    modelDownloaded: state.modelReady,
    downloading: state.downloading,
    downloadError: state.gateError && state.gate?.ok ? state.gateError : null,
    aiRequested: true,
  });
}

function modeLabel() {
  if (state.sourceNotice) return state.sourceNotice;
  if (state.gateRunning) return '混合模型 · 正在检测本机';
  if (state.downloading) return '混合模型 · 正在下载本地';
  if (!state.gate) return '混合模型 · 待检测';
  if (state.cloudOnly) {
    if (state.cloudChecking) return '云端 Javis · 正在连接';
    return state.cloudReady ? '云端 Javis · 可用' : '云端 Javis · 连接失败';
  }
  if (!state.gate.ok) return '混合模型 · 本机不支持本地';
  if (!state.modelReady) {
    if (state.cloudChecking) return '混合模型 · 正在检测云端';
    return state.cloudReady ? '云端 Javis · 可用' : '混合模型 · 待下载本地';
  }
  if (state.cloudChecking) return '混合模型 · 正在检测云端';
  return state.activeSource === 'cloud' ? '混合模型 · 云端' : '混合模型 · 本地';
}

function renderAll() { renderHeader(); renderGate(); renderChat(); renderQuick(); renderSearch(); }

function renderHeader() {
  if (!statusEl) return;
  statusEl.textContent = modeLabel();
  const live = $('#jv-live');
  const localReady = !!state.gate?.ok && state.modelReady;
  const ready = localReady || state.cloudReady;
  const chip = $('#jv-model-chip');
  if (chip) { chip.hidden = !localReady; if (localReady) chip.textContent = `${modelLabel()} · 切换`; }
  const localAction = $('#jv-local-action');
  if (localAction) {
    const cached = !!state.downloadedModels[state.modelKey];
    if (localReady) {
      localAction.hidden = false;
      localAction.textContent = '卸载本地';
      localAction.title = '卸载本地 AI，释放显存；下载的权重仍保留';
      localAction.dataset.jvAction = 'unload';
      localAction.disabled = !!state.downloading;
      localAction.setAttribute('aria-label', '卸载本地 AI');
    } else if (state.localUnloaded && cached) {
      localAction.hidden = false;
      localAction.textContent = '重新加载本地';
      localAction.title = '从本机缓存重新加载本地模型，不会重新下载';
      localAction.dataset.jvAction = 'loadLocal';
      localAction.disabled = !!state.downloading;
      localAction.setAttribute('aria-label', '重新加载本地 AI');
    } else {
      localAction.hidden = true;
      localAction.disabled = true;
    }
  }
  const switchEl = $('#jv-source-switch');
  if (switchEl) {
    switchEl.hidden = !localReady;
    if (localReady) switchEl.querySelectorAll('button').forEach(btn => {
      const src = btn.dataset.source;
      const on = src === state.activeSource;
      btn.classList.toggle('on', on);
      btn.classList.toggle('is-off', src === 'cloud' && !state.cloudReady);
      btn.setAttribute('aria-pressed', String(on));
      btn.disabled = !!state.busy || state.cloudChecking;
      btn.title = src === 'cloud'
        ? (state.cloudReady ? '使用云端模型回答' : '云端未连接，点击重试')
        : '使用本地模型回答';
    });
  }
  const retrieveBtn = $('#jv-retrieve');
  if (retrieveBtn) {
    retrieveBtn.disabled = false;
    retrieveBtn.title = '打开站内检索窗口，不调用 AI';
  }
  if (sendBtn) sendBtn.title = state.busy ? '停止生成' : '发送';
  if (live) {
    live.classList.remove('search', 'bad');
    if ((state.cloudOnly || (state.gate && !state.gate.ok)) && !state.cloudReady) live.classList.add('bad');
    else if (!ready || state.forceSearch) live.classList.add('search');
  }
  const foot = $('#jv-foot-left');
  if (foot) {
    if (localReady && !state.forceSearch) foot.textContent = state.activeSource === 'cloud' ? '云端模型 · 纯回答' : `本地 ${modelLabel()} · 纯回答`;
    else if (state.localUnloaded) foot.textContent = state.cloudReady ? '云端 Javis · 本地 AI 已卸载' : '本地 AI 已卸载 · 可重新加载';
    else if (state.cloudReady && !localReady) foot.textContent = '云端 Javis · 本地模型未下载';
    else foot.textContent = '模型直答 · 查资料请打开检索窗口';
  }
}

function modelCardsHTML() {
  const recKey = currentRecommendationKey();
  const portable = isPortableDevice();
  const safari = isSafariBrowser();
  const storageFree = state.gate?.metrics?.storageFree;
  return `<div class="jv-model-grid">${Object.values(MODELS).map(m => {
    const selected = state.modelKey === m.key;
    const cached = !!state.downloadedModels[m.key];
    const rec = m.key === recKey;
    const fit = MODEL_FIT[m.key] || {};
    let note = m.note;
    if (portable && m.key !== '0.5b') note += `；建议 ${fit.mobileMemoryGB}GB+ 内存、GPU ≥${fit.mobileGflops} GFLOPS`;
    if (portable && safari && m.key !== '0.5b') note += '；Safari 单标签内存更紧，可能被系统回收';
    if (Number.isFinite(storageFree) && fit.storageGB && storageFree < fit.storageGB * 1024 ** 3 * 1.05) {
      note += `；当前可用存储约 ${(storageFree / 1024 ** 3).toFixed(1)}GB，可能不足`;
    }
    return `<button class="jv-model-card${selected ? ' selected' : ''}" type="button" data-jv-action="model" data-model="${m.key}">
      <span class="jv-model-top"><b>${m.label}</b>${rec ? `<span class="jv-model-rec">${portable ? '本机推荐' : '推荐'}</span>` : ''}${cached ? '<span class="jv-model-cached">已下载</span>' : ''}</span>
      <span class="jv-model-size">${m.size} · 内存 ${m.vram}</span>
      <span class="jv-model-note">${note}</span>
    </button>`;
  }).join('')}</div>`;
}

function renderGate() {
  if (!gateBox) return;
  const g = state.gate;
  const picked = modelMeta();
  const portable = isPortableDevice();
  if (state.modelPickerOpen && g?.ok) {
    gateBox.innerHTML = `<div class="jv-intro">
      <div class="jv-kicker">性能通过 / 切换本地模型</div>
      <div class="jv-lead">选择要使用的本地模型。</div>
      <div class="jv-copy">手机也可以下载 0.5B / 1.5B / 3B；推荐档位按 WebGPU 跑分、内存和存储计算，不按机型一刀切。已下载的模型可直接切换，未下载的会先安装；大模型在手机上更可能被系统回收。</div>
      ${modelCardsHTML()}
      <div class="jv-small">${recommendedModelLine()}。0.5B 约 0.4GB；1.5B 约 1.1GB；3B 约 2GB。${portable ? '手机 3B 建议 8GB+ 内存且 GPU ≥80 GFLOPS；' : '桌面 3B 更适合 16GB+ 内存；'}下载前可用云端。</div>
      <div class="jv-actions"><button class="jv-btn ghost" data-jv-action="closePicker" type="button">取消</button></div>
    </div>`;
    chatBox.hidden = true;
    return;
  }
  if (state.forceSearch && state.chatStarted && !state.downloading) {
    gateBox.innerHTML = '';
    chatBox.hidden = false;
    return;
  }
  if (state.gateRunning) {
    gateBox.innerHTML = `<div class="jv-intro">
      <div class="jv-kicker">JAVIS / LOCAL AI</div>
      <div class="jv-lead">先看看这台设备能不能跑本地 AI。</div>
      <div class="jv-copy">检测 WebGPU、显存/内存、存储和一次真实 GPU 跑分。Safari、Chrome、Edge 和手机浏览器都走同一套检测，不达标就停在检索模式，不会下载任何模型。</div>
      <div class="jv-gate-card"><div class="jv-gate-title"><span class="jv-dot"></span>正在检测本机</div>
      <div class="jv-bar"><i style="width:35%"></i></div><div class="jv-small">正在申请 GPU 并跑一次 1024 矩阵乘…</div></div>
      <div class="jv-actions"><button class="jv-btn ghost" data-jv-action="search" type="button">跳过检测，先检索</button></div>
    </div>`;
    chatBox.hidden = true;
    return;
  }
  if (!g) {
    gateBox.innerHTML = `<div class="jv-intro">
      <div class="jv-kicker">JAVIS / 混合模型</div>
      <div class="jv-lead">把整站课程，装进一个随叫随到的窗口。</div>
      <div class="jv-copy">我是 Javis。先做一次最低性能检测：Safari、Chrome、Edge 和手机浏览器都支持；达标后可选 0.5B / 1.5B / 3B，推荐档位按本机跑分、内存和存储计算，不再默认所有手机 0.5B。完整下载后解锁云端模型；不达标，AI 会关闭，只保留独立的站内检索窗口。</div>
      <div class="jv-note">检测只看 WebGPU、内存、存储和 GPU 跑分，结果留在本机。模型下载前不会建立任何对话连接。</div>
      <div class="jv-actions">
        <button class="jv-btn primary" data-jv-action="check" type="button">开始检测</button>
        <button class="jv-btn ghost" data-jv-action="search" type="button">打开检索窗口</button>
      </div>
    </div>`;
    chatBox.hidden = true;
    return;
  }
  if (!g.ok) {
    const failed = (g.checks || []).filter(c => !c.ok).slice(0, 4);
    if (state.cloudOnly && state.cloudReady) {
      gateBox.innerHTML = `<div class="jv-intro">
        <div class="jv-kicker">本机不能跑本地模型 / 云端可用</div>
        <div class="jv-lead">已切到云端 Javis。</div>
        <div class="jv-copy">这台设备的 WebGPU 或资源不满足本地模型，但云端通道已经连通。你仍然可以直接提问；想查课程正文，点输入框旁的“检索”。</div>
        <div class="jv-gate-card"><div class="jv-gate-title"><span class="jv-dot ok"></span>${esc(gateReason(g))}</div><div class="jv-small">本地检测未通过，不下载任何模型；云端回答不依赖本机 GPU。</div></div>
        <div class="jv-actions">
          <button class="jv-btn primary" data-jv-action="cloud" type="button">开始云端对话</button>
          <button class="jv-btn ghost" data-jv-action="search" type="button">打开检索窗口</button>
          <button class="jv-btn ghost" data-jv-action="check" type="button">重新检测</button>
        </div>
      </div>`;
      chatBox.hidden = !state.chatStarted;
      return;
    }
    if (state.cloudOnly && state.cloudChecking) {
      gateBox.innerHTML = `<div class="jv-intro">
        <div class="jv-kicker">本机不能跑本地模型 / 正在连接云端</div>
        <div class="jv-lead">正在连接云端 Javis…</div>
        <div class="jv-copy">本机检测未通过，但不需要下载模型。正在探测云端通道；连接成功后直接进入云端对话。</div>
        <div class="jv-gate-card"><div class="jv-gate-title"><span class="jv-dot"></span>${esc(gateReason(g))}</div><div class="jv-bar"><i style="width:45%"></i></div></div>
      </div>`;
      chatBox.hidden = true;
      return;
    }
    gateBox.innerHTML = `<div class="jv-intro">
      <div class="jv-kicker">本机检测未通过</div>
      <div class="jv-lead">本地模型跑不了，但 Javis 还能用云端。</div>
      <div class="jv-copy">这台设备的 WebGPU 或资源不满足本地模型，不会下载任何模型。可以改用云端 Javis 直接提问；如果云端也不可用，仍保留独立的“站内检索”窗口。</div>
      <div class="jv-gate-card">
        <div class="jv-gate-title"><span class="jv-dot bad"></span>${esc(gateReason(g))}</div>
        <div class="jv-check-list">${failed.map(c => `<div class="jv-check"><span class="jv-no">✕</span><span><b>${esc(c.label)}</b>：${esc(c.detail || '')}</span></div>`).join('') || '<div class="jv-small">没有拿到可用的 GPU 信息。</div>'}</div>
        <div class="jv-small">可以点“重新检测”再试；Safari 26+、Chrome 113+ 或支持 WebGPU 的手机浏览器都可以，记得开启硬件加速。iPhone 上的 Chrome 使用 WebKit，若没有 WebGPU 会自动走云端。</div>
      </div>
      <div class="jv-actions">
        <button class="jv-btn primary" data-jv-action="cloud" type="button">使用云端 Javis</button>
        <button class="jv-btn ghost" data-jv-action="search" type="button">打开检索窗口</button>
        <button class="jv-btn ghost" data-jv-action="check" type="button">重新检测</button>
      </div>
    </div>`;
    chatBox.hidden = !state.chatStarted;
    return;
  }
  // 性能达标但没下载本地模型：一旦云端已连通并开始对话，收起门禁页，只留聊天和下载提示。
  if (state.gate?.ok && !state.modelReady && state.chatStarted && state.cloudReady) {
    gateBox.innerHTML = ''; chatBox.hidden = false; return;
  }
  // gate pass
  if (state.downloading) {
    gateBox.innerHTML = `<div class="jv-intro">
      <div class="jv-kicker">性能通过 / 正在准备 Javis</div>
      <div class="jv-lead">正在下载本地模型 · ${esc(picked.label)}</div>
      <div class="jv-copy">${esc(picked.size)}。下载完成后启用本地模型；云端 Javis 不依赖这次下载，随时可用。</div>
      <div class="jv-gate-card"><div class="jv-gate-title"><span class="jv-dot ok"></span>下载中 · ${Math.round(state.downloadProgress * 100)}%</div>
      <div class="jv-bar"><i style="width:${Math.max(2, Math.round(state.downloadProgress * 100))}%"></i></div>
      <div class="jv-small">${esc(state.downloadStatus || '正在从官方模型仓库获取权重…')}</div></div>
      <div class="jv-actions"><button class="jv-btn ghost" data-jv-action="cloud" type="button">先用云端</button><button class="jv-btn ghost" data-jv-action="cancelDownload" type="button">取消下载</button><button class="jv-btn ghost" data-jv-action="search" type="button">先用检索</button></div>
    </div>`;
    chatBox.hidden = true;
    return;
  }
  if (!state.modelReady) {
    if (state.localUnloaded && state.downloadedModels[state.modelKey] && !state.downloading) {
      gateBox.innerHTML = `<div class="jv-intro">
        <div class="jv-kicker">本地 AI 已卸载</div>
        <div class="jv-lead">显存已经释放，模型权重仍在本机缓存。</div>
        <div class="jv-copy">重新加载会直接从缓存读取，不需要重新下载；也可以继续用云端 Javis 或站内检索。</div>
        <div class="jv-actions">
          <button class="jv-btn primary" data-jv-action="loadLocal" type="button">重新加载 ${esc(picked.label)}</button>
          <button class="jv-btn ghost" data-jv-action="cloud" type="button">继续用云端</button>
          <button class="jv-btn ghost" data-jv-action="search" type="button">站内检索</button>
        </div>
        <div class="jv-small">下载的权重保留在本机缓存；点“重新加载”不会重新消耗流量。</div>
      </div>`;
      chatBox.hidden = true;
      return;
    }
    if (state.chatStarted && state.forceSearch) { gateBox.innerHTML = ''; chatBox.hidden = false; return; }
    const failed = state.gateError && state.downloadAttempted ? `<div class="jv-error">${esc(friendlyDownloadError(state.gateError))}</div>` : '';
    gateBox.innerHTML = `<div class="jv-intro">
      <div class="jv-kicker">性能通过 / 选择本地模型</div>
      <div class="jv-lead">这台设备可以运行 Javis。</div>
      <div class="jv-copy">${isPortableDevice() ? '手机也可选 0.5B / 1.5B / 3B，推荐档位按本机跑分、内存和存储计算。' : (isSafariBrowser() ? 'Safari 可选 0.5B / 1.5B / 3B；单标签内存较紧，默认按跑分和存储保守推荐。' : '桌面可选 0.5B / 1.5B / 3B。')}一次只加载一个。下载前也可以直接用云端 Javis；下载完成后，云端和本地都直接回答。想查站内资料，点输入框旁的“检索”。</div>
      <div class="jv-actions jv-actions-download">
        <button class="jv-btn primary" data-jv-action="download" type="button">下载 ${esc(picked.label)} 并启用本地模型</button>
      </div>
      ${modelCardsHTML()}
      <div class="jv-gate-card"><div class="jv-gate-title"><span class="jv-dot ok"></span>最低性能检测通过 · 当前选择 ${esc(picked.label)}</div>
      <div class="jv-check-list">${(g.checks || []).filter(c => c.ok).slice(0, 4).map(c => `<div class="jv-check"><span class="jv-ok">✓</span><span><b>${esc(c.label)}</b>：${esc(c.detail || '')}</span></div>`).join('')}</div>
      ${failed}
      <div class="jv-small">${recommendedModelLine()}。手机可以手动切换更大的档位，但内存不足时可能被系统回收；下载完成后，底部“云端 / 本地”开关就是回答来源。</div></div>
      <div class="jv-actions">
        <button class="jv-btn ghost" data-jv-action="cloud" type="button">${state.cloudReady ? '开始云端对话' : '先用云端 Javis'}</button>
        <button class="jv-btn ghost" data-jv-action="search" type="button">打开检索窗口</button>
      </div>
    </div>`;
    chatBox.hidden = !state.chatStarted;
    return;
  }
  gateBox.innerHTML = '';
  chatBox.hidden = false;
}

function gateReason(g) {
  const map = {
    NO_SECURE: '当前页面不是 HTTPS 安全环境', NO_WEBGPU: '浏览器未开放 WebGPU',
    NO_ADAPTER: '没有拿到 GPU 适配器', NO_DEVICE: '无法创建 GPU 设备',
    NO_F16: 'GPU 不支持 shader-f16', UNSUPPORTED_BROWSER: '浏览器环境无法识别',
    GPU_LIMITS: 'GPU 资源上限不够（手机按 128MB 单缓冲检测）', LOW_MEMORY: '内存不足（手机 4GB / 桌面 8GB）', MEM_UNKNOWN: '内存信息未知',
    LOW_CPU: 'CPU 核心不足 4 个', LOW_STORAGE: '可用存储不足（手机 1GB / 桌面 1.5GB）', SLOW_GPU: 'GPU 跑分低于 15 GFLOPS',
    GATE_ERROR: '检测过程出错', MODEL_TIMEOUT: '模型加载超时', OOM: '显存/内存不足',
  };
  return map[g.code] || ('本机不满足条件：' + (g.code || 'UNKNOWN'));
}

function friendlyDownloadError(err) {
  const map = {
    MODEL_NOT_LOADED: '本地模型还没有加载。', MODEL_TIMEOUT: '模型下载/加载超时，请重试。',
    WARMUP_TIMEOUT: '模型下载完成，但预热推理超时；请重新加载，或换小一档。',
    FIRST_TOKEN_TIMEOUT: '本地模型首次出字超时，可能显存不足；请重试或换小一档。',
    OOM: '显存/内存不足，模型无法加载。', DEVICE_LOST: 'GPU 设备已丢失，请重新检测。',
    MODEL_LOAD: '模型加载失败，请重试。', LOCAL_BROKEN: '模型实例已重置，请重新点击下载。',
    LOCAL_CACHE_MISSING: '本地模型缓存已被系统清理，需要重新下载；下载前仍可先用云端。',
    ABORTED: '下载已取消，可以继续用云端，或稍后重新下载。',
  };
  return map[err] || ('本地模型加载失败：' + err);
}

/* ===================== 云端解锁 =====================
   规则：当前选中的本地模型完整下载完成之前，云端模型一直锁定；
   下载完成后才做 /api/health 探活。云端/本地只是来源偏好，
   用户可以在两者之间切换；云端掉线时自动回本地。 */
async function probeCloud({ allowCloudOnly = false } = {}) {
  const localReady = !!state.gate?.ok && state.modelReady;
  // 云端不依赖本地模型。Safari/手机性能达标但还没下载模型时，也允许直接连云端。
  if (!localReady && !state.cloudOnly && !state.gate?.ok) {
    state.cloudReady = false; state.activeSource = 'local'; return false;
  }
  state.cloudChecking = true; renderHeader();
  try {
    const h = await checkHealth({ base: CLOUD_BASE, timeout: 6000 });
    state.cloudReady = !!h.ok;
    if (h.ok) {
      state.cloudError = null;
      if (state.cloudOnly) { state.activeSource = 'cloud'; state.chatStarted = true; }
      else if (!localReady) { state.activeSource = 'cloud'; }
    } else {
      state.cloudError = h.reason || h.status || 'CLOUD_UNAVAILABLE';
    }
  } catch (e) {
    state.cloudReady = false;
    state.cloudError = String(e?.message || e);
  } finally {
    state.cloudChecking = false; renderHeader();
  }
  return state.cloudReady;
}

async function refreshCloud() {
  if (!state.gate?.ok) {
    state.cloudReady = false; state.activeSource = 'local'; return false;
  }
  const ok = await probeCloud();
  state.activeSource = ok && (!state.modelReady || state.preferredSource !== 'local') ? 'cloud' : 'local';
  renderHeader();
  return ok;
}

async function useCloudNow() {
  if (state.downloading) cancelDownload();
  state.preferredSource = 'cloud';
  safeSet(LS.source, 'cloud');
  state.activeSource = 'cloud';
  state.chatStarted = true;
  state.forceSearch = false;
  renderAll();
  await probeCloud();
  renderAll();
  try { input?.focus(); } catch {}
}

async function enableCloudOnly() {
  state.preferredSource = 'cloud';
  safeSet(LS.source, 'cloud');
  state.cloudOnly = true;
  state.chatStarted = true;
  state.activeSource = 'cloud';
  renderAll();
  await probeCloud({ allowCloudOnly: true });
  renderAll();
  try { input?.focus(); } catch {}
}

/* ===================== 性能门禁 ===================== */
async function runGate() {
  if (state.gateRunning) return;
  state.gateRunning = true; state.gateError = null; state.forceSearch = false; state.chatStarted = false;
  renderAll();
  let device = null;
  try {
    const gpu = navigator.gpu;
    const adapter = gpu ? await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' }) : null;
    let info = {};
    if (adapter) {
      try { info = adapter.info || (adapter.requestAdapterInfo ? await adapter.requestAdapterInfo() : {}); } catch {}
      try {
        const wanted = adapter.features?.has?.('shader-f16') ? ['shader-f16'] : [];
        device = await adapter.requestDevice({ requiredFeatures: wanted });
      } catch {
        try { device = await adapter.requestDevice(); } catch {}
      }
    }
    let storage = {};
    try { storage = navigator.storage?.estimate ? await navigator.storage.estimate() : {}; } catch {}
    let persisted = null;
    try { persisted = navigator.storage?.persist ? await navigator.storage.persist() : null; } catch {}
    const env = {
      secureContext: window.isSecureContext === true,
      gpu, adapter, device,
      ua: navigator.userAgent,
      deviceMemory: navigator.deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
      storage, storagePersisted: persisted,
    };
    let gate = evaluateEnvironment(env);
    if (gate.ok && device && adapter) {
      const bench = await runBenchmark(device, adapter);
      gate = withBenchmark(gate, bench);
    }
    state.gate = gate;
    state.gateRunning = false;
    if (gate.ok) {
      state.cloudOnly = false;
      // 没有明确选过档位时，按本次真实跑分/内存给推荐；用户手选过的档位永远保留。
      if (!state.modelChoiceExplicit && !state.modelReady && !state.localUnloaded) {
        state.modelKey = currentRecommendationKey();
        state.modelReady = !!state.downloadedModels[state.modelKey];
      }
      // 本地标记可能是上次会话留下的；如果浏览器缓存已被系统清理，
      // 先撤销“已下载”，避免用户点本地后才在加载阶段失败。
      await verifyCachedModel();
      if (state.modelReady) { state.forceSearch = false; state.chatStarted = true; refreshCloud(); }
      else { state.chatStarted = false; probeCloud().then(() => renderAll()).catch(() => {}); }
    } else {
      // 本机 GPU 不满足本地模型时，不再锁死 AI：浏览器本身可用就尝试云端。
      const browserOk = (gate.checks || []).some(c => c.id === 'browser' && c.ok);
      if (browserOk) {
        state.cloudOnly = true;
        state.chatStarted = true;
        state.activeSource = 'cloud';
        probeCloud({ allowCloudOnly: true }).then(() => renderAll()).catch(() => {});
      }
    }
    renderAll();
  } catch (e) {
    state.gateRunning = false;
    state.gate = { ok: false, code: 'GATE_ERROR', checks: [], metrics: {} };
    state.gateError = String(e?.message || e);
    renderAll();
  } finally {
    // 门禁的 device 只用于跑分；模型会自己建 WebGPU 设备，销毁以释放显存。
    try { device?.destroy?.(); } catch {}
  }
}

/* ===================== 模型下载 / 加载 ===================== */
async function startDownload() {
  if (state.downloading) return;
  if (state.busy) { flashSourceNotice('请先停止生成，再下载模型'); return; }
  if (!state.gate?.ok || state.modelReady) return;
  state.downloading = true; state.downloadAttempted = true; state.gateError = null; state.downloadProgress = 0; state.downloadStatus = '正在启动模型下载…';
  const seq = ++state.downloadSeq;
  renderAll();
  try {
    // 首页 HTML 本身约 18MB；页面图片还没加载完就抢带宽，Safari 会把模型请求拖到
    // “Start to fetch params” 很久不动。最多等 15 秒，让页面先就绪。
    if (document.readyState !== 'complete') {
      state.downloadStatus = '等待页面加载完成…';
      renderAll();
      await Promise.race([
        new Promise(resolve => window.addEventListener('load', resolve, { once: true })),
        new Promise(resolve => setTimeout(resolve, 15000)),
      ]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    const picked = modelMeta();
    if (!state.assistant || state.assistant.modelId !== picked.id) {
      try { await state.assistant?.unload?.(); } catch {}
      state.assistant = createAssistant({ modelId: picked.id });
    }
    const loadingAssistant = state.assistant;
    await loadingAssistant.load(p => {
      if (seq !== state.downloadSeq) return;
      state.downloadProgress = Math.max(0, Math.min(1, Number(p?.progress) || 0));
      const rawStatus = String(p?.text || '正在获取模型权重…');
      state.downloadStatus = rawStatus.includes('Start to fetch params')
        ? `正在下载 ${picked.label} 权重（${picked.size}，首次较慢，请保持窗口在前台）…`
        : rawStatus;
      if (state.panelOpen) renderGate();
    });
    if (seq !== state.downloadSeq) {
      try { await loadingAssistant.unload?.(); } catch {}
      if (state.assistant === loadingAssistant) state.assistant = null;
      return;
    }
    state.downloading = false;
    state.downloadedModels[state.modelKey] = true;
    persistModels();
    state.modelReady = true;
    state.localUnloaded = false;
    safeSet(LS.localUnloaded, '0');
    // “下载并启用本地模型”必须真的把回答来源切到本地；否则 refreshCloud 会按默认
    // 云端偏好把 activeSource 改回 cloud，权重下载完却仍在用云端，显存白占。
    state.preferredSource = 'local';
    safeSet(LS.source, 'local');
    state.modelPickerOpen = false;
    state.forceSearch = false;
    state.cloudOnly = false;
    state.chatStarted = true; state.activeSource = 'local'; state.cloudReady = false;
    renderAll();
    // 本地模型完整落盘后，再探测云端，启用混合模型。
    refreshCloud();
  } catch (e) {
    if (seq !== state.downloadSeq) return;
    state.downloading = false;
    state.modelReady = false;
    state.modelPickerOpen = false;
    // 加载失败后必须丢弃损坏的 assistant 实例，否则重试会一直 LOCAL_BROKEN。
    try { state.assistant?.reset?.(); await state.assistant?.unload?.(); } catch {}
    state.assistant = null;
    const err = String(e?.message || e);
    // 用户主动取消下载时不要再弹一个错误；云端路径已经接住了。
    state.gateError = err === 'ABORTED' ? null : err;
    renderAll();
  }
}

async function unloadLocal() {
  if (state.downloading) return;
  if (state.busy) stopGeneration();
  const a = state.assistant;
  state.assistant = null;
  try { await a?.unload?.(); } catch {}
  state.modelReady = false;
  state.localUnloaded = true;
  safeSet(LS.localUnloaded, '1');
  state.preferredSource = 'cloud';
  safeSet(LS.source, 'cloud');
  state.activeSource = 'cloud';
  state.forceSearch = false;
  state.modelPickerOpen = false;
  flashSourceNotice('本地 AI 已卸载 · 显存已释放');
  renderAll();
  // 卸载后优先继续云端；云端还没探活就补一次，不让窗口变成“没有来源”。
  if (!state.cloudReady && state.gate?.ok) {
    await probeCloud();
    renderAll();
  }
}

async function loadLocal() {
  if (!state.gate?.ok || state.downloading) return;
  state.localUnloaded = false;
  safeSet(LS.localUnloaded, '0');
  await startDownload();
}

function cancelDownload() {
  state.downloadSeq += 1;
  state.downloading = false;
  state.downloadStatus = '已取消下载，继续用云端…';
  state.gateError = null;
  const a = state.assistant;
  try { a?.cancelLoad?.(); a?.reset?.(); } catch {}
  if (state.assistant === a) state.assistant = null;
  renderAll();
}

async function ensureAssistant() {
  const picked = modelMeta();
  // 门禁通过后缓存仍可能被系统清理；加载前先校验，避免把 2GB 权重误当成还在本地。
  if (state.modelReady && !state.assistant?.state?.loaded) {
    const cached = await inspectModelCache(picked.id);
    if (cached === 'missing' || cached === 'partial') {
      invalidateLocalCache('LOCAL_CACHE_MISSING');
      throw new Error('LOCAL_CACHE_MISSING');
    }
  }
  if (state.assistant && state.assistant.modelId !== picked.id) {
    try { await state.assistant.unload?.(); } catch {}
    state.assistant = null;
  }
  if (!state.assistant) state.assistant = createAssistant({ modelId: picked.id });
  if (state.assistant.state.loaded) return state.assistant;
  state.downloadStatus = `正在从本机缓存加载 ${picked.label} 模型…`;
  try {
    await state.assistant.load(p => {
      state.downloadProgress = Math.max(0, Math.min(1, Number(p?.progress) || 0));
      state.downloadStatus = String(p?.text || `正在加载 ${picked.label} 本地模型…`);
      renderHeader();
    });
  } catch (e) {
    try { state.assistant?.reset?.(); await state.assistant?.unload?.(); } catch {}
    state.assistant = null;
    throw e;
  }
  state.downloadedModels[state.modelKey] = true;
  persistModels();
  state.modelReady = true;
  return state.assistant;
}

/* ===================== 站内资料 / 检索 ===================== */
async function ensureCorpus() {
  if (state.index) return;
  if (state.corpusPromise) return state.corpusPromise;
  state.corpusPromise = (async () => {
    state.loadingCorpus = true;
    renderHeader();
    try {
      const url = new URL('./corpus.json', import.meta.url);
      const res = await fetch(url, { cache: 'force-cache' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const corpus = await res.json();
      await new Promise(r => setTimeout(r, 20));
      const docs = corpus.docs || [];
      const study = {};
      for (const s of corpus.subjects || []) study[s.key] = { title: s.name, intro: s.intro, courses: [] };
      const byId = Object.create(null);
      for (const c of corpus.courses || []) {
        const bodyDocs = docs.filter(d => d.courseId === c.courseId && d.subject === c.subject).sort((a, b) => a.sectionIndex - b.sectionIndex);
        byId[c.courseId] = {
          id: c.id, title: c.courseTitle, summary: c.summary, points: c.points || [],
          body: bodyDocs.map(d => ({ h: d.sectionTitle, p: d.text, code: d.code, tip: d.tip })),
        };
        (study[c.subject] = study[c.subject] || { title: c.subject, courses: [] }).courses.push(byId[c.courseId]);
      }
      state.corpus = corpus;
      state.studyMap = study;
      state.catalog = buildCatalog(study);
      state.stats = siteStats(study);
      state.docById = Object.fromEntries(docs.map(d => [d.id, d]));
      // 轻量检索字段：3,072 节全量文本只做一次 lower/去空白，不建 14 万词倒排表；
      // 这能让 Javis 第一次打开时在 1 秒级可用，而不是先卡 10 秒建索引。
      for (const d of docs) {
        d._titleN = normalizeText(d.sectionTitle || '');
        d._courseN = normalizeText(d.courseTitle || '');
        d._textN = normalizeText(d.text || '');
      }
      state.index = true;
      state.loadingCorpus = false;
      renderHeader();
    } catch (e) {
      state.loadingCorpus = false;
      state.corpusPromise = null;
      throw e;
    }
  })();
  return state.corpusPromise;
}

function courseRoute(course) {
  if (!course) return null;
  const list = (state.corpus?.courses || []).filter(c => c.subject === course.subject);
  const courseIndex = list.findIndex(c => c.id === course.id || c.courseId === course.courseId);
  return { type: 'course', subject: course.subject, courseIndex: Math.max(0, courseIndex), title: course.courseTitle || course.title || '' };
}

function sectionRoute(doc) {
  const course = (state.corpus?.courses || []).find(c => c.courseId === doc.courseId && c.subject === doc.subject);
  const r = courseRoute(course);
  if (!r) return null;
  return { ...r, type: 'section', sectionIndex: doc.sectionIndex || 0, title: doc.sectionTitle || '' };
}

function normalizeText(s = '') {
  return String(s).toLowerCase().replace(/\s+/g, '');
}

function queryKey(query) {
  let s = String(query || '')
    .replace(/是什么|讲什么|有什么区别|区别是什么|的区别|区别|有哪些|怎么学|怎么|为什么|如何|介绍一下|介绍|一下|本节|这门课|课程|内容|重点|概览/g, ' ')
    .replace(/[？?！!。，,：:；;]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!s) s = String(query || '').trim();
  return s;
}

function compareParts(query) {
  if (!/区别|对比|vs|VS|和|与/.test(String(query || ''))) return [];
  return queryKey(query).split(/和|与|、|vs|VS/).map(normalizeText).filter(x => x.length >= 2).slice(0, 2);
}

function searchJavis(query, limit = 10) {
  const key = queryKey(query);
  const nkey = normalizeText(key);
  const parts = key.split(/和|与|、/).map(x => normalizeText(x)).filter(x => x.length >= 2);
  const latin = (String(query).match(/[A-Za-z0-9_]+/g) || []).map(x => x.toLowerCase());
  const scored = [];
  for (const d of (state.corpus?.docs || [])) {
    let score = 0;
    if (nkey.length >= 2) {
      if (d._titleN === nkey) score += 42;
      else if (d._titleN.startsWith(nkey)) score += 32;
      else if (d._titleN.includes(nkey)) score += 20;
      if (d._courseN.includes(nkey)) score += 9;
      if (d._textN.includes(nkey)) score += 7;
    }
    for (const p of parts) {
      if (d._titleN.includes(p)) score += 9;
      if (d._courseN.includes(p)) score += 3;
      if (d._textN.includes(p)) score += 2;
    }
    for (const w of latin) {
      if (d._titleN.includes(w)) score += 6;
      if (d._textN.includes(w)) score += 2;
    }
    if (score > 0) {
      // “是什么”型问题优先定义型小节，压过“为什么/如何/破坏/实战”这些延伸小节。
      if (nkey && d._titleN.startsWith(nkey) && /为什么|如何|怎么|破坏|实战|误区|陷阱|清单|实验/.test(d._titleN)) score -= 7;
      const lead = normalizeText(d.text || '').slice(0, 120);
      if (nkey.length >= 2 && (lead.includes(nkey + '是') || lead.includes(nkey + '」是') || lead.includes(nkey + '）是'))) score += 8;
      scored.push({ id: d.id, score, doc: d });
    }
  }
  const hits = scored.sort((a, b) => b.score - a.score);
  const cmp = compareParts(query);
  if (cmp.length >= 2) {
    // 对比题：先各取一条命中该词的小节，避免两个概念里的一个被另一条淹没。
    const picked = [];
    for (const p of cmp) {
      const found = hits.find(h => h.doc._titleN.includes(p)) || hits.find(h => h.doc._textN.includes(p));
      if (found && !picked.includes(found)) picked.push(found);
    }
    const rest = hits.filter(h => !picked.includes(h));
    return [...picked, ...rest].slice(0, limit).map(({ id, score }) => ({ id, score }));
  }
  return hits.slice(0, limit).map(({ id, score }) => ({ id, score }));
}

function passageBrief(passage, term) {
  if (!passage) return '';
  const body = passage.split('\n').slice(1).join(' ').replace(/\[P\d+\]/g, '').trim();
  const sentences = body.split(/[。！？]/).map(s => s.trim()).filter(Boolean);
  const def = sentences.find(s => /^(精确定义|大白话定义)/.test(s));
  if (def) return def.slice(0, 300);
  const match = sentences.find(s => term && normalizeText(s).includes(normalizeText(term)));
  return [match, ...sentences.filter(s => s !== match)].filter(Boolean).slice(0, 2).join('。').slice(0, 300);
}

function canonicalComparison(cmp) {
  const has = t => cmp.some(x => x.includes(t));
  if (has('重载') && has('重写')) {
    return `重载（Overload）和重写（Override）解决的是两件不同的事。\n\n重载发生在同一个类里：方法名相同、参数列表不同，编译器在编译期按参数的个数和类型决定调用哪个方法。重写发生在父子类之间：方法名和参数列表都相同，子类覆盖父类的实现，运行时按实际对象类型分派到子类的方法。\n\n重载不是多态的一种；重写是运行时多态成立的条件之一。`;
  }
  if (has('多态') && has('重载')) {
    return `多态和重载不是一回事。\n\n多态是父类或接口引用在运行期按实际对象类型调用被重写的方法，关键是“运行时看实际对象”。重载是同一个类里同名方法因参数列表不同而在编译期选择，关键是“编译期看参数”。\n\n重载不是多态的一种；把重载说成多态是常见混淆。`;
  }
  if (has('多态') && has('重写')) {
    return `重写是多态成立的条件之一，但两者不能画等号。\n\n重写是子类提供与父类同签名的方法实现，发生在运行期按实际对象类型分派；多态是父类或接口引用在运行期调用到实际对象的重写方法，是一种调用效果。\n\n先有重写，才谈得上运行时多态。`;
  }
  return '';
}

function canonicalConcept(question) {
  const n = normalizeText(question);
  const hasPoly = n.includes('多态');
  const hasOver = n.includes('重载');
  const hasRide = n.includes('重写') || n.includes('覆盖');
  if (hasPoly && !hasOver && !hasRide) {
    return `多态：父类或接口引用在运行期按实际对象类型调用被重写的方法。成立的三个条件：有继承或实现关系；子类重写了父类的方法；通过父类或接口引用调用。重写提供运行期分派；重载是编译期按参数列表选择方法，重载不是多态的一种。`;
  }
  if (hasOver && !hasPoly && !hasRide) {
    return `重载：同一个类里方法名相同、参数列表不同，编译器在编译期按参数的个数和类型选择调用哪个方法。重载与返回值无关，也不是多态的一种；重写才是父子类之间同签名覆盖，并在运行期按实际对象类型分派。`;
  }
  if (hasRide && !hasPoly && !hasOver) {
    return `重写：子类提供与父类同签名的方法实现，方法名和参数列表都相同；调用时在运行期按实际对象类型分派到子类实现。重写是运行时多态成立的条件之一，但重写本身不等于多态；重载是编译期按参数列表选择，二者不同。`;
  }
  return '';
}

function comparisonDraft(base, question, passages) {
  const cmp = compareParts(question);
  if (cmp.length < 2) return base;
  const canonical = canonicalComparison(cmp);
  if (canonical) return canonical;
  if (!passages.length) return base;
  const forTerm = (term) => passages.find(p => {
    const title = p.split('\n')[1] || '';
    return normalizeText(title).includes(term);
  });
  const a = passageBrief(forTerm(cmp[0]) || passages[0], cmp[0]);
  const b = passageBrief(forTerm(cmp[1]) || passages[1], cmp[1]);
  if (!a || !b) return base;
  const has = t => cmp.some(x => x.includes(t));
  let timing = '';
  if (has('多态') && has('重载')) {
    timing = `\n差异：重载在编译期按实参类型和个数选择方法；多态在运行期按实际对象类型分派。重载不是多态的一种。`;
  } else if (has('重载') && has('重写')) {
    timing = `\n差异：重载在编译期按参数列表选择方法；重写在运行期按实际对象类型分派；重载不是重写，重写也不是重载。`;
  } else if (has('多态') && has('重写')) {
    timing = `\n差异：重写是子类覆盖父类同签名方法，多态是父类/接口引用在运行期按实际对象类型调用被重写的方法；重写是多态成立的条件之一。`;
  }
  return `对比题：${cmp[0]} vs ${cmp[1]}\n${cmp[0]}：${a}\n${cmp[1]}：${b}${timing}\n\n回答要求：先分别定义 ${cmp[0]} 和 ${cmp[1]}，再说明各自发生的时机和规则差异；不要编造，不要引用草稿外的编号。`;
}

function makeContext(question) {
  const hits = searchJavis(question, 10);
  const intent = routeIntent(question, { hasHits: hits.length > 0 });
  const plan = contextPlan(intent);
  const resolve = {
    S1: { type: 'hub', title: '本站课程地图' },
  };
  const parts = [];
  parts.push(siteCard(state.studyMap));
  if (plan.compact) parts.push(compactCatalog(state.catalog, state.stats));
  if (plan.site && !plan.compact) parts.push(`本站共 ${state.stats.totalCourses} 门课、${state.stats.totalSections} 节、${state.stats.totalPoints} 个知识点。`);
  let catalogDoc = null;
  if (hits.length && (intent === 'course_overview' || intent === 'specific' || intent === 'exercise')) {
    const first = state.corpus.docs.find(d => d.id === hits[0].id);
    catalogDoc = state.catalog.find(d => d.courseId === first?.courseId && d.subject === first?.subject);
    if (catalogDoc) {
      resolve.C1 = { ...courseRoute(first), title: catalogDoc.title, type: 'course' };
      parts.push(courseCard(catalogDoc, first?.sectionIndex ?? -1));
    }
  }
  const passages = [];
  if (plan.passages && hits.length) {
    const perCourse = Object.create(null);
    for (const hit of hits) {
      const d = state.corpus.docs.find(x => x.id === hit.id);
      if (!d) continue;
      const key = d.courseId;
      perCourse[key] = (perCourse[key] || 0) + 1;
      if (perCourse[key] > 2 || passages.length >= (intent === 'site_overview' ? 0 : plan.passages)) continue;
      const n = passages.length + 1;
      const text = `[P${n}] 课程：${d.courseTitle || ''} 小节：${d.sectionTitle || ''}\n${(d.text || '').slice(0, 1500)}`;
      passages.push(text);
      const route = sectionRoute(d);
      if (route) resolve['P' + n] = { ...route, title: `${d.courseTitle || ''} · ${d.sectionTitle || ''}` };
    }
    parts.push(...passages);
  }
  let draft = comparisonDraft(composeDraft(question, intent, { hits, catalogDoc, passages, resolve }), question, passages);
  const cmp = compareParts(question);
  const concept = cmp.length >= 2 ? '' : canonicalConcept(question);
  if (concept) draft = concept;
  return { intent, hits, catalogDoc, passages, resolve, compare: cmp.length >= 2, concept: !!concept, context: parts.join('\n\n'), draft, question };
}

function composeDraft(question, intent, { hits, catalogDoc, passages, resolve }) {
  const stats = state.stats;
  if (intent === 'site_overview') {
    const map = stats.subjects.map(s => `· ${s.name}：${s.courses} 课 / ${s.sections} 节`).join('\n');
    return `本站现在有 ${stats.totalCourses} 门课、${stats.totalSections} 节、${stats.totalPoints} 个知识点，覆盖六科：\n${map}\n\n建议顺序：先学 Java 基础 → 再做改错练习 → 按方向深入算法、AI、大模型或硬件。[S1]`;
  }
  if (intent === 'not_found' || !hits.length) {
    return `本站课程里没有找到足够依据。可以换成更具体的课名、小节名或 Java 术语再问，比如“双亲委派”“第 8 课讲什么”。[S1]`;
  }
  if (intent === 'course_overview' && catalogDoc) {
    const titles = (catalogDoc.sectionTitles || []).slice(0, 8).map((t, i) => `${i + 1}. ${t}`).join('\n');
    return `《${catalogDoc.title}》共 ${catalogDoc.sectionCount} 节。定位：${catalogDoc.summary || '本站系统课程中的一课。'}\n重点：${(catalogDoc.points || []).slice(0, 6).join('、')}。\n主要小节：\n${titles}\n建议按小节顺序学，先理解概念，再看代码。[C1]`;
  }
  if (intent === 'exercise') {
    const heads = passages.slice(0, 4).map((p, i) => `${i + 1}. ${p.split('\n')[1] || ''}`).join('\n');
    return `本节相关的练习/小节如下：\n${heads}\n只列本站资料中已有的内容，不新编题。[P1]`;
  }
  const first = passages[0] || '';
  const body = first.split('\n').slice(1).join('\n').replace(/\[P\d+\]/g, '').trim();
  const sentences = body.split(/[。！？]/).map(s => s.trim()).filter(Boolean).slice(0, 3);
  const c1 = resolve.C1 ? ' [C1]' : '';
  return `结论：${sentences[0] || '先看本节的定义和适用场景。'}\n\n依据：${sentences.slice(1).join('。') || body.slice(0, 160)}。\n\n这部分内容在本站对应课程里有完整正文，点下面的 [P1] 可以直接跳到原小节。${c1}`;
}

function formatText(text, resolve) {
  let safe = esc(text);
  safe = safe.replace(/```([\s\S]*?)```/g, (_, code) => `<pre class="jv-code">${code.replace(/\n/g, '<br>')}</pre>`);
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/\[([PCS])(\d+)\]/g, (whole, k, n) => {
    const key = k + n;
    const t = resolve?.[key];
    if (!t) return `<span class="jv-cite-missing">[${key}]</span>`;
    return `<button class="jv-cite" type="button" data-k="${key}">[${key}]</button>`;
  });
  return safe.replace(/\n/g, '<br>');
}

function renderChat() {
  if (!chatBox) return;
  if (!state.chatStarted) { msgBox.innerHTML = ''; return; }
  const banner = renderChatBanner();
  const welcome = state.messages.length ? '' : `<div class="jv-welcome">
    <div class="jv-welcome-kicker">JAVIS / READY</div>
    <div class="jv-welcome-title">晚上好，我是 Javis。</div>
    <div class="jv-welcome-copy">我先判断你问的是站内课程还是通用问题：全站地图、第几课、练习会直接查本站目录；Java 概念、代码、对比和学习建议再用云端或本地模型回答。对话会记住上文，追问“它/这个/那”也能接上。</div>
    <div class="jv-welcome-tags"><span>站内目录</span><span>对话记忆</span><span>云端 / 本地</span></div>
  </div>`;
  const html = state.messages.map(m => {
    const resolve = state.resolveByMsg[m.id] || {};
    const content = m.role === 'user' ? esc(m.text).replace(/\n/g, '<br>') : formatText(m.text || '', resolve);
    const meta = m.role === 'ai' && m.meta ? `<div class="jv-msg-meta">${esc(m.meta)}</div>` : '';
    const source = m.role === 'ai' && m.sources?.length ? `<div class="jv-msg-meta">参考：${m.sources.map(s => `<button class="jv-inline-link" type="button" data-jv-action="jump" data-msg="${m.id}" data-k="${s}">${esc(s)}</button>`).join(' · ')}</div>` : '';
    const typing = m.role === 'ai' && m.streaming && !m.text ? `<span class="jv-typing"><i></i><i></i><i></i></span>` : '';
    const cursor = m.role === 'ai' && m.streaming && m.text ? '<span class="jv-stream-cursor"></span>' : '';
    const kit = m.role === 'ai' && m.kit ? '<button class="jv-kit-inline" type="button" data-jv-action="kit">所有路都试过了？推开最后一扇门 <span aria-hidden="true">✦</span></button>' : '';
    return `<div class="jv-msg ${m.role === 'user' ? 'user' : 'ai'}">${m.role === 'ai' && m.meta === '正在检索…' ? '' : ''}<div class="jv-bubble">${content}${typing}${cursor}</div>${meta}${source}${kit}</div>`;
  }).join('');
  msgBox.innerHTML = banner + welcome + html;
  const body = $('#jv-body'); if (body) body.scrollTop = body.scrollHeight;
}

function renderChatBanner() {
  if (state.cloudOnly) return '';
  const picked = modelMeta();
  if (state.downloading) return `<div class="jv-gate-card" style="margin:4px 0 2px"><div class="jv-gate-title"><span class="jv-dot ok"></span>正在下载本地模型 · ${esc(picked.label)} · ${Math.round(state.downloadProgress * 100)}%</div><div class="jv-bar"><i style="width:${Math.max(2, Math.round(state.downloadProgress * 100))}%"></i></div><div class="jv-small">${esc(state.downloadStatus || '正在获取模型权重…')}</div></div>`;
  if (state.downloadAttempted && state.gateError) return `<div class="jv-gate-card" style="margin:4px 0 2px"><div class="jv-gate-title"><span class="jv-dot bad"></span>本地模型没有加载成功</div><div class="jv-small">${esc(friendlyDownloadError(state.gateError))} 云端仍可直接用；也可以重试下载。</div><div class="jv-actions"><button class="jv-btn primary" data-jv-action="download" type="button">重新下载 ${esc(picked.label)}</button><button class="jv-btn ghost" data-jv-action="cloud" type="button">使用云端 Javis</button><button class="jv-btn ghost" data-jv-action="search" type="button">打开检索窗口</button><button class="jv-btn ghost jv-kit-banner-btn" data-jv-action="kit" type="button">打开锦囊</button></div></div>`;
  if (!state.gate?.ok || state.modelReady) return '';
  if (state.forceSearch) return `<div class="jv-gate-card" style="margin:4px 0 2px"><div class="jv-gate-title"><span class="jv-dot ok"></span>已打开站内检索</div><div class="jv-small">本机性能达标；可以直接用云端 Javis，也可以下载本地模型。</div><div class="jv-actions"><button class="jv-btn primary" data-jv-action="cloud" type="button">使用云端 Javis</button><button class="jv-btn ghost" data-jv-action="download" type="button">下载 ${esc(picked.label)}</button></div></div>`;
  return `<div class="jv-gate-card" style="margin:4px 0 2px"><div class="jv-gate-title"><span class="jv-dot ok"></span>本机性能达标</div><div class="jv-small">可以直接用云端 Javis，不需要先下载；想要本地回答，再下载 0.5B / 1.5B / 3B 中的一个。</div><div class="jv-actions"><button class="jv-btn primary" data-jv-action="cloud" type="button">使用云端 Javis</button><button class="jv-btn ghost" data-jv-action="download" type="button">下载 ${esc(picked.label)}</button><button class="jv-btn ghost" data-jv-action="search" type="button">打开检索窗口</button></div></div>`;
}

function renderQuick() {
  const box = $('#jv-quick'); if (!box) return;
  const items = state.intent === 'site_overview'
    ? ['这个网站有什么', '怎么学 Java 基础', 'Java 第 8 课讲什么', '多态和重载的区别']
    : ['这个网站有什么', 'Java 第 8 课讲什么', '多态和重载的区别', '双亲委派是什么'];
  box.innerHTML = items.map(q => `<button class="jv-chip" type="button" data-jv-action="ask" data-q="${esc(q)}">${esc(q)}</button>`).join('');
}

/* ===================== 对话 ===================== */
function identityReply(q) {
  const n = String(q || '').toLowerCase().replace(/\s+/g, '');
  const asksModel = /(你|javis).*(什么|哪个|啥).*模型/.test(n)
    || /(你|javis).*用的.*模型/.test(n)
    || /^(什么|哪个|啥)模型/.test(n)
    || /模型.*(是什么|是啥)/.test(n) && /(你|javis)/.test(n);
  if (asksModel) {
    return { text: state.cloudOnly ? '云端 Javis。' : '混合模型。', meta: state.modelReady ? `混合模型 · ${state.activeSource === 'cloud' ? '云端' : '本地'}` : (state.cloudOnly && state.cloudReady ? '云端 Javis · 本机未跑本地模型' : '混合模型 · 待下载本地') };
  }
  const asksWho = /^(你是谁|你叫什么|你是什么|介绍一下你自己)/.test(n)
    || /^javis.*(谁|什么|介绍)/.test(n)
    || /(谁是|介绍一下)javis/.test(n);
  if (asksWho) return { text: '我是 Javis，这个网站的本站助教。', meta: 'Javis · 本站助教' };
  return null;
}

function historyForModel(maxMessages = 6, maxChars = 1800) {
  return trimHistory(state.history, { maxMessages, maxChars, maxCharsPerMessage: 800 });
}

// Catalog questions are answered locally and deterministically, so the answer
// also works when the cloud is down and before a local model is downloaded.
// A few core Java confusions are answered deterministically. These are the
// questions where a small cloud model most often mixes up overload/override/polymorphism.
// Course-specific and code-request questions are deliberately excluded.
function conceptReply(question) {
  const n = normalizeText(question);
  if (/第[0-9一二两三四五六七八九十百千零]+课|这课|那课|这门|那门|本课|本节/.test(n)) return null;
  if (/代码|例子|示例|demo|实现|怎么写|报错|调试/i.test(n)) return null;
  const cmp = compareParts(question);
  if (cmp.length >= 2) {
    const text = canonicalComparison(cmp);
    if (text) return { text, meta: '本站概念 · 速答' };
  }
  const text = canonicalConcept(question);
  return text ? { text, meta: '本站概念 · 速答' } : null;
}

async function siteReply(question) {
  if (!state.catalog) {
    try { await ensureCorpus(); } catch { return null; }
  }
  if (!state.catalog) return null;
  const analysis = analyzeQuestion({
    question,
    catalog: state.catalog,
    focus: state.siteFocus,
    pending: state.sitePending,
  });
  if (!analysis.site) {
    state.siteFocus = null;
    state.sitePending = null;
    return null;
  }
  const result = answerSiteQuestion(analysis, {
    catalog: state.catalog,
    stats: state.stats,
    corpus: state.corpus,
  });
  if (!result) return null;
  state.siteFocus = result.focus || null;
  state.sitePending = result.pending || null;
  return result;
}

async function answerCloud(q, ai, seq, history = []) {
  // 云端只回答通用问题；站内课程问题在 siteReply() 里直接查目录。
  ai.sources = [];
  ai.meta = '云端 · 正在连接（通常 10–30 秒）…';
  renderChat();
  const ac = new AbortController();
  state.answerAbort = ac;
  try {
    const slowTimer = setTimeout(() => {
      if (seq === state.answerSeq && !state.stopRequested) { ai.meta = '云端 · 仍在生成，请再等一下…'; renderChat(); }
    }, 8000);
    let cloud;
    try {
      cloud = await askCloud({ question: q, history, direct: true, base: CLOUD_BASE, timeout: 45000, signal: ac.signal });
    } finally { clearTimeout(slowTimer); }
    if (seq !== state.answerSeq || state.stopRequested) return false;
    if (seq !== state.answerSeq || state.stopRequested) return false;
    const clean = compactAnswer((cloud.answer || '').replace(/\[[PCS]\d+\]/g, '').trim(), q);
    if (cloud.ok && clean.length > 0) {
      ai.text = clean;
      ai.streaming = false;
      ai.meta = '云端 · 纯回答';
      state.localFault = false;
      state.history.push({ role: 'user', content: q }, { role: 'assistant', content: ai.text.slice(0, 1000) });
      return true;
    }
    if (cloud.error === 'ABORTED') return false;
    // 用户明确选了云端时，不静默切到本地；保留云端选择并给出可见错误。
    state.cloudReady = false;
    state.cloudError = cloud.error || 'CLOUD_UNAVAILABLE';
    renderHeader();
    return false;
  } finally {
    if (state.answerAbort === ac) state.answerAbort = null;
  }
}

async function answerLocal(q, ai, seq, history = []) {
  // 本地模型回答通用问题；站内课程问题已在 siteReply() 处理。
  ai.sources = [];
  ai.meta = `本地 ${modelLabel()} · 纯回答中…`;
  renderChat();
  let localText = '';
  let localError = '';
  try {
    const a = await ensureAssistant();
    if (seq !== state.answerSeq || state.stopRequested) return false;
    const parts = [];
    let lastPaint = 0;
    await a.ask(buildLocalMessages(q, history), {
      timeout: 90000,
      onToken: tok => {
        if (seq !== state.answerSeq || state.stopRequested) return;
        parts.push(tok);
        ai.text = parts.join('');
        if (Date.now() - lastPaint > 120) { lastPaint = Date.now(); renderChat(); }
      },
    });
    localText = parts.join('').trim();
  } catch (e) {
    localText = '';
    localError = String(e?.message || e);
  }
  if (seq !== state.answerSeq || state.stopRequested) return false;
  const clean = compactAnswer(String(localText).replace(/\[[PCS]\d+\]/g, '').trim(), q);
  if (clean.length > 0) {
    ai.text = clean;
    ai.meta = `本地 ${modelLabel()} · 纯回答`;
  } else {
    ai.text = localError
      ? `本地 ${modelLabel()} 这次没能回答：${friendlyDownloadError(localError)} 可以重新下载模型，或在底部切到云端。`
      : '本地模型这次没有生成可用的回答，可以再问一次，或在底部切换到云端。';
    ai.meta = localError ? `本地 ${modelLabel()} · 加载失败` : `本地 ${modelLabel()} · 未生成`;
    ai.kit = true;
  }
  ai.streaming = false;
  state.activeSource = 'local'; state.localFault = false;
  state.history.push({ role: 'user', content: q }, { role: 'assistant', content: ai.text.slice(0, 1000) });
}

function stopGeneration() {
  if (!state.busy) return;
  state.stopRequested = true;
  state.answerSeq += 1; // 让还在路上的异步回答失效，避免停止后又被写回。
  try { state.answerAbort?.abort(new Error('USER_STOP')); } catch {}
  try { state.assistant?.stop?.(); } catch {}
  const pending = state.messages.filter(m => m.role === 'ai' && m.streaming).pop();
  if (pending) {
    pending.streaming = false;
    if (!pending.text) pending.text = '已停止生成。';
    pending.meta = '已停止';
  }
  state.busy = false;
  state.answerAbort = null;
  if (sendBtn) { sendBtn.classList.remove('stop'); sendBtn.textContent = '↑'; sendBtn.title = '发送'; }
  renderAll();
}

async function submit(prefill) {
  if (state.busy) { stopGeneration(); return; }
  const q = (typeof prefill === 'string' ? prefill : input.value).trim();
  if (!q) return;
  if (!state.chatStarted) state.chatStarted = true;
  input.value = ''; input.style.height = 'auto';
  const user = { id: state.nextId++, role: 'user', text: q };
  state.messages.push(user);
  const ai = { id: state.nextId++, role: 'ai', text: '', streaming: true, meta: '正在回答…', sources: [] };
  state.messages.push(ai);
  state.stopRequested = false;
  const seq = ++state.answerSeq;
  state.busy = true; sendBtn.classList.add('stop'); sendBtn.textContent = '■'; sendBtn.title = '停止生成';
  renderAll();
  try {
    const identity = identityReply(q);
    if (identity) {
      ai.streaming = false; ai.text = identity.text; ai.meta = identity.meta;
      state.history.push({ role: 'user', content: q }, { role: 'assistant', content: identity.text });
      renderChat();
      return;
    }
    // 常见概念混淆先用站内速答，不把定义交给小模型去猜；课程题和代码题
    // 仍然走站内目录或模型。
    const concept = conceptReply(q);
    if (concept) {
      ai.streaming = false;
      ai.text = concept.text;
      ai.meta = concept.meta;
      state.history.push({ role: 'user', content: q }, { role: 'assistant', content: concept.text.slice(0, 260) });
      renderChat();
      return;
    }
    // 先做一次本地请求理解：站内目录能直接回答的（全站地图、第 N 课、
    // 课程练习、追问）不消耗模型；判断为通用问题才进入云端/本地模型。
    ai.meta = '判断问题 · 查本站目录…';
    renderChat();
    const site = await siteReply(q);
    if (seq !== state.answerSeq || state.stopRequested) return false;
    if (site) {
      ai.text = site.text;
      ai.streaming = false;
      ai.meta = site.meta;
      // Keep a compact note of the site answer in model history: enough to
      // resolve "它/这课/那第 N 课", not enough to crowd out the actual question.
      state.history.push({ role: 'user', content: q }, { role: 'assistant', content: ai.text.slice(0, 260) });
      renderChat();
      return;
    }
    const history = historyForModel();

    let localReady = !!(state.gate?.ok && state.modelReady);
    let cloudReady = !!state.cloudReady;
    let triedCloud = false;
    // 手机/无 WebGPU 设备会停在“先用云端”这一步；用户直接问时也要自动探活，
    // 不能因为探活还没回来就先回一句“云端没连上”。
    if (!localReady && !cloudReady && (state.gate?.ok || state.cloudOnly)) {
      triedCloud = true;
      state.activeSource = 'cloud';
      state.chatStarted = true;
      ai.meta = '云端 · 正在连接…';
      renderChat();
      await probeCloud({ allowCloudOnly: state.cloudOnly });
      localReady = !!(state.gate?.ok && state.modelReady);
      cloudReady = !!state.cloudReady;
      renderAll();
    }
    if (!localReady && !cloudReady) {
      ai.streaming = false;
      ai.meta = '模型未就绪 · 纯回答未开始';
      ai.text = (state.cloudOnly || triedCloud)
        ? '云端 Javis 没有连接成功。可以重试云端，或点输入框旁的“检索”查站内课程。'
        : '本地模型还没下载，云端也暂时没连上。可以点“先用云端 Javis”重试，或打开检索窗口查站内课程。';
      ai.kit = true;
      state.history.push({ role: 'user', content: q }, { role: 'assistant', content: ai.text });
      return;
    }
    let answered = false;
    let cloudAttempted = false;
    if ((state.activeSource === 'cloud' || state.cloudOnly || !localReady) && state.cloudReady) { cloudAttempted = true; answered = await answerCloud(q, ai, seq, history); }
    if (!answered && localReady && !cloudAttempted && seq === state.answerSeq && !state.stopRequested) await answerLocal(q, ai, seq, history);
    if (!answered && cloudAttempted && seq === state.answerSeq && !state.stopRequested) {
      ai.streaming = false;
      ai.meta = '云端 · 这次没有返回';
      ai.text = '云端这次没有返回答案，可能是网络或服务暂时不可用。可以再点一次“云端”重试，或手动切到本地模型；要查站内课程，点输入框旁的“检索”。';
      ai.kit = true;
    }
    if (!answered && state.cloudOnly && seq === state.answerSeq && !state.stopRequested) {
      ai.streaming = false;
      ai.meta = '云端不可用';
      ai.text = '云端 Javis 暂时没有返回答案。可以点“重新检测”重试云端，或打开检索窗口查站内课程。';
      ai.kit = true;
    }
  } catch (e) {
    if (seq === state.answerSeq) {
      ai.streaming = false; ai.meta = '回答失败';
      ai.text = '这次没有生成回答，请再试一次；要查站内资料，请打开检索窗口。';
      ai.kit = true;
    }
  } finally {
    if (seq === state.answerSeq) {
      state.busy = false; sendBtn.classList.remove('stop'); sendBtn.textContent = '↑'; sendBtn.title = '发送';
      state.answerAbort = null;
      renderAll();
    }
  }
}

function openSearch(prefill) {
  const q = (typeof prefill === 'string' ? prefill : (input?.value || '')).trim();
  state.searchOpen = true;
  if (q) { state.searchQuery = q; state.searchResults = null; }
  state.searchError = '';
  if (q && input) { input.value = ''; input.style.height = 'auto'; }
  renderSearch();
  setTimeout(() => {
    try { searchInput.focus(); if (q) runSearch(q); } catch {}
  }, 60);
}

function closeSearch() {
  state.searchOpen = false;
  if (searchView) searchView.hidden = true;
  try { input.focus(); } catch {}
}

async function runSearch(qOverride) {
  if (state.searchBusy) return;
  const q = String(qOverride ?? searchInput?.value ?? '').trim();
  if (!q) { state.searchError = '先输入要检索的课程、小节或术语。'; renderSearch(); return; }
  state.searchQuery = q;
  state.searchError = '';
  state.searchResults = null;
  state.searchBusy = true;
  if (searchInput) searchInput.value = q;
  renderSearch();
  try {
    await ensureCorpus();
    const ctx = makeContext(q);
    const docs = [];
    const seen = new Set();
    for (const hit of ctx.hits) {
      const doc = state.docById?.[hit.id] || state.corpus?.docs?.find(d => d.id === hit.id);
      if (doc && !seen.has(doc.id)) { seen.add(doc.id); docs.push(doc); }
      if (docs.length >= 8) break;
    }
    state.searchResults = { q, docs };
  } catch (e) {
    state.searchError = '站内资料没有加载成功，请确认是通过部署后的网页打开 Javis。';
  } finally {
    state.searchBusy = false;
    renderSearch();
  }
}

function renderSearch() {
  if (!searchView) return;
  searchView.hidden = !state.searchOpen;
  if (!state.searchOpen) return;
  const box = searchResultsBox;
  if (!box) return;
  if (state.searchBusy) {
    box.innerHTML = `<div class="jv-search-state"><span class="jv-search-spinner"></span>正在查站内课程…</div>`;
    return;
  }
  if (state.searchError) {
    box.innerHTML = `<div class="jv-search-state bad">${esc(state.searchError)}</div>`;
    return;
  }
  const r = state.searchResults;
  if (!r) {
    box.innerHTML = `<div class="jv-search-empty"><div class="jv-search-empty-title">只查站内课程</div><div class="jv-search-empty-copy">输入课名、小节名或 Java 术语，结果直接来自本站课程正文，不调用任何模型。</div></div>`;
    return;
  }
  if (!r.docs.length) {
    box.innerHTML = `<div class="jv-search-state">没有找到“${esc(r.q)}”相关的站内内容，换一个更具体的课名或术语试试。</div>`;
    return;
  }
  box.innerHTML = `<div class="jv-search-count">找到 ${r.docs.length} 条站内结果 · 不调用 AI</div>` + r.docs.map(d => {
    const course = d.courseTitle || '';
    const section = d.sectionTitle || '课程内容';
    const snippet = String(d.text || '').replace(/\s+/g, ' ').slice(0, 150);
    return `<button class="jv-search-card" type="button" data-jv-action="searchHit" data-id="${esc(d.id)}">
      <span class="jv-search-card-kicker">${esc(course)}</span>
      <span class="jv-search-card-title">${esc(section)}</span>
      <span class="jv-search-card-snippet">${esc(snippet)}</span>
      <span class="jv-search-card-open">打开课程 →</span>
    </button>`;
  }).join('');
}

function openSearchHit(id) {
  const doc = state.searchResults?.docs?.find(d => String(d.id) === String(id));
  if (!doc) return;
  const target = sectionRoute(doc);
  closeSearch();
  openRoute(target);
}

function openRoute(target) {
  if (!target) return;
  if (target.type === 'hub') { window.openStudyHub?.(); return; }
  const subject = target.subject;
  if (!subject) return;
  window.openStudySubject?.(subject);
  const courseIndex = target.courseIndex ?? 0;
  setTimeout(() => {
    window.startStudyLesson?.(courseIndex);
    if (target.type === 'section') {
      setTimeout(() => {
        const cards = document.querySelectorAll('#sl-body .sec-card');
        const card = cards[target.sectionIndex];
        if (card) card.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }, 80);
    }
  }, 50);
}

function clearChat() {
  // 清空时如果还有回答在流式返回，必须先终止它；否则 busy 会一直挂住，
  // 下一条消息会被当成“停止生成”吃掉，界面看起来像清空后不能提问。
  if (state.busy) stopGeneration();
  state.messages = []; state.history = []; state.resolveByMsg = {}; state.siteFocus = null; state.sitePending = null; renderAll();
}

function openCitation(msgId, key) {
  const target = state.resolveByMsg[Number(msgId)]?.[key];
  openRoute(target);
}

function openModelPicker() {
  if (!state.gate?.ok) return runGate();
  if (state.busy) { flashSourceNotice('请先停止生成，再切换模型'); return; }
  state.modelPickerOpen = true;
  renderAll();
}

function flashSourceNotice(text) {
  state.sourceNotice = text || '';
  renderHeader();
  clearTimeout(flashSourceNotice._timer);
  if (text) flashSourceNotice._timer = setTimeout(() => { state.sourceNotice = ''; renderHeader(); }, 1800);
}

async function selectSource(source) {
  if (!(state.gate?.ok && state.modelReady) || state.busy) return;
  if (source !== 'cloud' && source !== 'local') return;
  if (source === state.activeSource && (source !== 'cloud' || state.cloudReady)) return;
  state.preferredSource = source;
  safeSet(LS.source, source);
  if (source === 'local') {
    state.activeSource = 'local';
    flashSourceNotice('已切到本地模型');
    return;
  }
  let ok = state.cloudReady;
  if (!ok) ok = await probeCloud();
  if (ok) {
    state.activeSource = 'cloud';
    flashSourceNotice('已切到云端模型');
  } else {
    state.preferredSource = 'cloud';
    state.activeSource = 'local';
    flashSourceNotice('云端暂不可用，继续本地');
  }
}

async function selectModel(key) {
  if (!MODELS[key] || state.downloading) return;
  if (state.busy) { flashSourceNotice('请先停止生成，再切换模型'); return; }
  state.modelChoiceExplicit = true;
  state.modelPickerOpen = false;
  state.gateError = null;
  state.downloadAttempted = false;
  state.downloadStatus = '';
  if (state.modelKey === key && state.modelReady) {
    // 同一档已下载时，点卡片仍表示“用这个本地模型”，不能因为 key 没变而
    // 继续留在云端来源。
    state.preferredSource = 'local';
    safeSet(LS.source, 'local');
    state.activeSource = 'local';
    renderAll();
    refreshCloud();
    return;
  }
  // 切到另一档时必须释放旧引擎；只把引用置空会让旧模型继续占着显存，
  // 紧接着下载更大的模型就容易 OOM。
  if (state.assistant && (state.assistant.modelId !== MODELS[key].id || !state.modelReady)) {
    const old = state.assistant;
    state.assistant = null;
    try { await old.unload?.(); } catch {}
  }
  state.modelKey = key;
  if (safeSet) safeSet(LS.modelChoice, key);
  // 手选模型等同于明确选择本地来源；下载/加载完成后的 refreshCloud 不能再改回云端。
  state.preferredSource = 'local';
  safeSet(LS.source, 'local');
  state.modelReady = !!state.downloadedModels[key];
  state.localUnloaded = false;
  safeSet(LS.localUnloaded, '0');
  state.forceSearch = false;
  state.cloudReady = false;
  state.activeSource = 'local';
  if (!state.modelReady) {
    state.assistant = null;
    state.chatStarted = false;
  }
  renderAll();
  if (state.modelReady) refreshCloud();
}

function handleAction(action, el) {
  if (action === 'check') return runGate();
  if (action === 'cloud') return state.gate?.ok ? useCloudNow() : enableCloudOnly();
  if (action === 'model') return selectModel(el.dataset.model);
  if (action === 'picker') return openModelPicker();
  if (action === 'source') return selectSource(el.dataset.source);
  if (action === 'closePicker') { state.modelPickerOpen = false; renderAll(); return; }
  if (action === 'download') return startDownload();
  if (action === 'loadLocal') return loadLocal();
  if (action === 'unload') return unloadLocal();
  if (action === 'cancelDownload') return cancelDownload();
  if (action === 'retrieve') { openSearch(); return; }
  if (action === 'search') { openSearch(); return; }
  if (action === 'searchHit') { openSearchHit(el.dataset.id); return; }
  if (action === 'ask') { state.chatStarted = true; submit(el.dataset.q); return; }
  if (action === 'jump') { openCitation(el.dataset.msg, el.dataset.k); return; }
  if (action === 'kit') { openKit(); return; }
}

/* ===================== 启动 ===================== */
try {
  window.__JAVIS_STAGE = 'before-mount';
  mount();
  window.__JAVIS_STAGE = 'mounted';
  window.__JAVIS_STAGE = 'before-expose';
  window.Javis = {
    open: openPanel, close: closePanel, minimize: minimizeOrb, restore: restoreOrb, state,
    ask: q => { state.chatStarted = true; submit(q); },
    gate: runGate,
    kit: openKit,
  };
  window.__JAVIS_STAGE = 'exposed';
} catch (e) {
  window.__JAVIS_BOOT_ERROR = String(e && (e.stack || e.message || e));
  console.error('[Javis] boot failed', e);
  throw e;
}

// 部署后如果页面在后台打开，先不下载 14MB 资料；等第一次打开窗口或第一次提问时再加载。
if (state.panelOpen) ensureCorpus().catch(() => {});

// orbit-effects v=20261121

/* ===================== 滚动响应的 Javis 球 ===================== */
/* 球体只做视觉层位移，不改尺寸/定位/点击热区；滚动停止后自动回到静止。 */
(() => {
  const orb = document.querySelector('.jv-orb');
  if (!orb) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const input = document.querySelector('#jv-input');
  const syncPlaceholder = () => {
    if (!input) return;
    if (window.innerWidth <= 360) {
      input.placeholder = '问 Javis…';
    } else if (window.innerWidth <= 640) {
      input.placeholder = '问 Javis：课程 / 错题 / API';
    } else {
      input.placeholder = '问 Javis：第 8 课讲什么？双亲委派是什么？';
    }
  };
  let lastY = window.scrollY || window.pageYOffset || 0;
  let lastT = performance.now();
  let raf = 0;
  let idle = 0;

  const setProgress = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = clamp((window.scrollY || window.pageYOffset || 0) / max, 0, 1);
    const radius = window.innerWidth <= 640 ? 22 : 30;
    const angle = progress * Math.PI * 2;
    orb.style.setProperty('--jv-ring-angle', `${(progress * 360).toFixed(2)}deg`);
    orb.style.setProperty('--jv-dot-x', `${(Math.cos(angle) * radius).toFixed(2)}px`);
    orb.style.setProperty('--jv-dot-y', `${(Math.sin(angle) * radius).toFixed(2)}px`);
  };

  const rest = () => {
    orb.classList.remove('is-scrolling');
    orb.style.setProperty('--jv-shift', '0px');
    orb.style.setProperty('--jv-tilt', '0deg');
    orb.style.setProperty('--jv-glow', '0');
    orb.style.setProperty('--jv-spin-duration', '9s');
  };

  const frame = () => {
    raf = 0;
    const now = performance.now();
    const y = window.scrollY || window.pageYOffset || 0;
    const dy = y - lastY;
    const dt = Math.max(8, now - lastT);
    lastY = y;
    lastT = now;

    if (reduceMotion.matches) return;

    orb.classList.add('is-scrolling');
    const speed = clamp(Math.abs(dy) / (dt * 1.6), 0, 1);
    const shift = clamp(-dy * 0.24, -9, 9);
    const tilt = clamp(dy * 0.13, -4, 4);
    orb.style.setProperty('--jv-shift', `${shift.toFixed(2)}px`);
    orb.style.setProperty('--jv-tilt', `${tilt.toFixed(2)}deg`);
    orb.style.setProperty('--jv-glow', `${(speed * 0.10).toFixed(3)}`);
    orb.style.setProperty('--jv-spin-duration', `${(9 - speed * 4.2).toFixed(2)}s`);
    setProgress();

    clearTimeout(idle);
    idle = setTimeout(rest, 360);
  };

  const onScroll = () => {
    if (reduceMotion.matches) return;
    if (!raf) raf = requestAnimationFrame(frame);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  /* Capture nested scrollers too (Javis message list, embedded subject pages). */
  document.addEventListener('scroll', onScroll, { passive: true, capture: true });
  window.addEventListener('resize', () => { setProgress(); syncPlaceholder(); }, { passive: true });
  setProgress();
  syncPlaceholder();
  rest();

  const onMotionChange = () => {
    if (reduceMotion.matches) {
      rest();
      orb.style.setProperty('--jv-ring-angle', '0deg');
      orb.style.removeProperty('--jv-dot-x');
      orb.style.removeProperty('--jv-dot-y');
    } else {
      setProgress();
    }
  };
  if (reduceMotion.addEventListener) reduceMotion.addEventListener('change', onMotionChange);
  else if (reduceMotion.addListener) reduceMotion.addListener(onMotionChange);
})();


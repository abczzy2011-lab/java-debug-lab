// src/query.js — deterministic query understanding for Javis.
// Turns a short Chinese question into a site/course/exercise request when the
// wording clearly refers to this site; otherwise returns `general` so the
// cloud/local model handles it. Pure: no DOM, fetch, or model calls.

const SUBJECT_ALIASES = [
  ['api', ['javaapi', 'javaapi文档', 'api文档', 'javadoc', 'javaapi完整文档']],
  ['jbase', ['java基础', 'javase', 'java入门', 'java课', 'java']],
  ['algo', ['算法与代码逻辑', '代码逻辑', '数据结构', '算法', 'algo']],
  ['hw', ['硬件知识', '电路与数字系统', '数字系统', '硬件', '电路', '数电']],
  ['ai', ['人工智能', '机器学习', '深度学习', 'ai']],
  ['llm', ['大模型', '提示工程', 'llm']],
];

const SUBJECT_LABELS = {
  hw: '硬件知识', algo: '算法与代码逻辑', jbase: 'Java 基础',
  ai: 'AI · 人工智能', llm: '大模型 · LLM 全景', api: 'Java API 完整文档',
};

const STOP_TERMS = new Set([
  '基础', '入门', '实践', '完整', '文档', '系统', '课程', '内容', '重点',
  '介绍', '概览', '目录', '讲什么', '学什么', '多少', '几节', '几门',
  '这个', '那个', '这门', '那门', '哪门', '本节', '这课', '那课', '一下',
  '请问', '帮我', '我想', '看看', '知道', '什么', '如何', '怎么', '为什么',
]);

export function normalizeQuery(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[０-９]/g, ch => String('０１２３４５６７８９'.indexOf(ch)))
    .replace(/[\s，。！？、；：,.!?;:·\-—()（）“”"'']/g, '')
    .trim();
}

function chineseNumber(raw = '') {
  const s = String(raw).replace(/[０-９]/g, ch => String('０１２３４５６７８９'.indexOf(ch)));
  if (/^\d+$/.test(s)) return Number(s);
  const digits = { 零: 0, 〇: 0, 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  const units = { 十: 10, 百: 100, 千: 1000 };
  let total = 0, section = 0, number = 0;
  for (const ch of s) {
    if (ch in digits) number = digits[ch];
    else if (ch in units) {
      const unit = units[ch];
      if (unit === 10) section += (number || 1) * unit;
      else section += (number || 1) * unit;
      number = 0;
    }
  }
  return total + section + number;
}

export function parseCourseNumber(value = '') {
  const n = normalizeQuery(value);
  const m = n.match(/第([0-9０-９一二两三四五六七八九十百千零]+)课/);
  if (!m) return null;
  const num = chineseNumber(m[1]);
  return Number.isFinite(num) && num > 0 ? num : null;
}

export function detectSubject(value = '') {
  const n = normalizeQuery(value);
  if (!n) return null;
  const sorted = SUBJECT_ALIASES
    .flatMap(([key, aliases]) => aliases.map(alias => [key, normalizeQuery(alias)]))
    .sort((a, b) => b[1].length - a[1].length);
  for (const [key, alias] of sorted) {
    if (alias && n.includes(alias)) return key;
  }
  return null;
}

export function subjectLabel(key) {
  return SUBJECT_LABELS[key] || key || '本站课程';
}

function courseNumberFromTitle(title = '') {
  return parseCourseNumber(String(title).replace(/·.*$/, ''));
}

function titleTerms(value = '') {
  const n = normalizeQuery(value)
    .replace(/第[0-9０-９一二两三四五六七八九十百千零]+课/g, '')
    .replace(/这门课|那门课|哪门课|本节|这课|那课|课程|本课|全课/g, '');
  const chunks = n.split(/和|与|、|的|是|有|讲|说|问|请|帮|我|你|它|这|那|个|呢|吗|吧|啊/);
  return [...new Set(chunks.map(x => x.trim()).filter(x => x.length >= 2 && !STOP_TERMS.has(x) && !/^\d+$/.test(x)))].slice(0, 4);
}

function candidatesByTitle(catalog, terms) {
  if (!terms.length) return [];
  const out = [];
  for (const doc of catalog || []) {
    const title = normalizeQuery(doc.title || '');
    if (!title) continue;
    const hit = terms.some(term => title.includes(term));
    if (hit) out.push(doc);
  }
  return out.filter((doc, i, arr) => arr.findIndex(x => x.courseId === doc.courseId) === i);
}

function candidatesByNumber(catalog, number, subject = null) {
  if (!number) return [];
  return (catalog || []).filter(doc => {
    if (subject && doc.subject !== subject) return false;
    return courseNumberFromTitle(doc.title) === number;
  });
}

function isBareSubject(value = '') {
  const n = normalizeQuery(value);
  if (!n) return false;
  const subject = detectSubject(n);
  if (!subject) return false;
  // Bare means the subject alias is the whole question, not merely a substring
  // (so "怎么学 Java" and "Java 第 8 课" do not become course lists).
  return SUBJECT_ALIASES.some(([key, aliases]) => key === subject
    && aliases.some(alias => normalizeQuery(alias) === n));
}

function dedupe(candidates = []) {
  return candidates.filter((doc, i, arr) => arr.findIndex(x => x.courseId === doc.courseId) === i);
}

function isCourseOverviewWording(n) {
  return /讲什么|讲一下|讲啥|内容|重点|概览|目录|介绍|学什么|多少节|几节|多少课|课表|有什么|有哪些/.test(n)
    || /^第[0-9一二两三四五六七八九十百千零]+课$/.test(n)
    || /^(这门课|那门课|哪门课|这课|那课)$/.test(n);
}

/**
 * @param {{question:string, catalog:Array, focus?:object, pending?:object, hasCorpus?:boolean}} input
 * @returns {{site:boolean, kind:string, subject:string|null, number:number|null,
 *   candidates:Array, course?:object, pending?:object, reason:string}}
 */
export function analyzeQuestion({ question = '', catalog = [], focus = null, pending = null } = {}) {
  const raw = String(question || '').trim();
  const n = normalizeQuery(raw);
  const base = { site: false, kind: 'general', subject: null, number: null, candidates: [], reason: '' };
  if (!n || !Array.isArray(catalog) || !catalog.length) return base;

  // A subject-only answer after Javis asked "哪一科？" resolves the pending course.
  if (pending && pending.number && isBareSubject(n)) {
    const subject = detectSubject(n);
    if (subject) {
      const candidates = dedupe((pending.candidates || [])
        .filter(d => d.subject === subject)
        .map(d => catalog.find(c => c.courseId === d.courseId))
        .filter(Boolean));
      if (candidates.length) {
        return { ...base, site: true, kind: 'course_overview', subject, number: pending.number,
          candidates, course: candidates[0], reason: 'pending-subject' };
      }
    }
  }

  const courseRef = /第[0-9０-９一二两三四五六七八九十百千零]+课|这门课|那门课|哪门课|本课|本节|这课|那课/.test(n);
  const number = parseCourseNumber(n);
  const subject = detectSubject(n) || null;

  // "Java 基础有哪些课" / "算法课程列表" (must precede the generic site check,
  // because "有哪些课" is a substring of "哪些课").
  if (subject && /(有哪些课|课程列表|课程目录|几门课|多少课|几节课|课表|所有课|课程有哪些)/.test(n)) {
    return { ...base, site: true, kind: 'subject_courses', subject, reason: 'subject-courses' };
  }
  if (subject && isBareSubject(n)) {
    return { ...base, site: true, kind: 'subject_courses', subject, reason: 'bare-subject' };
  }

  // Site overview / whole-site questions; “不要讲本站课程” is an exclusion,
  // not a request for the site map.
  const negatedSite = /(?:不要|别|不用|不需要|不想|禁止|别再).{0,8}(?:讲|提|说|聊|介绍|涉及).{0,8}(?:本站|网站|全站|课程)/.test(n);
  if (!negatedSite && (
    (/(网站|本站|全站|平台|站点)/.test(n)
      && /(有什么|哪些|内容|介绍|科目|课程|课|地图|目录|多少|几门|几节|能做什么)/.test(n))
    || /(有什么课|哪些课|多少门课|几门课|多少节课|课程目录|课程地图|有哪些科目|哪些科目|六科|所有课程|全站课程)/.test(n)
    || /^这个网站/.test(n))) {
    return { ...base, site: true, kind: 'site_overview', subject, reason: 'site-overview' };
  }

  // Study route questions.
  if (/(怎么学|如何学|学习路线|学习顺序|先学什么|入门路线|怎么入门|如何入门|学习计划)/.test(n)) {
    return { ...base, site: true, kind: 'study_plan', subject, reason: 'study-plan' };
  }

  // Exercise questions need a course or a current site focus.
  if (/(练习|习题|题目|刷题|小测验|测验|作业|几道题)/.test(n)
    && (courseRef || focus || /(本节|这课|那课|这门|那门)/.test(n))) {
    let candidates = [];
    // A bare "第 8 课有哪些练习" should inherit the subject from the course
    // we just discussed; an explicit subject still wins.
    let usedSubject = subject || (focus?.subject || null);
    let usedNumber = number || (focus?.number || courseNumberFromTitle(focus?.title));
    if (usedNumber) candidates = candidatesByNumber(catalog, usedNumber, usedSubject);
    else if (focus?.courseId) candidates = catalog.filter(d => d.courseId === focus.courseId);
    return { ...base, site: true, kind: 'exercise', subject: usedSubject, number: usedNumber,
      candidates: dedupe(candidates), course: candidates.length === 1 ? candidates[0] : null,
      reason: 'exercise' };
  }

  // Course overview: "第 8 课讲什么", "Java 第 8 课", "这门课重点".
  if (courseRef || (focus && /(它|这个|这课|这门|上面|刚才|继续|还有|呢)/.test(n))) {
    const refNumber = number || (focus && !subject ? focus.number : null);
    const refSubject = subject || (focus?.subject || null);
    if (refNumber) {
      const candidates = candidatesByNumber(catalog, refNumber, refSubject);
      const overview = isCourseOverviewWording(n) || /^(它|这个|这课|这门|上面|刚才|继续|还有|呢)+$/.test(n) || !/(是什么|为什么|怎么|区别|原理|举例|代码|报错)/.test(n);
      if (overview) {
        return { ...base, site: true, kind: 'course_overview', subject: refSubject, number: refNumber,
          candidates, course: candidates.length === 1 ? candidates[0] : null, reason: 'course-overview' };
      }
      return base; // e.g. "第8课的多态是什么" stays a general model question.
    }
    if (focus?.courseId) {
      const course = catalog.find(d => d.courseId === focus.courseId) || null;
      return { ...base, site: true, kind: 'course_overview', subject: focus.subject || null,
        number: courseNumberFromTitle(course?.title || focus.title), candidates: course ? [course] : [],
        course, reason: 'focus-course' };
    }
    return { ...base, site: true, kind: 'course_missing', subject: subject, number: null,
      reason: 'course-ref-no-number' };
  }

  // Course title lookup without a number, e.g. "继承那课讲什么".
  if (/(课|课程)/.test(n) && isCourseOverviewWording(n)) {
    const terms = titleTerms(raw);
    const candidates = candidatesByTitle(catalog, terms);
    if (candidates.length) {
      return { ...base, site: true, kind: 'course_overview', subject, number: candidates[0] ? courseNumberFromTitle(candidates[0].title) : null,
        candidates, course: candidates.length === 1 ? candidates[0] : null, reason: 'title-course' };
    }
  }

  return base;
}

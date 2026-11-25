// src/site-answer.js — deterministic answers for questions that clearly refer
// to the site's own catalog. General Java/CS questions return null and go to
// the selected cloud/local model.

import { subjectLabel } from './query.js';

function subjectName(stats, key) {
  const found = (stats?.subjects || []).find(x => x.subject === key);
  return found?.name || subjectLabel(key);
}

function courseNumber(course, fallback = null) {
  const m = String(course?.title || '').match(/第\s*([0-9]+)\s*课/);
  return m ? Number(m[1]) : fallback;
}

function courseLine(course) {
  return `${subjectName(null, course.subject)}：${course.title}`;
}

function short(text = '', max = 220) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  return s.length > max ? s.slice(0, max) + '…' : s;
}

function siteMap(stats) {
  const subjects = (stats?.subjects || []).map(s => `· ${s.name}：${s.courses} 课 / ${s.sections} 节`).join('\n');
  return `本站现在有 ${stats?.totalCourses || 0} 门课、${stats?.totalSections || 0} 节、${stats?.totalPoints || 0} 个知识点，覆盖六科：\n${subjects}`;
}

function overviewText(stats) {
  return `${siteMap(stats)}\n\n建议先从「Java 基础」打底，再做 Java 改错实验室，最后按算法、AI、大模型或硬件方向深入。`;
}

function studyPlanText(stats, subject) {
  const focus = subject ? subjectName(stats, subject) : '';
  return `${siteMap(stats)}\n\n${focus ? `你现在关注的是 ${focus}。` : ''}建议分三步：\n1. 先补语言和基础概念，别急着刷难题。\n2. 每学完一节就做对应练习，用错题定位薄弱点。\n3. 按目标方向选一条主线深入，其他科目保持每周回顾。`;
}

function courseOverviewText(course, stats, number) {
  const subject = subjectName(stats, course.subject);
  const points = (course.points || []).slice(0, 6).join('、') || '这一课的重点概念';
  const titles = (course.sectionTitles || []).slice(0, 8).map((t, i) => `${i + 1}. ${t}`).join('\n');
  const more = Math.max(0, (course.sectionTitles || []).length - 8);
  return `你问的是《${course.title}》（${subject}），共 ${course.sectionCount || (course.sectionTitles || []).length} 节。\n定位：${short(course.summary || '本站系统课程中的一课。', 240)}\n重点：${points}。\n主要小节：\n${titles}${more ? `\n后面还有 ${more} 节。` : ''}\n建议按小节顺序学：先理解概念，再看例子，最后回到练习验证。`;
}

function subjectCoursesText(subject, catalog, stats) {
  const docs = (catalog || []).filter(d => d.subject === subject);
  const name = subjectName(stats, subject);
  if (!docs.length) return `本站没有找到「${name}」的课程。`;
  const shown = docs.slice(0, 12).map(d => `· ${d.title}`).join('\n');
  const more = docs.length - Math.min(12, docs.length);
  return `${name} 共 ${docs.length} 门课：\n${shown}${more ? `\n……还有 ${more} 门课，可在课程目录里继续看。` : ''}`;
}

function exerciseText(course, corpus, stats) {
  const docs = (corpus?.docs || []).filter(d => d.courseId === course.courseId)
    .filter(d => /练习|习题|题目|作业|小测|测验|自测|挑战|代码题/.test(String(d.sectionTitle || '')));
  const heads = docs.slice(0, 8).map((d, i) => `${i + 1}. ${d.sectionTitle}`).join('\n');
  if (!heads) {
    const name = subjectName(stats, course.subject);
    const next = course.subject === 'jbase'
      ? '可以先用站内的课程正文复习，再去 Java 改错实验室做对应练习；那里会按知识点和难度出题。'
      : `可以先用站内的课程正文复习，再到「${name}」的题库/练习入口找对应题目；目前目录里没有单独标注这一课的练习小节。`;
    return `《${course.title}》（${name}）的目录里没有单独标注“练习/习题”的小节。\n${next}`;
  }
  return `《${course.title}》里和练习/自测有关的小节：\n${heads}\n只列站内目录真实存在的条目，不额外编题。`;
}

function ambiguityText(analysis, stats) {
  const candidates = analysis.candidates || [];
  const number = analysis.number;
  const lines = candidates.map(c => `· ${subjectName(stats, c.subject)}：${c.title}`).join('\n');
  const intro = number
    ? `「第 ${number} 课」在 ${candidates.length} 个科目里都有一课，你指哪一科？`
    : `找到 ${candidates.length} 门相近的课程，你指哪一门？`;
  return `${intro}\n${lines}\n回复“Java 第 ${number || 'N'} 课”或“算法第 ${number || 'N'} 课”就可以。`;
}

/**
 * @returns {{text:string, meta:string, focus?:object|null, pending?:object|null}|null}
 * null means this is not a site/catalog question; let the model answer.
 */
export function answerSiteQuestion(analysis, { catalog = [], stats = null, corpus = null } = {}) {
  if (!analysis?.site) return null;

  if (analysis.kind === 'site_overview') {
    return { text: overviewText(stats), meta: '本站课程 · 全站地图', focus: null, pending: null };
  }
  if (analysis.kind === 'study_plan') {
    return { text: studyPlanText(stats, analysis.subject), meta: '本站课程 · 学习路线', focus: null, pending: null };
  }
  if (analysis.kind === 'subject_courses') {
    return { text: subjectCoursesText(analysis.subject, catalog, stats), meta: '本站课程 · 课程列表', focus: null, pending: null };
  }

  const candidates = analysis.candidates || [];
  const number = analysis.number || (candidates[0] ? courseNumber(candidates[0]) : null);

  if (analysis.kind === 'course_missing') {
    return {
      text: `本站目录里暂时没有找到第 ${analysis.number || '？'} 课。可以告诉我科目和课号，比如“Java 第 8 课”或“算法第 8 课”。`,
      meta: '本站课程 · 未找到', focus: null, pending: null,
    };
  }

  if (candidates.length > 1) {
    return {
      text: ambiguityText({ ...analysis, number }, stats),
      meta: '本站课程 · 需要确认',
      focus: null,
      pending: { number, candidates: candidates.map(c => ({ subject: c.subject, courseId: c.courseId, title: c.title })) },
    };
  }

  if (candidates.length === 0) {
    return {
      text: `没有找到对应的课程。请给出科目和课号，比如“Java 第 8 课讲什么”。`,
      meta: '本站课程 · 未找到', focus: null, pending: null,
    };
  }

  const course = candidates[0];
  const focus = { subject: course.subject, courseId: course.courseId, title: course.title, number: courseNumber(course) };

  if (analysis.kind === 'course_overview') {
    return { text: courseOverviewText(course, stats, focus.number), meta: `本站课程 · 第 ${focus.number || '?'} 课`, focus, pending: null };
  }
  if (analysis.kind === 'exercise') {
    return { text: exerciseText(course, corpus, stats), meta: `本站课程 · 第 ${focus.number || '?'} 课练习`, focus, pending: null };
  }
  return null;
}

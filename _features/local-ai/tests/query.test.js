import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeQuestion, detectSubject, parseCourseNumber } from '../src/query.js';

const subj = (key, name) => ({ subject: key, name, courses: 1, sections: 1, points: 1 });
const stats = { subjects: [subj('hw','硬件'), subj('algo','算法'), subj('jbase','Java 基础'), subj('ai','AI'), subj('llm','大模型'), subj('api','Java API')], totalCourses: 8, totalSections: 8, totalPoints: 8 };
const c = (subject, id, title, sectionTitles = ['小节一','小节二']) => ({
  subject, courseId: id, title, summary: title + '的摘要', points: ['重点一','重点二'],
  sectionTitles, sectionCount: sectionTitles.length,
});
const catalog = [
  c('jbase','jb8','第 8 课 · 继承、多态与访问控制'),
  c('jbase','jb9','第 9 课 · 异常处理'),
  c('algo','algo8','第 8 课 · 数据结构基础'),
  c('hw','hw8','第 8 课 · 数字逻辑与布尔代数'),
  c('ai','ai8','第 8 课 · Transformer 与注意力'),
  c('llm','llm8','第 8 课 · 提示工程与思维链 CoT'),
  c('api','api8','第 8 课 · java.lang.constant（12 个类型）'),
];
const focus = { subject: 'jbase', courseId: 'jb8', title: '第 8 课 · 继承、多态与访问控制', number: 8 };

test('course number parser handles Arabic and Chinese forms', () => {
  assert.equal(parseCourseNumber('第8课讲什么'), 8);
  assert.equal(parseCourseNumber('第八课讲什么'), 8);
  assert.equal(parseCourseNumber('第二十课'), 20);
});

test('subject detection prefers longer aliases', () => {
  assert.equal(detectSubject('Java API 第8课'), 'api');
  assert.equal(detectSubject('Java 基础第8课'), 'jbase');
  assert.equal(detectSubject('算法第8课'), 'algo');
});

test('site overview and study route are recognized', () => {
  assert.equal(analyzeQuestion({ question: '这个网站有什么', catalog }).kind, 'site_overview');
  assert.equal(analyzeQuestion({ question: '怎么学 Java', catalog }).kind, 'study_plan');
  assert.equal(analyzeQuestion({ question: 'Java 基础有哪些课', catalog }).kind, 'subject_courses');
});

test('negated site wording stays general', () => {
  const a = analyzeQuestion({ question: '不要讲本站课程，用量子纠缠写一句比喻', catalog });
  assert.equal(a.site, false);
  assert.equal(a.kind, 'general');
});

test('bare course numbers are ambiguous across six subjects', () => {
  const a = analyzeQuestion({ question: '第 8 课讲什么', catalog });
  assert.equal(a.site, true);
  assert.equal(a.kind, 'course_overview');
  assert.equal(a.candidates.length, 6);
  assert.equal(a.course, null);
});

test('subject-qualified course resolves without guessing', () => {
  const a = analyzeQuestion({ question: 'Java 第 8 课讲什么', catalog });
  assert.equal(a.kind, 'course_overview');
  assert.equal(a.candidates.length, 1);
  assert.equal(a.candidates[0].courseId, 'jb8');
});

test('exercise keeps course candidates and respects focus', () => {
  const a = analyzeQuestion({ question: '第 8 课有哪些练习', catalog });
  assert.equal(a.kind, 'exercise');
  assert.equal(a.candidates.length, 6);
  const b = analyzeQuestion({ question: '这课有什么练习', catalog, focus });
  assert.equal(b.kind, 'exercise');
  assert.equal(b.candidates[0].courseId, 'jb8');
  const c = analyzeQuestion({ question: '第 8 课有哪些练习', catalog, focus });
  assert.equal(c.kind, 'exercise');
  assert.equal(c.candidates.length, 1);
  assert.equal(c.candidates[0].courseId, 'jb8');
});

test('pending subject answer resolves the earlier number', () => {
  const a = analyzeQuestion({
    question: 'Java',
    catalog,
    pending: { number: 8, candidates: catalog.filter(x => x.courseId.endsWith('8')) },
  });
  assert.equal(a.kind, 'course_overview');
  assert.equal(a.course.courseId, 'jb8');
  assert.equal(a.reason, 'pending-subject');
});

test('follow-up inherits subject from focus', () => {
  const a = analyzeQuestion({ question: '那第 9 课呢', catalog, focus });
  assert.equal(a.kind, 'course_overview');
  assert.equal(a.course.courseId, 'jb9');
});

test('general Java/CS questions are not hijacked by the site router', () => {
  assert.equal(analyzeQuestion({ question: '多态和重载的区别', catalog }).site, false);
  assert.equal(analyzeQuestion({ question: '第 8 课的多态是什么', catalog }).site, false);
});

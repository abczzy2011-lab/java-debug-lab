import test from 'node:test';
import assert from 'node:assert/strict';
import { answerSiteQuestion } from '../src/site-answer.js';

const stats = { subjects: [
  { subject:'hw', name:'硬件', courses:1, sections:1, points:1 },
  { subject:'algo', name:'算法', courses:1, sections:1, points:1 },
  { subject:'jbase', name:'Java 基础', courses:2, sections:3, points:3 },
  { subject:'ai', name:'AI', courses:1, sections:1, points:1 },
  { subject:'llm', name:'大模型', courses:1, sections:1, points:1 },
  { subject:'api', name:'Java API', courses:1, sections:1, points:1 },
], totalCourses: 7, totalSections: 8, totalPoints: 8 };
const course = (subject, id, title, n=8, sections=['小节一','小节二']) => ({ subject, courseId:id, title, summary:'摘要', points:['重点一','重点二'], sectionTitles:sections, sectionCount:sections.length });
const jb8 = course('jbase','jb8','第 8 课 · 继承、多态与访问控制');
const algo8 = course('algo','algo8','第 8 课 · 数据结构基础');
const catalog = [jb8, algo8, course('jbase','jb9','第 9 课 · 异常处理', 9)];

test('ambiguity asks for a subject and leaves pending context', () => {
  const r = answerSiteQuestion({ site:true, kind:'course_overview', number:8, candidates:[jb8, algo8] }, { catalog, stats });
  assert.match(r.text, /你指哪一科/);
  assert.match(r.text, /Java 基础/);
  assert.equal(r.pending.number, 8);
});

test('course overview uses catalog facts, not model memory', () => {
  const r = answerSiteQuestion({ site:true, kind:'course_overview', number:8, candidates:[jb8] }, { catalog, stats });
  assert.match(r.text, /继承、多态与访问控制/);
  assert.match(r.text, /共 2 节/);
  assert.match(r.text, /重点一/);
  assert.equal(r.focus.courseId, 'jb8');
});

test('site overview reports real counts', () => {
  const r = answerSiteQuestion({ site:true, kind:'site_overview' }, { catalog, stats });
  assert.match(r.text, /7 门课/);
  assert.match(r.text, /8 节/);
  assert.match(r.text, /Java 基础/);
});

test('exercise lists only real exercise-like section titles', () => {
  const corpus = { docs: [{ courseId:'jb8', sectionTitle:'练习：多态判断' }] };
  const r = answerSiteQuestion({ site:true, kind:'exercise', number:8, candidates:[jb8] }, { catalog, stats, corpus });
  assert.match(r.text, /练习：多态判断/);
  assert.match(r.text, /不额外编题/);
});

test('non-Java exercise fallback points to the right subject, not Java lab', () => {
  const r = answerSiteQuestion({ site:true, kind:'exercise', number:8, candidates:[algo8] }, { catalog, stats, corpus:{docs:[]} });
  assert.match(r.text, /算法/);
  assert.doesNotMatch(r.text, /Java 改错实验室/);
});

test('missing course gives a usable recovery path', () => {
  const r = answerSiteQuestion({ site:true, kind:'course_missing', number:99 }, { catalog, stats });
  assert.match(r.text, /没有找到/);
  assert.match(r.text, /Java 第 8 课/);
});

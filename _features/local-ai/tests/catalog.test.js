import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCatalog, siteStats, siteCard, compactCatalog, courseCard } from '../src/catalog.js';

const study = {
  jbase: { title: 'Java 基础', courses: [
    { id: 'jb-c8', title: '第8课 继承与多态', summary: '讲透继承多态', points: ['多态', '覆盖'],
      body: [{ h: '动态绑定' }, { h: 'IS-A' }] },
    { id: 'jb-c9', title: '第9课 异常', summary: '异常处理', points: ['try/catch'], body: [{ h: '异常体系' }] },
  ] },
  algo: { title: '算法', courses: [
    { id: 'al-c1', title: '第1课 复杂度', summary: '复杂度分析', points: ['BigO'], body: [{ h: '大O' }] },
  ] },
};

test('buildCatalog: one CatalogDoc per course with section titles', () => {
  const cat = buildCatalog(study);
  assert.equal(cat.length, 3);
  const c8 = cat.find(x => x.courseId === 'jb-c8');
  assert.equal(c8.subject, 'jbase');
  assert.equal(c8.sectionCount, 2);
  assert.deepEqual(c8.sectionTitles, ['动态绑定', 'IS-A']);
  assert.equal(c8.firstSectionId, 'jb-c8/0');
  assert.equal(c8.lastSectionId, 'jb-c8/1');
});

test('siteStats: exact counts', () => {
  const s = siteStats(study);
  assert.equal(s.totalCourses, 3);
  assert.equal(s.totalSections, 4);
  assert.equal(s.totalPoints, 4);
  assert.equal(s.subjects.length, 2);
});

test('siteCard always contains all subjects + totals', () => {
  const card = siteCard(study);
  assert.match(card, /3 门课/);
  assert.match(card, /Java 基础/);
  assert.match(card, /算法/);
  assert.match(card, /出处编号/);
});

test('compactCatalog uses real course titles, no invention', () => {
  const c = compactCatalog(buildCatalog(study), siteStats(study), 2);
  assert.match(c, /第8课 继承与多态/);
  assert.match(c, /第1课 复杂度/);
  assert.match(c, /3 课 \/ 4 节/);
});

test('courseCard includes before/hit/after section titles', () => {
  const doc = buildCatalog(study).find(x => x.courseId === 'jb-c8');
  const card = courseCard(doc, 0);
  assert.match(card, /命中节：动态绑定/);
  assert.match(card, /后一节：IS-A/);
  assert.match(card, /多态/);
  assert.match(card, /共 2 节/);
});

test('courseCard with no hit omits around text', () => {
  const doc = buildCatalog(study).find(x => x.courseId === 'jb-c9');
  const card = courseCard(doc, -1);
  assert.doesNotMatch(card, /命中节/);
});

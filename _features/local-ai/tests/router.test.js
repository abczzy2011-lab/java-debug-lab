import test from 'node:test';
import assert from 'node:assert/strict';
import { routeIntent, contextPlan } from '../src/router.js';

test('site_overview triggers', () => {
  for (const q of ['网站有什么', '本站怎么学', '学习路线', '一共多少课', '整体目录']) {
    assert.equal(routeIntent(q), 'site_overview', q);
  }
});

test('course_overview triggers', () => {
  for (const q of ['第 8 课讲什么', '类加载器那门课重点', '这门课的内容']) {
    assert.equal(routeIntent(q, { hasHits: true }), 'course_overview', q);
  }
});

test('specific triggers', () => {
  assert.equal(routeIntent('双亲委派是什么', { hasHits: true }), 'specific');
  assert.equal(routeIntent('多态和重载区别', { hasHits: true }), 'specific');
});

test('exercise triggers', () => {
  assert.equal(routeIntent('本节有哪些练习', { hasHits: true }), 'exercise');
  assert.equal(routeIntent('有没有题', { hasHits: true }), 'exercise');
});

test('not_found when no hits or off-site', () => {
  assert.equal(routeIntent('量子计算', { hasHits: true }), 'not_found');
  assert.equal(routeIntent('随便什么', { hasHits: false }), 'not_found');
  assert.equal(routeIntent('', { hasHits: true }), 'not_found');
});

test('contextPlan: site_overview gets compact catalog, no passages', () => {
  const p = contextPlan('site_overview');
  assert.equal(p.site, true);
  assert.equal(p.compact, true);
  assert.equal(p.passages, 0);
});

test('contextPlan: specific gets 2 course cards + 6 passages', () => {
  const p = contextPlan('specific');
  assert.equal(p.courses, 2);
  assert.equal(p.passages, 6);
});

test('contextPlan: not_found gets site only', () => {
  const p = contextPlan('not_found');
  assert.equal(p.site, true);
  assert.equal(p.passages, 0);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCitations, escapeHtml, renderAnswer, validateCitations } from '../src/citations.js';

test('parseCitations: dedupe and order', () => {
  assert.deepEqual(parseCitations('见 [P1] 和 [C2]、[P1]、[S3]'), ['P1', 'C2', 'S3']);
});

test('parseCitations: empty', () => {
  assert.deepEqual(parseCitations('没有任何引用'), []);
});

test('escapeHtml: script injection neutralized', () => {
  assert.equal(escapeHtml('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
});

test('renderAnswer: known citations become links, unsafe text escaped', () => {
  const html = renderAnswer('多态见 [P1] <b>x</b>', {
    P1: { url: '/course/jb-c8', title: '第8课' },
  });
  assert.match(html, /href="\/course\/jb-c8"/);
  assert.match(html, /\[P1\]/);
  assert.doesNotMatch(html, /<b>/);
});

test('renderAnswer: missing citation marked', () => {
  const html = renderAnswer('无出处 [P9]', {});
  assert.match(html, /cite-missing/);
});

test('validateCitations: ok when all cited exist and at least one', () => {
  const v = validateCitations('见 [P1][C1]', { P1: {}, C1: {} });
  assert.equal(v.ok, true);
  assert.deepEqual(v.missing, []);
});

test('validateCitations: missing key', () => {
  const v = validateCitations('见 [P2]', { P1: {} });
  assert.equal(v.ok, false);
  assert.deepEqual(v.missing, ['P2']);
});

test('validateCitations: no citation is not ok', () => {
  assert.equal(validateCitations('没有任何依据', {}).ok, false);
});

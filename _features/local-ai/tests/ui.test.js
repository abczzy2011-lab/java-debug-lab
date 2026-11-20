import test from 'node:test';
import assert from 'node:assert/strict';
import { COPY, statusChip, renderMessages, failureView, installModal } from '../src/ui.js';

test('statusChip: cloud uses 混合模型', () => {
  assert.equal(statusChip('cloud', '联网正常'), '混合模型 · 联网正常');
});
test('statusChip: local and search labels', () => {
  assert.equal(statusChip('local'), '本地');
  assert.equal(statusChip('search'), '检索结果');
});
test('statusChip never shows provider', () => {
  assert.doesNotMatch(statusChip('cloud', '联网正常'), /GLM|SenseNova|Cloudflare/i);
});

test('renderMessages escapes user HTML', () => {
  const h = renderMessages([{ role: 'user', text: '<script>x</script>' }]);
  assert.doesNotMatch(h, /<script>/);
  assert.match(h, /&lt;script&gt;/);
});
test('renderMessages renders known citation as link', () => {
  const h = renderMessages(
    [{ role: 'ai', text: '见 [P1]', citations: ['P1'] }],
    { P1: { url: '#c8', title: '第8课' } },
  );
  assert.match(h, /href="#c8"/);
  assert.match(h, /参考：第8课/);
});
test('renderMessages: unknown citation stays text', () => {
  const h = renderMessages([{ role: 'ai', text: '见 [P9]' }], {});
  assert.match(h, /\[P9\]/);
  assert.doesNotMatch(h, /href=/);
});

test('failureView lists failed checks and actions, no force install', () => {
  const v = failureView([{ label: 'WebGPU', detail: 'missing' }]);
  assert.match(v.title, /不满足/);
  assert.deepEqual(v.items, ['WebGPU：missing']);
  assert.deepEqual(v.actions, ['重新检测', '仅使用云端', '仅使用检索']);
});

test('installModal has 4 consent buttons and 5 disclosure lines', () => {
  const m = installModal();
  assert.equal(m.paragraphs.length, 5);
  assert.deepEqual(m.buttons, ['智能（推荐）', '仅云端', '检测本地', '仅使用检索']);
});

test('quick prompts are the 4 planned ones', () => {
  assert.deepEqual(COPY.quick, ['第 8 课讲什么', '多态和重载的区别', '本节有哪些练习', '这个概念在哪一课']);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { compactAnswer } from '../src/answer-format.js';

test('strips unsolicited code fences from concept answers', () => {
  const q = '多态和重载的区别';
  const raw = '多态是运行时动态绑定。\n\n重载是编译期按参数列表选择。\n\n举个例子：\n```java\nclass A {}\n```';
  const out = compactAnswer(raw, q);
  assert.match(out, /运行时动态绑定/);
  assert.doesNotMatch(out, /```|class A/);
  assert.doesNotMatch(out, /举个例子/);
});

test('keeps code when the question asks for it', () => {
  const raw = '下面是一个例子：\n```java\nclass A {}\n```';
  const out = compactAnswer(raw, '给我一个 Java 代码例子');
  assert.match(out, /```java/);
  assert.match(out, /class A/);
});

test('leaves answers without fences unchanged', () => {
  const raw = '多态看实际对象类型，重载看参数列表。';
  assert.equal(compactAnswer(raw, '区别'), raw);
});

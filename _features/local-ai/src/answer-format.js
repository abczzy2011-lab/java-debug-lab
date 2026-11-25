// src/answer-format.js — present model answers without unsolicited code dumps.
// Cloud models sometimes append a full class even when the user asked only for
// a definition. Keep code when the question actually asks for it; otherwise
// remove fenced blocks and leave the conceptual answer intact.

const ASKS_FOR_CODE = /代码|编程|例子|示例|demo|怎么写|写一个|实现|运行|报错|编译|异常|修复|调试/i;

export function compactAnswer(text = '', question = '') {
  const source = String(text || '').trim();
  if (!source) return '';
  if (ASKS_FOR_CODE.test(String(question || ''))) return source;
  const firstFence = source.indexOf('```');
  if (firstFence < 0) return source;
  // The model usually puts the definition first and then appends a full class.
  // Keep the definition; drop the code and the "在这个例子里…" commentary that
  // would refer to code the user never saw.
  let clean = source.slice(0, firstFence)
    .replace(/(?:^|\n)\s*(举个例(?:子)?|例如|例子)[：:]?\s*$/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  return clean;
}

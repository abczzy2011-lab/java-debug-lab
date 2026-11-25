/* JavaScript 输出实现场：真实浏览器 Worker 执行器
   每个用例调用一次用户代码，捕获 console.log，返回 stdout 与毫秒。 */
'use strict';

function formatArg(value) {
  if (typeof value === 'string') return value;
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value);
  if (value instanceof Error) return value.name + ': ' + value.message;
  try {
    const seen = new WeakSet();
    return JSON.stringify(value, function (key, item) {
      if (typeof item === 'object' && item !== null) {
        if (seen.has(item)) return '[Circular]';
        seen.add(item);
      }
      if (typeof item === 'bigint') return item.toString();
      return item;
    });
  } catch (_) {
    return String(value);
  }
}

self.onmessage = function (event) {
  const data = event.data || {};
  const code = String(data.code || '');
  const cases = Array.isArray(data.cases) ? data.cases : [];
  let fn;
  try {
    // 用户代码以函数体执行，input 是当前用例的完整 stdin。
    fn = new Function('input', '"use strict";\n' + code);
  } catch (error) {
    self.postMessage({
      ok: false,
      compileError: error && error.message ? error.message : String(error)
    });
    return;
  }

  const results = [];
  const originalLog = console.log;
  for (let i = 0; i < cases.length; i++) {
    const testCase = cases[i] || {};
    const lines = [];
    const started = performance.now();
    let stderr = '';
    console.log = function () {
      const args = Array.prototype.slice.call(arguments);
      lines.push(args.map(formatArg).join(' '));
    };
    try {
      fn(String(testCase.stdin == null ? '' : testCase.stdin));
    } catch (error) {
      stderr = error && error.stack ? String(error.stack) : (error && error.message ? error.message : String(error));
    } finally {
      console.log = originalLog;
    }
    results.push({
      stdout: lines.join('\n'),
      stderr: stderr,
      timeMs: Math.max(0, performance.now() - started)
    });
  }
  self.postMessage({ ok: true, results: results });
};

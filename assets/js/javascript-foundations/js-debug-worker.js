/* JavaScript 改错实验室：在独立 Worker 中执行用户代码与测试用例 */
(function () {
  'use strict';

  var LOGS = [];

  function preview(value, depth) {
    depth = depth || 0;
    if (value === undefined) return 'undefined';
    if (typeof value === 'number') {
      if (Number.isNaN(value)) return 'NaN';
      if (value === Infinity) return 'Infinity';
      if (value === -Infinity) return '-Infinity';
    }
    if (typeof value === 'string') return JSON.stringify(value);
    if (typeof value === 'bigint') return String(value) + 'n';
    if (typeof value === 'function') return '[Function]';
    if (typeof value === 'symbol') return String(value);
    if (value === null || typeof value !== 'object') return String(value);
    if (depth > 3) return Array.isArray(value) ? '[Array]' : '[Object]';
    try {
      var seen = [];
      var json = JSON.stringify(value, function (key, item) {
        if (typeof item === 'object' && item !== null) {
          if (seen.indexOf(item) >= 0) return '[Circular]';
          seen.push(item);
        }
        if (typeof item === 'undefined') return '[undefined]';
        if (typeof item === 'function') return '[Function]';
        if (typeof item === 'bigint') return String(item) + 'n';
        return item;
      });
      return json === undefined ? String(value) : json;
    } catch (err) {
      return String(value);
    }
  }

  function equal(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    var ka = Object.keys(a);
    var kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (var i = 0; i < ka.length; i += 1) {
      var key = ka[i];
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!equal(a[key], b[key])) return false;
    }
    return true;
  }

  function addLog(args) {
    var text = Array.prototype.map.call(args, function (item) {
      return typeof item === 'string' ? item : preview(item);
    }).join(' ');
    LOGS.push(text);
    if (LOGS.length > 80) LOGS.shift();
  }

  var nativeLog = console.log.bind(console);
  console.log = function () {
    addLog(arguments);
    try { nativeLog.apply(null, arguments); } catch (err) {}
  };

  self.onmessage = async function (event) {
    var payload = event.data || {};
    var code = String(payload.code || '');
    var cases = Array.isArray(payload.cases) ? payload.cases : [];
    var started = performance.now();
    var solveFn = null;

    try {
      var factory = new Function('"use strict";\n' + code + '\n;return typeof solve === "function" ? solve : null;');
      solveFn = factory();
    } catch (error) {
      self.postMessage({
        fatal: {
          type: 'compile',
          name: error && error.name || 'Error',
          message: error && error.message || String(error)
        },
        logs: LOGS.slice(),
        totalMs: Math.round((performance.now() - started) * 100) / 100
      });
      return;
    }

    if (typeof solveFn !== 'function') {
      self.postMessage({
        fatal: {
          type: 'missing',
          name: 'ReferenceError',
          message: '没有找到 solve 函数。请保留函数名 solve，并确保它是可调用的。'
        },
        logs: LOGS.slice(),
        totalMs: Math.round((performance.now() - started) * 100) / 100
      });
      return;
    }

    var results = [];
    for (var i = 0; i < cases.length; i += 1) {
      var testCase = cases[i] || {};
      var result = {
        label: String(testCase.label || ('用例 ' + (i + 1))),
        public: testCase.public !== false,
        args: testCase.args || [],
        expectedText: preview(testCase.expected),
        actualText: '',
        passed: false,
        error: '',
        ms: 0
      };
      var caseStart = performance.now();
      try {
        var returned = solveFn.apply(null, testCase.args || []);
        var value = returned && typeof returned.then === 'function' ? await returned : returned;
        result.actualText = preview(value);
        result.passed = equal(value, testCase.expected);
      } catch (error) {
        result.error = (error && error.name || 'Error') + ': ' + (error && error.message || String(error));
        result.actualText = result.error;
      }
      result.ms = Math.round((performance.now() - caseStart) * 100) / 100;
      results.push(result);
    }

    self.postMessage({
      results: results,
      logs: LOGS.slice(),
      totalMs: Math.round((performance.now() - started) * 100) / 100
    });
  };
})();

window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch17",
  "part": 4,
  "number": "17",
  "title": "异步：事件循环、Promise 与 async",
  "summary": "JavaScript 单线程执行，但宿主有事件循环。同步代码先跑完，微任务在当前任务末尾清空，宏任务下一轮再跑。Promise 和 async/await 只是把回调写得更像同步，不会改变这个顺序。",
  "goals": [
    "解释调用栈、微任务和宏任务的顺序",
    "理解 Promise 状态与错误传递",
    "用 async/await 写可读的异步流程",
    "实现并发限制、超时和取消"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.9、Appendix；JavaScript 高级程序设计 4th · Ch.11；JavaScript 权威指南 7th · Ch.13；You Don't Know JS · Async & Performance",
  "lessons": [
    {
      "id": "ch17-1",
      "title": "事件循环、任务与微任务",
      "minutes": 24,
      "lead": "JavaScript 单线程执行，但事件循环让异步任务排队。同步代码先跑完，再清空微任务队列，最后取一个宏任务。理解这个顺序，才能解释输出为什么不是从上到下。",
      "sections": [
        {
          "h": "同步 → 微任务 → 宏任务",
          "p": "当前调用栈清空后，引擎先执行所有微任务（Promise 回调、`queueMicrotask`、`MutationObserver`），再取下一个宏任务（`setTimeout`、`setInterval`、I/O、事件）。每取一个宏任务，都会再清空一次微任务队列。`await` 后面的代码相当于放进微任务继续执行。",
          "code": "console.log(\"A\");\nsetTimeout(() => console.log(\"B\"), 0);\nPromise.resolve().then(() => console.log(\"C\"));\nconsole.log(\"D\");",
          "output": "A\nD\nC\nB",
          "tip": "`setTimeout(fn, 0)` 不是立即执行，而是排到宏任务队列；前面的微任务会先跑。不要用 `setTimeout` 0 来“等 DOM 更新”，需要时用 `requestAnimationFrame` 或 `queueMicrotask`。"
        },
        {
          "h": "别阻塞事件循环",
          "p": "长循环、大 JSON 解析、同步 DOM 重排都会卡住主线程。大任务可以拆成小片，用 `setTimeout` / `requestIdleCallback` 让出控制权，或放进 Web Worker。`async` 函数里如果有长时间同步计算，`await` 也救不了，因为它仍然占着主线程。",
          "code": "function chunkWork(items, size, handle) {\n  let index = 0;\n  function run() {\n    const end = Math.min(index + size, items.length);\n    for (; index < end; index += 1) handle(items[index]);\n    if (index < items.length) setTimeout(run, 0);\n  }\n  run();\n}\nchunkWork([1, 2, 3, 4, 5], 2, (n) => console.log(\"处理\", n));",
          "output": "处理 1\n处理 2\n处理 3\n处理 4\n处理 5",
          "tip": "分片不是越多越好，片太小会增加调度开销。计算密集且可并行的任务优先考虑 Web Worker，而不是在主线程里切碎。"
        }
      ],
      "points": [
        "同步代码 → 微任务 → 宏任务。",
        "每个宏任务后都会清空微任务。",
        "长同步计算会阻塞主线程，`await` 不能解决。"
      ],
      "practice": "写一段包含 `console.log`、`Promise.then`、`setTimeout` 的代码，先手写预期输出顺序，再在控制台运行验证；最后把顺序图用注释写回代码。",
      "source": "JavaScript 高级程序设计 4th · Ch.11；JavaScript 权威指南 7th · Ch.13；You Don't Know JS · Async & Performance"
    },
    {
      "id": "ch17-2",
      "title": "Promise 的状态与错误传递",
      "minutes": 26,
      "lead": "Promise 只有 pending、fulfilled、rejected 三种状态，状态一旦改变就固定。错误会沿链向后传递，直到遇到 `catch` 或 `then` 的第二个参数。",
      "sections": [
        {
          "h": "then 返回新 Promise",
          "p": "每次 `.then` 都返回一个新 Promise，所以可以链式调用。回调里返回值会被包装成 fulfilled；抛错会变成 rejected。没有 `return` 的 `then` 会得到 `undefined`，下一环拿不到上一环的数据。`catch` 捕获链上最近一次拒绝，`finally` 无论成功失败都会执行。",
          "code": "Promise.resolve(1)\n  .then((n) => n + 1)\n  .then((n) => { throw new Error(\"第二步失败\"); })\n  .catch((err) => console.log(\"捕获:\", err.message))\n  .finally(() => console.log(\"结束\"));",
          "output": "捕获: 第二步失败\n结束",
          "tip": "`then(onFulfilled, onRejected)` 的第二个参数不会捕获 `onFulfilled` 自己抛出的错误；要捕获整条链，统一在末尾放 `catch`。"
        },
        {
          "h": "all、allSettled 与 race",
          "p": "`Promise.all` 等全部成功，任何一个失败就整体拒绝；`Promise.allSettled` 等全部落定，返回每一项的状态和值；`Promise.race` 取最先落定的一项；`Promise.any` 取最先成功的一项。并发请求要设置上限，别一次性打几百个请求。",
          "code": "Promise.all([Promise.resolve(1), Promise.resolve(2)])\n  .then((values) => console.log(values.join(\",\")));\nPromise.allSettled([\n  Promise.resolve(\"ok\"),\n  Promise.reject(new Error(\"bad\"))\n]).then((results) => console.log(results.map((r) => r.status).join(\",\")));",
          "output": "1,2\nfulfilled,rejected",
          "tip": "`Promise.all` 失败后其他请求不会自动取消，仍会继续执行。需要取消就用 `AbortController`；需要全部结果就用 `allSettled`。"
        }
      ],
      "points": [
        "Promise 状态不可逆。",
        "`then` 返回新 Promise，忘记 return 会丢值。",
        "`all` 短路失败，`allSettled` 等全部落定。"
      ],
      "practice": "创建三个 Promise，其中一个会拒绝；分别用 `Promise.all` 和 `Promise.allSettled` 处理，打印两种结果的差异。",
      "source": "JavaScript 高级程序设计 4th · Ch.11；JavaScript 权威指南 7th · Ch.13；Secrets of the JavaScript Ninja 2nd · Ch.6"
    },
    {
      "id": "ch17-3",
      "title": "async / await 与 fetch",
      "minutes": 26,
      "lead": "`async` 函数总是返回 Promise，`await` 等待一个 Promise 落定。它让异步代码读起来像同步，但错误仍然要用 `try/catch` 显式处理。",
      "sections": [
        {
          "h": "fetch 不会因为 404 拒绝",
          "p": "`fetch` 只在网络失败时拒绝，HTTP 404、500 仍然会 resolve，必须检查 `response.ok` 或 `status`。响应体要按类型读：`json()`、`text()`、`blob()`。请求可以带 `method`、`headers`、`body`，跨域还要后端允许。不要在 `await` 后再假设数据一定存在。",
          "code": "async function loadUser(id) {\n  const res = await fetch(\"/api/users/\" + id);\n  if (!res.ok) throw new Error(\"HTTP \" + res.status);\n  return res.json();\n}\nloadUser(7)\n  .then((user) => console.log(user.name))\n  .catch((err) => console.error(err.message));",
          "output": "Ada",
          "tip": "错误消息里保留状态码和接口路径，便于排查；不要把后端返回的完整敏感错误直接展示给用户。"
        },
        {
          "h": "串行与并行的选择",
          "p": "多个请求互不依赖时用 `Promise.all` 并行，耗时接近最慢的那个；后一个依赖前一个结果时才串行 `await`。循环里逐个 `await` 会变成串行，数据量大时非常慢。需要限制并发时写一个小的 `mapLimit`，而不是一次全部发出。",
          "code": "async function loadDashboard(userId) {\n  const [user, orders] = await Promise.all([\n    fetch(\"/api/users/\" + userId).then((r) => r.json()),\n    fetch(\"/api/users/\" + userId + \"/orders\").then((r) => r.json())\n  ]);\n  return { user, orders };\n}\nloadDashboard(7).then((data) => console.log(data.user.name, data.orders.length));",
          "output": "Ada 3",
          "tip": "并行请求要确认接口之间真的没有依赖。`Promise.all` 中一个失败会让整体失败，但仍可用 `allSettled` 分别处理。"
        }
      ],
      "points": [
        "`fetch` 对 404/500 不拒绝，要检查 `res.ok`。",
        "互不依赖的请求用 `Promise.all` 并行。",
        "循环里的 `await` 默认串行，注意性能。"
      ],
      "practice": "写一个 `loadDashboard` 并行请求用户和订单，检查两个响应的 `ok`，任一失败时抛出带状态码的错误；再用 `try/catch` 打印。",
      "source": "JavaScript 高级程序设计 4th · Ch.11、24；JavaScript 权威指南 7th · Ch.13；Head First JavaScript Programming 2nd · Appendix"
    },
    {
      "id": "ch17-4",
      "title": "并发控制、超时与取消",
      "minutes": 34,
      "lead": "`Promise.all` 会等所有任务，但一个失败就整体拒绝；`allSettled` 保留每个结果；`race` 取最先完成（包括失败）。并发不是越多越好，浏览器和服务器都有连接/速率限制。",
      "sections": [
        {
          "h": "all、allSettled、race、any",
          "p": "`Promise.all` 任一 reject 立即 reject，其他结果丢失；`allSettled` 等全部结束，返回 status/value/reason；`race` 第一个 settle 就返回；`any` 第一个 fulfill 才返回，全部 reject 才 reject（AggregateError）。\n\n需要每个结果都成功时用 all；需要部分失败也继续时用 allSettled。",
          "code": "const p1 = Promise.resolve(1);\nconst p2 = Promise.reject(new Error(\"bad\"));\nconst all = await Promise.allSettled([p1, p2]);\nconsole.log(all.map(x => x.status));\nconst first = await Promise.race([p1, new Promise(r => setTimeout(() => r(2), 100))]);\nconsole.log(first);",
          "output": "[ \"fulfilled\", \"rejected\" ]\n1",
          "tip": "all 快速失败；allSettled 保留全部结果；race 第一个完成就返回。"
        },
        {
          "h": "并发限制与批处理",
          "p": "一次发 100 个请求会占满连接、拖慢页面，也可能触发限流。写一个 `mapLimit(items, limit, fn)`：维护运行中的任务数，完成一个补一个，结果按原顺序返回。\n\n并发限制不是「越少越好」；根据接口限流和页面体验调参，并给失败任务重试上限。",
          "code": "async function mapLimit(items, limit, fn) {\n  const results = new Array(items.length);\n  let next = 0;\n  async function worker() {\n    while (next < items.length) {\n      const i = next++;\n      results[i] = await fn(items[i], i);\n    }\n  }\n  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));\n  return results;\n}",
          "output": "按原顺序返回结果，同时最多 limit 个任务运行",
          "tip": "并发限制要保序；失败要有重试和总量上限。"
        },
        {
          "h": "超时、取消与重试",
          "p": "超时用 `AbortSignal.timeout` 或手动竞速；取消要传递到 fetch/任务内部，而不是只让外层 Promise 不再等待。重试只针对可恢复错误（网络、429、5xx），不要重试 400/401。\n\n重试要指数退避并加抖动，避免雪崩；同一个任务过期后不要再更新 UI。",
          "code": "async function withRetry(fn, { retries = 2, base = 200 } = {}) {\n  let last;\n  for (let i = 0; i <= retries; i += 1) {\n    try { return await fn(); } catch (e) {\n      last = e;\n      if (i === retries || ![429, 500, 502, 503, 504].includes(e.status)) break;\n      await new Promise(r => setTimeout(r, base * 2 ** i + Math.random() * 100));\n    }\n  }\n  throw last;\n}",
          "output": "成功返回结果\n不可重试错误立即抛\n可重试错误按 200/400/800ms 退避",
          "tip": "只重试可恢复错误；退避 + 抖动；取消信号要传到请求层。"
        }
      ],
      "points": [
        "all 快速失败，allSettled 保留全部结果。",
        "并发限制要保序并控制上限。",
        "只重试可恢复错误，退避要有抖动。"
      ],
      "practice": "实现 `mapLimit(items, 3, fetchItem)` 和 `withRetry`，用 10 个假请求测试最大并发数、结果顺序和失败重试次数；再加一个 AbortController 取消全部请求。",
      "source": "JavaScript 高级程序设计 4th · Ch.11、24；JavaScript 权威指南 7th · Ch.13；You Don't Know JS · Async & Performance"
    }
  ]
});

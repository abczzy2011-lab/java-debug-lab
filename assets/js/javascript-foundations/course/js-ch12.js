window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch12",
  "part": 3,
  "number": "12",
  "title": "迭代器、生成器与惰性序列",
  "summary": "`for...of` 背后是可迭代协议：对象实现 `Symbol.iterator`，每次 `next()` 返回 `{value, done}`。生成器让写迭代器像写函数，遇到 `yield` 就暂停。",
  "goals": [
    "解释可迭代协议与迭代器协议",
    "自定义可迭代对象",
    "用生成器实现惰性序列",
    "知道异步迭代的入口"
  ],
  "source": "JavaScript 高级程序设计 4th · Ch.7；JavaScript 权威指南 7th · Ch.12；Secrets of the JavaScript Ninja 2nd · Ch.6；Eloquent JavaScript 4th · Ch.6",
  "lessons": [
    {
      "id": "ch12-1",
      "title": "迭代器、生成器与惰性序列",
      "minutes": 24,
      "lead": "可迭代协议让 `for...of`、展开和数组解构都能工作；生成器用 `yield` 一次产出一个值，适合大序列和无限序列。",
      "sections": [
        {
          "h": "可迭代对象与迭代器",
          "p": "一个对象实现 `Symbol.iterator` 方法，返回带 `next()` 的迭代器，就是可迭代对象。`next()` 返回 `{ value, done }`。数组、字符串、Map、Set 都内置了迭代器。手写迭代器适合理解协议，实际开发优先用生成器。",
          "code": "const range = {\n  from: 1,\n  to: 5,\n  [Symbol.iterator]() {\n    let current = this.from;\n    const last = this.to;\n    return {\n      next() {\n        if (current > last) return { done: true };\n        return { value: current++, done: false };\n      }\n    };\n  }\n};\nconsole.log([...range].join(\",\"));",
          "output": "1,2,3,4,5",
          "tip": "迭代器通常是一次性的；迭代结束后再调用 `next()` 仍返回 `done: true`。需要重复遍历就重新创建迭代器。"
        },
        {
          "h": "生成器把状态保存在函数里",
          "p": "`function*` 加 `yield` 会暂停并保留局部变量，下一次 `next()` 从暂停处继续。生成器适合分页拉取、逐行读大文件、无限序列和管道处理。它不会自动执行，必须被消费；忘记消费就什么也不会发生。",
          "code": "function* range(start, end, step = 1) {\n  for (let i = start; i < end; i += step) yield i;\n}\nconsole.log([...range(1, 6, 2)].join(\",\"));\n\nconst iterator = range(3, 6)[Symbol.iterator]();\nconsole.log(iterator.next().value);\nconsole.log(iterator.next().value);\nconsole.log(iterator.next().done);",
          "output": "1,3,5\n3\n4\nfalse",
          "tip": "生成器里的 `return` 会结束迭代并设置 `done: true`，返回值放进 `value`。不要在生成器里做不可预期的副作用，消费次数决定副作用次数。"
        }
      ],
      "points": [
        "可迭代对象实现 `Symbol.iterator`。",
        "生成器用 `yield` 暂停并保留局部状态。",
        "生成器是惰性的，不被消费就不执行。"
      ],
      "practice": "写一个生成器 `take(iterable, n)`，从任意可迭代对象中取前 n 项；再用它处理一个无限自然数序列，验证不会卡死。",
      "source": "JavaScript 高级程序设计 4th · Ch.7；JavaScript 权威指南 7th · Ch.12；Secrets of the JavaScript Ninja 2nd · Ch.6"
    },
    {
      "id": "ch12-2",
      "title": "for...of、可迭代协议与自定义迭代器",
      "minutes": 31,
      "lead": "`for...of` 不是数组专属；只要对象有 `[Symbol.iterator]` 方法，就能被遍历。字符串、Map、Set、NodeList 都是可迭代对象；普通对象默认不可迭代。",
      "sections": [
        {
          "h": "可迭代协议与迭代器协议",
          "p": "可迭代对象必须有 `[Symbol.iterator]()`，返回一个迭代器；迭代器的 `next()` 返回 `{ value, done }`。`for...of` 会不断调用 next，直到 done 为 true。\n\n迭代器是「一次性」的；同一个迭代器第二次遍历通常已经结束，需要重新获取。",
          "code": "const arr = [1, 2];\nconst it = arr[Symbol.iterator]();\nconsole.log(it.next());\nconsole.log(it.next());\nconsole.log(it.next());\nconst text = \"hi\";\nconsole.log([...text]);",
          "output": "{ value: 1, done: false }\n{ value: 2, done: false }\n{ value: undefined, done: true }\n[ \"h\", \"i\" ]",
          "tip": "迭代器只走一次；需要重复遍历时重新调用 Symbol.iterator。"
        },
        {
          "h": "自定义可迭代对象",
          "p": "给对象加 `[Symbol.iterator]` 就能被 `for...of`、展开和 `Array.from` 使用。实现时确保 `done` 最终为 true，否则循环不会结束。\n\n生成器函数是最简单的迭代器实现：每次 `yield` 产出一个值，函数体暂停，下一次 next 继续。",
          "code": "const range = {\n  from: 1, to: 3,\n  [Symbol.iterator]() {\n    let n = this.from;\n    const to = this.to;\n    return { next: () => n <= to ? { value: n++, done: false } : { value: undefined, done: true } };\n  }\n};\nconsole.log([...range]);\nconsole.log(Array.from(range));",
          "output": "[ 1, 2, 3 ]\n[ 1, 2, 3 ]",
          "tip": "自定义迭代器要保证 done 终止；生成器函数更省代码。"
        },
        {
          "h": "生成器与提前退出",
          "p": "生成器函数用 `function*` 定义，`yield` 产出值并暂停。它适合分页、逐行读取、无限序列和提前退出；`for...of` 遇到 break 会调用迭代器的 `return()`，生成器可以在 finally 里清理。\n\n不要在生成器里做不可恢复的副作用；暂停点会让调用方控制执行节奏。",
          "code": "function* pages(items, size) {\n  for (let i = 0; i < items.length; i += size) yield items.slice(i, i + size);\n}\nfor (const page of pages([1,2,3,4,5], 2)) console.log(page);\nfunction* guard() {\n  try { yield 1; yield 2; } finally { console.log(\"cleanup\"); }\n}\nconst g = guard();\nconsole.log(g.next().value);\ng.return();",
          "output": "[ 1, 2 ]\n[ 3, 4 ]\n[ 5 ]\n1\ncleanup",
          "tip": "生成器暂停执行；提前 break/return 时用 finally 清理资源。"
        }
      ],
      "points": [
        "for...of 依赖 Symbol.iterator，不是数组专属。",
        "迭代器一次性，需要重复遍历就重新获取。",
        "生成器 yield 暂停，适合分页和惰性序列。"
      ],
      "practice": "写一个 `range(start, end, step)` 可迭代对象和一个生成器版本，比较代码量；再用 `for...of` 提前 break，确认生成器 finally 是否执行。",
      "source": "JavaScript 高级程序设计 4th · Ch.7；JavaScript 权威指南 7th · Ch.12；Secrets of the JavaScript Ninja 2nd · Ch.6"
    },
    {
      "id": "ch12-3",
      "title": "生成器委托、异步迭代与流式处理",
      "minutes": 32,
      "lead": "生成器不仅能 `yield` 单个值，还能 `yield*` 委托给另一个可迭代对象。异步生成器把 `yield` 和 `await` 结合，适合分页 API、流式读取和背压控制。",
      "sections": [
        {
          "h": "yield* 委托",
          "p": "`yield* iterable` 把另一个迭代器的所有值转交给外层生成器；它等价于 `for...of` 再逐个 `yield`，但更简洁。委托可以是数组、字符串、另一个生成器。\n\n`yield*` 的返回值是内层迭代器的 return 值；普通生成器通常不关心，但可以接收。",
          "code": "function* inner() { yield 1; yield 2; return \"done\"; }\nfunction* outer() {\n  const result = yield* inner();\n  console.log(result);\n  yield 3;\n}\nconsole.log([...outer()]);",
          "output": "done\n[ 1, 2, 3 ]",
          "tip": "`yield*` 把可迭代对象全部委托出去；内层 return 值可由外层接收。"
        },
        {
          "h": "异步生成器与 for await",
          "p": "`async function*` 可以 `yield` Promise 或普通值，消费端用 `for await...of`。每次迭代会等待当前值，适合逐页拉取数据、逐行读流。\n\n异步迭代仍然是串行的；需要并发时用 `Promise.all` 控制批次，不要把所有请求同时发出。",
          "code": "async function* loadPages() {\n  yield Promise.resolve([\"a\", \"b\"]);\n  yield [\"c\"];\n}\n(async () => {\n  for await (const page of loadPages()) console.log(page);\n})();",
          "output": "[ \"a\", \"b\" ]\n[ \"c\" ]",
          "tip": "`for await` 逐项等待；并发抓取要另做批次控制。"
        },
        {
          "h": "流式处理与背压",
          "p": "流式处理的价值是「不需要一次把所有数据装进内存」。生成器按需产出，消费端按需拉取；如果生产快于消费，需要暂停/恢复或队列限长，这就是背压。\n\n浏览器 ReadableStream 和 Node Stream 都有自己的背压机制；不要用无限数组假装流。",
          "code": "function* take(iter, n) {\n  let i = 0;\n  for (const x of iter) {\n    if (i++ >= n) return;\n    yield x;\n  }\n}\nfunction* naturals() { let i = 0; while (true) yield i++; }\nconsole.log([...take(naturals(), 4)]);",
          "output": "[ 0, 1, 2, 3 ]",
          "tip": "流式处理要限制队列和终止条件；无限序列不能直接展开。"
        }
      ],
      "points": [
        "yield* 委托另一个可迭代对象。",
        "async function* + for await 适合分页和流。",
        "流式处理要设计背压和终止条件。"
      ],
      "practice": "用异步生成器模拟分页 API，每页延迟 200ms 返回两条记录；消费端用 `for await` 打印，并在第三页提前 break，确认不再请求下一页。",
      "source": "JavaScript 权威指南 7th · Ch.12–13；JavaScript 高级程序设计 4th · Ch.7；Secrets of the JavaScript Ninja 2nd · Ch.6"
    }
  ]
});

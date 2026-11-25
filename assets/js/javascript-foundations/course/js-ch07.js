window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch7",
  "part": 2,
  "number": "07",
  "title": "高阶函数与递归",
  "summary": "高阶函数把「做什么」和「怎么循环」分开：map/filter/reduce 接收函数，返回新值；柯里化和管道把多参数函数拆成可组合的小步骤。递归则用调用栈替代循环。",
  "goals": [
    "用高阶函数替代手写循环",
    "理解柯里化与部分应用",
    "用管道组织转换链",
    "写有终止条件的递归并识别栈溢出"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.10；Eloquent JavaScript 4th · Ch.5–6；JavaScript 权威指南 7th · Ch.8；Secrets of the JavaScript Ninja 2nd · Ch.3",
  "lessons": [
    {
      "id": "ch7-1",
      "title": "回调、高阶函数与组合",
      "minutes": 22,
      "lead": "高阶函数接收函数或返回函数。它把“做什么”和“怎么遍历”分开，让代码从一堆循环变成一条可读的数据流。",
      "sections": [
        {
          "h": "回调是控制反转，也是错误源",
          "p": "把函数传给另一个函数，执行时机就交给了对方。同步回调里的异常还能被外层 `try/catch` 捕获；异步回调抛错则不会，必须通过回调参数、Promise 或事件机制传递。写高阶函数时要明确：回调会被调用几次、参数是什么、返回值怎么处理。",
          "code": "function repeat(times, action) {\n  for (let i = 0; i < times; i += 1) action(i);\n}\nrepeat(3, (i) => console.log(\"第\" + (i + 1) + \"次\"));\n\nfunction withLogging(fn) {\n  return function (...args) {\n    console.log(\"调用参数\", args);\n    return fn(...args);\n  };\n}\nconst add = withLogging((a, b) => a + b);\nconsole.log(add(2, 3));",
          "output": "第1次\n第2次\n第3次\n调用参数 [ 2, 3 ]\n5",
          "tip": "不要给回调塞太多职责。一个回调只做一件事；需要错误处理就用 `try/catch` 包住回调体，或改成 Promise 链。"
        },
        {
          "h": "组合小函数，别造巨型回调",
          "p": "把“取字段、过滤、排序、格式化”拆成小函数，再用 `map` / `filter` / `sort` 串起来。组合时注意每个函数是否返回新值、是否修改原数组。`pipe` 和 `compose` 只是把调用顺序显式化，不是必须引入的库能力。",
          "code": "const users = [\n  { name: \"Ada\", score: 88 },\n  { name: \"Grace\", score: 95 },\n  { name: \"Linus\", score: 72 }\n];\nconst topNames = users\n  .filter((u) => u.score >= 80)\n  .sort((a, b) => b.score - a.score)\n  .map((u) => u.name);\nconsole.log(topNames.join(\", \"));",
          "output": "Grace, Ada",
          "tip": "`sort` 会原地修改数组。对共享数据排序前先 `[...users].sort(...)`，否则调用方会看到顺序被改掉。"
        }
      ],
      "points": [
        "高阶函数把遍历和业务动作分开。",
        "异步回调的错误不能靠外层 `try/catch` 接。",
        "组合前先确认每个步骤是否修改原数据。"
      ],
      "practice": "把一组用户按分数从高到低排序并取前三名，要求不修改原数组；再用 `withLogging` 包一层，打印每次调用的参数。",
      "source": "Head First JavaScript Programming 2nd · Ch.10；Eloquent JavaScript 4th · Ch.5；Secrets of the JavaScript Ninja 2nd · Ch.3"
    },
    {
      "id": "ch7-2",
      "title": "柯里化、管道与惰性求值",
      "minutes": 31,
      "lead": "柯里化把 `f(a,b,c)` 变成 `f(a)(b)(c)`；部分应用先固定一部分参数。它们不是性能优化，而是让函数更容易复用、组合和测试。",
      "sections": [
        {
          "h": "柯里化与部分应用",
          "p": "柯里化严格来说每次只接收一个参数；实际业务里常把「部分应用」也叫柯里化。核心都是返回新函数，等待剩余参数。\n\n不要为所有函数强行柯里化；只有当参数有明显分组、需要复用中间步骤时才值得。",
          "code": "const add = a => b => c => a + b + c;\nconsole.log(add(1)(2)(3));\nconst add10 = add(10);\nconsole.log(add10(2)(3));\nfunction partial(fn, ...fixed) {\n  return (...rest) => fn(...fixed, ...rest);\n}\nconst inc = partial((a, b) => a + b, 1);\nconsole.log(inc(4));",
          "output": "6\n15\n5",
          "tip": "柯里化适合固定配置和复用；不要为了形式牺牲可读性。"
        },
        {
          "h": "管道与组合的顺序",
          "p": "`pipe` 从左到右，`compose` 从右到左。管道里每一步应是一元函数，输出直接喂给下一步；如果某步可能失败，用 Result 类型或显式抛错，不要偷偷返回 null。\n\n管道不是异步流程的替代品；异步用 `then` 链或 async/await，错误用 catch 处理。",
          "code": "const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);\nconst trim = s => s.trim();\nconst upper = s => s.toUpperCase();\nconst exclaim = s => `${s}!`;\nconsole.log(pipe(trim, upper, exclaim)(\"  hi  \"));",
          "output": "HI!",
          "tip": "管道只做同步转换；异步和错误处理另建流程。"
        },
        {
          "h": "惰性求值与生成器",
          "p": "惰性求值不是「所有数组方法都延迟」，而是按需产生值：生成器、迭代器、`Array.prototype.values()` 都能做到。它对大文件、无限序列和提前退出有帮助。\n\n普通数组的 map/filter 会立即创建新数组；数据量大时先考虑是否真的需要全部结果。",
          "code": "function* naturals() {\n  let n = 0;\n  while (true) yield n++;\n}\nconst it = naturals();\nconsole.log(it.next().value, it.next().value);\nfunction* take(iter, n) {\n  for (const x of iter) { if (n-- <= 0) return; yield x; }\n}\nconsole.log([...take(naturals(), 5)]);",
          "output": "0 1\n[ 0, 1, 2, 3, 4 ]",
          "tip": "惰性序列要有人负责终止；无限生成器不能直接 `[...]` 展开。"
        }
      ],
      "points": [
        "柯里化/部分应用返回新函数，适合复用。",
        "pipe 从左到右，compose 从右到左。",
        "惰性求值按需产生值，必须设计终止条件。"
      ],
      "practice": "写一个 `pipe` 和 `compose`，把 `trim / lower / slug` 三步串起来；再用生成器实现一个只取前 N 个偶数的惰性序列。",
      "source": "JavaScript 权威指南 7th · Ch.8；Secrets of the JavaScript Ninja 2nd · Ch.3；Eloquent JavaScript 4th · Ch.5"
    },
    {
      "id": "ch7-3",
      "title": "递归、树遍历与尾调用",
      "minutes": 30,
      "lead": "递归是把问题缩小成同类子问题，直到到达终止条件。它适合树、分治和回溯；不适合线性大循环，因为每次调用都占调用栈。",
      "sections": [
        {
          "h": "终止条件与调用栈",
          "p": "递归必须有两个部分：终止条件（base case）和向终止条件靠近的递归步骤。缺少任何一半都会无限递归，最终 `RangeError: Maximum call stack size exceeded`。\n\n递归深度受调用栈限制，通常几千到几万层；大数据量优先迭代或显式栈。",
          "code": "function factorial(n) {\n  if (!Number.isInteger(n) || n < 0) throw new RangeError(\"n must be a non-negative integer\");\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\nconsole.log(factorial(5));\ntry { factorial(-1); } catch (e) { console.log(e.name); }",
          "output": "120\nRangeError",
          "tip": "递归先写终止条件，再确认每一步都在靠近它。"
        },
        {
          "h": "树遍历：先序、后序与层序",
          "p": "树的先序遍历先处理当前节点，再处理子节点；后序先处理子节点，再处理当前节点；层序用队列逐层处理。选择哪种取决于你需要父节点还是子节点先完成。\n\n递归遍历要防止环；图结构需要 visited 集合，树结构要明确根和子节点边界。",
          "code": "const tree = { value: 1, children: [{ value: 2, children: [] }, { value: 3, children: [{ value: 4, children: [] }] }] };\nfunction sum(node) {\n  return node.value + node.children.reduce((acc, child) => acc + sum(child), 0);\n}\nconsole.log(sum(tree));",
          "output": "10",
          "tip": "树遍历先确认有没有环；图要 visited，树要明确子节点。"
        },
        {
          "h": "尾调用与迭代替代",
          "p": "尾调用是函数最后一步直接返回另一个函数调用；部分引擎会做尾调用优化，但浏览器支持并不统一。不要依赖它来解决所有深递归。\n\n更稳的方案是显式栈或循环：把待处理节点压入数组，while 弹出，避免调用栈增长。",
          "code": "function sumIterative(root) {\n  let total = 0;\n  const stack = [root];\n  while (stack.length) {\n    const node = stack.pop();\n    total += node.value;\n    stack.push(...node.children);\n  }\n  return total;\n}\nconsole.log(sumIterative({ value: 1, children: [{ value: 2, children: [] }] }));",
          "output": "3",
          "tip": "深递归优先改迭代；尾调用优化不能当作跨浏览器保证。"
        }
      ],
      "points": [
        "递归必须有终止条件和缩小步骤。",
        "树遍历要防止环，图需要 visited。",
        "深递归用显式栈或循环更稳。"
      ],
      "practice": "用递归和迭代各写一个目录树求和函数，比较调用栈深度；再给树遍历加 visited，避免环导致无限递归。",
      "source": "Eloquent JavaScript 4th · Ch.6；Secrets of the JavaScript Ninja 2nd · Ch.3；JavaScript 权威指南 7th · Ch.8"
    }
  ]
});

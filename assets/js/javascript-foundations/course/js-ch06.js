window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch6",
  "part": 2,
  "number": "06",
  "title": "作用域、闭包与模块化",
  "summary": "作用域决定一个名字在哪里可见，闭包决定函数能记住哪一层作用域。`var`、`let`、`const` 的提升和暂时性死区又让「先声明后使用」有了不同答案。",
  "goals": [
    "解释词法作用域与闭包的形成",
    "分清 var/let/const 的提升与 TDZ",
    "用 IIFE 和模块模式隔离状态",
    "知道闭包常见内存泄漏场景"
  ],
  "source": "JavaScript 高级程序设计 4th · Ch.4、10；JavaScript 权威指南 7th · Ch.8；You Don't Know JS · Scope & Closures；Effective JavaScript · Item 11–13",
  "lessons": [
    {
      "id": "ch6-1",
      "title": "词法作用域、闭包与私有状态",
      "minutes": 24,
      "lead": "闭包不是高级技巧，而是“函数记住定义时的变量环境”。计数器、缓存、防抖和模块私有变量，都是它的日常用法。",
      "sections": [
        {
          "h": "函数带着它的出生环境",
          "p": "内层函数可以访问外层函数的变量，即使外层函数已经返回。外层变量不会被垃圾回收，因为闭包还引用着它。这既能保存状态，也可能造成内存泄漏。用 `let` 在循环里创建块级作用域，每一轮都有独立的变量；用 `var` 则共享同一个变量。",
          "code": "function createCounter() {\n  let count = 0;\n  return {\n    inc() { count += 1; return count; },\n    value() { return count; }\n  };\n}\nconst counter = createCounter();\ncounter.inc();\ncounter.inc();\nconsole.log(counter.value());\n\nconst fns = [];\nfor (let i = 0; i < 3; i += 1) fns.push(() => i);\nconsole.log(fns.map((fn) => fn()).join(\",\"));",
          "output": "2\n0,1,2",
          "tip": "闭包保存的是变量绑定，不是当时的值。循环里用 `var` 得到的是最后一轮值；用 `let` 才有每轮独立绑定。"
        },
        {
          "h": "闭包做缓存，也要设边界",
          "p": "把计算结果缓存在闭包里，可以避免重复计算；但缓存必须有上限或失效策略，否则会一直占内存。防抖和节流也依赖闭包保存计时器。写这类函数时，最好同时提供 `cancel` 或 `clear` 方法，让调用方能释放资源。",
          "code": "function memoize(fn) {\n  const cache = new Map();\n  return function (key) {\n    if (cache.has(key)) return cache.get(key);\n    const value = fn(key);\n    cache.set(key, value);\n    return value;\n  };\n}\nconst square = memoize((n) => n * n);\nconsole.log(square(4), square(4), square(5));",
          "output": "16 16 25",
          "tip": "缓存键要能唯一标识输入；对象作为键时用 `Map`，不要用字符串拼接。无上限缓存只适合确定的小输入域。"
        }
      ],
      "points": [
        "闭包让函数记住定义时的变量环境。",
        "`let` 在循环里创建每轮独立绑定。",
        "缓存和计时器都要有释放或上限策略。"
      ],
      "practice": "实现一个带 `inc` / `value` / `reset` 的计数器闭包，再给 `memoize` 加上最大缓存条数，超过时删除最早的一条。",
      "source": "JavaScript 高级程序设计 4th · Ch.4、10；You Don't Know JS · Scope & Closures；Effective JavaScript · Item 11"
    },
    {
      "id": "ch6-2",
      "title": "var/let/const、提升与暂时性死区",
      "minutes": 30,
      "lead": "「变量提升」不是一个统一规则。`var` 的声明会提升并初始化为 undefined；`let`/`const` 也会提升，但在初始化前访问会触发 TDZ；函数声明整体提升，函数表达式只提升变量名。把这几条分清，能解释很多「undefined 不是应该报错吗」。",
      "sections": [
        {
          "h": "var 的提升与函数作用域",
          "p": "`var` 没有块级作用域，只有函数作用域。声明会提升到函数顶部并初始化为 undefined，所以 `console.log(x)` 在 `var x = 1` 之前不会报错，而是输出 undefined。\n\n在循环里用 var 创建闭包，所有闭包共享同一个变量；这是经典面试题，也是实际 bug。",
          "code": "function demo() {\n  console.log(x);\n  var x = 1;\n  if (true) { var y = 2; }\n  console.log(y);\n}\ndemo();",
          "output": "undefined\n2",
          "tip": "`var` 是函数作用域；循环闭包要用 let 或 IIFE 固定每一轮的值。"
        },
        {
          "h": "let/const 的 TDZ",
          "p": "`let`/`const` 在进入作用域时就创建绑定，但直到声明执行前都处于暂时性死区（TDZ）。在 TDZ 内访问会抛 `ReferenceError`，而不是 undefined。`typeof` 也不能绕过 TDZ。\n\n`const` 只锁绑定，不锁对象内容；`Object.freeze` 也只冻结第一层。",
          "code": "{\n  try { console.log(a); } catch (e) { console.log(e.name); }\n  let a = 1;\n}\nconst user = { name: \"Ada\" };\nuser.name = \"Grace\";\nconsole.log(user.name);",
          "output": "ReferenceError\nGrace",
          "tip": "TDZ 内连 typeof 都会抛错；const 不是深冻结。"
        },
        {
          "h": "块级作用域与循环闭包",
          "p": "`let` 在 for 循环中会为每次迭代创建新的绑定，所以 `for (let i...)` 里的闭包能记住每一轮的 i；`var` 不会。这个差异不是「浏览器行为」，而是规范规定的绑定创建方式。\n\n模块顶层、class 体、switch 的 case 都有各自的块级作用域；不要在 case 里重复声明同一个 let 名字。",
          "code": "const fns = [];\nfor (var i = 0; i < 3; i++) fns.push(() => i);\nconsole.log(fns.map(fn => fn()));\nconst gns = [];\nfor (let j = 0; j < 3; j++) gns.push(() => j);\nconsole.log(gns.map(fn => fn()));",
          "output": "[ 3, 3, 3 ]\n[ 0, 1, 2 ]",
          "tip": "循环闭包优先用 let；需要 var 时用 IIFE 捕获当轮值。"
        }
      ],
      "points": [
        "var 提升并初始化为 undefined，作用域是函数。",
        "let/const 有 TDZ，声明前访问会抛 ReferenceError。",
        "let 在循环中为每轮创建独立绑定。"
      ],
      "practice": "写一个循环注册三个按钮的点击回调，分别用 var 和 let 实现，点击后打印各自编号；解释为什么一个全是 3，一个依次是 0/1/2。",
      "source": "JavaScript 高级程序设计 4th · Ch.4；You Don't Know JS · Scope & Closures；Effective JavaScript · Item 12–13"
    },
    {
      "id": "ch6-3",
      "title": "IIFE、模块模式与单例",
      "minutes": 31,
      "lead": "在 ESM 普及之前，JavaScript 靠函数作用域隔离私有状态：立即调用函数表达式（IIFE）创建局部作用域，返回一个只暴露公开方法的对象。这就是模块模式的雏形。",
      "sections": [
        {
          "h": "IIFE 解决什么问题",
          "p": "IIFE 是一个定义后立即执行的函数表达式：`(function(){ ... })()`。它创建独立作用域，避免变量污染全局；返回值可以暴露 API。\n\nIIFE 不是「必须写的仪式」；现代模块和块级作用域已经能隔离大部分变量，只有在需要立即执行并返回封装对象时才需要它。",
          "code": "const counter = (function () {\n  let value = 0;\n  return {\n    inc() { value += 1; },\n    get() { return value; }\n  };\n})();\ncounter.inc();\nconsole.log(counter.get());\nconsole.log(typeof value);",
          "output": "1\nundefined",
          "tip": "IIFE 的价值是私有闭包和即时初始化，不是单纯「显得高级」。"
        },
        {
          "h": " revealing module 与单例",
          "p": "揭示模块模式先定义私有函数，再返回一个公开方法映射；单例则保证一个模块只创建一个实例。两者都依赖闭包保存状态，但单例还要处理重复调用和测试隔离。\n\n模块级单例在测试中容易互相污染；需要多实例时用工厂函数，不要把所有状态都挂在模块顶层。",
          "code": "const Store = (function () {\n  let instance;\n  function create() {\n    let items = [];\n    return { add(x) { items.push(x); }, all() { return [...items]; } };\n  }\n  return { get() { return instance || (instance = create()); } };\n})();\nStore.get().add(\"a\");\nconsole.log(Store.get().all());",
          "output": "[ \"a\" ]",
          "tip": "单例适合全局配置/缓存，不适合有独立生命周期的业务对象。"
        },
        {
          "h": "闭包与内存",
          "p": "闭包会保留它引用的外层变量，直到闭包本身不可达。常见泄漏：事件监听未解绑、定时器未清理、缓存无限增长、闭包持有大 DOM。\n\n解决不是「不用闭包」，而是明确生命周期：在组件卸载时移除监听、清定时器、给缓存设上限。",
          "code": "function createCache(limit = 2) {\n  const map = new Map();\n  return function (key, value) {\n    if (map.has(key)) map.delete(key);\n    map.set(key, value);\n    if (map.size > limit) map.delete(map.keys().next().value);\n    return map.get(key);\n  };\n}\nconst cache = createCache(2);\ncache(\"a\", 1); cache(\"b\", 2); cache(\"c\", 3);\nconsole.log(cache(\"a\", 4));",
          "output": "4",
          "tip": "闭包不是泄漏的同义词；真正的问题是闭包活得比预期久。"
        }
      ],
      "points": [
        "IIFE 创建独立作用域并返回公开 API。",
        "模块模式用闭包保存私有状态。",
        "闭包要配合生命周期管理，避免无限缓存和未解绑监听。"
      ],
      "practice": "用 IIFE 写一个只有 `add/get` 的计数器，再用 ESM 写同样功能；比较两种方式的私有状态、测试隔离和加载顺序。",
      "source": "JavaScript 权威指南 7th · Ch.8、10；Learning JavaScript Design Patterns · Ch.9；Effective JavaScript · Item 11"
    }
  ]
});

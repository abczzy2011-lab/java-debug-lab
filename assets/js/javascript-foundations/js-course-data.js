/* JavaScript 系统课程数据：6 个模块 / 24 节。
   结构约定：module -> lessons -> sections(h/p/code/output/tip) + points + practice。
   正文为本站改写，代码均可在浏览器控制台或 Node 中运行。 */
window.JS_COURSE_MODULES = [
  {
    number: '01',
    title: '语法与运行环境',
    summary: '先把脚本跑起来，再理解 JavaScript 的值、比较与执行顺序。',
    goals: ['分清原始类型与引用类型', '知道 == 和 === 的边界', '写出有提前返回的清晰分支', '能读异常栈并定位出错行'],
    lessons: [
      {
        id: 'm1-1', title: '变量、原始类型与引用类型', minutes: 22,
        lead: 'JavaScript 的值只有两类：原始类型和对象。变量本身不存“类型”，它存的是值的引用或副本。先分清这一点，后面的赋值、拷贝和比较才不会乱。',
        sections: [
          {
            h: '七种原始类型，加一种对象',
            p: '原始类型是 `string`、`number`、`boolean`、`null`、`undefined`、`symbol`、`bigint`。它们按值传递，赋值时复制的是值本身；对象、数组、函数都是引用类型，变量里放的是指向堆内存的地址。`typeof` 大多能识别原始类型，但 `typeof null` 返回 `object`，这是历史遗留问题；判断 `null` 要直接写 `value === null`。',
            code: [
              'const a = "Ada";',
              'const b = a;',
              'b.toUpperCase(); // 返回新字符串，a 不变',
              '',
              'const user = { name: "Ada" };',
              'const alias = user;',
              'alias.name = "Grace";',
              'console.log(user.name);',
              'console.log(typeof null);'
            ].join('\n'),
            output: 'Grace\nobject',
            tip: '`const` 只锁住变量绑定，不锁对象内部。`const user = {}` 之后仍然可以改 `user.name`；要防修改得用 `Object.freeze`，而且它默认只冻结第一层。'
          },
          {
            h: '复制一层，不等于复制全部',
            p: '展开运算符 `...` 和 `Object.assign` 做的都是浅拷贝：第一层属性被复制，嵌套对象仍然共享同一个引用。改副本里的 `profile.city`，原对象也会跟着变。需要独立副本时用 `structuredClone`，它支持大多数内置类型；函数、DOM 节点、原型链上的自定义行为不会被带过来。',
            code: [
              'const origin = { name: "Ada", profile: { city: "London" } };',
              'const copy = { ...origin };',
              'copy.profile.city = "Paris";',
              'console.log(origin.profile.city); // Paris',
              '',
              'const deep = structuredClone(origin);',
              'deep.profile.city = "Tokyo";',
              'console.log(origin.profile.city, deep.profile.city);'
            ].join('\n'),
            output: 'Paris\nParis Tokyo',
            tip: '判断“拷贝够不够深”，看的是你接下来要改哪一层。只改第一层，浅拷贝就够；要改嵌套对象，就必须深拷贝或手动重建路径。'
          }
        ],
        points: ['原始类型按值复制，对象按引用共享。', '`typeof null === "object"` 是历史坑，判断 null 用 `=== null`。', '浅拷贝只复制第一层；嵌套结构要单独处理。'],
        practice: '把一个含 `profile.address.city` 的对象分别做浅拷贝和 `structuredClone`，修改副本的 city，再打印原对象，确认哪一个会互相影响。'
      },
      {
        id: 'm1-2', title: '运算符、相等比较与类型转换', minutes: 24,
        lead: 'JavaScript 的隐式转换是很多“看起来明明相等”问题的源头。把 `==`、`===`、`??` 和 `||` 的边界记清楚，能省掉大量调试。',
        sections: [
          {
            h: '优先用严格相等',
            p: '`===` 先比较类型，类型不同直接 `false`；`==` 会先做类型转换，所以 `0 == "0"`、`null == undefined` 都可能为真。日常判断统一用 `===`，只有一种常见例外：想同时接受 `null` 和 `undefined` 时，可以写 `value == null`。`NaN` 和任何值都不相等，包括它自己，判断它要用 `Number.isNaN`。',
            code: [
              'console.log(0 == "0");',
              'console.log(0 === "0");',
              'console.log(null == undefined);',
              'console.log(null === undefined);',
              'console.log(NaN === NaN);',
              'console.log(Number.isNaN(NaN));'
            ].join('\n'),
            output: 'true\nfalse\ntrue\nfalse\nfalse\ntrue',
            tip: '`Object.is` 和 `===` 大体一致，但把 `NaN` 视为相等、把 `+0` 和 `-0` 视为不同。React 等库判断依赖变化时会用到它。'
          },
          {
            h: '空值合并与短路求值',
            p: '`||` 在左侧为任意假值时取右侧，`??` 只在左侧是 `null` 或 `undefined` 时取右侧。做默认值时，如果 `0`、`""`、`false` 是合法输入，必须用 `??`，否则会被 `||` 错误覆盖。三元表达式适合简单二选一；分支一多就拆成 `if` 或查表，别把可读性压进一行。',
            code: [
              'const count = 0;',
              'console.log(count || 10);',
              'console.log(count ?? 10);',
              '',
              'const user = { name: "", age: 0 };',
              'console.log(user.name || "匿名");',
              'console.log(user.age ?? 18);'
            ].join('\n'),
            output: '10\n0\n匿名\n0',
            tip: '短路不仅是取值，也能控制执行：`isReady && start()` 只在条件为真时调用。不要把有副作用的代码塞进过长的短路链，读起来容易漏掉执行条件。'
          }
        ],
        points: ['日常比较用 `===`，不要依赖隐式转换。', '`NaN` 用 `Number.isNaN` 判断。', '默认值遇到 `0` / `""` 时用 `??`，不要用 `||`。'],
        practice: '写一个 `formatCount(value, fallback)`，要求 `0` 保留为 `0`，只有 `null` / `undefined` 才使用 fallback；分别用 `||` 和 `??` 实现并比较结果。'
      },
      {
        id: 'm1-3', title: '分支、循环与提前返回', minutes: 22,
        lead: '控制流的目标不是“把逻辑写进去”，而是让人一眼看出正常路径和异常路径。提前返回和合适的循环选择，比嵌套三元更值钱。',
        sections: [
          {
            h: '把异常分支挡在门口',
            p: '函数开头先处理非法参数、空值和权限，再进入主逻辑，叫“卫语句”。它能把嵌套从三四层压到一层。循环方面：数组用 `for...of`，对象键用 `Object.keys` / `Object.entries`，需要下标时用 `entries()`；`for...in` 会遍历可枚举的继承属性，不适合直接处理数组。',
            code: [
              'function levelOf(score) {',
              '  if (typeof score !== "number" || score < 0 || score > 100) return "无效";',
              '  if (score >= 90) return "A";',
              '  if (score >= 60) return "B";',
              '  return "C";',
              '}',
              'console.log(levelOf(95), levelOf(75), levelOf(59), levelOf("90"));',
              '',
              'for (const [index, value] of ["a", "b"].entries()) {',
              '  console.log(index, value);',
              '}'
            ].join('\n'),
            output: 'A B C 无效\n0 a\n1 b',
            tip: '上面最后一项 `levelOf("90")` 返回“无效”，因为严格检查类型。真实项目里要明确“接受数字字符串”还是“只接受数字”，别靠 `==` 混过去。'
          },
          {
            h: 'break、continue 与循环边界',
            p: '`break` 结束整个循环，`continue` 只跳过当前一轮。嵌套循环里 `break` 只跳出最内层；需要跳出多层时用标签，或把内层抽成函数用 `return`。遍历数组时不要一边删元素一边用旧下标，容易跳过相邻项；要过滤就 `filter`，要修改就新建数组。',
            code: [
              'const nums = [3, 8, 12, 5, 20];',
              'for (const n of nums) {',
              '  if (n < 10) continue;',
              '  console.log("大于等于 10:", n);',
              '  if (n > 15) break;',
              '}',
              '',
              'outer: for (const row of [[1, 2], [3, 4]]) {',
              '  for (const n of row) {',
              '    if (n === 3) break outer;',
              '  }',
              '}'
            ].join('\n'),
            output: '大于等于 10: 12\n大于等于 10: 20',
            tip: '标签语法可读性一般，能用函数 `return` 或提前过滤就别用标签。循环里做异步操作时，`forEach` 不会等你，改用 `for...of` 配 `await`。'
          }
        ],
        points: ['卫语句把异常路径放前面，主逻辑保持扁平。', '数组优先 `for...of`，需要下标用 `entries()`。', '循环内异步不要用 `forEach`，用 `for...of` + `await`。'],
        practice: '把一段三层嵌套的 `if` 改写成卫语句版本，要求每个非法输入都有明确返回，正常路径不超过一层缩进。'
      },
      {
        id: 'm1-4', title: '严格模式、异常与调试入口', minutes: 20,
        lead: '严格模式让一些“静默失败”变成显式错误；异常让失败有类型和消息；调试入口让你不用猜。三者合起来，才是能维护的脚本。',
        sections: [
          {
            h: '严格模式与错误类型',
            p: 'ES 模块默认就是严格模式；普通脚本可以在文件或函数顶部写 `"use strict"`。严格模式下给未声明变量赋值、删除不可删除属性、重复参数名都会抛错。抛异常用 `throw new Error("...")`，需要区分类型时用 `TypeError`、`RangeError` 或自定义 `class ValidationError extends Error`。',
            code: [
              '"use strict";',
              'class ValidationError extends Error {',
              '  constructor(message) {',
              '    super(message);',
              '    this.name = "ValidationError";',
              '  }',
              '}',
              'function parseAge(value) {',
              '  const n = Number(value);',
              '  if (!Number.isFinite(n) || n < 0) throw new ValidationError("年龄必须是非负数字");',
              '  return n;',
              '}',
              'try { console.log(parseAge("abc")); }',
              'catch (err) { console.log(err.name, err.message); }'
            ].join('\n'),
            output: 'ValidationError 年龄必须是非负数字',
            tip: '捕获异常后要么处理、要么补充上下文再抛出，最忌讳 `catch (e) {}` 静默吞掉。日志里至少保留 `err.name`、`err.message` 和堆栈。'
          },
          {
            h: '先看栈，再猜原因',
            p: '浏览器控制台的 `console.table` 适合看数组对象，`console.group` 可以折叠一组日志，`debugger` 会在开发者工具里断住。读异常时先看第一行错误类型和消息，再看栈里第一个属于自己项目的文件与行号。不要一上来就改代码；先确认“哪一行、什么值、违反了什么约束”。',
            code: [
              'function divide(a, b) {',
              '  if (b === 0) throw new RangeError("除数不能为 0");',
              '  return a / b;',
              '}',
              'try {',
              '  divide(10, 0);',
              '} catch (err) {',
              '  console.group("divide failed");',
              '  console.log(err.name);',
              '  console.log(err.message);',
              '  console.groupEnd();',
              '}'
            ].join('\n'),
            output: 'divide failed\nRangeError\n除数不能为 0',
            tip: '错误消息要写“违反了哪条规则、期望什么”，不要只写“出错了”。线上环境还要考虑避免把内部路径、密钥、用户隐私写进错误消息。'
          }
        ],
        points: ['严格模式把静默失败变成显式错误。', '抛错要带类型；捕获后不要静默吞掉。', '调试顺序：错误类型 → 消息 → 第一方栈帧 → 当时的值。'],
        practice: '给一个除法函数补上“除数为 0”的 `RangeError`，再用 `try/catch` 打印错误名与消息；最后故意传字符串，观察 `Number` 转换后的行为。'
      }
    ]
  },
  {
    number: '02',
    title: '函数与作用域',
    summary: '函数是 JavaScript 的一等公民；作用域决定变量能被谁看见，闭包决定状态能活多久。',
    goals: ['区分函数声明、表达式与箭头函数', '说清 this 由谁决定', '用闭包保存私有状态', '把回调改写成可读的高阶函数'],
    lessons: [
      {
        id: 'm2-1', title: '函数声明、函数表达式与参数', minutes: 22,
        lead: '三种写法看起来都能调用，但提升行为、this 和构造函数能力不同。先按“是否需要提升、是否依赖 this”选择，而不是凭习惯。',
        sections: [
          {
            h: '声明会提升，表达式不会',
            p: '函数声明 `function foo(){}` 会在作用域准备阶段整体提升，所以可以在声明之前调用；函数表达式赋给 `const` 时，初始化之前处于暂时性死区，提前调用会报错。参数支持默认值、剩余参数和参数解构；默认值只在实参为 `undefined` 时生效，传 `null` 不会触发默认值。',
            code: [
              'console.log(sum(1, 2, 3));',
              'function sum(...nums) {',
              '  return nums.reduce((total, n) => total + n, 0);',
              '}',
              '',
              'const double = function (n) { return n * 2; };',
              'function greet(name = "同学") { return "你好，" + name; }',
              'console.log(double(4), greet(), greet(null));'
            ].join('\n'),
            output: '6\n8 你好，同学 你好，null',
            tip: '默认参数不要引用后面的参数，也不要依赖 `arguments`。需要“必填”语义时，在函数开头显式检查 `undefined` 并抛出清晰错误。'
          },
          {
            h: '参数是值传递，对象传的是引用',
            p: '给函数传对象，函数内部拿到的是同一个对象的引用；修改 `obj.name` 会影响调用方。想保持调用方数据不变，就在函数里新建对象或做拷贝。返回多个值时用对象或数组解构，别用“改传入参数”这种隐式输出。',
            code: [
              'function rename(user, name) {',
              '  return { ...user, name };',
              '}',
              'const before = { name: "Ada", age: 36 };',
              'const after = rename(before, "Grace");',
              'console.log(before.name, after.name);',
              '',
              'function splitName(full) {',
              '  const [first, last = ""] = full.split(" ");',
              '  return { first, last };',
              '}',
              'console.log(splitName("Ada Lovelace"));'
            ].join('\n'),
            output: 'Ada Grace\n{ first: \'Ada\', last: \'Lovelace\' }',
            tip: '“函数改了传入对象”是协作里的隐形坑。约定纯函数就返回新对象；确实要改，就在函数名和注释里写清楚。'
          }
        ],
        points: ['函数声明提升，`const` 函数表达式不提升。', '默认参数只对 `undefined` 生效，`null` 不会触发。', '对象参数传引用；要纯函数就返回新对象。'],
        practice: '写一个 `rename(user, name)` 返回新对象，再写一个会修改原对象的版本；调用后分别打印原对象，比较差异。'
      },
      {
        id: 'm2-2', title: '箭头函数与 this', minutes: 24,
        lead: '箭头函数不绑定自己的 this、arguments 和 super，它从外层词法环境借。普通函数的 this 则由调用方式决定。把这两件事分开，this 就不再玄学。',
        sections: [
          {
            h: 'this 看调用，不看定义',
            p: '普通函数里，`obj.method()` 的 this 是 `obj`；单独取出 `const fn = obj.method; fn()` 后 this 变成 `undefined`（严格模式）或全局对象。`call` / `apply` / `bind` 可以显式指定 this。箭头函数没有自己的 this，写在哪里就继承哪里的 this，适合回调和需要保留外层上下文的场景。',
            code: [
              'const team = {',
              '  name: "U15",',
              '  players: ["Ada", "Grace"],',
              '  list() {',
              '    return this.players.map((p) => this.name + ":" + p);',
              '  }',
              '};',
              'console.log(team.list().join(", "));',
              '',
              'const loose = team.list;',
              'try { console.log(loose()); } catch (err) { console.log(err.name); }'
            ].join('\n'),
            output: 'U15:Ada, U15:Grace\nTypeError',
            tip: '对象方法用简写语法 `list(){}`，不要在方法里随手用箭头函数再指望 this 指向对象。箭头函数也不能当构造函数，`new (() => {})` 会抛错。'
          },
          {
            h: '回调里最容易踩的 this',
            p: '`setTimeout(function(){ this.name })` 里的 this 不是外层对象；改成箭头函数就会继承外层 this。事件监听里需要动态拿到触发元素时，用 `event.currentTarget`，不要依赖 this。React 类组件时代的 `bind(this)` 问题，现在更多被箭头函数和闭包替代。',
            code: [
              'const widget = {',
              '  name: "面板",',
              '  start() {',
              '    setTimeout(() => console.log(this.name), 0);',
              '  }',
              '};',
              'widget.start();',
              '',
              'const button = { label: "保存", click: () => console.log(this); };',
              'button.click();'
            ].join('\n'),
            output: '面板\nundefined',
            tip: '箭头函数里的 this 是定义时的外层 this；在模块顶层就是 `undefined`。需要动态 this 时用普通函数，不需要时用箭头函数，别混着猜。'
          }
        ],
        points: ['普通函数的 this 由调用方式决定。', '箭头函数继承外层 this，不能当构造函数。', '回调保留外层上下文时优先箭头函数。'],
        practice: '把对象方法里的 `setTimeout(function(){...})` 改成箭头函数，验证 this 是否正确；再把方法单独取出来调用，观察 this 丢失后的报错。'
      },
      {
        id: 'm2-3', title: '词法作用域、闭包与私有状态', minutes: 24,
        lead: '闭包不是高级技巧，而是“函数记住定义时的变量环境”。计数器、缓存、防抖和模块私有变量，都是它的日常用法。',
        sections: [
          {
            h: '函数带着它的出生环境',
            p: '内层函数可以访问外层函数的变量，即使外层函数已经返回。外层变量不会被垃圾回收，因为闭包还引用着它。这既能保存状态，也可能造成内存泄漏。用 `let` 在循环里创建块级作用域，每一轮都有独立的变量；用 `var` 则共享同一个变量。',
            code: [
              'function createCounter() {',
              '  let count = 0;',
              '  return {',
              '    inc() { count += 1; return count; },',
              '    value() { return count; }',
              '  };',
              '}',
              'const counter = createCounter();',
              'counter.inc();',
              'counter.inc();',
              'console.log(counter.value());',
              '',
              'const fns = [];',
              'for (let i = 0; i < 3; i += 1) fns.push(() => i);',
              'console.log(fns.map((fn) => fn()).join(","));'
            ].join('\n'),
            output: '2\n0,1,2',
            tip: '闭包保存的是变量绑定，不是当时的值。循环里用 `var` 得到的是最后一轮值；用 `let` 才有每轮独立绑定。'
          },
          {
            h: '闭包做缓存，也要设边界',
            p: '把计算结果缓存在闭包里，可以避免重复计算；但缓存必须有上限或失效策略，否则会一直占内存。防抖和节流也依赖闭包保存计时器。写这类函数时，最好同时提供 `cancel` 或 `clear` 方法，让调用方能释放资源。',
            code: [
              'function memoize(fn) {',
              '  const cache = new Map();',
              '  return function (key) {',
              '    if (cache.has(key)) return cache.get(key);',
              '    const value = fn(key);',
              '    cache.set(key, value);',
              '    return value;',
              '  };',
              '}',
              'const square = memoize((n) => n * n);',
              'console.log(square(4), square(4), square(5));'
            ].join('\n'),
            output: '16 16 25',
            tip: '缓存键要能唯一标识输入；对象作为键时用 `Map`，不要用字符串拼接。无上限缓存只适合确定的小输入域。'
          }
        ],
        points: ['闭包让函数记住定义时的变量环境。', '`let` 在循环里创建每轮独立绑定。', '缓存和计时器都要有释放或上限策略。'],
        practice: '实现一个带 `inc` / `value` / `reset` 的计数器闭包，再给 `memoize` 加上最大缓存条数，超过时删除最早的一条。'
      },
      {
        id: 'm2-4', title: '回调、高阶函数与组合', minutes: 22,
        lead: '高阶函数接收函数或返回函数。它把“做什么”和“怎么遍历”分开，让代码从一堆循环变成一条可读的数据流。',
        sections: [
          {
            h: '回调是控制反转，也是错误源',
            p: '把函数传给另一个函数，执行时机就交给了对方。同步回调里的异常还能被外层 `try/catch` 捕获；异步回调抛错则不会，必须通过回调参数、Promise 或事件机制传递。写高阶函数时要明确：回调会被调用几次、参数是什么、返回值怎么处理。',
            code: [
              'function repeat(times, action) {',
              '  for (let i = 0; i < times; i += 1) action(i);',
              '}',
              'repeat(3, (i) => console.log("第" + (i + 1) + "次"));',
              '',
              'function withLogging(fn) {',
              '  return function (...args) {',
              '    console.log("调用参数", args);',
              '    return fn(...args);',
              '  };',
              '}',
              'const add = withLogging((a, b) => a + b);',
              'console.log(add(2, 3));'
            ].join('\n'),
            output: '第1次\n第2次\n第3次\n调用参数 [ 2, 3 ]\n5',
            tip: '不要给回调塞太多职责。一个回调只做一件事；需要错误处理就用 `try/catch` 包住回调体，或改成 Promise 链。'
          },
          {
            h: '组合小函数，别造巨型回调',
            p: '把“取字段、过滤、排序、格式化”拆成小函数，再用 `map` / `filter` / `sort` 串起来。组合时注意每个函数是否返回新值、是否修改原数组。`pipe` 和 `compose` 只是把调用顺序显式化，不是必须引入的库能力。',
            code: [
              'const users = [',
              '  { name: "Ada", score: 88 },',
              '  { name: "Grace", score: 95 },',
              '  { name: "Linus", score: 72 }',
              '];',
              'const topNames = users',
              '  .filter((u) => u.score >= 80)',
              '  .sort((a, b) => b.score - a.score)',
              '  .map((u) => u.name);',
              'console.log(topNames.join(", "));'
            ].join('\n'),
            output: 'Grace, Ada',
            tip: '`sort` 会原地修改数组。对共享数据排序前先 `[...users].sort(...)`，否则调用方会看到顺序被改掉。'
          }
        ],
        points: ['高阶函数把遍历和业务动作分开。', '异步回调的错误不能靠外层 `try/catch` 接。', '组合前先确认每个步骤是否修改原数据。'],
        practice: '把一组用户按分数从高到低排序并取前三名，要求不修改原数组；再用 `withLogging` 包一层，打印每次调用的参数。'
      }
    ]
  },
  {
    number: '03',
    title: '对象与原型',
    summary: '对象是 JavaScript 的组织单位；原型链解释继承，class 只是更清楚的写法。',
    goals: ['熟练使用解构与展开', '理解自有属性与原型属性', '用 class 和私有字段封装状态', '知道冻结、拷贝和属性描述符的边界'],
    lessons: [
      {
        id: 'm3-1', title: '对象字面量、解构与展开', minutes: 22,
        lead: '对象字面量是日常最常用的数据结构。解构让你按名字取值，展开让你复制并覆盖字段；两者都要注意浅拷贝和键冲突。',
        sections: [
          {
            h: '解构是取值，不是建引用',
            p: '`const { name, age } = user` 会把字段值复制到新变量；如果字段本身是对象，变量拿到的是同一个引用。剩余属性 `...rest` 收集未取出的自有可枚举属性。展开多个对象时，后面的同名键覆盖前面的；这适合做“默认配置 + 用户配置”。',
            code: [
              'const defaults = { theme: "dark", lang: "zh", pageSize: 20 };',
              'const userConfig = { theme: "light" };',
              'const config = { ...defaults, ...userConfig };',
              'console.log(config);',
              '',
              'const user = { name: "Ada", age: 36, city: "London" };',
              'const { name, ...rest } = user;',
              'console.log(name, rest);'
            ].join('\n'),
            output: '{ theme: \'light\', lang: \'zh\', pageSize: 20 }\nAda { age: 36, city: \'London\' }',
            tip: '展开只复制自有可枚举属性，原型上的方法不会跟过来。类实例展开后通常只剩字段，方法仍在原型上，别指望展开得到完整实例。'
          },
          {
            h: '可选链与空值合并',
            p: '`user?.profile?.city` 在中间为 `null` / `undefined` 时直接返回 `undefined`，不会继续访问。它只处理空值，不处理空字符串或 `0`；配合 `??` 给默认值最稳。可选链不要滥用：如果某个字段在业务上必须存在，就应该在入口校验，而不是到处写 `?.` 掩盖数据问题。',
            code: [
              'const user = { profile: null };',
              'console.log(user?.profile?.city);',
              'console.log(user?.profile?.city ?? "未填写");',
              '',
              'const settings = { pageSize: 0 };',
              'console.log(settings.pageSize ?? 20);',
              'console.log(settings.pageSize || 20);'
            ].join('\n'),
            output: 'undefined\n未填写\n0\n20',
            tip: '可选链只能读，不能赋值。`user?.name = "Ada"` 是语法错误；要写就先判断 `if (user) user.name = "Ada"`。'
          }
        ],
        points: ['解构复制的是字段值，嵌套对象仍是引用。', '展开后面的同名键覆盖前面的。', '可选链处理空值，不处理 `0` / `""`。'],
        practice: '合并两份配置，要求用户配置覆盖默认配置；再用解构取出 `theme`，把剩余字段放进 `rest` 并打印。'
      },
      {
        id: 'm3-2', title: '原型链、继承与 Object.create', minutes: 26,
        lead: '每个对象都有一个内部原型，属性找不到时会顺着原型链向上找。理解这条链，才能解释“方法为什么在实例上找不到却能用”。',
        sections: [
          {
            h: '自有属性与继承属性',
            p: '`obj.hasOwnProperty(key)` 只检查对象自己；`key in obj` 会检查整条原型链。遍历时用 `Object.keys` 拿自有可枚举键，用 `Object.getPrototypeOf` 看原型。`Object.create(proto)` 直接创建一个以指定对象为原型的新对象，适合做轻量继承或字典对象。',
            code: [
              'const base = {',
              '  greet() { return "Hi " + this.name; }',
              '};',
              'const child = Object.create(base);',
              'child.name = "Ada";',
              'console.log(child.greet());',
              'console.log(Object.getPrototypeOf(child) === base);',
              'console.log("greet" in child, child.hasOwnProperty("greet"));'
            ].join('\n'),
            output: 'Hi Ada\ntrue\ntrue false',
            tip: '不要把用户输入直接当键查普通对象，`__proto__`、`constructor` 可能命中原型。用 `Object.create(null)` 或 `Map` 做纯字典。'
          },
          {
            h: '原型链的尽头是 null',
            p: '普通对象的原型最终指向 `Object.prototype`，再往上就是 `null`。修改 `Object.prototype` 会影响所有普通对象，这是非常危险的操作。需要扩展行为时，优先组合、工具函数或 class，而不是往全局原型上挂方法。',
            code: [
              'const obj = {};',
              'console.log(Object.getPrototypeOf(obj) === Object.prototype);',
              'console.log(Object.getPrototypeOf(Object.prototype));',
              '',
              'const dict = Object.create(null);',
              'dict["toString"] = "自定义值";',
              'console.log(dict.toString);'
            ].join('\n'),
            output: 'true\nnull\n自定义值',
            tip: '`Object.create(null)` 创建的对象没有原型，不能调用 `hasOwnProperty` 等方法；需要时用 `Object.hasOwn(dict, key)`。'
          }
        ],
        points: ['属性查找会沿原型链向上。', '`in` 查整条链，`hasOwnProperty` 只查自有。', '不要修改 `Object.prototype`。'],
        practice: '用 `Object.create` 建一个带 `greet` 方法的原型对象，再创建两个实例并设置不同 `name`，打印各自的方法结果。'
      },
      {
        id: 'm3-3', title: 'class、构造器与私有字段', minutes: 26,
        lead: 'class 是原型继承的语法糖，但私有字段、静态方法和 getter 是真实能力。用 class 封装“状态 + 行为”，比散落的函数更清楚。',
        sections: [
          {
            h: '实例字段与私有字段',
            p: '`class` 里的 `constructor` 负责初始化；`#field` 是真正的私有字段，外部访问会直接语法错误。`static` 属于类本身，不属于实例。`get` / `set` 可以拦截读写，但不要在 getter 里做重计算或副作用。方法默认不在实例上，而在 `prototype` 上。',
            code: [
              'class Timer {',
              '  #seconds = 0;',
              '  constructor(label) { this.label = label; }',
              '  tick() { this.#seconds += 1; return this.#seconds; }',
              '  get value() { return this.#seconds; }',
              '  static create(label) { return new Timer(label); }',
              '}',
              'const timer = Timer.create("训练");',
              'timer.tick();',
              'console.log(timer.label, timer.value);',
              'console.log(Object.keys(timer));'
            ].join('\n'),
            output: '训练 1\n[]',
            tip: '私有字段必须在类体里声明；不能从外部 `delete` 或枚举。需要调试时提供显式的 `toJSON()` 或 `snapshot()`，别为了省事把私有字段改成公有。'
          },
          {
            h: 'this 绑定与继承',
            p: '把实例方法单独取出来调用，this 会丢失。需要稳定绑定时，在构造函数里 `this.handle = this.handle.bind(this)`，或用箭头函数字段。`extends` 继承时，子类构造器必须先 `super()` 再使用 this。方法重写后需要调父类实现，用 `super.method()`。',
            code: [
              'class Counter {',
              '  constructor() { this.count = 0; this.inc = this.inc.bind(this); }',
              '  inc() { this.count += 1; return this.count; }',
              '}',
              'const counter = new Counter();',
              'const inc = counter.inc;',
              'inc(); inc();',
              'console.log(counter.count);',
              '',
              'class StepCounter extends Counter {',
              '  inc() { return super.inc() + 10; }',
              '}',
              'const step = new StepCounter();',
              'console.log(step.inc());'
            ].join('\n'),
            output: '2\n11',
            tip: '继承层次超过两三层就要警惕。多数业务组合比继承更清晰；继承适合“确实是同一种东西”的场景。'
          }
        ],
        points: ['`#field` 是真正的私有字段，外部不可访问。', '实例方法在 prototype 上，不在每个实例上。', '方法单独调用会丢 this，需要 bind 或箭头字段。'],
        practice: '写一个 `BankAccount` 类，用私有字段保存余额，提供 `deposit`、`withdraw` 和只读 `balance`；取款超过余额时抛出 `RangeError`。'
      },
      {
        id: 'm3-4', title: '属性描述符、冻结与拷贝边界', minutes: 24,
        lead: '对象属性不只有“值”，还有可写、可枚举、可配置三个开关。冻结和拷贝的很多困惑，根源都在这里。',
        sections: [
          {
            h: '属性描述符决定可见性',
            p: '`Object.defineProperty` 可以定义 `value`、`writable`、`enumerable`、`configurable`，也可以定义 getter / setter。`Object.keys` 只返回可枚举属性；`JSON.stringify` 也只序列化可枚举的自有属性。`Object.freeze` 默认把第一层属性设为不可写、不可配置，但不会递归冻结嵌套对象。',
            code: [
              'const config = { mode: "dark" };',
              'Object.freeze(config);',
              'config.mode = "light";',
              'console.log(config.mode, Object.isFrozen(config));',
              '',
              'const hidden = {};',
              'Object.defineProperty(hidden, "token", { value: "abc", enumerable: false });',
              'console.log(hidden.token, Object.keys(hidden));'
            ].join('\n'),
            output: 'dark true\nabc []',
            tip: '严格模式下改冻结属性会抛 `TypeError`，非严格模式静默失败。线上排查“赋值没生效”时，先检查对象是否被冻结或属性是否只读。'
          },
          {
            h: '深拷贝不是万能钥匙',
            p: '`structuredClone` 能处理对象、数组、Map、Set、Date、RegExp 等，但不会复制函数、原型链、DOM 节点和自定义类方法。JSON 方案会丢 `undefined`、函数、Symbol，还会把 Date 变成字符串。选择拷贝方式前，先明确数据里有什么类型、需不需要保留原型。',
            code: [
              'const source = {',
              '  date: new Date("2026-01-01"),',
              '  map: new Map([["a", 1]]),',
              '  nested: { n: 1 }',
              '};',
              'const clone = structuredClone(source);',
              'clone.nested.n = 2;',
              'console.log(source.nested.n, clone.nested.n);',
              'console.log(clone.date instanceof Date, clone.map.get("a"));',
              '',
              'const viaJson = JSON.parse(JSON.stringify(source));',
              'console.log(viaJson.date instanceof Date);'
            ].join('\n'),
            output: '1 2\ntrue 1\nfalse',
            tip: '要保留 class 实例，拷贝后需要手动重建原型或提供 `clone()` 方法；不要对含函数、DOM、循环引用的数据使用 JSON 深拷贝。'
          }
        ],
        points: ['属性有可写、可枚举、可配置三个开关。', '`Object.freeze` 默认只冻结第一层。', '`structuredClone` 不复制函数、原型和 DOM。'],
        practice: '创建一个含 `Date`、`Map` 和嵌套对象的对象，分别用 `structuredClone` 与 JSON 方式复制，打印类型和嵌套修改后的原对象，比较差异。'
      }
    ]
  },
  {
    number: '04',
    title: '数组与数据处理',
    summary: '把循环改写成数据流：增删改查、映射筛选归并、排序分组和惰性迭代。',
    goals: ['区分会修改和不会修改的数组方法', '熟练组合 map / filter / reduce', '写出稳定的排序与分组', '理解迭代器与生成器'],
    lessons: [
      {
        id: 'm4-1', title: '增删改查与不可变更新', minutes: 24,
        lead: '数组方法分成两派：修改原数组的（push、pop、splice、sort、reverse）和返回新数组的（map、filter、slice、concat）。状态管理里优先用后者。',
        sections: [
          {
            h: '先认清哪些方法会改原数组',
            p: '`push` / `pop` / `shift` / `unshift` / `splice` / `sort` / `reverse` 都会原地修改。`slice` 返回新数组，`at()` 支持负下标读取，`includes` 判断存在。不可变更新常用展开、`map`、`filter`、`toSpliced`（较新）或先复制再改。',
            code: [
              'const list = [1, 2, 3];',
              'const added = [...list, 4];',
              'const removed = list.filter((n) => n !== 2);',
              'const updated = list.map((n) => (n === 2 ? 20 : n));',
              'console.log(list.join(","));',
              'console.log(added.join(","), removed.join(","), updated.join(","));',
              'console.log(list.at(-1));'
            ].join('\n'),
            output: '1,2,3\n1,2,3,4 1,3 1,20,3\n3',
            tip: '`splice` 返回被删除的元素，不是修改后的数组；`slice` 和 `splice` 只差一个字母，行为完全不同。'
          },
          {
            h: '按 id 更新一项，不要整表重建',
            p: '列表更新常见需求是把某个 id 的字段改掉，同时保持其他项引用不变。用 `map` 找到目标项返回新对象，其他项原样返回即可。删除用 `filter`；新增用展开或 `toSpliced`。这样 React、Vue 的依赖比较才能看出真正变化的项。',
            code: [
              'const todos = [',
              '  { id: 1, text: "写作业", done: false },',
              '  { id: 2, text: "练球", done: true }',
              '];',
              'const next = todos.map((todo) =>',
              '  todo.id === 1 ? { ...todo, done: true } : todo',
              ');',
              'console.log(next[0].done, next[1] === todos[1]);',
              'console.log(todos[0].done);'
            ].join('\n'),
            output: 'true true\nfalse',
            tip: '不可变更新不等于每次全量深拷贝。只复制变化的那一项和路径上的容器，其他引用保持不变，性能更好。'
          }
        ],
        points: ['`sort` / `splice` / `push` 会改原数组。', '`slice` 返回新数组，`at()` 支持负下标。', '按 id 更新用 `map`，只复制变化项。'],
        practice: '把一个待办列表里 id 为 1 的 `done` 改成 true，要求原数组不变、其他项的引用也不变；再实现按 id 删除。'
      },
      {
        id: 'm4-2', title: 'map、filter、reduce 的组合', minutes: 26,
        lead: '这三个方法是数据处理的骨架：map 做一对一转换，filter 做筛选，reduce 做归并。组合顺序不同，结果和性能也不同。',
        sections: [
          {
            h: '先筛选，再映射，最后归并',
            p: '`map` 返回等长新数组，`filter` 返回长度可能变小的新数组，`reduce` 把数组压成一个值。链式调用时，先 `filter` 减少数据量，再 `map` 转换，最后 `reduce` 汇总，通常更省。每个回调都应是纯函数，不要在 `map` 里改外部变量。',
            code: [
              'const orders = [',
              '  { id: 1, total: 30, paid: true },',
              '  { id: 2, total: 50, paid: true },',
              '  { id: 3, total: 20, paid: false }',
              '];',
              'const paidTotal = orders',
              '  .filter((order) => order.paid)',
              '  .map((order) => order.total)',
              '  .reduce((sum, total) => sum + total, 0);',
              'console.log(paidTotal);'
            ].join('\n'),
            output: '80',
            tip: '`reduce` 一定要给初始值。空数组不传初始值会抛 `TypeError`；传了初始值，空数组会安全返回初始值。'
          },
          {
            h: 'reduce 能做的事比求和多',
            p: '`reduce` 可以分组、去重、统计词频、把数组转成对象。关键是明确累加器的形状：是数字、数组还是对象。累加器是对象时，每次返回新对象还是原地改，要根据是否需要不可变决定。',
            code: [
              'const orders = [',
              '  { id: 1, paid: true },',
              '  { id: 2, paid: true },',
              '  { id: 3, paid: false }',
              '];',
              'const words = ["a", "b", "a", "c", "b", "a"];',
              'const counts = words.reduce((acc, word) => {',
              '  acc[word] = (acc[word] || 0) + 1;',
              '  return acc;',
              '}, {});',
              'console.log(counts);',
              '',
              'const grouped = orders.reduce((acc, order) => {',
              '  const key = order.paid ? "paid" : "unpaid";',
              '  (acc[key] ||= []).push(order.id);',
              '  return acc;',
              '}, {});',
              'console.log(grouped);'
            ].join('\n'),
            output: '{ a: 3, b: 2, c: 1 }\n{ paid: [ 1, 2 ], unpaid: [ 3 ] }',
            tip: '`||=` 只在左侧为假值时赋值，适合初始化分组数组；如果键可能是 `0` 或 `""`，用 `??=` 更准确。'
          }
        ],
        points: ['`map` 一对一，`filter` 筛选，`reduce` 归并。', '`reduce` 必须给初始值。', '分组和统计都能用 `reduce`，但要明确累加器形状。'],
        practice: '给定一组订单，分别计算已支付总额、按支付状态分组、统计每个用户的下单次数；要求不修改原数组。'
      },
      {
        id: 'm4-3', title: '排序、查找与分组统计', minutes: 24,
        lead: '默认排序按字符串比较，`10` 会排在 `2` 后面。数值排序必须传比较函数；查找要区分“第一个匹配”和“是否存在”。',
        sections: [
          {
            h: 'sort 会改原数组，而且默认按字典序',
            p: '`sort()` 不传比较函数时，会把元素转成字符串按 UTF-16 顺序排，所以 `[10, 2, 1].sort()` 得到 `[1, 10, 2]`。数值升序写 `(a, b) => a - b`，降序写 `(a, b) => b - a`。排序前先复制数组，避免影响共享数据。',
            code: [
              'const scores = [88, 72, 95, 60];',
              'const ranked = [...scores].sort((a, b) => b - a);',
              'console.log(ranked.join(","));',
              'console.log(scores.join(","));',
              '',
              'const users = [',
              '  { name: "Ada", score: 88 },',
              '  { name: "Grace", score: 95 }',
              '];',
              'users.sort((a, b) => b.score - a.score);',
              'console.log(users.map((u) => u.name).join(","));'
            ].join('\n'),
            output: '95,88,72,60\n88,72,95,60\nGrace,Ada',
            tip: '比较函数返回负数表示 a 在前，正数表示 b 在前，0 表示相等。不要写 `return a > b`，布尔值转数字只有 0/1，排序会不稳定。'
          },
          {
            h: 'find、some、every 各管什么',
            p: '`find` 返回第一个匹配元素，找不到返回 `undefined`；`findIndex` 返回下标；`some` 判断是否存在至少一个匹配；`every` 判断是否全部匹配。`includes` 只做严格相等判断，不能传条件函数。空数组上 `every` 返回 `true`，这是数学上的“空真”，写逻辑时要注意。',
            code: [
              'const nums = [3, 8, 12, 5];',
              'console.log(nums.find((n) => n > 10));',
              'console.log(nums.findIndex((n) => n > 10));',
              'console.log(nums.some((n) => n < 0));',
              'console.log(nums.every((n) => n > 0));',
              'console.log([].every((n) => n > 0));'
            ].join('\n'),
            output: '12\n2\nfalse\ntrue\ntrue',
            tip: '要同时拿元素和下标，用 `findIndex` 再取；要拿所有匹配项，用 `filter`。别用 `find` 循环里再查一次下标。'
          }
        ],
        points: ['`sort` 原地修改，默认按字符串比较。', '数值排序必须传 `(a,b)=>a-b` 或降序版本。', '`find` 返回元素，`findIndex` 返回下标，`some` / `every` 返回布尔。'],
        practice: '给一个成绩数组做降序排名，要求不改原数组；再找出第一个不及格分数和它的下标，并判断是否全部及格。'
      },
      {
        id: 'm4-4', title: '迭代器、生成器与惰性序列', minutes: 24,
        lead: '可迭代协议让 `for...of`、展开和数组解构都能工作；生成器用 `yield` 一次产出一个值，适合大序列和无限序列。',
        sections: [
          {
            h: '可迭代对象与迭代器',
            p: '一个对象实现 `Symbol.iterator` 方法，返回带 `next()` 的迭代器，就是可迭代对象。`next()` 返回 `{ value, done }`。数组、字符串、Map、Set 都内置了迭代器。手写迭代器适合理解协议，实际开发优先用生成器。',
            code: [
              'const range = {',
              '  from: 1,',
              '  to: 5,',
              '  [Symbol.iterator]() {',
              '    let current = this.from;',
              '    const last = this.to;',
              '    return {',
              '      next() {',
              '        if (current > last) return { done: true };',
              '        return { value: current++, done: false };',
              '      }',
              '    };',
              '  }',
              '};',
              'console.log([...range].join(","));'
            ].join('\n'),
            output: '1,2,3,4,5',
            tip: '迭代器通常是一次性的；迭代结束后再调用 `next()` 仍返回 `done: true`。需要重复遍历就重新创建迭代器。'
          },
          {
            h: '生成器把状态保存在函数里',
            p: '`function*` 加 `yield` 会暂停并保留局部变量，下一次 `next()` 从暂停处继续。生成器适合分页拉取、逐行读大文件、无限序列和管道处理。它不会自动执行，必须被消费；忘记消费就什么也不会发生。',
            code: [
              'function* range(start, end, step = 1) {',
              '  for (let i = start; i < end; i += step) yield i;',
              '}',
              'console.log([...range(1, 6, 2)].join(","));',
              '',
              'const iterator = range(3, 6)[Symbol.iterator]();',
              'console.log(iterator.next().value);',
              'console.log(iterator.next().value);',
              'console.log(iterator.next().done);'
            ].join('\n'),
            output: '1,3,5\n3\n4\nfalse',
            tip: '生成器里的 `return` 会结束迭代并设置 `done: true`，返回值放进 `value`。不要在生成器里做不可预期的副作用，消费次数决定副作用次数。'
          }
        ],
        points: ['可迭代对象实现 `Symbol.iterator`。', '生成器用 `yield` 暂停并保留局部状态。', '生成器是惰性的，不被消费就不执行。'],
        practice: '写一个生成器 `take(iterable, n)`，从任意可迭代对象中取前 n 项；再用它处理一个无限自然数序列，验证不会卡死。'
      }
    ]
  },
  {
    number: '05',
    title: 'DOM 与事件',
    summary: '让页面真正动起来：选择节点、绑定事件、处理表单、保存页面状态。',
    goals: ['安全地创建和修改 DOM', '用事件委托处理动态节点', '读取表单并做基本校验', '用 localStorage 保存轻量状态'],
    lessons: [
      {
        id: 'm5-1', title: '选择、创建与修改 DOM', minutes: 24,
        lead: 'DOM 操作的核心是“先拿到节点，再改它的属性、文本或结构”。优先用 `textContent`，少用 `innerHTML`，避免把用户输入当 HTML 执行。',
        sections: [
          {
            h: 'querySelector 与 createElement',
            p: '`querySelector` 返回第一个匹配元素，`querySelectorAll` 返回静态 NodeList（不会随 DOM 变化自动更新）。创建节点用 `document.createElement`，设置文本用 `textContent`，插入用 `append` / `prepend` / `before` / `after`。批量插入先用 `DocumentFragment` 组装，再一次性挂到页面，减少重排。',
            code: [
              'const list = document.querySelector("#list");',
              'const item = document.createElement("li");',
              'item.textContent = "新任务";',
              'item.className = "task";',
              'list.append(item);',
              'console.log(list.children.length); // 假设原本有 1 个 li'
            ].join('\n'),
            output: '2',
            tip: '`innerHTML` 会重新解析整段 HTML，既慢又有 XSS 风险。只有完全可信的静态模板才考虑它；用户输入一律 `textContent`。'
          },
          {
            h: 'classList 与 dataset',
            p: '`classList.add/remove/toggle/contains` 比直接拼 `className` 更安全，不会把其他类名覆盖掉。`dataset` 读写 `data-*` 属性，适合在节点上挂小段业务标识。复杂状态不要全塞进 DOM 属性，仍应放在 JavaScript 状态里，DOM 只做展示。',
            code: [
              'const card = document.querySelector(".card");',
              'card.classList.add("is-active");',
              'card.classList.toggle("is-hidden");',
              'card.dataset.id = "42";',
              'console.log(card.classList.contains("is-active"));',
              'console.log(card.dataset.id);'
            ].join('\n'),
            output: 'true\n42',
            tip: '`dataset` 的值永远是字符串。存数字要显式 `Number(...)`；存对象要 `JSON.stringify`，读的时候再解析并处理失败。'
          }
        ],
        points: ['`querySelectorAll` 返回静态列表。', '用户输入用 `textContent`，不要拼 `innerHTML`。', '`classList` 比改 `className` 安全，`dataset` 值都是字符串。'],
        practice: '用 `createElement` 和 `DocumentFragment` 一次性插入 10 个列表项，每项带 `data-id` 和不同文本；再切换其中一项的 `is-active` 类。'
      },
      {
        id: 'm5-2', title: '事件冒泡、委托与解绑', minutes: 26,
        lead: '事件从目标元素向上冒泡，所以可以在父元素统一监听，再判断真正触发的是谁。这叫事件委托，特别适合动态增删的列表。',
        sections: [
          {
            h: 'target 与 currentTarget',
            p: '`event.target` 是实际触发的元素，`event.currentTarget` 是当前绑定监听器的元素。事件委托里用 `target.closest("button[data-id]")` 找到最近的按钮，再读 `dataset.id`。`preventDefault` 阻止浏览器默认行为，`stopPropagation` 阻止继续冒泡；后者滥用会让外层监听失效。',
            code: [
              'const list = document.querySelector("#list");',
              'list.addEventListener("click", (event) => {',
              '  const btn = event.target.closest("button[data-id]");',
              '  if (!btn) return;',
              '  console.log("删除", btn.dataset.id);',
              '});'
            ].join('\n'),
            output: '删除 3',
            tip: '委托监听要确认事件确实冒泡。`focus`、`blur` 不冒泡，用 `focusin` / `focusout`；需要捕获阶段时给 `addEventListener` 第三参传 `true`。'
          },
          {
            h: '解绑要拿到同一个函数引用',
            p: '`removeEventListener` 必须传入与绑定时相同的函数引用、相同捕获标志，匿名函数解绑不了。一次性事件用 `{ once: true }`；滚动、触摸等高频事件用 `{ passive: true }` 提升性能。组件卸载时要清理定时器、监听器和请求，避免内存泄漏。',
            code: [
              'function onClick() { console.log("点击一次"); }',
              'const button = document.querySelector("#save");',
              'button.addEventListener("click", onClick, { once: true });',
              '',
              'const controller = new AbortController();',
              'window.addEventListener("resize", () => console.log("resize"), { signal: controller.signal });',
              'controller.abort();'
            ].join('\n'),
            output: '点击一次',
            tip: '`AbortController` 可以一次性移除同一信号上的多个监听器，适合组件销毁。不要在每个组件里手动记一堆解绑调用。'
          }
        ],
        points: ['`target` 是触发元素，`currentTarget` 是监听元素。', '委托用 `closest` 找到目标，再读 `dataset`。', '解绑必须传同一个函数引用。'],
        practice: '给一个动态列表做删除按钮委托：点击任意按钮打印对应 id；再给保存按钮绑定只执行一次的监听器。'
      },
      {
        id: 'm5-3', title: '表单、校验与用户输入', minutes: 24,
        lead: '表单提交先 `preventDefault`，再用 `FormData` 或元素值读取数据。校验要同时做前端提示和后端约束，前端校验只是体验，不是安全边界。',
        sections: [
          {
            h: 'FormData 与提交事件',
            p: '`new FormData(form)` 会收集带 `name` 的表单控件；`Object.fromEntries(data)` 可以快速转成普通对象，但同名多选会只保留最后一个。多选、文件要用 `getAll` 或单独处理。提交前检查 `form.checkValidity()`，自定义规则用 `setCustomValidity` 或自己的错误对象。',
            code: [
              'const form = document.querySelector("#signup");',
              'form.addEventListener("submit", (event) => {',
              '  event.preventDefault();',
              '  const data = new FormData(form);',
              '  console.log(Object.fromEntries(data));',
              '});'
            ].join('\n'),
            output: "{ name: 'Ada', email: 'ada@example.com' }",
            tip: '`FormData` 只收集有 `name` 的控件；禁用的控件不会提交。文件字段拿到的是 `File`，不是路径字符串。'
          },
          {
            h: '输入值都是字符串',
            p: '`input.value` 永远是字符串，数字要显式转换并检查 `Number.isFinite`。复选框用 `checked`，多选用 `selectedOptions`。输入事件 `input` 在每次键入时触发，`change` 在失焦或确认后触发；搜索建议通常用 `input` 加防抖。',
            code: [
              'const ageInput = document.querySelector("#age");',
              'const age = Number(ageInput.value);',
              'if (!Number.isFinite(age) || age < 0) {',
              '  console.log("年龄必须是非负数字");',
              '} else {',
              '  console.log("年龄", age);',
              '}',
              '',
              'const agree = document.querySelector("#agree");',
              'console.log(agree.checked);'
            ].join('\n'),
            output: '年龄 18\ntrue',
            tip: '`parseInt("12px")` 会得到 12，`Number("12px")` 得到 `NaN`。需要严格校验时用 `Number`，不要用 `parseInt` 容忍脏输入。'
          }
        ],
        points: ['提交前 `preventDefault`，用 `FormData` 读取。', '前端校验不是安全边界。', '输入值都是字符串，数字要显式转换。'],
        practice: '写一个注册表单提交处理：读取姓名、邮箱、年龄，年龄非法时显示错误，合法时打印整理后的对象。'
      },
      {
        id: 'm5-4', title: 'localStorage 与页面状态', minutes: 22,
        lead: 'localStorage 只能存字符串，容量有限，且同步阻塞。它适合保存主题、草稿、上次位置这类轻量状态，不适合存大列表和敏感信息。',
        sections: [
          {
            h: '读写要包在 try/catch 里',
            p: '隐私模式、存储配额、被禁用都可能让 `localStorage` 抛错。读取时用 `getItem` 返回 `null` 判断是否存在；写入对象前 `JSON.stringify`，读取后 `JSON.parse` 也要处理损坏数据。删除用 `removeItem`，清空用 `clear`，但 `clear` 会清掉同源所有键。',
            code: [
              'try {',
              '  localStorage.setItem("theme", "dark");',
              '  console.log(localStorage.getItem("theme"));',
              '  const state = JSON.parse(localStorage.getItem("state") || "{}");',
              '  console.log(state.count ?? 0);',
              '  localStorage.removeItem("theme");',
              '} catch (err) {',
              '  console.warn("localStorage 不可用", err.name);',
              '}'
            ].join('\n'),
            output: 'dark\n0',
            tip: '不要存 token、密码、身份证等敏感信息。需要跨标签同步时监听 `storage` 事件；它只在其他标签页触发，当前页不会收到。'
          },
          {
            h: '版本化你的存储键',
            p: '数据结构会变，旧版本数据可能让新代码崩溃。键名带版本，例如 `app.state.v2`；读取时校验字段，迁移失败就回退默认值并清理旧键。写入不要太频繁，输入框每敲一个字就 `JSON.stringify` 整个大对象会卡。',
            code: [
              'const KEY = "jsDemo.state.v1";',
              'function saveState(state) {',
              '  localStorage.setItem(KEY, JSON.stringify(state));',
              '}',
              'function loadState() {',
              '  try {',
              '    const raw = JSON.parse(localStorage.getItem(KEY) || "null");',
              '    return raw && typeof raw === "object" ? raw : {};',
              '  } catch (err) {',
              '    localStorage.removeItem(KEY);',
              '    return {};',
              '  }',
              '}',
              'saveState({ page: 2 });',
              'console.log(loadState());'
            ].join('\n'),
            output: '{ page: 2 }',
            tip: '写入前先做防抖；读取失败要能回退默认状态。永远不要假设 localStorage 里的数据一定合法。'
          }
        ],
        points: ['localStorage 只存字符串，读写都可能抛错。', '存对象要 `JSON.stringify`，读后校验结构。', '键名带版本，敏感信息不要存。'],
        practice: '实现 `saveState` / `loadState`，保存 `{ theme, page }`；手动把存储值改成非法 JSON，验证读取后能清理并回退默认对象。'
      }
    ]
  },
  {
    number: '06',
    title: '异步与模块',
    summary: '把时间维度写进代码：事件循环、Promise、请求和模块拆分。',
    goals: ['说清宏任务与微任务的顺序', '正确传播 Promise 错误', '用 async/await 组织请求', '把代码拆成 ESM 模块'],
    lessons: [
      {
        id: 'm6-1', title: '事件循环、任务与微任务', minutes: 24,
        lead: 'JavaScript 单线程执行，但事件循环让异步任务排队。同步代码先跑完，再清空微任务队列，最后取一个宏任务。理解这个顺序，才能解释输出为什么不是从上到下。',
        sections: [
          {
            h: '同步 → 微任务 → 宏任务',
            p: '当前调用栈清空后，引擎先执行所有微任务（Promise 回调、`queueMicrotask`、`MutationObserver`），再取下一个宏任务（`setTimeout`、`setInterval`、I/O、事件）。每取一个宏任务，都会再清空一次微任务队列。`await` 后面的代码相当于放进微任务继续执行。',
            code: [
              'console.log("A");',
              'setTimeout(() => console.log("B"), 0);',
              'Promise.resolve().then(() => console.log("C"));',
              'console.log("D");'
            ].join('\n'),
            output: 'A\nD\nC\nB',
            tip: '`setTimeout(fn, 0)` 不是立即执行，而是排到宏任务队列；前面的微任务会先跑。不要用 `setTimeout` 0 来“等 DOM 更新”，需要时用 `requestAnimationFrame` 或 `queueMicrotask`。'
          },
          {
            h: '别阻塞事件循环',
            p: '长循环、大 JSON 解析、同步 DOM 重排都会卡住主线程。大任务可以拆成小片，用 `setTimeout` / `requestIdleCallback` 让出控制权，或放进 Web Worker。`async` 函数里如果有长时间同步计算，`await` 也救不了，因为它仍然占着主线程。',
            code: [
              'function chunkWork(items, size, handle) {',
              '  let index = 0;',
              '  function run() {',
              '    const end = Math.min(index + size, items.length);',
              '    for (; index < end; index += 1) handle(items[index]);',
              '    if (index < items.length) setTimeout(run, 0);',
              '  }',
              '  run();',
              '}',
              'chunkWork([1, 2, 3, 4, 5], 2, (n) => console.log("处理", n));'
            ].join('\n'),
            output: '处理 1\n处理 2\n处理 3\n处理 4\n处理 5',
            tip: '分片不是越多越好，片太小会增加调度开销。计算密集且可并行的任务优先考虑 Web Worker，而不是在主线程里切碎。'
          }
        ],
        points: ['同步代码 → 微任务 → 宏任务。', '每个宏任务后都会清空微任务。', '长同步计算会阻塞主线程，`await` 不能解决。'],
        practice: '写一段包含 `console.log`、`Promise.then`、`setTimeout` 的代码，先手写预期输出顺序，再在控制台运行验证；最后把顺序图用注释写回代码。'
      },
      {
        id: 'm6-2', title: 'Promise 的状态与错误传递', minutes: 26,
        lead: 'Promise 只有 pending、fulfilled、rejected 三种状态，状态一旦改变就固定。错误会沿链向后传递，直到遇到 `catch` 或 `then` 的第二个参数。',
        sections: [
          {
            h: 'then 返回新 Promise',
            p: '每次 `.then` 都返回一个新 Promise，所以可以链式调用。回调里返回值会被包装成 fulfilled；抛错会变成 rejected。没有 `return` 的 `then` 会得到 `undefined`，下一环拿不到上一环的数据。`catch` 捕获链上最近一次拒绝，`finally` 无论成功失败都会执行。',
            code: [
              'Promise.resolve(1)',
              '  .then((n) => n + 1)',
              '  .then((n) => { throw new Error("第二步失败"); })',
              '  .catch((err) => console.log("捕获:", err.message))',
              '  .finally(() => console.log("结束"));'
            ].join('\n'),
            output: '捕获: 第二步失败\n结束',
            tip: '`then(onFulfilled, onRejected)` 的第二个参数不会捕获 `onFulfilled` 自己抛出的错误；要捕获整条链，统一在末尾放 `catch`。'
          },
          {
            h: 'all、allSettled 与 race',
            p: '`Promise.all` 等全部成功，任何一个失败就整体拒绝；`Promise.allSettled` 等全部落定，返回每一项的状态和值；`Promise.race` 取最先落定的一项；`Promise.any` 取最先成功的一项。并发请求要设置上限，别一次性打几百个请求。',
            code: [
              'Promise.all([Promise.resolve(1), Promise.resolve(2)])',
              '  .then((values) => console.log(values.join(",")));',
              'Promise.allSettled([',
              '  Promise.resolve("ok"),',
              '  Promise.reject(new Error("bad"))',
              ']).then((results) => console.log(results.map((r) => r.status).join(",")));'
            ].join('\n'),
            output: '1,2\nfulfilled,rejected',
            tip: '`Promise.all` 失败后其他请求不会自动取消，仍会继续执行。需要取消就用 `AbortController`；需要全部结果就用 `allSettled`。'
          }
        ],
        points: ['Promise 状态不可逆。', '`then` 返回新 Promise，忘记 return 会丢值。', '`all` 短路失败，`allSettled` 等全部落定。'],
        practice: '创建三个 Promise，其中一个会拒绝；分别用 `Promise.all` 和 `Promise.allSettled` 处理，打印两种结果的差异。'
      },
      {
        id: 'm6-3', title: 'async / await 与 fetch', minutes: 26,
        lead: '`async` 函数总是返回 Promise，`await` 等待一个 Promise 落定。它让异步代码读起来像同步，但错误仍然要用 `try/catch` 显式处理。',
        sections: [
          {
            h: 'fetch 不会因为 404 拒绝',
            p: '`fetch` 只在网络失败时拒绝，HTTP 404、500 仍然会 resolve，必须检查 `response.ok` 或 `status`。响应体要按类型读：`json()`、`text()`、`blob()`。请求可以带 `method`、`headers`、`body`，跨域还要后端允许。不要在 `await` 后再假设数据一定存在。',
            code: [
              'async function loadUser(id) {',
              '  const res = await fetch("/api/users/" + id);',
              '  if (!res.ok) throw new Error("HTTP " + res.status);',
              '  return res.json();',
              '}',
              'loadUser(7)',
              '  .then((user) => console.log(user.name))',
              '  .catch((err) => console.error(err.message));'
            ].join('\n'),
            output: 'Ada',
            tip: '错误消息里保留状态码和接口路径，便于排查；不要把后端返回的完整敏感错误直接展示给用户。'
          },
          {
            h: '串行与并行的选择',
            p: '多个请求互不依赖时用 `Promise.all` 并行，耗时接近最慢的那个；后一个依赖前一个结果时才串行 `await`。循环里逐个 `await` 会变成串行，数据量大时非常慢。需要限制并发时写一个小的 `mapLimit`，而不是一次全部发出。',
            code: [
              'async function loadDashboard(userId) {',
              '  const [user, orders] = await Promise.all([',
              '    fetch("/api/users/" + userId).then((r) => r.json()),',
              '    fetch("/api/users/" + userId + "/orders").then((r) => r.json())',
              '  ]);',
              '  return { user, orders };',
              '}',
              'loadDashboard(7).then((data) => console.log(data.user.name, data.orders.length));'
            ].join('\n'),
            output: 'Ada 3',
            tip: '并行请求要确认接口之间真的没有依赖。`Promise.all` 中一个失败会让整体失败，但仍可用 `allSettled` 分别处理。'
          }
        ],
        points: ['`fetch` 对 404/500 不拒绝，要检查 `res.ok`。', '互不依赖的请求用 `Promise.all` 并行。', '循环里的 `await` 默认串行，注意性能。'],
        practice: '写一个 `loadDashboard` 并行请求用户和订单，检查两个响应的 `ok`，任一失败时抛出带状态码的错误；再用 `try/catch` 打印。'
      },
      {
        id: 'm6-4', title: 'ESM、npm 与构建入口', minutes: 22,
        lead: '模块把代码拆成有边界的文件：每个文件有自己的作用域，通过 `export` 暴露能力，通过 `import` 声明依赖。',
        sections: [
          {
            h: '具名导出与默认导出',
            p: '`export function add(){}` 是具名导出，导入时必须用同名或 `as` 重命名；`export default` 每个模块只能有一个，导入时可以任意命名。浏览器里用 `<script type="module">`，路径必须写扩展名或用导入映射。ESM 默认严格模式，顶层 `this` 是 `undefined`。',
            code: [
              '// math.js',
              'export function add(a, b) { return a + b; }',
              'export const PI = 3.14159;',
              '',
              '// main.js',
              'import { add, PI as pi } from "./math.js";',
              'console.log(add(2, 3), pi);'
            ].join('\n'),
            output: '5 3.14159',
            tip: '具名导出更适合工具函数和常量，默认导出适合“一个模块一个主功能”。混用会让导入风格不统一，团队里最好约定一种。'
          },
          {
            h: 'package.json 与构建工具的职责',
            p: '`package.json` 记录项目元信息、脚本和依赖；`"type": "module"` 让 Node 默认按 ESM 解析 `.js`。`npm install` 装依赖，`npm run build` 调构建。浏览器不直接认识 npm 包路径，需要打包器解析，或使用支持裸模块导入的导入映射。构建不是必需，但生产项目通常需要压缩、拆分和兼容处理。',
            code: [
              '// package.json（节选）',
              '{',
              '  "name": "js-demo",',
              '  "type": "module",',
              '  "scripts": {',
              '    "dev": "vite",',
              '    "build": "vite build"',
              '  }',
              '}'
            ].join('\n'),
            output: 'npm run dev → 本地开发服务器\nnpm run build → 生产构建',
            tip: '不要提交 `node_modules`；锁文件 `package-lock.json` 要提交，保证团队和 CI 装到同一组版本。升级依赖后要重新跑构建和测试。'
          }
        ],
        points: ['ESM 每个文件有独立作用域，默认严格模式。', '具名导出要对名，默认导出可任意命名。', '`package.json` 管脚本和依赖，构建工具负责打包。'],
        practice: '把课程里的 `add`、`PI` 拆成 `math.js`，在 `main.js` 中具名导入并打印；再把 `package.json` 的 `type` 改成 `module`，观察 Node 运行差异。'
      }
    ]
  }
];

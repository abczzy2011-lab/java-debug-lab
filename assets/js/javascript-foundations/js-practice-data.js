/* JavaScript 练习题库：3 档 × 8 题 = 24 题（z87 追加 30 题后共 54 题，每档 18）
   全部为输出预测 / 行为判断选择题，浏览器本地判分，不执行用户代码。 */
window.JS_PRACTICE_LEVELS = [
  {
    id: 'basic',
    label: '基础',
    en: 'FOUNDATIONS',
    title: '语法、类型与比较',
    summary: '先把值、类型、相等比较和真假值判断稳住。这 18 题只考运行结果，不背名词。'
  },
  {
    id: 'core',
    label: '进阶',
    en: 'CORE JS',
    title: '函数、this 与数据',
    summary: '闭包、this、浅拷贝、解构和数组方法。每题都对应一个真实会踩的坑。'
  },
  {
    id: 'runtime',
    label: '实战',
    en: 'RUNTIME',
    title: '浏览器、事件与异步',
    summary: '事件循环、Promise、fetch 和 DOM 事件顺序。答完能解释“为什么先打印这个”。'
  }
];

window.JS_PRACTICE_QUESTIONS = [
  {
    id: 'b1', level: 'basic', title: 'const 能不能重新赋值',
    prompt: '运行下面这段代码，最后输出什么？',
    code: 'const score = 60;\nscore = 80;\nconsole.log(score);',
    options: ['60', '80', '抛错 TypeError', 'undefined'],
    answer: 2,
    output: '抛错：TypeError: Assignment to constant variable.',
    why: 'const 锁的是变量绑定，不是对象内容。对 score 再次赋值会在执行阶段抛 TypeError，后面的 console.log 不会执行。',
    point: 'const 不能重新绑定；对象内部属性仍然可以改。'
  },
  {
    id: 'b2', level: 'basic', title: '== 与 === 的结果',
    prompt: '下面这行会打印出哪一组结果？',
    code: 'console.log(0 == "0", 0 === "0");',
    options: ['true true', 'true false', 'false true', 'false false'],
    answer: 1,
    output: 'true false',
    why: '== 会做类型转换，字符串 "0" 被转成数字 0，所以为 true；=== 先比较类型，number 与 string 不同，直接为 false。',
    point: '默认用 ===；只有明确需要类型转换时才考虑 ==。'
  },
  {
    id: 'b3', level: 'basic', title: 'typeof null 的历史遗留',
    prompt: '这两次 typeof 分别返回什么？',
    code: 'console.log(typeof null);\nconsole.log(typeof undefined);',
    options: ['null undefined', '"object" "undefined"', '"null" "undefined"', '"object" "object"'],
    answer: 1,
    output: 'object\nundefined',
    why: 'typeof null 返回 "object" 是早期 JavaScript 的遗留 bug；undefined 的类型才是 "undefined"。判断 null 应直接用 value === null。',
    point: 'typeof null === "object"，不能拿它判断 null。'
  },
  {
    id: 'b4', level: 'basic', title: 'NaN 与自身相不相等',
    prompt: '两次判断分别输出什么？',
    code: 'console.log(NaN === NaN);\nconsole.log(Number.isNaN(NaN));',
    options: ['true true', 'true false', 'false true', 'false false'],
    answer: 2,
    output: 'false\ntrue',
    why: 'NaN 不等于任何值，包括它自己；Number.isNaN 专门检测“值就是 NaN”，返回 true。',
    point: '判断 NaN 用 Number.isNaN(value)，不要用 value === NaN。'
  },
  {
    id: 'b5', level: 'basic', title: '减号与加号的类型转换',
    prompt: '这一行会输出什么？',
    code: 'console.log("5" - 2, "5" + 2);',
    options: ['3 7', '3 "52"', '"52" 7', '"52" "52"'],
    answer: 1,
    output: '3 "52"',
    why: '减号只做数学运算，字符串 "5" 被转成数字 5，结果是 3；加号遇到字符串会做拼接，得到字符串 "52"。',
    point: '+ 有字符串拼接语义，- 没有；混合类型时先显式转换。'
  },
  {
    id: 'b6', level: 'basic', title: '把 length 改小之后',
    prompt: '执行完下面三行，list 变成什么？',
    code: 'const list = [1, 2, 3];\nlist.length = 1;\nconsole.log(list);',
    options: ['[1, 2, 3]', '[1]', '[1, 2]', '抛错'],
    answer: 1,
    output: '[1]',
    why: '数组的 length 是可写属性。把它改小会截断尾部元素，list 只剩索引 0 的 1；这不是创建新数组。',
    point: '改 length 会原地截断数组；需要副本时先展开或 slice。'
  },
  {
    id: 'b7', level: 'basic', title: '?? 只兜住哪两个值',
    prompt: 'name 没有被赋值，这行输出什么？',
    code: 'let name;\nconsole.log(name ?? "匿名");',
    options: ['匿名', 'undefined', 'null', '抛错'],
    answer: 0,
    output: '匿名',
    why: '?? 只在左侧是 null 或 undefined 时使用右侧默认值。name 声明未赋值，值是 undefined，所以输出 "匿名"。',
    point: '?? 与 || 不同：|| 会把 0、""、false 也当成假值替换掉。'
  },
  {
    id: 'b8', level: 'basic', title: '空数组是真还是假',
    prompt: '这段 if 会走哪个分支？',
    code: 'if ([]) {\n  console.log("真值");\n} else {\n  console.log("假值");\n}',
    options: ['真值', '假值', '抛错', '两个都不打印'],
    answer: 0,
    output: '真值',
    why: '数组是对象，所有对象在布尔转换时都是 true。空数组不是“空值”，[] 的真假值与它的 length 无关。',
    point: '对象（包括空数组、空对象）都是真值；判断空集合要看 length 或 keys。'
  },
  {
    id: 'c1', level: 'core', title: '闭包共享的是哪个变量',
    prompt: '两次调用 next 后，count 是多少？',
    code: 'let count = 0;\nfunction makeCounter() {\n  return () => ++count;\n}\nconst next = makeCounter();\nnext();\nnext();\nconsole.log(count);',
    options: ['0', '1', '2', '3'],
    answer: 2,
    output: '2',
    why: '返回的箭头函数保留了对外层 count 的引用，两次 ++count 都作用在同一个变量上，所以是 2。',
    point: '闭包保留的是变量引用，不是创建时的值副本。'
  },
  {
    id: 'c2', level: 'core', title: 'call 临时换掉 this',
    prompt: '最后输出什么？',
    code: 'const player = {\n  score: 30,\n  read() { return this.score; }\n};\nconst read = player.read;\nconsole.log(read.call({ score: 99 }));',
    options: ['30', '99', 'undefined', '抛错'],
    answer: 1,
    output: '99',
    why: 'read 被单独取出后，调用时 this 由 call 的第一个参数决定。这里传入 { score: 99 }，所以返回 99。',
    point: '普通函数的 this 看“怎么调用”；call/apply 可以显式指定。'
  },
  {
    id: 'c3', level: 'core', title: '展开运算符复制了几层',
    prompt: '改副本里的 city 后，原对象 a 的 city 是什么？',
    code: 'const a = { profile: { city: "London" } };\nconst b = { ...a };\nb.profile.city = "Paris";\nconsole.log(a.profile.city);',
    options: ['London', 'Paris', 'undefined', '抛错'],
    answer: 1,
    output: 'Paris',
    why: '展开只复制第一层属性。a 和 b 的 profile 指向同一个嵌套对象，改 b.profile.city 就是改 a.profile.city。',
    point: '展开 / Object.assign 都是浅拷贝；嵌套结构要 structuredClone 或手动深拷贝。'
  },
  {
    id: 'c4', level: 'core', title: '解构默认值什么时候生效',
    prompt: '这一行输出什么？',
    code: 'const { a = 1, b = 2 } = { a: 5 };\nconsole.log(a + b);',
    options: ['3', '6', '7', 'NaN'],
    answer: 2,
    output: '7',
    why: 'a 取到 5；b 在右侧对象里不存在，解构得到 undefined，于是使用默认值 2。5 + 2 = 7。',
    point: '解构默认值只在属性为 undefined 时生效，null 不会触发默认值。'
  },
  {
    id: 'c5', level: 'core', title: 'map 的第二个参数',
    prompt: 'map 回调里的 i 是索引，这行输出什么？',
    code: 'console.log([10, 20, 30].map((n, i) => n + i));',
    options: ['[10, 20, 30]', '[10, 21, 32]', '[11, 22, 33]', '[30, 60, 90]'],
    answer: 1,
    output: '[10, 21, 32]',
    why: 'map 依次传入元素和索引：(10 + 0)=10、(20 + 1)=21、(30 + 2)=32，返回新数组，原数组不变。',
    point: 'map 的第二个参数是索引；它会用返回值组成新数组。'
  },
  {
    id: 'c6', level: 'core', title: 'reduce 的初始值',
    prompt: '最后的数字是多少？',
    code: 'console.log([1, 2, 3].reduce((sum, n) => sum + n, 10));',
    options: ['6', '10', '16', '19'],
    answer: 2,
    output: '16',
    why: '第二个参数 10 是初始累加值。依次加 1、2、3：10 + 1 + 2 + 3 = 16。',
    point: 'reduce 的第二个参数是初始值；不传时首元素会成为初始值。'
  },
  {
    id: 'c7', level: 'core', title: 'sort 默认按什么排序',
    prompt: '不传比较函数，这个数组会变成什么？',
    code: 'console.log([10, 2, 1].sort());',
    options: ['[1, 2, 10]', '[1, 10, 2]', '[10, 2, 1]', '抛错'],
    answer: 1,
    output: '[1, 10, 2]',
    why: 'sort 不传比较函数时会把元素转成字符串，再按 UTF-16 字典序比较。"1" 在 "10" 前，"10" 又在 "2" 前。',
    point: '数字排序要传 (a, b) => a - b；sort 还会原地修改数组。'
  },
  {
    id: 'c8', level: 'core', title: 'Object.keys 会拿原型吗',
    prompt: 'Object.keys(c) 返回什么？',
    code: 'function Counter() {\n  this.n = 1;\n}\nCounter.prototype.step = function () {};\nconst c = new Counter();\nconsole.log(Object.keys(c));',
    options: ['["n"]', '["n", "step"]', '["step"]', '[]'],
    answer: 0,
    output: '["n"]',
    why: 'Object.keys 只返回对象自身可枚举的字符串键。n 是实例自身属性，step 在原型上，不在结果里。',
    point: 'Object.keys 看自身可枚举；for...in 会沿原型链枚举。'
  },
  {
    id: 'r1', level: 'runtime', title: '同步、微任务与宏任务的顺序',
    prompt: '这段代码的打印顺序是什么？',
    code: 'console.log("A");\nsetTimeout(() => console.log("B"), 0);\nPromise.resolve().then(() => console.log("C"));\nconsole.log("D");',
    options: ['A B C D', 'A D C B', 'A C D B', 'A D B C'],
    answer: 1,
    output: 'A\nD\nC\nB',
    why: '先执行全部同步代码 A、D。当前调用栈清空后先清微任务队列，打印 C；setTimeout 的回调属于宏任务，最后打印 B。',
    point: '一次事件循环：同步代码 → 清空微任务 → 取一个宏任务。'
  },
  {
    id: 'r2', level: 'runtime', title: 'await 把后续代码放到哪里',
    prompt: 'run() 调用后，控制台顺序是什么？',
    code: 'async function run() {\n  console.log(1);\n  await null;\n  console.log(2);\n}\nrun();\nconsole.log(3);',
    options: ['1 2 3', '1 3 2', '3 1 2', '1 2 并行 3'],
    answer: 1,
    output: '1\n3\n2',
    why: 'run 执行到 await 时暂停，把后面的 console.log(2) 放进微任务；同步继续打印 3。调用栈清空后才打印 2。',
    point: 'await 后面的代码是异步续体，不会阻塞外层同步代码。'
  },
  {
    id: 'r3', level: 'runtime', title: 'Promise.all 遇到一个失败',
    prompt: '最终会进入哪个回调，打印什么？',
    code: 'Promise.all([\n  Promise.resolve("ok"),\n  Promise.reject("boom")\n]).then(v => console.log("then", v))\n  .catch(e => console.log("catch", e));',
    options: ['then ok', 'catch boom', 'then ["ok", "boom"]', '什么都不打印'],
    answer: 1,
    output: 'catch boom',
    why: 'Promise.all 只要有一个输入 rejected，整个结果就 rejected，并采用第一个失败原因 "boom"；then 的成功回调不会执行。',
    point: 'Promise.all 快速失败；要保留部分成功结果用 allSettled。'
  },
  {
    id: 'r4', level: 'runtime', title: 'fetch 404 会走 catch 吗',
    prompt: '假设 /missing 返回 404，这段代码打印什么？',
    code: 'fetch("/missing")\n  .then(res => console.log(res.ok))\n  .catch(() => console.log("network error"));',
    options: ['true', 'false', 'network error', '抛错未处理'],
    answer: 1,
    output: 'false',
    why: 'fetch 只在网络层失败时 reject。HTTP 404 仍然是一个成功返回的 Response，只是 res.ok 为 false、status 为 404，所以进入 then。',
    point: 'fetch 不会因 4xx/5xx 自动 reject；要自己检查 res.ok。'
  },
  {
    id: 'r5', level: 'runtime', title: 'click() 之后才打印 after 吗',
    prompt: '假设 button 已存在，这段输出什么？',
    code: 'button.addEventListener("click", () => console.log("click"));\nbutton.click();\nconsole.log("after");',
    options: ['click after', 'after click', '只打印 click', '只打印 after'],
    answer: 0,
    output: 'click\nafter',
    why: 'button.click() 会同步派发 click 事件，监听器在 click() 返回前执行，所以先打印 click，再执行下一行 after。',
    point: 'DOM 事件派发默认是同步的；异步的是用户真实操作发生的时机。'
  },
  {
    id: 'r6', level: 'runtime', title: 'target 与 currentTarget',
    prompt: 'item 在 list 内部，点击 item 后输出什么？',
    code: 'list.addEventListener("click", (e) => {\n  console.log(e.target.dataset.id, e.currentTarget === list);\n});\nitem.click();',
    options: ['7 true', '7 false', 'undefined true', 'list true'],
    answer: 0,
    output: '7 true',
    why: 'e.target 是实际被点的元素 item，它的 data-id 是 "7"；e.currentTarget 是挂监听器的 list，所以比较为 true。',
    point: 'target 是事件源，currentTarget 是当前监听器所在元素；事件委托靠这个区分。'
  },
  {
    id: 'r7', level: 'runtime', title: 'queueMicrotask 排在哪里',
    prompt: '这段代码的打印顺序是什么？',
    code: 'queueMicrotask(() => console.log("micro"));\nconsole.log("sync");',
    options: ['micro sync', 'sync micro', '只打印 sync', '只打印 micro'],
    answer: 1,
    output: 'sync\nmicro',
    why: '同步代码先执行完，queueMicrotask 注册的回调进入微任务队列，等调用栈清空后才执行。',
    point: 'queueMicrotask 与 Promise.then 同属微任务，晚于当前同步代码。'
  },
  {
    id: 'r8', level: 'runtime', title: 'finally 在 then 之前还是之后',
    prompt: '这段 Promise 链的打印顺序是什么？',
    code: 'Promise.resolve()\n  .then(() => console.log("then"))\n  .finally(() => console.log("finally"));',
    options: ['finally then', 'then finally', '只打印 then', '只打印 finally'],
    answer: 1,
    output: 'then\nfinally',
    why: 'finally 注册在 then 之后，链式调用会等前一个 then 的回调完成再执行 finally，所以顺序是 then、finally。',
    point: 'finally 不接收成功值，也不改变结果；它用于清理，不用于转换数据。'
  }
];

/* JavaScript 课程加餐 · 每章 1 节工程实战工作坊，18 节 / 108 个正文小节。 */
window.JS_COURSE_CAPSTONES = {
  "ch1": {
    "id": "ch1-capstone",
    "title": "加餐：做一个脚本加载顺序实验台",
    "minutes": 45,
    "lead": "把 script、defer、async、module 四种加载方式放进同一张时间线，用真实顺序验证你的理解，而不是背结论。",
    "sections": [
      {
        "h": "需求现场",
        "p": "写一个不依赖框架的小实验页：页面上放四个脚本，每个脚本只做一件事——往 `window.timeline` 里 push 自己的名字和到达时间。刷新几次，把控制台里的顺序抄下来。这比看十遍定义更能记住 defer 和 async 的差别。",
        "code": "",
        "output": "",
        "tip": "实验页不要用构建工具，先把浏览器原生行为看清楚。"
      },
      {
        "h": "设计与数据流",
        "p": "时间线用一个数组存 `{name, at}`，每个脚本执行时记录 `performance.now()`。普通脚本会阻塞解析；defer 在 DOM 解析完后按顺序执行；async 下载完就插队；module 默认 defer 且拥有独立作用域。",
        "code": "window.timeline = window.timeline || [];\nfunction mark(name) {\n  window.timeline.push({ name, at: Math.round(performance.now()) });\n}",
        "output": "timeline: [\n  { name: 'classic', at: 12 },\n  { name: 'module', at: 48 },\n  { name: 'defer', at: 49 }\n]",
        "tip": "先记录再解释；没有时间戳的“顺序”很容易记错。"
      },
      {
        "h": "最小实现",
        "p": "把四种脚本写进同一个 HTML，给每个脚本加 300ms 的人工延迟（用查询参数或本地代理模拟），然后观察谁先谁后。重点看两个边界：async 不保证顺序；defer 一定在 DOMContentLoaded 之前、且按文档顺序。",
        "code": "<!-- 实验顺序：classic → defer → async → module -->\n<script>mark('classic')</script>\n<script defer src=\"defer.js\"></script>\n<script async src=\"async.js\"></script>\n<script type=\"module\" src=\"module.js\"></script>",
        "output": "classic 先执行；defer 按文档顺序；async 谁先下载完谁先跑；module 默认 defer。",
        "tip": "别用 `setTimeout` 假装网络延迟，它改变的是定时器队列，不是下载顺序。"
      },
      {
        "h": "边界与错误",
        "p": "三个常见误判：第一，把 `async` 当成“异步不阻塞”，它下载时不阻塞，但执行时仍会占用主线程；第二，以为 `defer` 脚本一定在 `load` 之前，实际它在 `DOMContentLoaded` 之前；第三，module 里 `this` 是 `undefined`，不是 window。",
        "code": "console.log(typeof this); // module 顶层\nconsole.log(document.readyState);",
        "output": "module 顶层 this: undefined\nreadyState: interactive / complete",
        "tip": "写实验时同时记录 `readyState`，否则你分不清是脚本顺序还是文档阶段。"
      },
      {
        "h": "验收与测试",
        "p": "验收不靠肉眼：写一个 `expectedOrder` 数组，页面加载完后比对 `timeline.map(x => x.name)`。如果顺序受网络影响，就把 async 那项标成“允许乱序”，只断言其他三项。",
        "code": "const expected = ['classic', 'defer', 'module'];\nconst actual = timeline.map(x => x.name).filter(n => n !== 'async');\nconsole.assert(actual.join('|') === expected.join('|'), actual);",
        "output": "通过：classic|defer|module\n失败：打印实际顺序",
        "tip": "测试异步加载顺序时，给“允许乱序”的项单独开白名单，不要为了稳定而删掉它。"
      },
      {
        "h": "新手加练与扩展",
        "p": "下一步把实验升级成小工具：输入一组脚本配置，输出建议的加载策略。依赖 DOM 的用 defer，独立统计用 async，需要模块作用域的用 module。再加一个“重复加载检测”，提醒同一个 URL 被引入两次。",
        "code": "",
        "output": "",
        "tip": "先能解释顺序，再谈优化；顺序都没测过就调策略，等于蒙。"
      }
    ],
    "points": [
      "加载方式决定执行时机，不是风格问题。",
      "defer 保序，async 不保序，module 默认 defer。",
      "验收要比对时间线，不靠记忆。"
    ],
    "practice": "把四种脚本的真实顺序记录下来，再写一个 `recommendLoader(config)` 函数，给每个脚本返回 classic/defer/async/module 之一，并说明理由。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch2": {
    "id": "ch2-capstone",
    "title": "加餐：写一个表单值规范化器",
    "minutes": 45,
    "lead": "后端最怕前端送来的 `\"\"`、`\"null\"`、`\"undefined\"` 和多余空格。做一个纯函数，把原始表单对象清洗成可预测的数据。",
    "sections": [
      {
        "h": "需求现场",
        "p": "用户填写的表单里，空字符串、字符串 `\"null\"`、全空格、数字字符串经常混在一起。直接 `JSON.stringify` 发出去，后端会收到一堆脏值。目标：统一 trim、空值转 null、数字字段转 number、布尔字段转 boolean。",
        "code": "",
        "output": "",
        "tip": "先定义“干净”的标准，再写转换；否则每个人对空值的理解都不一样。"
      },
      {
        "h": "设计与数据流",
        "p": "输入是 `raw` 对象和 `schema` 描述；输出是新对象，不修改入参。schema 里声明每个字段的类型和是否必填。转换顺序：去空格 → 空值判断 → 类型转换 → 必填校验。",
        "code": "const schema = {\n  name: { type: 'string', required: true },\n  age: { type: 'number' },\n  active: { type: 'boolean' }\n};",
        "output": "输出：{ name: 'Ada', age: 36, active: true }",
        "tip": "转换函数保持纯函数，别在里面对 DOM 或全局变量下手。"
      },
      {
        "h": "最小实现",
        "p": "核心是一个 `normalizeValue`：字符串先 trim，空串或 `\"null\"`/`\"undefined\"` 归一成 null；number 用 `Number` 后检查 `Number.isFinite`；boolean 只接受 true/false、1/0、'true'/'false'。",
        "code": "function normalizeValue(value, type) {\n  if (typeof value === 'string') {\n    value = value.trim();\n    if (value === '' || value === 'null' || value === 'undefined') return null;\n  }\n  if (value == null) return null;\n  if (type === 'number') {\n    const n = Number(value);\n    return Number.isFinite(n) ? n : null;\n  }\n  if (type === 'boolean') {\n    if (value === true || value === 1 || value === 'true') return true;\n    if (value === false || value === 0 || value === 'false') return false;\n    return null;\n  }\n  return String(value);\n}",
        "output": "normalizeValue(' 42 ', 'number') -> 42\nnormalizeValue(' ', 'string') -> null\nnormalizeValue('false', 'boolean') -> false",
        "tip": "`Number('')` 是 0，不是 NaN；空串必须在转换前拦住。"
      },
      {
        "h": "边界与错误",
        "p": "四个边界：`0` 是合法数字，不能用 `!value` 判断；`false` 是合法布尔，不能用 `value || default`；数组字段要单独处理，不能 String 成 `\"a,b\"`；必填字段缺值时抛错还是收集错误，要提前统一。",
        "code": "if (raw.age === 0) console.log('0 是合法值');\nif (raw.active === false) console.log('false 不能被吞掉');",
        "output": "0 是合法值\nfalse 不能被吞掉",
        "tip": "用 `value == null` 判空，不要用 `!value`，否则 0 和 false 都会被误伤。"
      },
      {
        "h": "验收与测试",
        "p": "给每个类型准备三组用例：正常值、空值、脏值。断言输出对象深相等，且原对象没有被改。再补一个必填缺失的用例，确认错误信息包含字段名。",
        "code": "const input = { name: ' Ada ', age: '42', active: 'false' };\nconst out = normalize(input, schema);\nconsole.assert(out.name === 'Ada' && out.age === 42 && out.active === false);\nconsole.assert(input.name === ' Ada ', '不能改入参');",
        "output": "通过：name=Ada, age=42, active=false\n原对象保持不变",
        "tip": "测试里一定要检查入参未被修改，纯函数是承诺，不是口号。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加一个 `errors` 数组收集所有非法字段，而不是遇到第一个就 throw；再加 `FormData` 适配器，把浏览器表单转成 raw 对象。最后把 schema 换成 Zod 或 Yup，体会手写校验和声明式校验的差别。",
        "code": "",
        "output": "",
        "tip": "先手写一遍，再用库；否则你只会调 API，不知道库在替你做什么。"
      }
    ],
    "points": [
      "规范化是前后端契约的一部分。",
      "空值、0、false 必须分开处理。",
      "纯函数要验证入参不被修改。"
    ],
    "practice": "实现 `normalizeForm(form, schema)`，返回 `{ value, errors }`，并用五组脏数据测试。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch3": {
    "id": "ch3-capstone",
    "title": "加餐：带错误边界的四则运算器",
    "minutes": 45,
    "lead": "让用户输入 `12 + 3`，程序给出结果；输入非法表达式时给出人话错误，而不是把异常栈甩到界面上。",
    "sections": [
      {
        "h": "需求现场",
        "p": "一个小工具接收两个操作数和一个运算符，支持 + - * /。要求：除数为 0 要明确提示；操作数不是数字要提示字段；结果保留两位小数；任何异常都不能让页面白屏。",
        "code": "",
        "output": "",
        "tip": "先把错误分类，再写正常路径；错误路径才是这个小项目的价值。"
      },
      {
        "h": "设计与数据流",
        "p": "解析层只接受 `数字 运算符 数字`；计算层用 switch 分派；展示层把 `{ok, value, error}` 转成 UI。三层分开，后面换界面不用重写计算。",
        "code": "function parse(expr) {\n  const m = expr.trim().match(/^(-?\\d+(?:\\.\\d+)?)\\s*([+\\-*/])\\s*(-?\\d+(?:\\.\\d+)?)$/);\n  if (!m) throw new Error('格式应为：数字 运算符 数字');\n  return { left: Number(m[1]), op: m[2], right: Number(m[3]) };\n}",
        "output": "parse('12 + 3') -> { left: 12, op: '+', right: 3 }\nparse('12 +') -> Error",
        "tip": "解析和计算分开，错误信息才能说清是“格式错”还是“除零”。"
      },
      {
        "h": "最小实现",
        "p": "计算函数只处理四个分支，最后统一 `Number(result.toFixed(2))`。除零单独抛 `RangeError`，调用方捕获后转成中文提示。",
        "code": "function calculate({ left, op, right }) {\n  switch (op) {\n    case '+': return left + right;\n    case '-': return left - right;\n    case '*': return left * right;\n    case '/':\n      if (right === 0) throw new RangeError('除数不能为 0');\n      return left / right;\n    default: throw new Error('不支持的运算符');\n  }\n}",
        "output": "calculate({left:12,op:'+',right:3}) -> 15\ncalculate({left:1,op:'/',right:0}) -> RangeError",
        "tip": "浮点结果用 `toFixed` 只用于展示，别把四舍五入后的值再拿去继续算。"
      },
      {
        "h": "边界与错误",
        "p": "负号、空格、多个小数点、科学计数法、`Infinity` 都要考虑。`0.1 + 0.2` 会得到 `0.30000000000000004`，展示层格式化，计算层保留原值。除零判断用 `right === 0`，不要用 `!right`。",
        "code": "console.log(0.1 + 0.2);\nconsole.log(Number((0.1 + 0.2).toFixed(2)));",
        "output": "0.30000000000000004\n0.3",
        "tip": "金额计算不要直接 float 累加；学习阶段先知道误差从哪来。"
      },
      {
        "h": "验收与测试",
        "p": "至少六组：正常加减乘、整除、除零、格式错误。断言 `ok`、`value` 或 `error` 的具体内容，不要只断言“没抛异常”。",
        "code": "const cases = [\n  ['12 + 3', 15],\n  ['7 / 2', 3.5],\n  ['1 / 0', '除数不能为 0']\n];\nfor (const [expr, want] of cases) {\n  const got = safeCalc(expr);\n  console.assert(got.ok ? got.value === want : got.error === want, expr);\n}",
        "output": "通过：3 组\n失败：打印表达式",
        "tip": "错误信息也是产品的一部分，断言它的关键词。"
      },
      {
        "h": "新手加练与扩展",
        "p": "把表达式扩展成多运算符（先乘除后加减），再支持括号。此时不要硬写正则，改用 tokenizer + 栈。做完后你会明白：语法解析不是玄学，是分层。",
        "code": "",
        "output": "",
        "tip": "功能扩展前先保证错误路径可读；否则越加越不敢改。"
      }
    ],
    "points": [
      "解析、计算、展示三层分开。",
      "除零和格式错误要分开提示。",
      "浮点误差在展示层处理。"
    ],
    "practice": "实现 `safeCalc(expr)`，返回 `{ok, value}` 或 `{ok:false, error}`，覆盖六组用例。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch4": {
    "id": "ch4-capstone",
    "title": "加餐：写一个函数工具库",
    "minutes": 45,
    "lead": "把 `once`、`debounce`、`throttle` 三个高频函数亲手写一遍。它们短，但能把闭包、定时器和 this 一次串起来。",
    "sections": [
      {
        "h": "需求现场",
        "p": "按钮重复点击会发多次请求；搜索框每输入一个字符就请求一次；滚动事件触发太密。三个问题对应三个工具：once 只执行一次，debounce 停止输入后再执行，throttle 固定间隔最多执行一次。",
        "code": "",
        "output": "",
        "tip": "先明确触发策略，再写定时器；不然三个函数会写成同一个东西。"
      },
      {
        "h": "设计与数据流",
        "p": "三个函数都返回新函数，内部用闭包保存状态：once 用 `called` 布尔；debounce 用 `timer`；throttle 用 `last` 时间戳。返回的函数要透传 `this` 和参数。",
        "code": "function once(fn) {\n  let called = false, result;\n  return function (...args) {\n    if (!called) { called = true; result = fn.apply(this, args); }\n    return result;\n  };\n}",
        "output": "const init = once(() => console.log('init'));\ninit(); init(); // 只输出一次",
        "tip": "用 `function` 而不是箭头函数，才能保留调用方的 this。"
      },
      {
        "h": "最小实现",
        "p": "debounce 每次清掉旧 timer，延迟结束后执行；throttle 用 `now - last >= wait` 判断，必要时用定时器补最后一次。先实现 leading 版本，再考虑 trailing。",
        "code": "function debounce(fn, wait = 300) {\n  let timer = null;\n  return function (...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), wait);\n  };\n}\nfunction throttle(fn, wait = 300) {\n  let last = 0;\n  return function (...args) {\n    const now = Date.now();\n    if (now - last >= wait) { last = now; fn.apply(this, args); }\n  };\n}",
        "output": "debounce：连续输入只执行最后一次\nthrottle：300ms 内最多执行一次",
        "tip": "先写 leading 版本，再补 trailing；不要一上来就写“完美版”。"
      },
      {
        "h": "边界与错误",
        "p": "组件卸载时要能取消 timer，否则回调可能操作已经销毁的 DOM。给 debounce 增加 `cancel()`。另外，`wait=0`、系统时间回拨、递归调用都要有可预期行为。",
        "code": "function debounce(fn, wait = 300) {\n  let timer = null;\n  function wrapped(...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), wait);\n  }\n  wrapped.cancel = () => clearTimeout(timer);\n  return wrapped;\n}",
        "output": "wrapped.cancel() 后不再执行待定回调",
        "tip": "凡是创建定时器的工具，都要提供取消入口。"
      },
      {
        "h": "验收与测试",
        "p": "用假定时器或真实短延迟测：once 调用三次只执行一次；debounce 连续调用五次只执行一次；throttle 在 100ms 内调用五次，最多执行两次。再测 this 和参数是否透传。",
        "code": "let n = 0;\nconst d = debounce(() => n++, 50);\nd(); d(); d();\nsetTimeout(() => console.assert(n === 1), 80);",
        "output": "通过：n=1",
        "tip": "测试 debounce 不要用 0ms，事件循环顺序会让结果不稳定。"
      },
      {
        "h": "新手加练与扩展",
        "p": "给 debounce 加 `immediate` 选项，给 throttle 加 `trailing` 选项；再写一个 `memoize`，用 Map 缓存参数。最后比较 lodash 的实现，看看自己漏了哪些边界。",
        "code": "",
        "output": "",
        "tip": "先自己写，再看库；差异就是你要补的知识点。"
      }
    ],
    "points": [
      "闭包保存状态，返回函数透传 this。",
      "debounce 清旧定时器，throttle 看时间差。",
      "定时器工具必须能取消。"
    ],
    "practice": "实现 once/debounce/throttle，并写一个 10 行内的测试脚本验证调用次数。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch5": {
    "id": "ch5-capstone",
    "title": "加餐：做一次 this 绑定诊断",
    "minutes": 45,
    "lead": "同一段方法，放在对象里、解构出来、传给回调，this 可能完全不同。写一个小诊断器，把四种调用方式的 this 打出来。",
    "sections": [
      {
        "h": "需求现场",
        "p": "面试和真实 bug 都爱考 this：`const f = obj.method; f()` 为什么丢 this？箭头函数为什么绑不住？`bind` 和 `call` 有什么区别？别背答案，做一个可运行的对照表。",
        "code": "",
        "output": "",
        "tip": "把调用方式和 this 的对应关系写成表，比记口诀可靠。"
      },
      {
        "h": "设计与数据流",
        "p": "准备一个普通函数和一个箭头函数，分别用五种方式调用：方法调用、裸调用、call、apply、bind、回调。每次输出 `this.tag`，没有 tag 就输出 `undefined/globalThis`。",
        "code": "const obj = {\n  tag: 'obj',\n  normal() { return this && this.tag; },\n  arrow: () => this && this.tag\n};",
        "output": "obj.normal() -> 'obj'\nconst f = obj.normal; f() -> undefined（严格模式）",
        "tip": "严格模式和非严格模式的裸调用结果不同，实验要标明模式。"
      },
      {
        "h": "最小实现",
        "p": "写 `describeThis(label, fn)`，捕获返回值并打印。注意：箭头函数的 this 来自定义时的外层，不是调用时。`bind` 返回新函数，不会改变原函数。",
        "code": "function describeThis(label, fn) {\n  try { console.log(label, '=>', fn()); }\n  catch (e) { console.log(label, '=>', e.name); }\n}\ndescribeThis('method', () => obj.normal());\ndescribeThis('detached', () => { const f = obj.normal; return f(); });",
        "output": "method => obj\ndetached => undefined",
        "tip": "用箭头包一层会改变 this 现场，诊断器本身要用普通调用。"
      },
      {
        "h": "边界与错误",
        "p": "三个坑：回调里用箭头函数，this 来自外层；`bind` 只能绑一次，再 bind 不会覆盖；构造函数里返回对象会替换 this。class 方法默认严格模式，裸调用直接 undefined。",
        "code": "function Point() { this.x = 1; return { y: 2 }; }\nconsole.log(new Point());",
        "output": "{ y: 2 }（返回对象覆盖了新实例）",
        "tip": "构造函数里不要随便 return 对象，这是 this 最隐蔽的坑之一。"
      },
      {
        "h": "验收与测试",
        "p": "给每种调用方式写期望值，逐个断言。特别加一组：`obj.normal.call({tag:'other'})` 应得到 other；`bound.call(other)` 仍然是原绑定对象。",
        "code": "const bound = obj.normal.bind({ tag: 'bound' });\nconsole.assert(bound.call({ tag: 'other' }) === 'bound');",
        "output": "通过：bound",
        "tip": "bind 的优先级高于 call/apply，这条要单独测。"
      },
      {
        "h": "新手加练与扩展",
        "p": "把诊断器做成页面：选择调用方式，实时显示 this。再加一个“修复建议”，告诉用户该用 bind、箭头函数还是保存变量。做完这一题，this 题基本不会再靠猜。",
        "code": "",
        "output": "",
        "tip": "能解释“为什么丢”，比记住“用 bind”更重要。"
      }
    ],
    "points": [
      "this 由调用方式决定，箭头函数例外。",
      "bind 返回新函数，绑定不可覆盖。",
      "class 方法默认严格模式。"
    ],
    "practice": "列出六种调用方式的实际 this，并写一页诊断器复现。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch6": {
    "id": "ch6-capstone",
    "title": "加餐：闭包计数器与模块缓存",
    "minutes": 45,
    "lead": "用闭包做一个只能通过接口修改的计数器，再把它包装成模块，体会“私有状态”和“单例缓存”怎么来的。",
    "sections": [
      {
        "h": "需求现场",
        "p": "页面上有多个计数器，每个独立计数；外部不能直接改数字；刷新后能从 localStorage 恢复。要求不污染全局，也不让两个计数器串数据。",
        "code": "",
        "output": "",
        "tip": "先想清楚“谁拥有状态”，再决定用闭包还是类。"
      },
      {
        "h": "设计与数据流",
        "p": "工厂函数 `createCounter(key)` 内部保存 `count`，返回 `{inc, dec, value}`。localStorage 只存值，不存函数。多个实例用不同 key，互不影响。",
        "code": "function createCounter(key) {\n  let count = Number(localStorage.getItem(key) || 0);\n  return {\n    inc: () => { count += 1; localStorage.setItem(key, count); return count; },\n    value: () => count\n  };\n}",
        "output": "counter.inc() -> 1\ncounter.value() -> 1",
        "tip": "闭包里的 count 外部拿不到，只能通过返回的方法改。"
      },
      {
        "h": "最小实现",
        "p": "再写一个 `createRegistry()` 缓存计数器实例：同一个 key 第二次调用返回同一个对象。这就是最简单的模块单例。",
        "code": "function createRegistry() {\n  const map = new Map();\n  return function get(key) {\n    if (!map.has(key)) map.set(key, createCounter(key));\n    return map.get(key);\n  };\n}\nconst getCounter = createRegistry();",
        "output": "getCounter('a') === getCounter('a') -> true\ngetCounter('a') !== getCounter('b') -> true",
        "tip": "缓存 key 要稳定；用对象当 key 时，Map 比普通对象更安全。"
      },
      {
        "h": "边界与错误",
        "p": "localStorage 可能不可用（隐私模式、配额满），要 try/catch；计数可能被写成字符串，读出来要 Number；多标签页同时改同一个 key 会覆盖，需要 storage 事件或版本号。",
        "code": "try { localStorage.setItem('n', '1'); }\ncatch (e) { console.warn('存储不可用', e.name); }",
        "output": "存储不可用时降级到内存计数",
        "tip": "不要把 localStorage 当数据库；它没有事务，也没有并发保护。"
      },
      {
        "h": "验收与测试",
        "p": "断言两个 key 独立、同一 key 单例、刷新后恢复、存储异常不崩溃。测试前清空 localStorage，避免用例互相污染。",
        "code": "localStorage.clear();\nconst a = getCounter('a'), b = getCounter('b');\na.inc(); b.inc(); b.inc();\nconsole.assert(a.value() === 1 && b.value() === 2);",
        "output": "通过：a=1, b=2",
        "tip": "测试有状态的模块，每个用例前都要重置环境。"
      },
      {
        "h": "新手加练与扩展",
        "p": "把计数器改成带订阅的版本：值变化时通知监听者；再加一个 `reset`。然后比较闭包写法和 class 写法的可读性，选出适合团队的版本。",
        "code": "",
        "output": "",
        "tip": "闭包不是越用越好；状态多、需要继承时，class 可能更清楚。"
      }
    ],
    "points": [
      "闭包可以保存私有状态。",
      "工厂 + Map 可以实现模块单例。",
      "本地存储要降级处理。"
    ],
    "practice": "实现 `createCounter(key)` 和 `createRegistry()`，写四组测试覆盖独立、单例、恢复和异常。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch7": {
    "id": "ch7-capstone",
    "title": "加餐：递归树遍历与函数管道",
    "minutes": 45,
    "lead": "把一棵目录树拍平、过滤、排序，再用管道组合起来。练习递归的出口和高阶函数的组合方式。",
    "sections": [
      {
        "h": "需求现场",
        "p": "后端返回嵌套目录：`{name, children}`。前端要显示“所有 .js 文件、按路径排序、只取前 10 个”。直接写三层循环很痛苦，拆成拍平、过滤、排序、截取四步。",
        "code": "",
        "output": "",
        "tip": "复杂数据先拆成小步骤，每一步都可测试。"
      },
      {
        "h": "设计与数据流",
        "p": "`flatten(node)` 返回数组，递归处理 children；`filterByExt` 过滤；`sortByPath` 排序；`take(n)` 截取。每步都是纯函数，输入输出类型稳定。",
        "code": "function flatten(node, base = '') {\n  const path = base ? `${base}/${node.name}` : node.name;\n  const self = [{ ...node, path, children: undefined }];\n  return self.concat((node.children || []).flatMap(child => flatten(child, path)));\n}",
        "output": "flatten(tree).length -> 节点总数\n每项都有 path",
        "tip": "递归函数要有明确出口：没有 children 时返回自身。"
      },
      {
        "h": "最小实现",
        "p": "用 `pipe(...fns)` 把四步串起来。`pipe` 从前往后执行，`compose` 从后往前；先实现 pipe，减少嵌套。",
        "code": "const pipe = (...fns) => input => fns.reduce((value, fn) => fn(value), input);\nconst pickJs = tree => pipe(\n  flatten,\n  list => list.filter(x => x.path.endsWith('.js')),\n  list => list.sort((a, b) => a.path.localeCompare(b.path)),\n  list => list.slice(0, 10)\n)(tree);",
        "output": "pickJs(tree) -> 前 10 个 .js 路径",
        "tip": "`flatMap` 会自动把子数组摊平一层，别再用双重 map。"
      },
      {
        "h": "边界与错误",
        "p": "树可能是 null、children 不是数组、文件名大小写不同、路径分隔符混用。递归深度过大可能爆栈；生产环境的大树可以改用显式栈。",
        "code": "if (!node || typeof node !== 'object') return [];\nconst children = Array.isArray(node.children) ? node.children : [];",
        "output": "空节点 -> []\n非数组 children -> 按空处理",
        "tip": "递归前先校验结构，别让一个脏节点毁掉整棵树。"
      },
      {
        "h": "验收与测试",
        "p": "构造三层树，断言拍平数量、路径正确、过滤只留 .js、排序稳定、截取不超 10。再加一个空树和单节点树。",
        "code": "const tree = { name: 'root', children: [\n  { name: 'a.js' },\n  { name: 'sub', children: [{ name: 'b.js' }] }\n]};\nconsole.assert(flatten(tree).length === 3);\nconsole.assert(flatten(tree)[1].path === 'root/sub');",
        "output": "通过：3 个节点\nroot/sub 路径正确",
        "tip": "测试路径时用完整字符串断言，别只断言文件名。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加一个 `search(keyword)` 管道，按路径包含关键词过滤；再把目录树渲染成缩进列表。最后把递归改成迭代，比较两种写法的可读性和栈风险。",
        "code": "",
        "output": "",
        "tip": "先写递归，理解结构；再写迭代，理解成本。"
      }
    ],
    "points": [
      "递归要有出口和结构校验。",
      "复杂变换拆成纯函数再 pipe。",
      "路径排序用 localeCompare 更稳。"
    ],
    "practice": "实现 flatten/filter/sort/take 四步管道，输出前 10 个 .js 文件路径。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch8": {
    "id": "ch8-capstone",
    "title": "加餐：属性观察器与不可变更新",
    "minutes": 45,
    "lead": "用 getter/setter 观察对象变化，再用展开运算符做不可变更新。理解“改哪里”和“怎么通知”是两件事。",
    "sections": [
      {
        "h": "需求现场",
        "p": "购物车里的数量变化后，小计和总价要自动更新；但业务代码又不想在每个地方手动调 `updateTotal()`。你需要一个最小的响应式机制，而不是直接上框架。",
        "code": "",
        "output": "",
        "tip": "先做最小观察者，再看框架帮你省了哪些事。"
      },
      {
        "h": "设计与数据流",
        "p": "`observable(obj, onChange)` 用 `Object.defineProperty` 包一层 getter/setter；setter 里保存新值并调用 onChange。注意递归代理和数组方法会改变原数组，初学阶段先只观察标量属性。",
        "code": "function observable(target, onChange) {\n  const state = { ...target };\n  return new Proxy(state, {\n    set(obj, key, value) {\n      if (obj[key] !== value) { obj[key] = value; onChange(key, value); }\n      return true;\n    }\n  });\n}",
        "output": "cart.count = 3 -> onChange('count', 3)",
        "tip": "Proxy 能拦截新增属性；defineProperty 只能拦截已声明的属性。"
      },
      {
        "h": "最小实现",
        "p": "写一个购物车：`items` 是数组，`add(item)` 返回新数组，`total()` 用 reduce 求和。所有更新都不改原数组，方便比较前后状态。",
        "code": "const cart = {\n  items: [],\n  add(item) { return { ...this, items: [...this.items, item] }; },\n  total() { return this.items.reduce((n, x) => n + x.price * x.qty, 0); }\n};\nconst next = cart.add({ name: '书', price: 30, qty: 2 });",
        "output": "next.total() -> 60\ncart.items.length -> 0",
        "tip": "展开运算符只做浅拷贝；嵌套对象要逐层复制。"
      },
      {
        "h": "边界与错误",
        "p": "数组的 `push` 会改原数组，不符合不可变；嵌套对象只展开第一层，内层仍然共享引用；Proxy 里 set 返回 false 会抛 TypeError；观察器回调里再改状态可能死循环。",
        "code": "const a = { list: [1] };\nconst b = { ...a };\nb.list.push(2);\nconsole.log(a.list); // [1, 2]，被改了",
        "output": "[1, 2]",
        "tip": "浅拷贝不是深拷贝；数组方法要先确认会不会原地修改。"
      },
      {
        "h": "验收与测试",
        "p": "断言更新后原对象不变、总价正确、观察器只在新旧值不同时触发。再加一个嵌套更新用例，确认内层也被复制。",
        "code": "let calls = 0;\nconst state = observable({ count: 1 }, () => calls++);\nstate.count = 2; state.count = 2;\nconsole.assert(calls === 1);",
        "output": "通过：calls=1",
        "tip": "相同值重复赋值不应触发通知，先比较再通知。"
      },
      {
        "h": "新手加练与扩展",
        "p": "把观察器升级成 `subscribe(path, fn)`，支持 `user.name` 这种路径；再实现 `produce(state, draft => { draft.count++ })` 的简化版。做完再去看 Immer 的设计，会很有感觉。",
        "code": "",
        "output": "",
        "tip": "响应式的核心是“变化检测 + 通知”，不是 API 数量。"
      }
    ],
    "points": [
      "不可变更新要逐层复制。",
      "Proxy 可拦截新增属性。",
      "通知前先比较新旧值。"
    ],
    "practice": "写一个 observable 购物车，验证原对象不变、总价正确、重复赋值不重复通知。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch9": {
    "id": "ch9-capstone",
    "title": "加餐：把继承改成组合",
    "minutes": 45,
    "lead": "一个“会飞、会游泳、会唱歌”的类层次很容易爆炸。用组合把能力拆成小对象，再拼出需要的角色。",
    "sections": [
      {
        "h": "需求现场",
        "p": "需求来了：鸭子会游泳，天鹅会飞也会游泳，机器鸭会游泳但不会飞。用继承写，很快出现 `FlyingSwimmingDuck` 这种类；用组合写，能力是积木，角色是拼装。",
        "code": "",
        "output": "",
        "tip": "先问“它做什么”，再问“它是什么”；组合通常更稳。"
      },
      {
        "h": "设计与数据流",
        "p": "把能力写成函数或对象：`canSwim`、`canFly`、`canSing`。角色工厂接收能力列表，把方法混入实例。冲突时明确覆盖顺序，别让后加的能力悄悄改掉前面的。",
        "code": "const canSwim = { swim() { return `${this.name} 在游泳`; } };\nconst canFly = { fly() { return `${this.name} 在飞`; } };\nfunction createDuck(name, abilities) {\n  return Object.assign({ name }, ...abilities);\n}",
        "output": "createDuck('天鹅', [canSwim, canFly]).fly() -> '天鹅 在飞'",
        "tip": "组合不是继承的替代品；需要多态和模板方法时，class 仍然有用。"
      },
      {
        "h": "最小实现",
        "p": "再加一个 `canSing`，用工厂创建三种角色，断言只有具备能力的角色才有对应方法。用 `Object.hasOwn` 检查，避免原型链误判。",
        "code": "const swan = createDuck('天鹅', [canSwim, canFly, canSing]);\nconst robot = createDuck('机器鸭', [canSwim]);\nconsole.assert(Object.hasOwn(swan, 'fly'));\nconsole.assert(!Object.hasOwn(robot, 'fly'));",
        "output": "天鹅有 fly\n机器鸭没有 fly",
        "tip": "用 `Object.hasOwn` 判断实例能力，别用 `in` 把原型上的也算进来。"
      },
      {
        "h": "边界与错误",
        "p": "能力对象里的方法同名会互相覆盖；`Object.assign` 是浅拷贝，能力对象内部的共享状态会被所有角色共用；组合过多时，调试要看能力清单。",
        "code": "const abilities = [canSwim, canFly];\nconst duck = createDuck('鸭', abilities);\nduck.abilities = abilities;",
        "output": "duck.abilities -> [canSwim, canFly]",
        "tip": "把能力清单挂在实例上，出问题时能一眼看出它被装了什么。"
      },
      {
        "h": "验收与测试",
        "p": "为每个角色断言能力集合，再断言调用不存在的能力会抛 TypeError。加一个同名能力覆盖用例，确认覆盖顺序符合文档。",
        "code": "console.assert(typeof swan.fly === 'function');\nconsole.assert(typeof robot.fly !== 'function');\ntry { robot.fly(); } catch (e) { console.assert(e instanceof TypeError); }",
        "output": "通过：天鹅能飞，机器鸭调用 fly 抛 TypeError",
        "tip": "能力组合的测试重点是“有没有”和“调用结果”，不是类名。"
      },
      {
        "h": "新手加练与扩展",
        "p": "把能力改成带依赖的工厂：`canFly` 需要 `energy`，`canSwim` 需要 `water`。再加一个 `describe()` 输出能力清单。最后比较组合与继承的代码行数。",
        "code": "",
        "output": "",
        "tip": "当组合开始需要依赖注入，说明你正在接近真正的架构设计。"
      }
    ],
    "points": [
      "组合把能力拆成可拼装的积木。",
      "同名能力要定义覆盖顺序。",
      "共享状态不要放进能力对象。"
    ],
    "practice": "用组合实现天鹅、鸭、机器鸭，断言能力有无和调用结果。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch10": {
    "id": "ch10-capstone",
    "title": "加餐：不可变购物车",
    "minutes": 45,
    "lead": "用不可变数据做一个购物车：加商品、改数量、删商品、算总价，每一步都返回新对象，旧状态随时可回滚。",
    "sections": [
      {
        "h": "需求现场",
        "p": "用户点“撤销”要回到上一步；多人协作要比较前后状态；React 类组件要靠引用变化触发更新。这些场景都要求“更新不原地改”。购物车是最好的练习场。",
        "code": "",
        "output": "",
        "tip": "先接受“每次返回新对象”的约束，再体会它带来的可预测性。"
      },
      {
        "h": "设计与数据流",
        "p": "状态结构：`{items: [{id, name, price, qty}]}`。四个操作：add、updateQty、remove、total。每个操作返回新状态；查找用 id，不用数组下标。",
        "code": "const initial = { items: [] };\nfunction add(state, item) {\n  return { ...state, items: [...state.items, { ...item, qty: item.qty ?? 1 }] };\n}",
        "output": "add(initial, {id:'a', name:'书', price:30}) -> 新状态",
        "tip": "用 id 定位商品；下标会因删除而变化。"
      },
      {
        "h": "最小实现",
        "p": "`updateQty` 用 map 返回新数组；`remove` 用 filter；`total` 用 reduce。数量为 0 时是删除还是保留，要写进规则。",
        "code": "function updateQty(state, id, qty) {\n  return { ...state, items: state.items.map(x => x.id === id ? { ...x, qty } : x) };\n}\nfunction remove(state, id) {\n  return { ...state, items: state.items.filter(x => x.id !== id) };\n}\nfunction total(state) {\n  return state.items.reduce((n, x) => n + x.price * x.qty, 0);\n}",
        "output": "total(updateQty(state,'a',3)) -> 90",
        "tip": "map/filter 返回新数组；reduce 只读，不修改累加项。"
      },
      {
        "h": "边界与错误",
        "p": "重复添加同一 id 是合并数量还是新增一行？数量为负、价格为 NaN、id 不存在，都要有明确处理。浅拷贝只复制一层，item 内部嵌套对象仍需展开。",
        "code": "if (!Number.isInteger(qty) || qty < 0) throw new RangeError('数量必须是非负整数');\nif (!Number.isFinite(price)) throw new TypeError('价格非法');",
        "output": "qty=-1 -> RangeError\nprice=NaN -> TypeError",
        "tip": "金额和数量在入口校验，别让脏数据流进状态。"
      },
      {
        "h": "验收与测试",
        "p": "每步都断言新对象、旧对象不变、总价正确。再加“删除不存在的 id 不报错但状态不变”的用例。用 `Object.freeze` 冻住旧状态，能更早发现误改。",
        "code": "const s1 = add(initial, { id: 'a', price: 30, qty: 2 });\nconst s2 = updateQty(s1, 'a', 3);\nconsole.assert(s1.items[0].qty === 2);\nconsole.assert(total(s2) === 90);",
        "output": "通过：s1 仍是 2，s2 总价 90",
        "tip": "测试不可变更新，必须保留旧状态引用并断言它没变。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加一个 `history` 数组保存每次状态，实现 undo/redo；再加优惠券规则（满减/折扣）。最后用 `structuredClone` 做深拷贝对比，理解浅拷贝的边界。",
        "code": "",
        "output": "",
        "tip": "不可变不是性能优化，首先是正确性和可回滚性。"
      }
    ],
    "points": [
      "更新返回新对象，旧状态可回滚。",
      "用 id 定位，不依赖下标。",
      "入口校验数量与金额。"
    ],
    "practice": "实现 add/updateQty/remove/total，写五组测试含旧状态不变和非法输入。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch11": {
    "id": "ch11-capstone",
    "title": "加餐：销售数据统计管道",
    "minutes": 45,
    "lead": "给一组订单，算出总销售额、每个品类占比、客单价最高的前三名。用 map/filter/reduce 组合，不写一堆 for 循环。",
    "sections": [
      {
        "h": "需求现场",
        "p": "运营要一张日报：总销售额、订单数、客单价、品类占比、Top 3 客户。数据是数组，每条订单有 customer、category、amount。要求结果可复现，空数据不能崩。",
        "code": "",
        "output": "",
        "tip": "先列指标定义，再写代码；客单价是总额除以订单数还是客户数，要先确认。"
      },
      {
        "h": "设计与数据流",
        "p": "四步：过滤有效订单（金额 > 0）→ 按客户聚合 → 按品类聚合 → 计算占比和排名。聚合用 reduce，排序用 sort，展示用 map。每一步输出中间结构，方便调试。",
        "code": "const orders = [\n  { customer: 'Ada', category: '书', amount: 30 },\n  { customer: 'Ada', category: '笔', amount: 10 },\n  { customer: 'Bob', category: '书', amount: 50 }\n];",
        "output": "total=90, orders=3, avg=30",
        "tip": "金额单位统一用分或元，别一半元一半分。"
      },
      {
        "h": "最小实现",
        "p": "`sumBy` 和 `groupBy` 两个通用函数先写好，再拼业务。`sumBy` 用 reduce；`groupBy` 用 Map 或对象。Top 3 先排序再 slice，不要遍历找三次。",
        "code": "function sumBy(list, key) {\n  return list.reduce((n, x) => n + x[key], 0);\n}\nfunction groupBy(list, key) {\n  return list.reduce((map, x) => {\n    const k = x[key];\n    (map[k] ||= []).push(x);\n    return map;\n  }, {});\n}",
        "output": "sumBy(orders,'amount') -> 90\ngroupBy(orders,'customer') -> {Ada:[...],Bob:[...]}",
        "tip": "`||=` 先初始化再 push，比 if 判断短，但要注意它只适合对象/数组。"
      },
      {
        "h": "边界与错误",
        "p": "空数组、金额为字符串、客户名为空、品类缺失、并列排名都要处理。`sort` 默认按字符串排，金额排序必须给比较器。占比要防止除零。",
        "code": "const avg = orders.length ? sumBy(orders, 'amount') / orders.length : 0;\nconst ratio = total ? categoryTotal / total : 0;",
        "output": "空数据 -> avg=0, ratio=0",
        "tip": "所有除法都要先问分母为 0 时返回什么。"
      },
      {
        "h": "验收与测试",
        "p": "用固定数据断言总额、订单数、客单价、品类占比之和为 1、Top 3 顺序。再加空数据、单条数据、金额为 0 的订单。",
        "code": "const report = buildReport(orders);\nconsole.assert(report.total === 90);\nconsole.assert(report.byCategory['书'].ratio === 80 / 90);",
        "output": "通过：total=90，书占比 88.9%",
        "tip": "占比断言用近似值或分数，浮点直接相等很容易挂。"
      },
      {
        "h": "新手加练与扩展",
        "p": "把日报扩展成按天分组，输出最近 7 天趋势；再加“同比/环比”。数据量大时，考虑一次遍历同时累加多个指标，而不是反复 reduce。",
        "code": "",
        "output": "",
        "tip": "先正确，再优化遍历次数；一开始就炫技容易写错。"
      }
    ],
    "points": [
      "先定义指标，再写聚合。",
      "sumBy/groupBy 可复用。",
      "除法要处理分母为 0。"
    ],
    "practice": "实现 buildReport(orders)，输出总额、订单数、客单价、品类占比、Top 3 客户。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch12": {
    "id": "ch12-capstone",
    "title": "加餐：惰性分页生成器",
    "minutes": 45,
    "lead": "数据有 10 万条，页面一次只要 20 条。用生成器按页产出，避免一次性把整个数组读进内存。",
    "sections": [
      {
        "h": "需求现场",
        "p": "接口一次返回全量数据，但表格只显示当前页。新手常写 `data.slice(page*20, page*20+20)`，这没问题；但如果数据是流式读取或数据库游标，就需要生成器按需拉取。",
        "code": "",
        "output": "",
        "tip": "分页不是切数组，是“按需取下一批”；先把需求分清。"
      },
      {
        "h": "设计与数据流",
        "p": "`paginate(source, size)` 返回生成器，每次 `next()` 产出一页。source 可以是数组，也可以是 `fetchPage(offset)` 函数。生成器内部保存 offset，调用方控制节奏。",
        "code": "function* paginate(source, size = 20) {\n  for (let i = 0; i < source.length; i += size) {\n    yield source.slice(i, i + size);\n  }\n}",
        "output": "for (const page of paginate([1,2,3,4,5], 2)) -> [1,2], [3,4], [5]",
        "tip": "生成器是惰性的；不调用 next 就不会计算下一页。"
      },
      {
        "h": "最小实现",
        "p": "加一个 `takePages(gen, n)` 只取前 n 页，再加 `toArray` 收集。注意 `for...of` 会自动消费到结束，调试时别不小心把生成器跑完。",
        "code": "function take(gen, n) {\n  const out = [];\n  for (const page of gen) {\n    out.push(page);\n    if (out.length === n) break;\n  }\n  return out;\n}",
        "output": "take(paginate([1,2,3,4,5], 2), 2) -> [[1,2],[3,4]]",
        "tip": "生成器只能消费一次；需要重复用就重新创建。"
      },
      {
        "h": "边界与错误",
        "p": "size=0 会死循环；source 为空要返回空；异步分页要用 `async function*` + `for await`；提前 break 后生成器的 finally 是否执行，要心里有数。",
        "code": "function* safePaginate(source, size) {\n  if (!Number.isInteger(size) || size <= 0) throw new RangeError('size 必须为正整数');\n  for (let i = 0; i < source.length; i += size) yield source.slice(i, i + size);\n}",
        "output": "size=0 -> RangeError",
        "tip": "生成器参数也要校验，0 会导致无限循环。"
      },
      {
        "h": "验收与测试",
        "p": "断言页数、每页长度、最后一页不足 size、空数组零页、take 只消费前 n 页。再加一个计数源，确认没有提前读取。",
        "code": "let reads = 0;\nconst source = new Proxy([1,2,3,4], { get(t, k) { if (k !== 'length') reads++; return t[k]; } });\nfor (const page of paginate(source, 2)) break;\nconsole.assert(reads <= 2);",
        "output": "通过：只读了第一页",
        "tip": "用 Proxy 计数能验证“惰性”不是嘴上说说。"
      },
      {
        "h": "新手加练与扩展",
        "p": "把数组源换成 `fetchPage(offset, limit)`，写成 `async function*`；再加一个 `mapPage` 转换器。最后接一个虚拟列表，体会流式分页的完整链路。",
        "code": "",
        "output": "",
        "tip": "同步生成器会了，再上异步；两者结构一样，等待位置不同。"
      }
    ],
    "points": [
      "生成器按需产出，不一次算完。",
      "生成器只能消费一次。",
      "size 必须校验，0 会死循环。"
    ],
    "practice": "实现 paginate/take，验证页数、末页长度、空数组和惰性读取。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch13": {
    "id": "ch13-capstone",
    "title": "加餐：日志解析器",
    "minutes": 45,
    "lead": "一行日志里同时有日期、级别、用户、消息。用正则拆字段，用 Map 统计级别，用 JSON 输出结构化结果。",
    "sections": [
      {
        "h": "需求现场",
        "p": "运维给你 1000 行日志：`2026-11-25 10:12:33 ERROR user=ada msg=timeout`。要统计每个级别多少条、每个用户多少条，还要把结果导出 JSON 给前端图表。",
        "code": "",
        "output": "",
        "tip": "先拿三条样本手写解析，再写正则；不要一上来就写大正则。"
      },
      {
        "h": "设计与数据流",
        "p": "解析函数返回 `{time, level, user, msg}`；解析失败返回 null 并计数；统计用 Map；最后 `Object.fromEntries` 转普通对象。正则只匹配固定前缀，msg 允许空格。",
        "code": "const line = '2026-11-25 10:12:33 ERROR user=ada msg=timeout';\nconst re = /^(\\S+ \\S+) (\\w+) user=(\\S+) msg=(.+)$/;",
        "output": "match -> ['2026-11-25 10:12:33','ERROR','ada','timeout']",
        "tip": "正则里用 `.+` 吃掉消息剩余部分，不要用 `\\S+` 把空格截断。"
      },
      {
        "h": "最小实现",
        "p": "写 `parseLine` 和 `summarize`。summarize 遍历行，解析成功才计数；失败的行收集到 `badLines`，方便回看。",
        "code": "function parseLine(line) {\n  const m = line.match(/^(\\S+ \\S+) (\\w+) user=(\\S+) msg=(.+)$/);\n  if (!m) return null;\n  return { time: m[1], level: m[2], user: m[3], msg: m[4] };\n}\nfunction summarize(lines) {\n  const levels = new Map(), users = new Map(), badLines = [];\n  for (const line of lines) {\n    const row = parseLine(line);\n    if (!row) { badLines.push(line); continue; }\n    levels.set(row.level, (levels.get(row.level) || 0) + 1);\n    users.set(row.user, (users.get(row.user) || 0) + 1);\n  }\n  return { levels, users, badLines };\n}",
        "output": "summarize(lines).levels -> Map { 'ERROR' => 2, 'INFO' => 1 }",
        "tip": "Map 的 get 可能返回 undefined，累加前给 0。"
      },
      {
        "h": "边界与错误",
        "p": "日志格式变体、时区、消息里带 `user=`、空行、超长行、正则灾难性回溯。不要用贪婪嵌套量词；先按行 split，再逐行匹配。",
        "code": "const lines = text.split(/\\r?\\n/).filter(Boolean);\nif (line.length > 5000) return null;",
        "output": "空行被过滤；超长行标记为坏行",
        "tip": "日志解析要能容忍坏行，不能一坏就全挂。"
      },
      {
        "h": "验收与测试",
        "p": "给正常行、缺字段、消息带空格、空行、超长行五组样本。断言统计数量、坏行数量、JSON 可序列化。",
        "code": "const report = summarize(lines);\nconsole.assert(report.levels.get('ERROR') === 2);\nconsole.assert(report.badLines.length === 1);\nJSON.stringify(Object.fromEntries(report.levels));",
        "output": "通过：ERROR=2，badLines=1\nJSON: {\"ERROR\":2}",
        "tip": "Map 不能直接 JSON.stringify，要先转对象或数组。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加时间范围过滤、按用户分组统计、导出 CSV；再写一个流式版本，用 `readline` 逐行处理，避免一次读入大文件。Node 里用 `readline.createInterface` 很顺手。",
        "code": "",
        "output": "",
        "tip": "数据一大，流式处理就从加分项变成必选项。"
      }
    ],
    "points": [
      "正则只拆固定结构，消息用 .+。",
      "坏行单独收集，不中断统计。",
      "Map 转 JSON 要先转对象。"
    ],
    "practice": "实现 parseLine/summarize，统计级别和用户，输出坏行数量与 JSON。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch14": {
    "id": "ch14-capstone",
    "title": "加餐：待办清单 DOM 渲染",
    "minutes": 45,
    "lead": "用原生 DOM 把数据渲染成列表：新增、完成、删除、过滤。重点不是好看，而是“数据变了，视图怎么跟着变”。",
    "sections": [
      {
        "h": "需求现场",
        "p": "一个待办清单：输入框回车新增；点击复选框切换完成；点删除移除；顶部有“全部/未完成/已完成”过滤。要求不引入框架，纯 DOM。",
        "code": "",
        "output": "",
        "tip": "先写数据操作，再写渲染；不要边点边拼 HTML 字符串。"
      },
      {
        "h": "设计与数据流",
        "p": "状态 `{items: [{id, text, done}], filter: 'all'}`。操作函数返回新状态；`render(state)` 根据过滤结果重建列表。每次操作后调用一次 render，保证视图和数据一致。",
        "code": "const state = { items: [], filter: 'all' };\nfunction visibleItems(state) {\n  if (state.filter === 'done') return state.items.filter(x => x.done);\n  if (state.filter === 'active') return state.items.filter(x => !x.done);\n  return state.items;\n}",
        "output": "filter=active -> 只返回未完成项",
        "tip": "过滤是纯函数，别在 render 里混入业务判断。"
      },
      {
        "h": "最小实现",
        "p": "用 `document.createElement` 创建 li，复选框和删除按钮各绑事件；文本用 `textContent`，不要用 `innerHTML` 拼用户输入。",
        "code": "function render(state) {\n  const list = document.querySelector('#list');\n  list.replaceChildren();\n  for (const item of visibleItems(state)) {\n    const li = document.createElement('li');\n    const box = document.createElement('input');\n    box.type = 'checkbox'; box.checked = item.done;\n    box.addEventListener('change', () => toggle(item.id));\n    const span = document.createElement('span');\n    span.textContent = item.text;\n    li.append(box, span);\n    list.append(li);\n  }\n}",
        "output": "列表只显示可见项\n用户输入按纯文本渲染",
        "tip": "`textContent` 防 XSS；`innerHTML` 只适合完全可信的静态模板。"
      },
      {
        "h": "边界与错误",
        "p": "空输入不能新增；重复 id 会串事件；删除后焦点丢失；过滤后空列表要有空状态；事件绑定在重建后要重新挂。用事件委托可以减少重复绑定。",
        "code": "if (!text.trim()) return state;\nconst id = crypto.randomUUID();",
        "output": "空输入 -> 状态不变",
        "tip": "每次重建列表都会丢事件，事件委托挂在父容器上更稳。"
      },
      {
        "h": "验收与测试",
        "p": "用 jsdom 或浏览器控制台测：新增两条、切换一条、过滤、删除，断言 DOM 数量和文本。再测空输入和 XSS 字符串。",
        "code": "add('买牛奶'); add('写代码');\ntoggle(state.items[0].id);\nrender(state);\nconsole.assert(document.querySelectorAll('#list li').length === 2);",
        "output": "通过：2 条\nXSS 字符串按文本显示",
        "tip": "DOM 测试断言结构和文本，别只断言函数返回值。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加编辑功能、拖拽排序、localStorage 持久化；再用 `<template>` 优化渲染。最后对比 React 的 diff，理解“全量重建”和“最小更新”的成本差异。",
        "code": "",
        "output": "",
        "tip": "先能稳定全量渲染，再谈性能优化；小列表全量重建通常够用。"
      }
    ],
    "points": [
      "数据和视图分离，操作后统一 render。",
      "用户输入用 textContent。",
      "重建列表优先用事件委托。"
    ],
    "practice": "实现待办清单的新增、切换、删除、过滤，并用 DOM 断言验证。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch15": {
    "id": "ch15-capstone",
    "title": "加餐：表单校验与事件委托",
    "minutes": 45,
    "lead": "一个表单有十几个字段，逐个绑 blur 事件很累。用事件委托在表单根节点统一监听，再按 name 分派校验。",
    "sections": [
      {
        "h": "需求现场",
        "p": "注册表单要校验用户名长度、邮箱格式、密码强度、确认密码一致。错误提示要贴在字段下方，提交时全部校验，不能只校验当前字段。",
        "code": "",
        "output": "",
        "tip": "先定义每个字段的规则，再决定事件绑在哪。"
      },
      {
        "h": "设计与数据流",
        "p": "规则表 `rules[name] = [validator...]`；每个 validator 返回 `null` 或错误文案。事件委托监听 `input` 和 `blur`，用 `event.target.name` 找规则。提交时遍历所有字段。",
        "code": "const rules = {\n  username: [v => v.length >= 3 || '至少 3 个字符'],\n  email: [v => /^[^@]+@[^@]+$/.test(v) || '邮箱格式不对']\n};",
        "output": "rules.username[0]('ab') -> '至少 3 个字符'",
        "tip": "规则函数保持纯函数，方便单测和复用。"
      },
      {
        "h": "最小实现",
        "p": "写 `validateField(name, value)` 和 `showError(name, msg)`；表单根节点监听 `input`，只校验有规则的字段。提交时 `preventDefault`，全部通过才发请求。",
        "code": "form.addEventListener('input', (e) => {\n  const name = e.target.name;\n  if (!rules[name]) return;\n  const msg = validateField(name, e.target.value);\n  showError(name, msg);\n});\nform.addEventListener('submit', (e) => {\n  e.preventDefault();\n  const ok = Object.keys(rules).every(name => !validateField(name, form.elements[name].value));\n  if (ok) submit();\n});",
        "output": "输入时即时提示\n提交时统一拦截",
        "tip": "`form.elements[name]` 比 `querySelector` 稳，能直接拿到同名字段。"
      },
      {
        "h": "边界与错误",
        "p": "密码确认要跟另一个字段比较，规则函数需要拿到整个表单；错误提示不能只显示第一条；提交失败后焦点要移到第一个错误字段；禁用按钮不能代替校验。",
        "code": "function validateConfirm(value, form) {\n  return value === form.elements.password.value || '两次密码不一致';\n}",
        "output": "确认密码不一致 -> 提示",
        "tip": "跨字段校验把 form 传进去，别把规则写死在事件回调里。"
      },
      {
        "h": "验收与测试",
        "p": "逐字段测合法/非法，再测提交时多个错误同时显示、确认密码联动、空表单。断言错误文案和 `aria-invalid`，方便读屏用户。",
        "code": "console.assert(validateField('username', 'ab') === '至少 3 个字符');\nconsole.assert(validateField('username', 'ada') === null);",
        "output": "通过：非法有文案，合法为 null",
        "tip": "错误提示要同时更新可访问性属性，不能只改颜色。"
      },
      {
        "h": "新手加练与扩展",
        "p": "把规则表换成声明式 schema，加异步校验（用户名是否被占用）；再用 `aria-describedby` 把错误提示和字段关联。最后比较受控表单和非受控表单的差异。",
        "code": "",
        "output": "",
        "tip": "异步校验要防竞态：旧请求返回慢，不能覆盖新结果。"
      }
    ],
    "points": [
      "规则表 + 事件委托，减少重复绑定。",
      "跨字段规则要能访问整个表单。",
      "错误提示要兼顾可访问性。"
    ],
    "practice": "实现表单校验：用户名、邮箱、密码、确认密码，提交时统一拦截。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch16": {
    "id": "ch16-capstone",
    "title": "加餐：本地缓存与请求重试",
    "minutes": 45,
    "lead": "接口偶尔超时，用户不想每次刷新都重新请求。做一层带过期时间的缓存，再加指数退避重试。",
    "sections": [
      {
        "h": "需求现场",
        "p": "天气接口 30 分钟内数据不变；网络抖动时请求可能失败一次。要求：优先读缓存；缓存过期再请求；失败自动重试两次；最终失败给出可读提示。",
        "code": "",
        "output": "",
        "tip": "先分清“缓存”和“重试”是两件事，再组合。"
      },
      {
        "h": "设计与数据流",
        "p": "缓存结构 `{data, expireAt}` 存 localStorage；`getCache(key)` 检查过期；`fetchWithRetry(url, retries)` 用循环 + await 延迟。请求成功写缓存，失败抛最后一个错误。",
        "code": "function readCache(key) {\n  const raw = localStorage.getItem(key);\n  if (!raw) return null;\n  const box = JSON.parse(raw);\n  return Date.now() < box.expireAt ? box.data : null;\n}",
        "output": "未过期 -> data\n过期 -> null",
        "tip": "缓存值要带过期时间，不能只存 data。"
      },
      {
        "h": "最小实现",
        "p": "重试采用指数退避：第 1 次等 200ms，第 2 次等 400ms。只对网络错误和 5xx 重试，4xx 不重试。每次失败记录 attempt，方便日志排查。",
        "code": "async function fetchWithRetry(url, retries = 2) {\n  let lastError;\n  for (let attempt = 0; attempt <= retries; attempt++) {\n    try {\n      const res = await fetch(url);\n      if (!res.ok && res.status < 500) throw new Error(`HTTP ${res.status}`);\n      if (!res.ok) throw new Error(`retryable ${res.status}`);\n      return await res.json();\n    } catch (err) {\n      lastError = err;\n      if (attempt < retries) await new Promise(r => setTimeout(r, 200 * 2 ** attempt));\n    }\n }\n  throw lastError;\n}",
        "output": "第 1 次失败等 200ms\n第 2 次失败等 400ms\n最终抛错",
        "tip": "4xx 是客户端错误，重试不会变好；5xx 和网络错误才值得重试。"
      },
      {
        "h": "边界与错误",
        "p": "localStorage 存满会抛 QuotaExceededError；JSON 解析可能失败；缓存 key 要带版本；并发请求可能同时写缓存；用户离线时要走离线提示，不能无限重试。",
        "code": "try { localStorage.setItem(key, JSON.stringify(box)); }\ncatch (e) { console.warn('缓存写入失败', e.name); }",
        "output": "配额满 -> 降级为不缓存",
        "tip": "缓存写入失败不能影响主流程；它只是优化。"
      },
      {
        "h": "验收与测试",
        "p": "用 mock fetch 测：第一次成功、第一次失败第二次成功、全部失败、4xx 不重试、缓存命中不请求。断言调用次数和最终结果。",
        "code": "let calls = 0;\nconst mock = async () => { calls++; if (calls < 2) throw new Error('net'); return { ok: true, json: async () => ({ temp: 20 }) }; };\nawait fetchWithRetryMock(mock);\nconsole.assert(calls === 2);",
        "output": "通过：calls=2",
        "tip": "重试测试要断言调用次数，不然看不出有没有真的重试。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加请求取消（AbortController）、并发去重（同一 URL 只发一次）、缓存版本迁移。再把这些封装成 `cachedFetch`，在真实页面里用起来。",
        "code": "",
        "output": "",
        "tip": "重试不是越多越好；设置上限和总超时，避免用户等太久。"
      }
    ],
    "points": [
      "缓存带过期时间，写入失败可降级。",
      "只对网络错误和 5xx 重试。",
      "指数退避要设上限。"
    ],
    "practice": "实现 readCache/writeCache/fetchWithRetry，测试缓存命中、重试次数和 4xx 不重试。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch17": {
    "id": "ch17-capstone",
    "title": "加餐：Promise 并发池",
    "minutes": 45,
    "lead": "100 个请求同时发出去，浏览器和服务器都受不了。写一个并发池，限制同时最多 3 个任务，全部结束后统一返回。",
    "sections": [
      {
        "h": "需求现场",
        "p": "批量下载 100 张图片，串行太慢，全部并发又会打满连接。目标：最多 3 个并发，任何一个失败不阻塞其他任务，最后返回成功和失败清单。",
        "code": "",
        "output": "",
        "tip": "并发控制的核心是“排队 + 放行”，不是 Promise.all 本身。"
      },
      {
        "h": "设计与数据流",
        "p": "输入任务数组（每个任务返回 Promise），并发数 limit。维护 running 计数和结果数组；一个任务结束后立刻启动下一个。用 Promise.all 包住所有任务的“完成承诺”。",
        "code": "async function pool(tasks, limit = 3) {\n  const results = new Array(tasks.length);\n  let next = 0;\n  async function worker() {\n    while (next < tasks.length) {\n      const i = next++;\n      try { results[i] = { ok: true, value: await tasks[i]() }; }\n      catch (e) { results[i] = { ok: false, error: e.message }; }\n    }\n  }\n  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));\n  return results;\n}",
        "output": "pool(tasks, 3) -> [{ok:true,...}, ...]",
        "tip": "worker 自己取下一个下标，避免提前分配导致空转。"
      },
      {
        "h": "最小实现",
        "p": "加进度回调：每完成一个任务就调用 `onProgress(done, total)`。再加 `settle` 模式，失败也保留结果。注意 limit 为 0 时要抛错，不能死循环。",
        "code": "if (!Number.isInteger(limit) || limit <= 0) throw new RangeError('limit 必须为正整数');\n// 每完成一个：done++; onProgress?.(done, tasks.length);",
        "output": "limit=0 -> RangeError\n进度：1/100, 2/100...",
        "tip": "并发池也要校验参数；0 或负数会让 worker 不启动。"
      },
      {
        "h": "边界与错误",
        "p": "任务不是函数、任务同步抛错、某个任务永远不 resolve、结果顺序错乱、内存占用过大。同步抛错也要包进 Promise，否则 worker 直接崩。",
        "code": "const run = Promise.resolve().then(() => task());\nconst result = await run.catch(e => ({ error: e }));",
        "output": "同步 throw -> 被捕获\n结果仍按原下标排列",
        "tip": "用 `Promise.resolve().then` 把同步异常也变成 rejected Promise。"
      },
      {
        "h": "验收与测试",
        "p": "用延迟不同的假任务测最大并发数不超过 limit、结果顺序正确、失败不阻塞、全部完成。记录峰值 running，断言不超过 3。",
        "code": "let running = 0, peak = 0;\nconst task = () => new Promise(r => { running++; peak = Math.max(peak, running); setTimeout(() => { running--; r(); }, 50); });\nawait pool(Array.from({length: 10}, () => task), 3);\nconsole.assert(peak <= 3);",
        "output": "通过：peak=3",
        "tip": "断言峰值并发，不要只看总耗时。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加优先级队列、动态追加任务、取消整个池；再对比 `Promise.all`、`allSettled`、`race` 的适用场景。最后用真实图片下载跑一次。",
        "code": "",
        "output": "",
        "tip": "并发池不是越快越好；根据目标服务的限流调整 limit。"
      }
    ],
    "points": [
      "并发池 = 排队 + 固定数量 worker。",
      "结果按原下标保存，避免顺序错乱。",
      "同步异常也要变成 rejected Promise。"
    ],
    "practice": "实现 pool(tasks, limit)，断言峰值并发 ≤ 3、失败不阻塞、结果顺序正确。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch18": {
    "id": "ch18-capstone",
    "title": "加餐：迷你测试框架与发布检查",
    "minutes": 45,
    "lead": "写一个 20 行的测试框架：describe、it、expect，能统计通过/失败并在失败时打印差异。再用它给前面的工具库做回归。",
    "sections": [
      {
        "h": "需求现场",
        "p": "项目里已经有十几个小工具，每次改完都手动点页面很累。你需要一个最小测试入口：分组、用例、断言、汇总，最好能一条命令跑完。",
        "code": "",
        "output": "",
        "tip": "先让测试能失败，再让它好看；不会失败的测试没有价值。"
      },
      {
        "h": "设计与数据流",
        "p": "`describe(name, fn)` 收集分组；`it(name, fn)` 执行用例并捕获异常；`expect(actual).toBe(expected)` 抛错。最后输出 `passed/failed` 和失败详情。",
        "code": "const results = [];\nfunction it(name, fn) {\n  try { fn(); results.push({ name, ok: true }); }\n  catch (e) { results.push({ name, ok: false, error: e.message }); }\n}",
        "output": "it 成功 -> {ok:true}\nit 失败 -> {ok:false, error:'...'}",
        "tip": "测试框架本身也要有测试；先用手动断言验证它。"
      },
      {
        "h": "最小实现",
        "p": "实现 `expect` 的 `toBe`、`toEqual`（浅比较）、`toThrow`。`beforeEach` 先不做，保持最小。运行结束后如果有失败，`process.exitCode = 1`。",
        "code": "function expect(actual) {\n  return {\n    toBe(want) { if (actual !== want) throw new Error(`期望 ${want}，实际 ${actual}`); },\n    toEqual(want) { if (JSON.stringify(actual) !== JSON.stringify(want)) throw new Error('对象不相等'); }\n  };\n}",
        "output": "expect(1).toBe(1) -> 通过\nexpect(1).toBe(2) -> 抛错",
        "tip": "`JSON.stringify` 比较对象有顺序问题；教学版够用，生产用 deepEqual。"
      },
      {
        "h": "边界与错误",
        "p": "异步用例要返回 Promise 并 await；一个用例失败不能中断整组；断言错误信息要包含期望值和实际值；测试之间要隔离状态，避免顺序依赖。",
        "code": "async function itAsync(name, fn) {\n  try { await fn(); results.push({ name, ok: true }); }\n  catch (e) { results.push({ name, ok: false, error: e.message }); }\n}",
        "output": "异步失败也被捕获",
        "tip": "异步测试必须 await，否则失败会变成未处理拒绝。"
      },
      {
        "h": "验收与测试",
        "p": "用三个故意失败/成功的用例验证框架：通过、断言失败、抛异常。再跑真实工具库的 once/debounce 测试，确认汇总数量正确。",
        "code": "it('1+1', () => expect(1 + 1).toBe(2));\nit('bad', () => expect(1).toBe(2));\nconsole.assert(results.filter(r => r.ok).length === 1);",
        "output": "通过：1 个通过，1 个失败",
        "tip": "先验证框架能抓到失败，再相信它报的通过。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加 `beforeEach/afterEach`、超时、跳过用例、彩色输出；再把这套测试接到 GitHub Actions。最后比较 Vitest/Jest，列出你的迷你版缺哪些能力。",
        "code": "",
        "output": "",
        "tip": "测试框架的终点不是手写，而是理解断言、隔离和报告三件事。"
      }
    ],
    "points": [
      "describe/it/expect 三件套先跑通。",
      "异步用例必须 await。",
      "失败要包含期望值和实际值。"
    ],
    "practice": "实现迷你测试框架，跑 once/debounce 两组用例，输出通过/失败数量。",
    "source": "本章加餐 · 工程实战工作坊"
  }
};
(function () {
  var chapters = window.JS_COURSE_CHAPTERS || [];
  var addons = window.JS_COURSE_CAPSTONES || {};
  for (var i = 0; i < chapters.length; i += 1) {
    var addon = addons[chapters[i].id];
    if (addon) chapters[i].lessons.push(addon);
  }
})();

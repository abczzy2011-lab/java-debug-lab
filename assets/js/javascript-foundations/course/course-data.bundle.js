/* Generated course data bundle. Source order follows the page. */

/* --- js-ch01.js --- */

window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch1",
  "part": 1,
  "number": "01",
  "title": "浏览器与 Node：JavaScript 的运行现场",
  "summary": "JavaScript 不是只在控制台里飘着的语法。它先被宿主加载，再进入执行上下文，最后才轮到你的代码。本章先把「代码在哪里跑、什么时候跑、出错看哪里」这条链路走通。",
  "goals": [
    "解释 script、defer、async 与模块脚本的加载顺序",
    "分清浏览器与 Node 的全局对象和可用 API",
    "能用 DevTools 断点、调用栈与 Network 面板定位问题",
    "知道 npm script、构建和 source map 各自解决什么"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.1–2；JavaScript 高级程序设计 4th · Ch.1–2；JavaScript 权威指南 7th · Ch.1–2",
  "lessons": [
    {
      "id": "ch1-1",
      "title": "脚本怎样进入页面并开始执行",
      "minutes": 34,
      "lead": "先别急着背语法。把一段 JavaScript 从文件送到浏览器、再到控制台输出，中间至少经过下载、解析、建 DOM、执行四个阶段。理解这条链路，才能解释「为什么代码在元素还没出现时就报 null」。",
      "sections": [
        {
          "h": "三种引入方式，决定了谁先跑",
          "p": "行内 `<script>` 会在解析器遇到它的位置立即执行；外部脚本默认也会阻塞后续 HTML 解析，直到下载并执行完。`defer` 让脚本在文档解析完成后、DOMContentLoaded 之前按顺序执行；`async` 则是下载完就执行，顺序不保证。`type=\"module\"` 默认具有 defer 行为，并且有独立作用域。\n\n判断顺序不要靠猜：在 DevTools 的 Network 面板看请求瀑布，在 Sources 面板看调用栈，再在代码里打一个断点，三处证据拼起来就能还原真实的执行顺序。",
          "code": "<script src=\"app.js\"></script>\n<script defer src=\"init.js\"></script>\n<script async src=\"analytics.js\"></script>\n<script type=\"module\" src=\"main.js\"></script>",
          "output": "普通 script：阻塞解析，按出现顺序执行\ndefer：解析完成后、DOMContentLoaded 前按顺序执行\nasync：下载完立即执行，顺序不保证\nmodule：默认 defer，独立作用域",
          "tip": "给依赖 DOM 的初始化代码加 `defer`，比在文件末尾写 `window.onload` 更精确。`async` 只适合互不依赖的独立脚本。"
        },
        {
          "h": "全局对象与执行上下文",
          "p": "浏览器把全局对象暴露成 `window`，Node 暴露成 `globalThis`（`window` 不存在）。顶层 `var` 和函数声明会成为全局对象的属性；顶层 `let`、`const` 不会，它们只在全局词法环境里可见。严格模式下，普通函数调用的 `this` 是 `undefined`，不是全局对象。\n\n这也是同一段代码在浏览器与 Node 输出不同的常见原因：先确认宿主，再谈结果。",
          "code": "\"use strict\";\nconsole.log(\"browser:\", typeof window);\nconsole.log(\"both:\", typeof globalThis);\nvar legacy = 1;\nlet modern = 2;\nconsole.log(globalThis.legacy);\nconsole.log(globalThis.modern);\nfunction who() { return this; }\nconsole.log(who() === globalThis);",
          "output": "browser: object\nboth: object\n1\nundefined\nfalse",
          "tip": "不要用「浏览器能跑」来证明 Node 能跑。DOM、location、localStorage 都是宿主 API，不是语言本身。"
        },
        {
          "h": "先用证据定位，再改代码",
          "p": "遇到报错时，先读错误类型和第一行调用栈：`TypeError: Cannot read properties of null` 说明取到了 null，不是「DOM 没加载」的万能结论。然后看断点处的 Scope、Watch 和 Network；如果是异步问题，再看调用栈里的微任务和定时器。\n\n`console.log` 适合快速确认值，`console.table` 适合看数组和对象集合，`debugger` 适合停在现场。不要把几十个 log 留在生产代码里。",
          "code": "const rows = [{ id: 1, name: \"Ada\" }, { id: 2, name: \"Grace\" }];\nconsole.table(rows);\ndebugger; // 打开 DevTools 后会停在这里\nconsole.log(document.querySelector(\"#missing\"));",
          "output": "表格：id / name\n1 / Ada\n2 / Grace\nnull（元素不存在）",
          "tip": "报错先看类型与调用栈；`null` 和 `undefined` 要分别判断，不要直接 `.map`。"
        }
      ],
      "points": [
        "脚本的加载方式直接决定执行顺序。",
        "浏览器和 Node 共享语言，但宿主 API 不同。",
        "先读错误栈与断点现场，再决定改哪一行。"
      ],
      "practice": "把同一段 `console.log` 放到浏览器和 Node 各跑一次，记录 `this`、`globalThis` 和 `typeof window` 的差异；再给一段依赖 DOM 的脚本加上 `defer`，观察执行顺序变化。",
      "source": "Head First JavaScript Programming 2nd · Ch.1–2；JavaScript 高级程序设计 4th · Ch.1–2"
    },
    {
      "id": "ch1-2",
      "title": "严格模式、异常与调试入口",
      "minutes": 20,
      "lead": "严格模式让一些“静默失败”变成显式错误；异常让失败有类型和消息；调试入口让你不用猜。三者合起来，才是能维护的脚本。",
      "sections": [
        {
          "h": "严格模式与错误类型",
          "p": "ES 模块默认就是严格模式；普通脚本可以在文件或函数顶部写 `\"use strict\"`。严格模式下给未声明变量赋值、删除不可删除属性、重复参数名都会抛错。抛异常用 `throw new Error(\"...\")`，需要区分类型时用 `TypeError`、`RangeError` 或自定义 `class ValidationError extends Error`。",
          "code": "\"use strict\";\nclass ValidationError extends Error {\n  constructor(message) {\n    super(message);\n    this.name = \"ValidationError\";\n  }\n}\nfunction parseAge(value) {\n  const n = Number(value);\n  if (!Number.isFinite(n) || n < 0) throw new ValidationError(\"年龄必须是非负数字\");\n  return n;\n}\ntry { console.log(parseAge(\"abc\")); }\ncatch (err) { console.log(err.name, err.message); }",
          "output": "ValidationError 年龄必须是非负数字",
          "tip": "捕获异常后要么处理、要么补充上下文再抛出，最忌讳 `catch (e) {}` 静默吞掉。日志里至少保留 `err.name`、`err.message` 和堆栈。"
        },
        {
          "h": "先看栈，再猜原因",
          "p": "浏览器控制台的 `console.table` 适合看数组对象，`console.group` 可以折叠一组日志，`debugger` 会在开发者工具里断住。读异常时先看第一行错误类型和消息，再看栈里第一个属于自己项目的文件与行号。不要一上来就改代码；先确认“哪一行、什么值、违反了什么约束”。",
          "code": "function divide(a, b) {\n  if (b === 0) throw new RangeError(\"除数不能为 0\");\n  return a / b;\n}\ntry {\n  divide(10, 0);\n} catch (err) {\n  console.group(\"divide failed\");\n  console.log(err.name);\n  console.log(err.message);\n  console.groupEnd();\n}",
          "output": "divide failed\nRangeError\n除数不能为 0",
          "tip": "错误消息要写“违反了哪条规则、期望什么”，不要只写“出错了”。线上环境还要考虑避免把内部路径、密钥、用户隐私写进错误消息。"
        }
      ],
      "points": [
        "严格模式把静默失败变成显式错误。",
        "抛错要带类型；捕获后不要静默吞掉。",
        "调试顺序：错误类型 → 消息 → 第一方栈帧 → 当时的值。"
      ],
      "practice": "给一个除法函数补上“除数为 0”的 `RangeError`，再用 `try/catch` 打印错误名与消息；最后故意传字符串，观察 `Number` 转换后的行为。",
      "source": "Head First JavaScript Programming 2nd · Ch.7；JavaScript 高级程序设计 4th · Ch.21；权威指南 7th · Ch.1"
    },
    {
      "id": "ch1-3",
      "title": "Node、REPL 与脚本：同一门语言，不同宿主",
      "minutes": 30,
      "lead": "Node 让 JavaScript 离开浏览器，去读写文件、启动服务器、跑命令行工具。语言还是那门语言，但宿主换了：没有 DOM，换来的是 process、fs、path 和 Buffer。先分清这一点，才不会把浏览器代码原样复制过去。",
      "sections": [
        {
          "h": "Node 的全局对象与模块系统",
          "p": "Node 顶层没有 `window`，但有 `globalThis`、`process`、`Buffer` 和一组内置模块。旧项目常用 CommonJS 的 `require`；现代项目在 `package.json` 里写 `\"type\": \"module\"` 后，可以直接用 `import` / `export`。两种模块系统的加载时机、缓存和顶层 await 行为不同，不能混着猜。\n\n`node file.js` 执行脚本，`node -e \"...\"` 执行一段字符串，直接输入 `node` 进入 REPL。REPL 适合验证小表达式，不适合保存项目状态。",
          "code": "// math.mjs\nexport const add = (a, b) => a + b;\n\n// main.mjs\nimport { add } from \"./math.mjs\";\nconsole.log(add(2, 3));\nconsole.log(process.argv.slice(2));",
          "output": "5\n[ \"one\", \"two\" ]（取决于启动参数）",
          "tip": "`require` 和 `import` 不是随便替换的：先看项目声明的模块类型、文件扩展名和依赖包的导出字段。"
        },
        {
          "h": "命令行参数、环境变量与退出码",
          "p": "脚本要可自动化，必须能接收参数并给出明确退出状态。`process.argv` 前两项是解释器路径和脚本路径，真正的参数从第 2 个下标开始。环境变量放在 `process.env`，适合配置，不适合放密钥到前端。\n\n正常结束用 `process.exit(0)`；失败用非 0。CI 只看退出码，不会读你的 `console.log(\"失败了\")`。",
          "code": "const name = process.argv[2] || \"world\";\nconsole.log(`hello ${name}`);\nif (process.env.DEBUG === \"1\") {\n  console.error(\"debug mode\");\n}\nprocess.exit(name === \"error\" ? 1 : 0);",
          "output": "node hello.js Ada\nhello Ada\n退出码 0",
          "tip": "不要把浏览器里的 `alert`、`document`、`localStorage` 带进 Node；先替换成日志、文件或显式的参数。"
        },
        {
          "h": "文件读写与错误优先回调",
          "p": "Node 的异步 API 常见两种风格：错误优先回调 `(err, data)` 和 Promise。新代码优先 Promise / async，但读旧代码时必须识别回调里第一个参数是错误，不是数据。\n\n读文件要明确编码，否则拿到 Buffer；写文件要确认目录存在，失败时捕获 `ENOENT` / `EACCES`，不要假定路径永远正确。",
          "code": "import { readFile } from \"node:fs/promises\";\ntry {\n  const text = await readFile(\"./data.txt\", \"utf8\");\n  console.log(text.trim());\n} catch (err) {\n  console.error(err.code, err.message);\n  process.exitCode = 1;\n}",
          "output": "文件内容（去掉末尾换行）\n或：ENOENT no such file or directory",
          "tip": "读文件默认返回 Buffer；传 `\"utf8\"` 才得到字符串。异步失败要用 try/catch 或 `.catch` 接住。"
        }
      ],
      "points": [
        "Node 是 JavaScript 的另一个宿主，不是浏览器。",
        "CommonJS 与 ESM 的加载规则不同。",
        "命令行脚本要用参数、环境变量和退出码表达结果。"
      ],
      "practice": "写一个 `wordcount.mjs`，读取命令行传入的文本文件，输出行数、词数和字符数；文件不存在时打印错误并返回退出码 1。",
      "source": "JavaScript 权威指南 7th · Ch.16；Eloquent JavaScript 4th · Ch.20；Learning JavaScript 3rd · Ch.1–2"
    },
    {
      "id": "ch1-4",
      "title": "开发工具链：编辑器、DevTools 与构建入口",
      "minutes": 32,
      "lead": "真正写项目时，浏览器只是最后一站。编辑器、终端、DevTools、包管理器、构建工具各自负责一段路。你不需要一次学完所有工具，但要知道每一层在解决什么问题，出问题时才不会乱装插件。",
      "sections": [
        {
          "h": "DevTools 的五个常用面板",
          "p": "Elements 看 DOM 与样式，Console 看日志和即时表达式，Sources 看源码与断点，Network 看请求、缓存和耗时，Performance 看主线程和渲染。遇到「页面卡」先看 Performance 的长任务，遇到「数据没到」先看 Network 的状态码和响应。\n\n断点比 log 更适合看现场：可以检查作用域、调用栈、异常捕获，还能条件断点只在特定值停下。",
          "code": "// 在 Sources 面板给这一行打断点\nfunction total(items) {\n  return items.reduce((sum, item) => sum + item.price, 0);\n}\nconsole.log(total([{ price: 12 }, { price: 8 }]));",
          "output": "20",
          "tip": "先判断问题属于 DOM、网络、逻辑还是性能，再选面板；不要在 Console 里靠猜。"
        },
        {
          "h": "package.json、脚本与依赖边界",
          "p": "`package.json` 是项目清单：名称、版本、脚本、依赖、模块类型。`npm run dev` 通常启动开发服务器，`npm run build` 生成生产产物，`npm test` 跑测试。依赖分 `dependencies` 与 `devDependencies`，构建工具和测试框架通常只在开发时需要。\n\n锁文件记录实际安装版本，团队和 CI 应提交它；`node_modules` 不应提交。",
          "code": "{\n  \"name\": \"js-demo\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"vite build\",\n    \"test\": \"vitest run\"\n  },\n  \"devDependencies\": { \"vite\": \"^7.0.0\", \"vitest\": \"^3.0.0\" }\n}",
          "output": "npm run dev → 本地开发服务器\nnpm run build → dist/\nnpm test → 测试结果",
          "tip": "不要把构建产物和 `node_modules` 提交到仓库；锁文件要提交。"
        },
        {
          "h": "source map 与生产排错",
          "p": "构建会压缩、合并、改名，线上报错的行号往往对不上源码。source map 把产物位置映射回原文件；开发环境默认生成，生产环境是否公开要权衡安全与排错能力。\n\n至少保留一份受控的 source map 给错误监控，不要在生产控制台暴露完整源码路径和密钥。",
          "code": "// vite.config.js\nexport default {\n  build: { sourcemap: true }\n};\n// 产物 app.js 末尾会出现 //# sourceMappingURL=app.js.map",
          "output": "构建后浏览器可将压缩代码映射回原文件",
          "tip": "source map 不是「打开就能看到源码」的魔法；它依赖构建配置和部署时是否上传 map 文件。"
        }
      ],
      "points": [
        "先判断问题类型，再选 DevTools 面板。",
        "package.json 管理脚本、依赖和模块类型。",
        "生产排错需要 source map 与错误监控配合。"
      ],
      "practice": "给一个小项目写三条 npm script（dev / build / test），故意制造一次构建报错，分别从终端输出和 source map 找到原始文件位置。",
      "source": "JavaScript 权威指南 7th · Ch.17；Learning JavaScript 3rd · Ch.2；Head First JavaScript Programming 2nd · Ch.1"
    }
  ]
});

/* --- js-ch02.js --- */

window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch2",
  "part": 1,
  "number": "02",
  "title": "值、类型与变量：JavaScript 的数据模型",
  "summary": "JavaScript 的变量不携带类型，值才携带。原始值按值复制，对象按引用共享；`==` 会转换，`===` 不转换。把这几条拎清，后面 80% 的「明明一样却不相等」都能解释。",
  "goals": [
    "分清原始类型、对象和包装对象",
    "理解 `typeof`、`instanceof` 与 `Object.prototype.toString` 的边界",
    "能解释 Symbol、BigInt 与普通 number 的差异",
    "在比较与拷贝时选择正确的操作符"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.7；JavaScript 高级程序设计 4th · Ch.3–4；JavaScript 权威指南 7th · Ch.3；Effective JavaScript · Item 1–7",
  "lessons": [
    {
      "id": "ch2-1",
      "title": "变量、原始类型与引用类型",
      "minutes": 22,
      "lead": "JavaScript 的值只有两类：原始类型和对象。变量本身不存“类型”，它存的是值的引用或副本。先分清这一点，后面的赋值、拷贝和比较才不会乱。",
      "sections": [
        {
          "h": "七种原始类型，加一种对象",
          "p": "原始类型是 `string`、`number`、`boolean`、`null`、`undefined`、`symbol`、`bigint`。它们按值传递，赋值时复制的是值本身；对象、数组、函数都是引用类型，变量里放的是指向堆内存的地址。`typeof` 大多能识别原始类型，但 `typeof null` 返回 `object`，这是历史遗留问题；判断 `null` 要直接写 `value === null`。",
          "code": "const a = \"Ada\";\nconst b = a;\nb.toUpperCase(); // 返回新字符串，a 不变\n\nconst user = { name: \"Ada\" };\nconst alias = user;\nalias.name = \"Grace\";\nconsole.log(user.name);\nconsole.log(typeof null);",
          "output": "Grace\nobject",
          "tip": "`const` 只锁住变量绑定，不锁对象内部。`const user = {}` 之后仍然可以改 `user.name`；要防修改得用 `Object.freeze`，而且它默认只冻结第一层。"
        },
        {
          "h": "复制一层，不等于复制全部",
          "p": "展开运算符 `...` 和 `Object.assign` 做的都是浅拷贝：第一层属性被复制，嵌套对象仍然共享同一个引用。改副本里的 `profile.city`，原对象也会跟着变。需要独立副本时用 `structuredClone`，它支持大多数内置类型；函数、DOM 节点、原型链上的自定义行为不会被带过来。",
          "code": "const origin = { name: \"Ada\", profile: { city: \"London\" } };\nconst copy = { ...origin };\ncopy.profile.city = \"Paris\";\nconsole.log(origin.profile.city); // Paris\n\nconst deep = structuredClone(origin);\ndeep.profile.city = \"Tokyo\";\nconsole.log(origin.profile.city, deep.profile.city);",
          "output": "Paris\nParis Tokyo",
          "tip": "判断“拷贝够不够深”，看的是你接下来要改哪一层。只改第一层，浅拷贝就够；要改嵌套对象，就必须深拷贝或手动重建路径。"
        }
      ],
      "points": [
        "原始类型按值复制，对象按引用共享。",
        "`typeof null === \"object\"` 是历史坑，判断 null 用 `=== null`。",
        "浅拷贝只复制第一层；嵌套结构要单独处理。"
      ],
      "practice": "把一个含 `profile.address.city` 的对象分别做浅拷贝和 `structuredClone`，修改副本的 city，再打印原对象，确认哪一个会互相影响。",
      "source": "Head First JavaScript Programming 2nd · Ch.7；JavaScript 高级程序设计 4th · Ch.3–4；Effective JavaScript · Item 4"
    },
    {
      "id": "ch2-2",
      "title": "运算符、相等比较与类型转换",
      "minutes": 24,
      "lead": "JavaScript 的隐式转换是很多“看起来明明相等”问题的源头。把 `==`、`===`、`??` 和 `||` 的边界记清楚，能省掉大量调试。",
      "sections": [
        {
          "h": "优先用严格相等",
          "p": "`===` 先比较类型，类型不同直接 `false`；`==` 会先做类型转换，所以 `0 == \"0\"`、`null == undefined` 都可能为真。日常判断统一用 `===`，只有一种常见例外：想同时接受 `null` 和 `undefined` 时，可以写 `value == null`。`NaN` 和任何值都不相等，包括它自己，判断它要用 `Number.isNaN`。",
          "code": "console.log(0 == \"0\");\nconsole.log(0 === \"0\");\nconsole.log(null == undefined);\nconsole.log(null === undefined);\nconsole.log(NaN === NaN);\nconsole.log(Number.isNaN(NaN));",
          "output": "true\nfalse\ntrue\nfalse\nfalse\ntrue",
          "tip": "`Object.is` 和 `===` 大体一致，但把 `NaN` 视为相等、把 `+0` 和 `-0` 视为不同。React 等库判断依赖变化时会用到它。"
        },
        {
          "h": "空值合并与短路求值",
          "p": "`||` 在左侧为任意假值时取右侧，`??` 只在左侧是 `null` 或 `undefined` 时取右侧。做默认值时，如果 `0`、`\"\"`、`false` 是合法输入，必须用 `??`，否则会被 `||` 错误覆盖。三元表达式适合简单二选一；分支一多就拆成 `if` 或查表，别把可读性压进一行。",
          "code": "const count = 0;\nconsole.log(count || 10);\nconsole.log(count ?? 10);\n\nconst user = { name: \"\", age: 0 };\nconsole.log(user.name || \"匿名\");\nconsole.log(user.age ?? 18);",
          "output": "10\n0\n匿名\n0",
          "tip": "短路不仅是取值，也能控制执行：`isReady && start()` 只在条件为真时调用。不要把有副作用的代码塞进过长的短路链，读起来容易漏掉执行条件。"
        }
      ],
      "points": [
        "日常比较用 `===`，不要依赖隐式转换。",
        "`NaN` 用 `Number.isNaN` 判断。",
        "默认值遇到 `0` / `\"\"` 时用 `??`，不要用 `||`。"
      ],
      "practice": "写一个 `formatCount(value, fallback)`，要求 `0` 保留为 `0`，只有 `null` / `undefined` 才使用 fallback；分别用 `||` 和 `??` 实现并比较结果。",
      "source": "Head First JavaScript Programming 2nd · Ch.7；JavaScript 高级程序设计 4th · Ch.3；Effective JavaScript · Item 3、5"
    },
    {
      "id": "ch2-3",
      "title": "包装对象、Symbol、BigInt 与类型判断",
      "minutes": 31,
      "lead": "`\"abc\".toUpperCase()` 看起来像在原始字符串上调用方法，其实是 JavaScript 临时把原始值包装成对象。包装对象、Symbol 和 BigInt 都不常写在业务主流程里，但它们决定了类型判断和边界行为。",
      "sections": [
        {
          "h": "原始值为什么能调用方法",
          "p": "字符串、数字、布尔值都有对应的包装对象 `String`、`Number`、`Boolean`。访问属性时，引擎临时创建包装对象，调用完立即丢弃；所以原始值本身仍然不可变。`new String(\"abc\")` 得到的是对象，`typeof` 为 `object`，和原始字符串不等。\n\n日常不要主动 `new` 包装对象；需要转换时用 `String(value)`、`Number(value)`、`Boolean(value)`。",
          "code": "const primitive = \"abc\";\nconst wrapped = new String(\"abc\");\nconsole.log(typeof primitive, typeof wrapped);\nconsole.log(primitive === wrapped);\nconsole.log(Number(\"42\"), Boolean(\"\"));",
          "output": "string object\nfalse\n42 false",
          "tip": "`new String()` 不是「转字符串」，它创建对象。类型转换优先用不带 new 的构造器函数。"
        },
        {
          "h": "Symbol：唯一且不可枚举的键",
          "p": "`Symbol()` 每次调用都生成唯一值，适合做对象内部标记，避免和字符串键冲突。`Symbol.for(\"key\")` 会从全局注册表取同一个 Symbol。以 Symbol 为键的属性不会出现在 `for...in`、`Object.keys` 和 JSON 序列化里，但能被 `Object.getOwnPropertySymbols` 读到。\n\n需要真正的私有字段时，优先用 class 的 `#private`，Symbol 只是「不容易碰巧重名」，不是安全边界。",
          "code": "const id = Symbol(\"id\");\nconst user = { name: \"Ada\", [id]: 7 };\nconsole.log(user[id]);\nconsole.log(Object.keys(user));\nconsole.log(Object.getOwnPropertySymbols(user).length);",
          "output": "7\n[ \"name\" ]\n1",
          "tip": "Symbol 键默认不会进入 JSON 和普通枚举；不要把它当作访问控制。"
        },
        {
          "h": "BigInt 与类型判断",
          "p": "`BigInt` 表示任意精度整数，字面量加 `n`，不能和普通 number 直接混合运算。`typeof 1n === \"bigint\"`。判断对象类型时，`typeof` 对数组和 null 都给 `object`；`Array.isArray` 专门判断数组，`Object.prototype.toString.call(value)` 能给出更细的内置类型标签。\n\n不要用 `instanceof` 判断跨 iframe / 跨 realm 的对象，它们的构造器不是同一个。",
          "code": "console.log(10n + 20n);\nconsole.log(typeof 10n);\nconsole.log(Array.isArray([]));\nconsole.log(Object.prototype.toString.call(null));\ntry { console.log(1n + 1); } catch (e) { console.log(e.name); }",
          "output": "30n\nbigint\ntrue\n[object Null]\nTypeError",
          "tip": "`typeof null` 是历史 bug；判断 null 直接 `=== null`。BigInt 与 number 不能隐式混合。"
        }
      ],
      "points": [
        "原始值调用方法时会临时装箱，但本身不可变。",
        "Symbol 提供唯一键，但不是私有访问控制。",
        "BigInt 与 number 不能混算；类型判断要选对工具。"
      ],
      "practice": "写一个 `typeOf(value)` 函数，分别正确识别 null、数组、Date、Map、BigInt 和普通对象；再用 `new String(\"x\")` 与原始 `\"x\"` 做一次比较，解释结果。",
      "source": "JavaScript 权威指南 7th · Ch.3；JavaScript 高级程序设计 4th · Ch.3；Effective JavaScript · Item 1–7"
    }
  ]
});

/* --- js-ch03.js --- */

window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch3",
  "part": 1,
  "number": "03",
  "title": "表达式、控制流与错误边界",
  "summary": "控制流不只是 if/for。短路求值、空值合并、可选链、异常捕获和提前返回，决定了代码在边界值时是清晰还是层层嵌套。本章把这些「小语法」放回真实分支里。",
  "goals": [
    "用提前返回拆掉多层嵌套",
    "分清 `||`、`??` 和可选链的适用场景",
    "知道哪些错误该捕获、哪些应该让程序失败",
    "写出带错误上下文的异常处理"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.1、7；JavaScript 高级程序设计 4th · Ch.3、21；JavaScript 权威指南 7th · Ch.4–5；Eloquent JavaScript 4th · Ch.2–3",
  "lessons": [
    {
      "id": "ch3-1",
      "title": "分支、循环与提前返回",
      "minutes": 22,
      "lead": "控制流的目标不是“把逻辑写进去”，而是让人一眼看出正常路径和异常路径。提前返回和合适的循环选择，比嵌套三元更值钱。",
      "sections": [
        {
          "h": "把异常分支挡在门口",
          "p": "函数开头先处理非法参数、空值和权限，再进入主逻辑，叫“卫语句”。它能把嵌套从三四层压到一层。循环方面：数组用 `for...of`，对象键用 `Object.keys` / `Object.entries`，需要下标时用 `entries()`；`for...in` 会遍历可枚举的继承属性，不适合直接处理数组。",
          "code": "function levelOf(score) {\n  if (typeof score !== \"number\" || score < 0 || score > 100) return \"无效\";\n  if (score >= 90) return \"A\";\n  if (score >= 60) return \"B\";\n  return \"C\";\n}\nconsole.log(levelOf(95), levelOf(75), levelOf(59), levelOf(\"90\"));\n\nfor (const [index, value] of [\"a\", \"b\"].entries()) {\n  console.log(index, value);\n}",
          "output": "A B C 无效\n0 a\n1 b",
          "tip": "上面最后一项 `levelOf(\"90\")` 返回“无效”，因为严格检查类型。真实项目里要明确“接受数字字符串”还是“只接受数字”，别靠 `==` 混过去。"
        },
        {
          "h": "break、continue 与循环边界",
          "p": "`break` 结束整个循环，`continue` 只跳过当前一轮。嵌套循环里 `break` 只跳出最内层；需要跳出多层时用标签，或把内层抽成函数用 `return`。遍历数组时不要一边删元素一边用旧下标，容易跳过相邻项；要过滤就 `filter`，要修改就新建数组。",
          "code": "const nums = [3, 8, 12, 5, 20];\nfor (const n of nums) {\n  if (n < 10) continue;\n  console.log(\"大于等于 10:\", n);\n  if (n > 15) break;\n}\n\nouter: for (const row of [[1, 2], [3, 4]]) {\n  for (const n of row) {\n    if (n === 3) break outer;\n  }\n}",
          "output": "大于等于 10: 12\n大于等于 10: 20",
          "tip": "标签语法可读性一般，能用函数 `return` 或提前过滤就别用标签。循环里做异步操作时，`forEach` 不会等你，改用 `for...of` 配 `await`。"
        }
      ],
      "points": [
        "卫语句把异常路径放前面，主逻辑保持扁平。",
        "数组优先 `for...of`，需要下标用 `entries()`。",
        "循环内异步不要用 `forEach`，用 `for...of` + `await`。"
      ],
      "practice": "把一段三层嵌套的 `if` 改写成卫语句版本，要求每个非法输入都有明确返回，正常路径不超过一层缩进。",
      "source": "Head First JavaScript Programming 2nd · Ch.1；JavaScript 高级程序设计 4th · Ch.3；Eloquent JavaScript 4th · Ch.2–3"
    },
    {
      "id": "ch3-2",
      "title": "短路、空值合并与可选链",
      "minutes": 28,
      "lead": "`||`、`&&`、`??` 和 `?.` 都能让代码变短，但它们对「假值」和「空值」的判定不同。把 `0`、`\"\"`、`false` 当成「没有值」，是业务代码最常见的隐性 bug 之一。",
      "sections": [
        {
          "h": "`||` 和 `??` 不是一回事",
          "p": "`||` 在左值为任意假值（`0`、`\"\"`、`false`、`null`、`undefined`、`NaN`）时取右值；`??` 只在左值为 `null` 或 `undefined` 时取右值。配置项允许 `0` 或空字符串时，必须用 `??`。\n\n`&&` 和 `||` 都会短路：左边已经决定结果，右边不会执行。不要把有副作用的函数塞进短路表达式里，除非你明确依赖这个顺序。",
          "code": "const port = 0;\nconsole.log(port || 8080);  // 8080，错了\nconsole.log(port ?? 8080);  // 0，保留合法值\nconst user = null;\nconsole.log(user?.name);    // undefined\ntry { console.log(user.name); } catch (err) { console.log(err.name); }",
          "output": "8080\n0\nundefined\nTypeError",
          "tip": "默认值场景优先 `??`；只有确实把 0、空串视为无效时才用 `||`。"
        },
        {
          "h": "可选链只保护一层访问",
          "p": "`user?.profile?.city` 在 `user` 或 `profile` 为 null/undefined 时返回 undefined，不会继续抛错。但它不会保护方法调用之后的返回值，也不会把 `user?.getName()` 的 this 绑定到 user 之外。\n\n可选链适合读取可能不存在的路径，不适合掩盖业务上必须存在的字段。关键字段缺失应该显式报错，而不是静默变成 undefined。",
          "code": "const order = { customer: null };\nconsole.log(order.customer?.address?.city);\nconsole.log(order.customer?.getName?.());\nconst required = order.customer?.id;\ntry {\n  if (required == null) throw new Error(\"customer.id is required\");\n} catch (err) { console.log(err.name + \": \" + err.message); }",
          "output": "undefined\nundefined\nError: customer.id is required",
          "tip": "可选链不能替代校验；关键路径缺失时要显式抛错。"
        },
        {
          "h": "三元、switch 与提前返回",
          "p": "三元表达式适合二选一的值，不适合塞多步副作用；`switch` 适合枚举分支，但别忘了 `break` 和默认分支。更通用的降复杂度手段是提前返回：先处理无效输入，再让主流程保持直线。\n\n分支越深，越难看出哪个条件覆盖了哪个值。把「不满足就退出」写在前面，通常比层层 else 更可读。",
          "code": "function priceLabel(user) {\n  if (!user) return \"游客\";\n  if (!user.member) return \"普通用户\";\n  if (user.level === \"gold\") return \"金卡\";\n  return \"会员\";\n}\nconsole.log(priceLabel(null), priceLabel({ member: false }), priceLabel({ member: true, level: \"gold\" }));",
          "output": "游客 普通用户 金卡",
          "tip": "先处理异常输入，再写主路径；三元只做取值，不堆副作用。"
        }
      ],
      "points": [
        "`||` 会把 0 和空串当成假值，`??` 只处理 null/undefined。",
        "可选链保护读取路径，不替代业务校验。",
        "提前返回能显著降低嵌套层级。"
      ],
      "practice": "把一段用 `||` 设置默认值的配置代码改成 `??`，再用 `0`、`\"\"`、`false` 三种输入验证行为；最后把多层 else 改写成提前返回。",
      "source": "JavaScript 高级程序设计 4th · Ch.3；JavaScript 权威指南 7th · Ch.4–5；Head First JavaScript Programming 2nd · Ch.7"
    },
    {
      "id": "ch3-3",
      "title": "异常、断言与可恢复错误",
      "minutes": 30,
      "lead": "错误不是「程序坏了」的同义词。输入错误、网络错误、权限错误和真正的程序 bug 需要不同处理。把错误分类，才能决定是重试、提示用户，还是让程序尽快失败。",
      "sections": [
        {
          "h": "错误类型与抛出时机",
          "p": "内置错误包括 `Error`、`TypeError`、`RangeError`、`SyntaxError`、`ReferenceError`。`throw` 可以抛任何值，但抛字符串会丢失调用栈和类型，生产代码应抛 `Error` 或其子类。\n\n`try/catch` 只捕获同步异常；Promise 的拒绝要用 `.catch` 或 `try/catch` 配合 `await`。不要用一个巨大的 try 包住整个应用，否则会把真正的 bug 吞掉。",
          "code": "function parseAge(value) {\n  const n = Number(value);\n  if (!Number.isInteger(n) || n < 0) {\n    throw new RangeError(\"age must be a non-negative integer\");\n  }\n  return n;\n}\ntry { console.log(parseAge(\"abc\")); } catch (e) { console.log(e.name, e.message); }",
          "output": "RangeError age must be a non-negative integer",
          "tip": "抛 Error 而不是字符串；只捕获你真正能处理的错误。"
        },
        {
          "h": "自定义错误与 cause",
          "p": "自定义错误类让调用方可以按类型分支处理；`cause` 保留原始错误，排查时不丢上下文。抛出时不要只写「失败了」，要写清输入、约束和下一步。\n\n捕获后要么处理、要么加上下文再抛，不要无声吞掉。",
          "code": "class ValidationError extends Error {\n  constructor(message, options) {\n    super(message, options);\n    this.name = \"ValidationError\";\n  }\n}\ntry {\n  JSON.parse(\"{bad\");\n} catch (err) {\n  throw new ValidationError(\"config is not valid JSON\", { cause: err });\n}",
          "output": "ValidationError: config is not valid JSON\n  cause: SyntaxError",
          "tip": "自定义错误要保留 `cause` 和稳定 `name`，方便上层分类处理。"
        },
        {
          "h": "finally、断言与失败快",
          "p": "`finally` 适合释放资源，不适合写返回值；它会在 try/catch 之后执行，且可能覆盖前面的返回。断言用于检查「不可能发生」的内部不变量，失败就应立即暴露，而不是继续带着坏状态运行。\n\n用户输入用校验并返回错误信息；程序内部不变量用断言和异常。两者不要混在一起。",
          "code": "function assert(condition, message) {\n  if (!condition) throw new Error(`Assertion failed: ${message}`);\n}\nfunction withdraw(balance, amount) {\n  assert(amount > 0, \"amount must be positive\");\n  if (amount > balance) throw new RangeError(\"insufficient funds\");\n  return balance - amount;\n}\nconsole.log(withdraw(100, 30));",
          "output": "70",
          "tip": "finally 里不要 return；内部不变量失败要立即抛错，不要静默修复。"
        }
      ],
      "points": [
        "错误要按类型和可恢复性分类。",
        "抛 Error 对象，保留 cause 和稳定 name。",
        "finally 适合清理，不适合改变返回值。"
      ],
      "practice": "给一个 `readConfig(text)` 函数加三层错误处理：JSON 语法错误、字段缺失、字段类型错误；每层都保留原始 cause，并给调用方一个可判断的错误类型。",
      "source": "JavaScript 高级程序设计 4th · Ch.21；JavaScript 权威指南 7th · Ch.11；Secrets of the JavaScript Ninja 2nd · Appendix B"
    }
  ]
});

/* --- js-ch04.js --- */

window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch4",
  "part": 1,
  "number": "04",
  "title": "函数：JavaScript 的一等公民",
  "summary": "函数可以被赋值、传参、返回、存进对象和数组。理解参数如何绑定、返回值如何流动、副作用发生在哪里，是从「会写语法」到「能拆逻辑」的分水岭。",
  "goals": [
    "分清函数声明、函数表达式和箭头函数的差异",
    "正确使用默认参数、剩余参数与展开",
    "识别纯函数与副作用",
    "用组合替代重复代码"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.3、10；JavaScript 高级程序设计 4th · Ch.10；JavaScript 权威指南 7th · Ch.8；Eloquent JavaScript 4th · Ch.3",
  "lessons": [
    {
      "id": "ch4-1",
      "title": "函数声明、函数表达式与参数",
      "minutes": 22,
      "lead": "三种写法看起来都能调用，但提升行为、this 和构造函数能力不同。先按“是否需要提升、是否依赖 this”选择，而不是凭习惯。",
      "sections": [
        {
          "h": "声明会提升，表达式不会",
          "p": "函数声明 `function foo(){}` 会在作用域准备阶段整体提升，所以可以在声明之前调用；函数表达式赋给 `const` 时，初始化之前处于暂时性死区，提前调用会报错。参数支持默认值、剩余参数和参数解构；默认值只在实参为 `undefined` 时生效，传 `null` 不会触发默认值。",
          "code": "console.log(sum(1, 2, 3));\nfunction sum(...nums) {\n  return nums.reduce((total, n) => total + n, 0);\n}\n\nconst double = function (n) { return n * 2; };\nfunction greet(name = \"同学\") { return \"你好，\" + name; }\nconsole.log(double(4), greet(), greet(null));",
          "output": "6\n8 你好，同学 你好，null",
          "tip": "默认参数不要引用后面的参数，也不要依赖 `arguments`。需要“必填”语义时，在函数开头显式检查 `undefined` 并抛出清晰错误。"
        },
        {
          "h": "参数是值传递，对象传的是引用",
          "p": "给函数传对象，函数内部拿到的是同一个对象的引用；修改 `obj.name` 会影响调用方。想保持调用方数据不变，就在函数里新建对象或做拷贝。返回多个值时用对象或数组解构，别用“改传入参数”这种隐式输出。",
          "code": "function rename(user, name) {\n  return { ...user, name };\n}\nconst before = { name: \"Ada\", age: 36 };\nconst after = rename(before, \"Grace\");\nconsole.log(before.name, after.name);\n\nfunction splitName(full) {\n  const [first, last = \"\"] = full.split(\" \");\n  return { first, last };\n}\nconsole.log(splitName(\"Ada Lovelace\"));",
          "output": "Ada Grace\n{ first: 'Ada', last: 'Lovelace' }",
          "tip": "“函数改了传入对象”是协作里的隐形坑。约定纯函数就返回新对象；确实要改，就在函数名和注释里写清楚。"
        }
      ],
      "points": [
        "函数声明提升，`const` 函数表达式不提升。",
        "默认参数只对 `undefined` 生效，`null` 不会触发。",
        "对象参数传引用；要纯函数就返回新对象。"
      ],
      "practice": "写一个 `rename(user, name)` 返回新对象，再写一个会修改原对象的版本；调用后分别打印原对象，比较差异。",
      "source": "Head First JavaScript Programming 2nd · Ch.3；JavaScript 高级程序设计 4th · Ch.10；JavaScript 权威指南 7th · Ch.8"
    },
    {
      "id": "ch4-2",
      "title": "默认参数、剩余参数与展开",
      "minutes": 29,
      "lead": "ES6 之后，参数不再只有 `arguments`。默认值、剩余参数和展开让函数签名更明确，但默认值只在 `undefined` 时触发，`null` 不会；剩余参数是真数组，`arguments` 是类数组。",
      "sections": [
        {
          "h": "默认值只在 undefined 时生效",
          "p": "默认参数在调用时求值，可以引用前面的参数，但不能引用函数体内的变量。传 `null`、`0`、`\"\"` 都不会触发默认值，只有 `undefined` 会。\n\n默认值表达式每次调用都会重新计算，所以 `tags = []` 每次都会拿到一个新数组；如果需要共享缓存，应当显式把对象放到函数外。",
          "code": "function greet(name = \"游客\", tags = []) {\n  return name + \" / \" + tags.join(\",\");\n}\nconsole.log(greet(undefined));\nconsole.log(greet(null));\nconsole.log(greet(\"Ada\", [\"vip\"]));",
          "output": "游客 / \nnull / \nAda / vip",
          "tip": "只有 `undefined` 触发默认值；默认值表达式每次调用都会重新求值。"
        },
        {
          "h": "剩余参数是真数组",
          "p": "`function sum(...nums)` 把所有实参收集成真正的数组，可以直接 `reduce`、`map`。旧式的 `arguments` 是类数组，没有数组方法，而且箭头函数没有自己的 `arguments`。\n\n剩余参数必须放在参数列表最后；它不会收集已经匹配到前面形参的值。",
          "code": "function sum(...nums) {\n  return nums.reduce((a, b) => a + b, 0);\n}\nconsole.log(sum(1, 2, 3));\nconst arrow = (...args) => args.length;\nconsole.log(arrow(\"a\", \"b\"));",
          "output": "6\n2",
          "tip": "新代码优先用剩余参数；箭头函数没有 `arguments`，不要在里面引用它。"
        },
        {
          "h": "展开不是复制，调用现场要分清",
          "p": "展开运算符 `...` 可以把可迭代对象拆成参数或数组元素。`fn(...arr)` 是调用时展开，`[...arr]` 是创建新数组。展开是浅拷贝，嵌套对象仍共享引用。\n\n参数很多时不要用展开硬塞，超过可读范围就改成对象参数；对象参数也便于后续扩展。",
          "code": "const nums = [3, 1, 2];\nconsole.log(Math.max(...nums));\nconst copy = [...nums].sort();\nconsole.log(copy);\nconsole.log(nums);\nconst config = { ...{ host: \"a\" }, port: 8080 };\nconsole.log(config);",
          "output": "3\n[ 1, 2, 3 ]\n[ 3, 1, 2 ]\n{ host: \"a\", port: 8080 }",
          "tip": "展开是浅拷贝；排序等原地方法要先复制再改。"
        }
      ],
      "points": [
        "默认值只对 `undefined` 生效。",
        "剩余参数是真数组，`arguments` 是类数组。",
        "展开是浅拷贝，调用与构造要分清。"
      ],
      "practice": "把 `function sum()` 改写成同时支持数组和多个参数的版本，要求不修改调用方；再用默认参数处理 `null` 与 `undefined` 的差异。",
      "source": "Head First JavaScript Programming 2nd · Ch.10；JavaScript 高级程序设计 4th · Ch.10；JavaScript 权威指南 7th · Ch.8"
    },
    {
      "id": "ch4-3",
      "title": "纯函数、副作用与函数组合",
      "minutes": 32,
      "lead": "纯函数不是「不用 class」的同义词。它指同样的输入总得到同样的输出，并且不修改外部状态。把计算和副作用分开，测试、缓存和复用都会变简单。",
      "sections": [
        {
          "h": "纯函数与可预测性",
          "p": "纯函数不读外部可变变量、不写 DOM、不发请求、不改参数。它可以是对象方法，也可以有闭包，只要行为只由输入决定。\n\n`Math.random()`、`Date.now()`、`console.log` 都会破坏纯粹性。需要它们时，把副作用推到边界，核心计算保持纯。",
          "code": "function addTax(price, rate) {\n  return Math.round(price * (1 + rate));\n}\nlet count = 0;\nfunction impure(price) {\n  count += 1;\n  return price + count;\n}\nconsole.log(addTax(100, 0.1));\nconsole.log(impure(100), impure(100));",
          "output": "110\n101 102",
          "tip": "同样的输入得到不同输出，就说明有隐藏状态或副作用。"
        },
        {
          "h": "副作用要集中到边界",
          "p": "读取输入、写日志、更新 DOM、发请求、写存储都是副作用。把它们放在事件处理或应用边界，核心逻辑只接收数据、返回新数据。\n\n不要为了「纯」而把所有东西都包成高阶函数；副作用本身不是错，错的是它藏在计算中间，导致难以测试。",
          "code": "function normalizeUser(raw) {\n  return { id: String(raw.id), name: raw.name.trim() };\n}\nfunction saveUser(user) {\n  localStorage.setItem(\"user\", JSON.stringify(user));\n}\nconst user = normalizeUser({ id: 7, name: \" Ada \" });\nsaveUser(user);",
          "output": "localStorage 中：{\"id\":\"7\",\"name\":\"Ada\"}",
          "tip": "纯函数负责转换，副作用负责落地；两者分开测试。"
        },
        {
          "h": "组合与管道",
          "p": "函数组合是把多个一元函数串起来：前一个的输出是后一个的输入。`compose(f, g)(x)` 通常从右往左，`pipe(f, g)(x)` 从左往右。组合适合无副作用的转换，不适合把异步和错误处理硬塞进去。\n\n组合的价值是可读性：一眼能看出数据经过哪几步，而不是读一个巨大函数。",
          "code": "const trim = s => s.trim();\nconst lower = s => s.toLowerCase();\nconst slug = s => s.replace(/\\s+/g, \"-\");\nconst pipe = (...fns) => x => fns.reduce((v, fn) => fn(v), x);\nconst toSlug = pipe(trim, lower, slug);\nconsole.log(toSlug(\"  Hello JS World  \"));",
          "output": "hello-js-world",
          "tip": "组合只适合可独立测试的转换；异步流程用 Promise 链或 async 函数。"
        }
      ],
      "points": [
        "纯函数由输入决定输出，不修改外部状态。",
        "副作用集中到边界，核心计算保持纯。",
        "组合提高转换链可读性，不替代异步控制流。"
      ],
      "practice": "把一个既读全局变量又改 DOM 的函数拆成 `normalize`、`validate`、`render` 三段；分别测试前两段，再在事件处理里调用第三段。",
      "source": "Eloquent JavaScript 4th · Ch.3；JavaScript 权威指南 7th · Ch.8；Head First JavaScript Programming 2nd · Ch.10"
    }
  ]
});

/* --- js-ch05.js --- */

window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch5",
  "part": 2,
  "number": "05",
  "title": "this、调用与原型方法",
  "summary": "`this` 不是「函数自己的变量」，而是调用现场留下的上下文。箭头函数、普通函数、对象方法和构造函数各有不同的绑定规则；`call`、`apply`、`bind` 只是显式接管它。",
  "goals": [
    "判断普通函数与箭头函数的 this",
    "用 call/apply/bind 解决借用与回调绑定",
    "理解 new 的四个步骤",
    "区分方法调用和函数调用"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.5；JavaScript 高级程序设计 4th · Ch.10；JavaScript 权威指南 7th · Ch.8；You Don't Know JS · this & Object Prototypes",
  "lessons": [
    {
      "id": "ch5-1",
      "title": "箭头函数与 this",
      "minutes": 24,
      "lead": "箭头函数不绑定自己的 this、arguments 和 super，它从外层词法环境借。普通函数的 this 则由调用方式决定。把这两件事分开，this 就不再玄学。",
      "sections": [
        {
          "h": "this 看调用，不看定义",
          "p": "普通函数里，`obj.method()` 的 this 是 `obj`；单独取出 `const fn = obj.method; fn()` 后 this 变成 `undefined`（严格模式）或全局对象。`call` / `apply` / `bind` 可以显式指定 this。箭头函数没有自己的 this，写在哪里就继承哪里的 this，适合回调和需要保留外层上下文的场景。",
          "code": "const team = {\n  name: \"U15\",\n  players: [\"Ada\", \"Grace\"],\n  list() {\n    return this.players.map((p) => this.name + \":\" + p);\n  }\n};\nconsole.log(team.list().join(\", \"));\n\nconst loose = team.list;\ntry { console.log(loose()); } catch (err) { console.log(err.name); }",
          "output": "U15:Ada, U15:Grace\nTypeError",
          "tip": "对象方法用简写语法 `list(){}`，不要在方法里随手用箭头函数再指望 this 指向对象。箭头函数也不能当构造函数，`new (() => {})` 会抛错。"
        },
        {
          "h": "回调里最容易踩的 this",
          "p": "`setTimeout(function(){ this.name })` 里的 this 不是外层对象；改成箭头函数就会继承外层 this。事件监听里需要动态拿到触发元素时，用 `event.currentTarget`，不要依赖 this。React 类组件时代的 `bind(this)` 问题，现在更多被箭头函数和闭包替代。",
          "code": "\"use strict\";\nconst widget = {\n  name: \"面板\",\n  start() {\n    queueMicrotask(() => console.log(this.name));\n    queueMicrotask(function () { console.log(this === undefined); });\n  }\n};\nwidget.start();",
          "output": "面板\ntrue",
          "tip": "箭头函数里的 this 是定义时的外层 this；在模块顶层就是 `undefined`。需要动态 this 时用普通函数，不需要时用箭头函数，别混着猜。"
        }
      ],
      "points": [
        "普通函数的 this 由调用方式决定。",
        "箭头函数继承外层 this，不能当构造函数。",
        "回调保留外层上下文时优先箭头函数。"
      ],
      "practice": "把对象方法里的 `setTimeout(function(){...})` 改成箭头函数，验证 this 是否正确；再把方法单独取出来调用，观察 this 丢失后的报错。",
      "source": "Head First JavaScript Programming 2nd · Ch.5；JavaScript 高级程序设计 4th · Ch.10；You Don't Know JS · this & Object Prototypes"
    },
    {
      "id": "ch5-2",
      "title": "call、apply、bind 与借用方法",
      "minutes": 29,
      "lead": "`call`、`apply`、`bind` 不是「改变函数代码」，而是改变调用时的 this。方法借用让一个对象可以使用另一个对象的方法，前提是内部只依赖 this 和参数，不依赖私有闭包。",
      "sections": [
        {
          "h": "call 与 apply 只是传参形式不同",
          "p": "`fn.call(thisArg, a, b)` 逐个传参；`fn.apply(thisArg, [a, b])` 用数组传参。两者都会立即执行。`bind(thisArg, ...args)` 返回一个新函数，绑定 this 和部分参数，原函数不执行。\n\n严格模式下，传入 `null` / `undefined` 作为 thisArg 会保持原值；非严格模式会回退到全局对象。",
          "code": "function introduce(greeting) {\n  return `${greeting}, ${this.name}`;\n}\nconst ada = { name: \"Ada\" };\nconsole.log(introduce.call(ada, \"Hello\"));\nconsole.log(introduce.apply(ada, [\"Hi\"]));\nconst bound = introduce.bind(ada, \"Hey\");\nconsole.log(bound());",
          "output": "Hello, Ada\nHi, Ada\nHey, Ada",
          "tip": "`call`/`apply` 立即调用，`bind` 返回新函数；不要把 bind 的结果再 call 一次期待改 this。"
        },
        {
          "h": "方法借用与类数组转换",
          "p": "数组方法可以借给类数组或 arguments：`Array.prototype.slice.call(arguments)`，现代写法直接用 `Array.from(arguments)`。借用方法要求对象有 `length` 和数字索引，不是所有对象都能借。\n\n不要为了省一行代码把方法借给不兼容的对象；先检查契约，再决定是否 `Array.from`。",
          "code": "function toList() {\n  return Array.prototype.slice.call(arguments);\n}\nconsole.log(toList(\"a\", \"b\"));\nconst arrayLike = { 0: \"x\", 1: \"y\", length: 2 };\nconsole.log(Array.from(arrayLike));",
          "output": "[ \"a\", \"b\" ]\n[ \"x\", \"y\" ]",
          "tip": "借用数组方法依赖 length 和索引；现代代码优先 `Array.from`。"
        },
        {
          "h": "回调里的 this 丢失与修复",
          "p": "把对象方法作为回调传给 `setTimeout` 或事件监听时，调用现场不再是 `obj.method()`，this 会丢失。用 `bind` 固定，或用箭头函数捕获外层 this，或在回调里显式调用对象方法。\n\n不要用 `const self = this` 作为唯一方案；它是旧时代的补丁，现代代码优先箭头函数或 bind。",
          "code": "\"use strict\";\nconst counter = {\n  count: 0,\n  start() {\n    queueMicrotask(() => { this.count += 1; console.log(this.count); });\n    queueMicrotask(function () { console.log(this === undefined); });\n  }\n};\ncounter.start();",
          "output": "1\ntrue",
          "tip": "回调传方法前先问「谁调用它」；箭头函数继承外层 this，普通函数不会。"
        }
      ],
      "points": [
        "call/apply 立即调用，bind 返回新函数。",
        "借用数组方法依赖 length 和索引。",
        "回调里的 this 由调用现场决定，不由定义位置决定。"
      ],
      "practice": "写一个 `debounce(fn, ms)`，要求返回的函数保留调用时的 this 和参数；分别用普通函数、箭头函数和 bind 三种方案实现，并比较差异。",
      "source": "JavaScript 权威指南 7th · Ch.8；Secrets of the JavaScript Ninja 2nd · Ch.4；Effective JavaScript · Item 18–20"
    },
    {
      "id": "ch5-3",
      "title": "new、构造函数与返回值",
      "minutes": 28,
      "lead": "`new` 不是「创建对象的唯一方式」，但它有一套固定的四步：创建新对象、链接原型、绑定 this 执行构造函数、处理返回值。理解这四步，才能解释为什么构造函数返回对象会覆盖新实例。",
      "sections": [
        {
          "h": "new 的四个步骤",
          "p": "调用 `new Foo()` 时，引擎先创建一个空对象，把它的 `[[Prototype]]` 指向 `Foo.prototype`，再把 this 绑定到新对象执行函数，最后如果函数返回对象就使用该对象，否则返回新对象。\n\n构造函数名习惯大写，但大小写不改变行为；忘记 `new` 时，普通函数调用可能把属性写到全局对象（非严格模式）或直接报错。",
          "code": "function User(name) {\n  this.name = name;\n}\nUser.prototype.greet = function () { return `Hi ${this.name}`; };\nconst u = new User(\"Ada\");\nconsole.log(u.greet());\nconsole.log(Object.getPrototypeOf(u) === User.prototype);",
          "output": "Hi Ada\ntrue",
          "tip": "构造函数返回原始值会被忽略；返回对象会替换新实例。"
        },
        {
          "h": "返回值的边界",
          "p": "构造函数里 `return 1` 不会改变 new 的结果；`return {}` 会替换新对象；`return null` 也会被忽略，因为 null 不是对象。这个规则常被用来做「工厂式构造函数」，但也会让 instanceof 判断失效。\n\n如果不是刻意为之，构造函数不要返回值；需要工厂函数就明确用普通函数。",
          "code": "function A() { this.x = 1; return 2; }\nfunction B() { this.x = 1; return { y: 2 }; }\nconsole.log(new A());\nconsole.log(new B());",
          "output": "A { x: 1 }\n{ y: 2 }",
          "tip": "构造函数返回对象会覆盖实例；返回原始值被忽略。"
        },
        {
          "h": "class 不是语法糖的全部",
          "p": "`class` 本质仍基于原型，但它默认严格模式、方法不可枚举、必须用 new 调用，且继承通过 `extends` 和 `super` 建立。它不是把旧构造函数原样包装，行为边界不同。\n\n旧代码里常见的 `Factory.prototype = {}` 会丢掉 constructor 指向；现代代码优先 class 或 `Object.create` 明确建链。",
          "code": "class User {\n  constructor(name) { this.name = name; }\n  greet() { return `Hi ${this.name}`; }\n}\nconst u = new User(\"Ada\");\nconsole.log(u.greet());\nconsole.log(Object.keys(User.prototype));",
          "output": "Hi Ada\n[]",
          "tip": "class 方法不可枚举；替换整个 prototype 会破坏 constructor 链。"
        }
      ],
      "points": [
        "new 的四个步骤决定实例、this 和原型。",
        "构造函数返回对象会覆盖新实例。",
        "class 与旧构造函数行为不同，不要简单互转。"
      ],
      "practice": "用构造函数和 class 各写一个 `Counter`，实现 `increment` 与 `value`；再用 `Object.create` 手写一次原型链，比较三种方式的实例属性与方法位置。",
      "source": "JavaScript 高级程序设计 4th · Ch.8；JavaScript 权威指南 7th · Ch.9；Head First JavaScript Programming 2nd · Ch.12"
    }
  ]
});

/* --- js-ch06.js --- */

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

/* --- js-ch07.js --- */

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

/* --- js-ch08.js --- */

window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch8",
  "part": 2,
  "number": "08",
  "title": "对象、属性与原型",
  "summary": "对象是 JavaScript 的核心数据结构，原型是对象之间的查找链。属性描述符决定一个属性能不能改、能不能枚举；拷贝边界决定你改副本时会不会动到原对象。",
  "goals": [
    "用字面量、解构和展开组织对象",
    "解释原型链查找与 Object.create",
    "区分可枚举、可写、可配置",
    "知道浅拷贝和深拷贝的边界"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.5；JavaScript 高级程序设计 4th · Ch.8；JavaScript 权威指南 7th · Ch.6；JavaScript: The Good Parts · Ch.3",
  "lessons": [
    {
      "id": "ch8-1",
      "title": "对象字面量、解构与展开",
      "minutes": 22,
      "lead": "对象字面量是日常最常用的数据结构。解构让你按名字取值，展开让你复制并覆盖字段；两者都要注意浅拷贝和键冲突。",
      "sections": [
        {
          "h": "解构是取值，不是建引用",
          "p": "`const { name, age } = user` 会把字段值复制到新变量；如果字段本身是对象，变量拿到的是同一个引用。剩余属性 `...rest` 收集未取出的自有可枚举属性。展开多个对象时，后面的同名键覆盖前面的；这适合做“默认配置 + 用户配置”。",
          "code": "const defaults = { theme: \"dark\", lang: \"zh\", pageSize: 20 };\nconst userConfig = { theme: \"light\" };\nconst config = { ...defaults, ...userConfig };\nconsole.log(config);\n\nconst user = { name: \"Ada\", age: 36, city: \"London\" };\nconst { name, ...rest } = user;\nconsole.log(name, rest);",
          "output": "{ theme: 'light', lang: 'zh', pageSize: 20 }\nAda { age: 36, city: 'London' }",
          "tip": "展开只复制自有可枚举属性，原型上的方法不会跟过来。类实例展开后通常只剩字段，方法仍在原型上，别指望展开得到完整实例。"
        },
        {
          "h": "可选链与空值合并",
          "p": "`user?.profile?.city` 在中间为 `null` / `undefined` 时直接返回 `undefined`，不会继续访问。它只处理空值，不处理空字符串或 `0`；配合 `??` 给默认值最稳。可选链不要滥用：如果某个字段在业务上必须存在，就应该在入口校验，而不是到处写 `?.` 掩盖数据问题。",
          "code": "const user = { profile: null };\nconsole.log(user?.profile?.city);\nconsole.log(user?.profile?.city ?? \"未填写\");\n\nconst settings = { pageSize: 0 };\nconsole.log(settings.pageSize ?? 20);\nconsole.log(settings.pageSize || 20);",
          "output": "undefined\n未填写\n0\n20",
          "tip": "可选链只能读，不能赋值。`user?.name = \"Ada\"` 是语法错误；要写就先判断 `if (user) user.name = \"Ada\"`。"
        }
      ],
      "points": [
        "解构复制的是字段值，嵌套对象仍是引用。",
        "展开后面的同名键覆盖前面的。",
        "可选链处理空值，不处理 `0` / `\"\"`。"
      ],
      "practice": "合并两份配置，要求用户配置覆盖默认配置；再用解构取出 `theme`，把剩余字段放进 `rest` 并打印。",
      "source": "Head First JavaScript Programming 2nd · Ch.5；JavaScript 高级程序设计 4th · Ch.8；JavaScript 权威指南 7th · Ch.6"
    },
    {
      "id": "ch8-2",
      "title": "原型链、继承与 Object.create",
      "minutes": 26,
      "lead": "每个对象都有一个内部原型，属性找不到时会顺着原型链向上找。理解这条链，才能解释“方法为什么在实例上找不到却能用”。",
      "sections": [
        {
          "h": "自有属性与继承属性",
          "p": "`obj.hasOwnProperty(key)` 只检查对象自己；`key in obj` 会检查整条原型链。遍历时用 `Object.keys` 拿自有可枚举键，用 `Object.getPrototypeOf` 看原型。`Object.create(proto)` 直接创建一个以指定对象为原型的新对象，适合做轻量继承或字典对象。",
          "code": "const base = {\n  greet() { return \"Hi \" + this.name; }\n};\nconst child = Object.create(base);\nchild.name = \"Ada\";\nconsole.log(child.greet());\nconsole.log(Object.getPrototypeOf(child) === base);\nconsole.log(\"greet\" in child, child.hasOwnProperty(\"greet\"));",
          "output": "Hi Ada\ntrue\ntrue false",
          "tip": "不要把用户输入直接当键查普通对象，`__proto__`、`constructor` 可能命中原型。用 `Object.create(null)` 或 `Map` 做纯字典。"
        },
        {
          "h": "原型链的尽头是 null",
          "p": "普通对象的原型最终指向 `Object.prototype`，再往上就是 `null`。修改 `Object.prototype` 会影响所有普通对象，这是非常危险的操作。需要扩展行为时，优先组合、工具函数或 class，而不是往全局原型上挂方法。",
          "code": "const obj = {};\nconsole.log(Object.getPrototypeOf(obj) === Object.prototype);\nconsole.log(Object.getPrototypeOf(Object.prototype));\n\nconst dict = Object.create(null);\ndict[\"toString\"] = \"自定义值\";\nconsole.log(dict.toString);",
          "output": "true\nnull\n自定义值",
          "tip": "`Object.create(null)` 创建的对象没有原型，不能调用 `hasOwnProperty` 等方法；需要时用 `Object.hasOwn(dict, key)`。"
        }
      ],
      "points": [
        "属性查找会沿原型链向上。",
        "`in` 查整条链，`hasOwnProperty` 只查自有。",
        "不要修改 `Object.prototype`。"
      ],
      "practice": "用 `Object.create` 建一个带 `greet` 方法的原型对象，再创建两个实例并设置不同 `name`，打印各自的方法结果。",
      "source": "JavaScript 高级程序设计 4th · Ch.8；JavaScript 权威指南 7th · Ch.6、9；JavaScript: The Good Parts · Ch.3"
    },
    {
      "id": "ch8-3",
      "title": "属性描述符、冻结与拷贝边界",
      "minutes": 24,
      "lead": "对象属性不只有“值”，还有可写、可枚举、可配置三个开关。冻结和拷贝的很多困惑，根源都在这里。",
      "sections": [
        {
          "h": "属性描述符决定可见性",
          "p": "`Object.defineProperty` 可以定义 `value`、`writable`、`enumerable`、`configurable`，也可以定义 getter / setter。`Object.keys` 只返回可枚举属性；`JSON.stringify` 也只序列化可枚举的自有属性。`Object.freeze` 默认把第一层属性设为不可写、不可配置，但不会递归冻结嵌套对象。",
          "code": "const config = { mode: \"dark\" };\nObject.freeze(config);\ntry { config.mode = \"light\"; } catch (err) { console.log(err.name); }\nconsole.log(config.mode, Object.isFrozen(config));\n\nconst hidden = {};\nObject.defineProperty(hidden, \"token\", { value: \"abc\", enumerable: false });\nconsole.log(hidden.token, Object.keys(hidden));",
          "output": "TypeError\ndark true\nabc []",
          "tip": "严格模式下改冻结属性会抛 `TypeError`，非严格模式静默失败。线上排查“赋值没生效”时，先检查对象是否被冻结或属性是否只读。"
        },
        {
          "h": "深拷贝不是万能钥匙",
          "p": "`structuredClone` 能处理对象、数组、Map、Set、Date、RegExp 等，但不会复制函数、原型链、DOM 节点和自定义类方法。JSON 方案会丢 `undefined`、函数、Symbol，还会把 Date 变成字符串。选择拷贝方式前，先明确数据里有什么类型、需不需要保留原型。",
          "code": "const source = {\n  date: new Date(\"2026-01-01\"),\n  map: new Map([[\"a\", 1]]),\n  nested: { n: 1 }\n};\nconst clone = structuredClone(source);\nclone.nested.n = 2;\nconsole.log(source.nested.n, clone.nested.n);\nconsole.log(clone.date instanceof Date, clone.map.get(\"a\"));\n\nconst viaJson = JSON.parse(JSON.stringify(source));\nconsole.log(viaJson.date instanceof Date);",
          "output": "1 2\ntrue 1\nfalse",
          "tip": "要保留 class 实例，拷贝后需要手动重建原型或提供 `clone()` 方法；不要对含函数、DOM、循环引用的数据使用 JSON 深拷贝。"
        }
      ],
      "points": [
        "属性有可写、可枚举、可配置三个开关。",
        "`Object.freeze` 默认只冻结第一层。",
        "`structuredClone` 不复制函数、原型和 DOM。"
      ],
      "practice": "创建一个含 `Date`、`Map` 和嵌套对象的对象，分别用 `structuredClone` 与 JSON 方式复制，打印类型和嵌套修改后的原对象，比较差异。",
      "source": "JavaScript 高级程序设计 4th · Ch.8；JavaScript 权威指南 7th · Ch.6、14；Effective JavaScript · Item 43–44"
    }
  ]
});

/* --- js-ch09.js --- */

window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch9",
  "part": 2,
  "number": "09",
  "title": "class、继承与组合",
  "summary": "class 让原型写法有了清晰外观，但继承不是唯一答案。`extends`、`super`、静态成员和私有字段各有边界；组合与 mixin 往往比深继承更可维护。",
  "goals": [
    "写构造器、实例方法、静态方法和私有字段",
    "理解 extends/super 的初始化顺序",
    "用 mixin 复用行为",
    "判断什么时候不该用继承"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.12；JavaScript 高级程序设计 4th · Ch.8；JavaScript 权威指南 7th · Ch.9；Learning JavaScript Design Patterns · Ch.9",
  "lessons": [
    {
      "id": "ch9-1",
      "title": "class、构造器与私有字段",
      "minutes": 26,
      "lead": "class 是原型继承的语法糖，但私有字段、静态方法和 getter 是真实能力。用 class 封装“状态 + 行为”，比散落的函数更清楚。",
      "sections": [
        {
          "h": "实例字段与私有字段",
          "p": "`class` 里的 `constructor` 负责初始化；`#field` 是真正的私有字段，外部访问会直接语法错误。`static` 属于类本身，不属于实例。`get` / `set` 可以拦截读写，但不要在 getter 里做重计算或副作用。方法默认不在实例上，而在 `prototype` 上。",
          "code": "class Timer {\n  #seconds = 0;\n  constructor(label) { this.label = label; }\n  tick() { this.#seconds += 1; return this.#seconds; }\n  get value() { return this.#seconds; }\n  static create(label) { return new Timer(label); }\n}\nconst timer = Timer.create(\"训练\");\ntimer.tick();\nconsole.log(timer.label, timer.value);\nconsole.log(Object.keys(timer));",
          "output": "训练 1\n[ \"label\" ]",
          "tip": "私有字段必须在类体里声明；不能从外部 `delete` 或枚举。需要调试时提供显式的 `toJSON()` 或 `snapshot()`，别为了省事把私有字段改成公有。"
        },
        {
          "h": "this 绑定与继承",
          "p": "把实例方法单独取出来调用，this 会丢失。需要稳定绑定时，在构造函数里 `this.handle = this.handle.bind(this)`，或用箭头函数字段。`extends` 继承时，子类构造器必须先 `super()` 再使用 this。方法重写后需要调父类实现，用 `super.method()`。",
          "code": "class Counter {\n  constructor() { this.count = 0; this.inc = this.inc.bind(this); }\n  inc() { this.count += 1; return this.count; }\n}\nconst counter = new Counter();\nconst inc = counter.inc;\ninc(); inc();\nconsole.log(counter.count);\n\nclass StepCounter extends Counter {\n  inc() { return super.inc() + 10; }\n}\nconst step = new StepCounter();\nconsole.log(step.inc());",
          "output": "2\n11",
          "tip": "继承层次超过两三层就要警惕。多数业务组合比继承更清晰；继承适合“确实是同一种东西”的场景。"
        }
      ],
      "points": [
        "`#field` 是真正的私有字段，外部不可访问。",
        "实例方法在 prototype 上，不在每个实例上。",
        "方法单独调用会丢 this，需要 bind 或箭头字段。"
      ],
      "practice": "写一个 `BankAccount` 类，用私有字段保存余额，提供 `deposit`、`withdraw` 和只读 `balance`；取款超过余额时抛出 `RangeError`。",
      "source": "Head First JavaScript Programming 2nd · Ch.12；JavaScript 高级程序设计 4th · Ch.8；JavaScript 权威指南 7th · Ch.9"
    },
    {
      "id": "ch9-2",
      "title": "extends、super 与静态成员",
      "minutes": 31,
      "lead": "`extends` 建立原型链，`super` 调用父类构造器或方法。顺序错了会报错：子类构造器里必须先调用 `super()` 才能使用 this；静态方法里的 super 指向父类构造器。",
      "sections": [
        {
          "h": "继承的初始化顺序",
          "p": "子类构造器必须先 `super(...)`，再访问 this；否则抛 `ReferenceError`。父类构造器负责初始化父类字段，子类再补自己的字段。\n\n不要在构造函数里做异步工作或 DOM 操作；构造器应只建立对象状态，副作用放到显式 init 方法。",
          "code": "class Animal {\n  constructor(name) { this.name = name; }\n  speak() { return `${this.name} makes a sound`; }\n}\nclass Dog extends Animal {\n  constructor(name, breed) {\n    super(name);\n    this.breed = breed;\n  }\n}\nconsole.log(new Dog(\"Fido\", \"lab\").speak());",
          "output": "Fido makes a sound",
          "tip": "子类构造器先 super，再 this；构造器不做异步和 DOM。"
        },
        {
          "h": "super 在实例方法与静态方法中的指向",
          "p": "实例方法里的 `super.method()` 调用父类原型上的方法；静态方法里的 `super.method()` 调用父类构造器上的静态方法。两者不是同一个对象。\n\n`super` 只能在 class 方法中使用；在普通函数或箭头函数里写 super 会语法错误。",
          "code": "class Base {\n  static kind() { return \"base\"; }\n  greet() { return \"base greet\"; }\n}\nclass Child extends Base {\n  static kind() { return `child of ${super.kind()}`; }\n  greet() { return `child + ${super.greet()}`; }\n}\nconsole.log(Child.kind());\nconsole.log(new Child().greet());",
          "output": "child of base\nchild + base greet",
          "tip": "静态 super 找父类构造器，实例 super 找父类原型；super 不能脱离 class 方法。"
        },
        {
          "h": "静态成员与私有字段",
          "p": "`static` 方法/字段挂在类本身，不在实例上；`#private` 字段只能在类体内访问，外部读取会报错。私有字段不是 Symbol 那种「不容易重名」，而是真正的访问控制。\n\n私有字段不能被 `Object.keys`、JSON 序列化或外部补丁直接看到；需要暴露时提供显式 getter。",
          "code": "class Counter {\n  static count = 0;\n  #value = 0;\n  inc() { this.#value += 1; Counter.count += 1; }\n  get value() { return this.#value; }\n}\nconst c = new Counter(); c.inc();\nconsole.log(c.value, Counter.count);\ntry { eval(\"c.#value\"); } catch (err) { console.log(err.name); }",
          "output": "1 1\nSyntaxError",
          "tip": "静态成员属于类；私有字段只能类内访问，外部访问是语法错误。"
        }
      ],
      "points": [
        "子类构造器必须先调用 super 才能用 this。",
        "静态 super 与实例 super 指向不同层级。",
        "static 属于类，#private 只在类体内可见。"
      ],
      "practice": "写一个 `Vehicle` 与 `ElectricCar` 的继承链，要求父类有静态工厂、子类有私有电量字段和 getter；再故意在 super 之前访问 this，观察报错。",
      "source": "JavaScript 高级程序设计 4th · Ch.8；JavaScript 权威指南 7th · Ch.9；Head First JavaScript Programming 2nd · Ch.12"
    },
    {
      "id": "ch9-3",
      "title": "mixin、组合与避免继承地狱",
      "minutes": 30,
      "lead": "继承适合「is-a」关系，组合适合「has-a / uses-a」。当一个类需要同时具备日志、缓存、权限、序列化等能力时，深继承会迅速变成难以维护的层级树。",
      "sections": [
        {
          "h": "mixin：把行为复制到原型",
          "p": "mixin 是一个把方法混入目标对象的函数；`Object.assign(Class.prototype, mixin)` 可以批量加方法，但会覆盖同名方法，也不会自动处理 super。\n\nmixin 适合无状态工具行为；有状态、有初始化顺序的能力，优先用显式组合对象。",
          "code": "const loggable = {\n  log(msg) { console.log(`[${this.name}] ${msg}`); }\n};\nclass Service { constructor(name) { this.name = name; } }\nObject.assign(Service.prototype, loggable);\nnew Service(\"api\").log(\"ready\");",
          "output": "[api] ready",
          "tip": "mixin 会覆盖同名方法；不要用它隐藏复杂的初始化依赖。"
        },
        {
          "h": "组合：把能力做成对象",
          "p": "组合把能力做成独立对象，由主对象持有并调用；依赖显式、测试可替换，也不会产生深原型链。\n\n组合的代价是调用路径变长；用清晰的接口和小对象控制复杂度，不要把所有东西都塞进一个 context。",
          "code": "function createLogger(name) {\n  return { info: msg => console.log(`[${name}] ${msg}`) };\n}\nfunction createService(name, logger) {\n  return { start() { logger.info(\"started\"); } };\n}\nconst svc = createService(\"api\", createLogger(\"api\"));\nsvc.start();",
          "output": "[api] started",
          "tip": "组合让依赖显式；适合需要替换、测试和多能力拼装的场景。"
        },
        {
          "h": "什么时候不用 class",
          "p": "如果对象没有行为、只是数据载体，用普通对象/工厂函数更轻；如果只需要一次性配置，不需要继承和多实例，也不必 class。\n\nclass 的优势是明确实例边界、私有字段和继承语法；不要为了「面向对象」把所有模块都 class 化。",
          "code": "function createPoint(x, y) {\n  return { x, y, distanceTo(p) { return Math.hypot(p.x - x, p.y - y); } };\n}\nconst a = createPoint(0, 0);\nconsole.log(a.distanceTo({ x: 3, y: 4 }));",
          "output": "5",
          "tip": "数据载体用对象/工厂；需要实例身份、私有状态和继承时才用 class。"
        }
      ],
      "points": [
        "mixin 适合无状态行为，注意覆盖和 super。",
        "组合让依赖显式，适合可替换能力。",
        "不要为所有数据强行 class 化。"
      ],
      "practice": "把一个「订单服务」拆成日志、缓存、权限三个能力，分别用 mixin 和组合实现；比较哪种更容易替换和单元测试。",
      "source": "Learning JavaScript Design Patterns · Ch.9；JavaScript 权威指南 7th · Ch.9；JavaScript: The Good Parts · Ch.5"
    }
  ]
});

/* --- js-ch10.js --- */

window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch10",
  "part": 3,
  "number": "10",
  "title": "数组与不可变数据",
  "summary": "数组看起来只是「一串值」，但 length、空槽、原地方法和引用共享会制造大量隐蔽 bug。把「读数据」和「改数据」分开，是数据处理的第一条工程纪律。",
  "goals": [
    "区分可变方法与返回新数组的方法",
    "理解稀疏数组和 length 截断",
    "用复制再排序避免污染原数组",
    "知道 splice、copyWithin 的副作用"
  ],
  "source": "JavaScript 高级程序设计 4th · Ch.6；JavaScript 权威指南 7th · Ch.7；Head First JavaScript Programming 2nd · Ch.4；Effective JavaScript · Item 51–53",
  "lessons": [
    {
      "id": "ch10-1",
      "title": "增删改查与不可变更新",
      "minutes": 24,
      "lead": "数组方法分成两派：修改原数组的（push、pop、splice、sort、reverse）和返回新数组的（map、filter、slice、concat）。状态管理里优先用后者。",
      "sections": [
        {
          "h": "先认清哪些方法会改原数组",
          "p": "`push` / `pop` / `shift` / `unshift` / `splice` / `sort` / `reverse` 都会原地修改。`slice` 返回新数组，`at()` 支持负下标读取，`includes` 判断存在。不可变更新常用展开、`map`、`filter`、`toSpliced`（较新）或先复制再改。",
          "code": "const list = [1, 2, 3];\nconst added = [...list, 4];\nconst removed = list.filter((n) => n !== 2);\nconst updated = list.map((n) => (n === 2 ? 20 : n));\nconsole.log(list.join(\",\"));\nconsole.log(added.join(\",\"), removed.join(\",\"), updated.join(\",\"));\nconsole.log(list.at(-1));",
          "output": "1,2,3\n1,2,3,4 1,3 1,20,3\n3",
          "tip": "`splice` 返回被删除的元素，不是修改后的数组；`slice` 和 `splice` 只差一个字母，行为完全不同。"
        },
        {
          "h": "按 id 更新一项，不要整表重建",
          "p": "列表更新常见需求是把某个 id 的字段改掉，同时保持其他项引用不变。用 `map` 找到目标项返回新对象，其他项原样返回即可。删除用 `filter`；新增用展开或 `toSpliced`。这样 React、Vue 的依赖比较才能看出真正变化的项。",
          "code": "const todos = [\n  { id: 1, text: \"写作业\", done: false },\n  { id: 2, text: \"练球\", done: true }\n];\nconst next = todos.map((todo) =>\n  todo.id === 1 ? { ...todo, done: true } : todo\n);\nconsole.log(next[0].done, next[1] === todos[1]);\nconsole.log(todos[0].done);",
          "output": "true true\nfalse",
          "tip": "不可变更新不等于每次全量深拷贝。只复制变化的那一项和路径上的容器，其他引用保持不变，性能更好。"
        }
      ],
      "points": [
        "`sort` / `splice` / `push` 会改原数组。",
        "`slice` 返回新数组，`at()` 支持负下标。",
        "按 id 更新用 `map`，只复制变化项。"
      ],
      "practice": "把一个待办列表里 id 为 1 的 `done` 改成 true，要求原数组不变、其他项的引用也不变；再实现按 id 删除。",
      "source": "Head First JavaScript Programming 2nd · Ch.4；JavaScript 高级程序设计 4th · Ch.6；JavaScript 权威指南 7th · Ch.7"
    },
    {
      "id": "ch10-2",
      "title": "稀疏数组、类数组与长度陷阱",
      "minutes": 30,
      "lead": "数组的空槽不是 undefined：`[1,,3]` 中间是 hole，`map` 会跳过它，`forEach` 也会跳过。`length` 不只是只读属性，直接改它会截断或制造空槽。",
      "sections": [
        {
          "h": "空槽与 undefined 不同",
          "p": "`new Array(3)` 创建三个空槽，不是三个 undefined。`0 in arr` 可以判断某个索引是否存在。`map`/`forEach`/`filter` 会跳过空槽，但 `Array.from` 和展开会把空槽变成 undefined。\n\n不要用 `delete arr[i]` 删数组元素，它会留下空槽；用 `splice` 或 `filter` 重建。",
          "code": "const a = [1, , 3];\nconsole.log(a.length, 1 in a, a[1]);\nconsole.log(a.map(x => x * 2));\nconsole.log([...a]);\nconst b = new Array(3);\nconsole.log(b.length, 0 in b);",
          "output": "3 false undefined\n[ 2, <1 empty item>, 6 ]\n[ 1, undefined, 3 ]\n3 false",
          "tip": "空槽不是 undefined；`delete` 数组元素会留下洞。"
        },
        {
          "h": "length 可以被写",
          "p": "把 `length` 改小会截断数组，改大会创建空槽。这个能力很少需要，但旧代码可能用它清空数组。现代代码用 `arr.length = 0` 清空可以，但更推荐重新赋值或 `splice(0)`。\n\n类数组对象（arguments、NodeList）有 length 和索引，但没有数组方法；先 `Array.from` 再处理。",
          "code": "const arr = [1, 2, 3, 4];\narr.length = 2;\nconsole.log(arr);\narr.length = 4;\nconsole.log(arr.length, 2 in arr);\nconst nodes = { 0: \"a\", 1: \"b\", length: 2 };\nconsole.log(Array.from(nodes));",
          "output": "[ 1, 2 ]\n4 false\n[ \"a\", \"b\" ]",
          "tip": "改 length 会截断或造空槽；类数组先 Array.from。"
        },
        {
          "h": "复制、冻结与只读视图",
          "p": "`slice()`、展开、`Array.from` 都能复制一层；`Object.freeze(arr)` 只冻结属性，不阻止 `push` 修改 length 和新增索引？实际上冻结数组后 push 会失败（严格模式抛错），但嵌套对象仍可改。\n\n需要只读视图时，复制后不暴露原数组；不要指望 freeze 提供深不可变。",
          "code": "const source = [{ n: 1 }];\nconst copy = source.slice();\ncopy[0].n = 2;\nconsole.log(source[0].n);\nconst frozen = Object.freeze([1, 2]);\ntry { frozen.push(3); } catch (e) { console.log(e.name); }",
          "output": "2\nTypeError",
          "tip": "浅复制共享嵌套对象；freeze 不是深冻结。"
        }
      ],
      "points": [
        "空槽不是 undefined，map/forEach 会跳过。",
        "length 可写，会截断或制造空槽。",
        "slice/展开只复制一层，freeze 不是深冻结。"
      ],
      "practice": "构造 `[1,,3]`，分别用 map、forEach、展开、Array.from 处理，记录结果差异；再写一个真正深拷贝嵌套数组的函数。",
      "source": "JavaScript 高级程序设计 4th · Ch.6；JavaScript 权威指南 7th · Ch.7；Effective JavaScript · Item 51"
    },
    {
      "id": "ch10-3",
      "title": "sort、copyWithin 与原地方法",
      "minutes": 31,
      "lead": "`sort`、`reverse`、`splice`、`copyWithin` 都会修改原数组。它们不是「不能用」，而是调用前必须知道原数组还有没有别的引用。默认 sort 还会把数字按字符串比较，10 会排在 2 前面。",
      "sections": [
        {
          "h": "sort 的比较器与稳定性",
          "p": "不传比较器时，sort 把元素转成字符串按 UTF-16 顺序比较，所以 `[10, 2, 1]` 变成 `[1, 10, 2]`。传 `(a,b) => a-b` 才是数值升序。现代规范要求排序稳定，但旧引擎不保证。\n\n比较器返回负数表示 a 在前，正数表示 b 在前，0 表示相等。",
          "code": "const nums = [10, 2, 1];\nconsole.log([...nums].sort());\nconsole.log([...nums].sort((a, b) => a - b));\nconst people = [{ name: \"Ada\", age: 36 }, { name: \"Grace\", age: 30 }];\nconsole.log(people.sort((a, b) => a.age - b.age).map(p => p.name));",
          "output": "[ 1, 10, 2 ]\n[ 1, 2, 10 ]\n[ \"Grace\", \"Ada\" ]",
          "tip": "默认 sort 按字符串；数值排序一定传比较器。"
        },
        {
          "h": "splice 的返回值与被删元素",
          "p": "`splice(start, deleteCount, ...items)` 返回被删除元素组成的新数组，原数组被修改。删除、插入、替换都用它。`toSpliced` 是返回新数组的不可变版本（新规范，旧环境未必支持）。\n\n`slice` 不修改原数组；`splice` 修改。名字只差一个字母，行为完全不同。",
          "code": "const arr = [\"a\", \"b\", \"c\", \"d\"];\nconst removed = arr.splice(1, 2, \"x\");\nconsole.log(removed);\nconsole.log(arr);\nconst copy = arr.slice(1);\nconsole.log(copy, arr);",
          "output": "[ \"b\", \"c\" ]\n[ \"a\", \"x\", \"d\" ]\n[ \"x\", \"d\" ] [ \"a\", \"x\", \"d\" ]",
          "tip": "`slice` 复制，`splice` 修改；需要原数组不变时先复制。"
        },
        {
          "h": "copyWithin、fill 与不可变更新",
          "p": "`copyWithin(target, start, end)` 在数组内部复制片段，`fill` 填充，两者都修改原数组并返回自身。它们适合底层缓冲区操作，不适合业务数据。\n\nReact/状态管理场景用 `[...arr]`、`map`、`filter`、`toSorted` 等返回新值的方式，避免共享引用被悄悄改掉。",
          "code": "const arr = [1, 2, 3, 4, 5];\nconsole.log(arr.copyWithin(0, 3));\nconst filled = new Array(3).fill(0);\nconsole.log(filled);\nconst next = [...arr].sort((a, b) => b - a);\nconsole.log(next, arr);",
          "output": "[ 4, 5, 3, 4, 5 ]\n[ 0, 0, 0 ]\n[ 5, 5, 4, 4, 3 ] [ 4, 5, 3, 4, 5 ]",
          "tip": "原地方法返回自身，容易误以为得到新数组；状态更新先复制。"
        }
      ],
      "points": [
        "默认 sort 按字符串比较，数值排序必须传比较器。",
        "slice 复制，splice 修改。",
        "copyWithin/fill 原地修改，状态更新优先不可变。"
      ],
      "practice": "把一个 `[10, 2, 1]` 数组分别用默认 sort、数值 sort、复制后 sort 处理，打印原数组和结果；再实现一个不修改原数组的 `removeAt(arr, index)`。",
      "source": "JavaScript 权威指南 7th · Ch.7；JavaScript 高级程序设计 4th · Ch.6；Effective JavaScript · Item 51–53"
    }
  ]
});

/* --- js-ch11.js --- */

window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch11",
  "part": 3,
  "number": "11",
  "title": "map、filter、reduce 与统计",
  "summary": "数组的三个核心高阶函数把「遍历」交给方法，把「业务」交给回调。reduce 尤其强大，但也最容易写成一团难读的累加器。本章把常用统计模式拆开。",
  "goals": [
    "用 map/filter/reduce 替代手写循环",
    "理解 reduce 的初始值与空数组边界",
    "写分组、频率表和统计聚合",
    "知道什么时候该拆成普通循环"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.10；Eloquent JavaScript 4th · Ch.5；JavaScript 权威指南 7th · Ch.7；Secrets of the JavaScript Ninja 2nd · Ch.9",
  "lessons": [
    {
      "id": "ch11-1",
      "title": "map、filter、reduce 的组合",
      "minutes": 26,
      "lead": "这三个方法是数据处理的骨架：map 做一对一转换，filter 做筛选，reduce 做归并。组合顺序不同，结果和性能也不同。",
      "sections": [
        {
          "h": "先筛选，再映射，最后归并",
          "p": "`map` 返回等长新数组，`filter` 返回长度可能变小的新数组，`reduce` 把数组压成一个值。链式调用时，先 `filter` 减少数据量，再 `map` 转换，最后 `reduce` 汇总，通常更省。每个回调都应是纯函数，不要在 `map` 里改外部变量。",
          "code": "const orders = [\n  { id: 1, total: 30, paid: true },\n  { id: 2, total: 50, paid: true },\n  { id: 3, total: 20, paid: false }\n];\nconst paidTotal = orders\n  .filter((order) => order.paid)\n  .map((order) => order.total)\n  .reduce((sum, total) => sum + total, 0);\nconsole.log(paidTotal);",
          "output": "80",
          "tip": "`reduce` 一定要给初始值。空数组不传初始值会抛 `TypeError`；传了初始值，空数组会安全返回初始值。"
        },
        {
          "h": "reduce 能做的事比求和多",
          "p": "`reduce` 可以分组、去重、统计词频、把数组转成对象。关键是明确累加器的形状：是数字、数组还是对象。累加器是对象时，每次返回新对象还是原地改，要根据是否需要不可变决定。",
          "code": "const orders = [\n  { id: 1, paid: true },\n  { id: 2, paid: true },\n  { id: 3, paid: false }\n];\nconst words = [\"a\", \"b\", \"a\", \"c\", \"b\", \"a\"];\nconst counts = words.reduce((acc, word) => {\n  acc[word] = (acc[word] || 0) + 1;\n  return acc;\n}, {});\nconsole.log(counts);\n\nconst grouped = orders.reduce((acc, order) => {\n  const key = order.paid ? \"paid\" : \"unpaid\";\n  (acc[key] ||= []).push(order.id);\n  return acc;\n}, {});\nconsole.log(grouped);",
          "output": "{ a: 3, b: 2, c: 1 }\n{ paid: [ 1, 2 ], unpaid: [ 3 ] }",
          "tip": "`||=` 只在左侧为假值时赋值，适合初始化分组数组；如果键可能是 `0` 或 `\"\"`，用 `??=` 更准确。"
        }
      ],
      "points": [
        "`map` 一对一，`filter` 筛选，`reduce` 归并。",
        "`reduce` 必须给初始值。",
        "分组和统计都能用 `reduce`，但要明确累加器形状。"
      ],
      "practice": "给定一组订单，分别计算已支付总额、按支付状态分组、统计每个用户的下单次数；要求不修改原数组。",
      "source": "Head First JavaScript Programming 2nd · Ch.10；Eloquent JavaScript 4th · Ch.5；JavaScript 权威指南 7th · Ch.7"
    },
    {
      "id": "ch11-2",
      "title": "排序、查找与分组统计",
      "minutes": 24,
      "lead": "默认排序按字符串比较，`10` 会排在 `2` 后面。数值排序必须传比较函数；查找要区分“第一个匹配”和“是否存在”。",
      "sections": [
        {
          "h": "sort 会改原数组，而且默认按字典序",
          "p": "`sort()` 不传比较函数时，会把元素转成字符串按 UTF-16 顺序排，所以 `[10, 2, 1].sort()` 得到 `[1, 10, 2]`。数值升序写 `(a, b) => a - b`，降序写 `(a, b) => b - a`。排序前先复制数组，避免影响共享数据。",
          "code": "const scores = [88, 72, 95, 60];\nconst ranked = [...scores].sort((a, b) => b - a);\nconsole.log(ranked.join(\",\"));\nconsole.log(scores.join(\",\"));\n\nconst users = [\n  { name: \"Ada\", score: 88 },\n  { name: \"Grace\", score: 95 }\n];\nusers.sort((a, b) => b.score - a.score);\nconsole.log(users.map((u) => u.name).join(\",\"));",
          "output": "95,88,72,60\n88,72,95,60\nGrace,Ada",
          "tip": "比较函数返回负数表示 a 在前，正数表示 b 在前，0 表示相等。不要写 `return a > b`，布尔值转数字只有 0/1，排序会不稳定。"
        },
        {
          "h": "find、some、every 各管什么",
          "p": "`find` 返回第一个匹配元素，找不到返回 `undefined`；`findIndex` 返回下标；`some` 判断是否存在至少一个匹配；`every` 判断是否全部匹配。`includes` 只做严格相等判断，不能传条件函数。空数组上 `every` 返回 `true`，这是数学上的“空真”，写逻辑时要注意。",
          "code": "const nums = [3, 8, 12, 5];\nconsole.log(nums.find((n) => n > 10));\nconsole.log(nums.findIndex((n) => n > 10));\nconsole.log(nums.some((n) => n < 0));\nconsole.log(nums.every((n) => n > 0));\nconsole.log([].every((n) => n > 0));",
          "output": "12\n2\nfalse\ntrue\ntrue",
          "tip": "要同时拿元素和下标，用 `findIndex` 再取；要拿所有匹配项，用 `filter`。别用 `find` 循环里再查一次下标。"
        }
      ],
      "points": [
        "`sort` 原地修改，默认按字符串比较。",
        "数值排序必须传 `(a,b)=>a-b` 或降序版本。",
        "`find` 返回元素，`findIndex` 返回下标，`some` / `every` 返回布尔。"
      ],
      "practice": "给一个成绩数组做降序排名，要求不改原数组；再找出第一个不及格分数和它的下标，并判断是否全部及格。",
      "source": "JavaScript 高级程序设计 4th · Ch.6；JavaScript 权威指南 7th · Ch.7；Secrets of the JavaScript Ninja 2nd · Ch.9"
    },
    {
      "id": "ch11-3",
      "title": "自定义 groupBy、频率表与聚合",
      "minutes": 32,
      "lead": "统计代码最容易写成「一个 reduce 里塞所有逻辑」。把分组、计数、求和、均值拆成独立函数，再按需组合，既好测也好改。",
      "sections": [
        {
          "h": "groupBy：把记录按 key 分组",
          "p": "`reduce` 分组时，累加器用普通对象或 `Map`。用对象时要注意 key 是 `__proto__`、`constructor` 等特殊字符串，可能污染原型；用 `Map` 或 `Object.create(null)` 更安全。\n\n分组结果通常是 `key -> 数组`；不要一边分组一边算复杂聚合，先分组再 map 聚合。",
          "code": "function groupBy(items, keyFn) {\n  return items.reduce((acc, item) => {\n    const key = keyFn(item);\n    (acc[key] ||= []).push(item);\n    return acc;\n  }, Object.create(null));\n}\nconst rows = [{ team: \"A\", n: 2 }, { team: \"B\", n: 3 }, { team: \"A\", n: 4 }];\nconsole.log(groupBy(rows, r => r.team));",
          "output": "{ A: [ { team: \"A\", n: 2 }, { team: \"A\", n: 4 } ], B: [ { team: \"B\", n: 3 } ] }",
          "tip": "分组 key 可能撞原型属性；用 Object.create(null) 或 Map。"
        },
        {
          "h": "频率表与去重",
          "p": "频率表是 value -> count，用 `Map` 保留插入顺序，也避免对象 key 的字符串化。去重可以用 `Set`，但对象去重需要按引用或自定义 key；`JSON.stringify` 当 key 会受属性顺序影响。\n\n统计前先明确「什么算同一个值」：原始值、对象引用、还是某个业务 id。",
          "code": "function frequency(items) {\n  const map = new Map();\n  for (const item of items) map.set(item, (map.get(item) || 0) + 1);\n  return map;\n}\nconsole.log(frequency([\"a\", \"b\", \"a\"]));\nconsole.log([...new Set([\"a\", \"b\", \"a\"])]);\nconst objs = [{ id: 1 }, { id: 1 }];\nconsole.log(new Set(objs).size);",
          "output": "Map(2) { \"a\" => 2, \"b\" => 1 }\n[ \"a\", \"b\" ]\n2",
          "tip": "对象去重默认按引用；按业务 id 去重要自己建 key。"
        },
        {
          "h": "求和、均值与边界",
          "p": "`reduce` 求和的初始值决定空数组行为：不传初始值时，空数组会抛 TypeError；传 0 则返回 0。均值要处理空数组、非数字、NaN 和精度问题。\n\n金额统计用整数分或 `Math.round` 统一精度，不要直接累加浮点数后假装精确。",
          "code": "const sum = (arr, pick = x => x) => arr.reduce((acc, x) => acc + pick(x), 0);\nconst avg = arr => arr.length ? sum(arr) / arr.length : null;\nconsole.log(sum([]), avg([]));\nconsole.log(sum([{ n: 2 }, { n: 3 }], x => x.n));\nconsole.log(avg([1, 2, 3]));",
          "output": "0 null\n5\n2",
          "tip": "reduce 空数组要显式初始值；均值空数组返回 null 或抛错，不要返回 NaN。"
        }
      ],
      "points": [
        "分组用 Map 或 null 原型对象，避免原型污染。",
        "频率表要明确什么算同一个值。",
        "reduce 空数组必须给初始值；金额注意精度。"
      ],
      "practice": "实现 `groupBy`、`frequency`、`sumBy`、`avgBy` 四个纯函数，用同一组订单数据分别按团队、按月份统计；再用空数组测试每个函数的边界。",
      "source": "JavaScript 权威指南 7th · Ch.7；Secrets of the JavaScript Ninja 2nd · Ch.9；Eloquent JavaScript 4th · Ch.5"
    }
  ]
});

/* --- js-ch12.js --- */

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

/* --- js-ch13.js --- */

window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch13",
  "part": 3,
  "number": "13",
  "title": "Map/Set、正则与 JSON",
  "summary": "标准库决定你写业务代码的效率。Map/Set 解决对象键和去重问题，正则解决模式匹配，JSON 解决跨边界序列化。三者都有容易忽略的边界。",
  "goals": [
    "在对象、Map、Set 之间选对容器",
    "写命名分组、断言和替换回调",
    "理解 JSON 的丢失类型与循环引用",
    "知道结构化克隆的边界"
  ],
  "source": "JavaScript 高级程序设计 4th · Ch.6、23；JavaScript 权威指南 7th · Ch.11；Secrets of the JavaScript Ninja 2nd · Ch.9–10；Eloquent JavaScript 4th · Ch.9",
  "lessons": [
    {
      "id": "ch13-1",
      "title": "Map、Set、WeakMap 与弱引用",
      "minutes": 31,
      "lead": "对象适合固定字段，Map 适合动态键和频繁增删，Set 适合去重和成员判断。WeakMap/WeakSet 只接受对象键，不阻止垃圾回收，适合给对象挂私有数据。",
      "sections": [
        {
          "h": "Map 与对象的差别",
          "p": "Map 的键可以是任意类型，保留插入顺序，`size` 直接可读，频繁增删性能更稳定；对象键会被转成字符串/Symbol，`__proto__` 等键有原型风险。\n\nJSON 不能直接序列化 Map；需要转成数组或普通对象。遍历 Map 用 `for...of`，不是 `for...in`。",
          "code": "const map = new Map([[\"a\", 1], [2, \"b\"]]);\nmap.set(\"c\", 3);\nconsole.log(map.size, map.get(2));\nconsole.log([...map.keys()]);\nconsole.log(JSON.stringify(map));",
          "output": "3 b\n[ \"a\", 2, \"c\" ]\n{}",
          "tip": "Map 键不转字符串；JSON 序列化 Map 会得到空对象，需要手动转换。"
        },
        {
          "h": "Set 去重与成员判断",
          "p": "Set 按 SameValueZero 判断相等，NaN 被视为相同，+0/-0 也相同；对象按引用。`has` 是 O(1) 平均复杂度，比数组 `includes` 更适合大集合。\n\nSet 不提供索引访问；需要顺序和索引时用数组，去重时再转 Set。",
          "code": "const set = new Set([1, 2, 2, NaN, NaN]);\nconsole.log(set.size, set.has(NaN));\nconst objs = [{ id: 1 }, { id: 1 }];\nconsole.log(new Set(objs).size);\nconsole.log([...set]);",
          "output": "3 true\n2\n[ 1, 2, NaN ]",
          "tip": "Set 按引用判断对象；按业务 id 去重要自己建 Map。"
        },
        {
          "h": "WeakMap 与生命周期",
          "p": "WeakMap 的键必须是对象，值任意；它不阻止键被回收，也没有 `size` 和遍历方法。适合给 DOM 节点或对象挂元数据，避免内存泄漏。\n\nWeakMap 不可枚举，不能拿来当缓存统计；需要统计命中率时用 Map + 明确清理策略。",
          "code": "const meta = new WeakMap();\nlet node = { id: 1 };\nmeta.set(node, { visited: true });\nconsole.log(meta.get(node));\nnode = null;\nconsole.log(meta.has(node));",
          "output": "{ visited: true }\nfalse（node 已为 null，不能作为键）",
          "tip": "WeakMap 键必须是对象且不可枚举；适合元数据，不适合可统计缓存。"
        }
      ],
      "points": [
        "Map 键可为任意类型，JSON 序列化会丢失。",
        "Set 按 SameValueZero 去重，对象按引用。",
        "WeakMap 不阻止回收，不能遍历和统计。"
      ],
      "practice": "用 Map 统计一段文本的词频，按出现次数排序输出；再用 Set 对一组对象按 id 去重，比较直接 Set 与 Map 的结果差异。",
      "source": "JavaScript 权威指南 7th · Ch.11；JavaScript 高级程序设计 4th · Ch.6；Secrets of the JavaScript Ninja 2nd · Ch.9"
    },
    {
      "id": "ch13-2",
      "title": "正则表达式：分组、断言与替换",
      "minutes": 33,
      "lead": "正则不是「一串神秘符号」，而是有明确语法的模式匹配。先分清字符、量词、分组、断言和标志，再用 `match`、`replace`、`split` 组合。",
      "sections": [
        {
          "h": "命名分组与 matchAll",
          "p": "括号分组会捕获子串，`(?<name>...)` 给分组命名，结果在 `groups` 里。全局匹配用 `g` 标志；`matchAll` 返回所有匹配的迭代器，普通 `match` 在 g 模式下只返回匹配文本，不返回分组。\n\n正则对象带 `g` 时有 `lastIndex` 状态，反复 `test` 可能从上次位置继续；需要无状态判断时去掉 g 或每次新建。",
          "code": "const text = \"Ada: 36, Grace: 30\";\nconst re = /(?<name>\\w+): (?<age>\\d+)/g;\nconsole.log([...text.matchAll(re)].map(m => m.groups));\nconsole.log(text.match(re));",
          "output": "[ { name: \"Ada\", age: \"36\" }, { name: \"Grace\", age: \"30\" } ]\n[ \"Ada: 36\", \"Grace: 30\" ]",
          "tip": "g 模式下 match 不返回分组；要分组用 matchAll 或去掉 g 后 exec。"
        },
        {
          "h": "断言、贪婪与替换回调",
          "p": "`(?=...)` 是正向先行断言，`(?<=...)` 是正向后行断言，只检查位置不消费字符。量词默认贪婪，`?` 改为惰性。替换字符串里 `$1`、`$<name>` 引用分组；回调可以按匹配内容动态生成替换值。\n\n正则不是解析 HTML/JSON 的可靠工具；结构化格式用解析器。",
          "code": "const price = \"￥12 ￥30\";\nconsole.log(price.replace(/￥(\\d+)/g, (_, n) => `$${n}`));\nconst words = \"foo bar baz\";\nconsole.log(words.match(/\\w+(?= bar)/)?.[0]);\nconsole.log(\"aaa\".match(/a+?/)?.[0]);",
          "output": "$12 $30\nfoo\na",
          "tip": "断言只检查位置；正则不要用来解析 HTML/JSON。"
        },
        {
          "h": "常用模式与安全边界",
          "p": "邮箱、URL、手机号没有一条「万能正则」；不同标准、国际化域名和国际号码都会让简单模式失效。业务校验应明确规则，复杂格式交给专用库或服务端。\n\n用户输入拼进正则前要转义元字符，避免正则注入；不要在不可信输入上跑灾难性回溯的表达式。",
          "code": "const escapeRe = s => s.replace(/[.*+?^${}()|[\\]\\\\]/g, \"\\\\$&\");\nconst input = \"a+b\";\nconst re = new RegExp(escapeRe(input));\nconsole.log(re.test(\"a+b\"));\nconsole.log(/^[^@]+@[^@]+$/.test(\"a@b\"));",
          "output": "true\ntrue",
          "tip": "用户输入拼正则前先转义；复杂格式不要靠一条万能正则。"
        }
      ],
      "points": [
        "g 模式正则有 lastIndex 状态，match 不返回分组。",
        "断言只检查位置，不消费字符。",
        "用户输入拼正则前必须转义。"
      ],
      "practice": "写一个 `highlight(text, word)`，把文本中所有完整单词高亮；要求对用户输入的正则元字符安全，并比较大小写敏感与不敏感两种结果。",
      "source": "JavaScript 权威指南 7th · Ch.11；Secrets of the JavaScript Ninja 2nd · Ch.10；JavaScript 高级程序设计 4th · Ch.5"
    },
    {
      "id": "ch13-3",
      "title": "JSON、结构化克隆与序列化边界",
      "minutes": 32,
      "lead": "JSON 是跨语言的数据交换格式，不是 JavaScript 对象的完整序列化。函数、undefined、Symbol、Map、Set、Date、循环引用都会在 JSON 里丢失或变形；发送前要明确契约。",
      "sections": [
        {
          "h": "stringify/parse 的 replacer 与 reviver",
          "p": "`JSON.stringify(value, replacer, space)` 可以过滤字段或转换值；`JSON.parse(text, reviver)` 可以在解析时恢复日期等类型。`toJSON` 方法可以自定义对象的序列化结果。\n\nJSON 只支持对象、数组、字符串、数字、布尔和 null；NaN/Infinity 会变成 null。",
          "code": "const user = { name: \"Ada\", age: 36, password: \"x\" };\nconst json = JSON.stringify(user, (k, v) => k === \"password\" ? undefined : v, 2);\nconsole.log(json);\nconst parsed = JSON.parse(json, (k, v) => k === \"date\" ? new Date(v) : v);\nconsole.log(parsed);",
          "output": "{\n  \"name\": \"Ada\",\n  \"age\": 36\n}\n{ name: \"Ada\", age: 36 }",
          "tip": "replacer 返回 undefined 会删除字段；reviver 只影响解析结果。"
        },
        {
          "h": "循环引用与深拷贝",
          "p": "JSON 深拷贝遇到循环引用会抛 `TypeError: Converting circular structure to JSON`；它也会丢失函数、undefined、Symbol、RegExp、Map/Set。`structuredClone` 支持更多内置类型和循环引用，但不能克隆函数和 DOM 节点。\n\n需要保留原型或自定义类时，结构化克隆也不保证；要自己实现序列化协议。",
          "code": "const a = { name: \"a\" }; a.self = a;\ntry { JSON.stringify(a); } catch (e) { console.log(e.name); }\nconst clone = structuredClone(a);\nconsole.log(clone.self === clone);",
          "output": "TypeError\ntrue",
          "tip": "JSON 不能处理循环引用；structuredClone 支持循环但不能克隆函数/DOM。"
        },
        {
          "h": "跨边界契约与版本",
          "p": "存 localStorage、发 HTTP、写文件时，JSON 结构就是契约。字段改名、类型变化、旧数据残留都会让读取方崩溃；需要版本字段、默认值和迁移逻辑。\n\n不要把整个 DOM、类实例或密钥直接 JSON 化存储；只存必要字段，并在读取时校验。",
          "code": "const STORE_KEY = \"app:v2\";\nfunction save(state) {\n  localStorage.setItem(STORE_KEY, JSON.stringify({ version: 2, state }));\n}\nfunction load() {\n  const raw = JSON.parse(localStorage.getItem(STORE_KEY) || \"null\");\n  return raw && raw.version === 2 ? raw.state : null;\n}",
          "output": "保存：{\"version\":2,\"state\":{...}}\n读取旧版本：null（触发迁移）",
          "tip": "持久化数据要带版本和校验；不要直接信任 localStorage 里的 JSON。"
        }
      ],
      "points": [
        "JSON 只支持有限类型，NaN/Infinity 会变 null。",
        "JSON 不能处理循环引用；structuredClone 支持循环但不支持函数。",
        "持久化数据要有版本、默认值和校验。"
      ],
      "practice": "写一对 `saveState/loadState`，要求带版本号、过滤敏感字段、兼容旧版本；再用一个循环引用对象分别测试 JSON 和 structuredClone。",
      "source": "JavaScript 权威指南 7th · Ch.11；JavaScript 高级程序设计 4th · Ch.23；Eloquent JavaScript 4th · Ch.9"
    }
  ]
});

/* --- js-ch14.js --- */

window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch14",
  "part": 4,
  "number": "14",
  "title": "DOM：把页面变成可操作的数据",
  "summary": "DOM 不是 HTML 字符串，而是一棵节点树。选择、创建、插入、修改样式和批量更新都要围绕这棵树；但每次读写布局都可能触发重排，性能和可维护性要一起考虑。",
  "goals": [
    "用 querySelector、createElement、append 操作 DOM",
    "用 template 和 DocumentFragment 批量构建",
    "识别布局抖动并合并读写",
    "写出语义化、可聚焦、可访问的 DOM"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.6、8；JavaScript 高级程序设计 4th · Ch.14–15；JavaScript 权威指南 7th · Ch.15；Secrets of the JavaScript Ninja 2nd · Ch.12",
  "lessons": [
    {
      "id": "ch14-1",
      "title": "选择、创建与修改 DOM",
      "minutes": 24,
      "lead": "DOM 操作的核心是“先拿到节点，再改它的属性、文本或结构”。优先用 `textContent`，少用 `innerHTML`，避免把用户输入当 HTML 执行。",
      "sections": [
        {
          "h": "querySelector 与 createElement",
          "p": "`querySelector` 返回第一个匹配元素，`querySelectorAll` 返回静态 NodeList（不会随 DOM 变化自动更新）。创建节点用 `document.createElement`，设置文本用 `textContent`，插入用 `append` / `prepend` / `before` / `after`。批量插入先用 `DocumentFragment` 组装，再一次性挂到页面，减少重排。",
          "code": "const list = document.querySelector(\"#list\");\nconst item = document.createElement(\"li\");\nitem.textContent = \"新任务\";\nitem.className = \"task\";\nlist.append(item);\nconsole.log(list.children.length); // 假设原本有 1 个 li",
          "output": "2",
          "tip": "`innerHTML` 会重新解析整段 HTML，既慢又有 XSS 风险。只有完全可信的静态模板才考虑它；用户输入一律 `textContent`。"
        },
        {
          "h": "classList 与 dataset",
          "p": "`classList.add/remove/toggle/contains` 比直接拼 `className` 更安全，不会把其他类名覆盖掉。`dataset` 读写 `data-*` 属性，适合在节点上挂小段业务标识。复杂状态不要全塞进 DOM 属性，仍应放在 JavaScript 状态里，DOM 只做展示。",
          "code": "const card = document.querySelector(\".card\");\ncard.classList.add(\"is-active\");\ncard.classList.toggle(\"is-hidden\");\ncard.dataset.id = \"42\";\nconsole.log(card.classList.contains(\"is-active\"));\nconsole.log(card.dataset.id);",
          "output": "true\n42",
          "tip": "`dataset` 的值永远是字符串。存数字要显式 `Number(...)`；存对象要 `JSON.stringify`，读的时候再解析并处理失败。"
        }
      ],
      "points": [
        "`querySelectorAll` 返回静态列表。",
        "用户输入用 `textContent`，不要拼 `innerHTML`。",
        "`classList` 比改 `className` 安全，`dataset` 值都是字符串。"
      ],
      "practice": "用 `createElement` 和 `DocumentFragment` 一次性插入 10 个列表项，每项带 `data-id` 和不同文本；再切换其中一项的 `is-active` 类。",
      "source": "Head First JavaScript Programming 2nd · Ch.6；JavaScript 高级程序设计 4th · Ch.14；JavaScript 权威指南 7th · Ch.15"
    },
    {
      "id": "ch14-2",
      "title": "节点遍历、模板与批量更新",
      "minutes": 31,
      "lead": "直接拼 HTML 字符串再 `innerHTML` 很快，但容易产生 XSS、丢失事件和整棵子树重建。`template` 和 `DocumentFragment` 让你先离屏构建，再一次性插入。",
      "sections": [
        {
          "h": "节点关系与遍历",
          "p": "`parentNode`、`children`、`firstElementChild`、`nextElementSibling` 只走元素节点；`childNodes` 包含文本和注释。遍历时优先用元素 API，避免把空白文本当成节点。\n\n`querySelectorAll` 返回静态 NodeList，不会随 DOM 变化自动更新；需要实时集合时用 `getElementsBy*`，但现代代码更常用一次性选择。",
          "code": "const list = document.querySelector(\"#list\");\nconsole.log(list.children.length);\nconsole.log(list.firstElementChild.textContent);\nconst items = list.querySelectorAll(\"li\");\nconsole.log(items.length);",
          "output": "3\n第一项\n3",
          "tip": "`childNodes` 含文本节点；`children` 只含元素。querySelectorAll 是静态集合。"
        },
        {
          "h": "template 与 DocumentFragment",
          "p": "`<template>` 内容不会渲染，`content` 是一个 DocumentFragment；克隆后填入数据再插入。DocumentFragment 可以承载多个节点，插入时只触发一次 DOM 变更。\n\n不要每次循环都 append 到真实 DOM；先在 fragment 里组装，最后一次性 append。",
          "code": "<template id=\"row-tpl\">\n  <li class=\"row\"><span class=\"name\"></span></li>\n</template>\n<script>\n  const tpl = document.querySelector(\"#row-tpl\");\n  const frag = document.createDocumentFragment();\n  [\"Ada\", \"Grace\"].forEach(name => {\n    const row = tpl.content.cloneNode(true);\n    row.querySelector(\".name\").textContent = name;\n    frag.append(row);\n  });\n  document.querySelector(\"#list\").append(frag);\n</script>",
          "output": "列表中出现两行：Ada / Grace",
          "tip": "template.content 是离屏片段；cloneNode(true) 深克隆，最后一次性插入。"
        },
        {
          "h": "textContent 与 innerHTML 的边界",
          "p": "`textContent` 按纯文本写入，不会解析标签，是用户输入的安全选择；`innerHTML` 会解析 HTML，可能执行脚本或插入恶意标签。需要富文本时先净化，不要直接把用户输入拼进 innerHTML。\n\n`insertAdjacentHTML` 同样解析 HTML；`insertAdjacentText` 才是纯文本。",
          "code": "const input = \"<img src=x onerror=alert(1)>\";\nconst box = document.querySelector(\"#box\");\nbox.textContent = input;\nconsole.log(box.textContent);\n// box.innerHTML = input; // 不要对用户输入这样做",
          "output": "页面上显示字面文本 <img ...>\n不会创建 img 元素",
          "tip": "用户输入一律 textContent；必须用 innerHTML 时先做白名单净化。"
        }
      ],
      "points": [
        "元素遍历用 children/nextElementSibling，不用 childNodes。",
        "template + fragment 批量构建，减少 DOM 变更。",
        "用户输入用 textContent，innerHTML 有 XSS 风险。"
      ],
      "practice": "用 template 和 DocumentFragment 构建一个 20 行列表，比较逐行 append 与一次性 append 的耗时；再把用户输入分别用 textContent 和 innerHTML 渲染，观察差异。",
      "source": "Head First JavaScript Programming 2nd · Ch.6、8；JavaScript 权威指南 7th · Ch.15；Secrets of the JavaScript Ninja 2nd · Ch.12"
    },
    {
      "id": "ch14-3",
      "title": "样式、布局抖动与性能",
      "minutes": 32,
      "lead": "读取 `offsetHeight`、`getBoundingClientRect`、`scrollTop` 会迫使浏览器计算布局；如果读和写交替进行，就会形成布局抖动。把读操作集中在一起，再统一写，是 DOM 性能的第一步。",
      "sections": [
        {
          "h": "style 与 classList 的选择",
          "p": "单个动态值用 `style.setProperty` 或 `element.style`；一组状态用 `classList.add/remove/toggle`。直接改 style 会留下内联样式，难以覆盖和复用；样式尽量放 CSS 类。\n\n`classList.toggle(name, force)` 可以强制添加/移除，避免自己写 if。",
          "code": "const box = document.querySelector(\"#box\");\nbox.classList.add(\"active\");\nbox.classList.toggle(\"hidden\", true);\nbox.style.setProperty(\"--progress\", \"40%\");\nconsole.log(box.className);",
          "output": "box active hidden",
          "tip": "状态用 class，单个变量用 style；不要把所有样式都写成内联。"
        },
        {
          "h": "布局抖动：先读后写",
          "p": "下面这种循环最伤性能：读 `offsetWidth`、写 `style.width`、再读下一个元素。每轮都让浏览器重新布局。正确做法是先收集所有读值，再统一写。\n\n`requestAnimationFrame` 把写操作放到下一帧，适合动画；但不要在 rAF 里做重计算。",
          "code": "const items = [...document.querySelectorAll(\".item\")];\nconst widths = items.map(el => el.offsetWidth);\nitems.forEach((el, i) => { el.style.width = `${widths[i] / 2}px`; });\nrequestAnimationFrame(() => document.body.classList.add(\"ready\"));",
          "output": "所有 item 宽度减半，下一帧加上 ready 类",
          "tip": "读写分离；批量修改；动画写操作放 rAF。"
        },
        {
          "h": "重排、重绘与合成",
          "p": "改宽高、位置、字体通常触发重排；改颜色、背景触发重绘；transform/opacity 可以走合成层，成本更低。`will-change` 要谨慎使用，滥用会占显存。\n\n不要用 `top/left` 做高频动画，优先 `transform: translate`；动画结束清理 will-change。",
          "code": "const card = document.querySelector(\".card\");\ncard.style.transform = \"translateX(20px)\";\ncard.style.opacity = \"0.8\";\n// 动画结束后：card.style.willChange = \"auto\";",
          "output": "卡片右移并半透明，通常不触发重排",
          "tip": "高频动画优先 transform/opacity；will-change 用完就撤。"
        }
      ],
      "points": [
        "状态用 class，变量用 style。",
        "DOM 读写分离，避免布局抖动。",
        "transform/opacity 比 top/left 更适合动画。"
      ],
      "practice": "写一个 50 个元素的列表，在循环里交替读取 offsetWidth 和修改 width，记录耗时；再改成先读后写和 rAF，比较差异。",
      "source": "JavaScript 高级程序设计 4th · Ch.14–15；JavaScript 权威指南 7th · Ch.15；Secrets of the JavaScript Ninja 2nd · Ch.12"
    },
    {
      "id": "ch14-4",
      "title": "无障碍、语义与可维护 DOM",
      "minutes": 32,
      "lead": "DOM 不只是给鼠标用户看的。屏幕阅读器依赖语义、标签、焦点顺序和 ARIA；一个 `div` 加 `onclick` 不是按钮。可访问性不是额外装饰，而是 DOM 设计的一部分。",
      "sections": [
        {
          "h": "语义元素优先",
          "p": "能用 `button`、`nav`、`main`、`label` 就不要用 `div` 模拟。原生元素自带键盘行为、焦点管理和辅助技术语义；自己模拟要补很多工作。\n\n标题层级按结构递进，不要为了字号跳过 h2/h3；一个页面通常只有一个 h1。",
          "code": "<label for=\"email\">邮箱</label>\n<input id=\"email\" type=\"email\" autocomplete=\"email\">\n<button type=\"submit\">订阅</button>\n<nav aria-label=\"主导航\"><a href=\"/\">首页</a></nav>",
          "output": "屏幕阅读器读出「邮箱，编辑框」\n按钮可通过 Tab/Enter 触发",
          "tip": "原生语义优先；label 的 for 要对应 input 的 id。"
        },
        {
          "h": "焦点、键盘与 ARIA",
          "p": "所有可交互元素必须能通过 Tab 到达，并有可见焦点样式。自定义组件要处理 Enter/Space、Escape、方向键和焦点陷阱；ARIA 只补语义，不替代键盘行为。\n\n`aria-hidden=\"true\"` 会把元素从辅助技术中移除，但不会阻止鼠标点击；不要用它隐藏可交互内容。",
          "code": "<div role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"title\">\n  <h2 id=\"title\">确认删除</h2>\n  <button type=\"button\">取消</button>\n  <button type=\"button\">删除</button>\n</div>",
          "output": "对话框被读作 dialog，标题为「确认删除」\n按钮可聚焦",
          "tip": "ARIA 只补语义；键盘、焦点和可见焦点样式必须自己实现。"
        },
        {
          "h": "可维护的 DOM 结构",
          "p": "把 DOM 操作集中到渲染层，业务逻辑只处理数据；不要在事件回调里到处 `querySelector`。给关键节点稳定的 id/class，避免依赖脆弱的层级选择器。\n\n组件卸载时移除监听、清定时器、释放 URL/ObjectURL 和大对象；否则 DOM 删了，闭包还活着。",
          "code": "function renderList(items) {\n  const list = document.querySelector(\"#list\");\n  list.replaceChildren(...items.map(item => {\n    const li = document.createElement(\"li\");\n    li.textContent = item.name;\n    return li;\n  }));\n}",
          "output": "列表被整体替换为新的 li 集合",
          "tip": "DOM 操作集中；卸载时清理监听和资源；选择器要稳定。"
        }
      ],
      "points": [
        "语义元素自带键盘和辅助技术行为。",
        "ARIA 只补语义，不替代键盘和焦点管理。",
        "DOM 操作集中，卸载时清理监听和资源。"
      ],
      "practice": "把一个 `div` 模拟的按钮改成原生 button，补上 label、焦点样式和键盘触发；再用屏幕阅读器或 DevTools 的 Accessibility 面板检查语义。",
      "source": "JavaScript 权威指南 7th · Ch.15；JavaScript 高级程序设计 4th · Ch.14；Head First JavaScript Programming 2nd · Ch.8"
    }
  ]
});

/* --- js-ch15.js --- */

window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch15",
  "part": 4,
  "number": "15",
  "title": "事件、表单与用户输入",
  "summary": "事件是浏览器和用户之间的消息。冒泡、捕获、委托、默认行为和事件对象决定你能不能只写一个监听器处理一整张列表；表单则把输入、校验和提交串成一条链。",
  "goals": [
    "解释捕获、目标、冒泡三个阶段",
    "用事件委托处理动态列表",
    "正确阻止默认行为和冒泡",
    "处理表单校验、提交与输入事件"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.9；JavaScript 高级程序设计 4th · Ch.17；JavaScript 权威指南 7th · Ch.15；Secrets of the JavaScript Ninja 2nd · Ch.13",
  "lessons": [
    {
      "id": "ch15-1",
      "title": "事件冒泡、委托与解绑",
      "minutes": 26,
      "lead": "事件从目标元素向上冒泡，所以可以在父元素统一监听，再判断真正触发的是谁。这叫事件委托，特别适合动态增删的列表。",
      "sections": [
        {
          "h": "target 与 currentTarget",
          "p": "`event.target` 是实际触发的元素，`event.currentTarget` 是当前绑定监听器的元素。事件委托里用 `target.closest(\"button[data-id]\")` 找到最近的按钮，再读 `dataset.id`。`preventDefault` 阻止浏览器默认行为，`stopPropagation` 阻止继续冒泡；后者滥用会让外层监听失效。",
          "code": "const list = document.querySelector(\"#list\");\nlist.addEventListener(\"click\", (event) => {\n  const btn = event.target.closest(\"button[data-id]\");\n  if (!btn) return;\n  console.log(\"删除\", btn.dataset.id);\n});",
          "output": "删除 3",
          "tip": "委托监听要确认事件确实冒泡。`focus`、`blur` 不冒泡，用 `focusin` / `focusout`；需要捕获阶段时给 `addEventListener` 第三参传 `true`。"
        },
        {
          "h": "解绑要拿到同一个函数引用",
          "p": "`removeEventListener` 必须传入与绑定时相同的函数引用、相同捕获标志，匿名函数解绑不了。一次性事件用 `{ once: true }`；滚动、触摸等高频事件用 `{ passive: true }` 提升性能。组件卸载时要清理定时器、监听器和请求，避免内存泄漏。",
          "code": "function onClick() { console.log(\"点击一次\"); }\nconst button = document.querySelector(\"#save\");\nbutton.addEventListener(\"click\", onClick, { once: true });\n\nconst controller = new AbortController();\nwindow.addEventListener(\"resize\", () => console.log(\"resize\"), { signal: controller.signal });\ncontroller.abort();",
          "output": "点击一次",
          "tip": "`AbortController` 可以一次性移除同一信号上的多个监听器，适合组件销毁。不要在每个组件里手动记一堆解绑调用。"
        }
      ],
      "points": [
        "`target` 是触发元素，`currentTarget` 是监听元素。",
        "委托用 `closest` 找到目标，再读 `dataset`。",
        "解绑必须传同一个函数引用。"
      ],
      "practice": "给一个动态列表做删除按钮委托：点击任意按钮打印对应 id；再给保存按钮绑定只执行一次的监听器。",
      "source": "Head First JavaScript Programming 2nd · Ch.9；JavaScript 高级程序设计 4th · Ch.17；Secrets of the JavaScript Ninja 2nd · Ch.13"
    },
    {
      "id": "ch15-2",
      "title": "表单、校验与用户输入",
      "minutes": 24,
      "lead": "表单提交先 `preventDefault`，再用 `FormData` 或元素值读取数据。校验要同时做前端提示和后端约束，前端校验只是体验，不是安全边界。",
      "sections": [
        {
          "h": "FormData 与提交事件",
          "p": "`new FormData(form)` 会收集带 `name` 的表单控件；`Object.fromEntries(data)` 可以快速转成普通对象，但同名多选会只保留最后一个。多选、文件要用 `getAll` 或单独处理。提交前检查 `form.checkValidity()`，自定义规则用 `setCustomValidity` 或自己的错误对象。",
          "code": "const form = document.querySelector(\"#signup\");\nform.addEventListener(\"submit\", (event) => {\n  event.preventDefault();\n  const data = new FormData(form);\n  console.log(Object.fromEntries(data));\n});",
          "output": "{ name: 'Ada', email: 'ada@example.com' }",
          "tip": "`FormData` 只收集有 `name` 的控件；禁用的控件不会提交。文件字段拿到的是 `File`，不是路径字符串。"
        },
        {
          "h": "输入值都是字符串",
          "p": "`input.value` 永远是字符串，数字要显式转换并检查 `Number.isFinite`。复选框用 `checked`，多选用 `selectedOptions`。输入事件 `input` 在每次键入时触发，`change` 在失焦或确认后触发；搜索建议通常用 `input` 加防抖。",
          "code": "const ageInput = document.querySelector(\"#age\");\nconst age = Number(ageInput.value);\nif (!Number.isFinite(age) || age < 0) {\n  console.log(\"年龄必须是非负数字\");\n} else {\n  console.log(\"年龄\", age);\n}\n\nconst agree = document.querySelector(\"#agree\");\nconsole.log(agree.checked);",
          "output": "年龄 18\ntrue",
          "tip": "`parseInt(\"12px\")` 会得到 12，`Number(\"12px\")` 得到 `NaN`。需要严格校验时用 `Number`，不要用 `parseInt` 容忍脏输入。"
        }
      ],
      "points": [
        "提交前 `preventDefault`，用 `FormData` 读取。",
        "前端校验不是安全边界。",
        "输入值都是字符串，数字要显式转换。"
      ],
      "practice": "写一个注册表单提交处理：读取姓名、邮箱、年龄，年龄非法时显示错误，合法时打印整理后的对象。",
      "source": "Head First JavaScript Programming 2nd · Ch.7；JavaScript 高级程序设计 4th · Ch.19；JavaScript 权威指南 7th · Ch.15"
    },
    {
      "id": "ch15-3",
      "title": "键盘、指针、拖拽与事件性能",
      "minutes": 32,
      "lead": "现代浏览器把鼠标、触摸和手写笔统一到 Pointer Events。键盘事件则要区分 `key` 与 `code`；拖拽和滚动监听如果不加节流，很容易把主线程拖慢。",
      "sections": [
        {
          "h": "keydown、keyup 与 key/code",
          "p": "`event.key` 是字符值（\"a\"、\"Enter\"），受键盘布局和 Shift 影响；`event.code` 是物理键位（\"KeyA\"、\"Enter\"），适合游戏快捷键。输入框内容用 `input` 事件监听，不要只靠 keydown。\n\n`keypress` 已不推荐；组合键检查 `ctrlKey/metaKey/altKey/shiftKey`。",
          "code": "document.addEventListener(\"keydown\", e => {\n  if ((e.metaKey || e.ctrlKey) && e.key === \"k\") {\n    e.preventDefault();\n    console.log(\"open command palette\");\n  }\n});",
          "output": "按下 Cmd/Ctrl+K：open command palette",
          "tip": "字符用 key，物理键位用 code；组合键检查修饰键。"
        },
        {
          "h": "Pointer Events 与拖拽",
          "p": "Pointer Events 统一鼠标、触摸、笔：`pointerdown/move/up`，配合 `setPointerCapture` 让指针移出元素后仍能收到事件。拖拽时用 transform 更新位置，避免频繁改 left/top。\n\n移动端要处理触摸滚动与拖拽冲突；必要时 `touch-action: none`，但会影响页面滚动。",
          "code": "const handle = document.querySelector(\"#handle\");\nhandle.addEventListener(\"pointerdown\", e => {\n  handle.setPointerCapture(e.pointerId);\n  handle.addEventListener(\"pointermove\", move);\n});\nfunction move(e) {\n  handle.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;\n}",
          "output": "拖动 handle 时跟随指针移动",
          "tip": "setPointerCapture 保证指针移出元素仍收到事件；拖拽用 transform。"
        },
        {
          "h": "滚动、resize 与 passive",
          "p": "scroll 和 resize 触发频繁；不要在每个事件里做重计算。用 `requestAnimationFrame` 合并到下一帧，或节流到固定间隔。`{ passive: true }` 告诉浏览器监听器不会 preventDefault，能改善滚动性能。\n\n不要用 scroll 事件做复杂的 DOM 布局读取；先缓存尺寸，必要时用 IntersectionObserver。",
          "code": "let ticking = false;\nwindow.addEventListener(\"scroll\", () => {\n  if (ticking) return;\n  ticking = true;\n  requestAnimationFrame(() => {\n    console.log(window.scrollY);\n    ticking = false;\n  });\n}, { passive: true });",
          "output": "滚动时每帧最多打印一次 scrollY",
          "tip": "scroll/resize 用 rAF 或节流；不会 preventDefault 时加 passive。"
        }
      ],
      "points": [
        "key 是字符，code 是物理键位。",
        "Pointer Events 统一输入设备，setPointerCapture 保证拖拽连续。",
        "scroll/resize 要合并到帧，passive 改善滚动。"
      ],
      "practice": "写一个可拖拽卡片，要求鼠标和触摸都能拖，指针移出卡片仍能继续；再给滚动监听加 rAF 合并，比较回调次数。",
      "source": "JavaScript 高级程序设计 4th · Ch.17–18；JavaScript 权威指南 7th · Ch.15；Secrets of the JavaScript Ninja 2nd · Ch.13"
    }
  ]
});

/* --- js-ch16.js --- */

window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch16",
  "part": 4,
  "number": "16",
  "title": "浏览器存储与网络",
  "summary": "页面状态要存在哪里：内存、localStorage、IndexedDB、Cookie 还是 Cache？网络请求又该如何处理跨域、超时和取消？本章把「存」和「取」两条链路拆开。",
  "goals": [
    "按生命周期和容量选择存储",
    "知道 Cookie 与 localStorage 的安全边界",
    "用 IndexedDB 存结构化数据",
    "用 fetch + AbortController 控制请求"
  ],
  "source": "JavaScript 高级程序设计 4th · Ch.24–25；JavaScript 权威指南 7th · Ch.15；Learning JavaScript 3rd · Ch.10；Eloquent JavaScript 4th · Ch.11",
  "lessons": [
    {
      "id": "ch16-1",
      "title": "localStorage 与页面状态",
      "minutes": 22,
      "lead": "localStorage 只能存字符串，容量有限，且同步阻塞。它适合保存主题、草稿、上次位置这类轻量状态，不适合存大列表和敏感信息。",
      "sections": [
        {
          "h": "读写要包在 try/catch 里",
          "p": "隐私模式、存储配额、被禁用都可能让 `localStorage` 抛错。读取时用 `getItem` 返回 `null` 判断是否存在；写入对象前 `JSON.stringify`，读取后 `JSON.parse` 也要处理损坏数据。删除用 `removeItem`，清空用 `clear`，但 `clear` 会清掉同源所有键。",
          "code": "try {\n  localStorage.setItem(\"theme\", \"dark\");\n  console.log(localStorage.getItem(\"theme\"));\n  const state = JSON.parse(localStorage.getItem(\"state\") || \"{}\");\n  console.log(state.count ?? 0);\n  localStorage.removeItem(\"theme\");\n} catch (err) {\n  console.warn(\"localStorage 不可用\", err.name);\n}",
          "output": "dark\n0",
          "tip": "不要存 token、密码、身份证等敏感信息。需要跨标签同步时监听 `storage` 事件；它只在其他标签页触发，当前页不会收到。"
        },
        {
          "h": "版本化你的存储键",
          "p": "数据结构会变，旧版本数据可能让新代码崩溃。键名带版本，例如 `app.state.v2`；读取时校验字段，迁移失败就回退默认值并清理旧键。写入不要太频繁，输入框每敲一个字就 `JSON.stringify` 整个大对象会卡。",
          "code": "const KEY = \"jsDemo.state.v1\";\nfunction saveState(state) {\n  localStorage.setItem(KEY, JSON.stringify(state));\n}\nfunction loadState() {\n  try {\n    const raw = JSON.parse(localStorage.getItem(KEY) || \"null\");\n    return raw && typeof raw === \"object\" ? raw : {};\n  } catch (err) {\n    localStorage.removeItem(KEY);\n    return {};\n  }\n}\nsaveState({ page: 2 });\nconsole.log(loadState());",
          "output": "{ page: 2 }",
          "tip": "写入前先做防抖；读取失败要能回退默认状态。永远不要假设 localStorage 里的数据一定合法。"
        }
      ],
      "points": [
        "localStorage 只存字符串，读写都可能抛错。",
        "存对象要 `JSON.stringify`，读后校验结构。",
        "键名带版本，敏感信息不要存。"
      ],
      "practice": "实现 `saveState` / `loadState`，保存 `{ theme, page }`；手动把存储值改成非法 JSON，验证读取后能清理并回退默认对象。",
      "source": "JavaScript 高级程序设计 4th · Ch.25；JavaScript 权威指南 7th · Ch.15；Head First JavaScript Programming 2nd · Ch.9"
    },
    {
      "id": "ch16-2",
      "title": "Cookie、IndexedDB 与缓存策略",
      "minutes": 33,
      "lead": "localStorage 简单但同步、容量小、只能存字符串；IndexedDB 异步、容量大、能存结构化数据；Cookie 会自动随请求发送，适合会话标识，不适合存大量数据。",
      "sections": [
        {
          "h": "Cookie 与 localStorage 的边界",
          "p": "Cookie 有域名、路径、过期时间、SameSite 和 HttpOnly 等属性；HttpOnly 的 Cookie 前端读不到，适合会话。localStorage 不会自动发送，容易被 XSS 读取，不适合存 token 或敏感信息。\n\n容量不是唯一标准：安全、同步阻塞、跨域携带都要一起考虑。",
          "code": "document.cookie = \"theme=dark; path=/; max-age=31536000; SameSite=Lax\";\nlocalStorage.setItem(\"theme\", \"dark\");\nconsole.log(document.cookie);\nconsole.log(localStorage.getItem(\"theme\"));",
          "output": "theme=dark\n主题值 dark",
          "tip": "会话标识用 HttpOnly Cookie；localStorage 不要存敏感 token。"
        },
        {
          "h": "IndexedDB 的异步模型",
          "p": "IndexedDB 用事务和对象仓库存数据，所有操作异步。打开数据库、创建对象仓库、读写都在 `onsuccess/onerror` 或 Promise 包装里完成。\n\n它适合大量结构化数据和离线缓存；简单键值对用 localStorage 更轻，别为了「高级」上 IndexedDB。",
          "code": "const req = indexedDB.open(\"app\", 1);\nreq.onupgradeneeded = () => {\n  req.result.createObjectStore(\"notes\", { keyPath: \"id\" });\n};\nreq.onsuccess = () => {\n  const db = req.result;\n  const tx = db.transaction(\"notes\", \"readwrite\");\n  tx.objectStore(\"notes\").put({ id: 1, text: \"hello\" });\n};",
          "output": "数据库 app 创建 notes 仓库\n写入 id=1 的记录",
          "tip": "IndexedDB 异步、事务式；简单数据不要过度设计。"
        },
        {
          "h": "Cache API 与缓存策略",
          "p": "Cache API 存 Request/Response，适合离线资源和 Service Worker。常见策略：缓存优先、网络优先、 stale-while-revalidate。缓存要设版本和清理，避免旧资源永远命中。\n\n不要缓存带用户隐私的响应；跨域响应需要 CORS 允许。",
          "code": "const cache = await caches.open(\"v1\");\nawait cache.add(\"/app.css\");\nconst hit = await cache.match(\"/app.css\");\nconsole.log(!!hit);",
          "output": "true",
          "tip": "Cache API 存响应，不存任意对象；要有版本和清理策略。"
        }
      ],
      "points": [
        "Cookie 自动随请求发送，HttpOnly 适合会话。",
        "localStorage 同步且可被 XSS 读取，不存敏感数据。",
        "IndexedDB 异步大容量；Cache API 存响应。"
      ],
      "practice": "做一个「离线笔记」原型：主题偏好放 localStorage，笔记正文放 IndexedDB，静态资源用 Cache API；分别测试刷新、断网和版本升级。",
      "source": "JavaScript 高级程序设计 4th · Ch.25；JavaScript 权威指南 7th · Ch.15；Learning JavaScript 3rd · Ch.10"
    },
    {
      "id": "ch16-3",
      "title": "fetch、CORS 与 AbortController",
      "minutes": 33,
      "lead": "`fetch` 只在网络层失败时 reject；HTTP 404/500 仍然 resolve。跨域请求受 CORS 约束，预检、凭据和响应头都要服务端配合。取消请求用 AbortController，不要靠布尔标志。",
      "sections": [
        {
          "h": "fetch 的状态码与错误",
          "p": "`fetch` 返回的 Promise 在收到响应头时 resolve，即使状态是 404。必须检查 `response.ok` 或 `status`；只有网络错误、DNS、CORS 失败等才 reject。\n\n解析响应前先看 `content-type`；JSON 用 `response.json()`，文本用 `text()`，流式用 `body`。",
          "code": "const res = await fetch(\"/api/user\");\nif (!res.ok) throw new Error(`HTTP ${res.status}`);\nconst type = res.headers.get(\"content-type\");\nconst data = type?.includes(\"application/json\") ? await res.json() : await res.text();\nconsole.log(data);",
          "output": "200：用户 JSON\n404：抛出 HTTP 404",
          "tip": "fetch 不会因 404 reject；必须检查 response.ok。"
        },
        {
          "h": "CORS 与凭据",
          "p": "跨域请求默认不带 Cookie；需要 `credentials: \"include\"`，同时服务端必须返回明确的 `Access-Control-Allow-Origin`（不能是 *）和 `Access-Control-Allow-Credentials: true`。\n\n非简单请求会先发 OPTIONS 预检；自定义头、PUT/DELETE 等都可能触发。CORS 是浏览器安全策略，不是服务端认证。",
          "code": "const res = await fetch(\"https://api.example.com/me\", {\n  credentials: \"include\",\n  headers: { \"Content-Type\": \"application/json\" }\n});\nconsole.log(res.status);",
          "output": "200（服务端允许 origin 且带凭据）\n或 CORS 错误（配置不匹配）",
          "tip": "带 Cookie 跨域需要 credentials 和服务端精确 Allow-Origin；不要用 *。"
        },
        {
          "h": "AbortController 与超时",
          "p": "`AbortController.signal` 传给 fetch；调用 `abort()` 会让请求以 AbortError 拒绝。超时可以用 `AbortSignal.timeout(ms)` 或手动 setTimeout。\n\n取消后要清理定时器和 loading 状态；不要把 AbortError 当成业务错误提示给用户。",
          "code": "const controller = new AbortController();\nconst timer = setTimeout(() => controller.abort(), 3000);\ntry {\n  const res = await fetch(\"/api/slow\", { signal: controller.signal });\n  console.log(await res.json());\n} catch (e) {\n  if (e.name === \"AbortError\") console.log(\"已取消/超时\");\n} finally { clearTimeout(timer); }",
          "output": "成功：JSON\n超时：已取消/超时",
          "tip": "取消请求用 AbortController；AbortError 要和业务失败分开。"
        }
      ],
      "points": [
        "fetch 对 404/500 仍 resolve，要检查 response.ok。",
        "跨域带凭据需要 credentials 和精确 CORS 头。",
        "取消用 AbortController，清理定时器和 loading。"
      ],
      "practice": "写一个 `fetchJSON(url, { timeout, signal })`，统一处理状态码、content-type、超时和取消；再用 AbortController 取消一个慢请求，确认不会更新已卸载的页面。",
      "source": "JavaScript 高级程序设计 4th · Ch.24；JavaScript 权威指南 7th · Ch.15；Learning JavaScript 3rd · Ch.10"
    }
  ]
});

/* --- js-ch17.js --- */

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

/* --- js-ch18.js --- */

window.JS_COURSE_CHAPTERS = window.JS_COURSE_CHAPTERS || [];
window.JS_COURSE_CHAPTERS.push({
  "id": "ch18",
  "part": 5,
  "number": "18",
  "title": "工程化、测试与综合项目",
  "summary": "最后一章把语言能力装进工程：ESM 和 npm 负责组织，测试负责回归，设计模式负责拆职责，综合项目负责把所有片段连成可运行的闭环。",
  "goals": [
    "用 ESM/npm 组织多文件项目",
    "写可重复运行的单元测试",
    "用模块、观察者和状态管理拆分 UI",
    "完成一个离线可用的任务看板"
  ],
  "source": "Head First JavaScript Programming 2nd · Ch.12、Appendix；JavaScript 高级程序设计 4th · Ch.26、28；JavaScript 权威指南 7th · Ch.10、17；Learning JavaScript Design Patterns · Ch.9–12",
  "lessons": [
    {
      "id": "ch18-1",
      "title": "ESM、npm 与构建入口",
      "minutes": 22,
      "lead": "模块把代码拆成有边界的文件：每个文件有自己的作用域，通过 `export` 暴露能力，通过 `import` 声明依赖。",
      "sections": [
        {
          "h": "具名导出与默认导出",
          "p": "`export function add(){}` 是具名导出，导入时必须用同名或 `as` 重命名；`export default` 每个模块只能有一个，导入时可以任意命名。浏览器里用 `<script type=\"module\">`，路径必须写扩展名或用导入映射。ESM 默认严格模式，顶层 `this` 是 `undefined`。",
          "code": "// math.js\nexport function add(a, b) { return a + b; }\nexport const PI = 3.14159;\n\n// main.js\nimport { add, PI as pi } from \"./math.js\";\nconsole.log(add(2, 3), pi);",
          "output": "5 3.14159",
          "tip": "具名导出更适合工具函数和常量，默认导出适合“一个模块一个主功能”。混用会让导入风格不统一，团队里最好约定一种。"
        },
        {
          "h": "package.json 与构建工具的职责",
          "p": "`package.json` 记录项目元信息、脚本和依赖；`\"type\": \"module\"` 让 Node 默认按 ESM 解析 `.js`。`npm install` 装依赖，`npm run build` 调构建。浏览器不直接认识 npm 包路径，需要打包器解析，或使用支持裸模块导入的导入映射。构建不是必需，但生产项目通常需要压缩、拆分和兼容处理。",
          "code": "// package.json（节选）\n{\n  \"name\": \"js-demo\",\n  \"type\": \"module\",\n  \"scripts\": {\n    \"dev\": \"vite\",\n    \"build\": \"vite build\"\n  }\n}",
          "output": "npm run dev → 本地开发服务器\nnpm run build → 生产构建",
          "tip": "不要提交 `node_modules`；锁文件 `package-lock.json` 要提交，保证团队和 CI 装到同一组版本。升级依赖后要重新跑构建和测试。"
        }
      ],
      "points": [
        "ESM 每个文件有独立作用域，默认严格模式。",
        "具名导出要对名，默认导出可任意命名。",
        "`package.json` 管脚本和依赖，构建工具负责打包。"
      ],
      "practice": "把课程里的 `add`、`PI` 拆成 `math.js`，在 `main.js` 中具名导入并打印；再把 `package.json` 的 `type` 改成 `module`，观察 Node 运行差异。",
      "source": "JavaScript 高级程序设计 4th · Ch.26、28；JavaScript 权威指南 7th · Ch.10、17；Learning JavaScript 3rd · Ch.2"
    },
    {
      "id": "ch18-2",
      "title": "单元测试、调试与性能",
      "minutes": 33,
      "lead": "测试不是「证明程序没错」，而是把预期写成可重复运行的检查。先测纯函数和边界，再测 DOM 交互；调试时先复现，再缩小范围，不要一边猜一边改。",
      "sections": [
        {
          "h": "测试金字塔与断言",
          "p": "单元测试覆盖纯函数和模块边界，集成测试覆盖多个模块协作，端到端测试覆盖真实浏览器流程。金字塔不是比例教条，而是提醒：底层测试要快、稳、可定位。\n\n断言要具体到值和类型，不要只断言「truthy」；失败信息要包含输入、期望和实际。",
          "code": "function add(a, b) { return a + b; }\nfunction expect(actual) {\n  return { toBe(expected) { if (!Object.is(actual, expected)) throw new Error(`expected ${expected}, got ${actual}`); } };\n}\nexpect(add(2, 3)).toBe(5);\nexpect(add(0.1, 0.2)).toBe(0.30000000000000004);",
          "output": "第一条通过\n第二条通过（浮点精度原样比较）",
          "tip": "断言要包含期望和实际；浮点金额不要直接相等比较。"
        },
        {
          "h": "测试边界与异步",
          "p": "边界比正常路径更容易出 bug：空数组、null、重复值、超长字符串、超时、取消、拒绝。异步测试要 await 真正完成，不要用固定 sleep 猜时间。\n\n测试之间要隔离：清 localStorage、重置模块状态、避免共享可变对象；否则测试顺序会互相污染。",
          "code": "async function load(ok) {\n  if (!ok) throw new Error(\"failed\");\n  return [1, 2];\n}\ntest(\"load ok\", async () => {\n  await expect(load(true)).resolves.toEqual([1, 2]);\n});\ntest(\"load fail\", async () => {\n  await expect(load(false)).rejects.toThrow(\"failed\");\n});",
          "output": "load ok：通过\nload fail：通过（拒绝被捕获）",
          "tip": "异步测试要 await；不要用 sleep 猜；测试间要清理状态。"
        },
        {
          "h": "性能测量与优化顺序",
          "p": "先用 Performance 面板/`performance.now()` 建立基线，再定位瓶颈，最后只改一个变量验证。不要凭感觉优化，也不要在没有测量前引入缓存和复杂度。\n\n前端性能优先看长任务、布局抖动、网络瀑布和资源体积；优化后要复测，并记录环境与数据规模。",
          "code": "const t0 = performance.now();\nfor (let i = 0; i < 1e5; i += 1) Math.sqrt(i);\nconst t1 = performance.now();\nconsole.log((t1 - t0).toFixed(2), \"ms\");",
          "output": "约 2–10 ms（取决于机器）\n只作为基线，不是绝对标准",
          "tip": "先测量再优化；一次只改一个变量；记录环境和数据规模。"
        }
      ],
      "points": [
        "测试覆盖纯函数、边界和异步失败路径。",
        "断言要具体，测试之间要隔离。",
        "先建立性能基线，再优化并复测。"
      ],
      "practice": "给 `groupBy`、`parseAge` 和一个异步 `load` 写测试，覆盖空数组、非法输入、拒绝路径；再用 `performance.now()` 给一个 10 万次循环建立基线。",
      "source": "JavaScript 权威指南 7th · Ch.17；JavaScript 高级程序设计 4th · Ch.28；Secrets of the JavaScript Ninja 2nd · Appendix B"
    },
    {
      "id": "ch18-3",
      "title": "设计模式：模块、观察者与状态管理",
      "minutes": 34,
      "lead": "设计模式不是「必须套用的模板」，而是对反复出现的问题的命名。前端最常用的三类：模块封装依赖，观察者解耦事件，集中式 store 管理共享状态。",
      "sections": [
        {
          "h": "模块模式与依赖注入",
          "p": "模块模式用闭包隐藏内部状态，只暴露必要 API；依赖注入把外部依赖作为参数传入，便于替换和测试。两者常一起用：模块内部不直接 new 全局单例，而是接收 logger/cache。\n\n模块的边界应按「变化频率」切分，而不是按文件行数切分。",
          "code": "function createUserService({ api, logger }) {\n  return {\n    async get(id) {\n      logger.info(`get ${id}`);\n      return api.get(`/users/${id}`);\n    }\n  };\n}\nconst service = createUserService({ api: { get: async () => ({ id: 1 }) }, logger: { info: console.log } });\nservice.get(1).then(console.log);",
          "output": "get 1\n{ id: 1 }",
          "tip": "依赖显式传入，模块不抓全局；按变化频率切边界。"
        },
        {
          "h": "观察者/发布订阅",
          "p": "观察者模式让发布者和订阅者互不直接依赖：发布者只负责 emit，订阅者注册回调。适合事件总线、组件通信和跨模块通知；但事件多了会难追踪，必须有命名空间和取消订阅。\n\n不要在事件里做重计算；先收事件，再批处理。",
          "code": "function createBus() {\n  const map = new Map();\n  return {\n    on(type, fn) { (map.get(type) || map.set(type, []).get(type)).push(fn); return () => this.off(type, fn); },\n    off(type, fn) { const arr = map.get(type) || []; map.set(type, arr.filter(x => x !== fn)); },\n    emit(type, payload) { (map.get(type) || []).forEach(fn => fn(payload)); }\n  };\n}\nconst bus = createBus();\nconst off = bus.on(\"save\", x => console.log(x));\nbus.emit(\"save\", { id: 1 });\noff();",
          "output": "{ id: 1 }",
          "tip": "事件总线要有命名空间和取消订阅；事件回调不要做重计算。"
        },
        {
          "h": "集中式状态与不可变更新",
          "p": "集中式 store 把共享状态放在一处，通过 action/reducer 或 setState 更新，视图订阅变化。关键是单向数据流和不可变更新，避免任何地方都能随手改状态。\n\n不要把所有状态都塞进全局 store；组件局部状态留在组件内，跨组件共享才提升。",
          "code": "function createStore(initial) {\n  let state = initial;\n  const listeners = new Set();\n  return {\n    getState: () => state,\n    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },\n    update(next) { state = { ...state, ...next }; listeners.forEach(fn => fn(state)); }\n  };\n}\nconst store = createStore({ count: 0 });\nstore.subscribe(s => console.log(s));\nstore.update({ count: 1 });",
          "output": "{ count: 1 }",
          "tip": "单向数据流 + 不可变更新；局部状态不要全局化。"
        }
      ],
      "points": [
        "模块模式封装依赖，依赖注入便于测试。",
        "观察者解耦发布/订阅，但要有命名空间和取消订阅。",
        "集中式 store 管共享状态，局部状态留在组件。"
      ],
      "practice": "用模块 + 观察者 + store 重写一个购物车：商品列表、添加、删除、总价；要求依赖可替换，事件可取消，状态不可变更新。",
      "source": "Learning JavaScript Design Patterns · Ch.9–12；JavaScript 权威指南 7th · Ch.10；JavaScript 高级程序设计 4th · Ch.26"
    },
    {
      "id": "ch18-4",
      "title": "综合项目：离线任务看板",
      "minutes": 38,
      "lead": "把前面所有能力串起来：ESM 拆模块，DOM 渲染列表，事件委托处理操作，localStorage/IndexedDB 持久化，Promise 处理异步，测试保证回归。项目不求大，但每条链路要真实跑通。",
      "sections": [
        {
          "h": "需求与数据模型",
          "p": "任务看板最小模型：`{ id, title, status, createdAt }`，status 为 todo/doing/done。筛选、排序、搜索都是派生状态，不写回源数据。\n\n先写数据模型和操作函数，再接 UI；否则 DOM 结构会反过来绑死业务。",
          "code": "const initial = [\n  { id: \"t1\", title: \"读书单\", status: \"todo\", createdAt: 1 },\n  { id: \"t2\", title: \"写练习\", status: \"doing\", createdAt: 2 }\n];\nconst byStatus = (tasks, status) => tasks.filter(t => t.status === status);\nconsole.log(byStatus(initial, \"todo\"));",
          "output": "[ { id: \"t1\", title: \"读书单\", status: \"todo\", createdAt: 1 } ]",
          "tip": "先定数据模型和纯函数，再接 DOM；筛选是派生状态。"
        },
        {
          "h": "渲染、事件与持久化",
          "p": "渲染用模板/片段，事件用委托绑定在列表容器上；新增/删除/切换状态都通过操作函数产生新数组，再 `render`。持久化只存必要字段，读取时校验版本。\n\n异步保存不要阻塞 UI；失败要提示并保留内存状态，下一次重试。",
          "code": "const KEY = \"tasks:v1\";\nfunction save(tasks) {\n  localStorage.setItem(KEY, JSON.stringify({ version: 1, tasks }));\n}\nfunction load() {\n  try {\n    const raw = JSON.parse(localStorage.getItem(KEY));\n    return raw && raw.version === 1 ? raw.tasks : [];\n  } catch { return []; }\n}\nconsole.log(load());",
          "output": "[] 或上次保存的任务数组",
          "tip": "只存必要字段；读取校验版本；保存失败保留内存状态。"
        },
        {
          "h": "测试、空状态与验收",
          "p": "验收至少覆盖：新增空标题、删除最后一项、切换状态、刷新后恢复、损坏存储、超长标题、快速连点。空状态要有明确文案，不要显示空白列表。\n\n性能验收看列表 100 项时输入是否卡顿、滚动是否抖动；可访问性验收看 Tab 顺序、按钮语义和焦点可见。",
          "code": "function addTask(tasks, title) {\n  if (!title.trim()) throw new Error(\"title required\");\n  return [...tasks, { id: crypto.randomUUID(), title: title.trim(), status: \"todo\", createdAt: Date.now() }];\n}\ntry { addTask([], \"   \"); } catch (e) { console.log(e.message); }",
          "output": "title required",
          "tip": "验收覆盖空值、最后一项、刷新、损坏存储和快速连点。"
        }
      ],
      "points": [
        "先定数据模型和纯函数，再接 UI。",
        "事件委托 + 不可变更新 + 版本化持久化。",
        "验收覆盖空状态、异常存储、性能和可访问性。"
      ],
      "practice": "完成一个离线任务看板：新增、删除、切换状态、筛选、搜索、刷新恢复；写 5 条单元测试和 1 条手工验收清单，记录实际结果。",
      "source": "Head First JavaScript Programming 2nd · Ch.8、12；JavaScript 高级程序设计 4th · Ch.14、17、26；Eloquent JavaScript 4th · Ch.19"
    }
  ]
});

/* --- js-capstones.js --- */

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

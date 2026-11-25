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

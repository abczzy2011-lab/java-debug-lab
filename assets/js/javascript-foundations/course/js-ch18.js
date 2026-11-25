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

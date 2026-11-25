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

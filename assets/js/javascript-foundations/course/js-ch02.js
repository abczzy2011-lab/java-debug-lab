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

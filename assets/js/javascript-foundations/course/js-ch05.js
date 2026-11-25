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

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

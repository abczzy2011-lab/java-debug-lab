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

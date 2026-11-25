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

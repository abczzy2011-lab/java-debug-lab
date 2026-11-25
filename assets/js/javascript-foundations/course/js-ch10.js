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

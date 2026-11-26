/* JavaScript 改错题库 · 42 题 */
window.JS_DEBUG_TASKS = [
  {
    "id": "b1",
    "level": "basic",
    "title": "偶数求和",
    "minutes": 6,
    "summary": "循环里的奇偶判断写反了，导致该加的偶数没加、不该加的奇数全加了。",
    "prompt": "实现 `solve(nums)`：返回数组中所有偶数的和。空数组返回 0。不要修改原数组。",
    "source": "Head First JavaScript Programming 2nd · Ch.4；JavaScript 权威指南 7th · Ch.7",
    "bug": "判断条件写成了 `n % 2 === 1`，把奇数当成了偶数。",
    "code": "function solve(nums) {\n  let total = 0;\n  for (const n of nums) {\n    if (n % 2 === 1) total += n;\n  }\n  return total;\n}",
    "tests": [
      {
        "args": [
          [
            1,
            2,
            3,
            4
          ]
        ],
        "expected": 6,
        "public": true,
        "label": "混合奇偶"
      },
      {
        "args": [
          [
            2,
            4,
            6
          ]
        ],
        "expected": 12,
        "public": true,
        "label": "全是偶数"
      },
      {
        "args": [
          []
        ],
        "expected": 0,
        "public": false,
        "label": "空数组"
      }
    ],
    "hints": [
      "先问自己：`n % 2` 的结果 0 代表偶数还是奇数？",
      "把条件改成 `n % 2 === 0`，再用空数组验证初始值。"
    ],
    "analysis": "`n % 2 === 1` 在正数上是奇数，但负数余数可能是 -1。判断偶数最稳的是 `n % 2 === 0`。初始值 0 对空数组天然安全。",
    "fixed": "function solve(nums) {\n  let total = 0;\n  for (const n of nums) {\n    if (n % 2 === 0) total += n;\n  }\n  return total;\n}",
    "order": 1
  },
  {
    "id": "b2",
    "level": "basic",
    "title": "元音计数",
    "minutes": 7,
    "summary": "大小写没有统一，Hello 里的大写 E 被漏掉了。",
    "prompt": "实现 `solve(text)`：统计字符串中英文字母 a/e/i/o/u 的出现次数，大小写都算。非字母字符忽略。",
    "source": "JavaScript for Kids · Ch.4；Head First JavaScript Programming 2nd · Ch.4",
    "bug": "只匹配了小写元音，没有把字符统一转成小写。",
    "code": "function solve(text) {\n  return text.split(\"\").filter(ch => \"aeiou\".includes(ch)).length;\n}",
    "tests": [
      {
        "args": [
          "Hello"
        ],
        "expected": 2,
        "public": true,
        "label": "大小写混合"
      },
      {
        "args": [
          "XYZ"
        ],
        "expected": 0,
        "public": true,
        "label": "没有元音"
      },
      {
        "args": [
          "AEIOU"
        ],
        "expected": 5,
        "public": false,
        "label": "全大写"
      }
    ],
    "hints": [
      "先把每个字符转成小写，再判断是否在 `aeiou` 里。",
      "`filter` 的回调要返回布尔值，`includes` 本身就返回布尔值。"
    ],
    "analysis": "大小写是两套码点，`includes` 不会自动忽略大小写。用 `ch.toLowerCase()` 统一后再判断；不要用正则的 `i` 标志之前先想清楚是否需要保留原字符。",
    "fixed": "function solve(text) {\n  return text.split(\"\").filter(ch => \"aeiou\".includes(ch.toLowerCase())).length;\n}",
    "order": 2
  },
  {
    "id": "b3",
    "level": "basic",
    "title": "反转单词",
    "minutes": 6,
    "summary": "单词顺序反了，但 join 时忘了空格，整句话被粘成一串。",
    "prompt": "实现 `solve(text)`：按空格拆分单词，反转顺序后用单个空格重新连接。空字符串返回空字符串。",
    "source": "Eloquent JavaScript 4th · Ch.5；JavaScript 权威指南 7th · Ch.7",
    "bug": "`join(\"\")` 把单词直接粘在一起，没有分隔符。",
    "code": "function solve(text) {\n  return text.split(\" \").reverse().join(\"\");\n}",
    "tests": [
      {
        "args": [
          "one two three"
        ],
        "expected": "three two one",
        "public": true,
        "label": "三个单词"
      },
      {
        "args": [
          "a b"
        ],
        "expected": "b a",
        "public": true,
        "label": "两个单词"
      },
      {
        "args": [
          ""
        ],
        "expected": "",
        "public": false,
        "label": "空字符串"
      }
    ],
    "hints": [
      "`split` 和 `join` 的分隔符要对称。",
      "空字符串 split 后是 `[\"\"]`，join 空格仍然是空字符串。"
    ],
    "analysis": "`join` 的参数是分隔符，不是「是否加空格」的布尔值。拆分用 `\" \"`，连接也要用 `\" \"`；如果输入可能有连续空格，先 `trim` 再按 `/\\s+/` 拆分。",
    "fixed": "function solve(text) {\n  const words = text.trim().split(/\\s+/).filter(Boolean);\n  return words.reverse().join(\" \");\n}",
    "order": 3
  },
  {
    "id": "b4",
    "level": "basic",
    "title": "找最大值",
    "minutes": 7,
    "summary": "初始值设成 0，全负数数组会错误返回 0；空数组也没有处理。",
    "prompt": "实现 `solve(nums)`：返回数组中的最大值。空数组返回 `null`。数组元素都是数字。",
    "source": "Head First JavaScript Programming 2nd · Ch.4；Secrets of the JavaScript Ninja 2nd · Ch.2",
    "bug": "`max` 从 0 开始，负数永远比 0 小；空数组也返回 0。",
    "code": "function solve(nums) {\n  let max = 0;\n  for (const n of nums) {\n    if (n > max) max = n;\n  }\n  return max;\n}",
    "tests": [
      {
        "args": [
          [
            3,
            9,
            4
          ]
        ],
        "expected": 9,
        "public": true,
        "label": "普通数组"
      },
      {
        "args": [
          [
            -5,
            -2,
            -9
          ]
        ],
        "expected": -2,
        "public": true,
        "label": "全是负数"
      },
      {
        "args": [
          []
        ],
        "expected": null,
        "public": false,
        "label": "空数组"
      }
    ],
    "hints": [
      "空数组要有单独的返回分支。",
      "最大值初始值可以用 `-Infinity`，或者用第一个元素。"
    ],
    "analysis": "用 0 当最大值初始值隐含「数组里一定有非负数」的假设。更稳的写法是先处理空数组，再用 `-Infinity` 或 `nums[0]` 初始化。",
    "fixed": "function solve(nums) {\n  if (nums.length === 0) return null;\n  let max = -Infinity;\n  for (const n of nums) {\n    if (n > max) max = n;\n  }\n  return max;\n}",
    "order": 4
  },
  {
    "id": "b5",
    "level": "basic",
    "title": "保持顺序去重",
    "minutes": 7,
    "summary": "用 Set 去重后顺手 sort，把原本的首次出现顺序打乱了。",
    "prompt": "实现 `solve(items)`：去掉重复元素，保留每个值第一次出现的顺序。数组元素是字符串或数字。",
    "source": "JavaScript 权威指南 7th · Ch.11；JavaScript 高级程序设计 4th · Ch.6",
    "bug": "`sort()` 按字符串顺序重排，破坏了「首次出现顺序」。",
    "code": "function solve(items) {\n  return [...new Set(items)].sort();\n}",
    "tests": [
      {
        "args": [
          [
            3,
            1,
            3,
            2
          ]
        ],
        "expected": [
          3,
          1,
          2
        ],
        "public": true,
        "label": "数字去重"
      },
      {
        "args": [
          [
            "b",
            "a",
            "b"
          ]
        ],
        "expected": [
          "b",
          "a"
        ],
        "public": true,
        "label": "字符串去重"
      },
      {
        "args": [
          []
        ],
        "expected": [],
        "public": false,
        "label": "空数组"
      }
    ],
    "hints": [
      "Set 本身就会保留插入顺序。",
      "去掉 `sort()`，直接展开 Set 即可。"
    ],
    "analysis": "`new Set()` 按插入顺序迭代，展开后天然保持首次出现顺序。`sort()` 默认按字符串比较，既改变顺序，也会让 10 排在 2 前面。",
    "fixed": "function solve(items) {\n  return [...new Set(items)];\n}",
    "order": 5
  },
  {
    "id": "b6",
    "level": "basic",
    "title": "姓名首字母",
    "minutes": 7,
    "summary": "首字母之间没有加点，也没有处理多余空格。",
    "prompt": "实现 `solve(name)`：把姓名拆成单词，取每个单词首字母大写，用英文句点连接，例如 `Ada Lovelace` → `A.L.`。空字符串返回空字符串。",
    "source": "Head First JavaScript Programming 2nd · Ch.4；JavaScript for Kids · Ch.6",
    "bug": "`join(\"\")` 没有加点；连续空格会产生空单词并导致 `w[0]` 为 undefined。",
    "code": "function solve(name) {\n  return name.split(\" \").map(w => w[0].toUpperCase()).join(\"\");\n}",
    "tests": [
      {
        "args": [
          "Ada Lovelace"
        ],
        "expected": "A.L.",
        "public": true,
        "label": "两个单词"
      },
      {
        "args": [
          "Grace Hopper"
        ],
        "expected": "G.H.",
        "public": true,
        "label": "另一个姓名"
      },
      {
        "args": [
          "Ada"
        ],
        "expected": "A.",
        "public": false,
        "label": "单个单词"
      }
    ],
    "hints": [
      "先用 `trim` 去掉首尾空格，再用 `/\\s+/` 拆分。",
      "每个首字母后面补一个 `.`，最后直接 join 空字符串。"
    ],
    "analysis": "`split(\" \")` 遇到连续空格会产生空字符串，`w[0]` 就是 undefined。先 trim、按空白正则拆分并过滤空项，再映射成 `首字母 + \".\"`。",
    "fixed": "function solve(name) {\n  const words = name.trim().split(/\\s+/).filter(Boolean);\n  if (!words.length) return \"\";\n  return words.map(w => w[0].toUpperCase() + \".\").join(\"\");\n}",
    "order": 6
  },
  {
    "id": "m1",
    "level": "medium",
    "title": "只展开一层",
    "minutes": 9,
    "summary": "题目要求只展开一层，代码却用了 Infinity，把深层嵌套也压平了。",
    "prompt": "实现 `solve(arr)`：只展开一层嵌套数组，深层数组保持原样。例如 `[1,[2,[3]],4]` → `[1,2,[3],4]`。",
    "source": "JavaScript 权威指南 7th · Ch.7；JavaScript 高级程序设计 4th · Ch.6",
    "bug": "`flat(Infinity)` 会递归展开所有层级，超出题目要求。",
    "code": "function solve(arr) {\n  return arr.flat(Infinity);\n}",
    "tests": [
      {
        "args": [
          [
            1,
            [
              2,
              3
            ],
            4
          ]
        ],
        "expected": [
          1,
          2,
          3,
          4
        ],
        "public": true,
        "label": "一层嵌套"
      },
      {
        "args": [
          [
            [
              1,
              [
                2
              ]
            ],
            3
          ]
        ],
        "expected": [
          1,
          [
            2
          ],
          3
        ],
        "public": true,
        "label": "保留深层"
      },
      {
        "args": [
          []
        ],
        "expected": [],
        "public": false,
        "label": "空数组"
      }
    ],
    "hints": [
      "`flat()` 的参数是展开深度，不是布尔值。",
      "只展开一层就传 `1`，或者省略参数。"
    ],
    "analysis": "`flat(depth)` 的默认 depth 是 1；传 Infinity 会一直展开到没有数组为止。题目只要一层，必须显式控制深度，深层结构要保留。",
    "fixed": "function solve(arr) {\n  return arr.flat(1);\n}",
    "order": 1
  },
  {
    "id": "m2",
    "level": "medium",
    "title": "词频排序",
    "minutes": 11,
    "summary": "次数相同的单词没有按字母排序，结果依赖对象插入顺序。",
    "prompt": "实现 `solve(text)`：统计每个单词出现次数（忽略大小写，按空白拆分），返回 `[word, count]` 数组。先按次数从高到低，次数相同按单词字母升序。",
    "source": "Eloquent JavaScript 4th · Ch.5；JavaScript 权威指南 7th · Ch.7",
    "bug": "排序只比较了次数，次数相同时没有比较单词，结果不稳定。",
    "code": "function solve(text) {\n  const counts = {};\n  for (const w of text.toLowerCase().split(/\\s+/).filter(Boolean)) {\n    counts[w] = (counts[w] || 0) + 1;\n  }\n  return Object.entries(counts).sort((a, b) => b[1] - a[1]);\n}",
    "tests": [
      {
        "args": [
          "b a b"
        ],
        "expected": [
          [
            "b",
            2
          ],
          [
            "a",
            1
          ]
        ],
        "public": true,
        "label": "一个高频词"
      },
      {
        "args": [
          "A a"
        ],
        "expected": [
          [
            "a",
            2
          ]
        ],
        "public": true,
        "label": "大小写合并"
      },
      {
        "args": [
          "c b a"
        ],
        "expected": [
          [
            "a",
            1
          ],
          [
            "b",
            1
          ],
          [
            "c",
            1
          ]
        ],
        "public": false,
        "label": "并列时按字母"
      }
    ],
    "hints": [
      "比较器返回 0 时，顺序由实现决定，不能依赖插入顺序。",
      "次数相同就用 `a[0].localeCompare(b[0])`。"
    ],
    "analysis": "多字段排序要在比较器里显式写第二关键字：先比 `b[1]-a[1]`，相等时再比单词。`Object.entries` 的顺序不是排序结果。",
    "fixed": "function solve(text) {\n  const counts = {};\n  for (const w of text.toLowerCase().split(/\\s+/).filter(Boolean)) {\n    counts[w] = (counts[w] || 0) + 1;\n  }\n  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));\n}",
    "order": 2
  },
  {
    "id": "m3",
    "level": "medium",
    "title": "奇偶分组",
    "minutes": 9,
    "summary": "两个桶的名字和推入条件对调了，偶数全进了 odd。",
    "prompt": "实现 `solve(nums)`：返回 `{ even, odd }`，偶数和奇数分别放入对应数组，保持原顺序。负数也按能否被 2 整除判断。",
    "source": "JavaScript 高级程序设计 4th · Ch.6；Head First JavaScript Programming 2nd · Ch.4",
    "bug": "条件 `n % 2 === 0` 时推入了 `odd`，两个桶写反了。",
    "code": "function solve(nums) {\n  const groups = { even: [], odd: [] };\n  for (const n of nums) {\n    if (n % 2 === 0) groups.odd.push(n);\n    else groups.even.push(n);\n  }\n  return groups;\n}",
    "tests": [
      {
        "args": [
          [
            1,
            2,
            3,
            4
          ]
        ],
        "expected": {
          "even": [
            2,
            4
          ],
          "odd": [
            1,
            3
          ]
        },
        "public": true,
        "label": "混合奇偶"
      },
      {
        "args": [
          [
            0,
            -2,
            -3
          ]
        ],
        "expected": {
          "even": [
            0,
            -2
          ],
          "odd": [
            -3
          ]
        },
        "public": true,
        "label": "包含 0 和负数"
      },
      {
        "args": [
          [
            2,
            4
          ]
        ],
        "expected": {
          "even": [
            2,
            4
          ],
          "odd": []
        },
        "public": false,
        "label": "全是偶数"
      }
    ],
    "hints": [
      "`n % 2 === 0` 是偶数分支，应该进 even。",
      "负数 -3 % 2 是 -1，不是 1；用 `=== 0` 判断偶数更稳。"
    ],
    "analysis": "偶数的判定是 `n % 2 === 0`，不要用 `=== 1` 判断奇数，因为负数余数可能是 -1。两个桶的键名要和业务语义一致，别靠位置记忆。",
    "fixed": "function solve(nums) {\n  const groups = { even: [], odd: [] };\n  for (const n of nums) {\n    if (n % 2 === 0) groups.even.push(n);\n    else groups.odd.push(n);\n  }\n  return groups;\n}",
    "order": 3
  },
  {
    "id": "m4",
    "level": "medium",
    "title": "二分查找",
    "minutes": 11,
    "summary": "循环条件写成 `lo < hi`，最后一个元素永远检查不到。",
    "prompt": "实现 `solve(nums, target)`：在升序数组中二分查找 target，返回下标；找不到返回 -1。数组可能有重复值，返回任意一个匹配下标即可，但测试只使用唯一值。",
    "source": "JavaScript 权威指南 7th · Ch.7；Secrets of the JavaScript Ninja 2nd · Ch.2",
    "bug": "`while (lo < hi)` 在只剩一个元素时直接退出，漏掉最后一个候选。",
    "code": "function solve(nums, target) {\n  let lo = 0;\n  let hi = nums.length - 1;\n  while (lo < hi) {\n    const mid = (lo + hi) >> 1;\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}",
    "tests": [
      {
        "args": [
          [
            1,
            3,
            5
          ],
          5
        ],
        "expected": 2,
        "public": true,
        "label": "目标在末尾"
      },
      {
        "args": [
          [
            1
          ],
          1
        ],
        "expected": 0,
        "public": true,
        "label": "单元素"
      },
      {
        "args": [
          [
            1,
            3,
            5,
            7
          ],
          1
        ],
        "expected": 0,
        "public": false,
        "label": "目标在开头"
      }
    ],
    "hints": [
      "闭区间二分的循环条件是 `lo <= hi`。",
      "当 `lo === hi` 时，还需要检查这个唯一候选。"
    ],
    "analysis": "闭区间 `[lo, hi]` 的二分必须用 `lo <= hi`；否则最后一轮只剩一个元素时会跳过。`mid` 用 `(lo+hi)>>1` 在极大数组上可能溢出，工程里可用 `lo + Math.floor((hi-lo)/2)`。",
    "fixed": "function solve(nums, target) {\n  let lo = 0;\n  let hi = nums.length - 1;\n  while (lo <= hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}",
    "order": 4
  },
  {
    "id": "m5",
    "level": "medium",
    "title": "URL Slug",
    "minutes": 9,
    "summary": "只把空白替换成连字符，斜杠、标点和首尾空格都留了下来。",
    "prompt": "实现 `solve(title)`：生成 URL slug。转小写，把任意连续的非字母数字字符替换成单个 `-`，去掉首尾 `-`。例如 `A/B Test` → `a-b-test`。",
    "source": "JavaScript 权威指南 7th · Ch.11；Eloquent JavaScript 4th · Ch.9",
    "bug": "只处理了空白，没有处理标点；也没有 trim，首尾会留下连字符。",
    "code": "function solve(title) {\n  return title.toLowerCase().replace(/\\s+/g, \"-\");\n}",
    "tests": [
      {
        "args": [
          " Hello  World "
        ],
        "expected": "hello-world",
        "public": true,
        "label": "首尾和连续空格"
      },
      {
        "args": [
          "A/B Test"
        ],
        "expected": "a-b-test",
        "public": true,
        "label": "包含标点"
      },
      {
        "args": [
          "  "
        ],
        "expected": "",
        "public": false,
        "label": "只有空白"
      }
    ],
    "hints": [
      "先把所有非 `a-z0-9` 字符替换成 `-`。",
      "连续替换可能产生多个 `-`，用 `+` 合并；最后去掉首尾 `-`。"
    ],
    "analysis": "slug 的核心是「只保留字母数字，其他一律变分隔符」。`[^a-z0-9]+` 一次匹配连续非法字符，避免多个连字符；最后 `replace(/^-+|-+$/g, \"\")` 清首尾。",
    "fixed": "function solve(title) {\n  return title.toLowerCase().replace(/[^a-z0-9]+/g, \"-\").replace(/^-+|-+$/g, \"\");\n}",
    "order": 5
  },
  {
    "id": "m6",
    "level": "medium",
    "title": "订单汇总",
    "minutes": 10,
    "summary": "同一个 id 的多条记录被后一条覆盖，只留下了最后一次金额。",
    "prompt": "实现 `solve(rows)`：每条记录是 `{ id, amount }`，按 id 汇总 amount，返回 `{ id, total }` 数组，按 id 升序。空数组返回空数组。",
    "source": "JavaScript 高级程序设计 4th · Ch.6；Eloquent JavaScript 4th · Ch.5",
    "bug": "`map.set(row.id, row.amount)` 直接覆盖，没有累加。",
    "code": "function solve(rows) {\n  const map = new Map();\n  for (const row of rows) {\n    map.set(row.id, row.amount);\n  }\n  return [...map].map(([id, total]) => ({ id, total })).sort((a, b) => a.id.localeCompare(b.id));\n}",
    "tests": [
      {
        "args": [
          [
            {
              "id": "a",
              "amount": 2
            },
            {
              "id": "b",
              "amount": 1
            },
            {
              "id": "a",
              "amount": 3
            }
          ]
        ],
        "expected": [
          {
            "id": "a",
            "total": 5
          },
          {
            "id": "b",
            "total": 1
          }
        ],
        "public": true,
        "label": "重复 id"
      },
      {
        "args": [
          []
        ],
        "expected": [],
        "public": true,
        "label": "空数组"
      },
      {
        "args": [
          [
            {
              "id": "b",
              "amount": 2
            },
            {
              "id": "b",
              "amount": 4
            },
            {
              "id": "a",
              "amount": 1
            }
          ]
        ],
        "expected": [
          {
            "id": "a",
            "total": 1
          },
          {
            "id": "b",
            "total": 6
          }
        ],
        "public": false,
        "label": "多组重复"
      }
    ],
    "hints": [
      "每次写入前先取出已有值，再加当前 amount。",
      "`Map.get(id) || 0` 可以给不存在的 id 一个 0 起点。"
    ],
    "analysis": "汇总不是赋值。`map.set(id, (map.get(id) || 0) + amount)` 才是累加；排序按 id 升序，输出对象字段名是 `total`。",
    "fixed": "function solve(rows) {\n  const map = new Map();\n  for (const row of rows) {\n    map.set(row.id, (map.get(row.id) || 0) + row.amount);\n  }\n  return [...map].map(([id, total]) => ({ id, total })).sort((a, b) => a.id.localeCompare(b.id));\n}",
    "order": 6
  },
  {
    "id": "h1",
    "level": "hard",
    "title": "LRU 缓存",
    "minutes": 16,
    "summary": "更新已有 key 没有刷新最近使用顺序，get 也没有把命中项移到队尾。",
    "prompt": "实现 `solve(capacity, ops)`：模拟 LRU 缓存。`put` 写入或更新，`get` 读取（不存在返回 -1），容量满时淘汰最久未使用的 key。返回所有 get 的结果。",
    "source": "JavaScript 权威指南 7th · Ch.11；Secrets of the JavaScript Ninja 2nd · Ch.9；Effective JavaScript · Item 44",
    "bug": "更新已有 key 时直接 `set`，Map 不会把它移到末尾；get 命中后也没有刷新顺序。",
    "code": "function solve(capacity, ops) {\n  const cache = new Map();\n  const out = [];\n  for (const [op, key, value] of ops) {\n    if (op === \"put\") {\n      cache.set(key, value);\n      if (cache.size > capacity) cache.delete(cache.keys().next().value);\n    } else {\n      out.push(cache.has(key) ? cache.get(key) : -1);\n    }\n  }\n  return out;\n}",
    "tests": [
      {
        "args": [
          2,
          [
            [
              "put",
              1,
              1
            ],
            [
              "put",
              2,
              2
            ],
            [
              "get",
              1
            ],
            [
              "put",
              3,
              3
            ],
            [
              "get",
              2
            ],
            [
              "get",
              3
            ]
          ]
        ],
        "expected": [
          1,
          -1,
          3
        ],
        "public": true,
        "label": "get 刷新顺序"
      },
      {
        "args": [
          2,
          [
            [
              "put",
              1,
              1
            ],
            [
              "put",
              2,
              2
            ],
            [
              "put",
              1,
              10
            ],
            [
              "put",
              3,
              3
            ],
            [
              "get",
              2
            ],
            [
              "get",
              1
            ]
          ]
        ],
        "expected": [
          -1,
          10
        ],
        "public": true,
        "label": "put 更新已有 key"
      },
      {
        "args": [
          2,
          [
            [
              "put",
              "a",
              1
            ],
            [
              "put",
              "b",
              2
            ],
            [
              "put",
              "a",
              3
            ],
            [
              "get",
              "b"
            ],
            [
              "put",
              "c",
              4
            ],
            [
              "get",
              "a"
            ],
            [
              "get",
              "c"
            ]
          ]
        ],
        "expected": [
          2,
          -1,
          4
        ],
        "public": false,
        "label": "更新后的淘汰顺序"
      }
    ],
    "hints": [
      "Map 的插入顺序就是 LRU 的队列顺序，队头是最久未使用。",
      "命中或更新时先 `delete` 再 `set`，才能把它移到队尾。"
    ],
    "analysis": "JS 的 Map 按插入顺序迭代，`set` 已存在的 key 不会改变位置。LRU 要在每次 get 命中、put 更新时先删除再插入；容量超限时删 `keys().next().value`。",
    "fixed": "function solve(capacity, ops) {\n  const cache = new Map();\n  const out = [];\n  for (const [op, key, value] of ops) {\n    if (op === \"put\") {\n      if (cache.has(key)) cache.delete(key);\n      cache.set(key, value);\n      if (cache.size > capacity) cache.delete(cache.keys().next().value);\n    } else {\n      if (!cache.has(key)) {\n        out.push(-1);\n        continue;\n      }\n      const hit = cache.get(key);\n      cache.delete(key);\n      cache.set(key, hit);\n      out.push(hit);\n    }\n  }\n  return out;\n}",
    "order": 1
  },
  {
    "id": "h2",
    "level": "hard",
    "title": "按深度展开",
    "minutes": 13,
    "summary": "不管传什么 depth，都用了 Infinity，把多层数组全部压平。",
    "prompt": "实现 `solve(arr, depth)`：按指定深度展开数组。depth 为 0 时返回原结构的浅拷贝；depth 为 1 只展开一层，依次类推。",
    "source": "JavaScript 权威指南 7th · Ch.7；JavaScript 高级程序设计 4th · Ch.6",
    "bug": "`flat(Infinity)` 忽略了 depth 参数。",
    "code": "function solve(arr, depth) {\n  return arr.flat(Infinity);\n}",
    "tests": [
      {
        "args": [
          [
            1,
            [
              2,
              [
                3,
                [
                  4
                ]
              ]
            ]
          ],
          1
        ],
        "expected": [
          1,
          2,
          [
            3,
            [
              4
            ]
          ]
        ],
        "public": true,
        "label": "深度 1"
      },
      {
        "args": [
          [
            1,
            [
              2,
              [
                3,
                [
                  4
                ]
              ]
            ]
          ],
          2
        ],
        "expected": [
          1,
          2,
          3,
          [
            4
          ]
        ],
        "public": true,
        "label": "深度 2"
      },
      {
        "args": [
          [
            1,
            [
              2,
              [
                3
              ]
            ]
          ],
          0
        ],
        "expected": [
          1,
          [
            2,
            [
              3
            ]
          ]
        ],
        "public": false,
        "label": "深度 0"
      }
    ],
    "hints": [
      "`flat` 的 depth 参数就是要展开的层数。",
      "depth 为 0 时 `flat(0)` 会返回浅拷贝，不会修改原数组。"
    ],
    "analysis": "`flat(depth)` 的 depth 是层数，不是布尔开关。直接传 `depth` 即可；如果要兼容负数或非数字，先 `Math.max(0, Number(depth) || 0)`。",
    "fixed": "function solve(arr, depth) {\n  return arr.flat(Math.max(0, Number(depth) || 0));\n}",
    "order": 2
  },
  {
    "id": "h3",
    "level": "hard",
    "title": "零钱兑换",
    "minutes": 15,
    "summary": "贪心每次拿最大面额，遇到 [1,3,4] 换 6 会得到 3 枚，而最优是 2 枚。",
    "prompt": "实现 `solve(coins, amount)`：用最少数量的硬币凑出 amount，硬币数量不限。无法凑出返回 -1，amount 为 0 返回 0。",
    "source": "JavaScript 权威指南 7th · Ch.7；Eloquent JavaScript 4th · Ch.5；Cracking Coding Interview 思路改写",
    "bug": "贪心算法只考虑当前最大面额，局部最优不等于全局最优。",
    "code": "function solve(coins, amount) {\n  let count = 0;\n  for (const coin of coins.sort((a, b) => b - a)) {\n    count += Math.floor(amount / coin);\n    amount %= coin;\n  }\n  return amount === 0 ? count : -1;\n}",
    "tests": [
      {
        "args": [
          [
            1,
            3,
            4
          ],
          6
        ],
        "expected": 2,
        "public": true,
        "label": "贪心会失败的面额"
      },
      {
        "args": [
          [
            2
          ],
          3
        ],
        "expected": -1,
        "public": true,
        "label": "无法凑出"
      },
      {
        "args": [
          [
            1,
            3,
            4,
            5
          ],
          7
        ],
        "expected": 2,
        "public": false,
        "label": "7 = 3 + 4"
      }
    ],
    "hints": [
      "这是完全背包问题，用 dp[i] 表示凑出 i 的最少硬币数。",
      "dp[0] = 0，其余初始化为 Infinity；每个金额尝试所有硬币。"
    ],
    "analysis": "贪心在任意面额下不保证最优，例如 1/3/4 凑 6。正确做法是动态规划：`dp[i] = min(dp[i - coin] + 1)`，最后判断是否仍为 Infinity。",
    "fixed": "function solve(coins, amount) {\n  if (amount === 0) return 0;\n  const dp = new Array(amount + 1).fill(Infinity);\n  dp[0] = 0;\n  for (let i = 1; i <= amount; i += 1) {\n    for (const coin of coins) {\n      if (i >= coin) dp[i] = Math.min(dp[i], dp[i - coin] + 1);\n    }\n  }\n  return dp[amount] === Infinity ? -1 : dp[amount];\n}",
    "order": 3
  },
  {
    "id": "h4",
    "level": "hard",
    "title": "括号匹配",
    "minutes": 12,
    "summary": "判断条件写反了：栈顶匹配时反而返回 false，不匹配时却继续。",
    "prompt": "实现 `solve(s)`：判断只包含 `()[]{}` 的字符串是否括号正确配对。空字符串视为合法。",
    "source": "JavaScript 权威指南 7th · Ch.11；Secrets of the JavaScript Ninja 2nd · Ch.9",
    "bug": "`stack.pop() === pairs[ch]` 是匹配成功，却被写成了 `return false`。",
    "code": "function solve(s) {\n  const stack = [];\n  const pairs = { \")\": \"(\", \"]\": \"[\", \"}\": \"{\" };\n  for (const ch of s) {\n    if (\"([{\".includes(ch)) stack.push(ch);\n    else if (stack.pop() === pairs[ch]) return false;\n  }\n  return stack.length === 0;\n}",
    "tests": [
      {
        "args": [
          "()"
        ],
        "expected": true,
        "public": true,
        "label": "一对圆括号"
      },
      {
        "args": [
          "(]"
        ],
        "expected": false,
        "public": true,
        "label": "类型不匹配"
      },
      {
        "args": [
          "([)]"
        ],
        "expected": false,
        "public": false,
        "label": "交叉嵌套"
      }
    ],
    "hints": [
      "遇到右括号时，栈顶必须等于它对应的左括号。",
      "空栈时直接 pop 会得到 undefined，也要判为不匹配。"
    ],
    "analysis": "括号匹配用栈：左括号入栈，右括号弹出并比较。匹配成功应继续，不匹配才返回 false；循环结束还要检查栈是否为空。",
    "fixed": "function solve(s) {\n  const stack = [];\n  const pairs = { \")\": \"(\", \"]\": \"[\", \"}\": \"{\" };\n  for (const ch of s) {\n    if (\"([{\".includes(ch)) stack.push(ch);\n    else {\n      const top = stack.pop();\n      if (top !== pairs[ch]) return false;\n    }\n  }\n  return stack.length === 0;\n}",
    "order": 4
  },
  {
    "id": "h5",
    "level": "hard",
    "title": "螺旋矩阵",
    "minutes": 16,
    "summary": "遍历完一条边后没有检查边界是否相交，单行或最后一层会重复输出。",
    "prompt": "实现 `solve(matrix)`：按顺时针螺旋顺序返回矩阵中的所有元素。空矩阵返回空数组。",
    "source": "JavaScript 权威指南 7th · Ch.7；JavaScript 高级程序设计 4th · Ch.6",
    "bug": "下边和左边的遍历没有加 `top <= bottom` / `left <= right` 保护，边界相交后会重复读取。",
    "code": "function solve(matrix) {\n  if (!matrix.length) return [];\n  const out = [];\n  let top = 0, bottom = matrix.length - 1;\n  let left = 0, right = matrix[0].length - 1;\n  while (top <= bottom && left <= right) {\n    for (let c = left; c <= right; c += 1) out.push(matrix[top][c]);\n    top += 1;\n    for (let r = top; r <= bottom; r += 1) out.push(matrix[r][right]);\n    right -= 1;\n    for (let c = right; c >= left; c -= 1) out.push(matrix[bottom][c]);\n    bottom -= 1;\n    for (let r = bottom; r >= top; r -= 1) out.push(matrix[r][left]);\n    left += 1;\n  }\n  return out;\n}",
    "tests": [
      {
        "args": [
          [
            [
              1,
              2,
              3
            ],
            [
              4,
              5,
              6
            ],
            [
              7,
              8,
              9
            ]
          ]
        ],
        "expected": [
          1,
          2,
          3,
          6,
          9,
          8,
          7,
          4,
          5
        ],
        "public": true,
        "label": "3×3"
      },
      {
        "args": [
          [
            [
              1,
              2
            ],
            [
              3,
              4
            ]
          ]
        ],
        "expected": [
          1,
          2,
          4,
          3
        ],
        "public": true,
        "label": "2×2"
      },
      {
        "args": [
          [
            [
              1,
              2,
              3
            ]
          ]
        ],
        "expected": [
          1,
          2,
          3
        ],
        "public": false,
        "label": "单行"
      }
    ],
    "hints": [
      "每走完上边和右边，先检查 `top <= bottom` 再走底边。",
      "走完底边后再检查 `left <= right` 再走左边。"
    ],
    "analysis": "螺旋遍历的四个方向不是每轮都完整执行。上边、右边走完后，如果 top 已经越过 bottom，就不该再走底边；左边同理。加边界检查可以避免单行/单列重复。",
    "fixed": "function solve(matrix) {\n  if (!matrix.length) return [];\n  const out = [];\n  let top = 0, bottom = matrix.length - 1;\n  let left = 0, right = matrix[0].length - 1;\n  while (top <= bottom && left <= right) {\n    for (let c = left; c <= right; c += 1) out.push(matrix[top][c]);\n    top += 1;\n    for (let r = top; r <= bottom; r += 1) out.push(matrix[r][right]);\n    right -= 1;\n    if (top <= bottom) {\n      for (let c = right; c >= left; c -= 1) out.push(matrix[bottom][c]);\n      bottom -= 1;\n    }\n    if (left <= right) {\n      for (let r = bottom; r >= top; r -= 1) out.push(matrix[r][left]);\n      left += 1;\n    }\n  }\n  return out;\n}",
    "order": 5
  },
  {
    "id": "h6",
    "level": "hard",
    "title": "深比较对象",
    "minutes": 13,
    "summary": "用 JSON.stringify 比较，键顺序不同就判不相等；undefined 也会被吞掉。",
    "prompt": "实现 `solve(a, b)`：深比较两个 JSON 风格的值（对象、数组、原始值），结构相同且每个对应值相等返回 true。对象键顺序不影响结果。",
    "source": "JavaScript 权威指南 7th · Ch.6；Secrets of the JavaScript Ninja 2nd · Ch.2；Effective JavaScript · Item 57",
    "bug": "`JSON.stringify` 受键顺序影响，还会丢失 undefined、函数等类型。",
    "code": "function solve(a, b) {\n  return JSON.stringify(a) === JSON.stringify(b);\n}",
    "tests": [
      {
        "args": [
          [
            {
              "a": 1,
              "b": 2
            }
          ],
          [
            {
              "b": 2,
              "a": 1
            }
          ]
        ],
        "expected": true,
        "public": true,
        "label": "键顺序不同"
      },
      {
        "args": [
          [
            1,
            [
              2,
              3
            ]
          ],
          [
            1,
            [
              2,
              4
            ]
          ]
        ],
        "expected": false,
        "public": true,
        "label": "数组元素不同"
      },
      {
        "args": [
          [
            {
              "x": {
                "a": 1,
                "b": 2
              }
            }
          ],
          [
            {
              "x": {
                "b": 2,
                "a": 1
              }
            }
          ]
        ],
        "expected": true,
        "public": false,
        "label": "嵌套键顺序"
      }
    ],
    "hints": [
      "先处理原始值和 null，再比较两个对象的键集合。",
      "键数量相同、每个键都存在，并且递归比较对应值。"
    ],
    "analysis": "JSON 序列化是有损的：键顺序、undefined、函数、Symbol、Date 都会出问题。深比较要递归：`Object.is` 处理原始值，`Object.keys` 比较键集合，再逐个递归。",
    "fixed": "function solve(a, b) {\n  if (Object.is(a, b)) return true;\n  if (typeof a !== \"object\" || a === null || typeof b !== \"object\" || b === null) return false;\n  const ka = Object.keys(a);\n  const kb = Object.keys(b);\n  if (ka.length !== kb.length) return false;\n  return ka.every(key => Object.prototype.hasOwnProperty.call(b, key) && solve(a[key], b[key]));\n}",
    "order": 6
  },
  {
    "level": "basic",
    "id": "b7",
    "title": "字符出现次数",
    "minutes": 6,
    "summary": "`includes` 只回答“有没有”，题目要的是“出现几次”。",
    "prompt": "实现 `solve(text, ch)`：返回字符 `ch` 在 `text` 中出现的次数，区分大小写。空字符串返回 0。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "`includes` 返回布尔值，只能说明存在，不能计数。",
    "code": "function solve(text, ch) {\n  return text.includes(ch) ? 1 : 0;\n}",
    "hints": [
      "`includes` 的返回值是 true / false，不是次数。",
      "用循环或 `split(ch).length - 1` 统计；注意 `Level` 里有两个小写 e。"
    ],
    "analysis": "`includes` 适合判断存在性；计数必须遍历或用 `split`。还要明确是否区分大小写，本题区分，所以 `E` 不算。",
    "fixed": "function solve(text, ch) {\n  let count = 0;\n  for (const c of text) {\n    if (c === ch) count += 1;\n  }\n  return count;\n}",
    "tests": [
      {
        "args": [
          "banana",
          "a"
        ],
        "public": true,
        "label": "重复字符",
        "expected": 3
      },
      {
        "args": [
          "Level",
          "e"
        ],
        "public": true,
        "label": "大小写敏感",
        "expected": 2
      },
      {
        "args": [
          "",
          "a"
        ],
        "public": false,
        "label": "空字符串",
        "expected": 0
      }
    ],
    "order": 7
  },
  {
    "level": "basic",
    "id": "b8",
    "title": "判断回文",
    "minutes": 7,
    "summary": "`reverse()` 改的是数组，拿数组和字符串比较永远为 false。",
    "prompt": "实现 `solve(text)`：判断字符串是否为回文（正读反读相同），区分大小写。空字符串视为回文。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "`reverse()` 返回数组，没有 `join` 回字符串，`=== text` 必然不成立。",
    "code": "function solve(text) {\n  return text.split(\"\").reverse() === text;\n}",
    "hints": [
      "先看 `reverse()` 的返回类型：数组还是字符串？",
      "`split(\"\")` → 反转 → `join(\"\")`，再和原串比较。"
    ],
    "analysis": "`split` 把字符串变成数组，`reverse` 原地反转数组，`join` 才变回字符串。少了 `join`，比较的就是数组和字符串，类型都不同。",
    "fixed": "function solve(text) {\n  return text.split(\"\").reverse().join(\"\") === text;\n}",
    "tests": [
      {
        "args": [
          "level"
        ],
        "public": true,
        "label": "普通回文",
        "expected": true
      },
      {
        "args": [
          "abc"
        ],
        "public": true,
        "label": "不是回文",
        "expected": false
      },
      {
        "args": [
          ""
        ],
        "public": false,
        "label": "空字符串",
        "expected": true
      }
    ],
    "order": 8
  },
  {
    "level": "basic",
    "id": "b9",
    "title": "数组求和",
    "minutes": 6,
    "summary": "累加器初始化成空字符串，`+=` 变成了字符串拼接。",
    "prompt": "实现 `solve(nums)`：返回数组所有数字的和。空数组返回 0。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "`total` 初始化成 `\"\"`，`+=` 会做字符串拼接，最后返回字符串而不是数字。",
    "code": "function solve(nums) {\n  let total = \"\";\n  for (const n of nums) {\n    total += n;\n  }\n  return total;\n}",
    "hints": [
      "看初始值：求和的单位元是 0，不是空字符串。",
      "`+=` 在字符串上是拼接，在数字上才是加法。"
    ],
    "analysis": "JavaScript 的 `+` 会根据左操作数决定拼接还是相加。初始值写成 `\"\"`，第一次就变成字符串，后面全是拼接。求和从 0 开始，乘积从 1 开始。",
    "fixed": "function solve(nums) {\n  let total = 0;\n  for (const n of nums) {\n    total += n;\n  }\n  return total;\n}",
    "tests": [
      {
        "args": [
          [
            1,
            2,
            3
          ]
        ],
        "public": true,
        "label": "三个正数",
        "expected": 6
      },
      {
        "args": [
          [
            10,
            20
          ]
        ],
        "public": true,
        "label": "两位数",
        "expected": 30
      },
      {
        "args": [
          []
        ],
        "public": false,
        "label": "空数组",
        "expected": 0
      }
    ],
    "order": 9
  },
  {
    "level": "basic",
    "id": "b10",
    "title": "计算阶乘",
    "minutes": 7,
    "summary": "乘积初始值写成 0，乘什么都是 0。",
    "prompt": "实现 `solve(n)`：返回 n 的阶乘。0 的阶乘定义为 1。n 为非负整数。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "累乘初始值写成 0，第一轮就把结果乘成 0。",
    "code": "function solve(n) {\n  let result = 0;\n  for (let i = 1; i <= n; i++) {\n    result *= i;\n  }\n  return result;\n}",
    "hints": [
      "求积的单位元是 1；从 0 开始乘永远是 0。",
      "0! = 1 是定义，循环从 2 开始就能自然处理 0 和 1。"
    ],
    "analysis": "求和初始 0、求积初始 1，这是单位元的选择。阶乘还要单独照顾 0 的阶乘：定义为 1。循环从 2 开始，n=0 和 n=1 都直接返回 1。",
    "fixed": "function solve(n) {\n  let result = 1;\n  for (let i = 2; i <= n; i++) {\n    result *= i;\n  }\n  return result;\n}",
    "tests": [
      {
        "args": [
          5
        ],
        "public": true,
        "label": "5 的阶乘",
        "expected": 120
      },
      {
        "args": [
          3
        ],
        "public": true,
        "label": "3 的阶乘",
        "expected": 6
      },
      {
        "args": [
          0
        ],
        "public": false,
        "label": "0 的阶乘",
        "expected": 1
      }
    ],
    "order": 10
  },
  {
    "level": "basic",
    "id": "b11",
    "title": "动态键取值",
    "minutes": 8,
    "summary": "`obj.key` 取的是名为 key 的属性，不是变量 key 的值。",
    "prompt": "实现 `solve(obj, key)`：返回对象中键为 `key` 的值；键不存在时返回字符串 `\"missing\"`。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "点号 `obj.key` 把 `key` 当成字面属性名，不会读取变量里的键。",
    "code": "function solve(obj, key) {\n  return obj.key;\n}",
    "hints": [
      "点号后面的标识符是字面属性名；变量键必须用方括号。",
      "判断“键存在”用 `hasOwnProperty`，不要用 `obj[key] !== undefined`，因为值本身可能就是 undefined。"
    ],
    "analysis": "`obj.key` 等价于 `obj[\"key\"]`，和变量 `key` 无关。动态键要写 `obj[key]`。判断缺失时用 `hasOwnProperty` 或 `in`，别把“值为 undefined”和“键不存在”混为一谈。",
    "fixed": "function solve(obj, key) {\n  return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : \"missing\";\n}",
    "tests": [
      {
        "args": [
          {
            "name": "Ada"
          },
          "name"
        ],
        "public": true,
        "label": "普通键",
        "expected": "Ada"
      },
      {
        "args": [
          {
            "age": 0
          },
          "age"
        ],
        "public": true,
        "label": "值为 0",
        "expected": 0
      },
      {
        "args": [
          {
            "x": 1
          },
          "y"
        ],
        "public": false,
        "label": "缺失键",
        "expected": "missing"
      }
    ],
    "order": 11
  },
  {
    "level": "basic",
    "id": "b12",
    "title": "截取前 n 个字符",
    "minutes": 6,
    "summary": "`slice` 的结束下标少算了 1。",
    "prompt": "实现 `solve(text, n)`：返回字符串前 n 个字符。n 为 0 返回空字符串；n 超过长度时返回整个字符串。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "`slice(0, n - 1)` 少取了一个字符。",
    "code": "function solve(text, n) {\n  return text.slice(0, n - 1);\n}",
    "hints": [
      "`slice(start, end)` 的 `end` 不包含在结果里。",
      "要前 n 个字符，起点 0、终点 n；n=0 时自然得到空串。"
    ],
    "analysis": "`slice(0, n)` 取下标 0 到 n-1，正好 n 个字符。`slice` 的终点是开区间，不需要额外减 1；如果写 `n - 1`，就会少取一个。",
    "fixed": "function solve(text, n) {\n  return text.slice(0, n);\n}",
    "tests": [
      {
        "args": [
          "JavaScript",
          4
        ],
        "public": true,
        "label": "取前四个",
        "expected": "Java"
      },
      {
        "args": [
          "ab",
          1
        ],
        "public": true,
        "label": "取一个",
        "expected": "a"
      },
      {
        "args": [
          "x",
          0
        ],
        "public": false,
        "label": "取零个",
        "expected": ""
      }
    ],
    "order": 12
  },
  {
    "level": "basic",
    "id": "b13",
    "title": "计算平均数",
    "minutes": 7,
    "summary": "除以 `length - 1`，把平均数算大了。",
    "prompt": "实现 `solve(nums)`：返回数组的平均值。空数组返回 0。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "分母写成了 `nums.length - 1`，元素个数少算了一个。",
    "code": "function solve(nums) {\n  if (nums.length === 0) return 0;\n  let total = 0;\n  for (const n of nums) total += n;\n  return total / (nums.length - 1);\n}",
    "hints": [
      "平均值 = 总和 / 元素个数，不是 / (个数 - 1)。",
      "先处理空数组，避免除以 0。"
    ],
    "analysis": "平均值的分母是元素个数 `length`。`length - 1` 常用在“样本方差”的分母里，不是普通平均数。空数组要单独返回 0，否则 0/0 会得到 NaN。",
    "fixed": "function solve(nums) {\n  if (nums.length === 0) return 0;\n  let total = 0;\n  for (const n of nums) total += n;\n  return total / nums.length;\n}",
    "tests": [
      {
        "args": [
          [
            2,
            4,
            6
          ]
        ],
        "public": true,
        "label": "三个偶数",
        "expected": 4
      },
      {
        "args": [
          [
            10
          ]
        ],
        "public": true,
        "label": "一个元素",
        "expected": 10
      },
      {
        "args": [
          []
        ],
        "public": false,
        "label": "空数组",
        "expected": 0
      }
    ],
    "order": 13
  },
  {
    "level": "basic",
    "id": "b14",
    "title": "数组是否包含",
    "minutes": 6,
    "summary": "`indexOf` 返回 0 时也是包含，但 `> 0` 把它排除了。",
    "prompt": "实现 `solve(nums, target)`：判断数组是否包含目标值。空数组返回 false。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "`indexOf(target) > 0` 会漏掉目标在第一个位置的情况，因为此时返回 0。",
    "code": "function solve(nums, target) {\n  return nums.indexOf(target) > 0;\n}",
    "hints": [
      "`indexOf` 找不到返回 -1，找到返回下标；下标 0 是合法位置。",
      "`includes` 直接返回布尔值，不会把 0 当成 false。"
    ],
    "analysis": "`indexOf` 的返回值是下标，不是布尔值。用 `> 0` 判断会把首位命中漏掉；用 `!== -1` 或直接 `includes` 更稳。",
    "fixed": "function solve(nums, target) {\n  return nums.includes(target);\n}",
    "tests": [
      {
        "args": [
          [
            3,
            5,
            7
          ],
          3
        ],
        "public": true,
        "label": "目标在首位",
        "expected": true
      },
      {
        "args": [
          [
            1,
            2
          ],
          9
        ],
        "public": true,
        "label": "目标不存在",
        "expected": false
      },
      {
        "args": [
          [
            0
          ],
          0
        ],
        "public": false,
        "label": "目标为零",
        "expected": true
      }
    ],
    "order": 14
  },
  {
    "level": "medium",
    "id": "m7",
    "title": "按年龄升序",
    "minutes": 9,
    "summary": "`sort` 比较器返回布尔值，排序结果不可靠。",
    "prompt": "实现 `solve(people)`：按 `age` 升序返回新数组，不修改原数组。年龄相同保持原顺序。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "比较器返回 true/false，`sort` 需要正数、负数或 0。",
    "code": "function solve(people) {\n  return people.sort((a, b) => a.age > b.age);\n}",
    "hints": [
      "比较器的返回值应该是数字：负数表示 a 在前，正数表示 b 在前。",
      "先 `slice()` 复制再排序，避免修改调用方传入的数组。"
    ],
    "analysis": "`sort` 的比较器不是“条件判断”，而是“排序方向”：返回 `a - b` 是升序，`b - a` 是降序。返回布尔值会被强制转成 0/1，排序结果不稳定。`sort` 还会修改原数组，所以先复制。",
    "fixed": "function solve(people) {\n  return people.slice().sort((a, b) => a.age - b.age);\n}",
    "tests": [
      {
        "args": [
          [
            {
              "name": "Ada",
              "age": 30
            },
            {
              "name": "Bob",
              "age": 20
            }
          ]
        ],
        "public": true,
        "label": "两个年龄",
        "expected": [
          {
            "name": "Bob",
            "age": 20
          },
          {
            "name": "Ada",
            "age": 30
          }
        ]
      },
      {
        "args": [
          [
            {
              "name": "A",
              "age": 18
            },
            {
              "name": "B",
              "age": 18
            }
          ]
        ],
        "public": true,
        "label": "同年龄",
        "expected": [
          {
            "name": "A",
            "age": 18
          },
          {
            "name": "B",
            "age": 18
          }
        ]
      },
      {
        "args": [
          []
        ],
        "public": false,
        "label": "空数组",
        "expected": []
      }
    ],
    "order": 7
  },
  {
    "level": "medium",
    "id": "m8",
    "title": "过滤长单词",
    "minutes": 8,
    "summary": "过滤条件写反了，留下的是短单词。",
    "prompt": "实现 `solve(words, minLength)`：返回长度不小于 `minLength` 的单词，保持原顺序。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "`filter` 里的条件写成了 `<`，把要保留的长单词排除了。",
    "code": "function solve(words, minLength) {\n  return words.filter(word => word.length < minLength);\n}",
    "hints": [
      "“不小于”翻译成 `>=`，不是 `<`。",
      "先用一个短数组手算哪些单词应该留下。"
    ],
    "analysis": "过滤题的坑常在边界词：不小于、至少、超过分别对应 `>=`、`>=`、`>`。本题是“不小于”，所以长度等于 minLength 也要保留。",
    "fixed": "function solve(words, minLength) {\n  return words.filter(word => word.length >= minLength);\n}",
    "tests": [
      {
        "args": [
          [
            "js",
            "java",
            "python"
          ],
          4
        ],
        "public": true,
        "label": "混合长度",
        "expected": [
          "java",
          "python"
        ]
      },
      {
        "args": [
          [
            "a",
            "bb"
          ],
          1
        ],
        "public": true,
        "label": "最小长度为 1",
        "expected": [
          "a",
          "bb"
        ]
      },
      {
        "args": [
          [],
          3
        ],
        "public": false,
        "label": "空数组",
        "expected": []
      }
    ],
    "order": 8
  },
  {
    "level": "medium",
    "id": "m9",
    "title": "只展开一层",
    "minutes": 9,
    "summary": "`push(row)` 把整行塞进去，没有展开元素。",
    "prompt": "实现 `solve(nested)`：把二维数组展开成一层，保持元素顺序。不要求递归展开更深层。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "`out.push(row)` 压入的是子数组本身，结果还是二维的。",
    "code": "function solve(nested) {\n  const out = [];\n  for (const row of nested) {\n    out.push(row);\n  }\n  return out;\n}",
    "hints": [
      "`push` 一次只压一个元素；要压多个用展开运算符。",
      "`out.push(...row)` 等价于把 row 的每个元素依次 push。"
    ],
    "analysis": "`push` 接收的是参数列表，`push(row)` 只有一个参数，就是子数组本身。展开一层用 `push(...row)`，或者 `out = out.concat(row)`。要递归展开更深层，得另写递归。",
    "fixed": "function solve(nested) {\n  const out = [];\n  for (const row of nested) {\n    out.push(...row);\n  }\n  return out;\n}",
    "tests": [
      {
        "args": [
          [
            [
              1,
              2
            ],
            [
              3
            ]
          ]
        ],
        "public": true,
        "label": "两行",
        "expected": [
          1,
          2,
          3
        ]
      },
      {
        "args": [
          [
            [],
            [
              4,
              5
            ]
          ]
        ],
        "public": true,
        "label": "含空行",
        "expected": [
          4,
          5
        ]
      },
      {
        "args": [
          []
        ],
        "public": false,
        "label": "空二维数组",
        "expected": []
      }
    ],
    "order": 9
  },
  {
    "level": "medium",
    "id": "m10",
    "title": "补零日期",
    "minutes": 9,
    "summary": "月份补零写成了 `month + 1`，格式和值都不对。",
    "prompt": "实现 `solve(year, month, day)`：返回 `YYYY-MM-DD` 格式，月份和日期不足两位补 0。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "`String(month + 1).padStart(2, \"0\")` 既改了值又没处理 day。",
    "code": "function solve(year, month, day) {\n  const mm = String(month + 1).padStart(2, \"0\");\n  const dd = String(day).padStart(2, \"0\");\n  return `${year}-${mm}-${dd}`;\n}",
    "hints": [
      "题目传入的 month 已经是 1–12，不需要再加 1。",
      "`padStart(2, \"0\")` 只负责补零，不负责改值。"
    ],
    "analysis": "如果输入是 `Date` 对象，`getMonth()` 才需要 +1；本题直接传 1–12 的月份，不能加。补零对月和日都要做，否则 `2026-9-9` 不符合 `YYYY-MM-DD`。",
    "fixed": "function solve(year, month, day) {\n  const mm = String(month).padStart(2, \"0\");\n  const dd = String(day).padStart(2, \"0\");\n  return `${year}-${mm}-${dd}`;\n}",
    "tests": [
      {
        "args": [
          2026,
          1,
          5
        ],
        "public": true,
        "label": "一月五日",
        "expected": "2026-01-05"
      },
      {
        "args": [
          2026,
          12,
          31
        ],
        "public": true,
        "label": "十二月三十一日",
        "expected": "2026-12-31"
      },
      {
        "args": [
          2026,
          9,
          9
        ],
        "public": false,
        "label": "个位数月日",
        "expected": "2026-09-09"
      }
    ],
    "order": 10
  },
  {
    "level": "medium",
    "id": "m11",
    "title": "键值反转",
    "minutes": 10,
    "summary": "循环里把原键值原样复制，根本没反转。",
    "prompt": "实现 `solve(obj)`：返回一个新对象，把原对象的键和值互换。值都是字符串且不重复。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "`out[key] = obj[key]` 只是复制，反转应该用值作键、原键作值。",
    "code": "function solve(obj) {\n  const out = {};\n  for (const key in obj) {\n    out[key] = obj[key];\n  }\n  return out;\n}",
    "hints": [
      "反转后，原来的 value 变成新键，原来的 key 变成新值。",
      "用 `Object.entries` 同时拿到键和值，比 `for...in` 更直接。"
    ],
    "analysis": "`for...in` 遍历的是键，取值还要 `obj[key]`；`Object.entries` 直接给 `[key, value]`。反转时写 `out[value] = key`，不要写反。",
    "fixed": "function solve(obj) {\n  const out = {};\n  for (const [key, value] of Object.entries(obj)) {\n    out[value] = key;\n  }\n  return out;\n}",
    "tests": [
      {
        "args": [
          {
            "a": "x",
            "b": "y"
          }
        ],
        "public": true,
        "label": "两个键",
        "expected": {
          "x": "a",
          "y": "b"
        }
      },
      {
        "args": [
          {
            "id": "7"
          }
        ],
        "public": true,
        "label": "单键",
        "expected": {
          "7": "id"
        }
      },
      {
        "args": [
          {}
        ],
        "public": false,
        "label": "空对象",
        "expected": {}
      }
    ],
    "order": 11
  },
  {
    "level": "medium",
    "id": "m12",
    "title": "首字母频次",
    "minutes": 10,
    "summary": "取的是第二个字符，首字母统计全错。",
    "prompt": "实现 `solve(words)`：统计每个单词首字母出现次数，返回一个对象。空数组返回空对象。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "`word.charAt(1)` 取的是第二个字符，不是首字母。",
    "code": "function solve(words) {\n  const counts = {};\n  for (const word of words) {\n    if (!word) continue;\n    const first = word.charAt(1);\n    counts[first] = (counts[first] || 0) + 1;\n  }\n  return counts;\n}",
    "hints": [
      "字符串下标从 0 开始，首字符是 `charAt(0)`。",
      "计数前先跳过空字符串，否则 `charAt` 会得到空字符。"
    ],
    "analysis": "`charAt(0)` 是首字符，`charAt(1)` 是第二个。计数对象要先判断键是否存在，再决定从 0 还是从当前值加 1；空字符串要跳过。",
    "fixed": "function solve(words) {\n  const counts = {};\n  for (const word of words) {\n    if (!word) continue;\n    const first = word.charAt(0);\n    counts[first] = (counts[first] || 0) + 1;\n  }\n  return counts;\n}",
    "tests": [
      {
        "args": [
          [
            "apple",
            "ant",
            "banana"
          ]
        ],
        "public": true,
        "label": "两种首字母",
        "expected": {
          "a": 2,
          "b": 1
        }
      },
      {
        "args": [
          [
            "x"
          ]
        ],
        "public": true,
        "label": "单个单词",
        "expected": {
          "x": 1
        }
      },
      {
        "args": [
          []
        ],
        "public": false,
        "label": "空数组",
        "expected": {}
      }
    ],
    "order": 12
  },
  {
    "level": "medium",
    "id": "m13",
    "title": "数组交集",
    "minutes": 11,
    "summary": "`indexOf` 能判断存在，但没有去重。",
    "prompt": "实现 `solve(a, b)`：返回两个数组的交集，结果去重，保持 a 中第一次出现的顺序。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "用 `filter` + `indexOf` 只做了存在判断，重复元素会被保留多次。",
    "code": "function solve(a, b) {\n  return a.filter(x => b.indexOf(x) !== -1);\n}",
    "hints": [
      "`filter` 只筛元素，不会自动去重。",
      "用 Set 存 b 的元素，再用另一个 Set 记录已经放进结果的元素。"
    ],
    "analysis": "交集要同时处理“存在”和“去重”。`Set` 的 `has` 是 O(1)，比 `indexOf` 更适合大数组；再用一个 `seen` 保证结果里每个值只出现一次。",
    "fixed": "function solve(a, b) {\n  const setB = new Set(b);\n  const seen = new Set();\n  return a.filter(x => {\n    if (!setB.has(x) || seen.has(x)) return false;\n    seen.add(x);\n    return true;\n  });\n}",
    "tests": [
      {
        "args": [
          [
            1,
            2,
            2,
            3
          ],
          [
            2,
            3,
            4
          ]
        ],
        "public": true,
        "label": "有重复",
        "expected": [
          2,
          3
        ]
      },
      {
        "args": [
          [
            1,
            2
          ],
          [
            3,
            4
          ]
        ],
        "public": true,
        "label": "无交集",
        "expected": []
      },
      {
        "args": [
          [],
          [
            1
          ]
        ],
        "public": false,
        "label": "空数组",
        "expected": []
      }
    ],
    "order": 13
  },
  {
    "level": "medium",
    "id": "m14",
    "title": "保留两位小数",
    "minutes": 9,
    "summary": "乘 10 再除 10 只保留了一位小数。",
    "prompt": "实现 `solve(value)`：四舍五入保留两位小数，返回数字。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "`Math.round(value * 10) / 10` 只保留一位小数，应该乘除 100。",
    "code": "function solve(value) {\n  return Math.round(value * 10) / 10;\n}",
    "hints": [
      "保留两位小数：先乘 100，四舍五入，再除 100。",
      "`toFixed(2)` 返回字符串；题目要求数字，所以用 Math.round。"
    ],
    "analysis": "`toFixed` 适合展示，返回字符串；要数字就用 `Math.round(value * 100) / 100`。浮点数本身有精度误差，`1.005` 这类值可能得到 `1`，真实业务里要明确舍入规则。",
    "fixed": "function solve(value) {\n  return Math.round(value * 100) / 100;\n}",
    "tests": [
      {
        "args": [
          "1.234"
        ],
        "public": true,
        "label": "三位小数",
        "expected": 1.23
      },
      {
        "args": [
          "2.5"
        ],
        "public": true,
        "label": "一位小数",
        "expected": 2.5
      },
      {
        "args": [
          "0.999"
        ],
        "public": false,
        "label": "接近一",
        "expected": 1
      }
    ],
    "order": 14
  },
  {
    "level": "hard",
    "id": "h7",
    "title": "最长公共前缀",
    "minutes": 12,
    "summary": "发现第一个不匹配后返回了整个首单词，没有截到公共部分。",
    "prompt": "实现 `solve(words)`：返回所有单词的最长公共前缀。没有公共前缀返回空字符串。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "不匹配时返回了 `first`，应该返回 `first.slice(0, i)`。",
    "code": "function solve(words) {\n  if (words.length === 0) return \"\";\n  const first = words[0];\n  for (let i = 0; i < first.length; i++) {\n    for (const word of words) {\n      if (word[i] !== first[i]) return first;\n    }\n  }\n  return first;\n}",
    "hints": [
      "不匹配时，公共前缀只保留到 `i` 之前，不能返回整个首单词。",
      "先手推 i=0、i=1、i=2，确认每次返回的是 `first.slice(0, i)`。"
    ],
    "analysis": "公共前缀的返回点有两个：循环中一旦不匹配，返回 `first.slice(0, i)`；全部字符都匹配，才返回整个 `first`。如果两个返回点都写 `first`，短单词永远不会被截断。",
    "fixed": "function solve(words) {\n  if (words.length === 0) return \"\";\n  const first = words[0];\n  for (let i = 0; i < first.length; i++) {\n    for (const word of words) {\n      if (word[i] !== first[i]) return first.slice(0, i);\n    }\n  }\n  return first;\n}",
    "tests": [
      {
        "args": [
          [
            "flower",
            "flow",
            "flight"
          ]
        ],
        "public": true,
        "label": "三个单词",
        "expected": "fl"
      },
      {
        "args": [
          [
            "dog",
            "racecar",
            "car"
          ]
        ],
        "public": true,
        "label": "无公共前缀",
        "expected": ""
      },
      {
        "args": [
          [
            "abc"
          ]
        ],
        "public": false,
        "label": "单个单词",
        "expected": "abc"
      }
    ],
    "order": 7
  },
  {
    "level": "hard",
    "id": "h8",
    "title": "两数之和",
    "minutes": 13,
    "summary": "哈希表里存了当前值，却去查当前值，永远找不到互补项。",
    "prompt": "实现 `solve(nums, target)`：返回两个数的下标，使它们相加等于 target；没有解返回 null。每个输入只有一个答案，不能重复用同一个元素。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "循环里查的是 `map.has(n)`，应该查 `target - n`。",
    "code": "function solve(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const n = nums[i];\n    if (map.has(n)) return [map.get(n), i];\n    map.set(n, i);\n  }\n  return null;\n}",
    "hints": [
      "当前数是 n，需要的互补数是 target - n。",
      "先查互补数，再把当前数放进 Map，避免同一个元素被用两次。"
    ],
    "analysis": "两数之和的标准写法是“查互补、存当前”。先 `map.has(target - n)`，命中就返回两个下标；否则 `map.set(n, i)`。顺序反过来会把当前元素和自己配对。",
    "fixed": "function solve(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const n = nums[i];\n    const need = target - n;\n    if (map.has(need)) return [map.get(need), i];\n    map.set(n, i);\n  }\n  return null;\n}",
    "tests": [
      {
        "args": [
          [
            2,
            7,
            11,
            15
          ],
          9
        ],
        "public": true,
        "label": "经典样例",
        "expected": [
          0,
          1
        ]
      },
      {
        "args": [
          [
            3,
            3
          ],
          6
        ],
        "public": true,
        "label": "重复值",
        "expected": [
          0,
          1
        ]
      },
      {
        "args": [
          [
            1,
            2
          ],
          4
        ],
        "public": false,
        "label": "无解",
        "expected": null
      }
    ],
    "order": 8
  },
  {
    "level": "hard",
    "id": "h9",
    "title": "记忆化斐波那契",
    "minutes": 12,
    "summary": "递推式写成了 n-3，记忆表也没被真正使用。",
    "prompt": "实现 `solve(n)`：返回斐波那契数列第 n 项，F(0)=0、F(1)=1。n 为非负整数。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "递推式 `fib(n-1) + fib(n-3)` 跳过了 n-2，结果整体偏小。",
    "code": "function solve(n) {\n  const memo = [0, 1];\n  function fib(k) {\n    if (k <= 1) return k;\n    return fib(k - 1) + fib(k - 3);\n  }\n  return fib(n);\n}",
    "hints": [
      "斐波那契是前两项相加：`fib(k-1) + fib(k-2)`。",
      "记忆化要先查表，算完再写回；否则只是换了个写法重复计算。"
    ],
    "analysis": "斐波那契递推式只有一项之差，但结果会连锁错。记忆化的关键是“先查 memo[k]，没有再算，算完写回”。不查表只建数组，等于没记忆化。n 从 0、1 开始，边界单独返回。",
    "fixed": "function solve(n) {\n  const memo = [0, 1];\n  function fib(k) {\n    if (k <= 1) return k;\n    if (memo[k] != null) return memo[k];\n    memo[k] = fib(k - 1) + fib(k - 2);\n    return memo[k];\n  }\n  return fib(n);\n}",
    "tests": [
      {
        "args": [
          6
        ],
        "public": true,
        "label": "第六项",
        "expected": 8
      },
      {
        "args": [
          10
        ],
        "public": true,
        "label": "第十项",
        "expected": 55
      },
      {
        "args": [
          1
        ],
        "public": false,
        "label": "第一项",
        "expected": 1
      }
    ],
    "order": 9
  },
  {
    "level": "hard",
    "id": "h10",
    "title": "字符串压缩",
    "minutes": 14,
    "summary": "最后一组字符没有收尾，压缩结果少了尾巴。",
    "prompt": "实现 `solve(text)`：把连续相同字符压缩成“字符+次数”，例如 `aaabb` → `a3b2`。只出现一次也要写 1。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "循环结束后没有处理最后一组字符，最后的 b2 丢了。",
    "code": "function solve(text) {\n  if (!text) return \"\";\n  let out = \"\";\n  let count = 1;\n  for (let i = 1; i < text.length; i++) {\n    if (text[i] === text[i - 1]) count++;\n    else {\n      out += text[i - 1] + count;\n      count = 1;\n    }\n  }\n  return out;\n}",
    "hints": [
      "循环只处理“字符变化”的时刻，最后一组要在循环后补上。",
      "空字符串要单独返回，否则 `text[text.length - 1]` 是 undefined。"
    ],
    "analysis": "游程压缩的通用坑是“最后一组”。循环内每当字符变化就结算上一组；循环结束后必须再结算一次。空串提前返回，避免访问 undefined。",
    "fixed": "function solve(text) {\n  if (!text) return \"\";\n  let out = \"\";\n  let count = 1;\n  for (let i = 1; i < text.length; i++) {\n    if (text[i] === text[i - 1]) count++;\n    else {\n      out += text[i - 1] + count;\n      count = 1;\n    }\n  }\n  out += text[text.length - 1] + count;\n  return out;\n}",
    "tests": [
      {
        "args": [
          "aaabb"
        ],
        "public": true,
        "label": "两段",
        "expected": "a3b2"
      },
      {
        "args": [
          "abc"
        ],
        "public": true,
        "label": "全不重复",
        "expected": "a1b1c1"
      },
      {
        "args": [
          "a"
        ],
        "public": false,
        "label": "单字符",
        "expected": "a1"
      }
    ],
    "order": 10
  },
  {
    "level": "hard",
    "id": "h11",
    "title": "字符串全排列",
    "minutes": 16,
    "summary": "递归时只取当前下标之后的字符，丢了前面的分支。",
    "prompt": "实现 `solve(chars)`：返回字符串所有字符的全排列，按字典序输出为字符串数组。输入字符不重复。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "`chars.slice(i + 1)` 丢掉了 i 前面的字符，递归分支不完整。",
    "code": "function solve(chars) {\n  if (chars.length <= 1) return [chars];\n  const out = [];\n  for (let i = 0; i < chars.length; i++) {\n    const rest = chars.slice(i + 1);\n    for (const tail of solve(rest)) out.push(chars[i] + tail);\n  }\n  return out;\n}",
    "hints": [
      "排列要“选一个字符，再从剩下的所有字符里递归”。",
      "剩下的字符 = 原串去掉当前位置，不是只取后半段。"
    ],
    "analysis": "全排列的递归结构是：对每个位置 i，选 `chars[i]`，把“去掉 i 的剩余字符”继续排列，再拼回去。`slice(i+1)` 只取后半段，会漏掉前半段的分支。结果需要排序时最后统一 `sort()`。",
    "fixed": "function solve(chars) {\n  if (chars.length <= 1) return [chars];\n  const out = [];\n  for (let i = 0; i < chars.length; i++) {\n    const rest = chars.slice(0, i) + chars.slice(i + 1);\n    for (const tail of solve(rest)) out.push(chars[i] + tail);\n  }\n  return out.sort();\n}",
    "tests": [
      {
        "args": [
          "ab"
        ],
        "public": true,
        "label": "两个字符",
        "expected": [
          "ab",
          "ba"
        ]
      },
      {
        "args": [
          "abc"
        ],
        "public": true,
        "label": "三个字符",
        "expected": [
          "abc",
          "acb",
          "bac",
          "bca",
          "cab",
          "cba"
        ]
      },
      {
        "args": [
          "a"
        ],
        "public": false,
        "label": "单字符",
        "expected": [
          "a"
        ]
      }
    ],
    "order": 11
  },
  {
    "level": "hard",
    "id": "h12",
    "title": "岛屿数量",
    "minutes": 16,
    "summary": "只数了 1 的个数，没有把相连的陆地合成一块。",
    "prompt": "实现 `solve(grid)`：`grid` 是由 \"1\"（陆地）和 \"0\"（水）组成的二维数组，返回岛屿数量。上下左右相连算同一座岛。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "每个 \"1\" 都单独计数，没有 DFS/BFS 标记同一座岛的其它格子。",
    "code": "function solve(grid) {\n  let count = 0;\n  for (let r = 0; r < grid.length; r++) {\n    for (let c = 0; c < grid[0].length; c++) {\n      if (grid[r][c] === \"1\") count++;\n    }\n  }\n  return count;\n}",
    "hints": [
      "找到一个 \"1\" 后，把与它相连的所有 \"1\" 都标记成 \"0\"，再计数加一。",
      "DFS 的边界要先判断行列范围，再判断是不是陆地。"
    ],
    "analysis": "岛屿数量不是数 \"1\" 的个数，而是数连通块。每发现一个未访问的陆地，岛屿数 +1，然后用 DFS/BFS 把整块陆地“沉没”。边界检查要放在访问 `grid[r][c]` 之前，避免越界。",
    "fixed": "function solve(grid) {\n  let count = 0;\n  function sink(r, c) {\n    if (r < 0 || c < 0 || r >= grid.length || c >= grid[0].length || grid[r][c] !== \"1\") return;\n    grid[r][c] = \"0\";\n    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);\n  }\n  for (let r = 0; r < grid.length; r++) {\n    for (let c = 0; c < grid[0].length; c++) {\n      if (grid[r][c] === \"1\") {\n        count++;\n        sink(r, c);\n      }\n    }\n  }\n  return count;\n}",
    "tests": [
      {
        "args": [
          [
            [
              "1",
              "1",
              "0"
            ],
            [
              "0",
              "1",
              "0"
            ],
            [
              "0",
              "0",
              "1"
            ]
          ]
        ],
        "public": true,
        "label": "两块陆地",
        "expected": 2
      },
      {
        "args": [
          [
            [
              "1",
              "0"
            ],
            [
              "0",
              "1"
            ]
          ]
        ],
        "public": true,
        "label": "两块分离",
        "expected": 2
      },
      {
        "args": [
          [
            [
              "0"
            ]
          ]
        ],
        "public": false,
        "label": "全是水",
        "expected": 0
      }
    ],
    "order": 12
  },
  {
    "level": "hard",
    "id": "h13",
    "title": "编辑距离",
    "minutes": 18,
    "summary": "只处理了替换，插入和删除都没算。",
    "prompt": "实现 `solve(a, b)`：返回把 a 变成 b 的最少编辑次数，允许插入、删除、替换各一个字符。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "代码只判断字符是否相同，没建立 DP 表，漏掉了插入和删除。",
    "code": "function solve(a, b) {\n  if (a === b) return 0;\n  return 1;\n}",
    "hints": [
      "dp[i][j] 表示 a 的前 i 个字符变成 b 的前 j 个字符的最少次数。",
      "相同字符继承左上角；不同字符取删除、插入、替换三者的最小值加 1。"
    ],
    "analysis": "编辑距离是二维 DP 的入门题。第一行和第一列是“从空串变过去”的插入/删除次数；转移时相同字符直接继承左上角，不同字符从上方、左方、左上三个方向取最小再加 1。只写 `if (a===b)` 是把问题当成了一次替换。",
    "fixed": "function solve(a, b) {\n  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0));\n  for (let i = 0; i <= a.length; i++) dp[i][0] = i;\n  for (let j = 0; j <= b.length; j++) dp[0][j] = j;\n  for (let i = 1; i <= a.length; i++) {\n    for (let j = 1; j <= b.length; j++) {\n      if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1];\n      else dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);\n    }\n  }\n  return dp[a.length][b.length];\n}",
    "tests": [
      {
        "args": [
          "horse",
          "ros"
        ],
        "public": true,
        "label": "经典样例",
        "expected": 3
      },
      {
        "args": [
          "intention",
          "execution"
        ],
        "public": true,
        "label": "长单词",
        "expected": 5
      },
      {
        "args": [
          "",
          "abc"
        ],
        "public": false,
        "label": "空串",
        "expected": 3
      }
    ],
    "order": 13
  },
  {
    "level": "hard",
    "id": "h14",
    "title": "第 k 大元素",
    "minutes": 12,
    "summary": "升序排序后取 `nums[k]`，取到的是第 k+1 小。",
    "prompt": "实现 `solve(nums, k)`：返回数组中第 k 大的元素（k 从 1 开始）。数组长度不小于 k。",
    "source": "JavaScript 高级程序设计 4th · 第 3–6 章；JavaScript 权威指南 7th · 第 6–7 章",
    "bug": "升序排序后应该取 `nums[nums.length - k]`，现在取了 `nums[k]`。",
    "code": "function solve(nums, k) {\n  const sorted = nums.slice().sort((a, b) => a - b);\n  return sorted[k];\n}",
    "hints": [
      "升序数组里，第 k 大 = 下标 `length - k`。",
      "k 从 1 开始，所以不需要再减 1。"
    ],
    "analysis": "第 k 大不是第 k 小。升序排序后，最大在 `length-1`，第 k 大在 `length-k`。若用降序排序，则取 `k-1`。先明确排序方向，再写下标，别混。",
    "fixed": "function solve(nums, k) {\n  const sorted = nums.slice().sort((a, b) => a - b);\n  return sorted[sorted.length - k];\n}",
    "tests": [
      {
        "args": [
          [
            3,
            2,
            1,
            5,
            6,
            4
          ],
          2
        ],
        "public": true,
        "label": "第二大的",
        "expected": 5
      },
      {
        "args": [
          [
            1
          ],
          1
        ],
        "public": true,
        "label": "只有一个",
        "expected": 1
      },
      {
        "args": [
          [
            2,
            1
          ],
          2
        ],
        "public": false,
        "label": "第二小",
        "expected": 1
      }
    ],
    "order": 14
  }
];

/* JavaScript 改错题库扩展 · 12 题（三档各 4 题） */
window.JS_DEBUG_TASKS = (window.JS_DEBUG_TASKS || []).concat([
  {
    "minutes": 7,
    "source": "Eloquent JavaScript 4th · Ch.5；Head First JavaScript Programming 2nd · Ch.6",
    "public": true,
    "id": "b15",
    "level": "basic",
    "order": 43,
    "title": "区间和查询",
    "summary": "前缀和数组建对了，查询时少减了一个 1。",
    "prompt": "实现 `solve(nums, queries)`：`nums` 是整数数组，`queries` 是若干 `[l, r]` 区间（下标从 1 开始，包含两端）。返回每个区间的元素和。",
    "bug": "区间公式写成了 `pre[r] - pre[l]`，应该减 `pre[l - 1]`。",
    "code": "function solve(nums, queries) {\n  const pre = [0];\n  for (let i = 0; i < nums.length; i++) pre.push(pre[i] + nums[i]);\n  return queries.map(([l, r]) => pre[r] - pre[l]);\n}",
    "tests": [
      {
        "args": [
          [
            1,
            2,
            3,
            4
          ],
          [
            [
              1,
              3
            ],
            [
              2,
              4
            ],
            [
              1,
              1
            ]
          ]
        ],
        "expected": [
          6,
          9,
          1
        ],
        "public": true,
        "label": "三个区间"
      },
      {
        "args": [
          [
            5,
            5,
            5
          ],
          [
            [
              1,
              2
            ]
          ]
        ],
        "expected": [
          10
        ],
        "public": true,
        "label": "两个元素"
      },
      {
        "args": [
          [
            2,
            4,
            6,
            8,
            10
          ],
          [
            [
              3,
              5
            ]
          ]
        ],
        "expected": [
          24
        ],
        "public": false,
        "label": "后缀区间"
      }
    ],
    "hints": [
      "先写出前缀和：`pre[i]` 表示前 i 个元素的和。",
      "下标从 1 开始时，区间和是 `pre[r] - pre[l - 1]`。"
    ],
    "analysis": "前缀和的下标是“元素个数”，不是“元素位置”。`pre[1]` 表示第 1 个元素，所以区间 [l, r] 要减掉 l 前面的所有元素，也就是 `pre[l - 1]`。",
    "fixed": "function solve(nums, queries) {\n  const pre = [0];\n  for (let i = 0; i < nums.length; i++) pre.push(pre[i] + nums[i]);\n  return queries.map(([l, r]) => pre[r] - pre[l - 1]);\n}"
  },
  {
    "minutes": 7,
    "source": "Eloquent JavaScript 4th · Ch.5；Head First JavaScript Programming 2nd · Ch.6",
    "public": true,
    "id": "b16",
    "level": "basic",
    "order": 44,
    "title": "矩阵对角线差",
    "summary": "副对角线取成了 `n - i`，越界并且算错。",
    "prompt": "实现 `solve(matrix)`：`matrix` 是 n×n 方阵。返回主对角线元素之和与副对角线元素之和的绝对差。",
    "bug": "副对角线写成了 `matrix[i][n - i]`，正确下标是 `n - 1 - i`。",
    "code": "function solve(matrix) {\n  const n = matrix.length;\n  let primary = 0;\n  let secondary = 0;\n  for (let i = 0; i < n; i++) {\n    primary += matrix[i][i];\n    secondary += matrix[i][n - i];\n  }\n  return Math.abs(primary - secondary);\n}",
    "tests": [
      {
        "args": [
          [
            [
              1,
              2
            ],
            [
              7,
              4
            ]
          ]
        ],
        "expected": 4,
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
            ],
            [
              4,
              9,
              6
            ],
            [
              7,
              8,
              5
            ]
          ]
        ],
        "expected": 4,
        "public": true,
        "label": "3×3"
      },
      {
        "args": [
          [
            [
              1,
              2,
              3,
              4
            ],
            [
              5,
              6,
              7,
              8
            ],
            [
              9,
              10,
              11,
              12
            ],
            [
              13,
              14,
              15,
              16
            ]
          ]
        ],
        "expected": 0,
        "public": false,
        "label": "两条对角线相等"
      }
    ],
    "hints": [
      "副对角线从右上角开始，列下标是 `n - 1`，每往下一行列下标减 1。",
      "先拿 2×2 矩阵手算：主对角线 1+4，副对角线 2+7。"
    ],
    "analysis": "`matrix[i][n - i]` 在 i=0 时直接取 `matrix[0][n]`，已经越界。副对角线的规律是行列下标之和等于 n-1，所以列下标是 `n-1-i`。",
    "fixed": "function solve(matrix) {\n  const n = matrix.length;\n  let primary = 0;\n  let secondary = 0;\n  for (let i = 0; i < n; i++) {\n    primary += matrix[i][i];\n    secondary += matrix[i][n - 1 - i];\n  }\n  return Math.abs(primary - secondary);\n}"
  },
  {
    "minutes": 7,
    "source": "Eloquent JavaScript 4th · Ch.5；Head First JavaScript Programming 2nd · Ch.6",
    "public": true,
    "id": "b17",
    "level": "basic",
    "order": 45,
    "title": "大小写统计",
    "summary": "把所有非大写字符都算成了小写，空格和标点也被计数。",
    "prompt": "实现 `solve(text)`：返回一个对象 `{ upper, lower }`，分别表示大写字母和小写字母的数量。非字母字符不计入任何一类。",
    "bug": "`else lower++` 会把空格、数字、标点都算成小写字母。",
    "code": "function solve(text) {\n  let upper = 0;\n  let lower = 0;\n  for (const ch of text) {\n    if (ch >= \"A\" && ch <= \"Z\") upper++;\n    else lower++;\n  }\n  return { upper, lower };\n}",
    "tests": [
      {
        "args": [
          "Hello World 2026"
        ],
        "expected": {
          "upper": 2,
          "lower": 8
        },
        "public": true,
        "label": "带空格和数字"
      },
      {
        "args": [
          "ABC xyz"
        ],
        "expected": {
          "upper": 3,
          "lower": 3
        },
        "public": true,
        "label": "大写小写各半"
      },
      {
        "args": [
          "123 !?"
        ],
        "expected": {
          "upper": 0,
          "lower": 0
        },
        "public": false,
        "label": "没有字母"
      }
    ],
    "hints": [
      "大写字母范围是 A–Z，小写字母范围是 a–z，二者之间还有其它字符。",
      "用两个独立的 `if` 或 `else if` 明确判断，不要把所有非大写都归为小写。"
    ],
    "analysis": "字符比较按码点进行。`else` 只表示“不是大写”，还包括空格、标点、数字，所以 lower 会偏大。应该再用 `a <= ch && ch <= z` 判断小写。",
    "fixed": "function solve(text) {\n  let upper = 0;\n  let lower = 0;\n  for (const ch of text) {\n    if (ch >= \"A\" && ch <= \"Z\") upper++;\n    else if (ch >= \"a\" && ch <= \"z\") lower++;\n  }\n  return { upper, lower };\n}"
  },
  {
    "minutes": 7,
    "source": "Eloquent JavaScript 4th · Ch.5；Head First JavaScript Programming 2nd · Ch.6",
    "public": true,
    "id": "b18",
    "level": "basic",
    "order": 46,
    "title": "相邻最大差",
    "summary": "差值没有取绝对值，下降的相邻对会被算成负数。",
    "prompt": "实现 `solve(nums)`：返回数组中相邻两个元素差的绝对值的最大值。数组长度至少为 2。",
    "bug": "`nums[i] - nums[i - 1]` 没有取绝对值，遇到下降时会得到负数。",
    "code": "function solve(nums) {\n  let best = 0;\n  for (let i = 1; i < nums.length; i++) {\n    best = Math.max(best, nums[i] - nums[i - 1]);\n  }\n  return best;\n}",
    "tests": [
      {
        "args": [
          [
            1,
            7,
            3,
            10
          ]
        ],
        "expected": 7,
        "public": true,
        "label": "上升与下降混合"
      },
      {
        "args": [
          [
            5,
            4,
            3,
            2
          ]
        ],
        "expected": 1,
        "public": true,
        "label": "一直下降"
      },
      {
        "args": [
          [
            -3,
            -8,
            2
          ]
        ],
        "expected": 10,
        "public": false,
        "label": "负数与反弹"
      }
    ],
    "hints": [
      "差的绝对值用 `Math.abs(a - b)`。",
      "初始 best 可以设成 0，因为绝对值不会为负。"
    ],
    "analysis": "相邻差有方向：`6-1=5` 和 `1-6=-5` 的“距离”都应该是 5。比较前先取 `Math.abs`，否则下降段永远赢不了上升段。",
    "fixed": "function solve(nums) {\n  let best = 0;\n  for (let i = 1; i < nums.length; i++) {\n    best = Math.max(best, Math.abs(nums[i] - nums[i - 1]));\n  }\n  return best;\n}"
  },
  {
    "minutes": 9,
    "source": "Eloquent JavaScript 4th · Ch.5；Head First JavaScript Programming 2nd · Ch.6",
    "public": true,
    "id": "m15",
    "level": "medium",
    "order": 47,
    "title": "质因数分解",
    "summary": "指数统计对了，但输出时把指数丢掉了。",
    "prompt": "实现 `solve(n)`：返回 n 的质因数分解式。质因子从小到大，指数为 1 时省略 `^1`，因子之间用 `*` 连接，例如 360 → `\"2^3*3^2*5\"`。",
    "bug": "`parts.push(String(p))` 只写了底数，没有把指数 e 拼进去。",
    "code": "function solve(n) {\n  const parts = [];\n  for (let p = 2; p * p <= n; p++) {\n    if (n % p !== 0) continue;\n    let e = 0;\n    while (n % p === 0) { n /= p; e++; }\n    parts.push(String(p));\n  }\n  if (n > 1) parts.push(String(n));\n  return parts.join(\"*\");\n}",
    "tests": [
      {
        "args": [
          360
        ],
        "expected": "2^3*3^2*5",
        "public": true,
        "label": "多个指数"
      },
      {
        "args": [
          97
        ],
        "expected": "97",
        "public": true,
        "label": "本身是质数"
      },
      {
        "args": [
          1000
        ],
        "expected": "2^3*5^3",
        "public": false,
        "label": "两个因子"
      }
    ],
    "hints": [
      "每除一次 p，指数 e 加 1；e>1 时输出 `p^e`，否则只输出 p。",
      "除完后如果 n>1，剩下的 n 也是质因子。"
    ],
    "analysis": "指数不是装饰，2 的三次方和三个 2 相乘是同一个数，但分解式的写法必须体现次数。用 `e > 1 ? p + \"^\" + e : String(p)`。",
    "fixed": "function solve(n) {\n  const parts = [];\n  for (let p = 2; p * p <= n; p++) {\n    if (n % p !== 0) continue;\n    let e = 0;\n    while (n % p === 0) { n /= p; e++; }\n    parts.push(e > 1 ? p + \"^\" + e : String(p));\n  }\n  if (n > 1) parts.push(String(n));\n  return parts.join(\"*\");\n}"
  },
  {
    "minutes": 9,
    "source": "Eloquent JavaScript 4th · Ch.5；Head First JavaScript Programming 2nd · Ch.6",
    "public": true,
    "id": "m16",
    "level": "medium",
    "order": 48,
    "title": "约瑟夫环",
    "summary": "出列下标多走了一步，k 被当成 k+1 在用。",
    "prompt": "实现 `solve(n, k)`：n 个人围成一圈，编号 1 到 n，从 1 号开始报数，报到 k 的人出列，下一个人重新从 1 报数。返回最后留下的人的编号。",
    "bug": "`(idx + k) % people.length` 应该是 `(idx + k - 1) % people.length`。",
    "code": "function solve(n, k) {\n  const people = Array.from({ length: n }, (_, i) => i + 1);\n  let idx = 0;\n  while (people.length > 1) {\n    idx = (idx + k) % people.length;\n    people.splice(idx, 1);\n    if (idx === people.length) idx = 0;\n  }\n  return people[0];\n}",
    "tests": [
      {
        "args": [
          5,
          2
        ],
        "expected": 3,
        "public": true,
        "label": "5 人报 2"
      },
      {
        "args": [
          7,
          3
        ],
        "expected": 4,
        "public": true,
        "label": "7 人报 3"
      },
      {
        "args": [
          10,
          4
        ],
        "expected": 5,
        "public": false,
        "label": "10 人报 4"
      }
    ],
    "hints": [
      "当前下标 idx 指向“从 1 开始报数”的人，报 k 的人要走 k-1 步。",
      "删除后如果 idx 等于新长度，说明绕到了末尾，要回到 0。"
    ],
    "analysis": "数组下标从 0 开始，而报数从 1 开始。`(idx + k - 1)` 才是要删除的人；用 `idx + k` 会多跳一个人。",
    "fixed": "function solve(n, k) {\n  const people = Array.from({ length: n }, (_, i) => i + 1);\n  let idx = 0;\n  while (people.length > 1) {\n    idx = (idx + k - 1) % people.length;\n    people.splice(idx, 1);\n    if (idx === people.length) idx = 0;\n  }\n  return people[0];\n}"
  },
  {
    "minutes": 9,
    "source": "Eloquent JavaScript 4th · Ch.5；Head First JavaScript Programming 2nd · Ch.6",
    "public": true,
    "id": "m17",
    "level": "medium",
    "order": 49,
    "title": "合并区间",
    "summary": "合并右端点时被短区间覆盖，没有取最大值。",
    "prompt": "实现 `solve(intervals)`：每个区间是 `[start, end]`。合并所有重叠或相接的区间，返回合并后的区间数组，按起点升序。",
    "bug": "`else last[1] = r` 会把原本更远的右端点覆盖掉，应该取 `Math.max(last[1], r)`。",
    "code": "function solve(intervals) {\n  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);\n  const merged = [];\n  for (const [l, r] of sorted) {\n    const last = merged[merged.length - 1];\n    if (!last || l > last[1]) merged.push([l, r]);\n    else last[1] = r;\n  }\n  return merged;\n}",
    "tests": [
      {
        "args": [
          [
            [
              1,
              3
            ],
            [
              2,
              6
            ],
            [
              8,
              10
            ],
            [
              9,
              12
            ]
          ]
        ],
        "expected": [
          [
            1,
            6
          ],
          [
            8,
            12
          ]
        ],
        "public": true,
        "label": "两组重叠"
      },
      {
        "args": [
          [
            [
              1,
              10
            ],
            [
              2,
              3
            ],
            [
              4,
              5
            ]
          ]
        ],
        "expected": [
          [
            1,
            10
          ]
        ],
        "public": true,
        "label": "包含区间"
      },
      {
        "args": [
          [
            [
              5,
              7
            ],
            [
              1,
              2
            ]
          ]
        ],
        "expected": [
          [
            1,
            2
          ],
          [
            5,
            7
          ]
        ],
        "public": false,
        "label": "乱序且不重叠"
      }
    ],
    "hints": [
      "先按起点排序，才能只比较当前区间和最后一个合并区间。",
      "区间 [1,3] 与 [3,5] 在数轴上相接，也应合并。"
    ],
    "analysis": "`l > last[1]` 只在不重叠且不相接时为真。相接时 l 等于 last[1]，应该进入合并分支，所以条件应写成 `l > last[1]` 判断“新起一段”，否则合并；这里 bug 恰好是把边界当成了分离。",
    "fixed": "function solve(intervals) {\n  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);\n  const merged = [];\n  for (const [l, r] of sorted) {\n    const last = merged[merged.length - 1];\n    if (!last || l > last[1]) merged.push([l, r]);\n    else last[1] = Math.max(last[1], r);\n  }\n  return merged;\n}"
  },
  {
    "minutes": 9,
    "source": "Eloquent JavaScript 4th · Ch.5；Head First JavaScript Programming 2nd · Ch.6",
    "public": true,
    "id": "m18",
    "level": "medium",
    "order": 50,
    "title": "最长连续递增段",
    "summary": "计数器每轮都从 0 重新开始，最长长度被抹掉了。",
    "prompt": "实现 `solve(nums)`：返回数组中最长“连续递增段”的长度。连续递增段要求相邻元素严格变大，且在原数组中连续。空数组返回 0。",
    "bug": "`cur = 0` 清空后，下一轮只从 1 开始，没有保留之前的最长长度。",
    "code": "function solve(nums) {\n  if (nums.length === 0) return 0;\n  let best = 1;\n  let cur = 1;\n  for (let i = 1; i < nums.length; i++) {\n    if (nums[i] > nums[i - 1]) cur++;\n    else cur = 0;\n    best = Math.max(best, cur);\n  }\n  return best;\n}",
    "tests": [
      {
        "args": [
          [
            1,
            2,
            3,
            1,
            2
          ]
        ],
        "expected": 3,
        "public": true,
        "label": "一段长递增"
      },
      {
        "args": [
          [
            5,
            4,
            3,
            2
          ]
        ],
        "expected": 1,
        "public": true,
        "label": "一直下降"
      },
      {
        "args": [
          [
            1,
            2,
            1,
            2,
            3,
            4
          ]
        ],
        "expected": 4,
        "public": false,
        "label": "最长在末尾"
      }
    ],
    "hints": [
      "递增时 cur++，下降时 cur 应该重置为 1，而不是 0。",
      "每轮都用 best 记录当前最大值。"
    ],
    "analysis": "连续段长度至少为 1。重置成 0 等于把当前元素本身漏掉了，后续即使递增也会少算 1；重置成 1 更符合“当前元素自己是一段”的定义。",
    "fixed": "function solve(nums) {\n  if (nums.length === 0) return 0;\n  let best = 1;\n  let cur = 1;\n  for (let i = 1; i < nums.length; i++) {\n    if (nums[i] > nums[i - 1]) cur++;\n    else cur = 1;\n    best = Math.max(best, cur);\n  }\n  return best;\n}"
  },
  {
    "minutes": 12,
    "source": "Eloquent JavaScript 4th · Ch.5；Head First JavaScript Programming 2nd · Ch.6",
    "public": true,
    "id": "h15",
    "level": "hard",
    "order": 51,
    "title": "最长递增子序列",
    "summary": "直接返回了 dp 的最后一项，但最长子序列不一定在末尾结束。",
    "prompt": "实现 `solve(nums)`：返回最长严格递增子序列的长度。子序列不要求连续，但下标必须递增。空数组返回 0。",
    "bug": "`return dp[dp.length - 1]` 只看了以最后一个元素结尾的情况，应该返回 dp 的最大值。",
    "code": "function solve(nums) {\n  const n = nums.length;\n  if (n === 0) return 0;\n  const dp = new Array(n).fill(1);\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < i; j++) {\n      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);\n    }\n  }\n  return dp[dp.length - 1];\n}",
    "tests": [
      {
        "args": [
          [
            6,
            1,
            2,
            3,
            0
          ]
        ],
        "expected": 3,
        "public": true,
        "label": "最长段不在末尾"
      },
      {
        "args": [
          [
            10,
            9,
            2,
            5,
            3,
            7,
            101,
            18
          ]
        ],
        "expected": 4,
        "public": true,
        "label": "经典序列"
      },
      {
        "args": [
          [
            7,
            7,
            7
          ]
        ],
        "expected": 1,
        "public": false,
        "label": "全部相等"
      }
    ],
    "hints": [
      "dp[i] 只表示“以 i 结尾”的最长长度，全局答案要取所有 dp[i] 的最大值。",
      "最后一项的 dp 值可能很小，不能直接返回。"
    ],
    "analysis": "`dp[n-1]` 只是以最后一个元素结尾的答案。最长子序列可能在任意位置结束，所以循环中要维护 best，或最后 `Math.max(...dp)`。",
    "fixed": "function solve(nums) {\n  const n = nums.length;\n  if (n === 0) return 0;\n  const dp = new Array(n).fill(1);\n  let best = 1;\n  for (let i = 0; i < n; i++) {\n    for (let j = 0; j < i; j++) {\n      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);\n    }\n    best = Math.max(best, dp[i]);\n  }\n  return best;\n}"
  },
  {
    "minutes": 12,
    "source": "Eloquent JavaScript 4th · Ch.5；Head First JavaScript Programming 2nd · Ch.6",
    "public": true,
    "id": "h16",
    "level": "hard",
    "order": 52,
    "title": "滑动窗口最大值",
    "summary": "循环少跑了一位，最后一个窗口没有输出。",
    "prompt": "实现 `solve(nums, k)`：返回每个长度为 k 的窗口中的最大值数组。窗口从下标 0 开始，每次右移一格。",
    "bug": "`i < nums.length - k` 少了最后一个窗口，应该写 `i <= nums.length - k`。",
    "code": "function solve(nums, k) {\n  const out = [];\n  for (let i = 0; i < nums.length - k; i++) {\n    out.push(Math.max(...nums.slice(i, i + k)));\n  }\n  return out;\n}",
    "tests": [
      {
        "args": [
          [
            1,
            3,
            -1,
            -3,
            5,
            3
          ],
          3
        ],
        "expected": [
          3,
          3,
          5,
          5
        ],
        "public": true,
        "label": "经典窗口"
      },
      {
        "args": [
          [
            2,
            1,
            5,
            3
          ],
          2
        ],
        "expected": [
          2,
          5,
          5
        ],
        "public": true,
        "label": "四元素窗口"
      },
      {
        "args": [
          [
            4,
            2,
            9,
            1,
            7
          ],
          1
        ],
        "expected": [
          4,
          2,
          9,
          1,
          7
        ],
        "public": false,
        "label": "k=1"
      }
    ],
    "hints": [
      "窗口数量是 n-k+1，循环从 0 到 n-k 都要包含。",
      "用 `i <= nums.length - k` 或 `i < nums.length - k + 1`。"
    ],
    "analysis": "最后一个窗口的左端是 n-k，右端是 n-1。写成 `< n-k` 会把左端 n-k 排除掉，正好少一个窗口。",
    "fixed": "function solve(nums, k) {\n  const out = [];\n  for (let i = 0; i <= nums.length - k; i++) {\n    out.push(Math.max(...nums.slice(i, i + k)));\n  }\n  return out;\n}"
  },
  {
    "minutes": 12,
    "source": "Eloquent JavaScript 4th · Ch.5；Head First JavaScript Programming 2nd · Ch.6",
    "public": true,
    "id": "h17",
    "level": "hard",
    "order": 53,
    "title": "0/1 背包",
    "summary": "容量转移用了当前行，物品会被重复选。",
    "prompt": "实现 `solve(items, capacity)`：`items` 是 `[weight, value]` 数组，每件物品最多选一次。返回不超过容量时的最大总价值。",
    "bug": "转移写成 `dp[i][c - w] + v`，用了当前行，等于允许同一件物品重复选。",
    "code": "function solve(items, capacity) {\n  const n = items.length;\n  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));\n  for (let i = 1; i <= n; i++) {\n    const [w, v] = items[i - 1];\n    for (let c = 0; c <= capacity; c++) {\n      dp[i][c] = dp[i - 1][c];\n      if (c >= w) dp[i][c] = Math.max(dp[i][c], dp[i][c - w] + v);\n    }\n  }\n  return dp[n][capacity];\n}",
    "tests": [
      {
        "args": [
          [
            [
              1,
              2
            ],
            [
              2,
              3
            ],
            [
              3,
              4
            ]
          ],
          5
        ],
        "expected": 7,
        "public": true,
        "label": "三件物品"
      },
      {
        "args": [
          [
            [
              2,
              3
            ],
            [
              3,
              4
            ],
            [
              4,
              5
            ],
            [
              5,
              6
            ]
          ],
          7
        ],
        "expected": 9,
        "public": true,
        "label": "容量 7"
      },
      {
        "args": [
          [
            [
              1,
              5
            ],
            [
              2,
              4
            ]
          ],
          3
        ],
        "expected": 9,
        "public": false,
        "label": "容量刚好两件"
      }
    ],
    "hints": [
      "0/1 背包的“不选”继承 `dp[i-1][c]`，“选”也必须从 `dp[i-1][c-w]` 转移。",
      "如果从 `dp[i][c-w]` 转移，当前物品会被重复使用，变成完全背包。"
    ],
    "analysis": "二维背包的两层循环中，`dp[i][c-w]` 已经考虑过第 i 件物品，继续加 v 会把它选多次。正确来源是上一行 `dp[i-1][c-w]`。",
    "fixed": "function solve(items, capacity) {\n  const n = items.length;\n  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));\n  for (let i = 1; i <= n; i++) {\n    const [w, v] = items[i - 1];\n    for (let c = 0; c <= capacity; c++) {\n      dp[i][c] = dp[i - 1][c];\n      if (c >= w) dp[i][c] = Math.max(dp[i][c], dp[i - 1][c - w] + v);\n    }\n  }\n  return dp[n][capacity];\n}"
  },
  {
    "minutes": 12,
    "source": "Eloquent JavaScript 4th · Ch.5；Head First JavaScript Programming 2nd · Ch.6",
    "public": true,
    "id": "h18",
    "level": "hard",
    "order": 54,
    "title": "课程安排",
    "summary": "课程入度减完后没有更新队列，后面的课永远进不了队。",
    "prompt": "实现 `solve(n, prereqs)`：共有 n 门课，编号 0 到 n-1；`prereqs` 中每条 `[a, b]` 表示修 b 之前必须先修 a。返回任意一个合法的学习顺序；如果有环，返回空数组。",
    "bug": "处理完一门课后没有把后继课程的入度减 1，也没有把入度变为 0 的课程入队。",
    "code": "function solve(n, prereqs) {\n  const adj = Array.from({ length: n }, () => []);\n  const indeg = new Array(n).fill(0);\n  for (const [a, b] of prereqs) {\n    adj[a].push(b);\n    indeg[b]++;\n  }\n  const queue = [];\n  for (let i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i);\n  const order = [];\n  while (queue.length) {\n    const cur = queue.shift();\n    order.push(cur);\n  }\n  return order.length === n ? order : [];\n}",
    "tests": [
      {
        "args": [
          4,
          [
            [
              0,
              1
            ],
            [
              0,
              2
            ],
            [
              1,
              3
            ],
            [
              2,
              3
            ]
          ]
        ],
        "expected": [
          0,
          1,
          2,
          3
        ],
        "public": true,
        "label": "菱形依赖"
      },
      {
        "args": [
          3,
          [
            [
              0,
              1
            ],
            [
              1,
              2
            ]
          ]
        ],
        "expected": [
          0,
          1,
          2
        ],
        "public": true,
        "label": "链式依赖"
      },
      {
        "args": [
          3,
          [
            [
              0,
              1
            ],
            [
              1,
              2
            ],
            [
              2,
              0
            ]
          ]
        ],
        "expected": [],
        "public": false,
        "label": "有环"
      }
    ],
    "hints": [
      "每次从队列取出一门课，都要遍历它的后继，把后继的入度减 1。",
      "后继入度变成 0 时，才把它加入队列。"
    ],
    "analysis": "拓扑排序的核心是“入度归零才入队”。只取队首却不减少后继入度，队列很快为空，order 长度不足 n，会被误判为有环。",
    "fixed": "function solve(n, prereqs) {\n  const adj = Array.from({ length: n }, () => []);\n  const indeg = new Array(n).fill(0);\n  for (const [a, b] of prereqs) {\n    adj[a].push(b);\n    indeg[b]++;\n  }\n  const queue = [];\n  for (let i = 0; i < n; i++) if (indeg[i] === 0) queue.push(i);\n  const order = [];\n  while (queue.length) {\n    const cur = queue.shift();\n    order.push(cur);\n    for (const next of adj[cur]) {\n      indeg[next]--;\n      if (indeg[next] === 0) queue.push(next);\n    }\n  }\n  return order.length === n ? order : [];\n}"
  }
]);

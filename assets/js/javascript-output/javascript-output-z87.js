/* z87 · JavaScript 输出实现场 +30（三档各 10），expected 由 Node 参考解真实运行。 */
(function(bank,tasks){if(!bank||!Array.isArray(bank.tasks))return;bank.tasks.push.apply(bank.tasks,tasks);bank.version="20261126z87";})(window.JS_OUTPUT_BANK,[
  {
    "id": "z87-o1",
    "level": "basic",
    "no": 37,
    "title": "1 到 n 求和",
    "subtitle": "闭区间求和",
    "brief": "把 1 到 n 的所有整数相加。",
    "goal": "读入整数 n，输出 1+2+…+n 的结果。",
    "input": "一行，一个整数 n（1 ≤ n ≤ 100000）。",
    "output": "一个整数。",
    "concepts": [
      "循环",
      "求和"
    ],
    "hints": [
      "从 1 累加到 n。",
      "n 很大时用公式 n*(n+1)/2。"
    ],
    "fastMs": 30,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "5",
        "expected": "15"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "100",
        "expected": "5050"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "1",
        "expected": "1"
      }
    ],
    "sampleStdin": "5",
    "sampleStdout": "15"
  },
  {
    "id": "z87-o2",
    "level": "basic",
    "no": 38,
    "title": "偶数个数",
    "subtitle": "遍历与取余",
    "brief": "数一数这串整数里有多少个偶数。",
    "goal": "读入一行空格分隔的整数，输出其中偶数的个数。",
    "input": "一行整数，至少一个。",
    "output": "一个整数。",
    "concepts": [
      "数组",
      "取余"
    ],
    "hints": [
      "n % 2 === 0 是偶数。",
      "负偶数也是偶数。"
    ],
    "fastMs": 30,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "1 2 3 4",
        "expected": "2"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "2 4 6",
        "expected": "3"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "1 3 5",
        "expected": "0"
      }
    ],
    "sampleStdin": "1 2 3 4",
    "sampleStdout": "2"
  },
  {
    "id": "z87-o3",
    "level": "basic",
    "no": 39,
    "title": "最大值",
    "subtitle": "别把方向搞反",
    "brief": "找出这一行整数中的最大值。",
    "goal": "读入一行空格分隔的整数，输出最大值。",
    "input": "一行整数，至少一个。",
    "output": "一个整数。",
    "concepts": [
      "数组",
      "比较"
    ],
    "hints": [
      "用第一个元素初始化。",
      "不要用 0 初始化，否则全负数会错。"
    ],
    "fastMs": 30,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "3 9 2",
        "expected": "9"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "-5 -1 -9",
        "expected": "-1"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "7",
        "expected": "7"
      }
    ],
    "sampleStdin": "3 9 2",
    "sampleStdout": "9"
  },
  {
    "id": "z87-o4",
    "level": "basic",
    "no": 40,
    "title": "最小值",
    "subtitle": "方向与最大值相反",
    "brief": "找出这一行整数中的最小值。",
    "goal": "读入一行空格分隔的整数，输出最小值。",
    "input": "一行整数，至少一个。",
    "output": "一个整数。",
    "concepts": [
      "数组",
      "比较"
    ],
    "hints": [
      "用 Math.min。",
      "全负数同样适用。"
    ],
    "fastMs": 30,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "3 9 2",
        "expected": "2"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "-5 -1 -9",
        "expected": "-9"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "-2 -8",
        "expected": "-8"
      }
    ],
    "sampleStdin": "3 9 2",
    "sampleStdout": "2"
  },
  {
    "id": "z87-o5",
    "level": "basic",
    "no": 41,
    "title": "平均数",
    "subtitle": "保留一位小数",
    "brief": "求这一行整数的平均数。",
    "goal": "读入一行空格分隔的整数，输出平均数，保留一位小数。",
    "input": "一行整数，至少一个。",
    "output": "一个数，保留一位小数。",
    "concepts": [
      "求和",
      "格式化"
    ],
    "hints": [
      "先求和再除以个数。",
      "用 toFixed(1) 输出一位小数。"
    ],
    "fastMs": 30,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "1 2 3",
        "expected": "2.0"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "2 4",
        "expected": "3.0"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "1 2 4",
        "expected": "2.3"
      }
    ],
    "sampleStdin": "1 2 3",
    "sampleStdout": "2.0"
  },
  {
    "id": "z87-o6",
    "level": "basic",
    "no": 42,
    "title": "阶乘",
    "subtitle": "0! 也是 1",
    "brief": "计算 n 的阶乘。",
    "goal": "读入整数 n，输出 n!。",
    "input": "一行，一个整数 n（0 ≤ n ≤ 12）。",
    "output": "一个整数。",
    "concepts": [
      "循环",
      "累乘"
    ],
    "hints": [
      "结果从 1 开始。",
      "0 的阶乘定义为 1。"
    ],
    "fastMs": 30,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "5",
        "expected": "120"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "0",
        "expected": "1"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "3",
        "expected": "6"
      }
    ],
    "sampleStdin": "5",
    "sampleStdout": "120"
  },
  {
    "id": "z87-o7",
    "level": "basic",
    "no": 43,
    "title": "斐波那契第 n 项",
    "subtitle": "递推入门",
    "brief": "输出斐波那契数列的第 n 项。",
    "goal": "读入 n，输出 F(n)，其中 F(1)=1,F(2)=1。",
    "input": "一行，一个整数 n（1 ≤ n ≤ 40）。",
    "output": "一个整数。",
    "concepts": [
      "递推",
      "循环"
    ],
    "hints": [
      "从 F(1)、F(2) 开始往后推。",
      "不要用递归重复计算。"
    ],
    "fastMs": 30,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "7",
        "expected": "13"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "1",
        "expected": "1"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "10",
        "expected": "55"
      }
    ],
    "sampleStdin": "7",
    "sampleStdout": "13"
  },
  {
    "id": "z87-o8",
    "level": "basic",
    "no": 44,
    "title": "最大公约数",
    "subtitle": "辗转相除",
    "brief": "求两个正整数的最大公约数。",
    "goal": "读入两个正整数 a b，输出它们的 gcd。",
    "input": "一行两个正整数。",
    "output": "一个整数。",
    "concepts": [
      "循环",
      "取余"
    ],
    "hints": [
      "反复做 a,b=b,a%b，直到 b=0。"
    ],
    "fastMs": 30,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "12 18",
        "expected": "6"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "7 13",
        "expected": "1"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "100 40",
        "expected": "20"
      }
    ],
    "sampleStdin": "12 18",
    "sampleStdout": "6"
  },
  {
    "id": "z87-o9",
    "level": "basic",
    "no": 45,
    "title": "质数个数",
    "subtitle": "从 2 数到 n",
    "brief": "统计 1 到 n 之间有多少个质数。",
    "goal": "读入 n，输出不超过 n 的质数个数。",
    "input": "一行，一个整数 n（1 ≤ n ≤ 1000）。",
    "output": "一个整数。",
    "concepts": [
      "循环",
      "质数判断"
    ],
    "hints": [
      "逐个判断 2..n。",
      "判断到平方根即可。"
    ],
    "fastMs": 50,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "10",
        "expected": "4"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "1",
        "expected": "0"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "20",
        "expected": "8"
      }
    ],
    "sampleStdin": "10",
    "sampleStdout": "4"
  },
  {
    "id": "z87-o10",
    "level": "basic",
    "no": 46,
    "title": "数位之和",
    "subtitle": "不断取末位",
    "brief": "求一个非负整数的各位数字之和。",
    "goal": "读入一个非负整数 n，输出它的数位和。",
    "input": "一行，一个整数 n（0 ≤ n ≤ 10^9）。",
    "output": "一个整数。",
    "concepts": [
      "循环",
      "取余"
    ],
    "hints": [
      "每次取 n%10，再除以 10。",
      "0 的数位和是 0。"
    ],
    "fastMs": 30,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "123",
        "expected": "6"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "0",
        "expected": "0"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "1001",
        "expected": "2"
      }
    ],
    "sampleStdin": "123",
    "sampleStdout": "6"
  },
  {
    "id": "z87-o11",
    "level": "intermediate",
    "no": 47,
    "title": "整数排序",
    "subtitle": "升序输出",
    "brief": "把一行整数按升序排列。",
    "goal": "读入一行空格分隔的整数，输出升序结果，用一个空格分隔。",
    "input": "一行整数。",
    "output": "排序后的整数序列。",
    "concepts": [
      "排序",
      "数组"
    ],
    "hints": [
      "数字排序要传比较函数 (a,b)=>a-b。",
      "不要依赖默认字典序。"
    ],
    "fastMs": 40,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "3 1 2",
        "expected": "1 2 3"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "10 2 1",
        "expected": "1 2 10"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "-1 0 -2",
        "expected": "-2 -1 0"
      }
    ],
    "sampleStdin": "3 1 2",
    "sampleStdout": "1 2 3"
  },
  {
    "id": "z87-o12",
    "level": "intermediate",
    "no": 48,
    "title": "去重并排序",
    "subtitle": "Set + sort",
    "brief": "去掉重复整数并升序输出。",
    "goal": "读入一行整数，输出去重后的升序序列，用一个空格分隔。",
    "input": "一行整数。",
    "output": "去重升序序列。",
    "concepts": [
      "Set",
      "排序"
    ],
    "hints": [
      "用 Set 去重。",
      "转数组后再排序。"
    ],
    "fastMs": 40,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "3 1 3 2",
        "expected": "1 2 3"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "1 1 1",
        "expected": "1"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "5 4 3",
        "expected": "3 4 5"
      }
    ],
    "sampleStdin": "3 1 3 2",
    "sampleStdout": "1 2 3"
  },
  {
    "id": "z87-o13",
    "level": "intermediate",
    "no": 49,
    "title": "变位词判断",
    "subtitle": "字母组成相同",
    "brief": "判断两行字符串是否互为变位词。",
    "goal": "读入两行字符串 a、b（忽略大小写），是变位词输出 yes，否则 no。",
    "input": "两行，每行一个字符串。",
    "output": "yes 或 no。",
    "concepts": [
      "字符串",
      "排序"
    ],
    "hints": [
      "都转小写并排序。",
      "长度不同直接 no。"
    ],
    "fastMs": 40,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "Listen\nSilent",
        "expected": "yes"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "aab\nabb",
        "expected": "no"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "abc\ncba",
        "expected": "yes"
      }
    ],
    "sampleStdin": "Listen\nSilent",
    "sampleStdout": "yes"
  },
  {
    "id": "z87-o14",
    "level": "intermediate",
    "no": 50,
    "title": "回文判断",
    "subtitle": "正着读反着读一样",
    "brief": "判断一行字符串是否为回文，忽略大小写和非字母数字。",
    "goal": "读入一行文本，若是回文输出 yes，否则 no。",
    "input": "一行文本。",
    "output": "yes 或 no。",
    "concepts": [
      "字符串",
      "双指针"
    ],
    "hints": [
      "保留字母数字并转小写。",
      "从两端向中间比较。"
    ],
    "fastMs": 40,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "A man, a plan, a canal: Panama",
        "expected": "yes"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "hello",
        "expected": "no"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "Was it a car or a cat I saw?",
        "expected": "yes"
      }
    ],
    "sampleStdin": "A man, a plan, a canal: Panama",
    "sampleStdout": "yes"
  },
  {
    "id": "z87-o15",
    "level": "intermediate",
    "no": 51,
    "title": "单词计数",
    "subtitle": "连续空格只算一个",
    "brief": "统计一行文本中的单词个数。",
    "goal": "读入一行文本，按空白切分，输出单词个数。",
    "input": "一行文本。",
    "output": "一个整数。",
    "concepts": [
      "字符串",
      "正则"
    ],
    "hints": [
      "用 trim 去掉首尾空白。",
      "用 /\\s+/ 切分。"
    ],
    "fastMs": 40,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "hello  world",
        "expected": "2"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "  a b  ",
        "expected": "2"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "",
        "expected": "0"
      }
    ],
    "sampleStdin": "hello  world",
    "sampleStdout": "2"
  },
  {
    "id": "z87-o16",
    "level": "intermediate",
    "no": 52,
    "title": "矩阵每行求和",
    "subtitle": "二维数组",
    "brief": "输出矩阵每一行元素之和。",
    "goal": "第一行读入 m n，随后 m 行每行 n 个整数，输出每行的和。",
    "input": "第一行 m n，随后 m 行数据。",
    "output": "m 个整数，每行一个。",
    "concepts": [
      "矩阵",
      "求和"
    ],
    "hints": [
      "按行读取。",
      "每行求和后输出。"
    ],
    "fastMs": 40,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "2 3\n1 2 3\n4 5 6",
        "expected": "6\n15"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "1 1\n7",
        "expected": "7"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "3 2\n1 2\n3 4\n5 6",
        "expected": "3\n7\n11"
      }
    ],
    "sampleStdin": "2 3\n1 2 3\n4 5 6",
    "sampleStdout": "6\n15"
  },
  {
    "id": "z87-o17",
    "level": "intermediate",
    "no": 53,
    "title": "矩阵转置",
    "subtitle": "行列互换",
    "brief": "输出矩阵的转置。",
    "goal": "第一行读 m n，随后 m 行每行 n 个整数，输出 n 行 m 列的转置矩阵。",
    "input": "第一行 m n，随后矩阵。",
    "output": "转置后的矩阵。",
    "concepts": [
      "矩阵",
      "下标"
    ],
    "hints": [
      "新矩阵第 j 行是原矩阵第 j 列。"
    ],
    "fastMs": 40,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "2 3\n1 2 3\n4 5 6",
        "expected": "1 4\n2 5\n3 6"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "2 2\n1 2\n3 4",
        "expected": "1 3\n2 4"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "1 3\n7 8 9",
        "expected": "7\n8\n9"
      }
    ],
    "sampleStdin": "2 3\n1 2 3\n4 5 6",
    "sampleStdout": "1 4\n2 5\n3 6"
  },
  {
    "id": "z87-o18",
    "level": "intermediate",
    "no": 54,
    "title": "二分查找",
    "subtitle": "升序数组找下标",
    "brief": "在升序数组中查找 target 的下标。",
    "goal": "第一行读 n 和 target，第二行读 n 个升序整数；找到输出下标（从 0 开始），否则 -1。",
    "input": "第一行 n target，第二行数组。",
    "output": "下标或 -1。",
    "concepts": [
      "二分",
      "边界"
    ],
    "hints": [
      "lo<=hi，mid 后排除。",
      "更新 hi=mid-1 或 lo=mid+1。"
    ],
    "fastMs": 40,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "4 5\n1 3 5 7",
        "expected": "2"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "4 8\n1 3 5 7",
        "expected": "-1"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "0 3\n",
        "expected": "-1"
      }
    ],
    "sampleStdin": "4 5\n1 3 5 7",
    "sampleStdout": "2"
  },
  {
    "id": "z87-o19",
    "level": "intermediate",
    "no": 55,
    "title": "括号平衡",
    "subtitle": "栈的典型应用",
    "brief": "判断三种括号是否正确嵌套。",
    "goal": "读入一行只含 ()[]{} 的字符串，平衡输出 yes，否则 no。",
    "input": "一行括号字符串。",
    "output": "yes 或 no。",
    "concepts": [
      "栈",
      "映射"
    ],
    "hints": [
      "左括号入栈。",
      "右括号与栈顶比较。"
    ],
    "fastMs": 40,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "({[]})",
        "expected": "yes"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "([)]",
        "expected": "no"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "((",
        "expected": "no"
      }
    ],
    "sampleStdin": "({[]})",
    "sampleStdout": "yes"
  },
  {
    "id": "z87-o20",
    "level": "intermediate",
    "no": 56,
    "title": "两数之和下标",
    "subtitle": "哈希表",
    "brief": "找出和为 target 的两个不同下标。",
    "goal": "第一行读 n target，第二行读 n 个整数；输出两个下标（小的在前），找不到输出 -1。",
    "input": "第一行 n target，第二行数组。",
    "output": "两个下标或 -1。",
    "concepts": [
      "哈希表",
      "下标"
    ],
    "hints": [
      "存值到下标。",
      "命中时返回两个不同下标。"
    ],
    "fastMs": 40,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "4 9\n2 7 11 15",
        "expected": "0 1"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "2 6\n3 3",
        "expected": "0 1"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "2 5\n1 2",
        "expected": "-1"
      }
    ],
    "sampleStdin": "4 9\n2 7 11 15",
    "sampleStdout": "0 1"
  },
  {
    "id": "z87-o21",
    "level": "challenge",
    "no": 57,
    "title": "最长递增子序列",
    "subtitle": "动态规划",
    "brief": "求最长严格递增子序列长度。",
    "goal": "读入一行整数，输出 LIS 长度。",
    "input": "一行整数。",
    "output": "一个整数。",
    "concepts": [
      "动态规划"
    ],
    "hints": [
      "dp[i] 表示以 i 结尾的 LIS。",
      "最后取 max(dp)。"
    ],
    "fastMs": 60,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "6 1 2 3 0",
        "expected": "3"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "2 2 2",
        "expected": "1"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "5",
        "expected": "1"
      }
    ],
    "sampleStdin": "6 1 2 3 0",
    "sampleStdout": "3"
  },
  {
    "id": "z87-o22",
    "level": "challenge",
    "no": 58,
    "title": "硬币找零",
    "subtitle": "完全背包",
    "brief": "用最少硬币凑出金额。",
    "goal": "第一行读硬币面额，第二行读金额；输出最少硬币数，凑不出输出 -1。",
    "input": "第一行空格分隔的硬币面额，第二行金额。",
    "output": "一个整数。",
    "concepts": [
      "动态规划",
      "最值"
    ],
    "hints": [
      "dp[0]=0。",
      "dp[i]=min(dp[i-c]+1)。"
    ],
    "fastMs": 60,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "1 2 5\n11",
        "expected": "3"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "2\n3",
        "expected": "-1"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "1\n0",
        "expected": "0"
      }
    ],
    "sampleStdin": "1 2 5\n11",
    "sampleStdout": "3"
  },
  {
    "id": "z87-o23",
    "level": "challenge",
    "no": 59,
    "title": "编辑距离",
    "subtitle": "插入删除替换",
    "brief": "求把 a 变成 b 的最少编辑次数。",
    "goal": "读入两行字符串 a、b，输出编辑距离。",
    "input": "两行字符串。",
    "output": "一个整数。",
    "concepts": [
      "动态规划",
      "字符串"
    ],
    "hints": [
      "dp[i][0]=i，dp[0][j]=j。",
      "不等时取三种操作的最小值。"
    ],
    "fastMs": 60,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "kitten\nsitting",
        "expected": "3"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "abc\nabc",
        "expected": "0"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "\nabc",
        "expected": "3"
      }
    ],
    "sampleStdin": "kitten\nsitting",
    "sampleStdout": "3"
  },
  {
    "id": "z87-o24",
    "level": "challenge",
    "no": 60,
    "title": "合并区间",
    "subtitle": "按左端点排序",
    "brief": "合并所有重叠区间。",
    "goal": "第一行读 n，随后 n 行每行 l r；输出合并后的区间，每行一个。",
    "input": "第一行 n，随后 n 行区间。",
    "output": "合并后的区间，按左端点升序。",
    "concepts": [
      "排序",
      "区间"
    ],
    "hints": [
      "按左端点排序。",
      "右端点取 max。"
    ],
    "fastMs": 60,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "3\n1 3\n2 6\n8 10",
        "expected": "1 6\n8 10"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "2\n1 10\n2 3",
        "expected": "1 10"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "2\n1 2\n3 4",
        "expected": "1 2\n3 4"
      }
    ],
    "sampleStdin": "3\n1 3\n2 6\n8 10",
    "sampleStdout": "1 6\n8 10"
  },
  {
    "id": "z87-o25",
    "level": "challenge",
    "no": 61,
    "title": "最大子数组和",
    "subtitle": "Kadane",
    "brief": "求连续子数组的最大和。",
    "goal": "读入一行整数，输出最大连续子段和。",
    "input": "一行整数。",
    "output": "一个整数。",
    "concepts": [
      "动态规划",
      "贪心"
    ],
    "hints": [
      "cur=max(x,cur+x)。",
      "全负数也成立。"
    ],
    "fastMs": 60,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "-2 1 -3 4 -1 2 1 -5 4",
        "expected": "6"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "-3 -1 -2",
        "expected": "-1"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "1 2 3",
        "expected": "6"
      }
    ],
    "sampleStdin": "-2 1 -3 4 -1 2 1 -5 4",
    "sampleStdout": "6"
  },
  {
    "id": "z87-o26",
    "level": "challenge",
    "no": 62,
    "title": "频率前 K 高",
    "subtitle": "Map + 排序",
    "brief": "输出出现次数最多的 k 个值。",
    "goal": "第一行读 n k，第二行读 n 个整数；输出频率最高的 k 个值，按值升序。",
    "input": "第一行 n k，第二行数组。",
    "output": "k 个整数，空格分隔。",
    "concepts": [
      "Map",
      "排序"
    ],
    "hints": [
      "统计频次。",
      "按频次降序、值升序排序。"
    ],
    "fastMs": 60,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "6 2\n1 1 2 2 2 3",
        "expected": "2 1"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "4 1\n4 4 5 5",
        "expected": "4"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "1 1\n1",
        "expected": "1"
      }
    ],
    "sampleStdin": "6 2\n1 1 2 2 2 3",
    "sampleStdout": "2 1"
  },
  {
    "id": "z87-o27",
    "level": "challenge",
    "no": 63,
    "title": "螺旋矩阵",
    "subtitle": "四边界收缩",
    "brief": "按顺时针螺旋顺序输出矩阵元素。",
    "goal": "第一行读 m n，随后 m 行矩阵；按螺旋顺序输出一行元素。",
    "input": "第一行 m n，随后矩阵。",
    "output": "螺旋顺序的整数，空格分隔。",
    "concepts": [
      "矩阵",
      "边界"
    ],
    "hints": [
      "维护上下左右四个边界。",
      "每走完一条边收缩边界。"
    ],
    "fastMs": 70,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "3 3\n1 2 3\n4 5 6\n7 8 9",
        "expected": "1 2 3 6 9 8 7 4 5"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "2 2\n1 2\n3 4",
        "expected": "1 2 4 3"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "1 4\n1 2 3 4",
        "expected": "1 2 3 4"
      }
    ],
    "sampleStdin": "3 3\n1 2 3\n4 5 6\n7 8 9",
    "sampleStdout": "1 2 3 6 9 8 7 4 5"
  },
  {
    "id": "z87-o28",
    "level": "challenge",
    "no": 64,
    "title": "深层扁平化",
    "subtitle": "递归展开",
    "brief": "把嵌套数组展开成一维。",
    "goal": "读入一行 JS 数组字面量（只含数字和方括号），输出扁平化后空格分隔的数字。",
    "input": "一行数组字面量。",
    "output": "扁平化后的数字。",
    "concepts": [
      "递归",
      "数组"
    ],
    "hints": [
      "遇到数组递归。",
      "不要只展开一层。"
    ],
    "fastMs": 60,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "[1,[2,[3,[4]]]]",
        "expected": "1 2 3 4"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "[[1],[2,3]]",
        "expected": "1 2 3"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "[]",
        "expected": ""
      }
    ],
    "sampleStdin": "[1,[2,[3,[4]]]]",
    "sampleStdout": "1 2 3 4"
  },
  {
    "id": "z87-o29",
    "level": "challenge",
    "no": 65,
    "title": "快速排序",
    "subtitle": "分治",
    "brief": "用快速排序输出升序结果。",
    "goal": "读入一行整数，输出升序序列。",
    "input": "一行整数。",
    "output": "升序序列，空格分隔。",
    "concepts": [
      "分治",
      "递归"
    ],
    "hints": [
      "选 pivot 分区。",
      "重复元素要单独收集。"
    ],
    "fastMs": 60,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "3 1 2 3",
        "expected": "1 2 3 3"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "5 4 3 2 1",
        "expected": "1 2 3 4 5"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "1",
        "expected": "1"
      }
    ],
    "sampleStdin": "3 1 2 3",
    "sampleStdout": "1 2 3 3"
  },
  {
    "id": "z87-o30",
    "level": "challenge",
    "no": 66,
    "title": "逆波兰表达式",
    "subtitle": "后缀表达式求值",
    "brief": "计算逆波兰表达式的值。",
    "goal": "读入一行空格分隔的 token（整数和 + - * /），输出计算结果（除法向零取整）。",
    "input": "一行 token。",
    "output": "一个整数。",
    "concepts": [
      "栈",
      "表达式"
    ],
    "hints": [
      "数字入栈。",
      "遇运算符弹出两个数，先弹出的是右操作数。"
    ],
    "fastMs": 60,
    "starter": "// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n",
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "2 1 + 3 *",
        "expected": "9"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "4 13 5 / +",
        "expected": "6"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "10 6 9 3 + -11 * / * 17 + 5 +",
        "expected": "22"
      }
    ],
    "sampleStdin": "2 1 + 3 *",
    "sampleStdout": "9"
  }
]);

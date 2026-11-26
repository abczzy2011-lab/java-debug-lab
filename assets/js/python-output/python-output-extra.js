/* 扩展题库 · 12 题 / 每档 4 题。所有 expected 由三语言参考解真实运行对齐。 */
(function (bank, tasks) {
  if (!bank || !Array.isArray(bank.tasks)) return;
  bank.tasks.push.apply(bank.tasks, tasks);
  bank.version = '20261126z76';
})(window.PYTHON_OUTPUT_BANK, [
  {
    "id": "b7",
    "level": "basic",
    "title": "元音统计",
    "subtitle": "大小写都要算进去",
    "brief": "统计字符串里 a/e/i/o/u 的数量。",
    "goal": "读入一行文本，统计其中英文字母 a、e、i、o、u 的出现次数，不区分大小写；其它字符忽略。",
    "input": "一行文本，可能包含空格、标点和大小写字母。",
    "output": "一个整数，表示元音字母总数。",
    "concepts": [
      "字符串遍历",
      "大小写",
      "字符判断"
    ],
    "hints": [
      "先把字符统一转成小写，再判断是不是 aeiou。",
      "不要用正则的全局替换来“数个数”，遍历字符最稳。"
    ],
    "fastMs": 50,
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "Hello World",
        "expected": "3"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "Python Programming",
        "expected": "4"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "AEIOU",
        "expected": "5"
      }
    ],
    "sampleStdin": "Hello World",
    "sampleStdout": "3",
    "no": 19,
    "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
    "reference": "import sys\ns = sys.stdin.readline().rstrip('\\n')\nprint(sum(1 for c in s.lower() if c in 'aeiou'))"
  },
  {
    "id": "b8",
    "level": "basic",
    "title": "区间求和",
    "subtitle": "前缀和的第一课",
    "brief": "多次查询数组区间的和。",
    "goal": "第一行读入 n 和 q，第二行读入 n 个整数。接下来 q 行，每行两个整数 l、r（下标从 1 开始，包含两端），输出每个区间的元素和。",
    "input": "第一行 n q；第二行 n 个整数；随后 q 行，每行 l r。",
    "output": "共 q 行，每行一个区间和。",
    "concepts": [
      "前缀和",
      "数组",
      "long"
    ],
    "hints": [
      "先构造前缀和数组 pre[i] = 前 i 个元素之和。",
      "区间 [l, r] 的和是 pre[r] - pre[l - 1]，注意 l=1 时减的是 pre[0]。"
    ],
    "fastMs": 60,
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "3 2\n1 2 3\n1 2\n2 3",
        "expected": "3\n5"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "5 3\n2 4 1 7 5\n1 3\n2 5\n4 4",
        "expected": "7\n17\n7"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "1 1\n10\n1 1",
        "expected": "10"
      }
    ],
    "sampleStdin": "3 2\n1 2 3\n1 2\n2 3",
    "sampleStdout": "3\n5",
    "no": 20,
    "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
    "reference": "import sys\ndata = sys.stdin.read().split()\np = 0\nn = int(data[p]); q = int(data[p+1]); p += 2\nnums = list(map(int, data[p:p+n])); p += n\npre = [0] * (n + 1)\nfor i, v in enumerate(nums, 1):\n    pre[i] = pre[i-1] + v\nout = []\nfor _ in range(q):\n    l = int(data[p]); r = int(data[p+1]); p += 2\n    out.append(str(pre[r] - pre[l-1]))\nprint('\\n'.join(out))"
  },
  {
    "id": "b9",
    "level": "basic",
    "title": "矩阵对角线差",
    "subtitle": "两条对角线各自求和",
    "brief": "求主对角线与副对角线之和的绝对差。",
    "goal": "读入 n，随后读入 n 行、每行 n 个整数，组成方阵。求主对角线元素之和与副对角线元素之和，输出两者之差的绝对值。",
    "input": "第一行 n；随后 n 行，每行 n 个整数。",
    "output": "一个整数，表示两条对角线和之差的绝对值。",
    "concepts": [
      "二维数组",
      "下标",
      "Math.abs"
    ],
    "hints": [
      "主对角线是 matrix[i][i]，副对角线是 matrix[i][n-1-i]。",
      "两条对角线在中心格会重合，如果题目要求“不重复计算”，需要单独判断；本题按各自求和再相减。"
    ],
    "fastMs": 60,
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "2\n1 2\n7 4",
        "expected": "4"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "3\n1 2 3\n4 9 6\n7 8 5",
        "expected": "4"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n13 14 15 16",
        "expected": "0"
      }
    ],
    "sampleStdin": "2\n1 2\n7 4",
    "sampleStdout": "4",
    "no": 21,
    "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
    "reference": "import sys\ndata = list(map(int, sys.stdin.read().split()))\nn = data[0]\nm = [data[1+i*n:1+(i+1)*n] for i in range(n)]\nd1 = sum(m[i][i] for i in range(n))\nd2 = sum(m[i][n-1-i] for i in range(n))\nprint(abs(d1 - d2))"
  },
  {
    "id": "b10",
    "level": "basic",
    "title": "单词首字母大写",
    "subtitle": "标题格式不是全部大写",
    "brief": "把每个单词改成首字母大写、其余小写。",
    "goal": "读入一行由空格分隔的单词，把每个单词的第一个字母转成大写，其余字母转成小写，再用单个空格连接输出。",
    "input": "一行文本，单词之间可能有一个或多个空格。",
    "output": "一行，处理后的标题格式文本。",
    "concepts": [
      "split",
      "大小写",
      "StringBuilder"
    ],
    "hints": [
      "先 trim，再用连续空白拆分，避免开头空单词。",
      "首字母用 charAt(0) 转大写，其余部分用 substring(1).toLowerCase()。"
    ],
    "fastMs": 50,
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "hello world",
        "expected": "Hello World"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "jAVA is FUN",
        "expected": "Java Is Fun"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "a",
        "expected": "A"
      }
    ],
    "sampleStdin": "hello world",
    "sampleStdout": "Hello World",
    "no": 22,
    "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
    "reference": "import sys\nwords = sys.stdin.read().strip().split()\nprint(' '.join(w[:1].upper() + w[1:].lower() for w in words))"
  },
  {
    "id": "i7",
    "level": "intermediate",
    "title": "斐波那契第 n 项",
    "subtitle": "用 long 接住增长",
    "brief": "求 1, 1, 2, 3, 5… 的第 n 项。",
    "goal": "读入整数 n（1 ≤ n ≤ 50），输出斐波那契数列的第 n 项。规定第 1 项和第 2 项都是 1。",
    "input": "一行，一个整数 n。",
    "output": "一个整数，表示第 n 项。",
    "concepts": [
      "递推",
      "long",
      "变量交换"
    ],
    "hints": [
      "用 a、b 两个变量滚动，不要开一个巨大的数组。",
      "第 50 项已经超过 int 范围，必须用 long（Python 会自动扩展）。"
    ],
    "fastMs": 50,
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "10",
        "expected": "55"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "20",
        "expected": "6765"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "50",
        "expected": "12586269025"
      }
    ],
    "sampleStdin": "10",
    "sampleStdout": "55",
    "no": 23,
    "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
    "reference": "import sys\nn = int(sys.stdin.read().strip())\na = b = 1\nfor _ in range(3, n + 1):\n    a, b = b, a + b\nprint(b)"
  },
  {
    "id": "i8",
    "level": "intermediate",
    "title": "括号匹配",
    "subtitle": "后进先出的栈",
    "brief": "判断括号是否按正确顺序闭合。",
    "goal": "读入一行只包含 ()[]{} 的字符串，判断括号是否合法配对：每个左括号都要由同类型的右括号按后进先出的顺序闭合。合法输出 YES，否则输出 NO。",
    "input": "一行括号字符串，长度不超过 100。",
    "output": "YES 或 NO。",
    "concepts": [
      "栈",
      "括号匹配",
      "边界"
    ],
    "hints": [
      "遇到左括号压栈，遇到右括号检查栈顶是否同类。",
      "扫描结束后栈必须为空；栈空时遇到右括号也要直接判 NO。"
    ],
    "fastMs": 50,
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "([])",
        "expected": "YES"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "([)]",
        "expected": "NO"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "{[]}",
        "expected": "YES"
      }
    ],
    "sampleStdin": "([])",
    "sampleStdout": "YES",
    "no": 24,
    "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
    "reference": "import sys\ns = sys.stdin.readline().strip()\npairs = {')': '(', ']': '[', '}': '{'}\nstack = []\nok = True\nfor ch in s:\n    if ch in '([{':\n        stack.append(ch)\n    elif ch in ')]}':\n        if not stack or stack[-1] != pairs[ch]:\n            ok = False\n            break\n        stack.pop()\nif stack:\n    ok = False\nprint('YES' if ok else 'NO')"
  },
  {
    "id": "i9",
    "level": "intermediate",
    "title": "质因数分解",
    "subtitle": "从最小的因子开始除",
    "brief": "把整数拆成质因子的乘积。",
    "goal": "读入整数 n（2 ≤ n ≤ 10^9），输出它的质因数分解式。质因子从小到大排列，指数为 1 时省略 ^1，因子之间用 * 连接。",
    "input": "一行，一个整数 n。",
    "output": "一行分解式，例如 360 输出 2^3*3^2*5。",
    "concepts": [
      "质数",
      "循环",
      "指数"
    ],
    "hints": [
      "从 p=2 开始试除，除完一个因子后继续用同一个 p 除。",
      "循环条件写到 p*p <= n 即可；最后如果 n>1，它本身就是一个质因子。"
    ],
    "fastMs": 50,
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "360",
        "expected": "2^3*3^2*5"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "97",
        "expected": "97"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "1000",
        "expected": "2^3*5^3"
      }
    ],
    "sampleStdin": "360",
    "sampleStdout": "2^3*3^2*5",
    "no": 25,
    "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
    "reference": "import sys\nn = int(sys.stdin.read().strip())\nparts = []\np = 2\nwhile p * p <= n:\n    if n % p == 0:\n        e = 0\n        while n % p == 0:\n            n //= p\n            e += 1\n        parts.append(f'{p}^{e}' if e > 1 else str(p))\n    p += 1\nif n > 1:\n    parts.append(str(n))\nprint('*'.join(parts))"
  },
  {
    "id": "i10",
    "level": "intermediate",
    "title": "约瑟夫环",
    "subtitle": "报到 k 的人出列",
    "brief": "求最后留下的编号。",
    "goal": "n 个人围成一圈，编号 1 到 n。从 1 号开始报数，报到 k 的人出列，下一个人重新从 1 报数。输出最后留下的人的编号。",
    "input": "一行两个整数 n 和 k（1 ≤ n ≤ 100，1 ≤ k ≤ 20）。",
    "output": "一个整数，表示最后留下的编号。",
    "concepts": [
      "模拟",
      "列表",
      "取模"
    ],
    "hints": [
      "用列表保存还在圈里的人，当前下标 idx 从 0 开始。",
      "每次出列的人下标是 (idx + k - 1) % size；删除后如果 idx 到了末尾，要绕回 0。"
    ],
    "fastMs": 50,
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "5 2",
        "expected": "3"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "7 3",
        "expected": "4"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "10 4",
        "expected": "5"
      }
    ],
    "sampleStdin": "5 2",
    "sampleStdout": "3",
    "no": 26,
    "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
    "reference": "import sys\ndata = list(map(int, sys.stdin.read().split()))\nn, k = data\npeople = list(range(1, n + 1))\nidx = 0\nwhile len(people) > 1:\n    idx = (idx + k - 1) % len(people)\n    people.pop(idx)\nprint(people[0])"
  },
  {
    "id": "c7",
    "level": "challenge",
    "title": "最长递增子序列",
    "subtitle": "不要求连续，只要求递增",
    "brief": "求最长严格递增子序列的长度。",
    "goal": "读入 n 和 n 个整数，求最长严格递增子序列的长度。子序列不要求在原数组中连续，但下标必须递增，且相邻值严格变大。",
    "input": "第一行 n；第二行 n 个整数。",
    "output": "一个整数，表示最长递增子序列长度。",
    "concepts": [
      "动态规划",
      "子序列",
      "O(n²)"
    ],
    "hints": [
      "dp[i] 表示以第 i 个元素结尾的最长递增子序列长度。",
      "对每个 i 扫描 j<i，若 nums[j] < nums[i]，就用 dp[j]+1 更新 dp[i]。"
    ],
    "fastMs": 60,
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "8\n10 9 2 5 3 7 101 18",
        "expected": "4"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "6\n0 1 0 3 2 3",
        "expected": "4"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "4\n7 7 7 7",
        "expected": "1"
      }
    ],
    "sampleStdin": "8\n10 9 2 5 3 7 101 18",
    "sampleStdout": "4",
    "no": 27,
    "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
    "reference": "import sys\ndata = list(map(int, sys.stdin.read().split()))\nn = data[0]\nnums = data[1:1+n]\ndp = [1] * n\nbest = 0\nfor i in range(n):\n    for j in range(i):\n        if nums[j] < nums[i]:\n            dp[i] = max(dp[i], dp[j] + 1)\n    best = max(best, dp[i])\nprint(best)"
  },
  {
    "id": "c8",
    "level": "challenge",
    "title": "滑动窗口最大值",
    "subtitle": "每个窗口单独取最大",
    "brief": "输出每个长度为 k 的窗口的最大值。",
    "goal": "读入 n、k 和长度为 n 的数组，窗口从下标 0 开始每次向右滑动一格。输出每个长度为 k 的窗口中的最大值，用单个空格分隔。",
    "input": "第一行 n k；第二行 n 个整数（k ≤ n）。",
    "output": "一行，共 n-k+1 个最大值。",
    "concepts": [
      "滑动窗口",
      "区间最值",
      "边界"
    ],
    "hints": [
      "先写一个窗口内求最大值的循环，再让窗口整体右移。",
      "窗口右下标的极限是 n-1，循环条件写 i <= n-k。"
    ],
    "fastMs": 60,
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "6 3\n1 3 -1 -3 5 3",
        "expected": "3 3 5 5"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "4 2\n2 1 5 3",
        "expected": "2 5 5"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "5 1\n4 2 9 1 7",
        "expected": "4 2 9 1 7"
      }
    ],
    "sampleStdin": "6 3\n1 3 -1 -3 5 3",
    "sampleStdout": "3 3 5 5",
    "no": 28,
    "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
    "reference": "import sys\ndata = list(map(int, sys.stdin.read().split()))\nn, k = data[0], data[1]\nnums = data[2:2+n]\nout = []\nfor i in range(n - k + 1):\n    out.append(str(max(nums[i:i+k])))\nprint(' '.join(out))"
  },
  {
    "id": "c9",
    "level": "challenge",
    "title": "编辑距离",
    "subtitle": "增删改各算一步",
    "brief": "求两个字符串之间的最小编辑距离。",
    "goal": "读入两行字符串 a 和 b，允许插入、删除、替换一个字符，求把 a 变成 b 的最少操作次数。",
    "input": "第一行字符串 a；第二行字符串 b。",
    "output": "一个整数，表示最小编辑距离。",
    "concepts": [
      "二维 DP",
      "字符串",
      "边界"
    ],
    "hints": [
      "dp[i][j] 表示 a 的前 i 个字符变成 b 的前 j 个字符的最少操作数。",
      "初始化第一行和第一列；字符不同时取 min(删除, 插入, 替换)+1。"
    ],
    "fastMs": 80,
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "horse\nros",
        "expected": "3"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "intention\nexecution",
        "expected": "5"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "abc\nabc",
        "expected": "0"
      }
    ],
    "sampleStdin": "horse\nros",
    "sampleStdout": "3",
    "no": 29,
    "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
    "reference": "import sys\nlines = sys.stdin.read().splitlines()\na = lines[0] if lines else ''\nb = lines[1] if len(lines) > 1 else ''\nm, n = len(a), len(b)\ndp = [[0] * (n + 1) for _ in range(m + 1)]\nfor i in range(m + 1):\n    dp[i][0] = i\nfor j in range(n + 1):\n    dp[0][j] = j\nfor i in range(1, m + 1):\n    for j in range(1, n + 1):\n        if a[i-1] == b[j-1]:\n            dp[i][j] = dp[i-1][j-1]\n        else:\n            dp[i][j] = min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]) + 1\nprint(dp[m][n])"
  },
  {
    "id": "c10",
    "level": "challenge",
    "title": "0/1 背包",
    "subtitle": "每件物品只能选一次",
    "brief": "在容量限制下选物品，使总价值最大。",
    "goal": "第一行读入 n 和容量 cap，随后 n 行每行两个整数 weight、value。每件物品最多选一次，求不超过容量时能获得的最大总价值。",
    "input": "第一行 n cap；随后 n 行，每行 weight value。",
    "output": "一个整数，表示最大总价值。",
    "concepts": [
      "二维 DP",
      "背包",
      "容量"
    ],
    "hints": [
      "dp[i][c] 表示前 i 件物品、容量 c 时的最大价值。",
      "每件物品要么不选（继承 dp[i-1][c]），要么选（dp[i-1][c-w]+v）。"
    ],
    "fastMs": 80,
    "testCases": [
      {
        "label": "公开样例",
        "stdin": "3 5\n1 2\n2 3\n3 4",
        "expected": "7"
      },
      {
        "label": "隐藏用例 1",
        "stdin": "4 7\n2 3\n3 4\n4 5\n5 6",
        "expected": "9"
      },
      {
        "label": "隐藏用例 2",
        "stdin": "2 3\n1 5\n2 4",
        "expected": "9"
      }
    ],
    "sampleStdin": "3 5\n1 2\n2 3\n3 4",
    "sampleStdout": "7",
    "no": 30,
    "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
    "reference": "import sys\ndata = list(map(int, sys.stdin.read().split()))\nn, cap = data[0], data[1]\nw = [0] * n\nv = [0] * n\np = 2\nfor i in range(n):\n    w[i] = data[p]; v[i] = data[p+1]; p += 2\ndp = [[0] * (cap + 1) for _ in range(n + 1)]\nfor i in range(1, n + 1):\n    for c in range(cap + 1):\n        dp[i][c] = dp[i-1][c]\n        if c >= w[i-1]:\n            dp[i][c] = max(dp[i][c], dp[i-1][c-w[i-1]] + v[i-1])\nprint(dp[n][cap])"
  }
]);

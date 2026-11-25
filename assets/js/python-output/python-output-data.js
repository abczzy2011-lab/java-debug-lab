/* Python 输出实现场 · 18 题 / 54 组测试。数据由题库生成器产出，勿手改 expected。 */
window.PYTHON_OUTPUT_BANK = {
  "version": "20261125z73",
  "title": "Python 输出实现场",
  "levels": [
    {
      "id": "basic",
      "name": "基础",
      "kicker": "FOUNDATION",
      "desc": "先把输入读对，把空格、换行和 Python 的格式化输出控制对；这一步不靠猜。"
    },
    {
      "id": "intermediate",
      "name": "进阶",
      "kicker": "STRUCTURE",
      "desc": "需要自己组织循环、列表、字典或递推关系；隐藏用例会换参数。"
    },
    {
      "id": "challenge",
      "name": "挑战",
      "kicker": "EDGE CASES",
      "desc": "矩阵、栈、编码与区间合并；实现顺序和边界会直接改变输出。"
    }
  ],
  "rules": {
    "correctness": 85,
    "speed": 15,
    "normalize": "逐行比较：忽略每行行尾空格和文件末尾空行；行首空格、空行位置、大小写都保留。",
    "speedRule": "三组用例全部通过后才计入速度分。平均运行时间不超过该题基准值得 15 分，达到 3 倍基准值时速度分为 0。",
    "msRule": "毫秒由本地后端从启动 CPython 到进程退出计时，不含 py_compile 语法检查、HTTP 传输和浏览器渲染。"
  },
  "tasks": [
    {
      "id": "b1",
      "level": "basic",
      "no": 1,
      "title": "数字阶梯",
      "subtitle": "从一行一个数开始",
      "brief": "把 1 到 n 排成逐行增长的阶梯。",
      "goal": "读入整数 n，输出 n 行数字阶梯：第 i 行包含从 1 到 i 的所有整数，数字之间用一个空格分隔，行末不要多输出空格。",
      "hints": [
        "外层循环控制行号，内层循环控制这一行打印到几。",
        "用列表收集这一行的数字，再 join 成字符串，能避免行末多空格。"
      ],
      "input": "一行，一个整数 n（1 ≤ n ≤ 9）。",
      "output": "共 n 行；第 i 行是 1 到 i 的数字序列。",
      "concepts": [
        "for 循环",
        "join",
        "空格"
      ],
      "fastMs": 60,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "3",
          "expected": "1\n1 2\n1 2 3"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "5",
          "expected": "1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "7",
          "expected": "1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5\n1 2 3 4 5 6\n1 2 3 4 5 6 7"
        }
      ],
      "sampleStdin": "3",
      "sampleStdout": "1\n1 2\n1 2 3"
    },
    {
      "id": "b2",
      "level": "basic",
      "no": 2,
      "title": "星号三角",
      "subtitle": "前导空格与奇数增长",
      "brief": "用星号画一个顶角朝上的等腰三角形。",
      "goal": "读入奇数 n，输出高度为 n 的星号三角形。第 1 行 1 颗星，之后每行多 2 颗；每行左侧补足空格，让星号整体居中。",
      "hints": [
        "行号从 0 开始时，前导空格是 n-i-1，星号数是 2*i+1。",
        "Python 的字符串乘法可以直接生成重复的空格和星号。"
      ],
      "input": "一行，一个奇数 n（3 ≤ n ≤ 9）。",
      "output": "共 n 行；第 i 行有 n-i 个空格，随后是 2i-1 个星号。",
      "concepts": [
        "range",
        "字符串乘法",
        "对齐"
      ],
      "fastMs": 60,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "3",
          "expected": "  *\n ***\n*****"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "5",
          "expected": "    *\n   ***\n  *****\n *******\n*********"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "7",
          "expected": "      *\n     ***\n    *****\n   *******\n  *********\n ***********\n*************"
        }
      ],
      "sampleStdin": "3",
      "sampleStdout": "  *\n ***\n*****"
    },
    {
      "id": "b3",
      "level": "basic",
      "no": 3,
      "title": "星号沙漏",
      "subtitle": "先缩小，再放大",
      "brief": "先收缩再扩张，画出一个上下对称的沙漏。",
      "goal": "读入奇数 n，输出高度为 n 的星号沙漏：中间一行最窄，上半部分逐行减少两颗星，下半部分逐行增加两颗星；每行左侧补空格保持居中。",
      "hints": [
        "上半部分从 n 颗星递减到 1 颗，偏移量逐行加 1。",
        "下半部分可以把上半部分倒序输出，但最后一行不要再重复中间行。"
      ],
      "input": "一行，一个奇数 n（3 ≤ n ≤ 9）。",
      "output": "共 n 行；中间一行只有 1 颗星。",
      "concepts": [
        "对称",
        "倒序",
        "字符串乘法"
      ],
      "fastMs": 60,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "5",
          "expected": "*****\n ***\n  *\n   \n    \n   \n  *\n ***\n*****"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "3",
          "expected": "***\n *\n  \n *\n***"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "7",
          "expected": "*******\n *****\n  ***\n   *\n    \n     \n      \n     \n    \n   *\n  ***\n *****\n*******"
        }
      ],
      "sampleStdin": "5",
      "sampleStdout": "*****\n ***\n  *\n   \n    \n   \n  *\n ***\n*****"
    },
    {
      "id": "b4",
      "level": "basic",
      "no": 4,
      "title": "偶数平方表",
      "subtitle": "格式化输出第一课",
      "brief": "把前 n 个正偶数的平方排成一张表。",
      "goal": "读入整数 n，输出 n 行：第 i 行是第 i 个正偶数及其平方，格式为 2i^2 = 平方值，例如 2^2 = 4。",
      "hints": [
        "第 i 个正偶数是 2*i，从 1 开始循环。",
        "用 f-string 或 format 才能把数字和固定文本拼在一起。"
      ],
      "input": "一行，一个整数 n（1 ≤ n ≤ 20）。",
      "output": "共 n 行；每行形如 2^2 = 4、4^2 = 16。",
      "concepts": [
        "f-string",
        "乘法",
        "格式化"
      ],
      "fastMs": 60,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "3",
          "expected": "2^2 = 4\n4^2 = 16\n6^2 = 36"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "5",
          "expected": "2^2 = 4\n4^2 = 16\n6^2 = 36\n8^2 = 64\n10^2 = 100"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "8",
          "expected": "2^2 = 4\n4^2 = 16\n6^2 = 36\n8^2 = 64\n10^2 = 100\n12^2 = 144\n14^2 = 196\n16^2 = 256"
        }
      ],
      "sampleStdin": "3",
      "sampleStdout": "2^2 = 4\n4^2 = 16\n6^2 = 36"
    },
    {
      "id": "i1",
      "level": "intermediate",
      "no": 5,
      "title": "杨辉三角",
      "subtitle": "用上一行推出下一行",
      "brief": "按行输出杨辉三角的前 n 行。",
      "goal": "读入整数 n，输出杨辉三角的前 n 行。每行数字之间用一个空格分隔，行首行尾不要多余空格。",
      "hints": [
        "第 i 行有 i+1 个数，两端都是 1。",
        "中间的数等于上一行相邻两个数之和；也可以直接用组合数递推。"
      ],
      "input": "一行，一个整数 n（1 ≤ n ≤ 10）。",
      "output": "共 n 行；第 i 行有 i 个数字。",
      "concepts": [
        "递推",
        "列表",
        "组合数"
      ],
      "fastMs": 80,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "4",
          "expected": "1\n1 1\n1 2 1\n1 3 3 1"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "6",
          "expected": "1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1\n1 5 10 10 5 1"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "9",
          "expected": "1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1\n1 5 10 10 5 1\n1 6 15 20 15 6 1\n1 7 21 35 35 21 7 1\n1 8 28 56 70 56 28 8 1"
        }
      ],
      "sampleStdin": "4",
      "sampleStdout": "1\n1 1\n1 2 1\n1 3 3 1"
    },
    {
      "id": "i2",
      "level": "intermediate",
      "no": 6,
      "title": "质数筛选",
      "subtitle": "埃氏筛的第一次实现",
      "brief": "输出不超过 n 的所有质数。",
      "goal": "读入整数 n，输出 2 到 n 之间的所有质数，数字之间用一个空格分隔。如果范围内没有质数，输出 none。",
      "hints": [
        "先假设每个数都是质数，再从 2 开始把倍数标记掉。",
        "内层循环可以从 i*i 开始，因为更小的倍数已经被更小的质数筛过。"
      ],
      "input": "一行，一个整数 n（1 ≤ n ≤ 200）。",
      "output": "一行；质数用空格分隔，没有质数时输出 none。",
      "concepts": [
        "埃氏筛",
        "布尔数组",
        "边界"
      ],
      "fastMs": 80,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "30",
          "expected": "2 3 5 7 11 13 17 19 23 29"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "2",
          "expected": "2"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "100",
          "expected": "2 3 5 7 11 13 17 19 23 29 31 37 41 43 47 53 59 61 67 71 73 79 83 89 97"
        }
      ],
      "sampleStdin": "30",
      "sampleStdout": "2 3 5 7 11 13 17 19 23 29"
    },
    {
      "id": "i3",
      "level": "intermediate",
      "no": 7,
      "title": "单词频次榜",
      "subtitle": "计数之后还要排序",
      "brief": "统计一行单词的出现次数，并按规则排名。",
      "goal": "读入一行由小写字母单词组成的文本，统计每个单词出现次数，按次数从高到低输出；次数相同按单词字典序升序。每行格式为 单词: 次数。",
      "hints": [
        "用字典或 Counter 先完成计数。",
        "排序键要同时考虑次数降序和单词升序，可以用元组 (-次数, 单词)。"
      ],
      "input": "一行，单词之间用空格分隔，单词只含小写字母。",
      "output": "每个不同单词一行，格式为 单词: 次数。",
      "concepts": [
        "字典",
        "Counter",
        "多关键字排序"
      ],
      "fastMs": 80,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "the quick brown fox the lazy dog the fox",
          "expected": "the: 3\nfox: 2\nbrown: 1\ndog: 1\nlazy: 1\nquick: 1"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "apple banana apple cherry banana apple",
          "expected": "apple: 3\nbanana: 2\ncherry: 1"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "a a b b c",
          "expected": "a: 2\nb: 2\nc: 1"
        }
      ],
      "sampleStdin": "the quick brown fox the lazy dog the fox",
      "sampleStdout": "the: 3\nfox: 2\nbrown: 1\ndog: 1\nlazy: 1\nquick: 1"
    },
    {
      "id": "i4",
      "level": "intermediate",
      "no": 8,
      "title": "矩阵转置",
      "subtitle": "行列互换",
      "brief": "把 m 行 n 列的矩阵转置成 n 行 m 列。",
      "goal": "第一行读入 m 和 n，随后读入 m 行、每行 n 个整数。输出转置后的矩阵：共 n 行，每行 m 个整数，用空格分隔。",
      "hints": [
        "原矩阵第 r 行第 c 列，转置后到了第 c 行第 r 列。",
        "可以按列遍历，也可以先建一个 n 行的空矩阵再填。"
      ],
      "input": "第一行 m n（1 ≤ m,n ≤ 6），随后 m 行每行 n 个整数。",
      "output": "共 n 行，每行 m 个整数。",
      "concepts": [
        "二维列表",
        "行列索引",
        "输入解析"
      ],
      "fastMs": 80,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "2 3\n1 2 3\n4 5 6",
          "expected": "1 4\n2 5\n3 6"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "3 2\n1 2\n3 4\n5 6",
          "expected": "1 3 5\n2 4 6"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "3 3\n1 2 3\n4 5 6\n7 8 9",
          "expected": "1 4 7\n2 5 8\n3 6 9"
        }
      ],
      "sampleStdin": "2 3\n1 2 3\n4 5 6",
      "sampleStdout": "1 4\n2 5\n3 6"
    },
    {
      "id": "c1",
      "level": "challenge",
      "no": 9,
      "title": "螺旋矩阵",
      "subtitle": "四条边界一起收缩",
      "brief": "把 1 到 n² 按顺时针螺旋填进 n×n 矩阵。",
      "goal": "读入整数 n，输出 n 行 n 列的螺旋矩阵。数字从左上角 1 开始，按右、下、左、上的方向顺时针向内螺旋，每个数字之间用一个空格分隔。",
      "hints": [
        "维护 top、bottom、left、right 四条边界，每填完一条边就收缩。",
        "每轮要检查边界是否仍然有效，避免 n 为奇数时重复填中间行。"
      ],
      "input": "一行，一个整数 n（2 ≤ n ≤ 7）。",
      "output": "共 n 行；每行 n 个整数。",
      "concepts": [
        "边界收缩",
        "方向模拟",
        "二维列表"
      ],
      "fastMs": 100,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "3",
          "expected": "1 2 3\n8 9 4\n7 6 5"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "4",
          "expected": "1 2 3 4\n12 13 14 5\n11 16 15 6\n10 9 8 7"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "5",
          "expected": "1 2 3 4 5\n16 17 18 19 6\n15 24 25 20 7\n14 23 22 21 8\n13 12 11 10 9"
        }
      ],
      "sampleStdin": "3",
      "sampleStdout": "1 2 3\n8 9 4\n7 6 5"
    },
    {
      "id": "c2",
      "level": "challenge",
      "no": 10,
      "title": "括号嵌套深度",
      "subtitle": "栈与最大深度",
      "brief": "判断括号是否配对，并报告最深层数。",
      "goal": "读入一行只含 ()[]{} 的字符串（可含空格）。输出两行：第一行 depth=最大嵌套深度，第二行 balanced=yes 或 balanced=no。配对失败或还有剩余左括号都算不合法。",
      "hints": [
        "遇到左括号入栈，遇到右括号检查栈顶是否是同类型左括号。",
        "最大深度在每次入栈后更新；最后栈为空且没有配对失败才算 balanced。"
      ],
      "input": "一行，只含 ()[]{} 和空格，长度不超过 30。",
      "output": "两行：depth=... 与 balanced=yes/no。",
      "concepts": [
        "栈",
        "括号匹配",
        "最大深度"
      ],
      "fastMs": 100,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "()(())",
          "expected": "depth=2\nbalanced=yes"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "{[()]}",
          "expected": "depth=3\nbalanced=yes"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "([)]",
          "expected": "depth=2\nbalanced=no"
        }
      ],
      "sampleStdin": "()(())",
      "sampleStdout": "depth=2\nbalanced=yes"
    },
    {
      "id": "c3",
      "level": "challenge",
      "no": 11,
      "title": "整数转罗马数字",
      "subtitle": "从大到小贪心拼接",
      "brief": "把 1 到 3999 的整数写成罗马数字。",
      "goal": "读入一个整数 n（1 ≤ n ≤ 3999），输出它的罗马数字表示。必须使用标准减法记法，例如 4 写成 IV，9 写成 IX，1994 写成 MCMXCIV。",
      "hints": [
        "把 1000、900、500、400 … 1 连同符号按从大到小排好。",
        "每次能减就追加对应符号并减去数值，直到 n 为 0。"
      ],
      "input": "一行，一个整数 n（1 ≤ n ≤ 3999）。",
      "output": "一行，罗马数字大写字符串。",
      "concepts": [
        "贪心",
        "映射表",
        "减法记法"
      ],
      "fastMs": 100,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "1994",
          "expected": "MCMXCIV"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "58",
          "expected": "LVIII"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "3999",
          "expected": "MMMCMXCIX"
        }
      ],
      "sampleStdin": "1994",
      "sampleStdout": "MCMXCIV"
    },
    {
      "id": "c4",
      "level": "challenge",
      "no": 12,
      "title": "合并区间",
      "subtitle": "排序后一次扫描",
      "brief": "把所有重叠或相接的区间合并。",
      "goal": "第一行读入区间数量 n，随后 n 行每行两个整数 l r。把所有重叠或首尾相接的区间合并，按左端点升序输出，每行一个合并后的区间 l r。",
      "hints": [
        "先按左端点排序，才能只和当前最后一个合并区间比较。",
        "如果新的左端点小于等于当前右端点，就合并并更新右端点；否则另起一个区间。"
      ],
      "input": "第一行 n（1 ≤ n ≤ 8），随后 n 行每行 l r（-100 ≤ l ≤ r ≤ 100）。",
      "output": "每行一个合并后的区间，格式为 l r。",
      "concepts": [
        "排序",
        "区间合并",
        "扫描"
      ],
      "fastMs": 100,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "4\n1 3\n2 6\n8 10\n15 18",
          "expected": "1 6\n8 10\n15 18"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "3\n5 7\n1 2\n7 8",
          "expected": "1 2\n5 8"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "1\n-5 5",
          "expected": "-5 5"
        }
      ],
      "sampleStdin": "4\n1 3\n2 6\n8 10\n15 18",
      "sampleStdout": "1 6\n8 10\n15 18"
    },
    {
      "id": "b5",
      "level": "basic",
      "no": 13,
      "title": "闰年判断",
      "subtitle": "四个条件，两个分支",
      "brief": "判断一年是不是闰年。",
      "goal": "读入年份 year（1 ≤ year ≤ 3000）。闰年输出 YES，平年输出 NO。规则：能被 4 整除但不能被 100 整除，或者能被 400 整除。",
      "hints": [
        "把规则拆成两个条件：`year % 4 == 0 and year % 100 != 0`，或者 `year % 400 == 0`。",
        "1900 能被 4 和 100 整除，但不是闰年；2000 能被 400 整除，是闰年。"
      ],
      "input": "一行，一个整数 year。",
      "output": "YES 或 NO。",
      "concepts": [
        "取模",
        "and/or",
        "边界"
      ],
      "fastMs": 70,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "2024",
          "expected": "YES"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "1900",
          "expected": "NO"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "2000",
          "expected": "YES"
        }
      ],
      "sampleStdin": "2024",
      "sampleStdout": "YES"
    },
    {
      "id": "b6",
      "level": "basic",
      "no": 14,
      "title": "数字反转",
      "subtitle": "前导零不要在输出里出现",
      "brief": "把一个非负整数的十进制数字倒过来。",
      "goal": "读入非负整数 n（0 ≤ n ≤ 999999）。输出反转后的整数，不能带前导零；0 反转还是 0。",
      "hints": [
        "字符串切片 `[::-1]` 可以反转，再 `int(...)` 去掉前导零。",
        "120 反转是 021，输出必须是 21；1000 反转是 0001，输出 1。"
      ],
      "input": "一行，一个非负整数。",
      "output": "一行，反转后的整数。",
      "concepts": [
        "切片",
        "int",
        "前导零"
      ],
      "fastMs": 70,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "120",
          "expected": "21"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "7",
          "expected": "7"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "1000",
          "expected": "1"
        }
      ],
      "sampleStdin": "120",
      "sampleStdout": "21"
    },
    {
      "id": "i5",
      "level": "intermediate",
      "no": 15,
      "title": "最大公约数",
      "subtitle": "欧几里得算法",
      "brief": "求两个正整数的最大公约数。",
      "goal": "读入一行两个正整数 a b（1 ≤ a,b ≤ 100000），输出它们的最大公约数。",
      "hints": [
        "gcd(a,b) = gcd(b, a % b)，直到 b 为 0，答案是 a。",
        "不要从 min(a,b) 向下枚举，数字大时会很慢。"
      ],
      "input": "一行，两个正整数，空格分隔。",
      "output": "一个整数，表示 gcd(a, b)。",
      "concepts": [
        "欧几里得",
        "while",
        "取模"
      ],
      "fastMs": 70,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
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
          "stdin": "100 75",
          "expected": "25"
        }
      ],
      "sampleStdin": "12 18",
      "sampleStdout": "6"
    },
    {
      "id": "i6",
      "level": "intermediate",
      "no": 16,
      "title": "去重并排序",
      "subtitle": "先 set，再按数字大小排",
      "brief": "把一组整数去重后升序输出。",
      "goal": "第一行读入 n，第二行读入 n 个整数。输出去重后的升序序列，用一个空格分隔。",
      "hints": [
        "`set(nums)` 去重，`sorted(...)` 返回升序列表。",
        "set 不保证顺序，所以排序要单独做；输出用 `\" \".join(map(str, ...))`。"
      ],
      "input": "第一行 n；第二行 n 个整数。",
      "output": "一行，去重且升序的整数序列。",
      "concepts": [
        "set",
        "sorted",
        "join"
      ],
      "fastMs": 70,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "5\n3 1 3 2 1",
          "expected": "1 2 3"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "3\n10 2 10",
          "expected": "2 10"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "4\n-1 0 -1 2",
          "expected": "-1 0 2"
        }
      ],
      "sampleStdin": "5\n3 1 3 2 1",
      "sampleStdout": "1 2 3"
    },
    {
      "id": "c5",
      "level": "challenge",
      "no": 17,
      "title": "最大子数组和",
      "subtitle": "Kadane 的一次遍历",
      "brief": "求连续子数组的最大和。",
      "goal": "第一行读入 n，第二行读入 n 个整数（可能为负）。输出所有非空连续子数组中的最大和。",
      "hints": [
        "维护 `cur = max(x, cur + x)`，`best = max(best, cur)`。",
        "全负数时答案不是 0，而是最大的那个负数；初始化不能直接写 0。"
      ],
      "input": "第一行 n；第二行 n 个整数。",
      "output": "一个整数，表示最大子数组和。",
      "concepts": [
        "动态规划",
        "Kadane",
        "负数"
      ],
      "fastMs": 80,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "9\n-2 1 -3 4 -1 2 1 -5 4",
          "expected": "6"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "3\n-5 -2 -9",
          "expected": "-2"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "4\n1 2 3 4",
          "expected": "10"
        }
      ],
      "sampleStdin": "9\n-2 1 -3 4 -1 2 1 -5 4",
      "sampleStdout": "6"
    },
    {
      "id": "c6",
      "level": "challenge",
      "no": 18,
      "title": "螺旋矩阵",
      "subtitle": "四条边界逐层收缩",
      "brief": "按顺时针螺旋顺序输出矩阵元素。",
      "goal": "第一行读入 rows cols，随后 rows 行每行 cols 个整数。从左上角开始顺时针螺旋遍历，输出一行，数字用单个空格分隔。",
      "hints": [
        "维护 top、bottom、left、right 四条边界，依次走完上边、右边、下边、左边，再收缩边界。",
        "每一轮走完要检查边界是否仍然合法，否则单行或单列会重复输出。"
      ],
      "input": "第一行 rows cols；随后 rows 行矩阵。",
      "output": "一行，螺旋顺序的所有元素。",
      "concepts": [
        "边界",
        "四指针",
        "矩阵"
      ],
      "fastMs": 80,
      "starter": "import sys\n\ndef main():\n    data = sys.stdin.read()\n    # 先解析输入，再在这里写你的解法\n\nif __name__ == \"__main__\":\n    main()",
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "3 3\n1 2 3\n4 5 6\n7 8 9",
          "expected": "1 2 3 6 9 8 7 4 5"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "2 3\n1 2 3\n4 5 6",
          "expected": "1 2 3 6 5 4"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "1 4\n1 2 3 4",
          "expected": "1 2 3 4"
        }
      ],
      "sampleStdin": "3 3\n1 2 3\n4 5 6\n7 8 9",
      "sampleStdout": "1 2 3 6 9 8 7 4 5"
    }
  ]
};

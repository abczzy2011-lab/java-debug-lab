/* Java 输出实现场 · 12 题 / 36 组测试。数据由题库生成器产出，勿手改 expected。 */
window.JAVA_OUTPUT_BANK = {
  "version": "20261125z55",
  "title": "Java 输出实现场",
  "levels": [
    {
      "id": "basic",
      "name": "基础",
      "kicker": "FOUNDATION",
      "desc": "先把输入读对，把空格、换行和边界控制对；这一步不靠猜。"
    },
    {
      "id": "intermediate",
      "name": "进阶",
      "kicker": "STRUCTURE",
      "desc": "需要自己组织循环、数组或递推关系；隐藏用例会换参数。"
    },
    {
      "id": "challenge",
      "name": "挑战",
      "kicker": "EDGE CASES",
      "desc": "矩阵、排序、编码与大数；实现顺序和边界会直接改变输出。"
    }
  ],
  "tasks": [
    {
      "id": "b1",
      "level": "basic",
      "no": 1,
      "title": "数字阶梯",
      "subtitle": "双重循环的第一关",
      "brief": "把 1 到 n 排成逐行增长的阶梯。",
      "goal": "读入整数 n，输出 n 行数字阶梯：第 i 行包含从 1 到 i 的所有整数，数字之间用一个空格分隔，行末不要多输出空格。",
      "hints": [
        "外层循环控制行号，内层循环控制这一行打印到哪里。",
        "用 StringBuilder 拼接每一行，最后统一换行；注意最后一个数字后不要空格。"
      ],
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
      "sampleStdout": "1\n1 2\n1 2 3",
      "starter": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n\n        // 从这里开始写：先读入，再构造输出\n\n    }\n}",
      "fastMs": 120,
      "concepts": [
        "循环",
        "空格"
      ],
      "input": "一行，一个整数 n（1 ≤ n ≤ 9）。",
      "output": "共 n 行；第 i 行是 1 到 i 的数字序列。",
      "docs": [
        {
          "label": "Scanner",
          "path": "java.base/java/util/Scanner.html"
        },
        {
          "label": "StringBuilder",
          "path": "java.base/java/lang/StringBuilder.html"
        },
        {
          "label": "System.out",
          "path": "java.base/java/lang/System.html#out"
        }
      ]
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
        "不要在每行末尾补空格，否则会改变逐行比较结果。"
      ],
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
      "sampleStdout": "  *\n ***\n*****",
      "starter": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n\n        // 从这里开始写：先读入，再构造输出\n\n    }\n}",
      "fastMs": 120,
      "concepts": [
        "嵌套循环",
        "对齐"
      ],
      "input": "一行，一个奇数 n（3 ≤ n ≤ 9）。",
      "output": "共 n 行；第 i 行有 n-i 个空格，随后是 2i-1 个星号。",
      "docs": [
        {
          "label": "StringBuilder",
          "path": "java.base/java/lang/StringBuilder.html"
        },
        {
          "label": "String.repeat",
          "path": "java.base/java/lang/String.html#repeat(int)"
        },
        {
          "label": "System.out",
          "path": "java.base/java/lang/System.html#out"
        }
      ]
    },
    {
      "id": "b3",
      "level": "basic",
      "no": 3,
      "title": "星号沙漏",
      "subtitle": "先缩小，再放大",
      "brief": "先收缩再扩张，画出一个上下对称的沙漏。",
      "goal": "读入奇数 n，输出高度为 n 的星号沙漏：从 n 颗星开始，每行减少 2 颗，降到 1 颗后再逐行增加 2 颗，直到回到 n 颗。",
      "hints": [
        "可以先写上半部分（包含中间 1 星那行），再写下半部分。",
        "中间 1 星行只能出现一次；下半部分从宽度 3 开始。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "3",
          "expected": "***\n *\n***"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "5",
          "expected": "*****\n ***\n  *\n ***\n*****"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "7",
          "expected": "*******\n *****\n  ***\n   *\n  ***\n *****\n*******"
        }
      ],
      "sampleStdin": "3",
      "sampleStdout": "***\n *\n***",
      "starter": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n\n        // 从这里开始写：先读入，再构造输出\n\n    }\n}",
      "fastMs": 120,
      "concepts": [
        "对称",
        "边界"
      ],
      "input": "一行，一个奇数 n（3 ≤ n ≤ 9）。",
      "output": "共 n 行；上半部分宽度从 n 递减到 1，下半部分从 3 递增到 n，所有行居中。",
      "docs": [
        {
          "label": "StringBuilder",
          "path": "java.base/java/lang/StringBuilder.html"
        },
        {
          "label": "String.repeat",
          "path": "java.base/java/lang/String.html#repeat(int)"
        },
        {
          "label": "System.out",
          "path": "java.base/java/lang/System.html#out"
        }
      ]
    },
    {
      "id": "b4",
      "level": "basic",
      "no": 4,
      "title": "奇偶分组",
      "subtitle": "两次扫描的顺序",
      "brief": "先输出所有偶数，再输出所有奇数。",
      "goal": "读入整数 n，按“偶数在前、奇数在后”的顺序输出 1 到 n 的所有整数；两组内部都按升序，数字之间用一个空格分隔。",
      "hints": [
        "可以写两个循环，也可以一次遍历后分到两个列表。",
        "最后一行末尾不要空格；偶数不存在时直接输出奇数序列。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "6",
          "expected": "2 4 6 1 3 5"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "7",
          "expected": "2 4 6 1 3 5 7"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "9",
          "expected": "2 4 6 8 1 3 5 7 9"
        }
      ],
      "sampleStdin": "6",
      "sampleStdout": "2 4 6 1 3 5",
      "starter": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n\n        // 从这里开始写：先读入，再构造输出\n\n    }\n}",
      "fastMs": 120,
      "concepts": [
        "分支",
        "顺序"
      ],
      "input": "一行，一个整数 n（2 ≤ n ≤ 20）。",
      "output": "一行整数：先输出 1..n 中的偶数，再输出其中的奇数。",
      "docs": [
        {
          "label": "ArrayList",
          "path": "java.base/java/util/ArrayList.html"
        },
        {
          "label": "StringBuilder",
          "path": "java.base/java/lang/StringBuilder.html"
        },
        {
          "label": "System.out",
          "path": "java.base/java/lang/System.html#out"
        }
      ]
    },
    {
      "id": "i1",
      "level": "intermediate",
      "no": 5,
      "title": "FizzBuzz",
      "subtitle": "分支顺序决定结果",
      "brief": "3 的倍数、5 的倍数与 15 的倍数分别换成单词。",
      "goal": "读入整数 n，输出 1 到 n。若当前数是 3 的倍数输出 Fizz，是 5 的倍数输出 Buzz，同时是 3 和 5 的倍数输出 FizzBuzz；其余输出数字本身。每行一个结果。",
      "hints": [
        "先判断同时被 3 和 5 整除的情况，再判断单个条件。",
        "输出的是原数字还是单词，取决于当前分支，不要提前拼接。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "10",
          "expected": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "15",
          "expected": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "20",
          "expected": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz"
        }
      ],
      "sampleStdin": "10",
      "sampleStdout": "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz",
      "starter": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n\n        // 从这里开始写：先读入，再构造输出\n\n    }\n}",
      "fastMs": 140,
      "concepts": [
        "分支",
        "取模"
      ],
      "input": "一行，一个整数 n（3 ≤ n ≤ 30）。",
      "output": "共 n 行，每行一个数字或 Fizz / Buzz / FizzBuzz。",
      "docs": [
        {
          "label": "String",
          "path": "java.base/java/lang/String.html"
        },
        {
          "label": "StringBuilder",
          "path": "java.base/java/lang/StringBuilder.html"
        },
        {
          "label": "System.out",
          "path": "java.base/java/lang/System.html#out"
        }
      ]
    },
    {
      "id": "i2",
      "level": "intermediate",
      "no": 6,
      "title": "斐波那契前 n 项",
      "subtitle": "滚动变量",
      "brief": "从 0 和 1 开始，连续输出前 n 项。",
      "goal": "读入整数 n，输出斐波那契数列的前 n 项，从 0、1 开始，项与项之间用一个空格分隔。",
      "hints": [
        "维护 a=0、b=1；每轮先输出 a，再同步更新 a=b、b=a+b。",
        "更新时必须使用临时变量，避免 a 被提前覆盖。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "8",
          "expected": "0 1 1 2 3 5 8 13"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "10",
          "expected": "0 1 1 2 3 5 8 13 21 34"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "12",
          "expected": "0 1 1 2 3 5 8 13 21 34 55 89"
        }
      ],
      "sampleStdin": "8",
      "sampleStdout": "0 1 1 2 3 5 8 13",
      "starter": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n\n        // 从这里开始写：先读入，再构造输出\n\n    }\n}",
      "fastMs": 140,
      "concepts": [
        "递推",
        "变量更新"
      ],
      "input": "一行，一个整数 n（1 ≤ n ≤ 30）。",
      "output": "一行，n 个整数；首项是 0。",
      "docs": [
        {
          "label": "Arrays",
          "path": "java.base/java/util/Arrays.html"
        },
        {
          "label": "StringBuilder",
          "path": "java.base/java/lang/StringBuilder.html"
        },
        {
          "label": "System.out",
          "path": "java.base/java/lang/System.html#out"
        }
      ]
    },
    {
      "id": "i3",
      "level": "intermediate",
      "no": 7,
      "title": "素数清单",
      "subtitle": "筛掉合数",
      "brief": "列出不超过 n 的全部素数。",
      "goal": "读入整数 n，按升序输出不超过 n 的所有素数，数字之间用一个空格分隔。若区间内没有素数，输出空行。",
      "hints": [
        "布尔数组初始化为 true，从 2 开始把倍数标记为 false。",
        "外层枚举到 sqrt(n) 就足够；1 不是素数。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "20",
          "expected": "2 3 5 7 11 13 17 19"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "30",
          "expected": "2 3 5 7 11 13 17 19 23 29"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "50",
          "expected": "2 3 5 7 11 13 17 19 23 29 31 37 41 43 47"
        }
      ],
      "sampleStdin": "20",
      "sampleStdout": "2 3 5 7 11 13 17 19",
      "starter": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n\n        // 从这里开始写：先读入，再构造输出\n\n    }\n}",
      "fastMs": 160,
      "concepts": [
        "数组",
        "筛法"
      ],
      "input": "一行，一个整数 n（2 ≤ n ≤ 60）。",
      "output": "一行素数序列。",
      "docs": [
        {
          "label": "Arrays",
          "path": "java.base/java/util/Arrays.html"
        },
        {
          "label": "Math.sqrt",
          "path": "java.base/java/lang/Math.html#sqrt(double)"
        },
        {
          "label": "StringBuilder",
          "path": "java.base/java/lang/StringBuilder.html"
        }
      ]
    },
    {
      "id": "i4",
      "level": "intermediate",
      "no": 8,
      "title": "杨辉三角",
      "subtitle": "上一行生出下一行",
      "brief": "每一行由上一行相邻两项相加得到。",
      "goal": "读入整数 n，输出杨辉三角的前 n 行。每行数字之间用一个空格分隔，行首不要额外缩进，每行末尾不要空格。",
      "hints": [
        "可以直接用组合数计算，也可以保存上一行做相邻相加。",
        "每行第一个和最后一个数都是 1；从第三行开始中间项才需要相加。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "5",
          "expected": "1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "6",
          "expected": "1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1\n1 5 10 10 5 1"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "8",
          "expected": "1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1\n1 5 10 10 5 1\n1 6 15 20 15 6 1\n1 7 21 35 35 21 7 1"
        }
      ],
      "sampleStdin": "5",
      "sampleStdout": "1\n1 1\n1 2 1\n1 3 3 1\n1 4 6 4 1",
      "starter": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n\n        // 从这里开始写：先读入，再构造输出\n\n    }\n}",
      "fastMs": 160,
      "concepts": [
        "二维数组",
        "组合数"
      ],
      "input": "一行，一个整数 n（1 ≤ n ≤ 9）。",
      "output": "共 n 行；第 i 行有 i 个数，两端都是 1。",
      "docs": [
        {
          "label": "ArrayList",
          "path": "java.base/java/util/ArrayList.html"
        },
        {
          "label": "Arrays",
          "path": "java.base/java/util/Arrays.html"
        },
        {
          "label": "StringBuilder",
          "path": "java.base/java/lang/StringBuilder.html"
        }
      ]
    },
    {
      "id": "h1",
      "level": "challenge",
      "no": 9,
      "title": "螺旋矩阵",
      "subtitle": "四条边依次收缩",
      "brief": "按右、下、左、上的顺序把 1..n² 填进方阵。",
      "goal": "读入整数 n，生成 n×n 的顺时针螺旋矩阵：从左上角开始向右填，遇到边界后依次向下、向左、向上，数字从 1 连续增加到 n²。按行输出，同行数字用一个空格分隔。",
      "hints": [
        "维护 top、bottom、left、right 四个边界；每填完一条边就收缩对应边界。",
        "每轮要重新检查 top≤bottom 和 left≤right，否则奇数阶矩阵会重复填中心。"
      ],
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
      "sampleStdout": "1 2 3\n8 9 4\n7 6 5",
      "starter": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n\n        // 从这里开始写：先读入，再构造输出\n\n    }\n}",
      "fastMs": 200,
      "concepts": [
        "矩阵",
        "边界"
      ],
      "input": "一行，一个整数 n（3 ≤ n ≤ 6）。",
      "output": "共 n 行，每行 n 个整数。",
      "docs": [
        {
          "label": "Arrays",
          "path": "java.base/java/util/Arrays.html"
        },
        {
          "label": "StringBuilder",
          "path": "java.base/java/lang/StringBuilder.html"
        },
        {
          "label": "System.out",
          "path": "java.base/java/lang/System.html#out"
        }
      ]
    },
    {
      "id": "h2",
      "level": "challenge",
      "no": 10,
      "title": "字母频率榜",
      "subtitle": "先按次数，再按字母",
      "brief": "只统计小写字母，按出现次数从高到低排行。",
      "goal": "读入一行文本，只统计其中 a 到 z 的小写字母，忽略空格、标点和其它字符。按出现次数从高到低输出，每个字母一行，格式为“字母 次数”；次数相同则按字母升序。",
      "hints": [
        "先用长度为 26 的计数数组统计，再把有出现过的字母转成列表排序。",
        "排序比较器先比次数降序，次数相同再比字符升序。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "hello world",
          "expected": "l 3\no 2\nd 1\ne 1\nh 1\nr 1\nw 1"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "programming",
          "expected": "g 2\nm 2\nr 2\na 1\ni 1\nn 1\no 1\np 1"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "java output",
          "expected": "a 2\nt 2\nu 2\nj 1\no 1\np 1\nv 1"
        }
      ],
      "sampleStdin": "hello world",
      "sampleStdout": "l 3\no 2\nd 1\ne 1\nh 1\nr 1\nw 1",
      "starter": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n\n        // 从这里开始写：先读入，再构造输出\n\n    }\n}",
      "fastMs": 180,
      "concepts": [
        "字符串",
        "排序"
      ],
      "input": "一行文本，长度不超过 200，包含小写字母、空格和常见标点。",
      "output": "每行一个“字母 次数”，按次数降序、同次数按字母升序排列。",
      "docs": [
        {
          "label": "HashMap",
          "path": "java.base/java/util/HashMap.html"
        },
        {
          "label": "Map",
          "path": "java.base/java/util/Map.html"
        },
        {
          "label": "Collections.sort",
          "path": "java.base/java/util/Collections.html#sort(java.util.List)"
        },
        {
          "label": "String",
          "path": "java.base/java/lang/String.html"
        }
      ]
    },
    {
      "id": "h3",
      "level": "challenge",
      "no": 11,
      "title": "游程编码",
      "subtitle": "把连续段压成字符 + 次数",
      "brief": "相同字符连在一起时，只保留一个字符和它的连续长度。",
      "goal": "读入一行只含小写字母的字符串，输出游程编码：每个连续相同字符段写成“字符 + 段长度”，段长度即使为 1 也要写出。例如 aaa 变成 a3，单个 b 变成 b1。",
      "hints": [
        "从前往后扫描，用 j 找到当前字符连续段的右边界。",
        "连续段结束时才写出字符和长度；不要漏掉最后一段。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "aaabbccccd",
          "expected": "a3b2c4d1"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "abcd",
          "expected": "a1b1c1d1"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "zzzxxy",
          "expected": "z3x2y1"
        }
      ],
      "sampleStdin": "aaabbccccd",
      "sampleStdout": "a3b2c4d1",
      "starter": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n\n        // 从这里开始写：先读入，再构造输出\n\n    }\n}",
      "fastMs": 180,
      "concepts": [
        "字符串",
        "扫描"
      ],
      "input": "一行，只包含小写字母，长度 1 ≤ len ≤ 200。",
      "output": "一行编码结果，不含空格。",
      "docs": [
        {
          "label": "StringBuilder",
          "path": "java.base/java/lang/StringBuilder.html"
        },
        {
          "label": "String.charAt",
          "path": "java.base/java/lang/String.html#charAt(int)"
        },
        {
          "label": "System.out",
          "path": "java.base/java/lang/System.html#out"
        }
      ]
    },
    {
      "id": "h4",
      "level": "challenge",
      "no": 12,
      "title": "大数阶乘",
      "subtitle": "long 会溢出的边界",
      "brief": "n 稍大就会超过 long，需要换一种整数表示。",
      "goal": "读入整数 n，输出 n! 的十进制表示。结果可能远超 long 的范围，必须使用 Java 的大整数能力完成计算。",
      "hints": [
        "BigInteger 提供 multiply 方法；从 1 开始累乘到 n。",
        "不要用 double 或 long 先算再转字符串，20! 之后的精度/范围会出问题。"
      ],
      "testCases": [
        {
          "label": "公开样例",
          "stdin": "10",
          "expected": "3628800"
        },
        {
          "label": "隐藏用例 1",
          "stdin": "20",
          "expected": "2432902008176640000"
        },
        {
          "label": "隐藏用例 2",
          "stdin": "30",
          "expected": "265252859812191058636308480000000"
        }
      ],
      "sampleStdin": "10",
      "sampleStdout": "3628800",
      "starter": "import java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n\n        // 从这里开始写：先读入，再构造输出\n\n    }\n}",
      "fastMs": 220,
      "concepts": [
        "大整数",
        "BigInteger"
      ],
      "input": "一行，一个整数 n（1 ≤ n ≤ 40）。",
      "output": "一行，n! 的完整十进制值，不要科学计数法。",
      "docs": [
        {
          "label": "BigInteger",
          "path": "java.base/java/math/BigInteger.html"
        },
        {
          "label": "StringBuilder",
          "path": "java.base/java/lang/StringBuilder.html"
        },
        {
          "label": "System.out",
          "path": "java.base/java/lang/System.html#out"
        }
      ]
    }
  ],
  "rules": {
    "correctness": 85,
    "speed": 15,
    "normalize": "忽略每行行尾空格与文件末尾空行；行首空格、空行位置和大小写都会参与比较。",
    "speedRule": "三组用例全部通过后才计入速度分；平均运行时间不超过该题基准值得满分，达到 3 倍基准值时速度分为 0。",
    "msRule": "运行时间取后端真实进程耗时，不含编译和网络传输。"
  }
};

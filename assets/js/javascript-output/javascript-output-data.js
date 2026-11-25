/* JavaScript 输出实现场 · 18 题 / 54 组测试
   目标输出在前，代码从空白开始写；浏览器 Worker 真实执行，逐行比较 stdout。
   reference 只用于离线校验与参考实现，不参与页面评分。 */
(function () {
  'use strict';

  var STARTER = '// input 是完整 stdin 字符串\n// 先解析，再用 console.log 输出\n\n';
  var RULES = {
    correctness: 85,
    speed: 15,
    normalize: '逐行比较：忽略每行行尾空格和文件末尾空行；行首空格、空行位置、大小写都保留。',
    speedRule: '三组用例全部通过后才计入速度分。平均运行时间不超过该题基准值的 15 分，达到 3 倍基准值时速度分为 0。',
    msRule: '毫秒由浏览器 Worker 从执行代码到产出当前用例 stdout 计时，不含页面渲染与网络。'
  };

  function task(id, level, no, title, subtitle, brief, goal, input, output, concepts, hints, fastMs, tests, reference) {
    return {
      id: id,
      level: level,
      no: no,
      title: title,
      subtitle: subtitle,
      brief: brief,
      goal: goal,
      input: input,
      output: output,
      concepts: concepts,
      hints: hints,
      fastMs: fastMs,
      starter: STARTER,
      testCases: tests.map(function (item, index) {
        return {
          label: index === 0 ? '公开样例' : '隐藏用例 ' + index,
          stdin: item[0],
          expected: item[1]
        };
      }),
      sampleStdin: tests[0][0],
      sampleStdout: tests[0][1],
      reference: reference
    };
  }

  window.JS_OUTPUT_BANK = {
    version: '20261125z73',
    title: 'JavaScript 输出实现场',
    levels: [
      {
        id: 'basic',
        name: '基础',
        kicker: 'FOUNDATION',
        desc: '先把输入读对，把空格、换行和字符串拼接控制对；这一步不靠猜。'
      },
      {
        id: 'intermediate',
        name: '进阶',
        kicker: 'STRUCTURE',
        desc: '需要自己组织循环、数组或对象；隐藏用例会换参数，不能只对样例写死。'
      },
      {
        id: 'challenge',
        name: '挑战',
        kicker: 'EDGE CASES',
        desc: '字符串、精度、区间和边界一起上；实现顺序和边界会直接改变输出。'
      }
    ],
    rules: RULES,
    tasks: [
      task('b1', 'basic', 1, '数字阶梯', '从一行一个数开始',
        '把 1 到 n 排成逐行增长的阶梯。',
        '读入整数 n，输出 n 行数字阶梯：第 i 行包含从 1 到 i 的所有整数，数字之间用一个空格分隔，行末不要多输出空格。',
        '一行，一个整数 n（1 ≤ n ≤ 9）。',
        '共 n 行；第 i 行是 1 到 i 的数字序列。',
        ['循环', 'join', '空格'],
        ['外层循环控制行号，内层循环控制这一行打印到几。', '用数组收集这一行的数字，再 join 成字符串，能避免行末多空格。'],
        30,
        [
          ['3', '1\n1 2\n1 2 3'],
          ['5', '1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5'],
          ['7', '1\n1 2\n1 2 3\n1 2 3 4\n1 2 3 4 5\n1 2 3 4 5 6\n1 2 3 4 5 6 7']
        ],
        'const n = Number(input.trim());\nfor (let i = 1; i <= n; i++) {\n  const row = [];\n  for (let j = 1; j <= i; j++) row.push(j);\n  console.log(row.join(" "));\n}'
      ),
      task('b2', 'basic', 2, '星号三角', '前导空格与奇数增长',
        '用星号画一个顶角朝上的等腰三角形。',
        '读入奇数 n，输出高度为 n 的星号三角形。第 1 行 1 颗星，之后每行多 2 颗；每行左侧补足空格，让星号整体居中。',
        '一行，一个奇数 n（3 ≤ n ≤ 9）。',
        '共 n 行；第 i 行有 n-i 个空格，随后是 2i-1 个星号。',
        ['嵌套循环', 'repeat', '对齐'],
        ['行号从 0 开始时，前导空格是 n-i-1，星号数是 2*i+1。', '不要在每行末尾补空格，否则会改变逐行比较结果。'],
        30,
        [
          ['3', '  *\n ***\n*****'],
          ['5', '    *\n   ***\n  *****\n *******\n*********'],
          ['7', '      *\n     ***\n    *****\n   *******\n  *********\n ***********\n*************']
        ],
        'const n = Number(input.trim());\nfor (let i = 0; i < n; i++) {\n  console.log(" ".repeat(n - i - 1) + "*".repeat(2 * i + 1));\n}'
      ),
      task('b3', 'basic', 3, '偶数平方表', '格式化输出第一课',
        '把前 n 个正偶数的平方排成一张表。',
        '读入整数 n，输出 n 行：第 i 行是第 i 个正偶数及其平方，格式为 2i^2 = 平方值，例如 2^2 = 4。',
        '一行，一个整数 n（1 ≤ n ≤ 20）。',
        '共 n 行；每行形如 2^2 = 4、4^2 = 16。',
        ['模板字符串', '乘法', '格式化'],
        ['第 i 个正偶数是 2*i，从 1 开始循环。', '用模板字符串 `${base}^2 = ${base * base}` 拼接，别把加号当成拼接符又忘了空格。'],
        30,
        [
          ['3', '2^2 = 4\n4^2 = 16\n6^2 = 36'],
          ['5', '2^2 = 4\n4^2 = 16\n6^2 = 36\n8^2 = 64\n10^2 = 100'],
          ['8', '2^2 = 4\n4^2 = 16\n6^2 = 36\n8^2 = 64\n10^2 = 100\n12^2 = 144\n14^2 = 196\n16^2 = 256']
        ],
        'const n = Number(input.trim());\nfor (let i = 1; i <= n; i++) {\n  const base = i * 2;\n  console.log(`${base}^2 = ${base * base}`);\n}'
      ),
      task('b4', 'basic', 4, '单词长度表', 'split 与逐项统计',
        '把一行单词拆开，逐行输出单词和长度。',
        '读入一行由空格分隔的单词，输出每个单词及其字符数，格式为 word:length；保持单词原来的顺序。',
        '一行，若干由单个空格分隔的英文单词。',
        '每行 word:length，不输出多余空格。',
        ['split', 'length', '遍历'],
        ['先 trim 再按空格拆分；连续空格用 /\\s+/ 更稳。', '字符串的 length 数的是 UTF-16 单元；英文单词直接数即可。'],
        30,
        [
          ['JavaScript makes web alive', 'JavaScript:10\nmakes:5\nweb:3\nalive:5'],
          ['code runs fast', 'code:4\nruns:4\nfast:4'],
          ['a bb ccc', 'a:1\nbb:2\nccc:3']
        ],
        'const words = input.trim().split(/\\s+/).filter(Boolean);\nfor (const word of words) {\n  console.log(`${word}:${word.length}`);\n}'
      ),
      task('b5', 'basic', 5, '摄氏温度表', 'toFixed 与小数位',
        '把华氏温度批量换算成摄氏温度。',
        '读入一行用英文逗号分隔的华氏整数，逐行输出 `华氏F = 摄氏C`，摄氏保留 1 位小数。',
        '一行，若干个用逗号分隔的整数。',
        '每行形如 32F = 0.0C；必须保留 1 位小数。',
        ['map', 'toFixed', '浮点'],
        ['摄氏 = (华氏 - 32) × 5 / 9。', 'toFixed(1) 返回字符串，不要再用 Number 转回去，否则会丢掉末尾的 .0。'],
        30,
        [
          ['32,212,98', '32F = 0.0C\n212F = 100.0C\n98F = 36.7C'],
          ['0,100', '0F = -17.8C\n100F = 37.8C'],
          ['-40', '-40F = -40.0C']
        ],
        'const values = input.trim().split(",").map(Number);\nfor (const f of values) {\n  const c = ((f - 32) * 5 / 9).toFixed(1);\n  console.log(`${f}F = ${c}C`);\n}'
      ),
      task('b6', 'basic', 6, '字符串反转', 'Unicode 不能只按 length 切',
        '把输入文本完整倒过来。',
        '读入一行文本，按字符倒序输出。要求中文和 emoji 也作为单个字符处理，不能把代理对拆开。',
        '一行文本，可能包含中文、英文或 emoji。',
        '一行，倒序后的文本。',
        ['Array.from', 'reverse', 'Unicode'],
        ['直接 split("") 会把部分 emoji 拆成两个半字符。', '用 Array.from(text) 先转成字符数组，再 reverse、join。'],
        30,
        [
          ['JavaScript', 'tpircSavaJ'],
          ['hello world', 'dlrow olleh'],
          ['你好JS', 'SJ好你']
        ],
        'const text = input.replace(/\\r?\\n$/, "");\nconsole.log(Array.from(text).reverse().join(""));'
      ),
      task('i1', 'intermediate', 1, '词频排序', '先统计，再按两个键排序',
        '统计一行单词的出现次数，按次数和字典序输出。',
        '读入一行由空格分隔的单词，统计每个单词出现次数。按次数从高到低输出；次数相同按单词字典序升序。每行输出 `word count`。',
        '一行，若干由单个空格分隔的单词。',
        '每行 `word count`，顺序符合题意。',
        ['Map', 'sort', 'localeCompare'],
        ['先用 Map 计数，再转成 [word, count] 数组。', '排序比较器先比 count 降序，count 相同再 localeCompare 升序。'],
        40,
        [
          ['the cat the dog the', 'the 3\ncat 1\ndog 1'],
          ['a b b c c c', 'c 3\nb 2\na 1'],
          ['apple banana apple cherry banana apple', 'apple 3\nbanana 2\ncherry 1']
        ],
        'const words = input.trim().split(/\\s+/).filter(Boolean);\nconst counts = new Map();\nfor (const word of words) counts.set(word, (counts.get(word) || 0) + 1);\nconst rows = Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));\nfor (const [word, count] of rows) console.log(`${word} ${count}`);'
      ),
      task('i2', 'intermediate', 2, '区间合并', '排序后维护当前右端点',
        '把重叠或相接的闭区间合并。',
        '第一行读入 n，随后 n 行每行两个整数 a b，表示闭区间 [a, b]。按起点排序后合并所有重叠或相接的区间，按起点升序输出 `a-b`。',
        '第一行 n；随后 n 行，每行 a b。',
        '每行一个合并后的区间，格式 a-b。',
        ['排序', '区间', '边界'],
        ['先按起点升序排序；起点相同可以按终点升序。', '下一个区间的起点小于等于当前右端点时合并，右端点取两者的最大值。'],
        40,
        [
          ['3\n1 3\n2 6\n8 10', '1-6\n8-10'],
          ['4\n1 4\n4 5\n7 8\n2 3', '1-5\n7-8'],
          ['3\n5 7\n1 2\n3 4', '1-2\n3-4\n5-7']
        ],
        'const lines = input.trim().split(/\\r?\\n/);\nconst n = Number(lines[0]);\nconst spans = lines.slice(1, n + 1).map(line => line.split(/\\s+/).map(Number));\nspans.sort((a, b) => a[0] - b[0] || a[1] - b[1]);\nconst merged = [];\nfor (const span of spans) {\n  const last = merged[merged.length - 1];\n  if (last && span[0] <= last[1]) last[1] = Math.max(last[1], span[1]);\n  else merged.push(span.slice());\n}\nfor (const span of merged) console.log(`${span[0]}-${span[1]}`);'
      ),
      task('i3', 'intermediate', 3, '矩阵转置', '行列互换',
        '把矩阵按主对角线翻转。',
        '第一行读入 rows cols，随后 rows 行每行 cols 个整数。输出转置后的矩阵：共 cols 行，每行 rows 个整数，用单个空格分隔。',
        '第一行 rows cols；随后 rows 行矩阵。',
        '共 cols 行，每行 rows 个数。',
        ['二维数组', '行列', '边界'],
        ['转置后第 i 行第 j 列等于原矩阵第 j 行第 i 列。', '先创建 cols × rows 的结果数组，再逐格填值，别直接交换不存在的格子。'],
        40,
        [
          ['2 3\n1 2 3\n4 5 6', '1 4\n2 5\n3 6'],
          ['3 3\n1 2 3\n4 5 6\n7 8 9', '1 4 7\n2 5 8\n3 6 9'],
          ['1 4\n10 20 30 40', '10\n20\n30\n40']
        ],
        'const lines = input.trim().split(/\\r?\\n/);\nconst [rows, cols] = lines[0].split(/\\s+/).map(Number);\nconst matrix = lines.slice(1, rows + 1).map(line => line.split(/\\s+/).map(Number));\nfor (let c = 0; c < cols; c++) {\n  const row = [];\n  for (let r = 0; r < rows; r++) row.push(matrix[r][c]);\n  console.log(row.join(" "));\n}'
      ),
      task('i4', 'intermediate', 4, '括号匹配', '栈的第一次实战',
        '判断三种括号是否成对且嵌套正确。',
        '读入一行只包含 () [] {} 的字符串。括号必须类型匹配、顺序正确；全部匹配输出 YES，否则输出 NO。',
        '一行括号字符串。',
        'YES 或 NO。',
        ['栈', 'Map', '回退'],
        ['遇到左括号入栈；遇到右括号时，栈顶必须是同类型的左括号。', '扫描结束后栈为空才算全部匹配；中途类型不符可以直接判定失败。'],
        40,
        [
          ['([]{})', 'YES'],
          ['([)]', 'NO'],
          ['((', 'NO']
        ],
        'const text = input.trim();\nconst stack = [];\nconst pairs = { ")": "(", "]": "[", "}": "{" };\nlet ok = true;\nfor (const ch of text) {\n  if (ch === "(" || ch === "[" || ch === "{") stack.push(ch);\n  else if (pairs[ch]) {\n    if (stack.pop() !== pairs[ch]) { ok = false; break; }\n  }\n}\nconsole.log(ok && stack.length === 0 ? "YES" : "NO");'
      ),
      task('i5', 'intermediate', 5, '区间和查询', '前缀和把 O(n) 查询压成 O(1)',
        '多次查询数组区间和。',
        '第一行读入 n q；第二行 n 个整数；随后 q 行每行 l r（1-based，包含端点）。对每个查询输出区间和，每个结果一行。',
        '第一行 n q；第二行数组；随后 q 行查询。',
        '每个查询一行，共 q 行。',
        ['前缀和', '1-based', '数组'],
        ['前缀和 prefix[i] 表示前 i 个数的和，区间 [l, r] 的和是 prefix[r] - prefix[l - 1]。', '注意把 1-based 下标转换时不要越界；prefix[0] = 0。'],
        40,
        [
          ['5 3\n1 2 3 4 5\n1 3\n2 5\n4 4', '6\n14\n4'],
          ['4 2\n10 20 30 40\n1 4\n2 3', '100\n50'],
          ['3 3\n-1 2 -3\n1 1\n2 3\n1 3', '-1\n-1\n-2']
        ],
        'const lines = input.trim().split(/\\r?\\n/);\nconst [n, q] = lines[0].split(/\\s+/).map(Number);\nconst nums = lines[1].split(/\\s+/).map(Number);\nconst prefix = [0];\nfor (let i = 0; i < n; i++) prefix.push(prefix[i] + nums[i]);\nfor (let i = 0; i < q; i++) {\n  const [l, r] = lines[2 + i].split(/\\s+/).map(Number);\n  console.log(prefix[r] - prefix[l - 1]);\n}'
      ),
      task('i6', 'intermediate', 6, '成绩排名', '多键排序与稳定输出',
        '按分数从高到低排名，同分按名字升序。',
        '第一行读入 n；随后 n 行每行 `name score`。按 score 从高到低排序，分数相同按 name 字典序升序，输出 `name score`。',
        '第一行 n；随后 n 行姓名和整数分数。',
        '每行一名学生，格式 name score。',
        ['对象数组', 'sort', 'localeCompare'],
        ['把每行解析成 { name, score }，不要用字符串直接比较分数。', '比较器先 b.score - a.score，再 a.name.localeCompare(b.name)。'],
        40,
        [
          ['3\nAda 90\nBob 85\nCara 90', 'Ada 90\nCara 90\nBob 85'],
          ['3\nZoe 70\nAmy 70\nKen 95', 'Ken 95\nAmy 70\nZoe 70'],
          ['2\nBob 60\nAda 80', 'Ada 80\nBob 60']
        ],
        'const lines = input.trim().split(/\\r?\\n/);\nconst n = Number(lines[0]);\nconst students = lines.slice(1, n + 1).map(line => {\n  const parts = line.trim().split(/\\s+/);\n  return { name: parts[0], score: Number(parts[1]) };\n});\nstudents.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));\nfor (const s of students) console.log(`${s.name} ${s.score}`);'
      ),
      task('c1', 'challenge', 1, '最长不重复子串', '滑动窗口的长度',
        '求不含重复字符的最长子串长度。',
        '读入一行字符串，输出其中不含重复字符的最长连续子串的长度。空字符串输出 0。',
        '一行字符串，可能包含英文、数字或空格。',
        '一个整数。',
        ['滑动窗口', 'Set', '最长'],
        ['维护一个窗口，右指针逐步扩张；遇到重复字符时，左指针跳过上一次出现的位置。', '更稳的写法是用 Map 记录字符最近一次下标，左指针直接跳到 max(left, lastIndex + 1)。'],
        50,
        [
          ['abcabcbb', '3'],
          ['bbbbb', '1'],
          ['pwwkew', '3']
        ],
        'const text = input.replace(/\\r?\\n$/, "");\nconst last = new Map();\nlet left = 0, best = 0;\nfor (let right = 0; right < text.length; right++) {\n  const ch = text[right];\n  if (last.has(ch) && last.get(ch) >= left) left = last.get(ch) + 1;\n  last.set(ch, right);\n  best = Math.max(best, right - left + 1);\n}\nconsole.log(best);'
      ),
      task('c2', 'challenge', 2, '合并有序数组', '不要重新排序整段',
        '把两个升序数组原地合并成一个升序数组。',
        '第一行读入 n m；第二行 n 个升序整数；第三行 m 个升序整数。输出合并后的升序序列，用一个空格分隔。',
        '第一行 n m；随后两行数组。',
        '一行，合并后的升序序列。',
        ['双指针', '合并', '边界'],
        ['用两个指针分别指向两个数组的开头，每次取较小的一个。', '一个数组走完后，把另一个数组剩余部分全部接到结果里；不要忘记空数组。'],
        50,
        [
          ['3 2\n1 3 5\n2 4 6', '1 2 3 4 5 6'],
          ['2 3\n1 4\n2 3 5', '1 2 3 4 5'],
          ['3 0\n1 2 3\n', '1 2 3']
        ],
        'const lines = input.trim().split(/\\r?\\n/);\nconst [n, m] = lines[0].split(/\\s+/).map(Number);\nconst a = n ? lines[1].split(/\\s+/).map(Number) : [];\nconst b = m ? lines[2].split(/\\s+/).map(Number) : [];\nconst out = [];\nlet i = 0, j = 0;\nwhile (i < a.length && j < b.length) out.push(a[i] <= b[j] ? a[i++] : b[j++]);\nwhile (i < a.length) out.push(a[i++]);\nwhile (j < b.length) out.push(b[j++]);\nconsole.log(out.join(" "));'
      ),
      task('c3', 'challenge', 3, '大整数加一', 'Number 会丢精度',
        '给一个可能超过安全整数的十进制字符串加一。',
        '读入一个非负整数字符串，输出它加一后的十进制结果。输入长度可达 30 位，不能直接用 Number 计算。',
        '一行，非负整数字符串。',
        '一行，加一后的结果。',
        ['BigInt', '字符串', '精度'],
        ['Number.MAX_SAFE_INTEGER 只有 16 位十进制，超长数字会失真。', '用 BigInt(input) + 1n，再转成字符串输出；不要用 parseInt。'],
        50,
        [
          ['123', '124'],
          ['999', '1000'],
          ['9007199254740993', '9007199254740994']
        ],
        'const text = input.trim();\nconsole.log((BigInt(text) + 1n).toString());'
      ),
      task('c4', 'challenge', 4, '银行卡校验', 'Luhn 算法的奇偶位',
        '用 Luhn 校验一串数字是否合法。',
        '读入一行数字，使用 Luhn 算法校验。合法输出 VALID，不合法输出 INVALID。忽略空格与连字符。',
        '一行数字，可包含空格或连字符。',
        'VALID 或 INVALID。',
        ['Luhn', '双倍求和', '取模'],
        ['从右往左数，偶数位（从右数第 2 位起）乘 2；乘积大于 9 就减去 9。', '所有位求和后能被 10 整除才合法；输入长度小于 2 直接不合法。'],
        50,
        [
          ['4532015112830366', 'VALID'],
          ['79927398713', 'VALID'],
          ['1234567812345678', 'INVALID']
        ],
        'const digits = input.replace(/[\\s-]/g, "");\nif (!/^\\d{2,}$/.test(digits)) {\n  console.log("INVALID");\n} else {\n  let sum = 0;\n  let double = false;\n  for (let i = digits.length - 1; i >= 0; i--) {\n    let n = Number(digits[i]);\n    if (double) {\n      n *= 2;\n      if (n > 9) n -= 9;\n    }\n    sum += n;\n    double = !double;\n  }\n  console.log(sum % 10 === 0 ? "VALID" : "INVALID");\n}'
      ),
      task('c5', 'challenge', 5, '版本号比较', '按段比较，忽略末尾零',
        '比较两个用点分隔的版本号。',
        '读入一行两个版本号，用空格分隔。按每一段数字从左到右比较；缺少的段按 0 处理，末尾的 0 不影响大小。若左侧版本更大输出 1，更小输出 -1，相等输出 0。',
        '一行两个版本号，例如 1.2.3 1.2.4。',
        '1、-1 或 0。',
        ['split', '前导零', '边界'],
        ['先按点拆成数组，逐段转 Number 比较，不要把 1.10 当成字符串比。', '长度不同时，缺失段补 0；1.0 和 1.0.0 应判相等。'],
        50,
        [
          ['1.2.3 1.2.4', '-1'],
          ['1.0 1.0.0', '0'],
          ['2.10.1 2.9.9', '1']
        ],
        'const [a, b] = input.trim().split(/\\s+/);\nconst pa = a.split("."), pb = b.split(".");\nconst len = Math.max(pa.length, pb.length);\nlet result = 0;\nfor (let i = 0; i < len; i++) {\n  const x = Number(pa[i] || 0);\n  const y = Number(pb[i] || 0);\n  if (x > y) { result = 1; break; }\n  if (x < y) { result = -1; break; }\n}\nconsole.log(result);'
      ),
      task('c6', 'challenge', 6, '股票最大利润', '一次买卖的最大差价',
        '只能先买后卖一次，求最大利润。',
        '读入一行用逗号分隔的股票价格，允许先买入一次、之后卖出一次。输出最大利润；不能获利时输出 0。',
        '一行，若干个用逗号分隔的非负整数。',
        '一个整数，表示最大利润。',
        ['贪心', '最小值', '一次遍历'],
        ['遍历时维护此前出现过的最低价格，用当前价格减最低价更新答案。', '不要先找最小值再找它后面的最大值就结束；最低价可能出现在后面。'],
        50,
        [
          ['7,1,5,3,6,4', '5'],
          ['7,6,4,3,1', '0'],
          ['2,4,1,7', '6']
        ],
        'const prices = input.trim().split(",").map(Number);\nlet minPrice = Infinity, best = 0;\nfor (const price of prices) {\n  if (price < minPrice) minPrice = price;\n  else best = Math.max(best, price - minPrice);\n}\nconsole.log(best);'
      ),
      task('b7', 'basic', 7, '闰年判断', '四个条件，两个分支',
        '判断一年是不是闰年。',
        '读入年份 year（1 ≤ year ≤ 3000）。闰年输出 YES，平年输出 NO。规则：能被 4 整除但不能被 100 整除，或者能被 400 整除。',
        '一行，一个整数 year。',
        'YES 或 NO。',
        ['取模', '逻辑运算', '边界'],
        ['把规则拆成两个条件：`year % 4 === 0 && year % 100 !== 0`，或者 `year % 400 === 0`。','1900 能被 4 整除也能被 100 整除，但不是闰年；2000 能被 400 整除，是闰年。'],
        30,
        [
          ['2024', 'YES'],
          ['1900', 'NO'],
          ['2000', 'YES']
        ],
        'const year = Number(input.trim());\nconst leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;\nconsole.log(leap ? "YES" : "NO");'
      ),
      task('b8', 'basic', 8, '数字反转', '前导零不要在输出里出现',
        '把一个非负整数的十进制数字倒过来。',
        '读入非负整数 n（0 ≤ n ≤ 999999）。输出反转后的整数，不能带前导零；0 反转还是 0。',
        '一行，一个非负整数。',
        '一行，反转后的整数。',
        ['字符串', 'Number', '前导零'],
        ['先转字符串、反转、再转回 Number，前导零会自动消失。','120 反转是 021，输出必须是 21；1000 反转是 0001，输出 1。'],
        30,
        [
          ['120', '21'],
          ['7', '7'],
          ['1000', '1']
        ],
        'const n = Number(input.trim());\nconst reversed = Number(String(n).split("").reverse().join(""));\nconsole.log(reversed);'
      ),
      task('i7', 'intermediate', 7, '最大公约数', '欧几里得算法',
        '求两个正整数的最大公约数。',
        '读入一行两个正整数 a b（1 ≤ a,b ≤ 100000），输出它们的最大公约数。',
        '一行，两个正整数，空格分隔。',
        '一个整数，表示 gcd(a, b)。',
        ['欧几里得', '取模', '循环'],
        ['gcd(a,b) = gcd(b, a % b)，直到 b 为 0，答案是 a。','不要用`min(a,b)`向下枚举，数字大时会很慢。'],
        40,
        [
          ['12 18', '6'],
          ['7 13', '1'],
          ['100 75', '25']
        ],
        'let [a, b] = input.trim().split(/\\s+/).map(Number);\nwhile (b !== 0) {\n  const t = a % b;\n  a = b;\n  b = t;\n}\nconsole.log(a);'
      ),
      task('i8', 'intermediate', 8, '去重并排序', '先 Set，再按数字大小排',
        '把一组整数去重后升序输出。',
        '第一行读入 n，第二行读入 n 个整数。输出去重后的升序序列，用一个空格分隔。',
        '第一行 n；第二行 n 个整数。',
        '一行，去重且升序的整数序列。',
        ['Set', 'sort', '数字比较器'],
        ['`new Set(nums)` 去重，转数组后用 `(a,b) => a - b` 排序。','不要直接 `sort()`，默认按字符串字典序，10 会排在 2 前面。'],
        40,
        [
          ['5\n3 1 3 2 1', '1 2 3'],
          ['3\n10 2 10', '2 10'],
          ['4\n-1 0 -1 2', '-1 0 2']
        ],
        'const lines = input.trim().split(/\\r?\\n/);\nconst nums = lines[1].split(/\\s+/).map(Number);\nconst out = Array.from(new Set(nums)).sort((a, b) => a - b);\nconsole.log(out.join(" "));'
      ),
      task('c7', 'challenge', 7, '最大子数组和', 'Kadane 的一次遍历',
        '求连续子数组的最大和。',
        '第一行读入 n，第二行读入 n 个整数（可能为负）。输出所有非空连续子数组中的最大和。',
        '第一行 n；第二行 n 个整数。',
        '一个整数，表示最大子数组和。',
        ['动态规划', 'Kadane', '负数'],
        ['维护 `current = max(x, current + x)`，`best = max(best, current)`。','全负数时答案不是 0，而是最大的那个负数；初始化不能直接写 0。'],
        50,
        [
          ['9\n-2 1 -3 4 -1 2 1 -5 4', '6'],
          ['3\n-5 -2 -9', '-2'],
          ['4\n1 2 3 4', '10']
        ],
        'const lines = input.trim().split(/\\r?\\n/);\nconst nums = lines[1].split(/\\s+/).map(Number);\nlet current = nums[0], best = nums[0];\nfor (let i = 1; i < nums.length; i++) {\n  current = Math.max(nums[i], current + nums[i]);\n  best = Math.max(best, current);\n}\nconsole.log(best);'
      ),
      task('c8', 'challenge', 8, '螺旋矩阵', '四条边界逐层收缩',
        '按顺时针螺旋顺序输出矩阵元素。',
        '第一行读入 rows cols，随后 rows 行每行 cols 个整数。从左上角开始顺时针螺旋遍历，输出一行，数字用单个空格分隔。',
        '第一行 rows cols；随后 rows 行矩阵。',
        '一行，螺旋顺序的所有元素。',
        ['边界', '四指针', '矩阵'],
        ['维护 top、bottom、left、right 四条边界，依次走完上边、右边、下边、左边，再收缩边界。','每一轮走完要检查边界是否仍然合法，否则单行或单列会重复输出。'],
        50,
        [
          ['3 3\n1 2 3\n4 5 6\n7 8 9', '1 2 3 6 9 8 7 4 5'],
          ['2 3\n1 2 3\n4 5 6', '1 2 3 6 5 4'],
          ['1 4\n1 2 3 4', '1 2 3 4']
        ],
        'const lines = input.trim().split(/\\r?\\n/);\nconst [rows, cols] = lines[0].split(/\\s+/).map(Number);\nconst m = lines.slice(1, rows + 1).map(line => line.split(/\\s+/).map(Number));\nconst out = [];\nlet top = 0, bottom = rows - 1, left = 0, right = cols - 1;\nwhile (top <= bottom && left <= right) {\n  for (let c = left; c <= right; c++) out.push(m[top][c]);\n  top++;\n  for (let r = top; r <= bottom; r++) out.push(m[r][right]);\n  right--;\n  if (top <= bottom) {\n    for (let c = right; c >= left; c--) out.push(m[bottom][c]);\n    bottom--;\n  }\n  if (left <= right) {\n    for (let r = bottom; r >= top; r--) out.push(m[r][left]);\n    left++;\n  }\n}\nconsole.log(out.join(" "));'
      )
    ]
  };
})();

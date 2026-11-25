/* Python 改错练习室 · 初始题库（36 题，三档各 12 题）
   每题由 gen(rng) 随机数值；expected 由 JS 公式给出，题目自带埋点。
   页面不依赖运行时 bug 注入，保证无网络也能出题；判题仍由真实 CPython / Judge0 执行。 */
(function (root) {
  function bug(code, name, before, after, why, tip) {
    const lines = code.split('\n');
    let line = 0;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === String(before).trim()) { line = i + 1; break; }
    }
    let afterText = String(after);
    if (!/^[ \t]/.test(afterText)) {
      const indent = (lines[line - 1].match(/^[ \t]*/) || [''])[0];
      afterText = indent + afterText;
    }
    return { line, name, before, after: afterText, why, tip };
  }
  const r3 = (r, max) => {
    const out = [];
    let v = r.int(2, 9);
    for (let i = 0; i < max; i++) { out.push(v); v += r.int(1, 4); }
    return out;
  };
  const words = ['python', 'river', 'glass', 'orange', 'planet', 'silver', 'camera'];
  const names = ['Ada', 'Bob', 'Cara', 'Dan'];

  const T = {
    basic: [
      { id: 'py-b01', group: 'Python 基础 · 变量与输出', topic: '变量名 / NameError', summary: '打印变量时把名字敲错了。',
        gen: function (r) {
          const name = r.pick(names);
          const code = `name = "${name}"\nprint(nmae)`;
          return { title: '名字敲错了', desc: '这段代码想打印 name，但运行会报错。找出变量名里的拼写问题。',
            topic: '变量名 / NameError', code, expected: name,
            bugs: [bug(code, '变量名拼错', 'print(nmae)', 'print(name)',
              'nmae 不是已定义的变量，Python 会抛 NameError。', '变量名要逐字符对照；name 和 nmae 只差两个字母，最容易看漏。')] };
        } },
      { id: 'py-b02', group: 'Python 基础 · 循环累加', topic: '循环累加 / 赋值', summary: '累加变量每轮被覆盖。',
        gen: function (r) {
          const nums = r3(r, 3);
          const sum = nums.reduce((a, b) => a + b, 0);
          const code = `nums = [${nums.join(', ')}]\ntotal = 0\nfor n in nums:\n    total = n\nprint(total)`;
          return { title: '列表求和', desc: '目标是输出三个数的总和，但循环里每次都把 total 覆盖了。',
            topic: '循环累加 / 赋值', code, expected: String(sum),
            bugs: [bug(code, '累加写成赋值', 'total = n', 'total += n',
              'total = n 每轮都用当前元素覆盖之前的结果，最后只剩最后一个数。', '求和要先初始化 0，再在循环里 +=；先拿第一个数试算，看看第二轮有没有保留上一轮结果。')] };
        } },
      { id: 'py-b03', group: 'Python 基础 · range', topic: 'range 上界 / 边界', summary: 'range 不包含终点。',
        gen: function (r) {
          const n = r.int(5, 12);
          const sum = n * (n + 1) / 2;
          const code = `total = 0\nfor i in range(1, ${n}):\n    total += i\nprint(total)`;
          return { title: '1 到 n 的和', desc: '想求 1 到 n 的整数和，但结果总是少一个 n。',
            topic: 'range 上界 / 边界', code, expected: String(sum),
            bugs: [bug(code, 'range 少跑终点', `for i in range(1, ${n}):`, `for i in range(1, ${n + 1}):`,
              'range(1, n) 只到 n-1；要包含 n，上界必须写 n+1。', 'range(a, b) 是左闭右开，永远不包含 b。求 1 到 n 时写 range(1, n + 1)。')] };
        } },
      { id: 'py-b04', group: 'Python 基础 · 运算符', topic: '整除 / 浮点除法', summary: '// 会丢掉小数。',
        gen: function (r) {
          const b = r.pick([2, 4, 5]);
          const a = b * 2 + 1;
          const result = String(a / b);
          const code = `a = ${a}\nb = ${b}\nprint(a // b)`;
          return { title: '平均值的小数', desc: '目标是输出 a 除以 b 的精确结果，但代码把小数丢掉了。',
            topic: '整除 / 浮点除法', code, expected: result,
            bugs: [bug(code, '整除截断小数', 'print(a // b)', 'print(a / b)',
              '// 是整除，结果只保留整数部分；/ 才返回浮点数。', 'Python 3 的 / 总是浮点除法；只要看到 //，就要问自己是不是真的想丢掉小数。')] };
        } },
      { id: 'py-b05', group: 'Python 基础 · 字符串', topic: '字符串方法 / 大小写', summary: 'upper 和 lower 方向相反。',
        gen: function (r) {
          const word = r.pick(words);
          const code = `word = "${word}"\nprint(word.lower())`;
          return { title: '转成大写', desc: '目标是全部大写，但现在输出的是小写。',
            topic: '字符串方法 / 大小写', code, expected: word.toUpperCase(),
            bugs: [bug(code, '大小写方法用反', 'print(word.lower())', 'print(word.upper())',
              'lower() 变小写，upper() 变大写，方法选反了。', '记法：upper 是“往上抬”，lower 是“往下压”。不确定时先在 REPL 里对一个小字符串试一次。')] };
        } },
      { id: 'py-b06', group: 'Python 基础 · 内置函数', topic: 'max / min', summary: '求最大值却用了 min。',
        gen: function (r) {
          const nums = r3(r, 4);
          const max = Math.max.apply(null, nums);
          const code = `nums = [${nums.join(', ')}]\nprint(min(nums))`;
          return { title: '最大值在哪', desc: '目标输出列表最大值，但代码输出了最小值。',
            topic: 'max / min', code, expected: String(max),
            bugs: [bug(code, 'max/min 用反', 'print(min(nums))', 'print(max(nums))',
              'min 选最小、max 选最大；这里要最大。', '写之前先读题干的“最大/最小”，再选函数。拿 [3, 1, 4] 这种顺序打乱的数据验证，别用已经排好序的列表。')] };
        } },
      { id: 'py-b07', group: 'Python 基础 · 条件判断', topic: '取模 / 偶数判断', summary: '偶数的余数是 0。',
        gen: function (r) {
          const nums = r3(r, 5);
          const evens = nums.filter(n => n % 2 === 0).length;
          const code = `nums = [${nums.join(', ')}]\ncount = 0\nfor n in nums:\n    if n % 2 == 1:\n        count += 1\nprint(count)`;
          return { title: '数偶数', desc: '目标是统计偶数的个数，但条件写成了奇数。',
            topic: '取模 / 偶数判断', code, expected: String(evens),
            bugs: [bug(code, '偶数条件写反', 'if n % 2 == 1:', 'if n % 2 == 0:',
              'n % 2 == 1 命中奇数；偶数应该余 0。', '偶数定义是能被 2 整除，也就是 n % 2 == 0。计数前先拿 2 和 3 各试一次。')] };
        } },
      { id: 'py-b08', group: 'Python 基础 · 切片', topic: '切片方向', summary: '负下标从末尾数。',
        gen: function (r) {
          const word = r.pick(words);
          const code = `word = "${word}"\nprint(word[-3:])`;
          return { title: '取前三个字符', desc: '目标是取单词前三个字符，现在取成了后三个。',
            topic: '切片方向', code, expected: word.slice(0, 3),
            bugs: [bug(code, '切片方向反了', 'print(word[-3:])', 'print(word[:3])',
              '[-3:] 从倒数第三个取到末尾；要前三个应写 [:3]。', '切片格式是 [start:stop]，省略 start 就从 0 开始。负下标是从末尾倒数，别和前三个混了。')] };
        } },
      { id: 'py-b09', group: 'Python 基础 · 格式化', topic: 'f-string / 插值', summary: '字符串里的变量没被替换。',
        gen: function (r) {
          const name = r.pick(names);
          const age = r.int(8, 16);
          const code = `name = "${name}"\nage = ${age}\nprint("name is age")`;
          return { title: '自我介绍', desc: '目标是输出“名字 is 年龄”，但打印出来的是字面量。',
            topic: 'f-string / 插值', code, expected: `${name} is ${age}`,
            bugs: [bug(code, '忘了 f-string', 'print("name is age")', 'print(f"{name} is {age}")',
              '普通字符串不会替换变量；前面加 f 才会把 {name}、{age} 求值。', 'f-string 的 f 不能丢；花括号里放变量名，不要给变量名加引号。')] };
        } },
      { id: 'py-b10', group: 'Python 基础 · 变量交换', topic: '临时变量 / 交换', summary: '交换时把原值覆盖了。',
        gen: function (r) {
          const a = r.int(2, 9), b = r.int(10, 19);
          const code = `a = ${a}\nb = ${b}\ntemp = a\na = b\nb = a\nprint(a, b)`;
          return { title: '交换两个变量', desc: '目标是交换 a、b 的值，但最后两个变量变成了同一个数。',
            topic: '临时变量 / 交换', code, expected: `${b} ${a}`,
            bugs: [bug(code, '交换时覆盖原值', 'b = a', 'b = temp',
              'a 已经被 b 覆盖，b = a 会把 b 变成新的 a，原来的 b 丢了。', '交换三步曲：temp = a；a = b；b = temp。Python 也可以一行写 a, b = b, a。')] };
        } },
      { id: 'py-b11', group: 'Python 基础 · 列表索引', topic: '零基下标', summary: '第一个元素下标是 0。',
        gen: function (r) {
          const list = ['red', 'green', 'blue'];
          const code = `names = ["${list.join('", "')}"]\nprint(names[1])`;
          return { title: '取第一个元素', desc: '目标是输出列表第一个元素，但现在输出的是第二个。',
            topic: '零基下标', code, expected: list[0],
            bugs: [bug(code, '下标偏移', 'print(names[1])', 'print(names[0])',
              'Python 下标从 0 开始，names[1] 是第二个元素。', '第一个元素是 [0]，最后一个是 [-1]。读代码时先数下标，不要按“第几个”直接填。')] };
        } },
      { id: 'py-b12', group: 'Python 基础 · 字符串拼接', topic: '拼接顺序', summary: '拼接顺序反了。',
        gen: function (r) {
          const first = 'Py', second = 'thon';
          const code = `first = "${first}"\nsecond = "${second}"\nprint(second + first)`;
          return { title: '拼出 Python', desc: '两个字符串顺序接反了，输出成了 thonPy。',
            topic: '拼接顺序', code, expected: first + second,
            bugs: [bug(code, '拼接顺序反了', 'print(second + first)', 'print(first + second)',
              'second + first 会先放 thon 再放 Py，顺序与目标相反。', '拼接按从左到右的顺序生成结果；写之前先念一遍目标字符串的先后。')] };
        } }
    ],
    intermediate: [
      { id: 'py-i01', group: 'Python 进阶 · 字典', topic: 'KeyError / 键名', summary: '字典键区分大小写。',
        gen: function (r) {
          const code = `scores = {"Alice": 90, "Bob": 78}\nprint(scores["alice"])`;
          return { title: '字典取分数', desc: '想取 Alice 的分数，但运行抛 KeyError。',
            topic: 'KeyError / 键名', code, expected: '90',
            bugs: [bug(code, '键名大小写不匹配', 'print(scores["alice"])', 'print(scores["Alice"])',
              '字典的字符串键区分大小写，alice 和 Alice 是两个不同的键。', '取键前先看定义，字符串键要逐字符一致；不确定时用 .get() 观察是否存在。')] };
        } },
      { id: 'py-i02', group: 'Python 进阶 · 函数', topic: '缩进 / return 位置', summary: 'return 放进了循环体。',
        gen: function (r) {
          const nums = r3(r, 4);
          const sum = nums.reduce((a, b) => a + b, 0);
          const code = `def total(nums):\n    result = 0\n    for n in nums:\n        result += n\n        return result\nprint(total([${nums.join(', ')}]))`;
          return { title: '函数总是返回第一个数', desc: '求和函数只返回了第一个元素，后面的加法没有生效。',
            topic: '缩进 / return 位置', code, expected: String(sum),
            bugs: [bug(code, 'return 缩进进循环', '        return result', '    return result',
              'return 在循环体内，第一轮就结束函数；应该等循环结束再返回。', 'Python 用缩进表示代码块。return 要放在 for 的同一级，而不是 for 里面。')] };
        } },
      { id: 'py-i03', group: 'Python 进阶 · enumerate', topic: 'enumerate 起始值', summary: '编号从 0 还是 1 开始。',
        gen: function (r) {
          const list = ['red', 'green', 'blue'];
          const code = `names = ["${list.join('", "')}"]\nfor i, name in enumerate(names):\n    print(i, name)`;
          return { title: '编号从 1 开始', desc: '想输出 1 red、2 green、3 blue，结果编号都小了 1。',
            topic: 'enumerate 起始值', code, expected: '1 red\n2 green\n3 blue',
            bugs: [bug(code, 'enumerate 从 0 开始', 'print(i, name)', 'print(i + 1, name)',
              'enumerate 默认从 0 开始，直接 print(i) 会得到 0、1、2；目标编号从 1 开始。', '两种写法二选一：enumerate(names, 1) 配 i，或 enumerate(names) 配 i+1。不要两个都加。')] };
        } },
      { id: 'py-i04', group: 'Python 进阶 · 排序', topic: 'sort / reverse', summary: '排序方向反了。',
        gen: function (r) {
          const raw = r3(r, 4);
          const nums = raw.slice().sort((a, b) => b - a);
          const code = `nums = [${raw.join(', ')}]\nnums.sort(reverse=False)\nprint(nums)`;
          return { title: '从大到小排序', desc: '目标是从大到小，但代码排成了从小到大。',
            topic: 'sort / reverse', code, expected: '[' + nums.join(', ') + ']',
            bugs: [bug(code, 'reverse 方向反了', 'nums.sort(reverse=False)', 'nums.sort(reverse=True)',
              'reverse=False 是升序；降序要 reverse=True。', 'sort 默认升序；想降序写 reverse=True。不确定时拿 [3, 1, 2] 手动跑一遍。')] };
        } },
      { id: 'py-i05', group: 'Python 进阶 · 字符串拆分', topic: 'split 分隔符', summary: '分隔符和文本不一致。',
        gen: function (r) {
          const code = `text = "red,green,blue"\nprint(len(text.split(" ")))`;
          return { title: '按逗号拆分', desc: '文本是逗号分隔，但代码按空格拆分，结果只得到一段。',
            topic: 'split 分隔符', code, expected: '3',
            bugs: [bug(code, 'split 分隔符写错', 'print(len(text.split(" ")))', 'print(len(text.split(",")))',
              'split(" ") 按空格拆，text 里没有空格，所以整段是一个元素。', '先看文本里真正的分隔符是逗号、空格还是换行，再把同一个字符传给 split。')] };
        } },
      { id: 'py-i06', group: 'Python 进阶 · 列表推导式', topic: '推导式条件', summary: '筛选条件反了。',
        gen: function (r) {
          const nums = r3(r, 5);
          const evens = nums.filter(n => n % 2 === 0);
          const code = `nums = [${nums.join(', ')}]\nevens = [n for n in nums if n % 2 == 1]\nprint(evens)`;
          return { title: '只留偶数', desc: '想用列表推导式筛出偶数，但现在留下的是奇数。',
            topic: '推导式条件', code, expected: '[' + evens.join(', ') + ']',
            bugs: [bug(code, '推导式条件写反', 'evens = [n for n in nums if n % 2 == 1]', 'evens = [n for n in nums if n % 2 == 0]',
              'n % 2 == 1 命中奇数；偶数要余 0。', '列表推导式的 if 在最后，先读“要留下什么”，再写条件。拿 2 和 3 各测一次。')] };
        } },
      { id: 'py-i07', group: 'Python 进阶 · 字典遍历', topic: 'items / 输出顺序', summary: '键值顺序反了。',
        gen: function (r) {
          const code = `prices = {"apple": 3, "pear": 4}\nfor name, price in prices.items():\n    print(price, name)`;
          return { title: '打印水果和价格', desc: '目标是先水果名再价格，但现在两列反了。',
            topic: 'items / 输出顺序', code, expected: 'apple 3\npear 4',
            bugs: [bug(code, '键值顺序反了', 'print(price, name)', 'print(name, price)',
              'items() 解包得到 name、price，print 的顺序也要对应。', '先写解包顺序，再写 print 顺序，两边保持一致；变量名起得清楚就不容易反。')] };
        } },
      { id: 'py-i08', group: 'Python 进阶 · 异常', topic: 'except 类型', summary: '捕获了错误的异常类型。',
        gen: function (r) {
          const code = `try:\n    print(10 / 0)\nexcept ValueError:\n    print("caught")`;
          return { title: '除零异常', desc: '代码想捕获除零错误，但 except 写成了 ValueError，异常没有被接住。',
            topic: 'except 类型', code, expected: 'caught',
            bugs: [bug(code, 'except 类型不对', 'except ValueError:', 'except ZeroDivisionError:',
              '10 / 0 抛 ZeroDivisionError，ValueError 接不住。', 'except 只接指定类型的异常；先确认可能抛什么，再写对应类型。拿 0 做除数试。')] };
        } },
      { id: 'py-i09', group: 'Python 进阶 · 集合', topic: '交集 / 并集运算符', summary: '& 才是交集。',
        gen: function (r) {
          const code = `a = {1, 2, 3}\nb = {2, 3, 4}\nprint(sorted(a | b))`;
          return { title: '两个集合的交集', desc: '目标是交集，但代码用了并集运算符。',
            topic: '交集 / 并集运算符', code, expected: '[2, 3]',
            bugs: [bug(code, '并集当成交集', 'print(sorted(a | b))', 'print(sorted(a & b))',
              '| 是并集，& 是交集；这里要两个集合都有的元素。', '集合运算符：& 交集、| 并集、- 差集。用 sorted 包一层可让输出稳定。')] };
        } },
      { id: 'py-i10', group: 'Python 进阶 · 生成器表达式', topic: 'any / all', summary: 'any 和 all 语义不同。',
        gen: function (r) {
          const code = `nums = [3, -1, 4]\nprint(all(n > 0 for n in nums))`;
          return { title: '是否至少有一个负数', desc: '目标是判断是否存在负数，但代码要求所有数都满足条件。',
            topic: 'any / all', code, expected: 'True',
            bugs: [bug(code, 'all 当成 any', 'print(all(n > 0 for n in nums))', 'print(any(n < 0 for n in nums))',
              'all 要求全部为真；any 只要有一个为真。这里要判断“至少一个负数”。', 'any：存在一个；all：全部都要。条件也要跟着改，不能只换函数名。')] };
        } },
      { id: 'py-i11', group: 'Python 进阶 · join', topic: 'join 分隔符', summary: 'join 的分隔符为空串。',
        gen: function (r) {
          const code = `words = ["a", "b", "c"]\nprint("".join(words))`;
          return { title: '用短横线连接', desc: '目标是用 - 连接三个字母，但代码直接粘在一起。',
            topic: 'join 分隔符', code, expected: 'a-b-c',
            bugs: [bug(code, 'join 分隔符为空', 'print("".join(words))', 'print("-".join(words))',
              'join 前面的字符串就是分隔符，空串会把元素直接拼在一起。', 'join 的写法是 "分隔符".join(列表)；分隔符写在引号里。')] };
        } },
      { id: 'py-i12', group: 'Python 进阶 · 可变对象', topic: '别名 / 浅拷贝', summary: 'b = a 不是复制。',
        gen: function (r) {
          const code = `a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)`;
          return { title: '复制列表', desc: '目标是保留 a 原样，只修改副本 b，但 a 也跟着变了。',
            topic: '别名 / 浅拷贝', code, expected: '[1, 2, 3]',
            bugs: [bug(code, '列表别名未复制', 'b = a', 'b = a[:]',
              'b = a 让两个变量指向同一个列表；改 b 等于改 a。', '要独立副本用 a[:]、list(a) 或 copy.copy(a)。赋值号不会复制可变对象。')] };
        } }
    ],
    hard: [
      { id: 'py-h01', group: 'Python 困难 · 二维列表', topic: '行列下标 / IndexError', summary: '非方阵转置下标写反。',
        gen: function (r) {
          const m = [[1, 2, 3], [4, 5, 6]];
          const code = `matrix = [[1, 2, 3], [4, 5, 6]]\ntotal = 0\nfor i in range(len(matrix)):\n    for j in range(len(matrix[0])):\n        total += matrix[j][i]\nprint(total)`;
          return { title: '二维列表求和', desc: '矩阵不是方阵，内层下标反了会导致越界。',
            topic: '行列下标 / IndexError', code, expected: '21',
            bugs: [bug(code, '行列下标写反', 'total += matrix[j][i]', 'total += matrix[i][j]',
              'matrix 只有 2 行，j 最大到 2 时会访问 matrix[2] 越界；内层遍历列应使用 matrix[i][j]。', '二维列表先确认行数 len(matrix) 和列数 len(matrix[0])；外层 i 取行，内层 j 取列。')] };
        } },
      { id: 'py-h02', group: 'Python 困难 · 递归', topic: '阶乘 / 基例', summary: '阶乘的 0! 是 1。',
        gen: function (r) {
          const code = `def fact(n):\n    if n == 0:\n        return 0\n    return n * fact(n - 1)\nprint(fact(5))`;
          return { title: '递归求阶乘', desc: 'fact(5) 的结果是 0，因为基例返回了 0。',
            topic: '阶乘 / 基例', code, expected: '120',
            bugs: [
              bug(code, '阶乘基例错误', 'return 0', 'return 1', '0 的阶乘定义为 1；基例返回 0 会让整个乘积归零。', '递归先写最小规模：fact(0) = 1，fact(1) = 1。基例错，整条递归都会错。'),
              bug(code, '递归步长错误', 'return n * fact(n - 1)', 'return n * fact(n - 1)', '这一行本身写法正确；检查基例后仍然错误时，再核对递归规模是否严格减小。', '每次递归必须让 n 变小，并从基例自然结束。')].filter(b => b.before !== b.after)
          };
        } },
      { id: 'py-h03', group: 'Python 困难 · 递归', topic: '斐波那契 / 递推', summary: '递推项漏了一项。',
        gen: function (r) {
          const code = `def fib(n):\n    if n <= 1:\n        return n\n    return fib(n - 1) + fib(n - 3)\nprint(fib(6))`;
          return { title: '斐波那契第 n 项', desc: 'fib(6) 的结果不对，递推式少了一项。',
            topic: '斐波那契 / 递推', code, expected: '8',
            bugs: [bug(code, '递推项写错', 'return fib(n - 1) + fib(n - 3)', 'return fib(n - 1) + fib(n - 2)',
              '斐波那契是前两项相加；n-3 会跳过一项。', '写出递推式后，用 fib(2)、fib(3) 手动验证：fib(2)=1、fib(3)=2。')] };
        } },
      { id: 'py-h04', group: 'Python 困难 · 闭包', topic: '闭包 / 运算符', summary: '加法闭包写成了减法。',
        gen: function (r) {
          const code = `def make_adder(x):\n    def add(y):\n        return x - y\n    return add\nadd5 = make_adder(5)\nprint(add5(3))`;
          return { title: '加法闭包', desc: 'make_adder(5)(3) 应该得到 8，但现在得到 2。',
            topic: '闭包 / 运算符', code, expected: '8',
            bugs: [bug(code, '闭包内运算符写反', 'return x - y', 'return x + y',
              '内层函数捕获了外层 x，但运算符把加法写成了减法。', '闭包先确认捕获了哪个外层变量，再核对内层运算。用 x=5、y=3 手算。')] };
        } },
      { id: 'py-h05', group: 'Python 困难 · 可变参数', topic: '*args / 累加', summary: '累加器被覆盖。',
        gen: function (r) {
          const code = `def total(*nums):\n    result = 0\n    for n in nums:\n        result = n\n    return result\nprint(total(1, 2, 3, 4))`;
          return { title: '任意个数的和', desc: 'total(1,2,3,4) 只返回了最后一个 4。',
            topic: '*args / 累加', code, expected: '10',
            bugs: [
              bug(code, '累加写成赋值', 'result = n', 'result += n', '每轮把 result 覆盖成当前参数，最后只剩最后一个数。', '累加器先置 0，再在循环里 +=；用 1、2、3 三个参数就能看出覆盖。'),
              bug(code, '初始值写错', 'result = 0', 'result = 0', '0 是求和的正确单位元；如果改成 1，结果会整体多 1。', '求和初始化 0，求积初始化 1。')].filter(b => b.before !== b.after)
          };
        } },
      { id: 'py-h06', group: 'Python 困难 · 排序键', topic: 'sorted key / reverse', summary: '排序方向和键都错了。',
        gen: function (r) {
          const code = `words = ["bb", "a", "ccc"]\nprint(sorted(words, key=len, reverse=False))`;
          return { title: '按长度从长到短', desc: '目标是按长度降序，但代码按升序排。',
            topic: 'sorted key / reverse', code, expected: "['ccc', 'bb', 'a']",
            bugs: [bug(code, '排序方向反了', 'print(sorted(words, key=len, reverse=False))', 'print(sorted(words, key=len, reverse=True))',
              'reverse=False 是升序；按长度从长到短要 reverse=True。', 'sorted 默认升序。key 决定“按什么比”，reverse 决定“从大到小还是从小到大”。')] };
        } },
      { id: 'py-h07', group: 'Python 困难 · 字典默认值', topic: 'get / KeyError', summary: '不存在的键不能直接取。',
        gen: function (r) {
          const code = `counts = {"a": 1}\nprint(counts["b"])`;
          return { title: '统计不存在的键', desc: '目标是缺失时输出 0，但代码直接取键导致 KeyError。',
            topic: 'get / KeyError', code, expected: '0',
            bugs: [bug(code, '缺失键直接索引', 'print(counts["b"])', 'print(counts.get("b", 0))',
              '字典索引不存在的键会抛 KeyError；get 可以给默认值。', '计数场景常用 counts.get(key, 0) 或 collections.Counter。先判断存在再取也行。')] };
        } },
      { id: 'py-h08', group: 'Python 困难 · 列表别名', topic: '浅拷贝 / 重复引用', summary: '乘列表复制的是引用。',
        gen: function (r) {
          const code = `row = [0, 0]\ngrid = [row] * 2\ngrid[0][0] = 1\nprint(grid)`;
          return { title: '两行独立的表格', desc: '目标只改第一行，但第二行也跟着变了。',
            topic: '浅拷贝 / 重复引用', code, expected: '[[1, 0], [0, 0]]',
            bugs: [bug(code, '列表乘法复制引用', 'grid = [row] * 2', 'grid = [row[:], row[:]]',
              '[row] * 2 只是把同一个 row 的引用放两次；改一行会影响两行。', '嵌套列表要用独立副本，例如 [row[:] for _ in range(2)]。')] };
        } },
      { id: 'py-h09', group: 'Python 困难 · range 步长', topic: 'range step', summary: '步长写错，累加范围变了。',
        gen: function (r) {
          const code = `total = 0\nfor i in range(1, 10, 3):\n    total += i\nprint(total)`;
          return { title: '奇数累加', desc: '目标是 1 到 9 的奇数之和，但步长写成了 3。',
            topic: 'range step', code, expected: '25',
            bugs: [bug(code, 'range 步长写错', 'for i in range(1, 10, 3):', 'for i in range(1, 10, 2):',
              '步长 3 只取 1、4、7，漏掉 3、5、9。', 'range(start, stop, step)：奇数序列从 1 开始、步长 2、终点不包含 10。')] };
        } },
      { id: 'py-h10', group: 'Python 困难 · while', topic: 'while 边界', summary: '循环条件多跑一轮。',
        gen: function (r) {
          const code = `n = 8\ncount = 0\nwhile n >= 0:\n    count += 1\n    n -= 2\nprint(count)`;
          return { title: '倒数到 0', desc: '目标是统计 8、6、4、2、0 的轮数，但循环多跑了一轮。',
            topic: 'while 边界', code, expected: '4',
            bugs: [bug(code, 'while 边界多算一轮', 'while n >= 0:', 'while n > 0:', '条件 >= 0 会在 n=0 时再进一次循环，轮数多 1。', '拿最小边界手算：n=0 时还应不应该执行？根据题意决定 > 0 还是 >= 0。')] };
        } },
      { id: 'py-h11', group: 'Python 困难 · enumerate', topic: '双层编号', summary: 'start 和 i+1 重复加。',
        gen: function (r) {
          const code = `names = ["a", "b", "c"]\nfor i, name in enumerate(names, 1):\n    print(i + 1, name)`;
          return { title: '编号 1 到 3', desc: '目标是 1 a、2 b、3 c，但输出从 2 开始。',
            topic: '双层编号', code, expected: '1 a\n2 b\n3 c',
            bugs: [bug(code, '编号重复加 1', 'print(i + 1, name)', 'print(i, name)',
              'enumerate 已经从 1 开始，print 又加 1，编号整体多 1。', 'enumerate(start=1) 后直接用 i；若 enumerate 默认从 0 开始，才用 i+1。')] };
        } },
      { id: 'py-h12', group: 'Python 困难 · 生成器', topic: 'yield / return', summary: '生成器里用了 return。',
        gen: function (r) {
          const code = `def squares(n):\n    for i in range(n):\n        return i * i\nprint(sum(squares(4)))`;
          return { title: '平方数生成器', desc: '目标是生成 0、1、4、9 并求和，但函数只返回了一次。',
            topic: 'yield / return', code, expected: '14',
            bugs: [bug(code, '生成器用了 return', 'return i * i', 'yield i * i',
              'return 会立刻结束函数；生成器要逐个产出，必须用 yield。', '生成器的关键字是 yield：每执行一次产出一个值，下次从暂停处继续。')] };
        } }
    ]
  };
  root.PY_TEMPLATES = T;
})(typeof window !== 'undefined' ? window : globalThis);

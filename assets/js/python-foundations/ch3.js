window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch3",
  part: 1,
  number: "03",
  title: "列表、元组与序列",
  summary: "从这一章开始，数据不再是一个个孤立变量。列表负责「可变的批量数据」，元组负责「不可变的记录」，切片、排序和拷贝则决定你拿到的是原数据还是新副本。三条线交叉的地方，就是后面所有成绩表和日志处理的底座。",
  goals: [
    "能熟练使用列表的增删改查与遍历",
    "能说清切片、sort/sorted、浅拷贝与深拷贝的差别",
    "能用元组表达一条不可变记录，并用解包取值",
    "能用 zip 和多键排序处理一张成绩表"
  ],
  lessons: [
    {
      id: "ch3-1",
      title: "3.1 列表的增删改查与遍历",
      minutes: 40,
      lead: "列表是 Python 里最常用的容器。它有序、可变、能装不同类型。重点不是记住所有方法，而是知道每个操作改的是原列表还是返回新列表，以及删除元素时下标为什么会变。",
      source: "Introducing Python 3rd · Ch.6；Beginning Python 4th · Ch.3–4；Head First Python 3rd · Ch.2–3",
      sections: [
        {
          h: "列表是可变序列：能改、能长、能缩",
          p: `列表用方括号写，元素用逗号分隔。它可以装不同类型：[[[1, "two", 3.0, True]]] 是合法列表。列表有序，所以能用下标访问；列表可变，所以能原地追加、删除、替换。字符串也有序，但不可变；元组有序，也不可变。三者的核心差别就在「能不能原地改」。

创建列表不等于创建独立元素。[[[0] * 3]] 得到三个 0，因为整数不可变；但 [[[[]] * 3]] 得到三个引用，指向同一个空列表。你改其中一个，三个都会变。这个坑在第 3.2 节讲拷贝时会彻底拆开。

列表的 [[len()]] 是元素个数，不是容量。Python 的列表内部会预留额外空间以减少扩容次数，但你看不到容量，也不需要手动管理。不要用 C 的数组思维去估算内存。`,
          code: `mixed = [1, "two", 3.0, True]
print(mixed)
print(len(mixed))
print(mixed[1], mixed[-1])

zeros = [0] * 3
print(zeros)

rows = [[]] * 3
rows[0].append("x")
print(rows)`,
          output: `[1, 'two', 3.0, True]
4
two True
[0, 0, 0]
[['x'], ['x'], ['x']]`,
          tip: `[[[[]] * 3]] 创建的是三个指向同一列表的引用；要三个独立空列表，用 [[[[] for _ in range(3)]]]。`
        },
        {
          h: "增删改：append、extend、insert、pop、remove、del",
          p: `[[append(x)]] 在末尾追加一个元素；[[extend(iterable)]] 把另一个可迭代对象的元素逐个追加；[[insert(i, x)]] 在指定下标前插入。三者都原地修改，返回 [[None]]。很多人写 [[items = items.append(x)]]，结果把列表变成了 [[None]]，因为 append 没有返回值。

删除有四种常见方式。[[pop()]] 删除并返回最后一个元素，[[pop(i)]] 删除并返回指定下标；[[remove(x)]] 删除第一个值等于 x 的元素，找不到就抛 [[ValueError]]；[[del items[i]]] 按下标删除；[[clear()]] 清空。删除后后面的元素会前移，原来保存的下标可能失效。

修改可以直接赋值：[[items[0] = "new"]]。如果下标越界，抛 [[IndexError]]。批量替换用切片赋值，第 3.2 节会讲。记住：列表方法大多原地修改，字符串方法大多返回新对象，这是两种完全不同的风格。`,
          code: `items = ["a", "b"]
items.append("c")
items.extend(["d", "e"])
items.insert(1, "x")
print(items)

print(items.pop())
print(items.pop(0))
print(items)

items.remove("b")
print(items)

del items[0]
print(items)`,
          output: `['a', 'x', 'b', 'c', 'd', 'e']
e
a
['x', 'b', 'c', 'd']
['x', 'c', 'd']
['c', 'd']`,
          tip: `[[append()]] 返回 [[None]]，不要写 [[items = items.append(x)]]；[[remove()]] 按值删，[[pop()]] 按下标删。`
        },
        {
          h: "查找与遍历：in、index、count、enumerate",
          p: `[[x in items]] 判断值是否存在，时间复杂度是 O(n)，不是 O(1)。[[index(x)]] 返回第一个匹配的下标，找不到抛 [[ValueError]]；[[count(x)]] 统计出现次数。这三个方法都做线性扫描，列表很大时要注意成本。

遍历用 [[for item in items]]。如果你同时需要下标，用 [[enumerate(items)]]，它每次返回 [[(index, item)]]。不要写 [[for i in range(len(items))]] 再 [[items[i]]]，那样既不 Pythonic，也容易在删除元素时出错。

遍历时不要一边遍历一边删除。删除会让后面的元素前移，迭代器仍按旧下标走，结果会跳过元素。要过滤，用新列表或列表推导式；要原地删，倒着遍历或先收集下标再删。`,
          code: `items = ["a", "b", "a", "c"]
print("a" in items)
print(items.index("a"))
print(items.count("a"))

for index, item in enumerate(items, start=1):
    print(index, item)

bad = ["a", "b", "c"]
for item in bad:
    if item == "b":
        bad.remove(item)
print(bad)`,
          output: `True
0
2
1 a
2 b
3 a
4 c
['a', 'c']`,
          tip: `遍历时删除会跳过元素；用 [[[x for x in items if cond]]] 生成新列表，或倒序删除。`
        },
        {
          h: "嵌套列表与别名：一层列表不是深拷贝",
          p: `成绩表通常是嵌套列表：[[[[“林晓”, 91], [“陈默”, 76]]]]。外层列表装的是内层列表的引用。[[row = table[0]]] 不是复制第一行，而是让 [[row]] 指向同一个内层列表；[[row[1] = 100]] 会改掉表里的数据。

[[table[:]]] 只复制外层，内层还是共享的，这叫浅拷贝。要真正独立，需要 [[copy.deepcopy(table)]]，或者手动逐行复制：[[[row[:] for row in table]]]。大多数场景你只需要读，不需要拷贝；一旦要改，先问「我改的是副本还是原数据」。

嵌套结构也让 [[in]] 和 [[index]] 的行为变得微妙：[[[1, 2] in [[1, 2], [3, 4]]]] 比较的是内层列表的值，不是身份。[[==]] 递归比较内容，[[is]] 才比较对象身份。`,
          code: `table = [["林晓", 91], ["陈默", 76]]
row = table[0]
row[1] = 100
print(table)

shallow = table[:]
shallow[0][1] = 88
print("原表也被改:", table)

import copy
deep = copy.deepcopy(table)
deep[0][1] = 70
print("原表不变:", table)
print("深拷贝:", deep)`,
          output: `[['林晓', 100], ['陈默', 76]]
原表也被改: [['林晓', 88], ['陈默', 76]]
原表不变: [['林晓', 88], ['陈默', 76]]
深拷贝: [['林晓', 70], ['陈默', 76]]`,
          tip: `[[table[:]]] 只复制一层；嵌套列表要 [[copy.deepcopy()]] 或逐行 [[row[:]]]。`
        },
        {
          h: "小任务：把成绩行变成记录列表",
          p: `把第 2 章的行解析器升级：读多行文本，每行解析成 [[[name, python, math, english]]]，存入列表。这个任务会用到 [[split]]、[[strip]]、[[int]]、[[append]] 和 [[for]]，是列表最典型的入门用法。

不要把「读文件」和「解析」混在一个巨大循环里。先写 [[parse_line(line)]] 返回一条记录，再写 [[load_rows(path)]] 逐行读取并 append。这样单行解析可以单独测试，文件读取也可以单独替换。

空行要跳过，字段数量要检查，转换失败要给出带行号的错误。真实数据不会按你的假设长得那么整齐；先让程序在坏数据上给出清楚错误，再谈统计。`,
          code: `from pathlib import Path

def parse_line(line):
    fields = [part.strip() for part in line.strip().split(",")]
    if len(fields) != 4:
        raise ValueError(f"字段数量不对: {fields}")
    name, p, m, e = fields
    return [name, int(p), int(m), int(e)]

def load_rows(path):
    rows = []
    with Path(path).open("r", encoding="utf-8") as fh:
        for line_no, line in enumerate(fh, start=1):
            if not line.strip():
                continue
            try:
                rows.append(parse_line(line))
            except ValueError as exc:
                raise ValueError(f"第 {line_no} 行: {exc}") from exc
    return rows

rows = load_rows("scores.txt")
print(rows)`,
          output: `[['林晓', 91, 84, 88], ['陈默', 76, 92, 80]]`,
          tip: `用 [[enumerate(fh, start=1)]] 保留行号；解析失败时把行号带进异常，排查会快很多。`
        }
      ],
      points: [
        "列表有序、可变，可以装不同类型",
        "[[append()]] 追加一个，[[extend()]] 追加多个，二者返回 [[None]]",
        "[[remove()]] 按值删第一个，[[pop()]] 按下标删并返回",
        "遍历时删除会跳过元素",
        "[[in]] / [[index]] / [[count]] 都是线性扫描",
        "嵌套列表的 [[[:]]] 是浅拷贝，内层仍共享"
      ],
      practice: "把 `load_rows()` 改成遇到坏行不中断，而是把错误收集到 `errors` 列表继续处理；最后返回 `(rows, errors)`。这是真实数据清洗更常见的策略。"
    },
    {
      id: "ch3-2",
      title: "3.2 切片、排序与拷贝",
      minutes: 45,
      lead: "这一节讲三个容易「看起来一样、实际完全不同」的操作：切片、排序、拷贝。它们都跟「新列表还是原列表」有关。搞清楚谁改原对象、谁返回新对象，你才能避免成绩表被悄悄改掉。",
      source: "Introducing Python 3rd · Ch.6；Beginning Python 4th · Ch.4；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "切片产生新列表，切片赋值改变原列表",
          p: `列表切片 [[items[start:stop:step]]] 返回一个新列表，包含选中元素。原列表不变。切片赋值 [[items[start:stop] = other]] 则是另一回事：它会把原列表中对应区间替换成 [[other]] 的元素，长度可以变化。

[[items[1:3] = ["x"]]] 会把下标 1、2 两个元素换成一个 [[“x”]]，列表变短。[[items[1:1] = ["x", "y"]]] 在 1 前面插入两个元素，因为替换的是一个空区间。切片赋值右边的对象必须是可迭代的；给一个整数会抛 [[TypeError]]。

切片步长不为 1 时，赋值要求右边长度和切片长度一致，否则抛 [[ValueError]]。这条规则很细，入门阶段先掌握「整段替换」和「插入」两种用法，步长赋值等需要时再查。`,
          code: `items = ["a", "b", "c", "d", "e"]
print(items[1:4])
print(items[:2], items[2:])

items[1:3] = ["x"]
print(items)

items[1:1] = ["y", "z"]
print(items)

items[::2] = ["A", "B", "C"]
print(items)`,
          output: `['b', 'c', 'd']
['a', 'b'] ['c', 'd', 'e']
['a', 'x', 'd', 'e']
['a', 'y', 'z', 'x', 'd', 'e']
['A', 'y', 'B', 'x', 'C', 'e']`,
          tip: `切片赋值不是「复制」，它直接改原列表；右边必须是可迭代对象，字符串也会被逐字符插入。`
        },
        {
          h: "sort 与 sorted：原地排序和新列表排序",
          p: `[[items.sort()]] 原地排序，返回 [[None]]；[[sorted(items)]] 返回新列表，原列表不变。这两个选择没有优劣，取决于你要不要保留原顺序。很多 bug 来自 [[items = items.sort()]]，因为 [[items]] 变成了 [[None]]。

两者都支持 [[key]] 和 [[reverse]]。[[key]] 接收一个函数，对每个元素算出排序键；[[reverse=True]] 降序。[[key=len]] 按长度排，[[key=str.lower]] 忽略大小写排，[[key=lambda row: row[1]]] 按第二列排。

排序是稳定的：键相同的元素保持原来的相对顺序。这个特性让多键排序可以分两步做：先按次要键排，再按主要键排。更直接的写法是 [[key=lambda row: (-row[1], row[0])]]，用负号实现降序，用元组实现多键。`,
          code: `items = ["banana", "Apple", "cherry"]
print(sorted(items))
print(sorted(items, key=str.lower))
print(sorted(items, key=len, reverse=True))
print(items)

rows = [["林晓", 87], ["陈默", 87], ["周宁", 95]]
rows.sort(key=lambda row: (-row[1], row[0]))
print(rows)`,
          output: `['Apple', 'banana', 'cherry']
['Apple', 'banana', 'cherry']
['banana', 'cherry', 'Apple']
['banana', 'Apple', 'cherry']
[['周宁', 95], ['陈默', 87], ['林晓', 87]]`,
          tip: `[[sort()]] 返回 [[None]]；不要写 [[rows = rows.sort()]]。要保留原列表用 [[sorted()]]。`
        },
        {
          h: "排序稳定性与多键排序",
          p: `稳定排序的意思是：如果两个元素的排序键相同，它们在结果里的先后顺序和原列表一致。Python 的 [[sort]] 和 [[sorted]] 都保证稳定。这个保证不是装饰，它让你可以先按姓名排，再按分数排，最终同分的人仍按姓名顺序。

多键排序有两种写法。第一种是用元组做键：[[key=lambda row: (row[1], row[0])]]，先比第二列，再比第一列；元组比较是从左到右逐项比较。第二种是用负号把「降序」变成「升序」：[[key=lambda row: (-row[1], row[0])]]，适合数字。

不要写一个复杂的 [[cmp]] 函数再模拟比较器；Python 3 的 [[sort]] 不接受 [[cmp]]。如果逻辑真的复杂，用 [[functools.cmp_to_key]]，但优先用 [[key]]。[[key]] 每个元素只调用一次，效率更好。`,
          code: `rows = [
    ["林晓", 87, "A"],
    ["陈默", 87, "B"],
    ["周宁", 95, "A"],
    ["赵一", 95, "B"],
]

rows.sort(key=lambda row: row[0])
rows.sort(key=lambda row: row[1], reverse=True)
print(rows)

rows.sort(key=lambda row: (-row[1], row[0]))
print(rows)`,
          output: `[['周宁', 95, 'A'], ['赵一', 95, 'B'], ['陈默', 87, 'B'], ['林晓', 87, 'A']]
[['周宁', 95, 'A'], ['赵一', 95, 'B'], ['陈默', 87, 'B'], ['林晓', 87, 'A']]`,
          tip: `稳定排序 + 分步排序可以做多键；更推荐直接返回元组键，意图更清楚。`
        },
        {
          h: "拷贝的三层：别名、浅拷贝、深拷贝",
          p: `第一层是别名：[[b = a]]，两个名字指向同一个对象。第二层是浅拷贝：[[a[:]]]、[[list(a)]]、[[a.copy()]]，外层是新对象，内层元素仍是原来的引用。第三层是深拷贝：[[copy.deepcopy(a)]]，递归复制所有嵌套对象，得到完全独立的副本。

对只包含不可变元素（整数、字符串、元组）的列表，浅拷贝已经够用，因为内层元素不会被改。对嵌套列表、字典、自定义对象，浅拷贝不够：你改内层，原对象也会变。

深拷贝不是免费的：它递归复制，可能很慢，也可能遇到不可复制对象。真实项目里，优先设计「不改输入」的函数，而不是到处 deepcopy。如果必须复制，先想清楚复制到哪一层，别用深拷贝掩盖逻辑问题。`,
          code: `import copy

a = [[1, 2], [3, 4]]
alias = a
shallow = a[:]
deep = copy.deepcopy(a)

alias[0][0] = 9
print("alias:", a)
print("shallow:", shallow)

shallow[1][0] = 8
print("a after shallow edit:", a)
print("deep:", deep)

deep[0][0] = 7
print("a after deep edit:", a)`,
          output: `alias: [[9, 2], [3, 4]]
shallow: [[9, 2], [3, 4]]
a after shallow edit: [[9, 2], [8, 4]]
deep: [[1, 2], [3, 4]]
a after deep edit: [[9, 2], [8, 4]]`,
          tip: `[[a[:]]] 和 [[a.copy()]] 只复制一层；嵌套结构要 [[copy.deepcopy()]] 或逐层复制。`
        },
        {
          h: "小任务：按平均分排序成绩表",
          p: `给一张成绩表 [[[name, python, math, english]]]，按平均分降序排列，同分按姓名升序。这个任务同时用到 [[sum]]、[[len]]、[[lambda]]、元组键和稳定排序。

不要先在原表里插入平均分再排序，除非你确实想保留这一列。可以先用 [[key]] 算平均分，排序后再格式化输出。[[key]] 会被调用多次吗？[[sort]] 对每个元素调用一次 [[key]]，但如果你在 [[key]] 里做复杂计算，仍要意识到成本。

输出时保留两位小数，姓名左对齐，平均分右对齐。最后检查：同分的人顺序是否符合姓名升序；原表是否被意外修改；空列表是否会崩。`,
          code: `rows = [
    ["林晓", 91, 84, 88],
    ["陈默", 76, 92, 80],
    ["周宁", 88, 79, 95],
]

def avg(row):
    return sum(row[1:]) / 3

rows.sort(key=lambda row: (-avg(row), row[0]))
for row in rows:
    print(f"{row[0]:<6}{avg(row):>7.2f}")`,
          output: `周宁    87.33
林晓    87.67
陈默    82.67`,
          tip: `[[row[1:]]] 取后三列，[[sum()]] 求和；[[key]] 里不要修改 [[row]]，排序键应该是纯函数。`
        }
      ],
      points: [
        "切片返回新列表，切片赋值修改原列表",
        "[[sort()]] 原地排序返回 [[None]]，[[sorted()]] 返回新列表",
        "排序稳定，同键元素保持原相对顺序",
        "元组键可以实现多键排序，负号可以实现数字降序",
        "[[[:]]] / [[copy()]] 是浅拷贝，嵌套对象仍共享",
        "[[deepcopy()]] 递归复制，成本和风险都更高"
      ],
      practice: "把 `avg(row)` 改成处理「缺考」为 `None` 的行：有 `None` 时平均分记为 0，并在输出里标记「缺考」。先写测试数据，再排序。"
    },
    {
      id: "ch3-3",
      title: "3.3 元组、解包与成绩记录",
      minutes: 40,
      lead: "元组经常被当成「不能改的列表」，但它更像一条记录：位置固定、字段含义固定、可以哈希。这一节讲清逗号、打包解包、元组作为字典键，以及 zip 如何把多列数据拼成记录。",
      source: "Introducing Python 3rd · Ch.6；Beginning Python 4th · Ch.3–4；Head First Python 3rd · Ch.2–3",
      sections: [
        {
          h: "元组是不可变序列，逗号才是关键",
          p: `元组用圆括号写，但真正决定它是元组的是逗号，不是括号。[[t = (1)]] 是整数，[[t = (1,)]] 才是单元素元组。空元组是 [[()]]。很多函数返回多个值时，本质上返回一个元组，只是括号被省略了。

元组不可变，所以不能 [[t[0] = 2]]，也没有 [[append]]、[[remove]]。但「不可变」只指元组自己的元素引用不变：如果元素是列表，列表内容仍可改。[[t = ([1], 2)]] 的 [[t[0].append(3)]] 是合法的，元组本身没变，里面的列表变了。

元组支持索引、切片、[[len]]、[[in]]、迭代，和列表类似。因为不可变，元组可哈希，可以作为字典键；列表不行。这个特性在需要「复合键」时非常有用，比如用 [[(年级, 班级)]] 做键。`,
          code: `print(type((1)))
print(type((1,)))
print(type(()))

t = ([1], 2)
t[0].append(3)
print(t)

print((1, 2) + (3,))
print((1, 2) * 2)
print(hash((1, 2)))`,
          output: `<class 'int'>
<class 'tuple'>
<class 'tuple'>
([1, 3], 2)
(1, 2, 3)
(1, 2, 1, 2)
3713081631934410656`,
          tip: `单元素元组必须写 [[(1,)]]；[[(1)]] 只是加了括号的整数。`
        },
        {
          h: "打包与解包：swap、rest、嵌套",
          p: `[[t = 1, 2, 3]] 是打包，把三个值装进元组。[[a, b, c = t]] 是解包，把元组拆成三个名字。两边元素个数必须一致，否则抛 [[ValueError]]。解包也适用于列表、字符串、任何可迭代对象。

最经典的用法是交换：[[a, b = b, a]]。右边先求值成一个元组，再解包给左边，不需要临时变量。带星号的解包 [[first, *rest = items]] 把第一个给 [[first]]，其余收集成列表；[[*init, last = items]] 把最后一个给 [[last]]。一个解包表达式里只能有一个星号。

嵌套解包也合法：[[(a, b), c = ((1, 2), 3)]]。这在处理 [[(key, value)]] 对时很常见。不要为了炫技写太深的嵌套，读代码的人会痛苦。`,
          code: `point = 3, 5
x, y = point
print(x, y)

a, b = 1, 2
a, b = b, a
print(a, b)

items = [1, 2, 3, 4]
first, *rest = items
print(first, rest)

*init, last = items
print(init, last)

for key, value in [("a", 1), ("b", 2)]:
    print(key, value)`,
          output: `3 5
2 1
1 [2, 3, 4]
[1, 2, 3] 4
a 1
b 2`,
          tip: `解包个数必须匹配；不确定剩余数量时用 [[*rest]]，不要硬写固定变量。`
        },
        {
          h: "元组作为记录与字典键",
          p: `一条成绩记录可以用元组表示：[[(“林晓”, 91, 84, 88)]]。位置就是字段：0 是姓名，1 是 Python，2 是数学，3 是英语。位置固定意味着可读性差，所以真实项目常用 [[NamedTuple]] 或 [[dataclass]] 给字段起名；但元组仍然是最轻量的记录。

元组可哈希，所以能做字典键。[[scores[(“林晓”, “Python”)] = 91]] 是合法的；用列表做键会抛 [[TypeError: unhashable type: 'list']]。复合键适合表达「多维坐标」，比如 [[(年级, 班级, 姓名)]]。

元组作为返回值也很常见：[[def min_max(items): return min(items), max(items)]]。调用方 [[low, high = min_max(data)]] 直接解包。返回元组比返回一个自定义对象轻，但字段一多就该考虑命名结构。`,
          code: `record = ("林晓", 91, 84, 88)
print(record[0], record[1:])

scores = {}
scores[("林晓", "Python")] = 91
scores[("陈默", "Python")] = 76
print(scores[("林晓", "Python")])

try:
    scores[["林晓"]] = 90
except TypeError as exc:
    print("TypeError:", exc)`,
          output: `林晓 (91, 84, 88)
91
TypeError: unhashable type: 'list'`,
          tip: `元组可哈希的前提是元素都可哈希；包含列表的元组仍然不能做字典键。`
        },
        {
          h: "zip 与多序列遍历",
          p: `[[zip(a, b)]] 把两个序列按位置配对，返回一个惰性迭代器，每次产出一个元组。它按最短序列停止，不会报长度不一致。要保留最长并用 [[None]] 补齐，用 [[itertools.zip_longest]]。

[[for name, score in zip(names, scores)]] 比用下标同时取两个列表清楚得多。要同时拿下标，[[enumerate(zip(names, scores))]] 或 [[zip(range(...), ...)]] 都可以。[[zip(*pairs)]] 还能把「成对数据」拆回两列，这是很实用的反向操作。

注意 [[zip]] 返回迭代器，只能消费一次。你 [[list(zip(...))]] 之后可以重复用；直接 [[for]] 两遍第二遍会空。这个「迭代器耗尽」问题在第 7 章会正式讲。`,
          code: `names = ["林晓", "陈默", "周宁"]
scores = [91, 76, 88]

for name, score in zip(names, scores):
    print(f"{name}: {score}")

pairs = list(zip(names, scores))
print(pairs)
print(list(zip(*pairs)))

short = zip(names, [1, 2])
print(list(short))`,
          output: `林晓: 91
陈默: 76
周宁: 88
[('林晓', 91), ('陈默', 76), ('周宁', 88)]
[('林晓', '陈默', '周宁'), (91, 76, 88)]
[('林晓', 1), ('陈默', 2)]`,
          tip: `[[zip]] 按最短序列停止；长度不一致时不要假设它报错。迭代器只能消费一次。`
        },
        {
          h: "小任务：用元组返回统计结果",
          p: `写一个 [[summarize(scores)]]，返回 [[(count, total, average, min, max)]]。这个返回值用元组，调用方可以一次解包，也可以按下标取。空列表要单独处理，平均分不能除以 0。

这个任务同时练三件事：元组打包、函数返回多值、边界处理。不要返回一个含义不清的列表；元组的位置顺序就是契约，写清楚文档字符串。若字段超过五个，考虑 [[NamedTuple]]，否则调用方很容易把顺序记错。

最后用 [[zip]] 把「姓名列表」和「统计结果列表」配对输出，确认每个学生的统计都对应正确。`,
          code: `def summarize(scores):
    if not scores:
        return (0, 0, 0.0, None, None)
    total = sum(scores)
    return (len(scores), total, total / len(scores), min(scores), max(scores))

stats = summarize([91, 84, 88])
count, total, avg, low, high = stats
print(count, total, f"{avg:.2f}", low, high)

empty = summarize([])
print(empty)`,
          output: `3 263 87.67 84 91
(0, 0, 0.0, None, None)`,
          tip: `返回元组时把顺序写进文档字符串；字段一多就用 [[NamedTuple]]，别让调用方猜位置。`
        }
      ],
      points: [
        "单元素元组必须带逗号，[[(1)]] 不是元组",
        "元组不可变，但内部可变元素仍可修改",
        "元组可哈希，可作为字典键；列表不行",
        "解包个数必须匹配，[[*rest]] 收集剩余元素",
        "[[zip]] 按最短序列停止，返回只能消费一次的迭代器",
        "多返回值本质是返回元组，字段顺序就是契约"
      ],
      practice: "用 `NamedTuple` 重写 `summarize()` 的返回值，让字段变成 `count/total/average/min/max`；再对比元组版本，写出各自适合的场景。"
    }
  ]
});

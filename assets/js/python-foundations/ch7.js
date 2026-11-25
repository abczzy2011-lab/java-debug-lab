window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch7",
  part: 1,
  number: "07",
  title: "推导式、迭代器与生成器",
  summary: "这是第一篇的收束：从「能处理一批数据」升级到「能流式处理数据」。推导式让转换和过滤变得紧凑，迭代器协议解释 for 的底层，生成器则让你用固定内存处理大文件。最后把整篇的成绩数据串成一个可复用的管道。",
  goals: [
    "能写出列表、字典、集合推导式并控制嵌套顺序",
    "能解释可迭代对象与迭代器的区别",
    "能用 yield 写生成器，按需产出数据",
    "能把大文件处理写成不占内存的生成器管道"
  ],
  lessons: [
    {
      id: "ch7-1",
      title: "7.1 列表/字典/集合推导式",
      minutes: 40,
      lead: "推导式不是「写得更短」的炫技，而是把「遍历—转换—过滤」三件事压成一个表达式。用得好，代码像数据变换；用得过头，一行里塞三层循环，谁也读不懂。这一节先建立边界。",
      source: "Introducing Python 3rd · Ch.6；Beginning Python 4th · Ch.4–5；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "推导式是「表达式 + for + if」",
          p: `列表推导式的基本形状是 [[[expr for item in iterable if condition]]]。它从 [[iterable]] 逐个取 [[item]]，满足 [[condition]] 时计算 [[expr]]，把结果收集成新列表。和 [[for]] 循环相比，它把「建空列表、append、缩进」这些机械步骤省掉了。

推导式的结果一定是新列表，不会修改原数据。它适合「一对一转换」和「过滤」；不适合有副作用的操作，比如写文件、发请求、修改全局状态。需要副作用时，老老实实写 [[for]] 循环，别把 [[print]] 塞进推导式。

推导式也有作用域：在 Python 3 里，循环变量不会泄漏到外部。[[[x for x in range(3)]]] 结束后，外面的 [[x]] 不受影响。这一点和 [[for]] 循环不同，[[for]] 的循环变量会留在当前作用域。`,
          code: `scores = [91, 84, 88, 59]
passed = [score for score in scores if score >= 60]
curved = [score + 5 for score in scores]
print(passed)
print(curved)

x = "outer"
result = [x for x in range(3)]
print(result)
print(x)`,
          output: `[91, 84, 88]
[96, 89, 93, 64]
[0, 1, 2]
outer`,
          tip: `推导式只做「转换/过滤」，不要在里面写 [[print]]、[[append]] 或其他副作用。`
        },
        {
          h: "嵌套循环的顺序：先写外层还是内层",
          p: `推导式里的多个 [[for]] 按从左到右的顺序嵌套：[[[x for row in matrix for x in row]]] 等价于 [[for row in matrix: for x in row: ...]]。外层 [[for row]] 在前，内层 [[for x]] 在后。写反了，结果会完全不同，甚至报错。

如果你需要「先过滤行，再展开」，可以写成 [[[x for row in matrix if row for x in row]]]；[[if row]] 作用在 [[row]] 上，不是 [[x]]。多个 [[if]] 也可以连写，它们按顺序过滤。

嵌套推导式超过两层，可读性会急剧下降。把它拆成函数，或者用普通循环 + 有名字的中间变量。代码是给人读的，不是给「一行长度」比赛用的。`,
          code: `matrix = [[1, 2], [3, 4], [5]]
flat = [x for row in matrix for x in row]
print(flat)

pairs = [(x, y) for x in range(2) for y in range(3)]
print(pairs)

rows = [["林晓", 91], ["", 0], ["陈默", 76]]
names = [row[0] for row in rows if row[0]]
print(names)`,
          output: `[1, 2, 3, 4, 5]
[(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2)]
['林晓', '陈默']`,
          tip: `多个 [[for]] 从左到右嵌套；外层条件写在对应 [[for]] 后面，不要误以为 [[if]] 只过滤最后一个变量。`
        },
        {
          h: "字典推导式与集合推导式",
          p: `字典推导式写 [[{key_expr: value_expr for item in iterable if condition}]]。它适合把「记录列表」转成「按 ID 索引的字典」，或者把两个列表配对成映射。键必须可哈希，重复键后出现的覆盖先出现的。

集合推导式写 [[{expr for item in iterable if condition}]]，结果去重且无序。它适合「提取所有出现过的班级」这种去重需求。不要用集合推导式做需要顺序的输出；集合不保证顺序。

字典/集合推导式同样只做转换，不做副作用。需要保留重复、保留顺序时，用列表推导式；需要按键查找时，用字典推导式；只需要成员关系时，用集合推导式。`,
          code: `rows = [["S01", "林晓", 91], ["S02", "陈默", 76], ["S03", "周宁", 88]]

by_id = {row[0]: {"name": row[1], "score": row[2]} for row in rows}
print(by_id["S02"])

classes = ["A", "A", "B", "C", "B"]
unique = {c for c in classes}
print(unique)

squares = {n: n * n for n in range(5)}
print(squares)`,
          output: `{'name': '陈默', 'score': 76}
{'A', 'B', 'C'}
{0: 0, 1: 1, 2: 4, 3: 9, 4: 16}`,
          tip: `字典推导式重复键会覆盖；集合推导式会去重且无序。要保留顺序用列表。`
        },
        {
          h: "条件表达式 vs 过滤条件",
          p: `推导式里有两个容易混的「if」。写在 [[for]] 后面的 [[if]] 是**过滤**：不满足就不产出。写在 [[expr]] 里的 [[x if cond else y]] 是**条件表达式**：每个元素都产出一个结果，只是结果不同。

[[[x for x in items if x > 0]]] 只保留正数；[[[x if x > 0 else 0 for x in items]]] 保留所有元素，负数变成 0。前者结果长度可能变短，后者长度不变。用错会得到「数量不对」或「0 太多」的结果。

条件表达式必须有 [[else]]，否则不是表达式。[[x if x > 0]] 是语法错误。过滤条件不能有 [[else]]；它只决定「要不要」，不决定「换成什么」。`,
          code: `items = [-2, -1, 0, 1, 2]
only_positive = [x for x in items if x > 0]
clamped = [x if x > 0 else 0 for x in items]
print(only_positive)
print(clamped)

labels = [("pass" if x >= 0 else "fail") for x in items]
print(labels)`,
          output: `[1, 2]
[0, 0, 0, 1, 2]
['fail', 'fail', 'pass', 'pass', 'pass']`,
          tip: `过滤 [[if]] 改变结果长度；条件表达式 [[if/else]] 保持长度不变。先想清楚你要哪一种。`
        },
        {
          h: "小任务：成绩表清洗与转换",
          p: `给一批原始行 [["林晓", "91"], ["", "84"], ["陈默", "缺考"], ["周宁", "88"]]，要求：跳过空姓名；把数字转成 int；缺考记为 [[None]]；最后生成一个字典，键是姓名，值是分数。这个任务把过滤、转换、字典推导式串起来。

不要在推导式里写 [[try/except]]；推导式的表达式不适合处理复杂错误。先写一个 [[parse_score(text)]] 返回 [[int]] 或 [[None]]，再在推导式里调用它。这样错误处理有名字，推导式也保持干净。

输出前检查：空姓名是否真的跳过；缺考是否变成 [[None]]；重复姓名是否覆盖。字典推导式不会报重复键，后出现的会赢；如果业务不允许重复，先检测再构建。`,
          code: `def parse_score(text):
    text = text.strip()
    if text == "缺考":
        return None
    return int(text)

raw = [["林晓", "91"], ["", "84"], ["陈默", "缺考"], ["周宁", "88"]]
clean = [
    (row[0].strip(), parse_score(row[1]))
    for row in raw
    if row[0].strip()
]
result = {name: score for name, score in clean}
print(clean)
print(result)`,
          output: `[('林晓', 91), ('陈默', None), ('周宁', 88)]
{'林晓': 91, '陈默': None, '周宁': 88}`,
          tip: `复杂错误处理抽成函数，不要塞进推导式；字典推导式重复键静默覆盖。`
        }
      ],
      points: [
        "推导式由表达式、[[for]]、可选 [[if]] 组成，结果是新容器",
        "多个 [[for]] 从左到右嵌套，外层写在前面",
        "字典推导式重复键后值覆盖，集合推导式去重且无序",
        "过滤 [[if]] 改变结果长度，条件表达式 [[if/else]] 不改变长度",
        "推导式不要做副作用；复杂逻辑抽成函数",
        "Python 3 推导式的循环变量不会泄漏到外部"
      ],
      practice: "把 `clean` 改成同时保留原始行号：用 `enumerate(raw, start=1)`，输出 `(line_no, name, score)`；再写一个测试，确认空姓名行被跳过但行号仍正确。"
    },
    {
      id: "ch7-2",
      title: "7.2 迭代器协议与惰性求值",
      minutes: 45,
      lead: "for 为什么能遍历列表、字典、文件、生成器？答案是迭代器协议。理解 iter/next/StopIteration，你就能解释「为什么这个对象只能遍历一次」，也能自己写一个迭代器。",
      source: "Introducing Python 3rd · Ch.6；Beginning Python 4th · Ch.5–6；Head First Python 3rd · Ch.4",
      sections: [
        {
          h: "可迭代对象 vs 迭代器",
          p: `可迭代对象（iterable）是能交给 [[for]] 的东西：列表、字符串、字典、文件、range。它实现 [[__iter__]]，返回一个迭代器。迭代器（iterator）实现 [[__next__]]，每次返回下一个值，没有更多值时抛 [[StopIteration]]。

[[iter(items)]] 调用 [[__iter__]] 拿到迭代器；[[next(it)]] 调用 [[__next__]] 拿下一个值。[[for]] 循环的底层就是：先 [[iter()]]，再反复 [[next()]]，捕获 [[StopIteration]] 后结束。你写 [[for]] 时不需要手动做这些，但理解它才能解释很多现象。

迭代器通常也实现 [[__iter__]]，返回自己。所以迭代器既是可迭代对象，又是自己的迭代器。[[iter(it)]] 返回 [[it]] 本身；这也是「迭代器只能消费一次」的根源。`,
          code: `items = [1, 2, 3]
it = iter(items)
print(next(it))
print(next(it))
print(next(it))

try:
    print(next(it))
except StopIteration:
    print("StopIteration")

print(iter(it) is it)`,
          output: `1
2
3
StopIteration
True`,
          tip: `[[iter()]] 拿迭代器，[[next()]] 取下一个；[[StopIteration]] 是正常结束信号，不是错误。`
        },
        {
          h: "迭代器耗尽：为什么第二遍是空的",
          p: `迭代器是「一次性」的。[[it = iter([1, 2, 3])]] 之后，你 [[list(it)]] 得到 [[[1, 2, 3]]]；再 [[list(it)]] 得到 [[[]]]。因为迭代器已经走到末尾，没有「重置」方法。

很多内置函数返回迭代器：[[map]]、[[filter]]、[[zip]]、[[enumerate]]、生成器表达式。你 [[sum(it)]] 之后再 [[list(it)]]，得到空列表。要重复使用，先把结果存成列表，或者重新创建迭代器。

[[itertools.tee]] 可以把一个迭代器分成多个，但它内部会缓存，内存不一定省。对无限迭代器用 [[tee]] 要特别小心。最简单可靠的方案：需要多次遍历时，用列表/元组保存；只需要一次时，才用迭代器。`,
          code: `it = iter([1, 2, 3])
print(list(it))
print(list(it))

mapped = map(str, [1, 2, 3])
print(list(mapped))
print(list(mapped))

import itertools
base = iter([1, 2, 3])
a, b = itertools.tee(base, 2)
print(list(a))
print(list(b))`,
          output: `[1, 2, 3]
[]
['1', '2', '3']
[]
[1, 2, 3]
[1, 2, 3]`,
          tip: `[[map]] / [[filter]] / [[zip]] 返回迭代器，只能消费一次；需要重复遍历先 [[list()]]。`
        },
        {
          h: "惰性求值：什么时候算，什么时候不算",
          p: `惰性求值意味着「需要时才计算」。[[range(10**9)]] 不占十亿个整数的内存；[[map(f, items)]] 不立刻调用 [[f]]；生成器表达式 [[(x * 2 for x in items)]] 也不立刻算。只有你 [[next()]] 或 [[for]] 迭代时，才算下一个。

惰性带来内存优势，也带来「副作用延迟」的困惑。你在 [[map]] 里放 [[print]]，不迭代就不会打印；你 [[list()]] 之后才看到输出。不要把「创建迭代器」误认为「执行了计算」。

惰性不等于免费。每次 [[next()]] 都有调用开销；对很小的数据，列表推导式可能更快。对很大的数据或无限序列，惰性才是必要的。选择标准是「数据规模 + 是否需要重复遍历」，不是「看起来高级」。`,
          code: `def double(x):
    print("计算", x)
    return x * 2

lazy = map(double, [1, 2, 3])
print("创建完成")
print(next(lazy))
print("取了一个")
print(list(lazy))`,
          output: `创建完成
计算 1
2
取了一个
计算 2
计算 3
[4, 6]`,
          tip: `[[map]] / 生成器表达式创建时不算；[[next()]] 或 [[list()]] 才触发计算。`
        },
        {
          h: "自定义迭代器：__iter__ 与 __next__",
          p: `你可以写一个类，实现 [[__iter__]] 返回 [[self]]，实现 [[__next__]] 返回下一个值，没有更多值时 [[raise StopIteration]]。这样它就能被 [[for]] 遍历，也能被 [[list()]]、[[sum()]] 消费。

[[__next__]] 必须记住当前位置。通常用 [[self.index]]，每次返回后加一。注意：迭代器耗尽后再 [[next()]]，必须继续抛 [[StopIteration]]，不能回到开头；否则 [[for]] 永远不会结束。

如果对象本身是可迭代容器（比如自定义列表），[[__iter__]] 应该返回一个新的迭代器，而不是 [[self]]。这样每次 [[for]] 都能从头开始。容器和迭代器的职责要分开。`,
          code: `class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value

for n in Countdown(3):
    print(n)

print(list(Countdown(3)))`,
          output: `3
2
1
[3, 2, 1]`,
          tip: `迭代器的 [[__iter__]] 返回 [[self]]；容器每次 [[__iter__]] 应返回新的迭代器。`
        },
        {
          h: "小任务：写一个倒序迭代器",
          p: `实现 [[Reverse(items)]]，按原列表的倒序逐个产出元素，不创建反转后的新列表。要求支持 [[for]]、[[list()]]，并保证同一实例耗尽后继续抛 [[StopIteration]]。

关键是保存 [[items]] 和当前下标，从 [[len(items) - 1]] 开始，每次减一，小于 0 就停。不要用 [[reversed(items)]] 偷懒；这个任务是为了理解协议，不是为了找最省事的写法。

再写一个测试：对空列表、单元素、多元素分别 [[list(Reverse(...))]]；同一个迭代器调用两次 [[list()]]，第二次应该是空列表。`,
          code: `class Reverse:
    def __init__(self, items):
        self.items = items
        self.index = len(items) - 1

    def __iter__(self):
        return self

    def __next__(self):
        if self.index < 0:
            raise StopIteration
        value = self.items[self.index]
        self.index -= 1
        return value

print(list(Reverse([1, 2, 3])))
r = Reverse([1, 2, 3])
print(list(r))
print(list(r))`,
          output: `[3, 2, 1]
[3, 2, 1]
[]`,
          tip: `倒序迭代器从末尾下标开始，耗尽后继续抛 [[StopIteration]]；同一个实例只能消费一次。`
        }
      ],
      points: [
        "可迭代对象实现 [[__iter__]]，迭代器实现 [[__next__]]",
        "[[for]] 底层是 [[iter()]] + 反复 [[next()]] + 捕获 [[StopIteration]]",
        "迭代器是一次性的，耗尽后不会自动重置",
        "[[map]] / [[filter]] / [[zip]] 返回惰性迭代器",
        "惰性求值延迟计算，创建迭代器不等于执行计算",
        "容器和迭代器职责分开：容器每次 [[__iter__]] 返回新迭代器"
      ],
      practice: "给 `Reverse` 增加 `__len__`，让 `len(Reverse([1,2,3]))` 返回 3；思考迭代器是否应该实现 `__len__`。"
    },
    {
      id: "ch7-3",
      title: "7.3 生成器与大数据文件处理",
      minutes: 45,
      lead: "生成器是「用函数写迭代器」：遇到 yield 就暂停，下一次 next 从暂停处继续。它让你用固定内存处理大文件、无限序列和流式管道。这一节把 yield、生成器表达式和文件处理串成第一篇的收尾项目。",
      source: "Introducing Python 3rd · Ch.6；Beginning Python 4th · Ch.6；Head First Python 3rd · Ch.4–5",
      sections: [
        {
          h: "yield 把函数变成生成器",
          p: `函数体里出现 [[yield]]，这个函数就不再是普通函数，而是生成器函数。调用它不会执行函数体，而是返回一个生成器对象；每次 [[next()]] 才执行到下一个 [[yield]]，产出一个值并暂停，局部变量和暂停位置都保留。

[[yield]] 和 [[return]] 不同：[[return]] 结束函数，[[yield]] 只暂停。生成器可以产出多次，最后一次执行完自动抛 [[StopIteration]]。[[for]] 循环能直接遍历生成器，和遍历列表一样。

生成器适合「按需产出」：读一行产一行、算一个产一个、无限序列。它不适合需要随机访问、多次遍历、[[len()]] 的场景；那些场景用列表更合适。`,
          code: `def count_up_to(n):
    current = 1
    while current <= n:
        yield current
        current += 1

gen = count_up_to(3)
print(next(gen))
print(next(gen))
print(list(gen))
print(list(gen))`,
          output: `1
2
[3]
[]`,
          tip: `调用生成器函数不执行函数体，只返回生成器；[[next()]] 才执行到下一个 [[yield]]。`
        },
        {
          h: "生成器表达式 vs 列表推导式",
          p: `生成器表达式把列表推导式的方括号换成圆括号：[[(x * 2 for x in items)]]。它不创建列表，而是返回生成器，按需计算。列表推导式 [[[x * 2 for x in items]]] 会立即算完并占用内存。

选择标准：需要重复遍历、索引、[[len()]]，用列表；只需要遍历一次、数据很大或无限，用生成器表达式。[[sum(x for x in items)]] 可以省掉一层括号，因为 [[sum]] 只接收一个可迭代参数时，生成器表达式可以裸写。

生成器表达式只能消费一次。你 [[sum(gen)]] 之后再 [[list(gen)]]，得到空列表。不要把它赋值后当列表反复用；要么重新创建，要么先 [[list()]]。`,
          code: `items = [1, 2, 3, 4]
list_comp = [x * 2 for x in items]
gen_expr = (x * 2 for x in items)

print(list_comp)
print(gen_expr)
print(list(gen_expr))
print(list(gen_expr))

print(sum(x * x for x in items))`,
          output: `[2, 4, 6, 8]
<generator object <genexpr> at ...>
[2, 4, 6, 8]
[]
30`,
          tip: `生成器表达式用圆括号，惰性且一次性；需要重复用先 [[list()]]。`
        },
        {
          h: "生成器管道：逐行读取大文件",
          p: `生成器最实用的场景是文件管道：[[read_lines]] 逐行读，[[clean_lines]] 去空行和注释，[[parse_rows]] 解析字段，[[filter_rows]] 过滤不及格。每一层都是生成器，数据像流水一样穿过，内存只保留当前一行。

不要把每个阶段都 [[list()]]，否则管道退化成「每层都存全量数据」。也不要在生成器里返回列表；[[return]] 会结束生成器，[[yield]] 才是产出。管道函数的参数和返回值都应该是可迭代对象。

管道的好处是每层可单独测试：给一个列表，[[list(clean_lines(...))]] 就能验证。坏处是调试时看不到「中间全部数据」，需要临时 [[list()]] 某一段。用 [[itertools.islice]] 只看前几条，避免打印整个大文件。`,
          code: `from itertools import islice

def read_lines(path):
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            yield line.rstrip("\\n")

def clean_lines(lines):
    for line in lines:
        line = line.strip()
        if line and not line.startswith("#"):
            yield line

def parse_rows(lines):
    for line in lines:
        name, score = [part.strip() for part in line.split(",")]
        yield name, int(score)

def failed(rows):
    for name, score in rows:
        if score < 60:
            yield name, score

rows = parse_rows(clean_lines(read_lines("scores.txt")))
print(list(islice(rows, 3)))`,
          output: `[('林晓', 91), ('陈默', 76), ('周宁', 88)]`,
          tip: `管道每层都用 [[yield]]，不要中途 [[list()]]；调试用 [[islice]] 只看前几条。`
        },
        {
          h: "生成器的关闭、send 与异常",
          p: `生成器可以提前关闭：[[gen.close()]] 会在暂停处抛 [[GeneratorExit]]，让 [[finally]] 有机会清理资源。文件生成器在 [[with]] 块里，提前关闭会正常退出 [[with]]，关闭文件。不要吞掉 [[GeneratorExit]]，否则生成器无法关闭。

[[gen.send(value)]] 可以把值送回生成器，成为当前 [[yield]] 表达式的返回值。[[next(gen)]] 等价于 [[gen.send(None)]]。[[send]] 适合协程风格的消费者，但入门阶段不必深入；知道它存在，别在普通生成器上乱用。

生成器里的异常会传播到调用方；调用方可以用 [[throw()]] 把异常送进去。复杂协程现在更多用 [[async/await]]，同步生成器主要用于数据管道。把 [[yield]] 当「产出」，把 [[send]] 当「双向通信」，不要混。`,
          code: `def safe_gen():
    try:
        yield 1
        yield 2
    finally:
        print("清理资源")

g = safe_gen()
print(next(g))
g.close()

def echo():
    received = yield "ready"
    while True:
        received = yield f"echo: {received}"

e = echo()
print(next(e))
print(e.send("hello"))`,
          output: `1
清理资源
ready
echo: hello`,
          tip: `[[close()]] 触发 [[GeneratorExit]]；[[finally]] 用来清理。[[send()]] 第一次必须传 [[None]] 或先 [[next()]]。`
        },
        {
          h: "小任务：统计大日志文件",
          p: `写一个生成器管道，逐行读取一个日志文件，统计每个级别（INFO/WARNING/ERROR）的行数，不把整个文件读进内存。日志格式假设为 [[“2026-11-24 INFO ... ”]]，级别是第二列。

步骤：[[read_lines]] → [[parse_level]] 产出级别 → [[count_levels]] 用字典累计。[[count_levels]] 可以是普通函数，消费生成器并返回字典；也可以 [[yield]] 中间结果，但最终统计通常需要聚合，返回字典更自然。

测试时造一个小文件，包含空行、格式不对的行、三种级别；确认坏行被跳过而不是崩溃，统计数与预期一致。最后用 [[tracemalloc]] 或简单观察内存，说明为什么这个方案适合大文件。`,
          code: `from collections import Counter

def read_lines(path):
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            yield line.rstrip("\\n")

def levels(lines):
    for line in lines:
        parts = line.split()
        if len(parts) < 2:
            continue
        level = parts[1].upper()
        if level in {"INFO", "WARNING", "ERROR"}:
            yield level

def count_levels(path):
    return Counter(levels(read_lines(path)))

counts = count_levels("app.log")
print(counts)
print(counts["ERROR"])`,
          output: `Counter({'INFO': 3, 'ERROR': 1, 'WARNING': 1})
1`,
          tip: `[[Counter]] 是字典子类，适合计数；坏行用 [[continue]] 跳过，不要让整个管道崩掉。`
        }
      ],
      points: [
        "函数里有 [[yield]] 就变成生成器函数，调用返回生成器对象",
        "[[yield]] 暂停并保留局部状态，[[return]] 结束函数",
        "生成器表达式惰性、一次性，适合大文件/无限序列",
        "生成器管道每层 [[yield]]，不要中途 [[list()]]",
        "[[close()]] 触发 [[GeneratorExit]]，[[finally]] 负责清理",
        "[[send()]] 第一次必须传 [[None]] 或先 [[next()]]"
      ],
      practice: "把日志统计管道改成支持按小时分组：从每行开头提取 `HH`，用 `Counter` 统计每个小时的 ERROR 数；仍然保持逐行读取。"
    }
  ]
});

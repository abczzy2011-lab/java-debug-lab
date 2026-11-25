window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch5",
  part: 1,
  number: "05",
  title: "条件、循环与模式匹配",
  summary: "程序开始有分支和重复。本章把 if/elif/else 的真值规则、for/while 的迭代模型、break/continue/else 的控制流讲透，再用 match 展示 Python 3.10 的结构化模式匹配。最后一节会明确说明：练习室仍是 3.8 判题，match 只做只读演示。",
  goals: [
    "能解释 Python 的真值规则与短路求值",
    "能写出边界正确的 if/elif/else 分支",
    "能用 for/while、enumerate、zip 处理批量数据",
    "能读懂 match 的字面量、序列、映射和守卫模式"
  ],
  lessons: [
    {
      id: "ch5-1",
      title: "5.1 if/elif/else 与真值",
      minutes: 40,
      lead: "条件语句看起来最简单，却最容易在边界上出错：90 分到底算 A 还是 B，空列表算不算「有数据」，None 和 False 有什么区别。这一节先把真值规则和分支顺序钉死。",
      source: "Introducing Python 3rd · Ch.8；Beginning Python 4th · Ch.5；Head First Python 3rd · Ch.2",
      sections: [
        {
          h: "条件不是「对错」，是「真值」",
          p: `[[if]] 后面不要求布尔值，任何对象都可以被解释成真或假。Python 的真值规则是：[[None]]、[[False]]、数字 0、空字符串、空列表、空元组、空字典、空集合为假；其他对象一般为真。这就是为什么 [[if items:]] 可以判断列表非空，[[if name:]] 可以判断字符串非空。

这个规则很方便，也很危险。[[if score:]] 在 [[score = 0]] 时为假，但 0 分是一个合法成绩，不是「没有成绩」。如果你要判断「有没有传分数」，应该用 [[if score is not None:]]，而不是 [[if score:]]。空容器和零值在业务上可能完全合法，不要用真值测试代替「是否存在」。

[[bool(x)]] 可以显式转换真值，但大多数时候不需要。真正需要的是想清楚：这个变量可能取哪些值？[[None]] 表示缺失，0 表示零分，[[""]] 表示空字符串，它们的语义不同，判断方式也应该不同。`,
          code: `values = [None, False, 0, "", [], {}, set(), "0", [0]]
for value in values:
    print(repr(value), bool(value))`,
          output: `None False
False False
0 False
'' False
[] False
{} False
set() False
'0' True
[0] True`,
          tip: `0、空字符串、空列表都是合法数据，不要用 [[if x:]] 判断「是否存在」；用 [[is None]] 或显式比较。`
        },
        {
          h: "if/elif/else 与互斥分支",
          p: `[[if]] / [[elif]] / [[else]] 从上到下依次判断，命中第一个真条件后，后面的分支全部跳过。这个「互斥」很重要：如果你把 [[>= 90]] 写在 [[>= 80]] 后面，90 分永远进不了 A 分支，因为先被 B 分支截住。

分支顺序应该从最严格到最宽松，或者用独立的 [[if]] 而不是 [[elif]]。[[elif]] 表示「否则如果」，[[if]] 表示「另外再判断一次」。两个独立的 [[if]] 可能同时执行，适合「同时满足多个标签」的场景；[[elif]] 只执行一个，适合等级、状态这类互斥分类。

[[else]] 不是必须的，但每个 [[else]] 都应该有明确语义。不要写 [[else: pass]] 来「占位」，那会让读者以为还有未处理的逻辑。如果确实什么都不做，写注释说明为什么。`,
          code: `def level(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 60:
        return "C"
    else:
        return "D"

for score in [95, 90, 89, 80, 59, 0]:
    print(score, level(score))`,
          output: `95 A
90 A
89 B
80 B
59 D
0 D`,
          tip: `[[elif]] 的命中是互斥的；顺序写反会让宽条件吞掉窄条件。等级边界要写测试用例。`
        },
        {
          h: "真值表：空容器、0、None、False",
          p: `很多「为什么没进 if」的问题，根源是把「空」和「不存在」混为一谈。[[None]] 是缺失值；[[False]] 是布尔假；[[0]] 是数值零；[[""]] 是空文本；[[]] 是空列表。它们在 [[bool()]] 下都为假，但业务含义不同。

判断缺失用 [[x is None]]；判断空列表用 [[not items]] 或 [[len(items) == 0]]；判断零分用 [[score == 0]]；判断空字符串用 [[text == ""]] 或 [[not text.strip()]]。不要用一个 [[if not x]] 包打天下，除非你确实接受所有这些值等价。

[[is None]] 比 [[== None]] 更准确，因为 [[==]] 可能被自定义对象重载；[[None]] 是单例，[[is]] 比较身份。PEP 8 也明确建议用 [[is None]]。`,
          code: `def describe(value):
    if value is None:
        return "缺失"
    if value == 0:
        return "零值"
    if value == "":
        return "空字符串"
    if isinstance(value, list) and not value:
        return "空列表"
    return "有内容"

for value in [None, 0, "", [], [0], "0"]:
    print(repr(value), describe(value))`,
          output: `None 缺失
0 零值
'' 空字符串
[] 空列表
[0] 有内容
'0' 有内容`,
          tip: `[[x == None]] 可能被重载；判断缺失统一用 [[x is None]]。`
        },
        {
          h: "布尔运算 and/or/not 与短路",
          p: `[[and]] 返回的不是 [[True]] / [[False]]，而是第一个决定结果的操作数。[[0 and "x"]] 返回 [[0]]，[["" or "default"]] 返回 [["default"]]。这个行为常被用来写默认值：[[name = input_name or "匿名"]]。但要注意，如果 [[input_name]] 是 [[0]] 或 [[""]]，也会被替换掉。

[[or]] 短路：左边为真就返回左边，不计算右边；[[and]] 短路：左边为假就返回左边，不计算右边。短路可以用来保护可能出错的操作：[[if items and items[0] == "x":]]，如果 [[items]] 为空，[[items[0]]] 不会执行。

不要用 [[and]] / [[or]] 写复杂业务分支，可读性会迅速下降。[[a and b or c]] 在 [[b]] 为假时会返回 [[c]]，和「a 为真则 b，否则 c」并不等价。需要条件表达式时用 [[b if a else c]]，意图更清楚。`,
          code: `print(0 and "x")
print("" or "default")
print("name" or "default")
print(None or 0 or "fallback")

items = []
print(items and items[0] == "x")
print(bool(items and items[0] == "x"))

a, b, c = True, 0, "c"
print(a and b or c)
print(b if a else c)`,
          output: `0
default
name
fallback
[]
False
c
0`,
          tip: `[[and]] / [[or]] 返回操作数本身，不是布尔值；默认值写法要小心 0 和空字符串。`
        },
        {
          h: "小任务：成绩等级与边界",
          p: `写一个 [[grade(score)]]：90–100 为 A，80–89 为 B，60–79 为 C，0–59 为 D；分数必须是 0–100 的数字，否则抛 [[ValueError]]。这个任务练「边界 + 类型 + 分支顺序」。

先把边界写成测试表：-1、0、59、60、79、80、89、90、100、101。每个边界都跑一遍，确认没有裂缝。不要只测 95 和 55 这种「典型值」，边界才是 bug 的藏身处。

类型检查也要做。[[grade("90")]] 应该报错还是自动转换？如果这是外部输入，可以在入口处转换；如果这是内部函数，让它对类型严格，避免「字符串比较」这种隐蔽错误。[[isinstance(score, (int, float))]] 且排除 [[bool]]，因为 [[True]] 会被当成 1。`,
          code: `def grade(score):
    if isinstance(score, bool) or not isinstance(score, (int, float)):
        raise TypeError("score 必须是数字")
    if not 0 <= score <= 100:
        raise ValueError("score 必须在 0–100")
    if score >= 90:
        return "A"
    if score >= 80:
        return "B"
    if score >= 60:
        return "C"
    return "D"

for score in [-1, 0, 59, 60, 79, 80, 89, 90, 100, 101]:
    try:
        print(score, grade(score))
    except ValueError as exc:
        print(score, "ValueError:", exc)`,
          output: `-1 ValueError: score 必须在 0–100
0 D
59 D
60 C
79 C
80 B
89 B
90 A
100 A
101 ValueError: score 必须在 0–100`,
          tip: `[[bool]] 是 [[int]] 的子类；类型检查数字时要排除 [[True]] / [[False]]。边界测试从 -1 到 101。`
        }
      ],
      points: [
        "[[None]]、[[False]]、0、空容器为假，但业务含义不同",
        "[[elif]] 命中后跳过后续分支，顺序要从窄到宽",
        "判断缺失用 [[is None]]，不要用 [[== None]]",
        "[[and]] / [[or]] 返回操作数本身，且有短路",
        "[[a and b or c]] 不等于条件表达式 [[b if a else c]]",
        "[[bool]] 是 [[int]] 子类，数字类型检查要排除布尔"
      ],
      practice: "把 `grade()` 改成支持 0.5 分粒度，并增加「缺考」用 `None` 表示；写出 -1、0、59.5、60、100、101、None 的测试表。"
    },
    {
      id: "ch5-2",
      title: "5.2 for/while、enumerate、zip、break/continue",
      minutes: 45,
      lead: "循环不是「把代码重复 n 次」，而是「对一个可迭代对象逐个处理」。理解迭代协议，你才会明白 for 为什么能遍历文件、字典、生成器；理解 break/continue/else，你才能写出不靠标志变量的控制流。",
      source: "Introducing Python 3rd · Ch.8；Beginning Python 4th · Ch.5–6；Head First Python 3rd · Ch.2–4",
      sections: [
        {
          h: "for 是迭代，不是计数",
          p: `Python 的 [[for item in iterable]] 不是 C 的 [[for i = 0; i < n; i++]]。它调用 [[iter(iterable)]] 得到迭代器，然后反复 [[next()]]，直到 [[StopIteration]]。列表、字符串、字典、文件、生成器都实现这套协议，所以都能被 [[for]] 遍历。

这意味着 [[for]] 不关心「长度」，只关心「还有没有下一个」。你可以在遍历中处理无限序列（配合 [[break]]），也可以遍历一个边读边产生数据的生成器。文件对象就是典型：[[for line in fh]] 一次读一行，不会把整个文件装进内存。

[[range()]] 只是众多可迭代对象之一，用来产生整数序列。它不是列表，[[range(1000000)]] 不占一百万个整数内存。需要列表才 [[list(range(...))]]；只是循环就直接用。`,
          code: `for ch in "abc":
    print(ch)

for key in {"a": 1, "b": 2}:
    print(key)

for i in range(3):
    print(i)

print(range(3))
print(list(range(3)))`,
          output: `a
b
c
a
b
0
1
2
range(0, 3)
[0, 1, 2]`,
          tip: `[[for]] 遍历的是迭代器，不是下标；遍历字典默认拿键，不是键值对。`
        },
        {
          h: "range 的三种形态与边界",
          p: `[[range(stop)]] 从 0 到 stop-1；[[range(start, stop)]] 从 start 到 stop-1；[[range(start, stop, step)]] 按步长走。和切片一样，stop 不包含。[[range(5)]] 是 0、1、2、3、4，不是 1–5。

步长可以为负：[[range(5, 0, -1)]] 得到 5、4、3、2、1。起点和终点的方向要匹配，否则得到空序列，不报错。[[range(0, 5, -1)]] 是空的，因为从 0 往负方向走永远到不了 5。

[[range]] 支持 [[len()]]、索引、切片，但切片返回新的 range 对象，不是列表。[[range(0, 10, 2)[1:3]]] 仍然是 range。需要具体值再 [[list()]]。`,
          code: `print(list(range(5)))
print(list(range(2, 6)))
print(list(range(0, 10, 3)))
print(list(range(5, 0, -1)))
print(list(range(0, 5, -1)))

print(len(range(0, 10, 2)))
print(range(0, 10, 2)[1:3])
print(list(range(0, 10, 2)[1:3]))`,
          output: `[0, 1, 2, 3, 4]
[2, 3, 4, 5]
[0, 3, 6, 9]
[5, 4, 3, 2, 1]
[]
5
range(2, 6, 2)
[2, 4]`,
          tip: `[[range]] 的 stop 不包含；步长方向和起点/终点不匹配时返回空序列，不报错。`
        },
        {
          h: "while 与退出条件；break/continue/else",
          p: `[[while condition:]] 在条件为真时反复执行。它适合「不知道要循环多少次，只知道什么时候停」的场景：读文件直到空行、猜数字直到猜中、重试直到成功。关键是确保条件最终会变假，否则就是死循环。

[[break]] 立即跳出整个循环；[[continue]] 跳过本次剩余代码，进入下一次迭代。[[for]] / [[while]] 还可以带 [[else]]：如果循环正常结束（没有被 [[break]] 打断），[[else]] 执行；如果被 [[break]] 打断，[[else]] 不执行。这个语法不直观，但能省掉「found 标志变量」。

不要滥用 [[break]]。一个循环里多个 [[break]]、多层嵌套，控制流会变得难以追踪。能用一个清晰的退出条件表达，就优先用条件；确实需要「找到就停」，再用 [[break]]。`,
          code: `for n in [2, 3, 4, 5, 6]:
    for d in range(2, n):
        if n % d == 0:
            print(n, "不是素数，因子", d)
            break
    else:
        print(n, "是素数")

i = 0
while i < 5:
    i += 1
    if i == 2:
        continue
    print(i)`,
          output: `2 是素数
3 是素数
4 不是素数，因子 2
5 是素数
6 不是素数，因子 2
1
3
4
5`,
          tip: `循环 [[else]] 只在「没有 break」时执行；[[continue]] 不影响 else。`
        },
        {
          h: "enumerate、zip 与并行遍历",
          p: `[[enumerate(items, start=1)]] 在遍历时同时给下标和元素，返回 [[(index, item)]] 元组。它比 [[range(len(items))]] 更安全，也更清楚。需要从 1 开始编号时传 [[start=1]]，不要手动 [[i + 1]]。

[[zip(a, b)]] 把多个序列按位置配对，按最短停止。它适合「姓名列表 + 分数列表」这种并行数据。[[zip]] 返回迭代器，只能消费一次；要在循环后继续用，先 [[list()]] 保存。

[[enumerate(zip(a, b))]] 可以同时拿下标和配对；[[zip(*pairs)]] 可以把配对拆回多列。不要为了「优雅」把三个以上序列塞进一个 [[zip]]，读起来会累；必要时先组合成记录。`,
          code: `names = ["林晓", "陈默", "周宁"]
scores = [91, 76, 88]

for i, (name, score) in enumerate(zip(names, scores), start=1):
    print(i, name, score)

pairs = list(zip(names, scores))
print(pairs)
print(list(zip(*pairs))[0])`,
          output: `1 林晓 91
2 陈默 76
3 周宁 88
[('林晓', 91), ('陈默', 76), ('周宁', 88)]
('林晓', '陈默', '周宁')`,
          tip: `[[zip]] 按最短序列停止；[[enumerate]] 的 start 只影响编号，不影响数据。`
        },
        {
          h: "小任务：找第一个不及格与跳过空行",
          p: `读一份成绩文本，跳过空行和注释行，找到第一个不及格（< 60）的学生。如果找到，打印姓名和分数并 [[break]]；如果整份文件都没有，打印「全部及格」。这个任务练 [[for]]、[[continue]]、[[break]] 和 [[else]]。

解析每一行时，字段数量、数字转换都可能出错。先写一个 [[parse_line()]]，在循环里捕获 [[ValueError]] 并带上行号；不要因为一行坏数据就让整个程序崩掉，除非你决定「坏数据必须停止」。

「找到第一个」意味着一旦命中就停止，不要继续读完整个文件。[[break]] 在这里是正确工具；用标志变量 [[found = True]] 再在循环条件里判断，反而更绕。`,
          code: `rows = [
    "林晓,91",
    "",
    "# 注释",
    "陈默,52",
    "周宁,88",
]

found = False
for line_no, line in enumerate(rows, start=1):
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    name, score_text = [part.strip() for part in line.split(",")]
    score = int(score_text)
    if score < 60:
        print(f"第一个不及格: {name} ({score})，第 {line_no} 行")
        found = True
        break
else:
    print("全部及格")

print("found =", found)`,
          output: `第一个不及格: 陈默 (52)，第 4 行
found = True`,
          tip: `[[for...else]] 在「没有 break」时执行；如果用了 else，就不需要再写 found 标志。`
        }
      ],
      points: [
        "[[for]] 基于迭代协议，不是计数循环",
        "[[range]] 的 stop 不包含，步长方向不对会得到空序列",
        "[[break]] 跳出整个循环，[[continue]] 只跳过本次",
        "循环 [[else]] 只在没有 [[break]] 时执行",
        "[[enumerate]] 同时给下标和元素，[[zip]] 按最短停止",
        "[[zip]] 返回迭代器，只能消费一次"
      ],
      practice: "把「找第一个不及格」改成「找所有不及格并统计人数」，比较 `break` 版和完整遍历版的控制流差异；再写一个测试，确认空文件会输出「全部及格」。"
    },
    {
      id: "ch5-3",
      title: "5.3 match 模式匹配（现代语法演示）",
      minutes: 35,
      lead: "match 是 Python 3.10 引入的结构化模式匹配，不是 C/Java 的 switch。它按「形状」匹配数据，能把序列、字典、对象拆开并绑定名字。本节只做只读演示：站内练习室仍是 Python 3.8 判题，不要把 match 提交进去。",
      source: "Introducing Python 3rd · Ch.8；Beginning Python 4th · Ch.5",
      sections: [
        {
          h: "match 是什么：结构匹配，不是 switch",
          p: `[[match subject:]] 后面跟若干 [[case pattern:]]。它从上到下尝试匹配，命中第一个后执行对应分支，不会像 C 的 switch 那样「穿透」。和 [[if/elif]] 相比，match 的强项不是「值等于几」，而是「数据长什么形状」：是不是三个元素、字典里有没有某个键、对象是不是某个类。

最简单的字面量匹配：[[case 200:]]、[[case "GET":]]。这看起来像 switch，但 match 还支持序列模式 [[case [x, y]:]]、映射模式 [[case {"name": name}:]]、类模式 [[case Point(x=0, y=0):]]、或模式 [[case 1 | 2:]]、守卫 [[case n if n > 0:]]。

match 不是「必须用」的新语法。简单的二分支用 [[if]] 更清楚；只有当你确实在拆结构、并且拆完还要绑定变量时，match 才值得。不要为了显得现代，把所有 if 改写成 match。`,
          code: `def http_status(code):
    match code:
        case 200:
            return "OK"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case _:
            return "Unknown"

for code in [200, 404, 500, 418]:
    print(code, http_status(code))`,
          output: `200 OK
404 Not Found
500 Server Error
418 Unknown`,
          tip: `[[case _]] 是通配符，必须放最后；match 命中一个分支就结束，不会穿透。`
        },
        {
          h: "字面量、捕获与通配符",
          p: `模式里的普通名字是**捕获变量**，不是常量。[[case score:]] 会匹配任何值，并把 [[subject]] 绑定到 [[score]]；[[case _:]] 也是匹配任何值，但不绑定。要匹配「名字叫 score 的常量」，必须用点号限定，比如 [[case Color.RED:]] 或 [[case module.CONST:]]。

[[case 0:]] 只匹配 0；[[case 0 | 1:]] 匹配 0 或 1；[[case -1:]] 匹配 -1。[[case True:]] 和 [[case 1:]] 在 Python 里会视为同一个值，因为 [[True == 1]]；需要区分布尔时用 [[case True]] 放在 [[case 1]] 前面，或改用类型判断。

捕获变量会在分支内生效，但不会泄漏到分支外。每个 case 的绑定是独立的；不要指望在 case A 里绑定的名字能在 case B 里用。分支内的变量名也要避免和外部变量重名，否则容易误读。`,
          code: `def classify(value):
    match value:
        case 0:
            return "零"
        case 1:
            return "一"
        case score:
            return f"其他数字: {score}"

for value in [0, 1, 2, 99]:
    print(classify(value))`,
          output: `零
一
其他数字: 2
其他数字: 99`,
          tip: `[[case score:]] 是捕获，不是比较；常量匹配要用字面量或点号限定名。`
        },
        {
          h: "序列/映射/类模式",
          p: `序列模式按位置拆：[[case [name, score]:]] 要求正好两个元素；[[case [first, *rest]:]] 捕获第一个和剩余；[[case (x, y):]] 和列表模式等价。字符串、元组、列表都能匹配序列模式，但模式里的 [[[]]] 只匹配列表，[[]] 不匹配元组。

映射模式按键拆：[[case {"name": name, "score": score}:]] 只要求字典里包含这些键，不要求只有这些键；多余的键会被忽略。[[case {"name": name, **rest}:]] 把剩余键收进 [[rest]]。这让 match 很适合处理 JSON 形状的数据。

类模式按属性拆：[[case Point(x=0, y=0):]] 要求对象是 [[Point]] 实例，并且 [[x]]、[[y]] 属性匹配。它调用 [[isinstance]] 和属性访问，不调用 [[__eq__]]。类模式适合事件、AST、领域对象，不适合普通字典。`,
          code: `def describe(data):
    match data:
        case [name, score]:
            return f"一对: {name}={score}"
        case [first, *rest]:
            return f"首项 {first}，其余 {len(rest)} 项"
        case {"name": name, "score": score}:
            return f"记录: {name}={score}"
        case _:
            return "未知"

print(describe(["林晓", 91]))
print(describe([1, 2, 3, 4]))
print(describe({"name": "陈默", "score": 76, "class": "A"}))`,
          output: `一对: 林晓=91
首项 1，其余 3 项
记录: 陈默=76`,
          tip: `映射模式只检查指定键存在，多余键不影响匹配；序列模式区分列表和元组。`
        },
        {
          h: "守卫与绑定：case 后面的 if",
          p: `[[case pattern if condition:]] 是守卫。先匹配模式，再判断条件；条件为假就继续尝试下一个 case。守卫里可以使用模式绑定的变量。比如 [[case [name, score] if score >= 90:]] 只匹配高分记录。

守卫让 match 能表达「形状 + 业务条件」，但也容易写得太复杂。守卫里不要做副作用，不要修改被匹配的对象；它应该是一个纯判断。复杂逻辑抽成函数，case 里只调用函数。

绑定变量在守卫里可见，但在 case 体里也可见。注意不要在守卫里引用未绑定的名字；模式匹配失败时，绑定不会发生。多个 case 可以复用同一个变量名，它们的作用域是各自分支。`,
          code: `def label(record):
    match record:
        case [name, score] if score >= 90:
            return f"{name}: 优秀"
        case [name, score] if score >= 60:
            return f"{name}: 及格"
        case [name, score]:
            return f"{name}: 不及格"
        case _:
            return "格式不对"

for record in [["林晓", 91], ["陈默", 76], ["周宁", 52], "bad"]:
    print(label(record))`,
          output: `林晓: 优秀
陈默: 及格
周宁: 不及格
格式不对`,
          tip: `守卫在模式匹配成功后执行；守卫为假会继续尝试下一个 case，不会直接落到 [[case _]]。`
        },
        {
          h: "现实边界：3.10+ 与练习室 3.8",
          p: `match 需要 Python 3.10 或更高。站内 Python 改错练习室使用 Judge0 的 Python 3.8 兼容环境，工具栏也明确写着「Python 3.8 兼容」。这意味着你可以在本地 3.10+ 跑本节代码，但不要把 [[match]] 提交到练习室，否则会得到 [[SyntaxError]]。

这不是「练习室落后」一句话就完事。判题环境的版本决定了可用的语法集合：海象运算符 [[:=]] 需要 3.8，[[match]] 需要 3.10，异常组 [[except*]] 需要 3.11。写跨版本代码时，先确认目标解释器，再选语法。

如果你要在课程项目里用 match，可以做版本分支：[[sys.version_info >= (3, 10)]] 时走 match，否则走 if/elif。但更简单的做法是：基础课程先用 if/elif，match 作为「读懂现代代码」的补充，不进入自动判题。`,
          code: `import sys

print(sys.version_info[:2])
print(sys.version_info >= (3, 10))

# 下面这段只在 3.10+ 能解析；3.8 会 SyntaxError
# match 200:
#     case 200:
#         print("OK")`,
          output: `(3, 13)
True`,
          tip: `[[match]] 是 3.10+ 语法；练习室 3.8 判题不要提交。版本判断用 [[sys.version_info]]，不要比较字符串。`
        }
      ],
      points: [
        "match 是结构化模式匹配，不是 switch",
        "命中第一个 case 就结束，不会穿透",
        "[[case score:]] 是捕获变量，不是常量比较",
        "序列模式按位置拆，映射模式按键拆，类模式按属性拆",
        "守卫 [[case ... if cond:]] 在模式匹配成功后判断",
        "[[match]] 需要 Python 3.10+，练习室 3.8 只做只读演示"
      ],
      practice: "把第 5.1 的 `grade()` 用 match 重写一遍（本地 3.10+ 运行），再写一段注释说明为什么练习室不能提交这段代码。"
    }
  ]
});

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch2",
  part: 1,
  number: "02",
  title: "字符串、格式化与编码",
  summary: "字符串是后面所有数据处理的入口：你从文件、终端、网页拿到的几乎都是文本。本章把索引切片、常用方法、f-string 格式说明符，以及 UTF-8 与 bytes 的关系一次讲清，让你不再把「乱码」和「对齐错位」当成玄学。",
  goals: [
    "能正确使用索引、切片和步长",
    "能用 strip/split/replace 等方法清洗一行文本",
    "能写出宽度、对齐、小数位都可控的 f-string",
    "能解释 str 与 bytes 的区别，并正确读写 UTF-8 文件"
  ],
  lessons: [
    {
      id: "ch2-1",
      title: "2.1 字符串的索引、切片与方法",
      minutes: 40,
      lead: "字符串看起来简单，但它同时是序列、是不可变对象、也是文本编码的入口。先把「取一个字符」「取一段」「清洗一行」这三件事做对，后面的文件解析和表格处理才有稳定的起点。",
      source: "Introducing Python 3rd · Ch.4；Beginning Python 4th · Ch.2–3；Head First Python 3rd · Ch.1–2",
      sections: [
        {
          h: "字符串是字符序列，不是字符数组",
          p: `Python 的 [[str]] 是一个**不可变序列**。它支持 [[len()]]、索引、切片、[[in]] 和迭代，行为和列表有相似之处，但有一个根本区别：字符串一旦创建，内容不能原地修改。你不能写 [[s[0] = "H"]]，只能创建一个新字符串再重新绑定名字。

「字符」在 Python 3 里是 Unicode 码点，不是字节。[[len("你好")]] 得到 2，因为两个汉字各算一个字符；[[len("👨‍👩‍👧")]] 可能大于 1，因为一个表情可能由多个码点组合。[[s[0]]] 返回的是一个长度为 1 的字符串，不是整数；[[ord(s[0])]] 才拿到码点。这个区分在讲编码时还会回来。

字符串可以用单引号、双引号、三引号。三引号保留换行，适合多行文本和文档字符串；单双引号等价，选一种保持项目一致。相邻字符串字面量会自动拼接，[[“Py” “thon”]] 得到 [[“Python”]]，但不要拿它做复杂拼接，f-string 更清楚。`,
          code: `s = "Python 成绩"
print(len(s))
print(s[0], s[-1])
print(ord(s[0]))
print("成绩" in s)
print("Java" in s)`,
          output: `9
P 绩
80
True
False`,
          tip: `[[len()]] 数字符，不数显示宽度，也不数字节。中文在终端占两格、在 UTF-8 里占三字节，这三件事不要混。`
        },
        {
          h: "索引与切片：左闭右开、负索引、步长",
          p: `索引从 0 开始，[[s[0]]] 是第一个字符，[[s[-1]]] 是最后一个。越界索引会抛 [[IndexError]]，但越界切片不会：[[s[100:200]]] 返回空字符串。切片语法是 [[s[start:stop:step]]]，包含 [[start]]，不包含 [[stop]]，这就是「左闭右开」。

省略起点表示从头开始，省略终点表示一直到末尾，省略步长默认为 1。[[s[::-1]]] 是反转字符串的常用写法；[[s[::2]]] 取每隔一个字符；[[s[1:4]]] 取下标 1、2、3。步长为负数时，起点和终点的默认值会反过来，[[s[5:1:-1]]] 从 5 走到 2。

切片产生新字符串，不会修改原字符串。切片也不会因为范围荒谬而报错，这在清洗数据时很有用：你不知道字段长度，仍然可以先取前 10 个字符，不会崩。`,
          code: `s = "0123456789"
print(s[0], s[-1])
print(s[1:4])
print(s[:3], s[3:], s[::2])
print(s[::-1])
print(s[100:200])
print(s[5:1:-1])`,
          output: `0 9
123
012 3456789 02468
9876543210
(空字符串)
5432`,
          tip: `切片边界写错不会报错，只会悄悄返回空串或少取字符；解析固定格式时，先打印 [[repr(s)]] 看真实内容。`
        },
        {
          h: "常用方法：strip、split、replace、startswith",
          p: `真实文本总是带脏东西：行尾换行、前后空格、空行、全角逗号。[[strip()]] 去掉两端空白，[[lstrip()]] / [[rstrip()]] 只去一边；[[strip("\\n\\r")]] 可以指定字符集合。注意 [[strip()]] 不会去掉中间的空格，也不会去掉中文全角空格，除非你把它放进参数。

[[split()]] 不带参数时按任意空白切分，并自动丢弃连续空白；[[split(",")]] 按逗号切分，连续逗号会产生空字段。[[replace(old, new, count)]] 返回替换后的新字符串，[[count]] 控制次数。[[startswith()]] / [[endswith()]] 可以接收元组，一次判断多个前缀。

这些方法都返回新字符串，原字符串不变。方法链 [[line.strip().split(",")]] 很常见，但要清楚每一步返回什么：[[strip()]] 返回字符串，[[split()]] 返回列表。不要在 [[split()]] 后面继续调字符串方法。`,
          code: `line = "  林晓, 91, 84, 88  \\n"
print(repr(line))
print(repr(line.strip()))
print(line.strip().split(","))

fields = line.strip().split(",")
print([f.strip() for f in fields])

print("report.csv".endswith((".csv", ".txt")))
print("a,b,,c".split(","))`,
          output: `'  林晓, 91, 84, 88  \\n'
'林晓, 91, 84, 88'
['林晓', ' 91', ' 84', ' 88']
['林晓', '91', '84', '88']
True
['a', 'b', '', 'c']`,
          tip: `[[split(",")]] 不会自动去掉字段两侧空格；先 [[strip()]] 整行，再对每个字段 [[strip()]]。连续分隔符会产生空串字段。`
        },
        {
          h: "不可变性：每次修改都产生新字符串",
          p: `字符串不可变，所以 [[s.lower()]]、[[s.replace()]]、[[s + "!"]] 都不是「改掉原来的 s」，而是创建新字符串。原来的 [[s]] 仍然指向旧对象。这个特性和列表的 [[append()]] 完全不同，也是很多「为什么原字符串没变」问题的答案。

不可变带来两个好处：字符串可以安全地作为字典键、可以缓存哈希值、可以在多线程环境里共享而不担心被改。代价是大量拼接会产生很多临时对象。循环里 [[s += piece]] 在 CPython 中有时会被优化，但不要依赖它；要拼很多片段，用 [["".join(parts)]]。

如果你确实需要「可修改的字符序列」，用 [[list(s)]] 转成字符列表，改完再 [["".join(chars)]] 拼回去。这不是绕过不可变性，而是换了一个可变容器。`,
          code: `s = "Python"
print(s.lower())
print(s)
print(s.replace("P", "J"))
print(s)

chars = list(s)
chars[0] = "J"
print("".join(chars))
print(s)

parts = ["林晓", ":", "91"]
print("".join(parts))`,
          output: `python
Python
Jython
Python
Jython
Python
林晓:91`,
          tip: `[[s += "x"]] 是重新绑定，不是原地修改；如果别的名字还指向旧字符串，它不会看到变化。`
        },
        {
          h: "小任务：从一行成绩文本拆字段",
          p: `现在把方法组合起来，解析一行真实成绩记录：[[“林晓, 91, 84, 88”]]。目标是得到姓名和三个整数。步骤要拆清楚：先去两端空白，再按逗号切分，再逐字段去空格，再转整数。每一步都可能出错，所以每一步都要能单独验证。

[[int(" 91 ")]] 其实能接受前后空格，但不要依赖这一点；显式 [[strip()]] 让意图更清楚。字段数量也要检查：如果文件里混进了空行，[[split(",")]] 可能只得到一个元素，直接解包会抛 [[ValueError]]。先判断长度，再解包，是处理外部数据的基本习惯。

这个解析器就是下一章列表和字典的雏形。现在先用最朴素的方式写，等学了列表推导式和异常处理，再把它改得更健壮。`,
          code: `line = " 林晓, 91, 84, 88 "

fields = [part.strip() for part in line.strip().split(",")]
if len(fields) != 4:
    raise ValueError(f"字段数量不对: {fields}")

name, p, m, e = fields
scores = [int(p), int(m), int(e)]
print(name)
print(scores)
print(sum(scores) / len(scores))`,
          output: `林晓
[91, 84, 88]
87.66666666666667`,
          tip: `解包前先检查长度；外部文件的字段数量永远不要假设。[[int()]] 失败会抛 [[ValueError]]，不要静默吞掉。`
        }
      ],
      points: [
        "字符串是不可变序列，索引返回长度为 1 的字符串",
        "切片左闭右开，越界切片返回空串而不报错",
        "[[strip()]] 只去两端字符，不去中间空白",
        "[[split()]] 不带参数按任意空白切分，带分隔符会保留空字段",
        "字符串方法都返回新字符串，原对象不变",
        "大量拼接优先用 [[join()]]，不要依赖 [[+=]] 优化"
      ],
      practice: "把 `parse_line()` 写成一个函数：接收一行文本，返回 `(name, [scores])`。分别用正常行、空行、少一个字段的行测试，确认报错信息能指出问题。"
    },
    {
      id: "ch2-2",
      title: "2.2 f-string 与对齐格式",
      minutes: 40,
      lead: "输出不是「能看见就行」。成绩单、日志、终端表格都需要列宽稳定、数字精度一致、负数有符号。f-string 的格式说明符能把这些规则写死在模板里，让排版从手工调空格变成可复现的代码。",
      source: "Introducing Python 3rd · Ch.4；Beginning Python 4th · Ch.3；Head First Python 3rd · Ch.2",
      sections: [
        {
          h: "f-string 不只是拼接",
          p: `f-string 在字符串前加 [[f]]，花括号里可以放任意表达式：变量、算术、函数调用、索引、条件表达式。它会在运行时求值，把结果转成字符串插进去。和 [[+]] 拼接相比，f-string 不需要手动 [[str()]]，也不会因为类型不匹配而报错。

花括号里的表达式只求值一次，但不要在里面塞有副作用的调用，比如 [[f"{save()}"]]。格式化的目的是展示，不是执行逻辑。复杂计算先算好放进变量，再插值，代码会清楚很多。

要输出字面花括号，用双花括号：[[f"{{name}}"]] 得到 [[{name}]]，不是变量值。这个规则在写 JSON 模板、LaTeX 或前端代码时经常遇到。Python 3.8 以后还可以用 [[f"{x=}"]] 调试，它会打印表达式文本和值，适合临时排查。`,
          code: `name = "林晓"
score = 91

print(f"{name} 的成绩是 {score}")
print(f"总分: {score + 5}")
print(f"大写: {name.upper()}")
print(f"字面花括号: {{name}}")
print(f"{score=}")`,
          output: `林晓 的成绩是 91
总分: 96
大写: 林晓
字面花括号: {name}
score=91`,
          tip: `f-string 里的表达式不要做写操作；[[f"{items.pop()}"]] 会悄悄改变数据，调试时很难发现。`
        },
        {
          h: "格式说明符：宽度、对齐、填充",
          p: `冒号后面是格式说明符。最常见的是宽度和对齐：[[f"{name:>10}"]] 右对齐，[[f"{name:<10}"]] 左对齐，[[f"{name:^10}"]] 居中。宽度是最小宽度，不是最大宽度；内容超过宽度时会原样撑开，不会截断。

填充字符写在宽度前面：[[f"{name:*^10}"]] 用 [[*]] 居中填充；[[f"{score:0>5}"]] 用 0 右填充，常用于编号。对齐符号和宽度之间还可以加符号、逗号、精度，顺序不能乱：[[[fill][align][sign][#][0][width][,][.precision][type]]]。记不住全部没关系，先掌握「填充+对齐+宽度」和「宽度+精度+类型」。

表格对齐的常见错误，是给每个字段都写同一个宽度，却不考虑表头和数据谁更宽。正确做法是先算每列最大宽度，再把这个宽度放进格式说明符；或者先用 [[|]] 分隔，保证结构不塌。`,
          code: `rows = [("林晓", 91), ("陈默", 7), ("周宁", 100)]

for name, score in rows:
    print(f"|{name:<6}|{score:>5}|")

print(f"{'中心':*^12}")
print(f"{7:0>3}")
print(f"{'左':<8}结束")`,
          output: `|林晓  |   91|
|陈默  |    7|
|周宁  |  100|
****中心****
007
左      结束`,
          tip: `宽度只保证「至少这么宽」，不保证「不超过」；要截断先切片，要换行先 [[textwrap]]。`
        },
        {
          h: "数字格式：小数、千分位、百分比、正负号",
          p: `数字格式说明符解决四类问题：精度、千分位、百分比、符号。[[.2f]] 保留两位小数，[[,.2f]] 再加千分位；[[.1%]] 把小数转成百分比并保留一位；[[+d]] 强制显示正负号；[[#x]] 给十六进制加 [[0x]] 前缀。

[[f"{0.875:.1%}"]] 得到 [[87.5%]]，不是 [[0.9%]]。百分号格式会自动乘以 100，所以传进去的必须是小数，不是 87.5。[[f"{1234567:,}"]] 得到 [[1,234,567]]，逗号是千分位分隔符，不是小数点。

精度只影响显示，不改变变量本身。[[avg]] 还是原始浮点值，[[f"{avg:.2f}"]] 只是生成一个字符串。后续计算继续用 [[avg]]，不要拿格式化后的字符串转回数字，否则会丢掉精度并引入解析成本。`,
          code: `value = 1234567.891
ratio = 0.875
delta = 12

print(f"{value:,.2f}")
print(f"{ratio:.1%}")
print(f"{delta:+d}")
print(f"{-delta:+d}")
print(f"{255:#x}")
print(f"{value:.0f}")`,
          output: `1,234,567.89
87.5%
+12
-12
0xff
1234568`,
          tip: `[[%]] 格式接收小数；[[f"{87.5:.1%}"]] 会得到 [[8750.0%]]。先确认你的数据是比例还是百分数。`
        },
        {
          h: "动态宽度与嵌套字段",
          p: `宽度不一定是写死的数字，也可以是另一个变量。f-string 允许在格式说明符里再放一对花括号：[[f"{name:{width}}"]]、[[f"{value:{width}.{precision}f}"]]。这在生成表格时非常有用：你先扫描一遍数据，算出每列最大宽度，再统一格式化。

嵌套字段的求值顺序是先算内层，再套外层。宽度必须是整数；如果传了字符串，会抛 [[ValueError]]。精度也必须是整数。不要把用户输入直接塞进格式说明符，先做类型检查和范围限制。

动态宽度也有边界：终端有最大宽度，太长的内容会换行；网页有 CSS 宽度，不应该靠空格硬撑。文本表格适合终端和日志，不适合网页排版。知道场景，才知道什么时候该停止用空格对齐。`,
          code: `rows = [("林晓", 91), ("陈默", 7), ("周宁", 100)]
name_width = max(len(name) for name, _ in rows) + 2
score_width = 5

for name, score in rows:
    print(f"{name:<{name_width}}|{score:>{score_width}}")

print(f"{'合计':<{name_width}}|{sum(s for _, s in rows):>{score_width}}")`,
          output: `林晓  |   91
陈默  |    7
周宁  |  100
合计  |  198`,
          tip: `动态宽度必须是整数；[[f"{x:{w}}"]] 里 [[w]] 不能是字符串。宽度变大时记得同步调整分隔线。`
        },
        {
          h: "常见坑：花括号、类型不匹配、中文宽度",
          p: `f-string 最常见的三个坑，第一是花括号：想输出 [[{]] 必须写 [[{{]]，否则解析器会把它当成表达式起点。第二是类型不匹配：格式说明符要和值类型匹配，[[f"{name:>6.1f}"]] 对字符串用 [[.1f]] 会抛 [[ValueError]]；[[f"{score:>6}"]] 对整数是合法的，但 [[f"{score:>6.1f}"]] 会把整数转成浮点显示。

第三个坑是中文宽度。[[len("林晓")]] 是 2，但终端里通常占 4 个英文字符宽度。你用 [[:<6]] 补 4 个空格，实际显示会偏窄或偏宽。网页里更不能用空格对齐中文，应该用表格或 CSS。终端里如果必须对齐，需要按显示宽度计算，而不是 [[len()]]。

还有一个隐蔽问题：[[!r]] 和 [[!s]]。[[f"{value!r}"]] 调用 [[repr()]]，字符串会带引号，适合调试；[[f"{value!s}"]] 调用 [[str()]]，适合展示。默认是 [[str()]]，但对象自定义了 [[__format__]] 时，格式说明符可能改变行为。`,
          code: `name = "林晓"
score = 91

try:
    print(f"{name:>6.1f}")
except ValueError as exc:
    print("ValueError:", exc)

print(f"{{name}} -> {name}")
print(f"{name!r}")
print(f"{score!r}")`,
          output: `ValueError: Unknown format code 'f' for object of type 'str'
{name} -> 林晓
'林晓'
91`,
          tip: `中文对齐不要用 [[len()]] 当显示宽度；终端用等宽字体和显示宽度库，网页用表格/CSS。`
        }
      ],
      points: [
        "f-string 的花括号里可以放表达式，但不要放有副作用的调用",
        "宽度是最小宽度，内容超宽会撑开",
        "格式说明符顺序：填充、对齐、符号、宽度、逗号、精度、类型",
        "[[%]] 格式接收小数比例，会自动乘以 100",
        "动态宽度必须是整数",
        "中文显示宽度不等于字符个数，网页不要用空格硬对齐"
      ],
      practice: "用 f-string 打印一张三列成绩表：姓名左对齐、Python 右对齐、平均分保留两位。先用固定宽度，再用动态宽度重写一次，比较两次输出。"
    },
    {
      id: "ch2-3",
      title: "2.3 文本文件与编码：UTF-8、bytes 初识",
      minutes: 45,
      lead: "文本文件在磁盘上不是「文字」，而是一串字节。你看到的汉字，是解码器按照某种编码把字节解释出来的结果。编码选错，字节没坏，解释错了，于是出现乱码。这一节把 str、bytes、UTF-8 和读写文件连成一条线。",
      source: "Introducing Python 3rd · Ch.5；Beginning Python 4th · Ch.12；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "文本文件在磁盘上其实是字节",
          p: `计算机存储的最小单位是字节。文本文件里保存的不是「林」这个字形，而是「林」在某个编码方案下对应的字节序列。UTF-8 是目前最常用的方案：ASCII 字符占 1 字节，常见汉字占 3 字节，部分表情占 4 字节。

Python 3 把「文本」和「字节」分成两个类型：[[str]] 是 Unicode 字符串，[[bytes]] 是 0–255 的字节序列。[["林".encode("utf-8")]] 得到 [[b'\\xe6\\x9e\\x97']]，三个字节；[[b'\\xe6\\x9e\\x97'.decode("utf-8")]] 才回到 [[“林”]]。编码是 str → bytes，解码是 bytes → str，方向不能反。

[[bytes]] 的索引返回整数，不是长度为 1 的 bytes：[[b"ABC"[0]]] 是 65。[[bytes]] 不可变，[[bytearray]] 可变。日常处理文本优先用 [[str]]，只有在网络协议、二进制文件、加密、压缩这些场景才直接操作 bytes。`,
          code: `text = "林"
data = text.encode("utf-8")
print(data)
print(len(data))
print(data[0])
print(data.decode("utf-8"))
print("ABC".encode("ascii"))
print("ABC".encode("utf-8"))`,
          output: `b'\\xe6\\x9e\\x97'
3
230
林
b'ABC'
b'ABC'`,
          tip: `看到 [[b'...']] 就知道是 bytes；不要对 bytes 直接做字符串拼接，先 decode 或先 encode。`
        },
        {
          h: "UTF-8 的变长编码与中文",
          p: `UTF-8 是变长编码：它用 1–4 个字节表示一个 Unicode 码点。ASCII 范围（0–127）保持 1 字节，和旧系统兼容；欧洲语言多用 2 字节；中文常用 3 字节；部分表情 4 字节。变长的好处是省空间、兼容 ASCII；代价是不能用固定偏移切字符。

你不能用 [[data[0:3]]] 随便切一个「看起来像三个字节」的片段就保证是完整汉字。UTF-8 的字节有前缀位规则，切在字符中间会产生非法序列，解码时报 [[UnicodeDecodeError]]。要按字符切，先 decode 成 [[str]]，切完再 encode；或者用支持字符边界的库。

[[len("林")]] 是 1，[[len("林".encode("utf-8"))]] 是 3。这两个长度回答的是不同问题：字符数、字节数。做文件大小统计用字节数，做显示宽度用显示宽度，做字段长度用字符数。`,
          code: `text = "林晓"
data = text.encode("utf-8")
print("字符数:", len(text))
print("字节数:", len(data))
print("逐字节:", list(data))

broken = data[:2]
try:
    print(broken.decode("utf-8"))
except UnicodeDecodeError as exc:
    print("UnicodeDecodeError:", exc)`,
          output: `字符数: 2
字节数: 6
逐字节: [230, 158, 151, 230, 153, 147]
UnicodeDecodeError: 'utf-8' codec can't decode byte 0x9e in position 0: invalid start byte`,
          tip: `不要在 UTF-8 字节串上按固定长度切字符；先 decode 成 str，按字符处理。`
        },
        {
          h: "encode/decode 与错误处理",
          p: `编码和解码都可能失败。把中文用 ASCII 编码，[[“林”.encode("ascii")]] 会抛 [[UnicodeEncodeError]]；把一段非法 UTF-8 字节解码，会抛 [[UnicodeDecodeError]]。错误处理参数有三个常见值：[[strict]] 默认，遇错就抛；[[ignore]] 直接丢掉非法部分；[[replace]] 用 [[?]] 或 [[�]] 替代。

[[ignore]] 很危险：它让程序「不报错」，但数据已经缺了。除非你明确知道丢失可接受，否则不要用它处理用户数据。[[replace]] 适合展示和容错，但要记录日志。[[errors="surrogateescape"]] 是更高级的方案，用于把无法解码的字节原样带回，不是入门阶段该用的。

还要注意「编码声明」和「文件编码」是两件事。Python 3 源码默认 UTF-8，源文件里的字符串字面量按 UTF-8 解析；读写数据文件时，[[open()]] 的 [[encoding]] 参数决定字节和 str 的转换方式。两者不要混。`,
          code: `text = "林"
for errors in ("strict", "ignore", "replace"):
    try:
        print(errors, text.encode("ascii", errors=errors))
    except UnicodeEncodeError as exc:
        print(errors, "UnicodeEncodeError")

bad = b"\\xe6\\x9e"
print(bad.decode("utf-8", errors="replace"))`,
          output: `strict UnicodeEncodeError
ignore b''
replace b'?'
�`,
          tip: `[[errors="ignore"]] 会让数据静默丢失；生产代码优先让错误暴露，或在替换时记录日志。`
        },
        {
          h: "读写文本：encoding、newline 与 BOM",
          p: `[[open(path, "r", encoding="utf-8")]] 返回文本文件对象，读出来是 [[str]]；[[open(path, "rb")]] 返回二进制文件对象，读出来是 [[bytes]]。写文件同理：文本模式接收 [[str]]，二进制模式接收 [[bytes]]。

换行符也值得注意。Windows 用 [[\\r\\n]]，Unix 用 [[\\n]]。Python 文本模式默认启用 universal newlines，读的时候把 [[\\r\\n]] 和 [[\\r]] 都转成 [[\\n]]；写的时候按当前平台转换。如果你要精确控制换行，传 [[newline=""]] 或 [[newline="\\n"]]。处理 CSV 时尤其要注意，不要让额外空行混进来。

BOM 是 UTF-8 文件开头可能出现的 [[\\ufeff]]。有些 Windows 软件会写 BOM。用 [[encoding="utf-8"]] 读会把这个字符留在字符串开头，导致第一列字段名多一个不可见字符；用 [[utf-8-sig]] 会自动去掉。看到「第一行第一个字段怎么都对不上」时，先查 BOM。`,
          code: `from pathlib import Path

path = Path("scores.txt")
path.write_text("林晓,91\\n陈默,76\\n", encoding="utf-8")

with path.open("r", encoding="utf-8", newline="") as fh:
    for line in fh:
        print(repr(line))

print(path.read_text(encoding="utf-8").splitlines())`,
          output: `'林晓,91\\n'
'陈默,76\\n'
['林晓,91', '陈默,76']`,
          tip: `[[splitlines()]] 会去掉行尾换行，适合按行处理；[[read()]] 保留全部换行，适合整体文本。`
        },
        {
          h: "小任务：统计文件中的行数与中文字符",
          p: `现在做一个不依赖第三方库的小工具：读一个 UTF-8 文本文件，统计总行数、非空行数、中文字符数。这个任务把「读文件」「逐行」「字符判断」串起来，也让你第一次面对真实文件里的空行和空格。

判断中文可以用码点范围：[[\\u4e00]] 到 [[\\u9fff]] 覆盖常用汉字，但不覆盖扩展区和部分生僻字。入门阶段够用，真实项目应该用 [[unicodedata]] 或正则的 Unicode 属性。不要用 [[isalpha()]] 判断中文，它会把英文字母也算进去。

统计时逐行读，不要一次 [[read()]] 整个大文件。[[for line in fh]] 是流式迭代，内存占用和文件大小无关。行数用 [[enumerate]] 或计数器；非空行用 [[line.strip()]] 判断；中文字符数用 [[sum(1 for ch in line if ...)]]。`,
          code: `from pathlib import Path

path = Path("scores.txt")
lines = 0
non_empty = 0
chinese = 0

with path.open("r", encoding="utf-8") as fh:
    for line in fh:
        lines += 1
        if line.strip():
            non_empty += 1
        chinese += sum(1 for ch in line if "\\u4e00" <= ch <= "\\u9fff")

print(f"总行数: {lines}")
print(f"非空行: {non_empty}")
print(f"中文字符: {chinese}")`,
          output: `总行数: 2
非空行: 2
中文字符: 4`,
          tip: `统计大文件要逐行读；[[read()]] 会把整个文件装进内存。中文范围判断只是入门方案，生僻字要另行处理。`
        }
      ],
      points: [
        "[[str]] 是 Unicode 文本，[[bytes]] 是字节序列",
        "encode 是 str → bytes，decode 是 bytes → str",
        "UTF-8 变长，汉字通常 3 字节，不能按固定偏移切字符",
        "[[errors=\"ignore\"]] 会静默丢数据，慎用",
        "文本模式读 [[str]]，二进制模式读 [[bytes]]",
        "BOM 会让第一个字段多出不可见字符，必要时用 [[utf-8-sig]]"
      ],
      practice: "创建一个带空行和 BOM 的 UTF-8 文件，用 `utf-8` 和 `utf-8-sig` 分别读取，打印第一行的 `repr()`，解释差异。"
    }
  ]
});

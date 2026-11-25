window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch2-1": [
    {
      h: "字符串的底层：不可变序列与驻留",
      p: `字符串在 Python 里是不可变序列。你每次调用 [[replace()]]、[[strip()]]、[[upper()]]，得到的都是一个新字符串，原字符串一个字符都没变。这不是性能缺陷，而是设计选择：不可变对象可以安全共享、可以作为字典键、可以在多线程环境里传递而不必加锁。理解这一点，你就不会问「为什么我调了 upper 但原变量没变」。\n\n字符串还支持「驻留」（interning）。短小的、看起来像标识符的字符串，在编译期可能被合并成同一个对象；运行时用 [[sys.intern()]] 也可以显式驻留。驻留的目的是省内存、加快比较，但它是实现优化，不是语言保证。不要用 [[is]] 比较两个字符串的内容，哪怕在你的机器上偶尔为 True。\n\n索引取的是单个字符，Python 没有单独的 char 类型，一个字符就是长度为 1 的字符串。切片取的是子串，左闭右开：[[s[1:4]]] 取下标 1、2、3，不取 4。负索引从末尾数，[[s[-1]]] 是最后一个字符；越界索引抛 [[IndexError]]，越界切片不抛错，只会尽量返回空或截断。这个不对称是有意的：索引问「第几个」，切片问「哪一段」。\n\n字符串的长度按 Unicode 码点计算，不是按显示宽度。一个汉字通常是一个码点，一个 emoji 可能由多个码点组成，终端显示宽度又可能不同。[[len("👨‍👩‍👧‍👦")]] 可能大于 1，[["👍"]] 的宽度也不等于 1。做对齐、截断、用户名校验时，别假设「一个字符就是一个格子」；涉及显示宽度要用 [[unicodedata.east_asian_width()]] 或专门的库。`,
      code: String.raw`s = "  Python 成绩单  "
print(repr(s), len(s))
print(repr(s.strip()))
print(s[2:8], s[-6:-2], s[::-1])
print(s[100:200])

a = "hello"
b = "hello"
print(a == b, a is b)

import sys
print(sys.intern("python") is sys.intern("python"))`,
      output: `'  Python 成绩单  ' 14
'Python 成绩单'
Python 成绩单 单
''
True True
True`,
      tip: `[[s[::-1]]] 能反转字符串，但会复制整串；大文本反转请先问「真的要反转吗」，不要在大文件循环里随手用。`
    },
    {
      h: "切片边界与步长：负数、越界、复制",
      p: `切片写法的完整形式是 [[s[start:stop:step]]]，三个位置都可以省略。省略 start 表示从头，省略 stop 表示到尾，省略 step 表示 1。[[s[:]]] 复制整个序列，[[s[::2]]] 取偶数位，[[s[::-1]]] 反转。切片永远返回同类型的新对象：字符串返回字符串，列表返回列表，元组返回元组。\n\n负步长时，start 和 stop 的含义仍然是「从哪到哪」，但方向反了。[[s[5:1:-1]]] 从下标 5 往左走到下标 2，不包含 1；[[s[::-1]]] 从末尾走到开头。最容易错的是 [[s[1:5:-1]]]，起点在终点右边却用了负步长，结果为空。判断方法：先确定方向，再确定两个端点是否在方向的前方。\n\n越界切片不会报错，这一点和索引不同。[[s[100:200]]] 返回空串，[[s[-100:2]]] 会从开头截到 2。切片赋值则要求右边是可迭代对象，并且会改变原列表长度；[[a[1:3] = [9]]] 用一个月素替换两个元素，列表缩短。字符串不支持切片赋值，因为不可变。\n\n切片复制是浅复制。[[a[:]]] 只复制外层列表，内层列表仍然共享；[[copy.deepcopy(a)]] 才会递归复制。切片也常被用来「看一眼」数据，但大列表切片会分配新内存，不是零成本视图。需要只读窗口时，考虑 [[memoryview]] 或迭代器；需要独立副本时，明确用 [[copy]]。`,
      code: String.raw`s = "abcdef"
print(s[1:4], s[:3], s[3:], s[:])
print(s[::2], s[::-1])
print(s[5:1:-1], s[1:5:-1])

a = [0, 1, 2, 3, 4]
a[1:4] = [9]
print(a)

nested = [[1], [2]]
shallow = nested[:]
shallow[0].append(99)
print(nested, shallow)`,
      output: `bcd abc def abcdef
ace fedcba
edc
[0, 9, 4]
[[1, 99], [2]] [[1, 99], [2]]`,
      tip: `[[s[1:5:-1]]] 为空不是 bug；负步长要求 start 在 stop 的右边。写负步长前先用小例子验证方向。`
    },
    {
      h: "方法链与清洗流水线：split、strip、join",
      p: `真实数据往往一行一个学生，字段用逗号、制表符或竖线分隔，前后还有空格。清洗的第一原则是「先观察，再切分」：[[repr(line)]] 看不可见字符，[[line.count(",")]] 看分隔符数量，[[line.startswith("\ufeff")]] 看 BOM。不要凭肉眼判断「看起来是逗号」。\n\n[[strip()]] 去掉首尾空白，[[split(",")]] 按分隔符切分，[[join()]] 把序列拼回字符串。三者经常串联：[[",".join(part.strip() for part in line.split(","))]]。注意 [[split()]] 不带参数时按任意空白切分并丢弃空段；[[split(",")]] 保留空段。这两种行为不同，处理「缺考留空」的 CSV 时必须用后者。\n\n方法链不是越长越好。超过三四个步骤时，拆成命名中间变量或生成器函数，调试时能逐段打印。[[replace()]] 默认替换全部，想只替换前几个要传 count；[[startswith()]] 可以传元组一次匹配多个前缀；[[find()]] 找不到返回 -1，[[index()]] 找不到抛异常。选择哪个，取决于你希望「没找到」是正常分支还是错误。\n\n清洗完要校验字段数量。CSV 的字段里可能包含逗号（被引号包住），用 [[split(",")]] 会切坏；简单场景可以先用 [[csv]] 模块，复杂场景用 [[pandas.read_csv()]]。课程前半段用 [[split]] 是为了让你看清分隔逻辑，不是鼓励你手写 CSV 解析器。真正处理生产数据时，让标准库做标准库擅长的事。`,
      code: String.raw`line = " 林晓, 91, 88.5,  \n"
parts = [p.strip() for p in line.split(",")]
print(parts, len(parts))

print("|".join(parts))
print("a,,b".split(","))
print("a  b".split())
print("score.csv".startswith(("score", "grades")))

bad = "林晓,91"
try:
    name, py, math = bad.split(",")
except ValueError as err:
    print("字段数不对:", err)`,
      output: `['林晓', '91', '88.5', ''] 4
林晓|91|88.5|
['a', '', 'b']
['a', 'b']
True
字段数不对: not enough values to unpack (expected 3, got 2)`,
      tip: `[[split(",")]] 会保留末尾空字段，[[split()]] 不会；解析「允许缺考」的成绩行时，先决定空字段是合法还是错误。`
    }
  ],
  "ch2-2": [
    {
      h: "格式说明符的语法：fill、align、width、precision",
      p: `f-string 的格式说明符写在冒号后面，完整语法可以记成 [[[fill][align][sign][#][0][width][,][.precision][type]]]。最常用的是对齐 [[< > ^]]、宽度、千分位逗号和精度。[[f"{name:<8}"]] 左对齐占 8 格，[[f"{score:>6.1f}"]] 右对齐、保留一位小数；[[f"{ratio:^10.2%}"]] 居中并转百分比。\n\n填充字符写在对齐符号前面。[[f"{name:*<8}"]] 用星号填满右侧，[[f"{name:0>5}"]] 用 0 填左侧。数字的零填充有专门的 [[0]] 标志，[[f"{n:05d}"]] 和 [[f"{n:0>5}"]] 都能补零，但前者只对数字有效，后者是通用字符串填充。做编号时优先 [[:03d]]，语义更清楚。\n\n精度对浮点数是小数位数，对字符串是最大长度。[[f"{pi:.3f}"]] 是 3.141，[[f"{text:.5}"]] 只保留前 5 个字符。注意字符串截断不会自动加省略号，也不会考虑 Unicode 显示宽度；面向用户截断时，最好在业务层做，并明确「截断后是否要提示」。\n\n格式说明符不是万能模板语言。它不支持条件逻辑、循环、函数调用；复杂排版要在 Python 里先算好，再交给 f-string 拼接。把 f-string 写成一个小型报表引擎，短期很爽，长期没人敢改。格式化的边界是「把值变成文本」，不是「把业务逻辑塞进字符串」。`,
      code: String.raw`name = "林晓"
score = 91.25
ratio = 0.873
n = 7

print(f"|{name:<8}|{score:>8.2f}|")
print(f"|{name:*^10}|")
print(f"{n:03d} {n:0>5}")
print(f"{ratio:.1%}")
print(f"{'abcdef':.3}")
print(f"{1234567:,}")`,
      output: `|林晓      |   91.25|
|***林晓***|
007 00007
87.3%
abc
1,234,567`,
      tip: `中文用 [[:<8]] 不一定对得齐，因为显示宽度不是码点数；终端表格能用等宽字符就别混用中英文。`
    },
    {
      h: "数字与百分比：金额、增长率、负数",
      p: `数字格式化先分清三类：计数、金额、比例。计数用 [[d]]，金额用 [[.2f]] 或 [[Decimal]] 配合量化，比例用 [[.1%]] 或 [[.2%]]。[[f"{0.873:.1%}"]] 会先乘 100 再加百分号，得到 87.3%；如果你已经算成 87.3，不要再写 [[%]]，否则会变成 8730%。\n\n负数和对齐要一起考虑。[[f"{-12.5:>8.2f}"]] 在 8 格内右对齐，负号占一格；[[f"{-12.5:+.2f}"]] 强制显示正负号，正数也会带 [[+]]。做差额报表时，[[+]] 比空格更明确；做普通金额时，负数自带负号即可。千分位逗号对整数和小数都有效，但和 [[+]]、宽度组合时要注意顺序。\n\n金额不要用 float 累加。[[0.1 + 0.2]] 的误差在单次展示里看不出来，在几千笔对账里会变成一分钱的差额。正确做法是用 [[Decimal]] 保存金额，最后再格式化；如果上游只给 float，先转成字符串再构造 [[Decimal]]，并明确保留几位、如何舍入。\n\n百分比还要注意分母为零。[[0 / 0]] 会抛 [[ZeroDivisionError]]，[[0.0 / 0.0]] 得到 [[nan]]；报表里显示 [[nan%]] 很刺眼。业务上要定义「无数据」的展示，例如 [[N/A]] 或 [[—]]，而不是让 NaN 流到前端。格式化函数应该接收「值 + 是否有效」，而不是假设每个值都能算比例。`,
      code: String.raw`from decimal import Decimal, ROUND_HALF_UP

values = [12.5, -3.25, 0.0]
for v in values:
    print(f"{v:>8.2f} {v:+.2f}")

money = Decimal("19.99") * 3
print(f"金额: {money:.2f}")
print(f"增长率: {0.873:.1%}")
print(f"差额: {12.5 - 3.25:+.2f}")

def pct(part, total):
    return "N/A" if total == 0 else f"{part / total:.1%}"

print(pct(0, 0), pct(3, 4))`,
      output: `   12.50 +12.50
   -3.25 -3.25
    0.00 +0.00
金额: 59.97
增长率: 87.3%
差额: +9.25
N/A 75.0%`,
      tip: `[[f"{x:.1%}"]] 会自动乘以 100；如果 x 已经是 87.3，请用 [[f"{x:.1f}%"]]，否则会得到 8730.0%。`
    },
    {
      h: "动态格式与调试：等号、嵌套与转义",
      p: `f-string 支持在 [[=]] 后面直接输出「表达式 = 值」，例如 [[f"{score=}"]] 会打印 [[score=91]]。这是调试利器，但别留在生产日志里：它会把变量名暴露给用户，也可能把敏感值写进日志。调试时用，提交前删，或者改用结构化日志。\n\n格式宽度可以嵌套：[[f"{value:{width}.2f}"]]，其中 [[width]] 是另一个变量。嵌套只支持一层，且宽度必须是整数；[[width]] 是字符串时会报错。动态精度同理。这个能力适合「列宽由终端宽度决定」的报表，不适合把格式串做成用户可编辑的模板——那会引入注入和稳定性问题。\n\n花括号要转义。输出 JSON 或模板占位符时，字面量花括号写成 [[{{]] 和 [[}}]]；[[f"{{name}}":]] 得到 [[{name}]]，而 [[f"{name}"]] 会取值。反斜杠在 f-string 表达式里也有限制：Python 3.12 之前不允许在表达式部分使用反斜杠，复杂表达式先算到变量再插值。\n\nf-string 的求值时机是「执行到这一行时」，不是定义时。循环里修改了变量，下一次格式化会看到新值；但如果你在格式化时调用有副作用的函数，它每次都会执行。日志级别很低时，先判断再格式化，可以避免不必要的开销：[[if logger.isEnabledFor(logging.DEBUG): logger.debug(f"...")]]。`,
      code: String.raw`score = 91
name = "林晓"
width = 8

print(f"{score=} {name=}")
print(f"{score:{width}.2f}")
print(f"{{name}} 是占位符，{name} 是变量")

# Python 3.12+ 才允许在表达式里用反斜杠
parts = ["a", "b"]
print(f"join: {'/'.join(parts)}")`,
      output: `score=91 name='林晓'
   91.00
{name} 是占位符，林晓 是变量
join: a/b`,
      tip: `[[f"{expr=}"]] 输出的是 repr，不是 str；字符串会带引号。调试完记得删掉，别让它进用户可见的报告。`
    }
  ],
  "ch2-3": [
    {
      h: "编码的前世今生：ASCII、GBK、UTF-8 与 Unicode",
      p: `计算机只存字节，文本是人类给字节附加的解释。ASCII 用 1 个字节表示 128 个字符；GBK 用双字节表示中文；Unicode 是字符集，给每个字符一个码点；UTF-8 是 Unicode 的一种变长编码，用 1 到 4 个字节表示一个码点。四者不是同一层概念：Unicode 是「有哪些字符」，UTF-8 是「怎么把这些字符写成字节」。\n\nUTF-8 的设计很巧妙：ASCII 字符仍然占 1 个字节，和旧系统兼容；中文通常占 3 个字节；emoji 可能占 4 个。变长意味着你不能用「字节数除以 2」算字符数，也不能随意按字节截断，否则会把一个多字节字符切成两半，解码时报 [[UnicodeDecodeError]]。\n\nGBK 和 UTF-8 不兼容。一个用 GBK 保存的文件，用 UTF-8 打开会乱码或报错；反过来也一样。乱码不是「文件坏了」，而是「解码器和编码方式不匹配」。判断文件编码不能只看扩展名，[[.txt]] 可以是任何编码；可靠做法是问数据提供方，或者用 [[chardet]]/[[charset-normalizer]] 探测，再用小样本验证。\n\nPython 3 的 [[str]] 是 Unicode 字符串，[[bytes]] 是字节序列。[[open()]] 默认以文本模式返回 [[str]]，[[open(..., "rb")]] 返回 [[bytes]]。网络传输、图片、压缩包用 bytes；人类可读的配置、日志、CSV 用 str。把两者混在一起，就会出现「为什么 print 出来是 b'...'」或者「为什么中文变成 \xe4\xb8\xad」。先分清层，再谈编码。`,
      code: String.raw`text = "中"
print(text, len(text))
print(text.encode("utf-8"), len(text.encode("utf-8")))
print(text.encode("gbk"), len(text.encode("gbk")))

raw = b"\xe4\xb8\xad"
print(raw.decode("utf-8"))
print(raw.decode("gbk", errors="replace"))

print("A".encode("ascii"))
print("中".encode("ascii", errors="ignore"))`,
      output: `中 1
b'\xe4\xb8\xad' 3
b'\xd6\xd0' 2
中
涓
b'A'
b''`,
      tip: `[[len("中") == 1]] 是字符数，[[len("中".encode("utf-8")) == 3]] 是字节数；做数据库字段长度限制时，先确认它按字符还是按字节算。`
    },
    {
      h: "encode/decode 的错误策略与 BOM",
      p: `[[encode()]] 和 [[decode()]] 都可以传 [[errors=]]，常用策略有 [[strict]]、[[ignore]]、[[replace]]、[[backslashreplace]]。默认是 strict，遇到无法编码/解码的字节就抛异常；ignore 直接丢弃，replace 用占位符替换。生产环境不要随手 ignore：它会让数据静默丢失，排查时连线索都没有。\n\nBOM 是字节顺序标记，UTF-8 的 BOM 是 [[\xef\xbb\xbf]]，通常出现在 Windows 记事本保存的文件开头。[[utf-8-sig]] 会在读取时吞掉 BOM，写入时加上 BOM；普通 [[utf-8]] 会把 BOM 当成一个不可见字符，导致第一列字段名变成 [[\ufeffname]]。处理 CSV 时，如果第一列表头总是匹配不上，先检查 BOM。\n\n换行也是编码之外的另一层。Windows 用 [[\r\n]]，Unix 用 [[\n]]；Python 文本模式默认做通用换行转换，[[newline=""]] 可以保留原始换行，[[newline="\n"]] 统一写出。做跨平台数据交换时，显式指定换行；做逐行解析时，[[splitlines()]] 比 [[split("\n")]] 更稳，因为它能处理多种换行符。\n\n错误处理要记录上下文。[[decode("utf-8", errors="replace")]] 之后，你不知道哪些字符被替换了；更好的做法是捕获异常，打印字节偏移、前后各 20 个字节、文件名和行号。编码问题最难的不是修复，而是定位。把「哪一行、哪个字节、期望什么编码」写进错误信息，下一次排查会快十倍。`,
      code: String.raw`raw = "中文".encode("utf-8")
print(raw)

print(raw.decode("utf-8"))
try:
    print(raw.decode("ascii"))
except UnicodeDecodeError as err:
    print("失败:", err.start, err.end, err.reason)

print("中".encode("ascii", errors="replace"))
print("中".encode("ascii", errors="ignore"))
print("中".encode("ascii", errors="backslashreplace"))

with open("bom.csv", "w", encoding="utf-8-sig", newline="") as f:
    f.write("name,score\n林晓,91\n")`,
      output: `b'\xe4\xb8\xad\xe6\x96\x87'
中文
失败: 0 3 'ascii' codec can't decode byte 0xe4 in position 0: ordinal not in range(128)
b'?'
b''
b'\\u4e2d'
# bom.csv 开头含 EF BB BF`,
      tip: `[[errors="ignore"]] 会静默丢掉字符，[[errors="replace"]] 会留下 [[�]]；线上数据宁可直接失败，也不要悄悄损坏。`
    },
    {
      h: "大文件读取：newline、流式与内存",
      p: `[[open()]] 返回的文件对象是迭代器，逐行读取不会一次性把整个文件塞进内存。[[for line in f:]] 是最省内存的写法；[[f.readlines()]] 会返回列表，[[f.read()]] 返回整块字符串。几十 MB 的日志用 readlines 也许没事，几 GB 的日志会直接把内存打满。处理大文件时，默认选流式。\n\n文本模式会自动解码，二进制模式不会。[[open(path, "rb")]] 适合图片、压缩包、需要自己控制编码的场景；[[open(path, "r", encoding="utf-8")]] 适合大多数文本。不要用文本模式读二进制再 decode，容易在换行转换上出问题。写文件时同理：[["wb"]] 写 bytes，[[\"w\"]] 写 str。\n\n逐行处理时，注意 [[line]] 末尾带着换行符。[[line.strip()]] 会去掉首尾空白，但也可能去掉有意义的空格；[[line.rstrip("\n")]] 只去掉换行，更精确。空行用 [[if not line.strip(): continue]] 跳过；但如果你需要保留空行作为记录分隔，就别跳。\n\n编码错误可能在中途才出现，因为解码是流式的。捕获异常后，文件对象的位置不一定可靠；最稳的做法是记录出错行号，重新用 [[errors="replace"]] 或二进制模式打开，定位那段字节。不要假设「前面读成功了，后面一定没问题」。流式处理的代价是：错误出现得晚，必须靠日志和上下文把它抓住。`,
      code: String.raw`from pathlib import Path

path = Path("scores.csv")
with path.open("r", encoding="utf-8", newline="") as f:
    for lineno, line in enumerate(f, 1):
        text = line.rstrip("\n")
        if not text.strip():
            continue
        print(lineno, text)

# 二进制模式读取前 4 个字节，用于判断 BOM
with path.open("rb") as f:
    head = f.read(4)
print(head)`,
      output: `1 name,score
2 林晓,91
3 周宁,88
b'name'`,
      tip: `[[enumerate(f, 1)]] 的行号从 1 开始，和编辑器一致；报错时把行号带上，别只打印「解析失败」。`
    }
  ]
});

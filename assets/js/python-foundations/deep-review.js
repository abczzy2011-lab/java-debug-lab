window.PY_FOUNDATIONS_REVIEW = {
  "ch1-1": [
    {
      h: "本章复盘：环境、变量与表达式",
      p: `这一章解决两件事：代码在哪里运行，名字怎样指向对象。运行时先分清解释器、REPL、脚本、模块四种形态；[[sys.executable]] 确认解释器，[[sys.path]] 确认模块搜索路径，[[__name__]] 区分直接运行与导入。主函数保护不是仪式，而是把副作用关在入口里。\n\n变量是标签，对象才有类型、身份和值。[[==]] 比较值，[[is]] 比较身份；[[b = a]] 不复制，[[b = a.copy()]] 只复制外层，[[copy.deepcopy()]] 才递归复制。不可变对象「修改」是重新绑定，可变对象才可能原地变；函数参数传的是对象引用，不是副本。默认参数在定义时求值，可变默认值会跨调用共享。\n\n表达式与语句要分开：表达式产生值，语句驱动控制流或绑定名字。[[//]] 向下取整，[[%]] 符号跟随除数，[[round()]] 是银行家舍入；金额用 [[Decimal]]，浮点比较用 [[math.isclose()]]。第一个成绩单项目把「输入契约、计算、格式化、落盘」串起来，为后面所有项目打底。\n\n检查点：你能不能解释 [[python3 script.py]] 和 [[python3 -m module]] 的导入差异？能不能用 [[id()]] 判断原地修改还是重新绑定？能不能写出一个导入无副作用的模块？能不能给空列表、坏类型、越界分数分别设计错误？这四题答清楚，本章就过关。`,
      code: String.raw`import sys
print(sys.version_info >= (3, 10))
a = [1, 2]
b = a
b += [3]
print(a is b, a)

x = 10
y = x
y += 1
print(x, y, id(x) == id(y))`,
      output: `True
True [1, 2, 3]
10 11 False`,
      tip: `[[a is b]] 为 True 只说明两个名字指向同一对象；要判断值相等，用 [[==]]。`
    }
  ],
  "ch2-1": [
    {
      h: "本章复盘：字符串、格式化与编码",
      p: `字符串是不可变序列：索引取字符，切片取子串，方法返回新字符串。切片左闭右开，越界切片不报错，负步长要先确定方向；切片复制是浅复制，嵌套可变对象仍共享。常用清洗顺序是 [[repr()]] 观察、[[strip()]] 去首尾、[[split()]] 切分、[[join()]] 拼回；[[split(",")]] 保留空字段，[[split()]] 丢弃空段。\n\n格式化抓住三个旋钮：宽度、对齐、精度。[[< > ^]] 控制方向，[[.2f]] 控制小数，[[,]] 控制千分位，[[%]] 自动乘 100。数字格式前先分清计数、金额、比例；金额用 [[Decimal]]，比例处理分母为零。f-string 适合「已知模板 + 少量变量」，不适合用户可编辑模板或复杂业务逻辑。\n\n编码分三层：Unicode 是字符集，UTF-8 是变长编码，[[bytes]] 是字节序列。[[str]] 与 [[bytes]] 不要混；[[encode()]]/[[decode()]] 默认 strict，[[ignore]] 会静默丢数据，[[replace]] 会留下替换符。BOM 用 [[utf-8-sig]] 处理，换行用 [[newline=""]] 或 [[splitlines()]]；乱码先 [[repr()]] 和原始字节，不要靠眼睛猜。\n\n检查点：[[split(",")]] 和 [[split()]] 对空字段的行为一样吗？[[f"{0.873:.1%}"]] 输出什么？[[utf-8-sig]] 和 [[utf-8]] 差在哪？[[errors="ignore"]] 为什么危险？这四题能答，字符串与编码的日常问题基本能定位。`,
      code: String.raw`s = " 林晓, 91,  "
print([p.strip() for p in s.split(",")])
print("a,,b".split(","), "a,,b".split())
print(f"{0.873:.1%}")
print("中".encode("utf-8"), len("中"))`,
      output: `['林晓', '91', '']
['a', '', 'b'] ['a', 'b']
87.3%
b'\xe4\xb8\xad' 1`,
      tip: `[[len("中")]] 是 1 个字符，[[len("中".encode("utf-8"))]] 是 3 个字节；字段长度限制先确认按哪个算。`
    }
  ],
  "ch3-1": [
    {
      h: "本章复盘：列表、元组与序列",
      p: `列表是可变动态数组：尾部 append/pop 均摊 O(1)，按下标读写 O(1)，按值查找/删除 O(n)，头部插入/删除 O(n)。需要队列用 [[deque]]，需要成员判断用 [[set]]，需要按键查找用 [[dict]]。[[append(x)]] 加一个元素，[[extend(xs)]] 拆开逐个加；[[insert()]] 越界插到末尾；[[remove()]] 找不到抛 ValueError。\n\n遍历时不要修改列表：迭代器下标仍在前进，会跳过元素。遍历副本、倒序遍历或构造新列表三选一。切片产生新列表，切片赋值改变原列表长度；切片复制是浅复制，内层可变对象仍共享。排序用 [[sorted()]] 返回新列表，[[sort()]] 原地并返回 None；key 返回类型要一致，多键用元组，同分用稳定排序或显式名次。\n\n元组是不可变序列，逗号比括号重要；元组可哈希的前提是所有元素可哈希。解包要求元素个数匹配，星号吸收剩余，嵌套解包适合固定结构。[[zip()]] 按最短截断，[[strict=True]] 才报错；zip 返回迭代器，遍历一次就耗尽。namedtuple 给元组加字段名，适合轻量记录；需要校验/默认值用 dataclass。\n\n检查点：[[pop(0)]] 的复杂度是多少？[[a[:]]] 会复制内层列表吗？[[zip(a, b)]] 长度不一致会怎样？[[(1, [2])]] 能当字典键吗？这四题能答，序列选型和边界基本不会错。`,
      code: String.raw`a = [1, 2, 3]
b = a[:]
print(a is b, a == b)
a[1:3] = [9]
print(a, b)

from collections import namedtuple
Pair = namedtuple("Pair", "x y")
p = Pair(1, 2)
print(p.x, p[1])`,
      output: `False True
[1, 9] [1, 2, 3]
1 2`,
      tip: `[[a[:]]] 只复制外层；内层列表仍共享。需要独立嵌套结构时用 [[copy.deepcopy()]]。`
    }
  ],
  "ch4-1": [
    {
      h: "本章复盘：字典、集合与查找",
      p: `字典是哈希表：键必须可哈希，查找平均 O(1)，遍历顺序是插入顺序。[[]] 缺失抛 KeyError，[[get()]] 返回默认；[[setdefault()]] 会插入，[[defaultdict(factory)]] 惰性建默认值。默认工厂必须是可调用对象，不能传现成的可变对象，否则所有键共享同一个默认值。\n\n嵌套数据先定义记录结构，再决定索引。list of dicts 适合顺序展示，dict of dicts 适合按 id 查找；两层可以共存。缺失键不要全吞成 None，业务上该报错的地方要报错；链式 [[.get().get()]] 在中间是 None 时会抛 AttributeError，写 [[safe_get]] 逐层判断。合并 [[{**a, **b}]] 只合并顶层，深合并要明确数组语义。\n\n集合元素可哈希、唯一、无序；适合去重、成员判断、交并差。[[{}]] 是空字典，空集合用 [[set()]]；集合 [[pop()]] 删除任意元素，不是第一个。[[frozenset]] 可哈希，能当字典键。去重前先定义「重复」：完全相等、业务键还是某个字段；需要顺序去重用 [[dict.fromkeys()]]。\n\n检查点：字典键为什么不能是列表？[[get()]] 和 [[setdefault()]] 差在哪？[[defaultdict(list)]] 和 [[defaultdict(defaultdict(list))]] 有什么坑？集合 [[pop()]] 返回什么？这四题能答，字典/集合的常见事故基本能避免。`,
      code: String.raw`from collections import defaultdict

d = {"a": 1}
print(d.get("b"), d.setdefault("c", []))
d["c"].append(2)
print(d)

groups = defaultdict(list)
groups["A"].append("林晓")
print(dict(groups))

print({} == set(), type({}), type(set()))`,
      output: `None []
{'a': 1, 'c': [2]}
{'A': ['林晓']}
False <class 'dict'> <class 'set'>`,
      tip: `[[{} == set()]] 为 False；空字典和空集合是不同类型，不能互相替代。`
    }
  ],
  "ch5-1": [
    {
      h: "本章复盘：条件、循环与模式匹配",
      p: `条件判断的是真值，不是「等于 True」。空容器、0、None、False 为假；自定义对象可实现 [[__bool__]]/[[__len__]]。[[bool]] 是 int 子类，[[True == 1]]；数字校验先排除 bool。[[and/or]] 返回操作数，不是布尔值；需要严格布尔用 [[bool()]]，二选一用 [[x if cond else y]]。\n\n分支要互斥且覆盖完整，边界写清楚。[[0 <= x < 100]] 不包含 100；[[0 <= x > 10]] 没有上界。链式比较只求值一次，但方向要一致。卫语句提前返回，主逻辑保持扁平；长条件先命名，别把副作用塞进条件。\n\n循环是迭代协议：[[iter()]] 拿迭代器，[[next()]] 直到 StopIteration。[[range()]] 惰性，循环变量会泄漏到外层；嵌套 [[break]] 只跳一层。[[for...else]] 的 else 在「没有 break」时执行。[[enumerate]] 带下标，[[zip]] 按最短截断，[[strict=True]] 才报错。\n\n[[match]] 是 3.10+ 的结构匹配：从上到下、首个命中、不穿透；[[case _]] 匹配一切且应放最后；映射模式只要求包含键，不要求只有这些键。3.9 及以下直接 SyntaxError，练习室 3.8 只能读不能提交。检查点：[[[] == False]] 是什么？[[for...else]] 什么时候执行？[[zip]] 长度不一致怎么办？[[match]] 能替代 if/elif 吗？`,
      code: String.raw`print([] == False, bool([]))
print(0 or "x", 1 and "y")

for n in [2, 4]:
    if n % 2:
        break
else:
    print("全偶")

print(list(zip([1, 2], ["a"])))`,
      output: `False False
x y
全偶
[(1, 'a')]`,
      tip: `[[[] == False]] 为 False，但 [[bool([])]] 为 False；判断空用 [[not x]]，不要用 [[x == False]]。`
    }
  ],
  "ch6-1": [
    {
      h: "本章复盘：函数、作用域与递归",
      p: `函数是命名的作用域，调用时才创建栈帧。参数绑定顺序：位置、默认、[[*args]]、keyword-only、[[**kwargs]]；[[/]] 限制仅限位置，[[*]] 限制仅限关键字。默认参数在定义时求值，可变默认值跨调用共享；需要每次新值就写 None，函数体内再创建。\n\n返回值不写就是 None；返回多个值本质是元组。纯函数只依赖参数、不修改输入，副作用留在 I/O 边界。[[assert]] 不能做参数校验，[[python -O]] 会移除；公共函数抛 TypeError/ValueError，错误信息带参数名和原值。\n\n作用域按 LEGB；函数内赋值让名字变局部，改外层用 [[nonlocal]]，改模块用 [[global]]。类作用域不参与 LEGB，方法里访问类属性要 [[self.x]]。闭包捕获变量而不是值，循环里创建 lambda 要 [[i=i]] 固定当前值。[[map/filter]] 返回迭代器，[[functools.partial]] 固定参数，[[operator.itemgetter]] 替代取键 lambda。\n\n递归三件套：基线、递推、收敛；Python 不支持尾递归优化，深度大用迭代/显式栈。二分三件套：有序、区间定义一致、边界更新正确；递归版不要切片，否则 O(log n) 退化成 O(n)。检查点：[[x = x + 1]] 为什么可能 UnboundLocalError？闭包为什么在循环里都返回最后一个值？二分该用闭区间还是半开区间？`,
      code: String.raw`def outer():
    x = 1
    def inner():
        nonlocal x
        x += 1
        return x
    return inner

f = outer()
print(f(), f())

funcs = [lambda: i for i in range(3)]
print([g() for g in funcs])
funcs = [lambda i=i: i for i in range(3)]
print([g() for g in funcs])`,
      output: `2 3
[2, 2, 2]
[0, 1, 2]`,
      tip: `闭包捕获变量；循环结束后变量是最后一个值，所以所有 lambda 都看到它。用默认参数早期绑定。`
    }
  ],
  "ch7-1": [
    {
      h: "本章复盘：推导式、迭代器与生成器",
      p: `推导式是「表达式 + for + if」，一趟完成；多个 for 的顺序与书写一致，条件表达式和过滤条件位置不同，结果长度也不同。推导式有独立作用域，循环变量不泄漏；但第一个可迭代表达式在外层求值。列表推导式立即物化，生成器表达式惰性、只能消费一次。\n\n可迭代对象实现 [[__iter__]]，迭代器实现 [[__iter__]]/[[__next__]]；迭代器有状态、一次性、耗尽后持续 StopIteration。[[iter()]] 每次应返回新迭代器，除非对象本身设计成一次性。惰性求值把错误和副作用推迟到消费时；[[itertools]] 提供 count/cycle/islice/chain 等工具，无限迭代器不要直接 [[list()]]。\n\n生成器函数用 [[yield]] 暂停/恢复，[[send()]] 送值，[[throw()]] 送异常，[[close()]] 清理；第一次 send 必须 None。[[yield from]] 委托子生成器并接收返回值。生成器管道逐层处理，内存只保留当前元素；管道只消费一次，多个聚合要在一次遍历里完成。\n\n检查点：[[[x for x in xs if x]]] 和 [[[x if x else 0 for x in xs]]] 长度一样吗？生成器为什么第二次 [[list()]] 是空的？[[send(3)]] 第一次为什么报错？[[close()]] 会抛什么？这四题能答，推导式和生成器就不会用反。`,
      code: String.raw`g = (x * x for x in range(4))
print(list(g))
print(list(g))

from itertools import islice, count
print(list(islice(count(10), 3)))

def gen():
    yield 1
    yield 2
print(list(gen()))`,
      output: `[0, 1, 4, 9]
[]
[10, 11, 12]
[1, 2]`,
      tip: `生成器表达式只能消费一次；需要重复遍历就重新创建，或先 [[list()]] 物化（大文件不要物化）。`
    }
  ]
};

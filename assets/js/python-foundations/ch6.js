window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch6",
  part: 1,
  number: "06",
  title: "函数、参数与作用域",
  summary: "函数不是「把代码包起来」，而是把输入、输出、作用域和复用边界定义清楚。本章从参数传递讲到 LEGB、闭包和 lambda，再用递归与二分查找把「函数调用栈」变成能看见的东西。",
  goals: [
    "能写出参数清晰、返回值明确的函数",
    "能解释默认参数、可变参数和参数解包",
    "能说清 LEGB、global/nonlocal 与闭包",
    "能写出正确的二分查找并解释递归成本"
  ],
  lessons: [
    {
      id: "ch6-1",
      title: "6.1 def、return 与参数",
      minutes: 45,
      lead: "写函数的第一原则不是「短」，而是「边界清楚」：它接收什么、返回什么、出错时怎么办。这一节把位置参数、关键字参数、默认参数、可变参数和返回值讲成一套可用的规则。",
      source: "Introducing Python 3rd · Ch.9；Beginning Python 4th · Ch.6；Head First Python 3rd · Ch.4–5",
      sections: [
        {
          h: "函数是命名的作用域，不是一段代码",
          p: `[[def average(scores):]] 定义了一个函数对象，名字 [[average]] 绑定到它。函数体不会在定义时执行，只有调用时才执行。函数有自己的局部作用域：函数里赋值的名字默认是局部的，不会污染外部。

函数的第一价值是**命名行为**。一段代码被调用三次，不是「重复三次」，而是「同一个行为被复用三次」。第二价值是**隔离变化**：输入通过参数进来，结果通过 [[return]] 出去，函数内部的临时变量对外不可见。第三价值是**可测试**：你可以给定输入，断言输出。

文档字符串 [["""返回平均分"""]] 不是注释，它保存在 [[average.__doc__]] 里，能被 [[help()]] 和 IDE 读取。写清楚参数含义、返回值、异常，比写「这个函数用于计算」有用得多。`,
          code: `def average(scores):
    """返回分数的平均值；空列表抛 ValueError。"""
    if not scores:
        raise ValueError("scores 不能为空")
    return sum(scores) / len(scores)

print(average([91, 84, 88]))
print(average.__doc__)
help(average)`,
          output: `87.66666666666667
返回分数的平均值；空列表抛 ValueError。
Help on function average...`,
          tip: `函数定义时只创建对象，不执行函数体；函数体里的代码在调用时才运行。`
        },
        {
          h: "位置参数、关键字参数、默认参数",
          p: `调用函数时，参数可以按位置传，也可以按名字传。[[f(1, 2)]] 是位置参数；[[f(a=1, b=2)]] 是关键字参数。关键字参数让调用意图更清楚，尤其是参数多、含义容易混的时候。

默认参数在定义时求值，而且只求值一次。[[def add(item, bucket=[]):]] 的 [[bucket]] 在所有调用之间共享同一个列表；你 [[append]] 一次，下次调用还在。正确写法是用 [[None]] 做哨兵：[[def add(item, bucket=None): if bucket is None: bucket = []]]。

参数顺序有规则：位置参数在前，默认参数在后，关键字-only 参数放在 [[*]] 后面，位置-only 参数放在 [[/]] 前面。[[def f(a, b=1, *, c, d=2):]] 里 [[c]] 必须用关键字传。不要为了「灵活」把所有参数都设默认值，调用方会不知道哪些该传。`,
          code: `def add(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket

print(add(1))
print(add(2))
print(add(3))

def greet(name, *, punctuation="!"):
    return f"Hello, {name}{punctuation}"

print(greet("林晓"))
print(greet("林晓", punctuation="?"))`,
          output: `[1]
[2]
[3]
Hello, 林晓!
Hello, 林晓?`,
          tip: `默认参数只在定义时求值一次；可变默认值用 [[None]] 哨兵，在函数体内创建。`
        },
        {
          h: "return 与 None：没有返回就是 None",
          p: `函数没有 [[return]]，或者 [[return]] 后面没有值，返回值都是 [[None]]。[[print()]] 也是返回 [[None]]，它只负责输出，不负责返回内容。很多「为什么变量变成了 None」的 bug，都是把 [[print]] 当成了 [[return]]。

[[return]] 会立即结束函数，后面的代码不再执行。这叫「早返回」，适合处理错误和边界：先检查空值、类型、范围，不满足就返回或抛异常；主逻辑放在后面，缩进更浅。

返回多个值本质上返回一个元组：[[return count, total]]。调用方可以 [[c, t = f()]] 解包，也可以 [[result = f()]] 拿元组。不要返回一个含义不清的列表；字段顺序要写进文档，字段多了用 [[NamedTuple]] / [[dataclass]]。`,
          code: `def summarize(scores):
    if not scores:
        return None
    return len(scores), sum(scores), sum(scores) / len(scores)

result = summarize([91, 84, 88])
print(result)

count, total, avg = result
print(count, total, avg)

print(summarize([]))`,
          output: `(3, 263, 87.66666666666667)
3 263 87.66666666666667
None`,
          tip: `[[print()]] 返回 [[None]]；函数要返回结果用 [[return]]，不要用 [[print]] 代替。`
        },
        {
          h: "可变参数 *args 与 **kwargs",
          p: `[[*args]] 把多余的位置参数收集成元组；[[**kwargs]] 把多余的关键字参数收集成字典。它们适合「转发参数」和「写装饰器」，不适合用来掩盖一个本该明确列出的参数列表。

[[def f(*args, **kwargs):]] 可以接收任何参数，但调用方看不出函数需要什么，IDE 也无法提示。除非你是在做包装器，否则优先写明确参数。参数超过五六个，考虑用配置对象或关键字-only 参数。

调用时也可以用 [[*]] / [[**]] 解包：[[f(*items)]] 把列表展开成位置参数，[[f(**config)]] 把字典展开成关键字参数。解包时键必须是字符串，且不能和已有参数冲突。`,
          code: `def show(*args, **kwargs):
    print("args:", args)
    print("kwargs:", kwargs)

show(1, 2, name="林晓", score=91)

items = [1, 2]
config = {"name": "陈默", "score": 76}
show(*items, **config)`,
          output: `args: (1, 2)
kwargs: {'name': '林晓', 'score': 91}
args: (1, 2)
kwargs: {'name': '陈默', 'score': 76}`,
          tip: `[[*args]] 是元组，[[**kwargs]] 是字典；转发参数时保留它们，业务函数尽量写明确参数。`
        },
        {
          h: "小任务：写一个健壮的 average",
          p: `要求 [[average(numbers)]] 接收数字序列，返回平均值；空序列抛 [[ValueError]]；序列里有 [[None]] 或非数字抛 [[TypeError]]；可选参数 [[skip_none=False]]，为真时跳过 [[None]]。这个任务练参数设计、类型检查和边界。

先写测试表：空列表、全数字、含 [[None]]、含字符串、全 [[None]]、[[skip_none=True]]。每个用例都写清楚期望的异常类型或返回值。不要只测「正常路径」，异常路径才是函数契约的一部分。

实现时把「过滤」和「计算」分开：[[clean_numbers]] 负责校验和过滤，[[average]] 负责求和除以个数。这样错误信息更准确，也方便单独测试。`,
          code: `def clean_numbers(numbers, skip_none=False):
    result = []
    for value in numbers:
        if value is None and skip_none:
            continue
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError(f"不是数字: {value!r}")
        result.append(value)
    return result

def average(numbers, skip_none=False):
    cleaned = clean_numbers(numbers, skip_none=skip_none)
    if not cleaned:
        raise ValueError("没有可计算的数字")
    return sum(cleaned) / len(cleaned)

print(average([91, 84, 88]))
print(average([91, None, 88], skip_none=True))

try:
    print(average([]))
except ValueError as exc:
    print("ValueError:", exc)`,
          output: `87.66666666666667
89.5
ValueError: 没有可计算的数字`,
          tip: `[[bool]] 是 [[int]] 子类；校验数字时排除 [[True]] / [[False]]，否则它们会被当成 1/0。`
        }
      ],
      points: [
        "函数定义只创建对象，调用时才执行函数体",
        "默认参数只求值一次，可变默认值要用 [[None]] 哨兵",
        "[[return]] 立即结束函数，没有返回值就是 [[None]]",
        "[[*args]] 收集位置参数为元组，[[**kwargs]] 收集关键字参数为字典",
        "调用时可以用 [[*]] / [[**]] 解包序列和字典",
        "参数列表要明确，[[*args]] / [[**kwargs]] 主要留给包装器"
      ],
      practice: "给 `average()` 增加 `precision=2` 参数：返回值仍保留原始精度，但打印时四舍五入；思考 precision 应该影响返回值还是只影响展示。"
    },
    {
      id: "ch6-2",
      title: "6.2 作用域、闭包与 lambda",
      minutes: 45,
      lead: "为什么函数里改了变量，外面没变？为什么嵌套函数能记住外层变量？为什么 lambda 里不能写赋值？这一节用 LEGB 规则把这些现象串起来，并说明什么时候该用闭包，什么时候不该。",
      source: "Introducing Python 3rd · Ch.9；Beginning Python 4th · Ch.6；Head First Python 3rd · Ch.5",
      sections: [
        {
          h: "LEGB：名字查找的四个层级",
          p: `Python 查找名字按 LEGB 顺序：Local（函数内部）、Enclosing（外层函数）、Global（模块全局）、Built-in（内置）。先在最近的作用域找，找不到再往外层找，最后找 [[len]]、[[print]] 这些内置名字。

函数里赋值会让名字变成局部变量，除非你用 [[global]] / [[nonlocal]] 声明。[[def f(): x = 1]] 的 [[x]] 是局部的，不会影响模块里的 [[x]]。反过来，函数里读取一个外部变量是允许的，只要没有同名局部赋值。

这个规则解释了「为什么我在函数里改了列表，外面也变了」：你没有重新绑定名字，而是修改了名字指向的可变对象。作用域规则管的是名字绑定，不是对象内容。`,
          code: `x = "global"

def read():
    print(x)

def shadow():
    x = "local"
    print(x)

read()
shadow()
print(x)

items = []
def add():
    items.append(1)

add()
print(items)`,
          output: `global
local
global
[1]`,
          tip: `函数内赋值默认创建局部名字；修改可变对象不需要 [[global]]，但重新绑定需要。`
        },
        {
          h: "global 与 nonlocal：什么时候必须声明",
          p: `[[global name]] 告诉解释器：函数里的 [[name]] 指向模块全局变量，不是新建局部变量。[[nonlocal name]] 指向最近的外层函数变量。两者都只影响名字绑定，不改变对象的可变性。

[[global]] 应该少用。它让函数依赖外部状态，测试困难，并发下也容易出问题。更好的做法是把状态作为参数传入，或把状态封装在类/闭包里。只有在模块级配置、计数器、缓存这类明确场景才考虑 [[global]]。

[[nonlocal]] 常用于闭包计数器。没有它，内层函数的 [[count += 1]] 会被当成局部赋值，外层 [[count]] 不变。[[nonlocal]] 只能指向外层函数变量，不能指向全局；全局用 [[global]]。`,
          code: `count = 0

def increment_global():
    global count
    count += 1
    return count

print(increment_global())
print(increment_global())

def make_counter():
    count = 0
    def next_value():
        nonlocal count
        count += 1
        return count
    return next_value

counter = make_counter()
print(counter())
print(counter())`,
          output: `1
2
1
2`,
          tip: `[[global]] 改模块变量，[[nonlocal]] 改外层函数变量；两者都只影响绑定，不影响对象内容。`
        },
        {
          h: "闭包：函数记住外层变量",
          p: `闭包是「内层函数 + 它引用的外层变量」。[[make_counter()]] 返回 [[next_value]]，即使 [[make_counter]] 已经返回，[[next_value]] 仍然记得 [[count]]。这个 [[count]] 不是全局变量，也不是每次调用新建的局部变量，它被闭包捕获了。

闭包的价值是封装状态。你不用写全局变量，也不用写类，就能得到一个「带记忆的函数」。但闭包也有坑：循环里创建多个闭包，它们可能共享同一个变量；用默认参数绑定当前值，或写工厂函数。

闭包不是越多越好。状态复杂、需要多个方法、需要序列化时，类比闭包更合适。闭包适合简单的「一个函数 + 一点状态」，比如计数器、缓存、回调。`,
          code: `def make_multiplier(factor):
    def multiply(value):
        return value * factor
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(10))
print(triple(10))

funcs = []
for factor in [2, 3, 4]:
    funcs.append(lambda x: x * factor)
print([f(10) for f in funcs])`,
          output: `20
30
[40, 40, 40]`,
          tip: `循环里创建 lambda 会捕获同一个变量；用 [[lambda x, f=factor: x * f]] 绑定当前值。`
        },
        {
          h: "lambda 与高阶函数：短函数，不是万能函数",
          p: `[[lambda x: x * 2]] 是一个匿名函数，函数体只能是单个表达式，不能写 [[return]]、赋值、循环。它适合作为 [[key]]、[[map]]、[[filter]] 的参数，不适合承担复杂逻辑。

[[map(f, items)]] 返回惰性迭代器，[[filter(pred, items)]] 也是；需要列表时 [[list()]]。[[sorted(items, key=lambda x: x[1])]] 是最常见的 lambda 用法。[[functools.partial]] 可以固定部分参数，比 lambda 更清晰。

如果 lambda 超过一行、需要注释、需要异常处理，就写 [[def]]。给函数起名字不是浪费时间，它让 traceback 和日志可读。lambda 的优势是「短」和「就地」，不是「高级」。`,
          code: `items = ["apple", "banana", "cherry"]
print(list(map(len, items)))
print(list(filter(lambda s: "a" in s, items)))
print(sorted(items, key=lambda s: len(s), reverse=True))

from functools import partial
def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
print(square(5))`,
          output: `[5, 6, 6]
['apple', 'banana']
['banana', 'cherry', 'apple']
25`,
          tip: `[[map]] / [[filter]] 返回迭代器，只能消费一次；需要重复用先 [[list()]]。`
        },
        {
          h: "小任务：计数器与排序键",
          p: `写一个 [[make_counter(start=0, step=1)]]，返回一个每次调用加 [[step]] 的函数；再写一个 [[sort_by_score(rows)]]，按分数降序、姓名升序排序。这个任务把闭包和 lambda 放在一起练。

计数器用 [[nonlocal]] 保存状态，返回的函数只接收必要参数。不要用全局变量，否则两个计数器会互相干扰。测试时创建两个独立计数器，确认它们的状态互不影响。

排序键用元组：[[(-score, name)]]。负数实现降序，姓名实现同分升序。不要把排序逻辑写进 lambda 的多行表达式；如果规则复杂，写一个 [[sort_key(row)]] 函数，再 [[key=sort_key]]。`,
          code: `def make_counter(start=0, step=1):
    value = start
    def next_value():
        nonlocal value
        value += step
        return value
    return next_value

c1 = make_counter()
c2 = make_counter(100, 10)
print(c1(), c1(), c2(), c2())

rows = [["林晓", 87], ["陈默", 87], ["周宁", 95]]
rows.sort(key=lambda row: (-row[1], row[0]))
print(rows)`,
          output: `1 2 110 120
[['周宁', 95], ['陈默', 87], ['林晓', 87]]`,
          tip: `两个计数器独立，是因为每次 [[make_counter()]] 都创建新的 [[value]]；闭包捕获的是那次调用的变量。`
        }
      ],
      points: [
        "LEGB 顺序：Local → Enclosing → Global → Built-in",
        "函数内赋值默认是局部变量，读取外部变量不需要声明",
        "[[global]] 改模块变量，[[nonlocal]] 改外层函数变量",
        "闭包捕获外层变量，循环里创建闭包要绑定当前值",
        "lambda 只能写单个表达式，复杂逻辑用 [[def]]",
        "[[map]] / [[filter]] 返回惰性迭代器，只能消费一次"
      ],
      practice: "把 `make_counter` 改成支持 `reset()`：返回一个对象或字典，包含 `next` 和 `reset` 两个函数；比较闭包方案和类方案的差异。"
    },
    {
      id: "ch6-3",
      title: "6.3 递归与二分查找",
      minutes: 45,
      lead: "递归不是「函数调用自己」这么简单，它需要基线、递推和收敛三件套。二分查找则是递归与循环都适合的经典问题。这一节把调用栈、递归深度、边界条件和切片成本讲清楚。",
      source: "Introducing Python 3rd · Ch.9；Beginning Python 4th · Ch.6；Head First Python 3rd · Ch.5",
      sections: [
        {
          h: "递归三件套：基线、递推、收敛",
          p: `递归函数必须有三部分：基线条件（什么时候停）、递推关系（问题怎么变小）、收敛保证（每次调用都向基线靠近）。缺一个就会无限递归，最终抛 [[RecursionError]]。

阶乘是最经典的例子：[[factorial(0) = 1]] 是基线，[[factorial(n) = n * factorial(n - 1)]] 是递推，[[n]] 每次减 1 保证收敛。斐波那契的朴素递归也能写，但会重复计算大量子问题，复杂度指数级；这不是递归本身的问题，是递推设计的问题。

递归适合「问题可以拆成同构子问题」的场景：树遍历、分治、回溯、目录扫描。不适合「简单循环就能解决」的场景。写递归前先问：基线是什么？每次递归真的变小了吗？会不会重复计算？`,
          code: `def factorial(n):
    if n < 0:
        raise ValueError("n 不能为负")
    if n == 0:
        return 1
    return n * factorial(n - 1)

for n in range(6):
    print(n, factorial(n))`,
          output: `0 1
1 1
2 2
3 6
4 24
5 120`,
          tip: `递归先写基线，再写递推；每次调用必须向基线靠近，否则 [[RecursionError]]。`
        },
        {
          h: "调用栈与递归深度限制",
          p: `每次函数调用，Python 都会在调用栈上压入一个帧，保存局部变量、返回地址和当前执行位置。递归太深，栈会溢出，抛 [[RecursionError: maximum recursion depth exceeded]]。默认限制通常在 1000 左右，不同环境可能不同。

[[sys.setrecursionlimit()]] 可以调高限制，但不推荐把它当解决方案。栈空间是有限的，调高限制可能让程序崩溃而不是抛异常。递归深度大时，改用循环、显式栈或分治迭代。

Python 没有尾调用优化。即使你写成「尾递归」，解释器也不会把栈帧复用。所以「递归写法优雅」不能成为忽略深度的理由。处理深树、长链表、大目录时，优先考虑迭代。`,
          code: `import sys

def depth(n):
    if n == 0:
        return 0
    return 1 + depth(n - 1)

print(depth(10))
print(sys.getrecursionlimit())

try:
    print(depth(2000))
except RecursionError as exc:
    print("RecursionError:", exc)`,
          output: `10
1000
RecursionError: maximum recursion depth exceeded`,
          tip: `[[sys.setrecursionlimit()]] 不是万能药；深度大用迭代或显式栈。Python 没有尾递归优化。`
        },
        {
          h: "二分查找：有序、边界、循环版",
          p: `二分查找的前提是**有序**。它每次取中间元素，和 target 比较，排除一半区间。时间复杂度 O(log n)，比线性查找快得多；但排序本身要 O(n log n)，如果只查一次，排序可能不划算。

边界是二分最容易错的地方。常见写法用 [[lo = 0, hi = len(items) - 1]]，闭区间 [[[lo, hi]]]；循环条件 [[lo <= hi]]；中间 [[mid = (lo + hi) // 2]]；命中返回 [[mid]]；[[items[mid] < target]] 时 [[lo = mid + 1]]，否则 [[hi = mid - 1]]。每一步都要保证区间在缩小。

如果使用 [[hi = len(items)]] 的半开区间，循环条件变成 [[lo < hi]]，更新规则也不同。两种写法都正确，但不能混用。面试/业务代码里，选一种并写测试，比背模板重要。`,
          code: `def binary_search(items, target):
    lo, hi = 0, len(items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid
        if items[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

data = [52, 60, 76, 88, 91, 95]
for target in [52, 76, 95, 60, 100]:
    print(target, binary_search(data, target))`,
          output: `52 0
76 2
95 5
60 1
100 -1`,
          tip: `二分查找必须先排序；闭区间和半开区间的更新规则不能混用。`
        },
        {
          h: "递归版二分与切片成本",
          p: `递归版二分可以写成 [[binary_search(items[:mid], target)]]，看起来简洁，但每次切片都创建新列表，成本 O(n)，总复杂度退化成 O(n log n) 甚至更差。正确做法是传 [[lo, hi]] 下标，不复制列表。

递归版的核心是把「区间」作为参数：[[search(items, target, lo, hi)]]。基线是 [[lo > hi]] 返回 -1；中间命中返回 [[mid]]；否则递归左半或右半。每次递归区间减半，深度 O(log n)，不会触及递归限制。

业务代码里，循环版通常更简单、更省内存。递归版适合教学和分治场景；如果你只是查找，优先 [[bisect]] 模块。[[bisect_left]] / [[bisect_right]] 能处理重复元素和插入位置，比手写更稳。`,
          code: `def search(items, target, lo, hi):
    if lo > hi:
        return -1
    mid = (lo + hi) // 2
    if items[mid] == target:
        return mid
    if items[mid] < target:
        return search(items, target, mid + 1, hi)
    return search(items, target, lo, mid - 1)

data = [52, 60, 76, 88, 91, 95]
print(search(data, 88, 0, len(data) - 1))

import bisect
print(bisect.bisect_left(data, 88))
print(bisect.bisect_right(data, 88))`,
          output: `3
3
4`,
          tip: `递归二分不要切片；传 [[lo, hi]] 下标。重复元素用 [[bisect_left]] / [[bisect_right]] 区分左右边界。`
        },
        {
          h: "小任务：在有序成绩表中查找",
          p: `给一个按分数升序排列的 [[[score, name]]] 列表，查找第一个分数等于 target 的记录，返回下标或 -1。要求处理重复分数：返回最左边那个。先用循环版写，再用 [[bisect_left]] 写一遍。

重复分数是二分的经典陷阱。普通二分命中后立即返回，可能返回中间那个，不是最左。要最左，命中后继续 [[hi = mid - 1]]；或者用 [[bisect_left]] 找到插入点，再检查该位置是否等于 target。

测试要覆盖：空列表、target 小于最小值、大于最大值、重复值、只有一个元素。每个边界都写断言，不要只靠肉眼打印。`,
          code: `from bisect import bisect_left

rows = [[52, "周宁"], [76, "陈默"], [88, "林晓"], [88, "赵一"], [95, "陈默"]]

def find_left(rows, target):
    lo, hi = 0, len(rows) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if rows[mid][0] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    if lo < len(rows) and rows[lo][0] == target:
        return lo
    return -1

print(find_left(rows, 88))
print(find_left(rows, 52))
print(find_left(rows, 100))

values = [row[0] for row in rows]
print(bisect_left(values, 88))`,
          output: `2
0
-1
2`,
          tip: `找最左匹配：命中后不要立即返回，继续收缩右边界；[[bisect_left]] 返回插入点，再检查值。`
        }
      ],
      points: [
        "递归三件套：基线、递推、收敛",
        "每次递归都压栈，深度过大会 [[RecursionError]]",
        "Python 没有尾递归优化，[[setrecursionlimit]] 不是解决方案",
        "二分查找必须先有序，闭区间/半开区间不能混用",
        "递归二分不要切片，传 [[lo, hi]] 下标",
        "重复元素找最左用 [[bisect_left]] 或命中后继续收缩"
      ],
      practice: "把 `find_left` 改成返回所有匹配记录的区间 `(left, right)`，用两次二分实现；测试空列表、单元素、全重复、无匹配四种情况。"
    }
  ]
});

window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch6-1": [
    {
      h: "函数对象与调用协议：参数是怎样绑定的",
      p: `[[def]] 执行时创建一个函数对象，函数名只是指向它的变量。函数对象有 [[__code__]]、[[__defaults__]]、[[__globals__]]、[[__name__]] 等属性；你可以把它传给另一个函数、存进列表、作为字典值。[[f()]] 是调用运算符，不是「执行函数体」的语法糖；调用时才创建栈帧、绑定参数、执行字节码。\n\n参数绑定顺序是：位置参数、关键字参数、[[*args]]、keyword-only 参数、[[**kwargs]]。[[def f(a, b=1, *args, c=2, **kwargs):]] 里，a 必须给，b 可省略，args 收集多余位置参数，c 只能按关键字传，kwargs 收集多余关键字。把顺序写错会得到 [[SyntaxError]]；把 [[*args]] 放在 [[**kwargs]] 前面是规则，不是风格。\n\n默认参数在函数定义时求值一次，绑定到函数对象的 [[__defaults__]]。[[def f(x, items=[]):]] 的列表跨调用共享；[[def f(x, when=datetime.now()):]] 的时间永远是模块导入那一刻。需要「每次调用新值」时，默认写 [[None]]，函数体内再创建。这不是 Python 的缺陷，而是「默认值是对象引用」的直接结果。\n\n参数校验放在函数入口还是内部？公共函数应该校验并抛 [[TypeError]]/[[ValueError]]；内部辅助函数可以依赖调用方。不要把校验写成 [[assert]]，因为 [[python -O]] 会移除 assert；也不要用 [[print]] 代替异常。错误信息要带参数名和实际值，调用方才知道怎么改。`,
      code: String.raw`def f(a, b=1, *args, c=2, **kwargs):
    print("a=", a, "b=", b, "args=", args, "c=", c, "kwargs=", kwargs)

f(10)
f(10, 20, 30, 40, c=50, d=60)

print(f.__defaults__)
print(f.__code__.co_argcount)

def bad(items=[]):
    items.append(1)
    return items

print(bad())
print(bad())`,
      output: `a= 10 b= 1 args= () c= 2 kwargs= {}
a= 10 b= 20 args= (30, 40) c= 50 kwargs= {'d': 60}
(1,)
2
[1]
[1, 1]`,
      tip: `[[__defaults__]] 是可变对象时，所有调用共享；需要独立默认值时写 [[None]]，进函数再构造。`
    },
    {
      h: "可变参数与仅限关键字：把接口写清楚",
      p: `[[*args]] 收集多余位置参数，[[**kwargs]] 收集多余关键字参数；它们让函数能转发参数，但也让签名变得模糊。[[def wrapper(*args, **kwargs): return func(*args, **kwargs)]] 是装饰器的常见写法；如果 wrapper 需要自己的参数，必须用 keyword-only 隔开，否则用户传的位置参数会被 func 吃掉。\n\n仅限关键字参数写在 [[*]] 后面：[[def f(a, *, b):]]，b 只能 [[f(1, b=2)]]，不能 [[f(1, 2)]]。仅限位置参数写在 [[/]] 前面：[[def f(a, /, b):]]，a 不能按关键字传。这两个符号让 API 更明确：哪些参数保证稳定，哪些可以改名。标准库大量使用它们，你读签名时会遇到。\n\n[[**kwargs]] 的键必须是字符串。[[f(**{1: 2})]] 会抛 [[TypeError]]；传 [[**]] 字典时，键不是合法标识符也可能出问题。[[*args]] 可以是任意可迭代对象，但函数内部拿到的是元组，不是原列表；修改 args 不会影响调用方。需要可变序列时，自己 [[list(args)]]。\n\n可变参数不是「参数越多越好」。一个函数如果接收 [[**kwargs]] 却不校验，拼错参数名会被静默忽略，错误延迟到很久以后。公共 API 最好显式列出参数；确实需要透传时，在文档里写清楚哪些键被支持，并在入口做白名单校验。`,
      code: String.raw`def tag(name, /, content, *, level=1):
    return f"<h{level}>{name}: {content}</h{level}>"

print(tag("p", "hi"))
print(tag("p", "hi", level=2))
try:
    tag(name="p", content="hi")
except TypeError as err:
    print("仅限位置:", err)

def forward(*args, **kwargs):
    print(args, kwargs)

forward(1, 2, x=3)
forward(*[1, 2], **{"x": 3})`,
      output: `<h1>p: hi</h1>
<h2>p: hi</h2>
仅限位置: tag() got some positional-only arguments passed as keyword arguments: 'name'
(1, 2) {'x': 3}
(1, 2) {'x': 3}`,
      tip: `[[/]] 前的参数不能按关键字传，[[*]] 后的参数必须按关键字传；它们不是装饰，是 API 契约。`
    },
    {
      h: "return、None 与纯函数：把副作用留在边界",
      p: `没有 [[return]] 的函数返回 [[None]]；[[return]] 后面不写值也返回 [[None]]。[[None]] 不是「什么都没有」，它是一个单例对象，有类型、有身份、能作为字典值。[[print(f())]] 打印 None，是因为 print 打印了返回值，不是函数「没返回」。写函数时，明确它返回什么：结果、状态、还是只做事。\n\n纯函数只依赖参数，不读写外部状态，不修改输入，相同输入永远相同输出。[[summarize(records)]] 应该是纯的；[[save_report(path, text)]] 有 I/O 副作用，不该混在计算里。纯函数容易测试、容易缓存、容易并行；副作用集中在边界，出错时知道该看哪一层。这不是「函数式编程」的口号，是工程可维护性。\n\n返回多个值时，实际返回一个元组。[[return count, average]] 调用方可以 [[count, average = f()]]，也可以整体接收。返回 [[None]] 表示「没有结果」时，调用方必须先判断再解包；[[a, b = f()]] 在 f 返回 None 时抛 [[TypeError]]。需要表达「可能没有」时，考虑返回空列表、抛异常或 [[Optional]]，不要用 None 当万能哨兵。\n\n文档字符串写在函数第一行，[[help(f)]] 和 IDE 会读取。写清楚参数、返回、异常，比写「这个函数用于计算」有用。类型标注不是运行时强制，但能让编辑器和 [[mypy]] 提前发现错误。课程不要求每个练习都写完整类型，但公共函数值得写。`,
      code: String.raw`def summarize(records):
    """返回人数与平均分；空列表返回 (0, 0.0)。"""
    if not records:
        return 0, 0.0
    scores = [r["score"] for r in records]
    return len(scores), sum(scores) / len(scores)

print(summarize([]))
print(summarize([{"score": 90}, {"score": 80}]))

def log(message):
    print("[LOG]", message)

print(log("hi"))

def may_fail(ok):
    if not ok:
        return None
    return 1, 2

try:
    a, b = may_fail(False)
except TypeError as err:
    print("不能解包:", err)`,
      output: `(0, 0.0)
(2, 85.0)
[LOG] hi
None
不能解包: cannot unpack non-iterable NoneType object`,
      tip: `[[return]] 不写值返回 None；调用方对「可能返回 None」的函数先判断，别直接解包。`
    }
  ],
  "ch6-2": [
    {
      h: "LEGB 与编译期作用域：名字在哪里找",
      p: `Python 查找名字按 LEGB：Local（当前函数）、Enclosing（外层函数）、Global（模块）、Builtins（内置）。函数内部赋值会让名字成为局部变量，除非用 [[global]] 或 [[nonlocal]] 声明。这个判断发生在编译期，不是运行到赋值那一行才决定；所以 [[x = x + 1]] 在函数里会先因「x 是局部变量但未绑定」抛 [[UnboundLocalError]]。\n\n[[global]] 声明「这个赋值改模块级变量」，[[nonlocal]] 声明「改外层函数的变量」。它们不是「访问」的开关，而是「绑定」的声明。只读全局变量不需要 global；只有要重新绑定才需要。[[nonlocal]] 只能指向外层函数，不能指向模块；外层没有同名变量会抛 [[SyntaxError]]。\n\n类作用域不参与 LEGB。类体里的名字在定义时执行，但方法内部不会自动看到类变量；方法里访问类属性要用 [[self.x]] 或 [[ClassName.x]]。在类体里写 [[x = 1]]，方法里写 [[print(x)]] 会去找全局，不是类属性。这是 Python 和 Java/C++ 的一个明显差异。\n\n推导式有自己的作用域。[[[x for x in range(3)]]] 里的 x 不会泄漏到外层；但推导式的第一个可迭代表达式是在外层作用域求值的，后面的条件可以引用外层变量。生成器表达式同理。不要依赖「推导式变量泄漏」的旧行为，Python 3 已经改了。`,
      code: String.raw`x = "global"

def outer():
    x = "outer"
    def inner():
        nonlocal x
        x = "inner"
    inner()
    return x

print(outer())
print(x)

def broken():
    count = count + 1
    return count

try:
    broken()
except UnboundLocalError as err:
    print("未绑定:", err)

class C:
    value = 1
    def get(self):
        return value

try:
    print(C().get())
except NameError as err:
    print("类作用域不参与 LEGB:", err)`,
      output: `inner
global
未绑定: cannot access local variable 'count' where it is not associated with a value
类作用域不参与 LEGB: name 'value' is not defined`,
      tip: `函数里对名字赋值就会让它成为局部变量；只读全局不用 [[global]]，要改才声明。`
    },
    {
      h: "闭包与晚绑定：函数记住的是变量，不是值",
      p: `闭包是「函数 + 它引用的外层变量」。[[def outer(): x = 1; def inner(): return x; return inner]] 返回的 inner 记住的是 x 这个单元格，不是当时的 1；外层 x 后来变了，inner 看到新值。这个机制让计数器、装饰器、配置工厂成为可能。\n\n晚绑定陷阱：循环里创建多个 lambda，它们共享同一个循环变量。[[funcs = [lambda: i for i in range(3)]]] 全部返回 2，因为 lambda 执行时才查 i，而那时循环已结束。要固定当前值，用默认参数 [[lambda i=i: i]]，或者 [[functools.partial]]。这不是 lambda 的错，是「闭包捕获变量而不是值」的必然结果。\n\n[[nonlocal]] 让内层函数能修改外层变量；没有它，[[count += 1]] 会让 count 变成内层局部变量，外层不变。Python 2 没有 nonlocal，所以老代码常用可变容器（列表/字典）绕过；Python 3 直接用 nonlocal 更清楚。[[global]] 同理，但作用域是模块级。\n\n闭包会延长外层变量的生命周期。如果闭包捕获了一个大列表，即使外层函数返回，列表也不会被回收；大量闭包持有大对象会造成内存泄漏。需要释放时，把闭包置空、解除引用，或者避免捕获不必要的大对象。调试内存问题时，[[gc.get_referrers()]] 能帮你找到谁在引用。`,
      code: String.raw`def make_counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc

c = make_counter()
print(c(), c(), c())

funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])

funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])

from functools import partial
def mul(a, b): return a * b
print([partial(mul, i)(10) for i in range(3)])`,
      output: `1 2 3
[2, 2, 2]
[0, 1, 2]
[0, 10, 20]`,
      tip: `循环里创建 lambda 用默认参数 [[i=i]] 固定当前值；否则所有闭包看到循环结束后的最后一个值。`
    },
    {
      h: "lambda 与高阶函数：短函数，不是万能函数",
      p: `[[lambda]] 只能写一个表达式，不能包含语句、注解、docstring；它的价值是「就地传一个短函数」，不是「替代 def」。[[sorted(data, key=lambda r: r["score"])]] 很自然；把十行逻辑塞进 lambda 只会让代码难读。需要名字、需要复用、需要调试时，用 def。\n\n[[map()]]、[[filter()]] 返回迭代器，不是列表；需要列表时包 [[list()]]。[[map(f, xs)]] 等价于 [[(f(x) for x in xs)]]，但生成器表达式通常更清楚，尤其是需要条件时。[[filter(None, xs)]] 会保留真值为真的元素，等价于 [[(x for x in xs if x)]]；不要用 filter 做复杂判断。\n\n[[functools.reduce()]] 把二元函数累积到序列上，[[reduce(operator.add, xs)]] 求和。Python 提供了 [[sum()]]、[[max()]]、[[min()]] 等内置函数，大多数场景不需要 reduce；需要自定义累积时，先用循环写清楚，再考虑 reduce。reduce 的可读性通常不如显式循环。\n\n高阶函数接收函数作为参数，[[functools.partial]] 固定部分参数，[[operator.itemgetter]] 替代 lambda 取键。[[sorted(data, key=operator.itemgetter("score"))]] 比 lambda 更快、更可读（键不存在时错误信息也更直接）。[[operator.attrgetter]] 取属性同理。不要为了「函数式」而函数式；目标是可读、可测、可维护。`,
      code: String.raw`from functools import reduce, partial
import operator

records = [{"score": 91}, {"score": 88}]
print(sorted(records, key=operator.itemgetter("score")))

print(list(map(lambda x: x * 2, [1, 2, 3])))
print(list(filter(lambda x: x % 2, [1, 2, 3, 4])))

print(reduce(operator.add, [1, 2, 3, 4]))
print(sum([1, 2, 3, 4]))

def power(base, exp): return base ** exp
square = partial(power, exp=2)
print(square(5))`,
      output: `[{'score': 88}, {'score': 91}]
[2, 4, 6]
[1, 3]
10
10
25`,
      tip: `[[map/filter]] 返回迭代器，遍历一次就耗尽；需要重复用先 [[list()]]，大文件不要物化。`
    }
  ],
  "ch6-3": [
    {
      h: "递归三件套与调用栈：基线、递推、收敛",
      p: `递归函数必须有三件套：基线条件（什么时候停）、递推关系（问题怎么变小）、收敛保证（每次调用都靠近基线）。缺基线会无限递归，缺收敛会栈溢出，缺递推会把问题原地打转。[[factorial(n)]] 的基线是 n <= 1，递推是 n * factorial(n-1)，收敛是 n 每次减 1。\n\n每次递归调用都会创建一个栈帧，保存局部变量、返回地址、执行状态。Python 默认递归深度约 1000，超过抛 [[RecursionError]]。[[sys.setrecursionlimit()]] 可以调大，但它不能增加真实栈空间，调太大可能直接崩溃。深度很大的问题，用迭代、显式栈或分治；不要靠调 limit 硬扛。\n\nPython 不支持尾递归优化。即使你把递归写成 [[return f(n-1, acc)]]，解释器仍会保留当前栈帧；所以「尾递归不会爆栈」在 Python 里不成立。需要尾递归风格时，用循环或 [[functools.reduce]] 改写。这不是语言缺陷，是 CPython 的设计取舍。\n\n递归适合「结构本身是递归的」问题：树、图、嵌套 JSON、分治。线性列表的求和、查找，用循环更简单。写递归前先问：问题能不能自然拆成同构的子问题？如果不能，别硬套。递归不是高级，是另一种控制流。`,
      code: String.raw`import sys

def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
print(sys.getrecursionlimit())

def bad(n):
    return bad(n + 1)

try:
    bad(0)
except RecursionError as err:
    print("递归太深:", type(err).__name__)

def sum_iter(xs):
    total = 0
    for x in xs:
        total += x
    return total

print(sum_iter([1, 2, 3, 4]))`,
      output: `120
1000
递归太深: RecursionError
10`,
      tip: `[[sys.setrecursionlimit()]] 不是万能药；真实栈空间有限，深度问题改用迭代或显式栈。`
    },
    {
      h: "二分查找：有序、边界与循环不变式",
      p: `二分查找的前提是「有序」。没有排序就二分，结果不可预测；每次循环都要维护「目标只可能在 [left, right] 内」这个不变式。[[left, right = 0, len(a) - 1]] 是闭区间写法；[[while left <= right:]]，中点 [[mid = (left + right) // 2]]，比较后移动 left 或 right。循环结束时，left 是第一个大于目标的位置。\n\n边界最容易错。[[right = len(a)]] 是半开区间写法，循环条件 [[left < right]]，更新 [[right = mid]]；两种写法都对，但不能混。混用会导致死循环或漏掉最后一个元素。写完后用空数组、单元素、目标在首、目标在尾、目标不存在这五组用例验证，比凭感觉可靠。\n\n[[bisect]] 是标准库的二分实现。[[bisect_left(a, x)]] 返回第一个 >= x 的位置，[[bisect_right(a, x)]] 返回第一个 > x 的位置；[[insort()]] 插入并保持有序。需要「查找插入位置」时，直接用 bisect，不要手写。手写二分只适合练习或需要自定义比较逻辑的场景。\n\n二分的时间复杂度是 O(log n)，但每次比较可能很贵。对字符串、对象排序时，key 函数只应在排序时调用一次，不要在二分循环里反复计算。[[bisect]] 支持 [[key=]]（3.10+），但 key 必须与排序时一致；不一致会得到错误位置。二分不是「比线性快」的万能答案，数据量小、比较便宜时，线性查找可能更简单。`,
      code: String.raw`from bisect import bisect_left, bisect_right, insort

a = [1, 3, 5, 7, 9]
print(bisect_left(a, 5), bisect_right(a, 5))
print(bisect_left(a, 4), bisect_right(a, 4))

def lower_bound(a, target):
    left, right = 0, len(a)
    while left < right:
        mid = (left + right) // 2
        if a[mid] < target:
            left = mid + 1
        else:
            right = mid
    return left

print(lower_bound(a, 5), lower_bound(a, 4), lower_bound(a, 10))

insort(a, 6)
print(a)`,
      output: `2 3
2 2
2 2 5
[1, 3, 5, 6, 7, 9]`,
      tip: `[[bisect_left]] 返回第一个 >= x 的位置，[[bisect_right]] 返回第一个 > x 的位置；重复元素多时，两者不同。`
    },
    {
      h: "递归版二分与切片成本：为什么不推荐",
      p: `递归版二分常写成 [[binary_search(a[:mid], target)]]，每次递归都切片。切片会复制一半元素，递归 log n 层，总复制量 O(n)，把二分的 O(log n) 优势抵消掉。正确写法是传 [[left, right]] 下标，不复制列表；递归深度也只有 log n。\n\n递归版二分的基线是「区间为空」，返回 -1 或插入位置；递推是比较中点后进入左/右半区。写的时候要保持区间定义一致：闭区间 [[[left, right]]] 还是半开 [[[left, right)]]。混用会让基线差一，出现「明明有却找不到」。\n\n迭代版通常更简单：没有栈帧开销，不会触发递归限制，边界更新一目了然。递归版适合教学，让你理解「问题减半」；生产代码优先 [[bisect]] 或迭代。不要为了「优雅」在热点路径上递归。\n\n如果确实需要递归，把切片改成下标，把结果返回给上一层；不要在递归里修改全局列表。递归函数的参数应尽量少，状态通过参数和返回值传递。这样既容易测试，也避免闭包/全局变量带来的并发问题。`,
      code: String.raw`def binary_search_rec(a, target, left, right):
    if left > right:
        return -1
    mid = (left + right) // 2
    if a[mid] == target:
        return mid
    if a[mid] < target:
        return binary_search_rec(a, target, mid + 1, right)
    return binary_search_rec(a, target, left, mid - 1)

a = [1, 3, 5, 7, 9]
print(binary_search_rec(a, 7, 0, len(a) - 1))
print(binary_search_rec(a, 4, 0, len(a) - 1))

def binary_search_iter(a, target):
    left, right = 0, len(a) - 1
    while left <= right:
        mid = (left + right) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

print(binary_search_iter(a, 9), binary_search_iter(a, 2))`,
      output: `3
-1
4 -1`,
      tip: `递归版二分不要切片；[[a[:mid]]] 每次复制一半元素，复杂度从 O(log n) 退化成 O(n)。`
    }
  ]
});

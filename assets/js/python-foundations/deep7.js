window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch7-1": [
    {
      h: "推导式的语法与作用域：表达式、for、if 的顺序",
      p: `列表推导式的基本形式是 [[[expr for item in iterable if condition]]]。执行顺序是：先取 iterable 的第一个元素，绑定 item，判断 condition，为真就计算 expr 并加入结果；再取下一个。它不是「先建列表再过滤」，而是一趟完成。条件可以放在 for 后面，也可以嵌套多个 for，顺序与书写顺序一致。\n\n多个 for 的顺序容易写反。[[[x + y for x in xs for y in ys]]] 先遍历 xs，再对每个 x 遍历 ys，结果顺序是 x0y0、x0y1、x1y0……如果你想要「先按 y 分组」，就把 y 的 for 写前面。嵌套推导式的可读性随层数迅速下降，超过两层就考虑普通循环或 [[itertools.product()]]。\n\n推导式有独立作用域，循环变量不会泄漏到外层。[[[i for i in range(3)]]] 之后 i 仍是外层的值（如果外层有）；Python 3 不会把 i 留成 2。但推导式的第一个可迭代表达式在外层作用域求值，后面的表达式在推导式作用域内求值；不要在表达式里修改外层可变对象，副作用会让结果依赖执行顺序。\n\n条件表达式和过滤条件不是一回事。[[[x if x > 0 else 0 for x in xs]]] 对每个元素都产生一个结果；[[[x for x in xs if x > 0]]] 只保留满足条件的元素。前者长度不变，后者可能变短。写报表时先明确「要占位还是丢掉」，这决定了用 if 的位置。`,
      code: String.raw`xs = [1, 2, 3]
ys = [10, 20]

print([x + y for x in xs for y in ys])
print([y + x for y in ys for x in xs])
print([x if x % 2 else 0 for x in xs])
print([x for x in xs if x % 2])

matrix = [[1, 2], [3, 4]]
print([n for row in matrix for n in row])
print([[n * 2 for n in row] for row in matrix])`,
      output: `[11, 21, 12, 22, 13, 23]
[11, 12, 13, 21, 22, 23]
[1, 0, 3]
[1, 3]
[1, 2, 3, 4]
[[2, 4], [6, 8]]`,
      tip: `[[[x if cond else 0 for x in xs]]] 保留所有元素；[[[x for x in xs if cond]]] 会过滤。先确定长度是否要变。`
    },
    {
      h: "推导式与生成器表达式：内存、惰性与一次性",
      p: `列表推导式用方括号，立即生成完整列表；生成器表达式用圆括号，返回一个惰性迭代器，按需计算。[[sum(x * x for x in range(10**6))]] 不需要先建一百万个元素的列表，内存是 O(1)；[[sum([x * x for x in range(10**6)])]] 会先物化整个列表。数据量大时，优先生成器表达式。\n\n生成器表达式只能遍历一次。[[g = (x for x in xs)]] 之后 [[list(g)]] 得到结果，再 [[list(g)]] 就是空的。需要多次遍历时，重新创建生成器，或者物化成列表。不要把一个生成器传给两个消费者，除非你明确知道它们按顺序共享同一次遍历。\n\n推导式不一定比循环快。它省的是 Python 层的 append 调用，但表达式本身的函数调用、属性访问仍然存在；复杂逻辑塞进推导式，可能比清晰循环更慢、更难调试。[[timeit]] 测一下再优化，不要凭「推导式更 Pythonic」下结论。列表推导式通常比 for + append 快，但生成器表达式多了 yield 开销，未必更快。\n\n嵌套生成器表达式要注意括号。[[sum(x for row in matrix for x in row)]] 可以直接作为函数参数；如果生成器表达式不是唯一参数，要再加一层括号：[[func((x for x in xs), other)]]。多一层括号不是语法怪癖，是解析歧义。写复杂生成器时，拆成命名变量，读起来更清楚。`,
      code: String.raw`xs = range(5)
list_comp = [x * x for x in xs]
gen_exp = (x * x for x in xs)

print(list_comp)
print(list(gen_exp))
print(list(gen_exp))

print(sum(x * x for x in range(10)))
print(sum([x * x for x in range(10)]))

matrix = [[1, 2], [3, 4]]
print(sum(x for row in matrix for x in row))`,
      output: `[0, 1, 4, 9, 16]
[0, 1, 4, 9, 16]
[]
285
285
10`,
      tip: `生成器表达式只能消费一次；需要两次遍历就重新创建，或先 [[list()]] 物化，但大文件不要物化。`
    },
    {
      h: "字典与集合推导式：键冲突、去重与顺序",
      p: `字典推导式写成 [[{k: v for item in items}]]，键表达式在前，值表达式在后。键重复时，后出现的值覆盖先出现的值；这与 [[dict.update()]] 的语义一致。需要保留第一次出现的值，反过来写：先出现的先插入，后面的重复键跳过。不要指望字典推导式自动去重并保留某个特定值，覆盖顺序由迭代顺序决定。\n\n集合推导式写成 [[{expr for item in items}]]，自动去重，顺序不保证。它和字典推导式只差一个冒号，读代码时看清楚。[[{x for x in xs}]] 的元素必须可哈希；列表、字典不能直接放进去。需要保留顺序的去重，用 [[dict.fromkeys()]]，不要用集合。\n\n字典推导式适合「转换/筛选」：[[{k: v * 2 for k, v in scores.items() if v >= 60}]]。它不适合「聚合」：按班级求平均需要先分组，再用普通循环或 [[defaultdict]]；硬塞进一个推导式会变成多次遍历或复杂表达式。推导式的目标是「一对一/一对零」的转换，不是「多对一」的聚合。\n\n键冲突还可能来自类型转换。[[{str(k): v for k, v in data.items()}]] 把 1 和 "1" 都变成 "1"，后出现的覆盖先出现的；这种覆盖是静默的。需要检测冲突时，先用普通循环并记录重复键，不要用推导式一把梭。数据迁移时，静默覆盖比报错更危险。`,
      code: String.raw`scores = {"林晓": 91, "周宁": 88, "陈默": 59}
print({k: v for k, v in scores.items() if v >= 60})
print({k: v * 2 for k, v in scores.items()})

items = ["a", "b", "a", "c"]
print({x for x in items})
print(list(dict.fromkeys(items)))

data = {1: "one", "1": "string one"}
print({str(k): v for k, v in data.items()})

pairs = [("a", 1), ("a", 2), ("b", 3)]
print({k: v for k, v in pairs})`,
      output: `{'林晓': 91, '周宁': 88}
{'林晓': 182, '周宁': 176, '陈默': 118}
{'a', 'b', 'c'}
['a', 'b', 'c']
{'1': 'string one'}
{'a': 2, 'b': 3}`,
      tip: `字典推导式遇到重复键会静默覆盖；需要检测冲突时，用普通循环记录重复键，别用推导式一把梭。`
    }
  ],
  "ch7-2": [
    {
      h: "可迭代对象与迭代器：iter() 与 next() 的分工",
      p: `可迭代对象（iterable）实现了 [[__iter__]]，能返回一个迭代器；迭代器（iterator）同时实现 [[__iter__]] 和 [[__next__]]，[[__iter__]] 通常返回 [[self]]。列表是可迭代对象，但不是迭代器；[[iter(list)]] 返回的 list_iterator 才是迭代器。[[for]] 先对对象调用 [[iter()]]，再反复 [[next()]]，直到 [[StopIteration]]。\n\n迭代器是有状态的。它记住「走到哪了」，每次 [[next()]] 前进一格；耗尽后继续 [[next()]] 仍然抛 [[StopIteration]]，不会自动重置。需要重新遍历时，重新调用 [[iter(iterable)]]；如果对象本身就是迭代器（比如生成器），重新 [[iter()]] 返回的还是同一个耗尽状态。这就是「生成器只能遍历一次」的底层原因。\n\n[[__iter__]] 必须返回迭代器，不能返回列表。[[class C: def __iter__(self): return [1, 2]]][[ 会抛 TypeError，因为列表不是迭代器。正确写法是 [[return iter([1, 2])]]，或者用生成器函数 [[yield]]。自定义容器时，[[__iter__]] 返回一个新的迭代器，保证每次遍历都从头开始；不要把 self 当迭代器，除非你确实想让它一次性。\n\n迭代协议是 Python 数据模型的中心。[[for]]、[[sum()]]、[[list()]]、[[tuple()]]、[[zip()]]、[[enumerate()]]、[[*]] 解包都走这套协议。理解它，你就能解释为什么文件可以逐行遍历、字典遍历得到键、生成器能接在管道里。不要把「可迭代」和「可下标」混为一谈：字典可迭代键，但不支持整数下标。`,
      code: String.raw`nums = [1, 2, 3]
it = iter(nums)
print(next(it), next(it), next(it))
try:
    next(it)
except StopIteration:
    print("耗尽")

print(iter(nums) is nums)

class C:
    def __iter__(self):
        return iter([1, 2])

print(list(C()))

class Bad:
    def __iter__(self):
        return [1, 2]

try:
    list(Bad())
except TypeError as err:
    print("不是迭代器:", err)`,
      output: `1 2 3
耗尽
False
[1, 2]
不是迭代器: iter() returned non-iterator of type 'list'`,
      tip: `可迭代对象不一定是迭代器；[[iter(obj)]] 每次应返回新的迭代器，除非你明确设计成一次性。`
    },
    {
      h: "惰性求值：什么时候算、什么时候不算",
      p: `惰性求值不是「不计算」，而是「用到才算」。生成器函数在调用时不会执行函数体，只创建生成器对象；第一次 [[next()]] 才运行到第一个 [[yield]]，之后每次 [[next()]] 继续运行到下一个 [[yield]]。这让无限序列、超大文件、昂贵计算成为可能，也让「什么时候发生副作用」变得不直观。\n\n[[itertools]] 提供了一套惰性工具：[[count()]] 无限计数，[[cycle()]] 循环，[[repeat()]] 重复，[[islice()]] 切片，[[chain()]] 串联，[[takewhile()]]/[[dropwhile()]] 按条件截取。它们返回迭代器，不是列表；需要结果时用 [[list()]] 或 [[for]] 消费。不要对无限迭代器直接 [[list()]]，会内存爆炸。\n\n惰性求值会把错误推迟。生成器里的 [[1 / 0]] 可能在你第一次迭代时才抛，而不是调用时；资源打开也可能延迟到第一次 [[next()]]。调试时要区分「创建」和「消费」两个阶段，日志打在 [[yield]] 前后，而不是函数入口。生产代码要在消费端捕获异常，并确保生成器被关闭。\n\n惰性不等于免费。每层生成器都有状态和调用开销，管道太长时可能比一次性列表慢；多次遍历同一份数据时，惰性反而让你重复计算。选择惰性还是物化，取决于数据规模、遍历次数和内存预算。小数据、多次遍历，列表更简单；大数据、一次遍历，生成器更合适。`,
      code: String.raw`from itertools import count, islice, chain, takewhile

def gen():
    print("开始")
    yield 1
    print("继续")
    yield 2

g = gen()
print("创建后")
print(next(g))
print(next(g))

print(list(islice(count(10), 5)))
print(list(chain([1, 2], [3, 4])))
print(list(takewhile(lambda x: x < 3, [1, 2, 3, 1])))

try:
    list(x for x in [1, 0] if 1 / x)
except ZeroDivisionError as err:
    print("消费时才报错:", err)`,
      output: `创建后
开始
1
继续
2
[10, 11, 12, 13, 14]
[1, 2, 3, 4]
[1, 2]
消费时才报错: division by zero`,
      tip: `生成器函数调用时不会执行函数体；错误和副作用可能延迟到第一次 [[next()]]，调试时区分创建与消费。`
    },
    {
      h: "自定义迭代器：状态、耗尽与复用",
      p: `自定义迭代器要实现 [[__iter__]] 和 [[__next__]]。[[__iter__]] 返回 self（如果对象自己维护状态），[[__next__]] 返回下一个值，没有更多值时 [[raise StopIteration]]。状态放在实例属性里，每次 [[next()]] 更新；不要在 [[__next__]] 里重新初始化状态，否则永远停不下来。\n\n迭代器耗尽后，[[__next__]] 应持续抛 [[StopIteration]]，而不是返回值或重置。Python 的 for 循环依赖这个信号；如果你在耗尽后返回 None，for 会继续循环，可能死循环。需要「可重复遍历」的容器，[[__iter__]] 返回一个新的迭代器对象，而不是 self；容器和迭代器是两个角色。\n\n自定义迭代器适合实现「按需生成」的复杂序列，比如树遍历、分页读取、状态机。简单序列用生成器函数更省事：[[def gen(): for x in ...: yield x]]。生成器自动实现 [[__iter__]]/[[__next__]]，还能用 [[yield from]] 委托给子生成器。只有在需要额外状态/方法（比如 [[reset()]]）时，才写类。\n\n迭代器不是线程安全的。多个线程同时 [[next()]] 同一个迭代器，状态可能竞争；需要并发消费时，加锁或每个线程独立迭代器。迭代器也不是可序列化的，[[pickle]] 不能保存「走到哪了」；需要断点续读时，自己记录位置（行号、偏移量），不要 pickle 生成器。`,
      code: String.raw`class Countdown:
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

c = Countdown(3)
print(list(c))
print(list(c))

def countdown(start):
    while start > 0:
        yield start
        start -= 1

print(list(countdown(3)))
print(list(countdown(3)))`,
      output: `[3, 2, 1]
[]
[3, 2, 1]
[3, 2, 1]`,
      tip: `迭代器耗尽后应持续抛 [[StopIteration]]；容器要可重复遍历，就让 [[__iter__]] 每次返回新迭代器。`
    }
  ],
  "ch7-3": [
    {
      h: "yield 的状态机：暂停、恢复与 send",
      p: `生成器函数包含 [[yield]] 时，调用它不会执行函数体，而是返回一个生成器对象。每次 [[next()]] 运行到下一个 [[yield]]，把值交出去并暂停；下一次 [[next()]] 从暂停处恢复，继续执行。局部变量、指令指针、异常状态都保存在生成器的帧里，所以它能「记住」上次算到哪。\n\n[[send(value)]] 可以把值送回生成器，[[yield]] 表达式的结果就是 send 的参数；第一次必须 [[next()]] 或 [[send(None)]] 启动。[[throw()]] 在暂停处抛异常，[[close()]] 抛 [[GeneratorExit]] 并结束。这些能力让生成器可以做协程，但真正的异步协程用 [[async def]]/[[await]]；普通生成器的 send/throw 主要用于管道和状态机。\n\n生成器退出时，[[finally]] 会执行，适合释放文件、锁、连接。但如果你不消费完、不显式 [[close()]]，垃圾回收时才触发 [[finally]]，时机不确定；长时间运行的服务要确保生成器被关闭。[[with]] 语句在生成器里也能用，但要理解「进入/退出」发生在哪个 [[yield]] 点。\n\n[[yield from]] 委托给子生成器，把子生成器的值、send、throw、返回值都转发过去。它比手写 [[for x in sub: yield x]] 更完整，也支持子生成器的返回值：[[result = yield from sub()]]。写递归生成器（树遍历、嵌套结构展开）时，[[yield from]] 能保持代码简洁。`,
      code: String.raw`def echo():
    print("启动")
    while True:
        value = yield
        if value is None:
            break
        print("收到", value)
        yield value * 2

g = echo()
next(g)
print(g.send(3))
print(g.send(5))
g.close()

def sub():
    yield 1
    return "done"

def outer():
    result = yield from sub()
    print("子生成器返回:", result)
    yield 2

print(list(outer()))`,
      output: `启动
收到 3
6
收到 5
10
子生成器返回: done
[1, 2]`,
      tip: `[[send()]] 第一次必须传 None（或用 [[next()]] 启动）；直接 [[g.send(3)]] 会抛 TypeError。`
    },
    {
      h: "生成器管道：逐行读取、转换与聚合",
      p: `生成器管道把「读取 → 清洗 → 转换 → 聚合」拆成多个小生成器，每个只做一件事，数据像流水一样流过，内存只保留当前元素。[[read_lines(path)]] 逐行读文件，[[parse(line)]] 解析，[[valid(records)]] 过滤，[[summarize(records)]] 聚合；每一层都是惰性的，只有最后消费时才真正执行。\n\n管道的好处是可组合、可测试。你可以单独测 [[parse()]] 对坏行的行为，也可以替换读取源（文件、网络、数据库）而不动后面的逻辑。坏处是错误定位变难：异常可能从管道深处冒出来，栈里全是生成器帧。给每一层加行号/上下文，或者在边界捕获并包装异常。\n\n管道不要重复消费。[[records = parse(f)]] 是一个生成器，传给 [[summarize()]] 后耗尽；再传给另一个函数就是空的。需要多个聚合时，要么在一次遍历里同时算多个指标，要么物化（小数据），要么重新读文件。不要假设生成器可重放。\n\n大文件处理要配合 [[with]] 和 [[yield]]。文件对象在生成器里打开，[[finally]] 负责关闭；如果消费方提前 [[break]]，生成器被关闭时 [[finally]] 会执行。不要用 [[readlines()]] 再包生成器，那样已经物化了整个文件。真正的流式处理是 [[for line in f: yield ...]]，每次只读一行。`,
      code: String.raw`from pathlib import Path

def read_lines(path):
    with Path(path).open(encoding="utf-8") as f:
        for lineno, line in enumerate(f, 1):
            yield lineno, line.rstrip("\n")

def parse(lines):
    for lineno, line in lines:
        if not line.strip():
            continue
        parts = [p.strip() for p in line.split(",")]
        if len(parts) != 2:
            print("坏行", lineno, parts)
            continue
        yield {"name": parts[0], "score": float(parts[1])}

def valid(records):
    for r in records:
        if 0 <= r["score"] <= 100:
            yield r

def total(records):
    return sum(r["score"] for r in records)

Path("scores.csv").write_text("林晓,91\n周宁,88\n坏行\n", encoding="utf-8")
print(total(valid(parse(read_lines("scores.csv")))))`,
      output: `坏行 3 ['坏行']
179.0`,
      tip: `生成器管道只能消费一次；需要多个聚合时，在一次遍历里同时算，或重新读源，不要假设可重放。`
    },
    {
      h: "生成器与协程的边界：异常、关闭与资源清理",
      p: `生成器不是协程，但两者共享「暂停/恢复」的机制。[[async def]] 里的 [[await]] 让出控制权给事件循环，普通生成器的 [[yield]] 让出值给调用方；前者由 asyncio 驱动，后者由 [[next()]] 驱动。不要把两者混用：在普通生成器里 [[await]] 是语法错误，在 async 函数里 [[yield]] 会变成异步生成器，需要 [[async for]]。\n\n生成器异常有三种进入方式：生成器内部抛异常，异常在 [[yield]] 处冒出，生成器结束；调用方 [[throw()]] 把异常送进去，生成器可以捕获并处理；调用方 [[close()]] 抛 [[GeneratorExit]]，生成器应清理并退出，不应再 [[yield]]。[[finally]] 是清理资源的正确位置，[[except GeneratorExit]] 里不要再产出值。\n\n资源清理要幂等。文件关闭、锁释放、临时文件删除，重复执行不应报错；生成器可能在异常、提前 break、垃圾回收多种路径下结束，清理代码要能承受多次调用。[[contextlib.contextmanager]] 把生成器包装成上下文管理器，[[yield]] 前是 enter，[[yield]] 后是 exit；异常会抛到 [[yield]] 处，你可以选择捕获或继续抛。\n\n不要把生成器当数据库游标长期持有。连接可能超时，事务可能失效，生成器暂停期间数据可能变化；需要分页/游标时，用数据库驱动提供的游标，并明确关闭。生成器适合「一次遍历的计算」，不适合「跨请求的持久状态」。理解边界，才能既享受惰性，又不把系统搞复杂。`,
      code: String.raw`def resource():
    print("打开")
    try:
        yield 1
        yield 2
    except GeneratorExit:
        print("被关闭")
        raise
    finally:
        print("清理")

g = resource()
print(next(g))
g.close()

def safe():
    try:
        yield 1
    finally:
        print("finally 执行")

g = safe()
print(next(g))
del g
print("删除后")`,
      output: `打开
1
被关闭
清理
1
finally 执行
删除后`,
      tip: `[[close()]] 会在 [[yield]] 处抛 [[GeneratorExit]]；清理放 [[finally]]，不要在 [[except GeneratorExit]] 里继续 [[yield]]。`
    }
  ]
});

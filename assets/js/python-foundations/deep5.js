window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch5-1": [
    {
      h: "真值协议：__bool__、__len__ 与隐式转换",
      p: `[[if x:]] 不是问「x 等不等于 True」，而是问「x 的真值是什么」。Python 先找 [[x.__bool__()]]，没有就找 [[x.__len__()]]，再没有就默认 True。空列表、空字符串、空字典、空集合、0、[[None]]、[[False]] 的真值都是 False；其他对象通常为 True。这个协议让你能写 [[if items:]] 而不是 [[if len(items) > 0:]]，但前提是你清楚「空」和「缺失」的区别。\n\n自定义类可以实现 [[__bool__]] 或 [[__len__]]，但不要让真值含义模糊。一个「结果对象」如果有数据但业务上失败，[[bool(result)]] 应该返回什么？如果返回 False 表示失败，调用方写 [[if result:]] 就很自然；如果返回 True 只表示「对象存在」，失败状态要另外查，那就别重载 bool，避免误导。真值协议是给「空/非空」用的，不是给「成功/失败」用的。\n\n[[bool]] 是 [[int]] 的子类，[[True == 1]]、[[False == 0]] 都为 True，[[sum([True, False])]] 得到 1。这在统计「通过人数」时很方便，但也会让 [[isinstance(True, int)]] 为 True。校验数字时先排除 bool，否则用户传 [[True]] 会被当成 1；JSON 里 true 和 1 是不同类型，解析后也要注意。\n\n真值与相等是两套判断。[[[] == False]] 为 False，但 [[bool([])]] 为 False；[[0 == False]] 为 True。不要用 [[x == False]] 判断「假」，用 [[not x]]；不要用 [[x == None]]，用 [[x is None]]。这三条规则能避免大部分「明明为空却进不了 if」的困惑。`,
      code: String.raw`values = [0, 1, "", "0", [], [0], {}, None, False, True]
for v in values:
    print(repr(v), bool(v), v == False)

print(isinstance(True, int), True + 1)
print(sum([True, False, True]))

class Result:
    def __init__(self, items): self.items = items
    def __bool__(self): return bool(self.items)

r = Result([])
print(bool(r), r.items)`,
      output: `0 False True
1 True False
'' False False
'0' True False
[] False False
[0] True False
{} False False
None False False
False False True
True True False
True 2
2
False []`,
      tip: `[[[] == False]] 是 False，但 [[bool([])]] 是 False；判断空用 [[if not x]]，不要用 [[x == False]]。`
    },
    {
      h: "分支结构：elif 链、卫语句与提前返回",
      p: `[[if/elif/else]] 是从上到下互斥判断，命中一个就不再往下走。把最可能命中的分支放前面，能少做几次判断；但不要把「性能」当成排序的唯一理由，可读性更重要。分支条件应该互斥且覆盖完整，最后的 else 要么处理「其他」，要么显式写 [[else: raise]]，不要静默放过。\n\n卫语句（guard clause）是提前返回，把异常/边界情况放在函数开头，主逻辑保持扁平。[[if not records: return {}]]、[[if score < 0: raise ValueError(...)]] 比层层嵌套更容易读。卫语句不是「少写 else」的审美问题，而是让读者先排除不可能的情况，再看主路径。\n\n长条件要命名。[[if user and user.active and user.score >= 60 and not user.banned:]] 这种条件，读的时候要在脑子里拆；写成 [[eligible = user and user.active and user.score >= 60 and not user.banned]]，再用 [[if eligible:]]，错误时还能打印 eligible 的组成。条件里的 [[and/or]] 有短路，顺序会影响副作用；把有副作用的调用放在后面，或者先算到变量。\n\n[[and]] 和 [[or]] 返回的是操作数，不是布尔值。[[0 or "fallback"]] 得到 [["fallback"]]，[[1 and "ok"]] 得到 [["ok"]]。这个特性可以写默认值，但也会让 [[if a and b:]] 的结果看起来「不是 True」。需要严格布尔时，用 [[bool(...)]] 包一层；不要把 [[and/or]] 当成三目运算符，Python 有 [[x if cond else y]]。`,
      code: String.raw`def grade(score):
    if not isinstance(score, (int, float)) or isinstance(score, bool):
        raise TypeError("分数必须是数字")
    if score < 0 or score > 100:
        raise ValueError("分数必须在 0-100")
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 60:
        return "C"
    else:
        return "D"

print(grade(91), grade(59), grade(0))
print(0 or "fallback", 1 and "ok")
print(True if 1 else False)`,
      output: `A D D
fallback ok
True`,
      tip: `[[and/or]] 返回操作数而不是布尔值；需要布尔结果时用 [[bool()]]，需要二选一时用 [[x if cond else y]]。`
    },
    {
      h: "边界与浮点：范围判断不能靠直觉",
      p: `范围判断最常见的错误是「把边界写反」或「把开闭区间搞混」。[[0 < score <= 100]] 表示 0 分不合法、100 分合法；[[0 <= score <= 100]] 才是两边都合法。写分页时，[[page < 1]] 和 [[page > total_pages]] 要分别处理；写桶边界时，[[i % n]] 永远落在 0 到 n-1，不要再多减 1。\n\n浮点范围判断不要用 [[==]]。[[0.1 + 0.2 == 0.3]] 为 False；[[score == 100.0]] 可能因为计算误差失败。用 [[math.isclose()]]，或者先把分数转成整数分。成绩系统里，0.5 分的精度通常足够，但「足够」要用业务规则定义：保留一位还是两位？四舍五入还是截断？不要用 [[round()]] 默认行为糊弄。\n\n[[chained comparison]] 是 Python 的特性：[[0 <= x < 100]] 等价于 [[0 <= x and x < 100]]，且 x 只求值一次。不要在链式比较里放有副作用的表达式，也不要把 [[0 <= x > 10]] 当成「x 在 0 到 10」；它表示 [[0 <= x and x > 10]]，交集可能为空。链式比较读起来自然，但每个运算符的方向要一致。\n\n范围判断还要考虑类型。字符串 [["100"]] 和数字 100 比较会抛 [[TypeError]]；[[None]] 和数字比较也会抛。入口处做类型转换和校验，不要把「看起来像数字」的字符串带进计算。[[bool]] 是 int 子类，[[True <= 100]] 为 True，所以数字校验要排除 bool。`,
      code: String.raw`import math

for score in [0, 59.5, 60, 100, 101]:
    print(score, 0 <= score <= 100)

print(0.1 + 0.2 == 0.3)
print(math.isclose(0.1 + 0.2, 0.3))

x = 50
print(0 <= x < 100)
print(0 <= x > 10)

try:
    print("100" <= 100)
except TypeError as err:
    print("类型错误:", err)`,
      output: `0 True
59.5 True
60 True
100 True
101 False
False
True
True
True
类型错误: '<=' not supported between instances of 'str' and 'int'`,
      tip: `[[0 <= x < 100]] 是「x 大于等于 0 且小于 100」；不要把它和 [[0 <= x > 10]] 混为一谈，后者没有上界。`
    }
  ],
  "ch5-2": [
    {
      h: "for 的展开：iter()、next() 与 StopIteration",
      p: `[[for x in items:]] 不是「按索引循环」，而是迭代协议：先 [[iter(items)]] 拿到迭代器，再反复 [[next()]]，直到 [[StopIteration]]。列表、元组、字符串、字典、文件、生成器都实现这套协议。理解这一点，你就能解释为什么字典遍历得到键、文件遍历得到行、生成器只能遍历一次。\n\n[[range()]] 是惰性序列，不是列表。[[range(10**9)]] 几乎不占内存，[[list(range(10**9))]] 会直接爆炸。[[range(start, stop, step)]] 的 stop 不包含，step 可以为负；[[range(5, 0, -1)]] 得到 5 到 1。需要「倒数到 0」时写 [[range(5, -1, -1)]]，别漏掉 0。\n\n循环变量在 Python 里不是块级作用域。[[for x in ...:]] 结束后，x 仍然存在，值是最后一次迭代的值；如果没有迭代，x 根本没被创建。这和第 6 章的作用域规则一致。循环里创建 lambda 捕获 x 时，所有 lambda 可能都看到最后一个值；需要早期绑定，用 [[lambda x=x: ...]] 或 [[functools.partial]]。\n\n[[for...else]] 的 else 在「循环正常结束」时执行，[[break]] 跳过它。它适合「查找直到找到」：找到就 break，没找到走 else。很多人不用 else，因为不直观；你可以用标志变量替代，但要知道 else 的语义，读别人代码时别误解。[[while...else]] 同理。`,
      code: String.raw`items = [10, 20, 30]
it = iter(items)
print(next(it), next(it))
try:
    next(it)
except StopIteration:
    print("结束")

print(list(range(5, 0, -1)))
print(range(10**6))

for x in [1, 2, 3]:
    pass
print(x)

for n in [2, 4, 6]:
    if n % 2 == 1:
        print("奇数", n)
        break
else:
    print("全是偶数")`,
      output: `10 20
结束
[5, 4, 3, 2, 1]
range(0, 1000000)
3
全是偶数`,
      tip: `[[for...else]] 的 else 不是「循环体失败」，而是「没有 break」；不想绕脑就用 found 标志，但读懂它很重要。`
    },
    {
      h: "while 与状态机：退出条件、else 与死循环",
      p: `[[while]] 适合「不知道循环多少次，但知道什么时候停」的场景：读文件直到 EOF、重试直到成功、游戏循环直到退出。写 while 的三件套是：初始化状态、明确退出条件、在循环体内推进状态。缺一件，就会死循环或提前退出。\n\n退出条件要在循环体内可达到。[[while x > 0: x -= 1]] 如果 x 初始为负数，一次都不执行；如果 x 是浮点且步长太小，可能永远到不了 0。[[while True:]] 是常用的「无限循环 + break」写法，但必须保证每条路径都能 break 或 return；异常路径也要考虑，否则程序卡死。\n\n[[while...else]] 和 for 一样：else 在条件变假时执行，break 跳过。它适合「等待直到超时」：超时就 break，正常等到走 else。但大多数业务代码用 [[while True]] + 显式 return 更清楚；else 只在你确实想区分「正常结束」和「提前退出」时用。\n\n循环里要有「进度」和「上限」。处理网络请求时，重试次数、退避时间、总超时都要有；处理文件时，记录行号；处理用户输入时，给退出命令。没有上限的 while 是生产事故的温床。[[time.sleep()]] 也不要写死 1 秒，指数退避更稳；但课程练习里先保证逻辑正确，再谈工程化。`,
      code: String.raw`n = 5
while n > 0:
    print(n)
    n -= 1

attempt = 0
while True:
    attempt += 1
    print("尝试", attempt)
    if attempt >= 3:
        break
else:
    print("不会执行")

n = 0
while n < 3:
    n += 1
else:
    print("正常结束", n)`,
      output: `5
4
3
2
1
尝试 1
尝试 2
尝试 3
正常结束 3`,
      tip: `[[while True]] 必须保证有 break/return；在循环里调用可能抛异常的代码时，把退出路径放进 finally 或异常处理。`
    },
    {
      h: "enumerate、zip 与循环变量的作用域",
      p: `[[enumerate(items, start=1)]] 返回 [[(index, item)]] 对，比 [[range(len(items))]] 更 Pythonic，也避免手动维护下标。[[for i, x in enumerate(items):]] 的解包结构要写对；如果写成 [[for i, x, y in enumerate(...)]][[，]] 会抛「not enough values」。需要下标和值，就用 enumerate；只需要值，就别引入下标。\n\n[[zip]] 把多个序列按位置配对，遇到最短的停止。[[for name, score in zip(names, scores):]] 比按下标同时取两个列表更清楚，也避免 [[names[i]]] 和 [[scores[i]]] 长度不一致时的越界。需要等长校验时加 [[strict=True]]（3.10+）；需要最长配对时用 [[zip_longest]]。\n\n循环变量会泄漏到外层作用域。[[for i in range(3): pass]] 之后 i 是 2；[[for name in []]] 之后 name 可能未定义。函数里也一样，循环变量不是局部块作用域。列表推导式在 Python 3 有自己的作用域，不会泄漏；生成器表达式也是。不要把「推导式不泄漏」推广到普通 for。\n\n嵌套循环里，[[break]] 只跳出最内层。需要跳出多层时，用标志变量、函数 return，或者 [[for...else]] 配合。不要用异常做常规控制流；异常适合「真正的异常」，不是「找到就停」。需要提前停止的多层搜索，抽成函数并 [[return]] 最清楚。`,
      code: String.raw`names = ["林晓", "周宁", "陈默"]
scores = [91, 88, 86]

for i, (name, score) in enumerate(zip(names, scores), 1):
    print(i, name, score)

for i in range(3):
    pass
print("i =", i)

try:
    print(undefined_name)
except NameError as err:
    print("未定义:", err)

def find_pair(rows, target):
    for row in rows:
        for value in row:
            if value == target:
                return True
    return False

print(find_pair([[1, 2], [3, 4]], 3))`,
      output: `1 林晓 91
2 周宁 88
3 陈默 86
i = 2
未定义: name 'undefined_name' is not defined
True`,
      tip: `嵌套循环里的 [[break]] 只跳出一层；要跳出多层，抽成函数用 [[return]]，不要用异常做常规控制流。`
    }
  ],
  "ch5-3": [
    {
      h: "match 的匹配顺序：从上到下、首个命中、不穿透",
      p: `[[match subject:]] 后面跟若干 [[case pattern:]]，从上到下尝试，命中第一个就执行对应分支，然后结束；不会像 C 的 switch 那样「穿透」到下一个 case。每个 case 可以带一个守卫 [[if condition]]，模式匹配成功但守卫为假时，继续尝试下一个 case。[[case _]] 是通配符，匹配任何值，通常放最后。\n\n模式不是表达式。[[case 1 + 2:]] 不是「匹配 3」，而是语法错误；[[case [x, y]:]] 匹配长度为 2 的序列并绑定 x、y；[[case {"name": name}:]] 匹配包含 name 键的映射，不要求只有这个键；[[case Point(x=0, y=0):]] 匹配类实例的属性。理解「模式描述形状」，而不是「模式计算值」，是用好 match 的关键。\n\n绑定变量的作用域是 case 分支。[[case [x, y]:]] 里的 x、y 只在当前分支可见；[[case _]] 不绑定。守卫可以使用已绑定的变量，但模式匹配失败时绑定不会发生。多个 case 可以复用同一个变量名，它们各自独立；不要依赖上一个 case 的绑定，match 不会让变量跨分支泄漏。\n\nmatch 不是 if/elif 的替代品。简单的二分支、范围判断、复杂布尔组合，if 更直接；只有当你确实在拆结构、并且拆完要绑定变量时，match 才值得。把所有 if 改写成 match 会让代码更长、更难读。课程把 match 放进来，是因为现代 Python 代码会遇到它，不是因为它是「高级写法」。`,
      code: String.raw`def describe(value):
    match value:
        case 0:
            return "零"
        case [x, y]:
            return f"两个元素: {x}, {y}"
        case {"name": name}:
            return f"名字: {name}"
        case _:
            return "其他"

print(describe(0))
print(describe([1, 2]))
print(describe({"name": "林晓", "score": 91}))
print(describe("x"))`,
      output: `零
两个元素: 1, 2
名字: 林晓
其他`,
      tip: `[[case _]] 必须放最后；它匹配任何值，放在前面会让后面的 case 永远不执行。`
    },
    {
      h: "序列、映射与类模式：拆结构的三种姿势",
      p: `序列模式用方括号，匹配长度和元素：[[case [x, y]:]] 要求正好两个元素；[[case [first, *rest]:]] 匹配至少一个元素，rest 是列表；[[case (x, y):]] 也能匹配序列，圆括号不是元组专属。字符串是序列，[[case [a, b]:]] 可以匹配两个字符的字符串；如果不想要这种行为，先判断类型或加守卫。\n\n映射模式用花括号，匹配「包含这些键」，不要求键完全相等。[[case {"name": name, "score": score}:]] 只要求这两个键存在，多余的键被忽略；[[case {"name": name, **rest}:]] 把剩余键收进 rest。这个特性适合处理 JSON，但也要注意「多余键被忽略」可能掩盖数据错误。需要严格结构时，匹配后用 [[set(obj) == {...}]] 校验。\n\n类模式用类名加参数，[[case Point(x=0, y=0):]] 匹配 [[isinstance(obj, Point)]] 且属性满足模式。它调用 [[__match_args__]] 或属性访问，不调用 [[__init__]]；不要指望它在匹配时构造对象。类模式适合领域对象，不适合普通字典；字典用映射模式，别绕成类。\n\n或模式 [[case 1 | 2:]] 匹配任意一个分支，但所有分支必须绑定相同的变量名；[[case [x] | {"x": x}:]] 可以，[[case [x] | {"y": y}:]] 不行。守卫 [[case n if n > 0:]] 在模式匹配成功后执行；守卫里不要做副作用，也不要用它替代完整的模式设计。`,
      code: String.raw`def shape(value):
    match value:
        case [first, *rest]:
            return ("seq", first, rest)
        case {"name": name, **extra}:
            return ("map", name, sorted(extra))
        case _:
            return ("other", value)

print(shape([1, 2, 3]))
print(shape({"name": "林晓", "score": 91, "class": "A"}))
print(shape("ab"))

class Point:
    __match_args__ = ("x", "y")
    def __init__(self, x, y): self.x, self.y = x, y

def where(p):
    match p:
        case Point(0, 0):
            return "原点"
        case Point(x, 0):
            return f"x轴: {x}"
        case Point(0, y):
            return f"y轴: {y}"
        case Point(x, y):
            return f"平面: {x}, {y}"

print(where(Point(0, 0)), where(Point(3, 0)), where(Point(1, 2)))`,
      output: `('seq', 1, [2, 3])
('map', '林晓', ['class', 'score'])
('other', 'ab')
原点 x轴: 3 平面: 1, 2`,
      tip: `映射模式只检查「包含」，不检查「只有」；需要严格字段集时，匹配后显式比较 [[set(obj)]]。`
    },
    {
      h: "版本边界：3.10+、3.8 练习室与降级写法",
      p: `[[match]] 是 Python 3.10 引入的语法，3.9 及以下直接 [[SyntaxError]]，不是运行时异常。站内练习室使用 Judge0 的 Python 3.8 兼容档，所以课程里的 match 代码只能阅读、不能提交判题；页面会明确标注「只读演示」。这不是课程偷懒，而是运行环境的事实边界。\n\n判断当前解释器版本用 [[sys.version_info]]，不要用字符串比较。[[sys.version_info >= (3, 10)]] 是可靠的；[[sys.version.startswith("3.10")]] 会把 3.10.1 和 3.100 混在一起。需要兼容旧版本时，把 match 逻辑降级成 if/elif：序列模式用 [[isinstance(value, (list, tuple)) and len(value) == 2]]，映射模式用 [[isinstance(value, dict) and "name" in value]]。降级代码更长，但能在 3.8 跑。\n\n如果库要同时支持 3.8 和 3.10+，不要把 match 写在模块顶层；用 [[if sys.version_info >= (3, 10):]] 分支定义不同函数，或者用 [[try: compile(...)]] 做特性探测。更稳妥的做法是：主逻辑用 if/elif，match 只作为可选的「现代写法」示例；库的公共 API 不应该强迫用户升级解释器。\n\n课程选择把 match 放在第 5 章，是为了让你能读懂现代代码，而不是鼓励你立刻在所有项目里用。你真正需要掌握的是「模式匹配解决什么问题」：拆结构、绑定变量、按形状分支。理解了这个，即使项目只能用 3.8，你也能用 if/elif 写出等价逻辑。`,
      code: String.raw`import sys

print(sys.version_info)
print(sys.version_info >= (3, 10))

def describe_legacy(value):
    if isinstance(value, (list, tuple)) and len(value) == 2:
        return ("pair", value[0], value[1])
    if isinstance(value, dict) and "name" in value:
        return ("named", value["name"])
    return ("other", value)

print(describe_legacy([1, 2]))
print(describe_legacy({"name": "林晓"}))
print(describe_legacy("x"))`,
      output: `sys.version_info(beta=0, candidate=0, final=0, major=3, micro=13, releaselevel='final', serial=0)
True
('pair', 1, 2)
('named', '林晓')
('other', 'x')`,
      tip: `[[match]] 在 3.9 及以下会 [[SyntaxError]]，不是运行时错误；给旧版本用户看的代码，提前降级成 if/elif。`
    }
  ]
});

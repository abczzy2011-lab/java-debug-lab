window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch3-1": [
    {
      h: "动态数组与容量：append 为什么通常是 O(1)",
      p: `列表不是链表，而是一块连续内存的动态数组。它记录已用了多少格（长度），也记录总共分配了多少格（容量）。[[append()]] 时如果还有空位，直接放到下一格；没有空位，就申请一块更大的内存，把旧元素搬过去，再放新元素。扩容通常按比例增长，所以连续追加 n 次的总成本是 O(n)，均摊到每次是 O(1)。\n\n这个模型解释了为什么「偶尔一次 append 很慢」是正常的：那一次正好触发了扩容和搬迁。它也解释了为什么「在开头插入很慢」：[[insert(0, x)]] 要把后面所有元素整体右移，O(n)；[[pop(0)]] 要把后面所有元素左移，也是 O(n)。需要频繁从两端进出，用 [[collections.deque]]；需要频繁按位置插入，先问数据结构选得对不对。\n\n列表存的是对象引用，不是对象本身。一个存 100 万个整数的列表，占用的是 100 万个指针加整数对象；小整数有缓存，大整数每个都要单独分配。[[sys.getsizeof()]] 只算容器本身，不算元素指向的对象；用它估算内存时，别只看一个数字就下结论。\n\n切片、复制和 [[list()]] 都会创建新外层列表，但元素引用仍然共享。[[b = a[:]]] 之后修改 [[b[0]]] 的可变对象，[[a[0]]] 也会看到；只有 [[copy.deepcopy()]] 才递归复制。把「列表扩容」和「元素复制」分开理解，你就不会把浅拷贝当成深拷贝。`,
      code: String.raw`import sys
from collections import deque

a = []
print(sys.getsizeof(a))
for i in range(10):
    a.append(i)
    print(i, len(a), sys.getsizeof(a))

q = deque([1, 2, 3])
q.appendleft(0)
q.pop()
print(q)

a = [[1], [2]]
b = a[:]
b[0].append(99)
print(a, b)`,
      output: `56
0 1 88
1 2 88
2 3 88
3 4 88
4 5 120
5 6 120
...
deque([0, 1, 2])
[[1, 99], [2]] [[1, 99], [2]]`,
      tip: `[[sys.getsizeof([])]] 在不同版本和平台不同；不要把它当作精确内存计算器，更不要在业务代码里依赖具体数值。`
    },
    {
      h: "增删改查的复杂度：什么时候该换结构",
      p: `列表的 [[append()]] 均摊 O(1)，[[pop()]] 尾部 O(1)，[[pop(0)]] 头部 O(n)，[[insert()]] 中间 O(n)，[[in]] 线性查找 O(n)，按下标 [[a[i]]] 是 O(1)。这些不是背诵题，而是选型依据：排队用 deque，查成员用 set，按 key 找值用 dict，按顺序遍历用 list。\n\n[[remove(x)]] 删除的是「第一个等于 x 的元素」，找不到抛 [[ValueError]]；[[del a[i]]] 按下标删；[[del a[1:3]]] 按切片删；[[a.clear()]] 清空。[[pop()]] 返回被删元素，[[remove()]] 不返回。需要「删除并拿到值」时用 pop；需要「按值删除但不在乎返回值」时用 remove。不要用 [[a.remove(a[i])]] 这种绕圈写法，既慢又容易删错。\n\n遍历时修改列表是经典陷阱。你在 [[for x in a:]] 里 [[a.remove(x)]]，迭代器仍然按旧下标往前走，结果会跳过元素或重复处理。正确做法有三种：遍历副本 [[for x in a[:]]]；倒序遍历 [[for i in range(len(a)-1, -1, -1)]]；或者构造新列表 [[a = [x for x in a if ...]]]。选择取决于你要「原地改」还是「产生新列表」。\n\n嵌套列表的「删除」更容易出错。[[a.remove([1, 2])]] 按值比较，能找到就删；但 [[a.remove(some_list)]] 如果 some_list 与某个元素值相等，也会删掉第一个匹配项。想按身份删除，必须自己遍历并用 [[is]] 判断。列表没有「按 id 删除」的 API，因为 id 不是稳定业务键。`,
      code: String.raw`a = [1, 2, 2, 3]
a.remove(2)
print(a)

print(a.pop(), a)
del a[0]
print(a)

items = [1, 2, 3, 4]
for x in items[:]:
    if x % 2 == 0:
        items.remove(x)
print(items)

items = [1, 2, 3, 4]
items = [x for x in items if x % 2]
print(items)`,
      output: `[1, 2, 3]
3 [1, 2]
[2]
[1, 3]
[1, 3]`,
      tip: `[[for x in a[:]]] 复制的是外层列表；如果元素是可变对象，遍历中修改元素内容仍会影响原列表。`
    },
    {
      h: "嵌套列表与成绩表：从行到记录的建模",
      p: `成绩表最自然的两种表示是「列表的列表」和「字典的列表」。前者紧凑、适合矩阵运算；后者可读、适合按字段名访问。课程先用列表的列表，是因为它逼你想清楚「第几列是什么」；等进入字典章节，再升级成带字段名的记录。没有哪种永远更好，只有哪种更适合当前操作。\n\n列表的列表要约定列顺序：[["林晓", 91, 88.5], ["周宁", 86, 92]]。这个约定必须写进注释或常量，不能让 [[row[1]]] 这种魔法下标散落在代码里。可以定义 [[NAME, PYTHON, MATH = 0, 1, 2]]，或者用 [[namedtuple]]。一旦列顺序变化，所有下标都要改；字段名表示则只需要改一处。\n\n增加一行用 [[append()]]，增加一列则要遍历每一行 [[row.append(value)]]。删除一列同样要遍历，且要保证每行列数一致。列表本身不校验「每行长度相同」，这是使用者的责任。读入 CSV 后先做一次矩形校验：所有行列数相等、表头与数据列数相等；不相等就报错，不要带着畸形数据往下算。\n\n成绩表常见操作：按行遍历、按列提取、转置、按某个字段排序。按列提取用 [[[row[i] for row in rows]]]；转置用 [[list(zip(*rows))]]，但 zip 会在最短行处截断，行长度不一致时会静默丢数据。先校验矩形，再转置。数据规模大时，这些操作会产生很多中间列表；到第 7 章会用生成器把它们串起来。`,
      code: String.raw`rows = [
    ["林晓", 91, 88.5],
    ["周宁", 86, 92],
    ["陈默", 78, 85],
]

NAME, PYTHON, MATH = 0, 1, 2
for row in rows:
    print(row[NAME], row[PYTHON], row[MATH])

python_scores = [row[PYTHON] for row in rows]
print(python_scores)

columns = list(zip(*rows))
print(columns[1])

bad = [["林晓", 91], ["周宁", 86, 92]]
print(list(zip(*bad)))`,
      output: `林晓 91 88.5
周宁 86 92
陈默 78 85
[91, 86, 78]
(91, 86, 78)
[('林晓', '周宁'), (91, 86)]`,
      tip: `[[zip(*rows)]] 按最短行截断；行长度不一致时不会报错，只会悄悄丢列。先校验矩形，再转置。`
    }
  ],
  "ch3-2": [
    {
      h: "Timsort 与排序稳定性：key 到底怎么用",
      p: `Python 的 [[sort()]] 和 [[sorted()]] 使用 Timsort，一种归并排序和插入排序的混合算法，平均和最坏都是 O(n log n)，并且是稳定排序。稳定意味着值相等的元素保持原来的相对顺序；这让多键排序可以分步做：先按次要键排，再按主要键排，最终次要键的顺序不会被主要键打乱。\n\n[[key=]] 接收一个函数，对每个元素调用一次，用返回值排序。[[sorted(records, key=lambda r: r["score"])]] 不会改变原列表；[[records.sort(key=...)]] 原地排序并返回 [[None]]。把 [[sort()]] 的返回值赋给变量，是常见错误：[[a = a.sort()]] 会让 a 变成 None。记住：sorted 返回新列表，sort 返回 None。\n\n多键排序有两种写法。[[key=lambda r: (r["class"], -r["score"])]] 用一个元组表达「班级升序、分数降序」；负号只对数字有效，字符串不能取负。另一种是分步稳定排序：先按次要键排，再按主要键排。分步写法可读性更好，但要求你理解稳定性；元组写法更紧凑，但元组里混类型会报 [[TypeError]]。\n\n排序键可能抛异常。[[None]] 和数字不能直接比较，混合类型列表排序会失败；key 函数里访问缺失字段会抛 [[KeyError]]。生产代码要先清洗再排序，或者给 key 一个明确的默认值。不要用 [[sorted(data, key=lambda x: x or 0)]] 糊弄，0 可能不是合法业务值；默认值要能表达「缺失」，而不是假装成正常值。`,
      code: String.raw`records = [
    {"name": "林晓", "class": "A", "score": 91},
    {"name": "周宁", "class": "B", "score": 92},
    {"name": "陈默", "class": "A", "score": 88},
]

by_score = sorted(records, key=lambda r: r["score"])
print([r["name"] for r in by_score])

by_class_score = sorted(records, key=lambda r: (r["class"], -r["score"]))
print([(r["class"], r["name"], r["score"]) for r in by_class_score])

records.sort(key=lambda r: r["score"])
print(records[0]["name"], records.sort())`,
      output: `['陈默', '林晓', '周宁']
[('A', '林晓', 91), ('A', '陈默', 88), ('B', '周宁', 92)]
陈默 None`,
      tip: `[[list.sort()]] 原地排序并返回 [[None]]；[[a = a.sort()]] 会把列表弄丢。要新列表就用 [[sorted(a)]]。`
    },
    {
      h: "拷贝的三层：别名、浅拷贝、深拷贝",
      p: `第一层是别名：[[b = a]]，两个名字指向同一个对象，没有复制。第二层是浅拷贝：[[b = a.copy()]]、[[b = a[:]]]、[[b = list(a)]]，创建新的外层容器，但元素引用仍然共享。第三层是深拷贝：[[b = copy.deepcopy(a)]]，递归复制所有可变子对象，得到完全独立的一棵树。\n\n浅拷贝对「元素是不可变对象」的列表足够用。[[[1, 2, 3]]] 复制后，修改 [[b[0]]] 只是让 b 指向新整数，a 不受影响。但对「元素是列表/字典」的列表，浅拷贝只复制外层，内层仍然共享；[[b[0].append(9)]] 会同时改变 a[0]。这不是拷贝失败，是你只拷了一层。\n\n深拷贝能解决嵌套共享，但它有代价：速度慢、内存翻倍、可能遇到循环引用。[[copy.deepcopy()]] 内部用 memo 处理循环引用，所以不会无限递归；但它不会复制文件句柄、网络连接、线程锁这类「不可深拷贝」的资源。对包含这些资源的对象，深拷贝要么失败，要么产生无意义副本。\n\n实际工程里，优先问「我需不需要复制」。如果只是读数据，别名就够了；如果要把数据交给会修改它的函数，传副本或让函数返回新对象；如果结构很深且确实要独立，再上 deepcopy。不要为了「安全」在所有地方深拷贝，性能和安全不是只靠拷贝解决的。`,
      code: String.raw`import copy

a = [[1, 2], [3, 4]]
alias = a
shallow = a.copy()
deep = copy.deepcopy(a)

shallow[0].append(99)
print("a:", a)
print("shallow:", shallow)
print("deep:", deep)

print(alias is a, shallow is a, deep is a)
print(alias[0] is a[0], shallow[0] is a[0], deep[0] is a[0])`,
      output: `a: [[1, 2, 99], [3, 4]]
shallow: [[1, 2, 99], [3, 4]]
deep: [[1, 2], [3, 4]]
True False False
True True False`,
      tip: `[[copy.deepcopy()]] 不复制打开的文件、socket、锁；包含这些资源的对象，最好设计成「不可拷贝」或显式提供复制方法。`
    },
    {
      h: "排序边界：None、混合类型与 key 函数异常",
      p: `排序最怕「看起来能跑，换一批数据就炸」。[[sorted([1, "2"])]] 在 Python 3 直接抛 [[TypeError]]，因为整数和字符串没有定义大小关系；[[sorted([1, None])]] 也一样。数据清洗时要把「缺失」与「正常值」分开：缺失值要么提前过滤，要么映射成一个同类型的哨兵值，且业务上能解释这个哨兵。\n\nkey 函数返回的类型必须一致。[[key=lambda x: x.get("score")]] 遇到没有 score 的记录会返回 None，和数字混排就炸；[[key=lambda x: x["score"]]] 遇到缺失键直接抛 [[KeyError]]。更稳的写法是先规范化记录，保证每条都有 score，且类型是数字；或者用 [[key=lambda x: (x["score"] is None, x["score"] or 0)]] 把缺失排到末尾。但「排到末尾」是否符合业务，要先确认。\n\n排序不是去重。[[sorted(set(data))]] 会去重，但集合本身无序，排序后才稳定；[[sorted(data)]] 保留重复。[[list(dict.fromkeys(data))]] 可以按首次出现顺序去重，比 set 更可预测。选择去重方案时，先问「重复的定义是什么」：完全相等、某个字段相等，还是业务键相等。\n\n排序还会暴露可变对象的比较问题。自定义类没有实现 [[__lt__]] 时不能排序；实现了但比较逻辑有副作用，会让排序结果不可预测。给类排序时优先用 [[key=]] 提取一个稳定字段，而不是依赖对象自身的比较。key 函数应该是纯函数：不修改对象、不读写全局状态、不抛随机异常。`,
      code: String.raw`data = [
    {"name": "林晓", "score": 91},
    {"name": "周宁", "score": None},
    {"name": "陈默", "score": 88},
]

safe = sorted(data, key=lambda r: (r["score"] is None, r["score"] or 0))
print([(r["name"], r["score"]) for r in safe])

try:
    print(sorted([1, "2"]))
except TypeError as err:
    print("混合类型:", err)

print(sorted([3, 1, 2, 1]))
print(list(dict.fromkeys([3, 1, 2, 1])))`,
      output: `[('陈默', 88), ('林晓', 91), ('周宁', None)]
混合类型: '<' not supported between instances of 'str' and 'int'
[1, 1, 2, 3]
[3, 1, 2]`,
      tip: `[[key=lambda r: (r["score"] is None, r["score"] or 0)]] 把 None 排到最后；如果 0 是合法分数，[[or 0]] 仍然可用，但排序语义要写进注释。`
    }
  ],
  "ch3-3": [
    {
      h: "元组的不可变性与哈希：什么时候能当字典键",
      p: `元组是不可变序列，但「不可变」指的是元组本身不能增删改元素，不保证元素内部不可变。[[(1, [2])]] 是合法元组，但它不可哈希，因为里面的列表可哈希性不成立。元组要当字典键，必须所有元素都可哈希；字符串、数字、[[None]]、冻结的 frozenset 可以，列表、字典、集合不行。\n\n哈希要求「相等即同哈希，且哈希稳定」。可变对象放进字典键后，如果内容变了，哈希值可能变，字典就找不到它。Python 因此禁止可变容器作为键。元组本身不可变，但如果它包含可变对象，整体仍然不可哈希；[[hash((1, [2]))]] 会抛 [[TypeError]]。判断能不能当键，不要看「是不是元组」，要看「递归地是否所有元素都可哈希」。\n\n元组常用来表示「一条记录」：[[("林晓", 91, 88.5)]]。它比列表更适合做固定结构，因为不会被误改；但它没有字段名，[[row[1]]] 仍然是魔法下标。[[collections.namedtuple]] 在元组基础上加字段名，既有不可变性又可读；[[typing.NamedTuple]] 还能加类型标注。数据类 [[dataclass(frozen=True)]] 也能做不可变记录，但它是类，不是元组。\n\n元组的「逗号」比括号更重要。[[(1)]] 是整数 1，[[(1,)]] 才是单元素元组；[[1, 2]] 不加括号也是元组。函数返回多个值时，本质是返回一个元组；调用方解包时，元素个数必须匹配。理解这一点，[[return a, b]] 和 [[return (a, b)]] 就是同一件事，不会再有「为什么返回了一个元组」的困惑。`,
      code: String.raw`t = (1, 2)
print(type(t), hash(t))

bad = (1, [2])
try:
    print(hash(bad))
except TypeError as err:
    print("不可哈希:", err)

point = (3, 4)
grid = {point: "起点"}
print(grid[(3, 4)])

one = (1)
two = (1,)
print(type(one), type(two))

from collections import namedtuple
Score = namedtuple("Score", "name python math")
s = Score("林晓", 91, 88.5)
print(s.name, s.python, s[2])`,
      output: `<class 'tuple'> 3713081631934410656
不可哈希: unhashable type: 'list'
起点
<class 'int'> <class 'tuple'>
林晓 91 88.5`,
      tip: `[[hash((1, 2))]] 在同一进程内稳定，但跨进程可能变化；不要把 [[hash()]] 的结果存进数据库当唯一键。`
    },
    {
      h: "解包协议：星号、嵌套与函数返回值",
      p: `解包不是元组专属，任何可迭代对象都能解包。[[a, b = [1, 2]]] 可以，[[a, b = "xy"]] 也可以。左边元素个数必须与右边长度一致，否则抛 [[ValueError]]；星号 [[*rest]] 可以吸收多余元素，且只能出现一次。[[first, *middle, last = data]] 是提取首尾的常用写法。\n\n星号解包在函数调用里也成立。[[func(*args)]] 把序列展开成位置参数，[[func(**kwargs, extra=1)]] 展开字典；两者可以组合，但同一个参数不能重复传值。Python 3.5 之后，函数调用和字面量里都可以用多个星号，例如 [[[*a, *b]]] 合并列表，[[{**d1, **d2}]] 合并字典。这些写法简洁，但别在一个表达式里堆太多层，可读性比省一行更重要。\n\n嵌套解包适合固定结构：[[name, (python, math) = row]]。但结构一旦不固定，嵌套解包就会变成脆弱契约；数据来源稍有变化就抛错。生产代码里，优先用 [[namedtuple]] 或 dataclass 明确字段，再按字段访问；解包只在「结构确实固定且短小」时使用。\n\n函数返回多个值时，调用方可以整体接收，也可以解包。[[result = f()]] 得到元组；[[a, b = f()]] 直接拆开。如果函数可能返回 [[None]]，解包会抛 [[TypeError]]；调用方要先判断。不要在「可能失败」的函数上直接解包，错误信息会掩盖真正的失败原因。`,
      code: String.raw`data = [1, 2, 3, 4]
first, *middle, last = data
print(first, middle, last)

a, b = "xy"
print(a, b)

def stats():
    return 3, 90.0

count, avg = stats()
print(count, avg)

row = ["林晓", (91, 88.5)]
name, (python, math) = row
print(name, python, math)

print([*[1, 2], *[3, 4]])
print({**{"a": 1}, **{"b": 2}})`,
      output: `1 [2, 3] 4
x y
3 90.0
林晓 91 88.5
[1, 2, 3, 4]
{'a': 1, 'b': 2}`,
      tip: `星号解包只能有一个；[[a, *b, *c = data]] 是语法错误。需要多个切片时，分开写。`
    },
    {
      h: "zip 的终止条件：最短、最长与 strict",
      p: `[[zip(a, b)]] 按位置配对，遇到最短的序列结束就停。这个行为很方便，也很危险：两个文件行数不一致时，[[zip]] 会静默丢掉多出来的行，不报错。Python 3.10 引入 [[strict=True]]，长度不一致时抛 [[ValueError]]；处理「应该等长」的数据时，显式加上它。\n\n需要按最长配对时，用 [[itertools.zip_longest(fillvalue=None)]]。缺失位置用 fillvalue 填充，默认是 None；业务上要确认 None 是否可接受，还是用空字符串/0 更合适。不要用 [[zip]] 加 [[pad]] 手工补，容易把「缺失」和「合法值」混在一起。\n\nzip 返回迭代器，只能遍历一次。[[z = zip(a, b)]] 之后 [[list(z)]] 得到列表，再 [[list(z)]] 就是空的。需要多次遍历时，先 [[list(zip(...))]] 物化；数据量大时，不要物化，改用生成器重新创建。这个「迭代器耗尽」的坑在第 7 章还会反复出现。\n\nzip 常和 [[enumerate]] 组合：[[for i, (a, b) in enumerate(zip(xs, ys))]]。注意括号：[[enumerate(zip(...))]] 产生 [[(i, (a, b))]]，解包要写成 [[i, (a, b)]]。写错成 [[i, a, b]] 会抛「not enough values to unpack」或者得到意外的嵌套。多序列遍历时，把结构写清楚，比省一个变量重要。`,
      code: String.raw`names = ["林晓", "周宁", "陈默"]
scores = [91, 88]

print(list(zip(names, scores)))
print(list(zip(names, scores, strict=True)))

from itertools import zip_longest
print(list(zip_longest(names, scores, fillvalue="-")))

z = zip(names, scores)
print(list(z))
print(list(z))

for i, (name, score) in enumerate(zip(names, scores), 1):
    print(i, name, score)`,
      output: `[('林晓', 91), ('周宁', 88)]
ValueError: zip() argument 2 is shorter than argument 1
[('林晓', 91), ('周宁', 88), ('陈默', '-')]
[('林晓', 91), ('周宁', 88)]
[]
1 林晓 91
2 周宁 88`,
      tip: `[[zip]] 返回迭代器，遍历一次就耗尽；需要重复用就先 [[list()]]，但大文件不要物化。`
    }
  ]
});

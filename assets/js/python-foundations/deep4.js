window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch4-1": [
    {
      h: "哈希表原理：字典为什么平均 O(1)",
      p: `字典的底层是哈希表。插入一个键时，Python 先调用 [[hash(key)]] 得到一个整数，再用这个整数决定放在哪个桶里；查找时同样算哈希、定位桶、比较键。理想情况下桶里只有一个元素，所以是 O(1)。桶冲突时用开放寻址探测下一个位置，冲突越多越慢；因此字典会保持一定的空位比例，容量不够时扩容并重新分配所有键。\n\n这也解释了字典的三个特性：键必须可哈希；键的哈希值在生命周期内不能变；遍历顺序是插入顺序，而不是哈希顺序。Python 3.7 起，字典明确保证插入顺序，这是语言规范，不是 CPython 的实现细节。[[dict]] 因此可以同时当「映射」和「有序记录」用，但不要依赖「删除后顺序会怎样」这种未定义细节。\n\n哈希冲突不等于键相等。两个不同键可以有相同哈希值，哈希表还要用 [[==]] 做最终比较；反过来，相等的键必须有相同哈希值。自定义类要当键，必须同时实现 [[__hash__]] 和 [[__eq__]]，并保证「相等则同哈希」。只实现一个，字典行为会不可预测；可变对象默认不可哈希，除非你明确知道自己在做什么。\n\n字典的容量会随插入增长，但不会随删除自动缩小。大量插入再删除后，字典可能仍占着大块内存；需要压缩时用 [[dict.copy()]] 或重建。[[sys.getsizeof()]] 可以看容器大小，但不含键值对象。做缓存时要设置上限，不要用字典无限制地存请求结果，否则内存会慢慢涨上去。`,
      code: String.raw`d = {"a": 1, "b": 2}
print(d)
print(list(d), list(d.keys()), list(d.values()))

d["c"] = 3
del d["b"]
print(d)

print({"a": 1, "a": 2})

class Bad:
    __hash__ = None

try:
    print({Bad(): 1})
except TypeError as err:
    print(err)`,
      output: `{'a': 1, 'b': 2}
['a', 'b'] ['a', 'b'] [1, 2]
{'a': 1, 'c': 3}
{'a': 2}
unhashable type: 'Bad'`,
      tip: `字典遍历顺序是插入顺序，但集合不是；需要稳定输出时，对 [[d.items()]] 排序，不要假设集合有顺序。`
    },
    {
      h: "键的可哈希性与相等性：自定义对象做键",
      p: `可哈希的对象必须满足：哈希值在生命周期内不变；[[__eq__]] 与 [[__hash__]] 一致；相等对象哈希相同。数字、字符串、元组、frozenset、[[None]] 都满足；列表、字典、集合不满足，因为它们是可变的。元组只有所有元素都可哈希时才可哈希，[[(1, [2])]] 不行。\n\n自定义类默认的 [[__hash__]] 基于 [[id()]]，[[__eq__]] 基于身份；这意味着两个内容相同的对象不相等，也不能当「按内容查找」的键。要按业务字段查找，定义 [[__hash__]] 返回字段元组的哈希，[[__eq__]] 比较字段元组；并确保这些字段不可变。字段里有列表时，先转成元组，或者把类设计成不可变。\n\n可变对象做键是灾难。你把列表当键，Python 直接拒绝；你用自定义可变对象做键，插入后修改了参与哈希的字段，字典就找不到它，甚至会出现「明明有键却取不到」的诡异现象。规则很简单：参与哈希的字段，创建后不要再改。需要「可变记录 + 稳定键」时，用不可变的业务 id 做键，对象作为值。\n\n相等性还会影响去重。[[set(records)]] 用哈希和相等判断，两个 dict 不可哈希，不能直接去重；需要先转成 [[tuple(sorted(d.items()))]] 或自定义可哈希包装。[[list(dict.fromkeys(records))]] 对可哈希元素有效，对 dict 无效。去重前先问「按什么字段判重」，再选数据结构；不要指望一个通用函数解决所有去重。`,
      code: String.raw`class Student:
    def __init__(self, sid, name):
        self.sid = sid
        self.name = name

    def __hash__(self):
        return hash(self.sid)

    def __eq__(self, other):
        return isinstance(other, Student) and self.sid == other.sid

a = Student("S01", "林晓")
b = Student("S01", "林晓")
c = Student("S02", "周宁")

print(a == b, a == c, hash(a) == hash(b))
print({a: 91, c: 88}[b])

try:
    print({[1, 2]: "bad"})
except TypeError as err:
    print(err)`,
      output: `True False True
91
unhashable type: 'list'`,
      tip: `[[__eq__]] 返回 [[NotImplemented]] 而不是 False，才能让 Python 尝试反向比较；写 [[isinstance]] 检查，避免和无关类型相等。`
    },
    {
      h: "读取策略：[]、get、setdefault、defaultdict",
      p: `[[d[key]]] 是最直接的读取，键不存在时抛 [[KeyError]]；[[d.get(key, default)]] 不存在时返回默认值，不抛异常。选择哪一种，取决于「键不存在」是程序错误还是正常分支。配置项缺失通常是错误，应该用 [[]] 让问题暴露；计数、分组、可选字段缺失是正常分支，用 [[get()]] 更顺手。\n\n[[setdefault(key, default)]] 在键不存在时插入默认值并返回它，键存在时返回已有值。它适合「初始化再修改」的场景：[[groups.setdefault(cls, []).append(name)]]。但要注意默认值在调用前已经求值：[[setdefault(k, expensive())]] 即使键存在也会执行 [[expensive()]]，造成浪费。需要惰性初始化时，用 [[defaultdict(factory)]]。\n\n[[defaultdict(list)]] 在访问缺失键时自动创建空列表；[[defaultdict(int)]] 自动创建 0。它比 [[setdefault]] 少一次方法调用，但会让「缺失键」静默变成默认值，可能掩盖数据错误。读外部数据时，先用普通 dict 校验结构，再在明确需要聚合的内部循环里用 defaultdict。\n\n删除也有策略。[[d.pop(key)]] 键不存在抛 [[KeyError]]，[[d.pop(key, None)]] 返回 None；[[del d[key]]] 同样抛异常。需要「有就删、没有就算」时用 pop 带默认值；需要「必须存在」时用 del。不要用 [[if key in d: del d[key]]] 做两次查找，直接用 [[pop(key, None)]] 一次完成。`,
      code: String.raw`d = {"a": 1}
print(d["a"])
print(d.get("b"))
print(d.get("b", 0))

d.setdefault("c", []).append(2)
print(d)

from collections import defaultdict
groups = defaultdict(list)
for name, cls in [("林晓", "A"), ("周宁", "B"), ("陈默", "A")]:
    groups[cls].append(name)
print(dict(groups))

print(d.pop("c", None), d)
del d["a"]
print(d)`,
      output: `1
None
0
{'a': 1, 'c': [2]}
{'A': ['林晓', '陈默'], 'B': ['周宁']}
[2] {'a': 1}
{}`,
      tip: `[[setdefault(k, expensive())]] 会先求值再判断；键已存在时，这次求值白做。惰性初始化用 [[defaultdict]]。`
    }
  ],
  "ch4-2": [
    {
      h: "嵌套数据建模：list of dicts 还是 dict of dicts",
      p: `一条学生记录用 [[{"name": "林晓", "scores": {...}}]] 表示，整个班级用列表装记录，这是「list of dicts」。如果经常按学号查找，改成「dict of dicts」：[[{"S01": {"name": "林晓", ...}}]]，键是业务 id，值是记录。前者适合顺序展示，后者适合按 key 查找；没有一种结构能同时把两类操作都做到最优。\n\n选择结构时，先列出操作：按 id 查、按班级分组、按分数排序、插入、删除。按 id 查用 dict；按班级分组用 [[defaultdict(list)]]；排序用 [[sorted()]] 配合 key。不要一开始就设计三层嵌套，然后发现每取一个字段要写四个方括号。结构应该跟着操作走，而不是跟着「看起来像 JSON」走。\n\n嵌套层级越深，缺失键的处理越麻烦。[[data["S01"]["scores"]["python"]]] 任何一层缺失都会抛 [[KeyError]]，错误信息只告诉你哪个键，不告诉你哪条记录。写一个 [[safe_get(record, "scores", "python", default=None)]] 或使用 [[get()]] 链式判断，能让错误定位更容易。但不要把所有缺失都吞成 None，业务上该报错的地方仍要报错。\n\n记录之间共享子对象时要小心。你把同一个 [[scores]] 字典赋给多个学生，修改一个会影响全部；需要独立副本时用 [[copy.deepcopy()]] 或让每条记录重新构造。JSON 反序列化通常会创建新对象，但手工拼装不会。数据建模的一半工作，是明确「哪些东西应该共享，哪些必须独立」。`,
      code: String.raw`students = {
    "S01": {"name": "林晓", "scores": {"python": 91, "math": 88}},
    "S02": {"name": "周宁", "scores": {"python": 86, "math": 92}},
}

print(students["S01"]["scores"]["python"])
print(students.get("S99", {}).get("name", "未知"))

from collections import defaultdict
by_class = defaultdict(list)
for sid, st in students.items():
    by_class[st.get("class", "未分班")].append(st["name"])
print(dict(by_class))

shared = {"python": 90}
a = {"name": "A", "scores": shared}
b = {"name": "B", "scores": shared}
a["scores"]["python"] = 95
print(b["scores"])`,
      output: `91
未知
{'未分班': ['林晓', '周宁']}
{'python': 95}`,
      tip: `链式 [[.get()]] 只适合「缺失是正常」的读取；如果缺字段代表数据损坏，写显式校验并抛错，不要层层返回 None。`
    },
    {
      h: "缺失值与默认工厂：setdefault、defaultdict、deep merge",
      p: `聚合数据时，缺失键的处理决定了代码的复杂度。[[groups.setdefault(cls, []).append(name)]] 是最直接的写法；[[defaultdict(list)]] 更简洁，但会把任何被访问的缺失键都变成空列表。前者适合「只在明确要追加时初始化」，后者适合「整个循环都按同一规则聚合」。\n\n嵌套 defaultdict 要小心。[[defaultdict(lambda: defaultdict(list))]] 可以自动创建两层，但 lambda 每次调用都新建内层；如果写成 [[defaultdict(defaultdict(list))]]，所有键会共享同一个内层字典，因为默认值在创建外层时只求值一次。这个坑和函数默认参数同源：默认值只创建一次。需要工厂函数，不要传一个现成的可变对象。\n\n合并两个嵌套字典时，浅合并 [[{**a, **b}]] 只会替换顶层键；如果 b 里有一个不完整的子字典，a 里对应的其他字段会整个丢掉。需要深合并时，递归遍历：两边都是 dict 才递归，否则用 b 覆盖 a。写深合并要明确数组怎么处理：替换、追加还是按 id 合并？「深合并」不是一种唯一语义。\n\n复制嵌套结构时，[[dict(a)]] 和 [[{**a}]] 都是浅拷贝；子字典仍然共享。要独立副本，用 [[copy.deepcopy()]]，或者明确只复制需要改的那一层。JSON 序列化再反序列化也能得到深拷贝，但它会丢掉非 JSON 类型（元组变列表、日期变字符串），不要拿它当通用拷贝工具。`,
      code: String.raw`from collections import defaultdict
import copy

groups = defaultdict(list)
for name, cls in [("林晓", "A"), ("周宁", "B"), ("陈默", "A")]:
    groups[cls].append(name)
print(dict(groups))

nested = defaultdict(lambda: defaultdict(list))
nested["A"]["python"].append(91)
print({k: dict(v) for k, v in nested.items()})

a = {"scores": {"python": 91, "math": 88}, "name": "林晓"}
b = {"scores": {"python": 95}}
merged = {**a, **b}
print(merged)

deep = copy.deepcopy(a)
deep["scores"]["python"] = 99
print(a, deep)`,
      output: `{'A': ['林晓', '陈默'], 'B': ['周宁']}
{'A': {'python': [91]}}
{'scores': {'python': 95}, 'name': '林晓'}
{'scores': {'python': 91, 'math': 88}, 'name': '林晓'} {'scores': {'python': 99, 'math': 88}, 'name': '林晓'}`,
      tip: `[[defaultdict(defaultdict(list))]] 会让所有键共享同一个内层字典；必须传工厂 [[lambda: defaultdict(list)]]。`
    },
    {
      h: "序列化与键顺序：JSON、ensure_ascii 与版本兼容",
      p: `字典最常见的落盘格式是 JSON。[[json.dumps(obj, ensure_ascii=False, indent=2)]] 保留中文、带缩进，适合人看；[[ensure_ascii=True]] 把中文转成 [[\\uXXXX]]，适合只允许 ASCII 的通道。[[sort_keys=True]] 让键按字典序输出，方便 diff，但会丢掉插入顺序；是否需要稳定输出，取决于下游是「人」还是「机器」。\n\nJSON 只支持有限类型：对象、数组、字符串、数字、布尔、null。Python 的元组会变成数组，[[datetime]] 不能直接序列化，[[set]] 也不行。[[default=]] 可以提供一个转换函数，把未知类型转成可序列化值；但转换后的类型会丢失，反序列化时不会自动变回原类型。需要保留类型时，用带类型标记的包装，或者换 [[pickle]]/[[msgpack]]。\n\n键必须是字符串。JSON 规范要求对象的键是字符串，Python 的 [[json.dumps({1: "a"})]] 会把 1 转成 [[\"1\"]]，反序列化后得到字符串键；如果你原来用整数键，往返一次类型就变了。需要整数键时，序列化成数组 [[[[1, "a"]]]]，或者显式转换。不要假设 JSON 能无损保存 Python 字典。\n\n版本兼容要靠 schema，不是靠「多写几个 try」。给数据加版本字段 [[\"version\": 2]]，读取时按版本分支；新增字段给默认值，删除字段先保留读取兼容期。序列化格式是接口，一旦有别的程序消费，就不能随手改字段名。[[json.dump()]] 写文件时用 [[ensure_ascii=False]] 和 [[encoding=\"utf-8\"]]，否则中文可能变成转义序列，虽然能读但不利于排查。`,
      code: String.raw`import json
from datetime import datetime

data = {"name": "林晓", "scores": (91, 88), "when": datetime(2026, 11, 24)}
try:
    print(json.dumps(data, ensure_ascii=False))
except TypeError as err:
    print("序列化失败:", err)

def default(o):
    if isinstance(o, datetime):
        return o.isoformat()
    raise TypeError

print(json.dumps(data, ensure_ascii=False, default=default, sort_keys=True))
print(json.dumps({1: "a"}))
print(json.loads('{"1": "a"}'))`,
      output: `序列化失败: Object of type datetime is not JSON serializable
{"name": "林晓", "scores": [91, 88], "when": "2026-11-24T00:00:00"}
{"1": "a"}
{'1': 'a'}`,
      tip: `JSON 往返会把元组变列表、整数键变字符串；不要把它当成 Python 对象的无损快照。`
    }
  ],
  "ch4-3": [
    {
      h: "哈希集合：去重、成员判断与无序性",
      p: `集合和字典共享哈希表：元素按哈希放桶，成员判断平均 O(1)，去重也是 O(n)。集合的元素必须可哈希，所以列表、字典不能直接放进去；元组可以，但元组里不能有可变对象。[[set([1, 2, 2])]] 得到 [[{1, 2}]]，重复元素被哈希和相等判断合并。\n\n集合是无序的。打印顺序取决于哈希值和插入历史，同一份数据在不同进程里可能不同；不要依赖 [[list(s)[0]]] 取「第一个」。需要稳定顺序时，[[sorted(s)]] 或 [[list(dict.fromkeys(data))]]。集合的 [[pop()]] 删除并返回任意一个元素，不是「第一个」；需要按顺序删，用列表或 [[heapq]]。\n\n空集合只能写 [[set()]]，[["{}"]] 是空字典。这是语法层面的歧义，不是 bug。单元素集合写 [[{1}]]，不是 [[{1,}]]（后者也合法，但没必要）。集合推导式 [[{x for x in data}]] 和字典推导式 [[{k: v for ...}]] 长得像，注意冒号。\n\n集合的相等是「元素相同」，不是「顺序相同」。[[{1, 2} == {2, 1}]] 为 True；[[{1, 2} < {1, 2, 3}]] 表示子集关系，不是「小于」。用集合做权限判断时，[[required <= granted]] 很自然；但要把「缺失权限」打印出来，用 [[required - granted]]，不要只返回一个布尔值。`,
      code: String.raw`a = set([1, 2, 2, 3])
b = {3, 4}
print(a, b)
print(2 in a, 5 in a)
print(a & b, a | b, a - b, a ^ b)

print({1, 2} == {2, 1})
print({1, 2} < {1, 2, 3})

empty = set()
print(type(empty), type({}))

print(list(a)[0])
print(sorted(a))`,
      output: `{1, 2, 3} {3, 4}
True False
{3} {1, 2, 3, 4} {1, 2} {1, 2, 4}
True
True
<class 'set'> <class 'dict'>
1
[1, 2, 3]`,
      tip: `[[{}]] 是空字典不是空集合；空集合必须 [[set()]]。集合 [[pop()]] 返回任意元素，不要拿它当队列。`
    },
    {
      h: "集合运算：方法、运算符与性能",
      p: `集合支持 [[union]]、[[intersection]]、[[difference]]、[[symmetric_difference]]，也支持 [[| & - ^]] 运算符。运算符要求两边都是集合；方法接受任意可迭代对象，例如 [[a.union([3, 4])]]。方法通常更宽松，运算符更严格；选哪个取决于你想不想隐式转换。\n\n[[a | b]] 创建新集合，[[a |= b]] 原地更新 a；[[a.update(b)]] 也是原地。[[a & b]] 创建交集，[[a &= b]] 原地保留交集。原地操作在循环里能省内存，但会修改调用方传进来的集合；函数参数是集合时，先明确「我能不能改它」。不想改就返回新集合，或者先 [[copy()]]。\n\n集合运算的性能取决于实现。两个大集合求交，通常迭代较小的集合并检查成员，复杂度与较小集合大小相关；求差类似。不要把两个大列表转成集合再求交，除非你确实需要集合语义；转换本身是 O(n)，而且会丢掉重复和顺序。数据量很大时，先问「我能不能在读取时就去重/分组」，而不是先全量物化再运算。\n\n集合的不可变版本是 [[frozenset]]。它可以哈希，因此能当字典键，也能放进另一个集合。[[frozenset({1, 2})]] 一旦创建就不能改；需要「先构造再冻结」时，用普通 set 建好再转。frozenset 的运算返回 frozenset，不会意外变成可变集合。做缓存键、图算法里的节点集合时，优先 frozenset。`,
      code: String.raw`a = {1, 2, 3}
b = {3, 4}

print(a.union([4, 5]))
print(a | b)
a |= b
print(a)

a = {1, 2, 3}
a.intersection_update({2, 3, 4})
print(a)

fs = frozenset({1, 2})
print(hash(fs), fs | frozenset({3}))
print({fs: "ok"})

a = {1, 2}
print(a.issubset({1, 2, 3}), a.issuperset({1}))`,
      output: `{1, 2, 3, 4, 5}
{1, 2, 3, 4}
{1, 2, 3, 4}
{2, 3}
... 3 frozenset({1, 2, 3})
{'frozenset({1, 2})': 'ok'}
True True`,
      tip: `[[a.union([3])]] 接受列表，[[a | [3]]] 会抛 TypeError；方法更宽松，运算符更严格。`
    },
    {
      h: "去重的语义：完全相等、业务键与顺序",
      p: `去重前先定义「重复」。[[set(data)]] 按完全相等去重，元素必须可哈希；[[dict.fromkeys(data)]] 也按完全相等，但保留首次出现顺序；按业务键去重则要自己写：[[seen = set(); for r in records: key = r["sid"]; if key not in seen: ...]]。三种语义不同，结果也不同。\n\n[[dict.fromkeys()]] 对可变值有陷阱。[[dict.fromkeys(keys, [])]] 会让所有键共享同一个列表；这不是去重问题，是默认值共享问题。需要独立默认值时，用 [[{k: [] for k in keys}]]。去重记录时，[[dict.fromkeys(records)]] 要求记录可哈希；字典记录不可哈希，得先转成元组或业务键。\n\n集合去重会丢顺序，字典去重保留插入顺序。Python 3.7+ 的 dict 有序，所以 [[list(dict.fromkeys(items))]] 是「稳定去重」的常用写法；它比 [[sorted(set(items))]] 更保留原始顺序，但要求元素可哈希。元素不可哈希时，用列表 + 已见集合：[[seen = set(); out = []]]，键用业务字段，值保留原对象。\n\n去重后要校验数量。[[len(set(data))]] 与 [[len(data)]] 的差，可能说明数据有重复，也可能说明哈希/相等实现有问题。自定义对象做去重时，先写两个内容相同、id 不同的对象，验证它们是否真的相等；不要等上线后才发现「去重没生效」。`,
      code: String.raw`items = ["b", "a", "b", "c", "a"]
print(list(set(items)))
print(list(dict.fromkeys(items)))

records = [
    {"sid": "S01", "score": 91},
    {"sid": "S01", "score": 95},
    {"sid": "S02", "score": 88},
]
seen = set()
out = []
for r in records:
    if r["sid"] not in seen:
        seen.add(r["sid"])
        out.append(r)
print(out)

keys = ["a", "b"]
shared = dict.fromkeys(keys, [])
shared["a"].append(1)
print(shared)
independent = {k: [] for k in keys}
independent["a"].append(1)
print(independent)`,
      output: `['b', 'a', 'c']
['b', 'a', 'c']
[{'sid': 'S01', 'score': 91}, {'sid': 'S02', 'score': 88}]
{'a': [1], 'b': [1]}
{'a': [1], 'b': []}`,
      tip: `[[dict.fromkeys(keys, [])]] 共享同一个列表；需要独立默认值时用字典推导式 [[{k: [] for k in keys}]]。`
    }
  ]
});

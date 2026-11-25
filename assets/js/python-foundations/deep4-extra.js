window.PY_FOUNDATIONS_DEEP2 = Object.assign(window.PY_FOUNDATIONS_DEEP2 || {}, {
  "ch4-1": [
    {
      h: "动手实验：用字典做学号索引",
      p: `把学生列表转成「学号 → 记录」的字典，再按学号查、改、删。重点观察：键重复时后值覆盖前值；[[get()]] 和 [[]] 对缺失键的行为不同；遍历字典得到键，[[items()]] 才拿到键值对。`,
      code: String.raw`students = [
    {"sid": "S01", "name": "林晓", "score": 91},
    {"sid": "S02", "name": "周宁", "score": 88},
    {"sid": "S01", "name": "林晓", "score": 95},
]
index = {s["sid"]: s for s in students}
print(index["S01"])
print(index.get("S99"))
print("S99" in index)

index["S03"] = {"sid": "S03", "name": "陈默", "score": 76}
del index["S02"]
print(list(index.keys()))
print([(k, v["score"]) for k, v in index.items()])`,
      output: `{'sid': 'S01', 'name': '林晓', 'score': 95}
None
False
['S01', 'S03']
[('S01', 95), ('S03', 76)]`,
      tip: `字典推导式遇到重复键会静默覆盖；需要检测重复学号时，先用普通循环记录冲突，不要直接一把梭。`
    },
    {
      h: "复盘卡：字典的读取、更新与顺序",
      p: `字典四件事：键必须可哈希；[[]] 缺失抛 KeyError，[[get()]] 返回默认；[[setdefault()]] 会插入，[[defaultdict]] 会惰性建默认值；遍历顺序是插入顺序。把这四件记住，大部分字典问题都能定位。\n\n自测：[[{[]: 1}]] 能创建吗？不能，列表不可哈希。[[d.get("x")]] 会插入 x 吗？不会。[[setdefault("x", [])]] 会插入吗？会。删除后顺序会怎样？其余键保持相对插入顺序，但不要依赖复杂的删除/重插顺序。\n\n常见误区：用 [[d["x"]] += 1]] 给缺失键计数；用可变对象做键；以为字典按哈希排序；用 [[list(d)]] 取「第一个值」（那是键）。计数用 [[defaultdict(int)]] 或 [[get(k, 0) + 1]]。`,
      tip: `[[d["x"]] += 1]] 在键不存在时先抛 KeyError；计数用 [[d[k] = d.get(k, 0) + 1]] 或 [[defaultdict(int)]]。`
    }
  ],
  "ch4-2": [
    {
      h: "动手实验：按班级聚合嵌套记录",
      p: `给每个学生加班级字段，用 [[defaultdict(list)]] 按班级分组，再算每班平均分。重点看「记录结构」和「聚合结构」的差别：记录是 [[{"name":..., "scores":...}]]，聚合是 [[{class: [records]}]]。不要把两者混成一个四层嵌套。`,
      code: String.raw`from collections import defaultdict

students = [
    {"name": "林晓", "class": "A", "scores": {"python": 91, "math": 88}},
    {"name": "周宁", "class": "B", "scores": {"python": 86, "math": 92}},
    {"name": "陈默", "class": "A", "scores": {"python": 78, "math": 85}},
]

by_class = defaultdict(list)
for s in students:
    by_class[s["class"]].append(s)

for cls, rows in by_class.items():
    avg = sum(r["scores"]["python"] for r in rows) / len(rows)
    print(cls, len(rows), round(avg, 1), [r["name"] for r in rows])`,
      output: `A 2 84.5 ['林晓', '陈默']
B 1 86.0 ['周宁']`,
      tip: `聚合结构只放「分组键 + 记录列表」，不要在聚合层再复制一份完整记录；需要时用引用，不需要时用 id。`
    },
    {
      h: "复盘卡：嵌套数据的建模与缺失",
      p: `建模三问：这条记录有哪些字段？哪些字段可能缺失？按什么键查找/分组？字段少而固定，用 dict；字段多且需要约束，用 dataclass；需要序列化，保证字段都是 JSON 类型。嵌套层级控制在三层以内，再深就拆表或拆对象。\n\n自测：[[d.get("a", {}).get("b")]] 在 a 是 None 时会怎样？抛 AttributeError，因为 None 没有 get。[[{**a, **b}]] 是深合并吗？不是，只合并顶层。[[defaultdict(list)]] 访问缺失键会插入吗？会。[[copy.deepcopy()]] 能复制所有对象吗？不能，文件/连接/锁不行。\n\n常见误区：用链式 get 掩盖数据损坏；把所有缺失都变成 None；深合并时数组语义不清；用 JSON 往返做深拷贝。缺失要有业务含义，合并要有明确规则，拷贝要看资源类型。`,
      tip: `[[d.get("a", {}).get("b")]] 在 a 存在但值为 None 时仍会炸；多层读取要么逐层判断，要么写 safe_get。`
    }
  ],
  "ch4-3": [
    {
      h: "动手实验：用集合做选课交集",
      p: `给两个学生各自的课程集合，求共同课程、并集、差集。再用 [[frozenset]] 做字典键，观察它为什么可哈希。重点是把集合运算和「权限/标签/去重」场景连起来，而不是只记符号。`,
      code: String.raw`a = {"Python", "数学", "英语"}
b = {"Python", "物理", "英语"}

print("共同:", a & b)
print("全部:", a | b)
print("a 独有:", a - b)
print("对称差:", a ^ b)

fs = frozenset(a)
print({fs: "课程组"})

print(len(a), len(a | b))
print("Python" in a, "化学" in a)`,
      output: `共同: {'Python', '英语'}
全部: {'Python', '数学', '英语', '物理'}
a 独有: {'数学'}
对称差: {'数学', '物理'}
{'frozenset({...})': '课程组'}
3 4
True False`,
      tip: `集合打印顺序不稳定；需要固定输出时 [[sorted(a & b)]]，不要依赖 [[list(set)[0]]]。`
    },
    {
      h: "复盘卡：集合的语义与性能",
      p: `集合三件事：元素可哈希；元素唯一；顺序不保证。适合去重、成员判断、集合运算；不适合按顺序取第几个、存重复、存不可哈希对象。需要顺序去重用 [[dict.fromkeys()]]，需要不可变集合用 [[frozenset]]。\n\n自测：[[{}]] 是什么？空字典。[[set("abc")]] 得到什么？三个字符的集合。[[a | [1]]] 能运行吗？不能，运算符要求集合。[[a.union([1])]] 能运行吗？能，方法接受可迭代对象。[[frozenset]] 能当字典键吗？能。\n\n常见误区：用集合当队列；用 [[pop()]] 取「第一个」；用集合去重后还想要原顺序；把列表塞进集合。先问「我要唯一性、顺序还是成员判断」，再选容器。`,
      tip: `集合 [[pop()]] 删除任意元素；需要按顺序取，用列表/堆，不要用集合。`
    }
  ]
});

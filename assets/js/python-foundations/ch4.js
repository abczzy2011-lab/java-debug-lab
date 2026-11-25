window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch4",
  part: 1,
  number: "04",
  title: "字典、集合与查找",
  summary: "列表按位置存数据，字典按键存数据，集合只关心「在不在」。本章把三种容器的选择逻辑讲清楚：什么时候用字典建模，什么时候用集合去重，为什么键必须可哈希，以及嵌套字典为什么会在缺键时炸掉。",
  goals: [
    "能区分字典、列表和集合的适用场景",
    "能安全读取缺失键，不再被 KeyError 打断",
    "能用嵌套字典表达学生、班级和成绩",
    "能用集合运算做去重、交集和差集"
  ],
  lessons: [
    {
      id: "ch4-1",
      title: "4.1 字典的键值模型",
      minutes: 40,
      lead: "字典是 Python 里最重要的数据建模工具之一。它把「名字」映射到「值」，查找接近 O(1)。这一节先建立键值模型，再讲清楚键的限制、读取的两种方式、增删改的常用方法，以及为什么字典能保持插入顺序。",
      source: "Introducing Python 3rd · Ch.7；Beginning Python 4th · Ch.4；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "字典是键值映射，不是「带名字的列表」",
          p: `字典用花括号写：[[{"name": "林晓", "score": 91}]]。它不是「下标是字符串的列表」，而是一张哈希表：每个键通过哈希函数定位到槽位，值存在槽位里。查找、插入、删除平均是 O(1)，而列表按值查找是 O(n)。

键必须唯一。给同一个键重复赋值，后一次覆盖前一次；不会出现两个同名键。值可以是任意对象，包括列表、字典、函数。键和值的角色不能反：键是「标签」，值是被标签指向的内容。

Python 3.7 以后，字典保持插入顺序：你按什么顺序插入键，遍历时就按什么顺序返回。这个顺序是语言保证，不是实现巧合。需要按字母排序时，仍然要 [[sorted(d)]] 或 [[sorted(d.items())]]。`,
          code: `student = {"name": "林晓", "score": 91}
print(student["name"])
print(student.get("score"))
print(len(student))

student["score"] = 95
print(student)

for key in student:
    print(key, student[key])`,
          output: `林晓
91
2
{'name': '林晓', 'score': 95}
name 林晓
score 95`,
          tip: `字典保持插入顺序，但「插入顺序」不等于「排序」；要按字母/数字排序，显式 [[sorted()]]。`
        },
        {
          h: "键必须可哈希：字符串、数字、元组可以，列表不行",
          p: `字典的键必须是**可哈希**对象。可哈希意味着对象有一个稳定的哈希值，并且在相等比较时行为一致。字符串、整数、浮点数、布尔、元组（元素都可哈希）都可以；列表、字典、集合不可以，因为它们是可变的，哈希值会变。

[[{["name"]: "林晓"}]] 会抛 [[TypeError: unhashable type: 'list']]。如果你确实想用一组值做键，把它转成元组：[[{("林晓", "Python"): 91}]]。元组只要元素都可哈希，整体就可哈希。

浮点数做键要小心：[[0.1 + 0.2]] 和 [[0.3]] 不相等，哈希也不同；[[1]] 和 [[1.0]] 相等，哈希相同，所以它们会被视为同一个键。布尔是整数的子类，[[True]] 和 [[1]] 也会碰撞。业务上尽量避免用浮点和布尔做键。`,
          code: `d = {}
d["name"] = "林晓"
d[1] = "one"
d[(1, 2)] = "tuple key"
print(d)

try:
    d[["name"]] = "bad"
except TypeError as exc:
    print("TypeError:", exc)

print({1: "int", 1.0: "float", True: "bool"})`,
          output: `{'name': '林晓', 1: 'one', (1, 2): 'tuple key'}
TypeError: unhashable type: 'list'
{1: 'bool'}`,
          tip: `[[1]]、[[1.0]]、[[True]] 会被视为同一个键；需要区分布尔和整数时，不要拿它们做键。`
        },
        {
          h: "读取：[] 与 get 的差别，KeyError 怎么处理",
          p: `[[d[key]]] 在键不存在时抛 [[KeyError]]；[[d.get(key)]] 返回值 [[None]]，[[d.get(key, default)]] 返回你给的默认值。两者不是「一个安全一个不安全」，而是「你希望缺键时发生什么」：如果是程序错误，让 [[KeyError]] 暴露；如果是可选字段，用 [[get]]。

[[if key in d:]] 再取值是常见写法，但会做两次查找。更简洁的是 [[d.get(key, default)]]。注意默认值只在缺键时使用，不会写回字典；[[d.get("x", [])]] 每次都可能创建一个新列表，但不会保存。

[[setdefault(key, default)]] 不一样：键存在就返回旧值，键不存在就写入默认值并返回。它适合「第一次遇到就初始化」的场景，比如按班级收集学生。[[defaultdict(list)]] 是更彻底的版本，读取不存在的键会自动创建空列表。`,
          code: `d = {"name": "林晓"}
print(d.get("score"))
print(d.get("score", 0))

print(d.setdefault("score", 90))
print(d)

try:
    print(d["missing"])
except KeyError as exc:
    print("KeyError:", exc)`,
          output: `None
0
90
{'name': '林晓', 'score': 90}
KeyError: 'missing'`,
          tip: `[[get()]] 不会写入字典；[[setdefault()]] 会写入。需要「缺键就建」时用 [[setdefault]] 或 [[defaultdict]]。`
        },
        {
          h: "增改删：赋值、update、setdefault、pop",
          p: `新增或修改都用一个语法：[[d[key] = value]]。键存在就覆盖，不存在就插入。[[d.update(other)]] 把另一个字典的键值批量写进来，已存在的键被覆盖；它也可以接收 [[(key, value)]] 对的可迭代对象。

删除用 [[del d[key]]]、[[d.pop(key)]] 或 [[d.popitem()]]。[[pop(key, default)]] 在键不存在时返回默认值，不抛异常；[[popitem()]] 删除并返回最后一个插入的键值对（Python 3.7+ 是 LIFO 顺序）。[[clear()]] 清空。

不要把「删除一个键」和「把值设为 None」混为一谈。[[d[key] = None]] 仍然保留键，[[len(d)]] 不变；[[del d[key]]] 才真正移除。统计、序列化、缺省判断都会受这个差别影响。`,
          code: `d = {"a": 1, "b": 2}
d["c"] = 3
d.update({"b": 20, "d": 4})
print(d)

print(d.pop("d"))
print(d.pop("z", 0))
print(d)

del d["a"]
print(d)
print(d.popitem())
print(d)`,
          output: `{'a': 1, 'b': 20, 'c': 3, 'd': 4}
4
0
{'a': 1, 'b': 20, 'c': 3}
{'b': 20, 'c': 3}
('c', 3)
{'b': 20}`,
          tip: `[[d[key] = None]] 保留键；[[del d[key]]] 移除键。[[popitem()]] 删除的是最后插入的键，不是最大键。`
        },
        {
          h: "遍历：keys、values、items 与插入顺序",
          p: `直接 [[for key in d]] 遍历键；[[d.keys()]] 返回键视图，[[d.values()]] 返回值视图，[[d.items()]] 返回 [[(key, value)]] 对视图。视图是动态的：你改字典，视图内容跟着变；它不是一次性拷贝。

遍历时同时拿键和值，用 [[for key, value in d.items()]]。只拿值用 [[d.values()]]，但要拿对应的键还是得 [[items()]]。[[len(d)]] 是键值对数量，不是值的数量；值可以重复，键不能。

遍历时不要增删键。[[RuntimeError: dictionary changed size during iteration]] 就是在循环里插入或删除键的典型报错。要改，先收集要删的键，循环结束后再删；或者遍历 [[list(d.items())]] 的副本。`,
          code: `d = {"林晓": 91, "陈默": 76, "周宁": 88}

for key in d:
    print(key)

for name, score in d.items():
    print(name, score)

print(list(d.keys()))
print(list(d.values()))
print(sum(d.values()) / len(d))`,
          output: `林晓
陈默
周宁
林晓 91
陈默 76
周宁 88
['林晓', '陈默', '周宁']
[91, 76, 88]
85.0`,
          tip: `[[d.items()]] 是视图，不是列表；要保存快照用 [[list(d.items())]]。遍历时不要改字典大小。`
        }
      ],
      points: [
        "字典是哈希表，按键查找平均 O(1)",
        "键必须可哈希，列表/字典/集合不能做键",
        "[[1]]、[[1.0]]、[[True]] 会被视为同一个键",
        "[[get()]] 不写入，[[setdefault()]] 会写入",
        "[[d[key] = None]] 保留键，[[del]] 才移除",
        "字典保持插入顺序，但插入顺序不是排序"
      ],
      practice: "写一个 `count_words(text)`：用字典统计每个单词出现次数。先按空格切分，再统一小写，最后按次数降序输出前 5 个。"
    },
    {
      id: "ch4-2",
      title: "4.2 嵌套字典与数据建模",
      minutes: 45,
      lead: "真实数据很少是「一层键值对」。一个班级有多个学生，一个学生有多门成绩，成绩里还可能有缺考标记。这一节讲怎么用嵌套字典表达层级，怎么在缺键时不炸，以及 dict-of-dicts 和 list-of-dicts 该怎么选。",
      source: "Introducing Python 3rd · Ch.7；Beginning Python 4th · Ch.4；Head First Python 3rd · Ch.3–4",
      sections: [
        {
          h: "用字典表达一条学生记录",
          p: `一条学生记录可以写成 [[{"name": "林晓", "class": "A", "scores": {"python": 91, "math": 84}}]]。外层字典是记录，内层字典是科目到分数的映射。键是字段名，值可以是字符串、数字、列表、字典。

这种结构的优点是自描述：读代码的人看到 [["scores"]] 就知道里面是成绩，不需要记「第 2 个元素是数学」。缺点是字段名写错不会在赋值时报错，只会在读取时抛 [[KeyError]]；所以字段名最好集中定义，或者用 [[dataclass]] / [[TypedDict]] 做约束。

不要把所有东西都塞进一个巨大的嵌套字典。层级超过三层，访问路径变成 [["data"]["classes"]["A"]["students"][0]["scores"]["python"]]]，可读性会迅速下降。该用列表的地方用列表，该用对象的地方用对象。`,
          code: `student = {
    "name": "林晓",
    "class": "A",
    "scores": {"python": 91, "math": 84, "english": 88},
}

print(student["name"])
print(student["scores"]["python"])
print(student["scores"].get("science", "未选"))

student["scores"]["math"] = 90
print(student)`,
          output: `林晓
91
未选
{'name': '林晓', 'class': 'A', 'scores': {'python': 91, 'math': 90, 'english': 88}}`,
          tip: `嵌套字典访问链越长，越要提前检查中间层是否存在；不要假设每一层都一定有键。`
        },
        {
          h: "嵌套字典：dict of dicts 与 list of dicts",
          p: `表达「多个学生」有两种常见结构。第一种是 [[dict of dicts]]：外层键是学号或姓名，内层是记录。[[students["S01"]["name"]]] 查找快，适合按 ID 随机访问。第二种是 [[list of dicts]]：每个元素是一条记录，适合按顺序遍历、排序、输出表格。

选择标准是「你主要按什么访问」。按 ID 查一个人，用 dict of dicts；要按成绩排序、逐行打印，用 list of dicts。两者也能组合：列表保存顺序，字典做索引，但要注意两份数据同步更新，别改了一份忘了另一份。

dict of dicts 的遍历是 [[for sid, student in students.items()]]；list of dicts 的遍历是 [[for student in students]]。不要用 [[students[0]["name"]]] 去访问 dict of dicts，除非键恰好是 0。`,
          code: `students_by_id = {
    "S01": {"name": "林晓", "score": 91},
    "S02": {"name": "陈默", "score": 76},
}
print(students_by_id["S01"]["name"])

students = [
    {"id": "S01", "name": "林晓", "score": 91},
    {"id": "S02", "name": "陈默", "score": 76},
]
for student in sorted(students, key=lambda s: s["score"], reverse=True):
    print(student["name"], student["score"])`,
          output: `林晓
林晓 91
陈默 76`,
          tip: `按 ID 查用 dict of dicts，按顺序遍历/排序用 list of dicts；不要为了「统一」强行选一种。`
        },
        {
          h: "缺失键与 setdefault / defaultdict",
          p: `嵌套字典最常见的崩溃，是中途某一层不存在。[[data["classes"]["A"]["students"].append(...)]] 只要 [["A"]] 不存在，就抛 [[KeyError]]。可以用 [[setdefault]] 逐层建：[[data.setdefault("classes", {}).setdefault("A", {}).setdefault("students", []).append(x)]]，但这串太长，读起来费劲。

[[collections.defaultdict]] 更干净：[[defaultdict(list)]] 在缺键时自动创建空列表，[[defaultdict(dict)]] 自动创建空字典。注意它只处理「最外层」的缺键，嵌套的 [[defaultdict(dict)]] 里再缺键，仍需要内层也是 defaultdict 或手动初始化。

[[setdefault]] 适合一次性初始化，[[defaultdict]] 适合反复按同一模式分组。两者都会**写入**字典；如果你只是想读取缺省值而不改变原数据，用 [[get]]。`,
          code: `from collections import defaultdict

data = defaultdict(lambda: defaultdict(list))
data["A"]["林晓"].append(91)
data["A"]["陈默"].append(76)
data["B"]["周宁"].append(88)

print(dict(data["A"]))
print(data["C"])  # 自动创建空字典`,
          output: `{'林晓': [91], '陈默': [76]}
defaultdict(<class 'list'>, {})`,
          tip: `[[defaultdict]] 读取缺键会写入；只想读取不修改，用 [[get()]]。嵌套 defaultdict 要每层都设置工厂函数。`
        },
        {
          h: "合并、复制与浅拷贝",
          p: `两个字典合并，最直接是 [[d1.update(d2)]]，原地修改 [[d1]]，重复键由 [[d2]] 覆盖。Python 3.9 以后可以用 [[d1 | d2]] 返回新字典，[[d1 |= d2]] 原地更新。[[{**d1, **d2}]] 也是返回新字典的常用写法。

浅拷贝 [[d.copy()]] 只复制外层：内层字典仍然共享。[[copy.deepcopy()]] 才递归复制。合并嵌套字典时，[[d1.update(d2)]] 会把整个内层字典替换掉，而不是逐键合并；要逐键合并，需要手写循环或递归函数。

合并前先想清楚冲突策略：后值覆盖前值、保留前值、还是报错？不要默认「覆盖」是业务想要的。成绩表合并时，重复学号可能意味着数据错误，静默覆盖会丢记录。`,
          code: `d1 = {"a": 1, "nested": {"x": 1}}
d2 = {"b": 2, "nested": {"y": 2}}

merged = d1 | d2
print(merged)

merged["nested"]["x"] = 9
print("原 d1 内层也被改:", d1)

import copy
deep = copy.deepcopy(d1)
deep["nested"]["x"] = 7
print("深拷贝后 d1:", d1)`,
          output: `{'a': 1, 'nested': {'y': 2}, 'b': 2}
原 d1 内层也被改: {'a': 1, 'nested': {'x': 9}}
深拷贝后 d1: {'a': 1, 'nested': {'x': 9}}`,
          tip: `[[d1 | d2]] 是浅合并，嵌套字典会被整体替换；要递归合并得自己写函数。`
        },
        {
          h: "小任务：按班级统计成绩",
          p: `给一个 [[list of dicts]]，每条记录有 [["class"]]、[["name"]]、[["score"]]。要求输出每个班的平均分、最高分、人数，按平均分降序。这个任务练「分组」：用字典把班级映射到分数列表，再对每组做统计。

分组时用 [[setdefault]] 或 [[defaultdict(list)]]。不要用 [[if class in result]] 加 [[append]] 的两段式，虽然能跑，但重复代码多。统计完成后，把结果转成 [[list of dicts]] 再排序，输出更整齐。

边界要考虑：空班级、缺 [["score"]] 的记录、分数不是数字。入门阶段可以先假设数据干净，但要在注释里写清楚假设；真实项目里，假设就是 bug 的入口。`,
          code: `from collections import defaultdict

rows = [
    {"class": "A", "name": "林晓", "score": 91},
    {"class": "A", "name": "陈默", "score": 76},
    {"class": "B", "name": "周宁", "score": 88},
]

groups = defaultdict(list)
for row in rows:
    groups[row["class"]].append(row["score"])

summary = []
for klass, scores in groups.items():
    summary.append({
        "class": klass,
        "count": len(scores),
        "avg": sum(scores) / len(scores),
        "max": max(scores),
    })

summary.sort(key=lambda item: item["avg"], reverse=True)
for item in summary:
    print(item)`,
          output: `{'class': 'A', 'count': 2, 'avg': 83.5, 'max': 91}
{'class': 'B', 'count': 1, 'avg': 88.0, 'max': 88}`,
          tip: `分组用 [[defaultdict(list)]]；统计结果转成 dict 列表再排序，比在嵌套字典里直接排更清楚。`
        }
      ],
      points: [
        "字典适合自描述记录，但层级不要超过两三层",
        "按 ID 查用 dict of dicts，按顺序遍历用 list of dicts",
        "[[setdefault]] 和 [[defaultdict]] 都会写入缺键",
        "[[copy()]] 是浅拷贝，嵌套字典仍共享",
        "[[d1 | d2]] 是浅合并，重复键由右边覆盖",
        "分组统计用 [[defaultdict(list)]]，再转列表排序"
      ],
      practice: "把 `summary` 改成按「班级 + 是否及格」分组，输出每组的及格率；先想清楚分组键是元组还是拼接字符串，并说明理由。"
    },
    {
      id: "ch4-3",
      title: "4.3 集合、去重与集合运算",
      minutes: 40,
      lead: "集合只关心成员关系：在不在、有没有重复、两个集合的交集是什么。它用哈希表实现，成员判断平均 O(1)，比列表的 O(n) 快得多。这一节讲集合的创建、运算、可变性与可哈希边界。",
      source: "Introducing Python 3rd · Ch.7；Beginning Python 4th · Ch.4；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "集合是什么：去重与 O(1) 查找",
          p: `集合用花括号写：[[{1, 2, 3}]]。它无序、元素唯一、元素必须可哈希。你不能用下标访问，也不能切片；但可以 [[x in s]]、[[len(s)]]、迭代。集合的核心价值是成员判断和去重，不是「保存顺序」。

[[set([1, 2, 2, 3])]] 得到 [[{1, 2, 3}]]。[[set("hello")]] 得到字符集合 [[{'h', 'e', 'l', 'o'}]]，重复的 l 被去掉。把列表转成集合再去重，是最常用的技巧；但集合不保证顺序，转回列表后顺序可能变。

集合的哈希实现意味着查找快，但元素必须可哈希。列表不能放进集合；元组可以（元素都可哈希）。集合本身可变，所以不能放进另一个集合；需要嵌套时用 [[frozenset]]。`,
          code: `s = {1, 2, 2, 3}
print(s)
print(len(s))
print(2 in s)

chars = set("hello")
print(chars)

try:
    {[1, 2]}
except TypeError as exc:
    print("TypeError:", exc)`,
          output: `{1, 2, 3}
3
True
{'h', 'e', 'l', 'o'}
TypeError: unhashable type: 'list'`,
          tip: `集合无序，不要依赖输出顺序；需要顺序去重时，用 [[dict.fromkeys(items)]] 再转列表。`
        },
        {
          h: "创建集合与空集合的坑",
          p: `空集合必须写 [[set()]]，不能写 [[{}]]。[[{}]] 是空字典，不是空集合。这是 Python 里最经典的「看起来一样、类型不同」之一。单元素集合写 [[{1}]]，不是 [[{1,}]]（虽然合法，但没必要）。

集合推导式写 [[{x for x in items}]]，和列表推导式类似，但结果去重且无序。不要用 [[set()]] 包一个生成器再转列表，除非你确实需要去重；那会丢掉顺序。

从字符串创建集合会拆成字符，从字典创建集合会取键。[[set({"a": 1})]] 得到 [[{'a'}]]，不是键值对。想取字典的值，用 [[set(d.values())]]。`,
          code: `print(type({}))
print(type(set()))
print({1})
print({x for x in [1, 2, 2, 3]})

print(set({"a": 1, "b": 2}))
print(set({"a": 1, "b": 2}.values()))`,
          output: `<class 'dict'>
<class 'set'>
{1}
{1, 2, 3}
{'a', 'b'}
{1, 2}`,
          tip: `[[{}]] 是空字典，空集合只能 [[set()]]；字典转集合默认取键。`
        },
        {
          h: "集合运算：并、交、差、对称差",
          p: `集合支持四种基本运算：并集 [[a | b]] 或 [[a.union(b)]]，交集 [[a & b]] 或 [[a.intersection(b)]]，差集 [[a - b]] 或 [[a.difference(b)]]，对称差 [[a ^ b]] 或 [[a.symmetric_difference(b)]]。运算符返回新集合，方法也返回新集合；对应的 [[update]] 系列才原地修改。

差集有方向：[[a - b]] 是「在 a 不在 b」，[[b - a]] 是反过来。对称差是「只在其中一个集合里」，等价于 [[(a - b) | (b - a)]]。交集适合找共同选课，差集适合找「选了 A 没选 B」的学生。

子集和超集用 [[a <= b]]、[[a < b]]、[[a >= b]]、[[a > b]]，或者 [[issubset]] / [[issuperset]]。注意 [[<=]] 在这里不是数值比较，而是包含关系。`,
          code: `a = {"林晓", "陈默", "周宁"}
b = {"陈默", "周宁", "赵一"}

print(a | b)
print(a & b)
print(a - b)
print(b - a)
print(a ^ b)
print({"陈默"} <= a)`,
          output: `{'林晓', '陈默', '周宁', '赵一'}
{'陈默', '周宁'}
{'林晓'}
{'赵一'}
{'林晓', '赵一'}
True`,
          tip: `差集有方向；[[a - b]] 和 [[b - a]] 完全不同。[[<=]] 在集合里表示子集，不是小于等于。`
        },
        {
          h: "可变集合、不可变集合与可哈希",
          p: `[[set]] 可变，支持 [[add]]、[[remove]]、[[discard]]、[[update]]、[[clear]]。[[remove(x)]] 在元素不存在时抛 [[KeyError]]；[[discard(x)]] 不抛。[[pop()]] 随机删除一个元素并返回，因为集合无序，不要假设它会删哪个。

[[frozenset]] 是不可变集合，创建后不能改，因此可哈希，可以放进另一个集合，也可以做字典键。[[frozenset([1, 2])]] 是合法键；[[set([1, 2])]] 不行。需要「集合的集合」时，用 frozenset。

集合元素必须可哈希，所以集合里不能放列表、字典、可变集合。你可以把列表转成元组再放进去：[[{(1, 2), (3, 4)}]]。但元组里的元素也必须可哈希；包含列表的元组仍然不行。`,
          code: `s = {1, 2}
s.add(3)
s.discard(9)
print(s)

fs = frozenset([1, 2])
print(fs)
print({fs, frozenset([3])})

try:
    {[1, 2]}
except TypeError as exc:
    print("TypeError:", exc)`,
          output: `{1, 2, 3}
frozenset({1, 2})
{frozenset({1, 2}), frozenset({3})}
TypeError: unhashable type: 'list'`,
          tip: `[[set.remove()]] 缺元素会抛 [[KeyError]]；[[discard()]] 不会。要嵌套集合用 [[frozenset]]。`
        },
        {
          h: "小任务：标签去重与共同选课",
          p: `给两个学生的选课列表，求共同课程、只属于第一个人的课程、只属于第二个人的课程。先把列表转成集合，再做交、差、对称差。输出时排序，保证结果稳定。

这个任务也适合练「去重但保留顺序」：如果用户希望按选课顺序展示，不要直接把集合转列表，改用 [[dict.fromkeys(courses)]]；它利用字典键唯一且保持插入顺序。

最后检查：空列表、重复课程、大小写不一致。课程名最好先 [[strip().lower()]] 统一，再做集合运算；否则 [["Math"]] 和 [["math"]] 会被当成两门课。`,
          code: `alice = ["Python", "Math", "English", "Math"]
bob = ["math", "English", "Art"]

a = {course.strip().lower() for course in alice}
b = {course.strip().lower() for course in bob}

print("共同:", sorted(a & b))
print("仅 Alice:", sorted(a - b))
print("仅 Bob:", sorted(b - a))

ordered = list(dict.fromkeys(course.strip().lower() for course in alice))
print("按原顺序去重:", ordered)`,
          output: `共同: ['english', 'math']
仅 Alice: ['python']
仅 Bob: ['art']
按原顺序去重: ['python', 'math', 'english']`,
          tip: `集合运算前先统一大小写和空白；要保留原顺序去重，用 [[dict.fromkeys()]]，不要用 [[set]]。`
        }
      ],
      points: [
        "集合无序、元素唯一、元素必须可哈希",
        "空集合是 [[set()]]，[[{}]] 是空字典",
        "集合成员判断平均 O(1)，列表是 O(n)",
        "并/交/差/对称差用 [[| & - ^]]，差集有方向",
        "[[set.remove()]] 缺元素抛 [[KeyError]]，[[discard()]] 不抛",
        "嵌套集合用 [[frozenset]]；列表不能做集合元素"
      ],
      practice: "写一个 `common_courses(a, b)`，返回共同课程和只属于一方的课程；要求输出排序，并处理大小写与前后空格。"
    }
  ]
});

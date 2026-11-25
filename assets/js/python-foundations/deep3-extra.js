window.PY_FOUNDATIONS_DEEP2 = Object.assign(window.PY_FOUNDATIONS_DEEP2 || {}, {
  "ch3-1": [
    {
      h: "动手实验：维护一个成绩列表",
      p: `从空列表开始，依次追加、插入、删除、按值删除，观察长度和内容。重点看 [[append()]] 与 [[extend()]] 的差别：前者加一个元素，后者把可迭代对象逐个加进去；[[insert()]] 越界不会报错，会插到末尾；[[pop()]] 不传下标删最后一个。`,
      code: String.raw`scores = []
scores.append(91)
scores.append([88, 76])
print(scores, len(scores))

scores = [91]
scores.extend([88, 76])
print(scores, len(scores))

scores.insert(1, 85)
print(scores)
scores.insert(100, 60)
print(scores)

scores.remove(85)
print(scores.pop(), scores)`,
      output: `[91, [88, 76]] 2
[91, 88, 76] 3
[91, 85, 88, 76]
[91, 85, 88, 76, 60]
76 [91, 88, 60]`,
      tip: `[[append(x)]] 把 x 当一个元素；[[extend(xs)]] 把 xs 拆开逐个加。追加一个列表时，先确认你要的是哪一种。`
    },
    {
      h: "复盘卡：列表操作的复杂度与选择",
      p: `记四个数字：尾部 append/pop 均摊 O(1)，按下标读写 O(1)，按值查找/删除 O(n)，头部插入/删除 O(n)。需要频繁两端操作，用 [[deque]]；需要按值快速判断存在，用 [[set]]；需要按 key 查找，用 [[dict]]。列表不是万能容器。\n\n自测：[[insert(0, x)]] 为什么慢？后面元素整体右移。[[remove(x)]] 找不到会怎样？抛 ValueError。[[a[:]]] 是深拷贝吗？不是，只复制外层。遍历时删元素为什么会跳过？迭代器下标仍在前进。\n\n常见误区：用 [[append]] 加列表；用 [[pop(0)]] 当队列；用 [[in]] 在大列表里反复查；以为切片复制了内层对象。选结构前先列出「最频繁的三个操作」，再谈优化。`,
      tip: `[[pop(0)]] 是 O(n)，[[deque.popleft()]] 是 O(1)；需要队列就用 [[collections.deque]]。`
    }
  ],
  "ch3-2": [
    {
      h: "动手实验：按平均分排序并复制",
      p: `给三条记录算平均分，用 [[sorted(key=...)]] 排序，再用 [[sort()]] 原地排序。然后做一个浅拷贝，修改内层列表，观察原数据是否变化。这个实验同时练「排序键」和「拷贝层级」，两者都是成绩表的高频操作。`,
      code: String.raw`records = [
    {"name": "林晓", "scores": [91, 88]},
    {"name": "周宁", "scores": [86, 92]},
    {"name": "陈默", "scores": [78, 85]},
]
for r in records:
    r["avg"] = sum(r["scores"]) / len(r["scores"])

ranked = sorted(records, key=lambda r: (-r["avg"], r["name"]))
print([(r["name"], round(r["avg"], 1)) for r in ranked])

copy1 = [dict(r) for r in records]
copy1[0]["scores"].append(100)
print(records[0]["scores"], copy1[0]["scores"])

import copy
deep = copy.deepcopy(records)
deep[0]["scores"].append(100)
print(records[0]["scores"], deep[0]["scores"])`,
      output: `[('林晓', 89.5), ('周宁', 89.0), ('陈默', 81.5)]
[91, 88] [91, 88, 100]
[91, 88] [91, 88, 100]`,
      tip: `[[dict(r)]] 只复制外层字典，内层 [[scores]] 仍共享；需要独立嵌套结构时用 [[copy.deepcopy()]]。`
    },
    {
      h: "复盘卡：排序与拷贝的边界",
      p: `排序三问：按什么键？升序还是降序？同分怎么办？拷贝三问：要不要独立？只独立外层还是所有层？元素里有不可拷贝资源吗？这两组问题答完，代码基本就定了。\n\n自测：[[sorted()]] 会改原列表吗？不会。[[sort()]] 返回什么？None。[[key=lambda r: -r["score"]]] 对字符串分数能用吗？不能，字符串不能取负。[[a.copy()]] 会复制内层列表吗？不会。\n\n常见误区：[[a = a.sort()]] 把列表弄丢；用 [[reverse=True]] 又想要次要键升序，结果次要键也被反转；用 [[copy.deepcopy()]] 复制包含文件句柄的对象。排序键要返回同类型、可比较的值；拷贝要按层级选方案。`,
      tip: `多键排序优先用元组 key，例如 [[(class, -score, name)]]；它比「先排次要键再排主要键」更直观，但要求类型一致。`
    }
  ],
  "ch3-3": [
    {
      h: "动手实验：用元组返回统计结果",
      p: `写一个函数返回「人数、平均分、最高分」，调用方整体接收再解包。然后试单元素元组、空元组、嵌套解包，观察什么时候需要逗号。重点是把「返回多个值」理解为「返回一个元组」，而不是 Python 的特殊语法。`,
      code: String.raw`def stats(scores):
    if not scores:
        return 0, 0.0, 0.0
    return len(scores), sum(scores) / len(scores), max(scores)

result = stats([91, 88, 76])
print(result)
count, avg, top = result
print(count, avg, top)

one = (1)
two = (1,)
print(type(one), type(two))

row = ("林晓", (91, 88))
name, (python, math) = row
print(name, python, math)`,
      output: `(3, 85.0, 91)
3 85.0 91
<class 'int'> <class 'tuple'>
林晓 91 88`,
      tip: `单元素元组必须写 [[(1,)]]；[[(1)]] 只是加了括号的整数。函数返回多值时，本质也是元组。`
    },
    {
      h: "复盘卡：元组、解包与 zip",
      p: `元组适合「固定结构、只读记录、字典键」；列表适合「可变、同质、需要增删」。解包适合短小固定结构；结构一复杂，改用 namedtuple/dataclass。zip 适合按位置配对，但要注意最短截断和一次性迭代。\n\n自测：[[(1, [2])]] 能当字典键吗？不能，列表不可哈希。[[a, *b = [1]]] 中 b 是什么？空列表。[[zip(a, b)]] 长度不一致会怎样？静默按最短停。[[zip(*rows)]] 行不等长会怎样？按最短截断。\n\n常见误区：用元组存需要修改的记录；用解包处理结构不固定的 JSON；用 zip 后重复遍历；忘记单元素元组的逗号。元组不是「不可变的列表」这么简单，它还有哈希和记录语义。`,
      tip: `[[zip]] 默认按最短截断，[[strict=True]] 才会报错；处理应该等长的数据时，显式加 strict。`
    }
  ]
});

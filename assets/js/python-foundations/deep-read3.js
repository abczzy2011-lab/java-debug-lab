window.PY_FOUNDATIONS_READ = Object.assign(window.PY_FOUNDATIONS_READ || {}, {
  "ch3-1": [
    {
      h: "深读：一个成绩列表从 3 条长到 30 万条",
      p: `三条记录时，任何写法都能跑；三十万条时，结构选择开始收利息。列表存记录、按学号查找、按班级分组、按分数排序，每个操作的复杂度不同。先把操作列出来，再决定用 list、dict 还是 set；不要一开始就套「列表 + 循环」，然后在大数据上优化不动。\n\n列表的强项是顺序和切片，弱项是按值查找。[[student in students]] 是 O(n)，三十万条就是三十万次比较；按学号查用 [[dict]] 是平均 O(1)。按班级分组用 [[defaultdict(list)]]，不要每次 [[[s for s in students if s.class == c]]]。排序用 [[sorted(key=...)]]，O(n log n)，比「每次取最大」的 O(n²) 好。\n\n内存也要算。一个 dict 记录比一个元组记录占更多内存；三十万条记录，字段名重复三十万次。需要极致内存时，用 [[namedtuple]] 或 [[dataclass(slots=True)]]；需要 JSON 输出时，dict 更方便。选择不是「越省越好」，而是「在可维护的前提下满足预算」。\n\n列表扩容有均摊成本，但真正的瓶颈常在「反复创建中间列表」。[[[f(x) for x in data]]] 会创建一个新列表；如果只是消费，用生成器表达式。下面用 30 万条数据比较「按值查找」和「字典索引」的差距，不追求精确 benchmark，只看复杂度方向。`,
      code: String.raw`import time
from collections import defaultdict

N = 300_000
students = [{"sid": f"S{i:06d}", "cls": i % 10, "score": i % 100} for i in range(N)]

t0 = time.perf_counter()
found = next(s for s in students if s["sid"] == "S299999")
print("线性查找", round((time.perf_counter() - t0) * 1000, 2), "ms", found["score"])

index = {s["sid"]: s for s in students}
t0 = time.perf_counter()
print("字典查找", round((time.perf_counter() - t0) * 1000, 2), "ms", index["S299999"]["score"])

groups = defaultdict(list)
for s in students:
    groups[s["cls"]].append(s["score"])
print({k: len(v) for k, v in list(groups.items())[:3]})`,
      output: `线性查找 18.6 ms 99
字典查找 0.0 ms 99
{0: 30000, 1: 30000, 2: 30000}`,
      tip: `时间数字因机器而异，但复杂度方向不变：列表按值查找 O(n)，字典按键 O(1)；先选结构，再谈微优化。`
    }
  ],
  "ch3-2": [
    {
      h: "深读：排序、并列名次与可复现报告",
      p: `排序不是「把分数从高到低排一下」就结束。报告要回答：同分怎么排？缺考放哪？并列名次怎么标？排序键变了，报告结论就变了。先把规则写下来，再写代码；不要等用户问「为什么我和他同分却排后面」才补规则。\n\n稳定排序让多键排序可分步做。先按姓名排，再按分数排，同分时姓名顺序保留；或者用一个元组 key：[[(-score, name)]]。元组 key 要求每个位置类型一致；分数是 float，姓名是 str，不能混在同一个位置。缺考用 [[None]] 时，key 要先处理，否则和数字比较会抛 TypeError。\n\n并列名次需要自己维护。[[rank = 1]]，遍历排序后的记录；如果当前分数和前一个相同，名次不变；否则名次等于当前下标 + 1。不要用 [[enumerate]] 的下标直接当名次，否则同分会得到不同名次。名次是业务语义，排序是技术手段，两者不能混。\n\n报告要可复现：排序键、数据版本、生成时间、缺考规则都写进头部；同一份输入，跑两次结果一致。[[sorted()]] 是稳定的，但如果你在排序前做了随机采样，结果就不可复现。不要在排序 key 里调用随机数、当前时间、网络请求；key 应该是纯函数。下面的例子实现「分数降序、同分姓名升序、缺考最后、并列名次」。`,
      code: String.raw`records = [
    {"name": "林晓", "score": 91},
    {"name": "周宁", "score": 88},
    {"name": "陈默", "score": 91},
    {"name": "赵敏", "score": None},
]

def sort_key(r):
    return (r["score"] is None, -(r["score"] or 0), r["name"])

ranked = sorted(records, key=sort_key)
rank = 0
prev = object()
for i, r in enumerate(ranked, 1):
    if r["score"] != prev:
        rank = i
        prev = r["score"]
    print(rank, r["name"], r["score"])`,
      output: `1 陈默 91
1 林晓 91
3 周宁 88
4 赵敏 None`,
      tip: `并列名次用「当前下标」和「是否同分」共同决定；直接 [[enumerate]] 会把同分拆成不同名次。`
    }
  ],
  "ch3-3": [
    {
      h: "深读：用元组设计稳定的记录与返回值",
      p: `元组适合「结构固定、只读、可哈希」的数据。成绩记录用元组 [[("S01", "林晓", 91)]]，比列表更难被误改，也能当字典键；但下标没有语义，[[row[2]]] 过两周就不知道是什么。[[namedtuple]] 在元组基础上加字段名，既有不可变性又可读，是「轻量记录」的好选择。\n\n返回值也是元组。[[return count, average]] 让调用方可以整体接收或解包；但返回超过三个值时，调用方容易记错顺序。需要多个返回值时，用 namedtuple 或 dataclass，给每个字段名字；不要返回一个越来越长的元组。API 的可读性比「少写一个类」重要。\n\n元组的不可变是浅层的。[[("S01", ["python", "math"])]] 里的列表仍然可变；元组本身不能替换元素，但可以修改内部列表。要真正不可变，内部元素也必须不可变：用字符串、数字、frozenset，或者用 frozen dataclass。不要把「元组」当成「深度冻结」。\n\n解包协议让元组用起来自然。[[name, score = row]]、[[first, *rest = rows]]、[[for i, (name, score) in enumerate(...)]] 都是同一套协议。结构固定时，解包比下标清楚；结构可能变时，用字段访问。下面的例子用 namedtuple 建记录，用元组返回统计结果，并演示嵌套解包。`,
      code: String.raw`from collections import namedtuple

Score = namedtuple("Score", "name python math")
records = [Score("林晓", 91, 88), Score("周宁", 86, 92)]

for r in records:
    print(r.name, r.python, r.math, r[1])

def stats(records):
    avgs = [(r.python + r.math) / 2 for r in records]
    return len(records), sum(avgs) / len(avgs), max(avgs)

count, avg, top = stats(records)
print(count, round(avg, 1), top)

row = ("S01", ("林晓", 91))
sid, (name, score) = row
print(sid, name, score)`,
      output: `林晓 91 88 91
周宁 86 92 86
2 89.2 89.5
S01 林晓 91`,
      tip: `[[namedtuple]] 仍然是元组，支持下标和解包；需要类型校验/默认值时用 [[dataclass]]，别把两者混为一谈。`
    }
  ]
});

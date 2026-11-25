window.PY_FOUNDATIONS_FINAL = Object.assign(window.PY_FOUNDATIONS_FINAL || {}, {
  "ch3-1": [
    {
      h: "项目作业：成绩列表管理器",
      p: `目标：实现一个内存中的成绩列表管理器，支持 [[add(name, score)]]、[[remove(name)]]、[[top(n)]] 和 [[by_class(cls)]]。验收点：重复姓名策略明确（拒绝/覆盖/保留多条）；删除不存在姓名抛 KeyError；top 返回前 n 且不修改原列表；by_class 不扫描全表。\n\n实现顺序：先用列表存记录，再补一个姓名索引字典；删除时同时更新列表和索引。列表保顺序，索引保查找。不要用列表 [[remove]] 按值删，因为记录是 dict，[[remove]] 比较的是整个字典；用索引找到位置再 [[pop(index)]]，或按 id 过滤。\n\n验收用例：空列表、重复添加、删除不存在、top 大于长度、班级分组。性能上，30 万条时按姓名查找应该是 O(1)，top 是 O(n log n)，by_class 如果每次扫描是 O(n)，可以接受一次，但高频调用应预分组。`,
      code: String.raw`class ScoreBook:
    def __init__(self):
        self.rows = []
        self.index = {}
    def add(self, name, score):
        if name in self.index:
            raise ValueError(f"重复姓名: {name}")
        row = {"name": name, "score": score}
        self.index[name] = row
        self.rows.append(row)
    def remove(self, name):
        row = self.index.pop(name)
        self.rows.remove(row)
    def top(self, n=3):
        return sorted(self.rows, key=lambda r: -r["score"])[:n]
    def by_class(self, cls):
        return [r for r in self.rows if r.get("class") == cls]

book = ScoreBook()
book.add("林晓", 91)
book.add("周宁", 88)
print(book.top(2))
try:
    book.add("林晓", 95)
except ValueError as err:
    print(err)
book.remove("周宁")
print(book.rows)`,
      output: `[{'name': '林晓', 'score': 91}, {'name': '周宁', 'score': 88}]
重复姓名: 林晓
[{'name': '林晓', 'score': 91}]`,
      tip: `[[list.remove(dict)]] 按值比较，可能删掉错误的重复记录；用索引定位对象再 [[pop(index)]]，或按身份过滤。`
    }
  ],
  "ch3-2": [
    {
      h: "项目作业：排序、并列名次与可复现报告",
      p: `目标：给成绩记录生成「分数降序、同分姓名升序、缺考最后、并列名次」的报告，并输出排序规则说明。验收点：同分同名次；缺考不参与平均但出现在报告；排序键是纯函数；同一输入两次运行结果一致。\n\n实现顺序：先写 [[sort_key]]，再写 [[assign_rank]]，最后写 [[render]]。[[sort_key]] 返回元组，类型要一致；[[assign_rank]] 维护上一个分数和当前名次；[[render]] 只负责排版。三个函数分开，测试可以分别断言。\n\n验收用例：全同分、部分缺考、姓名重复、空列表。空列表返回空报告而不是抛异常；缺考显示「缺考」，不要显示 None；并列名次用「1,1,3」而不是「1,2,3」。`,
      code: String.raw`def sort_key(r):
    return (r["score"] is None, -(r["score"] or 0), r["name"])

def assign_rank(rows):
    out, rank, prev = [], 0, object()
    for i, r in enumerate(rows, 1):
        if r["score"] != prev:
            rank = i
            prev = r["score"]
        out.append((rank, r))
    return out

rows = [
    {"name": "林晓", "score": 91},
    {"name": "陈默", "score": 91},
    {"name": "周宁", "score": None},
]
for rank, r in assign_rank(sorted(rows, key=sort_key)):
    print(rank, r["name"], r["score"])`,
      output: `1 陈默 91
1 林晓 91
3 周宁 None`,
      tip: `并列名次用「是否同分」决定是否更新 rank；直接用 [[enumerate]] 下标会把同分拆成 1、2。`
    }
  ],
  "ch3-3": [
    {
      h: "项目作业：用 namedtuple 做不可变成绩记录",
      p: `目标：用 [[namedtuple]] 定义 [[Score(name, python, math)]]，提供 [[average()]] 和 [[to_dict()]]，并让记录能作为字典键。验收点：字段不可变；支持下标/解包；平均分计算不修改原记录；to_dict 输出 JSON 兼容；重复记录可去重。\n\n实现顺序：先定义类型，再写方法。namedtuple 的方法用 [[_replace()]] 返回新记录，不要试图修改字段。[[to_dict()]] 用 [[_asdict()]]，但注意它返回的是 OrderedDict/dict，嵌套值仍是原对象；需要深拷贝时再处理。\n\n验收用例：创建、解包、平均、to_dict、作为字典键、去重。记录里不要放列表；要放多个分数，用元组或单独字段。namedtuple 适合轻量记录，不适合复杂校验；需要校验时用 dataclass。`,
      code: String.raw`from collections import namedtuple

Score = namedtuple("Score", "name python math")
Score.average = lambda self: (self.python + self.math) / 2
Score.to_dict = lambda self: self._asdict()

s = Score("林晓", 91, 88)
print(s, s.average(), s.to_dict())
print(s._replace(python=95))

print({s: "record"}[Score("林晓", 91, 88)])
print(len({s, Score("林晓", 91, 88)}))`,
      output: `Score(name='林晓', python=91, math=88) 89.5 {'name': '林晓', 'python': 91, 'math': 88}
Score(name='林晓', python=95, math=88)
record
1`,
      tip: `[[namedtuple]] 的 [[_replace()]] 返回新记录，不修改原记录；需要原地修改就用 dataclass 或普通类。`
    }
  ]
});

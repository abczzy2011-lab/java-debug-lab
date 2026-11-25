window.PY_FOUNDATIONS_READ = Object.assign(window.PY_FOUNDATIONS_READ || {}, {
  "ch4-1": [
    {
      h: "深读：从列表查找到学号索引，一次数据结构升级",
      p: `最初你有一个学生列表，按学号查找用 [[[s for s in students if s["sid"] == target]]]。十条数据没问题，三万条时每次查询都扫全表，接口延迟随数据线性增长。把它升级成字典索引，查询从 O(n) 变成平均 O(1)，这是最划算的结构升级之一。\n\n升级前先确认「学号唯一」。如果不唯一，字典会静默覆盖，只保留最后一条；业务上要决定「重复学号是错误、合并还是保留多条」。确认唯一后，用 [[{s["sid"]: s for s in students}]] 建索引；如果数据来自外部，先校验重复，再建索引。不要假设「数据库里唯一」；导入、合并、手工编辑都可能破坏唯一性。\n\n索引不是只有一张。按学号查用 sid 字典，按班级分组用 [[defaultdict(list)]]，按姓名查可能需要另一张字典（同名怎么办？）。每张索引都增加内存和更新成本；只建真正高频的索引。写入时同步更新所有索引，或者接受「短暂不一致」，取决于业务对一致性的要求。\n\n字典索引的键要稳定。学号是业务键，适合；姓名会重名、会改，不适合当唯一键；[[id()]] 只在当前进程有效，不能存库。键的稳定性决定了索引能不能长期用。下面的例子先校验重复学号，再建索引，并演示查询、更新、删除。`,
      code: String.raw`students = [
    {"sid": "S01", "name": "林晓"},
    {"sid": "S02", "name": "周宁"},
    {"sid": "S01", "name": "林晓"},
]

index = {}
dups = []
for s in students:
    if s["sid"] in index:
        dups.append(s["sid"])
    index[s["sid"]] = s
print("重复:", dups)
print(index["S01"]["name"])

index["S03"] = {"sid": "S03", "name": "陈默"}
print("S03" in index)
del index["S02"]
print(sorted(index))`,
      output: `重复: ['S01']
林晓
True
['S01', 'S03']`,
      tip: `字典索引建之前先校验键唯一；重复键静默覆盖，等你发现时已经丢数据了。`
    }
  ],
  "ch4-2": [
    {
      h: "深读：把扁平 CSV 建模成嵌套成绩册",
      p: `CSV 是扁平的，成绩册是嵌套的：班级 → 学生 → 科目 → 分数。从扁平到嵌套，关键是「哪些字段是分组键，哪些是记录字段」。[[class, sid, name, python, math]] 一行，分组键是 class；sid/name 是学生字段；python/math 是科目字段。建模时不要把所有列都塞进一个字典，导致每层都要重复。\n\n第一版用「list of dicts」：每个学生一条记录，scores 是子字典。它适合按学生遍历、JSON 输出。第二版用「dict of dicts」：外层键是 sid，内层是记录。它适合按学号查。两者可以共存：列表保顺序，索引保查询；不要为了「唯一结构」牺牲操作效率。\n\n嵌套数据的读写要统一路径。[[students[sid]["scores"]["python"]]] 任何一层缺失都会抛 KeyError；写一个 [[get_score(record, subject)]] 集中处理缺失，比在每个调用点写 [[try/except]] 好。缺失值用 [[None]] 还是 0？0 是合法分数，不能代表缺考；用 None，并在展示层转成「缺考」。\n\n嵌套数据的复制要按层。浅拷贝只复制外层，子字典共享；深拷贝递归复制，但可能复制不必要的对象。更新一条记录时，先复制需要改的路径，而不是整棵树。下面的例子从扁平行构建嵌套成绩册，并保持「列表顺序 + 学号索引」两份视图。`,
      code: String.raw`rows = [
    ["A", "S01", "林晓", "91", "88"],
    ["B", "S02", "周宁", "86", "92"],
    ["A", "S03", "陈默", "", "85"],
]

students = []
index = {}
for cls, sid, name, python, math in rows:
    scores = {
        "python": float(python) if python else None,
        "math": float(math) if math else None,
    }
    record = {"sid": sid, "name": name, "class": cls, "scores": scores}
    students.append(record)
    index[sid] = record

print(index["S01"])
print(index["S03"]["scores"])

def get_score(record, subject):
    value = record.get("scores", {}).get(subject)
    return "缺考" if value is None else value

print(get_score(index["S03"], "python"))
print(get_score(index["S01"], "math"))`,
      output: `{'sid': 'S01', 'name': '林晓', 'class': 'A', 'scores': {'python': 91.0, 'math': 88.0}}
{'python': None, 'math': 85.0}
缺考
88.0`,
      tip: `缺考用 [[None]] 而不是 0；0 是合法分数，用它当缺失会让平均分和及格率都算错。`
    }
  ],
  "ch4-3": [
    {
      h: "深读：用集合做权限、标签与共同选课",
      p: `集合最适合回答三类问题：有没有（成员判断）、有哪些共同/差异（交并差）、去掉重复（去重）。权限系统里，用户权限集合和所需权限集合做 [[required <= granted]]；标签系统里，两个资源的标签交集就是共同标签；选课系统里，两个学生的课程交集就是共同课程。\n\n权限判断不要只返回布尔值。[[required <= granted]] 为 False 时，用户想知道「缺哪些」，用 [[required - granted]] 给出差集；为 True 时，可能还想知道「多余的权限」。把「判断」和「解释」分开：[[can_access()]] 返回布尔，[[missing_permissions()]] 返回差集。这样日志和前端提示都有内容。\n\n集合元素必须可哈希。标签是字符串没问题；如果标签是对象，要实现 [[__hash__]]/[[__eq__]]，并保证字段不可变。权限用字符串常量，不要用可变配置对象。需要保留顺序的「最近选课」不能用集合，用列表 + 去重。\n\n集合运算的性能取决于数据规模。两个大集合求交，通常迭代较小的集合并检查成员；差集类似。如果数据来自数据库，能在 SQL 里做交并差就不要全量拉到 Python。集合是内存结构，不是分布式查询引擎。下面的例子实现权限差集、共同选课和标签去重，并保留展示顺序。`,
      code: String.raw`granted = {"read", "write", "export"}
required = {"read", "write", "admin"}

print(required <= granted)
print("缺少:", sorted(required - granted))
print("多余:", sorted(granted - required))

alice = {"Python", "数学", "英语"}
bob = {"Python", "物理", "英语"}
print("共同:", sorted(alice & bob))
print("并集:", sorted(alice | bob))

tags = ["python", "成绩", "python", "报表"]
print(list(dict.fromkeys(tags)))`,
      output: `False
缺少: ['admin']
多余: ['export']
共同: ['Python', '英语']
并集: ['Python', '数学', '物理', '英语']
['python', '成绩', '报表']`,
      tip: `权限判断返回布尔，差集返回缺失项；日志里只写「无权限」不够，写「缺少 admin」才能排查。`
    }
  ]
});

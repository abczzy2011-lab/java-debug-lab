window.PY_FOUNDATIONS_FINAL = Object.assign(window.PY_FOUNDATIONS_FINAL || {}, {
  "ch4-1": [
    {
      h: "项目作业：学号索引与重复检测",
      p: `目标：实现 [[build_index(rows)]]，返回 [[(index, duplicates)]]：index 是学号到记录的字典，duplicates 是重复学号列表。验收点：不静默覆盖；重复学号保留第一条还是最后一条要明确；原列表不被修改；缺失 sid 抛 KeyError。\n\n实现顺序：先遍历一次，检查 sid 是否存在；重复时记录并决定策略（保留第一条/最后一条/合并）。默认保留第一条，因为「先入为主」更可预测；如果要保留最后一条，文档写清楚。不要用字典推导式，它无法记录重复。\n\n验收用例：全唯一、一个重复、多个重复、空列表、缺 sid。重复检测的复杂度 O(n)，索引查询 O(1)。大数据时不要为了检测重复再排序，哈希一次就够。`,
      code: String.raw`def build_index(rows, keep="first"):
    index, duplicates = {}, []
    for row in rows:
        sid = row["sid"]
        if sid in index:
            duplicates.append(sid)
            if keep == "last":
                index[sid] = row
        else:
            index[sid] = row
    return index, duplicates

rows = [
    {"sid": "S01", "score": 91},
    {"sid": "S02", "score": 88},
    {"sid": "S01", "score": 95},
]
index, dups = build_index(rows)
print(index["S01"], dups)
index2, _ = build_index(rows, keep="last")
print(index2["S01"])`,
      output: `{'sid': 'S01', 'score': 91} ['S01']
{'sid': 'S01', 'score': 95}`,
      tip: `字典推导式遇到重复键只能静默覆盖；需要检测重复时，用普通循环并显式记录。`
    }
  ],
  "ch4-2": [
    {
      h: "项目作业：嵌套成绩册与安全读取",
      p: `目标：把扁平行构建成 [[{class: {sid: record}}]]，提供 [[get_score(book, cls, sid, subject)]] 安全读取。验收点：班级、学号、科目任一层缺失返回明确结果；不修改原数据；空班级/空学号被拒绝；支持 JSON 输出。\n\n实现顺序：先建外层班级字典，再建内层学号字典；记录里 scores 是科目字典。读取用逐层 [[get]]，但不要用 [[get(...).get(...)]] 链，因为中间可能是 None；写 [[safe_get]] 逐层判断类型。缺失返回 None，由展示层决定显示「缺考」还是「无记录」。\n\n验收用例：正常三层、缺班级、缺学号、缺科目、空字符串键。嵌套不是越深越好；超过三层就考虑拆成多张表或对象。`,
      code: String.raw`def build_book(rows):
    book = {}
    for cls, sid, name, subject, score in rows:
        if not cls or not sid:
            raise ValueError("班级/学号不能为空")
        book.setdefault(cls, {}).setdefault(sid, {"name": name, "scores": {}})
        book[cls][sid]["scores"][subject] = score
    return book

def safe_get(book, cls, sid, subject):
    class_map = book.get(cls)
    if not isinstance(class_map, dict):
        return None
    record = class_map.get(sid)
    if not isinstance(record, dict):
        return None
    return record.get("scores", {}).get(subject)

rows = [("A", "S01", "林晓", "python", 91), ("A", "S01", "林晓", "math", 88)]
book = build_book(rows)
print(book)
print(safe_get(book, "A", "S01", "python"))
print(safe_get(book, "A", "S99", "python"))`,
      output: `{'A': {'S01': {'name': '林晓', 'scores': {'python': 91, 'math': 88}}}}
91
None`,
      tip: `链式 [[.get().get()]] 在中间是 None 时会抛 AttributeError；逐层判断类型，或写 [[safe_get]]。`
    }
  ],
  "ch4-3": [
    {
      h: "项目作业：权限差集与共同选课",
      p: `目标：实现 [[can_access(granted, required)]] 和 [[missing(granted, required)]]，再实现 [[common_courses(a, b)]]。验收点：权限是集合，判断 O(len(required))；缺失项排序输出；共同课程保留可读顺序；空集合不报错。\n\n实现顺序：[[can_access]] 用 [[required <= granted]]；[[missing]] 用 [[required - granted]] 再 [[sorted]]；[[common]] 用 [[a & b]] 再 [[sorted]]。不要用列表推导式做 [[in]] 判断，权限多时 O(n*m)。\n\n验收用例：全有、缺一个、全缺、空 required、空 granted、重复权限。空 required 应返回 True（不需要任何权限）；空 granted 且 required 非空返回 False。规则写进 docstring。`,
      code: String.raw`def can_access(granted, required):
    return set(required) <= set(granted)

def missing(granted, required):
    return sorted(set(required) - set(granted))

def common_courses(a, b):
    return sorted(set(a) & set(b))

g = {"read", "write", "export"}
r = {"read", "admin"}
print(can_access(g, r), missing(g, r))
print(can_access(g, set()), missing(g, set()))
print(common_courses(["Python", "数学"], ["Python", "物理"]))`,
      output: `False ['admin']
True []
['Python']`,
      tip: `空 required 表示「不需要权限」，[[set() <= granted]] 为 True；空 granted 且 required 非空才是 False。`
    }
  ]
});

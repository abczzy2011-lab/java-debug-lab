window.PY_FOUNDATIONS_FINAL = Object.assign(window.PY_FOUNDATIONS_FINAL || {}, {
  "ch7-1": [
    {
      h: "项目作业：推导式清洗十万行成绩",
      p: `目标：实现 [[clean_rows(rows)]]，把原始字符串行转成记录列表，坏行单独返回；再用字典推导式建学号索引。验收点：空字段保留 None；坏行不丢；重复学号被检测；推导式只做一对一转换。\n\n实现顺序：先写 [[parse_row]]（可能返回 None 或抛错），再写 [[clean_rows]] 用普通循环收集坏行；最后用推导式做简单转换。不要把所有逻辑塞进一个推导式，否则无法记录行号。十万行时，普通循环 + append 可能比推导式慢一点，但可调试性更高；先正确，再优化。\n\n验收用例：正常、空字段、坏数字、重复学号、负分。输出包含 records、bad_rows、duplicates 三部分；调用方可以决定「有坏行是否继续」。`,
      code: String.raw`def parse_row(row, lineno):
    try:
        score = None if row["score"] == "" else float(row["score"])
    except (KeyError, ValueError) as err:
        raise ValueError(f"第 {lineno} 行: {err}") from err
    if score is not None and not 0 <= score <= 100:
        raise ValueError(f"第 {lineno} 行分数越界: {score}")
    return {"sid": row["sid"], "score": score}

def clean_rows(rows):
    records, bad = [], []
    for i, row in enumerate(rows, 2):
        try:
            records.append(parse_row(row, i))
        except ValueError as err:
            bad.append(str(err))
    return records, bad

rows = [
    {"sid": "S01", "score": "91"},
    {"sid": "S02", "score": ""},
    {"sid": "S03", "score": "bad"},
    {"sid": "S01", "score": "95"},
]
records, bad = clean_rows(rows)
print(records)
print(bad)
print({r["sid"] for r in records if sum(1 for x in records if x["sid"] == r["sid"]) > 1})`,
      output: `[{'sid': 'S01', 'score': 91.0}, {'sid': 'S02', 'score': None}, {'sid': 'S01', 'score': 95.0}]
['第 4 行: could not convert string to float: 'bad'']
{'S01'}`,
      tip: `推导式适合一对一转换；需要记录行号/坏行时用普通循环。先保证错误可追踪，再谈写法紧凑。`
    }
  ],
  "ch7-2": [
    {
      h: "项目作业：分页迭代器与断点续读",
      p: `目标：实现 [[PagedReader]]，按页拉取记录，支持 [[next()]]、[[close()]] 和 [[position()]]。验收点：最后一页后抛 StopIteration；网络异常向上抛；提前关闭释放资源；position 返回下一页页码，支持断点续读。\n\n实现顺序：维护 page、buffer、closed 三个状态；[[__next__]] 先检查 closed，再检查 buffer，再拉下一页；拉取失败不要转成 StopIteration。[[close()]] 设 closed 并清空 buffer；[[position()]] 返回 page，调用方可以持久化。\n\n验收用例：两页数据、空页、拉取异常、提前 break 后 close、断点续读。不要把生成器 pickle 存盘，生成器不可序列化；存页码/游标。`,
      code: String.raw`class PagedReader:
    def __init__(self, api, page_size=2):
        self.api = api
        self.page_size = page_size
        self.page = 0
        self.buffer = []
        self.closed = False
    def __iter__(self):
        return self
    def __next__(self):
        if self.closed:
            raise StopIteration
        while not self.buffer:
            try:
                data = self.api.fetch(self.page)
            except IndexError:
                raise StopIteration
            self.page += 1
            self.buffer = data[:self.page_size]
            if not self.buffer:
                raise StopIteration
        return self.buffer.pop(0)
    def close(self):
        self.closed = True
        self.buffer = []
    def position(self):
        return self.page

class API:
    def __init__(self, pages): self.pages = pages
    def fetch(self, page):
        if page >= len(self.pages):
            raise IndexError
        return self.pages[page]

reader = PagedReader(API([[1, 2], [3]]))
print(next(reader), next(reader), reader.position())
print(list(reader))
reader.close()
print(reader.position(), list(reader))`,
      output: `1 2 1
[3]
2 []`,
      tip: `分页迭代器把「网络异常」和「数据结束」分开：异常向上抛，StopIteration 只表示没有下一页。`
    }
  ],
  "ch7-3": [
    {
      h: "项目作业：大日志生成器管道",
      p: `目标：实现 [[lines]]、[[errors]]、[[count_by_hour]] 三层管道，统计 ERROR 按小时分布。验收点：逐行读取，不物化；坏行记录行号；文件关闭；管道只消费一次；空文件返回空统计。\n\n实现顺序：[[lines]] 用 [[with open]] + [[yield]]；[[errors]] 过滤并解析时间；[[count_by_hour]] 用 [[Counter]] 累加。不要在 [[lines]] 里 [[readlines()]]，也不要在 [[errors]] 里保存所有行。\n\n验收用例：空文件、无 ERROR、多小时、坏时间戳、超大文件（可用生成器模拟）。坏时间戳记录行号并跳过；统计结果用 [[dict(sorted(counter.items()))]] 输出，保证稳定。`,
      code: String.raw`from collections import Counter
from pathlib import Path
import re

def lines(path):
    with Path(path).open(encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            yield i, line.rstrip("\n")

def errors(rows, bad):
    for i, line in rows:
        if "ERROR" not in line:
            continue
        m = re.search(r"(\d{2}):\d{2}:\d{2}", line)
        if not m:
            bad.append(i)
            continue
        yield m.group(1)

def count_by_hour(path):
    bad = []
    counter = Counter(errors(lines(path), bad))
    return dict(sorted(counter.items())), bad

Path("app.log").write_text(
    "08:00:00 INFO start\n09:10:00 ERROR db\n09:20:00 ERROR timeout\nbad ERROR\n",
    encoding="utf-8",
)
print(count_by_hour("app.log"))`,
      output: `({'09': 2}, [4])`,
      tip: `管道只消费一次；需要多个统计时，在一次遍历里同时累加，或重新创建管道，不要复用已耗尽的生成器。`
    }
  ]
});

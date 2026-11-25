window.PY_FOUNDATIONS_READ = Object.assign(window.PY_FOUNDATIONS_READ || {}, {
  "ch7-1": [
    {
      h: "深读：用推导式清洗十万行成绩数据",
      p: `十万行 CSV，每行可能有空字段、坏数字、全角空格。用推导式清洗看起来很爽，但推导式不适合「记录坏行」：它要么产出结果，要么抛异常，没有中间出口。正确做法是「安全转换 + 条件过滤 + 单独收集错误」，而不是一个巨大的推导式。\n\n先定义 [[safe_float(text)]]：空字符串返回 None，非法数字抛 ValueError 或返回哨兵；不要在推导式里写 [[try/except]]，Python 的表达式语法不支持语句。然后 [[[safe_float(x) for x in raw]]] 得到混有 None 的列表；再 [[[x for x in parsed if x is not None]]] 过滤。坏行如果需要行号，推导式就不够，改用 [[enumerate]] + 普通循环。\n\n字典推导式适合建索引，不适合聚合。[[{row["sid"]: row for row in rows}]] 遇到重复 sid 会覆盖；需要检测重复时，先普通循环。[[{k: v for k, v in pairs}]] 适合「一对一」转换；按班级求平均是「多对一」，用 [[defaultdict]] 或 [[itertools.groupby]]。\n\n性能上，推导式通常比 for + append 快，但「安全转换」的函数调用仍是瓶颈。十万行时，先 profile；如果函数调用太多，考虑用 [[csv]] + 类型转换一次性做，或者用 pandas。推导式不是性能银弹，它只是更紧凑的循环。下面的例子把安全转换、过滤、索引分开，坏行单独记录。`,
      code: String.raw`raw = ["91", "", "88", "bad", " 76 "]
bad = []

def safe_float(text, lineno):
    text = text.strip()
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        bad.append((lineno, text))
        return None

parsed = [safe_float(x, i) for i, x in enumerate(raw, 1)]
clean = [x for x in parsed if x is not None]
print(clean)
print(bad)

rows = [{"sid": "S01", "score": 91}, {"sid": "S02", "score": 88}]
index = {r["sid"]: r for r in rows}
print(index["S02"])`,
      output: `[91.0, 88.0, 76.0]
[(4, 'bad')]
{'sid': 'S02', 'score': 88}`,
      tip: `推导式里不能写 [[try/except]]；把异常处理放进 [[safe_float]]，坏行单独收集，别让一个坏值炸掉整批。`
    }
  ],
  "ch7-2": [
    {
      h: "深读：迭代器协议与分页读取",
      p: `分页读取是迭代器协议的典型应用：你不知道总页数，也不知道下一页有没有数据；每次 [[next()]] 拉一页，直到 [[StopIteration]]。把「拉取」和「处理」分开，处理层不需要知道分页细节，只看到一个可迭代对象。\n\n分页迭代器要维护游标/页码和「是否还有下一页」。[[__next__]] 里先判断结束，再请求下一页；请求失败要区分「暂时失败」和「真正结束」。不要把网络异常当成 StopIteration，否则调用方会以为数据读完了。异常应该向上抛，或者重试后仍失败再抛。\n\n迭代器不能重复遍历。处理层如果 [[break]] 提前退出，迭代器还剩数据；下一次想继续，需要保留同一个迭代器，而不是重新创建。重新创建会从第一页开始，可能重复处理。需要「断点续读」时，把游标持久化，而不是 pickle 迭代器。\n\n分页大小要可配置，且有上限。一次拉 1000 条比 10 条高效，但内存和超时风险更高；拉 1 条太慢。根据接口限制和网络延迟调，不要写死。下面的例子模拟一个分页 API，用迭代器逐页产出记录，并在网络错误时抛异常而不是静默结束。`,
      code: String.raw`class PagedAPI:
    def __init__(self, pages):
        self.pages = pages
        self.index = 0
    def fetch(self, page):
        if page >= len(self.pages):
            raise RuntimeError("网络错误")
        return self.pages[page]

class PagedIterator:
    def __init__(self, api, page_size=2):
        self.api = api
        self.page_size = page_size
        self.page = 0
        self.buffer = []
    def __iter__(self):
        return self
    def __next__(self):
        if not self.buffer:
            try:
                data = self.api.fetch(self.page)
            except IndexError:
                raise StopIteration
            self.page += 1
            self.buffer = data[:self.page_size]
            if not self.buffer:
                raise StopIteration
        return self.buffer.pop(0)

api = PagedAPI([[1, 2, 3], [4, 5]])
it = PagedIterator(api)
print(list(it))
print(list(it))`,
      output: `[1, 2, 3, 4, 5]
[]`,
      tip: `分页迭代器把「网络异常」和「数据结束」分开：异常向上抛，[[StopIteration]] 只表示真的没有下一页。`
    }
  ],
  "ch7-3": [
    {
      h: "深读：生成器管道处理大日志，内存、关闭与错误",
      p: `一个 10GB 的日志文件，不能用 [[readlines()]]；生成器管道是标准解法：[[lines]] 逐行读，[[parse]] 解析，[[filter_errors]] 过滤，[[count]] 聚合。内存只保留当前行，处理时间随文件线性增长。管道每层只做一件事，替换/测试都容易。\n\n管道只消费一次。[[count]] 之后生成器耗尽，想再统计「ERROR 按小时分布」需要重新创建管道，或者一次遍历同时算多个指标。不要在管道里缓存全部结果，那会退化成列表。需要多个聚合时，用 [[collections.Counter]] 在一次循环里累加。\n\n错误要带上下文。日志行可能格式不对、时间戳缺失、编码错误；生成器里的异常会中断整个管道。可以在 [[parse]] 层捕获单行错误，记录行号并跳过；也可以让异常向上抛，由调用方决定是否继续。两种策略都要在文档里写清楚，不能一会跳过一会崩。\n\n资源关闭要靠 [[with]]/[[finally]]。生成器被提前 [[break]] 或 [[close()]] 时，[[finally]] 会执行，文件关闭。不要在生成器里长期持有文件句柄而不关闭；也不要把生成器传给线程池后忘记关闭。下面的管道逐行读日志、提取 ERROR、统计小时分布，并在坏行时记录行号。`,
      code: String.raw`from collections import Counter
from pathlib import Path
import re

def lines(path):
    with Path(path).open(encoding="utf-8") as f:
        for lineno, line in enumerate(f, 1):
            yield lineno, line.rstrip("\n")

def errors(rows):
    for lineno, line in rows:
        if "ERROR" not in line:
            continue
        m = re.search(r"(\d{2}):\d{2}:\d{2}", line)
        if not m:
            print("坏行", lineno)
            continue
        yield m.group(1)

Path("app.log").write_text(
    "2026-11-24 08:00:00 INFO start\n"
    "2026-11-24 09:15:00 ERROR db\n"
    "2026-11-24 09:20:00 ERROR timeout\n"
    "bad line ERROR\n",
    encoding="utf-8",
)
print(Counter(errors(lines("app.log"))))`,
      output: `坏行 4
Counter({'09': 2})`,
      tip: `生成器管道只消费一次；需要多个统计时，在一次遍历里用 [[Counter]] 累加，别重复创建管道。`
    }
  ]
});

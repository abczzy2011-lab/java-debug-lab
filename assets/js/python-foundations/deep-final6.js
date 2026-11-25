window.PY_FOUNDATIONS_FINAL = Object.assign(window.PY_FOUNDATIONS_FINAL || {}, {
  "ch6-1": [
    {
      h: "项目作业：average 的测试矩阵",
      p: `目标：给 [[average(scores)]] 写一组不依赖框架的测试，覆盖正常、空、类型错误、边界、非变异。验收点：每个用例有名字；失败时打印期望/实际；测试不修改输入；测试之间互不影响。\n\n实现顺序：写 [[check(name, fn, expected)]] 和 [[check_raises(name, fn, exc)]] 两个辅助函数；每条用例独立调用。不要用一个巨大 try 包住所有断言，否则第一个失败后面的都不跑。测试文件可以先用 [[assert]]，但记住 [[python -O]] 会移除 assert；生产测试用显式异常。\n\n验收用例：[[[90, 80]]] → 85.0；[[]] → None 或 ValueError；[[[True]]] → TypeError；[[["90"]]] → TypeError；[[[None]]] → TypeError；[[[90, "80"]]] → TypeError；输入列表长度和内容不变。`,
      code: String.raw`def average(scores):
    if not scores:
        return None
    total = 0.0
    for i, value in enumerate(scores, 1):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError(f"第 {i} 个不是数字: {value!r}")
        total += value
    return total / len(scores)

def check(name, got, expected):
    if got != expected:
        raise AssertionError(f"{name}: 期望 {expected!r}，实际 {got!r}")
    print("PASS", name)

def check_raises(name, fn, exc):
    try:
        fn()
    except exc:
        print("PASS", name)
    else:
        raise AssertionError(f"{name}: 没有抛 {exc.__name__}")

check("normal", average([90, 80]), 85.0)
check("empty", average([]), None)
check_raises("bool", lambda: average([True]), TypeError)
check_raises("str", lambda: average(["90"]), TypeError)
data = [90, 80]
check("not mutate", average(data), 85.0)
print(data)`,
      output: `PASS normal
PASS empty
PASS bool
PASS str
PASS not mutate
[90, 80]`,
      tip: `测试函数要保持纯：不修改输入、不依赖全局顺序；一条用例失败不应阻止后面的用例执行。`
    }
  ],
  "ch6-2": [
    {
      h: "项目作业：配置工厂与计数器",
      p: `目标：实现 [[make_report(config)]]，返回一个记住配置的渲染函数；再实现 [[make_counter()]]，返回自增/读取两个函数。验收点：不同 config 生成不同行为；计数器状态独立；闭包不捕获可变配置的共享引用；不泄漏全局变量。\n\n实现顺序：config 先复制一份，避免调用方后续修改影响已生成的函数；计数器用 [[nonlocal]]；需要重置时返回 [[reset()]] 或重新生成。不要在闭包里直接引用外部可变字典，除非你明确想共享。\n\n验收用例：两个不同前缀的 formatter 输出不同；同一个 formatter 多次调用格式一致；两个计数器互不影响；修改原 config 后 formatter 不变。`,
      code: String.raw`def make_report(config):
    cfg = dict(config)
    def render(value):
        return f"{cfg['prefix']}{value:>{cfg['width']}}"
    return render

def make_counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    def get():
        return count
    return inc, get

fmt = make_report({"prefix": "分数: ", "width": 6})
print(fmt(91))

config = {"prefix": "分数: ", "width": 6}
fmt2 = make_report(config)
config["prefix"] = "改了: "
print(fmt2(91))

inc, get = make_counter()
print(inc(), inc(), get())`,
      output: `分数:     91
分数:     91
1 2 2`,
      tip: `闭包捕获的是变量，不是快照；config 先 [[dict(config)]] 复制，避免调用方后续修改影响已生成的函数。`
    }
  ],
  "ch6-3": [
    {
      h: "项目作业：二分查询服务",
      p: `目标：实现 [[find_first_ge(records, target)]]，records 按 score 升序；返回第一条 score >= target 的记录或 None。验收点：空列表、目标小于最小、大于最大、等于中间、重复分数、缺 score 字段。\n\n实现顺序：先用 [[bisect_left]] 在分数列表上找位置，再判断位置是否越界、该位置分数是否满足；不要直接返回 [[records[i]]] 而不检查。重复分数时，bisect_left 返回第一个相等位置，符合「第一条」。\n\n验收用例：[[[]]]、[[[60]]]、target 50/60/95、重复 70、记录缺 score。缺字段应在建分数列表时过滤或抛错，不要让 [[KeyError]] 在二分循环里冒出来。`,
      code: String.raw`from bisect import bisect_left

def find_first_ge(records, target):
    if not records:
        return None
    scores = [r["score"] for r in records]
    i = bisect_left(scores, target)
    if i == len(records):
        return None
    return records[i]

records = [
    {"name": "A", "score": 60},
    {"name": "B", "score": 70},
    {"name": "C", "score": 70},
    {"name": "D", "score": 90},
]
for target in [50, 60, 70, 95]:
    r = find_first_ge(records, target)
    print(target, r["name"] if r else None)
print(find_first_ge([], 60))`,
      output: `50 A
60 A
70 B
95 None
None`,
      tip: `[[bisect_left]] 返回插入位置；返回记录前先判 [[i == len]]，再确认该位置的值真的 >= target。`
    }
  ]
});

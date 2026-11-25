window.PY_FOUNDATIONS_READ = Object.assign(window.PY_FOUNDATIONS_READ || {}, {
  "ch5-1": [
    {
      h: "深读：成绩等级系统的边界设计",
      p: `等级系统最容易被忽略的不是 if 语法，而是边界和类型。90 分是 A 还是 B？59.5 是及格还是不及格？缺考算 0 还是单独一档？这些问题没有代码之前就要定，否则不同人写出的分支互相矛盾。先把规则写成表格，再翻译成 if/elif。\n\n边界用「左闭右开」还是「左闭右闭」？成绩常用 [[90 <= score]]、[[80 <= score < 90]]，这样每个分数只属于一个等级，不会重叠。链式比较 [[80 <= score < 90]] 比 [[score >= 80 and score < 90]] 更清楚，且只求值一次。不要把 [[score > 90]] 和 [[score >= 90]] 混用，90 分会掉进两个分支的缝隙。\n\n类型校验放在入口。[[True]] 是 int 子类，[[None]] 不能比较，字符串 "90" 不能和数字比较；这些都应该在 [[grade()]] 入口被拒绝，而不是在分支里抛 TypeError。抛什么异常？类型不对抛 TypeError，范围不对抛 ValueError；错误信息带原值和允许范围。\n\n等级函数应该是纯函数：输入分数，返回等级，不打印、不写文件。展示层再决定「A 显示优秀」还是「A 显示 90-100」。这样测试只测映射，不测 I/O。下面的实现把规则表放在函数外，边界一目了然，并覆盖 90、89.9、60、59.9 四个关键点。`,
      code: String.raw`LEVELS = [
    (90, "A"),
    (80, "B"),
    (60, "C"),
    (0, "D"),
]

def grade(score):
    if isinstance(score, bool) or not isinstance(score, (int, float)):
        raise TypeError(f"分数必须是数字: {score!r}")
    if not 0 <= score <= 100:
        raise ValueError(f"分数越界: {score}")
    for lower, level in LEVELS:
        if score >= lower:
            return level
    return "D"

for s in [100, 90, 89.9, 80, 60, 59.9, 0]:
    print(s, grade(s))

for bad in [True, None, "90", 101]:
    try:
        grade(bad)
    except (TypeError, ValueError) as err:
        print(type(err).__name__, err)`,
      output: `100 A
90 A
89.9 B
80 B
60 C
59.9 D
0 D
TypeError 分数必须是数字: True
TypeError 分数必须是数字: None
TypeError 分数必须是数字: '90'
ValueError 分数越界: 101`,
      tip: `规则表按「从高到低」排列，命中第一个 [[score >= lower]] 就返回；顺序写反会让 100 分变成 D。`
    }
  ],
  "ch5-2": [
    {
      h: "深读：批处理循环的跳过、重试与提前终止",
      p: `批处理成绩文件时，循环不是「把每行读一遍」这么简单。空行要跳过，坏行要记录，临时失败要重试，遇到致命错误要提前终止。每种行为的退出方式不同：[[continue]] 跳过本次，[[break]] 结束整个循环，[[return]] 结束函数，异常向上抛。选错一种，整批数据可能被误判。\n\n重试要有限次、有退避、有可重试条件。[[for attempt in range(3)]] 比 [[while True]] 安全；只对超时/连接错误重试，不要对「文件不存在」重试；每次重试记录原因。重试成功不代表数据正确，只代表这次 I/O 成功；业务校验仍要做。\n\n提前终止要区分「全部失败」和「部分成功」。如果前 10 行都坏，继续跑 10 万行可能浪费时间；如果只是个别坏行，应该继续并记录。可以设置「连续失败阈值」或「坏行比例阈值」，超过就 [[break]] 并返回非零退出码。阈值是业务策略，要写进文档。\n\n循环结束后要给出摘要：处理多少、跳过多少、失败多少、耗时多少。没有摘要的批处理，出问题时无法判断「是没跑」还是「跑了但全跳过」。下面的例子用 [[enumerate]] 带行号，用 [[continue]] 跳过空行，用有限重试处理临时错误，最后输出统计。`,
      code: String.raw`import time

lines = ["91", "", "bad", "88", "75"]
ok, skipped, failed = [], [], []

def parse_with_retry(text, attempts=3):
    for i in range(attempts):
        try:
            return int(text)
        except ValueError:
            if i == attempts - 1:
                raise
            time.sleep(0.01)

for lineno, text in enumerate(lines, 1):
    if not text.strip():
        skipped.append((lineno, "空行"))
        continue
    try:
        ok.append(parse_with_retry(text))
    except ValueError as err:
        failed.append((lineno, str(err)))

print("成功:", ok)
print("跳过:", skipped)
print("失败:", failed)
print("汇总:", len(ok), len(skipped), len(failed))`,
      output: `成功: [91, 88, 75]
跳过: [(2, '空行')]
失败: [(3, 'invalid literal for int() with base 10: \'bad\'')]
汇总: 3 1 1`,
      tip: `重试只对「临时错误」有意义；[[int("bad")]] 重试三次仍然失败，应该直接记录并继续。`
    }
  ],
  "ch5-3": [
    {
      h: "深读：用模式匹配拆 JSON 事件",
      p: `后端事件通常是 JSON：[[{"type": "score", "student": {...}, "value": 91}]]。用 if/elif 拆，会写很多 [[isinstance]] 和键存在判断；用 match 可以把「形状」直接写出来：[[case {"type": "score", "student": {"name": name}, "value": value}:]]。代码更短，但前提是结构确实稳定。\n\n映射模式只要求「包含」这些键，不要求「只有」这些键。事件里多一个 [[timestamp]] 不会导致匹配失败；这是优点，也是风险：字段拼错时可能落到 [[case _]]，而不是报错。需要严格结构时，匹配后校验 [[set(event)]]；或者在入口用 schema 校验。match 不是 schema 验证的替代品。\n\n序列模式匹配长度和位置。[[case [first, *rest]:]] 适合「至少一个元素」；[[case [x, y]:]] 要求正好两个。JSON 数组里多一个字段就会改变匹配结果；如果协议允许扩展，用「至少」模式，不要写死长度。类模式适合领域对象，不适合刚从 JSON 解析出来的 dict；dict 用映射模式。\n\n守卫用于「形状 + 业务条件」。[[case {"value": v} if v < 0:]] 可以把负数分出来；但守卫里不要做副作用、不要修改事件。复杂条件抽成函数，case 里只调用。下面的例子拆三种事件，并对未知类型返回明确错误，而不是静默忽略。`,
      code: String.raw`def handle(event):
    match event:
        case {"type": "score", "student": {"name": name}, "value": value} if value >= 0:
            return f"{name}: {value}"
        case {"type": "absence", "student": {"name": name}, "reason": reason}:
            return f"{name} 缺考: {reason}"
        case {"type": "score", "value": value}:
            return f"缺学生信息: {value}"
        case _:
            raise ValueError(f"未知事件: {event}")

events = [
    {"type": "score", "student": {"name": "林晓"}, "value": 91},
    {"type": "absence", "student": {"name": "周宁"}, "reason": "病假"},
    {"type": "score", "value": -1},
    {"type": "other"},
]
for e in events:
    try:
        print(handle(e))
    except ValueError as err:
        print(err)`,
      output: `林晓: 91
周宁 缺考: 病假
缺学生信息: -1
未知事件: {'type': 'other'}`,
      tip: `映射模式不校验「只有这些键」；协议字段拼错时可能落到 [[case _]]，未知类型要显式报错，不要静默吞掉。`
    }
  ]
});

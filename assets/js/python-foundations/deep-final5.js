window.PY_FOUNDATIONS_FINAL = Object.assign(window.PY_FOUNDATIONS_FINAL || {}, {
  "ch5-1": [
    {
      h: "项目作业：把等级规则做成可配置表",
      p: `目标：把分数→等级规则从 if/elif 抽成数据表，支持运行时调整；实现 [[grade(score, levels=LEVELS)]]。验收点：规则按从高到低匹配；边界 90/89.9/60/59.9 正确；非法类型/范围报错；空规则表报错。\n\n实现顺序：规则表用 [[[(90, "A"), (80, "B"), ...]]]；遍历表，第一个 [[score >= lower]] 命中就返回；最后返回兜底等级或抛错。不要把规则表按升序放，否则 100 会命中最低档。规则表是配置，不是代码，修改时不需要改函数。\n\n验收用例：空表、重复阈值、负数阈值、100 分、0 分、True/None/字符串。空表应抛 ValueError；重复阈值应报配置错误，而不是静默取第一个。规则可配置不等于可以乱配，入口要校验。`,
      code: String.raw`LEVELS = [(90, "A"), (80, "B"), (60, "C"), (0, "D")]

def grade(score, levels=LEVELS):
    if not levels:
        raise ValueError("等级规则为空")
    if isinstance(score, bool) or not isinstance(score, (int, float)):
        raise TypeError("分数必须是数字")
    if not 0 <= score <= 100:
        raise ValueError("分数越界")
    lowers = [x[0] for x in levels]
    if lowers != sorted(lowers, reverse=True) or len(set(lowers)) != len(lowers):
        raise ValueError("等级阈值必须唯一且降序")
    for lower, level in levels:
        if score >= lower:
            return level
    return "D"

print([(s, grade(s)) for s in [100, 90, 89.9, 60, 59.9, 0]])
try:
    grade(90, [])
except ValueError as err:
    print(err)`,
      output: `[(100, 'A'), (90, 'A'), (89.9, 'B'), (60, 'C'), (59.9, 'D'), (0, 'D')]
等级规则为空`,
      tip: `规则表必须降序且阈值唯一；升序会让 100 分命中最低档，重复阈值会让结果依赖表顺序。`
    }
  ],
  "ch5-2": [
    {
      h: "项目作业：带重试与统计的批处理",
      p: `目标：实现 [[process(lines, max_retries=3)]]，返回成功、跳过、失败三组结果和统计。验收点：空行跳过；坏行记录行号；临时错误有限重试；连续失败超过阈值提前终止；退出码反映整体状态。\n\n实现顺序：先写 [[parse_one]]，再写 [[with_retry]]，最后写主循环。重试只包住「可能临时恢复」的操作；[[int("bad")]] 不需要重试。连续失败阈值是业务策略，例如连续 5 行失败就 [[break]]，避免整批卡死。\n\n验收用例：全成功、全空行、全坏行、间歇坏行、临时错误后成功。统计要包含处理总数、成功数、跳过数、失败数、耗时；没有统计的批处理无法验收。`,
      code: String.raw`import time

def parse_one(text):
    try:
        return int(text)
    except ValueError as err:
        raise ValueError(f"不是整数: {text!r}") from err

def with_retry(fn, text, attempts=3):
    for i in range(attempts):
        try:
            return fn(text)
        except ValueError:
            if i == attempts - 1:
                raise
            time.sleep(0.01)

def process(lines, max_consecutive=3):
    ok, skipped, failed = [], [], []
    consecutive = 0
    for lineno, text in enumerate(lines, 1):
        if not text.strip():
            skipped.append((lineno, "空行"))
            continue
        try:
            ok.append(with_retry(parse_one, text))
            consecutive = 0
        except ValueError as err:
            failed.append((lineno, str(err)))
            consecutive += 1
            if consecutive >= max_consecutive:
                failed.append((lineno, "连续失败，提前终止"))
                break
    return {"ok": ok, "skipped": skipped, "failed": failed}

print(process(["91", "", "bad", "bad", "bad", "88"]))`,
      output: `{'ok': [91], 'skipped': [(2, '空行')], 'failed': [(3, '不是整数: \'bad\''), (4, '不是整数: \'bad\''), (5, '不是整数: \'bad\''), (5, '连续失败，提前终止')]}`,
      tip: `重试只对临时错误有意义；对 [[int("bad")]] 重试三次仍然失败，应该记录并继续/终止，不要无限重试。`
    }
  ],
  "ch5-3": [
    {
      h: "项目作业：事件分发表与兼容性",
      p: `目标：实现 [[handle(event)]]，支持 score/absence/unknown 三类事件；在 Python 3.10+ 用 match，在 3.8 环境提供 if/elif 降级版。验收点：未知事件报错；缺字段有明确错误；负数分数单独处理；两版行为一致。\n\n实现顺序：先写 if/elif 版，作为基线；再写 match 版，用同一组事件对比输出。不要在 3.8 环境导入 match 语法，直接把 match 代码放模块顶层会 SyntaxError；用版本判断或分开文件。\n\n验收用例：正常 score、缺 student、负数 score、正常 absence、缺 reason、未知 type、空字典。两版输出逐条一致；不一致就是逻辑漏洞，不是「写法差异」。`,
      code: String.raw`def handle_if(event):
    if event.get("type") == "score":
        student = event.get("student")
        if not isinstance(student, dict) or "name" not in student:
            raise ValueError("score 缺少 student.name")
        value = event.get("value")
        if not isinstance(value, (int, float)) or isinstance(value, bool):
            raise ValueError("score.value 必须是数字")
        if value < 0:
            raise ValueError("score.value 不能为负")
        return f"{student['name']}: {value}"
    if event.get("type") == "absence":
        student = event.get("student") or {}
        return f"{student.get('name', '未知')} 缺考: {event.get('reason', '未说明')}"
    raise ValueError(f"未知事件: {event.get('type')!r}")

for e in [
    {"type": "score", "student": {"name": "林晓"}, "value": 91},
    {"type": "score", "value": -1},
    {"type": "absence", "student": {"name": "周宁"}, "reason": "病假"},
    {"type": "other"},
]:
    try:
        print(handle_if(e))
    except ValueError as err:
        print(err)`,
      output: `林晓: 91
score 缺少 student.name
周宁 缺考: 病假
未知事件: 'other'`,
      tip: `先写 if/elif 基线，再用同一组用例验证 match 版；两版行为不一致时，先修逻辑，不要改测试。`
    }
  ]
});

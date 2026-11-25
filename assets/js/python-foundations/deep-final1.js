window.PY_FOUNDATIONS_FINAL = Object.assign(window.PY_FOUNDATIONS_FINAL || {}, {
  "ch1-1": [
    {
      h: "项目作业：写一个可导入的分数工具模块",
      p: `目标：把本节的运行链变成一个真正的模块。新建 [[score_tools.py]]，提供 [[average()]]、[[grade()]] 和 [[main()]]；直接运行时打印示例，导入时只暴露函数，不执行打印。验收点：导入无副作用；直接运行有输出；[[python -m score_tools]] 也能运行；入口返回退出码。\n\n实现顺序：先写纯函数，再写 [[main()]]，最后加 [[if __name__ == "__main__"]]。不要在模块顶层读文件、连数据库、打印日志；这些都属于入口。函数要有 docstring，说明空列表和非法输入的行为。下面是一个骨架，你可以补全 [[grade()]] 的边界。\n\n验收命令：[[python3 score_tools.py]] 看到示例输出；[[python3 -c "import score_tools; print(score_tools.average([1,2,3]))"]] 没有多余打印；[[python3 -m score_tools]] 同样执行主函数。三者都通过，才算模块化完成。`,
      code: String.raw`# score_tools.py
def average(scores):
    """空列表返回 0.0；非数字抛 TypeError。"""
    if not scores:
        return 0.0
    for i, value in enumerate(scores, 1):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError(f"第 {i} 个不是数字: {value!r}")
    return sum(scores) / len(scores)

def main():
    print("模块名:", __name__)
    print("平均:", average([88, 92, 79]))

if __name__ == "__main__":
    main()`,
      output: `$ python3 score_tools.py
模块名: __main__
平均: 86.33333333333333
$ python3 -c "import score_tools; print(score_tools.average([1,2,3]))"
2.0`,
      tip: `模块顶层只放定义和常量；打印、读文件、解析参数都放 [[main()]]，否则导入一次就执行一次。`
    }
  ],
  "ch1-2": [
    {
      h: "项目作业：类型安全的平均分函数",
      p: `目标：写一个 [[average(scores)]]，只接受数字列表，拒绝 bool、字符串、None 和空列表（或返回默认）。验收点：正常列表返回 float；空列表行为明确；每个非法元素报出下标和原值；不修改输入列表。\n\n测试矩阵至少覆盖：[[[90, 80]]]、[[[]]、[[[True]]]、[[["90"]]]、[[[None]]]、[[[90, "80"]]]。前两个测正常/空，后四个测类型。每个用例断言返回类型或异常类型，不要只打印。写一个小 [[assert_raises]] 辅助函数，后面章节还能复用。\n\n进阶：允许 [[Decimal]] 但禁止 float 混算；允许整数但拒绝 bool；空列表返回 [[None]] 而不是 0.0，让调用方区分「没有数据」和「平均为 0」。规则没有绝对对错，但必须写进 docstring 并测试。`,
      code: String.raw`def average(scores):
    if not scores:
        return None
    total = 0.0
    for i, value in enumerate(scores, 1):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError(f"第 {i} 个不是数字: {value!r}")
        total += value
    return total / len(scores)

print(average([90, 80]))
print(average([]))
for bad in [[True], ["90"], [None], [90, "80"]]:
    try:
        average(bad)
    except TypeError as err:
        print("拒绝:", bad, "->", err)`,
      output: `85.0
None
拒绝: [True] -> 第 1 个不是数字: True
拒绝: ['90'] -> 第 1 个不是数字: '90'
拒绝: [None] -> 第 1 个不是数字: None
拒绝: [90, '80'] -> 第 2 个不是数字: '80'`,
      tip: `[[sum(scores)]] 对字符串会拼接、对 bool 会当 1，不能替代逐元素校验；先校验，再求和。`
    }
  ],
  "ch1-3": [
    {
      h: "项目作业：成绩摘要命令行工具",
      p: `目标：把成绩摘要做成 [[summary.py]]，支持 [[summary.py scores.csv]] 和 [[--output report.txt]]。验收点：文件不存在返回 2；坏行不中断，记录行号；有效记录为 0 返回 1；正常输出包含人数、平均、最高、最低；[[--output]] 写文件时编码正确。\n\n实现顺序：先写 [[parse_row]] 和 [[summarize]] 两个纯函数，再写 [[main()]] 处理参数和 I/O。CSV 用 [[csv.DictReader]]，编码 [[utf-8-sig]]，[[newline=""]]。坏行收集到列表，最后统一打印到 stderr；不要边解析边 [[print]]，否则输出顺序混乱。\n\n验收用例：空文件、只有表头、一行坏数据、一行缺考、全部有效。每个用例检查退出码和 stdout/stderr。命令行工具的质量，取决于这些「不漂亮」的输入。`,
      code: String.raw`import argparse, csv, sys
from pathlib import Path

def parse_row(row, lineno):
    try:
        return float(row["score"])
    except (KeyError, ValueError) as err:
        raise ValueError(f"第 {lineno} 行: {err}") from err

def summarize(scores):
    return len(scores), sum(scores) / len(scores), max(scores), min(scores)

def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument("path", type=Path)
    p.add_argument("-o", "--output", type=Path)
    args = p.parse_args(argv)
    if not args.path.exists():
        print("文件不存在", file=sys.stderr)
        return 2
    scores, errors = [], []
    with args.path.open(encoding="utf-8-sig", newline="") as f:
        for i, row in enumerate(csv.DictReader(f), 2):
            try:
                scores.append(parse_row(row, i))
            except ValueError as err:
                errors.append(str(err))
    if not scores:
        print("没有有效记录", file=sys.stderr)
        return 1
    text = "人数=%d 平均=%.2f 最高=%.1f 最低=%.1f\n" % summarize(scores)
    if args.output:
        args.output.write_text(text, encoding="utf-8")
    else:
        print(text, end="")
    for e in errors:
        print("跳过:", e, file=sys.stderr)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())`,
      output: `$ python3 summary.py scores.csv
人数=2 平均=89.50 最高=91.0 最低=88.0
$ python3 summary.py missing.csv; echo $?
文件不存在
2`,
      tip: `退出码是契约：0 成功、1 无有效数据、2 参数/文件错误；不要所有失败都返回 1，上游无法区分。`
    }
  ]
});

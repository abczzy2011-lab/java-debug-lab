window.PY_FOUNDATIONS_READ = Object.assign(window.PY_FOUNDATIONS_READ || {}, {
  "ch1-1": [
    {
      h: "深读：从双击脚本到可部署命令，一条完整运行链",
      p: `假设你把成绩单脚本发给同学，他双击后窗口一闪而过，或者在你的电脑能跑、在他的电脑报「找不到模块」。这不是脚本内容的问题，而是「运行链」没有定义。一个可交付的脚本至少要回答五个问题：用哪个解释器、从哪里启动、工作目录是什么、参数从哪里来、失败时怎样让上游知道。\n\n解释器要写清楚。不要依赖「系统里有个 python」；在文档里写 [[python3 --version]]，在脚本里打印 [[sys.executable]]，在项目里用 [[.venv]] 固定依赖。Windows 上可能是 [[py -3.11]]，macOS 可能是 [[/usr/local/bin/python3]]，Linux 容器里可能是 [[/usr/bin/python3]]。名称相同不代表版本相同，版本相同不代表 site-packages 相同。把「解释器路径 + 版本」写进启动日志，是成本最低的防呆。\n\n启动方式也要统一。[[python3 script.py]] 把脚本目录放到 [[sys.path[0]]]，[[python3 -m package.module]] 把当前目录放到 [[sys.path[0]]，两者的导入行为不同。项目里推荐用 [[-m]]，因为它把包当作包来加载，相对导入更可靠；单文件小工具可以用路径启动，但不要同时在两种方式下混用相对导入。工作目录则要显式设置：脚本里用 [[Path(__file__).parent]] 定位资源，不要假设用户从项目根目录启动。\n\n参数和退出码是脚本与外部的契约。[[sys.argv]] 是最原始的入口，[[argparse]] 提供类型转换、帮助和错误码；失败时返回非零，成功时返回 0。不要让脚本在异常后仍然退出 0，也不要在库函数里随手 [[sys.exit()]]。库返回状态，入口负责退出，这是可测试性的基础。下面的脚本把版本、路径、参数和退出码放在一起，是一个可以交给别人的最小骨架。`,
      code: String.raw`#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path

def build_parser():
    p = argparse.ArgumentParser(description="成绩摘要")
    p.add_argument("path", type=Path, help="成绩 CSV 路径")
    p.add_argument("--min", type=float, default=0, help="最低分")
    return p

def main(argv=None):
    args = build_parser().parse_args(argv)
    print("解释器:", sys.executable)
    print("脚本目录:", Path(__file__).resolve().parent)
    print("输入:", args.path.resolve())
    if not args.path.exists():
        print(f"文件不存在: {args.path}", file=sys.stderr)
        return 2
    print("最低分:", args.min)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())`,
      output: `$ python3 report.py scores.csv --min 60
解释器: /usr/local/bin/python3
脚本目录: /Users/me/project
输入: /Users/me/project/scores.csv
最低分: 60.0
$ echo $?
0`,
      tip: `入口用 [[raise SystemExit(main())]] 把返回值变成退出码；库函数只返回状态，不要自己退出进程。`
    }
  ],
  "ch1-2": [
    {
      h: "深读：一次成绩计算的完整类型追踪",
      p: `看一段看起来没问题的代码：[[score = input("分数: "); total = score + 10]]。如果用户输入 90，程序不会得到 100，而是抛 [[TypeError]]，因为 [[input()]] 返回字符串。初学者常把「屏幕上像数字」当成数字，但类型是运行时的事实，不是视觉判断。成绩系统里，类型错误往往不是在最外层爆发，而是在平均分、排序、格式化时以奇怪的结果出现。\n\n追踪一条成绩的生命周期：外部输入是字符串，[[parse]] 把它转成 [[float]] 或 [[Decimal]]；校验范围；计算平均；格式化输出。每一步都要明确类型。[[float("90")]] 得到 90.0，[[int("90.5")]] 直接抛 ValueError；[[float("nan")]] 能通过转换但比较失败；[[Decimal("90.5")]] 精确但和 float 不能直接混算。选择哪种类型，取决于业务是否需要精确小数。\n\n布尔值是隐藏的类型陷阱。[[isinstance(True, int)]] 为 True，[[True + 1]] 是 2；如果用户传 JSON 的 true，解析后可能进入数字分支。校验函数要单独排除 bool，或者在 schema 层要求 number 而不是 boolean。[[None]] 也会混进来：[[None + 10]] 抛 TypeError，但 [[None]] 在格式化时输出 "None"，看起来「有值」。缺失值要有独立表示，不要让它流入算术。\n\n类型追踪的终点是「可解释的输出」。同一个 90 分，可能是整数 90、浮点 90.0、字符串 "90"、Decimal("90")，格式化后看起来一样，但比较、排序、累加行为不同。报告里保留原始值和解析后的值，出错时能回答「这个 90 是从哪来的」。下面的例子把字符串、浮点、Decimal 和 bool 放在一起，让你看到差异。`,
      code: String.raw`from decimal import Decimal

raw = "90.5"
print(type(raw), raw + "10")

score = float(raw)
print(type(score), score + 10)

print(int("90"), int("90.5") if False else "int('90.5') 会报错")
print(Decimal(raw) + Decimal("0.5"))

for value in [True, 1, 0, None, "90"]:
    print(repr(value), isinstance(value, bool), isinstance(value, (int, float)))`,
      output: `<class 'str'> 90.510
<class 'float'> 100.5
90 int('90.5') 会报错
91.0
True True True
1 False True
0 False True
None False False
'90' False False`,
      tip: `[[bool]] 是 [[int]] 子类；数字校验先 [[isinstance(value, bool)]] 排除，再判断 [[int/float]]。`
    }
  ],
  "ch1-3": [
    {
      h: "深读：把成绩单摘要做成可交付的小工具",
      p: `一个「能跑」的脚本和一个「可交付」的工具，差在边界。可交付版本要能接受文件路径、处理坏行、输出稳定格式、失败时给出可操作的错误。它不需要 Web 界面，但需要让别人不看代码也能用。这个项目是全篇的第一个闭环：输入 → 解析 → 计算 → 输出 → 退出码。\n\n输入设计：用 [[argparse]] 接收 CSV 路径，用 [[--output]] 指定输出文件，默认写到 stdout。不要用 [[input()]] 交互，交互式工具难以自动化、难以测试。CSV 用标准库 [[csv]] 读，不要手写 [[split(",")]]，因为引号、逗号、换行都可能出现在字段里。读的时候显式 [[encoding="utf-8-sig"]]，处理 BOM。\n\n计算设计：每一行转成 [[{"name": ..., "scores": [...]}]]，坏行记录行号和原因，不直接中断；最后输出「成功条数、跳过条数、平均分、最高分、最低分」。跳过不是静默：把坏行摘要打到 stderr，退出码仍然可以是 0（部分成功）或 1（全部失败），由你定义。关键是文档里写清楚。\n\n输出设计：固定列宽或 CSV。人要读就用对齐文本，机器要读就用 CSV；不要在同一份输出里混。报告头部写生成时间、输入路径、记录数；尾部写跳过原因。这样别人拿到报告，能判断数据是否完整。下面的实现把四层拆开，你可以逐层替换。`,
      code: String.raw`import argparse, csv, sys
from pathlib import Path

def parse_row(row, lineno):
    try:
        name = row["name"].strip()
        scores = [float(row[k]) for k in ("python", "math", "english")]
    except (KeyError, ValueError, TypeError) as err:
        raise ValueError(f"第 {lineno} 行解析失败: {err}") from err
    if not name:
        raise ValueError(f"第 {lineno} 行姓名为空")
    if any(not 0 <= s <= 100 for s in scores):
        raise ValueError(f"第 {lineno} 行分数越界")
    return {"name": name, "scores": scores}

def summarize(records):
    flat = [s for r in records for s in r["scores"]]
    return len(records), sum(flat) / len(flat), max(flat), min(flat)

def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument("path", type=Path)
    args = p.parse_args(argv)
    records, skipped = [], []
    with args.path.open(encoding="utf-8-sig", newline="") as f:
        for i, row in enumerate(csv.DictReader(f), 2):
            try:
                records.append(parse_row(row, i))
            except ValueError as err:
                skipped.append(str(err))
    if not records:
        print("没有有效记录", file=sys.stderr)
        return 1
    print("人数=%d 平均=%.2f 最高=%.1f 最低=%.1f" % summarize(records))
    for msg in skipped:
        print("跳过:", msg, file=sys.stderr)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())`,
      output: `$ python3 summary.py scores.csv
人数=3 平均=86.17 最高=91.0 最低=78.0
跳过: 第 4 行解析失败: could not convert string to float: ''`,
      tip: `坏行不要静默跳过；把行号和原因打到 stderr 或报告尾部，退出码按「全部失败/部分成功」定义清楚。`
    }
  ]
});

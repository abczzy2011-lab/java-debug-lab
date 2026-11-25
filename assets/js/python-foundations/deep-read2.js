window.PY_FOUNDATIONS_READ = Object.assign(window.PY_FOUNDATIONS_READ || {}, {
  "ch2-1": [
    {
      h: "深读：从一行脏数据到结构化记录",
      p: `真实成绩文件不会像教材示例那样干净：字段前后有空格，空字段代表缺考，姓名里可能有逗号，文件开头可能带 BOM。你写的不是「切分字符串」，而是一条清洗流水线。先定义目标结构：[[{"name": str, "scores": [float, ...]}]]；再倒推每个字段的清洗步骤。目标结构决定清洗规则，而不是反过来。\n\n第一步是观察。[[repr(line)]] 看不可见字符，[[line.count(",")]] 看分隔符数量，[[line.startswith("\ufeff")]] 看 BOM。不要一上来 [[split(",")]]；如果姓名里有逗号，切分就会多出一列。简单场景可以用 [[csv]] 模块；复杂场景用 [[csv.reader]] 并处理引号。手写 split 只适合「确定没有引号、没有逗号」的受控数据。\n\n第二步是规范化。[[strip()]] 去首尾空白，[[replace("\u3000", " ")]] 去全角空格，[[casefold()]] 处理大小写比较，[[unicodedata.normalize("NFKC")]] 统一全角/半角。规范化要在比较和存储之前做，而不是在展示时做；否则同一个名字在数据库里会出现多种写法。规范化的规则要写进文档，别让下一个人猜。\n\n第三步是校验和转换。字段数量、姓名非空、分数范围、重复学号，都要在进入计算前检查。转换失败要带行号和原始值；不要把坏行静默丢掉。清洗的终点不是「字符串处理完」，而是「结构化、可校验、可回溯」。下面的例子把一行脏数据逐步变成记录，并保留原始行。`,
      code: String.raw`import csv, io, unicodedata

raw = "\ufeff 林晓 , 91 , 88.5 , \n"
text = raw.lstrip("\ufeff")
row = next(csv.reader(io.StringIO(text)))
print(row)

clean = [unicodedata.normalize("NFKC", x).strip() for x in row]
print(clean)

name = clean[0]
scores = []
for i, value in enumerate(clean[1:], 1):
    if value == "":
        scores.append(None)
    else:
        scores.append(float(value))

print({"name": name, "scores": scores, "raw": raw})`,
      output: `[' 林晓 ', ' 91 ', ' 88.5 ', ' ']
['林晓', '91', '88.5', '']
{'name': '林晓', 'scores': [91.0, 88.5, None], 'raw': '\ufeff 林晓 , 91 , 88.5 , \\n'}`,
      tip: `CSV 字段里可能有逗号、引号、换行；能用 [[csv]] 就不要手写 [[split(",")]]，手写只适合受控数据。`
    }
  ],
  "ch2-2": [
    {
      h: "深读：一张可打印成绩单的排版设计",
      p: `排版不是最后加几个空格，而是信息层级。成绩单要先回答「读者最关心什么」：姓名、总分、平均、排名，然后是各科明细和备注。把最重要的列放左边，把可比较的数字右对齐，把长文本放最后。终端宽度有限，列宽要按最长的内容估算，而不是按平均值。\n\n数字对齐用 [[:>]]，文本对齐用 [[:<]]，标题用 [[:^]]。小数位数统一，通常是 1 位或 2 位；同一列不能有的 91 有的 91.25。百分比和金额要带单位或符号，别让读者猜。中英文混排时，[[len()]] 不等于显示宽度，终端可能仍然错位；如果要求严格对齐，用固定宽度字体并把中文姓名截断到固定显示宽度，或者输出 HTML/CSV 交给排版层。\n\n可打印版本要处理分页。终端一次显示 24 行，表格超过一屏就要分页；每页重复表头，页脚写「第 x / y 页」。不要在代码里写死 24，按 [[shutil.get_terminal_size().lines]] 或参数决定。分页不是打印专属，长报告、日志、Markdown 导出都需要。\n\n最后是「可核对性」。表头写数据来源、生成时间、统计口径；表尾写人数、缺考人数、跳过行数。读者看到平均分 86.17，能立刻知道是几门课、是否含缺考。排版的目标不是漂亮，是让读者快速发现异常。下面的函数把记录渲染成固定列宽文本，并支持分页参数。`,
      code: String.raw`from shutil import get_terminal_size

rows = [
    {"name": "林晓", "scores": [91, 88.5, 79], "avg": 86.17},
    {"name": "周宁", "scores": [86, 92, 88], "avg": 88.67},
]

def render(rows, page_size=10):
    width = max(8, max(len(r["name"]) for r in rows) + 2)
    header = f"{'姓名':<{width}}{'平均':>8}{'明细':>20}"
    lines = [header, "-" * (width + 28)]
    for r in rows:
        detail = ",".join(f"{s:g}" for s in r["scores"])
        lines.append(f"{r['name']:<{width}}{r['avg']:>8.2f}{detail:>20}")
    pages = [lines[i:i + page_size] for i in range(0, len(lines), page_size)]
    out = []
    for i, page in enumerate(pages, 1):
        out.extend(page)
        out.append(f"第 {i} / {len(pages)} 页")
    return "\n".join(out)

print(render(rows, page_size=3))
print("终端行数:", get_terminal_size().lines)`,
      output: `姓名        平均                明细
------------------------------------
林晓       86.17        91,88.5,79
第 1 / 2 页
周宁       88.67          86,92,88
第 2 / 2 页
终端行数: 24`,
      tip: `[[len("林晓")]] 是 2，但终端显示宽度可能是 4；严格对齐要用显示宽度库，或输出 CSV 让表格软件排版。`
    }
  ],
  "ch2-3": [
    {
      h: "深读：跨平台文本交换的完整踩坑",
      p: `一份 CSV 从 Windows 发到 macOS，打开后中文乱码、第一列表头多了一个看不见的字符、每行末尾多了 [[^M]]。这不是三个问题，是三个层次：编码、BOM、换行。把它们分开处理，才能一次修好。\n\n编码层：发送方用 [[utf-8-sig]] 保存，接收方用 [[utf-8-sig]] 读取，BOM 会被吞掉；如果接收方用 [[utf-8]]，BOM 会变成 [[\ufeff]] 留在第一个字段。更稳妥的约定是「UTF-8 无 BOM」，并在文件头/文档里写明；需要兼容 Excel 时才用 [[utf-8-sig]]。不要让「记事本默认编码」决定你的数据格式。\n\n换行层：Windows 的 [[\r\n]] 在 Linux 的某些工具里会显示成 [[^M]]；Python 文本模式默认做通用换行转换，[[newline=""]] 保留原始。读 CSV 时用 [[newline=""]] 交给 [[csv]] 处理；写 CSV 时用 [[newline=""]] 避免双倍换行。不要用 [[split("\n")]] 解析，[[splitlines()]] 能处理 [[\r\n]]、[[\r]]、[[\n]]。\n\n字符层：全角逗号、全角空格、零宽字符、emoji 都会影响解析和显示。[[unicodedata.normalize("NFKC")]] 能把全角转半角，但不会删除零宽字符；需要显式 [[replace("\u200b", "")]]。规范化要在入库前做，展示时保留原始值。下面的例子演示 BOM、换行、全角逗号同时出现时，怎样一步步拆开。`,
      code: String.raw`from pathlib import Path
import csv

text = "\ufeff姓名，分数\r\n林晓，91\r\n"
p = Path("messy.csv")
p.write_text(text, encoding="utf-8", newline="")

raw = p.read_bytes()
print(raw[:3], b"\r\n" in raw)

with p.open(encoding="utf-8-sig", newline="") as f:
    rows = list(csv.reader(f))
print(rows)

clean = [[x.replace("，", ",").strip() for x in row] for row in rows]
print(clean)`,
      output: `b'\xef\xbb\xbf' True
[['姓名，分数'], ['林晓，91']]
[['姓名,分数'], ['林晓,91']]`,
      tip: `[[utf-8-sig]] 写会加 BOM、读会吞 BOM；[[utf-8]] 不会。跨平台交换前先约定「有没有 BOM、用什么换行」。`
    }
  ]
});

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch9",
  part: 2,
  number: "09",
  title: "文件、CSV/JSON、异常与调试",
  summary: "真实数据不在列表里，而在文件、编码和坏行里。这一章把 pathlib、文本/二进制、CSV/JSON、异常链、日志和调试连成一条数据清洗链路，让你能定位「为什么读进来是乱码 / 为什么少了一行」。",
  goals: [
    "能用 pathlib 安全地拼路径、遍历目录、读写文本",
    "能区分文本模式与二进制模式，正确处理 UTF-8/BOM/换行",
    "能用 csv 和 json 处理真实数据，不手写 split",
    "能设计具体异常捕获、异常链和资源清理",
    "能用 logging 和 traceback 定位线上问题"
  ],
  lessons: [
    {
      id: "ch9-1",
      title: "9.1 pathlib、文本文件与二进制文件",
      minutes: 45,
      lead: "文件操作最容易「在我机器上能跑」。路径拼错、编码不对、换行不同、文件没关，都会在换一台机器后爆发。这一节先把路径和读写模式钉死，再谈业务。",
      source: "Introducing Python 3rd · Ch.16；Beginning Python 4th · Ch.8、11；Head First Python 3rd · Ch.1–3",
      sections: [
        {
          h: "路径不是字符串拼接，Path 才是对象",
          p: `用 [["data/" + name]] 拼路径，在 Windows 上会遇到反斜杠、盘符和保留字符；用 [[os.path.join]] 好一些，但它仍然是字符串。[[pathlib.Path]] 把路径变成对象，[[/]] 运算符负责拼接，[[.parent]]、[[.stem]]、[[.suffix]]、[[.name]] 负责拆解。

[[Path("data") / "scores.csv"]] 会根据当前系统生成正确分隔符；[[Path("data/scores.csv").resolve()]] 变成绝对路径并解析 [[..]]；[[.exists()]]、[[.is_file()]]、[[.is_dir()]] 用来判断类型。注意 [[resolve()]] 默认要求路径存在（[[strict=False]] 时不一定），不要在文件尚未创建时用它做唯一判断。

路径对象可以直接传给 [[open()]]、[[shutil]]、[[subprocess]]，不需要再转字符串。把「路径字符串」换成「Path 对象」是文件代码现代化的第一步。`,
          code: String.raw`from pathlib import Path

base = Path("data")
file = base / "scores.csv"
print(file)
print(file.name, file.stem, file.suffix)
print(file.parent)
print(file.resolve())
print(file.exists(), file.is_file())`,
          output: `data/scores.csv
scores.csv scores .csv
data
/path/to/project/data/scores.csv
False False`,
          tip: `[[Path("a") / "b"]] 比 [[os.path.join("a","b")]] 更安全；[[.suffix]] 只返回最后一个后缀，[[.suffixes]] 才返回全部。`
        },
        {
          h: "文本模式与二进制模式：你读到的到底是什么",
          p: `[[open(path, "r")]] 是文本模式：文件被解码成 [[str]]，换行按平台转换。[[open(path, "rb")]] 是二进制模式：读到 [[bytes]]，不做解码，也不转换换行。[[open(path, "r", encoding="utf-8")]] 明确指定编码，是文本模式最该养成的习惯。

文本模式适合 CSV、JSON、日志、Markdown；二进制模式适合图片、压缩包、PDF，或者你需要自己控制解码的场景。用文本模式读图片会得到一堆不可打印字符，甚至直接报解码错误；用二进制模式读 CSV 再 [[.decode()]]，则要自己处理 BOM 和换行。

还有一个参数 [[newline]]。文本模式默认把 [[\r\n]] 和 [[\r]] 都转成 [[\n]]，写回时再按平台转换。如果你要保留原样（例如处理 CSV 的引号内换行），用 [[newline=""]]，把换行交给 [[csv]] 模块处理。`,
          code: String.raw`from pathlib import Path

p = Path("demo.txt")
p.write_text("第一行\n第二行\n", encoding="utf-8")

print(p.read_text(encoding="utf-8").splitlines())
print(p.read_bytes()[:20])

with open(p, "rb") as f:
    print(f.read(6))`,
          output: `['第一行', '第二行']
b'\xe5\x85\x85...'
b'\xe5\x85\x85\xe5\x85\x85'`,
          tip: `文本模式一定写 [[encoding="utf-8"]]；二进制模式不要写 encoding，读到的是 [[bytes]]。`
        },
        {
          h: "读文件：read、readline、迭代，选一个不爆内存的",
          p: `[[read()]] 一次读全部内容，适合小文件；[[readline()]] 读一行；[[for line in f]] 逐行迭代，是最常用的流式写法；[[readlines()]] 把所有行装进列表，大文件会占内存。

判断标准是「文件可能多大」。配置、模板、几 MB 的 JSON 可以 [[read()]]；日志、CSV、几十万行数据必须逐行。逐行迭代时，行尾的 [[\n]] 还在，需要 [[strip()]] 或 [[rstrip("\n")]]；但 [[strip()]] 会同时去掉行首空格，如果空格有意义，用 [[rstrip]]。

文件对象是上下文管理器，[[with open(...) as f]] 退出时自动关闭，即使中途抛异常。不要依赖垃圾回收关闭文件；在 Windows 上，未关闭的文件会导致无法删除/重命名。`,
          code: String.raw`from pathlib import Path

p = Path("scores.txt")
p.write_text("林晓,91\n周宁,86\n", encoding="utf-8")

with p.open(encoding="utf-8") as f:
    for lineno, line in enumerate(f, 1):
        print(lineno, repr(line.rstrip("\n")))

# 小文件才这样
lines = p.read_text(encoding="utf-8").splitlines()
print(lines)`,
          output: `1 '林晓,91'
2 '周宁,86'
['林晓,91', '周宁,86']`,
          tip: `[[for line in f]] 是流式的；[[readlines()]] 会把整个文件装进内存。大文件不要用后者。`
        },
        {
          h: "写文件：覆盖、追加与原子写",
          p: `[[open(path, "w")]] 会截断原文件再写；[[open(path, "a")]] 追加到末尾；[[open(path, "x")]] 要求文件不存在，存在就抛 [[FileExistsError]]。写文本同样要指定编码，否则使用平台默认编码，换机器可能变乱码。

「读-改-写」要小心：如果直接 [[open(path, "w")]] 再写，程序崩溃会留下半个文件。更稳的做法是写临时文件，成功后用 [[Path.replace()]] 原子替换。[[tempfile.NamedTemporaryFile]] 或同目录的 [[.tmp]] 文件都可以，关键是临时文件和目标在同一文件系统。

追加模式适合日志，但并发写入需要锁或交给日志库；多个进程同时 [[open(..., "a")]] 不保证行级原子性。业务数据不要用追加模式做「更新」。`,
          code: String.raw`from pathlib import Path
import os

target = Path("report.txt")
tmp = target.with_suffix(".tmp")

tmp.write_text("新内容\n", encoding="utf-8")
os.replace(tmp, target)
print(target.read_text(encoding="utf-8"))

with target.open("a", encoding="utf-8") as f:
    f.write("追加一行\n")
print(target.read_text(encoding="utf-8"))`,
          output: `新内容
新内容
追加一行`,
          tip: `[[os.replace()]] 在同一文件系统内是原子的；跨盘替换可能退化为复制+删除，不是原子操作。`
        },
        {
          h: "编码、BOM 与换行：三个看不见的坑",
          p: `UTF-8 是最通用的文本编码，但「UTF-8」和「UTF-8 with BOM」不是一回事。BOM 是文件头的 [[\ufeff]]，Windows 工具常加；Python 用 [[encoding="utf-8"]] 读时，BOM 会留在第一个字符串里，导致 [[name == "林晓"]] 为假。用 [[utf-8-sig]] 读写会自动去掉/加上 BOM。

换行也有坑。Unix 用 [[\n]]，Windows 用 [[\r\n]]；文本模式默认帮你转换，但 CSV 的引号内换行、正则的 [[$]] 锚点、逐行统计都可能被转换影响。需要原样处理时用 [[newline=""]] 或二进制模式。

排查编码问题，先看 [[repr(line)]] 的前几个字符，再看 [[file -I]] 或 [[chardet]] 的猜测。不要用 [[errors="ignore"]] 掩盖，它会把坏字节静默删掉，数据看起来「成功」了，其实少了内容。`,
          code: String.raw`from pathlib import Path

p = Path("bom.csv")
p.write_text("\ufeffname,score\n林晓,91\n", encoding="utf-8")

raw = p.read_text(encoding="utf-8")
print(repr(raw[:12]))
print(raw.splitlines()[0].startswith("\ufeff"))

clean = p.read_text(encoding="utf-8-sig")
print(repr(clean[:8]))`,
          output: `'\ufeffname,score'
True
'name,sc'`,
          tip: `处理 Windows 导出的 CSV，优先用 [[encoding="utf-8-sig"]]；如果 BOM 已经进了字段，用 [[lstrip("\ufeff")]] 清掉。`
        },
        {
          h: "目录遍历：glob、rglob 与排序",
          p: `[[Path.glob("*.csv")]] 只匹配当前目录，[[rglob("*.csv")]] 递归匹配子目录。返回的是生成器，文件多时不会一次性占内存。遍历结果顺序依赖文件系统，不要假设「按名称排序」；需要稳定顺序就显式 [[sorted(..., key=...)]]。

遍历时要跳过隐藏文件、临时文件、输出目录，否则可能把 [[.DS_Store]] 或 [[.tmp]] 当数据。用 [[.name.startswith(".")]] 过滤，或把输出目录排除。还要注意符号链接导致的循环，[[rglob]] 默认不跟随目录符号链接，但 [[os.walk(followlinks=True)]] 会。

批量处理文件的标准写法是「先收集路径，再排序，再逐个处理」，不要在处理过程中边遍历边改目录结构。`,
          code: String.raw`from pathlib import Path

root = Path("data")
root.mkdir(exist_ok=True)
(root / "a.csv").write_text("x,1\n", encoding="utf-8")
(root / "sub").mkdir(exist_ok=True)
(root / "sub" / "b.csv").write_text("y,2\n", encoding="utf-8")

files = sorted(root.rglob("*.csv"), key=lambda p: str(p))
for p in files:
    print(p.relative_to(root), p.stat().st_size)`,
          output: `a.csv 4
sub/b.csv 4`,
          tip: `[[rglob]] 返回生成器；要稳定顺序就 [[sorted()]]，要相对路径就 [[relative_to()]]，不要手工切字符串。`
        },
        {
          h: "动手实验：把一份乱码 CSV 读干净",
          p: `构造一个带 BOM、空行、全角空格、坏行的 CSV，用 [[pathlib]] 读入，逐行打印 [[repr]]，再写一个清洗函数返回 [[{"name": str, "score": float}]]。要求：坏行不静默丢弃，收集行号和原因；输出统一 UTF-8；写回时用原子替换。

这个实验的验收标准不是「跑通」，而是「换一个目录、换一个平台、换一个编码仍能解释发生了什么」。`,
          code: String.raw`from pathlib import Path

raw = "\ufeff 林晓 , 91 \n\n 周宁 ,abc\n"
p = Path("messy.csv")
p.write_text(raw, encoding="utf-8")

good, bad = [], []
for lineno, line in enumerate(p.read_text(encoding="utf-8-sig").splitlines(), 1):
    if not line.strip():
        continue
    parts = [x.strip().replace("\u3000", " ") for x in line.split(",")]
    try:
        good.append({"name": parts[0], "score": float(parts[1])})
    except (IndexError, ValueError) as err:
        bad.append((lineno, line, str(err)))

print(good)
print(bad)`,
          output: `[{'name': '林晓', 'score': 91.0}]
[(3, ' 周宁 ,abc', "could not convert string to float: 'abc'")]`,
          tip: `清洗结果要同时保留 [[good]] 和 [[bad]]；只返回好行，会让「少了谁」永远查不出来。`
        }
      ],
      points: [
        "路径用 Path 对象和 / 运算符，不用字符串拼接。",
        "文本模式写 encoding，二进制模式读 bytes，不混用。",
        "逐行迭代适合大文件，readlines 只适合小文件。",
        "读改写用临时文件 + os.replace 做原子替换。",
        "BOM 用 utf-8-sig，换行需要原样时用 newline=''。"
      ],
      practice: "写一个 `clean_csv(path) -> (records, errors)`：跳过空行、去 BOM、把全角空格转半角；坏行记录行号和异常原因，最后把 records 原子写回新文件。"
    },
    {
      id: "ch9-2",
      title: "9.2 CSV、JSON 与结构化数据",
      minutes: 45,
      lead: "CSV 不是「用逗号 split」，JSON 也不是「看起来像字典的字符串」。这一节讲两种格式的边界、编码、流式处理和真实坏数据，让你不再被引号、BOM 和嵌套字段坑住。",
      source: "Introducing Python 3rd · Ch.16；Beginning Python 4th · Ch.8、11；Head First Python 3rd · Ch.1–3、9",
      sections: [
        {
          h: "CSV 是一种格式，不是字符串切分",
          p: `CSV 的字段里可以包含逗号、引号、换行；用 [[line.split(",")]] 处理，遇到 [[\"林晓, 男\",91]] 就会多出一列。标准库 [[csv]] 处理引号转义、字段内逗号、换行，是唯一正确的起点。

读 CSV 有两种方式：[[csv.reader]] 返回列表，适合列位置固定的数据；[[csv.DictReader]] 返回字典，适合有表头、列顺序可能变化的数据。写用 [[csv.writer]] / [[csv.DictWriter]]，记得 [[newline=""]]，否则 Windows 上会多出空行。

CSV 没有类型：所有字段都是字符串。数字、日期、空值都要自己转换；空字符串和 [[None]] 的区别要明确。表头也可能有 BOM、空格、大小写差异，读入后先规范化。`,
          code: String.raw`import csv, io

text = 'name,score,note\n"林晓, 男",91,"第一行\n第二行"\n周宁,86,\n'
rows = list(csv.DictReader(io.StringIO(text)))
print(rows)
print(rows[0]["note"].splitlines())`,
          output: `[{'name': '林晓, 男', 'score': '91', 'note': '第一行\\n第二行'}, {'name': '周宁', 'score': '86', 'note': ''}]
['第一行', '第二行']`,
          tip: `[[csv.reader]] 的每一格都是字符串；空字段是 [[""]]，不是 [[None]]。需要数字就显式 [[int()/float()]]。`
        },
        {
          h: "DictReader/DictWriter：按列名处理更稳",
          p: `真实 CSV 的列顺序常变。[[DictReader]] 用表头做键，代码读 [[row["score"]]] 而不是 [[row[1]]]，列插入/调序不会静默错位。[[DictWriter]] 用 [[fieldnames]] 控制输出列，[[extrasaction="raise"]] 能在多出字段时直接报错。

写 CSV 时先决定列集合，再写表头。不要让 [[DictWriter]] 从第一行猜字段，否则第二行多一个键就会报 [[ValueError]]。缺字段用 [[restval=""]] 补，多字段用 [[extrasaction]] 控制。

表头本身也要清洗：去 BOM、去空格、统一小写。表头是数据契约的一部分，不要用「看起来一样」来判断。`,
          code: String.raw`import csv, io

src = "name,score\n林晓,91\n周宁,86\n"
reader = csv.DictReader(io.StringIO(src))
records = [{"name": r["name"], "score": int(r["score"])} for r in reader]

out = io.StringIO()
writer = csv.DictWriter(out, fieldnames=["name", "score", "grade"], restval="")
writer.writeheader()
for r in records:
    writer.writerow({**r, "grade": "A" if r["score"] >= 90 else "B"})
print(out.getvalue())`,
          output: `name,score,grade
林晓,91,A
周宁,86,B
`,
          tip: `[[DictWriter]] 要显式 [[fieldnames]]；[[restval]] 补缺失列，[[extrasaction="raise"]] 防止多字段悄悄丢。`
        },
        {
          h: "JSON 的类型映射与坑",
          p: `JSON 只有对象、数组、字符串、数字、布尔和 null。Python 的 [[dict]] 对应对象，[[list]] 对应数组，[[str]] 对应字符串，[[int/float]] 对应数字，[[True/False]] 对应 true/false，[[None]] 对应 null。[[tuple]] 会被转成数组，[[datetime]] 不能直接序列化。

[[json.loads]] 把字符串变对象，[[json.dumps]] 把对象变字符串；[[json.load/dump]] 直接读写文件。[[ensure_ascii=False]] 让中文不被转成 [[\\uXXXX]]，[[indent=2]] 让输出可读，[[sort_keys=True]] 让 diff 稳定。

反序列化时，JSON 对象键永远是字符串。你写 [[{1: "a"}]]，[[dumps]] 后变成 [["1"]]，再 [[loads]] 得到 [[{"1": "a"}]]，不是原来的 int 键。需要保留类型，就在应用层转换。`,
          code: String.raw`import json
from datetime import datetime

data = {"name": "林晓", "scores": [91, 88.5], "active": True, "note": None}
text = json.dumps(data, ensure_ascii=False, indent=2)
print(text)

back = json.loads(text)
print(back["scores"], type(back["scores"][0]))

print(json.dumps({1: "a"}))
print(json.dumps({"when": datetime(2026, 11, 24)}))`,
          output: `{
  "name": "林晓",
  "scores": [
    91,
    88.5
  ],
  "active": true,
  "note": null
}
[91, 88.5] <class 'int'>
{"1": "a"}
TypeError: Object of type datetime is not JSON serializable`,
          tip: `JSON 对象的键只能是字符串；日期用 [[.isoformat()]] 转字符串，读回时再 [[datetime.fromisoformat()]]。`
        },
        {
          h: "JSONL：一行一个对象，适合日志和大数据",
          p: `JSONL（JSON Lines）每行是一个独立 JSON 对象，文件整体不是合法 JSON 数组。优点是追加方便、可以逐行流式读、坏一行不影响其他行；缺点是不能直接 [[json.load]] 整个文件。

写 JSONL 时每个对象 [[dumps]] 后加 [[\n]]，确保 [[ensure_ascii=False]] 和 [[separators=(",", ":")]] 减少体积。读时逐行 [[loads]]，坏行记录行号继续，不要因为一行损坏丢掉整个文件。

CSV 适合表格，JSONL 适合事件/日志/嵌套对象。选择标准是「数据是否天然等宽」：等宽表格用 CSV，事件流用 JSONL。`,
          code: String.raw`import json
from pathlib import Path

p = Path("events.jsonl")
rows = [{"id": 1, "name": "林晓"}, {"id": 2, "name": "周宁"}]
with p.open("w", encoding="utf-8") as f:
    for row in rows:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")

for lineno, line in enumerate(p.open(encoding="utf-8"), 1):
    print(lineno, json.loads(line)["name"])`,
          output: `1 林晓
2 周宁`,
          tip: `JSONL 不要写成 JSON 数组；每行独立解析，才能追加和断点续读。`
        },
        {
          h: "编码与 BOM：读 CSV/JSON 前的第一道检查",
          p: `CSV 可能来自 Excel，默认带 BOM；JSON 规范要求 UTF-8，但 Windows 工具也可能加 BOM。[[json.loads]] 对 BOM 会报 [[Unexpected UTF-8 BOM]]，需要先 [[lstrip("\ufeff")]] 或用 [[utf-8-sig]] 读文件。

CSV 的 [[newline=""]] 不是可有可无：不加时，[[csv]] 可能把字段内换行拆成两行，或者写入时多出空行。读文件时传 [[newline=""]]，把换行处理交给 csv 模块。

还有一个常见问题：[[open(..., encoding="utf-8")]] 读 GBK 文件会报 [[UnicodeDecodeError]]。确认来源编码，或者用 [[errors="replace"]] 做初步观察，但不要用它做正式导入。`,
          code: String.raw`import csv, json
from pathlib import Path

p = Path("bom.json")
p.write_text("\ufeff{\"name\": \"林晓\"}", encoding="utf-8")

try:
    json.loads(p.read_text(encoding="utf-8"))
except json.JSONDecodeError as err:
    print(type(err).__name__, err)

print(json.loads(p.read_text(encoding="utf-8-sig")))

with p.open(encoding="utf-8-sig", newline="") as f:
    print(f.readline().strip())`,
          output: `JSONDecodeError Unexpected UTF-8 BOM (decode using utf-8-sig): line 1 column 1 (char 0)
{'name': '林晓'}
﻿{"name": "林晓"}`,
          tip: `JSON 读文件用 [[utf-8-sig]] 兼容 BOM；CSV 读文件同时加 [[newline=""]]，否则字段内换行会被拆开。`
        },
        {
          h: "动手实验：把 CSV 转成 JSONL",
          p: `读入一个成绩 CSV，转成 JSONL，要求：数值字段转 [[int/float]]，空值转 [[None]]，表头去 BOM/空格，坏行记录行号；输出每行一个对象，中文不转义。

验收时用 [[wc -l]] 数行数，用 [[json.loads]] 逐行解析，确认没有一行失败；再拿第一行和源 CSV 对照字段。`,
          code: String.raw`import csv, json, io

src = "\ufeffname, score, note\n林晓,91,\n周宁,abc,补考\n"
reader = csv.DictReader(io.StringIO(src.lstrip("\ufeff")))
good, bad = [], []
for lineno, row in enumerate(reader, 2):
    clean = {k.strip().lower(): (v.strip() if isinstance(v, str) else v) for k, v in row.items()}
    try:
        good.append({"name": clean["name"], "score": float(clean["score"]), "note": clean["note"] or None})
    except (TypeError, ValueError) as err:
        bad.append((lineno, clean, str(err)))

for item in good:
    print(json.dumps(item, ensure_ascii=False))
print("bad", bad)`,
          output: `{"name": "林晓", "score": 91.0, "note": null}
bad [(3, {'name': '周宁', 'score': 'abc', 'note': '补考'}, "could not convert string to float: 'abc'")]`,
          tip: `[[csv.DictReader]] 的 [[lineno]] 从 2 开始（表头占 1 行）；报错行号要按数据文件的实际行号解释。`
        }
      ],
      points: [
        "CSV 必须用 csv 模块处理引号、逗号和字段内换行。",
        "DictReader/DictWriter 用列名而不是位置，列顺序变化更安全。",
        "JSON 只支持有限类型，datetime 要手动转 ISO 字符串。",
        "JSONL 一行一个对象，适合流式和追加。",
        "BOM 用 utf-8-sig，CSV 读文件加 newline=''。"
      ],
      practice: "写 `csv_to_jsonl(src, dst)`：清洗表头、转换数值、空值转 null、坏行收集到 `errors.jsonl`；输出后用逐行 `json.loads` 验证全部可解析。"
    },
    {
      id: "ch9-3",
      title: "9.3 异常、异常链与资源清理",
      minutes: 45,
      lead: "异常不是「程序坏了」，而是函数在说「这个输入我处理不了」。这一节讲 try/except/else/finally 的真实分工、异常链怎么保留根因、自定义异常怎么设计，以及 with 为什么能保证清理。",
      source: "Introducing Python 3rd · Ch.20；Beginning Python 4th · Ch.8、11；Head First Python 3rd · Ch.2–3",
      sections: [
        {
          h: "traceback 从下往上读：最后一行才是错误类型",
          p: `Python 报错时打印的是调用栈：最上面是入口，最下面才是实际出错的位置和异常类型。初学者常盯着第一行 [[Traceback (most recent call last)]]，其实应该先看最后一行 [[ValueError: ...]]，再看它上面一行的文件/行号。

一个异常对象包含类型、消息、traceback 和 [[__cause__]]/[[__context__]]。[[type(err).__name__]] 给类型名，[[str(err)]] 给消息，[[err.args]] 给参数元组。日志里只记录 [[str(err)]] 会丢掉堆栈，应该用 [[logger.exception]] 或 [[traceback.format_exc()]]。

不要把异常当成字符串拼接。捕获后要么处理，要么加上下文再抛出，不要 [[print(err)]] 后继续执行，那会让调用方以为成功了。`,
          code: String.raw`import traceback

def parse_score(text):
    return int(text)

try:
    parse_score("abc")
except ValueError as err:
    print("类型:", type(err).__name__)
    print("消息:", str(err))
    print("参数:", err.args)
    print("堆栈尾部:")
    print(traceback.format_exc().splitlines()[-1])`,
          output: `类型: ValueError
消息: invalid literal for int() with base 10: 'abc'
参数: ("invalid literal for int() with base 10: 'abc'",)
堆栈尾部:
ValueError: invalid literal for int() with base 10: 'abc'`,
          tip: `日志记录异常用 [[logger.exception(...)]]，不要只记 [[str(err)]]；后者没有行号和调用链。`
        },
        {
          h: "try/except/else/finally 各管什么",
          p: `[[try]] 里只放可能出错的代码；[[except]] 捕获并处理；[[else]] 在 try 没有异常时执行；[[finally]] 无论是否异常都执行。else 的价值是把「成功后的逻辑」移出 try，避免它抛出的异常被同一个 except 误捕。

finally 适合释放资源、恢复状态、写收尾日志，但它不能 [[return]] 掉一个正在传播的异常（会吞掉异常）。如果 finally 里再抛异常，原异常会变成 [[__context__]]，最终抛的是 finally 的新异常。

最常用的结构是：try 做转换，except 捕获具体错误并加行号，else 追加结果，finally 关闭资源。不要一个 try 包住 50 行代码，捕获范围越大，越容易掩盖真正的 bug。`,
          code: String.raw`def parse(text):
    events = []
    try:
        value = int(text)
    except ValueError as err:
        events.append(("error", str(err)))
    else:
        events.append(("ok", value))
    finally:
        events.append(("finally", None))
    return events

print(parse("91"))
print(parse("abc"))`,
          output: `[('ok', 91), ('finally', None)]
[('error', "invalid literal for int() with base 10: 'abc'"), ('finally', None)]`,
          tip: `[[else]] 里的代码不属于 try 的保护范围；把成功逻辑放 else，能避免被同一个 except 误捕。`
        },
        {
          h: "捕获具体异常，不要裸 except",
          p: `[[except:]] 会捕获 [[BaseException]]，包括 [[KeyboardInterrupt]]、[[SystemExit]]，让程序无法正常退出；[[except Exception:]] 好一些，但仍然太宽，会把 [[TypeError]]、[[AttributeError]] 这些编程错误一起吞掉。

应该捕获你真正能处理的异常：解析数字捕 [[ValueError]]，读文件捕 [[OSError]]/[[FileNotFoundError]]，取字典键捕 [[KeyError]]，网络请求捕具体库的超时异常。捕获后要么给出有意义的恢复，要么加上下文重新抛出。

「捕获所有异常然后记录日志继续跑」在批处理里可以接受，但要保证单条失败不影响其他条，并且最终报告失败数量。不能把「继续跑」当成「问题已解决」。`,
          code: String.raw`def safe_int(text, default=None):
    try:
        return int(text)
    except (TypeError, ValueError):
        return default

print(safe_int("91"))
print(safe_int("abc", 0))
print(safe_int(None, -1))`,
          output: `91
0
-1`,
          tip: `只捕获你能处理的异常；[[except Exception]] 只适合最外层兜底，并且必须记录完整堆栈。`
        },
        {
          h: "raise from：保留根因，而不是制造新谜团",
          p: `底层抛 [[ValueError]]，上层想抛业务异常 [[ScoreError]]，直接 [[raise ScoreError("分数非法")]] 会让调用方只看到新异常，原始 traceback 丢失。用 [[raise ScoreError(...) from err]] 把原异常挂到 [[__cause__]]，traceback 会显示「The above exception was the direct cause of the following exception」。

[[from None]] 是相反操作：故意隐藏底层异常，适合「这个内部异常对调用方没有意义」的场景，但会丢失调试信息，慎用。

异常链不是装饰。它让日志同时保留「业务语义」和「技术根因」，线上排错时能一路追到原始行号。`,
          code: String.raw`class ScoreError(Exception):
    pass

def parse_score(text):
    try:
        value = int(text)
    except ValueError as err:
        raise ScoreError(f"分数不是整数：{text!r}") from err
    if not 0 <= value <= 100:
        raise ScoreError(f"分数越界：{value}")
    return value

try:
    parse_score("abc")
except ScoreError as err:
    print(type(err).__name__, err)
    print("cause:", type(err.__cause__).__name__, err.__cause__)`,
          output: `ScoreError 分数不是整数：'abc'
cause: ValueError invalid literal for int() with base 10: 'abc'`,
          tip: `[[raise ... from err]] 保留根因；[[from None]] 是故意隐藏，只在底层异常确实无信息时使用。`
        },
        {
          h: "自定义异常：继承谁、带什么字段",
          p: `自定义异常通常继承 [[Exception]]，不要继承 [[BaseException]]。异常类名用 [[Error]] 结尾，消息要能直接读懂；需要结构化字段时，在 [[__init__]] 里保存，并调用 [[super().__init__(message)]]。

不要为每个小错误建一个异常类。一个模块一层业务异常足够，例如 [[ScoreError]] 表示「成绩数据不合法」；具体原因放在消息或字段里。异常类太多会让调用方不知道该捕哪个。

异常也应该有稳定契约：调用方可以依赖类型和字段，而不是依赖消息文本。消息可以改，类型和字段不要随便改。`,
          code: String.raw`class ScoreError(Exception):
    def __init__(self, message, *, line=None, value=None):
        super().__init__(message)
        self.line = line
        self.value = value

try:
    raise ScoreError("分数越界", line=3, value=120)
except ScoreError as err:
    print(err, err.line, err.value)
    print(isinstance(err, Exception))`,
          output: `分数越界 3 120
True`,
          tip: `异常字段用关键字参数保存；消息给人看，字段给程序判断，不要让调用方正则解析消息。`
        },
        {
          h: "with 与上下文管理器：清理不靠运气",
          p: `[[with open(...) as f]] 能保证文件关闭，即使中间抛异常。原理是上下文管理器协议：进入时调用 [[__enter__]]，退出时调用 [[__exit__]]，异常会传给 [[__exit__]]；返回 [[True]] 可以吞掉异常，返回 [[False]]/[[None]] 继续传播。

自己写资源类时，[[__exit__]] 要负责释放，并不要吞掉异常。可以用 [[contextlib.contextmanager]] 把「yield 前获取、yield 后释放」写成生成器，代码更短。

注意：[[with]] 只保证退出时执行，不保证对象一定构造成功；如果 [[__enter__]] 抛异常，[[__exit__]] 不会执行。资源获取失败的处理要放在 with 外面。`,
          code: String.raw`from contextlib import contextmanager

@contextmanager
def opened(path):
    print("open", path)
    f = open(path, encoding="utf-8")
    try:
        yield f
    finally:
        f.close()
        print("close", path)

with opened("demo.txt") as f:
    print(f.read().strip())
raise RuntimeError("after with")`,
          output: `open demo.txt
hello
close demo.txt
Traceback (most recent call last):
RuntimeError: after with`,
          tip: `[[@contextmanager]] 的 [[yield]] 前是获取、后是释放，释放必须放 [[finally]]，否则异常时不会执行。`
        }
      ],
      points: [
        "traceback 从下往上读，最后一行是异常类型，上面是出错行号。",
        "try 范围要小，成功逻辑放 else，清理放 finally。",
        "捕获具体异常，别用裸 except 吞掉 KeyboardInterrupt。",
        "raise ... from err 保留根因，from None 才是故意隐藏。",
        "with 依赖 __enter__/__exit__，资源释放放 finally。"
      ],
      practice: "给 `parse_score` 设计 `ScoreError(message, line, value)`：底层 ValueError 用 `raise ... from` 包装，批处理时收集每条错误，最后输出成功/失败数量和前三条错误。"
    },
    {
      id: "ch9-4",
      title: "9.4 日志、断言与调试",
      minutes: 45,
      lead: "print 能告诉你「到这里了」，但不能告诉你「谁调的、什么级别、线上怎么过滤」。这一节把 logging、traceback、pdb 和断言串成一套可用的排错流程。",
      source: "Introducing Python 3rd · Ch.20；Beginning Python 4th · Ch.8、16；Head First Python 3rd · Ch.9",
      sections: [
        {
          h: "print 的边界：临时观察可以，线上排错不够",
          p: `print 是同步的、无级别的、不能按模块过滤，也不能输出到文件/收集系统。它适合本地快速看一个值；一旦要回答「哪个模块在什么时候打了这条」「线上为什么没有这条」，就需要 logging。

logging 的核心概念：logger（按模块命名）、handler（输出到控制台/文件/网络）、formatter（格式）、level（DEBUG/INFO/WARNING/ERROR/CRITICAL）。日志会沿 logger 层级向上传播，子 logger 默认交给父 logger 处理。

最小可用配置是 [[logging.basicConfig(level=logging.INFO, format=...)]][[。库代码不要调用 basicConfig，应该 [[logger = logging.getLogger(__name__)]]，把配置交给应用入口。`,
          code: String.raw`import logging

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("scores.parse")

logger.debug("开始解析")
logger.info("解析 2 行")
logger.warning("跳过空行")
logger.error("分数非法")`,
          output: `2026-11-24 10:00:00,123 DEBUG scores.parse: 开始解析
2026-11-24 10:00:00,124 INFO scores.parse: 解析 2 行
2026-11-24 10:00:00,124 WARNING scores.parse: 跳过空行
2026-11-24 10:00:00,124 ERROR scores.parse: 分数非法`,
          tip: `库代码只 [[getLogger(__name__)]]，不配 handler；配置由应用入口统一做，避免重复输出。`
        },
        {
          h: "级别不是装饰：DEBUG/INFO/WARNING/ERROR 各给谁看",
          p: `DEBUG 给开发者看细节，INFO 记录正常关键事件，WARNING 表示「还能继续但需要注意」，ERROR 表示「当前操作失败」，CRITICAL 表示「整个程序不可用」。级别选错会让日志要么淹没，要么漏掉关键信息。

一个实用规则：正常启动、请求完成、批处理数量用 INFO；可恢复的坏数据用 WARNING；单条记录失败但批处理继续用 ERROR 并计数；数据库连不上、配置缺失用 CRITICAL。不要把每条循环都打 INFO。

日志消息要带上下文：哪个文件、哪一行、哪个 id、哪个值。不要只写「解析失败」，那等于没写。`,
          code: String.raw`import logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger("import")

for lineno, line in enumerate(["林晓,91", "", "周宁,abc"], 1):
    if not line:
        log.warning("第 %s 行是空行，跳过", lineno)
        continue
    try:
        name, score = line.split(",")
        int(score)
    except ValueError:
        log.error("第 %s 行分数非法：%r", lineno, line)`,
          output: `WARNING 第 2 行是空行，跳过
ERROR 第 3 行分数非法：'周宁,abc'`,
          tip: `用 [[%s]] 懒格式化，只有该级别启用时才拼字符串；不要在日志里做昂贵计算。`
        },
        {
          h: "日志文件、轮转与异常堆栈",
          p: `生产环境通常要写文件并按大小/时间轮转，否则日志会把磁盘写满。[[logging.handlers.RotatingFileHandler]] 按大小切分，[[TimedRotatingFileHandler]] 按时间切分。文件编码用 UTF-8，避免中文乱码。

记录异常要用 [[logger.exception("...")]]，它等价于 [[logger.error(..., exc_info=True)]]，会附加完整 traceback。不要在 except 里只 [[logger.error(str(err))]]，那会丢掉行号。

多进程写同一个日志文件需要额外处理（如 [[QueueHandler]] 或交给系统日志）；多线程 logging 本身是线程安全的，但 handler 的轮转不是完全无锁。`,
          code: String.raw`import logging
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler("app.log", maxBytes=1_000_000, backupCount=3, encoding="utf-8")
handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
logger = logging.getLogger("scores")
logger.addHandler(handler)
logger.setLevel(logging.INFO)

try:
    1 / 0
except ZeroDivisionError:
    logger.exception("计算失败")`,
          output: `2026-11-24 10:00:00,123 ERROR 计算失败
Traceback (most recent call last):
  File "demo.py", line 9, in <module>
    1 / 0
ZeroDivisionError: division by zero`,
          tip: `[[logger.exception]] 只能在 except 块里用；它自动带 [[exc_info=True]]，比手拼堆栈可靠。`
        },
        {
          h: "pdb/breakpoint：在真实运行时停下来",
          p: `[[breakpoint()]] 是 Python 3.7+ 的内置调试入口，默认调用 [[pdb.set_trace()]]。程序会在这里暂停，进入交互式调试器。常用命令：[[n]] 下一行，[[s]] 进入函数，[[c]] 继续，[[p 变量]] 打印，[[pp 变量]] 美化打印，[[l]] 看周围代码，[[q]] 退出。

pdb 适合「我知道大概哪一段，但不知道变量为什么是这个值」。不适合大范围性能问题，也不适合远程线上（除非用远程调试器）。调试完记得删掉 [[breakpoint()]]，不要提交。

在 pytest 里可以用 [[--pdb]] 在失败时进入调试器；在 Jupyter/IDE 里有图形化断点，本质一样。`,
          code: String.raw`def average(scores):
    total = sum(scores)
    breakpoint()  # 到这里暂停，检查 scores/total
    return total / len(scores)

print(average([88, 92, 79]))

# pdb 交互示例
# (Pdb) p scores
# [88, 92, 79]
# (Pdb) p total
# 259
# (Pdb) c`,
          output: `> demo.py(3)average()
-> return total / len(scores)
(Pdb) 259 / 3
86.33333333333333`,
          tip: `[[breakpoint()]] 默认受 [[PYTHONBREAKPOINT]] 环境变量控制；生产环境设为 0 可禁用。`
        },
        {
          h: "断言不是异常处理：它检查「不该发生」",
          p: `[[assert condition, message]] 在条件为假时抛 [[AssertionError]]。它适合检查内部不变量、开发期契约，不适合处理用户输入或外部数据，因为 [[python -O]] 会移除 assert。

用户输入用显式 [[if ... raise ValueError]]；外部 API 返回值也用显式异常；只有「如果这里不成立，说明我的代码写错了」才用 assert。测试里的 [[assert]] 由 pytest 重写，能给出详细 diff，是另一套机制。

不要在 assert 里放有副作用的表达式，因为优化模式会跳过它。`,
          code: String.raw`def normalize(records):
    assert records, "records 不能为空"
    for r in records:
        assert "name" in r, r
    return [r["name"].strip() for r in records]

print(normalize([{"name": " 林晓 "}]))

try:
    normalize([])
except AssertionError as err:
    print("AssertionError:", err)`,
          output: `['林晓']
AssertionError: records 不能为空`,
          tip: `assert 只检查内部不变量；用户输入/外部数据用 [[raise ValueError]]，否则 [[python -O]] 会把检查删掉。`
        },
        {
          h: "时间测量与性能排查的最小工具",
          p: `排查「为什么慢」，先用 [[time.perf_counter()]] 包住可疑段，打印耗时；需要多次统计用 [[timeit]]；需要函数级分析用 [[cProfile]]。不要凭感觉优化，先测量。

[[cProfile]] 输出函数调用次数和累计耗时，[[pstats]] 可以排序。常见瓶颈是循环里的重复 IO、字符串拼接、正则重复编译、数据库 N+1 查询。先找最大项，再改。

日志里记录耗时要用结构化字段（操作名、耗时、记录数），不要只写「完成」。`,
          code: String.raw`import time

def work(n):
    return sum(i * i for i in range(n))

start = time.perf_counter()
result = work(1_000_000)
elapsed = time.perf_counter() - start
print(result, f"{elapsed:.3f}s")

# cProfile 示例
# python -m cProfile -s cumulative demo.py`,
          output: `333332833333500000 0.087s`,
          tip: `用 [[perf_counter()]] 而不是 [[time.time()]] 测短间隔；后者可能受系统时钟调整影响。`
        }
      ],
      points: [
        "库代码只 getLogger，应用入口统一配置 handler。",
        "日志级别按「谁需要看」选，消息必须带上下文。",
        "logger.exception 记录完整堆栈，只在 except 块里用。",
        "breakpoint()/pdb 适合检查运行时变量，不适合线上常驻。",
        "assert 检查内部不变量，用户输入用显式异常。"
      ],
      practice: "给 CSV 导入脚本加 logging：INFO 记录总数，WARNING 记录空行，ERROR 记录坏行并带行号；异常用 `logger.exception`，最后输出成功/失败统计。"
    }
  ]
});

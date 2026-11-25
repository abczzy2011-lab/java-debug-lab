window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch16",
  part: 4,
  number: "16",
  title: "文件系统、办公自动化与定时任务",
  summary: "让 Python 替你处理重复劳动：遍历目录、调用外部命令、读写 Excel/Word/PDF、定时运行并告警。这一章的重点是安全边界和可观测性，不是「一键脚本」。",
  goals: [
    "能用 pathlib/subprocess 安全地操作文件和命令",
    "能批量处理 Excel/Word/PDF/CSV",
    "能把脚本变成可定时、可重试、可告警的任务",
    "知道自动化中的删除/覆盖/权限风险"
  ],
  lessons: [
    {
      id: "ch16-1",
      title: "16.1 pathlib、shutil 与 subprocess",
      minutes: 45,
      lead: "自动化第一步是「找文件、读文件、调命令」。这一节用 pathlib 替代字符串拼路径，用 subprocess 安全调外部程序，并处理编码、退出码和清理。",
      source: "Introducing Python 3rd · Ch.11、13；Beginning Python 4th · Ch.16；Head First Python 3rd · Ch.3–4",
      sections: [
        {
          h: "pathlib：路径是对象，不是字符串",
          p: `[[Path("data") / "scores.csv"]] 用 [[/]] 拼路径，跨平台自动处理分隔符。[[p.exists()]]、[[p.is_file()]]、[[p.suffix]]、[[p.stem]]、[[p.parent]] 比字符串切片可靠。

[[p.glob("*.csv")]] 列当前目录，[[p.rglob("*.csv")]] 递归；[[iterdir()]] 列直接子项。遍历时过滤目录/隐藏文件，别把 [[.git]] 当数据。

[[p.read_text(encoding="utf-8")]]/[[write_text]] 是便捷读写；大文件仍用 [[open()]] 流式。路径拼接不要用 [[+ "/" +]]，Windows 会出问题。`,
          code: String.raw`from pathlib import Path

root = Path("data")
root.mkdir(exist_ok=True)
(root / "a.csv").write_text("name,score\n林晓,91\n", encoding="utf-8")
for p in root.glob("*.csv"):
    print(p.name, p.suffix, p.stat().st_size)`,
          output: `a.csv .csv 20`,
          tip: `路径用 [[Path]] + [[/]]；递归 [[rglob]]，编码显式 [[utf-8]]。`
        },
        {
          h: "shutil：复制、移动、删除的边界",
          p: `[[shutil.copy2]] 复制文件并保留元数据；[[copytree]] 复制目录；[[move]] 移动/重命名；[[rmtree]] 删除整个目录。删除是不可逆的，脚本里要二次确认或 dry-run。

[[shutil.disk_usage]] 查空间；[[shutil.which]] 找可执行文件。复制大文件用 [[copyfileobj]] 分块并显示进度。

不要用 [[os.remove]] 拼路径误删；删除前打印目标、检查是否在允许目录内，避免 [[rm -rf /]] 类事故。`,
          code: String.raw`import shutil
from pathlib import Path

src = Path("data/a.csv")
dst = Path("backup/a.csv")
dst.parent.mkdir(exist_ok=True)
shutil.copy2(src, dst)
print(dst.exists(), dst.stat().st_size)`,
          output: `True 20`,
          tip: `[[copy2]] 保留元数据；[[rmtree]] 不可逆，删除前打印目标并限制根目录。`
        },
        {
          h: "subprocess：参数列表，不要 shell=True",
          p: `[[subprocess.run(["python", "script.py"], capture_output=True, text=True)]] 用参数列表，避免 shell 注入。[[shell=True]] 会把字符串交给 shell，文件名带空格/分号就出事。

[[check=True]] 在非零退出码时抛 [[CalledProcessError]]；[[timeout=]] 防挂死。[[text=True]] 按 locale 解码，跨平台可能乱码；需要时用 [[encoding="utf-8"]]。

调外部命令要检查 [[returncode]]、stdout/stderr；不要把 stderr 丢了，失败时它是唯一线索。`,
          code: String.raw`import subprocess

result = subprocess.run(
    ["python", "-c", "print('hello')"],
    capture_output=True, text=True, timeout=10, check=True
)
print(result.returncode, result.stdout.strip())`,
          output: `0 hello`,
          tip: `参数列表 + [[shell=False]] 防注入；[[check=True]]/[[timeout]] 必须有。`
        },
        {
          h: "编码与换行：跨平台三件套",
          p: `读写文本显式 [[encoding="utf-8"]]；Windows 默认可能是 GBK。[[newline=""]] 让 csv 模块自己处理换行，避免多空行。

[[Path.read_text]] 默认编码随平台；不要依赖默认。处理 BOM 用 [[utf-8-sig]]。二进制文件（图片/zip/pdf）用 [["rb"/"wb"]]，不要文本模式。

打印到控制台遇到 UnicodeEncodeError 时，设置 [[PYTHONIOENCODING=utf-8]] 或捕获异常；不要静默替换字符。`,
          code: String.raw`from pathlib import Path

p = Path("note.txt")
p.write_text("林晓,91\n", encoding="utf-8", newline="")
print(p.read_text(encoding="utf-8").splitlines())`,
          output: `['林晓,91']`,
          tip: `文本显式 utf-8、csv 用 [[newline=""]]；二进制用 rb/wb，别用文本模式。`
        },
        {
          h: "临时文件与清理",
          p: `[[tempfile.TemporaryDirectory()]] 退出时自动删目录；[[NamedTemporaryFile]] 适合临时文件。不要在手写路径 [[/tmp/xxx]]，并发会冲突。

[[try/finally]] 或 with 确保清理；异常时也要删半成品。日志/缓存不要放临时目录，重启会丢。

清理前确认路径是自己创建的；不要递归删用户目录。`,
          code: String.raw`import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as tmp:
    p = Path(tmp) / "x.txt"
    p.write_text("ok", encoding="utf-8")
    print(p.read_text(encoding="utf-8"))
print("cleaned")`,
          output: `ok
cleaned`,
          tip: `用 [[TemporaryDirectory]] 自动清理；不要手拼 /tmp 路径，并发会撞。`
        },
        {
          h: "动手实验：批量重命名与归档",
          p: `遍历 [[data/]] 下所有 [[.csv]]，按修改日期重命名到 [[archive/YYYY-MM/]]；dry-run 模式只打印不移动；确认后执行。要求：重名不覆盖、路径不存在报错、日志记录每步。`,
          code: String.raw`from pathlib import Path
from datetime import datetime

for p in Path("data").glob("*.csv"):
    mtime = datetime.fromtimestamp(p.stat().st_mtime)
    target = Path("archive") / mtime.strftime("%Y-%m")
    print("move", p, "->", target / p.name)`,
          output: `move data/a.csv -> archive/2026-11/a.csv`,
          tip: `批量移动先 dry-run；目标存在要跳过/改名，不能静默覆盖。`
        }
      ],
      points: [
        "pathlib 拼路径/遍历，显式编码。",
        "shutil 复制/删除；删除前 dry-run 并限制根目录。",
        "subprocess 用参数列表，避免 shell=True。",
        "检查退出码/stdout/stderr，设 timeout。",
        "临时目录自动清理，批量操作先 dry-run。"
      ],
      practice: "写批量归档脚本：遍历 data/*.csv，按修改月份移到 archive/YYYY-MM；支持 --dry-run，重名不覆盖，记录日志。"
    },
    {
      id: "ch16-2",
      title: "16.2 Excel、Word、PDF 与 CSV 批处理",
      minutes: 50,
      lead: "办公文件不是纯文本：Excel 有公式/合并单元格，Word 有样式，PDF 有版式。这一节用 openpyxl/python-docx/pypdf 做可重复的批量处理，并讲清「读得出来」不等于「改得回去」。",
      source: "Introducing Python 3rd · Ch.13；Head First Python 3rd · Ch.3–4",
      sections: [
        {
          h: "openpyxl：读写 xlsx 的基本盘",
          p: `[[load_workbook(path, data_only=True)]] 读公式的缓存值；[[data_only=False]] 读公式本身。[[ws.iter_rows(values_only=True)]] 按行读，适合大表。

写用 [[Workbook()]]、[[ws.append(row)]]、[[wb.save(path)]]；样式/合并单元格/图表支持有限，复杂模板最好「复制模板再填值」。

不要用 openpyxl 读 [[.xls]]（旧格式），用 pandas/xlrd 或转换。保存会丢宏/部分格式，处理前备份。`,
          code: String.raw`from openpyxl import Workbook, load_workbook

wb = Workbook()
ws = wb.active
ws.append(["name", "score"])
ws.append(["林晓", 91])
wb.save("scores.xlsx")

wb2 = load_workbook("scores.xlsx", data_only=True)
for row in wb2.active.iter_rows(values_only=True):
    print(row)`,
          output: `('name', 'score')
('林晓', 91)`,
          tip: `[[data_only=True]] 读公式值；大表用 [[iter_rows]]；保存会丢宏，先备份。`
        },
        {
          h: "pandas + Excel：批量汇总与多 sheet",
          p: `[[pd.read_excel(path, sheet_name=None)]] 读所有 sheet 返回字典；[[ExcelWriter]] 写多 sheet。批量汇总多个文件时，先统一列名/类型。

[[to_excel]] 不保留原样式；需要模板样式时用 openpyxl 打开模板填值。日期/公式/合并单元格读进来可能是 NaN/字符串，要校验。

文件锁：Excel 打开时写入会 PermissionError；脚本要检测并提示关闭。`,
          code: String.raw`import pandas as pd
from pathlib import Path

files = list(Path(".").glob("*.xlsx"))
frames = [pd.read_excel(f) for f in files]
summary = pd.concat(frames, ignore_index=True)
with pd.ExcelWriter("summary.xlsx") as writer:
    summary.to_excel(writer, sheet_name="all", index=False)
print(summary.shape)`,
          output: `(2, 2)`,
          tip: `多文件先统一列/类型；[[ExcelWriter]] 写多 sheet；文件被占用会 PermissionError。`
        },
        {
          h: "python-docx：段落、表格与模板占位",
          p: `[[Document()]] 新建，[[add_heading]]/[[add_paragraph]]/[[add_table]] 添加内容；[[doc.save]] 保存。读取用 [[doc.paragraphs]]/[[doc.tables]]。

模板替换用占位符（如 [[{{name}}]]），遍历段落/单元格替换 [[run.text]]；跨 run 的占位符会被拆开，需要先合并或按段落文本处理。

Word 的样式/分页/页眉页脚复杂，python-docx 支持有限；正式排版用模板，不要从零画。`,
          code: String.raw`from docx import Document

doc = Document()
doc.add_heading("成绩单", level=1)
table = doc.add_table(rows=1, cols=2)
table.rows[0].cells[0].text = "姓名"
table.rows[0].cells[1].text = "分数"
doc.save("report.docx")
print("saved")`,
          output: `saved`,
          tip: `模板 + 占位符替换最稳；跨 run 占位符会被拆，先合并再替换。`
        },
        {
          h: "pypdf：读取、合并、拆分与加密",
          p: `[[PdfReader(path)]] 读页，[[PdfWriter]] 写；[[append]] 合并，[[write]] 保存。加密 PDF 用 [[reader.decrypt(password)]]。

提取文本用 [[page.extract_text()]]，但扫描件是图片，需要 OCR；版式复杂时文本顺序可能乱。不要假设 PDF 一定能抽出干净文本。

拆分按页写多个文件；合并前检查页数/大小。PDF 表单填写支持有限，复杂表单用专业库/工具。`,
          code: String.raw`from pypdf import PdfReader, PdfWriter

reader = PdfReader("in.pdf")
writer = PdfWriter()
for page in reader.pages[:2]:
    writer.add_page(page)
with open("out.pdf", "wb") as f:
    writer.write(f)
print(len(reader.pages))`,
          output: `5`,
          tip: `扫描 PDF 要 OCR；[[extract_text]] 顺序可能乱，合并/拆分后检查页数。`
        },
        {
          h: "CSV 批处理：编码、分隔符、引号",
          p: `[[csv.reader]]/[[DictReader]] 处理引号/逗号/换行；[[newline=""]] 必须加。分隔符不是逗号时 [[delimiter=";"]]；编码可能是 GBK/utf-8-sig。

不要用 [[line.split(",")]] 解析 CSV；字段里可能有逗号/引号。写 CSV 用 [[csv.writer]]，自动转义。

大文件流式读，不要一次 [[readlines]]；批处理按行处理并定期 flush。`,
          code: String.raw`import csv

with open("scores.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["name", "score"])
    w.writerow(["林晓, A班", 91])

with open("scores.csv", encoding="utf-8", newline="") as f:
    for row in csv.DictReader(f):
        print(row)`,
          output: `{'name': '林晓, A班', 'score': '91'}`,
          tip: `CSV 用 csv 模块 + [[newline=""]]；不要 split(",")，字段可能含逗号。`
        },
        {
          h: "动手实验：批量生成成绩单 Word",
          p: `读 [[scores.csv]]，为每个学生生成一页 Word：姓名、分数、评语；用模板占位符替换，输出到 [[reports/]]。要求：文件名安全、缺字段跳过、生成数量与输入一致。`,
          code: String.raw`from docx import Document
from pathlib import Path
import csv

rows = [{"name": "林晓", "score": "91"}]
for row in rows:
    doc = Document()
    doc.add_heading(f"成绩单 - {row['name']}", level=1)
    doc.add_paragraph(f"分数：{row['score']}")
    out = Path("reports") / f"{row['name']}.docx"
    out.parent.mkdir(exist_ok=True)
    doc.save(out)
print("generated", len(rows))`,
          output: `generated 1`,
          tip: `文件名过滤非法字符；缺字段跳过并记录，生成数量要和输入对账。`
        }
      ],
      points: [
        "openpyxl 读公式值/写 xlsx，保存会丢宏。",
        "pandas 批量汇总多文件，ExcelWriter 写多 sheet。",
        "docx 用模板占位符，注意跨 run 拆分。",
        "pypdf 合并/拆分；扫描件要 OCR。",
        "CSV 用 csv 模块 + newline，不要 split。"
      ],
      practice: "读 scores.csv，用 Word 模板为每个学生生成成绩单：占位符替换、文件名安全、缺字段跳过、数量对账。"
    },
    {
      id: "ch16-3",
      title: "16.3 定时任务、日志与告警",
      minutes: 45,
      lead: "脚本能跑一次不等于能每天跑。这一节讲调度方式、幂等、锁、日志轮转、失败告警和「跑完了但没效果」的排查。",
      source: "Introducing Python 3rd · Ch.13；Head First Python 3rd · Ch.3–4",
      sections: [
        {
          h: "调度方式：cron、systemd timer、Task Scheduler",
          p: `Linux 用 [[cron]]（简单）或 [[systemd timer]]（有日志/依赖/错过补跑）；macOS 用 [[launchd]]；Windows 用任务计划程序。云上可以用平台定时任务/容器 CronJob。

cron 环境变量少、PATH 不同；脚本用绝对路径/显式解释器，别依赖交互 shell 的配置。时区要确认，服务器常是 UTC。

定时任务要能手动触发同一入口，避免「只有 cron 能跑」的隐藏逻辑。`,
          code: String.raw`# 每天 07:30 运行（crontab -e）
# 30 7 * * * /usr/bin/python3 /opt/scores/job.py >> /var/log/scores.log 2>&1

# systemd timer 更适合需要日志/依赖的场景
# systemctl list-timers`,
          output: `30 7 * * * /usr/bin/python3 /opt/scores/job.py`,
          tip: `cron 用绝对路径/显式解释器；时区确认；入口要能手动触发。`
        },
        {
          h: "幂等与锁：别让两个任务同时跑",
          p: `定时任务可能重叠（上次没跑完下次又启动）。用文件锁/数据库锁/分布式锁保证同一任务只有一个实例。[[fcntl.flock]] 适合单机；云上用 Redis/DB 锁。

幂等：重复执行不产生重复数据。写入用唯一键/upsert；发邮件用「已发送标记」；生成文件用覆盖或版本目录。

锁要能释放（异常/进程被杀）；死锁要有超时/清理策略，不能永久卡住。`,
          code: String.raw`import fcntl, time

with open("/tmp/scores.lock", "w") as lock:
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print("already running")
        raise SystemExit(0)
    print("running")
    time.sleep(1)`,
          output: `running`,
          tip: `单机用 [[flock]]，云上用 Redis/DB 锁；锁要可释放，任务要幂等。`
        },
        {
          h: "日志：轮转、结构化、保留策略",
          p: `用 [[logging]] 写文件，[[RotatingFileHandler]]/[[TimedRotatingFileHandler]] 轮转，避免单文件无限增长。日志含时间/级别/任务 id/耗时/结果。

结构化日志（JSON lines）便于检索；不要把个人数据/token 写进去。控制台日志和文件日志分开，cron 的 stdout 重定向到文件。

保留策略：按天/大小轮转，保留 N 份；重要审计日志另存。日志目录要有权限控制。`,
          code: String.raw`import logging
from logging.handlers import RotatingFileHandler

logger = logging.getLogger("job")
logger.setLevel(logging.INFO)
h = RotatingFileHandler("job.log", maxBytes=1_000_000, backupCount=3, encoding="utf-8")
h.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
logger.addHandler(h)
logger.info("start")`,
          output: `2026-11-24 ... INFO start`,
          tip: `[[RotatingFileHandler]] 防无限增长；日志含任务 id/耗时，不写 token/个人数据。`
        },
        {
          h: "失败告警：退出码 + 通知渠道",
          p: `任务失败要让人知道：非零退出码 + 邮件/IM/Webhook。告警内容包含任务名、时间、错误摘要、日志路径；不要只发「失败」两个字。

避免告警风暴：同一错误聚合/去重/静默窗口；恢复时发「已恢复」。告警渠道要有兜底（邮件可能进垃圾箱）。

监控「任务是否按计划运行」而不只是「是否报错」；没跑也是故障。用心跳/上次成功时间判断。`,
          code: String.raw`import sys, json, urllib.request

def alert(text):
    data = json.dumps({"text": text}).encode()
    req = urllib.request.Request("https://httpbin.org/post", data=data,
                                 headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req, timeout=10).read()

alert("scores job failed: timeout")
print("alerted")`,
          output: `alerted`,
          tip: `告警带任务/时间/错误/日志路径；去重防风暴，没跑也要监控。`
        },
        {
          h: "「跑完了但没效果」怎么查",
          p: `先确认入口真的执行：cron 日志/ systemd journal / 任务平台记录。再看退出码、stdout/stderr、输出文件时间戳。

常见原因：工作目录不对（相对路径写到了别处）、环境变量缺失、权限不足、写入被旧文件锁、任务跑了空输入。每个都要在日志里可见。

加「输入行数/输出行数/耗时」指标；数量为 0 或骤降要告警。不要只看「进程退出 0」。`,
          code: String.raw`from pathlib import Path

out = Path("out/summary.csv")
print(out.exists(), out.stat().st_mtime if out.exists() else None)
print("rows", sum(1 for _ in out.open(encoding="utf-8")) if out.exists() else 0)`,
          output: `True 1763... 
rows 21`,
          tip: `查 cwd/环境变量/权限/锁/空输入；日志记录输入/输出行数，0 行要告警。`
        },
        {
          h: "动手实验：把归档脚本做成每日任务",
          p: `给 ch16-1 的归档脚本加：flock 锁、日志轮转、--dry-run、失败退出码、Webhook 告警；用 cron 每天 07:30 跑。手动触发一次，确认日志/输出/告警都正常。`,
          code: String.raw`# job.py 结构
# 1. 解析参数
# 2. 获取锁，失败退出 0（已有实例）
# 3. 执行业务，记录输入/输出数量
# 4. 异常 -> logger.exception + alert + 返回 1
# 5. 成功 -> 记录耗时 + 返回 0`,
          output: `INFO start
INFO moved=12 skipped=0
INFO done in 0.42s`,
          tip: `锁 + 日志 + 数量指标 + 告警 + 退出码，才算可运维的定时任务。`
        }
      ],
      points: [
        "cron/systemd/launchd 各有适用场景，路径/时区要显式。",
        "定时任务要幂等，并用锁防重叠。",
        "日志轮转、结构化、保留策略。",
        "失败告警带上下文，避免风暴。",
        "监控「没跑」和「跑了没效果」，看输入/输出数量。"
      ],
      practice: "把归档脚本做成每日任务：flock 锁、日志轮转、dry-run、失败告警、退出码；cron 定时并手动触发验证。"
    }
  ]
});

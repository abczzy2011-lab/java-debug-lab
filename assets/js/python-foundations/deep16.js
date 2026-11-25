window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch16-1": [
    {
      h: "深读：删除前的安全闸门",
      p: `自动化删除最危险。脚本先规范目标路径（[[resolve()]]），确认它在允许根目录下，再执行；用 [[--dry-run]] 默认打印，[[--yes]] 才真删。

拒绝删除根目录/家目录/符号链接指向的外部路径；[[Path.is_symlink()]] 要检查。[[rmtree]] 对符号链接默认不跟随，但仍要防误传。

删除用「移到回收站/trash」比直接删安全；保留 N 天可恢复。日志记录删了哪些路径。`,
      code: String.raw`from pathlib import Path

root = Path("archive").resolve()
target = (root / "old").resolve()
print(target.is_relative_to(root))
print(target.is_symlink())`,
      output: `True
False`,
      tip: `删除前 [[resolve]] + [[is_relative_to]] 限定根目录；默认 dry-run，[[--yes]] 才真删。`
    },
    {
      h: "深读：符号链接、权限与跨设备移动",
      p: `符号链接可能指向目录外，遍历时要决定「跟随还是不跟随」；[[rglob]] 默认不跟随目录链接，但文件链接会被读到。处理敏感目录时更要注意。

[[move]] 跨文件系统是「复制+删除」，可能慢/中断；大目录先复制校验再删源。权限错误用 [[os.access]] 预检，但最终仍要捕获 [[PermissionError]]。

POSIX 权限/umask 影响新文件；共享目录要设组权限。不要把密钥文件设成全局可读。`,
      code: String.raw`from pathlib import Path

p = Path("data/a.csv")
print(p.is_symlink(), p.exists())
print(oct(p.stat().st_mode & 0o777))`,
      output: `False True
0o644`,
      tip: `链接要显式决定是否跟随；跨设备 move 是复制+删，先校验再删源。`
    },
    {
      h: "深读：subprocess 的流式输出与超时",
      p: `[[run(capture_output=True)]] 会等进程结束并一次性拿输出；长任务要 [[Popen]] + 逐行读 stdout，边跑边日志。读的时候要处理 stderr，避免管道满阻塞。

[[timeout]] 到点会 kill 子进程，但子进程可能还有孙进程；需要进程组/容器隔离。Windows 的 kill 语义不同，跨平台要测。

不要把用户输入拼进命令字符串；参数列表 + [[--]] 分隔，防选项注入。`,
      code: String.raw`import subprocess

p = subprocess.Popen(
    ["python", "-u", "-c", "print('a'); print('b')"],
    stdout=subprocess.PIPE, text=True
)
for line in p.stdout:
    print("got", line.strip())
print("rc", p.wait())`,
      output: `got a
got b
rc 0`,
          tip: `长任务用 [[Popen]] 流式读；stderr 也要读，[[timeout]] 杀不掉孙进程要额外处理。`
    },
    {
      h: "深读：路径遍历的排序与稳定输出",
      p: `[[glob]]/[[iterdir]] 的顺序不保证稳定；需要可复现时显式 [[sorted(key=...)]]，按名称/修改时间排序。按修改时间排序要注意相同时间戳的 tie-break。

批量处理要记录「处理了哪些文件」的清单/哈希；下次只处理新增/变更（增量）。不要靠目录顺序猜。

文件名可能含空格/中文/emoji；日志和 CSV 要正确引用，不要用空格分隔。`,
      code: String.raw`from pathlib import Path

files = sorted(Path("data").glob("*.csv"), key=lambda p: (p.stat().st_mtime, p.name))
for p in files:
    print(p.name)`,
      output: `a.csv
b.csv`,
      tip: `遍历顺序不稳定，显式排序；记录处理清单/哈希做增量，文件名别用空格分隔。`
    }
  ],
  "ch16-2": [
    {
      h: "深读：openpyxl 的公式、样式与只读模式",
      p: `写公式直接赋字符串 [[ws["C2"] = "=SUM(A2:B2)"]]；读公式值要 [[data_only=True]]，且文件必须被 Excel 计算过保存，否则缓存值是 None。

[[load_workbook(read_only=True)]] 适合大文件只读，不能随机访问/修改；[[write_only=True]] 适合流式写大表。样式用 [[Font/Fill/Alignment]]，复制模板比手写样式稳。

合并单元格只有左上角有值；遍历时要处理 [[MergedCell]]。保存前关闭只读模式，否则不能改。`,
      code: String.raw`from openpyxl import Workbook

wb = Workbook()
ws = wb.active
ws["A1"] = 10
ws["A2"] = 20
ws["A3"] = "=SUM(A1:A2)"
wb.save("calc.xlsx")
print("saved")`,
      output: `saved`,
      tip: `[[data_only=True]] 读缓存值（可能 None）；大文件用 read_only/write_only；合并单元格只有左上角有值。`
    },
    {
      h: "深读：docx 模板替换的 run 问题",
      p: `Word 的段落由多个 run 组成，占位符可能被拆成 [[{{na]] + [[me}}]]。直接遍历 run 替换会失败。

稳妥做法：按段落合并文本，若包含占位符，清空 runs 后写入替换后的整段（会丢段落内局部格式）；或先用模板把占位符放在单个 run。

表格单元格同理；页眉/页脚要单独遍历 [[section.header]]。替换后检查是否残留 [[{{]]。`,
      code: String.raw`from docx import Document

doc = Document()
p = doc.add_paragraph("姓名：{{name}}")
text = p.text.replace("{{name}}", "林晓")
for r in p.runs:
    r.text = ""
p.runs[0].text = text if p.runs else text
print(p.text)`,
      output: `姓名：林晓`,
      tip: `占位符可能跨 run；合并文本后重写会丢局部格式，模板设计时就让占位符在单个 run。`
    },
    {
      h: "深读：PDF 文本层、OCR 与版式",
      p: `[[extract_text]] 只能读文本层；扫描件/图片 PDF 没有文本层，需要 OCR（Tesseract/PaddleOCR）。OCR 有语言/精度/版式问题，结果要人工抽检。

多栏/表格 PDF 的文本顺序可能乱；需要结构时用 [[pdfplumber]] 按坐标提取，或专用表格工具。不要假设 [[extract_text]] 能还原表格。

合并/拆分后要检查页数、书签、加密；加密 PDF 先解密再处理，注意权限。`,
      code: String.raw`from pypdf import PdfReader

reader = PdfReader("doc.pdf")
print(len(reader.pages))
print(reader.pages[0].extract_text()[:40])`,
      output: `3
Title
First paragraph...`,
      tip: `扫描件要 OCR；多栏/表格别只靠 [[extract_text]]，用坐标工具；处理后查页数/加密。`
    },
    {
      h: "深读：批处理的数据契约与对账",
      p: `批量生成前定义输入契约：必填列、类型、唯一键、允许空值。缺列/坏行要报错并指出行号，不要静默跳过。

输出对账：输入 N 行 → 生成 N 个文件/工作表；失败 M 行要记录原因。最终打印「成功/失败/跳过」计数，和输入总数对得上。

重复运行要幂等：输出目录按批次/日期隔离，或覆盖同名文件前备份。不要把上次的残留当本次结果。`,
      code: String.raw`rows = [{"name": "林晓", "score": 91}, {"name": None, "score": 80}]
ok, bad = [], []
for i, row in enumerate(rows, 1):
    (ok if row.get("name") else bad).append((i, row))
print(len(ok), len(bad), bad)`,
      output: `1 1 [(2, {'name': None, 'score': 80})]`,
      tip: `输入契约 + 行号错误 + 输出对账；成功/失败/跳过计数要和输入总数一致。`
    }
  ],
  "ch16-3": [
    {
      h: "深读：systemd timer 比 cron 多什么",
      p: `systemd timer 有 [[Persistent=true]]（错过补跑）、依赖/环境/日志（journalctl）、随机延迟（[[RandomizedDelaySec]]）。适合需要审计/重试的服务。

unit 文件分 [[.service]] 和 [[.timer]]；[[OnCalendar=]] 定义时间，[[systemctl enable --now]] 启用。环境变量用 [[Environment=]]/[[EnvironmentFile=]]，不依赖登录 shell。

cron 更简单、跨平台差；容器里 cron 可能没有 systemd。选型看运行环境，不要假设都有 systemd。`,
      code: String.raw`# scores.service
# [Service]
# Type=oneshot
# ExecStart=/opt/venv/bin/python /opt/scores/job.py
# User=scores
#
# scores.timer
# [Timer]
# OnCalendar=*-*-* 07:30:00
# Persistent=true
# RandomizedDelaySec=120`,
      output: `systemctl list-timers --all`,
      tip: `systemd timer 支持补跑/日志/随机延迟；cron 简单但环境少、跨平台差。`
    },
    {
      h: "深读：日志上下文与任务 id",
      p: `每次运行生成 [[run_id]]，日志每行带 run_id；告警也带 run_id，能从告警跳到日志。用 [[logging.LoggerAdapter]] 或 filter 注入。

日志级别：INFO 记录开始/数量/耗时；WARNING 记录跳过/重试；ERROR 记录失败；DEBUG 记录细节（默认关闭）。

多进程/多线程日志要避免交错；用队列/独立文件。不要把大对象 [[repr]] 进日志。`,
      code: String.raw`import logging, uuid

run_id = uuid.uuid4().hex[:8]
logger = logging.getLogger("job")
logging.basicConfig(format=f"%(asctime)s {run_id} %(levelname)s %(message)s", level=logging.INFO)
logger.info("start")`,
      output: `2026-11-24 ... a1b2c3d4 INFO start`,
      tip: `run_id 贯穿日志/告警；INFO 记数量/耗时，ERROR 记失败，别把大对象写日志。`
    },
    {
      h: "深读：重试、死信与人工兜底",
      p: `可重试错误（网络/限流/临时锁）自动重试 3 次，指数退避；不可重试（数据格式/权限）直接失败并告警。

重试仍失败的任务进「死信」队列/目录，保留输入和错误；人工处理后能重放。不要无限重试或静默丢弃。

告警要含「下一步」：日志路径、重放命令、负责人。只报错不给出路的告警会被忽略。`,
      code: String.raw`import time

def run(task, attempts=3):
    for i in range(attempts):
        try:
            return task()
        except TimeoutError:
            if i == attempts - 1:
                raise
            time.sleep(2 ** i)

print(run(lambda: "ok"))`,
      output: `ok`,
      tip: `只重试临时错误；最终失败进死信保留输入，告警给日志/重放命令。`
    },
    {
      h: "深读：监控「没跑」与「跑了没效果」",
      p: `退出码 0 只证明进程结束，不证明业务成功。输出「上次成功时间/处理行数/关键文件时间戳」到监控系统；超过阈值没更新就告警。

心跳文件/数据库标记：任务开始写 running，成功写 success+时间；监控查最后 success 时间。僵尸 running 要能识别。

业务指标比技术指标更重要：生成 0 条报表、金额为 0、文件大小骤降，都要告警。`,
      code: String.raw`from datetime import datetime, timezone
from pathlib import Path
import json

Path("heartbeat.json").write_text(json.dumps({
    "last_success": datetime.now(timezone.utc).isoformat(),
    "rows": 120,
}), encoding="utf-8")
print("ok")`,
      output: `ok`,
      tip: `退出 0 不等于业务成功；心跳/上次成功时间/行数/文件大小都要监控。`
    }
  ],
  "ch16-review": [
    {
      h: "本章复盘：自动化要可停、可查、可恢复",
      p: `文件/办公/定时三类自动化的共同底线：不误删、不覆盖、不静默失败。路径用 Path、命令用参数列表、删除先 dry-run；批处理有输入契约和输出对账；定时任务有锁、日志、告警、心跳。

「能跑」只是开始，「跑错能发现、跑挂能恢复、重跑不重复」才是完成。每个脚本都该有 [[--dry-run]] 和明确的退出码。

本章验收：批量归档（dry-run/不覆盖）、Word 成绩单（数量对账）、每日任务（锁/日志/告警/心跳）。`,
      code: String.raw`from pathlib import Path

for p in sorted(Path("data").glob("*.csv")):
    print("would archive", p.name)
print("dry-run done")`,
      output: `would archive a.csv
dry-run done`,
      tip: `不误删/不覆盖/不静默失败；dry-run、退出码、心跳三件套。`
    }
  ]
});

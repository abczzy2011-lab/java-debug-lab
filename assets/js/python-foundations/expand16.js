(function () {
  var chapters = window.PY_FOUNDATIONS_CHAPTERS || [];
  function add(id, sections) {
    for (var i = 0; i < chapters.length; i += 1) {
      var lessons = chapters[i].lessons || [];
      for (var j = 0; j < lessons.length; j += 1) {
        if (lessons[j].id === id) {
          lessons[j].sections = (lessons[j].sections || []).concat(sections);
          return;
        }
      }
    }
  }

  add("ch16-1", [{
    h: "工程深化：文件操作的安全边界与幂等入库",
    p: `办公脚本最常见的破坏不是代码报错，而是「重复跑一次，数据翻倍」。导入前先判断目标表是否已有同一批数据：用文件名 + 内容哈希 + 业务日期做唯一键，或者先删后插、事务提交。不要用 [[append]] 直接追加，除非你确定每次都是新数据。

路径处理用 [[pathlib.Path]]，不要手拼字符串。[[Path("out") / "scores.csv"]] 自动处理分隔符；[[resolve()]] 规范相对路径；[[with_suffix()]] 改扩展名。用户输入的文件名要校验存在、是文件、可读，不要直接拼进命令或 SQL。

写文件先写临时文件再原子替换，避免半截文件。读文件要处理编码：[[utf-8-sig]] 兼容 Excel 的 BOM，[[gb18030]] 处理老中文 CSV；不要用 [[errors="ignore"]] 静默丢字符，至少记录替换数量。

权限和敏感数据要管。输出目录不要 777；含身份证号、手机号的报表要脱敏或加密；日志不要打印完整路径中的用户名。临时文件用完删除，异常路径也要清理。

文件锁用于防止两个脚本同时写同一份报表。[[fcntl.flock]] 加非阻塞锁，拿不到就退出并提示「另一个任务正在运行」；不要用「检查文件是否存在」当锁，存在竞态。Windows 用 [[msvcrt]] 或第三方库。

入库要幂等：[[INSERT ... ON CONFLICT DO UPDATE]]、先查后写、或按批次删除再插入。每批记录批次 id，失败时能回滚整批。不要一条一条自动提交，中途失败会留下半批数据。

验收：重复跑两次结果一致；中途 kill 不留下半截文件；编码错误有报告；并发写只有一个成功；失败批次能回滚。`,
    code: String.raw`from pathlib import Path
import hashlib, json, os, tempfile

def file_digest(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def atomic_json(path: Path, data) -> None:
    fd, tmp_name = tempfile.mkstemp(dir=path.parent, prefix=".tmp-")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False)
            fh.flush()
            os.fsync(fh.fileno())
        os.replace(tmp_name, path)
    finally:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)`,
    output: `# 同一文件重复导入：digest 相同，跳过或覆盖同一批；
# 写入中断：目标文件仍是上一版完整内容。`,
    tip: `幂等键 = 文件哈希 + 业务日期；临时文件原子替换；编码显式；并发用锁不用 exists。`
  }, {
    h: "故障排查：subprocess 的超时、管道与退出码",
    p: `[[subprocess.run]] 比 [[os.system]] 安全，因为它不经过 shell（当 [[shell=False]]）。参数用列表传，不要拼接字符串；用户输入含空格、引号、分号时，拼接会导致命令注入。必须用 shell 时，用 [[shlex.quote]]，并尽量改成列表。

超时要显式设置。[[timeout=30]] 到期会抛 [[TimeoutExpired]]，子进程可能仍在运行；捕获后要 [[kill()]] 或 [[terminate()]]，并等待回收。只捕获不杀，会留下僵尸进程。长时间任务用 [[Popen]] 自己管理，定期检查 [[poll()]]。

管道输出可能死锁。父进程等子进程结束，子进程等父进程读完 stdout/stderr，缓冲区满就卡住。用 [[communicate()]] 同时读两个流，或把 stderr 重定向到 stdout。不要 [[wait()]] 后再 [[read()]]，那正是死锁写法。

退出码要检查。[[returncode != 0]] 表示失败，但不同程序含义不同；把 stdout/stderr 保存到日志，报错时带上命令、退出码、最后 N 行输出。不要只抛「命令失败」，那等于没信息。

环境变量要显式传递。[[subprocess]] 默认继承当前环境，可能带上不该带的 token；用 [[env={...}]] 构造最小环境，保留 [[PATH]]、[[HOME]]、[[LANG]]。需要虚拟环境的 Python 时，用 [[sys.executable]]，不要假设 [[python]] 在 PATH。

编码要指定。子进程输出可能是 UTF-8、GBK 或混合；[[text=True, encoding="utf-8", errors="replace"]] 能避免解码崩溃，但替换字符会丢信息。关键输出先按 bytes 拿，再尝试多种编码，记录失败。

验收：超时能杀掉子进程；大输出不死锁；退出码非 0 有完整日志；用户输入不能注入命令；环境变量最小化。`,
    code: String.raw`import subprocess, sys

cmd = [sys.executable, "-m", "scores", "show", "--json"]
try:
    proc = subprocess.run(
        cmd, capture_output=True, text=True,
        encoding="utf-8", errors="replace",
        timeout=30, check=False,
        env={"PATH": "/usr/bin:/bin", "HOME": "/tmp", "LANG": "C.UTF-8"},
    )
except subprocess.TimeoutExpired as exc:
    print("timeout:", exc.cmd)
else:
    if proc.returncode != 0:
        print("failed:", proc.returncode)
        print(proc.stderr[-2000:])
    else:
        print(proc.stdout)`,
    output: `# 成功：打印 JSON
# 失败：退出码 + stderr 最后 2000 字符
# 超时：捕获 TimeoutExpired 并终止子进程`,
    tip: `列表参数不走 shell；timeout 后要 kill；communicate 防死锁；检查退出码并留日志。`
  }]);

  add("ch16-2", [{
    h: "工程深化：Excel、Word、PDF 的批量生成与校验",
    p: `办公文档生成的核心不是「能写出来」，而是「打开不报错、格式不乱、数据对得上」。Excel 用 openpyxl/xlsxwriter，Word 用 python-docx，PDF 用 reportlab/WeasyPrint。先选对工具：xlsxwriter 只能新建、速度快；openpyxl 能读写改，适合模板填充。

Excel 模板填充要保留样式。用 openpyxl 打开模板，按命名区域或固定单元格写值，不要重建整个工作簿。写完后检查公式是否重算、合并单元格是否错位、列宽是否够。大量数据写入用 [[write_only=True]] 模式，减少内存。

Word 模板用 [[docxtpl]] 或 python-docx 的占位符替换。占位符命名要唯一，避免 [[{{name}}]] 和 [[{{name_cn}}]] 混淆；替换前检查所有占位符是否都有值，缺值要报错而不是留空。表格循环行要用模板引擎的循环语法，不要手工复制段落。

PDF 生成要区分「版式固定」和「内容流式」。固定表单用 reportlab 绝对定位；长文用 WeasyPrint 从 HTML/CSS 排版，分页、页眉页脚更好控制。中文字体要嵌入，否则在别人机器上显示方框；确认字体许可证允许嵌入。

批量生成要命名可追溯：[[成绩单-2026-11-25-林晓.pdf]]，不要 [[output(1).pdf]]。生成清单记录输入、输出、哈希、失败原因；失败的文件不要留在正式目录，放 [[failed/]] 并附日志。

打开校验不能少：xlsx 用 openpyxl 重新打开，docx 用 python-docx 读段落数，PDF 用 pypdf 读页数。只检查文件大小不够，0 字节也可能是「成功」。能自动化就自动化，不能自动化的至少抽样人工打开。

验收：模板样式保留；占位符无遗漏；中文字体正常；批量命名唯一；失败文件隔离；生成后能重新打开。`,
    code: String.raw`from openpyxl import load_workbook
from pathlib import Path

def fill_template(template: Path, out: Path, values: dict):
    wb = load_workbook(template)
    ws = wb.active
    for cell, value in values.items():
        ws[cell] = value
    wb.save(out)
    # 重新打开校验
    check = load_workbook(out, read_only=True)
    assert check.active["B2"].value == values["B2"]
    check.close()

fill_template(Path("template.xlsx"), Path("out.xlsx"), {"B2": "林晓", "C2": 12.34})`,
    output: `# out.xlsx 可被 Excel/openpyxl 打开，
# B2/C2 值与输入一致，模板样式保留。`,
    tip: `模板填充保留样式；占位符缺值报错；中文字体嵌入；失败文件隔离；生成后重新打开。`
  }, {
    h: "故障排查：批量对账、差异报告与重跑",
    p: `批量任务的验收不是「全部成功」，而是「成功多少、失败多少、差异在哪」。对账要两边都读进来，按主键外连接，列出「只在左」「只在右」「两边都有但字段不同」三类差异。不要只比总行数，行数相同也可能内容错位。

差异报告要可操作：主键、字段、左值、右值、差异类型。金额/时间要有容差，字符串要 trim/统一大小写，日期要统一时区。浮点金额转整数分再比，避免 0.01 的显示误差。

重跑要只处理失败项。把失败主键写入 [[retry.json]]，下次读它而不是全量重跑；成功后从列表移除。全量重跑成本高，还可能重复产生副作用。重跑前确认失败原因已修复，不要盲目重试。

批次号贯穿日志、输出、数据库。每批一个 id，所有记录带 batch_id；出问题能按批次回滚或删除。不要用时间戳当唯一批次号，同一秒可能跑两个任务。

并发批量要限制。Excel/Word 生成吃内存，PDF 渲染吃 CPU；同时开 20 个进程会把机器拖死。用线程/进程池限制并发，按文件大小动态调整。失败重试要有上限，避免坏文件无限循环。

验收：对账三类差异都能列出；重跑只处理失败项；批次可回滚；并发不拖垮机器；报告能被业务人员看懂。`,
    code: String.raw`import pandas as pd

left = pd.DataFrame({"id": [1, 2, 3], "amount": [100, 200, 300]})
right = pd.DataFrame({"id": [1, 2, 4], "amount": [100, 250, 400]})

merged = left.merge(right, on="id", how="outer", suffixes=("_l", "_r"), indicator=True)
only_left = merged[merged["_merge"] == "left_only"]
only_right = merged[merged["_merge"] == "right_only"]
both = merged[merged["_merge"] == "both"].copy()
both["diff"] = both["amount_l"] - both["amount_r"]
changed = both[both["diff"] != 0]
print(only_left[["id"]].to_dict("records"))
print(only_right[["id"]].to_dict("records"))
print(changed[["id", "amount_l", "amount_r", "diff"]].to_dict("records"))`,
    output: `[{'id': 3}]
[{'id': 4}]
[{'id': 2, 'amount_l': 200, 'amount_r': 250, 'diff': -50}]`,
    tip: `外连接分三类差异；金额转整数分；失败清单驱动重跑；batch_id 贯穿；并发限流。`
  }]);

  add("ch16-3", [{
    h: "工程深化：定时任务的调度、锁与错过补偿",
    p: `定时任务不是「while True: sleep(86400)」就可靠。进程重启、机器休眠、任务超时都会导致错过。Linux 用 cron/systemd timer，容器用调度平台；Python 内部可以用 APScheduler，但要知道它不解决机器宕机。

cron 的最小粒度是分钟，时区默认是系统时区。写 [[0 8 * * *]] 前确认服务器时区，否则「早上 8 点」可能是 UTC。需要秒级用 systemd [[OnCalendar]] 或应用内调度。任务命令用绝对路径，cron 的 PATH 很短，虚拟环境要显式激活或用 [[/path/venv/bin/python]]。

任务要加锁，防止上一轮没跑完下一轮又启动。用文件锁或数据库锁，拿不到就跳过并记录「skipped: locked」。不要用 [[kill]] 上一个进程，可能留下半截数据。长任务要设置超时，超时后优雅退出。

错过补偿：任务启动时检查「上次成功时间」，如果超过预期周期，补跑一次或标记 missed。不要无限补跑，历史缺失太多时只补最近 N 次，其余人工处理。补偿任务要幂等，重复跑不会翻倍。

日志要写到文件或 stdout，cron 默认把输出邮件给管理员，很多人不看。用 [[logging]] 写文件并轮转，或交给 systemd journal。每次运行记录开始/结束/耗时/处理量/失败数，出问题能看出是「没跑」还是「跑了失败」。

监控要有心跳。任务超过预期时间没成功，发告警；连续失败 N 次，升级告警。不要只监控进程存活，进程活着但卡住不等于任务成功。心跳写到一个文件/表，外部监控读最后时间。

验收：时区正确；上一轮未结束时跳过；错过能补偿；日志可查；失败告警；重启后任务恢复。`,
    code: String.raw`# crontab -e
# 每天 08:00（服务器时区）跑一次，日志追加
0 8 * * * cd /srv/scores && /srv/scores/.venv/bin/python -m scores daily >> /var/log/scores.log 2>&1

# systemd timer（片段）
# [Timer]
# OnCalendar=*-*-* 08:00:00
# Persistent=true

# 应用内锁
import fcntl
lock = open("/tmp/scores.lock", "w")
try:
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
except BlockingIOError:
    raise SystemExit("another run is active")`,
    output: `# 上一轮未结束：退出码 0 或专用码，日志记 skipped
# 机器重启：systemd Persistent=true 补跑错过的一次`,
    tip: `cron 注意时区/PATH；任务加非阻塞锁；错过补偿要幂等；日志+心跳+告警。`
  }, {
    h: "故障排查：任务监控、重试与死信队列",
    p: `批量任务失败后，最差的做法是「整批重跑」。应该把失败项写入死信队列（dead letter），带原始输入、错误类型、重试次数、下次重试时间。主流程继续处理其他项，死信单独重试或人工处理。

重试次数要有限，策略要分类。网络错误可以重试 3 次，数据错误重试 100 次也没用；权限错误要人工修。每次重试记录原因，避免「同一个错误刷满日志」。超过上限后标记 failed，不再自动重试。

监控指标至少四个：待处理数、成功数、失败数、最老待处理时长。最老时长持续增长，说明消费速度跟不上；失败率突增，说明上游数据或依赖坏了。把指标打到日志/监控系统，不要只看最后一行「完成」。

告警要可执行。消息里带任务名、批次 id、失败数、前三条错误、日志链接；不要只发「任务失败」。告警聚合，避免一次故障发几百条；同一批次只发一条汇总。

恢复流程要写下来：如何暂停、如何重跑死信、如何回滚批次、如何通知上游。没有恢复手册的监控，只是通知，不是运维。定期演练一次，确认手册有效。

验收：失败项进死信；重试有上限和分类；指标能看出积压；告警带上下文；恢复手册可执行。`,
    code: String.raw`import json, time
from pathlib import Path

DEAD = Path("dead-letter.jsonl")

def handle(item):
    try:
        process(item)
    except Exception as exc:
        record = {
            "item": item,
            "error": type(exc).__name__,
            "message": str(exc),
            "attempts": item.get("attempts", 0) + 1,
            "next_retry": time.time() + 300,
        }
        with DEAD.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, ensure_ascii=False) + "\n")
        raise`,
    output: `# dead-letter.jsonl 每行一个失败项：
# 原始输入、错误类型、消息、次数、下次重试时间`,
    tip: `失败项进死信；按错误类型定重试；监控积压与失败率；告警带批次和日志；写恢复手册。`
  }]);
})();

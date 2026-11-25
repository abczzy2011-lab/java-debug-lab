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

  add("ch16-3", [{
    h: "综合项目：批量生成成绩单并对账",
    p: `项目目标：从一个成绩 CSV 和一组模板，为每位学生生成 Excel 成绩单、Word 评语和 PDF 汇总；要求命名唯一、失败隔离、可重跑、能对账。这个项目把第 16 章的文件、模板、批量、定时串成一条真实办公流水线。

第一步准备数据。CSV 至少含 [[student_id, name, class, event, seconds, rank, comment]]；按 [[student_id]] 分组，每人一份。先校验 id 唯一、必填字段非空、成绩在范围内；缺字段进错误报告，不生成空白文档。

第二步准备模板。Excel 用命名区域或固定单元格；Word 用 [[{{name}}]]、[[{{comment}}]] 占位符；PDF 汇总用 HTML 模板 + WeasyPrint。模板里不要写业务计算，计算在数据层完成；占位符列一张清单，生成前检查是否都有值。

第三步定输出结构。正式目录 [[out/2026-11-25/]] 放成功文件，[[out/2026-11-25/failed/]] 放失败文件，[[manifest.csv]] 记录 [[student_id, type, path, status, error, sha256]]。文件名用 [[学号-姓名-成绩单.xlsx]]，去掉路径非法字符，长度限制 120 字符。

第四步批量生成。用 [[ThreadPoolExecutor]] 限制 4-8 个并发（文档生成吃内存）；每个任务独立临时目录，成功后才移动到正式目录；失败捕获异常写 manifest，不中断其他任务。不要把所有文件先读进内存再写。

第五步校验。每个生成文件重新打开：xlsx 用 openpyxl 读关键单元格；docx 用 python-docx 读段落数；PDF 用 pypdf 读页数。校验失败按失败处理，不要留在正式目录。抽样人工打开，确认中文字体和排版。

第六步对账。生成结束后，用输入学生集合与 manifest 成功集合外连接，列出「未生成」「重复生成」「多余文件」。数量必须一致；不一致时先停止交付，修逻辑再重跑。对账报告和 manifest 一起归档。

第七步重跑。[[--retry-failed]] 只读 manifest 中 failed 的行，重新生成；成功项不重复。输入数据变了，manifest 哈希变，走新批次。重跑前清理 failed 目录，避免旧失败文件混淆。

第八步定时与通知。每天 07:30 用 cron/systemd 触发；文件锁防重叠；完成后发一封摘要邮件（成功/失败/耗时/附件链接），不要给每个人发。失败时告警带 manifest 路径和前三条错误。

验收：每人一份且命名唯一；模板样式保留；中文正常；失败文件隔离；manifest 可追溯；对账数量一致；重跑只处理失败；定时任务不重叠；通知含摘要。`,
    code: String.raw`from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import csv, hashlib, os, shutil, tempfile

def make_one(row: dict, template: Path, out_dir: Path) -> dict:
    safe = "".join(c for c in row["name"] if c not in '\\/:*?"<>|')
    target = out_dir / f"{row['student_id']}-{safe}-成绩单.xlsx"
    tmp_dir = Path(tempfile.mkdtemp(dir=out_dir, prefix=".work-"))
    try:
        tmp = tmp_dir / target.name
        fill_excel(template, tmp, row)
        check_excel(tmp)
        shutil.move(str(tmp), target)
        return {"student_id": row["student_id"], "path": str(target),
                "status": "ok", "sha256": sha256(target)}
    except Exception as exc:
        return {"student_id": row["student_id"], "path": "",
                "status": "failed", "error": f"{type(exc).__name__}: {exc}"}
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)

def build_all(rows, template, out_dir):
    out_dir.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(lambda r: make_one(r, template, out_dir), rows))
    write_manifest(out_dir / "manifest.csv", results)
    return results`,
    output: `# out/2026-11-25/2026001-林晓-成绩单.xlsx
# out/2026-11-25/manifest.csv
# status,student_id,path,error,sha256
# ok,2026001,...,...,a1b2...
# failed,2026002,,ValueError: missing comment,`,
    tip: `按学生分组；占位符清单；输出目录隔离；并发限流；生成后重开校验；manifest 对账；只重跑失败。`
  }]);

  add("ch17-3", [{
    h: "综合项目：带背压与断点续传的并发下载器",
    p: `项目目标：从一个 URL 列表并发下载文件，限制并发数、支持重试、断点续传、校验哈希、优雅退出，并输出进度和失败清单。要求不能因为一个坏 URL 拖垮全部，也不能无限开协程把内存吃满。这个项目把第 17 章的队列、信号量、TaskGroup、取消串起来。

第一步定输入。URL 列表放 CSV/JSON，每项含 [[url, dest, sha256, size]]；dest 是相对路径，禁止 [[..]] 和绝对路径，防止目录穿越。下载前创建目标目录，检查磁盘空间；已存在且哈希匹配的文件直接跳过。

第二步限流。用 [[asyncio.Semaphore(8)]] 控制同时下载数；用 [[asyncio.Queue(maxsize=32)]] 做任务队列，生产者读 URL 列表，消费者下载。队列有界形成背压，避免一次创建十万个 Task。

第三步下载。[[aiohttp]] 或 [[httpx]] 的流式接口，[[timeout=aiohttp.ClientTimeout(total=300, connect=10)]]；分块写 [[.part]] 文件，支持 Range 续传。服务端返回 206 才续传，200 要 truncate 重写；用 ETag/Last-Modified 做 If-Range。

第四步重试。只重试超时、连接错误、429、5xx；429 读 Retry-After；指数退避 + 抖动；每个文件最多 3 次。404/403 不重试，直接进失败清单。重试时保留 .part，续传而不是从头。

第五步校验。下载完成计算 SHA256，与输入比对；不匹配删除 .part 并记失败。大小也可以校验；MIME 只作参考，不替代哈希。校验通过后 [[os.replace]] 成正式文件。

第六步优雅退出。捕获 SIGINT/SIGTERM，设置 [[stop_event]]，停止生产者，取消消费者；已下载的 .part 保留，状态写 [[state.json]]；退出码 130。再次启动从 state 和 .part 继续。

第七步进度。每完成 N 个文件打印「完成/总数/失败/字节/速率」；进度写 stderr；最终输出 JSON 摘要到 stdout。不要每个 chunk 打印，I/O 会成为瓶颈。

第八步测试。用本地 HTTP 服务器提供：正常文件、404、429 一次后成功、内容变化、慢响应；测试并发上限、重试、续传、哈希失败、取消。不要测试打外网。

验收：并发不超过 8；队列有界；坏 URL 不影响其他；429 会等；断点续传生效；哈希失败被拒；Ctrl-C 能退出并保留状态；摘要数字与文件一致。`,
    code: String.raw`import asyncio, hashlib, os, signal
from pathlib import Path
import aiohttp

stop = asyncio.Event()
sem = asyncio.Semaphore(8)

async def download(session, item, q):
    async with sem:
        dest = Path(item["dest"])
        part = dest.with_suffix(dest.suffix + ".part")
        dest.parent.mkdir(parents=True, exist_ok=True)
        for attempt in range(3):
            try:
                headers = {}
                if part.exists():
                    headers["Range"] = f"bytes={part.stat().st_size}-"
                async with session.get(item["url"], headers=headers,
                                       timeout=aiohttp.ClientTimeout(total=300, connect=10)) as r:
                    if r.status == 429:
                        await asyncio.sleep(int(r.headers.get("Retry-After", "5")))
                        continue
                    if r.status == 404:
                        raise RuntimeError("not found")
                    r.raise_for_status()
                    mode = "ab" if r.status == 206 else "wb"
                    with open(part, mode) as fh:
                        async for chunk in r.content.iter_chunked(65536):
                            fh.write(chunk)
                if sha256(part) != item["sha256"]:
                    part.unlink(missing_ok=True)
                    raise RuntimeError("checksum mismatch")
                os.replace(part, dest)
                return {"url": item["url"], "status": "ok"}
            except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
                if attempt == 2:
                    return {"url": item["url"], "status": "failed", "error": str(exc)}
                await asyncio.sleep(0.5 * (2 ** attempt))
        return {"url": item["url"], "status": "failed"}

async def main(items):
    q = asyncio.Queue(maxsize=32)
    async with aiohttp.ClientSession() as session:
        async with asyncio.TaskGroup() as tg:
            for item in items:
                await q.put(item)
            for _ in range(8):
                tg.create_task(worker(session, q))

async def worker(session, q):
    while not stop.is_set():
        item = await q.get()
        try:
            if item is None:
                break
            result = await download(session, item, q)
            print(result, flush=True)
        finally:
            q.task_done()`,
    output: `# 8 个并发，队列上限 32；
# .part 断点续传，SHA256 校验通过后 replace；
# Ctrl-C 退出码 130，state.json 保留进度。`,
    tip: `信号量+有界队列双限流；只重试可恢复错误；Range 续传；哈希校验；取消保留 .part；本地服务器测试。`
  }]);

  add("ch18-6", [{
    h: "毕业项目：从脏 CSV 到可交付成绩系统",
    p: `这是全书的收尾项目：把一份脏 CSV 变成可查询、可排名、可导出、可交付的成绩系统。要求覆盖清洗、模型、存储、排名、报表、CLI、测试、打包、部署和回滚。不是再写一个 demo，而是按真实交付标准做一遍。

第一步范围。输入：[[students.csv]]、[[results.csv]]、[[events.csv]]；输出：[[clean.json]]、[[ranking.csv]]、[[report.html]]、[[manifest.json]]。CLI 四个命令：[[import]]、[[rank]]、[[report]]、[[verify]]。先写这四条命令的验收表，再写代码。

第二步清洗。学生表校验 id 唯一、姓名非空、年级枚举；成绩表校验项目存在、秒数范围、状态枚举；项目表校验 code 唯一、单位。错误分行号/列名/原值；缺列 fail-fast；重复按业务键处理并报告。清洗结果写 [[clean.json]]，带输入哈希和规则版本。

第三步模型与存储。用 dataclass + Enum 定义 Student/Event/Result；用 SQLite 存三张表，唯一索引防重复；Repository 封装 SQL，领域层不写 SQL。导入用事务：整批成功才提交，失败回滚；批次 id 写进每行。

第四步排名。按项目分组，过滤 DNS/DNF/DSQ；排序、并列同名次、下一名跳号；积分规则配置化；输出 [[ranking.csv]] 含名次、姓名、队伍、成绩、积分。排名逻辑纯函数，单测覆盖并列/缺赛/空组。

第五步报表。从 clean/ranking 生成 HTML：摘要、项目分布图、排名表、异常清单；模板带数据版本、生成时间、输入哈希；打印样式表头重复、行不截断；图表 y 从 0 开始。报告写到临时目录，成功后原子替换。

第六步 CLI 与退出码。[[main(argv) -> int]]；0 成功、1 数据错误、2 用法错误、130 Ctrl-C；stdout 只输出结果/JSON，日志走 stderr；[[--debug]] 显示堆栈。[[verify]] 检查文件存在、哈希、行数、排名连续、报告可打开。

第七步测试。单元：清洗/排名/积分；集成：四条命令用 subprocess 跑 fixture；属性：排名不变量、解析往返；golden：报告关键片段；wheel smoke：安装后跑 [[--help]] 和最小导入。测试数据覆盖正常/缺列/重复/非法枚举/空文件。

第八步交付。src 布局、pyproject、README、变更日志、LICENSE；[[python -m build]]；TestPyPI/本地 wheel 安装；systemd timer 或 cron 每天跑；manifest 记录批次、文件哈希、耗时；失败告警带批次和日志。回滚：保留上一版 wheel 和数据库备份，出问题切回上一版并重跑失败批次。

验收：四条命令全可用；重复导入不重复；排名正确；报表可读可打印；verify 全过；测试全绿；wheel 干净安装；定时任务不重叠；失败可回滚；README 让新人能跑。这个项目做完，才算真正把 Python 从语法用到了交付。`,
    code: String.raw`from pathlib import Path
import argparse, json, sqlite3, sys

def cmd_import(args) -> int:
    try:
        batch = import_all(Path(args.students), Path(args.results), Path(args.events))
        print(json.dumps({"batch": batch, "status": "ok"}, ensure_ascii=False))
        return 0
    except SchemaError as exc:
        print(f"schema error: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"import failed: {exc}", file=sys.stderr)
        return 1

def cmd_verify(args) -> int:
    checks = verify_outputs(Path(args.dir))
    failed = [c for c in checks if not c["ok"]]
    print(json.dumps(checks, ensure_ascii=False, indent=2))
    return 1 if failed else 0

def main(argv=None) -> int:
    p = argparse.ArgumentParser(prog="scores")
    sub = p.add_subparsers(dest="cmd", required=True)
    imp = sub.add_parser("import")
    imp.add_argument("--students", required=True)
    imp.add_argument("--results", required=True)
    imp.add_argument("--events", required=True)
    imp.set_defaults(func=cmd_import)
    ver = sub.add_parser("verify")
    ver.add_argument("--dir", default="out")
    ver.set_defaults(func=cmd_verify)
    args = p.parse_args(argv)
    return args.func(args)

if __name__ == "__main__":
    raise SystemExit(main())`,
    output: `$ scores import --students students.csv --results results.csv --events events.csv
{"batch": "2026-11-25-a1b2c3", "status": "ok"}
$ scores verify --dir out
[{"check": "ranking_rows", "ok": true}, {"check": "report_open", "ok": true}]
# 退出码 0；数据错误 1；用法错误 2；Ctrl-C 130`,
    tip: `先写验收表；清洗/模型/存储/排名/报表/CLI/测试/打包/部署/回滚十步；每步有可执行验收。`
  }]);
})();

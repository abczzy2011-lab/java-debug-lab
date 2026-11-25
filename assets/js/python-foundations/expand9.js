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

  add("ch9-1", [{
    h: "工程深化：原子写、崩溃安全与文件锁",
    p: `写文件最危险的时刻不是 write 报错，而是写到一半进程被杀。直接 [[open(path, "w")]] 会先截断旧文件，再逐块写入；如果此时断电、容器重启或程序崩溃，原文件已经没了，新文件又不完整。对报表、数据库导出、配置文件这类「不能丢」的文件，必须用「临时文件 + fsync + 原子 rename」的流程。

做法是：在目标目录创建同目录临时文件，写入内容后 [[flush()]]，再 [[os.fsync(fileno)]]，最后 [[os.replace(tmp, target)]]。同目录很关键，跨文件系统的 rename 不是原子操作。[[os.replace]] 在 POSIX 上覆盖目标也是原子的；Windows 上同样会替换，但目标被占用时会失败，要捕获 PermissionError 并提示关闭文件。写完还要尽量 fsync 目录，确保目录项也落盘；很多教程漏掉这一步。

文件锁用于防止两个进程同时改同一份数据。[[fcntl.flock]] 在 Unix 可用，Windows 要用 [[msvcrt.locking]] 或第三方库。锁文件本身也有坑：进程崩溃后锁会自动释放（flock 随文件描述符关闭），但用「创建一个 .lock 文件」的方案可能留下僵尸锁。优先用操作系统锁，不要自己用 [[os.path.exists]] 判断。

并发写的另一个误区是「每个进程写自己的文件就安全」。如果多个进程最后都要更新同一个汇总文件，仍然会丢更新。要么让一个进程串行汇总，要么用数据库事务/队列，要么写分区文件最后合并。文件系统不是数据库，不提供跨进程事务。

临时文件要放在目标目录，命名带 pid 与随机串，权限按最终文件设置。[[tempfile.NamedTemporaryFile(dir=target.parent, delete=False)]] 可以用，但要记得在 finally 里删除临时文件；[[os.replace]] 成功后临时路径已不存在。异常路径必须清理，否则目录会被 tmp 文件塞满。

验收要模拟失败：写一半抛异常，确认旧文件仍然完整；两个进程同时写，确认最终只有一个版本且没有半截内容；kill -9 后再启动，确认能识别并清理残留临时文件。只测试成功路径，等于没有测试原子写。`,
    code: String.raw`from pathlib import Path
import os, tempfile

def atomic_write(path: Path, text: str) -> None:
    path = path.resolve()
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    tmp = Path(tmp_name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
            fh.flush()
            os.fsync(fh.fileno())
        os.replace(tmp, path)
        try:
            dfd = os.open(path.parent, os.O_RDONLY)
            try:
                os.fsync(dfd)
            finally:
                os.close(dfd)
        except OSError:
            pass
    finally:
        if tmp.exists():
            tmp.unlink()`,
    output: `# 正常：目标文件只在写完后出现新内容
# 异常：旧文件保持不变，临时文件被清理
# 并发：最后一个是完整文件，不会出现半截 JSON`,
    tip: `同目录临时文件 + fsync + os.replace；不要直接 open("w") 覆盖重要文件。`
  }]);

  add("ch9-2", [{
    h: "工程深化：给 CSV/JSON 加数据契约，不要等下游报错",
    p: `CSV 和 JSON 能读进来，不代表数据可信。缺列、空值、类型漂移、重复主键、编码错误，都会在统计阶段变成莫名其妙的数字。数据契约的作用是把这些检查前移：读入后先验证结构，再进入业务逻辑；错误要带行号、列名、原始值，而不是只抛一个 ValueError。

最小契约包括：必需列是否齐全、每列的类型、是否允许空、取值范围、唯一键、枚举值。CSV 还要检查分隔符、引号、BOM、行尾换行。JSON 要检查顶层是对象还是数组、字段嵌套、数字是否被当成字符串。验证器可以先手写，复杂后再引入 JSON Schema 或 pydantic；不要一上来就上重框架，先把错误信息做清楚。

错误策略有两种：fail-fast 适合配置文件、金额、权限这类「错一条就不能继续」的数据；收集全部错误适合批量导入，让用户一次看到所有坏行。实现上用一个 [[errors]] 列表记录 [[RowError(row, column, value, reason)]]，超过阈值再停止，避免坏文件产生百万条错误把内存撑爆。

类型转换要显式。CSV 读出来一切都是字符串，[[int("12.0")]] 会失败；空字符串不能直接转 float；时区、小数逗号、千分位都要先规范化。转换函数应该返回「值或错误」，而不是用异常控制正常流程。一个 [[parse_seconds("1:02.35")]] 应该能区分「格式错误」和「超出范围」。

验证通过后，输出一份导入报告：总行数、成功数、失败数、跳过数、错误分布、前 N 条错误。报告既是给用户看的，也是后续对账的依据。不要只打印「导入完成」，那等于没有可观测性。

最后做契约测试：给一份最小合法样例、一份缺列样例、一份类型错误样例、一份空文件样例，确认每种都给出预期错误。数据契约不是文档里的一句话，而是能被执行、被回归的测试。`,
    code: String.raw`from dataclasses import dataclass
from datetime import datetime
import csv

@dataclass
class RowError:
    row: int
    column: str
    value: str
    reason: str

REQUIRED = {"date", "athlete", "event", "seconds"}

def parse_row(row: dict, line_no: int, errors: list) -> dict | None:
    missing = REQUIRED - row.keys()
    if missing:
        errors.append(RowError(line_no, "row", "", f"missing columns: {sorted(missing)}"))
        return None
    try:
        seconds = float(row["seconds"])
    except ValueError:
        errors.append(RowError(line_no, "seconds", row["seconds"], "not a number"))
        return None
    if seconds <= 0 or seconds > 3600:
        errors.append(RowError(line_no, "seconds", row["seconds"], "out of range"))
        return None
    return {"date": row["date"], "athlete": row["athlete"].strip(),
            "event": row["event"].strip(), "seconds": seconds}

def read_rows(path, errors):
    with open(path, encoding="utf-8-sig", newline="") as fh:
        for i, row in enumerate(csv.DictReader(fh), start=2):
            parsed = parse_row(row, i, errors)
            if parsed:
                yield parsed`,
    output: `# 错误报告示例：
# row=7 column=seconds value="1,02.35" reason="not a number"
# 总行 120，成功 118，失败 2，错误全部带行号与原始值。`,
    tip: `先验证结构再转类型；错误带行号/列名/原值；批量导入收集错误而不是第一条就中断。`
  }]);

  add("ch9-3", [{
    h: "工程深化：ExceptionGroup、重试边界与异常设计",
    p: `普通 [[except]] 一次只能处理一个异常；批量任务里多个子任务同时失败时，逐个抛会丢掉「还有哪些也失败了」。Python 3.11 的 [[ExceptionGroup]] 把多个异常打包，[[except*]] 可以按类型分组处理。它不是「异常套异常」的语法糖，而是让并发/批处理保留完整的失败集合。

典型用法：用 [[TaskGroup]] 并发跑多个导入任务，所有子任务结束后把异常聚合成 ExceptionGroup；外层用 [[except* ValueError]] 处理数据错误，用 [[except* OSError]] 处理文件错误，最后检查是否还有未处理的异常。不要在 except 里只打印第一条，然后假装任务结束。

重试不是对所有异常都适用。网络超时、429、503、连接重置通常可重试；400、401、403、404、数据校验失败通常不可重试；编程错误（TypeError、KeyError）重试一万次也不会好。重试策略要按异常类型白名单，不要写一个 [[except Exception: retry]]。

退避要有上限和抖动。固定 sleep 会让所有客户端同时重试，形成惊群；指数退避加随机抖动能打散。还要读服务端的 [[Retry-After]]，它比自己的公式更权威。总耗时要有预算，不能因为重试把一次请求拖成十分钟；超过预算就失败并带上最后一次错误。

异常链要保留根因。捕获底层异常后抛业务异常，用 [[raise ReportError("import failed") from exc]]，traceback 会同时保留两层。只写 [[raise ReportError(...)]] 会丢掉原始堆栈，排查时只能猜。反过来，也不要把所有异常都包成同一个自定义异常，调用方就无法区分「文件不存在」和「格式错误」。

自定义异常要少而清晰：一个基类、按层级的几个子类、必要的字段（路径、行号、任务 id）。异常消息给人和日志看，字段给程序判断。不要把异常当控制流：可预期的「没找到」可以返回 None 或 Result，真正的异常留给意外。

验收时至少测试三类：可重试异常最终成功、可重试异常耗尽预算、不可重试异常立即失败。再测试 ExceptionGroup 的聚合结果是否完整。异常路径的测试覆盖率，往往比成功路径更能说明工程质量。`,
    code: String.raw`import asyncio, random

class Retryable(RuntimeError): pass
class Permanent(RuntimeError): pass

async def call_once(i):
    if i < 2:
        raise Retryable(f"temporary {i}")
    if i == 2:
        raise Permanent("bad request")
    return "ok"

async def with_retry(fn, attempts=4, base=0.2):
    last = None
    for n in range(attempts):
        try:
            return await fn(n)
        except Retryable as exc:
            last = exc
            if n == attempts - 1:
                break
            await asyncio.sleep(base * (2 ** n) + random.random() * 0.1)
    raise Retryable(f"retry budget exhausted: {last}")

async def main():
    try:
        print(await with_retry(call_once))
    except Retryable as exc:
        print("retryable failed", exc)
    except Permanent as exc:
        print("permanent failed", exc)

asyncio.run(main())`,
    output: `retryable failed retry budget exhausted: temporary 1`,
    tip: `只重试白名单异常；指数退避 + 抖动 + 总预算；保留 raise ... from 的根因链。`
  }]);

  add("ch9-4", [{
    h: "工程深化：结构化日志与一次真实排障",
    p: `线上排错最怕的不是没有日志，而是日志里全是「开始处理」「处理完成」，没有任务 id、没有输入、没有耗时。人类读的日志和机器检索的日志要同时满足：一条日志至少有级别、时间、logger 名、消息、以及可检索的上下文字段。

Python 标准库的 [[logging]] 就能做结构化：用 [[extra={"task_id": ...}]] 挂字段，再用自定义 Formatter 输出 JSON；或者用 [[structlog]]。关键是上下文要自动传播，不要每个函数都手动传 task_id。同步代码用 [[contextvars.ContextVar]]，异步代码同样适用；线程池里要显式复制上下文，否则子线程拿不到。

日志级别要克制。DEBUG 给开发定位细节，INFO 给正常业务里程碑，WARNING 给可恢复的异常，ERROR 给失败但程序还能继续，CRITICAL 给不可用。不要把每次重试都打成 ERROR，那会淹没真正的故障；重试中的第一次失败用 WARNING，最终失败用 ERROR。

异常日志要带堆栈，但不要重复打印同一个异常。顶层捕获一次，用 [[logger.exception("import failed", extra={"task_id": task_id})]] 记录完整堆栈；内层只记录上下文或直接 raise，不要每层都 log 一遍。重复日志会让告警系统重复计数。

排查顺序：先看时间窗口和任务 id，确认失败发生在哪一步；再看输入参数、数据版本、依赖版本；最后看系统指标（CPU、内存、磁盘、连接数）。不要一上来就重启，重启会丢掉现场。能复现时，用同一份输入在本地跑；不能复现时，补日志而不是猜。

日志轮转要配置：按大小或时间切分，保留 N 份，压缩旧文件，设置权限。容器环境优先输出 stdout，让平台收集，不要自己写文件再挂卷。日志里不要放密码、token、完整身份证号；需要关联用户时用哈希或内部 id。

最后做一次「故障演练」：人为让导入器抛异常，确认日志里有 task_id、行号、原始值、堆栈，告警能触发，用户能看到可理解的错误。演练不过，真实故障时一定手忙脚乱。`,
    code: String.raw`import logging, json, contextvars, uuid

task_id = contextvars.ContextVar("task_id", default="-")

class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
            "task_id": task_id.get(),
        }
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
log = logging.getLogger("scores")
log.addHandler(handler)
log.setLevel(logging.INFO)

def import_file(path):
    token = task_id.set(uuid.uuid4().hex[:8])
    try:
        log.info("import start", extra={"path": path})
        # ... 实际导入 ...
        log.info("import done")
    except Exception:
        log.exception("import failed")
        raise
    finally:
        task_id.reset(token)`,
    output: `{"level": "INFO", "logger": "scores", "msg": "import start", "task_id": "a1b2c3d4"}
{"level": "ERROR", "logger": "scores", "msg": "import failed", "task_id": "a1b2c3d4", "exc": "Traceback ..."}`,
    tip: `结构化字段 + contextvars 传播 task_id；异常只在顶层记录一次；日志里不放密钥。`
  }]);
})();

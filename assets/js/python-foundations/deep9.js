window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch9-1": [
    {
      h: "深读：大文件分块读，不要把内存当无底洞",
      p: `[[read()]] 会把整个文件变成字符串或字节，文件多大就占多大内存，还要加上解码后的副本。处理 1 GB 日志时，[[read()]] 很可能直接 [[MemoryError]]。逐行迭代是流式的，但「一行」本身也可能极大，例如没有换行的 JSON 或二进制日志。

分块读用 [[read(size)]] 循环，配合 [[iter(lambda: f.read(64 * 1024), b"")]]。文本模式按字符读，二进制模式按字节读；二进制更可控。分块后要自己处理跨块边界，例如一个单词被切成两半。

判断策略：小文件（<10 MB）可以一次读；中大文件逐行；超大或二进制文件分块。永远不要用「先读进来看看多大」来拖延，[[stat().st_size]] 就能看大小。`,
      code: String.raw`from pathlib import Path

p = Path("big.log")
p.write_bytes(b"line1\nline2\nline3\n")

with p.open("rb") as f:
    for chunk in iter(lambda: f.read(4), b""):
        print(repr(chunk))`,
      output: `b'line'
b'1\\nl'
b'ine2'
b'\\nli'
b'ne3\\n'`,
      tip: `[[iter(lambda: f.read(n), b"")]] 是标准分块写法；文本模式要处理跨块的行边界，二进制更简单。`
    },
    {
      h: "深读：临时文件、临时目录与清理",
      p: `[[tempfile.TemporaryFile]] 创建匿名临时文件，关闭即删除；[[NamedTemporaryFile]] 有名字，适合需要传给外部命令的场景；[[TemporaryDirectory]] 创建临时目录，with 退出时递归删除。它们默认放在系统临时目录，也可以用 [[dir=]] 指定同盘目录。

临时文件不是「一定安全」。在多进程/多用户环境里，[[NamedTemporaryFile]] 默认 [[delete=True]]，Windows 上关闭前别人打不开；需要跨进程共享时用 [[delete=False]]，并自己负责清理。文件名用 [[tempfile.mkstemp]] 生成，避免可预测名称。

「写临时文件再原子替换」是数据导入的常用模式：解析到临时文件，校验通过后 [[os.replace]] 到目标。中途失败不会破坏旧数据。`,
      code: String.raw`import tempfile, os, json
from pathlib import Path

with tempfile.TemporaryDirectory() as td:
    tmp = Path(td) / "part.json"
    tmp.write_text(json.dumps({"ok": True}), encoding="utf-8")
    print(tmp.exists())
    target = Path("result.json")
    os.replace(tmp, target)
print(target.read_text(encoding="utf-8"))
target.unlink()`,
      output: `True
{"ok": true}`,
      tip: `[[TemporaryDirectory]] 退出时递归删除；跨进程共享的临时文件要 [[delete=False]] 并自己清理。`
    },
    {
      h: "深读：并发写文件与文件锁",
      p: `多个进程同时 [[open(path, "a")]] 写，单行不保证原子；两个进程可能交错写入，日志出现半行。[[os.write]] 对同一文件描述符的写入是原子的（受块大小限制），但 Python 的文本层有缓冲，不能直接依赖。

简单方案是「一个进程写、其他进程发消息」；复杂方案用文件锁（[[fcntl.flock]]、[[msvcrt.locking]]）或数据库。文件锁是咨询锁，不阻止不遵守锁的程序；跨平台行为也不同。日志场景直接用 [[logging.handlers.QueueHandler]] 或系统日志，不要自己写锁。

业务数据不要用「追加 JSON 行」当数据库；并发更新需要事务，交给 SQLite 或真正的数据库。`,
      code: String.raw`import fcntl

with open("shared.log", "a", encoding="utf-8") as f:
    fcntl.flock(f.fileno(), fcntl.LOCK_EX)
    try:
        f.write("one complete line\n")
        f.flush()
    finally:
        fcntl.flock(f.fileno(), fcntl.LOCK_UN)`,
      output: `one complete line`,
      tip: `[[fcntl]] 只在 Unix；Windows 用 [[msvcrt]]。文件锁是协作式的，不阻止不遵守锁的进程。`
    }
  ],
  "ch9-2": [
    {
      h: "深读：CSV 方言、分隔符与 Excel 兼容",
      p: `CSV 没有唯一标准。分隔符可能是逗号、分号、制表符；引号规则、换行、转义都可能不同。[[csv.Sniffer]] 可以猜方言，但猜错会静默错列，生产导入应让用户显式指定或提供预览。

Excel 在中文环境常导出 GBK 编码、分号分隔、带 BOM 的 CSV；[[csv.reader]] 默认逗号。读之前先看前 2 KB 的 [[repr]]，确认分隔符和编码，再决定 [[delimiter]]、[[quotechar]]、[[encoding]]。

写出 Excel 能直接打开的 UTF-8 CSV，建议 [[encoding="utf-8-sig"]]，否则 Excel 可能把中文显示成乱码。[[lineterminator="\n"]] 可以避免 Windows 双换行，但 Excel 对 [[\n]] 也能识别。`,
      code: String.raw`import csv, io

text = "name;score\n林晓;91\n周宁;86\n"
reader = csv.reader(io.StringIO(text), delimiter=";")
for row in reader:
    print(row)

print(csv.Sniffer().sniff(text).delimiter)`,
      output: `['name', 'score']
['林晓', '91']
['周宁', '86']
;`,
      tip: `[[Sniffer]] 只是猜测；生产导入让用户确认分隔符/编码，别把猜错当成功。`
    },
    {
      h: "深读：JSON 自定义编码器与默认值",
      p: `[[json.dumps]] 遇到 [[datetime]]、[[Decimal]]、[[Path]]、[[set]] 会抛 [[TypeError]]。可以给 [[default=]] 传一个函数，把不认识的对象转成可序列化值；[[cls=]] 继承 [[JSONEncoder]] 适合更复杂的策略。

[[default]] 只处理「无法序列化」的对象，不处理键。字典键必须是 str/int/float/bool/None；[[Path]] 当键会直接报错。需要非字符串键，先转成字符串并约定还原规则。

反序列化没有 [[object_hook]] 的强类型还原；[[object_hook]] 可以把 dict 转成自定义对象，但它会对每个对象调用，性能有成本。更推荐在应用层显式转换，保持 JSON 层简单。`,
      code: String.raw`import json
from datetime import datetime
from decimal import Decimal

def encode(obj):
    if isinstance(obj, datetime):
        return {"__type__": "datetime", "value": obj.isoformat()}
    if isinstance(obj, Decimal):
        return str(obj)
    raise TypeError(type(obj).__name__)

text = json.dumps({"when": datetime(2026, 11, 24), "price": Decimal("19.90")}, default=encode)
print(text)
print(json.loads(text))`,
      output: `{"when": {"__type__": "datetime", "value": "2026-11-24T00:00:00"}, "price": "19.90"}
{'when': {'__type__': 'datetime', 'value': '2026-11-24T00:00:00'}, 'price': '19.90'}`,
      tip: `[[default=]] 处理值，不处理键；自定义类型用带类型标记的对象，读回时显式还原。`
    },
    {
      h: "深读：JSON Schema 与外部数据校验",
      p: `[[json.loads]] 只保证语法合法，不保证字段存在、类型正确、范围合理。外部 API 返回 [[{"score": "abc"}]] 也能解析成功，错误要到计算时才爆。JSON Schema 用一份声明描述结构，工具（如 [[jsonschema]]）负责校验。

没有第三方库时，可以写一个最小校验函数：检查必需键、类型、范围、枚举，收集所有错误而不是遇到第一个就抛。校验失败要返回结构化错误，带上字段路径和实际值。

不要把「能 [[json.loads]]」当成「数据可用」。语法、结构、业务规则是三层，越早校验越省排错。`,
      code: String.raw`def validate_score(obj):
    errors = []
    if not isinstance(obj, dict):
        return ["根节点必须是对象"]
    if not isinstance(obj.get("name"), str) or not obj["name"].strip():
        errors.append("name 必须是非空字符串")
    score = obj.get("score")
    if not isinstance(score, (int, float)) or isinstance(score, bool):
        errors.append("score 必须是数字")
    elif not 0 <= score <= 100:
        errors.append("score 必须在 0..100")
    return errors

print(validate_score({"name": "林晓", "score": 91}))
print(validate_score({"name": "", "score": "abc"}))`,
      output: `[]
['name 必须是非空字符串', 'score 必须是数字']`,
      tip: `校验要收集全部错误，不要遇到第一个就返回；字段路径和实际值一起返回，调用方才能修。`
    }
  ],
  "ch9-3": [
    {
      h: "深读：ExceptionGroup 与 except*",
      p: `Python 3.11 引入 [[ExceptionGroup]]，用来同时表达多个独立异常。批量处理时，你可能希望「所有坏行都报出来」，而不是遇到第一个就停。[[ExceptionGroup("bad rows", [err1, err2])]] 可以一次抛出多个；[[except* ValueError as eg]] 按类型拆分处理。

[[except*]] 只能捕获 [[ExceptionGroup]] 中的子组，不能和普通 [[except]] 混在同一个 try。它的 [[eg.exceptions]] 是拆出的子异常元组，处理完还可以继续传播未匹配的部分。

不要为了用新语法而用；只有当「多个错误需要一起报告」时才有价值。单条失败仍用普通异常。`,
      code: String.raw`errors = [ValueError("bad score"), TypeError("bad name")]

try:
    raise ExceptionGroup("导入失败", errors)
except* ValueError as eg:
    print("value errors:", [str(e) for e in eg.exceptions])
except* TypeError as eg:
    print("type errors:", [str(e) for e in eg.exceptions])`,
      output: `value errors: ['bad score']
type errors: ['bad name']`,
      tip: `[[except*]] 处理异常组；普通 [[except]] 不能和它混用。多个错误一起报时才值得用。`
    },
    {
      h: "深读：重试、退避与「不要重试所有错误」",
      p: `网络请求失败可以重试，但参数错误、认证失败、404 重试没有意义。重试策略要先分类：瞬时错误（超时、连接重置、429）可以重试；永久错误（400、401、404）直接失败。

退避用指数加随机抖动，避免大量客户端同时重试压垮服务。重试次数要有上限，并且记录每次失败原因。没有超时的请求不要重试，因为它可能永远挂着。

[[urllib]] 标准库没有内置重试；[[requests]] 可以用 [[HTTPAdapter]] + [[Retry]]；[[httpx]] 有 transport retries。自己写循环时，确保每次重试使用新的请求对象/连接。`,
      code: String.raw`import time, random

def retry(fn, attempts=3, base=0.2):
    last = None
    for i in range(attempts):
        try:
            return fn()
        except (TimeoutError, ConnectionError) as err:
            last = err
            sleep = base * (2 ** i) + random.random() * 0.05
            print(f"retry {i + 1} after {sleep:.2f}s")
            time.sleep(sleep)
    raise last

def flaky():
    if random.random() < 0.5:
        raise TimeoutError("timeout")
    return "ok"

print(retry(flaky))`,
      output: `retry 1 after 0.24s
ok`,
      tip: `只重试瞬时错误；指数退避加抖动，次数有上限，并记录每次原因。`
    },
    {
      h: "深读：上下文管理器吞异常，什么时候是陷阱",
      p: `[[__exit__(exc_type, exc, tb)]] 返回 [[True]] 会吞掉异常。[[contextlib.suppress(FileNotFoundError)]] 就是故意吞掉指定异常；这是明确意图。陷阱在于自定义 [[__exit__]] 无条件 [[return True]]，导致所有异常消失，调用方以为成功。

只有在「异常是可预期的、且清理后可以安全继续」时才吞。比如删除临时文件时的 [[FileNotFoundError]] 可以 suppress；数据库写入失败不能吞。吞异常时最好记录日志。

[[contextlib.ExitStack]] 可以动态管理多个资源，适合「不确定打开几个文件」的场景；它按后进先出顺序关闭，任何一个关闭失败都会传播。`,
      code: String.raw`from contextlib import suppress

with suppress(FileNotFoundError):
    open("not-there.txt", encoding="utf-8").read()

print("继续执行")

class Bad:
    def __enter__(self): return self
    def __exit__(self, *exc): return True

with Bad():
    raise ValueError("会被吞掉")
print("异常消失了")`,
      output: `继续执行
异常消失了`,
      tip: `[[__exit__]] 返回 True 会吞异常；只对明确可忽略的异常使用 [[suppress]]，不要无条件吞。`
    }
  ],
  "ch9-4": [
    {
      h: "深读：用 dictConfig 管住日志配置",
      p: `[[logging.basicConfig]] 只适合小脚本；多模块、多 handler、按级别分流时，用 [[logging.config.dictConfig]]。它可以用一份字典描述 formatters、handlers、loggers，并从 YAML/JSON 加载。

配置要点：给 logger 设 [[propagate=False]] 避免重复输出；handler 设 level 做分流（控制台 INFO、文件 DEBUG）；formatter 带 [[%(name)s]] 和 [[%(lineno)d]]；根 logger 只做兜底。

配置应该在应用入口执行一次。库代码不要读配置文件，也不要假设根 logger 的 handler。测试时可以用 [[caplog]] 捕获日志，不要依赖控制台输出。`,
      code: String.raw`import logging.config

config = {
    "version": 1,
    "formatters": {"std": {"format": "%(levelname)s %(name)s: %(message)s"}},
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "std", "level": "INFO"}},
    "loggers": {"scores": {"handlers": ["console"], "level": "DEBUG", "propagate": False}},
}
logging.config.dictConfig(config)
log = logging.getLogger("scores")
log.debug("细节")
log.info("正常")`,
      output: `INFO scores: 正常`,
      tip: `logger 设 [[propagate=False]] 防止重复输出；handler 的 level 和 logger 的 level 是两道闸。`
    },
    {
      h: "深读：结构化日志，让机器也能读",
      p: `纯文本日志适合人看，不适合聚合查询。结构化日志把字段写成 JSON：时间、级别、logger、消息、请求 id、耗时、记录数。这样 ELK/Loki 可以按字段过滤，不用正则解析。

标准库没有内置 JSON formatter，可以自己写一个 [[logging.Formatter]] 子类，在 [[format]] 里 [[json.dumps]]。异常信息放 [[exc_info]] 字段，不要塞进 message。注意不要把密钥、token、完整身份证写进日志。

结构化不等于每行都 JSON；本地开发用可读文本，生产用 JSON 是常见组合。关键是字段名稳定。`,
      code: String.raw`import json, logging

class JsonFormatter(logging.Formatter):
    def format(self, record):
        data = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "time": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
        }
        if record.exc_info:
            data["exc"] = self.formatException(record.exc_info)
        return json.dumps(data, ensure_ascii=False)

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
log = logging.getLogger("scores")
log.addHandler(handler)
log.setLevel(logging.INFO)
log.info("导入完成 rows=%s", 2)`,
      output: `{"level": "INFO", "logger": "scores", "message": "导入完成 rows=2", "time": "2026-11-24T10:00:00"}`,
      tip: `结构化日志字段名要稳定；异常放独立字段，别把 traceback 拼进 message。`
    },
    {
      h: "深读：一次真实性能排查的顺序",
      p: `性能问题先问三个问题：慢在启动、慢在单次请求、慢在批量任务？启动慢多半是导入重依赖；单次请求慢看数据库/网络；批量慢看循环里的 IO 和重复计算。

用 [[cProfile]] 找累计耗时最大的函数，用 [[line_profiler]] 看单函数内哪一行，用 [[py-spy]] 采样线上进程（不需要重启）。不要一上来就换语言/加缓存，先确认瓶颈。

常见修复：把循环内查询改成批量查询；把重复 [[re.compile]] 提到模块级；用生成器代替大列表；用 [[join]] 代替字符串 [[+=]]；给数据库加索引；减少序列化层数。`,
      code: String.raw`import cProfile, pstats, io

def slow():
    return sum(len(str(i)) for i in range(200_000))

pr = cProfile.Profile()
pr.enable()
slow()
pr.disable()
out = io.StringIO()
pstats.Stats(pr, stream=out).sort_stats("cumulative").print_stats(5)
print(out.getvalue().splitlines()[:3])`,
      output: `         5 function calls in 0.045 seconds
   Ordered by: cumulative time
   ncalls  tottime  percall  cumtime  percall filename:lineno(function)`,
      tip: `先测量再优化；[[cProfile]] 看函数累计，[[py-spy]] 看线上采样，别凭感觉换实现。`
    }
  ],
  "ch9-review": [
    {
      h: "本章复盘：数据链路的五个关卡",
      p: `这一章把「读文件」拆成了五个关卡：路径、编码、格式、异常、可观测性。任何一关出错，最后的数据都可能「看起来对、实际错」。路径错会读错文件；编码错会乱码或 BOM 进字段；格式错会把引号内逗号切开；异常处理错会静默丢行；没有日志则无法知道丢了多少。

一个合格的导入器应该同时输出：成功记录、失败记录（行号+原因）、总数、耗时。不要只打印「导入完成」。失败记录不是垃圾，它是下一次修复的输入。

本章验收：拿一份带 BOM、空行、坏行、字段内逗号的 CSV，写一个脚本输出 [[good.jsonl]]、[[bad.jsonl]] 和一行统计日志；换目录运行、换 Python 版本运行，结果一致。`,
      code: String.raw`# 目标产物
# data/good.jsonl
# data/bad.jsonl
# 日志：total=3 ok=2 bad=1 elapsed=0.012s

from pathlib import Path
print(Path("data/good.jsonl").exists(), Path("data/bad.jsonl").exists())`,
      output: `True True`,
      tip: `导入器的交付物不是「跑完」，而是「可核对的好/坏两份结果 + 统计」。`
    }
  ]
});

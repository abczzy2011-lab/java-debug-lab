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

  add("ch8-3", [{
    h: "综合项目：把单文件脚本做成可安装的 scores-kit 包",
    p: `这一章的项目不是再写几个 import 示例，而是把前 7 章的脚本整理成一个真正能 [[pip install]] 的包。目标很具体：包名 [[scores-kit]]，导入名 [[scores]]，提供 [[load_csv]]、[[rank]]、[[render_report]] 三个公开函数，一个 [[scores]] 命令，内置一份默认报表模板，附带类型标记和测试。做完后，换一台干净机器也能安装、导入、运行。

第一步定目录：[[src/scores/__init__.py]] 只暴露公开 API 和版本号；[[src/scores/models.py]] 放 dataclass；[[src/scores/io.py]] 放读写；[[src/scores/report.py]] 放渲染；[[src/scores/cli.py]] 放命令行；[[src/scores/data/report.md]] 放模板；[[tests/]] 放测试。不要把所有函数塞进 [[__init__.py]]，那会让导入变慢，也让内部实现被外部误用。

第二步定公开 API。[[__init__.py]] 写 [[__all__ = ["load_csv", "rank", "render_report", "__version__"]]，其他名字一律视为内部。函数签名要稳定：[[load_csv(path: str | Path) -> list[Row]]]，[[rank(rows: list[Row]) -> list[Row]]]，[[render_report(rows, out: Path, template: str | None = None) -> Path]]。先定签名再写实现，调用方和测试才有合同。

第三步处理资源。模板不要用 [[__file__]] 拼路径，用 [[importlib.resources.files("scores") / "data" / "report.md"]]。[[pyproject.toml]] 的 package-data 要包含 [[data/*.md]] 和 [[py.typed]]。构建后解压 wheel，确认模板真的在里面；这一步不过，安装后一定报 FileNotFoundError。

第四步做 CLI。[[cli.py]] 的 [[main(argv=None) -> int]] 负责解析参数、调用服务、捕获异常、返回退出码；[[__main__.py]] 只写 [[raise SystemExit(main())]]。命令至少支持 [[scores rank input.csv --out report.md]] 和 [[scores --version]]。参数错误返回 2，数据错误返回 1，成功返回 0；结果写 stdout，日志写 stderr。

第五步做测试。单元测试覆盖 [[load_csv]] 的正常/缺列/空文件；集成测试用 [[subprocess]] 跑 [[python -m scores]]，检查退出码和输出文件；资源测试在 wheel 安装后读取模板。测试数据放 [[tests/fixtures/]]，不要在生产包里带测试数据。

第六步做构建验收。[[python -m build]] 生成 sdist 和 wheel；[[twine check dist/*]] 通过；在干净 venv [[pip install dist/*.whl]]；运行 [[python -c "import scores; print(scores.__version__)"]] 和 [[scores --help]]；再跑一次 [[render_report]]。源码目录能跑不算完成，wheel 能跑才算。

第七步写 README。开头一句话说明包做什么；安装命令；三行快速示例；配置项；常见错误（缺列、编码、模板找不到）；测试命令；版本与许可证。README 的示例要复制到 [[examples/quickstart.py]] 并用测试跑一遍，避免文档过期。

第八步留扩展点。[[scores/plugins.py]] 可以先留空，但 [[render_report]] 的 [[template]] 参数、[[load_csv]] 的编码参数要预留。不要为了「以后可能用」加一堆抽象；只留真实需要的扩展点。项目的边界清楚，后续加功能才不会推翻结构。

验收清单：干净环境安装成功；三个公开函数可导入；CLI 两种入口行为一致；模板从 wheel 读取；测试全绿；README 示例可运行；wheel 里无测试文件；版本号只出现一处。八条全过，这个包才算从脚本变成交付物。`,
    code: String.raw`# 目录
# pyproject.toml
# README.md
# src/scores/__init__.py
# src/scores/models.py
# src/scores/io.py
# src/scores/report.py
# src/scores/cli.py
# src/scores/data/report.md
# tests/test_io.py
# tests/test_cli.py

# src/scores/__init__.py
from importlib.metadata import version
from .io import load_csv
from .report import render_report
from .rank import rank

__all__ = ["load_csv", "rank", "render_report", "__version__"]
__version__ = version("scores-kit")

# pyproject.toml
[project]
name = "scores-kit"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = []

[project.scripts]
scores = "scores.cli:main"

[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
scores = ["data/*.md", "py.typed"]`,
    output: `$ python -m build
$ twine check dist/*
$ python -m venv /tmp/verify && /tmp/verify/bin/pip install dist/scores_kit-0.1.0-py3-none-any.whl
$ /tmp/verify/bin/scores --version
scores-kit 0.1.0
$ /tmp/verify/bin/python -c "from scores import render_report; print('ok')"
ok`,
    tip: `先定公开 API 再写实现；资源用 importlib.resources；CLI 两入口共用 main；干净 wheel 验收。`
  }]);

  add("ch9-4", [{
    h: "综合项目：可恢复的成绩导入服务",
    p: `这个项目把第 9 章的文件、异常、日志串成一条真实导入链：读 CSV、验证契约、清洗、写 JSON、生成错误报告、记录结构化日志、失败可重跑。输入是一份可能很脏的成绩表，输出是干净的 JSON、错误报告和一份可读的导入摘要。要求重复执行不产生重复数据，中途崩溃能从断点恢复。

先定输入契约：必需列 [[date, athlete, event, seconds]]；[[seconds]] 必须是 0 到 3600 的浮点数；[[date]] 是 ISO 日期；[[athlete]] 去空格后非空。契约检查在读取阶段完成，缺列直接失败，单行错误收集到错误列表，不因为一行坏数据中断整个文件。

状态设计：输入文件哈希 + 业务日期组成 [[batch_id]]；处理进度写 [[state/{batch_id}.json]]，包含最后成功行号、已处理 id、错误计数。每处理 N 行提交一次状态，状态用原子写。重启时读状态，从最后成功行继续；已处理的 id 用集合去重，防止重复写入。

输出设计：干净数据先写 [[out/{batch_id}.json.part]]，全部成功后再 [[os.replace]] 成正式文件；错误报告写 [[out/{batch_id}-errors.csv]]，每行带行号、列名、原值、原因。导入摘要写 [[out/{batch_id}-summary.json]]，包含总行、成功、失败、跳过、耗时、输入哈希。

日志设计：用 JSON formatter，每条带 [[batch_id]]、[[row]]、[[stage]]；开始、每 N 行、结束各一条 INFO；单行错误用 WARNING，不打印完整堆栈；最终失败用 ERROR + exception。日志写 stderr 或文件，不要混进 JSON 输出。

异常设计：文件不存在/不可读是 [[InputError]]，契约缺列是 [[SchemaError]]，单行数据是 [[RowError]]，写入失败是 [[OutputError]]。CLI 捕获后返回不同退出码，并打印人类可读消息；内部保留 [[raise ... from exc]] 的根因链，方便 [[--debug]] 查看。

重跑策略：如果 [[batch_id]] 已存在且摘要显示成功，默认跳过并提示；[[--force]] 才重新处理。失败批次保留状态和错误报告，修复输入后从断点继续；输入文件变了，哈希变，自动是新批次，不会混用旧状态。

验收：正常文件导入成功；缺列文件退出码 1 且错误报告有列名；坏行只影响自己；中途 kill 后重启从断点继续；重复跑不重复写入；输入变更生成新批次；摘要数字与输出文件行数一致。`,
    code: String.raw`from pathlib import Path
import hashlib, json, os, tempfile

def batch_id(path: Path, business_date: str) -> str:
    digest = hashlib.sha256(path.read_bytes()).hexdigest()[:12]
    return f"{business_date}-{digest}"

def load_state(path: Path, bid: str) -> dict:
    state_file = path / f"{bid}.json"
    if state_file.exists():
        return json.loads(state_file.read_text(encoding="utf-8"))
    return {"last_row": 1, "seen": [], "errors": 0}

def save_state(path: Path, bid: str, state: dict) -> None:
    target = path / f"{bid}.json"
    fd, tmp_name = tempfile.mkstemp(dir=path, prefix=".state-")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            json.dump(state, fh, ensure_ascii=False)
            fh.flush(); os.fsync(fh.fileno())
        os.replace(tmp_name, target)
    finally:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)

def import_csv(src: Path, out_dir: Path, business_date: str) -> dict:
    bid = batch_id(src, business_date)
    state = load_state(out_dir, bid)
    seen = set(state["seen"])
    errors = []
    rows = []
    with open(src, encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        if not REQUIRED <= set(reader.fieldnames or []):
            raise SchemaError(f"missing columns: {sorted(REQUIRED - set(reader.fieldnames or []))}")
        for line_no, raw in enumerate(reader, start=2):
            if line_no <= state["last_row"]:
                continue
            parsed = parse_row(raw, line_no, errors)
            if parsed and parsed["id"] not in seen:
                rows.append(parsed)
                seen.add(parsed["id"])
            if line_no % 100 == 0:
                state.update(last_row=line_no, seen=list(seen), errors=len(errors))
                save_state(out_dir, bid, state)
    write_atomic(out_dir / f"{bid}.json", rows)
    write_errors(out_dir / f"{bid}-errors.csv", errors)
    summary = {"batch_id": bid, "total": len(rows) + len(errors),
               "ok": len(rows), "failed": len(errors), "skipped": 0}
    write_atomic(out_dir / f"{bid}-summary.json", summary)
    return summary`,
    output: `# out/2026-11-25-a1b2c3d4e5f6.json
# out/2026-11-25-a1b2c3d4e5f6-errors.csv
# out/2026-11-25-a1b2c3d4e5f6-summary.json
# {"total": 120, "ok": 118, "failed": 2, "skipped": 0}`,
    tip: `batch_id=输入哈希+业务日期；状态原子写；先写 .part 再 replace；错误带行号原值；重跑幂等。`
  }]);

  add("ch10-3", [{
    h: "综合项目：把字典泥球重构成可演化的领域模型",
    p: `项目起点是一段真实的「字典泥球」：[[row = {"name": ..., "event": ..., "seconds": ..., "team": ...}]]，函数之间传来传去，字段名拼错要到运行时才发现，新增一个「年级」字段要改十几个地方。目标是用 dataclass、Enum、Protocol、仓储接口，把这段代码重构成可测试、可演化的领域模型。

第一步识别概念：[[Athlete]]（运动员，id、name、team、grade）、[[Event]]（项目，code、name、unit）、[[Result]]（成绩，athlete、event、seconds、status、date）。不要让一个 [[Result]] 同时承担「运动员信息」和「项目信息」，那是重复和漂移的根源。引用用 id，展示时再 join。

第二步用值对象约束字段。[[seconds]] 用 [[__post_init__]] 检查 0 到 3600；[[grade]] 用 Enum（G7/G8/G9）；[[status]] 用 Enum（FINISHED/DNS/DNF/DSQ）。字符串状态一律替换成枚举，比较用成员，不用魔法值。非法值在创建对象时失败，而不是在统计时变成 NaN。

第三步定义仓储接口。[[AthleteRepo]] 提供 [[get(id)]]、[[list_all()]]；[[ResultRepo]] 提供 [[save(result)]]、[[list_by_event(event)]]。用 [[Protocol]] 描述，具体实现可以是 SQLite、内存、HTTP；领域层只依赖接口。测试传 [[MemoryRepo]]，不需要数据库。

第四步做领域服务。[[RankingService]] 接收 ResultRepo 和 AthleteRepo，计算名次、并列、积分；[[ReportService]] 接收结果和运动员，生成展示行。服务不直接读文件/数据库，所有 I/O 通过仓储注入。这样排名逻辑可以用固定数据做单元测试，不依赖环境。

第五步做兼容读取。历史 JSON 可能用 [["state"]] 而不是 [["status"]]，可能用 [["time"]] 而不是 [["seconds"]]。在 [[from_dict]] 工厂集中处理旧字段，写出只写新字段。未知枚举值抛 [[ModelError]]，不要静默变成默认值。版本号写进 JSON，迁移脚本按版本处理。

第六步做迁移脚本。读旧 JSON 一行、转新模型、写新 JSON；记录成功/失败数、失败行号；迁移前备份，迁移后抽样比对。脚本要能重复执行：已经是新格式就跳过。不要写「一次性脚本」跑完删掉，出问题无法回滚。

第七步写测试。对象测试：非法秒数报错、枚举值正确、frozen 对象可哈希；仓储测试：重复 id 报错、空列表；服务测试：并列名次、缺赛不计分、跨项目积分。测试数据用构造器，不要复制大段 JSON。

验收：字段名拼错在类型检查/构造时暴露；新增字段只改模型和迁移；排名逻辑不依赖数据库；旧数据能读；新数据能写；测试覆盖正常/边界/非法三类。做到这些，字典泥球才算变成模型。`,
    code: String.raw`from dataclasses import dataclass
from enum import Enum
from typing import Protocol

class Status(str, Enum):
    FINISHED = "finished"; DNS = "dns"; DNF = "dnf"; DSQ = "dsq"

class Grade(str, Enum):
    G7 = "G7"; G8 = "G8"; G9 = "G9"

@dataclass(frozen=True)
class Athlete:
    id: str
    name: str
    team: str
    grade: Grade

@dataclass(frozen=True)
class Result:
    athlete_id: str
    event: str
    seconds: float
    status: Status = Status.FINISHED
    def __post_init__(self):
        if self.status is Status.FINISHED and not 0 < self.seconds < 3600:
            raise ValueError(f"seconds out of range: {self.seconds}")

class ResultRepo(Protocol):
    def save(self, result: Result) -> None: ...
    def list_by_event(self, event: str) -> list[Result]: ...

class RankingService:
    def __init__(self, results: ResultRepo, athletes: dict[str, Athlete]):
        self.results = results
        self.athletes = athletes
    def rank(self, event: str):
        rows = [r for r in self.results.list_by_event(event) if r.status is Status.FINISHED]
        rows.sort(key=lambda r: r.seconds)
        out, last, rank = [], None, 0
        for i, r in enumerate(rows, 1):
            if r.seconds != last:
                rank, last = i, r.seconds
            out.append((rank, self.athletes[r.athlete_id].name, r.seconds))
        return out`,
    output: `[(1, '林晓', 12.3), (1, '陈默', 12.3), (3, '王远', 12.5)]`,
    tip: `先识别概念再拆对象；枚举替代魔法值；仓储 Protocol 注入；旧字段集中 from_dict；迁移可重复。`
  }]);

  add("ch11-3", [{
    h: "综合项目：插件化导出框架与配置校验",
    p: `项目目标：同一份成绩数据可以导出 CSV、JSON、Markdown 三种格式，未来加 Excel/PDF 不改核心代码。用 ABC 定义导出接口，用 [[__init_subclass__]] 自动注册，用描述符校验插件配置，用注册表按名字分发。这个项目把第 11 章的抽象、继承、描述符、容器协议全部用上。

接口设计：[[Exporter]] 是抽象基类，抽象成员只有 [[name]]、[[suffix]]、[[export(rows, path)]]；可选能力 [[description]]、[[supports_stream]] 给默认实现。不要把所有格式细节塞进基类，基类只规定「怎么被调用」，不规定「怎么实现」。

注册机制：[[Exporter.registry]] 是类级字典；[[__init_subclass__]] 在子类创建时检查 [[name]] 是否存在、是否重复，然后登记。重复名字直接抛 ValueError，不要后注册覆盖前一个。注册发生在 import 时，因此插件模块必须被显式导入；入口处集中导入内置插件，第三方插件用 entry_points 发现。

配置校验：每个插件可以用描述符声明 [[priority]]、[[encoding]]，在 [[__set__]] 里检查类型和范围。描述符状态按类/实例存储，不要放在描述符对象上。配置错误在插件加载时暴露，而不是导出到一半才报。

分发逻辑：[[export_rows(rows, fmt, path)]] 从注册表取插件，检查 [[fmt]] 是否存在，调用 [[export]]，返回实际路径。未知格式抛 [[UnknownFormat]] 并列出可用格式；插件抛异常时带上插件名和路径，不要吞掉。导出到临时文件再原子替换，避免半截文件。

流式与内存：CSV/JSON 可以流式写，PDF/Excel 可能需要全量。接口里 [[export]] 接收 rows 列表，简单但吃内存；需要流式时另加 [[iter_export(rows_iter, path)]] 可选方法，核心只在 [[supports_stream]] 为真时使用。不要为了统一把大数据全读进内存。

测试策略：为每个插件写「最小数据导出后能被对应库读回」的测试；为注册表写「重复名字报错」「未知格式报错」；为配置写「非法 priority 报错」；为失败写「插件抛异常时文件不残留」。测试用临时目录，不写用户目录。

验收：新增一个插件只加一个文件 + 导入；核心代码不改；重复名字启动失败；未知格式报错列出选项；导出失败无半截文件；每个插件都能被目标程序打开。`,
    code: String.raw`from abc import ABC, abstractmethod
from pathlib import Path
import csv, json, os, tempfile

class Exporter(ABC):
    registry = {}
    name: str
    suffix: str = ".dat"
    description: str = ""
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if getattr(cls, "name", None):
            if cls.name in cls.registry:
                raise ValueError(f"duplicate exporter: {cls.name}")
            cls.registry[cls.name] = cls
    @abstractmethod
    def export(self, rows: list[dict], path: Path) -> None: ...

class CsvExporter(Exporter):
    name = "csv"; suffix = ".csv"
    def export(self, rows, path):
        with open(path, "w", newline="", encoding="utf-8-sig") as fh:
            writer = csv.DictWriter(fh, fieldnames=list(rows[0]))
            writer.writeheader(); writer.writerows(rows)

class JsonExporter(Exporter):
    name = "json"; suffix = ".json"
    def export(self, rows, path):
        path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")

def export_rows(rows, fmt: str, dest: Path) -> Path:
    cls = Exporter.registry.get(fmt)
    if not cls:
        raise ValueError(f"unknown format: {fmt}; available: {sorted(Exporter.registry)}")
    dest = dest.with_suffix(cls.suffix)
    fd, tmp_name = tempfile.mkstemp(dir=dest.parent, prefix=".export-")
    os.close(fd)
    try:
        cls().export(rows, Path(tmp_name))
        os.replace(tmp_name, dest)
    finally:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)
    return dest`,
    output: `# Exporter.registry: ['csv', 'json']
# export_rows(rows, 'json', Path('out')) -> out.json
# 未知格式：ValueError: unknown format: xml; available: ['csv', 'json']`,
    tip: `抽象接口只规定调用；__init_subclass__ 注册并拒绝重名；配置描述符校验；导出走临时文件。`
  }]);
})();

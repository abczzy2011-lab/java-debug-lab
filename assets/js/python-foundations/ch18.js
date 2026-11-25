window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch18",
  part: 5,
  number: "18",
  title: "综合项目：游泳成绩清洗与报表系统",
  summary: "把前 17 章合起来做一个能交付的项目：读原始 CSV、清洗校验、算个人最好与团体总分、生成 Markdown 报表和图表、提供 CLI、写测试、打包发布。每一节都产出可运行代码，最后一节做发布与复盘。",
  goals: [
    "能从需求写出数据契约与验收标准",
    "能实现导入、清洗、统计、报表的完整链路",
    "能为项目写单元/集成/CLI 测试",
    "能打包、定时运行并做失败告警",
    "能复盘设计取舍与后续改进"
  ],
  lessons: [
    {
      id: "ch18-1",
      title: "18.1 需求、数据契约与项目骨架",
      minutes: 55,
      lead: "项目从「要解决什么问题」开始，不是从建目录开始。这一节把模糊需求变成用户故事、数据契约、模块边界和验收标准，再搭出可运行骨架。",
      source: "综合运用 · Introducing Python 3rd / Beginning Python 4th / Head First Python 3rd",
      sections: [
        {
          h: "用户故事：谁用它、用来做什么",
          p: `场景：校游泳队教练每周拿到计时软件导出的 CSV，需要一份「谁进步了、团体总分多少、谁需要加练」的报表。现在靠手工 Excel，容易错、耗时间。

用户故事写成「作为教练，我希望……以便……」：导入本周成绩、看到个人最好、看到团体总分、导出可打印报表、失败时知道哪一行有问题。

不做的事也要写：不做在线报名、不做实时计时、不做运动员健康管理。范围清楚，项目才不会无限膨胀。`,
          code: String.raw`# 用户故事（写进 README）
# US1 作为教练，我导入计时软件 CSV，看到成功/失败行数
# US2 作为教练，我查看每个运动员的个人最好与最近一次
# US3 作为教练，我查看各队团体总分与排名
# US4 作为教练，我导出 Markdown/HTML 报表
# US5 作为教练，失败时我能定位到具体行与原因`,
          output: `5 user stories`,
          tip: `用户故事 + 明确不做什么；范围写进 README，防止无限扩展。`
        },
        {
          h: "数据契约：列、类型、必填、合法范围",
          p: `原始 CSV 列：[[date, meet, event, athlete, team, time, rank]]。[[time]] 是 [[mm:ss.ms]] 或 [[ss.ms]]；[[rank]] 可空；[[event]] 限定自由泳/蛙泳/仰泳/蝶泳/混合泳 + 距离。

契约写明：必填列、类型、允许空值、枚举、时间格式、重复键（date+meet+event+athlete）。坏行不能静默跳过，要记录行号/原因。

契约是测试和校验的共同依据；先写契约，再写解析器。`,
          code: String.raw`# 数据契约
# date: YYYY-MM-DD 必填
# meet: 非空字符串 必填
# event: 100m/200m + 泳姿 必填
# athlete: 非空 必填
# team: 非空 必填
# time: mm:ss.ms 或 ss.ms，>0 必填
# rank: 正整数或空
# 唯一键: date + meet + event + athlete`,
          output: `contract defined`,
          tip: `契约写清列/类型/必填/枚举/唯一键；坏行记录行号原因，不静默跳过。`
        },
        {
          h: "项目骨架：src 布局 + 模块边界",
          p: `按职责分模块：[[models.py]] 领域对象；[[parsing.py]] 时间/CSV 解析；[[cleaning.py]] 校验/去重；[[stats.py]] 统计；[[report.py]] 报表；[[cli.py]] 入口；[[config.py]] 配置。

依赖方向：cli → cleaning/stats/report → models/parsing；models 不依赖其他业务模块，避免循环导入。测试按模块放 [[tests/]]。

骨架先能 [[python -m scores.cli --help]]，再逐步填实现；不要一次写十个空文件。`,
          code: String.raw`# src/scores/
#   __init__.py
#   models.py
#   parsing.py
#   cleaning.py
#   stats.py
#   report.py
#   cli.py
# tests/
#   test_parsing.py
#   test_cleaning.py
#   test_stats.py
#   test_cli.py
# pyproject.toml`,
          output: `skeleton ready`,
          tip: `按职责分模块，依赖单向；先跑通 --help，再填实现。`
        },
        {
          h: "领域模型：dataclass 表达一条成绩",
          p: `[[Result]] 用 dataclass：date、meet、event、athlete、team、time_seconds、rank。解析后统一存秒，展示时格式化；不要在各处反复解析字符串。

[[frozen=True]] 让记录不可变，避免统计时被误改；需要修改用 [[dataclasses.replace]]。[[slots=True]] 省内存（Python 3.10+）。

模型里不放 CSV 行号/原始字符串；这些属于「导入结果/错误报告」，不要污染领域对象。`,
          code: String.raw`from dataclasses import dataclass
from datetime import date

@dataclass(frozen=True, slots=True)
class Result:
    date: date
    meet: str
    event: str
    athlete: str
    team: str
    seconds: float
    rank: int | None = None`,
          output: `Result(date=..., athlete='林晓', seconds=62.35)`,
          tip: `领域模型存规范化值（秒/date），不存原始字符串；frozen 防统计误改。`
        },
        {
          h: "错误策略： fail-fast 还是收集全部错误",
          p: `导入 CSV 时，一行坏不应中断整个文件；收集 [[RowError(row_no, reason, raw)]]，最后报告「成功 N / 失败 M」。但结构性错误（缺列/编码错）应 fail-fast。

统计阶段遇到缺字段/负时间应报错，不静默跳过；这是程序 bug，不是数据脏。

错误信息要可操作：行号、列名、期望格式、实际值。不要只写「invalid row」。`,
          code: String.raw`from dataclasses import dataclass

@dataclass
class RowError:
    row_no: int
    reason: str
    raw: dict

errors = [RowError(3, "time 格式应为 mm:ss.ms", {"time": "abc"})]
print(errors[0])`,
          output: `RowError(row_no=3, reason='time 格式应为 mm:ss.ms', raw={'time': 'abc'})`,
          tip: `行级错误收集不中断；结构错误 fail-fast；错误带行号/列/期望/实际。`
        },
        {
          h: "验收标准：可执行、可核对",
          p: `验收不是「看起来对」，而是可执行断言：给定样例 CSV，导入成功 8 行、失败 2 行；个人最好等于预期秒数；团体总分等于预期；报表包含指定章节；CLI 退出码正确。

每条验收对应一个测试/命令；发布前逐条跑。验收标准写进 README 或 [[docs/acceptance.md]]。

先写验收，再写实现；否则容易做出一堆「看起来能用」的功能。`,
          code: String.raw`# 验收示例
# [ ] scores import sample.csv -> "ok=8 failed=2"
# [ ] scores report sample.csv -> report.md 包含 "个人最好"
# [ ] 坏时间行出现在 failed 列表，行号=3
# [ ] scores --help 退出码 0
# [ ] 缺文件退出码非 0 且 stderr 有路径`,
          output: `5 acceptance checks`,
          tip: `验收写成可执行断言/命令；每条对应测试，发布前逐条跑。`
        }
      ],
      points: [
        "用户故事 + 不做什么，控制范围。",
        "数据契约写清列/类型/必填/唯一键。",
        "src 布局按职责分模块，依赖单向。",
        "领域模型存规范化值，frozen 防误改。",
        "行级错误收集、结构错误 fail-fast。",
        "验收标准可执行、可核对。"
      ],
      practice: "为「游泳成绩报表」写 README：5 条用户故事、数据契约、模块图、5 条验收命令；搭出可跑 `--help` 的骨架。"
    },
    {
      id: "ch18-2",
      title: "18.2 CSV 导入、时间解析与清洗",
      minutes: 60,
      lead: "这一节实现导入链路：读 CSV、解析时间、校验字段、去重、把坏行收集成报告。所有函数都可单测，不依赖真实文件。",
      source: "综合运用 · Introducing Python 3rd / Beginning Python 4th / Head First Python 3rd",
      sections: [
        {
          h: "读 CSV：DictReader + 编码 + 缺列检查",
          p: `[[csv.DictReader]] 把每行变字典，列名来自表头；[[newline=""]] 必须加。编码先试 [[utf-8-sig]]，失败再 [[gbk]]（计时软件常导出 GBK）。

缺列/多列是结构错误，直接抛 [[ContractError]]；不要进入逐行解析。空文件/只有表头返回空结果并提示。

不要用 [[line.split(",")]]；队名/项目可能含逗号。`,
          code: String.raw`import csv
from pathlib import Path

REQUIRED = {"date", "meet", "event", "athlete", "team", "time"}

def read_rows(path: Path) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames or not REQUIRED <= set(reader.fieldnames):
            raise ValueError(f"缺列: {REQUIRED - set(reader.fieldnames or [])}")
        return list(reader)`,
          output: `rows=10`,
          tip: `DictReader + newline；缺列 fail-fast；编码先 utf-8-sig 再考虑 GBK。`
        },
        {
          h: "时间解析：mm:ss.ms 与 ss.ms",
          p: `计时格式常见 [[1:02.35]]、[[62.35]]、[[01:02.3]]。解析规则：按冒号分段，最后一段是秒（可带小数）；分钟乘 60；验证 [[0 < seconds < 3600]]。

用 [[Decimal]] 或整数毫秒避免浮点误差；展示时再格式化。坏格式抛 [[TimeFormatError]]，带原值。

不要用 [[float("1:02.35")]]；也不要假设一定有冒号。`,
          code: String.raw`def parse_time(text: str) -> float:
    text = text.strip()
    if not text:
        raise ValueError("time 为空")
    parts = text.split(":")
    if len(parts) == 1:
        seconds = float(parts[0])
    elif len(parts) == 2:
        seconds = int(parts[0]) * 60 + float(parts[1])
    else:
        raise ValueError(f"time 格式不支持: {text}")
    if not (0 < seconds < 3600):
        raise ValueError(f"time 超出范围: {text}")
    return seconds

print(parse_time("1:02.35"), parse_time("62.35"))`,
          output: `62.35 62.35`,
          tip: `按冒号分段，分钟×60；验证范围；用 Decimal/毫秒避免浮点误差。`
        },
        {
          h: "逐行校验：收集 RowError 而不是中断",
          p: `每行依次校验：日期 [[date.fromisoformat]]、枚举项目、非空姓名/队名、时间解析、rank 正整数或空。任一失败记录 [[RowError]] 并继续下一行。

成功行构造 [[Result]]；日期/时间规范化。校验函数返回 [[(result, error)]] 或抛异常由外层捕获；保持函数纯粹、可测。

错误原因要具体：[[date 格式应为 YYYY-MM-DD: 2026/11/24]]。`,
          code: String.raw`from datetime import date

def parse_row(row: dict, row_no: int):
    try:
        d = date.fromisoformat(row["date"].strip())
        seconds = parse_time(row["time"])
        rank_text = (row.get("rank") or "").strip()
        rank = int(rank_text) if rank_text else None
        if rank is not None and rank <= 0:
            raise ValueError("rank 必须为正")
        return {"date": d, "seconds": seconds, "rank": rank}, None
    except (ValueError, KeyError) as err:
        return None, {"row_no": row_no, "reason": str(err)}

print(parse_row({"date": "2026-11-24", "time": "1:02.35", "rank": "2"}, 2))`,
          output: `({'date': datetime.date(2026, 11, 24), 'seconds': 62.35, 'rank': 2}, None)`,
          tip: `逐行 try/except 收集错误；原因具体到列/期望/实际，成功行规范化。`
        },
        {
          h: "去重：唯一键与保留策略",
          p: `唯一键 [[date+meet+event+athlete]]。重复可能是计时软件重复导出/预赛决赛同名；保留策略要明确：保留最新 rank/最好成绩，还是报错？

默认「同一唯一键保留成绩最好的一条」，并在报告中记录「去重 N 条」。不要静默丢；教练需要知道。

用字典按 key 聚合，比较 [[seconds]]；并列时保留 rank 更小/后导入。`,
          code: String.raw`rows = [
    {"key": ("11-24", "100m", "林晓"), "seconds": 63.0},
    {"key": ("11-24", "100m", "林晓"), "seconds": 62.3},
]
best = {}
for r in rows:
    if r["key"] not in best or r["seconds"] < best[r["key"]]["seconds"]:
        best[r["key"]] = r
print(best[("11-24", "100m", "林晓")]["seconds"])`,
          output: `62.3`,
          tip: `唯一键 + 保留最好成绩；去重数量写进报告，不能静默丢。`
        },
        {
          h: "原子写入与导入报告",
          p: `清洗结果写 [[clean.csv]] 前先写临时文件，成功后 [[replace]] 原子替换；失败不留半文件。原始文件不动。

导入报告 [[import-report.json]]：总行数、成功、失败、去重、错误列表（行号/原因/原值）。CLI 打印摘要，详细进文件。

不要覆盖上一次报告；按时间戳/批次目录保存，便于追溯。`,
          code: String.raw`from pathlib import Path
import json, os

def atomic_write(path: Path, text: str):
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)

atomic_write(Path("clean.csv"), "date,seconds\n2026-11-24,62.35\n")
print("ok")`,
          output: `ok`,
          tip: `临时文件 + [[os.replace]] 原子替换；报告含总数/成功/失败/去重/错误明细。`
        },
        {
          h: "动手实验：导入样例并核对计数",
          p: `构造 10 行样例：2 行坏时间、1 行缺队名、1 行重复；实现 [[import_csv(path)]] 返回 [[ImportResult(rows, errors, duplicates)]]，断言成功 6、失败 3、去重 1。

验收：坏行行号正确；报告中能看到原因；clean.csv 只含成功且去重后的行。`,
          code: String.raw`from dataclasses import dataclass, field

@dataclass
class ImportResult:
    rows: list = field(default_factory=list)
    errors: list = field(default_factory=list)
    duplicates: int = 0

print(ImportResult(rows=[1, 2], errors=[1, 2, 3], duplicates=1))`,
          output: `ImportResult(rows=[1, 2], errors=[1, 2, 3], duplicates=1)`,
          tip: `导入结果用 dataclass 聚合；测试断言成功/失败/去重三个计数。`
        }
      ],
      points: [
        "DictReader + newline，缺列 fail-fast。",
        "时间按冒号解析，验证范围，避免浮点误差。",
        "逐行校验收集错误，不中断整批。",
        "唯一键去重，保留策略明确并计数。",
        "原子写入，导入报告保留错误明细。"
      ],
      practice: "实现 `import_csv(path)`：10 行样例中成功 6/失败 3/去重 1；坏行行号正确，clean.csv 原子写入。"
    },
    {
      id: "ch18-3",
      title: "18.3 统计：个人最好、团体总分与进步",
      minutes: 55,
      lead: "统计层只接收规范化的 Result，不碰 CSV/字符串。这一节实现个人最好、团体总分、进步幅度和排名，并明确并列/缺赛/项目差异的规则。",
      source: "综合运用 · Introducing Python 3rd / Beginning Python 4th / Head First Python 3rd",
      sections: [
        {
          h: "个人最好：按运动员+项目分组取最小秒",
          p: `「个人最好」通常按 [[athlete + event]] 分组，取最小 [[seconds]]；跨赛事/日期都算。并列时保留最近日期/更好 rank。

不要按 [[athlete]] 全项目取最小，那会把 50m 和 100m 混在一起。项目名要规范化（大小写/空格/距离）。

输出 [[PersonalBest(athlete, event, seconds, date, meet)]]，便于报表展示来源。`,
          code: String.raw`from collections import defaultdict

rows = [
    {"athlete": "林晓", "event": "100m自由泳", "seconds": 63.0, "date": "2026-11-02"},
    {"athlete": "林晓", "event": "100m自由泳", "seconds": 62.3, "date": "2026-11-24"},
]
best = {}
for r in rows:
    key = (r["athlete"], r["event"])
    if key not in best or r["seconds"] < best[key]["seconds"]:
        best[key] = r
print(best[("林晓", "100m自由泳")])`,
          output: `{'athlete': '林晓', 'event': '100m自由泳', 'seconds': 62.3, 'date': '2026-11-24'}`,
          tip: `个人最好按「运动员+项目」分组；别把不同距离混在一起，并列要有规则。`
        },
        {
          h: "团体总分：名次积分与并列规则",
          p: `常见积分：第 1 名 8 分、第 2 名 6 分、第 3 名 5 分……按赛事规则。只统计有 rank 的行；缺 rank 不计分但可展示。

并列名次按同一积分或按规则分配；必须写清楚。接力项目是否双倍/是否计入团体，也要配置化。

按 [[team]] 汇总，输出 [[TeamScore(team, points, golds, silvers, bronzes)]]；排序按 points 降序，再按金牌数。`,
          code: String.raw`from collections import defaultdict

points_map = {1: 8, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1}
rows = [
    {"team": "A", "rank": 1},
    {"team": "A", "rank": 3},
    {"team": "B", "rank": 2},
]
scores = defaultdict(int)
for r in rows:
    scores[r["team"]] += points_map.get(r["rank"], 0)
print(dict(scores))`,
          output: `{'A': 13, 'B': 6}`,
          tip: `积分规则配置化；只统计有 rank 的行；并列/接力规则写清楚。`
        },
        {
          h: "进步幅度：需要「上一次」而不是只有最好",
          p: `进步 = 上一次成绩 - 本次成绩（秒数越小越好）。按运动员+项目按日期排序，取最近两条；只有一条时无进步。

跨赛季/跨距离不可比；项目名必须一致。进步为负表示退步，报表用「+/-」表达。

输出 [[Progress(athlete, event, previous, current, delta, pct)]]；pct = delta / previous。`,
          code: String.raw`rows = [
    {"athlete": "林晓", "event": "100m自由泳", "seconds": 63.0, "date": "2026-11-02"},
    {"athlete": "林晓", "event": "100m自由泳", "seconds": 62.3, "date": "2026-11-24"},
]
rows.sort(key=lambda r: r["date"])
prev, cur = rows[-2], rows[-1]
delta = prev["seconds"] - cur["seconds"]
print(round(delta, 2), round(delta / prev["seconds"] * 100, 1))`,
          output: `0.7 1.1`,
          tip: `进步用最近两条同项目成绩；只有一条无进步；负值表示退步。`
        },
        {
          h: "排名与并列：不要用 sorted 后下标当名次",
          p: `名次是「成绩相同的并列」，不是数组下标。按 seconds 升序，维护 [[rank]]：相同成绩同名次，下一名跳号（1,2,2,4）或连续（1,2,2,3），按赛事规则。

输出排名表 [[RankRow(rank, athlete, seconds)]]；缺成绩不参与排名。

浮点比较用 [[round(seconds, 2)]] 或毫秒整数；直接 [[==]] 可能因精度失败。`,
          code: String.raw`rows = [("林晓", 62.35), ("周宁", 62.10), ("陈默", 62.35)]
rows.sort(key=lambda r: r[1])
ranked = []
last, rank = None, 0
for i, (name, sec) in enumerate(rows, 1):
    if sec != last:
        rank = i
        last = sec
    ranked.append((rank, name, sec))
print(ranked)`,
          output: `[(1, '周宁', 62.1), (2, '林晓', 62.35), (2, '陈默', 62.35)]`,
          tip: `名次按成绩并列，不用下标；浮点用四舍五入/毫秒比较，规则写清楚。`
        },
        {
          h: "统计层的输入输出契约",
          p: `统计函数只接收 [[list[Result]]]，返回 dataclass 列表；不读文件、不打印、不依赖全局配置。这样可以用固定样例单测。

缺赛/缺 rank/项目名不一致要在函数边界处理：抛 [[StatsError]] 或返回空，不要静默产生错误总分。

统计结果排序稳定：积分降序 + 金牌降序 + 队名，保证报表可复现。`,
          code: String.raw`from dataclasses import dataclass

@dataclass(frozen=True)
class TeamScore:
    team: str
    points: int
    golds: int

scores = [TeamScore("A", 13, 1), TeamScore("B", 6, 0)]
print(sorted(scores, key=lambda s: (-s.points, -s.golds, s.team)))`,
          output: `[TeamScore(team='A', points=13, golds=1), TeamScore(team='B', points=6, golds=0)]`,
          tip: `统计层纯函数：输入 Result 列表，输出 dataclass；排序键固定保证可复现。`
        },
        {
          h: "动手实验：用固定样例验证统计",
          p: `构造 3 个运动员、2 个项目、2 个队的数据；断言个人最好、团体总分、进步、排名四类结果。特别测试：并列、缺 rank、只有一条成绩。`,
          code: String.raw`rows = [
    {"athlete": "林晓", "event": "100m", "team": "A", "seconds": 63.0, "rank": 1},
    {"athlete": "林晓", "event": "100m", "team": "A", "seconds": 62.3, "rank": 2},
    {"athlete": "周宁", "event": "100m", "team": "B", "seconds": 62.3, "rank": 2},
]
print(min(r["seconds"] for r in rows if r["athlete"] == "林晓"))`,
          output: `62.3`,
          tip: `测试覆盖并列/缺 rank/单条成绩；固定样例让统计结果可手算核对。`
        }
      ],
      points: [
        "个人最好按运动员+项目分组取最小。",
        "团体积分规则配置化，缺 rank 不计分。",
        "进步用最近两条同项目成绩。",
        "名次按成绩并列，不用下标。",
        "统计层纯函数，排序稳定可复现。"
      ],
      practice: "用固定样例实现个人最好/团体总分/进步/排名，测试并列、缺 rank、单条成绩三种边界。"
    },
    {
      id: "ch18-4",
      title: "18.4 CLI、配置与报表生成",
      minutes: 60,
      lead: "把统计结果变成教练能看的报表：CLI 子命令、配置优先级、Markdown/HTML 输出、可选图表、退出码和日志。这一节完成用户真正使用的入口。",
      source: "综合运用 · Introducing Python 3rd / Beginning Python 4th / Head First Python 3rd",
      sections: [
        {
          h: "CLI 子命令：import / report / check",
          p: `[[scores import raw.csv --out clean.csv]] 做导入清洗；[[scores report clean.csv --out report.md]] 生成报表；[[scores check clean.csv]] 只校验不写。

每个子命令 [[set_defaults(func=...)]]，主函数分发并返回退出码。共享参数（--verbose/--config）放父 parser。

[[--help]] 要能看懂；子命令 help 写清输入/输出/示例。`,
          code: String.raw`import argparse

def cmd_import(args):
    print("import", args.input, "->", args.out)
    return 0

def cmd_report(args):
    print("report", args.input, "->", args.out)
    return 0

p = argparse.ArgumentParser(prog="scores")
sub = p.add_subparsers(dest="cmd", required=True)
pi = sub.add_parser("import"); pi.add_argument("input"); pi.add_argument("--out", default="clean.csv"); pi.set_defaults(func=cmd_import)
pr = sub.add_parser("report"); pr.add_argument("input"); pr.add_argument("--out", default="report.md"); pr.set_defaults(func=cmd_report)
args = p.parse_args(["import", "raw.csv"])
raise SystemExit(args.func(args))`,
          output: `import raw.csv -> clean.csv`,
          tip: `子命令分发 + 返回退出码；共享参数放父 parser，help 写输入/输出/示例。`
        },
        {
          h: "配置：默认、文件、环境变量、命令行",
          p: `配置项：输入编码、积分表、输出目录、是否画图。优先级：命令行 > 环境变量 > [[scores.toml]] > 内置默认。

用 [[tomllib]] 读 TOML（3.11+）；缺文件用默认，不报错。命令行 [[default=None]] 区分「没传」；最后合并。

[[--show-config]] 打印生效配置（隐藏敏感项），线上排查必备。`,
          code: String.raw`import argparse, os, tomllib

defaults = {"encoding": "utf-8-sig", "out_dir": "out"}
env = {"out_dir": os.environ.get("SCORES_OUT", defaults["out_dir"])}
p = argparse.ArgumentParser()
p.add_argument("--out-dir", default=None)
args = p.parse_args([])
out_dir = args.out_dir or env["out_dir"]
print(out_dir)`,
          output: `out`,
          tip: `优先级命令行>环境>TOML>默认；[[default=None]] 区分没传；[[--show-config]] 可排查。`
        },
        {
          h: "Markdown 报表：结构固定、数字可核对",
          p: `报表固定章节：概览（人数/项目/成绩条数）、个人最好、团体总分、进步榜、异常/去重说明、数据来源。每节用表格，数字保留 2 位。

标题写日期范围/赛事；表格列名带单位（秒）。不要在报表里写「明显进步」而没有数字。

生成函数接收统计结果，返回字符串；写文件前做模板替换/转义。Markdown 表格里的 [[|]] 要转义。`,
          code: String.raw`def render_report(best, teams):
    lines = ["# 游泳成绩报表", "", "## 个人最好", "", "| 运动员 | 项目 | 成绩(s) |", "|---|---|---|"]
    for b in best:
        lines.append(f"| {b['athlete']} | {b['event']} | {b['seconds']:.2f} |")
    return "\n".join(lines)

print(render_report([{"athlete": "林晓", "event": "100m", "seconds": 62.35}], []))`,
          output: `# 游泳成绩报表

## 个人最好

| 运动员 | 项目 | 成绩(s) |
|---|---|---|
| 林晓 | 100m | 62.35 |`,
          tip: `报表章节固定、数字保留 2 位；表格 [[|]] 要转义，结论必须有数字支撑。`
        },
        {
          h: "图表：可选依赖，失败不阻断报表",
          p: `画图用 matplotlib，但设为可选依赖 [[[project.optional-dependencies].plot]]；没安装时跳过图表并在报表注明「未生成图表」。

图表：个人最好条形图（按项目）、团体总分条形图；文件名固定 [[charts/personal-best.png]]，报表用相对路径引用。

绘图失败不能导致整个报表失败；捕获异常、记录 warning、继续生成文字报表。`,
          code: String.raw`def maybe_plot(enabled: bool):
    if not enabled:
        return "skip"
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        fig, ax = plt.subplots()
        ax.bar(["A", "B"], [13, 6])
        fig.savefig("teams.png")
        return "ok"
    except Exception as err:
        return f"warn: {err}"

print(maybe_plot(True))`,
          output: `ok`,
          tip: `绘图是可选依赖；失败只 warn，不阻断报表；图表路径用相对路径。`
        },
        {
          h: "退出码与日志：让自动化能判断",
          p: `0 成功；1 业务失败（坏行超过阈值/无有效数据）；2 用法错误。导入时若失败行 > 20% 返回 1，否则成功但报告警告。

日志写 stderr：INFO 摘要、WARNING 跳过/去重、ERROR 失败；[[--debug]] 打 traceback。stdout 只输出结果路径/摘要，便于管道。

[[--quiet]] 只输出错误；[[--json]] 输出机器可读摘要。`,
          code: String.raw`import sys

def run(ok_rows, bad_rows):
    if ok_rows == 0:
        print("没有有效数据", file=sys.stderr)
        return 1
    if bad_rows / (ok_rows + bad_rows) > 0.2:
        print(f"坏行过多: {bad_rows}", file=sys.stderr)
        return 1
    print(f"ok={ok_rows} failed={bad_rows}")
    return 0

raise SystemExit(run(8, 2))`,
          output: `ok=8 failed=2`,
          tip: `0/1/2 退出码；坏行比例阈值；stdout 结果、stderr 日志，[[--json]] 给机器。`
        },
        {
          h: "动手实验：生成一份完整报表",
          p: `用 18.2 的 clean.csv 生成 [[report.md]]：概览、个人最好、团体总分、进步、异常说明；可选生成两张图。要求：报表数字与统计函数输出一致；无数据时退出码 1。

验收：Markdown 能被渲染；表格列对齐；图表缺失时有说明。`,
          code: String.raw`from pathlib import Path

report = "# 游泳成绩报表\n\n## 概览\n\n- 运动员：3\n- 成绩条数：8\n"
Path("report.md").write_text(report, encoding="utf-8")
print("wrote report.md")`,
          output: `wrote report.md`,
          tip: `报表数字直接取自统计结果；无数据退出 1；图表缺失要在报表说明。`
        }
      ],
      points: [
        "子命令 import/report/check，统一退出码。",
        "配置优先级命令行>环境>TOML>默认。",
        "报表章节固定，数字保留 2 位可核对。",
        "图表可选依赖，失败不阻断报表。",
        "stdout 结果、stderr 日志，支持 --json。"
      ],
      practice: "实现 import/report/check 三个子命令，生成含概览/个人最好/团体/进步/异常的 report.md；无数据退出 1。"
    },
    {
      id: "ch18-5",
      title: "18.5 测试：单元、集成、CLI 与黄金文件",
      minutes: 55,
      lead: "项目能不能改，取决于测试。这一节用 pytest 覆盖解析/清洗/统计/报表/CLI，讲 fixture、parametrize、临时目录、黄金文件和覆盖率。",
      source: "综合运用 · Introducing Python 3rd / Beginning Python 4th / Head First Python 3rd",
      sections: [
        {
          h: "测试金字塔：单元多、集成少、E2E 精",
          p: `单元测试覆盖 [[parse_time]]/[[parse_row]]/[[stats]] 等纯函数，快且定位准；集成测试跑 [[import_csv → stats → report]] 链路；CLI 测试只验证参数/退出码/输出。

不要把所有逻辑都塞进 CLI 测试；慢且难定位。纯函数占比越高，测试越稳。

每个 bug 修复先写一个失败测试，再修；防止回归。`,
          code: String.raw`# tests/test_parsing.py
import pytest
from scores.parsing import parse_time

@pytest.mark.parametrize("text,expected", [
    ("62.35", 62.35),
    ("1:02.35", 62.35),
    ("01:02.3", 62.3),
])
def test_parse_time(text, expected):
    assert parse_time(text) == expected`,
          output: `3 passed`,
          tip: `纯函数用 parametrize 多案例；集成/CLI 少而精，bug 先写失败测试。`
        },
        {
          h: "fixture：临时目录与样例文件",
          p: `[[tmp_path]] 是 pytest 内置临时目录；[[monkeypatch]] 改环境变量/cwd。不要把测试文件写到项目根，污染仓库。

样例 CSV 用 fixture 写 [[tmp_path/"raw.csv"]]，编码/坏行可控；测试结束自动清理。

共享 fixture 放 [[conftest.py]]；fixture 只做数据准备，不做断言。`,
          code: String.raw`import pytest

@pytest.fixture
def sample_csv(tmp_path):
    p = tmp_path / "raw.csv"
    p.write_text("date,meet,event,athlete,team,time\n"
                 "2026-11-24,校运会,100m,林晓,A,1:02.35\n", encoding="utf-8")
    return p

def test_read(sample_csv):
    assert sample_csv.exists()`,
          output: `1 passed`,
          tip: `[[tmp_path]] 写样例，不污染仓库；fixture 只准备数据，断言放测试里。`
        },
        {
          h: "黄金文件：报表整体对比",
          p: `报表格式/章节多，逐字段断言很啰嗦；用黄金文件 [[tests/golden/report.md]] 对比整体输出。首次生成后人工审核，再提交。

浮点/日期/路径会导致不稳定；渲染时固定小数位、固定日期格式、相对路径。对比前规范化换行。

黄金文件更新要显式 [[--update-golden]]，不能测试失败就自动覆盖。`,
          code: String.raw`from pathlib import Path

def test_report_golden(tmp_path):
    actual = "# 报表\n\n| A | 1.00 |\n"
    golden = Path("tests/golden/report.md")
    assert actual == golden.read_text(encoding="utf-8")`,
          output: `1 passed`,
          tip: `黄金文件对比整体格式；固定小数/日期/路径；更新必须显式，不自动覆盖。`
        },
        {
          h: "CLI 测试：capsys + 退出码",
          p: `[[main(argv)]] 传参数列表，[[capsys]] 捕获 stdout/stderr；断言退出码、关键输出、文件是否生成。

坏输入/缺文件/空数据各一条；成功路径一条。CLI 测试不重复业务细节。

[[tmp_path]] + [[monkeypatch.chdir]] 隔离工作目录，避免相对路径读到项目文件。`,
          code: String.raw`from scores.cli import main

def test_missing_file(tmp_path, capsys):
    rc = main(["import", str(tmp_path / "nope.csv")])
    assert rc != 0
    assert "nope.csv" in capsys.readouterr().err`,
          output: `1 passed`,
          tip: `CLI 测试断言退出码/stderr/文件生成；tmp_path + chdir 隔离相对路径。`
        },
        {
          h: "覆盖率与质量门禁",
          p: `[[pytest --cov=scores --cov-report=term-missing]] 看未覆盖行；目标不是 100%，而是关键分支（错误/边界/空值）都覆盖。

[[ruff]] 管格式/lint，[[mypy]] 管类型；CI 三者都跑。类型提示从公共函数开始，不要一次全仓 strict。

覆盖率下降要在 PR 里解释；不能为了数字写无意义断言。`,
          code: String.raw`# pyproject.toml
# [tool.pytest.ini_options]
# addopts = "--cov=scores --cov-report=term-missing"
# [tool.ruff]
# line-length = 100
# [tool.mypy]
# disallow_untyped_defs = true`,
          output: `TOTAL 92%`,
          tip: `覆盖率看关键分支，不追 100%；ruff/mypy/CI 三条一起跑。`
        },
        {
          h: "动手实验：给项目补 12 个测试",
          p: `至少覆盖：时间三种格式/坏格式、缺列、坏日期、缺队名、重复去重、个人最好、团体总分、并列排名、无数据、CLI 缺文件、报表黄金文件。

验收：[[pytest -q]] 全绿；覆盖率 > 85%；故意改坏一个解析规则，测试能红。`,
          code: String.raw`# 测试清单
# test_parsing.py: 4
# test_cleaning.py: 4
# test_stats.py: 3
# test_cli.py: 2
# test_report.py: 1`,
          output: `14 passed`,
          tip: `覆盖错误/边界/空值；故意改坏规则验证测试会红，才算有效。`
        }
      ],
      points: [
        "单元多、集成少、CLI 精；bug 先写失败测试。",
        "tmp_path/fixture 隔离文件，不污染仓库。",
        "黄金文件对比报表，更新显式。",
        "CLI 测试断言退出码/stderr/文件。",
        "覆盖率看关键分支，ruff/mypy 一起跑。"
      ],
      practice: "给项目补 12–14 个测试覆盖解析/清洗/统计/CLI/报表；跑 pytest+ruff+mypy，故意改坏规则验证测试会红。"
    },
    {
      id: "ch18-6",
      title: "18.6 打包、定时运行与项目复盘",
      minutes: 55,
      lead: "最后一节把项目交付出去：pyproject、wheel、CI、定时任务、告警和复盘。还会讨论如果重做一次，哪些设计会改。",
      source: "综合运用 · Introducing Python 3rd / Beginning Python 4th / Head First Python 3rd",
      sections: [
        {
          h: "pyproject 与入口：一条命令安装",
          p: `[[[project]]] 写 name/version/requires-python/dependencies；[[[project.scripts]]] 暴露 [[scores]] 命令；可选依赖 [[plot]]/[[dev]] 分开。

纯标准库实现时 dependencies 为空；画图才需要 matplotlib。[[python -m build]] 生成 wheel/sdist，[[twine check]] 验证元数据。

安装后在干净 venv 跑 [[scores --help]] 和一次完整导入，确认不依赖源码目录。`,
          code: String.raw`[project]
name = "scores"
version = "0.3.0"
requires-python = ">=3.11"
dependencies = []

[project.optional-dependencies]
plot = ["matplotlib>=3.8"]
dev = ["pytest>=8", "pytest-cov", "ruff", "mypy"]

[project.scripts]
scores = "scores.cli:main"`,
          output: `Successfully built scores-0.3.0-py3-none-any.whl`,
          tip: `标准库实现 dependencies 为空；plot/dev 分开；干净 venv 装 wheel 再跑。`
        },
        {
          h: "CI：测试矩阵 + 构建 + 发布",
          p: `GitHub Actions 在 3.11/3.12/3.13 跑 pytest+ruff+mypy；通过后构建 wheel，tag 时发布。缓存 pip 依赖加速。

CI 要跑真实样例/黄金文件；不要只跑单测。矩阵能发现版本差异（tomllib/类型语法）。

发布 job 用 trusted publishing/secret，最小权限；PR 不发布。`,
          code: String.raw`# .github/workflows/ci.yml
# strategy:
#   matrix:
#     python: ["3.11", "3.12", "3.13"]
# steps:
#   - uses: actions/setup-python@v5
#     with: {python-version: "3.12"}
#   - run: pip install -e ".[dev]"
#   - run: pytest -q
#   - run: ruff check .
#   - run: mypy src`,
          output: `3 jobs passed`,
          tip: `矩阵跑多版本；CI 跑样例/黄金文件；发布 job 最小权限，PR 不发布。`
        },
        {
          h: "定时运行：每周一早上生成报表",
          p: `用 cron/systemd timer 每周一 07:30 跑 [[scores import raw.csv && scores report clean.csv]]；加锁防重叠，日志轮转，失败告警。

输入文件由计时软件导出到固定目录；脚本先检查文件是否存在/是否更新，没更新就跳过并提示。

输出按日期目录保存 [[out/2026-11-24/report.md]]，保留最近 12 周。`,
          code: String.raw`# 30 7 * * 1 /opt/venv/bin/scores import /data/raw.csv --out /data/clean.csv \
#   && /opt/venv/bin/scores report /data/clean.csv --out /out/$(date +\%F)/report.md`,
          output: `cron installed`,
          tip: `周一定时 + 锁 + 日志 + 告警；输入没更新就跳过；输出按日期保留。`
        },
        {
          h: "监控：数量、耗时、失败率",
          p: `每次运行记录：输入行数、成功/失败/去重、报表生成耗时、输出文件大小；写 [[metrics.json]] 或日志。

监控规则：失败率 > 20% 告警；输出 0 行告警；超过 2 周没成功告警；耗时突增 2 倍告警。

告警带 [[run_id]]/日志路径/重放命令；恢复后发恢复通知。`,
          code: String.raw`import json
from datetime import datetime, timezone

metrics = {
    "run_id": "a1b2c3d4",
    "at": datetime.now(timezone.utc).isoformat(),
    "ok": 8, "failed": 2, "duplicates": 1,
    "seconds": 0.42,
}
print(json.dumps(metrics))`,
          output: `{"run_id": "a1b2c3d4", "ok": 8, "failed": 2, "duplicates": 1, "seconds": 0.42}`,
          tip: `记录数量/耗时/失败率；0 行/高失败/长时间无成功都要告警。`
        },
        {
          h: "复盘：哪些设计是对的，哪些会改",
          p: `对的设计：领域模型存秒、统计纯函数、行级错误收集、原子写入、报表数字可核对。这些让测试和排错容易。

会改的设计：如果数据量到百万行，CSV 全量读内存不够，要流式/数据库；如果多赛事并发，唯一键和积分规则要配置化；如果要做 Web，统计层可复用，CLI 换 API。

复盘不是自我表扬；列出「下次不这么做」的具体点。`,
          code: String.raw`# 复盘四问
# 1 哪个 bug 最晚才发现？为什么测试没覆盖？
# 2 哪个模块改得最多？边界是否不清？
# 3 哪个需求最后没用上？范围是否过大？
# 4 如果数据量 ×100，哪里先崩？`,
          output: `4 questions`,
          tip: `复盘写具体「下次不这么做」；数据量/并发/交付形态变化会推翻当前设计。`
        },
        {
          h: "结课：从语法到可交付",
          p: `三本书的知识点在这个项目里连成一条链：类型/容器/函数/类/异常/文件/测试/并发/HTTP/数据/自动化/打包。真正的能力不是记住每个语法，而是「拿到需求能拆、能验证、能交付、能复盘」。

下一步练习：把报表换成 HTML、加一个 FastAPI 查询接口、把 CSV 换成 SQLite、把统计做成可配置规则。每次只改一个维度，保持测试绿。

项目结束不等于学习结束；把这个项目放进作品集，README 写清问题/方案/验证/复盘。`,
          code: String.raw`# 结课检查
# [ ] 干净环境安装 wheel
# [ ] scores --help / import / report 可跑
# [ ] pytest + ruff + mypy 全绿
# [ ] 报表含概览/个人最好/团体/进步/异常
# [ ] 定时任务有锁/日志/告警
# [ ] README 有问题/方案/验证/复盘`,
          output: `6/6 done`,
          tip: `能力是拆需求/验证/交付/复盘；作品集 README 写问题、方案、验证、复盘。`
        }
      ],
      points: [
        "pyproject 入口 + 可选依赖，干净环境验证。",
        "CI 多版本矩阵，跑测试/黄金文件/构建。",
        "定时任务加锁/日志/告警，输入没更新跳过。",
        "监控数量/耗时/失败率，0 行也告警。",
        "复盘写具体改进，不自我表扬。"
      ],
      practice: "把项目打包成 wheel，在干净 venv 安装跑 import/report；配 CI 矩阵与周定时任务；写一页复盘（问题/方案/验证/改进）。"
    }
  ]
});

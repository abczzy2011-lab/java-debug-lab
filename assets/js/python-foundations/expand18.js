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

  add("ch18-1", [{
    h: "工程深化：验收测试要写业务合同，不是函数清单",
    p: `课程项目最后一步不是「功能都写完了」，而是「业务上说得清什么算成功」。验收测试应该从用户可见的行为出发：给一份输入，运行命令，检查输出文件、退出码、日志摘要。它不关心内部调用了哪个函数，只关心结果是否符合约定。

先写一张验收表：场景、输入、期望输出、失败时退出码、必须出现的字段、禁止出现的内容。比如「合法 CSV 导入后，报表包含 3 行，总人数 3，退出码 0」；「缺列 CSV 导入后，退出码 1，错误报告含行号和列名」。每条都能自动执行。

用 subprocess 跑真实 CLI，而不是直接调用函数。[[subprocess.run([sys.executable, "-m", "scores", ...])]] 能覆盖参数解析、环境变量、文件系统、退出码。测试数据放 [[tests/fixtures/]]，每个场景一个目录，输入和期望放在一起，避免测试里写大段字符串。

断言输出文件时，不要只比整个文件字符串。CSV 比较解析后的行/列；JSON 比较结构；HTML 比较关键文本和链接；PDF 比较页数和可提取文字。整文件比对容易因时间戳、路径、排序变化而失败，维护成本高。

验收环境要干净：临时目录、固定时区、固定 locale、固定随机种子。不要依赖开发机的 [[~/.scores]] 配置；用 [[env={...}]] 和 [[cwd=tmp_path]] 隔离。测试结束后删除临时目录，失败时保留并打印路径。

失败信息要可诊断：命令、退出码、stdout/stderr 最后 N 行、输出文件路径、期望 vs 实际。不要只写 [[assert result == 0]]，失败时不知道哪一步错。把「怎么复现」写进断言消息。

验收：每个业务场景一条测试；真实 CLI 执行；输出解析后比较；环境隔离；失败信息可复现。`,
    code: String.raw`import json, subprocess, sys
from pathlib import Path

def run_cli(tmp_path: Path, *args):
    return subprocess.run(
        [sys.executable, "-m", "scores", *args],
        cwd=tmp_path, capture_output=True, text=True,
        env={"PATH": "/usr/bin:/bin", "HOME": str(tmp_path), "LANG": "C.UTF-8"},
        timeout=30,
    )

def test_import_ok(tmp_path):
    (tmp_path / "in.csv").write_text("athlete,seconds\n林晓,12.34\n", encoding="utf-8")
    r = run_cli(tmp_path, "import", "in.csv", "--out", "out.json")
    assert r.returncode == 0, r.stderr
    data = json.loads((tmp_path / "out.json").read_text(encoding="utf-8"))
    assert len(data) == 1 and data[0]["athlete"] == "林晓"`,
    output: `# pytest -q
# 1 passed`,
    tip: `验收从业务场景出发；subprocess 跑真实 CLI；解析后比较；临时目录隔离；失败带复现信息。`
  }]);

  add("ch18-2", [{
    h: "工程深化：脏数据清洗、错误报告与可重跑",
    p: `真实成绩表里常见问题：姓名前后空格、项目名简写、时间格式混用、重复报名、空行、全角数字、Excel 把 [[12.34]] 存成日期。清洗不是「全部转成字符串再 trim」，而是按列定义规则，逐条记录改了什么。

姓名列：去首尾空格、全角转半角、合并连续空格；不要擅自改错别字，保留原始值。项目列：建立映射表，[[100米]]/[[100m]]/[[百米]] 统一成 [[100m]]；映射不中的值进「未知项目」错误列表，不要静默丢弃。

时间列：支持 [[12.34]]、[[12.3s]]、[[0:12.34]]、[[1:02.35]] 几种格式，用一个解析函数统一转秒。解析失败带原值、行号、期望格式。不要用 [[float]] 直接转，[[1:02.35]] 会失败，[[12,34]] 会变成 1234。

重复记录：按「姓名 + 项目 + 日期」判重，保留最新一条或标记冲突，让业务确认。不要按整行判重，备注不同也会被当成不同记录。重复处理要有报告，说明保留哪条、丢弃哪条。

空行/缺列：CSV 中间的空行可以跳过并计数；整行全空才算空行。缺列要 fail-fast，因为后续所有行都可能错位。列数多于表头时，多出的值进错误报告，不要静默截断。

清洗后的数据要写「清洗日志」：总行数、修改数、跳过数、错误数、每条修改的原值/新值/规则。日志和输出文件放同一目录，文件名带批次号。重跑时先删旧输出或覆盖同一批，避免叠加。

验收：每种脏数据都有用例；错误带行号/列名/原值；重复处理有报告；清洗日志可追溯；重复跑结果一致。`,
    code: String.raw`import re, unicodedata

def clean_name(value: str) -> str:
    text = unicodedata.normalize("NFKC", value)
    return re.sub(r"\s+", " ", text).strip()

def parse_time(value: str) -> float:
    text = clean_name(value).lower().replace("s", "")
    if ":" in text:
        minute, rest = text.split(":", 1)
        return int(minute) * 60 + float(rest)
    return float(text)

print(clean_name(" 林　晓 "))

changes = []
raw = " 林　晓 "
cleaned = clean_name(raw)
if cleaned != raw:
    changes.append({"raw": raw, "clean": cleaned, "rule": "nfkc+space"})
print(changes)`,
    output: `林 晓
[{'raw': ' 林　晓 ', 'clean': '林 晓', 'rule': 'nfkc+space'}]`,
    tip: `按列定义清洗规则；时间多格式统一；重复按业务键；错误带行号原值；清洗日志可追溯。`
  }]);

  add("ch18-3", [{
    h: "工程深化：排名、并列、积分与进度计算",
    p: `排名不是简单 [[sorted]] 后加序号。并列要同名次，下一名跳号：1、1、3，不是 1、1、2。实现时先排序，再比较当前成绩与上一名，相同则同名次，不同则名次等于当前位置索引 + 1。

积分制要先定规则：名次分（第一 10 分、第二 8 分……）、达标分、破纪录加分。规则写成配置/常量，不要散在代码里。每个运动员的总分要能追溯到每场比赛的每项得分，报表里给明细。

缺赛和弃权要区分。缺赛可能记 0 分，弃权可能记 -1 或取消资格；不同项目规则不同。用枚举表示状态，不要用魔法字符串。统计时明确是否排除，报表里标注原因。

进度计算要防除零。完成率 = 已完成 / 总数，总数为 0 时返回 0 或 None，不要抛 ZeroDivisionError。进度条/百分比要四舍五入一致，避免 99.5% 显示成 100% 但仍有未完成项。

多轮比赛的总分要按轮次权重。权重配置化，变更时版本号一起改；历史成绩用当时权重，不要用新规则重算旧比赛。报表里注明规则版本。

验收：并列名次正确；下一名跳号；积分明细可追溯；缺赛/弃权可区分；总数为 0 不崩；规则版本可追溯。`,
    code: String.raw`def rank(rows):
    ordered = sorted(rows, key=lambda r: r["seconds"])
    out = []
    last_seconds = None
    last_rank = 0
    for index, row in enumerate(ordered, start=1):
        if row["seconds"] != last_seconds:
            last_rank = index
            last_seconds = row["seconds"]
        out.append({**row, "rank": last_rank})
    return out

rows = [{"name": "A", "seconds": 12.3}, {"name": "B", "seconds": 12.3},
        {"name": "C", "seconds": 12.5}]
print([(r["name"], r["rank"]) for r in rank(rows)])`,
    output: `[('A', 1), ('B', 1), ('C', 3)]`,
    tip: `并列同名次、下一名跳号；积分规则配置化；缺赛/弃权用枚举；除零保护；规则带版本。`
  }]);

  add("ch18-4", [{
    h: "工程深化：报表模板、打印样式与可访问性",
    p: `最终报表通常既要屏幕看，也要打印/转 PDF。HTML 模板要同时满足两者：屏幕用响应式布局，打印用 [[@media print]] 隐藏导航、固定分页、避免表格跨页断行。不要为打印单独维护一份 HTML，样式分叉很快。

表格是报表的核心。数字右对齐、文本左对齐、表头加粗、单位写在表头（秒、米、分）。长表格用 [[thead]] 重复表头，[[tr]] 设置 [[break-inside: avoid]]，避免一行被切成两半。列太多时，屏幕上横向滚动，打印时缩放到一页或分页。

颜色不要作为唯一信息。名次用数字、奖牌用文字/图标+颜色；色盲用户也能读。对比度至少 4.5:1，深色文字配浅色底。打印默认黑白也能看懂，不要依赖浅灰背景区分。

页眉页脚放关键信息：报表名、日期、数据版本、页码。页脚放来源和生成命令。打印时 URL 不要出现在页脚（浏览器默认会加），用 [[@page]] 的 margin box 控制。

可访问性：图片有 [[alt]]，表格有 [[caption]]，按钮有可读文本，表单有 label。不要用 [[div]] 模拟表格。键盘能操作筛选和导出；焦点可见。报表是给人看的，不是只给截图。

验收：屏幕 1440/390 可读；打印预览无截断；表头重复；颜色可区分；键盘可操作；PDF 文字可提取。`,
    code: String.raw`<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>成绩报表</title>
<style>
@media print {
  nav, .no-print { display: none; }
  table { page-break-inside: auto; }
  tr { break-inside: avoid; }
  thead { display: table-header-group; }
}
table { border-collapse: collapse; width: 100%; }
th, td { border-bottom: 1px solid #ddd; padding: 8px; }
td.num { text-align: right; font-variant-numeric: tabular-nums; }
</style>
</head>
<body>
<h1>成绩报表</h1>
<table>
<caption>2026 年 11 月 25 日，共 3 人</caption>
<thead><tr><th>姓名</th><th>项目</th><th>成绩（秒）</th></tr></thead>
<tbody>
<tr><td>林晓</td><td>100m</td><td class="num">12.34</td></tr>
</tbody>
</table>
</body>
</html>`,
    output: `# 屏幕可读；打印时导航隐藏、表头重复、
# 行不被截断；PDF 可提取文字。`,
    tip: `一套 HTML 兼顾屏幕/打印；数字右对齐；别只靠颜色；页眉页脚带版本；可访问性。`
  }]);

  add("ch18-5", [{
    h: "工程深化：golden 文件与 CLI 回归测试",
    p: `golden 文件是「已知正确的输出样本」，用来发现意外变化。适合格式稳定的报表、JSON 结构、CLI 帮助文本。测试时把当前输出与 golden 比较，不一致就失败，让人确认是「预期变更」还是「回归」。

golden 不要存整个大文件。只存关键片段：表头、前几行、统计摘要、错误信息。大文件一旦变化，diff 几千行没人看。结构化输出先规范化：排序键、固定缩进、去掉时间戳/路径/随机 id，再比较。

更新 golden 要有明确命令，例如 [[pytest --update-golden]]，并且更新后的 diff 必须进 code review。不要让测试自动覆盖 golden，否则回归会被静默接受。更新时在 PR 里说明「为什么输出变了」。

CLI 回归要覆盖：[[--help]]、缺参数、非法参数、正常最小用例、错误用例、[[--json]] 输出可解析。帮助文本变化会影响用户脚本，应该被审查；退出码变化会破坏 CI，必须测试。

环境差异会让 golden 不稳定：路径、换行、locale、时区、Python 版本。输出前统一：相对路径、[[\n]] 换行、UTC 或固定时区、[[PYTHONHASHSEED=0]]。不要把开发机绝对路径写进 golden。

验收：golden 只含关键片段；比较前规范化；更新有命令和 review；CLI 主要路径覆盖；跨平台稳定。`,
    code: String.raw`# tests/test_golden.py
from pathlib import Path
import json

GOLDEN = Path("tests/golden/report.json")

def normalize(data):
    return {
        "count": data["count"],
        "top": sorted(data["top"], key=lambda r: r["name"]),
        "version": data["version"],
    }

def test_report_matches_golden(tmp_path):
    out = tmp_path / "report.json"
    run_report(out)
    actual = normalize(json.loads(out.read_text(encoding="utf-8")))
    expected = json.loads(GOLDEN.read_text(encoding="utf-8"))
    assert actual == expected`,
    output: `# 输出变化时 diff 只显示关键字段；
# 更新 golden：pytest --update-golden，并 review diff`,
    tip: `golden 只存关键片段；规范化路径/时间/排序；更新需显式命令和 review；CLI 路径覆盖。`
  }]);

  add("ch18-6", [{
    h: "工程深化：从本地脚本到可交付项目的最后一公里",
    p: `项目能跑之后，最后一公里是「别人能装、能跑、能维护」。至少要有一份 README：项目做什么、安装命令、最小示例、配置项、常见错误、测试命令。不要假设读者知道你的目录结构。

打包按第 13 章做：src 布局、pyproject、wheel、可选依赖、py.typed。CLI 入口用 [[project.scripts]]，同时支持 [[python -m scores]]。版本号一处定义，变更日志记录公开变化。

CI 至少跑四件事：安装依赖、lint/format、类型检查、测试。再加一个「安装 wheel 后跑 smoke test」的 job，防止只在源码目录能跑。矩阵覆盖目标 Python 版本和操作系统；macOS/Windows 的路径、编码、进程行为差异很大。

定时任务/部署要有回滚。发布前打 tag、保存 wheel、记录配置；部署后跑健康检查；失败时回滚到上一版。不要直接在生产目录改代码，下一次部署会覆盖。配置和密钥走环境变量/密钥管理，不写进仓库。

文档记录「怎么恢复」：数据库备份在哪、如何重跑失败批次、如何回滚版本、联系人是谁。没有恢复方案的系统，不能算交付。定期演练一次恢复流程。

验收：干净机器按 README 能装能跑；CI 全绿；wheel 安装后 smoke 通过；版本/tag/变更日志一致；回滚步骤可执行。`,
    code: String.raw`# README 最小结构
# 1. 项目简介（一句话）
# 2. 安装：python -m venv .venv && pip install .
# 3. 快速开始：scores show --json
# 4. 配置：SCORES_DB_URL、SCORES_TIMEOUT
# 5. 测试：pytest
# 6. 常见错误：缺列、编码、权限
# 7. 发布/回滚：tag、wheel、上一版

# CI 最小步骤
# - pip install -e ".[dev]"
# - ruff check .
# - mypy src
# - pytest
# - python -m build && pip install dist/*.whl
# - python -m scores --help`,
    output: `# 干净机器：README 步骤可复制执行；
# CI：lint + 类型 + 测试 + wheel smoke 全绿。`,
    tip: `README 含安装/示例/配置/错误/测试；CI 加 wheel smoke；发布打 tag 留产物；写回滚手册。`
  }]);
})();

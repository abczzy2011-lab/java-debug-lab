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

  add("ch12-3", [{
    h: "综合项目：类型化 CLI 与三层测试矩阵",
    p: `项目目标：给一个已有成绩工具加上完整类型和测试，让它从「本机能跑」变成「CI 能守」。范围包括公开 API 注解、mypy strict、pytest 单元/集成/属性测试、覆盖率与变异测试。不是重写业务，而是给现有代码加护栏。

第一步清点公开 API。列出 [[__init__.py]] 导出的名字、CLI 命令、JSON 输出字段。每个公开函数都要有参数和返回值注解；[[Any]] 只允许出现在真正动态的边界（如 JSON 原始数据），并集中在一个 [[_json.py]] 适配层，领域层不允许 Any。

第二步定义类型。[[Row]] 用 TypedDict 描述 CSV 行；[[Result]] 用 frozen dataclass；[[Repo]] 用 Protocol；[[load(path: str | Path) -> list[Result]]] 用联合类型。需要重载时用 [[@overload]]，但不要为两三种参数组合写十几个重载，宁愿拆函数。

第三步开 mypy。先 [[disallow_untyped_defs]]，再 [[strict]]。每次只修一类错误：缺注解、Optional、泛型参数、重载实现、未使用 ignore。[[# type: ignore]] 必须带原因和 issue 编号；CI 统计 ignore 数量，只降不升。

第四步单元测试。每个纯函数覆盖正常、边界、非法输入；用 [[pytest.mark.parametrize]] 把边界列成表；用 [[pytest.approx]] 比较浮点；用 [[tmp_path]] 隔离文件。不要 mock 纯函数，直接给输入。

第五步集成测试。用 [[subprocess]] 跑真实 CLI，覆盖 [[--help]]、正常导入、缺列、空文件、[[--json]]。断言退出码、stdout 可解析、输出文件存在且内容正确。测试数据放 fixtures，每个场景一个目录。

第六步属性测试。对「解析-格式化」往返、"排序后长度不变"、"排名并列不跳错"写 Hypothesis 不变量。属性测试负责发现随机边界，单元测试负责固定回归；两者不能互相替代。

第七步覆盖率与变异。先看分支覆盖，核心模块要求 85% 以上；再对排名、解析、金额计算跑变异测试。存活变异说明断言不够，补行为测试，不要补「调用次数」这种实现镜像。

第八步 CI。矩阵覆盖 3.11/3.12/3.13 和 ubuntu/macos；步骤：安装、ruff、mypy、pytest、build、wheel smoke。任何一步失败都阻止合并。把 CI 命令写进 README，本地能复现。

验收：mypy 0 错误；ignore 数量有上限；测试覆盖正常/边界/非法；CLI 退出码正确；属性测试跑过 100 组；变异测试核心模块无存活；CI 全绿；README 命令可复制。`,
    code: String.raw`from typing import TypedDict, Protocol
from pathlib import Path
import pytest

class Row(TypedDict):
    athlete: str
    seconds: float

class Repo(Protocol):
    def save(self, row: Row) -> None: ...

def load(path: str | Path) -> list[Row]:
    raise NotImplementedError

@pytest.mark.parametrize("text,expected", [
    ("12.34", 12.34),
    ("0:12.34", 12.34),
    ("1:02.35", 62.35),
])
def test_parse(text: str, expected: float) -> None:
    assert parse_time(text) == pytest.approx(expected)

def test_rejects_negative() -> None:
    with pytest.raises(ValueError):
        parse_time("-1.0")`,
    output: `# mypy src -> Success: no issues found
# pytest -q -> 12 passed
# coverage report -m -> core 88%
# mutmut run -> 0 surviving in core`,
    tip: `Any 只在适配层；strict 分步开；单元/集成/属性三层；变异测试验断言；CI 矩阵守版本。`
  }]);

  add("ch13-3", [{
    h: "综合项目：把 scores-kit 发布到 TestPyPI 再上正式版",
    p: `项目目标：把第 8 章的包真正发布一次。范围包括版本号、构建、README 元数据、TestPyPI 安装验证、正式 PyPI 发布、CI 自动发布、发布后回滚预案。重点不是「传上去」，而是「用户能装、能升级、出问题能退」。

第一步定版本。[[pyproject.toml]] 写 [[version = "0.1.0"]]，代码里用 [[importlib.metadata.version("scores-kit")]]，不要手写两份。git tag 用 [[v0.1.0]]，和版本号一致；项目不是 git 仓库时，至少保留构建记录和 wheel 哈希。

第二步补元数据。[[description]]、[[readme = "README.md"]]、[[license]]、[[authors]]、[[classifiers]]、[[project.urls]] 都要填。README 开头写清楚包做什么、安装命令、最小示例；[[twine check]] 会检查 README 渲染，格式错误会失败。

第三步构建。[[python -m build]] 生成 sdist 和 wheel；解压 wheel 确认 [[scores/data/report.md]]、[[scores/py.typed]] 都在；在干净 venv 安装 wheel，跑 [[scores --help]] 和读取模板。不要在开发环境直接 [[pip install -e .]] 验证发布包。

第四步 TestPyPI。[[twine upload --repository testpypi dist/*]]；在全新 venv 用 [[--index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple]] 安装。TestPyPI 依赖不全，必须加正式索引；安装后跑最小功能，确认包名、版本、入口都对。

第五步正式发布。确认 TestPyPI 通过后，[[twine upload dist/*]]。发布后立刻在另一个干净 venv 从正式 PyPI 安装，跑 [[scores --version]] 和 [[scores rank]]。不要只看上传成功；镜像同步、缓存、依赖解析都可能让用户装不上。

第六步自动发布。GitHub Actions 配 [[id-token: write]]，用 [[pypa/gh-action-pypi-publish]] 信任发布；只在 tag 推送时触发。构建和发布分离：build job 产出 artifact，publish job 下载 artifact 再上传，避免重复构建出不同哈希。

第七步回滚预案。PyPI 不能覆盖版本；出问题发 [[0.1.1]] 修复，或在 PyPI 页面 yank [[0.1.0]]。yank 后精确版本仍可安装，但新解析会跳过；变更日志写清原因和替代版本。保留 wheel、构建日志、依赖锁，方便复现。

第八步发布后监控。安装量、错误报告、GitHub issue 都是信号；第一时间复现用户的最小案例。不要等「大量用户反馈」才行动，一个可复现的安装失败就值得发补丁。

验收：twine check 通过；TestPyPI 安装成功；正式 PyPI 安装成功；版本/tag/wheel 哈希一致；CI 自动发布只在 tag 触发；yank/补丁流程写进 README；发布后 smoke 通过。`,
    code: String.raw`# 构建与检查
python -m build
twine check dist/*
unzip -l dist/scores_kit-0.1.0-py3-none-any.whl

# TestPyPI
twine upload --repository testpypi dist/*
python -m venv /tmp/tp
/tmp/tp/bin/pip install --index-url https://test.pypi.org/simple/ \
  --extra-index-url https://pypi.org/simple scores-kit==0.1.0

# 正式
twine upload dist/*
python -m venv /tmp/prod
/tmp/prod/bin/pip install scores-kit==0.1.0
/tmp/prod/bin/scores --version

# GitHub Actions 信任发布
# permissions: { id-token: write }
# on: { push: { tags: ["v*"] } }
# uses: pypa/gh-action-pypi-publish@release/v1`,
    output: `# twine check: PASSED
# TestPyPI: scores-kit 0.1.0 installed
# PyPI: scores-kit 0.1.0 installed
# scores --version -> scores-kit 0.1.0`,
    tip: `版本一处定义；元数据齐全；先 TestPyPI 再正式；tag 触发信任发布；发布后 smoke；yank/补丁预案。`
  }]);

  add("ch14-3", [{
    h: "综合项目：可恢复、守规则的赛事数据采集器",
    p: `项目目标：从一个公开赛事页面抓取成绩，支持分页/游标、限速、断点续跑、HTML 解析、数据校验、错误隔离。要求不绕过登录/验证码，不违反 robots，不因一次页面改版丢掉全部数据。这个项目把第 14 章的请求、分页、解析、浏览器自动化串起来。

第一步确认数据来源。打开浏览器开发者工具，看 Network：如果数据来自 XHR/fetch，直接请求接口；如果页面是服务端渲染，解析 HTML；只有必须执行 JS 才用 Playwright。优先简单方案，浏览器自动化是最后手段。

第二步定抓取合同。每条记录至少 [[source, event, date, athlete, team, seconds, rank]]；主键用 [[source + event + date + athlete]]。字段缺失进错误列表，不要用空字符串糊弄。抓取前先抓 1 页，人工核对字段，再全量跑。

第三步做分页/游标。接口用 cursor 就跟随 [[next_cursor]]；用页码就记录 [[page]] 和 [[page_size]]。状态文件存最后成功游标、已处理主键、错误计数；每页处理完原子写状态。不要把所有 id 塞进内存，超过 10 万用 SQLite 唯一索引。

第四步做限速与重试。每页之间 sleep 0.3-1 秒；429 读 [[Retry-After]]；5xx 重试 3 次，4xx 不重试；超时设 [[(3.05, 15)]]。请求带合理 UA 和联系邮箱，不要伪装成浏览器高频刷。

第五步做解析。选择器集中放在 [[selectors.py]]，优先 data 属性/语义标签；解析后做 NFKC、去空白、时间格式统一。表格先打印 shape 和表头，确认选对表；合并单元格用行列坐标兜底。

第六步做校验。抓完统计：总条数、空值率、重复率、时间范围、排名连续性。异常值不直接删，标记 [[needs_review]] 并输出到单独文件。每次抓取生成 [[summary.json]]，和原始数据一起归档。

第七步做测试。保存 3 份 HTML fixture：正常页、缺字段页、改版页；测试解析器的正常/缺字段/异常输入。请求层用 mock，不要测试里打真实网络。分页逻辑用假 [[fetch_page]] 测断点/结束条件。

第八步做合规。检查 robots.txt 的 [[can_fetch]]，遵守服务条款；不抓登录后私人数据；不绕过验证码；不高频请求。遇到 403/验证码，停止并记录，不要换 IP 硬闯。

验收：单页解析正确；分页不漏不重；中途 kill 能续；429 能等；改版页有清楚错误；数据校验有报告；robots 禁止时停止；测试不打真实网络。`,
    code: String.raw`from pathlib import Path
import json, time, requests
from bs4 import BeautifulSoup

STATE = Path("crawl-state.json")
BASE = "https://example.com/events"

def load_state():
    return json.loads(STATE.read_text()) if STATE.exists() else {"page": 1, "seen": []}

def save_state(state):
    tmp = STATE.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, ensure_ascii=False))
    tmp.replace(STATE)

def parse_page(html: str, event: str, date: str) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    rows = []
    for tr in soup.select("table.results tbody tr"):
        cells = [td.get_text(" ", strip=True) for td in tr.select("td")]
        if len(cells) < 5:
            continue
        rows.append({"source": BASE, "event": event, "date": date,
                     "athlete": cells[0], "team": cells[1],
                     "seconds": parse_time(cells[2]), "rank": int(cells[3])})
    return rows

def crawl(event: str, date: str):
    state = load_state()
    seen = set(state["seen"])
    session = requests.Session()
    session.headers["User-Agent"] = "scores-research/0.1 (contact: you@example.com)"
    while True:
        r = session.get(f"{BASE}/{event}", params={"date": date, "page": state["page"]},
                        timeout=(3.05, 15))
        if r.status_code == 429:
            time.sleep(int(r.headers.get("Retry-After", "5")))
            continue
        r.raise_for_status()
        for row in parse_page(r.text, event, date):
            key = f"{row['event']}|{row['date']}|{row['athlete']}"
            if key not in seen:
                save_row(row)
                seen.add(key)
        state.update(page=state["page"] + 1, seen=list(seen))
        save_state(state)
        if "next" not in r.text:
            break
        time.sleep(0.8)`,
    output: `# crawl-state.json: {"page": 4, "seen": [...]}
# summary.json: {"total": 320, "ok": 318, "needs_review": 2}
# 429: 按 Retry-After 等待后继续`,
    tip: `先确认数据来源；主键稳定；状态原子写；429 等待；选择器集中；fixture 测试；遵守 robots。`
  }]);

  add("ch15-3", [{
    h: "综合项目：从原始 CSV 到可追溯的 HTML 分析报告",
    p: `项目目标：输入一份成绩 CSV，输出一份带统计、图表、明细和元数据的 HTML 报告；同一份输入重复生成结果一致；数据有问题时报告要标注，而不是假装正常。范围覆盖 pandas 清洗、merge 校验、时间序列、matplotlib、Jinja2。

第一步读数据。用 [[pd.read_csv(encoding="utf-8-sig")]]，检查 shape、列名、dtype、空值率。日期用 [[pd.to_datetime]]，秒数用 [[pd.to_numeric]]，非法值转 NaN 并计数。不要一上来 [[fillna(0)]]，先弄清缺失含义。

第二步清洗与验证。姓名 trim/NFKC；项目映射到标准 code；重复按业务键处理；缺列 fail-fast。每一步调用 [[audit(df, step)]] 打印行数、空值、唯一键。清洗规则写成函数，独立测试。

第三步统计。按项目分组算人数、最好成绩、平均、中位数；按队伍算总分；按日期算趋势。并列名次用第 18 章的逻辑，不要简单 [[rank(method="min")]] 后不再检查。所有统计结果保留原始明细，报告里能下钻。

第四步图表。只画 2-3 张关键图：项目成绩分布、队伍总分、日期趋势。柱状图 y 从 0 开始；折线图标注样本量；颜色可区分且不只靠颜色。图片用 [[fig.savefig]] 导出，固定 [[dpi=160]]，[[bbox_inches="tight"]]。

第五步模板。Jinja2 模板分三块：摘要（总人数、项目数、异常数）、图表、明细表。表格数字右对齐，表头带单位；页面顶部写数据区间、生成时间、数据哈希；页脚写来源和生成命令。

第六步缓存与幂等。缓存键 = 输入哈希 + 模板版本 + 参数；命中且未 [[--force]] 就复用。生成先写临时目录，成功后原子替换；失败保留中间 CSV/图，方便排查。重复生成同一输入，报告哈希应一致（除生成时间外）。

第七步测试。用最小 fixture 测：正常数据、缺列、空值、重复、极端值；断言统计数字、图表文件存在、报告含关键文本、页脚含哈希。不要只断言「文件存在」。

第八步交付。输出目录含 [[report.html]]、[[assets/]]、[[summary.json]]、[[clean.csv]]；打包 zip 命名带日期和哈希；大文件不放邮件附件，给下载链接。README 写清运行命令和依赖。

验收：报告能在浏览器打开；统计与明细一致；图表不误导；缺失/异常有标注；重复生成稳定；测试覆盖正常/边界/错误；交付包可追溯。`,
    code: String.raw`from pathlib import Path
import pandas as pd, matplotlib.pyplot as plt
from jinja2 import Environment, FileSystemLoader

def build(df: pd.DataFrame, out: Path) -> dict:
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["seconds"] = pd.to_numeric(df["seconds"], errors="coerce")
    invalid = int(df["seconds"].isna().sum())
    clean = df.dropna(subset=["date", "athlete", "seconds"]).copy()

    summary = {
        "rows": len(df), "clean": len(clean), "invalid": invalid,
        "events": int(clean["event"].nunique()),
        "athletes": int(clean["athlete"].nunique()),
        "best": float(clean["seconds"].min()),
    }

    fig, ax = plt.subplots(figsize=(8, 4.5))
    clean.boxplot(column="seconds", by="event", ax=ax)
    ax.set_ylabel("成绩（秒）")
    fig.tight_layout()
    fig.savefig(out / "assets" / "events.png", dpi=160)
    plt.close(fig)

    env = Environment(loader=FileSystemLoader("templates"), autoescape=True)
    html = env.get_template("report.html").render(
        summary=summary, rows=clean.to_dict("records"), image="assets/events.png")
    (out / "report.html").write_text(html, encoding="utf-8")
    return summary`,
    output: `# out/report.html
# out/assets/events.png
# out/summary.json
# {"rows": 120, "clean": 118, "invalid": 2, "events": 4, "athletes": 36, "best": 11.8}`,
    tip: `先审计再清洗；统计保留明细；图表 2-3 张且诚实；模板带元数据；缓存键含哈希；fixture 测试。`
  }]);
})();

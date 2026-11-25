window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch13",
  part: 3,
  number: "13",
  title: "项目结构、依赖与发布",
  summary: "从「一个脚本」到「能装、能跑、能发布」的项目：src 布局、pyproject、命令行入口、版本号、构建产物和 CI。这一章的重点是可复现，不是把目录摆好看。",
  goals: [
    "能设计 src 布局、pyproject 和测试目录",
    "能用 argparse 写带子命令和退出码的 CLI",
    "能构建 wheel/sdist 并在干净环境安装验证",
    "能管理版本号、依赖和发布流程"
  ],
  lessons: [
    {
      id: "ch13-1",
      title: "13.1 src 布局、pyproject 与项目元数据",
      minutes: 45,
      lead: "项目结构决定导入、测试、打包和部署的边界。这一节从一个最小可安装项目开始，解释 src 布局为什么能防止「本地能导入、安装后不能」。",
      source: "Introducing Python 3rd · Ch.13；Beginning Python 4th · Ch.18",
      sections: [
        {
          h: "为什么推荐 src 布局",
          p: `如果包目录就在项目根（[[scores/]]），在根目录运行 Python 时，当前目录会进入 [[sys.path]]，[[import scores]] 直接导入源码目录。这看起来方便，但会掩盖「安装后是否包含这个文件」的问题：源码目录里能导入，打包后可能漏文件。

src 布局把包放到 [[src/scores/]]，项目根不再直接包含包。运行时要么 [[pip install -e .]]，要么设置 [[PYTHONPATH=src]]。这样测试的是「安装后的包」，而不是「碰巧在 cwd 的源码」。

代价是多一层目录、需要 editable 安装。对库/CLI/要发布的包值得；一次性脚本不必。`,
          code: String.raw`# 推荐结构
# project/
#   pyproject.toml
#   README.md
#   src/scores/__init__.py
#   src/scores/core.py
#   tests/test_core.py
#
# 安装
# python -m pip install -e ".[dev]"
# python -m pytest`,
          output: `Successfully installed scores-0.1.0`,
          tip: `src 布局让测试针对「安装后的包」；根目录直接放包会掩盖漏打包问题。`
        },
        {
          h: "pyproject.toml：一个文件说清项目",
          p: `[[[project]]] 写 name/version/description/readme/requires-python/dependencies；[[[build-system]]] 指定构建后端；[[[project.optional-dependencies]]] 分组开发依赖；[[[project.scripts]]] 定义命令行入口。

name 是分发名（pip install 用的），导入名可以和它不同（[[Pillow]] vs [[PIL]]）。version 可以手写，也可以用 [[dynamic]] 从包属性/SCM 读取；手写最简单，发布前要改。

readme 指向 README.md；license 用 SPDX 表达式；authors/maintainers 是元数据，不影响运行。不要把所有字段都填满，必需字段先对。`,
          code: String.raw`[project]
name = "scores"
version = "0.1.0"
description = "游泳成绩清洗与报表"
readme = "README.md"
requires-python = ">=3.11"
dependencies = ["requests>=2.28,<3"]

[project.optional-dependencies]
dev = ["pytest>=8", "mypy>=1.13", "ruff>=0.8"]

[project.scripts]
scores = "scores.cli:main"

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"`,
          output: `$ python -m build
Successfully built scores-0.1.0.tar.gz and scores-0.1.0-py3-none-any.whl`,
          tip: `分发名和导入名可以不同；[[[project.scripts]]] 的值是 [["模块:函数"]]，函数不接受参数。`
        },
        {
          h: "包发现：setuptools 怎么知道打包哪些文件",
          p: `setuptools 默认会自动发现 [[src/]] 下的包，但多目录/命名空间包需要显式配置 [[[tool.setuptools.packages.find]]]。漏包是发布后 [[ModuleNotFoundError]] 的最常见原因。

非 Python 文件（模板、CSV、图标）不会自动进 wheel，需要 [[package-data]] 或 [[include-package-data]] + MANIFEST.in。更现代的方式是用 [[importlib.resources]] 读资源，并确保它们被声明为包数据。

构建后一定要检查 wheel 内容：[[unzip -l dist/*.whl]] 看文件列表；在干净 venv 安装后跑一次入口命令。`,
          code: String.raw`[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
scores = ["data/*.csv", "templates/*.html"]

# 检查 wheel
# unzip -l dist/scores-0.1.0-py3-none-any.whl`,
          output: `scores/data/sample.csv
scores/templates/report.html`,
          tip: `非 .py 资源要显式声明 package-data；构建后 [[unzip -l]] 检查，别等安装后才发现漏文件。`
        },
        {
          h: "README、LICENSE 与 .gitignore",
          p: `README 至少写：项目是什么、怎么安装、怎么运行、怎么测试、依赖什么版本。不要只写「运行 main.py」。发布到 PyPI 时 README 会显示在项目页，格式用 Markdown。

LICENSE 决定别人能怎么用。没有 license 不等于「随便用」；公司项目要按组织规范选。[[pyproject]] 的 license 字段用 SPDX 标识，和 LICENSE 文件保持一致。

.gitignore 要排除 [[.venv/]]、[[__pycache__/]]、[[*.egg-info/]]、[[dist/]]、[[.pytest_cache/]]、[[.env]]、本地数据库。不要把锁文件/测试数据误排除。`,
          code: String.raw`# .gitignore
.venv/
__pycache__/
*.py[cod]
*.egg-info/
dist/
build/
.pytest_cache/
.mypy_cache/
.env
*.db`,
          output: `git status --short
?? pyproject.toml
?? README.md
?? src/
?? tests/`,
          tip: `.gitignore 排除环境/构建产物/密钥；锁文件和测试 fixture 要提交。`
        },
        {
          h: "开发依赖与工具配置放哪",
          p: `pytest、ruff、mypy 属于开发依赖，不应进运行时 dependencies；放 [[[project.optional-dependencies].dev]]，安装 [[.[dev]]]。这样生产环境不会装测试工具。

工具配置也放 [[pyproject.toml]]：[[[tool.pytest.ini_options]]]、[[[tool.ruff]]]、[[[tool.mypy]]]。集中配置比散落的 [[setup.cfg]]/[[tox.ini]] 更容易发现。

不是所有工具都支持 pyproject；旧工具可能要单独配置文件。先查文档，别假设。`,
          code: String.raw`[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-q"

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.mypy]
python_version = "3.11"
disallow_untyped_defs = true`,
          output: `$ python -m pytest
3 passed in 0.04s`,
          tip: `开发工具放 dev 可选依赖；工具配置集中到 pyproject，CI 和本地用同一份。`
        },
        {
          h: "动手实验：从零搭一个可安装项目",
          p: `创建 [[src/scores/]]、[[tests/]]、[[pyproject.toml]]、README；实现 [[scores.core.average]] 和 [[scores.cli.main]]。在干净 venv 中 [[pip install -e ".[dev]"]]，跑 [[pytest]]、[[mypy]]、[[scores --help]]。

然后 [[python -m build]]，在另一个干净 venv 安装 wheel，确认不依赖源码目录也能运行。`,
          code: String.raw`# src/scores/core.py
def average(scores: list[float]) -> float:
    if not scores:
        raise ValueError("scores 不能为空")
    return sum(scores) / len(scores)

# src/scores/cli.py
import argparse
from .core import average

def main():
    p = argparse.ArgumentParser()
    p.add_argument("scores", nargs="+", type=float)
    args = p.parse_args()
    print(f"{average(args.scores):.1f}")`,
          output: `$ scores 91 88.5
89.8`,
          tip: `在干净环境安装 wheel 再跑入口，才能证明包是自包含的。`
        }
      ],
      points: [
        "src 布局让测试针对安装后的包，暴露漏打包问题。",
        "pyproject 写元数据/依赖/可选依赖/入口，构建后端单独声明。",
        "非 py 资源要 package-data，构建后 unzip -l 检查。",
        "开发工具进 dev 可选依赖，配置集中 pyproject。",
        "发布前在干净 venv 安装 wheel 验证。"
      ],
      practice: "从零搭 `src/scores` 项目：pyproject 配 `scores` 命令、dev 依赖、pytest/ruff/mypy 配置；构建 wheel 后在干净 venv 安装并运行。"
    },
    {
      id: "ch13-2",
      title: "13.2 命令行入口、argparse 与退出码",
      minutes: 45,
      lead: "CLI 是项目的门面：参数怎么解析、错误怎么提示、退出码是什么，决定它能不能被脚本/CI 使用。这一节用 argparse 写一个带子命令、配置优先级和正确退出码的工具。",
      source: "Introducing Python 3rd · Ch.13；Beginning Python 4th · Ch.18",
      sections: [
        {
          h: "入口函数：不带参数，返回退出码",
          p: `[[[project.scripts]]] 指向的函数必须不接受参数；argparse 在函数内部读 [[sys.argv]]。入口函数最好返回整数退出码，再由 [[sys.exit(main())]] 抛出；这样测试可以直接调用 [[main()]] 并断言返回值。

退出码约定：0 成功；1 一般错误；2 命令行用法错误（argparse 默认）；其他值按业务定义。不要把异常直接抛给用户看 traceback，除非 [[--debug]]。

入口函数只做「解析参数 → 调用业务 → 输出/返回码」，业务逻辑放 core，方便测试。`,
          code: String.raw`import argparse, sys

def build_parser():
    p = argparse.ArgumentParser(prog="scores")
    p.add_argument("--file", required=True)
    p.add_argument("--limit", type=int, default=10)
    return p

def main(argv=None):
    args = build_parser().parse_args(argv)
    if args.limit <= 0:
        print("limit 必须为正", file=sys.stderr)
        return 2
    print(f"read {args.file}, limit={args.limit}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())`,
          output: `$ scores --file data.csv --limit 3
read data.csv, limit=3
$ echo $?
0`,
          tip: `入口函数返回退出码，[[raise SystemExit(main())]]；测试直接传 [[argv]] 调 [[main]]。`
        },
        {
          h: "子命令：一个工具多个动作",
          p: `[[add_subparsers(dest="command", required=True)]] 让 [[scores import]]、[[scores report]] 各自有参数。每个子命令 [[set_defaults(func=...)]]，主函数根据 [[args.command]] 分发。

子命令共享参数（如 [[--verbose]]）放在父 parser；子命令独有参数放各自 parser。不要把所有参数堆在顶层，帮助信息会变得难读。

[[argparse]] 的 [[--help]] 自动生成；[[prog]] 和 [[description]] 要写清楚。子命令的 [[help=]] 会出现在父命令列表里。`,
          code: String.raw`import argparse

def add_common(p):
    p.add_argument("-v", "--verbose", action="store_true")

def cmd_import(args):
    print("import", args.path)
    return 0

def cmd_report(args):
    print("report", args.top)
    return 0

p = argparse.ArgumentParser(prog="scores")
add_common(p)
sub = p.add_subparsers(dest="command", required=True)

pi = sub.add_parser("import", help="导入 CSV")
pi.add_argument("path")
pi.set_defaults(func=cmd_import)

pr = sub.add_parser("report", help="输出报表")
pr.add_argument("--top", type=int, default=5)
pr.set_defaults(func=cmd_report)

args = p.parse_args(["report", "--top", "3"])
raise SystemExit(args.func(args))`,
          output: `report 3`,
          tip: `子命令用 [[set_defaults(func=...)]] 分发；共享参数放父 parser，独有参数放子 parser。`
        },
        {
          h: "配置优先级：命令行 > 环境变量 > 配置文件 > 默认值",
          p: `同一个配置项可能有四个来源。常见优先级是命令行最高，环境变量次之，配置文件再次，默认值最低。实现时先读默认，再被文件覆盖，再被环境变量覆盖，最后命令行非 None 才覆盖。

argparse 的默认值会掩盖「用户是否显式传了」；需要区分时用 [[default=None]]，解析后判断 [[None]] 再回退。[[action="store_true"]] 的默认 False 也会掩盖，需要 [[default=None]]。

配置来源要能打印出来（[[--show-config]]），否则线上「为什么用了这个数据库」很难查。`,
          code: String.raw`import argparse, os

defaults = {"limit": 5, "path": "data.csv"}
env = {"limit": int(os.environ.get("SCORES_LIMIT", defaults["limit"]))}
p = argparse.ArgumentParser()
p.add_argument("--limit", type=int, default=None)
args = p.parse_args([])
limit = args.limit if args.limit is not None else env["limit"]
print(limit)`,
          output: `5`,
          tip: `要区分「用户没传」和「传了默认值」，argparse 默认设 None，再按优先级回退。`
        },
        {
          h: "错误输出与日志：stderr 给人，stdout 给数据",
          p: `CLI 的 stdout 应该只输出机器可解析的数据（JSON/CSV/结果），日志和错误写 stderr。这样 [[scores report > out.json]] 不会把日志混进 JSON。

argparse 的错误默认写 stderr 并以退出码 2 结束；业务错误自己 [[print(..., file=sys.stderr)]] 并返回非 0。成功时不要打印「成功」到 stdout，除非用户要求。

[[--quiet]]/[[--verbose]] 控制日志级别；[[--json]] 控制输出格式。不要用 print 拼接 JSON，用 [[json.dumps]]。`,
          code: String.raw`import sys, json

def emit(data, as_json=False):
    if as_json:
        print(json.dumps(data, ensure_ascii=False))
    else:
        print(data["name"], data["score"])

emit({"name": "林晓", "score": 91}, as_json=True)
print("warning: 2 rows skipped", file=sys.stderr)`,
          output: `{"name": "林晓", "score": 91}
warning: 2 rows skipped`,
          tip: `stdout 只放数据，stderr 放日志/错误；[[--json]] 用 [[json.dumps]]，不要手拼。`
        },
        {
          h: "可测试的 CLI：注入 argv 与输出",
          p: `[[main(argv=None)]] 允许测试传入参数列表；输出可以用 [[capsys]] 捕获。不要测试真实终端，也不要依赖当前目录。

测试退出码：[[main(["bad"])]] 返回 2；测试 stderr 内容包含用法提示；测试成功路径的 stdout 是合法 JSON。业务错误要单独测。

CLI 测试不替代 core 测试；它只验证参数映射和退出码。`,
          code: String.raw`import pytest
from scores.cli import main

def test_bad_limit(capsys):
    assert main(["--file", "x.csv", "--limit", "0"]) == 2
    err = capsys.readouterr().err
    assert "limit" in err

def test_ok(capsys):
    assert main(["--file", "x.csv"]) == 0
    assert "read" in capsys.readouterr().out`,
          output: `2 passed in 0.03s`,
          tip: `CLI 测试用 [[argv]] + [[capsys]]，只验证参数映射/退出码，业务逻辑回 core 测。`
        },
        {
          h: "动手实验：给 scores 加 import/report 两个子命令",
          p: `实现 [[scores import CSV]] 和 [[scores report --top N]]；共享 [[--verbose]]；错误写 stderr；成功退出 0，用法错误 2。写 4 个测试：无参数、坏文件、正常导入、JSON 输出。

验收：[[scores --help]] 清楚列出两个子命令；[[scores import missing.csv]] 返回非 0 且不打印 traceback。`,
          code: String.raw`import argparse

def main(argv=None):
    p = argparse.ArgumentParser(prog="scores")
    sub = p.add_subparsers(dest="cmd", required=True)
    pi = sub.add_parser("import")
    pi.add_argument("path")
    pr = sub.add_parser("report")
    pr.add_argument("--top", type=int, default=5)
    args = p.parse_args(argv)
    if args.cmd == "import":
        print("import", args.path)
    else:
        print("report", args.top)
    return 0`,
          output: `$ scores --help
usage: scores [-h] {import,report} ...`,
          tip: `没有子命令时 [[required=True]] 会报用法错误并退出 2；不要让程序静默继续。`
        }
      ],
      points: [
        "入口函数不接收参数，返回退出码，测试可传 argv。",
        "子命令用 subparsers + set_defaults 分发。",
        "配置优先级命令行 > 环境变量 > 文件 > 默认。",
        "stdout 放数据，stderr 放日志/错误。",
        "CLI 测试只验证参数映射和退出码。"
      ],
      practice: "给 `scores` 加 import/report 子命令，错误写 stderr，正确返回 0/2；写 4 个 CLI 测试覆盖无参数、坏文件、正常导入、JSON 输出。"
    },
    {
      id: "ch13-3",
      title: "13.3 构建、版本与发布",
      minutes: 45,
      lead: "发布不是「把代码压缩上传」。wheel/sdist、版本号、签名、PyPI token、CI 每一步都可能让用户装不上。这一节走一遍最小发布流程，并在干净环境验证。",
      source: "Introducing Python 3rd · Ch.13；Beginning Python 4th · Ch.18",
      sections: [
        {
          h: "sdist 与 wheel：两种产物不是二选一",
          p: `sdist（[[.tar.gz]]）是源码包，安装时可能编译；wheel（[[.whl]]）是预构建包，安装快。纯 Python 包通常同时发布两者，pip 优先选 wheel。

wheel 文件名带 Python 标签/ABI/平台标签；[[py3-none-any]] 表示纯 Python、跨平台。带 C 扩展的 wheel 要为目标平台分别构建（manylinux/macOS/Windows）。

[[python -m build]] 默认生成两者；构建环境要干净，避免把本地依赖混进包。[[twine check]] 检查元数据/README 渲染。`,
          code: String.raw`python -m pip install build twine
python -m build
twine check dist/*
# 输出
# Checking dist/scores-0.1.0-py3-none-any.whl: PASSED
# Checking dist/scores-0.1.0.tar.gz: PASSED`,
          output: `Checking dist/scores-0.1.0-py3-none-any.whl: PASSED
Checking dist/scores-0.1.0.tar.gz: PASSED`,
          tip: `wheel 是预构建、sdist 是源码；发布前 [[twine check]]，别把 README 语法错误带上 PyPI。`
        },
        {
          h: "版本号：语义化版本与预发布",
          p: `语义化版本 MAJOR.MINOR.PATCH：不兼容改动升 MAJOR，新增功能升 MINOR，修 bug 升 PATCH。预发布用 [[1.0.0rc1]]、[[1.0.0b1]]；本地版本用 [[+local]]。

版本号只能升不能降；PyPI 不允许覆盖同版本文件。发布前打 tag，tag 与包版本一致；CI 从 tag 读取版本，避免手改漏改。

[[importlib.metadata.version("scores")]] 读安装版本；包内不要硬编码版本字符串，容易和 pyproject 不一致。`,
          code: String.raw`# pyproject.toml
# version = "0.1.0"

# 读取安装版本
from importlib.metadata import version
print(version("scores"))

# 打 tag
# git tag v0.1.0
# git push origin v0.1.0`,
          output: `0.1.0`,
          tip: `PyPI 同版本不能覆盖；tag、pyproject、发布版本三者必须一致。`
        },
        {
          h: "发布到 TestPyPI 再上正式",
          p: `正式 PyPI 不可撤回（只能 yank），先把包发到 [[test.pypi.org]] 验证安装。用 [[--repository testpypi]] 和独立 token；TestPyPI 的依赖可能不全，安装时加 [[--extra-index-url]] 指向正式源。

[[twine upload]] 用 API token，不要用密码；token 放 [[~/.pypirc]] 或 CI secret，权限设为 600。不要把 token 提交到 Git。

上传后立刻在干净 venv [[pip install --index-url ... scores==0.1.0]]，跑入口命令。`,
          code: String.raw`twine upload --repository testpypi dist/*
# 安装验证
python -m pip install --index-url https://test.pypi.org/simple/ \
  --extra-index-url https://pypi.org/simple/ scores==0.1.0
scores --help`,
          output: `usage: scores [-h] {import,report} ...`,
          tip: `先 TestPyPI 再正式；token 不进 Git，上传后在干净环境装一遍。`
        },
        {
          h: "CI 发布：tag 触发、最小权限",
          p: `GitHub Actions 可以在 push tag 时构建/发布。使用 PyPI trusted publishing（OIDC）可以免 token；否则用 repository secret 存 token，并限制 workflow 权限。

CI 步骤：checkout、setup-python、install build、build、twine check、upload。测试/类型检查应在前置 job，发布 job 只负责构建上传。

不要在 PR 上发布；不要让 fork PR 访问 secret。发布 workflow 用 [[permissions: id-token: write]] 最小权限。`,
          code: String.raw`# .github/workflows/release.yml
# on:
#   push:
#     tags: ["v*"]
# jobs:
#   build:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#       - uses: actions/setup-python@v5
#         with: {python-version: "3.12"}
#       - run: python -m pip install build twine
#       - run: python -m build
#       - run: twine check dist/*`,
          output: `Successfully built scores-0.1.0.tar.gz and scores-0.1.0-py3-none-any.whl`,
          tip: `tag 触发发布，PR 不发布；优先 trusted publishing，token 只给发布 job。`
        },
        {
          h: "安装后验证：干净环境、入口、资源",
          p: `发布前最后一步是在干净 venv 安装 wheel，检查：[[pip check]] 无冲突；入口命令存在；包内资源可读；[[import scores]] 不依赖 cwd；版本号正确。

还要测 [[pip install --no-deps]] 是否只装包本身，以及 [[pip uninstall]] 是否清理干净。资源路径用 [[importlib.resources]]，不要用 [[__file__]] 拼相对路径。

如果包依赖可选功能，测「不装 extra 时核心功能可用，装了 extra 时增强功能可用」。`,
          code: String.raw`python -m venv /tmp/verify
source /tmp/verify/bin/activate
python -m pip install dist/scores-0.1.0-py3-none-any.whl
python -m pip check
scores --help
python -c "import scores, importlib.metadata as m; print(m.version('scores'))"`,
          output: `No broken requirements found.
usage: scores [-h] ...
0.1.0`,
          tip: `发布验证要装 wheel 而不是源码目录；检查入口、资源、版本、[[pip check]]。`
        },
        {
          h: "动手实验：完整发布一次到 TestPyPI",
          p: `给 [[scores]] 打 [[0.1.0]] 版本，[[python -m build]]，[[twine check]]，上传 TestPyPI；在全新 venv 安装并运行 [[scores --help]]。记录每一步命令和输出，形成发布清单。

验收：wheel 内容包含 [[scores/data/sample.csv]]；安装后资源可读；入口命令可用；版本号一致。`,
          code: String.raw`python -m build
twine check dist/*
twine upload --repository testpypi dist/*
python -m venv /tmp/verify
source /tmp/verify/bin/activate
python -m pip install --index-url https://test.pypi.org/simple/ \
  --extra-index-url https://pypi.org/simple/ scores==0.1.0
scores --help`,
          output: `Checking dist/scores-0.1.0-py3-none-any.whl: PASSED
usage: scores [-h] ...`,
          tip: `发布清单要能复制执行；每一步都有可核对输出，别靠记忆。`
        }
      ],
      points: [
        "sdist 是源码，wheel 是预构建；纯 Python 两者都发。",
        "版本只升不降，tag/pyproject/包版本一致。",
        "先 TestPyPI 验证，再正式 PyPI。",
        "CI 用 tag 触发、最小权限、token 不进 Git。",
        "发布前在干净 venv 装 wheel 验证入口/资源/版本。"
      ],
      practice: "把 `scores` 发布到 TestPyPI：build、twine check、upload、干净 venv 安装、运行入口；写一份可复制的发布清单。"
    }
  ]
});

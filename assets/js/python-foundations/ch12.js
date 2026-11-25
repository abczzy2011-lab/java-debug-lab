window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch12",
  part: 3,
  number: "12",
  title: "类型提示、文档与测试",
  summary: "让代码「别人敢改」的三件套：类型说明输入输出，文档说明为什么，测试证明改了没坏。这一章不追求类型体操，而是建立一套能落地的工程习惯。",
  goals: [
    "能给函数/容器/可选值写出可检查的类型提示",
    "能写让人看懂的 docstring，并让 help() 正确显示",
    "能用 pytest 写单元测试、参数化测试和临时文件测试",
    "知道类型检查、文档生成、覆盖率各自能保证什么"
  ],
  lessons: [
    {
      id: "ch12-1",
      title: "12.1 类型提示：给运行时加一层静态合同",
      minutes: 45,
      lead: "Python 的类型提示默认不阻止运行，它服务于编辑器、类型检查器和读代码的人。这一节讲最常用的类型写法、Optional 的坑、TypedDict/Protocol，以及怎么让检查器真正跑起来。",
      source: "Introducing Python 3rd · Ch.14；Beginning Python 4th · Ch.16",
      sections: [
        {
          h: "注解不是强制类型，是给检查器看的",
          p: `[[def average(scores: list[float]) -> float: ...]] 里的注解会存进 [[__annotations__]]，但 Python 不会在调用时检查。你传字符串列表，运行时照样执行，直到 [[sum]] 报错。类型检查器（mypy/pyright）在开发阶段读注解，提前报错。

注解的价值：编辑器补全、重构安全、读代码时知道输入输出、CI 里拦住明显错误。它不能替代运行时校验，尤其是外部输入。边界数据仍要 [[float()]]/校验。

从简单开始：参数和返回值先标；容器标元素类型；[[None]] 用 [[| None]]；复杂结构用 TypedDict/dataclass。不要一上来写泛型体操。`,
          code: String.raw`def average(scores: list[float]) -> float:
    return sum(scores) / len(scores)

print(average([91, 88.5]))
print(average(["91"]))  # 运行时才报错`,
          output: `89.75
TypeError: unsupported operand type(s) for +: 'int' and 'str'`,
          tip: `类型提示不阻止运行；外部数据仍要运行时校验，注解主要给检查器/编辑器用。`
        },
        {
          h: "Optional、Union 与 None 的真实含义",
          p: `[[str | None]] 表示「字符串或 None」，不是「可选参数」。可选参数是「调用时可以不给」，用默认值表达；[[None]] 是「显式缺失」。两者混在一起会让调用方不知道 [[None]] 是合法值还是错误。

函数返回 [[str | None]] 时，调用方必须处理 [[None]]；如果业务上不应该缺失，就别返回 None，直接抛异常。返回 None 表示「没有」还是「失败」，要在文档里说清楚。

[[Optional[str]]] 等价于 [[str | None]]；Python 3.10+ 优先用 [[|]]。[[NoReturn]] 表示函数永不正常返回（总是抛异常/退出）。`,
          code: String.raw`def find(name: str) -> str | None:
    rows = {"林晓": "海豚队"}
    return rows.get(name)

print(find("林晓"))
print(find("周宁"))

value = find("周宁")
print(value.upper() if value is not None else "未找到")`,
          output: `海豚队
None
未找到`,
          tip: `[[str | None]] 是返回值可能是 None；可选参数用默认值。别把两者混为一谈。`
        },
        {
          h: "容器类型：list/dict/tuple/set 与只读视图",
          p: `[[list[str]]] 表示字符串列表；[[dict[str, float]]] 表示键字符串、值浮点；[[tuple[str, float]]] 是固定长度二元组；[[tuple[int, ...]]] 是任意长度整数元组。[[set[str]]] 是字符串集合。

只读参数用 [[Sequence]]/[[Mapping]]/[[Iterable]] 更宽，表示「我只读，不要求具体类型」。返回具体类型时用 [[list]]/[[dict]]，让调用方知道能做什么。

[[list]] 和 [[Sequence]] 不是一回事：前者承诺可变列表方法，后者只承诺索引/长度/迭代。参数标 [[Sequence]] 能接受 tuple，标 [[list]] 不能。`,
          code: String.raw`from collections.abc import Sequence, Mapping

def total(values: Sequence[float]) -> float:
    return sum(values)

def label(row: Mapping[str, object]) -> str:
    return str(row["name"])

print(total([1, 2, 3]))
print(total((1.5, 2.5)))
print(label({"name": "林晓"}))`,
          output: `6
4.0
林晓`,
          tip: `只读参数用 [[Sequence]]/[[Mapping]]；返回具体 [[list]]/[[dict]] 让调用方知道能力。`
        },
        {
          h: "TypedDict 与 Protocol：描述字典和鸭子类型",
          p: `[[TypedDict]] 给字典定义键和值类型，适合 JSON/配置这种「形状固定但仍是 dict」的数据。它运行时仍是普通 dict，检查器能发现拼错键/类型不符。

[[Protocol]] 描述对象需要哪些方法，不要求继承。适合依赖注入：[[Repo]] 协议要求 [[load/save]]，内存/SQLite 实现都满足。

TypedDict 的键默认必需；[[total=False]] 让所有键可选，或 [[NotRequired]] 单个可选。运行时不会校验，边界仍要手动检查。`,
          code: String.raw`from typing import TypedDict, Protocol

class ResultRow(TypedDict):
    event: str
    seconds: float

class Repo(Protocol):
    def load(self) -> list[ResultRow]: ...

row: ResultRow = {"event": "100m", "seconds": 62.35}
print(row["seconds"])`,
          output: `62.35`,
          tip: `[[TypedDict]] 只影响检查器；运行时还是 dict，外部 JSON 仍要校验键和类型。`
        },
        {
          h: "让检查器真的跑起来",
          p: `类型提示写得再好，不跑检查器就只是注释。[[mypy]] 和 [[pyright]] 是两大选择；[[ruff]] 也能做部分规则。项目里加一个 [[pyproject.toml]] 配置和 CI 命令，才能防止回退。

初次接入不要开最严格模式，先把明显错误清掉，再逐步开启 [[disallow_untyped_defs]]、[[strict_optional]] 等。对第三方无类型包，用 [[ignore_missing_imports]] 或 stub 包。

检查器不是万能：它不懂业务不变量、不懂运行时数据。类型 + 测试 + 运行时校验，三者互补。`,
          code: String.raw`# pyproject.toml
# [tool.mypy]
# python_version = "3.11"
# disallow_untyped_defs = true
# warn_return_any = true

# 终端
# python -m mypy src/
# python -m pyright src/`,
          output: `Success: no issues found in 3 source files`,
          tip: `先跑起来再逐步严格；CI 里固定命令，否则类型提示很快退化成注释。`
        },
        {
          h: "动手实验：给成绩模块补类型",
          p: `给 [[parse_line]]、[[average]]、[[Swimmer]] 加类型提示；用 [[TypedDict]] 描述原始行，用 [[Protocol]] 描述存储。跑 mypy，修掉所有错误；再故意传错类型，确认检查器能报。

验收：不改变运行行为，只加注解和必要 import；mypy 通过；[[help()]] 能看到签名。`,
          code: String.raw`from typing import TypedDict

class RawRow(TypedDict):
    name: str
    scores: list[float]

def parse_line(line: str) -> RawRow:
    name, *raw = [p.strip() for p in line.split(",")]
    return {"name": name, "scores": [float(x) for x in raw if x]}

print(parse_line("林晓,91,88.5"))`,
          output: `{'name': '林晓', 'scores': [91.0, 88.5]}`,
          tip: `类型改造不要顺手改逻辑；先注解、跑检查、再重构，出问题容易回退。`
        }
      ],
      points: [
        "类型提示默认不校验运行时，靠 mypy/pyright 提前发现。",
        "str | None 表示可能缺失，不是可选参数。",
        "只读参数用 Sequence/Mapping，返回具体 list/dict。",
        "TypedDict 描述字典形状，Protocol 描述对象结构。",
        "检查器要进 CI，否则类型提示会退化。"
      ],
      practice: "给成绩模块的 4 个函数加类型提示，定义 `RawRow` TypedDict 和 `Repo` Protocol；跑 mypy，故意传错一个类型确认能报错。"
    },
    {
      id: "ch12-2",
      title: "12.2 docstring、help() 与文档生成",
      minutes: 45,
      lead: "docstring 不是写给作者自己的注释，而是写给调用者的合同：这个函数做什么、参数什么意思、返回什么、会抛什么。这一节讲 PEP 257、常见风格、doctest 和文档生成的最小流程。",
      source: "Introducing Python 3rd · Ch.14–15；Beginning Python 4th · Ch.16",
      sections: [
        {
          h: "docstring 的第一行决定别人能不能快速理解",
          p: `PEP 257 建议：第一行是简短摘要，句号结尾，空一行，再写细节。[[help(func)]] 会把 docstring 格式化输出；IDE 悬浮提示也读它。第一行不是「函数名复述」，而是「它做什么、返回什么」。

坏 docstring：[[\"计算平均分\"]] 但没说空列表怎么办；好 docstring：[[\"返回平均分；空列表抛 ValueError。\"]]。调用方最想知道边界，而不是重复函数名。

docstring 是运行时对象 [[__doc__]]，可以被测试/文档工具读取。它不是注释，不会因为代码改动自动同步；所以要靠测试和 review 保持。`,
          code: String.raw`def average(scores):
    """返回平均分；空列表抛出 ValueError。

    Args:
        scores: 非空的可迭代数字序列。

    Returns:
        float: 算术平均值。

    Raises:
        ValueError: scores 为空。
    """
    if not scores:
        raise ValueError("scores 不能为空")
    return sum(scores) / len(scores)

print(average.__doc__.splitlines()[0])
help(average)`,
          output: `返回平均分；空列表抛出 ValueError。`,
          tip: `第一行写「做什么 + 返回什么」，不要复述函数名；边界和异常写在正文。`
        },
        {
          h: "Args/Returns/Raises：把合同写完整",
          p: `Google 风格用 [[Args:]]、[[Returns:]]、[[Raises:]]；NumPy 风格用 [[Parameters]]、[[Returns]] 分段；Sphinx 风格用 [[:param:]]/[[ :return:]]。团队选一种，别混用。

参数说明写「语义 + 约束」，不是类型复述。[[scores: 非空数字序列]] 比 [[scores: list]] 有用。返回值说明写「什么情况下是什么」，包括 None 的含义。异常说明写触发条件，不只写类型名。

docstring 不要写实现细节（“这里用了 for 循环”），写调用者需要知道的契约。实现细节放注释，且只在代码本身说不清时写。`,
          code: String.raw`def parse_score(text: str) -> float:
    """把单个分数字符串转成 float。

    Args:
        text: 只包含数字和小数点的字符串，允许首尾空白。

    Returns:
        0 到 100 之间的分数。

    Raises:
        ValueError: text 不是数字，或超出 0..100。
    """
    value = float(text.strip())
    if not 0 <= value <= 100:
        raise ValueError(f"分数越界：{value}")
    return value

print(parse_score(" 91 "))`,
          output: `91.0`,
          tip: `参数写语义/约束，返回写 None 的含义，异常写触发条件；不要复述类型。`
        },
        {
          h: "doctest：把示例变成可执行测试",
          p: `docstring 里的 [[>>>]] 示例可以被 [[doctest]] 执行。它适合简单、稳定的输入输出示例；不适合随机、网络、时间相关的逻辑。

doctest 的价值是防止文档过期：改了函数忘了改示例，测试会失败。缺点是格式严格（空格、输出、异常文本都要匹配），复杂示例维护成本高。

pytest 可以 [[--doctest-modules]] 自动收集；也可以 [[doctest.testmod()]] 在模块入口运行。不要把所有测试都写成 doctest，单元测试仍用 pytest。`,
          code: String.raw`def average(scores):
    """返回平均分。

    >>> average([90, 100])
    95.0
    >>> average([])
    Traceback (most recent call last):
    ValueError: scores 不能为空
    """
    if not scores:
        raise ValueError("scores 不能为空")
    return sum(scores) / len(scores)

import doctest
print(doctest.testmod())`,
          output: `TestResults(failed=0, attempted=2)`,
          tip: `doctest 的异常示例要写 [[Traceback (most recent call last):]] 和最后一行异常；格式错一点就失败。`
        },
        {
          h: "从 docstring 生成文档：最小可用流程",
          p: `[[pydoc]] 是标准库自带的文档生成器：[[python -m pydoc -w module]] 生成 HTML；[[pydoc -b]] 启动本地浏览器。零依赖，适合内部工具。

更大项目用 Sphinx（reStructuredText）或 MkDocs（Markdown）。Sphinx 的 autodoc 能读 docstring 生成 API 页；MkDocs 的 mkdocstrings 类似。选型看团队熟悉哪种标记。

文档生成的常见问题：模块导入失败、依赖缺失、循环导入。autodoc 需要能 import 模块，所以文档构建环境要装依赖；不要把文档构建和运行环境完全隔离。`,
          code: String.raw`# 标准库 pydoc
# python -m pydoc -w scores
# 生成 scores.html

# MkDocs 最小配置
# mkdocs.yml
# site_name: Scores
# nav:
#   - Home: index.md
# plugins:
#   - mkdocstrings`,
          output: `Writing generated HTML for scores...`,
          tip: `pydoc 零依赖适合内部；autodoc 需要模块可导入，文档环境也要装依赖。`
        },
        {
          h: "动手实验：给成绩包写可读文档",
          p: `给 [[scores/parse.py]]、[[scores/report.py]] 的每个公开函数写 docstring，包含 Args/Returns/Raises；加一个 doctest 示例；用 [[python -m pydoc -w scores]] 生成 HTML，检查 [[help()]] 输出是否完整。

验收：不看源码，只看 docstring 能回答「空输入怎么办」「坏行怎么报」「返回什么类型」。`,
          code: String.raw`def parse_line(line: str) -> dict:
    """解析一行 CSV 成绩。

    Args:
        line: 形如 '姓名,分数1,分数2' 的字符串。

    Returns:
        {"name": str, "scores": list[float]}。

    Raises:
        ValueError: 分数不是数字。
    """
    name, *raw = [p.strip() for p in line.split(",")]
    return {"name": name, "scores": [float(x) for x in raw if x]}

print(parse_line("林晓,91,88.5"))`,
          output: `{'name': '林晓', 'scores': [91.0, 88.5]}`,
          tip: `docstring 里用双反引号包代码；pydoc/Sphinx 会渲染成等宽，不要用中文引号。`
        }
      ],
      points: [
        "第一行摘要写做什么/返回什么，空一行再写细节。",
        "Args/Returns/Raises 写语义、约束和触发条件。",
        "doctest 适合稳定示例，格式严格，别替代单元测试。",
        "pydoc 零依赖；Sphinx/MkDocs 适合大型文档。",
        "文档构建环境必须能导入模块和依赖。"
      ],
      practice: "给 `scores` 包所有公开函数写 Google 风格 docstring，加 2 个 doctest；用 `python -m pydoc -w scores` 生成 HTML 并检查 `help()`。"
    },
    {
      id: "ch12-3",
      title: "12.3 pytest：从断言到参数化与临时文件",
      minutes: 50,
      lead: "测试不是「证明我对」，而是「改代码时知道有没有坏」。这一节用 pytest 写单元、参数化、异常、临时文件和 monkeypatch，最后接覆盖率。",
      source: "Introducing Python 3rd · Ch.15；Beginning Python 4th · Ch.16",
      sections: [
        {
          h: "pytest 的最小结构：test_ 文件 + assert",
          p: `pytest 自动发现 [[test_*.py]] 或 [[*_test.py]]，执行 [[test_]] 开头的函数。断言直接用 [[assert]]，失败时 pytest 会重写并显示左右值；不需要 [[self.assertEqual]]。

一个测试只验证一个行为，名字写清楚场景：[[test_average_empty_raises]] 比 [[test_average]] 好。测试准备（arrange）、执行（act）、断言（assert）尽量三段分明。

测试文件不要放在包目录里；放 [[tests/]]，从项目根运行 [[python -m pytest]]，避免导入到另一份代码。`,
          code: String.raw`# tests/test_scores.py
from scores.core import average

def test_average_normal():
    assert average([90, 100]) == 95

def test_average_empty_raises():
    import pytest
    with pytest.raises(ValueError):
        average([])`,
          output: `2 passed in 0.02s`,
          tip: `测试名写场景；一个测试一个行为；用 [[pytest.raises]] 断言异常类型。`
        },
        {
          h: "参数化：一份逻辑覆盖多组输入",
          p: `[[@pytest.mark.parametrize]] 把多组参数跑同一测试函数，失败时分别显示每组。适合边界值、等价类、格式变体。

参数名要和函数参数一致；[[ids=]] 给每组起可读名字。不要把不相关的断言塞进同一个参数化测试，失败时分不清是哪条规则。

参数化不是越多越好。选有代表性的边界：空、单元素、正常、越界、类型错误。重复大量随机值应交给属性测试（Hypothesis），不是手写 100 行。`,
          code: String.raw`import pytest

def parse(text):
    value = float(text)
    if not 0 <= value <= 100:
        raise ValueError("out of range")
    return value

@pytest.mark.parametrize("text,expected", [
    ("0", 0.0),
    ("91", 91.0),
    ("100", 100.0),
], ids=["zero", "normal", "max"])
def test_parse_ok(text, expected):
    assert parse(text) == expected

@pytest.mark.parametrize("text", ["-1", "101", "abc"])
def test_parse_bad(text):
    with pytest.raises(ValueError):
        parse(text)`,
          output: `6 passed in 0.03s`,
          tip: `参数化选边界和等价类，不堆随机值；[[ids]] 让失败输出可读。`
        },
        {
          h: "fixture 与临时文件：测试不碰真实数据",
          p: `[[@pytest.fixture]] 提供测试准备，[[tmp_path]] 是 pytest 内置的临时目录 fixture。测试里写文件用 [[tmp_path / "scores.csv"]]，结束后自动清理，不会污染项目。

fixture 默认函数级，每个测试一份；[[scope="module"]] 共享一份，适合昂贵且只读的资源。共享可变状态要小心，测试之间会互相影响。

不要在测试里连真实数据库/网络；用临时 SQLite 文件或假对象。集成测试可以单独标记，和单元测试分开跑。`,
          code: String.raw`import pytest
from pathlib import Path

@pytest.fixture
def csv_file(tmp_path):
    p = tmp_path / "scores.csv"
    p.write_text("name,score\n林晓,91\n", encoding="utf-8")
    return p

def test_read_csv(csv_file):
    text = csv_file.read_text(encoding="utf-8")
    assert "林晓" in text
    assert csv_file.exists()`,
          output: `1 passed in 0.02s`,
          tip: `[[tmp_path]] 每个测试独立；不要用固定路径写测试文件，否则并行/重复运行会互相覆盖。`
        },
        {
          h: "monkeypatch 与假对象：隔离外部边界",
          p: `[[monkeypatch]] 可以临时替换模块属性/环境变量，测试结束自动恢复。适合替换时间、随机、网络客户端、配置。

优先用依赖注入/假对象；monkeypatch 适合「代码已经写死全局函数」的遗留场景。不要 patch 太多内部细节，否则测试会绑死实现，重构就坏。

patch 的目标要写「使用它的地方」，不是定义它的地方。例如 [[scores.report.datetime]] 而不是 [[datetime.datetime]]，否则可能 patch 到全局模块。`,
          code: String.raw`import pytest

def is_weekend(day):
    return day.weekday() >= 5

class FakeDate:
    @staticmethod
    def today():
        class D:
            def weekday(self): return 5
        return D()

def test_weekend(monkeypatch):
    import scores.report as report
    monkeypatch.setattr(report, "date", FakeDate)
    assert is_weekend(FakeDate.today())`,
          output: `1 passed in 0.01s`,
          tip: `patch 使用处而不是定义处；优先依赖注入，monkeypatch 只处理遗留全局。`
        },
        {
          h: "覆盖率：看漏了哪条分支，不追求 100%",
          p: `[[pytest --cov=scores]] 生成覆盖率报告，[[--cov-report=term-missing]] 显示哪几行没执行。覆盖率是「测试触达代码的比例」，不是「代码正确性的证明」。

100% 覆盖率仍可能漏掉边界组合、异常路径、并发问题。把覆盖率当导航：没覆盖的分支逐个看，是否值得补测试；不要为了数字写无意义断言。

CI 里可以设阈值（如 80%），但阈值要随项目成熟度调整；新项目先看趋势，不要一开始卡 100%。`,
          code: String.raw`# 安装
# python -m pip install pytest pytest-cov

# 运行
# python -m pytest --cov=scores --cov-report=term-missing

# 示例输出
# Name                 Stmts   Miss  Cover
# scores/core.py          12      2    83%`,
          output: `scores/core.py 12 2 83%`,
          tip: `覆盖率看漏掉的分支，不追求 100%；异常/边界路径比行数更重要。`
        },
        {
          h: "动手实验：给导入器写 8 个测试",
          p: `给 [[parse_line]]/[[average]]/[[clean_csv]] 写测试：正常、空、坏数字、越界、BOM、空行、重复、临时文件。要求用 [[tmp_path]]，不碰真实数据；用参数化覆盖边界；跑 [[--cov]] 看漏了哪些分支。

验收：故意改坏一个函数，测试必须失败；恢复后全部通过。`,
          code: String.raw`import pytest

def divide(a, b):
    if b == 0:
        raise ZeroDivisionError("b 不能为 0")
    return a / b

@pytest.mark.parametrize("a,b,expected", [(10, 2, 5), (9, 3, 3)])
def test_divide(a, b, expected):
    assert divide(a, b) == expected

def test_divide_zero():
    with pytest.raises(ZeroDivisionError):
        divide(1, 0)`,
          output: `3 passed in 0.02s`,
          tip: `先写会失败的测试，再改代码；改坏后测试必须红，否则测试没测到点。`
        }
      ],
      points: [
        "pytest 自动发现 test_ 文件/函数，断言直接用 assert。",
        "参数化覆盖边界/等价类，ids 让失败可读。",
        "tmp_path 隔离文件，fixture 提供准备。",
        "优先假对象/依赖注入，monkeypatch 处理遗留全局。",
        "覆盖率看漏掉的分支，不追求 100%。"
      ],
      practice: "给 `clean_csv` 写 8 个 pytest 测试：正常/空/坏数字/越界/BOM/空行/重复/临时文件；跑 `--cov` 并补掉至少一个未覆盖分支。"
    }
  ]
});

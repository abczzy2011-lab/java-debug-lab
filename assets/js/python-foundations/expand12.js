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

  add("ch12-1", [{
    h: "工程深化：从注解到 mypy strict 的可落地路径",
    p: `类型注解不是给 IDE 看的装饰。它要能被执行器读取，被 mypy/pyright 检查，被运行时校验工具使用。第一步是开启 [[disallow_untyped_defs]]，让所有函数都有参数和返回值注解；第二步是 [[strict = true]]。不要一次全开，否则几千条错误会让人直接放弃。

迁移顺序：先给公共 API 和数据结构加注解，再给内部函数加；先处理 [[Any]] 泄漏，再处理泛型。[[Any]] 会静默传播，一个未注解的第三方函数返回值可能让整条链失去检查。用 [[reveal_type(x)]] 看推断结果，用 [[cast]] 只在确实无法表达时兜底，不要把 cast 当万能药。

[[TypedDict]] 适合描述「固定键的字典」，比如 API 响应、CSV 行。它比 [[dict[str, Any]]]] 精确，比 dataclass 轻量。注意 TypedDict 只在静态检查时存在，运行时就是普通 dict；不能做 isinstance 判断，也不能保证键真的存在。需要运行时校验时，用 pydantic 或手写验证。

[[@overload]] 适合「同一函数根据参数类型返回不同类型」：比如 [[load(path)]] 返回 str，[[load(file)]] 返回 bytes。实现函数只写一次，前面放多个 overload 声明。overload 的实现签名不对外暴露；调用方看到的是重载列表。不要滥用，参数组合超过三种就该考虑拆函数或传枚举。

[[Self]] 让方法返回当前类，对链式调用和工厂很有用。[[Literal]] 限定字符串/数字的合法值，适合配置项。[[Final]] 表示常量不可重新赋值。[[TypeAlias]] 给复杂类型起名字。这些工具让类型表达更精确，但也会增加阅读成本，按团队接受度逐步引入。

严格模式常见报错：缺少返回注解、隐式 Optional、[[dict]] 缺少类型参数、重载实现不兼容、未使用的 ignore。逐条修，不要用 [[# type: ignore]] 批量压制。每一条 ignore 都要写原因和到期时间，否则半年后没人敢删。

验收：在 CI 里跑 [[mypy src]]，0 错误；用 [[reveal_type]] 抽查公共函数；故意传错参数，确认检查器报错；再跑运行时测试，确认注解没有改变行为。`,
    code: String.raw`from typing import TypedDict, overload, Literal

class Row(TypedDict):
    athlete: str
    seconds: float

@overload
def load(path: str) -> str: ...
@overload
def load(path: bytes) -> bytes: ...
def load(path):
    if isinstance(path, bytes):
        return path
    with open(path, encoding="utf-8") as fh:
        return fh.read()

def top(rows: list[Row], n: int = 3) -> list[Row]:
    return sorted(rows, key=lambda r: r["seconds"])[:n]

print(top([{"athlete": "A", "seconds": 12.3}]))`,
    output: `[{'athlete': 'A', 'seconds': 12.3}]`,
    tip: `先公共 API 后内部；Any 会传播；TypedDict 无运行时保证；ignore 必须写原因。`
  }, {
    h: "故障排查：泛型、Protocol 与协变的常见坑",
    p: `[[TypeVar]] 让函数表达「输入什么类型，输出同样类型」。[[def first(items: list[T]) -> T]] 比 [[Any]] 精确得多。但 TypeVar 不是运行时机制，它只在静态检查时存在；运行时传错类型不会自动报错。需要运行时约束时，用 isinstance 或 pydantic。

[[Protocol]] 描述结构类型：只要对象有 [[read()]] 方法，就符合 [[Reader]]，不需要继承。它适合第三方对象、鸭子类型、测试替身。带 [[@runtime_checkable]] 的 Protocol 可以做 isinstance，但只检查方法名是否存在，不检查签名；不要把它当完整校验。

协变/逆变常被忽略。[[list[T]]] 是不变的：[[list[object]]] 不能接受 [[list[str]]]]，因为往 list[object] 里放 int 会污染原 list。[[Sequence[T]]] 是协变的，只读容器可以安全地接受更具体的元素类型。函数参数是逆变的：接受 object 的函数可以替代接受 str 的函数，反之不行。

[[TypeVar]] 的 bound 和 constraints 不一样。[[bound=Comparable]] 表示「必须是 Comparable 的子类型」；[[constraints=(str, bytes)]] 表示「只能是这两个之一」。前者更灵活，后者更严格。用错会让合法调用被拒绝，或者让非法调用通过。

泛型类要显式参数化：[[class Box(Generic[T])]]，然后在 [[__init__]] 里存 T。不要用 [[Box]] 裸类型，那会退化成 Any。Python 3.12 的 [[class Box[T]]] 语法更简洁，但旧版本不兼容；团队要统一版本。

测试泛型主要靠类型检查器，不是 pytest。写一组 [[assert_type]] 或 reveal_type 用例，放在 CI 的类型检查步骤；运行时测试只验证行为。不要为了「测试泛型」写一堆没有意义的运行时断言。

验收：[[list[str]]] 传给 [[list[object]]] 是否报错？[[Sequence[str]]] 传给 [[Sequence[object]]] 是否通过？Protocol 的 runtime_checkable 是否只查名字？TypeVar 约束是否拒绝了非法类型？`,
    code: String.raw`from typing import Protocol, Sequence, TypeVar, runtime_checkable

T = TypeVar("T")

def first(items: Sequence[T]) -> T:
    if not items:
        raise ValueError("empty")
    return items[0]

@runtime_checkable
class Reader(Protocol):
    def read(self) -> str: ...

class File:
    def read(self) -> str:
        return "data"

print(first(["a", "b"]))
print(isinstance(File(), Reader))`,
    output: `a
True`,
    tip: `list 不变、Sequence 协变；Protocol 运行时不校验签名；TypeVar 只在静态检查时生效。`
  }]);

  add("ch12-2", [{
    h: "工程深化：docstring、doctest 与文档即测试",
    p: `docstring 的第一行要回答「这个函数做什么」，而不是「这个函数叫 xxx」。接着写参数、返回值、异常、示例。Google、NumPy、Sphinx 三种风格都可以，团队选一种，不要混。风格统一比风格本身更重要。

[[doctest]] 能把 docstring 里的示例当测试跑。写法是 [[>>> add(1, 2)]] 下一行写期望输出 3。它适合纯函数、格式化函数、简单解析器；不适合网络、数据库、随机数。doctest 失败时输出会带实际结果，排查直观。

doctest 的坑：输出必须完全匹配，包括空格和引号；字典顺序在旧版本不保证；异常要用 [[Traceback (most recent call last): ...]] 省略中间堆栈。浮点数不要直接打印，用 [[round()]] 或 [[pytest.approx]] 风格。随机/时间相关的结果要先固定种子或注入时钟。

文档示例要能复制运行。很多 README 的代码缺 import、缺上下文，读者复制就报错。把示例放在 [[examples/]] 目录，用测试跑一遍；docstring 里的示例至少保证 import 和调用正确。文档不是小说，是要被执行的。

[[help()]]、IDE 悬浮、Sphinx 都读 docstring。类型注解已经表达了参数类型，docstring 不必重复「param x: int」，但可以补充单位、范围、默认值含义、副作用。返回值说明要写「返回什么」，不是「返回 result」。

文档构建要进 CI：[[sphinx-build -W]] 把警告当错误，避免断链、缺文档。API 页面从代码生成时，确保公开成员都有 docstring；私有成员可以跳过。文档版本和代码版本要一起发布，不能代码改了文档还是旧的。

验收：[[python -m doctest]] 通过；README 示例在干净环境能跑；Sphinx 构建 0 警告；公开函数 100% 有 docstring。`,
    code: String.raw`def parse_seconds(text: str) -> float:
    """把 "1:02.35" 形式的成绩转成秒。

    Args:
        text: 分:秒.百分秒，例如 "1:02.35"。

    Returns:
        总秒数，例如 62.35。

    Raises:
        ValueError: 格式不是 分:秒.百分秒。

    >>> parse_seconds("1:02.35")
    62.35
    >>> parse_seconds("0:09.80")
    9.8
    """
    try:
        minute, rest = text.split(":")
        return int(minute) * 60 + float(rest)
    except (ValueError, AttributeError) as exc:
        raise ValueError(f"bad time: {text!r}") from exc

if __name__ == "__main__":
    import doctest
    doctest.testmod()`,
    output: `# python -m doctest scores.py -v
# 2 items passed all tests`,
    tip: `docstring 写做什么/参数/返回/异常/示例；doctest 适合纯函数；示例必须能复制运行。`
  }, {
    h: "故障排查：文档与类型、代码三处不同步",
    p: `最常见的文档事故不是写错字，而是代码改了、文档没改。函数参数从 [[path]] 改成 [[file_path]]，README 还在用旧名字；返回值从 list 改成生成器，文档还说「返回列表」；异常类型换了，调用方还在捕获旧异常。三处不同步，读者会浪费大量时间。

把文档当代码管理：文档和代码在同一个 PR 里改，review 时检查三处：签名、docstring、示例。CI 跑 doctest、Sphinx 构建、类型检查；任何一处失败就阻止合并。不要依赖「以后再补」，以后永远不会来。

类型注解和 docstring 不要互相矛盾。注解说 [[str | None]]，docstring 说「一定返回字符串」，调用方就会踩 None。注解说 [[list[str]]]，docstring 说「返回迭代器」，行为就不一致。以代码为准，改文档；如果代码不对，先修代码。

公开 API 变更要有弃用流程：旧名字保留别名，发 [[DeprecationWarning]]，文档标注「自 x.y 起弃用，将在 z 移除」。不要直接删，外部用户可能还在用。弃用警告要能被测试捕获，确保真的发出。

文档里的版本号、安装命令、依赖版本要可验证。[[pip install scores==0.3.0]] 是否真的存在？CLI 参数是否真的叫 [[--format]]？把这些命令放进 CI 的 smoke test，跑一遍 [[--help]] 和最小示例。文档不是宣传册，是使用合同。

最后做一次「新人测试」：让一个没参与项目的人只看 README 和 docstring，从零安装并跑通示例。卡在哪一步，就说明文档缺哪一块。内部人觉得「显而易见」的地方，往往就是新人卡住的地方。`,
    code: String.raw`# CI 中的文档检查（示例）
# python -m doctest src/scores/*.py
# sphinx-build -W -b html docs docs/_build
# mypy src
# python -m scores --help
# python examples/quickstart.py

def deprecated_old_name(value):
    import warnings
    warnings.warn("old_name is deprecated; use new_name", DeprecationWarning, stacklevel=2)
    return value`,
    output: `# 任何一项失败都应阻止合并；
# 文档示例、CLI 帮助、类型签名必须与代码一致。`,
    tip: `文档与代码同 PR；CI 跑 doctest/Sphinx/类型/CLI；公开变更走弃用期。`
  }]);

  add("ch12-3", [{
    h: "工程深化：pytest fixture 工厂与参数化矩阵",
    p: `fixture 不是「把 setup 写成函数」那么简单。它的价值是依赖注入：测试需要什么，就在参数里写什么；pytest 负责创建、复用、清理。默认作用域是 function，每个测试一份；[[scope="module"]] 或 [[session"]] 可以共享重资源，但共享状态容易让测试互相污染。

fixture 可以返回工厂函数，让测试按需创建多个对象。比如 [[make_athlete]] 返回一个函数，测试里 [[make_athlete("A", 12.3)]]。这比固定一个 fixture 灵活，也比在每个测试里手写构造少重复。工厂 fixture 本身不创建资源，只返回构造函数，作用域好控制。

[[yield]] fixture 负责清理：yield 前是 setup，yield 后是 teardown。数据库事务、临时目录、环境变量、mock 都要在 finally 里恢复。测试失败时 teardown 仍会执行，但如果是进程被杀，就不会；所以外部资源要有超时和独立清理。

[[@pytest.mark.parametrize]] 把多组输入变成多个测试用例，失败时能看出哪组挂了。参数组合可以用 [[pytest.param(..., id="...")]] 命名，避免输出一堆 tuple。大量组合时，用 [[itertools.product]] 生成，但要注意测试数量爆炸；只保留有代表性的边界。

参数化的数据要放在文件或 fixture 里，不要塞在装饰器里几百行。CSV/JSON 驱动测试很常见：读一行，跑一次，失败信息带行号。数据文件要版本化，和代码一起 review。

测试命名要描述行为：[[test_rejects_negative_seconds]] 比 [[test_parse_2]] 好。断言失败时，pytest 会显示输入和期望；再加 [[assert result == expected, f"input={text}"]] 更清楚。不要一个测试断言十件事，失败时不知道哪件坏了。

验收：fixture 清理是否在失败时也执行？参数化是否覆盖空值/边界/非法值？测试是否互不依赖、可单独运行？[[pytest -x]] 第一个失败就停，[[pytest -k]] 能筛到目标。`,
    code: String.raw`import pytest

@pytest.fixture
def make_row():
    created = []
    def _make(athlete, seconds):
        row = {"athlete": athlete, "seconds": seconds}
        created.append(row)
        return row
    yield _make
    created.clear()

@pytest.mark.parametrize("text,expected", [
    ("1:02.35", 62.35),
    ("0:09.80", 9.8),
    pytest.param("-1:00.00", None, id="negative"),
])
def test_parse(text, expected, make_row):
    if expected is None:
        with pytest.raises(ValueError):
            parse_seconds(text)
    else:
        assert parse_seconds(text) == pytest.approx(expected)`,
    output: `# pytest -q
# 3 passed`,
    tip: `fixture 用 yield 清理；工厂 fixture 按需造对象；参数化命名并覆盖边界。`
  }, {
    h: "故障排查：覆盖率不等于测试质量",
    p: `覆盖率只告诉你「哪些行被执行过」，不告诉你「断言是否有效」。一个测试把函数调用一遍、不检查结果，也能拿到 100% 行覆盖。真正要关注的是分支覆盖、边界值、异常路径、以及「改错代码测试会不会失败」。

先看 [[coverage report -m]] 的 missing 行，再判断是否值得补。数据类、简单 getter、框架入口可以排除；核心解析、金额计算、权限判断必须覆盖。不要为了数字给无意义代码写测试，也不要因为 100% 就停止补边界。

变异测试能检验断言的有效性：工具故意把 [[<]] 改成 [[<=]]、把返回值改错，看测试是否失败。[[mutmut]] 或 [[cosmic-ray]] 可以跑小范围；全量很慢，先对核心模块跑。一个变异没被杀死，说明测试没有真正检查那个行为。

属性测试适合「输入空间大、规则明确」的场景。[[hypothesis]] 生成随机输入，检查不变量：解析后再格式化应等价、排序后长度不变、编码再解码应还原。它常能发现手写用例想不到的边界，比如空字符串、超长输入、Unicode 组合字符。

别把测试写成「实现镜像」。测试应该描述外部行为：给定输入，期望输出/异常/副作用；不要断言内部调用了哪个私有方法。内部重构时，行为测试仍应通过；实现镜像测试会全部失败，逼你改测试而不是改代码。

CI 里覆盖率阈值要合理。新项目可以设 80%，老项目先设「不低于当前」，再逐步提高。阈值太高会逼人造测试，阈值太低没有约束。把覆盖率报告作为 review 参考，不要把数字当 KPI。

验收：故意改错一个边界条件，测试是否失败？删掉一个断言，覆盖率是否仍 100%？随机属性测试是否跑过 100 组？这三个问题能区分「真测试」和「假覆盖」。`,
    code: String.raw`# 安装：pip install pytest coverage hypothesis mutmut
# 运行：
# coverage run -m pytest
# coverage report -m
# mutmut run --paths-to-mutate src/scores

from hypothesis import given, strategies as st

@given(st.floats(min_value=0.01, max_value=3599.99))
def test_format_roundtrip(seconds):
    text = format_seconds(seconds)
    assert abs(parse_seconds(text) - seconds) < 0.01`,
    output: `# 属性测试通过 100 组；
# 变异测试若大量存活，说明断言不足。`,
    tip: `覆盖率看分支与异常路径；用变异测试验证断言；属性测试补随机边界。`
  }]);
})();

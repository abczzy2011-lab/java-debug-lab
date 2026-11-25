window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch12-1": [
    {
      h: "深读：TypeVar、Generic 与容器类型",
      p: `[[TypeVar("T")]] 表示「同一类型贯穿输入输出」：[[def first(items: list[T]) -> T]]。没有 TypeVar 时，[[list[Any]]] 会丢失元素类型。

自定义容器用 [[Generic[T]]]；约束用 [[TypeVar("T", bound=Base)]] 或约束值。[[Self]]（3.11+）表示返回自身类型，适合 builder/工厂。

类型参数不是运行时检查；它只帮静态检查器推断。运行时要校验仍用 isinstance/dataclass。`,
      code: String.raw`from typing import TypeVar, Generic

T = TypeVar("T")

class Box(Generic[T]):
    def __init__(self, value: T):
        self.value = value
    def get(self) -> T:
        return self.value

b = Box[int](3)
print(b.get())`,
      output: `3`,
      tip: `TypeVar 贯穿输入输出；[[Generic[T]]] 定义容器；类型提示不替代运行时校验。`
    },
    {
      h: "深读：Protocol 与结构化子类型",
      p: `[[Protocol]] 定义「只要具备这些方法就算符合」，不要求继承。适合第三方对象/鸭子类型；[[@runtime_checkable]] 可 [[isinstance]] 检查（只查方法存在，不查签名）。

Protocol 比 ABC 更轻，适合解耦接口；但运行时不做完整检查，别把它当验证。

方法签名要精确；[[...]] 表示省略体。泛型 Protocol 可写 [[Protocol[T]]]。`,
      code: String.raw`from typing import Protocol

class Reader(Protocol):
    def read(self) -> str: ...

class FileReader:
    def read(self) -> str:
        return "data"

def load(r: Reader) -> str:
    return r.read()

print(load(FileReader()))`,
      output: `data`,
      tip: `Protocol 是结构化接口，不要求继承；运行时检查只查方法存在，不查签名。`
    },
    {
      h: "深读：overload 与联合类型收窄",
      p: `[[@overload]] 只为静态检查声明多个签名，实际实现只有一个；适合「输入类型决定输出类型」的函数。

[[isinstance(x, str)]] 后类型检查器会收窄联合类型；[[assert x is not None]] 也能收窄。不要用 [[cast]] 掩盖真正的类型错误。

[[TypeGuard]] 自定义收窄函数；返回 [[TypeIs]]（3.13）更精确。复杂类型先保证运行时正确，再逐步补提示。`,
      code: String.raw`from typing import overload

@overload
def double(x: int) -> int: ...
@overload
def double(x: str) -> str: ...
def double(x):
    return x * 2

print(double(3), double("a"))`,
      output: `6 aa`,
      tip: `overload 只给检查器看，实现只有一个；isinstance/assert 能收窄，别滥用 cast。`
    },
    {
      h: "深读：mypy 渐进式配置",
      p: `新项目可以 [[strict = true]]；老项目先 [[disallow_untyped_defs]] 只覆盖公共函数，再逐步扩大。[[ignore_missing_imports]] 处理无 stub 的第三方库，但别全局开。

[[reveal_type(x)]] 看推断结果；[[# type: ignore[code]]] 要带错误码并写原因，避免永久掩盖。

类型检查放 CI，和 ruff/pytest 一起跑；不要只在本地偶尔跑。`,
      code: String.raw`# pyproject.toml
# [tool.mypy]
# python_version = "3.12"
# disallow_untyped_defs = true
# warn_unused_ignores = true
# exclude = ["tests/"]`,
          output: `Success: no issues found`,
          tip: `渐进式 strict；ignore 带错误码/原因；mypy 进 CI，不只本地跑。`
    }
  ],
  "ch12-2": [
    {
      h: "深读：docstring 风格与工具链",
      p: `Google 风格（Args/Returns/Raises）可读性好；Sphinx 风格（:param:/:return:）适合生成文档。选一种，全项目统一。

docstring 写「做什么/参数/返回/异常/示例」，不写实现细节。公共 API 必须有；内部函数可简短。

[[pydocstyle]]/ruff 的 docstring 规则可检查缺失/格式；[[interrogate]] 统计覆盖率。`,
      code: String.raw`def average(scores: list[float]) -> float:
    """返回平均分。

    Args:
        scores: 非空分数列表。
    Returns:
        平均分。
    Raises:
        ValueError: scores 为空。
    """
    if not scores:
        raise ValueError("scores 不能为空")
    return sum(scores) / len(scores)`,
          output: `89.5`,
          tip: `一种 docstring 风格贯穿项目；写参数/返回/异常/示例，公共 API 必须有。`
    },
    {
      h: "深读：doctest 与文档示例的可执行性",
      p: `docstring 里的 [[>>>]] 示例可被 [[doctest]] 执行，防止文档过期。适合纯函数/简单示例；复杂场景用 pytest。

doctest 对输出格式敏感（空格/浮点）；用 [[round]] 或 [[...]] 省略。不要在 doctest 里做网络/文件 IO。

[[pytest --doctest-modules]] 可以把模块 docstring 一起跑；CI 加一条。`,
      code: String.raw`def add(a: int, b: int) -> int:
    """相加。

    >>> add(2, 3)
    5
    """
    return a + b

if __name__ == "__main__":
    import doctest
    print(doctest.testmod())`,
          output: `TestResults(failed=0, attempted=1)`,
          tip: `doctest 防文档过期；输出格式要稳定，别在示例里做 IO/网络。`
    },
    {
      h: "深读：README 与 API 文档的分工",
      p: `README 回答「是什么/怎么装/怎么用/怎么测」；API 文档回答「每个函数参数/返回/异常」。不要把全部 API 塞进 README。

README 的示例要能复制运行；版本/依赖/许可证写清。截图/架构图放 [[docs/]]，用相对路径。

生成文档（Sphinx/mkdocs）从 docstring 抽取；文档构建也放 CI，断链/缺引用要失败。`,
      code: String.raw`# README 结构
# # scores
# 一句话说明
# ## 安装
# pip install scores
# ## 快速开始
# scores import raw.csv
# ## 测试
# pytest`,
          output: `README ready`,
          tip: `README 讲安装/使用，API 文档讲细节；示例可复制，文档构建进 CI。`
    },
    {
      h: "深读：类型提示与文档同步",
      p: `类型提示和 docstring 重复描述参数时容易不一致；以类型提示为准，docstring 只补充语义/约束/异常。

[[typing.get_type_hints]] 可在运行时读提示（注意 forward ref）；不要用它做业务校验。

公开 API 变更要更新 docstring/CHANGELOG；破坏性变更写迁移说明。`,
      code: String.raw`from typing import get_type_hints

def f(x: int) -> str:
    return str(x)

print(get_type_hints(f))`,
          output: `{'x': <class 'int'>, 'return': <class 'str'>}`,
          tip: `类型提示是参数类型的事实源；docstring 补充语义/约束，变更同步 CHANGELOG。`
    }
  ],
  "ch12-3": [
    {
      h: "深读：fixture 作用域与依赖",
      p: `[[@pytest.fixture(scope="session")]] 整个测试会话共享（数据库连接）；[[module]]/[[class]]/[[function]] 逐级缩小。共享 fixture 要无状态/可重置。

fixture 可依赖 fixture；[[yield]] 前是 setup，后是 teardown。teardown 必须执行，即使测试失败。

[[autouse=True]] 慎用，会让测试隐式依赖；明确传参更可读。`,
      code: String.raw`import pytest

@pytest.fixture(scope="session")
def base_url():
    return "https://example.com"

@pytest.fixture
def client(base_url):
    print("setup")
    yield {"url": base_url}
    print("teardown")

def test_one(client):
    assert client["url"].startswith("https")`,
          output: `setup
teardown
1 passed`,
      tip: `fixture scope 按成本选；yield 做 teardown；autouse 慎用，显式依赖更可读。`
    },
    {
      h: "深读：parametrize 与异常断言",
      p: `[[@pytest.mark.parametrize]] 把多组输入展开成多个测试；[[pytest.raises(ValueError, match="...")]] 断言异常类型/消息。

边界值用 parametrize 列清楚：空、零、负数、超长、非法格式。不要一个测试里塞十个断言，失败难定位。

[[pytest.mark.xfail]] 标记已知失败；[[skip]] 标记环境不适用，都要写原因。`,
      code: String.raw`import pytest

@pytest.mark.parametrize("text,expected", [("1:02.35", 62.35), ("62.35", 62.35)])
def test_parse(text, expected):
    assert float(text.split(":")[-1]) == expected

def test_bad():
    with pytest.raises(ValueError, match="格式"):
        raise ValueError("格式错误")`,
          output: `3 passed`,
          tip: `parametrize 列边界；raises 断言类型+消息；xfail/skip 写原因。`
    },
    {
      h: "深读：mock 的边界与依赖注入",
      p: `[[unittest.mock.patch]] 替换外部依赖（网络/时间/随机），让测试确定。patch 路径要 patch「使用的地方」，不是定义的地方。

优先依赖注入（传函数/客户端），少用全局 patch；patch 太多说明设计耦合。

[[Mock.assert_called_once_with]] 验证调用；不要过度断言内部实现，测试行为而非实现。`,
      code: String.raw`from unittest.mock import patch

def fetch(client):
    return client.get("/x")

class Client:
    def get(self, path):
        return {"path": path}

with patch.object(Client, "get", return_value={"ok": True}) as m:
    print(fetch(Client()))
    m.assert_called_once_with("/x")`,
          output: `{'ok': True}`,
          tip: `patch 使用处；优先依赖注入；断言行为/调用契约，别锁死实现细节。`
    },
    {
      h: "深读：覆盖率与属性测试",
      p: `覆盖率报告看 [[term-missing]] 的未覆盖行；分支覆盖比行覆盖更有意义。不要为数字写无意义断言。

[[hypothesis]] 属性测试自动生成输入，适合解析/序列化/数学函数；能发现边界 bug。要设 [[max_examples]]/deadline，避免慢。

属性测试断言「不变量」（round-trip 相等/不抛异常/范围），不是具体输出。`,
      code: String.raw`# pip install hypothesis
# from hypothesis import given, strategies as st
#
# @given(st.lists(st.integers()))
# def test_len_non_negative(xs):
#     assert len(xs) >= 0`,
          output: `1 passed`,
          tip: `覆盖率看分支/未覆盖行；hypothesis 测不变量，适合解析/序列化边界。`
    }
  ],
  "ch12-review": [
    {
      h: "本章复盘：让代码可读、可查、可改",
      p: `类型提示让静态检查发现错误；docstring 让使用者不用读实现；测试让修改有安全网。三者不是装饰，是降低协作成本。

优先级：公共 API 类型/文档 → 关键路径测试 → 边界/错误测试 → 覆盖率/属性测试。不要一开始追求 100% 类型/覆盖。

本章验收：给 [[average]] 加完整类型/docstring/doctest；给 [[parse_time]] 写 parametrize + 异常测试；配 mypy/ruff/pytest 一条命令跑。`,
      code: String.raw`def average(scores: list[float]) -> float:
    """返回平均分，空列表抛 ValueError。

    >>> average([90, 80])
    85.0
    """
    if not scores:
        raise ValueError("scores 不能为空")
    return sum(scores) / len(scores)`,
          output: `85.0`,
          tip: `类型/文档/测试三件套；先公共 API，再边界，别一开始追 100%。`
    }
  ]
});

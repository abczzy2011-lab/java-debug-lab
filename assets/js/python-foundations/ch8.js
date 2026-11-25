window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch8",
  part: 2,
  number: "08",
  title: "模块、包、虚拟环境与标准库",
  summary: "从「一个文件跑到底」走向「一组文件互相引用」。这一章把 import 的查找路径、模块缓存、包结构和虚拟环境讲清楚，让你能把成绩工具拆成可复用模块，而不是复制粘贴。",
  goals: [
    "能解释 import 时解释器到底做了什么",
    "能设计一个带 __init__.py 的小包并正确使用绝对导入",
    "能用 venv 隔离依赖、用 pip 安装并锁定版本",
    "能按需找到 collections、itertools、pathlib 等标准库入口"
  ],
  lessons: [
    {
      id: "ch8-1",
      title: "8.1 import 是把名字带进来，不是把文件塞进来",
      minutes: 40,
      lead: "很多人把 import 理解成「把另一个文件的内容复制过来」，于是遇到循环导入、重复执行、模块名冲突时完全没头绪。这一节把 import 拆成查找、加载、绑定三步，再用一个成绩工具模块跑通。",
      source: "Introducing Python 3rd · Ch.12；Beginning Python 4th · Ch.10；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "模块是一个命名空间，不是一个文件夹",
          p: `在 Python 里，[[模块]] 是一个 [[.py]] 文件被加载后形成的对象。它有自己的命名空间：文件里定义的函数、类、常量都挂在这个模块对象上。[[import score_tools]] 做完之后，当前命名空间里多了一个名字 [[score_tools]]，它指向那个模块对象；模块里的 [[average]] 要通过 [[score_tools.average]] 访问。

这解释了一个常见误会：[[from score_tools import average]] 并不是「只加载 average」，而是先加载整个模块，再把 [[average]] 这个属性绑定到当前命名空间。模块顶层代码照样会执行，只是你只把其中一个名字拿了出来。想少写前缀可以用 [[from ... import ...]]，但要清楚代价：名字来源变模糊，重名时容易覆盖。

模块对象还有几个固定属性：[[__name__]] 是模块名，[[__file__]] 是源文件路径，[[__dict__]] 是命名空间字典。调试导入问题时，先打印这三个值，比盯着报错猜更有效。`,
          code: String.raw`# score_tools.py
print("score_tools 被加载")
VERSION = "1.0"

def average(scores):
    return sum(scores) / len(scores)

# main.py
import score_tools

print(score_tools.__name__)
print(score_tools.__file__)
print(score_tools.average([88, 92, 79]))
print(score_tools.__dict__["VERSION"])`,
          output: `score_tools 被加载
score_tools
/path/to/score_tools.py
86.33333333333333
1.0`,
          tip: `[[import]] 一定会执行模块顶层代码；如果你不希望导入时打印、写文件或联网，把这些动作放进 [[main()]] 或显式的初始化函数。`
        },
        {
          h: "四种 import 写法，各自适合什么场景",
          p: `最常见的四种写法是：[[import m]]、[[import m as alias]]、[[from m import name]]、[[from m import name as alias]]。它们不是风格问题，而是命名空间策略。

[[import m]] 保留完整前缀，最适合模块名短、调用点多、需要一眼看出「这个函数来自哪里」的场景，例如 [[import json]]、[[import pathlib]]。[[import numpy as np]] 这种别名适合社区约定俗成的长模块名。[[from m import name]] 适合名字唯一、调用频繁的函数，例如 [[from pathlib import Path]]；但如果从三个模块都导入 [[load]]，后导入的会覆盖前一个。[[from m import name as alias]] 用来解决冲突，例如 [[from json import loads as json_loads]]。

还有一个不推荐但必须认识的写法：[[from m import *]]。它把模块里所有不以下划线开头的名字倒进当前命名空间，看起来省事，实际让名字来源不可追踪，也容易覆盖已有变量。只有在交互式探索或极小的脚本里才考虑。`,
          code: String.raw`import math
import math as m
from math import sqrt
from math import sqrt as square_root

print(math.sqrt(81))
print(m.pi)
print(sqrt(16))
print(square_root(25))

# 命名冲突：后导入的覆盖前一个
from statistics import mean
mean = lambda values: sum(values) / len(values)
print(mean([1, 2, 3]))`,
          output: `9.0
3.141592653589793
4.0
5.0
2.0`,
          tip: `[[from ... import *]] 不是「导入全部函数」的快捷方式，而是把模块命名空间摊平；生产代码不要用它。`
        },
        {
          h: "模块只加载一次：缓存、状态与副作用",
          p: `同一个模块在同一进程里只会被加载一次。第一次 [[import]] 时，解释器创建模块对象、执行顶层代码，然后把它放进 [[sys.modules]]；后续再导入，直接复用缓存对象。这带来两个结果：模块级变量是进程级共享状态；模块初始化只发生一次。

共享状态有时是优点，例如配置对象、连接池、缓存；有时是 bug，例如你在测试里修改了模块级列表，下一个测试还在受影响。判断标准是「这个状态是否应该跨调用保留」。如果只是一次计算的中间结果，应该放在函数里；如果确实要共享，要显式提供 [[reset()]] 或工厂函数。

还要注意「只加载一次」不等于「只执行一次你想要的代码」。如果模块在导入时读文件、连数据库、启动线程，测试和 Web 服务加载它时都会发生。把副作用推迟到函数调用，是模块设计的基本纪律。`,
          code: String.raw`# counter.py
calls = []

def track(name):
    calls.append(name)
    return len(calls)

# main.py
import counter
import counter as again

print(counter is again)
print(counter.track("A"))
print(counter.track("B"))
print(counter.calls)`,
          output: `True
1
2
['A', 'B']`,
          tip: `[[import counter]] 和 [[import counter as again]] 指向同一个模块对象；改 [[again.calls]] 就是改 [[counter.calls]]。`
        },
        {
          h: "sys.path：解释器去哪里找模块",
          p: `[[import]] 不是在当前目录里瞎找，它按 [[sys.path]] 的顺序搜索。列表通常包含：脚本所在目录（或当前目录）、环境变量 [[PYTHONPATH]]、标准库目录、[[site-packages]]。找到第一个匹配的模块就停止，所以「同名模块」的优先级由路径顺序决定。

你可以打印 [[sys.path]] 看真实顺序。常见故障是「我明明写了 [[utils.py]]，为什么导入的是别的 utils？」——因为当前工作目录不在第一位，或者有一个同名包先被找到。另一个故障是脚本和标准库重名：把文件命名为 [[random.py]]，运行它时 [[import random]] 可能导入自己，随后 [[random.randint]] 不存在。

还有一个细节：直接运行脚本时，[[sys.path[0]]] 是脚本所在目录；以模块方式运行 [[python -m package.module]] 时，路径是当前目录。两种运行方式对导入的影响不同，包内相对导入只在模块方式下可靠。`,
          code: String.raw`import sys
from pathlib import Path

for i, item in enumerate(sys.path[:6]):
    print(i, item or "(空字符串：当前目录)")

print("当前工作目录:", Path.cwd())
print("本文件:", Path(__file__).resolve())`,
          output: `0 /path/to/project
1 /path/to/project/subjects
2 /usr/local/lib/python313.zip
3 /usr/local/lib/python3.13
4 /usr/local/lib/python3.13/lib-dynload
5 /usr/local/lib/python3.13/site-packages
当前工作目录: /path/to/project
本文件: /path/to/project/subjects/demo.py`,
          tip: `不要用 [[sys.path.insert(0, ...)]] 解决所有导入问题；它会让路径依赖运行时状态，测试和部署时容易失效。`
        },
        {
          h: "循环导入：不是删掉一行就能解决",
          p: `A 导入 B，B 又导入 A，就叫循环导入。轻则 [[ImportError: cannot import name ... from partially initialized module]]，重则拿到一个只初始化了一半的模块对象，属性缺失。

根因通常不是「Python 不支持互相引用」，而是模块在导入阶段就需要对方的完整对象。比如 [[a.py]] 顶层 [[from b import B]]，而 [[b.py]] 顶层又 [[from a import A]]；执行到一半，A 还没定义完，B 就来拿，当然拿不到。

修复思路有三个：第一，把共享的基类、常量、类型抽到第三个模块 [[common.py]]，两边都依赖它；第二，把导入移到函数内部，延迟到调用时；第三，改成 [[import b]] 而不是 [[from b import B]]，通过属性访问，避免在导入阶段取具体名字。最根本的修复是重新划分依赖方向：底层模块不要反向依赖上层模块。`,
          code: String.raw`# 错误示例：a.py 和 b.py 在顶层互相 from import
# a.py
from b import make_b

class A:
    pass

def make_a():
    return A()

# b.py
from a import A

def make_b():
    return A()

# 运行 import a 时，b 需要 a.A，而 a 还没执行到 class A`,
          output: `ImportError: cannot import name 'A' from partially initialized module 'a'`,
          tip: `循环导入是结构信号：要么抽出 common 层，要么把导入延迟到函数里；不要靠调整 import 顺序碰运气。`
        },
        {
          h: "标准库不是一张清单，而是一组常用入口",
          p: `初学者常问「标准库有哪些模块」，这个问题没有可操作答案：标准库有几百个模块，全背下来没有意义。更实用的做法是按任务找入口：处理路径用 [[pathlib]]，处理日期用 [[datetime]]，处理计数用 [[collections.Counter]]，处理组合迭代用 [[itertools]]，处理高阶函数用 [[functools]]，处理随机用 [[random]]，处理 JSON 用 [[json]]。

这一节先建立「任务 → 模块」的索引习惯。比如「我要统计词频」，先想到 [[Counter]]；「我要把两个列表拼成笛卡尔积」，先想到 [[itertools.product]]；「我要缓存函数结果」，先想到 [[functools.lru_cache]]。知道入口之后，再查具体签名，而不是从模块列表第一页开始翻。

标准库的优势是稳定、无第三方依赖、跨平台；劣势是有些 API 偏底层、错误信息不够友好。先用标准库把问题跑通，再考虑第三方库，是更稳的顺序。`,
          code: String.raw`from collections import Counter
from itertools import product
from functools import lru_cache
from pathlib import Path
from datetime import date

print(Counter("banana").most_common(2))
print(list(product([1, 2], "ab")))
print(Path("data/scores.csv").suffix)
print(date(2026, 11, 24).isoformat())

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(10))`,
          output: `[('a', 3), ('n', 2)]
[(1, 'a'), (1, 'b'), (2, 'a'), (2, 'b')]
.csv
2026-11-24
55`,
          tip: `先按任务记入口，再查签名；不要背模块清单。[[Counter]]、[[product]]、[[lru_cache]] 是三个最值得先熟悉的工具。`
        },
        {
          h: "动手实验：把成绩脚本拆成模块",
          p: `拿第一篇的成绩摘要脚本做一次真正的拆分：[[scores.py]] 只负责解析和计算，[[report.py]] 只负责格式化输出，[[main.py]] 负责串起来。要求：导入 [[scores.py]] 时不打印任何东西；计算函数接受字符串列表并返回结构化记录；[[report.py]] 不直接读文件。

这个实验的重点不是代码量，而是边界。[[scores.py]] 不知道输出格式，[[report.py]] 不知道数据来源，[[main.py]] 才知道「从哪个文件读、输出到屏幕还是文件」。这样以后换数据源或换输出格式，只改一层。

完成后用 [[python -m]] 和直接运行两种方式各跑一次，观察 [[__name__]]、[[sys.path]] 和导入结果的变化。`,
          code: String.raw`# scores.py
def parse_line(line):
    name, *raw_scores = [part.strip() for part in line.split(",")]
    scores = [float(x) for x in raw_scores if x]
    return {"name": name, "scores": scores}

def average(record):
    return sum(record["scores"]) / len(record["scores"])

# report.py
def format_record(record):
    return f'{record["name"]}: {average(record):.1f}'

# main.py
from scores import parse_line
from report import format_record

raw = "林晓, 91, 88.5, 79"
record = parse_line(raw)
print(format_record(record))`,
          output: `林晓: 86.2`,
          tip: `拆分模块的判断标准是「谁需要知道这件事」；[[scores.py]] 不应该知道终端宽度，[[report.py]] 不应该知道文件名。`
        }
      ],
      points: [
        "import 做三件事：查找模块、执行顶层代码、把模块对象绑定到名字。",
        "from m import name 仍然会加载整个模块，只是少了一个前缀。",
        "sys.modules 缓存保证模块只加载一次，模块级状态因此是进程级共享的。",
        "循环导入优先用 common 层或延迟导入解决，不要靠调整顺序。",
        "标准库按任务记入口：Counter、product、lru_cache、Path、date。"
      ],
      practice: "把第一篇的 `score_report.py` 拆成 `scores.py`、`report.py`、`main.py` 三个文件；要求导入任一无副作用，并写出每个文件的职责一句话。"
    },
    {
      id: "ch8-2",
      title: "8.2 包、__init__.py 与绝对导入",
      minutes: 40,
      lead: "当模块多到一个文件夹放不下，就需要包。包不是「带 __init__.py 的目录」这么简单：它决定导入路径、公开 API、资源位置和测试方式。这一节用一个成绩包把结构立起来。",
      source: "Introducing Python 3rd · Ch.12–13；Beginning Python 4th · Ch.10；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "包是目录，但导入的是包对象",
          p: `一个包本质上是一个带 [[__init__.py]] 的目录（命名空间包可以没有，但先不展开）。[[import scores]] 导入的是包对象 [[scores]]，不是目录里的所有文件。包对象也有命名空间，[[scores.parse]] 取决于 [[__init__.py]] 是否把 [[parse]] 暴露出来。

目录结构决定了模块的完整名字。[[scores/parse.py]] 的模块名是 [[scores.parse]]，不是 [[parse]]；[[scores/io/csv.py]] 是 [[scores.io.csv]]。名字里的点对应目录层级，所以「移动文件」就是「改模块名」，所有导入都要跟着改。

[[__init__.py]] 可以为空，也可以做三件事：定义包的公开 API、执行必要的初始化、设置 [[__all__]]。不要把重逻辑塞进 [[__init__.py]]，否则任何子模块导入都会触发它。`,
          code: String.raw`# 结构
# scores/
#   __init__.py
#   parse.py
#   report.py
#
# __init__.py
from .parse import parse_line
from .report import format_record

__all__ = ["parse_line", "format_record"]

# main.py
import scores
print(scores.parse_line("林晓, 91, 88.5"))
print(scores.format_record({"name": "林晓", "scores": [91, 88.5]}))`,
          output: `{'name': '林晓', 'scores': [91.0, 88.5]}
林晓: 89.8`,
          tip: `[[__init__.py]] 只做「公开什么」和「轻量初始化」；重逻辑放子模块，避免导入包就触发一堆副作用。`
        },
        {
          h: "绝对导入与相对导入：什么时候用哪个",
          p: `绝对导入从项目根开始写完整路径，例如 [[from scores.parse import parse_line]]；相对导入从当前包出发，例如 [[from .parse import parse_line]]、[[from ..common import load]]。PEP 8 的建议是优先绝对导入，因为它不依赖当前模块在包里的位置，重构时更稳定。

相对导入适合「包内部互相引用」，尤其是包可能被整体改名或移动时。但它只能在包内使用：直接运行 [[python scores/parse.py]] 时，[[__package__]] 是空的，相对导入会报 [[ImportError: attempted relative import with no known parent package]]。正确运行方式是 [[python -m scores.parse]]，或者从项目根运行入口脚本。

还有一点：[[from . import parse]] 导入的是子模块对象，[[from .parse import parse_line]] 导入的是函数。两者都能用，但前者保留命名空间，后者更短。团队要统一一种，别在同一包里混着写。`,
          code: String.raw`# scores/parse.py
def parse_line(line):
    name, *raw = [x.strip() for x in line.split(",")]
    return {"name": name, "scores": [float(x) for x in raw if x]}

# scores/report.py
from .parse import parse_line

def preview(line):
    record = parse_line(line)
    return f'{record["name"]}: {len(record["scores"])} 项'

# 从项目根运行：
# python -m scores.report`,
          output: `林晓: 3 项`,
          tip: `直接运行包内文件会破坏相对导入；用 [[python -m 包.模块]]，并在项目根执行。`
        },
        {
          h: "公开 API：__all__ 与下划线约定",
          p: `包应该给外部一个稳定的公开 API，而不是让调用方随便钻到子模块里。常见做法是在 [[__init__.py]] 里重新导出核心名字，并用 [[__all__]] 声明 [[from scores import *]] 时到底导出什么。

[[__all__]] 不影响 [[import scores]] 后能访问什么，它只影响星号导入和文档工具。真正的「私有」约定是前导下划线：[[_parse_raw]] 表示内部使用，[[parse_line]] 表示公开。下划线不是强制访问控制，但它是一个清晰的社会契约。

公开 API 要少而稳。你把 [[scores._parse_raw]] 暴露出去，外部代码就会依赖它；以后改内部实现就会破坏兼容。相反，如果只公开 [[parse_line]]，内部换成正则、换 [[csv]] 模块都不影响调用方。`,
          code: String.raw`# scores/__init__.py
from .parse import parse_line as _parse_line

__all__ = ["parse"]

def parse(line):
    """公开入口：未来可以换内部实现而不破坏调用方。"""
    return _parse_line(line)

# main.py
from scores import parse
print(parse("周宁, 86, 92"))

import scores
print(scores._parse_line("林晓, 91"))  # 能访问，但不承诺稳定`,
          output: `{'name': '周宁', 'scores': [86.0, 92.0]}
{'name': '林晓', 'scores': [91.0]}`,
          tip: `[[__all__]] 是声明，不是权限；真正稳定的是你承诺的公开名字，内部名字用下划线并准备随时改。`
        },
        {
          h: "命名空间包：没有 __init__.py 的目录",
          p: `PEP 420 引入了命名空间包：一个没有 [[__init__.py]] 的目录也可以被导入，多个分布可以把同一个包的不同部分拼在一起。典型场景是插件生态，例如 [[myapp.plugins]] 由多个第三方包共同贡献子模块。

命名空间包让「可拆分的大包」成为可能，但也带来调试难度：[[myapp.plugins]] 可能来自三个不同的 [[site-packages]] 目录，[[__file__]] 是 [[None]]。如果只是普通项目，别为了省一个空文件就用命名空间包；显式的 [[__init__.py]] 更容易排查。

判断是否需要：如果你要把一个包拆成多个独立发布的分发，并且希望它们共享同一个顶层命名空间，才考虑；否则用普通包。`,
          code: String.raw`# 普通包
# myapp/__init__.py
# myapp/core.py

# 命名空间包
# myapp/              <- 没有 __init__.py
# myapp/core.py
# 另一个 site-packages 里也可以有 myapp/extra.py

import myapp
print(myapp.__file__)  # 普通包是路径；命名空间包可能是 None`,
          output: `None`,
          tip: `命名空间包的 [[__file__]] 可能是 [[None]]；没有插件拆分需求时，用普通包更省心。`
        },
        {
          h: "包内资源：不要用相对路径猜当前目录",
          p: `包经常需要读取模板、CSV、图标等资源文件。用 [[open("data.csv")]] 依赖当前工作目录，换一个启动目录就崩。正确做法是用 [[importlib.resources]] 按包定位资源，或者用 [[Path(__file__).parent]] 拼出包目录。

[[importlib.resources.files("scores") / "data" / "sample.csv"]] 返回一个可读路径/句柄，打包成 zip 后也能工作。[[Path(__file__).with_name("sample.csv")]] 适合普通源码目录，但打包后 [[__file__]] 可能指向压缩包内部，不一定可读。

原则：资源属于包，就用包的定位方式；资源属于用户数据，就用显式配置路径或命令行参数。不要把两者混在一起。`,
          code: String.raw`from importlib.resources import files
from pathlib import Path

resource = files("scores").joinpath("data/sample.csv")
print(resource)
print(resource.read_text(encoding="utf-8").splitlines()[:2])

here = Path(__file__).resolve().parent
print(here / "data" / "sample.csv")`,
          output: `/path/to/scores/data/sample.csv
['name,score', '林晓,91']
/path/to/scores/data/sample.csv`,
          tip: `包资源用 [[importlib.resources]]；用户数据用配置/参数。[[open("相对路径")]] 只适合「当前目录就是数据目录」的脚本。`
        },
        {
          h: "包结构常见错误：能导入，但一运行就崩",
          p: `最常见的三个结构错误：第一，包目录和模块同名，例如 [[scores.py]] 与 [[scores/]] 并存，导入结果取决于路径顺序；第二，[[__init__.py]] 里导入子模块，子模块又反过来导入包，形成循环；第三，测试文件放在包目录里，被当成模块导入，测试运行器又把项目根插到路径最前面，导致导入到另一份代码。

排查顺序：打印 [[module.__file__]] 确认导入的是哪份；打印 [[sys.path]] 确认根目录；用 [[python -m pytest]] 从项目根运行，避免测试文件被当作脚本。结构上，测试目录和源码目录分开，源码放 [[src/]] 或包目录，入口放 [[main.py]]。

包结构不是审美问题。它决定导入解析、测试隔离、打包内容，早点立规矩比后期搬家便宜。`,
          code: String.raw`# 推荐的最小结构
# project/
#   pyproject.toml
#   src/
#     scores/
#       __init__.py
#       parse.py
#       report.py
#   tests/
#     test_parse.py
#   README.md

# 从 project 根运行：
# python -m pytest
# python -m scores.report`,
          output: `tests/test_parse.py ....  [100%]`,
          tip: `源码放 [[src/]]、测试放 [[tests/]]，从项目根用 [[python -m]] 运行；不要在同一目录同时放 [[scores.py]] 和 [[scores/]]。`
        },
        {
          h: "动手实验：把成绩包跑成模块",
          p: `创建 [[scores/]] 包，包含 [[parse.py]]、[[report.py]]、[[__init__.py]] 和 [[data/sample.csv]]。要求：[[from scores import parse]] 可用；直接运行 [[python -m scores.report]] 能输出示例；从其他目录启动也能读到资源文件；[[__init__.py]] 不打印任何东西。

做完后故意把 [[parse.py]] 移到 [[scores/io/parse.py]]，观察哪些导入需要改。这个动作会让你真正理解「模块名就是路径」。`,
          code: String.raw`# scores/__init__.py
from .parse import parse_line

__all__ = ["parse_line"]

# scores/report.py
from .parse import parse_line

def main():
    print(parse_line("林晓, 91, 88.5"))

if __name__ == "__main__":
    main()

# 终端
# python -m scores.report`,
          output: `{'name': '林晓', 'scores': [91.0, 88.5]}`,
          tip: `包内入口也要写 [[if __name__ == "__main__"]]；[[python -m]] 运行时 [[__name__]] 是 [["__main__"]]，不是包名。`
        }
      ],
      points: [
        "包是带 __init__.py 的目录，模块名由目录层级决定。",
        "优先绝对导入；包内相对导入只在 python -m 方式下可靠。",
        "__init__.py 负责公开 API 和轻量初始化，不放大逻辑。",
        "__all__ 只影响星号导入，不是访问控制。",
        "包资源用 importlib.resources，别依赖当前工作目录。"
      ],
      practice: "搭一个 `scores` 包：`__init__.py` 只导出 `parse_line`，`report.py` 提供 `main()`；用 `python -m scores.report` 跑通，并解释为什么不能直接 `python scores/report.py`。"
    },
    {
      id: "ch8-3",
      title: "8.3 venv、pip 与标准库导航",
      minutes: 40,
      lead: "依赖管理不是「pip install 一下」：它决定你的项目半年后还能不能复现。这一节从虚拟环境开始，讲到 requirements、pyproject 和标准库入口，最后做一个可复现的环境清单。",
      source: "Introducing Python 3rd · Ch.13；Beginning Python 4th · Ch.10；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "为什么每个项目都要自己的虚拟环境",
          p: `系统 Python 的 [[site-packages]] 是全局的。项目 A 需要 [[requests 2.28]]，项目 B 需要 [[requests 2.32]]，全局只能装一个版本；升级 B 就可能弄坏 A。虚拟环境的作用是给每个项目一套独立的解释器链接和 [[site-packages]]，让依赖互不干扰。

[[venv]] 是标准库自带的方案，不依赖第三方工具。它在项目目录下创建一个包含 [[bin/python]]、[[lib/python3.x/site-packages]] 的文件夹；激活后，[[python]] 和 [[pip]] 指向这个环境。删除整个文件夹就卸载了环境，不会污染系统。

虚拟环境不是「必须提交到 Git」的东西。它包含本机路径和二进制，应该写进 [[.gitignore]]；需要提交的是依赖声明文件，让别人能重建环境。`,
          code: String.raw`# 在项目根创建环境
python3 -m venv .venv

# macOS / Linux 激活
source .venv/bin/activate

# Windows PowerShell
# .venv\Scripts\Activate.ps1

python -c "import sys; print(sys.prefix)"
pip --version`,
          output: `/path/to/project/.venv
pip 25.2 from /path/to/project/.venv/lib/python3.13/site-packages/pip (python 3.13)`,
          tip: `[[python3 -m venv .venv]] 用当前解释器创建环境；激活只是改 PATH，不是「安装了一个新 Python」。`
        },
        {
          h: "pip install 的三层：包、版本、来源",
          p: `[[pip install requests]] 做三件事：解析依赖、下载 wheel/sdist、把包放进当前环境的 [[site-packages]]。默认来源是 PyPI，但企业环境可能配置镜像或私有索引。安装前先确认 [[pip --version]] 指向的是虚拟环境，否则会把包装到系统里。

版本约束有几种写法：[[requests==2.32.3]] 精确锁定；[[requests>=2.28,<3]] 允许小版本升级；[[requests~=2.32.0]] 允许补丁级升级。生产环境通常要精确锁定，开发环境可以放宽。不要同时写 [[==]] 和 [[>=]] 互相矛盾的约束。

安装依赖时优先用 [[requirements.txt]] 记录直接依赖，再用 [[pip freeze]] 生成完整锁定清单。直接依赖是你主动选择的，锁定清单包含所有传递依赖；两者用途不同，不要混成一份。`,
          code: String.raw`# requirements.txt
requests>=2.28,<3
flask==3.1.0

# 安装
python -m pip install -r requirements.txt

# 查看当前环境
python -m pip list
python -m pip show requests

# 生成完整锁定（包含传递依赖）
python -m pip freeze > requirements.lock`,
          output: `Successfully installed Flask-3.1.0 requests-2.32.3 ...
Name: requests
Version: 2.32.3
Location: /path/to/project/.venv/lib/python3.13/site-packages`,
          tip: `用 [[python -m pip]] 而不是裸 [[pip]]，能确保调用的是当前解释器对应的 pip。`
        },
        {
          h: "pyproject.toml：项目元数据与依赖声明",
          p: `[[requirements.txt]] 只表达「装什么」，[[pyproject.toml]] 还能表达「这个项目是什么、怎么构建、有哪些可选依赖、入口命令叫什么」。PEP 621 把项目元数据标准化，现代 Python 项目通常以它为主。

最小配置包含 [[[project]]] 的 name、version、requires-python、dependencies；构建后端用 [[[build-system]]] 指定。可选依赖放 [[[project.optional-dependencies]]]，例如 [[dev]] 组放 pytest、ruff。这样安装时可以用 [[pip install -e ".[dev]"]]。

[[-e]] 是 editable 安装：把项目以「开发模式」装进环境，修改源码立即生效，不需要每次重装。做库开发时几乎必备；做单文件脚本时不一定需要。`,
          code: String.raw`[project]
name = "scores"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = ["requests>=2.28,<3"]

[project.optional-dependencies]
dev = ["pytest>=8", "ruff>=0.8"]

[project.scripts]
scores-report = "scores.report:main"

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"`,
          output: `$ pip install -e ".[dev]"
Successfully installed scores-0.1.0 pytest-8.3.4 ruff-0.8.4`,
          tip: `[[[project.scripts]]] 把函数变成命令行命令；函数必须是不带参数的入口，参数用 [[argparse]] 在函数内部解析。`
        },
        {
          h: "依赖冲突：不是所有红字都要升级",
          p: `[[pip]] 报 [[ResolutionImpossible]] 时，通常不是某个包坏了，而是两个包对同一个依赖的版本要求没有交集。比如 A 要求 [[urllib3<2]]，B 要求 [[urllib3>=2]]，无论装哪个版本都会让一方不满足。

处理顺序：先看完整错误里的「which requires」链，找到冲突的两个直接依赖；再判断能否放宽其中一个的版本约束；最后才考虑升级/降级。不要看到红字就 [[pip install --upgrade]] 全部包，这会把可复现环境变成碰运气。

[[pip check]] 可以检查已安装包之间的依赖是否一致；[[pipdeptree]] 能打印依赖树，但它是第三方工具。没有工具时，[[pip show]] 和错误链已经够用。`,
          code: String.raw`python -m pip check
# 示例输出
# package-a 1.0 requires urllib3<2, but you have urllib3 2.2.2
# package-b 2.0 requires urllib3>=2, but you have urllib3 1.26.20

# 查看某个包的依赖
python -m pip show package-a`,
          output: `package-a 1.0 requires urllib3<2, but you have urllib3 2.2.2
package-b 2.0 requires urllib3>=2, but you have urllib3 1.26.20`,
          tip: `冲突时先找「谁要求了什么」，再决定放宽哪一边；不要用 [[--force-reinstall]] 掩盖依赖不一致。`
        },
        {
          h: "标准库导航：按任务找到入口",
          p: `这一节把常用标准库压成一张「任务 → 模块」表。文本处理：[[re]]、[[string]]、[[textwrap]]；路径与文件：[[pathlib]]、[[os]]、[[shutil]]、[[tempfile]]；日期时间：[[datetime]]、[[zoneinfo]]；数据格式：[[json]]、[[csv]]、[[sqlite3]]；集合与迭代：[[collections]]、[[itertools]]、[[functools]]；并发：[[threading]]、[[multiprocessing]]、[[asyncio]]；网络：[[urllib.request]]、[[http.client]]；调试：[[logging]]、[[traceback]]、[[pdb]]。

不要一次学完。正确的用法是遇到任务先查表，选一个入口，读官方文档的「函数/类」段，跑最小例子。标准库文档很干，但准确；第三方教程可能漏掉版本差异。

这一章只需要记住三个最常用的：[[pathlib.Path]] 处理路径，[[datetime]] 处理时间，[[collections]] 处理计数/默认字典/双端队列。其余等用到再查。`,
          code: String.raw`from collections import Counter, defaultdict, deque
from pathlib import Path
from datetime import datetime, timedelta

print(Counter(["A", "B", "A"]))
d = defaultdict(list)
d["林晓"].append(91)
print(dict(d))
q = deque([1, 2, 3], maxlen=3)
q.append(4)
print(list(q))
print(Path("/tmp") / "scores.csv")
print((datetime(2026, 11, 24) + timedelta(days=7)).date())`,
          output: `Counter({'A': 2, 'B': 1})
{'林晓': [91]}
[2, 3, 4]
/tmp/scores.csv
2026-12-01`,
          tip: `[[deque(maxlen=3)]] 满了会自动从左边丢；[[defaultdict(list)]] 访问不存在的键会自动建空列表。`
        },
        {
          h: "配置、密钥与环境变量",
          p: `代码里不要写数据库密码、API key。常见做法是读环境变量，本地开发用 [[.env]] 文件加载，生产环境由部署平台注入。标准库 [[os.environ]] 足够读取；[[python-dotenv]] 只是把 [[.env]] 读进环境变量，不是必须。

原则：配置和代码分离；密钥不进 Git；默认值只给非敏感项；缺少必需配置时尽早失败，并给出清晰错误。不要用 [[os.getenv("DB_PASSWORD", "123456")]] 这种默认密码，它会把配置错误变成 silently wrong。

[[.env]] 要写进 [[.gitignore]]，并提供 [[.env.example]] 说明需要哪些键、格式是什么。部署时用平台 secrets，不要提交文件。`,
          code: String.raw`import os
from pathlib import Path

def require_env(name):
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"缺少环境变量：{name}")
    return value

# .env.example
# SCORES_DB=data/scores.db
# SCORES_TOKEN=change-me

db_path = Path(os.environ.get("SCORES_DB", "data/scores.db"))
token = require_env("SCORES_TOKEN")
print(db_path, bool(token))`,
          output: `data/scores.db True`,
          tip: `密钥不要有默认值；非敏感配置可以给默认值。缺配置时抛错，比运行到一半才失败更好。`
        },
        {
          h: "动手实验：做一份可复现的环境清单",
          p: `在一个新目录创建 [[.venv]]，安装 [[requests]] 和 [[pytest]]，写 [[requirements.txt]] 只列直接依赖，再生成 [[requirements.lock]]。然后删除环境，按 lock 重建，确认 [[pip check]] 通过。

最后写一个 [[README]] 的三行「如何运行」：创建环境、安装依赖、运行命令。要求别人只读这三行就能跑起来。`,
          code: String.raw`python3 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip
python -m pip install requests pytest
python -m pip freeze > requirements.lock
python -m pip check
deactivate
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.lock
python -m pip check`,
          output: `No broken requirements found.`,
          tip: `锁文件要提交，虚拟环境不要提交；重建后跑 [[pip check]]，确认依赖树没有缺口。`
        }
      ],
      points: [
        "每个项目独立 venv，删除环境文件夹即可清理。",
        "直接依赖写 requirements/pyproject，完整锁定用 pip freeze。",
        "pyproject.toml 表达元数据、可选依赖和命令行入口。",
        "依赖冲突先读「谁要求了什么」，不要盲目升级全部包。",
        "标准库按任务记入口：Path、datetime、collections 先用熟。"
      ],
      practice: "建一个带 `pyproject.toml` 的 `scores` 项目，配置 `scores-report` 命令；在全新 venv 中 `pip install -e .` 后直接运行该命令，并提交 `requirements.lock`。"
    }
  ]
});

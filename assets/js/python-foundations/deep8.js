window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch8-1": [
    {
      h: "深读：延迟导入不是偷懒，是控制启动成本",
      p: `大型项目启动慢，常见原因不是代码多，而是入口模块把重依赖全导入了。比如 CLI 只是打印帮助，却先导入了 pandas、torch、数据库驱动。Python 的 import 是同步的，导入期间会执行模块顶层代码，所以「没用到的功能」也会付出代价。

延迟导入的做法是在函数内部 [[import]]。第一次调用时才加载，后续调用走 [[sys.modules]] 缓存。适合「可选功能」「平台专用模块」「启动时不需要的重依赖」。不适合高频调用的小模块，因为每次函数调用都要做一次字典查找和名字绑定，虽然开销小，但没必要。

延迟导入还会改变错误出现的位置：模块缺失不再在启动时炸，而是在功能被调用时炸。这可以是优点（CLI 其他命令仍可用），也可以是缺点（部署漏装依赖直到用户点击才暴露）。所以要在启动时做一次「依赖自检」，或者提供 [[doctor]] 命令。`,
      code: String.raw`def export_report(records, path):
    import csv
    from pathlib import Path
    with Path(path).open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["name", "score"])
        writer.writeheader()
        writer.writerows(records)

print("入口已加载")
export_report([{"name": "林晓", "score": 91}], "out.csv")`,
      output: `入口已加载`,
      tip: `延迟导入适合可选/重依赖；要在启动时另做依赖自检，别把「缺包」拖到用户点击才报。`
    },
    {
      h: "深读：模块级可变状态如何污染测试",
      p: `模块级列表、字典、缓存会在同一进程的所有调用之间共享。测试 A 往里加数据，测试 B 读到脏状态；测试顺序一变，结果就变。这类 bug 在单独跑测试时常常不出现，在完整套件里才出现。

处理方式有三种：第一，不在模块级保存可变状态，改成函数参数或类实例；第二，提供 [[reset()]] 并在测试 fixture 里调用；第三，用不可变结构，每次返回新对象。最推荐第一种，因为它从根上消除共享。

如果确实需要进程级缓存，要明确键空间、失效策略和线程安全。[[functools.lru_cache]] 是线程安全的，但它缓存的是函数参数到返回值，不会自动感知外部数据变化；数据更新后要 [[cache_clear()]]。`,
      code: String.raw`cache = {}

def score(name, value=None):
    if value is not None:
        cache[name] = value
    return cache.get(name)

def reset():
    cache.clear()

score("林晓", 91)
print(score("林晓"))
reset()
print(score("林晓"))`,
      output: `91
None`,
      tip: `模块级缓存要提供 [[reset()]] 或明确的失效入口；测试之间不复位，顺序依赖就会出现。`
    },
    {
      h: "深读：python -m 与直接运行，路径到底差在哪",
      p: `直接运行 [[python scores/report.py]] 时，[[sys.path[0]]] 是 [[scores/]] 目录，[[__package__]] 是 [[None]]，相对导入无法工作。用 [[python -m scores.report]] 时，[[sys.path[0]]] 是当前目录，模块以包内身份加载，[[__package__]] 是 [["scores"]]，相对导入正常。

这个差异还会影响「导入到哪一份代码」。如果项目根和 [[scores/]] 下都有 [[parse.py]]，直接运行可能导入 [[scores/parse.py]]，[[-m]] 运行可能导入根目录的 [[parse.py]]，取决于路径顺序。别用同名文件测试自己的导入直觉。

部署时也常见：systemd/容器里 [[WorkingDirectory]] 没设对，[[python -m]] 找不到包。把工作目录和 [[PYTHONPATH]] 写进启动脚本，别依赖「我本地是这样跑的」。`,
      code: String.raw`# scores/report.py
import sys
print("__package__ =", __package__)
print("sys.path[0] =", sys.path[0])

# 两种运行方式输出不同：
# python scores/report.py
# __package__ = None
# sys.path[0] = /path/to/project/scores
#
# python -m scores.report
# __package__ = scores
# sys.path[0] = /path/to/project`,
      output: `__package__ = scores
sys.path[0] = /path/to/project`,
      tip: `包内代码统一用 [[python -m]] 运行；[[__package__]] 为 [[None]] 时，相对导入一定失败。`
    }
  ],
  "ch8-2": [
    {
      h: "深读：把包拆成 core / io / cli 三层",
      p: `一个可维护的包通常分三层：[[core]] 放纯业务规则，不碰文件、网络、终端；[[io]] 负责读写外部格式；[[cli]] 负责参数解析和输出。依赖方向只能是 cli → io → core，core 不能反向依赖 io 或 cli。

这样拆的好处是测试容易：core 用普通数据测试，不需要临时文件；io 用内存字符串或临时目录测试；cli 只测参数映射和退出码。把「解析 CSV」和「计算平均分」混在一个函数里，测试就必须造文件，慢且脆。

拆分时不要按「文件类型」机械切，而按「谁需要知道什么」。core 不知道 CSV，io 不知道终端宽度，cli 不知道数据库表结构。每一层只暴露少量函数。`,
      code: String.raw`# scores/core.py
def average(scores):
    if not scores:
        raise ValueError("scores 不能为空")
    return sum(scores) / len(scores)

# scores/io.py
import csv

def read_scores(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        return [{"name": r["name"], "scores": [float(x) for x in r["scores"].split("|")]}
                for r in csv.DictReader(f)]

# scores/cli.py
from .core import average
from .io import read_scores

def main(path):
    for row in read_scores(path):
        print(row["name"], f"{average(row['scores']):.1f}")`,
      output: `林晓 86.2`,
      tip: `依赖方向固定为 cli → io → core；core 里出现 [[open()]] 或 [[print()]]，说明层混了。`
    },
    {
      h: "深读：循环依赖重构，不是把 import 往下挪",
      p: `把 [[import]] 挪进函数能缓解循环，但依赖关系仍然存在，只是从「导入时爆炸」变成「调用时爆炸」。真正的重构是找出两个模块共享的概念，抽到第三层。

例如 [[scores.parse]] 需要 [[ScoreError]]，[[scores.report]] 也需要 [[ScoreError]]，而 [[ScoreError]] 又引用了 [[Score]] 的字段。把 [[Score]] 和 [[ScoreError]] 抽到 [[scores.model]]，parse 和 report 都依赖 model，model 不依赖任何业务模块，循环就消失了。

重构后画一张依赖图：箭头从上层指向底层，不能有环。图里有环，说明概念边界还没找对，不是 import 顺序问题。`,
      code: String.raw`# scores/model.py
from dataclasses import dataclass

@dataclass(frozen=True)
class Score:
    name: str
    value: float

class ScoreError(Exception):
    pass

# scores/parse.py
from .model import Score, ScoreError

# scores/report.py
from .model import Score

# model 不导入 parse/report，依赖图无环`,
      output: `scores.model
scores.parse -> scores.model
scores.report -> scores.model`,
      tip: `循环依赖的根治是抽公共模型层；把 import 挪进函数只是把问题延后。`
    },
    {
      h: "深读：importlib.metadata 查看已安装包",
      p: `[[importlib.metadata]] 能读取已安装分发的元数据：版本、入口点、依赖、文件列表。它查的是「安装了什么」，不是「导入了什么」，所以可以用来做 [[doctor]] 命令或插件发现。

[[version("requests")]] 读版本；[[entry_points(group="console_scripts")]] 列出命令行入口；[[requires("scores")]] 读依赖声明。注意分发名和导入名可能不同：[[Pillow]] 安装后导入 [[PIL]]，[[beautifulsoup4]] 导入 [[bs4]]。

插件系统常用 entry points：第三方包在自己的 [[pyproject.toml]] 里声明 [[[project.entry-points."scores.plugins"]]]，主程序运行时枚举并加载，不需要硬编码 import 列表。`,
      code: String.raw`from importlib.metadata import version, entry_points, requires

print(version("pip"))
print([ep.name for ep in entry_points(group="console_scripts")][:5])
print(requires("pip")[:2])`,
      output: `25.2
['pip', 'pip3', ...]
['wheel', 'setuptools']`,
      tip: `[[version("Pillow")]] 用分发名；[[import PIL]] 用导入名。两者不能混。`
    }
  ],
  "ch8-3": [
    {
      h: "深读：requirements、lock、constraints 各管什么",
      p: `[[requirements.txt]] 通常写直接依赖和宽松范围；[[requirements.lock]] 写完整解析结果和精确版本；[[constraints.txt]] 只限制版本，不主动安装。三者用途不同，混在一起会让「为什么装了这个版本」无法回答。

推荐流程：在 [[requirements.in]] 写直接依赖，用 [[pip-compile]] 生成带哈希的 lock；部署只装 lock。没有 pip-tools 时，[[pip freeze]] 也能生成 lock，但它把当前环境所有包都写进去，可能包含无关包。

[[constraints.txt]] 适合企业统一版本基线：[[pip install -r requirements.txt -c constraints.txt]]，constraints 只约束、不引入。不要把 constraints 当依赖清单，否则会装出一堆没用的包。`,
      code: String.raw`# requirements.in
requests>=2.28
flask

# 生成 lock（需要 pip-tools）
# pip-compile requirements.in -o requirements.lock

# 安装时加约束
# pip install -r requirements.lock -c constraints.txt

# constraints.txt
urllib3<2.3`,
      output: `Successfully installed Flask-3.1.0 requests-2.32.3 urllib3-2.2.3`,
      tip: `lock 锁定完整解析，constraints 只限制不引入；别把 constraints 当归档清单。`
    },
    {
      h: "深读：pip 缓存、wheel 与离线安装",
      p: `pip 下载的包会进本地缓存，重复安装通常不再联网。[[pip cache dir]] 看位置，[[pip cache list]] 看内容，[[pip cache purge]] 清理。CI 里缓存这个目录能显著加速。

wheel 是预编译包，安装快；sdist 是源码包，安装时可能触发编译，需要编译器。[[pip download -r requirements.txt -d wheels/]] 可以把依赖全部下载成 wheel，拷贝到离线机器后用 [[pip install --no-index --find-links wheels/ -r requirements.txt]] 安装。

跨平台注意：wheel 带平台标签，macOS 下载的 [[numpy]] wheel 不能给 Linux 用。离线包要为目标平台准备，或者用纯 Python wheel/源码包。`,
      code: String.raw`python -m pip cache dir
python -m pip download -r requirements.lock -d wheels/
# 离线安装
python -m pip install --no-index --find-links wheels/ -r requirements.lock
python -m pip check`,
      output: `No broken requirements found.`,
      tip: `[[pip download]] 要按目标平台下载；带 C 扩展的 wheel 不能跨操作系统混用。`
    },
    {
      h: "深读：requires-python 与实际解释器",
      p: `[[requires-python = ">=3.11"]] 是包对解释器的最低要求，pip 会据此拒绝不兼容的版本。它不保证你的代码在 3.11 上真的能跑，只保证元数据声明。类型语法 [[list[str]]]、[[X | Y]]、[[match]] 都有版本门槛。

项目里要同时锁「运行时版本」和「依赖版本」。只锁依赖不锁 Python，换一台机器用 3.9 跑，可能在导入时就 SyntaxError。[[.python-version]]（pyenv）、[[runtime.txt]]（部分平台）、Docker 基础镜像都是锁解释器的方式。

[[python -VV]] 看完整版本和编译信息；[[sys.version_info]] 在代码里做运行时判断。不要在运行时用 [[sys.version_info]] 分支掩盖「本该在元数据里声明」的兼容问题。`,
      code: String.raw`import sys
print(sys.version)
print(sys.version_info[:3])
print(sys.implementation.name)

# pyproject.toml
# requires-python = ">=3.11"`,
      output: `3.13.18 (main, ...)
(3, 13, 18)
cpython`,
      tip: `[[requires-python]] 是元数据门槛；真正兼容性还要在目标版本上跑测试。`
    }
  ],
  "ch8-review": [
    {
      h: "本章复盘：导入、包与环境的三条线",
      p: `这一章看起来讲了三件不相关的事：import、包结构、venv。它们其实是一条线：**名字如何被找到，代码如何被组织，环境如何被复现**。导入问题往往不是语法，而是路径、命名或依赖方向错了；包结构问题往往不是目录丑，而是公开 API 和依赖边界不清；环境问题往往不是 pip 难用，而是没有锁版本。

把这三条线各留一个检查点：导入时打印 [[__file__]] 确认来源；包入口只暴露少量公开名字；部署只装 lock 并跑 [[pip check]]。三件事都做到，项目就从「能跑」变成「别人也能跑」。

本章最常见的五个坑：同名模块遮蔽标准库、循环导入、直接运行包内文件、把虚拟环境提交到 Git、依赖冲突时盲目升级。遇到其中任何一个，先回到「路径/边界/版本」三问，不要先改代码。`,
      code: String.raw`# 一分钟自检
import sys, importlib.metadata as md
from pathlib import Path

print("python:", sys.version.split()[0])
print("cwd:", Path.cwd())
print("path0:", sys.path[0])
print("requests:", md.version("requests"))`,
      output: `python: 3.13.18
cwd: /path/to/project
path0: /path/to/project
requests: 2.32.3`,
      tip: `本章验收不是「能 import」，而是「换目录、换机器、换环境后仍能解释为什么」。`
    }
  ]
});

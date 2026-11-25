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

  add("ch8-1", [{
    h: "工程深化：把 import 的副作用关进笼子",
    p: `上一节讲清了 import 只执行一次、模块级代码会在第一次导入时运行。真实项目里，这条规则最容易被两个东西破坏：模块顶层读配置、模块顶层连数据库。前者让测试一导入就报环境变量缺失，后者让本来只想用一个纯函数的脚本莫名连上生产库。解决办法不是「不要写模块顶层代码」这么一句口号，而是把副作用集中到明确的入口。

一个可维护的模块应该分成三层：纯定义（常量、类、函数）、惰性资源（第一次调用时才创建）、以及显式启动（[[main()]] 或应用工厂）。模块顶层只做纯定义；需要文件、网络、数据库的对象放进函数，或者放进带缓存的工厂。读取环境变量也应在工厂里做，而不是在 import 时做。这样测试可以导入模块而不触碰外部世界，部署时才在入口处校验配置。

延迟导入常被误解为「偷懒」。它的真正价值是控制启动成本和隔离可选依赖：命令行只做 --help 时，不必加载 pandas；没安装 matplotlib 时，报表仍能输出 Markdown。实现上用函数内 [[importlib.import_module("pandas")]] 或函数内 [[import pandas]]，并把 ImportError 转成清楚的安装提示。不要让一个可选依赖在模块顶层失败，拖垮整个程序。

还要区分「第一次导入」和「重复导入」的成本。[[sys.modules]] 命中时几乎不执行模块体，但属性查找、包初始化、插件扫描仍可能很贵。可以用 [[python -X importtime -c "import scores"]] 看每个模块的累计耗时，先找最大的那几项，再决定是否延迟。不要凭感觉把 import 到处挪，挪错了只会把错误推迟到运行时。

插件注册也常被写成 import 副作用：包一导入就扫描目录、注册所有子类。更稳的做法是显式注册表加惰性发现：核心只暴露 [[register()]]，插件在自己的入口调用；需要自动发现时，用 [[importlib.metadata.entry_points()]] 或 [[pkgutil.iter_modules()]] 在应用启动阶段统一加载。这样依赖方向清楚，测试也能只注册假插件。

最后给一条验收标准：在一个干净的解释器里执行 [[import scores]]，不应该产生网络请求、不应该创建文件、不应该要求环境变量；所有外部依赖都应在调用具体功能时才出现。做不到这一点，模块的导入边界就还没有设计好。`,
    code: String.raw`# scores/config.py：顶层不读环境变量
import os
from dataclasses import dataclass

@dataclass(frozen=True)
class Settings:
    db_url: str
    timeout: float = 3.0

def load_settings() -> Settings:
    url = os.environ.get("SCORES_DB_URL")
    if not url:
        raise RuntimeError("SCORES_DB_URL is required")
    return Settings(db_url=url, timeout=float(os.environ.get("SCORES_TIMEOUT", "3")))

# scores/report.py：可选依赖延迟加载
def render_png(rows, path):
    try:
        import matplotlib.pyplot as plt
    except ImportError as exc:
        raise RuntimeError("install scores[plot] to render PNG") from exc
    fig, ax = plt.subplots()
    ax.plot([r["date"] for r in rows], [r["seconds"] for r in rows])
    fig.savefig(path)
    plt.close(fig)

# 验收：python -c "import scores" 应无副作用
# 启动成本：python -X importtime -c "import scores"`,
    output: `$ python -X importtime -c "import scores"
import time: self [us] | cumulative | imported package
...
# 只观察，不把 importtime 输出当性能结论；
# 先找累计最大的模块，再决定是否延迟加载。`,
    tip: `模块顶层只放纯定义；配置读取、网络连接、可选依赖都放进函数或应用工厂。`
  }]);

  add("ch8-2", [{
    h: "工程深化：包资源、公开 API 与兼容边界",
    p: `包做起来以后，真正容易翻车的不是「能不能 import」，而是「装到别的机器上还能不能找到文件」。很多代码用 [[Path(__file__).parent / "data" / "template.txt"]] 读包内资源，在本机源码目录里一切正常，打成 wheel 后路径变了，或者被 zip 导入时根本没有真实文件。包资源要用 [[importlib.resources]] 读取，不要靠 [[__file__]] 猜目录。

[[importlib.resources.files("scores") / "data" / "template.txt"]] 返回一个 Traversable，可以 [[read_text()]]、[[open()]]，也能在 zip 包中工作。需要把资源复制到临时目录给外部程序用时，用 [[as_file()]] 包一层，并在 with 块内使用。资源目录要写进构建配置的 package-data，否则 wheel 里不会带；这一步经常被漏掉，结果是「本地能跑、安装后报 FileNotFoundError」。

公开 API 要有边界。[[__all__]] 不是访问控制，但它能告诉 [[from scores import *]] 和文档工具「哪些名字是给外部用的」。更重要的是团队约定：以单下划线开头的是内部实现，不以单下划线开头的才承诺兼容。重构时先改内部名字，公开名字保留别名或弃用期。不要把所有 helper 都塞进 [[__init__.py]]，那会让包的导入变慢，也会让外部代码依赖本不该依赖的东西。

包的 [[__init__.py]] 应该轻：版本号、公开名字、极少量初始化。重逻辑放到子模块，调用方按需导入。一个常见反模式是把数据库连接、日志配置、命令行解析都写进 [[__init__.py]]，结果任何子模块导入都会触发一遍。判断标准很简单：导入包只应该得到名字和元数据，不应该产生外部副作用。

兼容性上，给公开函数加参数时优先加「仅限关键字」参数并给默认值；不要改变已有参数的位置和含义。删除公开名字前先发弃用警告，至少跨一个小版本。类型提示也要跟着改，否则调用方的检查器会先炸。版本号、[[__all__]]、文档三处要保持一致，不能代码里删了、文档还留着。

最后做一个安装后验收：在一个干净 venv 里 [[pip install .]]，然后执行 [[python -c "import scores; print(scores.__version__)"]]，再调用一次读取模板的功能。源码目录能跑不算数，wheel 安装后能跑才算包真的完整。`,
    code: String.raw`# scores/resources.py
from importlib import resources
from importlib.resources import as_file

def read_template() -> str:
    return (resources.files("scores") / "data" / "report.md").read_text(encoding="utf-8")

def template_path():
    return as_file(resources.files("scores") / "data" / "report.md")

# pyproject.toml
# [tool.setuptools.package-data]
# scores = ["data/*.md", "py.typed"]

# 干净环境验收
# python -m venv /tmp/verify
# /tmp/verify/bin/pip install dist/scores-0.3.0-py3-none-any.whl
# /tmp/verify/bin/python -c "from scores.resources import read_template; print(read_template()[:20])"`,
    output: `# 源码目录和 wheel 安装后都应输出同样的模板开头；
# 如果只在源码目录成功，优先检查 package-data 与 __file__ 用法。`,
    tip: `包内文件用 importlib.resources 读，不用 __file__ 拼路径；构建配置要带 package-data。`
  }]);

  add("ch8-3", [{
    h: "工程深化：可复现环境不是「pip freeze 一下」",
    p: `[[pip freeze > requirements.txt]] 看起来能得到一份完整清单，但它记录的是「当前环境里有什么」，不是「这个项目需要什么」。开发机上的 Jupyter、调试器、其他项目的依赖都会混进去；换一台机器安装时，依赖树可能完全不同。可复现环境要区分「直接依赖」和「锁定结果」，还要记录 Python 版本与索引来源。

直接依赖写在 [[pyproject.toml]] 的 [[project.dependencies]]，只写你真正 import 的包，并给出合理范围，例如 [[requests>=2.31,<3]]。锁定文件记录解析后的精确版本与哈希，常用工具是 pip-tools、uv、Poetry 或 PDM。[[requirements.in]] 写直接依赖，[[pip-compile]] 生成 [[requirements.txt]]；或者用 [[uv lock]] 生成 [[uv.lock]]。不要把两者混成一个文件。

[[constraints.txt]] 是另一层：它只限制版本，不主动安装包，适合让多个项目共享一组安全版本上限。比如公司要求 [[urllib3<2.3]]，就把约束传给 pip，而不是在每个项目里重复写。约束和锁文件不要互相替代：锁文件保证「这一套版本能一起工作」，约束保证「不要越过某个红线」。

Python 版本本身也要锁。[[requires-python = ">=3.11,<3.14"]] 只是声明兼容范围，CI 要真的在 3.11、3.12、3.13 上跑。生产环境还要固定到具体小版本，例如 3.13.2，避免半年后补丁升级带来行为差异。解释器、系统库、编译工具链都会影响 wheel 选择，不能只锁 pip 包。

离线安装要提前准备 wheel。[[pip download -r requirements.txt -d wheels/]] 把依赖下载成 wheel，再用 [[pip install --no-index --find-links wheels/ -r requirements.txt]] 安装。注意平台标签：在 macOS 下载的 wheel 不能直接给 Linux 用；要为目标平台下载 [[--only-binary=:all:]] 并检查 [[manylinux]] 版本。纯 Python 包通常跨平台，带 C 扩展的包不是。

验收命令要能重复执行：删除 venv、按锁文件安装、跑测试、启动 CLI，四步都过才算环境可复现。[[pip check]] 只能发现元数据冲突，发现不了代码层面的不兼容；所以还要有最小集成测试。把「安装成功」当成「环境正确」是另一个常见误区。

最后一条纪律：锁文件必须提交到仓库，依赖变更必须和锁文件变更在同一个提交里。只改 pyproject 不更新锁，CI 会装到旧版本；只改锁不解释原因，review 时没人知道为什么升级。锁文件是构建产物，也是审计记录。`,
    code: String.raw`# requirements.in：只写直接依赖
requests>=2.31,<3
pandas>=2.2,<3

# 生成锁定文件（pip-tools）
pip-compile requirements.in -o requirements.txt --generate-hashes

# 安装锁定版本
python -m pip install -r requirements.txt

# 约束文件：只限版本，不主动安装
# constraints.txt
urllib3<2.3
python -m pip install -r requirements.txt -c constraints.txt

# 离线 wheel
python -m pip download -r requirements.txt -d wheels/ --only-binary=:all:
python -m pip install --no-index --find-links wheels/ -r requirements.txt
python -m pip check`,
    output: `# 可复现验收：
# 1) 删除旧 venv  2) 按锁文件安装  3) 跑 pytest  4) 跑 scores --help
# 四步全过，才把这份 lock 交给 CI 和生产。`,
    tip: `直接依赖写 pyproject，精确版本写锁文件，安全上限写 constraints；三者不要混。`
  }]);
})();

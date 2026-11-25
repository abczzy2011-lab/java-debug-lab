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

  add("ch11-1", [{
    h: "加练：把抽象基类减到最少",
    p: `给一个已有项目做接口评审，最常见的问题是「抽象太多」。每个基类都有七八个抽象方法，子类实现一半，另一半用 [[pass]] 占位，最后抽象基类既不约束行为，又增加阅读负担。练习目标：把一个臃肿的 [[Exporter]] 抽象减到两个真正必需的成员。

先列出所有抽象方法，逐个问三个问题：所有子类都必须实现吗？不实现能不能有合理默认？这个能力是核心还是可选？如果答案是否，就改成普通方法、类属性或独立函数。抽象只保留「没有它就无法工作」的那一个或两个。

例如 [[Exporter]] 只需要 [[name]] 和 [[export(rows, path)]] 两个抽象成员；[[suffix]] 可以按 name 推导，[[description]] 可以默认空，[[validate]] 可以默认通过。子类只实现两个，代码量减半，新增插件也更快。

抽象减少后，用 Protocol 做能力描述可能更合适。如果调用方只需要「有 export 方法」，不需要继承、不需要注册，就用 [[Protocol]]；如果必须阻止误用、必须登记子类，才用 ABC。两者不要同时堆。

给每个抽象方法写一个「反例测试」：子类不实现它，实例化是否报错？如果不会，说明它不该是抽象。再写一个「最小子类测试」：只实现必需成员，能否正常工作？不能，说明抽象划分有问题。

最后检查文档：抽象基类的 docstring 要写清「子类必须实现什么、可选覆盖什么、什么时候被调用」。不要只写「导出器基类」，那对新作者没有帮助。

验收：抽象成员不超过两个；最小子类可运行；可选能力有默认；Protocol/ABC 选择有理由；反例测试通过；文档说清合同。`,
    code: String.raw`from abc import ABC, abstractmethod

class Exporter(ABC):
    name: str
    @property
    def suffix(self) -> str:
        return "." + self.name
    @abstractmethod
    def export(self, rows: list[dict], path: str) -> None: ...
    def validate(self, rows: list[dict]) -> None:
        if not rows:
            raise ValueError("empty rows")

class JsonExporter(Exporter):
    name = "json"
    def export(self, rows, path):
        import json
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(rows, fh, ensure_ascii=False)`,
    output: `# JsonExporter 只实现 name + export；
# suffix 自动 ".json"；validate 有默认；
# 漏实现 export 时实例化报 TypeError。`,
    tip: `抽象只留没有它就无法工作的成员；可选能力给默认；Protocol 适合纯能力描述；写反例测试。`
  }]);

  add("ch12-1", [{
    h: "加练：给 200 行旧脚本做类型迁移",
    p: `练习对象是一段 200 行的成绩统计脚本：全局变量、字典到处传、函数没有注解、异常靠字符串。目标不是重写，而是在两周内逐步加类型，让 mypy 从 200 条错误降到 0，同时保持行为不变。按下面顺序做，避免一次性大改。

第一周第一天：只加函数签名，不改实现。参数和返回值都写注解，[[Any]] 先允许。跑 mypy，记录错误数量；跑测试，确认行为没变。签名是合同，先让合同存在，再谈精确。

第二天：处理 [[Optional]]。所有默认 None 的参数改成 [[T | None]]，函数里显式判断。很多潜在 None 崩溃会在这一步暴露；不要用 [[assert x is not None]] 糊弄，按业务决定默认值或报错。

第三天：给字典建 TypedDict。[[row: dict]] 改成 [[Row]]，字段名拼写错误立刻暴露。外部 JSON 仍用 [[dict[str, Any]]]]，在入口转成 Row；领域函数只接收 Row。

第四天：给列表/字典补泛型参数。[[list]] 改 [[list[Row]]]，[[dict]] 改 [[dict[str, Row]]]。空容器用注解或 [[cast]]，不要让检查器推断成 Any。

第五天：处理 Any 泄漏。[[json.loads]]、第三方库返回值先用 [[reveal_type]] 看，再决定校验/转换。每个 [[cast]] 旁边加运行时检查；cast 不是验证。

第二周：开 [[disallow_untyped_defs]]，修剩余缺注解；再开 [[strict]]，处理重载、泛型、未使用 ignore。每开一个选项跑一次测试。ignore 必须带原因，数量只降不升。

最后做行为回归：同一批输入跑旧脚本和新脚本，输出逐字段比较；性能不能明显下降；异常类型/消息对调用方兼容。类型迁移的完成标准是「mypy 0 + 行为一致」，不是「注解好看」。

验收：签名全覆盖；Optional 真处理；字典有 TypedDict；容器有泛型；Any 有边界；ignore 有原因；旧新输出一致；CI 跑 mypy。`,
    code: String.raw`from typing import TypedDict, Any
import json

class Row(TypedDict):
    athlete: str
    seconds: float

def load(path: str) -> list[Row]:
    raw: Any = json.loads(open(path, encoding="utf-8").read())
    if not isinstance(raw, list):
        raise ValueError("expected a list")
    out: list[Row] = []
    for item in raw:
        if not isinstance(item, dict):
            raise ValueError("expected an object")
        out.append({"athlete": str(item["athlete"]),
                    "seconds": float(item["seconds"])})
    return out`,
    output: `# mypy: 0 errors
# 旧脚本与新脚本对同一输入输出一致
# ignore 数量：3 -> 0（每条都有原因）`,
    tip: `先签名后实现；Optional 显式处理；TypedDict 进领域；容器补泛型；Any 只在入口；cast 旁加校验。`
  }]);

  add("ch13-1", [{
    h: "加练：从空目录做一个最小可安装项目",
    p: `练习：在一个空目录里，20 分钟内做出能被 [[pip install]] 的最小包。不写业务，只验证打包链路：目录、pyproject、模块、入口、资源、wheel、干净安装。做完后，任何新项目都可以套这个骨架。

第一步建目录：[[src/demo/__init__.py]]、[[src/demo/__main__.py]]、[[tests/test_smoke.py]]、[[pyproject.toml]]、[[README.md]]。不要先写业务代码；先让空包能安装。

第二步写 pyproject：[[build-system]] 用 setuptools；[[project.name = "demo-kit"]]、[[version = "0.1.0"]]、[[requires-python >=3.11]]；[[project.scripts]] 配 [[demo = "demo.__main__:main"]]；[[packages.find where=["src"]]]。

第三步写最小入口：[[__main__.py]] 里 [[def main() -> int: print("demo ok"); return 0]]，末尾 [[raise SystemExit(main())]]。这样 [[python -m demo]] 和 [[demo]] 两个入口都可用。

第四步加资源：[[src/demo/data/hello.txt]] 写一行文字；package-data 配 [[demo = ["data/*.txt"]]]；[[__init__.py]] 用 [[importlib.resources.files("demo")]] 读取。资源是打包最容易漏的部分，先验证。

第五步构建：[[python -m build]]；[[unzip -l dist/*.whl]] 确认 [[demo/data/hello.txt]] 和 [[demo-0.1.0.dist-info]] 都在；[[twine check dist/*]] 通过。不要跳过检查直接安装。

第六步干净安装：新建 venv，[[pip install dist/*.whl]]；运行 [[demo]]、[[python -m demo]]、读取资源；再 [[pip uninstall demo-kit]]，确认卸载干净。开发环境的 editable 安装不能替代这一步。

第七步写 smoke 测试：[[subprocess]] 跑 [[python -m demo]] 断言退出码 0 和输出；测试读取资源；测试版本号来自 metadata。CI 里先 build 再装 wheel 再跑 smoke。

第八步记录骨架：把目录、pyproject、入口、资源、构建、安装六步写进 [[docs/package-skeleton.md]]。下一个项目直接复制，不再从零踩坑。

验收：空包能安装；两个入口可用；资源从 wheel 读取；twine check 通过；干净 venv 安装/卸载；smoke 测试全绿；骨架文档可复制。`,
    code: String.raw`# pyproject.toml
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "demo-kit"
version = "0.1.0"
requires-python = ">=3.11"

[project.scripts]
demo = "demo.__main__:main"

[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
demo = ["data/*.txt"]

# src/demo/__main__.py
def main() -> int:
    print("demo ok")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())`,
    output: `$ python -m build
$ unzip -l dist/demo_kit-0.1.0-py3-none-any.whl
$ python -m venv /tmp/demo && /tmp/demo/bin/pip install dist/*.whl
$ /tmp/demo/bin/demo
demo ok
$ /tmp/demo/bin/python -m demo
demo ok`,
    tip: `先空包后业务；pyproject 单份；双入口共用 main；资源先验证；build 后装 wheel；写骨架文档。`
  }]);

  add("ch14-1", [{
    h: "加练：用本地服务器验证超时、重试与流式下载",
    p: `练习目标：不依赖外网，用 [[http.server]] 起一个可控的本地服务，验证请求代码的超时、重试、429、断点续传、流式下载。这样测试稳定、快、不打扰别人，也能精确模拟异常。

服务端路由：[[/ok]] 返回 200 和小文件；[[/slow]] sleep 2 秒再返回；[[/fail]] 返回 500；[[/rate]] 第一次 429 带 [[Retry-After: 1]]，第二次 200；[[/big]] 返回 10MB 分块；[[/range]] 支持 Range，返回 206。用 [[ThreadingHTTPServer]]，避免慢请求阻塞其他测试。

客户端测试：[[timeout=(0.5, 5)]] 打 [[/slow]]，确认抛 Timeout；[[Retry]] 配 2 次打 [[/fail]]，确认最终失败；打 [[/rate]] 确认等待后成功；[[stream=True]] 打 [[/big]]，确认内存不暴涨；[[Range]] 打 [[/range]]，确认 206 和续传内容正确。

断言要精确：超时类型、重试次数、总耗时范围、下载字节数、SHA256、最终状态码。不要只断言「没抛异常」。重试测试要记录每次请求，确认真的重试了，而不是服务端一次成功。

并发测试：用 [[ThreadPoolExecutor]] 同时打 10 个 [[/slow]]，确认连接池大小和超时符合预期；观察是否有线程卡死。服务端日志能看出并发连接数。

清理：测试结束 [[server.shutdown()]]、[[server.server_close()]]、线程 join；临时文件删除。端口用 0 让系统分配，避免冲突；把实际端口传给客户端。

验收：六种路由都能触发预期行为；超时/重试/429/流式/Range 全覆盖；测试不访问外网；端口不冲突；服务端干净关闭；断言包含次数/字节/哈希。`,
    code: String.raw`from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import threading, time

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/slow":
            time.sleep(2)
        if self.path == "/fail":
            self.send_response(500); self.end_headers(); return
        if self.path == "/rate":
            if not hasattr(self.server, "hit"):
                self.server.hit = True
                self.send_response(429)
                self.send_header("Retry-After", "1"); self.end_headers(); return
        body = b"x" * 1024
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
print(server.server_address[1])
# 测试结束：server.shutdown(); server.server_close()`,
    output: `# 端口由系统分配，例如 54321
# /slow -> requests.Timeout
# /rate -> 第一次 429，等待 1s 后 200
# /big -> 流式读取，内存稳定`,
    tip: `本地路由覆盖 ok/slow/fail/rate/big/range；断言次数/字节/哈希；端口 0；shutdown+close；不访外网。`
  }]);

  add("ch15-1", [{
    h: "加练：六个 NumPy 实验看清视图与广播",
    p: `练习用六个小实验建立直觉：切片是视图、reshape 可能共享、转置是视图、广播不复制、astype 复制、原地运算影响原数组。每个实验都打印 [[shape]]、[[base]]、[[flags.owndata]]，不要只凭记忆。

实验一：[[a = np.arange(12).reshape(3,4)]]；[[b = a[:, 1]]]；改 [[b[0]]]，看 a 是否变。[[b.base is a]] 为 True 说明共享。需要独立时 [[b.copy()]]。

实验二：[[c = a.reshape(2,6)]]；[[c.base is a]] 通常 True，因为连续内存可共享。若 [[a.T.reshape(...)]] 可能复制，检查 [[flags.owndata]]。

实验三：[[d = a.T]]；[[d.base is a]] True，转置是视图；改 d 会影响 a。需要独立时 [[a.T.copy()]]。

实验四：广播 [[(3,1) + (1,4)]] 得到 (3,4)，结果 [[owndata]] True，是新数组；输入没被复制，但结果分配了内存。大数组要估算结果大小。

实验五：[[e = a.astype(np.float32)]]；[[e.base is None]]，astype 默认复制；改 e 不影响 a。若 [[copy=False]] 且 dtype 相同，可能返回原对象，要小心。

实验六：[[a += 1]] 原地改；如果 a 是别人的视图，底层原数组也变。函数里修改入参前，先问「调用方是否还需要原数据」。

把六个实验写成 pytest，断言 [[base]]、[[owndata]]、原数组值。再把结论写成 [[docs/numpy-notes.md]]：什么时候必须 copy、什么时候可以视图、广播结果多大。

验收：六个实验全通过；能解释 base/owndata；知道 astype 复制；知道原地运算风险；大数组估算内存；笔记可查。`,
    code: String.raw`import numpy as np

a = np.arange(12).reshape(3, 4)
b = a[:, 1]
print(b.base is a, b.flags.owndata)      # True False
b[0] = 99
print(a[0, 1])                            # 99

c = a.reshape(2, 6)
print(c.base is a, c.flags.owndata)      # True False
d = a.T
print(d.base is a, d.flags.owndata)      # True False
e = a.astype(np.float32)
print(e.base is None, e.flags.owndata)   # True True`,
    output: `True False
99
True False
True False
True True`,
    tip: `看 base/owndata 判断视图；切片/reshape/转置可能共享；astype 复制；广播结果新分配；原地运算慎用。`
  }]);

  add("ch16-1", [{
    h: "加练：五个实验验证文件写入的崩溃安全",
    p: `练习目标：用五个实验证明「临时文件 + fsync + replace」比直接覆盖安全。每个实验都模拟失败：写一半抛异常、进程被杀、磁盘满、目标被占用、并发写。观察目标文件是否完整。

实验一：直接 [[open(target,"w")]] 写一半抛异常，目标文件被截断，旧内容丢失。这是反例，先看清问题。

实验二：写同目录临时文件，写一半抛异常，finally 删除临时文件；目标文件完全没动。这是最小修复。

实验三：写临时文件后 [[flush + fsync]]，再 [[os.replace]]；模拟 replace 前 kill，目标仍是旧版；replace 后 kill，目标是完整新版。原子替换保证「要么旧、要么新」。

实验四：两个进程同时写同一目标，各自临时文件 + replace；最终目标是其中一个完整版本，不会混合。若需要串行，加文件锁；不加锁时至少不会半截。

实验五：目标文件被另一个程序占用（Windows），[[os.replace]] 抛 PermissionError；捕获后提示关闭文件，临时文件清理。不要假设 replace 永远成功。

再补一个磁盘满实验：写入时抛 OSError，临时文件可能部分存在；finally 清理，目标不变。磁盘满时 [[fsync]] 也可能失败，必须检查。

把这些实验写成脚本，用子进程模拟 kill；用 [[os.stat]] 检查大小；用哈希检查内容。结论写进 [[docs/atomic-write.md]]：什么时候需要 fsync、什么时候需要目录 fsync、Windows 差异。

验收：反例复现截断；临时文件方案保住旧版；replace 前后状态正确；并发不混合；占用有清楚错误；磁盘满清理；文档可查。`,
    code: String.raw`from pathlib import Path
import os, tempfile

def atomic_write(path: Path, text: str, fail=False) -> None:
    fd, tmp_name = tempfile.mkstemp(dir=path.parent, prefix=".tmp-")
    tmp = Path(tmp_name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(text)
            if fail:
                raise RuntimeError("simulated failure")
            fh.flush(); os.fsync(fh.fileno())
        os.replace(tmp, path)
    finally:
        if tmp.exists():
            tmp.unlink()

target = Path("data.txt")
target.write_text("old", encoding="utf-8")
try:
    atomic_write(target, "new", fail=True)
except RuntimeError:
    pass
print(target.read_text(encoding="utf-8"))  # old`,
    output: `old
# 失败写入没有破坏旧文件；
# 成功后目标为完整 new。`,
    tip: `先看直接覆盖的反例；临时文件+fsync+replace；finally 清理；并发不混合；Windows 占用要捕获。`
  }]);

  add("ch17-2", [{
    h: "加练：进程池的 pickle 边界实验",
    p: `练习用五个实验看清进程池的限制：模块顶层函数可 pickle、lambda 不可、闭包不可、打开的文件不可、自定义异常要可导入。每个实验都实际提交任务，观察错误发生在提交时还是执行时。

实验一：顶层函数 [[def square(x): return x*x]]，[[pool.submit(square, 3)]] 正常。确认 [[square.__module__]] 是当前模块，子进程能导入。

实验二：[[pool.submit(lambda x: x*x, 3)]] 抛 [[PicklingError]] 或 [[AttributeError: Can't pickle local object]]。lambda 没有模块级名字，子进程找不到。

实验三：闭包 [[def make(n): return lambda x: x+n]] 同样不可 pickle。修复是把 n 作为参数，用 [[functools.partial(square, n)]] 或顶层函数 + 参数元组。

实验四：提交一个打开的文件对象/数据库连接，报不可 pickle。修复是在子进程内部打开资源，不要把句柄传过去；需要共享数据用路径/共享内存。

实验五：自定义异常在 [[__main__]] 里定义，子进程抛回主进程时可能反序列化失败。修复是把异常类放模块顶层，或转成 [[(type_name, message)]] 再抛。

再实验：[[chunksize]] 对性能的影响。1000 个小任务，chunksize=1 慢，chunksize=20 快；任务太重时 chunksize 太大会负载不均。记录耗时，不要凭感觉。

最后实验：[[max_workers]] 与内存。每个进程加载 pandas 占 200MB，开 8 个就 1.6GB；按内存定上限。用 [[psutil]] 观察 RSS。

验收：五个实验都能复现错误；知道怎么修；任务粒度有耗时对比；并发上限有内存依据；异常能回传。`,
    code: String.raw`from concurrent.futures import ProcessPoolExecutor
from functools import partial
import pickle

def square(x: int) -> int:
    return x * x

def add(n: int, x: int) -> int:
    return x + n

if __name__ == "__main__":
    print(pickle.dumps(square))
    with ProcessPoolExecutor(max_workers=2) as pool:
        print(list(pool.map(square, range(5))))
        print(list(pool.map(partial(add, 10), range(5))))
        try:
            pool.submit(lambda x: x, 1).result()
        except Exception as exc:
            print("lambda failed:", type(exc).__name__)`,
    output: `b'...'
[0, 1, 4, 9, 16]
[10, 11, 12, 13, 14]
lambda failed: PicklingError`,
    tip: `工作函数放模块顶层；lambda/闭包不可 pickle；资源在子进程内打开；异常类顶层可导入；按内存定并发。`
  }]);
})();

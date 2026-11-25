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

  add("ch11-3", [{
    h: "章节复盘：继承与对象模型的故障检查表",
    p: `第 11 章的概念多，真正写项目时错误往往集中在几个固定位置。下面用六个真实故障做检查表：抽象方法漏实现、多继承 MRO 冲突、描述符状态共享、缓存不失效、eq/hash 不一致、运算符修改原对象。每个故障都给出现象、根因、修复和回归测试，遇到类似问题时按表排查。

故障一：子类实例化时报 [[TypeError: Can't instantiate abstract class]]。根因通常是子类只实现了部分抽象方法，或者抽象方法名拼错。检查 [[Cls.__abstractmethods__]]，看还缺哪个；修复是实现或删掉不必要的抽象。回归测试要实例化每个子类，不能只测一个。

故障二：多继承报 [[Cannot create a consistent method resolution order]]。根因是 C3 找不到满足约束的顺序，常见于两个父类互相继承或声明顺序矛盾。检查 [[Cls.__mro__]] 和继承图；修复是减少层级、改用组合，或调整基类顺序。回归测试要打印 MRO 并确认关键初始化都被调用。

故障三：改一个实例的描述符值，另一个实例也变了。根因是描述符对象把状态存在自己身上，而描述符是类级共享的。检查 [[__set__]] 是否写 [[instance.__dict__]]；修复是按实例存，或用 [[WeakKeyDictionary]]。回归测试创建两个实例，改一个，断言另一个不变。

故障四：修改字段后，[[cached_property]] 还是旧值。根因是缓存不会自动失效。检查所有依赖字段的写入口；修复是集中清理缓存，或在 [[__setattr__]] 里失效。回归测试覆盖每个依赖字段的修改。

故障五：两个相等对象放进 set 变成两个。根因是自定义 [[__eq__]] 后没有 [[__hash__]]，或者 hash 用了可变字段。检查 eq/hash 是否一致；修复是按不可变 id 做 hash，或改用 frozen dataclass。回归测试用 set/dict 验证。

故障六：[[a + b]] 之后原对象 a 被改了。根因是 [[__add__]] 原地修改并返回 self。检查运算符实现；修复是返回新对象，[[__iadd__]] 才原地改。回归测试比较运算前后的原对象。

除了这六个，还有两个高频问题：[[super()]] 在协作式多继承里被跳过，导致父类初始化没执行；[[__getitem__]] 收到 slice 却当整数处理，切片报错。前者检查每个类的 [[__init__]] 是否调用 super，后者检查 [[isinstance(key, slice)]]。

把检查表放进项目的 [[docs/object-model.md]]，每次新增基类/描述符/运算符时过一遍。不要等到线上出现「对象行为诡异」再回头查；这些问题在单元测试里都能提前暴露。测试要针对行为，不要只断言「方法存在」。

验收：六个故障各有一个最小复现和一个回归测试；MRO 图可打印；描述符状态按实例隔离；缓存失效覆盖所有写入口；eq/hash 在 set/dict 中正确；运算符不修改原对象。`,
    code: String.raw`class BadDescriptor:
    def __init__(self): self.value = 0
    def __get__(self, obj, owner=None): return self.value
    def __set__(self, obj, value): self.value = value

class GoodDescriptor:
    def __set_name__(self, owner, name): self.name = "_" + name
    def __get__(self, obj, owner=None):
        return getattr(obj, self.name) if obj else self
    def __set__(self, obj, value): setattr(obj, self.name, value)

class A:
    bad = BadDescriptor()
    good = GoodDescriptor()
    def __init__(self, v): self.good = v

a1, a2 = A(1), A(2)
a1.bad = 9
print(a1.bad, a2.bad)      # 9 9，共享状态
print(a1.good, a2.good)    # 1 2，按实例隔离`,
    output: `9 9
1 2`,
    tip: `六个故障各有最小复现；描述符状态按实例；缓存失效覆盖写入口；eq/hash 用 set 验证；运算符不改原对象。`
  }]);

  add("ch12-3", [{
    h: "章节复盘：类型与测试从红到绿的十个错误",
    p: `给老项目加类型和测试，第一周通常会被一堆错误淹没。下面列出十个高频错误、根因和修法，按这个顺序处理，能避免「改一处崩三处」。原则是：先让 CI 能跑，再逐步收紧；不要一次开满所有严格选项。

错误一：[[Missing return type annotation]]。根因是函数没写返回值；修法是补 [[-> None]] 或具体类型。[[__init__]] 必须写 [[-> None]]，否则 strict 不过。批量修之前先确认函数真的没有返回值，不要一律写 Any。

错误二：[[Implicit Optional]]。参数默认 [[None]] 但注解是 [[str]]；修法是 [[str | None]]。这不只是类型问题，调用方可能真的传 None，函数里要处理。不要用 [[str = None]] 的旧写法。

错误三：[[Need type annotation for "x"]]。空 list/dict 推断不出类型；修法是 [[x: list[str] = []]]。不要在函数里写 [[x = []]] 然后指望检查器猜；它猜不到。

错误四：[[Argument 1 has incompatible type]]。常见于把 [[str]] 传给 [[Path]]，或把 [[int]] 传给 [[float]]。修法是调用处转换，或在函数签名用联合类型。不要用 [[# type: ignore]] 掩盖，除非第三方库类型确实错。

错误五：[[Returning Any from function declared to return ...]]。根因是 [[json.loads]] 返回 Any，直接返回；修法是解析后校验/转换，或显式 [[cast]] 并加运行时检查。cast 不是校验，别把它当安全网。

错误六：测试里 [[fixture 'x' not found]]。根因是 fixture 定义在别的模块/类里，没导入；修法是放 [[conftest.py]] 或显式 import。不要在每个测试文件复制 fixture。

错误七：[[MonkeyPatch]] 没生效。根因是 patch 了定义处而不是使用处；修法是 patch [[module.under_test.func]]。导入方式决定 patch 目标，先看 [[from ... import ...]] 还是 [[import ...]]。

错误八：测试顺序依赖。根因是共享全局状态/数据库；修法是每个测试独立 fixture、临时目录、事务回滚。[[pytest -p no:randomly]] 能复现顺序问题，但修复靠隔离。

错误九：覆盖率 100% 但改错代码测试不红。根因是断言太弱；修法是加行为断言、边界、变异测试。不要用「调用过」当断言。

错误十：CI 本地过、远端挂。根因是路径/时区/编码/Python 版本差异；修法是固定环境、相对路径、显式编码、矩阵测试。把 CI 命令写进 README，本地先跑一遍。

处理顺序建议：先修语法/导入类错误，再修 Optional/泛型，再处理 Any 泄漏，最后开 strict。每修一类跑一次测试，确保行为没变。类型检查是护栏，不是重写理由。

验收：mypy 0 错误；ignore 有原因和上限；测试可单独运行；fixture 不重复；patch 目标正确；覆盖率与变异结果合理；CI 矩阵全绿。`,
    code: String.raw`from pathlib import Path
from typing import Any

def load(path: str | Path) -> dict[str, Any]:
    import json
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("top-level JSON must be an object")
    return data

# pytest fixture 放 conftest.py
# @pytest.fixture
# def rows():
#     return [{"athlete": "林晓", "seconds": 12.3}]

# monkeypatch 使用处
# monkeypatch.setattr("scores.io.fetch", fake_fetch)`,
    output: `# mypy src -> Success
# pytest -q -> 10 passed
# 每个 ignore 带原因：score_cache 第三方类型缺失 # type: ignore[import-untyped]`,
    tip: `先跑起来再收紧；Optional 要真处理；Any 不直接返回；fixture 放 conftest；patch 使用处；CI 命令本地可复现。`
  }]);

  add("ch13-3", [{
    h: "章节复盘：打包发布的安装失败案例库",
    p: `发布后最常见的问题不是代码逻辑，而是「用户装不上/装了跑不起来」。下面按症状分类：找不到模块、缺资源、版本冲突、入口不存在、平台不匹配、权限/网络失败。每条给排查命令和修复，不要凭报错猜。

症状一：[[ModuleNotFoundError: No module named 'scores']]。先确认装的是哪个包：[[pip show scores-kit]]、[[python -c "import sys; print(sys.path)"]]。常见原因是包名和导入名不一致、装到了另一个 Python、或 [[src]] 布局没打包。修复是检查 [[packages.find]] 和 [[project.name]]。

症状二：安装成功但 [[FileNotFoundError: report.md]]。根因是资源没进 wheel；用 [[unzip -l dist/*.whl | grep report]] 确认。修复是 package-data 加 [[data/*.md]]，并用 [[importlib.resources]] 读取。源码目录能读不代表 wheel 有。

症状三：[[pip install]] 报依赖冲突。看 [[pip check]] 和完整错误，常见是上限写得太死或两个包要求不同版本。修复是放宽范围、升级依赖，或用 [[constraints.txt]] 统一。不要用 [[--force-reinstall]] 掩盖。

症状四：命令 [[scores]] 不存在。根因是 [[project.scripts]] 没配、wheel 没装、或入口函数签名不对。检查 [[which scores]]、[[pip show -f scores-kit]]；入口必须是 [[module:function]]，函数返回 int 或 None。

症状五：macOS 装的 wheel 在 Linux 报 [[not a supported wheel]]。根因是平台标签不匹配；纯 Python 包应是 [[py3-none-any]]，带 C 扩展要按平台构建。修复是用 cibuildwheel/对应 CI，不要跨平台复制 wheel。

症状六：公司镜像装不到最新版。根因是镜像同步延迟或索引配置；用 [[pip install -i https://pypi.org/simple scores-kit==0.1.0]] 验证，再联系镜像。不要在 README 里只写内部源。

症状七：[[twine upload]] 403。根因是 token 权限/项目名已被占用/2FA；检查 PyPI 账号权限和项目名。不要反复重试，先看响应体。

症状八：安装后 [[__version__]] 是旧的。根因是缓存/多个环境/版本号写了两处；用 [[pip show]] 和 [[python -c "import importlib.metadata as m; print(m.version('scores-kit'))"]] 对比。修复是版本号单一来源。

把这些症状写成 [[docs/install-troubleshooting.md]]，每条带命令和期望输出。发布前在干净 venv、不同平台、离线环境各装一次；发布后看 issue 是否集中在这几类。

验收：六类安装失败都能按文档定位；wheel 内容可检查；入口可执行；版本号一致；平台标签正确；镜像/离线安装有说明。`,
    code: String.raw`# 排查顺序
pip show scores-kit
python -c "import scores, sys; print(scores.__file__); print(sys.executable)"
unzip -l dist/scores_kit-0.1.0-py3-none-any.whl | grep -E "report|py.typed"
pip check
which scores
python -c "import importlib.metadata as m; print(m.version('scores-kit'))"

# 干净安装
python -m venv /tmp/verify
/tmp/verify/bin/pip install --no-cache-dir dist/scores_kit-0.1.0-py3-none-any.whl
/tmp/verify/bin/scores --version`,
    output: `# 每条命令的期望输出写进文档；
# 安装失败先定位「包/环境/资源/入口/平台」五类。`,
    tip: `按症状分类排查；wheel 内容先看；入口/版本单一来源；干净 venv + 离线 + 多平台验收。`
  }]);

  add("ch14-3", [{
    h: "章节复盘：抓取事故的排查顺序与止损",
    p: `抓取项目的事故通常不是「代码不会写」，而是「页面变了、被限流了、数据脏了、断点丢了」。下面给一套排查顺序：先确认请求是否成功，再确认拿到的是不是目标内容，再确认解析字段，再确认数据质量，最后确认状态/断点。不要一上来重写解析器。

第一步看请求。状态码、最终 URL、响应头、响应大小、耗时。403/401 是权限/登录；429 是限流；302 循环是重定向；200 但 body 是验证码页，说明被反爬。保存原始 HTML 到 [[debug/]]，不要只打印前 200 字符。

第二步看内容。搜索目标字段是否在 HTML 里；如果不在，看 Network 的 XHR；如果 XHR 有签名/加密，评估是否值得做，不要硬破解。页面改版可能把表格改成 div，选择器要跟着换。

第三步看解析。打印 [[len(rows)]]、前 3 行、字段空值率；选择器命中 0 条时，先用浏览器 [[document.querySelectorAll]] 验证。不要用「第 3 个 div」这种位置选择器，改版必坏。

第四步看数据质量。总条数是否骤降、日期范围是否缺失、重复率是否上升、排名是否连续。骤降可能是分页提前结束；重复可能是主键选错；排名断裂可能是过滤了状态。

第五步看状态。断点文件是否存在、游标是否前进、最后成功页是否卡住。状态文件损坏时不要从头上传，先备份再修复；游标没前进通常是结束条件写错。

第六步止损。遇到 403/验证码/robots 禁止，立即停止并记录，不要换 IP/换 UA 硬闯；遇到 429，按 Retry-After 等待；遇到页面改版，先保存样本，离线修解析器，再小流量验证。

第七步回归。把事故页面保存成 fixture，写「改版页返回 0 行要报错而不是静默」的测试；分页用假 fetch 测结束条件；限流用本地服务器返回 429。事故不变成测试，下次还会发生。

第八步文档。[[docs/crawler-runbook.md]] 写：如何暂停、如何续跑、如何清理状态、如何联系站点、哪些情况必须停止。让接手的人不用读完整代码。

验收：请求/内容/解析/质量/状态五层排查有命令；原始 HTML 可回溯；改版会报错；限流会等待；断点可恢复；事故有 fixture；runbook 可执行。`,
    code: String.raw`# 排查命令（示例）
# 1) 保存原始响应
curl -L -A "scores-research/0.1" -o debug/page.html -w "%{http_code} %{url_effective}\n" URL
# 2) 解析命中数
python -c "from bs4 import BeautifulSoup; s=BeautifulSoup(open('debug/page.html').read(),'lxml'); print(len(s.select('table.results tbody tr')))"
# 3) 数据质量
python -c "import pandas as pd; df=pd.read_csv('out.csv'); print(df.shape, df.isna().mean(), df.duplicated().mean())"
# 4) 状态
cat crawl-state.json`,
    output: `# 200 https://example.com/events?page=3
# rows=0  -> 选择器失效，保存样本离线修
# 429     -> 读 Retry-After，暂停后从当前游标继续`,
    tip: `请求→内容→解析→质量→状态五层排查；保存原始 HTML；改版报错不静默；限流等待；事故变 fixture。`
  }]);

  add("ch15-3", [{
    h: "章节复盘：数字对不上时的检查顺序",
    p: `分析报告最尴尬的时刻是「总数对不上」。不要先怀疑 pandas，按数据流从源头查到展示：输入行数、过滤条件、连接、分组、聚合、导出、模板。每一步都留下审计数字，问题通常在第 2 或第 4 步。

第一步输入。[[pd.read_csv]] 读了多少行？和 [[wc -l]] 差多少？差 1 可能是表头；差很多可能是分隔符/引号/多行字段。检查 [[shape]]、列名、dtype，不要假设 CSV 干净。

第二步过滤。[[dropna]]、[[query]]、[[isin]] 各删了多少行？把每个条件的剩余行数打印出来。常见 bug 是 [[dropna]] 默认删任意列空值，而你只想删成绩空值；应写 [[subset=["seconds"]]]。

第三步连接。[[merge]] 前后行数变化多少？[[how]] 是 inner 还是 left？重复键是否产生笛卡尔积？用 [[validate="one_to_one"]] 或 [[indicator=True]] 检查。连接键类型/空格/时区不一致会静默丢行。

第四步分组聚合。[[groupby]] 是否丢了 NaN 组？[[sum]] 是否把 NaN 当 0？[[mean]] 的分母是全部还是非空？[[size]] 和 [[count]] 不一样，前者算行，后者算非空。报告里写清口径。

第五步排名。并列、缺赛、弃权是否过滤？排序是否稳定？[[rank]] 的 method 是否符合业务？并列后下一名是否跳号？这些在第 18 章有专门逻辑，不要在报告里临时写。

第六步导出。[[to_csv]] 是否写了索引？浮点格式是否丢精度？编码是否被 Excel 误读？日期是否变成了数字？导出后重新读一遍，对比行数和关键字段。

第七步模板。Jinja2 是否自动转义？循环是否漏了最后一行？表格是否分页截断？汇总数字是否和明细同一数据源？不要用两个查询各自算总数。

第八步对账。生成 [[audit.json]]：输入行、过滤后、连接后、分组数、输出行、报告行；任何一步不一致就停下来查。把 audit 放报告页脚，读者能追溯。

验收：每一步有行数；过滤条件明确 subset；merge 有 validate；分组口径写清；导出重读一致；模板与明细同源；audit 可追溯。`,
    code: String.raw`import pandas as pd

def audit(df, step, path):
    row = {"step": step, "rows": len(df), "cols": len(df.columns),
           "nulls": int(df.isna().sum().sum())}
    print(row)
    return df

df = pd.read_csv("results.csv", encoding="utf-8-sig")
df = audit(df, "raw", None)
df = audit(df.dropna(subset=["seconds"]), "drop-null-seconds", None)
df = audit(df[df["status"] == "finished"], "finished-only", None)
left = df.merge(events, on="event", how="left", validate="many_to_one")
left = audit(left, "merge-events", None)
summary = left.groupby("event", as_index=False).agg(
    n=("athlete", "size"), best=("seconds", "min"))
print(summary)`,
    output: `{'step': 'raw', 'rows': 120, 'cols': 6, 'nulls': 3}
{'step': 'drop-null-seconds', 'rows': 118, 'cols': 6, 'nulls': 0}
{'step': 'finished-only', 'rows': 115, 'cols': 6, 'nulls': 0}
{'step': 'merge-events', 'rows': 115, 'cols': 8, 'nulls': 0}`,
    tip: `输入→过滤→连接→分组→排名→导出→模板七步审计；dropna 写 subset；merge 加 validate；报告与明细同源。`
  }]);

  add("ch16-3", [{
    h: "章节复盘：办公批量生成的事故与恢复",
    p: `批量生成成绩单/报表的事故，往往不是代码异常，而是「生成了一半、文件名冲突、模板错位、邮件发错人」。下面按阶段列事故：输入、模板、输出、并发、校验、通知、重跑。每个阶段给止损和恢复步骤。

输入阶段：重复学号、缺姓名、成绩为空。止损是导入前校验并生成错误报告，不要带着坏数据生成。恢复是修 CSV、只重跑失败学号，不要全量重跑。

模板阶段：占位符拼错、缺值、样式丢失。止损是生成前检查模板占位符清单与数据字段是否完全匹配；缺值报错。恢复是修模板/数据后重跑该批，保留旧文件便于对比。

输出阶段：文件名非法字符、同名覆盖、目录不存在。止损是统一 [[safe_filename]]，加学号前缀，写临时目录再移动；已存在文件不覆盖，进 conflict 列表。恢复是人工确认后加 [[--overwrite]]。

并发阶段：同时开 20 个 Word 进程，内存爆、文件句柄耗尽。止损是限制 4-8 并发，每个任务独立临时目录，失败隔离。恢复是降低并发、清理临时目录、重跑失败项。

校验阶段：文件生成了但打不开、中文变方框、公式没算。止损是生成后重新打开、检查关键单元格/段落/页数；字体嵌入；公式用库重算。恢复是替换模板/字体，重跑并抽样。

通知阶段：把 A 的成绩单发给 B。止损是收件人从数据表读取，不从文件名猜；发送前用测试地址预览；附件名与收件人校验。恢复是立即撤回/致歉/重发正确文件，记录事件。

重跑阶段：重复发送、重复追加。止损是 manifest 记录已成功项，重跑只读 failed；发送也记状态。恢复是按批次回滚，删除本批输出后重跑。

最后写 [[docs/batch-runbook.md]]：如何暂停、如何查 manifest、如何只重跑失败、如何回滚、如何通知。每次事故后补一条检查项和测试，不要只修当下。

验收：输入/模板/输出/并发/校验/通知/重跑七阶段有检查项；文件名安全唯一；失败隔离；manifest 可追溯；重跑不重复；通知不串人；runbook 可执行。`,
    code: String.raw`from pathlib import Path
import re, shutil, tempfile

BAD = r'\/:*?"<>|'
def safe_name(student_id: str, name: str, kind: str) -> str:
    clean = re.sub(r"[" + re.escape(BAD) + r"]", "_", name).strip()
    clean = re.sub(r"\s+", " ", clean)[:60]
    return f"{student_id}-{clean}-{kind}.xlsx"

def publish(tmp: Path, target: Path, overwrite=False) -> str:
    if target.exists() and not overwrite:
        return "conflict"
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(tmp), target)
    return "ok"

# manifest 记录：
# student_id, kind, path, status, sha256, sent_at
# 重跑只读 status=failed；发送前检查 sent_at 为空`,
    output: `# 文件名：2026001-林晓-成绩单.xlsx
# 已存在且未 --overwrite -> conflict
# 重跑只处理 failed，已发送不重复`,
    tip: `七阶段检查；文件名安全唯一；临时目录+移动；并发限流；生成后重开；收件人从数据读；manifest 防重。`
  }]);

  add("ch17-3", [{
    h: "章节复盘：并发程序的卡死、重复与丢任务",
    p: `并发 bug 的可怕之处是「偶发」。下面用六个症状做排查表：程序卡死、CPU 打满、内存上涨、任务重复、任务丢失、退出不干净。每个症状给可能原因、取证方法、修复方向。先取证再改代码，不要靠重启。

症状一：程序卡死。可能原因：锁顺序相反、队列满且生产者在等、子进程管道未读、await 了永远不会完成的任务。取证：[[faulthandler.dump_traceback_later]] 打印堆栈，[[py-spy dump]] 看线程；检查所有 [[acquire]]/[[put]]/[[wait]] 是否有超时。修复：固定锁顺序、有界队列用 [[await put]]、[[communicate]] 读管道、所有 await 加超时。

症状二：CPU 打满。可能原因：忙等待（[[while not event: pass]]）、自旋锁、进程池任务太碎、JSON 序列化大对象。取证：[[top]]/[[py-spy top]] 看热点；把忙等待改成 [[event.wait(timeout)]]；任务批量提交。

症状三：内存上涨。可能原因：无界队列、结果全存 list、缓存不淘汰、子进程返回大对象。取证：[[tracemalloc]]、[[objgraph]]、队列 [[qsize()]]；修复：有界队列、流式处理、[[weakref]]/LRU、返回路径而不是数据。

症状四：任务重复。可能原因：重试没有幂等键、队列至少一次投递、状态提交晚于副作用。取证：日志里同一 id 出现多次；检查重试和状态顺序。修复：幂等键/upsert、先写状态后确认、去重表。

症状五：任务丢失。可能原因：异常被吞、Future 没取结果、队列哨兵提前、进程被 kill。取证：统计入队/出队/成功/失败四个数；检查 [[except: pass]]；修复：异常记录并重试、死信队列、优雅退出。

症状六：退出不干净。可能原因：daemon 线程被杀、任务未 cancel、子进程未 join、连接未关闭。取证：退出后 [[ps]] 看残留，[[lsof]] 看连接；修复：stop event、cancel + await、shutdown(wait=True)、with 关闭资源。

通用方法：给每个任务一个 id，日志贯穿入队/开始/成功/失败/重试；用计数器暴露队列长度、活跃数、失败数；压测时人为注入慢响应/异常/取消。没有指标的并发程序，只能靠猜。

验收：卡死能在 30 秒内打印堆栈；忙等待移除；队列有界；重复有幂等；丢失有死信；退出无残留；日志能追踪单任务全生命周期。`,
    code: String.raw`import asyncio, faulthandler, queue, threading

faulthandler.dump_traceback_later(30, exit=True)

q = queue.Queue(maxsize=100)
stop = threading.Event()

def worker():
    while not stop.is_set():
        try:
            item = q.get(timeout=0.5)
        except queue.Empty:
            continue
        try:
            handle(item)          # 不吞异常
        except Exception:
            log.exception("task failed: %s", item)
            dead_letter(item)
        finally:
            q.task_done()

# 退出：先停止生产，再 join 队列，再停 worker
# stop.set(); q.join(); for t in threads: t.join(timeout=2)`,
    output: `# 卡死 30s -> faulthandler 打印所有线程堆栈
# 队列上限 100，满时生产者等待
# 失败任务进死信，不阻塞其他任务`,
    tip: `先取证再改；所有等待有超时；队列有界；幂等防重；死信防丢；退出 stop→join→cancel；日志贯穿任务 id。`
  }]);
})();

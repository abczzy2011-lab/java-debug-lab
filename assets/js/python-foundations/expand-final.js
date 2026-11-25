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

  add("ch18-1", [{
    h: "全书复盘：从语法到交付的十二个检查点",
    p: `学完 18 章，最容易出现的情况是「每章都懂一点，合起来不会做」。这一节用十二个检查点把全书串成一条主线：每个检查点给一个能动手验证的小任务、一个常见失败、一个通过标准。不要只读，逐条做一遍，哪里卡住就回到对应章节。

检查点一：语法与数据。能不看笔记写出列表推导、字典遍历、解包、切片、f-string；知道可变/不可变、浅拷贝/深拷贝的区别。小任务：把一份嵌套字典里的成绩展平成列表，并去重。常见失败：遍历时修改列表、用可变默认参数。通过标准：代码无副作用，输入不被意外修改。

检查点二：函数与模块。能写出纯函数、默认参数、关键字参数、可变参数；知道 [[__name__]] 和 [[main()]] 的作用；能把一个脚本拆成模块而不产生循环导入。小任务：把 200 行脚本拆成 [[io.py]]、[[models.py]]、[[cli.py]]，导入不报错。常见失败：模块顶层读配置、循环 import。

检查点三：面向对象。能用 dataclass 定义值对象，用 Enum 管状态，用组合而非深继承；知道 [[__eq__]]/[[__hash__]]、[[property]]、[[classmethod]] 的用途。小任务：把字典行改造成 frozen dataclass，并写并列排名。常见失败：可变对象做 dict 键、继承层次过深。

检查点四：异常与文件。能区分可重试/不可重试异常，写 [[raise ... from]]，用 [[with]] 管资源；写文件用临时文件 + [[os.replace]]。小任务：写一个导入器，坏行不影响其他行，失败不留半截文件。常见失败：[[except: pass]]、直接 [[open("w")]] 覆盖。

检查点五：标准库。熟悉 [[pathlib]]、[[datetime]]、[[json]]、[[csv]]、[[re]]、[[argparse]]、[[logging]]、[[collections]]；知道什么时候用 [[decimal]] 而不是 float。小任务：写一个 CLI，读 CSV、算统计、输出 JSON，日志走 stderr。常见失败：手拼路径、naive/aware 时间混用。

检查点六：迭代器与生成器。能写生成器、[[yield from]]、惰性管道；知道生成器只能遍历一次；能用 [[itertools]] 做分组/组合。小任务：流式读 1GB 日志，统计每个状态码，不把全文读进内存。常见失败：在生成器里返回列表、重复遍历同一个生成器。

检查点七：装饰器与上下文管理器。能写带参数的装饰器、[[functools.wraps]]、[[contextlib.contextmanager]]；知道装饰器在导入时执行。小任务：给函数加计时和重试装饰器，异常时保留原函数名。常见失败：忘记 wraps、装饰器里吞异常。

检查点八：类型与测试。能给公开 API 加注解，开 mypy strict；能写单元/集成/属性测试，知道 mock 的边界。小任务：给一个模块加类型和 10 个测试，CI 全绿。常见失败：Any 泄漏、测试只断言「没报错」。

检查点九：打包与发布。能做 src 布局、pyproject、wheel、入口、资源、py.typed；能在干净 venv 安装。小任务：从空目录做一个可安装的 demo 包。常见失败：资源没进 wheel、版本号两处。

检查点十：数据与网络。能用 pandas 做清洗/连接/分组，知道 merge 校验；能用 requests 做超时/重试/流式；抓取遵守 robots。小任务：把一份脏 CSV 变成带统计的 HTML 报告。常见失败：默认 inner merge、无超时请求。

检查点十一：办公与并发。能批量生成 Excel/Word/PDF，做 manifest 对账；能用线程/进程/异步处理 I/O 和 CPU 任务，知道锁、队列、背压。小任务：并发下载 20 个文件，限流、续传、校验。常见失败：无界队列、共享 Session、进程池传 lambda。

检查点十二：交付与运维。能写 README、变更日志、CI、定时任务、监控和回滚；知道「能跑」和「能维护」的区别。小任务：把毕业项目打成 wheel，部署到一台干净机器，跑一次定时任务。常见失败：只在本机能跑、没有回滚方案。

这张地图不是知识点清单，而是能力链。每一环都能独立验证，又都指向同一个目标：把输入变成可靠、可解释、可交付的输出。卡在某一步时，不要从头再学一遍，回到对应章节做那个小任务，直到通过标准。

最后给自己留一份「项目体检表」：安装、导入、CLI、测试、日志、错误处理、性能、安全、文档、回滚，十项各写一条当前状态。每完成一个项目更新一次，下一次做新项目就不会从零开始。

验收：十二个检查点至少完成十个；每个小任务有代码和测试；能说清常见失败和修复；体检表有十项；毕业项目能在一台干净机器上跑起来。做到这些，18 章才算真正连成一条线。`,
    code: String.raw`# 项目体检表（示例，放进 docs/health-check.md）
checks = [
    "clean-install",      # 干净 venv 能安装
    "import-smoke",       # import 无副作用
    "cli-help",           # --help 可用
    "tests-green",        # 单元/集成全绿
    "typed",              # mypy strict
    "logs-structured",    # 日志带 task_id
    "errors-actionable",  # 错误带行号/原值
    "perf-baseline",      # 有基准数据
    "docs-runbook",       # 安装/排障/回滚
    "rollback",           # 上一版可切回
]

for name in checks:
    print(f"[ ] {name}")`,
    output: `[ ] clean-install
[ ] import-smoke
[ ] cli-help
[ ] tests-green
[ ] typed
[ ] logs-structured
[ ] errors-actionable
[ ] perf-baseline
[ ] docs-runbook
[ ] rollback`,
    tip: `十二个检查点各做一个小任务；卡住回对应章节；项目体检十项；目标是把输入变成可交付输出。`
  }]);
})();

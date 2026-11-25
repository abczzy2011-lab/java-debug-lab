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

  add("ch18-2", [{
    h: "加练：把项目体检表跑成一条命令",
    p: `上一节列了十项体检，但「写在文档里」不等于「每次都会跑」。练习目标：把安装、导入、CLI、测试、类型、资源、报告、回滚八项做成一个 [[verify]] 子命令，输出 JSON，任何一项失败返回 1。这样 CI、定时任务、交接都能用同一条命令。

第一项安装检查：确认当前解释器能导入包，版本号来自 metadata；如果导入的是源码目录而不是安装包，给出警告。不要只检查 [[import scores]]，还要打印 [[scores.__file__]]，避免「本机能跑、wheel 不能跑」。

第二项资源检查：用 [[importlib.resources.files]] 读取模板，确认存在且非空；再检查 [[py.typed]] 是否在包内。资源缺失是安装后最常见的失败，必须单独一项。

第三项 CLI 检查：用 [[subprocess]] 跑 [[python -m scores --help]] 和 [[--version]]，断言退出码 0、输出包含命令名/版本。不要直接调用 [[main]]，那绕过了参数解析和入口配置。

第四项测试检查：跑 [[pytest -q]]，解析返回码；CI 里还可以加 [[--maxfail=1]]。verify 不重复实现测试逻辑，只调用现有测试命令，避免两套标准。

第五项类型检查：跑 [[mypy src]]，返回码 0 才算过；没有 mypy 时标记 skipped，不要假装通过。skip 和 pass 要分开，报告里能看出「没检查」和「检查通过」。

第六项数据检查：读 [[out/summary.json]] 和 [[out/ranking.csv]]，确认行数、哈希、必填列；没有输出时标记 skipped，而不是 failed。verify 要能区分「还没生成」和「生成了但坏了」。

第七项报告检查：确认 [[report.html]] 存在、包含标题和版本号、能被解析；PDF 检查页数。不要只检查文件大小。

第八项回滚检查：确认上一版 wheel/备份存在，[[docs/rollback.md]] 有步骤；这一项可以是 warning，不阻塞发布，但必须显示。

体检不是一次性的，每次发布前、每次交接前都跑一遍；结果存档，和构建产物一起保留，供审计与复盘留档。

输出统一 JSON：[[{"check": "...", "status": "pass|fail|skip|warn", "detail": "..."}]]；最后打印汇总，失败项置顶。CI 用 [[jq]] 筛 fail；人看汇总。不要把敏感路径/密钥写进 detail。

验收：一条 [[scores verify]] 能跑完八项；pass/fail/skip/warn 区分清楚；失败返回 1；输出可被 jq 解析；CI 和本地结果一致；交接时新人能看懂。`,
    code: String.raw`import json, subprocess, sys
from importlib import resources

class SkipCheck(Exception):
    pass

def run_cmd(args):
    r = subprocess.run(args, capture_output=True, text=True, timeout=300)
    if r.returncode != 0:
        raise RuntimeError((r.stdout + r.stderr)[-500:])
    return "ok"

def run_pytest():
    return "pytest " + run_cmd([sys.executable, "-m", "pytest", "-q"])

def run_mypy():
    return "mypy " + run_cmd([sys.executable, "-m", "mypy", "src"])

def check(name, fn):
    try:
        detail = fn()
        return {"check": name, "status": "pass", "detail": detail}
    except SkipCheck as exc:
        return {"check": name, "status": "skip", "detail": str(exc)}
    except Exception as exc:
        return {"check": name, "status": "fail",
                "detail": f"{type(exc).__name__}: {exc}"}

def cli_check():
    for args in (["--help"], ["--version"]):
        r = subprocess.run([sys.executable, "-m", "scores", *args],
                           capture_output=True, text=True, timeout=30)
        if r.returncode != 0:
            raise RuntimeError(r.stderr[-500:])
    return "help/version ok"

def resource_check():
    text = (resources.files("scores") / "data" / "report.md").read_text(encoding="utf-8")
    if not text.strip():
        raise ValueError("empty template")
    return f"template {len(text)} chars"

def verify():
    checks = [
        check("cli", cli_check),
        check("resources", resource_check),
        check("tests", lambda: run_pytest()),
        check("types", lambda: run_mypy()),
    ]
    failed = [c for c in checks if c["status"] == "fail"]
    print(json.dumps(checks, ensure_ascii=False, indent=2))
    return 1 if failed else 0`,
    output: `[
  {"check": "cli", "status": "pass", "detail": "help/version ok"},
  {"check": "resources", "status": "pass", "detail": "template 420 chars"},
  {"check": "tests", "status": "pass", "detail": "18 passed"},
  {"check": "types", "status": "pass", "detail": "mypy clean"}
]
# 有 fail 时退出码 1`,
    tip: `八项体检一条命令；pass/fail/skip/warn 分开；CLI 用 subprocess；verify 复用测试/类型命令；JSON 可 jq。`
  }]);
})();

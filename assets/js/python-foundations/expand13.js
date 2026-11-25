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

  add("ch13-1", [{
    h: "工程深化：src 布局、构建后端与可编辑安装",
    p: `项目根目录直接放 [[scores/]] 包，在根目录运行 Python 时能 import；换到别处、装成 wheel 后却可能 import 到同名的其他包。[[src/]] 布局把源码放到 [[src/scores/]]，让「当前目录」不再天然在 [[sys.path]] 里，逼迫你通过安装或显式路径导入。这能提前暴露打包遗漏。

推荐结构：[[src/scores/]] 放代码，[[tests/]] 放测试，[[pyproject.toml]] 放构建配置，[[README.md]] 和 [[LICENSE]] 放根目录。测试不要放包内，否则会被打进 wheel；示例放 [[examples/]]，不要混进运行时依赖。[[src/]] 布局对 pytest 也友好，配合 [[pythonpath = ["src"]]] 或安装后的 editable 模式。

构建后端选一个，不要手写 [[setup.py]] 和 [[setup.cfg]] 双份。现代项目用 [[hatchling]]、[[setuptools]]、[[flit]] 或 [[poetry-core]]，在 [[pyproject.toml]] 的 [[[build-system]]] 声明。[[setuptools]] 兼容性最好，hatchling 配置简洁；团队熟悉哪个用哪个，不要为追新而迁移。

可编辑安装 [[pip install -e .]] 让源码改动立即生效，适合开发。它会在环境里放一个指向源码的路径或 import hook；不同后端行为略有差异。CI 不要用 editable 跑最终测试，应该 [[pip install .]] 或安装 wheel，验证真实打包结果。

导入遮蔽是 src 布局要解决的核心问题。项目根目录有一个 [[json.py]]，运行脚本时可能盖住标准库 [[json]]；测试目录有一个 [[scores.py]]，可能盖住包。用 [[python -c "import scores; print(scores.__file__)"]] 确认导入的是哪个文件，不要凭报错猜。

[[__main__.py]] 让包可以 [[python -m scores]] 执行。把 CLI 入口放这里，逻辑放 [[cli.py]]，[[main()]] 返回退出码。[[project.scripts]] 再声明一个命令名，安装后可直接 [[scores]]。两条入口共用同一函数，避免行为分叉。

验收：删除本地 [[scores.egg-info]]，在干净 venv 安装；从任意目录运行 [[python -c "import scores"]]；确认 [[scores.__file__]] 指向 site-packages 而不是当前目录；再跑 [[python -m scores --help]]。`,
    code: String.raw`# 目录
# pyproject.toml
# src/scores/__init__.py
# src/scores/__main__.py
# src/scores/cli.py
# tests/test_cli.py

# pyproject.toml
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "scores"
version = "0.3.0"
requires-python = ">=3.11"
dependencies = ["requests>=2.31,<3"]

[project.scripts]
scores = "scores.cli:main"

[tool.setuptools.packages.find]
where = ["src"]`,
    output: `$ python -c "import scores; print(scores.__file__)"
/path/to/venv/lib/python3.13/site-packages/scores/__init__.py
$ python -m scores --help
usage: scores ...`,
    tip: `src 布局防遮蔽；pyproject 单份配置；CI 装 wheel 而不是 editable；入口共用 main。`
  }, {
    h: "故障排查：package-data、版本号与 wheel 内容检查",
    p: `「本地能跑，安装后缺文件」通常不是代码问题，而是打包没带资源。模板、证书、默认配置、[[py.typed]] 都要在 package-data 里声明。不同后端写法不同：setuptools 用 [[[tool.setuptools.package-data]]]，hatchling 用 [[[tool.hatch.build.targets.wheel] include]]。写完不要猜，直接解压 wheel 看。

[[python -m build]] 生成 sdist 和 wheel。wheel 是 zip，可以用 [[unzip -l dist/*.whl]] 列出内容；确认 [[scores/data/report.md]]、[[scores/py.typed]]、[[METADATA]] 都在。sdist 是 tar.gz，确认源码、测试、README、LICENSE 都在；sdist 里缺文件，别人从源码安装就会失败。

版本号只在一个地方定义。[[pyproject.toml]] 的 [[project.version]] 是权威；代码里 [[__version__]] 可以从 [[importlib.metadata.version("scores")]] 读取，不要手写两份。动态版本用 [[setuptools_scm]] 从 git tag 生成，但项目不是 git 仓库时要有回退。版本号重复会导致 [[pip]] 缓存混乱。

[[py.typed]] 是 PEP 561 的标记文件，告诉类型检查器「这个包自带类型」。没有它，mypy 会把包当成无类型，所有导入退化成 Any。文件内容可以为空，但必须打进 wheel。很多包类型注解写得很好，却漏了 py.typed，等于白写。

依赖要区分运行时和开发。[[project.dependencies]] 是用户安装时必需的；[[project.optional-dependencies]] 的 [[dev]]、[[test]]、[[plot]] 是可选。不要把 pytest、ruff、mypy 塞进运行时依赖，那会让用户多装一堆东西。可选依赖要在代码里延迟导入，缺了就给安装提示。

wheel 文件名带平台标签。纯 Python 包是 [[py3-none-any]]，带 C 扩展是 [[cp313-cp313-manylinux_2_17_x86_64]] 之类。不要在 macOS 上构建后直接传到 Linux；用 cibuildwheel 或对应平台的 CI。标签不匹配，pip 会拒绝安装或装错。

验收：解压 wheel 检查资源；在干净 venv 安装 wheel；跑 [[python -c "import scores; print(scores.__version__)"]]；再跑一次读取模板的功能。三步都过，打包才算完整。`,
    code: String.raw`# 构建与检查
python -m build
unzip -l dist/scores-0.3.0-py3-none-any.whl
tar -tzf dist/scores-0.3.0.tar.gz | head

# pyproject.toml
[tool.setuptools.package-data]
scores = ["data/*.md", "py.typed"]

[project.optional-dependencies]
plot = ["matplotlib>=3.8"]
dev = ["pytest>=8", "mypy>=1.10", "ruff>=0.5"]`,
    output: `# wheel 中应出现：
# scores/data/report.md
# scores/py.typed
# scores-0.3.0.dist-info/METADATA`,
    tip: `资源与 py.typed 必须进 wheel；版本只留一处；运行时/可选依赖分开；按平台构建。`
  }]);

  add("ch13-2", [{
    h: "工程深化：CLI 配置优先级、退出码与可测试性",
    p: `命令行工具的配置通常来自四层：默认值、配置文件、环境变量、命令行参数。优先级要明确，一般是「命令行 > 环境变量 > 配置文件 > 默认」。不要反过来，否则用户改了命令行还被配置文件覆盖，会非常困惑。把合并逻辑集中到一个函数，打印最终配置来源。

[[argparse]] 足够大多数场景。用 [[add_subparsers]] 做子命令，用 [[add_argument_group]] 分组，用 [[choices]] 限制枚举。[[type=Path]] 不会自动创建父目录，[[type=int]] 失败会给出 argparse 错误。需要「两个参数互斥」时用 [[add_mutually_exclusive_group]]，不要自己在业务里判断。

退出码是 CLI 的合同：0 成功，1 一般错误，2 用法错误，130 被 Ctrl-C 中断。不要所有失败都 [[sys.exit(1)]]，脚本无法区分「参数错」和「数据错」。异常在 [[main()]] 顶层捕获，打印人类可读消息到 stderr，返回对应码；traceback 只在 [[--debug]] 时显示。

输出要区分 stdout 和 stderr。正常结果写 stdout，日志、进度、警告写 stderr；这样管道 [[scores list | jq]] 不会被日志污染。[[--json]] 模式只输出 JSON，不要在前面打印「正在加载」。需要进度条时，检测 [[sys.stderr.isatty()]]，非终端环境退化成简单日志。

可测试性：把 [[main(argv)]] 设计成接收参数列表并返回 int，不要在函数内部直接 [[sys.exit]]。测试用 [[capsys]] 捕获输出，断言退出码和 stderr。真正执行 [[sys.exit]] 的只有 [[if __name__ == "__main__"]] 那一行。这样 CLI 逻辑可以像普通函数一样测。

配置文件格式选 TOML/JSON/YAML 之一，不要自己解析 ini 的边界。读取时给默认值、校验类型、报出文件路径和键名。配置文件缺失可以接受，格式错误必须失败；不要静默忽略坏配置，那会让用户以为生效了。

验收：[[--help]] 能显示所有子命令；缺参数返回 2；数据错误返回 1；Ctrl-C 返回 130；stdout 只含结果；[[--json]] 输出可被 [[json.loads]] 解析。`,
    code: String.raw`import argparse, json, sys

def build_parser():
    p = argparse.ArgumentParser(prog="scores")
    p.add_argument("--config", type=str, default="scores.toml")
    p.add_argument("--debug", action="store_true")
    sub = p.add_subparsers(dest="cmd", required=True)
    show = sub.add_parser("show")
    show.add_argument("--json", action="store_true")
    return p

def main(argv=None):
    args = build_parser().parse_args(argv)
    try:
        rows = [{"athlete": "林晓", "seconds": 12.3}]
        if args.cmd == "show":
            if args.json:
                print(json.dumps(rows, ensure_ascii=False))
            else:
                for r in rows:
                    print(f"{r['athlete']}\t{r['seconds']}")
        return 0
    except Exception as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())`,
    output: `$ scores show --json
[{"athlete": "林晓", "seconds": 12.3}]
$ scores show --bad
error: unrecognized arguments: --bad   # 退出码 2`,
    tip: `优先级 CLI > env > 文件 > 默认；0/1/2/130 退出码；结果走 stdout，日志走 stderr。`
  }, {
    h: "故障排查：密钥、信号与日志在 CLI 中的边界",
    p: `密钥不要走命令行参数。[[ps aux]] 能看到完整命令，shell history 也会记录；[[--token abc]] 等于把密钥公开。用环境变量、配置文件（权限 600）、或 stdin 读取。必须支持命令行时，明确警告并支持 [[--token-file]]。

环境变量要校验。空字符串、前后空格、大小写都可能出问题；[[os.environ["X"]]] 缺失会 KeyError，[[getenv]] 返回 None 要在入口处转成清晰错误。不要把密钥写进日志，日志里只打印「已加载 token（长度 32）」，不要打印值。

信号处理要克制。Ctrl-C 默认抛 KeyboardInterrupt，顶层捕获后返回 130；不要捕获后继续跑，用户会以为没反应。需要优雅退出时，注册 [[signal.SIGTERM]]，设置停止标志，让主循环在安全点退出；不要在信号处理器里做耗时操作或打印复杂日志。

长时间任务的日志要带进度和心跳。每处理 N 条打印一次「已处理/总数/耗时/速率」，让用户知道没卡死。不要每行都打印，I/O 会成为瓶颈；也不要完全不打印，几分钟无输出会被误杀。进度写 stderr，结果写 stdout。

配置合并要能解释「这个值从哪来」。启动时打印最终配置来源（默认/文件/环境/参数），密钥只打印是否存在。用户说「我设了环境变量但没生效」，看一行来源就能定位，不用猜。

退出前要 flush。[[print]] 到管道时可能缓冲，进程被 kill 会丢日志；用 [[logging.shutdown()]] 或显式 [[sys.stdout.flush()]]。写文件用 with，确保关闭；临时文件在 finally 清理。CLI 的「最后一秒」最容易丢数据。

验收：token 不出现在 [[ps]]/history/日志；SIGTERM 能在 5 秒内退出；Ctrl-C 返回 130；配置来源可打印；管道输出无缓冲丢失。`,
    code: String.raw`import os, signal, sys, logging

stop = False
def on_term(signum, frame):
    global stop
    stop = True

signal.signal(signal.SIGTERM, on_term)

def load_token():
    token = os.environ.get("SCORES_TOKEN", "").strip()
    if not token:
        raise RuntimeError("SCORES_TOKEN is required")
    logging.info("token loaded, length=%d", len(token))
    return token

try:
    token = load_token()
    while not stop:
        pass  # 实际工作循环，定期检查 stop
except KeyboardInterrupt:
    sys.exit(130)
except Exception as exc:
    print(f"error: {exc}", file=sys.stderr)
    sys.exit(1)`,
    output: `# 退出码：
# 0 成功 / 1 业务失败 / 2 用法错误 / 130 Ctrl-C
# 日志只记录 token 长度，不记录值。`,
    tip: `密钥不进 argv；信号只设标志；进度走 stderr；退出前 flush。`
  }]);

  add("ch13-3", [{
    h: "工程深化：构建、签名与可信发布",
    p: `[[python -m build]] 生成 sdist 和 wheel 后，不要直接 [[twine upload]] 就完事。发布前要检查版本号、README 渲染、依赖、wheel 内容、许可证。[[twine check dist/*]] 会检查元数据和 README 的 reStructuredText/Markdown 是否可渲染；它不能检查代码，但能挡住很多低级错误。

TestPyPI 是预发布环境。先把包传到 [[test.pypi.org]]，在干净 venv 用 [[--index-url]] 安装，确认依赖能从正式 PyPI 解析。TestPyPI 的包名可能被占用，依赖也不全；安装命令要同时给 [[--extra-index-url https://pypi.org/simple]]。预发布通过后再传正式。

信任发布（Trusted Publishing）用 OIDC 代替长期 API token。GitHub Actions 配置 [[id-token: write]]，PyPI 项目设置里绑定仓库和工作流；发布时用 [[pypa/gh-action-pypi-publish]]，不需要在仓库里存密码。这比 token 安全，token 一旦泄漏，别人可以冒名发布。

签名和 SBOM 是供应链的一部分。[[sigstore]] 可以给 wheel 签名，用户能验证来源；[[pip-audit]] 检查依赖漏洞；[[cyclonedx-py]] 生成 SBOM。不是每个项目都要全套，但公开库至少要有版本 tag、变更日志、可复现构建。

wheel 要可复现。同一份源码、同一版本、同一构建环境，两次构建的哈希应一致；[[SOURCE_DATE_EPOCH]] 固定时间戳，避免 zip 里写入当前时间。很多构建后端已经支持，但要在 CI 里验证。不可复现的 wheel 让「这个包是不是被人改过」无法回答。

发布后要验证：从 PyPI 安装指定版本，跑 [[python -c "import scores; print(scores.__version__)"]]，再跑最小功能。不要只看上传成功；上传成功不等于用户能装。缓存、镜像、依赖解析都可能出问题。

回滚策略：PyPI 不允许覆盖已发布版本，只能 [[yank]]（标记为不推荐）或发新补丁。发布前在本地打 tag、保留构建产物、记录依赖锁；出问题发 [[0.3.1]] 修复，不要试图删版本。yank 后旧版本仍可被锁定安装，但新解析会跳过。

验收：[[twine check]] 通过；TestPyPI 安装通过；正式安装通过；版本号与 tag 一致；发布记录有 CI 日志和产物哈希。`,
    code: String.raw`# 本地检查
python -m build
twine check dist/*

# 发布到 TestPyPI
twine upload --repository testpypi dist/*
python -m pip install --index-url https://test.pypi.org/simple/ \
  --extra-index-url https://pypi.org/simple scores==0.3.0

# GitHub Actions 信任发布（片段）
# permissions:
#   id-token: write
# steps:
#   - uses: pypa/gh-action-pypi-publish@release/v1`,
    output: `# twine check 输出 PASSED；
# TestPyPI 与正式 PyPI 各安装一次；
# 版本号、tag、wheel 哈希三者对应。`,
    tip: `先 TestPyPI 再正式；优先 Trusted Publishing；版本不可覆盖，只能 yank 或发补丁。`
  }, {
    h: "故障排查：版本语义、弃用与热修复",
    p: `[[0.3.0]] 到 [[0.3.1]] 是补丁，应该只修 bug、不改变公开行为；[[0.4.0]] 可以加功能，但要兼容；[[1.0.0]] 才可以删公开 API。很多项目把新功能塞进补丁版本，用户自动升级后行为变了，信任就没了。版本号是承诺，不是营销数字。

弃用要提前一个版本。先文档标注、发 [[DeprecationWarning]]、保留旧实现；下一个版本再删。警告要用 [[stacklevel=2]]，让用户看到自己的调用点，而不是库内部。测试里用 [[pytest.warns]] 确认警告真的发出。

热修复流程：从发布 tag 拉分支，只改必要代码，跑完整测试，发补丁版本；不要把主分支的新功能一起带上。修复后补一个回归测试，确保同样问题不会再来。热修复的提交要合并回主分支，否则下次发布又复现。

依赖升级也可能破坏兼容。即使用户没改你的 API，你升级了 [[requests]] 大版本，行为可能变。锁文件、CI 矩阵、变更日志都要记录依赖变化。破坏性升级要当成 breaking change，给用户迁移说明。

yank 不是删除。被 yank 的版本仍能被精确版本安装，但新解析会跳过；适合「这个版本有严重 bug，别再用」。如果只是文档错误，发补丁即可，不必 yank。yank 要在变更日志里解释原因和替代版本。

变更日志按「新增/修复/弃用/破坏性」分组，写用户能理解的影响，不要复制 commit message。每条带 issue/PR 链接。发布说明里给升级命令和注意事项，尤其是需要迁移脚本的版本。

验收：补丁版本是否只有修复？弃用警告是否指向调用方？热修复分支是否从 tag 出发？变更日志是否覆盖所有公开变化？yank 是否有替代版本？`,
    code: String.raw`# 版本与弃用示例
__version__ = "0.4.0"

def old_api(x):
    import warnings
    warnings.warn(
        "old_api is deprecated since 0.4.0; use new_api",
        DeprecationWarning,
        stacklevel=2,
    )
    return new_api(x)

# 测试弃用
# with pytest.warns(DeprecationWarning, match="old_api"):
#     old_api(1)`,
    output: `# 0.4.0：新增 new_api，old_api 弃用但仍可用
# 0.5.0：移除 old_api（breaking change 需主版本说明）`,
    tip: `补丁只修 bug；弃用跨一个版本；热修复从 tag 拉分支；yank 要写替代版本。`
  }]);
})();

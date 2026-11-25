window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch13-1": [
    {
      h: "深读：editable 安装到底装了什么",
      p: `[[pip install -e .]] 不是把源码复制到 site-packages，而是安装一个指向源码目录的链接/元数据。改源码立即生效，但包数据、入口脚本、依赖仍按安装时生成。

editable 适合开发，不适合验证发布。发布前必须在普通 [[pip install wheel]] 下测试，因为 editable 会掩盖漏包、路径、资源问题。CI 的测试 job 可以用 editable，发布验证 job 必须用 wheel。

不同构建后端的 editable 实现不同；切换 setuptools/hatchling 后重新安装一遍，别假设行为一样。`,
      code: String.raw`python -m pip install -e ".[dev]"
python -c "import scores; print(scores.__file__)"
# 输出应指向 src/scores/__init__.py，而不是 site-packages`,
      output: `/path/to/project/src/scores/__init__.py`,
      tip: `editable 改源码立即生效，但会掩盖漏打包；发布验证必须用 wheel 普通安装。`
    },
    {
      h: "深读：构建后端怎么选",
      p: `setuptools 兼容性最好、生态最广；hatchling 配置简单、默认支持 src 布局；flit 适合纯 Python 小包；poetry 自带依赖管理但会把生态绑在它自己的锁文件上。

选型看需求：要兼容旧工具/复杂包数据，setuptools；新项目想要简洁，hatchling；要发单文件模块，flit。不要在同一个项目混用多个构建后端。

[[[build-system]]] 的 requires 是构建时依赖，不是运行时依赖；它会在隔离环境安装。构建失败先看这里，而不是看 dependencies。`,
      code: String.raw`[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/scores"]`,
      output: `Successfully built scores-0.1.0-py3-none-any.whl`,
      tip: `构建依赖在 [[[build-system].requires]]，不是运行时 dependencies；构建失败先查这里。`
    },
    {
      h: "深读：锁文件与可复现构建",
      p: `[[pyproject]] 的 dependencies 是范围，不是锁定。要可复现，需要锁文件：pip-tools 的 [[requirements.lock]]、uv 的 [[uv.lock]]、poetry 的 [[poetry.lock]]。锁文件记录完整解析和哈希。

应用项目应该提交锁文件；库项目通常不提交锁文件（避免限制下游），但 CI 要有一个锁定环境跑测试。两者策略不同。

构建 wheel 本身不应该依赖锁文件里的开发工具；[[python -m build]] 在隔离环境安装 build-system requires，确保构建可复现。`,
      code: String.raw`# 应用：提交锁文件
# uv lock
# uv sync --frozen

# 库：CI 锁定测试环境
# pip install -r requirements-dev.lock
# python -m build`,
      output: `Resolved 42 packages in 0.8s`,
      tip: `应用提交锁文件，库不强制；CI 用锁定环境测试，构建用隔离环境。`
    }
  ],
  "ch13-2": [
    {
      h: "深读：argparse 自定义类型与校验",
      p: `[[type=]] 可以传函数，把字符串转成业务类型；转换失败抛 [[argparse.ArgumentTypeError]]，argparse 会给出友好错误并退出 2。比解析后再手动校验更早失败。

需要范围校验时，写 [[positive_int]]：先 [[int()]]，再检查 [[>0]]；错误消息写清楚期望。不要用 [[type=lambda x: ...]] 写复杂逻辑，函数要可测试。

[[choices=]] 适合有限枚举；如果取值很多/动态，用自定义类型查表。`,
      code: String.raw`import argparse

def positive_int(text):
    value = int(text)
    if value <= 0:
        raise argparse.ArgumentTypeError("必须是正整数")
    return value

p = argparse.ArgumentParser()
p.add_argument("--limit", type=positive_int, default=5)
try:
    p.parse_args(["--limit", "0"])
except SystemExit as err:
    print("exit", err.code)`,
      output: `usage: -
error: argument --limit: 必须是正整数
exit 2`,
      tip: `自定义 [[type]] 抛 [[ArgumentTypeError]]，argparse 自动转成友好错误 + 退出码 2。`
    },
    {
      h: "深读：退出码与信号，脚本能判断成败",
      p: `自动化脚本靠退出码判断成功，不靠解析 stdout。0 成功、1 业务失败、2 用法错误是常见约定；126/127 表示命令不可执行/找不到，128+信号表示被中断。

[[sys.exit(2)]] 抛 [[SystemExit]]，[[finally]] 仍会执行；不要在深层函数里随便 [[sys.exit]]，让入口统一返回码。捕获 [[KeyboardInterrupt]] 时返回 130（128+SIGINT），比 traceback 友好。

[[argparse]] 的 [[parser.error()]] 会打印用法并退出 2；业务错误不要用它，自己写 stderr + 返回码。`,
      code: String.raw`import sys

def main(argv):
    if not argv:
        print("missing input", file=sys.stderr)
        return 2
    try:
        return 0
    except KeyboardInterrupt:
        return 130

raise SystemExit(main([]))`,
      output: `missing input`,
      tip: `0/1/2 是常用约定；Ctrl-C 返回 130，别把 traceback 当正常退出。`
    },
    {
      h: "深读：CLI 的日志与 --debug",
      p: `默认只输出 WARNING 以上到 stderr；[[--verbose]] 开 INFO，[[--debug]] 开 DEBUG 并打印 traceback。日志格式带时间/级别/模块，方便用户贴给你。

不要在 CLI 里 [[logging.basicConfig]] 多次；入口配置一次。库代码只 getLogger。[[--debug]] 时可以让异常继续抛，方便定位；正常模式捕获并返回码。

输出数据到 stdout 时，日志绝不能混进去；用 [[logging.StreamHandler(sys.stderr)]] 明确分流。`,
      code: String.raw`import argparse, logging, sys

p = argparse.ArgumentParser()
p.add_argument("--debug", action="store_true")
args = p.parse_args([])

logging.basicConfig(
    level=logging.DEBUG if args.debug else logging.WARNING,
    stream=sys.stderr,
    format="%(levelname)s %(name)s: %(message)s",
)
logging.getLogger("scores").info("start")`,
      output: `INFO scores: start`,
      tip: `日志 handler 指向 stderr；stdout 只放数据，管道才不会混入日志。`
    }
  ],
  "ch13-3": [
    {
      h: "深读：动态版本与 SCM 版本",
      p: `手写版本容易忘记改。[[setuptools-scm]] 从 Git tag 推导版本：tag [[v0.1.0]] 得到 0.1.0，开发中带 [[.devN+hash]]。pyproject 用 [[dynamic = ["version"]]] + [[[tool.setuptools_scm]]]。

动态版本要求构建时能访问 Git 元数据；sdist 里会写入版本，wheel 也能读。CI 浅克隆可能导致版本推导失败，设置 [[fetch-depth: 0]]。

不是所有项目都需要动态版本；小项目手写更直观。用动态版本就要保证 tag 规范，否则版本会很奇怪。`,
      code: String.raw`[project]
name = "scores"
dynamic = ["version"]

[tool.setuptools_scm]
version_scheme = "guess-next-dev"
local_scheme = "node-and-date"`,
      output: `scores 0.1.1.dev3+gabc1234`,
      tip: `动态版本从 Git tag 推导；CI 浅克隆会失败，[[fetch-depth: 0]] 要设。`
    },
    {
      h: "深读：wheel 平台标签与 manylinux",
      p: `纯 Python 包是 [[py3-none-any]]；带 C 扩展的包要按 Python ABI 和平台打标签，如 [[cp312-cp312-manylinux_2_17_x86_64]]。标签错了，pip 会拒绝安装或装错。

manylinux 用容器构建，保证 glibc 兼容；macOS 用 [[delocate]]/universal2；Windows 用对应 MSVC。不要在本机随便打「跨平台」wheel。

没有条件构建多平台 wheel 时，只发 sdist，让用户本地编译；README 要写清编译依赖。`,
      code: String.raw`# 纯 Python
scores-0.1.0-py3-none-any.whl

# 带扩展（示例）
scores-0.1.0-cp312-cp312-manylinux_2_17_x86_64.whl`,
      output: `scores-0.1.0-py3-none-any.whl`,
      tip: `纯 Python 用 [[py3-none-any]]；C 扩展按 ABI/平台打标签，别伪造跨平台 wheel。`
    },
    {
      h: "深读：trusted publishing 与发布安全",
      p: `PyPI trusted publishing 用 OIDC 短期凭证，CI 不需要长期 token。GitHub Actions 配 [[permissions: id-token: write]]，PyPI 项目侧绑定仓库/workflow/environment。

比 token 安全：凭证只在 job 内有效，不能被盗去长期上传。仍要限制谁能触发 release workflow（tag 保护、environment 审批）。

发布 job 只做 build/upload，不跑测试；测试在前置 job 通过才允许发布。`,
      code: String.raw`# .github/workflows/release.yml
# permissions:
#   id-token: write
# jobs:
#   publish:
#     environment: pypi
#     steps:
#       - uses: pypa/gh-action-pypi-publish@release/v1`,
      output: `Uploading distributions to https://upload.pypi.org/legacy/`,
      tip: `trusted publishing 用 OIDC 短期凭证；release workflow 加 environment 审批。`
    }
  ],
  "ch13-review": [
    {
      h: "本章复盘：能装、能跑、能复现",
      p: `项目结构的目标不是「看起来专业」，而是三件事：别人能安装、能运行、能复现。src 布局暴露漏打包；pyproject 说清元数据/依赖/入口；CLI 返回正确退出码；发布前在干净环境装 wheel。

三个检查点：[[pip install -e ".[dev]"]] 后测试通过；[[python -m build]] 后 wheel 内容完整；干净 venv 安装 wheel 后入口可用。三个都过，才算「能交付」。

本章验收：从零搭 [[src/scores]]，配 [[scores]] 命令、dev 依赖、pytest/ruff/mypy；构建 wheel 并在干净 venv 运行 [[scores --help]]。`,
      code: String.raw`python -m build
unzip -l dist/scores-0.1.0-py3-none-any.whl
python -m venv /tmp/verify
source /tmp/verify/bin/activate
python -m pip install dist/scores-0.1.0-py3-none-any.whl
scores --help`,
      output: `usage: scores [-h] {import,report} ...`,
      tip: `能装、能跑、能复现；三项都验证，才算项目结构完成。`
    }
  ]
});

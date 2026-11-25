window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch18-1": [
    {
      h: "深读：把用户故事映射到验收命令",
      p: `用户故事不是口号，要落到命令/断言。US1「导入并看到成功失败」对应 [[scores import sample.csv]] 输出 [[ok=8 failed=2]]；US2「个人最好」对应报表表格中的具体秒数；US3「团体总分」对应积分表；US4「导出报表」对应文件存在且章节齐全；US5「定位坏行」对应错误列表行号。

每条故事至少一个自动化检查；不能自动化的（如「教练觉得好用」）用人工验收清单。故事与验收的映射写进 README，评审时逐条过。

范围控制：本版不做 Web、不做数据库、不做实时计时；这些不是「以后再说」，而是明确排除，避免实现时偷偷扩张。`,
      code: String.raw`# README 验收映射
# US1 -> scores import sample.csv | grep "ok=8 failed=2"
# US2 -> report.md 包含 "林晓 | 100m | 62.35"
# US3 -> report.md 包含 "A | 13"
# US4 -> test -f report.md
# US5 -> import-report.json 中 row_no=3`,
      output: `5 mapped checks`,
      tip: `每条用户故事对应一条可执行验收；不能自动化的写人工清单；明确排除项。`
    },
    {
      h: "深读：契约先行的测试数据",
      p: `先写 [[sample.csv]] 和 [[expected.json]]，再写实现。样例覆盖：正常行、坏时间、缺队名、重复键、空 rank、超范围时间、非 UTF-8 编码。每类至少一行，错误行号固定。

测试数据放 [[tests/fixtures/]]，不要用生产数据；姓名/队名用虚构。期望结果手算并写注释，测试失败时能判断是实现错还是期望错。

数据契约变更时先改 fixture/expected，再改代码；否则测试会「跟着实现走」，失去意义。`,
      code: String.raw`# tests/fixtures/sample.csv
# date,meet,event,athlete,team,time,rank
# 2026-11-24,校运会,100m自由泳,林晓,A,1:02.35,1
# 2026-11-24,校运会,100m自由泳,周宁,B,abc,2
# 2026-11-24,校运会,100m自由泳,陈默,,58.20,3
# 2026-11-24,校运会,100m自由泳,林晓,A,1:03.00,1`,
          output: `4 rows: 1 ok, 3 bad`,
          tip: `fixture 覆盖正常/坏时间/缺队名/重复；期望手算，契约变更先改 fixture。`
    }
  ],
  "ch18-2": [
    {
      h: "深读：编码探测与失败回退",
      p: `计时软件可能导出 GBK/UTF-8 BOM。读取先试 [[utf-8-sig]]，[[UnicodeDecodeError]] 再试 [[gbk]]，都失败则报错并提示「请另存为 UTF-8」。不要静默用 [[errors="replace"]]，会把姓名变乱码。

编码探测库（chardet/charset-normalizer）可辅助，但对短文件不准；优先让用户明确编码，CLI 提供 [[--encoding]]。

检测到非 UTF-8 时在导入报告记录实际编码；下次可直接指定。`,
      code: String.raw`from pathlib import Path

def read_text(path: Path, encoding: str | None = None) -> tuple[str, str]:
    for enc in ([encoding] if encoding else ["utf-8-sig", "gbk"]):
        try:
            return path.read_text(encoding=enc), enc
        except UnicodeDecodeError:
            continue
    raise ValueError("无法解码，请另存为 UTF-8")

text, enc = read_text(Path("sample.csv"))
print(enc, len(text.splitlines()))`,
      output: `utf-8-sig 5`,
      tip: `先 utf-8-sig 再 gbk，都失败就报错；不要 errors="replace" 静默乱码。`
    },
    {
      h: "深读：错误报告的可读结构",
      p: `[[import-report.json]] 顶层：[[summary(total, ok, failed, duplicates, encoding)]] 和 [[errors[]]]。每条错误带 [[row_no, column, reason, raw]]；raw 只保留相关字段，避免泄露整行隐私。

CLI 摘要只打印计数与前 5 条错误；完整错误进文件。超过 100 条错误时提示「查看报告」。

错误报告按批次目录保存，不覆盖；文件名带时间戳/输入哈希。`,
      code: String.raw`import json

report = {
    "summary": {"total": 10, "ok": 6, "failed": 3, "duplicates": 1, "encoding": "utf-8-sig"},
    "errors": [{"row_no": 3, "column": "time", "reason": "格式应为 mm:ss.ms", "raw": {"time": "abc"}}],
}
print(json.dumps(report, ensure_ascii=False)[:120])`,
      output: `{"summary": {"total": 10, "ok": 6, "failed": 3, "duplicates": 1, "encoding": "utf-8-sig"}, "errors": [{"row_no": 3...`,
      tip: `报告分 summary/errors；错误带行号/列/原因/相关原值；按批次保存不覆盖。`
    }
  ],
  "ch18-3": [
    {
      h: "深读：积分规则配置化",
      p: `把积分表放 [[config.toml]]：[[[points]]] 1=8, 2=6...；接力是否双倍、是否计入团体也用开关。代码不硬编码 8/6/5，换赛事只改配置。

配置要有默认值并校验：名次必须是正整数、积分非负、并列规则枚举。非法配置启动时 fail-fast。

输出团体分时附「规则版本」，报表可追溯。`,
      code: String.raw`import tomllib

config = tomllib.loads("""
[points]
1 = 8
2 = 6
3 = 5
relay_multiplier = 2
""")
print(config["points"][1], config["points"]["relay_multiplier"])`,
      output: `8 2`,
      tip: `积分表放配置，不硬编码；启动校验合法性，报表记录规则版本。`
    },
    {
      h: "深读：并列与接力的业务规则",
      p: `并列名次有两种处理：同名次同积分（1,2,2,4），或平均积分。接力可能双倍、可能只算团体。规则必须由教练确认，不能程序猜。

实现上把「名次 → 积分」做成函数，输入 [[rank, is_relay, config]]，输出 points；单测覆盖并列/接力/缺 rank。

报表注明采用的规则；否则两次报表总分不同会被认为 bug。`,
      code: String.raw`def points_for(rank, relay=False, table=None, multiplier=2):
    if rank is None:
        return 0
    base = (table or {1: 8, 2: 6, 3: 5}).get(rank, 0)
    return base * multiplier if relay else base

print(points_for(1), points_for(1, relay=True), points_for(None))`,
      output: `8 16 0`,
      tip: `并列/接力规则由业务确认；[[points_for]] 纯函数可测，报表注明规则。`
    }
  ],
  "ch18-4": [
    {
      h: "深读：HTML 报表与打印",
      p: `Markdown 适合仓库阅读；给教练可加 [[report.html]]：固定模板 + 表格 + 内嵌图片。HTML 用 [[html.escape]] 转义姓名/队名，防止注入。

打印样式 [[@media print]] 隐藏按钮/调整页边距；图表用 PNG 嵌入或相对路径。不要依赖外网 CSS。

HTML 与 Markdown 共用统计结果，避免两套数字不一致；渲染函数只负责格式。`,
      code: String.raw`from html import escape

name = "<林晓>"
print(f"<td>{escape(name)}</td>")`,
      output: `<td>&lt;林晓&gt;</td>`,
      tip: `HTML 报表转义所有用户字段；打印样式单独写，图表用相对路径。`
    },
    {
      h: "深读：报表的可访问性与一致性",
      p: `表格要有表头 [[<th>]]、图表有 [[alt]]、颜色不作为唯一信息；深色/浅色打印都要能读。数字右对齐、单位写在表头。

同一份报表里「个人最好」和「进步」的时间格式一致（秒/分:秒），不要一处 62.35、一处 1:02.35。

生成后做一致性检查：总人数=个人最好行数？团体总分之和=所有积分？不一致要警告。`,
      code: String.raw`rows = [{"athlete": "林晓", "seconds": 62.35}, {"athlete": "周宁", "seconds": 62.1}]
print(len(rows), round(sum(r["seconds"] for r in rows), 2))`,
          output: `2 124.45`,
          tip: `表头/alt/对比度；时间格式统一；生成后做人数/总分一致性检查。`
    }
  ],
  "ch18-5": [
    {
      h: "深读：变异测试与测试有效性",
      p: `覆盖率只证明「执行过」，不证明「能发现错误」。变异测试（mutmut/cosmic-ray）自动改代码，测试应该失败；存活变异说明测试太弱。

手写简化版：把 [[<]] 改成 [[<=]]、把 [[+]] 改成 [[-]]，跑测试；若仍全绿，补边界用例。不要为了杀死所有变异写脆弱测试。

重点覆盖业务规则（积分、去重、时间范围），而不是 getter/格式化细节。`,
      code: String.raw`def score_ok(seconds: float) -> bool:
    return 0 < seconds < 3600

# 变异：0 < seconds <= 3600
# 边界测试应覆盖 0、3600、3599.99`,
          output: `3 boundary cases`,
          tip: `覆盖率不等于有效性；用变异/改运算符验证测试会红，重点覆盖业务规则。`
    },
    {
      h: "深读：测试数据与生产数据的隔离",
      p: `测试不得读生产 CSV/数据库；fixture 用虚构数据，路径 [[tmp_path]]。集成测试可以用匿名化样本，但要放在 [[tests/fixtures/]] 并注明来源/许可。

测试产生的输出写临时目录，不写项目根；CI 上并行测试不会互相覆盖。

日志/快照里不要出现真实姓名/联系方式；黄金文件也要脱敏。`,
      code: String.raw`from pathlib import Path
import tempfile

with tempfile.TemporaryDirectory() as tmp:
    out = Path(tmp) / "report.md"
    out.write_text("# test", encoding="utf-8")
    print(out.exists())`,
      output: `True`,
          tip: `测试用虚构数据 + tmp_path；不读生产数据，黄金文件脱敏。`
    }
  ],
  "ch18-6": [
    {
      h: "深读：发布回滚与版本策略",
      p: `发布前打 tag、保存 wheel；出问题回滚到上一个 wheel，而不是「改代码再发」。数据库/配置变更要可逆，迁移脚本先备份。

版本号只升不降；PyPI 不能覆盖同版本。内部部署可以用 [[scores==0.2.0]] 固定版本，升级前在 staging 跑样例。

回滚演练：在测试环境装旧 wheel，确认入口/报表仍可用；不要等事故时才试。`,
      code: String.raw`# 回滚示例
# pip install scores==0.2.0
# scores --version
# scores report sample.csv --out /tmp/rollback.md`,
          output: `0.2.0`,
          tip: `发布留 tag/wheel；回滚装旧版本而不是临时改代码；升级前 staging 验证。`
    },
    {
      h: "深读：项目交付清单与作品集写法",
      p: `交付清单：README（问题/安装/使用/测试）、LICENSE、CHANGELOG、sample 数据、验收命令、已知限制。缺一项，接手人就要重新猜。

作品集描述用「问题 → 方案 → 验证 → 复盘」四段，每段有数字：输入 10 行、成功 6、失败 3、去重 1；测试 14 个；报表生成 0.4 秒。

不要写「使用了 Python/pandas」当成果；写「解决了什么、怎么验证、哪里还会崩」。`,
      code: String.raw`# 交付清单
# [x] README
# [x] LICENSE
# [x] CHANGELOG
# [x] sample.csv
# [x] 验收命令
# [x] 已知限制：仅支持 50/100/200m；不含接力双倍规则`,
          output: `6/6 delivered`,
          tip: `交付清单齐全；作品集写问题/方案/验证/复盘，用数字而不是技术名词堆砌。`
    }
  ],
  "ch18-review": [
    {
      h: "全书复盘：从语法到交付的闭环",
      p: `五篇 18 章走到这里，真正的收获不是「记住 58 节」，而是能独立完成一条链路：读需求 → 定契约 → 写代码 → 写测试 → 打包 → 定时运行 → 告警 → 复盘。

遇到新需求，先问：数据契约是什么？边界/错误怎么处理？怎么验证？怎么回滚？这四问比「用哪个库」更重要。

下一步建议：把项目换成 SQLite/HTTP API 版本，保持测试绿；或把报表做成 Web，但统计层不动。每次只改一个维度，才是可迁移的练习。`,
      code: String.raw`# 结课四问
# 1 数据契约是什么？
# 2 边界/错误怎么处理？
# 3 怎么验证？
# 4 怎么回滚？`,
          output: `4 questions`,
          tip: `能力是需求→契约→实现→测试→交付→复盘；下一步只改一个维度。`
    }
  ]
});

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

  add("ch15-1", [{
    h: "工程深化：视图、副本、dtype 与广播的内存账",
    p: `NumPy 的切片通常返回视图，不是副本。[[a[1:3]]] 和 [[a]] 共享内存；改切片会影响原数组。[[a[::2]]]、[[a.T]] 也可能是视图。需要独立数据时显式 [[.copy()]]。很多「为什么原数组变了」的 bug，都是忘了这一步。

[[reshape]] 能在不复制的情况下改变形状，前提是元素连续；[[ravel]] 返回视图（能返回时），[[flatten]] 总是返回副本。[[a.T]] 对二维是转置视图，对高维是轴交换。[[np.ascontiguousarray]] 可以让内存连续，但可能复制。性能优化前先用 [[a.base]]、[[a.flags]] 判断是否视图。

dtype 决定内存和精度。[[int8]] 范围 -128..127，成绩秒数用 [[float32]] 可能丢精度；金额用整数分或 [[Decimal]]，不要用 float。[[astype]] 总是复制（默认 copy=True），并做类型转换；溢出会静默回绕，不报错。转换前检查范围。

广播让形状不同的数组能运算，但规则严格：从右往左对齐，维度相等或其中一个为 1。[[(3,1) + (1,4)]] 得到 (3,4)；[[(3,) + (4,)]] 直接报错。广播不复制数据，但结果会分配新数组；大数组要估算内存，避免一次生成几个 GB。

[[np.newaxis]] 或 [[None]] 可以加维度，[[a[:, None]]] 把一维变列向量。别为了「能跑」乱加维度，先画出形状。调试时打印 [[a.shape]]、[[b.shape]]、[[result.shape]]，比看报错快。

原地运算 [[a += 1]] 省内存，但会修改共享视图的底层数据；如果 a 是别人的切片，会影响原数组。需要保留输入时用 [[a = a + 1]]。函数设计要明确「是否修改入参」，文档写清楚。

验收：切片改原数组是否变化？reshape 是否复制？astype 溢出是否发现？广播形状是否算对？大数组内存是否翻倍？`,
    code: String.raw`import numpy as np

a = np.arange(12, dtype=np.int32).reshape(3, 4)
view = a[:, 1]
view[0] = 99
print(a[0, 1])          # 99，视图共享内存
copy = a[:, 1].copy()
copy[0] = 7
print(a[0, 1])          # 99，副本不影响

b = np.array([[1], [2], [3]])   # (3,1)
c = np.array([10, 20, 30, 40])  # (4,)
print((b + c).shape)            # (3,4)`,
    output: `99
99
(3, 4)`,
    tip: `切片多为视图；copy 才独立；dtype 溢出静默；广播从右对齐，维度相等或为 1。`
  }, {
    h: "故障排查：NaN、随机数与浮点比较",
    p: `[[np.nan]] 不是「空值」，而是一个特殊的浮点数。[[nan == nan]] 为 False，[[nan != nan]] 为 True；判断要用 [[np.isnan]]。NaN 会传播：任何含 NaN 的求和结果是 NaN，除非用 [[np.nansum]]、[[np.nanmean]]。不要用 [[== None]] 判断缺失，None 和 NaN 是两回事。

pandas 的缺失值可能是 [[NaN]]、[[None]]、[[pd.NaT]]。[[isna()]] 能统一判断；[[fillna]] 可以填，但填 0 和填均值语义不同，要在报告里说明。[[dropna]] 会丢行，先统计丢了多少、是否集中在某些列，不要静默丢。

浮点比较不要用 [[==]]。[[0.1 + 0.2 != 0.3]] 是正常的二进制表示问题；用 [[np.isclose]] 或 [[math.isclose]]，设置 [[rtol]]/[[atol]]。金额比较用整数分或 Decimal；排序/分组用浮点键可能把「相等」拆成两组。

随机数要固定种子才能复现。[[np.random.default_rng(42)]] 比旧 [[np.random.seed]] 更推荐；每次实验新建 rng，不要全局污染。需要可重复的划分，用 [[train_test_split(random_state=42)]] 或保存索引。随机增强、抽样、打乱都要记录种子。

随机抽样要区分「有放回」和「无放回」。[[rng.choice(n, size=k, replace=False)]] 无放回；[[replace=True]] 可能重复。分层抽样要按类别比例，先分组再抽，不要全表随机导致小类消失。

统计前先看分布：均值、分位数、最大值、空值率。异常值可能是真实成绩，也可能是录入错误；不要一上来就删。用箱线图或 [[describe()]] 找离群点，再回到原始记录确认。

验收：NaN 判断用 isnan；求和用 nansum；浮点比较用 isclose；随机实验可复现；缺失值处理有报告；异常值经过确认。`,
    code: String.raw`import numpy as np
import pandas as pd

a = np.array([1.0, np.nan, 3.0])
print(np.isnan(a).tolist())
print(np.nansum(a), np.nanmean(a))

print(np.isclose(0.1 + 0.2, 0.3))

rng = np.random.default_rng(42)
sample = rng.choice(10, size=3, replace=False)
print(sample)

df = pd.DataFrame({"x": [1, None, 3], "y": [np.nan, 5, 6]})
print(df.isna().sum().to_dict())`,
    output: `[False, True, False]
4.0 2.0
True
[8 1 5]
{'x': 1, 'y': 1}`,
    tip: `NaN 用 isnan；nansum 跳过 NaN；浮点用 isclose；随机固定种子；缺失处理要报告。`
  }]);

  add("ch15-2", [{
    h: "工程深化：merge 校验、pipe 与数据管道",
    p: `[[pd.merge]] 默认 [[how="inner"]]，只保留两边都匹配的键。很多「数据变少」的 bug 是因为默认 inner，而你以为在左连接。明确写 [[how="left"]]、[[how="outer"]]，并检查行数变化。连接前先确认两边的键唯一性，否则会多对多爆炸。

[[validate="one_to_one"]]、[[one_to_many"]]、[[many_to_one"]] 能让 pandas 在键不唯一时报错，而不是静默产生笛卡尔积。这是 merge 最重要的参数之一。没有它，一个重复键可能让 100 行变 10,000 行，后面统计全错。

连接键的类型要一致。一边是字符串 "01"，一边是整数 1，merge 不会匹配；一边有空格，一边没有，也不会匹配。连接前统一去空格、转类型、统一大小写。日期要对齐时区，[[2026-01-01]] 和 [[2026-01-01 00:00+08:00]] 可能不相等。

[[DataFrame.pipe]] 把多个步骤串成可读的管道：[[df.pipe(clean).pipe(enrich).pipe(validate)]]。每个函数接收并返回 DataFrame，便于测试和复用。不要在 pipe 里做原地修改，返回新对象；否则调试时不知道哪一步改了数据。

管道每步后检查形状和关键列：行数、列数、空值率、唯一键数。加一个 [[audit(df, step)]] 函数打印这些指标，异常时能定位到具体步骤。不要等最后才发现数据不对。

列名统一用 snake_case，避免空格和中文混用；外部数据映射到内部列名在入口完成。输出时再映射回中文表头。内部列名稳定，代码才不会因为展示文案变化而崩。

验收：merge 前后行数符合预期；重复键会报错；类型不一致能发现；pipe 每步可单独测试；列名映射集中在入口/出口。`,
    code: String.raw`import pandas as pd

left = pd.DataFrame({"id": [1, 2, 3], "score": [91, 88, 95]})
right = pd.DataFrame({"id": [1, 2, 2], "bonus": [1, 2, 3]})

try:
    merged = left.merge(right, on="id", how="left", validate="one_to_one")
except pd.errors.MergeError as exc:
    print("merge rejected:", exc)

def clean(df):
    return df.assign(name=df["name"].str.strip())

def audit(df, step):
    print(step, df.shape, int(df.isna().sum().sum()))
    return df

df = pd.DataFrame({"name": [" 林晓 ", "陈默"]})
df.pipe(clean).pipe(audit, "after-clean")`,
    output: `merge rejected: Merge keys are not unique in right dataset; not a one-to-one merge
after-clean (2, 1) 0`,
    tip: `merge 明确 how 与 validate；键类型/空格/时区先统一；pipe 每步 audit；列名入口映射。`
  }, {
    h: "故障排查：时间序列、重采样与导出精度",
    p: `时间序列的第一件事是确认索引类型。[[pd.to_datetime]] 把字符串转成 Timestamp；[[set_index]] 后 [[resample]] 才能按时间聚合。时区用 [[tz_localize]] 标注，[[tz_convert]] 转换；不要混用 naive 和 aware，比较会报错或结果偏移。

[[resample("1D").sum()]] 会把每天的数据聚合；没有数据的日期可能缺失，需要 [[asfreq("1D")]] 补齐或用 [[reindex]]。补齐后空值是 0 还是 NaN，取决于业务：没有比赛的日子，跑量是 0；没有测量的日子，可能是缺失。不要一律 fillna(0)。

滚动窗口 [[rolling(7).mean()]] 默认要求窗口内全有值，前面 6 天是 NaN；[[min_periods=1]] 可以让前面也有值。[[expanding]] 是从头累计。窗口对齐要看清是「过去 7 天」还是「中心 7 天」，默认是右对齐（包含当前）。

导出 CSV 时，日期格式、浮点精度、编码都要明确。[[to_csv(index=False, encoding="utf-8-sig")]] 对 Excel 友好；[[float_format="%.2f"]] 控制小数，但会丢精度。需要下游再计算时，保留足够精度；只展示时再格式化。

Excel 导出用 [[to_excel]]，但大文件慢且有限制；超过几十万行用 CSV。多个 sheet 用 [[ExcelWriter]]，写完关闭。公式、样式、列宽要用 openpyxl 后处理，不要把展示逻辑混进数据层。

验收：时区正确；重采样后日期连续；滚动窗口边界符合定义；导出行数/列数/精度正确；Excel 能被目标程序打开。`,
    code: String.raw`import pandas as pd

df = pd.DataFrame({
    "date": pd.to_datetime(["2026-11-01", "2026-11-03"]),
    "km": [5.0, 8.0],
}).set_index("date")

daily = df.resample("1D").sum()
full = daily.asfreq("1D", fill_value=0)
print(full)
print(df["km"].rolling(2, min_periods=1).mean().tolist())
full.to_csv("weekly.csv", index=True, encoding="utf-8-sig", float_format="%.2f")`,
    output: `            km
date          
2026-11-01  5.0
2026-11-02  0.0
2026-11-03  8.0
[5.0, 6.5]`,
    tip: `时间索引 + 时区明确；resample 后补日期；rolling 设 min_periods；导出精度按用途。`
  }]);

  add("ch15-3", [{
    h: "工程深化：图表不说谎——坐标轴、比例与标注",
    p: `同一个数据可以画出完全不同的结论，问题常出在坐标轴。柱状图不从 0 开始会放大差异；折线图截断 y 轴会让小波动看起来像暴涨。默认让 y 从 0 开始，除非你明确要展示变化幅度，并在标题/注释里说明「y 轴截断」。

饼图不适合超过 5 类，也不适合比较相近比例；人眼对角度不敏感。用条形图排序展示更清楚。堆叠柱状图能看总量和构成，但比较中间类别很难；需要比较具体类别时用分组柱状图或小多图。

颜色要有语义且可访问。不要用红绿 alone 区分胜负（色盲不友好），加形状/文字/图案。顺序数据用单色渐变，分类数据用定性色板；不要彩虹色堆在一起。深色背景和浅色背景都要检查对比度。

标题写结论，不写「成绩图」。例如「前 3 名成绩差距在 0.2 秒内」比「百米成绩」有用。轴标签带单位，图例不要遮挡数据。数据来源和生成时间放在图脚，方便追溯。

标注要克制。只标关键点：最大值、最小值、异常、目标线。每个点都标数字会变成灾难。用 [[ax.annotate]] 加箭头，偏移避免压线；字体大小不小于 8pt。

导出图片要固定尺寸和 DPI。[[figsize=(8, 4.5)]]、[[dpi=200]]、[[bbox_inches="tight"]] 能避免裁切。PNG 适合网页，PDF/SVG 适合印刷和缩放。不要用截图代替导出，分辨率不可控。

验收：柱状图从 0 开始；饼图类别少；颜色可区分；标题有结论；单位/来源齐全；导出无裁切。`,
    code: String.raw`import matplotlib.pyplot as plt

events = ["100m", "200m", "400m"]
seconds = [12.34, 25.10, 58.20]

fig, ax = plt.subplots(figsize=(8, 4.5))
bars = ax.bar(events, seconds, color="#4C78A8")
ax.set_ylim(0, max(seconds) * 1.1)
ax.set_ylabel("成绩（秒）")
ax.set_title("400 米用时最长，三项差距明显")
for bar, value in zip(bars, seconds):
    ax.annotate(f"{value:.2f}", (bar.get_x() + bar.get_width() / 2, value),
                ha="center", va="bottom", fontsize=9)
ax.spines["top"].set_visible(False)
ax.spines["right"].set_visible(False)
fig.tight_layout()
fig.savefig("events.png", dpi=200)`,
    output: `# events.png：y 轴从 0 开始，柱顶标注成绩，
# 标题给出结论，单位与来源清楚。`,
    tip: `柱状图 y 从 0；饼图类别 ≤5；颜色可访问；标题写结论；导出固定 DPI。`
  }, {
    h: "故障排查：自动报表的模板、缓存与交付",
    p: `自动报表不是「跑一次 matplotlib 存图」就结束。它要能被重复生成、能被别人看懂、能追溯数据版本。把报表拆成数据、模板、渲染三层：数据层产出 DataFrame/JSON，模板层管布局，渲染层输出 HTML/PDF/PNG。三层分开，改样式不影响计算。

模板用 Jinja2 比字符串拼接安全、可维护。HTML 模板里表格用 [[to_html]] 或手动循环；图片用 base64 内嵌或文件路径。内嵌单文件方便邮件发送，但体积大；外链文件适合网页，但要保证路径可访问。不要在模板里做复杂计算，计算在数据层完成。

报表要带元数据：生成时间、数据区间、数据版本、筛选条件、生成人/任务 id。没有这些，读者不知道看的是哪一版。页脚放「数据来源 + 生成命令」，方便复现。

缓存用于避免重复计算，但要能失效。按「数据哈希 + 模板版本 + 参数」做缓存键；数据变了、模板改了，键就变。不要只用日期做键，同一天重跑会拿到旧结果。缓存文件放临时目录，失败时不要返回半成品。

交付要考虑接收者：邮件正文给结论摘要，附件给完整报表；网页给交互筛选，PDF 给打印。文件名带日期和版本，例如 [[scores-2026-11-25-v1.html]]。不要用 [[report_final_final.html]]。

失败要有兜底：数据缺失时生成「部分报表」并标注缺失项，而不是空白页；渲染异常时保留日志和中间数据，方便重跑。把「生成成功」和「数据完整」分开判断。

验收：同一输入重复生成哈希一致；数据更新后缓存失效；报表含元数据；邮件/网页/PDF 都能打开；失败时能看到缺失项和日志。`,
    code: String.raw`from jinja2 import Template
from datetime import datetime
import hashlib, json

rows = [{"athlete": "林晓", "seconds": 12.34}]
payload = json.dumps(rows, ensure_ascii=False, sort_keys=True)
version = hashlib.sha256(payload.encode()).hexdigest()[:8]

tpl = Template("""
<h1>成绩报表</h1>
<p>数据版本 {{ version }}，生成于 {{ generated }}</p>
<table>
{% for r in rows %}<tr><td>{{ r.athlete }}</td><td>{{ r.seconds }}</td></tr>{% endfor %}
</table>
""")
html = tpl.render(rows=rows, version=version,
                  generated=datetime.now().strftime("%Y-%m-%d %H:%M"))
open(f"scores-{version}.html", "w", encoding="utf-8").write(html)`,
    output: `# scores-a1b2c3d4.html
# 含数据版本、生成时间、表格与来源信息`,
    tip: `数据/模板/渲染分层；报表带版本元数据；缓存键含数据哈希与模板版本；失败保留中间产物。`
  }]);
})();

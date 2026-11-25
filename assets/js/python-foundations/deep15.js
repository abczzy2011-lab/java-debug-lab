window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch15-1": [
    {
      h: "深读：dtype 与内存，别把整数存成 object",
      p: `NumPy 数组的内存 ≈ 元素数 × 每元素字节。int64 8 字节，float64 8 字节，object 存指针（还要额外对象），字符串数组尤其浪费。读 CSV 时让 pandas 推断 dtype，常把含缺失的整数变成 float，或把混合列变成 object。

用 [[df.dtypes]] 检查；[[df.memory_usage(deep=True)]] 看真实占用。分类列用 [[category]]，小整数用 [[int8/int16]]，能省一个数量级。

但不要为了省内存把精度降过头：分数/金额用 float 会丢精度，金额用整数分或 Decimal。先保证正确，再优化内存。`,
      code: String.raw`import numpy as np
import pandas as pd

a = np.array([1, 2, 3], dtype=np.int8)
print(a.nbytes)
df = pd.DataFrame({"team": ["A", "B", "A"] * 1000})
print(df["team"].nbytes, df["team"].astype("category").nbytes)`,
      output: `3
24000 3000`,
      tip: `[[dtypes]] + [[memory_usage(deep=True)]] 看占用；金额别用 float，精度优先。`
    },
    {
      h: "深读：视图与副本，改错一个就污染原数据",
      p: `[[a[1:3]]] 是视图，[[a[[1, 2]]] 是副本（花式索引）；[[a.reshape]] 可能返回视图，[[a.flatten]] 返回副本。改视图会影响原数组，改副本不会。

pandas 的 [[df[["a"]]] 返回副本，[[df.loc[:, "a"]]] 可能返回视图；链式赋值 [[df[df.a > 0]["b"] = 1]] 可能不生效（SettingWithCopyWarning）。用 [[df.loc[cond, "b"] = 1]] 一步到位。

需要独立数据时显式 [[.copy()]]；不要依赖「看起来像复制」。`,
      code: String.raw`import numpy as np
import pandas as pd

a = np.array([1, 2, 3, 4])
view = a[1:3]
view[0] = 99
print(a)

df = pd.DataFrame({"a": [1, -1], "b": [0, 0]})
df.loc[df["a"] > 0, "b"] = 1
print(df)`,
      output: `[ 1 99  3  4]
   a  b
0  1  1
1 -1  0`,
      tip: `切片是视图，花式索引是副本；pandas 用 [[.loc]] 一步赋值，别链式。`
    },
    {
      h: "深读：NaN、inf 与缺失语义",
      p: `NumPy 的浮点缺失用 [[np.nan]]，它不等于自己（[[nan != nan]]）；判断用 [[np.isnan]]。整数数组不能直接存 NaN，除非转 float 或使用掩码数组。

[[np.inf]] 参与运算会产生 inf/nan；清洗时用 [[np.isfinite]] 过滤。pandas 的 [[pd.NA]] 是统一缺失值，和 [[np.nan]] 行为略有不同；[[isna]] 都能识别。

聚合默认跳过 NaN（[[np.nansum]]），但 [[sum]] 会传播 NaN。到底跳过还是报错，要按业务明确，不要默认。`,
      code: String.raw`import numpy as np

a = np.array([1.0, np.nan, np.inf])
print(np.isnan(a))
print(np.isfinite(a))
print(a.sum(), np.nansum(a))`,
      output: `[False  True False]
[ True False False]
inf inf`,
      tip: `NaN 用 [[isnan]] 判断；[[sum]] 传播 NaN，[[nansum]] 跳过；业务语义要明确。`
    },
    {
      h: "深读：向量化的边界与性能验证",
      p: `向量化快，但不是所有逻辑都能表达。需要状态机/提前退出/复杂分支时，循环可能更清晰；可以先用循环写对，再 profile 决定是否优化。

[[np.vectorize]] 只是「方便的循环」，不是真向量化，别用它假装加速。[[numba]] 可以把循环 JIT 编译，但增加依赖/编译时间。

性能验证用 [[time.perf_counter]] 对比同结果的两版实现；不要凭感觉说「向量化快 100 倍」。`,
      code: String.raw`import numpy as np, time

n = 1_000_000
a = np.arange(n)
t0 = time.perf_counter()
b = a * 2 + 1
t1 = time.perf_counter()
print(round((t1 - t0) * 1000, 2), "ms")`,
      output: `1.8 ms`,
      tip: `[[np.vectorize]] 不是加速；复杂逻辑先写对再 profile，用真实计时对比。`
    }
  ],
  "ch15-2": [
    {
      h: "深读：方法链与 pipe，让清洗可读",
      p: `pandas 方法链把「读→去重→转换→分组」写成一条表达式，中间不产生一堆临时变量。每步一行，便于注释/调试。

[[pipe]] 可以插入自定义函数，保持链式；[[assign]] 新增列，[[query]] 过滤，[[loc]] 选列。链太长时拆成命名步骤，别为了一行写 20 个方法。

调试链式：在中间 [[.pipe(lambda d: (print(d.shape), d)[1])]]，或拆开逐步跑。不要在生产代码里留 print。`,
      code: String.raw`import pandas as pd

df = (pd.DataFrame({"id": [1, 2, 2], "score": ["91", "bad", "86"]})
      .drop_duplicates("id")
      .assign(score=lambda d: pd.to_numeric(d["score"], errors="coerce"))
      .dropna(subset=["score"]))
print(df)`,
      output: `   id  score
0   1   91.0
2   2   86.0`,
      tip: `链式每步一行；[[assign]]/[[query]] 保持可读，太长就拆命名步骤。`
    },
    {
      h: "深读：apply、map 与向量化的选择",
      p: `[[Series.map]] 是逐元素映射（字典/函数）；[[Series.apply]] 也是逐元素，但可以返回复杂对象；[[DataFrame.apply]] 按行/列，慢。能用向量化/内置函数就不要 apply。

[[groupby.apply]] 适合「每组返回多行/复杂对象」，但结果索引可能多级；[[groupby.agg]] 更快、结果规整。先试 agg，不够再 apply。

apply 里的函数要纯、可测试；不要在 apply 里做 I/O/网络请求，行数一多就灾难。`,
      code: String.raw`import pandas as pd

s = pd.Series([91, 86, 78])
print(s.map({91: "A", 86: "B"}).fillna("C").tolist())
print(s.apply(lambda x: "pass" if x >= 80 else "fail").tolist())`,
      output: `['A', 'B', 'C']
['pass', 'pass', 'fail']`,
      tip: `[[map]] 做映射、[[apply]] 做复杂逐元素；优先向量化，apply 里别做 I/O。`
    },
    {
      h: "深读：时间序列与 resample",
      p: `时间列先 [[pd.to_datetime]]，设为索引；[[resample("W").mean()]] 按周聚合，[[resample("M").sum()]] 按月。缺失周期会出 NaN，按业务填 0 或前值。

时区要明确：[[tz_localize]]/[[tz_convert]]；跨时区比较先统一 UTC。不要混用 naive 和 aware 时间。

滚动窗口 [[rolling(7).mean()]] 与 resample 不同：前者按行数，后者按时间频率。数据有缺天时，rolling 会把不连续当连续。`,
      code: String.raw`import pandas as pd

idx = pd.to_datetime(["2026-11-02", "2026-11-09", "2026-11-16"])
s = pd.Series([80, 85, 90], index=idx)
print(s.resample("W").mean().tolist())
print(s.rolling(2).mean().round(1).tolist())`,
      output: `[80.0, 85.0, 90.0]
[NaN, 82.5, 87.5]`,
      tip: `resample 按时间频率、rolling 按行数；缺天会让 rolling 误当连续，时区先统一。`
    },
    {
      h: "深读：导出与交换格式的坑",
      p: `[[to_csv(index=False, encoding="utf-8-sig")]] 给 Excel 打开中文不乱码；[[to_excel]] 需要 openpyxl，写多 sheet 用 [[ExcelWriter]]。

CSV 有类型丢失：数字/日期读回来变字符串；需要类型契约时用 Parquet/JSON+schema。Parquet 保留 dtype、体积小，适合中间数据。

导出前检查：列顺序、空值表示、日期格式、是否含索引。下游系统可能把 [[NaN]] 当字符串 "nan"。`,
      code: String.raw`import pandas as pd

df = pd.DataFrame({"name": ["林晓"], "score": [91]})
df.to_csv("out.csv", index=False, encoding="utf-8-sig")
print(open("out.csv", encoding="utf-8-sig").read())`,
      output: `name,score
林晓,91`,
      tip: `中文 CSV 用 [[utf-8-sig]]；中间数据优先 Parquet，CSV 会丢类型。`
    }
  ],
  "ch15-3": [
    {
      h: "深读：多子图与共享轴",
      p: `[[plt.subplots(1, 2, sharey=True)]] 创建共享 y 轴的子图，便于对比；[[ax.twinx()]] 是双 y 轴，慎用。子图标题用 [[set_title]]，总标题用 [[suptitle]]。

子图间距用 [[fig.tight_layout()]] 或 [[constrained_layout=True]]；标签旋转 [[tick_params(axis="x", rotation=45)]]。

多图不要共用全局 [[plt]] 状态；每个 ax 明确操作，避免「画到一半发现画错图」。`,
      code: String.raw`import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, axes = plt.subplots(1, 2, figsize=(8, 3), sharey=True)
axes[0].plot([1, 2, 3], [80, 85, 90])
axes[0].set_title("A")
axes[1].plot([1, 2, 3], [70, 78, 86])
axes[1].set_title("B")
fig.tight_layout()
fig.savefig("two.png", dpi=150)
print("ok")`,
      output: `ok`,
      tip: `多子图用 [[subplots]] + 每个 ax 操作；[[twinx]] 双轴慎用，容易制造假相关。`
    },
    {
      h: "深读：标注、误差棒与统计诚实",
      p: `[[ax.errorbar(x, y, yerr=...)]] 表达不确定性；[[ax.annotate]] 标注关键点/异常。没有误差数据时不要画假误差棒。

样本量小/分布偏态时，均值图会误导；用中位数 + 四分位/散点展示分布。[[boxplot]] 能显示离群点。

图标题写清「均值 ± 标准差，n=20」；否则读者无法判断差异是否可靠。`,
      code: String.raw`import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(4, 3))
ax.errorbar([1, 2, 3], [80, 85, 88], yerr=[2, 3, 2], capsize=4, marker="o")
ax.set_title("mean ± sd (n=20)")
fig.tight_layout()
fig.savefig("err.png", dpi=150)`,
      output: `saved err.png`,
      tip: `没有误差就别画误差棒；小样本用中位数/散点，标题写清 n 和统计量。`
    },
    {
      h: "深读：报告自动化与图表版本",
      p: `报告脚本输出：[[summary.csv]]、[[chart.png]]、[[report.md]]。文件名带日期/参数哈希，避免覆盖；或输出到带时间戳目录。

[[report.md]] 里引用相对路径图片，数据表用 Markdown；需要 PDF/HTML 时再转换。不要让报告依赖 Notebook 的执行状态。

每次运行记录：输入文件哈希、参数、Python/库版本、seed。复现时能定位差异。`,
      code: String.raw`from pathlib import Path
import hashlib, json

data = b"name,score\nlin,91\n"
digest = hashlib.sha256(data).hexdigest()[:12]
meta = {"input_sha256": digest, "seed": 42, "python": "3.12"}
Path("meta.json").write_text(json.dumps(meta, ensure_ascii=False), encoding="utf-8")
print(meta)`,
      output: `{'input_sha256': '...', 'seed': 42, 'python': '3.12'}`,
      tip: `报告产物带版本/哈希；记录输入哈希、参数、库版本、seed，复现才可定位差异。`
    },
    {
      h: "深读：图表在网页/文档中的可读性",
      p: `网页用 [[dpi=150–200]]、宽度适配容器；深色模式要测，透明背景可能变黑。文档打印用矢量 PDF/SVG，避免 PNG 放大模糊。

图例/字号在手机上看不清是常见问题；导出前缩到目标宽度检查。颜色在投影仪/打印上可能失真，准备高对比版本。

交互图（Plotly/Bokeh）适合探索，不适合正式报告附件；正式报告用静态图 + 数据表。`,
      code: String.raw`import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(3, 2))
ax.plot([1, 2], [1, 2])
fig.savefig("small.svg")
fig.savefig("small.png", dpi=200)
print("svg + png")`,
      output: `svg + png`,
      tip: `网页 PNG 150–200dpi，打印用 SVG/PDF；缩到目标宽度检查字号/图例。`
    }
  ],
  "ch15-review": [
    {
      h: "本章复盘：先看对，再画对",
      p: `NumPy 解决「同构数组快速运算」，pandas 解决「带标签表格清洗/聚合」，matplotlib 解决「把结论画出来」。三者顺序是：形状/dtype → 清洗/聚合 → 图表/结论。

最常见的错误不是算法，而是：axis 搞反、索引不对齐、连接键不唯一、图表截断轴。每个都能用「打印 shape/行数/键唯一性/轴范围」提前发现。

本章验收：成绩矩阵形状练习；脏表清洗+分组+连接；直方图+趋势图+summary.csv；报告引用具体数字。`,
      code: String.raw`import pandas as pd, numpy as np

df = pd.DataFrame({"team": ["A", "A", "B"], "score": [91, 85, 78]})
print(df.groupby("team")["score"].agg(["mean", "count"]))
print(np.array(df["score"]).mean())`,
      output: `       mean  count
team
A      88.0      2
B      78.0      1
86.33333333333333`,
      tip: `shape/行数/键唯一/轴范围四项检查，能挡住大多数数据分析错误。`
    }
  ]
});

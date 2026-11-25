window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch15",
  part: 4,
  number: "15",
  title: "NumPy、pandas 与数据可视化",
  summary: "把表格数据变成可解释的结论：ndarray 的向量化、DataFrame 的清洗/分组/合并、matplotlib 的图表和可复现报告。这一章不追求模型，先把数据看对。",
  goals: [
    "能解释 ndarray 的形状、dtype、广播",
    "能用 pandas 清洗、分组、合并和透视",
    "能画出准确且不误导的图表",
    "能把分析过程写成可复现脚本"
  ],
  lessons: [
    {
      id: "ch15-1",
      title: "15.1 NumPy：形状、dtype 与向量化",
      minutes: 45,
      lead: "NumPy 的核心不是「更快的 list」，而是同构多维数组和向量化运算。这一节从创建、索引、广播到聚合，建立形状意识。",
      source: "Introducing Python 3rd · Ch.20；Beginning Python 4th · Ch.15；Head First Python 3rd · Ch.7",
      sections: [
        {
          h: "ndarray 的 shape、dtype、axis",
          p: `[[np.array([1,2,3])]] 得到一维数组，[[shape=(3,)]]；嵌套列表得到二维 [[(行, 列)]]。[[dtype]] 决定元素类型和内存；整型/浮点/字符串不要混。

[[axis=0]] 沿行方向（跨行）聚合，[[axis=1]] 沿列方向。对二维数组 [[sum(axis=0)]] 得到每列的和，[[sum(axis=1)]] 得到每行的和。形状不匹配是 NumPy 最常见的错误。

打印 [[arr.shape]]、[[arr.dtype]]、[[arr.ndim]] 是调试第一步。不要凭感觉猜维度。`,
          code: String.raw`import numpy as np

a = np.array([[1, 2, 3], [4, 5, 6]])
print(a.shape, a.dtype, a.ndim)
print(a.sum(axis=0))
print(a.sum(axis=1))`,
          output: `(2, 3) int64 2
[5 7 9]
[ 6 15]`,
          tip: `先看 shape/dtype/ndim；[[axis=0]] 跨行、[[axis=1]] 跨列，别凭感觉。`
        },
        {
          h: "向量化：不要写 Python 循环",
          p: `对数组做 [[a * 2 + 1]] 是逐元素运算，底层 C 循环，比 Python for 快很多。条件选择用 [[np.where(cond, x, y)]]，不要写 if 循环。

聚合用 [[sum/mean/std/min/max]]，可带 axis。排序用 [[np.sort]]/[[argsort]]；去重 [[np.unique]]。这些都是一次遍历。

向量化不是「所有场景都必须」；逻辑复杂/需要 early break 时，循环可能更清晰。先保证正确，再 profile。`,
          code: String.raw`import numpy as np

a = np.array([1, 2, 3, 4])
print(a * 2 + 1)
print(np.where(a % 2 == 0, "even", "odd"))
print(a.mean(), a.std())`,
          output: `[3 5 7 9]
['odd' 'even' 'odd' 'even']
2.5 1.118033988749895`,
          tip: `逐元素运算用数组表达式；条件选择用 [[np.where]]，不要写 if 循环。`
        },
        {
          h: "广播：形状怎么自动对齐",
          p: `广播规则：从尾部维度对齐；维度相等或其中一个为 1 才能广播，否则报错。[[(2,3)]] 与 [[(3,)]] 可以；[[(2,3)]] 与 [[(2,)]] 不行。

列向量要显式 [[[:, None]]] 变成 [[(3,1)]]，才能和 [[(3,)]] 广播成 [[(3,3)]]。不要靠猜，打印 shape。

广播会隐式复制数据，内存可能爆；大数组先算形状/分块。需要时用 [[np.newaxis]] 明确意图。`,
          code: String.raw`import numpy as np

a = np.array([[1, 2, 3], [4, 5, 6]])
b = np.array([10, 20, 30])
print((a + b).shape)
c = np.array([1, 2])[:, None]
print((a + c).shape)`,
          output: `(2, 3)
(2, 3)`,
          tip: `从尾部对齐；[[(2,3)]] 与 [[(2,)]] 不兼容，用 [[:, None]] 变列向量。`
        },
        {
          h: "索引、切片与布尔掩码",
          p: `[[a[0]]] 取行，[[a[:, 0]]] 取列，[[a[1:3, :2]]] 取子矩阵。切片是视图，改切片会影响原数组；需要副本用 [[.copy()]]。

布尔掩码 [[a[a > 2]]] 返回一维结果；多条件用 [[&]]/[[|]] 并加括号，不能用 [[and/or]]。[[np.where]] 返回索引或值，按需求选。

赋值给切片 [[a[:, 0] = 0]] 改原数组；赋值给掩码 [[a[a < 0] = 0]] 也改原数组。`,
          code: String.raw`import numpy as np

a = np.array([[1, -2, 3], [4, 5, -6]])
print(a[:, 0])
print(a[a < 0])
a[a < 0] = 0
print(a)`,
          output: `[1 4]
[-2 -6]
[[1 0 3]
 [4 5 0]]`,
          tip: `切片是视图，改它会影响原数组；布尔多条件用 [[&]]/[[|]] 加括号。`
        },
        {
          h: "随机数与可复现",
          p: `用 [[np.random.default_rng(seed)]] 创建独立生成器，别用全局 [[np.random]]。[[rng.normal]]/[[rng.integers]]/[[rng.choice]] 都从该生成器出。

固定 seed 只能保证「同一环境同一版本」可复现；不同 NumPy 版本算法可能变。报告里记录 seed 和版本。

随机拆分训练/测试要用 [[rng.permutation]]，不要用 Python [[random.shuffle]] 混用。`,
          code: String.raw`import numpy as np

rng = np.random.default_rng(42)
print(rng.integers(0, 10, size=5))
print(rng.normal(0, 1, size=3).round(2))`,
          output: `[0 7 6 4 4]
[-0.14 -0.55 -0.72]`,
          tip: `用 [[default_rng(seed)]] 独立生成器；记录 seed/版本，跨版本不保证完全一致。`
        },
        {
          h: "动手实验：成绩矩阵的形状练习",
          p: `构造 3 个学生 × 4 门课的分数矩阵；求每个学生总分（axis=1）、每门课平均（axis=0）、总分最高的学生、把低于 60 的置 0。打印 shape 和结果。`,
          code: String.raw`import numpy as np

scores = np.array([
    [91, 88, 76, 95],
    [58, 72, 66, 80],
    [85, 90, 92, 78],
])
print(scores.sum(axis=1))
print(scores.mean(axis=0).round(1))
print(scores.sum(axis=1).argmax())
scores[scores < 60] = 0
print(scores)`,
          output: `[350 276 345]
[78.  83.3 78.  84.3]
0
[[91 88 76 95]
 [ 0 72 66 80]
 [85 90 92 78]]`,
          tip: `行/列聚合先确认 axis；[[argmax]] 返回索引，不是值。`
        }
      ],
      points: [
        "ndarray 同构多维；先看 shape/dtype/ndim。",
        "axis=0 跨行、axis=1 跨列。",
        "向量化优先，条件选择用 np.where。",
        "广播从尾部对齐；列向量用 [:, None]。",
        "切片是视图；随机用 default_rng 并记录 seed。"
      ],
      practice: "构造 3×4 成绩矩阵：求每生总分、每科平均、总分最高学生、低于 60 置 0；打印 shape 验证。"
    },
    {
      id: "ch15-2",
      title: "15.2 pandas：清洗、分组、合并与透视",
      minutes: 50,
      lead: "pandas 把表格当一等公民：列有名字、索引可对齐、缺失值有语义。这一节从读取到清洗、groupby、merge、pivot，走一遍真实脏数据。",
      source: "Introducing Python 3rd · Ch.20；Head First Python 3rd · Ch.7",
      sections: [
        {
          h: "Series 与 DataFrame：索引对齐是核心",
          p: `[[Series]] 是一列带索引；[[DataFrame]] 是多列共享索引。运算按索引对齐，不是按位置；索引不同会产生 NaN。

[[df["score"]]] 取列返回 Series；[[df[["name", "score"]]] 取多列返回 DataFrame。[[df.loc]] 按标签，[[df.iloc]] 按位置；不要混用。

读 CSV 用 [[pd.read_csv(path, encoding="utf-8")]]；先看 [[df.head()]]、[[df.info()]]、[[df.shape]]，再决定清洗。`,
          code: String.raw`import pandas as pd

df = pd.DataFrame({
    "name": ["林晓", "周宁", "陈默"],
    "score": [91, 86, 78],
})
print(df.shape)
print(df["score"].mean())
print(df.loc[df["score"] >= 85, ["name", "score"]])`,
          output: `(3, 2)
85.0
   name  score
0  林晓     91
1  周宁     86`,
          tip: `pandas 按索引对齐；[[loc]] 标签、[[iloc]] 位置，别混。`
        },
        {
          h: "缺失值、重复值与类型转换",
          p: `先统计缺失：[[df.isna().sum()]]。删除用 [[dropna(subset=[...])]]，填充用 [[fillna]]；不要无脑 [[dropna()]] 丢掉半张表。

重复用 [[df.duplicated(subset=["id"])]] 查看，[[drop_duplicates]] 去重。类型转换用 [[astype]]/[[pd.to_numeric(errors="coerce")]]；转换失败变 NaN，再决定删/填。

日期用 [[pd.to_datetime]]；分类用 [[astype("category")]] 省内存。清洗每一步都打印前后行数，避免静默丢数据。`,
          code: String.raw`import pandas as pd

df = pd.DataFrame({
    "id": [1, 2, 2, 3],
    "score": ["91", "bad", "86", None],
})
df["score"] = pd.to_numeric(df["score"], errors="coerce")
print(df.isna().sum().to_dict())
print(df.drop_duplicates("id").shape[0])`,
          output: `{'id': 0, 'score': 2}
3`,
          tip: `缺失先统计再决定删/填；[[to_numeric(errors="coerce")]] 把坏值变 NaN。`
        },
        {
          h: "groupby：分组的三个动作",
          p: `[[df.groupby("team")["score"].mean()]] 是「分 → 聚合」。常用聚合：mean/sum/count/min/max/std；多个聚合用 [[.agg(["mean", "count"])]]。

[[groupby]] 默认 [[as_index=True]]，结果索引是分组键；需要列用 [[reset_index()]]。[[sort_values]] 排序，[[nlargest]] 取前 N。

分组后遍历 [[for name, group in df.groupby(...)]] 可用于复杂逻辑，但优先用向量化聚合；遍历慢且容易漏组。`,
          code: String.raw`import pandas as pd

df = pd.DataFrame({
    "team": ["A", "A", "B", "B", "B"],
    "score": [91, 85, 78, 88, 92],
})
print(df.groupby("team")["score"].agg(["mean", "count"]).reset_index())
print(df.groupby("team")["score"].mean().idxmax())`,
          output: `  team  mean  count
0    A  88.0      2
1    B  86.0      3
B`,
          tip: `groupby 结果默认索引是分组键；需要列就 [[reset_index]]，聚合多用 [[agg]]。`
        },
        {
          h: "merge：连接键、重复列、验证行数",
          p: `[[pd.merge(left, right, on="id", how="left")]] 是 SQL join。[[how]] 取 inner/left/right/outer；连接键要同名或 [[left_on/right_on]]。

连接前检查键唯一性：[[right["id"].duplicated().any()]]；一对多连接会让行数膨胀。用 [[validate="one_to_one"]] 让 pandas 帮你报错。

连接后检查行数/空值：左连接后右表字段出现 NaN 说明没匹配上。列名冲突用 [[suffixes=("_l", "_r")]]。`,
          code: String.raw`import pandas as pd

left = pd.DataFrame({"id": [1, 2, 3], "name": ["林晓", "周宁", "陈默"]})
right = pd.DataFrame({"id": [1, 2], "team": ["A", "B"]})
merged = left.merge(right, on="id", how="left", validate="one_to_one")
print(merged)
print(merged["team"].isna().sum())`,
          output: `   id name team
0   1  林晓    A
1   2  周宁    B
2   3  陈默  NaN
1`,
          tip: `连接前查键唯一；[[validate="one_to_one"]] 防行数膨胀，连接后查 NaN。`
        },
        {
          h: "pivot_table 与长宽表转换",
          p: `[[pivot_table(index=..., columns=..., values=..., aggfunc="mean")]] 做交叉表；缺失组合会出 NaN，[[fill_value=0]] 可填。

长表转宽表 [[pivot]]，宽转长 [[melt]]；[[stack/unstack]] 是索引层面的转换。先明确「一行代表什么」，再选形状。

透视表不是可视化；它是聚合结果。导出 Excel 前 [[reset_index]]，否则索引会丢列名。`,
          code: String.raw`import pandas as pd

df = pd.DataFrame({
    "team": ["A", "A", "B", "B"],
    "event": ["100m", "200m", "100m", "200m"],
    "score": [91, 88, 85, 90],
})
print(df.pivot_table(index="team", columns="event", values="score", aggfunc="mean"))`,
          output: `event  100m  200m
team
A        91    88
B        85    90`,
          tip: `透视前明确一行代表什么；导出前 [[reset_index]]，否则索引丢列名。`
        },
        {
          h: "动手实验：清洗一张脏成绩表",
          p: `构造含重复 id、坏分数、缺失队名的表；做：去重、分数转数值、缺失队名填「未知」、按队分组求均分、与队伍表左连接。每步打印行数。`,
          code: String.raw`import pandas as pd

df = pd.DataFrame({
    "id": [1, 2, 2, 3],
    "team": ["A", "B", None, "A"],
    "score": ["91", "bad", "86", "78"],
})
df = df.drop_duplicates("id").copy()
df["score"] = pd.to_numeric(df["score"], errors="coerce")
df["team"] = df["team"].fillna("未知")
print(df)
print(df.groupby("team")["score"].mean())`,
          output: `   id team  score
0   1    A   91.0
1   2    B    NaN
3   3    A   78.0
team
A       84.5
B        NaN`,
          tip: `清洗每步打印行数；坏值变 NaN 后要明确「删/填/保留」。`
        }
      ],
      points: [
        "Series/DataFrame 按索引对齐；loc 标签、iloc 位置。",
        "缺失先统计再删/填；to_numeric 处理坏值。",
        "groupby 分-聚合，结果默认索引是分组键。",
        "merge 前查键唯一，validate 防行数膨胀。",
        "pivot_table 是聚合，导出前 reset_index。"
      ],
      practice: "清洗含重复 id/坏分数/缺失队名的成绩表：去重、转数值、填未知、按队均分、左连接队伍表；每步打印行数。"
    },
    {
      id: "ch15-3",
      title: "15.3 matplotlib：图表、误导与可复现报告",
      minutes: 50,
      lead: "图表不是装饰，是论证。这一节用 matplotlib 画趋势、分布、对比图，讲清坐标轴、标签、颜色和「同一张图能得出相反结论」的坑。",
      source: "Introducing Python 3rd · Ch.20；Head First Python 3rd · Ch.7",
      sections: [
        {
          h: "两种接口：pyplot 与面向对象",
          p: `[[plt.plot(x, y)]] 是 pyplot 状态机接口，适合快速探索；[[fig, ax = plt.subplots()]] 是面向对象接口，适合多图/精细控制。生产报告优先 OO 接口，避免全局状态。

[[ax.set_title]]/[[set_xlabel]]/[[set_ylabel]] 设标签；[[ax.legend]] 加图例；[[fig.tight_layout()]] 防重叠。中文标签需要字体支持，否则出现方框。

保存用 [[fig.savefig("chart.png", dpi=200, bbox_inches="tight")]]；不要用 [[plt.show()]] 后保存，交互后端可能已清空。`,
          code: String.raw`import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(5, 3))
ax.plot([1, 2, 3], [91, 88, 85], marker="o")
ax.set_xlabel("week")
ax.set_ylabel("score")
ax.set_title("weekly score")
fig.tight_layout()
fig.savefig("chart.png", dpi=150)
print("saved")`,
          output: `saved`,
          tip: `报告用 [[subplots]] 的 OO 接口；保存用 [[savefig]]，别依赖 [[show]]。`
        },
        {
          h: "图型选择：趋势、分布、对比",
          p: `趋势用折线（时间序列），分布用直方图/箱线图，类别对比用条形图，相关性用散点图。不要用饼图比较超过 5 类，不要用 3D 图做精确比较。

条形图注意从 0 开始，否则差异被夸大；折线图注意 y 轴范围，截断会误导。双 y 轴慎用，容易制造虚假关联。

每张图只回答一个问题；标题写「什么 + 时间/范围」，轴标签带单位。`,
          code: String.raw`import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(5, 3))
ax.bar(["A", "B", "C"], [91, 85, 78], color=["#4c78a8", "#f58518", "#54a24b"])
ax.set_ylim(0, 100)
ax.set_ylabel("score")
ax.set_title("team average")
fig.tight_layout()
fig.savefig("bar.png", dpi=150)`,
          output: `saved bar.png`,
          tip: `条形图从 0 开始；每张图只回答一个问题，轴标签带单位。`
        },
        {
          h: "配色与可访问性",
          p: `不要用红绿作为唯一区分（色盲不友好）；用形状/标注/明度辅助。分类色板选 ColorBrewer/Tableau 等成熟色板，不要手调高饱和色。

文本对比度要够；浅色背景 + 深色文字。线宽/点大小要能在投影/手机上看清。图例不要遮挡数据。

同一报告内保持颜色语义一致：A 队始终蓝色，不要这张图蓝、下张图红。`,
          code: String.raw`colors = ["#4c78a8", "#f58518", "#54a24b"]
labels = ["A", "B", "C"]
for label, color in zip(labels, colors):
    print(label, color)`,
          output: `A #4c78a8
B #f58518
C #54a24b`,
          tip: `别用红绿唯一区分；同报告颜色语义一致，图例别挡数据。`
        },
        {
          h: "把分析写成脚本：数据→图→结论",
          p: `可复现报告 = 脚本 + 固定输入 + 固定输出。脚本按步骤：读数据、清洗、计算、画图、保存；每步有日志/断言。不要手动在 Notebook 里改一半再截图。

参数（输入路径、输出目录、阈值）用 argparse/配置；seed 固定。输出图/表带版本/日期，避免覆盖历史。

结论要能回溯到图/表：报告里引用 [[chart.png]] 和对应统计量；不要只写「明显提升」而没有数字。`,
          code: String.raw`from pathlib import Path
import pandas as pd

df = pd.DataFrame({"team": ["A", "B"], "score": [91, 85]})
out = Path("out")
out.mkdir(exist_ok=True)
summary = df.groupby("team")["score"].mean().reset_index()
summary.to_csv(out / "summary.csv", index=False)
print(summary.to_dict("records"))`,
          output: `[{'team': 'A', 'score': 91}, {'team': 'B', 'score': 85}]`,
          tip: `脚本化 + 固定输入/输出 + 断言；结论引用具体图表和数字。`
        },
        {
          h: "常见误导：截断轴、双轴、样本量",
          p: `截断 y 轴会放大微小差异；不从 0 开始的条形图会夸大比例。双 y 轴可以让两条无关曲线「看起来相关」。样本量小的时候，均值差异可能只是噪声。

图要标注 n/时间范围/数据来源；误差棒/置信区间能表达不确定性。没有误差信息时，不要用「显著」这个词。

公开图表前让一个没参与分析的人读一遍：他能否得出和你一样的结论？`,
          code: String.raw`import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

fig, ax = plt.subplots(figsize=(4, 3))
ax.bar(["A", "B"], [91, 85])
ax.set_ylim(80, 95)  # 反面示例：截断轴放大差异
ax.set_title("misleading (don't do this)")
fig.savefig("misleading.png", dpi=150)`,
          output: `saved misleading.png`,
          tip: `轴从 0 开始、慎用双轴、标注 n/误差；让别人盲读图表验证结论。`
    },
    {
      h: "动手实验：一张成绩分布图 + 一张趋势图",
      p: `用 20 个学生成绩画直方图（bins=10），再用 4 周均分画折线；两张图都带标题/轴标签/数据来源/n；保存 PNG 和 summary.csv。

验收：直方图 y 轴从 0 开始；折线图标注周数；报告文字引用具体均分和最大/最小值。`,
      code: String.raw`import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np

scores = np.array([91, 88, 76, 95, 58, 72, 66, 80, 85, 90, 92, 78, 81, 69, 74, 87, 93, 64, 77, 83])
fig, ax = plt.subplots(figsize=(5, 3))
ax.hist(scores, bins=10, range=(50, 100), color="#4c78a8", edgecolor="white")
ax.set_xlabel("score")
ax.set_ylabel("students")
ax.set_title("score distribution (n=20)")
fig.tight_layout()
fig.savefig("hist.png", dpi=150)
print(scores.mean(), scores.min(), scores.max())`,
          output: `79.85 58 95`,
          tip: `直方图 y 轴从 0；标题带 n 和数据范围，文字引用具体统计量。`
    }
      ],
      points: [
        "报告用 subplots OO 接口；savefig 保存。",
        "图型匹配问题：趋势/分布/对比/相关。",
        "条形图从 0 开始，慎用双轴/截断轴。",
        "颜色语义一致，兼顾色盲可访问性。",
        "脚本化 + 固定输入输出 + 结论可回溯。"
      ],
      practice: "用 20 个成绩画直方图 + 4 周均分折线：标题/轴标签/数据来源/n 齐全，保存 PNG 和 summary.csv，文字引用具体数字。"
    }
  ]
});

window.PY_FOUNDATIONS_DEEP2 = Object.assign(window.PY_FOUNDATIONS_DEEP2 || {}, {
  "ch2-1": [
    {
      h: "动手实验：清洗一行真实成绩",
      p: `给一行带空格、末尾空字段的成绩，先 [[repr()]] 看清内容，再 [[strip()]]、[[split()]]、[[join()]]。重点观察两件事：[[split(",")]] 保留了末尾空字段，[[split()]] 不会；[[strip()]] 只去首尾，不去中间。清完再用字段数量做校验，别让缺字段的数据混进计算。`,
      code: String.raw`line = " 林晓, 91, 88.5,  \n"
print(repr(line))
parts = [p.strip() for p in line.split(",")]
print(parts, len(parts))

print("a,,b".split(","))
print("a,,b".split())
print("|".join(parts))

if len(parts) == 4 and parts[3] == "":
    parts = parts[:3]
print(parts)`,
      output: `' 林晓, 91, 88.5,  \n'
['林晓', '91', '88.5', ''] 4
['a', '', 'b']
['a', 'b']
林晓|91|88.5|
['林晓', '91', '88.5']`,
      tip: `[[split(",")]] 保留空字段，[[split()]] 丢弃空段；解析 CSV 时先决定「空字段」是缺考还是格式错误。`
    },
    {
      h: "复盘卡：字符串方法的选择顺序",
      p: `清理字符串的固定顺序：先 [[repr()]] 观察，再 [[strip()]] 去首尾，再 [[split()]] 切分，必要时 [[replace()]] 去掉噪声，最后 [[join()]] 拼回。判断「有没有」用 [[in]]，找位置用 [[find()]]/[[index()]]，前缀后缀用 [[startswith()]]/[[endswith()]]。需要正则时再上 [[re]]，不要一开始就写复杂模式。\n\n自测：[[s.strip()]] 会去掉中间空格吗？不会。[[s.split()]] 和 [[s.split(" ")]] 一样吗？不一样，前者按任意空白并丢空段，后者只按单个空格并保留空段。[[s.replace("a", "")]] 会改原字符串吗？不会，返回新字符串。\n\n常见误区：用 [[is]] 比较字符串；用 [[+=]] 在循环里拼大字符串（每次创建新对象，O(n²)）；把 [[strip()]] 当成「去掉所有空白」。大拼接用 [[join()]]，比较用 [[==]]，去所有空白用 [[replace()]] 或正则。`,
      tip: `循环里不要用 [[s += part]] 拼大字符串；先收集到列表，再一次 [["".join(parts)]]，复杂度从 O(n²) 回到 O(n)。`
    }
  ],
  "ch2-2": [
    {
      h: "动手实验：打印一张对齐的成绩表",
      p: `用同一组数据，分别试 [[:<]]、[[:>]]、[[:^]]、数字格式和百分比。把姓名列宽固定为 8、分数列宽固定为 6，观察中英文混排时是否真的对齐。重点不是「格式串背下来」，而是知道宽度、对齐、精度三个旋钮各自管什么。`,
      code: String.raw`rows = [("林晓", 91.25), ("周宁", 88.5), ("陈默", 76.0)]
print(f"{'姓名':<8}{'分数':>8}")
print("-" * 16)
for name, score in rows:
    print(f"{name:<8}{score:>8.2f}")

print(f"{0.873:.1%}")
print(f"{1234567:,}")
print(f"{'abcdef':.3}")
print(f"|{name:*^10}|")`,
      output: `姓名          分数
----------------
林晓           91.25
周宁           88.50
陈默           76.00
87.3%
1,234,567
abc
|***陈默***|`,
      tip: `中文显示宽度不是 1，[[:<8]] 只能按码点补空格；终端表格混用中英文时，先用一组最长的名字试对齐。`
    },
    {
      h: "复盘卡：什么时候不该用 f-string",
      p: `f-string 适合「已知模板 + 少量变量」；不适合「用户可编辑模板」「复杂条件排版」「大量重复拼接」。用户模板要用 [[string.Template]] 或专门的模板引擎，避免把用户输入当代码执行。复杂报表先在 Python 里算好行数据，再用 f-string 逐行渲染；不要把业务判断塞进格式串。\n\n自测：[[f"{0.873:.1%}"]] 输出什么？87.3%。[[f"{-3:+.2f}"]] 呢？-3.00。[[f"{{name}}"]] 呢？{name}，不是变量值。[[f"{score=}"]] 呢？score=91，字符串会带引号。\n\n常见误区：百分比重复乘 100；把 [[None]] 直接格式化；在 f-string 表达式里写复杂推导式；把调试用的 [[=]] 留在用户可见日志。格式化是展示层，业务值先算对，再谈排版。`,
      tip: `[[f"{None}"]] 输出 None，不会报错；报表里要先把 None 转成「无数据」，否则用户会看到刺眼的 None。`
    }
  ],
  "ch2-3": [
    {
      h: "动手实验：生成并读回一个 UTF-8 文件",
      p: `写一个包含中文、emoji 和换行的文件，分别用 [[utf-8]]、[[utf-8-sig]] 读回，观察第一行和字符数。再用二进制模式读前几个字节，确认 BOM 是否存在。这个实验把「文本」「字节」「编码」三层放在一起，比只看概念清楚。`,
      code: String.raw`from pathlib import Path

text = "林晓,91\n周宁,88\n"
Path("scores_utf8.csv").write_text(text, encoding="utf-8", newline="\n")

raw = Path("scores_utf8.csv").read_bytes()
print(raw[:6])
print(len(raw), len(text))

with Path("scores_utf8.csv").open(encoding="utf-8-sig") as f:
    print(repr(f.readline()))

with Path("scores_utf8.csv").open("rb") as f:
    print(f.read(3))`,
      output: `b'\xe6\x9e\x97\xe6\x99\x93'
20 12
'林晓,91\n'
b'\xe6\x9e\x97'`,
      tip: `[[len(raw)]] 是字节数，[[len(text)]] 是字符数；中文占 3 字节，所以两者不相等。做字段长度限制时先确认按哪个算。`
    },
    {
      h: "复盘卡：乱码排查顺序",
      p: `乱码先分三类：文件编码错、解码方式错、显示字体错。排查顺序：一，[[repr()]] 看字符串里到底是中文、转义序列还是替换符；二，[[read_bytes()]] 看前几个字节，判断有没有 BOM；三，确认原始数据的编码（问提供方，不猜）；四，用正确编码重读；五，写回时显式 [[encoding="utf-8"]]。\n\n自测：[[\xe4\xb8\xad]] 用 UTF-8 解是什么？中。用 GBK 解呢？涓。[[errors="ignore"]] 会留下什么？什么都不留，字符被丢掉。[[errors="replace"]] 呢？留下 [[�]]。[[utf-8-sig]] 和 [[utf-8]] 差在哪？前者吞掉/写入 BOM。\n\n常见误区：看到乱码就重装 Python；用 [[errors="ignore"]] 掩盖问题；把 [[.txt]] 当成编码声明；在 Windows 上不指定编码就写文件。编码是数据契约，不是运行环境的小毛病。`,
      tip: `排查乱码先看 [[repr()]] 和原始字节；不要靠眼睛猜编码，也不要用 [[errors="ignore"]] 把证据丢掉。`
    }
  ]
});

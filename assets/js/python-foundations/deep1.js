window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch1-1": [
    {
      h: "字节码与执行模型：一条语句经过哪些层",
      p: `把「Python 是解释型语言」这句话说完整，需要补上四个阶段：词法分析把源代码切成名字、数字、符号；语法分析把 token 组织成 AST；编译器把 AST 变成字节码；最后 CPython 的求值循环逐条执行字节码。你在屏幕上看到的 [[python3 script.py]]，背后是这一整条流水线，而不是「读一行、执行一行」的 shell 脚本。\n\n字节码不是机器码，也不是源代码。它是给 CPython 虚拟机看的中间指令，保存在内存里的 code object 中；导入模块时，CPython 还可能把字节码缓存到 [[__pycache__]]。这也是为什么第一次导入模块会稍慢，第二次通常更快：不是 Python 记住了你的变量，而是它复用了编译结果。缓存失效的条件包括源文件修改时间、解释器版本和编译参数，所以「删掉 __pycache__ 就好了」偶尔有效，但它从来不是理解问题的替代品。\n\n理解这一层之后，几个日常现象就顺了。[[dis.dis()]] 能把函数拆成字节码，让你看到 [[LOAD_FAST]]、[[BINARY_OP]]、[[RETURN_VALUE]] 这类指令；[[sys.version_info]] 告诉你当前解释器版本；[[compile()]] 可以在不执行的情况下检查语法。你不需要天天读字节码，但在排查「为什么这里多了一次函数调用」「为什么这个推导式比循环慢」时，它比猜更可靠。\n\n还要记住 CPython 不是 Python 的全部。PyPy 用 JIT 把热点代码编译成机器码，MicroPython 为单片机裁剪了运行时。语法相同，执行模型不同，性能特征也不同。课程默认使用 CPython，因为它的错误信息最完整、生态最标准；换解释器时，先确认版本和实现，再谈优化。`,
      code: String.raw`import dis

def average(scores):
    return sum(scores) / len(scores)

dis.dis(average)
print(average.__code__.co_consts)
print(average.__code__.co_names)`,
      output: `  2           0 RESUME                   0
              2 LOAD_GLOBAL              1 (NULL + sum)
              4 LOAD_FAST                0 (scores)
              6 CALL                     1
              8 LOAD_GLOBAL              3 (NULL + len)
             10 LOAD_FAST                0 (scores)
             12 CALL                     1
             14 BINARY_OP                11 (/)
             18 RETURN_VALUE
(None,)
('sum', 'len')`,
      tip: `[[dis]] 显示的是实现细节，不是语言规范；不同 Python 版本的指令名会变，别把某条字节码写进业务判断。`
    },
    {
      h: "环境排查实战：PATH、venv 与脚本目录",
      p: `「我装了包，为什么 import 不到」是初学者最常见的问题，而它通常不是包的问题，是解释器的问题。终端里的 [[python3]] 是 PATH 找到的第一个可执行文件；IDE 里的解释器可能是另一个；项目虚拟环境里的又是第三个。三者各自有独立的 [[site-packages]]，你在一处 [[pip install]]，另一处当然看不见。\n\n排查顺序要固定下来。第一，打印 [[sys.executable]]，确认当前解释器的绝对路径；第二，打印 [[sys.version]]，确认版本；第三，打印 [[sys.path]]，看模块搜索路径的顺序；第四，用 [[python3 -m pip show 包名]] 看这个解释器到底装没装。不要一上来就重装，也不要同时用 [[pip]] 和 [[python3 -m pip]] 而不确认它们指向同一个环境。\n\n虚拟环境解决的是隔离，不是安装。[[python3 -m venv .venv]] 创建一套独立的解释器和 site-packages；激活脚本只是把 [[.venv/bin]] 放到 PATH 前面，让你敲 [[python3]] 时先命中它。退出终端后激活状态消失，这不是环境坏了，是 shell 状态没有跨进程保留。生产环境更稳妥的写法是直接调用 [[.venv/bin/python]]，不依赖「当前有没有激活」。\n\n脚本运行时还有一个容易忽略的路径：[[sys.path[0]]] 是脚本所在目录，不是当前工作目录。你在项目根目录执行 [[python3 tools/report.py]]，脚本里 [[open("scores.txt")]] 会按当前工作目录找文件；但 [[import helper]] 会先看 [[tools/]]。这两个基准不同，写路径时要明确用 [[Path(__file__).parent]] 还是 [[Path.cwd()]]，不要靠「我这边能跑」蒙混过去。`,
      code: String.raw`# 终端排查
which -a python3
python3 -c "import sys; print(sys.executable); print(sys.path[:3])"
python3 -m pip show requests

# 脚本内部
from pathlib import Path
import sys

print("解释器:", sys.executable)
print("脚本目录:", Path(__file__).resolve().parent)
print("当前目录:", Path.cwd())
print("搜索起点:", sys.path[0])`,
      output: `/usr/local/bin/python3
/usr/local/bin/python3
['', '/usr/local/lib/python3.13', '/usr/local/lib/python3.13/site-packages']
Name: requests
Version: 2.32.3
解释器: /usr/local/bin/python3
脚本目录: /Users/me/project/tools
当前目录: /Users/me/project
搜索起点: /Users/me/project/tools`,
      tip: `项目里不要放 [[random.py]]、[[json.py]]、[[email.py]] 这类与标准库同名的文件；它们会遮住标准库，报错却看起来像标准库坏了。`
    },
    {
      h: "失败路径：异常链、退出码与最小复现",
      p: `脚本失败时，最没用的动作是「再跑一遍看看」。有用的动作是把 traceback 从下往上读：最后一行是异常类型和消息，往上一行是真正抛出异常的代码，再往上是调用链。很多人只看到第一行 [[Traceback (most recent call last):]] 就慌了，其实关键信息都在底部。先定位「哪一行、什么异常、什么值」，再决定是改数据、改逻辑还是改环境。\n\n异常链是 Python 3 的一个强项。[[raise NewError("...") from err]] 会保留原始异常，traceback 里显示 [[The above exception was the direct cause]]；不写 [[from]] 时，隐式链仍然存在，只是语义弱一些。排查时不要用 [[except Exception: pass]] 把链剪断，那等于把案发现场打扫干净再报警。真正需要兜底的地方只有程序边界：命令行入口、Web 请求处理、后台任务循环；兜底之后要记录日志、返回非零退出码，而不是假装成功。\n\n退出码是脚本和外部世界约定的语言。[[sys.exit(0)]] 表示成功，非零表示失败；[[argparse]] 参数错误通常返回 2，未捕获异常返回 1。CI、cron、容器编排都靠这个数字决定要不要重试、告警或回滚。你可以打印很漂亮的错误信息，但如果退出码仍是 0，上游会认为任务成功，这比报错更危险。\n\n最后练一个最小复现：把出错脚本删到只剩必要的 import、一行触发代码和一行打印，确认问题仍存在；再逐步加回业务代码。最小复现不是「最后的救命稻草」，而是排查纪律。它能区分「代码逻辑错」和「环境/数据错」，也能让你在求助时给出别人能直接运行的材料。`,
      code: String.raw`import sys

def load_score(path):
    try:
        with open(path, encoding="utf-8") as f:
            return int(f.read().strip())
    except FileNotFoundError as err:
        raise RuntimeError(f"成绩文件不存在: {path}") from err

def main():
    try:
        score = load_score("scores.txt")
    except RuntimeError as err:
        print(f"错误: {err}", file=sys.stderr)
        return 2
    print("成绩:", score)
    return 0

if __name__ == "__main__":
    sys.exit(main())`,
      output: `错误: 成绩文件不存在: scores.txt
# echo $?  -> 2`,
      tip: `[[sys.exit()]] 接受整数或字符串；传字符串会打印到 stderr 并以 1 退出。业务代码返回状态，入口负责退出，别在深层函数里随手 [[exit()]]。`
    }
  ],
  "ch1-2": [
    {
      h: "对象、类型、身份：三个词各管什么",
      p: `变量名不是盒子，它只是一个指向对象的标签。对象活在堆上，拥有三样东西：身份（identity）、类型（type）和值（value）。[[id(obj)]] 给出身份，在 CPython 里通常就是内存地址；[[type(obj)]] 给出类型；[[obj]] 本身呈现值。[[is]] 比较身份，[[==]] 比较值。两个列表可以值相等但身份不同；两个小整数可以既值相等又身份相同，因为 CPython 缓存了 -5 到 256。\n\n这种缓存是实现细节，不是语言承诺。你不要用 [[is]] 判断数字或字符串的「相等」，那会把程序写得依赖解释器。[[is]] 真正该用的地方是 [[None]]、[[True]]、[[False]] 这类单例，以及你自己明确想判断「是不是同一个对象」的场景。判断值是否相等，永远优先 [[==]]；判断是否为空，用 [[is None]]，不要用 [[== None]]。\n\n类型决定对象能响应哪些操作。[[int]] 支持算术，[[str]] 支持拼接和切片，[[list]] 支持索引和追加。Python 是动态类型：名字不绑定类型，对象才带类型；同一个名字可以先指向整数，再指向字符串。这不是「没有类型」，而是「类型检查发生在运行时」。好处是灵活，代价是错误可能到运行到那一行才暴露。\n\n身份还会影响可变对象的行为。两个名字指向同一个列表时，通过任一名字修改内容，另一个名字看到的变化是同一份；如果你想要独立副本，必须显式复制。[[id()]] 在对象被回收后可能被新对象复用，所以不要把 id 当作长期唯一标识存进数据库；它只适合在当前进程内做临时判断。`,
      code: String.raw`a = [1, 2]
b = a
c = [1, 2]

print(a is b, a is c, a == c)
print(id(a), id(b), id(c))

a.append(3)
print(b, c)

x = 256
y = 256
print(x is y)
x = 257
y = 257
print(x is y)`,
      output: `True False True
4371234560 4371234560 4371234656
[1, 2, 3] [1, 2]
True
False`,
      tip: `[[is]] 不是「更严格的等于」；它问的是「是不是同一个对象」。把 [[is]] 用在数字/字符串相等判断上，是典型的伪优化。`
    },
    {
      h: "数字边界：浮点、整除与精度",
      p: `Python 的 [[int]] 是任意精度整数，理论上只受内存限制；[[float]] 则是 IEEE 754 双精度，约 15 到 17 位有效数字。[[0.1 + 0.2]] 得到 [[0.30000000000000004]]，不是 Python 算错了，而是十进制小数在二进制里无法精确表示。凡是涉及金额、税率、称重结算，都不要用 float 直接累加；用 [[Decimal]] 或「整数分」保存，再在展示层格式化。\n\n[[//]] 是向下取整，不是截断。[[7 // 2]] 是 3，[[-7 // 2]] 是 -4；[[int(-7 / 2)]] 才是 -3。[[%]] 的符号跟随除数：[[-7 % 2]] 是 1，[[7 % -2]] 是 -1。想同时拿到商和余数，用 [[divmod()]]，比分别算两次更清楚。写分页、分桶、环形索引时，先把负数边界想明白，再写公式。\n\n浮点比较不要写 [[a == b]]，除非你确定两者来自同一计算路径。用 [[math.isclose(a, b, rel_tol=..., abs_tol=...)]][[。]] 相对容差适合大数，绝对容差适合接近零的数。[[round()]] 也不是传统四舍五入：它采用「银行家舍入」，[[round(2.5)]] 是 2，[[round(3.5)]] 是 4；需要商业四舍五入时，用 [[Decimal]] 配合 [[ROUND_HALF_UP]]，并明确保留几位。\n\n还有三个特殊值：[[float("inf")]]、[[float("-inf")]]、[[float("nan")]]。[[nan]] 与任何值比较都为 False，包括它自己；判断 nan 要用 [[math.isnan()]]。[[inf]] 参与运算可能得到 nan，例如 [[inf - inf]]。这些值在数据清洗里经常出现，读 CSV 时如果看到 [[nan]]，先问「缺失值为什么变成了字符串」，不要直接拿它做算术。`,
      code: String.raw`from decimal import Decimal, ROUND_HALF_UP
import math

print(0.1 + 0.2)
print(7 // 2, -7 // 2, 7 % -2)
print(divmod(-7, 2))
print(math.isclose(0.1 + 0.2, 0.3))

money = Decimal("19.99") * 3
print(money)
print(money.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

print(round(2.5), round(3.5))
print(float("nan") == float("nan"), math.isnan(float("nan")))`,
      output: `0.30000000000000004
3 -4 -1
(-4, 1)
True
59.97
59.97
2 4
False True`,
      tip: `金额别用 [[float]]；[[Decimal("0.1")]] 从字符串构造，别从 float 构造，否则二进制误差在构造那一刻就带进去了。`
    },
    {
      h: "赋值语义：从名字到对象的引用",
      p: `赋值语句 [[name = expr]] 做两件事：先求值右边的表达式，再把结果对象绑定到左边的名字。它不复制对象，也不改变对象的类型。[[a = [1, 2]]] 然后 [[b = a]]，两个名字指向同一个列表；[[b.append(3)]] 之后 [[a]] 也会看到 3。想得到独立列表，要写 [[b = a.copy()]] 或 [[b = a[:]]]；嵌套列表还要 [[copy.deepcopy()]]，因为浅拷贝只复制外层。\n\n增强赋值 [[+=]] 的行为取决于对象是否可变。对列表，[[a += [3]]] 通常原地扩展，身份不变；对整数，[[x += 1]] 创建新整数并重新绑定名字。这个差异会出现在函数参数上：你把列表传进函数，函数里 [[append]] 会改变调用方的列表；传整数则不会。写函数时要明确「我是在修改输入，还是返回新值」，不要靠调用方猜。\n\n链式赋值 [[a = b = []]] 让两个名字指向同一个新列表，不是两个空列表。交换 [[a, b = b, a]] 先构造右边的元组，再依次解包，所以不需要临时变量；它也不是「同时修改」，而是「先取值、再绑定」。多重赋值的右边可以是任意可迭代对象，元素个数必须与左边一致，否则触发 [[ValueError]]。\n\n函数默认参数是另一个引用陷阱。[[def add(item, bucket=[]):]] 的默认列表只在函数定义时创建一次，所有调用共享它；正确写法是 [[bucket=None]]，进入函数后再 [[bucket = [] if bucket is None else bucket]]。这不是 Python 的怪癖，而是「默认值在定义时求值」的直接结果。理解引用语义，很多「为什么上一次的数据还在」的问题会立刻消失。`,
      code: String.raw`a = [1, 2]
b = a
b += [3]
print(a, b, id(a) == id(b))

x = 10
y = x
y += 1
print(x, y, id(x) == id(y))

p = q = []
p.append("shared")
print(p, q)

def add(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket

print(add("a"))
print(add("b"))`,
      output: `[1, 2, 3] [1, 2, 3] True
10 11 False
['shared'] ['shared']
['a']
['b']`,
      tip: `默认参数不要写可变对象；[[def f(x, cache={})]] 的缓存会跨调用共享，测试之间互相污染。`
    }
  ],
  "ch1-3": [
    {
      h: "输入契约：成绩单先定义什么",
      p: `写成绩单脚本之前，先把「输入是什么」写清楚，比先写 [[print]] 更重要。一个学生有姓名和三门成绩；成绩是 0 到 100 的整数还是允许小数？缺考是 0、空字符串还是 [[None]]？姓名允许空吗？这三门是否等权？把这些问题的答案写成一张小契约，后面的函数才有地方落脚。\n\n第一版不需要数据库，也不需要 [[input()]]。把数据直接写成变量，先打通「数据 → 计算 → 输出」；等逻辑稳定，再换成命令行参数或文件。很多初学者一上来就做交互式输入，结果每次调试都要手敲一遍，错误还没定位，耐心先耗光了。先用固定样本，才能做可重复的测试。\n\n校验要早做，但不能把校验和计算混在一起。[[parse_score]] 负责把外部值转成内部值，遇到非法值抛出带说明的异常；[[summarize]] 只接收已经合法的数据。这样单元测试可以分别测「坏输入被拒绝」和「好输入算得对」。如果你把所有逻辑塞进一个函数，最后只能测整条链路，定位成本高得多。\n\n成绩的边界要特别写清楚：0 分是合法成绩，空字符串不是；100 分合法，101 分不合法；[[bool]] 是 [[int]] 的子类，[[True]] 传进来会被当成 1，所以校验时先排除 [[bool]]。这些细节看起来吹毛求疵，但成绩系统一旦上线，边界错误就是最容易被用户发现的错误。`,
      code: String.raw`def parse_score(raw, subject):
    if isinstance(raw, bool):
        raise TypeError(f"{subject} 不能是布尔值")
    try:
        value = float(raw)
    except (TypeError, ValueError) as err:
        raise ValueError(f"{subject} 不是数字: {raw!r}") from err
    if not 0 <= value <= 100:
        raise ValueError(f"{subject} 超出 0-100: {value}")
    return value

subjects = ["Python", "数学", "英语"]
raw_scores = ["91", "88.5", "missing"]

scores = {}
for subject, raw in zip(subjects, raw_scores):
    scores[subject] = parse_score(raw, subject)

print(scores)`,
      output: `# 运行到英语时抛出：
ValueError: 英语 不是数字: 'missing'`,
      tip: `[[float("nan")]] 能通过 [[float()]]，但 [[0 <= nan <= 100]] 为 False；校验范围时它会自然被拒绝，不要额外写 [[nan]] 判断。`
    },
    {
      h: "计算与格式化：平均分、权重与排名",
      p: `平均分是 [[sum(scores) / len(scores)]]，但要先处理空列表：长度为 0 时除法会抛 [[ZeroDivisionError]]。如果是加权成绩，把权重也当作数据，不要写死在表达式里；[[sum(score * weight for ...)]] 之前先确认权重之和为 1，或者显式归一化。公式写错时，输出往往「看起来差不多」，所以要用一组手算得出的小样本做基准。\n\n格式化不是最后的美化，而是结果的一部分。[[f"{name:<8}{score:>6.1f}"]] 把姓名左对齐、分数右对齐并保留一位小数；中文字符宽度不是 1，终端里可能仍然对不齐，这时候要么用固定列宽加空格，要么输出 CSV 让表格软件处理。不要在代码里数空格，数着数着就会在某个姓名长度上崩掉。\n\n排名要先定义「同分怎么办」。是并列同名次，还是按姓名稳定排序？[[sorted(records, key=lambda r: r["score"], reverse=True)]] 只按分数排，同分时保留原顺序（稳定排序）；如果要并列名次，需要自己维护 [[rank]]，遇到相同分数不递增。不要把「排序」和「排名」当成同一件事，前者是顺序，后者是名次语义。\n\n最后给结果加一个可核对的摘要：人数、最高分、最低分、平均分、缺考人数。摘要的价值不是好看，而是让异常数据暴露出来。平均分 91、最高分 100、最低分 0，可能是正常，也可能是把缺考当成了 0；如果同时打印缺考人数，你就能立刻分辨。`,
      code: String.raw`records = [
    {"name": "林晓", "score": 91.0},
    {"name": "周宁", "score": 88.5},
    {"name": "陈默", "score": 91.0},
]

scores = [r["score"] for r in records]
print(f"人数={len(scores)} 平均={sum(scores)/len(scores):.2f}")
print(f"最高={max(scores):.1f} 最低={min(scores):.1f}")

ranked = sorted(records, key=lambda r: (-r["score"], r["name"]))
for i, r in enumerate(ranked, 1):
    print(f"{i:>2}. {r['name']:<6}{r['score']:>6.1f}")`,
      output: `人数=3 平均=90.17
最高=91.0 最低=88.5
 1. 林晓      91.0
 2. 陈默      91.0
 3. 周宁      88.5`,
      tip: `[[sorted(key=lambda r: (-r["score"], r["name"]))]] 用负号实现降序，同时保留姓名的升序次序；比 [[reverse=True]] 更适合多键排序。`
    },
    {
      h: "重构与落盘：让脚本可复用、可复查",
      p: `一次性脚本和可复用模块的差别，不在代码长度，而在边界。可复用版本把「解析输入」「计算结果」「渲染文本」「写文件」拆成四个函数，每个函数只做一件事；[[main()]] 负责把它们串起来，并处理退出码。这样你可以单独测试平均分，不必每次都准备一个完整文件。\n\n纯函数优先。[[summarize(records)]] 不打印、不写文件、不读全局变量，只接收参数并返回结果；需要输出时，再由 [[render_report()]] 把结果转成字符串。纯函数容易测试、容易复用，也不会在 import 时产生副作用。副作用集中在 [[main()]] 和 I/O 函数里，边界清晰，调试时知道该看哪一层。\n\n写文件要显式指定编码和换行。[[open(path, "w", encoding="utf-8", newline="\n")]] 让内容在不同平台上保持一致；不指定编码时，Python 使用区域默认值，在 Windows 上可能是 cp936，到了 Linux 就变成乱码。写完用 [[with]] 关闭文件，或者用 [[Path.write_text()]]；不要依赖垃圾回收替你 flush。\n\n最后留一条「可复查」的线索：报告头部写生成时间、数据文件路径、记录条数；出错时把原始行号和原始值带上。课程里的项目不是交一次就结束，它会被未来的你、同事或自动化脚本再次运行。让下一次运行的人能看懂，是重构的真正目标。`,
      code: String.raw`from pathlib import Path
from datetime import datetime

def summarize(records):
    scores = [r["score"] for r in records]
    return {
        "count": len(scores),
        "average": sum(scores) / len(scores) if scores else 0.0,
        "max": max(scores) if scores else 0.0,
        "min": min(scores) if scores else 0.0,
    }

def render_report(summary, source):
    lines = [
        f"# 成绩摘要 {datetime.now():%Y-%m-%d %H:%M}",
        f"# 来源: {source}",
        f"人数: {summary['count']}",
        f"平均: {summary['average']:.2f}",
        f"最高: {summary['max']:.1f}",
        f"最低: {summary['min']:.1f}",
    ]
    return "\n".join(lines) + "\n"

records = [{"name": "林晓", "score": 91.0}, {"name": "周宁", "score": 88.5}]
text = render_report(summarize(records), "scores.csv")
Path("report.txt").write_text(text, encoding="utf-8")
print(text, end="")`,
      output: `# 成绩摘要 2026-11-24 14:40
# 来源: scores.csv
人数: 2
平均: 89.75
最高: 91.0
最低: 88.5`,
      tip: `报告里写生成时间和来源路径，不是形式主义；数据变了但报告没变时，这两行能帮你判断是不是读错了文件。`
    }
  ]
});

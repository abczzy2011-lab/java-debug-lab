/* Generated course data bundle. Source order follows the page. */

/* --- ch1.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch1",
  part: 1,
  number: "01",
  title: "起步：环境、变量与表达式",
  summary: "先把「怎么运行」和「名字怎样指向对象」这两件事讲透。你会用 REPL 验证想法、用脚本保存结果，并第一次体会 Python 的动态类型、对象身份和算术表达式的边界。",
  goals: [
    "分清 REPL、脚本与模块三种运行形态",
    "能解释变量名、对象、类型和身份的区别",
    "能正确处理 `/`、`//`、`%`、`**` 与运算优先级",
    "能写出第一个带格式化的成绩摘要脚本"
  ],
  lessons: [
    {
      id: "ch1-1",
      title: "1.1 装上 Python，认识解释器与脚本",
      minutes: 35,
      lead: "这一节不急着背语法。先弄清楚你输入的一行代码究竟被谁接住、在哪里执行、结果为什么有时自动显示、有时必须自己 `print`。把这条链路走通，后面遇到环境问题和缩进问题才不会慌。",
      source: "Introducing Python 3rd · Ch.1；Beginning Python 4th · Ch.1；Head First Python 3rd · Ch.0",
      sections: [
        {
          h: "先确认你在和谁说话：解释器、REPL 与脚本",
          p: `Python 不是一门「写完就直接变成机器码」的语言。你写的 [[.py]] 文件先交给解释器，由解释器把源代码编译成字节码，再由 CPython 的求值循环执行。这个中间层带来两个直接后果：一是跨平台更容易，二是「运行」这件事被拆成了「启动解释器」和「把代码交给它」两步。

最常见的三种形态是：在终端里输入 [[python3]] 进入交互式环境；把代码写进文件后用 [[python3 文件名.py]] 执行；或者把文件当作模块，用 [[import]] 交给另一个程序加载。三者的语法一样，但生命周期完全不同：REPL 里的名字在退出后消失，脚本里的顶层代码每次运行都会重新执行，模块则可能被缓存、被多次导入。

先做一件最小的事：确认版本、确认解释器位置。很多「我明明装了库，为什么运行不到」的问题，根源不是代码，而是你用了另一个 Python。`,
          code: `# 在终端里执行，不是在 Python 里面执行
python3 --version
python3 -c "import sys; print(sys.executable)"

# 典型输出（版本和路径会因机器而异）
# Python 3.13.2
# /usr/local/bin/python3`,
          output: `Python 3.13.2
/usr/local/bin/python3`,
          tip: `[[python]] 和 [[python3]] 不一定是同一个解释器；Windows 上还可能是 [[py]] 启动器。先打印 [[sys.executable]]，比猜 PATH 可靠。`
        },
        {
          h: "REPL 的强与弱：它能立刻回答，但不适合做项目",
          p: `REPL 是 Read-Eval-Print Loop 的缩写：读一行、求值、打印结果、再等下一行。它最大的价值是**缩短反馈路径**。你不确定 [[len()]] 对字符串算不算空格，不确定 [[//]] 对负数怎么取整，直接在提示符后面敲一下，比翻文档快。

REPL 还会自动打印表达式的值。你输入 [[2 + 3]]，它显示 [[5]]；你输入 [[score = 88]]，它不会显示 88，因为赋值语句的值是 [[None]]，而 REPL 不打印 [[None]]。这个细节能帮你区分「表达式」和「语句」：表达式产生一个值，语句驱动控制流或绑定名字。

但 REPL 不适合承担项目。它没有版本历史，不方便改一大段代码，缩进块输入容易乱，退出后所有名字都没了。它适合验证一个点，不适合组织一个完整程序。`,
          code: `>>> 2 + 3
5
>>> score = 88
>>> score
88
>>> type(score)
<class 'int'>
>>> _
88
>>> 7 // 2, -7 // 2, 7 % -2
(3, -4, -1)`,
          output: `5
88
<class 'int'>
88
(3, -4, -1)`,
          tip: `REPL 里的 [[_]] 保存上一次表达式的结果，但它只在交互式环境里有意义，不要写进脚本。`
        },
        {
          h: "把代码写进文件：脚本的第一条完整链路",
          p: `脚本的本质是「把一串语句按顺序交给解释器」。你在文件里写 [[print("hello")]]，保存为 [[hello.py]]，然后在终端执行 [[python3 hello.py]]。解释器启动、读文件、执行顶层语句、退出。没有神秘的东西，但有几个常见坑。

第一，执行时使用的是**当前工作目录**，不是脚本所在目录。你在项目根目录运行 [[python3 subjects/hello.py]]，脚本里写 [[open("scores.txt")]]，它会去项目根目录找文件，而不是去 [[subjects/]] 找。第二，文件名不要和标准库模块重名。你写一个 [[random.py]]，再在同一个目录里 [[import random]]，导入的可能是你自己的文件，随后 [[random.randint()]] 就报属性错误。第三，报错时先看 traceback 的最后一行和行号，不要只看第一行的类型名。

下面是一个真正能跑的小脚本。它把版本、脚本名和一条格式化输出放在一起，顺便让你看到 [[sys.argv]] 是什么。`,
          code: `# score_report.py
import sys

print("Python:", sys.version.split()[0])
print("脚本名:", sys.argv[0])
print("参数个数:", len(sys.argv))

name = "林晓"
score = 91
print(f"{name} 的 Python 成绩是 {score} 分")`,
          output: `Python: 3.13.2
脚本名: score_report.py
参数个数: 1
林晓 的 Python 成绩是 91 分`,
          tip: `[[sys.argv[0]]] 是脚本名，不是你传进来的第一个业务参数；[[sys.argv[1:]]] 才是参数列表。`
        },
        {
          h: "`__name__ == \"__main__\"` 到底在防什么",
          p: `你迟早会看到这段：

[[if __name__ == "__main__": main()]]

它不是「Python 的仪式」，而是在区分两种运行方式。每个模块都有一个 [[__name__]] 属性：当文件被直接执行时，解释器把它设为 [["__main__"]]；当文件被另一个模块 [[import]] 时，它被设为模块名，比如 [["score_tools"]]。

[[import]] 不是「只把函数拿过来」，它会执行被导入模块的顶层代码。如果你在 [[score_tools.py]] 的顶层直接写 [[print("工具模块已加载")]]，那么任何导入它的程序都会打印这句话；如果你在顶层直接跑一个测试，导入时也会跑测试。主函数保护的作用，就是把「只在直接运行时做一次的事」和「被导入时应该只提供定义的事」分开。

这不是为了好看，而是为了可复用。一个模块要能被测试、被别的脚本导入、被 Web 服务加载，就不能在导入时产生意外副作用。`,
          code: `# score_tools.py
def average(scores):
    """返回平均分；空列表抛出 ValueError。"""
    if not scores:
        raise ValueError("scores 不能为空")
    return sum(scores) / len(scores)

def main():
    print(average([88, 92, 79]))

if __name__ == "__main__":
    main()

# main.py
from score_tools import average

print("导入后不会自动跑 main")
print(average([90, 85, 100]))`,
          output: `导入后不会自动跑 main
91.66666666666667`,
          tip: `把 [[main()]] 写在保护块里；模块顶层只保留函数、类和常量定义。这样 [[import]] 才是安全的。`
        },
        {
          h: "把错误读成线索：traceback 的三层信息",
          p: `新手看到一大段红色报错，第一反应是「全删重写」。其实 traceback 是按调用栈倒着排的：最上面是程序入口，最下面是错误真正发生的位置。你最先要读的是**最后一行**，它给出异常类型和消息；然后往上找最近一个属于你自己的文件帧，看行号和那一行源码。

[[NameError: name 'score' is not defined]] 说明名字还没绑定就拿来用；[[TypeError: unsupported operand type(s) for +: 'int' and 'str']] 说明类型不匹配；[[IndentationError]] 说明缩进层级不合法；[[SyntaxError]] 有时行号指向的是「解析器发现问题的位置」，真正漏掉的括号可能在前一行。读 traceback 不是读故事，而是定位「哪一行、什么类型、什么消息」。

还要学会区分「异常」和「错误输出」。程序打印 [[Error]] 不代表它崩溃了，可能只是你自己 [[print]] 了一句话；程序崩溃也不一定打印 traceback，如果你在 [[except]] 里把异常吞掉了。调试时先让异常完整暴露，再决定要不要捕获。`,
          code: `# broken.py
print("开始")
print(score)
score = 88`,
          output: `开始
Traceback (most recent call last):
  File "broken.py", line 3, in <module>
    print(score)
          ^^^^^
NameError: name 'score' is not defined`,
          tip: `先看最后一行异常类型，再往上找自己的文件帧；不要从第一行开始逐字读。[[except Exception: pass]] 会把最有用的线索扔掉。`
        }
      ],
      points: [
        "解释器负责把源代码编译成字节码并执行，不是直接生成机器码",
        "REPL 自动打印表达式结果，退出后名字消失",
        "脚本执行时的工作目录与脚本所在目录可能不同",
        "[[__name__]] 在直接执行时为 [[__main__]]，被导入时为模块名",
        "文件名不要与标准库模块重名"
      ],
      practice: "把上面的 `score_report.py` 真正保存并运行一次；再把 `score_tools.py` 作为模块导入，确认导入时没有自动打印。最后故意把文件名改成 `random.py`，观察 `import random` 会出什么问题。"
    },
    {
      id: "ch1-2",
      title: "1.2 变量、类型与表达式",
      minutes: 40,
      lead: "Python 的变量不像 C 的盒子，也不像 Java 的声明式引用。它更像一张标签：标签贴在对象上，可以随时撕下来贴到另一个对象。理解「名字—对象—类型—身份」四件事，是后面理解列表拷贝、函数默认参数和可变对象的起点。",
      source: "Introducing Python 3rd · Ch.2–3；Beginning Python 4th · Ch.1–3",
      sections: [
        {
          h: "变量不是盒子，是贴在对象上的名字",
          p: `很多教材用「盒子」比喻变量：盒子有类型、有大小，里面装值。这个比喻在 C 里大致成立，在 Python 里会误导。Python 的赋值语句 [[name = value]] 做的是：先求值右边，得到一个对象；再把名字 [[name]] 绑定到这个对象上。名字本身不持有对象，也不记录类型。

所以下面两行不是「复制了一个列表」，而是让两个名字指向同一个列表：

[[a = [1, 2, 3]]]
[[b = a]]

此时 [[a is b]] 为 [[True]]，[[id(a) == id(b)]] 也为 [[True]]。你通过 [[a.append(4)]] 修改对象，[[b]] 看到的内容也会变，因为根本没有第二个列表。

这也解释了函数参数：Python 是「按对象引用传递」。函数收到的是对象的引用，不是对象的副本。函数内部修改一个可变参数，调用方能看到变化；如果不想影响调用方，必须在函数内部显式复制。`,
          code: `a = [1, 2, 3]
b = a
print(a is b, id(a) == id(b))
b.append(4)
print(a)
print(b)

c = a[:]          # 切片产生新列表
c.append(5)
print(a)
print(c)`,
          output: `True True
[1, 2, 3, 4]
[1, 2, 3, 4]
[1, 2, 3, 4]
[1, 2, 3, 4, 5]`,
          tip: `[[is]] 比较身份，[[==]] 比较值。判断两个列表是否内容相同用 [[==]]；判断是否为同一个对象才用 [[is]]。`
        },
        {
          h: "动态类型：名字不记类型，对象才记类型",
          p: `Python 是动态类型语言：变量不需要声明类型，名字可以在不同时间绑定到不同类型的对象。[[x = 1]] 之后 [[x = "one"]] 完全合法；[[x]] 这个名字没有「必须是 int」的约束，变的是它指向的对象。

但「动态」不等于「没有类型」。每个对象都有类型，[[type(1)]] 是 [[int]]，[[type("1")]] 是 [[str]]。类型决定对象能响应哪些操作：[[1 + 1]] 做整数加法，[["1" + "1"]] 做字符串拼接，[[1 + "1"]] 直接抛 [[TypeError]]。错误不是在赋值时发生，而是在操作时发生。

[[isinstance()]] 比 [[type() is ...]] 更适合做运行时检查，因为它能处理继承关系。[[type()]] 适合调试和精确判断，不适合写业务分支。类型提示 [[def f(x: int) -> str:]] 也只是给工具和读者看的注解，CPython 默认不会在运行时强制检查。`,
          code: `x = 1
print(type(x))
x = "one"
print(type(x))

print(isinstance(True, int))   # bool 是 int 的子类
print(type(True) is int)       # 但精确类型不是 int

try:
    print(1 + "1")
except TypeError as exc:
    print("TypeError:", exc)`,
          output: `<class 'int'>
<class 'str'>
True
False
TypeError: unsupported operand type(s) for +: 'int' and 'str'`,
          tip: `[[bool]] 是 [[int]] 的子类，所以 [[isinstance(True, int)]] 为真；如果你要区分布尔和整数，用 [[type(x) is bool]]。`
        },
        {
          h: "算术表达式：`/` 与 `//`、`%`、`**` 的真实规则",
          p: `Python 的算术运算符有一组很容易被「小学数学」误解的规则。第一，[[/]] 永远做真除法，结果一定是 [[float]]，哪怕两边都是整数、哪怕整除：[[4 / 2]] 得到 [[2.0]]，不是 [[2]]。第二，[[//]] 是向下取整的除法，不是向零截断：[[-7 // 2]] 得到 [[-4]]，因为向下走到更小的整数。第三，[[%]] 的符号跟随除数，不跟随被除数：[[-7 % 2]] 是 [[1]]，[[7 % -2]] 是 [[-1]]。

[[**]] 是幂运算，优先级高于乘除，并且右结合：[[2 ** 3 ** 2]] 等价于 [[2 ** (3 ** 2)]]，结果是 [[512]]，不是 [[64]]。括号永远可以救命。整数在 Python 3 里是任意精度，不会像 C 的 [[int]] 那样溢出；浮点数仍然受 IEEE 754 的二进制表示限制，[[0.1 + 0.2]] 不会精确等于 [[0.3]]。`,
          code: `print(4 / 2)
print(-7 // 2, 7 // -2)
print(-7 % 2, 7 % -2)
print(2 ** 3 ** 2)
print((2 ** 3) ** 2)
print(0.1 + 0.2)
print(0.1 + 0.2 == 0.3)`,
          output: `2.0
-4 -4
1 -1
512
64
0.30000000000000004
False`,
          tip: `金额计算不要直接用 [[float]] 比较相等；用 [[Decimal]] 或整数分。[[round()]] 也不能修复二进制表示带来的误差。`
        },
        {
          h: "赋值、链式赋值与 `id`：为什么两个名字会一起变",
          p: `链式赋值 [[a = b = []]] 只创建了一个列表，然后让 [[a]] 和 [[b]] 都指向它。很多人以为这是「两个空列表」，接着 [[a.append(1)]]，发现 [[b]] 也变成了 [[1]]。这不是 bug，是名字绑定的直接结果。

更隐蔽的是增强赋值。[[a += [1]]] 对列表来说通常等价于 [[a.extend([1])]]，会原地修改对象；而 [[a = a + [1]]] 会创建一个新列表再重新绑定 [[a]]。两者在「[[a]] 的结果」上看起来一样，但对其他指向旧对象的别名影响完全不同。

[[id()]] 返回对象在 CPython 中的身份标识，通常可以理解为内存地址，但这不是语言保证。对象被回收后，地址可能被复用；所以不要把 [[id()]] 当作长期唯一键。理解身份的目的是理解别名和可变性，不是拿它做业务主键。`,
          code: `a = b = []
a.append(1)
print("链式赋值:", b)

x = [1, 2]
y = x
x += [3]
print("+= 之后:", y)

x = [1, 2]
y = x
x = x + [3]
print("+ 之后:", y)

print(id(a) == id(b))`,
          output: `链式赋值: [1]
+= 之后: [1, 2, 3]
+ 之后: [1, 2]
True`,
          tip: `函数默认参数不要写 [[def f(items=[]):]]；默认值只在定义时求值一次，所有调用共享同一个列表。用 [[None]] 做哨兵，再在函数体内创建新列表。`
        },
        {
          h: "表达式、语句与求值顺序：一次赋值到底发生了什么",
          p: `Python 在执行 [[x = x + 1]] 时，不是「把 x 加一」，而是分成几步：先求值右边 [[x + 1]]，创建一个新的整数对象；再把结果绑定到左边的名字 [[x]]；旧的整数对象如果没有别的名字引用，迟早被回收。整数不可变，所以这一定是「新对象 + 重新绑定」，不是原地加一。

这解释了一个常见困惑：[[a = b = []]] 只求值一次右边，所以两个名字共享一个列表；[[a = []; b = []]] 求值两次，得到两个列表。同理，函数调用参数的求值顺序是从左到右，[[f(g(), h())]] 先算 [[g()]]，再算 [[h()]]；短路运算 [[and]] / [[or]] 会在结果已确定时跳过右边。

表达式和语句要分清。表达式产生值，可以放在赋值右边、函数参数里、[[return]] 后面；语句驱动动作，比如 [[if]]、[[for]]、[[import]]、[[def]]。[[x = 1]] 是语句，[[x + 1]] 是表达式。[[print(x + 1)]] 是表达式语句：先算 [[x + 1]]，再把值交给 [[print]]。`,
          code: `x = 1
x = x + 1
print(x)

print(2 + 3 * 4)
print((2 + 3) * 4)
print(True or missing_name)
print(False and missing_name)`,
          output: `2
14
20
True
False`,
          tip: `不要把有副作用的调用塞进复杂表达式；先拆成临时变量，执行顺序和调试都会清楚很多。`
        }
      ],
      points: [
        "赋值是名字绑定，不是把值装进盒子",
        "名字没有类型，对象才有类型",
        "[[/]] 永远返回 float，[[//]] 向下取整，[[%]] 符号跟随除数",
        "[[**]] 右结合，括号改变结合顺序",
        "[[is]] 比较身份，[[==]] 比较值",
        "列表的 [[+=]] 可能原地修改，[[+]] 创建新对象"
      ],
      practice: "写一个 `alias_demo.py`：创建两个名字指向同一个列表，分别用 `append`、`+=`、`+` 修改，打印每次的结果和 `id`。然后解释为什么 `b` 有时变、有时不变。"
    },
    {
      id: "ch1-3",
      title: "1.3 第一个小任务：成绩单摘要",
      minutes: 35,
      lead: "现在把前面两节拼成一个完整的小任务：三门成绩、一个平均分、一张对齐的文本成绩单。这里不引入列表和循环，只用变量、表达式、f-string 和函数，先把「输入—计算—输出」这条链路走顺。",
      source: "Head First Python 3rd · Ch.1–2；Beginning Python 4th · Ch.1–3",
      sections: [
        {
          h: "先把输入摆清楚：三个分数和一个目标",
          p: `写程序最容易犯的错，是还没想清楚数据长什么样就开始写 [[print]]。这个任务的数据很小：一个学生、三门成绩。我们可以先用三个独立变量保存，等第 3 章学了列表，再把它们收进一个序列。现在重要的是把变量命名、数据类型和输出目标定下来。

命名要能让半年后的自己看懂。[[s1]]、[[s2]]、[[s3]] 不是好名字；[[python_score]]、[[math_score]]、[[english_score]] 才是。分数用整数还是浮点？如果成绩允许 0.5 分，就用 [[float]]；如果只记录整数，就用 [[int]]。这不是小事，因为后面的平均分和格式化都依赖类型。

目标输出也不是「随便打印一下」。我们希望它像一张小票：姓名、三门课、平均分、等级。先手写出目标样式，再让代码去逼近它，比反过来好。`,
          code: `student = "林晓"
python_score = 91
math_score = 84
english_score = 88

target = f"{student} | Python {python_score} | 数学 {math_score} | 英语 {english_score}"
print(target)`,
          output: `林晓 | Python 91 | 数学 84 | 英语 88`,
          tip: `先把目标输出写成一行字符串，确认字段和顺序；再拆成多行格式化。不要一边想排版一边改计算。`
        },
        {
          h: "f-string：让列对齐，而不是靠空格碰运气",
          p: `f-string 是 Python 3.6 以后最常用的格式化方式：字符串前加 [[f]]，花括号里放表达式。它不仅能插值，还能在冒号后面写格式说明符。最常用的三件事是：小数位数 [[.2f]]、宽度 [[>8]]、左对齐 [[<8]]。

[[f"{score:>6.1f}"]] 的意思是：整个字段至少 6 个字符宽，右对齐，保留 1 位小数。注意宽度包含小数点和小数位，不是「小数点前 6 位」。如果你写 [[f"{name:<8}"]]，名字不足 8 个字符时右边补空格；名字超过 8 个字符时不会截断，而是自然变宽。表格因此可能错位，所以真正做表格时还要考虑最大宽度。

中文对齐还有一层麻烦：等宽字体里一个汉字通常占两个英文字符宽度，但 [[len()]] 只数字符个数，不数显示宽度。终端里用空格对齐中文，往往对不齐。初学阶段先用 [[|]] 分隔字段，别追求完美表格；等学到字符串宽度和 [[unicodedata]] 再处理。`,
          code: `rows = [
    ("林晓", 91, 84, 88),
    ("陈默", 76, 92, 80),
    ("周宁", 88, 79, 95),
]

print(f"{'姓名':<6} | {'Python':>6} | {'数学':>6} | {'英语':>6}")
print("-" * 38)
for name, p, m, e in rows:
    print(f"{name:<6} | {p:>6} | {m:>6} | {e:>6}")`,
          output: `姓名     | Python |     数学 |     英语
--------------------------------------
林晓     |     91 |     84 |     88
陈默     |     76 |     92 |     80
周宁     |     88 |     79 |     95`,
          tip: `f-string 的宽度是「最小宽度」，不是最大宽度；内容超宽会撑开列。需要截断时先对字符串做切片。`
        },
        {
          h: "算平均分：先想公式，再想类型",
          p: `平均分的公式很简单：总分除以科目数。但在 Python 里，[[sum(scores) / len(scores)]] 有几个必须提前想的边界。第一，[[len(scores)]] 可能为 0，直接除会抛 [[ZeroDivisionError]]；第二，[[/]] 返回 [[float]]，即使三个分数都是整数；第三，[[round()]] 不是数学课上说的「四舍五入」，它遇到恰好 .5 时采用「银行家舍入」，偏向偶数，而且浮点表示会先影响结果。

如果只是展示，保留 1 位或 2 位小数就够了；如果要做等级判断，最好用原始平均分比较，不要拿格式化后的字符串再转回数字。等级边界也要写清楚：[[>= 90]] 是 A，[[>= 80]] 是 B，还是 [[> 90]]？边界差一个等号，结果就会在不同学生身上出问题。

下面这段代码把「计算」和「展示」分开：[[average()]] 负责算，[[level()]] 负责判等级，[[format_report()]] 负责排版。这个分工是后面函数章的预演。`,
          code: `def average(scores):
    if not scores:
        raise ValueError("至少需要一个成绩")
    return sum(scores) / len(scores)

def level(score):
    if score >= 90:
        return "A"
    if score >= 80:
        return "B"
    if score >= 60:
        return "C"
    return "D"

scores = [91, 84, 88]
avg = average(scores)
print(f"平均分: {avg:.1f}")
print(f"等级: {level(avg)}")
print(f"保留两位: {avg:.2f}")`,
          output: `平均分: 87.7
等级: B
保留两位: 87.67`,
          tip: `[[round(2.675, 2)]] 在常见机器上得到 [[2.67]]，不是 [[2.68]]；这不是 Python 算错，而是二进制浮点加银行家舍入。`
        },
        {
          h: "从一段脚本到可复用函数：第一次重构",
          p: `现在把前面的代码收进一个函数。函数的价值不是「代码看起来更高级」，而是把一段行为命名、把输入变成参数、把结果变成返回值。这样你才能测试它、复用它、在其他脚本里导入它。

[[def format_report(name, scores):]] 接收姓名和分数列表，返回一个多行字符串。注意它**返回**字符串，而不是直接 [[print]]。返回让调用方决定输出到哪里：终端、文件、网页都行；直接在函数里 [[print]] 则把函数和终端绑死。

函数内部先用 [[average()]] 算平均，再用 [[level()]] 判等级，最后用 f-string 拼行。最后加 [[if __name__ == "__main__":]]，让这个文件既能直接运行，又能被导入而不产生副作用。下一章我们会把分数换成字符串，把输出写进文件；这一节先把「干净的函数边界」建立起来。`,
          code: `def average(scores):
    if not scores:
        raise ValueError("至少需要一个成绩")
    return sum(scores) / len(scores)

def level(score):
    if score >= 90:
        return "A"
    if score >= 80:
        return "B"
    if score >= 60:
        return "C"
    return "D"

def format_report(name, scores):
    avg = average(scores)
    lines = [
        f"学生: {name}",
        f"成绩: {', '.join(str(s) for s in scores)}",
        f"平均: {avg:.2f}",
        f"等级: {level(avg)}",
    ]
    return "\\n".join(lines)

if __name__ == "__main__":
    print(format_report("林晓", [91, 84, 88]))`,
          output: `学生: 林晓
成绩: 91, 84, 88
平均: 87.67
等级: B`,
          tip: `函数里尽量 [[return]] 结果，不要直接 [[print]]；否则测试时只能看屏幕，不能对返回值做断言。`
        },
        {
          h: "把结果写回文件：第一次持久化",
          p: `屏幕上的输出会随着终端关闭消失。真实项目里，成绩单通常要写进文件，交给老师、交给下游脚本，或者留作记录。Python 写文本文件的最小写法是 [[open(path, "w", encoding="utf-8")]]，但更推荐用 [[with]]：它在代码块结束时自动关闭文件，即使中途抛异常也会关。

打开模式要分清：[[w]] 会截断原文件，文件不存在就创建；[[a]] 追加到末尾；[[x]] 只在文件不存在时创建；[[r]] 只读，文件不存在就抛 [[FileNotFoundError]]。编码也要显式写 [[utf-8]]，不要依赖系统默认编码。中文路径和中文内容在 Windows 上尤其容易因为编码不一致变成乱码。

下面把 [[format_report()]] 的结果写进 [[report.txt]]，再读回来确认。注意 [[write()]] 不会自动加换行，你的字符串里必须有 [[\\n]]；[[print()]] 才自动加换行。`,
          code: `from pathlib import Path

report = "学生: 林晓\\n平均: 87.67\\n等级: B"

path = Path("report.txt")
path.write_text(report, encoding="utf-8")

print("写入了", path.resolve())
print("读回来:")
print(path.read_text(encoding="utf-8"))`,
          output: `写入了 /Users/you/project/report.txt
读回来:
学生: 林晓
平均: 87.67
等级: B`,
          tip: `[[open(..., "w")]] 会清空原文件；只想追加用 [[\"a\"]]。路径优先用 [[pathlib.Path]]，少拼字符串。`
        }
      ],
      points: [
        "先定数据结构和目标输出，再写计算",
        "f-string 的宽度是最小宽度，不是最大宽度",
        "[[/]] 返回 float，展示时再用格式说明符控制小数位",
        "[[round()]] 不是传统四舍五入，边界判断用原始值",
        "函数应返回结果，把输出方式留给调用方",
        "[[join()]] 只能连接字符串，数字要先 [[str()]]"
      ],
      practice: "把 `format_report()` 改成接收一个字典（第 4 章会正式学字典），键是姓名、Python、数学、英语；先不用真的改，想一想：函数签名会变成什么？返回值要不要变？把你的设想写三行注释。"
    }
  ]
});

/* --- ch2.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch2",
  part: 1,
  number: "02",
  title: "字符串、格式化与编码",
  summary: "字符串是后面所有数据处理的入口：你从文件、终端、网页拿到的几乎都是文本。本章把索引切片、常用方法、f-string 格式说明符，以及 UTF-8 与 bytes 的关系一次讲清，让你不再把「乱码」和「对齐错位」当成玄学。",
  goals: [
    "能正确使用索引、切片和步长",
    "能用 strip/split/replace 等方法清洗一行文本",
    "能写出宽度、对齐、小数位都可控的 f-string",
    "能解释 str 与 bytes 的区别，并正确读写 UTF-8 文件"
  ],
  lessons: [
    {
      id: "ch2-1",
      title: "2.1 字符串的索引、切片与方法",
      minutes: 40,
      lead: "字符串看起来简单，但它同时是序列、是不可变对象、也是文本编码的入口。先把「取一个字符」「取一段」「清洗一行」这三件事做对，后面的文件解析和表格处理才有稳定的起点。",
      source: "Introducing Python 3rd · Ch.4；Beginning Python 4th · Ch.2–3；Head First Python 3rd · Ch.1–2",
      sections: [
        {
          h: "字符串是字符序列，不是字符数组",
          p: `Python 的 [[str]] 是一个**不可变序列**。它支持 [[len()]]、索引、切片、[[in]] 和迭代，行为和列表有相似之处，但有一个根本区别：字符串一旦创建，内容不能原地修改。你不能写 [[s[0] = "H"]]，只能创建一个新字符串再重新绑定名字。

「字符」在 Python 3 里是 Unicode 码点，不是字节。[[len("你好")]] 得到 2，因为两个汉字各算一个字符；[[len("👨‍👩‍👧")]] 可能大于 1，因为一个表情可能由多个码点组合。[[s[0]]] 返回的是一个长度为 1 的字符串，不是整数；[[ord(s[0])]] 才拿到码点。这个区分在讲编码时还会回来。

字符串可以用单引号、双引号、三引号。三引号保留换行，适合多行文本和文档字符串；单双引号等价，选一种保持项目一致。相邻字符串字面量会自动拼接，[[“Py” “thon”]] 得到 [[“Python”]]，但不要拿它做复杂拼接，f-string 更清楚。`,
          code: `s = "Python 成绩"
print(len(s))
print(s[0], s[-1])
print(ord(s[0]))
print("成绩" in s)
print("Java" in s)`,
          output: `9
P 绩
80
True
False`,
          tip: `[[len()]] 数字符，不数显示宽度，也不数字节。中文在终端占两格、在 UTF-8 里占三字节，这三件事不要混。`
        },
        {
          h: "索引与切片：左闭右开、负索引、步长",
          p: `索引从 0 开始，[[s[0]]] 是第一个字符，[[s[-1]]] 是最后一个。越界索引会抛 [[IndexError]]，但越界切片不会：[[s[100:200]]] 返回空字符串。切片语法是 [[s[start:stop:step]]]，包含 [[start]]，不包含 [[stop]]，这就是「左闭右开」。

省略起点表示从头开始，省略终点表示一直到末尾，省略步长默认为 1。[[s[::-1]]] 是反转字符串的常用写法；[[s[::2]]] 取每隔一个字符；[[s[1:4]]] 取下标 1、2、3。步长为负数时，起点和终点的默认值会反过来，[[s[5:1:-1]]] 从 5 走到 2。

切片产生新字符串，不会修改原字符串。切片也不会因为范围荒谬而报错，这在清洗数据时很有用：你不知道字段长度，仍然可以先取前 10 个字符，不会崩。`,
          code: `s = "0123456789"
print(s[0], s[-1])
print(s[1:4])
print(s[:3], s[3:], s[::2])
print(s[::-1])
print(s[100:200])
print(s[5:1:-1])`,
          output: `0 9
123
012 3456789 02468
9876543210
(空字符串)
5432`,
          tip: `切片边界写错不会报错，只会悄悄返回空串或少取字符；解析固定格式时，先打印 [[repr(s)]] 看真实内容。`
        },
        {
          h: "常用方法：strip、split、replace、startswith",
          p: `真实文本总是带脏东西：行尾换行、前后空格、空行、全角逗号。[[strip()]] 去掉两端空白，[[lstrip()]] / [[rstrip()]] 只去一边；[[strip("\\n\\r")]] 可以指定字符集合。注意 [[strip()]] 不会去掉中间的空格，也不会去掉中文全角空格，除非你把它放进参数。

[[split()]] 不带参数时按任意空白切分，并自动丢弃连续空白；[[split(",")]] 按逗号切分，连续逗号会产生空字段。[[replace(old, new, count)]] 返回替换后的新字符串，[[count]] 控制次数。[[startswith()]] / [[endswith()]] 可以接收元组，一次判断多个前缀。

这些方法都返回新字符串，原字符串不变。方法链 [[line.strip().split(",")]] 很常见，但要清楚每一步返回什么：[[strip()]] 返回字符串，[[split()]] 返回列表。不要在 [[split()]] 后面继续调字符串方法。`,
          code: `line = "  林晓, 91, 84, 88  \\n"
print(repr(line))
print(repr(line.strip()))
print(line.strip().split(","))

fields = line.strip().split(",")
print([f.strip() for f in fields])

print("report.csv".endswith((".csv", ".txt")))
print("a,b,,c".split(","))`,
          output: `'  林晓, 91, 84, 88  \\n'
'林晓, 91, 84, 88'
['林晓', ' 91', ' 84', ' 88']
['林晓', '91', '84', '88']
True
['a', 'b', '', 'c']`,
          tip: `[[split(",")]] 不会自动去掉字段两侧空格；先 [[strip()]] 整行，再对每个字段 [[strip()]]。连续分隔符会产生空串字段。`
        },
        {
          h: "不可变性：每次修改都产生新字符串",
          p: `字符串不可变，所以 [[s.lower()]]、[[s.replace()]]、[[s + "!"]] 都不是「改掉原来的 s」，而是创建新字符串。原来的 [[s]] 仍然指向旧对象。这个特性和列表的 [[append()]] 完全不同，也是很多「为什么原字符串没变」问题的答案。

不可变带来两个好处：字符串可以安全地作为字典键、可以缓存哈希值、可以在多线程环境里共享而不担心被改。代价是大量拼接会产生很多临时对象。循环里 [[s += piece]] 在 CPython 中有时会被优化，但不要依赖它；要拼很多片段，用 [["".join(parts)]]。

如果你确实需要「可修改的字符序列」，用 [[list(s)]] 转成字符列表，改完再 [["".join(chars)]] 拼回去。这不是绕过不可变性，而是换了一个可变容器。`,
          code: `s = "Python"
print(s.lower())
print(s)
print(s.replace("P", "J"))
print(s)

chars = list(s)
chars[0] = "J"
print("".join(chars))
print(s)

parts = ["林晓", ":", "91"]
print("".join(parts))`,
          output: `python
Python
Jython
Python
Jython
Python
林晓:91`,
          tip: `[[s += "x"]] 是重新绑定，不是原地修改；如果别的名字还指向旧字符串，它不会看到变化。`
        },
        {
          h: "小任务：从一行成绩文本拆字段",
          p: `现在把方法组合起来，解析一行真实成绩记录：[[“林晓, 91, 84, 88”]]。目标是得到姓名和三个整数。步骤要拆清楚：先去两端空白，再按逗号切分，再逐字段去空格，再转整数。每一步都可能出错，所以每一步都要能单独验证。

[[int(" 91 ")]] 其实能接受前后空格，但不要依赖这一点；显式 [[strip()]] 让意图更清楚。字段数量也要检查：如果文件里混进了空行，[[split(",")]] 可能只得到一个元素，直接解包会抛 [[ValueError]]。先判断长度，再解包，是处理外部数据的基本习惯。

这个解析器就是下一章列表和字典的雏形。现在先用最朴素的方式写，等学了列表推导式和异常处理，再把它改得更健壮。`,
          code: `line = " 林晓, 91, 84, 88 "

fields = [part.strip() for part in line.strip().split(",")]
if len(fields) != 4:
    raise ValueError(f"字段数量不对: {fields}")

name, p, m, e = fields
scores = [int(p), int(m), int(e)]
print(name)
print(scores)
print(sum(scores) / len(scores))`,
          output: `林晓
[91, 84, 88]
87.66666666666667`,
          tip: `解包前先检查长度；外部文件的字段数量永远不要假设。[[int()]] 失败会抛 [[ValueError]]，不要静默吞掉。`
        }
      ],
      points: [
        "字符串是不可变序列，索引返回长度为 1 的字符串",
        "切片左闭右开，越界切片返回空串而不报错",
        "[[strip()]] 只去两端字符，不去中间空白",
        "[[split()]] 不带参数按任意空白切分，带分隔符会保留空字段",
        "字符串方法都返回新字符串，原对象不变",
        "大量拼接优先用 [[join()]]，不要依赖 [[+=]] 优化"
      ],
      practice: "把 `parse_line()` 写成一个函数：接收一行文本，返回 `(name, [scores])`。分别用正常行、空行、少一个字段的行测试，确认报错信息能指出问题。"
    },
    {
      id: "ch2-2",
      title: "2.2 f-string 与对齐格式",
      minutes: 40,
      lead: "输出不是「能看见就行」。成绩单、日志、终端表格都需要列宽稳定、数字精度一致、负数有符号。f-string 的格式说明符能把这些规则写死在模板里，让排版从手工调空格变成可复现的代码。",
      source: "Introducing Python 3rd · Ch.4；Beginning Python 4th · Ch.3；Head First Python 3rd · Ch.2",
      sections: [
        {
          h: "f-string 不只是拼接",
          p: `f-string 在字符串前加 [[f]]，花括号里可以放任意表达式：变量、算术、函数调用、索引、条件表达式。它会在运行时求值，把结果转成字符串插进去。和 [[+]] 拼接相比，f-string 不需要手动 [[str()]]，也不会因为类型不匹配而报错。

花括号里的表达式只求值一次，但不要在里面塞有副作用的调用，比如 [[f"{save()}"]]。格式化的目的是展示，不是执行逻辑。复杂计算先算好放进变量，再插值，代码会清楚很多。

要输出字面花括号，用双花括号：[[f"{{name}}"]] 得到 [[{name}]]，不是变量值。这个规则在写 JSON 模板、LaTeX 或前端代码时经常遇到。Python 3.8 以后还可以用 [[f"{x=}"]] 调试，它会打印表达式文本和值，适合临时排查。`,
          code: `name = "林晓"
score = 91

print(f"{name} 的成绩是 {score}")
print(f"总分: {score + 5}")
print(f"大写: {name.upper()}")
print(f"字面花括号: {{name}}")
print(f"{score=}")`,
          output: `林晓 的成绩是 91
总分: 96
大写: 林晓
字面花括号: {name}
score=91`,
          tip: `f-string 里的表达式不要做写操作；[[f"{items.pop()}"]] 会悄悄改变数据，调试时很难发现。`
        },
        {
          h: "格式说明符：宽度、对齐、填充",
          p: `冒号后面是格式说明符。最常见的是宽度和对齐：[[f"{name:>10}"]] 右对齐，[[f"{name:<10}"]] 左对齐，[[f"{name:^10}"]] 居中。宽度是最小宽度，不是最大宽度；内容超过宽度时会原样撑开，不会截断。

填充字符写在宽度前面：[[f"{name:*^10}"]] 用 [[*]] 居中填充；[[f"{score:0>5}"]] 用 0 右填充，常用于编号。对齐符号和宽度之间还可以加符号、逗号、精度，顺序不能乱：[[[fill][align][sign][#][0][width][,][.precision][type]]]。记不住全部没关系，先掌握「填充+对齐+宽度」和「宽度+精度+类型」。

表格对齐的常见错误，是给每个字段都写同一个宽度，却不考虑表头和数据谁更宽。正确做法是先算每列最大宽度，再把这个宽度放进格式说明符；或者先用 [[|]] 分隔，保证结构不塌。`,
          code: `rows = [("林晓", 91), ("陈默", 7), ("周宁", 100)]

for name, score in rows:
    print(f"|{name:<6}|{score:>5}|")

print(f"{'中心':*^12}")
print(f"{7:0>3}")
print(f"{'左':<8}结束")`,
          output: `|林晓  |   91|
|陈默  |    7|
|周宁  |  100|
****中心****
007
左      结束`,
          tip: `宽度只保证「至少这么宽」，不保证「不超过」；要截断先切片，要换行先 [[textwrap]]。`
        },
        {
          h: "数字格式：小数、千分位、百分比、正负号",
          p: `数字格式说明符解决四类问题：精度、千分位、百分比、符号。[[.2f]] 保留两位小数，[[,.2f]] 再加千分位；[[.1%]] 把小数转成百分比并保留一位；[[+d]] 强制显示正负号；[[#x]] 给十六进制加 [[0x]] 前缀。

[[f"{0.875:.1%}"]] 得到 [[87.5%]]，不是 [[0.9%]]。百分号格式会自动乘以 100，所以传进去的必须是小数，不是 87.5。[[f"{1234567:,}"]] 得到 [[1,234,567]]，逗号是千分位分隔符，不是小数点。

精度只影响显示，不改变变量本身。[[avg]] 还是原始浮点值，[[f"{avg:.2f}"]] 只是生成一个字符串。后续计算继续用 [[avg]]，不要拿格式化后的字符串转回数字，否则会丢掉精度并引入解析成本。`,
          code: `value = 1234567.891
ratio = 0.875
delta = 12

print(f"{value:,.2f}")
print(f"{ratio:.1%}")
print(f"{delta:+d}")
print(f"{-delta:+d}")
print(f"{255:#x}")
print(f"{value:.0f}")`,
          output: `1,234,567.89
87.5%
+12
-12
0xff
1234568`,
          tip: `[[%]] 格式接收小数；[[f"{87.5:.1%}"]] 会得到 [[8750.0%]]。先确认你的数据是比例还是百分数。`
        },
        {
          h: "动态宽度与嵌套字段",
          p: `宽度不一定是写死的数字，也可以是另一个变量。f-string 允许在格式说明符里再放一对花括号：[[f"{name:{width}}"]]、[[f"{value:{width}.{precision}f}"]]。这在生成表格时非常有用：你先扫描一遍数据，算出每列最大宽度，再统一格式化。

嵌套字段的求值顺序是先算内层，再套外层。宽度必须是整数；如果传了字符串，会抛 [[ValueError]]。精度也必须是整数。不要把用户输入直接塞进格式说明符，先做类型检查和范围限制。

动态宽度也有边界：终端有最大宽度，太长的内容会换行；网页有 CSS 宽度，不应该靠空格硬撑。文本表格适合终端和日志，不适合网页排版。知道场景，才知道什么时候该停止用空格对齐。`,
          code: `rows = [("林晓", 91), ("陈默", 7), ("周宁", 100)]
name_width = max(len(name) for name, _ in rows) + 2
score_width = 5

for name, score in rows:
    print(f"{name:<{name_width}}|{score:>{score_width}}")

print(f"{'合计':<{name_width}}|{sum(s for _, s in rows):>{score_width}}")`,
          output: `林晓  |   91
陈默  |    7
周宁  |  100
合计  |  198`,
          tip: `动态宽度必须是整数；[[f"{x:{w}}"]] 里 [[w]] 不能是字符串。宽度变大时记得同步调整分隔线。`
        },
        {
          h: "常见坑：花括号、类型不匹配、中文宽度",
          p: `f-string 最常见的三个坑，第一是花括号：想输出 [[{]] 必须写 [[{{]]，否则解析器会把它当成表达式起点。第二是类型不匹配：格式说明符要和值类型匹配，[[f"{name:>6.1f}"]] 对字符串用 [[.1f]] 会抛 [[ValueError]]；[[f"{score:>6}"]] 对整数是合法的，但 [[f"{score:>6.1f}"]] 会把整数转成浮点显示。

第三个坑是中文宽度。[[len("林晓")]] 是 2，但终端里通常占 4 个英文字符宽度。你用 [[:<6]] 补 4 个空格，实际显示会偏窄或偏宽。网页里更不能用空格对齐中文，应该用表格或 CSS。终端里如果必须对齐，需要按显示宽度计算，而不是 [[len()]]。

还有一个隐蔽问题：[[!r]] 和 [[!s]]。[[f"{value!r}"]] 调用 [[repr()]]，字符串会带引号，适合调试；[[f"{value!s}"]] 调用 [[str()]]，适合展示。默认是 [[str()]]，但对象自定义了 [[__format__]] 时，格式说明符可能改变行为。`,
          code: `name = "林晓"
score = 91

try:
    print(f"{name:>6.1f}")
except ValueError as exc:
    print("ValueError:", exc)

print(f"{{name}} -> {name}")
print(f"{name!r}")
print(f"{score!r}")`,
          output: `ValueError: Unknown format code 'f' for object of type 'str'
{name} -> 林晓
'林晓'
91`,
          tip: `中文对齐不要用 [[len()]] 当显示宽度；终端用等宽字体和显示宽度库，网页用表格/CSS。`
        }
      ],
      points: [
        "f-string 的花括号里可以放表达式，但不要放有副作用的调用",
        "宽度是最小宽度，内容超宽会撑开",
        "格式说明符顺序：填充、对齐、符号、宽度、逗号、精度、类型",
        "[[%]] 格式接收小数比例，会自动乘以 100",
        "动态宽度必须是整数",
        "中文显示宽度不等于字符个数，网页不要用空格硬对齐"
      ],
      practice: "用 f-string 打印一张三列成绩表：姓名左对齐、Python 右对齐、平均分保留两位。先用固定宽度，再用动态宽度重写一次，比较两次输出。"
    },
    {
      id: "ch2-3",
      title: "2.3 文本文件与编码：UTF-8、bytes 初识",
      minutes: 45,
      lead: "文本文件在磁盘上不是「文字」，而是一串字节。你看到的汉字，是解码器按照某种编码把字节解释出来的结果。编码选错，字节没坏，解释错了，于是出现乱码。这一节把 str、bytes、UTF-8 和读写文件连成一条线。",
      source: "Introducing Python 3rd · Ch.5；Beginning Python 4th · Ch.12；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "文本文件在磁盘上其实是字节",
          p: `计算机存储的最小单位是字节。文本文件里保存的不是「林」这个字形，而是「林」在某个编码方案下对应的字节序列。UTF-8 是目前最常用的方案：ASCII 字符占 1 字节，常见汉字占 3 字节，部分表情占 4 字节。

Python 3 把「文本」和「字节」分成两个类型：[[str]] 是 Unicode 字符串，[[bytes]] 是 0–255 的字节序列。[["林".encode("utf-8")]] 得到 [[b'\\xe6\\x9e\\x97']]，三个字节；[[b'\\xe6\\x9e\\x97'.decode("utf-8")]] 才回到 [[“林”]]。编码是 str → bytes，解码是 bytes → str，方向不能反。

[[bytes]] 的索引返回整数，不是长度为 1 的 bytes：[[b"ABC"[0]]] 是 65。[[bytes]] 不可变，[[bytearray]] 可变。日常处理文本优先用 [[str]]，只有在网络协议、二进制文件、加密、压缩这些场景才直接操作 bytes。`,
          code: `text = "林"
data = text.encode("utf-8")
print(data)
print(len(data))
print(data[0])
print(data.decode("utf-8"))
print("ABC".encode("ascii"))
print("ABC".encode("utf-8"))`,
          output: `b'\\xe6\\x9e\\x97'
3
230
林
b'ABC'
b'ABC'`,
          tip: `看到 [[b'...']] 就知道是 bytes；不要对 bytes 直接做字符串拼接，先 decode 或先 encode。`
        },
        {
          h: "UTF-8 的变长编码与中文",
          p: `UTF-8 是变长编码：它用 1–4 个字节表示一个 Unicode 码点。ASCII 范围（0–127）保持 1 字节，和旧系统兼容；欧洲语言多用 2 字节；中文常用 3 字节；部分表情 4 字节。变长的好处是省空间、兼容 ASCII；代价是不能用固定偏移切字符。

你不能用 [[data[0:3]]] 随便切一个「看起来像三个字节」的片段就保证是完整汉字。UTF-8 的字节有前缀位规则，切在字符中间会产生非法序列，解码时报 [[UnicodeDecodeError]]。要按字符切，先 decode 成 [[str]]，切完再 encode；或者用支持字符边界的库。

[[len("林")]] 是 1，[[len("林".encode("utf-8"))]] 是 3。这两个长度回答的是不同问题：字符数、字节数。做文件大小统计用字节数，做显示宽度用显示宽度，做字段长度用字符数。`,
          code: `text = "林晓"
data = text.encode("utf-8")
print("字符数:", len(text))
print("字节数:", len(data))
print("逐字节:", list(data))

broken = data[:2]
try:
    print(broken.decode("utf-8"))
except UnicodeDecodeError as exc:
    print("UnicodeDecodeError:", exc)`,
          output: `字符数: 2
字节数: 6
逐字节: [230, 158, 151, 230, 153, 147]
UnicodeDecodeError: 'utf-8' codec can't decode byte 0x9e in position 0: invalid start byte`,
          tip: `不要在 UTF-8 字节串上按固定长度切字符；先 decode 成 str，按字符处理。`
        },
        {
          h: "encode/decode 与错误处理",
          p: `编码和解码都可能失败。把中文用 ASCII 编码，[[“林”.encode("ascii")]] 会抛 [[UnicodeEncodeError]]；把一段非法 UTF-8 字节解码，会抛 [[UnicodeDecodeError]]。错误处理参数有三个常见值：[[strict]] 默认，遇错就抛；[[ignore]] 直接丢掉非法部分；[[replace]] 用 [[?]] 或 [[�]] 替代。

[[ignore]] 很危险：它让程序「不报错」，但数据已经缺了。除非你明确知道丢失可接受，否则不要用它处理用户数据。[[replace]] 适合展示和容错，但要记录日志。[[errors="surrogateescape"]] 是更高级的方案，用于把无法解码的字节原样带回，不是入门阶段该用的。

还要注意「编码声明」和「文件编码」是两件事。Python 3 源码默认 UTF-8，源文件里的字符串字面量按 UTF-8 解析；读写数据文件时，[[open()]] 的 [[encoding]] 参数决定字节和 str 的转换方式。两者不要混。`,
          code: `text = "林"
for errors in ("strict", "ignore", "replace"):
    try:
        print(errors, text.encode("ascii", errors=errors))
    except UnicodeEncodeError as exc:
        print(errors, "UnicodeEncodeError")

bad = b"\\xe6\\x9e"
print(bad.decode("utf-8", errors="replace"))`,
          output: `strict UnicodeEncodeError
ignore b''
replace b'?'
�`,
          tip: `[[errors="ignore"]] 会让数据静默丢失；生产代码优先让错误暴露，或在替换时记录日志。`
        },
        {
          h: "读写文本：encoding、newline 与 BOM",
          p: `[[open(path, "r", encoding="utf-8")]] 返回文本文件对象，读出来是 [[str]]；[[open(path, "rb")]] 返回二进制文件对象，读出来是 [[bytes]]。写文件同理：文本模式接收 [[str]]，二进制模式接收 [[bytes]]。

换行符也值得注意。Windows 用 [[\\r\\n]]，Unix 用 [[\\n]]。Python 文本模式默认启用 universal newlines，读的时候把 [[\\r\\n]] 和 [[\\r]] 都转成 [[\\n]]；写的时候按当前平台转换。如果你要精确控制换行，传 [[newline=""]] 或 [[newline="\\n"]]。处理 CSV 时尤其要注意，不要让额外空行混进来。

BOM 是 UTF-8 文件开头可能出现的 [[\\ufeff]]。有些 Windows 软件会写 BOM。用 [[encoding="utf-8"]] 读会把这个字符留在字符串开头，导致第一列字段名多一个不可见字符；用 [[utf-8-sig]] 会自动去掉。看到「第一行第一个字段怎么都对不上」时，先查 BOM。`,
          code: `from pathlib import Path

path = Path("scores.txt")
path.write_text("林晓,91\\n陈默,76\\n", encoding="utf-8")

with path.open("r", encoding="utf-8", newline="") as fh:
    for line in fh:
        print(repr(line))

print(path.read_text(encoding="utf-8").splitlines())`,
          output: `'林晓,91\\n'
'陈默,76\\n'
['林晓,91', '陈默,76']`,
          tip: `[[splitlines()]] 会去掉行尾换行，适合按行处理；[[read()]] 保留全部换行，适合整体文本。`
        },
        {
          h: "小任务：统计文件中的行数与中文字符",
          p: `现在做一个不依赖第三方库的小工具：读一个 UTF-8 文本文件，统计总行数、非空行数、中文字符数。这个任务把「读文件」「逐行」「字符判断」串起来，也让你第一次面对真实文件里的空行和空格。

判断中文可以用码点范围：[[\\u4e00]] 到 [[\\u9fff]] 覆盖常用汉字，但不覆盖扩展区和部分生僻字。入门阶段够用，真实项目应该用 [[unicodedata]] 或正则的 Unicode 属性。不要用 [[isalpha()]] 判断中文，它会把英文字母也算进去。

统计时逐行读，不要一次 [[read()]] 整个大文件。[[for line in fh]] 是流式迭代，内存占用和文件大小无关。行数用 [[enumerate]] 或计数器；非空行用 [[line.strip()]] 判断；中文字符数用 [[sum(1 for ch in line if ...)]]。`,
          code: `from pathlib import Path

path = Path("scores.txt")
lines = 0
non_empty = 0
chinese = 0

with path.open("r", encoding="utf-8") as fh:
    for line in fh:
        lines += 1
        if line.strip():
            non_empty += 1
        chinese += sum(1 for ch in line if "\\u4e00" <= ch <= "\\u9fff")

print(f"总行数: {lines}")
print(f"非空行: {non_empty}")
print(f"中文字符: {chinese}")`,
          output: `总行数: 2
非空行: 2
中文字符: 4`,
          tip: `统计大文件要逐行读；[[read()]] 会把整个文件装进内存。中文范围判断只是入门方案，生僻字要另行处理。`
        }
      ],
      points: [
        "[[str]] 是 Unicode 文本，[[bytes]] 是字节序列",
        "encode 是 str → bytes，decode 是 bytes → str",
        "UTF-8 变长，汉字通常 3 字节，不能按固定偏移切字符",
        "[[errors=\"ignore\"]] 会静默丢数据，慎用",
        "文本模式读 [[str]]，二进制模式读 [[bytes]]",
        "BOM 会让第一个字段多出不可见字符，必要时用 [[utf-8-sig]]"
      ],
      practice: "创建一个带空行和 BOM 的 UTF-8 文件，用 `utf-8` 和 `utf-8-sig` 分别读取，打印第一行的 `repr()`，解释差异。"
    }
  ]
});

/* --- ch3.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch3",
  part: 1,
  number: "03",
  title: "列表、元组与序列",
  summary: "从这一章开始，数据不再是一个个孤立变量。列表负责「可变的批量数据」，元组负责「不可变的记录」，切片、排序和拷贝则决定你拿到的是原数据还是新副本。三条线交叉的地方，就是后面所有成绩表和日志处理的底座。",
  goals: [
    "能熟练使用列表的增删改查与遍历",
    "能说清切片、sort/sorted、浅拷贝与深拷贝的差别",
    "能用元组表达一条不可变记录，并用解包取值",
    "能用 zip 和多键排序处理一张成绩表"
  ],
  lessons: [
    {
      id: "ch3-1",
      title: "3.1 列表的增删改查与遍历",
      minutes: 40,
      lead: "列表是 Python 里最常用的容器。它有序、可变、能装不同类型。重点不是记住所有方法，而是知道每个操作改的是原列表还是返回新列表，以及删除元素时下标为什么会变。",
      source: "Introducing Python 3rd · Ch.6；Beginning Python 4th · Ch.3–4；Head First Python 3rd · Ch.2–3",
      sections: [
        {
          h: "列表是可变序列：能改、能长、能缩",
          p: `列表用方括号写，元素用逗号分隔。它可以装不同类型：[[[1, "two", 3.0, True]]] 是合法列表。列表有序，所以能用下标访问；列表可变，所以能原地追加、删除、替换。字符串也有序，但不可变；元组有序，也不可变。三者的核心差别就在「能不能原地改」。

创建列表不等于创建独立元素。[[[0] * 3]] 得到三个 0，因为整数不可变；但 [[[[]] * 3]] 得到三个引用，指向同一个空列表。你改其中一个，三个都会变。这个坑在第 3.2 节讲拷贝时会彻底拆开。

列表的 [[len()]] 是元素个数，不是容量。Python 的列表内部会预留额外空间以减少扩容次数，但你看不到容量，也不需要手动管理。不要用 C 的数组思维去估算内存。`,
          code: `mixed = [1, "two", 3.0, True]
print(mixed)
print(len(mixed))
print(mixed[1], mixed[-1])

zeros = [0] * 3
print(zeros)

rows = [[]] * 3
rows[0].append("x")
print(rows)`,
          output: `[1, 'two', 3.0, True]
4
two True
[0, 0, 0]
[['x'], ['x'], ['x']]`,
          tip: `[[[[]] * 3]] 创建的是三个指向同一列表的引用；要三个独立空列表，用 [[[[] for _ in range(3)]]]。`
        },
        {
          h: "增删改：append、extend、insert、pop、remove、del",
          p: `[[append(x)]] 在末尾追加一个元素；[[extend(iterable)]] 把另一个可迭代对象的元素逐个追加；[[insert(i, x)]] 在指定下标前插入。三者都原地修改，返回 [[None]]。很多人写 [[items = items.append(x)]]，结果把列表变成了 [[None]]，因为 append 没有返回值。

删除有四种常见方式。[[pop()]] 删除并返回最后一个元素，[[pop(i)]] 删除并返回指定下标；[[remove(x)]] 删除第一个值等于 x 的元素，找不到就抛 [[ValueError]]；[[del items[i]]] 按下标删除；[[clear()]] 清空。删除后后面的元素会前移，原来保存的下标可能失效。

修改可以直接赋值：[[items[0] = "new"]]。如果下标越界，抛 [[IndexError]]。批量替换用切片赋值，第 3.2 节会讲。记住：列表方法大多原地修改，字符串方法大多返回新对象，这是两种完全不同的风格。`,
          code: `items = ["a", "b"]
items.append("c")
items.extend(["d", "e"])
items.insert(1, "x")
print(items)

print(items.pop())
print(items.pop(0))
print(items)

items.remove("b")
print(items)

del items[0]
print(items)`,
          output: `['a', 'x', 'b', 'c', 'd', 'e']
e
a
['x', 'b', 'c', 'd']
['x', 'c', 'd']
['c', 'd']`,
          tip: `[[append()]] 返回 [[None]]，不要写 [[items = items.append(x)]]；[[remove()]] 按值删，[[pop()]] 按下标删。`
        },
        {
          h: "查找与遍历：in、index、count、enumerate",
          p: `[[x in items]] 判断值是否存在，时间复杂度是 O(n)，不是 O(1)。[[index(x)]] 返回第一个匹配的下标，找不到抛 [[ValueError]]；[[count(x)]] 统计出现次数。这三个方法都做线性扫描，列表很大时要注意成本。

遍历用 [[for item in items]]。如果你同时需要下标，用 [[enumerate(items)]]，它每次返回 [[(index, item)]]。不要写 [[for i in range(len(items))]] 再 [[items[i]]]，那样既不 Pythonic，也容易在删除元素时出错。

遍历时不要一边遍历一边删除。删除会让后面的元素前移，迭代器仍按旧下标走，结果会跳过元素。要过滤，用新列表或列表推导式；要原地删，倒着遍历或先收集下标再删。`,
          code: `items = ["a", "b", "a", "c"]
print("a" in items)
print(items.index("a"))
print(items.count("a"))

for index, item in enumerate(items, start=1):
    print(index, item)

bad = ["a", "b", "c"]
for item in bad:
    if item == "b":
        bad.remove(item)
print(bad)`,
          output: `True
0
2
1 a
2 b
3 a
4 c
['a', 'c']`,
          tip: `遍历时删除会跳过元素；用 [[[x for x in items if cond]]] 生成新列表，或倒序删除。`
        },
        {
          h: "嵌套列表与别名：一层列表不是深拷贝",
          p: `成绩表通常是嵌套列表：[[[[“林晓”, 91], [“陈默”, 76]]]]。外层列表装的是内层列表的引用。[[row = table[0]]] 不是复制第一行，而是让 [[row]] 指向同一个内层列表；[[row[1] = 100]] 会改掉表里的数据。

[[table[:]]] 只复制外层，内层还是共享的，这叫浅拷贝。要真正独立，需要 [[copy.deepcopy(table)]]，或者手动逐行复制：[[[row[:] for row in table]]]。大多数场景你只需要读，不需要拷贝；一旦要改，先问「我改的是副本还是原数据」。

嵌套结构也让 [[in]] 和 [[index]] 的行为变得微妙：[[[1, 2] in [[1, 2], [3, 4]]]] 比较的是内层列表的值，不是身份。[[==]] 递归比较内容，[[is]] 才比较对象身份。`,
          code: `table = [["林晓", 91], ["陈默", 76]]
row = table[0]
row[1] = 100
print(table)

shallow = table[:]
shallow[0][1] = 88
print("原表也被改:", table)

import copy
deep = copy.deepcopy(table)
deep[0][1] = 70
print("原表不变:", table)
print("深拷贝:", deep)`,
          output: `[['林晓', 100], ['陈默', 76]]
原表也被改: [['林晓', 88], ['陈默', 76]]
原表不变: [['林晓', 88], ['陈默', 76]]
深拷贝: [['林晓', 70], ['陈默', 76]]`,
          tip: `[[table[:]]] 只复制一层；嵌套列表要 [[copy.deepcopy()]] 或逐行 [[row[:]]]。`
        },
        {
          h: "小任务：把成绩行变成记录列表",
          p: `把第 2 章的行解析器升级：读多行文本，每行解析成 [[[name, python, math, english]]]，存入列表。这个任务会用到 [[split]]、[[strip]]、[[int]]、[[append]] 和 [[for]]，是列表最典型的入门用法。

不要把「读文件」和「解析」混在一个巨大循环里。先写 [[parse_line(line)]] 返回一条记录，再写 [[load_rows(path)]] 逐行读取并 append。这样单行解析可以单独测试，文件读取也可以单独替换。

空行要跳过，字段数量要检查，转换失败要给出带行号的错误。真实数据不会按你的假设长得那么整齐；先让程序在坏数据上给出清楚错误，再谈统计。`,
          code: `from pathlib import Path

def parse_line(line):
    fields = [part.strip() for part in line.strip().split(",")]
    if len(fields) != 4:
        raise ValueError(f"字段数量不对: {fields}")
    name, p, m, e = fields
    return [name, int(p), int(m), int(e)]

def load_rows(path):
    rows = []
    with Path(path).open("r", encoding="utf-8") as fh:
        for line_no, line in enumerate(fh, start=1):
            if not line.strip():
                continue
            try:
                rows.append(parse_line(line))
            except ValueError as exc:
                raise ValueError(f"第 {line_no} 行: {exc}") from exc
    return rows

rows = load_rows("scores.txt")
print(rows)`,
          output: `[['林晓', 91, 84, 88], ['陈默', 76, 92, 80]]`,
          tip: `用 [[enumerate(fh, start=1)]] 保留行号；解析失败时把行号带进异常，排查会快很多。`
        }
      ],
      points: [
        "列表有序、可变，可以装不同类型",
        "[[append()]] 追加一个，[[extend()]] 追加多个，二者返回 [[None]]",
        "[[remove()]] 按值删第一个，[[pop()]] 按下标删并返回",
        "遍历时删除会跳过元素",
        "[[in]] / [[index]] / [[count]] 都是线性扫描",
        "嵌套列表的 [[[:]]] 是浅拷贝，内层仍共享"
      ],
      practice: "把 `load_rows()` 改成遇到坏行不中断，而是把错误收集到 `errors` 列表继续处理；最后返回 `(rows, errors)`。这是真实数据清洗更常见的策略。"
    },
    {
      id: "ch3-2",
      title: "3.2 切片、排序与拷贝",
      minutes: 45,
      lead: "这一节讲三个容易「看起来一样、实际完全不同」的操作：切片、排序、拷贝。它们都跟「新列表还是原列表」有关。搞清楚谁改原对象、谁返回新对象，你才能避免成绩表被悄悄改掉。",
      source: "Introducing Python 3rd · Ch.6；Beginning Python 4th · Ch.4；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "切片产生新列表，切片赋值改变原列表",
          p: `列表切片 [[items[start:stop:step]]] 返回一个新列表，包含选中元素。原列表不变。切片赋值 [[items[start:stop] = other]] 则是另一回事：它会把原列表中对应区间替换成 [[other]] 的元素，长度可以变化。

[[items[1:3] = ["x"]]] 会把下标 1、2 两个元素换成一个 [[“x”]]，列表变短。[[items[1:1] = ["x", "y"]]] 在 1 前面插入两个元素，因为替换的是一个空区间。切片赋值右边的对象必须是可迭代的；给一个整数会抛 [[TypeError]]。

切片步长不为 1 时，赋值要求右边长度和切片长度一致，否则抛 [[ValueError]]。这条规则很细，入门阶段先掌握「整段替换」和「插入」两种用法，步长赋值等需要时再查。`,
          code: `items = ["a", "b", "c", "d", "e"]
print(items[1:4])
print(items[:2], items[2:])

items[1:3] = ["x"]
print(items)

items[1:1] = ["y", "z"]
print(items)

items[::2] = ["A", "B", "C"]
print(items)`,
          output: `['b', 'c', 'd']
['a', 'b'] ['c', 'd', 'e']
['a', 'x', 'd', 'e']
['a', 'y', 'z', 'x', 'd', 'e']
['A', 'y', 'B', 'x', 'C', 'e']`,
          tip: `切片赋值不是「复制」，它直接改原列表；右边必须是可迭代对象，字符串也会被逐字符插入。`
        },
        {
          h: "sort 与 sorted：原地排序和新列表排序",
          p: `[[items.sort()]] 原地排序，返回 [[None]]；[[sorted(items)]] 返回新列表，原列表不变。这两个选择没有优劣，取决于你要不要保留原顺序。很多 bug 来自 [[items = items.sort()]]，因为 [[items]] 变成了 [[None]]。

两者都支持 [[key]] 和 [[reverse]]。[[key]] 接收一个函数，对每个元素算出排序键；[[reverse=True]] 降序。[[key=len]] 按长度排，[[key=str.lower]] 忽略大小写排，[[key=lambda row: row[1]]] 按第二列排。

排序是稳定的：键相同的元素保持原来的相对顺序。这个特性让多键排序可以分两步做：先按次要键排，再按主要键排。更直接的写法是 [[key=lambda row: (-row[1], row[0])]]，用负号实现降序，用元组实现多键。`,
          code: `items = ["banana", "Apple", "cherry"]
print(sorted(items))
print(sorted(items, key=str.lower))
print(sorted(items, key=len, reverse=True))
print(items)

rows = [["林晓", 87], ["陈默", 87], ["周宁", 95]]
rows.sort(key=lambda row: (-row[1], row[0]))
print(rows)`,
          output: `['Apple', 'banana', 'cherry']
['Apple', 'banana', 'cherry']
['banana', 'cherry', 'Apple']
['banana', 'Apple', 'cherry']
[['周宁', 95], ['陈默', 87], ['林晓', 87]]`,
          tip: `[[sort()]] 返回 [[None]]；不要写 [[rows = rows.sort()]]。要保留原列表用 [[sorted()]]。`
        },
        {
          h: "排序稳定性与多键排序",
          p: `稳定排序的意思是：如果两个元素的排序键相同，它们在结果里的先后顺序和原列表一致。Python 的 [[sort]] 和 [[sorted]] 都保证稳定。这个保证不是装饰，它让你可以先按姓名排，再按分数排，最终同分的人仍按姓名顺序。

多键排序有两种写法。第一种是用元组做键：[[key=lambda row: (row[1], row[0])]]，先比第二列，再比第一列；元组比较是从左到右逐项比较。第二种是用负号把「降序」变成「升序」：[[key=lambda row: (-row[1], row[0])]]，适合数字。

不要写一个复杂的 [[cmp]] 函数再模拟比较器；Python 3 的 [[sort]] 不接受 [[cmp]]。如果逻辑真的复杂，用 [[functools.cmp_to_key]]，但优先用 [[key]]。[[key]] 每个元素只调用一次，效率更好。`,
          code: `rows = [
    ["林晓", 87, "A"],
    ["陈默", 87, "B"],
    ["周宁", 95, "A"],
    ["赵一", 95, "B"],
]

rows.sort(key=lambda row: row[0])
rows.sort(key=lambda row: row[1], reverse=True)
print(rows)

rows.sort(key=lambda row: (-row[1], row[0]))
print(rows)`,
          output: `[['周宁', 95, 'A'], ['赵一', 95, 'B'], ['陈默', 87, 'B'], ['林晓', 87, 'A']]
[['周宁', 95, 'A'], ['赵一', 95, 'B'], ['陈默', 87, 'B'], ['林晓', 87, 'A']]`,
          tip: `稳定排序 + 分步排序可以做多键；更推荐直接返回元组键，意图更清楚。`
        },
        {
          h: "拷贝的三层：别名、浅拷贝、深拷贝",
          p: `第一层是别名：[[b = a]]，两个名字指向同一个对象。第二层是浅拷贝：[[a[:]]]、[[list(a)]]、[[a.copy()]]，外层是新对象，内层元素仍是原来的引用。第三层是深拷贝：[[copy.deepcopy(a)]]，递归复制所有嵌套对象，得到完全独立的副本。

对只包含不可变元素（整数、字符串、元组）的列表，浅拷贝已经够用，因为内层元素不会被改。对嵌套列表、字典、自定义对象，浅拷贝不够：你改内层，原对象也会变。

深拷贝不是免费的：它递归复制，可能很慢，也可能遇到不可复制对象。真实项目里，优先设计「不改输入」的函数，而不是到处 deepcopy。如果必须复制，先想清楚复制到哪一层，别用深拷贝掩盖逻辑问题。`,
          code: `import copy

a = [[1, 2], [3, 4]]
alias = a
shallow = a[:]
deep = copy.deepcopy(a)

alias[0][0] = 9
print("alias:", a)
print("shallow:", shallow)

shallow[1][0] = 8
print("a after shallow edit:", a)
print("deep:", deep)

deep[0][0] = 7
print("a after deep edit:", a)`,
          output: `alias: [[9, 2], [3, 4]]
shallow: [[9, 2], [3, 4]]
a after shallow edit: [[9, 2], [8, 4]]
deep: [[1, 2], [3, 4]]
a after deep edit: [[9, 2], [8, 4]]`,
          tip: `[[a[:]]] 和 [[a.copy()]] 只复制一层；嵌套结构要 [[copy.deepcopy()]] 或逐层复制。`
        },
        {
          h: "小任务：按平均分排序成绩表",
          p: `给一张成绩表 [[[name, python, math, english]]]，按平均分降序排列，同分按姓名升序。这个任务同时用到 [[sum]]、[[len]]、[[lambda]]、元组键和稳定排序。

不要先在原表里插入平均分再排序，除非你确实想保留这一列。可以先用 [[key]] 算平均分，排序后再格式化输出。[[key]] 会被调用多次吗？[[sort]] 对每个元素调用一次 [[key]]，但如果你在 [[key]] 里做复杂计算，仍要意识到成本。

输出时保留两位小数，姓名左对齐，平均分右对齐。最后检查：同分的人顺序是否符合姓名升序；原表是否被意外修改；空列表是否会崩。`,
          code: `rows = [
    ["林晓", 91, 84, 88],
    ["陈默", 76, 92, 80],
    ["周宁", 88, 79, 95],
]

def avg(row):
    return sum(row[1:]) / 3

rows.sort(key=lambda row: (-avg(row), row[0]))
for row in rows:
    print(f"{row[0]:<6}{avg(row):>7.2f}")`,
          output: `周宁    87.33
林晓    87.67
陈默    82.67`,
          tip: `[[row[1:]]] 取后三列，[[sum()]] 求和；[[key]] 里不要修改 [[row]]，排序键应该是纯函数。`
        }
      ],
      points: [
        "切片返回新列表，切片赋值修改原列表",
        "[[sort()]] 原地排序返回 [[None]]，[[sorted()]] 返回新列表",
        "排序稳定，同键元素保持原相对顺序",
        "元组键可以实现多键排序，负号可以实现数字降序",
        "[[[:]]] / [[copy()]] 是浅拷贝，嵌套对象仍共享",
        "[[deepcopy()]] 递归复制，成本和风险都更高"
      ],
      practice: "把 `avg(row)` 改成处理「缺考」为 `None` 的行：有 `None` 时平均分记为 0，并在输出里标记「缺考」。先写测试数据，再排序。"
    },
    {
      id: "ch3-3",
      title: "3.3 元组、解包与成绩记录",
      minutes: 40,
      lead: "元组经常被当成「不能改的列表」，但它更像一条记录：位置固定、字段含义固定、可以哈希。这一节讲清逗号、打包解包、元组作为字典键，以及 zip 如何把多列数据拼成记录。",
      source: "Introducing Python 3rd · Ch.6；Beginning Python 4th · Ch.3–4；Head First Python 3rd · Ch.2–3",
      sections: [
        {
          h: "元组是不可变序列，逗号才是关键",
          p: `元组用圆括号写，但真正决定它是元组的是逗号，不是括号。[[t = (1)]] 是整数，[[t = (1,)]] 才是单元素元组。空元组是 [[()]]。很多函数返回多个值时，本质上返回一个元组，只是括号被省略了。

元组不可变，所以不能 [[t[0] = 2]]，也没有 [[append]]、[[remove]]。但「不可变」只指元组自己的元素引用不变：如果元素是列表，列表内容仍可改。[[t = ([1], 2)]] 的 [[t[0].append(3)]] 是合法的，元组本身没变，里面的列表变了。

元组支持索引、切片、[[len]]、[[in]]、迭代，和列表类似。因为不可变，元组可哈希，可以作为字典键；列表不行。这个特性在需要「复合键」时非常有用，比如用 [[(年级, 班级)]] 做键。`,
          code: `print(type((1)))
print(type((1,)))
print(type(()))

t = ([1], 2)
t[0].append(3)
print(t)

print((1, 2) + (3,))
print((1, 2) * 2)
print(hash((1, 2)))`,
          output: `<class 'int'>
<class 'tuple'>
<class 'tuple'>
([1, 3], 2)
(1, 2, 3)
(1, 2, 1, 2)
3713081631934410656`,
          tip: `单元素元组必须写 [[(1,)]]；[[(1)]] 只是加了括号的整数。`
        },
        {
          h: "打包与解包：swap、rest、嵌套",
          p: `[[t = 1, 2, 3]] 是打包，把三个值装进元组。[[a, b, c = t]] 是解包，把元组拆成三个名字。两边元素个数必须一致，否则抛 [[ValueError]]。解包也适用于列表、字符串、任何可迭代对象。

最经典的用法是交换：[[a, b = b, a]]。右边先求值成一个元组，再解包给左边，不需要临时变量。带星号的解包 [[first, *rest = items]] 把第一个给 [[first]]，其余收集成列表；[[*init, last = items]] 把最后一个给 [[last]]。一个解包表达式里只能有一个星号。

嵌套解包也合法：[[(a, b), c = ((1, 2), 3)]]。这在处理 [[(key, value)]] 对时很常见。不要为了炫技写太深的嵌套，读代码的人会痛苦。`,
          code: `point = 3, 5
x, y = point
print(x, y)

a, b = 1, 2
a, b = b, a
print(a, b)

items = [1, 2, 3, 4]
first, *rest = items
print(first, rest)

*init, last = items
print(init, last)

for key, value in [("a", 1), ("b", 2)]:
    print(key, value)`,
          output: `3 5
2 1
1 [2, 3, 4]
[1, 2, 3] 4
a 1
b 2`,
          tip: `解包个数必须匹配；不确定剩余数量时用 [[*rest]]，不要硬写固定变量。`
        },
        {
          h: "元组作为记录与字典键",
          p: `一条成绩记录可以用元组表示：[[(“林晓”, 91, 84, 88)]]。位置就是字段：0 是姓名，1 是 Python，2 是数学，3 是英语。位置固定意味着可读性差，所以真实项目常用 [[NamedTuple]] 或 [[dataclass]] 给字段起名；但元组仍然是最轻量的记录。

元组可哈希，所以能做字典键。[[scores[(“林晓”, “Python”)] = 91]] 是合法的；用列表做键会抛 [[TypeError: unhashable type: 'list']]。复合键适合表达「多维坐标」，比如 [[(年级, 班级, 姓名)]]。

元组作为返回值也很常见：[[def min_max(items): return min(items), max(items)]]。调用方 [[low, high = min_max(data)]] 直接解包。返回元组比返回一个自定义对象轻，但字段一多就该考虑命名结构。`,
          code: `record = ("林晓", 91, 84, 88)
print(record[0], record[1:])

scores = {}
scores[("林晓", "Python")] = 91
scores[("陈默", "Python")] = 76
print(scores[("林晓", "Python")])

try:
    scores[["林晓"]] = 90
except TypeError as exc:
    print("TypeError:", exc)`,
          output: `林晓 (91, 84, 88)
91
TypeError: unhashable type: 'list'`,
          tip: `元组可哈希的前提是元素都可哈希；包含列表的元组仍然不能做字典键。`
        },
        {
          h: "zip 与多序列遍历",
          p: `[[zip(a, b)]] 把两个序列按位置配对，返回一个惰性迭代器，每次产出一个元组。它按最短序列停止，不会报长度不一致。要保留最长并用 [[None]] 补齐，用 [[itertools.zip_longest]]。

[[for name, score in zip(names, scores)]] 比用下标同时取两个列表清楚得多。要同时拿下标，[[enumerate(zip(names, scores))]] 或 [[zip(range(...), ...)]] 都可以。[[zip(*pairs)]] 还能把「成对数据」拆回两列，这是很实用的反向操作。

注意 [[zip]] 返回迭代器，只能消费一次。你 [[list(zip(...))]] 之后可以重复用；直接 [[for]] 两遍第二遍会空。这个「迭代器耗尽」问题在第 7 章会正式讲。`,
          code: `names = ["林晓", "陈默", "周宁"]
scores = [91, 76, 88]

for name, score in zip(names, scores):
    print(f"{name}: {score}")

pairs = list(zip(names, scores))
print(pairs)
print(list(zip(*pairs)))

short = zip(names, [1, 2])
print(list(short))`,
          output: `林晓: 91
陈默: 76
周宁: 88
[('林晓', 91), ('陈默', 76), ('周宁', 88)]
[('林晓', '陈默', '周宁'), (91, 76, 88)]
[('林晓', 1), ('陈默', 2)]`,
          tip: `[[zip]] 按最短序列停止；长度不一致时不要假设它报错。迭代器只能消费一次。`
        },
        {
          h: "小任务：用元组返回统计结果",
          p: `写一个 [[summarize(scores)]]，返回 [[(count, total, average, min, max)]]。这个返回值用元组，调用方可以一次解包，也可以按下标取。空列表要单独处理，平均分不能除以 0。

这个任务同时练三件事：元组打包、函数返回多值、边界处理。不要返回一个含义不清的列表；元组的位置顺序就是契约，写清楚文档字符串。若字段超过五个，考虑 [[NamedTuple]]，否则调用方很容易把顺序记错。

最后用 [[zip]] 把「姓名列表」和「统计结果列表」配对输出，确认每个学生的统计都对应正确。`,
          code: `def summarize(scores):
    if not scores:
        return (0, 0, 0.0, None, None)
    total = sum(scores)
    return (len(scores), total, total / len(scores), min(scores), max(scores))

stats = summarize([91, 84, 88])
count, total, avg, low, high = stats
print(count, total, f"{avg:.2f}", low, high)

empty = summarize([])
print(empty)`,
          output: `3 263 87.67 84 91
(0, 0, 0.0, None, None)`,
          tip: `返回元组时把顺序写进文档字符串；字段一多就用 [[NamedTuple]]，别让调用方猜位置。`
        }
      ],
      points: [
        "单元素元组必须带逗号，[[(1)]] 不是元组",
        "元组不可变，但内部可变元素仍可修改",
        "元组可哈希，可作为字典键；列表不行",
        "解包个数必须匹配，[[*rest]] 收集剩余元素",
        "[[zip]] 按最短序列停止，返回只能消费一次的迭代器",
        "多返回值本质是返回元组，字段顺序就是契约"
      ],
      practice: "用 `NamedTuple` 重写 `summarize()` 的返回值，让字段变成 `count/total/average/min/max`；再对比元组版本，写出各自适合的场景。"
    }
  ]
});

/* --- ch4.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch4",
  part: 1,
  number: "04",
  title: "字典、集合与查找",
  summary: "列表按位置存数据，字典按键存数据，集合只关心「在不在」。本章把三种容器的选择逻辑讲清楚：什么时候用字典建模，什么时候用集合去重，为什么键必须可哈希，以及嵌套字典为什么会在缺键时炸掉。",
  goals: [
    "能区分字典、列表和集合的适用场景",
    "能安全读取缺失键，不再被 KeyError 打断",
    "能用嵌套字典表达学生、班级和成绩",
    "能用集合运算做去重、交集和差集"
  ],
  lessons: [
    {
      id: "ch4-1",
      title: "4.1 字典的键值模型",
      minutes: 40,
      lead: "字典是 Python 里最重要的数据建模工具之一。它把「名字」映射到「值」，查找接近 O(1)。这一节先建立键值模型，再讲清楚键的限制、读取的两种方式、增删改的常用方法，以及为什么字典能保持插入顺序。",
      source: "Introducing Python 3rd · Ch.7；Beginning Python 4th · Ch.4；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "字典是键值映射，不是「带名字的列表」",
          p: `字典用花括号写：[[{"name": "林晓", "score": 91}]]。它不是「下标是字符串的列表」，而是一张哈希表：每个键通过哈希函数定位到槽位，值存在槽位里。查找、插入、删除平均是 O(1)，而列表按值查找是 O(n)。

键必须唯一。给同一个键重复赋值，后一次覆盖前一次；不会出现两个同名键。值可以是任意对象，包括列表、字典、函数。键和值的角色不能反：键是「标签」，值是被标签指向的内容。

Python 3.7 以后，字典保持插入顺序：你按什么顺序插入键，遍历时就按什么顺序返回。这个顺序是语言保证，不是实现巧合。需要按字母排序时，仍然要 [[sorted(d)]] 或 [[sorted(d.items())]]。`,
          code: `student = {"name": "林晓", "score": 91}
print(student["name"])
print(student.get("score"))
print(len(student))

student["score"] = 95
print(student)

for key in student:
    print(key, student[key])`,
          output: `林晓
91
2
{'name': '林晓', 'score': 95}
name 林晓
score 95`,
          tip: `字典保持插入顺序，但「插入顺序」不等于「排序」；要按字母/数字排序，显式 [[sorted()]]。`
        },
        {
          h: "键必须可哈希：字符串、数字、元组可以，列表不行",
          p: `字典的键必须是**可哈希**对象。可哈希意味着对象有一个稳定的哈希值，并且在相等比较时行为一致。字符串、整数、浮点数、布尔、元组（元素都可哈希）都可以；列表、字典、集合不可以，因为它们是可变的，哈希值会变。

[[{["name"]: "林晓"}]] 会抛 [[TypeError: unhashable type: 'list']]。如果你确实想用一组值做键，把它转成元组：[[{("林晓", "Python"): 91}]]。元组只要元素都可哈希，整体就可哈希。

浮点数做键要小心：[[0.1 + 0.2]] 和 [[0.3]] 不相等，哈希也不同；[[1]] 和 [[1.0]] 相等，哈希相同，所以它们会被视为同一个键。布尔是整数的子类，[[True]] 和 [[1]] 也会碰撞。业务上尽量避免用浮点和布尔做键。`,
          code: `d = {}
d["name"] = "林晓"
d[1] = "one"
d[(1, 2)] = "tuple key"
print(d)

try:
    d[["name"]] = "bad"
except TypeError as exc:
    print("TypeError:", exc)

print({1: "int", 1.0: "float", True: "bool"})`,
          output: `{'name': '林晓', 1: 'one', (1, 2): 'tuple key'}
TypeError: unhashable type: 'list'
{1: 'bool'}`,
          tip: `[[1]]、[[1.0]]、[[True]] 会被视为同一个键；需要区分布尔和整数时，不要拿它们做键。`
        },
        {
          h: "读取：[] 与 get 的差别，KeyError 怎么处理",
          p: `[[d[key]]] 在键不存在时抛 [[KeyError]]；[[d.get(key)]] 返回值 [[None]]，[[d.get(key, default)]] 返回你给的默认值。两者不是「一个安全一个不安全」，而是「你希望缺键时发生什么」：如果是程序错误，让 [[KeyError]] 暴露；如果是可选字段，用 [[get]]。

[[if key in d:]] 再取值是常见写法，但会做两次查找。更简洁的是 [[d.get(key, default)]]。注意默认值只在缺键时使用，不会写回字典；[[d.get("x", [])]] 每次都可能创建一个新列表，但不会保存。

[[setdefault(key, default)]] 不一样：键存在就返回旧值，键不存在就写入默认值并返回。它适合「第一次遇到就初始化」的场景，比如按班级收集学生。[[defaultdict(list)]] 是更彻底的版本，读取不存在的键会自动创建空列表。`,
          code: `d = {"name": "林晓"}
print(d.get("score"))
print(d.get("score", 0))

print(d.setdefault("score", 90))
print(d)

try:
    print(d["missing"])
except KeyError as exc:
    print("KeyError:", exc)`,
          output: `None
0
90
{'name': '林晓', 'score': 90}
KeyError: 'missing'`,
          tip: `[[get()]] 不会写入字典；[[setdefault()]] 会写入。需要「缺键就建」时用 [[setdefault]] 或 [[defaultdict]]。`
        },
        {
          h: "增改删：赋值、update、setdefault、pop",
          p: `新增或修改都用一个语法：[[d[key] = value]]。键存在就覆盖，不存在就插入。[[d.update(other)]] 把另一个字典的键值批量写进来，已存在的键被覆盖；它也可以接收 [[(key, value)]] 对的可迭代对象。

删除用 [[del d[key]]]、[[d.pop(key)]] 或 [[d.popitem()]]。[[pop(key, default)]] 在键不存在时返回默认值，不抛异常；[[popitem()]] 删除并返回最后一个插入的键值对（Python 3.7+ 是 LIFO 顺序）。[[clear()]] 清空。

不要把「删除一个键」和「把值设为 None」混为一谈。[[d[key] = None]] 仍然保留键，[[len(d)]] 不变；[[del d[key]]] 才真正移除。统计、序列化、缺省判断都会受这个差别影响。`,
          code: `d = {"a": 1, "b": 2}
d["c"] = 3
d.update({"b": 20, "d": 4})
print(d)

print(d.pop("d"))
print(d.pop("z", 0))
print(d)

del d["a"]
print(d)
print(d.popitem())
print(d)`,
          output: `{'a': 1, 'b': 20, 'c': 3, 'd': 4}
4
0
{'a': 1, 'b': 20, 'c': 3}
{'b': 20, 'c': 3}
('c', 3)
{'b': 20}`,
          tip: `[[d[key] = None]] 保留键；[[del d[key]]] 移除键。[[popitem()]] 删除的是最后插入的键，不是最大键。`
        },
        {
          h: "遍历：keys、values、items 与插入顺序",
          p: `直接 [[for key in d]] 遍历键；[[d.keys()]] 返回键视图，[[d.values()]] 返回值视图，[[d.items()]] 返回 [[(key, value)]] 对视图。视图是动态的：你改字典，视图内容跟着变；它不是一次性拷贝。

遍历时同时拿键和值，用 [[for key, value in d.items()]]。只拿值用 [[d.values()]]，但要拿对应的键还是得 [[items()]]。[[len(d)]] 是键值对数量，不是值的数量；值可以重复，键不能。

遍历时不要增删键。[[RuntimeError: dictionary changed size during iteration]] 就是在循环里插入或删除键的典型报错。要改，先收集要删的键，循环结束后再删；或者遍历 [[list(d.items())]] 的副本。`,
          code: `d = {"林晓": 91, "陈默": 76, "周宁": 88}

for key in d:
    print(key)

for name, score in d.items():
    print(name, score)

print(list(d.keys()))
print(list(d.values()))
print(sum(d.values()) / len(d))`,
          output: `林晓
陈默
周宁
林晓 91
陈默 76
周宁 88
['林晓', '陈默', '周宁']
[91, 76, 88]
85.0`,
          tip: `[[d.items()]] 是视图，不是列表；要保存快照用 [[list(d.items())]]。遍历时不要改字典大小。`
        }
      ],
      points: [
        "字典是哈希表，按键查找平均 O(1)",
        "键必须可哈希，列表/字典/集合不能做键",
        "[[1]]、[[1.0]]、[[True]] 会被视为同一个键",
        "[[get()]] 不写入，[[setdefault()]] 会写入",
        "[[d[key] = None]] 保留键，[[del]] 才移除",
        "字典保持插入顺序，但插入顺序不是排序"
      ],
      practice: "写一个 `count_words(text)`：用字典统计每个单词出现次数。先按空格切分，再统一小写，最后按次数降序输出前 5 个。"
    },
    {
      id: "ch4-2",
      title: "4.2 嵌套字典与数据建模",
      minutes: 45,
      lead: "真实数据很少是「一层键值对」。一个班级有多个学生，一个学生有多门成绩，成绩里还可能有缺考标记。这一节讲怎么用嵌套字典表达层级，怎么在缺键时不炸，以及 dict-of-dicts 和 list-of-dicts 该怎么选。",
      source: "Introducing Python 3rd · Ch.7；Beginning Python 4th · Ch.4；Head First Python 3rd · Ch.3–4",
      sections: [
        {
          h: "用字典表达一条学生记录",
          p: `一条学生记录可以写成 [[{"name": "林晓", "class": "A", "scores": {"python": 91, "math": 84}}]]。外层字典是记录，内层字典是科目到分数的映射。键是字段名，值可以是字符串、数字、列表、字典。

这种结构的优点是自描述：读代码的人看到 [["scores"]] 就知道里面是成绩，不需要记「第 2 个元素是数学」。缺点是字段名写错不会在赋值时报错，只会在读取时抛 [[KeyError]]；所以字段名最好集中定义，或者用 [[dataclass]] / [[TypedDict]] 做约束。

不要把所有东西都塞进一个巨大的嵌套字典。层级超过三层，访问路径变成 [["data"]["classes"]["A"]["students"][0]["scores"]["python"]]]，可读性会迅速下降。该用列表的地方用列表，该用对象的地方用对象。`,
          code: `student = {
    "name": "林晓",
    "class": "A",
    "scores": {"python": 91, "math": 84, "english": 88},
}

print(student["name"])
print(student["scores"]["python"])
print(student["scores"].get("science", "未选"))

student["scores"]["math"] = 90
print(student)`,
          output: `林晓
91
未选
{'name': '林晓', 'class': 'A', 'scores': {'python': 91, 'math': 90, 'english': 88}}`,
          tip: `嵌套字典访问链越长，越要提前检查中间层是否存在；不要假设每一层都一定有键。`
        },
        {
          h: "嵌套字典：dict of dicts 与 list of dicts",
          p: `表达「多个学生」有两种常见结构。第一种是 [[dict of dicts]]：外层键是学号或姓名，内层是记录。[[students["S01"]["name"]]] 查找快，适合按 ID 随机访问。第二种是 [[list of dicts]]：每个元素是一条记录，适合按顺序遍历、排序、输出表格。

选择标准是「你主要按什么访问」。按 ID 查一个人，用 dict of dicts；要按成绩排序、逐行打印，用 list of dicts。两者也能组合：列表保存顺序，字典做索引，但要注意两份数据同步更新，别改了一份忘了另一份。

dict of dicts 的遍历是 [[for sid, student in students.items()]]；list of dicts 的遍历是 [[for student in students]]。不要用 [[students[0]["name"]]] 去访问 dict of dicts，除非键恰好是 0。`,
          code: `students_by_id = {
    "S01": {"name": "林晓", "score": 91},
    "S02": {"name": "陈默", "score": 76},
}
print(students_by_id["S01"]["name"])

students = [
    {"id": "S01", "name": "林晓", "score": 91},
    {"id": "S02", "name": "陈默", "score": 76},
]
for student in sorted(students, key=lambda s: s["score"], reverse=True):
    print(student["name"], student["score"])`,
          output: `林晓
林晓 91
陈默 76`,
          tip: `按 ID 查用 dict of dicts，按顺序遍历/排序用 list of dicts；不要为了「统一」强行选一种。`
        },
        {
          h: "缺失键与 setdefault / defaultdict",
          p: `嵌套字典最常见的崩溃，是中途某一层不存在。[[data["classes"]["A"]["students"].append(...)]] 只要 [["A"]] 不存在，就抛 [[KeyError]]。可以用 [[setdefault]] 逐层建：[[data.setdefault("classes", {}).setdefault("A", {}).setdefault("students", []).append(x)]]，但这串太长，读起来费劲。

[[collections.defaultdict]] 更干净：[[defaultdict(list)]] 在缺键时自动创建空列表，[[defaultdict(dict)]] 自动创建空字典。注意它只处理「最外层」的缺键，嵌套的 [[defaultdict(dict)]] 里再缺键，仍需要内层也是 defaultdict 或手动初始化。

[[setdefault]] 适合一次性初始化，[[defaultdict]] 适合反复按同一模式分组。两者都会**写入**字典；如果你只是想读取缺省值而不改变原数据，用 [[get]]。`,
          code: `from collections import defaultdict

data = defaultdict(lambda: defaultdict(list))
data["A"]["林晓"].append(91)
data["A"]["陈默"].append(76)
data["B"]["周宁"].append(88)

print(dict(data["A"]))
print(data["C"])  # 自动创建空字典`,
          output: `{'林晓': [91], '陈默': [76]}
defaultdict(<class 'list'>, {})`,
          tip: `[[defaultdict]] 读取缺键会写入；只想读取不修改，用 [[get()]]。嵌套 defaultdict 要每层都设置工厂函数。`
        },
        {
          h: "合并、复制与浅拷贝",
          p: `两个字典合并，最直接是 [[d1.update(d2)]]，原地修改 [[d1]]，重复键由 [[d2]] 覆盖。Python 3.9 以后可以用 [[d1 | d2]] 返回新字典，[[d1 |= d2]] 原地更新。[[{**d1, **d2}]] 也是返回新字典的常用写法。

浅拷贝 [[d.copy()]] 只复制外层：内层字典仍然共享。[[copy.deepcopy()]] 才递归复制。合并嵌套字典时，[[d1.update(d2)]] 会把整个内层字典替换掉，而不是逐键合并；要逐键合并，需要手写循环或递归函数。

合并前先想清楚冲突策略：后值覆盖前值、保留前值、还是报错？不要默认「覆盖」是业务想要的。成绩表合并时，重复学号可能意味着数据错误，静默覆盖会丢记录。`,
          code: `d1 = {"a": 1, "nested": {"x": 1}}
d2 = {"b": 2, "nested": {"y": 2}}

merged = d1 | d2
print(merged)

merged["nested"]["x"] = 9
print("原 d1 内层也被改:", d1)

import copy
deep = copy.deepcopy(d1)
deep["nested"]["x"] = 7
print("深拷贝后 d1:", d1)`,
          output: `{'a': 1, 'nested': {'y': 2}, 'b': 2}
原 d1 内层也被改: {'a': 1, 'nested': {'x': 9}}
深拷贝后 d1: {'a': 1, 'nested': {'x': 9}}`,
          tip: `[[d1 | d2]] 是浅合并，嵌套字典会被整体替换；要递归合并得自己写函数。`
        },
        {
          h: "小任务：按班级统计成绩",
          p: `给一个 [[list of dicts]]，每条记录有 [["class"]]、[["name"]]、[["score"]]。要求输出每个班的平均分、最高分、人数，按平均分降序。这个任务练「分组」：用字典把班级映射到分数列表，再对每组做统计。

分组时用 [[setdefault]] 或 [[defaultdict(list)]]。不要用 [[if class in result]] 加 [[append]] 的两段式，虽然能跑，但重复代码多。统计完成后，把结果转成 [[list of dicts]] 再排序，输出更整齐。

边界要考虑：空班级、缺 [["score"]] 的记录、分数不是数字。入门阶段可以先假设数据干净，但要在注释里写清楚假设；真实项目里，假设就是 bug 的入口。`,
          code: `from collections import defaultdict

rows = [
    {"class": "A", "name": "林晓", "score": 91},
    {"class": "A", "name": "陈默", "score": 76},
    {"class": "B", "name": "周宁", "score": 88},
]

groups = defaultdict(list)
for row in rows:
    groups[row["class"]].append(row["score"])

summary = []
for klass, scores in groups.items():
    summary.append({
        "class": klass,
        "count": len(scores),
        "avg": sum(scores) / len(scores),
        "max": max(scores),
    })

summary.sort(key=lambda item: item["avg"], reverse=True)
for item in summary:
    print(item)`,
          output: `{'class': 'A', 'count': 2, 'avg': 83.5, 'max': 91}
{'class': 'B', 'count': 1, 'avg': 88.0, 'max': 88}`,
          tip: `分组用 [[defaultdict(list)]]；统计结果转成 dict 列表再排序，比在嵌套字典里直接排更清楚。`
        }
      ],
      points: [
        "字典适合自描述记录，但层级不要超过两三层",
        "按 ID 查用 dict of dicts，按顺序遍历用 list of dicts",
        "[[setdefault]] 和 [[defaultdict]] 都会写入缺键",
        "[[copy()]] 是浅拷贝，嵌套字典仍共享",
        "[[d1 | d2]] 是浅合并，重复键由右边覆盖",
        "分组统计用 [[defaultdict(list)]]，再转列表排序"
      ],
      practice: "把 `summary` 改成按「班级 + 是否及格」分组，输出每组的及格率；先想清楚分组键是元组还是拼接字符串，并说明理由。"
    },
    {
      id: "ch4-3",
      title: "4.3 集合、去重与集合运算",
      minutes: 40,
      lead: "集合只关心成员关系：在不在、有没有重复、两个集合的交集是什么。它用哈希表实现，成员判断平均 O(1)，比列表的 O(n) 快得多。这一节讲集合的创建、运算、可变性与可哈希边界。",
      source: "Introducing Python 3rd · Ch.7；Beginning Python 4th · Ch.4；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "集合是什么：去重与 O(1) 查找",
          p: `集合用花括号写：[[{1, 2, 3}]]。它无序、元素唯一、元素必须可哈希。你不能用下标访问，也不能切片；但可以 [[x in s]]、[[len(s)]]、迭代。集合的核心价值是成员判断和去重，不是「保存顺序」。

[[set([1, 2, 2, 3])]] 得到 [[{1, 2, 3}]]。[[set("hello")]] 得到字符集合 [[{'h', 'e', 'l', 'o'}]]，重复的 l 被去掉。把列表转成集合再去重，是最常用的技巧；但集合不保证顺序，转回列表后顺序可能变。

集合的哈希实现意味着查找快，但元素必须可哈希。列表不能放进集合；元组可以（元素都可哈希）。集合本身可变，所以不能放进另一个集合；需要嵌套时用 [[frozenset]]。`,
          code: `s = {1, 2, 2, 3}
print(s)
print(len(s))
print(2 in s)

chars = set("hello")
print(chars)

try:
    {[1, 2]}
except TypeError as exc:
    print("TypeError:", exc)`,
          output: `{1, 2, 3}
3
True
{'h', 'e', 'l', 'o'}
TypeError: unhashable type: 'list'`,
          tip: `集合无序，不要依赖输出顺序；需要顺序去重时，用 [[dict.fromkeys(items)]] 再转列表。`
        },
        {
          h: "创建集合与空集合的坑",
          p: `空集合必须写 [[set()]]，不能写 [[{}]]。[[{}]] 是空字典，不是空集合。这是 Python 里最经典的「看起来一样、类型不同」之一。单元素集合写 [[{1}]]，不是 [[{1,}]]（虽然合法，但没必要）。

集合推导式写 [[{x for x in items}]]，和列表推导式类似，但结果去重且无序。不要用 [[set()]] 包一个生成器再转列表，除非你确实需要去重；那会丢掉顺序。

从字符串创建集合会拆成字符，从字典创建集合会取键。[[set({"a": 1})]] 得到 [[{'a'}]]，不是键值对。想取字典的值，用 [[set(d.values())]]。`,
          code: `print(type({}))
print(type(set()))
print({1})
print({x for x in [1, 2, 2, 3]})

print(set({"a": 1, "b": 2}))
print(set({"a": 1, "b": 2}.values()))`,
          output: `<class 'dict'>
<class 'set'>
{1}
{1, 2, 3}
{'a', 'b'}
{1, 2}`,
          tip: `[[{}]] 是空字典，空集合只能 [[set()]]；字典转集合默认取键。`
        },
        {
          h: "集合运算：并、交、差、对称差",
          p: `集合支持四种基本运算：并集 [[a | b]] 或 [[a.union(b)]]，交集 [[a & b]] 或 [[a.intersection(b)]]，差集 [[a - b]] 或 [[a.difference(b)]]，对称差 [[a ^ b]] 或 [[a.symmetric_difference(b)]]。运算符返回新集合，方法也返回新集合；对应的 [[update]] 系列才原地修改。

差集有方向：[[a - b]] 是「在 a 不在 b」，[[b - a]] 是反过来。对称差是「只在其中一个集合里」，等价于 [[(a - b) | (b - a)]]。交集适合找共同选课，差集适合找「选了 A 没选 B」的学生。

子集和超集用 [[a <= b]]、[[a < b]]、[[a >= b]]、[[a > b]]，或者 [[issubset]] / [[issuperset]]。注意 [[<=]] 在这里不是数值比较，而是包含关系。`,
          code: `a = {"林晓", "陈默", "周宁"}
b = {"陈默", "周宁", "赵一"}

print(a | b)
print(a & b)
print(a - b)
print(b - a)
print(a ^ b)
print({"陈默"} <= a)`,
          output: `{'林晓', '陈默', '周宁', '赵一'}
{'陈默', '周宁'}
{'林晓'}
{'赵一'}
{'林晓', '赵一'}
True`,
          tip: `差集有方向；[[a - b]] 和 [[b - a]] 完全不同。[[<=]] 在集合里表示子集，不是小于等于。`
        },
        {
          h: "可变集合、不可变集合与可哈希",
          p: `[[set]] 可变，支持 [[add]]、[[remove]]、[[discard]]、[[update]]、[[clear]]。[[remove(x)]] 在元素不存在时抛 [[KeyError]]；[[discard(x)]] 不抛。[[pop()]] 随机删除一个元素并返回，因为集合无序，不要假设它会删哪个。

[[frozenset]] 是不可变集合，创建后不能改，因此可哈希，可以放进另一个集合，也可以做字典键。[[frozenset([1, 2])]] 是合法键；[[set([1, 2])]] 不行。需要「集合的集合」时，用 frozenset。

集合元素必须可哈希，所以集合里不能放列表、字典、可变集合。你可以把列表转成元组再放进去：[[{(1, 2), (3, 4)}]]。但元组里的元素也必须可哈希；包含列表的元组仍然不行。`,
          code: `s = {1, 2}
s.add(3)
s.discard(9)
print(s)

fs = frozenset([1, 2])
print(fs)
print({fs, frozenset([3])})

try:
    {[1, 2]}
except TypeError as exc:
    print("TypeError:", exc)`,
          output: `{1, 2, 3}
frozenset({1, 2})
{frozenset({1, 2}), frozenset({3})}
TypeError: unhashable type: 'list'`,
          tip: `[[set.remove()]] 缺元素会抛 [[KeyError]]；[[discard()]] 不会。要嵌套集合用 [[frozenset]]。`
        },
        {
          h: "小任务：标签去重与共同选课",
          p: `给两个学生的选课列表，求共同课程、只属于第一个人的课程、只属于第二个人的课程。先把列表转成集合，再做交、差、对称差。输出时排序，保证结果稳定。

这个任务也适合练「去重但保留顺序」：如果用户希望按选课顺序展示，不要直接把集合转列表，改用 [[dict.fromkeys(courses)]]；它利用字典键唯一且保持插入顺序。

最后检查：空列表、重复课程、大小写不一致。课程名最好先 [[strip().lower()]] 统一，再做集合运算；否则 [["Math"]] 和 [["math"]] 会被当成两门课。`,
          code: `alice = ["Python", "Math", "English", "Math"]
bob = ["math", "English", "Art"]

a = {course.strip().lower() for course in alice}
b = {course.strip().lower() for course in bob}

print("共同:", sorted(a & b))
print("仅 Alice:", sorted(a - b))
print("仅 Bob:", sorted(b - a))

ordered = list(dict.fromkeys(course.strip().lower() for course in alice))
print("按原顺序去重:", ordered)`,
          output: `共同: ['english', 'math']
仅 Alice: ['python']
仅 Bob: ['art']
按原顺序去重: ['python', 'math', 'english']`,
          tip: `集合运算前先统一大小写和空白；要保留原顺序去重，用 [[dict.fromkeys()]]，不要用 [[set]]。`
        }
      ],
      points: [
        "集合无序、元素唯一、元素必须可哈希",
        "空集合是 [[set()]]，[[{}]] 是空字典",
        "集合成员判断平均 O(1)，列表是 O(n)",
        "并/交/差/对称差用 [[| & - ^]]，差集有方向",
        "[[set.remove()]] 缺元素抛 [[KeyError]]，[[discard()]] 不抛",
        "嵌套集合用 [[frozenset]]；列表不能做集合元素"
      ],
      practice: "写一个 `common_courses(a, b)`，返回共同课程和只属于一方的课程；要求输出排序，并处理大小写与前后空格。"
    }
  ]
});

/* --- ch5.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch5",
  part: 1,
  number: "05",
  title: "条件、循环与模式匹配",
  summary: "程序开始有分支和重复。本章把 if/elif/else 的真值规则、for/while 的迭代模型、break/continue/else 的控制流讲透，再用 match 展示 Python 3.10 的结构化模式匹配。最后一节会明确说明：练习室仍是 3.8 判题，match 只做只读演示。",
  goals: [
    "能解释 Python 的真值规则与短路求值",
    "能写出边界正确的 if/elif/else 分支",
    "能用 for/while、enumerate、zip 处理批量数据",
    "能读懂 match 的字面量、序列、映射和守卫模式"
  ],
  lessons: [
    {
      id: "ch5-1",
      title: "5.1 if/elif/else 与真值",
      minutes: 40,
      lead: "条件语句看起来最简单，却最容易在边界上出错：90 分到底算 A 还是 B，空列表算不算「有数据」，None 和 False 有什么区别。这一节先把真值规则和分支顺序钉死。",
      source: "Introducing Python 3rd · Ch.8；Beginning Python 4th · Ch.5；Head First Python 3rd · Ch.2",
      sections: [
        {
          h: "条件不是「对错」，是「真值」",
          p: `[[if]] 后面不要求布尔值，任何对象都可以被解释成真或假。Python 的真值规则是：[[None]]、[[False]]、数字 0、空字符串、空列表、空元组、空字典、空集合为假；其他对象一般为真。这就是为什么 [[if items:]] 可以判断列表非空，[[if name:]] 可以判断字符串非空。

这个规则很方便，也很危险。[[if score:]] 在 [[score = 0]] 时为假，但 0 分是一个合法成绩，不是「没有成绩」。如果你要判断「有没有传分数」，应该用 [[if score is not None:]]，而不是 [[if score:]]。空容器和零值在业务上可能完全合法，不要用真值测试代替「是否存在」。

[[bool(x)]] 可以显式转换真值，但大多数时候不需要。真正需要的是想清楚：这个变量可能取哪些值？[[None]] 表示缺失，0 表示零分，[[""]] 表示空字符串，它们的语义不同，判断方式也应该不同。`,
          code: `values = [None, False, 0, "", [], {}, set(), "0", [0]]
for value in values:
    print(repr(value), bool(value))`,
          output: `None False
False False
0 False
'' False
[] False
{} False
set() False
'0' True
[0] True`,
          tip: `0、空字符串、空列表都是合法数据，不要用 [[if x:]] 判断「是否存在」；用 [[is None]] 或显式比较。`
        },
        {
          h: "if/elif/else 与互斥分支",
          p: `[[if]] / [[elif]] / [[else]] 从上到下依次判断，命中第一个真条件后，后面的分支全部跳过。这个「互斥」很重要：如果你把 [[>= 90]] 写在 [[>= 80]] 后面，90 分永远进不了 A 分支，因为先被 B 分支截住。

分支顺序应该从最严格到最宽松，或者用独立的 [[if]] 而不是 [[elif]]。[[elif]] 表示「否则如果」，[[if]] 表示「另外再判断一次」。两个独立的 [[if]] 可能同时执行，适合「同时满足多个标签」的场景；[[elif]] 只执行一个，适合等级、状态这类互斥分类。

[[else]] 不是必须的，但每个 [[else]] 都应该有明确语义。不要写 [[else: pass]] 来「占位」，那会让读者以为还有未处理的逻辑。如果确实什么都不做，写注释说明为什么。`,
          code: `def level(score):
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 60:
        return "C"
    else:
        return "D"

for score in [95, 90, 89, 80, 59, 0]:
    print(score, level(score))`,
          output: `95 A
90 A
89 B
80 B
59 D
0 D`,
          tip: `[[elif]] 的命中是互斥的；顺序写反会让宽条件吞掉窄条件。等级边界要写测试用例。`
        },
        {
          h: "真值表：空容器、0、None、False",
          p: `很多「为什么没进 if」的问题，根源是把「空」和「不存在」混为一谈。[[None]] 是缺失值；[[False]] 是布尔假；[[0]] 是数值零；[[""]] 是空文本；[[]] 是空列表。它们在 [[bool()]] 下都为假，但业务含义不同。

判断缺失用 [[x is None]]；判断空列表用 [[not items]] 或 [[len(items) == 0]]；判断零分用 [[score == 0]]；判断空字符串用 [[text == ""]] 或 [[not text.strip()]]。不要用一个 [[if not x]] 包打天下，除非你确实接受所有这些值等价。

[[is None]] 比 [[== None]] 更准确，因为 [[==]] 可能被自定义对象重载；[[None]] 是单例，[[is]] 比较身份。PEP 8 也明确建议用 [[is None]]。`,
          code: `def describe(value):
    if value is None:
        return "缺失"
    if value == 0:
        return "零值"
    if value == "":
        return "空字符串"
    if isinstance(value, list) and not value:
        return "空列表"
    return "有内容"

for value in [None, 0, "", [], [0], "0"]:
    print(repr(value), describe(value))`,
          output: `None 缺失
0 零值
'' 空字符串
[] 空列表
[0] 有内容
'0' 有内容`,
          tip: `[[x == None]] 可能被重载；判断缺失统一用 [[x is None]]。`
        },
        {
          h: "布尔运算 and/or/not 与短路",
          p: `[[and]] 返回的不是 [[True]] / [[False]]，而是第一个决定结果的操作数。[[0 and "x"]] 返回 [[0]]，[["" or "default"]] 返回 [["default"]]。这个行为常被用来写默认值：[[name = input_name or "匿名"]]。但要注意，如果 [[input_name]] 是 [[0]] 或 [[""]]，也会被替换掉。

[[or]] 短路：左边为真就返回左边，不计算右边；[[and]] 短路：左边为假就返回左边，不计算右边。短路可以用来保护可能出错的操作：[[if items and items[0] == "x":]]，如果 [[items]] 为空，[[items[0]]] 不会执行。

不要用 [[and]] / [[or]] 写复杂业务分支，可读性会迅速下降。[[a and b or c]] 在 [[b]] 为假时会返回 [[c]]，和「a 为真则 b，否则 c」并不等价。需要条件表达式时用 [[b if a else c]]，意图更清楚。`,
          code: `print(0 and "x")
print("" or "default")
print("name" or "default")
print(None or 0 or "fallback")

items = []
print(items and items[0] == "x")
print(bool(items and items[0] == "x"))

a, b, c = True, 0, "c"
print(a and b or c)
print(b if a else c)`,
          output: `0
default
name
fallback
[]
False
c
0`,
          tip: `[[and]] / [[or]] 返回操作数本身，不是布尔值；默认值写法要小心 0 和空字符串。`
        },
        {
          h: "小任务：成绩等级与边界",
          p: `写一个 [[grade(score)]]：90–100 为 A，80–89 为 B，60–79 为 C，0–59 为 D；分数必须是 0–100 的数字，否则抛 [[ValueError]]。这个任务练「边界 + 类型 + 分支顺序」。

先把边界写成测试表：-1、0、59、60、79、80、89、90、100、101。每个边界都跑一遍，确认没有裂缝。不要只测 95 和 55 这种「典型值」，边界才是 bug 的藏身处。

类型检查也要做。[[grade("90")]] 应该报错还是自动转换？如果这是外部输入，可以在入口处转换；如果这是内部函数，让它对类型严格，避免「字符串比较」这种隐蔽错误。[[isinstance(score, (int, float))]] 且排除 [[bool]]，因为 [[True]] 会被当成 1。`,
          code: `def grade(score):
    if isinstance(score, bool) or not isinstance(score, (int, float)):
        raise TypeError("score 必须是数字")
    if not 0 <= score <= 100:
        raise ValueError("score 必须在 0–100")
    if score >= 90:
        return "A"
    if score >= 80:
        return "B"
    if score >= 60:
        return "C"
    return "D"

for score in [-1, 0, 59, 60, 79, 80, 89, 90, 100, 101]:
    try:
        print(score, grade(score))
    except ValueError as exc:
        print(score, "ValueError:", exc)`,
          output: `-1 ValueError: score 必须在 0–100
0 D
59 D
60 C
79 C
80 B
89 B
90 A
100 A
101 ValueError: score 必须在 0–100`,
          tip: `[[bool]] 是 [[int]] 的子类；类型检查数字时要排除 [[True]] / [[False]]。边界测试从 -1 到 101。`
        }
      ],
      points: [
        "[[None]]、[[False]]、0、空容器为假，但业务含义不同",
        "[[elif]] 命中后跳过后续分支，顺序要从窄到宽",
        "判断缺失用 [[is None]]，不要用 [[== None]]",
        "[[and]] / [[or]] 返回操作数本身，且有短路",
        "[[a and b or c]] 不等于条件表达式 [[b if a else c]]",
        "[[bool]] 是 [[int]] 子类，数字类型检查要排除布尔"
      ],
      practice: "把 `grade()` 改成支持 0.5 分粒度，并增加「缺考」用 `None` 表示；写出 -1、0、59.5、60、100、101、None 的测试表。"
    },
    {
      id: "ch5-2",
      title: "5.2 for/while、enumerate、zip、break/continue",
      minutes: 45,
      lead: "循环不是「把代码重复 n 次」，而是「对一个可迭代对象逐个处理」。理解迭代协议，你才会明白 for 为什么能遍历文件、字典、生成器；理解 break/continue/else，你才能写出不靠标志变量的控制流。",
      source: "Introducing Python 3rd · Ch.8；Beginning Python 4th · Ch.5–6；Head First Python 3rd · Ch.2–4",
      sections: [
        {
          h: "for 是迭代，不是计数",
          p: `Python 的 [[for item in iterable]] 不是 C 的 [[for i = 0; i < n; i++]]。它调用 [[iter(iterable)]] 得到迭代器，然后反复 [[next()]]，直到 [[StopIteration]]。列表、字符串、字典、文件、生成器都实现这套协议，所以都能被 [[for]] 遍历。

这意味着 [[for]] 不关心「长度」，只关心「还有没有下一个」。你可以在遍历中处理无限序列（配合 [[break]]），也可以遍历一个边读边产生数据的生成器。文件对象就是典型：[[for line in fh]] 一次读一行，不会把整个文件装进内存。

[[range()]] 只是众多可迭代对象之一，用来产生整数序列。它不是列表，[[range(1000000)]] 不占一百万个整数内存。需要列表才 [[list(range(...))]]；只是循环就直接用。`,
          code: `for ch in "abc":
    print(ch)

for key in {"a": 1, "b": 2}:
    print(key)

for i in range(3):
    print(i)

print(range(3))
print(list(range(3)))`,
          output: `a
b
c
a
b
0
1
2
range(0, 3)
[0, 1, 2]`,
          tip: `[[for]] 遍历的是迭代器，不是下标；遍历字典默认拿键，不是键值对。`
        },
        {
          h: "range 的三种形态与边界",
          p: `[[range(stop)]] 从 0 到 stop-1；[[range(start, stop)]] 从 start 到 stop-1；[[range(start, stop, step)]] 按步长走。和切片一样，stop 不包含。[[range(5)]] 是 0、1、2、3、4，不是 1–5。

步长可以为负：[[range(5, 0, -1)]] 得到 5、4、3、2、1。起点和终点的方向要匹配，否则得到空序列，不报错。[[range(0, 5, -1)]] 是空的，因为从 0 往负方向走永远到不了 5。

[[range]] 支持 [[len()]]、索引、切片，但切片返回新的 range 对象，不是列表。[[range(0, 10, 2)[1:3]]] 仍然是 range。需要具体值再 [[list()]]。`,
          code: `print(list(range(5)))
print(list(range(2, 6)))
print(list(range(0, 10, 3)))
print(list(range(5, 0, -1)))
print(list(range(0, 5, -1)))

print(len(range(0, 10, 2)))
print(range(0, 10, 2)[1:3])
print(list(range(0, 10, 2)[1:3]))`,
          output: `[0, 1, 2, 3, 4]
[2, 3, 4, 5]
[0, 3, 6, 9]
[5, 4, 3, 2, 1]
[]
5
range(2, 6, 2)
[2, 4]`,
          tip: `[[range]] 的 stop 不包含；步长方向和起点/终点不匹配时返回空序列，不报错。`
        },
        {
          h: "while 与退出条件；break/continue/else",
          p: `[[while condition:]] 在条件为真时反复执行。它适合「不知道要循环多少次，只知道什么时候停」的场景：读文件直到空行、猜数字直到猜中、重试直到成功。关键是确保条件最终会变假，否则就是死循环。

[[break]] 立即跳出整个循环；[[continue]] 跳过本次剩余代码，进入下一次迭代。[[for]] / [[while]] 还可以带 [[else]]：如果循环正常结束（没有被 [[break]] 打断），[[else]] 执行；如果被 [[break]] 打断，[[else]] 不执行。这个语法不直观，但能省掉「found 标志变量」。

不要滥用 [[break]]。一个循环里多个 [[break]]、多层嵌套，控制流会变得难以追踪。能用一个清晰的退出条件表达，就优先用条件；确实需要「找到就停」，再用 [[break]]。`,
          code: `for n in [2, 3, 4, 5, 6]:
    for d in range(2, n):
        if n % d == 0:
            print(n, "不是素数，因子", d)
            break
    else:
        print(n, "是素数")

i = 0
while i < 5:
    i += 1
    if i == 2:
        continue
    print(i)`,
          output: `2 是素数
3 是素数
4 不是素数，因子 2
5 是素数
6 不是素数，因子 2
1
3
4
5`,
          tip: `循环 [[else]] 只在「没有 break」时执行；[[continue]] 不影响 else。`
        },
        {
          h: "enumerate、zip 与并行遍历",
          p: `[[enumerate(items, start=1)]] 在遍历时同时给下标和元素，返回 [[(index, item)]] 元组。它比 [[range(len(items))]] 更安全，也更清楚。需要从 1 开始编号时传 [[start=1]]，不要手动 [[i + 1]]。

[[zip(a, b)]] 把多个序列按位置配对，按最短停止。它适合「姓名列表 + 分数列表」这种并行数据。[[zip]] 返回迭代器，只能消费一次；要在循环后继续用，先 [[list()]] 保存。

[[enumerate(zip(a, b))]] 可以同时拿下标和配对；[[zip(*pairs)]] 可以把配对拆回多列。不要为了「优雅」把三个以上序列塞进一个 [[zip]]，读起来会累；必要时先组合成记录。`,
          code: `names = ["林晓", "陈默", "周宁"]
scores = [91, 76, 88]

for i, (name, score) in enumerate(zip(names, scores), start=1):
    print(i, name, score)

pairs = list(zip(names, scores))
print(pairs)
print(list(zip(*pairs))[0])`,
          output: `1 林晓 91
2 陈默 76
3 周宁 88
[('林晓', 91), ('陈默', 76), ('周宁', 88)]
('林晓', '陈默', '周宁')`,
          tip: `[[zip]] 按最短序列停止；[[enumerate]] 的 start 只影响编号，不影响数据。`
        },
        {
          h: "小任务：找第一个不及格与跳过空行",
          p: `读一份成绩文本，跳过空行和注释行，找到第一个不及格（< 60）的学生。如果找到，打印姓名和分数并 [[break]]；如果整份文件都没有，打印「全部及格」。这个任务练 [[for]]、[[continue]]、[[break]] 和 [[else]]。

解析每一行时，字段数量、数字转换都可能出错。先写一个 [[parse_line()]]，在循环里捕获 [[ValueError]] 并带上行号；不要因为一行坏数据就让整个程序崩掉，除非你决定「坏数据必须停止」。

「找到第一个」意味着一旦命中就停止，不要继续读完整个文件。[[break]] 在这里是正确工具；用标志变量 [[found = True]] 再在循环条件里判断，反而更绕。`,
          code: `rows = [
    "林晓,91",
    "",
    "# 注释",
    "陈默,52",
    "周宁,88",
]

found = False
for line_no, line in enumerate(rows, start=1):
    line = line.strip()
    if not line or line.startswith("#"):
        continue
    name, score_text = [part.strip() for part in line.split(",")]
    score = int(score_text)
    if score < 60:
        print(f"第一个不及格: {name} ({score})，第 {line_no} 行")
        found = True
        break
else:
    print("全部及格")

print("found =", found)`,
          output: `第一个不及格: 陈默 (52)，第 4 行
found = True`,
          tip: `[[for...else]] 在「没有 break」时执行；如果用了 else，就不需要再写 found 标志。`
        }
      ],
      points: [
        "[[for]] 基于迭代协议，不是计数循环",
        "[[range]] 的 stop 不包含，步长方向不对会得到空序列",
        "[[break]] 跳出整个循环，[[continue]] 只跳过本次",
        "循环 [[else]] 只在没有 [[break]] 时执行",
        "[[enumerate]] 同时给下标和元素，[[zip]] 按最短停止",
        "[[zip]] 返回迭代器，只能消费一次"
      ],
      practice: "把「找第一个不及格」改成「找所有不及格并统计人数」，比较 `break` 版和完整遍历版的控制流差异；再写一个测试，确认空文件会输出「全部及格」。"
    },
    {
      id: "ch5-3",
      title: "5.3 match 模式匹配（现代语法演示）",
      minutes: 35,
      lead: "match 是 Python 3.10 引入的结构化模式匹配，不是 C/Java 的 switch。它按「形状」匹配数据，能把序列、字典、对象拆开并绑定名字。本节只做只读演示：站内练习室仍是 Python 3.8 判题，不要把 match 提交进去。",
      source: "Introducing Python 3rd · Ch.8；Beginning Python 4th · Ch.5",
      sections: [
        {
          h: "match 是什么：结构匹配，不是 switch",
          p: `[[match subject:]] 后面跟若干 [[case pattern:]]。它从上到下尝试匹配，命中第一个后执行对应分支，不会像 C 的 switch 那样「穿透」。和 [[if/elif]] 相比，match 的强项不是「值等于几」，而是「数据长什么形状」：是不是三个元素、字典里有没有某个键、对象是不是某个类。

最简单的字面量匹配：[[case 200:]]、[[case "GET":]]。这看起来像 switch，但 match 还支持序列模式 [[case [x, y]:]]、映射模式 [[case {"name": name}:]]、类模式 [[case Point(x=0, y=0):]]、或模式 [[case 1 | 2:]]、守卫 [[case n if n > 0:]]。

match 不是「必须用」的新语法。简单的二分支用 [[if]] 更清楚；只有当你确实在拆结构、并且拆完还要绑定变量时，match 才值得。不要为了显得现代，把所有 if 改写成 match。`,
          code: `def http_status(code):
    match code:
        case 200:
            return "OK"
        case 404:
            return "Not Found"
        case 500:
            return "Server Error"
        case _:
            return "Unknown"

for code in [200, 404, 500, 418]:
    print(code, http_status(code))`,
          output: `200 OK
404 Not Found
500 Server Error
418 Unknown`,
          tip: `[[case _]] 是通配符，必须放最后；match 命中一个分支就结束，不会穿透。`
        },
        {
          h: "字面量、捕获与通配符",
          p: `模式里的普通名字是**捕获变量**，不是常量。[[case score:]] 会匹配任何值，并把 [[subject]] 绑定到 [[score]]；[[case _:]] 也是匹配任何值，但不绑定。要匹配「名字叫 score 的常量」，必须用点号限定，比如 [[case Color.RED:]] 或 [[case module.CONST:]]。

[[case 0:]] 只匹配 0；[[case 0 | 1:]] 匹配 0 或 1；[[case -1:]] 匹配 -1。[[case True:]] 和 [[case 1:]] 在 Python 里会视为同一个值，因为 [[True == 1]]；需要区分布尔时用 [[case True]] 放在 [[case 1]] 前面，或改用类型判断。

捕获变量会在分支内生效，但不会泄漏到分支外。每个 case 的绑定是独立的；不要指望在 case A 里绑定的名字能在 case B 里用。分支内的变量名也要避免和外部变量重名，否则容易误读。`,
          code: `def classify(value):
    match value:
        case 0:
            return "零"
        case 1:
            return "一"
        case score:
            return f"其他数字: {score}"

for value in [0, 1, 2, 99]:
    print(classify(value))`,
          output: `零
一
其他数字: 2
其他数字: 99`,
          tip: `[[case score:]] 是捕获，不是比较；常量匹配要用字面量或点号限定名。`
        },
        {
          h: "序列/映射/类模式",
          p: `序列模式按位置拆：[[case [name, score]:]] 要求正好两个元素；[[case [first, *rest]:]] 捕获第一个和剩余；[[case (x, y):]] 和列表模式等价。字符串、元组、列表都能匹配序列模式，但模式里的 [[[]]] 只匹配列表，[[]] 不匹配元组。

映射模式按键拆：[[case {"name": name, "score": score}:]] 只要求字典里包含这些键，不要求只有这些键；多余的键会被忽略。[[case {"name": name, **rest}:]] 把剩余键收进 [[rest]]。这让 match 很适合处理 JSON 形状的数据。

类模式按属性拆：[[case Point(x=0, y=0):]] 要求对象是 [[Point]] 实例，并且 [[x]]、[[y]] 属性匹配。它调用 [[isinstance]] 和属性访问，不调用 [[__eq__]]。类模式适合事件、AST、领域对象，不适合普通字典。`,
          code: `def describe(data):
    match data:
        case [name, score]:
            return f"一对: {name}={score}"
        case [first, *rest]:
            return f"首项 {first}，其余 {len(rest)} 项"
        case {"name": name, "score": score}:
            return f"记录: {name}={score}"
        case _:
            return "未知"

print(describe(["林晓", 91]))
print(describe([1, 2, 3, 4]))
print(describe({"name": "陈默", "score": 76, "class": "A"}))`,
          output: `一对: 林晓=91
首项 1，其余 3 项
记录: 陈默=76`,
          tip: `映射模式只检查指定键存在，多余键不影响匹配；序列模式区分列表和元组。`
        },
        {
          h: "守卫与绑定：case 后面的 if",
          p: `[[case pattern if condition:]] 是守卫。先匹配模式，再判断条件；条件为假就继续尝试下一个 case。守卫里可以使用模式绑定的变量。比如 [[case [name, score] if score >= 90:]] 只匹配高分记录。

守卫让 match 能表达「形状 + 业务条件」，但也容易写得太复杂。守卫里不要做副作用，不要修改被匹配的对象；它应该是一个纯判断。复杂逻辑抽成函数，case 里只调用函数。

绑定变量在守卫里可见，但在 case 体里也可见。注意不要在守卫里引用未绑定的名字；模式匹配失败时，绑定不会发生。多个 case 可以复用同一个变量名，它们的作用域是各自分支。`,
          code: `def label(record):
    match record:
        case [name, score] if score >= 90:
            return f"{name}: 优秀"
        case [name, score] if score >= 60:
            return f"{name}: 及格"
        case [name, score]:
            return f"{name}: 不及格"
        case _:
            return "格式不对"

for record in [["林晓", 91], ["陈默", 76], ["周宁", 52], "bad"]:
    print(label(record))`,
          output: `林晓: 优秀
陈默: 及格
周宁: 不及格
格式不对`,
          tip: `守卫在模式匹配成功后执行；守卫为假会继续尝试下一个 case，不会直接落到 [[case _]]。`
        },
        {
          h: "现实边界：3.10+ 与练习室 3.8",
          p: `match 需要 Python 3.10 或更高。站内 Python 改错练习室使用 Judge0 的 Python 3.8 兼容环境，工具栏也明确写着「Python 3.8 兼容」。这意味着你可以在本地 3.10+ 跑本节代码，但不要把 [[match]] 提交到练习室，否则会得到 [[SyntaxError]]。

这不是「练习室落后」一句话就完事。判题环境的版本决定了可用的语法集合：海象运算符 [[:=]] 需要 3.8，[[match]] 需要 3.10，异常组 [[except*]] 需要 3.11。写跨版本代码时，先确认目标解释器，再选语法。

如果你要在课程项目里用 match，可以做版本分支：[[sys.version_info >= (3, 10)]] 时走 match，否则走 if/elif。但更简单的做法是：基础课程先用 if/elif，match 作为「读懂现代代码」的补充，不进入自动判题。`,
          code: `import sys

print(sys.version_info[:2])
print(sys.version_info >= (3, 10))

# 下面这段只在 3.10+ 能解析；3.8 会 SyntaxError
# match 200:
#     case 200:
#         print("OK")`,
          output: `(3, 13)
True`,
          tip: `[[match]] 是 3.10+ 语法；练习室 3.8 判题不要提交。版本判断用 [[sys.version_info]]，不要比较字符串。`
        }
      ],
      points: [
        "match 是结构化模式匹配，不是 switch",
        "命中第一个 case 就结束，不会穿透",
        "[[case score:]] 是捕获变量，不是常量比较",
        "序列模式按位置拆，映射模式按键拆，类模式按属性拆",
        "守卫 [[case ... if cond:]] 在模式匹配成功后判断",
        "[[match]] 需要 Python 3.10+，练习室 3.8 只做只读演示"
      ],
      practice: "把第 5.1 的 `grade()` 用 match 重写一遍（本地 3.10+ 运行），再写一段注释说明为什么练习室不能提交这段代码。"
    }
  ]
});

/* --- ch6.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch6",
  part: 1,
  number: "06",
  title: "函数、参数与作用域",
  summary: "函数不是「把代码包起来」，而是把输入、输出、作用域和复用边界定义清楚。本章从参数传递讲到 LEGB、闭包和 lambda，再用递归与二分查找把「函数调用栈」变成能看见的东西。",
  goals: [
    "能写出参数清晰、返回值明确的函数",
    "能解释默认参数、可变参数和参数解包",
    "能说清 LEGB、global/nonlocal 与闭包",
    "能写出正确的二分查找并解释递归成本"
  ],
  lessons: [
    {
      id: "ch6-1",
      title: "6.1 def、return 与参数",
      minutes: 45,
      lead: "写函数的第一原则不是「短」，而是「边界清楚」：它接收什么、返回什么、出错时怎么办。这一节把位置参数、关键字参数、默认参数、可变参数和返回值讲成一套可用的规则。",
      source: "Introducing Python 3rd · Ch.9；Beginning Python 4th · Ch.6；Head First Python 3rd · Ch.4–5",
      sections: [
        {
          h: "函数是命名的作用域，不是一段代码",
          p: `[[def average(scores):]] 定义了一个函数对象，名字 [[average]] 绑定到它。函数体不会在定义时执行，只有调用时才执行。函数有自己的局部作用域：函数里赋值的名字默认是局部的，不会污染外部。

函数的第一价值是**命名行为**。一段代码被调用三次，不是「重复三次」，而是「同一个行为被复用三次」。第二价值是**隔离变化**：输入通过参数进来，结果通过 [[return]] 出去，函数内部的临时变量对外不可见。第三价值是**可测试**：你可以给定输入，断言输出。

文档字符串 [["""返回平均分"""]] 不是注释，它保存在 [[average.__doc__]] 里，能被 [[help()]] 和 IDE 读取。写清楚参数含义、返回值、异常，比写「这个函数用于计算」有用得多。`,
          code: `def average(scores):
    """返回分数的平均值；空列表抛 ValueError。"""
    if not scores:
        raise ValueError("scores 不能为空")
    return sum(scores) / len(scores)

print(average([91, 84, 88]))
print(average.__doc__)
help(average)`,
          output: `87.66666666666667
返回分数的平均值；空列表抛 ValueError。
Help on function average...`,
          tip: `函数定义时只创建对象，不执行函数体；函数体里的代码在调用时才运行。`
        },
        {
          h: "位置参数、关键字参数、默认参数",
          p: `调用函数时，参数可以按位置传，也可以按名字传。[[f(1, 2)]] 是位置参数；[[f(a=1, b=2)]] 是关键字参数。关键字参数让调用意图更清楚，尤其是参数多、含义容易混的时候。

默认参数在定义时求值，而且只求值一次。[[def add(item, bucket=[]):]] 的 [[bucket]] 在所有调用之间共享同一个列表；你 [[append]] 一次，下次调用还在。正确写法是用 [[None]] 做哨兵：[[def add(item, bucket=None): if bucket is None: bucket = []]]。

参数顺序有规则：位置参数在前，默认参数在后，关键字-only 参数放在 [[*]] 后面，位置-only 参数放在 [[/]] 前面。[[def f(a, b=1, *, c, d=2):]] 里 [[c]] 必须用关键字传。不要为了「灵活」把所有参数都设默认值，调用方会不知道哪些该传。`,
          code: `def add(item, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(item)
    return bucket

print(add(1))
print(add(2))
print(add(3))

def greet(name, *, punctuation="!"):
    return f"Hello, {name}{punctuation}"

print(greet("林晓"))
print(greet("林晓", punctuation="?"))`,
          output: `[1]
[2]
[3]
Hello, 林晓!
Hello, 林晓?`,
          tip: `默认参数只在定义时求值一次；可变默认值用 [[None]] 哨兵，在函数体内创建。`
        },
        {
          h: "return 与 None：没有返回就是 None",
          p: `函数没有 [[return]]，或者 [[return]] 后面没有值，返回值都是 [[None]]。[[print()]] 也是返回 [[None]]，它只负责输出，不负责返回内容。很多「为什么变量变成了 None」的 bug，都是把 [[print]] 当成了 [[return]]。

[[return]] 会立即结束函数，后面的代码不再执行。这叫「早返回」，适合处理错误和边界：先检查空值、类型、范围，不满足就返回或抛异常；主逻辑放在后面，缩进更浅。

返回多个值本质上返回一个元组：[[return count, total]]。调用方可以 [[c, t = f()]] 解包，也可以 [[result = f()]] 拿元组。不要返回一个含义不清的列表；字段顺序要写进文档，字段多了用 [[NamedTuple]] / [[dataclass]]。`,
          code: `def summarize(scores):
    if not scores:
        return None
    return len(scores), sum(scores), sum(scores) / len(scores)

result = summarize([91, 84, 88])
print(result)

count, total, avg = result
print(count, total, avg)

print(summarize([]))`,
          output: `(3, 263, 87.66666666666667)
3 263 87.66666666666667
None`,
          tip: `[[print()]] 返回 [[None]]；函数要返回结果用 [[return]]，不要用 [[print]] 代替。`
        },
        {
          h: "可变参数 *args 与 **kwargs",
          p: `[[*args]] 把多余的位置参数收集成元组；[[**kwargs]] 把多余的关键字参数收集成字典。它们适合「转发参数」和「写装饰器」，不适合用来掩盖一个本该明确列出的参数列表。

[[def f(*args, **kwargs):]] 可以接收任何参数，但调用方看不出函数需要什么，IDE 也无法提示。除非你是在做包装器，否则优先写明确参数。参数超过五六个，考虑用配置对象或关键字-only 参数。

调用时也可以用 [[*]] / [[**]] 解包：[[f(*items)]] 把列表展开成位置参数，[[f(**config)]] 把字典展开成关键字参数。解包时键必须是字符串，且不能和已有参数冲突。`,
          code: `def show(*args, **kwargs):
    print("args:", args)
    print("kwargs:", kwargs)

show(1, 2, name="林晓", score=91)

items = [1, 2]
config = {"name": "陈默", "score": 76}
show(*items, **config)`,
          output: `args: (1, 2)
kwargs: {'name': '林晓', 'score': 91}
args: (1, 2)
kwargs: {'name': '陈默', 'score': 76}`,
          tip: `[[*args]] 是元组，[[**kwargs]] 是字典；转发参数时保留它们，业务函数尽量写明确参数。`
        },
        {
          h: "小任务：写一个健壮的 average",
          p: `要求 [[average(numbers)]] 接收数字序列，返回平均值；空序列抛 [[ValueError]]；序列里有 [[None]] 或非数字抛 [[TypeError]]；可选参数 [[skip_none=False]]，为真时跳过 [[None]]。这个任务练参数设计、类型检查和边界。

先写测试表：空列表、全数字、含 [[None]]、含字符串、全 [[None]]、[[skip_none=True]]。每个用例都写清楚期望的异常类型或返回值。不要只测「正常路径」，异常路径才是函数契约的一部分。

实现时把「过滤」和「计算」分开：[[clean_numbers]] 负责校验和过滤，[[average]] 负责求和除以个数。这样错误信息更准确，也方便单独测试。`,
          code: `def clean_numbers(numbers, skip_none=False):
    result = []
    for value in numbers:
        if value is None and skip_none:
            continue
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError(f"不是数字: {value!r}")
        result.append(value)
    return result

def average(numbers, skip_none=False):
    cleaned = clean_numbers(numbers, skip_none=skip_none)
    if not cleaned:
        raise ValueError("没有可计算的数字")
    return sum(cleaned) / len(cleaned)

print(average([91, 84, 88]))
print(average([91, None, 88], skip_none=True))

try:
    print(average([]))
except ValueError as exc:
    print("ValueError:", exc)`,
          output: `87.66666666666667
89.5
ValueError: 没有可计算的数字`,
          tip: `[[bool]] 是 [[int]] 子类；校验数字时排除 [[True]] / [[False]]，否则它们会被当成 1/0。`
        }
      ],
      points: [
        "函数定义只创建对象，调用时才执行函数体",
        "默认参数只求值一次，可变默认值要用 [[None]] 哨兵",
        "[[return]] 立即结束函数，没有返回值就是 [[None]]",
        "[[*args]] 收集位置参数为元组，[[**kwargs]] 收集关键字参数为字典",
        "调用时可以用 [[*]] / [[**]] 解包序列和字典",
        "参数列表要明确，[[*args]] / [[**kwargs]] 主要留给包装器"
      ],
      practice: "给 `average()` 增加 `precision=2` 参数：返回值仍保留原始精度，但打印时四舍五入；思考 precision 应该影响返回值还是只影响展示。"
    },
    {
      id: "ch6-2",
      title: "6.2 作用域、闭包与 lambda",
      minutes: 45,
      lead: "为什么函数里改了变量，外面没变？为什么嵌套函数能记住外层变量？为什么 lambda 里不能写赋值？这一节用 LEGB 规则把这些现象串起来，并说明什么时候该用闭包，什么时候不该。",
      source: "Introducing Python 3rd · Ch.9；Beginning Python 4th · Ch.6；Head First Python 3rd · Ch.5",
      sections: [
        {
          h: "LEGB：名字查找的四个层级",
          p: `Python 查找名字按 LEGB 顺序：Local（函数内部）、Enclosing（外层函数）、Global（模块全局）、Built-in（内置）。先在最近的作用域找，找不到再往外层找，最后找 [[len]]、[[print]] 这些内置名字。

函数里赋值会让名字变成局部变量，除非你用 [[global]] / [[nonlocal]] 声明。[[def f(): x = 1]] 的 [[x]] 是局部的，不会影响模块里的 [[x]]。反过来，函数里读取一个外部变量是允许的，只要没有同名局部赋值。

这个规则解释了「为什么我在函数里改了列表，外面也变了」：你没有重新绑定名字，而是修改了名字指向的可变对象。作用域规则管的是名字绑定，不是对象内容。`,
          code: `x = "global"

def read():
    print(x)

def shadow():
    x = "local"
    print(x)

read()
shadow()
print(x)

items = []
def add():
    items.append(1)

add()
print(items)`,
          output: `global
local
global
[1]`,
          tip: `函数内赋值默认创建局部名字；修改可变对象不需要 [[global]]，但重新绑定需要。`
        },
        {
          h: "global 与 nonlocal：什么时候必须声明",
          p: `[[global name]] 告诉解释器：函数里的 [[name]] 指向模块全局变量，不是新建局部变量。[[nonlocal name]] 指向最近的外层函数变量。两者都只影响名字绑定，不改变对象的可变性。

[[global]] 应该少用。它让函数依赖外部状态，测试困难，并发下也容易出问题。更好的做法是把状态作为参数传入，或把状态封装在类/闭包里。只有在模块级配置、计数器、缓存这类明确场景才考虑 [[global]]。

[[nonlocal]] 常用于闭包计数器。没有它，内层函数的 [[count += 1]] 会被当成局部赋值，外层 [[count]] 不变。[[nonlocal]] 只能指向外层函数变量，不能指向全局；全局用 [[global]]。`,
          code: `count = 0

def increment_global():
    global count
    count += 1
    return count

print(increment_global())
print(increment_global())

def make_counter():
    count = 0
    def next_value():
        nonlocal count
        count += 1
        return count
    return next_value

counter = make_counter()
print(counter())
print(counter())`,
          output: `1
2
1
2`,
          tip: `[[global]] 改模块变量，[[nonlocal]] 改外层函数变量；两者都只影响绑定，不影响对象内容。`
        },
        {
          h: "闭包：函数记住外层变量",
          p: `闭包是「内层函数 + 它引用的外层变量」。[[make_counter()]] 返回 [[next_value]]，即使 [[make_counter]] 已经返回，[[next_value]] 仍然记得 [[count]]。这个 [[count]] 不是全局变量，也不是每次调用新建的局部变量，它被闭包捕获了。

闭包的价值是封装状态。你不用写全局变量，也不用写类，就能得到一个「带记忆的函数」。但闭包也有坑：循环里创建多个闭包，它们可能共享同一个变量；用默认参数绑定当前值，或写工厂函数。

闭包不是越多越好。状态复杂、需要多个方法、需要序列化时，类比闭包更合适。闭包适合简单的「一个函数 + 一点状态」，比如计数器、缓存、回调。`,
          code: `def make_multiplier(factor):
    def multiply(value):
        return value * factor
    return multiply

double = make_multiplier(2)
triple = make_multiplier(3)
print(double(10))
print(triple(10))

funcs = []
for factor in [2, 3, 4]:
    funcs.append(lambda x: x * factor)
print([f(10) for f in funcs])`,
          output: `20
30
[40, 40, 40]`,
          tip: `循环里创建 lambda 会捕获同一个变量；用 [[lambda x, f=factor: x * f]] 绑定当前值。`
        },
        {
          h: "lambda 与高阶函数：短函数，不是万能函数",
          p: `[[lambda x: x * 2]] 是一个匿名函数，函数体只能是单个表达式，不能写 [[return]]、赋值、循环。它适合作为 [[key]]、[[map]]、[[filter]] 的参数，不适合承担复杂逻辑。

[[map(f, items)]] 返回惰性迭代器，[[filter(pred, items)]] 也是；需要列表时 [[list()]]。[[sorted(items, key=lambda x: x[1])]] 是最常见的 lambda 用法。[[functools.partial]] 可以固定部分参数，比 lambda 更清晰。

如果 lambda 超过一行、需要注释、需要异常处理，就写 [[def]]。给函数起名字不是浪费时间，它让 traceback 和日志可读。lambda 的优势是「短」和「就地」，不是「高级」。`,
          code: `items = ["apple", "banana", "cherry"]
print(list(map(len, items)))
print(list(filter(lambda s: "a" in s, items)))
print(sorted(items, key=lambda s: len(s), reverse=True))

from functools import partial
def power(base, exponent):
    return base ** exponent

square = partial(power, exponent=2)
print(square(5))`,
          output: `[5, 6, 6]
['apple', 'banana']
['banana', 'cherry', 'apple']
25`,
          tip: `[[map]] / [[filter]] 返回迭代器，只能消费一次；需要重复用先 [[list()]]。`
        },
        {
          h: "小任务：计数器与排序键",
          p: `写一个 [[make_counter(start=0, step=1)]]，返回一个每次调用加 [[step]] 的函数；再写一个 [[sort_by_score(rows)]]，按分数降序、姓名升序排序。这个任务把闭包和 lambda 放在一起练。

计数器用 [[nonlocal]] 保存状态，返回的函数只接收必要参数。不要用全局变量，否则两个计数器会互相干扰。测试时创建两个独立计数器，确认它们的状态互不影响。

排序键用元组：[[(-score, name)]]。负数实现降序，姓名实现同分升序。不要把排序逻辑写进 lambda 的多行表达式；如果规则复杂，写一个 [[sort_key(row)]] 函数，再 [[key=sort_key]]。`,
          code: `def make_counter(start=0, step=1):
    value = start
    def next_value():
        nonlocal value
        value += step
        return value
    return next_value

c1 = make_counter()
c2 = make_counter(100, 10)
print(c1(), c1(), c2(), c2())

rows = [["林晓", 87], ["陈默", 87], ["周宁", 95]]
rows.sort(key=lambda row: (-row[1], row[0]))
print(rows)`,
          output: `1 2 110 120
[['周宁', 95], ['陈默', 87], ['林晓', 87]]`,
          tip: `两个计数器独立，是因为每次 [[make_counter()]] 都创建新的 [[value]]；闭包捕获的是那次调用的变量。`
        }
      ],
      points: [
        "LEGB 顺序：Local → Enclosing → Global → Built-in",
        "函数内赋值默认是局部变量，读取外部变量不需要声明",
        "[[global]] 改模块变量，[[nonlocal]] 改外层函数变量",
        "闭包捕获外层变量，循环里创建闭包要绑定当前值",
        "lambda 只能写单个表达式，复杂逻辑用 [[def]]",
        "[[map]] / [[filter]] 返回惰性迭代器，只能消费一次"
      ],
      practice: "把 `make_counter` 改成支持 `reset()`：返回一个对象或字典，包含 `next` 和 `reset` 两个函数；比较闭包方案和类方案的差异。"
    },
    {
      id: "ch6-3",
      title: "6.3 递归与二分查找",
      minutes: 45,
      lead: "递归不是「函数调用自己」这么简单，它需要基线、递推和收敛三件套。二分查找则是递归与循环都适合的经典问题。这一节把调用栈、递归深度、边界条件和切片成本讲清楚。",
      source: "Introducing Python 3rd · Ch.9；Beginning Python 4th · Ch.6；Head First Python 3rd · Ch.5",
      sections: [
        {
          h: "递归三件套：基线、递推、收敛",
          p: `递归函数必须有三部分：基线条件（什么时候停）、递推关系（问题怎么变小）、收敛保证（每次调用都向基线靠近）。缺一个就会无限递归，最终抛 [[RecursionError]]。

阶乘是最经典的例子：[[factorial(0) = 1]] 是基线，[[factorial(n) = n * factorial(n - 1)]] 是递推，[[n]] 每次减 1 保证收敛。斐波那契的朴素递归也能写，但会重复计算大量子问题，复杂度指数级；这不是递归本身的问题，是递推设计的问题。

递归适合「问题可以拆成同构子问题」的场景：树遍历、分治、回溯、目录扫描。不适合「简单循环就能解决」的场景。写递归前先问：基线是什么？每次递归真的变小了吗？会不会重复计算？`,
          code: `def factorial(n):
    if n < 0:
        raise ValueError("n 不能为负")
    if n == 0:
        return 1
    return n * factorial(n - 1)

for n in range(6):
    print(n, factorial(n))`,
          output: `0 1
1 1
2 2
3 6
4 24
5 120`,
          tip: `递归先写基线，再写递推；每次调用必须向基线靠近，否则 [[RecursionError]]。`
        },
        {
          h: "调用栈与递归深度限制",
          p: `每次函数调用，Python 都会在调用栈上压入一个帧，保存局部变量、返回地址和当前执行位置。递归太深，栈会溢出，抛 [[RecursionError: maximum recursion depth exceeded]]。默认限制通常在 1000 左右，不同环境可能不同。

[[sys.setrecursionlimit()]] 可以调高限制，但不推荐把它当解决方案。栈空间是有限的，调高限制可能让程序崩溃而不是抛异常。递归深度大时，改用循环、显式栈或分治迭代。

Python 没有尾调用优化。即使你写成「尾递归」，解释器也不会把栈帧复用。所以「递归写法优雅」不能成为忽略深度的理由。处理深树、长链表、大目录时，优先考虑迭代。`,
          code: `import sys

def depth(n):
    if n == 0:
        return 0
    return 1 + depth(n - 1)

print(depth(10))
print(sys.getrecursionlimit())

try:
    print(depth(2000))
except RecursionError as exc:
    print("RecursionError:", exc)`,
          output: `10
1000
RecursionError: maximum recursion depth exceeded`,
          tip: `[[sys.setrecursionlimit()]] 不是万能药；深度大用迭代或显式栈。Python 没有尾递归优化。`
        },
        {
          h: "二分查找：有序、边界、循环版",
          p: `二分查找的前提是**有序**。它每次取中间元素，和 target 比较，排除一半区间。时间复杂度 O(log n)，比线性查找快得多；但排序本身要 O(n log n)，如果只查一次，排序可能不划算。

边界是二分最容易错的地方。常见写法用 [[lo = 0, hi = len(items) - 1]]，闭区间 [[[lo, hi]]]；循环条件 [[lo <= hi]]；中间 [[mid = (lo + hi) // 2]]；命中返回 [[mid]]；[[items[mid] < target]] 时 [[lo = mid + 1]]，否则 [[hi = mid - 1]]。每一步都要保证区间在缩小。

如果使用 [[hi = len(items)]] 的半开区间，循环条件变成 [[lo < hi]]，更新规则也不同。两种写法都正确，但不能混用。面试/业务代码里，选一种并写测试，比背模板重要。`,
          code: `def binary_search(items, target):
    lo, hi = 0, len(items) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if items[mid] == target:
            return mid
        if items[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1

data = [52, 60, 76, 88, 91, 95]
for target in [52, 76, 95, 60, 100]:
    print(target, binary_search(data, target))`,
          output: `52 0
76 2
95 5
60 1
100 -1`,
          tip: `二分查找必须先排序；闭区间和半开区间的更新规则不能混用。`
        },
        {
          h: "递归版二分与切片成本",
          p: `递归版二分可以写成 [[binary_search(items[:mid], target)]]，看起来简洁，但每次切片都创建新列表，成本 O(n)，总复杂度退化成 O(n log n) 甚至更差。正确做法是传 [[lo, hi]] 下标，不复制列表。

递归版的核心是把「区间」作为参数：[[search(items, target, lo, hi)]]。基线是 [[lo > hi]] 返回 -1；中间命中返回 [[mid]]；否则递归左半或右半。每次递归区间减半，深度 O(log n)，不会触及递归限制。

业务代码里，循环版通常更简单、更省内存。递归版适合教学和分治场景；如果你只是查找，优先 [[bisect]] 模块。[[bisect_left]] / [[bisect_right]] 能处理重复元素和插入位置，比手写更稳。`,
          code: `def search(items, target, lo, hi):
    if lo > hi:
        return -1
    mid = (lo + hi) // 2
    if items[mid] == target:
        return mid
    if items[mid] < target:
        return search(items, target, mid + 1, hi)
    return search(items, target, lo, mid - 1)

data = [52, 60, 76, 88, 91, 95]
print(search(data, 88, 0, len(data) - 1))

import bisect
print(bisect.bisect_left(data, 88))
print(bisect.bisect_right(data, 88))`,
          output: `3
3
4`,
          tip: `递归二分不要切片；传 [[lo, hi]] 下标。重复元素用 [[bisect_left]] / [[bisect_right]] 区分左右边界。`
        },
        {
          h: "小任务：在有序成绩表中查找",
          p: `给一个按分数升序排列的 [[[score, name]]] 列表，查找第一个分数等于 target 的记录，返回下标或 -1。要求处理重复分数：返回最左边那个。先用循环版写，再用 [[bisect_left]] 写一遍。

重复分数是二分的经典陷阱。普通二分命中后立即返回，可能返回中间那个，不是最左。要最左，命中后继续 [[hi = mid - 1]]；或者用 [[bisect_left]] 找到插入点，再检查该位置是否等于 target。

测试要覆盖：空列表、target 小于最小值、大于最大值、重复值、只有一个元素。每个边界都写断言，不要只靠肉眼打印。`,
          code: `from bisect import bisect_left

rows = [[52, "周宁"], [76, "陈默"], [88, "林晓"], [88, "赵一"], [95, "陈默"]]

def find_left(rows, target):
    lo, hi = 0, len(rows) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if rows[mid][0] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    if lo < len(rows) and rows[lo][0] == target:
        return lo
    return -1

print(find_left(rows, 88))
print(find_left(rows, 52))
print(find_left(rows, 100))

values = [row[0] for row in rows]
print(bisect_left(values, 88))`,
          output: `2
0
-1
2`,
          tip: `找最左匹配：命中后不要立即返回，继续收缩右边界；[[bisect_left]] 返回插入点，再检查值。`
        }
      ],
      points: [
        "递归三件套：基线、递推、收敛",
        "每次递归都压栈，深度过大会 [[RecursionError]]",
        "Python 没有尾递归优化，[[setrecursionlimit]] 不是解决方案",
        "二分查找必须先有序，闭区间/半开区间不能混用",
        "递归二分不要切片，传 [[lo, hi]] 下标",
        "重复元素找最左用 [[bisect_left]] 或命中后继续收缩"
      ],
      practice: "把 `find_left` 改成返回所有匹配记录的区间 `(left, right)`，用两次二分实现；测试空列表、单元素、全重复、无匹配四种情况。"
    }
  ]
});

/* --- ch7.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch7",
  part: 1,
  number: "07",
  title: "推导式、迭代器与生成器",
  summary: "这是第一篇的收束：从「能处理一批数据」升级到「能流式处理数据」。推导式让转换和过滤变得紧凑，迭代器协议解释 for 的底层，生成器则让你用固定内存处理大文件。最后把整篇的成绩数据串成一个可复用的管道。",
  goals: [
    "能写出列表、字典、集合推导式并控制嵌套顺序",
    "能解释可迭代对象与迭代器的区别",
    "能用 yield 写生成器，按需产出数据",
    "能把大文件处理写成不占内存的生成器管道"
  ],
  lessons: [
    {
      id: "ch7-1",
      title: "7.1 列表/字典/集合推导式",
      minutes: 40,
      lead: "推导式不是「写得更短」的炫技，而是把「遍历—转换—过滤」三件事压成一个表达式。用得好，代码像数据变换；用得过头，一行里塞三层循环，谁也读不懂。这一节先建立边界。",
      source: "Introducing Python 3rd · Ch.6；Beginning Python 4th · Ch.4–5；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "推导式是「表达式 + for + if」",
          p: `列表推导式的基本形状是 [[[expr for item in iterable if condition]]]。它从 [[iterable]] 逐个取 [[item]]，满足 [[condition]] 时计算 [[expr]]，把结果收集成新列表。和 [[for]] 循环相比，它把「建空列表、append、缩进」这些机械步骤省掉了。

推导式的结果一定是新列表，不会修改原数据。它适合「一对一转换」和「过滤」；不适合有副作用的操作，比如写文件、发请求、修改全局状态。需要副作用时，老老实实写 [[for]] 循环，别把 [[print]] 塞进推导式。

推导式也有作用域：在 Python 3 里，循环变量不会泄漏到外部。[[[x for x in range(3)]]] 结束后，外面的 [[x]] 不受影响。这一点和 [[for]] 循环不同，[[for]] 的循环变量会留在当前作用域。`,
          code: `scores = [91, 84, 88, 59]
passed = [score for score in scores if score >= 60]
curved = [score + 5 for score in scores]
print(passed)
print(curved)

x = "outer"
result = [x for x in range(3)]
print(result)
print(x)`,
          output: `[91, 84, 88]
[96, 89, 93, 64]
[0, 1, 2]
outer`,
          tip: `推导式只做「转换/过滤」，不要在里面写 [[print]]、[[append]] 或其他副作用。`
        },
        {
          h: "嵌套循环的顺序：先写外层还是内层",
          p: `推导式里的多个 [[for]] 按从左到右的顺序嵌套：[[[x for row in matrix for x in row]]] 等价于 [[for row in matrix: for x in row: ...]]。外层 [[for row]] 在前，内层 [[for x]] 在后。写反了，结果会完全不同，甚至报错。

如果你需要「先过滤行，再展开」，可以写成 [[[x for row in matrix if row for x in row]]]；[[if row]] 作用在 [[row]] 上，不是 [[x]]。多个 [[if]] 也可以连写，它们按顺序过滤。

嵌套推导式超过两层，可读性会急剧下降。把它拆成函数，或者用普通循环 + 有名字的中间变量。代码是给人读的，不是给「一行长度」比赛用的。`,
          code: `matrix = [[1, 2], [3, 4], [5]]
flat = [x for row in matrix for x in row]
print(flat)

pairs = [(x, y) for x in range(2) for y in range(3)]
print(pairs)

rows = [["林晓", 91], ["", 0], ["陈默", 76]]
names = [row[0] for row in rows if row[0]]
print(names)`,
          output: `[1, 2, 3, 4, 5]
[(0, 0), (0, 1), (0, 2), (1, 0), (1, 1), (1, 2)]
['林晓', '陈默']`,
          tip: `多个 [[for]] 从左到右嵌套；外层条件写在对应 [[for]] 后面，不要误以为 [[if]] 只过滤最后一个变量。`
        },
        {
          h: "字典推导式与集合推导式",
          p: `字典推导式写 [[{key_expr: value_expr for item in iterable if condition}]]。它适合把「记录列表」转成「按 ID 索引的字典」，或者把两个列表配对成映射。键必须可哈希，重复键后出现的覆盖先出现的。

集合推导式写 [[{expr for item in iterable if condition}]]，结果去重且无序。它适合「提取所有出现过的班级」这种去重需求。不要用集合推导式做需要顺序的输出；集合不保证顺序。

字典/集合推导式同样只做转换，不做副作用。需要保留重复、保留顺序时，用列表推导式；需要按键查找时，用字典推导式；只需要成员关系时，用集合推导式。`,
          code: `rows = [["S01", "林晓", 91], ["S02", "陈默", 76], ["S03", "周宁", 88]]

by_id = {row[0]: {"name": row[1], "score": row[2]} for row in rows}
print(by_id["S02"])

classes = ["A", "A", "B", "C", "B"]
unique = {c for c in classes}
print(unique)

squares = {n: n * n for n in range(5)}
print(squares)`,
          output: `{'name': '陈默', 'score': 76}
{'A', 'B', 'C'}
{0: 0, 1: 1, 2: 4, 3: 9, 4: 16}`,
          tip: `字典推导式重复键会覆盖；集合推导式会去重且无序。要保留顺序用列表。`
        },
        {
          h: "条件表达式 vs 过滤条件",
          p: `推导式里有两个容易混的「if」。写在 [[for]] 后面的 [[if]] 是**过滤**：不满足就不产出。写在 [[expr]] 里的 [[x if cond else y]] 是**条件表达式**：每个元素都产出一个结果，只是结果不同。

[[[x for x in items if x > 0]]] 只保留正数；[[[x if x > 0 else 0 for x in items]]] 保留所有元素，负数变成 0。前者结果长度可能变短，后者长度不变。用错会得到「数量不对」或「0 太多」的结果。

条件表达式必须有 [[else]]，否则不是表达式。[[x if x > 0]] 是语法错误。过滤条件不能有 [[else]]；它只决定「要不要」，不决定「换成什么」。`,
          code: `items = [-2, -1, 0, 1, 2]
only_positive = [x for x in items if x > 0]
clamped = [x if x > 0 else 0 for x in items]
print(only_positive)
print(clamped)

labels = [("pass" if x >= 0 else "fail") for x in items]
print(labels)`,
          output: `[1, 2]
[0, 0, 0, 1, 2]
['fail', 'fail', 'pass', 'pass', 'pass']`,
          tip: `过滤 [[if]] 改变结果长度；条件表达式 [[if/else]] 保持长度不变。先想清楚你要哪一种。`
        },
        {
          h: "小任务：成绩表清洗与转换",
          p: `给一批原始行 [["林晓", "91"], ["", "84"], ["陈默", "缺考"], ["周宁", "88"]]，要求：跳过空姓名；把数字转成 int；缺考记为 [[None]]；最后生成一个字典，键是姓名，值是分数。这个任务把过滤、转换、字典推导式串起来。

不要在推导式里写 [[try/except]]；推导式的表达式不适合处理复杂错误。先写一个 [[parse_score(text)]] 返回 [[int]] 或 [[None]]，再在推导式里调用它。这样错误处理有名字，推导式也保持干净。

输出前检查：空姓名是否真的跳过；缺考是否变成 [[None]]；重复姓名是否覆盖。字典推导式不会报重复键，后出现的会赢；如果业务不允许重复，先检测再构建。`,
          code: `def parse_score(text):
    text = text.strip()
    if text == "缺考":
        return None
    return int(text)

raw = [["林晓", "91"], ["", "84"], ["陈默", "缺考"], ["周宁", "88"]]
clean = [
    (row[0].strip(), parse_score(row[1]))
    for row in raw
    if row[0].strip()
]
result = {name: score for name, score in clean}
print(clean)
print(result)`,
          output: `[('林晓', 91), ('陈默', None), ('周宁', 88)]
{'林晓': 91, '陈默': None, '周宁': 88}`,
          tip: `复杂错误处理抽成函数，不要塞进推导式；字典推导式重复键静默覆盖。`
        }
      ],
      points: [
        "推导式由表达式、[[for]]、可选 [[if]] 组成，结果是新容器",
        "多个 [[for]] 从左到右嵌套，外层写在前面",
        "字典推导式重复键后值覆盖，集合推导式去重且无序",
        "过滤 [[if]] 改变结果长度，条件表达式 [[if/else]] 不改变长度",
        "推导式不要做副作用；复杂逻辑抽成函数",
        "Python 3 推导式的循环变量不会泄漏到外部"
      ],
      practice: "把 `clean` 改成同时保留原始行号：用 `enumerate(raw, start=1)`，输出 `(line_no, name, score)`；再写一个测试，确认空姓名行被跳过但行号仍正确。"
    },
    {
      id: "ch7-2",
      title: "7.2 迭代器协议与惰性求值",
      minutes: 45,
      lead: "for 为什么能遍历列表、字典、文件、生成器？答案是迭代器协议。理解 iter/next/StopIteration，你就能解释「为什么这个对象只能遍历一次」，也能自己写一个迭代器。",
      source: "Introducing Python 3rd · Ch.6；Beginning Python 4th · Ch.5–6；Head First Python 3rd · Ch.4",
      sections: [
        {
          h: "可迭代对象 vs 迭代器",
          p: `可迭代对象（iterable）是能交给 [[for]] 的东西：列表、字符串、字典、文件、range。它实现 [[__iter__]]，返回一个迭代器。迭代器（iterator）实现 [[__next__]]，每次返回下一个值，没有更多值时抛 [[StopIteration]]。

[[iter(items)]] 调用 [[__iter__]] 拿到迭代器；[[next(it)]] 调用 [[__next__]] 拿下一个值。[[for]] 循环的底层就是：先 [[iter()]]，再反复 [[next()]]，捕获 [[StopIteration]] 后结束。你写 [[for]] 时不需要手动做这些，但理解它才能解释很多现象。

迭代器通常也实现 [[__iter__]]，返回自己。所以迭代器既是可迭代对象，又是自己的迭代器。[[iter(it)]] 返回 [[it]] 本身；这也是「迭代器只能消费一次」的根源。`,
          code: `items = [1, 2, 3]
it = iter(items)
print(next(it))
print(next(it))
print(next(it))

try:
    print(next(it))
except StopIteration:
    print("StopIteration")

print(iter(it) is it)`,
          output: `1
2
3
StopIteration
True`,
          tip: `[[iter()]] 拿迭代器，[[next()]] 取下一个；[[StopIteration]] 是正常结束信号，不是错误。`
        },
        {
          h: "迭代器耗尽：为什么第二遍是空的",
          p: `迭代器是「一次性」的。[[it = iter([1, 2, 3])]] 之后，你 [[list(it)]] 得到 [[[1, 2, 3]]]；再 [[list(it)]] 得到 [[[]]]。因为迭代器已经走到末尾，没有「重置」方法。

很多内置函数返回迭代器：[[map]]、[[filter]]、[[zip]]、[[enumerate]]、生成器表达式。你 [[sum(it)]] 之后再 [[list(it)]]，得到空列表。要重复使用，先把结果存成列表，或者重新创建迭代器。

[[itertools.tee]] 可以把一个迭代器分成多个，但它内部会缓存，内存不一定省。对无限迭代器用 [[tee]] 要特别小心。最简单可靠的方案：需要多次遍历时，用列表/元组保存；只需要一次时，才用迭代器。`,
          code: `it = iter([1, 2, 3])
print(list(it))
print(list(it))

mapped = map(str, [1, 2, 3])
print(list(mapped))
print(list(mapped))

import itertools
base = iter([1, 2, 3])
a, b = itertools.tee(base, 2)
print(list(a))
print(list(b))`,
          output: `[1, 2, 3]
[]
['1', '2', '3']
[]
[1, 2, 3]
[1, 2, 3]`,
          tip: `[[map]] / [[filter]] / [[zip]] 返回迭代器，只能消费一次；需要重复遍历先 [[list()]]。`
        },
        {
          h: "惰性求值：什么时候算，什么时候不算",
          p: `惰性求值意味着「需要时才计算」。[[range(10**9)]] 不占十亿个整数的内存；[[map(f, items)]] 不立刻调用 [[f]]；生成器表达式 [[(x * 2 for x in items)]] 也不立刻算。只有你 [[next()]] 或 [[for]] 迭代时，才算下一个。

惰性带来内存优势，也带来「副作用延迟」的困惑。你在 [[map]] 里放 [[print]]，不迭代就不会打印；你 [[list()]] 之后才看到输出。不要把「创建迭代器」误认为「执行了计算」。

惰性不等于免费。每次 [[next()]] 都有调用开销；对很小的数据，列表推导式可能更快。对很大的数据或无限序列，惰性才是必要的。选择标准是「数据规模 + 是否需要重复遍历」，不是「看起来高级」。`,
          code: `def double(x):
    print("计算", x)
    return x * 2

lazy = map(double, [1, 2, 3])
print("创建完成")
print(next(lazy))
print("取了一个")
print(list(lazy))`,
          output: `创建完成
计算 1
2
取了一个
计算 2
计算 3
[4, 6]`,
          tip: `[[map]] / 生成器表达式创建时不算；[[next()]] 或 [[list()]] 才触发计算。`
        },
        {
          h: "自定义迭代器：__iter__ 与 __next__",
          p: `你可以写一个类，实现 [[__iter__]] 返回 [[self]]，实现 [[__next__]] 返回下一个值，没有更多值时 [[raise StopIteration]]。这样它就能被 [[for]] 遍历，也能被 [[list()]]、[[sum()]] 消费。

[[__next__]] 必须记住当前位置。通常用 [[self.index]]，每次返回后加一。注意：迭代器耗尽后再 [[next()]]，必须继续抛 [[StopIteration]]，不能回到开头；否则 [[for]] 永远不会结束。

如果对象本身是可迭代容器（比如自定义列表），[[__iter__]] 应该返回一个新的迭代器，而不是 [[self]]。这样每次 [[for]] 都能从头开始。容器和迭代器的职责要分开。`,
          code: `class Countdown:
    def __init__(self, start):
        self.current = start

    def __iter__(self):
        return self

    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value

for n in Countdown(3):
    print(n)

print(list(Countdown(3)))`,
          output: `3
2
1
[3, 2, 1]`,
          tip: `迭代器的 [[__iter__]] 返回 [[self]]；容器每次 [[__iter__]] 应返回新的迭代器。`
        },
        {
          h: "小任务：写一个倒序迭代器",
          p: `实现 [[Reverse(items)]]，按原列表的倒序逐个产出元素，不创建反转后的新列表。要求支持 [[for]]、[[list()]]，并保证同一实例耗尽后继续抛 [[StopIteration]]。

关键是保存 [[items]] 和当前下标，从 [[len(items) - 1]] 开始，每次减一，小于 0 就停。不要用 [[reversed(items)]] 偷懒；这个任务是为了理解协议，不是为了找最省事的写法。

再写一个测试：对空列表、单元素、多元素分别 [[list(Reverse(...))]]；同一个迭代器调用两次 [[list()]]，第二次应该是空列表。`,
          code: `class Reverse:
    def __init__(self, items):
        self.items = items
        self.index = len(items) - 1

    def __iter__(self):
        return self

    def __next__(self):
        if self.index < 0:
            raise StopIteration
        value = self.items[self.index]
        self.index -= 1
        return value

print(list(Reverse([1, 2, 3])))
r = Reverse([1, 2, 3])
print(list(r))
print(list(r))`,
          output: `[3, 2, 1]
[3, 2, 1]
[]`,
          tip: `倒序迭代器从末尾下标开始，耗尽后继续抛 [[StopIteration]]；同一个实例只能消费一次。`
        }
      ],
      points: [
        "可迭代对象实现 [[__iter__]]，迭代器实现 [[__next__]]",
        "[[for]] 底层是 [[iter()]] + 反复 [[next()]] + 捕获 [[StopIteration]]",
        "迭代器是一次性的，耗尽后不会自动重置",
        "[[map]] / [[filter]] / [[zip]] 返回惰性迭代器",
        "惰性求值延迟计算，创建迭代器不等于执行计算",
        "容器和迭代器职责分开：容器每次 [[__iter__]] 返回新迭代器"
      ],
      practice: "给 `Reverse` 增加 `__len__`，让 `len(Reverse([1,2,3]))` 返回 3；思考迭代器是否应该实现 `__len__`。"
    },
    {
      id: "ch7-3",
      title: "7.3 生成器与大数据文件处理",
      minutes: 45,
      lead: "生成器是「用函数写迭代器」：遇到 yield 就暂停，下一次 next 从暂停处继续。它让你用固定内存处理大文件、无限序列和流式管道。这一节把 yield、生成器表达式和文件处理串成第一篇的收尾项目。",
      source: "Introducing Python 3rd · Ch.6；Beginning Python 4th · Ch.6；Head First Python 3rd · Ch.4–5",
      sections: [
        {
          h: "yield 把函数变成生成器",
          p: `函数体里出现 [[yield]]，这个函数就不再是普通函数，而是生成器函数。调用它不会执行函数体，而是返回一个生成器对象；每次 [[next()]] 才执行到下一个 [[yield]]，产出一个值并暂停，局部变量和暂停位置都保留。

[[yield]] 和 [[return]] 不同：[[return]] 结束函数，[[yield]] 只暂停。生成器可以产出多次，最后一次执行完自动抛 [[StopIteration]]。[[for]] 循环能直接遍历生成器，和遍历列表一样。

生成器适合「按需产出」：读一行产一行、算一个产一个、无限序列。它不适合需要随机访问、多次遍历、[[len()]] 的场景；那些场景用列表更合适。`,
          code: `def count_up_to(n):
    current = 1
    while current <= n:
        yield current
        current += 1

gen = count_up_to(3)
print(next(gen))
print(next(gen))
print(list(gen))
print(list(gen))`,
          output: `1
2
[3]
[]`,
          tip: `调用生成器函数不执行函数体，只返回生成器；[[next()]] 才执行到下一个 [[yield]]。`
        },
        {
          h: "生成器表达式 vs 列表推导式",
          p: `生成器表达式把列表推导式的方括号换成圆括号：[[(x * 2 for x in items)]]。它不创建列表，而是返回生成器，按需计算。列表推导式 [[[x * 2 for x in items]]] 会立即算完并占用内存。

选择标准：需要重复遍历、索引、[[len()]]，用列表；只需要遍历一次、数据很大或无限，用生成器表达式。[[sum(x for x in items)]] 可以省掉一层括号，因为 [[sum]] 只接收一个可迭代参数时，生成器表达式可以裸写。

生成器表达式只能消费一次。你 [[sum(gen)]] 之后再 [[list(gen)]]，得到空列表。不要把它赋值后当列表反复用；要么重新创建，要么先 [[list()]]。`,
          code: `items = [1, 2, 3, 4]
list_comp = [x * 2 for x in items]
gen_expr = (x * 2 for x in items)

print(list_comp)
print(gen_expr)
print(list(gen_expr))
print(list(gen_expr))

print(sum(x * x for x in items))`,
          output: `[2, 4, 6, 8]
<generator object <genexpr> at ...>
[2, 4, 6, 8]
[]
30`,
          tip: `生成器表达式用圆括号，惰性且一次性；需要重复用先 [[list()]]。`
        },
        {
          h: "生成器管道：逐行读取大文件",
          p: `生成器最实用的场景是文件管道：[[read_lines]] 逐行读，[[clean_lines]] 去空行和注释，[[parse_rows]] 解析字段，[[filter_rows]] 过滤不及格。每一层都是生成器，数据像流水一样穿过，内存只保留当前一行。

不要把每个阶段都 [[list()]]，否则管道退化成「每层都存全量数据」。也不要在生成器里返回列表；[[return]] 会结束生成器，[[yield]] 才是产出。管道函数的参数和返回值都应该是可迭代对象。

管道的好处是每层可单独测试：给一个列表，[[list(clean_lines(...))]] 就能验证。坏处是调试时看不到「中间全部数据」，需要临时 [[list()]] 某一段。用 [[itertools.islice]] 只看前几条，避免打印整个大文件。`,
          code: `from itertools import islice

def read_lines(path):
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            yield line.rstrip("\\n")

def clean_lines(lines):
    for line in lines:
        line = line.strip()
        if line and not line.startswith("#"):
            yield line

def parse_rows(lines):
    for line in lines:
        name, score = [part.strip() for part in line.split(",")]
        yield name, int(score)

def failed(rows):
    for name, score in rows:
        if score < 60:
            yield name, score

rows = parse_rows(clean_lines(read_lines("scores.txt")))
print(list(islice(rows, 3)))`,
          output: `[('林晓', 91), ('陈默', 76), ('周宁', 88)]`,
          tip: `管道每层都用 [[yield]]，不要中途 [[list()]]；调试用 [[islice]] 只看前几条。`
        },
        {
          h: "生成器的关闭、send 与异常",
          p: `生成器可以提前关闭：[[gen.close()]] 会在暂停处抛 [[GeneratorExit]]，让 [[finally]] 有机会清理资源。文件生成器在 [[with]] 块里，提前关闭会正常退出 [[with]]，关闭文件。不要吞掉 [[GeneratorExit]]，否则生成器无法关闭。

[[gen.send(value)]] 可以把值送回生成器，成为当前 [[yield]] 表达式的返回值。[[next(gen)]] 等价于 [[gen.send(None)]]。[[send]] 适合协程风格的消费者，但入门阶段不必深入；知道它存在，别在普通生成器上乱用。

生成器里的异常会传播到调用方；调用方可以用 [[throw()]] 把异常送进去。复杂协程现在更多用 [[async/await]]，同步生成器主要用于数据管道。把 [[yield]] 当「产出」，把 [[send]] 当「双向通信」，不要混。`,
          code: `def safe_gen():
    try:
        yield 1
        yield 2
    finally:
        print("清理资源")

g = safe_gen()
print(next(g))
g.close()

def echo():
    received = yield "ready"
    while True:
        received = yield f"echo: {received}"

e = echo()
print(next(e))
print(e.send("hello"))`,
          output: `1
清理资源
ready
echo: hello`,
          tip: `[[close()]] 触发 [[GeneratorExit]]；[[finally]] 用来清理。[[send()]] 第一次必须传 [[None]] 或先 [[next()]]。`
        },
        {
          h: "小任务：统计大日志文件",
          p: `写一个生成器管道，逐行读取一个日志文件，统计每个级别（INFO/WARNING/ERROR）的行数，不把整个文件读进内存。日志格式假设为 [[“2026-11-24 INFO ... ”]]，级别是第二列。

步骤：[[read_lines]] → [[parse_level]] 产出级别 → [[count_levels]] 用字典累计。[[count_levels]] 可以是普通函数，消费生成器并返回字典；也可以 [[yield]] 中间结果，但最终统计通常需要聚合，返回字典更自然。

测试时造一个小文件，包含空行、格式不对的行、三种级别；确认坏行被跳过而不是崩溃，统计数与预期一致。最后用 [[tracemalloc]] 或简单观察内存，说明为什么这个方案适合大文件。`,
          code: `from collections import Counter

def read_lines(path):
    with open(path, encoding="utf-8") as fh:
        for line in fh:
            yield line.rstrip("\\n")

def levels(lines):
    for line in lines:
        parts = line.split()
        if len(parts) < 2:
            continue
        level = parts[1].upper()
        if level in {"INFO", "WARNING", "ERROR"}:
            yield level

def count_levels(path):
    return Counter(levels(read_lines(path)))

counts = count_levels("app.log")
print(counts)
print(counts["ERROR"])`,
          output: `Counter({'INFO': 3, 'ERROR': 1, 'WARNING': 1})
1`,
          tip: `[[Counter]] 是字典子类，适合计数；坏行用 [[continue]] 跳过，不要让整个管道崩掉。`
        }
      ],
      points: [
        "函数里有 [[yield]] 就变成生成器函数，调用返回生成器对象",
        "[[yield]] 暂停并保留局部状态，[[return]] 结束函数",
        "生成器表达式惰性、一次性，适合大文件/无限序列",
        "生成器管道每层 [[yield]]，不要中途 [[list()]]",
        "[[close()]] 触发 [[GeneratorExit]]，[[finally]] 负责清理",
        "[[send()]] 第一次必须传 [[None]] 或先 [[next()]]"
      ],
      practice: "把日志统计管道改成支持按小时分组：从每行开头提取 `HH`，用 `Counter` 统计每个小时的 ERROR 数；仍然保持逐行读取。"
    }
  ]
});

/* --- ch8.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch8",
  part: 2,
  number: "08",
  title: "模块、包、虚拟环境与标准库",
  summary: "从「一个文件跑到底」走向「一组文件互相引用」。这一章把 import 的查找路径、模块缓存、包结构和虚拟环境讲清楚，让你能把成绩工具拆成可复用模块，而不是复制粘贴。",
  goals: [
    "能解释 import 时解释器到底做了什么",
    "能设计一个带 __init__.py 的小包并正确使用绝对导入",
    "能用 venv 隔离依赖、用 pip 安装并锁定版本",
    "能按需找到 collections、itertools、pathlib 等标准库入口"
  ],
  lessons: [
    {
      id: "ch8-1",
      title: "8.1 import 是把名字带进来，不是把文件塞进来",
      minutes: 40,
      lead: "很多人把 import 理解成「把另一个文件的内容复制过来」，于是遇到循环导入、重复执行、模块名冲突时完全没头绪。这一节把 import 拆成查找、加载、绑定三步，再用一个成绩工具模块跑通。",
      source: "Introducing Python 3rd · Ch.12；Beginning Python 4th · Ch.10；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "模块是一个命名空间，不是一个文件夹",
          p: `在 Python 里，[[模块]] 是一个 [[.py]] 文件被加载后形成的对象。它有自己的命名空间：文件里定义的函数、类、常量都挂在这个模块对象上。[[import score_tools]] 做完之后，当前命名空间里多了一个名字 [[score_tools]]，它指向那个模块对象；模块里的 [[average]] 要通过 [[score_tools.average]] 访问。

这解释了一个常见误会：[[from score_tools import average]] 并不是「只加载 average」，而是先加载整个模块，再把 [[average]] 这个属性绑定到当前命名空间。模块顶层代码照样会执行，只是你只把其中一个名字拿了出来。想少写前缀可以用 [[from ... import ...]]，但要清楚代价：名字来源变模糊，重名时容易覆盖。

模块对象还有几个固定属性：[[__name__]] 是模块名，[[__file__]] 是源文件路径，[[__dict__]] 是命名空间字典。调试导入问题时，先打印这三个值，比盯着报错猜更有效。`,
          code: String.raw`# score_tools.py
print("score_tools 被加载")
VERSION = "1.0"

def average(scores):
    return sum(scores) / len(scores)

# main.py
import score_tools

print(score_tools.__name__)
print(score_tools.__file__)
print(score_tools.average([88, 92, 79]))
print(score_tools.__dict__["VERSION"])`,
          output: `score_tools 被加载
score_tools
/path/to/score_tools.py
86.33333333333333
1.0`,
          tip: `[[import]] 一定会执行模块顶层代码；如果你不希望导入时打印、写文件或联网，把这些动作放进 [[main()]] 或显式的初始化函数。`
        },
        {
          h: "四种 import 写法，各自适合什么场景",
          p: `最常见的四种写法是：[[import m]]、[[import m as alias]]、[[from m import name]]、[[from m import name as alias]]。它们不是风格问题，而是命名空间策略。

[[import m]] 保留完整前缀，最适合模块名短、调用点多、需要一眼看出「这个函数来自哪里」的场景，例如 [[import json]]、[[import pathlib]]。[[import numpy as np]] 这种别名适合社区约定俗成的长模块名。[[from m import name]] 适合名字唯一、调用频繁的函数，例如 [[from pathlib import Path]]；但如果从三个模块都导入 [[load]]，后导入的会覆盖前一个。[[from m import name as alias]] 用来解决冲突，例如 [[from json import loads as json_loads]]。

还有一个不推荐但必须认识的写法：[[from m import *]]。它把模块里所有不以下划线开头的名字倒进当前命名空间，看起来省事，实际让名字来源不可追踪，也容易覆盖已有变量。只有在交互式探索或极小的脚本里才考虑。`,
          code: String.raw`import math
import math as m
from math import sqrt
from math import sqrt as square_root

print(math.sqrt(81))
print(m.pi)
print(sqrt(16))
print(square_root(25))

# 命名冲突：后导入的覆盖前一个
from statistics import mean
mean = lambda values: sum(values) / len(values)
print(mean([1, 2, 3]))`,
          output: `9.0
3.141592653589793
4.0
5.0
2.0`,
          tip: `[[from ... import *]] 不是「导入全部函数」的快捷方式，而是把模块命名空间摊平；生产代码不要用它。`
        },
        {
          h: "模块只加载一次：缓存、状态与副作用",
          p: `同一个模块在同一进程里只会被加载一次。第一次 [[import]] 时，解释器创建模块对象、执行顶层代码，然后把它放进 [[sys.modules]]；后续再导入，直接复用缓存对象。这带来两个结果：模块级变量是进程级共享状态；模块初始化只发生一次。

共享状态有时是优点，例如配置对象、连接池、缓存；有时是 bug，例如你在测试里修改了模块级列表，下一个测试还在受影响。判断标准是「这个状态是否应该跨调用保留」。如果只是一次计算的中间结果，应该放在函数里；如果确实要共享，要显式提供 [[reset()]] 或工厂函数。

还要注意「只加载一次」不等于「只执行一次你想要的代码」。如果模块在导入时读文件、连数据库、启动线程，测试和 Web 服务加载它时都会发生。把副作用推迟到函数调用，是模块设计的基本纪律。`,
          code: String.raw`# counter.py
calls = []

def track(name):
    calls.append(name)
    return len(calls)

# main.py
import counter
import counter as again

print(counter is again)
print(counter.track("A"))
print(counter.track("B"))
print(counter.calls)`,
          output: `True
1
2
['A', 'B']`,
          tip: `[[import counter]] 和 [[import counter as again]] 指向同一个模块对象；改 [[again.calls]] 就是改 [[counter.calls]]。`
        },
        {
          h: "sys.path：解释器去哪里找模块",
          p: `[[import]] 不是在当前目录里瞎找，它按 [[sys.path]] 的顺序搜索。列表通常包含：脚本所在目录（或当前目录）、环境变量 [[PYTHONPATH]]、标准库目录、[[site-packages]]。找到第一个匹配的模块就停止，所以「同名模块」的优先级由路径顺序决定。

你可以打印 [[sys.path]] 看真实顺序。常见故障是「我明明写了 [[utils.py]]，为什么导入的是别的 utils？」——因为当前工作目录不在第一位，或者有一个同名包先被找到。另一个故障是脚本和标准库重名：把文件命名为 [[random.py]]，运行它时 [[import random]] 可能导入自己，随后 [[random.randint]] 不存在。

还有一个细节：直接运行脚本时，[[sys.path[0]]] 是脚本所在目录；以模块方式运行 [[python -m package.module]] 时，路径是当前目录。两种运行方式对导入的影响不同，包内相对导入只在模块方式下可靠。`,
          code: String.raw`import sys
from pathlib import Path

for i, item in enumerate(sys.path[:6]):
    print(i, item or "(空字符串：当前目录)")

print("当前工作目录:", Path.cwd())
print("本文件:", Path(__file__).resolve())`,
          output: `0 /path/to/project
1 /path/to/project/subjects
2 /usr/local/lib/python313.zip
3 /usr/local/lib/python3.13
4 /usr/local/lib/python3.13/lib-dynload
5 /usr/local/lib/python3.13/site-packages
当前工作目录: /path/to/project
本文件: /path/to/project/subjects/demo.py`,
          tip: `不要用 [[sys.path.insert(0, ...)]] 解决所有导入问题；它会让路径依赖运行时状态，测试和部署时容易失效。`
        },
        {
          h: "循环导入：不是删掉一行就能解决",
          p: `A 导入 B，B 又导入 A，就叫循环导入。轻则 [[ImportError: cannot import name ... from partially initialized module]]，重则拿到一个只初始化了一半的模块对象，属性缺失。

根因通常不是「Python 不支持互相引用」，而是模块在导入阶段就需要对方的完整对象。比如 [[a.py]] 顶层 [[from b import B]]，而 [[b.py]] 顶层又 [[from a import A]]；执行到一半，A 还没定义完，B 就来拿，当然拿不到。

修复思路有三个：第一，把共享的基类、常量、类型抽到第三个模块 [[common.py]]，两边都依赖它；第二，把导入移到函数内部，延迟到调用时；第三，改成 [[import b]] 而不是 [[from b import B]]，通过属性访问，避免在导入阶段取具体名字。最根本的修复是重新划分依赖方向：底层模块不要反向依赖上层模块。`,
          code: String.raw`# 错误示例：a.py 和 b.py 在顶层互相 from import
# a.py
from b import make_b

class A:
    pass

def make_a():
    return A()

# b.py
from a import A

def make_b():
    return A()

# 运行 import a 时，b 需要 a.A，而 a 还没执行到 class A`,
          output: `ImportError: cannot import name 'A' from partially initialized module 'a'`,
          tip: `循环导入是结构信号：要么抽出 common 层，要么把导入延迟到函数里；不要靠调整 import 顺序碰运气。`
        },
        {
          h: "标准库不是一张清单，而是一组常用入口",
          p: `初学者常问「标准库有哪些模块」，这个问题没有可操作答案：标准库有几百个模块，全背下来没有意义。更实用的做法是按任务找入口：处理路径用 [[pathlib]]，处理日期用 [[datetime]]，处理计数用 [[collections.Counter]]，处理组合迭代用 [[itertools]]，处理高阶函数用 [[functools]]，处理随机用 [[random]]，处理 JSON 用 [[json]]。

这一节先建立「任务 → 模块」的索引习惯。比如「我要统计词频」，先想到 [[Counter]]；「我要把两个列表拼成笛卡尔积」，先想到 [[itertools.product]]；「我要缓存函数结果」，先想到 [[functools.lru_cache]]。知道入口之后，再查具体签名，而不是从模块列表第一页开始翻。

标准库的优势是稳定、无第三方依赖、跨平台；劣势是有些 API 偏底层、错误信息不够友好。先用标准库把问题跑通，再考虑第三方库，是更稳的顺序。`,
          code: String.raw`from collections import Counter
from itertools import product
from functools import lru_cache
from pathlib import Path
from datetime import date

print(Counter("banana").most_common(2))
print(list(product([1, 2], "ab")))
print(Path("data/scores.csv").suffix)
print(date(2026, 11, 24).isoformat())

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)

print(fib(10))`,
          output: `[('a', 3), ('n', 2)]
[(1, 'a'), (1, 'b'), (2, 'a'), (2, 'b')]
.csv
2026-11-24
55`,
          tip: `先按任务记入口，再查签名；不要背模块清单。[[Counter]]、[[product]]、[[lru_cache]] 是三个最值得先熟悉的工具。`
        },
        {
          h: "动手实验：把成绩脚本拆成模块",
          p: `拿第一篇的成绩摘要脚本做一次真正的拆分：[[scores.py]] 只负责解析和计算，[[report.py]] 只负责格式化输出，[[main.py]] 负责串起来。要求：导入 [[scores.py]] 时不打印任何东西；计算函数接受字符串列表并返回结构化记录；[[report.py]] 不直接读文件。

这个实验的重点不是代码量，而是边界。[[scores.py]] 不知道输出格式，[[report.py]] 不知道数据来源，[[main.py]] 才知道「从哪个文件读、输出到屏幕还是文件」。这样以后换数据源或换输出格式，只改一层。

完成后用 [[python -m]] 和直接运行两种方式各跑一次，观察 [[__name__]]、[[sys.path]] 和导入结果的变化。`,
          code: String.raw`# scores.py
def parse_line(line):
    name, *raw_scores = [part.strip() for part in line.split(",")]
    scores = [float(x) for x in raw_scores if x]
    return {"name": name, "scores": scores}

def average(record):
    return sum(record["scores"]) / len(record["scores"])

# report.py
def format_record(record):
    return f'{record["name"]}: {average(record):.1f}'

# main.py
from scores import parse_line
from report import format_record

raw = "林晓, 91, 88.5, 79"
record = parse_line(raw)
print(format_record(record))`,
          output: `林晓: 86.2`,
          tip: `拆分模块的判断标准是「谁需要知道这件事」；[[scores.py]] 不应该知道终端宽度，[[report.py]] 不应该知道文件名。`
        }
      ],
      points: [
        "import 做三件事：查找模块、执行顶层代码、把模块对象绑定到名字。",
        "from m import name 仍然会加载整个模块，只是少了一个前缀。",
        "sys.modules 缓存保证模块只加载一次，模块级状态因此是进程级共享的。",
        "循环导入优先用 common 层或延迟导入解决，不要靠调整顺序。",
        "标准库按任务记入口：Counter、product、lru_cache、Path、date。"
      ],
      practice: "把第一篇的 `score_report.py` 拆成 `scores.py`、`report.py`、`main.py` 三个文件；要求导入任一无副作用，并写出每个文件的职责一句话。"
    },
    {
      id: "ch8-2",
      title: "8.2 包、__init__.py 与绝对导入",
      minutes: 40,
      lead: "当模块多到一个文件夹放不下，就需要包。包不是「带 __init__.py 的目录」这么简单：它决定导入路径、公开 API、资源位置和测试方式。这一节用一个成绩包把结构立起来。",
      source: "Introducing Python 3rd · Ch.12–13；Beginning Python 4th · Ch.10；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "包是目录，但导入的是包对象",
          p: `一个包本质上是一个带 [[__init__.py]] 的目录（命名空间包可以没有，但先不展开）。[[import scores]] 导入的是包对象 [[scores]]，不是目录里的所有文件。包对象也有命名空间，[[scores.parse]] 取决于 [[__init__.py]] 是否把 [[parse]] 暴露出来。

目录结构决定了模块的完整名字。[[scores/parse.py]] 的模块名是 [[scores.parse]]，不是 [[parse]]；[[scores/io/csv.py]] 是 [[scores.io.csv]]。名字里的点对应目录层级，所以「移动文件」就是「改模块名」，所有导入都要跟着改。

[[__init__.py]] 可以为空，也可以做三件事：定义包的公开 API、执行必要的初始化、设置 [[__all__]]。不要把重逻辑塞进 [[__init__.py]]，否则任何子模块导入都会触发它。`,
          code: String.raw`# 结构
# scores/
#   __init__.py
#   parse.py
#   report.py
#
# __init__.py
from .parse import parse_line
from .report import format_record

__all__ = ["parse_line", "format_record"]

# main.py
import scores
print(scores.parse_line("林晓, 91, 88.5"))
print(scores.format_record({"name": "林晓", "scores": [91, 88.5]}))`,
          output: `{'name': '林晓', 'scores': [91.0, 88.5]}
林晓: 89.8`,
          tip: `[[__init__.py]] 只做「公开什么」和「轻量初始化」；重逻辑放子模块，避免导入包就触发一堆副作用。`
        },
        {
          h: "绝对导入与相对导入：什么时候用哪个",
          p: `绝对导入从项目根开始写完整路径，例如 [[from scores.parse import parse_line]]；相对导入从当前包出发，例如 [[from .parse import parse_line]]、[[from ..common import load]]。PEP 8 的建议是优先绝对导入，因为它不依赖当前模块在包里的位置，重构时更稳定。

相对导入适合「包内部互相引用」，尤其是包可能被整体改名或移动时。但它只能在包内使用：直接运行 [[python scores/parse.py]] 时，[[__package__]] 是空的，相对导入会报 [[ImportError: attempted relative import with no known parent package]]。正确运行方式是 [[python -m scores.parse]]，或者从项目根运行入口脚本。

还有一点：[[from . import parse]] 导入的是子模块对象，[[from .parse import parse_line]] 导入的是函数。两者都能用，但前者保留命名空间，后者更短。团队要统一一种，别在同一包里混着写。`,
          code: String.raw`# scores/parse.py
def parse_line(line):
    name, *raw = [x.strip() for x in line.split(",")]
    return {"name": name, "scores": [float(x) for x in raw if x]}

# scores/report.py
from .parse import parse_line

def preview(line):
    record = parse_line(line)
    return f'{record["name"]}: {len(record["scores"])} 项'

# 从项目根运行：
# python -m scores.report`,
          output: `林晓: 3 项`,
          tip: `直接运行包内文件会破坏相对导入；用 [[python -m 包.模块]]，并在项目根执行。`
        },
        {
          h: "公开 API：__all__ 与下划线约定",
          p: `包应该给外部一个稳定的公开 API，而不是让调用方随便钻到子模块里。常见做法是在 [[__init__.py]] 里重新导出核心名字，并用 [[__all__]] 声明 [[from scores import *]] 时到底导出什么。

[[__all__]] 不影响 [[import scores]] 后能访问什么，它只影响星号导入和文档工具。真正的「私有」约定是前导下划线：[[_parse_raw]] 表示内部使用，[[parse_line]] 表示公开。下划线不是强制访问控制，但它是一个清晰的社会契约。

公开 API 要少而稳。你把 [[scores._parse_raw]] 暴露出去，外部代码就会依赖它；以后改内部实现就会破坏兼容。相反，如果只公开 [[parse_line]]，内部换成正则、换 [[csv]] 模块都不影响调用方。`,
          code: String.raw`# scores/__init__.py
from .parse import parse_line as _parse_line

__all__ = ["parse"]

def parse(line):
    """公开入口：未来可以换内部实现而不破坏调用方。"""
    return _parse_line(line)

# main.py
from scores import parse
print(parse("周宁, 86, 92"))

import scores
print(scores._parse_line("林晓, 91"))  # 能访问，但不承诺稳定`,
          output: `{'name': '周宁', 'scores': [86.0, 92.0]}
{'name': '林晓', 'scores': [91.0]}`,
          tip: `[[__all__]] 是声明，不是权限；真正稳定的是你承诺的公开名字，内部名字用下划线并准备随时改。`
        },
        {
          h: "命名空间包：没有 __init__.py 的目录",
          p: `PEP 420 引入了命名空间包：一个没有 [[__init__.py]] 的目录也可以被导入，多个分布可以把同一个包的不同部分拼在一起。典型场景是插件生态，例如 [[myapp.plugins]] 由多个第三方包共同贡献子模块。

命名空间包让「可拆分的大包」成为可能，但也带来调试难度：[[myapp.plugins]] 可能来自三个不同的 [[site-packages]] 目录，[[__file__]] 是 [[None]]。如果只是普通项目，别为了省一个空文件就用命名空间包；显式的 [[__init__.py]] 更容易排查。

判断是否需要：如果你要把一个包拆成多个独立发布的分发，并且希望它们共享同一个顶层命名空间，才考虑；否则用普通包。`,
          code: String.raw`# 普通包
# myapp/__init__.py
# myapp/core.py

# 命名空间包
# myapp/              <- 没有 __init__.py
# myapp/core.py
# 另一个 site-packages 里也可以有 myapp/extra.py

import myapp
print(myapp.__file__)  # 普通包是路径；命名空间包可能是 None`,
          output: `None`,
          tip: `命名空间包的 [[__file__]] 可能是 [[None]]；没有插件拆分需求时，用普通包更省心。`
        },
        {
          h: "包内资源：不要用相对路径猜当前目录",
          p: `包经常需要读取模板、CSV、图标等资源文件。用 [[open("data.csv")]] 依赖当前工作目录，换一个启动目录就崩。正确做法是用 [[importlib.resources]] 按包定位资源，或者用 [[Path(__file__).parent]] 拼出包目录。

[[importlib.resources.files("scores") / "data" / "sample.csv"]] 返回一个可读路径/句柄，打包成 zip 后也能工作。[[Path(__file__).with_name("sample.csv")]] 适合普通源码目录，但打包后 [[__file__]] 可能指向压缩包内部，不一定可读。

原则：资源属于包，就用包的定位方式；资源属于用户数据，就用显式配置路径或命令行参数。不要把两者混在一起。`,
          code: String.raw`from importlib.resources import files
from pathlib import Path

resource = files("scores").joinpath("data/sample.csv")
print(resource)
print(resource.read_text(encoding="utf-8").splitlines()[:2])

here = Path(__file__).resolve().parent
print(here / "data" / "sample.csv")`,
          output: `/path/to/scores/data/sample.csv
['name,score', '林晓,91']
/path/to/scores/data/sample.csv`,
          tip: `包资源用 [[importlib.resources]]；用户数据用配置/参数。[[open("相对路径")]] 只适合「当前目录就是数据目录」的脚本。`
        },
        {
          h: "包结构常见错误：能导入，但一运行就崩",
          p: `最常见的三个结构错误：第一，包目录和模块同名，例如 [[scores.py]] 与 [[scores/]] 并存，导入结果取决于路径顺序；第二，[[__init__.py]] 里导入子模块，子模块又反过来导入包，形成循环；第三，测试文件放在包目录里，被当成模块导入，测试运行器又把项目根插到路径最前面，导致导入到另一份代码。

排查顺序：打印 [[module.__file__]] 确认导入的是哪份；打印 [[sys.path]] 确认根目录；用 [[python -m pytest]] 从项目根运行，避免测试文件被当作脚本。结构上，测试目录和源码目录分开，源码放 [[src/]] 或包目录，入口放 [[main.py]]。

包结构不是审美问题。它决定导入解析、测试隔离、打包内容，早点立规矩比后期搬家便宜。`,
          code: String.raw`# 推荐的最小结构
# project/
#   pyproject.toml
#   src/
#     scores/
#       __init__.py
#       parse.py
#       report.py
#   tests/
#     test_parse.py
#   README.md

# 从 project 根运行：
# python -m pytest
# python -m scores.report`,
          output: `tests/test_parse.py ....  [100%]`,
          tip: `源码放 [[src/]]、测试放 [[tests/]]，从项目根用 [[python -m]] 运行；不要在同一目录同时放 [[scores.py]] 和 [[scores/]]。`
        },
        {
          h: "动手实验：把成绩包跑成模块",
          p: `创建 [[scores/]] 包，包含 [[parse.py]]、[[report.py]]、[[__init__.py]] 和 [[data/sample.csv]]。要求：[[from scores import parse]] 可用；直接运行 [[python -m scores.report]] 能输出示例；从其他目录启动也能读到资源文件；[[__init__.py]] 不打印任何东西。

做完后故意把 [[parse.py]] 移到 [[scores/io/parse.py]]，观察哪些导入需要改。这个动作会让你真正理解「模块名就是路径」。`,
          code: String.raw`# scores/__init__.py
from .parse import parse_line

__all__ = ["parse_line"]

# scores/report.py
from .parse import parse_line

def main():
    print(parse_line("林晓, 91, 88.5"))

if __name__ == "__main__":
    main()

# 终端
# python -m scores.report`,
          output: `{'name': '林晓', 'scores': [91.0, 88.5]}`,
          tip: `包内入口也要写 [[if __name__ == "__main__"]]；[[python -m]] 运行时 [[__name__]] 是 [["__main__"]]，不是包名。`
        }
      ],
      points: [
        "包是带 __init__.py 的目录，模块名由目录层级决定。",
        "优先绝对导入；包内相对导入只在 python -m 方式下可靠。",
        "__init__.py 负责公开 API 和轻量初始化，不放大逻辑。",
        "__all__ 只影响星号导入，不是访问控制。",
        "包资源用 importlib.resources，别依赖当前工作目录。"
      ],
      practice: "搭一个 `scores` 包：`__init__.py` 只导出 `parse_line`，`report.py` 提供 `main()`；用 `python -m scores.report` 跑通，并解释为什么不能直接 `python scores/report.py`。"
    },
    {
      id: "ch8-3",
      title: "8.3 venv、pip 与标准库导航",
      minutes: 40,
      lead: "依赖管理不是「pip install 一下」：它决定你的项目半年后还能不能复现。这一节从虚拟环境开始，讲到 requirements、pyproject 和标准库入口，最后做一个可复现的环境清单。",
      source: "Introducing Python 3rd · Ch.13；Beginning Python 4th · Ch.10；Head First Python 3rd · Ch.3",
      sections: [
        {
          h: "为什么每个项目都要自己的虚拟环境",
          p: `系统 Python 的 [[site-packages]] 是全局的。项目 A 需要 [[requests 2.28]]，项目 B 需要 [[requests 2.32]]，全局只能装一个版本；升级 B 就可能弄坏 A。虚拟环境的作用是给每个项目一套独立的解释器链接和 [[site-packages]]，让依赖互不干扰。

[[venv]] 是标准库自带的方案，不依赖第三方工具。它在项目目录下创建一个包含 [[bin/python]]、[[lib/python3.x/site-packages]] 的文件夹；激活后，[[python]] 和 [[pip]] 指向这个环境。删除整个文件夹就卸载了环境，不会污染系统。

虚拟环境不是「必须提交到 Git」的东西。它包含本机路径和二进制，应该写进 [[.gitignore]]；需要提交的是依赖声明文件，让别人能重建环境。`,
          code: String.raw`# 在项目根创建环境
python3 -m venv .venv

# macOS / Linux 激活
source .venv/bin/activate

# Windows PowerShell
# .venv\Scripts\Activate.ps1

python -c "import sys; print(sys.prefix)"
pip --version`,
          output: `/path/to/project/.venv
pip 25.2 from /path/to/project/.venv/lib/python3.13/site-packages/pip (python 3.13)`,
          tip: `[[python3 -m venv .venv]] 用当前解释器创建环境；激活只是改 PATH，不是「安装了一个新 Python」。`
        },
        {
          h: "pip install 的三层：包、版本、来源",
          p: `[[pip install requests]] 做三件事：解析依赖、下载 wheel/sdist、把包放进当前环境的 [[site-packages]]。默认来源是 PyPI，但企业环境可能配置镜像或私有索引。安装前先确认 [[pip --version]] 指向的是虚拟环境，否则会把包装到系统里。

版本约束有几种写法：[[requests==2.32.3]] 精确锁定；[[requests>=2.28,<3]] 允许小版本升级；[[requests~=2.32.0]] 允许补丁级升级。生产环境通常要精确锁定，开发环境可以放宽。不要同时写 [[==]] 和 [[>=]] 互相矛盾的约束。

安装依赖时优先用 [[requirements.txt]] 记录直接依赖，再用 [[pip freeze]] 生成完整锁定清单。直接依赖是你主动选择的，锁定清单包含所有传递依赖；两者用途不同，不要混成一份。`,
          code: String.raw`# requirements.txt
requests>=2.28,<3
flask==3.1.0

# 安装
python -m pip install -r requirements.txt

# 查看当前环境
python -m pip list
python -m pip show requests

# 生成完整锁定（包含传递依赖）
python -m pip freeze > requirements.lock`,
          output: `Successfully installed Flask-3.1.0 requests-2.32.3 ...
Name: requests
Version: 2.32.3
Location: /path/to/project/.venv/lib/python3.13/site-packages`,
          tip: `用 [[python -m pip]] 而不是裸 [[pip]]，能确保调用的是当前解释器对应的 pip。`
        },
        {
          h: "pyproject.toml：项目元数据与依赖声明",
          p: `[[requirements.txt]] 只表达「装什么」，[[pyproject.toml]] 还能表达「这个项目是什么、怎么构建、有哪些可选依赖、入口命令叫什么」。PEP 621 把项目元数据标准化，现代 Python 项目通常以它为主。

最小配置包含 [[[project]]] 的 name、version、requires-python、dependencies；构建后端用 [[[build-system]]] 指定。可选依赖放 [[[project.optional-dependencies]]]，例如 [[dev]] 组放 pytest、ruff。这样安装时可以用 [[pip install -e ".[dev]"]]。

[[-e]] 是 editable 安装：把项目以「开发模式」装进环境，修改源码立即生效，不需要每次重装。做库开发时几乎必备；做单文件脚本时不一定需要。`,
          code: String.raw`[project]
name = "scores"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = ["requests>=2.28,<3"]

[project.optional-dependencies]
dev = ["pytest>=8", "ruff>=0.8"]

[project.scripts]
scores-report = "scores.report:main"

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"`,
          output: `$ pip install -e ".[dev]"
Successfully installed scores-0.1.0 pytest-8.3.4 ruff-0.8.4`,
          tip: `[[[project.scripts]]] 把函数变成命令行命令；函数必须是不带参数的入口，参数用 [[argparse]] 在函数内部解析。`
        },
        {
          h: "依赖冲突：不是所有红字都要升级",
          p: `[[pip]] 报 [[ResolutionImpossible]] 时，通常不是某个包坏了，而是两个包对同一个依赖的版本要求没有交集。比如 A 要求 [[urllib3<2]]，B 要求 [[urllib3>=2]]，无论装哪个版本都会让一方不满足。

处理顺序：先看完整错误里的「which requires」链，找到冲突的两个直接依赖；再判断能否放宽其中一个的版本约束；最后才考虑升级/降级。不要看到红字就 [[pip install --upgrade]] 全部包，这会把可复现环境变成碰运气。

[[pip check]] 可以检查已安装包之间的依赖是否一致；[[pipdeptree]] 能打印依赖树，但它是第三方工具。没有工具时，[[pip show]] 和错误链已经够用。`,
          code: String.raw`python -m pip check
# 示例输出
# package-a 1.0 requires urllib3<2, but you have urllib3 2.2.2
# package-b 2.0 requires urllib3>=2, but you have urllib3 1.26.20

# 查看某个包的依赖
python -m pip show package-a`,
          output: `package-a 1.0 requires urllib3<2, but you have urllib3 2.2.2
package-b 2.0 requires urllib3>=2, but you have urllib3 1.26.20`,
          tip: `冲突时先找「谁要求了什么」，再决定放宽哪一边；不要用 [[--force-reinstall]] 掩盖依赖不一致。`
        },
        {
          h: "标准库导航：按任务找到入口",
          p: `这一节把常用标准库压成一张「任务 → 模块」表。文本处理：[[re]]、[[string]]、[[textwrap]]；路径与文件：[[pathlib]]、[[os]]、[[shutil]]、[[tempfile]]；日期时间：[[datetime]]、[[zoneinfo]]；数据格式：[[json]]、[[csv]]、[[sqlite3]]；集合与迭代：[[collections]]、[[itertools]]、[[functools]]；并发：[[threading]]、[[multiprocessing]]、[[asyncio]]；网络：[[urllib.request]]、[[http.client]]；调试：[[logging]]、[[traceback]]、[[pdb]]。

不要一次学完。正确的用法是遇到任务先查表，选一个入口，读官方文档的「函数/类」段，跑最小例子。标准库文档很干，但准确；第三方教程可能漏掉版本差异。

这一章只需要记住三个最常用的：[[pathlib.Path]] 处理路径，[[datetime]] 处理时间，[[collections]] 处理计数/默认字典/双端队列。其余等用到再查。`,
          code: String.raw`from collections import Counter, defaultdict, deque
from pathlib import Path
from datetime import datetime, timedelta

print(Counter(["A", "B", "A"]))
d = defaultdict(list)
d["林晓"].append(91)
print(dict(d))
q = deque([1, 2, 3], maxlen=3)
q.append(4)
print(list(q))
print(Path("/tmp") / "scores.csv")
print((datetime(2026, 11, 24) + timedelta(days=7)).date())`,
          output: `Counter({'A': 2, 'B': 1})
{'林晓': [91]}
[2, 3, 4]
/tmp/scores.csv
2026-12-01`,
          tip: `[[deque(maxlen=3)]] 满了会自动从左边丢；[[defaultdict(list)]] 访问不存在的键会自动建空列表。`
        },
        {
          h: "配置、密钥与环境变量",
          p: `代码里不要写数据库密码、API key。常见做法是读环境变量，本地开发用 [[.env]] 文件加载，生产环境由部署平台注入。标准库 [[os.environ]] 足够读取；[[python-dotenv]] 只是把 [[.env]] 读进环境变量，不是必须。

原则：配置和代码分离；密钥不进 Git；默认值只给非敏感项；缺少必需配置时尽早失败，并给出清晰错误。不要用 [[os.getenv("DB_PASSWORD", "123456")]] 这种默认密码，它会把配置错误变成 silently wrong。

[[.env]] 要写进 [[.gitignore]]，并提供 [[.env.example]] 说明需要哪些键、格式是什么。部署时用平台 secrets，不要提交文件。`,
          code: String.raw`import os
from pathlib import Path

def require_env(name):
    value = os.environ.get(name)
    if not value:
        raise RuntimeError(f"缺少环境变量：{name}")
    return value

# .env.example
# SCORES_DB=data/scores.db
# SCORES_TOKEN=change-me

db_path = Path(os.environ.get("SCORES_DB", "data/scores.db"))
token = require_env("SCORES_TOKEN")
print(db_path, bool(token))`,
          output: `data/scores.db True`,
          tip: `密钥不要有默认值；非敏感配置可以给默认值。缺配置时抛错，比运行到一半才失败更好。`
        },
        {
          h: "动手实验：做一份可复现的环境清单",
          p: `在一个新目录创建 [[.venv]]，安装 [[requests]] 和 [[pytest]]，写 [[requirements.txt]] 只列直接依赖，再生成 [[requirements.lock]]。然后删除环境，按 lock 重建，确认 [[pip check]] 通过。

最后写一个 [[README]] 的三行「如何运行」：创建环境、安装依赖、运行命令。要求别人只读这三行就能跑起来。`,
          code: String.raw`python3 -m venv .venv
source .venv/bin/activate
python -m pip install -U pip
python -m pip install requests pytest
python -m pip freeze > requirements.lock
python -m pip check
deactivate
rm -rf .venv
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.lock
python -m pip check`,
          output: `No broken requirements found.`,
          tip: `锁文件要提交，虚拟环境不要提交；重建后跑 [[pip check]]，确认依赖树没有缺口。`
        }
      ],
      points: [
        "每个项目独立 venv，删除环境文件夹即可清理。",
        "直接依赖写 requirements/pyproject，完整锁定用 pip freeze。",
        "pyproject.toml 表达元数据、可选依赖和命令行入口。",
        "依赖冲突先读「谁要求了什么」，不要盲目升级全部包。",
        "标准库按任务记入口：Path、datetime、collections 先用熟。"
      ],
      practice: "建一个带 `pyproject.toml` 的 `scores` 项目，配置 `scores-report` 命令；在全新 venv 中 `pip install -e .` 后直接运行该命令，并提交 `requirements.lock`。"
    }
  ]
});

/* --- ch9.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch9",
  part: 2,
  number: "09",
  title: "文件、CSV/JSON、异常与调试",
  summary: "真实数据不在列表里，而在文件、编码和坏行里。这一章把 pathlib、文本/二进制、CSV/JSON、异常链、日志和调试连成一条数据清洗链路，让你能定位「为什么读进来是乱码 / 为什么少了一行」。",
  goals: [
    "能用 pathlib 安全地拼路径、遍历目录、读写文本",
    "能区分文本模式与二进制模式，正确处理 UTF-8/BOM/换行",
    "能用 csv 和 json 处理真实数据，不手写 split",
    "能设计具体异常捕获、异常链和资源清理",
    "能用 logging 和 traceback 定位线上问题"
  ],
  lessons: [
    {
      id: "ch9-1",
      title: "9.1 pathlib、文本文件与二进制文件",
      minutes: 45,
      lead: "文件操作最容易「在我机器上能跑」。路径拼错、编码不对、换行不同、文件没关，都会在换一台机器后爆发。这一节先把路径和读写模式钉死，再谈业务。",
      source: "Introducing Python 3rd · Ch.16；Beginning Python 4th · Ch.8、11；Head First Python 3rd · Ch.1–3",
      sections: [
        {
          h: "路径不是字符串拼接，Path 才是对象",
          p: `用 [["data/" + name]] 拼路径，在 Windows 上会遇到反斜杠、盘符和保留字符；用 [[os.path.join]] 好一些，但它仍然是字符串。[[pathlib.Path]] 把路径变成对象，[[/]] 运算符负责拼接，[[.parent]]、[[.stem]]、[[.suffix]]、[[.name]] 负责拆解。

[[Path("data") / "scores.csv"]] 会根据当前系统生成正确分隔符；[[Path("data/scores.csv").resolve()]] 变成绝对路径并解析 [[..]]；[[.exists()]]、[[.is_file()]]、[[.is_dir()]] 用来判断类型。注意 [[resolve()]] 默认要求路径存在（[[strict=False]] 时不一定），不要在文件尚未创建时用它做唯一判断。

路径对象可以直接传给 [[open()]]、[[shutil]]、[[subprocess]]，不需要再转字符串。把「路径字符串」换成「Path 对象」是文件代码现代化的第一步。`,
          code: String.raw`from pathlib import Path

base = Path("data")
file = base / "scores.csv"
print(file)
print(file.name, file.stem, file.suffix)
print(file.parent)
print(file.resolve())
print(file.exists(), file.is_file())`,
          output: `data/scores.csv
scores.csv scores .csv
data
/path/to/project/data/scores.csv
False False`,
          tip: `[[Path("a") / "b"]] 比 [[os.path.join("a","b")]] 更安全；[[.suffix]] 只返回最后一个后缀，[[.suffixes]] 才返回全部。`
        },
        {
          h: "文本模式与二进制模式：你读到的到底是什么",
          p: `[[open(path, "r")]] 是文本模式：文件被解码成 [[str]]，换行按平台转换。[[open(path, "rb")]] 是二进制模式：读到 [[bytes]]，不做解码，也不转换换行。[[open(path, "r", encoding="utf-8")]] 明确指定编码，是文本模式最该养成的习惯。

文本模式适合 CSV、JSON、日志、Markdown；二进制模式适合图片、压缩包、PDF，或者你需要自己控制解码的场景。用文本模式读图片会得到一堆不可打印字符，甚至直接报解码错误；用二进制模式读 CSV 再 [[.decode()]]，则要自己处理 BOM 和换行。

还有一个参数 [[newline]]。文本模式默认把 [[\r\n]] 和 [[\r]] 都转成 [[\n]]，写回时再按平台转换。如果你要保留原样（例如处理 CSV 的引号内换行），用 [[newline=""]]，把换行交给 [[csv]] 模块处理。`,
          code: String.raw`from pathlib import Path

p = Path("demo.txt")
p.write_text("第一行\n第二行\n", encoding="utf-8")

print(p.read_text(encoding="utf-8").splitlines())
print(p.read_bytes()[:20])

with open(p, "rb") as f:
    print(f.read(6))`,
          output: `['第一行', '第二行']
b'\xe5\x85\x85...'
b'\xe5\x85\x85\xe5\x85\x85'`,
          tip: `文本模式一定写 [[encoding="utf-8"]]；二进制模式不要写 encoding，读到的是 [[bytes]]。`
        },
        {
          h: "读文件：read、readline、迭代，选一个不爆内存的",
          p: `[[read()]] 一次读全部内容，适合小文件；[[readline()]] 读一行；[[for line in f]] 逐行迭代，是最常用的流式写法；[[readlines()]] 把所有行装进列表，大文件会占内存。

判断标准是「文件可能多大」。配置、模板、几 MB 的 JSON 可以 [[read()]]；日志、CSV、几十万行数据必须逐行。逐行迭代时，行尾的 [[\n]] 还在，需要 [[strip()]] 或 [[rstrip("\n")]]；但 [[strip()]] 会同时去掉行首空格，如果空格有意义，用 [[rstrip]]。

文件对象是上下文管理器，[[with open(...) as f]] 退出时自动关闭，即使中途抛异常。不要依赖垃圾回收关闭文件；在 Windows 上，未关闭的文件会导致无法删除/重命名。`,
          code: String.raw`from pathlib import Path

p = Path("scores.txt")
p.write_text("林晓,91\n周宁,86\n", encoding="utf-8")

with p.open(encoding="utf-8") as f:
    for lineno, line in enumerate(f, 1):
        print(lineno, repr(line.rstrip("\n")))

# 小文件才这样
lines = p.read_text(encoding="utf-8").splitlines()
print(lines)`,
          output: `1 '林晓,91'
2 '周宁,86'
['林晓,91', '周宁,86']`,
          tip: `[[for line in f]] 是流式的；[[readlines()]] 会把整个文件装进内存。大文件不要用后者。`
        },
        {
          h: "写文件：覆盖、追加与原子写",
          p: `[[open(path, "w")]] 会截断原文件再写；[[open(path, "a")]] 追加到末尾；[[open(path, "x")]] 要求文件不存在，存在就抛 [[FileExistsError]]。写文本同样要指定编码，否则使用平台默认编码，换机器可能变乱码。

「读-改-写」要小心：如果直接 [[open(path, "w")]] 再写，程序崩溃会留下半个文件。更稳的做法是写临时文件，成功后用 [[Path.replace()]] 原子替换。[[tempfile.NamedTemporaryFile]] 或同目录的 [[.tmp]] 文件都可以，关键是临时文件和目标在同一文件系统。

追加模式适合日志，但并发写入需要锁或交给日志库；多个进程同时 [[open(..., "a")]] 不保证行级原子性。业务数据不要用追加模式做「更新」。`,
          code: String.raw`from pathlib import Path
import os

target = Path("report.txt")
tmp = target.with_suffix(".tmp")

tmp.write_text("新内容\n", encoding="utf-8")
os.replace(tmp, target)
print(target.read_text(encoding="utf-8"))

with target.open("a", encoding="utf-8") as f:
    f.write("追加一行\n")
print(target.read_text(encoding="utf-8"))`,
          output: `新内容
新内容
追加一行`,
          tip: `[[os.replace()]] 在同一文件系统内是原子的；跨盘替换可能退化为复制+删除，不是原子操作。`
        },
        {
          h: "编码、BOM 与换行：三个看不见的坑",
          p: `UTF-8 是最通用的文本编码，但「UTF-8」和「UTF-8 with BOM」不是一回事。BOM 是文件头的 [[\ufeff]]，Windows 工具常加；Python 用 [[encoding="utf-8"]] 读时，BOM 会留在第一个字符串里，导致 [[name == "林晓"]] 为假。用 [[utf-8-sig]] 读写会自动去掉/加上 BOM。

换行也有坑。Unix 用 [[\n]]，Windows 用 [[\r\n]]；文本模式默认帮你转换，但 CSV 的引号内换行、正则的 [[$]] 锚点、逐行统计都可能被转换影响。需要原样处理时用 [[newline=""]] 或二进制模式。

排查编码问题，先看 [[repr(line)]] 的前几个字符，再看 [[file -I]] 或 [[chardet]] 的猜测。不要用 [[errors="ignore"]] 掩盖，它会把坏字节静默删掉，数据看起来「成功」了，其实少了内容。`,
          code: String.raw`from pathlib import Path

p = Path("bom.csv")
p.write_text("\ufeffname,score\n林晓,91\n", encoding="utf-8")

raw = p.read_text(encoding="utf-8")
print(repr(raw[:12]))
print(raw.splitlines()[0].startswith("\ufeff"))

clean = p.read_text(encoding="utf-8-sig")
print(repr(clean[:8]))`,
          output: `'\ufeffname,score'
True
'name,sc'`,
          tip: `处理 Windows 导出的 CSV，优先用 [[encoding="utf-8-sig"]]；如果 BOM 已经进了字段，用 [[lstrip("\ufeff")]] 清掉。`
        },
        {
          h: "目录遍历：glob、rglob 与排序",
          p: `[[Path.glob("*.csv")]] 只匹配当前目录，[[rglob("*.csv")]] 递归匹配子目录。返回的是生成器，文件多时不会一次性占内存。遍历结果顺序依赖文件系统，不要假设「按名称排序」；需要稳定顺序就显式 [[sorted(..., key=...)]]。

遍历时要跳过隐藏文件、临时文件、输出目录，否则可能把 [[.DS_Store]] 或 [[.tmp]] 当数据。用 [[.name.startswith(".")]] 过滤，或把输出目录排除。还要注意符号链接导致的循环，[[rglob]] 默认不跟随目录符号链接，但 [[os.walk(followlinks=True)]] 会。

批量处理文件的标准写法是「先收集路径，再排序，再逐个处理」，不要在处理过程中边遍历边改目录结构。`,
          code: String.raw`from pathlib import Path

root = Path("data")
root.mkdir(exist_ok=True)
(root / "a.csv").write_text("x,1\n", encoding="utf-8")
(root / "sub").mkdir(exist_ok=True)
(root / "sub" / "b.csv").write_text("y,2\n", encoding="utf-8")

files = sorted(root.rglob("*.csv"), key=lambda p: str(p))
for p in files:
    print(p.relative_to(root), p.stat().st_size)`,
          output: `a.csv 4
sub/b.csv 4`,
          tip: `[[rglob]] 返回生成器；要稳定顺序就 [[sorted()]]，要相对路径就 [[relative_to()]]，不要手工切字符串。`
        },
        {
          h: "动手实验：把一份乱码 CSV 读干净",
          p: `构造一个带 BOM、空行、全角空格、坏行的 CSV，用 [[pathlib]] 读入，逐行打印 [[repr]]，再写一个清洗函数返回 [[{"name": str, "score": float}]]。要求：坏行不静默丢弃，收集行号和原因；输出统一 UTF-8；写回时用原子替换。

这个实验的验收标准不是「跑通」，而是「换一个目录、换一个平台、换一个编码仍能解释发生了什么」。`,
          code: String.raw`from pathlib import Path

raw = "\ufeff 林晓 , 91 \n\n 周宁 ,abc\n"
p = Path("messy.csv")
p.write_text(raw, encoding="utf-8")

good, bad = [], []
for lineno, line in enumerate(p.read_text(encoding="utf-8-sig").splitlines(), 1):
    if not line.strip():
        continue
    parts = [x.strip().replace("\u3000", " ") for x in line.split(",")]
    try:
        good.append({"name": parts[0], "score": float(parts[1])})
    except (IndexError, ValueError) as err:
        bad.append((lineno, line, str(err)))

print(good)
print(bad)`,
          output: `[{'name': '林晓', 'score': 91.0}]
[(3, ' 周宁 ,abc', "could not convert string to float: 'abc'")]`,
          tip: `清洗结果要同时保留 [[good]] 和 [[bad]]；只返回好行，会让「少了谁」永远查不出来。`
        }
      ],
      points: [
        "路径用 Path 对象和 / 运算符，不用字符串拼接。",
        "文本模式写 encoding，二进制模式读 bytes，不混用。",
        "逐行迭代适合大文件，readlines 只适合小文件。",
        "读改写用临时文件 + os.replace 做原子替换。",
        "BOM 用 utf-8-sig，换行需要原样时用 newline=''。"
      ],
      practice: "写一个 `clean_csv(path) -> (records, errors)`：跳过空行、去 BOM、把全角空格转半角；坏行记录行号和异常原因，最后把 records 原子写回新文件。"
    },
    {
      id: "ch9-2",
      title: "9.2 CSV、JSON 与结构化数据",
      minutes: 45,
      lead: "CSV 不是「用逗号 split」，JSON 也不是「看起来像字典的字符串」。这一节讲两种格式的边界、编码、流式处理和真实坏数据，让你不再被引号、BOM 和嵌套字段坑住。",
      source: "Introducing Python 3rd · Ch.16；Beginning Python 4th · Ch.8、11；Head First Python 3rd · Ch.1–3、9",
      sections: [
        {
          h: "CSV 是一种格式，不是字符串切分",
          p: `CSV 的字段里可以包含逗号、引号、换行；用 [[line.split(",")]] 处理，遇到 [[\"林晓, 男\",91]] 就会多出一列。标准库 [[csv]] 处理引号转义、字段内逗号、换行，是唯一正确的起点。

读 CSV 有两种方式：[[csv.reader]] 返回列表，适合列位置固定的数据；[[csv.DictReader]] 返回字典，适合有表头、列顺序可能变化的数据。写用 [[csv.writer]] / [[csv.DictWriter]]，记得 [[newline=""]]，否则 Windows 上会多出空行。

CSV 没有类型：所有字段都是字符串。数字、日期、空值都要自己转换；空字符串和 [[None]] 的区别要明确。表头也可能有 BOM、空格、大小写差异，读入后先规范化。`,
          code: String.raw`import csv, io

text = 'name,score,note\n"林晓, 男",91,"第一行\n第二行"\n周宁,86,\n'
rows = list(csv.DictReader(io.StringIO(text)))
print(rows)
print(rows[0]["note"].splitlines())`,
          output: `[{'name': '林晓, 男', 'score': '91', 'note': '第一行\\n第二行'}, {'name': '周宁', 'score': '86', 'note': ''}]
['第一行', '第二行']`,
          tip: `[[csv.reader]] 的每一格都是字符串；空字段是 [[""]]，不是 [[None]]。需要数字就显式 [[int()/float()]]。`
        },
        {
          h: "DictReader/DictWriter：按列名处理更稳",
          p: `真实 CSV 的列顺序常变。[[DictReader]] 用表头做键，代码读 [[row["score"]]] 而不是 [[row[1]]]，列插入/调序不会静默错位。[[DictWriter]] 用 [[fieldnames]] 控制输出列，[[extrasaction="raise"]] 能在多出字段时直接报错。

写 CSV 时先决定列集合，再写表头。不要让 [[DictWriter]] 从第一行猜字段，否则第二行多一个键就会报 [[ValueError]]。缺字段用 [[restval=""]] 补，多字段用 [[extrasaction]] 控制。

表头本身也要清洗：去 BOM、去空格、统一小写。表头是数据契约的一部分，不要用「看起来一样」来判断。`,
          code: String.raw`import csv, io

src = "name,score\n林晓,91\n周宁,86\n"
reader = csv.DictReader(io.StringIO(src))
records = [{"name": r["name"], "score": int(r["score"])} for r in reader]

out = io.StringIO()
writer = csv.DictWriter(out, fieldnames=["name", "score", "grade"], restval="")
writer.writeheader()
for r in records:
    writer.writerow({**r, "grade": "A" if r["score"] >= 90 else "B"})
print(out.getvalue())`,
          output: `name,score,grade
林晓,91,A
周宁,86,B
`,
          tip: `[[DictWriter]] 要显式 [[fieldnames]]；[[restval]] 补缺失列，[[extrasaction="raise"]] 防止多字段悄悄丢。`
        },
        {
          h: "JSON 的类型映射与坑",
          p: `JSON 只有对象、数组、字符串、数字、布尔和 null。Python 的 [[dict]] 对应对象，[[list]] 对应数组，[[str]] 对应字符串，[[int/float]] 对应数字，[[True/False]] 对应 true/false，[[None]] 对应 null。[[tuple]] 会被转成数组，[[datetime]] 不能直接序列化。

[[json.loads]] 把字符串变对象，[[json.dumps]] 把对象变字符串；[[json.load/dump]] 直接读写文件。[[ensure_ascii=False]] 让中文不被转成 [[\\uXXXX]]，[[indent=2]] 让输出可读，[[sort_keys=True]] 让 diff 稳定。

反序列化时，JSON 对象键永远是字符串。你写 [[{1: "a"}]]，[[dumps]] 后变成 [["1"]]，再 [[loads]] 得到 [[{"1": "a"}]]，不是原来的 int 键。需要保留类型，就在应用层转换。`,
          code: String.raw`import json
from datetime import datetime

data = {"name": "林晓", "scores": [91, 88.5], "active": True, "note": None}
text = json.dumps(data, ensure_ascii=False, indent=2)
print(text)

back = json.loads(text)
print(back["scores"], type(back["scores"][0]))

print(json.dumps({1: "a"}))
print(json.dumps({"when": datetime(2026, 11, 24)}))`,
          output: `{
  "name": "林晓",
  "scores": [
    91,
    88.5
  ],
  "active": true,
  "note": null
}
[91, 88.5] <class 'int'>
{"1": "a"}
TypeError: Object of type datetime is not JSON serializable`,
          tip: `JSON 对象的键只能是字符串；日期用 [[.isoformat()]] 转字符串，读回时再 [[datetime.fromisoformat()]]。`
        },
        {
          h: "JSONL：一行一个对象，适合日志和大数据",
          p: `JSONL（JSON Lines）每行是一个独立 JSON 对象，文件整体不是合法 JSON 数组。优点是追加方便、可以逐行流式读、坏一行不影响其他行；缺点是不能直接 [[json.load]] 整个文件。

写 JSONL 时每个对象 [[dumps]] 后加 [[\n]]，确保 [[ensure_ascii=False]] 和 [[separators=(",", ":")]] 减少体积。读时逐行 [[loads]]，坏行记录行号继续，不要因为一行损坏丢掉整个文件。

CSV 适合表格，JSONL 适合事件/日志/嵌套对象。选择标准是「数据是否天然等宽」：等宽表格用 CSV，事件流用 JSONL。`,
          code: String.raw`import json
from pathlib import Path

p = Path("events.jsonl")
rows = [{"id": 1, "name": "林晓"}, {"id": 2, "name": "周宁"}]
with p.open("w", encoding="utf-8") as f:
    for row in rows:
        f.write(json.dumps(row, ensure_ascii=False) + "\n")

for lineno, line in enumerate(p.open(encoding="utf-8"), 1):
    print(lineno, json.loads(line)["name"])`,
          output: `1 林晓
2 周宁`,
          tip: `JSONL 不要写成 JSON 数组；每行独立解析，才能追加和断点续读。`
        },
        {
          h: "编码与 BOM：读 CSV/JSON 前的第一道检查",
          p: `CSV 可能来自 Excel，默认带 BOM；JSON 规范要求 UTF-8，但 Windows 工具也可能加 BOM。[[json.loads]] 对 BOM 会报 [[Unexpected UTF-8 BOM]]，需要先 [[lstrip("\ufeff")]] 或用 [[utf-8-sig]] 读文件。

CSV 的 [[newline=""]] 不是可有可无：不加时，[[csv]] 可能把字段内换行拆成两行，或者写入时多出空行。读文件时传 [[newline=""]]，把换行处理交给 csv 模块。

还有一个常见问题：[[open(..., encoding="utf-8")]] 读 GBK 文件会报 [[UnicodeDecodeError]]。确认来源编码，或者用 [[errors="replace"]] 做初步观察，但不要用它做正式导入。`,
          code: String.raw`import csv, json
from pathlib import Path

p = Path("bom.json")
p.write_text("\ufeff{\"name\": \"林晓\"}", encoding="utf-8")

try:
    json.loads(p.read_text(encoding="utf-8"))
except json.JSONDecodeError as err:
    print(type(err).__name__, err)

print(json.loads(p.read_text(encoding="utf-8-sig")))

with p.open(encoding="utf-8-sig", newline="") as f:
    print(f.readline().strip())`,
          output: `JSONDecodeError Unexpected UTF-8 BOM (decode using utf-8-sig): line 1 column 1 (char 0)
{'name': '林晓'}
﻿{"name": "林晓"}`,
          tip: `JSON 读文件用 [[utf-8-sig]] 兼容 BOM；CSV 读文件同时加 [[newline=""]]，否则字段内换行会被拆开。`
        },
        {
          h: "动手实验：把 CSV 转成 JSONL",
          p: `读入一个成绩 CSV，转成 JSONL，要求：数值字段转 [[int/float]]，空值转 [[None]]，表头去 BOM/空格，坏行记录行号；输出每行一个对象，中文不转义。

验收时用 [[wc -l]] 数行数，用 [[json.loads]] 逐行解析，确认没有一行失败；再拿第一行和源 CSV 对照字段。`,
          code: String.raw`import csv, json, io

src = "\ufeffname, score, note\n林晓,91,\n周宁,abc,补考\n"
reader = csv.DictReader(io.StringIO(src.lstrip("\ufeff")))
good, bad = [], []
for lineno, row in enumerate(reader, 2):
    clean = {k.strip().lower(): (v.strip() if isinstance(v, str) else v) for k, v in row.items()}
    try:
        good.append({"name": clean["name"], "score": float(clean["score"]), "note": clean["note"] or None})
    except (TypeError, ValueError) as err:
        bad.append((lineno, clean, str(err)))

for item in good:
    print(json.dumps(item, ensure_ascii=False))
print("bad", bad)`,
          output: `{"name": "林晓", "score": 91.0, "note": null}
bad [(3, {'name': '周宁', 'score': 'abc', 'note': '补考'}, "could not convert string to float: 'abc'")]`,
          tip: `[[csv.DictReader]] 的 [[lineno]] 从 2 开始（表头占 1 行）；报错行号要按数据文件的实际行号解释。`
        }
      ],
      points: [
        "CSV 必须用 csv 模块处理引号、逗号和字段内换行。",
        "DictReader/DictWriter 用列名而不是位置，列顺序变化更安全。",
        "JSON 只支持有限类型，datetime 要手动转 ISO 字符串。",
        "JSONL 一行一个对象，适合流式和追加。",
        "BOM 用 utf-8-sig，CSV 读文件加 newline=''。"
      ],
      practice: "写 `csv_to_jsonl(src, dst)`：清洗表头、转换数值、空值转 null、坏行收集到 `errors.jsonl`；输出后用逐行 `json.loads` 验证全部可解析。"
    },
    {
      id: "ch9-3",
      title: "9.3 异常、异常链与资源清理",
      minutes: 45,
      lead: "异常不是「程序坏了」，而是函数在说「这个输入我处理不了」。这一节讲 try/except/else/finally 的真实分工、异常链怎么保留根因、自定义异常怎么设计，以及 with 为什么能保证清理。",
      source: "Introducing Python 3rd · Ch.20；Beginning Python 4th · Ch.8、11；Head First Python 3rd · Ch.2–3",
      sections: [
        {
          h: "traceback 从下往上读：最后一行才是错误类型",
          p: `Python 报错时打印的是调用栈：最上面是入口，最下面才是实际出错的位置和异常类型。初学者常盯着第一行 [[Traceback (most recent call last)]]，其实应该先看最后一行 [[ValueError: ...]]，再看它上面一行的文件/行号。

一个异常对象包含类型、消息、traceback 和 [[__cause__]]/[[__context__]]。[[type(err).__name__]] 给类型名，[[str(err)]] 给消息，[[err.args]] 给参数元组。日志里只记录 [[str(err)]] 会丢掉堆栈，应该用 [[logger.exception]] 或 [[traceback.format_exc()]]。

不要把异常当成字符串拼接。捕获后要么处理，要么加上下文再抛出，不要 [[print(err)]] 后继续执行，那会让调用方以为成功了。`,
          code: String.raw`import traceback

def parse_score(text):
    return int(text)

try:
    parse_score("abc")
except ValueError as err:
    print("类型:", type(err).__name__)
    print("消息:", str(err))
    print("参数:", err.args)
    print("堆栈尾部:")
    print(traceback.format_exc().splitlines()[-1])`,
          output: `类型: ValueError
消息: invalid literal for int() with base 10: 'abc'
参数: ("invalid literal for int() with base 10: 'abc'",)
堆栈尾部:
ValueError: invalid literal for int() with base 10: 'abc'`,
          tip: `日志记录异常用 [[logger.exception(...)]]，不要只记 [[str(err)]]；后者没有行号和调用链。`
        },
        {
          h: "try/except/else/finally 各管什么",
          p: `[[try]] 里只放可能出错的代码；[[except]] 捕获并处理；[[else]] 在 try 没有异常时执行；[[finally]] 无论是否异常都执行。else 的价值是把「成功后的逻辑」移出 try，避免它抛出的异常被同一个 except 误捕。

finally 适合释放资源、恢复状态、写收尾日志，但它不能 [[return]] 掉一个正在传播的异常（会吞掉异常）。如果 finally 里再抛异常，原异常会变成 [[__context__]]，最终抛的是 finally 的新异常。

最常用的结构是：try 做转换，except 捕获具体错误并加行号，else 追加结果，finally 关闭资源。不要一个 try 包住 50 行代码，捕获范围越大，越容易掩盖真正的 bug。`,
          code: String.raw`def parse(text):
    events = []
    try:
        value = int(text)
    except ValueError as err:
        events.append(("error", str(err)))
    else:
        events.append(("ok", value))
    finally:
        events.append(("finally", None))
    return events

print(parse("91"))
print(parse("abc"))`,
          output: `[('ok', 91), ('finally', None)]
[('error', "invalid literal for int() with base 10: 'abc'"), ('finally', None)]`,
          tip: `[[else]] 里的代码不属于 try 的保护范围；把成功逻辑放 else，能避免被同一个 except 误捕。`
        },
        {
          h: "捕获具体异常，不要裸 except",
          p: `[[except:]] 会捕获 [[BaseException]]，包括 [[KeyboardInterrupt]]、[[SystemExit]]，让程序无法正常退出；[[except Exception:]] 好一些，但仍然太宽，会把 [[TypeError]]、[[AttributeError]] 这些编程错误一起吞掉。

应该捕获你真正能处理的异常：解析数字捕 [[ValueError]]，读文件捕 [[OSError]]/[[FileNotFoundError]]，取字典键捕 [[KeyError]]，网络请求捕具体库的超时异常。捕获后要么给出有意义的恢复，要么加上下文重新抛出。

「捕获所有异常然后记录日志继续跑」在批处理里可以接受，但要保证单条失败不影响其他条，并且最终报告失败数量。不能把「继续跑」当成「问题已解决」。`,
          code: String.raw`def safe_int(text, default=None):
    try:
        return int(text)
    except (TypeError, ValueError):
        return default

print(safe_int("91"))
print(safe_int("abc", 0))
print(safe_int(None, -1))`,
          output: `91
0
-1`,
          tip: `只捕获你能处理的异常；[[except Exception]] 只适合最外层兜底，并且必须记录完整堆栈。`
        },
        {
          h: "raise from：保留根因，而不是制造新谜团",
          p: `底层抛 [[ValueError]]，上层想抛业务异常 [[ScoreError]]，直接 [[raise ScoreError("分数非法")]] 会让调用方只看到新异常，原始 traceback 丢失。用 [[raise ScoreError(...) from err]] 把原异常挂到 [[__cause__]]，traceback 会显示「The above exception was the direct cause of the following exception」。

[[from None]] 是相反操作：故意隐藏底层异常，适合「这个内部异常对调用方没有意义」的场景，但会丢失调试信息，慎用。

异常链不是装饰。它让日志同时保留「业务语义」和「技术根因」，线上排错时能一路追到原始行号。`,
          code: String.raw`class ScoreError(Exception):
    pass

def parse_score(text):
    try:
        value = int(text)
    except ValueError as err:
        raise ScoreError(f"分数不是整数：{text!r}") from err
    if not 0 <= value <= 100:
        raise ScoreError(f"分数越界：{value}")
    return value

try:
    parse_score("abc")
except ScoreError as err:
    print(type(err).__name__, err)
    print("cause:", type(err.__cause__).__name__, err.__cause__)`,
          output: `ScoreError 分数不是整数：'abc'
cause: ValueError invalid literal for int() with base 10: 'abc'`,
          tip: `[[raise ... from err]] 保留根因；[[from None]] 是故意隐藏，只在底层异常确实无信息时使用。`
        },
        {
          h: "自定义异常：继承谁、带什么字段",
          p: `自定义异常通常继承 [[Exception]]，不要继承 [[BaseException]]。异常类名用 [[Error]] 结尾，消息要能直接读懂；需要结构化字段时，在 [[__init__]] 里保存，并调用 [[super().__init__(message)]]。

不要为每个小错误建一个异常类。一个模块一层业务异常足够，例如 [[ScoreError]] 表示「成绩数据不合法」；具体原因放在消息或字段里。异常类太多会让调用方不知道该捕哪个。

异常也应该有稳定契约：调用方可以依赖类型和字段，而不是依赖消息文本。消息可以改，类型和字段不要随便改。`,
          code: String.raw`class ScoreError(Exception):
    def __init__(self, message, *, line=None, value=None):
        super().__init__(message)
        self.line = line
        self.value = value

try:
    raise ScoreError("分数越界", line=3, value=120)
except ScoreError as err:
    print(err, err.line, err.value)
    print(isinstance(err, Exception))`,
          output: `分数越界 3 120
True`,
          tip: `异常字段用关键字参数保存；消息给人看，字段给程序判断，不要让调用方正则解析消息。`
        },
        {
          h: "with 与上下文管理器：清理不靠运气",
          p: `[[with open(...) as f]] 能保证文件关闭，即使中间抛异常。原理是上下文管理器协议：进入时调用 [[__enter__]]，退出时调用 [[__exit__]]，异常会传给 [[__exit__]]；返回 [[True]] 可以吞掉异常，返回 [[False]]/[[None]] 继续传播。

自己写资源类时，[[__exit__]] 要负责释放，并不要吞掉异常。可以用 [[contextlib.contextmanager]] 把「yield 前获取、yield 后释放」写成生成器，代码更短。

注意：[[with]] 只保证退出时执行，不保证对象一定构造成功；如果 [[__enter__]] 抛异常，[[__exit__]] 不会执行。资源获取失败的处理要放在 with 外面。`,
          code: String.raw`from contextlib import contextmanager

@contextmanager
def opened(path):
    print("open", path)
    f = open(path, encoding="utf-8")
    try:
        yield f
    finally:
        f.close()
        print("close", path)

with opened("demo.txt") as f:
    print(f.read().strip())
raise RuntimeError("after with")`,
          output: `open demo.txt
hello
close demo.txt
Traceback (most recent call last):
RuntimeError: after with`,
          tip: `[[@contextmanager]] 的 [[yield]] 前是获取、后是释放，释放必须放 [[finally]]，否则异常时不会执行。`
        }
      ],
      points: [
        "traceback 从下往上读，最后一行是异常类型，上面是出错行号。",
        "try 范围要小，成功逻辑放 else，清理放 finally。",
        "捕获具体异常，别用裸 except 吞掉 KeyboardInterrupt。",
        "raise ... from err 保留根因，from None 才是故意隐藏。",
        "with 依赖 __enter__/__exit__，资源释放放 finally。"
      ],
      practice: "给 `parse_score` 设计 `ScoreError(message, line, value)`：底层 ValueError 用 `raise ... from` 包装，批处理时收集每条错误，最后输出成功/失败数量和前三条错误。"
    },
    {
      id: "ch9-4",
      title: "9.4 日志、断言与调试",
      minutes: 45,
      lead: "print 能告诉你「到这里了」，但不能告诉你「谁调的、什么级别、线上怎么过滤」。这一节把 logging、traceback、pdb 和断言串成一套可用的排错流程。",
      source: "Introducing Python 3rd · Ch.20；Beginning Python 4th · Ch.8、16；Head First Python 3rd · Ch.9",
      sections: [
        {
          h: "print 的边界：临时观察可以，线上排错不够",
          p: `print 是同步的、无级别的、不能按模块过滤，也不能输出到文件/收集系统。它适合本地快速看一个值；一旦要回答「哪个模块在什么时候打了这条」「线上为什么没有这条」，就需要 logging。

logging 的核心概念：logger（按模块命名）、handler（输出到控制台/文件/网络）、formatter（格式）、level（DEBUG/INFO/WARNING/ERROR/CRITICAL）。日志会沿 logger 层级向上传播，子 logger 默认交给父 logger 处理。

最小可用配置是 [[logging.basicConfig(level=logging.INFO, format=...)]][[。库代码不要调用 basicConfig，应该 [[logger = logging.getLogger(__name__)]]，把配置交给应用入口。`,
          code: String.raw`import logging

logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger("scores.parse")

logger.debug("开始解析")
logger.info("解析 2 行")
logger.warning("跳过空行")
logger.error("分数非法")`,
          output: `2026-11-24 10:00:00,123 DEBUG scores.parse: 开始解析
2026-11-24 10:00:00,124 INFO scores.parse: 解析 2 行
2026-11-24 10:00:00,124 WARNING scores.parse: 跳过空行
2026-11-24 10:00:00,124 ERROR scores.parse: 分数非法`,
          tip: `库代码只 [[getLogger(__name__)]]，不配 handler；配置由应用入口统一做，避免重复输出。`
        },
        {
          h: "级别不是装饰：DEBUG/INFO/WARNING/ERROR 各给谁看",
          p: `DEBUG 给开发者看细节，INFO 记录正常关键事件，WARNING 表示「还能继续但需要注意」，ERROR 表示「当前操作失败」，CRITICAL 表示「整个程序不可用」。级别选错会让日志要么淹没，要么漏掉关键信息。

一个实用规则：正常启动、请求完成、批处理数量用 INFO；可恢复的坏数据用 WARNING；单条记录失败但批处理继续用 ERROR 并计数；数据库连不上、配置缺失用 CRITICAL。不要把每条循环都打 INFO。

日志消息要带上下文：哪个文件、哪一行、哪个 id、哪个值。不要只写「解析失败」，那等于没写。`,
          code: String.raw`import logging
logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
log = logging.getLogger("import")

for lineno, line in enumerate(["林晓,91", "", "周宁,abc"], 1):
    if not line:
        log.warning("第 %s 行是空行，跳过", lineno)
        continue
    try:
        name, score = line.split(",")
        int(score)
    except ValueError:
        log.error("第 %s 行分数非法：%r", lineno, line)`,
          output: `WARNING 第 2 行是空行，跳过
ERROR 第 3 行分数非法：'周宁,abc'`,
          tip: `用 [[%s]] 懒格式化，只有该级别启用时才拼字符串；不要在日志里做昂贵计算。`
        },
        {
          h: "日志文件、轮转与异常堆栈",
          p: `生产环境通常要写文件并按大小/时间轮转，否则日志会把磁盘写满。[[logging.handlers.RotatingFileHandler]] 按大小切分，[[TimedRotatingFileHandler]] 按时间切分。文件编码用 UTF-8，避免中文乱码。

记录异常要用 [[logger.exception("...")]]，它等价于 [[logger.error(..., exc_info=True)]]，会附加完整 traceback。不要在 except 里只 [[logger.error(str(err))]]，那会丢掉行号。

多进程写同一个日志文件需要额外处理（如 [[QueueHandler]] 或交给系统日志）；多线程 logging 本身是线程安全的，但 handler 的轮转不是完全无锁。`,
          code: String.raw`import logging
from logging.handlers import RotatingFileHandler

handler = RotatingFileHandler("app.log", maxBytes=1_000_000, backupCount=3, encoding="utf-8")
handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
logger = logging.getLogger("scores")
logger.addHandler(handler)
logger.setLevel(logging.INFO)

try:
    1 / 0
except ZeroDivisionError:
    logger.exception("计算失败")`,
          output: `2026-11-24 10:00:00,123 ERROR 计算失败
Traceback (most recent call last):
  File "demo.py", line 9, in <module>
    1 / 0
ZeroDivisionError: division by zero`,
          tip: `[[logger.exception]] 只能在 except 块里用；它自动带 [[exc_info=True]]，比手拼堆栈可靠。`
        },
        {
          h: "pdb/breakpoint：在真实运行时停下来",
          p: `[[breakpoint()]] 是 Python 3.7+ 的内置调试入口，默认调用 [[pdb.set_trace()]]。程序会在这里暂停，进入交互式调试器。常用命令：[[n]] 下一行，[[s]] 进入函数，[[c]] 继续，[[p 变量]] 打印，[[pp 变量]] 美化打印，[[l]] 看周围代码，[[q]] 退出。

pdb 适合「我知道大概哪一段，但不知道变量为什么是这个值」。不适合大范围性能问题，也不适合远程线上（除非用远程调试器）。调试完记得删掉 [[breakpoint()]]，不要提交。

在 pytest 里可以用 [[--pdb]] 在失败时进入调试器；在 Jupyter/IDE 里有图形化断点，本质一样。`,
          code: String.raw`def average(scores):
    total = sum(scores)
    breakpoint()  # 到这里暂停，检查 scores/total
    return total / len(scores)

print(average([88, 92, 79]))

# pdb 交互示例
# (Pdb) p scores
# [88, 92, 79]
# (Pdb) p total
# 259
# (Pdb) c`,
          output: `> demo.py(3)average()
-> return total / len(scores)
(Pdb) 259 / 3
86.33333333333333`,
          tip: `[[breakpoint()]] 默认受 [[PYTHONBREAKPOINT]] 环境变量控制；生产环境设为 0 可禁用。`
        },
        {
          h: "断言不是异常处理：它检查「不该发生」",
          p: `[[assert condition, message]] 在条件为假时抛 [[AssertionError]]。它适合检查内部不变量、开发期契约，不适合处理用户输入或外部数据，因为 [[python -O]] 会移除 assert。

用户输入用显式 [[if ... raise ValueError]]；外部 API 返回值也用显式异常；只有「如果这里不成立，说明我的代码写错了」才用 assert。测试里的 [[assert]] 由 pytest 重写，能给出详细 diff，是另一套机制。

不要在 assert 里放有副作用的表达式，因为优化模式会跳过它。`,
          code: String.raw`def normalize(records):
    assert records, "records 不能为空"
    for r in records:
        assert "name" in r, r
    return [r["name"].strip() for r in records]

print(normalize([{"name": " 林晓 "}]))

try:
    normalize([])
except AssertionError as err:
    print("AssertionError:", err)`,
          output: `['林晓']
AssertionError: records 不能为空`,
          tip: `assert 只检查内部不变量；用户输入/外部数据用 [[raise ValueError]]，否则 [[python -O]] 会把检查删掉。`
        },
        {
          h: "时间测量与性能排查的最小工具",
          p: `排查「为什么慢」，先用 [[time.perf_counter()]] 包住可疑段，打印耗时；需要多次统计用 [[timeit]]；需要函数级分析用 [[cProfile]]。不要凭感觉优化，先测量。

[[cProfile]] 输出函数调用次数和累计耗时，[[pstats]] 可以排序。常见瓶颈是循环里的重复 IO、字符串拼接、正则重复编译、数据库 N+1 查询。先找最大项，再改。

日志里记录耗时要用结构化字段（操作名、耗时、记录数），不要只写「完成」。`,
          code: String.raw`import time

def work(n):
    return sum(i * i for i in range(n))

start = time.perf_counter()
result = work(1_000_000)
elapsed = time.perf_counter() - start
print(result, f"{elapsed:.3f}s")

# cProfile 示例
# python -m cProfile -s cumulative demo.py`,
          output: `333332833333500000 0.087s`,
          tip: `用 [[perf_counter()]] 而不是 [[time.time()]] 测短间隔；后者可能受系统时钟调整影响。`
        }
      ],
      points: [
        "库代码只 getLogger，应用入口统一配置 handler。",
        "日志级别按「谁需要看」选，消息必须带上下文。",
        "logger.exception 记录完整堆栈，只在 except 块里用。",
        "breakpoint()/pdb 适合检查运行时变量，不适合线上常驻。",
        "assert 检查内部不变量，用户输入用显式异常。"
      ],
      practice: "给 CSV 导入脚本加 logging：INFO 记录总数，WARNING 记录空行，ERROR 记录坏行并带行号；异常用 `logger.exception`，最后输出成功/失败统计。"
    }
  ]
});

/* --- ch10.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch10",
  part: 3,
  number: "10",
  title: "类、对象与组合",
  summary: "从「用字典装数据」升级到「用对象表达规则」。这一章讲类与实例、属性查找、self、dataclass 和组合，不急着讲继承；先把「一个对象该知道什么、该做什么」想清楚。",
  goals: [
    "能解释类属性与实例属性的区别和查找顺序",
    "能写出带校验、相等性和可读表示的 dataclass",
    "能用组合表达 Swimmer/Result 这种 has-a 关系",
    "能把散落的字典重构为有边界、可测试的对象"
  ],
  lessons: [
    {
      id: "ch10-1",
      title: "10.1 类、实例、属性与方法",
      minutes: 45,
      lead: "类不是「带函数的字典」，实例也不是「类的副本」。这一节从属性查找讲起，解释 self 到底是什么、类属性和实例属性为什么会互相遮蔽，最后用一个运动员类把概念落地。",
      source: "Introducing Python 3rd · Ch.11；Beginning Python 4th · Ch.7",
      sections: [
        {
          h: "类是一个命名空间，也是一个对象工厂",
          p: `[[class Swimmer: ...]] 执行时，Python 创建一个类对象，把类体里的函数、变量装进它的命名空间。类对象本身也是对象，可以赋值、可以传参、可以放在列表里。调用 [[Swimmer()]] 时，类对象创建一个实例，并调用 [[__init__]] 做初始化。

[[__init__]] 不是构造函数，实例在它之前已经由 [[__new__]] 创建。绝大多数情况不需要写 [[__new__]]；你只需要在 [[__init__]] 里给实例绑定初始属性。[[__init__]] 必须返回 [[None]]，返回其他值会报 [[TypeError]]。

类体里写的 [[def]] 是函数，绑定到实例后变成方法。方法的第一参数习惯叫 [[self]]，它不是关键字，只是「实例」的约定名。调用 [[s.speak()]] 时，Python 自动把 [[s]] 作为第一个参数传进去；直接 [[Swimmer.speak(s)]] 也可以，但不常用。`,
          code: String.raw`class Swimmer:
    team = "海豚队"

    def __init__(self, name, age):
        self.name = name
        self.age = age

    def label(self):
        return f"{self.name} / {self.age}"

s = Swimmer("林晓", 15)
print(Swimmer.team, s.team)
print(s.label())
print(type(Swimmer), type(s))
print(isinstance(s, Swimmer))`,
          output: `海豚队 海豚队
林晓 / 15
<class 'type'> <class '__main__.Swimmer'>
True`,
          tip: `[[__init__]] 只负责初始化，不负责创建；不要返回非 [[None]]，也不要把它当构造函数重载。`
        },
        {
          h: "self 是什么：绑定方法的一次搬运",
          p: `[[s.label()]] 不是「在类里找 label 然后调用」，而是先通过 [[s.label]] 得到一个绑定方法对象，这个对象里保存了 [[s]] 和函数 [[Swimmer.label]]；调用时把 [[s]] 作为第一个参数传进去。所以 [[self]] 就是「当前实例」。

这也解释了为什么方法定义要写 [[self]]，而调用不传：[[s.label()]] 等价于 [[Swimmer.label(s)]]。如果你把方法赋值给一个变量 [[f = s.label]]，[[f()]] 仍然绑定 [[s]]；如果 [[f = Swimmer.label]]，[[f()]] 就需要显式传实例。

[[self]] 不是保留字，你可以叫 [[this]]，但没人会这么做。保持 [[self]] 是团队可读性的一部分。`,
          code: String.raw`class Counter:
    def __init__(self):
        self.value = 0

    def add(self, n=1):
        self.value += n
        return self.value

c = Counter()
f = c.add
print(f(2), f(3))
print(Counter.add(c, 5))`,
          output: `2 5
10`,
          tip: `[[s.method]] 是绑定方法；[[Class.method]] 是普通函数，需要显式传实例。`
        },
        {
          h: "类属性与实例属性：查找顺序与遮蔽",
          p: `属性查找先看实例 [[__dict__]]，再看类 [[__dict__]]，再沿继承链向上。实例属性会遮蔽同名类属性；给实例赋值不会改类属性，但改类属性会影响所有没有同名实例属性的对象。

可变类属性是经典坑：[[class A: items = []]] 所有实例共享同一个列表，[[a.items.append(1)]] 会改到 [[A.items]] 和所有实例。正确做法是在 [[__init__]] 里 [[self.items = []]]]，每个实例一份。

类属性适合常量、默认配置、所有实例共享的只读值；实例属性适合每个对象独有的状态。判断标准是「这个值是否随对象变化」。`,
          code: String.raw`class Swimmer:
    team = "海豚队"
    tags = []

a = Swimmer()
b = Swimmer()
a.tags.append("MVP")
print(b.tags, Swimmer.tags)

a.team = "鲨鱼队"
print(a.team, b.team, Swimmer.team)`,
          output: `['MVP'] ['MVP']
鲨鱼队 海豚队 海豚队`,
          tip: `可变默认值不要放类属性；在 [[__init__]] 里创建，或者用 [[dataclass(default_factory=list)]]。`
        },
        {
          h: "dataclass：把样板代码交给装饰器",
          p: `手写 [[__init__]]、[[__repr__]]、[[__eq__]] 很枯燥，[[@dataclass]] 根据类型注解生成它们。默认 [[eq=True]]、[[repr=True]]；[[frozen=True]] 让实例不可变并可哈希；[[order=True]] 生成排序方法。

字段默认值有顺序限制：有默认值的字段不能排在无默认值字段前面。可变默认值必须用 [[field(default_factory=list)]]，不能直接 [[[]]]，否则所有实例共享同一个列表。

[[__post_init__]] 适合做校验或派生字段。它在 [[__init__]] 末尾调用，可以读所有字段。校验失败抛 [[ValueError]]，不要静默修正。`,
          code: String.raw`from dataclasses import dataclass, field

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float
    tags: tuple[str, ...] = field(default_factory=tuple)

    def __post_init__(self):
        if self.seconds <= 0:
            raise ValueError("seconds 必须为正")

r = Result("100m", 62.35)
print(r)
print(r == Result("100m", 62.35))
print(hash(r) == hash(Result("100m", 62.35)))`,
          output: `Result(event='100m', seconds=62.35, tags=())
True
True`,
          tip: `[[frozen=True]] 的 dataclass 才能安全当字典键；可变字段用 [[field(default_factory=...)]]。`
        },
        {
          h: "对象表示：__repr__ 给人看，__str__ 给用户看",
          p: `[[repr(obj)]] 的目标是「尽可能还原对象的调试信息」，[[str(obj)]] 的目标是「给最终用户看」。默认 [[repr]] 只显示内存地址，对调试没有帮助；dataclass 自动生成可读的 [[repr]]。

日志里应该用 [[%r]] 或 [[repr()]]，因为它能显示引号、换行、类型；面向用户的输出用 [[str()]]/f-string。不要在一个方法里同时承担两种职责。

[[__repr__]] 不应该有副作用，也不应该做昂贵计算。它可能被调试器、日志、异常信息随时调用。`,
          code: String.raw`class Swimmer:
    def __init__(self, name):
        self.name = name
    def __repr__(self):
        return f"Swimmer(name={self.name!r})"
    def __str__(self):
        return self.name

s = Swimmer("林晓")
print(str(s))
print(repr(s))
print([s])`,
          output: `林晓
Swimmer(name='林晓')
[Swimmer(name='林晓')]`,
          tip: `[[repr]] 用 [[!r]] 显示字段，日志才看得出字符串边界；[[str]] 给用户看，不要放调试细节。`
        },
        {
          h: "动手实验：把字典改成运动员对象",
          p: `拿第一篇的 [[{"name": ..., "scores": [...]}]] 改成 [[Swimmer]] 类：字段 name、scores；方法 [[average()]]、[[best()]]、[[add(score)]]；校验分数在 0–100；[[__repr__]] 可读。要求空分数时 [[average()]] 返回 [[None]] 而不是崩。

然后把原来的函数 [[average(record)]] 改成对象方法，观察调用点变化。重点不是「面向对象更高级」，而是「规则跟着数据走，调用方不用每次记得检查」。`,
          code: String.raw`class Swimmer:
    def __init__(self, name, scores=None):
        self.name = name
        self.scores = []
        for score in scores or []:
            self.add(score)

    def add(self, score):
        if not 0 <= score <= 100:
            raise ValueError(f"分数越界：{score}")
        self.scores.append(score)

    def average(self):
        return sum(self.scores) / len(self.scores) if self.scores else None

    def __repr__(self):
        return f"Swimmer({self.name!r}, {self.scores!r})"

s = Swimmer("林晓", [91, 88.5])
print(s, s.average())
try:
    s.add(120)
except ValueError as err:
    print(err)`,
          output: `Swimmer('林晓', [91, 88.5]) 89.75
分数越界：120`,
          tip: `校验放在 [[add]] 里，所有入口都经过它；不要指望调用方每次都记得检查范围。`
        }
      ],
      points: [
        "类对象和实例是两种对象；__init__ 只初始化，不创建。",
        "self 是绑定方法自动传入的当前实例。",
        "实例属性遮蔽类属性；可变类属性会被所有实例共享。",
        "dataclass 生成 init/repr/eq，frozen 还能哈希。",
        "repr 给调试，str 给用户，日志优先用 repr。"
      ],
      practice: "实现 `Swimmer(name, scores)`：`add` 校验 0–100，`average` 空列表返回 None，`best` 返回最高分；用 dataclass 版本再写一遍，比较两者差异。"
    },
    {
      id: "ch10-2",
      title: "10.2 组合：对象之间怎么「拥有」",
      minutes: 45,
      lead: "inheritance 不是默认答案。大多数业务关系是 has-a：一个运动员拥有多条成绩，一个队伍拥有多个运动员。这一节用组合把 Swimmer/Result/Team 搭起来，并讲清楚依赖注入和不可变对象。",
      source: "Introducing Python 3rd · Ch.11；Beginning Python 4th · Ch.7",
      sections: [
        {
          h: "组合与继承：先问「是什么」还是「有什么」",
          p: `继承表达 is-a：[[Dog]] 是一种 [[Animal]]；组合表达 has-a：[[Team]] 拥有多个 [[Swimmer]]，[[Swimmer]] 拥有多条 [[Result]]。业务系统里大多数关系是 has-a，因为「运动员」不是「成绩列表」，它只是拥有成绩。

组合的优点：边界清晰、替换容易、测试简单。你可以把 [[Team]] 的存储换成列表、数据库、API，只要接口不变。继承的优点：共享行为、利用多态；但继承会把父类的实现细节绑进子类，改父类容易伤子类。

判断方法：如果两个类的关系能用「是一个」造句且不别扭，才考虑继承；否则用组合。不要为了「代码看起来像面向对象」而继承。`,
          code: String.raw`from dataclasses import dataclass, field

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float

@dataclass
class Swimmer:
    name: str
    results: list[Result] = field(default_factory=list)

@dataclass
class Team:
    name: str
    swimmers: list[Swimmer] = field(default_factory=list)

team = Team("海豚队", [Swimmer("林晓", [Result("100m", 62.35)])])
print(team.swimmers[0].results[0].seconds)`,
          output: `62.35`,
          tip: `has-a 关系用组合；只有「是一种」且确实需要共享行为时才用继承。`
        },
        {
          h: "把集合本身做成对象：Team 的查询方法",
          p: `[[Team]] 不应该让调用方直接操作 [[team.swimmers]]。把常用查询封装成方法：[[add()]]、[[find(name)]]、[[best(event)]]、[[average(event)]]。这样以后换成数据库或缓存，调用方不用改。

方法要返回「业务结果」，不要返回内部结构。[[best(event)]] 返回 [[(swimmer, result)]] 或 [[None]]，而不是让调用方自己遍历。内部列表仍然可以公开读，但写操作走方法，保证校验和索引。

如果集合很大，可以在 [[add()]] 里维护索引字典；但不要过早优化。先保证接口清晰，再用性能测试决定是否加索引。`,
          code: String.raw`from dataclasses import dataclass, field

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float

@dataclass
class Swimmer:
    name: str
    results: list[Result] = field(default_factory=list)

@dataclass
class Team:
    name: str
    swimmers: list[Swimmer] = field(default_factory=list)

    def add(self, swimmer):
        if any(s.name == swimmer.name for s in self.swimmers):
            raise ValueError(f"重名：{swimmer.name}")
        self.swimmers.append(swimmer)

    def best(self, event):
        pairs = [(s, r) for s in self.swimmers for r in s.results if r.event == event]
        return min(pairs, key=lambda p: p[1].seconds) if pairs else None

team = Team("海豚队")
team.add(Swimmer("林晓", [Result("100m", 62.35)]))
team.add(Swimmer("周宁", [Result("100m", 60.88)]))
print(team.best("100m"))`,
          output: `(Swimmer(name='周宁', results=[Result(event='100m', seconds=60.88)]), Result(event='100m', seconds=60.88))`,
          tip: `集合的写操作走方法，读可以公开；不要在调用方到处 [[team.swimmers.append()]] 绕过校验。`
        },
        {
          h: "依赖注入：不要在对象里 new 全局资源",
          p: `如果 [[Team]] 的 [[__init__]] 里直接 [[sqlite3.connect("team.db")]]，测试就必须有数据库，换存储也必须改类。依赖注入是把「外部资源」作为参数传进来：[[Team(repo)]]，repo 可以是 SQLite、内存、假对象。

Python 没有接口强制，但可以用协议（[[typing.Protocol]]）描述 [[repo]] 需要哪些方法：[[load()]]、[[save()]]。测试传一个内存实现，生产传 SQLite 实现，[[Team]] 不关心区别。

不要注入太多。只注入「会变化的外部边界」：数据库、HTTP 客户端、时钟、随机源。纯函数和值对象直接创建就好。`,
          code: String.raw`class MemoryRepo:
    def __init__(self):
        self.rows = []
    def save(self, row):
        self.rows.append(row)
    def load(self):
        return list(self.rows)

class Team:
    def __init__(self, repo):
        self.repo = repo
    def add(self, name):
        self.repo.save({"name": name})

repo = MemoryRepo()
team = Team(repo)
team.add("林晓")
print(repo.load())`,
          output: `[{'name': '林晓'}]`,
          tip: `只注入会变化的外部边界；纯值对象直接创建，不要为了「设计模式」把简单代码复杂化。`
        },
        {
          h: "不可变对象：共享安全与可哈希",
          p: `[[frozen=True]] 的 dataclass 创建后不能改字段，适合 Result、配置、坐标这类值对象。不可变对象可以安全共享、可以当字典键、可以放进 set；多线程读也不需要锁。

不可变不等于「内部所有东西都不可变」。[[frozen]] 只阻止字段重新赋值；如果字段是列表，列表内容仍可改，对象也因此不可哈希。要真正不可变，字段也得用 tuple/frozenset/不可变对象。

需要「修改」时，用 [[dataclasses.replace(obj, seconds=...)]] 返回新对象，而不是原地改。这样旧对象仍然有效，适合撤销、历史记录、缓存键。`,
          code: String.raw`from dataclasses import dataclass, replace

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float

r1 = Result("100m", 62.35)
r2 = replace(r1, seconds=61.90)
print(r1, r2)
print({r1, r2})
try:
    r1.seconds = 60
except Exception as err:
    print(type(err).__name__)`,
          output: `Result(event='100m', seconds=62.35) Result(event='100m', seconds=61.9)
{Result(event='100m', seconds=62.35), Result(event='100m', seconds=61.9)}
FrozenInstanceError`,
          tip: `[[replace()]] 返回新对象；frozen 只防字段赋值，字段里的 list 仍可变，也就不可哈希。`
        },
        {
          h: "对象与 JSON：序列化边界放在哪一层",
          p: `把对象直接 [[json.dumps]] 会报 [[TypeError]]。常见做法是给对象加 [[to_dict()]]，或者用 [[dataclasses.asdict()]]。读回时用 [[from_dict()]] 做校验和类型转换。

边界原则：JSON 层只认基本类型；对象层负责业务规则。不要让 [[to_dict]] 里塞满业务判断，也不要让 [[from_dict]] 静默接受坏数据。转换函数应该是显式的、可测试的。

如果对象嵌套，[[asdict]] 会递归转成字典，但它也会把 tuple 转成 list、把自定义对象转成 dict。需要保留类型标记时，自己写转换，别依赖通用函数。`,
          code: String.raw`from dataclasses import dataclass, asdict
import json

@dataclass
class Result:
    event: str
    seconds: float

r = Result("100m", 62.35)
text = json.dumps(asdict(r), ensure_ascii=False)
print(text)

back = Result(**json.loads(text))
print(back, type(back.seconds))`,
          output: `{"event": "100m", "seconds": 62.35}
Result(event='100m', seconds=62.35) <class 'float'>`,
          tip: `[[asdict()]] 递归转基本类型；[[Result(**data)]] 只适合字段完全匹配且可信的数据，外部数据要先校验。`
        },
        {
          h: "动手实验：Team 查询与替换存储",
          p: `给 [[Team]] 加 [[average(event)]]、[[rank(event)]]、[[remove(name)]] 三个方法；把存储从内存换成 [[JsonRepo]]（读写 JSON 文件），要求 [[Team]] 的查询方法不变。最后写一个假 repo 测试 [[add]] 的重名校验，不碰真实文件。

验收标准：[[Team]] 里没有任何 [[open()]]/[[sqlite3]]/[[requests]]；所有外部读写都通过 repo。`,
          code: String.raw`class JsonRepo:
    def __init__(self, path):
        self.path = path
        self.rows = []
    def save(self, row):
        self.rows.append(row)
    def load(self):
        return list(self.rows)

class Team:
    def __init__(self, repo):
        self.repo = repo
        self.swimmers = repo.load()
    def add(self, name):
        if any(s["name"] == name for s in self.swimmers):
            raise ValueError("重名")
        self.swimmers.append({"name": name})
        self.repo.save({"name": name})

t = Team(JsonRepo("team.json"))
t.add("林晓")
print(t.repo.rows)`,
          output: `[{'name': '林晓'}]`,
          tip: `Team 只依赖 repo 的 load/save 协议；换文件/数据库/内存都不改查询逻辑。`
        }
      ],
      points: [
        "has-a 用组合，is-a 才用继承。",
        "集合对象封装写操作，调用方不直接 append。",
        "外部资源用依赖注入，测试可替换。",
        "frozen dataclass 可共享/可哈希，但字段也必须不可变。",
        "JSON 边界只放基本类型，转换函数显式可测。"
      ],
      practice: "设计 `Team` + `JsonRepo`：`Team` 不出现文件 API；`add` 校验重名；`best(event)` 返回最快成绩；用一个内存 repo 写单测。"
    },
    {
      id: "ch10-3",
      title: "10.3 对象建模实战：从散落字典到可测试模型",
      minutes: 45,
      lead: "真实项目里最乱的不是语法，而是数据形状：这个函数期望 `{\"name\": ..., \"score\": ...}`，那个函数期望 `{\"athlete\": ..., \"result\": ...}`。这一节用对象把数据契约固定下来，减少「传错键」的 bug。",
      source: "Introducing Python 3rd · Ch.11；Beginning Python 4th · Ch.7、9；Head First Python 3rd · Ch.5",
      sections: [
        {
          h: "字典当模型的三个问题",
          p: `字典灵活，但灵活意味着没有契约：键名拼错要到运行时才报；字段类型不一致（有时 int 有时 str）要到计算时才爆；校验逻辑散落在每个使用点，容易漏。

对象把契约写进类型和构造器：[[Result(event, seconds)]] 一创建就校验，字段名固定，IDE 能补全。调用方不用猜「是 [[score]] 还是 [[points]]」。这不是「面向对象更高级」，而是减少沟通成本。

不是所有字典都要变成类。配置、临时 JSON、函数返回值用字典很合理；当同一形状的数据在多个函数间反复传递、且有明确规则时，才值得建模。`,
          code: String.raw`# 之前：键名靠记忆
row = {"event": "100m", "seconds": 62.35}
print(row["secods"])  # KeyError

# 之后：构造时校验，字段固定
from dataclasses import dataclass

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float
    def __post_init__(self):
        if self.seconds <= 0:
            raise ValueError("seconds 必须为正")

r = Result("100m", 62.35)
print(r.seconds)`,
          output: `62.35`,
          tip: `同一形状的数据跨多个函数传递时才建模；一次性配置/响应继续用字典。`
        },
        {
          h: "值对象：相等性、哈希与排序",
          p: `值对象关心「值相等」，不关心「是不是同一个实例」。两个 [[Result("100m", 62.35)]] 应该相等，且能当字典键。dataclass 的 [[eq=True]] 和 [[frozen=True]] 正好提供这两点。

排序要显式定义：[[order=True]] 按字段顺序比较，可能不是你想要的（event 在前，先比项目名）。更稳的是 [[key=]] 函数：[[sorted(results, key=lambda r: r.seconds)]]。不要让默认排序决定业务语义。

浮点数比较要小心：[[62.35 == 62.3500000001]] 可能为 False。成绩比较用 [[round(seconds, 2)]] 或整数毫秒存储；金额用 [[Decimal]]，不要用 float。`,
          code: String.raw`from dataclasses import dataclass

@dataclass(frozen=True, order=True)
class Result:
    event: str
    seconds: float

rows = [Result("100m", 62.35), Result("50m", 30.12), Result("100m", 60.88)]
print(sorted(rows, key=lambda r: r.seconds))
print(Result("100m", 62.35) == Result("100m", 62.35))
print(len({Result("100m", 62.35), Result("100m", 62.35)}))`,
          output: `[Result(event='50m', seconds=30.12), Result(event='100m', seconds=60.88), Result(event='100m', seconds=62.35)]
True
1`,
          tip: `[[order=True]] 按字段声明顺序比较，业务排序用 [[key=]]；成绩/金额不要直接用 float 做精确相等。`
        },
        {
          h: "工厂方法：from_dict / from_row 放哪",
          p: `外部数据（JSON、CSV 行、数据库行）进来时，需要转换成对象。可以写类方法 [[Result.from_dict(data)]]，把字段映射、类型转换、默认值集中在一处。

工厂方法要做校验并给出上下文：哪一行、哪个字段、什么值。不要静默跳过坏行；返回 [[None]] 会让调用方到处判空，抛异常或返回 [[(obj, errors)]] 更明确。

[[from_row]] 适合数据库游标行，[[from_dict]] 适合 JSON。不要用一个万能 [[from_anything]]，类型分支会让代码更难读。`,
          code: String.raw`from dataclasses import dataclass

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float

    @classmethod
    def from_dict(cls, data):
        try:
            return cls(str(data["event"]).strip(), float(data["seconds"]))
        except (KeyError, TypeError, ValueError) as err:
            raise ValueError(f"坏记录 {data!r}: {err}") from err

print(Result.from_dict({"event": "100m", "seconds": "62.35"}))
try:
    Result.from_dict({"event": "100m", "seconds": "abc"})
except ValueError as err:
    print(err)`,
          output: `Result(event='100m', seconds=62.35)
坏记录 {'event': '100m', 'seconds': 'abc'}: could not convert string to float: 'abc'`,
          tip: `工厂方法集中做映射/校验，并用 [[raise ... from]] 保留原始错误；不要返回 None 让调用方猜。`
        },
        {
          h: "不可变模型的批量更新",
          p: `如果模型是 frozen，批量清洗不能原地改字段。用 [[dataclasses.replace]] 生成新对象，再组成新列表；原列表保持不变，方便对比「清洗前/清洗后」。

对于大列表，每次 replace 都创建新对象，内存开销增加；但值对象通常很小，可接受。真正的性能瓶颈在 IO 和解析，不在对象创建。先用清晰模型，再用 profiling 决定是否优化。

批量更新要保持顺序和身份：用 [[id]] 或业务主键关联新旧对象，不要靠列表下标猜。`,
          code: String.raw`from dataclasses import dataclass, replace

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float

rows = [Result("100m", 62.35), Result("50m", 0)]
clean = [replace(r, seconds=1.0) if r.seconds <= 0 else r for r in rows]
print(rows)
print(clean)`,
          output: `[Result(event='100m', seconds=62.35), Result(event='50m', seconds=0)]
[Result(event='100m', seconds=62.35), Result(event='50m', seconds=1.0)]`,
          tip: `frozen 模型批量修改用 [[replace]] 生成新列表；不要用 [[object.__setattr__]] 绕过不可变。`
        },
        {
          h: "用 Protocol 描述依赖，不引入继承",
          p: `[[typing.Protocol]] 可以描述「一个对象需要有哪些方法」，但不要求实际继承。比如 [[Repo]] 协议要求 [[load()]] 和 [[save()]]，内存实现、SQLite 实现都满足，静态检查器能验证。

Protocol 适合跨模块边界：服务层依赖 [[Repo]] 协议，测试传假实现，生产传真实现。它比抽象基类轻，不会把实现绑死。

不要给每个小函数都写 Protocol；只有当依赖对象在多个实现间切换、或需要静态检查时才用。运行时 [[isinstance]] 对 Protocol 默认不可用（除非 [[runtime_checkable]]），别把它当接口检查。`,
          code: String.raw`from typing import Protocol

class Repo(Protocol):
    def load(self) -> list[dict]: ...
    def save(self, row: dict) -> None: ...

class MemoryRepo:
    def __init__(self): self.rows = []
    def load(self): return list(self.rows)
    def save(self, row): self.rows.append(row)

def count(repo: Repo) -> int:
    return len(repo.load())

print(count(MemoryRepo()))`,
          output: `0`,
          tip: `Protocol 只描述结构，不强制继承；[[runtime_checkable]] 才能用于 isinstance，但有局限。`
        },
        {
          h: "动手实验：把成绩字典全面对象化",
          p: `拿一个包含 3 条成绩的 JSON，定义 [[Result]]、[[Swimmer]]、[[Team]] 三个模型；要求 [[Result.from_dict]] 校验正数，[[Swimmer.add]] 校验重复项目，[[Team.best]] 返回最快成绩。写三个测试：坏秒数、重复项目、空队伍。

最后统计：对象化后，调用方还需要记住哪些键名？如果答案是「不需要」，说明边界立住了。`,
          code: String.raw`from dataclasses import dataclass, field

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float
    def __post_init__(self):
        if self.seconds <= 0:
            raise ValueError("seconds 必须为正")

@dataclass
class Swimmer:
    name: str
    results: list[Result] = field(default_factory=list)
    def add(self, result):
        if any(r.event == result.event for r in self.results):
            raise ValueError("项目重复")
        self.results.append(result)

s = Swimmer("林晓")
s.add(Result("100m", 62.35))
print(s)
try:
    s.add(Result("100m", 61.0))
except ValueError as err:
    print(err)`,
          output: `Swimmer(name='林晓', results=[Result(event='100m', seconds=62.35)])
项目重复`,
          tip: `对象化成功的标志是调用方不再背键名；校验集中在构造器/方法里，不靠调用方自觉。`
        }
      ],
      points: [
        "同一形状数据跨多函数传递时才建模，不要把所有字典都类化。",
        "值对象用 frozen dataclass，相等性和哈希才有意义。",
        "业务排序用 key，不依赖 order 的字段顺序。",
        "工厂方法集中做映射和校验，错误带上下文。",
        "依赖用 Protocol 描述结构，不强制继承。"
      ],
      practice: "把一份成绩 JSON 转成 `Result`/`Swimmer`/`Team` 模型，写 3 个测试覆盖坏秒数、重复项目、空队伍；要求调用方不出现字符串键名。"
    }
  ]
});

/* --- ch11.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch11",
  part: 3,
  number: "11",
  title: "继承、属性与魔术方法",
  summary: "继承不是「高级组合」，属性也不是「给字段套个 getter」。这一章讲 MRO、super、property、描述符和 Python 数据模型，让你知道什么时候该用、什么时候该停。",
  goals: [
    "能解释 MRO 和 super() 的真实行为",
    "能用 property 保护不变量，而不是写无意义 getter/setter",
    "能实现 __len__/__iter__/__enter__ 等常用魔术方法",
    "能判断继承、组合、描述符的适用边界"
  ],
  lessons: [
    {
      id: "ch11-1",
      title: "11.1 继承、MRO 与 super()",
      minutes: 45,
      lead: "继承最容易「看起来会写，实际用错」。super() 不是「调用父类」，MRO 也不是「从左到右找第一个」。这一节把继承链、方法解析顺序和多继承陷阱拆开。",
      source: "Introducing Python 3rd · Ch.11；Beginning Python 4th · Ch.7、9",
      sections: [
        {
          h: "继承表达 is-a，但别把「共享字段」当 is-a",
          p: `[[class Swimmer(Person)]] 表示「运动员是人」，可以复用 Person 的 name/age，也能被当 Person 使用。但如果两个类只是「都有 name」，就不该继承：那是共享字段，不是类型关系。用组合/共享基类/值对象更清晰。

继承的代价：子类依赖父类实现，父类改方法会影响所有子类；多继承会让方法来源更难追踪；测试要覆盖整条链。只有当子类确实需要父类的行为，并且愿意接受这种耦合时，才继承。

判断句：[[isinstance(child, parent)]] 在业务上应该有意义。如果这个判断很别扭，别继承。`,
          code: String.raw`class Person:
    def __init__(self, name):
        self.name = name

class Swimmer(Person):
    def __init__(self, name, event):
        super().__init__(name)
        self.event = event

s = Swimmer("林晓", "100m")
print(s.name, s.event)
print(isinstance(s, Person))`,
          output: `林晓 100m
True`,
          tip: `[[isinstance(child, parent)]] 在业务上必须成立；只是共享字段时用组合，不要继承。`
        },
        {
          h: "super() 不是「父类」，是 MRO 上的下一个类",
          p: `在单继承里，[[super().method()]] 看起来就是「调用父类方法」；在多继承里，它指的是「当前类在 MRO 中的下一个类」，不一定是直接父类。[[super()]] 返回一个代理对象，按 MRO 顺序查找。

所以父类方法里也写 [[super()]] 时，调用会沿着整条 MRO 走，每个类只执行一次。这是协作式多继承的基础：每个类负责自己那一段，然后交给下一个。

[[super()]] 不写参数时依赖 [[__class__]] 闭包；在静态方法/类外使用会失效。需要显式时写 [[super(Swimmer, self)]]，但通常不需要。`,
          code: String.raw`class A:
    def ping(self):
        print("A")

class B(A):
    def ping(self):
        print("B")
        super().ping()

class C(A):
    def ping(self):
        print("C")
        super().ping()

class D(B, C):
    def ping(self):
        print("D")
        super().ping()

D().ping()
print([c.__name__ for c in D.__mro__])`,
          output: `D
B
C
A
['D', 'B', 'C', 'A', 'object']`,
          tip: `[[super()]] 沿 MRO 走，不是固定父类；多继承里每个类只应处理自己那一段。`
        },
        {
          h: "MRO 是 C3 线性化：先深度，再从左到右",
          p: `[[Class.__mro__]] 给出方法解析顺序。C3 线性化保证：子类在父类前；同一层按继承列表从左到右；不破坏每个类的局部顺序。它不是简单的「深度优先」，多继承时可能和你直觉不同。

如果 MRO 无法满足所有顺序，Python 会在类创建时抛 [[TypeError: Cannot create a consistent method resolution order]]。这通常说明继承图有环或顺序矛盾，不要靠调整基类顺序硬凑。

排查方法：打印 [[__mro__]]，看方法实际从哪来；用 [[Class.method.__qualname__]] 确认定义位置。不要凭「应该走父类」猜。`,
          code: String.raw`class A: pass
class B(A): pass
class C(A): pass
class D(B, C): pass

print([c.__name__ for c in D.__mro__])
print(D.__mro__[1].__name__)
print(D.ping if hasattr(D, "ping") else "no ping")`,
          output: `['D', 'B', 'C', 'A', 'object']
B
no ping`,
          tip: `MRO 是 C3 线性化，不是深度优先；用 [[__mro__]] 看真实顺序，别猜。`
        },
        {
          h: "多继承的三种真实用途与陷阱",
          p: `多继承在 Python 里主要出现在三类场景：混入类（mixin）加行为、协议/抽象基类、框架的协作式继承。它不适合「把两个不相关的业务类拼在一起」。

Mixin 应该只做一件事，不定义 [[__init__]]，不依赖具体状态；例如 [[LogMixin]] 只提供 [[log()]] 方法。多个 mixin 的顺序会影响 MRO，文档要写清楚。

陷阱：菱形继承中每个类的 [[__init__]] 是否都调用 [[super().__init__]]；不调用就会漏初始化。另一个陷阱是子类覆盖方法但忘了 [[super()]]，父类的校验/清理没执行。`,
          code: String.raw`class LogMixin:
    def log(self, msg):
        print(f"[{type(self).__name__}] {msg}")

class Repo:
    def save(self, row):
        print("save", row)

class LoggedRepo(LogMixin, Repo):
    def save(self, row):
        self.log("before")
        super().save(row)

LoggedRepo().save({"name": "林晓"})`,
          output: `[LoggedRepo] before
save {'name': '林晓'}`,
          tip: `Mixin 只做一件事、不定义 [[__init__]]；覆盖方法时想清楚是否必须 [[super()]]。`
        },
        {
          h: "覆盖 vs 扩展：不要悄悄改变父类契约",
          p: `子类覆盖方法时，调用方仍然期望父类的契约：参数含义、返回值类型、异常类型、副作用。如果父类 [[save()]] 返回 id，子类返回 None，调用方就会崩。

扩展是在父类行为基础上加东西，通常先 [[super()]] 再处理；覆盖是替换行为，必须保证契约兼容。改变契约时，应该定义新方法名，而不是覆盖。

文档里写清楚「子类必须调用 super()」或「此方法可覆盖」。类型检查器不能保证语义契约，测试和文档才是。`,
          code: String.raw`class Repo:
    def save(self, row) -> int:
        return 1

class BadRepo(Repo):
    def save(self, row):
        print("saved")
        # 返回 None，破坏契约

class GoodRepo(Repo):
    def save(self, row) -> int:
        print("saved")
        return super().save(row)

print(BadRepo().save({}), GoodRepo().save({}))`,
          output: `saved
None
saved
1`,
          tip: `覆盖必须保持返回值/异常/副作用契约；要改契约就新增方法名，别悄悄替换。`
        },
        {
          h: "动手实验：把继承改成组合",
          p: `拿一个 [[Swimmer(Person)]] 的例子，改成 [[Swimmer]] 持有 [[Person]] 或直接持有 name/age。比较两种写法：[[isinstance]] 是否还需要？序列化是否更简单？测试是否更容易？

如果业务里没有任何地方需要把 Swimmer 当 Person 用，组合通常更清晰。把结论写进设计说明，而不是「因为面向对象所以继承」。`,
          code: String.raw`from dataclasses import dataclass

@dataclass
class Person:
    name: str
    age: int

@dataclass
class Swimmer:
    person: Person
    event: str

s = Swimmer(Person("林晓", 15), "100m")
print(s.person.name, s.event)`,
          output: `林晓 100m`,
          tip: `没有 [[isinstance]] 需求时，组合通常更清晰；继承只在真正 is-a 且需要共享行为时用。`
        }
      ],
      points: [
        "继承表达 is-a，共享字段用组合。",
        "super() 沿 MRO 找下一个类，不是固定父类。",
        "MRO 是 C3 线性化，用 __mro__ 看真实顺序。",
        "Mixin 只做一件事，不定义 __init__。",
        "覆盖必须保持父类契约，改契约用新方法名。"
      ],
      practice: "写一个 `LoggedRepo(LogMixin, Repo)`，要求 `save` 先日志再调 `super().save`，并写测试确认父类返回值没有被吞掉。"
    },
    {
      id: "ch11-2",
      title: "11.2 property、描述符与类方法",
      minutes: 45,
      lead: "property 不是「给字段加 getter/setter」的仪式，而是保护不变量的工具。这一节讲 property 的真实用途、setter 校验、描述符协议，以及 classmethod/staticmethod 的区别。",
      source: "Introducing Python 3rd · Ch.11；Beginning Python 4th · Ch.7、9",
      sections: [
        {
          h: "property 的价值：把字段变成受控接口",
          p: `如果 [[scores]] 是公开列表，调用方可以 [[append(120)]] 绕过校验。用 property 暴露只读视图，写操作走 [[add()]]，就能保证范围。property 让「属性访问」和「方法调用」看起来一样，但内部可以执行逻辑。

只有 getter 的 property 是只读；加 setter 才能赋值；加 deleter 才能 [[del]]。不要给每个字段都写 getter/setter，那只是把 [[self.x]] 换成 [[self._x]]，没有增加任何规则。

判断标准：这个字段被读写时，有没有必须执行的校验、转换、缓存、日志？有才用 property。`,
          code: String.raw`class Swimmer:
    def __init__(self):
        self._scores = []
    @property
    def scores(self):
        return tuple(self._scores)
    def add(self, score):
        if not 0 <= score <= 100:
            raise ValueError("分数越界")
        self._scores.append(float(score))

s = Swimmer()
s.add(91)
print(s.scores)
try:
    s.scores.append(120)
except AttributeError as err:
    print(type(err).__name__)`,
          output: `(91.0,)
AttributeError`,
          tip: `只读 property 返回 tuple/副本，防止调用方绕过校验；写操作走专门方法。`
        },
        {
          h: "setter 校验与「赋值失败不留半状态」",
          p: `setter 里校验失败要抛异常，并且不要先改一半再报错。比如先 [[self._x = value]] 再检查范围，失败时对象已经处于非法状态。正确顺序是先校验，再赋值。

setter 也不应该做昂贵 IO；属性赋值看起来是廉价的，如果里面写数据库，调用方会误判性能。需要 IO 就显式方法。

删除 property 的 deleter 要恢复默认值还是删除字段？想清楚语义。[[del s.x]] 后再次访问应该返回什么？不确定就别提供 deleter。`,
          code: String.raw`class Swimmer:
    def __init__(self, age):
        self.age = age
    @property
    def age(self):
        return self._age
    @age.setter
    def age(self, value):
        if not 0 < value < 100:
            raise ValueError("年龄不合法")
        self._age = value

s = Swimmer(15)
print(s.age)
try:
    s.age = 120
except ValueError as err:
    print(err, s.age)`,
          output: `15
年龄不合法 15`,
          tip: `setter 先校验再赋值；失败时旧值必须保持不变。`
        },
        {
          h: "描述符协议：property 的底层机制",
          p: `property 是描述符的一种。描述符是定义了 [[__get__]]、[[__set__]]、[[__delete__]] 的类属性；访问实例属性时，Python 会调用描述符的 [[__get__]]。数据描述符（有 [[__set__]]）优先于实例 [[__dict__]]。

自定义描述符适合「多个类共享同一套字段规则」，例如 [[PositiveInt]]、[[NonEmptyStr]]。它比给每个类写 property 更复用，但可读性下降；小项目直接用 property。

描述符在类创建时绑定到类属性，不能存在实例里；[[__set_name__]] 可以拿到字段名，用于错误消息。`,
          code: String.raw`class Positive:
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        return obj.__dict__[self.name]
    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError(f"{self.name} 必须为正")
        obj.__dict__[self.name] = value

class Result:
    seconds = Positive()
    def __init__(self, seconds):
        self.seconds = seconds

r = Result(62.35)
print(r.seconds)
try:
    r.seconds = 0
except ValueError as err:
    print(err)`,
          output: `62.35
seconds 必须为正`,
          tip: `描述符是类属性；[[__set_name__]] 能拿到字段名，错误消息才有上下文。`
        },
        {
          h: "classmethod 与 staticmethod：第一个参数是谁",
          p: `[[@classmethod]] 的第一个参数是类 [[cls]]，适合工厂方法、替代构造器、读取类级配置。[[@staticmethod]] 没有隐式参数，只是放在类命名空间里的普通函数，适合与类相关但不依赖实例/类的工具。

[[classmethod]] 在继承中会被子类覆盖 [[cls]]，所以 [[Result.from_dict]] 在子类调用时能构造子类。[[staticmethod]] 不会，它不知道子类是谁。

不要用 staticmethod 包一切工具函数；如果不需要类，放模块级函数更简单。classmethod 最适合 [[from_...]] 工厂。`,
          code: String.raw`class Result:
    def __init__(self, event, seconds):
        self.event = event
        self.seconds = seconds
    @classmethod
    def from_dict(cls, data):
        return cls(data["event"], float(data["seconds"]))
    @staticmethod
    def unit():
        return "seconds"

r = Result.from_dict({"event": "100m", "seconds": "62.35"})
print(r.event, Result.unit())`,
          output: `100m seconds`,
          tip: `工厂方法用 [[@classmethod]]，[[cls]] 会跟着子类走；[[@staticmethod]] 不知道类是谁。`
        },
        {
          h: "动手实验：用 property 保护成绩对象",
          p: `给 [[Swimmer]] 加只读 [[scores]]、可写 [[age]]、只读 [[average]]。要求：[[scores]] 返回 tuple；[[age]] setter 校验 6–60；[[average]] 空列表返回 None；外部不能直接改 [[_scores]]。

再写一个 [[Positive]] 描述符保护 [[Result.seconds]]，比较 property 和描述符两种写法的代码量/可读性。`,
          code: String.raw`class Swimmer:
    def __init__(self, age):
        self.age = age
        self._scores = []
    @property
    def age(self): return self._age
    @age.setter
    def age(self, value):
        if not 6 <= value <= 60:
            raise ValueError("age 6..60")
        self._age = value
    @property
    def scores(self): return tuple(self._scores)
    @property
    def average(self):
        return sum(self._scores) / len(self._scores) if self._scores else None

s = Swimmer(15)
print(s.age, s.scores, s.average)`,
          output: `15 () None`,
          tip: `property 适合单类规则，描述符适合多类复用；不要给无规则字段套 property。`
        }
      ],
      points: [
        "property 用来保护不变量/转换/缓存，不是给字段套壳。",
        "只读 property 返回副本，写操作走校验方法。",
        "setter 先校验再赋值，失败不留半状态。",
        "描述符是类属性，__set_name__ 能拿到字段名。",
        "classmethod 的 cls 会跟随子类，staticmethod 不会。"
      ],
      practice: "实现 `Swimmer.scores` 只读、`age` setter 校验、`average` 空返回 None；再写 `Positive` 描述符保护 `Result.seconds`。"
    },
    {
      id: "ch11-3",
      title: "11.3 魔术方法与 Python 数据模型",
      minutes: 45,
      lead: "[[len(x)]]、[[for x in obj]]、[[with obj]] 背后都是魔术方法。这一节只讲最常用的几个：容器协议、迭代协议、上下文管理、相等/哈希，以及为什么不要滥用量运算符。",
      source: "Introducing Python 3rd · Ch.11；Beginning Python 4th · Ch.9",
      sections: [
        {
          h: "容器协议：__len__、__getitem__、__contains__",
          p: `实现 [[__len__]] 后 [[len(obj)]] 可用；实现 [[__getitem__]] 后 [[obj[i]]] 可用，并且在没有 [[__iter__]] 时，[[for]] 会退化为「从 0 开始索引直到 IndexError」；实现 [[__contains__]] 后 [[x in obj]] 可用。

容器对象要明确「长度」和「索引」的语义。[[__getitem__]] 支持切片时，要返回同类型对象还是列表？返回类型不一致会让调用方困惑。只读容器不要提供 [[__setitem__]]。

[[__len__]] 必须返回非负整数，不能返回 [[bool]] 或浮点。长度是 O(1) 的承诺，不要在 [[__len__]] 里遍历整个集合。`,
          code: String.raw`class Scores:
    def __init__(self, values):
        self._values = list(values)
    def __len__(self):
        return len(self._values)
    def __getitem__(self, i):
        return self._values[i]
    def __contains__(self, value):
        return value in self._values

s = Scores([91, 88.5])
print(len(s), s[0], 91 in s)
print([x for x in s])`,
          output: `2 91 True
[91, 88.5]`,
          tip: `[[__len__]] 必须 O(1) 且返回非负整数；切片返回类型要和调用方预期一致。`
        },
        {
          h: "迭代协议：__iter__ 与生成器",
          p: `[[for]] 先调用 [[iter(obj)]]，再不断 [[next()]]，直到 [[StopIteration]]。[[__iter__]] 应该返回一个新的迭代器（或生成器），不要返回 [[self]] 除非对象本身维护迭代状态。

同一个可迭代对象应该能被多次遍历。如果 [[__iter__]] 返回 [[self]] 且状态存在对象里，第二次 for 会从上次位置继续，这是常见 bug。用生成器函数最省心：每次调用返回新生成器。

[[__next__]] 一般不需要自己写；用 [[yield]] 实现迭代器更简单。`,
          code: String.raw`class Scores:
    def __init__(self, values):
        self._values = list(values)
    def __iter__(self):
        for value in self._values:
            yield value

s = Scores([91, 88.5])
print(list(s))
print(list(s))`,
          output: `[91, 88.5]
[91, 88.5]`,
          tip: `[[__iter__]] 返回新迭代器/生成器，保证可重复遍历；不要返回 [[self]] 保存状态。`
        },
        {
          h: "上下文管理：__enter__/__exit__ 的返回值",
          p: `[[with obj as x]] 中，[[x]] 是 [[__enter__]] 的返回值，不一定是 [[obj]]。文件对象的 [[__enter__]] 返回自身，锁对象也常返回自身；数据库连接可能返回游标。

[[__exit__]] 接收异常三元组，返回 [[True]] 吞异常，返回 [[False]]/[[None]] 继续传播。清理代码放 [[__exit__]]，不要吞掉不该吞的异常。

[[contextlib.contextmanager]] 用生成器实现同样的协议，适合简单资源；复杂类再手写 [[__enter__/__exit__]]。`,
          code: String.raw`class Timer:
    def __enter__(self):
        import time
        self.start = time.perf_counter()
        return self
    def __exit__(self, exc_type, exc, tb):
        import time
        self.elapsed = time.perf_counter() - self.start
        return False

with Timer() as t:
    sum(range(100000))
print(f"{t.elapsed:.4f}s")`,
          output: `0.0031s`,
          tip: `[[__enter__]] 的返回值才是 [[as]] 后面的变量；[[__exit__]] 返回 True 会吞异常，慎用。`
        },
        {
          h: "__eq__ 与 __hash__：相等和哈希必须一致",
          p: `默认 [[__eq__]] 比较身份，[[__hash__]] 基于身份。自定义 [[__eq__]] 后，Python 会把 [[__hash__]] 设为 [[None]]，对象不可哈希；需要可哈希时，必须同时定义 [[__hash__]]。

规则：相等对象哈希必须相同；不相等的对象哈希可以相同（哈希碰撞）。可变对象不要定义基于可变字段的哈希，否则放进 set/dict 后字段一变就找不到。

dataclass 的 [[frozen=True, eq=True]] 会自动生成一致的 [[__hash__]]；可变 dataclass 默认不可哈希。`,
          code: String.raw`class Result:
    def __init__(self, event, seconds):
        self.event = event
        self.seconds = seconds
    def __eq__(self, other):
        return isinstance(other, Result) and (self.event, self.seconds) == (other.event, other.seconds)
    def __hash__(self):
        return hash((self.event, self.seconds))

a = Result("100m", 62.35)
b = Result("100m", 62.35)
print(a == b, hash(a) == hash(b), len({a, b}))`,
          output: `True True 1`,
          tip: `自定义 [[__eq__]] 后默认不可哈希；要可哈希就同时实现 [[__hash__]]，并保证一致。`
        },
        {
          h: "运算符重载：只做「显然」的事",
          p: `[[__add__]]、[[__mul__]]、[[__lt__]] 可以让对象支持 [[+]]、[[*]]、[[<]]。但运算符有约定语义：[[+]] 应该返回新对象，不应修改左操作数；[[<]] 应该定义全序，不能自相矛盾。

不要用运算符表达业务动作。[[result + swimmer]] 让人猜不透；写 [[result.add_swimmer()]] 更清楚。运算符重载适合数值/向量/金额/时间这类「显然」的类型。

实现 [[__add__]] 时，对不支持的类型返回 [[NotImplemented]]，让 Python 尝试右操作数的 [[__radd__]]，最后才抛 [[TypeError]]。不要直接抛异常。`,
          code: String.raw`from dataclasses import dataclass

@dataclass(frozen=True)
class Seconds:
    value: float
    def __add__(self, other):
        if not isinstance(other, Seconds):
            return NotImplemented
        return Seconds(self.value + other.value)

print(Seconds(62.35) + Seconds(0.5))
try:
    Seconds(1) + 2
except TypeError as err:
    print(type(err).__name__)`,
          output: `Seconds(value=62.85)
TypeError`,
          tip: `运算符只用于显然语义；不支持的类型返回 [[NotImplemented]]，不要直接抛异常。`
        },
        {
          h: "动手实验：让成绩集合支持 len/for/with",
          p: `实现 [[ScoreBook]]：支持 [[len()]]、[[for]]、[[in]]、[[with]]。[[with]] 进入时打开一个临时文件，退出时关闭并删除；[[for]] 每次返回新生成器，保证二次遍历结果一致。

写测试验证：两次 [[list(book)]] 长度相同；[[with]] 块内抛异常后文件仍被清理；[[120 in book]] 为 False。`,
          code: String.raw`class ScoreBook:
    def __init__(self, values):
        self._values = list(values)
    def __len__(self): return len(self._values)
    def __iter__(self): return iter(self._values)
    def __contains__(self, v): return v in self._values
    def __enter__(self): return self
    def __exit__(self, *exc): return False

b = ScoreBook([91, 88.5])
print(len(b), list(b), 91 in b)`,
          output: `2 [91, 88.5] True`,
          tip: `容器协议要保证可重复遍历；[[__exit__]] 负责清理，但不要吞异常。`
    }
      ],
      points: [
        "__len__ 必须 O(1) 且返回非负整数；__getitem__ 要定义切片语义。",
        "__iter__ 返回新迭代器/生成器，保证可重复遍历。",
        "__enter__ 的返回值才是 as 变量；__exit__ 返回 True 会吞异常。",
        "__eq__ 和 __hash__ 必须一致；可变对象不要基于可变字段哈希。",
        "运算符只用于显然语义，不支持时返回 NotImplemented。"
      ],
      practice: "实现 `ScoreBook` 支持 len/for/in/with，写 3 个测试：二次遍历、异常清理、包含判断；再给 `Seconds` 实现 `__add__`。"
    }
  ]
});

/* --- ch12.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch12",
  part: 3,
  number: "12",
  title: "类型提示、文档与测试",
  summary: "让代码「别人敢改」的三件套：类型说明输入输出，文档说明为什么，测试证明改了没坏。这一章不追求类型体操，而是建立一套能落地的工程习惯。",
  goals: [
    "能给函数/容器/可选值写出可检查的类型提示",
    "能写让人看懂的 docstring，并让 help() 正确显示",
    "能用 pytest 写单元测试、参数化测试和临时文件测试",
    "知道类型检查、文档生成、覆盖率各自能保证什么"
  ],
  lessons: [
    {
      id: "ch12-1",
      title: "12.1 类型提示：给运行时加一层静态合同",
      minutes: 45,
      lead: "Python 的类型提示默认不阻止运行，它服务于编辑器、类型检查器和读代码的人。这一节讲最常用的类型写法、Optional 的坑、TypedDict/Protocol，以及怎么让检查器真正跑起来。",
      source: "Introducing Python 3rd · Ch.14；Beginning Python 4th · Ch.16",
      sections: [
        {
          h: "注解不是强制类型，是给检查器看的",
          p: `[[def average(scores: list[float]) -> float: ...]] 里的注解会存进 [[__annotations__]]，但 Python 不会在调用时检查。你传字符串列表，运行时照样执行，直到 [[sum]] 报错。类型检查器（mypy/pyright）在开发阶段读注解，提前报错。

注解的价值：编辑器补全、重构安全、读代码时知道输入输出、CI 里拦住明显错误。它不能替代运行时校验，尤其是外部输入。边界数据仍要 [[float()]]/校验。

从简单开始：参数和返回值先标；容器标元素类型；[[None]] 用 [[| None]]；复杂结构用 TypedDict/dataclass。不要一上来写泛型体操。`,
          code: String.raw`def average(scores: list[float]) -> float:
    return sum(scores) / len(scores)

print(average([91, 88.5]))
print(average(["91"]))  # 运行时才报错`,
          output: `89.75
TypeError: unsupported operand type(s) for +: 'int' and 'str'`,
          tip: `类型提示不阻止运行；外部数据仍要运行时校验，注解主要给检查器/编辑器用。`
        },
        {
          h: "Optional、Union 与 None 的真实含义",
          p: `[[str | None]] 表示「字符串或 None」，不是「可选参数」。可选参数是「调用时可以不给」，用默认值表达；[[None]] 是「显式缺失」。两者混在一起会让调用方不知道 [[None]] 是合法值还是错误。

函数返回 [[str | None]] 时，调用方必须处理 [[None]]；如果业务上不应该缺失，就别返回 None，直接抛异常。返回 None 表示「没有」还是「失败」，要在文档里说清楚。

[[Optional[str]]] 等价于 [[str | None]]；Python 3.10+ 优先用 [[|]]。[[NoReturn]] 表示函数永不正常返回（总是抛异常/退出）。`,
          code: String.raw`def find(name: str) -> str | None:
    rows = {"林晓": "海豚队"}
    return rows.get(name)

print(find("林晓"))
print(find("周宁"))

value = find("周宁")
print(value.upper() if value is not None else "未找到")`,
          output: `海豚队
None
未找到`,
          tip: `[[str | None]] 是返回值可能是 None；可选参数用默认值。别把两者混为一谈。`
        },
        {
          h: "容器类型：list/dict/tuple/set 与只读视图",
          p: `[[list[str]]] 表示字符串列表；[[dict[str, float]]] 表示键字符串、值浮点；[[tuple[str, float]]] 是固定长度二元组；[[tuple[int, ...]]] 是任意长度整数元组。[[set[str]]] 是字符串集合。

只读参数用 [[Sequence]]/[[Mapping]]/[[Iterable]] 更宽，表示「我只读，不要求具体类型」。返回具体类型时用 [[list]]/[[dict]]，让调用方知道能做什么。

[[list]] 和 [[Sequence]] 不是一回事：前者承诺可变列表方法，后者只承诺索引/长度/迭代。参数标 [[Sequence]] 能接受 tuple，标 [[list]] 不能。`,
          code: String.raw`from collections.abc import Sequence, Mapping

def total(values: Sequence[float]) -> float:
    return sum(values)

def label(row: Mapping[str, object]) -> str:
    return str(row["name"])

print(total([1, 2, 3]))
print(total((1.5, 2.5)))
print(label({"name": "林晓"}))`,
          output: `6
4.0
林晓`,
          tip: `只读参数用 [[Sequence]]/[[Mapping]]；返回具体 [[list]]/[[dict]] 让调用方知道能力。`
        },
        {
          h: "TypedDict 与 Protocol：描述字典和鸭子类型",
          p: `[[TypedDict]] 给字典定义键和值类型，适合 JSON/配置这种「形状固定但仍是 dict」的数据。它运行时仍是普通 dict，检查器能发现拼错键/类型不符。

[[Protocol]] 描述对象需要哪些方法，不要求继承。适合依赖注入：[[Repo]] 协议要求 [[load/save]]，内存/SQLite 实现都满足。

TypedDict 的键默认必需；[[total=False]] 让所有键可选，或 [[NotRequired]] 单个可选。运行时不会校验，边界仍要手动检查。`,
          code: String.raw`from typing import TypedDict, Protocol

class ResultRow(TypedDict):
    event: str
    seconds: float

class Repo(Protocol):
    def load(self) -> list[ResultRow]: ...

row: ResultRow = {"event": "100m", "seconds": 62.35}
print(row["seconds"])`,
          output: `62.35`,
          tip: `[[TypedDict]] 只影响检查器；运行时还是 dict，外部 JSON 仍要校验键和类型。`
        },
        {
          h: "让检查器真的跑起来",
          p: `类型提示写得再好，不跑检查器就只是注释。[[mypy]] 和 [[pyright]] 是两大选择；[[ruff]] 也能做部分规则。项目里加一个 [[pyproject.toml]] 配置和 CI 命令，才能防止回退。

初次接入不要开最严格模式，先把明显错误清掉，再逐步开启 [[disallow_untyped_defs]]、[[strict_optional]] 等。对第三方无类型包，用 [[ignore_missing_imports]] 或 stub 包。

检查器不是万能：它不懂业务不变量、不懂运行时数据。类型 + 测试 + 运行时校验，三者互补。`,
          code: String.raw`# pyproject.toml
# [tool.mypy]
# python_version = "3.11"
# disallow_untyped_defs = true
# warn_return_any = true

# 终端
# python -m mypy src/
# python -m pyright src/`,
          output: `Success: no issues found in 3 source files`,
          tip: `先跑起来再逐步严格；CI 里固定命令，否则类型提示很快退化成注释。`
        },
        {
          h: "动手实验：给成绩模块补类型",
          p: `给 [[parse_line]]、[[average]]、[[Swimmer]] 加类型提示；用 [[TypedDict]] 描述原始行，用 [[Protocol]] 描述存储。跑 mypy，修掉所有错误；再故意传错类型，确认检查器能报。

验收：不改变运行行为，只加注解和必要 import；mypy 通过；[[help()]] 能看到签名。`,
          code: String.raw`from typing import TypedDict

class RawRow(TypedDict):
    name: str
    scores: list[float]

def parse_line(line: str) -> RawRow:
    name, *raw = [p.strip() for p in line.split(",")]
    return {"name": name, "scores": [float(x) for x in raw if x]}

print(parse_line("林晓,91,88.5"))`,
          output: `{'name': '林晓', 'scores': [91.0, 88.5]}`,
          tip: `类型改造不要顺手改逻辑；先注解、跑检查、再重构，出问题容易回退。`
        }
      ],
      points: [
        "类型提示默认不校验运行时，靠 mypy/pyright 提前发现。",
        "str | None 表示可能缺失，不是可选参数。",
        "只读参数用 Sequence/Mapping，返回具体 list/dict。",
        "TypedDict 描述字典形状，Protocol 描述对象结构。",
        "检查器要进 CI，否则类型提示会退化。"
      ],
      practice: "给成绩模块的 4 个函数加类型提示，定义 `RawRow` TypedDict 和 `Repo` Protocol；跑 mypy，故意传错一个类型确认能报错。"
    },
    {
      id: "ch12-2",
      title: "12.2 docstring、help() 与文档生成",
      minutes: 45,
      lead: "docstring 不是写给作者自己的注释，而是写给调用者的合同：这个函数做什么、参数什么意思、返回什么、会抛什么。这一节讲 PEP 257、常见风格、doctest 和文档生成的最小流程。",
      source: "Introducing Python 3rd · Ch.14–15；Beginning Python 4th · Ch.16",
      sections: [
        {
          h: "docstring 的第一行决定别人能不能快速理解",
          p: `PEP 257 建议：第一行是简短摘要，句号结尾，空一行，再写细节。[[help(func)]] 会把 docstring 格式化输出；IDE 悬浮提示也读它。第一行不是「函数名复述」，而是「它做什么、返回什么」。

坏 docstring：[[\"计算平均分\"]] 但没说空列表怎么办；好 docstring：[[\"返回平均分；空列表抛 ValueError。\"]]。调用方最想知道边界，而不是重复函数名。

docstring 是运行时对象 [[__doc__]]，可以被测试/文档工具读取。它不是注释，不会因为代码改动自动同步；所以要靠测试和 review 保持。`,
          code: String.raw`def average(scores):
    """返回平均分；空列表抛出 ValueError。

    Args:
        scores: 非空的可迭代数字序列。

    Returns:
        float: 算术平均值。

    Raises:
        ValueError: scores 为空。
    """
    if not scores:
        raise ValueError("scores 不能为空")
    return sum(scores) / len(scores)

print(average.__doc__.splitlines()[0])
help(average)`,
          output: `返回平均分；空列表抛出 ValueError。`,
          tip: `第一行写「做什么 + 返回什么」，不要复述函数名；边界和异常写在正文。`
        },
        {
          h: "Args/Returns/Raises：把合同写完整",
          p: `Google 风格用 [[Args:]]、[[Returns:]]、[[Raises:]]；NumPy 风格用 [[Parameters]]、[[Returns]] 分段；Sphinx 风格用 [[:param:]]/[[ :return:]]。团队选一种，别混用。

参数说明写「语义 + 约束」，不是类型复述。[[scores: 非空数字序列]] 比 [[scores: list]] 有用。返回值说明写「什么情况下是什么」，包括 None 的含义。异常说明写触发条件，不只写类型名。

docstring 不要写实现细节（“这里用了 for 循环”），写调用者需要知道的契约。实现细节放注释，且只在代码本身说不清时写。`,
          code: String.raw`def parse_score(text: str) -> float:
    """把单个分数字符串转成 float。

    Args:
        text: 只包含数字和小数点的字符串，允许首尾空白。

    Returns:
        0 到 100 之间的分数。

    Raises:
        ValueError: text 不是数字，或超出 0..100。
    """
    value = float(text.strip())
    if not 0 <= value <= 100:
        raise ValueError(f"分数越界：{value}")
    return value

print(parse_score(" 91 "))`,
          output: `91.0`,
          tip: `参数写语义/约束，返回写 None 的含义，异常写触发条件；不要复述类型。`
        },
        {
          h: "doctest：把示例变成可执行测试",
          p: `docstring 里的 [[>>>]] 示例可以被 [[doctest]] 执行。它适合简单、稳定的输入输出示例；不适合随机、网络、时间相关的逻辑。

doctest 的价值是防止文档过期：改了函数忘了改示例，测试会失败。缺点是格式严格（空格、输出、异常文本都要匹配），复杂示例维护成本高。

pytest 可以 [[--doctest-modules]] 自动收集；也可以 [[doctest.testmod()]] 在模块入口运行。不要把所有测试都写成 doctest，单元测试仍用 pytest。`,
          code: String.raw`def average(scores):
    """返回平均分。

    >>> average([90, 100])
    95.0
    >>> average([])
    Traceback (most recent call last):
    ValueError: scores 不能为空
    """
    if not scores:
        raise ValueError("scores 不能为空")
    return sum(scores) / len(scores)

import doctest
print(doctest.testmod())`,
          output: `TestResults(failed=0, attempted=2)`,
          tip: `doctest 的异常示例要写 [[Traceback (most recent call last):]] 和最后一行异常；格式错一点就失败。`
        },
        {
          h: "从 docstring 生成文档：最小可用流程",
          p: `[[pydoc]] 是标准库自带的文档生成器：[[python -m pydoc -w module]] 生成 HTML；[[pydoc -b]] 启动本地浏览器。零依赖，适合内部工具。

更大项目用 Sphinx（reStructuredText）或 MkDocs（Markdown）。Sphinx 的 autodoc 能读 docstring 生成 API 页；MkDocs 的 mkdocstrings 类似。选型看团队熟悉哪种标记。

文档生成的常见问题：模块导入失败、依赖缺失、循环导入。autodoc 需要能 import 模块，所以文档构建环境要装依赖；不要把文档构建和运行环境完全隔离。`,
          code: String.raw`# 标准库 pydoc
# python -m pydoc -w scores
# 生成 scores.html

# MkDocs 最小配置
# mkdocs.yml
# site_name: Scores
# nav:
#   - Home: index.md
# plugins:
#   - mkdocstrings`,
          output: `Writing generated HTML for scores...`,
          tip: `pydoc 零依赖适合内部；autodoc 需要模块可导入，文档环境也要装依赖。`
        },
        {
          h: "动手实验：给成绩包写可读文档",
          p: `给 [[scores/parse.py]]、[[scores/report.py]] 的每个公开函数写 docstring，包含 Args/Returns/Raises；加一个 doctest 示例；用 [[python -m pydoc -w scores]] 生成 HTML，检查 [[help()]] 输出是否完整。

验收：不看源码，只看 docstring 能回答「空输入怎么办」「坏行怎么报」「返回什么类型」。`,
          code: String.raw`def parse_line(line: str) -> dict:
    """解析一行 CSV 成绩。

    Args:
        line: 形如 '姓名,分数1,分数2' 的字符串。

    Returns:
        {"name": str, "scores": list[float]}。

    Raises:
        ValueError: 分数不是数字。
    """
    name, *raw = [p.strip() for p in line.split(",")]
    return {"name": name, "scores": [float(x) for x in raw if x]}

print(parse_line("林晓,91,88.5"))`,
          output: `{'name': '林晓', 'scores': [91.0, 88.5]}`,
          tip: `docstring 里用双反引号包代码；pydoc/Sphinx 会渲染成等宽，不要用中文引号。`
        }
      ],
      points: [
        "第一行摘要写做什么/返回什么，空一行再写细节。",
        "Args/Returns/Raises 写语义、约束和触发条件。",
        "doctest 适合稳定示例，格式严格，别替代单元测试。",
        "pydoc 零依赖；Sphinx/MkDocs 适合大型文档。",
        "文档构建环境必须能导入模块和依赖。"
      ],
      practice: "给 `scores` 包所有公开函数写 Google 风格 docstring，加 2 个 doctest；用 `python -m pydoc -w scores` 生成 HTML 并检查 `help()`。"
    },
    {
      id: "ch12-3",
      title: "12.3 pytest：从断言到参数化与临时文件",
      minutes: 50,
      lead: "测试不是「证明我对」，而是「改代码时知道有没有坏」。这一节用 pytest 写单元、参数化、异常、临时文件和 monkeypatch，最后接覆盖率。",
      source: "Introducing Python 3rd · Ch.15；Beginning Python 4th · Ch.16",
      sections: [
        {
          h: "pytest 的最小结构：test_ 文件 + assert",
          p: `pytest 自动发现 [[test_*.py]] 或 [[*_test.py]]，执行 [[test_]] 开头的函数。断言直接用 [[assert]]，失败时 pytest 会重写并显示左右值；不需要 [[self.assertEqual]]。

一个测试只验证一个行为，名字写清楚场景：[[test_average_empty_raises]] 比 [[test_average]] 好。测试准备（arrange）、执行（act）、断言（assert）尽量三段分明。

测试文件不要放在包目录里；放 [[tests/]]，从项目根运行 [[python -m pytest]]，避免导入到另一份代码。`,
          code: String.raw`# tests/test_scores.py
from scores.core import average

def test_average_normal():
    assert average([90, 100]) == 95

def test_average_empty_raises():
    import pytest
    with pytest.raises(ValueError):
        average([])`,
          output: `2 passed in 0.02s`,
          tip: `测试名写场景；一个测试一个行为；用 [[pytest.raises]] 断言异常类型。`
        },
        {
          h: "参数化：一份逻辑覆盖多组输入",
          p: `[[@pytest.mark.parametrize]] 把多组参数跑同一测试函数，失败时分别显示每组。适合边界值、等价类、格式变体。

参数名要和函数参数一致；[[ids=]] 给每组起可读名字。不要把不相关的断言塞进同一个参数化测试，失败时分不清是哪条规则。

参数化不是越多越好。选有代表性的边界：空、单元素、正常、越界、类型错误。重复大量随机值应交给属性测试（Hypothesis），不是手写 100 行。`,
          code: String.raw`import pytest

def parse(text):
    value = float(text)
    if not 0 <= value <= 100:
        raise ValueError("out of range")
    return value

@pytest.mark.parametrize("text,expected", [
    ("0", 0.0),
    ("91", 91.0),
    ("100", 100.0),
], ids=["zero", "normal", "max"])
def test_parse_ok(text, expected):
    assert parse(text) == expected

@pytest.mark.parametrize("text", ["-1", "101", "abc"])
def test_parse_bad(text):
    with pytest.raises(ValueError):
        parse(text)`,
          output: `6 passed in 0.03s`,
          tip: `参数化选边界和等价类，不堆随机值；[[ids]] 让失败输出可读。`
        },
        {
          h: "fixture 与临时文件：测试不碰真实数据",
          p: `[[@pytest.fixture]] 提供测试准备，[[tmp_path]] 是 pytest 内置的临时目录 fixture。测试里写文件用 [[tmp_path / "scores.csv"]]，结束后自动清理，不会污染项目。

fixture 默认函数级，每个测试一份；[[scope="module"]] 共享一份，适合昂贵且只读的资源。共享可变状态要小心，测试之间会互相影响。

不要在测试里连真实数据库/网络；用临时 SQLite 文件或假对象。集成测试可以单独标记，和单元测试分开跑。`,
          code: String.raw`import pytest
from pathlib import Path

@pytest.fixture
def csv_file(tmp_path):
    p = tmp_path / "scores.csv"
    p.write_text("name,score\n林晓,91\n", encoding="utf-8")
    return p

def test_read_csv(csv_file):
    text = csv_file.read_text(encoding="utf-8")
    assert "林晓" in text
    assert csv_file.exists()`,
          output: `1 passed in 0.02s`,
          tip: `[[tmp_path]] 每个测试独立；不要用固定路径写测试文件，否则并行/重复运行会互相覆盖。`
        },
        {
          h: "monkeypatch 与假对象：隔离外部边界",
          p: `[[monkeypatch]] 可以临时替换模块属性/环境变量，测试结束自动恢复。适合替换时间、随机、网络客户端、配置。

优先用依赖注入/假对象；monkeypatch 适合「代码已经写死全局函数」的遗留场景。不要 patch 太多内部细节，否则测试会绑死实现，重构就坏。

patch 的目标要写「使用它的地方」，不是定义它的地方。例如 [[scores.report.datetime]] 而不是 [[datetime.datetime]]，否则可能 patch 到全局模块。`,
          code: String.raw`import pytest

def is_weekend(day):
    return day.weekday() >= 5

class FakeDate:
    @staticmethod
    def today():
        class D:
            def weekday(self): return 5
        return D()

def test_weekend(monkeypatch):
    import scores.report as report
    monkeypatch.setattr(report, "date", FakeDate)
    assert is_weekend(FakeDate.today())`,
          output: `1 passed in 0.01s`,
          tip: `patch 使用处而不是定义处；优先依赖注入，monkeypatch 只处理遗留全局。`
        },
        {
          h: "覆盖率：看漏了哪条分支，不追求 100%",
          p: `[[pytest --cov=scores]] 生成覆盖率报告，[[--cov-report=term-missing]] 显示哪几行没执行。覆盖率是「测试触达代码的比例」，不是「代码正确性的证明」。

100% 覆盖率仍可能漏掉边界组合、异常路径、并发问题。把覆盖率当导航：没覆盖的分支逐个看，是否值得补测试；不要为了数字写无意义断言。

CI 里可以设阈值（如 80%），但阈值要随项目成熟度调整；新项目先看趋势，不要一开始卡 100%。`,
          code: String.raw`# 安装
# python -m pip install pytest pytest-cov

# 运行
# python -m pytest --cov=scores --cov-report=term-missing

# 示例输出
# Name                 Stmts   Miss  Cover
# scores/core.py          12      2    83%`,
          output: `scores/core.py 12 2 83%`,
          tip: `覆盖率看漏掉的分支，不追求 100%；异常/边界路径比行数更重要。`
        },
        {
          h: "动手实验：给导入器写 8 个测试",
          p: `给 [[parse_line]]/[[average]]/[[clean_csv]] 写测试：正常、空、坏数字、越界、BOM、空行、重复、临时文件。要求用 [[tmp_path]]，不碰真实数据；用参数化覆盖边界；跑 [[--cov]] 看漏了哪些分支。

验收：故意改坏一个函数，测试必须失败；恢复后全部通过。`,
          code: String.raw`import pytest

def divide(a, b):
    if b == 0:
        raise ZeroDivisionError("b 不能为 0")
    return a / b

@pytest.mark.parametrize("a,b,expected", [(10, 2, 5), (9, 3, 3)])
def test_divide(a, b, expected):
    assert divide(a, b) == expected

def test_divide_zero():
    with pytest.raises(ZeroDivisionError):
        divide(1, 0)`,
          output: `3 passed in 0.02s`,
          tip: `先写会失败的测试，再改代码；改坏后测试必须红，否则测试没测到点。`
        }
      ],
      points: [
        "pytest 自动发现 test_ 文件/函数，断言直接用 assert。",
        "参数化覆盖边界/等价类，ids 让失败可读。",
        "tmp_path 隔离文件，fixture 提供准备。",
        "优先假对象/依赖注入，monkeypatch 处理遗留全局。",
        "覆盖率看漏掉的分支，不追求 100%。"
      ],
      practice: "给 `clean_csv` 写 8 个 pytest 测试：正常/空/坏数字/越界/BOM/空行/重复/临时文件；跑 `--cov` 并补掉至少一个未覆盖分支。"
    }
  ]
});

/* --- ch13.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch13",
  part: 3,
  number: "13",
  title: "项目结构、依赖与发布",
  summary: "从「一个脚本」到「能装、能跑、能发布」的项目：src 布局、pyproject、命令行入口、版本号、构建产物和 CI。这一章的重点是可复现，不是把目录摆好看。",
  goals: [
    "能设计 src 布局、pyproject 和测试目录",
    "能用 argparse 写带子命令和退出码的 CLI",
    "能构建 wheel/sdist 并在干净环境安装验证",
    "能管理版本号、依赖和发布流程"
  ],
  lessons: [
    {
      id: "ch13-1",
      title: "13.1 src 布局、pyproject 与项目元数据",
      minutes: 45,
      lead: "项目结构决定导入、测试、打包和部署的边界。这一节从一个最小可安装项目开始，解释 src 布局为什么能防止「本地能导入、安装后不能」。",
      source: "Introducing Python 3rd · Ch.13；Beginning Python 4th · Ch.18",
      sections: [
        {
          h: "为什么推荐 src 布局",
          p: `如果包目录就在项目根（[[scores/]]），在根目录运行 Python 时，当前目录会进入 [[sys.path]]，[[import scores]] 直接导入源码目录。这看起来方便，但会掩盖「安装后是否包含这个文件」的问题：源码目录里能导入，打包后可能漏文件。

src 布局把包放到 [[src/scores/]]，项目根不再直接包含包。运行时要么 [[pip install -e .]]，要么设置 [[PYTHONPATH=src]]。这样测试的是「安装后的包」，而不是「碰巧在 cwd 的源码」。

代价是多一层目录、需要 editable 安装。对库/CLI/要发布的包值得；一次性脚本不必。`,
          code: String.raw`# 推荐结构
# project/
#   pyproject.toml
#   README.md
#   src/scores/__init__.py
#   src/scores/core.py
#   tests/test_core.py
#
# 安装
# python -m pip install -e ".[dev]"
# python -m pytest`,
          output: `Successfully installed scores-0.1.0`,
          tip: `src 布局让测试针对「安装后的包」；根目录直接放包会掩盖漏打包问题。`
        },
        {
          h: "pyproject.toml：一个文件说清项目",
          p: `[[[project]]] 写 name/version/description/readme/requires-python/dependencies；[[[build-system]]] 指定构建后端；[[[project.optional-dependencies]]] 分组开发依赖；[[[project.scripts]]] 定义命令行入口。

name 是分发名（pip install 用的），导入名可以和它不同（[[Pillow]] vs [[PIL]]）。version 可以手写，也可以用 [[dynamic]] 从包属性/SCM 读取；手写最简单，发布前要改。

readme 指向 README.md；license 用 SPDX 表达式；authors/maintainers 是元数据，不影响运行。不要把所有字段都填满，必需字段先对。`,
          code: String.raw`[project]
name = "scores"
version = "0.1.0"
description = "游泳成绩清洗与报表"
readme = "README.md"
requires-python = ">=3.11"
dependencies = ["requests>=2.28,<3"]

[project.optional-dependencies]
dev = ["pytest>=8", "mypy>=1.13", "ruff>=0.8"]

[project.scripts]
scores = "scores.cli:main"

[build-system]
requires = ["setuptools>=68"]
build-backend = "setuptools.build_meta"`,
          output: `$ python -m build
Successfully built scores-0.1.0.tar.gz and scores-0.1.0-py3-none-any.whl`,
          tip: `分发名和导入名可以不同；[[[project.scripts]]] 的值是 [["模块:函数"]]，函数不接受参数。`
        },
        {
          h: "包发现：setuptools 怎么知道打包哪些文件",
          p: `setuptools 默认会自动发现 [[src/]] 下的包，但多目录/命名空间包需要显式配置 [[[tool.setuptools.packages.find]]]。漏包是发布后 [[ModuleNotFoundError]] 的最常见原因。

非 Python 文件（模板、CSV、图标）不会自动进 wheel，需要 [[package-data]] 或 [[include-package-data]] + MANIFEST.in。更现代的方式是用 [[importlib.resources]] 读资源，并确保它们被声明为包数据。

构建后一定要检查 wheel 内容：[[unzip -l dist/*.whl]] 看文件列表；在干净 venv 安装后跑一次入口命令。`,
          code: String.raw`[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
scores = ["data/*.csv", "templates/*.html"]

# 检查 wheel
# unzip -l dist/scores-0.1.0-py3-none-any.whl`,
          output: `scores/data/sample.csv
scores/templates/report.html`,
          tip: `非 .py 资源要显式声明 package-data；构建后 [[unzip -l]] 检查，别等安装后才发现漏文件。`
        },
        {
          h: "README、LICENSE 与 .gitignore",
          p: `README 至少写：项目是什么、怎么安装、怎么运行、怎么测试、依赖什么版本。不要只写「运行 main.py」。发布到 PyPI 时 README 会显示在项目页，格式用 Markdown。

LICENSE 决定别人能怎么用。没有 license 不等于「随便用」；公司项目要按组织规范选。[[pyproject]] 的 license 字段用 SPDX 标识，和 LICENSE 文件保持一致。

.gitignore 要排除 [[.venv/]]、[[__pycache__/]]、[[*.egg-info/]]、[[dist/]]、[[.pytest_cache/]]、[[.env]]、本地数据库。不要把锁文件/测试数据误排除。`,
          code: String.raw`# .gitignore
.venv/
__pycache__/
*.py[cod]
*.egg-info/
dist/
build/
.pytest_cache/
.mypy_cache/
.env
*.db`,
          output: `git status --short
?? pyproject.toml
?? README.md
?? src/
?? tests/`,
          tip: `.gitignore 排除环境/构建产物/密钥；锁文件和测试 fixture 要提交。`
        },
        {
          h: "开发依赖与工具配置放哪",
          p: `pytest、ruff、mypy 属于开发依赖，不应进运行时 dependencies；放 [[[project.optional-dependencies].dev]]，安装 [[.[dev]]]。这样生产环境不会装测试工具。

工具配置也放 [[pyproject.toml]]：[[[tool.pytest.ini_options]]]、[[[tool.ruff]]]、[[[tool.mypy]]]。集中配置比散落的 [[setup.cfg]]/[[tox.ini]] 更容易发现。

不是所有工具都支持 pyproject；旧工具可能要单独配置文件。先查文档，别假设。`,
          code: String.raw`[tool.pytest.ini_options]
testpaths = ["tests"]
addopts = "-q"

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.mypy]
python_version = "3.11"
disallow_untyped_defs = true`,
          output: `$ python -m pytest
3 passed in 0.04s`,
          tip: `开发工具放 dev 可选依赖；工具配置集中到 pyproject，CI 和本地用同一份。`
        },
        {
          h: "动手实验：从零搭一个可安装项目",
          p: `创建 [[src/scores/]]、[[tests/]]、[[pyproject.toml]]、README；实现 [[scores.core.average]] 和 [[scores.cli.main]]。在干净 venv 中 [[pip install -e ".[dev]"]]，跑 [[pytest]]、[[mypy]]、[[scores --help]]。

然后 [[python -m build]]，在另一个干净 venv 安装 wheel，确认不依赖源码目录也能运行。`,
          code: String.raw`# src/scores/core.py
def average(scores: list[float]) -> float:
    if not scores:
        raise ValueError("scores 不能为空")
    return sum(scores) / len(scores)

# src/scores/cli.py
import argparse
from .core import average

def main():
    p = argparse.ArgumentParser()
    p.add_argument("scores", nargs="+", type=float)
    args = p.parse_args()
    print(f"{average(args.scores):.1f}")`,
          output: `$ scores 91 88.5
89.8`,
          tip: `在干净环境安装 wheel 再跑入口，才能证明包是自包含的。`
        }
      ],
      points: [
        "src 布局让测试针对安装后的包，暴露漏打包问题。",
        "pyproject 写元数据/依赖/可选依赖/入口，构建后端单独声明。",
        "非 py 资源要 package-data，构建后 unzip -l 检查。",
        "开发工具进 dev 可选依赖，配置集中 pyproject。",
        "发布前在干净 venv 安装 wheel 验证。"
      ],
      practice: "从零搭 `src/scores` 项目：pyproject 配 `scores` 命令、dev 依赖、pytest/ruff/mypy 配置；构建 wheel 后在干净 venv 安装并运行。"
    },
    {
      id: "ch13-2",
      title: "13.2 命令行入口、argparse 与退出码",
      minutes: 45,
      lead: "CLI 是项目的门面：参数怎么解析、错误怎么提示、退出码是什么，决定它能不能被脚本/CI 使用。这一节用 argparse 写一个带子命令、配置优先级和正确退出码的工具。",
      source: "Introducing Python 3rd · Ch.13；Beginning Python 4th · Ch.18",
      sections: [
        {
          h: "入口函数：不带参数，返回退出码",
          p: `[[[project.scripts]]] 指向的函数必须不接受参数；argparse 在函数内部读 [[sys.argv]]。入口函数最好返回整数退出码，再由 [[sys.exit(main())]] 抛出；这样测试可以直接调用 [[main()]] 并断言返回值。

退出码约定：0 成功；1 一般错误；2 命令行用法错误（argparse 默认）；其他值按业务定义。不要把异常直接抛给用户看 traceback，除非 [[--debug]]。

入口函数只做「解析参数 → 调用业务 → 输出/返回码」，业务逻辑放 core，方便测试。`,
          code: String.raw`import argparse, sys

def build_parser():
    p = argparse.ArgumentParser(prog="scores")
    p.add_argument("--file", required=True)
    p.add_argument("--limit", type=int, default=10)
    return p

def main(argv=None):
    args = build_parser().parse_args(argv)
    if args.limit <= 0:
        print("limit 必须为正", file=sys.stderr)
        return 2
    print(f"read {args.file}, limit={args.limit}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())`,
          output: `$ scores --file data.csv --limit 3
read data.csv, limit=3
$ echo $?
0`,
          tip: `入口函数返回退出码，[[raise SystemExit(main())]]；测试直接传 [[argv]] 调 [[main]]。`
        },
        {
          h: "子命令：一个工具多个动作",
          p: `[[add_subparsers(dest="command", required=True)]] 让 [[scores import]]、[[scores report]] 各自有参数。每个子命令 [[set_defaults(func=...)]]，主函数根据 [[args.command]] 分发。

子命令共享参数（如 [[--verbose]]）放在父 parser；子命令独有参数放各自 parser。不要把所有参数堆在顶层，帮助信息会变得难读。

[[argparse]] 的 [[--help]] 自动生成；[[prog]] 和 [[description]] 要写清楚。子命令的 [[help=]] 会出现在父命令列表里。`,
          code: String.raw`import argparse

def add_common(p):
    p.add_argument("-v", "--verbose", action="store_true")

def cmd_import(args):
    print("import", args.path)
    return 0

def cmd_report(args):
    print("report", args.top)
    return 0

p = argparse.ArgumentParser(prog="scores")
add_common(p)
sub = p.add_subparsers(dest="command", required=True)

pi = sub.add_parser("import", help="导入 CSV")
pi.add_argument("path")
pi.set_defaults(func=cmd_import)

pr = sub.add_parser("report", help="输出报表")
pr.add_argument("--top", type=int, default=5)
pr.set_defaults(func=cmd_report)

args = p.parse_args(["report", "--top", "3"])
raise SystemExit(args.func(args))`,
          output: `report 3`,
          tip: `子命令用 [[set_defaults(func=...)]] 分发；共享参数放父 parser，独有参数放子 parser。`
        },
        {
          h: "配置优先级：命令行 > 环境变量 > 配置文件 > 默认值",
          p: `同一个配置项可能有四个来源。常见优先级是命令行最高，环境变量次之，配置文件再次，默认值最低。实现时先读默认，再被文件覆盖，再被环境变量覆盖，最后命令行非 None 才覆盖。

argparse 的默认值会掩盖「用户是否显式传了」；需要区分时用 [[default=None]]，解析后判断 [[None]] 再回退。[[action="store_true"]] 的默认 False 也会掩盖，需要 [[default=None]]。

配置来源要能打印出来（[[--show-config]]），否则线上「为什么用了这个数据库」很难查。`,
          code: String.raw`import argparse, os

defaults = {"limit": 5, "path": "data.csv"}
env = {"limit": int(os.environ.get("SCORES_LIMIT", defaults["limit"]))}
p = argparse.ArgumentParser()
p.add_argument("--limit", type=int, default=None)
args = p.parse_args([])
limit = args.limit if args.limit is not None else env["limit"]
print(limit)`,
          output: `5`,
          tip: `要区分「用户没传」和「传了默认值」，argparse 默认设 None，再按优先级回退。`
        },
        {
          h: "错误输出与日志：stderr 给人，stdout 给数据",
          p: `CLI 的 stdout 应该只输出机器可解析的数据（JSON/CSV/结果），日志和错误写 stderr。这样 [[scores report > out.json]] 不会把日志混进 JSON。

argparse 的错误默认写 stderr 并以退出码 2 结束；业务错误自己 [[print(..., file=sys.stderr)]] 并返回非 0。成功时不要打印「成功」到 stdout，除非用户要求。

[[--quiet]]/[[--verbose]] 控制日志级别；[[--json]] 控制输出格式。不要用 print 拼接 JSON，用 [[json.dumps]]。`,
          code: String.raw`import sys, json

def emit(data, as_json=False):
    if as_json:
        print(json.dumps(data, ensure_ascii=False))
    else:
        print(data["name"], data["score"])

emit({"name": "林晓", "score": 91}, as_json=True)
print("warning: 2 rows skipped", file=sys.stderr)`,
          output: `{"name": "林晓", "score": 91}
warning: 2 rows skipped`,
          tip: `stdout 只放数据，stderr 放日志/错误；[[--json]] 用 [[json.dumps]]，不要手拼。`
        },
        {
          h: "可测试的 CLI：注入 argv 与输出",
          p: `[[main(argv=None)]] 允许测试传入参数列表；输出可以用 [[capsys]] 捕获。不要测试真实终端，也不要依赖当前目录。

测试退出码：[[main(["bad"])]] 返回 2；测试 stderr 内容包含用法提示；测试成功路径的 stdout 是合法 JSON。业务错误要单独测。

CLI 测试不替代 core 测试；它只验证参数映射和退出码。`,
          code: String.raw`import pytest
from scores.cli import main

def test_bad_limit(capsys):
    assert main(["--file", "x.csv", "--limit", "0"]) == 2
    err = capsys.readouterr().err
    assert "limit" in err

def test_ok(capsys):
    assert main(["--file", "x.csv"]) == 0
    assert "read" in capsys.readouterr().out`,
          output: `2 passed in 0.03s`,
          tip: `CLI 测试用 [[argv]] + [[capsys]]，只验证参数映射/退出码，业务逻辑回 core 测。`
        },
        {
          h: "动手实验：给 scores 加 import/report 两个子命令",
          p: `实现 [[scores import CSV]] 和 [[scores report --top N]]；共享 [[--verbose]]；错误写 stderr；成功退出 0，用法错误 2。写 4 个测试：无参数、坏文件、正常导入、JSON 输出。

验收：[[scores --help]] 清楚列出两个子命令；[[scores import missing.csv]] 返回非 0 且不打印 traceback。`,
          code: String.raw`import argparse

def main(argv=None):
    p = argparse.ArgumentParser(prog="scores")
    sub = p.add_subparsers(dest="cmd", required=True)
    pi = sub.add_parser("import")
    pi.add_argument("path")
    pr = sub.add_parser("report")
    pr.add_argument("--top", type=int, default=5)
    args = p.parse_args(argv)
    if args.cmd == "import":
        print("import", args.path)
    else:
        print("report", args.top)
    return 0`,
          output: `$ scores --help
usage: scores [-h] {import,report} ...`,
          tip: `没有子命令时 [[required=True]] 会报用法错误并退出 2；不要让程序静默继续。`
        }
      ],
      points: [
        "入口函数不接收参数，返回退出码，测试可传 argv。",
        "子命令用 subparsers + set_defaults 分发。",
        "配置优先级命令行 > 环境变量 > 文件 > 默认。",
        "stdout 放数据，stderr 放日志/错误。",
        "CLI 测试只验证参数映射和退出码。"
      ],
      practice: "给 `scores` 加 import/report 子命令，错误写 stderr，正确返回 0/2；写 4 个 CLI 测试覆盖无参数、坏文件、正常导入、JSON 输出。"
    },
    {
      id: "ch13-3",
      title: "13.3 构建、版本与发布",
      minutes: 45,
      lead: "发布不是「把代码压缩上传」。wheel/sdist、版本号、签名、PyPI token、CI 每一步都可能让用户装不上。这一节走一遍最小发布流程，并在干净环境验证。",
      source: "Introducing Python 3rd · Ch.13；Beginning Python 4th · Ch.18",
      sections: [
        {
          h: "sdist 与 wheel：两种产物不是二选一",
          p: `sdist（[[.tar.gz]]）是源码包，安装时可能编译；wheel（[[.whl]]）是预构建包，安装快。纯 Python 包通常同时发布两者，pip 优先选 wheel。

wheel 文件名带 Python 标签/ABI/平台标签；[[py3-none-any]] 表示纯 Python、跨平台。带 C 扩展的 wheel 要为目标平台分别构建（manylinux/macOS/Windows）。

[[python -m build]] 默认生成两者；构建环境要干净，避免把本地依赖混进包。[[twine check]] 检查元数据/README 渲染。`,
          code: String.raw`python -m pip install build twine
python -m build
twine check dist/*
# 输出
# Checking dist/scores-0.1.0-py3-none-any.whl: PASSED
# Checking dist/scores-0.1.0.tar.gz: PASSED`,
          output: `Checking dist/scores-0.1.0-py3-none-any.whl: PASSED
Checking dist/scores-0.1.0.tar.gz: PASSED`,
          tip: `wheel 是预构建、sdist 是源码；发布前 [[twine check]]，别把 README 语法错误带上 PyPI。`
        },
        {
          h: "版本号：语义化版本与预发布",
          p: `语义化版本 MAJOR.MINOR.PATCH：不兼容改动升 MAJOR，新增功能升 MINOR，修 bug 升 PATCH。预发布用 [[1.0.0rc1]]、[[1.0.0b1]]；本地版本用 [[+local]]。

版本号只能升不能降；PyPI 不允许覆盖同版本文件。发布前打 tag，tag 与包版本一致；CI 从 tag 读取版本，避免手改漏改。

[[importlib.metadata.version("scores")]] 读安装版本；包内不要硬编码版本字符串，容易和 pyproject 不一致。`,
          code: String.raw`# pyproject.toml
# version = "0.1.0"

# 读取安装版本
from importlib.metadata import version
print(version("scores"))

# 打 tag
# git tag v0.1.0
# git push origin v0.1.0`,
          output: `0.1.0`,
          tip: `PyPI 同版本不能覆盖；tag、pyproject、发布版本三者必须一致。`
        },
        {
          h: "发布到 TestPyPI 再上正式",
          p: `正式 PyPI 不可撤回（只能 yank），先把包发到 [[test.pypi.org]] 验证安装。用 [[--repository testpypi]] 和独立 token；TestPyPI 的依赖可能不全，安装时加 [[--extra-index-url]] 指向正式源。

[[twine upload]] 用 API token，不要用密码；token 放 [[~/.pypirc]] 或 CI secret，权限设为 600。不要把 token 提交到 Git。

上传后立刻在干净 venv [[pip install --index-url ... scores==0.1.0]]，跑入口命令。`,
          code: String.raw`twine upload --repository testpypi dist/*
# 安装验证
python -m pip install --index-url https://test.pypi.org/simple/ \
  --extra-index-url https://pypi.org/simple/ scores==0.1.0
scores --help`,
          output: `usage: scores [-h] {import,report} ...`,
          tip: `先 TestPyPI 再正式；token 不进 Git，上传后在干净环境装一遍。`
        },
        {
          h: "CI 发布：tag 触发、最小权限",
          p: `GitHub Actions 可以在 push tag 时构建/发布。使用 PyPI trusted publishing（OIDC）可以免 token；否则用 repository secret 存 token，并限制 workflow 权限。

CI 步骤：checkout、setup-python、install build、build、twine check、upload。测试/类型检查应在前置 job，发布 job 只负责构建上传。

不要在 PR 上发布；不要让 fork PR 访问 secret。发布 workflow 用 [[permissions: id-token: write]] 最小权限。`,
          code: String.raw`# .github/workflows/release.yml
# on:
#   push:
#     tags: ["v*"]
# jobs:
#   build:
#     runs-on: ubuntu-latest
#     steps:
#       - uses: actions/checkout@v4
#       - uses: actions/setup-python@v5
#         with: {python-version: "3.12"}
#       - run: python -m pip install build twine
#       - run: python -m build
#       - run: twine check dist/*`,
          output: `Successfully built scores-0.1.0.tar.gz and scores-0.1.0-py3-none-any.whl`,
          tip: `tag 触发发布，PR 不发布；优先 trusted publishing，token 只给发布 job。`
        },
        {
          h: "安装后验证：干净环境、入口、资源",
          p: `发布前最后一步是在干净 venv 安装 wheel，检查：[[pip check]] 无冲突；入口命令存在；包内资源可读；[[import scores]] 不依赖 cwd；版本号正确。

还要测 [[pip install --no-deps]] 是否只装包本身，以及 [[pip uninstall]] 是否清理干净。资源路径用 [[importlib.resources]]，不要用 [[__file__]] 拼相对路径。

如果包依赖可选功能，测「不装 extra 时核心功能可用，装了 extra 时增强功能可用」。`,
          code: String.raw`python -m venv /tmp/verify
source /tmp/verify/bin/activate
python -m pip install dist/scores-0.1.0-py3-none-any.whl
python -m pip check
scores --help
python -c "import scores, importlib.metadata as m; print(m.version('scores'))"`,
          output: `No broken requirements found.
usage: scores [-h] ...
0.1.0`,
          tip: `发布验证要装 wheel 而不是源码目录；检查入口、资源、版本、[[pip check]]。`
        },
        {
          h: "动手实验：完整发布一次到 TestPyPI",
          p: `给 [[scores]] 打 [[0.1.0]] 版本，[[python -m build]]，[[twine check]]，上传 TestPyPI；在全新 venv 安装并运行 [[scores --help]]。记录每一步命令和输出，形成发布清单。

验收：wheel 内容包含 [[scores/data/sample.csv]]；安装后资源可读；入口命令可用；版本号一致。`,
          code: String.raw`python -m build
twine check dist/*
twine upload --repository testpypi dist/*
python -m venv /tmp/verify
source /tmp/verify/bin/activate
python -m pip install --index-url https://test.pypi.org/simple/ \
  --extra-index-url https://pypi.org/simple/ scores==0.1.0
scores --help`,
          output: `Checking dist/scores-0.1.0-py3-none-any.whl: PASSED
usage: scores [-h] ...`,
          tip: `发布清单要能复制执行；每一步都有可核对输出，别靠记忆。`
        }
      ],
      points: [
        "sdist 是源码，wheel 是预构建；纯 Python 两者都发。",
        "版本只升不降，tag/pyproject/包版本一致。",
        "先 TestPyPI 验证，再正式 PyPI。",
        "CI 用 tag 触发、最小权限、token 不进 Git。",
        "发布前在干净 venv 装 wheel 验证入口/资源/版本。"
      ],
      practice: "把 `scores` 发布到 TestPyPI：build、twine check、upload、干净 venv 安装、运行入口；写一份可复制的发布清单。"
    }
  ]
});

/* --- ch14.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch14",
  part: 4,
  number: "14",
  title: "HTTP、API 与网页抓取",
  summary: "从「打开网页」到「可靠地拿到数据」：请求方法、状态码、超时、重试、分页、认证、HTML 解析和抓取礼仪。这一章的重点是稳定和合法，不是把网页扒下来。",
  goals: [
    "能解释请求/响应、状态码、头、超时和重试",
    "能调用 JSON API 并处理分页、认证、限流",
    "能用 HTML 解析器提取结构化数据",
    "知道 robots、版权和抓取频率的边界"
  ],
  lessons: [
    {
      id: "ch14-1",
      title: "14.1 HTTP 请求与响应：先会读状态码",
      minutes: 45,
      lead: "抓数据失败，八成不是解析写错，而是请求就没成功。这一节用标准库和 requests 发请求，讲清状态码、头、超时、编码和重试。",
      source: "Introducing Python 3rd · Ch.22、24；Beginning Python 4th · Ch.15；Head First Python 3rd · Ch.8–9",
      sections: [
        {
          h: "请求由方法、URL、头、体组成",
          p: `HTTP 请求不只是「打开一个链接」。方法（GET/POST/PUT/DELETE）表达意图；URL 包含路径和查询参数；头携带 [[Accept]]、[[User-Agent]]、认证；体放表单/JSON。GET 应该只读，POST 才改数据。

响应包含状态码、头、体。状态码 2xx 成功、3xx 重定向、4xx 客户端错误、5xx 服务端错误。404 不是「网络坏了」，401/403 是认证/权限，429 是限流，500 是对方服务出错。

调试先看状态码和响应头，不要直接 [[.text]] 解析。状态码不对，后面全是白费。`,
          code: String.raw`from urllib.request import urlopen, Request

req = Request("https://httpbin.org/get", headers={"User-Agent": "scores-course/1.0"})
with urlopen(req, timeout=10) as resp:
    print(resp.status, resp.headers.get_content_type())
    print(resp.read(200).decode("utf-8"))`,
          output: `200 application/json
{"args": {}, "headers": {"User-Agent": "scores-course/1.0", ...}}`,
          tip: `先看状态码/头，再解析体；[[urlopen]] 对 4xx/5xx 会抛 [[HTTPError]]，要捕获。`
        },
        {
          h: "超时、重试与连接复用",
          p: `没有超时的请求可能永远挂着。[[timeout=]] 是连接+读取的总超时（不同库语义略有差异）；生产要设短超时并重试瞬时错误。

重试只针对超时、连接重置、429、5xx；4xx 参数/认证错误重试无意义。退避加抖动，次数有上限。[[requests.Session]] 复用连接，批量请求快很多。

不要在主线程里同步抓几百个 URL；用并发/队列，并限制并发数，避免把对方打挂。`,
          code: String.raw`import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()
retry = Retry(total=3, backoff_factor=0.3, status_forcelist=[429, 500, 502, 503, 504])
session.mount("https://", HTTPAdapter(max_retries=retry))
r = session.get("https://httpbin.org/status/200", timeout=10)
print(r.status_code)`,
          output: `200`,
          tip: `超时必须设；只重试瞬时错误，[[Retry]] 配 [[status_forcelist]] 和退避。`
        },
        {
          h: "编码：响应头、meta 和 apparent_encoding",
          p: `[[response.text]] 按响应头 [[charset]] 解码；没有 charset 时 requests 可能猜错。[[response.content]] 是原始 bytes，最可靠；需要时用 [[response.apparent_encoding]] 或显式 [[encoding=]]。

HTML 的 [[<meta charset>]] 可能与响应头冲突；以响应头为准，若缺失再看 meta。JSON 应该按 UTF-8 解析，BOM 要清掉。

不要用 [[response.text]] 直接 [[json.loads]] 做生产解析；先 [[response.content]] 再显式解码，错误可追踪。`,
          code: String.raw`import requests, json

r = requests.get("https://httpbin.org/encoding/utf8", timeout=10)
print(r.headers.get("content-type"))
print(r.encoding)
data = json.loads(r.content.decode("utf-8"))
print(list(data)[:2])`,
          output: `text/html; charset=utf-8
utf-8
['slideshow', 'author']`,
          tip: `优先 [[response.content]] + 显式解码；[[response.text]] 的猜测可能错。`
        },
        {
          h: "认证：不要把 token 写进代码",
          p: `API 认证常见 Bearer token、API key、Basic auth。token 放环境变量/密钥管理，不写进源码/日志/Git。请求头用 [[Authorization: Bearer ...]]，不要放 URL 查询串（会进日志/浏览器历史）。

[[requests]] 的 [[auth=]] 适合 Basic；自定义头适合 Bearer。401 表示凭证缺失/失效，403 表示凭证有效但无权限；不要混。

需要刷新 token 时，封装一个客户端，统一处理过期/重试；不要让每个调用点自己拼头。`,
          code: String.raw`import os, requests

token = os.environ["API_TOKEN"]
headers = {"Authorization": f"Bearer {token}"}
r = requests.get("https://httpbin.org/bearer", headers=headers, timeout=10)
print(r.status_code)
print(r.json().get("authenticated"))`,
          output: `200
True`,
          tip: `token 放环境变量/密钥管理；401 是没认证，403 是没权限，别混。`
        },
        {
          h: "动手实验：写一个带重试的下载器",
          p: `实现 [[fetch_json(url)]]：10 秒超时、3 次重试、只重试 429/5xx/超时、指数退避、返回解析后的 JSON；错误带状态码和响应片段。

用 [[httpbin.org/status/500]] 和 [[/json]] 测试；记录每次重试原因。验收：失败时不吞异常，错误信息能定位是网络、状态码还是 JSON 解析。`,
          code: String.raw`import requests, time

def fetch_json(url, attempts=3):
    last = None
    for i in range(attempts):
        try:
            r = requests.get(url, timeout=10)
            if r.status_code in (429, 500, 502, 503, 504):
                raise requests.HTTPError(f"status {r.status_code}", response=r)
            r.raise_for_status()
            return r.json()
        except (requests.Timeout, requests.ConnectionError, requests.HTTPError) as err:
            last = err
            time.sleep(0.3 * (2 ** i))
    raise RuntimeError(f"fetch failed: {last}")`,
          output: `{'slideshow': {...}}`,
          tip: `重试函数最终必须抛出，不要返回 None；错误要带状态码/原因。`
        }
      ],
      points: [
        "先看状态码/头，再解析体；4xx 不是网络故障。",
        "请求必须设超时；只重试瞬时错误并退避。",
        "用 content + 显式解码，别完全信任 response.text。",
        "token 放环境变量，401 和 403 语义不同。",
        "批量抓取要限并发，别打挂对方。"
      ],
      practice: "写 `fetch_json(url)`：10s 超时、3 次重试、只重试 429/5xx/超时、指数退避；错误包含状态码和响应片段。"
    },
    {
      id: "ch14-2",
      title: "14.2 JSON API：分页、缓存与限流",
      minutes: 45,
      lead: "真实 API 不会一次给你全部数据。这一节讲分页游标、速率限制、缓存、增量同步和错误契约，让采集脚本能跑一整晚而不被封。",
      source: "Introducing Python 3rd · Ch.22、24；Head First Python 3rd · Ch.8–9",
      sections: [
        {
          h: "分页的三种形态：offset、page、cursor",
          p: `offset/limit 用 [[?offset=0&limit=100]]；page 用 [[?page=1&per_page=100]]；cursor 用 [[next_cursor]]/[[nextPageToken]]。前两种可能因数据变化重复/漏行，cursor 更稳定。

分页必须有终止条件：返回空数组、[[next]] 为 null、cursor 重复、达到最大页数。不要只靠「返回少于 limit」判断，有些 API 最后一页仍返回满页。

分页要限速并记录进度；中断后能从 cursor/offset 续跑。把每页原始响应存下来，解析失败可重放。`,
          code: String.raw`def iter_pages(fetch, max_pages=100):
    cursor = None
    for page in range(max_pages):
        data = fetch(cursor)
        yield page, data
        cursor = data.get("next_cursor")
        if not cursor:
            return

# 伪代码：fetch(cursor) 返回 {"items": [...], "next_cursor": "..."} `,
          output: `page=0 items=2 next=abc
page=1 items=1 next=None`,
          tip: `分页要有明确终止条件；cursor 比 offset 稳，中断后从 cursor 续跑。`
        },
        {
          h: "限流：读 Retry-After，不要硬撞",
          p: `429 响应常带 [[Retry-After]] 秒数；按它等待，不要固定 sleep。没有该头时用指数退避。并发数限制在对方文档建议内，别开 100 个线程。

批量任务先测单页耗时，再估算总时间；如果 API 限制 60 次/分钟，就把请求间隔设 1 秒以上。缓存已获取的数据，重跑不重复请求。

被限流不是「对方坏了」，是你在超速。记录 429 次数和等待时间，作为容量规划依据。`,
          code: String.raw`import time, requests

r = requests.get("https://httpbin.org/status/429", timeout=10)
if r.status_code == 429:
    wait = int(r.headers.get("Retry-After", "5"))
    print("wait", wait)
    time.sleep(wait)`,
          output: `wait 5`,
          tip: `优先读 [[Retry-After]]；没有就指数退避，别固定 0.1 秒硬撞。`
        },
        {
          h: "缓存：ETag、Last-Modified 与本地存储",
          p: `HTTP 缓存用 [[ETag]]/[[If-None-Match]] 和 [[Last-Modified]]/[[If-Modified-Since]]，服务端返回 304 时不用重传体。适合不常变的数据。

本地缓存可以按 URL 哈希存原始 JSON，记录时间/ETag；下次先发条件请求或直接读缓存（按业务容忍度）。缓存要能失效，不能永远返回旧数据。

不要把缓存和业务数据混在一个文件；缓存目录可删、可重建，业务数据要备份。`,
          code: String.raw`import requests

headers = {"If-None-Match": '"abc123"'}
r = requests.get("https://httpbin.org/etag/abc123", headers=headers, timeout=10)
print(r.status_code)
if r.status_code == 304:
    print("use cache")`,
          output: `304
use cache`,
          tip: `304 表示缓存仍有效；本地缓存按 URL/ETag 存，目录可删可重建。`
        },
        {
          h: "增量同步：用时间/游标而不是全量重拉",
          p: `全量重拉在数据量大时既慢又容易被限流。API 通常支持 [[since]]/[[updated_after]] 或增量游标；本地记录最后同步时间/ID，下次只拉新增。

时间戳有边界问题：时区、服务端延迟、同一秒多条。用「时间 + ID」复合游标更稳；没有游标就多拉一点重叠窗口，再按主键去重。

增量同步要幂等：同一条记录重复写入不产生重复行。数据库用唯一键 + upsert，文件用主键去重。`,
          code: String.raw`from datetime import datetime, timezone

last = "2026-11-23T00:00:00Z"
now = datetime.now(timezone.utc).isoformat()
print({"since": last, "until": now})`,
          output: `{'since': '2026-11-23T00:00:00Z', 'until': '2026-11-24T...'}`,
          tip: `增量用复合游标/重叠窗口；写入要幂等，重复拉取不能产生重复行。`
        },
        {
          h: "错误契约：区分可重试与不可重试",
          p: `API 错误体常含 code/message/details。不要只记录 HTTP 状态，要记录业务 code；同样的 400 可能是参数错、配额错、权限错。

封装异常：[[ApiError(status, code, message, retryable)]]；调用方按 [[retryable]] 决定重试。不要把所有异常都包成 RuntimeError。

日志记录请求 id/URL/状态/业务 code，不记录 token 和完整个人数据。`,
          code: String.raw`class ApiError(Exception):
    def __init__(self, status, code, message, retryable=False):
        super().__init__(f"{status} {code}: {message}")
        self.status = status
        self.code = code
        self.retryable = retryable

err = ApiError(429, "rate_limited", "slow down", retryable=True)
print(err, err.retryable)`,
          output: `429 rate_limited: slow down True`,
          tip: `异常带 status/code/retryable；调用方按 retryable 决定，不靠猜状态码。`
        },
        {
          h: "动手实验：抓取一个分页 API 并落盘",
          p: `用 httpbin 或公开 API 模拟分页，写 [[fetch_all()]]：读 cursor、限速、重试、缓存每页、输出 JSONL。要求：中断后能从最后 cursor 续跑；重复运行不重复写。

验收：3 页数据总数正确；429 时等待；坏 JSON 页记录错误但不丢前面页。`,
          code: String.raw`import json, time
from pathlib import Path

pages = [
    {"items": [{"id": 1}], "next_cursor": "c2"},
    {"items": [{"id": 2}], "next_cursor": None},
]
out = Path("items.jsonl")
with out.open("w", encoding="utf-8") as f:
    for page in pages:
        for item in page["items"]:
            f.write(json.dumps(item) + "\n")
        time.sleep(0.2)
print(out.read_text())`,
          output: `{"id": 1}
{"id": 2}`,
          tip: `每页落盘/记录 cursor，中断可续；重复运行按 id 去重。`
        }
      ],
      points: [
        "分页有 offset/page/cursor，cursor 更稳。",
        "终止条件要明确，别只靠返回数量。",
        "限流读 Retry-After，缓存已拉数据。",
        "增量同步用复合游标，写入要幂等。",
        "异常带 status/code/retryable，调用方按契约处理。"
      ],
      practice: "写 `fetch_all()` 抓 3 页分页 API：限速、重试、每页落盘、支持 cursor 续跑；重复运行按 id 去重。"
    },
    {
      id: "ch14-3",
      title: "14.3 HTML 解析与抓取边界",
      minutes: 45,
      lead: "网页不是 API：结构会变、编码会乱、反爬会拦。这一节用 BeautifulSoup/lxml 提取数据，讲选择器、容错、robots、版权和抓取礼仪。",
      source: "Introducing Python 3rd · Ch.22、24；Beginning Python 4th · Ch.15；Head First Python 3rd · Ch.8–9",
      sections: [
        {
          h: "先看 robots 与条款，再写爬虫",
          p: `抓取前检查 [[/robots.txt]]、网站条款、数据版权。robots 是爬虫协议，不是法律，但违反可能被封/追责；个人数据、付费内容、明确禁止抓取的站点不要碰。

公开 API 优先于爬网页；网页结构随时变，API 更稳定。抓取只取必要字段，不复制整站内容；存储/发布要遵守版权。

设置可识别的 [[User-Agent]] 和联系方式，控制频率；不要伪装浏览器绕过封锁。`,
          code: String.raw`import requests

r = requests.get("https://example.com/robots.txt", timeout=10)
print(r.status_code)
print(r.text[:200])`,
          output: `200
User-agent: *
Disallow: /private/`,
          tip: `先读 robots/条款；优先 API，只取必要字段，别复制整站内容。`
        },
        {
          h: "HTML 解析器：BeautifulSoup 与 lxml",
          p: `[[BeautifulSoup(html, "html.parser")]] 是标准库解析器，容错好但慢；[[lxml]] 快，需安装。CSS 选择器用 [[select]]/[[select_one]]；属性用 [[.get]]，文本用 [[.get_text(strip=True)]]。

不要用正则解析 HTML；嵌套、属性顺序、实体转义会让正则失控。解析器能处理不完整标签。

解析要容错：字段缺失返回 None 并记录，不要 [[[0]]] 直接取；页面结构变化时，失败要可观察。`,
          code: String.raw`from bs4 import BeautifulSoup

html = '<div class="row"><span class="name">林晓</span><span class="score">91</span></div>'
soup = BeautifulSoup(html, "html.parser")
row = soup.select_one(".row")
print(row.select_one(".name").get_text(strip=True))
print(row.select_one(".score").get_text(strip=True))`,
          output: `林晓
91`,
          tip: `用 CSS 选择器 + [[get_text(strip=True)]]；不要用正则解析 HTML。`
        },
        {
          h: "表格/列表提取：先定位容器再逐行",
          p: `抓列表时先找「行容器」，再在每行里找字段；不要从全文档直接找第一个 [[.score]]，否则会串行。表格用 [[find_all("tr")]]，跳过表头，按列名/位置取值。

分页网页要处理「下一页」链接和相对 URL；用 [[urljoin(base, href)]] 拼绝对地址。详情页可能需要二次请求，控制并发和缓存。

提取后统一清洗：去空白、全角转半角、数字转 float、日期转 date；坏行记录来源 URL。`,
          code: String.raw`from bs4 import BeautifulSoup
from urllib.parse import urljoin

html = '<ul><li><a href="/r/1">林晓</a><b>91</b></li><li><a href="/r/2">周宁</a><b>86</b></li></ul>'
soup = BeautifulSoup(html, "html.parser")
base = "https://example.com"
for li in soup.select("li"):
    name = li.a.get_text(strip=True)
    score = float(li.b.get_text(strip=True))
    url = urljoin(base, li.a["href"])
    print(name, score, url)`,
          output: `林晓 91.0 https://example.com/r/1
周宁 86.0 https://example.com/r/2`,
          tip: `先定位行容器再取字段；相对链接用 [[urljoin]]，不要手拼字符串。`
        },
        {
          h: "反爬与限速：不要把自己变成攻击流量",
          p: `常见反爬：403、验证码、IP 封禁、返回假数据。不要试图绕过验证码/付费墙；遇到 403 先停下来检查条款和频率。

合理做法：降并发、加延迟、用缓存、遵守 [[Retry-After]]、使用官方 API/导出。需要大量数据时，联系数据方获取授权/批量接口。

抓取任务要可暂停/可恢复，记录失败 URL；不要因为一个 403 就无限重试。`,
          code: String.raw`import time

for page in range(1, 6):
    print("fetch page", page)
    time.sleep(1.2)  # 限速示例：每分钟不超过 50 次`,
          output: `fetch page 1
fetch page 2
...`,
          tip: `403/验证码不是要「绕过」，而是降速/换 API/申请授权；失败 URL 要记录。`
        },
        {
          h: "结构化输出：原始页 + 解析结果都留",
          p: `抓取任务要保留原始响应（或哈希/URL/时间），解析失败可重放；解析结果单独存 JSONL/CSV。不要把原始 HTML 和业务数据混在一个文件。

每条记录带来源 URL、抓取时间、页面哈希；重复抓取用哈希去重。数据版本变化时能追溯「这条来自哪一版页面」。

发布抓取数据前脱敏：去掉个人信息、token、内部链接；遵守版权/数据库权利。`,
          code: String.raw`import hashlib, json

html = "<div>林晓 91</div>"
record = {
    "url": "https://example.com/r/1",
    "sha256": hashlib.sha256(html.encode()).hexdigest()[:12],
    "name": "林晓",
    "score": 91,
}
print(json.dumps(record, ensure_ascii=False))`,
          output: `{"url": "https://example.com/r/1", "sha256": "7d...", "name": "林晓", "score": 91}`,
          tip: `保留原始页/哈希/URL，解析失败可重放；发布前脱敏并检查版权。`
        },
        {
          h: "动手实验：抓一个公开榜单页",
          p: `选一个允许抓取的公开榜单，抓前 2 页：解析行、翻页、限速、保存原始 HTML 哈希和 JSONL。要求：页面缺字段不崩；重复运行按 URL 去重；输出前 10 条。

验收：记录来源 URL/时间/哈希；403/429 时停止并报告，不无限重试。`,
          code: String.raw`from bs4 import BeautifulSoup
import json, hashlib

html = '<table><tr><th>name</th><th>score</th></tr><tr><td>林晓</td><td>91</td></tr></table>'
soup = BeautifulSoup(html, "html.parser")
rows = []
for tr in soup.select("tr")[1:]:
    cells = [c.get_text(strip=True) for c in tr.select("td")]
    if len(cells) == 2:
        rows.append({"name": cells[0], "score": float(cells[1])})
print(json.dumps(rows, ensure_ascii=False))`,
          output: `[{"name": "林晓", "score": 91.0}]`,
          tip: `缺字段/少列就跳过并记录；不要用固定下标硬取导致 IndexError。`
        }
      ],
      points: [
        "先读 robots/条款，优先 API，只取必要字段。",
        "用 HTML 解析器/CSS 选择器，不要正则解析 HTML。",
        "先定位行容器再取字段；相对 URL 用 urljoin。",
        "403/验证码不要绕过，降速/申请授权。",
        "保留原始页/哈希/URL，发布前脱敏。"
      ],
      practice: "抓一个允许抓取的公开榜单前 2 页：解析行、翻页、限速、保存原始哈希和 JSONL；重复运行按 URL 去重。"
    }
  ]
});

/* --- ch15.js --- */

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

/* --- ch16.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch16",
  part: 4,
  number: "16",
  title: "文件系统、办公自动化与定时任务",
  summary: "让 Python 替你处理重复劳动：遍历目录、调用外部命令、读写 Excel/Word/PDF、定时运行并告警。这一章的重点是安全边界和可观测性，不是「一键脚本」。",
  goals: [
    "能用 pathlib/subprocess 安全地操作文件和命令",
    "能批量处理 Excel/Word/PDF/CSV",
    "能把脚本变成可定时、可重试、可告警的任务",
    "知道自动化中的删除/覆盖/权限风险"
  ],
  lessons: [
    {
      id: "ch16-1",
      title: "16.1 pathlib、shutil 与 subprocess",
      minutes: 45,
      lead: "自动化第一步是「找文件、读文件、调命令」。这一节用 pathlib 替代字符串拼路径，用 subprocess 安全调外部程序，并处理编码、退出码和清理。",
      source: "Introducing Python 3rd · Ch.11、13；Beginning Python 4th · Ch.16；Head First Python 3rd · Ch.3–4",
      sections: [
        {
          h: "pathlib：路径是对象，不是字符串",
          p: `[[Path("data") / "scores.csv"]] 用 [[/]] 拼路径，跨平台自动处理分隔符。[[p.exists()]]、[[p.is_file()]]、[[p.suffix]]、[[p.stem]]、[[p.parent]] 比字符串切片可靠。

[[p.glob("*.csv")]] 列当前目录，[[p.rglob("*.csv")]] 递归；[[iterdir()]] 列直接子项。遍历时过滤目录/隐藏文件，别把 [[.git]] 当数据。

[[p.read_text(encoding="utf-8")]]/[[write_text]] 是便捷读写；大文件仍用 [[open()]] 流式。路径拼接不要用 [[+ "/" +]]，Windows 会出问题。`,
          code: String.raw`from pathlib import Path

root = Path("data")
root.mkdir(exist_ok=True)
(root / "a.csv").write_text("name,score\n林晓,91\n", encoding="utf-8")
for p in root.glob("*.csv"):
    print(p.name, p.suffix, p.stat().st_size)`,
          output: `a.csv .csv 20`,
          tip: `路径用 [[Path]] + [[/]]；递归 [[rglob]]，编码显式 [[utf-8]]。`
        },
        {
          h: "shutil：复制、移动、删除的边界",
          p: `[[shutil.copy2]] 复制文件并保留元数据；[[copytree]] 复制目录；[[move]] 移动/重命名；[[rmtree]] 删除整个目录。删除是不可逆的，脚本里要二次确认或 dry-run。

[[shutil.disk_usage]] 查空间；[[shutil.which]] 找可执行文件。复制大文件用 [[copyfileobj]] 分块并显示进度。

不要用 [[os.remove]] 拼路径误删；删除前打印目标、检查是否在允许目录内，避免 [[rm -rf /]] 类事故。`,
          code: String.raw`import shutil
from pathlib import Path

src = Path("data/a.csv")
dst = Path("backup/a.csv")
dst.parent.mkdir(exist_ok=True)
shutil.copy2(src, dst)
print(dst.exists(), dst.stat().st_size)`,
          output: `True 20`,
          tip: `[[copy2]] 保留元数据；[[rmtree]] 不可逆，删除前打印目标并限制根目录。`
        },
        {
          h: "subprocess：参数列表，不要 shell=True",
          p: `[[subprocess.run(["python", "script.py"], capture_output=True, text=True)]] 用参数列表，避免 shell 注入。[[shell=True]] 会把字符串交给 shell，文件名带空格/分号就出事。

[[check=True]] 在非零退出码时抛 [[CalledProcessError]]；[[timeout=]] 防挂死。[[text=True]] 按 locale 解码，跨平台可能乱码；需要时用 [[encoding="utf-8"]]。

调外部命令要检查 [[returncode]]、stdout/stderr；不要把 stderr 丢了，失败时它是唯一线索。`,
          code: String.raw`import subprocess

result = subprocess.run(
    ["python", "-c", "print('hello')"],
    capture_output=True, text=True, timeout=10, check=True
)
print(result.returncode, result.stdout.strip())`,
          output: `0 hello`,
          tip: `参数列表 + [[shell=False]] 防注入；[[check=True]]/[[timeout]] 必须有。`
        },
        {
          h: "编码与换行：跨平台三件套",
          p: `读写文本显式 [[encoding="utf-8"]]；Windows 默认可能是 GBK。[[newline=""]] 让 csv 模块自己处理换行，避免多空行。

[[Path.read_text]] 默认编码随平台；不要依赖默认。处理 BOM 用 [[utf-8-sig]]。二进制文件（图片/zip/pdf）用 [["rb"/"wb"]]，不要文本模式。

打印到控制台遇到 UnicodeEncodeError 时，设置 [[PYTHONIOENCODING=utf-8]] 或捕获异常；不要静默替换字符。`,
          code: String.raw`from pathlib import Path

p = Path("note.txt")
p.write_text("林晓,91\n", encoding="utf-8", newline="")
print(p.read_text(encoding="utf-8").splitlines())`,
          output: `['林晓,91']`,
          tip: `文本显式 utf-8、csv 用 [[newline=""]]；二进制用 rb/wb，别用文本模式。`
        },
        {
          h: "临时文件与清理",
          p: `[[tempfile.TemporaryDirectory()]] 退出时自动删目录；[[NamedTemporaryFile]] 适合临时文件。不要在手写路径 [[/tmp/xxx]]，并发会冲突。

[[try/finally]] 或 with 确保清理；异常时也要删半成品。日志/缓存不要放临时目录，重启会丢。

清理前确认路径是自己创建的；不要递归删用户目录。`,
          code: String.raw`import tempfile
from pathlib import Path

with tempfile.TemporaryDirectory() as tmp:
    p = Path(tmp) / "x.txt"
    p.write_text("ok", encoding="utf-8")
    print(p.read_text(encoding="utf-8"))
print("cleaned")`,
          output: `ok
cleaned`,
          tip: `用 [[TemporaryDirectory]] 自动清理；不要手拼 /tmp 路径，并发会撞。`
        },
        {
          h: "动手实验：批量重命名与归档",
          p: `遍历 [[data/]] 下所有 [[.csv]]，按修改日期重命名到 [[archive/YYYY-MM/]]；dry-run 模式只打印不移动；确认后执行。要求：重名不覆盖、路径不存在报错、日志记录每步。`,
          code: String.raw`from pathlib import Path
from datetime import datetime

for p in Path("data").glob("*.csv"):
    mtime = datetime.fromtimestamp(p.stat().st_mtime)
    target = Path("archive") / mtime.strftime("%Y-%m")
    print("move", p, "->", target / p.name)`,
          output: `move data/a.csv -> archive/2026-11/a.csv`,
          tip: `批量移动先 dry-run；目标存在要跳过/改名，不能静默覆盖。`
        }
      ],
      points: [
        "pathlib 拼路径/遍历，显式编码。",
        "shutil 复制/删除；删除前 dry-run 并限制根目录。",
        "subprocess 用参数列表，避免 shell=True。",
        "检查退出码/stdout/stderr，设 timeout。",
        "临时目录自动清理，批量操作先 dry-run。"
      ],
      practice: "写批量归档脚本：遍历 data/*.csv，按修改月份移到 archive/YYYY-MM；支持 --dry-run，重名不覆盖，记录日志。"
    },
    {
      id: "ch16-2",
      title: "16.2 Excel、Word、PDF 与 CSV 批处理",
      minutes: 50,
      lead: "办公文件不是纯文本：Excel 有公式/合并单元格，Word 有样式，PDF 有版式。这一节用 openpyxl/python-docx/pypdf 做可重复的批量处理，并讲清「读得出来」不等于「改得回去」。",
      source: "Introducing Python 3rd · Ch.13；Head First Python 3rd · Ch.3–4",
      sections: [
        {
          h: "openpyxl：读写 xlsx 的基本盘",
          p: `[[load_workbook(path, data_only=True)]] 读公式的缓存值；[[data_only=False]] 读公式本身。[[ws.iter_rows(values_only=True)]] 按行读，适合大表。

写用 [[Workbook()]]、[[ws.append(row)]]、[[wb.save(path)]]；样式/合并单元格/图表支持有限，复杂模板最好「复制模板再填值」。

不要用 openpyxl 读 [[.xls]]（旧格式），用 pandas/xlrd 或转换。保存会丢宏/部分格式，处理前备份。`,
          code: String.raw`from openpyxl import Workbook, load_workbook

wb = Workbook()
ws = wb.active
ws.append(["name", "score"])
ws.append(["林晓", 91])
wb.save("scores.xlsx")

wb2 = load_workbook("scores.xlsx", data_only=True)
for row in wb2.active.iter_rows(values_only=True):
    print(row)`,
          output: `('name', 'score')
('林晓', 91)`,
          tip: `[[data_only=True]] 读公式值；大表用 [[iter_rows]]；保存会丢宏，先备份。`
        },
        {
          h: "pandas + Excel：批量汇总与多 sheet",
          p: `[[pd.read_excel(path, sheet_name=None)]] 读所有 sheet 返回字典；[[ExcelWriter]] 写多 sheet。批量汇总多个文件时，先统一列名/类型。

[[to_excel]] 不保留原样式；需要模板样式时用 openpyxl 打开模板填值。日期/公式/合并单元格读进来可能是 NaN/字符串，要校验。

文件锁：Excel 打开时写入会 PermissionError；脚本要检测并提示关闭。`,
          code: String.raw`import pandas as pd
from pathlib import Path

files = list(Path(".").glob("*.xlsx"))
frames = [pd.read_excel(f) for f in files]
summary = pd.concat(frames, ignore_index=True)
with pd.ExcelWriter("summary.xlsx") as writer:
    summary.to_excel(writer, sheet_name="all", index=False)
print(summary.shape)`,
          output: `(2, 2)`,
          tip: `多文件先统一列/类型；[[ExcelWriter]] 写多 sheet；文件被占用会 PermissionError。`
        },
        {
          h: "python-docx：段落、表格与模板占位",
          p: `[[Document()]] 新建，[[add_heading]]/[[add_paragraph]]/[[add_table]] 添加内容；[[doc.save]] 保存。读取用 [[doc.paragraphs]]/[[doc.tables]]。

模板替换用占位符（如 [[{{name}}]]），遍历段落/单元格替换 [[run.text]]；跨 run 的占位符会被拆开，需要先合并或按段落文本处理。

Word 的样式/分页/页眉页脚复杂，python-docx 支持有限；正式排版用模板，不要从零画。`,
          code: String.raw`from docx import Document

doc = Document()
doc.add_heading("成绩单", level=1)
table = doc.add_table(rows=1, cols=2)
table.rows[0].cells[0].text = "姓名"
table.rows[0].cells[1].text = "分数"
doc.save("report.docx")
print("saved")`,
          output: `saved`,
          tip: `模板 + 占位符替换最稳；跨 run 占位符会被拆，先合并再替换。`
        },
        {
          h: "pypdf：读取、合并、拆分与加密",
          p: `[[PdfReader(path)]] 读页，[[PdfWriter]] 写；[[append]] 合并，[[write]] 保存。加密 PDF 用 [[reader.decrypt(password)]]。

提取文本用 [[page.extract_text()]]，但扫描件是图片，需要 OCR；版式复杂时文本顺序可能乱。不要假设 PDF 一定能抽出干净文本。

拆分按页写多个文件；合并前检查页数/大小。PDF 表单填写支持有限，复杂表单用专业库/工具。`,
          code: String.raw`from pypdf import PdfReader, PdfWriter

reader = PdfReader("in.pdf")
writer = PdfWriter()
for page in reader.pages[:2]:
    writer.add_page(page)
with open("out.pdf", "wb") as f:
    writer.write(f)
print(len(reader.pages))`,
          output: `5`,
          tip: `扫描 PDF 要 OCR；[[extract_text]] 顺序可能乱，合并/拆分后检查页数。`
        },
        {
          h: "CSV 批处理：编码、分隔符、引号",
          p: `[[csv.reader]]/[[DictReader]] 处理引号/逗号/换行；[[newline=""]] 必须加。分隔符不是逗号时 [[delimiter=";"]]；编码可能是 GBK/utf-8-sig。

不要用 [[line.split(",")]] 解析 CSV；字段里可能有逗号/引号。写 CSV 用 [[csv.writer]]，自动转义。

大文件流式读，不要一次 [[readlines]]；批处理按行处理并定期 flush。`,
          code: String.raw`import csv

with open("scores.csv", "w", encoding="utf-8", newline="") as f:
    w = csv.writer(f)
    w.writerow(["name", "score"])
    w.writerow(["林晓, A班", 91])

with open("scores.csv", encoding="utf-8", newline="") as f:
    for row in csv.DictReader(f):
        print(row)`,
          output: `{'name': '林晓, A班', 'score': '91'}`,
          tip: `CSV 用 csv 模块 + [[newline=""]]；不要 split(",")，字段可能含逗号。`
        },
        {
          h: "动手实验：批量生成成绩单 Word",
          p: `读 [[scores.csv]]，为每个学生生成一页 Word：姓名、分数、评语；用模板占位符替换，输出到 [[reports/]]。要求：文件名安全、缺字段跳过、生成数量与输入一致。`,
          code: String.raw`from docx import Document
from pathlib import Path
import csv

rows = [{"name": "林晓", "score": "91"}]
for row in rows:
    doc = Document()
    doc.add_heading(f"成绩单 - {row['name']}", level=1)
    doc.add_paragraph(f"分数：{row['score']}")
    out = Path("reports") / f"{row['name']}.docx"
    out.parent.mkdir(exist_ok=True)
    doc.save(out)
print("generated", len(rows))`,
          output: `generated 1`,
          tip: `文件名过滤非法字符；缺字段跳过并记录，生成数量要和输入对账。`
        }
      ],
      points: [
        "openpyxl 读公式值/写 xlsx，保存会丢宏。",
        "pandas 批量汇总多文件，ExcelWriter 写多 sheet。",
        "docx 用模板占位符，注意跨 run 拆分。",
        "pypdf 合并/拆分；扫描件要 OCR。",
        "CSV 用 csv 模块 + newline，不要 split。"
      ],
      practice: "读 scores.csv，用 Word 模板为每个学生生成成绩单：占位符替换、文件名安全、缺字段跳过、数量对账。"
    },
    {
      id: "ch16-3",
      title: "16.3 定时任务、日志与告警",
      minutes: 45,
      lead: "脚本能跑一次不等于能每天跑。这一节讲调度方式、幂等、锁、日志轮转、失败告警和「跑完了但没效果」的排查。",
      source: "Introducing Python 3rd · Ch.13；Head First Python 3rd · Ch.3–4",
      sections: [
        {
          h: "调度方式：cron、systemd timer、Task Scheduler",
          p: `Linux 用 [[cron]]（简单）或 [[systemd timer]]（有日志/依赖/错过补跑）；macOS 用 [[launchd]]；Windows 用任务计划程序。云上可以用平台定时任务/容器 CronJob。

cron 环境变量少、PATH 不同；脚本用绝对路径/显式解释器，别依赖交互 shell 的配置。时区要确认，服务器常是 UTC。

定时任务要能手动触发同一入口，避免「只有 cron 能跑」的隐藏逻辑。`,
          code: String.raw`# 每天 07:30 运行（crontab -e）
# 30 7 * * * /usr/bin/python3 /opt/scores/job.py >> /var/log/scores.log 2>&1

# systemd timer 更适合需要日志/依赖的场景
# systemctl list-timers`,
          output: `30 7 * * * /usr/bin/python3 /opt/scores/job.py`,
          tip: `cron 用绝对路径/显式解释器；时区确认；入口要能手动触发。`
        },
        {
          h: "幂等与锁：别让两个任务同时跑",
          p: `定时任务可能重叠（上次没跑完下次又启动）。用文件锁/数据库锁/分布式锁保证同一任务只有一个实例。[[fcntl.flock]] 适合单机；云上用 Redis/DB 锁。

幂等：重复执行不产生重复数据。写入用唯一键/upsert；发邮件用「已发送标记」；生成文件用覆盖或版本目录。

锁要能释放（异常/进程被杀）；死锁要有超时/清理策略，不能永久卡住。`,
          code: String.raw`import fcntl, time

with open("/tmp/scores.lock", "w") as lock:
    try:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except BlockingIOError:
        print("already running")
        raise SystemExit(0)
    print("running")
    time.sleep(1)`,
          output: `running`,
          tip: `单机用 [[flock]]，云上用 Redis/DB 锁；锁要可释放，任务要幂等。`
        },
        {
          h: "日志：轮转、结构化、保留策略",
          p: `用 [[logging]] 写文件，[[RotatingFileHandler]]/[[TimedRotatingFileHandler]] 轮转，避免单文件无限增长。日志含时间/级别/任务 id/耗时/结果。

结构化日志（JSON lines）便于检索；不要把个人数据/token 写进去。控制台日志和文件日志分开，cron 的 stdout 重定向到文件。

保留策略：按天/大小轮转，保留 N 份；重要审计日志另存。日志目录要有权限控制。`,
          code: String.raw`import logging
from logging.handlers import RotatingFileHandler

logger = logging.getLogger("job")
logger.setLevel(logging.INFO)
h = RotatingFileHandler("job.log", maxBytes=1_000_000, backupCount=3, encoding="utf-8")
h.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
logger.addHandler(h)
logger.info("start")`,
          output: `2026-11-24 ... INFO start`,
          tip: `[[RotatingFileHandler]] 防无限增长；日志含任务 id/耗时，不写 token/个人数据。`
        },
        {
          h: "失败告警：退出码 + 通知渠道",
          p: `任务失败要让人知道：非零退出码 + 邮件/IM/Webhook。告警内容包含任务名、时间、错误摘要、日志路径；不要只发「失败」两个字。

避免告警风暴：同一错误聚合/去重/静默窗口；恢复时发「已恢复」。告警渠道要有兜底（邮件可能进垃圾箱）。

监控「任务是否按计划运行」而不只是「是否报错」；没跑也是故障。用心跳/上次成功时间判断。`,
          code: String.raw`import sys, json, urllib.request

def alert(text):
    data = json.dumps({"text": text}).encode()
    req = urllib.request.Request("https://httpbin.org/post", data=data,
                                 headers={"Content-Type": "application/json"})
    urllib.request.urlopen(req, timeout=10).read()

alert("scores job failed: timeout")
print("alerted")`,
          output: `alerted`,
          tip: `告警带任务/时间/错误/日志路径；去重防风暴，没跑也要监控。`
        },
        {
          h: "「跑完了但没效果」怎么查",
          p: `先确认入口真的执行：cron 日志/ systemd journal / 任务平台记录。再看退出码、stdout/stderr、输出文件时间戳。

常见原因：工作目录不对（相对路径写到了别处）、环境变量缺失、权限不足、写入被旧文件锁、任务跑了空输入。每个都要在日志里可见。

加「输入行数/输出行数/耗时」指标；数量为 0 或骤降要告警。不要只看「进程退出 0」。`,
          code: String.raw`from pathlib import Path

out = Path("out/summary.csv")
print(out.exists(), out.stat().st_mtime if out.exists() else None)
print("rows", sum(1 for _ in out.open(encoding="utf-8")) if out.exists() else 0)`,
          output: `True 1763... 
rows 21`,
          tip: `查 cwd/环境变量/权限/锁/空输入；日志记录输入/输出行数，0 行要告警。`
        },
        {
          h: "动手实验：把归档脚本做成每日任务",
          p: `给 ch16-1 的归档脚本加：flock 锁、日志轮转、--dry-run、失败退出码、Webhook 告警；用 cron 每天 07:30 跑。手动触发一次，确认日志/输出/告警都正常。`,
          code: String.raw`# job.py 结构
# 1. 解析参数
# 2. 获取锁，失败退出 0（已有实例）
# 3. 执行业务，记录输入/输出数量
# 4. 异常 -> logger.exception + alert + 返回 1
# 5. 成功 -> 记录耗时 + 返回 0`,
          output: `INFO start
INFO moved=12 skipped=0
INFO done in 0.42s`,
          tip: `锁 + 日志 + 数量指标 + 告警 + 退出码，才算可运维的定时任务。`
        }
      ],
      points: [
        "cron/systemd/launchd 各有适用场景，路径/时区要显式。",
        "定时任务要幂等，并用锁防重叠。",
        "日志轮转、结构化、保留策略。",
        "失败告警带上下文，避免风暴。",
        "监控「没跑」和「跑了没效果」，看输入/输出数量。"
      ],
      practice: "把归档脚本做成每日任务：flock 锁、日志轮转、dry-run、失败告警、退出码；cron 定时并手动触发验证。"
    }
  ]
});

/* --- ch17.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch17",
  part: 4,
  number: "17",
  title: "并发、并行与异步",
  summary: "同一个「快一点」有三种答案：线程适合 I/O 等待，进程适合 CPU 计算，asyncio 适合大量网络并发。这一章讲清 GIL、锁、队列、超时和取消，避免写出「更快但会偶发错」的程序。",
  goals: [
    "能判断该用线程、进程还是 asyncio",
    "能写线程安全的生产者/消费者",
    "能用进程池绕开 GIL 做 CPU 并行",
    "能写带超时/取消/异常处理的 async 任务"
  ],
  lessons: [
    {
      id: "ch17-1",
      title: "17.1 线程、GIL 与锁",
      minutes: 45,
      lead: "线程共享内存，所以「快」和「危险」同时出现。这一节先解释 GIL 到底限制什么，再用 Lock/Queue 写一个不会丢数据的生产者-消费者。",
      source: "Introducing Python 3rd · Ch.15；Beginning Python 4th · Ch.17；Head First Python 3rd · Ch.10",
      sections: [
        {
          h: "GIL：同一时刻只有一个线程执行字节码",
          p: `CPython 的 GIL 让同一进程内同一时刻只有一个线程运行 Python 字节码。I/O 等待（网络/文件/ sleep）会释放 GIL，所以线程对 I/O 密集有效；CPU 密集的多线程不会更快，反而有切换开销。

GIL 不是「线程不安全」的同义词；共享可变状态仍需锁。GIL 只保证字节码级别不并行，不保证复合操作原子。

Python 3.13 有实验性 free-threaded 构建，但不是默认；不要假设线上没有 GIL。`,
          code: String.raw`import threading, time

def io_task():
    time.sleep(0.2)

t0 = time.perf_counter()
threads = [threading.Thread(target=io_task) for _ in range(5)]
for t in threads: t.start()
for t in threads: t.join()
print(round(time.perf_counter() - t0, 2))`,
          output: `0.21`,
          tip: `GIL 下线程适合 I/O 等待；CPU 密集多线程不会更快，共享状态仍要锁。`
        },
        {
          h: "Lock：保护复合操作，不是保护变量",
          p: `[[count += 1]] 不是原子操作（读-改-写三步），多线程会丢更新。用 [[threading.Lock]] 包住临界区：[[with lock: count += 1]]。

锁要保护「不变量」，不是「某个变量」。同一份数据的所有读写都用同一把锁；锁太多/顺序不一致会死锁。

锁的粒度：太粗失去并发，太细容易漏。临界区只放必要操作，I/O 不要放锁里。`,
          code: String.raw`import threading

count = 0
lock = threading.Lock()

def worker():
    global count
    for _ in range(1000):
        with lock:
            count += 1

threads = [threading.Thread(target=worker) for _ in range(4)]
for t in threads: t.start()
for t in threads: t.join()
print(count)`,
          output: `4000`,
          tip: `[[+=]] 不是原子；锁保护不变量，临界区别放 I/O，锁顺序要一致防死锁。`
        },
        {
          h: "Queue：生产者-消费者的标准答案",
          p: `[[queue.Queue]] 线程安全，[[put]]/[[get]] 自带锁；[[task_done]]/[[join]] 用于等待全部完成。比手写 list + Condition 简单。

生产者 [[put]]，消费者 [[get(timeout=...)]]；用哨兵 [[None]] 或 [[Event]] 通知结束。队列有界（[[maxsize]]）可以背压，防止生产过快打爆内存。

消费者异常要捕获并记录，否则 [[task_done]] 不执行，[[join]] 永久阻塞。`,
          code: String.raw`import queue, threading

q = queue.Queue(maxsize=3)
results = []

def producer():
    for i in range(5):
        q.put(i)
    q.put(None)

def consumer():
    while True:
        item = q.get()
        if item is None:
            q.task_done()
            break
        results.append(item * 2)
        q.task_done()

t1 = threading.Thread(target=producer)
t2 = threading.Thread(target=consumer)
t1.start(); t2.start(); t1.join(); t2.join()
q.join()
print(results)`,
          output: `[0, 2, 4, 6, 8]`,
          tip: `[[Queue]] 线程安全；有界队列做背压；消费者异常也要 [[task_done]]，否则 join 卡死。`
        },
        {
          h: "竞态与死锁：两个典型事故",
          p: `竞态：两个线程同时「检查再修改」，都看到旧值。解决：把检查和修改放同一临界区，或用原子结构/队列。

死锁：线程 A 拿锁 1 等锁 2，线程 B 拿锁 2 等锁 1。解决：固定锁顺序、用 [[Lock(timeout=)]]、减少嵌套锁。

调试：[[faulthandler.dump_traceback_later]] 打线程栈；日志记录锁等待。不要靠「加 sleep」掩盖竞态。`,
          code: String.raw`import threading

lock1 = threading.Lock()
lock2 = threading.Lock()

def a():
    with lock1:
        with lock2:
            print("a")

def b():
    with lock2:
        with lock1:
            print("b")

# 固定顺序：两个函数都先 lock1 再 lock2，可避免死锁`,
          output: `a
b`,
          tip: `竞态靠临界区/队列，不靠 sleep；死锁靠固定锁顺序/超时，别嵌套乱序。`
        },
        {
          h: "线程池：别手动创建几百个线程",
          p: `[[ThreadPoolExecutor(max_workers=8)]] 复用线程，[[submit]] 返回 Future，[[as_completed]] 按完成顺序取结果。适合批量 I/O。

[[future.result(timeout=)]] 取结果，异常在调用 result 时抛出；不调用就吞了异常。要在循环里处理每个 future 的异常。

线程池大小按 I/O 等待/CPU 比例调；不是越大越快，上下文切换和对方限流才是瓶颈。`,
          code: String.raw`from concurrent.futures import ThreadPoolExecutor, as_completed

def fetch(n):
    return n * n

with ThreadPoolExecutor(max_workers=4) as pool:
    futures = [pool.submit(fetch, i) for i in range(5)]
    for f in as_completed(futures):
        print(f.result())`,
          output: `0
1
4
9
16`,
          tip: `线程池复用线程；[[as_completed]] 按完成取结果，异常在 [[result()]] 抛，别漏处理。`
        },
        {
          h: "动手实验：并发下载 + 限流",
          p: `用 ThreadPoolExecutor 抓 10 个 URL，max_workers=4，每个请求 timeout=10，失败重试 1 次；统计成功/失败。要求：异常不吞、结果带 URL、总耗时打印。`,
          code: String.raw`from concurrent.futures import ThreadPoolExecutor
import time

def fake_fetch(url):
    time.sleep(0.1)
    if "bad" in url:
        raise ValueError("bad url")
    return url, 200

urls = [f"https://example.com/{i}" for i in range(8)] + ["https://bad.example"]
with ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(lambda u: (u, "ok"), urls))
print(len(results))`,
          output: `9`,
          tip: `限流 + 超时 + 异常记录；[[map]] 会按输入顺序返回，异常在迭代时抛。`
        }
      ],
      points: [
        "GIL 限制 CPU 并行，I/O 等待会释放。",
        "复合操作要锁，锁保护不变量。",
        "Queue 是生产者-消费者标准答案，有界做背压。",
        "死锁靠固定锁顺序/超时，不靠 sleep。",
        "线程池限并发，异常在 result() 处理。"
      ],
      practice: "用 ThreadPoolExecutor 抓 10 个 URL：max_workers=4、timeout、失败重试、统计成功/失败、打印总耗时。"
    },
    {
      id: "ch17-2",
      title: "17.2 多进程与进程池",
      minutes: 45,
      lead: "CPU 密集任务要多核并行，就绕开 GIL 用进程。这一节讲进程启动方式、可 pickle 的参数、进程池、共享状态和「为什么子进程没输出」。",
      source: "Introducing Python 3rd · Ch.15；Beginning Python 4th · Ch.17",
      sections: [
        {
          h: "进程隔离：内存不共享，参数要可 pickle",
          p: `[[multiprocessing]] 每个进程独立内存/解释器，绕开 GIL；代价是启动慢、通信要序列化。传给子进程的函数/参数必须可 pickle：lambda、局部函数、打开的文件句柄通常不行。

Windows/macOS 默认 [[spawn]]，子进程重新导入主模块；入口必须放在 [[if __name__ == "__main__":]]，否则递归启动。

进程间共享用 [[Queue]]/[[Pipe]]/[[Manager]]；共享内存用 [[Value]]/[[Array]]，但要加锁。`,
          code: String.raw`from multiprocessing import Process, Queue

def square(q, n):
    q.put(n * n)

if __name__ == "__main__":
    q = Queue()
    p = Process(target=square, args=(q, 7))
    p.start()
    print(q.get())
    p.join()`,
          output: `49`,
          tip: `进程参数要可 pickle；入口放 [[__main__]]；共享用 Queue/Pipe，共享内存要锁。`
        },
        {
          h: "进程池：map 与 apply_async",
          p: `[[Pool(processes=4)]] 复用进程；[[pool.map(func, items)]] 阻塞并保序，[[map_async]]/[[apply_async]] 异步。[[imap]] 流式返回，适合大输入。

[[chunksize]] 影响调度开销；任务太细碎时调大。进程池里的全局状态不共享，每个进程独立。

[[with Pool() as pool]] 退出时关闭；异常会从 [[map]] 抛回主进程。不要在线程池里再开进程池，嵌套容易死锁。`,
          code: String.raw`from multiprocessing import Pool

def square(n):
    return n * n

if __name__ == "__main__":
    with Pool(4) as pool:
        print(pool.map(square, range(6)))`,
          output: `[0, 1, 4, 9, 16, 25]`,
          tip: `[[Pool.map]] 保序阻塞；任务细碎调 [[chunksize]]；别嵌套进程池。`
        },
        {
          h: "共享状态：Manager 慢但通用",
          p: `[[Manager().dict()/list()]] 通过代理对象共享，支持多进程，但每次访问都走 IPC，慢。适合少量状态，不适合高频大对象。

[[Value]]/[[Array]] 是共享内存，快但需要自己加锁；[[Lock]] 要一起传。竞态和线程一样存在。

更好的架构是「进程独立计算，结果通过 Queue 汇总」，而不是大量共享状态。`,
          code: String.raw`from multiprocessing import Manager, Process

def add(d, key):
    d[key] = key * 2

if __name__ == "__main__":
    with Manager() as m:
        d = m.dict()
        p = Process(target=add, args=(d, 3))
        p.start(); p.join()
        print(dict(d))`,
          output: `{3: 6}`,
          tip: `Manager 通用但慢；高频共享用 Value/Array + 锁；优先「独立计算 + Queue 汇总」。`
    },
    {
      h: "子进程没输出/卡住怎么查",
      p: `子进程 print 可能缓冲；用 [[flush=True]] 或 logging。[[spawn]] 下子进程重新导入模块，模块级代码会再执行，导致重复/卡住。

卡住常见：Queue 满/空、join 顺序错、子进程异常未传播、锁未释放。先看 [[p.is_alive()]]、[[p.exitcode]]，再加超时/日志。

[[faulthandler]] 可以 dump 子进程栈；资源泄漏用 [[resource]]/psutil 查。`,
      code: String.raw`from multiprocessing import Process
import time

def work():
    print("child", flush=True)

if __name__ == "__main__":
    p = Process(target=work)
    p.start()
    p.join(2)
    print(p.is_alive(), p.exitcode)`,
          output: `child
False 0`,
          tip: `子进程 print 加 [[flush=True]]；卡住看 is_alive/exitcode，join 加超时。`
    },
    {
      h: "动手实验：CPU 密集任务对比线程/进程",
      p: `写一个计算 [[sum(i*i for i in range(5_000_000))]] 的函数；分别用 4 线程、4 进程跑 4 次，记录耗时。预期：线程接近串行，进程更快（多核）。`,
      code: String.raw`import time
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor

def work(n):
    return sum(i * i for i in range(n))

if __name__ == "__main__":
    for cls in (ThreadPoolExecutor, ProcessPoolExecutor):
        t0 = time.perf_counter()
        with cls(4) as pool:
            list(pool.map(work, [2_000_000] * 4))
        print(cls.__name__, round(time.perf_counter() - t0, 2))`,
          output: `ThreadPoolExecutor 0.9
ProcessPoolExecutor 0.3`,
          tip: `CPU 密集用进程；线程被 GIL 串行。实测受机器核数影响，别背结论。`
    }
      ],
      points: [
        "进程隔离绕开 GIL，参数要可 pickle。",
        "入口放 __main__，spawn 会重新导入模块。",
        "Pool.map 保序，imap 流式，chunksize 调调度。",
        "Manager 通用但慢，优先 Queue 汇总。",
        "子进程卡住看 is_alive/exitcode，join 加超时。"
      ],
      practice: "对比 4 线程 vs 4 进程跑 4 个 CPU 密集任务，记录耗时并解释 GIL；再写一个 Pool.map 版本。"
    },
    {
      id: "ch17-3",
      title: "17.3 asyncio：事件循环、任务与取消",
      minutes: 50,
      lead: "asyncio 不是「更快的线程」，而是单线程协作式并发：遇到 await 让出控制权。这一节讲事件循环、Task、gather、超时、取消和同步阻塞的坑。",
      source: "Introducing Python 3rd · Ch.15；Head First Python 3rd · Ch.10",
      sections: [
        {
          h: "协程与事件循环：await 才是让出点",
          p: `[[async def]] 定义协程，调用返回协程对象，必须 [[await]] 或交给 [[asyncio.run]] 才执行。事件循环调度所有任务；一个任务在 [[await]] 时让出，其他任务才能跑。

[[await asyncio.sleep(1)]] 不阻塞线程；[[time.sleep(1)]] 会阻塞整个循环。同步 I/O/CPU 计算必须放线程/进程池，否则并发失效。

[[asyncio.run(main())]] 创建/关闭循环；不要在已有循环里再调用它。`,
          code: String.raw`import asyncio

async def work(name):
    await asyncio.sleep(0.2)
    return name

async def main():
    print(await work("a"))

asyncio.run(main())`,
          output: `a`,
          tip: `[[await]] 才让出；[[time.sleep]] 阻塞整个循环，同步 I/O 要放 executor。`
        },
        {
          h: "gather 与 Task：并发跑多个协程",
          p: `[[asyncio.gather(a(), b())]] 并发跑并收集结果；默认一个异常会取消其他？[[return_exceptions=True]] 收集异常而不中断。

[[asyncio.create_task]] 立即调度，返回 Task；[[task.cancel()]] 请求取消，协程在下一个 await 抛 [[CancelledError]]。取消不是强杀，要配合清理。

[[asyncio.wait_for(coro, timeout=)]] 超时取消；[[asyncio.timeout]] 上下文管理器更灵活。超时后要处理清理/重试。`,
          code: String.raw`import asyncio

async def work(n):
    await asyncio.sleep(0.1)
    return n * 2

async def main():
    results = await asyncio.gather(work(1), work(2), work(3))
    print(results)

asyncio.run(main())`,
          output: `[2, 4, 6]`,
          tip: `[[gather]] 并发收集；[[return_exceptions=True]] 不中断；取消是协作式，要清理。`
        },
        {
          h: "超时、取消与清理",
          p: `超时用 [[asyncio.wait_for]] 或 [[async with asyncio.timeout(5)]]；超时抛 [[TimeoutError]]，被取消的任务要 [[finally]] 释放资源。

[[CancelledError]] 在 Python 3.8+ 继承 [[BaseException]]，不要用 [[except Exception]] 吞掉；要 [[raise]] 继续传播。

关闭前 [[await task]] 或 [[gather(..., return_exceptions=True)]]，避免「Task was destroyed but it is pending」警告。`,
          code: String.raw`import asyncio

async def slow():
    try:
        await asyncio.sleep(2)
    finally:
        print("cleanup")

async def main():
    try:
        await asyncio.wait_for(slow(), timeout=0.2)
    except TimeoutError:
        print("timeout")

asyncio.run(main())`,
          output: `cleanup
timeout`,
          tip: `超时/取消要在 [[finally]] 清理；[[CancelledError]] 是 BaseException，别用 Exception 吞。`
    },
    {
      h: "同步阻塞与线程池桥接",
      p: `在 async 函数里调用 [[requests.get]]/[[time.sleep]]/重 CPU 计算会阻塞循环。用 [[asyncio.to_thread(func, ...)]] 或 [[loop.run_in_executor]] 放到线程池。

[[to_thread]] 适合 I/O；CPU 密集用 [[ProcessPoolExecutor]]，但参数要可 pickle。不要把所有调用都丢线程池，线程池也有上限。

异步库（httpx/aiohttp/asyncpg）优先；没有异步库时再桥接。`,
      code: String.raw`import asyncio, time

def blocking(n):
    time.sleep(0.2)
    return n * 2

async def main():
    result = await asyncio.to_thread(blocking, 3)
    print(result)

asyncio.run(main())`,
          output: `6`,
          tip: `同步阻塞用 [[to_thread]]/executor；CPU 密集用进程池；优先原生异步库。`
    },
    {
      h: "结构化并发：TaskGroup 与异常",
      p: `[[async with asyncio.TaskGroup() as tg: tg.create_task(...)]] 在退出时等待全部任务；任一任务失败会取消同组其他任务，并抛 [[ExceptionGroup]]。

[[except*]] 可以按类型处理 ExceptionGroup；不要用普通 except 只捕获第一个。TaskGroup 比手动 gather 更容易保证「不泄漏任务」。

需要「一个失败不影响其他」时用 gather(return_exceptions=True)；需要「一起成功/一起失败」用 TaskGroup。`,
      code: String.raw`import asyncio

async def ok():
    await asyncio.sleep(0.1)
    return "ok"

async def main():
    async with asyncio.TaskGroup() as tg:
        t1 = tg.create_task(ok())
        t2 = tg.create_task(ok())
    print(t1.result(), t2.result())

asyncio.run(main())`,
          output: `ok ok`,
          tip: `TaskGroup 一起成功/失败；gather(return_exceptions=True) 允许部分失败。`
    },
    {
      h: "动手实验：并发抓 10 个页面（模拟）",
      p: `写 [[fetch(url)]] 用 [[asyncio.sleep]] 模拟延迟；用 TaskGroup 并发 10 个，限制并发数（Semaphore=5），单请求超时 1 秒，统计成功/超时。`,
      code: String.raw`import asyncio

sem = asyncio.Semaphore(5)

async def fetch(i):
    async with sem:
        await asyncio.sleep(0.1)
        if i == 7:
            raise TimeoutError("slow")
        return i

async def main():
    results = await asyncio.gather(*(fetch(i) for i in range(10)), return_exceptions=True)
    print(sum(isinstance(r, int) for r in results), sum(isinstance(r, Exception) for r in results))

asyncio.run(main())`,
          output: `9 1`,
          tip: `Semaphore 限并发；gather(return_exceptions=True) 统计成功/异常，不让一个失败取消全部。`
    }
      ],
      points: [
        "await 才让出，time.sleep 阻塞整个循环。",
        "gather 并发收集，create_task 立即调度。",
        "取消是协作式，finally 清理，CancelledError 别吞。",
        "同步阻塞用 to_thread/executor。",
        "TaskGroup 一起成功/失败，gather 允许部分失败。"
      ],
      practice: "写并发 fetch 10 个 URL：Semaphore 限 5、单请求超时 1s、统计成功/超时；再用 TaskGroup 版本对比异常行为。"
    }
  ]
});

/* --- ch18.js --- */

window.PY_FOUNDATIONS_CHAPTERS = window.PY_FOUNDATIONS_CHAPTERS || [];
window.PY_FOUNDATIONS_CHAPTERS.push({
  id: "ch18",
  part: 5,
  number: "18",
  title: "综合项目：游泳成绩清洗与报表系统",
  summary: "把前 17 章合起来做一个能交付的项目：读原始 CSV、清洗校验、算个人最好与团体总分、生成 Markdown 报表和图表、提供 CLI、写测试、打包发布。每一节都产出可运行代码，最后一节做发布与复盘。",
  goals: [
    "能从需求写出数据契约与验收标准",
    "能实现导入、清洗、统计、报表的完整链路",
    "能为项目写单元/集成/CLI 测试",
    "能打包、定时运行并做失败告警",
    "能复盘设计取舍与后续改进"
  ],
  lessons: [
    {
      id: "ch18-1",
      title: "18.1 需求、数据契约与项目骨架",
      minutes: 55,
      lead: "项目从「要解决什么问题」开始，不是从建目录开始。这一节把模糊需求变成用户故事、数据契约、模块边界和验收标准，再搭出可运行骨架。",
      source: "综合运用 · Introducing Python 3rd / Beginning Python 4th / Head First Python 3rd",
      sections: [
        {
          h: "用户故事：谁用它、用来做什么",
          p: `场景：校游泳队教练每周拿到计时软件导出的 CSV，需要一份「谁进步了、团体总分多少、谁需要加练」的报表。现在靠手工 Excel，容易错、耗时间。

用户故事写成「作为教练，我希望……以便……」：导入本周成绩、看到个人最好、看到团体总分、导出可打印报表、失败时知道哪一行有问题。

不做的事也要写：不做在线报名、不做实时计时、不做运动员健康管理。范围清楚，项目才不会无限膨胀。`,
          code: String.raw`# 用户故事（写进 README）
# US1 作为教练，我导入计时软件 CSV，看到成功/失败行数
# US2 作为教练，我查看每个运动员的个人最好与最近一次
# US3 作为教练，我查看各队团体总分与排名
# US4 作为教练，我导出 Markdown/HTML 报表
# US5 作为教练，失败时我能定位到具体行与原因`,
          output: `5 user stories`,
          tip: `用户故事 + 明确不做什么；范围写进 README，防止无限扩展。`
        },
        {
          h: "数据契约：列、类型、必填、合法范围",
          p: `原始 CSV 列：[[date, meet, event, athlete, team, time, rank]]。[[time]] 是 [[mm:ss.ms]] 或 [[ss.ms]]；[[rank]] 可空；[[event]] 限定自由泳/蛙泳/仰泳/蝶泳/混合泳 + 距离。

契约写明：必填列、类型、允许空值、枚举、时间格式、重复键（date+meet+event+athlete）。坏行不能静默跳过，要记录行号/原因。

契约是测试和校验的共同依据；先写契约，再写解析器。`,
          code: String.raw`# 数据契约
# date: YYYY-MM-DD 必填
# meet: 非空字符串 必填
# event: 100m/200m + 泳姿 必填
# athlete: 非空 必填
# team: 非空 必填
# time: mm:ss.ms 或 ss.ms，>0 必填
# rank: 正整数或空
# 唯一键: date + meet + event + athlete`,
          output: `contract defined`,
          tip: `契约写清列/类型/必填/枚举/唯一键；坏行记录行号原因，不静默跳过。`
        },
        {
          h: "项目骨架：src 布局 + 模块边界",
          p: `按职责分模块：[[models.py]] 领域对象；[[parsing.py]] 时间/CSV 解析；[[cleaning.py]] 校验/去重；[[stats.py]] 统计；[[report.py]] 报表；[[cli.py]] 入口；[[config.py]] 配置。

依赖方向：cli → cleaning/stats/report → models/parsing；models 不依赖其他业务模块，避免循环导入。测试按模块放 [[tests/]]。

骨架先能 [[python -m scores.cli --help]]，再逐步填实现；不要一次写十个空文件。`,
          code: String.raw`# src/scores/
#   __init__.py
#   models.py
#   parsing.py
#   cleaning.py
#   stats.py
#   report.py
#   cli.py
# tests/
#   test_parsing.py
#   test_cleaning.py
#   test_stats.py
#   test_cli.py
# pyproject.toml`,
          output: `skeleton ready`,
          tip: `按职责分模块，依赖单向；先跑通 --help，再填实现。`
        },
        {
          h: "领域模型：dataclass 表达一条成绩",
          p: `[[Result]] 用 dataclass：date、meet、event、athlete、team、time_seconds、rank。解析后统一存秒，展示时格式化；不要在各处反复解析字符串。

[[frozen=True]] 让记录不可变，避免统计时被误改；需要修改用 [[dataclasses.replace]]。[[slots=True]] 省内存（Python 3.10+）。

模型里不放 CSV 行号/原始字符串；这些属于「导入结果/错误报告」，不要污染领域对象。`,
          code: String.raw`from dataclasses import dataclass
from datetime import date

@dataclass(frozen=True, slots=True)
class Result:
    date: date
    meet: str
    event: str
    athlete: str
    team: str
    seconds: float
    rank: int | None = None`,
          output: `Result(date=..., athlete='林晓', seconds=62.35)`,
          tip: `领域模型存规范化值（秒/date），不存原始字符串；frozen 防统计误改。`
        },
        {
          h: "错误策略： fail-fast 还是收集全部错误",
          p: `导入 CSV 时，一行坏不应中断整个文件；收集 [[RowError(row_no, reason, raw)]]，最后报告「成功 N / 失败 M」。但结构性错误（缺列/编码错）应 fail-fast。

统计阶段遇到缺字段/负时间应报错，不静默跳过；这是程序 bug，不是数据脏。

错误信息要可操作：行号、列名、期望格式、实际值。不要只写「invalid row」。`,
          code: String.raw`from dataclasses import dataclass

@dataclass
class RowError:
    row_no: int
    reason: str
    raw: dict

errors = [RowError(3, "time 格式应为 mm:ss.ms", {"time": "abc"})]
print(errors[0])`,
          output: `RowError(row_no=3, reason='time 格式应为 mm:ss.ms', raw={'time': 'abc'})`,
          tip: `行级错误收集不中断；结构错误 fail-fast；错误带行号/列/期望/实际。`
        },
        {
          h: "验收标准：可执行、可核对",
          p: `验收不是「看起来对」，而是可执行断言：给定样例 CSV，导入成功 8 行、失败 2 行；个人最好等于预期秒数；团体总分等于预期；报表包含指定章节；CLI 退出码正确。

每条验收对应一个测试/命令；发布前逐条跑。验收标准写进 README 或 [[docs/acceptance.md]]。

先写验收，再写实现；否则容易做出一堆「看起来能用」的功能。`,
          code: String.raw`# 验收示例
# [ ] scores import sample.csv -> "ok=8 failed=2"
# [ ] scores report sample.csv -> report.md 包含 "个人最好"
# [ ] 坏时间行出现在 failed 列表，行号=3
# [ ] scores --help 退出码 0
# [ ] 缺文件退出码非 0 且 stderr 有路径`,
          output: `5 acceptance checks`,
          tip: `验收写成可执行断言/命令；每条对应测试，发布前逐条跑。`
        }
      ],
      points: [
        "用户故事 + 不做什么，控制范围。",
        "数据契约写清列/类型/必填/唯一键。",
        "src 布局按职责分模块，依赖单向。",
        "领域模型存规范化值，frozen 防误改。",
        "行级错误收集、结构错误 fail-fast。",
        "验收标准可执行、可核对。"
      ],
      practice: "为「游泳成绩报表」写 README：5 条用户故事、数据契约、模块图、5 条验收命令；搭出可跑 `--help` 的骨架。"
    },
    {
      id: "ch18-2",
      title: "18.2 CSV 导入、时间解析与清洗",
      minutes: 60,
      lead: "这一节实现导入链路：读 CSV、解析时间、校验字段、去重、把坏行收集成报告。所有函数都可单测，不依赖真实文件。",
      source: "综合运用 · Introducing Python 3rd / Beginning Python 4th / Head First Python 3rd",
      sections: [
        {
          h: "读 CSV：DictReader + 编码 + 缺列检查",
          p: `[[csv.DictReader]] 把每行变字典，列名来自表头；[[newline=""]] 必须加。编码先试 [[utf-8-sig]]，失败再 [[gbk]]（计时软件常导出 GBK）。

缺列/多列是结构错误，直接抛 [[ContractError]]；不要进入逐行解析。空文件/只有表头返回空结果并提示。

不要用 [[line.split(",")]]；队名/项目可能含逗号。`,
          code: String.raw`import csv
from pathlib import Path

REQUIRED = {"date", "meet", "event", "athlete", "team", "time"}

def read_rows(path: Path) -> list[dict]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames or not REQUIRED <= set(reader.fieldnames):
            raise ValueError(f"缺列: {REQUIRED - set(reader.fieldnames or [])}")
        return list(reader)`,
          output: `rows=10`,
          tip: `DictReader + newline；缺列 fail-fast；编码先 utf-8-sig 再考虑 GBK。`
        },
        {
          h: "时间解析：mm:ss.ms 与 ss.ms",
          p: `计时格式常见 [[1:02.35]]、[[62.35]]、[[01:02.3]]。解析规则：按冒号分段，最后一段是秒（可带小数）；分钟乘 60；验证 [[0 < seconds < 3600]]。

用 [[Decimal]] 或整数毫秒避免浮点误差；展示时再格式化。坏格式抛 [[TimeFormatError]]，带原值。

不要用 [[float("1:02.35")]]；也不要假设一定有冒号。`,
          code: String.raw`def parse_time(text: str) -> float:
    text = text.strip()
    if not text:
        raise ValueError("time 为空")
    parts = text.split(":")
    if len(parts) == 1:
        seconds = float(parts[0])
    elif len(parts) == 2:
        seconds = int(parts[0]) * 60 + float(parts[1])
    else:
        raise ValueError(f"time 格式不支持: {text}")
    if not (0 < seconds < 3600):
        raise ValueError(f"time 超出范围: {text}")
    return seconds

print(parse_time("1:02.35"), parse_time("62.35"))`,
          output: `62.35 62.35`,
          tip: `按冒号分段，分钟×60；验证范围；用 Decimal/毫秒避免浮点误差。`
        },
        {
          h: "逐行校验：收集 RowError 而不是中断",
          p: `每行依次校验：日期 [[date.fromisoformat]]、枚举项目、非空姓名/队名、时间解析、rank 正整数或空。任一失败记录 [[RowError]] 并继续下一行。

成功行构造 [[Result]]；日期/时间规范化。校验函数返回 [[(result, error)]] 或抛异常由外层捕获；保持函数纯粹、可测。

错误原因要具体：[[date 格式应为 YYYY-MM-DD: 2026/11/24]]。`,
          code: String.raw`from datetime import date

def parse_row(row: dict, row_no: int):
    try:
        d = date.fromisoformat(row["date"].strip())
        seconds = parse_time(row["time"])
        rank_text = (row.get("rank") or "").strip()
        rank = int(rank_text) if rank_text else None
        if rank is not None and rank <= 0:
            raise ValueError("rank 必须为正")
        return {"date": d, "seconds": seconds, "rank": rank}, None
    except (ValueError, KeyError) as err:
        return None, {"row_no": row_no, "reason": str(err)}

print(parse_row({"date": "2026-11-24", "time": "1:02.35", "rank": "2"}, 2))`,
          output: `({'date': datetime.date(2026, 11, 24), 'seconds': 62.35, 'rank': 2}, None)`,
          tip: `逐行 try/except 收集错误；原因具体到列/期望/实际，成功行规范化。`
        },
        {
          h: "去重：唯一键与保留策略",
          p: `唯一键 [[date+meet+event+athlete]]。重复可能是计时软件重复导出/预赛决赛同名；保留策略要明确：保留最新 rank/最好成绩，还是报错？

默认「同一唯一键保留成绩最好的一条」，并在报告中记录「去重 N 条」。不要静默丢；教练需要知道。

用字典按 key 聚合，比较 [[seconds]]；并列时保留 rank 更小/后导入。`,
          code: String.raw`rows = [
    {"key": ("11-24", "100m", "林晓"), "seconds": 63.0},
    {"key": ("11-24", "100m", "林晓"), "seconds": 62.3},
]
best = {}
for r in rows:
    if r["key"] not in best or r["seconds"] < best[r["key"]]["seconds"]:
        best[r["key"]] = r
print(best[("11-24", "100m", "林晓")]["seconds"])`,
          output: `62.3`,
          tip: `唯一键 + 保留最好成绩；去重数量写进报告，不能静默丢。`
        },
        {
          h: "原子写入与导入报告",
          p: `清洗结果写 [[clean.csv]] 前先写临时文件，成功后 [[replace]] 原子替换；失败不留半文件。原始文件不动。

导入报告 [[import-report.json]]：总行数、成功、失败、去重、错误列表（行号/原因/原值）。CLI 打印摘要，详细进文件。

不要覆盖上一次报告；按时间戳/批次目录保存，便于追溯。`,
          code: String.raw`from pathlib import Path
import json, os

def atomic_write(path: Path, text: str):
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(text, encoding="utf-8")
    os.replace(tmp, path)

atomic_write(Path("clean.csv"), "date,seconds\n2026-11-24,62.35\n")
print("ok")`,
          output: `ok`,
          tip: `临时文件 + [[os.replace]] 原子替换；报告含总数/成功/失败/去重/错误明细。`
        },
        {
          h: "动手实验：导入样例并核对计数",
          p: `构造 10 行样例：2 行坏时间、1 行缺队名、1 行重复；实现 [[import_csv(path)]] 返回 [[ImportResult(rows, errors, duplicates)]]，断言成功 6、失败 3、去重 1。

验收：坏行行号正确；报告中能看到原因；clean.csv 只含成功且去重后的行。`,
          code: String.raw`from dataclasses import dataclass, field

@dataclass
class ImportResult:
    rows: list = field(default_factory=list)
    errors: list = field(default_factory=list)
    duplicates: int = 0

print(ImportResult(rows=[1, 2], errors=[1, 2, 3], duplicates=1))`,
          output: `ImportResult(rows=[1, 2], errors=[1, 2, 3], duplicates=1)`,
          tip: `导入结果用 dataclass 聚合；测试断言成功/失败/去重三个计数。`
        }
      ],
      points: [
        "DictReader + newline，缺列 fail-fast。",
        "时间按冒号解析，验证范围，避免浮点误差。",
        "逐行校验收集错误，不中断整批。",
        "唯一键去重，保留策略明确并计数。",
        "原子写入，导入报告保留错误明细。"
      ],
      practice: "实现 `import_csv(path)`：10 行样例中成功 6/失败 3/去重 1；坏行行号正确，clean.csv 原子写入。"
    },
    {
      id: "ch18-3",
      title: "18.3 统计：个人最好、团体总分与进步",
      minutes: 55,
      lead: "统计层只接收规范化的 Result，不碰 CSV/字符串。这一节实现个人最好、团体总分、进步幅度和排名，并明确并列/缺赛/项目差异的规则。",
      source: "综合运用 · Introducing Python 3rd / Beginning Python 4th / Head First Python 3rd",
      sections: [
        {
          h: "个人最好：按运动员+项目分组取最小秒",
          p: `「个人最好」通常按 [[athlete + event]] 分组，取最小 [[seconds]]；跨赛事/日期都算。并列时保留最近日期/更好 rank。

不要按 [[athlete]] 全项目取最小，那会把 50m 和 100m 混在一起。项目名要规范化（大小写/空格/距离）。

输出 [[PersonalBest(athlete, event, seconds, date, meet)]]，便于报表展示来源。`,
          code: String.raw`from collections import defaultdict

rows = [
    {"athlete": "林晓", "event": "100m自由泳", "seconds": 63.0, "date": "2026-11-02"},
    {"athlete": "林晓", "event": "100m自由泳", "seconds": 62.3, "date": "2026-11-24"},
]
best = {}
for r in rows:
    key = (r["athlete"], r["event"])
    if key not in best or r["seconds"] < best[key]["seconds"]:
        best[key] = r
print(best[("林晓", "100m自由泳")])`,
          output: `{'athlete': '林晓', 'event': '100m自由泳', 'seconds': 62.3, 'date': '2026-11-24'}`,
          tip: `个人最好按「运动员+项目」分组；别把不同距离混在一起，并列要有规则。`
        },
        {
          h: "团体总分：名次积分与并列规则",
          p: `常见积分：第 1 名 8 分、第 2 名 6 分、第 3 名 5 分……按赛事规则。只统计有 rank 的行；缺 rank 不计分但可展示。

并列名次按同一积分或按规则分配；必须写清楚。接力项目是否双倍/是否计入团体，也要配置化。

按 [[team]] 汇总，输出 [[TeamScore(team, points, golds, silvers, bronzes)]]；排序按 points 降序，再按金牌数。`,
          code: String.raw`from collections import defaultdict

points_map = {1: 8, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1}
rows = [
    {"team": "A", "rank": 1},
    {"team": "A", "rank": 3},
    {"team": "B", "rank": 2},
]
scores = defaultdict(int)
for r in rows:
    scores[r["team"]] += points_map.get(r["rank"], 0)
print(dict(scores))`,
          output: `{'A': 13, 'B': 6}`,
          tip: `积分规则配置化；只统计有 rank 的行；并列/接力规则写清楚。`
        },
        {
          h: "进步幅度：需要「上一次」而不是只有最好",
          p: `进步 = 上一次成绩 - 本次成绩（秒数越小越好）。按运动员+项目按日期排序，取最近两条；只有一条时无进步。

跨赛季/跨距离不可比；项目名必须一致。进步为负表示退步，报表用「+/-」表达。

输出 [[Progress(athlete, event, previous, current, delta, pct)]]；pct = delta / previous。`,
          code: String.raw`rows = [
    {"athlete": "林晓", "event": "100m自由泳", "seconds": 63.0, "date": "2026-11-02"},
    {"athlete": "林晓", "event": "100m自由泳", "seconds": 62.3, "date": "2026-11-24"},
]
rows.sort(key=lambda r: r["date"])
prev, cur = rows[-2], rows[-1]
delta = prev["seconds"] - cur["seconds"]
print(round(delta, 2), round(delta / prev["seconds"] * 100, 1))`,
          output: `0.7 1.1`,
          tip: `进步用最近两条同项目成绩；只有一条无进步；负值表示退步。`
        },
        {
          h: "排名与并列：不要用 sorted 后下标当名次",
          p: `名次是「成绩相同的并列」，不是数组下标。按 seconds 升序，维护 [[rank]]：相同成绩同名次，下一名跳号（1,2,2,4）或连续（1,2,2,3），按赛事规则。

输出排名表 [[RankRow(rank, athlete, seconds)]]；缺成绩不参与排名。

浮点比较用 [[round(seconds, 2)]] 或毫秒整数；直接 [[==]] 可能因精度失败。`,
          code: String.raw`rows = [("林晓", 62.35), ("周宁", 62.10), ("陈默", 62.35)]
rows.sort(key=lambda r: r[1])
ranked = []
last, rank = None, 0
for i, (name, sec) in enumerate(rows, 1):
    if sec != last:
        rank = i
        last = sec
    ranked.append((rank, name, sec))
print(ranked)`,
          output: `[(1, '周宁', 62.1), (2, '林晓', 62.35), (2, '陈默', 62.35)]`,
          tip: `名次按成绩并列，不用下标；浮点用四舍五入/毫秒比较，规则写清楚。`
        },
        {
          h: "统计层的输入输出契约",
          p: `统计函数只接收 [[list[Result]]]，返回 dataclass 列表；不读文件、不打印、不依赖全局配置。这样可以用固定样例单测。

缺赛/缺 rank/项目名不一致要在函数边界处理：抛 [[StatsError]] 或返回空，不要静默产生错误总分。

统计结果排序稳定：积分降序 + 金牌降序 + 队名，保证报表可复现。`,
          code: String.raw`from dataclasses import dataclass

@dataclass(frozen=True)
class TeamScore:
    team: str
    points: int
    golds: int

scores = [TeamScore("A", 13, 1), TeamScore("B", 6, 0)]
print(sorted(scores, key=lambda s: (-s.points, -s.golds, s.team)))`,
          output: `[TeamScore(team='A', points=13, golds=1), TeamScore(team='B', points=6, golds=0)]`,
          tip: `统计层纯函数：输入 Result 列表，输出 dataclass；排序键固定保证可复现。`
        },
        {
          h: "动手实验：用固定样例验证统计",
          p: `构造 3 个运动员、2 个项目、2 个队的数据；断言个人最好、团体总分、进步、排名四类结果。特别测试：并列、缺 rank、只有一条成绩。`,
          code: String.raw`rows = [
    {"athlete": "林晓", "event": "100m", "team": "A", "seconds": 63.0, "rank": 1},
    {"athlete": "林晓", "event": "100m", "team": "A", "seconds": 62.3, "rank": 2},
    {"athlete": "周宁", "event": "100m", "team": "B", "seconds": 62.3, "rank": 2},
]
print(min(r["seconds"] for r in rows if r["athlete"] == "林晓"))`,
          output: `62.3`,
          tip: `测试覆盖并列/缺 rank/单条成绩；固定样例让统计结果可手算核对。`
        }
      ],
      points: [
        "个人最好按运动员+项目分组取最小。",
        "团体积分规则配置化，缺 rank 不计分。",
        "进步用最近两条同项目成绩。",
        "名次按成绩并列，不用下标。",
        "统计层纯函数，排序稳定可复现。"
      ],
      practice: "用固定样例实现个人最好/团体总分/进步/排名，测试并列、缺 rank、单条成绩三种边界。"
    },
    {
      id: "ch18-4",
      title: "18.4 CLI、配置与报表生成",
      minutes: 60,
      lead: "把统计结果变成教练能看的报表：CLI 子命令、配置优先级、Markdown/HTML 输出、可选图表、退出码和日志。这一节完成用户真正使用的入口。",
      source: "综合运用 · Introducing Python 3rd / Beginning Python 4th / Head First Python 3rd",
      sections: [
        {
          h: "CLI 子命令：import / report / check",
          p: `[[scores import raw.csv --out clean.csv]] 做导入清洗；[[scores report clean.csv --out report.md]] 生成报表；[[scores check clean.csv]] 只校验不写。

每个子命令 [[set_defaults(func=...)]]，主函数分发并返回退出码。共享参数（--verbose/--config）放父 parser。

[[--help]] 要能看懂；子命令 help 写清输入/输出/示例。`,
          code: String.raw`import argparse

def cmd_import(args):
    print("import", args.input, "->", args.out)
    return 0

def cmd_report(args):
    print("report", args.input, "->", args.out)
    return 0

p = argparse.ArgumentParser(prog="scores")
sub = p.add_subparsers(dest="cmd", required=True)
pi = sub.add_parser("import"); pi.add_argument("input"); pi.add_argument("--out", default="clean.csv"); pi.set_defaults(func=cmd_import)
pr = sub.add_parser("report"); pr.add_argument("input"); pr.add_argument("--out", default="report.md"); pr.set_defaults(func=cmd_report)
args = p.parse_args(["import", "raw.csv"])
raise SystemExit(args.func(args))`,
          output: `import raw.csv -> clean.csv`,
          tip: `子命令分发 + 返回退出码；共享参数放父 parser，help 写输入/输出/示例。`
        },
        {
          h: "配置：默认、文件、环境变量、命令行",
          p: `配置项：输入编码、积分表、输出目录、是否画图。优先级：命令行 > 环境变量 > [[scores.toml]] > 内置默认。

用 [[tomllib]] 读 TOML（3.11+）；缺文件用默认，不报错。命令行 [[default=None]] 区分「没传」；最后合并。

[[--show-config]] 打印生效配置（隐藏敏感项），线上排查必备。`,
          code: String.raw`import argparse, os, tomllib

defaults = {"encoding": "utf-8-sig", "out_dir": "out"}
env = {"out_dir": os.environ.get("SCORES_OUT", defaults["out_dir"])}
p = argparse.ArgumentParser()
p.add_argument("--out-dir", default=None)
args = p.parse_args([])
out_dir = args.out_dir or env["out_dir"]
print(out_dir)`,
          output: `out`,
          tip: `优先级命令行>环境>TOML>默认；[[default=None]] 区分没传；[[--show-config]] 可排查。`
        },
        {
          h: "Markdown 报表：结构固定、数字可核对",
          p: `报表固定章节：概览（人数/项目/成绩条数）、个人最好、团体总分、进步榜、异常/去重说明、数据来源。每节用表格，数字保留 2 位。

标题写日期范围/赛事；表格列名带单位（秒）。不要在报表里写「明显进步」而没有数字。

生成函数接收统计结果，返回字符串；写文件前做模板替换/转义。Markdown 表格里的 [[|]] 要转义。`,
          code: String.raw`def render_report(best, teams):
    lines = ["# 游泳成绩报表", "", "## 个人最好", "", "| 运动员 | 项目 | 成绩(s) |", "|---|---|---|"]
    for b in best:
        lines.append(f"| {b['athlete']} | {b['event']} | {b['seconds']:.2f} |")
    return "\n".join(lines)

print(render_report([{"athlete": "林晓", "event": "100m", "seconds": 62.35}], []))`,
          output: `# 游泳成绩报表

## 个人最好

| 运动员 | 项目 | 成绩(s) |
|---|---|---|
| 林晓 | 100m | 62.35 |`,
          tip: `报表章节固定、数字保留 2 位；表格 [[|]] 要转义，结论必须有数字支撑。`
        },
        {
          h: "图表：可选依赖，失败不阻断报表",
          p: `画图用 matplotlib，但设为可选依赖 [[[project.optional-dependencies].plot]]；没安装时跳过图表并在报表注明「未生成图表」。

图表：个人最好条形图（按项目）、团体总分条形图；文件名固定 [[charts/personal-best.png]]，报表用相对路径引用。

绘图失败不能导致整个报表失败；捕获异常、记录 warning、继续生成文字报表。`,
          code: String.raw`def maybe_plot(enabled: bool):
    if not enabled:
        return "skip"
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
        fig, ax = plt.subplots()
        ax.bar(["A", "B"], [13, 6])
        fig.savefig("teams.png")
        return "ok"
    except Exception as err:
        return f"warn: {err}"

print(maybe_plot(True))`,
          output: `ok`,
          tip: `绘图是可选依赖；失败只 warn，不阻断报表；图表路径用相对路径。`
        },
        {
          h: "退出码与日志：让自动化能判断",
          p: `0 成功；1 业务失败（坏行超过阈值/无有效数据）；2 用法错误。导入时若失败行 > 20% 返回 1，否则成功但报告警告。

日志写 stderr：INFO 摘要、WARNING 跳过/去重、ERROR 失败；[[--debug]] 打 traceback。stdout 只输出结果路径/摘要，便于管道。

[[--quiet]] 只输出错误；[[--json]] 输出机器可读摘要。`,
          code: String.raw`import sys

def run(ok_rows, bad_rows):
    if ok_rows == 0:
        print("没有有效数据", file=sys.stderr)
        return 1
    if bad_rows / (ok_rows + bad_rows) > 0.2:
        print(f"坏行过多: {bad_rows}", file=sys.stderr)
        return 1
    print(f"ok={ok_rows} failed={bad_rows}")
    return 0

raise SystemExit(run(8, 2))`,
          output: `ok=8 failed=2`,
          tip: `0/1/2 退出码；坏行比例阈值；stdout 结果、stderr 日志，[[--json]] 给机器。`
        },
        {
          h: "动手实验：生成一份完整报表",
          p: `用 18.2 的 clean.csv 生成 [[report.md]]：概览、个人最好、团体总分、进步、异常说明；可选生成两张图。要求：报表数字与统计函数输出一致；无数据时退出码 1。

验收：Markdown 能被渲染；表格列对齐；图表缺失时有说明。`,
          code: String.raw`from pathlib import Path

report = "# 游泳成绩报表\n\n## 概览\n\n- 运动员：3\n- 成绩条数：8\n"
Path("report.md").write_text(report, encoding="utf-8")
print("wrote report.md")`,
          output: `wrote report.md`,
          tip: `报表数字直接取自统计结果；无数据退出 1；图表缺失要在报表说明。`
        }
      ],
      points: [
        "子命令 import/report/check，统一退出码。",
        "配置优先级命令行>环境>TOML>默认。",
        "报表章节固定，数字保留 2 位可核对。",
        "图表可选依赖，失败不阻断报表。",
        "stdout 结果、stderr 日志，支持 --json。"
      ],
      practice: "实现 import/report/check 三个子命令，生成含概览/个人最好/团体/进步/异常的 report.md；无数据退出 1。"
    },
    {
      id: "ch18-5",
      title: "18.5 测试：单元、集成、CLI 与黄金文件",
      minutes: 55,
      lead: "项目能不能改，取决于测试。这一节用 pytest 覆盖解析/清洗/统计/报表/CLI，讲 fixture、parametrize、临时目录、黄金文件和覆盖率。",
      source: "综合运用 · Introducing Python 3rd / Beginning Python 4th / Head First Python 3rd",
      sections: [
        {
          h: "测试金字塔：单元多、集成少、E2E 精",
          p: `单元测试覆盖 [[parse_time]]/[[parse_row]]/[[stats]] 等纯函数，快且定位准；集成测试跑 [[import_csv → stats → report]] 链路；CLI 测试只验证参数/退出码/输出。

不要把所有逻辑都塞进 CLI 测试；慢且难定位。纯函数占比越高，测试越稳。

每个 bug 修复先写一个失败测试，再修；防止回归。`,
          code: String.raw`# tests/test_parsing.py
import pytest
from scores.parsing import parse_time

@pytest.mark.parametrize("text,expected", [
    ("62.35", 62.35),
    ("1:02.35", 62.35),
    ("01:02.3", 62.3),
])
def test_parse_time(text, expected):
    assert parse_time(text) == expected`,
          output: `3 passed`,
          tip: `纯函数用 parametrize 多案例；集成/CLI 少而精，bug 先写失败测试。`
        },
        {
          h: "fixture：临时目录与样例文件",
          p: `[[tmp_path]] 是 pytest 内置临时目录；[[monkeypatch]] 改环境变量/cwd。不要把测试文件写到项目根，污染仓库。

样例 CSV 用 fixture 写 [[tmp_path/"raw.csv"]]，编码/坏行可控；测试结束自动清理。

共享 fixture 放 [[conftest.py]]；fixture 只做数据准备，不做断言。`,
          code: String.raw`import pytest

@pytest.fixture
def sample_csv(tmp_path):
    p = tmp_path / "raw.csv"
    p.write_text("date,meet,event,athlete,team,time\n"
                 "2026-11-24,校运会,100m,林晓,A,1:02.35\n", encoding="utf-8")
    return p

def test_read(sample_csv):
    assert sample_csv.exists()`,
          output: `1 passed`,
          tip: `[[tmp_path]] 写样例，不污染仓库；fixture 只准备数据，断言放测试里。`
        },
        {
          h: "黄金文件：报表整体对比",
          p: `报表格式/章节多，逐字段断言很啰嗦；用黄金文件 [[tests/golden/report.md]] 对比整体输出。首次生成后人工审核，再提交。

浮点/日期/路径会导致不稳定；渲染时固定小数位、固定日期格式、相对路径。对比前规范化换行。

黄金文件更新要显式 [[--update-golden]]，不能测试失败就自动覆盖。`,
          code: String.raw`from pathlib import Path

def test_report_golden(tmp_path):
    actual = "# 报表\n\n| A | 1.00 |\n"
    golden = Path("tests/golden/report.md")
    assert actual == golden.read_text(encoding="utf-8")`,
          output: `1 passed`,
          tip: `黄金文件对比整体格式；固定小数/日期/路径；更新必须显式，不自动覆盖。`
        },
        {
          h: "CLI 测试：capsys + 退出码",
          p: `[[main(argv)]] 传参数列表，[[capsys]] 捕获 stdout/stderr；断言退出码、关键输出、文件是否生成。

坏输入/缺文件/空数据各一条；成功路径一条。CLI 测试不重复业务细节。

[[tmp_path]] + [[monkeypatch.chdir]] 隔离工作目录，避免相对路径读到项目文件。`,
          code: String.raw`from scores.cli import main

def test_missing_file(tmp_path, capsys):
    rc = main(["import", str(tmp_path / "nope.csv")])
    assert rc != 0
    assert "nope.csv" in capsys.readouterr().err`,
          output: `1 passed`,
          tip: `CLI 测试断言退出码/stderr/文件生成；tmp_path + chdir 隔离相对路径。`
        },
        {
          h: "覆盖率与质量门禁",
          p: `[[pytest --cov=scores --cov-report=term-missing]] 看未覆盖行；目标不是 100%，而是关键分支（错误/边界/空值）都覆盖。

[[ruff]] 管格式/lint，[[mypy]] 管类型；CI 三者都跑。类型提示从公共函数开始，不要一次全仓 strict。

覆盖率下降要在 PR 里解释；不能为了数字写无意义断言。`,
          code: String.raw`# pyproject.toml
# [tool.pytest.ini_options]
# addopts = "--cov=scores --cov-report=term-missing"
# [tool.ruff]
# line-length = 100
# [tool.mypy]
# disallow_untyped_defs = true`,
          output: `TOTAL 92%`,
          tip: `覆盖率看关键分支，不追 100%；ruff/mypy/CI 三条一起跑。`
        },
        {
          h: "动手实验：给项目补 12 个测试",
          p: `至少覆盖：时间三种格式/坏格式、缺列、坏日期、缺队名、重复去重、个人最好、团体总分、并列排名、无数据、CLI 缺文件、报表黄金文件。

验收：[[pytest -q]] 全绿；覆盖率 > 85%；故意改坏一个解析规则，测试能红。`,
          code: String.raw`# 测试清单
# test_parsing.py: 4
# test_cleaning.py: 4
# test_stats.py: 3
# test_cli.py: 2
# test_report.py: 1`,
          output: `14 passed`,
          tip: `覆盖错误/边界/空值；故意改坏规则验证测试会红，才算有效。`
        }
      ],
      points: [
        "单元多、集成少、CLI 精；bug 先写失败测试。",
        "tmp_path/fixture 隔离文件，不污染仓库。",
        "黄金文件对比报表，更新显式。",
        "CLI 测试断言退出码/stderr/文件。",
        "覆盖率看关键分支，ruff/mypy 一起跑。"
      ],
      practice: "给项目补 12–14 个测试覆盖解析/清洗/统计/CLI/报表；跑 pytest+ruff+mypy，故意改坏规则验证测试会红。"
    },
    {
      id: "ch18-6",
      title: "18.6 打包、定时运行与项目复盘",
      minutes: 55,
      lead: "最后一节把项目交付出去：pyproject、wheel、CI、定时任务、告警和复盘。还会讨论如果重做一次，哪些设计会改。",
      source: "综合运用 · Introducing Python 3rd / Beginning Python 4th / Head First Python 3rd",
      sections: [
        {
          h: "pyproject 与入口：一条命令安装",
          p: `[[[project]]] 写 name/version/requires-python/dependencies；[[[project.scripts]]] 暴露 [[scores]] 命令；可选依赖 [[plot]]/[[dev]] 分开。

纯标准库实现时 dependencies 为空；画图才需要 matplotlib。[[python -m build]] 生成 wheel/sdist，[[twine check]] 验证元数据。

安装后在干净 venv 跑 [[scores --help]] 和一次完整导入，确认不依赖源码目录。`,
          code: String.raw`[project]
name = "scores"
version = "0.3.0"
requires-python = ">=3.11"
dependencies = []

[project.optional-dependencies]
plot = ["matplotlib>=3.8"]
dev = ["pytest>=8", "pytest-cov", "ruff", "mypy"]

[project.scripts]
scores = "scores.cli:main"`,
          output: `Successfully built scores-0.3.0-py3-none-any.whl`,
          tip: `标准库实现 dependencies 为空；plot/dev 分开；干净 venv 装 wheel 再跑。`
        },
        {
          h: "CI：测试矩阵 + 构建 + 发布",
          p: `GitHub Actions 在 3.11/3.12/3.13 跑 pytest+ruff+mypy；通过后构建 wheel，tag 时发布。缓存 pip 依赖加速。

CI 要跑真实样例/黄金文件；不要只跑单测。矩阵能发现版本差异（tomllib/类型语法）。

发布 job 用 trusted publishing/secret，最小权限；PR 不发布。`,
          code: String.raw`# .github/workflows/ci.yml
# strategy:
#   matrix:
#     python: ["3.11", "3.12", "3.13"]
# steps:
#   - uses: actions/setup-python@v5
#     with: {python-version: "3.12"}
#   - run: pip install -e ".[dev]"
#   - run: pytest -q
#   - run: ruff check .
#   - run: mypy src`,
          output: `3 jobs passed`,
          tip: `矩阵跑多版本；CI 跑样例/黄金文件；发布 job 最小权限，PR 不发布。`
        },
        {
          h: "定时运行：每周一早上生成报表",
          p: `用 cron/systemd timer 每周一 07:30 跑 [[scores import raw.csv && scores report clean.csv]]；加锁防重叠，日志轮转，失败告警。

输入文件由计时软件导出到固定目录；脚本先检查文件是否存在/是否更新，没更新就跳过并提示。

输出按日期目录保存 [[out/2026-11-24/report.md]]，保留最近 12 周。`,
          code: String.raw`# 30 7 * * 1 /opt/venv/bin/scores import /data/raw.csv --out /data/clean.csv \
#   && /opt/venv/bin/scores report /data/clean.csv --out /out/$(date +\%F)/report.md`,
          output: `cron installed`,
          tip: `周一定时 + 锁 + 日志 + 告警；输入没更新就跳过；输出按日期保留。`
        },
        {
          h: "监控：数量、耗时、失败率",
          p: `每次运行记录：输入行数、成功/失败/去重、报表生成耗时、输出文件大小；写 [[metrics.json]] 或日志。

监控规则：失败率 > 20% 告警；输出 0 行告警；超过 2 周没成功告警；耗时突增 2 倍告警。

告警带 [[run_id]]/日志路径/重放命令；恢复后发恢复通知。`,
          code: String.raw`import json
from datetime import datetime, timezone

metrics = {
    "run_id": "a1b2c3d4",
    "at": datetime.now(timezone.utc).isoformat(),
    "ok": 8, "failed": 2, "duplicates": 1,
    "seconds": 0.42,
}
print(json.dumps(metrics))`,
          output: `{"run_id": "a1b2c3d4", "ok": 8, "failed": 2, "duplicates": 1, "seconds": 0.42}`,
          tip: `记录数量/耗时/失败率；0 行/高失败/长时间无成功都要告警。`
        },
        {
          h: "复盘：哪些设计是对的，哪些会改",
          p: `对的设计：领域模型存秒、统计纯函数、行级错误收集、原子写入、报表数字可核对。这些让测试和排错容易。

会改的设计：如果数据量到百万行，CSV 全量读内存不够，要流式/数据库；如果多赛事并发，唯一键和积分规则要配置化；如果要做 Web，统计层可复用，CLI 换 API。

复盘不是自我表扬；列出「下次不这么做」的具体点。`,
          code: String.raw`# 复盘四问
# 1 哪个 bug 最晚才发现？为什么测试没覆盖？
# 2 哪个模块改得最多？边界是否不清？
# 3 哪个需求最后没用上？范围是否过大？
# 4 如果数据量 ×100，哪里先崩？`,
          output: `4 questions`,
          tip: `复盘写具体「下次不这么做」；数据量/并发/交付形态变化会推翻当前设计。`
        },
        {
          h: "结课：从语法到可交付",
          p: `三本书的知识点在这个项目里连成一条链：类型/容器/函数/类/异常/文件/测试/并发/HTTP/数据/自动化/打包。真正的能力不是记住每个语法，而是「拿到需求能拆、能验证、能交付、能复盘」。

下一步练习：把报表换成 HTML、加一个 FastAPI 查询接口、把 CSV 换成 SQLite、把统计做成可配置规则。每次只改一个维度，保持测试绿。

项目结束不等于学习结束；把这个项目放进作品集，README 写清问题/方案/验证/复盘。`,
          code: String.raw`# 结课检查
# [ ] 干净环境安装 wheel
# [ ] scores --help / import / report 可跑
# [ ] pytest + ruff + mypy 全绿
# [ ] 报表含概览/个人最好/团体/进步/异常
# [ ] 定时任务有锁/日志/告警
# [ ] README 有问题/方案/验证/复盘`,
          output: `6/6 done`,
          tip: `能力是拆需求/验证/交付/复盘；作品集 README 写问题、方案、验证、复盘。`
        }
      ],
      points: [
        "pyproject 入口 + 可选依赖，干净环境验证。",
        "CI 多版本矩阵，跑测试/黄金文件/构建。",
        "定时任务加锁/日志/告警，输入没更新跳过。",
        "监控数量/耗时/失败率，0 行也告警。",
        "复盘写具体改进，不自我表扬。"
      ],
      practice: "把项目打包成 wheel，在干净 venv 安装跑 import/report；配 CI 矩阵与周定时任务；写一页复盘（问题/方案/验证/改进）。"
    }
  ]
});

/* --- deep1.js --- */

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

/* --- deep2.js --- */

window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch2-1": [
    {
      h: "字符串的底层：不可变序列与驻留",
      p: `字符串在 Python 里是不可变序列。你每次调用 [[replace()]]、[[strip()]]、[[upper()]]，得到的都是一个新字符串，原字符串一个字符都没变。这不是性能缺陷，而是设计选择：不可变对象可以安全共享、可以作为字典键、可以在多线程环境里传递而不必加锁。理解这一点，你就不会问「为什么我调了 upper 但原变量没变」。\n\n字符串还支持「驻留」（interning）。短小的、看起来像标识符的字符串，在编译期可能被合并成同一个对象；运行时用 [[sys.intern()]] 也可以显式驻留。驻留的目的是省内存、加快比较，但它是实现优化，不是语言保证。不要用 [[is]] 比较两个字符串的内容，哪怕在你的机器上偶尔为 True。\n\n索引取的是单个字符，Python 没有单独的 char 类型，一个字符就是长度为 1 的字符串。切片取的是子串，左闭右开：[[s[1:4]]] 取下标 1、2、3，不取 4。负索引从末尾数，[[s[-1]]] 是最后一个字符；越界索引抛 [[IndexError]]，越界切片不抛错，只会尽量返回空或截断。这个不对称是有意的：索引问「第几个」，切片问「哪一段」。\n\n字符串的长度按 Unicode 码点计算，不是按显示宽度。一个汉字通常是一个码点，一个 emoji 可能由多个码点组成，终端显示宽度又可能不同。[[len("👨‍👩‍👧‍👦")]] 可能大于 1，[["👍"]] 的宽度也不等于 1。做对齐、截断、用户名校验时，别假设「一个字符就是一个格子」；涉及显示宽度要用 [[unicodedata.east_asian_width()]] 或专门的库。`,
      code: String.raw`s = "  Python 成绩单  "
print(repr(s), len(s))
print(repr(s.strip()))
print(s[2:8], s[-6:-2], s[::-1])
print(s[100:200])

a = "hello"
b = "hello"
print(a == b, a is b)

import sys
print(sys.intern("python") is sys.intern("python"))`,
      output: `'  Python 成绩单  ' 14
'Python 成绩单'
Python 成绩单 单
''
True True
True`,
      tip: `[[s[::-1]]] 能反转字符串，但会复制整串；大文本反转请先问「真的要反转吗」，不要在大文件循环里随手用。`
    },
    {
      h: "切片边界与步长：负数、越界、复制",
      p: `切片写法的完整形式是 [[s[start:stop:step]]]，三个位置都可以省略。省略 start 表示从头，省略 stop 表示到尾，省略 step 表示 1。[[s[:]]] 复制整个序列，[[s[::2]]] 取偶数位，[[s[::-1]]] 反转。切片永远返回同类型的新对象：字符串返回字符串，列表返回列表，元组返回元组。\n\n负步长时，start 和 stop 的含义仍然是「从哪到哪」，但方向反了。[[s[5:1:-1]]] 从下标 5 往左走到下标 2，不包含 1；[[s[::-1]]] 从末尾走到开头。最容易错的是 [[s[1:5:-1]]]，起点在终点右边却用了负步长，结果为空。判断方法：先确定方向，再确定两个端点是否在方向的前方。\n\n越界切片不会报错，这一点和索引不同。[[s[100:200]]] 返回空串，[[s[-100:2]]] 会从开头截到 2。切片赋值则要求右边是可迭代对象，并且会改变原列表长度；[[a[1:3] = [9]]] 用一个月素替换两个元素，列表缩短。字符串不支持切片赋值，因为不可变。\n\n切片复制是浅复制。[[a[:]]] 只复制外层列表，内层列表仍然共享；[[copy.deepcopy(a)]] 才会递归复制。切片也常被用来「看一眼」数据，但大列表切片会分配新内存，不是零成本视图。需要只读窗口时，考虑 [[memoryview]] 或迭代器；需要独立副本时，明确用 [[copy]]。`,
      code: String.raw`s = "abcdef"
print(s[1:4], s[:3], s[3:], s[:])
print(s[::2], s[::-1])
print(s[5:1:-1], s[1:5:-1])

a = [0, 1, 2, 3, 4]
a[1:4] = [9]
print(a)

nested = [[1], [2]]
shallow = nested[:]
shallow[0].append(99)
print(nested, shallow)`,
      output: `bcd abc def abcdef
ace fedcba
edc
[0, 9, 4]
[[1, 99], [2]] [[1, 99], [2]]`,
      tip: `[[s[1:5:-1]]] 为空不是 bug；负步长要求 start 在 stop 的右边。写负步长前先用小例子验证方向。`
    },
    {
      h: "方法链与清洗流水线：split、strip、join",
      p: `真实数据往往一行一个学生，字段用逗号、制表符或竖线分隔，前后还有空格。清洗的第一原则是「先观察，再切分」：[[repr(line)]] 看不可见字符，[[line.count(",")]] 看分隔符数量，[[line.startswith("\ufeff")]] 看 BOM。不要凭肉眼判断「看起来是逗号」。\n\n[[strip()]] 去掉首尾空白，[[split(",")]] 按分隔符切分，[[join()]] 把序列拼回字符串。三者经常串联：[[",".join(part.strip() for part in line.split(","))]]。注意 [[split()]] 不带参数时按任意空白切分并丢弃空段；[[split(",")]] 保留空段。这两种行为不同，处理「缺考留空」的 CSV 时必须用后者。\n\n方法链不是越长越好。超过三四个步骤时，拆成命名中间变量或生成器函数，调试时能逐段打印。[[replace()]] 默认替换全部，想只替换前几个要传 count；[[startswith()]] 可以传元组一次匹配多个前缀；[[find()]] 找不到返回 -1，[[index()]] 找不到抛异常。选择哪个，取决于你希望「没找到」是正常分支还是错误。\n\n清洗完要校验字段数量。CSV 的字段里可能包含逗号（被引号包住），用 [[split(",")]] 会切坏；简单场景可以先用 [[csv]] 模块，复杂场景用 [[pandas.read_csv()]]。课程前半段用 [[split]] 是为了让你看清分隔逻辑，不是鼓励你手写 CSV 解析器。真正处理生产数据时，让标准库做标准库擅长的事。`,
      code: String.raw`line = " 林晓, 91, 88.5,  \n"
parts = [p.strip() for p in line.split(",")]
print(parts, len(parts))

print("|".join(parts))
print("a,,b".split(","))
print("a  b".split())
print("score.csv".startswith(("score", "grades")))

bad = "林晓,91"
try:
    name, py, math = bad.split(",")
except ValueError as err:
    print("字段数不对:", err)`,
      output: `['林晓', '91', '88.5', ''] 4
林晓|91|88.5|
['a', '', 'b']
['a', 'b']
True
字段数不对: not enough values to unpack (expected 3, got 2)`,
      tip: `[[split(",")]] 会保留末尾空字段，[[split()]] 不会；解析「允许缺考」的成绩行时，先决定空字段是合法还是错误。`
    }
  ],
  "ch2-2": [
    {
      h: "格式说明符的语法：fill、align、width、precision",
      p: `f-string 的格式说明符写在冒号后面，完整语法可以记成 [[[fill][align][sign][#][0][width][,][.precision][type]]]。最常用的是对齐 [[< > ^]]、宽度、千分位逗号和精度。[[f"{name:<8}"]] 左对齐占 8 格，[[f"{score:>6.1f}"]] 右对齐、保留一位小数；[[f"{ratio:^10.2%}"]] 居中并转百分比。\n\n填充字符写在对齐符号前面。[[f"{name:*<8}"]] 用星号填满右侧，[[f"{name:0>5}"]] 用 0 填左侧。数字的零填充有专门的 [[0]] 标志，[[f"{n:05d}"]] 和 [[f"{n:0>5}"]] 都能补零，但前者只对数字有效，后者是通用字符串填充。做编号时优先 [[:03d]]，语义更清楚。\n\n精度对浮点数是小数位数，对字符串是最大长度。[[f"{pi:.3f}"]] 是 3.141，[[f"{text:.5}"]] 只保留前 5 个字符。注意字符串截断不会自动加省略号，也不会考虑 Unicode 显示宽度；面向用户截断时，最好在业务层做，并明确「截断后是否要提示」。\n\n格式说明符不是万能模板语言。它不支持条件逻辑、循环、函数调用；复杂排版要在 Python 里先算好，再交给 f-string 拼接。把 f-string 写成一个小型报表引擎，短期很爽，长期没人敢改。格式化的边界是「把值变成文本」，不是「把业务逻辑塞进字符串」。`,
      code: String.raw`name = "林晓"
score = 91.25
ratio = 0.873
n = 7

print(f"|{name:<8}|{score:>8.2f}|")
print(f"|{name:*^10}|")
print(f"{n:03d} {n:0>5}")
print(f"{ratio:.1%}")
print(f"{'abcdef':.3}")
print(f"{1234567:,}")`,
      output: `|林晓      |   91.25|
|***林晓***|
007 00007
87.3%
abc
1,234,567`,
      tip: `中文用 [[:<8]] 不一定对得齐，因为显示宽度不是码点数；终端表格能用等宽字符就别混用中英文。`
    },
    {
      h: "数字与百分比：金额、增长率、负数",
      p: `数字格式化先分清三类：计数、金额、比例。计数用 [[d]]，金额用 [[.2f]] 或 [[Decimal]] 配合量化，比例用 [[.1%]] 或 [[.2%]]。[[f"{0.873:.1%}"]] 会先乘 100 再加百分号，得到 87.3%；如果你已经算成 87.3，不要再写 [[%]]，否则会变成 8730%。\n\n负数和对齐要一起考虑。[[f"{-12.5:>8.2f}"]] 在 8 格内右对齐，负号占一格；[[f"{-12.5:+.2f}"]] 强制显示正负号，正数也会带 [[+]]。做差额报表时，[[+]] 比空格更明确；做普通金额时，负数自带负号即可。千分位逗号对整数和小数都有效，但和 [[+]]、宽度组合时要注意顺序。\n\n金额不要用 float 累加。[[0.1 + 0.2]] 的误差在单次展示里看不出来，在几千笔对账里会变成一分钱的差额。正确做法是用 [[Decimal]] 保存金额，最后再格式化；如果上游只给 float，先转成字符串再构造 [[Decimal]]，并明确保留几位、如何舍入。\n\n百分比还要注意分母为零。[[0 / 0]] 会抛 [[ZeroDivisionError]]，[[0.0 / 0.0]] 得到 [[nan]]；报表里显示 [[nan%]] 很刺眼。业务上要定义「无数据」的展示，例如 [[N/A]] 或 [[—]]，而不是让 NaN 流到前端。格式化函数应该接收「值 + 是否有效」，而不是假设每个值都能算比例。`,
      code: String.raw`from decimal import Decimal, ROUND_HALF_UP

values = [12.5, -3.25, 0.0]
for v in values:
    print(f"{v:>8.2f} {v:+.2f}")

money = Decimal("19.99") * 3
print(f"金额: {money:.2f}")
print(f"增长率: {0.873:.1%}")
print(f"差额: {12.5 - 3.25:+.2f}")

def pct(part, total):
    return "N/A" if total == 0 else f"{part / total:.1%}"

print(pct(0, 0), pct(3, 4))`,
      output: `   12.50 +12.50
   -3.25 -3.25
    0.00 +0.00
金额: 59.97
增长率: 87.3%
差额: +9.25
N/A 75.0%`,
      tip: `[[f"{x:.1%}"]] 会自动乘以 100；如果 x 已经是 87.3，请用 [[f"{x:.1f}%"]]，否则会得到 8730.0%。`
    },
    {
      h: "动态格式与调试：等号、嵌套与转义",
      p: `f-string 支持在 [[=]] 后面直接输出「表达式 = 值」，例如 [[f"{score=}"]] 会打印 [[score=91]]。这是调试利器，但别留在生产日志里：它会把变量名暴露给用户，也可能把敏感值写进日志。调试时用，提交前删，或者改用结构化日志。\n\n格式宽度可以嵌套：[[f"{value:{width}.2f}"]]，其中 [[width]] 是另一个变量。嵌套只支持一层，且宽度必须是整数；[[width]] 是字符串时会报错。动态精度同理。这个能力适合「列宽由终端宽度决定」的报表，不适合把格式串做成用户可编辑的模板——那会引入注入和稳定性问题。\n\n花括号要转义。输出 JSON 或模板占位符时，字面量花括号写成 [[{{]] 和 [[}}]]；[[f"{{name}}":]] 得到 [[{name}]]，而 [[f"{name}"]] 会取值。反斜杠在 f-string 表达式里也有限制：Python 3.12 之前不允许在表达式部分使用反斜杠，复杂表达式先算到变量再插值。\n\nf-string 的求值时机是「执行到这一行时」，不是定义时。循环里修改了变量，下一次格式化会看到新值；但如果你在格式化时调用有副作用的函数，它每次都会执行。日志级别很低时，先判断再格式化，可以避免不必要的开销：[[if logger.isEnabledFor(logging.DEBUG): logger.debug(f"...")]]。`,
      code: String.raw`score = 91
name = "林晓"
width = 8

print(f"{score=} {name=}")
print(f"{score:{width}.2f}")
print(f"{{name}} 是占位符，{name} 是变量")

# Python 3.12+ 才允许在表达式里用反斜杠
parts = ["a", "b"]
print(f"join: {'/'.join(parts)}")`,
      output: `score=91 name='林晓'
   91.00
{name} 是占位符，林晓 是变量
join: a/b`,
      tip: `[[f"{expr=}"]] 输出的是 repr，不是 str；字符串会带引号。调试完记得删掉，别让它进用户可见的报告。`
    }
  ],
  "ch2-3": [
    {
      h: "编码的前世今生：ASCII、GBK、UTF-8 与 Unicode",
      p: `计算机只存字节，文本是人类给字节附加的解释。ASCII 用 1 个字节表示 128 个字符；GBK 用双字节表示中文；Unicode 是字符集，给每个字符一个码点；UTF-8 是 Unicode 的一种变长编码，用 1 到 4 个字节表示一个码点。四者不是同一层概念：Unicode 是「有哪些字符」，UTF-8 是「怎么把这些字符写成字节」。\n\nUTF-8 的设计很巧妙：ASCII 字符仍然占 1 个字节，和旧系统兼容；中文通常占 3 个字节；emoji 可能占 4 个。变长意味着你不能用「字节数除以 2」算字符数，也不能随意按字节截断，否则会把一个多字节字符切成两半，解码时报 [[UnicodeDecodeError]]。\n\nGBK 和 UTF-8 不兼容。一个用 GBK 保存的文件，用 UTF-8 打开会乱码或报错；反过来也一样。乱码不是「文件坏了」，而是「解码器和编码方式不匹配」。判断文件编码不能只看扩展名，[[.txt]] 可以是任何编码；可靠做法是问数据提供方，或者用 [[chardet]]/[[charset-normalizer]] 探测，再用小样本验证。\n\nPython 3 的 [[str]] 是 Unicode 字符串，[[bytes]] 是字节序列。[[open()]] 默认以文本模式返回 [[str]]，[[open(..., "rb")]] 返回 [[bytes]]。网络传输、图片、压缩包用 bytes；人类可读的配置、日志、CSV 用 str。把两者混在一起，就会出现「为什么 print 出来是 b'...'」或者「为什么中文变成 \xe4\xb8\xad」。先分清层，再谈编码。`,
      code: String.raw`text = "中"
print(text, len(text))
print(text.encode("utf-8"), len(text.encode("utf-8")))
print(text.encode("gbk"), len(text.encode("gbk")))

raw = b"\xe4\xb8\xad"
print(raw.decode("utf-8"))
print(raw.decode("gbk", errors="replace"))

print("A".encode("ascii"))
print("中".encode("ascii", errors="ignore"))`,
      output: `中 1
b'\xe4\xb8\xad' 3
b'\xd6\xd0' 2
中
涓
b'A'
b''`,
      tip: `[[len("中") == 1]] 是字符数，[[len("中".encode("utf-8")) == 3]] 是字节数；做数据库字段长度限制时，先确认它按字符还是按字节算。`
    },
    {
      h: "encode/decode 的错误策略与 BOM",
      p: `[[encode()]] 和 [[decode()]] 都可以传 [[errors=]]，常用策略有 [[strict]]、[[ignore]]、[[replace]]、[[backslashreplace]]。默认是 strict，遇到无法编码/解码的字节就抛异常；ignore 直接丢弃，replace 用占位符替换。生产环境不要随手 ignore：它会让数据静默丢失，排查时连线索都没有。\n\nBOM 是字节顺序标记，UTF-8 的 BOM 是 [[\xef\xbb\xbf]]，通常出现在 Windows 记事本保存的文件开头。[[utf-8-sig]] 会在读取时吞掉 BOM，写入时加上 BOM；普通 [[utf-8]] 会把 BOM 当成一个不可见字符，导致第一列字段名变成 [[\ufeffname]]。处理 CSV 时，如果第一列表头总是匹配不上，先检查 BOM。\n\n换行也是编码之外的另一层。Windows 用 [[\r\n]]，Unix 用 [[\n]]；Python 文本模式默认做通用换行转换，[[newline=""]] 可以保留原始换行，[[newline="\n"]] 统一写出。做跨平台数据交换时，显式指定换行；做逐行解析时，[[splitlines()]] 比 [[split("\n")]] 更稳，因为它能处理多种换行符。\n\n错误处理要记录上下文。[[decode("utf-8", errors="replace")]] 之后，你不知道哪些字符被替换了；更好的做法是捕获异常，打印字节偏移、前后各 20 个字节、文件名和行号。编码问题最难的不是修复，而是定位。把「哪一行、哪个字节、期望什么编码」写进错误信息，下一次排查会快十倍。`,
      code: String.raw`raw = "中文".encode("utf-8")
print(raw)

print(raw.decode("utf-8"))
try:
    print(raw.decode("ascii"))
except UnicodeDecodeError as err:
    print("失败:", err.start, err.end, err.reason)

print("中".encode("ascii", errors="replace"))
print("中".encode("ascii", errors="ignore"))
print("中".encode("ascii", errors="backslashreplace"))

with open("bom.csv", "w", encoding="utf-8-sig", newline="") as f:
    f.write("name,score\n林晓,91\n")`,
      output: `b'\xe4\xb8\xad\xe6\x96\x87'
中文
失败: 0 3 'ascii' codec can't decode byte 0xe4 in position 0: ordinal not in range(128)
b'?'
b''
b'\\u4e2d'
# bom.csv 开头含 EF BB BF`,
      tip: `[[errors="ignore"]] 会静默丢掉字符，[[errors="replace"]] 会留下 [[�]]；线上数据宁可直接失败，也不要悄悄损坏。`
    },
    {
      h: "大文件读取：newline、流式与内存",
      p: `[[open()]] 返回的文件对象是迭代器，逐行读取不会一次性把整个文件塞进内存。[[for line in f:]] 是最省内存的写法；[[f.readlines()]] 会返回列表，[[f.read()]] 返回整块字符串。几十 MB 的日志用 readlines 也许没事，几 GB 的日志会直接把内存打满。处理大文件时，默认选流式。\n\n文本模式会自动解码，二进制模式不会。[[open(path, "rb")]] 适合图片、压缩包、需要自己控制编码的场景；[[open(path, "r", encoding="utf-8")]] 适合大多数文本。不要用文本模式读二进制再 decode，容易在换行转换上出问题。写文件时同理：[["wb"]] 写 bytes，[[\"w\"]] 写 str。\n\n逐行处理时，注意 [[line]] 末尾带着换行符。[[line.strip()]] 会去掉首尾空白，但也可能去掉有意义的空格；[[line.rstrip("\n")]] 只去掉换行，更精确。空行用 [[if not line.strip(): continue]] 跳过；但如果你需要保留空行作为记录分隔，就别跳。\n\n编码错误可能在中途才出现，因为解码是流式的。捕获异常后，文件对象的位置不一定可靠；最稳的做法是记录出错行号，重新用 [[errors="replace"]] 或二进制模式打开，定位那段字节。不要假设「前面读成功了，后面一定没问题」。流式处理的代价是：错误出现得晚，必须靠日志和上下文把它抓住。`,
      code: String.raw`from pathlib import Path

path = Path("scores.csv")
with path.open("r", encoding="utf-8", newline="") as f:
    for lineno, line in enumerate(f, 1):
        text = line.rstrip("\n")
        if not text.strip():
            continue
        print(lineno, text)

# 二进制模式读取前 4 个字节，用于判断 BOM
with path.open("rb") as f:
    head = f.read(4)
print(head)`,
      output: `1 name,score
2 林晓,91
3 周宁,88
b'name'`,
      tip: `[[enumerate(f, 1)]] 的行号从 1 开始，和编辑器一致；报错时把行号带上，别只打印「解析失败」。`
    }
  ]
});

/* --- deep3.js --- */

window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch3-1": [
    {
      h: "动态数组与容量：append 为什么通常是 O(1)",
      p: `列表不是链表，而是一块连续内存的动态数组。它记录已用了多少格（长度），也记录总共分配了多少格（容量）。[[append()]] 时如果还有空位，直接放到下一格；没有空位，就申请一块更大的内存，把旧元素搬过去，再放新元素。扩容通常按比例增长，所以连续追加 n 次的总成本是 O(n)，均摊到每次是 O(1)。\n\n这个模型解释了为什么「偶尔一次 append 很慢」是正常的：那一次正好触发了扩容和搬迁。它也解释了为什么「在开头插入很慢」：[[insert(0, x)]] 要把后面所有元素整体右移，O(n)；[[pop(0)]] 要把后面所有元素左移，也是 O(n)。需要频繁从两端进出，用 [[collections.deque]]；需要频繁按位置插入，先问数据结构选得对不对。\n\n列表存的是对象引用，不是对象本身。一个存 100 万个整数的列表，占用的是 100 万个指针加整数对象；小整数有缓存，大整数每个都要单独分配。[[sys.getsizeof()]] 只算容器本身，不算元素指向的对象；用它估算内存时，别只看一个数字就下结论。\n\n切片、复制和 [[list()]] 都会创建新外层列表，但元素引用仍然共享。[[b = a[:]]] 之后修改 [[b[0]]] 的可变对象，[[a[0]]] 也会看到；只有 [[copy.deepcopy()]] 才递归复制。把「列表扩容」和「元素复制」分开理解，你就不会把浅拷贝当成深拷贝。`,
      code: String.raw`import sys
from collections import deque

a = []
print(sys.getsizeof(a))
for i in range(10):
    a.append(i)
    print(i, len(a), sys.getsizeof(a))

q = deque([1, 2, 3])
q.appendleft(0)
q.pop()
print(q)

a = [[1], [2]]
b = a[:]
b[0].append(99)
print(a, b)`,
      output: `56
0 1 88
1 2 88
2 3 88
3 4 88
4 5 120
5 6 120
...
deque([0, 1, 2])
[[1, 99], [2]] [[1, 99], [2]]`,
      tip: `[[sys.getsizeof([])]] 在不同版本和平台不同；不要把它当作精确内存计算器，更不要在业务代码里依赖具体数值。`
    },
    {
      h: "增删改查的复杂度：什么时候该换结构",
      p: `列表的 [[append()]] 均摊 O(1)，[[pop()]] 尾部 O(1)，[[pop(0)]] 头部 O(n)，[[insert()]] 中间 O(n)，[[in]] 线性查找 O(n)，按下标 [[a[i]]] 是 O(1)。这些不是背诵题，而是选型依据：排队用 deque，查成员用 set，按 key 找值用 dict，按顺序遍历用 list。\n\n[[remove(x)]] 删除的是「第一个等于 x 的元素」，找不到抛 [[ValueError]]；[[del a[i]]] 按下标删；[[del a[1:3]]] 按切片删；[[a.clear()]] 清空。[[pop()]] 返回被删元素，[[remove()]] 不返回。需要「删除并拿到值」时用 pop；需要「按值删除但不在乎返回值」时用 remove。不要用 [[a.remove(a[i])]] 这种绕圈写法，既慢又容易删错。\n\n遍历时修改列表是经典陷阱。你在 [[for x in a:]] 里 [[a.remove(x)]]，迭代器仍然按旧下标往前走，结果会跳过元素或重复处理。正确做法有三种：遍历副本 [[for x in a[:]]]；倒序遍历 [[for i in range(len(a)-1, -1, -1)]]；或者构造新列表 [[a = [x for x in a if ...]]]。选择取决于你要「原地改」还是「产生新列表」。\n\n嵌套列表的「删除」更容易出错。[[a.remove([1, 2])]] 按值比较，能找到就删；但 [[a.remove(some_list)]] 如果 some_list 与某个元素值相等，也会删掉第一个匹配项。想按身份删除，必须自己遍历并用 [[is]] 判断。列表没有「按 id 删除」的 API，因为 id 不是稳定业务键。`,
      code: String.raw`a = [1, 2, 2, 3]
a.remove(2)
print(a)

print(a.pop(), a)
del a[0]
print(a)

items = [1, 2, 3, 4]
for x in items[:]:
    if x % 2 == 0:
        items.remove(x)
print(items)

items = [1, 2, 3, 4]
items = [x for x in items if x % 2]
print(items)`,
      output: `[1, 2, 3]
3 [1, 2]
[2]
[1, 3]
[1, 3]`,
      tip: `[[for x in a[:]]] 复制的是外层列表；如果元素是可变对象，遍历中修改元素内容仍会影响原列表。`
    },
    {
      h: "嵌套列表与成绩表：从行到记录的建模",
      p: `成绩表最自然的两种表示是「列表的列表」和「字典的列表」。前者紧凑、适合矩阵运算；后者可读、适合按字段名访问。课程先用列表的列表，是因为它逼你想清楚「第几列是什么」；等进入字典章节，再升级成带字段名的记录。没有哪种永远更好，只有哪种更适合当前操作。\n\n列表的列表要约定列顺序：[["林晓", 91, 88.5], ["周宁", 86, 92]]。这个约定必须写进注释或常量，不能让 [[row[1]]] 这种魔法下标散落在代码里。可以定义 [[NAME, PYTHON, MATH = 0, 1, 2]]，或者用 [[namedtuple]]。一旦列顺序变化，所有下标都要改；字段名表示则只需要改一处。\n\n增加一行用 [[append()]]，增加一列则要遍历每一行 [[row.append(value)]]。删除一列同样要遍历，且要保证每行列数一致。列表本身不校验「每行长度相同」，这是使用者的责任。读入 CSV 后先做一次矩形校验：所有行列数相等、表头与数据列数相等；不相等就报错，不要带着畸形数据往下算。\n\n成绩表常见操作：按行遍历、按列提取、转置、按某个字段排序。按列提取用 [[[row[i] for row in rows]]]；转置用 [[list(zip(*rows))]]，但 zip 会在最短行处截断，行长度不一致时会静默丢数据。先校验矩形，再转置。数据规模大时，这些操作会产生很多中间列表；到第 7 章会用生成器把它们串起来。`,
      code: String.raw`rows = [
    ["林晓", 91, 88.5],
    ["周宁", 86, 92],
    ["陈默", 78, 85],
]

NAME, PYTHON, MATH = 0, 1, 2
for row in rows:
    print(row[NAME], row[PYTHON], row[MATH])

python_scores = [row[PYTHON] for row in rows]
print(python_scores)

columns = list(zip(*rows))
print(columns[1])

bad = [["林晓", 91], ["周宁", 86, 92]]
print(list(zip(*bad)))`,
      output: `林晓 91 88.5
周宁 86 92
陈默 78 85
[91, 86, 78]
(91, 86, 78)
[('林晓', '周宁'), (91, 86)]`,
      tip: `[[zip(*rows)]] 按最短行截断；行长度不一致时不会报错，只会悄悄丢列。先校验矩形，再转置。`
    }
  ],
  "ch3-2": [
    {
      h: "Timsort 与排序稳定性：key 到底怎么用",
      p: `Python 的 [[sort()]] 和 [[sorted()]] 使用 Timsort，一种归并排序和插入排序的混合算法，平均和最坏都是 O(n log n)，并且是稳定排序。稳定意味着值相等的元素保持原来的相对顺序；这让多键排序可以分步做：先按次要键排，再按主要键排，最终次要键的顺序不会被主要键打乱。\n\n[[key=]] 接收一个函数，对每个元素调用一次，用返回值排序。[[sorted(records, key=lambda r: r["score"])]] 不会改变原列表；[[records.sort(key=...)]] 原地排序并返回 [[None]]。把 [[sort()]] 的返回值赋给变量，是常见错误：[[a = a.sort()]] 会让 a 变成 None。记住：sorted 返回新列表，sort 返回 None。\n\n多键排序有两种写法。[[key=lambda r: (r["class"], -r["score"])]] 用一个元组表达「班级升序、分数降序」；负号只对数字有效，字符串不能取负。另一种是分步稳定排序：先按次要键排，再按主要键排。分步写法可读性更好，但要求你理解稳定性；元组写法更紧凑，但元组里混类型会报 [[TypeError]]。\n\n排序键可能抛异常。[[None]] 和数字不能直接比较，混合类型列表排序会失败；key 函数里访问缺失字段会抛 [[KeyError]]。生产代码要先清洗再排序，或者给 key 一个明确的默认值。不要用 [[sorted(data, key=lambda x: x or 0)]] 糊弄，0 可能不是合法业务值；默认值要能表达「缺失」，而不是假装成正常值。`,
      code: String.raw`records = [
    {"name": "林晓", "class": "A", "score": 91},
    {"name": "周宁", "class": "B", "score": 92},
    {"name": "陈默", "class": "A", "score": 88},
]

by_score = sorted(records, key=lambda r: r["score"])
print([r["name"] for r in by_score])

by_class_score = sorted(records, key=lambda r: (r["class"], -r["score"]))
print([(r["class"], r["name"], r["score"]) for r in by_class_score])

records.sort(key=lambda r: r["score"])
print(records[0]["name"], records.sort())`,
      output: `['陈默', '林晓', '周宁']
[('A', '林晓', 91), ('A', '陈默', 88), ('B', '周宁', 92)]
陈默 None`,
      tip: `[[list.sort()]] 原地排序并返回 [[None]]；[[a = a.sort()]] 会把列表弄丢。要新列表就用 [[sorted(a)]]。`
    },
    {
      h: "拷贝的三层：别名、浅拷贝、深拷贝",
      p: `第一层是别名：[[b = a]]，两个名字指向同一个对象，没有复制。第二层是浅拷贝：[[b = a.copy()]]、[[b = a[:]]]、[[b = list(a)]]，创建新的外层容器，但元素引用仍然共享。第三层是深拷贝：[[b = copy.deepcopy(a)]]，递归复制所有可变子对象，得到完全独立的一棵树。\n\n浅拷贝对「元素是不可变对象」的列表足够用。[[[1, 2, 3]]] 复制后，修改 [[b[0]]] 只是让 b 指向新整数，a 不受影响。但对「元素是列表/字典」的列表，浅拷贝只复制外层，内层仍然共享；[[b[0].append(9)]] 会同时改变 a[0]。这不是拷贝失败，是你只拷了一层。\n\n深拷贝能解决嵌套共享，但它有代价：速度慢、内存翻倍、可能遇到循环引用。[[copy.deepcopy()]] 内部用 memo 处理循环引用，所以不会无限递归；但它不会复制文件句柄、网络连接、线程锁这类「不可深拷贝」的资源。对包含这些资源的对象，深拷贝要么失败，要么产生无意义副本。\n\n实际工程里，优先问「我需不需要复制」。如果只是读数据，别名就够了；如果要把数据交给会修改它的函数，传副本或让函数返回新对象；如果结构很深且确实要独立，再上 deepcopy。不要为了「安全」在所有地方深拷贝，性能和安全不是只靠拷贝解决的。`,
      code: String.raw`import copy

a = [[1, 2], [3, 4]]
alias = a
shallow = a.copy()
deep = copy.deepcopy(a)

shallow[0].append(99)
print("a:", a)
print("shallow:", shallow)
print("deep:", deep)

print(alias is a, shallow is a, deep is a)
print(alias[0] is a[0], shallow[0] is a[0], deep[0] is a[0])`,
      output: `a: [[1, 2, 99], [3, 4]]
shallow: [[1, 2, 99], [3, 4]]
deep: [[1, 2], [3, 4]]
True False False
True True False`,
      tip: `[[copy.deepcopy()]] 不复制打开的文件、socket、锁；包含这些资源的对象，最好设计成「不可拷贝」或显式提供复制方法。`
    },
    {
      h: "排序边界：None、混合类型与 key 函数异常",
      p: `排序最怕「看起来能跑，换一批数据就炸」。[[sorted([1, "2"])]] 在 Python 3 直接抛 [[TypeError]]，因为整数和字符串没有定义大小关系；[[sorted([1, None])]] 也一样。数据清洗时要把「缺失」与「正常值」分开：缺失值要么提前过滤，要么映射成一个同类型的哨兵值，且业务上能解释这个哨兵。\n\nkey 函数返回的类型必须一致。[[key=lambda x: x.get("score")]] 遇到没有 score 的记录会返回 None，和数字混排就炸；[[key=lambda x: x["score"]]] 遇到缺失键直接抛 [[KeyError]]。更稳的写法是先规范化记录，保证每条都有 score，且类型是数字；或者用 [[key=lambda x: (x["score"] is None, x["score"] or 0)]] 把缺失排到末尾。但「排到末尾」是否符合业务，要先确认。\n\n排序不是去重。[[sorted(set(data))]] 会去重，但集合本身无序，排序后才稳定；[[sorted(data)]] 保留重复。[[list(dict.fromkeys(data))]] 可以按首次出现顺序去重，比 set 更可预测。选择去重方案时，先问「重复的定义是什么」：完全相等、某个字段相等，还是业务键相等。\n\n排序还会暴露可变对象的比较问题。自定义类没有实现 [[__lt__]] 时不能排序；实现了但比较逻辑有副作用，会让排序结果不可预测。给类排序时优先用 [[key=]] 提取一个稳定字段，而不是依赖对象自身的比较。key 函数应该是纯函数：不修改对象、不读写全局状态、不抛随机异常。`,
      code: String.raw`data = [
    {"name": "林晓", "score": 91},
    {"name": "周宁", "score": None},
    {"name": "陈默", "score": 88},
]

safe = sorted(data, key=lambda r: (r["score"] is None, r["score"] or 0))
print([(r["name"], r["score"]) for r in safe])

try:
    print(sorted([1, "2"]))
except TypeError as err:
    print("混合类型:", err)

print(sorted([3, 1, 2, 1]))
print(list(dict.fromkeys([3, 1, 2, 1])))`,
      output: `[('陈默', 88), ('林晓', 91), ('周宁', None)]
混合类型: '<' not supported between instances of 'str' and 'int'
[1, 1, 2, 3]
[3, 1, 2]`,
      tip: `[[key=lambda r: (r["score"] is None, r["score"] or 0)]] 把 None 排到最后；如果 0 是合法分数，[[or 0]] 仍然可用，但排序语义要写进注释。`
    }
  ],
  "ch3-3": [
    {
      h: "元组的不可变性与哈希：什么时候能当字典键",
      p: `元组是不可变序列，但「不可变」指的是元组本身不能增删改元素，不保证元素内部不可变。[[(1, [2])]] 是合法元组，但它不可哈希，因为里面的列表可哈希性不成立。元组要当字典键，必须所有元素都可哈希；字符串、数字、[[None]]、冻结的 frozenset 可以，列表、字典、集合不行。\n\n哈希要求「相等即同哈希，且哈希稳定」。可变对象放进字典键后，如果内容变了，哈希值可能变，字典就找不到它。Python 因此禁止可变容器作为键。元组本身不可变，但如果它包含可变对象，整体仍然不可哈希；[[hash((1, [2]))]] 会抛 [[TypeError]]。判断能不能当键，不要看「是不是元组」，要看「递归地是否所有元素都可哈希」。\n\n元组常用来表示「一条记录」：[[("林晓", 91, 88.5)]]。它比列表更适合做固定结构，因为不会被误改；但它没有字段名，[[row[1]]] 仍然是魔法下标。[[collections.namedtuple]] 在元组基础上加字段名，既有不可变性又可读；[[typing.NamedTuple]] 还能加类型标注。数据类 [[dataclass(frozen=True)]] 也能做不可变记录，但它是类，不是元组。\n\n元组的「逗号」比括号更重要。[[(1)]] 是整数 1，[[(1,)]] 才是单元素元组；[[1, 2]] 不加括号也是元组。函数返回多个值时，本质是返回一个元组；调用方解包时，元素个数必须匹配。理解这一点，[[return a, b]] 和 [[return (a, b)]] 就是同一件事，不会再有「为什么返回了一个元组」的困惑。`,
      code: String.raw`t = (1, 2)
print(type(t), hash(t))

bad = (1, [2])
try:
    print(hash(bad))
except TypeError as err:
    print("不可哈希:", err)

point = (3, 4)
grid = {point: "起点"}
print(grid[(3, 4)])

one = (1)
two = (1,)
print(type(one), type(two))

from collections import namedtuple
Score = namedtuple("Score", "name python math")
s = Score("林晓", 91, 88.5)
print(s.name, s.python, s[2])`,
      output: `<class 'tuple'> 3713081631934410656
不可哈希: unhashable type: 'list'
起点
<class 'int'> <class 'tuple'>
林晓 91 88.5`,
      tip: `[[hash((1, 2))]] 在同一进程内稳定，但跨进程可能变化；不要把 [[hash()]] 的结果存进数据库当唯一键。`
    },
    {
      h: "解包协议：星号、嵌套与函数返回值",
      p: `解包不是元组专属，任何可迭代对象都能解包。[[a, b = [1, 2]]] 可以，[[a, b = "xy"]] 也可以。左边元素个数必须与右边长度一致，否则抛 [[ValueError]]；星号 [[*rest]] 可以吸收多余元素，且只能出现一次。[[first, *middle, last = data]] 是提取首尾的常用写法。\n\n星号解包在函数调用里也成立。[[func(*args)]] 把序列展开成位置参数，[[func(**kwargs, extra=1)]] 展开字典；两者可以组合，但同一个参数不能重复传值。Python 3.5 之后，函数调用和字面量里都可以用多个星号，例如 [[[*a, *b]]] 合并列表，[[{**d1, **d2}]] 合并字典。这些写法简洁，但别在一个表达式里堆太多层，可读性比省一行更重要。\n\n嵌套解包适合固定结构：[[name, (python, math) = row]]。但结构一旦不固定，嵌套解包就会变成脆弱契约；数据来源稍有变化就抛错。生产代码里，优先用 [[namedtuple]] 或 dataclass 明确字段，再按字段访问；解包只在「结构确实固定且短小」时使用。\n\n函数返回多个值时，调用方可以整体接收，也可以解包。[[result = f()]] 得到元组；[[a, b = f()]] 直接拆开。如果函数可能返回 [[None]]，解包会抛 [[TypeError]]；调用方要先判断。不要在「可能失败」的函数上直接解包，错误信息会掩盖真正的失败原因。`,
      code: String.raw`data = [1, 2, 3, 4]
first, *middle, last = data
print(first, middle, last)

a, b = "xy"
print(a, b)

def stats():
    return 3, 90.0

count, avg = stats()
print(count, avg)

row = ["林晓", (91, 88.5)]
name, (python, math) = row
print(name, python, math)

print([*[1, 2], *[3, 4]])
print({**{"a": 1}, **{"b": 2}})`,
      output: `1 [2, 3] 4
x y
3 90.0
林晓 91 88.5
[1, 2, 3, 4]
{'a': 1, 'b': 2}`,
      tip: `星号解包只能有一个；[[a, *b, *c = data]] 是语法错误。需要多个切片时，分开写。`
    },
    {
      h: "zip 的终止条件：最短、最长与 strict",
      p: `[[zip(a, b)]] 按位置配对，遇到最短的序列结束就停。这个行为很方便，也很危险：两个文件行数不一致时，[[zip]] 会静默丢掉多出来的行，不报错。Python 3.10 引入 [[strict=True]]，长度不一致时抛 [[ValueError]]；处理「应该等长」的数据时，显式加上它。\n\n需要按最长配对时，用 [[itertools.zip_longest(fillvalue=None)]]。缺失位置用 fillvalue 填充，默认是 None；业务上要确认 None 是否可接受，还是用空字符串/0 更合适。不要用 [[zip]] 加 [[pad]] 手工补，容易把「缺失」和「合法值」混在一起。\n\nzip 返回迭代器，只能遍历一次。[[z = zip(a, b)]] 之后 [[list(z)]] 得到列表，再 [[list(z)]] 就是空的。需要多次遍历时，先 [[list(zip(...))]] 物化；数据量大时，不要物化，改用生成器重新创建。这个「迭代器耗尽」的坑在第 7 章还会反复出现。\n\nzip 常和 [[enumerate]] 组合：[[for i, (a, b) in enumerate(zip(xs, ys))]]。注意括号：[[enumerate(zip(...))]] 产生 [[(i, (a, b))]]，解包要写成 [[i, (a, b)]]。写错成 [[i, a, b]] 会抛「not enough values to unpack」或者得到意外的嵌套。多序列遍历时，把结构写清楚，比省一个变量重要。`,
      code: String.raw`names = ["林晓", "周宁", "陈默"]
scores = [91, 88]

print(list(zip(names, scores)))
print(list(zip(names, scores, strict=True)))

from itertools import zip_longest
print(list(zip_longest(names, scores, fillvalue="-")))

z = zip(names, scores)
print(list(z))
print(list(z))

for i, (name, score) in enumerate(zip(names, scores), 1):
    print(i, name, score)`,
      output: `[('林晓', 91), ('周宁', 88)]
ValueError: zip() argument 2 is shorter than argument 1
[('林晓', 91), ('周宁', 88), ('陈默', '-')]
[('林晓', 91), ('周宁', 88)]
[]
1 林晓 91
2 周宁 88`,
      tip: `[[zip]] 返回迭代器，遍历一次就耗尽；需要重复用就先 [[list()]]，但大文件不要物化。`
    }
  ]
});

/* --- deep4.js --- */

window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch4-1": [
    {
      h: "哈希表原理：字典为什么平均 O(1)",
      p: `字典的底层是哈希表。插入一个键时，Python 先调用 [[hash(key)]] 得到一个整数，再用这个整数决定放在哪个桶里；查找时同样算哈希、定位桶、比较键。理想情况下桶里只有一个元素，所以是 O(1)。桶冲突时用开放寻址探测下一个位置，冲突越多越慢；因此字典会保持一定的空位比例，容量不够时扩容并重新分配所有键。\n\n这也解释了字典的三个特性：键必须可哈希；键的哈希值在生命周期内不能变；遍历顺序是插入顺序，而不是哈希顺序。Python 3.7 起，字典明确保证插入顺序，这是语言规范，不是 CPython 的实现细节。[[dict]] 因此可以同时当「映射」和「有序记录」用，但不要依赖「删除后顺序会怎样」这种未定义细节。\n\n哈希冲突不等于键相等。两个不同键可以有相同哈希值，哈希表还要用 [[==]] 做最终比较；反过来，相等的键必须有相同哈希值。自定义类要当键，必须同时实现 [[__hash__]] 和 [[__eq__]]，并保证「相等则同哈希」。只实现一个，字典行为会不可预测；可变对象默认不可哈希，除非你明确知道自己在做什么。\n\n字典的容量会随插入增长，但不会随删除自动缩小。大量插入再删除后，字典可能仍占着大块内存；需要压缩时用 [[dict.copy()]] 或重建。[[sys.getsizeof()]] 可以看容器大小，但不含键值对象。做缓存时要设置上限，不要用字典无限制地存请求结果，否则内存会慢慢涨上去。`,
      code: String.raw`d = {"a": 1, "b": 2}
print(d)
print(list(d), list(d.keys()), list(d.values()))

d["c"] = 3
del d["b"]
print(d)

print({"a": 1, "a": 2})

class Bad:
    __hash__ = None

try:
    print({Bad(): 1})
except TypeError as err:
    print(err)`,
      output: `{'a': 1, 'b': 2}
['a', 'b'] ['a', 'b'] [1, 2]
{'a': 1, 'c': 3}
{'a': 2}
unhashable type: 'Bad'`,
      tip: `字典遍历顺序是插入顺序，但集合不是；需要稳定输出时，对 [[d.items()]] 排序，不要假设集合有顺序。`
    },
    {
      h: "键的可哈希性与相等性：自定义对象做键",
      p: `可哈希的对象必须满足：哈希值在生命周期内不变；[[__eq__]] 与 [[__hash__]] 一致；相等对象哈希相同。数字、字符串、元组、frozenset、[[None]] 都满足；列表、字典、集合不满足，因为它们是可变的。元组只有所有元素都可哈希时才可哈希，[[(1, [2])]] 不行。\n\n自定义类默认的 [[__hash__]] 基于 [[id()]]，[[__eq__]] 基于身份；这意味着两个内容相同的对象不相等，也不能当「按内容查找」的键。要按业务字段查找，定义 [[__hash__]] 返回字段元组的哈希，[[__eq__]] 比较字段元组；并确保这些字段不可变。字段里有列表时，先转成元组，或者把类设计成不可变。\n\n可变对象做键是灾难。你把列表当键，Python 直接拒绝；你用自定义可变对象做键，插入后修改了参与哈希的字段，字典就找不到它，甚至会出现「明明有键却取不到」的诡异现象。规则很简单：参与哈希的字段，创建后不要再改。需要「可变记录 + 稳定键」时，用不可变的业务 id 做键，对象作为值。\n\n相等性还会影响去重。[[set(records)]] 用哈希和相等判断，两个 dict 不可哈希，不能直接去重；需要先转成 [[tuple(sorted(d.items()))]] 或自定义可哈希包装。[[list(dict.fromkeys(records))]] 对可哈希元素有效，对 dict 无效。去重前先问「按什么字段判重」，再选数据结构；不要指望一个通用函数解决所有去重。`,
      code: String.raw`class Student:
    def __init__(self, sid, name):
        self.sid = sid
        self.name = name

    def __hash__(self):
        return hash(self.sid)

    def __eq__(self, other):
        return isinstance(other, Student) and self.sid == other.sid

a = Student("S01", "林晓")
b = Student("S01", "林晓")
c = Student("S02", "周宁")

print(a == b, a == c, hash(a) == hash(b))
print({a: 91, c: 88}[b])

try:
    print({[1, 2]: "bad"})
except TypeError as err:
    print(err)`,
      output: `True False True
91
unhashable type: 'list'`,
      tip: `[[__eq__]] 返回 [[NotImplemented]] 而不是 False，才能让 Python 尝试反向比较；写 [[isinstance]] 检查，避免和无关类型相等。`
    },
    {
      h: "读取策略：[]、get、setdefault、defaultdict",
      p: `[[d[key]]] 是最直接的读取，键不存在时抛 [[KeyError]]；[[d.get(key, default)]] 不存在时返回默认值，不抛异常。选择哪一种，取决于「键不存在」是程序错误还是正常分支。配置项缺失通常是错误，应该用 [[]] 让问题暴露；计数、分组、可选字段缺失是正常分支，用 [[get()]] 更顺手。\n\n[[setdefault(key, default)]] 在键不存在时插入默认值并返回它，键存在时返回已有值。它适合「初始化再修改」的场景：[[groups.setdefault(cls, []).append(name)]]。但要注意默认值在调用前已经求值：[[setdefault(k, expensive())]] 即使键存在也会执行 [[expensive()]]，造成浪费。需要惰性初始化时，用 [[defaultdict(factory)]]。\n\n[[defaultdict(list)]] 在访问缺失键时自动创建空列表；[[defaultdict(int)]] 自动创建 0。它比 [[setdefault]] 少一次方法调用，但会让「缺失键」静默变成默认值，可能掩盖数据错误。读外部数据时，先用普通 dict 校验结构，再在明确需要聚合的内部循环里用 defaultdict。\n\n删除也有策略。[[d.pop(key)]] 键不存在抛 [[KeyError]]，[[d.pop(key, None)]] 返回 None；[[del d[key]]] 同样抛异常。需要「有就删、没有就算」时用 pop 带默认值；需要「必须存在」时用 del。不要用 [[if key in d: del d[key]]] 做两次查找，直接用 [[pop(key, None)]] 一次完成。`,
      code: String.raw`d = {"a": 1}
print(d["a"])
print(d.get("b"))
print(d.get("b", 0))

d.setdefault("c", []).append(2)
print(d)

from collections import defaultdict
groups = defaultdict(list)
for name, cls in [("林晓", "A"), ("周宁", "B"), ("陈默", "A")]:
    groups[cls].append(name)
print(dict(groups))

print(d.pop("c", None), d)
del d["a"]
print(d)`,
      output: `1
None
0
{'a': 1, 'c': [2]}
{'A': ['林晓', '陈默'], 'B': ['周宁']}
[2] {'a': 1}
{}`,
      tip: `[[setdefault(k, expensive())]] 会先求值再判断；键已存在时，这次求值白做。惰性初始化用 [[defaultdict]]。`
    }
  ],
  "ch4-2": [
    {
      h: "嵌套数据建模：list of dicts 还是 dict of dicts",
      p: `一条学生记录用 [[{"name": "林晓", "scores": {...}}]] 表示，整个班级用列表装记录，这是「list of dicts」。如果经常按学号查找，改成「dict of dicts」：[[{"S01": {"name": "林晓", ...}}]]，键是业务 id，值是记录。前者适合顺序展示，后者适合按 key 查找；没有一种结构能同时把两类操作都做到最优。\n\n选择结构时，先列出操作：按 id 查、按班级分组、按分数排序、插入、删除。按 id 查用 dict；按班级分组用 [[defaultdict(list)]]；排序用 [[sorted()]] 配合 key。不要一开始就设计三层嵌套，然后发现每取一个字段要写四个方括号。结构应该跟着操作走，而不是跟着「看起来像 JSON」走。\n\n嵌套层级越深，缺失键的处理越麻烦。[[data["S01"]["scores"]["python"]]] 任何一层缺失都会抛 [[KeyError]]，错误信息只告诉你哪个键，不告诉你哪条记录。写一个 [[safe_get(record, "scores", "python", default=None)]] 或使用 [[get()]] 链式判断，能让错误定位更容易。但不要把所有缺失都吞成 None，业务上该报错的地方仍要报错。\n\n记录之间共享子对象时要小心。你把同一个 [[scores]] 字典赋给多个学生，修改一个会影响全部；需要独立副本时用 [[copy.deepcopy()]] 或让每条记录重新构造。JSON 反序列化通常会创建新对象，但手工拼装不会。数据建模的一半工作，是明确「哪些东西应该共享，哪些必须独立」。`,
      code: String.raw`students = {
    "S01": {"name": "林晓", "scores": {"python": 91, "math": 88}},
    "S02": {"name": "周宁", "scores": {"python": 86, "math": 92}},
}

print(students["S01"]["scores"]["python"])
print(students.get("S99", {}).get("name", "未知"))

from collections import defaultdict
by_class = defaultdict(list)
for sid, st in students.items():
    by_class[st.get("class", "未分班")].append(st["name"])
print(dict(by_class))

shared = {"python": 90}
a = {"name": "A", "scores": shared}
b = {"name": "B", "scores": shared}
a["scores"]["python"] = 95
print(b["scores"])`,
      output: `91
未知
{'未分班': ['林晓', '周宁']}
{'python': 95}`,
      tip: `链式 [[.get()]] 只适合「缺失是正常」的读取；如果缺字段代表数据损坏，写显式校验并抛错，不要层层返回 None。`
    },
    {
      h: "缺失值与默认工厂：setdefault、defaultdict、deep merge",
      p: `聚合数据时，缺失键的处理决定了代码的复杂度。[[groups.setdefault(cls, []).append(name)]] 是最直接的写法；[[defaultdict(list)]] 更简洁，但会把任何被访问的缺失键都变成空列表。前者适合「只在明确要追加时初始化」，后者适合「整个循环都按同一规则聚合」。\n\n嵌套 defaultdict 要小心。[[defaultdict(lambda: defaultdict(list))]] 可以自动创建两层，但 lambda 每次调用都新建内层；如果写成 [[defaultdict(defaultdict(list))]]，所有键会共享同一个内层字典，因为默认值在创建外层时只求值一次。这个坑和函数默认参数同源：默认值只创建一次。需要工厂函数，不要传一个现成的可变对象。\n\n合并两个嵌套字典时，浅合并 [[{**a, **b}]] 只会替换顶层键；如果 b 里有一个不完整的子字典，a 里对应的其他字段会整个丢掉。需要深合并时，递归遍历：两边都是 dict 才递归，否则用 b 覆盖 a。写深合并要明确数组怎么处理：替换、追加还是按 id 合并？「深合并」不是一种唯一语义。\n\n复制嵌套结构时，[[dict(a)]] 和 [[{**a}]] 都是浅拷贝；子字典仍然共享。要独立副本，用 [[copy.deepcopy()]]，或者明确只复制需要改的那一层。JSON 序列化再反序列化也能得到深拷贝，但它会丢掉非 JSON 类型（元组变列表、日期变字符串），不要拿它当通用拷贝工具。`,
      code: String.raw`from collections import defaultdict
import copy

groups = defaultdict(list)
for name, cls in [("林晓", "A"), ("周宁", "B"), ("陈默", "A")]:
    groups[cls].append(name)
print(dict(groups))

nested = defaultdict(lambda: defaultdict(list))
nested["A"]["python"].append(91)
print({k: dict(v) for k, v in nested.items()})

a = {"scores": {"python": 91, "math": 88}, "name": "林晓"}
b = {"scores": {"python": 95}}
merged = {**a, **b}
print(merged)

deep = copy.deepcopy(a)
deep["scores"]["python"] = 99
print(a, deep)`,
      output: `{'A': ['林晓', '陈默'], 'B': ['周宁']}
{'A': {'python': [91]}}
{'scores': {'python': 95}, 'name': '林晓'}
{'scores': {'python': 91, 'math': 88}, 'name': '林晓'} {'scores': {'python': 99, 'math': 88}, 'name': '林晓'}`,
      tip: `[[defaultdict(defaultdict(list))]] 会让所有键共享同一个内层字典；必须传工厂 [[lambda: defaultdict(list)]]。`
    },
    {
      h: "序列化与键顺序：JSON、ensure_ascii 与版本兼容",
      p: `字典最常见的落盘格式是 JSON。[[json.dumps(obj, ensure_ascii=False, indent=2)]] 保留中文、带缩进，适合人看；[[ensure_ascii=True]] 把中文转成 [[\\uXXXX]]，适合只允许 ASCII 的通道。[[sort_keys=True]] 让键按字典序输出，方便 diff，但会丢掉插入顺序；是否需要稳定输出，取决于下游是「人」还是「机器」。\n\nJSON 只支持有限类型：对象、数组、字符串、数字、布尔、null。Python 的元组会变成数组，[[datetime]] 不能直接序列化，[[set]] 也不行。[[default=]] 可以提供一个转换函数，把未知类型转成可序列化值；但转换后的类型会丢失，反序列化时不会自动变回原类型。需要保留类型时，用带类型标记的包装，或者换 [[pickle]]/[[msgpack]]。\n\n键必须是字符串。JSON 规范要求对象的键是字符串，Python 的 [[json.dumps({1: "a"})]] 会把 1 转成 [[\"1\"]]，反序列化后得到字符串键；如果你原来用整数键，往返一次类型就变了。需要整数键时，序列化成数组 [[[[1, "a"]]]]，或者显式转换。不要假设 JSON 能无损保存 Python 字典。\n\n版本兼容要靠 schema，不是靠「多写几个 try」。给数据加版本字段 [[\"version\": 2]]，读取时按版本分支；新增字段给默认值，删除字段先保留读取兼容期。序列化格式是接口，一旦有别的程序消费，就不能随手改字段名。[[json.dump()]] 写文件时用 [[ensure_ascii=False]] 和 [[encoding=\"utf-8\"]]，否则中文可能变成转义序列，虽然能读但不利于排查。`,
      code: String.raw`import json
from datetime import datetime

data = {"name": "林晓", "scores": (91, 88), "when": datetime(2026, 11, 24)}
try:
    print(json.dumps(data, ensure_ascii=False))
except TypeError as err:
    print("序列化失败:", err)

def default(o):
    if isinstance(o, datetime):
        return o.isoformat()
    raise TypeError

print(json.dumps(data, ensure_ascii=False, default=default, sort_keys=True))
print(json.dumps({1: "a"}))
print(json.loads('{"1": "a"}'))`,
      output: `序列化失败: Object of type datetime is not JSON serializable
{"name": "林晓", "scores": [91, 88], "when": "2026-11-24T00:00:00"}
{"1": "a"}
{'1': 'a'}`,
      tip: `JSON 往返会把元组变列表、整数键变字符串；不要把它当成 Python 对象的无损快照。`
    }
  ],
  "ch4-3": [
    {
      h: "哈希集合：去重、成员判断与无序性",
      p: `集合和字典共享哈希表：元素按哈希放桶，成员判断平均 O(1)，去重也是 O(n)。集合的元素必须可哈希，所以列表、字典不能直接放进去；元组可以，但元组里不能有可变对象。[[set([1, 2, 2])]] 得到 [[{1, 2}]]，重复元素被哈希和相等判断合并。\n\n集合是无序的。打印顺序取决于哈希值和插入历史，同一份数据在不同进程里可能不同；不要依赖 [[list(s)[0]]] 取「第一个」。需要稳定顺序时，[[sorted(s)]] 或 [[list(dict.fromkeys(data))]]。集合的 [[pop()]] 删除并返回任意一个元素，不是「第一个」；需要按顺序删，用列表或 [[heapq]]。\n\n空集合只能写 [[set()]]，[["{}"]] 是空字典。这是语法层面的歧义，不是 bug。单元素集合写 [[{1}]]，不是 [[{1,}]]（后者也合法，但没必要）。集合推导式 [[{x for x in data}]] 和字典推导式 [[{k: v for ...}]] 长得像，注意冒号。\n\n集合的相等是「元素相同」，不是「顺序相同」。[[{1, 2} == {2, 1}]] 为 True；[[{1, 2} < {1, 2, 3}]] 表示子集关系，不是「小于」。用集合做权限判断时，[[required <= granted]] 很自然；但要把「缺失权限」打印出来，用 [[required - granted]]，不要只返回一个布尔值。`,
      code: String.raw`a = set([1, 2, 2, 3])
b = {3, 4}
print(a, b)
print(2 in a, 5 in a)
print(a & b, a | b, a - b, a ^ b)

print({1, 2} == {2, 1})
print({1, 2} < {1, 2, 3})

empty = set()
print(type(empty), type({}))

print(list(a)[0])
print(sorted(a))`,
      output: `{1, 2, 3} {3, 4}
True False
{3} {1, 2, 3, 4} {1, 2} {1, 2, 4}
True
True
<class 'set'> <class 'dict'>
1
[1, 2, 3]`,
      tip: `[[{}]] 是空字典不是空集合；空集合必须 [[set()]]。集合 [[pop()]] 返回任意元素，不要拿它当队列。`
    },
    {
      h: "集合运算：方法、运算符与性能",
      p: `集合支持 [[union]]、[[intersection]]、[[difference]]、[[symmetric_difference]]，也支持 [[| & - ^]] 运算符。运算符要求两边都是集合；方法接受任意可迭代对象，例如 [[a.union([3, 4])]]。方法通常更宽松，运算符更严格；选哪个取决于你想不想隐式转换。\n\n[[a | b]] 创建新集合，[[a |= b]] 原地更新 a；[[a.update(b)]] 也是原地。[[a & b]] 创建交集，[[a &= b]] 原地保留交集。原地操作在循环里能省内存，但会修改调用方传进来的集合；函数参数是集合时，先明确「我能不能改它」。不想改就返回新集合，或者先 [[copy()]]。\n\n集合运算的性能取决于实现。两个大集合求交，通常迭代较小的集合并检查成员，复杂度与较小集合大小相关；求差类似。不要把两个大列表转成集合再求交，除非你确实需要集合语义；转换本身是 O(n)，而且会丢掉重复和顺序。数据量很大时，先问「我能不能在读取时就去重/分组」，而不是先全量物化再运算。\n\n集合的不可变版本是 [[frozenset]]。它可以哈希，因此能当字典键，也能放进另一个集合。[[frozenset({1, 2})]] 一旦创建就不能改；需要「先构造再冻结」时，用普通 set 建好再转。frozenset 的运算返回 frozenset，不会意外变成可变集合。做缓存键、图算法里的节点集合时，优先 frozenset。`,
      code: String.raw`a = {1, 2, 3}
b = {3, 4}

print(a.union([4, 5]))
print(a | b)
a |= b
print(a)

a = {1, 2, 3}
a.intersection_update({2, 3, 4})
print(a)

fs = frozenset({1, 2})
print(hash(fs), fs | frozenset({3}))
print({fs: "ok"})

a = {1, 2}
print(a.issubset({1, 2, 3}), a.issuperset({1}))`,
      output: `{1, 2, 3, 4, 5}
{1, 2, 3, 4}
{1, 2, 3, 4}
{2, 3}
... 3 frozenset({1, 2, 3})
{'frozenset({1, 2})': 'ok'}
True True`,
      tip: `[[a.union([3])]] 接受列表，[[a | [3]]] 会抛 TypeError；方法更宽松，运算符更严格。`
    },
    {
      h: "去重的语义：完全相等、业务键与顺序",
      p: `去重前先定义「重复」。[[set(data)]] 按完全相等去重，元素必须可哈希；[[dict.fromkeys(data)]] 也按完全相等，但保留首次出现顺序；按业务键去重则要自己写：[[seen = set(); for r in records: key = r["sid"]; if key not in seen: ...]]。三种语义不同，结果也不同。\n\n[[dict.fromkeys()]] 对可变值有陷阱。[[dict.fromkeys(keys, [])]] 会让所有键共享同一个列表；这不是去重问题，是默认值共享问题。需要独立默认值时，用 [[{k: [] for k in keys}]]。去重记录时，[[dict.fromkeys(records)]] 要求记录可哈希；字典记录不可哈希，得先转成元组或业务键。\n\n集合去重会丢顺序，字典去重保留插入顺序。Python 3.7+ 的 dict 有序，所以 [[list(dict.fromkeys(items))]] 是「稳定去重」的常用写法；它比 [[sorted(set(items))]] 更保留原始顺序，但要求元素可哈希。元素不可哈希时，用列表 + 已见集合：[[seen = set(); out = []]]，键用业务字段，值保留原对象。\n\n去重后要校验数量。[[len(set(data))]] 与 [[len(data)]] 的差，可能说明数据有重复，也可能说明哈希/相等实现有问题。自定义对象做去重时，先写两个内容相同、id 不同的对象，验证它们是否真的相等；不要等上线后才发现「去重没生效」。`,
      code: String.raw`items = ["b", "a", "b", "c", "a"]
print(list(set(items)))
print(list(dict.fromkeys(items)))

records = [
    {"sid": "S01", "score": 91},
    {"sid": "S01", "score": 95},
    {"sid": "S02", "score": 88},
]
seen = set()
out = []
for r in records:
    if r["sid"] not in seen:
        seen.add(r["sid"])
        out.append(r)
print(out)

keys = ["a", "b"]
shared = dict.fromkeys(keys, [])
shared["a"].append(1)
print(shared)
independent = {k: [] for k in keys}
independent["a"].append(1)
print(independent)`,
      output: `['b', 'a', 'c']
['b', 'a', 'c']
[{'sid': 'S01', 'score': 91}, {'sid': 'S02', 'score': 88}]
{'a': [1], 'b': [1]}
{'a': [1], 'b': []}`,
      tip: `[[dict.fromkeys(keys, [])]] 共享同一个列表；需要独立默认值时用字典推导式 [[{k: [] for k in keys}]]。`
    }
  ]
});

/* --- deep5.js --- */

window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch5-1": [
    {
      h: "真值协议：__bool__、__len__ 与隐式转换",
      p: `[[if x:]] 不是问「x 等不等于 True」，而是问「x 的真值是什么」。Python 先找 [[x.__bool__()]]，没有就找 [[x.__len__()]]，再没有就默认 True。空列表、空字符串、空字典、空集合、0、[[None]]、[[False]] 的真值都是 False；其他对象通常为 True。这个协议让你能写 [[if items:]] 而不是 [[if len(items) > 0:]]，但前提是你清楚「空」和「缺失」的区别。\n\n自定义类可以实现 [[__bool__]] 或 [[__len__]]，但不要让真值含义模糊。一个「结果对象」如果有数据但业务上失败，[[bool(result)]] 应该返回什么？如果返回 False 表示失败，调用方写 [[if result:]] 就很自然；如果返回 True 只表示「对象存在」，失败状态要另外查，那就别重载 bool，避免误导。真值协议是给「空/非空」用的，不是给「成功/失败」用的。\n\n[[bool]] 是 [[int]] 的子类，[[True == 1]]、[[False == 0]] 都为 True，[[sum([True, False])]] 得到 1。这在统计「通过人数」时很方便，但也会让 [[isinstance(True, int)]] 为 True。校验数字时先排除 bool，否则用户传 [[True]] 会被当成 1；JSON 里 true 和 1 是不同类型，解析后也要注意。\n\n真值与相等是两套判断。[[[] == False]] 为 False，但 [[bool([])]] 为 False；[[0 == False]] 为 True。不要用 [[x == False]] 判断「假」，用 [[not x]]；不要用 [[x == None]]，用 [[x is None]]。这三条规则能避免大部分「明明为空却进不了 if」的困惑。`,
      code: String.raw`values = [0, 1, "", "0", [], [0], {}, None, False, True]
for v in values:
    print(repr(v), bool(v), v == False)

print(isinstance(True, int), True + 1)
print(sum([True, False, True]))

class Result:
    def __init__(self, items): self.items = items
    def __bool__(self): return bool(self.items)

r = Result([])
print(bool(r), r.items)`,
      output: `0 False True
1 True False
'' False False
'0' True False
[] False False
[0] True False
{} False False
None False False
False False True
True True False
True 2
2
False []`,
      tip: `[[[] == False]] 是 False，但 [[bool([])]] 是 False；判断空用 [[if not x]]，不要用 [[x == False]]。`
    },
    {
      h: "分支结构：elif 链、卫语句与提前返回",
      p: `[[if/elif/else]] 是从上到下互斥判断，命中一个就不再往下走。把最可能命中的分支放前面，能少做几次判断；但不要把「性能」当成排序的唯一理由，可读性更重要。分支条件应该互斥且覆盖完整，最后的 else 要么处理「其他」，要么显式写 [[else: raise]]，不要静默放过。\n\n卫语句（guard clause）是提前返回，把异常/边界情况放在函数开头，主逻辑保持扁平。[[if not records: return {}]]、[[if score < 0: raise ValueError(...)]] 比层层嵌套更容易读。卫语句不是「少写 else」的审美问题，而是让读者先排除不可能的情况，再看主路径。\n\n长条件要命名。[[if user and user.active and user.score >= 60 and not user.banned:]] 这种条件，读的时候要在脑子里拆；写成 [[eligible = user and user.active and user.score >= 60 and not user.banned]]，再用 [[if eligible:]]，错误时还能打印 eligible 的组成。条件里的 [[and/or]] 有短路，顺序会影响副作用；把有副作用的调用放在后面，或者先算到变量。\n\n[[and]] 和 [[or]] 返回的是操作数，不是布尔值。[[0 or "fallback"]] 得到 [["fallback"]]，[[1 and "ok"]] 得到 [["ok"]]。这个特性可以写默认值，但也会让 [[if a and b:]] 的结果看起来「不是 True」。需要严格布尔时，用 [[bool(...)]] 包一层；不要把 [[and/or]] 当成三目运算符，Python 有 [[x if cond else y]]。`,
      code: String.raw`def grade(score):
    if not isinstance(score, (int, float)) or isinstance(score, bool):
        raise TypeError("分数必须是数字")
    if score < 0 or score > 100:
        raise ValueError("分数必须在 0-100")
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 60:
        return "C"
    else:
        return "D"

print(grade(91), grade(59), grade(0))
print(0 or "fallback", 1 and "ok")
print(True if 1 else False)`,
      output: `A D D
fallback ok
True`,
      tip: `[[and/or]] 返回操作数而不是布尔值；需要布尔结果时用 [[bool()]]，需要二选一时用 [[x if cond else y]]。`
    },
    {
      h: "边界与浮点：范围判断不能靠直觉",
      p: `范围判断最常见的错误是「把边界写反」或「把开闭区间搞混」。[[0 < score <= 100]] 表示 0 分不合法、100 分合法；[[0 <= score <= 100]] 才是两边都合法。写分页时，[[page < 1]] 和 [[page > total_pages]] 要分别处理；写桶边界时，[[i % n]] 永远落在 0 到 n-1，不要再多减 1。\n\n浮点范围判断不要用 [[==]]。[[0.1 + 0.2 == 0.3]] 为 False；[[score == 100.0]] 可能因为计算误差失败。用 [[math.isclose()]]，或者先把分数转成整数分。成绩系统里，0.5 分的精度通常足够，但「足够」要用业务规则定义：保留一位还是两位？四舍五入还是截断？不要用 [[round()]] 默认行为糊弄。\n\n[[chained comparison]] 是 Python 的特性：[[0 <= x < 100]] 等价于 [[0 <= x and x < 100]]，且 x 只求值一次。不要在链式比较里放有副作用的表达式，也不要把 [[0 <= x > 10]] 当成「x 在 0 到 10」；它表示 [[0 <= x and x > 10]]，交集可能为空。链式比较读起来自然，但每个运算符的方向要一致。\n\n范围判断还要考虑类型。字符串 [["100"]] 和数字 100 比较会抛 [[TypeError]]；[[None]] 和数字比较也会抛。入口处做类型转换和校验，不要把「看起来像数字」的字符串带进计算。[[bool]] 是 int 子类，[[True <= 100]] 为 True，所以数字校验要排除 bool。`,
      code: String.raw`import math

for score in [0, 59.5, 60, 100, 101]:
    print(score, 0 <= score <= 100)

print(0.1 + 0.2 == 0.3)
print(math.isclose(0.1 + 0.2, 0.3))

x = 50
print(0 <= x < 100)
print(0 <= x > 10)

try:
    print("100" <= 100)
except TypeError as err:
    print("类型错误:", err)`,
      output: `0 True
59.5 True
60 True
100 True
101 False
False
True
True
True
类型错误: '<=' not supported between instances of 'str' and 'int'`,
      tip: `[[0 <= x < 100]] 是「x 大于等于 0 且小于 100」；不要把它和 [[0 <= x > 10]] 混为一谈，后者没有上界。`
    }
  ],
  "ch5-2": [
    {
      h: "for 的展开：iter()、next() 与 StopIteration",
      p: `[[for x in items:]] 不是「按索引循环」，而是迭代协议：先 [[iter(items)]] 拿到迭代器，再反复 [[next()]]，直到 [[StopIteration]]。列表、元组、字符串、字典、文件、生成器都实现这套协议。理解这一点，你就能解释为什么字典遍历得到键、文件遍历得到行、生成器只能遍历一次。\n\n[[range()]] 是惰性序列，不是列表。[[range(10**9)]] 几乎不占内存，[[list(range(10**9))]] 会直接爆炸。[[range(start, stop, step)]] 的 stop 不包含，step 可以为负；[[range(5, 0, -1)]] 得到 5 到 1。需要「倒数到 0」时写 [[range(5, -1, -1)]]，别漏掉 0。\n\n循环变量在 Python 里不是块级作用域。[[for x in ...:]] 结束后，x 仍然存在，值是最后一次迭代的值；如果没有迭代，x 根本没被创建。这和第 6 章的作用域规则一致。循环里创建 lambda 捕获 x 时，所有 lambda 可能都看到最后一个值；需要早期绑定，用 [[lambda x=x: ...]] 或 [[functools.partial]]。\n\n[[for...else]] 的 else 在「循环正常结束」时执行，[[break]] 跳过它。它适合「查找直到找到」：找到就 break，没找到走 else。很多人不用 else，因为不直观；你可以用标志变量替代，但要知道 else 的语义，读别人代码时别误解。[[while...else]] 同理。`,
      code: String.raw`items = [10, 20, 30]
it = iter(items)
print(next(it), next(it))
try:
    next(it)
except StopIteration:
    print("结束")

print(list(range(5, 0, -1)))
print(range(10**6))

for x in [1, 2, 3]:
    pass
print(x)

for n in [2, 4, 6]:
    if n % 2 == 1:
        print("奇数", n)
        break
else:
    print("全是偶数")`,
      output: `10 20
结束
[5, 4, 3, 2, 1]
range(0, 1000000)
3
全是偶数`,
      tip: `[[for...else]] 的 else 不是「循环体失败」，而是「没有 break」；不想绕脑就用 found 标志，但读懂它很重要。`
    },
    {
      h: "while 与状态机：退出条件、else 与死循环",
      p: `[[while]] 适合「不知道循环多少次，但知道什么时候停」的场景：读文件直到 EOF、重试直到成功、游戏循环直到退出。写 while 的三件套是：初始化状态、明确退出条件、在循环体内推进状态。缺一件，就会死循环或提前退出。\n\n退出条件要在循环体内可达到。[[while x > 0: x -= 1]] 如果 x 初始为负数，一次都不执行；如果 x 是浮点且步长太小，可能永远到不了 0。[[while True:]] 是常用的「无限循环 + break」写法，但必须保证每条路径都能 break 或 return；异常路径也要考虑，否则程序卡死。\n\n[[while...else]] 和 for 一样：else 在条件变假时执行，break 跳过。它适合「等待直到超时」：超时就 break，正常等到走 else。但大多数业务代码用 [[while True]] + 显式 return 更清楚；else 只在你确实想区分「正常结束」和「提前退出」时用。\n\n循环里要有「进度」和「上限」。处理网络请求时，重试次数、退避时间、总超时都要有；处理文件时，记录行号；处理用户输入时，给退出命令。没有上限的 while 是生产事故的温床。[[time.sleep()]] 也不要写死 1 秒，指数退避更稳；但课程练习里先保证逻辑正确，再谈工程化。`,
      code: String.raw`n = 5
while n > 0:
    print(n)
    n -= 1

attempt = 0
while True:
    attempt += 1
    print("尝试", attempt)
    if attempt >= 3:
        break
else:
    print("不会执行")

n = 0
while n < 3:
    n += 1
else:
    print("正常结束", n)`,
      output: `5
4
3
2
1
尝试 1
尝试 2
尝试 3
正常结束 3`,
      tip: `[[while True]] 必须保证有 break/return；在循环里调用可能抛异常的代码时，把退出路径放进 finally 或异常处理。`
    },
    {
      h: "enumerate、zip 与循环变量的作用域",
      p: `[[enumerate(items, start=1)]] 返回 [[(index, item)]] 对，比 [[range(len(items))]] 更 Pythonic，也避免手动维护下标。[[for i, x in enumerate(items):]] 的解包结构要写对；如果写成 [[for i, x, y in enumerate(...)]][[，]] 会抛「not enough values」。需要下标和值，就用 enumerate；只需要值，就别引入下标。\n\n[[zip]] 把多个序列按位置配对，遇到最短的停止。[[for name, score in zip(names, scores):]] 比按下标同时取两个列表更清楚，也避免 [[names[i]]] 和 [[scores[i]]] 长度不一致时的越界。需要等长校验时加 [[strict=True]]（3.10+）；需要最长配对时用 [[zip_longest]]。\n\n循环变量会泄漏到外层作用域。[[for i in range(3): pass]] 之后 i 是 2；[[for name in []]] 之后 name 可能未定义。函数里也一样，循环变量不是局部块作用域。列表推导式在 Python 3 有自己的作用域，不会泄漏；生成器表达式也是。不要把「推导式不泄漏」推广到普通 for。\n\n嵌套循环里，[[break]] 只跳出最内层。需要跳出多层时，用标志变量、函数 return，或者 [[for...else]] 配合。不要用异常做常规控制流；异常适合「真正的异常」，不是「找到就停」。需要提前停止的多层搜索，抽成函数并 [[return]] 最清楚。`,
      code: String.raw`names = ["林晓", "周宁", "陈默"]
scores = [91, 88, 86]

for i, (name, score) in enumerate(zip(names, scores), 1):
    print(i, name, score)

for i in range(3):
    pass
print("i =", i)

try:
    print(undefined_name)
except NameError as err:
    print("未定义:", err)

def find_pair(rows, target):
    for row in rows:
        for value in row:
            if value == target:
                return True
    return False

print(find_pair([[1, 2], [3, 4]], 3))`,
      output: `1 林晓 91
2 周宁 88
3 陈默 86
i = 2
未定义: name 'undefined_name' is not defined
True`,
      tip: `嵌套循环里的 [[break]] 只跳出一层；要跳出多层，抽成函数用 [[return]]，不要用异常做常规控制流。`
    }
  ],
  "ch5-3": [
    {
      h: "match 的匹配顺序：从上到下、首个命中、不穿透",
      p: `[[match subject:]] 后面跟若干 [[case pattern:]]，从上到下尝试，命中第一个就执行对应分支，然后结束；不会像 C 的 switch 那样「穿透」到下一个 case。每个 case 可以带一个守卫 [[if condition]]，模式匹配成功但守卫为假时，继续尝试下一个 case。[[case _]] 是通配符，匹配任何值，通常放最后。\n\n模式不是表达式。[[case 1 + 2:]] 不是「匹配 3」，而是语法错误；[[case [x, y]:]] 匹配长度为 2 的序列并绑定 x、y；[[case {"name": name}:]] 匹配包含 name 键的映射，不要求只有这个键；[[case Point(x=0, y=0):]] 匹配类实例的属性。理解「模式描述形状」，而不是「模式计算值」，是用好 match 的关键。\n\n绑定变量的作用域是 case 分支。[[case [x, y]:]] 里的 x、y 只在当前分支可见；[[case _]] 不绑定。守卫可以使用已绑定的变量，但模式匹配失败时绑定不会发生。多个 case 可以复用同一个变量名，它们各自独立；不要依赖上一个 case 的绑定，match 不会让变量跨分支泄漏。\n\nmatch 不是 if/elif 的替代品。简单的二分支、范围判断、复杂布尔组合，if 更直接；只有当你确实在拆结构、并且拆完要绑定变量时，match 才值得。把所有 if 改写成 match 会让代码更长、更难读。课程把 match 放进来，是因为现代 Python 代码会遇到它，不是因为它是「高级写法」。`,
      code: String.raw`def describe(value):
    match value:
        case 0:
            return "零"
        case [x, y]:
            return f"两个元素: {x}, {y}"
        case {"name": name}:
            return f"名字: {name}"
        case _:
            return "其他"

print(describe(0))
print(describe([1, 2]))
print(describe({"name": "林晓", "score": 91}))
print(describe("x"))`,
      output: `零
两个元素: 1, 2
名字: 林晓
其他`,
      tip: `[[case _]] 必须放最后；它匹配任何值，放在前面会让后面的 case 永远不执行。`
    },
    {
      h: "序列、映射与类模式：拆结构的三种姿势",
      p: `序列模式用方括号，匹配长度和元素：[[case [x, y]:]] 要求正好两个元素；[[case [first, *rest]:]] 匹配至少一个元素，rest 是列表；[[case (x, y):]] 也能匹配序列，圆括号不是元组专属。字符串是序列，[[case [a, b]:]] 可以匹配两个字符的字符串；如果不想要这种行为，先判断类型或加守卫。\n\n映射模式用花括号，匹配「包含这些键」，不要求键完全相等。[[case {"name": name, "score": score}:]] 只要求这两个键存在，多余的键被忽略；[[case {"name": name, **rest}:]] 把剩余键收进 rest。这个特性适合处理 JSON，但也要注意「多余键被忽略」可能掩盖数据错误。需要严格结构时，匹配后用 [[set(obj) == {...}]] 校验。\n\n类模式用类名加参数，[[case Point(x=0, y=0):]] 匹配 [[isinstance(obj, Point)]] 且属性满足模式。它调用 [[__match_args__]] 或属性访问，不调用 [[__init__]]；不要指望它在匹配时构造对象。类模式适合领域对象，不适合普通字典；字典用映射模式，别绕成类。\n\n或模式 [[case 1 | 2:]] 匹配任意一个分支，但所有分支必须绑定相同的变量名；[[case [x] | {"x": x}:]] 可以，[[case [x] | {"y": y}:]] 不行。守卫 [[case n if n > 0:]] 在模式匹配成功后执行；守卫里不要做副作用，也不要用它替代完整的模式设计。`,
      code: String.raw`def shape(value):
    match value:
        case [first, *rest]:
            return ("seq", first, rest)
        case {"name": name, **extra}:
            return ("map", name, sorted(extra))
        case _:
            return ("other", value)

print(shape([1, 2, 3]))
print(shape({"name": "林晓", "score": 91, "class": "A"}))
print(shape("ab"))

class Point:
    __match_args__ = ("x", "y")
    def __init__(self, x, y): self.x, self.y = x, y

def where(p):
    match p:
        case Point(0, 0):
            return "原点"
        case Point(x, 0):
            return f"x轴: {x}"
        case Point(0, y):
            return f"y轴: {y}"
        case Point(x, y):
            return f"平面: {x}, {y}"

print(where(Point(0, 0)), where(Point(3, 0)), where(Point(1, 2)))`,
      output: `('seq', 1, [2, 3])
('map', '林晓', ['class', 'score'])
('other', 'ab')
原点 x轴: 3 平面: 1, 2`,
      tip: `映射模式只检查「包含」，不检查「只有」；需要严格字段集时，匹配后显式比较 [[set(obj)]]。`
    },
    {
      h: "版本边界：3.10+、3.8 练习室与降级写法",
      p: `[[match]] 是 Python 3.10 引入的语法，3.9 及以下直接 [[SyntaxError]]，不是运行时异常。站内练习室使用 Judge0 的 Python 3.8 兼容档，所以课程里的 match 代码只能阅读、不能提交判题；页面会明确标注「只读演示」。这不是课程偷懒，而是运行环境的事实边界。\n\n判断当前解释器版本用 [[sys.version_info]]，不要用字符串比较。[[sys.version_info >= (3, 10)]] 是可靠的；[[sys.version.startswith("3.10")]] 会把 3.10.1 和 3.100 混在一起。需要兼容旧版本时，把 match 逻辑降级成 if/elif：序列模式用 [[isinstance(value, (list, tuple)) and len(value) == 2]]，映射模式用 [[isinstance(value, dict) and "name" in value]]。降级代码更长，但能在 3.8 跑。\n\n如果库要同时支持 3.8 和 3.10+，不要把 match 写在模块顶层；用 [[if sys.version_info >= (3, 10):]] 分支定义不同函数，或者用 [[try: compile(...)]] 做特性探测。更稳妥的做法是：主逻辑用 if/elif，match 只作为可选的「现代写法」示例；库的公共 API 不应该强迫用户升级解释器。\n\n课程选择把 match 放在第 5 章，是为了让你能读懂现代代码，而不是鼓励你立刻在所有项目里用。你真正需要掌握的是「模式匹配解决什么问题」：拆结构、绑定变量、按形状分支。理解了这个，即使项目只能用 3.8，你也能用 if/elif 写出等价逻辑。`,
      code: String.raw`import sys

print(sys.version_info)
print(sys.version_info >= (3, 10))

def describe_legacy(value):
    if isinstance(value, (list, tuple)) and len(value) == 2:
        return ("pair", value[0], value[1])
    if isinstance(value, dict) and "name" in value:
        return ("named", value["name"])
    return ("other", value)

print(describe_legacy([1, 2]))
print(describe_legacy({"name": "林晓"}))
print(describe_legacy("x"))`,
      output: `sys.version_info(beta=0, candidate=0, final=0, major=3, micro=13, releaselevel='final', serial=0)
True
('pair', 1, 2)
('named', '林晓')
('other', 'x')`,
      tip: `[[match]] 在 3.9 及以下会 [[SyntaxError]]，不是运行时错误；给旧版本用户看的代码，提前降级成 if/elif。`
    }
  ]
});

/* --- deep6.js --- */

window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch6-1": [
    {
      h: "函数对象与调用协议：参数是怎样绑定的",
      p: `[[def]] 执行时创建一个函数对象，函数名只是指向它的变量。函数对象有 [[__code__]]、[[__defaults__]]、[[__globals__]]、[[__name__]] 等属性；你可以把它传给另一个函数、存进列表、作为字典值。[[f()]] 是调用运算符，不是「执行函数体」的语法糖；调用时才创建栈帧、绑定参数、执行字节码。\n\n参数绑定顺序是：位置参数、关键字参数、[[*args]]、keyword-only 参数、[[**kwargs]]。[[def f(a, b=1, *args, c=2, **kwargs):]] 里，a 必须给，b 可省略，args 收集多余位置参数，c 只能按关键字传，kwargs 收集多余关键字。把顺序写错会得到 [[SyntaxError]]；把 [[*args]] 放在 [[**kwargs]] 前面是规则，不是风格。\n\n默认参数在函数定义时求值一次，绑定到函数对象的 [[__defaults__]]。[[def f(x, items=[]):]] 的列表跨调用共享；[[def f(x, when=datetime.now()):]] 的时间永远是模块导入那一刻。需要「每次调用新值」时，默认写 [[None]]，函数体内再创建。这不是 Python 的缺陷，而是「默认值是对象引用」的直接结果。\n\n参数校验放在函数入口还是内部？公共函数应该校验并抛 [[TypeError]]/[[ValueError]]；内部辅助函数可以依赖调用方。不要把校验写成 [[assert]]，因为 [[python -O]] 会移除 assert；也不要用 [[print]] 代替异常。错误信息要带参数名和实际值，调用方才知道怎么改。`,
      code: String.raw`def f(a, b=1, *args, c=2, **kwargs):
    print("a=", a, "b=", b, "args=", args, "c=", c, "kwargs=", kwargs)

f(10)
f(10, 20, 30, 40, c=50, d=60)

print(f.__defaults__)
print(f.__code__.co_argcount)

def bad(items=[]):
    items.append(1)
    return items

print(bad())
print(bad())`,
      output: `a= 10 b= 1 args= () c= 2 kwargs= {}
a= 10 b= 20 args= (30, 40) c= 50 kwargs= {'d': 60}
(1,)
2
[1]
[1, 1]`,
      tip: `[[__defaults__]] 是可变对象时，所有调用共享；需要独立默认值时写 [[None]]，进函数再构造。`
    },
    {
      h: "可变参数与仅限关键字：把接口写清楚",
      p: `[[*args]] 收集多余位置参数，[[**kwargs]] 收集多余关键字参数；它们让函数能转发参数，但也让签名变得模糊。[[def wrapper(*args, **kwargs): return func(*args, **kwargs)]] 是装饰器的常见写法；如果 wrapper 需要自己的参数，必须用 keyword-only 隔开，否则用户传的位置参数会被 func 吃掉。\n\n仅限关键字参数写在 [[*]] 后面：[[def f(a, *, b):]]，b 只能 [[f(1, b=2)]]，不能 [[f(1, 2)]]。仅限位置参数写在 [[/]] 前面：[[def f(a, /, b):]]，a 不能按关键字传。这两个符号让 API 更明确：哪些参数保证稳定，哪些可以改名。标准库大量使用它们，你读签名时会遇到。\n\n[[**kwargs]] 的键必须是字符串。[[f(**{1: 2})]] 会抛 [[TypeError]]；传 [[**]] 字典时，键不是合法标识符也可能出问题。[[*args]] 可以是任意可迭代对象，但函数内部拿到的是元组，不是原列表；修改 args 不会影响调用方。需要可变序列时，自己 [[list(args)]]。\n\n可变参数不是「参数越多越好」。一个函数如果接收 [[**kwargs]] 却不校验，拼错参数名会被静默忽略，错误延迟到很久以后。公共 API 最好显式列出参数；确实需要透传时，在文档里写清楚哪些键被支持，并在入口做白名单校验。`,
      code: String.raw`def tag(name, /, content, *, level=1):
    return f"<h{level}>{name}: {content}</h{level}>"

print(tag("p", "hi"))
print(tag("p", "hi", level=2))
try:
    tag(name="p", content="hi")
except TypeError as err:
    print("仅限位置:", err)

def forward(*args, **kwargs):
    print(args, kwargs)

forward(1, 2, x=3)
forward(*[1, 2], **{"x": 3})`,
      output: `<h1>p: hi</h1>
<h2>p: hi</h2>
仅限位置: tag() got some positional-only arguments passed as keyword arguments: 'name'
(1, 2) {'x': 3}
(1, 2) {'x': 3}`,
      tip: `[[/]] 前的参数不能按关键字传，[[*]] 后的参数必须按关键字传；它们不是装饰，是 API 契约。`
    },
    {
      h: "return、None 与纯函数：把副作用留在边界",
      p: `没有 [[return]] 的函数返回 [[None]]；[[return]] 后面不写值也返回 [[None]]。[[None]] 不是「什么都没有」，它是一个单例对象，有类型、有身份、能作为字典值。[[print(f())]] 打印 None，是因为 print 打印了返回值，不是函数「没返回」。写函数时，明确它返回什么：结果、状态、还是只做事。\n\n纯函数只依赖参数，不读写外部状态，不修改输入，相同输入永远相同输出。[[summarize(records)]] 应该是纯的；[[save_report(path, text)]] 有 I/O 副作用，不该混在计算里。纯函数容易测试、容易缓存、容易并行；副作用集中在边界，出错时知道该看哪一层。这不是「函数式编程」的口号，是工程可维护性。\n\n返回多个值时，实际返回一个元组。[[return count, average]] 调用方可以 [[count, average = f()]]，也可以整体接收。返回 [[None]] 表示「没有结果」时，调用方必须先判断再解包；[[a, b = f()]] 在 f 返回 None 时抛 [[TypeError]]。需要表达「可能没有」时，考虑返回空列表、抛异常或 [[Optional]]，不要用 None 当万能哨兵。\n\n文档字符串写在函数第一行，[[help(f)]] 和 IDE 会读取。写清楚参数、返回、异常，比写「这个函数用于计算」有用。类型标注不是运行时强制，但能让编辑器和 [[mypy]] 提前发现错误。课程不要求每个练习都写完整类型，但公共函数值得写。`,
      code: String.raw`def summarize(records):
    """返回人数与平均分；空列表返回 (0, 0.0)。"""
    if not records:
        return 0, 0.0
    scores = [r["score"] for r in records]
    return len(scores), sum(scores) / len(scores)

print(summarize([]))
print(summarize([{"score": 90}, {"score": 80}]))

def log(message):
    print("[LOG]", message)

print(log("hi"))

def may_fail(ok):
    if not ok:
        return None
    return 1, 2

try:
    a, b = may_fail(False)
except TypeError as err:
    print("不能解包:", err)`,
      output: `(0, 0.0)
(2, 85.0)
[LOG] hi
None
不能解包: cannot unpack non-iterable NoneType object`,
      tip: `[[return]] 不写值返回 None；调用方对「可能返回 None」的函数先判断，别直接解包。`
    }
  ],
  "ch6-2": [
    {
      h: "LEGB 与编译期作用域：名字在哪里找",
      p: `Python 查找名字按 LEGB：Local（当前函数）、Enclosing（外层函数）、Global（模块）、Builtins（内置）。函数内部赋值会让名字成为局部变量，除非用 [[global]] 或 [[nonlocal]] 声明。这个判断发生在编译期，不是运行到赋值那一行才决定；所以 [[x = x + 1]] 在函数里会先因「x 是局部变量但未绑定」抛 [[UnboundLocalError]]。\n\n[[global]] 声明「这个赋值改模块级变量」，[[nonlocal]] 声明「改外层函数的变量」。它们不是「访问」的开关，而是「绑定」的声明。只读全局变量不需要 global；只有要重新绑定才需要。[[nonlocal]] 只能指向外层函数，不能指向模块；外层没有同名变量会抛 [[SyntaxError]]。\n\n类作用域不参与 LEGB。类体里的名字在定义时执行，但方法内部不会自动看到类变量；方法里访问类属性要用 [[self.x]] 或 [[ClassName.x]]。在类体里写 [[x = 1]]，方法里写 [[print(x)]] 会去找全局，不是类属性。这是 Python 和 Java/C++ 的一个明显差异。\n\n推导式有自己的作用域。[[[x for x in range(3)]]] 里的 x 不会泄漏到外层；但推导式的第一个可迭代表达式是在外层作用域求值的，后面的条件可以引用外层变量。生成器表达式同理。不要依赖「推导式变量泄漏」的旧行为，Python 3 已经改了。`,
      code: String.raw`x = "global"

def outer():
    x = "outer"
    def inner():
        nonlocal x
        x = "inner"
    inner()
    return x

print(outer())
print(x)

def broken():
    count = count + 1
    return count

try:
    broken()
except UnboundLocalError as err:
    print("未绑定:", err)

class C:
    value = 1
    def get(self):
        return value

try:
    print(C().get())
except NameError as err:
    print("类作用域不参与 LEGB:", err)`,
      output: `inner
global
未绑定: cannot access local variable 'count' where it is not associated with a value
类作用域不参与 LEGB: name 'value' is not defined`,
      tip: `函数里对名字赋值就会让它成为局部变量；只读全局不用 [[global]]，要改才声明。`
    },
    {
      h: "闭包与晚绑定：函数记住的是变量，不是值",
      p: `闭包是「函数 + 它引用的外层变量」。[[def outer(): x = 1; def inner(): return x; return inner]] 返回的 inner 记住的是 x 这个单元格，不是当时的 1；外层 x 后来变了，inner 看到新值。这个机制让计数器、装饰器、配置工厂成为可能。\n\n晚绑定陷阱：循环里创建多个 lambda，它们共享同一个循环变量。[[funcs = [lambda: i for i in range(3)]]] 全部返回 2，因为 lambda 执行时才查 i，而那时循环已结束。要固定当前值，用默认参数 [[lambda i=i: i]]，或者 [[functools.partial]]。这不是 lambda 的错，是「闭包捕获变量而不是值」的必然结果。\n\n[[nonlocal]] 让内层函数能修改外层变量；没有它，[[count += 1]] 会让 count 变成内层局部变量，外层不变。Python 2 没有 nonlocal，所以老代码常用可变容器（列表/字典）绕过；Python 3 直接用 nonlocal 更清楚。[[global]] 同理，但作用域是模块级。\n\n闭包会延长外层变量的生命周期。如果闭包捕获了一个大列表，即使外层函数返回，列表也不会被回收；大量闭包持有大对象会造成内存泄漏。需要释放时，把闭包置空、解除引用，或者避免捕获不必要的大对象。调试内存问题时，[[gc.get_referrers()]] 能帮你找到谁在引用。`,
      code: String.raw`def make_counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc

c = make_counter()
print(c(), c(), c())

funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])

funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])

from functools import partial
def mul(a, b): return a * b
print([partial(mul, i)(10) for i in range(3)])`,
      output: `1 2 3
[2, 2, 2]
[0, 1, 2]
[0, 10, 20]`,
      tip: `循环里创建 lambda 用默认参数 [[i=i]] 固定当前值；否则所有闭包看到循环结束后的最后一个值。`
    },
    {
      h: "lambda 与高阶函数：短函数，不是万能函数",
      p: `[[lambda]] 只能写一个表达式，不能包含语句、注解、docstring；它的价值是「就地传一个短函数」，不是「替代 def」。[[sorted(data, key=lambda r: r["score"])]] 很自然；把十行逻辑塞进 lambda 只会让代码难读。需要名字、需要复用、需要调试时，用 def。\n\n[[map()]]、[[filter()]] 返回迭代器，不是列表；需要列表时包 [[list()]]。[[map(f, xs)]] 等价于 [[(f(x) for x in xs)]]，但生成器表达式通常更清楚，尤其是需要条件时。[[filter(None, xs)]] 会保留真值为真的元素，等价于 [[(x for x in xs if x)]]；不要用 filter 做复杂判断。\n\n[[functools.reduce()]] 把二元函数累积到序列上，[[reduce(operator.add, xs)]] 求和。Python 提供了 [[sum()]]、[[max()]]、[[min()]] 等内置函数，大多数场景不需要 reduce；需要自定义累积时，先用循环写清楚，再考虑 reduce。reduce 的可读性通常不如显式循环。\n\n高阶函数接收函数作为参数，[[functools.partial]] 固定部分参数，[[operator.itemgetter]] 替代 lambda 取键。[[sorted(data, key=operator.itemgetter("score"))]] 比 lambda 更快、更可读（键不存在时错误信息也更直接）。[[operator.attrgetter]] 取属性同理。不要为了「函数式」而函数式；目标是可读、可测、可维护。`,
      code: String.raw`from functools import reduce, partial
import operator

records = [{"score": 91}, {"score": 88}]
print(sorted(records, key=operator.itemgetter("score")))

print(list(map(lambda x: x * 2, [1, 2, 3])))
print(list(filter(lambda x: x % 2, [1, 2, 3, 4])))

print(reduce(operator.add, [1, 2, 3, 4]))
print(sum([1, 2, 3, 4]))

def power(base, exp): return base ** exp
square = partial(power, exp=2)
print(square(5))`,
      output: `[{'score': 88}, {'score': 91}]
[2, 4, 6]
[1, 3]
10
10
25`,
      tip: `[[map/filter]] 返回迭代器，遍历一次就耗尽；需要重复用先 [[list()]]，大文件不要物化。`
    }
  ],
  "ch6-3": [
    {
      h: "递归三件套与调用栈：基线、递推、收敛",
      p: `递归函数必须有三件套：基线条件（什么时候停）、递推关系（问题怎么变小）、收敛保证（每次调用都靠近基线）。缺基线会无限递归，缺收敛会栈溢出，缺递推会把问题原地打转。[[factorial(n)]] 的基线是 n <= 1，递推是 n * factorial(n-1)，收敛是 n 每次减 1。\n\n每次递归调用都会创建一个栈帧，保存局部变量、返回地址、执行状态。Python 默认递归深度约 1000，超过抛 [[RecursionError]]。[[sys.setrecursionlimit()]] 可以调大，但它不能增加真实栈空间，调太大可能直接崩溃。深度很大的问题，用迭代、显式栈或分治；不要靠调 limit 硬扛。\n\nPython 不支持尾递归优化。即使你把递归写成 [[return f(n-1, acc)]]，解释器仍会保留当前栈帧；所以「尾递归不会爆栈」在 Python 里不成立。需要尾递归风格时，用循环或 [[functools.reduce]] 改写。这不是语言缺陷，是 CPython 的设计取舍。\n\n递归适合「结构本身是递归的」问题：树、图、嵌套 JSON、分治。线性列表的求和、查找，用循环更简单。写递归前先问：问题能不能自然拆成同构的子问题？如果不能，别硬套。递归不是高级，是另一种控制流。`,
      code: String.raw`import sys

def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)

print(factorial(5))
print(sys.getrecursionlimit())

def bad(n):
    return bad(n + 1)

try:
    bad(0)
except RecursionError as err:
    print("递归太深:", type(err).__name__)

def sum_iter(xs):
    total = 0
    for x in xs:
        total += x
    return total

print(sum_iter([1, 2, 3, 4]))`,
      output: `120
1000
递归太深: RecursionError
10`,
      tip: `[[sys.setrecursionlimit()]] 不是万能药；真实栈空间有限，深度问题改用迭代或显式栈。`
    },
    {
      h: "二分查找：有序、边界与循环不变式",
      p: `二分查找的前提是「有序」。没有排序就二分，结果不可预测；每次循环都要维护「目标只可能在 [left, right] 内」这个不变式。[[left, right = 0, len(a) - 1]] 是闭区间写法；[[while left <= right:]]，中点 [[mid = (left + right) // 2]]，比较后移动 left 或 right。循环结束时，left 是第一个大于目标的位置。\n\n边界最容易错。[[right = len(a)]] 是半开区间写法，循环条件 [[left < right]]，更新 [[right = mid]]；两种写法都对，但不能混。混用会导致死循环或漏掉最后一个元素。写完后用空数组、单元素、目标在首、目标在尾、目标不存在这五组用例验证，比凭感觉可靠。\n\n[[bisect]] 是标准库的二分实现。[[bisect_left(a, x)]] 返回第一个 >= x 的位置，[[bisect_right(a, x)]] 返回第一个 > x 的位置；[[insort()]] 插入并保持有序。需要「查找插入位置」时，直接用 bisect，不要手写。手写二分只适合练习或需要自定义比较逻辑的场景。\n\n二分的时间复杂度是 O(log n)，但每次比较可能很贵。对字符串、对象排序时，key 函数只应在排序时调用一次，不要在二分循环里反复计算。[[bisect]] 支持 [[key=]]（3.10+），但 key 必须与排序时一致；不一致会得到错误位置。二分不是「比线性快」的万能答案，数据量小、比较便宜时，线性查找可能更简单。`,
      code: String.raw`from bisect import bisect_left, bisect_right, insort

a = [1, 3, 5, 7, 9]
print(bisect_left(a, 5), bisect_right(a, 5))
print(bisect_left(a, 4), bisect_right(a, 4))

def lower_bound(a, target):
    left, right = 0, len(a)
    while left < right:
        mid = (left + right) // 2
        if a[mid] < target:
            left = mid + 1
        else:
            right = mid
    return left

print(lower_bound(a, 5), lower_bound(a, 4), lower_bound(a, 10))

insort(a, 6)
print(a)`,
      output: `2 3
2 2
2 2 5
[1, 3, 5, 6, 7, 9]`,
      tip: `[[bisect_left]] 返回第一个 >= x 的位置，[[bisect_right]] 返回第一个 > x 的位置；重复元素多时，两者不同。`
    },
    {
      h: "递归版二分与切片成本：为什么不推荐",
      p: `递归版二分常写成 [[binary_search(a[:mid], target)]]，每次递归都切片。切片会复制一半元素，递归 log n 层，总复制量 O(n)，把二分的 O(log n) 优势抵消掉。正确写法是传 [[left, right]] 下标，不复制列表；递归深度也只有 log n。\n\n递归版二分的基线是「区间为空」，返回 -1 或插入位置；递推是比较中点后进入左/右半区。写的时候要保持区间定义一致：闭区间 [[[left, right]]] 还是半开 [[[left, right)]]。混用会让基线差一，出现「明明有却找不到」。\n\n迭代版通常更简单：没有栈帧开销，不会触发递归限制，边界更新一目了然。递归版适合教学，让你理解「问题减半」；生产代码优先 [[bisect]] 或迭代。不要为了「优雅」在热点路径上递归。\n\n如果确实需要递归，把切片改成下标，把结果返回给上一层；不要在递归里修改全局列表。递归函数的参数应尽量少，状态通过参数和返回值传递。这样既容易测试，也避免闭包/全局变量带来的并发问题。`,
      code: String.raw`def binary_search_rec(a, target, left, right):
    if left > right:
        return -1
    mid = (left + right) // 2
    if a[mid] == target:
        return mid
    if a[mid] < target:
        return binary_search_rec(a, target, mid + 1, right)
    return binary_search_rec(a, target, left, mid - 1)

a = [1, 3, 5, 7, 9]
print(binary_search_rec(a, 7, 0, len(a) - 1))
print(binary_search_rec(a, 4, 0, len(a) - 1))

def binary_search_iter(a, target):
    left, right = 0, len(a) - 1
    while left <= right:
        mid = (left + right) // 2
        if a[mid] == target:
            return mid
        if a[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

print(binary_search_iter(a, 9), binary_search_iter(a, 2))`,
      output: `3
-1
4 -1`,
      tip: `递归版二分不要切片；[[a[:mid]]] 每次复制一半元素，复杂度从 O(log n) 退化成 O(n)。`
    }
  ]
});

/* --- deep7.js --- */

window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch7-1": [
    {
      h: "推导式的语法与作用域：表达式、for、if 的顺序",
      p: `列表推导式的基本形式是 [[[expr for item in iterable if condition]]]。执行顺序是：先取 iterable 的第一个元素，绑定 item，判断 condition，为真就计算 expr 并加入结果；再取下一个。它不是「先建列表再过滤」，而是一趟完成。条件可以放在 for 后面，也可以嵌套多个 for，顺序与书写顺序一致。\n\n多个 for 的顺序容易写反。[[[x + y for x in xs for y in ys]]] 先遍历 xs，再对每个 x 遍历 ys，结果顺序是 x0y0、x0y1、x1y0……如果你想要「先按 y 分组」，就把 y 的 for 写前面。嵌套推导式的可读性随层数迅速下降，超过两层就考虑普通循环或 [[itertools.product()]]。\n\n推导式有独立作用域，循环变量不会泄漏到外层。[[[i for i in range(3)]]] 之后 i 仍是外层的值（如果外层有）；Python 3 不会把 i 留成 2。但推导式的第一个可迭代表达式在外层作用域求值，后面的表达式在推导式作用域内求值；不要在表达式里修改外层可变对象，副作用会让结果依赖执行顺序。\n\n条件表达式和过滤条件不是一回事。[[[x if x > 0 else 0 for x in xs]]] 对每个元素都产生一个结果；[[[x for x in xs if x > 0]]] 只保留满足条件的元素。前者长度不变，后者可能变短。写报表时先明确「要占位还是丢掉」，这决定了用 if 的位置。`,
      code: String.raw`xs = [1, 2, 3]
ys = [10, 20]

print([x + y for x in xs for y in ys])
print([y + x for y in ys for x in xs])
print([x if x % 2 else 0 for x in xs])
print([x for x in xs if x % 2])

matrix = [[1, 2], [3, 4]]
print([n for row in matrix for n in row])
print([[n * 2 for n in row] for row in matrix])`,
      output: `[11, 21, 12, 22, 13, 23]
[11, 12, 13, 21, 22, 23]
[1, 0, 3]
[1, 3]
[1, 2, 3, 4]
[[2, 4], [6, 8]]`,
      tip: `[[[x if cond else 0 for x in xs]]] 保留所有元素；[[[x for x in xs if cond]]] 会过滤。先确定长度是否要变。`
    },
    {
      h: "推导式与生成器表达式：内存、惰性与一次性",
      p: `列表推导式用方括号，立即生成完整列表；生成器表达式用圆括号，返回一个惰性迭代器，按需计算。[[sum(x * x for x in range(10**6))]] 不需要先建一百万个元素的列表，内存是 O(1)；[[sum([x * x for x in range(10**6)])]] 会先物化整个列表。数据量大时，优先生成器表达式。\n\n生成器表达式只能遍历一次。[[g = (x for x in xs)]] 之后 [[list(g)]] 得到结果，再 [[list(g)]] 就是空的。需要多次遍历时，重新创建生成器，或者物化成列表。不要把一个生成器传给两个消费者，除非你明确知道它们按顺序共享同一次遍历。\n\n推导式不一定比循环快。它省的是 Python 层的 append 调用，但表达式本身的函数调用、属性访问仍然存在；复杂逻辑塞进推导式，可能比清晰循环更慢、更难调试。[[timeit]] 测一下再优化，不要凭「推导式更 Pythonic」下结论。列表推导式通常比 for + append 快，但生成器表达式多了 yield 开销，未必更快。\n\n嵌套生成器表达式要注意括号。[[sum(x for row in matrix for x in row)]] 可以直接作为函数参数；如果生成器表达式不是唯一参数，要再加一层括号：[[func((x for x in xs), other)]]。多一层括号不是语法怪癖，是解析歧义。写复杂生成器时，拆成命名变量，读起来更清楚。`,
      code: String.raw`xs = range(5)
list_comp = [x * x for x in xs]
gen_exp = (x * x for x in xs)

print(list_comp)
print(list(gen_exp))
print(list(gen_exp))

print(sum(x * x for x in range(10)))
print(sum([x * x for x in range(10)]))

matrix = [[1, 2], [3, 4]]
print(sum(x for row in matrix for x in row))`,
      output: `[0, 1, 4, 9, 16]
[0, 1, 4, 9, 16]
[]
285
285
10`,
      tip: `生成器表达式只能消费一次；需要两次遍历就重新创建，或先 [[list()]] 物化，但大文件不要物化。`
    },
    {
      h: "字典与集合推导式：键冲突、去重与顺序",
      p: `字典推导式写成 [[{k: v for item in items}]]，键表达式在前，值表达式在后。键重复时，后出现的值覆盖先出现的值；这与 [[dict.update()]] 的语义一致。需要保留第一次出现的值，反过来写：先出现的先插入，后面的重复键跳过。不要指望字典推导式自动去重并保留某个特定值，覆盖顺序由迭代顺序决定。\n\n集合推导式写成 [[{expr for item in items}]]，自动去重，顺序不保证。它和字典推导式只差一个冒号，读代码时看清楚。[[{x for x in xs}]] 的元素必须可哈希；列表、字典不能直接放进去。需要保留顺序的去重，用 [[dict.fromkeys()]]，不要用集合。\n\n字典推导式适合「转换/筛选」：[[{k: v * 2 for k, v in scores.items() if v >= 60}]]。它不适合「聚合」：按班级求平均需要先分组，再用普通循环或 [[defaultdict]]；硬塞进一个推导式会变成多次遍历或复杂表达式。推导式的目标是「一对一/一对零」的转换，不是「多对一」的聚合。\n\n键冲突还可能来自类型转换。[[{str(k): v for k, v in data.items()}]] 把 1 和 "1" 都变成 "1"，后出现的覆盖先出现的；这种覆盖是静默的。需要检测冲突时，先用普通循环并记录重复键，不要用推导式一把梭。数据迁移时，静默覆盖比报错更危险。`,
      code: String.raw`scores = {"林晓": 91, "周宁": 88, "陈默": 59}
print({k: v for k, v in scores.items() if v >= 60})
print({k: v * 2 for k, v in scores.items()})

items = ["a", "b", "a", "c"]
print({x for x in items})
print(list(dict.fromkeys(items)))

data = {1: "one", "1": "string one"}
print({str(k): v for k, v in data.items()})

pairs = [("a", 1), ("a", 2), ("b", 3)]
print({k: v for k, v in pairs})`,
      output: `{'林晓': 91, '周宁': 88}
{'林晓': 182, '周宁': 176, '陈默': 118}
{'a', 'b', 'c'}
['a', 'b', 'c']
{'1': 'string one'}
{'a': 2, 'b': 3}`,
      tip: `字典推导式遇到重复键会静默覆盖；需要检测冲突时，用普通循环记录重复键，别用推导式一把梭。`
    }
  ],
  "ch7-2": [
    {
      h: "可迭代对象与迭代器：iter() 与 next() 的分工",
      p: `可迭代对象（iterable）实现了 [[__iter__]]，能返回一个迭代器；迭代器（iterator）同时实现 [[__iter__]] 和 [[__next__]]，[[__iter__]] 通常返回 [[self]]。列表是可迭代对象，但不是迭代器；[[iter(list)]] 返回的 list_iterator 才是迭代器。[[for]] 先对对象调用 [[iter()]]，再反复 [[next()]]，直到 [[StopIteration]]。\n\n迭代器是有状态的。它记住「走到哪了」，每次 [[next()]] 前进一格；耗尽后继续 [[next()]] 仍然抛 [[StopIteration]]，不会自动重置。需要重新遍历时，重新调用 [[iter(iterable)]]；如果对象本身就是迭代器（比如生成器），重新 [[iter()]] 返回的还是同一个耗尽状态。这就是「生成器只能遍历一次」的底层原因。\n\n[[__iter__]] 必须返回迭代器，不能返回列表。[[class C: def __iter__(self): return [1, 2]]][[ 会抛 TypeError，因为列表不是迭代器。正确写法是 [[return iter([1, 2])]]，或者用生成器函数 [[yield]]。自定义容器时，[[__iter__]] 返回一个新的迭代器，保证每次遍历都从头开始；不要把 self 当迭代器，除非你确实想让它一次性。\n\n迭代协议是 Python 数据模型的中心。[[for]]、[[sum()]]、[[list()]]、[[tuple()]]、[[zip()]]、[[enumerate()]]、[[*]] 解包都走这套协议。理解它，你就能解释为什么文件可以逐行遍历、字典遍历得到键、生成器能接在管道里。不要把「可迭代」和「可下标」混为一谈：字典可迭代键，但不支持整数下标。`,
      code: String.raw`nums = [1, 2, 3]
it = iter(nums)
print(next(it), next(it), next(it))
try:
    next(it)
except StopIteration:
    print("耗尽")

print(iter(nums) is nums)

class C:
    def __iter__(self):
        return iter([1, 2])

print(list(C()))

class Bad:
    def __iter__(self):
        return [1, 2]

try:
    list(Bad())
except TypeError as err:
    print("不是迭代器:", err)`,
      output: `1 2 3
耗尽
False
[1, 2]
不是迭代器: iter() returned non-iterator of type 'list'`,
      tip: `可迭代对象不一定是迭代器；[[iter(obj)]] 每次应返回新的迭代器，除非你明确设计成一次性。`
    },
    {
      h: "惰性求值：什么时候算、什么时候不算",
      p: `惰性求值不是「不计算」，而是「用到才算」。生成器函数在调用时不会执行函数体，只创建生成器对象；第一次 [[next()]] 才运行到第一个 [[yield]]，之后每次 [[next()]] 继续运行到下一个 [[yield]]。这让无限序列、超大文件、昂贵计算成为可能，也让「什么时候发生副作用」变得不直观。\n\n[[itertools]] 提供了一套惰性工具：[[count()]] 无限计数，[[cycle()]] 循环，[[repeat()]] 重复，[[islice()]] 切片，[[chain()]] 串联，[[takewhile()]]/[[dropwhile()]] 按条件截取。它们返回迭代器，不是列表；需要结果时用 [[list()]] 或 [[for]] 消费。不要对无限迭代器直接 [[list()]]，会内存爆炸。\n\n惰性求值会把错误推迟。生成器里的 [[1 / 0]] 可能在你第一次迭代时才抛，而不是调用时；资源打开也可能延迟到第一次 [[next()]]。调试时要区分「创建」和「消费」两个阶段，日志打在 [[yield]] 前后，而不是函数入口。生产代码要在消费端捕获异常，并确保生成器被关闭。\n\n惰性不等于免费。每层生成器都有状态和调用开销，管道太长时可能比一次性列表慢；多次遍历同一份数据时，惰性反而让你重复计算。选择惰性还是物化，取决于数据规模、遍历次数和内存预算。小数据、多次遍历，列表更简单；大数据、一次遍历，生成器更合适。`,
      code: String.raw`from itertools import count, islice, chain, takewhile

def gen():
    print("开始")
    yield 1
    print("继续")
    yield 2

g = gen()
print("创建后")
print(next(g))
print(next(g))

print(list(islice(count(10), 5)))
print(list(chain([1, 2], [3, 4])))
print(list(takewhile(lambda x: x < 3, [1, 2, 3, 1])))

try:
    list(x for x in [1, 0] if 1 / x)
except ZeroDivisionError as err:
    print("消费时才报错:", err)`,
      output: `创建后
开始
1
继续
2
[10, 11, 12, 13, 14]
[1, 2, 3, 4]
[1, 2]
消费时才报错: division by zero`,
      tip: `生成器函数调用时不会执行函数体；错误和副作用可能延迟到第一次 [[next()]]，调试时区分创建与消费。`
    },
    {
      h: "自定义迭代器：状态、耗尽与复用",
      p: `自定义迭代器要实现 [[__iter__]] 和 [[__next__]]。[[__iter__]] 返回 self（如果对象自己维护状态），[[__next__]] 返回下一个值，没有更多值时 [[raise StopIteration]]。状态放在实例属性里，每次 [[next()]] 更新；不要在 [[__next__]] 里重新初始化状态，否则永远停不下来。\n\n迭代器耗尽后，[[__next__]] 应持续抛 [[StopIteration]]，而不是返回值或重置。Python 的 for 循环依赖这个信号；如果你在耗尽后返回 None，for 会继续循环，可能死循环。需要「可重复遍历」的容器，[[__iter__]] 返回一个新的迭代器对象，而不是 self；容器和迭代器是两个角色。\n\n自定义迭代器适合实现「按需生成」的复杂序列，比如树遍历、分页读取、状态机。简单序列用生成器函数更省事：[[def gen(): for x in ...: yield x]]。生成器自动实现 [[__iter__]]/[[__next__]]，还能用 [[yield from]] 委托给子生成器。只有在需要额外状态/方法（比如 [[reset()]]）时，才写类。\n\n迭代器不是线程安全的。多个线程同时 [[next()]] 同一个迭代器，状态可能竞争；需要并发消费时，加锁或每个线程独立迭代器。迭代器也不是可序列化的，[[pickle]] 不能保存「走到哪了」；需要断点续读时，自己记录位置（行号、偏移量），不要 pickle 生成器。`,
      code: String.raw`class Countdown:
    def __init__(self, start):
        self.current = start
    def __iter__(self):
        return self
    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value

c = Countdown(3)
print(list(c))
print(list(c))

def countdown(start):
    while start > 0:
        yield start
        start -= 1

print(list(countdown(3)))
print(list(countdown(3)))`,
      output: `[3, 2, 1]
[]
[3, 2, 1]
[3, 2, 1]`,
      tip: `迭代器耗尽后应持续抛 [[StopIteration]]；容器要可重复遍历，就让 [[__iter__]] 每次返回新迭代器。`
    }
  ],
  "ch7-3": [
    {
      h: "yield 的状态机：暂停、恢复与 send",
      p: `生成器函数包含 [[yield]] 时，调用它不会执行函数体，而是返回一个生成器对象。每次 [[next()]] 运行到下一个 [[yield]]，把值交出去并暂停；下一次 [[next()]] 从暂停处恢复，继续执行。局部变量、指令指针、异常状态都保存在生成器的帧里，所以它能「记住」上次算到哪。\n\n[[send(value)]] 可以把值送回生成器，[[yield]] 表达式的结果就是 send 的参数；第一次必须 [[next()]] 或 [[send(None)]] 启动。[[throw()]] 在暂停处抛异常，[[close()]] 抛 [[GeneratorExit]] 并结束。这些能力让生成器可以做协程，但真正的异步协程用 [[async def]]/[[await]]；普通生成器的 send/throw 主要用于管道和状态机。\n\n生成器退出时，[[finally]] 会执行，适合释放文件、锁、连接。但如果你不消费完、不显式 [[close()]]，垃圾回收时才触发 [[finally]]，时机不确定；长时间运行的服务要确保生成器被关闭。[[with]] 语句在生成器里也能用，但要理解「进入/退出」发生在哪个 [[yield]] 点。\n\n[[yield from]] 委托给子生成器，把子生成器的值、send、throw、返回值都转发过去。它比手写 [[for x in sub: yield x]] 更完整，也支持子生成器的返回值：[[result = yield from sub()]]。写递归生成器（树遍历、嵌套结构展开）时，[[yield from]] 能保持代码简洁。`,
      code: String.raw`def echo():
    print("启动")
    while True:
        value = yield
        if value is None:
            break
        print("收到", value)
        yield value * 2

g = echo()
next(g)
print(g.send(3))
print(g.send(5))
g.close()

def sub():
    yield 1
    return "done"

def outer():
    result = yield from sub()
    print("子生成器返回:", result)
    yield 2

print(list(outer()))`,
      output: `启动
收到 3
6
收到 5
10
子生成器返回: done
[1, 2]`,
      tip: `[[send()]] 第一次必须传 None（或用 [[next()]] 启动）；直接 [[g.send(3)]] 会抛 TypeError。`
    },
    {
      h: "生成器管道：逐行读取、转换与聚合",
      p: `生成器管道把「读取 → 清洗 → 转换 → 聚合」拆成多个小生成器，每个只做一件事，数据像流水一样流过，内存只保留当前元素。[[read_lines(path)]] 逐行读文件，[[parse(line)]] 解析，[[valid(records)]] 过滤，[[summarize(records)]] 聚合；每一层都是惰性的，只有最后消费时才真正执行。\n\n管道的好处是可组合、可测试。你可以单独测 [[parse()]] 对坏行的行为，也可以替换读取源（文件、网络、数据库）而不动后面的逻辑。坏处是错误定位变难：异常可能从管道深处冒出来，栈里全是生成器帧。给每一层加行号/上下文，或者在边界捕获并包装异常。\n\n管道不要重复消费。[[records = parse(f)]] 是一个生成器，传给 [[summarize()]] 后耗尽；再传给另一个函数就是空的。需要多个聚合时，要么在一次遍历里同时算多个指标，要么物化（小数据），要么重新读文件。不要假设生成器可重放。\n\n大文件处理要配合 [[with]] 和 [[yield]]。文件对象在生成器里打开，[[finally]] 负责关闭；如果消费方提前 [[break]]，生成器被关闭时 [[finally]] 会执行。不要用 [[readlines()]] 再包生成器，那样已经物化了整个文件。真正的流式处理是 [[for line in f: yield ...]]，每次只读一行。`,
      code: String.raw`from pathlib import Path

def read_lines(path):
    with Path(path).open(encoding="utf-8") as f:
        for lineno, line in enumerate(f, 1):
            yield lineno, line.rstrip("\n")

def parse(lines):
    for lineno, line in lines:
        if not line.strip():
            continue
        parts = [p.strip() for p in line.split(",")]
        if len(parts) != 2:
            print("坏行", lineno, parts)
            continue
        yield {"name": parts[0], "score": float(parts[1])}

def valid(records):
    for r in records:
        if 0 <= r["score"] <= 100:
            yield r

def total(records):
    return sum(r["score"] for r in records)

Path("scores.csv").write_text("林晓,91\n周宁,88\n坏行\n", encoding="utf-8")
print(total(valid(parse(read_lines("scores.csv")))))`,
      output: `坏行 3 ['坏行']
179.0`,
      tip: `生成器管道只能消费一次；需要多个聚合时，在一次遍历里同时算，或重新读源，不要假设可重放。`
    },
    {
      h: "生成器与协程的边界：异常、关闭与资源清理",
      p: `生成器不是协程，但两者共享「暂停/恢复」的机制。[[async def]] 里的 [[await]] 让出控制权给事件循环，普通生成器的 [[yield]] 让出值给调用方；前者由 asyncio 驱动，后者由 [[next()]] 驱动。不要把两者混用：在普通生成器里 [[await]] 是语法错误，在 async 函数里 [[yield]] 会变成异步生成器，需要 [[async for]]。\n\n生成器异常有三种进入方式：生成器内部抛异常，异常在 [[yield]] 处冒出，生成器结束；调用方 [[throw()]] 把异常送进去，生成器可以捕获并处理；调用方 [[close()]] 抛 [[GeneratorExit]]，生成器应清理并退出，不应再 [[yield]]。[[finally]] 是清理资源的正确位置，[[except GeneratorExit]] 里不要再产出值。\n\n资源清理要幂等。文件关闭、锁释放、临时文件删除，重复执行不应报错；生成器可能在异常、提前 break、垃圾回收多种路径下结束，清理代码要能承受多次调用。[[contextlib.contextmanager]] 把生成器包装成上下文管理器，[[yield]] 前是 enter，[[yield]] 后是 exit；异常会抛到 [[yield]] 处，你可以选择捕获或继续抛。\n\n不要把生成器当数据库游标长期持有。连接可能超时，事务可能失效，生成器暂停期间数据可能变化；需要分页/游标时，用数据库驱动提供的游标，并明确关闭。生成器适合「一次遍历的计算」，不适合「跨请求的持久状态」。理解边界，才能既享受惰性，又不把系统搞复杂。`,
      code: String.raw`def resource():
    print("打开")
    try:
        yield 1
        yield 2
    except GeneratorExit:
        print("被关闭")
        raise
    finally:
        print("清理")

g = resource()
print(next(g))
g.close()

def safe():
    try:
        yield 1
    finally:
        print("finally 执行")

g = safe()
print(next(g))
del g
print("删除后")`,
      output: `打开
1
被关闭
清理
1
finally 执行
删除后`,
      tip: `[[close()]] 会在 [[yield]] 处抛 [[GeneratorExit]]；清理放 [[finally]]，不要在 [[except GeneratorExit]] 里继续 [[yield]]。`
    }
  ]
});

/* --- deep1-extra.js --- */

window.PY_FOUNDATIONS_DEEP2 = Object.assign(window.PY_FOUNDATIONS_DEEP2 || {}, {
  "ch1-1": [
    {
      h: "动手实验：让脚本既能运行又能被导入",
      p: `把下面保存为 [[score_tools.py]]，先在终端直接运行，再在另一个 Python 进程里导入。你会看到两种运行形态的差别：直接运行时 [[__name__]] 是 [["__main__"]]，主函数执行；导入时 [[__name__]] 是 [["score_tools"]]，只定义函数，不自动跑测试。这个实验的重点不是记住结论，而是亲眼看到 [[__name__]] 的值。`,
      code: String.raw`# score_tools.py
def average(scores):
    return sum(scores) / len(scores) if scores else 0.0

def main():
    print("模块名:", __name__)
    print("平均:", average([88, 92, 79]))

if __name__ == "__main__":
    main()

# 另一个文件或 REPL：
# import score_tools
# print(score_tools.__name__)
# score_tools.average([1, 2, 3])`,
      output: `# 直接运行 score_tools.py
模块名: __main__
平均: 86.33333333333333

# 导入后
score_tools
2.0`,
      tip: `[[import]] 会执行模块顶层代码；把测试/打印放进 [[if __name__ == "__main__"]]，导入才不会产生副作用。`
    },
    {
      h: "复盘卡：运行形态与主函数保护",
      p: `三句话总结：REPL 适合验证一个点，脚本适合固定流程，模块适合被复用；三者语法一样，生命周期不同。[[__name__]] 是解释器给的模块身份，直接运行时是 [["__main__"]]，导入时是模块名。主函数保护不是仪式，而是把「只在直接运行时做的事」隔离出来，避免导入副作用。\n\n自测：如果把 [[print(__name__)]] 放在模块顶层，导入时会不会打印？会，而且打印的是模块名。如果把 [[main()]] 放在 [[if __name__ == "__main__"]] 里，导入时会不会执行？不会。如果模块被 [[python -m score_tools]] 运行，[[__name__]] 是什么？仍然是 [["__main__"]]，因为 -m 也是直接执行。\n\n常见误区：把「模块名」当成文件名；把 [[__main__]] 当成固定字符串常量；在模块顶层读文件/连数据库。前两个是概念混淆，第三个是工程问题：导入应该轻量、可重复，不应该产生不可控副作用。`,
      tip: `[[python -m 模块名]] 也会把 [[__name__]] 设为 [["__main__"]]；不要以为只有 [[python 文件.py]] 才触发主函数。`
    }
  ],
  "ch1-2": [
    {
      h: "动手实验：用 id 追踪共享与重新绑定",
      p: `这个实验不背概念，只看 [[id()]] 的变化。对列表做 [[+=]]，身份通常不变；对整数做 [[+=]]，身份变了，因为整数不可变，[[+]] 产生新对象。把同一个列表传给函数，函数里 [[append]] 后调用方也能看到；把整数传进去，函数里重新赋值不会影响调用方。把输出抄下来，你就能用「身份有没有变」判断「是原地修改还是重新绑定」。`,
      code: String.raw`a = [1, 2]
print("before", id(a))
a += [3]
print("after ", id(a), a)

x = 10
print("before", id(x))
x += 1
print("after ", id(x), x)

def mutate(items):
    items.append(99)

def rebind(n):
    n += 1
    return n

lst = [1]
mutate(lst)
print(lst)

num = 10
print(rebind(num), num)`,
      output: `before 4371000000
after  4371000000 [1, 2, 3]
before 4370999888
after  4370999968 11
[1, 99]
11 10`,
      tip: `[[id()]] 只能说明「当前进程内是不是同一个对象」，不能说明值相等；对象回收后 id 可能复用，不要长期保存。`
    },
    {
      h: "复盘卡：名字、对象、类型与可变性",
      p: `四句话：名字是标签，对象才有类型和身份；[[==]] 比较值，[[is]] 比较身份；不可变对象「修改」其实是重新绑定，可变对象才可能原地变；函数参数传递的是对象引用，不是复制。把这四句串起来，[[a = b]]、[[a += b]]、[[f(a)]] 的行为都能推导。\n\n自测：[[a = [1]; b = a; b += [2]]] 后 a 是什么？[1, 2]，因为原地扩展。[[a = 1; b = a; b += 1]] 后 a 是什么？1，因为整数重新绑定。[[def f(x): x = []；调用 f(a)]] 会改变 a 吗？不会，函数里只是让局部名字指向新列表。\n\n常见误区：把 [[is]] 当「更严格的等于」；以为 [[b = a]] 会复制；以为默认参数每次调用都新建。判断方法只有一个：看对象有没有被原地修改，看名字有没有被重新绑定。`,
      tip: `[[b = a]] 不复制；[[b = a.copy()]] 只复制外层；嵌套可变对象要 [[copy.deepcopy()]] 才真正独立。`
    }
  ],
  "ch1-3": [
    {
      h: "动手实验：把成绩单脚本拆成三个函数",
      p: `把「解析、计算、渲染」拆开，每个函数只做一件事。[[parse_scores]] 接收原始列表，返回干净的浮点列表；[[summarize]] 只算统计，不打印；[[render]] 只把结果变成文本。最后 [[main]] 串起来并处理异常。这个结构让你可以单独测试平均分，不必每次准备完整输入。`,
      code: String.raw`def parse_scores(raw):
    scores = []
    for i, value in enumerate(raw, 1):
        try:
            score = float(value)
        except ValueError as err:
            raise ValueError(f"第 {i} 个成绩不是数字: {value!r}") from err
        if not 0 <= score <= 100:
            raise ValueError(f"第 {i} 个成绩越界: {score}")
        scores.append(score)
    return scores

def summarize(scores):
    if not scores:
        return {"count": 0, "avg": 0.0}
    return {"count": len(scores), "avg": sum(scores) / len(scores)}

def render(name, summary):
    return f"{name}: {summary['count']} 门, 平均 {summary['avg']:.1f}"

def main(raw):
    scores = parse_scores(raw)
    print(render("林晓", summarize(scores)))

main(["91", "88.5", "79"])`,
      output: `林晓: 3 门, 平均 86.2`,
      tip: `解析函数抛错时带上「第几个」和原始值；只写「格式错误」，调用方还得自己猜是哪一条。`
    },
    {
      h: "复盘卡：第一个项目的检查清单",
      p: `交付前过一遍：输入是否校验了类型、范围、空值？除零是否处理？输出是否固定格式、能否核对？错误信息是否带上下文？函数是否能在不读文件的情况下测试？文件写入是否指定编码和换行？这六项比「代码看起来优雅」重要。\n\n自测：[[sum([]) / len([])]] 会发生什么？ZeroDivisionError，所以空列表要单独处理。[[float("nan")]] 能通过范围校验吗？不能，[[0 <= nan <= 100]] 为 False。报告里为什么要写数据来源和生成时间？为了下次能判断报告是否过期、是否读错文件。\n\n常见误区：把校验和计算混在一个函数；用 [[print]] 代替返回；把异常吞掉只打印一行；写文件不指定编码。这个项目很小，但它是后面所有项目的骨架：输入契约、纯函数、边界、可复查。`,
      tip: `先写「坏输入会怎样」，再写「好输入怎么算」；边界测试比正常路径更能暴露设计问题。`
    }
  ]
});

/* --- deep2-extra.js --- */

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

/* --- deep3-extra.js --- */

window.PY_FOUNDATIONS_DEEP2 = Object.assign(window.PY_FOUNDATIONS_DEEP2 || {}, {
  "ch3-1": [
    {
      h: "动手实验：维护一个成绩列表",
      p: `从空列表开始，依次追加、插入、删除、按值删除，观察长度和内容。重点看 [[append()]] 与 [[extend()]] 的差别：前者加一个元素，后者把可迭代对象逐个加进去；[[insert()]] 越界不会报错，会插到末尾；[[pop()]] 不传下标删最后一个。`,
      code: String.raw`scores = []
scores.append(91)
scores.append([88, 76])
print(scores, len(scores))

scores = [91]
scores.extend([88, 76])
print(scores, len(scores))

scores.insert(1, 85)
print(scores)
scores.insert(100, 60)
print(scores)

scores.remove(85)
print(scores.pop(), scores)`,
      output: `[91, [88, 76]] 2
[91, 88, 76] 3
[91, 85, 88, 76]
[91, 85, 88, 76, 60]
76 [91, 88, 60]`,
      tip: `[[append(x)]] 把 x 当一个元素；[[extend(xs)]] 把 xs 拆开逐个加。追加一个列表时，先确认你要的是哪一种。`
    },
    {
      h: "复盘卡：列表操作的复杂度与选择",
      p: `记四个数字：尾部 append/pop 均摊 O(1)，按下标读写 O(1)，按值查找/删除 O(n)，头部插入/删除 O(n)。需要频繁两端操作，用 [[deque]]；需要按值快速判断存在，用 [[set]]；需要按 key 查找，用 [[dict]]。列表不是万能容器。\n\n自测：[[insert(0, x)]] 为什么慢？后面元素整体右移。[[remove(x)]] 找不到会怎样？抛 ValueError。[[a[:]]] 是深拷贝吗？不是，只复制外层。遍历时删元素为什么会跳过？迭代器下标仍在前进。\n\n常见误区：用 [[append]] 加列表；用 [[pop(0)]] 当队列；用 [[in]] 在大列表里反复查；以为切片复制了内层对象。选结构前先列出「最频繁的三个操作」，再谈优化。`,
      tip: `[[pop(0)]] 是 O(n)，[[deque.popleft()]] 是 O(1)；需要队列就用 [[collections.deque]]。`
    }
  ],
  "ch3-2": [
    {
      h: "动手实验：按平均分排序并复制",
      p: `给三条记录算平均分，用 [[sorted(key=...)]] 排序，再用 [[sort()]] 原地排序。然后做一个浅拷贝，修改内层列表，观察原数据是否变化。这个实验同时练「排序键」和「拷贝层级」，两者都是成绩表的高频操作。`,
      code: String.raw`records = [
    {"name": "林晓", "scores": [91, 88]},
    {"name": "周宁", "scores": [86, 92]},
    {"name": "陈默", "scores": [78, 85]},
]
for r in records:
    r["avg"] = sum(r["scores"]) / len(r["scores"])

ranked = sorted(records, key=lambda r: (-r["avg"], r["name"]))
print([(r["name"], round(r["avg"], 1)) for r in ranked])

copy1 = [dict(r) for r in records]
copy1[0]["scores"].append(100)
print(records[0]["scores"], copy1[0]["scores"])

import copy
deep = copy.deepcopy(records)
deep[0]["scores"].append(100)
print(records[0]["scores"], deep[0]["scores"])`,
      output: `[('林晓', 89.5), ('周宁', 89.0), ('陈默', 81.5)]
[91, 88] [91, 88, 100]
[91, 88] [91, 88, 100]`,
      tip: `[[dict(r)]] 只复制外层字典，内层 [[scores]] 仍共享；需要独立嵌套结构时用 [[copy.deepcopy()]]。`
    },
    {
      h: "复盘卡：排序与拷贝的边界",
      p: `排序三问：按什么键？升序还是降序？同分怎么办？拷贝三问：要不要独立？只独立外层还是所有层？元素里有不可拷贝资源吗？这两组问题答完，代码基本就定了。\n\n自测：[[sorted()]] 会改原列表吗？不会。[[sort()]] 返回什么？None。[[key=lambda r: -r["score"]]] 对字符串分数能用吗？不能，字符串不能取负。[[a.copy()]] 会复制内层列表吗？不会。\n\n常见误区：[[a = a.sort()]] 把列表弄丢；用 [[reverse=True]] 又想要次要键升序，结果次要键也被反转；用 [[copy.deepcopy()]] 复制包含文件句柄的对象。排序键要返回同类型、可比较的值；拷贝要按层级选方案。`,
      tip: `多键排序优先用元组 key，例如 [[(class, -score, name)]]；它比「先排次要键再排主要键」更直观，但要求类型一致。`
    }
  ],
  "ch3-3": [
    {
      h: "动手实验：用元组返回统计结果",
      p: `写一个函数返回「人数、平均分、最高分」，调用方整体接收再解包。然后试单元素元组、空元组、嵌套解包，观察什么时候需要逗号。重点是把「返回多个值」理解为「返回一个元组」，而不是 Python 的特殊语法。`,
      code: String.raw`def stats(scores):
    if not scores:
        return 0, 0.0, 0.0
    return len(scores), sum(scores) / len(scores), max(scores)

result = stats([91, 88, 76])
print(result)
count, avg, top = result
print(count, avg, top)

one = (1)
two = (1,)
print(type(one), type(two))

row = ("林晓", (91, 88))
name, (python, math) = row
print(name, python, math)`,
      output: `(3, 85.0, 91)
3 85.0 91
<class 'int'> <class 'tuple'>
林晓 91 88`,
      tip: `单元素元组必须写 [[(1,)]]；[[(1)]] 只是加了括号的整数。函数返回多值时，本质也是元组。`
    },
    {
      h: "复盘卡：元组、解包与 zip",
      p: `元组适合「固定结构、只读记录、字典键」；列表适合「可变、同质、需要增删」。解包适合短小固定结构；结构一复杂，改用 namedtuple/dataclass。zip 适合按位置配对，但要注意最短截断和一次性迭代。\n\n自测：[[(1, [2])]] 能当字典键吗？不能，列表不可哈希。[[a, *b = [1]]] 中 b 是什么？空列表。[[zip(a, b)]] 长度不一致会怎样？静默按最短停。[[zip(*rows)]] 行不等长会怎样？按最短截断。\n\n常见误区：用元组存需要修改的记录；用解包处理结构不固定的 JSON；用 zip 后重复遍历；忘记单元素元组的逗号。元组不是「不可变的列表」这么简单，它还有哈希和记录语义。`,
      tip: `[[zip]] 默认按最短截断，[[strict=True]] 才会报错；处理应该等长的数据时，显式加 strict。`
    }
  ]
});

/* --- deep4-extra.js --- */

window.PY_FOUNDATIONS_DEEP2 = Object.assign(window.PY_FOUNDATIONS_DEEP2 || {}, {
  "ch4-1": [
    {
      h: "动手实验：用字典做学号索引",
      p: `把学生列表转成「学号 → 记录」的字典，再按学号查、改、删。重点观察：键重复时后值覆盖前值；[[get()]] 和 [[]] 对缺失键的行为不同；遍历字典得到键，[[items()]] 才拿到键值对。`,
      code: String.raw`students = [
    {"sid": "S01", "name": "林晓", "score": 91},
    {"sid": "S02", "name": "周宁", "score": 88},
    {"sid": "S01", "name": "林晓", "score": 95},
]
index = {s["sid"]: s for s in students}
print(index["S01"])
print(index.get("S99"))
print("S99" in index)

index["S03"] = {"sid": "S03", "name": "陈默", "score": 76}
del index["S02"]
print(list(index.keys()))
print([(k, v["score"]) for k, v in index.items()])`,
      output: `{'sid': 'S01', 'name': '林晓', 'score': 95}
None
False
['S01', 'S03']
[('S01', 95), ('S03', 76)]`,
      tip: `字典推导式遇到重复键会静默覆盖；需要检测重复学号时，先用普通循环记录冲突，不要直接一把梭。`
    },
    {
      h: "复盘卡：字典的读取、更新与顺序",
      p: `字典四件事：键必须可哈希；[[]] 缺失抛 KeyError，[[get()]] 返回默认；[[setdefault()]] 会插入，[[defaultdict]] 会惰性建默认值；遍历顺序是插入顺序。把这四件记住，大部分字典问题都能定位。\n\n自测：[[{[]: 1}]] 能创建吗？不能，列表不可哈希。[[d.get("x")]] 会插入 x 吗？不会。[[setdefault("x", [])]] 会插入吗？会。删除后顺序会怎样？其余键保持相对插入顺序，但不要依赖复杂的删除/重插顺序。\n\n常见误区：用 [[d["x"]] += 1]] 给缺失键计数；用可变对象做键；以为字典按哈希排序；用 [[list(d)]] 取「第一个值」（那是键）。计数用 [[defaultdict(int)]] 或 [[get(k, 0) + 1]]。`,
      tip: `[[d["x"]] += 1]] 在键不存在时先抛 KeyError；计数用 [[d[k] = d.get(k, 0) + 1]] 或 [[defaultdict(int)]]。`
    }
  ],
  "ch4-2": [
    {
      h: "动手实验：按班级聚合嵌套记录",
      p: `给每个学生加班级字段，用 [[defaultdict(list)]] 按班级分组，再算每班平均分。重点看「记录结构」和「聚合结构」的差别：记录是 [[{"name":..., "scores":...}]]，聚合是 [[{class: [records]}]]。不要把两者混成一个四层嵌套。`,
      code: String.raw`from collections import defaultdict

students = [
    {"name": "林晓", "class": "A", "scores": {"python": 91, "math": 88}},
    {"name": "周宁", "class": "B", "scores": {"python": 86, "math": 92}},
    {"name": "陈默", "class": "A", "scores": {"python": 78, "math": 85}},
]

by_class = defaultdict(list)
for s in students:
    by_class[s["class"]].append(s)

for cls, rows in by_class.items():
    avg = sum(r["scores"]["python"] for r in rows) / len(rows)
    print(cls, len(rows), round(avg, 1), [r["name"] for r in rows])`,
      output: `A 2 84.5 ['林晓', '陈默']
B 1 86.0 ['周宁']`,
      tip: `聚合结构只放「分组键 + 记录列表」，不要在聚合层再复制一份完整记录；需要时用引用，不需要时用 id。`
    },
    {
      h: "复盘卡：嵌套数据的建模与缺失",
      p: `建模三问：这条记录有哪些字段？哪些字段可能缺失？按什么键查找/分组？字段少而固定，用 dict；字段多且需要约束，用 dataclass；需要序列化，保证字段都是 JSON 类型。嵌套层级控制在三层以内，再深就拆表或拆对象。\n\n自测：[[d.get("a", {}).get("b")]] 在 a 是 None 时会怎样？抛 AttributeError，因为 None 没有 get。[[{**a, **b}]] 是深合并吗？不是，只合并顶层。[[defaultdict(list)]] 访问缺失键会插入吗？会。[[copy.deepcopy()]] 能复制所有对象吗？不能，文件/连接/锁不行。\n\n常见误区：用链式 get 掩盖数据损坏；把所有缺失都变成 None；深合并时数组语义不清；用 JSON 往返做深拷贝。缺失要有业务含义，合并要有明确规则，拷贝要看资源类型。`,
      tip: `[[d.get("a", {}).get("b")]] 在 a 存在但值为 None 时仍会炸；多层读取要么逐层判断，要么写 safe_get。`
    }
  ],
  "ch4-3": [
    {
      h: "动手实验：用集合做选课交集",
      p: `给两个学生各自的课程集合，求共同课程、并集、差集。再用 [[frozenset]] 做字典键，观察它为什么可哈希。重点是把集合运算和「权限/标签/去重」场景连起来，而不是只记符号。`,
      code: String.raw`a = {"Python", "数学", "英语"}
b = {"Python", "物理", "英语"}

print("共同:", a & b)
print("全部:", a | b)
print("a 独有:", a - b)
print("对称差:", a ^ b)

fs = frozenset(a)
print({fs: "课程组"})

print(len(a), len(a | b))
print("Python" in a, "化学" in a)`,
      output: `共同: {'Python', '英语'}
全部: {'Python', '数学', '英语', '物理'}
a 独有: {'数学'}
对称差: {'数学', '物理'}
{'frozenset({...})': '课程组'}
3 4
True False`,
      tip: `集合打印顺序不稳定；需要固定输出时 [[sorted(a & b)]]，不要依赖 [[list(set)[0]]]。`
    },
    {
      h: "复盘卡：集合的语义与性能",
      p: `集合三件事：元素可哈希；元素唯一；顺序不保证。适合去重、成员判断、集合运算；不适合按顺序取第几个、存重复、存不可哈希对象。需要顺序去重用 [[dict.fromkeys()]]，需要不可变集合用 [[frozenset]]。\n\n自测：[[{}]] 是什么？空字典。[[set("abc")]] 得到什么？三个字符的集合。[[a | [1]]] 能运行吗？不能，运算符要求集合。[[a.union([1])]] 能运行吗？能，方法接受可迭代对象。[[frozenset]] 能当字典键吗？能。\n\n常见误区：用集合当队列；用 [[pop()]] 取「第一个」；用集合去重后还想要原顺序；把列表塞进集合。先问「我要唯一性、顺序还是成员判断」，再选容器。`,
      tip: `集合 [[pop()]] 删除任意元素；需要按顺序取，用列表/堆，不要用集合。`
    }
  ]
});

/* --- deep5-extra.js --- */

window.PY_FOUNDATIONS_DEEP2 = Object.assign(window.PY_FOUNDATIONS_DEEP2 || {}, {
  "ch5-1": [
    {
      h: "动手实验：把分数映射成等级",
      p: `写一个 [[grade(score)]]，先用 [[if/elif/else]]，再故意把边界写成 [[score > 90]] 和 [[score >= 90]]，比较 90 分的结果。然后传入 [[True]] 和 [[None]]，看类型校验是否挡住。这个实验的重点是边界与类型，而不是等级名字。`,
      code: String.raw`def grade(score):
    if isinstance(score, bool) or not isinstance(score, (int, float)):
        raise TypeError("分数必须是数字")
    if not 0 <= score <= 100:
        raise ValueError("分数越界")
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B"
    elif score >= 60:
        return "C"
    return "D"

for s in [90, 89.9, 60, 59.9, 0]:
    print(s, grade(s))

for bad in [True, None, "90", 101]:
    try:
        print(bad, grade(bad))
    except (TypeError, ValueError) as err:
        print(bad, type(err).__name__, err)`,
      output: `90 A
89.9 B
60 C
59.9 D
0 D
True TypeError 分数必须是数字
None TypeError 分数必须是数字
'90' TypeError 分数必须是数字
101 ValueError 分数越界`,
      tip: `[[isinstance(True, int)]] 为 True，所以数字校验要先排除 bool；否则 True 会被当成 1 分。`
    },
    {
      h: "复盘卡：分支、真值与边界",
      p: `分支三问：条件是否互斥？是否覆盖所有输入？边界是开还是闭？真值三问：空容器、0、None 分别代表什么？自定义对象的 bool 有没有业务含义？and/or 返回的是不是布尔值？这三组问题能挡住大部分逻辑错误。\n\n自测：[[0 <= x < 100]] 包含 100 吗？不包含。[[[] == False]] 是什么？False，但 [[bool([])]] 是 False。[[0 or "x"]] 是什么？"x"。[[1 and 0]] 是什么？0。[[not None]] 是什么？True。\n\n常见误区：用 [[== False]] 判断假；把 [[and/or]] 当布尔运算；边界写反；不校验 bool；长条件不命名。条件先命名再判断，边界用一组小样本测，别靠直觉。`,
      tip: `[[and/or]] 返回操作数，不是布尔值；需要严格布尔时用 [[bool()]]，需要二选一时用 [[x if cond else y]]。`
    }
  ],
  "ch5-2": [
    {
      h: "动手实验：找第一个不及格并跳过空行",
      p: `给一组带空字符串的成绩，用 [[enumerate]] 找第一个不及格，用 [[continue]] 跳过空行，用 [[for...else]] 处理「全及格」。重点看：break 后 else 不执行；continue 只跳过本次；enumerate 的行号从 1 开始。`,
      code: String.raw`scores = ["91", "", "88", "59", "76"]

for i, raw in enumerate(scores, 1):
    if not raw:
        continue
    score = int(raw)
    if score < 60:
        print("第一个不及格:", i, score)
        break
else:
    print("全部及格")

for i, raw in enumerate(scores, 1):
    if raw:
        print(i, raw)`,
      output: `第一个不及格: 4 59
1 91
3 88
4 59
5 76`,
      tip: `[[for...else]] 的 else 在「没有 break」时执行；空行用 [[continue]] 跳过，不要用 [[pass]]。`
    },
    {
      h: "复盘卡：循环的退出与遍历",
      p: `循环四件事：遍历什么？怎么退出？跳过什么？循环变量结束后还在吗？for 适合已知集合，while 适合未知次数；break 只跳一层，continue 只跳本次；for/while 的 else 在「没有 break」时执行。\n\n自测：[[range(5, 0, -1)]] 包含 0 吗？不包含。[[for i in range(3): pass]] 后 i 是多少？2。[[zip]] 长度不一致会怎样？按最短停。[[while True]] 没有 break 会怎样？死循环。\n\n常见误区：用 [[range(len(xs))]] 而不直接遍历；在循环里修改列表；嵌套 break 以为能跳两层；忘记 while 的退出条件。遍历优先直接迭代；要下标用 enumerate；要提前退出用 break/return。`,
      tip: `嵌套循环要跳两层时，抽成函数用 [[return]]；异常不适合做常规「找到就停」的控制流。`
    }
  ],
  "ch5-3": [
    {
      h: "动手实验：用 if/elif 写 match 的降级版",
      p: `把「零、二元序列、带 name 的映射、其他」四种情况，先用 match 写，再用 if/elif 写。比较两者：match 更像「按形状分类」，if/elif 更像「按条件判断」。这个实验的重点是理解模式匹配的语义，而不是记住语法。`,
      code: String.raw`def describe_if(value):
    if value == 0:
        return "零"
    if isinstance(value, (list, tuple)) and len(value) == 2:
        return f"两个元素: {value[0]}, {value[1]}"
    if isinstance(value, dict) and "name" in value:
        return f"名字: {value['name']}"
    return "其他"

print(describe_if(0))
print(describe_if([1, 2]))
print(describe_if({"name": "林晓", "score": 91}))
print(describe_if("x"))`,
      output: `零
两个元素: 1, 2
名字: 林晓
其他`,
      tip: `降级版要显式 [[isinstance]] 和长度/键检查；match 帮你做了这些，但语义仍然是「形状匹配」。`
    },
    {
      h: "复盘卡：模式匹配的边界",
      p: `match 四件事：从上到下、首个命中、不穿透；case _ 匹配一切且应放最后；模式描述形状，不是表达式；守卫在匹配成功后执行。它适合拆结构，不适合替代简单 if/elif。\n\n自测：[[case 1 + 2:]] 合法吗？不合法，模式不是表达式。[[case [x, y]:]] 匹配三个元素吗？不匹配。[[case {"name": name}:]] 要求字典只有 name 键吗？不要求。[[match]] 在 Python 3.9 能跑吗？不能，SyntaxError。[[case _]] 放前面会怎样？后面的 case 永远不执行。\n\n常见误区：把 match 当 switch；用 [[case _]] 捕获所有却不处理；在守卫里做副作用；在 3.8 环境写 match。先确认版本，再确认「我是在拆形状还是判断值」。`,
      tip: `[[match]] 是 3.10+ 语法，3.9 及以下直接 SyntaxError；练习室 3.8 只能读，不能提交。`
    }
  ]
});

/* --- deep6-extra.js --- */

window.PY_FOUNDATIONS_DEEP2 = Object.assign(window.PY_FOUNDATIONS_DEEP2 || {}, {
  "ch6-1": [
    {
      h: "动手实验：写一个健壮的 average",
      p: `实现 [[average(scores)]]：空列表抛 ValueError，非数字抛 TypeError，返回浮点平均。再试默认参数 [[average(scores, default=0.0)]]，让空列表可以选择返回默认。重点看「校验、默认、返回」三件事怎么在同一个函数里排布。`,
      code: String.raw`def average(scores, default=None):
    if not scores:
        if default is not None:
            return default
        raise ValueError("scores 不能为空")
    total = 0.0
    for i, value in enumerate(scores, 1):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError(f"第 {i} 个不是数字: {value!r}")
        total += value
    return total / len(scores)

print(average([90, 80, 70]))
print(average([], default=0.0))
try:
    average([])
except ValueError as err:
    print(err)
try:
    average([90, "80"])
except TypeError as err:
    print(err)`,
      output: `80.0
0.0
scores 不能为空
第 2 个不是数字: '80'`,
      tip: `默认值写 [[None]] 再在函数体内判断；不要写 [[def average(scores, default=[])]]，可变默认值会跨调用共享。`
    },
    {
      h: "复盘卡：函数设计与参数",
      p: `函数三问：输入是什么？输出是什么？出错时抛什么？参数三问：哪些必填？哪些有默认？默认值是不是可变对象？返回三问：成功返回什么？失败返回什么？调用方能不能直接解包？答完再写函数体。\n\n自测：没有 return 的函数返回什么？None。[[return]] 后不写值呢？None。[[*args]] 收集到的是什么类型？元组。[[**kwargs]] 的键必须是什么？字符串。[[/]] 和 [[*]] 分别限制什么？仅限位置、仅限关键字。\n\n常见误区：默认参数用列表/字典；用 [[assert]] 做参数校验；把打印当返回；返回 None 却让调用方直接解包。公共函数要显式校验并抛异常，默认值用 None，输出和副作用分开。`,
      tip: `[[assert]] 在 [[python -O]] 会被移除，不能当参数校验；要抛 [[TypeError]]/[[ValueError]]。`
    }
  ],
  "ch6-2": [
    {
      h: "动手实验：做一个计数器与排序键",
      p: `用闭包做计数器，用 lambda 做排序键，再用 [[operator.itemgetter]] 替换 lambda。重点看：闭包捕获的是变量，循环里创建 lambda 会晚绑定；默认参数可以固定当前值；itemgetter 比 lambda 更快也更清楚。`,
      code: String.raw`def make_counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    return inc

c = make_counter()
print(c(), c(), c())

funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])

funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])

import operator
records = [{"score": 91}, {"score": 88}]
print(sorted(records, key=operator.itemgetter("score")))`,
      output: `1 2 3
[2, 2, 2]
[0, 1, 2]
[{'score': 88}, {'score': 91}]`,
      tip: `循环里创建 lambda 用默认参数固定当前值；否则所有闭包看到循环结束后的最后一个值。`
    },
    {
      h: "复盘卡：作用域、闭包与高阶函数",
      p: `作用域四层：Local、Enclosing、Global、Builtins。函数内赋值让名字变局部；改外层用 nonlocal，改模块用 global；类作用域不参与 LEGB。闭包捕获变量，不捕获值；循环里要早期绑定。高阶函数接收函数，partial 固定参数，itemgetter 取键。\n\n自测：[[x = x + 1]] 在函数里为什么可能 UnboundLocalError？因为 x 被判定为局部但还没绑定。[[nonlocal]] 能指向模块变量吗？不能。[[lambda]] 能写语句吗？不能。[[map/filter]] 返回列表吗？返回迭代器。\n\n常见误区：滥用 global；在循环里创建 lambda 不固定变量；用 lambda 写复杂逻辑；把 [[map]] 结果直接当列表用。需要名字和复用就用 def，需要短键就用 itemgetter/attrgetter。`,
      tip: `[[global]] 只用于「重新绑定」模块变量；只读全局不需要声明，滥用会让依赖关系变隐蔽。`
    }
  ],
  "ch6-3": [
    {
      h: "动手实验：在有序成绩表里二分",
      p: `给一个有序分数列表，用 [[bisect_left]] 找插入位置，再手写 [[lower_bound]] 对照。然后测空数组、目标在首、目标在尾、目标不存在四组用例。重点看「区间定义」和「返回值含义」，不要只记循环条件。`,
      code: String.raw`from bisect import bisect_left, insort

a = [60, 70, 80, 90]
print(bisect_left(a, 75))
print(bisect_left(a, 60), bisect_left(a, 90))
print(bisect_left([], 75))

def lower_bound(a, target):
    left, right = 0, len(a)
    while left < right:
        mid = (left + right) // 2
        if a[mid] < target:
            left = mid + 1
        else:
            right = mid
    return left

print(lower_bound(a, 75), lower_bound(a, 95))
insort(a, 75)
print(a)`,
      output: `2
0 3
0
2 4
[60, 70, 75, 80, 90]`,
      tip: `[[bisect_left]] 返回第一个 >= x 的位置；目标存在时，它返回第一个相等元素的下标。`
    },
    {
      h: "复盘卡：递归与二分",
      p: `递归三件套：基线、递推、收敛；缺一不可。二分三件套：有序、区间定义一致、边界更新正确。递归版二分不要切片，切片会把 O(log n) 变成 O(n)。深度大时用迭代或 bisect。\n\n自测：[[factorial(0)]] 的基线是什么？n <= 1 返回 1。[[sys.setrecursionlimit()]] 能解决爆栈吗？不能，真实栈空间有限。[[bisect_left]] 和 [[bisect_right]] 有什么区别？重复元素时，前者返回第一个相等，后者返回最后一个相等之后。[[lower_bound]] 返回值在目标不存在时是什么？插入位置。\n\n常见误区：递归没有基线；二分混用闭区间和半开区间；每次递归切片；用 [[==]] 找浮点目标。写递归先写基线，写二分先写区间，测边界再测正常。`,
      tip: `二分循环里不要用 [[a[:mid]]]；传下标 [[left, right]]，避免每次复制一半元素。`
    }
  ]
});

/* --- deep7-extra.js --- */

window.PY_FOUNDATIONS_DEEP2 = Object.assign(window.PY_FOUNDATIONS_DEEP2 || {}, {
  "ch7-1": [
    {
      h: "动手实验：清洗成绩表",
      p: `给一组带空字符串、负数和字符串数字的原始成绩，用推导式做「转换 + 过滤」，再用字典推导式按姓名建索引。重点看条件的位置：[[x if ... else ...]] 保留所有元素，[[if ...]] 过滤；转换失败时，推导式会直接抛异常，要么先写安全转换函数，要么用普通循环记录坏行。`,
      code: String.raw`raw = ["91", "", "88", "-5", "76"]
print([int(x) for x in raw if x])

def safe_int(x):
    try:
        return int(x)
    except ValueError:
        return None

clean = [safe_int(x) for x in raw if x]
print(clean)

valid = [x for x in clean if x is not None and x >= 0]
print(valid)

records = [("林晓", 91), ("周宁", 88), ("林晓", 95)]
index = {name: score for name, score in records}
print(index)`,
      output: `[91, 88, -5, 76]
[91, 88, -5, 76]
[91, 88, 76]
{'林晓': 95, '周宁': 88}`,
      tip: `推导式里不要吞异常；先写 [[safe_int]] 返回 None，再用条件过滤，坏数据才有明确出口。`
    },
    {
      h: "复盘卡：推导式的选择与边界",
      p: `推导式三件事：表达式、for、if 的顺序；列表/字典/集合三种结果；生成器表达式是惰性版本。简单转换用推导式，复杂逻辑用普通循环；数据大用生成器，数据要重复遍历用列表。\n\n自测：[[[x for x in xs if x]]] 和 [[[x if x else 0 for x in xs]]] 长度一样吗？不一定，前者过滤，后者保留。[[{k: v for k, v in pairs}]] 重复键会怎样？后者覆盖前者。[[{x for x in xs}]] 能保留顺序吗？不能。[[(x for x in xs)]] 能重复遍历吗？不能。\n\n常见误区：把复杂业务塞进推导式；用集合推导式后还想要顺序；用字典推导式做多对一聚合；在推导式里做副作用。先问「输出长度变不变、要不要顺序、要不要重复遍历」，再选写法。`,
      tip: `字典推导式遇到重复键会静默覆盖；需要检测冲突时用普通循环记录重复键，不要用推导式一把梭。`
    }
  ],
  "ch7-2": [
    {
      h: "动手实验：写一个倒序迭代器",
      p: `实现一个 [[Countdown]]，从 n 倒数到 1，耗尽后持续抛 StopIteration。然后写一个可重复遍历的容器，[[__iter__]] 每次返回新的迭代器。重点区分「容器」和「迭代器」：容器负责创建迭代器，迭代器负责维护状态。`,
      code: String.raw`class Countdown:
    def __init__(self, start):
        self.current = start
    def __iter__(self):
        return self
    def __next__(self):
        if self.current <= 0:
            raise StopIteration
        value = self.current
        self.current -= 1
        return value

c = Countdown(3)
print(list(c))
print(list(c))

class Range3:
    def __iter__(self):
        return iter([0, 1, 2])

r = Range3()
print(list(r))
print(list(r))`,
      output: `[3, 2, 1]
[]
[0, 1, 2]
[0, 1, 2]`,
      tip: `迭代器耗尽后应持续抛 [[StopIteration]]；容器要可重复遍历，就让 [[__iter__]] 每次返回新迭代器。`
    },
    {
      h: "复盘卡：迭代器与惰性",
      p: `迭代器三件事：有状态、一次性、实现 [[__iter__]]/[[__next__]]。可迭代对象三件事：实现 [[__iter__]]、返回迭代器、可重复遍历。惰性三件事：用到才算、可能无限、错误延迟。把这三组区分开，生成器、zip、map、文件遍历都能解释。\n\n自测：[[iter([1,2])]] 返回什么？list_iterator。[[iter([1,2]) is [1,2]]] 呢？False。[[next(it)]] 耗尽后呢？StopIteration。[[list(g)]] 两次呢？第二次空。[[map(f, xs)]] 是列表吗？不是，是迭代器。\n\n常见误区：把列表当迭代器；以为生成器可重复遍历；对无限迭代器 [[list()]]；在 [[__iter__]] 里返回列表。需要重复遍历就重新创建，数据大就用惰性，别把两者混在一起。`,
      tip: `[[__iter__]] 必须返回迭代器，不能返回列表；返回 [[iter([...])]] 或写生成器函数。`
    }
  ],
  "ch7-3": [
    {
      h: "动手实验：统计大日志文件",
      p: `写一个生成器逐行读日志，过滤 ERROR，提取时间戳，最后计数。重点看：文件对象是惰性的，生成器管道只读一遍，[[with]] 在生成器里负责关闭文件。用一个几千行的文件试，不要用 [[readlines()]]。`,
      code: String.raw`from pathlib import Path

def lines(path):
    with Path(path).open(encoding="utf-8") as f:
        for line in f:
            yield line.rstrip("\n")

def errors(lines):
    for line in lines:
        if "ERROR" in line:
            yield line

Path("app.log").write_text(
    "2026-11-24 INFO start\n2026-11-24 ERROR db down\n2026-11-24 ERROR timeout\n",
    encoding="utf-8",
)
count = sum(1 for _ in errors(lines("app.log")))
print(count)
print(list(errors(lines("app.log"))))`,
      output: `2
['2026-11-24 ERROR db down', '2026-11-24 ERROR timeout']`,
      tip: `生成器只能消费一次；[[count]] 之后再 [[list]] 需要重新创建 [[lines(...)]]，不要复用同一个生成器。`
    },
    {
      h: "复盘卡：生成器、管道与资源",
      p: `生成器四件事：yield 暂停、send 恢复、close 清理、yield from 委托。管道四件事：逐层惰性、只消费一次、错误延迟、资源关闭。资源三件事：with/finally 清理、close 显式关闭、异常路径也要清理。\n\n自测：生成器函数调用时会执行函数体吗？不会。第一次 [[send(3)]] 能行吗？不能，要先 [[next()]] 或 [[send(None)]]。[[close()]] 会抛什么？GeneratorExit。[[yield from]] 能拿到子生成器返回值吗？能。生成器能重复遍历吗？不能。\n\n常见误区：把生成器当列表反复用；不关闭带资源的生成器；在 [[except GeneratorExit]] 里继续 yield；把 async 生成器和普通生成器混用。需要重复遍历就物化或重新创建，需要并发就用 async。`,
      tip: `[[close()]] 在 [[yield]] 处抛 [[GeneratorExit]]；清理放 [[finally]]，不要在 [[except GeneratorExit]] 里继续 [[yield]]。`
    }
  ]
});

/* --- deep-read1.js --- */

window.PY_FOUNDATIONS_READ = Object.assign(window.PY_FOUNDATIONS_READ || {}, {
  "ch1-1": [
    {
      h: "深读：从双击脚本到可部署命令，一条完整运行链",
      p: `假设你把成绩单脚本发给同学，他双击后窗口一闪而过，或者在你的电脑能跑、在他的电脑报「找不到模块」。这不是脚本内容的问题，而是「运行链」没有定义。一个可交付的脚本至少要回答五个问题：用哪个解释器、从哪里启动、工作目录是什么、参数从哪里来、失败时怎样让上游知道。\n\n解释器要写清楚。不要依赖「系统里有个 python」；在文档里写 [[python3 --version]]，在脚本里打印 [[sys.executable]]，在项目里用 [[.venv]] 固定依赖。Windows 上可能是 [[py -3.11]]，macOS 可能是 [[/usr/local/bin/python3]]，Linux 容器里可能是 [[/usr/bin/python3]]。名称相同不代表版本相同，版本相同不代表 site-packages 相同。把「解释器路径 + 版本」写进启动日志，是成本最低的防呆。\n\n启动方式也要统一。[[python3 script.py]] 把脚本目录放到 [[sys.path[0]]]，[[python3 -m package.module]] 把当前目录放到 [[sys.path[0]]，两者的导入行为不同。项目里推荐用 [[-m]]，因为它把包当作包来加载，相对导入更可靠；单文件小工具可以用路径启动，但不要同时在两种方式下混用相对导入。工作目录则要显式设置：脚本里用 [[Path(__file__).parent]] 定位资源，不要假设用户从项目根目录启动。\n\n参数和退出码是脚本与外部的契约。[[sys.argv]] 是最原始的入口，[[argparse]] 提供类型转换、帮助和错误码；失败时返回非零，成功时返回 0。不要让脚本在异常后仍然退出 0，也不要在库函数里随手 [[sys.exit()]]。库返回状态，入口负责退出，这是可测试性的基础。下面的脚本把版本、路径、参数和退出码放在一起，是一个可以交给别人的最小骨架。`,
      code: String.raw`#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path

def build_parser():
    p = argparse.ArgumentParser(description="成绩摘要")
    p.add_argument("path", type=Path, help="成绩 CSV 路径")
    p.add_argument("--min", type=float, default=0, help="最低分")
    return p

def main(argv=None):
    args = build_parser().parse_args(argv)
    print("解释器:", sys.executable)
    print("脚本目录:", Path(__file__).resolve().parent)
    print("输入:", args.path.resolve())
    if not args.path.exists():
        print(f"文件不存在: {args.path}", file=sys.stderr)
        return 2
    print("最低分:", args.min)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())`,
      output: `$ python3 report.py scores.csv --min 60
解释器: /usr/local/bin/python3
脚本目录: /Users/me/project
输入: /Users/me/project/scores.csv
最低分: 60.0
$ echo $?
0`,
      tip: `入口用 [[raise SystemExit(main())]] 把返回值变成退出码；库函数只返回状态，不要自己退出进程。`
    }
  ],
  "ch1-2": [
    {
      h: "深读：一次成绩计算的完整类型追踪",
      p: `看一段看起来没问题的代码：[[score = input("分数: "); total = score + 10]]。如果用户输入 90，程序不会得到 100，而是抛 [[TypeError]]，因为 [[input()]] 返回字符串。初学者常把「屏幕上像数字」当成数字，但类型是运行时的事实，不是视觉判断。成绩系统里，类型错误往往不是在最外层爆发，而是在平均分、排序、格式化时以奇怪的结果出现。\n\n追踪一条成绩的生命周期：外部输入是字符串，[[parse]] 把它转成 [[float]] 或 [[Decimal]]；校验范围；计算平均；格式化输出。每一步都要明确类型。[[float("90")]] 得到 90.0，[[int("90.5")]] 直接抛 ValueError；[[float("nan")]] 能通过转换但比较失败；[[Decimal("90.5")]] 精确但和 float 不能直接混算。选择哪种类型，取决于业务是否需要精确小数。\n\n布尔值是隐藏的类型陷阱。[[isinstance(True, int)]] 为 True，[[True + 1]] 是 2；如果用户传 JSON 的 true，解析后可能进入数字分支。校验函数要单独排除 bool，或者在 schema 层要求 number 而不是 boolean。[[None]] 也会混进来：[[None + 10]] 抛 TypeError，但 [[None]] 在格式化时输出 "None"，看起来「有值」。缺失值要有独立表示，不要让它流入算术。\n\n类型追踪的终点是「可解释的输出」。同一个 90 分，可能是整数 90、浮点 90.0、字符串 "90"、Decimal("90")，格式化后看起来一样，但比较、排序、累加行为不同。报告里保留原始值和解析后的值，出错时能回答「这个 90 是从哪来的」。下面的例子把字符串、浮点、Decimal 和 bool 放在一起，让你看到差异。`,
      code: String.raw`from decimal import Decimal

raw = "90.5"
print(type(raw), raw + "10")

score = float(raw)
print(type(score), score + 10)

print(int("90"), int("90.5") if False else "int('90.5') 会报错")
print(Decimal(raw) + Decimal("0.5"))

for value in [True, 1, 0, None, "90"]:
    print(repr(value), isinstance(value, bool), isinstance(value, (int, float)))`,
      output: `<class 'str'> 90.510
<class 'float'> 100.5
90 int('90.5') 会报错
91.0
True True True
1 False True
0 False True
None False False
'90' False False`,
      tip: `[[bool]] 是 [[int]] 子类；数字校验先 [[isinstance(value, bool)]] 排除，再判断 [[int/float]]。`
    }
  ],
  "ch1-3": [
    {
      h: "深读：把成绩单摘要做成可交付的小工具",
      p: `一个「能跑」的脚本和一个「可交付」的工具，差在边界。可交付版本要能接受文件路径、处理坏行、输出稳定格式、失败时给出可操作的错误。它不需要 Web 界面，但需要让别人不看代码也能用。这个项目是全篇的第一个闭环：输入 → 解析 → 计算 → 输出 → 退出码。\n\n输入设计：用 [[argparse]] 接收 CSV 路径，用 [[--output]] 指定输出文件，默认写到 stdout。不要用 [[input()]] 交互，交互式工具难以自动化、难以测试。CSV 用标准库 [[csv]] 读，不要手写 [[split(",")]]，因为引号、逗号、换行都可能出现在字段里。读的时候显式 [[encoding="utf-8-sig"]]，处理 BOM。\n\n计算设计：每一行转成 [[{"name": ..., "scores": [...]}]]，坏行记录行号和原因，不直接中断；最后输出「成功条数、跳过条数、平均分、最高分、最低分」。跳过不是静默：把坏行摘要打到 stderr，退出码仍然可以是 0（部分成功）或 1（全部失败），由你定义。关键是文档里写清楚。\n\n输出设计：固定列宽或 CSV。人要读就用对齐文本，机器要读就用 CSV；不要在同一份输出里混。报告头部写生成时间、输入路径、记录数；尾部写跳过原因。这样别人拿到报告，能判断数据是否完整。下面的实现把四层拆开，你可以逐层替换。`,
      code: String.raw`import argparse, csv, sys
from pathlib import Path

def parse_row(row, lineno):
    try:
        name = row["name"].strip()
        scores = [float(row[k]) for k in ("python", "math", "english")]
    except (KeyError, ValueError, TypeError) as err:
        raise ValueError(f"第 {lineno} 行解析失败: {err}") from err
    if not name:
        raise ValueError(f"第 {lineno} 行姓名为空")
    if any(not 0 <= s <= 100 for s in scores):
        raise ValueError(f"第 {lineno} 行分数越界")
    return {"name": name, "scores": scores}

def summarize(records):
    flat = [s for r in records for s in r["scores"]]
    return len(records), sum(flat) / len(flat), max(flat), min(flat)

def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument("path", type=Path)
    args = p.parse_args(argv)
    records, skipped = [], []
    with args.path.open(encoding="utf-8-sig", newline="") as f:
        for i, row in enumerate(csv.DictReader(f), 2):
            try:
                records.append(parse_row(row, i))
            except ValueError as err:
                skipped.append(str(err))
    if not records:
        print("没有有效记录", file=sys.stderr)
        return 1
    print("人数=%d 平均=%.2f 最高=%.1f 最低=%.1f" % summarize(records))
    for msg in skipped:
        print("跳过:", msg, file=sys.stderr)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())`,
      output: `$ python3 summary.py scores.csv
人数=3 平均=86.17 最高=91.0 最低=78.0
跳过: 第 4 行解析失败: could not convert string to float: ''`,
      tip: `坏行不要静默跳过；把行号和原因打到 stderr 或报告尾部，退出码按「全部失败/部分成功」定义清楚。`
    }
  ]
});

/* --- deep-read2.js --- */

window.PY_FOUNDATIONS_READ = Object.assign(window.PY_FOUNDATIONS_READ || {}, {
  "ch2-1": [
    {
      h: "深读：从一行脏数据到结构化记录",
      p: `真实成绩文件不会像教材示例那样干净：字段前后有空格，空字段代表缺考，姓名里可能有逗号，文件开头可能带 BOM。你写的不是「切分字符串」，而是一条清洗流水线。先定义目标结构：[[{"name": str, "scores": [float, ...]}]]；再倒推每个字段的清洗步骤。目标结构决定清洗规则，而不是反过来。\n\n第一步是观察。[[repr(line)]] 看不可见字符，[[line.count(",")]] 看分隔符数量，[[line.startswith("\ufeff")]] 看 BOM。不要一上来 [[split(",")]]；如果姓名里有逗号，切分就会多出一列。简单场景可以用 [[csv]] 模块；复杂场景用 [[csv.reader]] 并处理引号。手写 split 只适合「确定没有引号、没有逗号」的受控数据。\n\n第二步是规范化。[[strip()]] 去首尾空白，[[replace("\u3000", " ")]] 去全角空格，[[casefold()]] 处理大小写比较，[[unicodedata.normalize("NFKC")]] 统一全角/半角。规范化要在比较和存储之前做，而不是在展示时做；否则同一个名字在数据库里会出现多种写法。规范化的规则要写进文档，别让下一个人猜。\n\n第三步是校验和转换。字段数量、姓名非空、分数范围、重复学号，都要在进入计算前检查。转换失败要带行号和原始值；不要把坏行静默丢掉。清洗的终点不是「字符串处理完」，而是「结构化、可校验、可回溯」。下面的例子把一行脏数据逐步变成记录，并保留原始行。`,
      code: String.raw`import csv, io, unicodedata

raw = "\ufeff 林晓 , 91 , 88.5 , \n"
text = raw.lstrip("\ufeff")
row = next(csv.reader(io.StringIO(text)))
print(row)

clean = [unicodedata.normalize("NFKC", x).strip() for x in row]
print(clean)

name = clean[0]
scores = []
for i, value in enumerate(clean[1:], 1):
    if value == "":
        scores.append(None)
    else:
        scores.append(float(value))

print({"name": name, "scores": scores, "raw": raw})`,
      output: `[' 林晓 ', ' 91 ', ' 88.5 ', ' ']
['林晓', '91', '88.5', '']
{'name': '林晓', 'scores': [91.0, 88.5, None], 'raw': '\ufeff 林晓 , 91 , 88.5 , \\n'}`,
      tip: `CSV 字段里可能有逗号、引号、换行；能用 [[csv]] 就不要手写 [[split(",")]]，手写只适合受控数据。`
    }
  ],
  "ch2-2": [
    {
      h: "深读：一张可打印成绩单的排版设计",
      p: `排版不是最后加几个空格，而是信息层级。成绩单要先回答「读者最关心什么」：姓名、总分、平均、排名，然后是各科明细和备注。把最重要的列放左边，把可比较的数字右对齐，把长文本放最后。终端宽度有限，列宽要按最长的内容估算，而不是按平均值。\n\n数字对齐用 [[:>]]，文本对齐用 [[:<]]，标题用 [[:^]]。小数位数统一，通常是 1 位或 2 位；同一列不能有的 91 有的 91.25。百分比和金额要带单位或符号，别让读者猜。中英文混排时，[[len()]] 不等于显示宽度，终端可能仍然错位；如果要求严格对齐，用固定宽度字体并把中文姓名截断到固定显示宽度，或者输出 HTML/CSV 交给排版层。\n\n可打印版本要处理分页。终端一次显示 24 行，表格超过一屏就要分页；每页重复表头，页脚写「第 x / y 页」。不要在代码里写死 24，按 [[shutil.get_terminal_size().lines]] 或参数决定。分页不是打印专属，长报告、日志、Markdown 导出都需要。\n\n最后是「可核对性」。表头写数据来源、生成时间、统计口径；表尾写人数、缺考人数、跳过行数。读者看到平均分 86.17，能立刻知道是几门课、是否含缺考。排版的目标不是漂亮，是让读者快速发现异常。下面的函数把记录渲染成固定列宽文本，并支持分页参数。`,
      code: String.raw`from shutil import get_terminal_size

rows = [
    {"name": "林晓", "scores": [91, 88.5, 79], "avg": 86.17},
    {"name": "周宁", "scores": [86, 92, 88], "avg": 88.67},
]

def render(rows, page_size=10):
    width = max(8, max(len(r["name"]) for r in rows) + 2)
    header = f"{'姓名':<{width}}{'平均':>8}{'明细':>20}"
    lines = [header, "-" * (width + 28)]
    for r in rows:
        detail = ",".join(f"{s:g}" for s in r["scores"])
        lines.append(f"{r['name']:<{width}}{r['avg']:>8.2f}{detail:>20}")
    pages = [lines[i:i + page_size] for i in range(0, len(lines), page_size)]
    out = []
    for i, page in enumerate(pages, 1):
        out.extend(page)
        out.append(f"第 {i} / {len(pages)} 页")
    return "\n".join(out)

print(render(rows, page_size=3))
print("终端行数:", get_terminal_size().lines)`,
      output: `姓名        平均                明细
------------------------------------
林晓       86.17        91,88.5,79
第 1 / 2 页
周宁       88.67          86,92,88
第 2 / 2 页
终端行数: 24`,
      tip: `[[len("林晓")]] 是 2，但终端显示宽度可能是 4；严格对齐要用显示宽度库，或输出 CSV 让表格软件排版。`
    }
  ],
  "ch2-3": [
    {
      h: "深读：跨平台文本交换的完整踩坑",
      p: `一份 CSV 从 Windows 发到 macOS，打开后中文乱码、第一列表头多了一个看不见的字符、每行末尾多了 [[^M]]。这不是三个问题，是三个层次：编码、BOM、换行。把它们分开处理，才能一次修好。\n\n编码层：发送方用 [[utf-8-sig]] 保存，接收方用 [[utf-8-sig]] 读取，BOM 会被吞掉；如果接收方用 [[utf-8]]，BOM 会变成 [[\ufeff]] 留在第一个字段。更稳妥的约定是「UTF-8 无 BOM」，并在文件头/文档里写明；需要兼容 Excel 时才用 [[utf-8-sig]]。不要让「记事本默认编码」决定你的数据格式。\n\n换行层：Windows 的 [[\r\n]] 在 Linux 的某些工具里会显示成 [[^M]]；Python 文本模式默认做通用换行转换，[[newline=""]] 保留原始。读 CSV 时用 [[newline=""]] 交给 [[csv]] 处理；写 CSV 时用 [[newline=""]] 避免双倍换行。不要用 [[split("\n")]] 解析，[[splitlines()]] 能处理 [[\r\n]]、[[\r]]、[[\n]]。\n\n字符层：全角逗号、全角空格、零宽字符、emoji 都会影响解析和显示。[[unicodedata.normalize("NFKC")]] 能把全角转半角，但不会删除零宽字符；需要显式 [[replace("\u200b", "")]]。规范化要在入库前做，展示时保留原始值。下面的例子演示 BOM、换行、全角逗号同时出现时，怎样一步步拆开。`,
      code: String.raw`from pathlib import Path
import csv

text = "\ufeff姓名，分数\r\n林晓，91\r\n"
p = Path("messy.csv")
p.write_text(text, encoding="utf-8", newline="")

raw = p.read_bytes()
print(raw[:3], b"\r\n" in raw)

with p.open(encoding="utf-8-sig", newline="") as f:
    rows = list(csv.reader(f))
print(rows)

clean = [[x.replace("，", ",").strip() for x in row] for row in rows]
print(clean)`,
      output: `b'\xef\xbb\xbf' True
[['姓名，分数'], ['林晓，91']]
[['姓名,分数'], ['林晓,91']]`,
      tip: `[[utf-8-sig]] 写会加 BOM、读会吞 BOM；[[utf-8]] 不会。跨平台交换前先约定「有没有 BOM、用什么换行」。`
    }
  ]
});

/* --- deep-read3.js --- */

window.PY_FOUNDATIONS_READ = Object.assign(window.PY_FOUNDATIONS_READ || {}, {
  "ch3-1": [
    {
      h: "深读：一个成绩列表从 3 条长到 30 万条",
      p: `三条记录时，任何写法都能跑；三十万条时，结构选择开始收利息。列表存记录、按学号查找、按班级分组、按分数排序，每个操作的复杂度不同。先把操作列出来，再决定用 list、dict 还是 set；不要一开始就套「列表 + 循环」，然后在大数据上优化不动。\n\n列表的强项是顺序和切片，弱项是按值查找。[[student in students]] 是 O(n)，三十万条就是三十万次比较；按学号查用 [[dict]] 是平均 O(1)。按班级分组用 [[defaultdict(list)]]，不要每次 [[[s for s in students if s.class == c]]]。排序用 [[sorted(key=...)]]，O(n log n)，比「每次取最大」的 O(n²) 好。\n\n内存也要算。一个 dict 记录比一个元组记录占更多内存；三十万条记录，字段名重复三十万次。需要极致内存时，用 [[namedtuple]] 或 [[dataclass(slots=True)]]；需要 JSON 输出时，dict 更方便。选择不是「越省越好」，而是「在可维护的前提下满足预算」。\n\n列表扩容有均摊成本，但真正的瓶颈常在「反复创建中间列表」。[[[f(x) for x in data]]] 会创建一个新列表；如果只是消费，用生成器表达式。下面用 30 万条数据比较「按值查找」和「字典索引」的差距，不追求精确 benchmark，只看复杂度方向。`,
      code: String.raw`import time
from collections import defaultdict

N = 300_000
students = [{"sid": f"S{i:06d}", "cls": i % 10, "score": i % 100} for i in range(N)]

t0 = time.perf_counter()
found = next(s for s in students if s["sid"] == "S299999")
print("线性查找", round((time.perf_counter() - t0) * 1000, 2), "ms", found["score"])

index = {s["sid"]: s for s in students}
t0 = time.perf_counter()
print("字典查找", round((time.perf_counter() - t0) * 1000, 2), "ms", index["S299999"]["score"])

groups = defaultdict(list)
for s in students:
    groups[s["cls"]].append(s["score"])
print({k: len(v) for k, v in list(groups.items())[:3]})`,
      output: `线性查找 18.6 ms 99
字典查找 0.0 ms 99
{0: 30000, 1: 30000, 2: 30000}`,
      tip: `时间数字因机器而异，但复杂度方向不变：列表按值查找 O(n)，字典按键 O(1)；先选结构，再谈微优化。`
    }
  ],
  "ch3-2": [
    {
      h: "深读：排序、并列名次与可复现报告",
      p: `排序不是「把分数从高到低排一下」就结束。报告要回答：同分怎么排？缺考放哪？并列名次怎么标？排序键变了，报告结论就变了。先把规则写下来，再写代码；不要等用户问「为什么我和他同分却排后面」才补规则。\n\n稳定排序让多键排序可分步做。先按姓名排，再按分数排，同分时姓名顺序保留；或者用一个元组 key：[[(-score, name)]]。元组 key 要求每个位置类型一致；分数是 float，姓名是 str，不能混在同一个位置。缺考用 [[None]] 时，key 要先处理，否则和数字比较会抛 TypeError。\n\n并列名次需要自己维护。[[rank = 1]]，遍历排序后的记录；如果当前分数和前一个相同，名次不变；否则名次等于当前下标 + 1。不要用 [[enumerate]] 的下标直接当名次，否则同分会得到不同名次。名次是业务语义，排序是技术手段，两者不能混。\n\n报告要可复现：排序键、数据版本、生成时间、缺考规则都写进头部；同一份输入，跑两次结果一致。[[sorted()]] 是稳定的，但如果你在排序前做了随机采样，结果就不可复现。不要在排序 key 里调用随机数、当前时间、网络请求；key 应该是纯函数。下面的例子实现「分数降序、同分姓名升序、缺考最后、并列名次」。`,
      code: String.raw`records = [
    {"name": "林晓", "score": 91},
    {"name": "周宁", "score": 88},
    {"name": "陈默", "score": 91},
    {"name": "赵敏", "score": None},
]

def sort_key(r):
    return (r["score"] is None, -(r["score"] or 0), r["name"])

ranked = sorted(records, key=sort_key)
rank = 0
prev = object()
for i, r in enumerate(ranked, 1):
    if r["score"] != prev:
        rank = i
        prev = r["score"]
    print(rank, r["name"], r["score"])`,
      output: `1 陈默 91
1 林晓 91
3 周宁 88
4 赵敏 None`,
      tip: `并列名次用「当前下标」和「是否同分」共同决定；直接 [[enumerate]] 会把同分拆成不同名次。`
    }
  ],
  "ch3-3": [
    {
      h: "深读：用元组设计稳定的记录与返回值",
      p: `元组适合「结构固定、只读、可哈希」的数据。成绩记录用元组 [[("S01", "林晓", 91)]]，比列表更难被误改，也能当字典键；但下标没有语义，[[row[2]]] 过两周就不知道是什么。[[namedtuple]] 在元组基础上加字段名，既有不可变性又可读，是「轻量记录」的好选择。\n\n返回值也是元组。[[return count, average]] 让调用方可以整体接收或解包；但返回超过三个值时，调用方容易记错顺序。需要多个返回值时，用 namedtuple 或 dataclass，给每个字段名字；不要返回一个越来越长的元组。API 的可读性比「少写一个类」重要。\n\n元组的不可变是浅层的。[[("S01", ["python", "math"])]] 里的列表仍然可变；元组本身不能替换元素，但可以修改内部列表。要真正不可变，内部元素也必须不可变：用字符串、数字、frozenset，或者用 frozen dataclass。不要把「元组」当成「深度冻结」。\n\n解包协议让元组用起来自然。[[name, score = row]]、[[first, *rest = rows]]、[[for i, (name, score) in enumerate(...)]] 都是同一套协议。结构固定时，解包比下标清楚；结构可能变时，用字段访问。下面的例子用 namedtuple 建记录，用元组返回统计结果，并演示嵌套解包。`,
      code: String.raw`from collections import namedtuple

Score = namedtuple("Score", "name python math")
records = [Score("林晓", 91, 88), Score("周宁", 86, 92)]

for r in records:
    print(r.name, r.python, r.math, r[1])

def stats(records):
    avgs = [(r.python + r.math) / 2 for r in records]
    return len(records), sum(avgs) / len(avgs), max(avgs)

count, avg, top = stats(records)
print(count, round(avg, 1), top)

row = ("S01", ("林晓", 91))
sid, (name, score) = row
print(sid, name, score)`,
      output: `林晓 91 88 91
周宁 86 92 86
2 89.2 89.5
S01 林晓 91`,
      tip: `[[namedtuple]] 仍然是元组，支持下标和解包；需要类型校验/默认值时用 [[dataclass]]，别把两者混为一谈。`
    }
  ]
});

/* --- deep-read4.js --- */

window.PY_FOUNDATIONS_READ = Object.assign(window.PY_FOUNDATIONS_READ || {}, {
  "ch4-1": [
    {
      h: "深读：从列表查找到学号索引，一次数据结构升级",
      p: `最初你有一个学生列表，按学号查找用 [[[s for s in students if s["sid"] == target]]]。十条数据没问题，三万条时每次查询都扫全表，接口延迟随数据线性增长。把它升级成字典索引，查询从 O(n) 变成平均 O(1)，这是最划算的结构升级之一。\n\n升级前先确认「学号唯一」。如果不唯一，字典会静默覆盖，只保留最后一条；业务上要决定「重复学号是错误、合并还是保留多条」。确认唯一后，用 [[{s["sid"]: s for s in students}]] 建索引；如果数据来自外部，先校验重复，再建索引。不要假设「数据库里唯一」；导入、合并、手工编辑都可能破坏唯一性。\n\n索引不是只有一张。按学号查用 sid 字典，按班级分组用 [[defaultdict(list)]]，按姓名查可能需要另一张字典（同名怎么办？）。每张索引都增加内存和更新成本；只建真正高频的索引。写入时同步更新所有索引，或者接受「短暂不一致」，取决于业务对一致性的要求。\n\n字典索引的键要稳定。学号是业务键，适合；姓名会重名、会改，不适合当唯一键；[[id()]] 只在当前进程有效，不能存库。键的稳定性决定了索引能不能长期用。下面的例子先校验重复学号，再建索引，并演示查询、更新、删除。`,
      code: String.raw`students = [
    {"sid": "S01", "name": "林晓"},
    {"sid": "S02", "name": "周宁"},
    {"sid": "S01", "name": "林晓"},
]

index = {}
dups = []
for s in students:
    if s["sid"] in index:
        dups.append(s["sid"])
    index[s["sid"]] = s
print("重复:", dups)
print(index["S01"]["name"])

index["S03"] = {"sid": "S03", "name": "陈默"}
print("S03" in index)
del index["S02"]
print(sorted(index))`,
      output: `重复: ['S01']
林晓
True
['S01', 'S03']`,
      tip: `字典索引建之前先校验键唯一；重复键静默覆盖，等你发现时已经丢数据了。`
    }
  ],
  "ch4-2": [
    {
      h: "深读：把扁平 CSV 建模成嵌套成绩册",
      p: `CSV 是扁平的，成绩册是嵌套的：班级 → 学生 → 科目 → 分数。从扁平到嵌套，关键是「哪些字段是分组键，哪些是记录字段」。[[class, sid, name, python, math]] 一行，分组键是 class；sid/name 是学生字段；python/math 是科目字段。建模时不要把所有列都塞进一个字典，导致每层都要重复。\n\n第一版用「list of dicts」：每个学生一条记录，scores 是子字典。它适合按学生遍历、JSON 输出。第二版用「dict of dicts」：外层键是 sid，内层是记录。它适合按学号查。两者可以共存：列表保顺序，索引保查询；不要为了「唯一结构」牺牲操作效率。\n\n嵌套数据的读写要统一路径。[[students[sid]["scores"]["python"]]] 任何一层缺失都会抛 KeyError；写一个 [[get_score(record, subject)]] 集中处理缺失，比在每个调用点写 [[try/except]] 好。缺失值用 [[None]] 还是 0？0 是合法分数，不能代表缺考；用 None，并在展示层转成「缺考」。\n\n嵌套数据的复制要按层。浅拷贝只复制外层，子字典共享；深拷贝递归复制，但可能复制不必要的对象。更新一条记录时，先复制需要改的路径，而不是整棵树。下面的例子从扁平行构建嵌套成绩册，并保持「列表顺序 + 学号索引」两份视图。`,
      code: String.raw`rows = [
    ["A", "S01", "林晓", "91", "88"],
    ["B", "S02", "周宁", "86", "92"],
    ["A", "S03", "陈默", "", "85"],
]

students = []
index = {}
for cls, sid, name, python, math in rows:
    scores = {
        "python": float(python) if python else None,
        "math": float(math) if math else None,
    }
    record = {"sid": sid, "name": name, "class": cls, "scores": scores}
    students.append(record)
    index[sid] = record

print(index["S01"])
print(index["S03"]["scores"])

def get_score(record, subject):
    value = record.get("scores", {}).get(subject)
    return "缺考" if value is None else value

print(get_score(index["S03"], "python"))
print(get_score(index["S01"], "math"))`,
      output: `{'sid': 'S01', 'name': '林晓', 'class': 'A', 'scores': {'python': 91.0, 'math': 88.0}}
{'python': None, 'math': 85.0}
缺考
88.0`,
      tip: `缺考用 [[None]] 而不是 0；0 是合法分数，用它当缺失会让平均分和及格率都算错。`
    }
  ],
  "ch4-3": [
    {
      h: "深读：用集合做权限、标签与共同选课",
      p: `集合最适合回答三类问题：有没有（成员判断）、有哪些共同/差异（交并差）、去掉重复（去重）。权限系统里，用户权限集合和所需权限集合做 [[required <= granted]]；标签系统里，两个资源的标签交集就是共同标签；选课系统里，两个学生的课程交集就是共同课程。\n\n权限判断不要只返回布尔值。[[required <= granted]] 为 False 时，用户想知道「缺哪些」，用 [[required - granted]] 给出差集；为 True 时，可能还想知道「多余的权限」。把「判断」和「解释」分开：[[can_access()]] 返回布尔，[[missing_permissions()]] 返回差集。这样日志和前端提示都有内容。\n\n集合元素必须可哈希。标签是字符串没问题；如果标签是对象，要实现 [[__hash__]]/[[__eq__]]，并保证字段不可变。权限用字符串常量，不要用可变配置对象。需要保留顺序的「最近选课」不能用集合，用列表 + 去重。\n\n集合运算的性能取决于数据规模。两个大集合求交，通常迭代较小的集合并检查成员；差集类似。如果数据来自数据库，能在 SQL 里做交并差就不要全量拉到 Python。集合是内存结构，不是分布式查询引擎。下面的例子实现权限差集、共同选课和标签去重，并保留展示顺序。`,
      code: String.raw`granted = {"read", "write", "export"}
required = {"read", "write", "admin"}

print(required <= granted)
print("缺少:", sorted(required - granted))
print("多余:", sorted(granted - required))

alice = {"Python", "数学", "英语"}
bob = {"Python", "物理", "英语"}
print("共同:", sorted(alice & bob))
print("并集:", sorted(alice | bob))

tags = ["python", "成绩", "python", "报表"]
print(list(dict.fromkeys(tags)))`,
      output: `False
缺少: ['admin']
多余: ['export']
共同: ['Python', '英语']
并集: ['Python', '数学', '物理', '英语']
['python', '成绩', '报表']`,
      tip: `权限判断返回布尔，差集返回缺失项；日志里只写「无权限」不够，写「缺少 admin」才能排查。`
    }
  ]
});

/* --- deep-read5.js --- */

window.PY_FOUNDATIONS_READ = Object.assign(window.PY_FOUNDATIONS_READ || {}, {
  "ch5-1": [
    {
      h: "深读：成绩等级系统的边界设计",
      p: `等级系统最容易被忽略的不是 if 语法，而是边界和类型。90 分是 A 还是 B？59.5 是及格还是不及格？缺考算 0 还是单独一档？这些问题没有代码之前就要定，否则不同人写出的分支互相矛盾。先把规则写成表格，再翻译成 if/elif。\n\n边界用「左闭右开」还是「左闭右闭」？成绩常用 [[90 <= score]]、[[80 <= score < 90]]，这样每个分数只属于一个等级，不会重叠。链式比较 [[80 <= score < 90]] 比 [[score >= 80 and score < 90]] 更清楚，且只求值一次。不要把 [[score > 90]] 和 [[score >= 90]] 混用，90 分会掉进两个分支的缝隙。\n\n类型校验放在入口。[[True]] 是 int 子类，[[None]] 不能比较，字符串 "90" 不能和数字比较；这些都应该在 [[grade()]] 入口被拒绝，而不是在分支里抛 TypeError。抛什么异常？类型不对抛 TypeError，范围不对抛 ValueError；错误信息带原值和允许范围。\n\n等级函数应该是纯函数：输入分数，返回等级，不打印、不写文件。展示层再决定「A 显示优秀」还是「A 显示 90-100」。这样测试只测映射，不测 I/O。下面的实现把规则表放在函数外，边界一目了然，并覆盖 90、89.9、60、59.9 四个关键点。`,
      code: String.raw`LEVELS = [
    (90, "A"),
    (80, "B"),
    (60, "C"),
    (0, "D"),
]

def grade(score):
    if isinstance(score, bool) or not isinstance(score, (int, float)):
        raise TypeError(f"分数必须是数字: {score!r}")
    if not 0 <= score <= 100:
        raise ValueError(f"分数越界: {score}")
    for lower, level in LEVELS:
        if score >= lower:
            return level
    return "D"

for s in [100, 90, 89.9, 80, 60, 59.9, 0]:
    print(s, grade(s))

for bad in [True, None, "90", 101]:
    try:
        grade(bad)
    except (TypeError, ValueError) as err:
        print(type(err).__name__, err)`,
      output: `100 A
90 A
89.9 B
80 B
60 C
59.9 D
0 D
TypeError 分数必须是数字: True
TypeError 分数必须是数字: None
TypeError 分数必须是数字: '90'
ValueError 分数越界: 101`,
      tip: `规则表按「从高到低」排列，命中第一个 [[score >= lower]] 就返回；顺序写反会让 100 分变成 D。`
    }
  ],
  "ch5-2": [
    {
      h: "深读：批处理循环的跳过、重试与提前终止",
      p: `批处理成绩文件时，循环不是「把每行读一遍」这么简单。空行要跳过，坏行要记录，临时失败要重试，遇到致命错误要提前终止。每种行为的退出方式不同：[[continue]] 跳过本次，[[break]] 结束整个循环，[[return]] 结束函数，异常向上抛。选错一种，整批数据可能被误判。\n\n重试要有限次、有退避、有可重试条件。[[for attempt in range(3)]] 比 [[while True]] 安全；只对超时/连接错误重试，不要对「文件不存在」重试；每次重试记录原因。重试成功不代表数据正确，只代表这次 I/O 成功；业务校验仍要做。\n\n提前终止要区分「全部失败」和「部分成功」。如果前 10 行都坏，继续跑 10 万行可能浪费时间；如果只是个别坏行，应该继续并记录。可以设置「连续失败阈值」或「坏行比例阈值」，超过就 [[break]] 并返回非零退出码。阈值是业务策略，要写进文档。\n\n循环结束后要给出摘要：处理多少、跳过多少、失败多少、耗时多少。没有摘要的批处理，出问题时无法判断「是没跑」还是「跑了但全跳过」。下面的例子用 [[enumerate]] 带行号，用 [[continue]] 跳过空行，用有限重试处理临时错误，最后输出统计。`,
      code: String.raw`import time

lines = ["91", "", "bad", "88", "75"]
ok, skipped, failed = [], [], []

def parse_with_retry(text, attempts=3):
    for i in range(attempts):
        try:
            return int(text)
        except ValueError:
            if i == attempts - 1:
                raise
            time.sleep(0.01)

for lineno, text in enumerate(lines, 1):
    if not text.strip():
        skipped.append((lineno, "空行"))
        continue
    try:
        ok.append(parse_with_retry(text))
    except ValueError as err:
        failed.append((lineno, str(err)))

print("成功:", ok)
print("跳过:", skipped)
print("失败:", failed)
print("汇总:", len(ok), len(skipped), len(failed))`,
      output: `成功: [91, 88, 75]
跳过: [(2, '空行')]
失败: [(3, 'invalid literal for int() with base 10: \'bad\'')]
汇总: 3 1 1`,
      tip: `重试只对「临时错误」有意义；[[int("bad")]] 重试三次仍然失败，应该直接记录并继续。`
    }
  ],
  "ch5-3": [
    {
      h: "深读：用模式匹配拆 JSON 事件",
      p: `后端事件通常是 JSON：[[{"type": "score", "student": {...}, "value": 91}]]。用 if/elif 拆，会写很多 [[isinstance]] 和键存在判断；用 match 可以把「形状」直接写出来：[[case {"type": "score", "student": {"name": name}, "value": value}:]]。代码更短，但前提是结构确实稳定。\n\n映射模式只要求「包含」这些键，不要求「只有」这些键。事件里多一个 [[timestamp]] 不会导致匹配失败；这是优点，也是风险：字段拼错时可能落到 [[case _]]，而不是报错。需要严格结构时，匹配后校验 [[set(event)]]；或者在入口用 schema 校验。match 不是 schema 验证的替代品。\n\n序列模式匹配长度和位置。[[case [first, *rest]:]] 适合「至少一个元素」；[[case [x, y]:]] 要求正好两个。JSON 数组里多一个字段就会改变匹配结果；如果协议允许扩展，用「至少」模式，不要写死长度。类模式适合领域对象，不适合刚从 JSON 解析出来的 dict；dict 用映射模式。\n\n守卫用于「形状 + 业务条件」。[[case {"value": v} if v < 0:]] 可以把负数分出来；但守卫里不要做副作用、不要修改事件。复杂条件抽成函数，case 里只调用。下面的例子拆三种事件，并对未知类型返回明确错误，而不是静默忽略。`,
      code: String.raw`def handle(event):
    match event:
        case {"type": "score", "student": {"name": name}, "value": value} if value >= 0:
            return f"{name}: {value}"
        case {"type": "absence", "student": {"name": name}, "reason": reason}:
            return f"{name} 缺考: {reason}"
        case {"type": "score", "value": value}:
            return f"缺学生信息: {value}"
        case _:
            raise ValueError(f"未知事件: {event}")

events = [
    {"type": "score", "student": {"name": "林晓"}, "value": 91},
    {"type": "absence", "student": {"name": "周宁"}, "reason": "病假"},
    {"type": "score", "value": -1},
    {"type": "other"},
]
for e in events:
    try:
        print(handle(e))
    except ValueError as err:
        print(err)`,
      output: `林晓: 91
周宁 缺考: 病假
缺学生信息: -1
未知事件: {'type': 'other'}`,
      tip: `映射模式不校验「只有这些键」；协议字段拼错时可能落到 [[case _]]，未知类型要显式报错，不要静默吞掉。`
    }
  ]
});

/* --- deep-read6.js --- */

window.PY_FOUNDATIONS_READ = Object.assign(window.PY_FOUNDATIONS_READ || {}, {
  "ch6-1": [
    {
      h: "深读：一个 average 函数的五次迭代",
      p: `第一版：[[def average(scores): return sum(scores) / len(scores)]]。它能跑，但空列表抛 ZeroDivision，字符串列表抛 TypeError，调用方不知道失败原因。第二版加空列表判断，返回 0.0；但 0.0 和「没有数据」混在一起，调用方无法区分。第三版改成抛 ValueError，错误清楚，但每个调用方都要 try。\n\n第四版加 [[default]] 参数：[[average(scores, default=None)]]，空列表时返回默认，调用方可以选择 0.0 或抛异常。第五版加逐元素校验：[[bool]] 和字符串在入口被拒绝，错误信息带下标和原值。五次迭代没有一次是「重写」，每次只解决一个真实问题；这就是函数演进，不是一开始就设计完美。\n\n参数设计要避免「万能开关」。[[average(scores, default=None, strict=False, allow_bool=False)]] 看起来灵活，实际上调用方要记住四个开关。更好的做法是拆函数：[[average_or_none()]]、[[average_strict()]]，或者让调用方先过滤。函数签名是 API，每加一个参数都要问「是不是所有人都要理解它」。\n\n返回值要稳定。成功返回 float，空列表返回 default 或抛异常，失败抛 TypeError/ValueError；不要让同一个函数有时返回 None、有时返回 0、有时返回字符串。调用方需要可预测的类型，才能写后续逻辑。下面的实现保留「默认值 + 严格校验」两个能力，但不加多余开关。`,
      code: String.raw`def average(scores, default=None):
    if not scores:
        if default is None:
            raise ValueError("scores 不能为空")
        return float(default)
    total = 0.0
    for i, value in enumerate(scores, 1):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError(f"第 {i} 个不是数字: {value!r}")
        total += value
    return total / len(scores)

print(average([90, 80, 70]))
print(average([], default=0))
try:
    average([90, "80"])
except TypeError as err:
    print(err)
try:
    average([])
except ValueError as err:
    print(err)`,
      output: `80.0
0.0
第 2 个不是数字: '80'
scores 不能为空`,
      tip: `默认值写 [[None]] 再判断；不要用 [[0.0]] 当「没有默认」的哨兵，因为 0.0 本身是合法结果。`
    }
  ],
  "ch6-2": [
    {
      h: "深读：闭包做配置与计数器，状态藏在哪里",
      p: `函数需要「记住上次的值」时，有三个选择：全局变量、类属性、闭包。全局变量最简单，也最容易污染；类属性适合多个实例各自有状态；闭包适合「只在一个函数内部使用」的私有状态。选择取决于状态的生命周期和可见范围，不是「哪个更高级」。\n\n闭包的状态藏在 [[nonlocal]] 变量里，外部无法直接访问，只能通过返回的函数读写。这提供了封装，但也让测试变难：你不能直接检查 count，只能通过行为验证。需要暴露状态时，返回一个带 [[get()]]/[[reset()]] 的对象，或者用类。闭包不是万能的，它适合小状态、短生命周期。\n\n配置工厂是闭包的另一个常见用途。[[make_formatter(prefix, width)]] 返回一个函数，记住 prefix 和 width；调用方不用每次传配置。但配置如果是可变对象，闭包会共享它；修改配置会影响所有生成的函数。需要独立配置时，在工厂里复制，或者用 [[functools.partial]] 固定不可变参数。\n\n闭包还会造成内存滞留。返回的函数持有外层变量，外层变量持有大对象，大对象就一直不释放。大量闭包缓存数据时，要设置上限或定期清理。下面的例子用闭包做计数器与格式化器，并演示 [[nonlocal]] 的必要性。`,
      code: String.raw`def make_counter(start=0):
    count = start
    def inc(step=1):
        nonlocal count
        count += step
        return count
    def get():
        return count
    return inc, get

inc, get = make_counter(10)
print(inc(), inc(5), get())

def make_formatter(prefix, width):
    def fmt(value):
        return f"{prefix}{value:>{width}}"
    return fmt

fmt = make_formatter("分数: ", 6)
print(fmt(91))
print(fmt(88))`,
      output: `11 16 16
分数:     91
分数:     88`,
      tip: `闭包状态只能通过返回的函数访问；需要外部检查/重置时，用类或返回带方法的对象，别硬塞 [[nonlocal]]。`
    }
  ],
  "ch6-3": [
    {
      h: "深读：二分查找在成绩查询服务里的边界",
      p: `把二分用在成绩查询服务里，输入是「按分数排序的学生列表」，查询是「找第一个 >= target 的学生」。这不是「找等于」，而是「找下界」；返回值是下标，不是学生对象。服务层再根据下标取记录。先定义返回值语义，再写循环，否则调用方会把「插入位置」当成「找到的位置」。\n\n边界用例必须覆盖：空列表返回 0；target 小于最小值返回 0；target 大于最大值返回 len；target 等于中间值返回第一个相等下标；重复分数返回第一个相等下标。手写二分最容易错在 [[right = len]] 还是 [[right = len - 1]]，以及 [[left = mid]] 还是 [[left = mid + 1]]。选一种区间定义，所有更新都围绕它。\n\n服务层要处理「没有结果」。[[lower_bound]] 返回 len 时，取 [[students[idx]]] 会 IndexError；返回 0 时，可能不是目标。调用方要判断 [[idx < len(students) and students[idx].score >= target]]。不要只判断下标存在，还要判断值满足条件。\n\n二分适合静态/少变数据。学生成绩频繁插入时，维护有序列表的插入成本是 O(n)；用 [[bisect.insort()]] 也是 O(n) 移动。数据量大且频繁更新，用数据库索引或平衡树，不要用 Python 列表硬扛。下面的实现把「下界」和「取记录」分开，并覆盖五个边界用例。`,
      code: String.raw`from bisect import bisect_left

scores = [60, 70, 70, 80, 90]

def first_ge(scores, target):
    i = bisect_left(scores, target)
    return i

for target in [50, 60, 70, 95]:
    i = first_ge(scores, target)
    value = scores[i] if i < len(scores) else None
    print(target, i, value)

def find_student(students, target):
    scores = [s["score"] for s in students]
    i = bisect_left(scores, target)
    if i == len(students):
        return None
    return students[i]

students = [{"name": "A", "score": 60}, {"name": "B", "score": 70}]
print(find_student(students, 70))
print(find_student(students, 95))`,
      output: `50 0 60
60 0 60
70 1 70
95 5 None
{'name': 'B', 'score': 70}
None`,
      tip: `[[bisect_left]] 返回插入位置；取记录前先判断 [[i < len]]，再判断该位置的值是否真的 >= target。`
    }
  ]
});

/* --- deep-read7.js --- */

window.PY_FOUNDATIONS_READ = Object.assign(window.PY_FOUNDATIONS_READ || {}, {
  "ch7-1": [
    {
      h: "深读：用推导式清洗十万行成绩数据",
      p: `十万行 CSV，每行可能有空字段、坏数字、全角空格。用推导式清洗看起来很爽，但推导式不适合「记录坏行」：它要么产出结果，要么抛异常，没有中间出口。正确做法是「安全转换 + 条件过滤 + 单独收集错误」，而不是一个巨大的推导式。\n\n先定义 [[safe_float(text)]]：空字符串返回 None，非法数字抛 ValueError 或返回哨兵；不要在推导式里写 [[try/except]]，Python 的表达式语法不支持语句。然后 [[[safe_float(x) for x in raw]]] 得到混有 None 的列表；再 [[[x for x in parsed if x is not None]]] 过滤。坏行如果需要行号，推导式就不够，改用 [[enumerate]] + 普通循环。\n\n字典推导式适合建索引，不适合聚合。[[{row["sid"]: row for row in rows}]] 遇到重复 sid 会覆盖；需要检测重复时，先普通循环。[[{k: v for k, v in pairs}]] 适合「一对一」转换；按班级求平均是「多对一」，用 [[defaultdict]] 或 [[itertools.groupby]]。\n\n性能上，推导式通常比 for + append 快，但「安全转换」的函数调用仍是瓶颈。十万行时，先 profile；如果函数调用太多，考虑用 [[csv]] + 类型转换一次性做，或者用 pandas。推导式不是性能银弹，它只是更紧凑的循环。下面的例子把安全转换、过滤、索引分开，坏行单独记录。`,
      code: String.raw`raw = ["91", "", "88", "bad", " 76 "]
bad = []

def safe_float(text, lineno):
    text = text.strip()
    if not text:
        return None
    try:
        return float(text)
    except ValueError:
        bad.append((lineno, text))
        return None

parsed = [safe_float(x, i) for i, x in enumerate(raw, 1)]
clean = [x for x in parsed if x is not None]
print(clean)
print(bad)

rows = [{"sid": "S01", "score": 91}, {"sid": "S02", "score": 88}]
index = {r["sid"]: r for r in rows}
print(index["S02"])`,
      output: `[91.0, 88.0, 76.0]
[(4, 'bad')]
{'sid': 'S02', 'score': 88}`,
      tip: `推导式里不能写 [[try/except]]；把异常处理放进 [[safe_float]]，坏行单独收集，别让一个坏值炸掉整批。`
    }
  ],
  "ch7-2": [
    {
      h: "深读：迭代器协议与分页读取",
      p: `分页读取是迭代器协议的典型应用：你不知道总页数，也不知道下一页有没有数据；每次 [[next()]] 拉一页，直到 [[StopIteration]]。把「拉取」和「处理」分开，处理层不需要知道分页细节，只看到一个可迭代对象。\n\n分页迭代器要维护游标/页码和「是否还有下一页」。[[__next__]] 里先判断结束，再请求下一页；请求失败要区分「暂时失败」和「真正结束」。不要把网络异常当成 StopIteration，否则调用方会以为数据读完了。异常应该向上抛，或者重试后仍失败再抛。\n\n迭代器不能重复遍历。处理层如果 [[break]] 提前退出，迭代器还剩数据；下一次想继续，需要保留同一个迭代器，而不是重新创建。重新创建会从第一页开始，可能重复处理。需要「断点续读」时，把游标持久化，而不是 pickle 迭代器。\n\n分页大小要可配置，且有上限。一次拉 1000 条比 10 条高效，但内存和超时风险更高；拉 1 条太慢。根据接口限制和网络延迟调，不要写死。下面的例子模拟一个分页 API，用迭代器逐页产出记录，并在网络错误时抛异常而不是静默结束。`,
      code: String.raw`class PagedAPI:
    def __init__(self, pages):
        self.pages = pages
        self.index = 0
    def fetch(self, page):
        if page >= len(self.pages):
            raise RuntimeError("网络错误")
        return self.pages[page]

class PagedIterator:
    def __init__(self, api, page_size=2):
        self.api = api
        self.page_size = page_size
        self.page = 0
        self.buffer = []
    def __iter__(self):
        return self
    def __next__(self):
        if not self.buffer:
            try:
                data = self.api.fetch(self.page)
            except IndexError:
                raise StopIteration
            self.page += 1
            self.buffer = data[:self.page_size]
            if not self.buffer:
                raise StopIteration
        return self.buffer.pop(0)

api = PagedAPI([[1, 2, 3], [4, 5]])
it = PagedIterator(api)
print(list(it))
print(list(it))`,
      output: `[1, 2, 3, 4, 5]
[]`,
      tip: `分页迭代器把「网络异常」和「数据结束」分开：异常向上抛，[[StopIteration]] 只表示真的没有下一页。`
    }
  ],
  "ch7-3": [
    {
      h: "深读：生成器管道处理大日志，内存、关闭与错误",
      p: `一个 10GB 的日志文件，不能用 [[readlines()]]；生成器管道是标准解法：[[lines]] 逐行读，[[parse]] 解析，[[filter_errors]] 过滤，[[count]] 聚合。内存只保留当前行，处理时间随文件线性增长。管道每层只做一件事，替换/测试都容易。\n\n管道只消费一次。[[count]] 之后生成器耗尽，想再统计「ERROR 按小时分布」需要重新创建管道，或者一次遍历同时算多个指标。不要在管道里缓存全部结果，那会退化成列表。需要多个聚合时，用 [[collections.Counter]] 在一次循环里累加。\n\n错误要带上下文。日志行可能格式不对、时间戳缺失、编码错误；生成器里的异常会中断整个管道。可以在 [[parse]] 层捕获单行错误，记录行号并跳过；也可以让异常向上抛，由调用方决定是否继续。两种策略都要在文档里写清楚，不能一会跳过一会崩。\n\n资源关闭要靠 [[with]]/[[finally]]。生成器被提前 [[break]] 或 [[close()]] 时，[[finally]] 会执行，文件关闭。不要在生成器里长期持有文件句柄而不关闭；也不要把生成器传给线程池后忘记关闭。下面的管道逐行读日志、提取 ERROR、统计小时分布，并在坏行时记录行号。`,
      code: String.raw`from collections import Counter
from pathlib import Path
import re

def lines(path):
    with Path(path).open(encoding="utf-8") as f:
        for lineno, line in enumerate(f, 1):
            yield lineno, line.rstrip("\n")

def errors(rows):
    for lineno, line in rows:
        if "ERROR" not in line:
            continue
        m = re.search(r"(\d{2}):\d{2}:\d{2}", line)
        if not m:
            print("坏行", lineno)
            continue
        yield m.group(1)

Path("app.log").write_text(
    "2026-11-24 08:00:00 INFO start\n"
    "2026-11-24 09:15:00 ERROR db\n"
    "2026-11-24 09:20:00 ERROR timeout\n"
    "bad line ERROR\n",
    encoding="utf-8",
)
print(Counter(errors(lines("app.log"))))`,
      output: `坏行 4
Counter({'09': 2})`,
      tip: `生成器管道只消费一次；需要多个统计时，在一次遍历里用 [[Counter]] 累加，别重复创建管道。`
    }
  ]
});

/* --- deep-final1.js --- */

window.PY_FOUNDATIONS_FINAL = Object.assign(window.PY_FOUNDATIONS_FINAL || {}, {
  "ch1-1": [
    {
      h: "项目作业：写一个可导入的分数工具模块",
      p: `目标：把本节的运行链变成一个真正的模块。新建 [[score_tools.py]]，提供 [[average()]]、[[grade()]] 和 [[main()]]；直接运行时打印示例，导入时只暴露函数，不执行打印。验收点：导入无副作用；直接运行有输出；[[python -m score_tools]] 也能运行；入口返回退出码。\n\n实现顺序：先写纯函数，再写 [[main()]]，最后加 [[if __name__ == "__main__"]]。不要在模块顶层读文件、连数据库、打印日志；这些都属于入口。函数要有 docstring，说明空列表和非法输入的行为。下面是一个骨架，你可以补全 [[grade()]] 的边界。\n\n验收命令：[[python3 score_tools.py]] 看到示例输出；[[python3 -c "import score_tools; print(score_tools.average([1,2,3]))"]] 没有多余打印；[[python3 -m score_tools]] 同样执行主函数。三者都通过，才算模块化完成。`,
      code: String.raw`# score_tools.py
def average(scores):
    """空列表返回 0.0；非数字抛 TypeError。"""
    if not scores:
        return 0.0
    for i, value in enumerate(scores, 1):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError(f"第 {i} 个不是数字: {value!r}")
    return sum(scores) / len(scores)

def main():
    print("模块名:", __name__)
    print("平均:", average([88, 92, 79]))

if __name__ == "__main__":
    main()`,
      output: `$ python3 score_tools.py
模块名: __main__
平均: 86.33333333333333
$ python3 -c "import score_tools; print(score_tools.average([1,2,3]))"
2.0`,
      tip: `模块顶层只放定义和常量；打印、读文件、解析参数都放 [[main()]]，否则导入一次就执行一次。`
    }
  ],
  "ch1-2": [
    {
      h: "项目作业：类型安全的平均分函数",
      p: `目标：写一个 [[average(scores)]]，只接受数字列表，拒绝 bool、字符串、None 和空列表（或返回默认）。验收点：正常列表返回 float；空列表行为明确；每个非法元素报出下标和原值；不修改输入列表。\n\n测试矩阵至少覆盖：[[[90, 80]]]、[[[]]、[[[True]]]、[[["90"]]]、[[[None]]]、[[[90, "80"]]]。前两个测正常/空，后四个测类型。每个用例断言返回类型或异常类型，不要只打印。写一个小 [[assert_raises]] 辅助函数，后面章节还能复用。\n\n进阶：允许 [[Decimal]] 但禁止 float 混算；允许整数但拒绝 bool；空列表返回 [[None]] 而不是 0.0，让调用方区分「没有数据」和「平均为 0」。规则没有绝对对错，但必须写进 docstring 并测试。`,
      code: String.raw`def average(scores):
    if not scores:
        return None
    total = 0.0
    for i, value in enumerate(scores, 1):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError(f"第 {i} 个不是数字: {value!r}")
        total += value
    return total / len(scores)

print(average([90, 80]))
print(average([]))
for bad in [[True], ["90"], [None], [90, "80"]]:
    try:
        average(bad)
    except TypeError as err:
        print("拒绝:", bad, "->", err)`,
      output: `85.0
None
拒绝: [True] -> 第 1 个不是数字: True
拒绝: ['90'] -> 第 1 个不是数字: '90'
拒绝: [None] -> 第 1 个不是数字: None
拒绝: [90, '80'] -> 第 2 个不是数字: '80'`,
      tip: `[[sum(scores)]] 对字符串会拼接、对 bool 会当 1，不能替代逐元素校验；先校验，再求和。`
    }
  ],
  "ch1-3": [
    {
      h: "项目作业：成绩摘要命令行工具",
      p: `目标：把成绩摘要做成 [[summary.py]]，支持 [[summary.py scores.csv]] 和 [[--output report.txt]]。验收点：文件不存在返回 2；坏行不中断，记录行号；有效记录为 0 返回 1；正常输出包含人数、平均、最高、最低；[[--output]] 写文件时编码正确。\n\n实现顺序：先写 [[parse_row]] 和 [[summarize]] 两个纯函数，再写 [[main()]] 处理参数和 I/O。CSV 用 [[csv.DictReader]]，编码 [[utf-8-sig]]，[[newline=""]]。坏行收集到列表，最后统一打印到 stderr；不要边解析边 [[print]]，否则输出顺序混乱。\n\n验收用例：空文件、只有表头、一行坏数据、一行缺考、全部有效。每个用例检查退出码和 stdout/stderr。命令行工具的质量，取决于这些「不漂亮」的输入。`,
      code: String.raw`import argparse, csv, sys
from pathlib import Path

def parse_row(row, lineno):
    try:
        return float(row["score"])
    except (KeyError, ValueError) as err:
        raise ValueError(f"第 {lineno} 行: {err}") from err

def summarize(scores):
    return len(scores), sum(scores) / len(scores), max(scores), min(scores)

def main(argv=None):
    p = argparse.ArgumentParser()
    p.add_argument("path", type=Path)
    p.add_argument("-o", "--output", type=Path)
    args = p.parse_args(argv)
    if not args.path.exists():
        print("文件不存在", file=sys.stderr)
        return 2
    scores, errors = [], []
    with args.path.open(encoding="utf-8-sig", newline="") as f:
        for i, row in enumerate(csv.DictReader(f), 2):
            try:
                scores.append(parse_row(row, i))
            except ValueError as err:
                errors.append(str(err))
    if not scores:
        print("没有有效记录", file=sys.stderr)
        return 1
    text = "人数=%d 平均=%.2f 最高=%.1f 最低=%.1f\n" % summarize(scores)
    if args.output:
        args.output.write_text(text, encoding="utf-8")
    else:
        print(text, end="")
    for e in errors:
        print("跳过:", e, file=sys.stderr)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())`,
      output: `$ python3 summary.py scores.csv
人数=2 平均=89.50 最高=91.0 最低=88.0
$ python3 summary.py missing.csv; echo $?
文件不存在
2`,
      tip: `退出码是契约：0 成功、1 无有效数据、2 参数/文件错误；不要所有失败都返回 1，上游无法区分。`
    }
  ]
});

/* --- deep-final2.js --- */

window.PY_FOUNDATIONS_FINAL = Object.assign(window.PY_FOUNDATIONS_FINAL || {}, {
  "ch2-1": [
    {
      h: "项目作业：把一行脏成绩变成 JSON 记录",
      p: `目标：写 [[parse_line(line)]]，输入可能是带 BOM、全角逗号、前后空格、缺考空字段的一行，输出 [[{"name": str, "scores": [float|null, ...]}]]。验收点：BOM 被去掉；全角逗号/空格被规范化；字段数不对抛 ValueError；空字段保留 None；姓名不能为空。\n\n实现顺序：先 [[lstrip("\ufeff")]]，再 [[unicodedata.normalize("NFKC")]]，再按逗号切分并 [[strip]]。不要用 [[split()]] 无参，它会丢掉空字段；用 [[split(",")]] 并保留空串。转换时逐字段处理，空串转 None，其他转 float；失败带字段下标。\n\n验收用例：正常行、带 BOM 行、全角逗号行、少字段行、多字段行、姓名为空行。输出 JSON 用 [[ensure_ascii=False]]，方便人看；真正入库前再决定是否去重、是否补学号。`,
      code: String.raw`import json, unicodedata

def parse_line(line):
    text = line.lstrip("\ufeff")
    text = unicodedata.normalize("NFKC", text).strip()
    parts = [p.strip() for p in text.split(",")]
    if len(parts) != 4:
        raise ValueError(f"字段数应为 4，实际 {len(parts)}: {parts}")
    name = parts[0]
    if not name:
        raise ValueError("姓名为空")
    scores = []
    for i, raw in enumerate(parts[1:], 1):
        if raw == "":
            scores.append(None)
        else:
            try:
                scores.append(float(raw))
            except ValueError as err:
                raise ValueError(f"第 {i} 个分数非法: {raw!r}") from err
    return {"name": name, "scores": scores}

print(json.dumps(parse_line("\ufeff 林晓，91, 88.5, "), ensure_ascii=False))`,
      output: `{"name": "林晓", "scores": [91.0, 88.5, null]}`,
      tip: `[[NFKC]] 会把全角逗号转成半角，但不会去掉 BOM；先 [[lstrip("\ufeff")]] 再规范化，顺序不能反。`
    }
  ],
  "ch2-2": [
    {
      h: "项目作业：生成一张终端成绩单",
      p: `目标：写 [[render_report(records)]]，输出带表头、分隔线、对齐列、页脚统计的纯文本。验收点：姓名左对齐、分数右对齐、小数位统一；空记录返回「无数据」而不是空字符串；超过页长自动分页；每页重复表头。\n\n实现顺序：先算列宽（取最长的姓名/分数），再拼表头和数据行，最后按 [[page_size]] 切页。不要在循环里 [[print]]，先构造列表再 [[join]]；这样既能打印，也能写文件、发邮件。列宽用 [[max(len(...))]]，中文宽度问题在文档里注明「终端等宽字体」。\n\n验收用例：三条记录、零条记录、姓名长度差异大、分数为 None。None 显示「缺考」，不要显示 [[None]]；页脚统计要跳过 None，并注明缺考人数。`,
      code: String.raw`def render_report(records, page_size=10):
    if not records:
        return "无数据\n"
    name_w = max(len(r["name"]) for r in records) + 2
    header = f"{'姓名':<{name_w}}{'平均':>8}"
    lines = [header, "-" * (name_w + 8)]
    for r in records:
        avg = "缺考" if r["avg"] is None else f"{r['avg']:.2f}"
        lines.append(f"{r['name']:<{name_w}}{avg:>8}")
    pages = [lines[i:i + page_size] for i in range(0, len(lines), page_size)]
    out = []
    for i, page in enumerate(pages, 1):
        out.extend(page)
        out.append(f"第 {i}/{len(pages)} 页")
    return "\n".join(out) + "\n"

rows = [{"name": "林晓", "avg": 86.17}, {"name": "周宁", "avg": None}]
print(render_report(rows, page_size=2))`,
      output: `姓名        平均
------------------
姓名        平均
------------------
第 1/2 页
林晓       86.17
周宁         缺考
第 2/2 页`,
      tip: `先构造行列表再 [[join]]，不要在循环里直接 [[print]]；否则无法分页、写文件或测试。`
    }
  ],
  "ch2-3": [
    {
      h: "项目作业：跨平台 CSV 读写器",
      p: `目标：写 [[read_scores(path)]] 和 [[write_report(path, rows)]]，保证在 Windows/macOS/Linux 上读写一致。验收点：读支持 UTF-8 BOM；写固定 UTF-8 无 BOM 或 sig 可配置；换行固定 [[\n]]；空字段保留；坏行带行号。\n\n实现顺序：读用 [[open(encoding="utf-8-sig", newline="")]] + [[csv.reader]]；写用 [[open(encoding="utf-8", newline="")]] + [[csv.writer]]。不要在文本模式里手动拼 [[\r\n]]，[[csv.writer]] 会按 [[newline]] 处理。需要 Excel 兼容时，写 [[utf-8-sig]]，并文档注明。\n\n验收用例：含中文、含逗号字段、含空字段、含 BOM、CRLF 文件。读回来的字段数与表头一致；写出去的文件用 [[read_bytes()]] 检查前三个字节；不要只看编辑器显示。`,
      code: String.raw`import csv
from pathlib import Path

def read_scores(path):
    rows = []
    with Path(path).open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader, 2):
            try:
                rows.append({"name": row["name"].strip(), "score": float(row["score"])})
            except (KeyError, ValueError) as err:
                raise ValueError(f"第 {i} 行: {err}") from err
    return rows

def write_report(path, rows):
    with Path(path).open("w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        w.writerow(["name", "score"])
        for r in rows:
            w.writerow([r["name"], f"{r['score']:.1f}"])

Path("in.csv").write_text("name,score\n林晓,91\n", encoding="utf-8-sig")
rows = read_scores("in.csv")
write_report("out.csv", rows)
print(rows)
print(Path("out.csv").read_bytes()[:10])`,
      output: `[{'name': '林晓', 'score': 91.0}]
b'name,score\\r\\n'`,
      tip: `写 CSV 用 [[newline=""]] 交给 [[csv.writer]]，不要自己拼 [[\\r\\n]]；否则 Windows 上可能出现双倍换行。`
    }
  ]
});

/* --- deep-final3.js --- */

window.PY_FOUNDATIONS_FINAL = Object.assign(window.PY_FOUNDATIONS_FINAL || {}, {
  "ch3-1": [
    {
      h: "项目作业：成绩列表管理器",
      p: `目标：实现一个内存中的成绩列表管理器，支持 [[add(name, score)]]、[[remove(name)]]、[[top(n)]] 和 [[by_class(cls)]]。验收点：重复姓名策略明确（拒绝/覆盖/保留多条）；删除不存在姓名抛 KeyError；top 返回前 n 且不修改原列表；by_class 不扫描全表。\n\n实现顺序：先用列表存记录，再补一个姓名索引字典；删除时同时更新列表和索引。列表保顺序，索引保查找。不要用列表 [[remove]] 按值删，因为记录是 dict，[[remove]] 比较的是整个字典；用索引找到位置再 [[pop(index)]]，或按 id 过滤。\n\n验收用例：空列表、重复添加、删除不存在、top 大于长度、班级分组。性能上，30 万条时按姓名查找应该是 O(1)，top 是 O(n log n)，by_class 如果每次扫描是 O(n)，可以接受一次，但高频调用应预分组。`,
      code: String.raw`class ScoreBook:
    def __init__(self):
        self.rows = []
        self.index = {}
    def add(self, name, score):
        if name in self.index:
            raise ValueError(f"重复姓名: {name}")
        row = {"name": name, "score": score}
        self.index[name] = row
        self.rows.append(row)
    def remove(self, name):
        row = self.index.pop(name)
        self.rows.remove(row)
    def top(self, n=3):
        return sorted(self.rows, key=lambda r: -r["score"])[:n]
    def by_class(self, cls):
        return [r for r in self.rows if r.get("class") == cls]

book = ScoreBook()
book.add("林晓", 91)
book.add("周宁", 88)
print(book.top(2))
try:
    book.add("林晓", 95)
except ValueError as err:
    print(err)
book.remove("周宁")
print(book.rows)`,
      output: `[{'name': '林晓', 'score': 91}, {'name': '周宁', 'score': 88}]
重复姓名: 林晓
[{'name': '林晓', 'score': 91}]`,
      tip: `[[list.remove(dict)]] 按值比较，可能删掉错误的重复记录；用索引定位对象再 [[pop(index)]]，或按身份过滤。`
    }
  ],
  "ch3-2": [
    {
      h: "项目作业：排序、并列名次与可复现报告",
      p: `目标：给成绩记录生成「分数降序、同分姓名升序、缺考最后、并列名次」的报告，并输出排序规则说明。验收点：同分同名次；缺考不参与平均但出现在报告；排序键是纯函数；同一输入两次运行结果一致。\n\n实现顺序：先写 [[sort_key]]，再写 [[assign_rank]]，最后写 [[render]]。[[sort_key]] 返回元组，类型要一致；[[assign_rank]] 维护上一个分数和当前名次；[[render]] 只负责排版。三个函数分开，测试可以分别断言。\n\n验收用例：全同分、部分缺考、姓名重复、空列表。空列表返回空报告而不是抛异常；缺考显示「缺考」，不要显示 None；并列名次用「1,1,3」而不是「1,2,3」。`,
      code: String.raw`def sort_key(r):
    return (r["score"] is None, -(r["score"] or 0), r["name"])

def assign_rank(rows):
    out, rank, prev = [], 0, object()
    for i, r in enumerate(rows, 1):
        if r["score"] != prev:
            rank = i
            prev = r["score"]
        out.append((rank, r))
    return out

rows = [
    {"name": "林晓", "score": 91},
    {"name": "陈默", "score": 91},
    {"name": "周宁", "score": None},
]
for rank, r in assign_rank(sorted(rows, key=sort_key)):
    print(rank, r["name"], r["score"])`,
      output: `1 陈默 91
1 林晓 91
3 周宁 None`,
      tip: `并列名次用「是否同分」决定是否更新 rank；直接用 [[enumerate]] 下标会把同分拆成 1、2。`
    }
  ],
  "ch3-3": [
    {
      h: "项目作业：用 namedtuple 做不可变成绩记录",
      p: `目标：用 [[namedtuple]] 定义 [[Score(name, python, math)]]，提供 [[average()]] 和 [[to_dict()]]，并让记录能作为字典键。验收点：字段不可变；支持下标/解包；平均分计算不修改原记录；to_dict 输出 JSON 兼容；重复记录可去重。\n\n实现顺序：先定义类型，再写方法。namedtuple 的方法用 [[_replace()]] 返回新记录，不要试图修改字段。[[to_dict()]] 用 [[_asdict()]]，但注意它返回的是 OrderedDict/dict，嵌套值仍是原对象；需要深拷贝时再处理。\n\n验收用例：创建、解包、平均、to_dict、作为字典键、去重。记录里不要放列表；要放多个分数，用元组或单独字段。namedtuple 适合轻量记录，不适合复杂校验；需要校验时用 dataclass。`,
      code: String.raw`from collections import namedtuple

Score = namedtuple("Score", "name python math")
Score.average = lambda self: (self.python + self.math) / 2
Score.to_dict = lambda self: self._asdict()

s = Score("林晓", 91, 88)
print(s, s.average(), s.to_dict())
print(s._replace(python=95))

print({s: "record"}[Score("林晓", 91, 88)])
print(len({s, Score("林晓", 91, 88)}))`,
      output: `Score(name='林晓', python=91, math=88) 89.5 {'name': '林晓', 'python': 91, 'math': 88}
Score(name='林晓', python=95, math=88)
record
1`,
      tip: `[[namedtuple]] 的 [[_replace()]] 返回新记录，不修改原记录；需要原地修改就用 dataclass 或普通类。`
    }
  ]
});

/* --- deep-final4.js --- */

window.PY_FOUNDATIONS_FINAL = Object.assign(window.PY_FOUNDATIONS_FINAL || {}, {
  "ch4-1": [
    {
      h: "项目作业：学号索引与重复检测",
      p: `目标：实现 [[build_index(rows)]]，返回 [[(index, duplicates)]]：index 是学号到记录的字典，duplicates 是重复学号列表。验收点：不静默覆盖；重复学号保留第一条还是最后一条要明确；原列表不被修改；缺失 sid 抛 KeyError。\n\n实现顺序：先遍历一次，检查 sid 是否存在；重复时记录并决定策略（保留第一条/最后一条/合并）。默认保留第一条，因为「先入为主」更可预测；如果要保留最后一条，文档写清楚。不要用字典推导式，它无法记录重复。\n\n验收用例：全唯一、一个重复、多个重复、空列表、缺 sid。重复检测的复杂度 O(n)，索引查询 O(1)。大数据时不要为了检测重复再排序，哈希一次就够。`,
      code: String.raw`def build_index(rows, keep="first"):
    index, duplicates = {}, []
    for row in rows:
        sid = row["sid"]
        if sid in index:
            duplicates.append(sid)
            if keep == "last":
                index[sid] = row
        else:
            index[sid] = row
    return index, duplicates

rows = [
    {"sid": "S01", "score": 91},
    {"sid": "S02", "score": 88},
    {"sid": "S01", "score": 95},
]
index, dups = build_index(rows)
print(index["S01"], dups)
index2, _ = build_index(rows, keep="last")
print(index2["S01"])`,
      output: `{'sid': 'S01', 'score': 91} ['S01']
{'sid': 'S01', 'score': 95}`,
      tip: `字典推导式遇到重复键只能静默覆盖；需要检测重复时，用普通循环并显式记录。`
    }
  ],
  "ch4-2": [
    {
      h: "项目作业：嵌套成绩册与安全读取",
      p: `目标：把扁平行构建成 [[{class: {sid: record}}]]，提供 [[get_score(book, cls, sid, subject)]] 安全读取。验收点：班级、学号、科目任一层缺失返回明确结果；不修改原数据；空班级/空学号被拒绝；支持 JSON 输出。\n\n实现顺序：先建外层班级字典，再建内层学号字典；记录里 scores 是科目字典。读取用逐层 [[get]]，但不要用 [[get(...).get(...)]] 链，因为中间可能是 None；写 [[safe_get]] 逐层判断类型。缺失返回 None，由展示层决定显示「缺考」还是「无记录」。\n\n验收用例：正常三层、缺班级、缺学号、缺科目、空字符串键。嵌套不是越深越好；超过三层就考虑拆成多张表或对象。`,
      code: String.raw`def build_book(rows):
    book = {}
    for cls, sid, name, subject, score in rows:
        if not cls or not sid:
            raise ValueError("班级/学号不能为空")
        book.setdefault(cls, {}).setdefault(sid, {"name": name, "scores": {}})
        book[cls][sid]["scores"][subject] = score
    return book

def safe_get(book, cls, sid, subject):
    class_map = book.get(cls)
    if not isinstance(class_map, dict):
        return None
    record = class_map.get(sid)
    if not isinstance(record, dict):
        return None
    return record.get("scores", {}).get(subject)

rows = [("A", "S01", "林晓", "python", 91), ("A", "S01", "林晓", "math", 88)]
book = build_book(rows)
print(book)
print(safe_get(book, "A", "S01", "python"))
print(safe_get(book, "A", "S99", "python"))`,
      output: `{'A': {'S01': {'name': '林晓', 'scores': {'python': 91, 'math': 88}}}}
91
None`,
      tip: `链式 [[.get().get()]] 在中间是 None 时会抛 AttributeError；逐层判断类型，或写 [[safe_get]]。`
    }
  ],
  "ch4-3": [
    {
      h: "项目作业：权限差集与共同选课",
      p: `目标：实现 [[can_access(granted, required)]] 和 [[missing(granted, required)]]，再实现 [[common_courses(a, b)]]。验收点：权限是集合，判断 O(len(required))；缺失项排序输出；共同课程保留可读顺序；空集合不报错。\n\n实现顺序：[[can_access]] 用 [[required <= granted]]；[[missing]] 用 [[required - granted]] 再 [[sorted]]；[[common]] 用 [[a & b]] 再 [[sorted]]。不要用列表推导式做 [[in]] 判断，权限多时 O(n*m)。\n\n验收用例：全有、缺一个、全缺、空 required、空 granted、重复权限。空 required 应返回 True（不需要任何权限）；空 granted 且 required 非空返回 False。规则写进 docstring。`,
      code: String.raw`def can_access(granted, required):
    return set(required) <= set(granted)

def missing(granted, required):
    return sorted(set(required) - set(granted))

def common_courses(a, b):
    return sorted(set(a) & set(b))

g = {"read", "write", "export"}
r = {"read", "admin"}
print(can_access(g, r), missing(g, r))
print(can_access(g, set()), missing(g, set()))
print(common_courses(["Python", "数学"], ["Python", "物理"]))`,
      output: `False ['admin']
True []
['Python']`,
      tip: `空 required 表示「不需要权限」，[[set() <= granted]] 为 True；空 granted 且 required 非空才是 False。`
    }
  ]
});

/* --- deep-final5.js --- */

window.PY_FOUNDATIONS_FINAL = Object.assign(window.PY_FOUNDATIONS_FINAL || {}, {
  "ch5-1": [
    {
      h: "项目作业：把等级规则做成可配置表",
      p: `目标：把分数→等级规则从 if/elif 抽成数据表，支持运行时调整；实现 [[grade(score, levels=LEVELS)]]。验收点：规则按从高到低匹配；边界 90/89.9/60/59.9 正确；非法类型/范围报错；空规则表报错。\n\n实现顺序：规则表用 [[[(90, "A"), (80, "B"), ...]]]；遍历表，第一个 [[score >= lower]] 命中就返回；最后返回兜底等级或抛错。不要把规则表按升序放，否则 100 会命中最低档。规则表是配置，不是代码，修改时不需要改函数。\n\n验收用例：空表、重复阈值、负数阈值、100 分、0 分、True/None/字符串。空表应抛 ValueError；重复阈值应报配置错误，而不是静默取第一个。规则可配置不等于可以乱配，入口要校验。`,
      code: String.raw`LEVELS = [(90, "A"), (80, "B"), (60, "C"), (0, "D")]

def grade(score, levels=LEVELS):
    if not levels:
        raise ValueError("等级规则为空")
    if isinstance(score, bool) or not isinstance(score, (int, float)):
        raise TypeError("分数必须是数字")
    if not 0 <= score <= 100:
        raise ValueError("分数越界")
    lowers = [x[0] for x in levels]
    if lowers != sorted(lowers, reverse=True) or len(set(lowers)) != len(lowers):
        raise ValueError("等级阈值必须唯一且降序")
    for lower, level in levels:
        if score >= lower:
            return level
    return "D"

print([(s, grade(s)) for s in [100, 90, 89.9, 60, 59.9, 0]])
try:
    grade(90, [])
except ValueError as err:
    print(err)`,
      output: `[(100, 'A'), (90, 'A'), (89.9, 'B'), (60, 'C'), (59.9, 'D'), (0, 'D')]
等级规则为空`,
      tip: `规则表必须降序且阈值唯一；升序会让 100 分命中最低档，重复阈值会让结果依赖表顺序。`
    }
  ],
  "ch5-2": [
    {
      h: "项目作业：带重试与统计的批处理",
      p: `目标：实现 [[process(lines, max_retries=3)]]，返回成功、跳过、失败三组结果和统计。验收点：空行跳过；坏行记录行号；临时错误有限重试；连续失败超过阈值提前终止；退出码反映整体状态。\n\n实现顺序：先写 [[parse_one]]，再写 [[with_retry]]，最后写主循环。重试只包住「可能临时恢复」的操作；[[int("bad")]] 不需要重试。连续失败阈值是业务策略，例如连续 5 行失败就 [[break]]，避免整批卡死。\n\n验收用例：全成功、全空行、全坏行、间歇坏行、临时错误后成功。统计要包含处理总数、成功数、跳过数、失败数、耗时；没有统计的批处理无法验收。`,
      code: String.raw`import time

def parse_one(text):
    try:
        return int(text)
    except ValueError as err:
        raise ValueError(f"不是整数: {text!r}") from err

def with_retry(fn, text, attempts=3):
    for i in range(attempts):
        try:
            return fn(text)
        except ValueError:
            if i == attempts - 1:
                raise
            time.sleep(0.01)

def process(lines, max_consecutive=3):
    ok, skipped, failed = [], [], []
    consecutive = 0
    for lineno, text in enumerate(lines, 1):
        if not text.strip():
            skipped.append((lineno, "空行"))
            continue
        try:
            ok.append(with_retry(parse_one, text))
            consecutive = 0
        except ValueError as err:
            failed.append((lineno, str(err)))
            consecutive += 1
            if consecutive >= max_consecutive:
                failed.append((lineno, "连续失败，提前终止"))
                break
    return {"ok": ok, "skipped": skipped, "failed": failed}

print(process(["91", "", "bad", "bad", "bad", "88"]))`,
      output: `{'ok': [91], 'skipped': [(2, '空行')], 'failed': [(3, '不是整数: \'bad\''), (4, '不是整数: \'bad\''), (5, '不是整数: \'bad\''), (5, '连续失败，提前终止')]}`,
      tip: `重试只对临时错误有意义；对 [[int("bad")]] 重试三次仍然失败，应该记录并继续/终止，不要无限重试。`
    }
  ],
  "ch5-3": [
    {
      h: "项目作业：事件分发表与兼容性",
      p: `目标：实现 [[handle(event)]]，支持 score/absence/unknown 三类事件；在 Python 3.10+ 用 match，在 3.8 环境提供 if/elif 降级版。验收点：未知事件报错；缺字段有明确错误；负数分数单独处理；两版行为一致。\n\n实现顺序：先写 if/elif 版，作为基线；再写 match 版，用同一组事件对比输出。不要在 3.8 环境导入 match 语法，直接把 match 代码放模块顶层会 SyntaxError；用版本判断或分开文件。\n\n验收用例：正常 score、缺 student、负数 score、正常 absence、缺 reason、未知 type、空字典。两版输出逐条一致；不一致就是逻辑漏洞，不是「写法差异」。`,
      code: String.raw`def handle_if(event):
    if event.get("type") == "score":
        student = event.get("student")
        if not isinstance(student, dict) or "name" not in student:
            raise ValueError("score 缺少 student.name")
        value = event.get("value")
        if not isinstance(value, (int, float)) or isinstance(value, bool):
            raise ValueError("score.value 必须是数字")
        if value < 0:
            raise ValueError("score.value 不能为负")
        return f"{student['name']}: {value}"
    if event.get("type") == "absence":
        student = event.get("student") or {}
        return f"{student.get('name', '未知')} 缺考: {event.get('reason', '未说明')}"
    raise ValueError(f"未知事件: {event.get('type')!r}")

for e in [
    {"type": "score", "student": {"name": "林晓"}, "value": 91},
    {"type": "score", "value": -1},
    {"type": "absence", "student": {"name": "周宁"}, "reason": "病假"},
    {"type": "other"},
]:
    try:
        print(handle_if(e))
    except ValueError as err:
        print(err)`,
      output: `林晓: 91
score 缺少 student.name
周宁 缺考: 病假
未知事件: 'other'`,
      tip: `先写 if/elif 基线，再用同一组用例验证 match 版；两版行为不一致时，先修逻辑，不要改测试。`
    }
  ]
});

/* --- deep-final6.js --- */

window.PY_FOUNDATIONS_FINAL = Object.assign(window.PY_FOUNDATIONS_FINAL || {}, {
  "ch6-1": [
    {
      h: "项目作业：average 的测试矩阵",
      p: `目标：给 [[average(scores)]] 写一组不依赖框架的测试，覆盖正常、空、类型错误、边界、非变异。验收点：每个用例有名字；失败时打印期望/实际；测试不修改输入；测试之间互不影响。\n\n实现顺序：写 [[check(name, fn, expected)]] 和 [[check_raises(name, fn, exc)]] 两个辅助函数；每条用例独立调用。不要用一个巨大 try 包住所有断言，否则第一个失败后面的都不跑。测试文件可以先用 [[assert]]，但记住 [[python -O]] 会移除 assert；生产测试用显式异常。\n\n验收用例：[[[90, 80]]] → 85.0；[[]] → None 或 ValueError；[[[True]]] → TypeError；[[["90"]]] → TypeError；[[[None]]] → TypeError；[[[90, "80"]]] → TypeError；输入列表长度和内容不变。`,
      code: String.raw`def average(scores):
    if not scores:
        return None
    total = 0.0
    for i, value in enumerate(scores, 1):
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise TypeError(f"第 {i} 个不是数字: {value!r}")
        total += value
    return total / len(scores)

def check(name, got, expected):
    if got != expected:
        raise AssertionError(f"{name}: 期望 {expected!r}，实际 {got!r}")
    print("PASS", name)

def check_raises(name, fn, exc):
    try:
        fn()
    except exc:
        print("PASS", name)
    else:
        raise AssertionError(f"{name}: 没有抛 {exc.__name__}")

check("normal", average([90, 80]), 85.0)
check("empty", average([]), None)
check_raises("bool", lambda: average([True]), TypeError)
check_raises("str", lambda: average(["90"]), TypeError)
data = [90, 80]
check("not mutate", average(data), 85.0)
print(data)`,
      output: `PASS normal
PASS empty
PASS bool
PASS str
PASS not mutate
[90, 80]`,
      tip: `测试函数要保持纯：不修改输入、不依赖全局顺序；一条用例失败不应阻止后面的用例执行。`
    }
  ],
  "ch6-2": [
    {
      h: "项目作业：配置工厂与计数器",
      p: `目标：实现 [[make_report(config)]]，返回一个记住配置的渲染函数；再实现 [[make_counter()]]，返回自增/读取两个函数。验收点：不同 config 生成不同行为；计数器状态独立；闭包不捕获可变配置的共享引用；不泄漏全局变量。\n\n实现顺序：config 先复制一份，避免调用方后续修改影响已生成的函数；计数器用 [[nonlocal]]；需要重置时返回 [[reset()]] 或重新生成。不要在闭包里直接引用外部可变字典，除非你明确想共享。\n\n验收用例：两个不同前缀的 formatter 输出不同；同一个 formatter 多次调用格式一致；两个计数器互不影响；修改原 config 后 formatter 不变。`,
      code: String.raw`def make_report(config):
    cfg = dict(config)
    def render(value):
        return f"{cfg['prefix']}{value:>{cfg['width']}}"
    return render

def make_counter():
    count = 0
    def inc():
        nonlocal count
        count += 1
        return count
    def get():
        return count
    return inc, get

fmt = make_report({"prefix": "分数: ", "width": 6})
print(fmt(91))

config = {"prefix": "分数: ", "width": 6}
fmt2 = make_report(config)
config["prefix"] = "改了: "
print(fmt2(91))

inc, get = make_counter()
print(inc(), inc(), get())`,
      output: `分数:     91
分数:     91
1 2 2`,
      tip: `闭包捕获的是变量，不是快照；config 先 [[dict(config)]] 复制，避免调用方后续修改影响已生成的函数。`
    }
  ],
  "ch6-3": [
    {
      h: "项目作业：二分查询服务",
      p: `目标：实现 [[find_first_ge(records, target)]]，records 按 score 升序；返回第一条 score >= target 的记录或 None。验收点：空列表、目标小于最小、大于最大、等于中间、重复分数、缺 score 字段。\n\n实现顺序：先用 [[bisect_left]] 在分数列表上找位置，再判断位置是否越界、该位置分数是否满足；不要直接返回 [[records[i]]] 而不检查。重复分数时，bisect_left 返回第一个相等位置，符合「第一条」。\n\n验收用例：[[[]]]、[[[60]]]、target 50/60/95、重复 70、记录缺 score。缺字段应在建分数列表时过滤或抛错，不要让 [[KeyError]] 在二分循环里冒出来。`,
      code: String.raw`from bisect import bisect_left

def find_first_ge(records, target):
    if not records:
        return None
    scores = [r["score"] for r in records]
    i = bisect_left(scores, target)
    if i == len(records):
        return None
    return records[i]

records = [
    {"name": "A", "score": 60},
    {"name": "B", "score": 70},
    {"name": "C", "score": 70},
    {"name": "D", "score": 90},
]
for target in [50, 60, 70, 95]:
    r = find_first_ge(records, target)
    print(target, r["name"] if r else None)
print(find_first_ge([], 60))`,
      output: `50 A
60 A
70 B
95 None
None`,
      tip: `[[bisect_left]] 返回插入位置；返回记录前先判 [[i == len]]，再确认该位置的值真的 >= target。`
    }
  ]
});

/* --- deep-final7.js --- */

window.PY_FOUNDATIONS_FINAL = Object.assign(window.PY_FOUNDATIONS_FINAL || {}, {
  "ch7-1": [
    {
      h: "项目作业：推导式清洗十万行成绩",
      p: `目标：实现 [[clean_rows(rows)]]，把原始字符串行转成记录列表，坏行单独返回；再用字典推导式建学号索引。验收点：空字段保留 None；坏行不丢；重复学号被检测；推导式只做一对一转换。\n\n实现顺序：先写 [[parse_row]]（可能返回 None 或抛错），再写 [[clean_rows]] 用普通循环收集坏行；最后用推导式做简单转换。不要把所有逻辑塞进一个推导式，否则无法记录行号。十万行时，普通循环 + append 可能比推导式慢一点，但可调试性更高；先正确，再优化。\n\n验收用例：正常、空字段、坏数字、重复学号、负分。输出包含 records、bad_rows、duplicates 三部分；调用方可以决定「有坏行是否继续」。`,
      code: String.raw`def parse_row(row, lineno):
    try:
        score = None if row["score"] == "" else float(row["score"])
    except (KeyError, ValueError) as err:
        raise ValueError(f"第 {lineno} 行: {err}") from err
    if score is not None and not 0 <= score <= 100:
        raise ValueError(f"第 {lineno} 行分数越界: {score}")
    return {"sid": row["sid"], "score": score}

def clean_rows(rows):
    records, bad = [], []
    for i, row in enumerate(rows, 2):
        try:
            records.append(parse_row(row, i))
        except ValueError as err:
            bad.append(str(err))
    return records, bad

rows = [
    {"sid": "S01", "score": "91"},
    {"sid": "S02", "score": ""},
    {"sid": "S03", "score": "bad"},
    {"sid": "S01", "score": "95"},
]
records, bad = clean_rows(rows)
print(records)
print(bad)
print({r["sid"] for r in records if sum(1 for x in records if x["sid"] == r["sid"]) > 1})`,
      output: `[{'sid': 'S01', 'score': 91.0}, {'sid': 'S02', 'score': None}, {'sid': 'S01', 'score': 95.0}]
['第 4 行: could not convert string to float: 'bad'']
{'S01'}`,
      tip: `推导式适合一对一转换；需要记录行号/坏行时用普通循环。先保证错误可追踪，再谈写法紧凑。`
    }
  ],
  "ch7-2": [
    {
      h: "项目作业：分页迭代器与断点续读",
      p: `目标：实现 [[PagedReader]]，按页拉取记录，支持 [[next()]]、[[close()]] 和 [[position()]]。验收点：最后一页后抛 StopIteration；网络异常向上抛；提前关闭释放资源；position 返回下一页页码，支持断点续读。\n\n实现顺序：维护 page、buffer、closed 三个状态；[[__next__]] 先检查 closed，再检查 buffer，再拉下一页；拉取失败不要转成 StopIteration。[[close()]] 设 closed 并清空 buffer；[[position()]] 返回 page，调用方可以持久化。\n\n验收用例：两页数据、空页、拉取异常、提前 break 后 close、断点续读。不要把生成器 pickle 存盘，生成器不可序列化；存页码/游标。`,
      code: String.raw`class PagedReader:
    def __init__(self, api, page_size=2):
        self.api = api
        self.page_size = page_size
        self.page = 0
        self.buffer = []
        self.closed = False
    def __iter__(self):
        return self
    def __next__(self):
        if self.closed:
            raise StopIteration
        while not self.buffer:
            try:
                data = self.api.fetch(self.page)
            except IndexError:
                raise StopIteration
            self.page += 1
            self.buffer = data[:self.page_size]
            if not self.buffer:
                raise StopIteration
        return self.buffer.pop(0)
    def close(self):
        self.closed = True
        self.buffer = []
    def position(self):
        return self.page

class API:
    def __init__(self, pages): self.pages = pages
    def fetch(self, page):
        if page >= len(self.pages):
            raise IndexError
        return self.pages[page]

reader = PagedReader(API([[1, 2], [3]]))
print(next(reader), next(reader), reader.position())
print(list(reader))
reader.close()
print(reader.position(), list(reader))`,
      output: `1 2 1
[3]
2 []`,
      tip: `分页迭代器把「网络异常」和「数据结束」分开：异常向上抛，StopIteration 只表示没有下一页。`
    }
  ],
  "ch7-3": [
    {
      h: "项目作业：大日志生成器管道",
      p: `目标：实现 [[lines]]、[[errors]]、[[count_by_hour]] 三层管道，统计 ERROR 按小时分布。验收点：逐行读取，不物化；坏行记录行号；文件关闭；管道只消费一次；空文件返回空统计。\n\n实现顺序：[[lines]] 用 [[with open]] + [[yield]]；[[errors]] 过滤并解析时间；[[count_by_hour]] 用 [[Counter]] 累加。不要在 [[lines]] 里 [[readlines()]]，也不要在 [[errors]] 里保存所有行。\n\n验收用例：空文件、无 ERROR、多小时、坏时间戳、超大文件（可用生成器模拟）。坏时间戳记录行号并跳过；统计结果用 [[dict(sorted(counter.items()))]] 输出，保证稳定。`,
      code: String.raw`from collections import Counter
from pathlib import Path
import re

def lines(path):
    with Path(path).open(encoding="utf-8") as f:
        for i, line in enumerate(f, 1):
            yield i, line.rstrip("\n")

def errors(rows, bad):
    for i, line in rows:
        if "ERROR" not in line:
            continue
        m = re.search(r"(\d{2}):\d{2}:\d{2}", line)
        if not m:
            bad.append(i)
            continue
        yield m.group(1)

def count_by_hour(path):
    bad = []
    counter = Counter(errors(lines(path), bad))
    return dict(sorted(counter.items())), bad

Path("app.log").write_text(
    "08:00:00 INFO start\n09:10:00 ERROR db\n09:20:00 ERROR timeout\nbad ERROR\n",
    encoding="utf-8",
)
print(count_by_hour("app.log"))`,
      output: `({'09': 2}, [4])`,
      tip: `管道只消费一次；需要多个统计时，在一次遍历里同时累加，或重新创建管道，不要复用已耗尽的生成器。`
    }
  ]
});

/* --- deep-review.js --- */

window.PY_FOUNDATIONS_REVIEW = {
  "ch1-1": [
    {
      h: "本章复盘：环境、变量与表达式",
      p: `这一章解决两件事：代码在哪里运行，名字怎样指向对象。运行时先分清解释器、REPL、脚本、模块四种形态；[[sys.executable]] 确认解释器，[[sys.path]] 确认模块搜索路径，[[__name__]] 区分直接运行与导入。主函数保护不是仪式，而是把副作用关在入口里。\n\n变量是标签，对象才有类型、身份和值。[[==]] 比较值，[[is]] 比较身份；[[b = a]] 不复制，[[b = a.copy()]] 只复制外层，[[copy.deepcopy()]] 才递归复制。不可变对象「修改」是重新绑定，可变对象才可能原地变；函数参数传的是对象引用，不是副本。默认参数在定义时求值，可变默认值会跨调用共享。\n\n表达式与语句要分开：表达式产生值，语句驱动控制流或绑定名字。[[//]] 向下取整，[[%]] 符号跟随除数，[[round()]] 是银行家舍入；金额用 [[Decimal]]，浮点比较用 [[math.isclose()]]。第一个成绩单项目把「输入契约、计算、格式化、落盘」串起来，为后面所有项目打底。\n\n检查点：你能不能解释 [[python3 script.py]] 和 [[python3 -m module]] 的导入差异？能不能用 [[id()]] 判断原地修改还是重新绑定？能不能写出一个导入无副作用的模块？能不能给空列表、坏类型、越界分数分别设计错误？这四题答清楚，本章就过关。`,
      code: String.raw`import sys
print(sys.version_info >= (3, 10))
a = [1, 2]
b = a
b += [3]
print(a is b, a)

x = 10
y = x
y += 1
print(x, y, id(x) == id(y))`,
      output: `True
True [1, 2, 3]
10 11 False`,
      tip: `[[a is b]] 为 True 只说明两个名字指向同一对象；要判断值相等，用 [[==]]。`
    }
  ],
  "ch2-1": [
    {
      h: "本章复盘：字符串、格式化与编码",
      p: `字符串是不可变序列：索引取字符，切片取子串，方法返回新字符串。切片左闭右开，越界切片不报错，负步长要先确定方向；切片复制是浅复制，嵌套可变对象仍共享。常用清洗顺序是 [[repr()]] 观察、[[strip()]] 去首尾、[[split()]] 切分、[[join()]] 拼回；[[split(",")]] 保留空字段，[[split()]] 丢弃空段。\n\n格式化抓住三个旋钮：宽度、对齐、精度。[[< > ^]] 控制方向，[[.2f]] 控制小数，[[,]] 控制千分位，[[%]] 自动乘 100。数字格式前先分清计数、金额、比例；金额用 [[Decimal]]，比例处理分母为零。f-string 适合「已知模板 + 少量变量」，不适合用户可编辑模板或复杂业务逻辑。\n\n编码分三层：Unicode 是字符集，UTF-8 是变长编码，[[bytes]] 是字节序列。[[str]] 与 [[bytes]] 不要混；[[encode()]]/[[decode()]] 默认 strict，[[ignore]] 会静默丢数据，[[replace]] 会留下替换符。BOM 用 [[utf-8-sig]] 处理，换行用 [[newline=""]] 或 [[splitlines()]]；乱码先 [[repr()]] 和原始字节，不要靠眼睛猜。\n\n检查点：[[split(",")]] 和 [[split()]] 对空字段的行为一样吗？[[f"{0.873:.1%}"]] 输出什么？[[utf-8-sig]] 和 [[utf-8]] 差在哪？[[errors="ignore"]] 为什么危险？这四题能答，字符串与编码的日常问题基本能定位。`,
      code: String.raw`s = " 林晓, 91,  "
print([p.strip() for p in s.split(",")])
print("a,,b".split(","), "a,,b".split())
print(f"{0.873:.1%}")
print("中".encode("utf-8"), len("中"))`,
      output: `['林晓', '91', '']
['a', '', 'b'] ['a', 'b']
87.3%
b'\xe4\xb8\xad' 1`,
      tip: `[[len("中")]] 是 1 个字符，[[len("中".encode("utf-8"))]] 是 3 个字节；字段长度限制先确认按哪个算。`
    }
  ],
  "ch3-1": [
    {
      h: "本章复盘：列表、元组与序列",
      p: `列表是可变动态数组：尾部 append/pop 均摊 O(1)，按下标读写 O(1)，按值查找/删除 O(n)，头部插入/删除 O(n)。需要队列用 [[deque]]，需要成员判断用 [[set]]，需要按键查找用 [[dict]]。[[append(x)]] 加一个元素，[[extend(xs)]] 拆开逐个加；[[insert()]] 越界插到末尾；[[remove()]] 找不到抛 ValueError。\n\n遍历时不要修改列表：迭代器下标仍在前进，会跳过元素。遍历副本、倒序遍历或构造新列表三选一。切片产生新列表，切片赋值改变原列表长度；切片复制是浅复制，内层可变对象仍共享。排序用 [[sorted()]] 返回新列表，[[sort()]] 原地并返回 None；key 返回类型要一致，多键用元组，同分用稳定排序或显式名次。\n\n元组是不可变序列，逗号比括号重要；元组可哈希的前提是所有元素可哈希。解包要求元素个数匹配，星号吸收剩余，嵌套解包适合固定结构。[[zip()]] 按最短截断，[[strict=True]] 才报错；zip 返回迭代器，遍历一次就耗尽。namedtuple 给元组加字段名，适合轻量记录；需要校验/默认值用 dataclass。\n\n检查点：[[pop(0)]] 的复杂度是多少？[[a[:]]] 会复制内层列表吗？[[zip(a, b)]] 长度不一致会怎样？[[(1, [2])]] 能当字典键吗？这四题能答，序列选型和边界基本不会错。`,
      code: String.raw`a = [1, 2, 3]
b = a[:]
print(a is b, a == b)
a[1:3] = [9]
print(a, b)

from collections import namedtuple
Pair = namedtuple("Pair", "x y")
p = Pair(1, 2)
print(p.x, p[1])`,
      output: `False True
[1, 9] [1, 2, 3]
1 2`,
      tip: `[[a[:]]] 只复制外层；内层列表仍共享。需要独立嵌套结构时用 [[copy.deepcopy()]]。`
    }
  ],
  "ch4-1": [
    {
      h: "本章复盘：字典、集合与查找",
      p: `字典是哈希表：键必须可哈希，查找平均 O(1)，遍历顺序是插入顺序。[[]] 缺失抛 KeyError，[[get()]] 返回默认；[[setdefault()]] 会插入，[[defaultdict(factory)]] 惰性建默认值。默认工厂必须是可调用对象，不能传现成的可变对象，否则所有键共享同一个默认值。\n\n嵌套数据先定义记录结构，再决定索引。list of dicts 适合顺序展示，dict of dicts 适合按 id 查找；两层可以共存。缺失键不要全吞成 None，业务上该报错的地方要报错；链式 [[.get().get()]] 在中间是 None 时会抛 AttributeError，写 [[safe_get]] 逐层判断。合并 [[{**a, **b}]] 只合并顶层，深合并要明确数组语义。\n\n集合元素可哈希、唯一、无序；适合去重、成员判断、交并差。[[{}]] 是空字典，空集合用 [[set()]]；集合 [[pop()]] 删除任意元素，不是第一个。[[frozenset]] 可哈希，能当字典键。去重前先定义「重复」：完全相等、业务键还是某个字段；需要顺序去重用 [[dict.fromkeys()]]。\n\n检查点：字典键为什么不能是列表？[[get()]] 和 [[setdefault()]] 差在哪？[[defaultdict(list)]] 和 [[defaultdict(defaultdict(list))]] 有什么坑？集合 [[pop()]] 返回什么？这四题能答，字典/集合的常见事故基本能避免。`,
      code: String.raw`from collections import defaultdict

d = {"a": 1}
print(d.get("b"), d.setdefault("c", []))
d["c"].append(2)
print(d)

groups = defaultdict(list)
groups["A"].append("林晓")
print(dict(groups))

print({} == set(), type({}), type(set()))`,
      output: `None []
{'a': 1, 'c': [2]}
{'A': ['林晓']}
False <class 'dict'> <class 'set'>`,
      tip: `[[{} == set()]] 为 False；空字典和空集合是不同类型，不能互相替代。`
    }
  ],
  "ch5-1": [
    {
      h: "本章复盘：条件、循环与模式匹配",
      p: `条件判断的是真值，不是「等于 True」。空容器、0、None、False 为假；自定义对象可实现 [[__bool__]]/[[__len__]]。[[bool]] 是 int 子类，[[True == 1]]；数字校验先排除 bool。[[and/or]] 返回操作数，不是布尔值；需要严格布尔用 [[bool()]]，二选一用 [[x if cond else y]]。\n\n分支要互斥且覆盖完整，边界写清楚。[[0 <= x < 100]] 不包含 100；[[0 <= x > 10]] 没有上界。链式比较只求值一次，但方向要一致。卫语句提前返回，主逻辑保持扁平；长条件先命名，别把副作用塞进条件。\n\n循环是迭代协议：[[iter()]] 拿迭代器，[[next()]] 直到 StopIteration。[[range()]] 惰性，循环变量会泄漏到外层；嵌套 [[break]] 只跳一层。[[for...else]] 的 else 在「没有 break」时执行。[[enumerate]] 带下标，[[zip]] 按最短截断，[[strict=True]] 才报错。\n\n[[match]] 是 3.10+ 的结构匹配：从上到下、首个命中、不穿透；[[case _]] 匹配一切且应放最后；映射模式只要求包含键，不要求只有这些键。3.9 及以下直接 SyntaxError，练习室 3.8 只能读不能提交。检查点：[[[] == False]] 是什么？[[for...else]] 什么时候执行？[[zip]] 长度不一致怎么办？[[match]] 能替代 if/elif 吗？`,
      code: String.raw`print([] == False, bool([]))
print(0 or "x", 1 and "y")

for n in [2, 4]:
    if n % 2:
        break
else:
    print("全偶")

print(list(zip([1, 2], ["a"])))`,
      output: `False False
x y
全偶
[(1, 'a')]`,
      tip: `[[[] == False]] 为 False，但 [[bool([])]] 为 False；判断空用 [[not x]]，不要用 [[x == False]]。`
    }
  ],
  "ch6-1": [
    {
      h: "本章复盘：函数、作用域与递归",
      p: `函数是命名的作用域，调用时才创建栈帧。参数绑定顺序：位置、默认、[[*args]]、keyword-only、[[**kwargs]]；[[/]] 限制仅限位置，[[*]] 限制仅限关键字。默认参数在定义时求值，可变默认值跨调用共享；需要每次新值就写 None，函数体内再创建。\n\n返回值不写就是 None；返回多个值本质是元组。纯函数只依赖参数、不修改输入，副作用留在 I/O 边界。[[assert]] 不能做参数校验，[[python -O]] 会移除；公共函数抛 TypeError/ValueError，错误信息带参数名和原值。\n\n作用域按 LEGB；函数内赋值让名字变局部，改外层用 [[nonlocal]]，改模块用 [[global]]。类作用域不参与 LEGB，方法里访问类属性要 [[self.x]]。闭包捕获变量而不是值，循环里创建 lambda 要 [[i=i]] 固定当前值。[[map/filter]] 返回迭代器，[[functools.partial]] 固定参数，[[operator.itemgetter]] 替代取键 lambda。\n\n递归三件套：基线、递推、收敛；Python 不支持尾递归优化，深度大用迭代/显式栈。二分三件套：有序、区间定义一致、边界更新正确；递归版不要切片，否则 O(log n) 退化成 O(n)。检查点：[[x = x + 1]] 为什么可能 UnboundLocalError？闭包为什么在循环里都返回最后一个值？二分该用闭区间还是半开区间？`,
      code: String.raw`def outer():
    x = 1
    def inner():
        nonlocal x
        x += 1
        return x
    return inner

f = outer()
print(f(), f())

funcs = [lambda: i for i in range(3)]
print([g() for g in funcs])
funcs = [lambda i=i: i for i in range(3)]
print([g() for g in funcs])`,
      output: `2 3
[2, 2, 2]
[0, 1, 2]`,
      tip: `闭包捕获变量；循环结束后变量是最后一个值，所以所有 lambda 都看到它。用默认参数早期绑定。`
    }
  ],
  "ch7-1": [
    {
      h: "本章复盘：推导式、迭代器与生成器",
      p: `推导式是「表达式 + for + if」，一趟完成；多个 for 的顺序与书写一致，条件表达式和过滤条件位置不同，结果长度也不同。推导式有独立作用域，循环变量不泄漏；但第一个可迭代表达式在外层求值。列表推导式立即物化，生成器表达式惰性、只能消费一次。\n\n可迭代对象实现 [[__iter__]]，迭代器实现 [[__iter__]]/[[__next__]]；迭代器有状态、一次性、耗尽后持续 StopIteration。[[iter()]] 每次应返回新迭代器，除非对象本身设计成一次性。惰性求值把错误和副作用推迟到消费时；[[itertools]] 提供 count/cycle/islice/chain 等工具，无限迭代器不要直接 [[list()]]。\n\n生成器函数用 [[yield]] 暂停/恢复，[[send()]] 送值，[[throw()]] 送异常，[[close()]] 清理；第一次 send 必须 None。[[yield from]] 委托子生成器并接收返回值。生成器管道逐层处理，内存只保留当前元素；管道只消费一次，多个聚合要在一次遍历里完成。\n\n检查点：[[[x for x in xs if x]]] 和 [[[x if x else 0 for x in xs]]] 长度一样吗？生成器为什么第二次 [[list()]] 是空的？[[send(3)]] 第一次为什么报错？[[close()]] 会抛什么？这四题能答，推导式和生成器就不会用反。`,
      code: String.raw`g = (x * x for x in range(4))
print(list(g))
print(list(g))

from itertools import islice, count
print(list(islice(count(10), 3)))

def gen():
    yield 1
    yield 2
print(list(gen()))`,
      output: `[0, 1, 4, 9]
[]
[10, 11, 12]
[1, 2]`,
      tip: `生成器表达式只能消费一次；需要重复遍历就重新创建，或先 [[list()]] 物化（大文件不要物化）。`
    }
  ]
};

/* --- deep-review2.js --- */

window.PY_FOUNDATIONS_REVIEW2 = Object.assign(window.PY_FOUNDATIONS_REVIEW2 || {}, {
  "ch2-2": [
    {
      h: "术语卡：格式化与展示层",
      p: `术语卡一：格式说明符。写法是 [[[fill][align][sign][#][0][width][,][.precision][type]]]，但日常只需要记住四个旋钮：[[< > ^]] 管方向，数字管宽度，[[.2f]] 管精度，[[,]] 管千分位。[[f"{name:<8}"]] 是姓名左对齐占 8 格，[[f"{score:>8.2f}"]] 是分数右对齐保留两位。\n\n术语卡二：百分比。[[f"{ratio:.1%}"]] 会先把 ratio 乘 100 再加百分号；如果 ratio 已经是 87.3，应该写 [[f"{ratio:.1f}%"]]。百分比的分母为零要单独处理，返回「无数据」而不是 NaN。金额和比例不要混用同一个格式化函数，它们的精度和单位不同。\n\n术语卡三：动态宽度。[[f"{value:{width}.2f}"]] 的 width 是变量，只能嵌套一层；宽度必须是整数。动态格式适合终端宽度自适应，不适合用户可编辑模板。用户模板用 [[string.Template]] 或模板引擎，避免把用户输入当表达式执行。\n\n术语卡四：调试格式。[[f"{score=}"]] 输出 [[score=91]]，字符串会带引号；它适合调试，不适合用户日志。格式化是展示层：业务值先算对，再决定怎么显示。把业务逻辑塞进 f-string，短期省一行，长期没人敢改。检查点：百分比为什么不能重复乘 100？动态宽度能嵌套几层？[[f"{None}"]] 输出什么？`,
      code: String.raw`name, score, ratio = "林晓", 91.25, 0.873
print(f"|{name:<8}|{score:>8.2f}|")
print(f"{ratio:.1%}")
print(f"{score=}")
width = 8
print(f"{score:{width}.2f}")`,
      output: `|林晓      |   91.25|
87.3%
score=91.25
   91.25`,
      tip: `[[f"{score=}"]] 的等号格式只适合调试；它会输出变量名和 repr，不能直接放进用户报告。`
    }
  ],
  "ch3-2": [
    {
      h: "术语卡：排序与拷贝",
      p: `术语卡一：稳定排序。值相等的元素保持原相对顺序；[[sorted()]] 和 [[sort()]] 都是稳定的。稳定让多键排序可以分步做：先排次要键，再排主要键。但分步容易忘顺序，元组 key 更直观：[[key=lambda r: (r["class"], -r["score"], r["name"])]]。\n\n术语卡二：原地与新建。[[list.sort()]] 原地排序，返回 None；[[sorted()]] 返回新列表。[[a = a.sort()]] 会把 a 变成 None，是高频错误。[[reverse=True]] 会反转整个排序结果，包括次要键；需要「主键降序、次键升序」时，用负号或分步稳定排序。\n\n术语卡三：浅拷贝与深拷贝。[[b = a]] 是别名；[[b = a.copy()]]、[[b = a[:]]] 是浅拷贝，只复制外层；[[copy.deepcopy()]] 递归复制。浅拷贝对不可变元素足够，对嵌套列表/字典不够。深拷贝不复制文件句柄、连接、锁；包含这些资源的对象要自定义复制。\n\n术语卡四：排序键异常。key 返回类型必须一致；None 和数字不能比较；缺失字段会抛 KeyError。先清洗再排序，或给 key 一个业务上可解释的默认值。不要把「能跑」当成「排序正确」；同分、缺考、混合类型都要有测试用例。`,
      code: String.raw`records = [
    {"name": "林晓", "cls": "A", "score": 91},
    {"name": "陈默", "cls": "A", "score": 88},
]
print(sorted(records, key=lambda r: (r["cls"], -r["score"], r["name"])))

a = [[1], [2]]
b = a[:]
b[0].append(9)
print(a, b)

import copy
c = copy.deepcopy(a)
c[0].append(8)
print(a, c)`,
      output: `[{'name': '林晓', 'cls': 'A', 'score': 91}, {'name': '陈默', 'cls': 'A', 'score': 88}]
[[1, 9], [2]] [[1, 9], [2]]
[[1, 9], [2]] [[1, 9, 8], [2]]`,
      tip: `[[reverse=True]] 会把次要键也反转；要「主降次升」，用元组 key 的负号，或分步稳定排序。`
    }
  ],
  "ch4-2": [
    {
      h: "术语卡：嵌套数据建模",
      p: `术语卡一：记录与索引。记录是「一条数据有哪些字段」，索引是「按什么键快速找」。list of dicts 保顺序，dict of dicts 保查询；两者可以共存，不要为了唯一结构牺牲操作效率。索引的键要稳定：学号适合，姓名会重名，id() 只在进程内有效。\n\n术语卡二：缺失值。空字符串、None、0 是三件事。成绩缺考用 None，0 是合法分数；配置缺失可以用 None，但展示层要转成「未配置」。不要用 [[or 0]] 把 None 静默变成 0，除非业务明确「缺失等于 0」。\n\n术语卡三：默认工厂。[[defaultdict(list)]] 在访问缺失键时创建空列表；工厂必须每次返回新对象。[[defaultdict(defaultdict(list))]] 会让所有键共享同一个内层字典，正确写法是 [[defaultdict(lambda: defaultdict(list))]]。[[setdefault(k, [])]] 每次调用都会先创建一个新列表，键存在时这次创建白做。\n\n术语卡四：浅合并与深合并。[[{**a, **b}]] 只替换顶层键，子字典整个被覆盖；深合并要递归，且要明确数组语义（替换、追加、按 id 合并）。JSON 往返不是通用深拷贝：元组变列表、日期变字符串、整数键变字符串。检查点：为什么 [[defaultdict(list)]] 不能写成 [[defaultdict([])]]？合并嵌套字典时 b 的子字典会保留 a 的其他字段吗？`,
      code: String.raw`from collections import defaultdict

a = {"scores": {"python": 91, "math": 88}, "name": "林晓"}
b = {"scores": {"python": 95}}
print({**a, **b})

nested = defaultdict(lambda: defaultdict(list))
nested["A"]["python"].append(91)
print({k: dict(v) for k, v in nested.items()})

import copy
deep = copy.deepcopy(a)
deep["scores"]["python"] = 99
print(a["scores"], deep["scores"])`,
      output: `{'scores': {'python': 95}, 'name': '林晓'}
{'A': {'python': [91]}}
{'python': 91, 'math': 88} {'python': 99, 'math': 88}`,
      tip: `[[dict.get("a", {}).get("b")]] 在 a 存在但值为 None 时会抛 AttributeError；多层读取要逐层判断类型。`
    }
  ],
  "ch6-2": [
    {
      h: "术语卡：作用域与闭包",
      p: `术语卡一：LEGB。Local、Enclosing、Global、Builtins 四层查找。函数内赋值让名字成为局部变量，除非声明 [[global]]/[[nonlocal]]；判断发生在编译期，所以 [[x = x + 1]] 可能 UnboundLocalError。类作用域不参与 LEGB，方法里访问类属性要 [[self.x]]。\n\n术语卡二：闭包。函数记住外层变量（单元格），不是记住当时的值。外层变量后来变了，闭包看到新值；循环里创建的 lambda 全部共享循环变量，所以都返回最后一个值。需要固定当前值，用默认参数 [[lambda i=i: ...]] 或 [[functools.partial]]。\n\n术语卡三：nonlocal 与 global。[[nonlocal]] 改外层函数变量，[[global]] 改模块变量。只读全局不需要 global；只有重新绑定才声明。[[nonlocal]] 不能指向模块，外层没有同名变量会 SyntaxError。闭包会延长外层变量生命周期，捕获大对象可能造成内存滞留。\n\n术语卡四：高阶函数。[[map/filter]] 返回迭代器，[[reduce]] 累积，[[partial]] 固定参数，[[itemgetter]]/[[attrgetter]] 替代 lambda。短键优先用标准库，复杂逻辑用 def；lambda 只能写一个表达式，不能包含语句。检查点：循环里 lambda 为什么都返回 2？[[nonlocal]] 和 [[global]] 各改哪一层？类作用域为什么不参与 LEGB？`,
      code: String.raw`x = "global"

def outer():
    x = "outer"
    def inner():
        nonlocal x
        x = "inner"
    inner()
    return x

print(outer(), x)
funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])
funcs = [lambda i=i: i for i in range(3)]
print([f() for f in funcs])`,
      output: `inner global
[2, 2, 2]
[0, 1, 2]`,
      tip: `闭包捕获变量而不是值；要固定当前值，用默认参数 [[i=i]] 或 [[functools.partial]]。`
    }
  ]
});

/* --- deep8.js --- */

window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch8-1": [
    {
      h: "深读：延迟导入不是偷懒，是控制启动成本",
      p: `大型项目启动慢，常见原因不是代码多，而是入口模块把重依赖全导入了。比如 CLI 只是打印帮助，却先导入了 pandas、torch、数据库驱动。Python 的 import 是同步的，导入期间会执行模块顶层代码，所以「没用到的功能」也会付出代价。

延迟导入的做法是在函数内部 [[import]]。第一次调用时才加载，后续调用走 [[sys.modules]] 缓存。适合「可选功能」「平台专用模块」「启动时不需要的重依赖」。不适合高频调用的小模块，因为每次函数调用都要做一次字典查找和名字绑定，虽然开销小，但没必要。

延迟导入还会改变错误出现的位置：模块缺失不再在启动时炸，而是在功能被调用时炸。这可以是优点（CLI 其他命令仍可用），也可以是缺点（部署漏装依赖直到用户点击才暴露）。所以要在启动时做一次「依赖自检」，或者提供 [[doctor]] 命令。`,
      code: String.raw`def export_report(records, path):
    import csv
    from pathlib import Path
    with Path(path).open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=["name", "score"])
        writer.writeheader()
        writer.writerows(records)

print("入口已加载")
export_report([{"name": "林晓", "score": 91}], "out.csv")`,
      output: `入口已加载`,
      tip: `延迟导入适合可选/重依赖；要在启动时另做依赖自检，别把「缺包」拖到用户点击才报。`
    },
    {
      h: "深读：模块级可变状态如何污染测试",
      p: `模块级列表、字典、缓存会在同一进程的所有调用之间共享。测试 A 往里加数据，测试 B 读到脏状态；测试顺序一变，结果就变。这类 bug 在单独跑测试时常常不出现，在完整套件里才出现。

处理方式有三种：第一，不在模块级保存可变状态，改成函数参数或类实例；第二，提供 [[reset()]] 并在测试 fixture 里调用；第三，用不可变结构，每次返回新对象。最推荐第一种，因为它从根上消除共享。

如果确实需要进程级缓存，要明确键空间、失效策略和线程安全。[[functools.lru_cache]] 是线程安全的，但它缓存的是函数参数到返回值，不会自动感知外部数据变化；数据更新后要 [[cache_clear()]]。`,
      code: String.raw`cache = {}

def score(name, value=None):
    if value is not None:
        cache[name] = value
    return cache.get(name)

def reset():
    cache.clear()

score("林晓", 91)
print(score("林晓"))
reset()
print(score("林晓"))`,
      output: `91
None`,
      tip: `模块级缓存要提供 [[reset()]] 或明确的失效入口；测试之间不复位，顺序依赖就会出现。`
    },
    {
      h: "深读：python -m 与直接运行，路径到底差在哪",
      p: `直接运行 [[python scores/report.py]] 时，[[sys.path[0]]] 是 [[scores/]] 目录，[[__package__]] 是 [[None]]，相对导入无法工作。用 [[python -m scores.report]] 时，[[sys.path[0]]] 是当前目录，模块以包内身份加载，[[__package__]] 是 [["scores"]]，相对导入正常。

这个差异还会影响「导入到哪一份代码」。如果项目根和 [[scores/]] 下都有 [[parse.py]]，直接运行可能导入 [[scores/parse.py]]，[[-m]] 运行可能导入根目录的 [[parse.py]]，取决于路径顺序。别用同名文件测试自己的导入直觉。

部署时也常见：systemd/容器里 [[WorkingDirectory]] 没设对，[[python -m]] 找不到包。把工作目录和 [[PYTHONPATH]] 写进启动脚本，别依赖「我本地是这样跑的」。`,
      code: String.raw`# scores/report.py
import sys
print("__package__ =", __package__)
print("sys.path[0] =", sys.path[0])

# 两种运行方式输出不同：
# python scores/report.py
# __package__ = None
# sys.path[0] = /path/to/project/scores
#
# python -m scores.report
# __package__ = scores
# sys.path[0] = /path/to/project`,
      output: `__package__ = scores
sys.path[0] = /path/to/project`,
      tip: `包内代码统一用 [[python -m]] 运行；[[__package__]] 为 [[None]] 时，相对导入一定失败。`
    }
  ],
  "ch8-2": [
    {
      h: "深读：把包拆成 core / io / cli 三层",
      p: `一个可维护的包通常分三层：[[core]] 放纯业务规则，不碰文件、网络、终端；[[io]] 负责读写外部格式；[[cli]] 负责参数解析和输出。依赖方向只能是 cli → io → core，core 不能反向依赖 io 或 cli。

这样拆的好处是测试容易：core 用普通数据测试，不需要临时文件；io 用内存字符串或临时目录测试；cli 只测参数映射和退出码。把「解析 CSV」和「计算平均分」混在一个函数里，测试就必须造文件，慢且脆。

拆分时不要按「文件类型」机械切，而按「谁需要知道什么」。core 不知道 CSV，io 不知道终端宽度，cli 不知道数据库表结构。每一层只暴露少量函数。`,
      code: String.raw`# scores/core.py
def average(scores):
    if not scores:
        raise ValueError("scores 不能为空")
    return sum(scores) / len(scores)

# scores/io.py
import csv

def read_scores(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        return [{"name": r["name"], "scores": [float(x) for x in r["scores"].split("|")]}
                for r in csv.DictReader(f)]

# scores/cli.py
from .core import average
from .io import read_scores

def main(path):
    for row in read_scores(path):
        print(row["name"], f"{average(row['scores']):.1f}")`,
      output: `林晓 86.2`,
      tip: `依赖方向固定为 cli → io → core；core 里出现 [[open()]] 或 [[print()]]，说明层混了。`
    },
    {
      h: "深读：循环依赖重构，不是把 import 往下挪",
      p: `把 [[import]] 挪进函数能缓解循环，但依赖关系仍然存在，只是从「导入时爆炸」变成「调用时爆炸」。真正的重构是找出两个模块共享的概念，抽到第三层。

例如 [[scores.parse]] 需要 [[ScoreError]]，[[scores.report]] 也需要 [[ScoreError]]，而 [[ScoreError]] 又引用了 [[Score]] 的字段。把 [[Score]] 和 [[ScoreError]] 抽到 [[scores.model]]，parse 和 report 都依赖 model，model 不依赖任何业务模块，循环就消失了。

重构后画一张依赖图：箭头从上层指向底层，不能有环。图里有环，说明概念边界还没找对，不是 import 顺序问题。`,
      code: String.raw`# scores/model.py
from dataclasses import dataclass

@dataclass(frozen=True)
class Score:
    name: str
    value: float

class ScoreError(Exception):
    pass

# scores/parse.py
from .model import Score, ScoreError

# scores/report.py
from .model import Score

# model 不导入 parse/report，依赖图无环`,
      output: `scores.model
scores.parse -> scores.model
scores.report -> scores.model`,
      tip: `循环依赖的根治是抽公共模型层；把 import 挪进函数只是把问题延后。`
    },
    {
      h: "深读：importlib.metadata 查看已安装包",
      p: `[[importlib.metadata]] 能读取已安装分发的元数据：版本、入口点、依赖、文件列表。它查的是「安装了什么」，不是「导入了什么」，所以可以用来做 [[doctor]] 命令或插件发现。

[[version("requests")]] 读版本；[[entry_points(group="console_scripts")]] 列出命令行入口；[[requires("scores")]] 读依赖声明。注意分发名和导入名可能不同：[[Pillow]] 安装后导入 [[PIL]]，[[beautifulsoup4]] 导入 [[bs4]]。

插件系统常用 entry points：第三方包在自己的 [[pyproject.toml]] 里声明 [[[project.entry-points."scores.plugins"]]]，主程序运行时枚举并加载，不需要硬编码 import 列表。`,
      code: String.raw`from importlib.metadata import version, entry_points, requires

print(version("pip"))
print([ep.name for ep in entry_points(group="console_scripts")][:5])
print(requires("pip")[:2])`,
      output: `25.2
['pip', 'pip3', ...]
['wheel', 'setuptools']`,
      tip: `[[version("Pillow")]] 用分发名；[[import PIL]] 用导入名。两者不能混。`
    }
  ],
  "ch8-3": [
    {
      h: "深读：requirements、lock、constraints 各管什么",
      p: `[[requirements.txt]] 通常写直接依赖和宽松范围；[[requirements.lock]] 写完整解析结果和精确版本；[[constraints.txt]] 只限制版本，不主动安装。三者用途不同，混在一起会让「为什么装了这个版本」无法回答。

推荐流程：在 [[requirements.in]] 写直接依赖，用 [[pip-compile]] 生成带哈希的 lock；部署只装 lock。没有 pip-tools 时，[[pip freeze]] 也能生成 lock，但它把当前环境所有包都写进去，可能包含无关包。

[[constraints.txt]] 适合企业统一版本基线：[[pip install -r requirements.txt -c constraints.txt]]，constraints 只约束、不引入。不要把 constraints 当依赖清单，否则会装出一堆没用的包。`,
      code: String.raw`# requirements.in
requests>=2.28
flask

# 生成 lock（需要 pip-tools）
# pip-compile requirements.in -o requirements.lock

# 安装时加约束
# pip install -r requirements.lock -c constraints.txt

# constraints.txt
urllib3<2.3`,
      output: `Successfully installed Flask-3.1.0 requests-2.32.3 urllib3-2.2.3`,
      tip: `lock 锁定完整解析，constraints 只限制不引入；别把 constraints 当归档清单。`
    },
    {
      h: "深读：pip 缓存、wheel 与离线安装",
      p: `pip 下载的包会进本地缓存，重复安装通常不再联网。[[pip cache dir]] 看位置，[[pip cache list]] 看内容，[[pip cache purge]] 清理。CI 里缓存这个目录能显著加速。

wheel 是预编译包，安装快；sdist 是源码包，安装时可能触发编译，需要编译器。[[pip download -r requirements.txt -d wheels/]] 可以把依赖全部下载成 wheel，拷贝到离线机器后用 [[pip install --no-index --find-links wheels/ -r requirements.txt]] 安装。

跨平台注意：wheel 带平台标签，macOS 下载的 [[numpy]] wheel 不能给 Linux 用。离线包要为目标平台准备，或者用纯 Python wheel/源码包。`,
      code: String.raw`python -m pip cache dir
python -m pip download -r requirements.lock -d wheels/
# 离线安装
python -m pip install --no-index --find-links wheels/ -r requirements.lock
python -m pip check`,
      output: `No broken requirements found.`,
      tip: `[[pip download]] 要按目标平台下载；带 C 扩展的 wheel 不能跨操作系统混用。`
    },
    {
      h: "深读：requires-python 与实际解释器",
      p: `[[requires-python = ">=3.11"]] 是包对解释器的最低要求，pip 会据此拒绝不兼容的版本。它不保证你的代码在 3.11 上真的能跑，只保证元数据声明。类型语法 [[list[str]]]、[[X | Y]]、[[match]] 都有版本门槛。

项目里要同时锁「运行时版本」和「依赖版本」。只锁依赖不锁 Python，换一台机器用 3.9 跑，可能在导入时就 SyntaxError。[[.python-version]]（pyenv）、[[runtime.txt]]（部分平台）、Docker 基础镜像都是锁解释器的方式。

[[python -VV]] 看完整版本和编译信息；[[sys.version_info]] 在代码里做运行时判断。不要在运行时用 [[sys.version_info]] 分支掩盖「本该在元数据里声明」的兼容问题。`,
      code: String.raw`import sys
print(sys.version)
print(sys.version_info[:3])
print(sys.implementation.name)

# pyproject.toml
# requires-python = ">=3.11"`,
      output: `3.13.18 (main, ...)
(3, 13, 18)
cpython`,
      tip: `[[requires-python]] 是元数据门槛；真正兼容性还要在目标版本上跑测试。`
    }
  ],
  "ch8-review": [
    {
      h: "本章复盘：导入、包与环境的三条线",
      p: `这一章看起来讲了三件不相关的事：import、包结构、venv。它们其实是一条线：**名字如何被找到，代码如何被组织，环境如何被复现**。导入问题往往不是语法，而是路径、命名或依赖方向错了；包结构问题往往不是目录丑，而是公开 API 和依赖边界不清；环境问题往往不是 pip 难用，而是没有锁版本。

把这三条线各留一个检查点：导入时打印 [[__file__]] 确认来源；包入口只暴露少量公开名字；部署只装 lock 并跑 [[pip check]]。三件事都做到，项目就从「能跑」变成「别人也能跑」。

本章最常见的五个坑：同名模块遮蔽标准库、循环导入、直接运行包内文件、把虚拟环境提交到 Git、依赖冲突时盲目升级。遇到其中任何一个，先回到「路径/边界/版本」三问，不要先改代码。`,
      code: String.raw`# 一分钟自检
import sys, importlib.metadata as md
from pathlib import Path

print("python:", sys.version.split()[0])
print("cwd:", Path.cwd())
print("path0:", sys.path[0])
print("requests:", md.version("requests"))`,
      output: `python: 3.13.18
cwd: /path/to/project
path0: /path/to/project
requests: 2.32.3`,
      tip: `本章验收不是「能 import」，而是「换目录、换机器、换环境后仍能解释为什么」。`
    }
  ]
});

/* --- deep9.js --- */

window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch9-1": [
    {
      h: "深读：大文件分块读，不要把内存当无底洞",
      p: `[[read()]] 会把整个文件变成字符串或字节，文件多大就占多大内存，还要加上解码后的副本。处理 1 GB 日志时，[[read()]] 很可能直接 [[MemoryError]]。逐行迭代是流式的，但「一行」本身也可能极大，例如没有换行的 JSON 或二进制日志。

分块读用 [[read(size)]] 循环，配合 [[iter(lambda: f.read(64 * 1024), b"")]]。文本模式按字符读，二进制模式按字节读；二进制更可控。分块后要自己处理跨块边界，例如一个单词被切成两半。

判断策略：小文件（<10 MB）可以一次读；中大文件逐行；超大或二进制文件分块。永远不要用「先读进来看看多大」来拖延，[[stat().st_size]] 就能看大小。`,
      code: String.raw`from pathlib import Path

p = Path("big.log")
p.write_bytes(b"line1\nline2\nline3\n")

with p.open("rb") as f:
    for chunk in iter(lambda: f.read(4), b""):
        print(repr(chunk))`,
      output: `b'line'
b'1\\nl'
b'ine2'
b'\\nli'
b'ne3\\n'`,
      tip: `[[iter(lambda: f.read(n), b"")]] 是标准分块写法；文本模式要处理跨块的行边界，二进制更简单。`
    },
    {
      h: "深读：临时文件、临时目录与清理",
      p: `[[tempfile.TemporaryFile]] 创建匿名临时文件，关闭即删除；[[NamedTemporaryFile]] 有名字，适合需要传给外部命令的场景；[[TemporaryDirectory]] 创建临时目录，with 退出时递归删除。它们默认放在系统临时目录，也可以用 [[dir=]] 指定同盘目录。

临时文件不是「一定安全」。在多进程/多用户环境里，[[NamedTemporaryFile]] 默认 [[delete=True]]，Windows 上关闭前别人打不开；需要跨进程共享时用 [[delete=False]]，并自己负责清理。文件名用 [[tempfile.mkstemp]] 生成，避免可预测名称。

「写临时文件再原子替换」是数据导入的常用模式：解析到临时文件，校验通过后 [[os.replace]] 到目标。中途失败不会破坏旧数据。`,
      code: String.raw`import tempfile, os, json
from pathlib import Path

with tempfile.TemporaryDirectory() as td:
    tmp = Path(td) / "part.json"
    tmp.write_text(json.dumps({"ok": True}), encoding="utf-8")
    print(tmp.exists())
    target = Path("result.json")
    os.replace(tmp, target)
print(target.read_text(encoding="utf-8"))
target.unlink()`,
      output: `True
{"ok": true}`,
      tip: `[[TemporaryDirectory]] 退出时递归删除；跨进程共享的临时文件要 [[delete=False]] 并自己清理。`
    },
    {
      h: "深读：并发写文件与文件锁",
      p: `多个进程同时 [[open(path, "a")]] 写，单行不保证原子；两个进程可能交错写入，日志出现半行。[[os.write]] 对同一文件描述符的写入是原子的（受块大小限制），但 Python 的文本层有缓冲，不能直接依赖。

简单方案是「一个进程写、其他进程发消息」；复杂方案用文件锁（[[fcntl.flock]]、[[msvcrt.locking]]）或数据库。文件锁是咨询锁，不阻止不遵守锁的程序；跨平台行为也不同。日志场景直接用 [[logging.handlers.QueueHandler]] 或系统日志，不要自己写锁。

业务数据不要用「追加 JSON 行」当数据库；并发更新需要事务，交给 SQLite 或真正的数据库。`,
      code: String.raw`import fcntl

with open("shared.log", "a", encoding="utf-8") as f:
    fcntl.flock(f.fileno(), fcntl.LOCK_EX)
    try:
        f.write("one complete line\n")
        f.flush()
    finally:
        fcntl.flock(f.fileno(), fcntl.LOCK_UN)`,
      output: `one complete line`,
      tip: `[[fcntl]] 只在 Unix；Windows 用 [[msvcrt]]。文件锁是协作式的，不阻止不遵守锁的进程。`
    }
  ],
  "ch9-2": [
    {
      h: "深读：CSV 方言、分隔符与 Excel 兼容",
      p: `CSV 没有唯一标准。分隔符可能是逗号、分号、制表符；引号规则、换行、转义都可能不同。[[csv.Sniffer]] 可以猜方言，但猜错会静默错列，生产导入应让用户显式指定或提供预览。

Excel 在中文环境常导出 GBK 编码、分号分隔、带 BOM 的 CSV；[[csv.reader]] 默认逗号。读之前先看前 2 KB 的 [[repr]]，确认分隔符和编码，再决定 [[delimiter]]、[[quotechar]]、[[encoding]]。

写出 Excel 能直接打开的 UTF-8 CSV，建议 [[encoding="utf-8-sig"]]，否则 Excel 可能把中文显示成乱码。[[lineterminator="\n"]] 可以避免 Windows 双换行，但 Excel 对 [[\n]] 也能识别。`,
      code: String.raw`import csv, io

text = "name;score\n林晓;91\n周宁;86\n"
reader = csv.reader(io.StringIO(text), delimiter=";")
for row in reader:
    print(row)

print(csv.Sniffer().sniff(text).delimiter)`,
      output: `['name', 'score']
['林晓', '91']
['周宁', '86']
;`,
      tip: `[[Sniffer]] 只是猜测；生产导入让用户确认分隔符/编码，别把猜错当成功。`
    },
    {
      h: "深读：JSON 自定义编码器与默认值",
      p: `[[json.dumps]] 遇到 [[datetime]]、[[Decimal]]、[[Path]]、[[set]] 会抛 [[TypeError]]。可以给 [[default=]] 传一个函数，把不认识的对象转成可序列化值；[[cls=]] 继承 [[JSONEncoder]] 适合更复杂的策略。

[[default]] 只处理「无法序列化」的对象，不处理键。字典键必须是 str/int/float/bool/None；[[Path]] 当键会直接报错。需要非字符串键，先转成字符串并约定还原规则。

反序列化没有 [[object_hook]] 的强类型还原；[[object_hook]] 可以把 dict 转成自定义对象，但它会对每个对象调用，性能有成本。更推荐在应用层显式转换，保持 JSON 层简单。`,
      code: String.raw`import json
from datetime import datetime
from decimal import Decimal

def encode(obj):
    if isinstance(obj, datetime):
        return {"__type__": "datetime", "value": obj.isoformat()}
    if isinstance(obj, Decimal):
        return str(obj)
    raise TypeError(type(obj).__name__)

text = json.dumps({"when": datetime(2026, 11, 24), "price": Decimal("19.90")}, default=encode)
print(text)
print(json.loads(text))`,
      output: `{"when": {"__type__": "datetime", "value": "2026-11-24T00:00:00"}, "price": "19.90"}
{'when': {'__type__': 'datetime', 'value': '2026-11-24T00:00:00'}, 'price': '19.90'}`,
      tip: `[[default=]] 处理值，不处理键；自定义类型用带类型标记的对象，读回时显式还原。`
    },
    {
      h: "深读：JSON Schema 与外部数据校验",
      p: `[[json.loads]] 只保证语法合法，不保证字段存在、类型正确、范围合理。外部 API 返回 [[{"score": "abc"}]] 也能解析成功，错误要到计算时才爆。JSON Schema 用一份声明描述结构，工具（如 [[jsonschema]]）负责校验。

没有第三方库时，可以写一个最小校验函数：检查必需键、类型、范围、枚举，收集所有错误而不是遇到第一个就抛。校验失败要返回结构化错误，带上字段路径和实际值。

不要把「能 [[json.loads]]」当成「数据可用」。语法、结构、业务规则是三层，越早校验越省排错。`,
      code: String.raw`def validate_score(obj):
    errors = []
    if not isinstance(obj, dict):
        return ["根节点必须是对象"]
    if not isinstance(obj.get("name"), str) or not obj["name"].strip():
        errors.append("name 必须是非空字符串")
    score = obj.get("score")
    if not isinstance(score, (int, float)) or isinstance(score, bool):
        errors.append("score 必须是数字")
    elif not 0 <= score <= 100:
        errors.append("score 必须在 0..100")
    return errors

print(validate_score({"name": "林晓", "score": 91}))
print(validate_score({"name": "", "score": "abc"}))`,
      output: `[]
['name 必须是非空字符串', 'score 必须是数字']`,
      tip: `校验要收集全部错误，不要遇到第一个就返回；字段路径和实际值一起返回，调用方才能修。`
    }
  ],
  "ch9-3": [
    {
      h: "深读：ExceptionGroup 与 except*",
      p: `Python 3.11 引入 [[ExceptionGroup]]，用来同时表达多个独立异常。批量处理时，你可能希望「所有坏行都报出来」，而不是遇到第一个就停。[[ExceptionGroup("bad rows", [err1, err2])]] 可以一次抛出多个；[[except* ValueError as eg]] 按类型拆分处理。

[[except*]] 只能捕获 [[ExceptionGroup]] 中的子组，不能和普通 [[except]] 混在同一个 try。它的 [[eg.exceptions]] 是拆出的子异常元组，处理完还可以继续传播未匹配的部分。

不要为了用新语法而用；只有当「多个错误需要一起报告」时才有价值。单条失败仍用普通异常。`,
      code: String.raw`errors = [ValueError("bad score"), TypeError("bad name")]

try:
    raise ExceptionGroup("导入失败", errors)
except* ValueError as eg:
    print("value errors:", [str(e) for e in eg.exceptions])
except* TypeError as eg:
    print("type errors:", [str(e) for e in eg.exceptions])`,
      output: `value errors: ['bad score']
type errors: ['bad name']`,
      tip: `[[except*]] 处理异常组；普通 [[except]] 不能和它混用。多个错误一起报时才值得用。`
    },
    {
      h: "深读：重试、退避与「不要重试所有错误」",
      p: `网络请求失败可以重试，但参数错误、认证失败、404 重试没有意义。重试策略要先分类：瞬时错误（超时、连接重置、429）可以重试；永久错误（400、401、404）直接失败。

退避用指数加随机抖动，避免大量客户端同时重试压垮服务。重试次数要有上限，并且记录每次失败原因。没有超时的请求不要重试，因为它可能永远挂着。

[[urllib]] 标准库没有内置重试；[[requests]] 可以用 [[HTTPAdapter]] + [[Retry]]；[[httpx]] 有 transport retries。自己写循环时，确保每次重试使用新的请求对象/连接。`,
      code: String.raw`import time, random

def retry(fn, attempts=3, base=0.2):
    last = None
    for i in range(attempts):
        try:
            return fn()
        except (TimeoutError, ConnectionError) as err:
            last = err
            sleep = base * (2 ** i) + random.random() * 0.05
            print(f"retry {i + 1} after {sleep:.2f}s")
            time.sleep(sleep)
    raise last

def flaky():
    if random.random() < 0.5:
        raise TimeoutError("timeout")
    return "ok"

print(retry(flaky))`,
      output: `retry 1 after 0.24s
ok`,
      tip: `只重试瞬时错误；指数退避加抖动，次数有上限，并记录每次原因。`
    },
    {
      h: "深读：上下文管理器吞异常，什么时候是陷阱",
      p: `[[__exit__(exc_type, exc, tb)]] 返回 [[True]] 会吞掉异常。[[contextlib.suppress(FileNotFoundError)]] 就是故意吞掉指定异常；这是明确意图。陷阱在于自定义 [[__exit__]] 无条件 [[return True]]，导致所有异常消失，调用方以为成功。

只有在「异常是可预期的、且清理后可以安全继续」时才吞。比如删除临时文件时的 [[FileNotFoundError]] 可以 suppress；数据库写入失败不能吞。吞异常时最好记录日志。

[[contextlib.ExitStack]] 可以动态管理多个资源，适合「不确定打开几个文件」的场景；它按后进先出顺序关闭，任何一个关闭失败都会传播。`,
      code: String.raw`from contextlib import suppress

with suppress(FileNotFoundError):
    open("not-there.txt", encoding="utf-8").read()

print("继续执行")

class Bad:
    def __enter__(self): return self
    def __exit__(self, *exc): return True

with Bad():
    raise ValueError("会被吞掉")
print("异常消失了")`,
      output: `继续执行
异常消失了`,
      tip: `[[__exit__]] 返回 True 会吞异常；只对明确可忽略的异常使用 [[suppress]]，不要无条件吞。`
    }
  ],
  "ch9-4": [
    {
      h: "深读：用 dictConfig 管住日志配置",
      p: `[[logging.basicConfig]] 只适合小脚本；多模块、多 handler、按级别分流时，用 [[logging.config.dictConfig]]。它可以用一份字典描述 formatters、handlers、loggers，并从 YAML/JSON 加载。

配置要点：给 logger 设 [[propagate=False]] 避免重复输出；handler 设 level 做分流（控制台 INFO、文件 DEBUG）；formatter 带 [[%(name)s]] 和 [[%(lineno)d]]；根 logger 只做兜底。

配置应该在应用入口执行一次。库代码不要读配置文件，也不要假设根 logger 的 handler。测试时可以用 [[caplog]] 捕获日志，不要依赖控制台输出。`,
      code: String.raw`import logging.config

config = {
    "version": 1,
    "formatters": {"std": {"format": "%(levelname)s %(name)s: %(message)s"}},
    "handlers": {"console": {"class": "logging.StreamHandler", "formatter": "std", "level": "INFO"}},
    "loggers": {"scores": {"handlers": ["console"], "level": "DEBUG", "propagate": False}},
}
logging.config.dictConfig(config)
log = logging.getLogger("scores")
log.debug("细节")
log.info("正常")`,
      output: `INFO scores: 正常`,
      tip: `logger 设 [[propagate=False]] 防止重复输出；handler 的 level 和 logger 的 level 是两道闸。`
    },
    {
      h: "深读：结构化日志，让机器也能读",
      p: `纯文本日志适合人看，不适合聚合查询。结构化日志把字段写成 JSON：时间、级别、logger、消息、请求 id、耗时、记录数。这样 ELK/Loki 可以按字段过滤，不用正则解析。

标准库没有内置 JSON formatter，可以自己写一个 [[logging.Formatter]] 子类，在 [[format]] 里 [[json.dumps]]。异常信息放 [[exc_info]] 字段，不要塞进 message。注意不要把密钥、token、完整身份证写进日志。

结构化不等于每行都 JSON；本地开发用可读文本，生产用 JSON 是常见组合。关键是字段名稳定。`,
      code: String.raw`import json, logging

class JsonFormatter(logging.Formatter):
    def format(self, record):
        data = {
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "time": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
        }
        if record.exc_info:
            data["exc"] = self.formatException(record.exc_info)
        return json.dumps(data, ensure_ascii=False)

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
log = logging.getLogger("scores")
log.addHandler(handler)
log.setLevel(logging.INFO)
log.info("导入完成 rows=%s", 2)`,
      output: `{"level": "INFO", "logger": "scores", "message": "导入完成 rows=2", "time": "2026-11-24T10:00:00"}`,
      tip: `结构化日志字段名要稳定；异常放独立字段，别把 traceback 拼进 message。`
    },
    {
      h: "深读：一次真实性能排查的顺序",
      p: `性能问题先问三个问题：慢在启动、慢在单次请求、慢在批量任务？启动慢多半是导入重依赖；单次请求慢看数据库/网络；批量慢看循环里的 IO 和重复计算。

用 [[cProfile]] 找累计耗时最大的函数，用 [[line_profiler]] 看单函数内哪一行，用 [[py-spy]] 采样线上进程（不需要重启）。不要一上来就换语言/加缓存，先确认瓶颈。

常见修复：把循环内查询改成批量查询；把重复 [[re.compile]] 提到模块级；用生成器代替大列表；用 [[join]] 代替字符串 [[+=]]；给数据库加索引；减少序列化层数。`,
      code: String.raw`import cProfile, pstats, io

def slow():
    return sum(len(str(i)) for i in range(200_000))

pr = cProfile.Profile()
pr.enable()
slow()
pr.disable()
out = io.StringIO()
pstats.Stats(pr, stream=out).sort_stats("cumulative").print_stats(5)
print(out.getvalue().splitlines()[:3])`,
      output: `         5 function calls in 0.045 seconds
   Ordered by: cumulative time
   ncalls  tottime  percall  cumtime  percall filename:lineno(function)`,
      tip: `先测量再优化；[[cProfile]] 看函数累计，[[py-spy]] 看线上采样，别凭感觉换实现。`
    }
  ],
  "ch9-review": [
    {
      h: "本章复盘：数据链路的五个关卡",
      p: `这一章把「读文件」拆成了五个关卡：路径、编码、格式、异常、可观测性。任何一关出错，最后的数据都可能「看起来对、实际错」。路径错会读错文件；编码错会乱码或 BOM 进字段；格式错会把引号内逗号切开；异常处理错会静默丢行；没有日志则无法知道丢了多少。

一个合格的导入器应该同时输出：成功记录、失败记录（行号+原因）、总数、耗时。不要只打印「导入完成」。失败记录不是垃圾，它是下一次修复的输入。

本章验收：拿一份带 BOM、空行、坏行、字段内逗号的 CSV，写一个脚本输出 [[good.jsonl]]、[[bad.jsonl]] 和一行统计日志；换目录运行、换 Python 版本运行，结果一致。`,
      code: String.raw`# 目标产物
# data/good.jsonl
# data/bad.jsonl
# 日志：total=3 ok=2 bad=1 elapsed=0.012s

from pathlib import Path
print(Path("data/good.jsonl").exists(), Path("data/bad.jsonl").exists())`,
      output: `True True`,
      tip: `导入器的交付物不是「跑完」，而是「可核对的好/坏两份结果 + 统计」。`
    }
  ]
});

/* --- deep10.js --- */

window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch10-1": [
    {
      h: "深读：__slots__ 省内存，也限制动态属性",
      p: `默认实例把属性放在 [[__dict__]]，每个对象一个字典，灵活但占内存。[[__slots__ = ("name", "scores")]] 让实例用固定槽位存储，不能随便加新属性，内存更小、访问略快。适合大量小对象，例如几十万条成绩记录。

代价：不能动态加字段；继承时子类要重新声明 slots；和 [[__dict__]] 混用会失去省内存的意义。dataclass 可以用 [[slots=True]]（Python 3.10+）自动生成 slots。

不要为了「优化」给所有类加 slots。对象数量少时，省下的内存可以忽略；动态属性、调试、序列化反而更麻烦。先测量对象数量，再决定。`,
      code: String.raw`class Point:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x = x
        self.y = y

p = Point(1, 2)
print(p.x, p.y)
try:
    p.z = 3
except AttributeError as err:
    print(type(err).__name__, err)`,
      output: `1 2
AttributeError 'Point' object has no attribute 'z'`,
      tip: `[[__slots__]] 适合海量小对象；会禁止动态属性，继承和序列化都要重新检查。`
    },
    {
      h: "深读：单下划线与双下划线不是访问控制",
      p: `[[_name]] 是「内部使用」的约定，[[__name]] 会触发名称改写（name mangling），在类 [[Swimmer]] 里变成 [[_Swimmer__name]]。它不是为了安全，而是为了避免子类意外覆盖。

Python 没有真正的 private。任何人都能用 [[obj._Swimmer__name]] 访问；[[__slots__]] 也不阻止。把「私有」当安全边界会写错架构；它只是团队契约。

真正需要保护的不变量，应该通过方法校验，而不是靠命名隐藏。例如分数范围在 [[add()]] 里检查，而不是把 [[scores]] 改名。`,
      code: String.raw`class Swimmer:
    def __init__(self):
        self._team = "海豚队"
        self.__secret = "x"

s = Swimmer()
print(s._team)
print(s.__dict__)
print(s._Swimmer__secret)`,
      output: `海豚队
{'_team': '海豚队', '_Swimmer__secret': 'x'}
x`,
          tip: `[[__name]] 只是改名，不是加密；不变量靠方法校验，不靠命名隐藏。`
    },
    {
      h: "深读：dataclass 继承的字段顺序陷阱",
      p: `dataclass 子类会继承父类字段，字段顺序是「父类字段在前，子类字段在后」。如果父类有默认值字段，子类又加无默认值字段，就会触发「non-default argument follows default argument」。

解决方式：给子类新字段也加默认值；或者用 [[kw_only=True]] 让所有字段只能按关键字传；或者重新设计，不要把有默认/无默认字段混在继承链里。

继承 dataclass 适合「共享字段的真正 is-a」，不适合「想复用几个字段」。后者用组合更清晰。`,
      code: String.raw`from dataclasses import dataclass, field

@dataclass
class Base:
    name: str
    tags: list[str] = field(default_factory=list)

@dataclass(kw_only=True)
class Result(Base):
    seconds: float

r = Result(name="林晓", seconds=62.35)
print(r)`,
      output: `Result(name='林晓', tags=[], seconds=62.35)`,
      tip: `[[kw_only=True]] 能避开默认值字段顺序问题；但如果只是复用字段，优先组合而不是继承。`
    },
    {
      h: "深读：属性查找的完整顺序",
      p: `访问 [[obj.attr]] 时，先调用 [[type(obj).__getattribute__]]；它先找数据描述符（定义了 [[__get__]] 和 [[__set__]] 的类属性），再找实例 [[__dict__]]，再找非数据描述符/类属性，最后找 [[__getattr__]] 兜底。

这个顺序解释了为什么 [[property]] 能覆盖实例字典：property 是数据描述符，优先级高于实例属性。也解释了为什么 [[__getattr__]] 只在正常查找失败后调用，不会拦截已有属性。

[[__getattr__]] 适合动态代理/兼容旧字段；不要用它吞掉所有 [[AttributeError]]，否则拼错属性名也会被静默处理。`,
      code: String.raw`class Demo:
    def __init__(self):
        self.x = 1
    @property
    def y(self):
        return 2
    def __getattr__(self, name):
        return f"missing:{name}"

d = Demo()
print(d.x, d.y)
print(d.z)`,
      output: `1 2
missing:z`,
      tip: `property 是数据描述符，优先于实例 [[__dict__]]；[[__getattr__]] 只处理查找失败的名字。`
    }
  ],
  "ch10-2": [
    {
      h: "深读：嵌套对象的校验与递归",
      p: `[[Team(swimmers=[Swimmer(...)])]] 的校验不能只看最外层。构造 [[Team]] 时要确认每个元素确实是 [[Swimmer]]，每个 Swimmer 的 results 都是 [[Result]]；否则后面调用 [[.average()]] 才爆。

可以在 [[__post_init__]] 里做浅层类型检查，深层交给各对象自己的构造器。不要在一个地方递归校验所有层，容易重复且难维护。边界原则：每个对象校验自己的字段，父对象校验「子对象类型」。

对不可信外部数据，先 [[from_dict]] 构造子对象，再构造父对象；任何一层失败都带路径信息，例如 [["swimmers[2].results[0].seconds"]]。`,
      code: String.raw`from dataclasses import dataclass, field

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float

@dataclass
class Swimmer:
    name: str
    results: tuple[Result, ...] = ()

@dataclass
class Team:
    name: str
    swimmers: tuple[Swimmer, ...] = ()
    def __post_init__(self):
        if not all(isinstance(s, Swimmer) for s in self.swimmers):
            raise TypeError("swimmers 必须都是 Swimmer")

t = Team("海豚队", (Swimmer("林晓", (Result("100m", 62.35),)),))
print(t.swimmers[0].results[0])`,
      output: `Result(event='100m', seconds=62.35)`,
      tip: `每个对象校验自己的字段，父对象校验子对象类型；外部数据逐层 from_dict，错误带路径。`
    },
    {
      h: "深读：cached_property 与失效策略",
      p: `[[functools.cached_property]] 把第一次计算的结果写进实例 [[__dict__]]，后续访问直接读缓存。适合昂贵且不变的派生值，例如 [[team.ranking]]、[[swimmer.personal_best]]。

陷阱：对象可变时缓存会过期。[[team.add()]] 之后，之前算好的 [[best]] 还是旧值。必须在修改方法里删除缓存，或者使用不可变对象。

[[cached_property]] 要求类有 [[__dict__]]；[[__slots__]] 类不支持，除非自己实现描述符。线程安全也只保证「最多算一次」不保证值最新。`,
          code: String.raw`from functools import cached_property

class Team:
    def __init__(self, rows):
        self.rows = list(rows)
    @cached_property
    def total(self):
        print("计算一次")
        return sum(self.rows)
    def add(self, n):
        self.rows.append(n)
        self.__dict__.pop("total", None)

t = Team([1, 2])
print(t.total, t.total)
t.add(3)
print(t.total)`,
          output: `计算一次
3 3
计算一次
6`,
      tip: `可变对象用 cached_property 时，修改方法必须清缓存；否则读到旧值。`
    },
    {
      h: "深读：循环引用与 repr 递归",
      p: `对象互相引用很常见：Team 持有 Swimmer，Swimmer 又持有 Team。dataclass 自动生成的 [[repr]] 会递归打印，遇到环就 [[RecursionError]]。

解决方式：[[repr=False]] 关闭某个字段的表示；或者自定义 [[__repr__]] 只打印 id/name，不递归。JSON 序列化也会遇到环，需要 [[default]] 处理或提前断开。

循环引用还会延迟垃圾回收；Python 的循环 GC 能处理，但大量对象时增加开销。能用弱引用（[[weakref]]）表达「不拥有」的关系时更好。`,
      code: String.raw`from dataclasses import dataclass, field

@dataclass
class Team:
    name: str
    swimmers: list = field(default_factory=list, repr=False)

@dataclass
class Swimmer:
    name: str
    team: Team | None = field(default=None, repr=False)

t = Team("海豚队")
s = Swimmer("林晓", t)
t.swimmers.append(s)
print(t)
print(s)`,
          output: `Team(name='海豚队')
Swimmer(name='林晓')`,
      tip: `互相引用的字段设 [[repr=False]]，否则自动 repr 会递归；JSON 序列化要单独处理环。`
    },
    {
      h: "深读：用假对象测试组合边界",
      p: `测试 [[Team]] 时不需要真数据库/真文件。传一个假 repo，记录调用次数、返回预设数据、模拟异常。假对象只实现 Team 用到的方法，不需要完整接口。

假对象比 mock 更简单：一个普通类，方法里 [[raise]] 或返回固定值。它能验证「Team 是否在重名时拒绝」「是否在 repo 失败时传播异常」。

不要 mock 一切。值对象直接构造，纯函数直接调用；只有外部边界（IO、时间、随机、网络）用假对象。`,
      code: String.raw`class FakeRepo:
    def __init__(self, fail=False):
        self.rows = []
        self.fail = fail
    def save(self, row):
        if self.fail:
            raise OSError("disk full")
        self.rows.append(row)

def add(repo, name):
    repo.save({"name": name})

ok = FakeRepo()
add(ok, "林晓")
print(ok.rows)

bad = FakeRepo(fail=True)
try:
    add(bad, "周宁")
except OSError as err:
    print(err)`,
          output: `[{'name': '林晓'}]
disk full`,
      tip: `假对象只实现用到的方法；外部边界才 mock，值对象直接构造。`
    }
  ],
  "ch10-3": [
    {
      h: "深读：用 Enum 固定事件/状态取值",
      p: `事件名、状态值用裸字符串，拼错要到运行时才发现。[[enum.Enum]] 把取值固定成成员，IDE 能补全，比较也安全。[[StrEnum]]（3.11+）让成员同时是字符串，方便 JSON/CSV 输出。

Enum 成员不是普通字符串；[[Event("100m")]] 可以按值查找，找不到抛 [[ValueError]]。序列化时用 [[.value]]，读回时用 [[Event(value)]] 校验。

不要用 Enum 表达会频繁变化的业务配置；它适合稳定的有限集合：项目类型、状态、角色。`,
      code: String.raw`from enum import StrEnum

class Event(StrEnum):
    FREE_50 = "50m"
    FREE_100 = "100m"

e = Event("100m")
print(e, e.value, e == "100m")
try:
    Event("200m")
except ValueError as err:
    print(type(err).__name__, err)`,
      output: `100m 100m True
ValueError '200m' is not a valid Event`,
      tip: `[[StrEnum]] 成员可当字符串用；读外部值用 [[Event(value)]] 校验，不要直接比较裸字符串。`
    },
    {
      h: "深读：模型版本与向后兼容",
      p: `对象要序列化到磁盘/API，就要考虑字段增删。加字段给默认值通常兼容；删字段/改类型会破坏旧数据。给 JSON 加 [[schema_version]]，读入时按版本迁移。

迁移函数应该是纯函数：旧 dict → 新 dict，不依赖全局状态。迁移后再 [[from_dict]] 校验。不要在一个 [[from_dict]] 里堆十年历史分支，拆成 [[migrate_v1_to_v2]]。

向后兼容不是「永远不删字段」，而是「旧数据能被读、旧客户端不被突然打断」。需要弃用时给过渡期和日志。`,
      code: String.raw`def migrate(data):
    version = data.get("schema_version", 1)
    if version == 1:
        data = {**data, "seconds": data.pop("time"), "schema_version": 2}
    return data

old = {"schema_version": 1, "event": "100m", "time": 62.35}
print(migrate(old))`,
          output: `{'schema_version': 2, 'event': '100m', 'seconds': 62.35}`,
      tip: `给持久化 JSON 加版本号；迁移函数纯函数化，再交给 from_dict 校验。`
    },
    {
      h: "深读：对象相等不等于业务相等",
      p: `dataclass 的 [[eq]] 比较所有字段。两个 [[Result("100m", 62.35, tags=("PB",))]] 和 [[Result("100m", 62.35, tags=())]] 不相等，虽然业务上可能是同一次成绩。相等性要按业务主键定义，而不是按所有字段。

可以设 [[eq=False]] 自定义 [[__eq__]]，只比较 event+date+athlete_id；或者引入 [[key]] 属性/方法，让业务层显式比较。哈希必须与相等一致：相等对象哈希相同。

不要把「显示字段」放进相等性：备注、更新时间、来源文件通常不该影响业务身份。`,
      code: String.raw`from dataclasses import dataclass

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float
    note: str = ""
    def key(self):
        return (self.event, round(self.seconds, 2))

a = Result("100m", 62.35, "PB")
b = Result("100m", 62.35, "")
print(a == b)
print(a.key() == b.key())`,
          output: `False
True`,
          tip: `业务相等用主键，不要把所有字段塞进 [[__eq__]]；哈希必须和相等定义一致。`
    },
    {
      h: "深读：从 dataclass 到 pydantic，什么时候需要",
      p: `dataclass 适合内部可信数据；外部 JSON/API 数据需要类型转换、范围校验、错误聚合，[[pydantic]] 更合适。它能在解析时把字符串转 int、收集多个字段错误、生成 JSON Schema。

但 pydantic 是第三方依赖，会改变对象行为（默认可变、验证开销）。内部模型继续用 dataclass，边界层用 pydantic 解析，再转成内部模型，是常见组合。

不要为了「自动校验」把所有内部对象都换成 pydantic；边界校验一次就够，内部反复校验是浪费。`,
      code: String.raw`from dataclasses import dataclass

@dataclass(frozen=True)
class Result:
    event: str
    seconds: float

# 边界层（伪代码）
# from pydantic import BaseModel, Field
# class ResultIn(BaseModel):
#     event: str
#     seconds: float = Field(gt=0)
# data = ResultIn.model_validate({"event": "100m", "seconds": "62.35"})
# result = Result(data.event, data.seconds)`,
          output: `Result(event='100m', seconds=62.35)`,
      tip: `外部边界用 pydantic 校验，内部模型用 dataclass；不要在内部每层重复校验。`
    }
  ],
  "ch10-review": [
    {
      h: "本章复盘：对象是「带规则的边界」",
      p: `这一章的主线不是「学会写 class」，而是「把规则放到正确的位置」。校验放构造器/方法，序列化放边界层，外部资源用注入，集合写操作走方法。做到这些，调用方就不需要每次记得检查。

三个自检问题：这个对象知道什么？它保证什么不变量？它依赖哪些外部资源？如果答不清，类就只是「把字典换了个壳」，没有降低复杂度。

本章验收：把 [[{"name":..., "scores":[...]}]] 重构成 [[Swimmer]]，要求坏分数在 [[add]] 就被拒绝、空分数 [[average]] 返回 None、JSON 转换显式、测试不碰文件。`,
      code: String.raw`from dataclasses import dataclass

@dataclass
class Swimmer:
    name: str
    scores: list[float]

    def add(self, score):
        if not 0 <= score <= 100:
            raise ValueError("分数越界")
        self.scores.append(float(score))

s = Swimmer("林晓", [])
s.add(91)
print(s)`,
          output: `Swimmer(name='林晓', scores=[91.0])`,
      tip: `对象化成功的标志：调用方不再背键名，非法状态进不来。`
    }
  ]
});

/* --- deep11.js --- */

window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch11-1": [
    {
      h: "深读：__init_subclass__ 与注册子类",
      p: `[[__init_subclass__]] 在子类创建时自动调用，适合做「子类注册/统一校验」，不用写元类。比如插件基类在子类定义时把子类登记到注册表，调用方不需要手动注册。

它只会在直接子类创建时触发；孙类会触发自己的父类钩子，但不会自动冒泡到最顶层，除非每层都调用 [[super().__init_subclass__]]。注册表通常是类级字典，注意重复注册和测试隔离。

比元类简单得多。只有需要修改类创建过程（改命名空间、注入属性）时才用元类；单纯「子类定义时做一件事」用 [[__init_subclass__]]。`,
      code: String.raw`class Plugin:
    registry = {}
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        Plugin.registry[cls.__name__] = cls

class CsvPlugin(Plugin): pass
class JsonPlugin(Plugin): pass

print(sorted(Plugin.registry))`,
      output: `['CsvPlugin', 'JsonPlugin']`,
      tip: `[[__init_subclass__]] 适合子类注册/统一校验；比元类简单，优先用它。`
    },
    {
      h: "深读：抽象基类不是必需，但能拦住误用",
      p: `[[abc.ABC]] + [[@abstractmethod]] 让未实现抽象方法的子类在实例化时直接报错，而不是运行到一半才 [[AttributeError]]。它适合「这个基类只定义协议，具体实现必须由子类给」的场景。

抽象方法可以有实现，子类仍可用 [[super()]] 调用；[[@abstractmethod]] 只要求子类覆盖。[[abc.abstractproperty]] 已废弃，用 [[property]] + [[abstractmethod]]。

Protocol 更适合静态检查，ABC 更适合运行时强制。两者都能描述接口；选一个，不要同一层混用。`,
      code: String.raw`from abc import ABC, abstractmethod

class Repo(ABC):
    @abstractmethod
    def load(self): ...
    @abstractmethod
    def save(self, row): ...

class MemoryRepo(Repo):
    def load(self): return []
    def save(self, row): pass

try:
    Repo()
except TypeError as err:
    print(type(err).__name__, err)`,
      output: `TypeError Can't instantiate abstract class Repo without an implementation for abstract method 'load'`,
      tip: `ABC 在实例化时强制实现；Protocol 在静态检查时提示。运行时强制用 ABC。`
    },
    {
      h: "深读：继承链上的初始化顺序",
      p: `子类 [[__init__]] 不调用 [[super().__init__]]，父类字段就不会初始化。多继承时，每个类的 [[__init__]] 都应该协作式调用 [[super().__init__]]，否则 MRO 后面的类被跳过。

但 [[super().__init__]] 不是「调用所有父类」，它只调用 MRO 下一个；下一个再调用下一个，形成链。任何一个环节不调用，链就断。

如果某个类不需要父类初始化，明确写注释；不要默默省略。测试要覆盖「子类实例化后父类字段存在」。`,
      code: String.raw`class A:
    def __init__(self):
        self.a = 1
        print("A")

class B(A):
    def __init__(self):
        super().__init__()
        self.b = 2
        print("B")

class C(B):
    def __init__(self):
        super().__init__()
        self.c = 3
        print("C")

C()`,
      output: `A
B
C`,
      tip: `多继承链上每个 [[__init__]] 都要 [[super().__init__]]；断一环，后面的父类就不初始化。`
    }
  ],
  "ch11-2": [
    {
      h: "深读：property 与 dataclass 的配合",
      p: `dataclass 默认生成 [[__init__]] 直接给字段赋值，如果字段是 property，赋值会走 setter。可以用 [[field(init=False)]] 让 dataclass 不生成该参数，再在 [[__post_init__]] 里赋值。

但 dataclass 的 [[repr]]/[[eq]] 默认包含字段；property 不是字段，不会自动包含。需要派生属性时，用 [[@property]] 手动加，不要把它当 dataclass 字段。

如果校验复杂，dataclass + [[__post_init__]] 比 property 更简单；property 适合「每次读写都要计算/校验」的场景。`,
      code: String.raw`from dataclasses import dataclass, field

@dataclass
class Result:
    _seconds: float = field(init=False, repr=False)
    event: str = "100m"

    @property
    def seconds(self):
        return self._seconds

    @seconds.setter
    def seconds(self, value):
        if value <= 0:
            raise ValueError("seconds 必须为正")
        self._seconds = value

r = Result()
r.seconds = 62.35
print(r.seconds)`,
      output: `62.35`,
      tip: `dataclass 字段和 property 同名会冲突；用 [[field(init=False)]] + 下划线字段，再暴露 property。`
    },
    {
      h: "深读：描述符的存储位置与继承",
      p: `描述符必须定义在类上，不能放在实例 [[__dict__]]；否则 [[__get__]] 不会被调用。继承时，子类会继承父类的描述符对象，多个子类共享同一个描述符实例；描述符里不要保存与具体实例相关的状态。

[[__set_name__]] 在类创建时调用，用来拿字段名；同一个描述符实例被多个类复用时，[[self.name]] 会被最后一次赋值覆盖。需要每个类独立状态时，在 [[__get__]] 里用 [[obj.__dict__]] 存。

描述符的 [[__get__]] 要处理 [[obj is None]] 的情况（通过类访问），否则 [[Result.seconds]] 会崩。`,
      code: String.raw`class Positive:
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        return obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        if value <= 0:
            raise ValueError(f"{self.name} 必须为正")
        obj.__dict__[self.name] = value

class A:
    x = Positive()
class B:
    x = Positive()

a = A(); a.x = 1
b = B(); b.x = 2
print(a.x, b.x, A.x)`,
      output: `1 2 <__main__.Positive object at ...>`,
      tip: `描述符是类属性；[[__get__]] 要处理 [[obj is None]]，否则类访问会崩。`
    },
    {
      h: "深读：classmethod 工厂与继承多态",
      p: `[[Result.from_dict]] 用 [[cls]] 而不是硬编码 [[Result]]，子类 [[ResultV2.from_dict]] 会构造 V2。这是工厂方法支持继承的关键。

但 [[cls(...)]] 依赖子类构造器签名一致；如果子类加了必填字段，工厂会失败。工厂方法要文档化「子类必须保持构造器兼容」，或者改用 [[cls.__new__]] + 显式初始化。

不要用 classmethod 做「全局单例」；它只是绑定类的方法，不保证只创建一个实例。单例需要额外状态/锁。`,
      code: String.raw`class Result:
    def __init__(self, event, seconds):
        self.event = event
        self.seconds = seconds
    @classmethod
    def from_dict(cls, data):
        return cls(data["event"], float(data["seconds"]))

class ResultV2(Result):
    pass

r = ResultV2.from_dict({"event": "100m", "seconds": "62.35"})
print(type(r).__name__, r.seconds)`,
      output: `ResultV2 62.35`,
      tip: `工厂用 [[cls]] 支持子类；但子类构造器签名必须兼容，否则工厂会炸。`
    }
  ],
  "ch11-3": [
    {
      h: "深读：切片协议与 __getitem__",
      p: `[[obj[1:3]]] 传给 [[__getitem__]] 的是 [[slice]] 对象，不是两个参数。需要支持切片时，判断 [[isinstance(key, slice)]]，用 [[key.indices(len(self))]] 规范化，再返回同类型容器。

只实现整数索引时，切片会 TypeError；调用方可能习惯切片，所以要明确文档。返回列表还是自定义容器？如果返回列表，调用方会失去自定义方法；返回同类型，可能触发构造器校验。

[[__getitem__]] 抛 [[IndexError]] 表示越界；抛 [[KeyError]] 表示映射键不存在。不要混用。`,
      code: String.raw`class Scores:
    def __init__(self, values):
        self._values = list(values)
    def __getitem__(self, key):
        if isinstance(key, slice):
            return Scores(self._values[key])
        return self._values[key]
    def __len__(self):
        return len(self._values)

s = Scores([91, 88.5, 79])
print(s[0], s[1:])
print(len(s[1:]))`,
      output: `91 [88.5, 79]
2`,
      tip: `切片传入的是 [[slice]] 对象；用 [[key.indices(len)]] 规范化，返回类型要明确。`
    },
    {
      h: "深读：可迭代对象 vs 迭代器",
      p: `可迭代对象实现 [[__iter__]]，返回迭代器；迭代器实现 [[__next__]]，并通常也实现 [[__iter__]] 返回 [[self]]。[[for]] 对两者都调用 [[iter()]]，所以可迭代对象可以被多次遍历，迭代器只能遍历一次。

常见错误是把「有状态的 [[__next__]]」放在可迭代对象上，还让 [[__iter__]] 返回 [[self]]；第二次 for 从上次位置继续。正确做法是 [[__iter__]] 返回新生成器/新迭代器。

[[iter(obj)]] 对序列会退化为索引迭代；没有 [[__iter__]] 但有 [[__getitem__]] 的对象也能 for，但语义是「从 0 开始直到 IndexError」。`,
      code: String.raw`class Book:
    def __init__(self, rows):
        self.rows = rows
    def __iter__(self):
        return iter(self.rows)

b = Book([1, 2])
it = iter(b)
print(next(it), next(it))
print(list(b))`,
      output: `1 2
[1, 2]`,
      tip: `可迭代对象每次 [[__iter__]] 返回新迭代器；不要把 [[__next__]] 状态放在可迭代对象上。`
    },
    {
      h: "深读：上下文管理器与异常抑制",
      p: `[[__exit__]] 返回 [[True]] 会吞掉异常，返回 [[False]]/[[None]] 继续传播。[[contextlib.suppress]] 是显式吞异常的工具；自定义管理器不要无条件返回 [[True]]。

[[contextlib.ExitStack]] 适合动态打开多个资源，按后进先出关闭；[[stack.enter_context()]] 注册，出错时全部清理。它比自己维护列表更安全。

上下文管理器也可以返回值：[[with open(...) as f]] 的 f 是 [[__enter__]] 返回；不要假设一定是 [[self]]。`,
      code: String.raw`from contextlib import ExitStack

with ExitStack() as stack:
    f1 = stack.enter_context(open("a.txt", "w", encoding="utf-8"))
    f2 = stack.enter_context(open("b.txt", "w", encoding="utf-8"))
    f1.write("a")
    f2.write("b")
print("done")`,
      output: `done`,
      tip: `[[ExitStack]] 后进先出关闭；异常时也会清理，适合动态数量资源。`
    }
  ],
  "ch11-review": [
    {
      h: "本章复盘：继承是工具，不是身份",
      p: `这一章的核心判断是「关系是否真的是 is-a」。如果是，继承能复用行为并支持多态；如果不是，组合更清晰。MRO/super 的复杂性只在多继承时出现，单继承不要被吓住；但也不要为了「扩展性」提前设计多层继承。

property/描述符解决的是「字段访问时要不要执行规则」。有规则才用，没有规则就是套壳。魔术方法解决的是「对象如何参与 Python 语法」，只实现显然语义，不要用运算符表达业务动作。

本章验收：写一个 [[LoggedRepo(LogMixin, Repo)]]，确认 [[save]] 返回值不变；给 [[Swimmer.scores]] 做只读 property；让 [[ScoreBook]] 支持 len/for/in/with。`,
      code: String.raw`class ScoreBook:
    def __init__(self, values): self._values = list(values)
    def __len__(self): return len(self._values)
    def __iter__(self): return iter(self._values)
    def __contains__(self, v): return v in self._values

b = ScoreBook([91, 88.5])
print(len(b), list(b), 91 in b)`,
      output: `2 [91, 88.5] True`,
      tip: `继承/属性/魔术方法都服务于「边界清晰」；没有规则就不要用。`
    }
  ]
});

/* --- deep12.js --- */

window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch12-1": [
    {
      h: "深读：TypeVar、Generic 与容器类型",
      p: `[[TypeVar("T")]] 表示「同一类型贯穿输入输出」：[[def first(items: list[T]) -> T]]。没有 TypeVar 时，[[list[Any]]] 会丢失元素类型。

自定义容器用 [[Generic[T]]]；约束用 [[TypeVar("T", bound=Base)]] 或约束值。[[Self]]（3.11+）表示返回自身类型，适合 builder/工厂。

类型参数不是运行时检查；它只帮静态检查器推断。运行时要校验仍用 isinstance/dataclass。`,
      code: String.raw`from typing import TypeVar, Generic

T = TypeVar("T")

class Box(Generic[T]):
    def __init__(self, value: T):
        self.value = value
    def get(self) -> T:
        return self.value

b = Box[int](3)
print(b.get())`,
      output: `3`,
      tip: `TypeVar 贯穿输入输出；[[Generic[T]]] 定义容器；类型提示不替代运行时校验。`
    },
    {
      h: "深读：Protocol 与结构化子类型",
      p: `[[Protocol]] 定义「只要具备这些方法就算符合」，不要求继承。适合第三方对象/鸭子类型；[[@runtime_checkable]] 可 [[isinstance]] 检查（只查方法存在，不查签名）。

Protocol 比 ABC 更轻，适合解耦接口；但运行时不做完整检查，别把它当验证。

方法签名要精确；[[...]] 表示省略体。泛型 Protocol 可写 [[Protocol[T]]]。`,
      code: String.raw`from typing import Protocol

class Reader(Protocol):
    def read(self) -> str: ...

class FileReader:
    def read(self) -> str:
        return "data"

def load(r: Reader) -> str:
    return r.read()

print(load(FileReader()))`,
      output: `data`,
      tip: `Protocol 是结构化接口，不要求继承；运行时检查只查方法存在，不查签名。`
    },
    {
      h: "深读：overload 与联合类型收窄",
      p: `[[@overload]] 只为静态检查声明多个签名，实际实现只有一个；适合「输入类型决定输出类型」的函数。

[[isinstance(x, str)]] 后类型检查器会收窄联合类型；[[assert x is not None]] 也能收窄。不要用 [[cast]] 掩盖真正的类型错误。

[[TypeGuard]] 自定义收窄函数；返回 [[TypeIs]]（3.13）更精确。复杂类型先保证运行时正确，再逐步补提示。`,
      code: String.raw`from typing import overload

@overload
def double(x: int) -> int: ...
@overload
def double(x: str) -> str: ...
def double(x):
    return x * 2

print(double(3), double("a"))`,
      output: `6 aa`,
      tip: `overload 只给检查器看，实现只有一个；isinstance/assert 能收窄，别滥用 cast。`
    },
    {
      h: "深读：mypy 渐进式配置",
      p: `新项目可以 [[strict = true]]；老项目先 [[disallow_untyped_defs]] 只覆盖公共函数，再逐步扩大。[[ignore_missing_imports]] 处理无 stub 的第三方库，但别全局开。

[[reveal_type(x)]] 看推断结果；[[# type: ignore[code]]] 要带错误码并写原因，避免永久掩盖。

类型检查放 CI，和 ruff/pytest 一起跑；不要只在本地偶尔跑。`,
      code: String.raw`# pyproject.toml
# [tool.mypy]
# python_version = "3.12"
# disallow_untyped_defs = true
# warn_unused_ignores = true
# exclude = ["tests/"]`,
          output: `Success: no issues found`,
          tip: `渐进式 strict；ignore 带错误码/原因；mypy 进 CI，不只本地跑。`
    }
  ],
  "ch12-2": [
    {
      h: "深读：docstring 风格与工具链",
      p: `Google 风格（Args/Returns/Raises）可读性好；Sphinx 风格（:param:/:return:）适合生成文档。选一种，全项目统一。

docstring 写「做什么/参数/返回/异常/示例」，不写实现细节。公共 API 必须有；内部函数可简短。

[[pydocstyle]]/ruff 的 docstring 规则可检查缺失/格式；[[interrogate]] 统计覆盖率。`,
      code: String.raw`def average(scores: list[float]) -> float:
    """返回平均分。

    Args:
        scores: 非空分数列表。
    Returns:
        平均分。
    Raises:
        ValueError: scores 为空。
    """
    if not scores:
        raise ValueError("scores 不能为空")
    return sum(scores) / len(scores)`,
          output: `89.5`,
          tip: `一种 docstring 风格贯穿项目；写参数/返回/异常/示例，公共 API 必须有。`
    },
    {
      h: "深读：doctest 与文档示例的可执行性",
      p: `docstring 里的 [[>>>]] 示例可被 [[doctest]] 执行，防止文档过期。适合纯函数/简单示例；复杂场景用 pytest。

doctest 对输出格式敏感（空格/浮点）；用 [[round]] 或 [[...]] 省略。不要在 doctest 里做网络/文件 IO。

[[pytest --doctest-modules]] 可以把模块 docstring 一起跑；CI 加一条。`,
      code: String.raw`def add(a: int, b: int) -> int:
    """相加。

    >>> add(2, 3)
    5
    """
    return a + b

if __name__ == "__main__":
    import doctest
    print(doctest.testmod())`,
          output: `TestResults(failed=0, attempted=1)`,
          tip: `doctest 防文档过期；输出格式要稳定，别在示例里做 IO/网络。`
    },
    {
      h: "深读：README 与 API 文档的分工",
      p: `README 回答「是什么/怎么装/怎么用/怎么测」；API 文档回答「每个函数参数/返回/异常」。不要把全部 API 塞进 README。

README 的示例要能复制运行；版本/依赖/许可证写清。截图/架构图放 [[docs/]]，用相对路径。

生成文档（Sphinx/mkdocs）从 docstring 抽取；文档构建也放 CI，断链/缺引用要失败。`,
      code: String.raw`# README 结构
# # scores
# 一句话说明
# ## 安装
# pip install scores
# ## 快速开始
# scores import raw.csv
# ## 测试
# pytest`,
          output: `README ready`,
          tip: `README 讲安装/使用，API 文档讲细节；示例可复制，文档构建进 CI。`
    },
    {
      h: "深读：类型提示与文档同步",
      p: `类型提示和 docstring 重复描述参数时容易不一致；以类型提示为准，docstring 只补充语义/约束/异常。

[[typing.get_type_hints]] 可在运行时读提示（注意 forward ref）；不要用它做业务校验。

公开 API 变更要更新 docstring/CHANGELOG；破坏性变更写迁移说明。`,
      code: String.raw`from typing import get_type_hints

def f(x: int) -> str:
    return str(x)

print(get_type_hints(f))`,
          output: `{'x': <class 'int'>, 'return': <class 'str'>}`,
          tip: `类型提示是参数类型的事实源；docstring 补充语义/约束，变更同步 CHANGELOG。`
    }
  ],
  "ch12-3": [
    {
      h: "深读：fixture 作用域与依赖",
      p: `[[@pytest.fixture(scope="session")]] 整个测试会话共享（数据库连接）；[[module]]/[[class]]/[[function]] 逐级缩小。共享 fixture 要无状态/可重置。

fixture 可依赖 fixture；[[yield]] 前是 setup，后是 teardown。teardown 必须执行，即使测试失败。

[[autouse=True]] 慎用，会让测试隐式依赖；明确传参更可读。`,
      code: String.raw`import pytest

@pytest.fixture(scope="session")
def base_url():
    return "https://example.com"

@pytest.fixture
def client(base_url):
    print("setup")
    yield {"url": base_url}
    print("teardown")

def test_one(client):
    assert client["url"].startswith("https")`,
          output: `setup
teardown
1 passed`,
      tip: `fixture scope 按成本选；yield 做 teardown；autouse 慎用，显式依赖更可读。`
    },
    {
      h: "深读：parametrize 与异常断言",
      p: `[[@pytest.mark.parametrize]] 把多组输入展开成多个测试；[[pytest.raises(ValueError, match="...")]] 断言异常类型/消息。

边界值用 parametrize 列清楚：空、零、负数、超长、非法格式。不要一个测试里塞十个断言，失败难定位。

[[pytest.mark.xfail]] 标记已知失败；[[skip]] 标记环境不适用，都要写原因。`,
      code: String.raw`import pytest

@pytest.mark.parametrize("text,expected", [("1:02.35", 62.35), ("62.35", 62.35)])
def test_parse(text, expected):
    assert float(text.split(":")[-1]) == expected

def test_bad():
    with pytest.raises(ValueError, match="格式"):
        raise ValueError("格式错误")`,
          output: `3 passed`,
          tip: `parametrize 列边界；raises 断言类型+消息；xfail/skip 写原因。`
    },
    {
      h: "深读：mock 的边界与依赖注入",
      p: `[[unittest.mock.patch]] 替换外部依赖（网络/时间/随机），让测试确定。patch 路径要 patch「使用的地方」，不是定义的地方。

优先依赖注入（传函数/客户端），少用全局 patch；patch 太多说明设计耦合。

[[Mock.assert_called_once_with]] 验证调用；不要过度断言内部实现，测试行为而非实现。`,
      code: String.raw`from unittest.mock import patch

def fetch(client):
    return client.get("/x")

class Client:
    def get(self, path):
        return {"path": path}

with patch.object(Client, "get", return_value={"ok": True}) as m:
    print(fetch(Client()))
    m.assert_called_once_with("/x")`,
          output: `{'ok': True}`,
          tip: `patch 使用处；优先依赖注入；断言行为/调用契约，别锁死实现细节。`
    },
    {
      h: "深读：覆盖率与属性测试",
      p: `覆盖率报告看 [[term-missing]] 的未覆盖行；分支覆盖比行覆盖更有意义。不要为数字写无意义断言。

[[hypothesis]] 属性测试自动生成输入，适合解析/序列化/数学函数；能发现边界 bug。要设 [[max_examples]]/deadline，避免慢。

属性测试断言「不变量」（round-trip 相等/不抛异常/范围），不是具体输出。`,
      code: String.raw`# pip install hypothesis
# from hypothesis import given, strategies as st
#
# @given(st.lists(st.integers()))
# def test_len_non_negative(xs):
#     assert len(xs) >= 0`,
          output: `1 passed`,
          tip: `覆盖率看分支/未覆盖行；hypothesis 测不变量，适合解析/序列化边界。`
    }
  ],
  "ch12-review": [
    {
      h: "本章复盘：让代码可读、可查、可改",
      p: `类型提示让静态检查发现错误；docstring 让使用者不用读实现；测试让修改有安全网。三者不是装饰，是降低协作成本。

优先级：公共 API 类型/文档 → 关键路径测试 → 边界/错误测试 → 覆盖率/属性测试。不要一开始追求 100% 类型/覆盖。

本章验收：给 [[average]] 加完整类型/docstring/doctest；给 [[parse_time]] 写 parametrize + 异常测试；配 mypy/ruff/pytest 一条命令跑。`,
      code: String.raw`def average(scores: list[float]) -> float:
    """返回平均分，空列表抛 ValueError。

    >>> average([90, 80])
    85.0
    """
    if not scores:
        raise ValueError("scores 不能为空")
    return sum(scores) / len(scores)`,
          output: `85.0`,
          tip: `类型/文档/测试三件套；先公共 API，再边界，别一开始追 100%。`
    }
  ]
});

/* --- deep13.js --- */

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

/* --- deep14.js --- */

window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch14-1": [
    {
      h: "深读：requests 之外的三个选择",
      p: `标准库 [[urllib.request]] 无第三方依赖，适合脚本/受限环境，但 API 原始；[[requests]] 生态最广、同步简单；[[httpx]] 支持同步/异步和 HTTP/2；[[aiohttp]] 专攻异步高并发。

选型看场景：一个小脚本用 urllib 足够；要 Session/重试/编码处理用 requests；要 async 并发用 httpx/aiohttp。不要为了「性能」在没有并发需求时引入异步复杂度。

异步客户端不能混用同步阻塞调用；在 async 函数里用 [[requests]] 会阻塞事件循环。要么全异步，要么放线程池。`,
      code: String.raw`import httpx

with httpx.Client(timeout=10) as client:
    r = client.get("https://httpbin.org/get")
    print(r.status_code, r.json()["url"])`,
      output: `200 https://httpbin.org/get`,
      tip: `同步小脚本 requests 足够；async 并发用 httpx/aiohttp，别在 async 里阻塞。`
    },
    {
      h: "深读：重定向、代理与流式下载",
      p: `[[requests]] 默认跟随重定向；跨域重定向可能丢 Authorization 头。需要看中间跳转时设 [[allow_redirects=False]]，手动处理 3xx 和 [[Location]]。

代理用 [[proxies={"https": "http://..."}]]；代理认证放 URL 或头。不要硬编码代理地址，放配置/环境变量。

大文件用 [[stream=True]] + [[iter_content]] 分块写，避免一次性进内存；校验 [[Content-Length]]/哈希，下载失败删除半文件。`,
      code: String.raw`import requests

with requests.get("https://httpbin.org/bytes/1024", stream=True, timeout=10) as r:
    r.raise_for_status()
    total = 0
    for chunk in r.iter_content(256):
        total += len(chunk)
print(total)`,
      output: `1024`,
      tip: `大文件 [[stream=True]] 分块写；重定向跨域会丢认证头，必要时手动处理。`
    },
    {
      h: "深读：HTTPError 与 Response 的关系",
      p: `[[raise_for_status()]] 抛 [[requests.HTTPError]]，异常对象带 [[response]]，可以读状态码/体。捕获后不要只打印 [[str(err)]]，要读 [[err.response.status_code]] 和有限长度的体。

[[urlopen]] 的 [[HTTPError]] 本身也是响应对象，可以读 [[.code]]/[[.read()]]；不要把它当纯网络错误。

4xx 的响应体可能是 JSON 错误说明；解析它需要先判断 content-type，避免把 HTML 错误页当 JSON。`,
      code: String.raw`import requests

try:
    r = requests.get("https://httpbin.org/status/404", timeout=10)
    r.raise_for_status()
except requests.HTTPError as err:
    print(err.response.status_code)
    print(err.response.text[:20])`,
      output: `404

`,
      tip: `[[HTTPError.response]] 带状态码/体；错误体可能不是 JSON，先看 content-type。`
    }
  ],
  "ch14-2": [
    {
      h: "深读：OAuth2 刷新 token 的最小实现",
      p: `OAuth2 的 access token 短期有效，refresh token 换新 token。刷新请求通常 POST [[/token]]，带 [[grant_type=refresh_token]]、refresh_token、client_id。刷新是敏感操作，要串行/加锁，避免并发刷新导致旧 refresh token 失效。

封装客户端：请求前检查过期时间（留 60 秒余量），过期则刷新；401 时刷新一次再重试原请求。不要把 refresh token 放前端/日志。

不同服务细节不同（PKCE、client_secret、scope），以文档为准；不要套用一套代码到所有 OAuth 服务。`,
      code: String.raw`class Token:
    def __init__(self, access, refresh, expires_at):
        self.access = access
        self.refresh = refresh
        self.expires_at = expires_at
    def valid(self, now):
        return now < self.expires_at - 60

t = Token("a", "r", 1000)
print(t.valid(900))`,
      output: `True`,
      tip: `刷新前留余量；并发刷新要加锁，401 只刷新重试一次，避免死循环。`
    },
    {
      h: "深读：并发分页与顺序落盘",
      p: `分页可以并发拉取已知页号，但 cursor 分页必须串行（下一页依赖上一页）。并发时结果到达顺序乱，落盘要带页号/游标，最后按页号合并。

并发数受 API 限流约束；用 [[ThreadPoolExecutor(max_workers=4)]] 或信号量限制。不要把整个任务一次提交几千个 future。

错误处理：某页失败不能丢整批；记录失败页，重试/补拉。最终校验「页号连续、总数一致」。`,
      code: String.raw`from concurrent.futures import ThreadPoolExecutor

def fetch(page):
    return page, [page * 2, page * 2 + 1]

with ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(fetch, range(1, 4)))
print(sorted(results))`,
      output: `[(1, [2, 3]), (2, [4, 5]), (3, [6, 7])]`,
      tip: `cursor 分页必须串行；并发页号结果按页号合并，失败页单独补拉。`
    },
    {
      h: "深读：幂等写入与去重键",
      p: `采集任务重跑很常见，写入必须幂等。数据库用唯一键 + [[INSERT ... ON CONFLICT DO UPDATE]]；文件用主键去重，或按「来源 ID + 版本」写新行。

去重键要稳定：API 的 id 优先；没有 id 用「URL + 关键字段哈希」。不要用自增行号/抓取时间当键，重跑会重复。

删除/更新也要幂等：先写 staging 表，再按主键 merge；不要边抓边删线上数据。`,
      code: String.raw`rows = [{"id": 1, "score": 91}, {"id": 1, "score": 92}]
seen = {}
for row in rows:
    seen[row["id"]] = row
print(seen)`,
      output: `{1: {'id': 1, 'score': 92}}`,
      tip: `去重键用稳定业务 ID；重跑 upsert，不要用抓取时间/行号当键。`
    }
  ],
  "ch14-3": [
    {
      h: "深读：表格用 pandas.read_html 的边界",
      p: `[[pandas.read_html]] 能快速把 HTML 表格转 DataFrame，但它依赖 lxml/bs4，且对合并单元格、嵌套表、动态加载支持有限。返回的是列表，要按列名/形状选对表。

read_html 不适合生产抓取的核心逻辑：它把解析和结构耦合，页面一变就全崩。可以用于一次性分析/探索，生产仍建议显式解析 + 校验。

解析后要检查列数/关键列存在；不要假设第 0 个表就是目标表。`,
      code: String.raw`import pandas as pd

html = "<table><tr><th>name</th><th>score</th></tr><tr><td>林晓</td><td>91</td></tr></table>"
tables = pd.read_html(html)
print(tables[0].to_dict("records"))`,
      output: `[{'name': '林晓', 'score': 91}]`,
      tip: `read_html 适合探索；生产要显式解析 + 列校验，别假设第 0 个表是目标。`
    },
    {
      h: "深读：JS 渲染页与 Playwright 的边界",
      p: `页面数据由 JS 渲染时，[[requests]] 拿到的是空壳。优先找页面背后的 API（开发者工具 Network），直接请求 JSON；这是最稳的方式。

确实需要浏览器自动化时，用 Playwright 等无头浏览器，等待具体选择器而不是固定 sleep；控制并发、遵守 robots/条款。无头浏览器资源重，不适合大规模抓取。

不要用浏览器自动化绕过登录/验证码/付费墙；这是边界，不是技术问题。`,
      code: String.raw`# 伪代码：Playwright 等待选择器
# from playwright.sync_api import sync_playwright
# with sync_playwright() as p:
#     page = p.chromium.launch().new_page()
#     page.goto("https://example.com", wait_until="networkidle")
#     page.wait_for_selector(".row")
#     print(page.locator(".row").count())`,
      output: `3`,
      tip: `优先找背后的 API；必须用浏览器时等选择器，不要固定 sleep，更不要绕过验证码。`
    },
    {
      h: "深读：抓取数据的质量校验",
      p: `抓完要校验：条数是否符合预期、主键是否唯一、关键字段空值率、数值范围、日期格式、来源 URL 是否 200。没有校验的抓取只是「把脏数据搬了个地方」。

抽样人工核对 10–20 条；对异常分布（突然全是 0、字段长度突变）告警。保留原始页哈希，结构变化时能定位。

发布前脱敏/去重/版权检查；抓取数据不等于可以随意再分发。`,
      code: String.raw`rows = [{"id": 1, "score": 91}, {"id": 2, "score": None}]
ids = [r["id"] for r in rows]
print("unique", len(ids) == len(set(ids)))
print("missing", sum(r["score"] is None for r in rows) / len(rows))`,
      output: `unique True
missing 0.5`,
      tip: `校验主键唯一/空值率/范围；抽样人工核对，异常分布要告警。`
    }
  ],
  "ch14-review": [
    {
      h: "本章复盘：稳定、合法、可复现",
      p: `HTTP 抓取的三条底线：请求要能失败得清楚（状态码/超时/重试）；数据要能增量/幂等（分页/游标/去重）；行为要合法（robots/条款/频率/脱敏）。

排错顺序：状态码 → 响应头/编码 → 结构/选择器 → 数据校验。不要一上来就怀疑解析。

本章验收：[[fetch_json]] 带重试；分页 API 落盘可续跑；公开榜单抓取带限速/哈希/校验。`,
      code: String.raw`import requests

r = requests.get("https://httpbin.org/json", timeout=10)
print(r.status_code, r.headers.get("content-type"))
print(list(r.json()))`,
      output: `200 application/json
['slideshow']`,
      tip: `先状态码/头，再解析；失败要能定位到具体一层。`
    }
  ]
});

/* --- deep15.js --- */

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

/* --- deep16.js --- */

window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch16-1": [
    {
      h: "深读：删除前的安全闸门",
      p: `自动化删除最危险。脚本先规范目标路径（[[resolve()]]），确认它在允许根目录下，再执行；用 [[--dry-run]] 默认打印，[[--yes]] 才真删。

拒绝删除根目录/家目录/符号链接指向的外部路径；[[Path.is_symlink()]] 要检查。[[rmtree]] 对符号链接默认不跟随，但仍要防误传。

删除用「移到回收站/trash」比直接删安全；保留 N 天可恢复。日志记录删了哪些路径。`,
      code: String.raw`from pathlib import Path

root = Path("archive").resolve()
target = (root / "old").resolve()
print(target.is_relative_to(root))
print(target.is_symlink())`,
      output: `True
False`,
      tip: `删除前 [[resolve]] + [[is_relative_to]] 限定根目录；默认 dry-run，[[--yes]] 才真删。`
    },
    {
      h: "深读：符号链接、权限与跨设备移动",
      p: `符号链接可能指向目录外，遍历时要决定「跟随还是不跟随」；[[rglob]] 默认不跟随目录链接，但文件链接会被读到。处理敏感目录时更要注意。

[[move]] 跨文件系统是「复制+删除」，可能慢/中断；大目录先复制校验再删源。权限错误用 [[os.access]] 预检，但最终仍要捕获 [[PermissionError]]。

POSIX 权限/umask 影响新文件；共享目录要设组权限。不要把密钥文件设成全局可读。`,
      code: String.raw`from pathlib import Path

p = Path("data/a.csv")
print(p.is_symlink(), p.exists())
print(oct(p.stat().st_mode & 0o777))`,
      output: `False True
0o644`,
      tip: `链接要显式决定是否跟随；跨设备 move 是复制+删，先校验再删源。`
    },
    {
      h: "深读：subprocess 的流式输出与超时",
      p: `[[run(capture_output=True)]] 会等进程结束并一次性拿输出；长任务要 [[Popen]] + 逐行读 stdout，边跑边日志。读的时候要处理 stderr，避免管道满阻塞。

[[timeout]] 到点会 kill 子进程，但子进程可能还有孙进程；需要进程组/容器隔离。Windows 的 kill 语义不同，跨平台要测。

不要把用户输入拼进命令字符串；参数列表 + [[--]] 分隔，防选项注入。`,
      code: String.raw`import subprocess

p = subprocess.Popen(
    ["python", "-u", "-c", "print('a'); print('b')"],
    stdout=subprocess.PIPE, text=True
)
for line in p.stdout:
    print("got", line.strip())
print("rc", p.wait())`,
      output: `got a
got b
rc 0`,
          tip: `长任务用 [[Popen]] 流式读；stderr 也要读，[[timeout]] 杀不掉孙进程要额外处理。`
    },
    {
      h: "深读：路径遍历的排序与稳定输出",
      p: `[[glob]]/[[iterdir]] 的顺序不保证稳定；需要可复现时显式 [[sorted(key=...)]]，按名称/修改时间排序。按修改时间排序要注意相同时间戳的 tie-break。

批量处理要记录「处理了哪些文件」的清单/哈希；下次只处理新增/变更（增量）。不要靠目录顺序猜。

文件名可能含空格/中文/emoji；日志和 CSV 要正确引用，不要用空格分隔。`,
      code: String.raw`from pathlib import Path

files = sorted(Path("data").glob("*.csv"), key=lambda p: (p.stat().st_mtime, p.name))
for p in files:
    print(p.name)`,
      output: `a.csv
b.csv`,
      tip: `遍历顺序不稳定，显式排序；记录处理清单/哈希做增量，文件名别用空格分隔。`
    }
  ],
  "ch16-2": [
    {
      h: "深读：openpyxl 的公式、样式与只读模式",
      p: `写公式直接赋字符串 [[ws["C2"] = "=SUM(A2:B2)"]]；读公式值要 [[data_only=True]]，且文件必须被 Excel 计算过保存，否则缓存值是 None。

[[load_workbook(read_only=True)]] 适合大文件只读，不能随机访问/修改；[[write_only=True]] 适合流式写大表。样式用 [[Font/Fill/Alignment]]，复制模板比手写样式稳。

合并单元格只有左上角有值；遍历时要处理 [[MergedCell]]。保存前关闭只读模式，否则不能改。`,
      code: String.raw`from openpyxl import Workbook

wb = Workbook()
ws = wb.active
ws["A1"] = 10
ws["A2"] = 20
ws["A3"] = "=SUM(A1:A2)"
wb.save("calc.xlsx")
print("saved")`,
      output: `saved`,
      tip: `[[data_only=True]] 读缓存值（可能 None）；大文件用 read_only/write_only；合并单元格只有左上角有值。`
    },
    {
      h: "深读：docx 模板替换的 run 问题",
      p: `Word 的段落由多个 run 组成，占位符可能被拆成 [[{{na]] + [[me}}]]。直接遍历 run 替换会失败。

稳妥做法：按段落合并文本，若包含占位符，清空 runs 后写入替换后的整段（会丢段落内局部格式）；或先用模板把占位符放在单个 run。

表格单元格同理；页眉/页脚要单独遍历 [[section.header]]。替换后检查是否残留 [[{{]]。`,
      code: String.raw`from docx import Document

doc = Document()
p = doc.add_paragraph("姓名：{{name}}")
text = p.text.replace("{{name}}", "林晓")
for r in p.runs:
    r.text = ""
p.runs[0].text = text if p.runs else text
print(p.text)`,
      output: `姓名：林晓`,
      tip: `占位符可能跨 run；合并文本后重写会丢局部格式，模板设计时就让占位符在单个 run。`
    },
    {
      h: "深读：PDF 文本层、OCR 与版式",
      p: `[[extract_text]] 只能读文本层；扫描件/图片 PDF 没有文本层，需要 OCR（Tesseract/PaddleOCR）。OCR 有语言/精度/版式问题，结果要人工抽检。

多栏/表格 PDF 的文本顺序可能乱；需要结构时用 [[pdfplumber]] 按坐标提取，或专用表格工具。不要假设 [[extract_text]] 能还原表格。

合并/拆分后要检查页数、书签、加密；加密 PDF 先解密再处理，注意权限。`,
      code: String.raw`from pypdf import PdfReader

reader = PdfReader("doc.pdf")
print(len(reader.pages))
print(reader.pages[0].extract_text()[:40])`,
      output: `3
Title
First paragraph...`,
      tip: `扫描件要 OCR；多栏/表格别只靠 [[extract_text]]，用坐标工具；处理后查页数/加密。`
    },
    {
      h: "深读：批处理的数据契约与对账",
      p: `批量生成前定义输入契约：必填列、类型、唯一键、允许空值。缺列/坏行要报错并指出行号，不要静默跳过。

输出对账：输入 N 行 → 生成 N 个文件/工作表；失败 M 行要记录原因。最终打印「成功/失败/跳过」计数，和输入总数对得上。

重复运行要幂等：输出目录按批次/日期隔离，或覆盖同名文件前备份。不要把上次的残留当本次结果。`,
      code: String.raw`rows = [{"name": "林晓", "score": 91}, {"name": None, "score": 80}]
ok, bad = [], []
for i, row in enumerate(rows, 1):
    (ok if row.get("name") else bad).append((i, row))
print(len(ok), len(bad), bad)`,
      output: `1 1 [(2, {'name': None, 'score': 80})]`,
      tip: `输入契约 + 行号错误 + 输出对账；成功/失败/跳过计数要和输入总数一致。`
    }
  ],
  "ch16-3": [
    {
      h: "深读：systemd timer 比 cron 多什么",
      p: `systemd timer 有 [[Persistent=true]]（错过补跑）、依赖/环境/日志（journalctl）、随机延迟（[[RandomizedDelaySec]]）。适合需要审计/重试的服务。

unit 文件分 [[.service]] 和 [[.timer]]；[[OnCalendar=]] 定义时间，[[systemctl enable --now]] 启用。环境变量用 [[Environment=]]/[[EnvironmentFile=]]，不依赖登录 shell。

cron 更简单、跨平台差；容器里 cron 可能没有 systemd。选型看运行环境，不要假设都有 systemd。`,
      code: String.raw`# scores.service
# [Service]
# Type=oneshot
# ExecStart=/opt/venv/bin/python /opt/scores/job.py
# User=scores
#
# scores.timer
# [Timer]
# OnCalendar=*-*-* 07:30:00
# Persistent=true
# RandomizedDelaySec=120`,
      output: `systemctl list-timers --all`,
      tip: `systemd timer 支持补跑/日志/随机延迟；cron 简单但环境少、跨平台差。`
    },
    {
      h: "深读：日志上下文与任务 id",
      p: `每次运行生成 [[run_id]]，日志每行带 run_id；告警也带 run_id，能从告警跳到日志。用 [[logging.LoggerAdapter]] 或 filter 注入。

日志级别：INFO 记录开始/数量/耗时；WARNING 记录跳过/重试；ERROR 记录失败；DEBUG 记录细节（默认关闭）。

多进程/多线程日志要避免交错；用队列/独立文件。不要把大对象 [[repr]] 进日志。`,
      code: String.raw`import logging, uuid

run_id = uuid.uuid4().hex[:8]
logger = logging.getLogger("job")
logging.basicConfig(format=f"%(asctime)s {run_id} %(levelname)s %(message)s", level=logging.INFO)
logger.info("start")`,
      output: `2026-11-24 ... a1b2c3d4 INFO start`,
      tip: `run_id 贯穿日志/告警；INFO 记数量/耗时，ERROR 记失败，别把大对象写日志。`
    },
    {
      h: "深读：重试、死信与人工兜底",
      p: `可重试错误（网络/限流/临时锁）自动重试 3 次，指数退避；不可重试（数据格式/权限）直接失败并告警。

重试仍失败的任务进「死信」队列/目录，保留输入和错误；人工处理后能重放。不要无限重试或静默丢弃。

告警要含「下一步」：日志路径、重放命令、负责人。只报错不给出路的告警会被忽略。`,
      code: String.raw`import time

def run(task, attempts=3):
    for i in range(attempts):
        try:
            return task()
        except TimeoutError:
            if i == attempts - 1:
                raise
            time.sleep(2 ** i)

print(run(lambda: "ok"))`,
      output: `ok`,
      tip: `只重试临时错误；最终失败进死信保留输入，告警给日志/重放命令。`
    },
    {
      h: "深读：监控「没跑」与「跑了没效果」",
      p: `退出码 0 只证明进程结束，不证明业务成功。输出「上次成功时间/处理行数/关键文件时间戳」到监控系统；超过阈值没更新就告警。

心跳文件/数据库标记：任务开始写 running，成功写 success+时间；监控查最后 success 时间。僵尸 running 要能识别。

业务指标比技术指标更重要：生成 0 条报表、金额为 0、文件大小骤降，都要告警。`,
      code: String.raw`from datetime import datetime, timezone
from pathlib import Path
import json

Path("heartbeat.json").write_text(json.dumps({
    "last_success": datetime.now(timezone.utc).isoformat(),
    "rows": 120,
}), encoding="utf-8")
print("ok")`,
      output: `ok`,
      tip: `退出 0 不等于业务成功；心跳/上次成功时间/行数/文件大小都要监控。`
    }
  ],
  "ch16-review": [
    {
      h: "本章复盘：自动化要可停、可查、可恢复",
      p: `文件/办公/定时三类自动化的共同底线：不误删、不覆盖、不静默失败。路径用 Path、命令用参数列表、删除先 dry-run；批处理有输入契约和输出对账；定时任务有锁、日志、告警、心跳。

「能跑」只是开始，「跑错能发现、跑挂能恢复、重跑不重复」才是完成。每个脚本都该有 [[--dry-run]] 和明确的退出码。

本章验收：批量归档（dry-run/不覆盖）、Word 成绩单（数量对账）、每日任务（锁/日志/告警/心跳）。`,
      code: String.raw`from pathlib import Path

for p in sorted(Path("data").glob("*.csv")):
    print("would archive", p.name)
print("dry-run done")`,
      output: `would archive a.csv
dry-run done`,
      tip: `不误删/不覆盖/不静默失败；dry-run、退出码、心跳三件套。`
    }
  ]
});

/* --- deep17.js --- */

window.PY_FOUNDATIONS_DEEP = Object.assign(window.PY_FOUNDATIONS_DEEP || {}, {
  "ch17-1": [
    {
      h: "深读：threading.local 与上下文隔离",
      p: `[[threading.local()]] 为每个线程保存独立副本，适合请求上下文/数据库连接。不要用全局变量存「当前用户」，线程间会串。

异步任务不能用 threading.local 隔离，因为同一线程跑多个协程；用 [[contextvars.ContextVar]]。

thread-local 不自动清理；线程池复用线程时，上一个任务的上下文可能残留，要在任务开始时重置。`,
      code: String.raw`import threading

ctx = threading.local()

def worker(name):
    ctx.name = name
    print(ctx.name)

t1 = threading.Thread(target=worker, args=("a",))
t2 = threading.Thread(target=worker, args=("b",))
t1.start(); t2.start(); t1.join(); t2.join()`,
          output: `a
b`,
          tip: `线程上下文用 [[threading.local]]，协程用 [[ContextVar]]；线程池复用要重置。`
    },
    {
      h: "深读：Condition/Event 的等待与通知",
      p: `[[Condition]] 用于「等待某个条件成立」：[[with cond: cond.wait_for(lambda: ready)]]，另一个线程修改状态后 [[notify_all]]。必须持锁修改状态，再通知。

[[Event]] 是简单开关：[[set]]/[[wait]]/[[clear]]，适合「初始化完成/停止信号」。[[Barrier]] 让 N 个线程互相等待。

[[wait]] 要带超时，避免永久阻塞；虚假唤醒用 [[while not cond]] 循环检查，[[wait_for]] 已封装。`,
      code: String.raw`import threading

ready = threading.Event()

def worker():
    ready.wait(timeout=1)
    print("go")

t = threading.Thread(target=worker)
t.start()
ready.set()
t.join()`,
          output: `go`,
          tip: `Condition 持锁改状态再 notify；Event 适合开关；wait 要超时，防永久阻塞。`
    },
    {
      h: "深读：线程池的异常与超时传播",
      p: `[[submit]] 的异常存到 Future，只有 [[result()]]/[[exception()]] 才看得到；不取结果就静默失败。用 [[as_completed]] 遍历并 try/except。

[[future.cancel()]] 只能取消未开始的任务；运行中的无法强停。需要超时用 [[wait(timeout=)]]，超时后决定继续等/放弃。

[[shutdown(wait=True)]] 等所有任务；[[cancel_futures=True]] 取消排队任务。程序退出前要 shutdown，避免线程泄漏。`,
      code: String.raw`from concurrent.futures import ThreadPoolExecutor

def boom():
    raise ValueError("bad")

with ThreadPoolExecutor(1) as pool:
    f = pool.submit(boom)
    try:
        f.result()
    except ValueError as err:
        print("caught", err)`,
          output: `caught bad`,
          tip: `异常在 [[result()]] 才抛出；[[cancel]] 只能取消未开始任务，退出前 shutdown。`
    },
    {
      h: "深读：GIL 的未来与选型",
      p: `Python 3.13 提供 free-threaded 构建（[[--disable-gil]]），但默认构建仍有 GIL，生态兼容性还在推进。不要假设部署环境已无 GIL。

即使无 GIL，共享可变状态仍需锁；多线程 CPU 并行会带来缓存/调度开销，不一定线性加速。

选型：I/O 密集线程/async；CPU 密集进程；需要共享大量状态再考虑共享内存/专门库。先测再选。`,
      code: String.raw`import sys, sysconfig

print(sys.version)
print(sysconfig.get_config_var("Py_GIL_DISABLED"))`,
          output: `3.12.x
0`,
          tip: `默认仍有 GIL；free-threaded 是实验构建。选型看 I/O/CPU，不跟风。`
    }
  ],
  "ch17-2": [
    {
      h: "深读：fork、spawn、forkserver 的差异",
      p: `Linux 默认 [[fork]]，子进程继承父进程状态（包括已打开文件/锁），快但易出问题；macOS/Windows 默认 [[spawn]]，干净但慢、要可 pickle。

[[forkserver]] 先起一个干净服务进程再 fork，兼顾安全/速度，适合多进程池。[[multiprocessing.set_start_method]] 要在创建任何进程前设置。

fork 后子进程不要复用父进程的数据库连接/线程锁；在子进程里重新初始化。`,
      code: String.raw`import multiprocessing as mp

print(mp.get_start_method())
# mp.set_start_method("spawn", force=True)`,
          output: `fork`,
          tip: `fork 继承状态但易污染；spawn 干净但要 pickle；子进程重新初始化连接/锁。`
    },
    {
      h: "深读：共享内存与锁的配合",
      p: `[[Value("i", 0)]]/[[Array("d", n)]] 是共享内存，多个进程直接读写；必须配 [[Lock]]，否则竞态。[[Value]] 有 [[get_lock]]，也可传独立锁。

共享内存适合大数组/计数器；不适合复杂对象（要 pickle）。[[multiprocessing.shared_memory]] 可映射大块内存，但生命周期/清理要手动。

进程崩溃可能留下共享内存段；用 [[resource_tracker]]/显式 [[close/unlink]] 清理。`,
      code: String.raw`from multiprocessing import Process, Value, Lock

def add(v, lock):
    for _ in range(100):
        with lock:
            v.value += 1

if __name__ == "__main__":
    v = Value("i", 0)
    lock = Lock()
    ps = [Process(target=add, args=(v, lock)) for _ in range(2)]
    for p in ps: p.start()
    for p in ps: p.join()
    print(v.value)`,
          output: `200`,
          tip: `[[Value/Array]] 共享内存必须配锁；复杂对象用 Queue/Manager；崩溃后清理共享段。`
    },
    {
      h: "深读：Pool 的异常、超时与终止",
      p: `[[pool.map]] 遇到异常会抛出，但已启动的任务可能继续；[[apply_async]] 的异常在 [[get]] 时抛。收集所有结果时用 [[return_exceptions]] 思路。

[[pool.terminate]] 立即杀，[[pool.close]] 等任务完成再 join。上下文管理器退出会 close+join，异常时可能等很久。

进程池任务要幂等/可重试；进程崩溃不会自动重启，长任务要考虑监控/重启策略。`,
      code: String.raw`from multiprocessing import Pool

def work(n):
    if n == 2:
        raise ValueError("bad")
    return n

if __name__ == "__main__":
    with Pool(2) as pool:
        try:
            print(pool.map(work, [1, 2, 3]))
        except ValueError as err:
            print("failed", err)`,
          output: `failed bad`,
          tip: `[[map]] 异常会抛；[[terminate]] 立即杀、[[close]] 等完成；长任务要监控重启。`
    },
    {
      h: "深读：多进程的日志与输出",
      p: `多进程写同一日志文件会交错/损坏；每个进程写独立文件，或使用 [[QueueHandler]] 把日志送到主进程统一写。

[[print]] 在多进程下也可能交错；用 [[flush=True]] 并加进程名。子进程 stdout 可能被父进程缓冲，cron 下看不到。

日志初始化放在子进程入口，不要依赖 fork 继承的 handler（文件描述符共享会乱）。`,
      code: String.raw`import logging, os
from multiprocessing import Process

def worker():
    logging.basicConfig(filename=f"w-{os.getpid()}.log", level=logging.INFO)
    logging.info("start")

if __name__ == "__main__":
    p = Process(target=worker)
    p.start(); p.join()`,
          output: `w-12345.log: INFO start`,
          tip: `每进程独立日志或 QueueHandler 汇总；print 加 flush/进程名，别共享 handler。`
    }
  ],
  "ch17-3": [
    {
      h: "深读：async 迭代器与异步生成器",
      p: `[[async def]] + [[yield]] 是异步生成器，用 [[async for]] 消费；[[__aiter__]]/[[__anext__]] 定义异步迭代器。适合流式读大响应/分页。

异步生成器不能直接 [[list()]]；要 [[[x async for x in agen]]]。取消时生成器要在 [[finally]] 清理。

不要把同步生成器包一层 [[to_thread]] 就当异步流；每次迭代都跨线程，开销大。`,
      code: String.raw`import asyncio

async def agen():
    for i in range(3):
        await asyncio.sleep(0)
        yield i

async def main():
    print([x async for x in agen()])

asyncio.run(main())`,
          output: `[0, 1, 2]`,
          tip: `异步生成器用 [[async for]]；取消要在 finally 清理，别用线程桥接假装流式。`
    },
    {
      h: "深读：asyncio.Queue 与背压",
      p: `[[asyncio.Queue(maxsize=N)]] 在 [[await put]] 满时等待，形成背压；消费者 [[await get]]。[[task_done]]/[[join]] 与线程 Queue 类似。

生产者-消费者用 [[asyncio.create_task]] 启动多个消费者；异常要收集，否则任务静默死掉。

队列不是越大越好；无界队列会把内存吃光。按处理速度设 maxsize。`,
      code: String.raw`import asyncio

async def main():
    q = asyncio.Queue(maxsize=2)
    await q.put(1)
    await q.put(2)
    print(q.qsize())
    print(await q.get())

asyncio.run(main())`,
          output: `2
1`,
          tip: `[[asyncio.Queue(maxsize)]] 做背压；消费者异常要收集，别让任务静默死。`
    },
    {
      h: "深读：Semaphore、Lock 与超时组合",
      p: `[[asyncio.Semaphore]] 限制并发；[[asyncio.Lock]] 保护共享状态。两者都是异步上下文管理器，等待时不阻塞循环。

[[async with asyncio.timeout(5)]] 包住整个块，超时取消内部 await；比 [[wait_for]] 更适合多步操作。

锁内不要做长 I/O；锁只保护状态更新，I/O 放锁外。`,
      code: String.raw`import asyncio

sem = asyncio.Semaphore(2)

async def work(i):
    async with sem:
        await asyncio.sleep(0.1)
        return i

async def main():
    print(await asyncio.gather(*(work(i) for i in range(4))))

asyncio.run(main())`,
          output: `[0, 1, 2, 3]`,
          tip: `Semaphore 限并发、Lock 保护状态；[[asyncio.timeout]] 包多步操作，锁内别做长 I/O。`
    },
    {
      h: "深读：异步性能的常见误区",
      p: `async 不会让单请求更快，只提高等待期间的并发；如果对方限流/带宽满，加并发只会更慢。

事件循环是单线程，CPU 计算/同步解析会阻塞所有任务；大 JSON 解析也可能成为瓶颈。

压测要测 P50/P95/错误率，不只看总耗时；调并发数找到拐点。异步不是万能，线程/进程各有位置。`,
      code: String.raw`import asyncio, time

async def one():
    await asyncio.sleep(0.05)

async def main(n):
    t0 = time.perf_counter()
    await asyncio.gather(*(one() for _ in range(n)))
    print(n, round(time.perf_counter() - t0, 2))

asyncio.run(main(20))`,
          output: `20 0.06`,
          tip: `async 提高等待期并发，不加快单请求；CPU/解析会阻塞循环，压测看 P95/错误率。`
    }
  ],
  "ch17-review": [
    {
      h: "本章复盘：先分类，再选模型",
      p: `并发模型的选择只看两件事：任务是 I/O 等待还是 CPU 计算；需要多少共享状态。I/O → 线程或 async；CPU → 进程；共享状态多 → 重新设计，尽量用消息传递。

三个安全底线：共享可变状态要锁/队列；任务要能超时/取消/清理；异常不能静默吞掉。没有这三条，越快越危险。

本章验收：线程生产者-消费者；线程 vs 进程 CPU 对比；async 限流抓取 + 超时统计。`,
      code: String.raw`import asyncio

async def main():
    async with asyncio.TaskGroup() as tg:
        t = tg.create_task(asyncio.sleep(0.1, result="ok"))
    print(t.result())

asyncio.run(main())`,
      output: `ok`,
      tip: `I/O 线程/async、CPU 进程；锁/超时/异常三件事先做好，再谈性能。`
    }
  ]
});

/* --- deep18.js --- */

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

/* --- deep-review3.js --- */

window.PY_FOUNDATIONS_REVIEW3 = Object.assign(window.PY_FOUNDATIONS_REVIEW3 || {}, {
  "ch2-3": [
    {
      h: "术语卡：文本、字节与文件",
      p: `术语卡一：字符与字节。[[str]] 是 Unicode 码点序列，[[bytes]] 是 0-255 的字节序列；[[len("中")]] 是 1，[[len("中".encode("utf-8"))]] 是 3。[[encode()]] 把 str 变 bytes，[[decode()]] 把 bytes 变 str；两者默认 strict，编码不匹配就抛异常。\n\n术语卡二：编码与换行。UTF-8 是变长编码，ASCII 兼容；GBK 是另一套编码，不能和 UTF-8 互读。BOM 是文件头标记，[[utf-8-sig]] 读写时处理它；换行 Windows 用 [[\r\n]]，Unix 用 [[\n]]，文本模式默认转换，[[newline=""]] 保留原样。\n\n术语卡三：错误策略。[[errors="strict"]] 直接失败，[[ignore]] 静默丢字符，[[replace]] 留替换符，[[backslashreplace]] 留转义。生产数据不要用 ignore 掩盖问题；需要容错时记录偏移和上下文。\n\n术语卡四：文件读取。[[open()]] 返回迭代器，[[for line in f]] 逐行读，[[readlines()]] 物化全部；大文件用流式。文本模式解码，二进制模式 [[rb]] 读原始字节；写文件指定编码和换行。检查点：[[len("中")]] 和 [[len("中".encode())]] 差多少？BOM 用哪个编码参数？[[errors="ignore"]] 为什么危险？`,
      code: String.raw`text = "中"
print(len(text), len(text.encode("utf-8")))
print(text.encode("utf-8"))
print(b"\xe4\xb8\xad".decode("utf-8"))
print("中".encode("ascii", errors="replace"))
print("中".encode("ascii", errors="ignore"))`,
      output: `1 3
b'\xe4\xb8\xad'
中
b'?'
b''`,
      tip: `[[errors="ignore"]] 会静默丢掉字符；线上数据宁可直接失败，也不要悄悄损坏。`
    }
  ],
  "ch3-3": [
    {
      h: "术语卡：元组、记录与解包",
      p: `术语卡一：不可变与可哈希。元组本身不可变，但内部元素可能可变；[[(1, [2])]] 不可哈希，不能当字典键。元组可哈希的前提是所有元素递归可哈希；frozenset、字符串、数字、None 可以。\n\n术语卡二：逗号。[[(1)]] 是整数，[[(1,)]] 是单元素元组；[[1, 2]] 不加括号也是元组。函数返回多个值本质返回元组；调用方可以整体接收或解包。\n\n术语卡三：解包。左边元素数要匹配，[[*rest]] 吸收剩余且只能出现一次；嵌套解包适合固定结构，结构不固定就改用字段访问。解包 [[None]] 会抛 TypeError，可能返回 None 的函数先判断。\n\n术语卡四：记录。namedtuple 给元组加字段名，[[_replace()]] 返回新记录；dataclass 适合需要校验/默认值/方法的场景。元组适合轻量只读记录，不适合频繁修改。检查点：[[(1)]] 和 [[(1,)]] 类型一样吗？[[(1, [2])]] 能当字典键吗？解包 [[None]] 会怎样？`,
      code: String.raw`one = (1)
two = (1,)
print(type(one), type(two))

row = ("S01", ("林晓", 91))
sid, (name, score) = row
print(sid, name, score)

try:
    a, b = None
except TypeError as err:
    print(err)`,
      output: `<class 'int'> <class 'tuple'>
S01 林晓 91
cannot unpack non-iterable NoneType object`,
      tip: `[[(1)]] 只是加括号的整数；单元素元组必须写 [[(1,)]]，函数返回单值元组也一样。`
    }
  ]
});

/* --- deep-apply.js --- */

(function () {
  'use strict';
  var chapters = window.PY_FOUNDATIONS_CHAPTERS || [];
  var first = window.PY_FOUNDATIONS_DEEP || {};
  var second = window.PY_FOUNDATIONS_DEEP2 || {};
  var read = window.PY_FOUNDATIONS_READ || {};
  var finalExtra = window.PY_FOUNDATIONS_FINAL || {};
  var review = window.PY_FOUNDATIONS_REVIEW || {};
  var review2 = window.PY_FOUNDATIONS_REVIEW2 || {};
  var review3 = window.PY_FOUNDATIONS_REVIEW3 || {};
  chapters.forEach(function (chapter) {
    (chapter.lessons || []).forEach(function (lesson) {
      var extra = (first[lesson.id] || []).concat(second[lesson.id] || [], read[lesson.id] || [], finalExtra[lesson.id] || [], review[lesson.id] || [], review2[lesson.id] || [], review3[lesson.id] || []);
      if (extra.length) {
        lesson.sections = (lesson.sections || []).concat(extra);
      }
    });
  });
})();

/* --- expand8.js --- */

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

  add("ch8-1", [{
    h: "工程深化：把 import 的副作用关进笼子",
    p: `上一节讲清了 import 只执行一次、模块级代码会在第一次导入时运行。真实项目里，这条规则最容易被两个东西破坏：模块顶层读配置、模块顶层连数据库。前者让测试一导入就报环境变量缺失，后者让本来只想用一个纯函数的脚本莫名连上生产库。解决办法不是「不要写模块顶层代码」这么一句口号，而是把副作用集中到明确的入口。

一个可维护的模块应该分成三层：纯定义（常量、类、函数）、惰性资源（第一次调用时才创建）、以及显式启动（[[main()]] 或应用工厂）。模块顶层只做纯定义；需要文件、网络、数据库的对象放进函数，或者放进带缓存的工厂。读取环境变量也应在工厂里做，而不是在 import 时做。这样测试可以导入模块而不触碰外部世界，部署时才在入口处校验配置。

延迟导入常被误解为「偷懒」。它的真正价值是控制启动成本和隔离可选依赖：命令行只做 --help 时，不必加载 pandas；没安装 matplotlib 时，报表仍能输出 Markdown。实现上用函数内 [[importlib.import_module("pandas")]] 或函数内 [[import pandas]]，并把 ImportError 转成清楚的安装提示。不要让一个可选依赖在模块顶层失败，拖垮整个程序。

还要区分「第一次导入」和「重复导入」的成本。[[sys.modules]] 命中时几乎不执行模块体，但属性查找、包初始化、插件扫描仍可能很贵。可以用 [[python -X importtime -c "import scores"]] 看每个模块的累计耗时，先找最大的那几项，再决定是否延迟。不要凭感觉把 import 到处挪，挪错了只会把错误推迟到运行时。

插件注册也常被写成 import 副作用：包一导入就扫描目录、注册所有子类。更稳的做法是显式注册表加惰性发现：核心只暴露 [[register()]]，插件在自己的入口调用；需要自动发现时，用 [[importlib.metadata.entry_points()]] 或 [[pkgutil.iter_modules()]] 在应用启动阶段统一加载。这样依赖方向清楚，测试也能只注册假插件。

最后给一条验收标准：在一个干净的解释器里执行 [[import scores]]，不应该产生网络请求、不应该创建文件、不应该要求环境变量；所有外部依赖都应在调用具体功能时才出现。做不到这一点，模块的导入边界就还没有设计好。`,
    code: String.raw`# scores/config.py：顶层不读环境变量
import os
from dataclasses import dataclass

@dataclass(frozen=True)
class Settings:
    db_url: str
    timeout: float = 3.0

def load_settings() -> Settings:
    url = os.environ.get("SCORES_DB_URL")
    if not url:
        raise RuntimeError("SCORES_DB_URL is required")
    return Settings(db_url=url, timeout=float(os.environ.get("SCORES_TIMEOUT", "3")))

# scores/report.py：可选依赖延迟加载
def render_png(rows, path):
    try:
        import matplotlib.pyplot as plt
    except ImportError as exc:
        raise RuntimeError("install scores[plot] to render PNG") from exc
    fig, ax = plt.subplots()
    ax.plot([r["date"] for r in rows], [r["seconds"] for r in rows])
    fig.savefig(path)
    plt.close(fig)

# 验收：python -c "import scores" 应无副作用
# 启动成本：python -X importtime -c "import scores"`,
    output: `$ python -X importtime -c "import scores"
import time: self [us] | cumulative | imported package
...
# 只观察，不把 importtime 输出当性能结论；
# 先找累计最大的模块，再决定是否延迟加载。`,
    tip: `模块顶层只放纯定义；配置读取、网络连接、可选依赖都放进函数或应用工厂。`
  }]);

  add("ch8-2", [{
    h: "工程深化：包资源、公开 API 与兼容边界",
    p: `包做起来以后，真正容易翻车的不是「能不能 import」，而是「装到别的机器上还能不能找到文件」。很多代码用 [[Path(__file__).parent / "data" / "template.txt"]] 读包内资源，在本机源码目录里一切正常，打成 wheel 后路径变了，或者被 zip 导入时根本没有真实文件。包资源要用 [[importlib.resources]] 读取，不要靠 [[__file__]] 猜目录。

[[importlib.resources.files("scores") / "data" / "template.txt"]] 返回一个 Traversable，可以 [[read_text()]]、[[open()]]，也能在 zip 包中工作。需要把资源复制到临时目录给外部程序用时，用 [[as_file()]] 包一层，并在 with 块内使用。资源目录要写进构建配置的 package-data，否则 wheel 里不会带；这一步经常被漏掉，结果是「本地能跑、安装后报 FileNotFoundError」。

公开 API 要有边界。[[__all__]] 不是访问控制，但它能告诉 [[from scores import *]] 和文档工具「哪些名字是给外部用的」。更重要的是团队约定：以单下划线开头的是内部实现，不以单下划线开头的才承诺兼容。重构时先改内部名字，公开名字保留别名或弃用期。不要把所有 helper 都塞进 [[__init__.py]]，那会让包的导入变慢，也会让外部代码依赖本不该依赖的东西。

包的 [[__init__.py]] 应该轻：版本号、公开名字、极少量初始化。重逻辑放到子模块，调用方按需导入。一个常见反模式是把数据库连接、日志配置、命令行解析都写进 [[__init__.py]]，结果任何子模块导入都会触发一遍。判断标准很简单：导入包只应该得到名字和元数据，不应该产生外部副作用。

兼容性上，给公开函数加参数时优先加「仅限关键字」参数并给默认值；不要改变已有参数的位置和含义。删除公开名字前先发弃用警告，至少跨一个小版本。类型提示也要跟着改，否则调用方的检查器会先炸。版本号、[[__all__]]、文档三处要保持一致，不能代码里删了、文档还留着。

最后做一个安装后验收：在一个干净 venv 里 [[pip install .]]，然后执行 [[python -c "import scores; print(scores.__version__)"]]，再调用一次读取模板的功能。源码目录能跑不算数，wheel 安装后能跑才算包真的完整。`,
    code: String.raw`# scores/resources.py
from importlib import resources
from importlib.resources import as_file

def read_template() -> str:
    return (resources.files("scores") / "data" / "report.md").read_text(encoding="utf-8")

def template_path():
    return as_file(resources.files("scores") / "data" / "report.md")

# pyproject.toml
# [tool.setuptools.package-data]
# scores = ["data/*.md", "py.typed"]

# 干净环境验收
# python -m venv /tmp/verify
# /tmp/verify/bin/pip install dist/scores-0.3.0-py3-none-any.whl
# /tmp/verify/bin/python -c "from scores.resources import read_template; print(read_template()[:20])"`,
    output: `# 源码目录和 wheel 安装后都应输出同样的模板开头；
# 如果只在源码目录成功，优先检查 package-data 与 __file__ 用法。`,
    tip: `包内文件用 importlib.resources 读，不用 __file__ 拼路径；构建配置要带 package-data。`
  }]);

  add("ch8-3", [{
    h: "工程深化：可复现环境不是「pip freeze 一下」",
    p: `[[pip freeze > requirements.txt]] 看起来能得到一份完整清单，但它记录的是「当前环境里有什么」，不是「这个项目需要什么」。开发机上的 Jupyter、调试器、其他项目的依赖都会混进去；换一台机器安装时，依赖树可能完全不同。可复现环境要区分「直接依赖」和「锁定结果」，还要记录 Python 版本与索引来源。

直接依赖写在 [[pyproject.toml]] 的 [[project.dependencies]]，只写你真正 import 的包，并给出合理范围，例如 [[requests>=2.31,<3]]。锁定文件记录解析后的精确版本与哈希，常用工具是 pip-tools、uv、Poetry 或 PDM。[[requirements.in]] 写直接依赖，[[pip-compile]] 生成 [[requirements.txt]]；或者用 [[uv lock]] 生成 [[uv.lock]]。不要把两者混成一个文件。

[[constraints.txt]] 是另一层：它只限制版本，不主动安装包，适合让多个项目共享一组安全版本上限。比如公司要求 [[urllib3<2.3]]，就把约束传给 pip，而不是在每个项目里重复写。约束和锁文件不要互相替代：锁文件保证「这一套版本能一起工作」，约束保证「不要越过某个红线」。

Python 版本本身也要锁。[[requires-python = ">=3.11,<3.14"]] 只是声明兼容范围，CI 要真的在 3.11、3.12、3.13 上跑。生产环境还要固定到具体小版本，例如 3.13.2，避免半年后补丁升级带来行为差异。解释器、系统库、编译工具链都会影响 wheel 选择，不能只锁 pip 包。

离线安装要提前准备 wheel。[[pip download -r requirements.txt -d wheels/]] 把依赖下载成 wheel，再用 [[pip install --no-index --find-links wheels/ -r requirements.txt]] 安装。注意平台标签：在 macOS 下载的 wheel 不能直接给 Linux 用；要为目标平台下载 [[--only-binary=:all:]] 并检查 [[manylinux]] 版本。纯 Python 包通常跨平台，带 C 扩展的包不是。

验收命令要能重复执行：删除 venv、按锁文件安装、跑测试、启动 CLI，四步都过才算环境可复现。[[pip check]] 只能发现元数据冲突，发现不了代码层面的不兼容；所以还要有最小集成测试。把「安装成功」当成「环境正确」是另一个常见误区。

最后一条纪律：锁文件必须提交到仓库，依赖变更必须和锁文件变更在同一个提交里。只改 pyproject 不更新锁，CI 会装到旧版本；只改锁不解释原因，review 时没人知道为什么升级。锁文件是构建产物，也是审计记录。`,
    code: String.raw`# requirements.in：只写直接依赖
requests>=2.31,<3
pandas>=2.2,<3

# 生成锁定文件（pip-tools）
pip-compile requirements.in -o requirements.txt --generate-hashes

# 安装锁定版本
python -m pip install -r requirements.txt

# 约束文件：只限版本，不主动安装
# constraints.txt
urllib3<2.3
python -m pip install -r requirements.txt -c constraints.txt

# 离线 wheel
python -m pip download -r requirements.txt -d wheels/ --only-binary=:all:
python -m pip install --no-index --find-links wheels/ -r requirements.txt
python -m pip check`,
    output: `# 可复现验收：
# 1) 删除旧 venv  2) 按锁文件安装  3) 跑 pytest  4) 跑 scores --help
# 四步全过，才把这份 lock 交给 CI 和生产。`,
    tip: `直接依赖写 pyproject，精确版本写锁文件，安全上限写 constraints；三者不要混。`
  }]);
})();

/* --- expand9.js --- */

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

  add("ch9-1", [{
    h: "工程深化：原子写、崩溃安全与文件锁",
    p: `写文件最危险的时刻不是 write 报错，而是写到一半进程被杀。直接 [[open(path, "w")]] 会先截断旧文件，再逐块写入；如果此时断电、容器重启或程序崩溃，原文件已经没了，新文件又不完整。对报表、数据库导出、配置文件这类「不能丢」的文件，必须用「临时文件 + fsync + 原子 rename」的流程。

做法是：在目标目录创建同目录临时文件，写入内容后 [[flush()]]，再 [[os.fsync(fileno)]]，最后 [[os.replace(tmp, target)]]。同目录很关键，跨文件系统的 rename 不是原子操作。[[os.replace]] 在 POSIX 上覆盖目标也是原子的；Windows 上同样会替换，但目标被占用时会失败，要捕获 PermissionError 并提示关闭文件。写完还要尽量 fsync 目录，确保目录项也落盘；很多教程漏掉这一步。

文件锁用于防止两个进程同时改同一份数据。[[fcntl.flock]] 在 Unix 可用，Windows 要用 [[msvcrt.locking]] 或第三方库。锁文件本身也有坑：进程崩溃后锁会自动释放（flock 随文件描述符关闭），但用「创建一个 .lock 文件」的方案可能留下僵尸锁。优先用操作系统锁，不要自己用 [[os.path.exists]] 判断。

并发写的另一个误区是「每个进程写自己的文件就安全」。如果多个进程最后都要更新同一个汇总文件，仍然会丢更新。要么让一个进程串行汇总，要么用数据库事务/队列，要么写分区文件最后合并。文件系统不是数据库，不提供跨进程事务。

临时文件要放在目标目录，命名带 pid 与随机串，权限按最终文件设置。[[tempfile.NamedTemporaryFile(dir=target.parent, delete=False)]] 可以用，但要记得在 finally 里删除临时文件；[[os.replace]] 成功后临时路径已不存在。异常路径必须清理，否则目录会被 tmp 文件塞满。

验收要模拟失败：写一半抛异常，确认旧文件仍然完整；两个进程同时写，确认最终只有一个版本且没有半截内容；kill -9 后再启动，确认能识别并清理残留临时文件。只测试成功路径，等于没有测试原子写。`,
    code: String.raw`from pathlib import Path
import os, tempfile

def atomic_write(path: Path, text: str) -> None:
    path = path.resolve()
    fd, tmp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    tmp = Path(tmp_name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(text)
            fh.flush()
            os.fsync(fh.fileno())
        os.replace(tmp, path)
        try:
            dfd = os.open(path.parent, os.O_RDONLY)
            try:
                os.fsync(dfd)
            finally:
                os.close(dfd)
        except OSError:
            pass
    finally:
        if tmp.exists():
            tmp.unlink()`,
    output: `# 正常：目标文件只在写完后出现新内容
# 异常：旧文件保持不变，临时文件被清理
# 并发：最后一个是完整文件，不会出现半截 JSON`,
    tip: `同目录临时文件 + fsync + os.replace；不要直接 open("w") 覆盖重要文件。`
  }]);

  add("ch9-2", [{
    h: "工程深化：给 CSV/JSON 加数据契约，不要等下游报错",
    p: `CSV 和 JSON 能读进来，不代表数据可信。缺列、空值、类型漂移、重复主键、编码错误，都会在统计阶段变成莫名其妙的数字。数据契约的作用是把这些检查前移：读入后先验证结构，再进入业务逻辑；错误要带行号、列名、原始值，而不是只抛一个 ValueError。

最小契约包括：必需列是否齐全、每列的类型、是否允许空、取值范围、唯一键、枚举值。CSV 还要检查分隔符、引号、BOM、行尾换行。JSON 要检查顶层是对象还是数组、字段嵌套、数字是否被当成字符串。验证器可以先手写，复杂后再引入 JSON Schema 或 pydantic；不要一上来就上重框架，先把错误信息做清楚。

错误策略有两种：fail-fast 适合配置文件、金额、权限这类「错一条就不能继续」的数据；收集全部错误适合批量导入，让用户一次看到所有坏行。实现上用一个 [[errors]] 列表记录 [[RowError(row, column, value, reason)]]，超过阈值再停止，避免坏文件产生百万条错误把内存撑爆。

类型转换要显式。CSV 读出来一切都是字符串，[[int("12.0")]] 会失败；空字符串不能直接转 float；时区、小数逗号、千分位都要先规范化。转换函数应该返回「值或错误」，而不是用异常控制正常流程。一个 [[parse_seconds("1:02.35")]] 应该能区分「格式错误」和「超出范围」。

验证通过后，输出一份导入报告：总行数、成功数、失败数、跳过数、错误分布、前 N 条错误。报告既是给用户看的，也是后续对账的依据。不要只打印「导入完成」，那等于没有可观测性。

最后做契约测试：给一份最小合法样例、一份缺列样例、一份类型错误样例、一份空文件样例，确认每种都给出预期错误。数据契约不是文档里的一句话，而是能被执行、被回归的测试。`,
    code: String.raw`from dataclasses import dataclass
from datetime import datetime
import csv

@dataclass
class RowError:
    row: int
    column: str
    value: str
    reason: str

REQUIRED = {"date", "athlete", "event", "seconds"}

def parse_row(row: dict, line_no: int, errors: list) -> dict | None:
    missing = REQUIRED - row.keys()
    if missing:
        errors.append(RowError(line_no, "row", "", f"missing columns: {sorted(missing)}"))
        return None
    try:
        seconds = float(row["seconds"])
    except ValueError:
        errors.append(RowError(line_no, "seconds", row["seconds"], "not a number"))
        return None
    if seconds <= 0 or seconds > 3600:
        errors.append(RowError(line_no, "seconds", row["seconds"], "out of range"))
        return None
    return {"date": row["date"], "athlete": row["athlete"].strip(),
            "event": row["event"].strip(), "seconds": seconds}

def read_rows(path, errors):
    with open(path, encoding="utf-8-sig", newline="") as fh:
        for i, row in enumerate(csv.DictReader(fh), start=2):
            parsed = parse_row(row, i, errors)
            if parsed:
                yield parsed`,
    output: `# 错误报告示例：
# row=7 column=seconds value="1,02.35" reason="not a number"
# 总行 120，成功 118，失败 2，错误全部带行号与原始值。`,
    tip: `先验证结构再转类型；错误带行号/列名/原值；批量导入收集错误而不是第一条就中断。`
  }]);

  add("ch9-3", [{
    h: "工程深化：ExceptionGroup、重试边界与异常设计",
    p: `普通 [[except]] 一次只能处理一个异常；批量任务里多个子任务同时失败时，逐个抛会丢掉「还有哪些也失败了」。Python 3.11 的 [[ExceptionGroup]] 把多个异常打包，[[except*]] 可以按类型分组处理。它不是「异常套异常」的语法糖，而是让并发/批处理保留完整的失败集合。

典型用法：用 [[TaskGroup]] 并发跑多个导入任务，所有子任务结束后把异常聚合成 ExceptionGroup；外层用 [[except* ValueError]] 处理数据错误，用 [[except* OSError]] 处理文件错误，最后检查是否还有未处理的异常。不要在 except 里只打印第一条，然后假装任务结束。

重试不是对所有异常都适用。网络超时、429、503、连接重置通常可重试；400、401、403、404、数据校验失败通常不可重试；编程错误（TypeError、KeyError）重试一万次也不会好。重试策略要按异常类型白名单，不要写一个 [[except Exception: retry]]。

退避要有上限和抖动。固定 sleep 会让所有客户端同时重试，形成惊群；指数退避加随机抖动能打散。还要读服务端的 [[Retry-After]]，它比自己的公式更权威。总耗时要有预算，不能因为重试把一次请求拖成十分钟；超过预算就失败并带上最后一次错误。

异常链要保留根因。捕获底层异常后抛业务异常，用 [[raise ReportError("import failed") from exc]]，traceback 会同时保留两层。只写 [[raise ReportError(...)]] 会丢掉原始堆栈，排查时只能猜。反过来，也不要把所有异常都包成同一个自定义异常，调用方就无法区分「文件不存在」和「格式错误」。

自定义异常要少而清晰：一个基类、按层级的几个子类、必要的字段（路径、行号、任务 id）。异常消息给人和日志看，字段给程序判断。不要把异常当控制流：可预期的「没找到」可以返回 None 或 Result，真正的异常留给意外。

验收时至少测试三类：可重试异常最终成功、可重试异常耗尽预算、不可重试异常立即失败。再测试 ExceptionGroup 的聚合结果是否完整。异常路径的测试覆盖率，往往比成功路径更能说明工程质量。`,
    code: String.raw`import asyncio, random

class Retryable(RuntimeError): pass
class Permanent(RuntimeError): pass

async def call_once(i):
    if i < 2:
        raise Retryable(f"temporary {i}")
    if i == 2:
        raise Permanent("bad request")
    return "ok"

async def with_retry(fn, attempts=4, base=0.2):
    last = None
    for n in range(attempts):
        try:
            return await fn(n)
        except Retryable as exc:
            last = exc
            if n == attempts - 1:
                break
            await asyncio.sleep(base * (2 ** n) + random.random() * 0.1)
    raise Retryable(f"retry budget exhausted: {last}")

async def main():
    try:
        print(await with_retry(call_once))
    except Retryable as exc:
        print("retryable failed", exc)
    except Permanent as exc:
        print("permanent failed", exc)

asyncio.run(main())`,
    output: `retryable failed retry budget exhausted: temporary 1`,
    tip: `只重试白名单异常；指数退避 + 抖动 + 总预算；保留 raise ... from 的根因链。`
  }]);

  add("ch9-4", [{
    h: "工程深化：结构化日志与一次真实排障",
    p: `线上排错最怕的不是没有日志，而是日志里全是「开始处理」「处理完成」，没有任务 id、没有输入、没有耗时。人类读的日志和机器检索的日志要同时满足：一条日志至少有级别、时间、logger 名、消息、以及可检索的上下文字段。

Python 标准库的 [[logging]] 就能做结构化：用 [[extra={"task_id": ...}]] 挂字段，再用自定义 Formatter 输出 JSON；或者用 [[structlog]]。关键是上下文要自动传播，不要每个函数都手动传 task_id。同步代码用 [[contextvars.ContextVar]]，异步代码同样适用；线程池里要显式复制上下文，否则子线程拿不到。

日志级别要克制。DEBUG 给开发定位细节，INFO 给正常业务里程碑，WARNING 给可恢复的异常，ERROR 给失败但程序还能继续，CRITICAL 给不可用。不要把每次重试都打成 ERROR，那会淹没真正的故障；重试中的第一次失败用 WARNING，最终失败用 ERROR。

异常日志要带堆栈，但不要重复打印同一个异常。顶层捕获一次，用 [[logger.exception("import failed", extra={"task_id": task_id})]] 记录完整堆栈；内层只记录上下文或直接 raise，不要每层都 log 一遍。重复日志会让告警系统重复计数。

排查顺序：先看时间窗口和任务 id，确认失败发生在哪一步；再看输入参数、数据版本、依赖版本；最后看系统指标（CPU、内存、磁盘、连接数）。不要一上来就重启，重启会丢掉现场。能复现时，用同一份输入在本地跑；不能复现时，补日志而不是猜。

日志轮转要配置：按大小或时间切分，保留 N 份，压缩旧文件，设置权限。容器环境优先输出 stdout，让平台收集，不要自己写文件再挂卷。日志里不要放密码、token、完整身份证号；需要关联用户时用哈希或内部 id。

最后做一次「故障演练」：人为让导入器抛异常，确认日志里有 task_id、行号、原始值、堆栈，告警能触发，用户能看到可理解的错误。演练不过，真实故障时一定手忙脚乱。`,
    code: String.raw`import logging, json, contextvars, uuid

task_id = contextvars.ContextVar("task_id", default="-")

class JsonFormatter(logging.Formatter):
    def format(self, record):
        payload = {
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
            "task_id": task_id.get(),
        }
        if record.exc_info:
            payload["exc"] = self.formatException(record.exc_info)
        return json.dumps(payload, ensure_ascii=False)

handler = logging.StreamHandler()
handler.setFormatter(JsonFormatter())
log = logging.getLogger("scores")
log.addHandler(handler)
log.setLevel(logging.INFO)

def import_file(path):
    token = task_id.set(uuid.uuid4().hex[:8])
    try:
        log.info("import start", extra={"path": path})
        # ... 实际导入 ...
        log.info("import done")
    except Exception:
        log.exception("import failed")
        raise
    finally:
        task_id.reset(token)`,
    output: `{"level": "INFO", "logger": "scores", "msg": "import start", "task_id": "a1b2c3d4"}
{"level": "ERROR", "logger": "scores", "msg": "import failed", "task_id": "a1b2c3d4", "exc": "Traceback ..."}`,
    tip: `结构化字段 + contextvars 传播 task_id；异常只在顶层记录一次；日志里不放密钥。`
  }]);
})();

/* --- expand10.js --- */

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

  add("ch10-1", [{
    h: "工程深化：dataclass 的 frozen、slots 与默认工厂",
    p: `[[@dataclass]] 把 [[__init__]]、[[__repr__]]、[[__eq__]] 自动生成，但它不是「随便加个装饰器就完事」。三个参数决定对象的行为边界：[[frozen=True]] 让实例不可变，[[slots=True]] 去掉 [[__dict__]] 并限制动态属性，[[default_factory]] 为可变默认值提供独立副本。用错任何一个，都会在测试或序列化时暴露。

[[frozen=True]] 的对象在 [[__init__]] 结束后禁止赋值，适合值对象：成绩记录、配置、事件。它让对象可哈希（前提是所有字段可哈希），可以放进 set 或作为 dict 的键。但 frozen 不是深度不可变：字段是 list 时，list 里的元素仍可改。需要深度不可变时，用 tuple、frozenset 或自定义只读容器，不要以为 frozen 包住一切。

[[slots=True]] 省内存，也防止拼错属性名，但它会改变继承行为：子类默认仍有 [[__dict__]]，除非子类也声明 slots；[[__slots__]] 里不能和类变量同名；不能多继承两个都有非空 slots 的类。不要在「可能被继承的基类」上随手加 slots，先确认继承链。

[[default_factory=list]] 解决可变默认值共享问题。直接写 [[items: list = []]] 会让所有实例共用同一个列表，这是 Python 最经典的陷阱之一。dataclass 会拒绝 list/dict/set 直接作默认值，但自定义可变对象仍可能漏掉；统一用 factory 最稳。工厂函数每次调用返回新对象，也可以做深拷贝。

[[__post_init__]] 适合做校验和派生字段：比如把秒数规范化为毫秒、检查年龄范围、生成 display 名。但不要在 [[__post_init__]] 里做网络请求或读文件，那会让构造对象变成重操作。校验失败抛 ValueError，并带上字段名和非法值，调用方才知道怎么修。

序列化边界要明确：dataclass 转 dict 用 [[dataclasses.asdict]]，但嵌套对象会递归复制；转 JSON 要处理 datetime、Decimal、Enum。不要让领域对象直接依赖 JSON 库，序列化放到 adapter 层。对象内部用 datetime，输出层再格式化，这样领域逻辑不被展示格式污染。

验收：两个字段相同的对象相等吗？frozen 对象能当 dict 键吗？两个实例的 list 字段是同一个对象吗？slots 对象能随便加属性吗？这四个问题都能答对，dataclass 才算真的会用。`,
    code: String.raw`from dataclasses import dataclass, field
from datetime import date

@dataclass(frozen=True, slots=True)
class Result:
    athlete: str
    event: str
    seconds: float
    tags: tuple[str, ...] = ()
    checks: list[str] = field(default_factory=list)

    def __post_init__(self):
        if not 0 < self.seconds < 3600:
            raise ValueError(f"seconds out of range: {self.seconds}")

r1 = Result("林晓", "100m", 12.34)
r2 = Result("林晓", "100m", 12.34)
print(r1 == r2)
print(hash(r1) == hash(r2))
print(r1.checks is r2.checks)`,
    output: `True
True
False`,
    tip: `frozen 管赋值、slots 管内存与属性集合、default_factory 管可变默认值；三者别混用。`
  }]);

  add("ch10-2", [{
    h: "工程深化：组合、仓储接口与依赖注入",
    p: `组合的本质是「对象 A 使用对象 B」，但很多代码把「使用」写成了「拥有并创建」：[[Team]] 内部直接 [[self.repo = SqliteRepo()]]。这样测试 [[Team]] 就必须连数据库，替换存储也只能改源码。依赖注入把「创建」移到外部，让对象只依赖接口，测试可以传假对象。

最小做法是构造函数接收依赖：[[Team(repo, clock)]]，默认参数可以给生产实现，但测试显式传 fake。更严格的做法是不给默认值，由应用入口组装；库代码不要偷偷创建全局资源。这样依赖方向清楚：领域层不 import 基础设施，基础设施反过来依赖领域接口。

接口用 [[Protocol]] 描述就够了，不一定要继承 ABC。[[class Repo(Protocol)]] 定义 [[save(record)]] 和 [[list_all()]] 的签名，实现类不需要继承，静态检查器也能检查结构。Protocol 适合「我只需要这个能力」，ABC 适合「我必须阻止误用、要注册子类」。两者不要为了架构感而堆。

假对象要能模拟失败，而不只是返回成功。测试至少覆盖：存储抛异常时领域层是否回滚、重复主键是否报错、空结果是否处理。只测 happy path 的 fake 没有价值。可以用一个 [[FailingRepo]] 在保存时抛 [[OSError]]，确认上层返回可读错误而不是吞掉。

对象边界要防止「组合变成大泥球」。[[Team]] 负责团队规则（总分、名次），[[Repo]] 负责持久化，[[Report]] 负责展示。一个类如果同时做查询、格式化、写文件、发邮件，就不是组合，而是把多个职责塞进一个壳。拆分的标准是「能否单独测试」和「换实现是否影响其他逻辑」。

循环依赖常出现在组合里：A 需要 B，B 又需要 A。不要用 [[import]] 技巧硬解，先看是否可以通过事件、回调、接口倒置来打破。比如 Team 不直接调用 Notifier，而是返回事件列表，由应用层决定是否通知。依赖方向应该是「稳定层被依赖，易变层依赖稳定层」。

验收：把 SqliteRepo 换成内存 Repo，Team 的测试是否不需要改？把时钟换成固定时间，排名是否可复现？把 Notifier 换成记录器，是否不产生真实邮件？这三个替换都能做到，组合和注入才算落地。`,
    code: String.raw`from typing import Protocol

class Repo(Protocol):
    def save(self, record: dict) -> None: ...
    def list_all(self) -> list[dict]: ...

class MemoryRepo:
    def __init__(self):
        self.rows = []
    def save(self, record):
        self.rows.append(dict(record))
    def list_all(self):
        return list(self.rows)

class Team:
    def __init__(self, repo: Repo):
        self.repo = repo

    def add(self, record):
        if any(r["athlete"] == record["athlete"] for r in self.repo.list_all()):
            raise ValueError("duplicate athlete")
        self.repo.save(record)

team = Team(MemoryRepo())
team.add({"athlete": "林晓", "seconds": 12.3})
print(team.repo.list_all())`,
    output: `[{'athlete': '林晓', 'seconds': 12.3}]`,
    tip: `对象只依赖 Protocol；生产实现在入口组装；测试传可失败的假对象。`
  }]);

  add("ch10-3", [{
    h: "工程深化：模型演化、Enum 与向后兼容",
    p: `对象模型不是一次定型。字段会增删、状态会变多、旧数据还要能读。没有版本策略的模型，第一次改字段就会让历史 JSON 全部解析失败。模型演化要提前设计：区分「必填核心字段」和「可选扩展字段」，给序列化格式留版本号，给旧字段留兼容读取。

状态值不要用裸字符串。[[status = "active"]] 拼错、大小写不一致、增加新状态时没有集中清单，都会让分支到处漏。用 [[Enum]] 固定取值，序列化时明确用 [[.value]]，比较时用枚举成员。Enum 的成员名给代码看，value 给外部协议看；两者不要随意改。

版本兼容的常见做法：读取时接受旧字段名，写出时只写新字段名；新增字段给默认值；删除字段先保留读取逻辑一个版本，再清理。不要用 [[dict.get]] 到处兜底，把兼容逻辑集中到一个 [[from_dict]] 工厂，其他代码只见新模型。

[[from_dict]] 要严格：未知字段是忽略还是报错？缺失字段是否有默认？类型不对是否转换？这些策略要写清楚。对外部 API 的数据可以宽松读取、严格写出；对自己数据库的数据可以严格读取，防止脏数据扩散。宽松不是无原则，所有转换都要记录 warning。

模型相等要区分「同一实体」和「值相同」。两个 [[Result]] 字段全同，值相等；两个 [[Athlete]] id 相同但名字改了，是同一实体但对象不等。[[__eq__]] 按什么字段比较，要在类文档里写清楚；[[__hash__]] 必须和 [[__eq__]] 一致，否则 dict/set 行为会诡异。

迁移脚本要能重复执行。读旧格式、写新格式、记录迁移数量、失败行号；迁移前备份，迁移后校验计数和抽样。不要写一个「一次性脚本」跑完就删，出问题时无法回滚。

验收：用一份旧版本 JSON 导入，模型能读；导出新 JSON 再导入，字段不丢；未知枚举值给明确错误；两个 id 相同的对象相等性符合业务定义。模型演化不是「以后再说」，第一次发布就要留好退路。`,
    code: String.raw`from dataclasses import dataclass, field
from enum import Enum

class Status(str, Enum):
    ACTIVE = "active"
    INJURED = "injured"
    RETIRED = "retired"

@dataclass
class Athlete:
    id: str
    name: str
    status: Status = Status.ACTIVE
    tags: list[str] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: dict) -> "Athlete":
        data = dict(data)
        if "state" in data and "status" not in data:
            data["status"] = data.pop("state")
        data["status"] = Status(data.get("status", "active"))
        return cls(id=data["id"], name=data["name"],
                   status=data["status"], tags=list(data.get("tags", [])))

a = Athlete.from_dict({"id": "A01", "name": "林晓", "state": "active"})
print(a.status.value, a.tags)`,
    output: `active []`,
    tip: `状态用 Enum；旧字段在 from_dict 集中兼容；写出只写新格式；迁移脚本可重复执行。`
  }]);
})();

/* --- expand11.js --- */

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

  add("ch11-1", [{
    h: "工程深化：抽象基类、注册表与插件发现",
    p: `[[ABC]] 和 [[@abstractmethod]] 的价值不是「看起来很面向对象」，而是把「实现类漏了方法」从运行时错误提前到实例化时。抽象方法只写签名、不写实现，子类必须覆盖；如果子类忘了，[[TypeError]] 会在创建对象时出现，而不是等到调用才炸。这比文档约定可靠。

抽象基类不要做成「什么都管」的上帝类。一个 [[Exporter]] 只需要 [[export(rows)]] 和 [[suffix]] 两个抽象成员；日志、重试、临时文件由具体类或装饰器处理。抽象越少，子类越容易实现，也越容易替换。把可选能力做成带默认实现的普通方法，而不是抽象方法。

插件注册可以用 [[__init_subclass__]]：基类在子类创建时自动把它登记到注册表。它比元类轻，比分发字典少一步手动注册。写法是定义 [[registry = {}]]，在 [[__init_subclass__(cls, **kwargs)]] 里调用 super，然后用类属性 [[name]] 作为键。重复名字要报错，不能后注册的静默覆盖。

自动注册的副作用是「导入即注册」。如果插件模块没有被 import，注册表就是空的。解决方式有两种：显式导入插件包，或用 [[pkgutil.iter_modules]] / [[entry_points]] 在启动时发现。前者可控，后者方便；生产环境通常用 entry_points，测试用手动注册，避免扫描整个环境。

抽象基类也能做「能力检查」：[[isinstance(obj, Exporter)]] 对虚拟子类也成立，[[register()]] 可以把一个不继承基类的类登记进来。这个机制适合适配第三方对象，但不要滥用；过度使用会让类型关系变得不可预测。优先显式继承，虚拟子类只作兼容层。

注册表要加元数据：版本、支持的格式、是否需要可选依赖。插件加载失败时，记录插件名和 ImportError，不要让一个坏插件拖垮整个程序。启动日志里打印已加载插件清单，排障时能一眼看出「为什么少了 xlsx 导出」。

验收：删掉一个抽象方法，实例化是否报错？两个插件同名，是否拒绝启动？插件模块未导入，注册表是否为空？坏插件是否被隔离？这四个问题覆盖了抽象与插件的主要边界。`,
    code: String.raw`from abc import ABC, abstractmethod

class Exporter(ABC):
    registry = {}
    name: str
    suffix: str

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if getattr(cls, "name", None):
            if cls.name in cls.registry:
                raise ValueError(f"duplicate exporter: {cls.name}")
            cls.registry[cls.name] = cls

    @abstractmethod
    def export(self, rows: list[dict], path: str) -> None: ...

class CsvExporter(Exporter):
    name = "csv"
    suffix = ".csv"
    def export(self, rows, path):
        import csv
        with open(path, "w", newline="", encoding="utf-8") as fh:
            writer = csv.DictWriter(fh, fieldnames=list(rows[0]))
            writer.writeheader()
            writer.writerows(rows)

print(sorted(Exporter.registry))`,
    output: `['csv']`,
    tip: `抽象成员只保留必需能力；__init_subclass__ 自动注册；重名要报错，坏插件要隔离。`
  }, {
    h: "故障排查：MRO 冲突与 super 的真实行为",
    p: `多继承报 [[TypeError: Cannot create a consistent method resolution order]]，不是 Python 随便发脾气，而是 C3 线性化找不到同时满足「子类在父类前、声明顺序一致」的排列。常见触发是菱形继承里两个父类互相要求对方先出现。解决不是改 [[super()]] 写法，而是减少多继承层级或改用组合。

[[super()]] 在单继承里像「调用父类」，在多继承里是「调用 MRO 中下一个类」。所以 [[super().method()]] 不一定调用直接父类，可能跳到另一个分支。协作式多继承要求每个类都调用 super，并且签名兼容；只要有一个类不调用，后面的类就收不到。不要在多继承里混用「直接调用父类」和 super。

[[MRO]] 可以打印：[[Cls.__mro__]] 或 [[Cls.mro()]]。排查时先看顺序，再看每个类的 [[__init__]] 是否调用 super。一个典型 bug 是 A 的 [[__init__]] 调用 [[super().__init__()]]，B 的 [[__init__]] 不调用，结果 C 初始化时 A 的父类被跳过，属性没设置。

[[__init_subclass__]] 也会参与继承链；子类创建时父类的钩子会执行。不要在钩子里假设 [[cls]] 已经完整定义，类体还没结束。需要读取子类属性时，用 [[getattr(cls, name, None)]] 并处理缺失，不要直接访问必存在属性。

调试建议：先用 [[inspect.getmro]] 打印顺序，再在关键 [[__init__]] 里打印类名和参数，确认谁被调用、谁被跳过。不要靠猜；MRO 是确定的算法，冲突也是确定的。把继承图画出来，通常比读十遍代码快。

如果只是为了复用几个方法，优先用组合或模块级函数。多继承适合「多个独立能力真的需要协作」的场景，比如 mixin 只加一个小行为；不适合把业务层次硬堆成树。每增加一层继承，调试成本就上升一档。

验收：构造一个三层菱形，打印 MRO；删掉中间类的 super 调用，观察哪个初始化被跳过；再用组合改写，确认行为一致且更容易测试。`,
    code: String.raw`class A:
    def __init__(self):
        print("A")
        super().__init__()

class B(A):
    def __init__(self):
        print("B")
        super().__init__()

class C(A):
    def __init__(self):
        print("C")
        super().__init__()

class D(B, C):
    def __init__(self):
        print("D")
        super().__init__()

print([c.__name__ for c in D.__mro__])
D()`,
    output: `['D', 'B', 'C', 'A', 'object']
D
B
C
A`,
    tip: `super() 走 MRO 下一个类；协作式多继承每个类都要调用 super；能组合就别多继承。`
  }]);

  add("ch11-2", [{
    h: "工程深化：描述符、cached_property 与校验字段",
    p: `描述符是「类属性访问会被拦截」的机制。[[__get__]]、[[__set__]]、[[__delete__]] 定义在类上，实例访问属性时触发；[[property]] 只是描述符的一种便捷写法。理解描述符后，很多「魔法」就变得普通：方法绑定、类属性、缓存属性、ORM 字段，底层都是它。

数据描述符同时有 [[__get__]] 和 [[__set__]]，优先级高于实例 [[__dict__]]；非数据描述符只有 [[__get__]]，实例字典可以覆盖它。[[functools.cached_property]] 是非数据描述符，第一次计算后把结果写进实例 [[__dict__]]，所以要求类有 [[__dict__]]；slots 类不能直接用。

[[cached_property]] 适合「计算贵、结果不变」的派生值，比如把行数据解析成统计摘要。但它不是线程安全的：两个线程同时第一次访问，可能都计算一遍，后写的覆盖先写的。结果幂等时无所谓，有副作用时要用锁，或者改成显式缓存。对象被修改后缓存不会自动失效，要在 [[__setattr__]] 或业务方法里清掉。

校验字段可以用描述符实现：在 [[__set__]] 里检查类型、范围、空值，再写入实例字典。好处是规则集中、所有实例一致；坏处是每个字段都要建描述符对象，继承和 slots 要小心。简单场景用 [[__post_init__]] 或 property 更直接，不要为了「设计模式」上描述符。

描述符对象是类级共享的，状态不能放在描述符自己身上。比如 [[self.value]] 会被所有实例共用；要按实例存，写入 [[instance.__dict__["_value"]]] 或用 [[WeakKeyDictionary]]。这是描述符最常见的 bug，表现为「改一个对象，另一个对象也变了」。

[[__set_name__]] 可以在类创建时拿到属性名，适合自动生成存储键、注册字段、做 ORM 映射。它不能替代 [[__init_subclass__]]，两者职责不同：前者处理单个描述符，后者处理整个子类。

验收：给一个 slots 类加 cached_property，确认报错；两个线程同时访问缓存，确认结果一致；修改对象后缓存是否过期；描述符状态是否按实例隔离。`,
    code: String.raw`from functools import cached_property

class Positive:
    def __set_name__(self, owner, name):
        self.name = "_" + name
    def __get__(self, obj, owner=None):
        if obj is None:
            return self
        return getattr(obj, self.name)
    def __set__(self, obj, value):
        if not isinstance(value, (int, float)) or value <= 0:
            raise ValueError(f"{self.name[1:]} must be positive")
        setattr(obj, self.name, float(value))

class Jump:
    height = Positive()
    def __init__(self, height):
        self.height = height
    @cached_property
    def score(self):
        return round(self.height * 1.5, 2)

j = Jump(2.4)
print(j.height, j.score)
try:
    j.height = -1
except ValueError as e:
    print("rejected:", e)`,
    output: `2.4 3.6
rejected: height must be positive`,
    tip: `描述符状态要按实例存；cached_property 非线程安全且不会自动失效；slots 类不适用。`
  }, {
    h: "故障排查：property 缓存失效与类方法工厂",
    p: `[[@property]] 让方法像属性一样访问，适合「只读派生值」。但把它当缓存用，就会遇到「数据改了、属性还是旧值」。property 每次访问都重新计算，不会自动缓存；[[cached_property]] 缓存但不会自动失效。两种语义要选清楚，不能既想省计算又想永远正确。

如果派生值依赖多个字段，失效点就不止一个。比如 [[total]] 依赖 [[runs]] 和 [[penalty]]，修改任一字段都要让缓存失效。用手写 [[_total]] 缓存时，在 [[__setattr__]] 里统一清理，或在每个 setter 里清。漏一个，就会出现「改了罚时、总分不变」的 bug。

[[@classmethod]] 工厂适合「从多种输入创建对象」：[[from_csv]]、[[from_dict]]、[[from_api]]。它拿到的是类而不是实例，子类调用时能正确返回子类。[[@staticmethod]] 不拿类也不拿实例，适合纯工具函数；如果函数需要访问类属性或返回子类，就该用 classmethod。

工厂里不要偷偷吞掉错误。[[from_dict]] 缺字段时，抛带字段名的 ValueError，而不是返回 None 让调用方猜。多种输入格式可以在工厂里归一化，但归一化后仍要走同一个校验入口，避免每个工厂各写一套规则。

继承工厂要小心：子类覆盖 [[from_dict]] 时，记得调用 [[super().from_dict]] 或复用同一套校验。否则基类新增字段，子类工厂不认，创建出的对象缺字段。可以用「模板方法」：基类工厂负责解析，子类只覆盖 [[_validate]] 或 [[_convert]]。

验收：改一个依赖字段，派生值是否更新？用子类调用 classmethod，返回类型是否是子类？缺字段是否报清楚？缓存和 property 混用时，是否有一致性测试？`,
    code: String.raw`class Score:
    def __init__(self, runs, penalty=0):
        self._runs = runs
        self._penalty = penalty
        self._total = None
    @property
    def total(self):
        if self._total is None:
            self._total = self._runs + self._penalty
        return self._total
    @total.setter
    def total(self, value):
        raise AttributeError("total is derived")
    def set_penalty(self, value):
        self._penalty = value
        self._total = None
    @classmethod
    def from_dict(cls, data):
        if "runs" not in data:
            raise ValueError("missing field: runs")
        return cls(int(data["runs"]), int(data.get("penalty", 0)))

s = Score.from_dict({"runs": 92, "penalty": 3})
print(s.total)
s.set_penalty(5)
print(s.total)`,
    output: `95
97`,
    tip: `缓存失效点要覆盖所有依赖字段；classmethod 工厂归一化后走同一校验；子类工厂别绕过基类。`
  }]);

  add("ch11-3", [{
    h: "工程深化：运算符重载与容器协议",
    p: `运算符重载不是为了「让代码看起来像数学」，而是让对象支持语言的原生协议。[[__add__]] 让 [[a + b]] 可用，[[__len__]] 让 [[len(a)]] 可用，[[__getitem__]] 让索引和切片可用，[[__iter__]] 让 for 循环可用。实现这些方法，对象就能融入 Python 的生态。

[[__add__]] 要返回新对象，不要原地修改。[[a += b]] 走 [[__iadd__]]，如果没有实现，会退化为 [[a = a + b]]。对不可变对象，[[__iadd__]] 可以返回新对象；对可变对象，[[__iadd__]] 可以原地改并返回 self。两种语义要在文档里写清楚，不能让调用方猜。

[[__getitem__]] 要同时处理整数索引和切片。[[obj[1:3]]] 传进来的是 slice 对象，直接拿它当 key 会报错。实现时判断 [[isinstance(key, slice)]]，返回同类型的新对象；负索引、越界、步长也要考虑。只支持整数索引时，收到 slice 要抛 TypeError，而不是返回奇怪结果。

[[__len__]] 必须返回非负整数，否则 [[len()]] 报 ValueError。[[__bool__]] 不实现时，Python 用 [[__len__]] 判断真假；空容器为 False。不要同时写互相矛盾的 [[__len__]] 和 [[__bool__]]，比如 len 返回 1 但 bool 永远 False。

[[__iter__]] 返回迭代器，不是列表。返回 [[iter(self.items)]] 可以，但要注意「迭代时修改容器」的行为。需要稳定遍历时，先复制一份；需要惰性遍历时，用生成器。生成器只能遍历一次，调用方要知道这个语义。

[[__contains__]] 不实现时，Python 用 [[__iter__]] 线性扫描；实现它可以做 O(1) 查找。[[in]] 的语义是「是否包含」，不是「是否有某个键」，对映射类型要区分 keys 和 values。

验收：写一个能切片、能迭代、能 len 的容器；测试空容器布尔值、负索引、越界、切片步长；确认加号运算不修改原对象。容器协议实现对了，很多内置函数和库就能直接使用你的对象。`,
    code: String.raw`class Scores:
    def __init__(self, values):
        self._values = tuple(values)
    def __len__(self):
        return len(self._values)
    def __getitem__(self, key):
        if isinstance(key, slice):
            return Scores(self._values[key])
        return self._values[key]
    def __iter__(self):
        return iter(self._values)
    def __add__(self, other):
        if not isinstance(other, Scores):
            return NotImplemented
        return Scores(self._values + other._values)
    def __repr__(self):
        return f"Scores({list(self._values)!r})"

a = Scores([91, 88, 95])
b = Scores([76, 80])
print(len(a), list(a[1:]), a + b)
print(bool(Scores([])))`,
    output: `3 [88, 95] Scores([91, 88, 95, 76, 80])
False`,
    tip: `运算符返回新对象；切片单独处理；__len__ 返回非负整数；__iter__ 返回迭代器。`
  }, {
    h: "故障排查：__eq__ 与 __hash__ 不一致的后果",
    p: `Python 的规则很简单：[[a == b]] 为真时，[[hash(a)]] 必须等于 [[hash(b)]]；否则对象放进 dict/set 会出现「明明相等却找不到」。自定义 [[__eq__]] 后，默认的 [[__hash__]] 会被设为 None（不可哈希），除非你显式定义。很多人只改 eq，结果对象突然不能当字典键。

可变对象通常不该可哈希。一个列表内容会变，哈希值也会变，dict 就找不到原来的位置。如果业务需要「按 id 相等」的实体，[[__eq__]] 比较 id，[[__hash__]] 用 id，且 id 不可变；其他字段变化不影响哈希。不要用所有字段做哈希，除非对象真的不可变。

[[__eq__]] 要返回 [[NotImplemented]]，而不是 False，当对方类型不兼容时。这样 Python 会尝试对方的 [[__eq__]]，可能得到正确结果。直接返回 False 会让某些反射比较失效。但也不要返回 NotImplemented 后就不管，最终 Python 会回退到身份比较。

浮点数做键要小心：[[0.1 + 0.2 != 0.3]]，哈希也不同。金额用 Decimal 或整数分，时间用整数毫秒，避免浮点误差进入相等性。必须用浮点时，明确容差比较，但容差比较不适合做哈希键。

[[dataclass(frozen=True)]] 自动生成一致的 eq/hash；[[dataclass]] 非 frozen 默认不可哈希（eq=True, frozen=False 时 [[__hash__]] 为 None）。这不是 bug，是提醒你「可变对象别当键」。需要可变对象做键时，用 id 或不可变快照。

验收：两个相等对象放进 set，长度是否为 1？修改一个字段后，还能从 dict 里取到吗？不同类型比较是否返回 NotImplemented？浮点键是否出现「找不到」？这四个测试能抓住大多数 eq/hash 问题。`,
    code: String.raw`class Bad:
    def __init__(self, x): self.x = x
    def __eq__(self, other):
        return isinstance(other, Bad) and self.x == other.x
    # 没有 __hash__，默认不可哈希

b1, b2 = Bad(1), Bad(1)
print(b1 == b2)
try:
    print({b1, b2})
except TypeError as e:
    print("set failed:", e)

class Good:
    __slots__ = ("id", "name")
    def __init__(self, id, name):
        self.id, self.name = id, name
    def __eq__(self, other):
        if not isinstance(other, Good):
            return NotImplemented
        return self.id == other.id
    def __hash__(self):
        return hash(self.id)

g1, g2 = Good(1, "A"), Good(1, "B")
print(g1 == g2, len({g1, g2}))`,
    output: `True
set failed: unhashable type: 'Bad'
True 1`,
    tip: `eq 为真必须 hash 相等；可变对象别做键；不兼容类型返回 NotImplemented。`
  }]);
})();

/* --- expand12.js --- */

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

  add("ch12-1", [{
    h: "工程深化：从注解到 mypy strict 的可落地路径",
    p: `类型注解不是给 IDE 看的装饰。它要能被执行器读取，被 mypy/pyright 检查，被运行时校验工具使用。第一步是开启 [[disallow_untyped_defs]]，让所有函数都有参数和返回值注解；第二步是 [[strict = true]]。不要一次全开，否则几千条错误会让人直接放弃。

迁移顺序：先给公共 API 和数据结构加注解，再给内部函数加；先处理 [[Any]] 泄漏，再处理泛型。[[Any]] 会静默传播，一个未注解的第三方函数返回值可能让整条链失去检查。用 [[reveal_type(x)]] 看推断结果，用 [[cast]] 只在确实无法表达时兜底，不要把 cast 当万能药。

[[TypedDict]] 适合描述「固定键的字典」，比如 API 响应、CSV 行。它比 [[dict[str, Any]]]] 精确，比 dataclass 轻量。注意 TypedDict 只在静态检查时存在，运行时就是普通 dict；不能做 isinstance 判断，也不能保证键真的存在。需要运行时校验时，用 pydantic 或手写验证。

[[@overload]] 适合「同一函数根据参数类型返回不同类型」：比如 [[load(path)]] 返回 str，[[load(file)]] 返回 bytes。实现函数只写一次，前面放多个 overload 声明。overload 的实现签名不对外暴露；调用方看到的是重载列表。不要滥用，参数组合超过三种就该考虑拆函数或传枚举。

[[Self]] 让方法返回当前类，对链式调用和工厂很有用。[[Literal]] 限定字符串/数字的合法值，适合配置项。[[Final]] 表示常量不可重新赋值。[[TypeAlias]] 给复杂类型起名字。这些工具让类型表达更精确，但也会增加阅读成本，按团队接受度逐步引入。

严格模式常见报错：缺少返回注解、隐式 Optional、[[dict]] 缺少类型参数、重载实现不兼容、未使用的 ignore。逐条修，不要用 [[# type: ignore]] 批量压制。每一条 ignore 都要写原因和到期时间，否则半年后没人敢删。

验收：在 CI 里跑 [[mypy src]]，0 错误；用 [[reveal_type]] 抽查公共函数；故意传错参数，确认检查器报错；再跑运行时测试，确认注解没有改变行为。`,
    code: String.raw`from typing import TypedDict, overload, Literal

class Row(TypedDict):
    athlete: str
    seconds: float

@overload
def load(path: str) -> str: ...
@overload
def load(path: bytes) -> bytes: ...
def load(path):
    if isinstance(path, bytes):
        return path
    with open(path, encoding="utf-8") as fh:
        return fh.read()

def top(rows: list[Row], n: int = 3) -> list[Row]:
    return sorted(rows, key=lambda r: r["seconds"])[:n]

print(top([{"athlete": "A", "seconds": 12.3}]))`,
    output: `[{'athlete': 'A', 'seconds': 12.3}]`,
    tip: `先公共 API 后内部；Any 会传播；TypedDict 无运行时保证；ignore 必须写原因。`
  }, {
    h: "故障排查：泛型、Protocol 与协变的常见坑",
    p: `[[TypeVar]] 让函数表达「输入什么类型，输出同样类型」。[[def first(items: list[T]) -> T]] 比 [[Any]] 精确得多。但 TypeVar 不是运行时机制，它只在静态检查时存在；运行时传错类型不会自动报错。需要运行时约束时，用 isinstance 或 pydantic。

[[Protocol]] 描述结构类型：只要对象有 [[read()]] 方法，就符合 [[Reader]]，不需要继承。它适合第三方对象、鸭子类型、测试替身。带 [[@runtime_checkable]] 的 Protocol 可以做 isinstance，但只检查方法名是否存在，不检查签名；不要把它当完整校验。

协变/逆变常被忽略。[[list[T]]] 是不变的：[[list[object]]] 不能接受 [[list[str]]]]，因为往 list[object] 里放 int 会污染原 list。[[Sequence[T]]] 是协变的，只读容器可以安全地接受更具体的元素类型。函数参数是逆变的：接受 object 的函数可以替代接受 str 的函数，反之不行。

[[TypeVar]] 的 bound 和 constraints 不一样。[[bound=Comparable]] 表示「必须是 Comparable 的子类型」；[[constraints=(str, bytes)]] 表示「只能是这两个之一」。前者更灵活，后者更严格。用错会让合法调用被拒绝，或者让非法调用通过。

泛型类要显式参数化：[[class Box(Generic[T])]]，然后在 [[__init__]] 里存 T。不要用 [[Box]] 裸类型，那会退化成 Any。Python 3.12 的 [[class Box[T]]] 语法更简洁，但旧版本不兼容；团队要统一版本。

测试泛型主要靠类型检查器，不是 pytest。写一组 [[assert_type]] 或 reveal_type 用例，放在 CI 的类型检查步骤；运行时测试只验证行为。不要为了「测试泛型」写一堆没有意义的运行时断言。

验收：[[list[str]]] 传给 [[list[object]]] 是否报错？[[Sequence[str]]] 传给 [[Sequence[object]]] 是否通过？Protocol 的 runtime_checkable 是否只查名字？TypeVar 约束是否拒绝了非法类型？`,
    code: String.raw`from typing import Protocol, Sequence, TypeVar, runtime_checkable

T = TypeVar("T")

def first(items: Sequence[T]) -> T:
    if not items:
        raise ValueError("empty")
    return items[0]

@runtime_checkable
class Reader(Protocol):
    def read(self) -> str: ...

class File:
    def read(self) -> str:
        return "data"

print(first(["a", "b"]))
print(isinstance(File(), Reader))`,
    output: `a
True`,
    tip: `list 不变、Sequence 协变；Protocol 运行时不校验签名；TypeVar 只在静态检查时生效。`
  }]);

  add("ch12-2", [{
    h: "工程深化：docstring、doctest 与文档即测试",
    p: `docstring 的第一行要回答「这个函数做什么」，而不是「这个函数叫 xxx」。接着写参数、返回值、异常、示例。Google、NumPy、Sphinx 三种风格都可以，团队选一种，不要混。风格统一比风格本身更重要。

[[doctest]] 能把 docstring 里的示例当测试跑。写法是 [[>>> add(1, 2)]] 下一行写期望输出 3。它适合纯函数、格式化函数、简单解析器；不适合网络、数据库、随机数。doctest 失败时输出会带实际结果，排查直观。

doctest 的坑：输出必须完全匹配，包括空格和引号；字典顺序在旧版本不保证；异常要用 [[Traceback (most recent call last): ...]] 省略中间堆栈。浮点数不要直接打印，用 [[round()]] 或 [[pytest.approx]] 风格。随机/时间相关的结果要先固定种子或注入时钟。

文档示例要能复制运行。很多 README 的代码缺 import、缺上下文，读者复制就报错。把示例放在 [[examples/]] 目录，用测试跑一遍；docstring 里的示例至少保证 import 和调用正确。文档不是小说，是要被执行的。

[[help()]]、IDE 悬浮、Sphinx 都读 docstring。类型注解已经表达了参数类型，docstring 不必重复「param x: int」，但可以补充单位、范围、默认值含义、副作用。返回值说明要写「返回什么」，不是「返回 result」。

文档构建要进 CI：[[sphinx-build -W]] 把警告当错误，避免断链、缺文档。API 页面从代码生成时，确保公开成员都有 docstring；私有成员可以跳过。文档版本和代码版本要一起发布，不能代码改了文档还是旧的。

验收：[[python -m doctest]] 通过；README 示例在干净环境能跑；Sphinx 构建 0 警告；公开函数 100% 有 docstring。`,
    code: String.raw`def parse_seconds(text: str) -> float:
    """把 "1:02.35" 形式的成绩转成秒。

    Args:
        text: 分:秒.百分秒，例如 "1:02.35"。

    Returns:
        总秒数，例如 62.35。

    Raises:
        ValueError: 格式不是 分:秒.百分秒。

    >>> parse_seconds("1:02.35")
    62.35
    >>> parse_seconds("0:09.80")
    9.8
    """
    try:
        minute, rest = text.split(":")
        return int(minute) * 60 + float(rest)
    except (ValueError, AttributeError) as exc:
        raise ValueError(f"bad time: {text!r}") from exc

if __name__ == "__main__":
    import doctest
    doctest.testmod()`,
    output: `# python -m doctest scores.py -v
# 2 items passed all tests`,
    tip: `docstring 写做什么/参数/返回/异常/示例；doctest 适合纯函数；示例必须能复制运行。`
  }, {
    h: "故障排查：文档与类型、代码三处不同步",
    p: `最常见的文档事故不是写错字，而是代码改了、文档没改。函数参数从 [[path]] 改成 [[file_path]]，README 还在用旧名字；返回值从 list 改成生成器，文档还说「返回列表」；异常类型换了，调用方还在捕获旧异常。三处不同步，读者会浪费大量时间。

把文档当代码管理：文档和代码在同一个 PR 里改，review 时检查三处：签名、docstring、示例。CI 跑 doctest、Sphinx 构建、类型检查；任何一处失败就阻止合并。不要依赖「以后再补」，以后永远不会来。

类型注解和 docstring 不要互相矛盾。注解说 [[str | None]]，docstring 说「一定返回字符串」，调用方就会踩 None。注解说 [[list[str]]]，docstring 说「返回迭代器」，行为就不一致。以代码为准，改文档；如果代码不对，先修代码。

公开 API 变更要有弃用流程：旧名字保留别名，发 [[DeprecationWarning]]，文档标注「自 x.y 起弃用，将在 z 移除」。不要直接删，外部用户可能还在用。弃用警告要能被测试捕获，确保真的发出。

文档里的版本号、安装命令、依赖版本要可验证。[[pip install scores==0.3.0]] 是否真的存在？CLI 参数是否真的叫 [[--format]]？把这些命令放进 CI 的 smoke test，跑一遍 [[--help]] 和最小示例。文档不是宣传册，是使用合同。

最后做一次「新人测试」：让一个没参与项目的人只看 README 和 docstring，从零安装并跑通示例。卡在哪一步，就说明文档缺哪一块。内部人觉得「显而易见」的地方，往往就是新人卡住的地方。`,
    code: String.raw`# CI 中的文档检查（示例）
# python -m doctest src/scores/*.py
# sphinx-build -W -b html docs docs/_build
# mypy src
# python -m scores --help
# python examples/quickstart.py

def deprecated_old_name(value):
    import warnings
    warnings.warn("old_name is deprecated; use new_name", DeprecationWarning, stacklevel=2)
    return value`,
    output: `# 任何一项失败都应阻止合并；
# 文档示例、CLI 帮助、类型签名必须与代码一致。`,
    tip: `文档与代码同 PR；CI 跑 doctest/Sphinx/类型/CLI；公开变更走弃用期。`
  }]);

  add("ch12-3", [{
    h: "工程深化：pytest fixture 工厂与参数化矩阵",
    p: `fixture 不是「把 setup 写成函数」那么简单。它的价值是依赖注入：测试需要什么，就在参数里写什么；pytest 负责创建、复用、清理。默认作用域是 function，每个测试一份；[[scope="module"]] 或 [[session"]] 可以共享重资源，但共享状态容易让测试互相污染。

fixture 可以返回工厂函数，让测试按需创建多个对象。比如 [[make_athlete]] 返回一个函数，测试里 [[make_athlete("A", 12.3)]]。这比固定一个 fixture 灵活，也比在每个测试里手写构造少重复。工厂 fixture 本身不创建资源，只返回构造函数，作用域好控制。

[[yield]] fixture 负责清理：yield 前是 setup，yield 后是 teardown。数据库事务、临时目录、环境变量、mock 都要在 finally 里恢复。测试失败时 teardown 仍会执行，但如果是进程被杀，就不会；所以外部资源要有超时和独立清理。

[[@pytest.mark.parametrize]] 把多组输入变成多个测试用例，失败时能看出哪组挂了。参数组合可以用 [[pytest.param(..., id="...")]] 命名，避免输出一堆 tuple。大量组合时，用 [[itertools.product]] 生成，但要注意测试数量爆炸；只保留有代表性的边界。

参数化的数据要放在文件或 fixture 里，不要塞在装饰器里几百行。CSV/JSON 驱动测试很常见：读一行，跑一次，失败信息带行号。数据文件要版本化，和代码一起 review。

测试命名要描述行为：[[test_rejects_negative_seconds]] 比 [[test_parse_2]] 好。断言失败时，pytest 会显示输入和期望；再加 [[assert result == expected, f"input={text}"]] 更清楚。不要一个测试断言十件事，失败时不知道哪件坏了。

验收：fixture 清理是否在失败时也执行？参数化是否覆盖空值/边界/非法值？测试是否互不依赖、可单独运行？[[pytest -x]] 第一个失败就停，[[pytest -k]] 能筛到目标。`,
    code: String.raw`import pytest

@pytest.fixture
def make_row():
    created = []
    def _make(athlete, seconds):
        row = {"athlete": athlete, "seconds": seconds}
        created.append(row)
        return row
    yield _make
    created.clear()

@pytest.mark.parametrize("text,expected", [
    ("1:02.35", 62.35),
    ("0:09.80", 9.8),
    pytest.param("-1:00.00", None, id="negative"),
])
def test_parse(text, expected, make_row):
    if expected is None:
        with pytest.raises(ValueError):
            parse_seconds(text)
    else:
        assert parse_seconds(text) == pytest.approx(expected)`,
    output: `# pytest -q
# 3 passed`,
    tip: `fixture 用 yield 清理；工厂 fixture 按需造对象；参数化命名并覆盖边界。`
  }, {
    h: "故障排查：覆盖率不等于测试质量",
    p: `覆盖率只告诉你「哪些行被执行过」，不告诉你「断言是否有效」。一个测试把函数调用一遍、不检查结果，也能拿到 100% 行覆盖。真正要关注的是分支覆盖、边界值、异常路径、以及「改错代码测试会不会失败」。

先看 [[coverage report -m]] 的 missing 行，再判断是否值得补。数据类、简单 getter、框架入口可以排除；核心解析、金额计算、权限判断必须覆盖。不要为了数字给无意义代码写测试，也不要因为 100% 就停止补边界。

变异测试能检验断言的有效性：工具故意把 [[<]] 改成 [[<=]]、把返回值改错，看测试是否失败。[[mutmut]] 或 [[cosmic-ray]] 可以跑小范围；全量很慢，先对核心模块跑。一个变异没被杀死，说明测试没有真正检查那个行为。

属性测试适合「输入空间大、规则明确」的场景。[[hypothesis]] 生成随机输入，检查不变量：解析后再格式化应等价、排序后长度不变、编码再解码应还原。它常能发现手写用例想不到的边界，比如空字符串、超长输入、Unicode 组合字符。

别把测试写成「实现镜像」。测试应该描述外部行为：给定输入，期望输出/异常/副作用；不要断言内部调用了哪个私有方法。内部重构时，行为测试仍应通过；实现镜像测试会全部失败，逼你改测试而不是改代码。

CI 里覆盖率阈值要合理。新项目可以设 80%，老项目先设「不低于当前」，再逐步提高。阈值太高会逼人造测试，阈值太低没有约束。把覆盖率报告作为 review 参考，不要把数字当 KPI。

验收：故意改错一个边界条件，测试是否失败？删掉一个断言，覆盖率是否仍 100%？随机属性测试是否跑过 100 组？这三个问题能区分「真测试」和「假覆盖」。`,
    code: String.raw`# 安装：pip install pytest coverage hypothesis mutmut
# 运行：
# coverage run -m pytest
# coverage report -m
# mutmut run --paths-to-mutate src/scores

from hypothesis import given, strategies as st

@given(st.floats(min_value=0.01, max_value=3599.99))
def test_format_roundtrip(seconds):
    text = format_seconds(seconds)
    assert abs(parse_seconds(text) - seconds) < 0.01`,
    output: `# 属性测试通过 100 组；
# 变异测试若大量存活，说明断言不足。`,
    tip: `覆盖率看分支与异常路径；用变异测试验证断言；属性测试补随机边界。`
  }]);
})();

/* --- expand13.js --- */

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

/* --- expand14.js --- */

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

  add("ch14-1", [{
    h: "工程深化：Session、超时与连接池的真实配置",
    p: `[[requests.get()]] 每次调用都会新建连接，三次握手、TLS 握手都重复。批量请求要用 [[requests.Session]]，它复用连接池、cookie、默认头。但 Session 不是线程安全的：一个 Session 被多个线程共享，连接池状态和 cookie 都可能乱。多线程要么每个线程一个 Session，要么用线程安全的客户端。

超时不能只写一个数字。[[timeout=5]] 同时限制连接和读取；更精确的是 [[timeout=(3.05, 10)]]：连接 3.05 秒，读取 10 秒。不设超时的请求可能永久挂起，把线程池耗尽。连接超时要短，读取超时按业务定；大文件下载不能用统一的 10 秒，要单独设置。

默认 [[verify=True]] 会验证 TLS 证书，不要为了「省事」关掉。内网自签证书用 [[verify="/path/ca.pem"]]，不要把整条链禁用。[[verify=False]] 会引入中间人风险，还会产生警告；如果必须用，限制在明确的内网地址并记录原因。

重试要只针对幂等请求。GET、HEAD、PUT、DELETE 通常可重试；POST 可能重复下单，除非有幂等键。[[HTTPAdapter(max_retries=Retry(...))]] 可以配置总次数、退避、状态码白名单。不要对 400/401/403 重试，那只会浪费时间。

连接池大小要匹配并发。[[HTTPAdapter(pool_connections=10, pool_maxsize=10)]] 太小会让线程排队；太大可能压垮服务端。[[pool_block=False]] 时超出的连接会被丢弃，不一定报错。压测时观察连接等待和 429，再调参数。

响应要及时关闭。[[response.content]] 会读完整 body；[[response.iter_content()]] 流式读取后要 [[response.close()]]，或者用 with。连接不归还，池会耗尽。大批量请求时，最容易被忽略的 bug 就是「代码跑得越久越慢」，最后卡死。

验收：100 次请求复用连接，耗时明显低于新建；超时能触发；证书错误能报；线程池并发不串 cookie；长下载不会占满池。`,
    code: String.raw`import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

session = requests.Session()
retry = Retry(total=3, backoff_factor=0.5,
              status_forcelist=[429, 500, 502, 503, 504],
              allowed_methods=["GET", "HEAD"])
adapter = HTTPAdapter(max_retries=retry, pool_connections=10, pool_maxsize=10)
session.mount("https://", adapter)
session.headers.update({"User-Agent": "scores/0.3"})

r = session.get("https://example.com/api", timeout=(3.05, 10))
r.raise_for_status()
print(r.status_code, len(r.content))`,
    output: `200 12345`,
    tip: `Session 复连接但非线程安全；超时用 (connect, read)；只重试幂等请求；响应要及时关闭。`
  }, {
    h: "故障排查：流式下载、代理与重定向的坑",
    p: `下载大文件不要用 [[response.content]]，它会把整个文件读进内存。用 [[stream=True]] 加 [[iter_content(chunk_size=8192)]]，边读边写临时文件，最后原子替换。这样内存占用稳定，断点续传也有基础。写入过程中要检查 [[Content-Length]]，不匹配就失败。

断点续传用 Range 头：[[Range: bytes=1024-]]，服务端返回 206 才支持；返回 200 表示不支持，要从头写。下载前记录 ETag/Last-Modified，续传时用 [[If-Range]] 防止文件已变。不要只看文件大小判断完整，校验 SHA256 更可靠。

代理配置有三层：环境变量 [[HTTP_PROXY]]/[[HTTPS_PROXY]]、Session 的 [[proxies]]、单次请求的 [[proxies]]。优先级从低到高。内网请求不要走外网代理，[[NO_PROXY]] 要包含内网域名。代理认证用 URL 里的 user:pass 会出现在日志，尽量用环境或凭据管理器。

重定向默认开启，但 [[allow_redirects=False]] 可以手动检查。跨域重定向可能把 Authorization 头带到另一个域，[[requests]] 默认会剥离；自己实现时要小心。重定向循环会报 TooManyRedirects，捕获后打印最终 URL 和跳转链，不要只报「请求失败」。

[[response.raise_for_status()]] 只检查 4xx/5xx，不检查业务错误。API 返回 200 但 body 里 [[code=1001]] 时，仍要解析业务码。把 HTTP 错误和业务错误分开记录，排查时才知道是网络问题还是数据问题。

下载后要校验：文件大小、SHA256、MIME 类型、能否被目标程序打开。只检查「文件存在」不够，半截文件也存在。临时文件命名带 .part，完成后原子 rename；失败时删除 .part，避免下次误用。

验收：1GB 文件下载内存不涨；断点续传从中间继续；代理错误有清楚提示；重定向链可打印；坏文件能被校验拒绝。`,
    code: String.raw`import hashlib, requests
from pathlib import Path

def download(url, dest: Path, sha256: str):
    tmp = dest.with_suffix(dest.suffix + ".part")
    with requests.get(url, stream=True, timeout=(3.05, 60)) as r:
        r.raise_for_status()
        with open(tmp, "wb") as fh:
            for chunk in r.iter_content(8192):
                if chunk:
                    fh.write(chunk)
    digest = hashlib.sha256(tmp.read_bytes()).hexdigest()
    if digest != sha256:
        tmp.unlink(missing_ok=True)
        raise ValueError(f"checksum mismatch: {digest}")
    tmp.replace(dest)`,
    output: `# 下载完成：dest 存在且 SHA256 匹配
# 失败：.part 被删除，原文件不受影响`,
    tip: `stream=True 分块写；Range 续传要 206；代理分层配置；下载后校验哈希。`
  }]);

  add("ch14-2", [{
    h: "工程深化：分页、游标与可恢复的抓取状态",
    p: `分页接口常见两种：offset/limit 和 cursor。offset 分页在数据变动时会漏项或重复：你翻到第 2 页时，前面插入了新记录，原来的第 2 页变成第 3 页。cursor 分页用「上一页最后一条的 id/时间」作为起点，数据插入不影响后续，但要求服务端支持且排序稳定。

抓取前先确认排序字段。按 [[updated_at]] 升序、用 [[since]] 游标，能增量抓；按 [[id]] 升序、用 [[after_id]] 游标，适合全量。不要用「页码」做断点，页码不是稳定标识。把游标、最后成功时间、已处理 id 写入状态文件，进程重启能继续。

去重要有主键。[[id]]、[[url]]、[[(source, external_id)]] 都可以，但必须唯一且稳定。不要用标题做主键，标题会改；不要用列表索引，顺序会变。去重集合太大时，用数据库唯一索引或布隆过滤器，不要把所有 id 塞进内存 set。

每页处理完再更新游标。先处理、后提交状态，崩溃时最多重复一页，不会丢数据。重复页要幂等：upsert 而不是 insert，或者先查再写。状态文件也要原子写，否则断电后游标损坏，下次从头发送。

限速和分页要配合。每页请求之间 sleep，不要「翻页越快越好」；服务端 429 时读 [[Retry-After]]，暂停后从当前游标继续。把「请求数/页数/写入数/跳过数」记录到日志，异常时能看出卡在哪一页。

结束条件要明确：返回空列表、[[next_cursor]] 为空、返回数量小于 page_size、达到最大页数。不要只判断「没有数据」，有的接口最后一页仍返回满页但 next 为空。把结束原因打印出来，避免死循环。

验收：抓取中途 kill，重启后从断点继续；重复跑同一区间，不产生重复记录；数据插入后，后续页不漏；429 后能恢复；结束条件不会死循环。`,
    code: String.raw`import json, time
from pathlib import Path

STATE = Path("state.json")

def load_state():
    if STATE.exists():
        return json.loads(STATE.read_text())
    return {"cursor": None, "seen": []}

def save_state(state):
    tmp = STATE.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, ensure_ascii=False))
    tmp.replace(STATE)

def crawl(fetch_page, handle):
    state = load_state()
    seen = set(state["seen"])
    cursor = state["cursor"]
    while True:
        page = fetch_page(cursor)
        for row in page["items"]:
            if row["id"] not in seen:
                handle(row)
                seen.add(row["id"])
        cursor = page.get("next_cursor")
        state.update(cursor=cursor, seen=list(seen))
        save_state(state)
        if not cursor:
            break
        time.sleep(0.3)`,
    output: `# 重启后从 state.json 的 cursor 继续；
# 同一 id 不会重复写入。`,
    tip: `游标用稳定排序字段；先处理后提交状态；upsert 幂等；结束条件要明确。`
  }, {
    h: "故障排查：429、Token 刷新与幂等键",
    p: `429 不是「请求失败」，而是「你太快了」。响应头 [[Retry-After]] 可能是秒数或 HTTP 日期，要解析后等待。没有这个头时，用指数退避加抖动。不要立刻重试，那会加重限流；也不要把 429 当成永久失败，稍等通常能恢复。

OAuth token 过期返回 401。不要在每次 401 都重新登录，那会触发风控；用刷新令牌换新 access token，并缓存到过期前。多个线程同时刷新会互相覆盖，用一个锁或「刷新中的 Future」让只有一个线程刷新，其他等待结果。

刷新失败要区分：[[invalid_grant]] 表示 refresh token 失效，必须重新授权；网络错误可以重试；[[invalid_client]] 是配置问题，重试无用。把错误码记录清楚，不要统一抛「登录失败」。

写请求要带幂等键。POST 创建订单/记录时，客户端生成 [[Idempotency-Key]]，服务端按 key 去重；重试时用同一个 key，不会重复创建。没有服务端支持时，客户端先查「是否已存在」再写，但这有竞态，不如服务端唯一索引可靠。

重试 POST 前要确认请求是否真的失败。超时可能表示服务端已处理但响应丢了；盲目重试会重复。用幂等键、查询接口或事务状态来确认。读请求可以大胆重试，写请求要谨慎。

限流要按域名/接口分开。一个 API 的 429 不应该让所有请求停摆；用令牌桶或信号量控制并发，按响应动态调整。记录每个域名的 QPS、429 次数、平均延迟，才能调参。

验收：429 后按 Retry-After 恢复；401 只刷新一次 token；多线程不重复刷新；重复 POST 不产生两条记录；超时后能确认服务端状态。`,
    code: String.raw`import time, threading, requests

class TokenClient:
    def __init__(self, refresh):
        self.refresh = refresh
        self.token = None
        self.lock = threading.Lock()

    def get(self):
        if self.token:
            return self.token
        with self.lock:
            if not self.token:
                self.token = self.refresh()
            return self.token

def request_with_retry(session, url, headers, tries=4):
    for n in range(tries):
        r = session.get(url, headers=headers, timeout=(3, 10))
        if r.status_code == 429:
            wait = int(r.headers.get("Retry-After", "1"))
            time.sleep(wait + n * 0.5)
            continue
        r.raise_for_status()
        return r
    raise RuntimeError("rate limited")`,
    output: `# 429 等待后重试；
# token 只刷新一次，其他线程复用。`,
    tip: `429 读 Retry-After；401 单飞刷新；写请求带幂等键；超时后先确认再重试。`
  }]);

  add("ch14-3", [{
    h: "工程深化：HTML 解析、正文抽取与数据质量",
    p: `[[requests]] 拿到的是 HTML 字符串，不是结构化数据。用 [[BeautifulSoup]] 或 [[lxml]] 解析，优先 [[CSS 选择器]]，因为比 XPath 更稳、更可读。解析器选 [[lxml]] 快，[[html.parser]] 内置但慢；不要用正则解析 HTML，嵌套和属性顺序会让正则失控。

选择器要锚定稳定结构，不要依赖「第 3 个 div」。优先 [[data-*]]、[[id]]、语义标签、稳定 class；这些都没有时，再用「父级 + 文本」组合。页面改版时，选择器会失效；把选择器集中到配置，方便快速修，不要散落在代码里。

正文抽取要处理空白、换行、全角空格、HTML 实体。[[get_text(" ", strip=True)]] 比 [[.text]] 干净；[[html.unescape]] 处理 [[&amp;]]；[[unicodedata.normalize("NFKC")]] 统一全角/半角。数字里的千分位、单位、百分号要单独解析，不要直接 float。

表格解析要保留表头。[[pandas.read_html]] 能快速读表格，但合并单元格、跨行表头、隐藏行会让结果错位。先打印 [[len(tables)]] 和每个表的 shape，确认选对了表；再用 [[header=0]] 或手动指定列名。不要假设第一个表就是目标表。

抓取要遵守 robots.txt 和服务条款。[[urllib.robotparser]] 可以解析 [[robots.txt]]，检查 [[can_fetch]]；设置合理 UA、限速、缓存。不要抓登录后的私人数据，不要绕过访问控制。法律和平台规则比技术更重要。

数据质量要校验：条数、必填字段、日期格式、数值范围、重复率。抓完先跑一遍统计，发现空值率高或字段缺失，先修解析器再入库。不要「先存进去再说」，脏数据清理成本更高。

验收：同一页面重复解析结果一致；页面改版时选择器集中可换；表格表头正确；robots 不允许时停止；空值/重复率有报告。`,
    code: String.raw`from bs4 import BeautifulSoup
import re, unicodedata

html = "<table><tr><th>选手</th><th>成绩</th></tr><tr><td>林晓</td><td>12.34</td></tr></table>"
soup = BeautifulSoup(html, "lxml")
rows = []
for tr in soup.select("table tr")[1:]:
    cells = [unicodedata.normalize("NFKC", td.get_text(" ", strip=True))
             for td in tr.select("td")]
    if len(cells) == 2:
        rows.append({"athlete": cells[0], "seconds": float(cells[1])})
print(rows)`,
    output: `[{'athlete': '林晓', 'seconds': 12.34}]`,
    tip: `CSS 选择器集中配置；get_text 清洗空白；表格先确认 shape；遵守 robots 与限速。`
  }, {
    h: "故障排查：JS 渲染页面与 Playwright 等待策略",
    p: `[[requests]] 只能拿初始 HTML；如果数据由 JavaScript 异步加载，解析到的是空壳。先在浏览器开发者工具看 Network：数据来自 XHR/fetch 就直接请求接口，比渲染整页更快更稳；只有页面必须执行 JS 才能拿到内容时，才用浏览器自动化。

Playwright 的基本流程：启动浏览器、新建上下文、打开页面、等待选择器、读取内容、关闭。等待用 [[page.wait_for_selector]] 或 [[expect(locator).to_be_visible()]]，不要用固定 [[sleep(5)]]。固定睡眠要么太短失败，要么太长拖慢；条件等待更可靠。

选择器优先 [[get_by_role]]、[[get_by_label]]、[[get_by_text]]，它们更接近用户视角，也不容易受 CSS 改版影响。需要精确结构时再用 [[locator("css=...")]]。避免 [[nth(0)]] 这种位置选择，列表顺序会变。

表格/列表数据用 [[locator.all()]] 拿多个元素，再逐个 [[inner_text()]]。注意懒加载：滚动到底部才会出现更多行；循环「滚动-等待-统计」直到数量稳定。不要一次 [[page.content()]] 然后自己解析，那样拿不到动态新增内容。

浏览器上下文要隔离：每个任务新建 [[browser.new_context()]]，设置 UA、viewport、locale、时区；需要登录时用 [[storage_state]] 保存会话，不要每次重新登录。并发抓取要限制上下文数量，否则内存和 CPU 会爆。

反爬和合规：不要绕过验证码、不要伪造身份、不要高频请求。遇到登录/验证码，停止并让用户处理；遇到 robots 禁止，停止。自动化只是工具，不是绕过规则的许可证。

验收：等待条件而非 sleep；数据加载完成后才读取；滚动加载能拿全；上下文关闭无泄漏；登录态可复用；异常时有截图和 URL。`,
    code: String.raw`from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(locale="zh-CN", viewport={"width": 1280, "height": 900})
    page = context.new_page()
    page.goto("https://example.com/scores", wait_until="networkidle")
    page.wait_for_selector("table tbody tr")
    rows = page.locator("table tbody tr").all()
    data = []
    for row in rows:
        cells = row.locator("td").all_inner_texts()
        if len(cells) >= 2:
            data.append(cells[:2])
    print(data)
    context.close()
    browser.close()`,
    output: `[['林晓', '12.34'], ['陈默', '12.56']]`,
    tip: `优先抓 XHR；条件等待替代 sleep；role/text 选择器更稳；限制并发并遵守规则。`
  }]);
})();

/* --- expand15.js --- */

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

/* --- expand16.js --- */

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

  add("ch16-1", [{
    h: "工程深化：文件操作的安全边界与幂等入库",
    p: `办公脚本最常见的破坏不是代码报错，而是「重复跑一次，数据翻倍」。导入前先判断目标表是否已有同一批数据：用文件名 + 内容哈希 + 业务日期做唯一键，或者先删后插、事务提交。不要用 [[append]] 直接追加，除非你确定每次都是新数据。

路径处理用 [[pathlib.Path]]，不要手拼字符串。[[Path("out") / "scores.csv"]] 自动处理分隔符；[[resolve()]] 规范相对路径；[[with_suffix()]] 改扩展名。用户输入的文件名要校验存在、是文件、可读，不要直接拼进命令或 SQL。

写文件先写临时文件再原子替换，避免半截文件。读文件要处理编码：[[utf-8-sig]] 兼容 Excel 的 BOM，[[gb18030]] 处理老中文 CSV；不要用 [[errors="ignore"]] 静默丢字符，至少记录替换数量。

权限和敏感数据要管。输出目录不要 777；含身份证号、手机号的报表要脱敏或加密；日志不要打印完整路径中的用户名。临时文件用完删除，异常路径也要清理。

文件锁用于防止两个脚本同时写同一份报表。[[fcntl.flock]] 加非阻塞锁，拿不到就退出并提示「另一个任务正在运行」；不要用「检查文件是否存在」当锁，存在竞态。Windows 用 [[msvcrt]] 或第三方库。

入库要幂等：[[INSERT ... ON CONFLICT DO UPDATE]]、先查后写、或按批次删除再插入。每批记录批次 id，失败时能回滚整批。不要一条一条自动提交，中途失败会留下半批数据。

验收：重复跑两次结果一致；中途 kill 不留下半截文件；编码错误有报告；并发写只有一个成功；失败批次能回滚。`,
    code: String.raw`from pathlib import Path
import hashlib, json, os, tempfile

def file_digest(path: Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(8192), b""):
            h.update(chunk)
    return h.hexdigest()

def atomic_json(path: Path, data) -> None:
    fd, tmp_name = tempfile.mkstemp(dir=path.parent, prefix=".tmp-")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False)
            fh.flush()
            os.fsync(fh.fileno())
        os.replace(tmp_name, path)
    finally:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)`,
    output: `# 同一文件重复导入：digest 相同，跳过或覆盖同一批；
# 写入中断：目标文件仍是上一版完整内容。`,
    tip: `幂等键 = 文件哈希 + 业务日期；临时文件原子替换；编码显式；并发用锁不用 exists。`
  }, {
    h: "故障排查：subprocess 的超时、管道与退出码",
    p: `[[subprocess.run]] 比 [[os.system]] 安全，因为它不经过 shell（当 [[shell=False]]）。参数用列表传，不要拼接字符串；用户输入含空格、引号、分号时，拼接会导致命令注入。必须用 shell 时，用 [[shlex.quote]]，并尽量改成列表。

超时要显式设置。[[timeout=30]] 到期会抛 [[TimeoutExpired]]，子进程可能仍在运行；捕获后要 [[kill()]] 或 [[terminate()]]，并等待回收。只捕获不杀，会留下僵尸进程。长时间任务用 [[Popen]] 自己管理，定期检查 [[poll()]]。

管道输出可能死锁。父进程等子进程结束，子进程等父进程读完 stdout/stderr，缓冲区满就卡住。用 [[communicate()]] 同时读两个流，或把 stderr 重定向到 stdout。不要 [[wait()]] 后再 [[read()]]，那正是死锁写法。

退出码要检查。[[returncode != 0]] 表示失败，但不同程序含义不同；把 stdout/stderr 保存到日志，报错时带上命令、退出码、最后 N 行输出。不要只抛「命令失败」，那等于没信息。

环境变量要显式传递。[[subprocess]] 默认继承当前环境，可能带上不该带的 token；用 [[env={...}]] 构造最小环境，保留 [[PATH]]、[[HOME]]、[[LANG]]。需要虚拟环境的 Python 时，用 [[sys.executable]]，不要假设 [[python]] 在 PATH。

编码要指定。子进程输出可能是 UTF-8、GBK 或混合；[[text=True, encoding="utf-8", errors="replace"]] 能避免解码崩溃，但替换字符会丢信息。关键输出先按 bytes 拿，再尝试多种编码，记录失败。

验收：超时能杀掉子进程；大输出不死锁；退出码非 0 有完整日志；用户输入不能注入命令；环境变量最小化。`,
    code: String.raw`import subprocess, sys

cmd = [sys.executable, "-m", "scores", "show", "--json"]
try:
    proc = subprocess.run(
        cmd, capture_output=True, text=True,
        encoding="utf-8", errors="replace",
        timeout=30, check=False,
        env={"PATH": "/usr/bin:/bin", "HOME": "/tmp", "LANG": "C.UTF-8"},
    )
except subprocess.TimeoutExpired as exc:
    print("timeout:", exc.cmd)
else:
    if proc.returncode != 0:
        print("failed:", proc.returncode)
        print(proc.stderr[-2000:])
    else:
        print(proc.stdout)`,
    output: `# 成功：打印 JSON
# 失败：退出码 + stderr 最后 2000 字符
# 超时：捕获 TimeoutExpired 并终止子进程`,
    tip: `列表参数不走 shell；timeout 后要 kill；communicate 防死锁；检查退出码并留日志。`
  }]);

  add("ch16-2", [{
    h: "工程深化：Excel、Word、PDF 的批量生成与校验",
    p: `办公文档生成的核心不是「能写出来」，而是「打开不报错、格式不乱、数据对得上」。Excel 用 openpyxl/xlsxwriter，Word 用 python-docx，PDF 用 reportlab/WeasyPrint。先选对工具：xlsxwriter 只能新建、速度快；openpyxl 能读写改，适合模板填充。

Excel 模板填充要保留样式。用 openpyxl 打开模板，按命名区域或固定单元格写值，不要重建整个工作簿。写完后检查公式是否重算、合并单元格是否错位、列宽是否够。大量数据写入用 [[write_only=True]] 模式，减少内存。

Word 模板用 [[docxtpl]] 或 python-docx 的占位符替换。占位符命名要唯一，避免 [[{{name}}]] 和 [[{{name_cn}}]] 混淆；替换前检查所有占位符是否都有值，缺值要报错而不是留空。表格循环行要用模板引擎的循环语法，不要手工复制段落。

PDF 生成要区分「版式固定」和「内容流式」。固定表单用 reportlab 绝对定位；长文用 WeasyPrint 从 HTML/CSS 排版，分页、页眉页脚更好控制。中文字体要嵌入，否则在别人机器上显示方框；确认字体许可证允许嵌入。

批量生成要命名可追溯：[[成绩单-2026-11-25-林晓.pdf]]，不要 [[output(1).pdf]]。生成清单记录输入、输出、哈希、失败原因；失败的文件不要留在正式目录，放 [[failed/]] 并附日志。

打开校验不能少：xlsx 用 openpyxl 重新打开，docx 用 python-docx 读段落数，PDF 用 pypdf 读页数。只检查文件大小不够，0 字节也可能是「成功」。能自动化就自动化，不能自动化的至少抽样人工打开。

验收：模板样式保留；占位符无遗漏；中文字体正常；批量命名唯一；失败文件隔离；生成后能重新打开。`,
    code: String.raw`from openpyxl import load_workbook
from pathlib import Path

def fill_template(template: Path, out: Path, values: dict):
    wb = load_workbook(template)
    ws = wb.active
    for cell, value in values.items():
        ws[cell] = value
    wb.save(out)
    # 重新打开校验
    check = load_workbook(out, read_only=True)
    assert check.active["B2"].value == values["B2"]
    check.close()

fill_template(Path("template.xlsx"), Path("out.xlsx"), {"B2": "林晓", "C2": 12.34})`,
    output: `# out.xlsx 可被 Excel/openpyxl 打开，
# B2/C2 值与输入一致，模板样式保留。`,
    tip: `模板填充保留样式；占位符缺值报错；中文字体嵌入；失败文件隔离；生成后重新打开。`
  }, {
    h: "故障排查：批量对账、差异报告与重跑",
    p: `批量任务的验收不是「全部成功」，而是「成功多少、失败多少、差异在哪」。对账要两边都读进来，按主键外连接，列出「只在左」「只在右」「两边都有但字段不同」三类差异。不要只比总行数，行数相同也可能内容错位。

差异报告要可操作：主键、字段、左值、右值、差异类型。金额/时间要有容差，字符串要 trim/统一大小写，日期要统一时区。浮点金额转整数分再比，避免 0.01 的显示误差。

重跑要只处理失败项。把失败主键写入 [[retry.json]]，下次读它而不是全量重跑；成功后从列表移除。全量重跑成本高，还可能重复产生副作用。重跑前确认失败原因已修复，不要盲目重试。

批次号贯穿日志、输出、数据库。每批一个 id，所有记录带 batch_id；出问题能按批次回滚或删除。不要用时间戳当唯一批次号，同一秒可能跑两个任务。

并发批量要限制。Excel/Word 生成吃内存，PDF 渲染吃 CPU；同时开 20 个进程会把机器拖死。用线程/进程池限制并发，按文件大小动态调整。失败重试要有上限，避免坏文件无限循环。

验收：对账三类差异都能列出；重跑只处理失败项；批次可回滚；并发不拖垮机器；报告能被业务人员看懂。`,
    code: String.raw`import pandas as pd

left = pd.DataFrame({"id": [1, 2, 3], "amount": [100, 200, 300]})
right = pd.DataFrame({"id": [1, 2, 4], "amount": [100, 250, 400]})

merged = left.merge(right, on="id", how="outer", suffixes=("_l", "_r"), indicator=True)
only_left = merged[merged["_merge"] == "left_only"]
only_right = merged[merged["_merge"] == "right_only"]
both = merged[merged["_merge"] == "both"].copy()
both["diff"] = both["amount_l"] - both["amount_r"]
changed = both[both["diff"] != 0]
print(only_left[["id"]].to_dict("records"))
print(only_right[["id"]].to_dict("records"))
print(changed[["id", "amount_l", "amount_r", "diff"]].to_dict("records"))`,
    output: `[{'id': 3}]
[{'id': 4}]
[{'id': 2, 'amount_l': 200, 'amount_r': 250, 'diff': -50}]`,
    tip: `外连接分三类差异；金额转整数分；失败清单驱动重跑；batch_id 贯穿；并发限流。`
  }]);

  add("ch16-3", [{
    h: "工程深化：定时任务的调度、锁与错过补偿",
    p: `定时任务不是「while True: sleep(86400)」就可靠。进程重启、机器休眠、任务超时都会导致错过。Linux 用 cron/systemd timer，容器用调度平台；Python 内部可以用 APScheduler，但要知道它不解决机器宕机。

cron 的最小粒度是分钟，时区默认是系统时区。写 [[0 8 * * *]] 前确认服务器时区，否则「早上 8 点」可能是 UTC。需要秒级用 systemd [[OnCalendar]] 或应用内调度。任务命令用绝对路径，cron 的 PATH 很短，虚拟环境要显式激活或用 [[/path/venv/bin/python]]。

任务要加锁，防止上一轮没跑完下一轮又启动。用文件锁或数据库锁，拿不到就跳过并记录「skipped: locked」。不要用 [[kill]] 上一个进程，可能留下半截数据。长任务要设置超时，超时后优雅退出。

错过补偿：任务启动时检查「上次成功时间」，如果超过预期周期，补跑一次或标记 missed。不要无限补跑，历史缺失太多时只补最近 N 次，其余人工处理。补偿任务要幂等，重复跑不会翻倍。

日志要写到文件或 stdout，cron 默认把输出邮件给管理员，很多人不看。用 [[logging]] 写文件并轮转，或交给 systemd journal。每次运行记录开始/结束/耗时/处理量/失败数，出问题能看出是「没跑」还是「跑了失败」。

监控要有心跳。任务超过预期时间没成功，发告警；连续失败 N 次，升级告警。不要只监控进程存活，进程活着但卡住不等于任务成功。心跳写到一个文件/表，外部监控读最后时间。

验收：时区正确；上一轮未结束时跳过；错过能补偿；日志可查；失败告警；重启后任务恢复。`,
    code: String.raw`# crontab -e
# 每天 08:00（服务器时区）跑一次，日志追加
0 8 * * * cd /srv/scores && /srv/scores/.venv/bin/python -m scores daily >> /var/log/scores.log 2>&1

# systemd timer（片段）
# [Timer]
# OnCalendar=*-*-* 08:00:00
# Persistent=true

# 应用内锁
import fcntl
lock = open("/tmp/scores.lock", "w")
try:
    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
except BlockingIOError:
    raise SystemExit("another run is active")`,
    output: `# 上一轮未结束：退出码 0 或专用码，日志记 skipped
# 机器重启：systemd Persistent=true 补跑错过的一次`,
    tip: `cron 注意时区/PATH；任务加非阻塞锁；错过补偿要幂等；日志+心跳+告警。`
  }, {
    h: "故障排查：任务监控、重试与死信队列",
    p: `批量任务失败后，最差的做法是「整批重跑」。应该把失败项写入死信队列（dead letter），带原始输入、错误类型、重试次数、下次重试时间。主流程继续处理其他项，死信单独重试或人工处理。

重试次数要有限，策略要分类。网络错误可以重试 3 次，数据错误重试 100 次也没用；权限错误要人工修。每次重试记录原因，避免「同一个错误刷满日志」。超过上限后标记 failed，不再自动重试。

监控指标至少四个：待处理数、成功数、失败数、最老待处理时长。最老时长持续增长，说明消费速度跟不上；失败率突增，说明上游数据或依赖坏了。把指标打到日志/监控系统，不要只看最后一行「完成」。

告警要可执行。消息里带任务名、批次 id、失败数、前三条错误、日志链接；不要只发「任务失败」。告警聚合，避免一次故障发几百条；同一批次只发一条汇总。

恢复流程要写下来：如何暂停、如何重跑死信、如何回滚批次、如何通知上游。没有恢复手册的监控，只是通知，不是运维。定期演练一次，确认手册有效。

验收：失败项进死信；重试有上限和分类；指标能看出积压；告警带上下文；恢复手册可执行。`,
    code: String.raw`import json, time
from pathlib import Path

DEAD = Path("dead-letter.jsonl")

def handle(item):
    try:
        process(item)
    except Exception as exc:
        record = {
            "item": item,
            "error": type(exc).__name__,
            "message": str(exc),
            "attempts": item.get("attempts", 0) + 1,
            "next_retry": time.time() + 300,
        }
        with DEAD.open("a", encoding="utf-8") as fh:
            fh.write(json.dumps(record, ensure_ascii=False) + "\n")
        raise`,
    output: `# dead-letter.jsonl 每行一个失败项：
# 原始输入、错误类型、消息、次数、下次重试时间`,
    tip: `失败项进死信；按错误类型定重试；监控积压与失败率；告警带批次和日志；写恢复手册。`
  }]);
})();

/* --- expand17.js --- */

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

  add("ch17-1", [{
    h: "工程深化：线程锁、队列与超时退出",
    p: `线程共享内存，所以「读-改-写」不是原子操作。[[counter += 1]] 实际是读值、加一、写回三步，两个线程可能同时读到同一个旧值，最后只加了一次。用 [[threading.Lock]] 包住临界区，或者用 [[itertools.count]] 这类原子工具。锁的范围要小，但不能漏。

死锁的经典场景是「两个线程以相反顺序拿两把锁」。避免方法：固定加锁顺序、用 [[RLock]] 可重入、设置超时（[[lock.acquire(timeout=2)]]），拿不到就放弃并记录。不要用「先检查再拿锁」的写法，检查和拿之间仍有竞态。

[[queue.Queue]] 是线程安全的通信方式，生产者 [[put]]、消费者 [[get]]。队列满时 [[put]] 默认阻塞，队列空时 [[get]] 默认阻塞；用 [[timeout]] 避免永久卡住。任务结束用哨兵值（None）通知消费者退出，或 [[put]] 一个特殊对象，不要依赖 [[empty()]] 判断，它不可靠。

[[ThreadPoolExecutor]] 适合 I/O 密集任务。[[submit]] 返回 Future，[[result(timeout=...)]] 拿结果；不要在主线程无限等。[[as_completed]] 按完成顺序处理，适合「谁先好先处理」。线程数不是越多越好，I/O 密集可以 10-50，CPU 密集应该用进程。

退出要优雅。设置 [[stop_event]]，工作线程在循环里检查；主线程 [[join(timeout)]]，超时后标记 daemon 或强制退出。daemon 线程会在主线程退出时被杀，可能留下半截文件；关键任务不要用 daemon。

日志要带线程名。[[threading.current_thread().name]] 放进日志格式，排查时能看出哪个线程卡住。队列长度、活跃线程数、任务耗时也是重要指标。

验收：并发计数不丢；两把锁不死锁；队列满/空有超时；线程异常能被主线程知道；退出不留半截数据。`,
    code: String.raw`import queue, threading, time

q = queue.Queue(maxsize=10)
stop = threading.Event()
counter = 0
lock = threading.Lock()

def worker():
    global counter
    while not stop.is_set():
        try:
            item = q.get(timeout=0.5)
        except queue.Empty:
            continue
        try:
            with lock:
                counter += 1
            process(item)
        finally:
            q.task_done()

threads = [threading.Thread(target=worker, name=f"w{i}") for i in range(4)]
for t in threads:
    t.start()
for i in range(100):
    q.put(i, timeout=1)
q.join()
stop.set()
for t in threads:
    t.join(timeout=2)
print(counter)`,
    output: `100`,
    tip: `读改写要加锁；固定加锁顺序防死锁；队列用超时和哨兵；退出设 Event 并 join。`
  }, {
    h: "故障排查：线程异常、上下文与 Flask 式共享状态",
    p: `线程里抛异常，默认不会传回主线程；[[Thread]] 的异常打到 stderr，主线程可能以为任务成功。用 [[ThreadPoolExecutor]] 的 Future，[[result()]] 会把异常重新抛出；或者在线程里捕获后写入共享的错误队列。不要让异常静默消失。

[[contextvars]] 在 asyncio 里能自动传播，但线程池不会自动复制上下文。[[ThreadPoolExecutor]] 提交任务时，上下文不会跟过去；需要 [[contextvars.copy_context().run]] 包一层。日志的 request_id 丢失，往往就是这个原因。

共享可变状态要加锁，但更重要的是「尽量不共享」。每个线程用自己的对象、自己的数据库连接、自己的 Session。全局配置用只读对象；需要更新时，用消息/队列通知，不要直接改全局字典。

[[threading.local]] 给每个线程独立副本，适合数据库连接、请求上下文。但它不是异步安全的；asyncio 同一个线程跑多个任务，[[threading.local]] 会串。异步用 [[contextvars]]，线程用 [[threading.local]]，不要混。

线程池大小要匹配下游。数据库连接池 10 个，线程池开 50 个只会让 40 个线程等连接；HTTP 服务限流 20 QPS，开 100 个线程只会收到 429。先算下游容量，再定并发。

关闭线程池用 [[shutdown(wait=True)]]，确认任务完成；[[cancel_futures=True]] 取消未开始的任务。不要在退出时直接 [[os._exit]]，那会跳过清理和 flush。

验收：线程异常主线程能感知；request_id 不丢；共享计数正确；线程池不超过下游容量；退出时任务完成或明确取消。`,
    code: String.raw`from concurrent.futures import ThreadPoolExecutor
import contextvars, logging

request_id = contextvars.ContextVar("request_id", default="-")

def task(x):
    logging.info("handle %s rid=%s", x, request_id.get())
    if x == 3:
        raise ValueError("bad item")
    return x * 2

ctx = contextvars.copy_context()
with ThreadPoolExecutor(max_workers=4) as pool:
    futures = [pool.submit(ctx.run, task, i) for i in range(5)]
    for f in futures:
        try:
            print(f.result(timeout=5))
        except Exception as exc:
            print("worker failed:", type(exc).__name__, exc)`,
    output: `0
2
4
worker failed: ValueError bad item
8`,
    tip: `Future.result 重抛异常；线程池手动复制 contextvars；少共享；按下游容量定线程数。`
  }]);

  add("ch17-2", [{
    h: "工程深化：进程池、可 pickle 与初始化成本",
    p: `CPU 密集任务用 [[ProcessPoolExecutor]]，因为 GIL 让多线程无法并行计算。但进程间不共享内存，参数和返回值要能 [[pickle]]。lambda、局部函数、打开的文件、数据库连接、锁对象通常不能 pickle；提交前会报错，或者静默失败。

在模块顶层定义工作函数，不要用闭包。需要额外参数时，用 [[functools.partial]] 或把参数打包成 tuple；partial 本身要能 pickle，绑定的函数必须在模块顶层。[[__main__]] 保护在 Windows/macOS 的 spawn 模式必须加，否则子进程会重新执行主模块。

进程启动成本高。每个进程要重新 import 模块、初始化解释器；任务太碎时，进程池反而更慢。按「任务耗时 / 启动成本」决定：计算几毫秒的任务不值得开进程，几秒的值得。用 [[chunksize]] 批量提交，减少 IPC。

返回值不要太大。一个任务返回几百 MB 的 DataFrame，pickle 和传输会吃掉收益；让子进程写文件/数据库，返回路径或 id。共享大数组用 [[multiprocessing.shared_memory]]，但要手动管理生命周期，避免泄漏。

异常也会被 pickle。自定义异常类要在模块顶层可导入，否则子进程能抛、主进程反序列化失败。异常消息里不要带不可 pickle 的对象（如 socket）。捕获后转成字符串+类型，再抛简单异常。

进程池要限制并发。[[max_workers]] 默认是 CPU 核数，超线程机器可能 16 个；内存 16GB 的机器开 16 个 pandas 进程会 OOM。按内存定上限：单任务峰值 × 并发 < 可用内存的 70%。

验收：工作函数可 pickle；Windows 有 [[if __name__ == "__main__"]]；任务粒度合理；返回数据小；异常可反序列化；并发不 OOM。`,
    code: String.raw`from concurrent.futures import ProcessPoolExecutor
from functools import partial

def score(rows, factor):
    return sum(r["seconds"] for r in rows) * factor

def main():
    batches = [[{"seconds": 12.3}], [{"seconds": 11.8}]]
    with ProcessPoolExecutor(max_workers=2) as pool:
        results = list(pool.map(partial(score, factor=2), batches, chunksize=1))
    print(results)

if __name__ == "__main__":
    main()`,
    output: `[24.6, 23.6]`,
    tip: `工作函数放模块顶层；参数可 pickle；任务别太碎；返回小数据；按内存定并发。`
  }, {
    h: "故障排查：进程卡死、共享内存与强制终止",
    p: `进程池卡死常见原因：子进程等一个永远不会来的锁、父进程没读管道导致缓冲区满、子进程在等 stdin。先在父进程 [[faulthandler.dump_traceback_later(30, exit=True)]]，30 秒后打印所有线程/进程堆栈，定位卡在哪。

[[ProcessPoolExecutor]] 的 [[shutdown(wait=True)]] 会等所有任务；有任务卡住就永远等。用 [[shutdown(wait=False, cancel_futures=True)]] 取消未开始任务，但已在运行的进程仍可能活着。必要时 [[terminate()]]，再 [[kill()]]；terminate 给 SIGTERM，kill 给 SIGKILL，后者不执行清理。

共享内存用 [[shared_memory.SharedMemory]] 创建/attach，用完 [[close()]] 和 [[unlink()]]。只 close 不 unlink 会留下 [[/dev/shm]] 残留；只 unlink 不 close 仍有映射。父子进程都要正确关闭；崩溃时残留需要启动清理。

[[multiprocessing.Manager]] 提供共享 dict/list，但性能差、依赖网络式代理；大数据不要用。优先「每个进程算自己的，最后汇总」；需要共享只读大数组时用 shared_memory，需要频繁写时用数据库/队列。

子进程日志要单独配置。spawn 模式下 logging 配置不会自动继承；每个子进程重新 [[basicConfig]] 或传配置。日志写同一个文件可能交错，用 [[QueueHandler]] 发给父进程，或每个进程写自己的文件。

终止后要检查残留。[[ps]] 看僵尸进程，[[/dev/shm]] 看共享内存，临时目录看 .part 文件。启动时清理上一轮残留，避免磁盘/内存被占满。

验收：卡死时能打印堆栈；shutdown 不会无限等；共享内存 close+unlink；子进程日志不交错；终止后无残留。`,
    code: String.raw`import faulthandler, multiprocessing as mp
from multiprocessing import shared_memory
import numpy as np

faulthandler.dump_traceback_later(30, exit=True)

shm = shared_memory.SharedMemory(create=True, size=1024)
arr = np.ndarray((128,), dtype=np.float64, buffer=shm.buf)
arr[:] = 1.0
try:
    print(arr.sum())
finally:
    arr = None
    shm.close()
    shm.unlink()
faulthandler.cancel_dump_traceback_later()`,
    output: `128.0
# 共享内存已 close + unlink，/dev/shm 无残留`,
    tip: `faulthandler 打堆栈；shutdown 可能卡；terminate 后再 kill；共享内存 close+unlink。`
  }]);

  add("ch17-3", [{
    h: "工程深化：TaskGroup、取消传播与超时",
    p: `[[asyncio.gather]] 在某个任务失败时，默认不会取消其他任务；它们继续跑，可能产生半截副作用。Python 3.11 的 [[TaskGroup]] 在第一个异常时取消同组其他任务，并把异常聚合成 ExceptionGroup。需要「一失败全停」用 TaskGroup；需要「全部跑完再汇总」用 gather + return_exceptions。

[[asyncio.timeout(seconds)]] 是 3.11 的结构化超时，超时后取消当前任务并抛 TimeoutError。不要用 [[wait_for]] 的旧写法，它也能用，但语义不如 timeout 清晰。超时范围要包住整个操作，包括重试和清理；不要只包网络请求。

取消不是「立刻停止」。[[CancelledError]] 在 await 点抛出，同步代码块不会被打断；清理要在 finally 里做，且清理本身要快、不能再被取消。捕获 CancelledError 后不要吞掉，除非你真的要阻止取消；吞掉会让上层永远等不到结束。

任务组里不要共享可变状态。多个任务同时改一个 list/dict，需要 [[asyncio.Lock]] 或每个任务返回自己的结果再合并。asyncio 是单线程协作式，不加锁的「读-改-写」在 await 之间仍可能交错。

超时要分层：连接超时、读取超时、总预算。总预算到了，即使单步还没超时，也要取消。用 [[asyncio.timeout_at]] 基于绝对时间，避免每步重新计时导致总时长翻倍。

取消后要等任务真正结束。[[TaskGroup]] 的 [[__aexit__]] 会等所有子任务退出；自己管理任务时，cancel 后要 [[await task]] 捕获 CancelledError。不等就退出事件循环，会留下未关闭的连接。

验收：一个任务失败，其他任务被取消；超时抛 TimeoutError；清理执行；取消不被吞；退出前所有任务结束。`,
    code: String.raw`import asyncio

async def fetch(i):
    try:
        await asyncio.sleep(0.2)
        if i == 2:
            raise ValueError("bad item")
        return i
    finally:
        print("cleanup", i)

async def main():
    try:
        async with asyncio.TaskGroup() as tg:
            for i in range(4):
                tg.create_task(fetch(i))
    except* ValueError as group:
        print("failed:", len(group.exceptions))

asyncio.run(main())`,
    output: `cleanup 0
cleanup 1
cleanup 2
cleanup 3
failed: 1`,
    tip: `TaskGroup 一失败全取消；timeout 包住总操作；CancelledError 清理后要重抛；取消后 await 收尾。`
  }, {
    h: "故障排查：背压、信号量与无界队列",
    p: `[[asyncio.Queue]] 默认无界，生产者可以无限放，消费者跟不上就吃内存。用 [[Queue(maxsize=100)]] 加 [[await queue.put(x)]]，队列满时生产者自动等待，形成背压。不要用 [[put_nowait]] 然后忽略 QueueFull，那等于丢任务。

[[asyncio.Semaphore]] 限制同时进行的操作，比如最多 10 个并发请求。acquire 要在 try/finally 里 release，异常也不能漏。用 [[async with sem]] 更安全。信号量不是速率限制；每秒最多 10 个请求要用令牌桶，信号量只控制并发数。

生产者和消费者要能优雅结束。生产者完成后放哨兵（None），消费者收到后退出；或者用 [[queue.join()]] + [[task_done()]]。不要用 [[q.empty()]] 判断结束，生产者和消费者并发时不可靠。

消费者异常要处理。一个任务失败不应该让整个消费循环退出；捕获、记录、继续，或者把失败项放回重试队列。需要「失败即停」时，设置取消事件并等待所有任务退出。

背压也会传到上游。下游限流时，队列会满，生产者 await 变慢；这是正确行为。不要为了「跑得快」把队列改成无界，最后 OOM 更慢。监控队列长度和等待时间，动态调消费者数量。

取消时队列里还有任务。决定是「处理完再退」还是「丢弃未处理」；记录丢弃数量，不要静默。关闭前 [[await q.join()]] 确保 task_done 都调用；否则 join 永远等。

验收：队列有界；生产者在满时等待；信号量异常也释放；结束有哨兵/join；失败不拖垮循环；取消时丢弃数量可查。`,
    code: String.raw`import asyncio

async def worker(name, q, sem):
    while True:
        item = await q.get()
        try:
            if item is None:
                break
            async with sem:
                await asyncio.sleep(0.1)
                print(name, item)
        finally:
            q.task_done()

async def main():
    q = asyncio.Queue(maxsize=5)
    sem = asyncio.Semaphore(2)
    workers = [asyncio.create_task(worker(f"w{i}", q, sem)) for i in range(3)]
    for i in range(20):
        await q.put(i)
    for _ in workers:
        await q.put(None)
    await q.join()
    await asyncio.gather(*workers)

asyncio.run(main())`,
    output: `# 3 个 worker，最多 2 个并发；
# 队列满时生产者等待，内存不增长。`,
    tip: `有界队列形成背压；Semaphore 控并发；哨兵/join 优雅结束；失败项记录后继续。`
  }]);
})();

/* --- expand18.js --- */

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
    h: "工程深化：验收测试要写业务合同，不是函数清单",
    p: `课程项目最后一步不是「功能都写完了」，而是「业务上说得清什么算成功」。验收测试应该从用户可见的行为出发：给一份输入，运行命令，检查输出文件、退出码、日志摘要。它不关心内部调用了哪个函数，只关心结果是否符合约定。

先写一张验收表：场景、输入、期望输出、失败时退出码、必须出现的字段、禁止出现的内容。比如「合法 CSV 导入后，报表包含 3 行，总人数 3，退出码 0」；「缺列 CSV 导入后，退出码 1，错误报告含行号和列名」。每条都能自动执行。

用 subprocess 跑真实 CLI，而不是直接调用函数。[[subprocess.run([sys.executable, "-m", "scores", ...])]] 能覆盖参数解析、环境变量、文件系统、退出码。测试数据放 [[tests/fixtures/]]，每个场景一个目录，输入和期望放在一起，避免测试里写大段字符串。

断言输出文件时，不要只比整个文件字符串。CSV 比较解析后的行/列；JSON 比较结构；HTML 比较关键文本和链接；PDF 比较页数和可提取文字。整文件比对容易因时间戳、路径、排序变化而失败，维护成本高。

验收环境要干净：临时目录、固定时区、固定 locale、固定随机种子。不要依赖开发机的 [[~/.scores]] 配置；用 [[env={...}]] 和 [[cwd=tmp_path]] 隔离。测试结束后删除临时目录，失败时保留并打印路径。

失败信息要可诊断：命令、退出码、stdout/stderr 最后 N 行、输出文件路径、期望 vs 实际。不要只写 [[assert result == 0]]，失败时不知道哪一步错。把「怎么复现」写进断言消息。

验收：每个业务场景一条测试；真实 CLI 执行；输出解析后比较；环境隔离；失败信息可复现。`,
    code: String.raw`import json, subprocess, sys
from pathlib import Path

def run_cli(tmp_path: Path, *args):
    return subprocess.run(
        [sys.executable, "-m", "scores", *args],
        cwd=tmp_path, capture_output=True, text=True,
        env={"PATH": "/usr/bin:/bin", "HOME": str(tmp_path), "LANG": "C.UTF-8"},
        timeout=30,
    )

def test_import_ok(tmp_path):
    (tmp_path / "in.csv").write_text("athlete,seconds\n林晓,12.34\n", encoding="utf-8")
    r = run_cli(tmp_path, "import", "in.csv", "--out", "out.json")
    assert r.returncode == 0, r.stderr
    data = json.loads((tmp_path / "out.json").read_text(encoding="utf-8"))
    assert len(data) == 1 and data[0]["athlete"] == "林晓"`,
    output: `# pytest -q
# 1 passed`,
    tip: `验收从业务场景出发；subprocess 跑真实 CLI；解析后比较；临时目录隔离；失败带复现信息。`
  }]);

  add("ch18-2", [{
    h: "工程深化：脏数据清洗、错误报告与可重跑",
    p: `真实成绩表里常见问题：姓名前后空格、项目名简写、时间格式混用、重复报名、空行、全角数字、Excel 把 [[12.34]] 存成日期。清洗不是「全部转成字符串再 trim」，而是按列定义规则，逐条记录改了什么。

姓名列：去首尾空格、全角转半角、合并连续空格；不要擅自改错别字，保留原始值。项目列：建立映射表，[[100米]]/[[100m]]/[[百米]] 统一成 [[100m]]；映射不中的值进「未知项目」错误列表，不要静默丢弃。

时间列：支持 [[12.34]]、[[12.3s]]、[[0:12.34]]、[[1:02.35]] 几种格式，用一个解析函数统一转秒。解析失败带原值、行号、期望格式。不要用 [[float]] 直接转，[[1:02.35]] 会失败，[[12,34]] 会变成 1234。

重复记录：按「姓名 + 项目 + 日期」判重，保留最新一条或标记冲突，让业务确认。不要按整行判重，备注不同也会被当成不同记录。重复处理要有报告，说明保留哪条、丢弃哪条。

空行/缺列：CSV 中间的空行可以跳过并计数；整行全空才算空行。缺列要 fail-fast，因为后续所有行都可能错位。列数多于表头时，多出的值进错误报告，不要静默截断。

清洗后的数据要写「清洗日志」：总行数、修改数、跳过数、错误数、每条修改的原值/新值/规则。日志和输出文件放同一目录，文件名带批次号。重跑时先删旧输出或覆盖同一批，避免叠加。

验收：每种脏数据都有用例；错误带行号/列名/原值；重复处理有报告；清洗日志可追溯；重复跑结果一致。`,
    code: String.raw`import re, unicodedata

def clean_name(value: str) -> str:
    text = unicodedata.normalize("NFKC", value)
    return re.sub(r"\s+", " ", text).strip()

def parse_time(value: str) -> float:
    text = clean_name(value).lower().replace("s", "")
    if ":" in text:
        minute, rest = text.split(":", 1)
        return int(minute) * 60 + float(rest)
    return float(text)

print(clean_name(" 林　晓 "))

changes = []
raw = " 林　晓 "
cleaned = clean_name(raw)
if cleaned != raw:
    changes.append({"raw": raw, "clean": cleaned, "rule": "nfkc+space"})
print(changes)`,
    output: `林 晓
[{'raw': ' 林　晓 ', 'clean': '林 晓', 'rule': 'nfkc+space'}]`,
    tip: `按列定义清洗规则；时间多格式统一；重复按业务键；错误带行号原值；清洗日志可追溯。`
  }]);

  add("ch18-3", [{
    h: "工程深化：排名、并列、积分与进度计算",
    p: `排名不是简单 [[sorted]] 后加序号。并列要同名次，下一名跳号：1、1、3，不是 1、1、2。实现时先排序，再比较当前成绩与上一名，相同则同名次，不同则名次等于当前位置索引 + 1。

积分制要先定规则：名次分（第一 10 分、第二 8 分……）、达标分、破纪录加分。规则写成配置/常量，不要散在代码里。每个运动员的总分要能追溯到每场比赛的每项得分，报表里给明细。

缺赛和弃权要区分。缺赛可能记 0 分，弃权可能记 -1 或取消资格；不同项目规则不同。用枚举表示状态，不要用魔法字符串。统计时明确是否排除，报表里标注原因。

进度计算要防除零。完成率 = 已完成 / 总数，总数为 0 时返回 0 或 None，不要抛 ZeroDivisionError。进度条/百分比要四舍五入一致，避免 99.5% 显示成 100% 但仍有未完成项。

多轮比赛的总分要按轮次权重。权重配置化，变更时版本号一起改；历史成绩用当时权重，不要用新规则重算旧比赛。报表里注明规则版本。

验收：并列名次正确；下一名跳号；积分明细可追溯；缺赛/弃权可区分；总数为 0 不崩；规则版本可追溯。`,
    code: String.raw`def rank(rows):
    ordered = sorted(rows, key=lambda r: r["seconds"])
    out = []
    last_seconds = None
    last_rank = 0
    for index, row in enumerate(ordered, start=1):
        if row["seconds"] != last_seconds:
            last_rank = index
            last_seconds = row["seconds"]
        out.append({**row, "rank": last_rank})
    return out

rows = [{"name": "A", "seconds": 12.3}, {"name": "B", "seconds": 12.3},
        {"name": "C", "seconds": 12.5}]
print([(r["name"], r["rank"]) for r in rank(rows)])`,
    output: `[('A', 1), ('B', 1), ('C', 3)]`,
    tip: `并列同名次、下一名跳号；积分规则配置化；缺赛/弃权用枚举；除零保护；规则带版本。`
  }]);

  add("ch18-4", [{
    h: "工程深化：报表模板、打印样式与可访问性",
    p: `最终报表通常既要屏幕看，也要打印/转 PDF。HTML 模板要同时满足两者：屏幕用响应式布局，打印用 [[@media print]] 隐藏导航、固定分页、避免表格跨页断行。不要为打印单独维护一份 HTML，样式分叉很快。

表格是报表的核心。数字右对齐、文本左对齐、表头加粗、单位写在表头（秒、米、分）。长表格用 [[thead]] 重复表头，[[tr]] 设置 [[break-inside: avoid]]，避免一行被切成两半。列太多时，屏幕上横向滚动，打印时缩放到一页或分页。

颜色不要作为唯一信息。名次用数字、奖牌用文字/图标+颜色；色盲用户也能读。对比度至少 4.5:1，深色文字配浅色底。打印默认黑白也能看懂，不要依赖浅灰背景区分。

页眉页脚放关键信息：报表名、日期、数据版本、页码。页脚放来源和生成命令。打印时 URL 不要出现在页脚（浏览器默认会加），用 [[@page]] 的 margin box 控制。

可访问性：图片有 [[alt]]，表格有 [[caption]]，按钮有可读文本，表单有 label。不要用 [[div]] 模拟表格。键盘能操作筛选和导出；焦点可见。报表是给人看的，不是只给截图。

验收：屏幕 1440/390 可读；打印预览无截断；表头重复；颜色可区分；键盘可操作；PDF 文字可提取。`,
    code: String.raw`<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>成绩报表</title>
<style>
@media print {
  nav, .no-print { display: none; }
  table { page-break-inside: auto; }
  tr { break-inside: avoid; }
  thead { display: table-header-group; }
}
table { border-collapse: collapse; width: 100%; }
th, td { border-bottom: 1px solid #ddd; padding: 8px; }
td.num { text-align: right; font-variant-numeric: tabular-nums; }
</style>
</head>
<body>
<h1>成绩报表</h1>
<table>
<caption>2026 年 11 月 25 日，共 3 人</caption>
<thead><tr><th>姓名</th><th>项目</th><th>成绩（秒）</th></tr></thead>
<tbody>
<tr><td>林晓</td><td>100m</td><td class="num">12.34</td></tr>
</tbody>
</table>
</body>
</html>`,
    output: `# 屏幕可读；打印时导航隐藏、表头重复、
# 行不被截断；PDF 可提取文字。`,
    tip: `一套 HTML 兼顾屏幕/打印；数字右对齐；别只靠颜色；页眉页脚带版本；可访问性。`
  }]);

  add("ch18-5", [{
    h: "工程深化：golden 文件与 CLI 回归测试",
    p: `golden 文件是「已知正确的输出样本」，用来发现意外变化。适合格式稳定的报表、JSON 结构、CLI 帮助文本。测试时把当前输出与 golden 比较，不一致就失败，让人确认是「预期变更」还是「回归」。

golden 不要存整个大文件。只存关键片段：表头、前几行、统计摘要、错误信息。大文件一旦变化，diff 几千行没人看。结构化输出先规范化：排序键、固定缩进、去掉时间戳/路径/随机 id，再比较。

更新 golden 要有明确命令，例如 [[pytest --update-golden]]，并且更新后的 diff 必须进 code review。不要让测试自动覆盖 golden，否则回归会被静默接受。更新时在 PR 里说明「为什么输出变了」。

CLI 回归要覆盖：[[--help]]、缺参数、非法参数、正常最小用例、错误用例、[[--json]] 输出可解析。帮助文本变化会影响用户脚本，应该被审查；退出码变化会破坏 CI，必须测试。

环境差异会让 golden 不稳定：路径、换行、locale、时区、Python 版本。输出前统一：相对路径、[[\n]] 换行、UTC 或固定时区、[[PYTHONHASHSEED=0]]。不要把开发机绝对路径写进 golden。

验收：golden 只含关键片段；比较前规范化；更新有命令和 review；CLI 主要路径覆盖；跨平台稳定。`,
    code: String.raw`# tests/test_golden.py
from pathlib import Path
import json

GOLDEN = Path("tests/golden/report.json")

def normalize(data):
    return {
        "count": data["count"],
        "top": sorted(data["top"], key=lambda r: r["name"]),
        "version": data["version"],
    }

def test_report_matches_golden(tmp_path):
    out = tmp_path / "report.json"
    run_report(out)
    actual = normalize(json.loads(out.read_text(encoding="utf-8")))
    expected = json.loads(GOLDEN.read_text(encoding="utf-8"))
    assert actual == expected`,
    output: `# 输出变化时 diff 只显示关键字段；
# 更新 golden：pytest --update-golden，并 review diff`,
    tip: `golden 只存关键片段；规范化路径/时间/排序；更新需显式命令和 review；CLI 路径覆盖。`
  }]);

  add("ch18-6", [{
    h: "工程深化：从本地脚本到可交付项目的最后一公里",
    p: `项目能跑之后，最后一公里是「别人能装、能跑、能维护」。至少要有一份 README：项目做什么、安装命令、最小示例、配置项、常见错误、测试命令。不要假设读者知道你的目录结构。

打包按第 13 章做：src 布局、pyproject、wheel、可选依赖、py.typed。CLI 入口用 [[project.scripts]]，同时支持 [[python -m scores]]。版本号一处定义，变更日志记录公开变化。

CI 至少跑四件事：安装依赖、lint/format、类型检查、测试。再加一个「安装 wheel 后跑 smoke test」的 job，防止只在源码目录能跑。矩阵覆盖目标 Python 版本和操作系统；macOS/Windows 的路径、编码、进程行为差异很大。

定时任务/部署要有回滚。发布前打 tag、保存 wheel、记录配置；部署后跑健康检查；失败时回滚到上一版。不要直接在生产目录改代码，下一次部署会覆盖。配置和密钥走环境变量/密钥管理，不写进仓库。

文档记录「怎么恢复」：数据库备份在哪、如何重跑失败批次、如何回滚版本、联系人是谁。没有恢复方案的系统，不能算交付。定期演练一次恢复流程。

验收：干净机器按 README 能装能跑；CI 全绿；wheel 安装后 smoke 通过；版本/tag/变更日志一致；回滚步骤可执行。`,
    code: String.raw`# README 最小结构
# 1. 项目简介（一句话）
# 2. 安装：python -m venv .venv && pip install .
# 3. 快速开始：scores show --json
# 4. 配置：SCORES_DB_URL、SCORES_TIMEOUT
# 5. 测试：pytest
# 6. 常见错误：缺列、编码、权限
# 7. 发布/回滚：tag、wheel、上一版

# CI 最小步骤
# - pip install -e ".[dev]"
# - ruff check .
# - mypy src
# - pytest
# - python -m build && pip install dist/*.whl
# - python -m scores --help`,
    output: `# 干净机器：README 步骤可复制执行；
# CI：lint + 类型 + 测试 + wheel smoke 全绿。`,
    tip: `README 含安装/示例/配置/错误/测试；CI 加 wheel smoke；发布打 tag 留产物；写回滚手册。`
  }]);
})();

/* --- expand-project-a.js --- */

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

  add("ch8-3", [{
    h: "综合项目：把单文件脚本做成可安装的 scores-kit 包",
    p: `这一章的项目不是再写几个 import 示例，而是把前 7 章的脚本整理成一个真正能 [[pip install]] 的包。目标很具体：包名 [[scores-kit]]，导入名 [[scores]]，提供 [[load_csv]]、[[rank]]、[[render_report]] 三个公开函数，一个 [[scores]] 命令，内置一份默认报表模板，附带类型标记和测试。做完后，换一台干净机器也能安装、导入、运行。

第一步定目录：[[src/scores/__init__.py]] 只暴露公开 API 和版本号；[[src/scores/models.py]] 放 dataclass；[[src/scores/io.py]] 放读写；[[src/scores/report.py]] 放渲染；[[src/scores/cli.py]] 放命令行；[[src/scores/data/report.md]] 放模板；[[tests/]] 放测试。不要把所有函数塞进 [[__init__.py]]，那会让导入变慢，也让内部实现被外部误用。

第二步定公开 API。[[__init__.py]] 写 [[__all__ = ["load_csv", "rank", "render_report", "__version__"]]，其他名字一律视为内部。函数签名要稳定：[[load_csv(path: str | Path) -> list[Row]]]，[[rank(rows: list[Row]) -> list[Row]]]，[[render_report(rows, out: Path, template: str | None = None) -> Path]]。先定签名再写实现，调用方和测试才有合同。

第三步处理资源。模板不要用 [[__file__]] 拼路径，用 [[importlib.resources.files("scores") / "data" / "report.md"]]。[[pyproject.toml]] 的 package-data 要包含 [[data/*.md]] 和 [[py.typed]]。构建后解压 wheel，确认模板真的在里面；这一步不过，安装后一定报 FileNotFoundError。

第四步做 CLI。[[cli.py]] 的 [[main(argv=None) -> int]] 负责解析参数、调用服务、捕获异常、返回退出码；[[__main__.py]] 只写 [[raise SystemExit(main())]]。命令至少支持 [[scores rank input.csv --out report.md]] 和 [[scores --version]]。参数错误返回 2，数据错误返回 1，成功返回 0；结果写 stdout，日志写 stderr。

第五步做测试。单元测试覆盖 [[load_csv]] 的正常/缺列/空文件；集成测试用 [[subprocess]] 跑 [[python -m scores]]，检查退出码和输出文件；资源测试在 wheel 安装后读取模板。测试数据放 [[tests/fixtures/]]，不要在生产包里带测试数据。

第六步做构建验收。[[python -m build]] 生成 sdist 和 wheel；[[twine check dist/*]] 通过；在干净 venv [[pip install dist/*.whl]]；运行 [[python -c "import scores; print(scores.__version__)"]] 和 [[scores --help]]；再跑一次 [[render_report]]。源码目录能跑不算完成，wheel 能跑才算。

第七步写 README。开头一句话说明包做什么；安装命令；三行快速示例；配置项；常见错误（缺列、编码、模板找不到）；测试命令；版本与许可证。README 的示例要复制到 [[examples/quickstart.py]] 并用测试跑一遍，避免文档过期。

第八步留扩展点。[[scores/plugins.py]] 可以先留空，但 [[render_report]] 的 [[template]] 参数、[[load_csv]] 的编码参数要预留。不要为了「以后可能用」加一堆抽象；只留真实需要的扩展点。项目的边界清楚，后续加功能才不会推翻结构。

验收清单：干净环境安装成功；三个公开函数可导入；CLI 两种入口行为一致；模板从 wheel 读取；测试全绿；README 示例可运行；wheel 里无测试文件；版本号只出现一处。八条全过，这个包才算从脚本变成交付物。`,
    code: String.raw`# 目录
# pyproject.toml
# README.md
# src/scores/__init__.py
# src/scores/models.py
# src/scores/io.py
# src/scores/report.py
# src/scores/cli.py
# src/scores/data/report.md
# tests/test_io.py
# tests/test_cli.py

# src/scores/__init__.py
from importlib.metadata import version
from .io import load_csv
from .report import render_report
from .rank import rank

__all__ = ["load_csv", "rank", "render_report", "__version__"]
__version__ = version("scores-kit")

# pyproject.toml
[project]
name = "scores-kit"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = []

[project.scripts]
scores = "scores.cli:main"

[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
scores = ["data/*.md", "py.typed"]`,
    output: `$ python -m build
$ twine check dist/*
$ python -m venv /tmp/verify && /tmp/verify/bin/pip install dist/scores_kit-0.1.0-py3-none-any.whl
$ /tmp/verify/bin/scores --version
scores-kit 0.1.0
$ /tmp/verify/bin/python -c "from scores import render_report; print('ok')"
ok`,
    tip: `先定公开 API 再写实现；资源用 importlib.resources；CLI 两入口共用 main；干净 wheel 验收。`
  }]);

  add("ch9-4", [{
    h: "综合项目：可恢复的成绩导入服务",
    p: `这个项目把第 9 章的文件、异常、日志串成一条真实导入链：读 CSV、验证契约、清洗、写 JSON、生成错误报告、记录结构化日志、失败可重跑。输入是一份可能很脏的成绩表，输出是干净的 JSON、错误报告和一份可读的导入摘要。要求重复执行不产生重复数据，中途崩溃能从断点恢复。

先定输入契约：必需列 [[date, athlete, event, seconds]]；[[seconds]] 必须是 0 到 3600 的浮点数；[[date]] 是 ISO 日期；[[athlete]] 去空格后非空。契约检查在读取阶段完成，缺列直接失败，单行错误收集到错误列表，不因为一行坏数据中断整个文件。

状态设计：输入文件哈希 + 业务日期组成 [[batch_id]]；处理进度写 [[state/{batch_id}.json]]，包含最后成功行号、已处理 id、错误计数。每处理 N 行提交一次状态，状态用原子写。重启时读状态，从最后成功行继续；已处理的 id 用集合去重，防止重复写入。

输出设计：干净数据先写 [[out/{batch_id}.json.part]]，全部成功后再 [[os.replace]] 成正式文件；错误报告写 [[out/{batch_id}-errors.csv]]，每行带行号、列名、原值、原因。导入摘要写 [[out/{batch_id}-summary.json]]，包含总行、成功、失败、跳过、耗时、输入哈希。

日志设计：用 JSON formatter，每条带 [[batch_id]]、[[row]]、[[stage]]；开始、每 N 行、结束各一条 INFO；单行错误用 WARNING，不打印完整堆栈；最终失败用 ERROR + exception。日志写 stderr 或文件，不要混进 JSON 输出。

异常设计：文件不存在/不可读是 [[InputError]]，契约缺列是 [[SchemaError]]，单行数据是 [[RowError]]，写入失败是 [[OutputError]]。CLI 捕获后返回不同退出码，并打印人类可读消息；内部保留 [[raise ... from exc]] 的根因链，方便 [[--debug]] 查看。

重跑策略：如果 [[batch_id]] 已存在且摘要显示成功，默认跳过并提示；[[--force]] 才重新处理。失败批次保留状态和错误报告，修复输入后从断点继续；输入文件变了，哈希变，自动是新批次，不会混用旧状态。

验收：正常文件导入成功；缺列文件退出码 1 且错误报告有列名；坏行只影响自己；中途 kill 后重启从断点继续；重复跑不重复写入；输入变更生成新批次；摘要数字与输出文件行数一致。`,
    code: String.raw`from pathlib import Path
import hashlib, json, os, tempfile

def batch_id(path: Path, business_date: str) -> str:
    digest = hashlib.sha256(path.read_bytes()).hexdigest()[:12]
    return f"{business_date}-{digest}"

def load_state(path: Path, bid: str) -> dict:
    state_file = path / f"{bid}.json"
    if state_file.exists():
        return json.loads(state_file.read_text(encoding="utf-8"))
    return {"last_row": 1, "seen": [], "errors": 0}

def save_state(path: Path, bid: str, state: dict) -> None:
    target = path / f"{bid}.json"
    fd, tmp_name = tempfile.mkstemp(dir=path, prefix=".state-")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            json.dump(state, fh, ensure_ascii=False)
            fh.flush(); os.fsync(fh.fileno())
        os.replace(tmp_name, target)
    finally:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)

def import_csv(src: Path, out_dir: Path, business_date: str) -> dict:
    bid = batch_id(src, business_date)
    state = load_state(out_dir, bid)
    seen = set(state["seen"])
    errors = []
    rows = []
    with open(src, encoding="utf-8-sig", newline="") as fh:
        reader = csv.DictReader(fh)
        if not REQUIRED <= set(reader.fieldnames or []):
            raise SchemaError(f"missing columns: {sorted(REQUIRED - set(reader.fieldnames or []))}")
        for line_no, raw in enumerate(reader, start=2):
            if line_no <= state["last_row"]:
                continue
            parsed = parse_row(raw, line_no, errors)
            if parsed and parsed["id"] not in seen:
                rows.append(parsed)
                seen.add(parsed["id"])
            if line_no % 100 == 0:
                state.update(last_row=line_no, seen=list(seen), errors=len(errors))
                save_state(out_dir, bid, state)
    write_atomic(out_dir / f"{bid}.json", rows)
    write_errors(out_dir / f"{bid}-errors.csv", errors)
    summary = {"batch_id": bid, "total": len(rows) + len(errors),
               "ok": len(rows), "failed": len(errors), "skipped": 0}
    write_atomic(out_dir / f"{bid}-summary.json", summary)
    return summary`,
    output: `# out/2026-11-25-a1b2c3d4e5f6.json
# out/2026-11-25-a1b2c3d4e5f6-errors.csv
# out/2026-11-25-a1b2c3d4e5f6-summary.json
# {"total": 120, "ok": 118, "failed": 2, "skipped": 0}`,
    tip: `batch_id=输入哈希+业务日期；状态原子写；先写 .part 再 replace；错误带行号原值；重跑幂等。`
  }]);

  add("ch10-3", [{
    h: "综合项目：把字典泥球重构成可演化的领域模型",
    p: `项目起点是一段真实的「字典泥球」：[[row = {"name": ..., "event": ..., "seconds": ..., "team": ...}]]，函数之间传来传去，字段名拼错要到运行时才发现，新增一个「年级」字段要改十几个地方。目标是用 dataclass、Enum、Protocol、仓储接口，把这段代码重构成可测试、可演化的领域模型。

第一步识别概念：[[Athlete]]（运动员，id、name、team、grade）、[[Event]]（项目，code、name、unit）、[[Result]]（成绩，athlete、event、seconds、status、date）。不要让一个 [[Result]] 同时承担「运动员信息」和「项目信息」，那是重复和漂移的根源。引用用 id，展示时再 join。

第二步用值对象约束字段。[[seconds]] 用 [[__post_init__]] 检查 0 到 3600；[[grade]] 用 Enum（G7/G8/G9）；[[status]] 用 Enum（FINISHED/DNS/DNF/DSQ）。字符串状态一律替换成枚举，比较用成员，不用魔法值。非法值在创建对象时失败，而不是在统计时变成 NaN。

第三步定义仓储接口。[[AthleteRepo]] 提供 [[get(id)]]、[[list_all()]]；[[ResultRepo]] 提供 [[save(result)]]、[[list_by_event(event)]]。用 [[Protocol]] 描述，具体实现可以是 SQLite、内存、HTTP；领域层只依赖接口。测试传 [[MemoryRepo]]，不需要数据库。

第四步做领域服务。[[RankingService]] 接收 ResultRepo 和 AthleteRepo，计算名次、并列、积分；[[ReportService]] 接收结果和运动员，生成展示行。服务不直接读文件/数据库，所有 I/O 通过仓储注入。这样排名逻辑可以用固定数据做单元测试，不依赖环境。

第五步做兼容读取。历史 JSON 可能用 [["state"]] 而不是 [["status"]]，可能用 [["time"]] 而不是 [["seconds"]]。在 [[from_dict]] 工厂集中处理旧字段，写出只写新字段。未知枚举值抛 [[ModelError]]，不要静默变成默认值。版本号写进 JSON，迁移脚本按版本处理。

第六步做迁移脚本。读旧 JSON 一行、转新模型、写新 JSON；记录成功/失败数、失败行号；迁移前备份，迁移后抽样比对。脚本要能重复执行：已经是新格式就跳过。不要写「一次性脚本」跑完删掉，出问题无法回滚。

第七步写测试。对象测试：非法秒数报错、枚举值正确、frozen 对象可哈希；仓储测试：重复 id 报错、空列表；服务测试：并列名次、缺赛不计分、跨项目积分。测试数据用构造器，不要复制大段 JSON。

验收：字段名拼错在类型检查/构造时暴露；新增字段只改模型和迁移；排名逻辑不依赖数据库；旧数据能读；新数据能写；测试覆盖正常/边界/非法三类。做到这些，字典泥球才算变成模型。`,
    code: String.raw`from dataclasses import dataclass
from enum import Enum
from typing import Protocol

class Status(str, Enum):
    FINISHED = "finished"; DNS = "dns"; DNF = "dnf"; DSQ = "dsq"

class Grade(str, Enum):
    G7 = "G7"; G8 = "G8"; G9 = "G9"

@dataclass(frozen=True)
class Athlete:
    id: str
    name: str
    team: str
    grade: Grade

@dataclass(frozen=True)
class Result:
    athlete_id: str
    event: str
    seconds: float
    status: Status = Status.FINISHED
    def __post_init__(self):
        if self.status is Status.FINISHED and not 0 < self.seconds < 3600:
            raise ValueError(f"seconds out of range: {self.seconds}")

class ResultRepo(Protocol):
    def save(self, result: Result) -> None: ...
    def list_by_event(self, event: str) -> list[Result]: ...

class RankingService:
    def __init__(self, results: ResultRepo, athletes: dict[str, Athlete]):
        self.results = results
        self.athletes = athletes
    def rank(self, event: str):
        rows = [r for r in self.results.list_by_event(event) if r.status is Status.FINISHED]
        rows.sort(key=lambda r: r.seconds)
        out, last, rank = [], None, 0
        for i, r in enumerate(rows, 1):
            if r.seconds != last:
                rank, last = i, r.seconds
            out.append((rank, self.athletes[r.athlete_id].name, r.seconds))
        return out`,
    output: `[(1, '林晓', 12.3), (1, '陈默', 12.3), (3, '王远', 12.5)]`,
    tip: `先识别概念再拆对象；枚举替代魔法值；仓储 Protocol 注入；旧字段集中 from_dict；迁移可重复。`
  }]);

  add("ch11-3", [{
    h: "综合项目：插件化导出框架与配置校验",
    p: `项目目标：同一份成绩数据可以导出 CSV、JSON、Markdown 三种格式，未来加 Excel/PDF 不改核心代码。用 ABC 定义导出接口，用 [[__init_subclass__]] 自动注册，用描述符校验插件配置，用注册表按名字分发。这个项目把第 11 章的抽象、继承、描述符、容器协议全部用上。

接口设计：[[Exporter]] 是抽象基类，抽象成员只有 [[name]]、[[suffix]]、[[export(rows, path)]]；可选能力 [[description]]、[[supports_stream]] 给默认实现。不要把所有格式细节塞进基类，基类只规定「怎么被调用」，不规定「怎么实现」。

注册机制：[[Exporter.registry]] 是类级字典；[[__init_subclass__]] 在子类创建时检查 [[name]] 是否存在、是否重复，然后登记。重复名字直接抛 ValueError，不要后注册覆盖前一个。注册发生在 import 时，因此插件模块必须被显式导入；入口处集中导入内置插件，第三方插件用 entry_points 发现。

配置校验：每个插件可以用描述符声明 [[priority]]、[[encoding]]，在 [[__set__]] 里检查类型和范围。描述符状态按类/实例存储，不要放在描述符对象上。配置错误在插件加载时暴露，而不是导出到一半才报。

分发逻辑：[[export_rows(rows, fmt, path)]] 从注册表取插件，检查 [[fmt]] 是否存在，调用 [[export]]，返回实际路径。未知格式抛 [[UnknownFormat]] 并列出可用格式；插件抛异常时带上插件名和路径，不要吞掉。导出到临时文件再原子替换，避免半截文件。

流式与内存：CSV/JSON 可以流式写，PDF/Excel 可能需要全量。接口里 [[export]] 接收 rows 列表，简单但吃内存；需要流式时另加 [[iter_export(rows_iter, path)]] 可选方法，核心只在 [[supports_stream]] 为真时使用。不要为了统一把大数据全读进内存。

测试策略：为每个插件写「最小数据导出后能被对应库读回」的测试；为注册表写「重复名字报错」「未知格式报错」；为配置写「非法 priority 报错」；为失败写「插件抛异常时文件不残留」。测试用临时目录，不写用户目录。

验收：新增一个插件只加一个文件 + 导入；核心代码不改；重复名字启动失败；未知格式报错列出选项；导出失败无半截文件；每个插件都能被目标程序打开。`,
    code: String.raw`from abc import ABC, abstractmethod
from pathlib import Path
import csv, json, os, tempfile

class Exporter(ABC):
    registry = {}
    name: str
    suffix: str = ".dat"
    description: str = ""
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if getattr(cls, "name", None):
            if cls.name in cls.registry:
                raise ValueError(f"duplicate exporter: {cls.name}")
            cls.registry[cls.name] = cls
    @abstractmethod
    def export(self, rows: list[dict], path: Path) -> None: ...

class CsvExporter(Exporter):
    name = "csv"; suffix = ".csv"
    def export(self, rows, path):
        with open(path, "w", newline="", encoding="utf-8-sig") as fh:
            writer = csv.DictWriter(fh, fieldnames=list(rows[0]))
            writer.writeheader(); writer.writerows(rows)

class JsonExporter(Exporter):
    name = "json"; suffix = ".json"
    def export(self, rows, path):
        path.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")

def export_rows(rows, fmt: str, dest: Path) -> Path:
    cls = Exporter.registry.get(fmt)
    if not cls:
        raise ValueError(f"unknown format: {fmt}; available: {sorted(Exporter.registry)}")
    dest = dest.with_suffix(cls.suffix)
    fd, tmp_name = tempfile.mkstemp(dir=dest.parent, prefix=".export-")
    os.close(fd)
    try:
        cls().export(rows, Path(tmp_name))
        os.replace(tmp_name, dest)
    finally:
        if os.path.exists(tmp_name):
            os.unlink(tmp_name)
    return dest`,
    output: `# Exporter.registry: ['csv', 'json']
# export_rows(rows, 'json', Path('out')) -> out.json
# 未知格式：ValueError: unknown format: xml; available: ['csv', 'json']`,
    tip: `抽象接口只规定调用；__init_subclass__ 注册并拒绝重名；配置描述符校验；导出走临时文件。`
  }]);
})();

/* --- expand-project-b.js --- */

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

  add("ch12-3", [{
    h: "综合项目：类型化 CLI 与三层测试矩阵",
    p: `项目目标：给一个已有成绩工具加上完整类型和测试，让它从「本机能跑」变成「CI 能守」。范围包括公开 API 注解、mypy strict、pytest 单元/集成/属性测试、覆盖率与变异测试。不是重写业务，而是给现有代码加护栏。

第一步清点公开 API。列出 [[__init__.py]] 导出的名字、CLI 命令、JSON 输出字段。每个公开函数都要有参数和返回值注解；[[Any]] 只允许出现在真正动态的边界（如 JSON 原始数据），并集中在一个 [[_json.py]] 适配层，领域层不允许 Any。

第二步定义类型。[[Row]] 用 TypedDict 描述 CSV 行；[[Result]] 用 frozen dataclass；[[Repo]] 用 Protocol；[[load(path: str | Path) -> list[Result]]] 用联合类型。需要重载时用 [[@overload]]，但不要为两三种参数组合写十几个重载，宁愿拆函数。

第三步开 mypy。先 [[disallow_untyped_defs]]，再 [[strict]]。每次只修一类错误：缺注解、Optional、泛型参数、重载实现、未使用 ignore。[[# type: ignore]] 必须带原因和 issue 编号；CI 统计 ignore 数量，只降不升。

第四步单元测试。每个纯函数覆盖正常、边界、非法输入；用 [[pytest.mark.parametrize]] 把边界列成表；用 [[pytest.approx]] 比较浮点；用 [[tmp_path]] 隔离文件。不要 mock 纯函数，直接给输入。

第五步集成测试。用 [[subprocess]] 跑真实 CLI，覆盖 [[--help]]、正常导入、缺列、空文件、[[--json]]。断言退出码、stdout 可解析、输出文件存在且内容正确。测试数据放 fixtures，每个场景一个目录。

第六步属性测试。对「解析-格式化」往返、"排序后长度不变"、"排名并列不跳错"写 Hypothesis 不变量。属性测试负责发现随机边界，单元测试负责固定回归；两者不能互相替代。

第七步覆盖率与变异。先看分支覆盖，核心模块要求 85% 以上；再对排名、解析、金额计算跑变异测试。存活变异说明断言不够，补行为测试，不要补「调用次数」这种实现镜像。

第八步 CI。矩阵覆盖 3.11/3.12/3.13 和 ubuntu/macos；步骤：安装、ruff、mypy、pytest、build、wheel smoke。任何一步失败都阻止合并。把 CI 命令写进 README，本地能复现。

验收：mypy 0 错误；ignore 数量有上限；测试覆盖正常/边界/非法；CLI 退出码正确；属性测试跑过 100 组；变异测试核心模块无存活；CI 全绿；README 命令可复制。`,
    code: String.raw`from typing import TypedDict, Protocol
from pathlib import Path
import pytest

class Row(TypedDict):
    athlete: str
    seconds: float

class Repo(Protocol):
    def save(self, row: Row) -> None: ...

def load(path: str | Path) -> list[Row]:
    raise NotImplementedError

@pytest.mark.parametrize("text,expected", [
    ("12.34", 12.34),
    ("0:12.34", 12.34),
    ("1:02.35", 62.35),
])
def test_parse(text: str, expected: float) -> None:
    assert parse_time(text) == pytest.approx(expected)

def test_rejects_negative() -> None:
    with pytest.raises(ValueError):
        parse_time("-1.0")`,
    output: `# mypy src -> Success: no issues found
# pytest -q -> 12 passed
# coverage report -m -> core 88%
# mutmut run -> 0 surviving in core`,
    tip: `Any 只在适配层；strict 分步开；单元/集成/属性三层；变异测试验断言；CI 矩阵守版本。`
  }]);

  add("ch13-3", [{
    h: "综合项目：把 scores-kit 发布到 TestPyPI 再上正式版",
    p: `项目目标：把第 8 章的包真正发布一次。范围包括版本号、构建、README 元数据、TestPyPI 安装验证、正式 PyPI 发布、CI 自动发布、发布后回滚预案。重点不是「传上去」，而是「用户能装、能升级、出问题能退」。

第一步定版本。[[pyproject.toml]] 写 [[version = "0.1.0"]]，代码里用 [[importlib.metadata.version("scores-kit")]]，不要手写两份。git tag 用 [[v0.1.0]]，和版本号一致；项目不是 git 仓库时，至少保留构建记录和 wheel 哈希。

第二步补元数据。[[description]]、[[readme = "README.md"]]、[[license]]、[[authors]]、[[classifiers]]、[[project.urls]] 都要填。README 开头写清楚包做什么、安装命令、最小示例；[[twine check]] 会检查 README 渲染，格式错误会失败。

第三步构建。[[python -m build]] 生成 sdist 和 wheel；解压 wheel 确认 [[scores/data/report.md]]、[[scores/py.typed]] 都在；在干净 venv 安装 wheel，跑 [[scores --help]] 和读取模板。不要在开发环境直接 [[pip install -e .]] 验证发布包。

第四步 TestPyPI。[[twine upload --repository testpypi dist/*]]；在全新 venv 用 [[--index-url https://test.pypi.org/simple/ --extra-index-url https://pypi.org/simple]] 安装。TestPyPI 依赖不全，必须加正式索引；安装后跑最小功能，确认包名、版本、入口都对。

第五步正式发布。确认 TestPyPI 通过后，[[twine upload dist/*]]。发布后立刻在另一个干净 venv 从正式 PyPI 安装，跑 [[scores --version]] 和 [[scores rank]]。不要只看上传成功；镜像同步、缓存、依赖解析都可能让用户装不上。

第六步自动发布。GitHub Actions 配 [[id-token: write]]，用 [[pypa/gh-action-pypi-publish]] 信任发布；只在 tag 推送时触发。构建和发布分离：build job 产出 artifact，publish job 下载 artifact 再上传，避免重复构建出不同哈希。

第七步回滚预案。PyPI 不能覆盖版本；出问题发 [[0.1.1]] 修复，或在 PyPI 页面 yank [[0.1.0]]。yank 后精确版本仍可安装，但新解析会跳过；变更日志写清原因和替代版本。保留 wheel、构建日志、依赖锁，方便复现。

第八步发布后监控。安装量、错误报告、GitHub issue 都是信号；第一时间复现用户的最小案例。不要等「大量用户反馈」才行动，一个可复现的安装失败就值得发补丁。

验收：twine check 通过；TestPyPI 安装成功；正式 PyPI 安装成功；版本/tag/wheel 哈希一致；CI 自动发布只在 tag 触发；yank/补丁流程写进 README；发布后 smoke 通过。`,
    code: String.raw`# 构建与检查
python -m build
twine check dist/*
unzip -l dist/scores_kit-0.1.0-py3-none-any.whl

# TestPyPI
twine upload --repository testpypi dist/*
python -m venv /tmp/tp
/tmp/tp/bin/pip install --index-url https://test.pypi.org/simple/ \
  --extra-index-url https://pypi.org/simple scores-kit==0.1.0

# 正式
twine upload dist/*
python -m venv /tmp/prod
/tmp/prod/bin/pip install scores-kit==0.1.0
/tmp/prod/bin/scores --version

# GitHub Actions 信任发布
# permissions: { id-token: write }
# on: { push: { tags: ["v*"] } }
# uses: pypa/gh-action-pypi-publish@release/v1`,
    output: `# twine check: PASSED
# TestPyPI: scores-kit 0.1.0 installed
# PyPI: scores-kit 0.1.0 installed
# scores --version -> scores-kit 0.1.0`,
    tip: `版本一处定义；元数据齐全；先 TestPyPI 再正式；tag 触发信任发布；发布后 smoke；yank/补丁预案。`
  }]);

  add("ch14-3", [{
    h: "综合项目：可恢复、守规则的赛事数据采集器",
    p: `项目目标：从一个公开赛事页面抓取成绩，支持分页/游标、限速、断点续跑、HTML 解析、数据校验、错误隔离。要求不绕过登录/验证码，不违反 robots，不因一次页面改版丢掉全部数据。这个项目把第 14 章的请求、分页、解析、浏览器自动化串起来。

第一步确认数据来源。打开浏览器开发者工具，看 Network：如果数据来自 XHR/fetch，直接请求接口；如果页面是服务端渲染，解析 HTML；只有必须执行 JS 才用 Playwright。优先简单方案，浏览器自动化是最后手段。

第二步定抓取合同。每条记录至少 [[source, event, date, athlete, team, seconds, rank]]；主键用 [[source + event + date + athlete]]。字段缺失进错误列表，不要用空字符串糊弄。抓取前先抓 1 页，人工核对字段，再全量跑。

第三步做分页/游标。接口用 cursor 就跟随 [[next_cursor]]；用页码就记录 [[page]] 和 [[page_size]]。状态文件存最后成功游标、已处理主键、错误计数；每页处理完原子写状态。不要把所有 id 塞进内存，超过 10 万用 SQLite 唯一索引。

第四步做限速与重试。每页之间 sleep 0.3-1 秒；429 读 [[Retry-After]]；5xx 重试 3 次，4xx 不重试；超时设 [[(3.05, 15)]]。请求带合理 UA 和联系邮箱，不要伪装成浏览器高频刷。

第五步做解析。选择器集中放在 [[selectors.py]]，优先 data 属性/语义标签；解析后做 NFKC、去空白、时间格式统一。表格先打印 shape 和表头，确认选对表；合并单元格用行列坐标兜底。

第六步做校验。抓完统计：总条数、空值率、重复率、时间范围、排名连续性。异常值不直接删，标记 [[needs_review]] 并输出到单独文件。每次抓取生成 [[summary.json]]，和原始数据一起归档。

第七步做测试。保存 3 份 HTML fixture：正常页、缺字段页、改版页；测试解析器的正常/缺字段/异常输入。请求层用 mock，不要测试里打真实网络。分页逻辑用假 [[fetch_page]] 测断点/结束条件。

第八步做合规。检查 robots.txt 的 [[can_fetch]]，遵守服务条款；不抓登录后私人数据；不绕过验证码；不高频请求。遇到 403/验证码，停止并记录，不要换 IP 硬闯。

验收：单页解析正确；分页不漏不重；中途 kill 能续；429 能等；改版页有清楚错误；数据校验有报告；robots 禁止时停止；测试不打真实网络。`,
    code: String.raw`from pathlib import Path
import json, time, requests
from bs4 import BeautifulSoup

STATE = Path("crawl-state.json")
BASE = "https://example.com/events"

def load_state():
    return json.loads(STATE.read_text()) if STATE.exists() else {"page": 1, "seen": []}

def save_state(state):
    tmp = STATE.with_suffix(".tmp")
    tmp.write_text(json.dumps(state, ensure_ascii=False))
    tmp.replace(STATE)

def parse_page(html: str, event: str, date: str) -> list[dict]:
    soup = BeautifulSoup(html, "lxml")
    rows = []
    for tr in soup.select("table.results tbody tr"):
        cells = [td.get_text(" ", strip=True) for td in tr.select("td")]
        if len(cells) < 5:
            continue
        rows.append({"source": BASE, "event": event, "date": date,
                     "athlete": cells[0], "team": cells[1],
                     "seconds": parse_time(cells[2]), "rank": int(cells[3])})
    return rows

def crawl(event: str, date: str):
    state = load_state()
    seen = set(state["seen"])
    session = requests.Session()
    session.headers["User-Agent"] = "scores-research/0.1 (contact: you@example.com)"
    while True:
        r = session.get(f"{BASE}/{event}", params={"date": date, "page": state["page"]},
                        timeout=(3.05, 15))
        if r.status_code == 429:
            time.sleep(int(r.headers.get("Retry-After", "5")))
            continue
        r.raise_for_status()
        for row in parse_page(r.text, event, date):
            key = f"{row['event']}|{row['date']}|{row['athlete']}"
            if key not in seen:
                save_row(row)
                seen.add(key)
        state.update(page=state["page"] + 1, seen=list(seen))
        save_state(state)
        if "next" not in r.text:
            break
        time.sleep(0.8)`,
    output: `# crawl-state.json: {"page": 4, "seen": [...]}
# summary.json: {"total": 320, "ok": 318, "needs_review": 2}
# 429: 按 Retry-After 等待后继续`,
    tip: `先确认数据来源；主键稳定；状态原子写；429 等待；选择器集中；fixture 测试；遵守 robots。`
  }]);

  add("ch15-3", [{
    h: "综合项目：从原始 CSV 到可追溯的 HTML 分析报告",
    p: `项目目标：输入一份成绩 CSV，输出一份带统计、图表、明细和元数据的 HTML 报告；同一份输入重复生成结果一致；数据有问题时报告要标注，而不是假装正常。范围覆盖 pandas 清洗、merge 校验、时间序列、matplotlib、Jinja2。

第一步读数据。用 [[pd.read_csv(encoding="utf-8-sig")]]，检查 shape、列名、dtype、空值率。日期用 [[pd.to_datetime]]，秒数用 [[pd.to_numeric]]，非法值转 NaN 并计数。不要一上来 [[fillna(0)]]，先弄清缺失含义。

第二步清洗与验证。姓名 trim/NFKC；项目映射到标准 code；重复按业务键处理；缺列 fail-fast。每一步调用 [[audit(df, step)]] 打印行数、空值、唯一键。清洗规则写成函数，独立测试。

第三步统计。按项目分组算人数、最好成绩、平均、中位数；按队伍算总分；按日期算趋势。并列名次用第 18 章的逻辑，不要简单 [[rank(method="min")]] 后不再检查。所有统计结果保留原始明细，报告里能下钻。

第四步图表。只画 2-3 张关键图：项目成绩分布、队伍总分、日期趋势。柱状图 y 从 0 开始；折线图标注样本量；颜色可区分且不只靠颜色。图片用 [[fig.savefig]] 导出，固定 [[dpi=160]]，[[bbox_inches="tight"]]。

第五步模板。Jinja2 模板分三块：摘要（总人数、项目数、异常数）、图表、明细表。表格数字右对齐，表头带单位；页面顶部写数据区间、生成时间、数据哈希；页脚写来源和生成命令。

第六步缓存与幂等。缓存键 = 输入哈希 + 模板版本 + 参数；命中且未 [[--force]] 就复用。生成先写临时目录，成功后原子替换；失败保留中间 CSV/图，方便排查。重复生成同一输入，报告哈希应一致（除生成时间外）。

第七步测试。用最小 fixture 测：正常数据、缺列、空值、重复、极端值；断言统计数字、图表文件存在、报告含关键文本、页脚含哈希。不要只断言「文件存在」。

第八步交付。输出目录含 [[report.html]]、[[assets/]]、[[summary.json]]、[[clean.csv]]；打包 zip 命名带日期和哈希；大文件不放邮件附件，给下载链接。README 写清运行命令和依赖。

验收：报告能在浏览器打开；统计与明细一致；图表不误导；缺失/异常有标注；重复生成稳定；测试覆盖正常/边界/错误；交付包可追溯。`,
    code: String.raw`from pathlib import Path
import pandas as pd, matplotlib.pyplot as plt
from jinja2 import Environment, FileSystemLoader

def build(df: pd.DataFrame, out: Path) -> dict:
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["seconds"] = pd.to_numeric(df["seconds"], errors="coerce")
    invalid = int(df["seconds"].isna().sum())
    clean = df.dropna(subset=["date", "athlete", "seconds"]).copy()

    summary = {
        "rows": len(df), "clean": len(clean), "invalid": invalid,
        "events": int(clean["event"].nunique()),
        "athletes": int(clean["athlete"].nunique()),
        "best": float(clean["seconds"].min()),
    }

    fig, ax = plt.subplots(figsize=(8, 4.5))
    clean.boxplot(column="seconds", by="event", ax=ax)
    ax.set_ylabel("成绩（秒）")
    fig.tight_layout()
    fig.savefig(out / "assets" / "events.png", dpi=160)
    plt.close(fig)

    env = Environment(loader=FileSystemLoader("templates"), autoescape=True)
    html = env.get_template("report.html").render(
        summary=summary, rows=clean.to_dict("records"), image="assets/events.png")
    (out / "report.html").write_text(html, encoding="utf-8")
    return summary`,
    output: `# out/report.html
# out/assets/events.png
# out/summary.json
# {"rows": 120, "clean": 118, "invalid": 2, "events": 4, "athletes": 36, "best": 11.8}`,
    tip: `先审计再清洗；统计保留明细；图表 2-3 张且诚实；模板带元数据；缓存键含哈希；fixture 测试。`
  }]);
})();

/* --- expand-project-c.js --- */

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

  add("ch16-3", [{
    h: "综合项目：批量生成成绩单并对账",
    p: `项目目标：从一个成绩 CSV 和一组模板，为每位学生生成 Excel 成绩单、Word 评语和 PDF 汇总；要求命名唯一、失败隔离、可重跑、能对账。这个项目把第 16 章的文件、模板、批量、定时串成一条真实办公流水线。

第一步准备数据。CSV 至少含 [[student_id, name, class, event, seconds, rank, comment]]；按 [[student_id]] 分组，每人一份。先校验 id 唯一、必填字段非空、成绩在范围内；缺字段进错误报告，不生成空白文档。

第二步准备模板。Excel 用命名区域或固定单元格；Word 用 [[{{name}}]]、[[{{comment}}]] 占位符；PDF 汇总用 HTML 模板 + WeasyPrint。模板里不要写业务计算，计算在数据层完成；占位符列一张清单，生成前检查是否都有值。

第三步定输出结构。正式目录 [[out/2026-11-25/]] 放成功文件，[[out/2026-11-25/failed/]] 放失败文件，[[manifest.csv]] 记录 [[student_id, type, path, status, error, sha256]]。文件名用 [[学号-姓名-成绩单.xlsx]]，去掉路径非法字符，长度限制 120 字符。

第四步批量生成。用 [[ThreadPoolExecutor]] 限制 4-8 个并发（文档生成吃内存）；每个任务独立临时目录，成功后才移动到正式目录；失败捕获异常写 manifest，不中断其他任务。不要把所有文件先读进内存再写。

第五步校验。每个生成文件重新打开：xlsx 用 openpyxl 读关键单元格；docx 用 python-docx 读段落数；PDF 用 pypdf 读页数。校验失败按失败处理，不要留在正式目录。抽样人工打开，确认中文字体和排版。

第六步对账。生成结束后，用输入学生集合与 manifest 成功集合外连接，列出「未生成」「重复生成」「多余文件」。数量必须一致；不一致时先停止交付，修逻辑再重跑。对账报告和 manifest 一起归档。

第七步重跑。[[--retry-failed]] 只读 manifest 中 failed 的行，重新生成；成功项不重复。输入数据变了，manifest 哈希变，走新批次。重跑前清理 failed 目录，避免旧失败文件混淆。

第八步定时与通知。每天 07:30 用 cron/systemd 触发；文件锁防重叠；完成后发一封摘要邮件（成功/失败/耗时/附件链接），不要给每个人发。失败时告警带 manifest 路径和前三条错误。

验收：每人一份且命名唯一；模板样式保留；中文正常；失败文件隔离；manifest 可追溯；对账数量一致；重跑只处理失败；定时任务不重叠；通知含摘要。`,
    code: String.raw`from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import csv, hashlib, os, shutil, tempfile

def make_one(row: dict, template: Path, out_dir: Path) -> dict:
    safe = "".join(c for c in row["name"] if c not in '\\/:*?"<>|')
    target = out_dir / f"{row['student_id']}-{safe}-成绩单.xlsx"
    tmp_dir = Path(tempfile.mkdtemp(dir=out_dir, prefix=".work-"))
    try:
        tmp = tmp_dir / target.name
        fill_excel(template, tmp, row)
        check_excel(tmp)
        shutil.move(str(tmp), target)
        return {"student_id": row["student_id"], "path": str(target),
                "status": "ok", "sha256": sha256(target)}
    except Exception as exc:
        return {"student_id": row["student_id"], "path": "",
                "status": "failed", "error": f"{type(exc).__name__}: {exc}"}
    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)

def build_all(rows, template, out_dir):
    out_dir.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=6) as pool:
        results = list(pool.map(lambda r: make_one(r, template, out_dir), rows))
    write_manifest(out_dir / "manifest.csv", results)
    return results`,
    output: `# out/2026-11-25/2026001-林晓-成绩单.xlsx
# out/2026-11-25/manifest.csv
# status,student_id,path,error,sha256
# ok,2026001,...,...,a1b2...
# failed,2026002,,ValueError: missing comment,`,
    tip: `按学生分组；占位符清单；输出目录隔离；并发限流；生成后重开校验；manifest 对账；只重跑失败。`
  }]);

  add("ch17-3", [{
    h: "综合项目：带背压与断点续传的并发下载器",
    p: `项目目标：从一个 URL 列表并发下载文件，限制并发数、支持重试、断点续传、校验哈希、优雅退出，并输出进度和失败清单。要求不能因为一个坏 URL 拖垮全部，也不能无限开协程把内存吃满。这个项目把第 17 章的队列、信号量、TaskGroup、取消串起来。

第一步定输入。URL 列表放 CSV/JSON，每项含 [[url, dest, sha256, size]]；dest 是相对路径，禁止 [[..]] 和绝对路径，防止目录穿越。下载前创建目标目录，检查磁盘空间；已存在且哈希匹配的文件直接跳过。

第二步限流。用 [[asyncio.Semaphore(8)]] 控制同时下载数；用 [[asyncio.Queue(maxsize=32)]] 做任务队列，生产者读 URL 列表，消费者下载。队列有界形成背压，避免一次创建十万个 Task。

第三步下载。[[aiohttp]] 或 [[httpx]] 的流式接口，[[timeout=aiohttp.ClientTimeout(total=300, connect=10)]]；分块写 [[.part]] 文件，支持 Range 续传。服务端返回 206 才续传，200 要 truncate 重写；用 ETag/Last-Modified 做 If-Range。

第四步重试。只重试超时、连接错误、429、5xx；429 读 Retry-After；指数退避 + 抖动；每个文件最多 3 次。404/403 不重试，直接进失败清单。重试时保留 .part，续传而不是从头。

第五步校验。下载完成计算 SHA256，与输入比对；不匹配删除 .part 并记失败。大小也可以校验；MIME 只作参考，不替代哈希。校验通过后 [[os.replace]] 成正式文件。

第六步优雅退出。捕获 SIGINT/SIGTERM，设置 [[stop_event]]，停止生产者，取消消费者；已下载的 .part 保留，状态写 [[state.json]]；退出码 130。再次启动从 state 和 .part 继续。

第七步进度。每完成 N 个文件打印「完成/总数/失败/字节/速率」；进度写 stderr；最终输出 JSON 摘要到 stdout。不要每个 chunk 打印，I/O 会成为瓶颈。

第八步测试。用本地 HTTP 服务器提供：正常文件、404、429 一次后成功、内容变化、慢响应；测试并发上限、重试、续传、哈希失败、取消。不要测试打外网。

验收：并发不超过 8；队列有界；坏 URL 不影响其他；429 会等；断点续传生效；哈希失败被拒；Ctrl-C 能退出并保留状态；摘要数字与文件一致。`,
    code: String.raw`import asyncio, hashlib, os, signal
from pathlib import Path
import aiohttp

stop = asyncio.Event()
sem = asyncio.Semaphore(8)

async def download(session, item, q):
    async with sem:
        dest = Path(item["dest"])
        part = dest.with_suffix(dest.suffix + ".part")
        dest.parent.mkdir(parents=True, exist_ok=True)
        for attempt in range(3):
            try:
                headers = {}
                if part.exists():
                    headers["Range"] = f"bytes={part.stat().st_size}-"
                async with session.get(item["url"], headers=headers,
                                       timeout=aiohttp.ClientTimeout(total=300, connect=10)) as r:
                    if r.status == 429:
                        await asyncio.sleep(int(r.headers.get("Retry-After", "5")))
                        continue
                    if r.status == 404:
                        raise RuntimeError("not found")
                    r.raise_for_status()
                    mode = "ab" if r.status == 206 else "wb"
                    with open(part, mode) as fh:
                        async for chunk in r.content.iter_chunked(65536):
                            fh.write(chunk)
                if sha256(part) != item["sha256"]:
                    part.unlink(missing_ok=True)
                    raise RuntimeError("checksum mismatch")
                os.replace(part, dest)
                return {"url": item["url"], "status": "ok"}
            except (aiohttp.ClientError, asyncio.TimeoutError) as exc:
                if attempt == 2:
                    return {"url": item["url"], "status": "failed", "error": str(exc)}
                await asyncio.sleep(0.5 * (2 ** attempt))
        return {"url": item["url"], "status": "failed"}

async def main(items):
    q = asyncio.Queue(maxsize=32)
    async with aiohttp.ClientSession() as session:
        async with asyncio.TaskGroup() as tg:
            for item in items:
                await q.put(item)
            for _ in range(8):
                tg.create_task(worker(session, q))

async def worker(session, q):
    while not stop.is_set():
        item = await q.get()
        try:
            if item is None:
                break
            result = await download(session, item, q)
            print(result, flush=True)
        finally:
            q.task_done()`,
    output: `# 8 个并发，队列上限 32；
# .part 断点续传，SHA256 校验通过后 replace；
# Ctrl-C 退出码 130，state.json 保留进度。`,
    tip: `信号量+有界队列双限流；只重试可恢复错误；Range 续传；哈希校验；取消保留 .part；本地服务器测试。`
  }]);

  add("ch18-6", [{
    h: "毕业项目：从脏 CSV 到可交付成绩系统",
    p: `这是全书的收尾项目：把一份脏 CSV 变成可查询、可排名、可导出、可交付的成绩系统。要求覆盖清洗、模型、存储、排名、报表、CLI、测试、打包、部署和回滚。不是再写一个 demo，而是按真实交付标准做一遍。

第一步范围。输入：[[students.csv]]、[[results.csv]]、[[events.csv]]；输出：[[clean.json]]、[[ranking.csv]]、[[report.html]]、[[manifest.json]]。CLI 四个命令：[[import]]、[[rank]]、[[report]]、[[verify]]。先写这四条命令的验收表，再写代码。

第二步清洗。学生表校验 id 唯一、姓名非空、年级枚举；成绩表校验项目存在、秒数范围、状态枚举；项目表校验 code 唯一、单位。错误分行号/列名/原值；缺列 fail-fast；重复按业务键处理并报告。清洗结果写 [[clean.json]]，带输入哈希和规则版本。

第三步模型与存储。用 dataclass + Enum 定义 Student/Event/Result；用 SQLite 存三张表，唯一索引防重复；Repository 封装 SQL，领域层不写 SQL。导入用事务：整批成功才提交，失败回滚；批次 id 写进每行。

第四步排名。按项目分组，过滤 DNS/DNF/DSQ；排序、并列同名次、下一名跳号；积分规则配置化；输出 [[ranking.csv]] 含名次、姓名、队伍、成绩、积分。排名逻辑纯函数，单测覆盖并列/缺赛/空组。

第五步报表。从 clean/ranking 生成 HTML：摘要、项目分布图、排名表、异常清单；模板带数据版本、生成时间、输入哈希；打印样式表头重复、行不截断；图表 y 从 0 开始。报告写到临时目录，成功后原子替换。

第六步 CLI 与退出码。[[main(argv) -> int]]；0 成功、1 数据错误、2 用法错误、130 Ctrl-C；stdout 只输出结果/JSON，日志走 stderr；[[--debug]] 显示堆栈。[[verify]] 检查文件存在、哈希、行数、排名连续、报告可打开。

第七步测试。单元：清洗/排名/积分；集成：四条命令用 subprocess 跑 fixture；属性：排名不变量、解析往返；golden：报告关键片段；wheel smoke：安装后跑 [[--help]] 和最小导入。测试数据覆盖正常/缺列/重复/非法枚举/空文件。

第八步交付。src 布局、pyproject、README、变更日志、LICENSE；[[python -m build]]；TestPyPI/本地 wheel 安装；systemd timer 或 cron 每天跑；manifest 记录批次、文件哈希、耗时；失败告警带批次和日志。回滚：保留上一版 wheel 和数据库备份，出问题切回上一版并重跑失败批次。

验收：四条命令全可用；重复导入不重复；排名正确；报表可读可打印；verify 全过；测试全绿；wheel 干净安装；定时任务不重叠；失败可回滚；README 让新人能跑。这个项目做完，才算真正把 Python 从语法用到了交付。`,
    code: String.raw`from pathlib import Path
import argparse, json, sqlite3, sys

def cmd_import(args) -> int:
    try:
        batch = import_all(Path(args.students), Path(args.results), Path(args.events))
        print(json.dumps({"batch": batch, "status": "ok"}, ensure_ascii=False))
        return 0
    except SchemaError as exc:
        print(f"schema error: {exc}", file=sys.stderr)
        return 1
    except Exception as exc:
        print(f"import failed: {exc}", file=sys.stderr)
        return 1

def cmd_verify(args) -> int:
    checks = verify_outputs(Path(args.dir))
    failed = [c for c in checks if not c["ok"]]
    print(json.dumps(checks, ensure_ascii=False, indent=2))
    return 1 if failed else 0

def main(argv=None) -> int:
    p = argparse.ArgumentParser(prog="scores")
    sub = p.add_subparsers(dest="cmd", required=True)
    imp = sub.add_parser("import")
    imp.add_argument("--students", required=True)
    imp.add_argument("--results", required=True)
    imp.add_argument("--events", required=True)
    imp.set_defaults(func=cmd_import)
    ver = sub.add_parser("verify")
    ver.add_argument("--dir", default="out")
    ver.set_defaults(func=cmd_verify)
    args = p.parse_args(argv)
    return args.func(args)

if __name__ == "__main__":
    raise SystemExit(main())`,
    output: `$ scores import --students students.csv --results results.csv --events events.csv
{"batch": "2026-11-25-a1b2c3", "status": "ok"}
$ scores verify --dir out
[{"check": "ranking_rows", "ok": true}, {"check": "report_open", "ok": true}]
# 退出码 0；数据错误 1；用法错误 2；Ctrl-C 130`,
    tip: `先写验收表；清洗/模型/存储/排名/报表/CLI/测试/打包/部署/回滚十步；每步有可执行验收。`
  }]);
})();

/* --- expand-review.js --- */

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

  add("ch11-3", [{
    h: "章节复盘：继承与对象模型的故障检查表",
    p: `第 11 章的概念多，真正写项目时错误往往集中在几个固定位置。下面用六个真实故障做检查表：抽象方法漏实现、多继承 MRO 冲突、描述符状态共享、缓存不失效、eq/hash 不一致、运算符修改原对象。每个故障都给出现象、根因、修复和回归测试，遇到类似问题时按表排查。

故障一：子类实例化时报 [[TypeError: Can't instantiate abstract class]]。根因通常是子类只实现了部分抽象方法，或者抽象方法名拼错。检查 [[Cls.__abstractmethods__]]，看还缺哪个；修复是实现或删掉不必要的抽象。回归测试要实例化每个子类，不能只测一个。

故障二：多继承报 [[Cannot create a consistent method resolution order]]。根因是 C3 找不到满足约束的顺序，常见于两个父类互相继承或声明顺序矛盾。检查 [[Cls.__mro__]] 和继承图；修复是减少层级、改用组合，或调整基类顺序。回归测试要打印 MRO 并确认关键初始化都被调用。

故障三：改一个实例的描述符值，另一个实例也变了。根因是描述符对象把状态存在自己身上，而描述符是类级共享的。检查 [[__set__]] 是否写 [[instance.__dict__]]；修复是按实例存，或用 [[WeakKeyDictionary]]。回归测试创建两个实例，改一个，断言另一个不变。

故障四：修改字段后，[[cached_property]] 还是旧值。根因是缓存不会自动失效。检查所有依赖字段的写入口；修复是集中清理缓存，或在 [[__setattr__]] 里失效。回归测试覆盖每个依赖字段的修改。

故障五：两个相等对象放进 set 变成两个。根因是自定义 [[__eq__]] 后没有 [[__hash__]]，或者 hash 用了可变字段。检查 eq/hash 是否一致；修复是按不可变 id 做 hash，或改用 frozen dataclass。回归测试用 set/dict 验证。

故障六：[[a + b]] 之后原对象 a 被改了。根因是 [[__add__]] 原地修改并返回 self。检查运算符实现；修复是返回新对象，[[__iadd__]] 才原地改。回归测试比较运算前后的原对象。

除了这六个，还有两个高频问题：[[super()]] 在协作式多继承里被跳过，导致父类初始化没执行；[[__getitem__]] 收到 slice 却当整数处理，切片报错。前者检查每个类的 [[__init__]] 是否调用 super，后者检查 [[isinstance(key, slice)]]。

把检查表放进项目的 [[docs/object-model.md]]，每次新增基类/描述符/运算符时过一遍。不要等到线上出现「对象行为诡异」再回头查；这些问题在单元测试里都能提前暴露。测试要针对行为，不要只断言「方法存在」。

验收：六个故障各有一个最小复现和一个回归测试；MRO 图可打印；描述符状态按实例隔离；缓存失效覆盖所有写入口；eq/hash 在 set/dict 中正确；运算符不修改原对象。`,
    code: String.raw`class BadDescriptor:
    def __init__(self): self.value = 0
    def __get__(self, obj, owner=None): return self.value
    def __set__(self, obj, value): self.value = value

class GoodDescriptor:
    def __set_name__(self, owner, name): self.name = "_" + name
    def __get__(self, obj, owner=None):
        return getattr(obj, self.name) if obj else self
    def __set__(self, obj, value): setattr(obj, self.name, value)

class A:
    bad = BadDescriptor()
    good = GoodDescriptor()
    def __init__(self, v): self.good = v

a1, a2 = A(1), A(2)
a1.bad = 9
print(a1.bad, a2.bad)      # 9 9，共享状态
print(a1.good, a2.good)    # 1 2，按实例隔离`,
    output: `9 9
1 2`,
    tip: `六个故障各有最小复现；描述符状态按实例；缓存失效覆盖写入口；eq/hash 用 set 验证；运算符不改原对象。`
  }]);

  add("ch12-3", [{
    h: "章节复盘：类型与测试从红到绿的十个错误",
    p: `给老项目加类型和测试，第一周通常会被一堆错误淹没。下面列出十个高频错误、根因和修法，按这个顺序处理，能避免「改一处崩三处」。原则是：先让 CI 能跑，再逐步收紧；不要一次开满所有严格选项。

错误一：[[Missing return type annotation]]。根因是函数没写返回值；修法是补 [[-> None]] 或具体类型。[[__init__]] 必须写 [[-> None]]，否则 strict 不过。批量修之前先确认函数真的没有返回值，不要一律写 Any。

错误二：[[Implicit Optional]]。参数默认 [[None]] 但注解是 [[str]]；修法是 [[str | None]]。这不只是类型问题，调用方可能真的传 None，函数里要处理。不要用 [[str = None]] 的旧写法。

错误三：[[Need type annotation for "x"]]。空 list/dict 推断不出类型；修法是 [[x: list[str] = []]]。不要在函数里写 [[x = []]] 然后指望检查器猜；它猜不到。

错误四：[[Argument 1 has incompatible type]]。常见于把 [[str]] 传给 [[Path]]，或把 [[int]] 传给 [[float]]。修法是调用处转换，或在函数签名用联合类型。不要用 [[# type: ignore]] 掩盖，除非第三方库类型确实错。

错误五：[[Returning Any from function declared to return ...]]。根因是 [[json.loads]] 返回 Any，直接返回；修法是解析后校验/转换，或显式 [[cast]] 并加运行时检查。cast 不是校验，别把它当安全网。

错误六：测试里 [[fixture 'x' not found]]。根因是 fixture 定义在别的模块/类里，没导入；修法是放 [[conftest.py]] 或显式 import。不要在每个测试文件复制 fixture。

错误七：[[MonkeyPatch]] 没生效。根因是 patch 了定义处而不是使用处；修法是 patch [[module.under_test.func]]。导入方式决定 patch 目标，先看 [[from ... import ...]] 还是 [[import ...]]。

错误八：测试顺序依赖。根因是共享全局状态/数据库；修法是每个测试独立 fixture、临时目录、事务回滚。[[pytest -p no:randomly]] 能复现顺序问题，但修复靠隔离。

错误九：覆盖率 100% 但改错代码测试不红。根因是断言太弱；修法是加行为断言、边界、变异测试。不要用「调用过」当断言。

错误十：CI 本地过、远端挂。根因是路径/时区/编码/Python 版本差异；修法是固定环境、相对路径、显式编码、矩阵测试。把 CI 命令写进 README，本地先跑一遍。

处理顺序建议：先修语法/导入类错误，再修 Optional/泛型，再处理 Any 泄漏，最后开 strict。每修一类跑一次测试，确保行为没变。类型检查是护栏，不是重写理由。

验收：mypy 0 错误；ignore 有原因和上限；测试可单独运行；fixture 不重复；patch 目标正确；覆盖率与变异结果合理；CI 矩阵全绿。`,
    code: String.raw`from pathlib import Path
from typing import Any

def load(path: str | Path) -> dict[str, Any]:
    import json
    data = json.loads(Path(path).read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ValueError("top-level JSON must be an object")
    return data

# pytest fixture 放 conftest.py
# @pytest.fixture
# def rows():
#     return [{"athlete": "林晓", "seconds": 12.3}]

# monkeypatch 使用处
# monkeypatch.setattr("scores.io.fetch", fake_fetch)`,
    output: `# mypy src -> Success
# pytest -q -> 10 passed
# 每个 ignore 带原因：score_cache 第三方类型缺失 # type: ignore[import-untyped]`,
    tip: `先跑起来再收紧；Optional 要真处理；Any 不直接返回；fixture 放 conftest；patch 使用处；CI 命令本地可复现。`
  }]);

  add("ch13-3", [{
    h: "章节复盘：打包发布的安装失败案例库",
    p: `发布后最常见的问题不是代码逻辑，而是「用户装不上/装了跑不起来」。下面按症状分类：找不到模块、缺资源、版本冲突、入口不存在、平台不匹配、权限/网络失败。每条给排查命令和修复，不要凭报错猜。

症状一：[[ModuleNotFoundError: No module named 'scores']]。先确认装的是哪个包：[[pip show scores-kit]]、[[python -c "import sys; print(sys.path)"]]。常见原因是包名和导入名不一致、装到了另一个 Python、或 [[src]] 布局没打包。修复是检查 [[packages.find]] 和 [[project.name]]。

症状二：安装成功但 [[FileNotFoundError: report.md]]。根因是资源没进 wheel；用 [[unzip -l dist/*.whl | grep report]] 确认。修复是 package-data 加 [[data/*.md]]，并用 [[importlib.resources]] 读取。源码目录能读不代表 wheel 有。

症状三：[[pip install]] 报依赖冲突。看 [[pip check]] 和完整错误，常见是上限写得太死或两个包要求不同版本。修复是放宽范围、升级依赖，或用 [[constraints.txt]] 统一。不要用 [[--force-reinstall]] 掩盖。

症状四：命令 [[scores]] 不存在。根因是 [[project.scripts]] 没配、wheel 没装、或入口函数签名不对。检查 [[which scores]]、[[pip show -f scores-kit]]；入口必须是 [[module:function]]，函数返回 int 或 None。

症状五：macOS 装的 wheel 在 Linux 报 [[not a supported wheel]]。根因是平台标签不匹配；纯 Python 包应是 [[py3-none-any]]，带 C 扩展要按平台构建。修复是用 cibuildwheel/对应 CI，不要跨平台复制 wheel。

症状六：公司镜像装不到最新版。根因是镜像同步延迟或索引配置；用 [[pip install -i https://pypi.org/simple scores-kit==0.1.0]] 验证，再联系镜像。不要在 README 里只写内部源。

症状七：[[twine upload]] 403。根因是 token 权限/项目名已被占用/2FA；检查 PyPI 账号权限和项目名。不要反复重试，先看响应体。

症状八：安装后 [[__version__]] 是旧的。根因是缓存/多个环境/版本号写了两处；用 [[pip show]] 和 [[python -c "import importlib.metadata as m; print(m.version('scores-kit'))"]] 对比。修复是版本号单一来源。

把这些症状写成 [[docs/install-troubleshooting.md]]，每条带命令和期望输出。发布前在干净 venv、不同平台、离线环境各装一次；发布后看 issue 是否集中在这几类。

验收：六类安装失败都能按文档定位；wheel 内容可检查；入口可执行；版本号一致；平台标签正确；镜像/离线安装有说明。`,
    code: String.raw`# 排查顺序
pip show scores-kit
python -c "import scores, sys; print(scores.__file__); print(sys.executable)"
unzip -l dist/scores_kit-0.1.0-py3-none-any.whl | grep -E "report|py.typed"
pip check
which scores
python -c "import importlib.metadata as m; print(m.version('scores-kit'))"

# 干净安装
python -m venv /tmp/verify
/tmp/verify/bin/pip install --no-cache-dir dist/scores_kit-0.1.0-py3-none-any.whl
/tmp/verify/bin/scores --version`,
    output: `# 每条命令的期望输出写进文档；
# 安装失败先定位「包/环境/资源/入口/平台」五类。`,
    tip: `按症状分类排查；wheel 内容先看；入口/版本单一来源；干净 venv + 离线 + 多平台验收。`
  }]);

  add("ch14-3", [{
    h: "章节复盘：抓取事故的排查顺序与止损",
    p: `抓取项目的事故通常不是「代码不会写」，而是「页面变了、被限流了、数据脏了、断点丢了」。下面给一套排查顺序：先确认请求是否成功，再确认拿到的是不是目标内容，再确认解析字段，再确认数据质量，最后确认状态/断点。不要一上来重写解析器。

第一步看请求。状态码、最终 URL、响应头、响应大小、耗时。403/401 是权限/登录；429 是限流；302 循环是重定向；200 但 body 是验证码页，说明被反爬。保存原始 HTML 到 [[debug/]]，不要只打印前 200 字符。

第二步看内容。搜索目标字段是否在 HTML 里；如果不在，看 Network 的 XHR；如果 XHR 有签名/加密，评估是否值得做，不要硬破解。页面改版可能把表格改成 div，选择器要跟着换。

第三步看解析。打印 [[len(rows)]]、前 3 行、字段空值率；选择器命中 0 条时，先用浏览器 [[document.querySelectorAll]] 验证。不要用「第 3 个 div」这种位置选择器，改版必坏。

第四步看数据质量。总条数是否骤降、日期范围是否缺失、重复率是否上升、排名是否连续。骤降可能是分页提前结束；重复可能是主键选错；排名断裂可能是过滤了状态。

第五步看状态。断点文件是否存在、游标是否前进、最后成功页是否卡住。状态文件损坏时不要从头上传，先备份再修复；游标没前进通常是结束条件写错。

第六步止损。遇到 403/验证码/robots 禁止，立即停止并记录，不要换 IP/换 UA 硬闯；遇到 429，按 Retry-After 等待；遇到页面改版，先保存样本，离线修解析器，再小流量验证。

第七步回归。把事故页面保存成 fixture，写「改版页返回 0 行要报错而不是静默」的测试；分页用假 fetch 测结束条件；限流用本地服务器返回 429。事故不变成测试，下次还会发生。

第八步文档。[[docs/crawler-runbook.md]] 写：如何暂停、如何续跑、如何清理状态、如何联系站点、哪些情况必须停止。让接手的人不用读完整代码。

验收：请求/内容/解析/质量/状态五层排查有命令；原始 HTML 可回溯；改版会报错；限流会等待；断点可恢复；事故有 fixture；runbook 可执行。`,
    code: String.raw`# 排查命令（示例）
# 1) 保存原始响应
curl -L -A "scores-research/0.1" -o debug/page.html -w "%{http_code} %{url_effective}\n" URL
# 2) 解析命中数
python -c "from bs4 import BeautifulSoup; s=BeautifulSoup(open('debug/page.html').read(),'lxml'); print(len(s.select('table.results tbody tr')))"
# 3) 数据质量
python -c "import pandas as pd; df=pd.read_csv('out.csv'); print(df.shape, df.isna().mean(), df.duplicated().mean())"
# 4) 状态
cat crawl-state.json`,
    output: `# 200 https://example.com/events?page=3
# rows=0  -> 选择器失效，保存样本离线修
# 429     -> 读 Retry-After，暂停后从当前游标继续`,
    tip: `请求→内容→解析→质量→状态五层排查；保存原始 HTML；改版报错不静默；限流等待；事故变 fixture。`
  }]);

  add("ch15-3", [{
    h: "章节复盘：数字对不上时的检查顺序",
    p: `分析报告最尴尬的时刻是「总数对不上」。不要先怀疑 pandas，按数据流从源头查到展示：输入行数、过滤条件、连接、分组、聚合、导出、模板。每一步都留下审计数字，问题通常在第 2 或第 4 步。

第一步输入。[[pd.read_csv]] 读了多少行？和 [[wc -l]] 差多少？差 1 可能是表头；差很多可能是分隔符/引号/多行字段。检查 [[shape]]、列名、dtype，不要假设 CSV 干净。

第二步过滤。[[dropna]]、[[query]]、[[isin]] 各删了多少行？把每个条件的剩余行数打印出来。常见 bug 是 [[dropna]] 默认删任意列空值，而你只想删成绩空值；应写 [[subset=["seconds"]]]。

第三步连接。[[merge]] 前后行数变化多少？[[how]] 是 inner 还是 left？重复键是否产生笛卡尔积？用 [[validate="one_to_one"]] 或 [[indicator=True]] 检查。连接键类型/空格/时区不一致会静默丢行。

第四步分组聚合。[[groupby]] 是否丢了 NaN 组？[[sum]] 是否把 NaN 当 0？[[mean]] 的分母是全部还是非空？[[size]] 和 [[count]] 不一样，前者算行，后者算非空。报告里写清口径。

第五步排名。并列、缺赛、弃权是否过滤？排序是否稳定？[[rank]] 的 method 是否符合业务？并列后下一名是否跳号？这些在第 18 章有专门逻辑，不要在报告里临时写。

第六步导出。[[to_csv]] 是否写了索引？浮点格式是否丢精度？编码是否被 Excel 误读？日期是否变成了数字？导出后重新读一遍，对比行数和关键字段。

第七步模板。Jinja2 是否自动转义？循环是否漏了最后一行？表格是否分页截断？汇总数字是否和明细同一数据源？不要用两个查询各自算总数。

第八步对账。生成 [[audit.json]]：输入行、过滤后、连接后、分组数、输出行、报告行；任何一步不一致就停下来查。把 audit 放报告页脚，读者能追溯。

验收：每一步有行数；过滤条件明确 subset；merge 有 validate；分组口径写清；导出重读一致；模板与明细同源；audit 可追溯。`,
    code: String.raw`import pandas as pd

def audit(df, step, path):
    row = {"step": step, "rows": len(df), "cols": len(df.columns),
           "nulls": int(df.isna().sum().sum())}
    print(row)
    return df

df = pd.read_csv("results.csv", encoding="utf-8-sig")
df = audit(df, "raw", None)
df = audit(df.dropna(subset=["seconds"]), "drop-null-seconds", None)
df = audit(df[df["status"] == "finished"], "finished-only", None)
left = df.merge(events, on="event", how="left", validate="many_to_one")
left = audit(left, "merge-events", None)
summary = left.groupby("event", as_index=False).agg(
    n=("athlete", "size"), best=("seconds", "min"))
print(summary)`,
    output: `{'step': 'raw', 'rows': 120, 'cols': 6, 'nulls': 3}
{'step': 'drop-null-seconds', 'rows': 118, 'cols': 6, 'nulls': 0}
{'step': 'finished-only', 'rows': 115, 'cols': 6, 'nulls': 0}
{'step': 'merge-events', 'rows': 115, 'cols': 8, 'nulls': 0}`,
    tip: `输入→过滤→连接→分组→排名→导出→模板七步审计；dropna 写 subset；merge 加 validate；报告与明细同源。`
  }]);

  add("ch16-3", [{
    h: "章节复盘：办公批量生成的事故与恢复",
    p: `批量生成成绩单/报表的事故，往往不是代码异常，而是「生成了一半、文件名冲突、模板错位、邮件发错人」。下面按阶段列事故：输入、模板、输出、并发、校验、通知、重跑。每个阶段给止损和恢复步骤。

输入阶段：重复学号、缺姓名、成绩为空。止损是导入前校验并生成错误报告，不要带着坏数据生成。恢复是修 CSV、只重跑失败学号，不要全量重跑。

模板阶段：占位符拼错、缺值、样式丢失。止损是生成前检查模板占位符清单与数据字段是否完全匹配；缺值报错。恢复是修模板/数据后重跑该批，保留旧文件便于对比。

输出阶段：文件名非法字符、同名覆盖、目录不存在。止损是统一 [[safe_filename]]，加学号前缀，写临时目录再移动；已存在文件不覆盖，进 conflict 列表。恢复是人工确认后加 [[--overwrite]]。

并发阶段：同时开 20 个 Word 进程，内存爆、文件句柄耗尽。止损是限制 4-8 并发，每个任务独立临时目录，失败隔离。恢复是降低并发、清理临时目录、重跑失败项。

校验阶段：文件生成了但打不开、中文变方框、公式没算。止损是生成后重新打开、检查关键单元格/段落/页数；字体嵌入；公式用库重算。恢复是替换模板/字体，重跑并抽样。

通知阶段：把 A 的成绩单发给 B。止损是收件人从数据表读取，不从文件名猜；发送前用测试地址预览；附件名与收件人校验。恢复是立即撤回/致歉/重发正确文件，记录事件。

重跑阶段：重复发送、重复追加。止损是 manifest 记录已成功项，重跑只读 failed；发送也记状态。恢复是按批次回滚，删除本批输出后重跑。

最后写 [[docs/batch-runbook.md]]：如何暂停、如何查 manifest、如何只重跑失败、如何回滚、如何通知。每次事故后补一条检查项和测试，不要只修当下。

验收：输入/模板/输出/并发/校验/通知/重跑七阶段有检查项；文件名安全唯一；失败隔离；manifest 可追溯；重跑不重复；通知不串人；runbook 可执行。`,
    code: String.raw`from pathlib import Path
import re, shutil, tempfile

BAD = r'\/:*?"<>|'
def safe_name(student_id: str, name: str, kind: str) -> str:
    clean = re.sub(r"[" + re.escape(BAD) + r"]", "_", name).strip()
    clean = re.sub(r"\s+", " ", clean)[:60]
    return f"{student_id}-{clean}-{kind}.xlsx"

def publish(tmp: Path, target: Path, overwrite=False) -> str:
    if target.exists() and not overwrite:
        return "conflict"
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.move(str(tmp), target)
    return "ok"

# manifest 记录：
# student_id, kind, path, status, sha256, sent_at
# 重跑只读 status=failed；发送前检查 sent_at 为空`,
    output: `# 文件名：2026001-林晓-成绩单.xlsx
# 已存在且未 --overwrite -> conflict
# 重跑只处理 failed，已发送不重复`,
    tip: `七阶段检查；文件名安全唯一；临时目录+移动；并发限流；生成后重开；收件人从数据读；manifest 防重。`
  }]);

  add("ch17-3", [{
    h: "章节复盘：并发程序的卡死、重复与丢任务",
    p: `并发 bug 的可怕之处是「偶发」。下面用六个症状做排查表：程序卡死、CPU 打满、内存上涨、任务重复、任务丢失、退出不干净。每个症状给可能原因、取证方法、修复方向。先取证再改代码，不要靠重启。

症状一：程序卡死。可能原因：锁顺序相反、队列满且生产者在等、子进程管道未读、await 了永远不会完成的任务。取证：[[faulthandler.dump_traceback_later]] 打印堆栈，[[py-spy dump]] 看线程；检查所有 [[acquire]]/[[put]]/[[wait]] 是否有超时。修复：固定锁顺序、有界队列用 [[await put]]、[[communicate]] 读管道、所有 await 加超时。

症状二：CPU 打满。可能原因：忙等待（[[while not event: pass]]）、自旋锁、进程池任务太碎、JSON 序列化大对象。取证：[[top]]/[[py-spy top]] 看热点；把忙等待改成 [[event.wait(timeout)]]；任务批量提交。

症状三：内存上涨。可能原因：无界队列、结果全存 list、缓存不淘汰、子进程返回大对象。取证：[[tracemalloc]]、[[objgraph]]、队列 [[qsize()]]；修复：有界队列、流式处理、[[weakref]]/LRU、返回路径而不是数据。

症状四：任务重复。可能原因：重试没有幂等键、队列至少一次投递、状态提交晚于副作用。取证：日志里同一 id 出现多次；检查重试和状态顺序。修复：幂等键/upsert、先写状态后确认、去重表。

症状五：任务丢失。可能原因：异常被吞、Future 没取结果、队列哨兵提前、进程被 kill。取证：统计入队/出队/成功/失败四个数；检查 [[except: pass]]；修复：异常记录并重试、死信队列、优雅退出。

症状六：退出不干净。可能原因：daemon 线程被杀、任务未 cancel、子进程未 join、连接未关闭。取证：退出后 [[ps]] 看残留，[[lsof]] 看连接；修复：stop event、cancel + await、shutdown(wait=True)、with 关闭资源。

通用方法：给每个任务一个 id，日志贯穿入队/开始/成功/失败/重试；用计数器暴露队列长度、活跃数、失败数；压测时人为注入慢响应/异常/取消。没有指标的并发程序，只能靠猜。

验收：卡死能在 30 秒内打印堆栈；忙等待移除；队列有界；重复有幂等；丢失有死信；退出无残留；日志能追踪单任务全生命周期。`,
    code: String.raw`import asyncio, faulthandler, queue, threading

faulthandler.dump_traceback_later(30, exit=True)

q = queue.Queue(maxsize=100)
stop = threading.Event()

def worker():
    while not stop.is_set():
        try:
            item = q.get(timeout=0.5)
        except queue.Empty:
            continue
        try:
            handle(item)          # 不吞异常
        except Exception:
            log.exception("task failed: %s", item)
            dead_letter(item)
        finally:
            q.task_done()

# 退出：先停止生产，再 join 队列，再停 worker
# stop.set(); q.join(); for t in threads: t.join(timeout=2)`,
    output: `# 卡死 30s -> faulthandler 打印所有线程堆栈
# 队列上限 100，满时生产者等待
# 失败任务进死信，不阻塞其他任务`,
    tip: `先取证再改；所有等待有超时；队列有界；幂等防重；死信防丢；退出 stop→join→cancel；日志贯穿任务 id。`
  }]);
})();

/* --- expand-extra.js --- */

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

  add("ch11-1", [{
    h: "加练：把抽象基类减到最少",
    p: `给一个已有项目做接口评审，最常见的问题是「抽象太多」。每个基类都有七八个抽象方法，子类实现一半，另一半用 [[pass]] 占位，最后抽象基类既不约束行为，又增加阅读负担。练习目标：把一个臃肿的 [[Exporter]] 抽象减到两个真正必需的成员。

先列出所有抽象方法，逐个问三个问题：所有子类都必须实现吗？不实现能不能有合理默认？这个能力是核心还是可选？如果答案是否，就改成普通方法、类属性或独立函数。抽象只保留「没有它就无法工作」的那一个或两个。

例如 [[Exporter]] 只需要 [[name]] 和 [[export(rows, path)]] 两个抽象成员；[[suffix]] 可以按 name 推导，[[description]] 可以默认空，[[validate]] 可以默认通过。子类只实现两个，代码量减半，新增插件也更快。

抽象减少后，用 Protocol 做能力描述可能更合适。如果调用方只需要「有 export 方法」，不需要继承、不需要注册，就用 [[Protocol]]；如果必须阻止误用、必须登记子类，才用 ABC。两者不要同时堆。

给每个抽象方法写一个「反例测试」：子类不实现它，实例化是否报错？如果不会，说明它不该是抽象。再写一个「最小子类测试」：只实现必需成员，能否正常工作？不能，说明抽象划分有问题。

最后检查文档：抽象基类的 docstring 要写清「子类必须实现什么、可选覆盖什么、什么时候被调用」。不要只写「导出器基类」，那对新作者没有帮助。

验收：抽象成员不超过两个；最小子类可运行；可选能力有默认；Protocol/ABC 选择有理由；反例测试通过；文档说清合同。`,
    code: String.raw`from abc import ABC, abstractmethod

class Exporter(ABC):
    name: str
    @property
    def suffix(self) -> str:
        return "." + self.name
    @abstractmethod
    def export(self, rows: list[dict], path: str) -> None: ...
    def validate(self, rows: list[dict]) -> None:
        if not rows:
            raise ValueError("empty rows")

class JsonExporter(Exporter):
    name = "json"
    def export(self, rows, path):
        import json
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(rows, fh, ensure_ascii=False)`,
    output: `# JsonExporter 只实现 name + export；
# suffix 自动 ".json"；validate 有默认；
# 漏实现 export 时实例化报 TypeError。`,
    tip: `抽象只留没有它就无法工作的成员；可选能力给默认；Protocol 适合纯能力描述；写反例测试。`
  }]);

  add("ch12-1", [{
    h: "加练：给 200 行旧脚本做类型迁移",
    p: `练习对象是一段 200 行的成绩统计脚本：全局变量、字典到处传、函数没有注解、异常靠字符串。目标不是重写，而是在两周内逐步加类型，让 mypy 从 200 条错误降到 0，同时保持行为不变。按下面顺序做，避免一次性大改。

第一周第一天：只加函数签名，不改实现。参数和返回值都写注解，[[Any]] 先允许。跑 mypy，记录错误数量；跑测试，确认行为没变。签名是合同，先让合同存在，再谈精确。

第二天：处理 [[Optional]]。所有默认 None 的参数改成 [[T | None]]，函数里显式判断。很多潜在 None 崩溃会在这一步暴露；不要用 [[assert x is not None]] 糊弄，按业务决定默认值或报错。

第三天：给字典建 TypedDict。[[row: dict]] 改成 [[Row]]，字段名拼写错误立刻暴露。外部 JSON 仍用 [[dict[str, Any]]]]，在入口转成 Row；领域函数只接收 Row。

第四天：给列表/字典补泛型参数。[[list]] 改 [[list[Row]]]，[[dict]] 改 [[dict[str, Row]]]。空容器用注解或 [[cast]]，不要让检查器推断成 Any。

第五天：处理 Any 泄漏。[[json.loads]]、第三方库返回值先用 [[reveal_type]] 看，再决定校验/转换。每个 [[cast]] 旁边加运行时检查；cast 不是验证。

第二周：开 [[disallow_untyped_defs]]，修剩余缺注解；再开 [[strict]]，处理重载、泛型、未使用 ignore。每开一个选项跑一次测试。ignore 必须带原因，数量只降不升。

最后做行为回归：同一批输入跑旧脚本和新脚本，输出逐字段比较；性能不能明显下降；异常类型/消息对调用方兼容。类型迁移的完成标准是「mypy 0 + 行为一致」，不是「注解好看」。

验收：签名全覆盖；Optional 真处理；字典有 TypedDict；容器有泛型；Any 有边界；ignore 有原因；旧新输出一致；CI 跑 mypy。`,
    code: String.raw`from typing import TypedDict, Any
import json

class Row(TypedDict):
    athlete: str
    seconds: float

def load(path: str) -> list[Row]:
    raw: Any = json.loads(open(path, encoding="utf-8").read())
    if not isinstance(raw, list):
        raise ValueError("expected a list")
    out: list[Row] = []
    for item in raw:
        if not isinstance(item, dict):
            raise ValueError("expected an object")
        out.append({"athlete": str(item["athlete"]),
                    "seconds": float(item["seconds"])})
    return out`,
    output: `# mypy: 0 errors
# 旧脚本与新脚本对同一输入输出一致
# ignore 数量：3 -> 0（每条都有原因）`,
    tip: `先签名后实现；Optional 显式处理；TypedDict 进领域；容器补泛型；Any 只在入口；cast 旁加校验。`
  }]);

  add("ch13-1", [{
    h: "加练：从空目录做一个最小可安装项目",
    p: `练习：在一个空目录里，20 分钟内做出能被 [[pip install]] 的最小包。不写业务，只验证打包链路：目录、pyproject、模块、入口、资源、wheel、干净安装。做完后，任何新项目都可以套这个骨架。

第一步建目录：[[src/demo/__init__.py]]、[[src/demo/__main__.py]]、[[tests/test_smoke.py]]、[[pyproject.toml]]、[[README.md]]。不要先写业务代码；先让空包能安装。

第二步写 pyproject：[[build-system]] 用 setuptools；[[project.name = "demo-kit"]]、[[version = "0.1.0"]]、[[requires-python >=3.11]]；[[project.scripts]] 配 [[demo = "demo.__main__:main"]]；[[packages.find where=["src"]]]。

第三步写最小入口：[[__main__.py]] 里 [[def main() -> int: print("demo ok"); return 0]]，末尾 [[raise SystemExit(main())]]。这样 [[python -m demo]] 和 [[demo]] 两个入口都可用。

第四步加资源：[[src/demo/data/hello.txt]] 写一行文字；package-data 配 [[demo = ["data/*.txt"]]]；[[__init__.py]] 用 [[importlib.resources.files("demo")]] 读取。资源是打包最容易漏的部分，先验证。

第五步构建：[[python -m build]]；[[unzip -l dist/*.whl]] 确认 [[demo/data/hello.txt]] 和 [[demo-0.1.0.dist-info]] 都在；[[twine check dist/*]] 通过。不要跳过检查直接安装。

第六步干净安装：新建 venv，[[pip install dist/*.whl]]；运行 [[demo]]、[[python -m demo]]、读取资源；再 [[pip uninstall demo-kit]]，确认卸载干净。开发环境的 editable 安装不能替代这一步。

第七步写 smoke 测试：[[subprocess]] 跑 [[python -m demo]] 断言退出码 0 和输出；测试读取资源；测试版本号来自 metadata。CI 里先 build 再装 wheel 再跑 smoke。

第八步记录骨架：把目录、pyproject、入口、资源、构建、安装六步写进 [[docs/package-skeleton.md]]。下一个项目直接复制，不再从零踩坑。

验收：空包能安装；两个入口可用；资源从 wheel 读取；twine check 通过；干净 venv 安装/卸载；smoke 测试全绿；骨架文档可复制。`,
    code: String.raw`# pyproject.toml
[build-system]
requires = ["setuptools>=68", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "demo-kit"
version = "0.1.0"
requires-python = ">=3.11"

[project.scripts]
demo = "demo.__main__:main"

[tool.setuptools.packages.find]
where = ["src"]

[tool.setuptools.package-data]
demo = ["data/*.txt"]

# src/demo/__main__.py
def main() -> int:
    print("demo ok")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())`,
    output: `$ python -m build
$ unzip -l dist/demo_kit-0.1.0-py3-none-any.whl
$ python -m venv /tmp/demo && /tmp/demo/bin/pip install dist/*.whl
$ /tmp/demo/bin/demo
demo ok
$ /tmp/demo/bin/python -m demo
demo ok`,
    tip: `先空包后业务；pyproject 单份；双入口共用 main；资源先验证；build 后装 wheel；写骨架文档。`
  }]);

  add("ch14-1", [{
    h: "加练：用本地服务器验证超时、重试与流式下载",
    p: `练习目标：不依赖外网，用 [[http.server]] 起一个可控的本地服务，验证请求代码的超时、重试、429、断点续传、流式下载。这样测试稳定、快、不打扰别人，也能精确模拟异常。

服务端路由：[[/ok]] 返回 200 和小文件；[[/slow]] sleep 2 秒再返回；[[/fail]] 返回 500；[[/rate]] 第一次 429 带 [[Retry-After: 1]]，第二次 200；[[/big]] 返回 10MB 分块；[[/range]] 支持 Range，返回 206。用 [[ThreadingHTTPServer]]，避免慢请求阻塞其他测试。

客户端测试：[[timeout=(0.5, 5)]] 打 [[/slow]]，确认抛 Timeout；[[Retry]] 配 2 次打 [[/fail]]，确认最终失败；打 [[/rate]] 确认等待后成功；[[stream=True]] 打 [[/big]]，确认内存不暴涨；[[Range]] 打 [[/range]]，确认 206 和续传内容正确。

断言要精确：超时类型、重试次数、总耗时范围、下载字节数、SHA256、最终状态码。不要只断言「没抛异常」。重试测试要记录每次请求，确认真的重试了，而不是服务端一次成功。

并发测试：用 [[ThreadPoolExecutor]] 同时打 10 个 [[/slow]]，确认连接池大小和超时符合预期；观察是否有线程卡死。服务端日志能看出并发连接数。

清理：测试结束 [[server.shutdown()]]、[[server.server_close()]]、线程 join；临时文件删除。端口用 0 让系统分配，避免冲突；把实际端口传给客户端。

验收：六种路由都能触发预期行为；超时/重试/429/流式/Range 全覆盖；测试不访问外网；端口不冲突；服务端干净关闭；断言包含次数/字节/哈希。`,
    code: String.raw`from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import threading, time

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/slow":
            time.sleep(2)
        if self.path == "/fail":
            self.send_response(500); self.end_headers(); return
        if self.path == "/rate":
            if not hasattr(self.server, "hit"):
                self.server.hit = True
                self.send_response(429)
                self.send_header("Retry-After", "1"); self.end_headers(); return
        body = b"x" * 1024
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, *args):
        pass

server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
print(server.server_address[1])
# 测试结束：server.shutdown(); server.server_close()`,
    output: `# 端口由系统分配，例如 54321
# /slow -> requests.Timeout
# /rate -> 第一次 429，等待 1s 后 200
# /big -> 流式读取，内存稳定`,
    tip: `本地路由覆盖 ok/slow/fail/rate/big/range；断言次数/字节/哈希；端口 0；shutdown+close；不访外网。`
  }]);

  add("ch15-1", [{
    h: "加练：六个 NumPy 实验看清视图与广播",
    p: `练习用六个小实验建立直觉：切片是视图、reshape 可能共享、转置是视图、广播不复制、astype 复制、原地运算影响原数组。每个实验都打印 [[shape]]、[[base]]、[[flags.owndata]]，不要只凭记忆。

实验一：[[a = np.arange(12).reshape(3,4)]]；[[b = a[:, 1]]]；改 [[b[0]]]，看 a 是否变。[[b.base is a]] 为 True 说明共享。需要独立时 [[b.copy()]]。

实验二：[[c = a.reshape(2,6)]]；[[c.base is a]] 通常 True，因为连续内存可共享。若 [[a.T.reshape(...)]] 可能复制，检查 [[flags.owndata]]。

实验三：[[d = a.T]]；[[d.base is a]] True，转置是视图；改 d 会影响 a。需要独立时 [[a.T.copy()]]。

实验四：广播 [[(3,1) + (1,4)]] 得到 (3,4)，结果 [[owndata]] True，是新数组；输入没被复制，但结果分配了内存。大数组要估算结果大小。

实验五：[[e = a.astype(np.float32)]]；[[e.base is None]]，astype 默认复制；改 e 不影响 a。若 [[copy=False]] 且 dtype 相同，可能返回原对象，要小心。

实验六：[[a += 1]] 原地改；如果 a 是别人的视图，底层原数组也变。函数里修改入参前，先问「调用方是否还需要原数据」。

把六个实验写成 pytest，断言 [[base]]、[[owndata]]、原数组值。再把结论写成 [[docs/numpy-notes.md]]：什么时候必须 copy、什么时候可以视图、广播结果多大。

验收：六个实验全通过；能解释 base/owndata；知道 astype 复制；知道原地运算风险；大数组估算内存；笔记可查。`,
    code: String.raw`import numpy as np

a = np.arange(12).reshape(3, 4)
b = a[:, 1]
print(b.base is a, b.flags.owndata)      # True False
b[0] = 99
print(a[0, 1])                            # 99

c = a.reshape(2, 6)
print(c.base is a, c.flags.owndata)      # True False
d = a.T
print(d.base is a, d.flags.owndata)      # True False
e = a.astype(np.float32)
print(e.base is None, e.flags.owndata)   # True True`,
    output: `True False
99
True False
True False
True True`,
    tip: `看 base/owndata 判断视图；切片/reshape/转置可能共享；astype 复制；广播结果新分配；原地运算慎用。`
  }]);

  add("ch16-1", [{
    h: "加练：五个实验验证文件写入的崩溃安全",
    p: `练习目标：用五个实验证明「临时文件 + fsync + replace」比直接覆盖安全。每个实验都模拟失败：写一半抛异常、进程被杀、磁盘满、目标被占用、并发写。观察目标文件是否完整。

实验一：直接 [[open(target,"w")]] 写一半抛异常，目标文件被截断，旧内容丢失。这是反例，先看清问题。

实验二：写同目录临时文件，写一半抛异常，finally 删除临时文件；目标文件完全没动。这是最小修复。

实验三：写临时文件后 [[flush + fsync]]，再 [[os.replace]]；模拟 replace 前 kill，目标仍是旧版；replace 后 kill，目标是完整新版。原子替换保证「要么旧、要么新」。

实验四：两个进程同时写同一目标，各自临时文件 + replace；最终目标是其中一个完整版本，不会混合。若需要串行，加文件锁；不加锁时至少不会半截。

实验五：目标文件被另一个程序占用（Windows），[[os.replace]] 抛 PermissionError；捕获后提示关闭文件，临时文件清理。不要假设 replace 永远成功。

再补一个磁盘满实验：写入时抛 OSError，临时文件可能部分存在；finally 清理，目标不变。磁盘满时 [[fsync]] 也可能失败，必须检查。

把这些实验写成脚本，用子进程模拟 kill；用 [[os.stat]] 检查大小；用哈希检查内容。结论写进 [[docs/atomic-write.md]]：什么时候需要 fsync、什么时候需要目录 fsync、Windows 差异。

验收：反例复现截断；临时文件方案保住旧版；replace 前后状态正确；并发不混合；占用有清楚错误；磁盘满清理；文档可查。`,
    code: String.raw`from pathlib import Path
import os, tempfile

def atomic_write(path: Path, text: str, fail=False) -> None:
    fd, tmp_name = tempfile.mkstemp(dir=path.parent, prefix=".tmp-")
    tmp = Path(tmp_name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as fh:
            fh.write(text)
            if fail:
                raise RuntimeError("simulated failure")
            fh.flush(); os.fsync(fh.fileno())
        os.replace(tmp, path)
    finally:
        if tmp.exists():
            tmp.unlink()

target = Path("data.txt")
target.write_text("old", encoding="utf-8")
try:
    atomic_write(target, "new", fail=True)
except RuntimeError:
    pass
print(target.read_text(encoding="utf-8"))  # old`,
    output: `old
# 失败写入没有破坏旧文件；
# 成功后目标为完整 new。`,
    tip: `先看直接覆盖的反例；临时文件+fsync+replace；finally 清理；并发不混合；Windows 占用要捕获。`
  }]);

  add("ch17-2", [{
    h: "加练：进程池的 pickle 边界实验",
    p: `练习用五个实验看清进程池的限制：模块顶层函数可 pickle、lambda 不可、闭包不可、打开的文件不可、自定义异常要可导入。每个实验都实际提交任务，观察错误发生在提交时还是执行时。

实验一：顶层函数 [[def square(x): return x*x]]，[[pool.submit(square, 3)]] 正常。确认 [[square.__module__]] 是当前模块，子进程能导入。

实验二：[[pool.submit(lambda x: x*x, 3)]] 抛 [[PicklingError]] 或 [[AttributeError: Can't pickle local object]]。lambda 没有模块级名字，子进程找不到。

实验三：闭包 [[def make(n): return lambda x: x+n]] 同样不可 pickle。修复是把 n 作为参数，用 [[functools.partial(square, n)]] 或顶层函数 + 参数元组。

实验四：提交一个打开的文件对象/数据库连接，报不可 pickle。修复是在子进程内部打开资源，不要把句柄传过去；需要共享数据用路径/共享内存。

实验五：自定义异常在 [[__main__]] 里定义，子进程抛回主进程时可能反序列化失败。修复是把异常类放模块顶层，或转成 [[(type_name, message)]] 再抛。

再实验：[[chunksize]] 对性能的影响。1000 个小任务，chunksize=1 慢，chunksize=20 快；任务太重时 chunksize 太大会负载不均。记录耗时，不要凭感觉。

最后实验：[[max_workers]] 与内存。每个进程加载 pandas 占 200MB，开 8 个就 1.6GB；按内存定上限。用 [[psutil]] 观察 RSS。

验收：五个实验都能复现错误；知道怎么修；任务粒度有耗时对比；并发上限有内存依据；异常能回传。`,
    code: String.raw`from concurrent.futures import ProcessPoolExecutor
from functools import partial
import pickle

def square(x: int) -> int:
    return x * x

def add(n: int, x: int) -> int:
    return x + n

if __name__ == "__main__":
    print(pickle.dumps(square))
    with ProcessPoolExecutor(max_workers=2) as pool:
        print(list(pool.map(square, range(5))))
        print(list(pool.map(partial(add, 10), range(5))))
        try:
            pool.submit(lambda x: x, 1).result()
        except Exception as exc:
            print("lambda failed:", type(exc).__name__)`,
    output: `b'...'
[0, 1, 4, 9, 16]
[10, 11, 12, 13, 14]
lambda failed: PicklingError`,
    tip: `工作函数放模块顶层；lambda/闭包不可 pickle；资源在子进程内打开；异常类顶层可导入；按内存定并发。`
  }]);
})();

/* --- expand-final.js --- */

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

/* --- expand-final2.js --- */

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

/* --- expand-capstones.js --- */

/* Python 课程加餐 · 每章 1 节工程实战工作坊，18 节 / 108 个正文小节。 */
window.PY_FOUNDATIONS_CAPSTONES = {
  "ch1": {
    "id": "ch1-capstone",
    "title": "加餐：写一个命令行单位换算器",
    "minutes": 45,
    "lead": "把输入、解析、计算、格式化拆开，做一个能处理公里/英里、摄氏/华氏的小 CLI。第一次体会“脚本”和“工具”的差别。",
    "sections": [
      {
        "h": "需求现场",
        "p": "用户运行 `python convert.py 10 km mi`，输出 `6.21 mi`。要求支持 km/mi、kg/lb、c/f 三组换算；参数缺失时打印用法；单位不认识时返回非零退出码。",
        "code": "",
        "output": "",
        "tip": "CLI 的第一课不是 argparse，而是把“参数、计算、输出”分开。"
      },
      {
        "h": "设计与数据流",
        "p": "先写纯函数 `convert(value, src, dst)`，内部用换算表；再写 `parse_args(argv)`；最后 `main()` 负责打印和退出码。纯函数可以单独测试，不用启动进程。",
        "code": "RATES = {\n    ('km', 'mi'): 0.621371,\n    ('mi', 'km'): 1.609344,\n    ('kg', 'lb'): 2.2046226,\n    ('lb', 'kg'): 0.4535924,\n}",
        "output": "convert(10, 'km', 'mi') -> 6.21371",
        "tip": "换算表用有向键，反向不要靠手算倒数；精度问题会在边界处放大。"
      },
      {
        "h": "最小实现",
        "p": "温度换算不是比例关系，单独分支处理。长度和质量直接乘系数。输出统一保留两位小数，单位跟在数值后面。",
        "code": "def convert(value, src, dst):\n    src, dst = src.lower(), dst.lower()\n    if src == 'c' and dst == 'f':\n        return value * 9 / 5 + 32\n    if src == 'f' and dst == 'c':\n        return (value - 32) * 5 / 9\n    rate = RATES.get((src, dst))\n    if rate is None:\n        raise ValueError(f'不支持 {src} -> {dst}')\n    return value * rate",
        "output": "convert(100, 'c', 'f') -> 212.0\nconvert(10, 'km', 'mi') -> 6.21371",
        "tip": "温度有偏移量，不能套用乘法表；先把“线性”和“仿射”分开。"
      },
      {
        "h": "边界与错误",
        "p": "负数、0、超大值、大小写、空格、`km->mi` 连写、参数个数不对。用 `argparse` 的 `type=float` 会替你报错，但错误信息是英文；教学阶段可以先手写解析，理解流程。",
        "code": "try:\n    value = float(argv[1])\nexcept (IndexError, ValueError):\n    print('用法: convert.py 数值 源单位 目标单位')\n    return 2",
        "output": "缺参数 -> 用法提示，退出码 2",
        "tip": "退出码也是接口：0 成功、1 计算错误、2 用法错误，脚本才能被其他程序调用。"
      },
      {
        "h": "验收与测试",
        "p": "用 pytest 参数化测三组换算、反向换算、非法单位、缺参数。CLI 层用 `subprocess.run` 测 stdout 和 returncode，不要只测纯函数。",
        "code": "import pytest\n@pytest.mark.parametrize('v,s,d,w', [(10,'km','mi',6.21),(100,'c','f',212.0)])\ndef test_convert(v,s,d,w):\n    assert round(convert(v,s,d), 2) == w",
        "output": "2 passed",
        "tip": "纯函数测逻辑，subprocess 测 CLI；两层都测才算完整。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加 `--json` 输出、批量文件换算、单位别名（公里/千米）；再用 `argparse` 重写一遍，比较手写解析和标准库的代码量。最后打包成 `python -m converter`。",
        "code": "",
        "output": "",
        "tip": "先手写再上库，你才知道库替你省了哪些边界。"
      }
    ],
    "points": [
      "参数、计算、输出三层分开。",
      "温度换算是仿射变换，不是乘法。",
      "退出码是 CLI 接口的一部分。"
    ],
    "practice": "实现 convert.py，支持三组换算、用法提示和 pytest 参数化测试。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch2": {
    "id": "ch2-capstone",
    "title": "加餐：日志脱敏与格式化",
    "minutes": 45,
    "lead": "把含手机号、邮箱、身份证的日志变成可分享的版本，同时保留级别、时间和模块。正则要准，不能把正常数字也吃掉。",
    "sections": [
      {
        "h": "需求现场",
        "p": "线上日志要发给外部排查，但里面有用户手机号和邮箱。要求：手机号中间四位打码，邮箱保留首字母、域名保留，身份证只留前六后四；其他内容不动。",
        "code": "",
        "output": "",
        "tip": "脱敏是“精确替换”，不是把所有数字都抹掉；先列敏感模式。"
      },
      {
        "h": "设计与数据流",
        "p": "三个正则分别匹配手机号、邮箱、身份证；用 `re.sub` 配合回调函数，按模式替换。处理顺序先长后短，避免身份证被手机号规则先切走。",
        "code": "PHONE = re.compile(r'(?<!\\d)(1[3-9]\\d{9})(?!\\d)')\nEMAIL = re.compile(r'([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]*@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})')",
        "output": "13812345678 -> 138****5678\ntom@example.com -> t***@example.com",
        "tip": "用前后断言 `(?<!\\d)`/`(?!\\d)` 防止把 11 位号码从更长数字里截出来。"
      },
      {
        "h": "最小实现",
        "p": "写 `mask_phone`、`mask_email`、`mask_id`，再组合成 `mask_line`。回调函数里用分组保留需要的部分，不要用固定切片。",
        "code": "def mask_phone(m):\n    s = m.group(1)\n    return s[:3] + '****' + s[7:]\ndef mask_line(line):\n    line = PHONE.sub(mask_phone, line)\n    line = EMAIL.sub(lambda m: m.group(1) + '***@' + m.group(2), line)\n    return line",
        "output": "mask_line('call 13812345678') -> 'call 138****5678'",
        "tip": "回调比固定切片安全；号码格式变了也只改正则。"
      },
      {
        "h": "边界与错误",
        "p": "座机、带 +86、空格分隔、多个号码、日志里本来就有 `****`、JSON 转义。脱敏后要保证原日志结构不变；不要把时间戳误伤。",
        "code": "line = '+86 138 1234 5678'\n# 先归一化空格再匹配，或把正则写成允许分隔符\nPHONE_SPACED = re.compile(r'1[3-9]\\d[\\s-]?\\d{4}[\\s-]?\\d{4}')",
        "output": "+86 138 1234 5678 -> +86 138****5678",
        "tip": "先决定“要不要保留国家码”，再写正则；否则替换位置会错。"
      },
      {
        "h": "验收与测试",
        "p": "准备正常日志、带多个号码、带邮箱、带身份证、无敏感信息五组样本。断言脱敏后的字符串仍包含时间、级别和模块名，敏感原文不出现。",
        "code": "src = '2026-11-25 INFO user=13812345678 mail=tom@example.com'\nout = mask_line(src)\nassert '13812345678' not in out and 'tom@' not in out\nassert 'INFO' in out and '2026-11-25' in out",
        "output": "通过：敏感信息消失，结构保留",
        "tip": "测试不仅要断言“被替换”，还要断言“不该动的没动”。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加配置文件自定义规则、批量处理日志文件、脱敏前后 diff 预览；再考虑用 `logging.Formatter` 在输出阶段统一脱敏。最后写一条“误杀率”统计。",
        "code": "",
        "output": "",
        "tip": "脱敏规则要可配置、可审计；硬编码在业务代码里很难维护。"
      }
    ],
    "points": [
      "先列敏感模式，再写正则。",
      "用前后断言防止截断长数字。",
      "脱敏要保留日志结构。"
    ],
    "practice": "实现 mask_line，覆盖手机、邮箱、身份证，并用五组样本验证不误伤。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch3": {
    "id": "ch3-capstone",
    "title": "加餐：成绩序列分析",
    "minutes": 45,
    "lead": "给一组成绩算平均、中位数、标准差、及格率和最高分。别急着上 NumPy，先用标准库把统计口径讲清楚。",
    "sections": [
      {
        "h": "需求现场",
        "p": "老师给一个班的成绩列表，要一份小报告：人数、平均分、中位数、最高/最低、及格率、标准差。还要能处理缺考（None）和 0 分，两者含义不同。",
        "code": "",
        "output": "",
        "tip": "统计题先问口径：缺考算不算人数？0 分算不算及格？口径不清，数字全白算。"
      },
      {
        "h": "设计与数据流",
        "p": "输入 `scores: list[float|None]`；先分离有效成绩和缺考数量；有效成绩排序后算中位数；及格率用“及格人数 / 有效人数”。标准差用样本还是总体，要注明。",
        "code": "from statistics import mean, median, pstdev\nvalid = [x for x in scores if x is not None]\nabsent = len(scores) - len(valid)",
        "output": "mean=78.4, median=80, absent=2",
        "tip": "`None` 和 0 必须分开；把缺考当 0 会拉低平均分。"
      },
      {
        "h": "最小实现",
        "p": "写 `report(scores)` 返回字典，所有指标一次算完。中位数用 `statistics.median`，标准差用 `pstdev`（总体）或 `stdev`（样本），在输出里写清楚。",
        "code": "def report(scores):\n    valid = [x for x in scores if x is not None]\n    if not valid:\n        return {'count': 0, 'absent': len(scores)}\n    return {\n        'count': len(valid), 'absent': len(scores) - len(valid),\n        'mean': round(mean(valid), 2), 'median': median(valid),\n        'max': max(valid), 'min': min(valid),\n        'pass_rate': round(sum(x >= 60 for x in valid) / len(valid), 4),\n        'std': round(pstdev(valid), 2)\n    }",
        "output": "{'count': 40, 'absent': 2, 'mean': 78.4, ...}",
        "tip": "空列表要单独返回，别让 `mean([])` 抛 StatisticsError。"
      },
      {
        "h": "边界与错误",
        "p": "全缺考、只有一个成绩、成绩为字符串、超过 100、负数、浮点精度。中位数对偶数个元素取平均；及格线可能是 60 也可能是 50，必须配置。",
        "code": "if not valid:\n    return {'count': 0, 'absent': len(scores), 'mean': None}\nif any(not isinstance(x, (int, float)) for x in valid):\n    raise TypeError('成绩必须是数字')",
        "output": "全缺考 -> mean=None，不抛异常",
        "tip": "统计函数要能表达“没有数据”，不要用 0 冒充。"
      },
      {
        "h": "验收与测试",
        "p": "用固定小数据手算期望值：`[100, 90, None, 0]` 的有效人数 3、平均 63.33、及格率 2/3。再测空列表、单元素、偶数个中位数。",
        "code": "assert report([100, 90, None, 0])['count'] == 3\nassert report([100, 90, None, 0])['pass_rate'] == 0.6667\nassert report([])['mean'] is None",
        "output": "通过：count=3, pass_rate=0.6667\n空列表 mean=None",
        "tip": "测试数据要小到能手算，否则断言错了你也看不出来。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加分数段分布（90+/80-89/...）、班级排名、按学号分组；再用 pandas 的 `describe()` 对照你的结果。最后把报告导出 CSV 和 Markdown。",
        "code": "",
        "output": "",
        "tip": "先手算标准库，再用 pandas 对照；差异能帮你发现口径问题。"
      }
    ],
    "points": [
      "缺考和 0 分必须分开。",
      "空数据要返回可表达的 None。",
      "统计口径写进输出。"
    ],
    "practice": "实现 report(scores)，输出人数、平均、中位数、极值、及格率、标准差。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch4": {
    "id": "ch4-capstone",
    "title": "加餐：词频索引与查重",
    "minutes": 45,
    "lead": "给一段文本建词频表，支持按频次排序、按前缀查询、找出重复短语。用 Counter、defaultdict 和倒排索引组合。",
    "sections": [
      {
        "h": "需求现场",
        "p": "一个文档管理系统要查“哪些词出现最多”“包含某个前缀的词有哪些”“哪些句子重复”。文本不大，但要求查询快、结果稳定。",
        "code": "",
        "output": "",
        "tip": "先定义“词”的边界：中文分词、英文按空格、标点算不算？别默认 split 就完事。"
      },
      {
        "h": "设计与数据流",
        "p": "清洗 → 分词 → 计数 → 建索引。词频用 Counter；前缀索引用字典 `prefix -> set(words)`；重复句子用集合去重并记录次数。所有结果按 `(-count, word)` 排序，保证稳定。",
        "code": "from collections import Counter, defaultdict\nwords = re.findall(r'[a-zA-Z]+', text.lower())\nfreq = Counter(words)",
        "output": "freq.most_common(3) -> [('the', 12), ('data', 9), ...]",
        "tip": "英文正则用 `[a-zA-Z]+` 会把 `don't` 拆成两个词；先接受这个简化，再按需求调整。"
      },
      {
        "h": "最小实现",
        "p": "写 `build_index(text)` 返回 `{freq, prefix, duplicates}`。前缀索引只存长度 1–3 的前缀，避免内存爆炸；重复句子按换行切分、strip 后比较。",
        "code": "def build_index(text):\n    words = re.findall(r'[a-zA-Z]+', text.lower())\n    freq = Counter(words)\n    prefix = defaultdict(set)\n    for w in freq:\n        for i in range(1, min(3, len(w)) + 1):\n            prefix[w[:i]].add(w)\n    lines = [x.strip() for x in text.splitlines() if x.strip()]\n    dup = {x for x in lines if lines.count(x) > 1}\n    return {'freq': freq, 'prefix': prefix, 'duplicates': dup}",
        "output": "build_index(text)['prefix']['dat'] -> {'data', 'database'}",
        "tip": "`lines.count(x)` 在循环里是 O(n²)；数据大时改用 Counter。"
      },
      {
        "h": "边界与错误",
        "p": "大小写、标点、空文本、超长文本、Unicode、停用词、词形变化（run/runs）。中文没有空格，不能直接用 `split()`；需要 jieba 或按字/词库处理。",
        "code": "if not text.strip():\n    return {'freq': Counter(), 'prefix': defaultdict(set), 'duplicates': set()}",
        "output": "空文本 -> 三个空结构",
        "tip": "空输入要返回空结构，不要返回 None 让调用方到处判空。"
      },
      {
        "h": "验收与测试",
        "p": "用一段三行文本断言词频、前缀查询、重复行。再测大小写合并、空文本、标点分隔。排序结果要逐项断言，不能只看长度。",
        "code": "idx = build_index('Data data\\nData\\nhello world')\nassert idx['freq']['data'] == 3\nassert idx['duplicates'] == {'Data'}",
        "output": "通过：data=3，重复行={'Data'}",
        "tip": "词频测试要断言具体计数，不能只断言 most_common 非空。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加停用词过滤、词干提取、TF-IDF 权重、中文分词；再把索引持久化成 JSON。最后做一个最小的搜索接口：输入前缀，返回 Top 5 词。",
        "code": "",
        "output": "",
        "tip": "索引是“空间换时间”；先估内存，再决定存几层前缀。"
      }
    ],
    "points": [
      "先定义词边界，再统计。",
      "前缀索引限制深度，控制内存。",
      "重复行统计避免 O(n²)。"
    ],
    "practice": "实现 build_index，返回词频、前缀索引和重复行，并用固定文本断言计数。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch5": {
    "id": "ch5-capstone",
    "title": "加餐：命令行菜单状态机",
    "minutes": 45,
    "lead": "用 while + match 写一个不会乱跳的菜单：主菜单、列表、详情、返回、退出。状态用字符串，转移写清楚。",
    "sections": [
      {
        "h": "需求现场",
        "p": "一个小工具需要交互菜单：1 查看列表，2 查看详情，3 返回，0 退出。用户乱输入不能崩；进入详情后按 3 回主菜单，按 0 退出。",
        "code": "",
        "output": "",
        "tip": "菜单本质是状态机；把状态和转移画出来，比堆 if 清楚。"
      },
      {
        "h": "设计与数据流",
        "p": "状态 `state = 'main'`；循环读一行输入；用 `match state` 分派；每个分支只负责当前状态能做的事。非法输入留在原状态并提示。",
        "code": "state = 'main'\nwhile state != 'exit':\n    cmd = input('> ').strip()\n    match state:\n        case 'main':\n            state = handle_main(cmd)\n        case 'detail':\n            state = handle_detail(cmd)",
        "output": "main + '1' -> list\nlist + '2' -> detail\ndetail + '3' -> main",
        "tip": "状态转移函数返回下一个状态，不要直接改全局变量。"
      },
      {
        "h": "最小实现",
        "p": "写两个处理函数，返回状态字符串。`0` 在任何状态都退出；`q` 也退出；其他非法输入打印可用命令。详情页需要知道当前选中项，用一个 `selected` 变量。",
        "code": "def handle_main(cmd):\n    if cmd in ('0', 'q'): return 'exit'\n    if cmd == '1': return 'list'\n    print('可用: 1 列表 / 0 退出')\n    return 'main'",
        "output": "输入 9 -> 提示后仍在 main\n输入 0 -> exit",
        "tip": "每个分支都要有兜底，别让未知输入掉进死循环。"
      },
      {
        "h": "边界与错误",
        "p": "EOF（用户按 Ctrl-D）、空输入、连续非法输入、状态变量拼错、详情页没选项、退出时资源未关闭。`input()` 在管道输入结束时会抛 EOFError，要捕获。",
        "code": "try:\n    cmd = input('> ').strip()\ncatch = None\nexcept EOFError:\n    break",
        "output": "Ctrl-D -> 安全退出",
        "tip": "CLI 要考虑非交互输入；`yes | python menu.py` 不能把程序卡死。"
      },
      {
        "h": "验收与测试",
        "p": "用 `unittest.mock.patch('builtins.input', side_effect=[...])` 模拟一串输入，断言最终状态和输出。覆盖正常路径、非法输入、EOF、退出。",
        "code": "with patch('builtins.input', side_effect=['1', '2', '3', '0']):\n    assert run_menu() == 'exit'",
        "output": "通过：退出",
        "tip": "状态机测试用输入序列，不要只测单个处理函数。"
      },
      {
        "h": "新手加练与扩展",
        "p": "把状态和转移写成字典 `transitions = {('main','1'):'list'}`，再加撤销、帮助、配置加载。最后用 `argparse` 做一个非交互子命令版本，交互和脚本共用业务函数。",
        "code": "",
        "output": "",
        "tip": "交互层和业务层分开；以后加 GUI 或 API 时不用重写核心。"
      }
    ],
    "points": [
      "菜单是状态机，状态转移要显式。",
      "未知输入留在原状态并提示。",
      "捕获 EOF，支持非交互输入。"
    ],
    "practice": "实现四状态菜单，覆盖正常、非法、EOF、退出四组输入序列。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch6": {
    "id": "ch6-capstone",
    "title": "加餐：参数校验装饰器",
    "minutes": 45,
    "lead": "写一个 `@validate` 装饰器，检查参数类型、范围和必填。被装饰的函数保持原签名和文档，错误信息指出具体参数。",
    "sections": [
      {
        "h": "需求现场",
        "p": "业务函数经常收到脏参数：年龄是字符串、金额是负数、用户名是空串。每个函数手写 if 很烦，想要一个装饰器统一校验，且不影响函数本身的职责。",
        "code": "",
        "output": "",
        "tip": "装饰器只做横切关注点；业务逻辑不要塞进装饰器。"
      },
      {
        "h": "设计与数据流",
        "p": "`validate(**rules)` 接收参数规则；装饰器用 `functools.wraps` 保留元信息；调用前用 `inspect.signature` 把实参绑定成字典，再逐条校验；通过后调用原函数。",
        "code": "import inspect\nfrom functools import wraps\ndef validate(**rules):\n    def deco(fn):\n        @wraps(fn)\n        def wrapper(*args, **kwargs):\n            bound = inspect.signature(fn).bind(*args, **kwargs)\n            for name, rule in rules.items():\n                rule(name, bound.arguments.get(name))\n            return fn(*args, **kwargs)\n        return wrapper\n    return deco",
        "output": "wrapper.__name__ == fn.__name__ -> True",
        "tip": "用 `inspect.signature.bind` 兼容位置参数和关键字参数，别手工拆 args。"
      },
      {
        "h": "最小实现",
        "p": "规则函数接收 `(name, value)`，不满足就抛 ValueError。先实现 required、min、max、type 四个规则，再组合。错误信息统一成 `参数 age 必须 >= 0，实际 -1`。",
        "code": "def minimum(n):\n    def rule(name, value):\n        if value is None or value < n:\n            raise ValueError(f'参数 {name} 必须 >= {n}，实际 {value}')\n    return rule\n@validate(age=minimum(0))\ndef create_user(name, age): ...",
        "output": "create_user('Ada', -1) -> ValueError",
        "tip": "规则函数只负责判断，错误文案由规则统一生成。"
      },
      {
        "h": "边界与错误",
        "p": "默认参数、`*args`、`**kwargs`、可选参数为 None、布尔是 int 的子类、装饰器顺序、异步函数。`bind` 不会自动应用默认值，需要 `apply_defaults()`。",
        "code": "bound = inspect.signature(fn).bind(*args, **kwargs)\nbound.apply_defaults()",
        "output": "默认值 age=0 也会进入校验",
        "tip": "不调用 `apply_defaults`，默认参数会漏校验。"
      },
      {
        "h": "验收与测试",
        "p": "测合法调用、越界、缺参、关键字参数、默认值、函数元信息保留。再测装饰器叠加顺序：先校验后日志，或反过来，结果应一致。",
        "code": "assert create_user.__name__ == 'create_user'\nwith pytest.raises(ValueError, match='age'):\n    create_user('Ada', -1)",
        "output": "通过：元信息保留，错误含参数名",
        "tip": "装饰器测试要断言 `__name__` 和 `__doc__`，否则调试时找不到函数。"
      },
      {
        "h": "新手加练与扩展",
        "p": "支持自定义错误类型、把多个错误收集成列表、用 `pydantic` 重写一版。再加异步装饰器，注意 `async def` 要返回协程，不能直接 `fn(*args)`。",
        "code": "",
        "output": "",
        "tip": "同步和异步装饰器要分开写；混用会让函数变成普通值。"
      }
    ],
    "points": [
      "装饰器做横切校验，不抢业务逻辑。",
      "用 signature.bind 兼容参数形态。",
      "apply_defaults 后默认值也校验。"
    ],
    "practice": "实现 @validate，支持 required/min/max/type，并测默认值和元信息。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch7": {
    "id": "ch7-capstone",
    "title": "加餐：惰性数据管道",
    "minutes": 45,
    "lead": "用生成器把“读取 → 清洗 → 转换 → 汇总”串成流水线，数据一条一条流，不一次性占满内存。",
    "sections": [
      {
        "h": "需求现场",
        "p": "一个 2GB 的日志文件要统计错误数。`readlines()` 会直接把内存打满；正确做法是逐行读、逐行过滤、逐行计数。生成器就是这条流水线的传送带。",
        "code": "",
        "output": "",
        "tip": "惰性不是炫技；数据大于内存时，它是唯一能跑通的方案。"
      },
      {
        "h": "设计与数据流",
        "p": "四个生成器：`read_lines` 逐行读；`clean` 去空行和空格；`parse` 转结构；`count_errors` 消费并累加。每个 `yield` 只处理一条，调用方用 `for` 驱动。",
        "code": "def read_lines(path):\n    with open(path, encoding='utf-8') as f:\n        for line in f:\n            yield line.rstrip('\\n')\ndef clean(lines):\n    for line in lines:\n        line = line.strip()\n        if line:\n            yield line",
        "output": "for line in clean(read_lines('app.log')): ...",
        "tip": "文件对象本身就是迭代器；不要先 `readlines()` 再生成。"
      },
      {
        "h": "最小实现",
        "p": "写 `parse` 和 `count`。`parse` 用正则拆级别；`count` 用 Counter 累加。整条链只在最后 `sum` 时消费一次。",
        "code": "def parse(lines):\n    for line in lines:\n        m = re.search(r'\\b(ERROR|WARN|INFO)\\b', line)\n        if m:\n            yield m.group(1)\ndef count(levels):\n    c = Counter()\n    for level in levels:\n        c[level] += 1\n    return c\nresult = count(parse(clean(read_lines(path))))",
        "output": "Counter({'ERROR': 12, 'INFO': 30})",
        "tip": "生成器链是“拉”模型；最后一个消费者启动，前面才开始读。"
      },
      {
        "h": "边界与错误",
        "p": "文件不存在、编码错误、生成器只能消费一次、异常在链中间、资源未关闭。`with` 在生成器里要谨慎：生成器未消费完时文件可能一直开着。",
        "code": "gen = read_lines(path)\nnext(gen)\ngen.close()  # 触发 with 退出",
        "output": "提前关闭 -> 文件句柄释放",
        "tip": "生成器持有资源时，调用方要负责 close，或用 contextmanager 包一层。"
      },
      {
        "h": "验收与测试",
        "p": "用小文件测行数、错误数、空行过滤；再用 `tracemalloc` 或计数生成器验证没有一次性读入。异常文件要断言抛出哪类错误。",
        "code": "assert count(parse(clean(read_lines(tmp))))['ERROR'] == 2\n# 统计每次 yield 的行号，确认是逐行",
        "output": "通过：ERROR=2，逐行消费",
        "tip": "测试惰性要看“消费节奏”，不只看最终结果。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加批量读取多个文件、并行处理、背压控制；再对比列表推导和生成器表达式的内存占用。最后把管道封装成 `pipeline(*stages)`。",
        "code": "",
        "output": "",
        "tip": "生成器表达式适合简单链；复杂分支还是写具名生成器更可读。"
      }
    ],
    "points": [
      "生成器逐条传递，不一次性加载。",
      "生成器只能消费一次。",
      "生成器持有资源要及时 close。"
    ],
    "practice": "实现 read/clean/parse/count 四段管道，统计日志级别并验证逐行消费。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch8": {
    "id": "ch8-capstone",
    "title": "加餐：做一个可安装的小工具包",
    "minutes": 45,
    "lead": "从单文件脚本升级成包：`pyproject.toml`、`src/` 布局、`python -m` 入口、版本号。让你写的工具能被别人 pip 安装。",
    "sections": [
      {
        "h": "需求现场",
        "p": "你写了一个 `slugify` 工具，现在同事也想用。发文件太原始，目标是 `pip install .` 后能 `import mytool`，还能命令行运行 `mytool \"Hello World\"`。",
        "code": "",
        "output": "",
        "tip": "先想清楚“库”和“CLI”两个入口，再谈打包。"
      },
      {
        "h": "设计与数据流",
        "p": "目录：`pyproject.toml`、`src/mytool/__init__.py`、`src/mytool/cli.py`。`__init__` 暴露 `slugify`；`cli.py` 用 argparse；`[project.scripts]` 注册命令。",
        "code": "my-tool/\n├── pyproject.toml\n└── src/mytool/\n    ├── __init__.py\n    └── cli.py",
        "output": "pip install -e .\nmytool 'Hello World' -> hello-world",
        "tip": "src 布局能避免“在当前目录能 import、装完反而不能”的假象。"
      },
      {
        "h": "最小实现",
        "p": "`slugify` 转小写、去标点、空格转连字符；CLI 打印结果。`pyproject.toml` 写 name、version、requires-python、scripts。",
        "code": "def slugify(text):\n    text = re.sub(r'[^\\w\\s-]', '', text.lower())\n    return re.sub(r'[-\\s]+', '-', text).strip('-')\n# pyproject.toml\n[project]\nname = \"my-tool\"\nversion = \"0.1.0\"\n[project.scripts]\nmytool = \"mytool.cli:main\"",
        "output": "slugify('Hello, World!') -> 'hello-world'\nmytool --help -> 用法",
        "tip": "包名用连字符、模块名用下划线；两者不要混。"
      },
      {
        "h": "边界与错误",
        "p": "相对导入、循环导入、版本号写死、依赖未声明、Python 版本不兼容、安装后命令找不到。`pip install -e .` 失败先看 pyproject 的 build-system。",
        "code": "[build-system]\nrequires = [\"setuptools>=68\"]\nbuild-backend = \"setuptools.build_meta\"",
        "output": "缺少 build-system -> 安装报错",
        "tip": "打包错误先看构建后端，不要先怀疑代码。"
      },
      {
        "h": "验收与测试",
        "p": "在干净虚拟环境里 `pip install .`，跑 `python -c 'import mytool'` 和 `mytool 'Hello World'`；再跑 pytest。卸载后确认命令消失。",
        "code": "python -m venv .venv\n. .venv/bin/activate\npip install .\nmytool 'Hello World'",
        "output": "hello-world",
        "tip": "一定要在干净环境测；本机已装的依赖会掩盖缺失声明。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加类型标注、README、LICENSE、GitHub Actions 自动发布；再把版本号改成 `importlib.metadata.version` 读取。最后上传 TestPyPI 试一次。",
        "code": "",
        "output": "",
        "tip": "发布前先想清楚许可证和包名；PyPI 名字是全局唯一的。"
      }
    ],
    "points": [
      "src 布局避免导入假象。",
      "库入口和 CLI 入口分开。",
      "干净虚拟环境验证安装。"
    ],
    "practice": "搭一个 src 布局包，提供 slugify 和 mytool 命令，并在干净 venv 安装验证。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch9": {
    "id": "ch9-capstone",
    "title": "加餐：CSV 清洗与错误报告",
    "minutes": 45,
    "lead": "读一份脏 CSV：缺列、空值、日期格式乱、金额带货币符号。清洗能修的修，不能修的写进错误报告，不要静默丢弃。",
    "sections": [
      {
        "h": "需求现场",
        "p": "一份销售 CSV 有 1000 行，字段：date、sku、qty、price。常见脏数据：日期 `2026/1/5`、金额 `￥12.50`、qty 为空、多一列空字段。目标是输出干净 CSV 和一份 `errors.csv`。",
        "code": "",
        "output": "",
        "tip": "清洗的第一原则：可修复的修，不可修复的记录下来；不要悄悄删行。"
      },
      {
        "h": "设计与数据流",
        "p": "`csv.DictReader` 逐行读；每行经过 `clean_row` 返回 `(row, errors)`；干净行写输出，错误行写错误文件并附原因。最后打印统计：总数、成功、失败。",
        "code": "reader = csv.DictReader(f)\nfor lineno, row in enumerate(reader, start=2):\n    cleaned, errs = clean_row(row)\n    if errs:\n        errors.append({'line': lineno, 'reason': ';'.join(errs)})\n    else:\n        out.append(cleaned)",
        "output": "总行 1000，成功 970，失败 30",
        "tip": "行号从 2 开始，因为第 1 行是表头；排查时对得上。"
      },
      {
        "h": "最小实现",
        "p": "金额去掉 `￥`、逗号、空格再转 Decimal；日期用 `date.fromisoformat` 或 `strptime` 多格式尝试；qty 必须是非负整数。错误信息要包含字段名和原值。",
        "code": "from decimal import Decimal, InvalidOperation\ndef parse_money(s):\n    s = s.replace('￥', '').replace(',', '').strip()\n    return Decimal(s)\n# 失败抛 ValueError(f'price 非法: {s!r}')",
        "output": "parse_money('￥12.50') -> Decimal('12.50')",
        "tip": "金额用 Decimal，不要用 float；财务数据差一分钱都是 bug。"
      },
      {
        "h": "边界与错误",
        "p": "BOM、编码 gbk/utf-8、字段多一个逗号、引号里带逗号、空文件、只有表头、重复行。`csv` 模块能处理引号，但编码要自己指定。",
        "code": "with open(path, encoding='utf-8-sig', newline='') as f:\n    reader = csv.DictReader(f)",
        "output": "BOM 被去掉，表头正常",
        "tip": "Windows 导出的 CSV 常有 BOM；用 `utf-8-sig` 省事。"
      },
      {
        "h": "验收与测试",
        "p": "造一个 6 行小 CSV，覆盖正常、日期乱、金额带符号、qty 空、多列、引号逗号。断言成功数、错误数、错误行号和原因。",
        "code": "assert len(out) == 3\nassert errors[0]['line'] == 2\nassert 'qty' in errors[0]['reason']",
        "output": "通过：3 行成功，错误含 qty",
        "tip": "错误报告要断言行号和字段名，不然用户没法修。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加 schema 配置、批量文件、输出 Parquet；再用 pandas 的 `read_csv` 对照。最后做一个“修复建议”列，告诉用户原值应该改成什么。",
        "code": "",
        "output": "",
        "tip": "清洗规则要可配置；硬编码字段名，换一份表就失效。"
      }
    ],
    "points": [
      "能修则修，不能修写错误报告。",
      "金额用 Decimal，日期多格式解析。",
      "CSV 编码注意 BOM 和 gbk。"
    ],
    "practice": "实现 CSV 清洗器，输出干净文件 + errors.csv，统计成功/失败行数。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch10": {
    "id": "ch10-capstone",
    "title": "加餐：库存领域模型",
    "minutes": 45,
    "lead": "用 dataclass 建一个库存模型：商品、入库、出库、库存预警。把业务规则放在模型里，而不是散落在脚本里。",
    "sections": [
      {
        "h": "需求现场",
        "p": "小仓库要记录商品 SKU、名称、数量、安全库存。入库加数量，出库减数量但不能减成负数；低于安全库存要预警。要求可测试、可序列化。",
        "code": "",
        "output": "",
        "tip": "领域模型不是“数据库表的翻版”；它应该能表达业务规则。"
      },
      {
        "h": "设计与数据流",
        "p": "`Item` dataclass 保存 sku/name/qty/safe_qty；`receive` 和 `issue` 是方法，返回新对象或原地改？教学版用可变对象 + 明确方法，便于理解；生产可改不可变。",
        "code": "from dataclasses import dataclass, field\n@dataclass\nclass Item:\n    sku: str\n    name: str\n    qty: int = 0\n    safe_qty: int = 5",
        "output": "Item('A-1', '键盘', 10, 5)",
        "tip": "dataclass 自动生成 `__init__`、`__repr__`、`__eq__`，先用好这些。"
      },
      {
        "h": "最小实现",
        "p": "`receive(n)` 校验 n>0 后加；`issue(n)` 校验 n>0 且不超过库存；`is_low()` 返回 qty < safe_qty；`to_dict()` 用于 JSON。错误用 ValueError，信息带 SKU。",
        "code": "@dataclass\nclass Item:\n    sku: str\n    name: str\n    qty: int = 0\n    safe_qty: int = 5\n    def issue(self, n: int):\n        if n <= 0: raise ValueError('出库数量必须为正')\n        if n > self.qty: raise ValueError(f'{self.sku} 库存不足')\n        self.qty -= n",
        "output": "item.issue(3) -> qty=7\nitem.issue(99) -> ValueError 库存不足",
        "tip": "业务规则写在方法里，脚本只负责调用；这样 CLI/API 都能复用。"
      },
      {
        "h": "边界与错误",
        "p": "负数量、0、浮点、SKU 重复、安全库存为负、并发出库。多线程下“检查再减”不是原子操作，需要锁或数据库事务。",
        "code": "import threading\nlock = threading.Lock()\nwith lock:\n    item.issue(3)",
        "output": "并发下库存不会减成负数",
        "tip": "单机脚本也要知道竞态；库存是典型的“检查后执行”陷阱。"
      },
      {
        "h": "验收与测试",
        "p": "测入库、出库、库存不足、0/负数、预警边界（qty == safe_qty 不预警）、序列化。用 pytest.raises 断言错误信息包含 SKU。",
        "code": "assert Item('A', 'x', 5, 5).is_low() is False\nwith pytest.raises(ValueError, match='A'):\n    Item('A', 'x', 1).issue(2)",
        "output": "通过：等于安全库存不预警；错误含 SKU",
        "tip": "预警边界是 `<` 还是 `<=`，要用测试固定住。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加批次、保质期、库位、盘点、JSON 持久化；再用 `pydantic` 做校验版。最后把模型接到一个 FastAPI 接口，体会领域模型和 API schema 的分工。",
        "code": "",
        "output": "",
        "tip": "领域模型管规则，API schema 管传输；不要把两者混成一个类。"
      }
    ],
    "points": [
      "业务规则放进领域模型。",
      "出库先校验再扣减。",
      "预警边界用测试固定。"
    ],
    "practice": "实现 Item 的入库/出库/预警/序列化，覆盖库存不足和边界值。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch11": {
    "id": "ch11-capstone",
    "title": "加餐：可扩展的导出器",
    "minutes": 45,
    "lead": "同一批数据要导出 CSV、JSON、Markdown。用 ABC 或 Protocol 定义接口，让新增格式只加一个类，不改调用方。",
    "sections": [
      {
        "h": "需求现场",
        "p": "报表系统现在支持 CSV，下周要 JSON，下月要 Markdown。如果每个格式都写一堆 if，调用方会越来越臃肿。目标：一个 `export(rows, path, fmt)` 统一入口。",
        "code": "",
        "output": "",
        "tip": "先定义“导出器”的合同，再决定用 ABC 还是 Protocol。"
      },
      {
        "h": "设计与数据流",
        "p": "导出器接口：`name` 属性 + `export(rows, path)` 方法。注册表 `EXPORTERS = {'csv': CsvExporter(), ...}`。调用方按名字取导出器，不直接 import 具体类。",
        "code": "class Exporter(Protocol):\n    name: str\n    def export(self, rows: list[dict], path: str) -> None: ...",
        "output": "exporter.export(rows, 'out.csv')",
        "tip": "Protocol 只描述能力，不强制继承；ABC 更适合需要注册和阻止误用的场景。"
      },
      {
        "h": "最小实现",
        "p": "写 CSV、JSON、Markdown 三个类，共享一个 `_open(path)` 辅助。CSV 用 DictWriter，JSON 用 `json.dump`，Markdown 手写表头。注册表在模块底部组装。",
        "code": "class CsvExporter:\n    name = 'csv'\n    def export(self, rows, path):\n        with open(path, 'w', newline='', encoding='utf-8') as f:\n            writer = csv.DictWriter(f, fieldnames=rows[0].keys())\n            writer.writeheader(); writer.writerows(rows)",
        "output": "export(rows, 'out.csv', 'csv') -> 文件生成",
        "tip": "空 rows 没有 fieldnames；先处理空数据，再写表头。"
      },
      {
        "h": "边界与错误",
        "p": "未知格式、空数据、路径不存在、权限不足、字段不一致、编码。错误要区分“格式不支持”和“写入失败”，调用方才能决定重试还是提示。",
        "code": "if fmt not in EXPORTERS:\n    raise ValueError(f'不支持的格式: {fmt}')\nPath(path).parent.mkdir(parents=True, exist_ok=True)",
        "output": "未知格式 -> ValueError\n目录不存在 -> 自动创建",
        "tip": "格式错误和 IO 错误分开；不要把所有异常都包成 RuntimeError。"
      },
      {
        "h": "验收与测试",
        "p": "用同一组 rows 导出三种格式，断言文件存在、内容可被对应解析器读回、字段完整。再测空数据、未知格式、只读目录。",
        "code": "for fmt in ('csv', 'json', 'md'):\n    export(rows, f'out.{fmt}', fmt)\nassert json.load(open('out.json'))[0]['sku'] == 'A-1'",
        "output": "通过：三种格式可读回",
        "tip": "导出测试要“写出去再读回来”，只断言文件存在不够。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加 Excel、PDF 导出器，加插件式注册（entry points），加流式导出大文件。最后比较 ABC 和 Protocol 在类型检查、运行时行为上的差异。",
        "code": "",
        "output": "",
        "tip": "新增格式只加类、不改调用方，才算真正可扩展。"
      }
    ],
    "points": [
      "先定义导出器合同。",
      "注册表解耦调用方和具体类。",
      "空数据、未知格式要单独处理。"
    ],
    "practice": "实现 CSV/JSON/Markdown 三个导出器，统一 export(rows, path, fmt) 入口。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch12": {
    "id": "ch12-capstone",
    "title": "加餐：带类型与测试的利息计算器",
    "minutes": 45,
    "lead": "用 type hints、doctest、pytest 写一个复利计算器。让“算得对”和“说得清”同时成立。",
    "sections": [
      {
        "h": "需求现场",
        "p": "输入本金、年利率、年数、每年复利次数，输出到期金额。要求：参数有类型标注；非法利率/年数有明确错误；至少 6 组测试；文档里有可执行示例。",
        "code": "",
        "output": "",
        "tip": "类型标注不是装饰；它能在编辑器里提前暴露一半的低级错误。"
      },
      {
        "h": "设计与数据流",
        "p": "`compound(principal: float, rate: float, years: int, times: int = 1) -> float`。公式 `P * (1 + r/n) ** (n*t)`。先校验 `principal >= 0`、`rate >= 0`、`years >= 0`、`times > 0`。",
        "code": "def compound(principal: float, rate: float, years: int, times: int = 1) -> float:\n    ...",
        "output": "compound(1000, 0.05, 10, 1) -> 1628.89...",
        "tip": "参数顺序和默认值一旦公开，就是 API 合同；改之前先想兼容。"
      },
      {
        "h": "最小实现",
        "p": "用 Decimal 处理金额，最后量化到分；利率转 Decimal 字符串，避免 float 误差。返回值类型标注 `Decimal`。",
        "code": "from decimal import Decimal, ROUND_HALF_UP\ndef compound(principal, rate, years, times=1):\n    p = Decimal(str(principal)); r = Decimal(str(rate))\n    amount = p * (1 + r / times) ** (times * years)\n    return amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)",
        "output": "compound(1000, 0.05, 10) -> Decimal('1628.89')",
        "tip": "`Decimal(0.1)` 会带入 float 误差；用 `Decimal(str(x))`。"
      },
      {
        "h": "边界与错误",
        "p": "负本金、负利率、0 年、0 复利次数、超大指数溢出、字符串输入、NaN。`times=0` 会导致除零；`years` 是 float 时要明确是否允许。",
        "code": "if times <= 0: raise ValueError('times 必须为正整数')\nif principal < 0 or rate < 0 or years < 0: raise ValueError('参数不能为负')",
        "output": "times=0 -> ValueError",
        "tip": "边界校验放在函数入口，别等公式跑到一半才炸。"
      },
      {
        "h": "验收与测试",
        "p": "用 doctest 写两个例子，pytest 参数化测单利/复利/0 利率/0 本金/非法参数。金额断言用 Decimal 相等，不用 float 近似。",
        "code": "assert compound(1000, 0.05, 10) == Decimal('1628.89')\nwith pytest.raises(ValueError): compound(1000, -0.01, 10)",
        "output": "通过：6 组",
        "tip": "金额测试用精确 Decimal；float 的 `==` 会给你假通过。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加等额本息贷款、IRR、通货膨胀调整；用 `mypy` 检查类型；把公式和假设写进 docstring。最后做一个 Streamlit 小页面。",
        "code": "",
        "output": "",
        "tip": "金融计算先写假设，再写公式；否则用户不知道你算的是什么。"
      }
    ],
    "points": [
      "类型标注提前暴露错误。",
      "金额用 Decimal，不用 float。",
      "边界校验放在入口。"
    ],
    "practice": "实现 compound()，加 type hints、doctest、pytest，覆盖 6 组用例。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch13": {
    "id": "ch13-capstone",
    "title": "加餐：可发布的 CLI 项目",
    "minutes": 45,
    "lead": "从 pyproject 到 GitHub Actions：版本、依赖、入口、测试、构建、发布。把“能跑”升级成“别人能装”。",
    "sections": [
      {
        "h": "需求现场",
        "p": "你有一个命令行工具，想让同事 `pip install` 后直接用。需要：包元数据、入口点、README、测试、构建产物、发布流程。任何一步缺失，安装都会卡住。",
        "code": "",
        "output": "",
        "tip": "发布不是最后一条命令，而是一条可重复的流水线。"
      },
      {
        "h": "设计与数据流",
        "p": "项目结构：`src/`、`tests/`、`pyproject.toml`、`README.md`、`LICENSE`。构建用 `python -m build` 产 wheel 和 sdist；发布用 twine 或 GitHub Actions 的 trusted publishing。",
        "code": "dist/\n├── mytool-0.1.0-py3-none-any.whl\n└── mytool-0.1.0.tar.gz",
        "output": "build 成功 -> dist 两个文件",
        "tip": "先构建再发布；不要直接从源码目录 twine upload。"
      },
      {
        "h": "最小实现",
        "p": "pyproject 写全 name/version/description/readme/license/requires-python/dependencies/scripts；版本号只在一个地方；README 至少写安装、用法、示例。",
        "code": "[project]\nname = \"my-tool\"\nversion = \"0.1.0\"\ndescription = \"Slugify CLI\"\nreadme = \"README.md\"\nrequires-python = \">=3.10\"\ndependencies = []\n[project.scripts]\nmytool = \"mytool.cli:main\"",
        "output": "pip install dist/*.whl -> mytool 可用",
        "tip": "版本号不要同时写在 `__init__.py` 和 pyproject；用一个来源。"
      },
      {
        "h": "边界与错误",
        "p": "缺 README 导致构建失败、依赖没声明、wheel 里漏包、入口函数不存在、Python 版本不兼容、许可证缺失。构建后在干净 venv 安装，才能发现这些问题。",
        "code": "python -m build\npython -m venv /tmp/testenv\n/tmp/testenv/bin/pip install dist/*.whl\n/tmp/testenv/bin/mytool --help",
        "output": "干净环境安装成功 -> 入口可用",
        "tip": "wheel 要在干净环境测；本机 editable install 会掩盖漏包。"
      },
      {
        "h": "验收与测试",
        "p": "CI 矩阵跑 3.10/3.11/3.12，执行 pytest、mypy、build；再检查 wheel 内容 `unzip -l`。发布前打 tag，版本号与 tag 一致。",
        "code": "python -m pytest\npython -m mypy src\npython -m build\nunzip -l dist/*.whl",
        "output": "全部通过 -> 可发布",
        "tip": "CI 里不要只跑测试；构建和安装也要跑。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加 pre-commit、ruff、coverage、签名、TestPyPI 预发布；再写一个 `Makefile` 把常用命令收口。最后读一遍 PEP 621 和 packaging 指南。",
        "code": "",
        "output": "",
        "tip": "发布流程要能在一台新机器上复现；只在你电脑上能发不算。"
      }
    ],
    "points": [
      "pyproject 是项目合同。",
      "构建后在干净环境安装验证。",
      "CI 要覆盖测试、类型、构建。"
    ],
    "practice": "搭一个可发布 CLI：pyproject、src、tests、README，构建 wheel 并在干净 venv 安装。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch14": {
    "id": "ch14-capstone",
    "title": "加餐：API 健康检查与重试",
    "minutes": 45,
    "lead": "调用第三方 API 时，超时、429、5xx 都可能发生。写一个带超时、重试、退避和错误分类的客户端。",
    "sections": [
      {
        "h": "需求现场",
        "p": "天气 API 偶尔超时，偶尔返回 429。要求：单次请求 3 秒超时；最多重试 2 次；429 按 `Retry-After` 等待；4xx 不重试；最终失败给用户可读提示。",
        "code": "",
        "output": "",
        "tip": "先把错误分类，再决定重试策略；不是所有失败都值得重试。"
      },
      {
        "h": "设计与数据流",
        "p": "`get_json(url, timeout=3, retries=2)`：循环尝试；捕获 `TimeoutError`/`HTTPError`；按状态码分类；退避用 `time.sleep` 或异步 sleep。返回解析后的 JSON。",
        "code": "for attempt in range(retries + 1):\n    try:\n        with urllib.request.urlopen(url, timeout=timeout) as r:\n            return json.load(r)\n    except urllib.error.HTTPError as e:\n        if e.code < 500 and e.code != 429:\n            raise",
        "output": "200 -> JSON\n404 -> 立即抛错\n500 -> 重试",
        "tip": "4xx 是请求本身有问题，重试不会变好；429 是限流，要按服务端提示等。"
      },
      {
        "h": "最小实现",
        "p": "写 `classify(err)` 返回 `retryable/ fatal/ wait`；`Retry-After` 可能是秒数也可能是日期，先支持秒数。每次重试记录 attempt 和等待时间。",
        "code": "def backoff(attempt):\n    return min(2 ** attempt, 8)\n# 429 优先用 Retry-After，否则 backoff",
        "output": "第 1 次等 1s，第 2 次等 2s，最多 8s",
        "tip": "退避要设上限；无限增长会让用户等到崩溃。"
      },
      {
        "h": "边界与错误",
        "p": "DNS 失败、SSL 错误、响应不是 JSON、空 body、重定向、代理、时钟。超时要同时覆盖连接和读取；`urlopen` 的 timeout 不是总时长。",
        "code": "try:\n    data = json.loads(body)\nexcept json.JSONDecodeError:\n    raise ValueError('响应不是合法 JSON')",
        "output": "非 JSON -> ValueError",
        "tip": "错误分类要保留原始异常链 `raise ... from e`，排查时能看到根因。"
      },
      {
        "h": "验收与测试",
        "p": "用本地 mock server 或 `unittest.mock` 测：200 成功、500 两次后成功、404 不重试、429 等待、超时。断言调用次数和总等待时间。",
        "code": "with mock.patch('urllib.request.urlopen', side_effect=[HTTPError(...500), fake_ok]):\n    assert get_json(url)['ok']",
        "output": "通过：调用 2 次",
        "tip": "重试测试要断言调用次数；否则看不出策略有没有生效。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加异步 aiohttp 版本、连接池、缓存、熔断、指标上报；再用 `tenacity` 库重写，比较手写和库的差异。最后给用户一个“服务暂不可用，请稍后再试”的友好提示。",
        "code": "",
        "output": "",
        "tip": "生产客户端还要有熔断和可观测性；只会重试是不够的。"
      }
    ],
    "points": [
      "先分类错误，再决定重试。",
      "429 看 Retry-After，5xx 才退避。",
      "超时要覆盖连接和读取。"
    ],
    "practice": "实现 get_json，支持超时、重试、429 等待、4xx 快速失败，并用 mock 验证调用次数。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch15": {
    "id": "ch15-capstone",
    "title": "加餐：销售 CSV 分析报告",
    "minutes": 45,
    "lead": "用 pandas 读销售数据，做月度汇总、品类占比、Top 商品，并导出 Excel 和图表。把“分析”落成可重复的脚本。",
    "sections": [
      {
        "h": "需求现场",
        "p": "每个月都要出一份销售报告：总销售额、环比、品类占比、Top 10 商品、每日趋势图。手工 Excel 太慢，目标是一条命令生成 Excel + PNG。",
        "code": "",
        "output": "",
        "tip": "先固定输入字段和输出文件，再写分析；否则每次口径都不一样。"
      },
      {
        "h": "设计与数据流",
        "p": "读 CSV → 类型转换 → 派生字段（月份、销售额）→ groupby 汇总 → 写 Excel 多 sheet → 画趋势图。所有中间表都保留，方便复核。",
        "code": "df = pd.read_csv(path, parse_dates=['date'])\ndf['amount'] = df['qty'] * df['price']\nmonthly = df.groupby(df['date'].dt.to_period('M'))['amount'].sum()",
        "output": "monthly -> 2026-10 120000\n2026-11 150000",
        "tip": "金额先算出来再 groupby；不要在每个聚合里重复乘。"
      },
      {
        "h": "最小实现",
        "p": "用 `pd.ExcelWriter` 写多个 sheet：raw、monthly、category、top_products。用 `matplotlib` 画月度趋势，注意中文字体和负号显示。",
        "code": "with pd.ExcelWriter('report.xlsx') as writer:\n    df.to_excel(writer, sheet_name='raw', index=False)\n    monthly.to_excel(writer, sheet_name='monthly')\n    category.to_excel(writer, sheet_name='category')",
        "output": "report.xlsx 含 4 个 sheet",
        "tip": "Excel writer 要指定引擎；openpyxl 是常用选择。"
      },
      {
        "h": "边界与错误",
        "p": "日期解析失败、金额为字符串、qty 缺失、空表、重复行、时区、Excel 行数上限。`parse_dates` 失败会变成 NaT，后续 groupby 会丢数据。",
        "code": "df['date'] = pd.to_datetime(df['date'], errors='coerce')\nbad_dates = df['date'].isna().sum()",
        "output": "非法日期 -> NaT，计数后报告",
        "tip": "解析错误要显式统计；`errors='coerce'` 不是让你忽略。"
      },
      {
        "h": "验收与测试",
        "p": "用 10 行固定数据手算月度总额、品类占比、Top 1；断言 Excel sheet 名和行数；再测空表、坏日期、缺列。",
        "code": "assert monthly.loc['2026-11'] == 150000\nassert set(sheets) == {'raw','monthly','category','top_products'}",
        "output": "通过：月度 150000，4 个 sheet",
        "tip": "分析脚本的测试用小数数据；大数据只做冒烟。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加同比/环比、地区维度、预算对比、异常检测；用 plotly 做交互图；把脚本包成 CLI。最后用 DuckDB 对比 pandas 的内存和速度。",
        "code": "",
        "output": "",
        "tip": "报表要可复现：输入、脚本、输出三件套一起存档。"
      }
    ],
    "points": [
      "先固定字段和输出，再分析。",
      "日期/金额解析错误要统计。",
      "Excel 多 sheet 保留中间表。"
    ],
    "practice": "实现销售报告脚本，输出 Excel 四个 sheet 和月度趋势图，并用 10 行数据断言。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch16": {
    "id": "ch16-capstone",
    "title": "加餐：批量文件整理机器人",
    "minutes": 45,
    "lead": "用 pathlib 扫描下载目录，按类型、日期、项目归档，重名自动加序号，生成整理日志。别写死路径。",
    "sections": [
      {
        "h": "需求现场",
        "p": "下载文件夹里有 500 个文件：图片、PDF、压缩包、重复命名。目标：按 `图片/文档/压缩包/其他` 分类；同名文件加 `_1`；生成 CSV 日志记录原路径和新路径。",
        "code": "",
        "output": "",
        "tip": "批量操作先做 dry-run；直接移动 500 个文件，出错很难回滚。"
      },
      {
        "h": "设计与数据流",
        "p": "`scan(root)` 返回文件列表；`classify(path)` 按后缀返回类别；`unique_target(dir, name)` 处理重名；`move(src, dst)` 执行并记录。dry-run 只打印计划。",
        "code": "from pathlib import Path\nfor p in Path(root).rglob('*'):\n    if p.is_file():\n        ...",
        "output": "扫描到 500 个文件\n计划移动 480，跳过 20",
        "tip": "用 `rglob('*')` 递归；注意跳过目标目录，避免自己搬自己。"
      },
      {
        "h": "最小实现",
        "p": "后缀映射表；目标目录按类别创建；重名用 `stem_1.suffix` 递增；日志用 csv.writer 写 `src,dst,status`。移动用 `shutil.move`，跨盘也能用。",
        "code": "def unique_target(dir, name):\n    target = dir / name\n    stem, suffix = target.stem, target.suffix\n    i = 1\n    while target.exists():\n        target = dir / f'{stem}_{i}{suffix}'\n        i += 1\n    return target",
        "output": "a.txt 已存在 -> a_1.txt",
        "tip": "重名判断用 `exists()`，不要靠时间戳；并发下仍可能冲突。"
      },
      {
        "h": "边界与错误",
        "p": "隐藏文件、符号链接、只读文件、路径过长、跨盘移动、目标目录在源目录内、权限不足、文件正在被占用。每个失败单独记录，不中断整批。",
        "code": "try:\n    shutil.move(str(src), str(dst))\n    status = 'moved'\nexcept OSError as e:\n    status = f'failed: {e}'",
        "output": "单个失败 -> 记录并继续",
        "tip": "批量任务要“部分成功”模型；一个失败不能毁掉整批。"
      },
      {
        "h": "验收与测试",
        "p": "在临时目录造 6 个文件：两类、重名、隐藏、只读、目标已存在。先 dry-run 断言计划，再真实移动断言结果和日志。最后清理临时目录。",
        "code": "with tempfile.TemporaryDirectory() as tmp:\n    ...\nassert log_rows[0]['status'] == 'moved'",
        "output": "通过：6 个文件按计划归档",
        "tip": "文件测试必须用临时目录；不要拿真实下载目录练手。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加配置文件、按 EXIF 日期归档、重复文件哈希去重、撤销模式；再用 `watchdog` 监听目录自动整理。最后加一个进度条。",
        "code": "",
        "output": "",
        "tip": "自动化要先能撤销；没有 undo 的整理工具很危险。"
      }
    ],
    "points": [
      "批量操作先 dry-run。",
      "重名加序号，失败单独记录。",
      "临时目录测试，不碰真实文件。"
    ],
    "practice": "实现文件整理器：扫描、分类、重名处理、dry-run、CSV 日志，并用临时目录验证。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch17": {
    "id": "ch17-capstone",
    "title": "加餐：并发下载器",
    "minutes": 45,
    "lead": "用 ThreadPoolExecutor 下载 20 个文件，限制并发、显示进度、失败重试。理解 I/O 密集任务为什么适合线程。",
    "sections": [
      {
        "h": "需求现场",
        "p": "有一批图片 URL 要下载到本地。串行 20 个太慢；开 20 个线程又可能被限流。目标：最多 4 个并发，失败重试 1 次，最后输出成功/失败清单。",
        "code": "",
        "output": "",
        "tip": "I/O 等待时线程能让出 GIL；CPU 密集才考虑多进程。"
      },
      {
        "h": "设计与数据流",
        "p": "`download(url, path)` 用 `urllib.request` 流式写文件；`ThreadPoolExecutor(max_workers=4)` 提交任务；`as_completed` 收集结果；失败任务重试一次。",
        "code": "with ThreadPoolExecutor(max_workers=4) as pool:\n    futures = {pool.submit(download, u, p): u for u, p in jobs}\n    for fut in as_completed(futures):\n        ...",
        "output": "20 个任务，4 个并发，全部完成",
        "tip": "线程池的 `max_workers` 是并发上限，不是任务总数。"
      },
      {
        "h": "最小实现",
        "p": "下载先写临时文件，成功后再 `os.replace` 原子替换，避免半截文件。进度用 `completed/total` 打印。失败重试包一层 `retry`。",
        "code": "def download(url, path):\n    tmp = path.with_suffix(path.suffix + '.part')\n    with urllib.request.urlopen(url, timeout=10) as r, open(tmp, 'wb') as f:\n        shutil.copyfileobj(r, f)\n    os.replace(tmp, path)",
        "output": "成功 -> path 存在\n失败 -> .part 被清理",
        "tip": "先写 .part 再原子替换；断点续传和半截文件是下载器常见坑。"
      },
      {
        "h": "边界与错误",
        "p": "404、超时、磁盘满、文件名非法、重定向、SSL、重复 URL、线程安全。多个线程写同一个日志要加锁，或每个任务返回结果由主线程统一打印。",
        "code": "if not path.parent.exists():\n    path.parent.mkdir(parents=True, exist_ok=True)\ntry:\n    ...\nfinally:\n    tmp.unlink(missing_ok=True)",
        "output": "磁盘/网络失败 -> 清理临时文件",
        "tip": "finally 里清理临时文件；异常路径也要收尾。"
      },
      {
        "h": "验收与测试",
        "p": "用本地 HTTP server 提供 10 个小文件，测全部成功、一个 404、超时重试、并发峰值 ≤4。断言文件内容和数量。",
        "code": "assert len(list(out_dir.iterdir())) == 9\nassert peak <= 4",
        "output": "通过：9 个成功，1 个失败，峰值 4",
        "tip": "下载测试用本地 server，不要依赖外网。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加断点续传、进度条 tqdm、异步 aiohttp 版本、限速、校验和。最后比较线程、进程、异步三种方案在 I/O 任务上的差异。",
        "code": "",
        "output": "",
        "tip": "并发不是越多越好；根据目标站点限流和本机带宽调整。"
      }
    ],
    "points": [
      "I/O 密集适合线程池。",
      "先写临时文件再原子替换。",
      "失败清理和重试要设计。"
    ],
    "practice": "实现并发下载器：4 并发、失败重试、进度、成功/失败清单，并用本地 server 测试。",
    "source": "本章加餐 · 工程实战工作坊"
  },
  "ch18": {
    "id": "ch18-capstone",
    "title": "加餐：综合项目复盘：游泳成绩报表",
    "minutes": 45,
    "lead": "把前面 17 章的技能串起来：读 CSV、清洗、按年龄组排名、生成 Excel/图表、写测试、打包 CLI。重点是拆解和验收，不是堆代码。",
    "sections": [
      {
        "h": "需求现场",
        "p": "俱乐部给出一份游泳比赛 CSV：姓名、性别、年龄、项目、成绩（秒）、犯规标记。要生成报表：各项目前三名、年龄组排名、犯规名单、班级总分。输出 Excel 和 Markdown。",
        "code": "",
        "output": "",
        "tip": "综合项目先画数据流，不要直接打开编辑器就写。"
      },
      {
        "h": "设计与数据流",
        "p": "阶段一：读取与校验；阶段二：清洗（去犯规、成绩转秒）；阶段三：分组排名；阶段四：导出；阶段五：测试。每个阶段一个模块，CLI 只做参数解析和编排。",
        "code": "read.csv → validate → clean → rank → export\n         ↘ errors.csv",
        "output": "输入 200 行 -> 有效 180，犯规 20\n输出 3 个 sheet + 1 个 md",
        "tip": "先让每个阶段能单独运行，再串起来；综合项目最怕一锅炖。"
      },
      {
        "h": "最小实现",
        "p": "核心排名函数 `rank(rows, key)` 用 `sorted` + `groupby`；成绩统一转 float 秒；同成绩并列名次要用同排名。导出复用第 11 章的导出器思路。",
        "code": "def rank(rows, key):\n    out = []\n    for group, items in groupby(sorted(rows, key=key), key=key):\n        for i, row in enumerate(items, 1):\n            out.append({**row, 'rank': i})\n    return out",
        "output": "每组第一 -> rank=1\n同成绩 -> 需要并列处理",
        "tip": "`groupby` 前必须排序；并列名次不能简单用 enumerate。"
      },
      {
        "h": "边界与错误",
        "p": "犯规、缺赛、成绩格式 `1:02.35`、同名、年龄组边界、空项目、编码、Excel 公式注入。导出 CSV 时，单元格以 `=` 开头要转义。",
        "code": "def parse_time(s):\n    if ':' in s:\n        m, sec = s.split(':')\n        return int(m) * 60 + float(sec)\n    return float(s)",
        "output": "1:02.35 -> 62.35",
        "tip": "时间格式要先归一化；混着字符串和秒数排序一定错。"
      },
      {
        "h": "验收与测试",
        "p": "用 10 行固定数据覆盖：正常、犯规、缺赛、并列、时间格式。断言排名、犯规名单、班级总分。再做一次端到端：临时 CSV 进，Excel/MD 出。",
        "code": "assert report['rank'][0]['rank'] == 1\nassert report['fouls'] == ['张三']\nassert Path('out.xlsx').exists()",
        "output": "通过：排名/犯规/文件生成",
        "tip": "综合项目测试要有一组端到端；只测函数发现不了接线错误。"
      },
      {
        "h": "新手加练与扩展",
        "p": "加年龄组、接力项目、破纪录标记、历史对比、Web 页面；用 pytest-cov 看覆盖率；把 CLI 打成 wheel。最后写一份 README，让别人能复现你的报表。",
        "code": "",
        "output": "",
        "tip": "综合项目的交付物是“可复现的流程”，不是一堆脚本。"
      }
    ],
    "points": [
      "先画数据流，再分阶段实现。",
      "时间/成绩先归一化。",
      "端到端测试验证接线。"
    ],
    "practice": "实现游泳成绩报表：清洗、排名、犯规名单、Excel/Markdown 导出，并用 10 行数据端到端测试。",
    "source": "本章加餐 · 工程实战工作坊"
  }
};
(function () {
  var chapters = window.PY_FOUNDATIONS_CHAPTERS || [];
  var addons = window.PY_FOUNDATIONS_CAPSTONES || {};
  for (var i = 0; i < chapters.length; i += 1) {
    var addon = addons[chapters[i].id];
    if (addon) chapters[i].lessons.push(addon);
  }
})();

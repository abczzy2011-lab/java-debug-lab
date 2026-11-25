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

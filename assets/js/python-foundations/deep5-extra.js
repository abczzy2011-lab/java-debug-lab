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

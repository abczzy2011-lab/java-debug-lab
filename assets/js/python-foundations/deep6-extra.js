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

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

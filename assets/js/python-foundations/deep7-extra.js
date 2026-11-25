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

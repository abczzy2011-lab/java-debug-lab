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

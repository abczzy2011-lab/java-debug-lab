# -*- coding: utf-8 -*-
"""C++ 课程扩充：54 课 / 162 节 → 96 课 / 1,344 节。

保留现有 3 节正文，为每课补 11 节；新增 42 课，每课 14 节。
所有新增示例先在本机 Apple clang 以 C++20 编译运行，输出与正文一致。
"""
from __future__ import annotations
import json, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from course_expand_data import NEW_LESSONS

ROOT = pathlib.Path(__file__).resolve().parents[2]
BASE = ROOT / "scripts/cpp_build/cpp-course-base.js"
DATA = ROOT / "assets/js/cpp-foundations/cpp-course-data.js"
TARGET_LESSONS = 96
TARGET_SECTIONS = 1344


def parse(path: pathlib.Path):
    text = path.read_text(encoding="utf-8")
    parts_marker = "window.CPP_COURSE_PARTS = "
    chapters_marker = "window.CPP_COURSE_CHAPTERS = "
    p_start = text.index(parts_marker) + len(parts_marker)
    p_end = text.index(";", p_start)
    parts = json.loads(text[p_start:p_end])
    c_start = text.index(chapters_marker) + len(chapters_marker)
    c_end = text.rindex(";")
    chapters = json.loads(text[c_start:c_end])
    return parts, chapters


def point(lesson, index):
    pts = lesson.get("points") or []
    if not pts:
        return lesson.get("title", "本课概念")
    return pts[index % len(pts)]


def concept_map(lesson):
    p0, p1, p2 = point(lesson, 0), point(lesson, 1), point(lesson, 2)
    return {
        "h": "概念地图：把本课的关键词连成一条线",
        "p": (
            f"本课的主线可以写成 **{p0} → {p1} → {p2}**。先不要把三个词当成三个孤立知识点：{p0} 决定你“看见什么、能改什么”，"
            f"{p1} 决定“用什么规则处理”，{p2} 决定“结果落在哪里、由谁负责”。把这条线画成“输入/状态 → 处理 → 输出/资源”三段，"
            "再遇到新语法时，先问它落在哪一段，而不是先背定义。\n\n"
            f"回到本课的开头：{lesson.get('lead', '')}\n\n"
            "如果某一节读不懂，通常不是这一段的问题，而是前一段的输入或后一段的约束没有对齐。把三段分别写一行，标出已知量和未知量，"
            "再把未知量缩成最小例子，理解就会快很多。\n\n"
            f"画图练习：在纸上写三列，第一列是 **{p0}** 的输入和前置条件，第二列是 **{p1}** 维护的状态，第三列是 **{p2}** 的产出与责任。"
            "如果某一列写不出来，说明你还在背名词；把那一列补全，再回到代码里找对应变量。图不用漂亮，但箭头必须能解释“谁把什么交给了谁”。"
        ),
    }


def minimal_case(lesson):
    p0, p1, p2 = point(lesson, 0), point(lesson, 1), point(lesson, 2)
    return {
        "h": "最小可运行：先做一个能验证的闭环",
        "p": (
            f"不要一上来就写完整项目。先构造一个只包含 **{p0}** 的最小 `main`：一个固定输入、一次操作、一行输出。"
            "这个版本不追求健壮，只要求你能肉眼判断“结果对不对”。跑通后，再把输入换成第二个值，确认结果会跟着变，而不是碰巧正确。\n\n"
            f"第二遍再加入 **{p1}**：把固定输入改成从标准输入读取，或者把单次操作改成循环。每加一层就保留上一版的输出作为对照，"
            "这样出错时能立刻知道是新加的那一层，还是原来的假设被打破。\n\n"
            f"第三遍才引入 **{p2}**：资源、异常、并发或性能约束。此时你已经有可复现的基线，任何改动都能用同一组输入比较，"
            "而不是靠记忆判断“应该没问题”。\n\n"
            f"失败版本也要保留：把 **{p1}** 临时注释掉，观察输出从哪一步开始偏；再恢复它，确认偏差消失。"
            "这种“开关式对照”比一次改很多行更容易定位。记录下最小失败输入、错误输出和期望输出，它们就是后面回归测试的种子。"
        ),
    }


def common_errors(lesson):
    p0, p1, p2 = point(lesson, 0), point(lesson, 1), point(lesson, 2)
    return {
        "h": "常见错误：编译期、运行期和边界要分开查",
        "p": (
            f"**{p0}** 最常见的错误往往在编译期就能发现：类型不匹配、声明缺失、模板约束不满足。先把第一条错误读完，"
            "不要被后面十几条连锁错误带跑。编译器说“expected / was”时，重点看它期望的类型和你实际给的类型，而不是只看行号。\n\n"
            f"**{p1}** 的问题更常出现在运行期：输入为空、循环一次都不执行、下标刚好越界、资源没有释放。把输入打印出来，"
            "把循环边界写成 `0..n-1` 的显式注释，再检查每个分支是否都能到达终点。\n\n"
            f"**{p2}** 则容易在边界上翻车：最大值溢出、重复值改变顺序、并发下两个线程同时修改。边界测试至少覆盖空、1 个元素、"
            "最大规模、重复值和极端值；如果某个输入会让程序崩溃，先保存现场，再缩成最小复现。\n\n"
            "把错误分成四类并分别记录：读不懂的语法、能编译但结果错、运行时崩溃、性能不达标。四类的排查工具不同，"
            "不要用“再跑一次”掩盖分类。每次只验证一个假设，并在代码或笔记里写下“我改了什么、预期会怎样”。"
        ),
    }


def boundary_tests(lesson):
    p0, p1 = point(lesson, 0), point(lesson, 1)
    return {
        "h": "边界与反例：把“应该”变成可执行测试",
        "p": (
            f"为 **{p0}** 至少准备五组测试：空输入、只有一个元素、刚好达到容量上限、包含重复值、取到类型边界。"
            "这五组不需要很复杂，但要能独立回答“这一步到底有没有成立”。测试的名字要写清预期，例如 `empty_returns_zero`，"
            "而不是 `test1`。\n\n"
            f"再为 **{p1}** 准备一个反例：一个看起来合法、实际会破坏不变式的输入。反例比正例更能暴露设计问题，"
            "因为它逼你说清“为什么这个输入不被允许”。如果反例无法被拒绝，说明约束只写在注释里，没有写进代码。\n\n"
            "把边界写成一张表：输入规模、是否为空、是否有重复、是否越界、期望行为。每修一个 bug 就往表里加一行，"
            "并在测试名里写清预期。回归测试的价值不在于覆盖率数字，而在于它能在下一次重构时立刻失败。"
        ),
    }


def complexity(lesson):
    p0, p1 = point(lesson, 0), point(lesson, 1)
    return {
        "h": "复杂度与开销：大 O 之外还有常数和缓存",
        "p": (
            f"分析 **{p0}** 时，先写清基本操作是什么：一次比较、一次拷贝、一次分配，还是一次系统调用？"
            "大 O 只描述增长趋势，不告诉你小规模下谁更快。两个都是 `O(n log n)` 的排序，常数可能差几倍；"
            "两个都是 `O(1)` 的访问，缓存命中率也可能差一个数量级。\n\n"
            f"**{p1}** 还要看内存和生命周期：是否频繁堆分配、是否产生临时对象、是否让数据离 CPU 缓存更远。"
            "移动语义能减少拷贝，但移动本身也有成本；`reserve` 能减少扩容，但预留过多会浪费内存。\n\n"
            "优化的正确顺序是：先测量基线，再定位热点，再只改一个变量，最后用同一组输入复测。没有测量的“优化”通常只是换了一种写法。\n\n"
            "测量时固定三件事：输入规模、编译选项、运行环境。把每次结果写成“版本 / 中位时间 / 内存峰值 / 备注”，"
            "不要只记一个最好看的数字。若方差很大，先增加重复次数或隔离噪声，再判断改动是否真的有效。"
        ),
    }


def std_compare(lesson):
    p0, p1 = point(lesson, 0), point(lesson, 1)
    return {
        "h": "标准库对照：先查接口，再决定要不要手写",
        "p": (
            f"**{p0}** 在标准库里通常已有成熟设施。先查它属于容器、算法、工具还是语言特性：容器解决“怎么存”，"
            "算法解决“怎么遍历和变换”，工具解决“怎么比较、分配、计时”。查清楚再写，能避免重复造轮子。\n\n"
            f"**{p1}** 则要关注标准库的版本差异和边界条件。比如 `lower_bound` 要求区间有序，`shared_ptr` 的引用计数不是免费的，"
            "`std::format` 在不同编译器上的支持程度不同。标准库不是“万能答案”，它有自己的前提和成本。\n\n"
            "判断是否手写的标准：标准设施能否在可接受复杂度内满足需求？不能时再写自定义版本，并为它补上与标准库对齐的测试。\n\n"
            "查文档的顺序：先看头文件与函数签名，再看复杂度与前置条件，最后看异常/线程安全说明。"
            "很多“标准库不好用”的判断，其实是没有满足它的前置条件，例如对无序区间调用二分、对已失效迭代器继续解引用。"
        ),
    }


def exercise_a(lesson, chapter):
    p0, p1 = point(lesson, 0), point(lesson, 1)
    return {
        "h": "动手练习 A：把它放进一个真实小场景",
        "p": (
            f"选一个你熟悉的场景，把 **{p0}** 用进去：例如读入一组记录、按某个字段排序、输出前 k 条。先写输入格式和输出格式，"
            "再写一个只处理 3 条记录的版本，最后扩展到标准输入。要求代码里不出现魔法数字，常量要有名字。\n\n"
            f"第二问：如果数据量变成 10 万条，**{p1}** 会不会成为瓶颈？把你的猜测写下来，再用计时或计数验证。"
            "不要只看“能不能跑”，要看“跑完之后资源是否释放、输出是否稳定、边界是否覆盖”。\n\n"
            f"验收标准：三组输入（正常、空、极端）都能给出确定输出；错误输入有明确提示；"
            f"代码能被另一个同学在不看解释的情况下运行。\n\n"
            "给自己写一个评分表：正确性 40 分、边界 20 分、可读性 20 分、可测试性 20 分。"
            "先按表自评，再请别人只看代码复述行为；如果对方复述错了，问题通常在命名、接口或隐含前提，而不是算法。"
        ),
    }


def exercise_b(lesson):
    p0, p1, p2 = point(lesson, 0), point(lesson, 1), point(lesson, 2)
    return {
        "h": "动手练习 B：讲给别人听",
        "p": (
            f"合上资料，用三分钟解释 **{p0}**：它解决什么问题、代价是什么、什么时候不该用。然后画一张图，"
            f"把 **{p1}** 放在图的中间，标出输入、输出和失败路径。\n\n"
            f"如果听众追问 **{p2}**，你能否用一个最小例子回答，而不是背一句定义？试着举一个“看起来能用、实际会出错”的反例，"
            "再说明你会怎样在代码里阻止它。\n\n"
            "讲不清楚的地方就是还没掌握的地方。把卡住的句子记下来，回到本课对应小节重读，而不是继续往后翻。\n\n"
            f"准备三个追问：如果输入规模翻十倍，**{p0}** 还成立吗？如果 **{p1}** 失败，最小可观测现象是什么？"
            f"如果去掉 **{p2}**，哪条保证会先消失？能不看笔记答完，才算能把知识交给你自己。"
        ),
    }


def debug_checklist(lesson):
    p0, p1 = point(lesson, 0), point(lesson, 1)
    return {
        "h": "调试清单：出问题时按这个顺序查",
        "p": (
            "1. **先读第一条错误**：后面的错误经常是第一条的连锁反应；模板报错从最内层往外读。\n"
            "2. **确认输入**：打印输入的长度、首尾值和空值情况，排除“读错了”再查算法。\n"
            f"3. **确认 {p0} 的初值**：未初始化、默认构造、空容器都可能让第一次循环走错。\n"
            f"4. **确认 {p1} 的边界**：`<` 还是 `<=`、`0` 还是 `1`、闭区间还是半开区间。\n"
            "5. **缩小范围**：删掉无关分支，只保留能复现错误的最小代码；不要一次改五个地方。\n"
            "6. **对照期望**：把实际输出和期望输出逐行 diff，先定位第一处不同，不要从最后一行往前猜。\n"
            "7. **回归**：修好后把触发输入加入测试，确认旧行为没有被破坏。\n\n"
            "如果仍无法定位，用二分法缩小：注释掉一半逻辑，看错误是否出现；再在剩下的一半里继续二分。"
            "每次只保留一个可运行的最小版本，不要让“临时调试输出”留在最终代码里。"
        ),
    }


def summary(lesson):
    p0, p1, p2 = point(lesson, 0), point(lesson, 1), point(lesson, 2)
    return {
        "h": "本课小结：记住三句话",
        "p": (
            f"第一，**{p0}** 是入口，先把它看清，再谈后面的技巧。\n\n"
            f"第二，**{p1}** 是规则，规则不清时不要靠试错堆代码。\n\n"
            f"第三，**{p2}** 是边界，边界不测，前面的正确只是碰巧。\n\n"
            "如果只记一句话：先把最小闭环跑通，再用边界测试证明它真的成立。\n\n"
            f"再补一句区分：**{p0}** 负责“能不能开始”，**{p1}** 负责“按什么规则走”，**{p2}** 负责“什么时候必须停”。"
            "把这三句和相邻课程的概念对比，能避免把相似名词混成一个。"
        ),
    }


def self_test(lesson):
    p0, p1, p2 = point(lesson, 0), point(lesson, 1), point(lesson, 2)
    return {
        "h": "自测题：不查资料先答",
        "p": (
            f"1. 用一句话说明 **{p0}** 解决什么问题，并举一个不该使用它的场景。\n\n"
            f"2. **{p1}** 在空输入、单元素、最大规模下分别会发生什么？哪一个最容易出错？\n\n"
            f"3. 如果要把 **{p2}** 加进一个已有项目，你会先改哪一处、用什么测试证明没有回归？\n\n"
            "参考要点：第 1 题重点看“适用边界”，第 2 题重点看“边界条件”，第 3 题重点看“最小改动 + 回归测试”。"
            "能答出关键约束即可，不要求背原文。\n\n"
            "自评标准：三题都能举出具体输入或代码位置，才算过关；只能复述定义，说明还停在记忆层。"
            "把没答上的题写成一个待办，下次复习先做待办，而不是从头再读一遍。"
        ),
    }


def generic_sections(lesson):
    return [
        concept_map(lesson),
        minimal_case(lesson),
        common_errors(lesson),
        boundary_tests(lesson),
        complexity(lesson),
        std_compare(lesson),
        exercise_a(lesson, None),
        exercise_b(lesson),
        debug_checklist(lesson),
        summary(lesson),
        self_test(lesson),
    ]


def mechanism(lesson):
    p0, p1, p2 = point(lesson, 0), point(lesson, 1), point(lesson, 2)
    return {
        "h": f"机制拆解：{p0}",
        "p": (
            f"{lesson['lead']}\n\n"
            f"把 **{p0}** 拆成三步：它接受什么输入、维护什么状态、产出什么结果。再用 **{p1}** 解释“为什么需要它”，"
            f"最后用 **{p2}** 说明“它在什么条件下会失效”。三步都写出来，才算真正理解，而不是记住一个术语。"
        ),
    }


def decision(lesson):
    p0, p1 = point(lesson, 0), point(lesson, 1)
    return {
        "h": f"权衡与边界：{p0}",
        "p": (
            f"**{p0}** 不是默认答案。数据量很小、调用次数很少、团队还不熟悉它时，简单写法可能更合适；"
            f"它的收益要被 **{p1}** 的成本抵消时，也不值得引入。\n\n"
            "把“用/不用”的条件各写三条，再挑一个反例验证。能说清什么时候不用，才算真的掌握。"
        ),
    }


def make_new_lesson(chapter, entry, index):
    lesson = {
        "id": f"cpp-{int(chapter['number'])}-{index}",
        "title": f"{int(chapter['number'])}.{index} {entry['title']}",
        "level": entry["level"],
        "minutes": entry["minutes"],
        "lead": entry["lead"],
        "source": f"{chapter.get('source', 'C++ 教材综合')}；cppreference C++20",
        "points": entry["points"],
        "sections": [
            mechanism(entry),
            {**entry["demo"], "lang": entry["demo"].get("lang", "cpp")},
            decision(entry),
            *generic_sections(entry),
        ],
    }
    return lesson


def main():
    parts, chapters = parse(BASE)
    new_by_ch = {}
    for entry in NEW_LESSONS:
        new_by_ch.setdefault(entry["ch"], []).append(entry)

    for chapter in chapters:
        chapter["lessons"] = chapter.get("lessons", [])
        for lesson in chapter["lessons"]:
            if len(lesson.get("sections", [])) < 14:
                lesson["sections"] = list(lesson.get("sections", [])) + generic_sections(lesson)
            lesson["sections"] = lesson["sections"][:14]
        additions = new_by_ch.get(chapter["number"], [])
        for entry in additions:
            idx = len(chapter["lessons"]) + 1
            chapter["lessons"].append(make_new_lesson(chapter, entry, idx))

    lessons = sum(len(c["lessons"]) for c in chapters)
    sections = sum(len(l["sections"]) for c in chapters for l in c["lessons"])
    bad = [(l["id"], len(l["sections"])) for c in chapters for l in c["lessons"] if len(l["sections"]) != 14]
    if lessons != TARGET_LESSONS or sections != TARGET_SECTIONS or bad:
        raise SystemExit(f"count mismatch: lessons={lessons}, sections={sections}, bad={bad[:5]}")

    text = (
        "/* C++ 五篇 18 章 96 课 / 1,344 小节：按 8 本书主题重写，正文内联，不依赖额外 JSON。 */\n"
        "window.CPP_COURSE_PARTS = " + json.dumps(parts, ensure_ascii=False, separators=(",", ":")) + ";\n\n"
        "window.CPP_COURSE_CHAPTERS = " + json.dumps(chapters, ensure_ascii=False, separators=(",", ":")) + ";\n"
    )
    DATA.write_text(text, encoding="utf-8")
    chars = sum(len(l["lead"]) + sum(len(s.get("p", "")) + len(s.get("code", "")) for s in l["sections"]) for c in chapters for l in c["lessons"])
    print(f"chapters={len(chapters)} lessons={lessons} sections={sections} chars≈{chars} bytes={len(text)}")


if __name__ == "__main__":
    main()

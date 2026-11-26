#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Build the nine remaining full-stack course pages and their lesson data."""
from __future__ import annotations

import json
import re
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))

from fullstack_curriculum import MODULES  # noqa: E402

VERSION = '20261126z83'
OUT_DATA = ROOT / 'assets/js/fullstack-courses'
OUT_SUBJECTS = ROOT / 'subjects'
OUT_CSS = ROOT / 'assets/css/fullstack-course.css'

OPENERS = [
    '真正卡住人的，通常不是命令本身，而是不知道它站在链路的哪一层。',
    '这一课不先讲大道理，先把一个最小动作跑通，再回头解释它为什么有效。',
    '如果只看教程，你会以为这一步是线性操作；放进项目后，它其实有输入、有边界、有失败路径。',
    '工程能力不是“记住更多”，而是遇到陌生报错时，知道先看哪一层、先排除什么。',
    '把概念放进一次真实请求或一次真实提交，抽象的词才会变成可检查的证据。',
    '先承认一件事：看不懂往往不是智力问题，而是缺少一张能定位问题的地图。'
]
WHYS = [
    '先画边界：它前面依赖「{prev}」，后面会把结果交给「{next}」。',
    '先在纸上写清输入、输出和失败条件，再打开终端或编辑器，能省掉一半返工。',
    '不要把它当成孤立步骤。它和「{prev}」「{next}」共同构成一条可复现的链路。',
    '判断有没有学会，不看能不能复述定义，而看能不能在陌生环境里重现结果。',
    '这一步做对，后面的错误会变得可解释；这一步含糊，后面只能靠猜。',
    '把问题缩小到一个变量、一条命令或一个请求，先拿到确定的结果。'
]
LAB_INTROS = [
    '下面这段实验只验证一个点，不要同时改项目里的十个地方。',
    '在一个临时目录或最小请求里做单点实验，先让输出可预测，再谈接入。',
    '实验的目的不是“跑通一次”，而是让你能重复跑、能解释每一行、能故意弄坏它。',
    '先把命令原样执行一遍，再只改一个参数重跑；差异就是最好的教材。',
    '这段代码可以直接复制，但复制完要逐行读；看不懂的行，先停下来查清楚。',
    '不要跳过输出。终端里的每一行都在告诉你，系统实际做了什么。'
]
OBSERVES = [
    '看输出时不要只找“成功”两个字，要确认退出码、关键字段和错误信息是否一致。',
    '如果结果和预期不同，按输入、环境、权限、网络、版本五个方向逐个排除。',
    '先保存一次正确输出作为基线，再改一个变量；没有基线，优化和回归都无从谈起。',
    '遇到报错先读第一行和最后一行：第一行常常是触发点，最后一行才是根因。',
    '把命令、输入、输出和版本一起记进笔记，下一次复现会快很多。',
    '不要用“我感觉好了”验收；用一个可重复的命令或断言，把结果钉住。'
]
PROJECT_BRIDGES = [
    '现在把实验结果搬回项目。先决定它属于哪一层、由谁调用、失败时返回什么。',
    '接进项目时不要复制一大段代码，先接最小路径，再补一条失败路径。',
    '项目里真正需要的是可维护的接线：配置、日志、错误码和一条能回归的测试。',
    '把实验变成一个项目能力，标准是别人换一台机器也能按 README 跑出来。',
    '接入不是“加一行”，而是把输入校验、成功路径、失败路径和观测点一起补齐。',
    '先写清楚这段能力在项目中的位置，再动手；否则代码会变成下一任维护者的谜题。'
]
BOUNDARIES = [
    '最常见的反例不是不会用，而是用过头：把调试开关带进生产、把临时脚本当正式流程。',
    '边界要写清楚：什么情况下该用、什么情况下不该用、失败后如何回滚。',
    '这一步的坑通常不在主路径，而在空值、超时、权限、并发和重复提交。',
    '如果一个操作无法解释“失败时会发生什么”，它就还不算工程能力。',
    '不要用一个成功案例证明稳定；至少准备一个反例，确认系统会正确拒绝。',
    '越接近生产，越要把“方便”让位给“可追踪、可回滚、可验证”。'
]
ACCEPTS = [
    '本章验收：{deliver}。做不到就回到实验重做，不要用“我看过了”代替“我跑过了”。',
    '交付标准不是截图，而是别人能按你的步骤复现；命令、输入、输出和失败提示都要留下。',
    '把这项能力接进课程社区，并留下一条可复查的证据：测试、日志、截图或 README。',
    '验收时先跑成功路径，再故意制造一个失败，确认错误信息足够定位问题。',
    '如果换一台机器、换一个账号还能跑通，这项能力才算真正属于项目。',
    '最后用一句话写清“它解决了什么问题、代价是什么、什么情况下会失效”。'
]


def js(value):
    return json.dumps(value, ensure_ascii=False)


def clean(text: str) -> str:
    return re.sub(r'\s+', ' ', text).strip()


def build_lesson(module, chapter, chapter_index, lesson_index, chapter_prev, chapter_next):
    topic = chapter['topics'][lesson_index]
    prev_topic = chapter['topics'][lesson_index - 1] if lesson_index > 0 else chapter_prev
    next_topic = chapter['topics'][lesson_index + 1] if lesson_index < 4 else chapter_next
    seed = (module['index'] * 53 + chapter_index * 7 + lesson_index) % len(OPENERS)
    why = WHYS[seed]
    goal = chapter['goals'][lesson_index % len(chapter['goals'])]
    lead = (
        f"{OPENERS[seed]}这一课只处理「{chapter['title']}」里的一个具体动作：**{topic}**。"
        f"你会先做一次最小实验，再把它接进{module['project']}，最后用一个反例确认自己真的能解释结果。"
    )
    sections = [
        {
            'h': '先把问题放回真实项目',
            'p': (
                f"{OPENERS[seed]}这一章的主题是「{chapter['title']}」，而本课聚焦 **{topic}**。"
                f"{chapter['summary']}\n\n"
                + why.format(prev=prev_topic, next=next_topic)
                + f" 本课的目标很具体：{goal} 如果这三件事说不清，代码即使跑通也只是碰巧。"
            )
        },
        {
            'h': f"最小实验：把「{topic}」跑一遍",
            'p': (
                f"{LAB_INTROS[seed]}这次实验只围绕 **{topic}**，先让输出可预测，再谈接进项目。"
                f"执行时把命令、版本和当前目录一起记下来；否则下次复现时，你会分不清是代码变了还是环境变了。"
            ),
            'code': chapter['lab'],
            'output': chapter['output'],
            'tip': chapter['pitfall']
        },
        {
            'h': '接进课程社区：从能跑变成能交付',
            'p': (
                f"{PROJECT_BRIDGES[seed]}在{module['project']}里，**{topic}** 不是一个演示动作，"
                f"而是要被写进配置、代码、文档或测试的一项能力。先接最小成功路径，再补空值、超时、权限和重复提交。\n\n"
                f"这一步做完，项目里至少要留下一个可复查的痕迹：一条日志、一个测试、一段 README 或一个错误码。"
                f"如果什么都没留下，下一次出问题时，你仍然只能靠记忆。"
            )
        },
        {
            'h': '边界、反例与本章验收',
            'p': (
                f"{BOUNDARIES[seed]}具体到 **{topic}**，尤其要检查：{chapter['pitfall']}\n\n"
                + ACCEPTS[seed].format(deliver=chapter['deliver'])
            )
        }
    ]
    points = [
        clean(chapter['summary'])[:96],
        f"本课能把「{topic}」放回一次真实请求或一次真实提交，而不是只会背定义。",
        f"失败时先检查：{clean(chapter['pitfall'])[:88]}",
        f"交付证据：{clean(chapter['deliver'])[:96]}"
    ]
    practice = (
        f"用课程社区完成一次「{topic}」的最小实验，并把命令、输出和失败提示写进 README 或测试。"
        f"验收线：{chapter['deliver']}"
    )
    return {
        'id': f"{module['id']}-{chapter_index + 1}-{lesson_index + 1}",
        'title': f"{chapter['number']}.{lesson_index + 1} {topic}",
        'minutes': 40 + (lesson_index % 3) * 5,
        'lead': lead,
        'source': module['source'],
        'sections': sections,
        'points': points,
        'practice': practice
    }


def build_chapter(module, chapter, chapter_index):
    chapter.setdefault('number', chapter_index + 1)
    prev_title = module['chapters'][chapter_index - 1]['title'] if chapter_index > 0 else '上一章的验收'
    next_title = module['chapters'][chapter_index + 1]['title'] if chapter_index < 9 else '毕业项目'
    lessons = [
        build_lesson(module, chapter, chapter_index, i, prev_title, next_title)
        for i in range(5)
    ]
    return {
        'id': f"{module['id']}-ch{chapter_index + 1:02d}",
        'part': chapter_index // 2 + 1,
        'number': chapter['number'],
        'title': chapter['title'],
        'summary': chapter['summary'],
        'goals': chapter['goals'],
        'source': module['source'],
        'lessons': lessons
    }


def module_config(module, chapters):
    return {
        'chapters': chapters,
        'partMeta': {
            str(i + 1): {'title': part['title'], 'note': part['note']}
            for i, part in enumerate(module['parts'])
        },
        'storageKey': f"{module['id']}Course.progress.v1",
        'lastKey': f"{module['id']}Course.lastLesson.v1",
        'lessonUnit': '课',
        'languageLabel': module['languageLabel'],
        'kicker': module['kicker'],
        'overviewTitle': module['title'],
        'overviewSub': module['overviewSub'],
        'materialLabel': module['materialLabel'],
        'outcomes': module['outcomes'],
        'apiHref': f"./fullstack.html?v={VERSION}#module-{module['id']}",
        'apiLabel': '查看全栈科目位置',
        'routeNote': module['routeNote'],
        'overviewDocTitle': f"{module['title']} · 五篇 10 章 50 课",
        'lessonDocSuffix': module['title'],
        'defaultSource': module['source'],
        'sourceNote': module['sourceNote'],
        'emptyMessage': f"{module['title']}课程数据未载入。请检查 assets/js/fullstack-courses/{module['id']}.js。"
    }


HTML_TEMPLATE = '''<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#071018">
<script src="../assets/js/reader-theme.js?v=20261125z72"></script>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="mobile-web-app-capable" content="yes">
<title>{title} · 五篇 10 章 50 课</title>
<meta name="description" content="{title}：五篇 10 章 50 课，从最小实验到课程社区项目交付，覆盖{topics}。">
<link rel="icon" type="image/png" href="../assets/icons/fullstack.png">
<link rel="stylesheet" href="../assets/css/database-reader.css?v=20261127z79">
<link rel="stylesheet" href="../assets/css/fullstack-course.css?v={version}">
<link rel="stylesheet" href="../assets/css/liquid-glass.css?v=20261125z51b">
<link rel="stylesheet" href="../assets/css/reader-theme.css?v=20261125z72">
</head>
<body class="fs-course" style="--fs-accent:{accent}">
<header class="subbar">
  <a class="home" href="./fullstack.html?v={version}#module-{id}" aria-label="返回全栈路线"><span aria-hidden="true">←</span>全栈路线</a>
  <div class="brand"><span class="fs-logo" aria-hidden="true">{logo}</span><b>{title}</b></div>
  <div class="spacer"></div>
  <div class="progress-pill"><i aria-hidden="true"></i><span id="topProgress">0 / 50</span></div>
  <button class="theme-toggle" id="themeToggle" type="button" aria-label="切换到浅色主题" title="切换到浅色主题"><span class="theme-icon" aria-hidden="true">☀</span><span class="theme-text">浅色</span></button>
  <button class="nav-toggle" id="navToggle" type="button" aria-expanded="false" aria-controls="sidebar"><span aria-hidden="true">☰</span>目录</button>
</header>
<div class="scrim" id="scrim" hidden></div>
<div class="shell">
  <aside class="sidebar" id="sidebar" aria-label="课程目录">
    <div class="side-head">
      <div class="part">{kicker}</div>
      <h1>{sidebarTitle}</h1>
      <p>{sidebarNote}</p>
      <div class="progress" aria-label="学习进度"><div class="bar"><i id="sideBar"></i></div><span id="sideCount">0 / 50 已完成</span></div>
    </div>
    <nav id="courseNav"></nav>
    <div class="side-foot"><b>五篇路线：</b>{routeNote} 进度保存在本机。</div>
  </aside>
  <main class="content" id="content"><div class="panel"><div class="empty">正在载入课程数据…</div></div></main>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
<script src="../assets/js/fullstack-courses/{id}.js?v={version}"></script>
<script src="../assets/js/course-reader.js?v=20261125z71"></script>
<script>window.CourseReader.start(window.FS_COURSE_CFG);</script>
</body>
</html>
'''

CSS = '''/* Full-stack course reader accents. Base layout lives in database-reader.css. */
body.fs-course{
  --accent: var(--fs-accent);
  --amber: var(--fs-accent);
  --mint: var(--fs-accent);
  background:
    radial-gradient(52% 42% at 12% 0%, color-mix(in srgb, var(--fs-accent) 10%, transparent), transparent 62%),
    radial-gradient(42% 38% at 94% 6%, rgba(167,139,250,.06), transparent 64%),
    linear-gradient(180deg,#071018 0%,#06110F 48%,#040B0A 100%);
}
body.fs-course .subbar{
  background: radial-gradient(70% 160% at 12% 0%, color-mix(in srgb, var(--fs-accent) 12%, transparent), transparent 64%), linear-gradient(180deg,rgba(12,24,40,.9),rgba(7,14,27,.95));
}
body.fs-course .home,body.fs-course .progress-pill,body.fs-course .ch-no{ border-color: color-mix(in srgb, var(--fs-accent) 34%, transparent); }
body.fs-course .home{ background: linear-gradient(115deg, color-mix(in srgb, var(--fs-accent) 14%, transparent), color-mix(in srgb, var(--fs-accent) 5%, transparent)); }
body.fs-course .home:hover{ background: linear-gradient(115deg, color-mix(in srgb, var(--fs-accent) 24%, transparent), color-mix(in srgb, var(--fs-accent) 9%, transparent)); }
body.fs-course .progress-pill{ background: color-mix(in srgb, var(--fs-accent) 8%, transparent); }
body.fs-course .progress-pill i,body.fs-course .bar i,body.fs-course .les.active::before{ background: var(--fs-accent); box-shadow: 0 0 10px color-mix(in srgb, var(--fs-accent) 50%, transparent); }
body.fs-course .part,body.fs-course .kicker{ color: var(--fs-accent); }
body.fs-course .side-head{ background: radial-gradient(90% 100% at 0% 0%, color-mix(in srgb, var(--fs-accent) 9%, transparent), transparent 68%); }
body.fs-course .hero-box{ border-color: color-mix(in srgb, var(--fs-accent) 24%, transparent); background: radial-gradient(62% 100% at 12% 0%, color-mix(in srgb, var(--fs-accent) 13%, transparent), transparent 66%), radial-gradient(42% 80% at 95% 10%, rgba(167,139,250,.09), transparent 68%),linear-gradient(145deg,rgba(28,28,22,.72),rgba(9,14,22,.86)); }
body.fs-course .hero-box h1{ background: linear-gradient(105deg,#FFFFFF 4%,#F3EFE6 44%,var(--fs-accent) 78%,#FFF8C4 100%); -webkit-background-clip:text; background-clip:text; }
body.fs-course .btn{ border-color: color-mix(in srgb, var(--fs-accent) 38%, transparent); background: linear-gradient(115deg, color-mix(in srgb, var(--fs-accent) 18%, transparent), color-mix(in srgb, var(--fs-accent) 6%, transparent)); }
body.fs-course .btn:hover{ border-color: color-mix(in srgb, var(--fs-accent) 60%, transparent); background: linear-gradient(115deg, color-mix(in srgb, var(--fs-accent) 27%, transparent), color-mix(in srgb, var(--fs-accent) 10%, transparent)); }
body.fs-course .les:hover{ background: color-mix(in srgb, var(--fs-accent) 7%, transparent); }
body.fs-course .les.active{ background: linear-gradient(90deg, color-mix(in srgb, var(--fs-accent) 15%, transparent), color-mix(in srgb, var(--fs-accent) 4%, transparent)); }
body.fs-course .ch-head:hover{ background: color-mix(in srgb, var(--fs-accent) 7%, transparent); }
body.fs-course .lesson h2,body.fs-course .lesson h3,body.fs-course .lesson h4{ border-color: color-mix(in srgb, var(--fs-accent) 20%, transparent); }
body.fs-course .callout,body.fs-course .tip{ border-color: color-mix(in srgb, var(--fs-accent) 30%, transparent); }
body.fs-course .fs-logo{ display:grid; place-items:center; flex:none; width:27px; height:27px; border-radius:9px; border:1px solid color-mix(in srgb, var(--fs-accent) 42%, transparent); background: color-mix(in srgb, var(--fs-accent) 12%, transparent); color:#FFF8E7; font-family:var(--mono); font-size:9px; font-weight:900; letter-spacing:-.04em; }
@media (max-width:640px){
  body.fs-course .brand b{ max-width:46vw; }
  body.fs-course .fs-logo{ width:24px; height:24px; font-size:8px; }
}
'''


def main():
    OUT_DATA.mkdir(parents=True, exist_ok=True)
    total_lessons = 0
    for module in MODULES:
        chapters = [build_chapter(module, ch, i) for i, ch in enumerate(module['chapters'])]
        cfg = module_config(module, chapters)
        payload = (
            '/* ' + module['title'] + ' · 五篇 10 章 50 课。由 build_fullstack_courses.py 生成。 */\n'
            'window.FS_COURSE_CFG = ' + json.dumps(cfg, ensure_ascii=False, indent=2) + ';\n'
        )
        (OUT_DATA / f"{module['id']}.js").write_text(payload, encoding='utf-8')
        html = HTML_TEMPLATE.format(
            version=VERSION,
            title=module['title'],
            topics='、'.join(module['topics']),
            id=module['id'],
            logo=module['logo'],
            accent=module['accent'],
            kicker=module['kicker'],
            sidebarTitle=module['sidebarTitle'],
            sidebarNote=module['sidebarNote'],
            routeNote=module['routeNote']
        )
        (OUT_SUBJECTS / f"{module['id']}-course.html").write_text(html, encoding='utf-8')
        total_lessons += 50
        print(f"{module['id']}: 50 lessons / {len(json.dumps(cfg, ensure_ascii=False))} chars JSON")
    OUT_CSS.write_text(CSS, encoding='utf-8')
    print(f"TOTAL new lessons: {total_lessons}")


if __name__ == '__main__':
    main()

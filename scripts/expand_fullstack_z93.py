#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""把 50 课生产专修接入 10 个全栈科目，并同步页面/首页统计。"""
from __future__ import annotations

import json
import re
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / 'scripts'))

from fullstack_advanced import ADVANCED  # noqa: E402

VERSION = '20261127z93n'
DATA_DIR = ROOT / 'assets/js/fullstack-courses'
SUBJECTS = ROOT / 'subjects'

MODULE_META = {
    'foundation': ('工程基础与 Git', 'foundation-course.html'),
    'network': ('计算机网络与 HTTP', 'network-course.html'),
    'database': ('数据库系统与数据建模', 'database-course.html'),
    'backend': ('后端工程', 'backend-course.html'),
    'frontend': ('前端工程', 'frontend-course.html'),
    'api-auth': ('API 设计与身份认证', 'api-auth-course.html'),
    'testing': ('测试与质量', 'testing-course.html'),
    'devops': ('DevOps 与云部署', 'devops-course.html'),
    'security-performance': ('安全、性能与架构', 'security-performance-course.html'),
    'capstone': ('全栈项目实战', 'capstone-course.html'),
}

ORDER = ['foundation', 'network', 'database', 'backend', 'frontend', 'api-auth', 'testing', 'devops', 'security-performance', 'capstone']


def clean(text):
    return re.sub(r'\s+', ' ', text).strip()


def chapter_number(mid):
    return '20' if mid == 'database' else '11'


def lesson_id(mid, i):
    if mid == 'database':
        return f'db-20-{i + 1}'
    return f'{mid}-11-{i + 1}'


def build_chapter(mid, data_source=None):
    adv = ADVANCED[mid]
    title = MODULE_META[mid][0]
    chapter = {
        'id': ('db-ch20' if mid == 'database' else f'{mid}-ch11'),
        'part': 6,
        'number': chapter_number(mid),
        'title': adv['title'],
        'summary': adv['summary'],
        'goals': adv['goals'],
        'source': data_source or '生产工程实践',
        'lessons': [],
    }
    for i, lesson in enumerate(adv['lessons']):
        topic = re.sub(r'^\d+\.\d+\s*', '', lesson['title'])
        lead = (
            f"{lesson['hook']} 这一课只处理「{adv['title']}」里的一个具体动作：**{topic}**。"
            f"先做一次最小实验，再把它接进{adv['project']}，最后用一个反例确认自己真的能解释结果。"
        )
        sections = [
            {
                'h': '生产环境为什么会卡在这里',
                'p': (
                    f"{lesson['hook']}\n\n{adv['summary']} 本课聚焦 **{topic}**，"
                    f"目标不是背概念，而是能说清它的输入、输出、失败条件和可复查证据。"
                ),
            },
            {
                'h': f'最小实验：{topic}',
                'p': (
                    '先只改一个变量，把输出跑成可预测的基线；不要同时动项目里的十个地方。'
                    '执行时把命令、版本和当前目录一起记下来，否则下次复现会分不清是代码变了还是环境变了。'
                ),
                'code': lesson['lab'],
                'output': lesson['output'],
                'tip': lesson['tip'],
            },
            {
                'h': '接进课程社区：从能跑变成能交付',
                'p': (
                    f"{adv['bridge']}\n\n具体到 **{topic}**，它不是一段演示代码，"
                    '而是要写进配置、代码、文档或测试的一项能力。先接最小成功路径，再补失败路径、观测点和回滚方式。'
                ),
            },
            {
                'h': '边界、反例与验收',
                'p': (
                    f"反例先记住：{lesson['tip']}\n\n"
                    f"本章验收：{lesson['deliver'].rstrip('。')}。做不到就回到实验重做，不要用“我看过了”代替“我跑过了”。"
                ),
            },
        ]
        points = [
            clean(adv['summary'])[:96],
            f"能把「{topic}」放回一次真实请求、一次发布或一次故障复盘，而不是只会背定义。",
            f"失败时先检查：{clean(lesson['tip'])[:88]}",
            f"交付证据：{clean(lesson['deliver'])[:96]}",
        ]
        practice = (
            f"在{adv['project']}中完成一次「{topic}」的最小实验，并把命令、输出和失败提示写进 README 或测试。"
            f"验收线：{lesson['deliver']}"
        )
        chapter['lessons'].append({
            'id': lesson_id(mid, i),
            'title': lesson['title'],
            'minutes': 60,
            'lead': lead,
            'source': data_source or '生产工程实践',
            'sections': sections,
            'points': points,
            'practice': practice,
        })
    return chapter


def load_js(path, var_name):
    text = path.read_text(encoding='utf-8')
    marker = f'window.{var_name} = '
    body = text[text.index(marker) + len(marker):].strip()
    if body.endswith(';'):
        body = body[:-1]
    return json.loads(body), text


def dump_js(path, var_name, data, comment):
    payload = '/* ' + comment + ' */\n' + f'window.{var_name} = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n'
    path.write_text(payload, encoding='utf-8')


def update_course_data():
    for mid in ORDER:
        if mid == 'database':
            continue
        path = DATA_DIR / f'{mid}.js'
        data, _ = load_js(path, 'FS_COURSE_CFG')
        if any(ch.get('number') == 11 for ch in data['chapters']):
            raise SystemExit(f'{mid} already has chapter 11')
        chapter = build_chapter(mid, data.get('defaultSource'))
        data['chapters'].append(chapter)
        data['partMeta']['6'] = {'title': ADVANCED[mid]['part_title'], 'note': ADVANCED[mid]['part_note']}
        data['routeNote'] = data['routeNote'].rstrip('。') + f" → 11 {ADVANCED[mid]['title']}与生产交付。"
        data['overviewDocTitle'] = f"{MODULE_META[mid][0]} · 六篇 11 章 55 课"
        data['apiHref'] = f"./fullstack.html?v={VERSION}#module-{mid}"
        data['kicker'] = data['kicker'].replace('FIVE PARTS', 'SIX PARTS')
        dump_js(path, 'FS_COURSE_CFG', data, f"{MODULE_META[mid][0]} · 六篇 11 章 55 课。由 fullstack_advanced.py 生成。")
        print('updated', mid, len(data['chapters']), sum(len(c['lessons']) for c in data['chapters']))


def update_database():
    app_path = ROOT / 'assets/js/database-foundations/db-course-app.js'
    app = app_path.read_text(encoding='utf-8')
    if 'db-ch20' in app:
        raise SystemExit('database already has chapter 20')
    chapter = build_chapter('database', 'PostgreSQL 16 文档、SQL 标准与数据库工程实践')
    payload = (
        'window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];\n'
        'window.DATABASE_COURSE_CHAPTERS.push('
        + json.dumps(chapter, ensure_ascii=False, indent=2)
        + ');\n'
    )
    (ROOT / 'assets/js/database-foundations/db-ch20.js').write_text(payload, encoding='utf-8')

    old = "      5: { title: '工程化与毕业项目', note: 'ORM、迁移、连接池、N+1、Redis、备份恢复、权限与学习社区项目' }\n"
    new = old + f"      ,6: {{ title: '{ADVANCED['database']['part_title']}', note: '{ADVANCED['database']['part_note']}' }}\n"
    app = app.replace(old, new)
    app = app.replace("overviewDocTitle: '数据库系统与数据建模 · 五篇 19 章 58 课'",
                      "overviewDocTitle: '数据库系统与数据建模 · 六篇 20 章 63 课'")
    app = app.replace("apiHref: './fullstack.html?v=20261126z83#module-database'",
                      f"apiHref: './fullstack.html?v={VERSION}#module-database'")
    app = app.replace("第 17–19 章完成工程化、缓存、备份与毕业项目。",
                      "第 17–19 章完成工程化、缓存、备份与毕业项目；第 20 章进入查询计划、复制延迟、分区热键与 PITR。")
    app = app.replace("kicker: 'DATABASE · Full Course · Five Parts'",
                      "kicker: 'DATABASE · Full Course · Six Parts'")
    app = app.replace("emptyMessage: '数据库课程数据未载入。请检查 assets/js/database-foundations/ 下的五个分篇文件。'",
                      "emptyMessage: '数据库课程数据未载入。请检查 assets/js/database-foundations/ 下的分章文件。'")
    app_path.write_text(app, encoding='utf-8')
    print('updated database', chapter['number'], len(chapter['lessons']))


def update_course_pages():
    for mid in ORDER:
        page = SUBJECTS / MODULE_META[mid][1]
        text = page.read_text(encoding='utf-8')
        if mid == 'database':
            text = text.replace('五篇 19 章 58 课', '六篇 20 章 63 课')
            text = text.replace('0 / 58', '0 / 63')
            text = text.replace('58 课', '63 课')
            text = text.replace('五篇路线：', '六篇路线：')
            text = text.replace('FIVE PARTS', 'SIX PARTS')
            text = text.replace('毕业项目。进度保存在本机。', '毕业项目 → 20 生产专修：查询计划、复制与容量。 进度保存在本机。')
            text = text.replace('db-course-app.js?v=20261126z83', f'db-course-app.js?v={VERSION}')
            text = text.replace('db-ch19.js?v=20261126z83"></script>',
                                f'db-ch19.js?v=20261126z83"></script>\n<script src="../assets/js/database-foundations/db-ch20.js?v={VERSION}"></script>')
        else:
            text = text.replace('五篇 10 章 50 课', '六篇 11 章 55 课')
            text = text.replace('0 / 50', '0 / 55')
            text = text.replace('50 课', '55 课')
            text = text.replace('五篇路线：', '六篇路线：')
            text = text.replace('FIVE PARTS', 'SIX PARTS')
            text = text.replace('。 进度保存在本机。',
                                f"。 → 11 生产专修：{ADVANCED[mid]['title']}。 进度保存在本机。")
            text = text.replace('foundation.js?v=20261126z83', f'foundation.js?v={VERSION}')
            text = text.replace(f'{mid}.js?v=20261126z83', f'{mid}.js?v={VERSION}')
        text = text.replace('fullstack-course.css?v=20261126z83', f'fullstack-course.css?v={VERSION}')
        page.write_text(text, encoding='utf-8')
        print('page', page.name)


def update_track():
    path = ROOT / 'assets/js/fullstack/fullstack-data.js'
    text = path.read_text(encoding='utf-8')
    text = text.replace('10 个大科目、4 个阶段、508 课全部上线', '10 个大科目、4 个阶段、558 课全部上线')
    text = text.replace("version: '20261126z85'", f"version: '{VERSION}'")
    text = text.replace("statusLabel: '50 课已上线 · 五篇 10 章'", "statusLabel: '55 课已上线 · 六篇 11 章'")
    text = text.replace("statusLabel: '58 课已上线 · 五篇 19 章'", "statusLabel: '63 课已上线 · 六篇 20 章'")
    text = text.replace('lessons: 50, chapters: 10', 'lessons: 55, chapters: 11')
    text = text.replace('lessons: 58, chapters: 19', 'lessons: 63, chapters: 20')
    text = text.replace('?v=20261126z83', f'?v={VERSION}')
    path.write_text(text, encoding='utf-8')
    print('track updated', VERSION)


def update_fullstack_page():
    path = SUBJECTS / 'fullstack.html'
    text = path.read_text(encoding='utf-8')
    text = text.replace('数据库 5 篇 19 章 58 课，其余 9 科各 5 篇 10 章 50 课',
                        '数据库 6 篇 20 章 63 课，其余 9 科各 6 篇 11 章 55 课')
    text = text.replace('10 大科目 · 508 课 · 4 阶段', '10 大科目 · 558 课 · 4 阶段')
    text = text.replace('10 大科目 · 508 课 · 9 条毕业验收', '10 大科目 · 558 课 · 9 条毕业验收')
    text = text.replace('<b id="statLessons">508</b>', '<b id="statLessons">558</b>')
    text = text.replace('10 个科目共 508 课', '10 个科目共 558 课')
    text = text.replace('共 508 课', '共 558 课')
    text = text.replace('fullstack-data.js?v=20261126z85', f'fullstack-data.js?v={VERSION}')
    text = text.replace('fullstack-app.js?v=20261126z85', f'fullstack-app.js?v={VERSION}')
    text = text.replace('fullstack.css?v=20261126z85', f'fullstack.css?v={VERSION}')
    path.write_text(text, encoding='utf-8')
    print('fullstack page updated')


def update_home():
    for name in ['index.html', 'java-debug-lab.html']:
        path = ROOT / name
        text = path.read_text(encoding='utf-8')
        text = text.replace('共 508 课（数据库 5 篇 19 章 58 课，其余 9 科各 5 篇 10 章 50 课）',
                            '共 558 课（数据库 6 篇 20 章 63 课，其余 9 科各 6 篇 11 章 55 课）')
        text = text.replace('10 个全栈大科目（508 课全部上线）', '10 个全栈大科目（558 课全部上线）')
        text = text.replace('共 508 课', '共 558 课')
        text = text.replace('fullstack-data.js?v=20261126z85', f'fullstack-data.js?v={VERSION}')
        text = text.replace('fullstack-entry.js?v=20261126z85', f'fullstack-entry.js?v={VERSION}')
        path.write_text(text, encoding='utf-8')
        print('home updated', name)


if __name__ == '__main__':
    update_course_data()
    update_database()
    update_course_pages()
    update_track()
    update_fullstack_page()
    update_home()

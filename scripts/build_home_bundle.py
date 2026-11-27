#!/usr/bin/env python3
"""把首页 5.6 MB 的内联应用脚本外置成可缓存的 home-bundle.js。

做两件事：
1. 从 index.html / java-debug-lab.html 抽出首屏那个巨型内联 <script>；
2. 把 4,979 个类型的 JAPI 兜底索引缩成常用类型小表，完整索引仍由页面在
   打开 API 文档时懒加载。

外置脚本使用 defer，HTML 从约 5.7 MB 降到约 0.1 MB，首屏不必等 5 MB
脚本解析完才出现内容；两份首页保持字节一致。
"""
from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HTML_FILES = [ROOT / "index.html", ROOT / "java-debug-lab.html"]
BUNDLE = ROOT / "assets" / "js" / "home-bundle.js"
VERSION = "20261127z91n"

# 常用类兜底，保证 API 面板刚打开、全量索引还没下完时也能按类名搜索。
FALLBACK = [
    ("String", "java.lang", "java.base"), ("StringBuilder", "java.lang", "java.base"),
    ("StringBuffer", "java.lang", "java.base"), ("Object", "java.lang", "java.base"),
    ("Math", "java.lang", "java.base"), ("System", "java.lang", "java.base"),
    ("Integer", "java.lang", "java.base"), ("Long", "java.lang", "java.base"),
    ("Double", "java.lang", "java.base"), ("Boolean", "java.lang", "java.base"),
    ("Character", "java.lang", "java.base"), ("Byte", "java.lang", "java.base"),
    ("Short", "java.lang", "java.base"), ("Float", "java.lang", "java.base"),
    ("Exception", "java.lang", "java.base"), ("RuntimeException", "java.lang", "java.base"),
    ("IllegalArgumentException", "java.lang", "java.base"), ("NullPointerException", "java.lang", "java.base"),
    ("Class", "java.lang", "java.base"), ("ClassLoader", "java.lang", "java.base"),
    ("Enum", "java.lang", "java.base"), ("Record", "java.lang", "java.base"),
    ("Module", "java.lang", "java.base"), ("Package", "java.lang", "java.base"),
    ("Thread", "java.lang", "java.base"), ("Runnable", "java.lang", "java.base"),
    ("Arrays", "java.util", "java.base"), ("Collections", "java.util", "java.base"),
    ("List", "java.util", "java.base"), ("ArrayList", "java.util", "java.base"),
    ("LinkedList", "java.util", "java.base"), ("Map", "java.util", "java.base"),
    ("HashMap", "java.util", "java.base"), ("TreeMap", "java.util", "java.base"),
    ("Set", "java.util", "java.base"), ("HashSet", "java.util", "java.base"),
    ("TreeSet", "java.util", "java.base"), ("Queue", "java.util", "java.base"),
    ("Deque", "java.util", "java.base"), ("ArrayDeque", "java.util", "java.base"),
    ("Iterator", "java.util", "java.base"), ("Scanner", "java.util", "java.base"),
    ("Optional", "java.util", "java.base"), ("Random", "java.util", "java.base"),
    ("UUID", "java.util", "java.base"), ("Properties", "java.util", "java.base"),
    ("ResourceBundle", "java.util", "java.base"), ("Comparator", "java.util", "java.base"),
    ("Stream", "java.util.stream", "java.base"), ("Collectors", "java.util.stream", "java.base"),
    ("Function", "java.util.function", "java.base"), ("Consumer", "java.util.function", "java.base"),
    ("Supplier", "java.util.function", "java.base"), ("Predicate", "java.util.function", "java.base"),
    ("BiFunction", "java.util.function", "java.base"), ("UnaryOperator", "java.util.function", "java.base"),
    ("Files", "java.nio.file", "java.base"), ("Path", "java.nio.file", "java.base"),
    ("Paths", "java.nio.file", "java.base"), ("IOException", "java.io", "java.base"),
    ("File", "java.io", "java.base"), ("FileReader", "java.io", "java.base"),
    ("FileWriter", "java.io", "java.base"), ("BufferedReader", "java.io", "java.base"),
    ("BufferedWriter", "java.io", "java.base"), ("PrintWriter", "java.io", "java.base"),
    ("InputStream", "java.io", "java.base"), ("OutputStream", "java.io", "java.base"),
    ("ExecutorService", "java.util.concurrent", "java.base"),
    ("Executors", "java.util.concurrent", "java.base"),
    ("CompletableFuture", "java.util.concurrent", "java.base"),
    ("ConcurrentHashMap", "java.util.concurrent", "java.base"),
    ("AtomicInteger", "java.util.concurrent.atomic", "java.base"),
    ("LocalDate", "java.time", "java.base"), ("LocalDateTime", "java.time", "java.base"),
    ("LocalTime", "java.time", "java.base"), ("Duration", "java.time", "java.base"),
    ("Instant", "java.time", "java.base"), ("DateTimeFormatter", "java.time.format", "java.base"),
    ("Pattern", "java.util.regex", "java.base"), ("Matcher", "java.util.regex", "java.base"),
    ("BigInteger", "java.math", "java.base"), ("BigDecimal", "java.math", "java.base"),
    ("JOptionPane", "javax.swing", "java.desktop"), ("JFrame", "javax.swing", "java.desktop"),
    ("JPanel", "javax.swing", "java.desktop"), ("JButton", "javax.swing", "java.desktop"),
    ("JLabel", "javax.swing", "java.desktop"), ("JTextField", "javax.swing", "java.desktop"),
    ("ActionListener", "java.awt.event", "java.desktop"),
    ("Graphics", "java.awt", "java.desktop"), ("Color", "java.awt", "java.desktop"),
    ("Font", "java.awt", "java.desktop"), ("ImageIO", "javax.imageio", "java.desktop"),
    ("BufferedImage", "java.awt.image", "java.desktop"),
    ("Timer", "javax.swing", "java.desktop"),
    ("NumberFormat", "java.text", "java.base"), ("DecimalFormat", "java.text", "java.base"),
    ("MessageFormat", "java.text", "java.base"),
    ("Method", "java.lang.reflect", "java.base"), ("Field", "java.lang.reflect", "java.base"),
    ("Constructor", "java.lang.reflect", "java.base"),
]


def compact_fallback() -> str:
    rows = ",\n".join(json.dumps(list(row), ensure_ascii=False) for row in FALLBACK)
    return (
        "/* === JAPI INDEX BEGIN === */\n"
        "/* 常用类型兜底；完整 4,979 个类型索引在打开 API 文档时按需加载。 */\n"
        "window.__JAPI__=[\n" + rows + "\n];\n"
        "/* === JAPI INDEX END === */\n"
    )


def extract(html: str) -> tuple[str, str, int, int]:
    start = html.find("<script>")
    while start != -1:
        end = html.find("</script>", start)
        if end == -1:
            break
        body = html[start + len("<script>"):end]
        if "/* === JAPI INDEX BEGIN === */" in body:
            return body, html[start:end + len("</script>")], start, end + len("</script>")
        start = html.find("<script>", end + len("</script>"))
    raise SystemExit("找不到首页 JAPI 内联脚本")


def main() -> int:
    first = HTML_FILES[0]
    html = first.read_text(encoding="utf-8")
    if 'home-bundle.js' in html:
        print("首页已经外置，跳过")
        return 0

    body, tag, start, end = extract(html)
    j0 = body.find("/* === JAPI INDEX BEGIN === */")
    j1 = body.find("/* === JAPI INDEX END === */")
    if j0 < 0 or j1 < 0:
        raise SystemExit("JAPI 标记不完整")
    j1 += len("/* === JAPI INDEX END === */")
    bundle_body = body[:j0] + compact_fallback() + body[j1:]

    BUNDLE.write_text(
        "/* 首页应用与课程数据 · 从内联脚本外置，减少首屏 HTML 体积。\n"
        " * 由 scripts/build_home_bundle.py 生成；修改后请重跑 node --check 并做首页交互验收。\n"
        " */\n" + bundle_body,
        encoding="utf-8",
    )
    replacement = (
        f'<script defer src="./assets/js/home-bundle.js?v={VERSION}"></script>'
    )
    new_html = html[:start] + replacement + html[end:]
    first.write_text(new_html, encoding="utf-8")
    shutil.copyfile(first, HTML_FILES[1])

    subprocess.run(["node", "--check", str(BUNDLE)], check=True)
    print(f"首页 HTML: {len(html.encode()) / 1024 / 1024:.2f} MB -> {len(new_html.encode()) / 1024:.0f} KB")
    print(f"home-bundle.js: {BUNDLE.stat().st_size / 1024 / 1024:.2f} MB")
    print(f"JAPI 兜底: 4,979 类型 -> {len(FALLBACK)} 常用类型")
    print("两份首页字节一致")
    return 0


if __name__ == "__main__":
    sys.exit(main())

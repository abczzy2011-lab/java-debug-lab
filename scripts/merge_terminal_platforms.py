#!/usr/bin/env python3
"""把三个平台的 JSON 合并回 assets/js/terminal-commands.js。

用法：
  python3 scripts/merge_terminal_platforms.py            # 写 assets/js/terminal-commands.js
  python3 scripts/merge_terminal_platforms.py --out /tmp/x.js   # 先试跑，不覆盖正式数据层

合并前会逐个跑结构体检，任何平台 ERROR 非 0 就中止，不写出半成品。
"""
from __future__ import annotations

import json
import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "agent-output")
PLATFORMS = ("macos", "linux", "windows")
TARGET = os.path.join(ROOT, "assets", "js", "terminal-commands.js")

GROUP_ORDER = [
    "nav", "file", "view", "perm", "proc", "net", "dev", "pkg",
    "disk", "sec", "container", "media", "os", "alias", "other",
]


def out_path() -> str:
    if "--out" in sys.argv:
        return sys.argv[sys.argv.index("--out") + 1]
    return TARGET


def check(platform: str, path: str) -> int:
    proc = subprocess.run(
        [sys.executable, os.path.join(ROOT, "scripts", "validate_terminal_platform.py"), path],
        capture_output=True, text=True,
    )
    tail = [ln for ln in proc.stdout.splitlines() if ln.strip()][-6:]
    print(f"[{platform}] " + " | ".join(tail[-3:]))
    if proc.returncode != 0:
        print(proc.stdout)
    return proc.returncode


def main() -> int:
    payloads = {}
    for p in PLATFORMS:
        path = os.path.join(OUT_DIR, f"{p}.json")
        if not os.path.exists(path):
            print(f"缺少 {path}")
            return 1
        if check(p, path) != 0:
            print(f"{p} 未通过体检，合并中止")
            return 1
        payloads[p] = json.load(open(path, encoding="utf-8"))

    groups = payloads["macos"].get("groups") or []
    gids = [g["id"] for g in groups]
    if sorted(gids) != sorted(GROUP_ORDER):
        print(f"分组清单异常：{gids}")
        return 1

    platforms = {}
    totals = {}
    for p in PLATFORMS:
        data = payloads[p]
        cmds = {g: data["commands"].get(g, []) for g in GROUP_ORDER}
        total = sum(len(v) for v in cmds.values())
        totals[p] = total
        meta = data["meta"]
        badge = f"{total:,} 条全量"
        platforms[p] = {
            "label": meta["label"],
            "short": meta["short"],
            "status": "ready",
            "badge": badge,
            "summary": meta["summary"],
            "groupOverrides": data.get("group_overrides") or {},
            "commands": cmds,
        }

    doc = {
        "version": payloads["macos"].get("version") or "20261127z87n",
        "title": "终端指令全集",
        "license": "Command descriptions/examples adapted from tldr-pages zh (CC BY 4.0).",
        "groups": groups,
        "platforms": platforms,
    }

    target = out_path()
    os.makedirs(os.path.dirname(target), exist_ok=True)
    body = json.dumps(doc, ensure_ascii=False, indent=1)
    header = (
        "/* 终端指令全集 · 数据层\n"
        " * macOS / Linux / Windows 全量 tldr 中文命令页 + 平台系统内建命令。\n"
        " * 命令说明与示例改编自 tldr-pages 中文页（CC BY 4.0）：https://github.com/tldr-pages/tldr\n"
        " * 由 scripts/merge_terminal_platforms.py 从 agent-output/{macos,linux,windows}.json 合并生成，勿手改。\n"
        " */\n"
    )
    with open(target, "w", encoding="utf-8") as fh:
        fh.write(header + "window.TERMINAL_DATA = " + body + ";\n")

    print("\n合并完成 ->", target)
    for p in PLATFORMS:
        print(f"  {p}: {totals[p]} 条")
    print("  合计:", sum(totals.values()))
    print("  group_counts:")
    for g in GROUP_ORDER:
        row = "，".join(f"{g}:{len(platforms[p]['commands'][g])}" for p in PLATFORMS)
        print("    " + row)
    return 0


if __name__ == "__main__":
    sys.exit(main())

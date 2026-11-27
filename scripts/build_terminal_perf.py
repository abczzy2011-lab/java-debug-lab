#!/usr/bin/env python3
"""把终端数据层拆成首屏轻量 meta + 按平台懒加载的 JSON。

输入：assets/js/terminal-commands.js（由 merge_terminal_platforms.py 生成）
输出：
  assets/js/terminal-meta.js
  assets/data/terminal-macos.json
  assets/data/terminal-linux.json
  assets/data/terminal-windows.json

这样终端页首屏只需要约 3 KB meta，macOS 数据按需拉取；切 Linux / Windows
时再加载对应平台，避免每次访问都下载 2.4 MB 全部命令。
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets" / "js" / "terminal-commands.js"
META = ROOT / "assets" / "js" / "terminal-meta.js"
DATA_DIR = ROOT / "assets" / "data"
PLATFORMS = ("macos", "linux", "windows")


def load_source() -> dict:
    text = SOURCE.read_text(encoding="utf-8")
    marker = "window.TERMINAL_DATA = "
    if marker not in text:
        raise SystemExit(f"{SOURCE} 里找不到 window.TERMINAL_DATA")
    body = text.split(marker, 1)[1].strip()
    if body.endswith(";"):
        body = body[:-1].rstrip()
    return json.loads(body)


def build() -> int:
    data = load_source()
    groups = data.get("groups") or []
    platforms = data.get("platforms") or {}
    total = 0
    stubs = {}
    DATA_DIR.mkdir(parents=True, exist_ok=True)

    for pid in PLATFORMS:
        full = platforms.get(pid)
        if not full:
            raise SystemExit(f"缺少平台 {pid}")
        commands = full.get("commands") or {}
        count = sum(len(rows) for rows in commands.values() if isinstance(rows, list))
        total += count
        group_counts = {
            group.get("id"): len(commands.get(group.get("id"), []))
            for group in groups
            if group.get("id")
        }
        payload = {
            "label": full.get("label", pid),
            "short": full.get("short", pid),
            "status": full.get("status", "ready"),
            "badge": f"{count:,} 条全量",
            "summary": full.get("summary", ""),
            "groupOverrides": full.get("groupOverrides") or {},
            "count": count,
            "groupCounts": group_counts,
            "commands": commands,
        }
        (DATA_DIR / f"terminal-{pid}.json").write_text(
            json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n",
            encoding="utf-8",
        )
        stubs[pid] = {
            "label": payload["label"],
            "short": payload["short"],
            "status": payload["status"],
            "badge": payload["badge"],
            "summary": payload["summary"],
            "groupOverrides": payload["groupOverrides"],
            "count": payload["count"],
            "groupCounts": payload["groupCounts"],
        }

    meta = {
        "version": data.get("version") or "20261127z91n",
        "title": data.get("title") or "终端指令全集",
        "license": data.get("license", ""),
        "groups": groups,
        "total": total,
        "platforms": stubs,
    }
    header = (
        "/* 终端指令全集 · 首屏元数据（轻量）\n"
        " * 由 scripts/build_terminal_perf.py 生成，勿手改。\n"
        " * 平台命令正文在 assets/data/terminal-{platform}.json，按需加载。\n"
        " */\n"
    )
    META.write_text(
        header
        + "window.TERMINAL_DATA = "
        + json.dumps(meta, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )

    print(f"已生成 {META.relative_to(ROOT)} 和 {DATA_DIR.relative_to(ROOT)}/")
    for pid in PLATFORMS:
        size = (DATA_DIR / f"terminal-{pid}.json").stat().st_size
        print(f"  {pid}: {stubs[pid]['count']} 条，{size / 1024:.0f} KB")
    print(f"  合计: {total} 条")
    return 0


if __name__ == "__main__":
    sys.exit(build())

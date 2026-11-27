#!/usr/bin/env python3
"""校验单平台终端命令 JSON（agent-output/{macos,linux,windows}.json）。

用法：
  python3 scripts/validate_terminal_platform.py agent-output/macos.json
  python3 scripts/validate_terminal_platform.py agent-output/macos.json --write-audit

退出码 0 表示无 ERROR（WARN 允许，但需在 result 中说明）；1 表示存在 ERROR。
ERROR 必须修到 0；不要靠删检查项、放宽阈值过关。
"""
from __future__ import annotations

import json
import re
import sys
from collections import Counter

ALLOWED_GROUPS = [
    "nav", "file", "view", "perm", "proc", "net", "dev", "pkg",
    "disk", "sec", "container", "media", "os", "alias", "other",
]

GROUP_MIN = {
    "nav": 15, "file": 15, "view": 15, "perm": 8, "proc": 20,
    "net": 20, "dev": 60, "pkg": 20, "disk": 10, "sec": 8,
    "container": 6, "media": 8, "os": 8, "alias": 5, "other": 5,
}

# 单组占比上限，防止把杂项一股脑堆进 alias / other
GROUP_MAX_SHARE = {"other": 0.12, "alias": 0.15}

FIELDS = ("syntax", "copy", "title", "desc", "example", "note")

# Windows 上确实不存在的 POSIX/bash 专属内建（cmd.exe 的 cd/echo/set/type/dir 不在此列）
POSIX_ONLY = {
    "!", "^", "!!", "alias", "bg", "bind", "builtin", "caller", "compgen", "complete",
    "compopt", "declare", "dirs", "disown", "enable", "fc", "fg", "hash", "help",
    "history", "jobs", "let", "local", "logout", "mapfile", "readarray", "readonly",
    "shopt", "suspend", "times", "trap", "typeset", "ulimit", "umask", "unalias",
    "source", ".", "export", "unset", "eval", "exec", "wait", "getopts", "shift",
    "return", "break", "continue", "printf", "read", "test", ":",
}

# Linux 发行版专属的包管理/服务管理命令
LINUX_ONLY = {
    "sudo", "su", "apt", "apt-get", "apt-cache", "dpkg", "yum", "dnf", "rpm",
    "pacman", "zypper", "apk", "systemctl", "journalctl", "systemd-analyze",
    "service", "chkconfig", "update-alternatives", "add-apt-repository",
    "tmux", "screen", "chmod", "chown", "chgrp", "xattr", "mkfs", "fsck",
    "fdisk", "parted", "blkid", "lsblk", "dmesg", "lsmod", "modprobe", "sysctl",
    "mount", "umount", "crontab", "at", "nohup", "watch", "traceroute", "dig",
    "host", "tcpdump", "ifconfig", "nc", "telnet", "man", "whereis", "which",
    "sed", "awk", "grep", "egrep", "fgrep", "xargs", "tr", "cut", "less", "more",
    "nano", "vim", "vi", "emacs", "who", "w", "last", "finger", "whoami", "id",
    "groups", "uname", "uptime", "htop", "dstat",
}

# macOS 专属
MAC_ONLY = {
    "launchctl", "brew", "defaults", "diskutil", "pbcopy", "pbpaste", "osascript",
    "mdfind", "sw_vers", "scutil", "networksetup", "dscl", "hdiutil", "codesign",
    "spctl", "tccutil", "caffeinate", "screencapture", "pmset", "softwareupdate",
    "security", "mdutil", "tmutil", "system_profiler", "afplay", "textutil",
}

# PowerShell 侧同义词，绝不该出现在 macOS / Linux 库里
WIN_CMD_BLOCK = {
    "get-childitem", "set-location", "get-process", "stop-process", "start-process",
    "get-service", "start-service", "stop-service", "restart-service", "get-content",
    "set-content", "add-content", "out-file", "select-string", "where-object",
    "foreach-object", "get-command", "get-help", "invoke-webrequest", "invoke-restmethod",
    "get-ciminstance", "get-wmiobject", "get-netadapter", "get-netipconfiguration",
    "resolve-dnsname", "get-volume", "get-disk", "get-partition", "measure-object",
    "get-acl", "set-acl", "get-localuser", "new-localuser", "get-scheduledtask",
    "register-scheduledtask", "get-filehash", "get-computerinfo", "test-netconnection",
    "get-winevent", "get-itemproperty", "new-itemproperty", "set-itemproperty",
    "remove-item", "copy-item", "move-item", "new-item", "test-path", "get-location",
    "get-history", "write-host", "write-output", "set-alias", "findstr", "tasklist",
    "taskkill", "netsh", "wmic", "robocopy", "xcopy", "sfc", "dism", "chkdsk",
    "ipconfig", "tracert", "setx", "icacls", "cacls", "takeown", "schtasks",
    "winget", "choco", "scoop", "wt", "wsl", "powershell", "pwsh", "chcp",
    "pathping", "systeminfo", "explorer", "notepad", "mspaint", "reg", "diskpart",
}

# cmd.exe 内建，macOS / Linux 上没有
CMD_ONLY = {
    "dir", "cls", "md", "rd", "ver", "path", "start", "title", "prompt",
    "assoc", "ftype", "attrib", "chdir", "ren", "rename", "del", "move", "copy",
}

HARD_BLOCK = {
    "windows": POSIX_ONLY | LINUX_ONLY | MAC_ONLY,
    "macos": WIN_CMD_BLOCK | CMD_ONLY,
    "linux": WIN_CMD_BLOCK | CMD_ONLY | MAC_ONLY,
}

# 平台间确有歧义、需要逐条人工确认的命令，只告警
SOFT = {
    "type", "set", "start", "echo", "test", "path", "kill", "copy", "move", "del",
    "dir", "where", "sort", "find", "date", "open", "cd", "ls", "cat", "tail",
    "head", "curl", "git", "tar", "zip", "unzip", "ssh", "scp", "python", "python3",
    "node", "npm", "java", "make", "gcc", "wget", "nmap", "ps", "top", "df", "du",
    "stat", "ln", "mktemp", "killall", "shutdown", "reboot", "print",
}

# 破坏性命令应当带 danger 标记（缺失只告警）
DANGEROUS = {
    "rm", "rmdir", "dd", "mkfs", "chmod", "chown", "chgrp", "shutdown", "reboot",
    "kill", "killall", "truncate", "mv", "del", "erase", "rd", "rmdir", "taskkill",
    "reg", "diskpart", "format", "clear-disk", "format-volume", "takeown",
}

BANNED_TITLE = ("框架已预留", "下一版补", "占位", "TODO", "原命令", "待补")
BANNED_DESC = ("框架已预留", "下一版补", "占位题", "TODO", "待补", "此处省略")


def load(path: str):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: validate_terminal_platform.py <platform.json> [--write-audit]")
        return 2
    path = sys.argv[1]
    write_audit = "--write-audit" in sys.argv
    data = load(path)

    errs: list[str] = []
    warns: list[str] = []
    platform = data.get("platform")

    if platform not in ("macos", "linux", "windows"):
        errs.append(f"platform 字段非法：{platform!r}")

    meta = data.get("meta") or {}
    for k in ("label", "short", "status", "badge", "summary"):
        if not str(meta.get(k, "")).strip():
            errs.append(f"meta.{k} 为空")
    if meta.get("status") != "ready":
        errs.append(f"meta.status 必须为 ready，当前 {meta.get('status')!r}")
    if any(b in str(meta.get("summary", "")) for b in BANNED_TITLE):
        errs.append("meta.summary 里仍留有占位/框架类措辞")

    commands = data.get("commands")
    if not isinstance(commands, dict):
        errs.append("commands 必须是 {group_id: [item...]} 对象")
        commands = {}

    unknown = [g for g in commands if g not in ALLOWED_GROUPS]
    if unknown:
        errs.append(f"出现非法分组 id：{unknown}")
    missing_groups = [g for g in ALLOWED_GROUPS if g not in commands]
    if missing_groups:
        errs.append(f"缺少分组键（即使为空也要给键）：{missing_groups}")

    total = sum(len(v) for v in commands.values() if isinstance(v, list))
    group_counts = {g: len(v) for g, v in commands.items() if isinstance(v, list)}

    ids: Counter = Counter()
    empty_fields = 0
    placeholder_copy: list[str] = []
    blocked: list[str] = []
    soft_hits: list[str] = []
    bad_title: list[str] = []
    bad_desc: list[str] = []
    stub_pages: list[str] = []
    no_attr: list[str] = []
    dup_keywords = 0
    missing_danger: list[str] = []
    garbled: list[str] = []

    block = HARD_BLOCK.get(platform, set())
    danger_flag = {"windows": {"del", "erase", "rd", "rmdir", "taskkill", "reg",
                               "diskpart", "takeown", "clear-disk"},
                   "macos": {"rm", "rmdir", "dd", "chmod", "chown", "shutdown", "killall"},
                   "linux": {"rm", "rmdir", "dd", "fdisk", "parted", "chmod", "chown",
                             "shutdown", "reboot", "killall", "truncate", "mkfs"}}
    danger_set = danger_flag.get(platform, set())

    for gid, items in commands.items():
        if gid not in ALLOWED_GROUPS:
            continue
        if not isinstance(items, list):
            errs.append(f"{gid} 不是数组")
            continue
        for it in items:
            if not isinstance(it, dict):
                errs.append(f"{gid} 内存在非对象条目")
                continue
            cid = str(it.get("id", "")).strip()
            if not cid:
                errs.append(f"{gid} 存在空 id")
                continue
            ids[cid] += 1
            if re.search(r"\s", cid):
                errs.append(f"id 含空白：{cid!r}")

            for fld in FIELDS:
                if not str(it.get(fld, "")).strip():
                    empty_fields += 1
                    errs.append(f"[{cid}] 字段 {fld} 为空")

            kw = it.get("keywords")
            if not isinstance(kw, list) or len(kw) < 2:
                errs.append(f"[{cid}] keywords 至少 2 项")
            elif len(set(map(str, kw))) != len(kw):
                dup_keywords += 1

            copy = str(it.get("copy", ""))
            if "{{" in copy or "}}" in copy:
                placeholder_copy.append(cid)
            if copy.startswith("$ ") or copy.startswith("# "):
                errs.append(f"[{cid}] copy 带提示符/注释前缀")
            if "\n" in copy.strip():
                errs.append(f"[{cid}] copy 必须单行")
            if re.search(r"[\x00-\x08\ufffd]", copy):
                garbled.append(cid)

            syn = str(it.get("syntax", ""))
            if "{{" in syn or "}}" in syn:
                errs.append(f"[{cid}] syntax 含占位符（具体形态给 syntax，占位演示留给 example）")
            if syn.startswith("$ "):
                errs.append(f"[{cid}] syntax 带 $ 提示符")

            title = str(it.get("title", ""))
            if any(b in title for b in BANNED_TITLE):
                bad_title.append(f"{cid}:{title}")
            desc = str(it.get("desc", ""))
            if any(b in desc for b in BANNED_DESC):
                bad_desc.append(f"{cid}:{desc}")
            # tldr 的“别名指向页”：正文只写某命令的别名 + 示例只有 tldr X
            if "的别名" in desc and re.search(r"(^|\n)\s*tldr\s", str(it.get("example", ""))):
                stub_pages.append(cid)

            if it.get("src", "tldr") == "tldr" and "CC BY 4.0" not in str(it.get("note", "")):
                no_attr.append(cid)

            base = cid.lower()
            if base in block:
                blocked.append(cid)
            elif base in SOFT:
                soft_hits.append(cid)
            if base in danger_set and not it.get("danger"):
                missing_danger.append(cid)

    dups = {k: v for k, v in ids.items() if v > 1}
    if dups:
        detail = ", ".join(f"{k}×{v}" for k, v in list(dups.items())[:20])
        errs.append(f"id 全局重复 {len(dups)} 个：{detail}")

    for gid, floor in GROUP_MIN.items():
        got = group_counts.get(gid, 0)
        if got < floor:
            errs.append(f"分组 {gid} 只有 {got} 条，低于下限 {floor}")

    for gid, cap in GROUP_MAX_SHARE.items():
        got = group_counts.get(gid, 0)
        if total and got / total > cap:
            errs.append(f"分组 {gid} 占 {got}/{total}={got / total:.0%}，超过上限 {cap:.0%}（疑似桶化）")

    if blocked:
        uniq = sorted(set(blocked))
        errs.append(f"{platform} 混入 {len(uniq)} 个平台不适用命令：{uniq[:15]}")
    if bad_title:
        errs.append(f"占位式标题 {len(bad_title)} 条，如 {bad_title[:3]}")
    if bad_desc:
        errs.append(f"占位式说明 {len(bad_desc)} 条")
    if placeholder_copy:
        errs.append(f"copy 含占位符 {len(placeholder_copy)} 条，如 {placeholder_copy[:5]}")
    if garbled:
        errs.append(f"疑似乱码/控制字符 {len(garbled)} 条，如 {garbled[:5]}")

    if stub_pages:
        warns.append(f"{len(stub_pages)} 条是 tldr 别名指向页，需删除或补真实用法：{stub_pages[:8]}")
    if no_attr:
        warns.append(f"{len(no_attr)} 条 tldr 来源条目 note 缺 CC BY 4.0 署名，如 {no_attr[:5]}")
    if soft_hits:
        warns.append(f"{len(set(soft_hits))} 个跨平台同名命令建议人工确认：{sorted(set(soft_hits))[:10]}")
    if missing_danger:
        warns.append(f"{len(missing_danger)} 条破坏性命令缺 danger 标记：{missing_danger[:8]}")
    if dup_keywords:
        warns.append(f"{dup_keywords} 条 keywords 有重复项")

    badge = str(meta.get("badge", ""))
    nums = re.findall(r"[0-9]+", badge.replace(",", ""))
    if not nums or int(nums[0]) != total:
        errs.append(f"meta.badge 数字与条目数 {total} 不一致：{badge!r}")

    audit = {
        "count": total,
        "group_counts": group_counts,
        "duplicates_removed": int((data.get("audit") or {}).get("duplicates_removed", 0)),
        "empty_fields": empty_fields,
        "placeholder_copy": len(placeholder_copy),
        "blocklist_hits": len(set(blocked)),
        "stub_pages": len(stub_pages),
        "anomalies": (data.get("audit") or {}).get("anomalies", []),
        "additions": (data.get("audit") or {}).get("additions", []),
    }

    print(f"\n== {platform}  {path} ==")
    print(f"条目数 {total}｜非空分组 {len([g for g in ALLOWED_GROUPS if group_counts.get(g)])}/15｜"
          f"重复 id {len(dups)}｜空字段 {empty_fields}｜copy 占位符 {len(placeholder_copy)}｜"
          f"平台禁用命中 {len(set(blocked))}｜占位标题 {len(bad_title)}")
    print("分组分布：" + "，".join(f"{g}:{group_counts.get(g, 0)}" for g in ALLOWED_GROUPS))
    if total:
        top = sorted(group_counts.items(), key=lambda kv: -kv[1])[:6]
        print("最大分组：" + "，".join(f"{g}:{n}({n / total:.0%})" for g, n in top))

    if errs:
        print(f"\nERROR {len(errs)} 项：")
        for e in errs[:40]:
            print("  X " + e)
    else:
        print("\nERROR 0 项 —— 结构校验通过")
    if warns:
        print(f"\nWARN {len(warns)} 项：")
        for w in warns[:12]:
            print("  ! " + w)
        if len(warns) > 12:
            print(f"  … 另有 {len(warns) - 12} 项 WARN 未列出")
    print("\n结论：" + ("FAIL" if errs else "PASS"))

    if write_audit:
        data["audit"] = audit
        with open(path, "w", encoding="utf-8") as fh:
            json.dump(data, fh, ensure_ascii=False, indent=1)
        print(f"已写入 audit 块 -> {path}")

    return 1 if errs else 0


if __name__ == "__main__":
    sys.exit(main())

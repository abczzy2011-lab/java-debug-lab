#!/usr/bin/env python3
"""Build the complete terminal command library from tldr-pages zh translations.

Inputs are intentionally outside the repo (the generated data must not vendor
tldr's source tree).  Set TLDR_ROOT to a clone of tldr-pages before running:
  python3 scripts/gen_terminal_all.py /tmp/tldr-pages/pages.zh
"""
from __future__ import annotations

import glob
import json
import os
import re
import subprocess
import sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TLDR = sys.argv[1] if len(sys.argv) > 1 else "/tmp/tldr-pages/pages.zh"


def parse_page(path: str):
    text = open(path, encoding="utf-8").read().replace("\r\n", "\n")
    lines = text.split("\n")
    title = ""
    desc = []
    examples = []
    more = ""
    for line in lines:
        if line.startswith("# "):
            title = line[2:].strip()
        elif line.startswith("> "):
            value = line[2:].strip()
            if value.startswith("更多信息"):
                more = value
            elif value and not value.startswith("Warning:"):
                desc.append(value)
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        if line.startswith("- "):
            caption = line[2:].rstrip(":").strip()
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and lines[j].strip().startswith("`"):
                value = lines[j].strip()
                value = value[1:-1] if value.endswith("`") else value[1:]
                examples.append((caption, value))
        i += 1
    return title, " ".join(desc).strip(), more, examples


def names_in(directory: str) -> list[str]:
    return sorted((os.path.basename(p)[:-3] for p in glob.glob(os.path.join(TLDR, directory, "*.md"))))


def load_existing():
    raw = subprocess.check_output(
        ["node", "-e", """
const fs=require('fs'),vm=require('vm');
const ctx={window:{}};vm.createContext(ctx);
vm.runInContext(fs.readFileSync('assets/js/terminal-commands.js','utf8'),ctx);
process.stdout.write(JSON.stringify(ctx.window.TERMINAL_DATA.platforms.macos.commands));
"""],
        cwd=ROOT,
        text=True,
    )
    return json.loads(raw)


GROUPS = [
    {"id": "nav", "no": "01", "name": "基础与导航", "short": "基础", "tone": "mint", "blurb": "先知道自己站在哪、目录里有什么。"},
    {"id": "file", "no": "02", "name": "文件与目录", "short": "文件", "tone": "sky", "blurb": "建立、复制、移动和删除，先把路径确认清楚。"},
    {"id": "view", "no": "03", "name": "查看与文本", "short": "查看", "tone": "amber", "blurb": "读文件、追日志、搜关键词、处理文本和 JSON。"},
    {"id": "perm", "no": "04", "name": "权限与账号", "short": "权限", "tone": "rose", "blurb": "文件归谁、谁能执行、用户和用户组怎么管。"},
    {"id": "proc", "no": "05", "name": "进程与系统", "short": "进程", "tone": "violet", "blurb": "谁在运行、谁占了端口、磁盘和系统状态。"},
    {"id": "net", "no": "06", "name": "网络与远程", "short": "网络", "tone": "cyan", "blurb": "连通性、响应头、下载、SSH、抓包与远程同步。"},
    {"id": "dev", "no": "07", "name": "开发与版本控制", "short": "开发", "tone": "lime", "blurb": "写代码、编译、调试、构建、测试与版本控制。"},
    {"id": "pkg", "no": "08", "name": "包管理与运行时", "short": "包管理", "tone": "gold", "blurb": "装包、换源、升级语言运行时和工具链。"},
    {"id": "disk", "no": "09", "name": "磁盘与归档", "short": "磁盘", "tone": "sky", "blurb": "分区、挂载、压缩、归档、校验和与镜像。"},
    {"id": "sec", "no": "10", "name": "安全与加密", "short": "安全", "tone": "rose", "blurb": "密钥、证书、签名、哈希、权限边界与安全扫描。"},
    {"id": "container", "no": "11", "name": "容器与云", "short": "容器云", "tone": "cyan", "blurb": "容器、Kubernetes、云 CLI、基础设施与部署。"},
    {"id": "media", "no": "12", "name": "多媒体与文档", "short": "多媒体", "tone": "amber", "blurb": "音视频、图像、字体、PDF 与文档格式转换。"},
    {"id": "os", "no": "13", "name": "平台专属", "short": "专属", "tone": "gold", "blurb": "每个系统自己的快捷入口、系统设置和平台差异。"},
    {"id": "alias", "no": "14", "name": "别名与符号", "short": "别名", "tone": "lime", "blurb": "短别名、shell 符号和兼容入口，知道它们指向谁。"},
    {"id": "other", "no": "15", "name": "其他工具", "short": "其他", "tone": "violet", "blurb": "不属于上面分类的垂直工具和系统小工具。"},
]
GROUP_IDS = {g["id"]: g for g in GROUPS}

NAV = set("cd pwd echo printf clear history alias unalias export source . type which whereis command man help apropos whatis info tldr exec env set unset let eval exit logout read shift getopts trap true false : ! [ [[ ] ]] ^ $ % (( fc compgen complete compopt disown".split())
FILE = set("ls cp mv rm mkdir rmdir touch ln find tree file basename dirname realpath mktemp stat du df link unlink chdir exa eza fd fdfind rename file-rename autojump bashmarks".split())
VIEW = set("cat less more head tail grep egrep fgrep rg ag ack sed awk cut sort uniq wc tr paste join split csplit diff cmp comm patch strings xxd hexdump od jq yq column nl tac rev look shuf tee xargs parallel entr fzf bat batcat glow highlight delta diff-so-fancy".split())
PERM = set("chmod chown chgrp umask xattr setfacl getfacl chflags sudo su doas users groups id whoami passwd useradd usermod userdel groupadd groupmod groupdel adduser deluser visudo newgrp last lastb w who".split())
PROC = set("ps top htop atop pidof pgrep pkill kill killall nice renice jobs bg fg wait lsof vm_stat free uptime time date cal sleep at cron crontab systemctl service launchctl journalctl dmesg sysctl uname sw_vers w who last users hostname hostnamectl timedatectl loginctl reboot shutdown poweroff halt pmset caffeinate defaults softwareupdate system_profiler scutil launchd glances btm sen".split())
NET = set("curl wget ping ping6 traceroute tracepath mtr dig nslookup host whois ifconfig ip route netstat ss nmap nc netcat telnet ssh ssh-keygen ssh-copy-id scp sftp rsync ftp lftp aria2c aria2 http httpie lynx w3m ab wrk tcpdump tshark iftop nethogs iperf iperf3 speedtest networksetup airport open arp arp-scan socat hping hping3".split())
DEV = set("git svn hg node npm npx yarn pnpm bun deno python python3 pip pip3 pipx poetry uv java javac jshell mvn gradle go cargo rustc ruby gem bundle php composer dotnet swift xcodebuild clang gcc g++ make cmake ninja meson bazel adb fastboot nodejs clj clojure ctags etags gh fossil heroku".split())
PKG = set("apt apt-get aptitude dpkg snap flatpak yum dnf pacman zypper apk brew port choco winget scoop nix nix-env guix asdf mise conda".split())
DISK = set("diskutil mount umount mkfs fsck fdisk parted lsblk blkid hdiutil tar zip unzip gzip gunzip bzip2 bunzip2 xz unxz zstd unzstd 7z 7za 7zr cpio dd rsync ditto ar bmaptool".split())
SEC = set("openssl gpg age age-keygen security ssh-keygen pass keychain xattr setfacl getfacl chmod chown chflags codesign spctl csrutil acme.sh certbot hashcat apg age-inspect".split())
CONT = set("docker podman kubectl helm terraform ansible ansible-playbook ansible-galaxy ansible-vault aws gcloud az cf wrangler minikube kind k3d nerdctl containerd crictl buildah skopeo istio argocd flux eksctl k9s kubectx kubens etcd gh".split())
MEDIA = set("ffmpeg ffplay ffprobe convert magick sips pandoc qlmanage say afplay afconvert afinfo a2ping a2ps img2pdf mkvinfo mpv vlc fonttools fc-cache fc-list alex anki".split())
OS = set("open pbcopy pbpaste defaults launchctl pmset softwareupdate sw_vers system_profiler networksetup airport hdiutil diskutil security xcode-select xcrun simctl codesign spctl installer pkgutil osascript automator shortcuts screencapture scutil ioreg systemsetup nvram csrutil tmutil fdesetup launchd".split())

PREFIX = [
    ("container", "docker podman kubectl helm terraform ansible ansible-playbook ansible-galaxy ansible-vault aws gcloud az cf wrangler minikube kind k3d nerdctl crictl buildah skopeo istio argocd flux eksctl k9s kubectx kubens etcd crane gh".split()),
    ("pkg", "apt dnf yum pacman zypper apk brew port choco winget scoop nix guix flatpak snap asdf mise conda pip pipx poetry uv gem bundle cargo rustup npm npx yarn pnpm bun composer gradle maven mvn ant sbt pub vcpkg conan".split()),
    ("dev", "git svn hg node deno tsc eslint prettier jest vitest pytest make cmake ninja meson bazel clang gcc g++ java javac jshell kotlin scala swift xcode xcrun simctl rust ruby php dotnet python pip poetry uv go cargo adb fastboot flutter dart lua perl r julia octave matlab clj clojure ctags etags gh fossil heroku".split()),
    ("net", "ssh scp sftp rsync curl wget ping traceroute tracepath mtr dig nslookup host whois ifconfig ip route netstat ss nmap nc netcat telnet tcpdump tshark iftop nethogs iperf ab wrk aria2 http lynx w3m ftp lftp socat openssl openvpn wireguard tailscale ngrok arp hping".split()),
    ("disk", "diskutil mount umount dd tar zip gzip bzip xz zstd 7z cpio fdisk parted lsblk blkid hdiutil rsync ar bmaptool".split()),
    ("media", "ffmpeg ffplay ffprobe convert magick sips pandoc qlmanage say afplay afconvert afinfo a2ping a2ps img2pdf mpv vlc fonttools fc-".split()),
]


def _alias(name, title, desc, examples):
    if "别名" in desc or "alias" in desc.lower():
        return True
    if "该命令已移动" in desc or "已被移除" in desc:
        return True
    if examples and len(examples) == 1 and examples[0][1].strip().startswith("tldr "):
        return True
    return False


def group_for(name, title, desc, examples):
    n = name.lower()
    if _alias(name, title, desc, examples):
        return "alias"
    for key, values in [("nav", NAV), ("file", FILE), ("view", VIEW), ("perm", PERM), ("proc", PROC), ("net", NET), ("dev", DEV), ("pkg", PKG), ("disk", DISK), ("sec", SEC), ("container", CONT), ("media", MEDIA), ("os", OS)]:
        if n in values:
            return key
    for key, prefixes in PREFIX:
        for p in prefixes:
            if n == p or n.startswith(p + "-") or n.startswith(p + "_") or n.startswith(p + "."):
                return key
    text = (title + " " + desc).lower()
    cues = [
        ("net", "网络 路由 域名 HTTP HTTPS 端口 连接 下载 上传 远程 代理 协议 抓包 防火墙 VPN".split()),
        ("disk", "磁盘 分区 压缩 归档 镜像 挂载 文件系统 校验 备份".split()),
        ("media", "图像 视频 音频 字体 PDF 文档 动画 颜色 转换 播放".split()),
        ("sec", "加密 密钥 证书 签名 密码 安全 漏洞 扫描 破解 攻击".split()),
        ("pkg", "软件包 包管理 安装包 依赖 版本 仓库 运行时".split()),
        ("dev", "代码 编译 构建 测试 调试 开发 编程 版本控制 仓库 编辑器 框架".split()),
        ("proc", "进程 系统 服务 日志 监控 内存 CPU 终端 会话 休眠".split()),
        ("view", "文本 搜索 替换 格式化 JSON 解析 查看 打印".split()),
    ]
    for key, words in cues:
        if any(w in text for w in words):
            return key
    return "other"


def make_entry(name, title, desc, more, examples, group):
    command = title or name
    # Prefer a concrete Chinese example caption as the card title.
    first_caption = examples[0][0] if examples else ""
    card_title = first_caption
    if not card_title or len(card_title) > 46:
        first_sentence = re.split(r"[。！？]", desc)[0].strip()
        card_title = first_sentence[:46] or command
    example_lines = []
    for caption, value in examples[:4]:
        if caption:
            example_lines.append("# " + caption.rstrip("：: "))
        example_lines.append(value.strip())
    example = "\n".join(example_lines) or command
    note = "来自 tldr-pages 中文页（CC BY 4.0）；{{...}} 替换为实际参数，man " + command.split()[0] + " 查看完整参数。"
    if more:
        note += " " + more
    return {
        "id": name,
        "syntax": command,
        "copy": command,
        "title": card_title,
        "desc": desc[:260] or command,
        "example": example,
        "note": note,
        "keywords": [name, command, group["name"], "tldr"],
    }


def build_platform(extra_dirs: list[str], existing=None):
    pages = {}
    # Platform-specific pages override common pages with the same filename.
    for directory in extra_dirs:
        for name in names_in(directory):
            pages[name] = (os.path.join(TLDR, directory, name + ".md"), directory)
    for name in names_in("common"):
        if name not in pages:
            pages[name] = (os.path.join(TLDR, "common", name + ".md"), "common")
    by_group = {g["id"]: [] for g in GROUPS}
    # Existing curated entries win over generated pages and keep their hand-written content.
    if existing:
        for group_id, entries in existing.items():
            if group_id not in by_group:
                continue
            for entry in entries:
                by_group[group_id].append(entry)
                pages.pop(entry["id"], None)
    for name, (path, _directory) in pages.items():
        title, desc, more, examples = parse_page(path)
        group_id = group_for(name, title, desc, examples)
        entry = make_entry(name, title, desc, more, examples, GROUP_IDS[group_id])
        by_group[group_id].append(entry)
    # Stable, case-insensitive order inside each category.
    for group_id in by_group:
        by_group[group_id].sort(key=lambda x: x["id"].lower())
    return {"commands": by_group}


def main():
    existing = load_existing()
    platforms = {
        "macos": {
            "label": "macOS", "short": "Mac", "status": "ready",
            "badge": "全量命令库",
            "summary": "macOS 自带命令、zsh 内置、开发工具与 tldr 中文全量命令页；按真实使用场景分组，每条都有可复制示例。",
            "groupOverrides": {"os": {"name": "macOS 专属", "short": "Mac"}},
        },
        "linux": {
            "label": "Linux", "short": "Linux", "status": "ready",
            "badge": "全量命令库",
            "summary": "Linux 发行版自带命令、GNU / util-linux / systemd / 网络 / 容器与开发工具的全量中文命令页。",
            "groupOverrides": {"os": {"name": "Linux 专属", "short": "Linux"}},
        },
        "windows": {
            "label": "Windows", "short": "Win", "status": "ready",
            "badge": "全量命令库",
            "summary": "Windows cmd、PowerShell、Chocolatey 与跨平台开发工具；在 PowerShell / Git Bash 中按实际环境取用。",
            "groupOverrides": {"os": {"name": "Windows 专属", "short": "Win"}},
        },
    }
    platforms["macos"].update(build_platform(["osx"], existing))
    platforms["linux"].update(build_platform(["linux"]))
    platforms["windows"].update(build_platform(["windows", "dos"]))
    counts = {k: sum(len(v) for v in p["commands"].values()) for k, p in platforms.items()}
    for key, count in counts.items():
        platforms[key]["badge"] = f"{count:,} 条全量"
    data = {
        "version": "20261127z87n",
        "title": "终端指令全集",
        "license": "Command descriptions/examples adapted from tldr-pages zh (CC BY 4.0).",
        "groups": GROUPS,
        "platforms": platforms,
    }
    out = os.path.join(ROOT, "assets/js/terminal-commands.js")
    with open(out, "w", encoding="utf-8") as fh:
        fh.write("/* 终端指令全集 · 数据层\n")
        fh.write(" * macOS / Linux / Windows 全量 tldr 中文命令页 + 站内精选命令。\n")
        fh.write(" * 命令说明与示例改编自 tldr-pages 中文页（CC BY 4.0）：https://github.com/tldr-pages/tldr\n */\n")
        fh.write("window.TERMINAL_DATA = ")
        json.dump(data, fh, ensure_ascii=False, indent=2)
        fh.write(";\n")
    print("wrote", out, os.path.getsize(out), "bytes")
    print("counts", counts)
    for key, p in platforms.items():
        print(key, {g["id"]: len(p["commands"].get(g["id"], [])) for g in GROUPS})


if __name__ == "__main__":
    main()

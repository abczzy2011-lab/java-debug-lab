/* 终端指令题库 · 45 道三平台单选题
 * 题目围绕真实命令用途、参数和平台差异设计；每题只有一个最佳答案。
 * 选项顺序已做均衡处理，避免答案集中在同一字母。
 * 页面在 assets/js/terminal-quiz-app.js 中读取。
 */
window.TERMINAL_QUIZ = {
  "version": "20261127z88n",
  "total": 45,
  "platforms": [
    {
      "id": "macos",
      "label": "macOS",
      "short": "Mac"
    },
    {
      "id": "linux",
      "label": "Linux",
      "short": "Linux"
    },
    {
      "id": "windows",
      "label": "Windows",
      "short": "Win"
    }
  ],
  "questions": [
    {
      "id": "mac-nav-bindkey",
      "platform": "macos",
      "group": "基础与导航",
      "groupId": "nav",
      "prompt": "在 zsh 里，想把 Ctrl-R 改成按当前输入前缀搜索历史，应该执行哪条？",
      "options": [
        "bind -x '\"\\C-r\": history-search-backward'",
        "stty -ixon",
        "bindkey '^R' history-search-backward",
        "setopt hist_ignore_all_dups"
      ],
      "answer": 2,
      "explain": "zsh 用 bindkey 管理键位；bind -x 属于 bash。history-search-backward 会按已输入前缀搜索历史。"
    },
    {
      "id": "mac-file-mkfifo",
      "platform": "macos",
      "group": "文件与目录",
      "groupId": "file",
      "prompt": "需要让两个进程通过一条命名管道传递数据，第一步创建 FIFO，用哪条？",
      "options": [
        "mkfifo /tmp/myfifo",
        "touch /tmp/myfifo",
        "ln -s /tmp/myfifo /tmp/fifo-link",
        "mkfile 1m /tmp/myfifo"
      ],
      "answer": 0,
      "explain": "mkfifo 创建 FIFO 特殊文件。touch 只创建普通空文件，ln -s 是符号链接，mkfile 创建的是普通文件。"
    },
    {
      "id": "mac-view-tac",
      "platform": "macos",
      "group": "查看与文本",
      "groupId": "view",
      "prompt": "日志追加得很快，你想从最后一行往上倒着查看完整 app.log，用哪条？",
      "options": [
        "tail -f app.log",
        "head -n 5 app.log",
        "less +F app.log",
        "tac app.log"
      ],
      "answer": 3,
      "explain": "tac 按行倒序输出，适合先看最新日志；tail -f 会持续追踪，less +F 也是追踪模式，都不是倒序查看完整文件。"
    },
    {
      "id": "mac-perm-chsh",
      "platform": "macos",
      "group": "权限与账号",
      "groupId": "perm",
      "prompt": "macOS 上把当前用户的默认登录 Shell 改成 /bin/zsh，用哪条？",
      "options": [
        "usermod -s /bin/zsh $USER",
        "chsh -s /bin/zsh",
        "dscl . -create /Users/$USER shell /bin/zsh",
        "sudo passwd -s /bin/zsh"
      ],
      "answer": 1,
      "explain": "chsh 修改登录 Shell；目标必须出现在 /etc/shells。macOS 没有 Linux 的 usermod，dscl 的字段名也不是 shell。"
    },
    {
      "id": "mac-proc-sample",
      "platform": "macos",
      "group": "进程与系统",
      "groupId": "proc",
      "prompt": "某个进程 PID 1234 卡住，想采样 5 秒看调用栈，用哪条？",
      "options": [
        "ps -p 1234",
        "top -pid 1234",
        "sample 1234 5 -file /tmp/sample.txt",
        "kill -INFO 1234"
      ],
      "answer": 2,
      "explain": "sample 会对进程做短时间采样并输出调用栈；ps 和 top 只能看快照，kill -INFO 不会生成调用栈报告。"
    },
    {
      "id": "mac-net-dns-sd",
      "platform": "macos",
      "group": "网络与远程",
      "groupId": "net",
      "prompt": "想在 Mac 上浏览局域网 _http._tcp 的 Bonjour 服务，用哪条？",
      "options": [
        "mdfind _http._tcp",
        "dns-sd -B _http._tcp",
        "networksetup -listallnetworkservices",
        "arp -a"
      ],
      "answer": 1,
      "explain": "dns-sd -B 浏览 mDNS/Bonjour 服务实例；mdfind 是 Spotlight 搜索，networksetup 管理网络服务，arp 看邻居缓存。"
    },
    {
      "id": "mac-dev-swiftc",
      "platform": "macos",
      "group": "开发与版本控制",
      "groupId": "dev",
      "prompt": "把单文件 hello.swift 编译成名为 hello 的可执行文件，用哪条？",
      "options": [
        "swiftc hello.swift -o hello",
        "swift build hello.swift",
        "xcodebuild -scheme hello",
        "clang hello.swift -o hello"
      ],
      "answer": 0,
      "explain": "swiftc 直接编译 Swift 源文件，-o 指定输出名。swift build 面向 Swift Package，xcodebuild 面向 Xcode 工程，clang 不能编译 Swift。"
    },
    {
      "id": "mac-pkg-brew-services",
      "platform": "macos",
      "group": "包管理与运行时",
      "groupId": "pkg",
      "prompt": "查看 Homebrew 管理的后台服务及运行状态，用哪条？",
      "options": [
        "brew list",
        "brew doctor",
        "launchctl list",
        "brew services list"
      ],
      "answer": 3,
      "explain": "brew services list 专门列出由 Homebrew 管理的 launchd 服务；brew list 列已安装包，brew doctor 做环境体检。"
    },
    {
      "id": "mac-disk-apfs",
      "platform": "macos",
      "group": "磁盘与归档",
      "groupId": "disk",
      "prompt": "查看 APFS 容器、卷和角色的层级关系，用哪条？",
      "options": [
        "diskutil list",
        "df -h",
        "diskutil apfs list",
        "mount"
      ],
      "answer": 2,
      "explain": "diskutil apfs list 会展示 APFS 容器与卷的关系；diskutil list 只看分区概览，df 和 mount 不展示 APFS 层级。"
    },
    {
      "id": "mac-sec-stapler",
      "platform": "macos",
      "group": "安全与加密",
      "groupId": "sec",
      "prompt": "App 已完成公证，想把公证票据附加到 MyApp.app，用哪条？",
      "options": [
        "stapler staple MyApp.app",
        "codesign --deep -s 'Developer ID' MyApp.app",
        "spctl --add MyApp.app",
        "notarytool submit MyApp.app"
      ],
      "answer": 0,
      "explain": "stapler staple 把已获取的公证票据附加到 App；codesign 负责签名，spctl 管评估策略，notarytool 负责提交公证。"
    },
    {
      "id": "mac-container-colima",
      "platform": "macos",
      "group": "容器与云",
      "groupId": "container",
      "prompt": "在 Apple Silicon Mac 上启动 Colima 的 Linux 容器虚拟机，用哪条？",
      "options": [
        "docker desktop start",
        "colima start",
        "limactl start default",
        "multipass launch"
      ],
      "answer": 1,
      "explain": "colima start 启动 Colima 管理的 Lima 虚拟机；limactl 是底层工具，Docker Desktop 是另一套产品。"
    },
    {
      "id": "mac-media-iconutil",
      "platform": "macos",
      "group": "多媒体与文档",
      "groupId": "media",
      "prompt": "把包含多尺寸 PNG 的 MyIcon.iconset 目录打包成 .icns，用哪条？",
      "options": [
        "sips -s format icns MyIcon.iconset",
        "png2icns MyIcon.iconset",
        "assetutil --icns MyIcon.iconset",
        "iconutil -c icns MyIcon.iconset"
      ],
      "answer": 3,
      "explain": "iconutil -c icns 专门把 iconset 目录转成 icns；sips 主要处理单张位图，命名和尺寸规则要由 iconset 保证。"
    },
    {
      "id": "mac-os-nvram",
      "platform": "macos",
      "group": "平台专属",
      "groupId": "os",
      "prompt": "读取当前 Mac 的 NVRAM 启动参数 boot-args，用哪条？",
      "options": [
        "defaults read boot-args",
        "nvram boot-args",
        "pmset -g",
        "system_profiler SPHardwareDataType"
      ],
      "answer": 1,
      "explain": "nvram 直接读取固件 NVRAM 变量；defaults 读用户偏好，pmset 管电源，system_profiler 看硬件概览。"
    },
    {
      "id": "mac-alias-whence",
      "platform": "macos",
      "group": "别名与符号",
      "groupId": "alias",
      "prompt": "在 zsh 中列出 PATH 里所有名为 python3 的匹配项，用哪条？",
      "options": [
        "whence -a python3",
        "which python3",
        "whereis python3",
        "command -v python3"
      ],
      "answer": 0,
      "explain": "whence -a 会列出所有匹配项；which 和 command -v 通常只给第一个，whereis 查的是文档和源码位置。"
    },
    {
      "id": "mac-other-perl",
      "platform": "macos",
      "group": "其他工具",
      "groupId": "other",
      "prompt": "只想筛出 app.log 中包含 ERROR 的行，以下哪条 Perl 单行命令正确？",
      "options": [
        "perl -pe 's/ERROR//' app.log",
        "perl -e 'print ERROR' app.log",
        "perl -ne 'print if /ERROR/' app.log",
        "perl -ne 'print unless /ERROR/' app.log"
      ],
      "answer": 2,
      "explain": "-n 逐行循环，-e 执行代码，print if /ERROR/ 只输出匹配行；-p 会自动打印所有行，unless 反而排除了 ERROR。"
    },
    {
      "id": "linux-nav-hash",
      "platform": "linux",
      "group": "基础与导航",
      "groupId": "nav",
      "prompt": "刚换了 python3 的安装路径，想让 bash 立即重新查找命令，用哪条？",
      "options": [
        "rehash",
        "clear",
        "unset PATH",
        "hash -r"
      ],
      "answer": 3,
      "explain": "hash -r 清空 bash 的命令路径缓存；rehash 是 zsh/fish 的写法，clear 只清屏，unset PATH 会破坏当前会话。"
    },
    {
      "id": "linux-file-mkfifo",
      "platform": "linux",
      "group": "文件与目录",
      "groupId": "file",
      "prompt": "需要让两个脚本通过命名管道传递数据，先创建 FIFO，用哪条？",
      "options": [
        "mkfifo /tmp/myfifo",
        "touch /tmp/myfifo",
        "mktemp /tmp/myfifo",
        "ln -s /tmp/myfifo /tmp/fifo"
      ],
      "answer": 0,
      "explain": "mkfifo 创建 FIFO；touch 创建普通文件，mktemp 生成临时普通文件，ln -s 创建符号链接。"
    },
    {
      "id": "linux-view-tee",
      "platform": "linux",
      "group": "查看与文本",
      "groupId": "view",
      "prompt": "想把 journalctl 的输出同时显示在终端并保存到 /tmp/nginx.log，用哪条？",
      "options": [
        "journalctl -u nginx > /tmp/nginx.log",
        "journalctl -u nginx | tee /tmp/nginx.log",
        "journalctl -u nginx | cat /tmp/nginx.log",
        "journalctl -u nginx | grep /tmp/nginx.log"
      ],
      "answer": 1,
      "explain": "tee 把标准输入复制到终端和文件；> 只写文件，cat 和 grep 不会把输出保存下来。"
    },
    {
      "id": "linux-perm-setfacl",
      "platform": "linux",
      "group": "权限与账号",
      "groupId": "perm",
      "prompt": "只给 alice 对 /srv/report.txt 的读写权限，且不改动其他用户，用哪条？",
      "options": [
        "chmod 777 /srv/report.txt",
        "chown alice /srv/report.txt",
        "setfacl -m u:alice:rw /srv/report.txt",
        "usermod -aG alice /srv/report.txt"
      ],
      "answer": 2,
      "explain": "setfacl 追加一条用户 ACL；chmod 777 会放开所有人，chown 改所有者，usermod 不接受文件路径。"
    },
    {
      "id": "linux-proc-renice",
      "platform": "linux",
      "group": "进程与系统",
      "groupId": "proc",
      "prompt": "把 PID 1234 的调度优先级调低 5，用哪条？",
      "options": [
        "nice -n 5 1234",
        "kill -5 1234",
        "chrt -p 5 1234",
        "renice +5 -p 1234"
      ],
      "answer": 3,
      "explain": "renice 修改已运行进程的 nice 值；nice 是启动新命令时设置，kill -5 发送信号，chrt 改实时调度策略。"
    },
    {
      "id": "linux-net-ethtool",
      "platform": "linux",
      "group": "网络与远程",
      "groupId": "net",
      "prompt": "查看 eth0 的协商速率、双工和链路状态，用哪条？",
      "options": [
        "ip addr show eth0",
        "ethtool eth0",
        "ss -lntp",
        "nmap -p 22 localhost"
      ],
      "answer": 1,
      "explain": "ethtool 读取网卡链路协商信息；ip addr 看 IP 和 MAC，ss 看套接字，nmap 扫描端口。"
    },
    {
      "id": "linux-dev-gdb",
      "platform": "linux",
      "group": "开发与版本控制",
      "groupId": "dev",
      "prompt": "用 GDB 调试带 -g 编译的 ./a.out，启动命令是哪条？",
      "options": [
        "gdb ./a.out",
        "lldb ./a.out",
        "strace ./a.out",
        "valgrind ./a.out"
      ],
      "answer": 0,
      "explain": "gdb ./a.out 进入 GNU 调试器；lldb 是另一套调试器，strace 跟踪系统调用，valgrind 主要查内存错误。"
    },
    {
      "id": "linux-pkg-snap",
      "platform": "linux",
      "group": "包管理与运行时",
      "groupId": "pkg",
      "prompt": "列出当前系统已安装的 Snap 包，用哪条？",
      "options": [
        "snap find postgresql",
        "apt list --installed",
        "snap list",
        "flatpak list"
      ],
      "answer": 2,
      "explain": "snap list 列出已安装 Snap；snap find 搜索商店，apt 和 flatpak 是其他包体系。"
    },
    {
      "id": "linux-disk-findmnt",
      "platform": "linux",
      "group": "磁盘与归档",
      "groupId": "disk",
      "prompt": "想精确反查 /home 来自哪块设备、哪个挂载点，用哪条？",
      "options": [
        "df -h /home",
        "lsblk /home",
        "mount | grep home",
        "findmnt -T /home"
      ],
      "answer": 3,
      "explain": "findmnt -T 按目标路径反查挂载来源；df 只看容量，lsblk 面向块设备，mount 输出需要再筛选。"
    },
    {
      "id": "linux-sec-ssh-keygen",
      "platform": "linux",
      "group": "安全与加密",
      "groupId": "sec",
      "prompt": "生成一对 Ed25519 SSH 密钥，并用邮箱做注释，用哪条？",
      "options": [
        "ssh-keygen -t ed25519 -C 'me@example.com'",
        "ssh-keygen -t rsa -b 4096",
        "openssl genrsa -out id_ed25519",
        "gpg --full-generate-key"
      ],
      "answer": 0,
      "explain": "ssh-keygen -t ed25519 生成 Ed25519 密钥，-C 添加注释；RSA 不是 Ed25519，openssl 和 gpg 生成的是其他密钥体系。"
    },
    {
      "id": "linux-container-podman",
      "platform": "linux",
      "group": "容器与云",
      "groupId": "container",
      "prompt": "列出 Podman 中包括已停止在内的所有容器，用哪条？",
      "options": [
        "docker ps -a",
        "podman ps -a",
        "podman images",
        "podman inspect"
      ],
      "answer": 1,
      "explain": "podman ps -a 列出所有容器；docker ps 是另一个引擎，images 看镜像，inspect 查看单个对象详情。"
    },
    {
      "id": "linux-media-sox",
      "platform": "linux",
      "group": "多媒体与文档",
      "groupId": "media",
      "prompt": "用 SoX 把 input.wav 转成 output.mp3，用哪条？",
      "options": [
        "ffmpeg -i input.wav output.mp3",
        "soxi input.wav output.mp3",
        "lame input.wav output.mp3",
        "sox input.wav output.mp3"
      ],
      "answer": 3,
      "explain": "sox 是 SoX 的主命令；ffmpeg 和 lame 也能转码，但题目指定用 SoX，soxi 只查看音频信息。"
    },
    {
      "id": "linux-os-resolvectl",
      "platform": "linux",
      "group": "平台专属",
      "groupId": "os",
      "prompt": "查看 systemd-resolved 为每个网络接口配置的 DNS 服务器，用哪条？",
      "options": [
        "cat /etc/resolv.conf",
        "dig example.com",
        "resolvectl status",
        "ip route"
      ],
      "answer": 2,
      "explain": "resolvectl status 展示按接口的 DNS、搜索域和解析状态；resolv.conf 可能只是兼容存根，dig 只查单次解析。"
    },
    {
      "id": "linux-alias-type",
      "platform": "linux",
      "group": "别名与符号",
      "groupId": "alias",
      "prompt": "在 bash 中确认 python3 是内建、别名还是 PATH 中的外部程序，用哪条？",
      "options": [
        "type -a python3",
        "which python3",
        "whereis python3",
        "command -v python3"
      ],
      "answer": 0,
      "explain": "type -a 按 bash 的解析顺序列出所有来源，包含别名、函数和内建；which 只看 PATH 中的可执行文件。"
    },
    {
      "id": "linux-other-ncdu",
      "platform": "linux",
      "group": "其他工具",
      "groupId": "other",
      "prompt": "想全屏浏览 /var/log 下各目录占用并按大小排序，用哪条？",
      "options": [
        "du -sh /var/log",
        "ncdu /var/log",
        "tree /var/log",
        "find /var/log -type f"
      ],
      "answer": 1,
      "explain": "ncdu 提供可交互的目录占用浏览和排序；du -sh 只给总量，tree 看结构，find 只列文件。"
    },
    {
      "id": "win-nav-get-history",
      "platform": "windows",
      "group": "基础与导航",
      "groupId": "nav",
      "prompt": "查看当前 PowerShell 会话执行过的命令，用哪条？",
      "options": [
        "history",
        "Get-Command",
        "Get-EventLog",
        "Get-History"
      ],
      "answer": 3,
      "explain": "Get-History 返回当前会话的命令历史；Get-Command 查命令本身，Get-EventLog 查事件日志。"
    },
    {
      "id": "win-file-get-item",
      "platform": "windows",
      "group": "文件与目录",
      "groupId": "file",
      "prompt": "读取单个 report.txt 的长度和修改时间，用哪条？",
      "options": [
        "Get-Item .\\report.txt",
        "Get-ChildItem .\\report.txt",
        "Get-Content .\\report.txt",
        "Select-String .\\report.txt"
      ],
      "answer": 0,
      "explain": "Get-Item 返回单个文件对象及属性；Get-ChildItem 适合批量枚举，Get-Content 读内容，Select-String 做文本匹配。"
    },
    {
      "id": "win-view-select-object",
      "platform": "windows",
      "group": "查看与文本",
      "groupId": "view",
      "prompt": "只显示前 5 个进程的 Name 和 CPU，用哪条？",
      "options": [
        "Get-Process | Where-Object { $_.CPU -gt 0 }",
        "Get-Process | Format-List Name,CPU",
        "Get-Process | Select-Object -First 5 Name,CPU",
        "Get-Process | Measure-Object CPU"
      ],
      "answer": 2,
      "explain": "Select-Object -First 5 Name,CPU 只保留前五项和两个属性；Where-Object 过滤，Format-List 全量展示，Measure-Object 做统计。"
    },
    {
      "id": "win-perm-get-localgroup",
      "platform": "windows",
      "group": "权限与账号",
      "groupId": "perm",
      "prompt": "列出本机所有本地用户组，用哪条？",
      "options": [
        "Get-LocalUser",
        "Get-LocalGroup",
        "Get-ADGroup",
        "whoami /groups"
      ],
      "answer": 1,
      "explain": "Get-LocalGroup 列出本地组；Get-LocalUser 列用户，Get-ADGroup 面向域，whoami /groups 只显示当前用户所属组。"
    },
    {
      "id": "win-proc-wait-process",
      "platform": "windows",
      "group": "进程与系统",
      "groupId": "proc",
      "prompt": "脚本启动 notepad 后，想等它退出再继续，用哪条？",
      "options": [
        "Stop-Process -Name notepad",
        "Start-Process notepad",
        "Get-Process notepad",
        "Wait-Process -Name notepad"
      ],
      "answer": 3,
      "explain": "Wait-Process 会阻塞到进程退出；Stop-Process 结束进程，Start-Process 只启动，Get-Process 只查看。"
    },
    {
      "id": "win-net-test-connection",
      "platform": "windows",
      "group": "网络与远程",
      "groupId": "net",
      "prompt": "用 PowerShell 向 example.com 发 4 次连通性测试，用哪条？",
      "options": [
        "Test-Connection example.com -Count 4",
        "ping example.com -n 4",
        "Test-NetConnection example.com",
        "Resolve-DnsName example.com"
      ],
      "answer": 0,
      "explain": "Test-Connection 是 PowerShell 的 ping 封装，-Count 指定次数；ping.exe 也能用，但不是 PowerShell 命令。"
    },
    {
      "id": "win-dev-dotnet",
      "platform": "windows",
      "group": "开发与版本控制",
      "groupId": "dev",
      "prompt": "查看已安装的 .NET SDK、运行时和架构，用哪条？",
      "options": [
        "dotnet --list-sdks",
        "nuget --version",
        "dotnet --info",
        "msbuild -version"
      ],
      "answer": 2,
      "explain": "dotnet --info 汇总 SDK、运行时和环境；--list-sdks 只列 SDK，nuget 和 msbuild 是另外的工具。"
    },
    {
      "id": "win-pkg-nuget",
      "platform": "windows",
      "group": "包管理与运行时",
      "groupId": "pkg",
      "prompt": "搜索 NuGet 源中的 Newtonsoft.Json 包，用哪条？",
      "options": [
        "dotnet list package",
        "nuget list Newtonsoft.Json",
        "nuget install Newtonsoft.Json",
        "nuget sources"
      ],
      "answer": 1,
      "explain": "nuget list 搜索包和版本；dotnet list package 看项目已引用包，install 直接安装，sources 管源地址。"
    },
    {
      "id": "win-disk-format-volume",
      "platform": "windows",
      "group": "磁盘与归档",
      "groupId": "disk",
      "prompt": "把 E: 盘格式化为 exFAT（会清空数据），用哪条？",
      "options": [
        "Clear-Disk -Number 1",
        "New-Volume -DriveLetter E -FileSystem exFAT",
        "Optimize-Volume -DriveLetter E",
        "Format-Volume -DriveLetter E -FileSystem exFAT"
      ],
      "answer": 3,
      "explain": "Format-Volume 对现有卷做格式化；Clear-Disk 清分区表，New-Volume 创建新卷，Optimize-Volume 只做优化。执行前必须确认盘符并备份。"
    },
    {
      "id": "win-sec-securestring",
      "platform": "windows",
      "group": "安全与加密",
      "groupId": "sec",
      "prompt": "把明文 P@ssw0rd 转成 SecureString 供凭据对象使用，用哪条？",
      "options": [
        "ConvertTo-SecureString 'P@ssw0rd' -AsPlainText -Force",
        "Read-Host -AsSecureString",
        "Get-Credential",
        "Protect-CmsMessage"
      ],
      "answer": 0,
      "explain": "ConvertTo-SecureString 把已知明文转成 SecureString；Read-Host 从输入读取，Get-Credential 弹窗，Protect-CmsMessage 做 CMS 加密。"
    },
    {
      "id": "win-container-podman",
      "platform": "windows",
      "group": "容器与云",
      "groupId": "container",
      "prompt": "列出 Podman 中包括已停止在内的所有容器，用哪条？",
      "options": [
        "docker ps",
        "podman images",
        "podman ps -a",
        "kubectl get pods"
      ],
      "answer": 2,
      "explain": "podman ps -a 显示所有容器；docker ps 默认只看运行中，images 看镜像，kubectl 面向 Kubernetes。"
    },
    {
      "id": "win-media-ffplay",
      "platform": "windows",
      "group": "多媒体与文档",
      "groupId": "media",
      "prompt": "用 FFmpeg 自带播放器快速预览 demo.mp4，用哪条？",
      "options": [
        "ffmpeg -i .\\demo.mp4",
        "ffplay .\\demo.mp4",
        "vlc --headless .\\demo.mp4",
        "mpv --no-video .\\demo.mp4"
      ],
      "answer": 1,
      "explain": "ffplay 是 FFmpeg 套件中的播放器；ffmpeg -i 只探测信息，vlc 和 mpv 是另外的播放器，不是 FFmpeg 自带。"
    },
    {
      "id": "win-os-get-hotfix",
      "platform": "windows",
      "group": "平台专属",
      "groupId": "os",
      "prompt": "查看最近安装的 Windows 补丁，按安装时间倒序，用哪条？",
      "options": [
        "Get-HotFix | Sort-Object InstalledOn -Descending",
        "Get-HotFix",
        "Get-WinEvent -LogName System",
        "Get-ComputerInfo"
      ],
      "answer": 0,
      "explain": "Get-HotFix 取补丁列表，再按 InstalledOn 倒序才能看最近的；Get-WinEvent 和 Get-ComputerInfo 不专门列补丁。"
    },
    {
      "id": "win-alias-get-alias",
      "platform": "windows",
      "group": "别名与符号",
      "groupId": "alias",
      "prompt": "查看 ll 这个 PowerShell 别名实际指向哪条命令，用哪条？",
      "options": [
        "Get-Command ll",
        "where.exe ll",
        "Get-History ll",
        "Get-Alias ll"
      ],
      "answer": 3,
      "explain": "Get-Alias 专门查询别名定义；Get-Command 查命令，where.exe 只找可执行文件，Get-History 看历史。"
    },
    {
      "id": "win-other-notepad",
      "platform": "windows",
      "group": "其他工具",
      "groupId": "other",
      "prompt": "用记事本打开当前目录的 notes.txt，用哪条？",
      "options": [
        "start .\\notes.txt",
        "notepad .\\notes.txt",
        "type .\\notes.txt",
        "edit .\\notes.txt"
      ],
      "answer": 1,
      "explain": "notepad 路径 会直接用记事本打开；start 用默认关联程序，type 在终端打印内容，edit 不是 Windows 默认命令。"
    }
  ]
};

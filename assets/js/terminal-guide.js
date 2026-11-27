/* 终端入门教程 · 三平台 8 节数据层
 * 教程只讲“先做什么、看到什么、怎么验收”，命令细节回到 terminal.html 命令库。
 */
window.TERMINAL_GUIDE = {
  version: "20261127z91n",
  libraryCount: 3095,
  tracks: [
    {
      id: "macos", label: "macOS", short: "Mac", shell: "zsh", glyph: "⌘",
      badge: "8 节 · 约 35 分钟",
      intro: "macOS 自带 zsh，终端在“应用程序 → 实用工具 → 终端”，也可以按 ⌘ + 空格 搜索 Terminal。下面的路径以 /Users/you 为例，换成你的用户名即可。",
      lessons: [
        {
          no: "01", title: "先确认：我在哪、我是谁、我用什么 Shell", time: "4 分钟",
          goal: "打开终端后，先建立方向感：当前目录、登录用户、Shell 类型和清屏方式。",
          why: "后面所有命令都依赖“当前目录”。先 pwd，再动手，是最便宜的防误删习惯。",
          steps: [
            { title: "看当前目录", cmd: "pwd", out: "/Users/you", note: "提示符里的 ~ 就是主目录；pwd 会给出完整绝对路径。" },
            { title: "看登录用户", cmd: "whoami", out: "you", note: "后面遇到权限问题时，先确认自己不是 root，也不是别的账号。" },
            { title: "看默认 Shell", cmd: "echo $SHELL", out: "/bin/zsh", note: "macOS 默认 zsh；如果显示 /bin/bash，语法仍大多通用。" },
            { title: "清屏但保留历史", cmd: "clear", out: "屏幕清空，历史仍在", note: "想连历史一起清，用 reset；日常 clear 就够了。" }
          ],
          check: "新开一个终端窗口，不看笔记说出：当前目录、用户名、Shell 路径。",
          tip: "把终端固定到程序坞，减少“找不到终端”的摩擦。"
        },
        {
          no: "02", title: "动文件之前，先学会看清目录", time: "5 分钟",
          goal: "用 ls、cd、mkdir、touch、cp、mv 完成一次安全的目录操作。",
          why: "终端里的删除没有回收站。先看清、再操作，比记住 rm -rf 更重要。",
          steps: [
            { title: "列出全部文件", cmd: "ls -la", out: "total 0\ndrwxr-xr-x  3 you staff ... .\n-rw-r--r--  1 you staff ... notes.txt", note: "-a 显示隐藏文件，-l 显示权限、所有者和大小。" },
            { title: "建一个练习目录并进入", cmd: "mkdir -p ~/terminal-lab/src && cd ~/terminal-lab", out: "（无输出，提示符路径变化）", note: "-p 会连同父目录一起建；已存在时不报错。" },
            { title: "建空文件并复制", cmd: "touch src/hello.txt && cp src/hello.txt src/hello.bak", out: "（无输出）", note: "touch 只更新时间戳，文件不存在时创建空文件。" },
            { title: "移动并改名", cmd: "mv src/hello.bak src/hello.backup", out: "（无输出）", note: "mv 同时承担移动和重命名；目标存在时会被覆盖。" }
          ],
          check: "在 ~/terminal-lab 下说出 ls -la 第一列每个字符的含义，再删掉自己新建的 hello.backup。",
          tip: "删除前先 pwd && ls 目标路径；不确定就先 mv 到 /tmp 隔离。"
        },
        {
          no: "03", title: "读文件、追日志、搜关键词", time: "5 分钟",
          goal: "用 cat、less、tail -f、grep 找到日志里的错误行，并知道输出在哪个文件。",
          why: "排障 80% 的时间在找证据。会读日志，比会背命令更值钱。",
          steps: [
            { title: "先看小文件", cmd: "cat ~/terminal-lab/notes.txt", out: "文件内容直接打印", note: "大文件不要 cat，会刷屏；改用 less。" },
            { title: "分页读大文件", cmd: "less /var/log/system.log", out: "进入分页视图", note: "空格翻页，/ 搜索，q 退出；按 G 跳到末尾。" },
            { title: "只看最后 20 行并持续追", cmd: "tail -n 20 -f /var/log/system.log", out: "最近 20 行，之后实时追加", note: "Ctrl-C 退出；-f 适合边复现边看。" },
            { title: "带行号搜错误", cmd: "grep -n -i 'error' /var/log/system.log | tail -20", out: "1234: ... error ...", note: "-n 行号，-i 忽略大小写；先缩小范围再搜。" }
          ],
          check: "在 /var/log/system.log 里找出最近 3 条包含 error 的行，并说出它们的时间。",
          tip: "日志太大时先 tail -n 100，再 grep；不要一上来 grep 整个 10GB 文件。"
        },
        {
          no: "04", title: "权限：谁能读、谁能执行、何时用 sudo", time: "5 分钟",
          goal: "看懂 ls -l 的权限位，给脚本加执行权限，并知道 sudo 的边界。",
          why: "Permission denied 不是靠 sudo 糊过去；先判断是文件权限、所有者还是目录权限。",
          steps: [
            { title: "看权限位", cmd: "ls -l ~/terminal-lab/src/hello.txt", out: "-rw-r--r--  1 you staff ... hello.txt", note: "r 读、w 写、x 执行；三组分别是所有者、组、其他人。" },
            { title: "给脚本加执行权限", cmd: "chmod +x ~/terminal-lab/src/hello.sh", out: "（无输出）", note: "只加执行位，不改变读写权限；用 ls -l 复查。" },
            { title: "确认所有者", cmd: "ls -l ~/terminal-lab/src/hello.sh", out: "-rwxr-xr-x  1 you staff ... hello.sh", note: "属主不对时，chown 改所有者，不要无脑 777。" },
            { title: "只在必要时提权", cmd: "sudo -v", out: "Password:", note: "sudo 只对单条命令提权；不要长期开 root shell。" }
          ],
          check: "把一个自己写的 .sh 脚本改成可执行，并解释 -rwxr-xr-x 每一位的含义。",
          tip: "chmod 777 会让所有人可写；优先最小权限，必要时只给组权限。"
        },
        {
          no: "05", title: "进程与端口：谁在跑、谁占着 8080", time: "5 分钟",
          goal: "用 ps、pgrep、kill、lsof 找到进程和端口占用，并安全停止。",
          why: "服务起不来，常见原因不是代码，而是端口被旧进程占着。先定位 PID，再决定杀不杀。",
          steps: [
            { title: "看所有进程", cmd: "ps aux | head -20", out: "USER PID %CPU %MEM ... COMMAND", note: "PID 是进程号；COMMAND 是启动命令。" },
            { title: "按名字找进程", cmd: "pgrep -fl java", out: "1234 /usr/bin/java -jar app.jar", note: "-f 匹配完整命令行，-l 显示进程名。" },
            { title: "看谁占用 8080", cmd: "lsof -nP -iTCP:8080 -sTCP:LISTEN", out: "java 1234 you  ... TCP *:8080 (LISTEN)", note: "没有输出说明没人监听；有输出就看 PID。" },
            { title: "先温和停止", cmd: "kill -TERM 1234", out: "（无输出）", note: "先 TERM 让进程收尾；不行再 kill -9，且确认 PID 没被复用。" }
          ],
          check: "启动一个本地服务，用 lsof 找到它的 PID，再用 kill -TERM 正常退出。",
          tip: "kill -9 不给进程清理机会；数据库、编辑器这类进程优先 TERM。"
        },
        {
          no: "06", title: "网络：连通性、HTTP 和 SSH", time: "5 分钟",
          goal: "用 ping、curl、ssh、scp 判断“是 DNS、网络还是服务本身”的问题。",
          why: "不要一遇到网络问题就重启。先分层：域名能不能解析、端口通不通、HTTP 返回什么。",
          steps: [
            { title: "先看 DNS 和连通性", cmd: "ping -c 4 example.com", out: "4 packets transmitted, 4 received", note: "ping 通不代表端口通；不通也可能是 ICMP 被禁。" },
            { title: "看 HTTP 响应头", cmd: "curl -I https://example.com", out: "HTTP/2 200\ncontent-type: text/html", note: "-I 只看头，快速判断状态码、重定向和缓存。" },
            { title: "测 SSH 端口", cmd: "nc -vz example.com 22", out: "Connection to example.com 22 port [tcp/ssh] succeeded!", note: "比 ssh 更轻，只测 TCP 是否能连。" },
            { title: "安全复制文件", cmd: "scp ~/terminal-lab/notes.txt user@example.com:~/notes.txt", out: "notes.txt 100% ...", note: "scp 走 SSH；传大量文件优先 rsync。" }
          ],
          check: "对一个你管理的域名依次做 ping、curl -I、nc 端口测试，并记录三层结果。",
          tip: "公司网络可能拦截 ICMP 或 22；测试结果要结合代理和防火墙。"
        },
        {
          no: "07", title: "装环境：包管理、运行时和版本确认", time: "5 分钟",
          goal: "用 Homebrew 安装工具，确认 Java、Git、Node 的版本和来源。",
          why: "“命令找不到”多半是 PATH 或没装；先看版本和 which，再谈重装。",
          steps: [
            { title: "装命令行工具", cmd: "xcode-select --install", out: "弹出安装确认", note: "git、clang 等基础工具依赖它；已装会提示已安装。" },
            { title: "用 Homebrew 装包", cmd: "brew install wget", out: "==> Pouring wget...", note: "先 brew search 确认包名；升级用 brew upgrade。" },
            { title: "确认命令来源", cmd: "which -a java && java -version", out: "/opt/homebrew/opt/openjdk/bin/java\nopenjdk 21...", note: "多个 Java 时，/usr/libexec/java_home -V 看全部。" },
            { title: "确认 Git 配置", cmd: "git config --global user.name && git config --global user.email", out: "Your Name\nyou@example.com", note: "没配置就先补，否则提交作者信息会错。" }
          ],
          check: "装一个自己需要的 CLI 工具，写出它的绝对路径和版本号。",
          tip: "Apple Silicon 的 Homebrew 默认在 /opt/homebrew，Intel 在 /usr/local。"
        },
        {
          no: "08", title: "收故障：磁盘、日志和系统信息", time: "6 分钟",
          goal: "用 df、du、log show、dmesg 定位“磁盘满、系统卡、驱动报错”。",
          why: "最后一步不是背更多命令，而是能独立收集证据，把问题描述清楚。",
          steps: [
            { title: "看磁盘剩余", cmd: "df -h /", out: "/dev/disk3s1  228Gi  180Gi  30Gi  86%  /", note: "关注 Use% 和 Available；接近 100% 会拖慢系统。" },
            { title: "找大目录", cmd: "du -sh ~/Library/Caches ~/Downloads 2>/dev/null", out: " 12G /Users/you/Library/Caches\n 3.1G /Users/you/Downloads", note: "从大目录往下钻，不要一上来扫整个磁盘。" },
            { title: "看最近系统日志", cmd: "log show --last 5m --predicate 'messageType == \"error\"'", out: "Timestamp ... error ...", note: "日志量大，先用时间范围和 error 过滤。" },
            { title: "看内核环形缓冲", cmd: "sudo dmesg | tail -30", out: "最近 30 条内核消息", note: "驱动、USB、磁盘异常常在这里出现。" }
          ],
          check: "写出一段可复现的故障描述：现象、时间、涉及目录/进程、已收集的日志证据。",
          tip: "重启前先导出日志；重启会丢掉现场。"
        }
      ]
    },
    {
      id: "linux", label: "Linux", short: "Linux", shell: "Bash", glyph: "L",
      badge: "8 节 · 约 40 分钟",
      intro: "Linux 发行版很多，终端通常叫 Terminal、Console 或 Shell。下面以 Bash 和 Debian/Ubuntu 为例；RHEL 系把 apt 换成 dnf，把 systemctl 的用法不变。",
      lessons: [
        {
          no: "01", title: "登录后先确认主机、用户和 Shell", time: "4 分钟",
          goal: "知道自己在哪台机器、哪个账号、什么发行版和 Shell。",
          why: "在服务器上敲命令，先确认主机名，避免“在测试机执行生产命令”的低级事故。",
          steps: [
            { title: "看当前目录", cmd: "pwd", out: "/home/you", note: "服务器登录后通常在用户主目录；cd / 才是根目录。" },
            { title: "看用户和主机", cmd: "whoami && hostname", out: "you\nweb-01", note: "生产机建议在提示符里显示主机名和分支。" },
            { title: "看发行版和 Shell", cmd: "cat /etc/os-release | head -4 && echo $SHELL", out: "NAME=\"Ubuntu\"\nVERSION=\"24.04 LTS\"\n/bin/bash", note: "不同发行版的包管理命令不同，先确认再用。" },
            { title: "看开机多久", cmd: "uptime -p", out: "up 3 days, 4 hours", note: "异常重启或补丁后未重启，先看这个值。" }
          ],
          check: "在一台新机器上说出：主机名、发行版、Shell、已运行时长。",
          tip: "用 ssh 登录时，先看提示符里的 user@host，确认不是错机器。"
        },
        {
          no: "02", title: "目录与文件：先看清，再删除", time: "5 分钟",
          goal: "用 ls、cd、mkdir、cp、mv、rm 完成一次可回滚的目录操作。",
          why: "Linux 没有回收站，rm 直接落盘。把“确认路径”变成肌肉记忆。",
          steps: [
            { title: "列出目录", cmd: "ls -la /etc/nginx", out: "drwxr-xr-x ... .\n-rw-r--r-- ... nginx.conf", note: "-a 看隐藏文件，-l 看权限和所有者。" },
            { title: "建练习目录", cmd: "mkdir -p ~/terminal-lab/src && cd ~/terminal-lab", out: "（无输出，提示符变化）", note: "-p 建父目录；已存在不报错。" },
            { title: "复制并保留属性", cmd: "cp -a src/hello.txt src/hello.bak", out: "（无输出）", note: "-a 保留时间戳和权限；普通复制不加。" },
            { title: "删除前先预览", cmd: "ls -la src/hello.bak && rm src/hello.bak", out: "hello.bak 被删除", note: "先 ls 确认，再 rm；目录用 rm -r，且先 pwd。" }
          ],
          check: "新建一个目录，复制一个文件进去，再用 ls 验证后删除；全程记录 pwd。",
          tip: "不确定的删除先 mv 到 /tmp/trash-$(date +%s)，确认后再清。"
        },
        {
          no: "03", title: "文本与日志：从 journalctl 到 grep", time: "5 分钟",
          goal: "用 cat、less、tail、grep、journalctl 找到服务报错的上下文。",
          why: "Linux 排障的核心证据在 journalctl 和应用日志；会过滤比会背参数重要。",
          steps: [
            { title: "看服务日志", cmd: "journalctl -u nginx --since '10 min ago' --no-pager", out: "最近 10 分钟的 nginx 日志", note: "需要 systemd；--no-pager 直接输出，方便接 grep。" },
            { title: "追应用日志", cmd: "tail -n 50 -f /var/log/nginx/error.log", out: "最近 50 行并实时追加", note: "Ctrl-C 退出；先 tail 再 grep，避免刷屏。" },
            { title: "带上下文搜错误", cmd: "grep -n -B2 -A5 'error' /var/log/nginx/error.log", out: "行号 + 前 2 行 + 后 5 行", note: "-B/-A 给出上下文，单看一行容易误判。" },
            { title: "分页读配置", cmd: "less /etc/nginx/nginx.conf", out: "进入分页视图", note: "/ 搜索、q 退出；改配置前先备份。" }
          ],
          check: "对一个 systemd 服务取最近 10 分钟日志，找出第一条 error 及其前后 5 行。",
          tip: "journalctl -xe 是快捷入口，但精确排障更推荐 -u 服务名 + 时间范围。"
        },
        {
          no: "04", title: "用户、权限和 sudo 的边界", time: "5 分钟",
          goal: "看懂 rwx、属主/属组，使用 chmod/chown，并知道 sudo 的最小使用方式。",
          why: "服务器上 777 是事故温床；先判断需要谁读、谁写、谁执行，再给权限。",
          steps: [
            { title: "看身份和组", cmd: "id && groups", out: "uid=1000(you) gid=1000(you) groups=1000(you),27(sudo)", note: "确认自己在 sudo 组，避免每步都失败。" },
            { title: "看文件权限", cmd: "ls -l /etc/hosts", out: "-rw-r--r-- 1 root root ... /etc/hosts", note: "三组 rwx 分别是属主、属组、其他人。" },
            { title: "只给必要执行位", cmd: "chmod u+x ~/terminal-lab/hello.sh", out: "（无输出）", note: "u+x 只给属主执行；不要 chmod 777。" },
            { title: "改属主前先确认", cmd: "sudo chown you:you ~/terminal-lab/hello.sh", out: "（无输出）", note: "chown 需要 root；改错属主会影响服务读取。" }
          ],
          check: "解释 -rwxr-x--- 的每一位，并把一个脚本改成“属主可执行、组可读”。",
          tip: "sudo 只提权一条命令；用 sudo -l 查看自己能执行什么。"
        },
        {
          no: "05", title: "进程、服务与端口", time: "6 分钟",
          goal: "用 ps、systemctl、journalctl、ss、kill 定位服务失败和端口占用。",
          why: "Linux 服务由 systemd 管；先看 unit 状态，再杀进程，顺序不能反。",
          steps: [
            { title: "看服务状态", cmd: "systemctl status nginx --no-pager", out: "● nginx.service - A high performance web server\n   Active: active (running)", note: "Active 行和最后几行日志最关键。" },
            { title: "看谁监听端口", cmd: "ss -tulpn | grep ':80'", out: "tcp LISTEN 0 511 0.0.0.0:80 users:((\"nginx\",pid=1234,...))", note: "需要 root 才能看到进程名；没有就加 sudo。" },
            { title: "按名字找进程", cmd: "pgrep -af nginx", out: "1234 nginx: worker process", note: "-a 显示完整命令行；确认 PID 再操作。" },
            { title: "先重启服务而不是杀进程", cmd: "sudo systemctl restart nginx", out: "（无输出）", note: "改配置后用 restart；只想重载配置用 reload。" }
          ],
          check: "让一个本地服务监听 8080，用 ss 找到 PID，再用 systemctl 或 kill 正常停止。",
          tip: "systemd 服务反复重启，先 journalctl -u 服务名 -n 100 看退出原因。"
        },
        {
          no: "06", title: "网络：IP、路由、DNS 和远程传输", time: "5 分钟",
          goal: "用 ip、ping、dig、curl、ssh、rsync 分层定位网络问题。",
          why: "先看本机地址和路由，再看 DNS，再看端口，最后才怀疑应用。",
          steps: [
            { title: "看网卡和地址", cmd: "ip -brief address", out: "lo UNKNOWN 127.0.0.1/8\neth0 UP 192.168.1.20/24", note: "确认网卡 UP、地址和网段；容器里通常是 eth0。" },
            { title: "看默认路由", cmd: "ip route show default", out: "default via 192.168.1.1 dev eth0", note: "没有默认路由就出不了外网。" },
            { title: "查 DNS", cmd: "dig +short example.com", out: "93.184.216.34", note: "没有 dig 用 getent hosts；先确认解析再 curl。" },
            { title: "远程同步", cmd: "rsync -avz ~/terminal-lab/ user@example.com:~/terminal-lab/", out: "sending incremental file list ...", note: "末尾斜杠表示同步目录内容；不加会变成子目录。" }
          ],
          check: "依次执行 ip route、dig、curl -I、nc -vz，记录哪一层先失败。",
          tip: "服务器不能上网时，先看路由和 DNS，再看防火墙/安全组。"
        },
        {
          no: "07", title: "包管理与运行时：apt、dnf 和版本", time: "5 分钟",
          goal: "用发行版包管理器安装工具，确认 Java、Git、Node 的版本和路径。",
          why: "不同发行版命令不同；先确认系统，再选 apt、dnf、pacman 或 zypper。",
          steps: [
            { title: "更新索引", cmd: "sudo apt update", out: "Reading package lists... Done", note: "只更新索引，不升级已装包；升级用 apt upgrade。" },
            { title: "安装工具", cmd: "sudo apt install -y curl", out: "Setting up curl ...", note: "-y 跳过确认；生产环境先看将要安装的包。" },
            { title: "确认 Java 版本", cmd: "java -version && which java", out: "openjdk version \"21.0.5\" ...\n/usr/bin/java", note: "多版本用 update-alternatives --config java 切换。" },
            { title: "确认 Git", cmd: "git --version && git config --global user.name", out: "git version 2.43.0\nYour Name", note: "没配置就先补用户名和邮箱。" }
          ],
          check: "在一台 Debian/Ubuntu 上装一个 CLI 工具，写出包名、版本和可执行文件路径。",
          tip: "RHEL 系把 apt 换成 dnf，Arch 用 pacman -S，openSUSE 用 zypper install。"
        },
        {
          no: "08", title: "收故障：磁盘、内存、内核日志", time: "6 分钟",
          goal: "用 df、du、free、dmesg、journalctl 判断磁盘满、内存不足或内核报错。",
          why: "服务挂了不一定是代码；先看资源，再看日志，最后才改配置。",
          steps: [
            { title: "看磁盘", cmd: "df -h", out: "Filesystem Size Used Avail Use% Mounted on\n/dev/sda1 100G 82G 18G 82% /", note: "关注 Use% 和 inode：df -i 可看 inode 是否耗尽。" },
            { title: "找大目录", cmd: "sudo du -xh --max-depth=1 /var | sort -h | tail -10", out: "12G /var/lib\n4.0G /var/log", note: "从 /var 往下钻，别一上来扫根目录。" },
            { title: "看内存", cmd: "free -h", out: "Mem: 15Gi 9.2Gi 1.1Gi ...\nSwap: 2.0Gi 0B 2.0Gi", note: "重点看 available；swap 大量使用说明内存紧张。" },
            { title: "看内核日志", cmd: "sudo dmesg -T | tail -30", out: "[Thu Nov 27 ...] ...", note: "-T 显示可读时间；OOM、磁盘错误常在这里。" }
          ],
          check: "写出一段故障描述：哪台机器、什么时间、哪个资源接近耗尽、对应日志证据。",
          tip: "清理日志前先确认服务还在写；用 logrotate 而不是直接 rm 正在写的文件。"
        }
      ]
    },
    {
      id: "windows", label: "Windows", short: "Win", shell: "PowerShell", glyph: "W",
      badge: "8 节 · 约 40 分钟",
      intro: "Windows 推荐用 Windows Terminal 里的 PowerShell，而不是老 cmd。开始菜单搜索 Terminal，或按 Win + X 选择 Terminal。下面命令以 PowerShell 7 为准，cmd 专属写法会单独标注。",
      lessons: [
        {
          no: "01", title: "打开 PowerShell，先确认位置和版本", time: "4 分钟",
          goal: "知道当前目录、登录用户、PowerShell 版本，以及如何清屏。",
          why: "PowerShell 的路径和 cmd 不同；先 Get-Location，避免在错误的盘符下操作。",
          steps: [
            { title: "看当前目录", cmd: "Get-Location", out: "Path\nC:\\Users\\you", note: "PowerShell 提示符通常显示 PS C:\\Users\\you>。" },
            { title: "看登录用户", cmd: "whoami", out: "desktop-01\\you", note: "域环境会带域名前缀。" },
            { title: "看 PowerShell 版本", cmd: "$PSVersionTable.PSVersion", out: "Major 7\nMinor 5", note: "PowerShell 7 用 pwsh；Windows PowerShell 5.1 是 powershell。" },
            { title: "清屏", cmd: "Clear-Host", out: "屏幕清空", note: "别名 cls 也能用；历史仍保留，可用 Get-History 查看。" }
          ],
          check: "新开一个 Terminal 标签，说出当前目录、用户和 PowerShell 主版本号。",
          tip: "固定用 Windows Terminal，少用 cmd；PowerShell 的管道和对象能力强很多。"
        },
        {
          no: "02", title: "目录与文件：Get-ChildItem 到 Remove-Item", time: "5 分钟",
          goal: "用 Get-ChildItem、Set-Location、New-Item、Copy-Item、Move-Item、Remove-Item 完成一次目录操作。",
          why: "PowerShell 命令名长，但动词-名词结构有规律；先用 Get-Help 看参数。",
          steps: [
            { title: "列出目录", cmd: "Get-ChildItem -Force", out: "Directory: C:\\Users\\you\nMode Name\n---- ----\nd---- .git\n-a--- notes.txt", note: "-Force 显示隐藏项；别名 ls/dir 也能用。" },
            { title: "建练习目录", cmd: "New-Item -ItemType Directory -Path C:\\terminal-lab\\src -Force", out: "Directory: C:\\terminal-lab", note: "-Force 已存在时不报错。" },
            { title: "复制并改名", cmd: "Copy-Item C:\\terminal-lab\\src\\hello.txt C:\\terminal-lab\\src\\hello.bak", out: "（无输出）", note: "覆盖已存在文件需 -Force；先 Test-Path 确认。" },
            { title: "移动并删除", cmd: "Move-Item C:\\terminal-lab\\src\\hello.bak C:\\terminal-lab\\src\\hello.backup; Remove-Item C:\\terminal-lab\\src\\hello.backup", out: "（无输出）", note: "Remove-Item 不进回收站；删除前先 Get-Item 确认。" }
          ],
          check: "建一个目录、复制一个文件、改名，再用 Get-ChildItem 验证后删除。",
          tip: "不确定路径时先 Get-Item 或 Test-Path；删除目录用 -Recurse -Force 前必须确认。"
        },
        {
          no: "03", title: "读文件、过滤和追日志", time: "5 分钟",
          goal: "用 Get-Content、Select-String、Measure-Object 读取和筛选文本。",
          why: "PowerShell 输出的是对象，不是纯文本；会过滤对象，比 grep 字符串更灵活。",
          steps: [
            { title: "读文件", cmd: "Get-Content .\\notes.txt", out: "文件内容逐行输出", note: "大文件用 -Tail 20；实时追用 -Wait。" },
            { title: "实时追日志", cmd: "Get-Content .\\app.log -Tail 20 -Wait", out: "最近 20 行，之后持续追加", note: "Ctrl-C 退出；日志轮转时可能断开。" },
            { title: "搜关键词", cmd: "Select-String -Path .\\app.log -Pattern 'ERROR' -Context 2,5", out: "app.log:12:ERROR ...", note: "Context 给出前后行；-SimpleMatch 可关闭正则。" },
            { title: "统计行数", cmd: "Get-Content .\\app.log | Measure-Object -Line", out: "Lines 1200", note: "大文件也可用 (Get-Content .\\app.log).Count。" }
          ],
          check: "在 app.log 里找出最近 3 条 ERROR，并说出它们前后各 2 行。",
          tip: "Select-String 默认不区分大小写；需要严格匹配时加 -CaseSensitive。"
        },
        {
          no: "04", title: "权限与执行策略", time: "5 分钟",
          goal: "用 Get-Acl、icacls、Get-ExecutionPolicy 判断文件和脚本为什么被拦。",
          why: "Windows 有两套边界：NTFS 权限和 PowerShell 执行策略；不要把它们混为一谈。",
          steps: [
            { title: "看文件 ACL", cmd: "Get-Acl .\\notes.txt | Format-List", out: "Path: C:\\...\\notes.txt\nOwner: DESKTOP-01\\you\nAccess: ...", note: "ACL 决定谁能读写；Format-List 展开全部。" },
            { title: "用 icacls 看继承", cmd: "icacls .\\notes.txt", out: "notes.txt DESKTOP-01\\you:(F)\n  NT AUTHORITY\\SYSTEM:(F)", note: "(F) 完全控制，(M) 修改，(R) 只读。" },
            { title: "看脚本执行策略", cmd: "Get-ExecutionPolicy -List", out: "Scope ExecutionPolicy\nMachinePolicy Undefined\nCurrentUser RemoteSigned", note: "策略按作用域覆盖；不要直接设 Unrestricted。" },
            { title: "以管理员启动一次命令", cmd: "Start-Process pwsh -Verb RunAs", out: "弹出 UAC 确认", note: "只对需要提权的操作使用；不要长期开管理员终端。" }
          ],
          check: "解释 Get-Acl 和 Get-ExecutionPolicy 分别管什么，并把当前用户的策略改成 RemoteSigned。",
          tip: "脚本被拦时先看执行策略，再看文件是否被“锁定”（Unblock-File）。"
        },
        {
          no: "05", title: "进程、服务和端口", time: "6 分钟",
          goal: "用 Get-Process、Stop-Process、Get-Service、Get-NetTCPConnection 定位占用。",
          why: "Windows 的端口占用常被多个 svchost 或旧 Java 进程占着；先看 PID 和服务归属。",
          steps: [
            { title: "看进程", cmd: "Get-Process | Sort-Object CPU -Descending | Select-Object -First 10", out: "Name Id CPU\njava 1234 320.5", note: "CPU 是累计值；想看实时占用用 Get-Counter。" },
            { title: "看端口占用", cmd: "Get-NetTCPConnection -LocalPort 8080 -State Listen | Select-Object LocalAddress,LocalPort,OwningProcess", out: "LocalAddress LocalPort OwningProcess\n0.0.0.0 8080 1234", note: "OwningProcess 就是 PID；再用 Get-Process -Id 查名字。" },
            { title: "看服务", cmd: "Get-Service -Name Spooler", out: "Status Name DisplayName\nRunning Spooler Print Spooler", note: "服务名和显示名不同；用 -DisplayName 模糊查。" },
            { title: "先温和停止进程", cmd: "Stop-Process -Id 1234", out: "（无输出）", note: "默认强制结束；能正常关闭的程序优先用应用自己的退出。" }
          ],
          check: "让一个程序监听 8080，用 Get-NetTCPConnection 找到 PID，再用 Get-Process 确认并停止。",
          tip: "Stop-Process 不带 -Force 也可能直接结束；数据库类进程优先走服务停止。"
        },
        {
          no: "06", title: "网络：IP、DNS、端口和 HTTP", time: "5 分钟",
          goal: "用 Get-NetIPConfiguration、Resolve-DnsName、Test-NetConnection、Invoke-WebRequest 分层排障。",
          why: "Windows 网络问题常出在 DNS、代理或防火墙；按层测，别一上来重启网卡。",
          steps: [
            { title: "看 IP 配置", cmd: "Get-NetIPConfiguration", out: "InterfaceAlias : Ethernet\nIPv4Address : 192.168.1.20\nIPv4DefaultGateway : 192.168.1.1", note: "确认地址、网关和 DNS；没有地址就看 DHCP。" },
            { title: "查 DNS", cmd: "Resolve-DnsName example.com -Type A", out: "Name Type TTL Address\nexample.com A 300 93.184.216.34", note: "解析失败先看 DNS 服务器和代理。" },
            { title: "测端口", cmd: "Test-NetConnection example.com -Port 443", out: "TcpTestSucceeded : True", note: "比 ping 更贴近真实服务；ICMP 常被禁。" },
            { title: "看 HTTP", cmd: "Invoke-WebRequest https://example.com -Method Head", out: "StatusCode : 200", note: "需要代理时加 -Proxy；证书错误先查系统时间。" }
          ],
          check: "对一个域名依次做 Resolve-DnsName、Test-NetConnection、Invoke-WebRequest，记录哪层失败。",
          tip: "公司网络可能强制代理；PowerShell 默认不一定走系统代理，必要时显式 -Proxy。"
        },
        {
          no: "07", title: "装环境：winget、运行时和版本", time: "5 分钟",
          goal: "用 winget 安装工具，确认 Java、Git、Node 的版本和路径。",
          why: "Windows 安装来源多；优先 winget，其次官方安装包，避免来路不明的 exe。",
          steps: [
            { title: "搜索包", cmd: "winget search --name Git", out: "Name Id Version\nGit Git.Git 2.47.1", note: "先看 Id 和来源；安装时用 Id 最稳。" },
            { title: "安装", cmd: "winget install --id Git.Git -e --source winget", out: "Successfully installed", note: "-e 精确匹配；安装后新开终端让 PATH 生效。" },
            { title: "确认 Java", cmd: "java -version; Get-Command java | Select-Object Source", out: "openjdk version \"21...\"\nC:\\Program Files\\Java\\...\\java.exe", note: "多个 JDK 时用 where.exe java 看全部路径。" },
            { title: "确认 Git", cmd: "git --version; git config --global user.name", out: "git version 2.47.1\nYour Name", note: "没配置就先补用户名和邮箱。" }
          ],
          check: "用 winget 装一个 CLI 工具，写出包 Id、版本和可执行文件路径。",
          tip: "winget 源被公司拦截时，用官方 MSI 并校验签名；不要关掉 SmartScreen 了事。"
        },
        {
          no: "08", title: "收故障：磁盘、事件日志和系统信息", time: "6 分钟",
          goal: "用 Get-Volume、Get-WinEvent、Get-ComputerInfo 定位磁盘满、服务崩溃和系统异常。",
          why: "Windows 的现场在事件日志和性能计数器；先收集，再重启。",
          steps: [
            { title: "看磁盘", cmd: "Get-Volume | Format-Table DriveLetter,FileSystemLabel,SizeRemaining,Size", out: "C: Windows 30GB 228GB", note: "SizeRemaining 接近 0 会拖慢系统。" },
            { title: "找大目录", cmd: "Get-ChildItem C:\\Users\\you -Recurse -File | Measure-Object Length -Sum", out: "Count 12000\nSum 12.3GB", note: "递归大目录会慢；先限定到 Downloads 或 AppData。" },
            { title: "看系统事件", cmd: "Get-WinEvent -LogName System -MaxEvents 20 | Format-Table TimeCreated,Id,LevelDisplayName,Message", out: "TimeCreated Id Level Message", note: "先看 Error/Critical；事件 ID 可查官方文档。" },
            { title: "看系统摘要", cmd: "Get-ComputerInfo | Select-Object WindowsProductName,OsVersion,TotalPhysicalMemory", out: "WindowsProductName Windows 11 Pro\nOsVersion 10.0.26100", note: "输出很多，选需要的字段，别整段刷屏。" }
          ],
          check: "写一段故障描述：哪台机器、什么时间、哪个盘/服务、对应事件 ID 和日志。",
          tip: "重启前先导出事件日志（Export-Csv），否则现场会丢。"
        }
      ]
    }
  ],
  compare: [
    { job: "看当前目录", macos: "pwd", linux: "pwd", windows: "Get-Location" },
    { job: "列目录（含隐藏）", macos: "ls -la", linux: "ls -la", windows: "Get-ChildItem -Force" },
    { job: "切目录", macos: "cd ~/Projects", linux: "cd ~/Projects", windows: "Set-Location C:\\Projects" },
    { job: "读文件", macos: "cat notes.txt", linux: "cat notes.txt", windows: "Get-Content .\\notes.txt" },
    { job: "追日志", macos: "tail -f app.log", linux: "tail -f app.log", windows: "Get-Content .\\app.log -Wait" },
    { job: "搜关键词", macos: "grep -n error app.log", linux: "grep -n error app.log", windows: "Select-String -Path .\\app.log -Pattern error" },
    { job: "看权限", macos: "ls -l file", linux: "ls -l file", windows: "Get-Acl .\\file | Format-List" },
    { job: "看进程", macos: "ps aux", linux: "ps aux", windows: "Get-Process" },
    { job: "看端口", macos: "lsof -i :8080", linux: "ss -tulpn | grep :8080", windows: "Get-NetTCPConnection -LocalPort 8080" },
    { job: "看服务", macos: "launchctl list", linux: "systemctl status nginx", windows: "Get-Service -Name Spooler" },
    { job: "看 IP", macos: "ipconfig getifaddr en0", linux: "ip -brief address", windows: "Get-NetIPConfiguration" },
    { job: "测端口", macos: "nc -vz host 443", linux: "nc -vz host 443", windows: "Test-NetConnection host -Port 443" },
    { job: "装包", macos: "brew install wget", linux: "sudo apt install wget", windows: "winget install --id GNU.Wget2 -e" },
    { job: "查版本", macos: "java -version", linux: "java -version", windows: "java -version" },
    { job: "看磁盘", macos: "df -h", linux: "df -h", windows: "Get-Volume" },
    { job: "看日志", macos: "log show --last 5m", linux: "journalctl -xe", windows: "Get-WinEvent -LogName System -MaxEvents 20" }
  ]
};

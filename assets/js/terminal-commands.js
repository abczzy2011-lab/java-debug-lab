/* 终端常用指令 · 数据层
 * macOS 200 条，按 8 个真实使用场景分组；Linux / Windows 复用同一套框架。
 */
window.TERMINAL_DATA = {
  "version": "20261126z86",
  "title": "终端常用指令",
  "groups": [
    {
      "id": "nav",
      "no": "01",
      "name": "基础与导航",
      "short": "基础",
      "tone": "mint",
      "blurb": "先知道自己站在哪、目录里有什么。"
    },
    {
      "id": "file",
      "no": "02",
      "name": "文件与目录",
      "short": "文件",
      "tone": "sky",
      "blurb": "建立、复制、移动和删除，先把路径确认清楚。"
    },
    {
      "id": "view",
      "no": "03",
      "name": "查看与搜索",
      "short": "查看",
      "tone": "amber",
      "blurb": "读文件、追日志、在项目里找关键词。"
    },
    {
      "id": "perm",
      "no": "04",
      "name": "权限与链接",
      "short": "权限",
      "tone": "rose",
      "blurb": "脚本为什么不能执行，文件归谁所有。"
    },
    {
      "id": "proc",
      "no": "05",
      "name": "进程与系统",
      "short": "进程",
      "tone": "violet",
      "blurb": "谁在运行、谁占了端口、磁盘还剩多少。"
    },
    {
      "id": "net",
      "no": "06",
      "name": "网络与远程",
      "short": "网络",
      "tone": "cyan",
      "blurb": "连通性、响应头、下载、SSH 与同步。"
    },
    {
      "id": "dev",
      "no": "07",
      "name": "开发环境",
      "short": "开发",
      "tone": "lime",
      "blurb": "装工具、跑项目、用 Git，先把本地环境跑通。"
    },
    {
      "id": "os",
      "no": "08",
      "name": "平台专属",
      "short": "专属",
      "tone": "gold",
      "blurb": "每个系统自己的快捷入口与平台差异。"
    }
  ],
  "platforms": {
    "macos": {
      "label": "macOS",
      "short": "Mac",
      "status": "ready",
      "badge": "200 条已上线",
      "summary": "从 zsh 的第一条 pwd 到文件、权限、进程、网络、开发和 macOS 系统工具，200 条常驻命令按使用场景拆成 8 个分组；每条都有可复制的常用写法、示例和避坑提示。",
      "groupOverrides": {
        "os": {
          "name": "macOS 专属",
          "short": "Mac"
        }
      },
      "commands": {
        "nav": [
          {
            "id": "pwd",
            "syntax": "pwd",
            "copy": "pwd",
            "title": "我现在在哪个目录",
            "desc": "终端里的每条命令都站在某个目录上执行。先看当前路径，再决定下一步去哪。",
            "example": "pwd\n/Users/you/Projects/java-debug-lab",
            "note": "以 / 开头是绝对路径，~ 代表你的用户目录；路径不确定时不要直接删文件。",
            "keywords": [
              "路径",
              "目录",
              "当前"
            ]
          },
          {
            "id": "ls",
            "syntax": "ls -la",
            "copy": "ls -la",
            "title": "目录里到底有什么",
            "desc": "列出当前目录的内容。加上参数后，能看到隐藏文件、权限、大小和修改时间。",
            "example": "ls -la",
            "note": "-l 看权限与时间，-a 会显示 .git、.env 这类隐藏文件。",
            "keywords": [
              "列出",
              "隐藏文件",
              "权限"
            ]
          },
          {
            "id": "cd",
            "syntax": "cd <目录>",
            "copy": "cd ~/Projects/java-debug-lab",
            "title": "切换工作目录",
            "desc": "进入某个目录，后续命令就会在这个目录里执行。只输入 cd 会回到用户目录。",
            "example": "cd ~/Projects/java-debug-lab\ncd ..",
            "note": "目录名有空格要加引号；cd .. 返回上一级，cd - 回到上一次所在目录。",
            "keywords": [
              "进入",
              "返回",
              "路径"
            ]
          },
          {
            "id": "clear",
            "syntax": "clear",
            "copy": "clear",
            "title": "把屏幕清干净",
            "desc": "清掉终端窗口里的旧输出，让当前任务重新占满屏幕。它不会删除命令历史。",
            "example": "clear",
            "note": "Mac 终端也可以按 Control-L；清屏后按上箭头仍能翻到旧命令。",
            "keywords": [
              "清屏",
              "历史"
            ]
          },
          {
            "id": "man",
            "syntax": "man <命令>",
            "copy": "man ls",
            "title": "查命令的说明书",
            "desc": "遇到不熟的参数，先读手册。手册比搜索更接近命令的真实行为。",
            "example": "man ls",
            "note": "按 q 退出手册；man -k \"关键词\" 可以搜索相关命令。",
            "keywords": [
              "手册",
              "帮助",
              "参数"
            ]
          },
          {
            "id": "history",
            "syntax": "history | tail -20",
            "copy": "history | tail -20",
            "title": "翻最近执行过的命令",
            "desc": "history 会列出当前 shell 的历史命令。先从最近 20 条看起，定位刚才那条长命令。",
            "example": "history | tail -20",
            "note": "!编号 可以直接重跑历史命令；history -c 清空当前会话历史，不会清掉磁盘里的旧记录。",
            "keywords": [
              "历史",
              "重跑",
              "命令"
            ]
          },
          {
            "id": "alias",
            "syntax": "alias ll=\"ls -la\"",
            "copy": "alias ll=\"ls -la\"",
            "title": "给常用命令起短名",
            "desc": "把常用参数组合成一个短别名，减少重复输入；别名只在当前 shell 会话有效。",
            "example": "alias ll=\"ls -la\"",
            "note": "等号两边不能有空格；要长期生效，把 alias 写进 ~/.zshrc。",
            "keywords": [
              "别名",
              "快捷",
              "zshrc"
            ]
          },
          {
            "id": "unalias",
            "syntax": "unalias ll",
            "copy": "unalias ll",
            "title": "删除临时别名",
            "desc": "别名冲突或不再需要时，用 unalias 立刻移除；不带参数可以一次清掉全部别名。",
            "example": "unalias ll",
            "note": "unalias -a 会清空当前会话所有别名，执行前确认没有依赖。",
            "keywords": [
              "别名",
              "删除"
            ]
          },
          {
            "id": "type",
            "syntax": "type ll",
            "copy": "type ll",
            "title": "判断一个名字是什么",
            "desc": "type 会告诉你它是别名、函数、内置命令还是外部可执行文件，排查“同名命令”很快。",
            "example": "type ll",
            "note": "对脚本路径用 type -a，可以把所有同名来源都列出来。",
            "keywords": [
              "类型",
              "别名",
              "内置"
            ]
          },
          {
            "id": "which",
            "syntax": "which python3",
            "copy": "which python3",
            "title": "查可执行文件路径",
            "desc": "确认当前 shell 实际会调用哪一个 python3，避免装了两个版本却跑错。",
            "example": "which python3",
            "note": "which 只看 PATH；想看别名和函数用 type。",
            "keywords": [
              "路径",
              "版本",
              "PATH"
            ]
          },
          {
            "id": "whereis",
            "syntax": "whereis git",
            "copy": "whereis git",
            "title": "查命令和手册位置",
            "desc": "whereis 会给出二进制、源码和 man 手册的常见位置，适合快速确认工具装在哪。",
            "example": "whereis git",
            "note": "macOS 自带 whereis 结果可能很少；找不到时用 which 或 brew --prefix。",
            "keywords": [
              "位置",
              "手册",
              "工具"
            ]
          },
          {
            "id": "echo",
            "syntax": "echo $SHELL",
            "copy": "echo $SHELL",
            "title": "打印变量或一段文本",
            "desc": "最常用的输出命令。加变量可以确认当前 shell、PATH 或某个配置是否生效。",
            "example": "echo $SHELL",
            "note": "变量要加 $；单引号会阻止变量展开，双引号不会。",
            "keywords": [
              "输出",
              "变量",
              "shell"
            ]
          },
          {
            "id": "printf",
            "syntax": "printf \"%s\\n\" \"$PATH\"",
            "copy": "printf \"%s\\n\" \"$PATH\"",
            "title": "按格式输出",
            "desc": "printf 比 echo 更适合脚本：格式串固定，换行和占位符都可控。",
            "example": "printf \"%s\\n\" \"$PATH\"",
            "note": "%s 对应一个参数；记得写 \\n，否则输出可能粘在一行。",
            "keywords": [
              "格式化",
              "脚本",
              "输出"
            ]
          },
          {
            "id": "datecmd",
            "syntax": "date \"+%Y-%m-%d %H:%M\"",
            "copy": "date \"+%Y-%m-%d %H:%M\"",
            "title": "打印当前时间",
            "desc": "默认 date 输出很长；用格式串可以得到日志、文件名或备份所需的时间戳。",
            "example": "date \"+%Y-%m-%d %H:%M\"",
            "note": "备份文件名常用 date \"+%F\"；改系统时间用 sudo date，不建议手动改。",
            "keywords": [
              "时间",
              "日期",
              "格式"
            ]
          },
          {
            "id": "cal",
            "syntax": "cal",
            "copy": "cal",
            "title": "查看日历",
            "desc": "快速看当前月份，也可以指定年份查看全年日历。",
            "example": "cal",
            "note": "cal 2026 看全年；cal -3 同时显示前月、当月、下月。",
            "keywords": [
              "日历",
              "月份"
            ]
          },
          {
            "id": "env",
            "syntax": "env | grep PATH",
            "copy": "env | grep PATH",
            "title": "查看环境变量",
            "desc": "env 打印当前进程的全部环境变量，配合 grep 可只看 PATH、HOME 等关键项。",
            "example": "env | grep PATH",
            "note": "环境变量很多时先过滤；export 才是修改，env 只负责查看。",
            "keywords": [
              "环境变量",
              "PATH",
              "查看"
            ]
          },
          {
            "id": "printenv",
            "syntax": "printenv PATH",
            "copy": "printenv PATH",
            "title": "只打印某个环境变量",
            "desc": "脚本里常用 printenv 读取单个变量，输出干净，适合管道继续处理。",
            "example": "printenv PATH",
            "note": "变量不存在时返回空并退出码非 0；用 echo $VAR 也能看，但前者更适合判断。",
            "keywords": [
              "环境变量",
              "读取",
              "脚本"
            ]
          },
          {
            "id": "export",
            "syntax": "export PATH=\"$HOME/bin:$PATH\"",
            "copy": "export PATH=\"$HOME/bin:$PATH\"",
            "title": "临时设置环境变量",
            "desc": "把自定义目录加到 PATH 前面，让新命令优先被找到；只在当前 shell 和子进程有效。",
            "example": "export PATH=\"$HOME/bin:$PATH\"",
            "note": "要永久生效写进 ~/.zshrc；改 PATH 前先 echo $PATH 留一份原值。",
            "keywords": [
              "PATH",
              "环境变量",
              "配置"
            ]
          },
          {
            "id": "unset",
            "syntax": "unset TEMP_TOKEN",
            "copy": "unset TEMP_TOKEN",
            "title": "删除环境变量",
            "desc": "临时令牌或测试变量用完就删，避免被后续命令和子进程继承。",
            "example": "unset TEMP_TOKEN",
            "note": "只影响当前会话；确认变量名没写错，别把 PATH 之类基础变量删掉。",
            "keywords": [
              "环境变量",
              "清理",
              "令牌"
            ]
          },
          {
            "id": "source",
            "syntax": "source ~/.zshrc",
            "copy": "source ~/.zshrc",
            "title": "重新加载 shell 配置",
            "desc": "改完 .zshrc 后不用重开终端，source 会在当前 shell 里重新执行配置。",
            "example": "source ~/.zshrc",
            "note": "source 和 . 等价；配置文件有语法错误时，新终端可能也起不来，改前先备份。",
            "keywords": [
              "zshrc",
              "配置",
              "重载"
            ]
          },
          {
            "id": "exit",
            "syntax": "exit",
            "copy": "exit",
            "title": "退出当前 shell",
            "desc": "结束当前终端会话或 SSH 登录；有后台任务时先确认它们是否还需要运行。",
            "example": "exit",
            "note": "exit 后当前未保存的 shell 变量会消失；远程会话退出前先看 jobs。",
            "keywords": [
              "退出",
              "shell",
              "会话"
            ]
          },
          {
            "id": "logout",
            "syntax": "logout",
            "copy": "logout",
            "title": "退出登录 shell",
            "desc": "用于登录 shell 的退出命令；普通新开窗口通常用 exit 更稳。",
            "example": "logout",
            "note": "提示 not login shell 时改用 exit；不要在脚本里依赖 logout。",
            "keywords": [
              "退出",
              "登录",
              "shell"
            ]
          },
          {
            "id": "reset",
            "syntax": "reset",
            "copy": "reset",
            "title": "修复终端乱码",
            "desc": "输出被二进制或控制字符打乱时，reset 会重新初始化终端显示，比 clear 更彻底。",
            "example": "reset",
            "note": "reset 不会清命令历史；如果只是滚屏太多，先试 clear 或 Control-L。",
            "keywords": [
              "乱码",
              "重置",
              "终端"
            ]
          },
          {
            "id": "tty",
            "syntax": "tty",
            "copy": "tty",
            "title": "查看当前终端设备",
            "desc": "确认自己是在真实终端、伪终端还是脚本环境里，排查 stdin 问题时很有用。",
            "example": "tty",
            "note": "输出 not a tty 通常表示命令在管道或后台任务里运行。",
            "keywords": [
              "终端",
              "设备",
              "stdin"
            ]
          },
          {
            "id": "time",
            "syntax": "time npm run build",
            "copy": "time npm run build",
            "title": "统计一条命令的耗时",
            "desc": "在命令前加 time，看 real、user、sys 三个时间，快速判断构建或测试慢在哪。",
            "example": "time npm run build",
            "note": "real 是墙钟时间，user/sys 是 CPU 时间；只看单次结果，不要当性能基准。",
            "keywords": [
              "耗时",
              "性能",
              "构建"
            ]
          }
        ],
        "file": [
          {
            "id": "mkdir",
            "syntax": "mkdir -p <路径>",
            "copy": "mkdir -p ~/Projects/demo/src",
            "title": "一次建好目录树",
            "desc": "创建目录。-p 会同时补齐缺失的父目录，重复执行也不会因为目录已存在而报错。",
            "example": "mkdir -p ~/Projects/demo/src",
            "note": "目录名尽量用英文、短横线或下划线；不要在路径里随手加空格。",
            "keywords": [
              "新建",
              "目录",
              "文件夹"
            ]
          },
          {
            "id": "touch",
            "syntax": "touch <文件>",
            "copy": "touch README.md .gitignore",
            "title": "创建空文件",
            "desc": "快速创建一个空文件；如果文件已经存在，只会更新它的修改时间。",
            "example": "touch README.md .gitignore",
            "note": "先建 README 再写内容，比在 Finder 里新建文本文件再改名更稳。",
            "keywords": [
              "新建",
              "文件",
              "README"
            ]
          },
          {
            "id": "cp",
            "syntax": "cp -R <源> <目标>",
            "copy": "cp -R ~/Projects/demo ~/Backups/demo-$(date +%F)",
            "title": "复制文件或目录",
            "desc": "把文件复制到新位置。复制目录必须加 -R，否则只会复制目录本身。",
            "example": "cp -R ~/Projects/demo ~/Backups/demo-$(date +%F)",
            "note": "覆盖前先确认目标路径；用日期后缀留一份可回退的备份。",
            "keywords": [
              "复制",
              "备份",
              "目录"
            ]
          },
          {
            "id": "mv",
            "syntax": "mv <源> <目标>",
            "copy": "mv notes.txt docs/notes.txt",
            "title": "移动或重命名",
            "desc": "同一目录内是改名，跨目录就是移动。它不会复制，原位置的文件会消失。",
            "example": "mv notes.txt docs/notes.txt\nmv old-name.md new-name.md",
            "note": "移动前先用 ls 确认源和目标，尤其是带通配符的命令。",
            "keywords": [
              "改名",
              "移动",
              "重命名"
            ]
          },
          {
            "id": "rm",
            "syntax": "rm <文件> / rm -r <目录>",
            "copy": "rm -r node_modules",
            "title": "删除文件或目录",
            "desc": "终端删除不会进废纸篓，执行前必须确认 pwd 和 ls 的结果。",
            "example": "rm -r node_modules",
            "note": "先用 pwd 和 ls 确认位置；不确定的路径不要用 rm -rf，先移到备份目录更安全。",
            "danger": true,
            "keywords": [
              "删除",
              "清理",
              "危险"
            ]
          },
          {
            "id": "rmdir",
            "syntax": "rmdir empty-folder",
            "copy": "rmdir empty-folder",
            "title": "删除空目录",
            "desc": "rmdir 只删除空目录，目录里还有文件时会直接拒绝，比 rm -r 更难误删。",
            "example": "rmdir empty-folder",
            "note": "想删非空目录要先清空内容并确认路径；不确定时先 ls。",
            "keywords": [
              "删除",
              "空目录"
            ]
          },
          {
            "id": "readlink",
            "syntax": "readlink ./latest",
            "copy": "readlink ./latest",
            "title": "查看软链接指向哪里",
            "desc": "软链接看起来像一个普通路径，readlink 会告诉你它最终指向的真实目标。",
            "example": "readlink ./latest",
            "note": "macOS 的 readlink 选项比 GNU 少；需要绝对路径可配合 cd 和 pwd -P。",
            "keywords": [
              "软链接",
              "指向",
              "symlink"
            ]
          },
          {
            "id": "pwdphysical",
            "syntax": "pwd -P",
            "copy": "pwd -P",
            "title": "看解析软链接后的真实路径",
            "desc": "pwd 默认可能显示逻辑路径，pwd -P 会解析符号链接，得到文件系统里的真实位置。",
            "example": "pwd -P",
            "note": "在多层软链接目录里排错时很有用；先确认真实路径再删改。",
            "keywords": [
              "真实路径",
              "软链接",
              "pwd"
            ]
          },
          {
            "id": "stat",
            "syntax": "stat -f \"%N %z bytes\" README.md",
            "copy": "stat -f \"%N %z bytes\" README.md",
            "title": "查看文件元数据",
            "desc": "stat 能看大小、时间、权限和 inode；macOS 使用 BSD 的 -f 格式串。",
            "example": "stat -f \"%N %z bytes\" README.md",
            "note": "想看人类可读时间用 stat -f \"%Sm\"；Linux 的 stat 参数不同。",
            "keywords": [
              "元数据",
              "大小",
              "时间"
            ]
          },
          {
            "id": "file",
            "syntax": "file dist/app.tar.gz",
            "copy": "file dist/app.tar.gz",
            "title": "判断文件真实类型",
            "desc": "扩展名可以骗人，file 会读取文件头告诉你它到底是文本、图片还是压缩包。",
            "example": "file dist/app.tar.gz",
            "note": "排查“为什么打不开”先看 file；二进制文件不要直接 cat。",
            "keywords": [
              "类型",
              "文件头",
              "排查"
            ]
          },
          {
            "id": "basename",
            "syntax": "basename /Users/you/Projects/demo.tar.gz",
            "copy": "basename /Users/you/Projects/demo.tar.gz",
            "title": "取路径最后一段",
            "desc": "脚本里常用来从完整路径提取文件名，方便拼新文件名或日志标签。",
            "example": "basename /Users/you/Projects/demo.tar.gz",
            "note": "basename 不会检查文件是否存在，只做字符串处理。",
            "keywords": [
              "文件名",
              "路径",
              "脚本"
            ]
          },
          {
            "id": "dirname",
            "syntax": "dirname /Users/you/Projects/demo/app.js",
            "copy": "dirname /Users/you/Projects/demo/app.js",
            "title": "取路径的目录部分",
            "desc": "从文件路径拿到所在目录，常用于脚本里定位同级资源。",
            "example": "dirname /Users/you/Projects/demo/app.js",
            "note": "dirname 只做字符串截取；路径以 / 结尾时结果可能和直觉不同。",
            "keywords": [
              "目录",
              "路径",
              "脚本"
            ]
          },
          {
            "id": "mktemp",
            "syntax": "mktemp -d",
            "copy": "mktemp -d",
            "title": "创建临时目录",
            "desc": "需要安全临时空间时用 mktemp，它会生成随机名，避免并发任务互相覆盖。",
            "example": "mktemp -d",
            "note": "脚本结束前记得清理；不要把重要文件只放在 /tmp。",
            "keywords": [
              "临时",
              "目录",
              "随机"
            ]
          },
          {
            "id": "tree",
            "syntax": "tree -L 2",
            "copy": "tree -L 2",
            "title": "用树形结构看目录",
            "desc": "比 ls 更直观地展示层级，-L 限制深度，避免大项目刷屏。",
            "example": "tree -L 2",
            "note": "macOS 可能要先 brew install tree；没有 tree 时用 find . -maxdepth 2。",
            "keywords": [
              "树形",
              "目录",
              "层级"
            ]
          },
          {
            "id": "ditto",
            "syntax": "ditto src dist",
            "copy": "ditto src dist",
            "title": "复制目录并保留元数据",
            "desc": "macOS 自带 ditto 适合复制 .app 包或需要保留资源分支、权限的目录。",
            "example": "ditto src dist",
            "note": "日常复制仍可用 cp -R；ditto 更偏向系统级完整复制。",
            "keywords": [
              "复制",
              "元数据",
              "macOS"
            ]
          },
          {
            "id": "rsync",
            "syntax": "rsync -av src/ backup/",
            "copy": "rsync -av src/ backup/",
            "title": "增量同步目录",
            "desc": "rsync 只传变化的部分，适合本地备份和部署；-a 保留权限，-v 看过程。",
            "example": "rsync -av src/ backup/",
            "note": "源路径结尾的 / 表示同步内容而不是目录本身；加 --delete 前先用 -n  dry-run。",
            "keywords": [
              "同步",
              "备份",
              "增量"
            ]
          },
          {
            "id": "tar",
            "syntax": "tar -czf backup.tgz -C ~/Projects demo",
            "copy": "tar -czf backup.tgz -C ~/Projects demo",
            "title": "打包并压缩目录",
            "desc": "把目录打成 .tgz，-c 创建、-z gzip、-f 指定文件，-C 先切到父目录。",
            "example": "tar -czf backup.tgz -C ~/Projects demo",
            "note": "解包用 tar -xzf；打包前确认目标文件不会覆盖已有备份。",
            "keywords": [
              "打包",
              "压缩",
              "备份"
            ]
          },
          {
            "id": "zip",
            "syntax": "zip -r archive.zip folder",
            "copy": "zip -r archive.zip folder",
            "title": "生成 zip 压缩包",
            "desc": "和外部同事交换文件时，zip 兼容性最好；-r 递归包含子目录。",
            "example": "zip -r archive.zip folder",
            "note": "zip 默认会保留目录结构；大文件可加 -0 只打包不压缩。",
            "keywords": [
              "zip",
              "压缩",
              "分享"
            ]
          },
          {
            "id": "unzip",
            "syntax": "unzip archive.zip -d out",
            "copy": "unzip archive.zip -d out",
            "title": "解压 zip 并指定目录",
            "desc": "把压缩包解到独立目录，避免文件散落在当前目录；-d 指定目标。",
            "example": "unzip archive.zip -d out",
            "note": "解压前先 unzip -l 看清单，防止覆盖同名文件。",
            "keywords": [
              "解压",
              "zip",
              "目录"
            ]
          },
          {
            "id": "gzip",
            "syntax": "gzip -k notes.txt",
            "copy": "gzip -k notes.txt",
            "title": "压缩单个文件",
            "desc": "gzip 生成 .gz，-k 保留原文件；适合日志归档和传输前压缩。",
            "example": "gzip -k notes.txt",
            "note": "gzip 默认会替换原文件，-k 才保留；压缩包用 gunzip 解。",
            "keywords": [
              "压缩",
              "gz",
              "日志"
            ]
          },
          {
            "id": "gunzip",
            "syntax": "gunzip notes.txt.gz",
            "copy": "gunzip notes.txt.gz",
            "title": "解压 gzip 文件",
            "desc": "把 .gz 还原成原文件；默认删除压缩包，需要保留时加 -k。",
            "example": "gunzip notes.txt.gz",
            "note": "解压后先确认内容；日志轮转文件常是 .gz，可以直接 zgrep。",
            "keywords": [
              "解压",
              "gz",
              "日志"
            ]
          },
          {
            "id": "xattr",
            "syntax": "xattr -l README.md",
            "copy": "xattr -l README.md",
            "title": "查看扩展属性",
            "desc": "macOS 会给文件附加 quarantine、来源 URL 等扩展属性，xattr 可以查看它们。",
            "example": "xattr -l README.md",
            "note": "下载文件打不开时常见 com.apple.quarantine；清理属性前先确认文件来源可信。",
            "keywords": [
              "扩展属性",
              "quarantine",
              "macOS"
            ]
          },
          {
            "id": "split",
            "syntax": "split -l 1000 big.log part-",
            "copy": "split -l 1000 big.log part-",
            "title": "把大文件按行拆分",
            "desc": "日志太大不方便上传或分析时，按固定行数拆成多个小文件。",
            "example": "split -l 1000 big.log part-",
            "note": "split 默认按行；合并用 cat part-* > big.log，顺序要确认。",
            "keywords": [
              "拆分",
              "日志",
              "大文件"
            ]
          },
          {
            "id": "cksum",
            "syntax": "cksum README.md",
            "copy": "cksum README.md",
            "title": "生成校验和",
            "desc": "用 CRC 校验确认文件传输前后是否一致，适合快速完整性检查。",
            "example": "cksum README.md",
            "note": "需要更强校验用 shasum -a 256；校验和要跟文件一起保存。",
            "keywords": [
              "校验",
              "CRC",
              "完整性"
            ]
          },
          {
            "id": "shasum",
            "syntax": "shasum -a 256 file.zip",
            "copy": "shasum -a 256 file.zip",
            "title": "计算 SHA-256",
            "desc": "发布文件或下载安装包时，用 SHA-256 对比官方值，确认内容没有被改动。",
            "example": "shasum -a 256 file.zip",
            "note": "macOS 自带 shasum；Linux 常用 sha256sum，输出格式略有差异。",
            "keywords": [
              "SHA256",
              "校验",
              "下载"
            ]
          }
        ],
        "view": [
          {
            "id": "cat",
            "syntax": "cat <文件>",
            "copy": "cat README.md",
            "title": "直接看短文件",
            "desc": "把文件内容一次性打印到终端。适合 README、配置和短日志。",
            "example": "cat README.md",
            "note": "文件太长会刷满屏幕；长文件用 less，不要用 cat 硬看。",
            "keywords": [
              "查看",
              "内容",
              "README"
            ]
          },
          {
            "id": "less",
            "syntax": "less <文件>",
            "copy": "less README.md",
            "title": "分页阅读长文件",
            "desc": "打开一个可上下翻页的阅读器，不会把整份文件一次性塞进终端。",
            "example": "less README.md",
            "note": "/ 搜索，n 下一个匹配，q 退出，G 跳到末尾。",
            "keywords": [
              "阅读",
              "分页",
              "日志"
            ]
          },
          {
            "id": "headtail",
            "syntax": "head -n 20 <文件> / tail -f <日志>",
            "copy": "tail -f logs/app.log",
            "title": "先看头尾，再追日志",
            "desc": "head 看开头，tail 看结尾；tail -f 会持续跟踪新写入的日志。",
            "example": "head -n 20 README.md\ntail -f logs/app.log",
            "note": "tail -f 会一直占着终端，按 Control-C 停止；排查服务启动问题很好用。",
            "keywords": [
              "日志",
              "开头",
              "结尾",
              "跟踪"
            ]
          },
          {
            "id": "grep",
            "syntax": "grep -R \"<词>\" <目录>",
            "copy": "grep -R \"TODO\" .",
            "title": "在项目里搜关键词",
            "desc": "递归搜索目录里的文本，快速找到某个函数、配置项或 TODO。",
            "example": "grep -R \"TODO\" .",
            "note": "-n 显示行号；加 --exclude-dir=.git 可以跳过版本库目录。",
            "keywords": [
              "搜索",
              "关键词",
              "代码"
            ]
          },
          {
            "id": "find",
            "syntax": "find <目录> -name \"<模式>\"",
            "copy": "find . -name \"*.java\"",
            "title": "按文件名找文件",
            "desc": "不知道文件在哪个子目录时，用名字或通配符把路径找出来。",
            "example": "find . -name \"*.java\"",
            "note": "从当前目录 . 开始找；-iname 忽略大小写，-type f 只看普通文件。",
            "keywords": [
              "查找",
              "文件名",
              "通配符"
            ]
          },
          {
            "id": "more",
            "syntax": "more README.md",
            "copy": "more README.md",
            "title": "用老式分页器阅读",
            "desc": "more 比 less 简单，只支持向前翻页；老系统或极简环境里仍会遇到。",
            "example": "more README.md",
            "note": "日常优先 less；more 的功能和搜索能力更少。",
            "keywords": [
              "分页",
              "阅读"
            ]
          },
          {
            "id": "awk",
            "syntax": "awk '{print $1}' access.log",
            "copy": "awk '{print $1}' access.log",
            "title": "按列提取文本",
            "desc": "awk 按空白分列，$1 是第一列；统计日志里的 IP、状态码或接口路径很快。",
            "example": "awk '{print $1}' access.log",
            "note": "引号要和 shell 分开；复杂统计用 awk -F 指定分隔符。",
            "keywords": [
              "列",
              "日志",
              "统计"
            ]
          },
          {
            "id": "sed",
            "syntax": "sed -n '1,20p' README.md",
            "copy": "sed -n '1,20p' README.md",
            "title": "按行范围查看或替换",
            "desc": "sed 适合做流式替换和按行截取；-n 配合 p 只打印指定范围。",
            "example": "sed -n '1,20p' README.md",
            "note": "macOS 的 sed -i 需要单独的空参数，批量替换前先备份。",
            "keywords": [
              "替换",
              "行",
              "文本"
            ]
          },
          {
            "id": "cut",
            "syntax": "cut -d: -f1 /etc/passwd",
            "copy": "cut -d: -f1 /etc/passwd",
            "title": "按分隔符取字段",
            "desc": "处理 CSV、配置或 /etc/passwd 时，用 -d 指定分隔符，-f 选列。",
            "example": "cut -d: -f1 /etc/passwd",
            "note": "cut 只适合固定分隔符；复杂 CSV 用 python3 的 csv 模块更稳。",
            "keywords": [
              "字段",
              "分隔符",
              "CSV"
            ]
          },
          {
            "id": "sort",
            "syntax": "sort -k2 -n data.txt",
            "copy": "sort -k2 -n data.txt",
            "title": "按字段排序",
            "desc": "sort 可以按字典序、数字或指定列排序，是统计前的常用步骤。",
            "example": "sort -k2 -n data.txt",
            "note": "-n 按数值，-r 倒序；中文和本地化排序可加 LC_ALL=C 固定行为。",
            "keywords": [
              "排序",
              "字段",
              "数值"
            ]
          },
          {
            "id": "uniq",
            "syntax": "sort names.txt | uniq -c",
            "copy": "sort names.txt | uniq -c",
            "title": "去重并统计出现次数",
            "desc": "uniq 只处理相邻重复行，所以要先 sort；-c 输出每项出现次数。",
            "example": "sort names.txt | uniq -c",
            "note": "不去重只统计重复行也可用 uniq -d；输入必须先排序。",
            "keywords": [
              "去重",
              "统计",
              "重复"
            ]
          },
          {
            "id": "wc",
            "syntax": "wc -l src/*.js",
            "copy": "wc -l src/*.js",
            "title": "统计行数、词数和字节",
            "desc": "快速知道文件规模；-l 只看行数，适合估算代码量和日志长度。",
            "example": "wc -l src/*.js",
            "note": "多个文件会逐行输出；只看总数用 wc -l file | tail -1。",
            "keywords": [
              "行数",
              "统计",
              "代码量"
            ]
          },
          {
            "id": "tr",
            "syntax": "tr '[:lower:]' '[:upper:]'",
            "copy": "tr '[:lower:]' '[:upper:]'",
            "title": "字符替换或删除",
            "desc": "tr 按字符做转换，适合统一大小写、删换行或把分隔符换成逗号。",
            "example": "tr '[:lower:]' '[:upper:]'",
            "note": "tr 不理解单词；按字符串替换用 sed 或 perl。",
            "keywords": [
              "字符",
              "大小写",
              "转换"
            ]
          },
          {
            "id": "diff",
            "syntax": "diff -u old.txt new.txt",
            "copy": "diff -u old.txt new.txt",
            "title": "比较两个文本文件",
            "desc": "-u 输出统一的 diff 格式，能直观看到新增、删除和上下文。",
            "example": "diff -u old.txt new.txt",
            "note": "比较目录加 -r；二进制文件用 cmp 或 file。",
            "keywords": [
              "比较",
              "diff",
              "变更"
            ]
          },
          {
            "id": "cmp",
            "syntax": "cmp -l file1 file2 | head",
            "copy": "cmp -l file1 file2 | head",
            "title": "逐字节比较文件",
            "desc": "cmp 找第一个不同字节；-l 列出所有差异，适合校验二进制或配置。",
            "example": "cmp -l file1 file2 | head",
            "note": "文件相同则没有输出；大文件先加 head 限制。",
            "keywords": [
              "比较",
              "字节",
              "二进制"
            ]
          },
          {
            "id": "comm",
            "syntax": "comm -12 a.txt b.txt",
            "copy": "comm -12 a.txt b.txt",
            "title": "求两个已排序文件的交集",
            "desc": "comm 三列分别是只在 A、只在 B、两者都有；-12 只留交集。",
            "example": "comm -12 a.txt b.txt",
            "note": "两个输入必须先排序；否则结果不可靠。",
            "keywords": [
              "交集",
              "排序",
              "文件"
            ]
          },
          {
            "id": "tee",
            "syntax": "npm test 2>&1 | tee test.log",
            "copy": "npm test 2>&1 | tee test.log",
            "title": "同时看输出和写日志",
            "desc": "tee 把标准输出分叉到屏幕和文件，排查测试失败时特别方便。",
            "example": "npm test 2>&1 | tee test.log",
            "note": "2>&1 把错误也接进管道；要追加用 tee -a。",
            "keywords": [
              "日志",
              "管道",
              "测试"
            ]
          },
          {
            "id": "nl",
            "syntax": "nl -ba README.md | head",
            "copy": "nl -ba README.md | head",
            "title": "给文本加行号",
            "desc": "nl 比 cat -n 更适合控制编号格式，读代码片段或日志时方便引用行号。",
            "example": "nl -ba README.md | head",
            "note": "空行默认不编号；需要全部编号用 -ba。",
            "keywords": [
              "行号",
              "查看",
              "文本"
            ]
          },
          {
            "id": "strings",
            "syntax": "strings app.bin | head",
            "copy": "strings app.bin | head",
            "title": "从二进制里提取可读文本",
            "desc": "不知道二进制里有没有版本号、路径或错误信息时，strings 能把可打印片段捞出来。",
            "example": "strings app.bin | head",
            "note": "只适合粗看；真正的符号分析用 nm、otool 或调试器。",
            "keywords": [
              "二进制",
              "文本",
              "排查"
            ]
          },
          {
            "id": "xxd",
            "syntax": "xxd -l 64 file.bin",
            "copy": "xxd -l 64 file.bin",
            "title": "十六进制查看文件头",
            "desc": "xxd 把字节按十六进制和 ASCII 并排显示，适合确认文件格式和魔数。",
            "example": "xxd -l 64 file.bin",
            "note": "只看开头用 -l；完整十六进制转储可用 hexdump 或 od。",
            "keywords": [
              "十六进制",
              "文件头",
              "二进制"
            ]
          },
          {
            "id": "hexdump",
            "syntax": "hexdump -C file.bin | head",
            "copy": "hexdump -C file.bin | head",
            "title": "按字节查看二进制",
            "desc": "-C 输出规范偏移、十六进制和 ASCII，排查编码或损坏很直观。",
            "example": "hexdump -C file.bin | head",
            "note": "输出可能很长，先加 head；macOS 与 Linux 的选项略有差异。",
            "keywords": [
              "hex",
              "二进制",
              "字节"
            ]
          },
          {
            "id": "od",
            "syntax": "od -An -tx1 file.bin | head",
            "copy": "od -An -tx1 file.bin | head",
            "title": "按八进制或十六进制转储",
            "desc": "od 是 POSIX 老工具，适合脚本里做稳定的字节级输出。",
            "example": "od -An -tx1 file.bin | head",
            "note": "-An 去掉地址列；-tx1 每个字节一个十六进制值。",
            "keywords": [
              "od",
              "十六进制",
              "POSIX"
            ]
          },
          {
            "id": "rg",
            "syntax": "rg \"TODO\" src",
            "copy": "rg \"TODO\" src",
            "title": "用 ripgrep 快速搜代码",
            "desc": "rg 默认递归、忽略 .gitignore，速度比 grep 快，适合大项目找符号。",
            "example": "rg \"TODO\" src",
            "note": "macOS 可能要先 brew install ripgrep；查隐藏文件加 --hidden。",
            "keywords": [
              "ripgrep",
              "搜索",
              "代码"
            ]
          },
          {
            "id": "jq",
            "syntax": "jq '.version' package.json",
            "copy": "jq '.version' package.json",
            "title": "格式化并查询 JSON",
            "desc": "jq 可以读取、过滤和美化 JSON，查接口返回或配置文件比肉眼翻更准。",
            "example": "jq '.version' package.json",
            "note": "原始 JSON 用 jq . 美化；数组索引用 .[0]，字段含空格用 .[\"key\"]。",
            "keywords": [
              "JSON",
              "查询",
              "格式化"
            ]
          },
          {
            "id": "zgrep",
            "syntax": "zgrep \"error\" app.log.gz",
            "copy": "zgrep \"error\" app.log.gz",
            "title": "不解压直接搜压缩日志",
            "desc": "日志轮转后常是 .gz，zgrep 可以直接搜索，不用先 gunzip 占磁盘。",
            "example": "zgrep \"error\" app.log.gz",
            "note": "压缩包损坏时先 gzip -t 测试；多个日志可写 *.gz。",
            "keywords": [
              "gz",
              "日志",
              "搜索"
            ]
          }
        ],
        "perm": [
          {
            "id": "lsperm",
            "syntax": "ls -l <文件>",
            "copy": "ls -l scripts/build.sh",
            "title": "看懂权限位",
            "desc": "ls -l 的第一列告诉你文件类型，以及用户、组和其他人分别能不能读写执行。",
            "example": "ls -l scripts/build.sh\n-rwxr-xr-x  1 you  staff  1824 Nov 26 21:40 build.sh",
            "note": "r 读、w 写、x 执行；目录没有 x 权限时，连进入都不行。",
            "keywords": [
              "权限",
              "rwx",
              "属性"
            ]
          },
          {
            "id": "chmodx",
            "syntax": "chmod +x <文件>",
            "copy": "chmod +x scripts/build.sh",
            "title": "给脚本加执行权限",
            "desc": "脚本报 Permission denied 时，先看它有没有执行位。chmod +x 是最小修复。",
            "example": "chmod +x scripts/build.sh",
            "note": "只给确实需要执行的脚本加；不要为了省事对整目录递归放开权限。",
            "keywords": [
              "执行",
              "脚本",
              "权限"
            ]
          },
          {
            "id": "chmod755",
            "syntax": "chmod 755 <文件>",
            "copy": "chmod 755 scripts/build.sh",
            "title": "用数字设置权限",
            "desc": "755 表示拥有者读写执行，组和其他人读执行。适合大多数可执行脚本。",
            "example": "chmod 755 scripts/build.sh",
            "note": "7=读写执行，5=读执行；敏感配置不要随手设成 777。",
            "keywords": [
              "755",
              "数字",
              "权限"
            ]
          },
          {
            "id": "chown",
            "syntax": "sudo chown <用户>:<组> <文件>",
            "copy": "sudo chown -R $(whoami):staff ~/Projects/demo",
            "title": "修正文件归属",
            "desc": "文件从别的账户或压缩包解出来时，归属可能不对。chown 可以改拥有者和组。",
            "example": "sudo chown -R $(whoami):staff ~/Projects/demo",
            "note": "只在确知归属错误时用；不要对系统目录整块执行，先确认目标路径。",
            "danger": true,
            "keywords": [
              "拥有者",
              "用户组",
              "sudo"
            ]
          },
          {
            "id": "ln",
            "syntax": "ln -s <真实路径> <链接名>",
            "copy": "ln -s ~/Projects/demo/app /usr/local/bin/demo",
            "title": "创建软链接",
            "desc": "给一个长路径起一个短名字，或者把项目里的可执行文件挂到命令目录。",
            "example": "ln -s ~/Projects/demo/app /usr/local/bin/demo",
            "note": "第一个参数是真实目标，第二个是链接名；删链接不会删源文件。",
            "keywords": [
              "软链接",
              "快捷方式",
              "symlink"
            ]
          },
          {
            "id": "chgrp",
            "syntax": "chgrp staff file.txt",
            "copy": "chgrp staff file.txt",
            "title": "修改文件所属组",
            "desc": "团队共享目录时，把文件归到正确的组，组权限才会生效。",
            "example": "chgrp staff file.txt",
            "note": "改系统文件可能需要 sudo；先用 ls -l 看当前归属。",
            "keywords": [
              "用户组",
              "归属",
              "权限"
            ]
          },
          {
            "id": "umask",
            "syntax": "umask 022",
            "copy": "umask 022",
            "title": "设置新文件默认权限",
            "desc": "umask 决定新建文件和目录默认去掉哪些权限；022 是常见的开发机设置。",
            "example": "umask 022",
            "note": "umask 只影响当前 shell；永久设置写进 ~/.zshrc。",
            "keywords": [
              "umask",
              "默认权限",
              "新建"
            ]
          },
          {
            "id": "sudo",
            "syntax": "sudo -v",
            "copy": "sudo -v",
            "title": "刷新 sudo 授权",
            "desc": "sudo 让当前用户以 root 执行单条命令；-v 只刷新凭证，不执行具体操作。",
            "example": "sudo -v",
            "note": "能用普通用户完成就不要 sudo；不要整段复制来源不明的 sudo 命令。",
            "keywords": [
              "sudo",
              "root",
              "授权"
            ],
            "danger": true
          },
          {
            "id": "sudol",
            "syntax": "sudo -l",
            "copy": "sudo -l",
            "title": "查看当前 sudo 权限",
            "desc": "确认自己能免密或可执行哪些命令，排查“为什么 sudo 被拒绝”时先看它。",
            "example": "sudo -l",
            "note": "输出会列出允许的命令；不要把它贴到公开仓库里。",
            "keywords": [
              "sudo",
              "权限",
              "策略"
            ]
          },
          {
            "id": "su",
            "syntax": "su - otheruser",
            "copy": "su - otheruser",
            "title": "切换到其他用户",
            "desc": "su 切换身份并启动新 shell；日常更推荐 sudo -u 只执行单条命令。",
            "example": "su - otheruser",
            "note": "需要目标用户密码；不确定时不要长期停留在 root shell。",
            "keywords": [
              "切换用户",
              "shell",
              "身份"
            ],
            "danger": true
          },
          {
            "id": "id",
            "syntax": "id",
            "copy": "id",
            "title": "查看当前用户和组",
            "desc": "id 一次显示 UID、GID 和附加组，排查权限问题时比 whoami 更完整。",
            "example": "id",
            "note": "id -u 只看 UID；id -G 看所有组 ID。",
            "keywords": [
              "UID",
              "GID",
              "用户"
            ]
          },
          {
            "id": "groups",
            "syntax": "groups",
            "copy": "groups",
            "title": "查看当前用户所属组",
            "desc": "组决定共享目录和系统服务的访问权；看不到预期组时检查账户配置。",
            "example": "groups",
            "note": "修改组后通常要重新登录；newgrp 可临时切到另一个组。",
            "keywords": [
              "用户组",
              "权限",
              "账户"
            ]
          },
          {
            "id": "whoami",
            "syntax": "whoami",
            "copy": "whoami",
            "title": "确认当前身份",
            "desc": "在 sudo、SSH 或 CI 里先确认自己是谁，避免用错账户改错文件。",
            "example": "whoami",
            "note": "whoami 只看有效用户名；完整信息用 id。",
            "keywords": [
              "身份",
              "用户",
              "确认"
            ]
          },
          {
            "id": "who",
            "syntax": "who",
            "copy": "who",
            "title": "查看当前登录用户",
            "desc": "列出本机登录会话、终端和登录时间，排查“谁还占着机器”很快。",
            "example": "who",
            "note": "远程会话也会显示；更详细用 w。",
            "keywords": [
              "登录",
              "会话",
              "用户"
            ]
          },
          {
            "id": "w",
            "syntax": "w",
            "copy": "w",
            "title": "看登录用户正在做什么",
            "desc": "w 比 who 多出空闲时间、CPU 和当前命令，适合共享机器排查负载。",
            "example": "w",
            "note": "输出第一行是负载均值；不要把它当成精确性能报告。",
            "keywords": [
              "登录",
              "负载",
              "会话"
            ]
          },
          {
            "id": "last",
            "syntax": "last -10",
            "copy": "last -10",
            "title": "查看最近登录记录",
            "desc": "last 读取登录历史，确认某次 SSH 或重启前后的账户活动。",
            "example": "last -10",
            "note": "macOS 的记录格式和 Linux 不完全一样；隐私环境不要随意公开输出。",
            "keywords": [
              "登录",
              "历史",
              "审计"
            ]
          },
          {
            "id": "passwd",
            "syntax": "passwd",
            "copy": "passwd",
            "title": "修改当前账户密码",
            "desc": "在终端里改自己的登录密码；按提示输入旧密码和新密码。",
            "example": "passwd",
            "note": "不要用 sudo passwd 改自己的密码；企业设备可能由 MDM 管理。",
            "keywords": [
              "密码",
              "账户",
              "安全"
            ]
          },
          {
            "id": "dscl",
            "syntax": "dscl . -read /Users/$(whoami) RealName",
            "copy": "dscl . -read /Users/$(whoami) RealName",
            "title": "读取 macOS 账户属性",
            "desc": "dscl 是目录服务命令行，能查用户、组和系统账户字段。",
            "example": "dscl . -read /Users/$(whoami) RealName",
            "note": "写入账户属性风险高；只读查询先确认路径，不要照抄网上的删除命令。",
            "keywords": [
              "目录服务",
              "账户",
              "macOS"
            ]
          },
          {
            "id": "security",
            "syntax": "security find-generic-password -s github",
            "copy": "security find-generic-password -s github",
            "title": "查询钥匙串条目",
            "desc": "security 可以访问 macOS 钥匙串的元数据，排查证书和密码项是否存在。",
            "example": "security find-generic-password -s github",
            "note": "不加 -w 不会打印密码；不要把钥匙串内容写进日志或仓库。",
            "keywords": [
              "钥匙串",
              "Keychain",
              "证书"
            ]
          },
          {
            "id": "codesign",
            "syntax": "codesign -dv --verbose=4 MyApp.app",
            "copy": "codesign -dv --verbose=4 MyApp.app",
            "title": "查看应用签名",
            "desc": "检查 .app 的签名者、Team ID 和是否被修改，分发给别人前很有用。",
            "example": "codesign -dv --verbose=4 MyApp.app",
            "note": "验证签名完整性用 codesign --verify --deep --strict；不要绕过系统安全策略。",
            "keywords": [
              "签名",
              "应用",
              "分发"
            ]
          },
          {
            "id": "spctl",
            "syntax": "spctl --assess --type execute MyApp.app",
            "copy": "spctl --assess --type execute MyApp.app",
            "title": "检查 Gatekeeper 评估结果",
            "desc": "看 macOS 是否会允许某个应用运行，排查“已损坏无法打开”的提示。",
            "example": "spctl --assess --type execute MyApp.app",
            "note": "不要为了绕过限制随意关闭 Gatekeeper；先确认真实来源。",
            "keywords": [
              "Gatekeeper",
              "评估",
              "安全"
            ]
          },
          {
            "id": "chflags",
            "syntax": "chflags hidden file.txt",
            "copy": "chflags hidden file.txt",
            "title": "设置文件隐藏标志",
            "desc": "macOS 的 hidden 标志能让文件在 Finder 中不显示，但仍可通过终端访问。",
            "example": "chflags hidden file.txt",
            "note": "取消用 chflags nohidden；不要用它隐藏敏感文件当安全措施。",
            "keywords": [
              "隐藏",
              "Finder",
              "标志"
            ]
          },
          {
            "id": "lsacl",
            "syntax": "ls -le file.txt",
            "copy": "ls -le file.txt",
            "title": "查看 ACL 扩展权限",
            "desc": "普通 rwx 之外，macOS 还有 ACL；-e 会显示 allow/deny 规则。",
            "example": "ls -le file.txt",
            "note": "ACL 可能覆盖看起来正常的权限；修改前先记录原规则。",
            "keywords": [
              "ACL",
              "权限",
              "macOS"
            ]
          },
          {
            "id": "visudo",
            "syntax": "sudo visudo",
            "copy": "sudo visudo",
            "title": "安全编辑 sudoers",
            "desc": "visudo 会先做语法检查再保存，避免把 sudo 配置写坏导致无法提权。",
            "example": "sudo visudo",
            "note": "只改确知的规则；编辑前备份 /etc/sudoers，改错可能锁死管理权限。",
            "keywords": [
              "sudoers",
              "权限",
              "编辑"
            ],
            "danger": true
          },
          {
            "id": "dseditgroup",
            "syntax": "sudo dseditgroup -o edit -a user -t user admin",
            "copy": "sudo dseditgroup -o edit -a user -t user admin",
            "title": "把用户加入系统组",
            "desc": "用目录服务把账户加入 admin 等组，适合企业 Mac 的账户管理。",
            "example": "sudo dseditgroup -o edit -a user -t user admin",
            "note": "组权限影响很大；确认用户名和组名，操作前先看 id 与 dscl 输出。",
            "keywords": [
              "用户组",
              "账户",
              "管理"
            ],
            "danger": true
          }
        ],
        "proc": [
          {
            "id": "ps",
            "syntax": "ps aux | grep <关键词>",
            "copy": "ps aux | grep node",
            "title": "找出正在跑的进程",
            "desc": "ps 列出进程，grep 把目标进程筛出来。看最后一列确认到底是不是你的程序。",
            "example": "ps aux | grep node",
            "note": "grep 自己也会出现在结果里；先看 PID，再用 kill 结束。",
            "keywords": [
              "进程",
              "PID",
              "查找"
            ]
          },
          {
            "id": "top",
            "syntax": "top",
            "copy": "top -o cpu",
            "title": "看谁在吃 CPU",
            "desc": "实时查看进程的 CPU、内存和负载。Mac 上可以用 -o cpu 按 CPU 排序。",
            "example": "top -o cpu",
            "note": "按 q 退出；不要在看 top 的时候误按 Control-C，它不会结束 top。",
            "keywords": [
              "CPU",
              "内存",
              "负载"
            ]
          },
          {
            "id": "kill",
            "syntax": "kill <PID>",
            "copy": "kill 48213",
            "title": "结束指定进程",
            "desc": "先拿到 PID，再发信号结束进程。普通 kill 会先给程序收尾的机会。",
            "example": "kill 48213",
            "note": "先试普通 kill；kill -9 是强制结束，可能丢未保存数据。确认 PID 再执行。",
            "danger": true,
            "keywords": [
              "结束",
              "PID",
              "信号"
            ]
          },
          {
            "id": "lsof",
            "syntax": "lsof -i :<端口>",
            "copy": "lsof -i :3000",
            "title": "谁占用了这个端口",
            "desc": "服务启动报 Address already in use 时，用它查出占用端口的进程和 PID。",
            "example": "lsof -i :3000",
            "note": "输出里的 PID 可以直接交给 kill；加 -nP 不解析域名，结果更快。",
            "keywords": [
              "端口",
              "占用",
              "Address already in use"
            ]
          },
          {
            "id": "disk",
            "syntax": "df -h / du -sh <目录>",
            "copy": "du -sh ~/Library/Caches",
            "title": "磁盘到底被谁吃了",
            "desc": "df 看整块磁盘剩余空间，du 看指定目录的占用大小。",
            "example": "df -h\ndu -sh ~/Library/Caches",
            "note": "先看 df 确认哪块盘满了，再用 du 从可疑目录一层层缩小范围。",
            "keywords": [
              "磁盘",
              "空间",
              "缓存"
            ]
          },
          {
            "id": "pgrep",
            "syntax": "pgrep -fl node",
            "copy": "pgrep -fl node",
            "title": "按名字查进程",
            "desc": "pgrep 直接按进程名或完整命令行筛选，比 ps | grep 少一步且更干净。",
            "example": "pgrep -fl node",
            "note": "-f 匹配完整命令行，-l 显示名称；确认 PID 再决定是否结束。",
            "keywords": [
              "进程",
              "PID",
              "查找"
            ]
          },
          {
            "id": "pkill",
            "syntax": "pkill -f \"node server.js\"",
            "copy": "pkill -f \"node server.js\"",
            "title": "按模式结束进程",
            "desc": "按命令行模式批量结束进程，适合清理自己启动的测试服务。",
            "example": "pkill -f \"node server.js\"",
            "note": "模式可能误伤其他进程；先 pgrep -fl 确认，再执行 pkill。",
            "keywords": [
              "结束",
              "模式",
              "进程"
            ],
            "danger": true
          },
          {
            "id": "killall",
            "syntax": "killall Dock",
            "copy": "killall Dock",
            "title": "按进程名结束所有实例",
            "desc": "killall 按名字结束同一进程的所有实例，重启 Finder/Dock 时常用。",
            "example": "killall Dock",
            "note": "会影响所有同名进程；不要对系统关键进程随手执行。",
            "keywords": [
              "结束",
              "同名",
              "重启"
            ],
            "danger": true
          },
          {
            "id": "nice",
            "syntax": "nice -n 10 npm run build",
            "copy": "nice -n 10 npm run build",
            "title": "降低命令优先级",
            "desc": "让构建或备份让出 CPU，避免它抢满交互应用的资源。",
            "example": "nice -n 10 npm run build",
            "note": "nice 值越大优先级越低；普通用户只能调高不能调低。",
            "keywords": [
              "优先级",
              "CPU",
              "构建"
            ]
          },
          {
            "id": "renice",
            "syntax": "renice 10 -p 48213",
            "copy": "renice 10 -p 48213",
            "title": "调整已运行进程优先级",
            "desc": "进程已经跑起来后，用 renice 改它的调度优先级，不用重启。",
            "example": "renice 10 -p 48213",
            "note": "先确认 PID；降低优先级通常不需要 sudo，提高可能需要。",
            "keywords": [
              "优先级",
              "PID",
              "调度"
            ]
          },
          {
            "id": "jobs",
            "syntax": "jobs -l",
            "copy": "jobs -l",
            "title": "查看当前 shell 的后台任务",
            "desc": "jobs 列出挂起和后台运行的作业，-l 同时显示 PID，方便 fg/bg。",
            "example": "jobs -l",
            "note": "作业号是 %1 这种，不是 PID；关闭终端前先处理未完成任务。",
            "keywords": [
              "作业",
              "后台",
              "shell"
            ]
          },
          {
            "id": "bg",
            "syntax": "bg %1",
            "copy": "bg %1",
            "title": "把暂停的作业放到后台",
            "desc": "先用 Control-Z 暂停，再用 bg 让它在后台继续跑，终端可以继续输入。",
            "example": "bg %1",
            "note": "只对当前 shell 的作业有效；输出仍可能打到终端。",
            "keywords": [
              "后台",
              "作业",
              "暂停"
            ]
          },
          {
            "id": "fg",
            "syntax": "fg %1",
            "copy": "fg %1",
            "title": "把后台作业拉回前台",
            "desc": "需要交互输入或看实时输出时，用 fg 把后台任务切回前台。",
            "example": "fg %1",
            "note": "不带参数默认最近一个作业；Control-C 会中断它。",
            "keywords": [
              "前台",
              "作业",
              "交互"
            ]
          },
          {
            "id": "wait",
            "syntax": "wait",
            "copy": "wait",
            "title": "等待后台任务结束",
            "desc": "脚本里启动多个后台任务后，wait 会等它们全部完成再继续。",
            "example": "wait",
            "note": "wait 只等当前 shell 的子进程；要拿退出码用 wait $PID。",
            "keywords": [
              "等待",
              "后台",
              "脚本"
            ]
          },
          {
            "id": "nohup",
            "syntax": "nohup npm start > app.log 2>&1 &",
            "copy": "nohup npm start > app.log 2>&1 &",
            "title": "让任务脱离终端继续跑",
            "desc": "nohup 忽略挂断信号，配合 & 放后台，SSH 断开后服务仍能继续。",
            "example": "nohup npm start > app.log 2>&1 &",
            "note": "日志必须重定向，否则输出可能丢失；长期服务用 launchd 或容器更稳。",
            "keywords": [
              "后台",
              "nohup",
              "服务"
            ]
          },
          {
            "id": "disown",
            "syntax": "disown %1",
            "copy": "disown %1",
            "title": "把作业从 shell 任务表移除",
            "desc": "已经后台运行的任务不想被 shell 退出影响时，用 disown 解除关联。",
            "example": "disown %1",
            "note": "disown 不会让进程自动重启；只是不再受当前 shell 作业控制。",
            "keywords": [
              "后台",
              "shell",
              "任务"
            ]
          },
          {
            "id": "uptime",
            "syntax": "uptime",
            "copy": "uptime",
            "title": "查看开机时长和负载",
            "desc": "一行看到系统运行了多久、当前登录数和 1/5/15 分钟负载。",
            "example": "uptime",
            "note": "负载高不等于 CPU 满，还要结合 top 和 iostat 看。",
            "keywords": [
              "负载",
              "开机",
              "系统"
            ]
          },
          {
            "id": "uname",
            "syntax": "uname -a",
            "copy": "uname -a",
            "title": "查看内核与系统架构",
            "desc": "确认 macOS 内核版本、机器架构，排查二进制不兼容时先用它。",
            "example": "uname -a",
            "note": "只看架构用 uname -m；Apple Silicon 通常显示 arm64。",
            "keywords": [
              "内核",
              "架构",
              "系统"
            ]
          },
          {
            "id": "sw_vers",
            "syntax": "sw_vers",
            "copy": "sw_vers",
            "title": "查看 macOS 版本",
            "desc": "productVersion、buildVersion 和产品名一次列出，报 Bug 时很有用。",
            "example": "sw_vers",
            "note": "只适用于 macOS；Linux 用 cat /etc/os-release。",
            "keywords": [
              "macOS",
              "版本",
              "系统"
            ]
          },
          {
            "id": "sysctl",
            "syntax": "sysctl -n hw.memsize",
            "copy": "sysctl -n hw.memsize",
            "title": "读取系统内核参数",
            "desc": "sysctl 能查内存、CPU 核心和网络参数；-n 只输出值，方便脚本使用。",
            "example": "sysctl -n hw.memsize",
            "note": "写入系统参数风险高；先只读确认键名，不要照抄网上的优化参数。",
            "keywords": [
              "内核",
              "内存",
              "参数"
            ]
          },
          {
            "id": "vmstat",
            "syntax": "vm_stat",
            "copy": "vm_stat",
            "title": "查看虚拟内存统计",
            "desc": "macOS 用 vm_stat 看 page 活动、空闲和压缩内存，判断内存压力。",
            "example": "vm_stat",
            "note": "page size 通常 4096；空闲内存少不一定有问题，要看 pressure。",
            "keywords": [
              "内存",
              "虚拟内存",
              "page"
            ]
          },
          {
            "id": "dmesg",
            "syntax": "sudo dmesg | tail",
            "copy": "sudo dmesg | tail",
            "title": "查看内核日志",
            "desc": "排查硬件、驱动或 USB 问题时，dmesg 能看到内核最近输出。",
            "example": "sudo dmesg | tail",
            "note": "macOS 可能限制普通用户读取；日志量大时先 tail 或 grep。",
            "keywords": [
              "内核",
              "日志",
              "硬件"
            ]
          },
          {
            "id": "launchctl",
            "syntax": "launchctl list | grep com.example",
            "copy": "launchctl list | grep com.example",
            "title": "查看 launchd 服务",
            "desc": "macOS 用 launchd 管理后台服务，launchctl 可以列出、加载和卸载任务。",
            "example": "launchctl list | grep com.example",
            "note": "不要随意 bootout 系统服务；先确认 label 属于哪个应用。",
            "keywords": [
              "launchd",
              "服务",
              "后台"
            ]
          },
          {
            "id": "system_profiler",
            "syntax": "system_profiler SPHardwareDataType",
            "copy": "system_profiler SPHardwareDataType",
            "title": "查看硬件概览",
            "desc": "不打开“关于本机”也能看型号、芯片、内存和序列号（注意隐私）。",
            "example": "system_profiler SPHardwareDataType",
            "note": "输出可加 -json 便于脚本；序列号不要公开发布。",
            "keywords": [
              "硬件",
              "型号",
              "macOS"
            ]
          },
          {
            "id": "pmset",
            "syntax": "pmset -g",
            "copy": "pmset -g",
            "title": "查看电源与休眠设置",
            "desc": "pmset 显示当前电源策略、休眠计时和防止睡眠的设置。",
            "example": "pmset -g",
            "note": "修改电源策略需要 sudo；先只读确认当前值。",
            "keywords": [
              "电源",
              "休眠",
              "设置"
            ]
          }
        ],
        "net": [
          {
            "id": "ping",
            "syntax": "ping <域名>",
            "copy": "ping -c 4 github.com",
            "title": "先测网络通不通",
            "desc": "向目标发 ICMP 包，确认域名能解析、网络能到达。",
            "example": "ping -c 4 github.com",
            "note": "Mac 默认会一直 ping；加 -c 4 只发 4 个包，方便脚本和快速排查。",
            "keywords": [
              "网络",
              "连通",
              "DNS"
            ]
          },
          {
            "id": "curli",
            "syntax": "curl -I <URL>",
            "copy": "curl -I https://example.com",
            "title": "只看响应头",
            "desc": "不下载正文，只检查 HTTP 状态码、内容类型和跳转信息。",
            "example": "curl -I https://example.com",
            "note": "排查 404/500 很快；加 -L 跟随重定向，看最终落点。",
            "keywords": [
              "HTTP",
              "状态码",
              "响应头"
            ]
          },
          {
            "id": "curlo",
            "syntax": "curl -O <URL>",
            "copy": "curl -L -O https://example.com/data.json",
            "title": "从 URL 下载文件",
            "desc": "把远程文件下载到当前目录，文件名默认取 URL 最后一段。",
            "example": "curl -L -O https://example.com/data.json",
            "note": "加 -L 跟随跳转；下载前先用 curl -I 确认地址和状态码。",
            "keywords": [
              "下载",
              "URL",
              "文件"
            ]
          },
          {
            "id": "ssh",
            "syntax": "ssh <用户>@<主机>",
            "copy": "ssh deploy@203.0.113.10",
            "title": "登录远程服务器",
            "desc": "通过 SSH 进入远程机器，后续命令就在那台服务器上执行。",
            "example": "ssh deploy@203.0.113.10",
            "note": "首次连接会要求确认 fingerprint；输入密码时屏幕不会显示任何字符。",
            "keywords": [
              "远程",
              "服务器",
              "登录"
            ]
          },
          {
            "id": "sync",
            "syntax": "scp <文件> <用户>@<主机>:<路径>",
            "copy": "rsync -av ./dist/ deploy@host:/var/www/app/",
            "title": "把文件传到服务器",
            "desc": "scp 适合单个文件，rsync 更适合目录同步和断点续传。",
            "example": "rsync -av ./dist/ deploy@host:/var/www/app/",
            "note": "rsync -av 会保留权限并显示进度；目标路径结尾的 / 会影响同步行为，先小目录试跑。",
            "keywords": [
              "上传",
              "同步",
              "部署"
            ]
          },
          {
            "id": "traceroute",
            "syntax": "traceroute github.com",
            "copy": "traceroute github.com",
            "title": "看网络经过哪些路由",
            "desc": "traceroute 逐跳显示路径和延迟，定位“能 ping 通但访问慢”的中间节点。",
            "example": "traceroute github.com",
            "note": "macOS 自带 traceroute；某些网络会屏蔽 ICMP，结果不完整。",
            "keywords": [
              "路由",
              "延迟",
              "网络"
            ]
          },
          {
            "id": "dig",
            "syntax": "dig github.com +short",
            "copy": "dig github.com +short",
            "title": "查询 DNS 解析",
            "desc": "dig 比 nslookup 更详细，+short 只留解析结果，快速确认域名指向。",
            "example": "dig github.com +short",
            "note": "查指定记录用 dig A github.com；缓存和权威结果可能不同。",
            "keywords": [
              "DNS",
              "解析",
              "域名"
            ]
          },
          {
            "id": "nslookup",
            "syntax": "nslookup github.com",
            "copy": "nslookup github.com",
            "title": "交互式查 DNS",
            "desc": "老牌 DNS 查询工具，适合确认 A/AAAA/CNAME 记录和默认 DNS 服务器。",
            "example": "nslookup github.com",
            "note": "输出比 dig 啰嗦；脚本里优先 dig +short。",
            "keywords": [
              "DNS",
              "域名",
              "查询"
            ]
          },
          {
            "id": "host",
            "syntax": "host github.com",
            "copy": "host github.com",
            "title": "快速查域名记录",
            "desc": "host 输出简洁，适合一条命令确认域名有没有解析、指向哪个 IP。",
            "example": "host github.com",
            "note": "查邮件记录用 host -t MX；反查用 host IP。",
            "keywords": [
              "DNS",
              "记录",
              "域名"
            ]
          },
          {
            "id": "whois",
            "syntax": "whois github.com",
            "copy": "whois github.com",
            "title": "查域名注册信息",
            "desc": "看域名注册商、到期时间和名称服务器，排查域名归属或过期问题。",
            "example": "whois github.com",
            "note": "macOS 可能没有 whois；可用 brew install whois 或在线查询。",
            "keywords": [
              "域名",
              "注册",
              "whois"
            ]
          },
          {
            "id": "wget",
            "syntax": "wget -O data.json https://example.com/data.json",
            "copy": "wget -O data.json https://example.com/data.json",
            "title": "下载 URL 到指定文件",
            "desc": "wget 支持递归和断点续传，适合脚本下载；-O 指定保存名。",
            "example": "wget -O data.json https://example.com/data.json",
            "note": "macOS 默认没有 wget，常用 curl -L -o 替代。",
            "keywords": [
              "下载",
              "URL",
              "脚本"
            ]
          },
          {
            "id": "scp",
            "syntax": "scp ./dist/app.zip deploy@host:/var/www/",
            "copy": "scp ./dist/app.zip deploy@host:/var/www/",
            "title": "用 SSH 复制文件",
            "desc": "scp 走 SSH 加密通道，把本地文件传到远程；适合单个文件或小目录。",
            "example": "scp ./dist/app.zip deploy@host:/var/www/",
            "note": "大目录用 rsync -av；确认远程路径和权限，避免覆盖生产文件。",
            "keywords": [
              "复制",
              "SSH",
              "远程"
            ]
          },
          {
            "id": "sftp",
            "syntax": "sftp deploy@host",
            "copy": "sftp deploy@host",
            "title": "交互式远程文件传输",
            "desc": "sftp 提供类似 FTP 的交互界面，但底层走 SSH，适合浏览和上传少量文件。",
            "example": "sftp deploy@host",
            "note": "登录后可用 ls、cd、put、get；退出用 exit。",
            "keywords": [
              "SFTP",
              "远程",
              "上传"
            ]
          },
          {
            "id": "ssh-keygen",
            "syntax": "ssh-keygen -t ed25519 -C \"you@example.com\"",
            "copy": "ssh-keygen -t ed25519 -C \"you@example.com\"",
            "title": "生成 SSH 密钥",
            "desc": "创建更现代的 ed25519 密钥对，用于 Git 或服务器免密登录。",
            "example": "ssh-keygen -t ed25519 -C \"you@example.com\"",
            "note": "私钥不要发给任何人；公钥 .pub 才能上传到 GitHub 或服务器。",
            "keywords": [
              "SSH",
              "密钥",
              "Git"
            ]
          },
          {
            "id": "ssh-add",
            "syntax": "ssh-add --apple-use-keychain ~/.ssh/id_ed25519",
            "copy": "ssh-add --apple-use-keychain ~/.ssh/id_ed25519",
            "title": "把密钥加入 ssh-agent",
            "desc": "macOS 可以把密钥存进钥匙串，重启后不用反复输入口令。",
            "example": "ssh-add --apple-use-keychain ~/.ssh/id_ed25519",
            "note": "旧版 macOS 参数不同；先确认 ssh-add -l 是否已有密钥。",
            "keywords": [
              "ssh-agent",
              "钥匙串",
              "密钥"
            ]
          },
          {
            "id": "ssh-agent",
            "syntax": "eval \"$(ssh-agent -s)\"",
            "copy": "eval \"$(ssh-agent -s)\"",
            "title": "启动 ssh-agent",
            "desc": "ssh-agent 在后台缓存解密后的密钥，减少重复认证；eval 把环境变量接进当前 shell。",
            "example": "eval \"$(ssh-agent -s)\"",
            "note": "每个新登录会话可能需要重新启动；配合 ssh-add 使用。",
            "keywords": [
              "ssh-agent",
              "认证",
              "密钥"
            ]
          },
          {
            "id": "nc",
            "syntax": "nc -vz localhost 3000",
            "copy": "nc -vz localhost 3000",
            "title": "测试 TCP 端口是否可连",
            "desc": "netcat 可以快速验证某个端口有没有服务在监听，不依赖浏览器。",
            "example": "nc -vz localhost 3000",
            "note": "macOS 自带 nc 选项较老；只测试自己有权限的目标。",
            "keywords": [
              "端口",
              "TCP",
              "连通"
            ]
          },
          {
            "id": "telnet",
            "syntax": "telnet example.com 80",
            "copy": "telnet example.com 80",
            "title": "手工测试 TCP 服务",
            "desc": "telnet 建立原始 TCP 连接，能验证端口和协议握手；不适合传敏感数据。",
            "example": "telnet example.com 80",
            "note": "很多服务器已禁用 telnet；测试完输入 quit 退出。",
            "keywords": [
              "TCP",
              "端口",
              "测试"
            ]
          },
          {
            "id": "netstat",
            "syntax": "netstat -an | grep LISTEN",
            "copy": "netstat -an | grep LISTEN",
            "title": "查看监听端口和连接",
            "desc": "netstat 列出网络连接和监听状态，快速确认服务到底有没有 bind。",
            "example": "netstat -an | grep LISTEN",
            "note": "macOS 输出和 Linux 有差异；更现代可用 lsof -nP -iTCP -sTCP:LISTEN。",
            "keywords": [
              "端口",
              "监听",
              "连接"
            ]
          },
          {
            "id": "ifconfig",
            "syntax": "ifconfig en0",
            "copy": "ifconfig en0",
            "title": "查看网卡地址",
            "desc": "查看 en0 的 IP、掩码和状态，确认机器连在哪个网络、地址是多少。",
            "example": "ifconfig en0",
            "note": "接口名可能是 en0/en1；只看 IPv4 可加 inet。",
            "keywords": [
              "网卡",
              "IP",
              "接口"
            ]
          },
          {
            "id": "networksetup",
            "syntax": "networksetup -listallhardwareports",
            "copy": "networksetup -listallhardwareports",
            "title": "列出网络硬件端口",
            "desc": "把 Wi-Fi、以太网、Thunderbolt 桥接和对应设备名对上，排查网络接口很实用。",
            "example": "networksetup -listallhardwareports",
            "note": "修改 DNS 或代理需要 sudo；先只读列出再决定。",
            "keywords": [
              "网络",
              "硬件端口",
              "macOS"
            ]
          },
          {
            "id": "airport",
            "syntax": "airport -I",
            "copy": "airport -I",
            "title": "查看当前 Wi-Fi 信息",
            "desc": "显示当前 SSID、信道、RSSI 和传输速率，排查无线质量时使用。",
            "example": "airport -I",
            "note": "新版 macOS 可能限制 airport 输出；可改用 wdutil。",
            "keywords": [
              "WiFi",
              "信号",
              "macOS"
            ]
          },
          {
            "id": "route",
            "syntax": "route -n get default",
            "copy": "route -n get default",
            "title": "查看默认路由",
            "desc": "确认流量默认走哪个网关，排查“有 IP 但上不了网”时先看默认路由。",
            "example": "route -n get default",
            "note": "修改路由表需要 sudo；先只读确认，不要随意删默认路由。",
            "keywords": [
              "路由",
              "网关",
              "网络"
            ]
          },
          {
            "id": "arp",
            "syntax": "arp -a",
            "copy": "arp -a",
            "title": "查看局域网 ARP 缓存",
            "desc": "显示 IP 与 MAC 的对应关系，排查局域网设备冲突或网关异常。",
            "example": "arp -a",
            "note": "缓存会过期；不要用它做网络扫描或越权探测。",
            "keywords": [
              "ARP",
              "局域网",
              "MAC"
            ]
          },
          {
            "id": "tcpdump",
            "syntax": "sudo tcpdump -i en0 -n port 443",
            "copy": "sudo tcpdump -i en0 -n port 443",
            "title": "抓取指定端口的流量",
            "desc": "本机网络排障时抓取握手和响应，确认请求到底有没有发出去。",
            "example": "sudo tcpdump -i en0 -n port 443",
            "note": "只抓自己有权分析的流量；输出可能含敏感信息，别公开贴出。",
            "keywords": [
              "抓包",
              "端口",
              "排障"
            ],
            "danger": true
          }
        ],
        "dev": [
          {
            "id": "xcode",
            "syntax": "xcode-select --install",
            "copy": "xcode-select --install",
            "title": "装好命令行工具",
            "desc": "Mac 上的 git、clang 等基础工具来自 Command Line Tools，第一次开发前先装它。",
            "example": "xcode-select --install",
            "note": "会弹出系统安装器，按提示完成；装完后用 git --version 验证。",
            "keywords": [
              "Xcode",
              "git",
              "clang"
            ]
          },
          {
            "id": "brew",
            "syntax": "brew install <包名>",
            "copy": "brew install git node python@3.12",
            "title": "用 Homebrew 装工具",
            "desc": "macOS 最常用的包管理器。一次装多个工具，升级和卸载也有统一入口。",
            "example": "brew install git node python@3.12",
            "note": "先确认 brew --version 可用；brew list 看已装，brew upgrade 更新。",
            "keywords": [
              "Homebrew",
              "安装",
              "包管理"
            ]
          },
          {
            "id": "python3",
            "syntax": "python3 -m http.server 8000",
            "copy": "python3 -m http.server 8000",
            "title": "起一个本地静态服务器",
            "desc": "不想配框架时，用 Python 自带模块把当前目录变成可访问的网页服务。",
            "example": "python3 -m http.server 8000",
            "note": "浏览器打开 http://localhost:8000；Control-C 停止，端口被占用就换 8001。",
            "keywords": [
              "Python",
              "本地服务",
              "localhost"
            ]
          },
          {
            "id": "node",
            "syntax": "node -v / npm install",
            "copy": "node -v\nnpm install\nnpm run dev",
            "title": "检查 Node 项目",
            "desc": "先看 Node 版本，再安装依赖、启动开发脚本。具体脚本看 package.json。",
            "example": "node -v\nnpm install\nnpm run dev",
            "note": "版本不对时先看 .nvmrc 或 package.json 的 engines；不要混用多个 Node 版本。",
            "keywords": [
              "Node",
              "npm",
              "依赖"
            ]
          },
          {
            "id": "git",
            "syntax": "git clone <仓库>",
            "copy": "git clone https://github.com/user/repo.git\ncd repo\ngit status",
            "title": "拿到仓库并检查状态",
            "desc": "克隆项目后先看 git status，确认当前分支和未提交改动，再开始改代码。",
            "example": "git clone https://github.com/user/repo.git\ncd repo\ngit status",
            "note": "不要在有未提交改动时硬切分支；先 commit 或 stash，避免丢工作。",
            "keywords": [
              "Git",
              "clone",
              "status"
            ]
          },
          {
            "id": "xcrun",
            "syntax": "xcrun --find clang",
            "copy": "xcrun --find clang",
            "title": "定位 Xcode 命令行工具",
            "desc": "xcrun 按当前开发者目录找工具路径，排查“command not found”时先看它。",
            "example": "xcrun --find clang",
            "note": "需要先装 Xcode Command Line Tools；xcode-select -p 看当前路径。",
            "keywords": [
              "Xcode",
              "工具链",
              "clang"
            ]
          },
          {
            "id": "clang",
            "syntax": "clang -Wall hello.c -o hello",
            "copy": "clang -Wall hello.c -o hello",
            "title": "编译 C/C++ 程序",
            "desc": "macOS 自带 clang，-Wall 打开常见警告，-o 指定输出文件。",
            "example": "clang -Wall hello.c -o hello",
            "note": "C++ 用 clang++；编译失败先看第一条错误，不要只看最后一行。",
            "keywords": [
              "C",
              "编译器",
              "clang"
            ]
          },
          {
            "id": "swift",
            "syntax": "swift --version",
            "copy": "swift --version",
            "title": "检查 Swift 工具链",
            "desc": "确认 Swift 版本和是否安装完整 Xcode，开发 macOS/iOS 应用前先看。",
            "example": "swift --version",
            "note": "只装 Command Line Tools 也能跑部分 Swift；完整 SDK 需要 Xcode。",
            "keywords": [
              "Swift",
              "Xcode",
              "版本"
            ]
          },
          {
            "id": "gitconfig",
            "syntax": "git config --global user.name \"Your Name\"",
            "copy": "git config --global user.name \"Your Name\"",
            "title": "设置 Git 提交身份",
            "desc": "新机器第一次提交前设置用户名和邮箱，否则 commit 作者信息会不对。",
            "example": "git config --global user.name \"Your Name\"",
            "note": "邮箱用 git config --global user.email 设置；--global 只影响当前用户。",
            "keywords": [
              "Git",
              "配置",
              "提交"
            ]
          },
          {
            "id": "gh",
            "syntax": "gh repo clone user/repo",
            "copy": "gh repo clone user/repo",
            "title": "用 GitHub CLI 克隆仓库",
            "desc": "gh 可以直接创建、克隆、查看 PR，登录后比手拼 URL 更方便。",
            "example": "gh repo clone user/repo",
            "note": "第一次用 gh auth login；权限范围按需选择，不要过度授权。",
            "keywords": [
              "GitHub",
              "CLI",
              "仓库"
            ]
          },
          {
            "id": "npm",
            "syntax": "npm install",
            "copy": "npm install",
            "title": "安装 Node 项目依赖",
            "desc": "进入 package.json 所在目录后安装依赖，生成 node_modules 和锁文件。",
            "example": "npm install",
            "note": "CI 用 npm ci 可复现；升级依赖前先看 lockfile 变更。",
            "keywords": [
              "Node",
              "依赖",
              "npm"
            ]
          },
          {
            "id": "npx",
            "syntax": "npx create-next-app@latest demo",
            "copy": "npx create-next-app@latest demo",
            "title": "临时运行 npm 包命令",
            "desc": "npx 可以直接执行包里的命令，不必全局安装，适合脚手架和一次性工具。",
            "example": "npx create-next-app@latest demo",
            "note": "确认包名和版本再执行；公司项目优先使用锁定版本。",
            "keywords": [
              "npx",
              "脚手架",
              "Node"
            ]
          },
          {
            "id": "pip3",
            "syntax": "pip3 install -r requirements.txt",
            "copy": "pip3 install -r requirements.txt",
            "title": "安装 Python 依赖",
            "desc": "按 requirements.txt 安装项目依赖，适合本地开发和虚拟环境。",
            "example": "pip3 install -r requirements.txt",
            "note": "先激活 venv 再装，避免污染系统 Python；生产环境固定版本。",
            "keywords": [
              "Python",
              "pip",
              "依赖"
            ]
          },
          {
            "id": "brewservices",
            "syntax": "brew services list",
            "copy": "brew services list",
            "title": "查看 Homebrew 后台服务",
            "desc": "列出通过 brew 安装并注册为 launchd 的服务及其运行状态。",
            "example": "brew services list",
            "note": "启动服务用 brew services start 名称；不要盲目 start 不认识的数据库。",
            "keywords": [
              "Homebrew",
              "服务",
              "launchd"
            ]
          },
          {
            "id": "docker",
            "syntax": "docker ps",
            "copy": "docker ps",
            "title": "查看正在运行的容器",
            "desc": "确认容器是否启动、端口映射和镜像名，是 Docker 排障第一步。",
            "example": "docker ps",
            "note": "看已停止容器用 docker ps -a；日志用 docker logs。",
            "keywords": [
              "Docker",
              "容器",
              "端口"
            ]
          },
          {
            "id": "compose",
            "syntax": "docker compose up -d",
            "copy": "docker compose up -d",
            "title": "启动 Compose 服务栈",
            "desc": "在 compose.yml 目录里后台启动所有服务，适合本地数据库和 API 联调。",
            "example": "docker compose up -d",
            "note": "启动后看 docker compose ps；改配置后先 down 再 up。",
            "keywords": [
              "Docker",
              "Compose",
              "服务"
            ]
          },
          {
            "id": "make",
            "syntax": "make -j4",
            "copy": "make -j4",
            "title": "按 Makefile 构建",
            "desc": "make 读取 Makefile 执行目标，-j4 并行四个任务，适合编译和自动化脚本。",
            "example": "make -j4",
            "note": "先看 Makefile 的 clean/build 目标；并行数不要超过机器承受范围。",
            "keywords": [
              "Makefile",
              "构建",
              "并行"
            ]
          },
          {
            "id": "cmake",
            "syntax": "cmake -S . -B build",
            "copy": "cmake -S . -B build",
            "title": "生成构建目录",
            "desc": "CMake 把项目配置到独立 build 目录，避免源码目录被生成文件污染。",
            "example": "cmake -S . -B build",
            "note": "生成后再 cmake --build build；清理直接删 build 目录。",
            "keywords": [
              "CMake",
              "构建",
              "C++"
            ]
          },
          {
            "id": "go",
            "syntax": "go run .",
            "copy": "go run .",
            "title": "运行 Go 程序",
            "desc": "在模块目录里直接编译并运行当前包，开发小工具时最快。",
            "example": "go run .",
            "note": "生产构建用 go build；依赖用 go mod tidy 管理。",
            "keywords": [
              "Go",
              "运行",
              "模块"
            ]
          },
          {
            "id": "cargo",
            "syntax": "cargo run",
            "copy": "cargo run",
            "title": "运行 Rust 项目",
            "desc": "Cargo 负责依赖、编译和运行；第一次会下载 crates，耐心等索引完成。",
            "example": "cargo run",
            "note": "发布构建用 cargo build --release；错误先看第一个。",
            "keywords": [
              "Rust",
              "Cargo",
              "构建"
            ]
          },
          {
            "id": "java",
            "syntax": "java -version",
            "copy": "java -version",
            "title": "检查 Java 运行时",
            "desc": "确认默认 java 版本和供应商，排查项目启动版本不匹配时先看它。",
            "example": "java -version",
            "note": "macOS 可能有多个 JDK；/usr/libexec/java_home -V 列出全部。",
            "keywords": [
              "Java",
              "JDK",
              "版本"
            ]
          },
          {
            "id": "javac",
            "syntax": "javac Hello.java && java Hello",
            "copy": "javac Hello.java && java Hello",
            "title": "编译并运行 Java",
            "desc": "javac 生成 .class，java 运行类名（不要带 .class 后缀）。",
            "example": "javac Hello.java && java Hello",
            "note": "包结构要用 -d 指定输出目录；编译错误先修第一个。",
            "keywords": [
              "Java",
              "javac",
              "编译"
            ]
          },
          {
            "id": "mvn",
            "syntax": "mvn test",
            "copy": "mvn test",
            "title": "运行 Maven 测试",
            "desc": "Maven 按 pom.xml 解析依赖并执行生命周期，test 会编译并跑测试。",
            "example": "mvn test",
            "note": "第一次会下载依赖；离线环境先配置本地仓库。",
            "keywords": [
              "Maven",
              "测试",
              "Java"
            ]
          },
          {
            "id": "gradle",
            "syntax": "./gradlew test",
            "copy": "./gradlew test",
            "title": "用 Gradle Wrapper 跑测试",
            "desc": "项目自带 gradlew 时优先用它，保证团队使用同一 Gradle 版本。",
            "example": "./gradlew test",
            "note": "需要可执行权限；失败先看 build/reports/tests。",
            "keywords": [
              "Gradle",
              "测试",
              "Java"
            ]
          },
          {
            "id": "code",
            "syntax": "code .",
            "copy": "code .",
            "title": "用 VS Code 打开当前目录",
            "desc": "已安装 code 命令后，可以不出终端就把当前项目交给 VS Code。",
            "example": "code .",
            "note": "需在 VS Code 里执行 Shell Command: Install code command in PATH。",
            "keywords": [
              "VS Code",
              "编辑器",
              "项目"
            ]
          }
        ],
        "os": [
          {
            "id": "open",
            "syntax": "open .",
            "copy": "open .",
            "title": "在 Finder 里打开当前目录",
            "desc": "不用记路径，也不用层层点文件夹，直接把当前目录交给 Finder。",
            "example": "open .",
            "note": "想打开指定目录就写 open ~/Projects；open -a 可以指定 App。",
            "keywords": [
              "Finder",
              "打开",
              "目录"
            ]
          },
          {
            "id": "openapp",
            "syntax": "open -a \"<App 名>\" <文件>",
            "copy": "open -a \"Visual Studio Code\" .",
            "title": "用指定 App 打开",
            "desc": "把文件或目录交给某个 Mac 应用打开，比如用 VS Code 打开当前项目。",
            "example": "open -a \"Visual Studio Code\" .",
            "note": "App 名有空格要加引号；open -a Terminal 可以直接开一个新终端窗口。",
            "keywords": [
              "VS Code",
              "应用",
              "打开"
            ]
          },
          {
            "id": "pbcopy",
            "syntax": "pbcopy / pbpaste",
            "copy": "pbpaste | grep TODO",
            "title": "把剪贴板当输入输出",
            "desc": "pbcopy 把标准输入放进剪贴板，pbpaste 把剪贴板内容打印出来。",
            "example": "pbpaste | grep TODO",
            "note": "复制命令结果时很好用；也可以把一段文本通过管道直接送进剪贴板。",
            "keywords": [
              "剪贴板",
              "复制",
              "粘贴"
            ]
          },
          {
            "id": "mdfind",
            "syntax": "mdfind \"<关键词>\"",
            "copy": "mdfind \"name:README.md\"",
            "title": "用 Spotlight 搜文件",
            "desc": "直接查 macOS 的 Spotlight 索引，比 find 全盘扫描快很多。",
            "example": "mdfind \"name:README.md\"",
            "note": "加 -onlyin . 只在当前目录找；搜不到时先确认 Spotlight 索引是否正常。",
            "keywords": [
              "Spotlight",
              "搜索",
              "文件"
            ]
          },
          {
            "id": "caffeinate",
            "syntax": "caffeinate -di <命令>",
            "copy": "caffeinate -di npm run build",
            "title": "编译时别让 Mac 睡着",
            "desc": "在命令运行期间阻止系统休眠，适合长时间编译、下载或跑测试。",
            "example": "caffeinate -di npm run build",
            "note": "命令结束会自动恢复；-d 防显示器休眠，-i 防系统空闲休眠。",
            "keywords": [
              "休眠",
              "编译",
              "长时间"
            ]
          },
          {
            "id": "pbpaste",
            "syntax": "pbpaste > clipboard.txt",
            "copy": "pbpaste > clipboard.txt",
            "title": "把剪贴板内容写到文件",
            "desc": "pbpaste 把 Mac 剪贴板打印到标准输出，适合保存复制来的日志或配置。",
            "example": "pbpaste > clipboard.txt",
            "note": "只处理文本；图片和富文本可能丢失格式。",
            "keywords": [
              "剪贴板",
              "文本",
              "macOS"
            ]
          },
          {
            "id": "defaults",
            "syntax": "defaults read com.apple.finder AppleShowAllFiles",
            "copy": "defaults read com.apple.finder AppleShowAllFiles",
            "title": "读取应用偏好设置",
            "desc": "defaults 读写 macOS 应用的 plist 配置，排查 Finder、Dock 行为很常用。",
            "example": "defaults read com.apple.finder AppleShowAllFiles",
            "note": "写入后可能需要 killall Finder 生效；先 read 备份当前值。",
            "keywords": [
              "偏好",
              "plist",
              "Finder"
            ]
          },
          {
            "id": "plutil",
            "syntax": "plutil -lint Info.plist",
            "copy": "plutil -lint Info.plist",
            "title": "校验 plist 语法",
            "desc": "plutil 检查 plist 是否合法，打包或改配置后先用它验一遍，避免应用启动失败。",
            "example": "plutil -lint Info.plist",
            "note": "转换格式用 plutil -convert xml1；改前备份原文件。",
            "keywords": [
              "plist",
              "校验",
              "配置"
            ]
          },
          {
            "id": "osascript",
            "syntax": "osascript -e 'display notification \"done\"'",
            "copy": "osascript -e 'display notification \"done\"'",
            "title": "执行 AppleScript",
            "desc": "用 osascript 调系统应用和自动化脚本，构建完成后弹通知很方便。",
            "example": "osascript -e 'display notification \"done\"'",
            "note": "复杂脚本先写到 .scpt 文件；不要执行来源不明的 AppleScript。",
            "keywords": [
              "AppleScript",
              "自动化",
              "通知"
            ]
          },
          {
            "id": "say",
            "syntax": "say \"Build finished\"",
            "copy": "say \"Build finished\"",
            "title": "让 Mac 读出文本",
            "desc": "长任务结束时用 say 提醒，比盯着屏幕等更轻松；可切换系统语音。",
            "example": "say \"Build finished\"",
            "note": "say -v 查看声音列表；不要用它循环播放大段文本。",
            "keywords": [
              "语音",
              "提醒",
              "macOS"
            ]
          },
          {
            "id": "screencapture",
            "syntax": "screencapture -x screen.png",
            "copy": "screencapture -x screen.png",
            "title": "命令行截屏",
            "desc": "screencapture 不弹界面直接截图，适合自动化记录测试结果。",
            "example": "screencapture -x screen.png",
            "note": "-x 关闭快门声；截取窗口用 -l 窗口 ID。",
            "keywords": [
              "截图",
              "自动化",
              "macOS"
            ]
          },
          {
            "id": "diskutil",
            "syntax": "diskutil list",
            "copy": "diskutil list",
            "title": "列出磁盘和分区",
            "desc": "装系统或排查外接盘时，先看磁盘标识符、分区表和挂载点。",
            "example": "diskutil list",
            "note": "不要对不认识的 diskX 执行 erase 或 partition；先确认卷名和大小。",
            "keywords": [
              "磁盘",
              "分区",
              "macOS"
            ]
          },
          {
            "id": "hdiutil",
            "syntax": "hdiutil info",
            "copy": "hdiutil info",
            "title": "查看挂载的磁盘映像",
            "desc": "hdiutil 管理 .dmg、挂载点和转换格式，安装应用或制作镜像时常用。",
            "example": "hdiutil info",
            "note": "卸载用 hdiutil detach；不要强行 detach 正在写入的磁盘。",
            "keywords": [
              "dmg",
              "挂载",
              "镜像"
            ]
          },
          {
            "id": "softwareupdate",
            "syntax": "softwareupdate -l",
            "copy": "softwareupdate -l",
            "title": "检查系统更新",
            "desc": "只列出可用更新，不会自动安装；维护 Mac 前先确认补丁状态。",
            "example": "softwareupdate -l",
            "note": "安装更新需 sudo 并可能重启；生产设备先安排维护窗口。",
            "keywords": [
              "更新",
              "系统",
              "维护"
            ]
          },
          {
            "id": "systemsetup",
            "syntax": "systemsetup -getremotelogin",
            "copy": "systemsetup -getremotelogin",
            "title": "查看远程登录设置",
            "desc": "确认 SSH 远程登录是否开启；修改设置需要管理员权限。",
            "example": "systemsetup -getremotelogin",
            "note": "开启远程登录会增加攻击面；只在需要时启用并配合防火墙。",
            "keywords": [
              "远程登录",
              "SSH",
              "设置"
            ]
          },
          {
            "id": "scutil",
            "syntax": "scutil --dns",
            "copy": "scutil --dns",
            "title": "查看 DNS 配置",
            "desc": "scutil 读取系统网络配置，--dns 显示解析器和 search domain，排查 DNS 很直接。",
            "example": "scutil --dns",
            "note": "修改网络配置用 networksetup；先只读确认当前解析器。",
            "keywords": [
              "DNS",
              "网络",
              "macOS"
            ]
          },
          {
            "id": "dscacheutil",
            "syntax": "dscacheutil -q user -a name $USER",
            "copy": "dscacheutil -q user -a name $USER",
            "title": "查询目录服务缓存",
            "desc": "dscacheutil 按类型查询用户、组和主机记录，排查账户解析问题。",
            "example": "dscacheutil -q user -a name $USER",
            "note": "缓存可能过期；改目录服务后刷新或重启相关服务。",
            "keywords": [
              "目录缓存",
              "用户",
              "macOS"
            ]
          },
          {
            "id": "logshow",
            "syntax": "log show --last 10m --predicate 'process == \"Safari\"'",
            "copy": "log show --last 10m --predicate 'process == \"Safari\"'",
            "title": "查看系统统一日志",
            "desc": "log show 读取历史日志，支持时间和进程过滤，排查应用崩溃很有效。",
            "example": "log show --last 10m --predicate 'process == \"Safari\"'",
            "note": "日志量很大，先限制时间和进程；隐私字段可能被系统隐藏。",
            "keywords": [
              "日志",
              "排障",
              "macOS"
            ]
          },
          {
            "id": "logstream",
            "syntax": "log stream --predicate 'process == \"Safari\"'",
            "copy": "log stream --predicate 'process == \"Safari\"'",
            "title": "实时跟踪系统日志",
            "desc": "log stream 持续输出新日志，适合复现问题时边操作边观察。",
            "example": "log stream --predicate 'process == \"Safari\"'",
            "note": "会一直占用终端，按 Control-C 停止；过滤条件越窄越好。",
            "keywords": [
              "日志",
              "实时",
              "macOS"
            ]
          },
          {
            "id": "sips",
            "syntax": "sips -g pixelWidth image.png",
            "copy": "sips -g pixelWidth image.png",
            "title": "查看或转换图片",
            "desc": "sips 是 macOS 自带图片处理器，能读尺寸、格式并批量转换，不必打开预览。",
            "example": "sips -g pixelWidth image.png",
            "note": "转换用 sips -s format jpeg；批量前先备份原图。",
            "keywords": [
              "图片",
              "尺寸",
              "转换"
            ]
          },
          {
            "id": "qlmanage",
            "syntax": "qlmanage -t -s 512 -o /tmp image.png",
            "copy": "qlmanage -t -s 512 -o /tmp image.png",
            "title": "生成 Quick Look 缩略图",
            "desc": "用系统预览引擎批量生成缩略图，做素材预览或检查文件能否渲染。",
            "example": "qlmanage -t -s 512 -o /tmp image.png",
            "note": "输出在指定目录；有些格式需要对应插件。",
            "keywords": [
              "缩略图",
              "QuickLook",
              "预览"
            ]
          },
          {
            "id": "textutil",
            "syntax": "textutil -convert txt notes.rtf",
            "copy": "textutil -convert txt notes.rtf",
            "title": "转换文档文本格式",
            "desc": "textutil 在 rtf、doc、html、txt 之间转换，处理旧文档很实用。",
            "example": "textutil -convert txt notes.rtf",
            "note": "复杂排版转换会丢样式；先复制一份原文件。",
            "keywords": [
              "文档",
              "转换",
              "rtf"
            ]
          },
          {
            "id": "afplay",
            "syntax": "afplay alert.aiff",
            "copy": "afplay alert.aiff",
            "title": "播放音频文件",
            "desc": "命令行播放提示音，适合脚本完成任务后提醒；支持音量参数。",
            "example": "afplay alert.aiff",
            "note": "只支持系统可解码格式；不要在高负载构建时循环播放。",
            "keywords": [
              "音频",
              "播放",
              "提醒"
            ]
          },
          {
            "id": "afconvert",
            "syntax": "afconvert input.wav output.m4a -f m4af",
            "copy": "afconvert input.wav output.m4a -f m4af",
            "title": "转换音频格式",
            "desc": "afconvert 用系统音频框架转码，制作提示音或压缩录音时可用。",
            "example": "afconvert input.wav output.m4a -f m4af",
            "note": "参数较多，先 afconvert -h 看格式；转换前保留原始文件。",
            "keywords": [
              "音频",
              "转码",
              "m4a"
            ]
          },
          {
            "id": "shortcuts",
            "syntax": "shortcuts list",
            "copy": "shortcuts list",
            "title": "列出快捷指令",
            "desc": "shortcuts 可以在终端触发 macOS 快捷指令，把常用自动化接进脚本。",
            "example": "shortcuts list",
            "note": "运行用 shortcuts run 名称；只运行自己创建或可信的快捷指令。",
            "keywords": [
              "快捷指令",
              "自动化",
              "macOS"
            ]
          }
        ]
      }
    },
    "linux": {
      "label": "Linux",
      "short": "Linux",
      "status": "planned",
      "badge": "框架已预留",
      "summary": "沿用同一套 8 个分组。下一版补充 apt、systemctl、journalctl、ss 等 Linux 常用命令。",
      "groupOverrides": {
        "os": {
          "name": "Linux 专属",
          "short": "Linux"
        }
      },
      "commands": {}
    },
    "windows": {
      "label": "Windows",
      "short": "Win",
      "status": "planned",
      "badge": "框架已预留",
      "summary": "沿用同一套 8 个分组。下一版补充 PowerShell、Get-Process、Get-NetTCPConnection 等命令。",
      "groupOverrides": {
        "os": {
          "name": "Windows 专属",
          "short": "Win"
        }
      },
      "commands": {}
    }
  }
};

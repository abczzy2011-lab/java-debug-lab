#!/usr/bin/env python3
"""z89 终端补全：把 Linux / Windows 的系统内建命令补齐到可日常使用的覆盖。

只写 agent-output/{linux,windows}.json；重复运行会跳过已有 id。
之后用 scripts/merge_terminal_platforms.py 重新生成数据层。
"""
from __future__ import annotations

import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "agent-output")
VERSION = "20261127z89n"

GROUP_SHORT = {
    "nav": "基础", "file": "文件", "view": "查看", "perm": "权限",
    "proc": "进程", "net": "网络", "dev": "开发", "pkg": "包管理",
    "disk": "磁盘", "sec": "安全", "container": "容器云", "media": "多媒体",
    "os": "专属", "alias": "别名", "other": "其他",
}

# (group, id, syntax, title, desc, danger?)
# 语法必须是可直接粘贴的具体形态；示例、提示、关键词由下面的 helper 统一补齐。
ADD = {
    "windows": [
        # 基础与导航
        ("nav", "get-variable", "Get-Variable", "查看当前会话变量", "列出当前 PowerShell 会话里的变量和值，排查环境变量是否被覆盖。", False),
        ("nav", "set-variable", 'Set-Variable -Name MyVar -Value "hello"', "创建或修改会话变量", "只在当前 PowerShell 会话有效，适合临时保存脚本参数或路径。", False),
        ("nav", "remove-variable", 'Remove-Variable -Name MyVar', "删除会话变量", "清掉临时变量，避免后续脚本误读旧值。", False),
        ("nav", "get-host", "Get-Host", "查看当前主机与版本信息", "显示 PowerShell 版本、宿主程序和区域设置，排查脚本兼容性时先看这里。", False),
        ("nav", "read-host", 'Read-Host "请输入项目名"', "暂停并读取一行输入", "在脚本里做交互式确认或收集参数；输入内容会作为字符串返回。", False),
        ("nav", "write-host", 'Write-Host "构建完成" -ForegroundColor Green', "向终端输出带颜色的提示", "只影响屏幕显示，不进入管道；需要可继续处理的数据时改用 Write-Output。", False),
        ("nav", "write-output", 'Write-Output "hello"', "向管道输出一个对象", "与 Write-Host 不同，输出会进入管道，能继续被 Select-Object 或 Out-File 处理。", False),
        ("nav", "push-location", "Push-Location C:\\Projects", "把当前目录压入位置栈", "临时切换目录后还能用 Pop-Location 回到原处，适合脚本里连续跳目录。", False),
        ("nav", "pop-location", "Pop-Location", "回到上一个目录", "从位置栈弹出最近保存的路径；没有保存过位置时会报错。", False),
        ("nav", "get-psdrive", "Get-PSDrive -PSProvider FileSystem", "查看已挂载的 PowerShell 驱动器", "列出盘符、网络映射和自定义 PSDrive，确认脚本里的路径是否真的存在。", False),
        ("nav", "new-psdrive", "New-PSDrive -Name work -PSProvider FileSystem -Root C:\\Work", "创建临时工作盘符", "把常用目录映射成短名称，脚本结束后可用 Remove-PSDrive 清理。", False),
        ("nav", "remove-psdrive", "Remove-PSDrive -Name work", "删除自定义盘符", "只删除映射，不会删除真实目录；删除前先确认名称。", False),
        ("nav", "pause", "pause", "暂停批处理等待按键", "cmd 脚本里常用，执行到此处会显示“请按任意键继续”。", False),
        ("nav", "timeout", "timeout /t 5", "等待指定秒数", "批处理里做延时或给用户阅读提示；按 Ctrl-C 可提前结束。", False),
        ("nav", "call", "call build.bat", "在批处理中调用另一个脚本", "调用结束后会回到当前脚本继续执行；不要漏掉 call，否则控制权不会返回。", False),
        ("nav", "if", "if exist config.ini (echo yes) else (echo no)", "按条件执行命令", "cmd 的条件分支，常用于判断文件、目录或环境变量是否存在。", False),
        ("nav", "for", "for %f in (*.log) do echo %f", "遍历一组文件", "cmd 的单行循环；写进 .bat 文件时变量要写成 %%f。", False),
        ("nav", "setlocal", "setlocal", "开启局部环境变量作用域", "批处理里避免临时变量污染全局环境，通常和 endlocal 成对出现。", False),
        ("nav", "endlocal", "endlocal", "结束局部环境变量作用域", "恢复 setlocal 之前的变量状态；不要跨脚本滥用。", False),
        ("nav", "shift-args", "shift", "轮转批处理参数", "把 %1 变成 %0、%2 变成 %1，处理不定数量的命令行参数时使用。", False),

        # 文件与目录
        ("file", "get-item", "Get-Item .\\README.md | Format-List *", "查看单个文件或目录的完整属性", "比 Get-ChildItem 更聚焦，适合确认长度、时间戳和属性；接 Format-List 展开全部字段。", False),
        ("file", "rename-item", "Rename-Item .\\old.txt new.txt", "重命名单个文件", "只改名字不移动位置；批量重命名建议先用 -WhatIf 预览。", False),
        ("file", "clear-content", "Clear-Content .\\app.log", "清空文件内容但保留文件", "适合日志轮转前清空；不可恢复，先确认路径和备份。", True),
        ("file", "resolve-path", "Resolve-Path .\\src\\*.java", "把相对路径解析成绝对路径", "确认脚本实际读到的是哪个目录，排查“明明有文件却找不到”时很有用。", False),
        ("file", "convert-path", "Convert-Path .\\src", "把 PowerShell 路径转成文件系统路径", "处理注册表或 PSDrive 路径时，转成普通路径再交给外部程序。", False),
        ("file", "join-path", "Join-Path C:\\Projects src", "安全拼接目录与文件名", "自动补上分隔符，避免手写字符串时多一个或少一个反斜杠。", False),
        ("file", "split-path", "Split-Path C:\\Projects\\src\\Main.java -Leaf", "取出路径的最后一段", "脚本里从完整路径提取文件名或父目录，比字符串截取更可靠。", False),
        ("file", "new-item-property", "New-ItemProperty -Path HKCU:\\Software\\MyApp -Name Theme -Value dark", "新建注册表值", "只对注册表或支持属性的提供程序有效；写错路径可能影响应用配置。", False),
        ("file", "get-childitem-recurse", "Get-ChildItem -Recurse -File", "递归列出所有文件", "只返回文件、不混入目录，适合统计项目文件或批量处理。", False),
        ("file", "remove-item-force", "Remove-Item .\\build -Recurse -Force", "强制删除目录及其内容", "递归删除不可逆，执行前先用 Get-ChildItem 确认路径。", True),

        # 查看与文本
        ("view", "out-string", "Get-Process | Out-String -Width 200", "把对象转成可读文本", "需要把表格写进日志或邮件时使用；宽表格记得加 -Width。", False),
        ("view", "out-host", "Get-Process | Out-Host", "把结果直接送到终端", "绕过后续管道，只用于显示；需要继续处理数据时不要接它。", False),
        ("view", "tee-object", "Get-ChildItem | Tee-Object -FilePath files.txt", "同时输出到屏幕和文件", "一边看结果一边留档，排查构建产物时很方便。", False),
        ("view", "convertto-json", "Get-Process | ConvertTo-Json -Depth 3", "把对象转成 JSON", "调用 API 或写配置文件时使用；嵌套对象要调大 -Depth。", False),
        ("view", "convertfrom-json", "Get-Content config.json -Raw | ConvertFrom-Json", "把 JSON 读成 PowerShell 对象", "-Raw 很关键，否则逐行读取会破坏 JSON 结构。", False),
        ("view", "convertto-csv", "Get-Process | ConvertTo-Csv -NoTypeInformation", "把对象转成 CSV 文本", "只是转换，不会写文件；要落盘再接 Set-Content 或 Export-Csv。", False),
        ("view", "convertfrom-csv", "Get-Content users.csv | ConvertFrom-Csv", "把 CSV 文本读成对象", "适合处理管道里的 CSV；直接读文件更常用 Import-Csv。", False),
        ("view", "import-csv", "Import-Csv .\\users.csv | Format-Table", "读取 CSV 文件", "第一行会作为列名；列名有空格时用引号访问属性。", False),
        ("view", "export-csv", "Get-Process | Export-Csv processes.csv -NoTypeInformation", "把对象写成 CSV 文件", "-NoTypeInformation 去掉类型注释，Excel 打开更干净。", False),
        ("view", "compare-object", "Compare-Object (Get-Content a.txt) (Get-Content b.txt)", "比较两个集合的差异", "输出只显示差异项；加 -IncludeEqual 可同时看到相同项。", False),
        ("view", "group-object", "Get-ChildItem | Group-Object Extension", "按属性分组统计", "快速看出不同扩展名各有多少文件，适合盘点目录。", False),
        ("view", "sort-object", "Get-Process | Sort-Object CPU -Descending", "按属性排序", "默认升序，排查高 CPU 进程时加 -Descending。", False),
        ("view", "get-member", "Get-Process | Get-Member", "查看对象有哪些属性", "不知道某个命令返回什么字段时，先 Get-Member 再决定 Select-Object。", False),
        ("view", "format-list", "Get-Service | Format-List Name,Status", "把对象逐字段竖排显示", "字段多、表格被截断时用 Format-List 看得更完整。", False),
        ("view", "format-table", "Get-Process | Format-Table Name,CPU -AutoSize", "把对象按表格显示", "-AutoSize 会根据内容调整列宽；字段太多时先选列。", False),
        ("view", "format-wide", "Get-Command Get-* | Format-Wide -Column 3", "把简短结果排成多列", "适合命令名、模块名这类短文本，比长表格更省屏幕。", False),
        ("view", "get-unique", "Get-ChildItem | Select-Object -ExpandProperty Extension | Get-Unique", "去掉重复值", "输入必须先排序，否则 Get-Unique 只能去掉相邻重复。", False),
        ("view", "more-pager", "more README.md", "分页查看文本", "cmd 自带的分页器，按空格翻页、按 Q 退出；大文件优先用 Get-Content -Tail。", False),
        ("view", "fc-compare", "fc file1.txt file2.txt", "比较两个文本文件", "cmd 的文件比较命令，输出差异行；二进制文件不要用。", False),
        ("view", "comp", "comp file1.txt file2.txt", "逐字节比较两个文件", "适合确认两个文件是否完全一致；大文件会比较慢。", False),
        ("view", "find", 'find "ERROR" app.log', "在文本里查找字符串", "cmd 的简单查找，不支持正则；复杂匹配改用 Select-String。", False),
        ("view", "sort", "sort /r names.txt", "按行排序文本", "cmd 的排序命令，/r 表示倒序；默认按字符编码排序。", False),
        ("view", "print", "print report.txt", "把文本送到打印机", "需要先配置默认打印机；只适合纯文本，不要用它打印 PDF。", False),

        # 权限与账号
        ("perm", "set-localuser", "Set-LocalUser -Name student -PasswordNeverExpires $true", "修改本地用户属性", "需要管理员权限；改密码策略前确认组织规定。", False),
        ("perm", "remove-localuser", "Remove-LocalUser -Name olduser", "删除本地用户", "会删除账号但不会自动删除用户目录；先备份数据。", True),
        ("perm", "new-localgroup", 'New-LocalGroup -Name "Developers"', "创建本地用户组", "创建后可用 Add-LocalGroupMember 把账号加入组。", False),
        ("perm", "remove-localgroup", 'Remove-LocalGroup -Name "Developers"', "删除本地用户组", "组内成员关系会一起移除；不可逆。", True),
        ("perm", "get-localgroupmember", 'Get-LocalGroupMember -Group "Administrators"', "查看组成员", "确认谁有管理员权限，排查权限过大或账号遗留。", False),
        ("perm", "remove-localgroupmember", 'Remove-LocalGroupMember -Group "Administrators" -Member student', "把成员移出用户组", "改权限前先确认账号名称，误删管理员可能锁死机器。", True),
        ("perm", "disable-localuser", "Disable-LocalUser -Name guest", "禁用本地账号", "保留账号和数据但禁止登录，比直接删除更安全。", False),
        ("perm", "enable-localuser", "Enable-LocalUser -Name student", "启用本地账号", "只对已存在的账号有效；启用前确认密码策略。", False),

        # 进程与系统
        ("proc", "stop-service", "Stop-Service -Name Spooler", "停止 Windows 服务", "停服务会影响依赖它的程序；先确认服务名和影响范围。", False),
        ("proc", "restart-service", "Restart-Service -Name Spooler", "重启 Windows 服务", "改完配置后让服务重新加载；重启前确认没有正在打印的任务。", False),
        ("proc", "set-service", "Set-Service -Name Spooler -StartupType Manual", "修改服务启动方式", "可设为 Automatic、Manual 或 Disabled；禁用系统服务前要谨慎。", False),
        ("proc", "suspend-service", "Suspend-Service -Name Spooler", "暂停服务", "只暂停不停止，部分服务不支持暂停；恢复用 Resume-Service。", False),
        ("proc", "resume-service", "Resume-Service -Name Spooler", "恢复已暂停的服务", "与 Suspend-Service 配对使用。", False),
        ("proc", "get-eventlog", "Get-EventLog -LogName System -Newest 20", "读取传统事件日志", "适合看 System / Application 日志；新系统更推荐 Get-WinEvent。", False),
        ("proc", "clear-eventlog", "Clear-EventLog -LogName Application", "清空事件日志", "会删除日志记录，排障期间不要清；生产环境先导出。", True),
        ("proc", "get-counter", "Get-Counter '\\Processor(_Total)\\% Processor Time' -SampleInterval 2", "采样性能计数器", "连续采样 CPU、内存、磁盘等指标，比任务管理器更适合留证。", False),
        ("proc", "get-cimclass", "Get-CimClass -ClassName Win32_Process", "查看 CIM 类结构", "写 WMI/CIM 查询前先看类有哪些属性和方法。", False),
        ("proc", "invoke-cimmethod", 'Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{CommandLine="notepad.exe"}', "通过 CIM 调用系统方法", "可远程创建进程或改配置；权限和参数都要先确认。", False),
        ("proc", "get-uptime", "(Get-Date) - (Get-CimInstance Win32_OperatingSystem).LastBootUpTime", "计算系统已运行多久", "排查意外重启或补丁后未重启时先看这个值。", False),
        ("proc", "set-date", "Set-Date -Adjust 01:00:00", "调整系统时间", "需要管理员权限；时间偏差会影响证书、日志和域认证。", False),
        ("proc", "start-job", "Start-Job -ScriptBlock { Get-Process }", "启动后台 PowerShell 作业", "作业在独立会话运行，用 Get-Job 查看、Receive-Job 取结果。", False),
        ("proc", "get-job", "Get-Job", "查看后台作业", "显示运行中、已完成和失败的作业；作业结束后仍会保留状态。", False),
        ("proc", "receive-job", "Receive-Job -Id 1", "取回后台作业输出", "默认取完会清空输出；需要保留时加 -Keep。", False),
        ("proc", "stop-job", "Stop-Job -Id 1", "停止后台作业", "只停作业，不影响系统进程；停完记得 Remove-Job 清理。", False),
        ("proc", "remove-job", "Remove-Job -Id 1", "删除作业记录", "作业必须先完成或停止；删除后输出不可再取。", False),
        ("proc", "wait-job", "Wait-Job -Id 1", "等待作业完成", "脚本里等待后台任务收敛，可加 -Timeout 防止一直卡住。", False),

        # 网络与远程
        ("net", "get-netipaddress", "Get-NetIPAddress -AddressFamily IPv4", "查看本机 IP 地址", "列出所有网卡的 IPv4 地址、前缀和接口索引。", False),
        ("net", "new-netipaddress", 'New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.1.20 -PrefixLength 24 -DefaultGateway 192.168.1.1', "给网卡配置静态 IP", "需要管理员权限；改错网关会直接断网，远程操作前准备回滚方式。", True),
        ("net", "remove-netipaddress", "Remove-NetIPAddress -IPAddress 192.168.1.20", "删除指定的 IP 配置", "会移除静态地址；确认没有其他服务依赖它。", True),
        ("net", "get-netipinterface", "Get-NetIPInterface -AddressFamily IPv4", "查看网卡 IP 接口状态", "确认 DHCP 是否启用、接口跃点和连接状态。", False),
        ("net", "set-netipinterface", 'Set-NetIPInterface -InterfaceAlias "Ethernet" -Dhcp Enabled', "切换网卡 DHCP 模式", "改成 DHCP 后静态地址会失效，远程机器慎用。", True),
        ("net", "get-nettcpconnection", "Get-NetTCPConnection -State Listen", "查看正在监听的 TCP 端口", "排查端口占用、服务是否启动；比 netstat 更结构化。", False),
        ("net", "get-netudpendpoint", "Get-NetUDPEndpoint -LocalPort 53", "查看 UDP 端口占用", "DNS、游戏和部分服务用 UDP，排查占用时别只看 TCP。", False),
        ("net", "get-netroute", 'Get-NetRoute -DestinationPrefix "0.0.0.0/0"', "查看默认路由", "确认流量走哪张网卡、下一跳是否合理。", False),
        ("net", "new-netroute", 'New-NetRoute -DestinationPrefix "10.0.0.0/24" -InterfaceIndex 12 -NextHop 192.168.1.1', "添加静态路由", "需要管理员权限；接口索引先用 Get-NetIPInterface 查。", True),
        ("net", "remove-netroute", 'Remove-NetRoute -DestinationPrefix "10.0.0.0/24"', "删除静态路由", "删除后相关网段可能立即失联。", True),
        ("net", "get-dnsclientcache", "Get-DnsClientCache", "查看 DNS 缓存", "域名解析异常时先看缓存里到底返回了什么。", False),
        ("net", "clear-dnsclientcache", "Clear-DnsClientCache", "清空 DNS 缓存", "改 DNS 或换网络后强制重新解析；不会影响系统其他配置。", False),
        ("net", "get-dnsclientserveraddress", "Get-DnsClientServerAddress -AddressFamily IPv4", "查看网卡 DNS 服务器", "确认 DNS 是否被 DHCP 或组策略改掉。", False),
        ("net", "set-dnsclientserveraddress", 'Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 8.8.8.8,1.1.1.1', "修改网卡 DNS", "需要管理员权限；改完可用 Clear-DnsClientCache 清缓存。", True),
        ("net", "get-netfirewallrule", 'Get-NetFirewallRule -DisplayName "*Remote Desktop*"', "查看防火墙规则", "按显示名筛规则，确认端口是否真的被放行。", False),
        ("net", "new-netfirewallrule", 'New-NetFirewallRule -DisplayName "Allow 8080" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow', "新建入站防火墙规则", "需要管理员权限；开放端口前确认只对必要网段生效。", True),
        ("net", "enable-netfirewallrule", 'Enable-NetFirewallRule -DisplayName "Allow 8080"', "启用防火墙规则", "规则存在但被禁用时使用。", False),
        ("net", "disable-netfirewallrule", 'Disable-NetFirewallRule -DisplayName "Allow 8080"', "禁用防火墙规则", "禁用后端口立即暴露，确认业务不再需要。", True),
        ("net", "remove-netfirewallrule", 'Remove-NetFirewallRule -DisplayName "Allow 8080"', "删除防火墙规则", "不可逆；删除前导出规则或记录配置。", True),
        ("net", "get-netadapterstatistics", "Get-NetAdapterStatistics", "查看网卡流量统计", "快速判断网卡是否在收发数据、有没有大量丢包。", False),
        ("net", "net-share", "net share", "查看共享文件夹", "cmd 的网络共享管理命令；创建共享需要管理员权限。", False),
        ("net", "net-use", "net use Z: \\\\server\\share", "映射网络驱动器", "把共享目录挂成盘符；断开用 net use Z: /delete。", False),
        ("net", "net-user", "net user student", "查看本地账号信息", "显示账号状态、上次登录和所属组；改密码用 net user 用户名 新密码。", False),
        ("net", "openfiles", "openfiles /query", "查看被占用的共享文件", "文件删不掉、提示被占用时，用它找出是哪个会话锁着。", False),

        # 开发与版本控制
        ("dev", "update-help", "Update-Help", "更新 PowerShell 帮助", "首次使用 Get-Help 没有详细说明时，先以管理员身份更新帮助。", False),
        ("dev", "get-module", "Get-Module -ListAvailable", "查看已安装模块", "确认某个命令来自哪个模块，排查版本冲突。", False),
        ("dev", "import-module", "Import-Module .\\MyModule.psm1", "导入 PowerShell 模块", "只影响当前会话；模块路径要写绝对或相对真实路径。", False),
        ("dev", "remove-module", "Remove-Module MyModule", "卸载当前会话模块", "卸载后模块命令立即不可用，重新 Import-Module 可恢复。", False),
        ("dev", "invoke-expression", 'Invoke-Expression "Get-Process"', "把字符串当命令执行", "方便但也危险，不要对不可信输入使用，容易被注入。", True),
        ("dev", "invoke-command", "Invoke-Command -ComputerName server01 -ScriptBlock { Get-Service }", "在远程机器执行命令", "需要 WinRM 和凭据；先 Test-WSMan 确认连通。", False),
        ("dev", "new-pssession", "New-PSSession -ComputerName server01", "建立持久远程会话", "会话可复用，适合连续执行多条远程命令；用完 Remove-PSSession。", False),
        ("dev", "enter-pssession", "Enter-PSSession -ComputerName server01", "进入交互式远程会话", "提示符会变成远程机器；退出用 Exit-PSSession。", False),
        ("dev", "exit-pssession", "Exit-PSSession", "退出交互式远程会话", "只断开当前会话，不会关闭远程机器。", False),
        ("dev", "get-pssession", "Get-PSSession", "查看远程会话", "确认是否有残留会话占用连接或许可证。", False),
        ("dev", "remove-pssession", "Remove-PSSession -Id 1", "关闭远程会话", "释放远程连接和资源；关闭后会话内状态丢失。", False),
        ("dev", "start-transcript", "Start-Transcript -Path .\\session.log", "记录当前终端会话", "把输入输出写入日志，排障或留证时很有用。", False),
        ("dev", "stop-transcript", "Stop-Transcript", "停止记录终端会话", "与 Start-Transcript 配对；忘记停止会一直追加日志。", False),
        ("dev", "get-psprovider", "Get-PSProvider", "查看 PowerShell 提供程序", "了解 FileSystem、Registry、Certificate 等不同路径类型。", False),
        ("dev", "get-formatdata", "Get-FormatData -TypeName System.Diagnostics.Process", "查看对象的显示格式", "自定义 Format-Table 列或写格式化文件前先看原始格式定义。", False),

        # 包管理与运行时
        ("pkg", "get-package", 'Get-Package -Name "*PowerShell*"', "查看已安装软件包", "PackageManagement 提供程序的统一查询入口，winget 之外可用。", False),
        ("pkg", "find-package", 'Find-Package -Name "openssh"', "搜索可用软件包", "先确认包名和提供程序，再执行安装。", False),
        ("pkg", "install-package", 'Install-Package -Name "openssh" -ProviderName NuGet', "安装软件包", "需要 NuGet 提供程序；安装前确认来源可信。", False),
        ("pkg", "uninstall-package", 'Uninstall-Package -Name "openssh"', "卸载软件包", "只卸载通过 PackageManagement 安装的包，不会清理所有残留。", False),
        ("pkg", "get-packagesource", "Get-PackageSource", "查看软件包源", "确认包来自哪个仓库，避免装到不明来源。", False),
        ("pkg", "register-packagesource", 'Register-PackageSource -Name MyRepo -Location https://example.com/nuget -ProviderName NuGet', "注册自定义包源", "只注册可信仓库；证书和网络代理要先配好。", False),
        ("pkg", "unregister-packagesource", "Unregister-PackageSource -Name MyRepo", "移除自定义包源", "移除后无法再从该源安装或更新。", False),
        ("pkg", "get-packageprovider", "Get-PackageProvider", "查看包提供程序", "NuGet、Chocolatey 等提供程序的状态会直接影响安装。", False),
        ("pkg", "install-packageprovider", "Install-PackageProvider -Name NuGet -Force", "安装包提供程序", "首次用 Install-Package 前通常要先装 NuGet。", False),
        ("pkg", "get-installedmodule", "Get-InstalledModule", "查看已安装的 PowerShell 模块", "只显示通过 PowerShellGet 安装的模块，和 Get-Module 口径不同。", False),
        ("pkg", "update-module", "Update-Module -Name Pester", "更新 PowerShell 模块", "更新后新会话才加载新版本；旧版本可能仍留在磁盘。", False),
        ("pkg", "uninstall-module", "Uninstall-Module -Name Pester", "卸载 PowerShell 模块", "确认没有脚本依赖它；卸载后相关命令立即消失。", False),
        ("pkg", "msiexec", "msiexec /i app.msi /qn", "静默安装 MSI 包", "/qn 不显示界面，适合自动化；安装包来源必须可信。", False),

        # 磁盘与归档
        ("disk", "get-physicaldisk", "Get-PhysicalDisk", "查看物理磁盘", "显示磁盘型号、介质类型和健康状态，排查磁盘异常先看这里。", False),
        ("disk", "get-virtualdisk", "Get-VirtualDisk", "查看虚拟磁盘", "存储池或 Storage Spaces 环境里确认虚拟盘状态。", False),
        ("disk", "get-storagepool", "Get-StoragePool", "查看存储池", "确认池是否健康、剩余容量和成员磁盘。", False),
        ("disk", "new-partition", "New-Partition -DiskNumber 1 -UseMaximumSize -DriveLetter D", "在磁盘上新建分区", "会改变分区表；操作前确认磁盘编号，别选错系统盘。", True),
        ("disk", "resize-partition", "Resize-Partition -DriveLetter C -Size 100GB", "调整分区大小", "缩小分区受文件系统和相邻空间限制，先备份。", True),
        ("disk", "set-partition", "Set-Partition -DriveLetter D -NewDriveLetter E", "修改分区盘符", "盘符变化会让依赖旧路径的脚本失效。", False),
        ("disk", "remove-partition", "Remove-Partition -DriveLetter D", "删除分区", "分区数据会丢失，执行前必须确认盘符和备份。", True),
        ("disk", "initialize-disk", "Initialize-Disk -Number 1 -PartitionStyle GPT", "初始化新磁盘", "会写入分区表；只对没有数据的新盘执行。", True),
        ("disk", "clear-disk", "Clear-Disk -Number 1 -RemoveData", "清空磁盘数据", "不可逆，务必先确认磁盘编号。", True),
        ("disk", "optimize-volume", "Optimize-Volume -DriveLetter C -Defrag", "优化卷性能", "机械盘做碎片整理，SSD 应使用 -ReTrim 而不是频繁 defrag。", False),
        ("disk", "repair-volume", "Repair-Volume -DriveLetter C -Scan", "扫描并修复卷错误", "先 Scan 再决定是否 Fix；修复前备份重要数据。", False),
        ("disk", "mount-diskimage", "Mount-DiskImage -ImagePath C:\\iso\\ubuntu.iso", "挂载 ISO 镜像", "挂载后会多出一个盘符；用完 Dismount-DiskImage。", False),
        ("disk", "dismount-diskimage", "Dismount-DiskImage -ImagePath C:\\iso\\ubuntu.iso", "卸载 ISO 镜像", "先关闭镜像里打开的文件，否则可能卸载失败。", False),
        ("disk", "get-diskimage", "Get-DiskImage -ImagePath C:\\iso\\ubuntu.iso", "查看镜像挂载状态", "确认 ISO 是否已挂载、挂到哪个盘符。", False),
        ("disk", "defrag", "defrag C: /O", "按介质类型优化磁盘", "/O 让系统自动选择合适操作；不要对 SSD 频繁做传统碎片整理。", False),
        ("disk", "fsutil", "fsutil volume diskfree C:", "查看卷的剩余空间", "比资源管理器更细，能看到可用字节和簇信息。", False),
        ("disk", "mountvol", "mountvol C: /L", "查看卷的挂载路径", "排查盘符丢失或卷挂载异常时使用。", False),

        # 安全与加密
        ("sec", "get-executionpolicy", "Get-ExecutionPolicy -List", "查看脚本执行策略", "按作用域列出策略，确认脚本为什么被阻止。", False),
        ("sec", "set-executionpolicy", "Set-ExecutionPolicy -Scope CurrentUser RemoteSigned", "修改脚本执行策略", "只改当前用户作用域，避免影响整台机器；改前确认脚本来源。", True),
        ("sec", "get-authenticode-signature", "Get-AuthenticodeSignature .\\installer.exe", "验证文件数字签名", "确认安装包是否被篡改、签名者是谁。", False),
        ("sec", "set-authenticode-signature", "Set-AuthenticodeSignature .\\script.ps1 -Certificate $cert", "给脚本或文件签名", "需要代码签名证书；签名后仍要验证时间戳。", False),
        ("sec", "get-credential", "Get-Credential", "弹出凭据输入框", "安全地收集用户名和密码，不要把明文密码写进脚本。", False),
        ("sec", "convertfrom-securestring", "ConvertFrom-SecureString $secure", "把安全字符串转成可存储文本", "输出仍是加密文本，但可能被同用户解密；不要写入公开仓库。", True),
        ("sec", "protect-cmsmessage", 'Protect-CmsMessage -To "user@example.com" -Content "secret"', "用证书加密消息", "需要收件人证书；没有私钥无法解密。", False),
        ("sec", "unprotect-cmsmessage", "Unprotect-CmsMessage -Path .\\message.txt", "解密 CMS 消息", "需要对应私钥；解密后注意终端历史泄露。", False),
        ("sec", "get-cmsmessage", "Get-CmsMessage -Path .\\message.txt", "查看 CMS 消息结构", "只读取信封信息，不会解密正文。", False),
        ("sec", "certutil", "certutil -hashfile .\\setup.exe SHA256", "计算文件哈希或管理证书", "Windows 自带，既能校验下载文件，也能管理证书存储。", False),
        ("sec", "cmdkey", "cmdkey /list", "查看保存的 Windows 凭据", "确认是否残留旧账号；删除用 cmdkey /delete:目标。", False),
        ("sec", "klist", "klist", "查看 Kerberos 票据", "域环境认证失败时，先看票据是否存在或过期。", False),
        ("sec", "gpresult", "gpresult /r", "查看组策略应用结果", "确认某条策略是否真的下发，排障域环境必备。", False),
        ("sec", "gpupdate", "gpupdate /force", "强制刷新组策略", "改完策略立即生效；刷新期间可能短暂影响登录脚本。", False),
        ("sec", "secedit", "secedit /export /cfg secpol.inf", "导出本地安全策略", "留档或对比两台机器安全配置时使用。", False),

        # 容器与云
        ("container", "kubectl", "kubectl get pods -A", "查看 Kubernetes 所有 Pod", "集群排障第一步；确认命名空间和上下文再用。", False),
        ("container", "helm", "helm list -A", "查看 Helm 发布", "确认 chart 版本和命名空间；升级前先看 values。", False),
        ("container", "minikube", "minikube start", "启动本地 Kubernetes", "适合学习和测试；会占用较多内存和磁盘。", False),
        ("container", "kind", "kind create cluster --name dev", "创建 kind 测试集群", "集群跑在 Docker 容器里，用完 kind delete cluster 清理。", False),
        ("container", "terraform", "terraform plan", "预览基础设施变更", "先 plan 再 apply；确认 provider 和远端 state 没配错。", False),
        ("container", "wrangler", "wrangler deploy", "部署 Cloudflare Worker", "部署前确认账户和路由；生产环境先看 dry-run 输出。", False),
        ("container", "aws", "aws s3 ls", "列出 S3 存储桶", "需要配置凭据和区域；不要用长期高权限密钥。", False),
        ("container", "gcloud", "gcloud config list", "查看 Google Cloud 配置", "确认当前账号、项目和区域，避免改错环境。", False),
        ("container", "az", "az account show", "查看 Azure 当前账号", "多订阅环境里先确认订阅 ID 再执行变更。", False),
        ("container", "docker-buildx", "docker buildx build -t app:latest .", "用 Buildx 构建多架构镜像", "需要先创建 builder；构建前确认 Dockerfile 路径。", False),

        # 多媒体与文档
        ("media", "ffprobe", "ffprobe -show_streams video.mp4", "查看视频流信息", "确认编码、分辨率、帧率和音轨，转码前先查。", False),
        ("media", "exiftool", "exiftool photo.jpg", "读取图片元数据", "查看拍摄时间、GPS 和相机参数；写入前先备份原图。", False),
        ("media", "pdftotext", "pdftotext report.pdf report.txt", "把 PDF 转成文本", "扫描版 PDF 没有文字层，需要先 OCR。", False),
        ("media", "pdfinfo", "pdfinfo report.pdf", "查看 PDF 页数和元数据", "确认页数、页面尺寸和加密状态。", False),

        # 平台专属
        ("os", "remove-itemproperty", "Remove-ItemProperty -Path HKCU:\\Software\\MyApp -Name Setting", "删除注册表值", "会改变应用配置，删除前导出注册表项。", True),
        ("os", "clear-itemproperty", "Clear-ItemProperty -Path HKCU:\\Software\\MyApp -Name Setting", "清空注册表值", "保留键但清掉内容，和 Remove-ItemProperty 不同。", False),
        ("os", "write-eventlog", 'Write-EventLog -LogName Application -Source MyApp -EventId 1000 -Message "Started"', "写入事件日志", "自定义应用日志需要先注册事件源。", False),
        ("os", "new-winevent", 'New-WinEvent -ProviderName MyApp -Id 1000 -Payload "Started"', "写入现代事件日志", "适合 ETW 提供程序；事件源必须已注册。", False),
        ("os", "unregister-scheduledtask", "Unregister-ScheduledTask -TaskName Backup -Confirm:$false", "删除计划任务", "任务会立即移除，确认没有其他脚本依赖。", True),
        ("os", "disable-scheduledtask", "Disable-ScheduledTask -TaskName Backup", "禁用计划任务", "保留任务定义但不再触发，适合临时停用。", False),
        ("os", "enable-scheduledtask", "Enable-ScheduledTask -TaskName Backup", "启用计划任务", "恢复后按原触发器运行。", False),
        ("os", "start-scheduledtask", "Start-ScheduledTask -TaskName Backup", "立即运行计划任务", "不等触发器，手动验证任务是否正常。", False),
        ("os", "stop-scheduledtask", "Stop-ScheduledTask -TaskName Backup", "停止正在运行的计划任务", "只停当前实例，不会禁用任务。", False),
        ("os", "get-scheduledtaskinfo", "Get-ScheduledTaskInfo -TaskName Backup", "查看计划任务运行结果", "确认上次运行时间、结果代码和下次运行时间。", False),
        ("os", "set-scheduledtask", 'Set-ScheduledTask -TaskName Backup -Description "Daily backup"', "修改计划任务属性", "只改描述不会改触发器；改动作要用 -Action。", False),
        ("os", "get-appxpackage", 'Get-AppxPackage -Name "*Store*"', "查看已安装的 Store 应用", "排查应用残留或版本冲突时使用。", False),
            ("os", "add-appxpackage", "Add-AppxPackage .\\app.msix", "安装 MSIX 应用包", "需要可信签名；开发包要先开启旁加载。", False),
        ("os", "remove-appxpackage", "Remove-AppxPackage Microsoft.Store_1.0_x64__8wekyb3d8bbwe", "卸载 Store 应用", "包名必须完整；系统关键应用不要随意卸载。", True),
        ("os", "get-windowsoptionalfeature", "Get-WindowsOptionalFeature -Online -FeatureName Hyper-V", "查看 Windows 可选功能", "确认 Hyper-V、WSL 等功能是否已启用。", False),
        ("os", "enable-windowsoptionalfeature", "Enable-WindowsOptionalFeature -Online -FeatureName Hyper-V -All", "启用 Windows 功能", "通常需要重启；远程机器启用前确认不会断网。", True),
        ("os", "disable-windowsoptionalfeature", "Disable-WindowsOptionalFeature -Online -FeatureName Hyper-V", "禁用 Windows 功能", "可能影响依赖该功能的虚拟机和容器。", True),
        ("os", "powercfg", "powercfg /batteryreport", "生成电池健康报告", "输出 HTML 报告，查看设计容量和实际容量差异。", False),
        ("os", "slmgr", "slmgr /dlv", "查看 Windows 激活详情", "显示许可证状态、到期时间和激活渠道。", False),
        ("os", "msinfo32", "msinfo32", "打开系统信息面板", "查看硬件、驱动和系统组件，图形界面便于导出。", False),
        ("os", "dxdiag", "dxdiag", "打开 DirectX 诊断工具", "排查显卡、声卡和游戏兼容性问题。", False),
        ("os", "taskmgr", "taskmgr", "打开任务管理器", "图形化查看进程、启动项和性能。", False),
        ("os", "eventvwr", "eventvwr", "打开事件查看器", "图形化筛选系统日志，比命令行更直观。", False),
        ("os", "regedit", "regedit", "打开注册表编辑器", "修改注册表有风险，操作前先导出备份。", True),

        # 别名
        ("alias", "gci", "gci .", "Get-ChildItem 的短别名", "交互式列目录很快；脚本里建议写完整命令，便于阅读。", False),
        ("alias", "gc", "gc .\\app.log", "Get-Content 的短别名", "读取文本文件；大文件加 -Tail 只看最后几行。", False),
        ("alias", "gps", "gps -Name java", "Get-Process 的短别名", "按进程名筛 Java 进程，确认 PID 后再操作。", False),
        ("alias", "gsv", "gsv -Name Spooler", "Get-Service 的短别名", "查看服务状态；启动服务用 sasv。", False),
        ("alias", "sasv", "sasv -Name Spooler", "Start-Service 的短别名", "需要管理员权限；服务名要写准确。", False),
        ("alias", "spsv", "spsv -Name Spooler", "Stop-Service 的短别名", "停服务会影响依赖程序，确认后再执行。", False),
        ("alias", "sl", "sl C:\\Projects", "Set-Location 的短别名", "切换当前目录；和 Linux 的 sl 不是同一个命令。", False),
        ("alias", "gl", "gl", "Get-Location 的短别名", "确认当前目录，脚本排障第一步。", False),
        ("alias", "ft", "ft Name,CPU", "Format-Table 的短别名", "快速把对象按列显示；字段多时改 fl。", False),
        ("alias", "fl", "fl *", "Format-List 的短别名", "展开对象全部字段，适合查看完整属性。", False),
        ("alias", "gm", "gm -Name Length", "Get-Member 的短别名", "查看对象属性或方法；不知道返回结构时先用它。", False),
        ("alias", "h", "h Get-Process", "Get-Help 的短别名", "查看命令帮助；加 -Examples 看示例更快。", False),

        # 其他
        ("other", "get-random", "Get-Random -Minimum 1 -Maximum 100", "生成随机数", "做测试数据或抽样时使用；密码场景不要用它代替加密随机源。", False),
        ("other", "measure-command", "Measure-Command { Get-ChildItem -Recurse }", "测量命令耗时", "比较两种写法或排查慢脚本时，比手掐秒表可靠。", False),
        ("other", "out-gridview", "Get-Process | Out-GridView", "把结果弹到表格窗口", "适合人工筛选和排序；不能在无桌面环境使用。", False),
        ("other", "show-command", "Show-Command Get-Process", "用图形面板填命令参数", "不熟悉参数时可视化拼接，生成后仍要检查。", False),
        ("other", "get-verb", "Get-Verb", "查看 PowerShell 允许的动词", "写函数或模块时遵守 Verb-Noun 命名规范。", False),
        ("other", "resmon", "resmon", "打开资源监视器", "查看 CPU、磁盘、网络和句柄占用，比任务管理器更细。", False),
        ("other", "perfmon", "perfmon", "打开性能监视器", "配置数据收集器集，适合长期采样和留证。", False),
        ("other", "diskmgmt", "diskmgmt.msc", "打开磁盘管理", "图形化分区、改盘符和初始化磁盘。", False),
        ("other", "devmgmt", "devmgmt.msc", "打开设备管理器", "排查驱动异常和未知设备。", False),
        ("other", "services", "services.msc", "打开服务管理面板", "图形化启停服务，适合不熟悉服务名时查找。", False),
        ("other", "snippingtool", "snippingtool", "打开截图工具", "截取屏幕区域并标注，比 PrintScreen 更灵活。", False),
        ("other", "charmap", "charmap", "打开字符映射表", "查找特殊符号并复制到文档里。", False),
    ],

    "linux": [
        # 基础与导航
        ("nav", "history", "history 20", "查看最近命令历史", "快速找回上一条复杂命令；历史里可能含敏感参数，分享前先检查。", False),
        ("nav", "declare", "declare -p PATH", "查看变量属性和值", "bash 内建，能区分普通变量、数组和只读变量。", False),
        ("nav", "local", 'local name="value"', "声明函数内局部变量", "只在函数内部有效，避免污染全局环境；必须在函数里使用。", False),
        ("nav", "readonly", "readonly PI=3.14", "把变量设为只读", "设置后当前 shell 不能修改，适合固定配置项。", False),
        ("nav", "mapfile", "mapfile -t lines < file.txt", "把文件按行读入数组", "-t 去掉换行符，之后可用 ${lines[0]} 逐行处理。", False),
        ("nav", "shopt", "shopt -s globstar", "打开 bash 可选行为", "例如 globstar 让 ** 递归匹配；写进 ~/.bashrc 才能长期生效。", False),
        ("nav", "exec", "exec bash", "用新命令替换当前 shell", "成功时不会返回；写错命令可能直接退出当前终端。", False),
        ("nav", "getopts", 'getopts "hv" opt', "解析脚本短选项", "在 shell 脚本里循环处理 -h、-v 等参数；长选项需另行处理。", False),
        ("nav", "wait", "wait", "等待后台任务结束", "不带参数等待当前 shell 的全部子进程，脚本收尾时常用。", False),
        ("nav", "shift", "shift 2", "左移脚本参数", "把 $3 变成 $1，处理完一组参数后继续解析。", False),
        ("nav", "time", "time ls -la", "统计命令耗时", "输出真实时间、用户 CPU 和系统 CPU，快速比较命令开销。", False),
        ("nav", "builtin", "builtin cd /tmp", "强制调用 shell 内建", "同名函数或别名覆盖了内建命令时，用 builtin 绕过。", False),
        ("nav", "enable", "enable -n cd", "启用或禁用 shell 内建", "调试别名冲突时临时禁用内建；恢复用 enable cd。", False),

        # 文件与目录
        ("file", "dirname", "dirname /etc/nginx/nginx.conf", "取路径的目录部分", "和 basename 配对，脚本里拆分路径时使用。", False),
        ("file", "realpath", "realpath ./src/main.c", "解析文件的真实绝对路径", "会展开符号链接，确认脚本到底读的是哪个文件。", False),
        ("file", "stat", "stat /etc/hosts", "查看文件详细元数据", "显示 inode、权限、大小和三个时间戳，比 ls -l 更完整。", False),
        ("file", "mktemp", "mktemp -d", "创建临时目录", "-d 建目录，默认在 /tmp 下；脚本结束后记得清理。", False),
        ("file", "rename-files", "rename 's/.bak$//' *.bak", "批量重命名文件", "不同发行版的 rename 实现不同；执行前先用 -n 或 echo 预览。", False),
        ("file", "sync", "sync", "把缓存刷写到磁盘", "关机前或拔盘前执行，减少数据丢失风险。", False),

        # 查看与文本
        ("view", "cmp", "cmp file1 file2", "逐字节比较两个文件", "只报告第一处差异，适合确认文件是否完全一致。", False),
        ("view", "comm", "comm -12 a.txt b.txt", "比较两个已排序文件", "-12 只显示共同行；输入必须先排序。", False),
        ("view", "csplit", "csplit app.log '/ERROR/' '{*}'", "按模式拆分文件", "按匹配行切成多段，适合拆分大日志。", False),
        ("view", "expand", "expand tabs.txt", "把制表符转成空格", "统一缩进格式，避免不同编辑器显示错位。", False),
        ("view", "fold", "fold -w 80 README.md", "按宽度折行", "只改变显示，不改变原文件；适合终端阅读长行。", False),
        ("view", "look", "look prefix words.txt", "按前缀查找行", "只对已排序文本有效，查字典或词表很快。", False),
        ("view", "nl", "nl -ba app.log", "给文件加行号", "比 cat -n 更可控，可指定起始行和格式。", False),
        ("view", "od", "od -An -tx1 file.bin", "以八进制或十六进制查看二进制", "排查文件头、编码和不可见字符时使用。", False),
        ("view", "rev", "rev words.txt", "逐行反转字符", "检查回文或从右往左处理文本时有用。", False),
        ("view", "shuf", "shuf -n 5 names.txt", "随机抽取若干行", "做抽样或随机分组；不要用于安全随机。", False),
        ("view", "split", "split -l 1000 big.log part_", "把大文件按行拆分", "生成 part_aa、part_ab 等分片，便于传输和处理。", False),
        ("view", "strings", "strings binary | grep http", "从二进制里提取可打印字符串", "排查二进制内嵌路径、URL 或错误信息。", False),
        ("view", "tr", "tr '[:lower:]' '[:upper:]'", "替换或删除字符", "按字符转换，不是按单词；处理编码时注意 locale。", False),
        ("view", "xargs", "find . -name '*.log' | xargs rm", "把输入变成命令参数", "文件名含空格时用 -0 配合 find -print0，删除前先 echo 预览。", True),
        ("view", "xxd", "xxd -l 32 file.bin", "查看文件前 32 字节", "比 od 更直观，适合看文件头和魔数。", False),
        ("view", "zcat", "zcat app.log.gz", "不解压直接查看 gzip 文本", "大压缩日志先 zcat | grep，不用先解压占磁盘。", False),

        # 权限与账号
        ("perm", "getfacl", "getfacl /etc/hosts", "查看 ACL 权限", "普通 ls 看不到 ACL，排查“为什么他能读我不能”时用。", False),
        ("perm", "visudo", "visudo", "安全编辑 sudoers", "会做语法检查，避免写坏 sudo 配置把管理员锁死。", True),
        ("perm", "newgrp", "newgrp developers", "切换当前用户组", "只影响当前 shell；退出后恢复原组。", False),
        ("perm", "groups", "groups", "查看当前用户所属组", "确认是否在 docker、sudo 等关键组里。", False),
        ("perm", "id", "id", "查看 UID、GID 和组", "排查权限问题时比 whoami 信息更全。", False),
        ("perm", "last", "last -n 10", "查看最近登录记录", "确认谁在什么时候登录过；异常登录要结合日志排查。", False),
        ("perm", "lastb", "lastb -n 10", "查看失败登录记录", "需要 root 读取；暴力破解排查先看这里。", False),
        ("perm", "chsh", "chsh -s /bin/bash", "修改登录 Shell", "目标 Shell 必须在 /etc/shells 中；下次登录生效。", False),

        # 进程与系统
        ("proc", "free", "free -h", "查看内存使用", "-h 用人类可读单位，重点看 available 而不是 free。", False),
        ("proc", "vmstat", "vmstat 1 5", "采样系统整体状态", "每秒一次共五次，观察 CPU、内存、交换和 IO 等待。", False),
        ("proc", "mpstat", "mpstat 1 5", "按 CPU 核采样", "多核机器排查单核打满时比 top 更清楚。", False),
        ("proc", "pidstat", "pidstat 1 5", "按进程采样资源", "定位哪个进程在持续吃 CPU、内存或磁盘。", False),
        ("proc", "sar", "sar -u 1 5", "查看历史或实时性能", "sysstat 工具，适合复盘过去某时间段的负载。", False),
        ("proc", "systemd-cgtop", "systemd-cgtop", "按 cgroup 查看资源占用", "定位是哪个服务或容器在吃资源。", False),
        ("proc", "systemd-cgls", "systemd-cgls", "查看 cgroup 进程树", "确认某个服务下挂了哪些进程。", False),
        ("proc", "systemd-detect-virt", "systemd-detect-virt", "判断当前虚拟化环境", "输出 kvm、docker、none 等，排查性能问题先确认环境。", False),
        ("proc", "systemd-escape", "systemd-escape --path /var/lib/app", "把路径转成 unit 名", "写 systemd unit 或查日志时，路径需要转义。", False),
        ("proc", "systemd-tmpfiles", "systemd-tmpfiles --clean", "按规则清理临时文件", "按 tmpfiles.d 配置清理，不要手工 rm 系统临时目录。", False),
        ("proc", "systemd-creds", "systemd-creds list", "管理系统凭据", "查看加密凭据是否可用；需要 TPM 或主机密钥。", False),
        ("proc", "systemd-path", "systemd-path", "查看 systemd 标准路径", "确认日志、配置和运行时目录的实际位置。", False),
        ("proc", "systemd-id128", "systemd-id128 show", "生成或查看 128 位 ID", "给 unit、分区或应用生成稳定标识。", False),
        ("proc", "systemd-notify", "systemd-notify --ready", "向 systemd 报告服务就绪", "写 Type=notify 服务时，启动完成后调用。", False),
        ("proc", "systemd-socket-activate", "systemd-socket-activate -l 8080 ./server", "测试套接字激活", "不写 unit 也能模拟 systemd 的按需启动。", False),
        ("proc", "systemd-mount", "systemd-mount /dev/sdb1 /mnt/usb", "按 systemd 方式挂载设备", "会生成临时 mount unit；卸载用 systemd-umount。", False),
        ("proc", "systemd-umount", "systemd-umount /mnt/usb", "卸载 systemd 挂载", "先确认没有进程占用挂载点。", False),
        ("proc", "watch", "watch -n 2 'df -h'", "每两秒重复执行命令", "观察磁盘、进程或日志变化；退出按 Ctrl-C。", False),
        ("proc", "timeout", "timeout 10 curl https://example.com", "给命令加超时", "防止脚本卡在无响应的网络请求。", False),
        ("proc", "stdbuf", "stdbuf -oL tail -f app.log", "调整命令缓冲方式", "让管道里的输出实时刷新，排查日志延迟时用。", False),

        # 网络与远程
        ("net", "bridge", "bridge link", "查看网桥与接口", "虚拟化和容器网络排查先看网桥挂载关系。", False),
        ("net", "tc", "tc qdisc show", "查看流量控制规则", "排查限速、丢包和队列规则；修改规则会影响全网流量。", False),
        ("net", "conntrack", "conntrack -L", "查看连接跟踪表", "NAT 和防火墙排障时确认连接状态。", False),
        ("net", "iptables-save", "iptables-save > rules.v4", "导出当前防火墙规则", "改规则前先留档；恢复用 iptables-restore。", False),
        ("net", "iptables-restore", "iptables-restore < rules.v4", "从文件恢复防火墙规则", "会覆盖当前规则，远程操作前确认不会把自己挡在外面。", True),
        ("net", "ip6tables", "ip6tables -L", "查看 IPv6 防火墙规则", "IPv6 常被忽略，安全排查要单独看。", False),
        ("net", "ebtables", "ebtables -L", "查看二层防火墙规则", "网桥和 MAC 层过滤使用；不要和 iptables 混淆。", False),
        ("net", "arptables", "arptables -L", "查看 ARP 过滤规则", "排查 ARP 欺骗或二层访问控制。", False),
        ("net", "iw", "iw dev", "查看无线网卡", "列出无线接口和模式，比 iwconfig 更现代。", False),
        ("net", "nmtui", "nmtui", "打开网络管理文本界面", "无桌面环境里改网络连接，比手写配置不容易错。", False),
        ("net", "networkctl", "networkctl status", "查看 systemd-networkd 状态", "确认网卡是否被 networkd 接管、地址是否拿到。", False),
        ("net", "getent", "getent hosts example.com", "按系统数据库解析名称", "会走 NSS，能验证 DNS、LDAP 等实际解析结果。", False),
        ("net", "socat", "socat TCP-LISTEN:8080,fork EXEC:./server", "在端口和进程之间转发", "调试服务或临时暴露端口；公网使用前加访问控制。", False),
        ("net", "mtr", "mtr -n example.com", "持续探测网络路径", "结合 ping 和 traceroute，观察每跳丢包和延迟。", False),
        ("net", "tracepath", "tracepath example.com", "探测路径 MTU", "排查能 ping 通但大包传不过去的问题。", False),

        # 开发与版本控制
        ("dev", "gdb", "gdb ./app", "调试本地可执行文件", "需要编译时加 -g；先看 backtrace 再下断点。", False),
        ("dev", "lldb", "lldb ./app", "用 LLDB 调试程序", "Clang 工具链常用；命令与 gdb 类似但不完全相同。", False),
        ("dev", "valgrind", "valgrind --leak-check=full ./app", "检查内存泄漏", "程序会明显变慢，适合测试环境而不是生产。", False),
        ("dev", "strace", "strace -f -o trace.log ./app", "跟踪系统调用", "定位文件、网络和权限问题时非常直接。", False),
        ("dev", "ltrace", "ltrace ./app", "跟踪库函数调用", "看程序调用了哪些库函数；对静态链接程序无效。", False),
        ("dev", "perf", "perf stat ./app", "统计性能事件", "查看指令数、缓存命中、上下文切换等硬件指标。", False),
        ("dev", "objdump", "objdump -d ./app", "反汇编可执行文件", "排查崩溃地址或确认编译产物。", False),
        ("dev", "readelf", "readelf -h ./app", "查看 ELF 文件头", "确认架构、入口地址和动态链接信息。", False),
        ("dev", "nm", "nm -C ./app", "列出符号表", "查函数是否被内联或优化掉；-C 展开 C++ 名称。", False),
        ("dev", "ldd", "ldd ./app", "查看动态库依赖", "确认运行时缺哪个库；不要对不可信二进制直接执行。", False),
        ("dev", "pkg-config", "pkg-config --cflags openssl", "查询编译参数", "编译第三方库时拿 include 和 link 参数。", False),
        ("dev", "make", "make -j8", "按 Makefile 构建", "-j8 并行编译；先确认 CPU 核心数和依赖。", False),
        ("dev", "ninja", "ninja", "执行 Ninja 构建", "通常由 CMake 或 Meson 生成 build.ninja。", False),
        ("dev", "meson", "meson setup build", "配置 Meson 构建目录", "生成 Ninja 文件，之后在 build 目录执行 ninja。", False),

        # 包管理与运行时
        ("pkg", "snap", "snap list", "查看 Snap 包", "Ubuntu 常用；安装用 sudo snap install 包名。", False),
        ("pkg", "pip", "pip install requests", "安装 Python 包", "优先在虚拟环境里安装，避免污染系统 Python。", False),
        ("pkg", "pip3", "pip3 install -r requirements.txt", "按依赖文件安装", "确认 requirements 来源可信；生产环境锁定版本。", False),
        ("pkg", "pipx", "pipx install black", "安装独立 Python 命令行工具", "每个工具独立虚拟环境，不污染全局包。", False),
        ("pkg", "npm", "npm install", "安装 Node.js 依赖", "在项目目录执行；全局安装用 npm install -g。", False),
        ("pkg", "yarn", "yarn install", "按 lockfile 安装依赖", "团队项目优先用 yarn.lock，避免版本漂移。", False),
        ("pkg", "pnpm", "pnpm install", "用 pnpm 安装依赖", "节省磁盘并严格隔离依赖；CI 里可用 --frozen-lockfile。", False),
        ("pkg", "gem", "gem install rails", "安装 Ruby Gem", "系统级安装可能需要 sudo；推荐用 rbenv 或 bundler 隔离。", False),
        ("pkg", "bundle", "bundle install", "安装 Ruby 项目依赖", "读取 Gemfile 和 Gemfile.lock，确保版本一致。", False),
        ("pkg", "composer", "composer install", "安装 PHP 项目依赖", "生产环境用 --no-dev，并确认 composer.lock 已提交。", False),
        ("pkg", "rustup", "rustup update", "更新 Rust 工具链", "同时管理 stable、beta、nightly 多个通道。", False),
        ("pkg", "go", "go install golang.org/x/tools/gopls@latest", "安装 Go 工具", "二进制会进 GOPATH/bin，确认 PATH 已包含。", False),

        # 磁盘与归档
        ("disk", "swapon", "swapon --show", "查看交换分区", "确认 swap 是否启用、大小和优先级。", False),
        ("disk", "swapoff", "swapoff /swapfile", "关闭交换文件", "内存不足时关闭 swap 可能触发 OOM。", True),
        ("disk", "mkswap", "mkswap /swapfile", "把文件格式化为交换区", "会覆盖目标文件内容，确认路径后再执行。", True),
        ("disk", "fsck", "fsck /dev/sdb1", "检查文件系统", "最好在卸载状态下执行；对挂载中的根分区操作有风险。", True),
        ("disk", "e2fsck", "e2fsck -f /dev/sdb1", "强制检查 ext 文件系统", "先 umount；修复前备份重要数据。", True),
        ("disk", "resize2fs", "resize2fs /dev/sdb1", "调整 ext 文件系统大小", "通常先扩分区再扩文件系统；缩小需要先缩文件系统。", False),
        ("disk", "xfs_repair", "xfs_repair /dev/sdb1", "修复 XFS 文件系统", "必须卸载后执行；修复前先备份。", True),
        ("disk", "smartctl", "smartctl -a /dev/sda", "查看磁盘 SMART 健康", "确认重映射扇区、通电时间和温度，提前发现坏盘。", False),
        ("disk", "hdparm", "hdparm -I /dev/sda", "查看磁盘参数", "确认传输模式、缓存和电源管理；改参数前先记录原值。", False),
        ("disk", "nvme", "nvme list", "列出 NVMe 设备", "查看 NVMe 盘容量、型号和命名空间。", False),
        ("disk", "gdisk", "gdisk /dev/sdb", "编辑 GPT 分区表", "交互式操作，写盘前确认设备名；误选系统盘会丢数据。", True),
        ("disk", "sgdisk", "sgdisk -p /dev/sdb", "查看 GPT 分区信息", "只读打印分区表，适合脚本解析。", False),

        # 安全与加密
        ("sec", "certbot", "certbot renew --dry-run", "测试证书续期", "不实际续期，只验证配置和账户是否可用。", False),
        ("sec", "fail2ban-client", "fail2ban-client status", "查看 fail2ban 状态", "确认哪些 jail 启用、封了多少 IP。", False),
        ("sec", "lynis", "lynis audit system", "做系统安全审计", "输出加固建议；先读报告再改配置。", False),
        ("sec", "chkrootkit", "chkrootkit", "检查常见 rootkit", "结果可能有误报，需结合文件完整性和日志判断。", False),
        ("sec", "rkhunter", "rkhunter --check", "检查 rootkit 与可疑文件", "首次运行需更新数据库；告警要逐条核实。", False),
        ("sec", "auditctl", "auditctl -l", "查看审计规则", "确认关键文件和系统调用是否被审计。", False),
        ("sec", "ausearch", "ausearch -m avc -ts recent", "搜索审计日志", "SELinux 拒绝时先查 AVC 记录。", False),
        ("sec", "aureport", "aureport --summary", "汇总审计事件", "快速看登录、失败和异常事件的数量。", False),
        ("sec", "pass", "pass show github", "读取密码库条目", "需要 GPG 私钥；不要把输出留在终端历史。", False),
        ("sec", "trivy", "trivy fs .", "扫描依赖和文件漏洞", "CI 里可加 --exit-code 1 阻止高危漏洞合入。", False),

        # 容器与云
        ("container", "kubectl", "kubectl get pods -A", "查看 Kubernetes Pod", "排查集群服务状态；确认 context 再操作。", False),
        ("container", "helm", "helm list -A", "查看 Helm 发布", "确认 chart 版本和命名空间。", False),
        ("container", "kustomize", "kustomize build overlays/prod", "渲染 Kustomize 清单", "部署前先看渲染结果，避免环境变量覆盖错误。", False),
        ("container", "kind", "kind create cluster --name dev", "创建 kind 测试集群", "本地验证 Kubernetes 清单，用完删除集群。", False),
        ("container", "minikube", "minikube start", "启动本地 Kubernetes", "学习或测试用；需要虚拟化或容器运行时。", False),
        ("container", "k3d", "k3d cluster create dev", "创建 k3d 集群", "轻量多节点测试；注意端口和资源占用。", False),
        ("container", "buildah", "buildah bud -t app .", "不用守护进程构建镜像", "适合无 Docker daemon 的环境；构建后可用 podman 运行。", False),
        ("container", "skopeo", "skopeo inspect docker://nginx:latest", "远程查看镜像元数据", "不用拉取整个镜像就能看标签和架构。", False),
        ("container", "nerdctl", "nerdctl ps", "查看 containerd 容器", "命令风格接近 docker，但后端是 containerd。", False),
        ("container", "crictl", "crictl ps", "查看 CRI 容器", "Kubernetes 节点排障常用；需要配置 runtime endpoint。", False),
        ("container", "docker-buildx", "docker buildx build -t app .", "构建多架构镜像", "先创建 builder；构建前确认 Dockerfile 和上下文。", False),

        # 多媒体与文档
        ("media", "ffprobe", "ffprobe -show_streams video.mp4", "查看视频流参数", "确认编码、分辨率、帧率和音轨。", False),
        ("media", "pandoc", "pandoc README.md -o README.pdf", "转换文档格式", "Markdown 转 PDF 需要 LaTeX 或 PDF 引擎。", False),
        ("media", "lame", "lame -b 192 input.wav output.mp3", "把 WAV 转成 MP3", "确认采样率和声道；码率越高文件越大。", False),
        ("media", "exiftool", "exiftool photo.jpg", "读取图片元数据", "查看拍摄参数和 GPS；写入前备份原图。", False),
        ("media", "pdftotext", "pdftotext report.pdf report.txt", "提取 PDF 文本", "扫描版 PDF 需要 OCR 才有文字层。", False),

        # 平台专属
        ("os", "update-grub", "update-grub", "重新生成 GRUB 配置", "改完内核参数或启动项后执行；需要 root。", True),
        ("os", "update-initramfs", "update-initramfs -u", "更新 initramfs", "改驱动或内核后执行；更新失败可能影响启动。", True),
        ("os", "dkms", "dkms status", "查看 DKMS 模块状态", "确认第三方驱动是否随内核正确重建。", False),
        ("os", "sysctl", "sysctl -a", "查看全部内核参数", "输出很长，配合 grep 查单个参数；修改前记录原值。", False),

        # 别名与符号
        ("alias", "builtin-alias", "builtin alias", "查看当前所有别名", "绕过同名函数直接调用内建 alias，确认别名定义。", False),

        # 其他
        ("other", "pv", "pv big.log | grep ERROR", "查看管道处理进度", "大文件处理时显示速度、已处理和剩余时间。", False),
        ("other", "parallel", "parallel -j4 gzip ::: *.log", "并行执行命令", "确认任务之间没有共享写冲突；-j 控制并发数。", False),
        ("other", "entr", "ls *.py | entr -r python main.py", "文件变化时自动重跑", "开发热重载用；退出按 Ctrl-C。", False),
        ("other", "fastfetch", "fastfetch", "显示系统信息摘要", "比 neofetch 更新更快；适合终端启动画面。", False),
        ("other", "figlet", "figlet HELLO", "把文字变成大号字符画", "生成终端标题或 README 横幅。", False),
    ],
}


def make_entry(group: str, cid: str, syntax: str, title: str, desc: str, danger: bool) -> dict:
    short = GROUP_SHORT[group]
    example = f"# {title}\n{syntax}"
    note = "系统内建命令；示例路径、用户名和参数按实际环境替换。"
    if danger:
        note += " 该命令会修改或删除数据，执行前先确认路径并备份。"
    return {
        "id": cid,
        "syntax": syntax,
        "copy": syntax,
        "title": title,
        "desc": desc,
        "example": example,
        "note": note,
        "keywords": [cid, short, "系统内建"],
        "danger": danger,
        "src": "builtin",
    }


def main() -> int:
    dry = "--dry-run" in sys.argv
    totals = {}
    for platform, rows in ADD.items():
        path = os.path.join(OUT_DIR, f"{platform}.json")
        data = json.load(open(path, encoding="utf-8"))
        existing = {item["id"].lower() for items in data["commands"].values() for item in items}
        added = 0
        for group, cid, syntax, title, desc, danger in rows:
            if cid.lower() in existing:
                continue
            if group not in data["commands"]:
                data["commands"][group] = []
            data["commands"][group].append(make_entry(group, cid, syntax, title, desc, danger))
            existing.add(cid.lower())
            added += 1
        total = sum(len(v) for v in data["commands"].values())
        data["meta"]["badge"] = f"{total:,} 条全量"
        data["meta"]["summary"] = data["meta"]["summary"].replace("669", f"{total}")
        data["audit"]["count"] = total
        data["audit"]["group_counts"] = {g: len(v) for g, v in data["commands"].items()}
        data["audit"]["additions"] = list(data["audit"].get("additions", [])) + [f"z89: +{added} builtin"]
        totals[platform] = (added, total)
        if not dry:
            with open(path, "w", encoding="utf-8") as fh:
                json.dump(data, fh, ensure_ascii=False, indent=1)
    for p, (added, total) in totals.items():
        print(f"{p}: +{added} -> {total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

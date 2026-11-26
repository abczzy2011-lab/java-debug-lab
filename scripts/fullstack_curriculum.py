#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Curriculum specs for the nine remaining full-stack courses."""


def C(title, summary, topics, lab, output, pitfall, deliver):
    goals = [f"能用自己的话说清「{t}」的输入、输出和失败条件。" for t in topics[:3]]
    goals.append(deliver)
    return {
        'title': title,
        'summary': summary,
        'topics': topics,
        'goals': goals,
        'lab': lab.strip('\n'),
        'output': output.strip('\n'),
        'pitfall': pitfall,
        'deliver': deliver
    }

MODULES = [
    {
        'id': 'foundation',
        'index': 0,
        'title': '工程基础与 Git',
        'en': 'ENGINEERING FOUNDATION',
        'logo': 'GIT',
        'accent': '#F5C98A',
        'kicker': 'FOUNDATION · FULL COURSE · FIVE PARTS',
        'project': '一个从单人脚本长成三人协作的课程社区仓库',
        'source': 'Git 官方文档、Pro Git、Linux man-pages 与真实工程流程',
        'materialLabel': 'Git / Linux / 工程流程',
        'languageLabel': 'bash',
        'sidebarTitle': '工程基础<br>与 Git',
        'sidebarNote': '从终端、Git、Linux 到评审、需求与交付文档。50 课把“会写代码”升级成“团队敢把仓库交给你”的工程习惯。',
        'topics': ['Git 分支 / 合并 / 冲突 / 回滚', 'Linux 文件、权限、进程、端口与日志', '断点调试、堆栈阅读与日志分级', '目录结构、代码规范与 Code Review', '需求拆解、任务估算与技术文档'],
        'overviewSub': '会写代码不等于会协作。这条课从<strong>终端与 Git</strong>开始，走到 Linux 权限、日志调试、目录规范、Code Review、需求拆解和交付文档，最后用三人协作的课程社区仓库把工程习惯串起来。',
        'outcomes': [
            {'title': '先把环境变成证据', 'desc': '每条命令都落到可复现的目录、版本和输出，不靠“在我电脑上能跑”。'},
            {'title': 'Git 不是备份，是叙事', 'desc': '提交、分支、PR 和回滚都要能解释为什么这样改，而不是把 diff 堆成一团。'},
            {'title': '让别人敢接手', 'desc': 'README、任务切片、评审意见和运行手册，才是团队协作真正的接口。'}
        ],
        'routeNote': '01–02 终端与 Git 基础 → 03–04 分支、远程与 PR → 05–06 Linux、日志与调试 → 07–08 目录规范与 Code Review → 09–10 需求拆解、技术文档与交付。',
        'sourceNote': '命令默认 macOS / Linux；Windows 请使用 WSL 或 Git Bash，路径与权限差异会在正文标注。',
        'parts': [
            {'title': '工作台与版本', 'note': '终端、路径、环境变量、提交、diff 与 .gitignore'},
            {'title': '分支与协作', 'note': '分支、合并、冲突、远程、PR 与保护分支'},
            {'title': '系统与故障', 'note': 'Linux 文件、权限、进程、端口、日志与调试'},
            {'title': '规范与评审', 'note': '目录结构、命名、lint、重构、小 PR 与评论'},
            {'title': '需求与交付', 'note': '用户故事、验收标准、估算、文档与交付清单'}
        ],
        'chapters': [
            C('终端、Shell 与工程目录',
              '把终端从“黑框”变成可复现的工作台：路径、环境变量、管道、退出码和目录约定，决定你能否在别人的机器上重跑同一条命令。',
              ['工作目录、绝对路径与相对路径', '环境变量与 PATH 的查找顺序', '标准输入、输出、错误与管道', '退出码与 && / || 的组合', '把本地环境写进 README 与脚本'],
              """pwd
mkdir -p ~/work/course-community && cd ~/work/course-community
printf 'hello\\n' > notes.txt
cat notes.txt | wc -l
echo $?""",
              '/home/you/work/course-community\n1\n0',
              '路径里有空格要加引号；脚本里不要依赖当前目录，先用 cd "$(dirname "$0")" 固定工作目录。',
              '写一个 setup.sh：创建目录、检查 node/java/python 版本，并在任一依赖缺失时返回非零退出码。'),
            C('Git 基础：提交是项目的骨架',
              'Git 不是网盘。它记录的是“从哪个版本、改了哪些行、为什么改”，工作区、暂存区和版本库三层要能分开看。',
              ['工作区、暂存区与版本库', 'git init 与第一条 commit', 'status / diff / log 三件套', '提交信息写什么', '.gitignore 与不该进库的文件'],
              """git init course-community
cd course-community
printf '# Course Community\\n' > README.md
git add README.md
git commit -m "docs: add project readme"
git status
git log --oneline""",
              'Initialized empty Git repository\n[main (root-commit) 4f2a1c7] docs: add project readme\n1 file changed, 1 insertion(+)\n4f2a1c7 docs: add project readme',
              'git add . 很容易把 .env、node_modules 和本地缓存一起提交；先写 .gitignore，再用 status 检查。',
              '建一个有 3 次清晰提交的仓库，包含 .gitignore、README 和一次用 git diff 解释的改动。'),
            C('分支、合并与冲突',
              '分支不是复制文件夹，而是一个可移动的提交指针。真正要学的是：什么时候开分支、怎么合并、冲突时如何保留两边意图。',
              ['branch 的本质是指针', 'switch -c 与命名约定', 'fast-forward 与 --no-ff', '冲突标记与三方合并', 'merge --abort / revert 回滚'],
              """git switch -c feature/add-footer
printf '\\n---\\nCourse Community\\n' >> README.md
git add README.md && git commit -m "feat: add footer"
git switch main
git merge --no-ff feature/add-footer
git log --graph --oneline --all""",
              '*   9c1d0aa Merge branch feature/add-footer\n|\\\n| * 2b7e331 feat: add footer\n|/\n* 4f2a1c7 docs: add project readme',
              '冲突不是“删掉别人的代码”，而是两个意图在同一行相遇；先读两边提交，再决定合并结果。',
              '在一个仓库里制造一次 README 冲突，保留双方意图解决，并用 git log --graph 解释合并历史。'),
            C('远程协作与 Pull Request',
              '本地提交只完成一半。远程、upstream、fetch 与 push 决定你的历史如何交给团队；PR 则是让别人理解、审查和合并的入口。',
              ['remote 与 origin', 'fetch / pull / push 的差异', 'upstream 与分支跟踪', 'PR 描述与审查流程', '保护分支与合并策略'],
              """git remote add origin git@github.com:team/course-community.git
git push -u origin main
git switch -c docs/api-example
git push -u origin docs/api-example

gh pr create --title "docs: add API example" --body "补充课程列表接口示例"
""",
              'branch main -> origin/main\nbranch docs/api-example -> origin/docs/api-example\nhttps://github.com/team/course-community/pull/12',
              '不要在 main 上直接开发再 force push；保护分支和 PR 的意义是让改动可讨论、可回滚。',
              '为一个真实小改动开分支、写 PR 描述、回应一条 review 意见，并完成合并。'),
            C('Linux 文件、权限与进程',
              '服务跑不起来，很多时候不是代码错，而是文件权限、端口占用、进程残留或日志没看。Linux 基本功是全栈排障的地基。',
              ['文件、目录与查找', 'chmod / chown 与最小权限', 'ps / top / kill 与信号', '端口、ss / lsof 与占用', 'journalctl 与日志位置'],
              """ls -la
chmod 640 .env
ps aux | grep java
ss -ltnp | grep 8080
kill -TERM 18422
journalctl -u course-api -n 50 --no-pager""",
              '-rw-r-----  1 deploy deploy  128 Nov 26 10:20 .env\njava  18422 ... /opt/course-api/app.jar\nLISTEN 0 128 0.0.0.0:8080 ... java\n-- Logs begin at ... --',
              'chmod 777 能“解决”权限，但会把问题变成安全事故；先看文件属于谁、进程以谁运行。',
              '用 ss 找到占用 8080 的进程，写出它的启动用户、父进程和一条安全的停止命令。'),
            C('调试、日志与故障定位',
              '调试不是乱加 print。先稳定复现，再读堆栈、缩小变量、看日志时间线；最后用二分法把问题从“整个系统”缩到“一行输入”。',
              ['先写可复现步骤', '断点、调用栈与异常链', '日志级别与采样', '结构化日志与请求 ID', '二分定位与最小复现'],
              """# 先固定输入与版本
java -version
curl -i "http://127.0.0.1:8080/api/courses?page=1"
tail -f logs/app.log | grep '"requestId"'

# 二分：先禁用最近一次改动，再逐段恢复""",
              'HTTP/1.1 500 Internal Server Error\n{"level":"ERROR","requestId":"req-7f2","path":"/api/courses","message":"page must be >= 1"}',
              '只贴“报错了”没人能帮你；复现命令、完整堆栈、请求 ID 和最近改动，才是有效信息。',
              '为一个 500 错误写出一页排障记录：复现步骤、日志片段、根因、修复和回归证据。'),
            C('目录结构、代码规范与重构',
              '项目变大后，最先坏掉的不是功能，而是边界。目录、命名、格式和依赖方向决定别人能否在十分钟内找到该改的文件。',
              ['按职责分层目录', '命名与领域语言', 'lint / format / 提交钩子', '小步重构不改行为', '依赖方向与循环引用'],
              """mkdir -p src/{api,service,repository,domain,config,test}
find src -maxdepth 2 -type d | sort

# 只移动文件，不改变行为
git mv src/CourseController.java src/api/CourseController.java
git commit -m "refactor: move course controller into api layer"
""",
              'src/api\nsrc/config\nsrc/domain\nsrc/repository\nsrc/service\nsrc/test\n[main 8a91f0e] refactor: move course controller into api layer',
              '重构和功能改动混在一个提交里，review 无法判断哪一行改变了行为；先搬结构，再改逻辑。',
              '把课程社区后端按 api / service / repository / domain 分层，提交一次“只移动不改行为”的重构。'),
            C('Code Review 与协作沟通',
              'Review 不是找茬，是让改动在合并前获得第二次理解。好的 review 先看意图和风险，再看命名和格式。',
              ['先读 PR 描述与 diff 范围', '评论对事不对人', '小 PR 与单一意图', '设计说明与替代方案', '意见冲突如何收敛'],
              """git diff main...HEAD --stat
git diff main...HEAD -- src/service/CourseService.java

# PR 评论模板
# [must] 这里会把 null 传给 repository，建议在 service 层校验
# [nit] 命名可以更贴近领域：publishedCourses""",
              ' src/service/CourseService.java | 18 +++++++++++-----\n 1 file changed, 14 insertions(+), 4 deletions(-)',
              '“这写得不对”没有信息量；指出触发条件、影响和可执行修改，才叫 review。',
              '给一个 100 行以内的 PR 写 3 条评论：一条 must、一条 suggestion、一条 praise。'),
            C('需求拆解与任务估算',
              '需求不是一句话，而是一组可验收的行为。把它拆成用户故事、验收标准和小任务，估算才有依据。',
              ['用户故事与角色', '验收标准 Given / When / Then', '按垂直切片拆任务', '估算与不确定性', '风险缓冲与依赖'],
              """# 用户故事
作为已登录学员，我希望按进度筛选课程，以便继续学习。

# 验收
Given 我有 3 门进行中的课程
When 我打开“进行中”筛选
Then 只显示进度 1–99 的课程，并按最近学习时间倒序""",
              '3 门进行中课程 → 列表按 updated_at 倒序 → 空状态显示“还没有进行中的课程”',
              '估算前没拆到“可独立验收”的粒度，最后只能拍脑袋；先拆任务，再给区间。',
              '把一个模糊需求拆成 1 个用户故事、3 条验收标准、5 个不超过半天的任务。'),
            C('技术文档与交付清单',
              '代码能跑只是开始。README、ADR、API 文档、运行手册和交付检查，决定项目能否被别人安装、理解和维护。',
              ['README 的最小结构', 'ADR 记录关键决策', 'API 文档与示例', '运行手册与故障处理', '交付前检查清单'],
              """# README 骨架
# Course Community
## 本地启动
## 环境变量
## 测试
## 部署
## 已知限制

# ADR 文件名
docs/adr/0001-use-postgresql.md""",
              'README sections: 本地启动 / 环境变量 / 测试 / 部署 / 已知限制\nADR: 0001-use-postgresql.md',
              '文档只写“运行 npm start”不够；版本、端口、依赖服务、初始数据和失败排查都要写。',
              '为一个可运行项目补齐 README、ADR、运行手册和 10 项交付检查，并让另一个人照做一次。')
        ]
    },
    {
        'id': 'network',
        'index': 1,
        'title': '计算机网络与 HTTP',
        'en': 'NETWORK & HTTP',
        'logo': 'NET',
        'accent': '#7DD3FC',
        'kicker': 'NETWORK · FULL COURSE · FIVE PARTS',
        'project': '用户在浏览器打开课程社区页面的一次完整请求',
        'source': 'HTTP 语义标准、MDN、Cloudflare 学习中心与 Wireshark 实践',
        'materialLabel': 'HTTP / TLS / DNS',
        'languageLabel': 'http',
        'sidebarTitle': '计算机网络<br>与 HTTP',
        'sidebarNote': '从地址栏到数据库，逐层拆开 DNS、TCP、TLS、HTTP、代理、CDN 与实时通道。50 课让你能画出链路，也能用 curl 定位故障。',
        'topics': ['TCP/IP、DNS 与端口', 'HTTPS / TLS 握手与证书', 'HTTP/1.1、HTTP/2 与 HTTP/3', 'WebSocket 与 SSE 实时通道', 'CDN、代理、Nginx 与超时链路'],
        'overviewSub': '全栈排错绕不开网络。这条课从<strong>一次请求的完整链路</strong>开始，走到 DNS、TCP、TLS、HTTP 语义、缓存、HTTP/2/3、代理、CDN、WebSocket 与 SSE，最后用 curl 和抓包把超时问题逐层拆开。',
        'outcomes': [
            {'title': '能画出请求链路', 'desc': '从浏览器缓存、DNS、TCP、TLS、反向代理到后端端口，每一层都知道看什么。'},
            {'title': '能读懂响应', 'desc': '状态码、缓存头、内容协商和重定向不再是“背表格”，而是排查证据。'},
            {'title': '能定位超时', 'desc': 'DNS 慢、握手慢、首字节慢还是后端慢，用 curl 和日志分别给出证据。'}
        ],
        'routeNote': '01–02 链路与 DNS → 03–04 TCP、TLS 与 HTTPS → 05–06 HTTP 报文、状态码与缓存 → 07–08 HTTP/2/3、代理与 CDN → 09–10 WebSocket、SSE 与抓包排障。',
        'sourceNote': '示例默认 curl 与 Chrome DevTools；TLS 抓包只在自己的测试环境执行，不要截取他人流量。',
        'parts': [
            {'title': '链路与域名', 'note': '分层模型、浏览器缓存、DNS 记录与解析'},
            {'title': '传输与加密', 'note': 'TCP/UDP、端口、TLS 握手、证书与 HTTPS'},
            {'title': 'HTTP 语义', 'note': '方法、头部、状态码、缓存与条件请求'},
            {'title': '协议与入口', 'note': 'HTTP/2/3、代理、Nginx、CDN 与实时通道'},
            {'title': '排障实战', 'note': 'curl、DevTools、抓包、超时链路与故障复盘'}
        ],
        'chapters': [
            C('一次请求的完整链路',
              '从地址栏回车到页面出现，中间至少经过浏览器缓存、DNS、TCP、TLS、HTTP、反向代理和后端服务。先建立完整地图，后面每一课才有位置。',
              ['浏览器缓存与地址栏', 'DNS 解析与 IP', 'TCP / TLS 建连', 'HTTP 请求与响应', '服务端处理与回包'],
              """curl -v https://course.example.com/api/courses?page=1
# 观察 * 开头的连接过程、> 请求头、< 响应头
curl -w "dns=%{time_namelookup}s connect=%{time_connect}s tls=%{time_appconnect}s ttfb=%{time_starttransfer}s total=%{time_total}s\\n" -o /dev/null -s https://course.example.com/""",
              '* Connected to course.example.com\n> GET /api/courses?page=1 HTTP/2\n< HTTP/2 200\n< content-type: application/json\ndns=0.021s connect=0.034s tls=0.061s ttfb=0.094s total=0.101s',
              '只看到“打不开”就重启服务，会把 DNS、TLS、代理和业务错误混在一起；先分层拿时间。',
              '用 curl -w 记录一次请求的 DNS、连接、TLS、首字节和总耗时，并标出最慢的一段。'),
            C('DNS、域名与解析',
              'DNS 把域名翻译成 IP，但缓存、TTL、CNAME 和权威服务器会让“刚改完为什么没生效”变成常见问题。',
              ['A / AAAA / CNAME / TXT', '递归查询与权威服务器', 'TTL 与缓存传播', 'hosts 与本地覆盖', 'dig / nslookup 排障'],
              """dig course.example.com A +short
dig course.example.com CNAME +short
dig @8.8.8.8 course.example.com A +noall +answer
cat /etc/hosts | grep course""",
              '203.0.113.24\ncdn-edge.example.net.\ncourse.example.com. 300 IN A 203.0.113.24\n# 本地 hosts 没有覆盖',
              '改 DNS 后用浏览器“感觉好了”不算验证；用 dig 看权威答案和 TTL，别忽略本地缓存。',
              '用 dig 查一条域名的 A、CNAME 和 TTL，并解释为什么另一台机器可能还解析到旧 IP。'),
            C('TCP、UDP 与端口',
              'HTTP 建立在 TCP 之上，实时和音视频又可能走 UDP。理解握手、端口和连接状态，才能看懂“连接被拒绝”和“连接超时”的区别。',
              ['三次握手与四次挥手', '端口与服务监听', 'TCP 与 UDP 的取舍', 'TIME_WAIT 与连接复用', 'ss / netstat 看连接'],
              """ss -ltnp | grep -E ':(80|443|8080)'
ss -tan state time-wait | head
nc -vz course.example.com 443
curl --http1.1 -v https://course.example.com/ 2>&1 | grep -E 'Connected|left intact'
              """,
              'LISTEN 0 4096 0.0.0.0:443 ... nginx\nLISTEN 0 128 127.0.0.1:8080 ... java\nConnection to course.example.com 443 port [tcp/https] succeeded!',
              'Connection refused 通常是端口没人监听；Connection timed out 更像网络/防火墙丢包，别混为一谈。',
              '用 ss 找到本机 8080 的监听进程，并解释一次“连接被拒绝”应该先查哪一层。'),
            C('TLS、HTTPS 与证书',
              'HTTPS 不只是加个小锁。证书链、SNI、握手和密钥交换决定浏览器是否信任你，也决定中间人能否偷看。',
              ['对称加密与非对称加密', '证书链与 CA', 'SNI 与多域名', 'openssl 查看握手', '证书过期 / 域名不匹配'],
              """openssl s_client -connect course.example.com:443 -servername course.example.com </dev/null 2>/dev/null | openssl x509 -noout -subject -issuer -dates
curl -vI https://course.example.com/ 2>&1 | grep -E 'SSL certificate|subject|issuer'""",
              'subject=CN = course.example.com\nissuer=C = US, O = Let\'s Encrypt\nnotBefore=Nov  1 00:00:00 2026 GMT\nnotAfter=Jan 30 23:59:59 2027 GMT',
              '证书域名不匹配和证书过期是两类错误；先用 openssl 看 subject / SAN / 有效期，再改配置。',
              '用 openssl 检查一个 HTTPS 站点的证书主题、签发者、有效期和 SAN，并写出过期后的续期步骤。'),
            C('HTTP 报文、方法与内容协商',
              'HTTP 是“请求 + 响应”的文本协议。方法表达意图，头部表达条件，body 承载数据；看懂报文才能看懂接口。',
              ['请求行、状态行与头部', 'GET / POST / PUT / PATCH / DELETE', 'Content-Type 与 Accept', 'Content-Length / chunked', '幂等与安全方法'],
              """curl -i -X POST https://course.example.com/api/courses \\
  -H 'Content-Type: application/json' \\
  -H 'Accept: application/json' \\
  -d '{"title":"HTTP 基础","priceCents":9900}'

curl -i -X PATCH https://course.example.com/api/courses/42 \\
  -H 'Content-Type: application/json' -d '{"published":true}'
              """,
              'HTTP/2 201\ncontent-type: application/json\n{"id":42,"title":"HTTP 基础"}\nHTTP/2 200\n{"id":42,"published":true}',
              'GET 不应该产生副作用；PUT 通常是整体替换，PATCH 是局部修改，DELETE 要可重复执行才安全。',
              '用 curl 发一次带 JSON body 的 POST 和一次 PATCH，解释 Content-Type 缺失时服务端会怎样。'),
            C('状态码、缓存与条件请求',
              '状态码不是装饰，它决定客户端是重试、跳转、刷新还是放弃。缓存头则决定同一个 URL 能否复用旧响应。',
              ['2xx / 3xx / 4xx / 5xx 的语义', 'Cache-Control 与 max-age', 'ETag / Last-Modified', 'Vary 与内容协商', '304 与条件请求'],
              """curl -i https://course.example.com/assets/app.css
curl -i -H 'If-None-Match: "abc123"' https://course.example.com/assets/app.css
curl -I https://course.example.com/api/courses""",
              'HTTP/2 200\ncache-control: public, max-age=31536000, immutable\netag: "abc123"\nHTTP/2 304\ncache-control: public, max-age=31536000',
              'API 响应默认不要长缓存；带用户信息的响应若被 CDN 缓存，会把 A 的数据发给 B。',
              '为静态资源和 API 分别设计缓存策略，并解释一次 304 响应需要哪些请求头。'),
            C('HTTP/2、HTTP/3 与传输性能',
              'HTTP/2 用多路复用减少连接数，HTTP/3 把传输层换到 QUIC。协议升级解决旧问题，也带来新的排障视角。',
              ['多路复用与流', 'HPACK 头部压缩', '队头阻塞与优先级', 'QUIC 与 UDP', '协议选择与降级'],
              """curl --http2 -I https://course.example.com/
curl --http3 -I https://course.example.com/
curl -w "http_version=%{http_version} connect=%{time_connect}s total=%{time_total}s\\n" -o /dev/null -s https://course.example.com/""",
              'HTTP/2 200\nhttp_version=2\nHTTP/3 200\nhttp_version=3\nhttp_version=2 connect=0.031s total=0.087s',
              'HTTP/2 不是“一定更快”；小资源多、连接复用差或代理不支持时，可能仍要走 HTTP/1.1。',
              '用 curl 分别强制 HTTP/1.1、HTTP/2 和 HTTP/3 请求同一页面，记录版本与耗时差异。'),
            C('代理、Nginx 与 CDN',
              '真实入口通常不是应用服务器，而是 Nginx、负载均衡和 CDN。转发头、缓存键和超时设置会把问题放大或缩小。',
              ['正向代理与反向代理', 'Nginx upstream 与 location', 'X-Forwarded-For / Proto', 'CDN 缓存键与回源', '超时与重试链路'],
              """server {
  listen 443 ssl;
  server_name course.example.com;
  location /api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
  }
}""",
              'nginx: configuration file /etc/nginx/nginx.conf test is successful\ncurl -i https://course.example.com/api/health → HTTP/2 200',
              '代理层超时短于后端处理时间，会出现“浏览器 504、后端其实成功了”；两层超时要对齐。',
              '画出一条 Nginx → 后端 → 数据库的请求链路，标出每一层超时和转发头。'),
            C('WebSocket、SSE 与实时通道',
              '不是所有实时都用 WebSocket。SSE 单向推送更简单，WebSocket 双向但要处理心跳、重连和鉴权。',
              ['HTTP Upgrade 与 101', 'WebSocket 帧与心跳', 'SSE 的 text/event-stream', '断线重连与退避', '实时通道的鉴权'],
              """curl -N https://course.example.com/api/events
# data: {"type":"progress","lessonId":12}

websocat wss://course.example.com/ws
# {"type":"ping"} → {"type":"pong"}""",
              'event: progress\ndata: {"lessonId":12,"percent":80}\n\n{"type":"pong"}',
              '把 JWT 放在 URL query 里会被日志和代理记录；实时连接也要走 Authorization 或短期票据。',
              '分别用 SSE 和 WebSocket 做一个最小推送，记录断线后的重连行为和鉴权方式。'),
            C('curl、DevTools 与超时排障',
              '排障的核心不是工具多，而是分层。先确认 DNS，再确认连接和 TLS，再看首字节和后端日志，最后才怀疑代码。',
              ['curl -v / -w 的读法', 'DevTools 网络面板', 'tcpdump 抓包边界', '区分连接超时与读取超时', '一次完整的故障复盘'],
              """curl -v --max-time 10 https://course.example.com/api/courses
curl -w "dns=%{time_namelookup} connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total}\\n" -o /dev/null -s https://course.example.com/
# 只在自有测试环境抓包
sudo tcpdump -i any -n port 443 -c 20""",
              'dns=0.018s connect=0.030s tls=0.055s ttfb=2.100s total=2.130s\n# TTFB 高，连接与 TLS 正常 → 重点查后端/代理',
              '把所有超时都归因于“网络不好”没有证据；TTFB 高但连接快，问题往往在后端或数据库。',
              '对一个慢请求做分层计时，写出 DNS、连接、TLS、TTFB、总耗时，并给出下一步排查方向。')
        ]
    },
    {
        'id': 'backend',
        'index': 2,
        'title': '后端工程',
        'en': 'BACKEND ENGINEERING',
        'logo': 'BE',
        'accent': '#A78BFA',
        'kicker': 'BACKEND · FULL COURSE · FIVE PARTS',
        'project': '课程社区 API 从单文件 Controller 长成可交付服务',
        'source': 'Spring Boot 3、FastAPI、REST 实践与生产服务经验',
        'materialLabel': 'Spring Boot / API / 服务分层',
        'languageLabel': 'java',
        'sidebarTitle': '后端工程',
        'sidebarNote': '从“会写类和方法”升级到“能交付服务”：分层、校验、异常、ORM、事务、分页、上传、任务、配置与健康检查。50 课用一个课程社区 API 串起来。',
        'topics': ['Spring Boot / FastAPI / Express', 'Controller / Service / Repository 分层', 'REST 接口、参数校验与统一错误码', 'ORM、连接池、事务边界', '分页、文件上传、任务调度与配置'],
        'overviewSub': '后端不是“把 SQL 包进接口”。这条课从<strong>服务骨架</strong>开始，走到控制器、业务层、Repository、事务、登录中间件、分页、上传、后台任务、配置与健康检查，最后交付一个能接前端、能部署的课程社区 API。',
        'outcomes': [
            {'title': '分层不是形式', 'desc': 'Controller 只做协议，Service 管业务与事务，Repository 管数据访问，边界清楚才可测试。'},
            {'title': '错误也是契约', 'desc': '参数校验、业务异常和系统异常要统一成可消费的错误码，而不是把堆栈丢给前端。'},
            {'title': '能部署才算服务', 'desc': '配置、日志、健康检查、连接池和优雅停机，缺一项都不算可交付。'}
        ],
        'routeNote': '01–02 骨架、路由与控制器 → 03–04 校验、错误契约与 Service → 05–06 ORM、事务、登录与中间件 → 07–08 分页、查询契约、上传与对象存储 → 09–10 后台任务、配置、日志与发布准备。',
        'sourceNote': '示例以 Java 21 + Spring Boot 3 为主；FastAPI / Express 的对照会在关键章节标注。',
        'parts': [
            {'title': '骨架与入口', 'note': '项目骨架、分层、路由、控制器与请求上下文'},
            {'title': '业务与数据', 'note': '参数校验、错误契约、Service、ORM 与事务'},
            {'title': '身份与资源', 'note': '登录、会话、中间件、分页、上传与对象存储'},
            {'title': '异步与运维', 'note': '后台任务、调度、幂等、配置、日志与健康检查'},
            {'title': '交付与项目', 'note': '接口联调、性能边界、部署准备与课程社区实战'}
        ],
        'chapters': [
            C('服务骨架与分层',
              '先把项目骨架搭对：入口、配置、领域、数据访问和测试目录各就各位。分层不是为了多写文件，而是为了让改动有边界。',
              ['启动类与配置加载', 'api / service / repository / domain', '依赖注入与构造器', 'DTO 与实体分离', '本地启动与最小健康接口'],
              """@SpringBootApplication
public class CourseApplication {
  public static void main(String[] args) {
    SpringApplication.run(CourseApplication.class, args);
  }
}

@RestController
class HealthController {
  @GetMapping("/api/health")
  Map<String, String> health() { return Map.of("status", "ok"); }
}""",
              'GET /api/health → 200\n{"status":"ok"}',
              'Controller 里直接 new Repository、直接拼 SQL，会让业务无法测试；依赖从构造器注入，边界才清楚。',
              '搭出一个能启动的最小服务，包含健康接口、分层目录和一条本地启动命令。'),
            C('路由、控制器与请求上下文',
              '控制器只负责协议层：解析路径、查询参数、请求头和 body，再把结果交给 Service。它不应该知道数据库表名。',
              ['路径变量与查询参数', '请求体与 DTO', '请求头与用户上下文', '响应封装与序列化', '幂等键与请求 ID'],
              """@RestController
@RequestMapping("/api/courses")
class CourseController {
  private final CourseService service;
  CourseController(CourseService service) { this.service = service; }

  @GetMapping("/{id}")
  CourseView get(@PathVariable long id) { return service.get(id); }
}""",
              'GET /api/courses/42 → 200\n{"id":42,"title":"后端工程","published":true}',
              '把业务规则写进 Controller，换一个入口（CLI、消息队列）就要复制一遍；协议层只做转换和校验。',
              '为课程列表、详情、创建写三个控制器方法，并让每个方法只调用一次 Service。'),
            C('参数校验与统一错误契约',
              '前端最怕后端“有时返回字符串、有时返回对象、有时直接 500”。把校验和错误格式统一，接口才可消费。',
              ['Bean Validation / Pydantic', '路径与查询参数校验', '业务异常与系统异常', '错误码、message 与 details', '404 / 409 / 422 的选择'],
              """public record CreateCourseRequest(
  @NotBlank @Size(min = 2, max = 120) String title,
  @Min(0) int priceCents
) {}

@RestControllerAdvice
class ApiErrors {
  @ExceptionHandler(MethodArgumentNotValidException.class)
  ResponseEntity<ApiError> badRequest(MethodArgumentNotValidException e) {
    return ResponseEntity.unprocessableEntity().body(ApiError.of("VALIDATION_ERROR", e.getMessage()));
  }
}""",
              'POST /api/courses {} → 422\n{"code":"VALIDATION_ERROR","message":"title must not be blank","details":[...]}',
              '所有异常都返回 500 会让前端无法区分“用户输入错”和“服务坏了”；先分类，再统一格式。',
              '写出统一的错误响应结构，覆盖参数校验、资源不存在、冲突和系统异常四类。'),
            C('Service 与业务规则',
              'Service 是业务的家：它决定“能不能发布”“能不能重复报名”“事务从哪里开始”，也应该是单元测试的主要目标。',
              ['业务方法与应用服务', '领域规则与不变量', '事务边界放在哪', 'DTO 转换与返回视图', 'Service 的可测试性'],
              """@Service
class CourseService {
  private final CourseRepository repo;
  CourseService(CourseRepository repo) { this.repo = repo; }

  @Transactional
  public CourseView publish(long id) {
    Course c = repo.find(id).orElseThrow(() -> new NotFound("COURSE_NOT_FOUND"));
    c.publish();
    return CourseView.from(c);
  }
}""",
              'POST /api/courses/42/publish → 200\n{"id":42,"published":true}',
              '事务开在 Controller 或 Repository 里，业务失败时边界会错；应用服务方法通常是事务边界。',
              '把“发布课程”写成 Service 方法，包含不变量、异常和一条单元测试。'),
            C('Repository、ORM 与事务',
              'ORM 让增删改查更快，也会隐藏 N+1、懒加载和事务失效。要能看懂它生成的 SQL，知道什么时候该手写查询。',
              ['Repository 接口与查询方法', '实体映射与懒加载', 'N+1 与 fetch join', '事务传播与只读事务', '连接池与超时'],
              """@Repository
interface CourseRepository extends JpaRepository<Course, Long> {
  @Query("select c from Course c join fetch c.lessons where c.id = :id")
  Optional<Course> findWithLessons(long id);
}

@Transactional(readOnly = true)
public List<CourseView> list() { return repo.findAll().stream().map(CourseView::from).toList(); }""",
              'Hibernate: select c.*, l.* from courses c left join lessons l ...\n-- 一次查询取回课程和课节，避免 N+1',
              '在循环里调用 repository.findAll() 会产生 N+1；先用日志或 SQL 监控确认查询次数。',
              '为一个一对多关系写出 fetch join 查询，并用 SQL 日志证明查询次数从 N+1 降到 1。'),
            C('登录、会话与中间件',
              '认证解决“你是谁”，授权解决“你能做什么”。后端要在每个入口统一识别用户，而不是让每个 Controller 自己解析 token。',
              ['登录接口与密码哈希', 'Session / JWT 的选择', '过滤器与拦截器', '当前用户上下文', '登出、失效与多端'],
              """@Component
class AuthFilter extends OncePerRequestFilter {
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) {
    String token = req.getHeader("Authorization");
    CurrentUser user = tokens.verify(token);
    UserContext.set(user);
    try { chain.doFilter(req, res); } finally { UserContext.clear(); }
  }
}""",
              'Authorization: Bearer <token> → UserContext.userId=42\n无效 token → 401 {"code":"UNAUTHENTICATED"}',
              '把用户 ID 从请求参数里直接取，等于允许任何人冒充；身份必须来自可信 token 或 session。',
              '实现一个认证过滤器，让 Controller 只能通过当前用户上下文取身份，并补一条 401 测试。'),
            C('分页、排序与查询契约',
              '分页不是 LIMIT 就完事。排序字段、每页上限、总数统计和游标分页都会影响性能与结果稳定性。',
              ['offset / limit 与页数', '排序字段白名单', '总数与近似总数', '游标分页', '空结果与边界页'],
              """@GetMapping
Page<CourseView> list(
  @RequestParam(defaultValue = "0") @Max(1000) int page,
  @RequestParam(defaultValue = "20") @Max(100) int size,
  @RequestParam(defaultValue = "createdAt,desc") String sort
) {
  return service.list(PageRequest.of(page, size, Sort.by(parse(sort))));
}""",
              'GET /api/courses?page=0&size=20&sort=createdAt,desc → 200\n{"content":[...],"totalElements":58,"totalPages":3}',
              '让前端传任意 sort 字段会拼出非法 SQL 或慢查询；排序字段必须白名单。',
              '实现分页接口，限制 size 上限、校验排序字段，并写一条空结果和最后一页测试。'),
            C('文件上传与对象存储',
              '上传不是把文件写进项目目录。要做大小限制、类型校验、随机文件名、对象存储、访问控制和清理策略。',
              ['multipart 请求与大小限制', 'MIME 与扩展名校验', '本地存储与对象存储', '预签名 URL', '病毒扫描与清理'],
              """@PostMapping("/api/uploads")
UploadView upload(@RequestPart MultipartFile file) {
  if (file.getSize() > 10 * 1024 * 1024) throw new BadRequest("FILE_TOO_LARGE");
  String key = storage.put(file.getBytes(), file.getContentType());
  return new UploadView(key, storage.signedUrl(key, Duration.ofMinutes(10)));
}""",
              'POST /api/uploads (multipart) → 201\n{"key":"uploads/2026/11/abc.png","url":"https://cdn.example.com/...?sig=..."}',
              '用原始文件名拼路径会导致路径穿越和覆盖；生成随机 key，并把文件类型和大小在服务端再校验一次。',
              '实现一个 10MB 限制的图片上传，返回短期签名 URL，并写出恶意文件的拒绝用例。'),
            C('后台任务、调度与幂等',
              '不是所有工作都适合在请求线程里做。发邮件、生成报表、清理临时文件要进任务队列；重复执行必须安全。',
              ['同步与异步边界', '任务队列与重试', '定时任务与分布式锁', '幂等键与去重', '失败告警与死信'],
              """@Scheduled(cron = "0 0 3 * * *")
void cleanExpiredUploads() {
  if (!lock.tryLock("cleanup", Duration.ofMinutes(10))) return;
  try { storage.deleteExpired(LocalDate.now().minusDays(7)); }
  finally { lock.unlock("cleanup"); }
}""",
              '03:00 cleanup started\n03:00 deleted 18 expired objects\n03:00 cleanup finished in 420ms',
              '多实例部署后每个实例都跑定时任务，会重复清理或重复发邮件；用分布式锁或单实例调度。',
              '把一个耗时任务移出请求线程，设计重试、幂等键和失败告警，并验证重复执行不会产生副作用。'),
            C('配置、日志、健康检查与发布准备',
              '服务能不能上线，看的不是 main 方法能跑，而是配置是否外置、日志是否能追踪、健康检查是否能被负载均衡读懂。',
              ['环境变量与配置分层', '密钥与本地默认值', '结构化日志与请求 ID', '健康 / 就绪检查', '优雅停机与发布清单'],
              """management.endpoints.web.exposure.include=health,info
logging.pattern.console=%d{ISO8601} level=%level requestId=%X{requestId} %msg%n

curl -i http://127.0.0.1:8080/actuator/health
curl -i http://127.0.0.1:8080/actuator/health/readiness""",
              '{"status":"UP"}\n{"status":"UP"}',
              '把数据库密码写进 application.yml 并提交，等于把生产钥匙放进历史；配置外置、密钥走环境或密钥管理。',
              '写出生产配置清单：环境变量、日志格式、健康检查、优雅停机和一条回滚步骤。')
        ]
    }
]
from fullstack_curriculum_b import MODULES_B
MODULES += MODULES_B

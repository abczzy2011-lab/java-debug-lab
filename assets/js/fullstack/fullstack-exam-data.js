/* 全栈结业考试 · 10 个科目各 10 分：2 分知识选择 + 2 分终端指令 + 6 分代码改错，共 30 题 100 分 */
window.FULLSTACK_EXAM = {
  "version": "20261126z86",
  "title": "全栈结业考试",
  "subtitle": "10 个科目，每个科目一道知识选择题 + 一道终端指令题 + 一道代码改错题。不只背概念，还要会用命令定位问题、修掉真实工程里的错误。",
  "duration": "建议 75 分钟",
  "total": 100,
  "passing": 60,
  "rules": [
    "10 个科目各 10 分：知识选择 2 分，终端指令 2 分，代码改错 6 分。",
    "选择题和指令题各只有一个正确选项；改错题选一个你认为能真正修好问题的补丁。",
    "终端指令题考常用命令、参数和排障顺序，不考冷门偏门参数。",
    "提交后自动评分，给出总分、等级、10 科分项和薄弱科目。",
    "未答题按 0 分计；提交前会提示还剩多少题。",
    "答案会暂存在本机浏览器，刷新页面不会立刻丢失。"
  ],
  "grades": [
    {
      "min": 90,
      "label": "全栈通关",
      "code": "S",
      "note": "知识面、排错和工程判断都过了线，可以进入毕业项目答辩。"
    },
    {
      "min": 80,
      "label": "可独立交付",
      "code": "A",
      "note": "主链路已经扎实，剩下的是把薄弱科目补到能独立排查。"
    },
    {
      "min": 70,
      "label": "基本合格",
      "code": "B",
      "note": "能看懂并完成大部分任务，但复杂故障还需要课程和项目补强。"
    },
    {
      "min": 60,
      "label": "及格线",
      "code": "C",
      "note": "基础概念有轮廓，改错和边界条件仍是明显短板。"
    },
    {
      "min": 0,
      "label": "需要重修",
      "code": "D",
      "note": "先回到对应科目的最小实验，把命令、请求链路和数据流重新跑通。"
    }
  ],
  "questions": [
    {
      "id": "foundation-choice",
      "subject": "foundation",
      "type": "choice",
      "points": 2,
      "title": "合并冲突后，下一步先做什么？",
      "prompt": "你在 feature 分支执行 git merge main，终端提示冲突。此时最稳妥的下一步是？",
      "options": [
        {
          "text": "git reset --hard 丢掉冲突，再重新 merge"
        },
        {
          "text": "git status 列出冲突文件，编辑解决后 git add，再完成合并提交"
        },
        {
          "text": "删除 .git 目录后重新 clone"
        },
        {
          "text": "git push --force 覆盖远端"
        }
      ],
      "answer": 1,
      "explain": "冲突不是错误，是 Git 把决定权交给你。先用 git status 看清冲突文件，解决标记后 git add，再完成合并。reset --hard 会丢工作区，删 .git 会丢历史，force push 会覆盖远端提交。"
    },
    {
      "id": "foundation-command",
      "subject": "foundation",
      "type": "command",
      "points": 2,
      "title": "先确认当前分支和工作区状态",
      "prompt": "你刚接手一个仓库，准备切换分支前，想先确认当前分支、工作区有没有未提交的改动。哪条命令最直接？",
      "options": [
        {
          "text": "查看最近三次提交",
          "code": "git log --oneline -3"
        },
        {
          "text": "显示当前分支与工作区状态",
          "code": "git status"
        },
        {
          "text": "查看所有远端仓库",
          "code": "git remote -v"
        },
        {
          "text": "查看所有分支的最后提交",
          "code": "git branch -vv"
        }
      ],
      "answer": 1,
      "explain": "git status 会显示当前分支、已暂存、未暂存和未跟踪文件；git log、git remote、git branch -vv 都不直接展示工作区的 dirty 状态。"
    },
    {
      "id": "foundation-debug",
      "subject": "foundation",
      "type": "debug",
      "points": 6,
      "title": "脚本为什么不能执行？",
      "prompt": "新拉下来的脚本直接执行时报 permission denied。要在不扩大权限的前提下修复，选哪个补丁？",
      "code": "$ ./scripts/deploy.sh\nzsh: permission denied: ./scripts/deploy.sh",
      "options": [
        {
          "text": "只给这个脚本加执行位",
          "code": "chmod +x scripts/deploy.sh"
        },
        {
          "text": "把整个脚本目录放开到所有人可读写执行",
          "code": "chmod -R 777 scripts"
        },
        {
          "text": "用 source 在当前 shell 里执行",
          "code": "source scripts/deploy.sh"
        },
        {
          "text": "删掉脚本目录重来",
          "code": "sudo rm -rf scripts"
        }
      ],
      "answer": 0,
      "explain": "报错是缺少执行位，不是文件不存在。chmod +x 是最小修复；777 扩大了权限面，source 会改变执行语义，删除目录更不能解决问题。"
    },
    {
      "id": "network-choice",
      "subject": "network",
      "type": "choice",
      "points": 2,
      "title": "Connection refused 先查什么？",
      "prompt": "浏览器访问 http://localhost:3000 返回 ERR_CONNECTION_REFUSED，最先应该确认什么？",
      "options": [
        {
          "text": "localhost 是否需要备案"
        },
        {
          "text": "本机 3000 端口是否有进程在监听",
          "code": "lsof -i :3000"
        },
        {
          "text": "TLS 证书是否过期",
          "code": "openssl s_client -connect localhost:3000"
        },
        {
          "text": "CDN 是否命中缓存"
        }
      ],
      "answer": 1,
      "explain": "Connection refused 表示 TCP 连接被拒绝，最常见原因是服务没起或没监听这个端口。localhost 不走备案和 CDN；TLS 握手还没开始，HTTPS 也不是当前协议。"
    },
    {
      "id": "network-command",
      "subject": "network",
      "type": "command",
      "points": 2,
      "title": "先定位 3000 端口的占用进程",
      "prompt": "本地服务报连接被拒绝，想确认 3000 端口到底有没有进程监听，应该先执行哪条？",
      "options": [
        {
          "text": "查看 3000 端口占用进程",
          "code": "lsof -i :3000"
        },
        {
          "text": "查询 localhost 的 DNS 记录",
          "code": "dig localhost"
        },
        {
          "text": "查看到 localhost 的路由",
          "code": "traceroute localhost"
        },
        {
          "text": "请求 HTTPS 响应头",
          "code": "curl -I https://localhost:3000"
        }
      ],
      "answer": 0,
      "explain": "lsof -i :3000 会列出占用该端口的进程和 PID；dig 查 DNS，traceroute 查路由，curl -I 只能看到 HTTP 层结果，不能确认本机谁在监听。",
      "code": "$ curl -I http://localhost:3000\ncurl: (7) Failed to connect to localhost port 3000"
    },
    {
      "id": "network-debug",
      "subject": "network",
      "type": "debug",
      "points": 6,
      "title": "Nginx 为什么返回 502？",
      "prompt": "Nginx 返回 502 Bad Gateway，后端日志正常且服务确实监听 3000。看配置，选正确补丁。",
      "code": "location /api/ {\n    proxy_pass http://127.0.0.1:3001;\n}",
      "options": [
        {
          "text": "把上游端口改成服务真正监听的 3000",
          "code": "proxy_pass http://127.0.0.1:3000;"
        },
        {
          "text": "不转发，直接返回 200",
          "code": "return 200 \"ok\";"
        },
        {
          "text": "把上游改成 HTTPS",
          "code": "proxy_pass https://127.0.0.1:3001;"
        },
        {
          "text": "打开目录列表",
          "code": "autoindex on;"
        }
      ],
      "answer": 0,
      "explain": "502 是 Nginx 连不上 upstream。配置写 3001、服务在 3000，就是端口错配。改回 3000 才能把请求送到真实进程；返回 200 是掩盖问题，HTTPS 和目录列表都不解决上游连接。"
    },
    {
      "id": "database-choice",
      "subject": "database",
      "type": "choice",
      "points": 2,
      "title": "复合索引怎么用才有效？",
      "prompt": "表上有复合索引 (user_id, created_at)。下面哪个查询最能用上这个索引？",
      "options": [
        {
          "text": "WHERE created_at > '2026-01-01'"
        },
        {
          "text": "WHERE user_id = 42 ORDER BY created_at DESC"
        },
        {
          "text": "WHERE user_id LIKE '%42%'"
        },
        {
          "text": "ORDER BY id DESC"
        }
      ],
      "answer": 1,
      "explain": "复合索引遵循最左前缀。user_id 等值匹配后，created_at 可以继续支持范围与排序。只查第二列、前导通配符、按无关的 id 排序，都无法完整利用这个索引。"
    },
    {
      "id": "database-command",
      "subject": "database",
      "type": "command",
      "points": 2,
      "title": "数据库容器到底起没起",
      "prompt": "本地 API 连不上 Postgres，怀疑 Compose 里的 db 容器没有正常运行。想先看服务状态和端口，选哪条？",
      "options": [
        {
          "text": "停止整个服务栈",
          "code": "docker compose down"
        },
        {
          "text": "跟踪 db 日志",
          "code": "docker compose logs -f db"
        },
        {
          "text": "列出 Compose 服务与运行状态",
          "code": "docker compose ps"
        },
        {
          "text": "进入 db 容器执行 SQL",
          "code": "docker compose exec db psql -U app"
        }
      ],
      "answer": 2,
      "explain": "docker compose ps 先确认 db 是否 Up、端口是否映射；服务没起时 logs 才有意义，exec 只能对已运行容器执行，down 会进一步停掉服务。",
      "code": "$ curl http://localhost:8080/api/orders\ncurl: (7) Failed to connect to localhost port 8080"
    },
    {
      "id": "database-debug",
      "subject": "database",
      "type": "debug",
      "points": 6,
      "title": "聚合查询为什么报错？",
      "prompt": "这个查询在 PostgreSQL 严格模式下报聚合错误，但业务还要保留没有订单的用户。选正确修复。",
      "code": "SELECT u.id, u.name, COUNT(o.id) AS order_count\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nORDER BY u.id;",
      "options": [
        {
          "text": "按用户主键和姓名分组",
          "code": "GROUP BY u.id, u.name"
        },
        {
          "text": "把 LEFT JOIN 改成 INNER JOIN",
          "code": "INNER JOIN orders o ON o.user_id = u.id"
        },
        {
          "text": "对用户 id 去重",
          "code": "COUNT(DISTINCT u.id) AS order_count"
        },
        {
          "text": "在最前面加 DISTINCT",
          "code": "SELECT DISTINCT u.id, u.name, COUNT(o.id)"
        }
      ],
      "answer": 0,
      "explain": "SELECT 里有聚合 COUNT，又输出普通列，必须按普通列分组。GROUP BY u.id, u.name 才能每组算订单数。改 INNER JOIN 会丢掉没有订单的用户；COUNT(DISTINCT u.id) 数的是用户不是订单；SELECT DISTINCT 不能替代 GROUP BY。"
    },
    {
      "id": "backend-choice",
      "subject": "backend",
      "type": "choice",
      "points": 2,
      "title": "事务边界放在哪一层？",
      "prompt": "Controller / Service / Repository 分层中，一个“转账”用例的事务边界通常放在哪一层？",
      "options": [
        {
          "text": "Controller，因为它是 HTTP 入口"
        },
        {
          "text": "Service，因为它组合一个完整业务用例"
        },
        {
          "text": "Repository 的每个方法各开一个事务"
        },
        {
          "text": "前端请求层，失败时再重试"
        }
      ],
      "answer": 1,
      "explain": "事务要覆盖一个完整业务动作。Service 负责组合多个 Repository 操作，因此在 Service 边界开事务最合适；Controller 只管 HTTP，Repository 单方法事务会让转账拆成两个独立事务。"
    },
    {
      "id": "backend-command",
      "subject": "backend",
      "type": "command",
      "points": 2,
      "title": "实时追日志并只看错误",
      "prompt": "测试环境刚重启，logs/app.log 仍在写入。你想持续看新增日志，并只筛出 error 行，选哪条？",
      "options": [
        {
          "text": "把整个日志一次打印",
          "code": "cat logs/app.log"
        },
        {
          "text": "跟踪末尾 100 行并筛 error",
          "code": "tail -n 100 -f logs/app.log | grep -i error"
        },
        {
          "text": "只看文件开头 100 行",
          "code": "head -n 100 logs/app.log"
        },
        {
          "text": "删除旧日志重新开始",
          "code": "rm logs/app.log"
        }
      ],
      "answer": 1,
      "explain": "tail -f 持续跟踪末尾新增内容，-n 100 先给上下文，管道到 grep -i error 只保留错误行；cat/head 不会持续跟踪，rm 会破坏现场。"
    },
    {
      "id": "backend-debug",
      "subject": "backend",
      "type": "debug",
      "points": 6,
      "title": "接口为什么返回 200 空响应？",
      "prompt": "找不到用户时接口返回 200 空响应，而且把 password 字段也序列化出去了。选最合适的修复。",
      "code": "@GetMapping(\"/users/{id}\")\npublic User getUser(@PathVariable Long id) {\n    return userRepository.findById(id).orElse(null);\n}",
      "options": [
        {
          "text": "找不到时返回 404，并用 DTO 只输出允许字段",
          "code": "return userRepository.findById(id)\n    .map(UserDto::from)\n    .map(ResponseEntity::ok)\n    .orElseGet(() -> ResponseEntity.notFound().build());"
        },
        {
          "text": "加跨域配置",
          "code": "@CrossOrigin"
        },
        {
          "text": "把 Long 改成 String",
          "code": "@PathVariable String id"
        },
        {
          "text": "只加只读事务",
          "code": "@Transactional(readOnly = true)"
        }
      ],
      "answer": 0,
      "explain": "orElse(null) 会让 Spring 返回 200 + 空 body，语义应该是 404。直接返回实体还会把 password 等内部字段带出去，DTO 才能控制输出。跨域、参数类型、只读事务都不解决这两个问题。"
    },
    {
      "id": "frontend-choice",
      "subject": "frontend",
      "type": "choice",
      "points": 2,
      "title": "怎样避免旧请求覆盖新状态？",
      "prompt": "React 的 effect 里连续发请求，旧响应可能晚到并覆盖新结果。最合适的处理是？",
      "options": [
        {
          "text": "用 useMemo 包住 fetch"
        },
        {
          "text": "用 AbortController，在 effect cleanup 中取消旧请求"
        },
        {
          "text": "用 setTimeout(0) 延后请求"
        },
        {
          "text": "把结果缓存到 localStorage"
        }
      ],
      "answer": 1,
      "explain": "竞态需要让旧请求失效。effect cleanup 里 abort 旧请求，能从源头阻止旧响应落地。useMemo 不是异步副作用容器；setTimeout 不保证顺序；localStorage 只是存储，不能取消在途请求。"
    },
    {
      "id": "frontend-command",
      "subject": "frontend",
      "type": "command",
      "points": 2,
      "title": "Vite 端口被谁占了",
      "prompt": "启动 Vite 时报 5173 端口已被占用。想找到占用端口的进程，选哪条？",
      "options": [
        {
          "text": "重新安装依赖",
          "code": "npm install"
        },
        {
          "text": "构建生产包",
          "code": "npm run build"
        },
        {
          "text": "用浏览器打开页面",
          "code": "open http://localhost:5173"
        },
        {
          "text": "查看 5173 端口占用进程",
          "code": "lsof -i :5173"
        }
      ],
      "answer": 3,
      "explain": "lsof -i :5173 能定位监听该端口的 PID；npm install/build 不解决端口冲突，open 只是打开浏览器，不会告诉你谁占着端口。",
      "code": "Error: listen EADDRINUSE: address already in use :::5173"
    },
    {
      "id": "frontend-debug",
      "subject": "frontend",
      "type": "debug",
      "points": 6,
      "title": "计数器为什么停在 1？",
      "prompt": "计数器每秒只加 1 次，之后停在 1。看代码，选正确补丁。",
      "code": "useEffect(() => {\n  const id = setInterval(() => setCount(count + 1), 1000);\n  return () => clearInterval(id);\n}, []);",
      "options": [
        {
          "text": "用函数式更新读取最新状态",
          "code": "setCount(c => c + 1)"
        },
        {
          "text": "把 count 加入依赖数组",
          "code": "}, [count]);"
        },
        {
          "text": "把 setInterval 换成 setTimeout",
          "code": "setTimeout(() => setCount(count + 1), 1000)"
        },
        {
          "text": "把 setCount 移到组件外"
        }
      ],
      "answer": 0,
      "explain": "空依赖数组的 effect 只捕获首次渲染时的 count=0，之后定时器一直执行 setCount(0+1)。函数式更新 setCount(c => c + 1) 总能拿到最新值；把 count 加入依赖会每秒重建定时器；setTimeout 只执行一次；setter 不能随便移到组件外。"
    },
    {
      "id": "auth-choice",
      "subject": "api-auth",
      "type": "choice",
      "points": 2,
      "title": "JWT 过期应该返回什么？",
      "prompt": "客户端携带的 JWT 已过期，API 最合适的响应状态码是？",
      "options": [
        {
          "text": "200，并在 body 里写 ok:false"
        },
        {
          "text": "401 Unauthorized"
        },
        {
          "text": "403 Forbidden"
        },
        {
          "text": "500 Internal Server Error"
        }
      ],
      "answer": 1,
      "explain": "401 表示请求没有有效身份凭证，过期 token 正属于这一类。403 是身份有效但没权限；200 会让客户端误以为成功；500 是服务端错误，不是认证失败。"
    },
    {
      "id": "api-auth-command",
      "subject": "api-auth",
      "type": "command",
      "points": 2,
      "title": "带 Bearer Token 调受保护接口",
      "prompt": "本地接口要求 Authorization: Bearer <token>。你想用 curl 发 GET 请求验证 /api/me，选哪条？",
      "options": [
        {
          "text": "带 Bearer 头请求",
          "code": "curl -H \"Authorization: Bearer $TOKEN\" http://localhost:8080/api/me"
        },
        {
          "text": "用 POST 发空请求",
          "code": "curl -X POST http://localhost:8080/api/me"
        },
        {
          "text": "只放 token 不放 Bearer",
          "code": "curl -H \"Authorization: $TOKEN\" https://localhost:8080/api/me"
        },
        {
          "text": "把 token 当请求体",
          "code": "curl -d \"$TOKEN\" http://localhost:8080/api/me"
        }
      ],
      "answer": 0,
      "explain": "受保护接口需要 GET + Authorization 头，格式是 Bearer 加空格加 token，并且本地服务用 http；POST、缺少 Bearer、把 token 放 body 都不符合接口约定。",
      "code": "$ curl -i http://localhost:8080/api/me\nHTTP/1.1 401 Unauthorized"
    },
    {
      "id": "auth-debug",
      "subject": "api-auth",
      "type": "debug",
      "points": 6,
      "title": "管理员权限为什么能被伪造？",
      "prompt": "任何客户端都能调用删除接口，因为权限判断信任了请求体。选正确修复。",
      "code": "app.post('/admin/delete', (req, res) => {\n  const role = req.body.role;\n  if (role === 'admin') return deleteAll();\n  res.status(403).end();\n});",
      "options": [
        {
          "text": "从已验签的 token/session 读取角色，并在服务端校验",
          "code": "const claims = verifyJwt(req.headers.authorization);\nif (claims.role !== 'admin') return res.status(403).end();"
        },
        {
          "text": "把角色放进 URL 查询参数",
          "code": "const role = req.query.role;"
        },
        {
          "text": "前端隐藏管理员按钮"
        },
        {
          "text": "把 role 改名为 isAdmin",
          "code": "const isAdmin = req.body.isAdmin;"
        }
      ],
      "answer": 0,
      "explain": "请求体和查询参数都由客户端控制，不能作为权限依据。必须从服务端验签后的 token/session 取角色，并在真正执行删除前做服务端授权。隐藏按钮只是 UI，不是安全边界。"
    },
    {
      "id": "testing-choice",
      "subject": "testing",
      "type": "choice",
      "points": 2,
      "title": "测试金字塔的底座是什么？",
      "prompt": "测试金字塔中，数量最多、运行最快、反馈最直接的通常是哪一层？",
      "options": [
        {
          "text": "端到端测试"
        },
        {
          "text": "单元测试"
        },
        {
          "text": "手工回归"
        },
        {
          "text": "压力测试"
        }
      ],
      "answer": 1,
      "explain": "单元测试隔离小、跑得快、定位准，应该最多。端到端测试覆盖真实链路但慢且脆；手工回归和压测都不能作为日常快速回归的底座。"
    },
    {
      "id": "testing-command",
      "subject": "testing",
      "type": "command",
      "points": 2,
      "title": "只运行一个失败的测试文件",
      "prompt": "你在改订单模块，只想运行 src/order.test.js，并看到断言失败详情。选哪条？",
      "options": [
        {
          "text": "安装依赖",
          "code": "npm install"
        },
        {
          "text": "启动开发服务",
          "code": "npm run dev"
        },
        {
          "text": "单文件运行 Jest",
          "code": "npx jest src/order.test.js --runInBand"
        },
        {
          "text": "直接用 node 执行测试文件",
          "code": "node src/order.test.js"
        }
      ],
      "answer": 2,
      "explain": "Jest 的单文件运行方式是 npx jest 文件路径；--runInBand 让测试串行执行，输出更清楚。npm install 只装依赖，npm run dev 起服务，node 直接执行测试文件通常缺少测试框架上下文。",
      "code": "FAIL src/order.test.js\n  ● calculates total with discount"
    },
    {
      "id": "testing-debug",
      "subject": "testing",
      "type": "debug",
      "points": 6,
      "title": "这个异步测试为什么失败？",
      "prompt": "断言总是失败，因为 fetchUser 返回 Promise。选正确补丁。",
      "code": "it('returns user name', () => {\n  const result = fetchUser(1);\n  expect(result.name).toBe('Ada');\n});",
      "options": [
        {
          "text": "把测试改成 async，并 await 结果",
          "code": "it('returns user name', async () => {\n  const result = await fetchUser(1);\n  expect(result.name).toBe('Ada');\n});"
        },
        {
          "text": "把 toBe 改成 toEqual",
          "code": "expect(result.name).toEqual('Ada');"
        },
        {
          "text": "给 fetchUser 套一层 jest.fn()",
          "code": "const fetchUser = jest.fn();"
        },
        {
          "text": "直接在 Promise 上取属性",
          "code": "expect(result.name).resolves.toBe('Ada');"
        }
      ],
      "answer": 0,
      "explain": "fetchUser 返回 Promise，result.name 是 undefined。必须 await 后再断言；toEqual 不改变对象类型；只 mock 不 await 仍然拿不到值；resolves 要用在 Promise 本身，而不是 result.name。"
    },
    {
      "id": "devops-choice",
      "subject": "devops",
      "type": "choice",
      "points": 2,
      "title": "Dockerfile 为什么要先拷 lockfile？",
      "prompt": "Dockerfile 先 COPY package*.json，再 RUN npm ci，最后 COPY . .。这样做的主要目的是？",
      "options": [
        {
          "text": "让依赖层在源码变化时仍能命中构建缓存"
        },
        {
          "text": "减少镜像里的 Node 版本"
        },
        {
          "text": "自动生成 package-lock.json"
        },
        {
          "text": "让容器不需要 EXPOSE"
        }
      ],
      "answer": 0,
      "explain": "Docker 按层缓存。依赖清单没变时，npm ci 这一层可以复用；只有业务源码变化时，才执行最后的 COPY . .。这不改变 Node 版本，也不会自动生成 lockfile，更不替代 EXPOSE。"
    },
    {
      "id": "devops-command",
      "subject": "devops",
      "type": "command",
      "points": 2,
      "title": "改完 Dockerfile 后重建服务",
      "prompt": "刚修改 Dockerfile 和 compose.yml，想让服务在后台用新镜像重建并启动，选哪条？",
      "options": [
        {
          "text": "停掉服务栈",
          "code": "docker compose down"
        },
        {
          "text": "重建并后台启动",
          "code": "docker compose up -d --build"
        },
        {
          "text": "跟踪服务日志",
          "code": "docker compose logs -f"
        },
        {
          "text": "列出容器状态",
          "code": "docker compose ps"
        }
      ],
      "answer": 1,
      "explain": "docker compose up -d --build 会先重建镜像再后台启动；down 只停服务，logs 只看日志，ps 只列状态，都不会应用 Dockerfile 改动。"
    },
    {
      "id": "devops-debug",
      "subject": "devops",
      "type": "debug",
      "points": 6,
      "title": "容器端口映射了，为什么还是拒绝连接？",
      "prompt": "容器映射 -p 3000:3000，宿主机 curl 仍 connection refused。服务代码在容器里这样启动。选正确补丁。",
      "code": "app.listen(3000, '127.0.0.1', () => {\n  console.log('listening on 3000');\n});",
      "options": [
        {
          "text": "绑定所有网卡，而不是容器 loopback",
          "code": "app.listen(3000, '0.0.0.0', () => {"
        },
        {
          "text": "继续绑定 localhost，只换端口",
          "code": "app.listen(80, 'localhost', () => {"
        },
        {
          "text": "只在 Dockerfile 里加 EXPOSE 3000"
        },
        {
          "text": "把端口改成 80，继续绑定 127.0.0.1",
          "code": "app.listen(80, '127.0.0.1', () => {"
        }
      ],
      "answer": 0,
      "explain": "端口映射把流量送到容器网卡，但服务只监听 127.0.0.1 时，容器外访问不到。应绑定 0.0.0.0。EXPOSE 只是元数据，不改变监听地址；换端口或继续绑 loopback 都无效。"
    },
    {
      "id": "security-choice",
      "subject": "security-performance",
      "type": "choice",
      "points": 2,
      "title": "哪种写法最容易 SQL 注入？",
      "prompt": "下面哪种查询写法最容易导致 SQL 注入？",
      "options": [
        {
          "text": "参数化查询：WHERE email = ?"
        },
        {
          "text": "字符串拼接：WHERE email = ' + email + '"
        },
        {
          "text": "ORM 的对象条件：where({ email })"
        },
        {
          "text": "存储过程 + 参数"
        }
      ],
      "answer": 1,
      "explain": "把外部输入直接拼进 SQL，用户输入会被当成 SQL 语法。参数化查询、ORM 条件对象、带参数的存储过程都能把数据和语法分开，是正确方向。"
    },
    {
      "id": "security-performance-command",
      "subject": "security-performance",
      "type": "command",
      "points": 2,
      "title": "只读排查硬编码密码",
      "prompt": "接手一个仓库，想先排查是否有硬编码 password 字符串，同时排除 node_modules。哪条命令最合适？",
      "options": [
        {
          "text": "从根目录递归搜索",
          "code": "grep -R \"password\" /"
        },
        {
          "text": "给项目目录放开 777",
          "code": "chmod -R 777 ."
        },
        {
          "text": "强制推送覆盖远端",
          "code": "git push --force"
        },
        {
          "text": "限定项目并排除 node_modules",
          "code": "rg -n \"password\" --glob \"!node_modules\""
        }
      ],
      "answer": 3,
      "explain": "rg 默认递归且尊重忽略规则，--glob 排除依赖目录，-n 显示行号，整个过程只读；从根目录 grep 太吵，chmod 777 和 force push 都不是排查手段。"
    },
    {
      "id": "security-debug",
      "subject": "security-performance",
      "type": "debug",
      "points": 6,
      "title": "登录查询怎么修？",
      "prompt": "这是用户登录查询，email 直接来自请求参数。选最安全的修复。",
      "code": "const sql = \"SELECT * FROM users WHERE email = '\" + email + \"'\";\ndb.query(sql);",
      "options": [
        {
          "text": "改成参数化查询，让驱动处理转义",
          "code": "db.query('SELECT * FROM users WHERE email = ?', [email]);"
        },
        {
          "text": "手动删掉引号再拼接",
          "code": "const safe = email.replace(/['\"]/g, '');\ndb.query(sql);"
        },
        {
          "text": "先做 URL 编码再拼接",
          "code": "const safe = encodeURIComponent(email);"
        },
        {
          "text": "把字段改成 SELECT *，少写条件"
        }
      ],
      "answer": 0,
      "explain": "参数化查询把 SQL 结构和用户输入分开，驱动会安全处理参数。手写过滤引号、URL 编码都不是 SQL 上下文的安全转义；SELECT * 只会扩大泄露面。"
    },
    {
      "id": "capstone-choice",
      "subject": "capstone",
      "type": "choice",
      "points": 2,
      "title": "什么证据才算“能交付”？",
      "prompt": "项目上线验收时，哪组证据最能证明“真的能交付”？",
      "options": [
        {
          "text": "几张截图 + 口头说完成了"
        },
        {
          "text": "可复现的启动命令、测试结果、线上地址和 README"
        },
        {
          "text": "代码总行数统计"
        },
        {
          "text": "设计稿数量"
        }
      ],
      "answer": 1,
      "explain": "交付要看可复现、可验证、可接手：别人能按 README 启动，测试能跑，线上地址能访问，关键行为有证据。截图、行数、设计稿数量都不能单独证明系统能运行。"
    },
    {
      "id": "capstone-command",
      "subject": "capstone",
      "type": "command",
      "points": 2,
      "title": "先验证服务健康接口",
      "prompt": "Compose 栈已启动，网关在 8080。想用一条命令确认 /health 返回 2xx，且失败时命令以非 0 退出，选哪条？",
      "options": [
        {
          "text": "失败即报错并请求健康接口",
          "code": "curl -f http://localhost:8080/health"
        },
        {
          "text": "只发 HEAD 到根路径",
          "code": "curl -I http://localhost:8080/"
        },
        {
          "text": "停掉整个栈",
          "code": "docker compose down"
        },
        {
          "text": "只看容器列表",
          "code": "docker compose ps"
        }
      ],
      "answer": 0,
      "explain": "curl -f 遇到 HTTP 4xx/5xx 会返回非 0 退出码，正好适合脚本健康检查；根路径 HEAD 不代表 /health，down 会停服务，ps 只能看容器状态，不能验证应用是否真的健康。",
      "code": "$ curl http://localhost:8080/health\ncurl: (7) Failed to connect to localhost port 8080"
    },
    {
      "id": "capstone-debug",
      "subject": "capstone",
      "type": "debug",
      "points": 6,
      "title": "数据库没就绪，API 为什么启动失败？",
      "prompt": "部署时 API 偶尔在数据库还没准备好时启动，迁移失败。看 compose 配置，选正确修复。",
      "code": "services:\n  api:\n    build: .\n    depends_on:\n      - db\n    ports:\n      - \"3000:3000\"\n  db:\n    image: postgres:16",
      "options": [
        {
          "text": "给 db 加 healthcheck，等 service_healthy 再启动 API，迁移保留重试",
          "code": "depends_on:\n  db:\n    condition: service_healthy"
        },
        {
          "text": "删掉 depends_on",
          "code": "services:\n  api:\n    build: ."
        },
        {
          "text": "把 PostgreSQL 换成 SQLite"
        },
        {
          "text": "给 api 加 restart: always",
          "code": "restart: always"
        }
      ],
      "answer": 0,
      "explain": "depends_on 默认只保证启动顺序，不保证数据库可接受连接。给 db 配 healthcheck，并用 condition: service_healthy 才是真正的就绪门禁；启动迁移再加重试更稳。删依赖、换 SQLite、无限重启都只是掩盖问题。"
    }
  ]
};

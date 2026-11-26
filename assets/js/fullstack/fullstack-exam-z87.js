/* z87 · 全栈结业考试扩容：30 → 60 题，10 科各 6 题，总分仍 100。
   每科：2 道知识选择（各 1 分）+ 2 道终端指令（各 1 分）+ 2 道代码改错（各 3 分）= 10 分。 */
(function (DATA) {
  if (!DATA || !Array.isArray(DATA.questions)) return;
  /* 全部 60 题统一：选择 1、指令 1、改错 3；单科 2+2+6=10。 */
  DATA.questions.forEach(function (q) {
    q.points = q.type === 'choice' ? 1 : q.type === 'command' ? 1 : 3;
  });

  var extra = [
    /* foundation */
    { id:'foundation-choice-2', subject:'foundation', type:'choice', points:1,
      title:'共享分支上撤销一次错误提交',
      prompt:'错误提交已经 push 到共享的 main，团队其他人可能已经拉取。最稳妥的撤销方式是？',
      options:[
        {text:'git reset --hard 到上一个提交，再 force push'},
        {text:'git revert 生成一个反向提交，再正常 push'},
        {text:'删除 .git 目录重新 clone'},
        {text:'直接改文件再 amend 那个旧提交'}
      ], answer:1,
      explain:'共享历史不要 force push。git revert 生成一个新的反向提交，保留历史且对所有人安全；reset + force 会重写远端，amend 旧提交也会分叉。' },
    { id:'foundation-command-2', subject:'foundation', type:'command', points:1,
      title:'只看已暂存的改动',
      prompt:'你已经 git add 了一部分文件，想在提交前只看“已暂存”的 diff，选哪条命令？',
      options:[
        {text:'查看工作区全部改动', code:'git diff'},
        {text:'只看已暂存改动', code:'git diff --staged'},
        {text:'查看提交历史', code:'git log --oneline -5'},
        {text:'查看未跟踪文件', code:'git ls-files --others'}
      ], answer:1,
      explain:'git diff 默认只显示未暂存改动；--staged（同 --cached）显示 index 与 HEAD 的差异，正好是下次提交的内容。' },
    { id:'foundation-debug-2', subject:'foundation', type:'debug', points:3,
      title:'.gitignore 为什么不生效？',
      prompt:'.env 已经被提交过，后来才加进 .gitignore，仍然出现在 git status。正确修法是？',
      code:'$ git status\nmodified: .env\n$ cat .gitignore\n.env',
      options:[
        {text:'从索引移除但保留本地文件', code:'git rm --cached .env'},
        {text:'删除本地 .env 文件', code:'rm .env'},
        {text:'把 .gitignore 也删掉', code:'rm .gitignore'},
        {text:'强制添加 .env', code:'git add -f .env'}
      ], answer:0,
      explain:'.gitignore 只影响未跟踪文件。已经被 Git 跟踪的文件要先 git rm --cached 移出索引，保留工作区文件，再提交删除记录，之后 ignore 才会生效。' },

    /* network */
    { id:'network-choice-2', subject:'network', type:'choice', points:1,
      title:'域名解析失败还是连接被拒？',
      prompt:'浏览器报 getaddrinfo ENOTFOUND api.example.com。最可能的原因层级是？',
      options:[
        {text:'DNS 解析没有拿到地址'},
        {text:'TCP 端口没有进程监听'},
        {text:'TLS 证书过期'},
        {text:'HTTP 返回 500'}
      ], answer:0,
      explain:'ENOTFOUND 是解析阶段失败，说明域名没有解析到 IP；connection refused 才是连到了主机但端口拒绝。证书和 500 都发生在更后面的阶段。' },
    { id:'network-command-2', subject:'network', type:'command', points:1,
      title:'谁在监听 3000 端口',
      prompt:'Linux 服务器上想看到监听 3000 端口的进程和 PID，选哪条命令？',
      options:[
        {text:'只列 TCP 监听并过滤 3000', code:"ss -ltnp 'sport = :3000'"},
        {text:'查看路由表', code:'ip route'},
        {text:'测试 DNS', code:'dig localhost'},
        {text:'查看所有已建立连接', code:'ss -tn'}
      ], answer:0,
      explain:'ss -l 只看 listening，-t 限定 TCP，-n 显示数字端口，-p 显示进程；再按 sport=:3000 过滤即可定位占用者。' },
    { id:'network-debug-2', subject:'network', type:'debug', points:3,
      title:'Nginx 502 是上游端口写错了',
      prompt:'应用监听 3000，Nginx 返回 502。看配置，选正确修复。',
      code:'location /api/ {\n  proxy_pass http://127.0.0.1:3001;\n}',
      options:[
        {text:'把 upstream 端口改成应用真实端口', code:'proxy_pass http://127.0.0.1:3000;'},
        {text:'把 proxy_pass 改成静态文件路径', code:'root /var/www/html;'},
        {text:'给 Nginx 加 777 权限', code:'chmod -R 777 /etc/nginx'},
        {text:'重启数据库', code:'systemctl restart postgresql'}
      ], answer:0,
      explain:'502 表示 Nginx 连不上上游。应用在 3000，配置却指向 3001，改回 3000 即可；静态 root、权限和数据库都不解决上游连接。' },

    /* database */
    { id:'database-choice-2', subject:'database', type:'choice', points:1,
      title:'哪种隔离级别能避免不可重复读？',
      prompt:'同一事务内两次读取同一行，想避免中途被其他事务改掉，至少需要哪种隔离级别？',
      options:[
        {text:'Read Uncommitted'},
        {text:'Read Committed'},
        {text:'Repeatable Read'},
        {text:'不需要隔离级别'}
      ], answer:2,
      explain:'不可重复读是同一事务两次读到不同版本。Repeatable Read 保证事务内同一行快照稳定；Read Committed 每次读都可能看到新提交。' },
    { id:'database-command-2', subject:'database', type:'command', points:1,
      title:'看真实执行计划',
      prompt:'一条慢查询想看到优化器选择的索引、行数和实际耗时，选哪条？',
      options:[
        {text:'查看表的列定义', code:'\\d orders'},
        {text:'执行并显示实际计划', code:'EXPLAIN ANALYZE SELECT * FROM orders WHERE user_id = 42;'},
        {text:'只列出数据库', code:'SHOW DATABASES;'},
        {text:'删除查询缓存', code:'RESET QUERY CACHE;'}
      ], answer:1,
      explain:'EXPLAIN 只给估算计划；EXPLAIN ANALYZE 会真正执行并给出 actual rows/time，能确认索引是否命中以及哪一步最慢。' },
    { id:'database-debug-2', subject:'database', type:'debug', points:3,
      title:'两个事务为什么互相等锁？',
      prompt:'转账事务 A 先锁账户 1 再锁 2，事务 B 先锁 2 再锁 1，频繁死锁。最有效的修复是？',
      code:'-- A\nUPDATE accounts SET balance=balance-10 WHERE id=1;\nUPDATE accounts SET balance=balance+10 WHERE id=2;\n-- B\nUPDATE accounts SET balance=balance-10 WHERE id=2;\nUPDATE accounts SET balance=balance+10 WHERE id=1;',
      options:[
        {text:'两个事务都按账户 id 升序加锁', code:'UPDATE ... WHERE id IN (1,2) ORDER BY id;'},
        {text:'把事务隔离级别降到 Read Uncommitted'},
        {text:'给两个表都加 777 权限'},
        {text:'把死锁异常全部 catch 后忽略'}
      ], answer:0,
      explain:'死锁来自相反的加锁顺序。统一按 id 升序（或一次性按顺序）加锁可以打破循环等待；降隔离级别、权限和吞异常都不解决锁顺序。' },

    /* backend */
    { id:'backend-choice-2', subject:'backend', type:'choice', points:1,
      title:'支付接口重试怎么防重复扣款？',
      prompt:'客户端超时后会重试同一个支付请求，服务端应优先采用哪种机制？',
      options:[
        {text:'让客户端不要重试'},
        {text:'幂等键 + 唯一约束/去重表'},
        {text:'把接口改成 GET'},
        {text:'每次重试都新建订单'}
      ], answer:1,
      explain:'网络超时不代表服务端没处理。客户端带同一个幂等键，服务端用唯一约束或去重表保证只处理一次；禁止重试不现实，GET 改语义更危险。' },
    { id:'backend-command-2', subject:'backend', type:'command', points:1,
      title:'带 JSON 调接口并看响应头',
      prompt:'想 POST 一个 JSON 并同时看到状态码和响应头，选哪条 curl？',
      options:[
        {text:'发送 JSON 并显示响应头', code:"curl -i -X POST http://localhost:3000/api/orders -H 'Content-Type: application/json' -d '{\"sku\":\"A1\"}'"},
        {text:'只看首页', code:'curl http://localhost:3000/'},
        {text:'只解析 DNS', code:'dig localhost'},
        {text:'只列容器', code:'docker ps'}
      ], answer:0,
      explain:'-i 输出响应头，-X POST 指定方法，-H 设置 Content-Type，-d 传 JSON 体，一条命令能同时验证请求和响应。' },
    { id:'backend-debug-2', subject:'backend', type:'debug', points:3,
      title:'req.body 为什么是 undefined？',
      prompt:'Express 的 POST /users 收到请求但 req.body 为 undefined。看代码，选正确修复。',
      code:'const express = require("express");\nconst app = express();\napp.post("/users", (req, res) => {\n  console.log(req.body);\n  res.json({ ok: true });\n});',
      options:[
        {text:'在路由前注册 JSON 解析中间件', code:'app.use(express.json());'},
        {text:'把 POST 改成 GET', code:'app.get("/users", ...)'},
        {text:'给 express 加 777 权限', code:'chmod -R 777 node_modules'},
        {text:'删掉 res.json', code:'// res.json({ ok: true })'}
      ], answer:0,
      explain:'Express 默认不解析 JSON 请求体，必须在路由前 app.use(express.json())；改 GET、权限和删响应都不解决 body 解析。' },

    /* frontend */
    { id:'frontend-choice-2', subject:'frontend', type:'choice', points:1,
      title:'useEffect 里的订阅何时清理？',
      prompt:'组件里订阅了 WebSocket，组件卸载后不想继续收到消息。正确做法是？',
      options:[
        {text:'在 useEffect 返回 cleanup 函数取消订阅'},
        {text:'把订阅写在 render 里'},
        {text:'用 setTimeout 延迟订阅'},
        {text:'在组件外全局订阅一次永不清理'}
      ], answer:0,
      explain:'useEffect 的返回函数会在依赖变化或卸载时执行，适合取消订阅、清定时器；写在 render 会重复订阅，全局永不清理会泄漏。' },
    { id:'frontend-command-2', subject:'frontend', type:'command', points:1,
      title:'让 Vite 监听局域网',
      prompt:'想让手机在同一局域网访问 Vite 开发服务器，选哪条启动命令？',
      options:[
        {text:'指定 host 启动', code:'npx vite --host 0.0.0.0'},
        {text:'只构建生产包', code:'npx vite build'},
        {text:'只预览构建结果', code:'npx vite preview'},
        {text:'安装依赖', code:'npm install'}
      ], answer:0,
      explain:'Vite 默认只监听 localhost；--host 0.0.0.0 绑定所有网卡，手机才能通过电脑局域网 IP 访问。' },
    { id:'frontend-debug-2', subject:'frontend', type:'debug', points:3,
      title:'定时器里的计数为什么一直是 1？',
      prompt:'点击后计数只加到 1，interval 每次读到的都是旧 count。选正确补丁。',
      code:'const [count, setCount] = useState(0);\nuseEffect(() => {\n  const id = setInterval(() => setCount(count + 1), 1000);\n  return () => clearInterval(id);\n}, []);',
      options:[
        {text:'用函数式更新避免读旧闭包', code:'setCount(c => c + 1);'},
        {text:'把 interval 改成 0 毫秒', code:'setInterval(..., 0)'},
        {text:'删掉 clearInterval', code:'// return () => clearInterval(id)'},
        {text:'把 useState 改成 useRef'}
      ], answer:0,
      explain:'effect 依赖为空时闭包捕获的是初始 count=0，每次都 setCount(1)。函数式更新 c=>c+1 总能拿到最新值；缩短间隔、不清定时器都更糟。' },

    /* api-auth */
    { id:'auth-choice-2', subject:'api-auth', type:'choice', points:1,
      title:'401 和 403 怎么区分？',
      prompt:'用户已登录，但访问管理员接口被拒绝。最合适的响应码是？',
      options:[
        {text:'401 Unauthorized'},
        {text:'403 Forbidden'},
        {text:'302 重定向到首页'},
        {text:'500 Internal Server Error'}
      ], answer:1,
      explain:'401 表示没有认证或凭证无效；403 表示已认证但权限不足。已登录用户访问管理员接口应返回 403。' },
    { id:'auth-command-2', subject:'api-auth', type:'command', points:1,
      title:'带 Bearer Token 调受保护接口',
      prompt:'环境变量 TOKEN 已存好，想带 Bearer 头请求 /me，选哪条？',
      options:[
        {text:'带 Authorization 头', code:'curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/me'},
        {text:'把 token 放 URL', code:'curl "http://localhost:3000/me?token=$TOKEN"'},
        {text:'不带任何头', code:'curl http://localhost:3000/me'},
        {text:'只发 OPTIONS', code:'curl -X OPTIONS http://localhost:3000/me'}
      ], answer:0,
      explain:'标准做法是 Authorization: Bearer <token>。token 放 URL 会进日志和 Referer，不带头会 401，OPTIONS 只是预检。' },
    { id:'auth-debug-2', subject:'api-auth', type:'debug', points:3,
      title:'JWT 为什么能被改成管理员？',
      prompt:'后端直接信任 token 里的 role，用户改 payload 就变管理员。正确修复是？',
      code:'const payload = jwt.decode(token);\nif (payload.role === "admin") grantAdmin();',
      options:[
        {text:'验签并校验算法后再读角色', code:'const payload = jwt.verify(token, SECRET, { algorithms: ["HS256"] });'},
        {text:'只把 token 存 localStorage', code:'localStorage.setItem("token", token)'},
        {text:'把 role 改成前端隐藏字段', code:'<input type="hidden" name="role">'},
        {text:'加长 token 字符串', code:'token = token + "x".repeat(100)'}
      ], answer:0,
      explain:'jwt.decode 只解码不验签，攻击者可改 payload。必须 jwt.verify 并用固定算法校验签名，角色应以服务端可信数据为准。' },

    /* testing */
    { id:'testing-choice-2', subject:'testing', type:'choice', points:1,
      title:'测试之间为什么要隔离？',
      prompt:'一个测试改了全局数据库，导致另一个测试偶发失败。最根本的修复原则是？',
      options:[
        {text:'每个测试自建并清理自己的数据'},
        {text:'把失败测试删掉'},
        {text:'让测试按固定顺序执行'},
        {text:'把所有测试合并成一个'}
      ], answer:0,
      explain:'测试应独立、可重复。每个测试准备自己的数据并在结束后清理，避免共享状态和顺序依赖；删测试、固定顺序、合并都只是掩盖不稳定。' },
    { id:'testing-command-2', subject:'testing', type:'command', points:1,
      title:'只跑一个 Vitest 文件',
      prompt:'项目用 Vitest，只想运行 tests/cart.test.js，选哪条？',
      options:[
        {text:'指定文件运行', code:'npx vitest run tests/cart.test.js'},
        {text:'跑全部并 watch', code:'npx vitest'},
        {text:'只构建', code:'npm run build'},
        {text:'列出依赖', code:'npm ls'}
      ], answer:0,
      explain:'vitest run 进入单次运行模式，后面的路径限定测试文件；不带 run 默认 watch 全部。' },
    { id:'testing-debug-2', subject:'testing', type:'debug', points:3,
      title:'异步测试为什么总在断言前结束？',
      prompt:'测试里调用了异步函数但没有等待，断言在数据返回前就执行。选正确补丁。',
      code:'it("loads user", () => {\n  fetchUser(1).then(user => {\n    expect(user.name).toBe("Ada");\n  });\n});',
      options:[
        {text:'把测试改成 async 并 await', code:'it("loads user", async () => {\n  const user = await fetchUser(1);\n  expect(user.name).toBe("Ada");\n});'},
        {text:'把 expect 移到 then 外', code:'expect(true).toBe(true);'},
        {text:'增加 setTimeout 10 秒', code:'setTimeout(() => {}, 10000)'},
        {text:'删掉断言', code:'// expect(...)'}
      ], answer:0,
      explain:'测试函数必须返回 Promise 或用 async/await，测试框架才会等异步完成；只靠 then 而不 return，测试会提前结束并通过。' },

    /* devops */
    { id:'devops-choice-2', subject:'devops', type:'choice', points:1,
      title:'多阶段构建主要解决什么？',
      prompt:'Node 应用镜像很大，想只把构建产物和运行时依赖带进最终镜像。优先用？',
      options:[
        {text:'多阶段 Dockerfile，构建阶段与运行阶段分离'},
        {text:'把所有文件都 COPY 进去'},
        {text:'给镜像加 latest 标签'},
        {text:'在容器里装 777 权限'}
      ], answer:0,
      explain:'多阶段构建先用带编译工具的阶段构建，再 COPY --from 只复制产物到精简运行镜像，能显著减小体积和攻击面。' },
    { id:'devops-command-2', subject:'devops', type:'command', points:1,
      title:'改完 Dockerfile 重建并启动',
      prompt:'Compose 里改了 api 的 Dockerfile，想让 api 重新构建并后台启动，选哪条？',
      options:[
        {text:'重建 api 并后台启动', code:'docker compose up -d --build api'},
        {text:'只停所有服务', code:'docker compose down'},
        {text:'只看日志', code:'docker compose logs api'},
        {text:'只列镜像', code:'docker images'}
      ], answer:0,
      explain:'up -d --build api 会重建 api 镜像并在后台启动；down 只停服务，logs/images 不会应用新构建。' },
    { id:'devops-debug-2', subject:'devops', type:'debug', points:3,
      title:'健康检查为什么一直 unhealthy？',
      prompt:'容器内应用监听 3000，健康检查却请求 3001，容器一直 unhealthy。选正确修复。',
      code:'healthcheck:\n  test: ["CMD", "wget", "-qO-", "http://localhost:3001/health"]\n  interval: 10s',
      options:[
        {text:'把健康检查端口改成 3000', code:'test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]'},
        {text:'把 interval 改成 1s', code:'interval: 1s'},
        {text:'删掉 healthcheck', code:'# healthcheck: ...'},
        {text:'给容器加 restart: always', code:'restart: always'}
      ], answer:0,
      explain:'健康检查请求的端口必须与应用监听一致，3001 没有服务所以一直失败；缩短间隔、删检查、无限重启都不能让它变健康。' },

    /* security-performance */
    { id:'security-choice-2', subject:'security-performance', type:'choice', points:1,
      title:'怎样避免 SQL 注入？',
      prompt:'用户输入要拼进查询条件，最安全的写法是？',
      options:[
        {text:'字符串拼接用户输入'},
        {text:'参数化查询/预编译语句'},
        {text:'只在前端做转义'},
        {text:'把 SQL 放到隐藏字段'}
      ], answer:1,
      explain:'参数化查询把数据和 SQL 结构分离，是防注入的根本手段；前端转义可绕过，隐藏字段和后端拼接都不安全。' },
    { id:'security-performance-command-2', subject:'security-performance', type:'command', points:1,
      title:'只读搜索硬编码密钥',
      prompt:'想在仓库里只读查找可能的 API_KEY 硬编码，选哪条？',
      options:[
        {text:'搜索密钥关键字', code:'git grep -n -E "API_KEY|SECRET_KEY"'},
        {text:'删除所有配置文件', code:'rm -rf config'},
        {text:'把仓库权限改成 777', code:'chmod -R 777 .'},
        {text:'推送所有分支', code:'git push --all'}
      ], answer:0,
      explain:'git grep 只读搜索已跟踪内容，适合排查硬编码；删除配置、改权限、推送都不能发现或修复泄露。' },
    { id:'security-debug-2', subject:'security-performance', type:'debug', points:3,
      title:'登录接口为什么能被无限爆破？',
      prompt:'登录接口没有频率限制，攻击者可无限尝试密码。选正确的防护补丁。',
      code:'app.post("/login", async (req, res) => {\n  const user = await verify(req.body.email, req.body.password);\n  res.json({ token: sign(user) });\n});',
      options:[
        {text:'按 IP/账号加限流与失败退避', code:'app.use("/login", rateLimit({ windowMs: 60000, max: 5 }));'},
        {text:'把密码长度限制为 4 位', code:'if (password.length > 4) reject()'},
        {text:'把错误信息改成 200', code:'res.status(200).json({ ok: false })'},
        {text:'把 token 有效期改成 10 年', code:'expiresIn: "10y"'}
      ], answer:0,
      explain:'限流和失败退避能显著降低在线爆破速度，配合账号锁定/验证码更稳；缩短密码、伪装 200、延长 token 都会削弱安全。' },

    /* capstone */
    { id:'capstone-choice-2', subject:'capstone', type:'choice', points:1,
      title:'什么才算“可交付”？',
      prompt:'毕业项目要交给别人验收，哪组证据最完整？',
      options:[
        {text:'截图 + 口头说“我本地能跑”'},
        {text:'可复现启动步骤 + 自动化测试 + 健康检查 + 关键日志'},
        {text:'只有一份 PPT'},
        {text:'源代码压缩包，没有 README'}
      ], answer:1,
      explain:'可交付要让别人能复现、验证和排障：启动步骤、测试、健康检查、日志和已知限制缺一不可；截图、PPT、无文档压缩包都不够。' },
    { id:'capstone-command-2', subject:'capstone', type:'command', points:1,
      title:'只看 API 最近 100 行日志',
      prompt:'Compose 栈里只要看 api 服务最近 100 行日志，选哪条？',
      options:[
        {text:'跟踪 api 最近 100 行', code:'docker compose logs --tail=100 api'},
        {text:'重建所有服务', code:'docker compose up -d --build'},
        {text:'停止并删除所有容器', code:'docker compose down -v'},
        {text:'列出所有镜像', code:'docker images'}
      ], answer:0,
      explain:'logs --tail=100 api 只读 api 的最近 100 行，适合快速排障；其他命令会改状态或看不到应用日志。' },
    { id:'capstone-debug-2', subject:'capstone', type:'debug', points:3,
      title:'迁移为什么在数据库就绪前执行？',
      prompt:'API 启动时立即跑迁移，但 Postgres 还没接受连接。选最稳的 compose 修复。',
      code:'services:\n  api:\n    depends_on:\n      - db\n    command: sh -c "npm run migrate && npm start"\n  db:\n    image: postgres:16',
      options:[
        {text:'给 db 加健康检查，等 service_healthy 再启动 API', code:'depends_on:\n  db:\n    condition: service_healthy'},
        {text:'删掉 depends_on', code:'# depends_on removed'},
        {text:'把迁移命令删掉', code:'command: npm start'},
        {text:'给 api 加 restart: always', code:'restart: always'}
      ], answer:0,
      explain:'depends_on 默认只保证容器启动顺序，不保证数据库可连接。healthcheck + condition: service_healthy 才是真正的就绪门禁；删依赖、删迁移、无限重启都只是掩盖问题。' }
  ];

  DATA.questions.push.apply(DATA.questions, extra);
  DATA.version = '20261126z87';
  DATA.duration = '建议 120 分钟';
  DATA.subtitle = '10 个科目，每科两道知识选择、两道终端指令、两道代码改错。不只背概念，还要会用命令定位问题、修掉真实工程里的错误。';
  DATA.rules = [
    '10 个科目各 10 分：2 道知识选择各 1 分，2 道终端指令各 1 分，2 道代码改错各 3 分。',
    '每道题只有一个正确选项；改错题选一个你认为能真正修好问题的补丁。',
    '终端指令题考常用命令、参数和排障顺序，不考冷门偏门参数。',
    '提交后自动评分，给出总分、等级、10 科分项和薄弱科目。',
    '未答题按 0 分计；提交前会提示还剩多少题。',
    '答案会暂存在本机浏览器，刷新页面不会立刻丢失。'
  ];
})(window.FULLSTACK_EXAM);

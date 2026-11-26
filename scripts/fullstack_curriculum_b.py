#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Curriculum specs: frontend, API, testing, DevOps, security, capstone."""


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

MODULES_B = [
    {
        'id': 'frontend',
        'index': 3,
        'title': '前端工程',
        'en': 'FRONTEND ENGINEERING',
        'logo': 'FE',
        'accent': '#F472B6',
        'kicker': 'FRONTEND · FULL COURSE · FIVE PARTS',
        'project': '课程社区前端从一张静态页长成多页面、响应式、可测试的产品界面',
        'source': 'TypeScript 手册、React 官方文档、MDN 与前端工程实践',
        'materialLabel': 'TypeScript / React / 前端工程',
        'languageLabel': 'typescript',
        'sidebarTitle': '前端工程',
        'sidebarNote': '从类型、组件、路由、表单到请求层、响应式、可访问性、构建和测试。50 课把“会写页面”升级成“能维护的产品前端”。',
        'topics': ['TypeScript 类型与泛型', 'React / Vue 组件与状态', '路由、表单、请求层与错误态', 'Vite、构建产物与环境变量', '响应式、可访问性与交互细节'],
        'overviewSub': '前端不只是写页面。这条课从<strong>TypeScript 类型</strong>开始，走到组件、路由、表单、请求层、列表缓存、响应式、可访问性、Vite 构建与测试，最后交付一个桌面和手机都稳定的课程社区前端。',
        'outcomes': [
            {'title': '类型是接口', 'desc': '用类型描述 API 契约和组件边界，让错误在编辑器里暴露，而不是上线后才出现。'},
            {'title': '状态有归属', 'desc': '组件状态、页面状态和服务端缓存各归其位，避免一个 useState 管整个应用。'},
            {'title': '体验能验收', 'desc': '空态、错态、加载、键盘和手机布局都要有可复现的验收标准。'}
        ],
        'routeNote': '01–02 类型、组件与状态 → 03–04 路由、页面壳、表单与校验 → 05–06 请求层、错误态、列表与缓存 → 07–08 响应式、移动端、可访问性与键盘 → 09–10 Vite 构建、测试与交付。',
        'sourceNote': '示例以 React + TypeScript + Vite 为主；Vue 的等价写法在关键章节标注。',
        'parts': [
            {'title': '类型与组件', 'note': 'TypeScript、组件边界、状态与渲染'},
            {'title': '页面与表单', 'note': '路由、布局、表单、校验与请求层'},
            {'title': '数据与列表', 'note': '分页、缓存、空态、错态与并发请求'},
            {'title': '体验与构建', 'note': '响应式、可访问性、Vite 与环境变量'},
            {'title': '测试与交付', 'note': '组件测试、端到端、构建产物与发布检查'}
        ],
        'chapters': [
            C('TypeScript 类型系统',
              'TypeScript 不是“给 JS 加注释”。它用类型描述数据形状、函数契约和组件边界，让错误在编辑器里暴露。',
              ['基础类型与联合类型', '接口、type 与泛型', '类型收窄与守卫', 'API DTO 与组件 Props', '避免 any 与类型断言'],
              """type Course = { id: number; title: string; published: boolean };
type ApiResult<T> = { data: T; error?: string };

function isCourse(value: unknown): value is Course {
  return typeof value === 'object' && value !== null && 'id' in value;
}""",
              'type Course = { id: number; title: string; published: boolean }\nApiResult<Course[]> 可被编辑器检查',
              '用 any 把错误推迟到运行时；先写 unknown，再用类型守卫收窄。',
              '为课程列表 API 写出 DTO 类型、泛型响应类型和一个运行时守卫。'),
            C('组件与状态设计',
              '组件不是越拆越好。按职责和变化频率切分，把服务端数据、页面状态和局部交互状态分开管理。',
              ['展示组件与容器组件', 'props / children / 事件', 'useState 与 useReducer', '服务端缓存与本地状态', '状态提升与派生状态'],
              """type CourseCardProps = { course: Course; onOpen: (id: number) => void };
function CourseCard({ course, onOpen }: CourseCardProps) {
  return <button onClick={() => onOpen(course.id)}>{course.title}</button>;
}""",
              '<CourseCard course={course} onOpen={setActiveId} />\n点击后 activeId 更新，卡片本身不持有请求状态',
              '把所有数据塞进一个全局 store，会让任何小改动都触发全页刷新；先按数据生命周期分家。',
              '把一个课程列表拆成页面、列表、卡片三层，并说明每层持有什么状态。'),
            C('路由、布局与页面壳',
              '路由决定用户如何到达页面，页面壳决定导航、标题、加载和错误在哪里统一处理。',
              ['文件路由与手写路由', '嵌套路由与布局', '路由参数与查询串', '加载态与错误边界', '返回、面包屑与深链'],
              """<Routes>
  <Route element={<AppShell />}>
    <Route path="/courses" element={<CourseListPage />} />
    <Route path="/courses/:id" element={<CourseDetailPage />} />
  </Route>
</Routes>""",
              '/courses → CourseListPage\n/courses/42 → CourseDetailPage\n未知路径 → NotFoundPage',
              '每个页面各自写一份导航和错误提示，会出现不一致；页面壳负责共性，页面只负责内容。',
              '为课程社区设计 4 条路由、一个共享页面壳和一个 404 页面，并支持深链刷新。'),
            C('表单与校验',
              '表单是用户输入进入系统的入口。前端校验改善体验，后端校验保证安全；两边都要有，但不能互相替代。',
              ['受控与非受控输入', '字段级与表单级校验', '异步校验与防抖', '错误展示与焦点', '提交中、成功与失败'],
              """const schema = z.object({
  title: z.string().min(2, '至少 2 个字').max(120),
  priceCents: z.number().int().min(0)
});
const parsed = schema.safeParse(form);
if (!parsed.success) setErrors(parsed.error.flatten().fieldErrors);""",
              '{"title":["至少 2 个字"]}\n提交按钮在 pending 时禁用，失败后焦点回到第一个错误字段',
              '只做前端校验，用户绕过浏览器就能提交非法数据；后端必须重复校验。',
              '实现一个带字段级错误、提交中状态和失败重试的课程创建表单。'),
            C('请求层与错误态',
              '请求层要把超时、鉴权、错误格式和取消统一起来，页面只消费结果，不重复写 fetch 细节。',
              ['fetch / axios 封装', '超时与 AbortController', '鉴权头与刷新令牌', '错误码映射与提示', '加载、空态与重试'],
              """async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, { ...init, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw await toApiError(res);
  return res.json() as Promise<T>;
}""",
              'GET /api/courses → 200 数据\n500 → ApiError("INTERNAL", "服务暂时不可用")\n超时 → ApiError("TIMEOUT")',
              '每个页面直接 fetch 并各自解析错误，会出现十种提示；请求层统一错误形状。',
              '写一个请求封装，覆盖超时、401、500 和取消请求，并让页面显示可重试的错误态。'),
            C('列表、分页与缓存',
              '列表页最容易出现重复请求、页码漂移和缓存不一致。分页、排序、缓存键和失效策略要一起设计。',
              ['页码与游标分页', '查询参数与缓存键', 'React Query / SWR 缓存', '乐观更新与失效', '空结果与最后一页'],
              """const query = useQuery({
  queryKey: ['courses', page, sort],
  queryFn: () => api<Page<Course>>(`/api/courses?page=${page}&sort=${sort}`),
  staleTime: 30_000
});""",
              'queryKey: ["courses", 0, "createdAt,desc"]\n命中缓存时不重复请求；提交新课程后 invalidate ["courses"]',
              '缓存键漏掉筛选条件，会把 A 筛选的结果展示给 B；缓存键必须覆盖所有影响结果的参数。',
              '实现课程列表分页、排序和缓存，提交新课程后只失效相关列表，不整页刷新。'),
            C('响应式与移动端',
              '响应式不是把宽度写百分比。要在 390px 真实屏幕上检查导航、表格、长标题、键盘和触控目标。',
              ['移动优先与断点', 'flex / grid 布局', '溢出与长文本', '触控目标与安全区', '真机与 DevTools 检查'],
              """@media (max-width: 640px) {
  .course-grid { grid-template-columns: 1fr; }
  .course-card { min-height: 44px; padding: 14px 16px; }
  .page { padding-bottom: calc(24px + env(safe-area-inset-bottom)); }
}""",
              '390px：单列卡片；按钮高度 ≥44px；底部留出安全区；无横向滚动',
              '只看桌面截图就交付，手机上一行长标题会把页面撑出横向滚动；必须真机或 390 视口复查。',
              '把课程列表和详情在 390px 下检查一遍，修掉横向滚动、过小点击区和被键盘遮挡的表单。'),
            C('可访问性与键盘',
              '可访问性不是额外功能，是产品能不能被更多人使用。键盘、焦点、语义标签和对比度都要进入验收。',
              ['语义化 HTML 与 ARIA', '键盘 Tab 顺序', '焦点可见与焦点陷阱', '对比度与字号', '屏幕阅读器基础'],
              """<button aria-label="打开课程 后端工程" onClick={open}>
  <span aria-hidden="true">→</span>
</button>
<dialog aria-modal="true" onKeyDown={handleEsc}>...</dialog>""",
              'Tab 能依次到达导航、搜索、课程卡和关闭按钮；ESC 关闭弹层；焦点回到触发按钮',
              '用 div 当按钮会丢失键盘和语义；优先用原生 button / a，必要时再补 ARIA。',
              '用键盘完整走一遍课程列表和详情页，记录 Tab 顺序、焦点位置和至少一个修复。'),
            C('Vite、构建与环境变量',
              '开发能跑不等于能发布。构建产物、环境变量、资源路径和缓存文件名决定线上是否可控。',
              ['Vite 开发与构建', '环境变量与模式', '资源路径与 base', '代码分割与懒加载', '构建产物检查'],
              """# .env.production
VITE_API_BASE=https://course.example.com/api

npm run build
npx vite preview --host 0.0.0.0
find dist -maxdepth 2 -type f | head""",
              'dist/index.html\ndist/assets/index-7f2a.js\ndist/assets/index-9c1d.css\nVITE_API_BASE 在构建时注入，不会暴露服务端密钥',
              '把密钥写进 VITE_ 变量，会被打包进浏览器；前端环境变量只放公开配置。',
              '完成一次生产构建，检查产物路径、API 地址、代码分割和缓存文件名，并写进发布清单。'),
            C('前端测试与交付',
              '前端交付要有测试和检查清单：组件行为、关键链路、构建产物和手机布局，缺一项都靠运气。',
              ['Testing Library 组件测试', '用户行为而非实现细节', 'Mock API 与网络错误', 'Playwright 冒烟', '交付前检查清单'],
              """test('shows empty state when no courses', async () => {
  render(<CourseListPage />);
  await screen.findByText('还没有课程');
});

await page.goto('/courses');
await expect(page.getByText('后端工程')).toBeVisible();""",
              '组件测试：空列表显示“还没有课程”\nE2E：登录 → 打开课程 → 标记完成 → 刷新后仍完成',
              '只测快照会锁住实现细节，改样式就红；优先测用户能看到的行为和关键链路。',
              '为一个列表页写空态、错态和成功态测试，再补一条 Playwright 登录后浏览课程的链路。')
        ]
    },
    {
        'id': 'api-auth',
        'index': 4,
        'title': 'API 设计与身份认证',
        'en': 'API & AUTH',
        'logo': 'API',
        'accent': '#5EEAD4',
        'kicker': 'API & AUTH · FULL COURSE · FIVE PARTS',
        'project': '课程社区开放 API 同时服务 Web、移动端和第三方集成',
        'source': 'OpenAPI 3.1、OAuth 2.0、OWASP API Security 与 REST 实践',
        'materialLabel': 'OpenAPI / JWT / OAuth2',
        'languageLabel': 'http',
        'sidebarTitle': 'API 设计<br>与身份认证',
        'sidebarNote': '从资源建模、错误契约到 OpenAPI、JWT、OAuth2、RBAC、幂等、限流与审计。50 课把“能调通”升级成“能被多方安全接入”。',
        'topics': ['REST 资源建模、状态码与错误格式', 'OpenAPI 文档与接口版本', 'GraphQL、WebSocket 的适用边界', 'Session、JWT、OAuth2 与刷新令牌', 'RBAC、越权、幂等、限流与审计'],
        'overviewSub': '前后端之间的契约要能被人和机器同时读懂。这条课从<strong>REST 资源建模</strong>开始，走到状态码、OpenAPI、版本兼容、Session、JWT、OAuth2、RBAC、幂等限流和审计，最后交付一套可供 Web、移动端和第三方使用的课程社区 API。',
        'outcomes': [
            {'title': '契约先于代码', 'desc': '资源、状态码和错误格式先定清楚，前后端才能并行开发。'},
            {'title': '身份与权限分开', 'desc': '认证解决“你是谁”，授权解决“你能做什么”，越权检查要落在资源层。'},
            {'title': '开放 API 要有护栏', 'desc': '限流、幂等、审计和版本兼容，是对外接口能长期存活的底线。'}
        ],
        'routeNote': '01–02 资源建模、状态码与错误契约 → 03–04 OpenAPI、版本与兼容 → 05–06 Session、JWT 与刷新令牌 → 07–08 OAuth2、RBAC 与越权 → 09–10 幂等、限流、审计与 API 实战。',
        'sourceNote': '示例默认 HTTPS + JSON；OAuth2 只使用公开测试客户端，不在正文放置真实密钥。',
        'parts': [
            {'title': '契约设计', 'note': '资源建模、状态码、错误格式、OpenAPI 与版本'},
            {'title': '身份认证', 'note': 'Session、Cookie、JWT、刷新令牌与 OAuth2'},
            {'title': '授权治理', 'note': 'RBAC、资源级越权、幂等、限流与审计'},
            {'title': '边界与扩展', 'note': 'GraphQL、WebSocket、第三方接入与兼容策略'},
            {'title': '综合实战', 'note': '从契约到上线：一套可被三方接入的课程社区 API'}
        ],
        'chapters': [
            C('REST 资源建模',
              'REST 不是把 URL 里塞动词，而是用资源、方法和表示来描述接口。资源边界清楚，权限和缓存才有落点。',
              ['资源与集合', '路径命名与嵌套', '关系与子资源', '动作型接口的边界', '分页、筛选与排序'],
              """GET /api/courses
GET /api/courses/42
GET /api/courses/42/lessons
POST /api/courses
PATCH /api/courses/42

# 动作型：发布不是资源替换，用子资源表达
POST /api/courses/42/publication""",
              '200 /api/courses → 集合\n200 /api/courses/42 → 单个资源\n201 /api/courses → 创建成功，Location 指向新资源',
              '把所有操作都写成 /api/doSomething，会让权限、缓存和文档无处安放；先建模资源。',
              '为课程、课节、选课、进度设计资源路径，并标出集合、单资源、子资源和动作型接口。'),
            C('状态码与错误契约',
              '状态码表达结果类别，错误体表达具体原因。两者一起构成客户端能消费的契约。',
              ['2xx 成功语义', '4xx 客户端错误', '5xx 服务端错误', '统一错误结构', '校验错误与字段定位'],
              """HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json

{
  "code": "VALIDATION_ERROR",
  "message": "请求参数不合法",
  "details": [{"field": "title", "message": "至少 2 个字"}],
  "requestId": "req-7f2"
}""",
              '422 + VALIDATION_ERROR + details[0].field=title\n404 + COURSE_NOT_FOUND\n500 + INTERNAL + requestId',
              '所有错误都返回 200 或 500，会让客户端无法重试、提示和上报；先分类再统一。',
              '写出课程社区的错误码表，覆盖校验、未登录、无权限、不存在、冲突和系统错误。'),
            C('OpenAPI 契约与文档',
              'OpenAPI 是接口的机器可读契约。它既能生成文档，也能生成客户端、做契约测试和检查破坏性变更。',
              ['OpenAPI 3.1 结构', 'paths / components / schemas', '请求与响应示例', '安全方案声明', '从文档生成客户端'],
              """openapi: 3.1.0
info: { title: Course Community API, version: 1.0.0 }
paths:
  /api/courses:
    get:
      responses:
        '200':
          description: 课程列表
          content:
            application/json:
              schema: { $ref: '#/components/schemas/CoursePage' }""",
              'openapi: 3.1.0\nGET /api/courses → 200 CoursePage\n安全方案：bearerAuth',
              '文档只写成功响应，客户端遇到 401/422 仍然要猜；错误响应也要进 schema。',
              '为课程列表和详情写 OpenAPI 片段，包含成功、401、404 和 422 响应，并生成一次客户端。'),
            C('版本、兼容与废弃',
              'API 一旦对外，就不能随意改名。版本策略、兼容窗口和废弃公告，是对接入方的尊重。',
              ['URL / Header 版本', '向后兼容与破坏性变更', '废弃标记与迁移期', '契约测试', '变更公告'],
              """GET /api/v1/courses
Deprecation: true
Sunset: Sat, 31 Jan 2027 00:00:00 GMT
Link: <https://docs.example.com/migrate-v2>; rel="deprecation"

# v2 保留 v1 字段，新增字段不改变旧客户端行为""",
              'v1 继续可用；响应新增字段；旧字段在 2027-01-31 前保留\n迁移文档：docs.example.com/migrate-v2',
              '直接改字段名或删除字段，会让线上客户端瞬间崩；破坏性变更必须新版本 + 迁移期。',
              '为一个字段改名设计兼容方案：新增字段、双写、废弃公告、迁移期和下线检查。'),
            C('Session 与 Cookie',
              'Session 把登录状态放在服务端，Cookie 负责在浏览器和服务器之间携带标识。安全属性决定它会不会被偷。',
              ['Session 存储与过期', 'Cookie 属性', 'HttpOnly / Secure / SameSite', 'CSRF 与 SameSite', '多端与登出'],
              """Set-Cookie: sid=abc123; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400

# 登录成功后轮换 session id，防止固定攻击
session.rotate(req, res);""",
              'Set-Cookie: sid=...; HttpOnly; Secure; SameSite=Lax\n登出后服务端删除 session，Cookie Max-Age=0',
              '把 session id 存在 localStorage 或 URL， XSS 或日志泄露后可直接冒用；用 HttpOnly Cookie。',
              '实现一套 Session 登录，包含轮换、过期、登出和 SameSite 设置，并验证 CSRF 防护。'),
            C('JWT 与刷新令牌',
              'JWT 是自包含令牌，适合无状态校验，但撤销和过期是难点。访问令牌短、刷新令牌长，刷新要轮换。',
              ['JWT 结构与本签名', 'access / refresh 分工', '刷新轮换与重放检测', '撤销与黑名单', '前端存储位置'],
              """{
  "sub": "42",
  "scope": "courses:read",
  "exp": 1790000000,
  "jti": "tok-7f2"
}

POST /api/auth/refresh
{ "refreshToken": "..." } → { "accessToken": "...", "refreshToken": "..." }""",
              'accessToken 15 分钟；refreshToken 7 天且一次性轮换\n旧 refresh 再次使用 → 401 TOKEN_REUSED',
              'JWT 不是加密，只是签名；不要放密码、密钥或敏感个人信息。',
              '实现 access / refresh 双令牌，刷新时轮换并检测旧令牌重放，写出撤销策略。'),
            C('OAuth2 与第三方登录',
              'OAuth2 解决“让第三方在有限范围内代表用户访问资源”。授权码 + PKCE 是浏览器和移动端的默认选择。',
              ['授权码流程', 'PKCE 与 state', 'scope 与 consent', '回调地址校验', '第三方账号绑定'],
              """GET https://auth.example.com/authorize?
  response_type=code&
  client_id=course-web&
  redirect_uri=https://course.example.com/auth/callback&
  scope=openid%20profile&
  state=xyz&
  code_challenge=...&code_challenge_method=S256""",
              '302 → /auth/callback?code=...&state=xyz\n后端用 code + code_verifier 换 token，校验 state 与 redirect_uri',
              '把 client_secret 放在前端或回调不校验 state，会引入令牌拦截和 CSRF；授权码流程要在后端换 token。',
              '画一次授权码 + PKCE 登录流程，标出 state、redirect_uri、code 和 token 的存放位置。'),
            C('RBAC 与资源级越权',
              '角色权限只能回答“能不能进这个功能”，资源级授权还要回答“能不能动这一条数据”。',
              ['角色、权限与资源', '中间件与装饰器', '资源所有权检查', '越权测试', '最小权限与审计'],
              """@PreAuthorize("hasRole('TEACHER')")
@PostMapping("/api/courses/{id}/publish")
void publish(@PathVariable long id, @AuthenticationPrincipal User user) {
  courseService.publish(id, user.id()); // service 内再校验 owner
}""",
              '老师 A 发布老师 B 的课程 → 403 FORBIDDEN\n管理员发布任意课程 → 200\n学生发布 → 403',
              '只在按钮上隐藏“发布”，接口仍可被直接调用；权限必须落在服务端资源检查。',
              '为“老师发布自己的课程”写角色 + 所有权双重检查，并补一条越权测试。'),
            C('幂等、限流与审计',
              '开放 API 会遇到重复提交、突发流量和追责需求。幂等键、限流和审计日志是三道护栏。',
              ['Idempotency-Key', '令牌桶 / 滑动窗口', '按用户与 IP 限流', '审计事件结构', '重放与告警'],
              """POST /api/enrollments
Idempotency-Key: 7f2a-...

# 同 key 重复请求返回第一次结果，不重复扣款/报名
429 Too Many Requests
Retry-After: 30""",
              '第一次 POST → 201 enrollmentId=88\n同 key 重放 → 200 同一 enrollmentId\n超过限额 → 429 + Retry-After',
              '限流只按 IP，会把同一 NAT 下的正常用户一起误伤；至少叠加用户维度。',
              '为报名接口加幂等键、每用户限流和审计事件，并验证重复提交不会创建两条记录。'),
            C('GraphQL、WebSocket 与 API 实战',
              'GraphQL、WebSocket 不是 REST 的替代品，而是不同问题的工具。先判断查询形状、实时性和缓存需求。',
              ['GraphQL schema 与 resolver', 'N+1 与 DataLoader', 'WebSocket 事件契约', '何时不用 GraphQL', '课程社区 API 整合'],
              """type Query { course(id: ID!): Course }
type Course { id: ID!, title: String!, lessons: [Lesson!]! }

# 实时：不要把所有页面都改成订阅
subscription { progressUpdated(courseId: "42") { lessonId percent } }""",
              'GET /api/v1/courses → REST 列表\nGraphQL 只用于聚合查询\nWebSocket 只用于进度推送',
              '为了“先进”把所有接口改 GraphQL，会引入缓存、权限和 N+1 新问题；先证明 REST 不够。',
              '画出课程社区 API 的边界：哪些 REST、哪些 GraphQL、哪些实时，并说明理由。')
        ]
    },

    {
        'id': 'testing',
        'index': 5,
        'title': '测试与质量',
        'en': 'TESTING & QUALITY',
        'logo': 'TQ',
        'accent': '#FACC15',
        'kicker': 'TESTING · FULL COURSE · FIVE PARTS',
        'project': '给课程社区建立从单元测试到端到端和 CI 门禁的质量体系',
        'source': 'JUnit 5、Vitest、Playwright、Testcontainers 与测试金字塔实践',
        'materialLabel': 'JUnit / Vitest / Playwright',
        'languageLabel': 'java',
        'sidebarTitle': '测试与质量',
        'sidebarNote': '从测试金字塔、单元测试、Mock、数据库测试到 API 集成、组件测试、Playwright 和 CI 门禁。50 课把“写完点一下”升级成“每次改动都敢发布”。',
        'topics': ['测试金字塔与测试边界', '单元测试、Mock 与 Fixture', '服务层、数据库与 API 集成测试', '组件测试与 Playwright 端到端', '覆盖率、缺陷复现与 CI 质量门禁'],
        'overviewSub': '测试不是上线前的一次检查，而是让每次改动都能快速得到证据。这条课从<strong>测试金字塔</strong>开始，走到单元、Mock、数据库、API、组件、端到端、数据隔离、覆盖率与 CI 门禁，最后给课程社区建立一套能持续运行的质量体系。',
        'outcomes': [
            {'title': '测试分层', 'desc': '单元测试快而多，集成测试少而真，端到端只覆盖关键链路，不用一种测试打天下。'},
            {'title': '测试可重复', 'desc': '数据、时间和网络都要可控，测试不能依赖上一次运行的残留状态。'},
            {'title': '失败能定位', 'desc': '一条失败测试要能说明哪里坏了、怎么复现、修完如何证明，而不是只给一个红叉。'}
        ],
        'routeNote': '01–02 金字塔、单元测试与断言 → 03–04 Mock、Fixture、服务层与数据库测试 → 05–06 API 集成、组件测试与契约 → 07–08 Playwright、数据隔离与稳定性 → 09–10 覆盖率、缺陷复现与 CI 门禁。',
        'sourceNote': '后端示例以 JUnit 5 + Spring Boot Test 为主；前端使用 Vitest + Testing Library + Playwright。',
        'parts': [
            {'title': '测试基础', 'note': '金字塔、单元测试、断言与可测试性'},
            {'title': '隔离与数据', 'note': 'Mock、Fixture、数据库、Testcontainers'},
            {'title': '接口与界面', 'note': 'API 集成、组件测试、契约与端到端'},
            {'title': '稳定与度量', 'note': '测试数据隔离、Flaky、覆盖率与缺陷复现'},
            {'title': '质量门禁', 'note': 'CI、报告、发布检查与质量体系'}
        ],
        'chapters': [
            C('测试金字塔与测试边界',
              '测试要分层：单元测试验证逻辑，集成测试验证协作，端到端验证用户链路。层级错位会让测试又慢又脆。',
              ['单元 / 集成 / 端到端', '测试成本与反馈速度', '什么该测与不该测', '测试命名与结构', '测试即文档'],
              """// 单元：只测业务规则
assertEquals(0, progress.percentFor(0, 12));

// 集成：验证 Repository 与数据库
// 端到端：验证 登录 → 学习 → 刷新后进度仍在""",
              '单元测试 200 条 < 2s\n集成测试 30 条 < 30s\nE2E 3 条覆盖关键链路',
              '用 E2E 覆盖所有分支，会让流水线跑 40 分钟还经常超时；把细节放回单元层。',
              '为课程社区画一张测试金字塔，标出每层测什么、用什么工具、目标运行时间。'),
            C('单元测试与断言',
              '单元测试要快、独立、可重复。一个测试只验证一个行为，名字要说明前提和结果。',
              ['AAA 结构', '断言与异常断言', '参数化测试', '边界与等价类', '测试命名'],
              """@Test
void shouldRejectPublishingWhenNoLessons() {
  Course course = new Course(42L, "后端工程", List.of());
  assertThrows(IllegalStateException.class, () -> course.publish());
}""",
              'shouldRejectPublishingWhenNoLessons → 通过\n发布空课程抛出 IllegalStateException',
              '一个测试里断言十个字段，失败时不知道哪条规则坏了；按行为拆分。',
              '为“发布课程”写 3 条单元测试：正常发布、无课节拒绝、重复发布拒绝。'),
            C('Mock、Stub 与 Fixture',
              'Mock 用来隔离外部依赖，不是用来掩盖设计问题。先判断依赖是否真的需要替换，再决定 mock 的边界。',
              ['Stub 与 Mock 的区别', '依赖注入与可测性', '测试替身的生命周期', 'Fixture 与 Builder', '过度 Mock 的信号'],
              """CourseService service = new CourseService(
  new InMemoryCourseRepository(),
  new FixedClock(Instant.parse("2026-11-26T00:00:00Z"))
);
service.publish(42L);""",
              'InMemoryRepository 返回固定课程\nFixedClock 让“发布时间”可断言\n不 mock 业务方法本身',
              '把 Service 内部每个方法都 mock，测试只是在验证调用顺序；优先替换边界依赖。',
              '为一个依赖时钟和仓库的 Service 写测试，用内存实现和固定时钟替代真实依赖。'),
            C('服务层与数据库测试',
              '数据库测试要验证真实 SQL、约束和事务，不是只验证 Repository 接口被调用。Testcontainers 让本地和 CI 用同一个数据库。',
              ['Testcontainers 与真实数据库', '事务回滚与清理', '约束与唯一索引', '迁移脚本测试', 'Repository 查询测试'],
              """@Testcontainers
class CourseRepositoryTest {
  @Container
  static PostgreSQLContainer<?> db = new PostgreSQLContainer<>("postgres:16");
  @Test void shouldEnforceUniqueSlug() { ... }
}""",
              '容器启动 postgres:16\n插入重复 slug → 唯一约束异常\n事务回滚后表为空',
              '用 H2 模拟 PostgreSQL 会漏掉方言和约束差异；关键查询用真实数据库。',
              '用 Testcontainers 跑一条 Repository 测试，验证唯一约束和事务回滚。'),
            C('API 集成测试与契约',
              'API 测试从 HTTP 入口进入，验证路由、校验、鉴权、序列化和错误格式，是前后端契约的守门人。',
              ['MockMvc / WebTestClient', '请求构造与响应断言', '鉴权与错误路径', '契约测试', '测试环境配置'],
              """mockMvc.perform(post("/api/courses")
    .contentType(APPLICATION_JSON)
    .content("{\\"title\\":\\"\\"}"))
  .andExpect(status().isUnprocessableEntity())
  .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"));""",
              'POST /api/courses {} → 422\ncode=VALIDATION_ERROR\ndetails[0].field=title',
              '只测 200 路径，错误契约会在上线后崩；401、403、404、422 都要有用例。',
              '为课程创建接口写成功、校验失败、未登录和无权限四条集成测试。'),
            C('前端组件测试',
              '组件测试验证用户看到的行为：渲染、点击、输入、加载和错误态。不要断言内部 state 或 CSS 类名。',
              ['Testing Library 查询优先级', '用户事件与异步等待', 'Mock API 与错误态', '可访问性断言', '避免实现细节'],
              """render(<CourseCard course={course} onOpen={onOpen} />);
await user.click(screen.getByRole('button', { name: /后端工程/ }));
expect(onOpen).toHaveBeenCalledWith(42);""",
              'getByRole(button, name=/后端工程/) 可点击\n点击后 onOpen(42) 被调用',
              '用 container.querySelector(".card") 断言样式，会把测试锁在实现上；按角色和文本查询。',
              '为课程卡写渲染、点击和键盘触发三条组件测试，全部使用角色查询。'),
            C('Playwright 端到端',
              '端到端测试从浏览器进入，验证真实路由、接口、登录和持久化。只覆盖少数关键链路，贵在稳定。',
              ['Playwright 安装与配置', '定位器与自动等待', '登录态复用', '截图与追踪', '失败重试与并行'],
              """test('learner keeps progress after reload', async ({ page }) => {
  await page.goto('/courses/42');
  await page.getByRole('button', { name: '标记完成' }).click();
  await page.reload();
  await expect(page.getByText('已完成')).toBeVisible();
});""",
              'chromium 启动 → 打开 /courses/42 → 点击标记完成 → 刷新 → 看到“已完成”',
              '用固定 sleep 等接口，机器一慢就红；用 Playwright 的可见、可用和响应等待。',
              '写一条“登录 → 打开课程 → 标记完成 → 刷新仍在”的端到端测试，并在 CI 无头运行。'),
            C('测试数据隔离与稳定性',
              '测试互相污染会产生随机失败。数据隔离、时间控制和网络隔离，是稳定测试的三根支柱。',
              ['每个测试独立数据', '数据库清理策略', '固定时钟与随机种子', '网络隔离', 'Flaky 分析与重试'],
              """@BeforeEach
void setUp() { repository.deleteAll(); }

@Test
void shouldNotLeakBetweenTests() { ... }""",
              '每个测试前清空课程表\n同一用例单独运行和全量运行结果一致\nFlaky 率 < 1%',
              '测试依赖上一条用例创建的数据，顺序一变就失败；每个测试自己准备数据。',
              '找出一个顺序敏感或时间敏感的测试，改成独立数据 + 固定时钟，并记录修复前后结果。'),
            C('覆盖率、缺陷复现与回归',
              '覆盖率是提示，不是目标。真正有价值的是缺陷复现测试：先红，再修，再绿。',
              ['行 / 分支覆盖率', '覆盖率的局限', '缺陷最小复现', '回归测试', '测试报告'],
              """@Test
void bug42_shouldNotDoubleCountProgress() {
  // 复现：重复点击“完成”导致进度 +2
  progressService.complete(42L, 1L);
  progressService.complete(42L, 1L);
  assertEquals(1, progressService.percent(42L));
}""",
              '修复前：percent=2（失败）\n修复后：percent=1（通过）\n回归测试保留在套件中',
              '追求 100% 覆盖率会写大量无意义断言；优先覆盖业务不变量和曾经出过的事故。',
              '选一个真实或模拟缺陷，写最小复现测试，修复后保留为回归用例。'),
            C('CI 质量门禁与发布检查',
              '质量门禁要自动运行、快速反馈、失败阻断。测试、Lint、类型检查、构建和安全扫描都进流水线。',
              ['GitHub Actions 测试任务', '缓存与并行', '失败报告与产物', '分支保护', '发布前检查清单'],
              """jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci && npm test
      - run: mvn -q test
      - uses: actions/upload-artifact@v4
        with: { name: reports, path: build/reports }""",
              'PR → test job 运行\n单元 + 集成 + 构建全部通过才允许合并\n失败报告上传为 artifact',
              'CI 只跑构建不跑测试，等于把质量留给用户；合并前必须有自动化证据。',
              '为课程社区配一条 CI：安装、Lint、单元测试、集成测试、构建和失败报告。')
        ]
    },
    {
        'id': 'devops',
        'index': 6,
        'title': 'DevOps 与云部署',
        'en': 'DEVOPS & CLOUD',
        'logo': 'DO',
        'accent': '#60A5FA',
        'kicker': 'DEVOPS · FULL COURSE · FIVE PARTS',
        'project': '把课程社区从本地进程部署成可回滚、可监控的在线服务',
        'source': 'Linux、Docker、Nginx、GitHub Actions 与云平台部署实践',
        'materialLabel': 'Linux / Docker / Nginx / CI',
        'languageLabel': 'bash',
        'sidebarTitle': 'DevOps<br>与云部署',
        'sidebarNote': '从 Linux 进程、Docker、Compose、Nginx、HTTPS 到 GitHub Actions、自动部署、回滚、日志指标、备份和发布手册。50 课把“本地能跑”升级成“线上可控”。',
        'topics': ['Linux 服务、进程与 systemd', 'Docker 镜像、Compose 与网络', 'Nginx 反代、域名、HTTPS 与缓存', 'GitHub Actions、自动部署与回滚', '日志、指标、告警、备份与发布手册'],
        'overviewSub': '部署不是把文件传上去。这条课从<strong>Linux 进程</strong>开始，走到 Docker、Compose、Nginx、HTTPS、CI/CD、自动部署、回滚、日志指标、备份灾备和发布手册，最后让课程社区成为一套可重复上线的服务。',
        'outcomes': [
            {'title': '环境可重建', 'desc': '依赖、镜像、配置和启动命令都在仓库里，换一台机器也能跑起来。'},
            {'title': '发布可回滚', 'desc': '每次发布有版本、有健康检查、有回滚步骤，出问题能在分钟级恢复。'},
            {'title': '运行可观测', 'desc': '日志、指标、告警和备份不是可选项，是线上服务的基本配置。'}
        ],
        'routeNote': '01–02 Linux 服务、进程、Docker 镜像 → 03–04 Compose、网络、Nginx 反代 → 05–06 域名、HTTPS、Actions 与自动部署 → 07–08 回滚、日志、指标与告警 → 09–10 备份灾备、发布手册与综合实战。',
        'sourceNote': '命令以 Ubuntu 22.04 和 Docker Compose v2 为基准；云平台差异在章节内说明。',
        'parts': [
            {'title': '主机与容器', 'note': 'Linux 服务、进程、Docker 镜像与容器'},
            {'title': '编排与入口', 'note': 'Compose、网络、Nginx、域名与 HTTPS'},
            {'title': '流水线与发布', 'note': 'GitHub Actions、自动部署、版本与回滚'},
            {'title': '运行与恢复', 'note': '日志、指标、告警、备份与灾备'},
            {'title': '发布治理', 'note': '发布手册、变更管理、演练与项目交付'}
        ],
        'chapters': [
            C('Linux 服务与进程',
              '线上服务首先是一个进程。用户、工作目录、环境变量、端口和重启策略决定它能不能稳定运行。',
              ['用户与工作目录', '环境变量与配置文件', '端口与监听', 'systemd 单元', '日志与重启'],
              """[Unit]
Description=Course API
After=network.target

[Service]
User=course
WorkingDirectory=/opt/course-api
ExecStart=/opt/course-api/bin/course-api
Restart=on-failure
EnvironmentFile=/etc/course-api/env

[Install]
WantedBy=multi-user.target""",
              'systemctl status course-api → active (running)\nss -ltnp | grep 8080 → java\njournalctl -u course-api -n 20',
              '用 root 跑服务、把密钥写进命令行，会把权限和密钥一起放大；专用用户 + 环境文件。',
              '把课程 API 配成 systemd 服务，使用专用用户、环境文件和失败重启，并验证日志。'),
            C('Docker 镜像与容器',
              '镜像要小、可重复、无密钥。多阶段构建把编译环境和运行环境分开，减少攻击面。',
              ['Dockerfile 分层', '多阶段构建', '非 root 用户', '镜像标签与摘要', '容器日志与退出码'],
              """FROM eclipse-temurin:21-jdk AS build
WORKDIR /src
COPY . .
RUN ./mvnw -q package -DskipTests

FROM eclipse-temurin:21-jre
RUN useradd -r -u 1001 course
USER course
COPY --from=build /src/target/app.jar /app.jar
ENTRYPOINT ["java","-jar","/app.jar"]""",
              'docker build -t course-api:20261126 .\ndocker run --rm -p 8080:8080 course-api:20261126\n容器内 user=course，不是 root',
              '用 latest 标签部署，回滚时不知道回哪个版本；每次构建打不可变标签或摘要。',
              '为课程 API 写多阶段 Dockerfile，使用非 root 用户，构建并运行一个最小健康检查。'),
            C('Docker Compose 与环境编排',
              'Compose 适合单机多服务：应用、数据库、缓存和反向代理。网络、卷、健康检查和依赖顺序要显式声明。',
              ['compose.yaml 结构', '服务网络与端口', '卷与数据持久化', '健康检查与 depends_on', '环境变量与秘密'],
              """services:
  api:
    image: course-api:20261126
    env_file: .env
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16
    volumes: [db-data:/var/lib/postgresql/data]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U course"]
volumes: { db-data: {} }""",
              'docker compose up -d\ndocker compose ps → api healthy, db healthy\ndocker compose logs -f api',
              '数据库数据放在容器可写层，重建容器就丢；必须挂命名卷或外部存储。',
              '用 Compose 编排 API + PostgreSQL，配健康检查、持久化卷和环境文件，并验证重启后数据还在。'),
            C('Nginx 反向代理',
              'Nginx 负责 TLS 终止、静态资源、上游转发和超时。代理配置错了，后端再快也会 502/504。',
              ['server / location', 'proxy_pass 与 upstream', '转发头', '超时与缓冲', '静态资源与 gzip'],
              """upstream course_api { server api:8080; }

server {
  listen 80;
  server_name course.example.com;
  location /api/ {
    proxy_pass http://course_api;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
  }
  location / { root /var/www/course; try_files $uri /index.html; }
}""",
              'nginx -t → syntax is ok\ncurl -i http://course.example.com/api/health → 200\ncurl -I / → 200 text/html',
              'proxy_read_timeout 比后端处理时间短，会出现 504 但后端成功；两层超时要对齐。',
              '配置 Nginx 反代 API 和静态前端，设置转发头、超时和 SPA fallback，并用 curl 验证。'),
            C('域名、HTTPS 与证书',
              '域名解析、TLS 证书和 HTTPS 重定向是公网入口的三件事。证书过期和混合内容会让站点直接不可用。',
              ['DNS 记录与解析', 'Let\'s Encrypt / ACME', 'TLS 配置与协议版本', 'HSTS 与重定向', '证书续期与监控'],
              """server {
  listen 443 ssl http2;
  server_name course.example.com;
  ssl_certificate /etc/letsencrypt/live/course.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/course.example.com/privkey.pem;
  add_header Strict-Transport-Security "max-age=31536000" always;
}
server { listen 80; server_name course.example.com; return 301 https://$host$request_uri; }""",
              'curl -I https://course.example.com → HTTP/2 200\nHTTP → 301 https\n证书 notAfter 在 90 天内自动续期',
              '只配 HTTPS 不配 HTTP 跳转，用户仍可能走明文；80 端口要 301 到 443。',
              '给课程社区配置域名、HTTPS、HTTP 跳转和证书续期检查，并用 curl 验证协议与证书。'),
            C('GitHub Actions 与自动部署',
              'CI 负责验证，CD 负责发布。构建一次、按版本发布、部署后健康检查，是自动化的最小闭环。',
              ['workflow 触发条件', '构建与测试', '镜像推送', '部署 job 与环境保护', '健康检查与失败中止'],
              """name: deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - run: docker build -t course-api:${{ github.sha }} .
      - run: ./scripts/deploy.sh ${{ github.sha }}
      - run: ./scripts/healthcheck.sh https://course.example.com/api/health""",
              'push main → build → deploy → healthcheck 200\n健康检查失败 → job 失败，发布中止\n部署记录保留 git sha',
              '自动部署没有健康检查，坏了也会显示绿色；部署最后一步必须验证真实入口。',
              '为课程社区写一条 main 分支自动部署流水线，包含构建、部署、健康检查和失败中止。'),
            C('版本、回滚与发布策略',
              '发布要有版本号和回滚路径。蓝绿、滚动或单机切换各有代价，关键是小步、可观测、能退回。',
              ['语义化版本与 git sha', '蓝绿 / 滚动发布', '数据库迁移兼容', '回滚步骤', '发布窗口与冻结'],
              """# 发布前记录当前版本
kubectl rollout status deploy/course-api
# 回滚到上一个 revision
kubectl rollout undo deploy/course-api

# 单机 Docker：保留上一个镜像标签
docker tag course-api:20261126 course-api:previous""",
              '当前 20261126 → 健康检查失败 → 回滚 20261125\n回滚后 /api/health 200，错误率下降',
              '数据库迁移不可逆，代码回滚了数据却回不去；迁移要先兼容旧代码。',
              '设计一次发布和回滚演练：保留上一版、执行迁移、健康检查失败后 5 分钟内退回。'),
            C('日志、指标与告警',
              '线上问题不能靠用户反馈。结构化日志、关键指标和告警阈值，让你在用户之前发现异常。',
              ['结构化日志与请求 ID', '指标：延迟 / 错误率 / 饱和度', '日志聚合', '告警阈值与降噪', '仪表盘与排障路径'],
              """{"level":"error","requestId":"req-7f2","route":"/api/courses","status":500,"latencyMs":1200}

# 关键指标
http_requests_total{status="500"}
http_request_duration_seconds{route="/api/courses"}""",
              '错误率 > 1% 持续 5 分钟 → 告警\nP95 延迟 > 800ms → 告警\n每条错误日志带 requestId，可关联一次请求',
              '只告警 CPU，不告警错误率和延迟，用户已经在报错你才知道；从用户体验指标出发。',
              '为课程 API 定义 3 个黄金指标和告警阈值，并让每条错误日志带 requestId。'),
            C('备份、灾备与恢复演练',
              '备份只有能恢复才算数。备份频率、保留期、异地存储和恢复时间目标，要一起写进方案。',
              ['数据库备份策略', '对象存储与静态资源', '恢复点 / 恢复时间目标', '恢复演练', '密钥与配置备份'],
              """pg_dump -Fc course > /backup/course-$(date +%F).dump
aws s3 cp /backup/course-2026-11-26.dump s3://course-backups/

# 每季度演练：在隔离环境恢复并校验行数
pg_restore -d course_restore /backup/course-2026-11-26.dump""",
              '每日 02:00 全量备份，保留 30 天\nRPO ≤ 24h，RTO ≤ 2h\n季度恢复演练成功，课程行数一致',
              '备份文件和数据库在同一块盘，磁盘坏了备份一起没；至少一份异地或对象存储。',
              '为课程社区写备份与恢复方案，包含 RPO/RTO、保留期、异地存储和一次恢复演练记录。'),
            C('发布手册与综合实战',
              '发布手册把隐性经验变成可执行步骤。任何人按手册都能发布、验证、回滚和交接。',
              ['发布前检查', '变更记录与审批', '发布步骤', '验证与回滚', '事故复盘与交接'],
              """# 发布清单
- [ ] CI 全绿，镜像标签 = git sha
- [ ] 数据库迁移已在 staging 验证
- [ ] 备份完成，回滚镜像存在
- [ ] 发布后 /api/health 200，错误率正常
- [ ] 记录发布时间、版本、负责人""",
              '发布记录：2026-11-26 20:00 / z83 / 负责人 / 健康检查通过\n回滚演练：2026-11-20，耗时 4 分钟',
              '发布靠某个人记忆，换班就出事故；把步骤、验证和回滚写进仓库。',
              '写一份课程社区发布手册，覆盖检查、步骤、验证、回滚和事故复盘，并做一次桌面演练。')
        ]
    }


    ,
    {
        'id': 'security-performance',
        'index': 7,
        'title': '安全、性能与架构',
        'en': 'SECURITY & PERFORMANCE',
        'logo': 'SP',
        'accent': '#FB7185',
        'kicker': 'SECURITY · FULL COURSE · FIVE PARTS',
        'project': '让课程社区在真实流量和攻击面前保持可用、可恢复',
        'source': 'OWASP Top 10、CSP、缓存、消息队列、压测与可观测性实践',
        'materialLabel': 'OWASP / 缓存 / 压测',
        'languageLabel': 'http',
        'sidebarTitle': '安全、性能<br>与架构',
        'sidebarNote': '从威胁建模、OWASP、XSS/CSRF、注入、密钥与 CORS/CSP，到缓存、CDN、消息队列、压测、可观测性和架构扩展。50 课把“功能可用”升级成“在攻击和流量下仍然可用”。',
        'topics': ['威胁建模与 OWASP Top 10', 'XSS、CSRF、SQL 注入与输入信任', '密钥、权限、CORS 与 CSP', '缓存、CDN、消息队列与异步', '压测、可观测性与架构扩展'],
        'overviewSub': '安全和性能不是上线后的补丁。这条课从<strong>威胁建模</strong>开始，走到 OWASP、XSS/CSRF、注入、密钥权限、CORS/CSP、缓存、CDN、消息队列、压测、可观测性和架构扩展，最后让课程社区在真实流量与攻击下仍然可控。',
        'outcomes': [
            {'title': '先想攻击面', 'desc': '每个入口、数据和第三方依赖都要问：谁能访问、能改什么、坏了影响多大。'},
            {'title': '默认不信任输入', 'desc': '所有来自浏览器的数据都可能被伪造，校验、编码和参数化查询要成为默认动作。'},
            {'title': '性能有证据', 'desc': '优化前先测量，优化后复测；没有基线的“感觉快了”不算结果。'}
        ],
        'routeNote': '01–02 威胁建模、OWASP 与攻击面 → 03–04 XSS、CSRF、注入与输入信任 → 05–06 密钥、权限、CORS 与 CSP → 07–08 缓存、CDN、消息队列与异步 → 09–10 压测、可观测性、架构扩展与综合演练。',
        'sourceNote': '安全示例只用于防御与检测；不要对未授权目标做扫描或攻击。',
        'parts': [
            {'title': '威胁与漏洞', 'note': '威胁建模、OWASP、XSS、CSRF 与注入'},
            {'title': '信任边界', 'note': '输入校验、密钥、权限、CORS 与 CSP'},
            {'title': '性能与异步', 'note': '缓存、CDN、消息队列、限流与降级'},
            {'title': '测量与扩展', 'note': '压测、指标、火焰图、数据库与水平扩展'},
            {'title': '综合演练', 'note': '一次安全事件与流量高峰的完整处置'}
        ],
        'chapters': [
            C('威胁建模与攻击面',
              '威胁建模是在写代码前问“谁会怎么攻击”。资产、入口、信任边界和影响，构成一张可讨论的图。',
              ['资产与信任边界', 'STRIDE 六类威胁', '入口清单', '攻击面与影响评估', '安全需求与验收'],
              """资产：课程内容、用户账号、支付记录
入口：登录、上传、搜索、Webhook
信任边界：浏览器 → API → 数据库 / 对象存储
威胁：伪造身份、篡改课程、泄露进度、刷爆上传""",
              '威胁表：身份伪造 / 数据篡改 / 信息泄露 / 拒绝服务\n每个入口有对应控制和测试',
              '只做“功能评审”不做威胁建模，等出事才发现上传入口没有类型限制；先列入口再定控制。',
              '为课程社区画一张威胁建模图，列出 5 个入口、3 项资产和对应控制。'),
            C('OWASP Top 10 与常见漏洞',
              'OWASP Top 10 是风险清单，不是考试题。把它映射到自己的入口、依赖和配置，才知道先修什么。',
              ['失效的访问控制', '加密失败与配置错误', '注入与不安全设计', '依赖与供应链', '日志与监控不足'],
              """# 依赖检查（示例）
npm audit --omit=dev
mvn org.owasp:dependency-check-maven:check

# 配置检查：不要把调试接口暴露到公网
curl -i https://course.example.com/actuator/health""",
              'npm audit：0 high\n依赖检查：无已知高危\n/actuator 仅内网可访问',
              '把 OWASP 当成一次性扫描，修完就忘；把高风险项变成持续检查和发布门禁。',
              '把 OWASP Top 10 映射到课程社区的 5 个入口，写出当前状态和下一步修复优先级。'),
            C('XSS 与输出编码',
              'XSS 是用户输入变成可执行脚本。防护的关键是上下文相关的输出编码、CSP 和避免危险 DOM API。',
              ['反射型 / 存储型 / DOM 型', 'HTML 属性 URL 上下文编码', '富文本白名单', 'CSP 与 nonce', '危险 API 清单'],
              """<!-- 服务端模板默认转义 -->
<p>{{ course.title }}</p>

<!-- 富文本：白名单清洗，不允许 script/onerror -->
sanitize(html, { allowedTags: ['p','strong','em','a'], allowedAttributes: { a: ['href'] } });""",
              '标题输入 <img src=x onerror=alert(1)> → 页面显示文本，不执行\nCSP 阻止内联脚本',
              '只在前端替换 < > 不能覆盖属性、URL 和 JS 上下文；按输出位置编码。',
              '对一个课程标题和富文本简介做 XSS 测试，补输出编码、白名单和 CSP。'),
            C('CSRF、CORS 与跨域信任',
              'CSRF 利用浏览器自动带 Cookie；CORS 决定哪些源能读响应。两者方向不同，不能互相替代。',
              ['CSRF 攻击链', 'SameSite 与 token', 'CORS 预检与允许源', '凭证请求', 'JSONP 与历史坑'],
              """Access-Control-Allow-Origin: https://course.example.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PATCH
Vary: Origin

# 状态变更接口校验 CSRF token 或自定义头""",
              '来自 https://evil.example 的带凭证请求 → 响应不可读\n合法源 → 200，Vary: Origin\n无 token 的 POST → 403',
              'Access-Control-Allow-Origin: * 加 credentials 会被浏览器拒绝，也说明配置思路错了；按源白名单。',
              '为课程社区的写接口配 CSRF 防护和 CORS 白名单，并验证恶意源无法读取响应。'),
            C('SQL 注入、命令注入与输入信任',
              '注入的本质是“数据被当成代码”。参数化查询、白名单和最小权限，是比过滤字符串更可靠的防线。',
              ['参数化查询', 'ORM 与原生 SQL 边界', '命令与模板注入', '文件路径穿越', '输入校验与最小权限'],
              """// 错误：拼接
// "select * from courses where title like '%" + q + "%'"

// 正确：参数化
jdbc.query("select * from courses where title like ?", "%" + q + "%");

// 文件路径：只允许白名单目录
Path resolved = base.resolve(name).normalize();
if (!resolved.startsWith(base)) throw new IllegalArgumentException();""",
              "q=' OR 1=1 -- → 查询按字面处理，不返回全部数据\nname=../../etc/passwd → 拒绝",
              '用黑名单过滤关键字，会被编码和大小写绕过；参数化和白名单才是结构性的修复。',
              '找出项目里一处字符串拼接 SQL 或路径拼接，改成参数化/白名单，并补一条攻击用例。'),
            C('密钥、权限与最小暴露',
              '密钥泄露往往不是被“黑”进去，而是被提交、打日志、放进前端或给了过大权限。',
              ['环境变量与秘密管理', '最小权限账号', '密钥轮换', '日志脱敏', '前端可见与不可见'],
              """# 只给运行需要的权限
DB_USER=course_app
DB_PASSWORD=${COURSE_DB_PASSWORD}

# 日志中脱敏
log.info("login user={} ip={}", Mask.email(email), Mask.ip(ip));""",
              '仓库历史无密钥\n应用账号只能访问 course 库\n日志中 email 显示为 a***@example.com',
              '把密钥写进 .env 并提交，轮换前一直有效；秘密走环境/密钥管理，仓库只留示例。',
              '做一次密钥体检：仓库历史、日志、前端包和数据库账号权限，列出并修复三项。'),
            C('缓存、CDN 与一致性',
              '缓存能救性能，也能制造脏数据。缓存键、TTL、失效和用户隔离，要比“加个 CDN”更先想清楚。',
              ['Cache-Control 与 ETag', 'CDN 缓存键', '静态资源 immutable', '用户相关响应隔离', '失效与预热'],
              """Cache-Control: public, max-age=31536000, immutable
ETag: "course-42-v3"

# 用户相关
Cache-Control: private, no-store
Vary: Authorization""",
              '静态资源 /assets/app-7f2a.js → 1 年 immutable\n/api/my/progress → private, no-store\n课程更新后 CDN 按 key 失效',
              '把带用户信息的 API 配成 public 缓存，会把 A 的进度发给 B；用户响应必须 private/no-store。',
              '为课程社区设计静态资源、公开课程和用户进度三类缓存策略，并写出失效方式。'),
            C('消息队列、异步与降级',
              '不是所有工作都适合同步做。队列解耦耗时任务，也带来重复、顺序和失败处理的新问题。',
              ['同步与异步边界', '队列与消费者', '重试与死信', '幂等消费', '限流、熔断与降级'],
              """# 发布课程后异步生成搜索索引
publishCourse -> queue.publish("course.published", {courseId:42})

# 消费失败重试 3 次后进死信队列
retry: 3
dlq: course-index-dlq""",
              '发布接口 P95 从 800ms 降到 120ms\n索引任务异步完成\n重复消息不重复写索引',
              '把关键路径全部异步化，用户看不到结果还以为失败；只异步可延迟、可重试的工作。',
              '把“生成课程搜索索引”改成异步任务，设计重试、死信、幂等和失败告警。'),
            C('压测、火焰图与性能基线',
              '性能优化必须先有基线。压测要模拟真实请求比例，火焰图用来定位 CPU/锁/GC，而不是猜。',
              ['压测工具与场景', 'QPS / P95 / 错误率', '火焰图与采样', '数据库慢查询', '优化前后对比'],
              """k6 run load.js
# stages: 1m 50 VU -> 3m 200 VU -> 1m 0

EXPLAIN ANALYZE
SELECT * FROM courses WHERE published = true ORDER BY created_at DESC LIMIT 20;""",
              '基线：200 VU，P95=900ms，错误率 0.2%\n优化后：P95=420ms，错误率 0.1%\n慢查询从 300ms 降到 30ms',
              '不压测就直接加机器，可能瓶颈在数据库连接池；先定位再扩容。',
              '为课程列表做一次压测，记录 QPS、P95、错误率和数据库慢查询，再做一个可复测的优化。'),
            C('可观测性与架构扩展',
              '架构扩展不是一上来就微服务。先看瓶颈是读、写、连接还是外部依赖，再选择缓存、读写分离、分片或异步。',
              ['日志 / 指标 / 追踪', '单机纵向扩展', '读写分离与分片', '无状态与服务拆分', '容量规划与成本'],
              """trace: GET /api/courses
  db.query 180ms
  cache.get 2ms
  serialize 12ms

# 先加只读副本和缓存，再考虑分片
readReplica: 2
cache: redis""",
              '追踪显示 80% 时间在数据库\n加只读副本 + 列表缓存后 P95 下降 55%\n单机 CPU 仍 < 50%',
              '没有指标就拆微服务，会把一个数据库问题变成十个服务问题；先定位单点瓶颈。',
              '为课程社区做一次容量规划：当前瓶颈、第一扩展手段、验证指标和成本估算。')
        ]
    },
    {
        'id': 'capstone',
        'index': 8,
        'title': '全栈项目实战',
        'en': 'CAPSTONE PROJECT',
        'logo': 'CP',
        'accent': '#C084FC',
        'kicker': 'CAPSTONE · FULL COURSE · FIVE PARTS',
        'project': '从 PRD 到上线：独立交付一个可登录、可学习、可运营的课程社区',
        'source': '需求分析、架构设计、API 契约、测试、部署与复盘全流程',
        'materialLabel': 'PRD / 架构 / 交付',
        'languageLabel': 'markdown',
        'sidebarTitle': '全栈项目<br>实战',
        'sidebarNote': '把前面学过的技术合成一个能交付的项目：选题、PRD、用户故事、架构、数据模型、API、后端、前端、测试、CI、部署、监控、文档和演示。50 课以交付为导向。',
        'topics': ['选题、PRD 与用户故事', '架构、数据模型与 API 契约', '后端、前端与权限实现', '测试、CI、部署与监控', '文档、演示与复盘'],
        'overviewSub': '最后一门课不再孤立讲知识点，而是把<strong>需求、架构、数据、API、前后端、测试、部署和运营</strong>串成一个真实项目。你会从 PRD 开始，做出一个可登录、可学习、可发布课程、可查看进度的课程社区，并完成上线、监控和复盘。',
        'outcomes': [
            {'title': '能定义范围', 'desc': '把“做个学习网站”拆成可验收的用户故事，知道这一版做什么、不做什么。'},
            {'title': '能独立交付', 'desc': '从数据模型到 API、前端、测试、CI 和部署，形成一条可运行的闭环。'},
            {'title': '能解释取舍', 'desc': '说清架构选择、风险、未完成项和下一步，而不是只展示截图。'}
        ],
        'routeNote': '01–02 选题、PRD、用户故事与验收 → 03–04 架构、数据模型、迁移与 API 契约 → 05–06 权限、后端与前端实现 → 07–08 测试、CI、部署与监控 → 09–10 文档、演示、复盘与迭代计划。',
        'sourceNote': '项目按 4 周节奏设计；每周有明确交付物和验收标准，可按实际时间缩放。',
        'parts': [
            {'title': '定义产品', 'note': '选题、PRD、用户故事、范围与验收'},
            {'title': '设计系统', 'note': '架构、数据模型、迁移、API 与权限'},
            {'title': '实现闭环', 'note': '后端、前端、登录、课程与进度'},
            {'title': '质量与上线', 'note': '测试、CI、部署、监控与回滚'},
            {'title': '交付与复盘', 'note': '文档、演示、事故复盘与下一版计划'}
        ],
        'chapters': [
            C('选题、PRD 与范围',
              '好的项目从“谁的问题”开始，而不是从技术栈开始。PRD 要写清目标用户、核心场景、范围和成功标准。',
              ['目标用户与痛点', '核心场景', '范围内 / 范围外', '成功指标', '风险与依赖'],
              """# 课程社区 PRD v1
目标用户：需要系统学习后端的学生
核心场景：浏览课程 → 登录 → 学习课节 → 记录进度
范围内：课程、课节、登录、进度、后台发布
范围外：支付、直播、推荐算法
成功标准：10 名真实用户完成 3 节课，P95 < 800ms""",
              'PRD 1 页：用户、场景、范围、指标、风险\n范围外清单明确 3 项\n验收人确认',
              '一上来就写“类似 Udemy”，范围会无限膨胀；先锁定这一版的最小闭环。',
              '写一页课程社区 PRD，包含目标用户、3 个核心场景、范围内外和 3 个成功指标。'),
            C('用户故事与验收标准',
              '用户故事描述价值，验收标准描述可验证的结果。没有验收标准的故事，开发完也无法判断是否完成。',
              ['故事格式与 INVEST', '验收标准 Given/When/Then', '优先级与依赖', '估算与拆分', '完成定义'],
              """作为学习者，我希望标记课节完成，以便知道自己的进度。
Given 已登录且打开课节
When 点击“标记完成”
Then 进度增加 1，刷新后仍保留
And 重复点击不重复计数""",
              '故事卡：3 条验收标准\n优先级 P0 / P1\n估算 2 天，拆成 API + UI + 测试',
              '验收标准写成“做好看一点”，无法判断完成；用可观察的结果描述。',
              '把“学习课程”拆成 3 个用户故事，每个写 2–4 条 Given/When/Then 验收标准。'),
            C('架构选型与技术方案',
              '架构不是画得越复杂越专业。根据团队、流量、交付时间和运维能力，选够用且能演进的方案。',
              ['单体与分层', '技术栈选择', '同步与异步边界', '第三方依赖', '架构决策记录 ADR'],
              """# ADR-001：先单体分层，不拆微服务
状态：接受
背景：1 人开发，4 周交付，日活 < 1000
决策：Spring Boot 单体 + PostgreSQL + 对象存储
后果：部署简单；后续按模块拆分，不按技术拆""",
              'ADR 记录背景、决策、替代方案和后果\n架构图：Web → API → DB / 对象存储\n不引入未验证的中间件',
              '为了简历堆 Kafka、微服务和 K8s，4 周项目 3 周在搭环境；先保证闭环。',
              '写 2 条 ADR：技术栈选择、同步/异步边界，并画出课程社区的最小架构图。'),
            C('数据模型、迁移与种子数据',
              '数据模型决定后面查询、权限和扩展的难度。先画实体关系，再写迁移，最后准备可重复的种子数据。',
              ['实体与关系', '主键、外键与索引', '迁移版本', '种子数据', '数据保留与删除'],
              """users(id, email, role)
courses(id, title, slug, owner_id, published)
lessons(id, course_id, title, position)
progress(user_id, lesson_id, completed_at, UNIQUE(user_id, lesson_id))""",
              '迁移 V1 建表；V2 加索引\nseed：3 门课程、12 节课、2 个用户\nprogress 唯一约束防重复',
              '直接改生产表结构、不写迁移，下一次部署就无法重建；所有 schema 变更进版本化迁移。',
              '画出课程社区 ER 图，写一份初始迁移和可重复执行的种子数据。'),
            C('API 契约与权限矩阵',
              '先把 API 契约和权限矩阵定下来，前后端才能并行开发，越权风险也能提前暴露。',
              ['资源与端点清单', '请求响应 schema', '角色与权限矩阵', '错误码', 'OpenAPI 与 Mock'],
              """| 端点 | 学生 | 老师 | 管理员 |
| GET /courses | 读 | 读 | 读 |
| POST /courses | - | 写 | 写 |
| PATCH /courses/:id | - | 仅自己 | 任意 |
| POST /progress | 写 | 写 | 写 |""",
              '权限矩阵 4 个端点 × 3 角色\nOpenAPI 含 200/401/403/422\n前端用 Mock 并行开发',
              '权限只写在页面按钮，API 仍可被直接调用；矩阵要落到服务端资源检查。',
              '为课程社区写端点清单、权限矩阵和 OpenAPI 骨架，并用 Mock 让前端先跑起来。'),
            C('后端实现：课程与进度',
              '后端实现按“迁移 → Repository → Service → Controller → 测试”推进，每层只做自己的事。',
              ['分层与依赖注入', '课程 CRUD', '进度幂等', '事务与约束', '错误契约'],
              """@Transactional
public void complete(long userId, long lessonId) {
  Progress p = repo.find(userId, lessonId).orElseGet(Progress::new);
  if (p.isCompleted()) return; // 幂等
  p.markCompleted(clock.instant());
  repo.save(p);
}""",
              'POST /api/progress → 204\n重复 POST → 204，progress 仍为 1\n未登录 → 401，越权 → 403',
              '进度接口不幂等，用户双击就多算一次；用唯一约束 + 状态检查。',
              '实现课程列表、详情、发布和进度接口，覆盖事务、幂等、401/403/422 和集成测试。'),
            C('前端实现：页面、状态与体验',
              '前端按页面壳、路由、数据层和组件推进。先跑通一条学习链路，再补空态、错态和手机布局。',
              ['页面与路由', '请求层与缓存', '表单与错误态', '响应式与键盘', '端到端链路'],
              """<Routes>
  <Route path="/courses" element={<CoursesPage />} />
  <Route path="/courses/:id" element={<CoursePage />} />
  <Route path="/login" element={<LoginPage />} />
</Routes>""",
              '/courses 列表 → /courses/42 详情 → 登录 → 标记完成 → 刷新仍在\n390px 无横向滚动\n键盘可完成主链路',
              '只做桌面主流程，手机和错误态全靠用户碰运气；把空、错、加载和手机列入验收。',
              '实现课程列表、详情、登录和进度四条页面链路，并在 1440 与 390 下完成验收。'),
            C('测试、CI 与发布流水线',
              '项目级测试要覆盖关键链路和错误路径。CI 把测试、构建、镜像和部署串起来，发布不再靠手工。',
              ['测试范围与用例', '单元 / 集成 / E2E', 'CI 流水线', '镜像与版本', '发布检查'],
              """PR → lint + unit + integration + build
main → 上述全部 + 镜像 + 部署 staging
tag → 生产发布 + 健康检查 + 回滚镜像保留""",
              'CI 全绿才能合并\nstaging 健康检查通过才允许生产\n版本号 = git tag，镜像可追溯',
              '本地测试通过就发布，环境差异会在生产暴露；至少有一套接近生产的 staging。',
              '为课程社区配 PR 和 main 两条流水线，包含测试、构建、staging 部署和发布门禁。'),
            C('部署、监控与回滚',
              '上线不是终点。健康检查、日志、指标、告警和回滚，决定出问题时能否快速恢复。',
              ['生产部署拓扑', '健康与就绪检查', '日志与指标', '告警与值班', '回滚演练'],
              """GET /api/health → {"status":"UP"}
GET /api/ready → DB 连接正常
告警：5xx > 1% 持续 5 分钟
回滚：保留上一镜像 + 数据库迁移兼容""",
              '发布后 health 200，ready 200\n错误率与 P95 在仪表盘可见\n模拟失败后 5 分钟内回滚成功',
              '只配健康检查不配就绪检查，数据库没连上也显示健康；依赖可用性要单独检查。',
              '完成一次生产部署，配健康/就绪检查、错误率告警和回滚演练，记录耗时。'),
            C('文档、演示与复盘',
              '交付物不只是代码。README、API 文档、架构图、演示脚本和复盘，决定别人能否接手和继续迭代。',
              ['README 与启动说明', 'API 与架构文档', '演示脚本', '已知问题与风险', '复盘与下一版计划'],
              """# 课程社区
## 启动
cp .env.example .env && docker compose up -d
## 验收
- 登录 → 学习 → 进度保留
- 老师发布课程 → 学生可见
## 已知问题
- 搜索仅标题，不含全文
## 下一版
- 课程评论、学习 streak、导出进度""",
              'README 5 分钟可跑通\n演示 8 分钟覆盖主链路\n复盘：3 个做得好、3 个问题、3 个下一步',
              '交付只发一个压缩包，没有启动说明和已知问题，接手人从零猜；文档和代码一起交付。',
              '写 README、演示脚本和一页复盘，找一位同学按文档独立跑通并记录卡点。')
        ]
    }

]

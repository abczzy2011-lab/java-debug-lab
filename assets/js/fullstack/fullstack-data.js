/* 全栈开发路线：10 个大科目、4 个阶段。
   这是课程框架数据，不代表内容已经写完；status 明确区分「已有底座」与「待建设」。 */
window.FULLSTACK_TRACK = {
  version: '20261126z77',
  title: '全栈开发',
  kicker: 'CAREER TRACK · FULL STACK · 10 SUBJECTS',
  lead: '从语言基础走到能独立交付、部署和维护一个真实产品。',
  stages: [
    { id: 'base', no: '01', name: '基础层', subtitle: '工程素养、网络与数据' },
    { id: 'build', no: '02', name: '应用层', subtitle: '后端、前端与 API' },
    { id: 'ship', no: '03', name: '交付层', subtitle: '测试、部署、安全与性能' },
    { id: 'capstone', no: '04', name: '实战层', subtitle: '一个能上线的毕业项目' }
  ],
  bases: [
    { label: 'Java 50 课', note: '语言 / OOP 底座', href: './java-course.html?v=20261125z70' },
    { label: 'Python 76 节', note: '脚本 / 数据底座', href: './python-course.html?v=20261125z73' },
    { label: 'JavaScript 76 节', note: 'Web 基础底座', href: './javascript-course.html?v=20261125z73' },
    { label: '算法专项', note: '复杂度与逻辑', href: './algorithm.html?v=20261125z51b' }
  ],
  modules: [
    {
      id: 'foundation', no: '01', stage: 'base', title: '工程基础与 Git', en: 'ENGINEERING FOUNDATION',
      status: 'partial', statusLabel: '已有语言底座 · 工程流程待补',
      summary: '会写代码不等于会协作。先把 Git、Linux、调试、代码规范和需求拆解补齐，后续每个项目才有可重复的工程流程。',
      topics: ['Git 分支 / 合并 / 冲突 / 回滚', 'Linux 文件、权限、进程、端口与日志', '断点调试、堆栈阅读与日志分级', '目录结构、代码规范与 Code Review', '需求拆解、任务估算与技术文档'],
      deliverable: '用 Git 管理一个多人仓库：能开分支、提 PR、处理冲突、回滚版本，并留下可复现的 README。',
      existing: [
        { label: 'Java 课程', href: './java-course.html?v=20261125z70' },
        { label: 'Python 课程', href: './python-course.html?v=20261125z73' },
        { label: 'JavaScript 课程', href: './javascript-course.html?v=20261125z73' }
      ]
    },
    {
      id: 'network', no: '02', stage: 'base', title: '计算机网络与 HTTP', en: 'NETWORK & HTTP',
      status: 'missing', statusLabel: '待搭建 · 结构已定',
      summary: '全栈排错绕不开网络。要能从浏览器地址栏一路追到 DNS、TCP、TLS、反向代理和后端端口，而不是只会重启服务。',
      topics: ['TCP/IP、DNS 与端口', 'HTTPS / TLS 握手与证书', 'HTTP/1.1、HTTP/2、HTTP/3', 'WebSocket 与 SSE 实时通道', 'CDN、代理、Nginx 与超时链路'],
      deliverable: '画出并解释一次请求的完整链路，能用 curl 和浏览器工具定位 DNS、TLS、状态码与超时问题。'
    },
    {
      id: 'database', no: '03', stage: 'base', title: '数据库与数据建模', en: 'DATABASE & DATA MODELING',
      status: 'missing', statusLabel: '待搭建 · 结构已定',
      summary: '后端真正的难点通常在数据。要会设计表、写 SQL、看执行计划，理解事务隔离、索引和缓存，而不是把一切塞进 JSON。',
      topics: ['SQL 查询、聚合与窗口函数', '表设计、范式、外键与约束', '索引、执行计划与慢查询', '事务、隔离级别、锁与连接池', 'Redis、NoSQL、迁移与备份'],
      deliverable: '为内容社区设计 8 张表，写迁移、索引和 10 条核心查询，并解释一次慢查询优化。'
    },
    {
      id: 'backend', no: '04', stage: 'build', title: '后端工程', en: 'BACKEND ENGINEERING',
      status: 'partial', statusLabel: '已有语言课 · 框架与服务待补',
      summary: '从“会写类和方法”升级到“能交付服务”。重点是分层、参数校验、异常、日志、ORM、分页、上传和后台任务。',
      topics: ['Spring Boot / FastAPI / Express', 'Controller / Service / Repository 分层', 'REST 接口、参数校验与统一错误码', 'ORM、连接池、事务边界', '分页、文件上传、任务调度与配置'],
      deliverable: '从零实现一个有登录、CRUD、分页、文件上传和统一错误响应的后端服务。',
      existing: [
        { label: 'Java 课程', href: './java-course.html?v=20261125z70' },
        { label: 'Python 课程', href: './python-course.html?v=20261125z73' }
      ]
    },
    {
      id: 'frontend', no: '05', stage: 'build', title: '前端工程', en: 'FRONTEND ENGINEERING',
      status: 'partial', statusLabel: '已有 JS 课程 · 框架与工程化待补',
      summary: '前端不只是写页面。要能组织组件、状态、路由、表单和请求层，用 TypeScript 和构建工具把界面做成可维护的产品。',
      topics: ['TypeScript 类型与泛型', 'React / Vue 组件与状态', '路由、表单、请求层与错误态', 'Vite、构建产物与环境变量', '响应式、可访问性与交互细节'],
      deliverable: '用 React 或 Vue + TypeScript 完成一个多页面前端，接真实 API，桌面和手机都能稳定使用。',
      existing: [
        { label: 'JavaScript 课程', href: './javascript-course.html?v=20261125z73' },
        { label: 'JavaScript 练习场', href: './javascript-practice.html?v=20261125z73' }
      ]
    },
    {
      id: 'api-auth', no: '06', stage: 'build', title: 'API 设计与身份认证', en: 'API & AUTH',
      status: 'missing', statusLabel: '待搭建 · 结构已定',
      summary: '前后端之间的契约要能被人和机器同时读懂。REST、OpenAPI、JWT/OAuth、权限模型和限流幂等，是全栈项目的骨架。',
      topics: ['REST 资源建模、状态码与错误格式', 'OpenAPI 文档与接口版本', 'GraphQL、WebSocket 的适用边界', 'Session、JWT、OAuth2 与刷新令牌', 'RBAC、越权、幂等、限流与审计'],
      deliverable: '写一份 OpenAPI 文档，并实现 JWT 登录、角色权限、刷新令牌和基础限流。'
    },
    {
      id: 'testing', no: '07', stage: 'ship', title: '测试与质量', en: 'TESTING & QUALITY',
      status: 'missing', statusLabel: '待搭建 · 结构已定',
      summary: '能上线不等于敢上线。用测试金字塔把核心逻辑、接口和用户链路分层锁住，再让 CI 在合并前自动把关。',
      topics: ['测试金字塔与测试边界', '单元测试、Mock 与 fixture', '接口集成测试与测试数据库', 'Playwright 端到端测试', '覆盖率、回归与 CI 质量门禁'],
      deliverable: '核心 API 单测 + 一条端到端链路 + CI 自动运行，失败时阻止合并。'
    },
    {
      id: 'devops', no: '08', stage: 'ship', title: 'DevOps 与云部署', en: 'DEVOPS & DEPLOYMENT',
      status: 'missing', statusLabel: '待搭建 · 结构已定',
      summary: '把项目从本机搬到公网，并且能维护。Linux、Docker、Nginx、CI/CD、HTTPS、日志、监控和回滚是一整套交付能力。',
      topics: ['Linux 服务、进程与端口', 'Docker / Compose 与环境隔离', 'Nginx、反向代理与 HTTPS', 'GitHub Actions 与自动发布', '健康检查、日志、监控、备份与回滚'],
      deliverable: 'push 即自动构建、测试、部署；线上有健康检查、日志、备份和一键回滚。'
    },
    {
      id: 'security-performance', no: '09', stage: 'ship', title: '安全、性能与架构', en: 'SECURITY, PERFORMANCE & ARCHITECTURE',
      status: 'missing', statusLabel: '待搭建 · 结构已定',
      summary: '能跑之后要问“安全吗、撑得住吗、以后怎么扩”。从 OWASP 到缓存、队列、压测和可观测性，建立生产级判断力。',
      topics: ['OWASP Top 10、XSS / CSRF / SQL 注入', '密钥管理、CSP、HTTPS 与最小权限', '缓存、CDN、消息队列与异步', '压测、火焰图与可观测性', '分层、微服务边界与扩展策略'],
      deliverable: '完成一次安全清单审计和一次压测，给出瓶颈、缓存策略与扩容方案。'
    },
    {
      id: 'capstone', no: '10', stage: 'capstone', title: '全栈项目实战', en: 'CAPSTONE PROJECT',
      status: 'missing', statusLabel: '待搭建 · 毕业项目',
      summary: '把前面九科合成一个真实产品：有需求、有架构、有数据、有权限、有测试、有部署、有文档，也有可演示的完整闭环。',
      topics: ['PRD、用户故事与验收标准', '架构图、API 契约与数据模型', '前端、后端与权限实现', '测试、CI/CD 与线上部署', 'README、演示、复盘与迭代'],
      deliverable: '交付一个公网可访问的全栈项目：账号权限、核心业务、测试、CI/CD、README 和演示。',
      existing: [
        { label: 'Java 输出实现场', href: './java-output.html?v=20261126z76' },
        { label: 'Python 输出实现场', href: './python-output.html?v=20261126z76' },
        { label: 'JavaScript 输出实现场', href: './javascript-output.html?v=20261126z76' }
      ]
    }
  ],
  graduation: [
    '能用 Git 独立管理一个多人项目，处理分支、冲突、回滚和 PR 审查',
    '能解释一次请求从 DNS、TLS、HTTP 到后端和数据库的完整链路',
    '能为一个业务设计表结构、索引、事务边界和迁移脚本',
    '能用 Spring Boot、FastAPI 或 Express 交付带认证的 REST API',
    '能用 React 或 Vue + TypeScript 交付多页面、响应式前端',
    '能写单测、集成测试和一条 Playwright 端到端链路，并接入 CI',
    '能用 Docker、Nginx、GitHub Actions 把项目部署到公网并可回滚',
    '能完成安全审计、压测和一次有证据的性能优化',
    '能独立交付一个有账号权限、核心业务、文档和演示的全栈项目'
  ]
};

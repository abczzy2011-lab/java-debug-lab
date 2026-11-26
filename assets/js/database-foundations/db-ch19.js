window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch19',
  part: 5,
  number: '19',
  title: '毕业项目：学习社区数据库',
  summary: '把前 18 章压到一个真实项目：用户、课程、课节、报名、进度、帖子、评论、点赞、标签，全部落成表、迁移、查询、索引和 API 契约，再做压测和优化。',
  goals: ['从需求产出 10 张表的 ER 图', '写迁移、种子与核心查询', '为高频接口设计索引与 API 契约', '用压测和 EXPLAIN 交付优化证据'],
  source: '课程社区项目实战；PostgreSQL 16 文档',
  lessons: [
    {
      id: 'db-19-1',
      title: '19.1 需求、ER 图与表结构',
      minutes: 70,
      lead: '毕业项目的第一天不写代码，先把数据模型定下来。模型错了，后面所有查询、索引和接口都在补洞。',
      source: '课程社区项目实战',
      sections: [
        {
          h: '需求边界与 10 张核心表',
          p: `项目目标：一个课程社区，用户可以注册、浏览课程、报名、学习课节、发帖、评论、点赞；教师可以建课、排课；运营可以打标签、审核帖子。

10 张核心表：[[users]]、[[courses]]、[[lessons]]、[[enrollments]]、[[posts]]、[[comments]]、[[post_likes]]、[[tags]]、[[course_tags]]、[[audit_logs]]。支付与订单作为扩展表，不在主链路里。

关键关系：users—courses 通过 enrollments 多对多；courses—lessons 一对多；posts—comments 一对多（自引用）；users—posts 多对多通过 post_likes；courses—tags 多对多。`,
          code: `-- 核心表清单（简化字段）
users(id, email, handle, password_hash, created_at)
courses(id, slug, title, summary, price_cents, status, owner_id)
lessons(id, course_id, slug, title, position, body)
enrollments(id, user_id, course_id, progress, status, enrolled_at)
posts(id, course_id, user_id, title, body, created_at)
comments(id, post_id, user_id, parent_id, body, created_at)
post_likes(user_id, post_id, created_at)
tags(id, name)
course_tags(course_id, tag_id)
audit_logs(id, actor_id, action, resource, resource_id, created_at)`,
          output: `-- 10 张表覆盖学习与社区主链路
-- 订单/支付作为后续扩展`,
          tip: `先画关系，再写字段。字段可以迭代，关系方向改起来代价更大。`
        },
        {
          h: '约束与状态：把规则写进结构',
          p: `每个用户邮箱唯一、handle 唯一；课程 slug 唯一；同一用户同一课程只能报名一次；同一用户对同一帖子只能点赞一次；课节 position 在同一课程内唯一。

课程状态 draft/published/archived；报名状态 active/completed/refunded；进度 0–100。帖子必须有作者和课程；评论的 parent_id 必须指向同一帖子（应用层或触发器校验）。

软删除只用于课程和帖子，报名用状态而不是删除。审计日志只追加，权限上应用账号只 INSERT，不 UPDATE/DELETE。`,
          code: `ALTER TABLE enrollments
  ADD CONSTRAINT enrollments_progress_check
  CHECK (progress BETWEEN 0 AND 100);

ALTER TABLE enrollments
  ADD CONSTRAINT enrollments_user_course_unique
  UNIQUE (user_id, course_id);

ALTER TABLE post_likes
  ADD PRIMARY KEY (user_id, post_id);

ALTER TABLE comments
  ADD CONSTRAINT comments_parent_fk
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE;`,
          output: `-- 进度范围、报名唯一、点赞唯一、评论父子关系
-- 规则由数据库兜底`,
          tip: `评论 parent_id 的“同一帖子”约束外键做不到，需要触发器或应用层校验，并在测试里覆盖。`
        }
      ],
      points: ['10 张表覆盖学习与社区主链路', '关系方向先定，字段后迭代', '唯一、范围、状态约束写进数据库', '软删除只用于合适实体，审计只追加'],
      practice: '画出 10 张表的 ER 图，标出 4 个多对多关系、3 个唯一约束和 2 个状态字段。'
    },
    {
      id: 'db-19-2',
      title: '19.2 核心查询、索引与 API 契约',
      minutes: 70,
      lead: '表建好后，用真实接口反推查询和索引：课程列表、课程详情、我的课程、帖子流、帖子详情、发帖、评论、点赞。每条接口都要有明确的输入、输出和错误。',
      source: '课程社区项目实战；OpenAPI 实践',
      sections: [
        {
          h: '五个高频查询与索引',
          p: `1）课程列表：[[WHERE status='published' AND deleted_at IS NULL ORDER BY created_at DESC, id DESC LIMIT 20]]；索引 [[(status, created_at DESC, id DESC) WHERE deleted_at IS NULL]]。

2）课程详情：按 slug 取课程 + 课节；slug 唯一索引；课节 [[(course_id, position)]]。

3）我的课程：[[WHERE user_id=? ORDER BY enrolled_at DESC]]；索引 [[(user_id, enrolled_at DESC)]]。

4）帖子流：[[WHERE course_id=? ORDER BY created_at DESC, id DESC]]；索引 [[(course_id, created_at DESC, id DESC)]]。

5）帖子详情 + 评论：帖子主键；评论 [[(post_id, created_at)]]；点赞计数用 [[COUNT]] 或缓存。`,
          code: `CREATE INDEX courses_feed_idx
  ON courses (status, created_at DESC, id DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX enrollments_user_feed_idx
  ON enrollments (user_id, enrolled_at DESC);

CREATE INDEX posts_course_feed_idx
  ON posts (course_id, created_at DESC, id DESC);

CREATE INDEX comments_post_feed_idx
  ON comments (post_id, created_at ASC, id ASC);`,
          output: `-- 课程流、我的课程、帖子流、评论流各有专用索引
-- 索引列顺序匹配过滤 + 排序`,
          tip: `索引不是按表建，是按查询建。先列出 5 条高频 SQL，再决定索引，不要先建十个再猜。`
        },
        {
          h: 'API 契约与错误边界',
          p: `每个接口定义：方法、路径、鉴权、请求体、成功响应、错误码。例如 [[GET /api/courses?cursor=...]] 返回 [[items, nextCursor]]；[[POST /api/courses/:id/enroll]] 返回 201 或 409（已报名）。

错误不要都返回 500。参数错误 400，未登录 401，无权限 403，资源不存在 404，冲突 409，限流 429。数据库唯一约束冲突要映射成 409，而不是把 SQL 错误暴露给前端。

分页统一游标，列表响应带 [[nextCursor]]；写接口幂等键可选，支付/报名类接口必须考虑重复提交。`,
          code: `GET /api/courses?status=published&cursor=...
200 {
  "items": [{ "id": 1, "slug": "sql-basics", "title": "SQL 基础" }],
  "nextCursor": "2026-11-27T10:00:00+08:00:42"
}

POST /api/courses/1/enroll
201 { "enrollmentId": 9, "status": "active" }
409 { "error": "ALREADY_ENROLLED" }`,
          output: `-- 列表用游标，写接口明确冲突码
-- 前端不需要理解数据库错误`,
          tip: `不要把数据库主键直接暴露成业务 ID，除非你接受外部猜 ID。对外可用 slug/UUID，内部仍用 bigint。`
        }
      ],
      points: ['索引按 5 条高频查询设计', '课程流/我的课程/帖子流/评论流各有索引', 'API 错误码映射数据库冲突', '列表统一游标分页'],
      practice: '为课程社区写 5 个接口的契约：方法、路径、鉴权、成功响应、3 个错误码。'
    },
    {
      id: 'db-19-3',
      title: '19.3 压测、优化与交付验收',
      minutes: 70,
      lead: '最后一步不是“我觉得够快”，而是有数据：多少请求、多少并发、P95 多少毫秒、数据库 CPU 多少、慢查询有没有。优化前后要有对比。',
      source: '课程社区项目实战；压测实践',
      sections: [
        {
          h: '压测场景与指标',
          p: `先定义场景：课程列表 60%、课程详情 20%、我的课程 10%、发帖/评论 10%。用 k6/JMeter/ab 压 5–10 分钟，记录 RPS、P50/P95/P99、错误率、数据库连接数、CPU、慢查询。

不要只压一个接口。写接口和读接口混合，才能暴露锁竞争和连接池瓶颈。压测数据要接近真实：几千门课、几万用户、几十万报名。

优化前先保存基线：同一数据量、同一机器、同一脚本。优化后再跑一次，不要换环境比较。`,
          code: `# k6 场景示例
import http from 'k6/http';
export const options = {
  stages: [
    { duration: '1m', target: 50 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 0 }
  ]
};
export default function () {
  http.get('https://example.com/api/courses?limit=20');
}`,
          output: `-- 逐步加压到 100 并发，记录 P95 与错误率
-- 混合场景应加入写请求`,
          tip: `压测不要打生产库。用独立环境 + 脱敏数据；否则会把真实用户拖慢。`
        },
        {
          h: '交付清单：能运行、能恢复、能解释',
          p: `毕业交付至少包含：ER 图、迁移文件、种子数据、核心查询与索引、API 契约、压测报告、备份恢复演练记录、权限清单。

验收标准：新环境从零迁移 + 种子能启动；5 条核心接口 P95 在目标内；一条慢查询有 EXPLAIN 前后对比；数据库备份能恢复到新实例；应用账号无 SUPERUSER。

项目文档写“为什么这样设计”，不只写“怎么启动”。面试和团队交接时，设计取舍比命令列表更有价值。`,
          code: `交付目录建议：
db/
  migrations/
  seeds/
  er-diagram.png
  queries.sql
  indexes.sql
docs/
  api-contract.md
  load-test.md
  backup-restore.md
  permissions.md`,
          output: `-- 迁移、种子、查询、索引、文档齐全
-- 任何一条都能在新环境复现`,
          tip: `交付前删掉本地密码、测试 token 和真实用户数据；示例数据用合成数据。`
        }
      ],
      points: ['压测混合读写场景，记录 P95/P99', '优化前后同环境同数据对比', '交付包含迁移、种子、索引、API、压测、恢复', '文档解释设计取舍，不只写启动命令'],
      practice: '为课程社区写一份毕业交付清单，至少 8 项，并给每条定一个可验证的验收标准。'
    }
  ]
});

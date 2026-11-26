window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch11',
  part: 3,
  number: '11',
  title: '范式与反范式',
  summary: '范式是在消除冗余和更新异常，反范式是在为读性能做有意识的妥协。先知道 1NF/2NF/3NF 在解决什么，再决定哪里可以合并、哪里必须拆开。',
  goals: ['判断一张表是否满足 1NF/2NF/3NF', '识别更新异常与冗余', '知道什么时候反范式', '给 JSON 字段划边界'],
  source: '数据库系统概念 · 规范化；SQL 反模式',
  lessons: [
    {
      id: 'db-11-1',
      title: '11.1 1NF、2NF 与 3NF',
      minutes: 55,
      lead: '范式不是考试名词。它对应三类真实问题：一格塞多个值、组合键里的部分依赖、非键列之间的传递依赖。每一条都在防止同一种数据被存两次。',
      source: '数据库系统概念 · Normalization；SQL 必知必会',
      sections: [
        {
          h: '1NF：一格只放一个原子值',
          p: `第一范式要求每个字段是原子的：不能把多个标签塞进 [['sql, database, backend']] 一个字符串，也不能把多行地址塞进一个字段。原子不等于“不能有结构”，而是“这个字段的值不能被业务拆开单独查询”。

违反 1NF 的典型后果：查“包含 database 标签的课程”只能 [[LIKE '%database%']]，会误匹配 [[database-design]]；更新一个标签要改整串文本；无法给标签建外键。

拆法：标签拆成 [[tags]] 和 [[course_tags]]；地址拆成省市区字段或独立地址表。JSON 字段可以存弱结构扩展，但高频查询的维度应该拆列。`,
          code: `-- 反例：一个字段塞多个标签
courses(id, title, tags)  -- tags = 'sql,database,backend'

-- 1NF：标签独立成表
tags(id, name)
course_tags(course_id, tag_id)`,
          output: `-- 每个标签一行，可连接、可索引、可唯一约束`,
          tip: `“原子”是相对于查询和更新而言。一个字段如果永远不会被拆开查，存成整体是可以的，比如一篇 Markdown 正文。`
        },
        {
          h: '2NF 与 3NF：消除部分依赖和传递依赖',
          p: `第二范式针对联合主键：非键列不能只依赖联合主键的一部分。比如 [[(course_id, lesson_id)]] 是主键，[[course_title]] 只依赖 course_id，不依赖 lesson_id；它应该回到课程表。

第三范式针对传递依赖：非键列不能依赖另一个非键列。比如 [[orders]] 里有 [[user_id]]、[[user_email]]，email 依赖 user_id，不直接依赖订单主键；用户改邮箱后历史订单会不一致，应该只存 user_id。

3NF 的表通常“一个事实只存一处”。这不是绝对目标；但如果同一事实存两处，就要有同步机制和失败预案。`,
          code: `-- 反例：订单表冗余用户邮箱
orders(id, user_id, user_email, total_cents)

-- 3NF：订单只存 user_id
orders(id, user_id, total_cents)
users(id, email)`,
          output: `-- 用户邮箱只在 users 存一份
-- 展示订单时 JOIN users 取当前邮箱`,
          tip: `订单历史可能需要“下单时的邮箱快照”，这和“当前邮箱”是两回事。要快照就明确命名 [[billing_email_snapshot]]，不要偷偷冗余。`
        }
      ],
      points: ['1NF 要求字段原子、可独立查询', '2NF 消除联合主键里的部分依赖', '3NF 消除非键列之间的传递依赖', '一个事实尽量只存一处'],
      practice: '找一张你写过的宽表，标出至少一个 2NF 或 3NF 违规，并写出拆表方案。'
    },
    {
      id: 'db-11-2',
      title: '11.2 什么时候可以反范式',
      minutes: 55,
      lead: '反范式不是“偷懒”，而是用受控冗余换读性能。前提是：你知道冗余什么、谁来同步、过期时怎么办。',
      source: '数据库系统概念 · Denormalization；生产数据库实践',
      sections: [
        {
          h: '三种常见的受控冗余',
          p: `第一，**计数缓存**：课程表存 [[enrollment_count]]，避免每次列表都 COUNT 连接表。它必须由触发器、事务或后台任务维护，并允许偶尔延迟。

第二，**派生展示字段**：帖子列表存 [[author_name]]，避免每行 JOIN 用户。用户改名后要么异步刷新，要么接受短暂旧值；历史审计场景不能这么做。

第三，**预聚合表**：日报、月报、排行榜单独建表，按批任务更新。它把 OLAP 负载从主库移走，代价是延迟和重建成本。

反范式的共同点是：读多写少、允许最终一致、有明确刷新路径。高写入、强一致的核心账务不要这么干。`,
          code: `-- 计数缓存：写入时同事务更新
UPDATE courses
SET enrollment_count = enrollment_count + 1
WHERE id = $1;

-- 列表查询不再 COUNT
SELECT id, title, enrollment_count
FROM courses
WHERE published = true
ORDER BY enrollment_count DESC;`,
          output: `-- 列表只读一列计数，不连接 enrollments
-- 代价是每次报名都要更新计数，且要防止丢更新`,
          tip: `计数缓存要用原子 [[+1]] 或事务，不要“先查再写”。并发下先查再写会丢更新。`
        },
        {
          h: '反范式之前先问三个问题',
          p: `第一，读性能真的卡在这里吗？先用 EXPLAIN 和压测证明，不要凭感觉加冗余。第二，冗余值由谁维护？应用、触发器、批任务，必须有唯一负责人。第三，不一致时业务能接受吗？能接受多久？

如果三个问题答不清，先保持范式。范式化的查询慢，可以用索引、缓存、只读副本解决；反范式带来的数据不一致，往往更难修。

物化视图是介于两者之间的方案：它保存查询结果，可定时或手动刷新，适合报表。它比手写冗余表更容易重建，但刷新期间可能读到旧数据。`,
          code: `CREATE MATERIALIZED VIEW course_enrollment_stats AS
SELECT c.id AS course_id,
       COUNT(e.id) AS enrollments
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
GROUP BY c.id;

REFRESH MATERIALIZED VIEW CONCURRENTLY course_enrollment_stats;`,
          output: `-- 物化视图保存聚合结果
-- CONCURRENTLY 刷新时尽量不阻塞读`,
          tip: `[[REFRESH ... CONCURRENTLY]] 需要唯一索引，且刷新本身仍有成本。不是所有物化视图都适合高并发。`
        }
      ],
      points: ['反范式是用受控冗余换读性能', '计数缓存、展示字段、预聚合是三种常见做法', '冗余必须有唯一维护者和刷新路径', '强一致核心账务不要随意反范式'],
      practice: '为一个课程列表设计计数缓存，写出写入维护 SQL 和失败补偿方案。'
    },
    {
      id: 'db-11-3',
      title: '11.3 JSON 字段的边界',
      minutes: 50,
      lead: 'JSONB 很灵活，但不能成为“懒得建模”的垃圾桶。哪些字段适合 JSON，哪些必须拆表，边界清楚才不会把数据库变成日志堆。',
      source: 'PostgreSQL 16 文档 · JSON Types；SQL 反模式',
      sections: [
        {
          h: 'JSONB 适合存什么',
          p: `适合：第三方回调的原始负载、可变的产品配置、不参与核心查询的扩展属性、事件快照。它们共同点是结构可能变化、查询需求弱、不需要外键约束。

不适合：用户、订单、课程这种核心实体；需要频繁过滤、排序、连接的字段；需要唯一、外键、CHECK 约束的关系。把它们塞进 JSON，数据库无法帮你守完整性。

PostgreSQL 的 JSONB 支持 [[->>]] 取字段、[[@>]] 包含查询、GIN 索引。但 JSONB 更新是整块重写，字段多了会放大 WAL；高频更新的大 JSON 不如拆列。`,
          code: `CREATE TABLE payment_events (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  provider    text NOT NULL,
  event_type  text NOT NULL,
  payload     jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);

SELECT id, payload->>'order_id' AS order_id
FROM payment_events
WHERE provider = 'stripe';`,
          output: `-- 原始回调负载完整保留，便于审计和重放
-- 核心订单信息仍在 orders 表，不依赖 JSON`,
          tip: `JSONB 不是无模式。应用仍要定义版本和字段约定，否则半年后没人知道 [[payload]] 里有什么。`
        },
        {
          h: 'JSONB 的索引与查询代价',
          p: `[[payload->>'status']] 是文本提取，普通 B-tree 索引不直接支持这个表达式；可以建表达式索引，或给常用字段建 GIN。GIN 适合包含查询 [[@>]]，不适合范围排序。

[[jsonb_path_ops]] 比默认 [[jsonb_ops]] 更小更快，但只支持部分操作符。选哪种要看查询模式，不要默认全建。

JSONB 越大，读写越贵。把高频字段提升为独立列，把低频扩展留在 JSON，是常见折中。`,
          code: `CREATE INDEX payment_events_payload_gin
  ON payment_events USING gin (payload jsonb_path_ops);

SELECT id
FROM payment_events
WHERE payload @> '{"status":"paid"}';`,
          output: `-- GIN 加速包含查询
-- 范围查询和排序仍应使用普通列`,
          tip: `不要在 JSONB 上做全表 [[->>]] 过滤再指望 B-tree；表达式索引和 GIN 是两种不同工具。`
        }
      ],
      points: ['JSONB 适合弱结构、低频查询、原始快照', '核心实体和关系不要塞 JSON', 'JSONB 更新整块重写，大字段高频更新要拆列', 'GIN 适合包含查询，范围排序用普通列'],
      practice: '列出你项目里 3 个 JSON 字段，判断哪些该拆列、哪些可以保留，并说明索引方案。'
    }
  ]
});

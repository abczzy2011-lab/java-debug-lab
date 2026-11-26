window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch09',
  part: 3,
  number: '09',
  title: '从需求到 ER 图',
  summary: '表结构不是先画出来的，是从业务语言里推导出来的。先找实体、属性和关系，再标基数，最后才落成表和键。ER 图是设计和沟通工具，不是装饰。',
  goals: ['从用户故事提取实体和属性', '标出一对一、一对多、多对多', '把 ER 图落成表和外键', '发现需求里的隐藏实体'],
  source: '数据库系统概念 · ER 模型；SQL 反模式',
  lessons: [
    {
      id: 'db-9-1',
      title: '9.1 实体、属性、关系与基数',
      minutes: 55,
      lead: '一份需求文档里，“用户可以报名课程，学习课节，提交作业”已经包含实体和关系。ER 图的任务是把这些名词和动词拆清楚，避免一上来就建一张大宽表。',
      source: '数据库系统概念 · Entity-Relationship Model',
      sections: [
        {
          h: '名词是候选实体，形容词是候选属性',
          p: `用户、课程、课节、报名、作业、提交，都是候选**实体**。实体的属性是它自带的事实：用户有邮箱、昵称、创建时间；课程有标题、价格、发布状态。属性不应该再包含另一个实体的完整副本。

“报名”既不是用户属性，也不是课程属性，而是一个独立实体/关系：它有自己的报名时间、进度、状态。把报名塞进用户表，会让一个用户只能报一门课；塞进课程表，会让一门课只能被一个用户报。

**关系**描述实体之间怎么连。ER 图里的菱形表示关系，线上写基数（1、N）。关系本身也可以有属性，这就是连接表。`,
          code: `-- 从一句话落成三个实体
-- “用户可以报名多门课程，每门课有多个课节”
users(id, email, name, created_at)
courses(id, slug, title, price_cents, published)
enrollments(id, user_id, course_id, progress, status, enrolled_at)
lessons(id, course_id, slug, title, position)`,
          output: `-- users 与 courses 通过 enrollments 形成多对多
-- courses 与 lessons 是一对多`,
          tip: `先列实体，再列属性。不要在 ER 阶段就决定 [[bigint]] 还是 [[uuid]]，那是落表阶段的事。`
        },
        {
          h: '基数决定外键放哪边',
          p: `一对一：比如用户和实名认证记录，外键可以放在任一边，但通常放在“ dependent ”那一边，并加 UNIQUE。一对多：外键放多的一边，课程在 courses，课节在 lessons.course_id。多对多：必须新建连接表。

基数不是“可能几个”，而是“业务允许几个”。课程可以有 0 个课节吗？用户必须属于某个组织吗？这些约束要在 ER 图上标出来，落表时变成 [[NOT NULL]] 或 [[CHECK]]。

如果两个实体之间有两种关系，比如“用户创建课程”和“用户报名课程”，它们是两条不同的关系，不能共用一个外键。`,
          code: `-- 一对一：一个用户一条实名记录
CREATE TABLE identity_verifications (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id bigint NOT NULL UNIQUE REFERENCES users(id),
  real_name text NOT NULL,
  verified_at timestamptz
);`,
          output: `-- user_id UNIQUE 保证一对一
-- 没有这条记录的用户仍然存在`,
          tip: `[[UNIQUE]] 是一对一的落表方式；没有 UNIQUE 就退化成一对多。`
        }
      ],
      points: ['名词多为实体，形容词多为属性', '关系本身可以有属性，连接表是实体', '基数决定外键方向与 UNIQUE', '不要把两种关系共用一个外键'],
      practice: '从“用户报名课程、学习课节、提交作业”提取 5 个实体，并标出它们的关系和基数。'
    },
    {
      id: 'db-9-2',
      title: '9.2 一对一、一对多、多对多的落表',
      minutes: 55,
      lead: 'ER 图上的线，最终要变成外键、连接表和唯一约束。三种关系各有标准落法，选错会让查询变复杂或数据变脏。',
      source: '数据库系统概念 · 关系模式设计；PostgreSQL 外键实践',
      sections: [
        {
          h: '三种关系的标准落法',
          p: `一对一：在从表放外键，并加 [[UNIQUE]]；主表不需要反向列。一对多：在多的一方放外键，指向一的一方主键。多对多：建连接表，两个外键，联合唯一。

连接表的主键可以是自增 ID，也可以是两个外键的联合主键。联合主键省一个 ID 列，但后续加业务字段、做外键引用时不如代理主键方便。全栈项目通常用代理主键 + 联合唯一。

不要用数组列代替多对多。[[course_ids bigint[]]] 看似省表，实际失去外键约束、连接查询和索引能力；除非是标签这种弱关系，否则不推荐。`,
          code: `-- 一对多
ALTER TABLE lessons
  ADD CONSTRAINT lessons_course_fk
  FOREIGN KEY (course_id) REFERENCES courses(id);

-- 多对多
CREATE TABLE course_tags (
  course_id bigint NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  tag_id    bigint NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (course_id, tag_id)
);`,
          output: `-- lessons 通过外键指向课程
-- course_tags 用联合主键保证不重复`,
          tip: `联合主键的顺序会影响索引前缀。[[PRIMARY KEY (course_id, tag_id)]] 适合按课程查标签；反过来查标签下的课程，需要另建索引。`
        },
        {
          h: '关系表也会长大，索引要提前想',
          p: `连接表往往比主表大。[[enrollments]] 可能有一百万行，按 [[user_id]] 查“我的课程”和按 [[course_id]] 查“课程学员”是两个高频方向。联合唯一 [[(user_id, course_id)]] 只能高效支持前者，后者需要单独索引 [[course_id]]。

一对多的外键列同样需要索引。[[lessons.course_id]] 不建索引，按课程查课节会全表扫描；[[ON DELETE CASCADE]] 删除课程时也要靠它找子行。

索引不是越多越好，但关系列是高频查询入口。先按真实查询建，再用 EXPLAIN 验证。`,
          code: `CREATE INDEX enrollments_course_idx
  ON enrollments (course_id, enrolled_at DESC);

CREATE INDEX lessons_course_position_idx
  ON lessons (course_id, position);`,
          output: `-- 按课程查学员、按课程排课节都能走索引`,
          tip: `联合索引用途取决于最左前缀。[[(course_id, enrolled_at)]] 能支持只查 course_id，不能支持只查 enrolled_at。`
        }
      ],
      points: ['一对一用 UNIQUE 外键', '一对多外键放多的一方', '多对多建连接表 + 联合唯一', '关系列要按查询方向建索引'],
      practice: '把“课程—标签—用户报名”落成 3 张表，写出外键、联合唯一和至少两个索引。'
    },
    {
      id: 'db-9-3',
      title: '9.3 从用户故事画 ER 图',
      minutes: 60,
      lead: '把一段产品需求变成 ER 图：先圈名词，再找动词，再问基数，最后检查隐藏实体。这一课用“课程社区”做一次完整推导。',
      source: '数据库设计实践；课程社区需求',
      sections: [
        {
          h: '把用户故事拆成实体和动作',
          p: `需求：用户注册后可以浏览课程、报名课程、学习课节、在课程下发帖、评论帖子、给帖子点赞。运营可以创建课程和课节，给课程打标签。

圈出的名词：用户、课程、课节、报名、帖子、评论、点赞、标签。动词：浏览（不落表）、报名（enrollments）、学习（progress）、发帖（posts）、评论（comments）、点赞（post_likes）、打标签（course_tags）。

“浏览”通常不落表，除非要做浏览历史；“学习进度”是报名记录上的字段，不是独立实体。点赞是多对多：用户和帖子，连接表 [[post_likes]]。`,
          code: `users(id, email, name, created_at)
courses(id, slug, title, summary, price_cents, published)
lessons(id, course_id, slug, title, position, body)
enrollments(id, user_id, course_id, progress, status, enrolled_at)
posts(id, course_id, user_id, title, body, created_at)
comments(id, post_id, user_id, parent_id, body, created_at)
post_likes(user_id, post_id, created_at)
tags(id, name)
course_tags(course_id, tag_id)`,
          output: `-- 8 张核心表覆盖用户、课程、学习、社区互动
-- 点赞与课程标签都是连接表`,
          tip: `“点赞”不要只存一个计数列。计数可以由 [[post_likes]] 聚合出来，直接存计数会在并发点赞时丢更新。`
        },
        {
          h: '检查隐藏实体、冗余和缺失约束',
          p: `隐藏实体常见有三类：**状态历史**（订单状态变更）、**权限**（角色与资源）、**审计**（谁改了什么）。需求没提，不代表以后不需要；先留字段或表，比事后迁移便宜。

冗余：课程表里不要存“报名人数”，那是由 enrollments 聚合出来的派生值；可以缓存，但不能当唯一真相。帖子表里不要存作者昵称，用户改昵称后历史帖子会不一致；存 user_id，展示时连接。

缺失约束：评论的 parent_id 必须指向同一帖子的评论；帖子必须属于已发布课程；点赞不能重复。这些要在表约束或应用层写清楚。`,
          code: `ALTER TABLE comments
  ADD CONSTRAINT comments_parent_fk
  FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE;

ALTER TABLE post_likes
  ADD PRIMARY KEY (user_id, post_id);

ALTER TABLE posts
  ADD CONSTRAINT posts_course_fk
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE;`,
          output: `-- 评论可级联删除；点赞防重复；帖子随课程删除`,
          tip: `[[parent_id]] 外键只能保证“父评论存在”，不能保证“同一帖子”。跨行一致性要用触发器或应用层校验。`
        }
      ],
      points: ['用户故事先圈名词，再找动词', '浏览通常不落表，进度是报名字段', '点赞、标签用连接表，不存计数当真相', '检查状态历史、权限、审计三个隐藏实体'],
      practice: '把课程社区需求画成 ER 图，至少 8 个实体，标出 3 个多对多关系和 2 个隐藏实体。'
    }
  ]
});

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch10',
  part: 3,
  number: '10',
  title: '键、唯一性与完整性',
  summary: '主键决定“怎么找到一行”，唯一约束决定“什么不能重复”，外键决定“关系和删除怎么传播”。键设计错了，查询、迁移和并发都会变难。',
  goals: ['区分自然键、代理键与候选键', '设计联合主键与联合唯一', '理解外键级联、置空与 restrict', '知道唯一约束和索引的关系'],
  source: 'PostgreSQL 16 文档 · Constraints、Indexes；数据库系统概念',
  lessons: [
    {
      id: 'db-10-1',
      title: '10.1 自然键、代理键与候选键',
      minutes: 50,
      lead: '主键不只是“唯一”，还要稳定、短、不可变。邮箱会改、slug 会改、身份证号有隐私，代理键就是为这些变化留出空间。',
      source: 'PostgreSQL 16 文档 · Primary Keys；数据库设计实践',
      sections: [
        {
          h: '三种键的角色不同',
          p: `**代理键**是无业务含义的 ID，通常是自增 bigint 或 UUID；**自然键**有业务含义，比如邮箱、课程 slug、订单号；**候选键**是能唯一标识行、但没被选作主键的列，用 [[UNIQUE]] 保护。

代理键的好处是稳定、短、索引友好；坏处是外部系统看不懂，需要额外查自然键。自然键可读，但一旦业务允许修改，所有引用它的外键都要更新，代价高。

常见组合：内部关联用代理主键，对外 URL 用 slug 唯一约束，登录用 email 唯一约束。一个实体可以同时有 1 个主键和多个候选键。`,
          code: `CREATE TABLE users (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email      citext NOT NULL UNIQUE,
  handle     text   NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);`,
          output: `-- id 是代理主键；email 和 handle 是候选键
-- 三个唯一入口，各有用途`,
          tip: `[[citext]] 需要扩展；不想装扩展时，存 [[lower(email)]] 并加唯一索引，避免大小写重复。`
        },
        {
          h: 'UUID 与自增 ID 的取舍',
          p: `自增 bigint 短、顺序写入友好、索引页利用率高；缺点是外部能猜 ID、分布式多库容易冲突。UUID 全局唯一、难猜；缺点是 16 字节、随机写入会让 B-tree 页分裂，索引更大。

PostgreSQL 可以用 [[gen_random_uuid()]] 生成 UUID v4；UUID v7 按时间排序，兼顾唯一和写入局部性，但需要应用或扩展支持。对外暴露的 ID 可以用 UUID，内部关联仍用 bigint。

不要为了“看起来专业”全用 UUID。先看写入量、索引大小、是否需要跨库合并，再选。`,
          code: `CREATE TABLE api_tokens (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text   NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL
);`,
          output: `-- 对外令牌 ID 用 UUID，难猜且全局唯一
-- user_id 仍用 bigint 关联`,
          tip: `UUID 主键的索引比 bigint 大，随机写入也更分散。高写入表优先 bigint，或 UUID v7。`
        }
      ],
      points: ['代理键稳定，自然键可读，候选键用 UNIQUE', '一个实体可以有一个主键和多个候选键', 'UUID 难猜但索引大，自增 ID 短但可猜', '按写入量和外部暴露需求选键'],
      practice: '为 users 表设计主键、两个候选键，并说明为什么不用邮箱当主键。'
    },
    {
      id: 'db-10-2',
      title: '10.2 联合主键与联合唯一',
      minutes: 50,
      lead: '有些实体只有放在一起才有身份：同一课程里的第 3 节、同一用户对同一帖子的点赞。联合键就是为这种“组合身份”准备的。',
      source: 'PostgreSQL 16 文档 · Multicolumn Indexes；SQL 反模式',
      sections: [
        {
          h: '联合主键：组合本身唯一',
          p: `[[PRIMARY KEY (course_id, position)]] 表示同一课程内 position 唯一；换一门课，position 可以重复。它同时创建联合唯一索引，并禁止两列为 NULL。

联合主键的顺序影响索引前缀。[[(course_id, position)]] 能支持“按课程查课节”，不能高效支持“只按 position 查”。如果两个方向都高频，另建索引。

代理主键 + 联合唯一也很常见：[[id]] 做主键，[[UNIQUE(course_id, position)]] 做业务唯一。这样外键引用简单，业务约束还在。`,
          code: `CREATE TABLE lessons (
  id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id bigint NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  position  integer NOT NULL,
  title     text NOT NULL,
  UNIQUE (course_id, position)
);`,
          output: `-- id 作为代理主键，方便引用
-- (course_id, position) 保证课节顺序不重复`,
          tip: `联合唯一不会自动保证“position 连续”。缺号、跳号是业务问题，不是唯一约束能解决的。`
        },
        {
          h: '联合唯一与部分唯一索引',
          p: `[[UNIQUE(user_id, course_id)]] 防止重复报名。软删除后，旧记录仍占用唯一键；想允许“取消后重新报名”，可以用部分唯一索引：[[CREATE UNIQUE INDEX ... WHERE deleted_at IS NULL]]。

部分唯一索引只约束满足条件的行。它适合软删除、只允许一个默认地址、只允许一个进行中的订单等场景。条件是查询的一部分，写在索引定义里。

联合唯一索引也是查询索引。[[(user_id, course_id)]] 能支持按 user_id 查，不能高效支持只按 course_id 查；后者要单独建。`,
          code: `CREATE UNIQUE INDEX enrollments_active_unique
  ON enrollments (user_id, course_id)
  WHERE deleted_at IS NULL;`,
          output: `-- 未删除的报名不能重复；已软删除的旧记录不挡新报名`,
          tip: `部分索引的 WHERE 必须和查询条件匹配，否则优化器可能用不上。[[deleted_at IS NULL]] 要成为高频查询的一部分。`
        }
      ],
      points: ['联合主键表达组合身份', '联合键顺序决定索引前缀', '代理主键 + 联合唯一兼顾引用与业务约束', '软删除重复用部分唯一索引'],
      practice: '为“用户对帖子的点赞”设计主键，并说明如何避免重复点赞。'
    },
    {
      id: 'db-10-3',
      title: '10.3 外键、级联与删除策略',
      minutes: 55,
      lead: '外键不只是“引用存在”，它还决定删除父行时子行怎么办。CASCADE、SET NULL、RESTRICT 没有绝对好坏，只有业务答案。',
      source: 'PostgreSQL 16 文档 · Foreign Keys；生产数据库实践',
      sections: [
        {
          h: '四种删除行为',
          p: `[[ON DELETE CASCADE]] 删除父行时连带删除子行；[[SET NULL]] 把子行外键置空（列必须允许 NULL）；[[RESTRICT]] 阻止删除；[[NO ACTION]] 默认，事务结束前检查，效果接近 RESTRICT 但可延迟。

课程删除时，课节和报名通常应该 CASCADE；用户删除时，订单和支付记录通常不能删，应该 RESTRICT 或软删除。点赞可以 CASCADE，评论可以保留但作者置空。

外键也可以 [[ON UPDATE CASCADE]]，但主键通常不变；自然键被修改时才需要。不要为了省事全用 CASCADE，一次误删会带走整棵数据树。`,
          code: `CREATE TABLE comments (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id    bigint NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id    bigint REFERENCES users(id) ON DELETE SET NULL,
  parent_id  bigint REFERENCES comments(id) ON DELETE CASCADE,
  body       text NOT NULL
);`,
          output: `-- 帖子删除，评论一起删
-- 用户注销，评论保留但作者置空
-- 父评论删除，回复一起删`,
          tip: `[[SET NULL]] 要求 user_id 允许 NULL。如果业务要求评论必须有作者，就不能用 SET NULL，改用软删除或 RESTRICT。`
        },
        {
          h: '外键的代价与索引',
          p: `外键在插入子行时会检查父行是否存在，父表要有主键/唯一索引；子表外键列最好也建索引，否则删除父行时检查子行会全表扫描。

高并发写入时，外键检查会增加锁竞争，但它是数据完整性的重要保障。不要因为“性能”随意去掉外键；先测瓶颈，再考虑应用层补偿。

跨库、分库分表后，外键通常无法跨库；这时用应用层事务和定期对账，但要在文档里明确一致性边界。`,
          code: `CREATE INDEX comments_post_idx ON comments (post_id, created_at);
CREATE INDEX comments_user_idx ON comments (user_id);`,
          output: `-- 按帖子查评论、按用户查评论都能走索引
-- 删除帖子时，级联查找也更快`,
          tip: `外键列索引不是数据库自动送的；[[REFERENCES]] 只建约束，不建子表索引。`
        }
      ],
      points: ['CASCADE、SET NULL、RESTRICT 按业务选', 'SET NULL 要求外键列允许 NULL', '外键列要建索引，否则级联删除很慢', '分库后外键失效，需要应用层一致性方案'],
      practice: '为“课程—课节—报名—支付”设计删除策略，并说明哪些表不能 CASCADE。'
    }
  ]
});

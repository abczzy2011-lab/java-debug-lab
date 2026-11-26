window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch05',
  part: 2,
  number: '05',
  title: 'JOIN 与多表关系',
  summary: '真实业务数据不会住在一张表里。JOIN 把用户、课程、选课、进度拼回一起；但连接条件写错、关系方向搞反，就会得到重复行或悄悄漏掉数据。',
  goals: ['区分一对多与多对多', '说清 INNER JOIN 和 LEFT JOIN 的保留行为', '避免 JOIN 后的行数膨胀', '用 COUNT 验证连接结果'],
  source: 'PostgreSQL 16 文档 · Joins；SQL 必知必会',
  lessons: [
    {
      id: 'db-5-1',
      title: '5.1 关系方向、外键与连接表',
      minutes: 50,
      lead: '在写 JOIN 之前，先确认关系方向。谁引用谁、外键放在哪张表、一对多还是多对多，决定了 SQL 的骨架。',
      source: 'PostgreSQL 16 文档 · Foreign Keys；数据库系统概念',
      sections: [
        {
          h: '一对多：外键放在“多”的那边',
          p: `一门课程有很多课节，课节属于一门课程。这是典型的一对多：[[lessons.course_id]] 引用 [[courses.id]]，外键放在课节表。查“某门课的课节”时，从 courses 连 lessons；反过来查“这个课节属于哪门课”也能连。

外键的方向不能随便放。把 [[course_id]] 放在 courses 表里，只适用于“一门课只有一个课节”；一对多时，课程表无法同时存多个课节 ID，除非用数组，那就丢掉了关系约束。

一对多不等于“子表只能有一行”。外键列本身不唯一，多个课节可以指向同一门课；如果业务要求一门课只能有一个课节，应加 [[UNIQUE(course_id)]]。`,
          code: `CREATE TABLE lessons (
  id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id bigint NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  slug      text   NOT NULL,
  title     text   NOT NULL,
  position  integer NOT NULL,
  UNIQUE (course_id, position)
);`,
          output: `CREATE TABLE
-- 同一门课的 position 不重复；course_id 可重复`,
          tip: `外键列没有自动索引。[[course_id]] 上不建索引时，按课程查课节可能全表扫描；后面索引章会补。`
        },
        {
          h: '多对多：用连接表，而不是两个外键互塞',
          p: `用户选多门课，一门课被多个用户选，这是多对多。不能只在一张表里放另一个 ID；必须建连接表 [[enrollments]]，同时持有 [[user_id]] 和 [[course_id]]，并给两者建外键。

连接表通常还会有自己的属性：报名时间、进度、状态、订单号。它不只是“桥梁”，也是一张业务表。联合唯一 [[UNIQUE(user_id, course_id)]] 保证同一用户同一课程只选一次。

连接表的行数会随关系增长，可能比主表大得多。查询时先用主表过滤，再连连接表；不要一上来把三张大表全连起来。`,
          code: `CREATE TABLE enrollments (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id   bigint NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  status      text   NOT NULL DEFAULT 'active',
  progress    smallint NOT NULL DEFAULT 0,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);`,
          output: `CREATE TABLE
-- 连接表同时是业务表：保存进度、状态和报名时间`,
          tip: `多对多没有“哪边是多”的问题；连接表两边都是外键。不要为了省一张表，把关系塞进 JSON 数组。`
        }
      ],
      points: ['一对多外键放多的一边', '多对多必须建连接表', '连接表可以有业务字段和唯一约束', '外键列不会自动建索引'],
      practice: '为“用户—课程—课节—进度”画关系图，标出每张表的外键和唯一约束。'
    },
    {
      id: 'db-5-2',
      title: '5.2 INNER JOIN 与 LEFT JOIN',
      minutes: 55,
      lead: 'JOIN 的核心不是语法，而是“保留哪边的行”。INNER JOIN 只保留匹配上的组合，LEFT JOIN 保留左表所有行，匹配不上时右表列为 NULL。',
      source: 'PostgreSQL 16 文档 · JOIN Types；Use The Index, Luke',
      sections: [
        {
          h: '用 LEFT JOIN 找“没有发生的事”',
          p: `想查“哪些课程还没有任何报名”，应该用 [[courses LEFT JOIN enrollments]]，然后筛 [[enrollments.id IS NULL]]。如果写成 [[INNER JOIN]]，没有报名的课程根本不会出现，结果永远找不到“零”。

想查“每个用户的报名数”，用 [[users LEFT JOIN enrollments]] + [[COUNT(e.id)]]。如果写 [[COUNT(*)]]，没有报名的用户也会被算成 1，因为 LEFT JOIN 仍然产生了一行，只是右表列为 NULL。

ON 条件决定“怎么匹配”，WHERE 决定“匹配后保留什么”。把右表过滤条件放在 WHERE 里，可能把 LEFT JOIN 变成 INNER JOIN。`,
          code: `-- 没有报名的课程
SELECT c.id, c.title
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
WHERE e.id IS NULL;

-- 每个用户的报名数（0 也要显示）
SELECT u.id, u.name, COUNT(e.id) AS enrollment_count
FROM users u
LEFT JOIN enrollments e ON e.user_id = u.id
GROUP BY u.id, u.name;`,
          output: `-- 第一条返回没有报名记录的课程
-- 第二条中，没有报名的用户 enrollment_count 为 0`,
          tip: `[[COUNT(e.id)]] 才是“右表真实行数”；[[COUNT(*)]] 会把 LEFT JOIN 补出的空行也算进去。`
        },
        {
          h: 'ON 与 WHERE 的位置会改变连接语义',
          p: `[[LEFT JOIN ... ON e.status = 'active']] 表示只匹配 active 的报名，左表用户仍然保留；[[LEFT JOIN ... ON TRUE WHERE e.status = 'active']] 则会把没有 active 报名的用户过滤掉，效果接近 INNER JOIN。

需要“保留左表所有用户，但只统计 active 报名”时，把状态条件放在 ON 里，再用 [[COUNT(e.id)]]。需要“只看有 active 报名的用户”时，把条件放 WHERE。两者业务含义不同。

多表连接时，每张表都要明确“保留谁”。不要把所有 JOIN 都写成 INNER，最后发现某个维度整块消失。`,
          code: `SELECT u.id, u.name,
       COUNT(e.id) FILTER (WHERE e.status = 'active') AS active_count
FROM users u
LEFT JOIN enrollments e
  ON e.user_id = u.id
 AND e.status = 'active'
GROUP BY u.id, u.name;`,
          output: `-- 没有 active 报名的用户仍在结果里，active_count 为 0`,
          tip: `ON 里的条件只影响匹配；WHERE 里的条件影响最终结果。写 LEFT JOIN 时逐条问：这个条件应该影响“匹配”还是“保留”？`
        }
      ],
      points: ['INNER JOIN 只保留匹配组合', 'LEFT JOIN 保留左表全部行', '找零记录用 LEFT JOIN + IS NULL', 'ON 条件影响匹配，WHERE 影响最终保留'],
      practice: '写两条查询：一条找“从未报名任何课程的用户”，一条算“每个用户的活跃报名数（0 也要显示）”。'
    },
    {
      id: 'db-5-3',
      title: '5.3 多表 JOIN、行数膨胀与连接顺序',
      minutes: 55,
      lead: '三张表一连，行数可能不是相加，而是相乘。JOIN 的 fan-out 是报表数字虚高的常见原因；先验证每个连接键的基数，再相信结果。',
      source: 'PostgreSQL 16 文档 · Joins；SQL 反模式',
      sections: [
        {
          h: '连接键不唯一时，行数会膨胀',
          p: `如果 [[enrollments]] 里一个用户有多条记录，再去连 [[payments]] 也有多条，结果行数会变成“报名数 × 支付数”。你本来想算“每个用户的总支付”，却把报名记录重复乘进去了。

每次 JOIN 前先问：右表的连接键唯一吗？如果不唯一，是“一对多”还是“多对多”？需要聚合时，先在一张表内聚合，再连另一张表，避免 fan-out。

验证方法很简单：连接前后分别 [[COUNT(*)]]，或者 [[COUNT(DISTINCT 主键)]]。行数突然翻倍，先停下来查连接键，不要继续写聚合。`,
          code: `-- 连接前
SELECT COUNT(*) FROM enrollments;  -- 20

-- 连接后，如果 payments 每个报名有多条，行数会膨胀
SELECT COUNT(*) FROM enrollments e
JOIN payments p ON p.enrollment_id = e.id;  -- 可能是 47

-- 先聚合支付，再连接
SELECT e.user_id, SUM(p.paid_cents) AS paid
FROM enrollments e
JOIN (
  SELECT enrollment_id, SUM(amount_cents) AS paid_cents
  FROM payments
  GROUP BY enrollment_id
) p ON p.enrollment_id = e.id
GROUP BY e.user_id;`,
          output: `-- 直接连接可能把报名行重复计算
-- 先按报名聚合支付，再连接，行数可控`,
          tip: `报表数字虚高时，先查 JOIN 的行数，不要先怀疑 SUM。[[COUNT(*)]] 是最便宜的 fan-out 探测器。`
        },
        {
          h: '连接顺序由优化器决定，但写法影响可读性',
          p: `SQL 的 JOIN 顺序不保证按你写的从左到右执行；PostgreSQL 优化器会根据统计信息选择连接顺序和算法。你能做的是把关系写清楚、把过滤条件放对位置、让连接键有索引。

小表驱动大表是常见经验，但不是绝对规则；嵌套循环、哈希连接、归并连接各有适用场景。[[EXPLAIN]] 会告诉你实际用了什么，而不是你希望用什么。

多表查询超过三张时，用 CTE 把“先聚合什么、再连接什么”写成分层结构。优化器通常能看穿简单 CTE，复杂报表也更易读。`,
          code: `WITH course_stats AS (
  SELECT course_id, COUNT(*) AS enrollments
  FROM enrollments
  GROUP BY course_id
)
SELECT c.id, c.title, COALESCE(s.enrollments, 0) AS enrollments
FROM courses c
LEFT JOIN course_stats s ON s.course_id = c.id
ORDER BY enrollments DESC;`,
          output: `-- 先聚合报名数，再和课程连接；没有报名的课程补 0`,
          tip: `不要把“执行顺序”当成“书写顺序”。[[EXPLAIN]] 才是实际计划，[[JOIN]] 的物理顺序可能和你写的不一样。`
        }
      ],
      points: ['连接键不唯一会导致行数膨胀', '先聚合再连接能控制 fan-out', '验证连接前后 COUNT 是最快的排查', '连接顺序由优化器决定，写法服务于可读性'],
      practice: '拿两张一对多表做 JOIN，比较连接前后 COUNT(*)，再写一条“先聚合再连接”的版本。'
    }
  ]
});

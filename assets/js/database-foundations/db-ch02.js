window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch02',
  part: 1,
  number: '02',
  title: '类型、NULL 与约束',
  summary: '类型决定能存什么、怎么比较、占多少空间；NULL 决定“没有值”如何参与逻辑；约束决定坏数据能不能进库。这三件事看似基础，却决定了后面所有查询和建模的质量。',
  goals: ['为金额、时间、标识选对类型', '理解 NULL 的三值逻辑与聚合行为', '用 NOT NULL、UNIQUE、CHECK、DEFAULT 守住底线', '知道哪些校验放数据库、哪些放应用'],
  source: 'PostgreSQL 16 文档 · Data Types、Constraints；SQL 反模式',
  lessons: [
    {
      id: 'db-2-1',
      title: '2.1 数字、文本、时间与布尔类型',
      minutes: 50,
      lead: '类型选错，后面所有查询都在补洞。金额用浮点会丢精度，时间用无时区字段会跨时区错位，布尔用字符串会让索引和约束都变难。这一课把常用类型一次选对。',
      source: 'PostgreSQL 16 文档 · Numeric Types、Character Types、Date/Time Types',
      sections: [
        {
          h: '数字：整数、精确小数与浮点各管什么',
          p: `[[smallint]]、[[integer]]、[[bigint]] 存整数，范围依次扩大。主键、数量、价格分用整数最稳。[[numeric(p,s)]] 存精确小数，适合税率、汇率、科学计算；[[real]]/[[double precision]] 是浮点，适合测量值和近似计算，不适合金额。

[[integer]] 在 PostgreSQL 里是 32 位，约 ±21 亿；用户 ID 或订单号增长快时直接用 [[bigint]]。[[numeric(12,2)]] 表示总共 12 位、其中 2 位小数，最大 9999999999.99。小数位数不是越多越好，业务精度先定清楚。`,
          code: `CREATE TABLE price_examples (
  id          integer PRIMARY KEY,
  price_cents integer NOT NULL,
  tax_rate    numeric(5,4) NOT NULL,
  measured    double precision
);

INSERT INTO price_examples VALUES
  (1, 9900, 0.0600, 0.30000000000000004);

SELECT price_cents / 100.0 AS price_yuan,
       tax_rate,
       price_cents * tax_rate AS tax_cents
FROM price_examples;`,
          output: ` price_yuan | tax_rate | tax_cents
------------+----------+-----------
      99.00 |   0.0600 |     594.00`,
          tip: `金额不要用 [[real]]。0.1 + 0.2 在浮点里不等于 0.3；金额统一存“分”，展示时再除以 100。`
        },
        {
          h: '文本、时间与布尔：可读性和可比较性要同时成立',
          p: `[[text]] 适合标题、正文、slug；[[varchar(n)]] 只是多了长度限制，性能没有优势。[[char(n)]] 会补空格，业务字段基本不用。枚举状态不要用自由文本，后面会用 [[CHECK]] 或小表约束。

时间用 [[timestamptz]]，它存的是 UTC 时刻，显示时按会话时区转换；[[timestamp]] 不带时区，只适合“课程表上的 09:00”这种抽象时间。[[date]] 只存日期，[[interval]] 存时长。布尔用 [[boolean]]，不要用 [['Y'/'N']] 字符串；布尔列可以直接写 [[WHERE published]]。`,
          code: `CREATE TABLE type_demo (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title      text        NOT NULL,
  starts_at  timestamptz NOT NULL,
  local_date date        NOT NULL,
  is_open    boolean     NOT NULL DEFAULT true
);

SELECT title, starts_at, local_date, is_open
FROM type_demo
WHERE is_open;`,
          output: `-- is_open 为 true 的行会被返回；false 的行被过滤`,
          tip: `[[timestamptz]] 不是“带时区的字符串”，而是“一个绝对时刻”。跨时区显示交给客户端，存储统一用 UTC。`
        }
      ],
      points: ['金额用整数分或 numeric，不用浮点', '主键优先 bigint，避免过早溢出', '时间存 timestamptz，抽象时刻才用 timestamp', '布尔用 boolean，状态枚举用约束或小表'],
      practice: '为“课程价格、开课时间、是否上架、税率”各选一个类型，并写出理由。'
    },
    {
      id: 'db-2-2',
      title: '2.2 NULL 的三值逻辑',
      minutes: 55,
      lead: 'NULL 不是 0，也不是空字符串。它表示“未知”或“没有值”，会把普通的二值逻辑变成三值逻辑。很多“为什么这条查不出来”的答案，都藏在一个 NULL 里。',
      source: 'PostgreSQL 16 文档 · NULL 与三值逻辑；SQL 必知必会',
      sections: [
        {
          h: 'NULL 参与比较，结果既不是真也不是假',
          p: `[[NULL = NULL]] 的结果是 [[NULL]]，不是 [[true]]；[[NULL <> 5]] 也是 [[NULL]]。[[WHERE]] 只保留结果为 true 的行，所以 [[WHERE score = NULL]] 永远查不到东西。判断“没有值”要用 [[IS NULL]]，判断“有值”用 [[IS NOT NULL]]。

三值逻辑的真值表：[[true OR NULL]] 是 true，[[false OR NULL]] 是 NULL，[[true AND NULL]] 是 NULL，[[false AND NULL]] 是 false。[[NOT NULL]] 还是 NULL。写条件时不要靠直觉，先把可能为 NULL 的列标出来。`,
          code: `SELECT id, score
FROM submissions
WHERE score IS NULL;

SELECT id, score
FROM submissions
WHERE score <> 90;  -- score 为 NULL 的行不会被返回

SELECT id, COALESCE(score, 0) AS score_or_zero
FROM submissions;`,
          output: `-- IS NULL 找出未评分记录
-- <> 90 只返回有值且不等于 90 的行
-- COALESCE 把 NULL 显示为 0，但不改变存储值`,
          tip: `不要写 [[WHERE score = NULL]]。SQL 不会报错，只会安静地返回 0 行，这是最危险的错误之一。`
        },
        {
          h: 'NULL 在聚合、唯一约束和排序里的脾气',
          p: `聚合函数通常忽略 NULL：[[COUNT(score)]] 只数有值的行，[[COUNT(*)]] 数所有行；[[SUM]] 全为 NULL 时返回 NULL，不是 0。[[AVG]] 的分母是有值的行数，不是总行数。

[[UNIQUE]] 允许多个 NULL，因为两个“未知”不能被证明相等。[[ORDER BY]] 默认把 NULL 当最大值（PostgreSQL 是 NULLS LAST 升序、NULLS FIRST 降序，可用 [[NULLS FIRST/LAST]] 显式控制）。这些行为不是 bug，是 SQL 标准的一部分。`,
          code: `SELECT COUNT(*) AS total_rows,
       COUNT(score) AS scored_rows,
       AVG(score) AS avg_scored,
       SUM(score) AS sum_scored
FROM submissions;

SELECT id, score
FROM submissions
ORDER BY score DESC NULLS LAST;`,
          output: ` total_rows | scored_rows | avg_scored | sum_scored
------------+-------------+------------+------------
          3 |           2 |       85.0 |
-- 第三行 score 为 NULL，SUM 忽略它`,
          tip: `报表里“平均分”要先确认分母：是全体学生，还是只算已提交的人？[[AVG(score)]] 默认只算有值的人。`
        }
      ],
      points: ['NULL 表示未知，不是 0 或空字符串', '比较 NULL 要用 IS NULL / IS NOT NULL', '聚合忽略 NULL，COUNT(*) 例外', 'UNIQUE 允许多个 NULL，排序要显式控制 NULL 位置'],
      practice: '造一张 3 行成绩表，其中 1 行 score 为 NULL，分别计算 COUNT(*)、COUNT(score)、AVG(score)，并解释差异。'
    },
    {
      id: 'db-2-3',
      title: '2.3 NOT NULL、UNIQUE、CHECK 与 DEFAULT',
      minutes: 50,
      lead: '约束是数据库对应用的最后一层防线。应用可能漏校验、脚本可能直接写库、旧代码可能绕过接口；只有数据库约束能保证坏数据进不来。',
      source: 'PostgreSQL 16 文档 · Constraints；数据库系统概念',
      sections: [
        {
          h: '四类约束各守什么门',
          p: `[[NOT NULL]] 禁止空值，适合必填字段；[[UNIQUE]] 保证列或列组合唯一，背后会自动建唯一索引；[[CHECK]] 限定取值范围或格式；[[DEFAULT]] 在插入时没给值就填默认值。它们可以组合使用。

[[UNIQUE]] 与主键的区别：主键唯一且非空，一张表只能一个；唯一约束可以有多个，且允许 NULL（除非同时 NOT NULL）。联合唯一 [[UNIQUE (course_id, slug)]] 表示“同一门课里 slug 不重复”，不是全局唯一。

[[CHECK]] 适合简单、稳定的规则，比如价格非负、状态在枚举内。复杂跨表规则不要硬塞进 CHECK，数据库不支持子查询；放到触发器或应用服务里，并写测试。`,
          code: `CREATE TABLE enrollments (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id),
  course_id   bigint NOT NULL REFERENCES courses(id),
  status      text   NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'completed', 'refunded')),
  progress    smallint NOT NULL DEFAULT 0
              CHECK (progress BETWEEN 0 AND 100),
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_id)
);`,
          output: `CREATE TABLE
-- 同一用户同一课程只能选一次；进度必须在 0–100`,
          tip: `状态用 [[CHECK]] 枚举很方便，但每加一个状态都要改约束和迁移。状态经常变时，改用状态字典表更灵活。`
        },
        {
          h: '约束放数据库还是放应用',
          p: `两边都要，但职责不同。应用负责给出友好错误、做权限和跨表业务规则；数据库负责最终一致性，防止并发写入和绕过接口的脚本破坏数据。

不要把数据库约束当成“用户体验”。用户提交非法邮箱时，数据库返回的 [[23514 check constraint]] 不适合直接展示；应用要先校验并给字段级提示。数据库约束是兜底，不是表单提示。

迁移已有数据加约束时，先清洗数据、再加 [[NOT NULL]] 或 [[CHECK]]，否则 ALTER TABLE 会失败。大表加约束可能锁表，生产环境要评估窗口和 [[NOT VALID]] + [[VALIDATE CONSTRAINT]] 的渐进方式。`,
          code: `-- 先查有没有脏数据
SELECT COUNT(*) FROM enrollments WHERE progress < 0 OR progress > 100;

-- 清理后再加约束
ALTER TABLE enrollments
  ADD CONSTRAINT enrollments_progress_range
  CHECK (progress BETWEEN 0 AND 100) NOT VALID;

ALTER TABLE enrollments
  VALIDATE CONSTRAINT enrollments_progress_range;`,
          output: `-- NOT VALID 先让新数据受约束，再异步验证旧数据
-- VALIDATE 成功后约束对全表生效`,
          tip: `[[NOT VALID]] 不是“不生效”，而是“新写入生效、旧数据暂不检查”。验证完成前不要以为历史数据已经干净。`
        }
      ],
      points: ['NOT NULL、UNIQUE、CHECK、DEFAULT 是最常用的四类约束', '联合唯一表达组合唯一，不是全局唯一', '复杂跨表规则放应用或触发器，不硬塞 CHECK', '大表加约束用 NOT VALID + VALIDATE 降低锁风险'],
      practice: '为 enrollments 表设计 4 个约束，并说明哪个错误应该由应用提示、哪个必须由数据库兜底。'
    }
  ]
});

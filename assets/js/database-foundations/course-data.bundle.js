/* Generated course data bundle. Source order follows the page. */

/* --- db-ch01.js --- */

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch01',
  part: 1,
  number: '01',
  title: '数据库、表与 SQL',
  summary: '先把“数据库到底在系统里做什么”讲清楚，再建立表、行、列、键这套关系模型语言。你会启动一个 PostgreSQL 实例，跑出第一条 SELECT，并知道一条查询从连接池到磁盘经历了什么。',
  goals: ['说清一次查询的执行链路', '区分表、行、列、主键与外键', '能启动 PostgreSQL 并执行第一条 SQL', '建立 snake_case 命名与分号习惯'],
  source: 'PostgreSQL 16 文档 · Chapter 1–2；SQL 必知必会',
  lessons: [
    {
      id: 'db-1-1',
      title: '1.1 数据库在系统里到底做什么',
      minutes: 45,
      lead: '这一课不先写 SQL，而是先把“浏览器点一下，数据为什么会出现”这条链路走通。知道数据库在链路里的位置，后面遇到连接超时、慢查询、锁等待，才知道该看哪一层。',
      source: 'PostgreSQL 16 文档 · Architectural Fundamentals；数据库系统概念',
      sections: [
        {
          h: '从一次列表请求说起',
          p: `用户在课程社区点开“我的课程”，前端发出 [[GET /api/my-courses]]。后端不是直接读磁盘，而是从连接池借一条数据库连接，把 SQL 发给 PostgreSQL。PostgreSQL 先解析 SQL，再生成执行计划，然后由执行器向缓冲池要数据页；缓冲池没有命中，才去磁盘读取。

这条链路里有四个关键角色：**连接池**决定并发上限，**解析器与 planner**决定 SQL 怎么执行，**buffer pool**决定热数据是否在内存，**WAL 与磁盘**保证提交后的数据不会丢。慢不一定慢在 SQL 文本，也可能慢在等连接、等锁、等磁盘。

SQL 是声明式语言：你只描述“要什么”，不规定“怎么扫表”。同一个查询在数据量变化后可能换计划，这就是为什么不能只看 SQL 字面判断性能。`,
          code: `-- 一条最普通的列表查询
SELECT id, title, slug
FROM courses
WHERE published = true
ORDER BY id DESC
LIMIT 20;`,
          output: ` id |       title        |      slug
----+--------------------+----------------
  3 | 事务、索引与执行计划 | transactions
  2 | 数据建模与约束      | data-modeling
  1 | SQL 基础与查询      | sql-basics`,
          tip: `[[WHERE]] 和 [[ORDER BY]] 不是装饰。没有过滤条件，数据库可能扫全表；没有稳定排序，分页结果会在数据变化时漂移。`
        },
        {
          h: 'OLTP 与 OLAP：两种不同的数据库任务',
          p: `全栈项目绝大多数是 **OLTP**：大量短查询、按主键或索引取少量行、事务要短。课程社区查“我的课程”、发帖、更新进度，都是 OLTP。它的敌人是长事务、全表扫描和锁竞争。

**OLAP** 则是另一类任务：扫描大量行做聚合、跑报表、做数据分析。把两者混在一台主库上，一个报表查询可能拖慢所有用户请求。生产环境通常把分析流量引到只读副本或数据仓库。

这一门课的主线是 OLTP，但会教你写报表查询、窗口函数和 EXPLAIN。你要能判断一条 SQL 属于哪一类，再决定放主库、只读副本还是离线任务。`,
          code: `-- OLTP：按用户取最近 20 条进度，命中索引就够
SELECT lesson_id, progress
FROM enrollments
WHERE user_id = 42
ORDER BY updated_at DESC
LIMIT 20;

-- OLAP：统计每门课完课率，通常不该压在主库高峰跑
SELECT course_id,
       COUNT(*) FILTER (WHERE progress = 100)::numeric / COUNT(*) AS completion_rate
FROM enrollments
GROUP BY course_id;`,
          output: `-- 第一条只返回当前用户的少量行
-- 第二条要扫描并聚合全表，数据量大时应走只读副本`,
          tip: `不要用“数据库”三个字概括两种负载。先问这条 SQL 要多少行、要多快、能不能接受延迟，再决定它该在哪台库上跑。`
        }
      ],
      points: ['连接池、planner、buffer pool、WAL 是同一条查询链路的不同层', 'SQL 是声明式语言，执行方式由数据库计划器决定', 'OLTP 要短事务与索引，OLAP 要扫描与聚合，两者不应互相拖累', '分页查询必须有稳定排序，否则结果会漂移'],
      practice: '用自己的话画出“浏览器 → API → 连接池 → PostgreSQL → 磁盘”的链路，并标出一次慢查询可能卡住的三个位置。'
    },
    {
      id: 'db-1-2',
      title: '1.2 关系模型：表、行、列、键',
      minutes: 50,
      lead: '关系模型不是 Excel 的别名。它用集合、元组和域来描述数据，用主键保证一行能被唯一找到，用外键把两张表的关系写进结构里。',
      source: '数据库系统概念 · 关系模型；PostgreSQL 16 文档 · Data Types',
      sections: [
        {
          h: '表是关系，行是元组，列是属性',
          p: `一张表对应一个**关系**，一行是一条**元组**，一列是一个**属性**，列的取值范围叫**域**。关系模型要求同一列的值属于同一个域，比如 [[price_cents]] 只能放整数，不能这一行放 [[99.00]]、下一行放 [["免费"]]。

现实中的表可以有重复行吗？关系模型里不允许，因为关系是集合；数据库用主键或唯一约束来保证“同一行不会出现两次”。没有主键的表仍然能存数据，但更新和删除会变得危险：你无法精确指向某一行。

列名是给人看的，类型是给数据库看的。[[varchar(50)]] 不是“只能存 50 个汉字”，而是长度限制；[[text]] 没有长度上限。选类型时先问取值范围和是否需要精确计算，而不是随手全用 [[varchar]]。`,
          code: `CREATE TABLE courses (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        text        NOT NULL UNIQUE,
  title       text        NOT NULL,
  price_cents integer     NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  published   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);`,
          output: `CREATE TABLE
-- id 是主键，slug 唯一，price_cents 不能为负，created_at 自动取当前时间`,
          tip: `[[GENERATED ALWAYS AS IDENTITY]] 是 PostgreSQL 的现代自增写法，比 [[serial]] 更明确。主键列不要允许 [[NULL]]，否则唯一性会失去意义。`
        },
        {
          h: '键不是装饰：它决定你能不能精确操作一行',
          p: `**主键**唯一标识一行，不能为空，一张表只能有一个主键。**候选键**是其他也能唯一标识行的列，比如 [[slug]]；你可以给它加 [[UNIQUE]]。**外键**是另一张表的主键引用，用来表达“这条选课记录属于哪个用户”。

主键选自然键还是代理键？自然键有业务含义，比如身份证号、课程 slug；代理键是无业务含义的整数或 UUID。代理键稳定、短、不会因为业务规则变化而改；自然键可读，但一旦业务允许改 slug，所有引用都要跟着改。全栈项目通常用代理主键做内部关联，再给自然键加唯一约束做外部标识。`,
          code: `CREATE TABLE lessons (
  id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  course_id bigint NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  slug      text   NOT NULL,
  title     text   NOT NULL,
  position  integer NOT NULL,
  UNIQUE (course_id, slug)
);`,
          output: `CREATE TABLE
-- course_id 外键指向 courses.id；删除课程时级联删除课节
-- (course_id, slug) 联合唯一：同一门课里 slug 不能重复`,
          tip: `外键的 [[ON DELETE CASCADE]] 很方便，也很危险。用户删课程会连带删掉所有课节和进度；生产环境先想清楚是级联、置空还是禁止删除。`
        }
      ],
      points: ['关系模型由关系、元组、属性和域构成', '主键唯一且非空，候选键用 UNIQUE 约束', '外键把跨表关系写进数据库，而不是只写在应用代码里', '代理键稳定，自然键可读，通常两者并用'],
      practice: '为“课程—课节—选课记录”画三张表，标出主键、外键和至少一个联合唯一约束。'
    },
    {
      id: 'db-1-3',
      title: '1.3 启动 PostgreSQL 与第一条 SQL',
      minutes: 55,
      lead: '这一课把环境跑起来。你会用 Docker 启动 PostgreSQL 16，用 psql 连进去，执行第一条 SELECT，并学会查看库、表和列结构。',
      source: 'PostgreSQL 16 文档 · Getting Started；psql 官方文档',
      sections: [
        {
          h: '用 Docker 起一个可丢弃的练习库',
          p: `本地练习最怕把环境装乱。用 Docker 起一个独立容器，端口映射到 [[5432]]，密码只用于本地。容器名和卷名都写清楚，删容器时数据不会跟着丢；要彻底重来再删卷。

启动后不要急着写业务表，先用 [[psql]] 连进去，确认版本、当前数据库和当前用户。连接字符串里的 [[localhost]] 在容器外指宿主机，在容器内指容器自己；这两个视角经常把人绕晕。`,
          code: `docker run --name pg-learn \\
  -e POSTGRES_PASSWORD=devpass \\
  -e POSTGRES_DB=learn \\
  -p 5432:5432 \\
  -v pg-learn-data:/var/lib/postgresql/data \\
  -d postgres:16

# 连接（在宿主机终端执行）
psql "postgresql://postgres:devpass@localhost:5432/learn"

# 容器内执行
docker exec -it pg-learn psql -U postgres -d learn`,
          output: `PostgreSQL 16.x
learn=#`,
          tip: `[[POSTGRES_PASSWORD]] 只适合本地。生产环境用密钥管理，不要把密码写进仓库、前端环境变量或日志。`
        },
        {
          h: 'psql 的四个元命令与第一条 SELECT',
          p: `[[\\l]] 列出所有数据库，[[\\dt]] 列出当前库的表，[[\\d 表名]] 看列、索引和外键，[[\\du]] 看角色。它们不是 SQL，是 psql 的客户端命令，末尾不加分号。

SQL 关键字大小写不敏感，但标识符建议统一 [[snake_case]]；字符串用单引号，不要用双引号，双引号在 SQL 里是标识符引用。每条语句以分号结束，psql 看到分号才会执行。

现在建一张最小表并插入三行，再用 SELECT 验证。注意 [[INSERT]] 的列顺序和值顺序必须一一对应；漏写列名时，值必须按表定义顺序给全。`,
          code: `\\dt
\\d courses

CREATE TABLE demo_courses (
  id integer PRIMARY KEY,
  title text NOT NULL,
  published boolean NOT NULL DEFAULT false
);

INSERT INTO demo_courses (id, title, published) VALUES
  (1, 'SQL 基础', true),
  (2, '数据建模', true),
  (3, '事务与索引', false);

SELECT id, title FROM demo_courses WHERE published = true ORDER BY id;`,
          output: ` id |   title
----+-----------
  1 | SQL 基础
  2 | 数据建模`,
          tip: `别在 [[psql]] 里用 [[--]] 注释后面紧跟特殊字符；注释是给人和解析器看的，不会执行。生产脚本里尤其不要把密码写在注释里。`
        }
      ],
      points: ['Docker 起 PostgreSQL 16，数据卷与容器分离', 'psql 元命令用于查看结构，不是 SQL', 'SQL 字符串用单引号，标识符建议 snake_case', 'INSERT 的列顺序和值顺序必须对应'],
      practice: '启动容器并建一张 [[demo_courses]] 表，插入 3 行，分别用 [[\\d]] 和 SELECT 验证结构和数据。'
    },
    {
      id: 'db-1-4',
      title: '1.4 类型、默认值与第一张业务表',
      minutes: 55,
      lead: '把“课程社区”的第一张业务表建出来。你会做类型选择、默认值、CHECK 约束，并完成 INSERT、UPDATE、DELETE 的最小闭环。',
      source: 'PostgreSQL 16 文档 · Data Types、Constraints；SQL 反模式',
      sections: [
        {
          h: '字段类型要先问三个问题',
          p: `第一，取值范围多大？课程价格用 [[integer]] 存分，不用 [[real]]；金额一旦用浮点，累计就会出现 [[0.30000000000000004]]。第二，是否需要精确比较？时间用 [[timestamptz]]，不要用无时区的 [[timestamp]] 存本地时间。第三，是否需要结构化查询？标签、权限这种经常按元素查的，不要塞进一个逗号字符串。

[[text]] 与 [[varchar(n)]] 在 PostgreSQL 里性能几乎一样；[[varchar(n)]] 多了一层长度检查。主键用 [[bigint]] 比 [[integer]] 更耐用，用户量涨到 20 亿之前不用迁移。布尔字段用 [[boolean]]，不要用 [[0/1]] 让应用猜。`,
          code: `CREATE TABLE courses (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug        text        NOT NULL UNIQUE,
  title       text        NOT NULL CHECK (length(title) BETWEEN 2 AND 120),
  summary     text        NOT NULL DEFAULT '',
  price_cents integer     NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  published   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);`,
          output: `CREATE TABLE
-- 价格按“分”存整数；标题长度有上下界；时间带时区`,
          tip: `[[CHECK (length(title) BETWEEN 2 AND 120)]] 能挡住空标题和超长标题，但挡不住全是空格。应用层仍要做 trim 和业务校验。`
        },
        {
          h: 'INSERT、UPDATE、DELETE 的最小闭环',
          p: `插入时只给必要列，其余交给默认值。[[RETURNING]] 能直接拿回数据库生成的主键和时间，不用再查一次。更新时一定要带 [[WHERE]]，否则全表被改；删除同理，先 [[SELECT]] 验证条件，再执行 DELETE。

不要物理删除所有东西。课程下架可以用 [[published = false]]，用户注销可以保留审计记录；真正的删除留给合规要求和明确业务。软删除会带来“唯一约束仍然占用”的问题，后面讲部分索引时再解决。`,
          code: `INSERT INTO courses (slug, title, price_cents, published)
VALUES ('sql-basics', 'SQL 基础与查询', 9900, true)
RETURNING id, created_at;

UPDATE courses
SET title = 'SQL 基础与查询（第 2 版）', updated_at = now()
WHERE slug = 'sql-basics';

DELETE FROM courses
WHERE slug = 'draft-course'
RETURNING id, slug;`,
          output: ` id |          created_at
----+-------------------------------
  1 | 2026-11-27 10:12:31.482+08
UPDATE 1
DELETE 1`,
          tip: `[[UPDATE]]/[[DELETE]] 之前先用同样的 [[WHERE]] 跑一次 [[SELECT COUNT(*)]]。生产事故里最常见的一类，就是漏了 WHERE。`
        }
      ],
      points: ['金额用整数分，时间用 timestamptz，布尔用 boolean', 'DEFAULT 减少应用层漏填，CHECK 守住数据库底线', 'RETURNING 省掉插入后再查一次', 'UPDATE/DELETE 先验证 WHERE，再执行'],
      practice: '建 courses 表，插入 3 门课，更新其中一门的价格，再用 DELETE ... RETURNING 删除一门草稿课。'
    }
  ]
});

/* --- db-ch02.js --- */

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

/* --- db-ch03.js --- */

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch03',
  part: 1,
  number: '03',
  title: '查询、排序与分页',
  summary: 'WHERE 决定哪些行进入结果，ORDER BY 决定它们的顺序，LIMIT/OFFSET 决定你看到哪一段。三件事任何一件不确定，分页就会重复、漏行或把数据库拖慢。',
  goals: ['写清 AND/OR/NOT 与括号', '避免 NOT IN 的 NULL 陷阱', '用稳定排序做分页', '理解 OFFSET 与游标分页的成本差异'],
  source: 'PostgreSQL 16 文档 · Queries；Use The Index, Luke',
  lessons: [
    {
      id: 'db-3-1',
      title: '3.1 WHERE 与比较、范围、模糊匹配',
      minutes: 50,
      lead: 'WHERE 是查询的第一道筛子。它不只是“过滤一下”，还直接决定能不能命中索引。先学会写对，再学会写得可优化。',
      source: 'PostgreSQL 16 文档 · SELECT、Operators；SQL 必知必会',
      sections: [
        {
          h: '比较、范围与集合',
          p: `[[=]]、[[<>]]、[[<]]、[[<=]] 是最基本的比较；[[BETWEEN a AND b]] 等价于 [[>= a AND <= b]]，边界包含。[[IN (v1, v2)]] 是多个等值的集合写法，[[NOT IN]] 则是否定版本。

[[LIKE]] 用 [[%]] 匹配任意长度、[[_]] 匹配一个字符；[[ILIKE]] 是 PostgreSQL 的大小写不敏感版本。模糊匹配如果以 [[%]] 开头，普通 B-tree 索引通常帮不上，后面会讲 trigram 或全文索引。

过滤条件尽量让列单独出现在比较符左边。[[WHERE price_cents * 100 > 500]] 这种对列做运算的写法，常常让索引失效；能改写成 [[WHERE price_cents > 5]] 就改写。`,
          code: `SELECT id, title, price_cents
FROM courses
WHERE published = true
  AND price_cents BETWEEN 5000 AND 15000
  AND slug IN ('sql-basics', 'data-modeling')
  AND title ILIKE '%数据%';`,
          output: ` id |       title        | price_cents
----+--------------------+-------------
  2 | 数据建模与约束      |       12900`,
          tip: `[[BETWEEN]] 包含两端。价格区间如果不想包含上限，用 [[>= a AND < b]]，不要靠“减 1”猜边界。`
        },
        {
          h: '把过滤写成可索引的形状',
          p: `数据库优化器喜欢 [[column operator constant]] 这种“sargable”形状。[[WHERE created_at >= '2026-01-01']] 可以走时间索引；[[WHERE date(created_at) = '2026-01-01']] 对列套了函数，普通索引往往用不上。

并不是所有函数都必然失效。PostgreSQL 支持表达式索引，例如 [[CREATE INDEX ON orders (date(created_at))]]，但那是另一条路。先尽量把查询改写成可索引形式，再考虑特殊索引。

[[WHERE]] 里的条件顺序不影响逻辑结果，但会影响可读性。把主过滤条件放前面，把补充条件放后面；复杂查询用括号和换行，别把所有条件挤在一行。`,
          code: `-- 可走索引：列直接和常量比较
SELECT id FROM orders
WHERE created_at >= timestamptz '2026-11-01'
  AND created_at <  timestamptz '2026-12-01';

-- 普通索引通常难用：对列套了 date()
SELECT id FROM orders
WHERE date(created_at) = date '2026-11-27';`,
          output: `-- 第一条可用 created_at 上的 B-tree 索引
-- 第二条可能退化为全表扫描，除非建表达式索引`,
          tip: `[[EXPLAIN]] 里看到 [[Seq Scan]] 不一定是错，数据量小或过滤性差时全表扫更快。关键是看实际行数和代价。`
        }
      ],
      points: ['WHERE 只保留条件为 true 的行', 'BETWEEN 包含边界，IN 是等值集合', '列上套函数常导致普通索引失效', '条件顺序不影响结果，但影响可读性'],
      practice: '把一条 `WHERE date(created_at) = ...` 改写成可走索引的范围条件，并用 EXPLAIN 对比。'
    },
    {
      id: 'db-3-2',
      title: '3.2 AND、OR、NOT 与 NULL 陷阱',
      minutes: 45,
      lead: '布尔逻辑看起来简单，真正出错的是优先级和 NULL。一个没加括号的 OR，可能把“已发布且免费”变成“已发布，或者免费”。',
      source: 'PostgreSQL 16 文档 · Logical Operators；SQL 反模式',
      sections: [
        {
          h: '优先级与括号',
          p: `SQL 里 [[NOT]] 优先于 [[AND]]，[[AND]] 优先于 [[OR]]。[[a OR b AND c]] 等价于 [[a OR (b AND c)]]，不是 [[(a OR b) AND c]]。这类错误在业务条件里非常常见，最安全的做法是：只要混用 AND/OR，就加括号。

[[NOT]] 作用于整个条件时也要小心。[[NOT status = 'active' AND published]] 解析为 [[(NOT status = 'active') AND published]]，不是 [[NOT (status = 'active' AND published)]]。

[[WHERE]] 里的布尔列可以直接写列名：[[WHERE published]] 等价于 [[WHERE published = true]]；[[WHERE NOT published]] 等价于 [[WHERE published = false]]。`,
          code: `-- 想表达：已发布，并且（免费或价格低于 50 元）
SELECT id, title
FROM courses
WHERE published = true
  AND (price_cents = 0 OR price_cents < 5000);

-- 如果漏掉括号：已发布且免费，或者任意价格低于 50 元
SELECT id, title
FROM courses
WHERE published = true AND price_cents = 0 OR price_cents < 5000;`,
          output: `-- 第一条只返回已发布课程
-- 第二条会把未发布但低价课程也带出来`,
          tip: `业务条件超过两个 AND/OR 时，先在纸上写真值表达式，再翻译成 SQL。不要边写边猜优先级。`
        },
        {
          h: 'NOT IN 遇到 NULL 会静默返回空结果',
          p: `[[x NOT IN (1, 2, NULL)]] 等价于 [[x <> 1 AND x <> 2 AND x <> NULL]]。最后一项是 NULL，整个 AND 结果变成 NULL，[[WHERE]] 不保留 NULL，所以查询返回 0 行。

这不是数据库的 bug，是三值逻辑的必然结果。要排除一组值，优先用 [[NOT EXISTS]]，或者确保子查询列 [[NOT NULL]]，或者用 [[NOT IN (SELECT ... WHERE col IS NOT NULL)]]。

[[EXISTS]] 只关心“有没有一行满足”，不关心值是否 NULL；在反连接、权限过滤、软删除场景里更稳。`,
          code: `-- 危险：子查询里可能有 NULL
SELECT id FROM users
WHERE id NOT IN (SELECT user_id FROM bans);

-- 稳妥：NOT EXISTS 不受 NULL 影响
SELECT u.id FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM bans b WHERE b.user_id = u.id
);`,
          output: `-- 第一条在 bans.user_id 含 NULL 时可能返回 0 行
-- 第二条只返回没有被封禁的用户`,
          tip: `[[NOT IN]] 不是不能用，但要知道子查询列是否可能为 NULL。不确定时用 [[NOT EXISTS]]。`
        }
      ],
      points: ['NOT > AND > OR，混用必须加括号', '布尔列可直接作为 WHERE 条件', 'NOT IN 遇到 NULL 会返回空结果', '反连接优先用 NOT EXISTS'],
      practice: '写出“已发布且（免费或价格低于 50 元）”的条件，再故意去掉括号，用 EXPLAIN 或结果对比差异。'
    },
    {
      id: 'db-3-3',
      title: '3.3 ORDER BY、LIMIT 与游标分页',
      minutes: 55,
      lead: '分页不是 LIMIT 20 OFFSET 40 这么简单。没有稳定排序，翻页会重复；OFFSET 很大时，数据库要先丢掉前面所有行；数据持续写入时，游标分页才稳定。',
      source: 'PostgreSQL 16 文档 · LIMIT/OFFSET；Use The Index, Luke',
      sections: [
        {
          h: '排序必须有唯一的决胜字段',
          p: `[[ORDER BY created_at DESC]] 看起来没问题，但如果两条记录时间相同，数据库不保证它们每次顺序一致。翻页时第 1 页和第 2 页可能重复或漏掉同一行。

解决办法是加一个唯一或近似唯一的决胜字段：[[ORDER BY created_at DESC, id DESC]]。id 唯一，所以排序是全序；created_at 相同也能稳定分页。

[[NULLS FIRST/LAST]] 显式控制 NULL 位置。默认升序 NULL 在最后，降序 NULL 在最前；报表里不要依赖默认，写清楚。`,
          code: `SELECT id, title, created_at
FROM courses
WHERE published = true
ORDER BY created_at DESC, id DESC
LIMIT 20;`,
          output: `-- 先按创建时间倒序；同一时刻按 id 倒序
-- 结果稳定，下一页不会因时间相同而漂移`,
          tip: `[[ORDER BY]] 后的列顺序就是排序优先级。[[created_at DESC, id DESC]] 不是“两个独立排序”，是先时间后 id。`
        },
        {
          h: 'OFFSET 的成本与游标分页',
          p: `[[LIMIT 20 OFFSET 40]] 让数据库先产生前 60 行，再丢掉前 40 行。页数越深，浪费越大；数据量大时，第 1000 页可能比第 1 页慢几个数量级。

**游标分页**（keyset pagination）用上一页最后一个排序值作为下一页起点：[[WHERE (created_at, id) < (last_created_at, last_id) ORDER BY ... LIMIT 20]]。它不需要跳过前面的行，索引可以直接定位。

游标分页适合“无限滚动”和列表流，不适合“跳转到第 37 页”。如果产品必须支持跳页，保留 OFFSET，但限制最大页数，或改用预计算的总数与分区。`,
          code: `-- 第一页
SELECT id, title, created_at
FROM courses
WHERE published = true
ORDER BY created_at DESC, id DESC
LIMIT 20;

-- 下一页：把上一页最后一行的 (created_at, id) 传进来
SELECT id, title, created_at
FROM courses
WHERE published = true
  AND (created_at, id) < (timestamptz '2026-11-26 10:00:00+08', 42)
ORDER BY created_at DESC, id DESC
LIMIT 20;`,
          output: `-- 第一条返回最新 20 条
-- 第二条从游标位置继续，不扫描已看过的行`,
          tip: `游标分页的游标必须是“排序字段 + 唯一字段”的组合，并且前端要原样带回，不能只传 id。`
        }
      ],
      points: ['排序加唯一决胜字段，避免分页漂移', 'OFFSET 越深越慢，因为要丢弃前面的行', '游标分页用上一页最后值定位，适合无限滚动', '跳页需求与游标分页要按产品取舍'],
      practice: '为课程列表设计一套分页：写出第一页和下一页 SQL，并说明为什么排序要带 id。'
    }
  ]
});

/* --- db-ch04.js --- */

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch04',
  part: 1,
  number: '04',
  title: '聚合、分组与报表',
  summary: '从“查一行”进入“查一类”。COUNT、SUM、AVG 把多行压成一个值，GROUP BY 决定按什么维度压，HAVING 在聚合之后再做筛选。',
  goals: ['理解 COUNT(*) 与 COUNT(列) 的差异', '写对 GROUP BY 与 HAVING', '处理聚合中的 NULL 和重复值', '用 FILTER 与条件聚合做占比'],
  source: 'PostgreSQL 16 文档 · Aggregate Functions；SQL 必知必会',
  lessons: [
    {
      id: 'db-4-1',
      title: '4.1 COUNT、SUM、AVG、MIN、MAX',
      minutes: 50,
      lead: '聚合函数把一组行变成一个值。最简单的 COUNT(*) 也有坑：它数行，COUNT(列) 只数非 NULL 的值。先把五个常用聚合函数的语义分清。',
      source: 'PostgreSQL 16 文档 · Aggregate Functions',
      sections: [
        {
          h: '五个函数的共同点与差异',
          p: `[[COUNT(*)]] 数结果集的行数，不管列是否为 NULL；[[COUNT(col)]] 只数 [[col]] 非 NULL 的行；[[COUNT(DISTINCT col)]] 再去重。[[SUM(col)]] 把非 NULL 值相加，全为 NULL 时返回 NULL；[[AVG(col)]] 用非 NULL 值之和除以非 NULL 行数。

[[MIN]]/[[MAX]] 返回该列的最小/最大值，文本按排序规则比较，时间按时间先后。它们都忽略 NULL，但 [[MIN]] 和 [[MAX]] 不会因为 NULL 返回 NULL，除非整列都是 NULL。

聚合结果类型会自动提升：整数相加仍是整数，可能溢出；[[AVG(integer)]] 返回 numeric，不会丢小数。金额求和用 [[SUM(bigint)]] 要确认不会超过 64 位。`,
          code: `SELECT COUNT(*)        AS all_rows,
       COUNT(score)     AS scored_rows,
       COUNT(DISTINCT user_id) AS users,
       SUM(score)       AS total_score,
       AVG(score)       AS avg_score,
       MIN(score)       AS min_score,
       MAX(score)       AS max_score
FROM submissions;`,
          output: ` all_rows | scored_rows | users | total_score | avg_score | min_score | max_score
----------+-------------+-------+-------------+-----------+-----------+-----------
        5 |           4 |     3 |         340 |      85.0 |        60 |       100`,
          tip: `[[COUNT(*)]] 和 [[COUNT(score)]] 结果不同时，不要急着改 SQL，先问业务：到底要“提交数”还是“已评分数”？`
        },
        {
          h: '聚合不是把行变没，而是按组压缩',
          p: `没有 [[GROUP BY]] 时，聚合把整个结果集压成一行。有 [[GROUP BY]] 时，每个分组压成一行。理解这一点，才能理解为什么不能直接 [[SELECT title, COUNT(*)]]：title 属于哪一行？

SQL 标准要求 SELECT 里的非聚合列必须出现在 GROUP BY 中，或者被聚合函数包住。PostgreSQL 对部分函数依赖有放宽，但不要依赖它，写清楚分组列更可移植。

聚合后的行数通常远小于原始行数。报表查询先过滤、再聚合、最后排序，顺序错了会把不必要的数据带进聚合。`,
          code: `SELECT course_id,
       COUNT(*) AS enrollments,
       AVG(progress) AS avg_progress
FROM enrollments
GROUP BY course_id
ORDER BY enrollments DESC;`,
          output: ` course_id | enrollments | avg_progress
-----------+-------------+--------------
         1 |          12 |        63.5
         2 |           8 |        71.2
         3 |           3 |        45.0`,
          tip: `[[GROUP BY course_id]] 后，[[course_id]] 可以直接选；其他列要么聚合，要么也进 GROUP BY。`
        }
      ],
      points: ['COUNT(*) 数行，COUNT(col) 数非 NULL', 'SUM/AVG 忽略 NULL，全 NULL 时 SUM 返回 NULL', 'GROUP BY 决定聚合的粒度', 'SELECT 的非聚合列必须可追溯到分组列'],
      practice: '对 submissions 表写一条查询，同时返回总行数、已评分行数、去重用户数和平均分，并解释每个值。'
    },
    {
      id: 'db-4-2',
      title: '4.2 GROUP BY 与 HAVING',
      minutes: 55,
      lead: 'GROUP BY 是报表的骨架。HAVING 不是 WHERE 的别名：WHERE 在分组前过滤行，HAVING 在分组后过滤组。',
      source: 'PostgreSQL 16 文档 · GROUP BY、HAVING',
      sections: [
        {
          h: '分组前过滤与分组后过滤',
          p: `[[WHERE published = true]] 先去掉未发布课程，再对剩下的行分组；[[HAVING COUNT(*) >= 5]] 则是在每组算完后，只保留报名数不少于 5 的组。把 HAVING 写成 WHERE 会报错，因为 WHERE 看不到聚合结果。

执行顺序可以粗略记成：FROM → WHERE → GROUP BY → 聚合 → HAVING → SELECT → ORDER BY → LIMIT。理解顺序，才知道别名能不能用：SELECT 里的别名通常在 ORDER BY 可用，在 WHERE/HAVING 里不要依赖。

分组列可以是表达式，比如 [[date_trunc('month', created_at)]]。表达式要稳定、可重复，否则同一行可能落进不同组。`,
          code: `SELECT course_id,
       COUNT(*) AS enrollments
FROM enrollments
WHERE status <> 'refunded'
GROUP BY course_id
HAVING COUNT(*) >= 5
ORDER BY enrollments DESC;`,
          output: ` course_id | enrollments
-----------+-------------
         1 |          12
         2 |           8`,
          tip: `想过滤“报名数大于 5 的课程”，用 HAVING；想过滤“已退款记录”，用 WHERE。两者不能互换。`
        },
        {
          h: '分组报表最常见的四个错误',
          p: `第一，忘了 GROUP BY 里的列，导致同名列被随意取值。第二，把聚合放进 WHERE，数据库直接报错。第三，对 NULL 分组：所有 NULL 会进入同一组，报表里可能出现“未知”一行。第四，分组键基数太高，比如按用户 ID 分组，结果行数接近原始行数，聚合失去意义。

日期报表用 [[date_trunc('day', created_at)]] 或 [[date_trunc('month', ...)]]，不要用字符串截取；时区要先 [[AT TIME ZONE]] 转换到业务时区，否则跨时区日界会错。

需要“按课程 + 按状态”两个维度时，GROUP BY 写两列，结果就是二维组合；不要用两个独立查询再在应用里拼，容易漏组合。`,
          code: `SELECT course_id,
       status,
       COUNT(*) AS cnt
FROM enrollments
GROUP BY course_id, status
ORDER BY course_id, status;`,
          output: ` course_id | status    | cnt
-----------+-----------+-----
         1 | active    |   9
         1 | completed |   3
         2 | active    |   6
         2 | completed |   2`,
          tip: `[[GROUP BY]] 的列越多，组越细、行越多。先问报表到底要几个维度，不要把所有列都塞进去。`
        }
      ],
      points: ['WHERE 在分组前过滤行，HAVING 在分组后过滤组', 'GROUP BY 的列决定报表粒度', 'NULL 会形成单独一组', '日期分组用 date_trunc，不用字符串截取'],
      practice: '写一条“每门课按状态统计报名人数，只保留总数 ≥ 3 的组合”的查询。'
    },
    {
      id: 'db-4-3',
      title: '4.3 聚合中的 NULL、去重与占比',
      minutes: 55,
      lead: '报表里的“平均分”到底除以谁？“完课率”分母是报名数还是活跃数？这一课把 NULL、去重和占比三个坑一次讲清。',
      source: 'PostgreSQL 16 文档 · Aggregate Expressions；数据可视化实践',
      sections: [
        {
          h: '先定分母，再算比率',
          p: `[[AVG(score)]] 的分母是“有分数的行”，不是“所有报名行”。如果缺考学生的 score 为 NULL，平均分会虚高。要算全体平均，应该 [[AVG(COALESCE(score, 0))]]，或者先明确“只统计已提交”。

完课率常用 [[COUNT(*) FILTER (WHERE progress = 100)]] 除以 [[COUNT(*)]]。[[FILTER]] 是 PostgreSQL 的条件聚合语法，比 [[SUM(CASE WHEN ... THEN 1 ELSE 0 END)]] 更直观，也更容易读。

比率不要用整数除法。[[3 / 5]] 在 SQL 里是 0；要 [[3::numeric / 5]] 或 [[3 * 1.0 / 5]]。报表展示再格式化成百分比。`,
          code: `SELECT course_id,
       COUNT(*) AS enrolled,
       COUNT(*) FILTER (WHERE progress = 100) AS completed,
       ROUND(
         COUNT(*) FILTER (WHERE progress = 100)::numeric
         / NULLIF(COUNT(*), 0) * 100, 1
       ) AS completion_pct
FROM enrollments
GROUP BY course_id;`,
          output: ` course_id | enrolled | completed | completion_pct
-----------+----------+-----------+----------------
         1 |       12 |         3 |           25.0
         2 |        8 |         2 |           25.0`,
          tip: `[[NULLIF(COUNT(*), 0)]] 防止空组除零。没有报名时返回 NULL，比返回 Infinity 更适合报表。`
        },
        {
          h: '去重计数与条件聚合',
          p: `[[COUNT(DISTINCT user_id)]] 统计“有多少个不同用户”，不是“有多少条记录”。去重计数在大数据量上代价高，因为要维护去重集合；能先 GROUP BY 再 COUNT 时，往往更可控。

条件聚合可以在一条 SQL 里同时算多个口径：[[COUNT(*) FILTER (WHERE status='active')]]、[[SUM(amount) FILTER (WHERE paid_at IS NOT NULL)]]。这比跑多条查询再拼更快，也避免数据快照不一致。

但不要把所有报表都塞进一条 SQL。口径超过五六个、JOIN 超过三张表时，拆成 CTE 或分层查询，可读性和优化空间都更好。`,
          code: `SELECT
  COUNT(DISTINCT user_id) AS active_users,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed_rows,
  SUM(amount_cents) FILTER (WHERE paid_at IS NOT NULL) AS paid_cents
FROM enrollments
WHERE created_at >= timestamptz '2026-11-01';`,
          output: ` active_users | completed_rows | paid_cents
--------------+----------------+------------
           18 |              5 |     486000`,
          tip: `[[COUNT(DISTINCT ...)]] 在 GROUP BY 内部再执行，容易变成“组内去重”。先确认你要的是全局去重还是每门课去重。`
        }
      ],
      points: ['比率前先明确分母', 'FILTER 是更清晰的条件聚合', '整数除法会截断，比率要转 numeric', '去重计数代价高，先想清统计口径'],
      practice: '为每门课算“报名数、完课数、完课率、付费金额”，要求空组不报错。'
    }
  ]
});

/* --- db-ch05.js --- */

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

/* --- db-ch06.js --- */

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch06',
  part: 2,
  number: '06',
  title: '子查询、CTE 与递归',
  summary: '当一条 SELECT 不够用时，可以把查询嵌套进查询。子查询适合局部取值，CTE 适合把复杂逻辑拆成分层步骤，递归 CTE 能处理树、评论链和路径。',
  goals: ['区分标量、IN、EXISTS 三种子查询', '用 CTE 拆分复杂报表', '写出安全的递归 CTE', '知道 CTE 物化与内联的边界'],
  source: 'PostgreSQL 16 文档 · Subqueries、WITH Queries',
  lessons: [
    {
      id: 'db-6-1',
      title: '6.1 标量子查询、IN 与 EXISTS',
      minutes: 55,
      lead: '子查询不是“SQL 套 SQL”这么简单。放的位置不同，执行次数和语义都不同：SELECT 里的标量子查询、WHERE 里的 IN/EXISTS、FROM 里的派生表，各有各的边界。',
      source: 'PostgreSQL 16 文档 · Subquery Expressions',
      sections: [
        {
          h: '标量子查询必须只返回一行一列',
          p: `SELECT 列表里的子查询叫标量子查询：[[(SELECT MAX(score) FROM submissions)]] 返回一个值，可以参与运算。如果子查询返回多行，数据库会报 “more than one row returned by a subquery”。

标量子查询可以相关（引用外层列），也可以不相关。相关子查询会对外层每一行执行一次，数据量大时可能非常慢；能改写成 JOIN 或窗口函数时，通常更高效。

FROM 里的子查询叫派生表，必须有别名。它适合“先聚合再连接”的分层写法，但不要把整段复杂逻辑都塞进 FROM，可读性会很差。`,
          code: `SELECT s.id, s.score,
       (SELECT AVG(score) FROM submissions) AS global_avg,
       s.score - (SELECT AVG(score) FROM submissions) AS diff
FROM submissions s;`,
          output: ` id | score | global_avg | diff
----+-------+------------+-------
  1 |    90 |       85.0 |   5.0
  2 |    80 |       85.0 |  -5.0`,
          tip: `标量子查询只用一次时没关系；在 SELECT 里反复写同一个子查询，先抽成 CTE 或 JOIN，别让数据库重复算。`
        },
        {
          h: 'IN 是“值在集合里”，EXISTS 是“有没有一行”',
          p: `[[WHERE id IN (SELECT user_id FROM bans)]] 关心子查询返回的值集合；[[WHERE EXISTS (SELECT 1 FROM bans b WHERE b.user_id = u.id)]] 关心是否存在匹配行。两者在简单场景下结果相同，但 NULL 和性能不同。

[[IN]] 的子查询列如果有 NULL，[[NOT IN]] 会中招；[[EXISTS]] 不受 NULL 影响。存在性判断优先用 EXISTS，尤其是反连接。

相关 EXISTS 可以用索引做半连接，通常比把子查询结果物化再比较更灵活。写 [[SELECT 1]] 而不是 [[SELECT *]]，语义更清楚，优化器也不会真的取所有列。`,
          code: `-- 有封禁记录的用户
SELECT u.id, u.name
FROM users u
WHERE EXISTS (
  SELECT 1 FROM bans b WHERE b.user_id = u.id
);

-- 没有封禁记录的用户
SELECT u.id, u.name
FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM bans b WHERE b.user_id = u.id
);`,
          output: `-- 第一条返回被封禁用户
-- 第二条返回正常用户，NULL 不会让结果消失`,
          tip: `[[EXISTS]] 只关心行是否存在，子查询里选什么列都行；写 [[SELECT 1]] 是团队约定，也少让读代码的人误解。`
        }
      ],
      points: ['标量子查询只能返回一行一列', '相关子查询按外层行执行，注意性能', 'IN 关心值集合，EXISTS 关心是否存在', '反连接优先 NOT EXISTS'],
      practice: '用 EXISTS 和 NOT EXISTS 各写一条查询，分别找“有报名记录的用户”和“没有报名记录的用户”。'
    },
    {
      id: 'db-6-2',
      title: '6.2 CTE：把复杂查询拆成分层步骤',
      minutes: 55,
      lead: 'CTE（Common Table Expression）用 WITH 给子查询起名字。它不是为了炫技，而是把“先算什么、再算什么”写成可读的层次，让优化器和人都有路可循。',
      source: 'PostgreSQL 16 文档 · WITH Queries',
      sections: [
        {
          h: 'WITH 的基本形状与可见性',
          p: `[[WITH stats AS (SELECT ...) SELECT ... FROM stats]] 定义一个临时结果集。CTE 只在当前语句内可见，不写进数据库，也不跨请求保存。它可以被多次引用，但 PostgreSQL 不保证只计算一次。

多个 CTE 用逗号分隔，后面的 CTE 可以引用前面的；不能互相循环引用。给 CTE 起业务名，比如 [[course_stats]]、[[paid_orders]]，不要叫 [[t1]]、[[tmp]]。

CTE 适合“先过滤、再聚合、再连接”的流水线。一个 CTE 只做一件事，超过三层时考虑拆成视图或应用层任务，否则 SQL 会变成难维护的迷宫。`,
          code: `WITH published_courses AS (
  SELECT id, title
  FROM courses
  WHERE published = true
),
course_stats AS (
  SELECT course_id, COUNT(*) AS enrollments
  FROM enrollments
  GROUP BY course_id
)
SELECT p.id, p.title, COALESCE(s.enrollments, 0) AS enrollments
FROM published_courses p
LEFT JOIN course_stats s ON s.course_id = p.id
ORDER BY enrollments DESC;`,
          output: `-- 先筛已发布课程，再算报名数，最后连接
-- 没有报名的已发布课程显示 0`,
          tip: `CTE 不是“性能优化按钮”。PostgreSQL 可能把简单 CTE 内联，也可能物化；用 [[MATERIALIZED]] 强制物化前先 EXPLAIN。`
        },
        {
          h: 'CTE 与视图、派生表怎么选',
          p: `派生表写在 FROM 里，作用域只有这一层；CTE 可以多处引用，读起来更像步骤；视图是持久化的命名查询，跨请求复用。临时报表用 CTE，稳定业务口径用视图，复杂一次性分析用派生表也可以。

CTE 引用两次时，是否重复计算取决于优化器。PostgreSQL 12 之后，简单 CTE 默认可能内联；[[WITH x AS MATERIALIZED (...)] ] 会强制物化。物化能避免重复计算，但会把中间结果落进内存/磁盘，数据大时反而慢。

不要用 CTE 掩盖糟糕的连接。先确认每个步骤的输入输出和行数，再决定是否需要 CTE。`,
          code: `WITH paid AS MATERIALIZED (
  SELECT enrollment_id, SUM(amount_cents) AS paid_cents
  FROM payments
  WHERE paid_at IS NOT NULL
  GROUP BY enrollment_id
)
SELECT e.user_id, SUM(p.paid_cents) AS total_paid
FROM enrollments e
JOIN paid p ON p.enrollment_id = e.id
GROUP BY e.user_id;`,
          output: `-- 支付先聚合成一行一个报名，再连接，避免 fan-out`,
          tip: `[[MATERIALIZED]] 是性能取舍，不是正确性开关。先测没物化与物化的执行时间，再决定。`
        }
      ],
      points: ['CTE 用 WITH 定义，只在当前语句可见', '一个 CTE 只做一件事，按业务命名', 'CTE 可能内联也可能物化，需看 EXPLAIN', '稳定口径用视图，一次性报表用 CTE'],
      practice: '把上一章的“课程报名报表”改写成两个 CTE：一个筛课程，一个算报名，再连接。'
    },
    {
      id: 'db-6-3',
      title: '6.3 递归 CTE：树、评论链与路径',
      minutes: 60,
      lead: '评论可以回复评论，分类可以有子分类，组织有上下级。这类“自己引用自己”的结构，用递归 CTE 一层层展开，比在应用里循环查库更稳。',
      source: 'PostgreSQL 16 文档 · Recursive Queries',
      sections: [
        {
          h: '递归 CTE 的两段：种子与递归步',
          p: `[[WITH RECURSIVE tree AS (种子查询 UNION ALL 递归查询) SELECT ...]]。种子查询给出第一层，递归查询引用 [[tree]] 自己，每次取下一层，直到没有新行。

必须有一个终止条件，否则会无限递归。常见写法是 [[WHERE parent_id IS NOT NULL]]、[[WHERE depth < 5]] 或 [[WHERE id <> ANY(path)]] 防环。生产表如果有环，要加路径数组或深度上限。

[[UNION ALL]] 允许重复，[[UNION]] 会去重但更慢。树结构通常用 UNION ALL，并靠 [[depth]] 或路径限制终止。`,
          code: `WITH RECURSIVE comment_tree AS (
  -- 种子：顶层评论
  SELECT id, post_id, parent_id, body, 0 AS depth,
         ARRAY[id] AS path
  FROM comments
  WHERE post_id = 42 AND parent_id IS NULL

  UNION ALL

  -- 递归：取出下一层回复
  SELECT c.id, c.post_id, c.parent_id, c.body, t.depth + 1,
         t.path || c.id
  FROM comments c
  JOIN comment_tree t ON c.parent_id = t.id
  WHERE t.depth < 5
)
SELECT id, depth, body
FROM comment_tree
ORDER BY path;`,
          output: `-- depth 0 是顶层评论，depth 1 是回复，依此类推
-- ORDER BY path 让同一支线按层级顺序输出`,
          tip: `[[path || c.id]] 既用于排序，也可用于防环：[[WHERE NOT c.id = ANY(t.path)]]。没有环检测的递归，遇到脏数据会一直跑。`
        },
        {
          h: '递归查询的成本与替代方案',
          p: `递归 CTE 每层都可能扫一遍表，深度大、分支多时成本很高。评论树适合“按需加载一层”，不要一次把整棵树拉进内存；前端展开时才查下一层，或预计算物化路径。

物化路径（[[path]] 存 [[/1/5/9]]）和嵌套集（[[lft/rgt]]）能把树查询变成范围查询，但写入维护复杂。全栈项目通常先用 [[parent_id]] + 递归 CTE，数据量真的上来再演进。

递归 CTE 的结果顺序不保证层级，必须显式 [[ORDER BY path]] 或 [[depth, id]]。`,
          code: `-- 只取某个评论的直接回复，应用层按需展开
SELECT id, body, created_at
FROM comments
WHERE parent_id = 9
ORDER BY created_at ASC;`,
          output: `-- 一次只查一层，响应快，也避免深递归`,
          tip: `不要为了“一条 SQL 拿全树”牺牲首屏速度。评论区分层加载通常比递归全量更快，也更符合用户阅读。`
        }
      ],
      points: ['递归 CTE 由种子查询和递归步组成', '必须设置终止条件或防环路径', 'UNION ALL 通常比 UNION 更适合树', '深树优先按层加载或物化路径'],
      practice: '用递归 CTE 查出一条 3 层评论链，并加 depth 上限与 path 排序。'
    }
  ]
});

/* --- db-ch07.js --- */

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch07',
  part: 2,
  number: '07',
  title: '窗口函数与排名',
  summary: '窗口函数保留每一行，同时让它看到“同组其他行”。排名、累计、移动平均、分组占比，这些报表需求用 GROUP BY 做不出来，窗口函数正好补上。',
  goals: ['区分 ROW_NUMBER、RANK、DENSE_RANK', '写累计和移动平均', '用窗口去重取每组最新一行', '理解 PARTITION BY 与 ORDER BY 的作用域'],
  source: 'PostgreSQL 16 文档 · Window Functions；SQL 必知必会',
  lessons: [
    {
      id: 'db-7-1',
      title: '7.1 ROW_NUMBER、RANK 与 DENSE_RANK',
      minutes: 55,
      lead: '同一个分数可以有不同名次口径：并列占不占位、下一名是 2 还是 3？三种排名函数给出三种答案，选错就会在榜单上出现歧义。',
      source: 'PostgreSQL 16 文档 · Window Functions',
      sections: [
        {
          h: '三种排名：连续、跳跃与不并列',
          p: `[[ROW_NUMBER()]] 给每行一个唯一序号，哪怕值相同也强行排出 1、2、3；[[RANK()]] 遇到相同值给相同名次，但会跳过后续名次（1、1、3）；[[DENSE_RANK()]] 相同值同名次，后续名次不跳（1、1、2）。

榜单通常用 RANK 或 DENSE_RANK，分页取 Top N 用 ROW_NUMBER 更可控。[[PARTITION BY course_id ORDER BY score DESC]] 表示“每门课内部单独排名”，不是全局排名。

窗口函数不能直接写在 WHERE 里；要过滤排名，先包一层子查询或 CTE。`,
          code: `SELECT user_id, course_id, score,
       ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY score DESC) AS row_no,
       RANK()       OVER (PARTITION BY course_id ORDER BY score DESC) AS rank_no,
       DENSE_RANK() OVER (PARTITION BY course_id ORDER BY score DESC) AS dense_no
FROM submissions;`,
          output: ` user_id | course_id | score | row_no | rank_no | dense_no
---------+-----------+-------+--------+---------+----------
       7 |         1 |   100 |      1 |       1 |        1
       9 |         1 |   100 |      2 |       1 |        1
       4 |         1 |    90 |      3 |       3 |        2`,
          tip: `[[ROW_NUMBER]] 的结果依赖 ORDER BY 的决胜字段；分数相同但没有第二排序键时，序号可能每次不同。`
        },
        {
          h: '分组内 Top N 的标准写法',
          p: `先用窗口函数算排名，再在外层筛 [[rank_no <= 3]]。不要试图在 WHERE 里直接调用 [[RANK()]]，SQL 的执行顺序不允许。

取“每组最新一条”也常用 ROW_NUMBER：[[PARTITION BY user_id ORDER BY created_at DESC, id DESC]]，然后筛 [[row_no = 1]]。这比 [[GROUP BY user_id + MAX(created_at)]] 再回连更简单，也不怕时间重复。

排名列要保留在结果里，方便解释“为什么这条入选”。只取 Top N 时，输出排名和分数，产品才敢展示。`,
          code: `WITH ranked AS (
  SELECT user_id, course_id, score,
         ROW_NUMBER() OVER (
           PARTITION BY course_id
           ORDER BY score DESC, user_id ASC
         ) AS row_no
  FROM submissions
)
SELECT course_id, user_id, score, row_no
FROM ranked
WHERE row_no <= 3
ORDER BY course_id, row_no;`,
          output: `-- 每门课取分数最高的 3 名；同分按 user_id 升序决胜`,
          tip: `Top N 一定要有决胜字段，否则同分时谁进前三没有稳定答案。`
        }
      ],
      points: ['ROW_NUMBER 唯一序号，RANK 跳号，DENSE_RANK 不跳号', 'PARTITION BY 定义分组窗口', '窗口函数不能直接放 WHERE，需子查询/CTE', 'Top N 排名要有稳定决胜字段'],
      practice: '为每门课取前三名，分别用 ROW_NUMBER 和 DENSE_RANK，比较同分时的结果差异。'
    },
    {
      id: 'db-7-2',
      title: '7.2 累计、移动平均与分组占比',
      minutes: 60,
      lead: '窗口函数最实用的地方，是让每一行同时看到“到目前为止”和“整个分组”。累计报名、七日移动平均、每门课内的成绩占比，都靠这一层窗口。',
      source: 'PostgreSQL 16 文档 · Window Functions；数据可视化实践',
      sections: [
        {
          h: '累计求和与移动窗口',
          p: `[[SUM(amount) OVER (ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)]] 是从第一行到当前行的累计。[[ROWS BETWEEN 6 PRECEDING AND CURRENT ROW]] 是最近 7 行的移动窗口。

默认窗口是 [[RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW]]，遇到相同排序值时会把并列行一起纳入，和 [[ROWS]] 的逐行累计不同。金额、人次这类“逐行累计”通常要显式写 [[ROWS]]。

移动平均要注意空档：没有数据的日期不会自动出现。需要连续日期轴时，先用 [[generate_series]] 造日期，再 LEFT JOIN 数据。`,
          code: `SELECT day,
       revenue,
       SUM(revenue) OVER (
         ORDER BY day
         ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
       ) AS running_total,
       AVG(revenue) OVER (
         ORDER BY day
         ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
       ) AS ma7
FROM daily_revenue;`,
          output: `-- running_total 是累计营收
-- ma7 是包含当天在内最近 7 天的平均`,
          tip: `[[ROWS]] 按物理行数，[[RANGE]] 按排序值范围。有重复日期时，两者结果会不同。`
        },
        {
          h: '分组占比与窗口聚合',
          p: `[[SUM(score) OVER (PARTITION BY course_id)]] 把每门课的总分贴到该组每一行，再用 [[score / total]] 算占比。这个过程不减少行数，适合在明细表里加一列“占组内多少”。

[[NTILE(4)]] 把分组切成四等份，用于分位数；[[PERCENT_RANK]] 返回 0–1 的百分位排名。数据量小或分布偏斜时，NTILE 的边界需要业务解释，不要直接当“四分位”。

窗口聚合和 GROUP BY 可以同时出现：内层 GROUP BY 算日汇总，外层窗口算累计。分层写清楚，比一条 SQL 里混用更容易验证。`,
          code: `WITH course_totals AS (
  SELECT course_id, SUM(score) AS total_score
  FROM submissions
  GROUP BY course_id
)
SELECT s.course_id, s.user_id, s.score,
       t.total_score,
       ROUND(s.score::numeric / NULLIF(t.total_score, 0) * 100, 2) AS pct
FROM submissions s
JOIN course_totals t USING (course_id);`,
          output: `-- pct 是该条成绩占本课程总分的百分比
-- 先 GROUP BY 算总分，再连接明细`,
          tip: `占比的分母要明确是“组内总分”“组内人数”还是“全站总分”。三种分母会得到完全不同的报表。`
        }
      ],
      points: ['累计用 UNBOUNDED PRECEDING 到 CURRENT ROW', '移动平均用 ROWS BETWEEN N PRECEDING', 'ROWS 与 RANGE 遇到重复排序值结果不同', '占比先算窗口聚合，再逐行相除'],
      practice: '为每日营收算累计总额和 7 日移动平均，并解释 ROWS 与 RANGE 的差异。'
    },
    {
      id: 'db-7-3',
      title: '7.3 窗口帧与“每组最新一条”',
      minutes: 55,
      lead: '窗口函数最常见的生产用法，不是排名，而是去重取最新：每个用户的最新订单、每门课的最新进度、每个会话的最后一条消息。',
      source: 'PostgreSQL 16 文档 · Window Function Calls；生产 SQL 实践',
      sections: [
        {
          h: '用 ROW_NUMBER 取每组最新',
          p: `[[ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC, id DESC)]] 给每个用户的消息按时间倒序编号，筛 [[row_no = 1]] 就是最新一条。它比 [[DISTINCT ON]] 更通用，也更容易加额外条件。

PostgreSQL 还有 [[DISTINCT ON (user_id) ... ORDER BY user_id, created_at DESC]]，写法更短，但排序必须是 [[DISTINCT ON]] 列在前。跨数据库时 ROW_NUMBER 更可移植。

取最新时一定要有唯一决胜字段。只有 [[created_at DESC]]，同一秒的两条消息谁是最新不确定；加 [[id DESC]] 后顺序稳定。`,
          code: `WITH latest AS (
  SELECT m.*,
         ROW_NUMBER() OVER (
           PARTITION BY m.conversation_id
           ORDER BY m.created_at DESC, m.id DESC
         ) AS rn
  FROM messages m
)
SELECT conversation_id, id, body, created_at
FROM latest
WHERE rn = 1;`,
          output: `-- 每个会话只保留最后一条消息
-- 同一秒内按 id 倒序决胜`,
          tip: `不要用 [[MAX(created_at)]] 再回连，除非时间列唯一；同一时间多条会让结果翻倍。`
        },
        {
          h: '窗口帧不是越大越好',
          p: `窗口函数会把分组数据放进内存或临时空间。[[PARTITION BY user_id]] 如果有百万用户，每个用户一个窗口，内存压力可能很大；能先过滤到目标用户，再开窗。

[[ORDER BY]] 在窗口里是必需的（除了纯聚合窗口），它决定累计和排名的方向。[[PARTITION BY]] 和 [[ORDER BY]] 的组合要跟业务问题一致，别把“全局排名”写成“组内排名”。

窗口函数通常不能和 [[GROUP BY]] 混在同一个 SELECT 层级里直接引用明细列；先聚合再开窗，或先开窗再聚合，按需求分层。`,
          code: `SELECT user_id, course_id, progress,
       MAX(progress) OVER (PARTITION BY user_id) AS best_progress,
       progress::numeric / NULLIF(MAX(progress) OVER (PARTITION BY user_id), 0) AS ratio
FROM enrollments
WHERE user_id = 42;`,
          output: `-- 只查一个用户，窗口只在该用户的分区里计算
-- ratio 表示该课程进度占该用户最高进度的比例`,
          tip: `先 [[WHERE user_id = 42]] 再开窗，和先对全表开窗再过滤，结果可能一样，成本差很多。`
        }
      ],
      points: ['ROW_NUMBER 是每组取最新的标准写法', '决胜字段保证同一时间戳的顺序稳定', '窗口分区过大会消耗内存', '先过滤目标范围，再开窗'],
      practice: '为每个会话取最后一条消息，写出 ROW_NUMBER 版本，并说明为什么加 id 决胜。'
    }
  ]
});

/* --- db-ch08.js --- */

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch08',
  part: 2,
  number: '08',
  title: '集合运算与报表分层',
  summary: 'UNION 把两个结果集纵向拼接，INTERSECT/EXCEPT 做交集与差集；条件聚合把行转成列。真正的报表不是一条巨型 SQL，而是“明细—聚合—展示”的分层结构。',
  goals: ['区分 UNION 与 UNION ALL', '用条件聚合做透视表', '设计明细层与汇总层', '避免一条 SQL 承担所有报表逻辑'],
  source: 'PostgreSQL 16 文档 · Combining Queries；SQL 反模式',
  lessons: [
    {
      id: 'db-8-1',
      title: '8.1 UNION、INTERSECT 与 EXCEPT',
      minutes: 50,
      lead: '集合运算要求两边列数相同、类型兼容，结果按位置对应。[[UNION]] 去重，[[UNION ALL]] 保留重复；这两个的性能差异，往往比语法差异更重要。',
      source: 'PostgreSQL 16 文档 · UNION、INTERSECT、EXCEPT',
      sections: [
        {
          h: '纵向拼接：列对列，不是行对行',
          p: `[[SELECT id, title FROM courses UNION SELECT id, name FROM lessons]] 按位置拼接，第一列对第一列、第二列对第二列，列名取自第一个 SELECT。两边列数不一致会直接报错。

[[UNION]] 会对结果去重，需要排序或哈希，数据量大时成本高；[[UNION ALL]] 直接拼接，不保证顺序。确认没有重复，或业务允许重复时，优先 UNION ALL。

集合运算的结果顺序不保证。要排序，把整个 UNION 包进子查询，再在最后写 [[ORDER BY]]；不要给每个分支都写 ORDER BY，数据库会报错或忽略。`,
          code: `-- 合并两类事件，保留重复
SELECT 'enrollment' AS kind, user_id, created_at FROM enrollments
UNION ALL
SELECT 'submission' AS kind, user_id, created_at FROM submissions
ORDER BY created_at DESC
LIMIT 50;`,
          output: `-- 第一列标记事件类型，后两列对齐
-- ORDER BY 作用于合并后的整个结果`,
          tip: `[[UNION]] 去重是按所有列比较，不是只按 id。想按 id 去重，先明确保留哪一行，不要指望 UNION。`
        },
        {
          h: '交集与差集：找共同和找缺失',
          p: `[[INTERSECT]] 返回两边都出现的行；[[EXCEPT]] 返回在左边出现、但不在右边出现的行。它们默认也去重，且按整行比较。

“上过课程 A 且上过课程 B 的用户”可以用 INTERSECT；“上过 A 但没上过 B 的用户”可以用 EXCEPT。但更直观的写法是 EXISTS 或 JOIN，尤其需要保留用户属性时。

集合运算要求两边行结构完全一致；只想比较用户 ID 时，两个分支都只选 [[user_id]]，不要一边选三列一边选一列。`,
          code: `-- 同时报名课程 1 和课程 2 的用户
SELECT user_id FROM enrollments WHERE course_id = 1
INTERSECT
SELECT user_id FROM enrollments WHERE course_id = 2;

-- 报名课程 1 但没报名课程 2 的用户
SELECT user_id FROM enrollments WHERE course_id = 1
EXCEPT
SELECT user_id FROM enrollments WHERE course_id = 2;`,
          output: `-- INTERSECT 返回交集用户
-- EXCEPT 返回只在课程 1 的用户`,
          tip: `需要同时返回用户名、报名时间时，集合运算就不够用了；改用 JOIN 或 EXISTS。`
        }
      ],
      points: ['集合运算按列位置对齐，列数必须一致', 'UNION 去重，UNION ALL 保留重复', 'INTERSECT/EXCEPT 也按整行比较', '需要属性时用 JOIN/EXISTS，不强行集合运算'],
      practice: '写两条查询：同时报名两门课的用户，以及只报名第一门课的用户。'
    },
    {
      id: 'db-8-2',
      title: '8.2 条件聚合与透视表',
      minutes: 55,
      lead: '数据库默认输出长表，产品想要宽表。把“状态”从行变成列，不需要 Excel，条件聚合就能做。',
      source: 'PostgreSQL 16 文档 · Aggregate Expressions；报表设计实践',
      sections: [
        {
          h: '用 CASE + SUM 把行转成列',
          p: `[[SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)]] 统计 active 的行数；[[COUNT(*) FILTER (WHERE status = 'active')]] 是更清晰的 PostgreSQL 写法。两种都能把不同状态放到同一行的不同列。

透视表的关键是“分组键 + 条件列”。[[GROUP BY course_id]] 决定每行一门课，[[FILTER]] 决定每列一个状态。状态值是有限的、稳定的，才能写死列；状态动态增长时，应该返回长表，让前端透视。

百分比列在透视后计算：[[active::numeric / NULLIF(total, 0)]]。不要把比率藏在 CASE 里，否则很难复用和解释。`,
          code: `SELECT course_id,
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status = 'active') AS active,
       COUNT(*) FILTER (WHERE status = 'completed') AS completed,
       COUNT(*) FILTER (WHERE status = 'refunded') AS refunded,
       ROUND(
         COUNT(*) FILTER (WHERE status = 'completed')::numeric
         / NULLIF(COUNT(*), 0) * 100, 1
       ) AS completion_pct
FROM enrollments
GROUP BY course_id;`,
          output: ` course_id | total | active | completed | refunded | completion_pct
-----------+-------+--------+-----------+----------+----------------
         1 |    12 |      9 |         3 |        0 |           25.0`,
          tip: `状态列写死之前，先确认业务不会频繁加状态。动态状态用长表 + 前端透视，扩展性更好。`
        },
        {
          h: '日期透视与连续时间轴',
          p: `按天、按周、按月透视时，先 [[date_trunc('day', created_at)]] 分组，再用条件聚合。没有数据的日期不会自动出现，需要连续轴时，用 [[generate_series]] 生成日期，再 LEFT JOIN 汇总。

时区要在分组前处理：[[date_trunc('day', created_at AT TIME ZONE 'Asia/Shanghai')]]。直接用 UTC 分组，会把中国用户的凌晨算到前一天。

报表的“今天”不要用数据库服务器本地时间猜，显式传业务时区或日期范围。应用层把 [[from/to]] 传进来，SQL 只负责查询。`,
          code: `WITH days AS (
  SELECT generate_series(
    date '2026-11-01',
    date '2026-11-07',
    interval '1 day'
  )::date AS day
),
daily AS (
  SELECT (created_at AT TIME ZONE 'Asia/Shanghai')::date AS day,
         COUNT(*) AS cnt
  FROM enrollments
  GROUP BY 1
)
SELECT d.day, COALESCE(x.cnt, 0) AS enrollments
FROM days d
LEFT JOIN daily x USING (day)
ORDER BY d.day;`,
          output: `-- 11 月 1–7 日每天一行；没有报名的日期显示 0`,
          tip: `[[generate_series]] 生成的是 timestamp，转 [[date]] 后再连接，避免时间部分导致对不上。`
        }
      ],
      points: ['条件聚合把状态从行转成列', 'FILTER 比 CASE 更易读（PostgreSQL）', '动态状态用长表，不写死列', '连续日期轴用 generate_series + LEFT JOIN'],
      practice: '为最近 7 天做一张“每天报名数 + 完课数”的透视表，空缺日期补 0。'
    },
    {
      id: 'db-8-3',
      title: '8.3 报表分层：明细、聚合与展示',
      minutes: 55,
      lead: '一条 SQL 里塞进五个 JOIN、三层聚合和窗口函数，结果没人敢改。把报表拆成明细层、聚合层、展示层，每一层只解决一个问题。',
      source: 'PostgreSQL 16 文档 · WITH Queries；分析型 SQL 实践',
      sections: [
        {
          h: '三层结构：先保证口径，再谈展示',
          p: `明细层负责“哪些行算数”：过滤退款、限定时间、排除测试账号。聚合层负责“按什么粒度算”：每门课、每天、每个用户。展示层负责“长表转宽表、补零、排序、格式化”。

三层用 CTE 串起来，每层都有明确的名字。出现问题能快速定位是口径错了、粒度错了，还是展示层排序错了。

不要在下钻报表里用“全站总数”当分母，却在分组后计算。先明确每个指标的分子分母，再落到对应层级。`,
          code: `WITH detail AS (
  SELECT e.course_id, e.user_id, e.progress, e.status, e.enrolled_at
  FROM enrollments e
  WHERE e.status <> 'refunded'
    AND e.enrolled_at >= timestamptz '2026-11-01'
),
by_course AS (
  SELECT course_id,
         COUNT(*) AS enrolled,
         COUNT(*) FILTER (WHERE progress = 100) AS completed
  FROM detail
  GROUP BY course_id
)
SELECT c.title,
       b.enrolled,
       b.completed,
       ROUND(b.completed::numeric / NULLIF(b.enrolled, 0) * 100, 1) AS pct
FROM by_course b
JOIN courses c ON c.id = b.course_id
ORDER BY b.enrolled DESC;`,
          output: `-- detail 锁定口径，by_course 锁定粒度，最后只做展示`,
          tip: `每一层都问“这层的行代表什么”。如果答不上来，说明粒度还没想清楚，先别继续加 JOIN。`
        },
        {
          h: '报表性能：先减少行，再减少列',
          p: `报表慢，通常不是最后排序慢，而是前面扫了太多行、连了太多表。把过滤条件尽量下推到明细层，把聚合尽量早做，把展示层只留需要的列。

宽表不是越宽越好。一次返回 50 列，数据库要算、网络要传、前端要渲染；按页面需要拆接口，或让前端只取必要字段。

需要“总计行”时，不要用 [[WITH ROLLUP]] 猜 PostgreSQL 不支持；用 [[GROUPING SETS]] 或单独一条聚合查询。总计和明细混在一起时，要标记 [[grouping(...)]]，避免把总计行当普通组。`,
          code: `SELECT course_id,
       COUNT(*) AS enrolled
FROM enrollments
GROUP BY GROUPING SETS ((course_id), ())
ORDER BY course_id NULLS LAST;`,
          output: ` course_id | enrolled
-----------+----------
         1 |       12
         2 |        8
           |       23   -- 总计行`,
          tip: `总计行会让 [[course_id]] 为 NULL。展示层要识别它，别把它当成“未知课程”。`
        }
      ],
      points: ['报表分明细、聚合、展示三层', '每层只解决一个问题，命名清晰', '过滤和聚合尽量下推，减少扫描', '总计行用 GROUPING SETS，不与会话混淆'],
      practice: '把一个“课程报名 + 完课率 + 最近 7 天趋势”的报表拆成三层 CTE，并说明每层输出什么。'
    }
  ]
});

/* --- db-ch09.js --- */

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

/* --- db-ch10.js --- */

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

/* --- db-ch11.js --- */

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

/* --- db-ch12.js --- */

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch12',
  part: 3,
  number: '12',
  title: '业务建模：用户、订单与状态',
  summary: '业务表不是字段堆叠，而是规则落地。用户权限、订单支付、软删除、审计和时间字段，每一个都对应并发、合规或可追溯的真实问题。',
  goals: ['设计用户、角色、权限表', '为订单与支付画状态机', '正确使用软删除和审计日志', '统一时间字段与时区'],
  source: '数据库设计实践；PostgreSQL 16 文档',
  lessons: [
    {
      id: 'db-12-1',
      title: '12.1 用户、角色与权限',
      minutes: 55,
      lead: '“管理员能删课，普通用户不能”这种规则，不应该散落在每个接口的 if 里。用角色、权限和资源关系把它落成可查询的数据。',
      source: 'RBAC 实践；PostgreSQL 外键与唯一约束',
      sections: [
        {
          h: 'RBAC 的最小四张表',
          p: `用户 [[users]]、角色 [[roles]]、权限 [[permissions]]，以及用户-角色、角色-权限的连接表。权限用稳定编码，比如 [[course:read]]、[[course:write]]，不要用中文名称做判断。

用户可以有多个角色，角色可以有多个权限。接口鉴权时先查用户角色，再查角色权限，最后判断当前资源是否允许。复杂系统还需要资源级权限，比如“只能管理自己创建的课程”，那是另一层。

角色不要直接存成用户表的一个字符串。一个用户可能需要“教师 + 审核员”两个角色，字符串无法表达组合。`,
          code: `CREATE TABLE roles (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text NOT NULL UNIQUE
);

CREATE TABLE role_permissions (
  role_id       bigint NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id bigint NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id bigint NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);`,
          output: `-- 用户和角色、角色和权限都是多对多
-- 权限编码稳定，展示名称另存`,
          tip: `权限编码一旦对外使用就不要改。改编码等于让所有旧 token、缓存和前端判断失效。`
        },
        {
          h: '资源级权限与越权检查',
          p: `“能写课程”不等于“能写任意课程”。教师只能改自己创建的课程，需要 [[courses.owner_id]] 或单独的授权表。查询时同时校验角色和资源归属，不能只查角色。

越权常见于详情接口：列表接口做了权限，详情接口忘了。所有按 ID 取资源的接口都要重新校验，不能假设“列表能看，详情就能看”。

把权限判断写成可测试的函数或 SQL，不要在控制器里复制十遍。权限失败返回 403，资源不存在返回 404，不要用 403 掩盖不存在，反之亦然，按产品安全策略统一。`,
          code: `SELECT c.id, c.title
FROM courses c
WHERE c.id = $1
  AND c.owner_id = $2
  AND EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = $2 AND p.code = 'course:write'
  );`,
          output: `-- 只有课程所有者且具备写权限时才返回
-- 否则查询为空，接口返回 403/404`,
          tip: `不要只在前端隐藏按钮。前端隐藏是体验，后端校验才是安全。`
        }
      ],
      points: ['RBAC 用用户、角色、权限和连接表', '权限编码稳定，角色可组合', '资源级权限要校验归属', '详情接口必须重新鉴权'],
      practice: '为课程社区设计 3 个角色、6 个权限，并写出“教师只能改自己的课程”的校验 SQL。'
    },
    {
      id: 'db-12-2',
      title: '12.2 订单、支付与状态机',
      minutes: 60,
      lead: '订单状态不是随便改的字符串。待支付、已支付、已退款、已关闭之间有合法迁移；支付回调可能重复、乱序、失败。数据库要能扛住这些。',
      source: '支付系统设计实践；PostgreSQL 事务',
      sections: [
        {
          h: '状态机：只允许合法迁移',
          p: `订单状态至少包括 [[pending]]、[[paid]]、[[refunded]]、[[closed]]。合法迁移：pending → paid → refunded；pending → closed；paid 不能回到 pending。状态字段用 [[CHECK]] 或字典表约束。

每次迁移都要记录 [[order_status_history]]：从什么状态、到什么状态、谁触发、外部流水号、时间。审计和排查退款争议都靠它。

支付回调必须幂等。同一个 [[provider_txn_id]] 重复到达时，只处理一次；用唯一约束或“已处理”记录挡住重复。回调乱序时，以支付平台的最终状态为准，不要盲信本地顺序。`,
          code: `CREATE TABLE orders (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      bigint NOT NULL REFERENCES users(id),
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'paid', 'refunded', 'closed')),
  total_cents  integer NOT NULL CHECK (total_cents >= 0),
  created_at   timestamptz NOT NULL DEFAULT now(),
  paid_at      timestamptz,
  closed_at    timestamptz
);

CREATE UNIQUE INDEX orders_provider_txn_unique
  ON orders (provider_txn_id)
  WHERE provider_txn_id IS NOT NULL;`,
          output: `-- 状态受 CHECK 约束；外部流水号唯一，挡住重复回调`,
          tip: `用 [[CHECK]] 约束状态时，每次新增状态都要迁移。状态经常变就用状态字典表 + 外键。`
        },
        {
          h: '金额、幂等与对账',
          p: `金额用整数分，订单总额 = 商品小计 + 税 + 运费 - 折扣，所有计算在数据库或应用层用整数完成。不要用浮点，也不要把“优惠后价格”只存在前端。

支付成功后的入账要在事务里完成：更新订单状态、写支付记录、写权益/报名记录。任何一步失败都回滚，避免“钱付了但课没开”。

对账是最后防线：每天用支付平台账单和本地 [[payments]] 比对，找出金额不一致、状态不一致、缺失流水。对账任务要可重跑、可告警。`,
          code: `BEGIN;

UPDATE orders
SET status = 'paid', paid_at = now(), provider_txn_id = $1
WHERE id = $2 AND status = 'pending';

INSERT INTO payments (order_id, provider, amount_cents, paid_at, raw_id)
VALUES ($2, 'stripe', $3, now(), $1);

INSERT INTO enrollments (user_id, course_id, status)
SELECT o.user_id, oi.course_id, 'active'
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.id = $2
ON CONFLICT (user_id, course_id) DO NOTHING;

COMMIT;`,
          output: `-- 状态、支付、报名在同一个事务里完成
-- 任一步失败全部回滚`,
          tip: `外部回调不要在数据库事务里做网络请求。先落库、再异步处理，避免长事务和超时。`
        }
      ],
      points: ['订单状态用状态机约束合法迁移', '状态历史表用于审计和争议排查', '支付回调必须幂等，外部流水号唯一', '入账、支付、权益在同一事务完成'],
      practice: '画一个订单状态机，写出 pending→paid 的事务 SQL，并说明如何挡住重复回调。'
    },
    {
      id: 'db-12-3',
      title: '12.3 软删除、审计与时间字段',
      minutes: 55,
      lead: '“删除”在业务里往往不是真的删。软删除保留历史，但也带来唯一约束、查询遗漏和权限问题；审计日志则回答“谁在什么时候改了什么”。',
      source: 'PostgreSQL 部分索引；审计日志实践',
      sections: [
        {
          h: '软删除的落法与坑',
          p: `软删除用 [[deleted_at timestamptz]]，查询默认加 [[deleted_at IS NULL]]。不要用 [[is_deleted boolean]] 再加一个删除时间，两个字段会不同步；一个时间字段既能判断又能排序。

坑一：唯一约束仍然占用。用户软删除后，同一邮箱不能重新注册；用部分唯一索引 [[WHERE deleted_at IS NULL]] 解决。坑二：所有查询都要记得过滤，漏一处就会把已删除数据带出来。可以用视图或 ORM 默认 scope，但要有逃生口。

物理删除适合日志、临时文件和合规要求删除的数据。核心业务记录通常软删除 + 归档，不是直接 DELETE。`,
          code: `ALTER TABLE courses ADD COLUMN deleted_at timestamptz;

CREATE UNIQUE INDEX courses_slug_active_unique
  ON courses (slug)
  WHERE deleted_at IS NULL;

SELECT id, title
FROM courses
WHERE deleted_at IS NULL AND published = true;`,
          output: `-- 软删除后 slug 可以重新使用
-- 查询默认排除已删除课程`,
          tip: `软删除不是“永不删除”。设置归档策略，否则表和索引会越来越大，查询越来越慢。`
        },
        {
          h: '审计日志与时间字段统一',
          p: `审计日志记录 [[actor_id]]、[[action]]、[[resource_type]]、[[resource_id]]、[[before]]、[[after]]、[[created_at]]。不要只记“更新了”，要记改了哪个字段、旧值新值是什么。

审计表只追加，不更新；权限上普通用户不可写。敏感字段（密码、token）不要进日志，或脱敏后存。审计日志本身也要备份和保留期限。

时间字段统一用 [[created_at]]、[[updated_at]]、[[deleted_at]]，全部 [[timestamptz]]。[[updated_at]] 由触发器或应用在每次写入时更新，不能靠数据库默认值自动变。`,
          code: `CREATE TABLE audit_logs (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id    bigint REFERENCES users(id) ON DELETE SET NULL,
  action      text NOT NULL,
  resource    text NOT NULL,
  resource_id text NOT NULL,
  before_data jsonb,
  after_data  jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_resource_idx
  ON audit_logs (resource, resource_id, created_at DESC);`,
          output: `-- 审计记录可按资源追溯
-- 操作者注销后置空，但日志保留`,
          tip: `[[updated_at]] 不会自动更新。PostgreSQL 没有内置“ON UPDATE”，要用触发器或应用层显式赋值。`
        }
      ],
      points: ['软删除用一个 deleted_at，不额外加布尔字段', '软删除与唯一约束冲突用部分唯一索引', '审计日志只追加，记录前后值', '时间字段统一 timestamptz，updated_at 显式维护'],
      practice: '为 courses 表加软删除，并写出部分唯一索引和默认查询；再设计一张审计日志表。'
    }
  ]
});

/* --- db-ch13.js --- */

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch13',
  part: 4,
  number: '13',
  title: '事务与一致性',
  summary: '事务把多条 SQL 绑成一个“全成功或全失败”的单元。它不是越大约好：边界太长会锁住资源，边界太短会让业务写到一半。',
  goals: ['解释 ACID 在业务里的含义', '正确写 BEGIN/COMMIT/ROLLBACK', '用保存点处理部分失败', '识别长事务与批量写入风险'],
  source: 'PostgreSQL 16 文档 · Transactions；数据库系统概念',
  lessons: [
    {
      id: 'db-13-1',
      title: '13.1 ACID 与事务边界',
      minutes: 55,
      lead: 'ACID 不是四个口号。原子性决定“支付和报名不能只成功一半”，一致性决定“约束不能被绕过”，隔离性决定“并发用户看到什么”，持久性决定“提交后断电还在不在”。',
      source: '数据库系统概念 · Transactions；PostgreSQL 16 文档',
      sections: [
        {
          h: '原子性、一致性、隔离性、持久性',
          p: `**原子性**：事务里的多条语句要么全提交，要么全回滚。支付成功但报名失败，用户钱扣了课没开，这就是原子性被破坏。

**一致性**：事务开始和结束时，数据库都满足约束。外键、唯一、CHECK 不会因为事务中途的临时状态被绕过；非法数据最终无法提交。

**隔离性**：并发事务互相看不见未提交的中间状态。隔离级别决定能看见多少，后面一章细讲。**持久性**：COMMIT 返回后，数据已经写进 WAL，崩溃恢复能找回；不是“还在内存里”。

事务边界应该包住一个完整的业务动作：下单、支付入账、报名、退款。不要把 HTTP 请求、发邮件、调用第三方支付放在事务里。`,
          code: `BEGIN;

UPDATE accounts SET balance_cents = balance_cents - 9900
WHERE id = 7 AND balance_cents >= 9900;

INSERT INTO enrollments (user_id, course_id, status)
VALUES (7, 1, 'active');

COMMIT;`,
          output: `-- 扣款与报名同一事务
-- 余额不足时 UPDATE 影响 0 行，应用应 ROLLBACK`,
          tip: `事务里不要做网络请求。第三方超时会让事务一直开着，锁住行，拖垮并发。`
        },
        {
          h: '边界太长和太短都危险',
          p: `边界太长：一个事务里查十张表、调用外部 API、生成 PDF、发邮件，可能持续几秒到几分钟。行锁不释放，其他请求排队，连接池被占满。

边界太短：先扣款提交，再报名提交。中间失败就出现“钱扣了课没开”。补偿逻辑能救，但不如一个正确的事务边界。

正确做法：事务只包数据库写入和必要的校验；外部副作用用 outbox/消息队列，在事务提交后异步执行。`,
          code: `-- 推荐：事务只写库，事件落 outbox
BEGIN;
UPDATE orders SET status = 'paid' WHERE id = $1 AND status = 'pending';
INSERT INTO outbox (topic, payload)
VALUES ('order.paid', jsonb_build_object('order_id', $1));
COMMIT;

-- 后台 worker 读取 outbox，发邮件、开课、通知
-- 失败可重试，不阻塞下单事务`,
          output: `-- 事务短、可预测；外部副作用最终一致`,
          tip: `[[outbox]] 表要有唯一事件 ID 和重试状态，否则 worker 重复消费会造成重复发邮件。`
        }
      ],
      points: ['ACID 分别对应原子、约束、隔离和持久', '事务边界包住一个完整业务动作', '不要在事务里做网络请求', '外部副作用用 outbox/队列异步化'],
      practice: '写出“扣余额 + 报名”的事务 SQL，并说明余额不足时如何回滚。'
    },
    {
      id: 'db-13-2',
      title: '13.2 BEGIN、COMMIT、ROLLBACK 与保存点',
      minutes: 50,
      lead: '事务控制语句看起来只有三个，实际使用时有隐式提交、保存点和异常处理三个坑。写错一个，回滚可能没生效。',
      source: 'PostgreSQL 16 文档 · Transaction Control',
      sections: [
        {
          h: '显式事务的三段式',
          p: `[[BEGIN]] 开启事务，[[COMMIT]] 提交，[[ROLLBACK]] 回滚。PostgreSQL 默认自动提交：没有 BEGIN 时，每条语句自己是一个事务。

在应用代码里，事务通常由框架管理：Spring 的 [[@Transactional]]、SQLAlchemy 的 [[session.begin()]]。不要手动在 ORM 里再包一层，容易嵌套错。

某些语句会隐式提交：DDL（CREATE/ALTER/DROP）在多数数据库里不能回滚；PostgreSQL 的 DDL 可以事务化，但跨库行为不同。迁移脚本要单独评估。`,
          code: `BEGIN;
UPDATE orders SET status = 'paid' WHERE id = 42;
-- 发现金额不对
ROLLBACK;

-- 重新执行正确逻辑
BEGIN;
UPDATE orders SET status = 'paid', total_cents = 9900 WHERE id = 42;
COMMIT;`,
          output: `-- ROLLBACK 后第一次更新不生效
-- 第二次事务重新写入`,
          tip: `[[ROLLBACK]] 之后事务结束，必须重新 [[BEGIN]] 才能继续。不要在回滚后直接发下一条业务 SQL。`
        },
        {
          h: '保存点：部分失败但不全丢',
          p: `[[SAVEPOINT sp1]] 在事务里打一个标记；[[ROLLBACK TO SAVEPOINT sp1]] 只回滚到标记之后，之前的工作保留。适合“批量导入，某一行失败但继续其他行”的场景。

保存点不是免费：每个保存点都要维护状态，嵌套太多会变慢。大多数业务用“整事务回滚 + 应用重试”更简单。

异常处理里要确保事务被回滚或提交，不要让异常路径漏掉。连接归还连接池前，框架通常会清理未完成事务；但不要依赖它。`,
          code: `BEGIN;
INSERT INTO courses (slug, title) VALUES ('a', '课程 A');

SAVEPOINT before_b;
INSERT INTO courses (slug, title) VALUES ('b', '课程 B');
-- 假设 B 违反唯一约束
ROLLBACK TO SAVEPOINT before_b;

INSERT INTO courses (slug, title) VALUES ('c', '课程 C');
COMMIT;`,
          output: `-- A 和 C 保留，B 被回滚
-- 整个事务仍然提交`,
          tip: `保存点回滚后，之前的锁和写入仍在事务里；它不是“独立事务”，不能跨连接。`
        }
      ],
      points: ['BEGIN/COMMIT/ROLLBACK 是最小三段式', 'PostgreSQL 默认自动提交', '保存点用于部分回滚，不是独立事务', '异常路径必须确保事务结束'],
      practice: '用保存点写一个批量插入：前两行成功，第三行冲突被回滚，最后提交前两行。'
    },
    {
      id: 'db-13-3',
      title: '13.3 长事务、批量写入与锁等待',
      minutes: 55,
      lead: '一个事务开十分钟，可能锁住一行、拖慢整个接口。批量写入不是“循环 INSERT”这么简单，分批、排序和超时设置都会影响稳定性。',
      source: 'PostgreSQL 16 文档 · Transaction Management；生产实践',
      sections: [
        {
          h: '长事务为什么危险',
          p: `长事务持有锁，其他事务等锁；它还会阻止 vacuum 清理旧版本，导致表膨胀。一个报表查询如果开了事务却迟迟不提交，可能让整个库的清理滞后。

监控 [[pg_stat_activity]] 的 [[state]]、[[xact_start]]、[[query_start]]，找出超过阈值的事务。设置 [[idle_in_transaction_session_timeout]]，让“开了事务却不干活”的连接自动断开。

业务上避免“用户打开页面就开事务，填完表单再提交”。事务应该在服务端写入时开启，而不是跟随用户交互。`,
          code: `SELECT pid, state, xact_start, query_start, left(query, 80) AS query
FROM pg_stat_activity
WHERE datname = current_database()
  AND xact_start IS NOT NULL
ORDER BY xact_start;`,
          output: `-- 找出开了事务但很久没结束的会话
-- 重点关注 idle in transaction 状态`,
          tip: `[[idle_in_transaction_session_timeout]] 是兜底，不是设计目标。先修业务事务边界。`
        },
        {
          h: '批量写入：分批、排序、控制并发',
          p: `循环单条 INSERT 会产生大量往返和 WAL。用 [[INSERT ... SELECT]] 或 [[COPY]] 批量导入；应用层批量插入每批 500–2000 行，按主键或时间排序，减少随机页写入。

批量更新大表时，一次改百万行会长时间锁表。拆成小批，每批提交，记录进度；失败可重试，不丢已完成的批次。

并发写入同一行会排队。把热点行拆开（分片计数）、用队列串行化、或减少事务持有时间；不要靠加大连接池解决锁竞争。`,
          code: `-- 分批更新，每批 1000 行
WITH batch AS (
  SELECT id FROM orders
  WHERE status = 'pending' AND created_at < now() - interval '30 minutes'
  ORDER BY id
  LIMIT 1000
)
UPDATE orders o
SET status = 'closed', closed_at = now()
FROM batch b
WHERE o.id = b.id
RETURNING o.id;`,
          output: `-- 一次只锁 1000 行，提交后继续下一批
-- 避免百万行大事务`,
          tip: `批次大小要压测。太小往返多，太大锁久；1000 行是常见起点，不是固定答案。`
        }
      ],
      points: ['长事务持锁并阻碍 vacuum', '监控 pg_stat_activity 找长事务', '批量写入分批提交，控制每批行数', '锁竞争不能靠加大连接池解决'],
      practice: '把一次 10 万行的订单关闭改成分批 SQL，并写出如何记录已处理批次。'
    }
  ]
});

/* --- db-ch14.js --- */

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch14',
  part: 4,
  number: '14',
  title: '隔离级别、MVCC 与锁',
  summary: '并发事务互相看不见多少，由隔离级别决定；看见的是快照还是最新值，由 MVCC 决定；改同一行时谁等谁，由锁决定。这三层共同决定“并发下数据对不对”。',
  goals: ['区分脏读、不可重复读、幻读', '理解 PostgreSQL 的默认隔离级别', '解释 MVCC 快照与版本链', '识别死锁并设计重试'],
  source: 'PostgreSQL 16 文档 · Transaction Isolation、Explicit Locking',
  lessons: [
    {
      id: 'db-14-1',
      title: '14.1 隔离级别与三类异常',
      minutes: 55,
      lead: '隔离级别不是越高越好。越高越接近串行，冲突和重试也越多。先认清三类异常，再选够用的级别。',
      source: 'PostgreSQL 16 文档 · Transaction Isolation',
      sections: [
        {
          h: '脏读、不可重复读、幻读',
          p: `**脏读**：读到另一个事务未提交的数据。PostgreSQL 任何隔离级别都不会发生脏读。**不可重复读**：同一事务内两次读同一行，结果不同，因为别人提交了更新。**幻读**：同一事务内两次查同一范围，第二次多出/少了行。

SQL 标准四种级别：Read Uncommitted、Read Committed、Repeatable Read、Serializable。PostgreSQL 实际把 Read Uncommitted 当 Read Committed 处理；默认是 Read Committed。

Read Committed 下每条语句拿新快照，能看见语句开始前已提交的数据；Repeatable Read 整个事务一个快照，看不见事务开始后的提交；Serializable 还会检测写偏斜，冲突时要求重试。`,
          code: `-- 查看当前隔离级别
SHOW transaction_isolation;

-- 开启一个可重复读事务
BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT COUNT(*) FROM enrollments WHERE course_id = 1;
-- 另一个事务插入新报名并提交
SELECT COUNT(*) FROM enrollments WHERE course_id = 1; -- 仍然是旧快照
COMMIT;`,
          output: `-- REPEATABLE READ 下两次 COUNT 结果一致
-- 代价是可能看不到最新数据，冲突时要重试`,
          tip: `隔离级别是事务级设置。不要全局改成 Serializable 就以为万事大吉，冲突会变成大量重试。`
        },
        {
          h: '写偏斜与 Serializable',
          p: `两个事务各自检查“还有空位”，都以为有，然后都插入，最后超卖。这不是简单的读锁能解决，叫**写偏斜**。Serializable 会检测危险结构，让其中一个事务失败。

PostgreSQL 的 Serializable 使用 SSI（Serializable Snapshot Isolation），不是全程加锁。失败时返回 [[40001]] serialization_failure，应用要重试整个事务。

重试要有上限和退避，不能无限循环。事务里不能有不可重复的外部副作用，否则重试会重复发邮件/扣款。`,
          code: `-- 应用层伪代码
for attempt in 1..3:
  try:
    BEGIN ISOLATION LEVEL SERIALIZABLE
    check_capacity()
    insert_booking()
    COMMIT
    break
  catch serialization_failure:
    ROLLBACK
    sleep(backoff(attempt))`,
          output: `-- 冲突时重试整个事务
-- 超过 3 次返回“请稍后再试”`,
          tip: `Serializable 不是免费的。高并发写入场景先评估冲突率，别把重试当常态。`
        }
      ],
      points: ['PostgreSQL 不会脏读', 'Read Committed 每条语句新快照', 'Repeatable Read 整个事务一个快照', 'Serializable 检测写偏斜，失败要重试'],
      practice: '用两个 psql 会话演示 Read Committed 下的不可重复读，再切到 Repeatable Read 对比。'
    },
    {
      id: 'db-14-2',
      title: '14.2 MVCC、快照与版本链',
      minutes: 55,
      lead: 'PostgreSQL 为什么读不阻塞写？因为每行有多个版本，读事务看自己的快照，写事务创建新版本。理解 MVCC，才能理解膨胀、VACUUM 和“为什么删了行磁盘没变小”。',
      source: 'PostgreSQL 16 文档 · Concurrency Control、VACUUM',
      sections: [
        {
          h: '每行有 xmin/xmax，快照决定可见性',
          p: `PostgreSQL 的行头记录 [[xmin]]（创建事务 ID）和 [[xmax]]（删除事务 ID）。事务开始时拿一个快照，只能看见“在我开始前已提交”的版本。更新不是改原行，而是写一个新版本，把旧版本标记为过期。

读不阻塞写，写也不阻塞读；但两个写同一行会互相等锁。旧版本在被所有快照忽略之前不能删，VACUUM 负责清理。

长事务会持有旧快照，让旧版本一直不能被清理，表就膨胀。这就是上一章强调“不要开长事务”的底层原因。`,
          code: `-- 查看表的死元组与活元组
SELECT relname, n_live_tup, n_dead_tup, last_vacuum
FROM pg_stat_user_tables
WHERE relname = 'enrollments';

-- 手动清理（生产慎用，优先自动 vacuum）
VACUUM (VERBOSE, ANALYZE) enrollments;`,
          output: `-- n_dead_tup 高说明旧版本堆积
-- VACUUM 回收可清理的空间，但不一定缩小文件`,
          tip: `VACUUM 不会把文件缩回磁盘，它只是把空间标记为可复用。要缩文件用 [[VACUUM FULL]]，但会锁表。`
        },
        {
          h: '快照隔离下的一致读',
          p: `一个事务里多次查询，Read Committed 每条语句可能看到不同提交；Repeatable Read 用同一个快照，看到一致的时间点。报表需要“同一时刻”的多个表数据时，Repeatable Read 更合适。

快照隔离不能完全替代串行化。它防止不可重复读和幻读（PostgreSQL Repeatable Read 实际防幻读），但仍有写偏斜。需要强串行语义时用 Serializable。

备份和只读副本也依赖快照。pg_dump 在一个一致快照上工作，避免备份过程中数据变化导致不一致。`,
          code: `BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM payments;
-- 两个查询看到同一事务快照
COMMIT;`,
          output: `-- 适合生成一致性报表
-- 不适合需要最新数据的实时大屏`,
          tip: `一致性读会看到“旧但一致”的数据。产品要明确能接受多少延迟，别把报表快照当实时。`
        }
      ],
      points: ['MVCC 用多版本支持读写不阻塞', '长事务阻止旧版本清理，导致膨胀', 'VACUUM 回收空间但不缩文件', 'Repeatable Read 提供事务级一致快照'],
      practice: '查一张表的 n_live_tup 与 n_dead_tup，解释死元组从哪里来、VACUUM 做什么。'
    },
    {
      id: 'db-14-3',
      title: '14.3 行锁、死锁与重试',
      minutes: 60,
      lead: '两个事务各锁一行、再等对方那一行，就死锁。数据库会检测并杀掉一个，但应用要能识别、重试，并避免再次死锁。',
      source: 'PostgreSQL 16 文档 · Explicit Locking、Deadlocks',
      sections: [
        {
          h: '行锁、表锁与 FOR UPDATE',
          p: `[[UPDATE]]/[[DELETE]] 会自动加行锁。[[SELECT ... FOR UPDATE]] 手动锁住将要修改的行，防止别人在你读和写之间改掉。[[FOR NO KEY UPDATE]] 锁较弱，不阻塞外键检查；[[FOR SHARE]] 允许别人读但不允许改。

锁的粒度越大，并发越差。不要一上来 [[LOCK TABLE]]；按主键锁行，按固定顺序加锁，能显著降低死锁。

[[NOWAIT]] 让锁不到就立刻失败，[[SKIP LOCKED]] 跳过已锁行，适合队列消费。`,
          code: `BEGIN;
SELECT id, balance_cents
FROM accounts
WHERE id = 7
FOR UPDATE;

UPDATE accounts SET balance_cents = balance_cents - 9900 WHERE id = 7;
COMMIT;`,
          output: `-- 从读到改，行一直被锁
-- 其他事务改同一行会等待`,
          tip: `[[FOR UPDATE]] 要放在事务里。事务外执行，锁随语句结束释放，起不到保护作用。`
        },
        {
          h: '死锁检测与固定加锁顺序',
          p: `事务 A 锁账户 1 再锁 2，事务 B 锁 2 再锁 1，互相等待就死锁。PostgreSQL 检测到后杀掉一个事务，返回 [[40P01]] deadlock_detected。

预防比检测更重要：所有事务按同一顺序加锁（比如按主键升序）；缩短持锁时间；避免在事务里等待用户输入或网络。

应用捕获死锁后可以重试整个事务，但要确保幂等。重试次数有限，并加随机退避，避免再次撞车。`,
          code: `-- 转账：固定按 id 升序锁两行
BEGIN;
SELECT id FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE;
UPDATE accounts SET balance_cents = balance_cents - 100 WHERE id = 1;
UPDATE accounts SET balance_cents = balance_cents + 100 WHERE id = 2;
COMMIT;`,
          output: `-- 所有转账都按 id 顺序锁，避免交叉等待`,
          tip: `固定顺序要覆盖所有写路径。只要有一个接口反着锁，死锁仍会发生。`
        }
      ],
      points: ['UPDATE/DELETE 自动加行锁', 'FOR UPDATE 锁住将要修改的行', '固定加锁顺序能预防死锁', '死锁要重试整个事务，且保证幂等'],
      practice: '写一个转账事务，按 id 升序锁两行；再写反序版本，解释为什么可能死锁。'
    }
  ]
});

/* --- db-ch15.js --- */

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch15',
  part: 4,
  number: '15',
  title: 'B+Tree 与索引设计',
  summary: '索引不是“给列加个快捷键”。它是一棵有序结构，让数据库少扫行；但每一行写入都要维护索引，索引选错会拖慢写入、占满磁盘。',
  goals: ['解释 B+Tree 为什么适合范围查询', '区分主键、唯一、联合与覆盖索引', '用最左前缀设计联合索引', '评估选择性与写入成本'],
  source: 'Use The Index, Luke；PostgreSQL 16 文档 · Indexes',
  lessons: [
    {
      id: 'db-15-1',
      title: '15.1 B+Tree：有序、分层、范围友好',
      minutes: 55,
      lead: '为什么数据库不直接建哈希表？因为业务不只需要等值查询，还要范围、排序和前缀匹配。B+Tree 用有序叶子节点同时支持这三类。',
      source: 'Use The Index, Luke · B-tree；数据库系统概念',
      sections: [
        {
          h: '一棵矮胖的树，叶子串成链表',
          p: `B+Tree 的根节点指向多个子节点，内部节点只存键和指针，叶子节点存键和行指针。所有叶子在同一层，并用链表相连；范围查询找到起点后，沿着叶子链表顺序扫。

高度通常是 3–4 层，一次查询只需几次页读取，而不是全表扫。等值查询走根到叶子，范围查询走到起点再顺序扫，排序也能直接利用叶子顺序。

PostgreSQL 默认索引就是 B-tree。它支持 [[=]]、[[<]]、[[<=]]、[[>]]、[[>=]]、[[BETWEEN]]、前缀 [[LIKE 'abc%']]，不支持后缀 [[LIKE '%abc']] 的快速定位。`,
          code: `CREATE INDEX courses_published_created_idx
  ON courses (published, created_at DESC);

-- 可走索引：等值 + 范围
SELECT id, title
FROM courses
WHERE published = true
  AND created_at >= timestamptz '2026-11-01';`,
          output: `-- 先按 published 等值定位，再按 created_at 范围扫描`,
          tip: `B-tree 不擅长 [[LIKE '%关键词%']]。这种搜索用全文索引或 trigram，不要硬加 B-tree。`
        },
        {
          h: '聚簇索引与回表',
          p: `PostgreSQL 的表是堆表，索引叶子存的是行指针（ctid），不是整行；查到索引后还要回表取其他列。若索引已包含查询需要的所有列，就不用回表，叫**覆盖索引**。

InnoDB 的主键是聚簇索引，叶子存整行；二级索引叶子存主键，再回主键查。两种引擎的回表方式不同，但“索引列不够就要再取行”的道理一样。

[[CREATE INDEX ... INCLUDE (col)]] 可以把非搜索列附在索引叶子上，形成覆盖索引。INCLUDE 列不参与排序和唯一判断，只用于减少回表。`,
          code: `CREATE INDEX courses_cover_idx
  ON courses (published, created_at DESC)
  INCLUDE (title, slug);

SELECT id, title, slug
FROM courses
WHERE published = true
ORDER BY created_at DESC
LIMIT 20;`,
          output: `-- 索引本身包含 title/slug，可能无需回表
-- 代价是索引更大、写入更慢`,
          tip: `覆盖索引不是免费缓存。INCLUDE 列越多，索引越大，更新成本越高；只覆盖高频查询。`
        }
      ],
      points: ['B+Tree 叶子有序且链表相连，适合范围与排序', 'PostgreSQL 索引叶子存行指针，可能需要回表', '覆盖索引用 INCLUDE 减少回表', 'B-tree 不适合中缀模糊搜索'],
      practice: '为“已发布课程按时间倒序取 20 条”设计一个联合索引，并判断是否需要 INCLUDE title。'
    },
    {
      id: 'db-15-2',
      title: '15.2 主键、唯一、联合与部分索引',
      minutes: 55,
      lead: '索引有很多种，但业务最常用的是四类：主键、唯一、联合、部分。选错类型，查询用不上；建得太多，写入变慢。',
      source: 'PostgreSQL 16 文档 · Index Types；Use The Index, Luke',
      sections: [
        {
          h: '唯一索引与普通索引的差别',
          p: `主键和 [[UNIQUE]] 会自动创建唯一索引，既保证唯一又加速查询。普通索引只加速，不保证唯一。唯一索引插入时要检查重复，写入成本略高。

联合索引 [[(user_id, course_id)]] 的列顺序决定用途。最左前缀 [[user_id]] 能单独用；[[course_id]] 单独查用不上。设计时先列高频查询，再排顺序。

部分索引只索引满足条件的行，比如 [[WHERE deleted_at IS NULL]]。它更小、更快，但查询条件必须匹配，否则优化器用不上。`,
          code: `-- 联合唯一：同一用户同一课程只能一次
CREATE UNIQUE INDEX enrollments_user_course_unique
  ON enrollments (user_id, course_id);

-- 部分索引：只索引未删除课程
CREATE INDEX courses_active_idx
  ON courses (published, created_at DESC)
  WHERE deleted_at IS NULL;`,
          output: `-- 唯一索引保证业务唯一
-- 部分索引只覆盖活跃数据，体积更小`,
          tip: `联合索引 [[(a, b)]] 不能替代 [[(b)]]。最左前缀是硬规则，不是优化器随意发挥。`
        },
        {
          h: '哈希、GIN、GiST 的适用边界',
          p: `[[USING hash]] 只支持等值查询，不支持范围/排序；比 B-tree 省一点空间，但用途窄。[[GIN]] 适合数组、JSONB、全文检索的多值包含查询。[[GiST]] 适合地理、范围类型和相似度。

不要默认所有索引都用 B-tree。先看查询模式：等值和范围用 B-tree；JSONB 包含用 GIN；地理位置用 GiST；全文搜索用 GIN/tsvector。

索引类型选错，查询计划不会用它，白占磁盘。建索引前先写 [[EXPLAIN]]，建完再 EXPLAIN 对比。`,
          code: `CREATE INDEX posts_search_idx
  ON posts USING gin (to_tsvector('simple', title || ' ' || body));

SELECT id, title
FROM posts
WHERE to_tsvector('simple', title || ' ' || body)
      @@ plainto_tsquery('simple', '索引 优化');`,
          output: `-- GIN 加速全文检索
-- 普通 B-tree 无法处理这种包含查询`,
          tip: `表达式索引的表达式必须和查询完全一致，包括函数参数和拼接顺序，否则用不上。`
        }
      ],
      points: ['主键/UNIQUE 自动建唯一索引', '联合索引按最左前缀生效', '部分索引更小，但查询条件要匹配', 'GIN/GiST 按数据类型选，不默认 B-tree'],
      practice: '为“未删除、已发布、按时间倒序”的课程列表设计一个部分联合索引，并写出匹配查询。'
    },
    {
      id: 'db-15-3',
      title: '15.3 选择性与写入成本',
      minutes: 55,
      lead: '不是所有列都值得建索引。一个只有 0/1 的列，索引可能比全表扫更慢；一个高频更新的列，索引维护会让写入变慢。',
      source: 'Use The Index, Luke · Selectivity；PostgreSQL 16 文档',
      sections: [
        {
          h: '选择性：索引能过滤掉多少行',
          p: `选择性 = 不同值数量 / 总行数。用户 ID 几乎唯一，选择性高，索引很有效；状态列只有几个值，选择性低，索引可能没用。

但低选择性列放在联合索引前面也不是全无价值：如果业务总是按 [[status = 'active' AND created_at > ...]] 查，联合索引 [[(status, created_at)]] 仍能先缩小范围。单独给 status 建索引通常不值得。

数据分布会变。新业务让 [[status]] 从 99% active 变成 50/50，原计划可能变；统计信息和业务监控要跟上。`,
          code: `-- 查看列的选择性
SELECT COUNT(DISTINCT status) AS distinct_status,
       COUNT(*) AS total_rows,
       COUNT(DISTINCT status)::numeric / COUNT(*) AS selectivity
FROM orders;`,
          output: `-- 只有 4 个状态、百万行时，单列 status 选择性很低`,
          tip: `选择性低不等于索引一定没用。要看查询模式，不要只看不同值数量。`
        },
        {
          h: '索引维护成本与“索引税”',
          p: `每个索引都要在 INSERT/UPDATE/DELETE 时维护。写多读少的表，索引越多写入越慢，WAL 也越大。一般单表索引控制在 5–8 个以内，按真实查询取舍。

重复索引是常见浪费：[[(user_id)]] 和 [[(user_id, course_id)]] 同时存在，前者可被后者最左前缀覆盖，可以删。但删除前确认没有唯一性或特殊用途。

监控索引使用：[[pg_stat_user_indexes]] 的 [[idx_scan]] 长期为 0，说明可能没被用过。不要立刻删，先观察完整业务周期（含月末报表）。`,
          code: `SELECT relname, indexrelname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE relname = 'enrollments'
ORDER BY idx_scan;`,
          output: `-- idx_scan 为 0 的索引可能从未被查询使用
-- 结合业务周期判断，不盲目删除`,
          tip: `[[idx_scan]] 统计会重置，也会受实例重启影响。看趋势，不要看单次快照。`
        }
      ],
      points: ['选择性 = 不同值 / 总行数', '低选择性单列索引通常收益低', '每个索引都有写入维护成本', '用 pg_stat_user_indexes 找未使用索引'],
      practice: '对 enrollments 表的 5 个索引做一次审计：哪些重复、哪些从未使用、哪些该保留。'
    }
  ]
});

/* --- db-ch16.js --- */

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch16',
  part: 4,
  number: '16',
  title: '执行计划与慢查询优化',
  summary: 'EXPLAIN 不是看一眼就完。要看扫描方式、行数估计、连接算法、实际耗时和缓冲区命中。慢查询优化是证据驱动的，不是“多加索引”。',
  goals: ['读懂 EXPLAIN 与 EXPLAIN ANALYZE', '识别 Seq Scan、Nested Loop、Hash Join', '判断索引失效与统计信息问题', '按证据优化一条慢查询'],
  source: 'PostgreSQL 16 文档 · EXPLAIN；Use The Index, Luke',
  lessons: [
    {
      id: 'db-16-1',
      title: '16.1 EXPLAIN 与 EXPLAIN ANALYZE',
      minutes: 60,
      lead: 'EXPLAIN 给你计划，EXPLAIN ANALYZE 才真正执行并给出实际行数与耗时。只看估算会误判，只看总耗时又不知道慢在哪一层。',
      source: 'PostgreSQL 16 文档 · Using EXPLAIN',
      sections: [
        {
          h: '计划树从下往上读',
          p: `EXPLAIN 输出是一棵树，缩进表示父子关系。最内层先执行，结果向上传递。每个节点有 [[cost]]、[[rows]]、[[width]]；[[actual time]]、[[actual rows]]、[[loops]] 只有 ANALYZE 才有。

重点看 [[actual rows]] 和估算 [[rows]] 差多少。差一个数量级，说明统计信息或连接基数估计有问题；不是简单加索引能解决。

[[Buffers]] 显示 shared hit/read：命中内存还是读磁盘。[[Planning Time]] 和 [[Execution Time]] 分开，规划慢和执行的优化方向不同。`,
          code: `EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT c.id, c.title, COUNT(e.id) AS enrollments
FROM courses c
LEFT JOIN enrollments e ON e.course_id = c.id
WHERE c.published = true
GROUP BY c.id, c.title
ORDER BY enrollments DESC;`,
          output: `-- 计划树会显示扫描、连接、聚合、排序各自的实际时间
-- 关注 actual rows 与 rows 的偏差、Buffers read 是否很高`,
          tip: `[[EXPLAIN ANALYZE]] 会真正执行写语句。UPDATE/DELETE 要放在事务里并回滚，避免误改数据。`
        },
        {
          h: '成本不是时间，行数不是真相',
          p: `[[cost]] 是优化器的估算单位，不是毫秒；它用顺序页读取成本为基准。不要拿 cost 直接和实际时间比较。

[[rows]] 是估算行数，受统计信息影响。表刚大量写入、没跑 [[ANALYZE]]，估算可能离谱，计划也会选错。定期自动 analyze 通常够用，大批量导入后手动跑一次。

[[loops]] 表示该节点被执行多少次。Nested Loop 的内层节点 loops 很大，总时间 = 单次时间 × loops；看平均值会低估。`,
          code: `ANALYZE enrollments;

EXPLAIN (ANALYZE, BUFFERS)
SELECT *
FROM enrollments
WHERE user_id = 42;`,
          output: `-- ANALYZE 更新统计信息后再看计划
-- 单用户查询应走 user_id 索引，而不是全表扫`,
          tip: `[[SELECT *]] 会让 EXPLAIN 的 width 变大，也可能阻止覆盖索引。测试时用真实查询列。`
        }
      ],
      points: ['EXPLAIN 估算，EXPLAIN ANALYZE 实际执行', '计划树从下往上读，关注 rows 偏差', 'cost 是估算单位，不是毫秒', 'loops 大时看总时间，不只看单次'],
      practice: '对一条课程报名报表跑 EXPLAIN (ANALYZE, BUFFERS)，写下最慢节点和实际行数。'
    },
    {
      id: 'db-16-2',
      title: '16.2 扫描方式、连接算法与代价',
      minutes: 60,
      lead: '数据库选择 Seq Scan 还是 Index Scan，Nested Loop 还是 Hash Join，不是随机的。每种算法都有适用数据量和排序条件。',
      source: 'PostgreSQL 16 文档 · Query Planner；数据库系统概念',
      sections: [
        {
          h: '三种扫描：全表、索引、仅索引',
          p: `[[Seq Scan]] 顺序扫全表，适合小表或需要大部分行；[[Index Scan]] 通过索引定位行再回表，适合过滤性强的查询；[[Index Only Scan]] 只读索引，不下表，前提是索引包含所有列且可见性映射干净。

[[Bitmap Index Scan]] 先收集匹配行位图，再批量回表，适合中等选择性、多条件 OR。它比逐行 Index Scan 减少随机 I/O，但不如纯顺序扫快。

全表扫不一定坏。表只有 1000 行，全表扫可能比索引更快；优化器会选择，不要看 Seq Scan 就加索引。`,
          code: `-- 过滤性强的查询：期望 Index Scan
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, title FROM courses WHERE slug = 'sql-basics';

-- 取大部分行：Seq Scan 可能更便宜
EXPLAIN (ANALYZE, BUFFERS)
SELECT id, title FROM courses WHERE published = true;`,
          output: `-- slug 唯一，Index Scan 一次定位
-- published 为 true 占多数时，Seq Scan 可能是最优`,
          tip: `[[Index Only Scan]] 需要 [[VACUUM]] 维护可见性映射，否则仍会回表。`
        },
        {
          h: 'Nested Loop、Hash Join、Merge Join',
          p: `[[Nested Loop]] 对外层每一行，扫内层匹配行；适合小表驱动大表、内层有索引。外层大、内层无索引时会爆炸。

[[Hash Join]] 把较小表建哈希表，再扫另一表探测；适合等值连接、无排序需求、内存足够。[[Merge Join]] 要求两边按连接键有序，适合已有索引或需要排序输出。

连接算法由优化器按行数、选择率、内存选择。你能做的是让连接键有索引、统计信息准确、过滤条件下推。`,
          code: `EXPLAIN (ANALYZE, BUFFERS)
SELECT c.title, COUNT(e.id)
FROM courses c
JOIN enrollments e ON e.course_id = c.id
WHERE c.published = true
GROUP BY c.title;`,
          output: `-- 小 courses 驱动大 enrollments 时可能 Nested Loop
-- 大表连接且内存足够时可能 Hash Join`,
          tip: `不要用“一定要 Hash Join”指导优化。算法是结果，不是目标；目标是最低实际耗时。`
        }
      ],
      points: ['Seq Scan 适合小表或大部分行', 'Index Scan 适合高选择性过滤', 'Nested Loop 适合小表驱动 + 内层索引', 'Hash/Merge Join 适合大表等值连接'],
      practice: '对同一条 JOIN 查询分别加/不加连接索引发 EXPLAIN，记录算法和实际时间变化。'
    },
    {
      id: 'db-16-3',
      title: '16.3 慢查询定位与索引失效',
      minutes: 60,
      lead: '慢查询优化要先定位，不是先加索引。看 pg_stat_statements、实际计划、行数偏差、锁等待和 I/O，再决定改 SQL、加索引还是改架构。',
      source: 'PostgreSQL 16 文档 · pg_stat_statements；生产实践',
      sections: [
        {
          h: '先找最慢的语句，而不是最长的 SQL',
          p: `[[pg_stat_statements]] 按总耗时、平均耗时、调用次数排序，找出真正消耗数据库的语句。一条 10ms 的查询调用百万次，比一条 2s 的报表更值得优化。

看 [[total_exec_time]]、[[mean_exec_time]]、[[calls]]、[[rows]]。总时间高且调用多，优先优化；单次高但调用少，可能是报表，移到只读副本。

慢查询日志设置 [[log_min_duration_statement]]，只记录超过阈值的语句；不要全量记录，日志本身会拖慢。`,
          code: `SELECT queryid, calls, mean_exec_time, total_exec_time,
       left(query, 80) AS query
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 10;`,
          output: `-- 按总执行时间排序，找真正的热点
-- 结合 calls 判断是高频小查询还是低频大查询`,
          tip: `[[pg_stat_statements]] 需要 [[shared_preload_libraries]] 配置并重启。没装就先开慢查询日志。`
        },
        {
          h: '索引失效的五个常见原因',
          p: `第一，列上套函数或运算：[[WHERE lower(email) = ...]] 用不上普通 email 索引。第二，隐式类型转换：字符串和数字比较可能让索引失效。第三，前导模糊：[[LIKE '%abc']] 用不上 B-tree。第四，联合索引不满足最左前缀。第五，统计信息过期或数据分布极端，优化器主动选择全表扫。

不是所有“没走索引”都是错。取大部分行时全表扫更快；关键是实际耗时，不是索引崇拜。

优化顺序：改 SQL 形状 → 补统计信息 → 建合适索引 → 调整连接/聚合 → 分页/缓存/只读副本。每一步都用 EXPLAIN 验证。`,
          code: `-- 失效：对列套 lower()
SELECT id FROM users WHERE lower(email) = 'a@example.com';

-- 改写：存规范化列，或建表达式索引
CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email));

SELECT id FROM users WHERE lower(email) = 'a@example.com';`,
          output: `-- 表达式索引与查询表达式完全匹配，可以走索引`,
          tip: `表达式索引要求查询写法完全一致。[[lower(email)]] 和 [[email::text]] 不是同一个表达式。`
        }
      ],
      points: ['用 pg_stat_statements 找总耗时热点', '高频小查询可能比低频大查询更值得优化', '索引失效常见于函数、类型转换、前导模糊', '优化顺序先 SQL 后索引，再架构'],
      practice: '用 pg_stat_statements 找一条高总耗时 SQL，跑 EXPLAIN，写出一条具体优化方案。'
    }
  ]
});

/* --- db-ch17.js --- */

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch17',
  part: 5,
  number: '17',
  title: '应用数据库工程',
  summary: '数据库不只被 DBA 使用，它被后端代码每天调用。ORM 怎么用、迁移怎么管、连接池开多大，决定服务在真实流量下是稳还是崩。',
  goals: ['划清 ORM 与原生 SQL 的边界', '用迁移管理表结构变化', '配置连接池与超时', '识别并修复 N+1 查询'],
  source: 'Spring Data JPA、SQLAlchemy、Prisma 文档；HikariCP 实践',
  lessons: [
    {
      id: 'db-17-1',
      title: '17.1 ORM 与原生 SQL 的边界',
      minutes: 55,
      lead: 'ORM 让 CRUD 更快，但不是所有查询都适合 ORM。简单单表用 ORM，多表报表和复杂聚合用 SQL；混着用，关键是知道每条查询生成什么。',
      source: 'Spring Data JPA、SQLAlchemy、Prisma 官方文档',
      sections: [
        {
          h: 'ORM 擅长什么，不擅长什么',
          p: `ORM 擅长：按主键取实体、简单条件查询、关系加载、事务包裹、参数绑定。它把表映射成对象，减少重复 CRUD。

ORM 不擅长：多表窗口函数、复杂报表、批量更新、数据库特有语法。强行用 Criteria/QueryBuilder 拼复杂 SQL，可读性和性能都可能更差。

无论用哪种 ORM，都要能打开 SQL 日志，看到实际生成的语句。N+1、笛卡尔积、隐式全表扫，往往藏在“一个方法调用”后面。`,
          code: `-- JPA：简单查询交给 Repository
Optional<Course> findBySlug(String slug);

-- 复杂报表用原生 SQL 或投影
@Query(value = """
  SELECT c.title, COUNT(e.id) AS enrollments
  FROM courses c
  LEFT JOIN enrollments e ON e.course_id = c.id
  GROUP BY c.id, c.title
  ORDER BY enrollments DESC
  """, nativeQuery = true)
List<CourseEnrollmentView> findEnrollmentReport();`,
          output: `-- 简单 CRUD 用 ORM
-- 报表用原生 SQL + 投影，不强行对象化`,
          tip: `ORM 的“懒加载”很方便，也最容易触发 N+1。事务外访问懒关系还会报错。`
        },
        {
          h: '参数绑定、SQL 注入与类型安全',
          p: `所有 ORM 都应该用参数绑定，不要把用户输入拼进 SQL。[[WHERE id = ?]] 和字符串拼接的区别，是安全底线，不是风格问题。

原生 SQL 也要用参数化 API；动态排序字段不能直接拼，必须用白名单映射。[[ORDER BY :sort]] 这种绑定列名，多数数据库不支持。

类型安全是 ORM 的优势：Prisma 生成类型、SQLAlchemy 有类型提示、JPA 有实体映射。但类型正确不等于 SQL 正确，仍要看执行计划。`,
          code: `-- 安全：参数绑定
SELECT * FROM courses WHERE slug = $1;

-- 不安全：字符串拼接
-- "SELECT * FROM courses WHERE slug = '" + input + "'"

-- 排序列用白名单
ORDER BY CASE $2
  WHEN 'newest' THEN created_at
  WHEN 'popular' THEN enrollment_count
END DESC;`,
          output: `-- $1 由驱动绑定，不进入 SQL 语法
-- 排序列白名单避免注入`,
          tip: `[[ORDER BY CASE]] 可读性一般，但比拼接列名安全。复杂排序在应用层映射到固定 SQL 片段。`
        }
      ],
      points: ['ORM 适合 CRUD，复杂报表用 SQL', '必须打开 SQL 日志验证生成语句', '所有输入参数化，排序列白名单', '类型安全不等于执行计划正确'],
      practice: '把一条课程报名报表分别用 ORM 和原生 SQL 写出来，比较可读性与生成语句。'
    },
    {
      id: 'db-17-2',
      title: '17.2 迁移、种子数据与环境',
      minutes: 55,
      lead: '表结构不能靠手改生产库。迁移文件是可审查、可回滚、可重复执行的数据库版本历史；种子数据让本地和测试环境一致。',
      source: 'Flyway、Alembic、Prisma Migrate 文档',
      sections: [
        {
          h: '迁移文件：只前进，可审查',
          p: `每次改表都生成一个迁移文件：加列、加索引、改约束。迁移按顺序执行，记录在 [[schema_migrations]] 表里；已执行的不再重复。

生产迁移要可审查：DDL 是否锁表、是否兼容旧代码、是否可回滚。加列通常安全；删列、改类型、加 NOT NULL 可能破坏旧版本，采用“先加新列、双写、再删旧列”的渐进方式。

迁移不要包含业务数据的大规模清洗。数据修复用单独脚本，带进度、可重跑、可审计。`,
          code: `-- Flyway 风格：V20261127_01__add_course_status.sql
ALTER TABLE courses
  ADD COLUMN status text NOT NULL DEFAULT 'draft';

ALTER TABLE courses
  ADD CONSTRAINT courses_status_check
  CHECK (status IN ('draft', 'published', 'archived'));`,
          output: `-- 新列有默认值，旧行自动填充
-- 约束随后加上，旧数据必须满足`,
          tip: `给大表加 NOT NULL 列时，先加可空列、回填、再加约束，避免一次锁表。`
        },
        {
          h: '种子数据与环境隔离',
          p: `种子数据分两类：开发种子（测试用户、课程、帖子）和生产基础数据（角色、权限、状态字典）。生产种子必须幂等，重复执行不产生重复行。

本地、测试、预发、生产用不同数据库和不同密钥；迁移命令在 CI 中跑，不靠人工点。测试库每次从迁移重建，保证 schema 一致。

不要在迁移里写死环境相关路径、域名或密码。配置从环境变量读，密钥不进仓库。`,
          code: `INSERT INTO roles (code) VALUES
  ('admin'), ('teacher'), ('student')
ON CONFLICT (code) DO NOTHING;

INSERT INTO permissions (code) VALUES
  ('course:read'), ('course:write'), ('post:moderate')
ON CONFLICT (code) DO NOTHING;`,
          output: `-- 幂等种子：重复执行不会插入重复角色
-- 适合生产基础数据`,
          tip: `[[ON CONFLICT DO NOTHING]] 只处理唯一冲突，不校验其他字段。种子数据变更要单独迁移。`
        }
      ],
      points: ['迁移文件按顺序执行并记录版本', '生产 DDL 要考虑锁表与旧代码兼容', '开发种子与生产基础数据分开', '种子数据要幂等'],
      practice: '为一个“课程状态”变更写迁移：加列、回填、加 CHECK，并说明如何兼容旧代码。'
    },
    {
      id: 'db-17-3',
      title: '17.3 连接池、超时与 N+1',
      minutes: 60,
      lead: '连接池不是越大越好。数据库连接是昂贵资源，池太大反而让数据库上下文切换、锁竞争更严重；池太小则请求排队。超时和 N+1 同样能拖垮服务。',
      source: 'HikariCP 文档；PostgreSQL 连接管理实践',
      sections: [
        {
          h: '池大小、超时与生命周期',
          p: `连接池核心参数：最大连接数、最小空闲、获取连接超时、空闲超时、最大生命周期。最大连接数要小于数据库 [[max_connections]]，并给迁移、监控留余量。

常见起点：每个应用实例 10–20 个连接，按压测调整；不是 100。数据库 CPU 核数有限，过多连接会让调度变慢。无状态服务可以多实例，但总连接数要算总和。

获取连接超时应该短于接口超时，避免请求一直排队。连接最大生命周期略小于数据库/代理的空闲断开时间，防止拿到已被服务端关闭的连接。`,
          code: `# HikariCP 典型配置
maximumPoolSize: 15
minimumIdle: 3
connectionTimeout: 3000
idleTimeout: 600000
maxLifetime: 1800000
validationTimeout: 1000`,
          output: `-- 获取连接最多等 3 秒
-- 连接最多活 30 分钟，避免服务端断连`,
          tip: `池大小要按“数据库能承受多少并发写”算，不是按“应用有多少线程”算。`
        },
        {
          h: 'N+1：一个列表接口打一百次库',
          p: `查 20 门课，每门课再查一次讲师，就是 21 次查询。ORM 懒加载最容易产生 N+1；接口看似只调用一个方法，实际打了一百次数据库。

修复：用 JOIN FETCH/预加载、批量查询 [[WHERE id IN (...)] ]]、或 DataLoader 合并。列表接口要限制关联加载深度，详情页再按需加载。

检测：打开 SQL 日志，数一次请求的查询条数；或 APM 看数据库调用数。N+1 不一定慢在单条，而是总往返和连接占用。`,
          code: `-- 反例：先查课程，再循环查讲师
SELECT * FROM courses WHERE published = true;
-- 对每门课：
SELECT * FROM users WHERE id = ?;

-- 修复：一次 JOIN 取回
SELECT c.id, c.title, u.name AS teacher_name
FROM courses c
JOIN users u ON u.id = c.teacher_id
WHERE c.published = true;`,
          output: `-- 一条查询返回列表和讲师名
-- 避免 N 次往返`,
          tip: `JOIN 取回所有列可能过宽；只选列表需要的字段，详情页再查完整对象。`
        }
      ],
      points: ['连接池不是越大越好，按数据库容量算', '获取连接超时要短于接口超时', 'N+1 是列表接口的常见性能杀手', '用 JOIN/批量查询/DataLoader 合并'],
      practice: '数一次你项目列表接口的 SQL 条数；如果有 N+1，写出 JOIN 或批量查询修复方案。'
    }
  ]
});

/* --- db-ch18.js --- */

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch18',
  part: 5,
  number: '18',
  title: '缓存、备份与数据安全',
  summary: '缓存让读更快，也会让数据短暂不一致；备份决定灾难后能不能恢复；权限与加密决定数据会不会被拿走。三者都是“上线之后”才真正考验工程能力。',
  goals: ['设计 cache-aside 与失效策略', '避免穿透、击穿、雪崩', '制定可验证的备份恢复流程', '落实最小权限、审计与敏感字段保护'],
  source: 'Redis 文档；PostgreSQL 16 备份恢复；OWASP',
  lessons: [
    {
      id: 'db-18-1',
      title: '18.1 Redis 缓存与一致性',
      minutes: 60,
      lead: '缓存不是“把查询结果塞 Redis”这么简单。缓存键怎么定、失效什么时候删、数据库更新后旧值怎么办，决定用户看到的是快还是错。',
      source: 'Redis 文档；缓存设计实践',
      sections: [
        {
          h: 'cache-aside：读时回填，写时删除',
          p: `最常用模式是 **cache-aside**：读请求先查 Redis，未命中查数据库，再写回缓存；写请求先更新数据库，再删除缓存（不是更新缓存）。

为什么删除而不是更新？并发写和读回填可能把旧值写回；删除让下一次读重新加载，减少长期不一致。删除失败要有重试或延迟双删，不能静默吞掉。

缓存键包含资源版本和维度：[[course:detail:v2:42]]。版本变化时旧键自然失效；不要把所有课程塞进一个巨大 JSON。`,
          code: `# 读
value = redis.get("course:detail:v2:42")
if value is None:
    row = db.query_course(42)
    redis.setex("course:detail:v2:42", 300, json(row))
    return row
return json.loads(value)

# 写
db.update_course(42, data)
redis.delete("course:detail:v2:42")`,
          output: `-- 读未命中回填，TTL 300 秒
-- 写后删除缓存，下一次读重新加载`,
          tip: `先更新数据库再删缓存是常见顺序；反过来会出现“删了缓存但数据库更新失败”的脏读。`
        },
        {
          h: '穿透、击穿、雪崩',
          p: `**穿透**：查不存在的数据，缓存永远不命中，每次都打数据库。解决：缓存空值（短 TTL）、布隆过滤器、参数校验。

**击穿**：热点键过期瞬间，大量请求同时回源。解决：互斥锁/单飞、逻辑过期 + 后台刷新、随机 TTL。

**雪崩**：大量键同时过期或 Redis 宕机，数据库瞬间被打满。解决：TTL 加随机抖动、多级缓存、限流降级、Redis 高可用。

缓存是性能层，不是真相层。数据库不可用时，缓存可以兜底读，但不能让写也绕过去。`,
          code: `-- 缓存空值，短 TTL，防止穿透
SET course:detail:v2:999 "" EX 60

-- 分布式锁，防止击穿
SET lock:course:42 token NX EX 10
-- 拿到锁的请求回源，其他请求短暂等待/返回旧值`,
          output: `-- 不存在课程缓存空字符串 60 秒
-- 同一个热点键只让一个请求回源`,
          tip: `缓存空值要区分“不存在”和“缓存故障”。Redis 挂了不能把所有请求都当成不存在。`
        }
      ],
      points: ['cache-aside 读回填、写删除', '删除缓存比更新缓存更安全', '穿透缓存空值，击穿加锁，雪崩抖动 TTL', '缓存不是真相层'],
      practice: '为一个课程详情接口设计缓存键、TTL、更新后的失效流程，并说明如何防击穿。'
    },
    {
      id: 'db-18-2',
      title: '18.2 备份、恢复与 PITR',
      minutes: 60,
      lead: '备份不是“每天 cp 一份”。没验证过恢复的备份等于没有备份；PITR 能把数据库恢复到误删前的某一秒。',
      source: 'PostgreSQL 16 文档 · Backup and Restore',
      sections: [
        {
          h: '逻辑备份与物理备份',
          p: `[[pg_dump]] 导出 SQL/自定义格式，适合单库迁移、小数据量；[[pg_dumpall]] 含角色和全局对象。逻辑备份可跨版本、可选择性恢复，但大库慢。

物理备份复制数据目录/WAL，适合大库和快速恢复；[[pg_basebackup]] 做基础备份，配合 WAL 归档做 PITR。物理备份与版本、架构绑定，不能随便跨大版本。

备份要异地/异账户保存，加密，限制访问。只存一份在同一个云账号，遇到账号被封或误删，等于没有。`,
          code: `# 逻辑备份
pg_dump -Fc -d learn -f /backup/learn-$(date +%F).dump

# 恢复
pg_restore -d learn_restore /backup/learn-2026-11-27.dump

# 物理基础备份
pg_basebackup -D /backup/base -Ft -z -P -X stream`,
          output: `-- -Fc 自定义格式，支持并行恢复
-- pg_basebackup 产出 tar + WAL`,
          tip: `[[pg_dump]] 不加 [[-Fc]] 时是纯 SQL，恢复慢且不能并行。生产备份优先自定义格式。`
        },
        {
          h: '恢复演练与 PITR',
          p: `备份必须定期演练：在隔离环境恢复，校验行数、关键表、约束和索引。恢复耗时也是指标；大库恢复几小时，RTO 是否可接受？

PITR 需要基础备份 + 连续 WAL 归档。误删表后，恢复到删除前的时间点，再导出数据补回生产。[[recovery_target_time]] 要精确到秒，且知道时区。

备份保留策略按合规和成本定：日备、周备、月备；WAL 归档保留足够覆盖恢复窗口。删除旧备份前确认新备份可用。`,
          code: `# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /archive/wal/%f'

# recovery.conf / postgresql.conf
restore_command = 'cp /archive/wal/%f %p'
recovery_target_time = '2026-11-27 10:30:00+08'`,
          output: `-- WAL 连续归档后可恢复到指定时间点
-- 恢复目标时间要早于误操作`,
          tip: `PITR 不是“回到过去”按钮。恢复后要校验数据，并把新写入补回，否则会丢恢复点之后的正常业务。`
        }
      ],
      points: ['逻辑备份适合迁移，物理备份适合大库', '备份要异地、加密、限制权限', '没演练过的备份不可信', 'PITR = 基础备份 + WAL 归档'],
      practice: '为一个 50GB 数据库制定备份计划：频率、保留、异地、恢复演练和 RTO。'
    },
    {
      id: 'db-18-3',
      title: '18.3 权限、审计与敏感数据',
      minutes: 55,
      lead: '数据库账号不应该共用 root。应用、迁移、只读报表、备份各用各的账号，权限最小化；敏感字段加密、脱敏、审计，缺一不可。',
      source: 'PostgreSQL 16 文档 · Roles；OWASP 数据保护',
      sections: [
        {
          h: '角色分离与最小权限',
          p: `应用账号只拥有业务表的 SELECT/INSERT/UPDATE/DELETE，不给 SUPERUSER、不给建库建角色。迁移账号有 DDL 权限，但只在部署时使用。报表账号只读，最好连只读副本。

[[GRANT]] 按对象授予，不要 [[GRANT ALL ON DATABASE]]。撤销默认 [[PUBLIC]] 权限，避免新表自动对所有人开放。

生产数据库不暴露公网端口；只允许应用网段/跳板机访问，启 TLS。连接串、密码放密钥管理，不进 Git、不进前端。`,
          code: `CREATE ROLE app_rw LOGIN PASSWORD '***';
GRANT CONNECT ON DATABASE learn TO app_rw;
GRANT USAGE ON SCHEMA public TO app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA public TO app_rw;
REVOKE ALL ON DATABASE learn FROM PUBLIC;`,
          output: `-- 应用账号只能读写业务表
-- 不能建库、不能改结构`,
          tip: `新表不会自动继承旧 GRANT。迁移后要重新授权，或用 [[ALTER DEFAULT PRIVILEGES]]。`
        },
        {
          h: '敏感字段：少存、加密、脱敏、审计',
          p: `能不存就不存：密码只存哈希（Argon2/bcrypt），不存明文；支付卡号不落库，用支付平台 token；身份证号如非必要不存完整值。

必须存时：字段级加密（应用层加密或数据库 TDE），密钥与数据分离；查询用盲索引/哈希，不要为了搜索把明文复制到日志。

日志和审计要脱敏：邮箱、手机号打码，token/密码绝不进日志。访问敏感数据要有审计记录，谁在何时查了哪条。`,
          code: `-- 密码哈希示例（应用层完成，不存明文）
UPDATE users
SET password_hash = crypt('user-password', gen_salt('bf'))
WHERE id = 42;

-- 查询时验证
SELECT id FROM users
WHERE id = 42
  AND password_hash = crypt('user-password', password_hash);`,
          output: `-- crypt/gen_salt 需要 pgcrypto 扩展
-- 生产更推荐应用层 Argon2id`,
          tip: `[[crypt]] 的 bcrypt 有长度限制；新项目优先 Argon2id，并设置合适的成本参数。`
        }
      ],
      points: ['应用、迁移、报表、备份角色分离', '应用账号不给 SUPERUSER/DDL', '敏感数据少存、加密、脱敏、审计', '密码只存哈希，不存明文'],
      practice: '为一个课程社区设计 4 个数据库角色和权限清单，并列出 3 个必须脱敏的字段。'
    }
  ]
});

/* --- db-ch19.js --- */

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

/* --- db-ch20.js --- */

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  "id": "db-ch20",
  "part": 6,
  "number": "20",
  "title": "查询计划、复制与容量",
  "summary": "数据库的“慢”有很多种：计划选错、锁等待、复制延迟、分区没剪枝、备份不可恢复。这一章把每种慢都变成可测量的证据。",
  "goals": [
    "能读懂 EXPLAIN ANALYZE 的 rows、loops、buffers 和 scan 类型。",
    "能复现一次锁等待，并画出事务时间线。",
    "能测量复制延迟，并判断哪些读必须走主库。",
    "能在临时库完成一次 PITR，并校验行数。"
  ],
  "source": "PostgreSQL 16 文档、SQL 标准与数据库工程实践",
  "lessons": [
    {
      "id": "db-20-1",
      "title": "20.1 EXPLAIN ANALYZE 与索引选择性",
      "minutes": 60,
      "lead": "加索引之前先看计划。你以为是索引问题，可能只是统计信息过期或排序把索引废掉了。 这一课只处理「查询计划、复制与容量」里的一个具体动作：**EXPLAIN ANALYZE 与索引选择性**。先做一次最小实验，再把它接进课程社区数据库，最后用一个反例确认自己真的能解释结果。",
      "source": "PostgreSQL 16 文档、SQL 标准与数据库工程实践",
      "sections": [
        {
          "h": "生产环境为什么会卡在这里",
          "p": "加索引之前先看计划。你以为是索引问题，可能只是统计信息过期或排序把索引废掉了。\n\n数据库的“慢”有很多种：计划选错、锁等待、复制延迟、分区没剪枝、备份不可恢复。这一章把每种慢都变成可测量的证据。 本课聚焦 **EXPLAIN ANALYZE 与索引选择性**，目标不是背概念，而是能说清它的输入、输出、失败条件和可复查证据。"
        },
        {
          "h": "最小实验：EXPLAIN ANALYZE 与索引选择性",
          "p": "先只改一个变量，把输出跑成可预测的基线；不要同时动项目里的十个地方。执行时把命令、版本和当前目录一起记下来，否则下次复现会分不清是代码变了还是环境变了。",
          "code": "EXPLAIN (ANALYZE, BUFFERS)\nSELECT id, title FROM courses\nWHERE status = 'published'\nORDER BY created_at DESC\nLIMIT 20;",
          "output": "Limit  (cost=0.42..18.7 rows=20 width=36)\n  ->  Index Scan using courses_status_created_idx on courses\n        (actual time=0.031..0.084 rows=20 loops=1)\n        Buffers: shared hit=6\nPlanning Time: 0.120 ms\nExecution Time: 0.102 ms",
          "tip": "先看 rows 估算和 actual 差距，再看索引；复合索引的列顺序要匹配过滤和排序。"
        },
        {
          "h": "接进课程社区：从能跑变成能交付",
          "p": "把这一章接进课程社区：课程列表、报名和进度查询都会在生产数据量下变慢，必须用计划和指标说话。\n\n具体到 **EXPLAIN ANALYZE 与索引选择性**，它不是一段演示代码，而是要写进配置、代码、文档或测试的一项能力。先接最小成功路径，再补失败路径、观测点和回滚方式。"
        },
        {
          "h": "边界、反例与验收",
          "p": "反例先记住：先看 rows 估算和 actual 差距，再看索引；复合索引的列顺序要匹配过滤和排序。\n\n本章验收：为慢查询加复合索引，记录 buffers 和执行时间的前后对比。做不到就回到实验重做，不要用“我看过了”代替“我跑过了”。"
        }
      ],
      "points": [
        "数据库的“慢”有很多种：计划选错、锁等待、复制延迟、分区没剪枝、备份不可恢复。这一章把每种慢都变成可测量的证据。",
        "能把「EXPLAIN ANALYZE 与索引选择性」放回一次真实请求、一次发布或一次故障复盘，而不是只会背定义。",
        "失败时先检查：先看 rows 估算和 actual 差距，再看索引；复合索引的列顺序要匹配过滤和排序。",
        "交付证据：为慢查询加复合索引，记录 buffers 和执行时间的前后对比。"
      ],
      "practice": "在课程社区数据库中完成一次「EXPLAIN ANALYZE 与索引选择性」的最小实验，并把命令、输出和失败提示写进 README 或测试。验收线：为慢查询加复合索引，记录 buffers 和执行时间的前后对比。"
    },
    {
      "id": "db-20-2",
      "title": "20.2 事务隔离、MVCC 与锁等待",
      "minutes": 60,
      "lead": "长事务不会“卡住自己”，它会拖住 vacuum、锁住别人，最后让整个库变慢。 这一课只处理「查询计划、复制与容量」里的一个具体动作：**事务隔离、MVCC 与锁等待**。先做一次最小实验，再把它接进课程社区数据库，最后用一个反例确认自己真的能解释结果。",
      "source": "PostgreSQL 16 文档、SQL 标准与数据库工程实践",
      "sections": [
        {
          "h": "生产环境为什么会卡在这里",
          "p": "长事务不会“卡住自己”，它会拖住 vacuum、锁住别人，最后让整个库变慢。\n\n数据库的“慢”有很多种：计划选错、锁等待、复制延迟、分区没剪枝、备份不可恢复。这一章把每种慢都变成可测量的证据。 本课聚焦 **事务隔离、MVCC 与锁等待**，目标不是背概念，而是能说清它的输入、输出、失败条件和可复查证据。"
        },
        {
          "h": "最小实验：事务隔离、MVCC 与锁等待",
          "p": "先只改一个变量，把输出跑成可预测的基线；不要同时动项目里的十个地方。执行时把命令、版本和当前目录一起记下来，否则下次复现会分不清是代码变了还是环境变了。",
          "code": "BEGIN ISOLATION LEVEL REPEATABLE READ;\nSELECT balance FROM accounts WHERE id = 42 FOR UPDATE;\n-- 会话 B 同时执行同一行，观察等待\nSELECT pid, wait_event_type, wait_event, query\nFROM pg_stat_activity WHERE state = 'active';\nROLLBACK;",
          "output": "pid  wait_event_type  wait_event  query\n812  Lock             transactionid  SELECT ... FOR UPDATE\n# 会话 B 等待 1.8s 后拿到锁",
          "tip": "锁等待要有 statement_timeout 和死锁日志；不要用长事务包住网络调用。"
        },
        {
          "h": "接进课程社区：从能跑变成能交付",
          "p": "把这一章接进课程社区：课程列表、报名和进度查询都会在生产数据量下变慢，必须用计划和指标说话。\n\n具体到 **事务隔离、MVCC 与锁等待**，它不是一段演示代码，而是要写进配置、代码、文档或测试的一项能力。先接最小成功路径，再补失败路径、观测点和回滚方式。"
        },
        {
          "h": "边界、反例与验收",
          "p": "反例先记住：锁等待要有 statement_timeout 和死锁日志；不要用长事务包住网络调用。\n\n本章验收：复现一次锁等待，画出两个事务的时间线和等待事件。做不到就回到实验重做，不要用“我看过了”代替“我跑过了”。"
        }
      ],
      "points": [
        "数据库的“慢”有很多种：计划选错、锁等待、复制延迟、分区没剪枝、备份不可恢复。这一章把每种慢都变成可测量的证据。",
        "能把「事务隔离、MVCC 与锁等待」放回一次真实请求、一次发布或一次故障复盘，而不是只会背定义。",
        "失败时先检查：锁等待要有 statement_timeout 和死锁日志；不要用长事务包住网络调用。",
        "交付证据：复现一次锁等待，画出两个事务的时间线和等待事件。"
      ],
      "practice": "在课程社区数据库中完成一次「事务隔离、MVCC 与锁等待」的最小实验，并把命令、输出和失败提示写进 README 或测试。验收线：复现一次锁等待，画出两个事务的时间线和等待事件。"
    },
    {
      "id": "db-20-3",
      "title": "20.3 复制延迟与读写分离",
      "minutes": 60,
      "lead": "刚报名的用户刷新看不到进度，不一定是缓存，可能是读到了还没回放的从库。 这一课只处理「查询计划、复制与容量」里的一个具体动作：**复制延迟与读写分离**。先做一次最小实验，再把它接进课程社区数据库，最后用一个反例确认自己真的能解释结果。",
      "source": "PostgreSQL 16 文档、SQL 标准与数据库工程实践",
      "sections": [
        {
          "h": "生产环境为什么会卡在这里",
          "p": "刚报名的用户刷新看不到进度，不一定是缓存，可能是读到了还没回放的从库。\n\n数据库的“慢”有很多种：计划选错、锁等待、复制延迟、分区没剪枝、备份不可恢复。这一章把每种慢都变成可测量的证据。 本课聚焦 **复制延迟与读写分离**，目标不是背概念，而是能说清它的输入、输出、失败条件和可复查证据。"
        },
        {
          "h": "最小实验：复制延迟与读写分离",
          "p": "先只改一个变量，把输出跑成可预测的基线；不要同时动项目里的十个地方。执行时把命令、版本和当前目录一起记下来，否则下次复现会分不清是代码变了还是环境变了。",
          "code": "SELECT client_addr, state, sent_lsn, replay_lsn,\n       pg_wal_lsn_diff(sent_lsn, replay_lsn) AS lag_bytes\nFROM pg_stat_replication;\nSELECT pg_last_wal_replay_lsn(), now() - pg_last_xact_replay_timestamp();",
          "output": "client_addr   state     lag_bytes\n10.0.1.12     streaming 1,048,576\nreplay lag: 00:00:02.4",
          "tip": "读写分离要区分“必须读己之写”的请求；报名、支付、进度写后读应回主库。"
        },
        {
          "h": "接进课程社区：从能跑变成能交付",
          "p": "把这一章接进课程社区：课程列表、报名和进度查询都会在生产数据量下变慢，必须用计划和指标说话。\n\n具体到 **复制延迟与读写分离**，它不是一段演示代码，而是要写进配置、代码、文档或测试的一项能力。先接最小成功路径，再补失败路径、观测点和回滚方式。"
        },
        {
          "h": "边界、反例与验收",
          "p": "反例先记住：读写分离要区分“必须读己之写”的请求；报名、支付、进度写后读应回主库。\n\n本章验收：测量复制延迟，并给关键读请求加主库路由。做不到就回到实验重做，不要用“我看过了”代替“我跑过了”。"
        }
      ],
      "points": [
        "数据库的“慢”有很多种：计划选错、锁等待、复制延迟、分区没剪枝、备份不可恢复。这一章把每种慢都变成可测量的证据。",
        "能把「复制延迟与读写分离」放回一次真实请求、一次发布或一次故障复盘，而不是只会背定义。",
        "失败时先检查：读写分离要区分“必须读己之写”的请求；报名、支付、进度写后读应回主库。",
        "交付证据：测量复制延迟，并给关键读请求加主库路由。"
      ],
      "practice": "在课程社区数据库中完成一次「复制延迟与读写分离」的最小实验，并把命令、输出和失败提示写进 README 或测试。验收线：测量复制延迟，并给关键读请求加主库路由。"
    },
    {
      "id": "db-20-4",
      "title": "20.4 分区剪枝与热键",
      "minutes": 60,
      "lead": "分区不是“表大了就切”。分区键不匹配查询条件，规划器只能扫全部分区。 这一课只处理「查询计划、复制与容量」里的一个具体动作：**分区剪枝与热键**。先做一次最小实验，再把它接进课程社区数据库，最后用一个反例确认自己真的能解释结果。",
      "source": "PostgreSQL 16 文档、SQL 标准与数据库工程实践",
      "sections": [
        {
          "h": "生产环境为什么会卡在这里",
          "p": "分区不是“表大了就切”。分区键不匹配查询条件，规划器只能扫全部分区。\n\n数据库的“慢”有很多种：计划选错、锁等待、复制延迟、分区没剪枝、备份不可恢复。这一章把每种慢都变成可测量的证据。 本课聚焦 **分区剪枝与热键**，目标不是背概念，而是能说清它的输入、输出、失败条件和可复查证据。"
        },
        {
          "h": "最小实验：分区剪枝与热键",
          "p": "先只改一个变量，把输出跑成可预测的基线；不要同时动项目里的十个地方。执行时把命令、版本和当前目录一起记下来，否则下次复现会分不清是代码变了还是环境变了。",
          "code": "CREATE TABLE events_2026_11 PARTITION OF events\nFOR VALUES FROM ('2026-11-01') TO ('2026-12-01');\n\nEXPLAIN SELECT * FROM events\nWHERE created_at >= '2026-11-20'\n  AND created_at < '2026-11-21';",
          "output": "Append  (cost=0.00..12.4 rows=1 width=32)\n  ->  Seq Scan on events_2026_11\n        Filter: created_at >= ... AND created_at < ...\n# 只扫描 1 个分区，pruning 生效",
          "tip": "分区键要匹配主要过滤条件；热键用加盐、拆分或本地缓存分散，不要只加索引。"
        },
        {
          "h": "接进课程社区：从能跑变成能交付",
          "p": "把这一章接进课程社区：课程列表、报名和进度查询都会在生产数据量下变慢，必须用计划和指标说话。\n\n具体到 **分区剪枝与热键**，它不是一段演示代码，而是要写进配置、代码、文档或测试的一项能力。先接最小成功路径，再补失败路径、观测点和回滚方式。"
        },
        {
          "h": "边界、反例与验收",
          "p": "反例先记住：分区键要匹配主要过滤条件；热键用加盐、拆分或本地缓存分散，不要只加索引。\n\n本章验收：压测一个热 key，用加盐或拆分把 QPS 分散到多个节点。做不到就回到实验重做，不要用“我看过了”代替“我跑过了”。"
        }
      ],
      "points": [
        "数据库的“慢”有很多种：计划选错、锁等待、复制延迟、分区没剪枝、备份不可恢复。这一章把每种慢都变成可测量的证据。",
        "能把「分区剪枝与热键」放回一次真实请求、一次发布或一次故障复盘，而不是只会背定义。",
        "失败时先检查：分区键要匹配主要过滤条件；热键用加盐、拆分或本地缓存分散，不要只加索引。",
        "交付证据：压测一个热 key，用加盐或拆分把 QPS 分散到多个节点。"
      ],
      "practice": "在课程社区数据库中完成一次「分区剪枝与热键」的最小实验，并把命令、输出和失败提示写进 README 或测试。验收线：压测一个热 key，用加盐或拆分把 QPS 分散到多个节点。"
    },
    {
      "id": "db-20-5",
      "title": "20.5 备份、PITR 与恢复演练",
      "minutes": 60,
      "lead": "没演练过的备份等于没有备份。真正要验证的是“能否在指定分钟恢复”，不是“备份文件存在”。 这一课只处理「查询计划、复制与容量」里的一个具体动作：**备份、PITR 与恢复演练**。先做一次最小实验，再把它接进课程社区数据库，最后用一个反例确认自己真的能解释结果。",
      "source": "PostgreSQL 16 文档、SQL 标准与数据库工程实践",
      "sections": [
        {
          "h": "生产环境为什么会卡在这里",
          "p": "没演练过的备份等于没有备份。真正要验证的是“能否在指定分钟恢复”，不是“备份文件存在”。\n\n数据库的“慢”有很多种：计划选错、锁等待、复制延迟、分区没剪枝、备份不可恢复。这一章把每种慢都变成可测量的证据。 本课聚焦 **备份、PITR 与恢复演练**，目标不是背概念，而是能说清它的输入、输出、失败条件和可复查证据。"
        },
        {
          "h": "最小实验：备份、PITR 与恢复演练",
          "p": "先只改一个变量，把输出跑成可预测的基线；不要同时动项目里的十个地方。执行时把命令、版本和当前目录一起记下来，否则下次复现会分不清是代码变了还是环境变了。",
          "code": "pg_basebackup -h db -D /backup/base -Ft -z -P\n# 恢复参数\nrestore_command = 'cp /archive/%f %p'\nrecovery_target_time = '2026-11-27 09:15:00+08'\nrecovery_target_action = 'promote'",
          "output": "backup size: 18.4 GB\nrestore target: 2026-11-27 09:15:00+08\nrow check: courses=1,204 enrollments=38,917\nRTO: 14m32s",
          "tip": "备份要覆盖 base backup + WAL 归档；恢复演练记录 RTO/RPO 和校验 SQL。"
        },
        {
          "h": "接进课程社区：从能跑变成能交付",
          "p": "把这一章接进课程社区：课程列表、报名和进度查询都会在生产数据量下变慢，必须用计划和指标说话。\n\n具体到 **备份、PITR 与恢复演练**，它不是一段演示代码，而是要写进配置、代码、文档或测试的一项能力。先接最小成功路径，再补失败路径、观测点和回滚方式。"
        },
        {
          "h": "边界、反例与验收",
          "p": "反例先记住：备份要覆盖 base backup + WAL 归档；恢复演练记录 RTO/RPO 和校验 SQL。\n\n本章验收：在临时库恢复到指定分钟，校验关键表行数与业务一致性。做不到就回到实验重做，不要用“我看过了”代替“我跑过了”。"
        }
      ],
      "points": [
        "数据库的“慢”有很多种：计划选错、锁等待、复制延迟、分区没剪枝、备份不可恢复。这一章把每种慢都变成可测量的证据。",
        "能把「备份、PITR 与恢复演练」放回一次真实请求、一次发布或一次故障复盘，而不是只会背定义。",
        "失败时先检查：备份要覆盖 base backup + WAL 归档；恢复演练记录 RTO/RPO 和校验 SQL。",
        "交付证据：在临时库恢复到指定分钟，校验关键表行数与业务一致性。"
      ],
      "practice": "在课程社区数据库中完成一次「备份、PITR 与恢复演练」的最小实验，并把命令、输出和失败提示写进 README 或测试。验收线：在临时库恢复到指定分钟，校验关键表行数与业务一致性。"
    }
  ]
});

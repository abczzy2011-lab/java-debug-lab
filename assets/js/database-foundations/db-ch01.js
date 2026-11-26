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

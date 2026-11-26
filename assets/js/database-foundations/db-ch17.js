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

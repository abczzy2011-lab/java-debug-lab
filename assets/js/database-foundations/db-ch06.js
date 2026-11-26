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

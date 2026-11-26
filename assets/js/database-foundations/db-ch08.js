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

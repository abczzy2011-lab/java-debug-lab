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

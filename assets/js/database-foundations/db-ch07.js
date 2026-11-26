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

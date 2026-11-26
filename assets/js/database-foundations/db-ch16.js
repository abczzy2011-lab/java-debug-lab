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

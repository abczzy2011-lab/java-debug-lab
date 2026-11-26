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

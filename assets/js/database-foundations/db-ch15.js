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

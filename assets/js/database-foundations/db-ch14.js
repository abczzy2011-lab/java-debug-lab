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

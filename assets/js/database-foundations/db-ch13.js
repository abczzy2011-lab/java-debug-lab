window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch13',
  part: 4,
  number: '13',
  title: '事务与一致性',
  summary: '事务把多条 SQL 绑成一个“全成功或全失败”的单元。它不是越大约好：边界太长会锁住资源，边界太短会让业务写到一半。',
  goals: ['解释 ACID 在业务里的含义', '正确写 BEGIN/COMMIT/ROLLBACK', '用保存点处理部分失败', '识别长事务与批量写入风险'],
  source: 'PostgreSQL 16 文档 · Transactions；数据库系统概念',
  lessons: [
    {
      id: 'db-13-1',
      title: '13.1 ACID 与事务边界',
      minutes: 55,
      lead: 'ACID 不是四个口号。原子性决定“支付和报名不能只成功一半”，一致性决定“约束不能被绕过”，隔离性决定“并发用户看到什么”，持久性决定“提交后断电还在不在”。',
      source: '数据库系统概念 · Transactions；PostgreSQL 16 文档',
      sections: [
        {
          h: '原子性、一致性、隔离性、持久性',
          p: `**原子性**：事务里的多条语句要么全提交，要么全回滚。支付成功但报名失败，用户钱扣了课没开，这就是原子性被破坏。

**一致性**：事务开始和结束时，数据库都满足约束。外键、唯一、CHECK 不会因为事务中途的临时状态被绕过；非法数据最终无法提交。

**隔离性**：并发事务互相看不见未提交的中间状态。隔离级别决定能看见多少，后面一章细讲。**持久性**：COMMIT 返回后，数据已经写进 WAL，崩溃恢复能找回；不是“还在内存里”。

事务边界应该包住一个完整的业务动作：下单、支付入账、报名、退款。不要把 HTTP 请求、发邮件、调用第三方支付放在事务里。`,
          code: `BEGIN;

UPDATE accounts SET balance_cents = balance_cents - 9900
WHERE id = 7 AND balance_cents >= 9900;

INSERT INTO enrollments (user_id, course_id, status)
VALUES (7, 1, 'active');

COMMIT;`,
          output: `-- 扣款与报名同一事务
-- 余额不足时 UPDATE 影响 0 行，应用应 ROLLBACK`,
          tip: `事务里不要做网络请求。第三方超时会让事务一直开着，锁住行，拖垮并发。`
        },
        {
          h: '边界太长和太短都危险',
          p: `边界太长：一个事务里查十张表、调用外部 API、生成 PDF、发邮件，可能持续几秒到几分钟。行锁不释放，其他请求排队，连接池被占满。

边界太短：先扣款提交，再报名提交。中间失败就出现“钱扣了课没开”。补偿逻辑能救，但不如一个正确的事务边界。

正确做法：事务只包数据库写入和必要的校验；外部副作用用 outbox/消息队列，在事务提交后异步执行。`,
          code: `-- 推荐：事务只写库，事件落 outbox
BEGIN;
UPDATE orders SET status = 'paid' WHERE id = $1 AND status = 'pending';
INSERT INTO outbox (topic, payload)
VALUES ('order.paid', jsonb_build_object('order_id', $1));
COMMIT;

-- 后台 worker 读取 outbox，发邮件、开课、通知
-- 失败可重试，不阻塞下单事务`,
          output: `-- 事务短、可预测；外部副作用最终一致`,
          tip: `[[outbox]] 表要有唯一事件 ID 和重试状态，否则 worker 重复消费会造成重复发邮件。`
        }
      ],
      points: ['ACID 分别对应原子、约束、隔离和持久', '事务边界包住一个完整业务动作', '不要在事务里做网络请求', '外部副作用用 outbox/队列异步化'],
      practice: '写出“扣余额 + 报名”的事务 SQL，并说明余额不足时如何回滚。'
    },
    {
      id: 'db-13-2',
      title: '13.2 BEGIN、COMMIT、ROLLBACK 与保存点',
      minutes: 50,
      lead: '事务控制语句看起来只有三个，实际使用时有隐式提交、保存点和异常处理三个坑。写错一个，回滚可能没生效。',
      source: 'PostgreSQL 16 文档 · Transaction Control',
      sections: [
        {
          h: '显式事务的三段式',
          p: `[[BEGIN]] 开启事务，[[COMMIT]] 提交，[[ROLLBACK]] 回滚。PostgreSQL 默认自动提交：没有 BEGIN 时，每条语句自己是一个事务。

在应用代码里，事务通常由框架管理：Spring 的 [[@Transactional]]、SQLAlchemy 的 [[session.begin()]]。不要手动在 ORM 里再包一层，容易嵌套错。

某些语句会隐式提交：DDL（CREATE/ALTER/DROP）在多数数据库里不能回滚；PostgreSQL 的 DDL 可以事务化，但跨库行为不同。迁移脚本要单独评估。`,
          code: `BEGIN;
UPDATE orders SET status = 'paid' WHERE id = 42;
-- 发现金额不对
ROLLBACK;

-- 重新执行正确逻辑
BEGIN;
UPDATE orders SET status = 'paid', total_cents = 9900 WHERE id = 42;
COMMIT;`,
          output: `-- ROLLBACK 后第一次更新不生效
-- 第二次事务重新写入`,
          tip: `[[ROLLBACK]] 之后事务结束，必须重新 [[BEGIN]] 才能继续。不要在回滚后直接发下一条业务 SQL。`
        },
        {
          h: '保存点：部分失败但不全丢',
          p: `[[SAVEPOINT sp1]] 在事务里打一个标记；[[ROLLBACK TO SAVEPOINT sp1]] 只回滚到标记之后，之前的工作保留。适合“批量导入，某一行失败但继续其他行”的场景。

保存点不是免费：每个保存点都要维护状态，嵌套太多会变慢。大多数业务用“整事务回滚 + 应用重试”更简单。

异常处理里要确保事务被回滚或提交，不要让异常路径漏掉。连接归还连接池前，框架通常会清理未完成事务；但不要依赖它。`,
          code: `BEGIN;
INSERT INTO courses (slug, title) VALUES ('a', '课程 A');

SAVEPOINT before_b;
INSERT INTO courses (slug, title) VALUES ('b', '课程 B');
-- 假设 B 违反唯一约束
ROLLBACK TO SAVEPOINT before_b;

INSERT INTO courses (slug, title) VALUES ('c', '课程 C');
COMMIT;`,
          output: `-- A 和 C 保留，B 被回滚
-- 整个事务仍然提交`,
          tip: `保存点回滚后，之前的锁和写入仍在事务里；它不是“独立事务”，不能跨连接。`
        }
      ],
      points: ['BEGIN/COMMIT/ROLLBACK 是最小三段式', 'PostgreSQL 默认自动提交', '保存点用于部分回滚，不是独立事务', '异常路径必须确保事务结束'],
      practice: '用保存点写一个批量插入：前两行成功，第三行冲突被回滚，最后提交前两行。'
    },
    {
      id: 'db-13-3',
      title: '13.3 长事务、批量写入与锁等待',
      minutes: 55,
      lead: '一个事务开十分钟，可能锁住一行、拖慢整个接口。批量写入不是“循环 INSERT”这么简单，分批、排序和超时设置都会影响稳定性。',
      source: 'PostgreSQL 16 文档 · Transaction Management；生产实践',
      sections: [
        {
          h: '长事务为什么危险',
          p: `长事务持有锁，其他事务等锁；它还会阻止 vacuum 清理旧版本，导致表膨胀。一个报表查询如果开了事务却迟迟不提交，可能让整个库的清理滞后。

监控 [[pg_stat_activity]] 的 [[state]]、[[xact_start]]、[[query_start]]，找出超过阈值的事务。设置 [[idle_in_transaction_session_timeout]]，让“开了事务却不干活”的连接自动断开。

业务上避免“用户打开页面就开事务，填完表单再提交”。事务应该在服务端写入时开启，而不是跟随用户交互。`,
          code: `SELECT pid, state, xact_start, query_start, left(query, 80) AS query
FROM pg_stat_activity
WHERE datname = current_database()
  AND xact_start IS NOT NULL
ORDER BY xact_start;`,
          output: `-- 找出开了事务但很久没结束的会话
-- 重点关注 idle in transaction 状态`,
          tip: `[[idle_in_transaction_session_timeout]] 是兜底，不是设计目标。先修业务事务边界。`
        },
        {
          h: '批量写入：分批、排序、控制并发',
          p: `循环单条 INSERT 会产生大量往返和 WAL。用 [[INSERT ... SELECT]] 或 [[COPY]] 批量导入；应用层批量插入每批 500–2000 行，按主键或时间排序，减少随机页写入。

批量更新大表时，一次改百万行会长时间锁表。拆成小批，每批提交，记录进度；失败可重试，不丢已完成的批次。

并发写入同一行会排队。把热点行拆开（分片计数）、用队列串行化、或减少事务持有时间；不要靠加大连接池解决锁竞争。`,
          code: `-- 分批更新，每批 1000 行
WITH batch AS (
  SELECT id FROM orders
  WHERE status = 'pending' AND created_at < now() - interval '30 minutes'
  ORDER BY id
  LIMIT 1000
)
UPDATE orders o
SET status = 'closed', closed_at = now()
FROM batch b
WHERE o.id = b.id
RETURNING o.id;`,
          output: `-- 一次只锁 1000 行，提交后继续下一批
-- 避免百万行大事务`,
          tip: `批次大小要压测。太小往返多，太大锁久；1000 行是常见起点，不是固定答案。`
        }
      ],
      points: ['长事务持锁并阻碍 vacuum', '监控 pg_stat_activity 找长事务', '批量写入分批提交，控制每批行数', '锁竞争不能靠加大连接池解决'],
      practice: '把一次 10 万行的订单关闭改成分批 SQL，并写出如何记录已处理批次。'
    }
  ]
});

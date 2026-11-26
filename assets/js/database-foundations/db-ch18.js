window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch18',
  part: 5,
  number: '18',
  title: '缓存、备份与数据安全',
  summary: '缓存让读更快，也会让数据短暂不一致；备份决定灾难后能不能恢复；权限与加密决定数据会不会被拿走。三者都是“上线之后”才真正考验工程能力。',
  goals: ['设计 cache-aside 与失效策略', '避免穿透、击穿、雪崩', '制定可验证的备份恢复流程', '落实最小权限、审计与敏感字段保护'],
  source: 'Redis 文档；PostgreSQL 16 备份恢复；OWASP',
  lessons: [
    {
      id: 'db-18-1',
      title: '18.1 Redis 缓存与一致性',
      minutes: 60,
      lead: '缓存不是“把查询结果塞 Redis”这么简单。缓存键怎么定、失效什么时候删、数据库更新后旧值怎么办，决定用户看到的是快还是错。',
      source: 'Redis 文档；缓存设计实践',
      sections: [
        {
          h: 'cache-aside：读时回填，写时删除',
          p: `最常用模式是 **cache-aside**：读请求先查 Redis，未命中查数据库，再写回缓存；写请求先更新数据库，再删除缓存（不是更新缓存）。

为什么删除而不是更新？并发写和读回填可能把旧值写回；删除让下一次读重新加载，减少长期不一致。删除失败要有重试或延迟双删，不能静默吞掉。

缓存键包含资源版本和维度：[[course:detail:v2:42]]。版本变化时旧键自然失效；不要把所有课程塞进一个巨大 JSON。`,
          code: `# 读
value = redis.get("course:detail:v2:42")
if value is None:
    row = db.query_course(42)
    redis.setex("course:detail:v2:42", 300, json(row))
    return row
return json.loads(value)

# 写
db.update_course(42, data)
redis.delete("course:detail:v2:42")`,
          output: `-- 读未命中回填，TTL 300 秒
-- 写后删除缓存，下一次读重新加载`,
          tip: `先更新数据库再删缓存是常见顺序；反过来会出现“删了缓存但数据库更新失败”的脏读。`
        },
        {
          h: '穿透、击穿、雪崩',
          p: `**穿透**：查不存在的数据，缓存永远不命中，每次都打数据库。解决：缓存空值（短 TTL）、布隆过滤器、参数校验。

**击穿**：热点键过期瞬间，大量请求同时回源。解决：互斥锁/单飞、逻辑过期 + 后台刷新、随机 TTL。

**雪崩**：大量键同时过期或 Redis 宕机，数据库瞬间被打满。解决：TTL 加随机抖动、多级缓存、限流降级、Redis 高可用。

缓存是性能层，不是真相层。数据库不可用时，缓存可以兜底读，但不能让写也绕过去。`,
          code: `-- 缓存空值，短 TTL，防止穿透
SET course:detail:v2:999 "" EX 60

-- 分布式锁，防止击穿
SET lock:course:42 token NX EX 10
-- 拿到锁的请求回源，其他请求短暂等待/返回旧值`,
          output: `-- 不存在课程缓存空字符串 60 秒
-- 同一个热点键只让一个请求回源`,
          tip: `缓存空值要区分“不存在”和“缓存故障”。Redis 挂了不能把所有请求都当成不存在。`
        }
      ],
      points: ['cache-aside 读回填、写删除', '删除缓存比更新缓存更安全', '穿透缓存空值，击穿加锁，雪崩抖动 TTL', '缓存不是真相层'],
      practice: '为一个课程详情接口设计缓存键、TTL、更新后的失效流程，并说明如何防击穿。'
    },
    {
      id: 'db-18-2',
      title: '18.2 备份、恢复与 PITR',
      minutes: 60,
      lead: '备份不是“每天 cp 一份”。没验证过恢复的备份等于没有备份；PITR 能把数据库恢复到误删前的某一秒。',
      source: 'PostgreSQL 16 文档 · Backup and Restore',
      sections: [
        {
          h: '逻辑备份与物理备份',
          p: `[[pg_dump]] 导出 SQL/自定义格式，适合单库迁移、小数据量；[[pg_dumpall]] 含角色和全局对象。逻辑备份可跨版本、可选择性恢复，但大库慢。

物理备份复制数据目录/WAL，适合大库和快速恢复；[[pg_basebackup]] 做基础备份，配合 WAL 归档做 PITR。物理备份与版本、架构绑定，不能随便跨大版本。

备份要异地/异账户保存，加密，限制访问。只存一份在同一个云账号，遇到账号被封或误删，等于没有。`,
          code: `# 逻辑备份
pg_dump -Fc -d learn -f /backup/learn-$(date +%F).dump

# 恢复
pg_restore -d learn_restore /backup/learn-2026-11-27.dump

# 物理基础备份
pg_basebackup -D /backup/base -Ft -z -P -X stream`,
          output: `-- -Fc 自定义格式，支持并行恢复
-- pg_basebackup 产出 tar + WAL`,
          tip: `[[pg_dump]] 不加 [[-Fc]] 时是纯 SQL，恢复慢且不能并行。生产备份优先自定义格式。`
        },
        {
          h: '恢复演练与 PITR',
          p: `备份必须定期演练：在隔离环境恢复，校验行数、关键表、约束和索引。恢复耗时也是指标；大库恢复几小时，RTO 是否可接受？

PITR 需要基础备份 + 连续 WAL 归档。误删表后，恢复到删除前的时间点，再导出数据补回生产。[[recovery_target_time]] 要精确到秒，且知道时区。

备份保留策略按合规和成本定：日备、周备、月备；WAL 归档保留足够覆盖恢复窗口。删除旧备份前确认新备份可用。`,
          code: `# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /archive/wal/%f'

# recovery.conf / postgresql.conf
restore_command = 'cp /archive/wal/%f %p'
recovery_target_time = '2026-11-27 10:30:00+08'`,
          output: `-- WAL 连续归档后可恢复到指定时间点
-- 恢复目标时间要早于误操作`,
          tip: `PITR 不是“回到过去”按钮。恢复后要校验数据，并把新写入补回，否则会丢恢复点之后的正常业务。`
        }
      ],
      points: ['逻辑备份适合迁移，物理备份适合大库', '备份要异地、加密、限制权限', '没演练过的备份不可信', 'PITR = 基础备份 + WAL 归档'],
      practice: '为一个 50GB 数据库制定备份计划：频率、保留、异地、恢复演练和 RTO。'
    },
    {
      id: 'db-18-3',
      title: '18.3 权限、审计与敏感数据',
      minutes: 55,
      lead: '数据库账号不应该共用 root。应用、迁移、只读报表、备份各用各的账号，权限最小化；敏感字段加密、脱敏、审计，缺一不可。',
      source: 'PostgreSQL 16 文档 · Roles；OWASP 数据保护',
      sections: [
        {
          h: '角色分离与最小权限',
          p: `应用账号只拥有业务表的 SELECT/INSERT/UPDATE/DELETE，不给 SUPERUSER、不给建库建角色。迁移账号有 DDL 权限，但只在部署时使用。报表账号只读，最好连只读副本。

[[GRANT]] 按对象授予，不要 [[GRANT ALL ON DATABASE]]。撤销默认 [[PUBLIC]] 权限，避免新表自动对所有人开放。

生产数据库不暴露公网端口；只允许应用网段/跳板机访问，启 TLS。连接串、密码放密钥管理，不进 Git、不进前端。`,
          code: `CREATE ROLE app_rw LOGIN PASSWORD '***';
GRANT CONNECT ON DATABASE learn TO app_rw;
GRANT USAGE ON SCHEMA public TO app_rw;
GRANT SELECT, INSERT, UPDATE, DELETE
  ON ALL TABLES IN SCHEMA public TO app_rw;
REVOKE ALL ON DATABASE learn FROM PUBLIC;`,
          output: `-- 应用账号只能读写业务表
-- 不能建库、不能改结构`,
          tip: `新表不会自动继承旧 GRANT。迁移后要重新授权，或用 [[ALTER DEFAULT PRIVILEGES]]。`
        },
        {
          h: '敏感字段：少存、加密、脱敏、审计',
          p: `能不存就不存：密码只存哈希（Argon2/bcrypt），不存明文；支付卡号不落库，用支付平台 token；身份证号如非必要不存完整值。

必须存时：字段级加密（应用层加密或数据库 TDE），密钥与数据分离；查询用盲索引/哈希，不要为了搜索把明文复制到日志。

日志和审计要脱敏：邮箱、手机号打码，token/密码绝不进日志。访问敏感数据要有审计记录，谁在何时查了哪条。`,
          code: `-- 密码哈希示例（应用层完成，不存明文）
UPDATE users
SET password_hash = crypt('user-password', gen_salt('bf'))
WHERE id = 42;

-- 查询时验证
SELECT id FROM users
WHERE id = 42
  AND password_hash = crypt('user-password', password_hash);`,
          output: `-- crypt/gen_salt 需要 pgcrypto 扩展
-- 生产更推荐应用层 Argon2id`,
          tip: `[[crypt]] 的 bcrypt 有长度限制；新项目优先 Argon2id，并设置合适的成本参数。`
        }
      ],
      points: ['应用、迁移、报表、备份角色分离', '应用账号不给 SUPERUSER/DDL', '敏感数据少存、加密、脱敏、审计', '密码只存哈希，不存明文'],
      practice: '为一个课程社区设计 4 个数据库角色和权限清单，并列出 3 个必须脱敏的字段。'
    }
  ]
});

window.DATABASE_COURSE_CHAPTERS = window.DATABASE_COURSE_CHAPTERS || [];
window.DATABASE_COURSE_CHAPTERS.push({
  id: 'db-ch12',
  part: 3,
  number: '12',
  title: '业务建模：用户、订单与状态',
  summary: '业务表不是字段堆叠，而是规则落地。用户权限、订单支付、软删除、审计和时间字段，每一个都对应并发、合规或可追溯的真实问题。',
  goals: ['设计用户、角色、权限表', '为订单与支付画状态机', '正确使用软删除和审计日志', '统一时间字段与时区'],
  source: '数据库设计实践；PostgreSQL 16 文档',
  lessons: [
    {
      id: 'db-12-1',
      title: '12.1 用户、角色与权限',
      minutes: 55,
      lead: '“管理员能删课，普通用户不能”这种规则，不应该散落在每个接口的 if 里。用角色、权限和资源关系把它落成可查询的数据。',
      source: 'RBAC 实践；PostgreSQL 外键与唯一约束',
      sections: [
        {
          h: 'RBAC 的最小四张表',
          p: `用户 [[users]]、角色 [[roles]]、权限 [[permissions]]，以及用户-角色、角色-权限的连接表。权限用稳定编码，比如 [[course:read]]、[[course:write]]，不要用中文名称做判断。

用户可以有多个角色，角色可以有多个权限。接口鉴权时先查用户角色，再查角色权限，最后判断当前资源是否允许。复杂系统还需要资源级权限，比如“只能管理自己创建的课程”，那是另一层。

角色不要直接存成用户表的一个字符串。一个用户可能需要“教师 + 审核员”两个角色，字符串无法表达组合。`,
          code: `CREATE TABLE roles (
  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  code text NOT NULL UNIQUE
);

CREATE TABLE role_permissions (
  role_id       bigint NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id bigint NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id bigint NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);`,
          output: `-- 用户和角色、角色和权限都是多对多
-- 权限编码稳定，展示名称另存`,
          tip: `权限编码一旦对外使用就不要改。改编码等于让所有旧 token、缓存和前端判断失效。`
        },
        {
          h: '资源级权限与越权检查',
          p: `“能写课程”不等于“能写任意课程”。教师只能改自己创建的课程，需要 [[courses.owner_id]] 或单独的授权表。查询时同时校验角色和资源归属，不能只查角色。

越权常见于详情接口：列表接口做了权限，详情接口忘了。所有按 ID 取资源的接口都要重新校验，不能假设“列表能看，详情就能看”。

把权限判断写成可测试的函数或 SQL，不要在控制器里复制十遍。权限失败返回 403，资源不存在返回 404，不要用 403 掩盖不存在，反之亦然，按产品安全策略统一。`,
          code: `SELECT c.id, c.title
FROM courses c
WHERE c.id = $1
  AND c.owner_id = $2
  AND EXISTS (
    SELECT 1
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = $2 AND p.code = 'course:write'
  );`,
          output: `-- 只有课程所有者且具备写权限时才返回
-- 否则查询为空，接口返回 403/404`,
          tip: `不要只在前端隐藏按钮。前端隐藏是体验，后端校验才是安全。`
        }
      ],
      points: ['RBAC 用用户、角色、权限和连接表', '权限编码稳定，角色可组合', '资源级权限要校验归属', '详情接口必须重新鉴权'],
      practice: '为课程社区设计 3 个角色、6 个权限，并写出“教师只能改自己的课程”的校验 SQL。'
    },
    {
      id: 'db-12-2',
      title: '12.2 订单、支付与状态机',
      minutes: 60,
      lead: '订单状态不是随便改的字符串。待支付、已支付、已退款、已关闭之间有合法迁移；支付回调可能重复、乱序、失败。数据库要能扛住这些。',
      source: '支付系统设计实践；PostgreSQL 事务',
      sections: [
        {
          h: '状态机：只允许合法迁移',
          p: `订单状态至少包括 [[pending]]、[[paid]]、[[refunded]]、[[closed]]。合法迁移：pending → paid → refunded；pending → closed；paid 不能回到 pending。状态字段用 [[CHECK]] 或字典表约束。

每次迁移都要记录 [[order_status_history]]：从什么状态、到什么状态、谁触发、外部流水号、时间。审计和排查退款争议都靠它。

支付回调必须幂等。同一个 [[provider_txn_id]] 重复到达时，只处理一次；用唯一约束或“已处理”记录挡住重复。回调乱序时，以支付平台的最终状态为准，不要盲信本地顺序。`,
          code: `CREATE TABLE orders (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id      bigint NOT NULL REFERENCES users(id),
  status       text NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'paid', 'refunded', 'closed')),
  total_cents  integer NOT NULL CHECK (total_cents >= 0),
  created_at   timestamptz NOT NULL DEFAULT now(),
  paid_at      timestamptz,
  closed_at    timestamptz
);

CREATE UNIQUE INDEX orders_provider_txn_unique
  ON orders (provider_txn_id)
  WHERE provider_txn_id IS NOT NULL;`,
          output: `-- 状态受 CHECK 约束；外部流水号唯一，挡住重复回调`,
          tip: `用 [[CHECK]] 约束状态时，每次新增状态都要迁移。状态经常变就用状态字典表 + 外键。`
        },
        {
          h: '金额、幂等与对账',
          p: `金额用整数分，订单总额 = 商品小计 + 税 + 运费 - 折扣，所有计算在数据库或应用层用整数完成。不要用浮点，也不要把“优惠后价格”只存在前端。

支付成功后的入账要在事务里完成：更新订单状态、写支付记录、写权益/报名记录。任何一步失败都回滚，避免“钱付了但课没开”。

对账是最后防线：每天用支付平台账单和本地 [[payments]] 比对，找出金额不一致、状态不一致、缺失流水。对账任务要可重跑、可告警。`,
          code: `BEGIN;

UPDATE orders
SET status = 'paid', paid_at = now(), provider_txn_id = $1
WHERE id = $2 AND status = 'pending';

INSERT INTO payments (order_id, provider, amount_cents, paid_at, raw_id)
VALUES ($2, 'stripe', $3, now(), $1);

INSERT INTO enrollments (user_id, course_id, status)
SELECT o.user_id, oi.course_id, 'active'
FROM orders o
JOIN order_items oi ON oi.order_id = o.id
WHERE o.id = $2
ON CONFLICT (user_id, course_id) DO NOTHING;

COMMIT;`,
          output: `-- 状态、支付、报名在同一个事务里完成
-- 任一步失败全部回滚`,
          tip: `外部回调不要在数据库事务里做网络请求。先落库、再异步处理，避免长事务和超时。`
        }
      ],
      points: ['订单状态用状态机约束合法迁移', '状态历史表用于审计和争议排查', '支付回调必须幂等，外部流水号唯一', '入账、支付、权益在同一事务完成'],
      practice: '画一个订单状态机，写出 pending→paid 的事务 SQL，并说明如何挡住重复回调。'
    },
    {
      id: 'db-12-3',
      title: '12.3 软删除、审计与时间字段',
      minutes: 55,
      lead: '“删除”在业务里往往不是真的删。软删除保留历史，但也带来唯一约束、查询遗漏和权限问题；审计日志则回答“谁在什么时候改了什么”。',
      source: 'PostgreSQL 部分索引；审计日志实践',
      sections: [
        {
          h: '软删除的落法与坑',
          p: `软删除用 [[deleted_at timestamptz]]，查询默认加 [[deleted_at IS NULL]]。不要用 [[is_deleted boolean]] 再加一个删除时间，两个字段会不同步；一个时间字段既能判断又能排序。

坑一：唯一约束仍然占用。用户软删除后，同一邮箱不能重新注册；用部分唯一索引 [[WHERE deleted_at IS NULL]] 解决。坑二：所有查询都要记得过滤，漏一处就会把已删除数据带出来。可以用视图或 ORM 默认 scope，但要有逃生口。

物理删除适合日志、临时文件和合规要求删除的数据。核心业务记录通常软删除 + 归档，不是直接 DELETE。`,
          code: `ALTER TABLE courses ADD COLUMN deleted_at timestamptz;

CREATE UNIQUE INDEX courses_slug_active_unique
  ON courses (slug)
  WHERE deleted_at IS NULL;

SELECT id, title
FROM courses
WHERE deleted_at IS NULL AND published = true;`,
          output: `-- 软删除后 slug 可以重新使用
-- 查询默认排除已删除课程`,
          tip: `软删除不是“永不删除”。设置归档策略，否则表和索引会越来越大，查询越来越慢。`
        },
        {
          h: '审计日志与时间字段统一',
          p: `审计日志记录 [[actor_id]]、[[action]]、[[resource_type]]、[[resource_id]]、[[before]]、[[after]]、[[created_at]]。不要只记“更新了”，要记改了哪个字段、旧值新值是什么。

审计表只追加，不更新；权限上普通用户不可写。敏感字段（密码、token）不要进日志，或脱敏后存。审计日志本身也要备份和保留期限。

时间字段统一用 [[created_at]]、[[updated_at]]、[[deleted_at]]，全部 [[timestamptz]]。[[updated_at]] 由触发器或应用在每次写入时更新，不能靠数据库默认值自动变。`,
          code: `CREATE TABLE audit_logs (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_id    bigint REFERENCES users(id) ON DELETE SET NULL,
  action      text NOT NULL,
  resource    text NOT NULL,
  resource_id text NOT NULL,
  before_data jsonb,
  after_data  jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_resource_idx
  ON audit_logs (resource, resource_id, created_at DESC);`,
          output: `-- 审计记录可按资源追溯
-- 操作者注销后置空，但日志保留`,
          tip: `[[updated_at]] 不会自动更新。PostgreSQL 没有内置“ON UPDATE”，要用触发器或应用层显式赋值。`
        }
      ],
      points: ['软删除用一个 deleted_at，不额外加布尔字段', '软删除与唯一约束冲突用部分唯一索引', '审计日志只追加，记录前后值', '时间字段统一 timestamptz，updated_at 显式维护'],
      practice: '为 courses 表加软删除，并写出部分唯一索引和默认查询；再设计一张审计日志表。'
    }
  ]
});

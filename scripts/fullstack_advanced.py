#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""50 课全栈生产专修：每个科目第 11 章（数据库第 20 章）5 课。"""


def L(title, hook, lab, output, tip, deliver):
    return {
        'title': title,
        'hook': hook,
        'lab': lab.strip('\n'),
        'output': output.strip('\n'),
        'tip': tip,
        'deliver': deliver,
    }


ADVANCED = {
    'foundation': {
        'title': '生产发布与仓库治理',
        'summary': '仓库能提交不等于能发布。这一章把依赖边界、提交门禁、版本与变更日志、可回滚制品和事故运行手册连成一条可执行的发布链。',
        'part_title': '发布与治理',
        'part_note': 'monorepo 边界、质量门、语义化版本、制品回滚与 runbook',
        'goals': [
            '能画出 apps/packages 的依赖图，并让 CI 只构建受影响包。',
            '能让类型错误在提交前失败，而不是在发布后才发现。',
            '能用 changeset 生成版本、CHANGELOG 和 tag。',
            '能用一个脚本完成发布、健康检查和五分钟回滚。',
        ],
        'project': '课程社区仓库',
        'bridge': '把这一章接进课程社区：发布不是“把代码传上去”，而是让每次变更都有边界、有证据、有退路。',
        'lessons': [
            L('11.1 Monorepo 的边界与依赖图',
              '单仓库不等于单包。没有依赖边界，任何一个小改动都会触发全量构建，最后没人知道哪个包该发版。',
              """course-community/
  apps/web
  apps/api
  packages/ui
  packages/config
pnpm-workspace.yaml

pnpm -r --depth 0 ls
pnpm --filter @course/web... build""",
              """@course/web
@course/api
@course/ui
@course/config
# --filter ... 只构建 web 及其依赖""",
              '先画依赖图，禁止 app 直接引用另一个 app；共享能力下沉到 packages。',
              '交付一张依赖图，并让 CI 只构建受影响包。'),
            L('11.2 提交前的质量门',
              '提交门禁不是“多一道麻烦”，而是把最便宜的错误拦在最便宜的阶段。慢测试放 CI，快检查放本地。',
              """# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: typecheck
        name: typecheck
        entry: pnpm -r typecheck
        language: system
        pass_filenames: false
      - id: lint
        name: lint
        entry: pnpm -r lint --since HEAD
        language: system
        pass_filenames: false""",
              """typecheck................................Passed
lint.....................................Passed
[main 7db676d] feat: add course progress""",
              '钩子只做快检查；全量测试、E2E 和构建放 CI，否则大家会用 --no-verify 绕过。',
              '故意提交一个类型错误，确认 commit 被拦下并记录耗时。'),
            L('11.3 语义化版本与变更日志',
              '版本号不是装饰。它告诉调用方这次是修 bug、加功能还是破坏兼容；没有变更日志，升级只能靠猜。',
              """pnpm add -Dw @changesets/cli
pnpm changeset
# 选择 minor，描述：新增课程进度 API
pnpm changeset version
git add .
git commit -m "chore: release v1.4.0"
git tag v1.4.0""",
              """🦋  What kind of change is this? minor
🦋  What is the summary? add course progress API
All files have been updated.
v1.4.0""",
              '版本跟发布单元走，不要给每个内部包都单独发版；破坏性变更必须写 BREAKING CHANGE。',
              '为一个 feat 生成 minor 版本、CHANGELOG 和 git tag。'),
            L('11.4 构建制品与可回滚发布',
              '发布脚本最重要的不是“成功时做什么”，而是“失败时怎么退回去”。软链切换比重新构建快得多。',
              """#!/usr/bin/env bash
set -euo pipefail
SHA=$(git rev-parse --short HEAD)
mkdir -p releases/$SHA
tar -czf releases/$SHA/app.tgz dist
PREV=$(readlink current || true)
ln -sfn releases/$SHA current
if ! curl -fsS http://127.0.0.1:8080/healthz; then
  ln -sfn "$PREV" current
  systemctl reload course-api
  exit 1
fi""",
              """current -> releases/7db676d
healthz: ok
# 失败时自动恢复上一版""",
              '先保存 current 指针再切换；回滚不是重新构建，而是把流量切回已验证的制品。',
              '发布脚本在健康检查失败时自动回滚，并留下日志。'),
            L('11.5 事故复盘与运行手册',
              '事故现场最缺的不是技术，而是下一步做什么。运行手册把“慌”变成一组可执行的检查。',
              """# INC-20261127 API 504
影响：课程列表 5 分钟超时
时间线：09:12 告警 → 09:15 回滚 → 09:20 恢复
根因：连接池耗尽（pool=10，等待队列 200）
行动：pool=20→50；增加等待队列指标；补压测
复盘：只写事实、影响、根因、行动和负责人""",
              """severity: P2
status: resolved
follow-up: 3 actions / 2 owners / due 2026-12-04""",
              '复盘只写事实和行动，不写追责；每个行动要有负责人和截止日期。',
              '写一页 runbook：告警、检查、回滚、联系人和复盘模板。'),
        ],
    },
    'network': {
        'title': '生产网络排障',
        'summary': '线上“打不开”从来不是一个问题，而是 DNS、TLS、HTTP、代理和超时中的某一层。这一章训练你用证据逐层排除，而不是重启服务。',
        'part_title': '生产排障',
        'part_note': 'DNS 缓存、证书链、HTTP/2/3、反代超时与 Trace',
        'goals': [
            '能用 dig 判断 DNS 是 authoritative、recursive 还是 negative cache 问题。',
            '能用 openssl 检查证书链、SAN 和到期时间。',
            '能解释 HTTP/2 多路复用与 HTTP/3 的差异，并做同 URL 对比。',
            '能从 Nginx 状态码和 Trace 定位 502/504 的上游。',
        ],
        'project': '课程社区的公网入口',
        'bridge': '把这一章接进课程社区：用户看到的是一个页面，背后却是 DNS、TLS、CDN、反代和上游服务五段链路。',
        'lessons': [
            L('11.1 DNS 缓存、TTL 与负缓存',
              '改了解析却没生效，通常不是 DNS 没改，而是某一层缓存还记着旧答案。',
              """dig +trace course.example.com A
dig @1.1.1.1 course.example.com A +noall +answer
dig course.example.com A +ttl
# 观察 TTL、CNAME 和 NXDOMAIN 的负缓存""",
              """course.example.com. 300 IN A 203.0.113.42
;; TTL: 300
;; status: NXDOMAIN (negative TTL 300)""",
              '切解析前先降 TTL；负缓存也会让故障延长，排障要同时问 authoritative 和 recursive。',
              '用三种 resolver 对比同一域名，记录 TTL 和负缓存行为。'),
            L('11.2 证书链、SAN 与 mTLS',
              '浏览器能打开不代表证书链完整。curl、Java 客户端和移动端对中间证书的容忍度并不一样。',
              """openssl s_client -connect course.example.com:443 \\
  -servername course.example.com -showcerts </dev/null 2>/dev/null \\
  | openssl x509 -noout -subject -issuer -dates \\
  -ext subjectAltName""",
              """subject=CN=course.example.com
issuer=C=US, O=Let's Encrypt, CN=R11
notBefore=Nov  1 00:00:00 2026 GMT
notAfter=Jan 30 23:59:59 2027 GMT
X509v3 Subject Alternative Name:
    DNS:course.example.com, DNS:www.course.example.com""",
              '证书链不完整时浏览器可能正常、curl 失败；mTLS 还要检查客户端证书的 CA 和用途。',
              '输出证书链、SAN、到期日，并模拟缺中间证书的失败。'),
            L('11.3 HTTP/2、HTTP/3 与连接复用',
              'HTTP/2 解决应用层队头阻塞，HTTP/3 把传输层也换成了 QUIC；但 UDP 443 被防火墙丢掉时，页面会退化成 h2 或 h1。',
              """curl --http2 -sS -o /dev/null \\
  -w 'http=%{http_version} connect=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer}\\n' \\
  https://course.example.com/api/courses
curl --http3 -sS -o /dev/null -w 'http=%{http_version}\\n' \\
  https://course.example.com/""",
              """http=2 connect=0.041 tls=0.096 ttfb=0.184
http=3
# 若 h3 超时，检查 UDP 443 与 Alt-Svc""",
              'QUIC 走 UDP 443，很多企业防火墙默认丢；Alt-Svc 缓存也会影响回退。',
              '同一 URL 做 h1/h2/h3 对比，解释连接和 TTFB 差异。'),
            L('11.4 反向代理超时与 502/504',
              '502 是上游给了坏响应，504 是上游没在约定时间内响应。只把超时调大，通常只是把故障拖长。',
              """upstream course_api {
  server 127.0.0.1:8080;
  keepalive 32;
}
location /api/ {
  proxy_connect_timeout 3s;
  proxy_read_timeout 15s;
  proxy_next_upstream error timeout http_502;
  add_header X-Upstream $upstream_status always;
}""",
              """GET /api/courses 200 X-Upstream: 200
GET /api/slow 504 X-Upstream: 504
# 上游日志：request took 18.2s""",
              '先看上游耗时和连接池，再决定超时；504 多半是上游慢，不是 Nginx 慢。',
              '用慢接口复现 504，定位到 upstream 时间与连接池。'),
            L('11.5 用 Trace 串起网络证据',
              '一次请求跨网关、服务、数据库和队列，没有 trace id，你只能在不同日志里猜是不是同一件事。',
              """curl -H 'traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01' \\
  https://course.example.com/api/courses/42
rg '4bf92f3577b34da6a3ce929d0e0e4736' /var/log/course-api/*.log""",
              """gateway  span=7d3f 200 18ms
api      span=91ac 200 42ms trace=4bf92f...
db       span=2b10 SELECT courses 12ms""",
              'trace id 要贯穿网关、服务、数据库和异步任务；采样率要能覆盖错误请求。',
              '让一次请求的网关、服务、DB 三段日志共享同一个 trace id。'),
        ],
    },
    'database': {
        'title': '查询计划、复制与容量',
        'summary': '数据库的“慢”有很多种：计划选错、锁等待、复制延迟、分区没剪枝、备份不可恢复。这一章把每种慢都变成可测量的证据。',
        'part_title': '查询、复制与容量',
        'part_note': 'EXPLAIN、MVCC、复制延迟、分区热键与 PITR',
        'goals': [
            '能读懂 EXPLAIN ANALYZE 的 rows、loops、buffers 和 scan 类型。',
            '能复现一次锁等待，并画出事务时间线。',
            '能测量复制延迟，并判断哪些读必须走主库。',
            '能在临时库完成一次 PITR，并校验行数。',
        ],
        'project': '课程社区数据库',
        'bridge': '把这一章接进课程社区：课程列表、报名和进度查询都会在生产数据量下变慢，必须用计划和指标说话。',
        'lessons': [
            L('20.1 EXPLAIN ANALYZE 与索引选择性',
              '加索引之前先看计划。你以为是索引问题，可能只是统计信息过期或排序把索引废掉了。',
              """EXPLAIN (ANALYZE, BUFFERS)
SELECT id, title FROM courses
WHERE status = 'published'
ORDER BY created_at DESC
LIMIT 20;""",
              """Limit  (cost=0.42..18.7 rows=20 width=36)
  ->  Index Scan using courses_status_created_idx on courses
        (actual time=0.031..0.084 rows=20 loops=1)
        Buffers: shared hit=6
Planning Time: 0.120 ms
Execution Time: 0.102 ms""",
              '先看 rows 估算和 actual 差距，再看索引；复合索引的列顺序要匹配过滤和排序。',
              '为慢查询加复合索引，记录 buffers 和执行时间的前后对比。'),
            L('20.2 事务隔离、MVCC 与锁等待',
              '长事务不会“卡住自己”，它会拖住 vacuum、锁住别人，最后让整个库变慢。',
              """BEGIN ISOLATION LEVEL REPEATABLE READ;
SELECT balance FROM accounts WHERE id = 42 FOR UPDATE;
-- 会话 B 同时执行同一行，观察等待
SELECT pid, wait_event_type, wait_event, query
FROM pg_stat_activity WHERE state = 'active';
ROLLBACK;""",
              """pid  wait_event_type  wait_event  query
812  Lock             transactionid  SELECT ... FOR UPDATE
# 会话 B 等待 1.8s 后拿到锁""",
              '锁等待要有 statement_timeout 和死锁日志；不要用长事务包住网络调用。',
              '复现一次锁等待，画出两个事务的时间线和等待事件。'),
            L('20.3 复制延迟与读写分离',
              '刚报名的用户刷新看不到进度，不一定是缓存，可能是读到了还没回放的从库。',
              """SELECT client_addr, state, sent_lsn, replay_lsn,
       pg_wal_lsn_diff(sent_lsn, replay_lsn) AS lag_bytes
FROM pg_stat_replication;
SELECT pg_last_wal_replay_lsn(), now() - pg_last_xact_replay_timestamp();""",
              """client_addr   state     lag_bytes
10.0.1.12     streaming 1,048,576
replay lag: 00:00:02.4""",
              '读写分离要区分“必须读己之写”的请求；报名、支付、进度写后读应回主库。',
              '测量复制延迟，并给关键读请求加主库路由。'),
            L('20.4 分区剪枝与热键',
              '分区不是“表大了就切”。分区键不匹配查询条件，规划器只能扫全部分区。',
              """CREATE TABLE events_2026_11 PARTITION OF events
FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');

EXPLAIN SELECT * FROM events
WHERE created_at >= '2026-11-20'
  AND created_at < '2026-11-21';""",
              """Append  (cost=0.00..12.4 rows=1 width=32)
  ->  Seq Scan on events_2026_11
        Filter: created_at >= ... AND created_at < ...
# 只扫描 1 个分区，pruning 生效""",
              '分区键要匹配主要过滤条件；热键用加盐、拆分或本地缓存分散，不要只加索引。',
              '压测一个热 key，用加盐或拆分把 QPS 分散到多个节点。'),
            L('20.5 备份、PITR 与恢复演练',
              '没演练过的备份等于没有备份。真正要验证的是“能否在指定分钟恢复”，不是“备份文件存在”。',
              """pg_basebackup -h db -D /backup/base -Ft -z -P
# 恢复参数
restore_command = 'cp /archive/%f %p'
recovery_target_time = '2026-11-27 09:15:00+08'
recovery_target_action = 'promote'""",
              """backup size: 18.4 GB
restore target: 2026-11-27 09:15:00+08
row check: courses=1,204 enrollments=38,917
RTO: 14m32s""",
              '备份要覆盖 base backup + WAL 归档；恢复演练记录 RTO/RPO 和校验 SQL。',
              '在临时库恢复到指定分钟，校验关键表行数与业务一致性。'),
        ],
    },
    'backend': {
        'title': '生产后端可靠性',
        'summary': '能返回 200 只是开始。生产后端要处理重复请求、双写不一致、突发流量、滚动发布和线上可观测性。',
        'part_title': '可靠性',
        'part_note': '幂等、Outbox、限流熔断、优雅停机与可观测性',
        'goals': [
            '能用幂等键让重复报名只产生一条记录。',
            '能用 Outbox 避免数据库与消息队列双写不一致。',
            '能设计限流、熔断和降级，并解释 429/503 的边界。',
            '能在滚动发布时做到 0 个 5xx，并用日志、指标、Trace 关联故障。',
        ],
        'project': '课程社区 API',
        'bridge': '把这一章接进课程社区：报名、发布课程和通知都不是单步操作，必须考虑重试、事务和失败恢复。',
        'lessons': [
            L('11.1 幂等键与安全重试',
              '用户点两次、网关重试一次、客户端超时再发一次，同一件事可能到达三次。幂等不是可选优化，是写路径的基本约束。',
              """@PostMapping("/api/enrollments")
public Enrollment enroll(
    @RequestHeader("Idempotency-Key") String key,
    @RequestBody EnrollRequest req) {
  String redisKey = "idem:enroll:" + key;
  if (!redis.setIfAbsent(redisKey, "processing", Duration.ofHours(24))) {
    return repo.findByIdempotencyKey(key).orElseThrow(Conflict::new);
  }
  return repo.saveAndReturn(key, req);
}""",
              """POST /api/enrollments 201 id=E-1008
POST /api/enrollments 200 id=E-1008 (same body)
# 第二次没有新增记录""",
              '幂等键要绑定用户、操作和参数摘要；只绑 key 会被跨用户复用。',
              '重复提交只产生一条报名记录，并返回同一个 ID。'),
            L('11.2 事务边界与 Outbox',
              '在同一事务里写数据库再发消息，是两个系统双写；消息发失败，数据库已经提交，最终一致性就断了。',
              """@Transactional
public void publishCourse(long id) {
  courseRepo.markPublished(id);
  outboxRepo.save(new OutboxEvent("course.published", id));
}

// 独立 poller
SELECT * FROM outbox
WHERE status = 'pending'
ORDER BY id
FOR UPDATE SKIP LOCKED LIMIT 20;""",
              """outbox id=91 event=course.published status=sent
outbox id=92 event=course.published status=sent
# MQ 恢复后继续投递，无丢失""",
              '不要在同一事务里既写库又发 MQ；Outbox 要可重放、可去重，发送失败不能丢事件。',
              '模拟 MQ 宕机，确认事件不丢、恢复后可重放。'),
            L('11.3 限流、熔断与降级',
              '限流不是把用户挡在外面，而是保护核心链路；熔断不是失败，而是快速失败并给出可解释的降级。',
              """@RateLimiter(name = "courseApi", fallbackMethod = "fallback")
public CourseDto get(long id) { return service.get(id); }

public CourseDto fallback(long id, RequestNotPermitted e) {
  return cache.get(id).orElseThrow(
    () -> new ServiceUnavailable("busy, retry later"));
}""",
              """200 OK x 980
429 Too Many Requests x 20
503 busy, retry later x 3
# 缓存命中时降级成功""",
              '限流按用户/租户/接口分层；熔断要看错误率和延迟，不要因为一次超时就全断。',
              '压测触发 429/503，验证缓存命中时降级仍然可用。'),
            L('11.4 优雅停机与连接排空',
              '滚动发布时最容易被忽略的是正在处理的请求：进程被 kill，连接被断，用户看到 502。',
              """server:
  shutdown: graceful
spring:
  lifecycle:
    timeout-per-shutdown-phase: 20s

# K8s
lifecycle:
  preStop:
    exec:
      command: ["sh", "-c", "sleep 5"]""",
              """SIGTERM received
readiness=false
in-flight requests: 0
shutdown complete in 6.2s""",
              '先摘流量再停进程；readiness 失败只是不再接新请求，liveness 失败才会重启。',
              '滚动发布 10 次，确认 0 个 5xx 且日志显示 in-flight 排空。'),
            L('11.5 日志、指标与 Trace 三件套',
              '线上问题不是“没有日志”，而是日志、指标和 Trace 各说各话，无法证明是同一次请求。',
              """Counter enroll = Counter.builder("course_enroll_total")
    .tag("result", "ok").register(registry);

try (var span = tracer.nextSpan().name("enroll").start()) {
  log.info("enroll userId={} courseId={} traceId={}",
      uid, cid, span.context().traceId());
}""",
              """course_enroll_total{result="ok"} 1,204
log traceId=4bf92f... userId=42 courseId=91
span enroll duration=42ms status=ok""",
              '日志、指标、Trace 用同一组业务键关联；错误日志必须带 trace id 和可检索字段。',
              '从一条错误日志跳到对应 trace，再跳到指标峰值。'),
        ],
    },
    'frontend': {
        'title': '性能、状态与交付',
        'summary': '前端上线后会遇到真实网络、真实设备、真实用户。这一章把性能预算、请求缓存、可访问性、缓存策略和灰度发布变成可验收的交付能力。',
        'part_title': '性能与交付',
        'part_note': '性能预算、TanStack Query、可访问性、缓存与灰度',
        'goals': [
            '能给首屏路由设脚本和总字节预算，并让 CI 超预算失败。',
            '能区分组件状态、页面状态和服务端缓存，避免一个 useState 管全局。',
            '能用键盘完成关键流程，并让 axe 关键问题归零。',
            '能设计灰度分桶和错误边界，出错时可回滚。',
        ],
        'project': '课程社区前端',
        'bridge': '把这一章接进课程社区：详情页、报名按钮和移动端列表都会被真实用户反复使用，体验必须能被测量。',
        'lessons': [
            L('11.1 性能预算与 LCP/INP',
              '“感觉挺快”不是验收。性能预算把首屏脚本、图片和总字节写成 CI 门禁，超了就失败。',
              """// lighthouserc.json
{
  "ci": { "collect": { "url": ["http://localhost:4173/"] } },
  "assert": { "assertions": {
    "performance-budget": [
      "script-limit 180kb",
      "total-byte-weight 500kb"
    ]
  }}
}""",
              """script bytes: 172 KB (limit 180 KB) PASS
total bytes: 438 KB (limit 500 KB) PASS
LCP: 1.2s  INP: 84ms""",
              '预算按首屏路由算，不按整站资源算；图片和字体要单独设上限。',
              'CI 超预算时失败，并列出最大的三个资源。'),
            L('11.2 状态归属与请求缓存',
              '把所有数据塞进全局 store，会让刷新、失效和并发请求互相打架；服务端缓存应该有独立生命周期。',
              """const query = useQuery({
  queryKey: ['course', id],
  queryFn: () => api.course(id),
  staleTime: 60_000,
});
const publish = useMutation({
  mutationFn: () => api.publish(id),
  onSuccess: () => queryClient.invalidateQueries({queryKey: ['course', id]}),
});""",
              """GET /api/courses/42 200 (cache hit)
POST /api/courses/42/publication 200
GET /api/courses/42 200 (invalidated, 1 request)""",
              '组件状态、页面状态、服务端缓存分开；mutation 成功后精确失效，不要全量清空。',
              '发布课程后列表和详情同时刷新，且没有重复请求。'),
            L('11.3 可访问性与键盘流程',
              '弹窗只加 aria-label 不够。焦点进入、焦点锁定、Esc 关闭和关闭后还焦点，缺一个都会把键盘用户困住。',
              """<dialog ref={dialogRef} aria-labelledby="confirm-title"
  onKeyDown={trapFocus}>
  <h2 id="confirm-title">确认发布</h2>
  <button onClick={close}>取消</button>
  <button onClick={confirm}>发布</button>
</dialog>""",
              """Tab: 取消 → 发布 → 取消
Esc: closed, focus returned to trigger
axe: 0 critical, 0 serious""",
              '自定义弹窗必须还焦点、锁焦点、支持 Esc；颜色对比和错误提示也要可读。',
              '只用键盘完成一次发布确认，axe 关键问题为 0。'),
            L('11.4 SSR、缓存与登录态',
              'HTML 可以缓存，但登录态不能。把用户信息塞进公共缓存，会把 A 的课程进度发给 B。',
              """Cache-Control: public, max-age=60, stale-while-revalidate=300
ETag: "course-42-v3"

# 私有接口
Cache-Control: private, no-store
Vary: Authorization""",
              """CDN hit: 92%
private /api/me: bypass cache
# 未登录首页与登录态内容分离""",
              '公共 HTML 可缓存，个性化数据放客户端或私有接口；Vary 和 no-store 要写对。',
              '首页 CDN 命中，登录态内容不串用户。'),
            L('11.5 灰度发布与错误边界',
              '灰度不是随机开关，而是稳定分桶、可观测、可回滚。错误边界要把崩溃限制在一个区域，而不是整页白屏。',
              """const canary = useFlag('course_detail_v2', { rollout: 10 });
<ErrorBoundary fallback={<RetryPanel />}>
  <CoursePage />
</ErrorBoundary>""",
              """bucket(user)=7 → v2
bucket(user)=8 → v1
v2 error rate 0.8% > 0.5% → rollback""",
              '灰度按用户稳定分桶，不要每次随机；错误率、延迟和业务指标同时看。',
              '10% 用户走新版本，错误率超阈值自动回滚。'),
        ],
    },
    'api-auth': {
        'title': '契约、身份与接入治理',
        'summary': 'API 一旦被第三方接入，改一个字段就是一次生产事件。这一章把版本化、OIDC、JWT 轮换、对象级权限和 Webhook 幂等做成契约。',
        'part_title': '契约与身份',
        'part_note': '版本化、OIDC PKCE、JWKS 轮换、RBAC/ABAC 与 Webhook',
        'goals': [
            '能用 expand-contract 管理破坏性变更，并用 OpenAPI diff 阻止误合并。',
            '能完成一次 Authorization Code + PKCE 登录，校验 state 和 nonce。',
            '能轮换 JWT 签名 key，同时保证旧 token 平稳过期。',
            '能让 Webhook 验签、防重放、幂等处理。',
        ],
        'project': '课程社区开放 API',
        'bridge': '把这一章接进课程社区：前端、移动端和第三方批改工具都依赖同一套 API，契约必须可演进。',
        'lessons': [
            L('11.1 API 版本化与破坏性变更',
              '不是所有改动都要新版本。先加字段、双写、迁移调用方，最后删旧字段；破坏性变更才开新版本。',
              """GET /api/v1/courses
Deprecation: true
Sunset: Wed, 31 Dec 2026 23:59:59 GMT
Link: <https://course.example.com/api/v2/courses>; rel="successor-version\"""",
              """200 OK
Deprecation: true
Sunset: Wed, 31 Dec 2026 23:59:59 GMT
# OpenAPI diff: 1 breaking change blocked""",
              '先加后删，给调用方迁移窗口；OpenAPI diff 要进 CI，不能靠 review 记忆。',
              'OpenAPI diff 标出 breaking change，并阻止合并。'),
            L('11.2 OAuth2/OIDC 与 PKCE',
              '授权码模式不是把 token 发给前端就完事。state 防 CSRF，PKCE 防授权码截获，nonce 防重放。',
              """GET /authorize?response_type=code&client_id=web
  &redirect_uri=https://course.example.com/callback
  &scope=openid%20profile&state=...&nonce=...
  &code_challenge=...&code_challenge_method=S256

POST /token
grant_type=authorization_code&code=...&code_verifier=...""",
              """302 /callback?code=...&state=...
token: access_token + id_token
state verified, nonce verified, PKCE verified""",
              'state 要一次性、绑定会话；PKCE 的 verifier 不能出现在授权请求里。',
              '完整登录一次，校验 state、nonce 和 code_verifier。'),
            L('11.3 JWT 轮换与撤销',
              'JWT 无状态不等于不能撤销。短 access token + 可轮换 refresh token + JWKS 双 key，才是可运维的方案。',
              """{
  "keys": [
    { "kty": "RSA", "kid": "2026-11", "use": "sig", "n": "...", "e": "AQAB" },
    { "kty": "RSA", "kid": "2026-12", "use": "sig", "n": "...", "e": "AQAB" }
  ]
}""",
              """GET /.well-known/jwks.json 200 (2 keys)
verify kid=2026-11 OK
revoke refresh token → refresh 401""",
              '轮换时旧 key 至少保留一个 access token 生命周期；撤销要落在 refresh token 或服务端黑名单。',
              'JWKS 双 key 并存，撤销 refresh token 后旧 token 失效。'),
            L('11.4 RBAC、ABAC 与对象级权限',
              '登录只证明“你是谁”，不证明“你能看这条数据”。越权往往发生在对象级权限缺失。',
              """@PreAuthorize("hasRole('TEACHER') and #course.ownerId == authentication.principal.id")
public void publish(Course course) { ... }

// 学生访问他人课程
GET /api/enrollments/91 → 403""",
              """teacher publish own course: 200
student read other's enrollment: 403
admin read audit log: 200""",
              '权限检查放服务端方法边界，按 owner/tenant 校验；前端隐藏按钮不是权限。',
              '学生、教师、运营三种身份越权测试全部 403。'),
            L('11.5 Webhook 验签、防重放与幂等',
              'Webhook 是别人主动打你，必须假设会重复、会伪造、会延迟。签名、时间窗和幂等表缺一不可。',
              """POST /webhooks/payment
X-Signature: t=1764216000,v1=hmac_sha256(t + '.' + body)

if abs(now - t) > 300: reject
if not hmac_equals(signature, expected): reject
if event_id already processed: return 200""",
              """valid event → order fulfilled
replay same event → 200, no duplicate
old timestamp → 401""",
              '签名要带时间戳和重放窗口；事件处理要幂等，重复回调不能重复发货。',
              '重放同一事件不重复发货，过期签名被拒绝。'),
        ],
    },
    'testing': {
        'title': '契约、E2E 与质量体系',
        'summary': '测试不是“多写断言”，而是用最合适的层次证明行为。这一章补齐契约测试、E2E 稳定性、性能测试、变异测试和测试数据治理。',
        'part_title': '质量体系',
        'part_note': '契约、E2E、k6、变异测试与 Testcontainers',
        'goals': [
            '能用 Pact 验证前后端契约，并在 provider 改字段时提前失败。',
            '能把 E2E 做到连续 20 次 0 flaky。',
            '能用 k6 给出 P95、错误率和吞吐，并定位首个瓶颈。',
            '能用变异测试判断断言是否真的有效。',
        ],
        'project': '课程社区测试体系',
        'bridge': '把这一章接进课程社区：报名、进度和发布是跨前后端的链路，单测覆盖不了契约和真实浏览器。',
        'lessons': [
            L('11.1 契约测试：前后端的共同语言',
              '前端 mock 通过、后端单测通过，联调仍然 500，说明缺的是契约测试。',
              """@Pact(consumer = "course-web", provider = "course-api")
public RequestResponsePact course(PactDslWithProvider builder) {
  return builder.given("course 42 exists")
    .uponReceiving("get course")
    .path("/api/courses/42").method("GET")
    .willRespondWith().status(200)
    .body(new PactDslJsonBody().integerType("id", 42)
      .stringType("title", "Backend")).toPact();
}""",
              """consumer test: PASS
provider verify: PASS
# provider 删除 title 字段 → consumer 契约失败""",
              '契约测试验证双方约定，不替代业务单测；契约要进 CI，不能只本地跑。',
              'provider 改字段时 consumer 契约先失败。'),
            L('11.2 E2E 稳定性：定位器、数据与重试',
              'E2E 最大的成本不是写，而是 flaky。sleep、共享数据和顺序依赖会把 CI 变成彩票。',
              """test('enroll persists', async ({ page }) => {
  await page.goto('/courses/42');
  await page.getByRole('button', { name: '报名' }).click();
  await expect(page.getByText('已报名')).toBeVisible();
  await page.reload();
  await expect(page.getByText('已报名')).toBeVisible();
});""",
              """20/20 passed
average 8.4s
0 flaky""",
              '用 role/name 定位，别用 sleep；每个测试自建数据，失败时保留 trace 和截图。',
              'E2E 连续跑 20 次 0 flaky，失败可复现。'),
            L('11.3 性能与容量测试',
              '压测不是把 VU 拉满，而是找到饱和点：CPU、连接池、锁、队列和下游超时。',
              """import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
  stages: [{ duration: '1m', target: 50 }, { duration: '2m', target: 50 }],
  thresholds: { http_req_duration: ['p(95)<300'] },
};
export default function () {
  const r = http.get('https://course.example.com/api/courses');
  check(r, { 'status 200': (x) => x.status === 200 });
  sleep(1);
}""",
              """http_req_duration p95=286ms
http_req_failed 0.42%
throughput 48.7 req/s
# 连接池等待在 50 VU 时超过 100ms""",
              '压测要区分冷启动、缓存命中和写路径；看 P95/P99、错误率和资源饱和。',
              '输出 P95、错误率、吞吐，并定位一个瓶颈。'),
            L('11.4 变异测试与覆盖率质量',
              '覆盖率只说明代码被执行过，不说明断言能发现错误。变异测试会故意改坏代码，看测试是否报警。',
              """<plugin>
  <groupId>org.pitest</groupId>
  <artifactId>pitest-maven</artifactId>
  <configuration>
    <targetClasses><param>com.course.*</param></targetClasses>
    <mutationThreshold>70</mutationThreshold>
  </configuration>
</plugin>""",
              """Generated 214 mutations
Killed 168
Mutation score 78% (threshold 70%)""",
              '覆盖率是“走到了”，变异分数才是“断言有效”；等价变异要写说明，不要盲目追 100%。',
              '变异分数 ≥ 70%，并为剩余等价变异写说明。'),
            L('11.5 Testcontainers 与测试数据治理',
              '测试共用开发库，迟早会互相污染；用容器起真实 PostgreSQL，每次测试都是干净环境。',
              """@Testcontainers
class CourseRepositoryTest {
  @Container
  static PostgreSQLContainer<?> db =
      new PostgreSQLContainer<>("postgres:16");

  @DynamicPropertySource
  static void props(DynamicPropertyRegistry r) {
    r.add("spring.datasource.url", db::getJdbcUrl);
  }
}""",
              """container postgres:16 started in 4.2s
schema migrated
test suite 18/18 passed
container removed""",
              '测试库每次新建 schema，禁止共用开发库；镜像版本固定，清理策略明确。',
              '本地和 CI 同一镜像，测试可并行且无残留。'),
        ],
    },
    'devops': {
        'title': '交付、运行与容量',
        'summary': '部署成功不等于运行可控。这一章补齐 IaC、K8s 探针、金丝雀、密钥管理和 SLO 告警。',
        'part_title': '交付与运行',
        'part_note': 'Terraform、K8s、金丝雀、密钥与 SLO',
        'goals': [
            '能用 Terraform plan 发现 drift，并让变更可审阅。',
            '能配置 readiness/liveness，滚动发布 0 个 5xx。',
            '能用金丝雀按比例放量，并在错误率超阈值时回滚。',
            '能用 SLO 和错误预算设计告警，而不是每个指标都响。',
        ],
        'project': '课程社区生产环境',
        'bridge': '把这一章接进课程社区：从单机 Docker 走到可重复、可观测、可回滚的云上运行。',
        'lessons': [
            L('11.1 IaC 与环境一致性',
              '手改控制台会让环境变成“只有某个人知道的配置”。IaC 的价值是 plan 可审阅、state 可回滚。',
              """module "api" {
  source   = "./modules/service"
  image    = "ghcr.io/acme/course-api:${var.tag}"
  replicas = 2
}

terraform plan -out=tfplan
terraform apply tfplan""",
              """Plan: 2 to add, 1 to change, 0 to destroy
drift check: 0 resources
apply: 1 module updated""",
              'state 锁和 plan diff 是安全边界；不要把密钥写进 tfvars 提交。',
              'plan 只包含预期变更，drift 检查为零。'),
            L('11.2 K8s 探针、资源与滚动发布',
              'readiness 失败只是摘流量，liveness 失败才重启；两者配反，会把启动慢的服务反复杀掉。',
              """readinessProbe:
  httpGet: { path: /healthz, port: 8080 }
  periodSeconds: 5
livenessProbe:
  httpGet: { path: /livez, port: 8080 }
  periodSeconds: 10
resources:
  requests: { cpu: 250m, memory: 512Mi }
  limits: { memory: 1Gi }""",
              """rollout: 3 replicas
ready: 3/3
5xx during rollout: 0
startup 18s < readiness failureThreshold""",
              'readiness 检查依赖是否就绪，liveness 只检查进程是否卡死；启动慢用 startupProbe。',
              '滚动发布时 0 个 5xx，启动慢不会杀 pod。'),
            L('11.3 蓝绿与金丝雀',
              '全量发布是赌博。金丝雀先放 10%，看错误率、延迟和业务指标，再决定是否继续。',
              """annotations:
  nginx.ingress.kubernetes.io/canary: "true"
  nginx.ingress.kubernetes.io/canary-weight: "10"
# 10% → 50% → 100%，任一步超阈值回滚""",
              """canary 10%: error 0.2%, p95 180ms
canary 50%: error 0.3%, p95 190ms
promote 100%""",
              '金丝雀看错误率/延迟，不只看请求成功；放量要自动化，不要手工改权重。',
              '10%→50%→100%，任一步超阈值自动回滚。'),
            L('11.4 密钥与配置管理',
              '密钥进 Git 就等于泄露，即使仓库后来删了，历史里还在。加密、注入、轮换要成为流程。',
              """sops:
  age:
    recipient: age1...
  encrypted_regex: ^(data|stringData)$

# 运行时注入
envFrom:
  - secretRef: { name: course-api-secrets }""",
              """secret decrypted at deploy only
image contains no credentials
rotation: db password changed, pods rolled""",
              '密钥进 Git 必须加密，运行时注入，不写镜像；轮换要不需要重建镜像。',
              '轮换数据库密码无需重建镜像，滚动后连接正常。'),
            L('11.5 SLO、告警与容量',
              '告警太多等于没有告警。用 SLO 和错误预算决定什么时候叫醒人，什么时候只记录。',
              """sum(rate(http_requests_total{status=~"5.."}[5m]))
/
sum(rate(http_requests_total[5m]))

# SLO: 99.9% availability / 30d
# burn rate > 14.4 → page""",
              """availability 99.94%
error budget remaining 62%
page: burn rate 0.8 (no page)
ticket: capacity at 71%""",
              '告警绑 SLO 和错误预算；容量按峰值和增长趋势预留，不要等打满。',
              '定义 99.9% 可用性，演练一次预算耗尽告警。'),
        ],
    },
    'security-performance': {
        'title': '供应链、越权与容量审计',
        'summary': '安全和性能都要用证据说话：制品有没有签名、对象级权限是否闭合、压测瓶颈在哪里、缓存一致性是否成立。',
        'part_title': '审计与容量',
        'part_note': 'SBOM/签名、IDOR、k6/Profiling、缓存与 ADR',
        'goals': [
            '能为构建产物生成 SBOM，并验证签名。',
            '能用学生/教师/运营身份做对象级越权测试。',
            '能用压测和 Profiling 找到首个饱和点。',
            '能设计缓存一致性方案，并写出架构决策的代价。',
        ],
        'project': '课程社区安全与容量',
        'bridge': '把这一章接进课程社区：上线前的安全审计和容量评估，决定系统能不能承受真实用户和攻击。',
        'lessons': [
            L('11.1 供应链安全与制品签名',
              '漏洞扫描不是只扫依赖。你需要知道制品里到底有什么，并且能证明线上跑的就是你构建的那个。',
              """syft dir:. -o spdx-json > sbom.json
cosign sign --key cosign.key \\
  ghcr.io/acme/course-api@sha256:...
cosign verify --key cosign.pub \\
  ghcr.io/acme/course-api@sha256:...""",
              """SBOM: 412 packages
signature: verified
unsigned image: rejected by admission""",
              'SBOM 要跟制品一起存，漏洞扫描才有对象；签名要进部署门禁，不能只做一次演示。',
              '构建产物有 SBOM + 签名，CI 阻止未签名镜像。'),
            L('11.2 对象级越权与审计',
              '登录用户访问别人的报名记录，如果只校验 user_id 是否为空，就会得到 200。越权测试要按资源矩阵跑。',
              """curl -i -H "Authorization: Bearer $STUDENT" \\
  https://course.example.com/api/enrollments/91
# 期望 403，不是 200
# 矩阵：student/teacher/admin × own/other/tenant""",
              """student own: 200
student other: 403
teacher other course: 403
admin audit: 200 + audit log""",
              '对象级权限按 owner/tenant 校验，不能只校验登录；拒绝时日志要留 actor/resource。',
              '学生访问教师/他人资源全部 403，日志有审计。'),
            L('11.3 压测、Profiling 与首个瓶颈',
              '平均延迟会骗人。压测要看 P95/P99、错误率和资源饱和，再用 Profiling 找 CPU、锁或连接池。',
              """k6 run --vus 50 --duration 2m load.js
pidstat -p $(pgrep -f course-api) -u -r -d 1
# Java: async-profiler / JFR
# Node: node --prof / pprof""",
              """p95 480ms at 50 VU
CPU 92%, runqueue 8
DB connection wait 120ms
# 首个瓶颈：连接池，不是 CPU""",
              '先找饱和点：CPU、连接池、DB 锁、下游超时；不要只盯平均延迟。',
              '输出容量报告：吞吐、P95、首个瓶颈和扩容建议。'),
            L('11.4 缓存一致性、穿透与雪崩',
              '缓存不是“加个 Redis”。击穿、穿透、雪崩和双写不一致，每一个都能把数据库打穿。',
              """String key = "course:" + id;
String cached = redis.get(key);
if (cached == null) {
  String lock = "lock:" + key;
  if (redis.setIfAbsent(lock, "1", Duration.ofSeconds(10))) {
    try {
      value = db.load(id);
      redis.setex(key, 300 + random.nextInt(60), value);
    } finally { redis.delete(lock); }
  }
}""",
              """cache hit 92%
stampede: 1 loader, others wait 80ms
null cache: 30s TTL, DB QPS -64%""",
              'TTL 加抖动防雪崩，空值缓存短 TTL 防穿透，互斥锁防击穿；双写要先更新库再删缓存。',
              '缓存击穿/穿透/雪崩三个实验都有指标。'),
            L('11.5 架构取舍与 ADR',
              '架构不是选“最先进”，而是选当前约束下代价可控的方案。每个决策都要写清代价和失效条件。',
              """# ADR-004 课程进度写路径
决策：写请求同步落库，异步刷新缓存。
备选：先写缓存再异步落库。
代价：写延迟高 20ms，但避免丢进度。
失效条件：写 QPS > 2k 时重新评估。""",
              """status: accepted
review: 2026-11-27
trigger: write QPS > 2k or cross-region""",
              '架构决策要写代价和失效条件，不只写结论；ADR 要能被后来的人读懂。',
              '三个关键决策各一页 ADR，能在评审中解释取舍。'),
        ],
    },
    'capstone': {
        'title': '上线、运营与迭代',
        'summary': '毕业项目真正的验收不是“能演示”，而是“能上线、能回滚、能运营、能迭代”。这一章把架构决策、支付通知、后台审计、上线演练和反馈闭环补齐。',
        'part_title': '上线与迭代',
        'part_note': 'ADR、订单状态机、后台审计、发布演练与反馈闭环',
        'goals': [
            '能把关键架构选择写成 ADR，并说明代价和失效条件。',
            '能设计订单/支付/通知的状态机，处理重复回调和通知失败。',
            '能让后台危险操作有审计、二次确认和恢复路径。',
            '能用指标和访谈形成下一版范围，而不是拍脑袋。',
        ],
        'project': '课程社区毕业项目',
        'bridge': '把这一章接进毕业项目：从“功能跑通”走到“可以交给真实用户使用”。',
        'lessons': [
            L('11.1 从 PRD 到架构决策记录',
              '毕业项目最容易犯的错，是为了“像大厂”上微服务。架构要服务交付，不是服务简历。',
              """# ADR-001 单体优先
状态：接受
背景：4 人团队，3 个月上线
决策：模块化单体 + 独立 worker
代价：后期拆分成本
触发拆分：团队 > 8 人或单模块日发布 > 5 次""",
              """ADR-001 accepted
ADR-002 缓存策略 accepted
ADR-003 文件存储 accepted
# 3 个决策均可在 5 分钟内讲清""",
              '先选能交付的架构，再留拆分触发条件；ADR 写代价，不写口号。',
              '架构图 + 3 个 ADR，能被同学复述取舍。'),
            L('11.2 订单、支付与通知的边界',
              '支付成功不等于订单完成，订单完成不等于通知送达。三个系统要用状态机和 Outbox 解耦。',
              """状态机：pending → paid → fulfilled → refunded
幂等：order_id + payment_id 唯一
通知：outbox → queue → email/webhook
失败：支付成功但通知失败，可重放""",
              """payment callback duplicate → 200, no double fulfill
email failed → retry 3x, then dead letter
order remains paid/fulfilled""",
              '支付回调必须验签 + 幂等；通知失败不能回滚订单，用 Outbox 重放。',
              '模拟重复回调/通知失败，订单只发一次货。'),
            L('11.3 管理后台、权限与审计',
              '后台一个“删除课程”按钮，可能删掉别人的课程和整个学期的进度。危险操作要二次确认、审计和软删除。',
              """INSERT INTO audit_logs
(actor_id, action, resource, resource_id, before, after, created_at)
VALUES (42, 'course.publish', 'course', 42,
  '{"status":"draft"}', '{"status":"published"}', now());""",
              """admin delete course → soft delete + audit
restore within 30 days → 200
unauthorized delete → 403 + audit log""",
              '后台危险操作要二次确认 + 审计 + 可撤销；审计记录 actor/resource/before/after。',
              '管理员删课程有审计、软删除和恢复。'),
            L('11.4 上线演练与五分钟回滚',
              '上线当天才第一次跑发布脚本，等于把事故留给最忙的时候。演练要把检查、发布、验证、回滚走一遍。',
              """curl -fsS https://course.example.com/healthz
curl -fsS 'https://course.example.com/api/courses?limit=1'
k6 run smoke.js
# 回滚：switch current -> previous; verify healthz""",
              """smoke 8/8 passed
rollback drill: 4m 12s
healthz after rollback: ok
5xx: 0""",
              '上线检查写成脚本，不靠记忆；回滚演练要计时，目标 5 分钟内完成。',
              '发布检查表 100% 通过，5 分钟内完成回滚演练。'),
            L('11.5 用户反馈、指标与下一版',
              '上线不是终点。没有行为指标和用户访谈，下一版只能靠感觉；有了数据，才知道先修哪里。',
              """指标：访问→报名转化 38%，7 日留存 22%
反馈：课程详情加载慢（P95 1.8s）
下一版：详情页缓存 + 课节搜索
范围外：支付、直播、推荐""",
              """conversion 38%
retention 22%
top issue: detail p95 1.8s
next release: cache + search""",
              '用行为指标和访谈交叉验证，不要只看点赞；下一版只选一个主线，范围外写清楚。',
              '一页复盘：指标、三个问题、下一版范围。'),
        ],
    },
}

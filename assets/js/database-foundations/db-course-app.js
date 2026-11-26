(function () {
  'use strict';

  window.CourseReader.start({
    chapters: (window.DATABASE_COURSE_CHAPTERS || []).slice(),
    partMeta: {
      1: { title: 'SQL 与关系模型', note: '数据库运行链路、表与键、类型、NULL、约束、筛选、排序、聚合' },
      2: { title: '连接、子查询与报表', note: 'INNER/LEFT JOIN、CTE、递归查询、窗口函数、集合运算与报表分层' },
      3: { title: '数据建模与约束', note: 'ER 图、基数、自然键与代理键、范式、业务状态机、软删除与审计' },
      4: { title: '事务、并发与索引', note: 'ACID、隔离级别、MVCC、锁与死锁、B+Tree、执行计划与慢查询' },
      5: { title: '工程化与毕业项目', note: 'ORM、迁移、连接池、N+1、Redis、备份恢复、权限与学习社区项目' }
    },
    storageKey: 'databaseCourse.progress.v1',
    lastKey: 'databaseCourse.lastLesson.v1',
    lessonUnit: '课',
    languageLabel: 'sql',
    kicker: 'DATABASE · Full Course · Five Parts',
    overviewTitle: '数据库系统与数据建模',
    overviewSub: '数据库不是“把数据塞进表”这么简单。这条课从<strong>一条 SELECT 的执行链路</strong>开始，走到 JOIN、窗口函数、ER 建模、事务隔离、B+Tree 索引、执行计划、ORM、Redis 与备份恢复，最后用一个学习社区数据库把全部能力串起来。',
    materialLabel: 'PostgreSQL 16 与 SQL 标准',
    outcomes: [
      { title: '先会查，再会设计', desc: '每条 SQL 都配可核对的结果和反例；从查询结果反推表结构，而不是先画一堆表。' },
      { title: '把慢查询拆开', desc: 'EXPLAIN、索引选择性、连接算法和锁等待都落到真实执行计划，不停留在“加索引”三个字。' },
      { title: '一条项目主线', desc: '课程社区从用户、课程、选课、进度到帖子和评论，最终交付迁移、索引、API 契约和压测记录。' }
    ],
    apiHref: './fullstack.html?v=20261126z83#module-database',
    apiLabel: '查看全栈科目位置',
    routeNote: '建议按篇推进；第 1–4 章打 SQL 与关系模型，第 5–8 章练连接、CTE、窗口和报表，第 9–12 章做 ER 建模与业务表，第 13–16 章进入事务、锁、索引和执行计划，第 17–19 章完成工程化、缓存、备份与毕业项目。',
    overviewDocTitle: '数据库系统与数据建模 · 五篇 19 章 58 课',
    lessonDocSuffix: '数据库系统与数据建模',
    defaultSource: 'PostgreSQL 16 文档、SQL 标准与数据库工程实践',
    sourceNote: '正文为课程改写，SQL 示例默认 PostgreSQL 16；SQLite 差异会在正文标注。',
    emptyMessage: '数据库课程数据未载入。请检查 assets/js/database-foundations/ 下的五个分篇文件。'
  });
})();

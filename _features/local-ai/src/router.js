// src/router.js — heuristic intent router (4.1). No extra model call.

export function routeIntent(query = '', { hasHits = true } = {}) {
  const q = String(query).trim().toLowerCase();
  if (!q) return 'not_found';

  // site overview
  if (/网站|本站|全站|整体|目录|怎么学|学习路线|有什么课|哪些科目|一共多少|总共多少/.test(q)) {
    return 'site_overview';
  }
  // exercise
  if (/练习|习题|有没有题|做哪些题|本节.*题|题目|小测验| sharpen|quiz/.test(q)) {
    return 'exercise';
  }
  // course overview: "第 8 课讲什么" / "类加载器那课" / "这门课重点"
  if (/(第\s*\d+\s*课|哪门课|那门课|这门课|课程).*(讲什么|重点|概览|目录|内容)|课程.*重点/.test(q)) {
    return 'course_overview';
  }
  // no retrieval hits or clearly off-site
  if (!hasHits || /量子计算|外星|彩票|股票推荐|明天天气/.test(q)) return 'not_found';
  return 'specific';
}

export function contextPlan(intent) {
  switch (intent) {
    case 'site_overview': return { site: true, compact: true, courses: 0, passages: 0 };
    case 'course_overview': return { site: true, compact: false, courses: 1, passages: 2, sectionTitles: 30 };
    case 'exercise': return { site: true, compact: false, courses: 1, passages: 4 };
    case 'specific': return { site: true, compact: false, courses: 2, passages: 6 };
    default: return { site: true, compact: false, courses: 0, passages: 0 };
  }
}

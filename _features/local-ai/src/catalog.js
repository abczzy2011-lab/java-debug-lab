// src/catalog.js — Global orientation layer (4.1): CatalogDoc per course + site cards.
// Pure: input is the site's existing STUDY_* objects (passed in), no DOM dependency.

export function buildCatalog(studyMap) {
  const docs = [];
  for (const [subject, data] of Object.entries(studyMap)) {
    if (!data || !Array.isArray(data.courses)) continue;
    for (const course of data.courses) {
      docs.push({
        subject,
        courseId: course.id,
        title: course.title || '',
        summary: course.summary || '',
        points: Array.isArray(course.points) ? course.points.slice() : [],
        sectionTitles: (course.body || []).map(b => b.h || ''),
        sectionCount: (course.body || []).length,
        firstSectionId: course.id + '/0',
        lastSectionId: course.id + '/' + Math.max(0, (course.body || []).length - 1),
      });
    }
  }
  return docs;
}

export function siteStats(studyMap) {
  const subjects = [];
  let totalCourses = 0, totalSections = 0, totalPoints = 0;
  for (const [subject, data] of Object.entries(studyMap)) {
    if (!data || !Array.isArray(data.courses)) continue;
    const courses = data.courses.length;
    const sections = data.courses.reduce((s, c) => s + ((c.body || []).length), 0);
    const points = data.courses.reduce((s, c) => s + ((c.points || []).length), 0);
    totalCourses += courses; totalSections += sections; totalPoints += points;
    subjects.push({ subject, courses, sections, points, name: data.title || subject });
  }
  return { subjects, totalCourses, totalSections, totalPoints };
}

// <=200 tokens stable world frame. Never omitted from any prompt.
export function siteCard(studyMap) {
  const s = siteStats(studyMap);
  const lines = s.subjects.map(x => `- ${x.name}：${x.courses} 课 / ${x.sections} 节 / ${x.points} 知识点`);
  return [
    '[C0] 本站是一个 Java 与计算机学习站，共 ' + s.totalCourses + ' 门课、' +
      s.totalSections + ' 节、' + s.totalPoints + ' 个知识点。',
    ...lines,
    '助教只依据本站资料回答；回答要给出处编号 [P]/[C]/[S]，找不到就说没有依据。',
  ].join('\n');
}

// <=300 tokens, only for site_overview intent. Course titles come from catalog, never memory.
export function compactCatalog(catalog, stats, perSubject = 3) {
  const grouped = {};
  for (const d of catalog) (grouped[d.subject] = grouped[d.subject] || []).push(d);
  const out = [];
  for (const [subject, docs] of Object.entries(grouped)) {
    const names = docs.slice(0, perSubject).map(d => `《${d.title}》`).join('、');
    out.push(`[S-${subject}] ${subject}：${docs.length} 课，例如 ${names}`);
  }
  out.push(`合计 ${stats.totalCourses} 课 / ${stats.totalSections} 节。`);
  return out.join('\n');
}

// <=300 tokens: one course's role + immediately before/after hit section titles.
export function courseCard(catalogDoc, hitSectionIndex = -1) {
  if (!catalogDoc) return '';
  const pts = (catalogDoc.points || []).slice(0, 5).join('、');
  const titles = catalogDoc.sectionTitles || [];
  let around = '';
  if (hitSectionIndex >= 0 && titles.length) {
    const before = titles[hitSectionIndex - 1];
    const hit = titles[hitSectionIndex];
    const after = titles[hitSectionIndex + 1];
    around = [before && `前一节：${before}`, hit && `命中节：${hit}`, after && `后一节：${after}`]
      .filter(Boolean).join('；');
  }
  return [
    `[C1] 课程：${catalogDoc.title}（${catalogDoc.courseId}，${catalogDoc.subject}，共 ${catalogDoc.sectionCount} 节）`,
    pts && `重点：${pts}`,
    catalogDoc.summary,
    around,
  ].filter(Boolean).join('\n');
}

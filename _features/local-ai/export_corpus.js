// export_corpus.js — Node: parse java-debug-lab.html STUDY_* objects -> corpus.json for prototype.
// Usage: node export_corpus.js ../..  (path to project root), writes ./corpus.json
// No main HTML edits; reads only. Uses a guarded Function eval of each STUDY_* literal.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function extractObject(src, name) {
  const key = 'const ' + name + '=';
  const i = src.indexOf(key);
  if (i < 0) return null;
  let j = i + key.length;
  // find matching braces
  const start = src.indexOf('{', j);
  if (start < 0) return null;
  let depth = 0, inStr = false, quote = '', esc = false;
  for (let k = start; k < src.length; k++) {
    const c = src[k];
    if (inStr) {
      if (esc) { esc = false; continue; }
      if (c === '\\') { esc = true; continue; }
      if (c === quote) inStr = false;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = true; quote = c; continue; }
    if (c === '{') depth++;
    else if (c === '}') { depth--; if (depth === 0) {
      const literal = src.slice(start, k + 1);
      try { return Function('return (' + literal + ')')(); }
      catch (e) { throw new Error('parse ' + name + ' failed: ' + e.message); }
    } }
  }
  return null;
}

export function exportCorpus(projectRoot) {
  const htmlPath = path.join(projectRoot, 'java-debug-lab.html');
  const src = fs.readFileSync(htmlPath, 'utf8');
  const out = { subjects: [], courses: [], docs: [], generatedAt: new Date().toISOString() };
  const names = ['STUDY_HW','STUDY_ALGO','STUDY_JBASE','STUDY_AI','STUDY_LLM','STUDY_API'];
  for (const name of names) {
    const obj = extractObject(src, name);
    // STUDY_API declares courses via `STUDY_API.courses=[...]` after the object literal
    if (obj && !Array.isArray(obj.courses)) {
      const ci = src.indexOf(name + '.courses=[');
      if (ci >= 0) {
        const lb = src.indexOf('[', ci);
        let depth = 0, inStr = false, quote = '', esc = false, end = -1;
        for (let k = lb; k < src.length; k++) {
          const c = src[k];
          if (inStr) {
            if (esc) { esc = false; continue; }
            if (c === '\\') { esc = true; continue; }
            if (c === quote) inStr = false;
            continue;
          }
          if (c === '"' || c === "'" || c === '`') { inStr = true; quote = c; continue; }
          if (c === '[') depth++;
          else if (c === ']') { depth--; if (depth === 0) { end = k; break; } }
        }
        if (end > lb) {
          try { obj.courses = Function('return (' + src.slice(lb, end + 1) + ')')(); }
          catch { /* leave as non-array; skipped below */ }
        }
      }
    }
    if (!obj || !Array.isArray(obj.courses)) continue;
    const subject = obj.subject || name;
    out.subjects.push({ key: subject, name: obj.title || subject, intro: obj.intro || '' });
    for (const c of obj.courses) {
      const doc = {
        id: c.id, subject, courseId: c.id, courseTitle: c.title || '',
        summary: c.summary || '', points: c.points || [],
        sectionCount: (c.body || []).length,
      };
      out.courses.push(doc);
      (c.body || []).forEach((b, i) => {
        out.docs.push({
          id: `${subject}/${c.id}/${i}`,
          subject, courseId: c.id, courseTitle: c.title || '',
          sectionIndex: i, sectionTitle: b.h || '',
          text: [b.h || '', b.p || '', b.tip || ''].filter(Boolean).join('\n'),
          code: b.code || '',
          url: `#course=${encodeURIComponent(c.id)}&section=${i}`,
        });
      });
    }
  }
  return out;
}

// Run as CLI only (importing for tests should not write files).
if (process.argv[1] && /export_corpus\.js$/.test(process.argv[1])) {
  const root = process.argv[2] || '..';
  const corpus = exportCorpus(path.resolve(root));
  const target = path.join(path.dirname(fileURLToPath(import.meta.url)), 'corpus.json');
  fs.writeFileSync(target, JSON.stringify(corpus));
  console.log('corpus.json:', corpus.subjects.length, 'subjects,', corpus.courses.length,
    'courses,', corpus.docs.length, 'docs,', fs.statSync(target).size, 'bytes');
}

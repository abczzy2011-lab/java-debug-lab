// src/rag.js — tokenizer (zh Intl.Segmenter + latin), BM25 index, retrieval.
// Pure JS, runs in Worker. k1=1.2, b=0.75, title boost 2.0, code weight 0.25, tip 1.0.

const K1 = 1.2, B = 0.75;

export function tokenize(text = '') {
  const tokens = [];
  // Latin identifiers / numbers
  const latin = String(text).match(/[A-Za-z0-9_]+/g) || [];
  for (const w of latin) tokens.push(w.toLowerCase());
  // Chinese: character bigrams. This is intentionally deterministic and fast:
  // Intl.Segmenter per-segment is 5-10x slower on a 3,000-section corpus, while
  // bigrams recall is sufficient for BM25 + exact-title boosts in Javis.
  const zh = String(text).match(/[\u3400-\u9fff]+/g) || [];
  for (const seg of zh) {
    if (seg.length === 1) { tokens.push(seg); continue; }
    for (let i = 0; i < seg.length - 1; i++) tokens.push(seg.slice(i, i + 2));
  }
  return tokens;
}

function termFreq(tokens) {
  const tf = Object.create(null);
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
  return tf;
}

/** Build BM25 index from docs: {id, title, text, code?, tip?} */
export function buildIndex(docs = []) {
  const postings = Object.create(null); // term -> [{id, f}]
  const docLen = Object.create(null);
  let totalLen = 0;
  for (const d of docs) {
    const fields = [
      ...tokenize(d.title || '').flatMap(t => [t, t]),       // title boost 2x (two entries)
      ...tokenize(d.text || ''),
      ...tokenize(d.tip || '').flatMap(t => [t]),            // tip weight 1
      ...tokenize(d.code || '').slice(0, 40).map(t => t),    // code low weight via score below
    ];
    const tf = termFreq(fields);
    docLen[d.id] = fields.length;
    totalLen += fields.length;
    for (const [term, f] of Object.entries(tf)) {
      (postings[term] = postings[term] || []).push({ id: d.id, f });
    }
  }
  const avgdl = docs.length ? totalLen / docs.length : 0;
  return { docs, postings, docLen, avgdl, N: docs.length };
}

/** Query with synonyms expanded for retrieval only (17?). Returns [{id, score}]. */
export function search(index, query = '', { limit = 8, synonyms = SYNONYMS } = {}) {
  const raw = tokenize(query);
  const qtokens = [];
  for (const t of raw) {
    qtokens.push(t);
    const syn = synonyms[t] || synonyms[t.toLowerCase()];
    if (syn) for (const s of syn) {
      // 同义词本身也要过同一个 tokenizer，否则「双亲委派」整词对不上索引里的切分
      for (const st of tokenize(s)) qtokens.push(st);
    }
  }
  // 原查询整词也保留（如 ClassLoader -> classloader + 双亲/委派）
  const scores = Object.create(null);
  for (const term of new Set(qtokens)) {
    const plist = index.postings[term];
    if (!plist) continue;
    const df = plist.length;
    const idf = Math.log(1 + (index.N - df + 0.5) / (df + 0.5));
    for (const { id, f } of plist) {
      const dl = index.docLen[id] || 0;
      const denom = f + K1 * (1 - B + B * (dl / (index.avgdl || 1)));
      const contrib = idf * (f * (K1 + 1)) / (denom || 1);
      scores[id] = (scores[id] || 0) + contrib;
    }
  }
  const querySet = new Set(qtokens);
  return Object.entries(scores)
    .map(([id, score]) => {
      const d = index.docs.find(x => x.id === id);
      // relevance floor: title contains a query term OR token coverage >= 0.30
      const titleHits = tokenize(d?.title || '').some(t => querySet.has(t));
      const docTokens = new Set(tokenize((d?.title || '') + ' ' + (d?.text || '')));
      let covered = 0;
      for (const t of querySet) if (docTokens.has(t)) covered++;
      const coverage = querySet.size ? covered / querySet.size : 0;
      return { id, score, pass: titleHits || coverage >= 0.30, coverage };
    })
    .filter(x => x.pass)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export const SYNONYMS = {
  '多态': ['polymorphism'], 'polymorphism': ['多态'],
  '类加载器': ['classloader'], 'classloader': ['类加载器'],
  '双亲委派': ['parent delegation'], '垃圾回收': ['gc'], 'gc': ['垃圾回收'],
  '封装': ['encapsulation'], '继承': ['inheritance'], '接口': ['interface'],
  '重载': ['overload'], '覆盖': ['override'], '泛型': ['generic'],
};

/** Build context passages: max 2 per course, return top N with [Pn] labels. */
export function buildPassages(hits, docs, { max = 6, perCourse = 2, maxChars = 2200 } = {}) {
  const byCourse = Object.create(null);
  const out = [];
  for (const hit of hits) {
    const d = docs.find(x => x.id === hit.id);
    if (!d) continue;
    const course = d.courseId || d.subject;
    byCourse[course] = (byCourse[course] || 0) + 1;
    if (byCourse[course] > perCourse) continue;
    let text = (d.text || '').slice(0, maxChars);
    out.push(`[P${out.length + 1}] 课程：${d.courseTitle || ''} 小节：${d.sectionTitle || ''}\n${text}`);
    if (out.length >= max) break;
  }
  return out;
}

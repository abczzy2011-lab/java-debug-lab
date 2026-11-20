import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenize, buildIndex, search, buildPassages } from '../src/rag.js';

const docs = [
  { id: 'jb-c48/0', courseId: 'jb-c48', courseTitle: '类加载器与双亲委派实战', sectionTitle: '双亲委派模型',
    title: '双亲委派模型', text: '类加载器收到加载请求先委派给父加载器，层层向上，父加载器无法完成才自己加载。',
    tip: '双亲委派保证核心类库安全。' },
  { id: 'jb-c8/0', courseId: 'jb-c8', courseTitle: '第8课 继承与多态', sectionTitle: '动态绑定',
    title: '动态绑定与多态', text: '多态是同一消息作用于不同对象产生不同行为，运行时按对象真实类型选择方法版本。',
    tip: '声明父类型，运行子类方法。' },
  { id: 'jb-c8/1', courseId: 'jb-c8', courseTitle: '第8课 继承与多态', sectionTitle: '覆盖规则',
    title: '方法覆盖的契约', text: '覆盖要求参数相同、返回类型协变、可见性不能降低。',
    tip: 'private/static/final 方法不能被覆盖。' },
  { id: 'al-c1/0', courseId: 'al-c1', courseTitle: '复杂度', sectionTitle: '大O',
    title: '大O表示法', text: '大O描述算法增长上界。', tip: '' },
];

test('tokenize: latin identifiers and Chinese', () => {
  const t = tokenize('ClassLoader 双亲委派 parent delegation');
  assert.ok(t.includes('classloader'));
  assert.ok(t.some(x => /双亲|委派/.test(x)));
});

test('tokenize: CJK bigram fallback when Segmenter absent', () => {
  const t = tokenize('多态');
  assert.ok(t.length >= 1);
});

test('BM25: 双亲委派 retrieves c48', () => {
  const idx = buildIndex(docs);
  const hits = search(idx, '双亲委派');
  assert.ok(hits.length > 0);
  assert.equal(hits[0].id, 'jb-c48/0');
});

test('BM25: 多态 retrieves c8 course', () => {
  const idx = buildIndex(docs);
  const hits = search(idx, '多态');
  assert.ok(hits.some(h => h.id.startsWith('jb-c8')));
});

test('synonym expansion: ClassLoader finds 双亲委派 doc', () => {
  const idx = buildIndex(docs);
  const hits = search(idx, 'ClassLoader');
  assert.ok(hits.some(h => h.id === 'jb-c48/0'));
});

test('relevance floor: off-topic query returns no hits', () => {
  const idx = buildIndex(docs);
  const hits = search(idx, '量子量子力学');
  assert.equal(hits.length, 0);
});

test('buildPassages: max 2 per course and [Pn] labels', () => {
  const idx = buildIndex(docs);
  const hits = search(idx, '多态 覆盖 双亲委派', { limit: 10 });
  const passages = buildPassages(hits, docs, { max: 6, perCourse: 2 });
  assert.ok(passages.length > 0);
  const c8count = passages.filter(p => p.includes('第8课')).length;
  assert.ok(c8count <= 2);
  assert.match(passages[0], /^\[P1\] 课程：/);
});

test('buildPassages: empty hits -> empty', () => {
  assert.deepEqual(buildPassages([], docs), []);
});

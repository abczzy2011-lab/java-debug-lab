// src/citations.js — parse [Pn]/[Cn]/[Sn], dedupe, escape unsafe output.

export function parseCitations(text = '') {
  const found = [];
  const re = /\[([PCS])(\d+)\]/g;
  let m;
  while ((m = re.exec(String(text))) !== null) {
    const key = m[1] + m[2];
    if (!found.includes(key)) found.push(key);
  }
  return found;
}

// Strip anything that is not a plain citation or safe text; never emit raw HTML.
export function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Render answer with citations as clickable chips; course/section context supplied separately.
export function renderAnswer(text = '', resolve = {}) {
  const safe = escapeHtml(text);
  return safe.replace(/\[([PCS])(\d+)\]/g, (whole, kind, n) => {
    const target = resolve[kind + n];
    const label = `${kind}${n}`;
    if (!target) return `<span class="cite-missing">[${label}]</span>`;
    return `<a class="cite" href="${escapeHtml(target.url || '#')}" title="${escapeHtml(target.title || label)}">[${label}]</a>`;
  });
}

// Validate that every cited [P]/[C]/[S] exists in provided map; used before showing answer.
export function validateCitations(text = '', map = {}) {
  const cited = parseCitations(text);
  return {
    cited,
    missing: cited.filter(k => !map[k]),
    ok: cited.length > 0 && cited.every(k => !!map[k]),
  };
}

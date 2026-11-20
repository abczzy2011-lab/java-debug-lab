# Local AI — Beta course assistant (isolated prototype)

Built per `LOCAL_AI_PLAN.txt`. **No edits to `java-debug-lab.html`** — main HTML is locked by M.
Everything here is pure JS modules + Node tests; browser integration happens after M's DONE.

## What is implemented (P0)

- `src/perf-check.js` — hard performance gate Stage A/B/C + benchmark merge (6.1-6.6)
- `src/catalog.js` — CatalogDoc per course + SITE_CARD / SITE_CATALOG_COMPACT / COURSE_CARD (4.1)
- `src/router.js` — heuristic intent router + per-intent context plan (site/course/specific/exercise/not_found)
- `src/rag.js` — zh/latin tokenizer, BM25 index, synonym expansion, relevance floor, passages (4)
- `src/citations.js` — [P]/[C]/[S] parse, dedupe, validate, HTML escaping
- `src/perf-benchmark.js` — Stage D WGSL matmul 1024^3 + pure FLOPS/median math
- `src/cloud-client.js` — `/api/health`, `/api/chat`, HYBRID_BUSY mapping, UI label `混合模型`
- `src/mode-controller.js` — P2C state machine (cloud/local/search, no mid-stream switch)
- `src/assistant.js` — WebLLM wrapper (pinned model, load/warmup/stream/stop/unload, device-lost)
- `src/gatekeeper.js` — mandatory-download admission rule (gate PASS => download required before AI; gate FAIL => search-only, no install)
- `src/ui.js` + `styles.css` — drawer copy/renderers + isolated styles using site CSS vars
- `export_corpus.js` + `prototype.html` + `corpus.json` — isolated search-only demo (no model)
- `tests/*.test.js` — 79 assertions across all pure modules

Cloud side lives in `../../cloudflare/worker/` (10 tests): fixed provider order glm→sensenova→cloudflare,
pre-stream gate, failover, circuit breaker, queue, cache, sanitizer.

## Run tests

```bash
cd _features/local-ai && node --test tests/*.test.js        # 42/42
cd ../../cloudflare/worker && node --test tests/*.test.js   # 10/10
```

## Hard rules honored

- Beta off by default; no auto-download/model fetch on boot.
- Local mode needs the hard gate + explicit 280MB consent; failure => search-only, no override.
- Every answer includes SITE_CARD + at least one COURSE_CARD; passages dropped before SITE_CARD.
- Broad questions get deterministic catalog facts, not model memory.
- All retrieval is local; cloud sends only site/course cards + passages, never the full site.
- Citations must resolve; unsafe output is escaped.

## Not yet implemented (next milestones)

- `perf-benchmark.js` (WGSL matmul Stage D), `assistant.js` (WebLLM load/ask/stop),
  `mode-controller.js` (hybrid state machine), `cloud-client.js`, `ui.js`/`styles.css`,
  `export_corpus.js`, `prototype.html`.
- Integration into main HTML only after M announces JB-REWRITE DONE in `collaborate.txt`.

import test from 'node:test';
import assert from 'node:assert/strict';
import { admission, onAsk, downloadDone, DECI } from '../src/gatekeeper.js';

const PASS = { ok: true, code: 'PASS' };
const FAIL = { ok: false, code: 'NO_WEBGPU' };

test('no gate -> not checked, no download, search', () => {
  const a = admission({});
  assert.equal(a.decision, DECI.NOT_CHECKED);
  assert.equal(a.aiAllowed, false);
  assert.equal(a.canDownload, false);
  assert.equal(a.mode, 'search');
  assert.equal(onAsk({}).action, 'RUN_GATE_FIRST');
});

test('gate FAIL -> search-only, no download entry, no AI', () => {
  const s = { gateResult: FAIL };
  const a = admission(s);
  assert.equal(a.decision, DECI.SEARCH_ONLY);
  assert.equal(a.aiAllowed, false);
  assert.equal(a.canDownload, false);
  assert.equal(a.showDownload, false);
  assert.equal(a.mode, 'search');
  assert.match(a.reason, /NO_WEBGPU/);
  assert.equal(onAsk(s).action, 'SEARCH_ONLY_ANSWER');
});

test('gate FAIL even if model somehow downloaded -> still search-only', () => {
  const a = admission({ gateResult: FAIL, modelDownloaded: true });
  assert.equal(a.aiAllowed, false);
  assert.equal(a.decision, DECI.SEARCH_ONLY);
});

test('gate PASS but no model -> MUST download before AI', () => {
  const s = { gateResult: PASS, modelDownloaded: false };
  const a = admission(s);
  assert.equal(a.decision, DECI.DOWNLOAD_REQUIRED);
  assert.equal(a.aiAllowed, false);
  assert.equal(a.canDownload, true);
  assert.equal(a.showDownload, true);
  assert.match(a.reason, /先下载/);
  assert.equal(onAsk(s).action, 'PROMPT_DOWNLOAD');
});

test('downloading -> AI locked, progress shown', () => {
  const s = { gateResult: PASS, modelDownloaded: false, downloading: true, downloadProgress: 42 };
  const a = admission(s);
  assert.equal(a.decision, DECI.DOWNLOADING);
  assert.equal(a.aiAllowed, false);
  assert.equal(a.progress, 42);
  assert.equal(onAsk(s).action, 'SHOW_PROGRESS');
});

test('download failed -> retry, AI still locked', () => {
  const s = { gateResult: PASS, modelDownloaded: false, downloadError: 'NETWORK' };
  const a = admission(s);
  assert.equal(a.decision, DECI.DOWNLOAD_FAILED);
  assert.equal(a.aiAllowed, false);
  assert.equal(a.canDownload, true);
  assert.equal(onAsk(s).action, 'PROMPT_RETRY');
});

test('gate PASS + model downloaded -> AI ready (local)', () => {
  const s = { gateResult: PASS, modelDownloaded: true };
  const a = admission(s);
  assert.equal(a.decision, DECI.READY);
  assert.equal(a.aiAllowed, true);
  assert.equal(a.mode, 'local');
  assert.equal(a.label, '本地');
  assert.equal(onAsk(s).action, 'ANSWER_LOCAL');
});

test('successful download flips to READY', () => {
  const s = { gateResult: PASS, modelDownloaded: false, downloading: true };
  const after = downloadDone(s, true);
  assert.equal(admission(after).decision, DECI.READY);
  assert.equal(after.downloading, false);
});

test('failed download stays locked', () => {
  const s = { gateResult: PASS, modelDownloaded: false, downloading: true };
  const after = downloadDone(s, false, 'DISK_FULL');
  assert.equal(admission(after).decision, DECI.DOWNLOAD_FAILED);
  assert.equal(after.downloadError, 'DISK_FULL');
});

test('re-check after gate fail can open download', () => {
  const s = { gateResult: FAIL };
  const rechecked = { ...s, gateResult: PASS };
  assert.equal(admission(rechecked).decision, DECI.DOWNLOAD_REQUIRED);
});

test('never exposes cloud mode in admission decisions', () => {
  for (const s of [{}, { gateResult: FAIL }, { gateResult: PASS }, { gateResult: PASS, modelDownloaded: true }]) {
    const a = admission(s);
    assert.notEqual(a.mode, 'cloud');
    assert.doesNotMatch(a.label + a.reason, /云端|混合模型/);
  }
});

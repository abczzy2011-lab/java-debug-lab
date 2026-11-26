(function () {
  'use strict';
  var track = window.FULLSTACK_TRACK;
  if (!track || !track.modules) return;
  var grid = document.getElementById('fsSubjectGrid');
  if (!grid) return;
  var esc = function (value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  var shortState = function (status) {
    return status === 'partial' ? '已有底座' : '待建设';
  };
  var stageClass = function (stage) {
    return stage === 'base' ? 'base' : stage === 'build' ? 'build' : stage === 'ship' ? 'ship' : 'capstone';
  };
  grid.innerHTML = track.modules.map(function (mod) {
    var topics = (mod.topics || []).slice(0, 2).join(' · ');
    var href = 'subjects/fullstack.html?v=' + encodeURIComponent(track.version) + '#module-' + encodeURIComponent(mod.id);
    return '<a class="fs-subject ' + stageClass(mod.stage) + ' ' + (mod.status === 'partial' ? 'partial' : 'missing') + '" href="' + href + '" aria-label="查看' + esc(mod.title) + '科目框架">' +
      '<div class="fs-sub-top"><span class="fs-sub-no">' + esc(mod.no) + '</span><span class="fs-sub-state">' + shortState(mod.status) + '</span></div>' +
      '<h3>' + esc(mod.title) + '</h3>' +
      '<p>' + esc(topics) + '</p>' +
      '<div class="fs-sub-foot"><span>结构已定</span><b aria-hidden="true">→</b></div>' +
    '</a>';
  }).join('');
  var count = document.getElementById('fsSubjectCount');
  if (count) count.textContent = String(track.modules.length);
  var partial = document.getElementById('fsSubjectPartial');
  if (partial) partial.textContent = String(track.modules.filter(function (mod) { return mod.status === 'partial'; }).length);
})();

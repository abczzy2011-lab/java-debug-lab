(function () {
  'use strict';
  var track = window.FULLSTACK_TRACK;
  if (!track || !track.modules || !track.stages) return;

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };
  var statusText = function (status) {
    if (status === 'partial') return '部分覆盖';
    if (status === 'ready') return '已开放';
    return '待建设';
  };
  var stageById = {};
  track.stages.forEach(function (stage) { stageById[stage.id] = stage; });

  var stats = { modules: track.modules.length, partial: 0, missing: 0, topics: 0 };
  track.modules.forEach(function (mod) {
    if (mod.status === 'partial') stats.partial++;
    else if (mod.status === 'ready') stats.partial++;
    else stats.missing++;
    stats.topics += (mod.topics || []).length;
  });
  var setText = function (id, value) {
    var node = $(id);
    if (node) node.textContent = String(value);
  };
  setText('statModules', stats.modules);
  setText('statPartial', stats.partial);
  setText('statMissing', stats.missing);
  setText('statTopics', stats.topics);
  setText('fsSummary', stats.modules + ' 大科目 · ' + stats.topics + ' 个知识单元 · ' + track.graduation.length + ' 条毕业验收');

  var bases = $('fsBases');
  if (bases && track.bases) {
    bases.innerHTML = track.bases.map(function (base) {
      return '<a class="fs-base" href="' + esc(base.href) + '">' +
        '<b>' + esc(base.label) + '</b><span>' + esc(base.note) + '</span><i aria-hidden="true">→</i>' +
      '</a>';
    }).join('');
  }

  var nav = $('fsStageNav');
  if (nav) {
    nav.innerHTML = track.stages.map(function (stage) {
      var count = track.modules.filter(function (mod) { return mod.stage === stage.id; }).length;
      return '<a class="fs-stage-tab" href="#stage-' + esc(stage.id) + '">' +
        '<span>' + esc(stage.no) + '</span><b>' + esc(stage.name) + '</b><em>' + count + '</em>' +
      '</a>';
    }).join('');
  }

  var existingHtml = function (mod) {
    if (!mod.existing || !mod.existing.length) {
      return '<div class="fs-module-note"><span>内容框架已定</span><b>等待接入课程 / 题库 / 项目</b></div>';
    }
    return '<div class="fs-existing"><span>已有入口</span>' +
      mod.existing.map(function (item) {
        return '<a href="' + esc(item.href) + '">' + esc(item.label) + '</a>';
      }).join('') + '</div>';
  };

  var moduleHtml = function (mod) {
    var status = mod.status === 'partial' ? 'partial' : 'missing';
    return '<article class="fs-module ' + status + '" id="module-' + esc(mod.id) + '" data-status="' + status + '">' +
      '<div class="fs-module-top"><span class="fs-no">' + esc(mod.no) + '</span>' +
        '<span class="fs-status ' + status + '"><i aria-hidden="true"></i>' + esc(mod.statusLabel || statusText(mod.status)) + '</span></div>' +
      '<h3>' + esc(mod.title) + '</h3>' +
      '<div class="fs-en">' + esc(mod.en) + '</div>' +
      '<p>' + esc(mod.summary) + '</p>' +
      '<div class="fs-topics">' + (mod.topics || []).map(function (topic) {
        return '<span>' + esc(topic) + '</span>';
      }).join('') + '</div>' +
      '<div class="fs-deliverable"><b>交付验收</b><span>' + esc(mod.deliverable) + '</span></div>' +
      existingHtml(mod) +
    '</article>';
  };

  var host = $('fsModules');
  if (host) {
    host.innerHTML = track.stages.map(function (stage) {
      var mods = track.modules.filter(function (mod) { return mod.stage === stage.id; });
      return '<section class="fs-stage" id="stage-' + esc(stage.id) + '">' +
        '<header class="fs-stage-head"><div><span class="fs-stage-kicker">STAGE ' + esc(stage.no) + '</span>' +
          '<h2>' + esc(stage.name) + '</h2><p>' + esc(stage.subtitle) + '</p></div>' +
          '<span class="fs-stage-count">' + mods.length + ' 个科目</span></header>' +
        '<div class="fs-grid">' + mods.map(moduleHtml).join('') + '</div>' +
      '</section>';
    }).join('');
  }

  var checklist = $('fsChecklist');
  if (checklist && track.graduation) {
    checklist.innerHTML = track.graduation.map(function (item) {
      return '<li><span class="fs-check" aria-hidden="true">✓</span><span>' + esc(item) + '</span></li>';
    }).join('');
  }
})();

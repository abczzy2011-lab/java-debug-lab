(function () {
  'use strict';
  var chapters = window.PY_FOUNDATIONS_CHAPTERS || [];
  var first = window.PY_FOUNDATIONS_DEEP || {};
  var second = window.PY_FOUNDATIONS_DEEP2 || {};
  var read = window.PY_FOUNDATIONS_READ || {};
  var finalExtra = window.PY_FOUNDATIONS_FINAL || {};
  var review = window.PY_FOUNDATIONS_REVIEW || {};
  var review2 = window.PY_FOUNDATIONS_REVIEW2 || {};
  var review3 = window.PY_FOUNDATIONS_REVIEW3 || {};
  chapters.forEach(function (chapter) {
    (chapter.lessons || []).forEach(function (lesson) {
      var extra = (first[lesson.id] || []).concat(second[lesson.id] || [], read[lesson.id] || [], finalExtra[lesson.id] || [], review[lesson.id] || [], review2[lesson.id] || [], review3[lesson.id] || []);
      if (extra.length) {
        lesson.sections = (lesson.sections || []).concat(extra);
      }
    });
  });
})();

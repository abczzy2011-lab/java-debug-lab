/* 全栈结业考试 · 页面状态、作答记录与评分 */
(function () {
  'use strict';
  var TRACK = window.FULLSTACK_TRACK;
  var DATA = window.FULLSTACK_EXAM;
  if (!TRACK || !DATA || !Array.isArray(DATA.questions)) return;

  var KEY = 'jdl.fullstack.exam.answers.v2';
  var SUBMITTED_KEY = 'jdl.fullstack.exam.submitted.v2';
  var LETTERS = ['A', 'B', 'C', 'D'];
  var $ = function (id) { return document.getElementById(id); };
  var esc = function (value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  };

  var SUBJECTS = TRACK.modules.map(function (mod) {
    return {
      id: mod.id, no: mod.no, title: mod.title, summary: mod.summary,
      course: mod.course || null,
      questions: DATA.questions.filter(function (q) { return q.subject === mod.id; })
    };
  });

  var ALL = SUBJECTS.reduce(function (list, subject) {
    return list.concat(subject.questions);
  }, []);

  var loadAnswers = function () {
    try {
      var raw = JSON.parse(localStorage.getItem(KEY) || '{}');
      var clean = {};
      ALL.forEach(function (q) {
        var value = raw && raw[q.id];
        if (typeof value === 'number' && value >= 0 && value < q.options.length && Math.floor(value) === value) {
          clean[q.id] = value;
        }
      });
      return clean;
    } catch (error) {
      return {};
    }
  };

  var saveAnswers = function () {
    try { localStorage.setItem(KEY, JSON.stringify(state.answers)); } catch (error) {}
  };

  var loadSubmitted = function () {
    try { return localStorage.getItem(SUBMITTED_KEY) === '1'; } catch (error) { return false; }
  };

  var state = {
    answers: loadAnswers(),
    submitted: false,
    result: null
  };

  var els = {
    lead: $('examLead'),
    rules: $('examRules'),
    blueprint: $('examBlueprint'),
    dock: $('examDock'),
    answered: $('examAnswered'),
    bar: $('examAnsweredBar'),
    remaining: $('examRemaining'),
    submit: $('examSubmit'),
    sheet: $('examSheet'),
    result: $('examResult'),
    dialog: $('examDialog'),
    dialogCount: $('examDialogCount'),
    dialogText: $('examDialogText')
  };

  var chosen = function (q) {
    var value = state.answers[q.id];
    return typeof value === 'number' ? value : null;
  };

  var isAnswered = function (q) { return chosen(q) !== null; };

  var answeredCount = function () { return ALL.filter(isAnswered).length; };

  var gradeFor = function (score) {
    var grades = (DATA.grades || []).slice().sort(function (a, b) { return b.min - a.min; });
    return grades.find(function (g) { return score >= g.min; }) || { label: '待评分', code: '?', note: '' };
  };

  var calculate = function () {
    var subjects = SUBJECTS.map(function (subject) {
      var score = subject.questions.reduce(function (sum, q) {
        return sum + (chosen(q) === q.answer ? q.points : 0);
      }, 0);
      return {
        id: subject.id, no: subject.no, title: subject.title,
        course: subject.course, score: score, total: 10,
        correct: subject.questions.filter(function (q) { return chosen(q) === q.answer; }).length,
        count: subject.questions.length
      };
    });
    var score = subjects.reduce(function (sum, s) { return sum + s.score; }, 0);
    var choiceScore = ALL.filter(function (q) { return q.type === 'choice' && chosen(q) === q.answer; })
      .reduce(function (sum, q) { return sum + q.points; }, 0);
    var commandScore = ALL.filter(function (q) { return q.type === 'command' && chosen(q) === q.answer; })
      .reduce(function (sum, q) { return sum + q.points; }, 0);
    var debugScore = ALL.filter(function (q) { return q.type === 'debug' && chosen(q) === q.answer; })
      .reduce(function (sum, q) { return sum + q.points; }, 0);
    var grade = gradeFor(score);
    var weak = subjects.filter(function (s) { return s.score < 7; });
    return {
      score: score, choiceScore: choiceScore, commandScore: commandScore, debugScore: debugScore,
      subjects: subjects, grade: grade, weak: weak,
      correctSubjects: subjects.filter(function (s) { return s.score >= 7; }).length,
      answered: answeredCount(), total: ALL.length
    };
  };

  var renderHero = function () {
    if (els.lead) els.lead.textContent = DATA.subtitle;
    if (els.rules) {
      els.rules.innerHTML = '<ul>' + DATA.rules.map(function (rule) {
        return '<li>' + esc(rule) + '</li>';
      }).join('') + '</ul>';
    }
  };

  var renderBlueprint = function () {
    if (!els.blueprint) return;
    els.blueprint.innerHTML = SUBJECTS.map(function (subject) {
      return '<a class="exam-scope-chip" href="#subject-' + esc(subject.id) + '" data-scope="' + esc(subject.id) + '">' +
        '<span class="scope-no">' + esc(subject.no) + '</span>' +
        '<b>' + esc(subject.title) + '</b>' +
        '<em>0/' + subject.questions.length + '</em>' +
      '</a>';
    }).join('');
  };

  var questionCard = function (q, subject) {
    var selected = chosen(q);
    var submitted = state.submitted;
    var correct = submitted && selected === q.answer;
    var wrong = submitted && selected !== null && selected !== q.answer;
    var cls = 'exam-q ' + (q.type === 'debug' ? 'is-debug' : q.type === 'command' ? 'is-command' : 'is-choice');
    if (isAnswered(q) && !submitted) cls += ' has-answer';
    if (correct) cls += ' is-correct';
    if (wrong) cls += ' is-wrong';
    var flag = '';
    if (submitted) flag = correct ? '✓ ' + q.points + '/' + q.points : wrong ? '✗ 0/' + q.points : '未作答 · 0/' + q.points;

    var options = q.options.map(function (option, i) {
      var isAnswer = i === q.answer;
      var isChosen = selected === i;
      var ocls = 'exam-option';
      var oflag = '';
      if (submitted && isAnswer) {
        ocls += ' is-correct';
        oflag = isChosen ? '你选对了' : '正确答案';
      } else if (submitted && isChosen) {
        ocls += ' is-wrong';
        oflag = '你选的';
      }
      return '<label class="' + ocls + '">' +
        '<input type="radio" name="' + esc(q.id) + '" value="' + i + '"' +
          (isChosen ? ' checked' : '') + (submitted ? ' disabled' : '') + '>' +
        '<span class="exam-opt-letter">' + LETTERS[i] + '</span>' +
        '<span class="exam-opt-main"><span class="exam-opt-text">' + esc(option.text) + '</span>' +
          (option.code ? '<pre class="exam-opt-code">' + esc(option.code) + '</pre>' : '') +
        '</span>' +
        (oflag ? '<span class="exam-opt-flag">' + esc(oflag) + '</span>' : '') +
      '</label>';
    }).join('');

    return '<article class="' + cls + '" id="q-' + esc(q.id) + '" data-q="' + esc(q.id) + '">' +
      '<div class="exam-q-head">' +
        '<span class="exam-type">' + (q.type === 'debug' ? '代码改错' : q.type === 'command' ? '终端指令' : '知识选择') + ' · ' + q.points + ' 分</span>' +
        '<span class="exam-q-flag">' + esc(flag) + '</span>' +
      '</div>' +
      '<h3>' + esc(q.title) + '</h3>' +
      '<p class="exam-prompt">' + esc(q.prompt) + '</p>' +
      (q.code ? '<pre class="exam-code">' + esc(q.code) + '</pre>' : '') +
      '<div class="exam-options" role="radiogroup" aria-label="' + esc(subject.title + '：' + q.title) + '">' + options + '</div>' +
      (submitted ? '<div class="exam-explain"><b>解析</b><p>' + esc(q.explain) + '</p></div>' : '') +
    '</article>';
  };

  var subjectScore = function (subjectId) {
    if (!state.result) return '—';
    var item = state.result.subjects.find(function (s) { return s.id === subjectId; });
    return item ? item.score : '—';
  };

  var renderSheet = function () {
    if (!els.sheet) return;
    els.sheet.innerHTML = SUBJECTS.map(function (subject) {
      var questions = subject.questions.map(function (q) {
        return questionCard(q, subject);
      }).join('');
      var course = subject.course
        ? '<a href="./' + esc(subject.course.href) + '">课程复习 →</a>'
        : '';
      return '<section class="exam-subject" id="subject-' + esc(subject.id) + '" data-subject="' + esc(subject.id) + '">' +
        '<header class="exam-subject-head">' +
          '<span class="exam-sub-no">' + esc(subject.no) + '</span>' +
          '<div class="exam-sub-title"><h2>' + esc(subject.title) + '</h2>' +
            '<p>2 分知识选择 + 2 分终端指令 + 6 分代码改错' + (course ? ' · ' + course : '') + '</p>' +
          '</div>' +
          '<div class="exam-sub-score"><b>' + esc(subjectScore(subject.id)) + '</b><span>/ 10</span></div>' +
        '</header>' +
        '<div class="exam-subject-grid">' + questions + '</div>' +
      '</section>';
    }).join('');
  };

  var renderDock = function () {
    var answered = answeredCount();
    var total = ALL.length;
    if (els.answered) els.answered.textContent = String(answered);
    if (els.bar) els.bar.style.width = (total ? answered / total * 100 : 0) + '%';
    if (els.remaining) {
      if (state.submitted) {
        els.remaining.textContent = '已提交 · ' + state.result.score + '/100';
      } else if (answered === total) {
        els.remaining.textContent = '已答完，可以提交';
      } else {
        els.remaining.textContent = '还剩 ' + (total - answered) + ' 题';
      }
    }
    if (els.submit) {
      els.submit.disabled = state.submitted;
      els.submit.innerHTML = state.submitted ? '已评分' : '提交并评分 <span aria-hidden="true">→</span>';
    }

    SUBJECTS.forEach(function (subject) {
      var chip = document.querySelector('[data-scope="' + subject.id + '"]');
      if (!chip) return;
      var count = subject.questions.filter(isAnswered).length;
      chip.classList.toggle('is-part', count > 0 && count < subject.questions.length);
      chip.classList.toggle('is-done', count === subject.questions.length);
      var em = chip.querySelector('em');
      if (em) em.textContent = count + '/' + subject.questions.length;
    });
  };

  var renderResult = function () {
    if (!els.result || !state.result) return;
    var r = state.result;
    var color = r.score >= 80 ? '#5EEAD4' : r.score >= 60 ? '#F5C98A' : '#FDA4AF';
    var wrongCount = ALL.filter(function (q) { return chosen(q) !== q.answer; }).length;
    var weak = r.weak;
    var weakHtml = weak.length
      ? '<div class="weak-chips">' + weak.map(function (s) {
          var href = s.course ? './' + s.course.href : '#subject-' + s.id;
          return '<a class="weak-chip" href="' + esc(href) + '">' + esc(s.no + ' ' + s.title) + ' · ' + s.score + '/10 →</a>';
        }).join('') + '</div>'
      : '<span class="result-perfect">10 个科目全部 ≥7 分，可以进入毕业项目答辩。</span>';

    els.result.innerHTML =
      '<div class="result-top">' +
        '<div class="score-orb" style="--score:' + r.score + ';--score-color:' + color + '">' +
          '<b>' + r.score + '</b><span>/ 100</span>' +
        '</div>' +
        '<div class="result-grade">' +
          '<div class="section-kicker">OVERALL SCORE · ' + r.correctSubjects + '/10 SUBJECTS PASSED</div>' +
          '<h2><i>' + esc(r.grade.code) + '</i>' + esc(r.grade.label) + '</h2>' +
          '<p>' + esc(r.grade.note) + ' 选择题 ' + r.choiceScore + '/20，终端指令 ' + r.commandScore + '/20，改错题 ' + r.debugScore + '/60；按单科 10 分计算，' + (r.correctSubjects === 10 ? '十科全部达标。' : '有 ' + (10 - r.correctSubjects) + ' 个科目低于 7/10。') + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="result-metrics">' +
        '<div class="result-metric"><span>知识选择</span><b>' + r.choiceScore + '<i>/20</i></b></div>' +
        '<div class="result-metric"><span>终端指令</span><b>' + r.commandScore + '<i>/20</i></b></div>' +
        '<div class="result-metric"><span>代码改错</span><b>' + r.debugScore + '<i>/60</i></b></div>' +
        '<div class="result-metric"><span>单科达标</span><b>' + r.correctSubjects + '<i>/10</i></b></div>' +
      '</div>' +
      '<div class="result-subjects">' + r.subjects.map(function (s) {
        var href = s.course ? './' + s.course.href : '#subject-' + s.id;
        return '<a class="result-subject' + (s.score < 7 ? ' is-weak' : '') + '" href="' + esc(href) + '">' +
          '<div class="rs-top"><span class="rs-name">' + esc(s.no + ' ' + s.title) + '</span><span class="rs-score">' + s.score + '/10</span></div>' +
          '<div class="rs-bar"><i style="width:' + (s.score / 10 * 100) + '%"></i></div>' +
        '</a>';
      }).join('') + '</div>' +
      '<div class="result-lower">' +
        '<div class="result-weak"><span>NEXT · 薄弱科目</span>' + weakHtml + '</div>' +
        '<div class="result-actions">' +
          (wrongCount ? '<button type="button" class="result-btn" data-exam-review>查看失分题 · ' + wrongCount + '</button>' : '') +
          '<button type="button" class="result-btn primary" data-exam-retry>重新考试</button>' +
          '<a class="result-btn" href="./fullstack.html?v=20261126z85">回到全栈路线</a>' +
        '</div>' +
      '</div>';

    els.result.hidden = false;
  };

  var doSubmit = function () {
    if (state.submitted) return;
    state.result = calculate();
    state.submitted = true;
    try { localStorage.setItem(SUBMITTED_KEY, '1'); } catch (error) {}
    renderResult();
    renderSheet();
    renderDock();
    window.setTimeout(function () {
      if (els.result) els.result.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };

  var askSubmit = function () {
    var left = ALL.length - answeredCount();
    if (!left) { doSubmit(); return; }
    if (els.dialog && typeof els.dialog.showModal === 'function') {
      if (els.dialogCount) els.dialogCount.textContent = String(left);
      if (els.dialogText) els.dialogText.textContent = '未答按 0 分计。现在提交，整体评分会把这些题算作失分。';
      els.dialog.showModal();
      return;
    }
    if (window.confirm('还有 ' + left + ' 题没答，未答按 0 分计。仍然提交？')) doSubmit();
  };

  var reset = function () {
    state.answers = {};
    state.submitted = false;
    state.result = null;
    try { localStorage.removeItem(KEY); localStorage.removeItem(SUBMITTED_KEY); } catch (error) {}
    if (els.result) { els.result.hidden = true; els.result.innerHTML = ''; }
    renderSheet();
    renderDock();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  var reviewWrong = function () {
    var first = els.sheet && (els.sheet.querySelector('.exam-q.is-wrong') || els.sheet.querySelector('.exam-q:not(.is-correct)'));
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (els.sheet) {
    els.sheet.addEventListener('change', function (event) {
      var input = event.target.closest('input[type="radio"]');
      if (!input || state.submitted) return;
      state.answers[input.name] = Number(input.value);
      saveAnswers();
      var card = input.closest('.exam-q');
      if (card) card.classList.add('has-answer');
      renderDock();
    });
  }

  if (els.submit) els.submit.addEventListener('click', askSubmit);

  if (els.dialog) {
    els.dialog.addEventListener('click', function (event) {
      var action = event.target.closest('[data-dialog]');
      if (!action) return;
      if (action.getAttribute('data-dialog') === 'confirm') {
        els.dialog.close();
        doSubmit();
      } else {
        els.dialog.close();
      }
    });
    els.dialog.addEventListener('click', function (event) {
      if (event.target === els.dialog) els.dialog.close();
    });
  }

  if (els.result) {
    els.result.addEventListener('click', function (event) {
      if (event.target.closest('[data-exam-retry]')) { reset(); return; }
      if (event.target.closest('[data-exam-review]')) reviewWrong();
    });
  }

  renderHero();
  renderBlueprint();
  state.submitted = loadSubmitted();
  if (state.submitted) {
    state.result = calculate();
    renderResult();
  }
  renderSheet();
  renderDock();

  if (window.console && ALL.length !== 60) {
    console.warn('[fullstack-exam] expected 60 questions, got ' + ALL.length);
  }
})();

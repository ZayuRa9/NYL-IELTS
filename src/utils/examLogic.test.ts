import test from 'node:test';
import assert from 'node:assert/strict';
import mammoth from 'mammoth';
import {
  computeQuestionTypeAnalytics,
  countWords,
  evaluateSubmissionAgainstExam,
  extractViolationCountFromAudit,
  formatTimer,
  getIeltsAcademicReadingBand,
  getModuleSequence,
  isIeltsAnswerCorrect,
  parseRawExamText,
  parseStudentSubmissionText,
  processAntiCheatViolation,
} from './examLogic';
import { buildHiddenAuditText, generateSubmissionDocxBuffer } from './docxExport';
import { getHighlightScopeId, splitTextByHighlights } from './highlightLogic';
import { DEFAULT_EXAMS } from '../data/defaultExams';
import { AntiCheatState } from '../types/exam';

test('countWords handles empty, whitespace, and multi-line IELTS essay text', () => {
  assert.equal(countWords(''), 0);
  assert.equal(countWords('   \n\t  '), 0);
  assert.equal(countWords('The bar chart illustrates renewable electricity generation.'), 7);
  assert.equal(countWords('Line one.\n\nLine two   has   five words.'), 7);
});

test('formatTimer returns authentic CDI remaining minutes, MM:SS, and urgency levels', () => {
  const normal = formatTimer(3600);
  assert.equal(normal.clockText, '60:00');
  assert.equal(normal.minutesText, '60 minutes remaining');
  assert.equal(normal.urgency, 'normal');

  const warning = formatTimer(590);
  assert.equal(warning.clockText, '09:50');
  assert.equal(warning.minutesText, '10 minutes remaining');
  assert.equal(warning.urgency, 'warning');

  const critical = formatTimer(45);
  assert.equal(critical.clockText, '00:45');
  assert.equal(critical.minutesText, '1 minute remaining');
  assert.equal(critical.urgency, 'critical');
});

test('processAntiCheatViolation warns on 1st offense and forces restart on 2nd offense', () => {
  const initial: AntiCheatState = {
    violationCount: 0,
    restartCount: 0,
    violationHistory: [],
    activeLockModal: 'none',
  };

  // First violation: warning only, no reset
  const first = processAntiCheatViolation(initial, 'fullscreen_exit', '2026-11-18T10:00:00.000Z');
  assert.equal(first.shouldResetExam, false);
  assert.equal(first.nextState.violationCount, 1);
  assert.equal(first.nextState.restartCount, 0);
  assert.equal(first.nextState.activeLockModal, 'warning_1');

  // Calling while modal is open does not double-count
  const duplicateWhileLocked = processAntiCheatViolation(first.nextState, 'window_blur');
  assert.equal(duplicateWhileLocked.nextState.violationCount, 1);

  // Resume exam then trigger 2nd violation -> forced restart!
  const resumed: AntiCheatState = { ...first.nextState, activeLockModal: 'none' };
  const second = processAntiCheatViolation(resumed, 'window_blur', '2026-11-18T10:02:00.000Z');
  assert.equal(second.shouldResetExam, true);
  assert.equal(second.nextState.violationCount, 2);
  assert.equal(second.nextState.restartCount, 1);
  assert.equal(second.nextState.activeLockModal, 'forced_restart');
  assert.equal(second.nextState.violationHistory.length, 2);
});

test('getModuleSequence resolves full test order vs single module', () => {
  assert.equal(DEFAULT_EXAMS.length, 1);
  const nov18Exam = DEFAULT_EXAMS[0];
  assert.equal(nov18Exam.id, 'ielts-reading-nov-18-2026');
  assert.deepEqual(getModuleSequence(nov18Exam, 'full'), ['listening', 'reading', 'writing']);
  assert.deepEqual(getModuleSequence(nov18Exam, 'listening'), ['listening']);
  assert.deepEqual(getModuleSequence(nov18Exam, 'reading'), ['reading']);
  assert.deepEqual(getModuleSequence(nov18Exam, 'writing'), ['writing']);
  const totalQ = nov18Exam.reading?.passages.reduce(
    (sum, p) => sum + p.questionGroups.reduce((gs, g) => gs + g.questions.length, 0),
    0
  );
  assert.equal(totalQ, 40);
  assert.equal(nov18Exam.writing?.tasks.length, 2);
  assert.equal(nov18Exam.writing?.tasks[0].svgChartType, 'line-wfh-2016-2026');

  const threeSkillExam = {
    ...nov18Exam,
    listening: {
      durationSeconds: 1920,
      parts: [
        {
          id: 'p1',
          title: 'Part 1',
          instruction: 'Fill',
          questionGroups: [{ id: 'g1', title: 'Q1', instruction: 'Fill', type: 'fill-blank' as const, questions: [{ number: 1, prompt: 'Test ___' }] }],
        },
      ],
    },
  };
  assert.deepEqual(getModuleSequence(threeSkillExam, 'full'), ['listening', 'reading', 'writing']);
  assert.deepEqual(getModuleSequence(threeSkillExam, 'reading'), ['reading']);
});

test('parseRawExamText parses Reading and Writing blocks from uploaded text', () => {
  const sample = `
READING
PASSAGE 1
Solar Cities of Tomorrow
Urban buildings are adopting photovoltaic glass panels across rooftops.

QUESTIONS 1-2
1. Photovoltaic glass panels can replace traditional windows. TRUE
2. Cities have stopped using stone facades.

WRITING
TASK 1
Summarise the pie chart showing household energy usage.
TASK 2
Some people think remote work reduces productivity. Discuss.
  `;
  const parsed = parseRawExamText(sample, 'Imported Sample Exam');
  assert.equal(parsed.title, 'Imported Sample Exam');
  assert.equal(parsed.reading?.passages.length, 1);
  assert.equal(parsed.reading?.passages[0].title, 'Solar Cities of Tomorrow');
  assert.equal(parsed.writing?.tasks.length, 2);
  assert.equal(parsed.writing?.tasks[1].minWords, 250);
});

test('generateSubmissionDocxBuffer creates valid Word file with candidate answers and white-text violation audit', async () => {
  const baseExam = DEFAULT_EXAMS[0];
  const exam = {
    ...baseExam,
    listening: {
      durationSeconds: 1920,
      parts: [
        {
          id: 'l-p1',
          title: 'Part 1',
          instruction: 'Fill',
          questionGroups: [
            {
              id: 'l-g1',
              title: 'Q1-2',
              instruction: 'Fill',
              type: 'fill-blank' as const,
              questions: [
                { number: 1, prompt: 'Surname: ___' },
                { number: 2, prompt: 'Street: ___' },
              ],
            },
          ],
        },
      ],
    },
  };
  const payload = {
    exam,
    candidate: { fullName: 'Nguyen Minh Anh', candidateId: 'VN2026-089' },
    selectionMode: 'full' as const,
    answers: {
      listening: { 1: 'Thornton', 2: 'Maple' },
      reading: { 1: 'FALSE', 7: 'axe' },
      writing: {
        1: 'The line graph compares remote work adoption across four countries.',
        2: 'Tourism restrictions protect heritage communities while balancing local revenue.',
      },
    },
    completedModules: [
      { module: 'listening' as const, durationUsedSeconds: 1800, submittedAt: '2026-11-18T10:30:00.000Z' },
    ],
    submittedAt: '2026-11-18T11:30:00.000Z',
    antiCheat: {
      violationCount: 2,
      restartCount: 1,
      violationHistory: [
        {
          timestamp: '2026-11-18T10:05:00.000Z',
          reason: 'fullscreen_exit' as const,
          actionTaken: 'warning' as const,
        },
        {
          timestamp: '2026-11-18T10:12:00.000Z',
          reason: 'window_blur' as const,
          actionTaken: 'forced_restart' as const,
        },
      ],
    },
  };

  const bytes = await generateSubmissionDocxBuffer(payload);
  assert.ok(bytes.byteLength > 2000, 'Generated .docx should be non-empty');

  // Verify extracted text via mammoth contains candidate answers AND hidden violation audit line
  const extracted = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
  assert.match(extracted.value, /Nguyen Minh Anh/);
  assert.match(extracted.value, /Thornton/);
  assert.match(extracted.value, /remote work adoption/);
  assert.match(extracted.value, /vi pham 2 lan/);
  assert.match(extracted.value, /thi lai tu dau: 1 lan/);

  const auditStr = buildHiddenAuditText(payload);
  assert.ok(auditStr.includes('2 lan'));
});

test('Nov 18 Reading exam has all 40 answer keys & explanations and grades .docx round-trip accurately', async () => {
  const nov18 = DEFAULT_EXAMS[0];
  const questions = nov18.reading!.passages.flatMap((p) =>
    p.questionGroups.flatMap((g) => g.questions)
  );
  assert.equal(questions.length, 40);
  questions.forEach((q) => {
    assert.ok(q.answerKey && q.answerKey.length > 0, `Q${q.number} missing answerKey`);
    assert.ok(q.explanation && q.explanation.length > 0, `Q${q.number} missing explanation`);
  });

  // Accepted answer variants
  assert.equal(isIeltsAnswerCorrect('6 months', 'six months|6 months'), true);
  assert.equal(isIeltsAnswerCorrect('  ONE HOUR ', 'an hour|one hour|1 hour'), true);
  assert.equal(isIeltsAnswerCorrect('weather-routing', 'weather-routing'), true);
  assert.equal(isIeltsAnswerCorrect('wrong', 'TRUE'), false);

  assert.equal(getIeltsAcademicReadingBand(40), 9.0);
  assert.equal(getIeltsAcademicReadingBand(30), 7.0);
  assert.equal(getIeltsAcademicReadingBand(23), 6.0);

  // Round-trip export -> mammoth extract -> parseStudentSubmissionText
  const bytes = await generateSubmissionDocxBuffer({
    exam: nov18,
    candidate: { fullName: 'Le Hoang Nam', candidateId: 'RD-1811' },
    selectionMode: 'reading',
    answers: {
      listening: {},
      reading: { 1: 'TRUE', 7: 'axe', 8: '6 months', 14: 'iii', 24: 'weather-routing', 40: 'A' },
      writing: {},
    },
    completedModules: [
      { module: 'reading', durationUsedSeconds: 2400, submittedAt: '2026-11-18T11:00:00.000Z' },
    ],
    submittedAt: '2026-11-18T11:00:00.000Z',
    antiCheat: { violationCount: 0, restartCount: 0, violationHistory: [] },
  });

  const extracted = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
  const parsed = parseStudentSubmissionText(extracted.value);
  assert.equal(parsed.candidateName, 'Le Hoang Nam');
  assert.equal(parsed.candidateId, 'RD-1811');
  assert.equal(parsed.readingAnswers[1], 'TRUE');
  assert.equal(parsed.readingAnswers[8], '6 months');
  assert.equal(parsed.readingAnswers[24], 'weather-routing');
  assert.match(parsed.auditLine, /So lan vi pham: 0 lan/);
  // Reading-only stop should omit unattempted Writing section in .docx
  assert.equal(extracted.value.includes('III. WRITING RESPONSES'), false);
});

test('Nov 18 Full exam exports both Reading and Writing essays when both sections are completed', async () => {
  const nov18 = DEFAULT_EXAMS[0];
  const bytes = await generateSubmissionDocxBuffer({
    exam: nov18,
    candidate: { fullName: 'Tran Thu Ha', candidateId: 'RW-1811' },
    selectionMode: 'full',
    answers: {
      listening: {},
      reading: { 1: 'TRUE' },
      writing: {
        1: 'The line graph illustrates the proportion of employees working remotely at least three days weekly.',
        2: 'While restricting visitor numbers may reduce revenue, preserving heritage sites is vital.',
      },
    },
    completedModules: [
      { module: 'reading', durationUsedSeconds: 3000, submittedAt: '2026-11-18T11:00:00.000Z' },
      { module: 'writing', durationUsedSeconds: 3400, submittedAt: '2026-11-18T12:00:00.000Z' },
    ],
    submittedAt: '2026-11-18T12:00:00.000Z',
    antiCheat: { violationCount: 0, restartCount: 0, violationHistory: [] },
  });

  const extracted = await mammoth.extractRawText({ buffer: Buffer.from(bytes) });
  assert.match(extracted.value, /II\. READING RESPONSES/);
  assert.match(extracted.value, /III\. WRITING RESPONSES/);
  assert.match(extracted.value, /employees working remotely/);
  assert.match(extracted.value, /preserving heritage sites/);
});

test('evaluateSubmissionAgainstExam and computeQuestionTypeAnalytics compute per-question-type trends accurately', () => {
  const nov18 = DEFAULT_EXAMS[0];
  assert.equal(extractViolationCountFromAudit('So lan vi pham: 0 lan | So lan lam lai tu dau: 0 lan.'), 0);
  assert.equal(extractViolationCountFromAudit('Thi sinh da vi pham 2 lan | So lan bi bat thi lai tu dau: 1 lan.'), 2);

  // Build submission 1: strong on TFNG & Flow-chart, weak on Matching
  const allQuestions = nov18.reading!.passages.flatMap((p) =>
    p.questionGroups.flatMap((g) => g.questions.map((q) => ({ type: g.type, q })))
  );

  const answersStudent1: Record<number, string> = {};
  const answersStudent2: Record<number, string> = {};
  allQuestions.forEach(({ type, q }) => {
    const firstKey = (q.answerKey || '').split('|')[0];
    // Student 1 gets TFNG + flow-chart right, matching wrong
    if (type === 'true-false-ng' || type === 'flow-chart') {
      answersStudent1[q.number] = firstKey;
    } else {
      answersStudent1[q.number] = 'WRONG';
    }
    // Student 2 gets everything right
    answersStudent2[q.number] = firstKey;
  });

  const rec1 = evaluateSubmissionAgainstExam(
    {
      candidateName: 'Nguyen An',
      candidateId: 'HV-01',
      readingAnswers: answersStudent1,
      listeningAnswers: {},
      auditLine: 'Thi sinh da vi pham 1 lan',
    },
    nov18,
    '2026-11-18T09:00:00.000Z',
    'sub-1'
  );

  const rec2 = evaluateSubmissionAgainstExam(
    {
      candidateName: 'Tran Binh',
      candidateId: 'HV-02',
      readingAnswers: answersStudent2,
      listeningAnswers: {},
      auditLine: 'So lan vi pham: 0 lan',
    },
    nov18,
    '2026-11-18T10:00:00.000Z',
    'sub-2'
  );

  assert.equal(rec1.violationCount, 1);
  assert.equal(rec2.readingCorrect, 40);
  assert.equal(rec2.bandScore, 9.0);

  const analytics = computeQuestionTypeAnalytics([rec2, rec1], 'all', '');
  assert.equal(analytics.summary.submissionCount, 2);
  // Trend series is chronological: rec1 (09:00) then rec2 (10:00)
  assert.equal(analytics.trendSeries[0].id, 'sub-1');
  assert.equal(analytics.trendSeries[1].id, 'sub-2');
  assert.equal(analytics.trendSeries[0]['true-false-ng'], 100);
  assert.equal(analytics.trendSeries[0]['matching'], 0);
  assert.equal(analytics.trendSeries[1]['matching'], 100);

  // Average accuracy across matching is 50%, TFNG is 100%
  const tfngAvg = analytics.typeAverages.find((t) => t.questionType === 'true-false-ng');
  const matchingAvg = analytics.typeAverages.find((t) => t.questionType === 'matching');
  assert.equal(tfngAvg?.avgAccuracyPct, 100);
  assert.equal(matchingAvg?.avgAccuracyPct, 50);
  assert.equal(analytics.summary.strongestType?.questionType, 'true-false-ng');
  assert.equal(analytics.summary.weakestType?.questionType, 'matching');

  // Filter by search query
  const filtered = computeQuestionTypeAnalytics([rec2, rec1], 'all', 'Binh');
  assert.equal(filtered.summary.submissionCount, 1);
  assert.equal(filtered.filteredRecords[0].candidateId, 'HV-02');
});

test('Merged exam contains complete 40-question Listening section with neutral branding and .docx grading', async () => {
  const mergedExam = DEFAULT_EXAMS.find((e) => e.id === 'ielts-reading-nov-18-2026');
  assert.ok(mergedExam, 'Merged Nov 18 exam should exist in DEFAULT_EXAMS');
  assert.ok(mergedExam.listening, 'Listening section should exist inside merged exam');
  assert.ok(mergedExam.reading, 'Reading section should exist inside merged exam');
  assert.ok(mergedExam.writing, 'Writing section should exist inside merged exam');
  assert.equal(mergedExam.listening.parts.length, 4);

  const serializedLower = JSON.stringify(mergedExam).toLowerCase();
  assert.equal(serializedLower.includes('cambridge'), false);
  assert.equal(serializedLower.includes('engnovate'), false);
  assert.equal(serializedLower.includes('test 1'), false);

  const allQuestions = mergedExam.listening.parts.flatMap((p) =>
    p.questionGroups.flatMap((g) => g.questions)
  );
  assert.equal(allQuestions.length, 40);
  allQuestions.forEach((q, idx) => {
    assert.equal(q.number, idx + 1);
    assert.ok(q.answerKey && q.answerKey.trim().length > 0, `Q${q.number} missing answerKey`);
    assert.ok(q.explanation && q.explanation.trim().length > 0, `Q${q.number} missing explanation`);
  });

  const listeningAnswers: Record<number, string> = {};
  allQuestions.forEach((q) => {
    listeningAnswers[q.number] = (q.answerKey || '').split('|')[0];
  });

  const buf = await generateSubmissionDocxBuffer({
    exam: mergedExam,
    candidate: { fullName: 'Pham Gia Bao', candidateId: 'HV-L01' },
    selectionMode: 'listening',
    answers: { listening: listeningAnswers, reading: {}, writing: {} },
    completedModules: [
      { module: 'listening', durationUsedSeconds: 1850, submittedAt: '2026-11-18T11:00:00.000Z' },
    ],
    submittedAt: '2026-11-18T11:00:00.000Z',
    antiCheat: { violationCount: 0, restartCount: 0, violationHistory: [] },
  });

  const extracted = await mammoth.extractRawText({ buffer: Buffer.from(buf) });
  const parsed = parseStudentSubmissionText(extracted.value);
  assert.equal(parsed.candidateName, 'Pham Gia Bao');
  assert.equal(parsed.listeningAnswers[1], '10');
  assert.equal(parsed.listeningAnswers[21], 'B');
  assert.equal(parsed.listeningAnswers[40], 'soil');

  const graded = evaluateSubmissionAgainstExam(parsed, mergedExam, '2026-11-18T11:05:00.000Z', 'sub-l1');
  assert.equal(graded.readingCorrect, 40);
  assert.equal(graded.readingTotal, 40);
  assert.equal(graded.bandScore, 9.0);
  assert.ok(graded.byQuestionType.some((b) => b.questionType === 'fill-blank' && b.total === 20));
  assert.ok(graded.byQuestionType.some((b) => b.questionType === 'multiple-choice' && b.total === 10));
  assert.ok(graded.byQuestionType.some((b) => b.questionType === 'matching' && b.total === 10));
});

test('highlightLogic scopes Listening, Reading, Writing independently and splits text segments cleanly', () => {
  assert.equal(getHighlightScopeId('listening', 'part-1'), 'listening:part-1');
  assert.equal(getHighlightScopeId('reading', 'p1'), 'reading:p1');
  assert.equal(getHighlightScopeId('writing', 'task-1'), 'writing:task-1');

  const segments = splitTextByHighlights(
    'Employees working from home at least three days a week in 2026.',
    [
      { id: 'n1', passageId: 'writing:task-1', text: '', note: 'Outline: overview + body 1' },
      { id: 'h1', passageId: 'writing:task-1', text: 'three days a week', note: 'Key frequency' },
      { id: 'h2', passageId: 'writing:task-1', text: '2026' },
    ]
  );

  const highlightedTexts = segments.filter((s) => s.type === 'highlight').map((s) => s.text);
  assert.deepEqual(highlightedTexts, ['three days a week', '2026']);
  assert.equal(segments.map((s) => s.text).join(''), 'Employees working from home at least three days a week in 2026.');
});



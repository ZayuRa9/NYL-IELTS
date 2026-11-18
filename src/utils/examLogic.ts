import {
  AntiCheatState,
  ExamAttemptAnswers,
  ExamFlaggedQuestions,
  ExamModule,
  ExamSelectionMode,
  GradedSubmissionRecord,
  IeltsExam,
  ListeningPart,
  QuestionGroup,
  QuestionItem,
  QuestionType,
  QuestionTypeBreakdown,
  ReadingPassage,
  ViolationEvent,
  WritingTask,
} from '../types/exam';

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function formatTimer(totalSeconds: number): {
  minutesText: string;
  clockText: string;
  urgency: 'normal' | 'warning' | 'critical';
} {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  const ceilMins = Math.max(1, Math.ceil(safe / 60));
  const clockText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const minutesText = safe === 0 ? '0 minutes remaining' : `${ceilMins} ${ceilMins === 1 ? 'minute' : 'minutes'} remaining`;

  let urgency: 'normal' | 'warning' | 'critical' = 'normal';
  if (safe <= 300) {
    urgency = 'critical';
  } else if (safe <= 600) {
    urgency = 'warning';
  }
  return { minutesText, clockText, urgency };
}

export function getAvailableModules(exam: IeltsExam): ExamModule[] {
  const modules: ExamModule[] = [];
  if (exam.listening && exam.listening.parts.length > 0) modules.push('listening');
  if (exam.reading && exam.reading.passages.length > 0) modules.push('reading');
  if (exam.writing && exam.writing.tasks.length > 0) modules.push('writing');
  return modules;
}

export function getModuleSequence(exam: IeltsExam, mode: ExamSelectionMode): ExamModule[] {
  const available = getAvailableModules(exam);
  if (mode === 'full') return available;
  return available.includes(mode) ? [mode] : available.slice(0, 1);
}

export function getInitialDurationSeconds(exam: IeltsExam, module: ExamModule): number {
  if (module === 'listening') return exam.listening?.durationSeconds ?? 1920; // 32 min CDI standard
  if (module === 'reading') return exam.reading?.durationSeconds ?? 3600; // 60 min
  return exam.writing?.durationSeconds ?? 3600; // 60 min
}

export interface FlattenedQuestionRef {
  number: number;
  containerIndex: number; // Part index, Passage index, or Task index
}

export function flattenModuleQuestions(exam: IeltsExam, module: ExamModule): FlattenedQuestionRef[] {
  const refs: FlattenedQuestionRef[] = [];
  if (module === 'listening' && exam.listening) {
    exam.listening.parts.forEach((part, pIdx) => {
      part.questionGroups.forEach((group) => {
        group.questions.forEach((q) => {
          refs.push({ number: q.number, containerIndex: pIdx });
        });
      });
    });
  } else if (module === 'reading' && exam.reading) {
    exam.reading.passages.forEach((passage, pIdx) => {
      passage.questionGroups.forEach((group) => {
        group.questions.forEach((q) => {
          refs.push({ number: q.number, containerIndex: pIdx });
        });
      });
    });
  } else if (module === 'writing' && exam.writing) {
    exam.writing.tasks.forEach((task, tIdx) => {
      refs.push({ number: task.taskNumber, containerIndex: tIdx });
    });
  }
  return refs;
}

export function processAntiCheatViolation(
  prevState: AntiCheatState,
  reason: ViolationEvent['reason'],
  timestamp: string = new Date().toISOString()
): {
  nextState: AntiCheatState;
  shouldResetExam: boolean;
} {
  // If a lock modal is already active, do not double-count the same interruption
  if (prevState.activeLockModal !== 'none') {
    return { nextState: prevState, shouldResetExam: false };
  }

  const nextViolationCount = prevState.violationCount + 1;
  const isSecondOrLater = nextViolationCount >= 2;
  const actionTaken: ViolationEvent['actionTaken'] = isSecondOrLater ? 'forced_restart' : 'warning';

  const event: ViolationEvent = {
    timestamp,
    reason,
    actionTaken,
  };

  return {
    shouldResetExam: isSecondOrLater,
    nextState: {
      violationCount: nextViolationCount,
      restartCount: isSecondOrLater ? prevState.restartCount + 1 : prevState.restartCount,
      violationHistory: [...prevState.violationHistory, event],
      activeLockModal: isSecondOrLater ? 'forced_restart' : 'warning_1',
      lastViolationReason: reason,
    },
  };
}

export function createEmptyAnswers(): ExamAttemptAnswers {
  return {
    listening: {},
    reading: {},
    writing: {},
  };
}

export function createEmptyFlagged(): ExamFlaggedQuestions {
  return {
    listening: [],
    reading: [],
    writing: [],
  };
}

export function getViolationReasonLabel(reason?: ViolationEvent['reason']): string {
  switch (reason) {
    case 'fullscreen_exit':
      return 'Thoát chế độ toàn màn hình (Fullscreen)';
    case 'window_blur':
      return 'Phần mềm/cửa sổ khác chèn lên hoặc mất tiêu điểm màn hình thi';
    case 'tab_hidden':
      return 'Chuyển tab hoặc thu nhỏ trình duyệt';
    default:
      return 'Rời khỏi màn hình làm bài thi';
  }
}

export function normalizeIeltsAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function isIeltsAnswerCorrect(candidateAnswer: string, answerKey?: string): boolean {
  if (!answerKey) return false;
  const cleanCandidate = normalizeIeltsAnswer(candidateAnswer);
  if (!cleanCandidate) return false;
  const accepted = answerKey
    .split('|')
    .map((v) => normalizeIeltsAnswer(v))
    .filter(Boolean);
  return accepted.includes(cleanCandidate);
}

export function getIeltsAcademicReadingBand(correctCount: number): number {
  if (correctCount >= 39) return 9.0;
  if (correctCount >= 37) return 8.5;
  if (correctCount >= 35) return 8.0;
  if (correctCount >= 33) return 7.5;
  if (correctCount >= 30) return 7.0;
  if (correctCount >= 27) return 6.5;
  if (correctCount >= 23) return 6.0;
  if (correctCount >= 19) return 5.5;
  if (correctCount >= 15) return 5.0;
  if (correctCount >= 13) return 4.5;
  if (correctCount >= 10) return 4.0;
  if (correctCount >= 8) return 3.5;
  if (correctCount >= 6) return 3.0;
  if (correctCount >= 4) return 2.5;
  return correctCount > 0 ? 2.0 : 0;
}

export interface ParsedStudentDocxSubmission {
  candidateName: string;
  candidateId: string;
  readingAnswers: Record<number, string>;
  listeningAnswers: Record<number, string>;
  auditLine: string;
}

export function parseStudentSubmissionText(rawText: string): ParsedStudentDocxSubmission {
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  let candidateName = '';
  let candidateId = '';
  let auditLine = '';
  const readingAnswers: Record<number, string> = {};
  const listeningAnswers: Record<number, string> = {};
  let section: 'none' | 'listening' | 'reading' | 'writing' = 'none';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('Họ và tên thí sinh:')) {
      candidateName = line.replace('Họ và tên thí sinh:', '').trim();
      continue;
    }
    if (line.startsWith('Số báo danh (Candidate ID):')) {
      candidateId = line.replace('Số báo danh (Candidate ID):', '').trim();
      continue;
    }
    if (line.includes('[NHAT KY GIAM SAT THI')) {
      auditLine = line;
      continue;
    }
    if (/^I\.\s*LISTENING RESPONSES/i.test(line)) {
      section = 'listening';
      continue;
    }
    if (/^II\.\s*READING RESPONSES/i.test(line)) {
      section = 'reading';
      continue;
    }
    if (/^III\.\s*WRITING RESPONSES/i.test(line)) {
      section = 'writing';
      continue;
    }

    if ((section === 'reading' || section === 'listening') && /^\d{1,2}$/.test(line)) {
      const qNum = parseInt(line, 10);
      const answerCell = lines[i + 2] ?? '';
      const cleanAns = answerCell === '(Bỏ trống)' ? '' : answerCell;
      if (qNum >= 1 && qNum <= 40) {
        if (section === 'reading') {
          readingAnswers[qNum] = cleanAns;
        } else {
          listeningAnswers[qNum] = cleanAns;
        }
      }
      i += 2;
    }
  }

  return {
    candidateName,
    candidateId,
    readingAnswers,
    listeningAnswers,
    auditLine,
  };
}

export const ALL_QUESTION_TYPES: QuestionType[] = [
  'true-false-ng',
  'yes-no-ng',
  'multiple-choice',
  'fill-blank',
  'flow-chart',
  'matching',
];

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  'true-false-ng': 'TRUE / FALSE / NOT GIVEN',
  'yes-no-ng': 'YES / NO / NOT GIVEN',
  'multiple-choice': 'Multiple Choice',
  'fill-blank': 'Gap Fill / Summary',
  'flow-chart': 'Flow-Chart Completion',
  matching: 'Matching / Headings',
};

export const QUESTION_TYPE_SHORT_LABELS: Record<QuestionType, string> = {
  'true-false-ng': 'TFNG',
  'yes-no-ng': 'YNNG',
  'multiple-choice': 'MCQ',
  'fill-blank': 'Gap Fill',
  'flow-chart': 'Flow-Chart',
  matching: 'Matching',
};

export function extractViolationCountFromAudit(auditLine?: string): number {
  if (!auditLine) return 0;
  const match = auditLine.match(/(?:vi pham|So lan vi pham:)\s*(\d+)\s*lan/i);
  if (!match) return 0;
  return parseInt(match[1], 10) || 0;
}

export function evaluateSubmissionAgainstExam(
  parsed: ParsedStudentDocxSubmission,
  exam: IeltsExam,
  gradedAt: string = new Date().toISOString(),
  id?: string
): GradedSubmissionRecord {
  const buckets = new Map<QuestionType, { correct: number; total: number }>();
  let totalCorrect = 0;
  let totalQuestions = 0;

  const hasListening = Boolean(exam.listening?.parts && exam.listening.parts.length > 0);
  const hasReading = Boolean(exam.reading?.passages && exam.reading.passages.length > 0);
  const hasListeningSubmission = Object.keys(parsed.listeningAnswers || {}).length > 0;
  const hasReadingSubmission = Object.keys(parsed.readingAnswers || {}).length > 0;

  const shouldScoreListening =
    hasListening && (!hasReading || hasListeningSubmission || !hasReadingSubmission);
  const shouldScoreReading =
    hasReading && (!hasListening || hasReadingSubmission || !hasListeningSubmission);

  if (shouldScoreListening && exam.listening) {
    exam.listening.parts.forEach((part) => {
      part.questionGroups.forEach((group) => {
        const existing = buckets.get(group.type) || { correct: 0, total: 0 };
        group.questions.forEach((q) => {
          if (!q.answerKey) return;
          totalQuestions += 1;
          existing.total += 1;
          const studentAns = parsed.listeningAnswers[q.number] || '';
          if (isIeltsAnswerCorrect(studentAns, q.answerKey)) {
            totalCorrect += 1;
            existing.correct += 1;
          }
        });
        if (existing.total > 0) {
          buckets.set(group.type, existing);
        }
      });
    });
  }

  if (shouldScoreReading && exam.reading) {
    exam.reading.passages.forEach((passage) => {
      passage.questionGroups.forEach((group) => {
        const existing = buckets.get(group.type) || { correct: 0, total: 0 };
        group.questions.forEach((q) => {
          if (!q.answerKey) return;
          totalQuestions += 1;
          existing.total += 1;
          const studentAns = parsed.readingAnswers[q.number] || '';
          if (isIeltsAnswerCorrect(studentAns, q.answerKey)) {
            totalCorrect += 1;
            existing.correct += 1;
          }
        });
        if (existing.total > 0) {
          buckets.set(group.type, existing);
        }
      });
    });
  }

  const normalizedCorrectForBand =
    totalQuestions > 0 && totalQuestions !== 40
      ? Math.round((totalCorrect / totalQuestions) * 40)
      : totalCorrect;

  const byQuestionType: QuestionTypeBreakdown[] = ALL_QUESTION_TYPES.filter((qt) =>
    buckets.has(qt)
  ).map((qt) => {
    const stat = buckets.get(qt)!;
    return {
      questionType: qt,
      label: QUESTION_TYPE_LABELS[qt],
      correct: stat.correct,
      total: stat.total,
      accuracyPct: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
    };
  });

  return {
    id: id || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    examId: exam.id,
    examTitle: exam.title,
    candidateName: parsed.candidateName || 'Thí sinh',
    candidateId: parsed.candidateId || 'N/A',
    gradedAt,
    readingCorrect: totalCorrect,
    readingTotal: totalQuestions,
    bandScore: getIeltsAcademicReadingBand(normalizedCorrectForBand),
    readingAnswers: shouldScoreListening && !shouldScoreReading ? parsed.listeningAnswers : parsed.readingAnswers,
    byQuestionType,
    auditLine: parsed.auditLine,
    violationCount: extractViolationCountFromAudit(parsed.auditLine),
  };
}

export interface QuestionTypeAverageStat {
  questionType: QuestionType;
  label: string;
  shortLabel: string;
  totalCorrect: number;
  totalQuestions: number;
  submissionCount: number;
  avgAccuracyPct: number;
}

export interface SubmissionTrendPoint {
  id: string;
  sequenceLabel: string;
  candidateName: string;
  candidateId: string;
  examTitle: string;
  gradedAt: string;
  bandScore: number;
  overallPct: number;
  [questionTypeKey: string]: string | number;
}

export interface QuestionTypeAnalyticsResult {
  filteredRecords: GradedSubmissionRecord[];
  activeQuestionTypes: QuestionType[];
  typeAverages: QuestionTypeAverageStat[];
  trendSeries: SubmissionTrendPoint[];
  summary: {
    submissionCount: number;
    avgBandScore: number;
    avgOverallAccuracyPct: number;
    strongestType: QuestionTypeAverageStat | null;
    weakestType: QuestionTypeAverageStat | null;
  };
}

export function computeQuestionTypeAnalytics(
  records: GradedSubmissionRecord[],
  examFilterId: string = 'all',
  searchQuery: string = ''
): QuestionTypeAnalyticsResult {
  const cleanSearch = searchQuery.trim().toLowerCase();
  const filteredRecords = records.filter((rec) => {
    if (examFilterId !== 'all' && rec.examId !== examFilterId) return false;
    if (cleanSearch) {
      const nameMatch = rec.candidateName.toLowerCase().includes(cleanSearch);
      const idMatch = rec.candidateId.toLowerCase().includes(cleanSearch);
      const examMatch = rec.examTitle.toLowerCase().includes(cleanSearch);
      return nameMatch || idMatch || examMatch;
    }
    return true;
  });

  const sortedChronological = [...filteredRecords].sort(
    (a, b) => new Date(a.gradedAt).getTime() - new Date(b.gradedAt).getTime()
  );

  const typeTotals = new Map<
    QuestionType,
    { correct: number; total: number; submissions: number }
  >();

  const trendSeries: SubmissionTrendPoint[] = sortedChronological.map((rec, idx) => {
    const overallPct =
      rec.readingTotal > 0 ? Math.round((rec.readingCorrect / rec.readingTotal) * 100) : 0;
    const shortName =
      rec.candidateName.split(/\s+/).slice(-1)[0] || rec.candidateId || `#${idx + 1}`;

    const point: SubmissionTrendPoint = {
      id: rec.id,
      sequenceLabel: `#${idx + 1} ${shortName}`,
      candidateName: rec.candidateName,
      candidateId: rec.candidateId,
      examTitle: rec.examTitle,
      gradedAt: rec.gradedAt,
      bandScore: rec.bandScore,
      overallPct,
    };

    rec.byQuestionType.forEach((b) => {
      point[b.questionType] = b.accuracyPct;
      const acc = typeTotals.get(b.questionType) || {
        correct: 0,
        total: 0,
        submissions: 0,
      };
      acc.correct += b.correct;
      acc.total += b.total;
      acc.submissions += 1;
      typeTotals.set(b.questionType, acc);
    });

    return point;
  });

  const activeQuestionTypes = ALL_QUESTION_TYPES.filter((qt) => typeTotals.has(qt));
  const typeAverages: QuestionTypeAverageStat[] = activeQuestionTypes.map((qt) => {
    const stat = typeTotals.get(qt)!;
    return {
      questionType: qt,
      label: QUESTION_TYPE_LABELS[qt],
      shortLabel: QUESTION_TYPE_SHORT_LABELS[qt],
      totalCorrect: stat.correct,
      totalQuestions: stat.total,
      submissionCount: stat.submissions,
      avgAccuracyPct: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0,
    };
  });

  const submissionCount = filteredRecords.length;
  const avgBandScore =
    submissionCount > 0
      ? Number(
          (
            filteredRecords.reduce((sum, r) => sum + r.bandScore, 0) / submissionCount
          ).toFixed(1)
        )
      : 0;

  const totalQ = filteredRecords.reduce((sum, r) => sum + r.readingTotal, 0);
  const totalC = filteredRecords.reduce((sum, r) => sum + r.readingCorrect, 0);
  const avgOverallAccuracyPct = totalQ > 0 ? Math.round((totalC / totalQ) * 100) : 0;

  const sortedByAccuracy = [...typeAverages].sort(
    (a, b) => b.avgAccuracyPct - a.avgAccuracyPct
  );
  const strongestType = sortedByAccuracy[0] || null;
  const weakestType =
    sortedByAccuracy.length > 0 ? sortedByAccuracy[sortedByAccuracy.length - 1] : null;

  return {
    filteredRecords: [...sortedChronological].reverse(),
    activeQuestionTypes,
    typeAverages,
    trendSeries,
    summary: {
      submissionCount,
      avgBandScore,
      avgOverallAccuracyPct,
      strongestType,
      weakestType,
    },
  };
}

/**
 * Parses raw uploaded IELTS text (from .txt or .docx) into structured Listening, Reading, and Writing sections.
 */
export function parseRawExamText(rawText: string, defaultTitle = 'Đề thi IELTS nhập từ tệp'): Omit<IeltsExam, 'id' | 'createdAt' | 'updatedAt'> {
  const normalized = rawText.replace(/\r\n/g, '\n').trim();
  const lines = normalized.split('\n');

  const sectionMarkers: { type: ExamModule; index: number }[] = [];
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (/^#{0,3}\s*(SECTION\s*:?\s*)?LISTENING\b/i.test(trimmed)) {
      sectionMarkers.push({ type: 'listening', index: idx });
    } else if (/^#{0,3}\s*(SECTION\s*:?\s*)?READING\b/i.test(trimmed)) {
      sectionMarkers.push({ type: 'reading', index: idx });
    } else if (/^#{0,3}\s*(SECTION\s*:?\s*)?WRITING\b/i.test(trimmed)) {
      sectionMarkers.push({ type: 'writing', index: idx });
    }
  });

  // If no explicit section headers, assume it's a Reading test if long text or Writing if short prompt
  if (sectionMarkers.length === 0) {
    const parsedReading = parseReadingBlock(normalized);
    return {
      title: defaultTitle,
      category: 'Academic',
      reading: {
        durationSeconds: 3600,
        passages: [parsedReading],
      },
    };
  }

  const result: Omit<IeltsExam, 'id' | 'createdAt' | 'updatedAt'> = {
    title: defaultTitle,
    category: 'Academic',
  };

  for (let i = 0; i < sectionMarkers.length; i++) {
    const current = sectionMarkers[i];
    const nextIdx = i + 1 < sectionMarkers.length ? sectionMarkers[i + 1].index : lines.length;
    const blockText = lines.slice(current.index + 1, nextIdx).join('\n').trim();

    if (current.type === 'listening' && blockText) {
      result.listening = {
        durationSeconds: 1920,
        parts: parseListeningParts(blockText),
      };
    } else if (current.type === 'reading' && blockText) {
      result.reading = {
        durationSeconds: 3600,
        passages: parseReadingPassages(blockText),
      };
    } else if (current.type === 'writing' && blockText) {
      result.writing = {
        durationSeconds: 3600,
        tasks: parseWritingTasks(blockText),
      };
    }
  }

  return result;
}

function parseQuestionsFromText(block: string, startingNumber = 1): QuestionGroup[] {
  const lines = block.split('\n');
  const questions: QuestionItem[] = [];
  let currentQ: QuestionItem | null = null;
  let autoNum = startingNumber;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const qMatch = line.match(/^(?:Q(?:uestion)?\s*)?(\d{1,2})[.):]\s+(.+)$/i);
    const optMatch = line.match(/^([A-H])[.)]\s+(.+)$/);

    if (qMatch) {
      if (currentQ) questions.push(currentQ);
      const qNum = parseInt(qMatch[1], 10);
      autoNum = qNum + 1;
      currentQ = {
        number: qNum,
        prompt: qMatch[2].trim(),
      };
    } else if (optMatch && currentQ) {
      if (!currentQ.options) currentQ.options = [];
      currentQ.options.push(`${optMatch[1]}. ${optMatch[2].trim()}`);
    } else if (currentQ) {
      currentQ.prompt += ` ${line}`;
    }
  }
  if (currentQ) questions.push(currentQ);

  if (questions.length === 0) {
    questions.push({
      number: autoNum,
      prompt: block.slice(0, 300) || 'Complete the question below.',
    });
  }

  // Group into MCQ vs Fill-Blank / TFNG
  const groups: QuestionGroup[] = [];
  let currentGroup: QuestionGroup | null = null;

  for (const q of questions) {
    const isTfng = /\b(TRUE|FALSE|NOT GIVEN)\b/i.test(q.prompt);
    const qType: QuestionGroup['type'] = isTfng
      ? 'true-false-ng'
      : q.options && q.options.length > 0
      ? 'multiple-choice'
      : 'fill-blank';

    if (!currentGroup || currentGroup.type !== qType) {
      currentGroup = {
        id: `grp-${q.number}`,
        title: `Questions ${q.number}`,
        instruction:
          qType === 'true-false-ng'
            ? 'Do the following statements agree with the information given? Choose TRUE, FALSE, or NOT GIVEN.'
            : qType === 'multiple-choice'
            ? 'Choose the correct letter, A, B, C, or D.'
            : 'Complete the notes/sentences below. Write your answer in the box.',
        type: qType,
        options: qType === 'true-false-ng' ? ['TRUE', 'FALSE', 'NOT GIVEN'] : undefined,
        questions: [q],
      };
      groups.push(currentGroup);
    } else {
      currentGroup.questions.push(q);
      const firstNum = currentGroup.questions[0].number;
      const lastNum = q.number;
      currentGroup.title = firstNum === lastNum ? `Question ${firstNum}` : `Questions ${firstNum}–${lastNum}`;
    }
  }

  return groups;
}

function parseListeningParts(text: string): ListeningPart[] {
  const partSplits = text.split(/\n(?=(?:PART|SECTION)\s+[1-4]\b)/i).filter((s) => s.trim());
  if (partSplits.length === 0) {
    return [
      {
        id: 'part-1',
        title: 'Part 1',
        instruction: 'Listen and answer the questions.',
        questionGroups: parseQuestionsFromText(text, 1),
      },
    ];
  }

  let nextNum = 1;
  return partSplits.map((chunk, idx) => {
    const lines = chunk.trim().split('\n');
    const heading = lines[0].trim();
    const body = lines.slice(1).join('\n').trim();
    const groups = parseQuestionsFromText(body || chunk, nextNum);
    const maxNum = groups.reduce(
      (max, g) => Math.max(max, ...g.questions.map((q) => q.number)),
      nextNum
    );
    nextNum = maxNum + 1;
    return {
      id: `part-${idx + 1}`,
      title: /^PART\s+\d/i.test(heading) ? heading : `Part ${idx + 1}`,
      instruction: `Listen carefully and answer the questions in Part ${idx + 1}.`,
      questionGroups: groups,
    };
  });
}

function parseReadingPassages(text: string): ReadingPassage[] {
  const passageSplits = text.split(/\n(?=(?:READING\s+)?PASSAGE\s+[1-3]\b)/i).filter((s) => s.trim());
  if (passageSplits.length <= 1) {
    return [parseReadingBlock(text, 1)];
  }
  return passageSplits.map((chunk, idx) => parseReadingBlock(chunk, idx + 1));
}

function parseReadingBlock(text: string, passageNum = 1): ReadingPassage {
  const qSplitMatch = text.match(/\n\s*(?:QUESTIONS?|Questions?\s+\d+)\b/i);
  let passageBody = text;
  let questionBody = '';

  if (qSplitMatch && qSplitMatch.index !== undefined) {
    passageBody = text.slice(0, qSplitMatch.index).trim();
    questionBody = text.slice(qSplitMatch.index).trim();
  }

  const pLines = passageBody.split('\n').filter((l) => l.trim());
  const firstLine = pLines[0]?.trim() || `Reading Passage ${passageNum}`;
  const title = /^(?:READING\s+)?PASSAGE\s+\d/i.test(firstLine) && pLines[1]
    ? pLines[1].trim()
    : firstLine;
  const content =
    /^(?:READING\s+)?PASSAGE\s+\d/i.test(firstLine) && pLines[1]
      ? pLines.slice(2).join('\n\n')
      : pLines.slice(1).join('\n\n') || passageBody;

  const startNum = passageNum === 1 ? 1 : passageNum === 2 ? 14 : 27;

  return {
    id: `passage-${passageNum}`,
    title: title || `Reading Passage ${passageNum}`,
    content: content || passageBody,
    questionGroups: parseQuestionsFromText(questionBody || '1. Summarize the main argument of the passage.', startNum),
  };
}

function parseWritingTasks(text: string): WritingTask[] {
  const splits = text.split(/\n(?=(?:WRITING\s+)?TASK\s+[12]\b)/i).filter((s) => s.trim());
  if (splits.length === 0) {
    return [
      {
        id: 'task-1',
        taskNumber: 1,
        title: 'Writing Task 1',
        prompt: text,
        minWords: 150,
        suggestedMinutes: 20,
      },
    ];
  }

  return splits.slice(0, 2).map((chunk, idx) => {
    const isTask2 = /TASK\s+2\b/i.test(chunk) || idx === 1;
    const taskNumber: 1 | 2 = isTask2 ? 2 : 1;
    const lines = chunk.trim().split('\n');
    const prompt = lines.slice(1).join('\n').trim() || chunk.trim();
    return {
      id: `task-${taskNumber}`,
      taskNumber,
      title: `Writing Task ${taskNumber}`,
      prompt,
      minWords: taskNumber === 1 ? 150 : 250,
      suggestedMinutes: taskNumber === 1 ? 20 : 40,
    };
  });
}

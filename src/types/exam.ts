export type ExamModule = 'listening' | 'reading' | 'writing';

export type ExamSelectionMode = 'full' | ExamModule;

export type QuestionType =
  | 'multiple-choice'
  | 'true-false-ng'
  | 'yes-no-ng'
  | 'fill-blank'
  | 'flow-chart'
  | 'matching';

export interface QuestionItem {
  number: number;
  prompt: string;
  stepLabel?: string;
  options?: string[];
  answerKey?: string;
  explanation?: string;
}

export interface QuestionGroup {
  id: string;
  title: string;
  instruction: string;
  type: QuestionType;
  options?: string[]; // Shared options for matching / TFNG / YNNG
  sharedPrompt?: string;
  maxSelect?: number; // e.g., 2 for "Choose TWO letters, A–E"
  table?: {
    headers: string[];
    rows: string[][];
  };
  questions: QuestionItem[];
}

export interface ListeningPart {
  id: string;
  title: string;
  instruction: string;
  audioUrl?: string;
  audioScript?: string;
  questionGroups: QuestionGroup[];
}

export interface ListeningSection {
  durationSeconds: number; // Standard CDI: 1920s (32 min)
  parts: ListeningPart[];
}

export interface ReadingPassage {
  id: string;
  title: string;
  subtitle?: string;
  content: string;
  questionGroups: QuestionGroup[];
}

export interface ReadingSection {
  durationSeconds: number; // Standard CDI: 3600s (60 min)
  passages: ReadingPassage[];
}

export interface WritingTask {
  id: string;
  taskNumber: 1 | 2;
  title: string;
  prompt: string;
  minWords: number;
  suggestedMinutes: number;
  imageUrl?: string;
  svgChartType?: 'bar-energy-2026' | 'line-wfh-2016-2026' | 'none';
}

export interface WritingSection {
  durationSeconds: number; // Standard CDI: 3600s (60 min)
  tasks: WritingTask[];
}

export interface IeltsExam {
  id: string;
  title: string;
  category: 'Academic' | 'General Training';
  description?: string;
  createdAt: string;
  updatedAt: string;
  listening?: ListeningSection;
  reading?: ReadingSection;
  writing?: WritingSection;
}

export type CdiTheme = 'standard' | 'white-on-black' | 'yellow-on-black';
export type CdiTextSize = 'standard' | 'large' | 'extra-large';

export interface ViolationEvent {
  timestamp: string;
  reason: 'fullscreen_exit' | 'window_blur' | 'tab_hidden';
  actionTaken: 'warning' | 'forced_restart';
}

export interface TextHighlight {
  id: string;
  passageId: string;
  text: string;
  note?: string;
}

export interface CandidateInfo {
  fullName: string;
  candidateId: string;
}

export interface ExamAttemptAnswers {
  listening: Record<number, string>;
  reading: Record<number, string>;
  writing: Record<number, string>; // key: 1 or 2
}

export interface ExamFlaggedQuestions {
  listening: number[];
  reading: number[];
  writing: number[];
}

export interface AntiCheatState {
  violationCount: number;
  restartCount: number;
  violationHistory: ViolationEvent[];
  activeLockModal: 'none' | 'enter_fullscreen' | 'warning_1' | 'forced_restart';
  lastViolationReason?: ViolationEvent['reason'];
}

export interface CompletedModuleRecord {
  module: ExamModule;
  durationUsedSeconds: number;
  submittedAt: string;
}

export interface SubmissionExportPayload {
  exam: IeltsExam;
  candidate: CandidateInfo;
  selectionMode: ExamSelectionMode;
  answers: ExamAttemptAnswers;
  completedModules: CompletedModuleRecord[];
  submittedAt: string;
  antiCheat: {
    violationCount: number;
    restartCount: number;
    violationHistory: ViolationEvent[];
  };
}

export interface QuestionTypeBreakdown {
  questionType: QuestionType;
  label: string;
  correct: number;
  total: number;
  accuracyPct: number;
}

export interface GradedSubmissionRecord {
  id: string;
  examId: string;
  examTitle: string;
  candidateName: string;
  candidateId: string;
  gradedAt: string;
  readingCorrect: number;
  readingTotal: number;
  bandScore: number;
  readingAnswers: Record<number, string>;
  byQuestionType: QuestionTypeBreakdown[];
  auditLine?: string;
  violationCount: number;
}

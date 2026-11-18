import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  ImagePlus,
  Music,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
} from 'lucide-react';
import {
  IeltsExam,
  ListeningPart,
  QuestionGroup,
  QuestionType,
  ReadingPassage,
  WritingTask,
} from '../types/exam';
import {
  evaluateSubmissionAgainstExam,
  getIeltsAcademicReadingBand,
  isIeltsAnswerCorrect,
  parseRawExamText,
  parseStudentSubmissionText,
  ParsedStudentDocxSubmission,
} from '../utils/examLogic';
import { TeacherAnalyticsDashboard } from './TeacherAnalyticsDashboard';

interface TeacherStudioProps {
  exams: IeltsExam[];
  onRefreshExams: () => Promise<void>;
  onBackLobby: () => void;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Không thể đọc tệp'));
    reader.readAsDataURL(file);
  });
}

function createBlankExam(): Omit<IeltsExam, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: 'Đề thi IELTS mới',
    category: 'Academic',
    description: 'Đề thi IELTS chuẩn cấu trúc trên máy tính.',
    listening: {
      durationSeconds: 1920,
      parts: [
        {
          id: 'l-part-1',
          title: 'Part 1',
          instruction: 'Questions 1–10: Listen and complete the notes below.',
          questionGroups: [
            {
              id: 'l-p1-g1',
              title: 'Questions 1–5',
              instruction: 'Write ONE WORD AND/OR A NUMBER for each answer.',
              type: 'fill-blank',
              questions: [
                { number: 1, prompt: 'Name: _________' },
                { number: 2, prompt: 'Address: _________' },
              ],
            },
          ],
        },
      ],
    },
    reading: {
      durationSeconds: 3600,
      passages: [
        {
          id: 'r-passage-1',
          title: 'Reading Passage 1',
          subtitle: 'You should spend about 20 minutes on Questions 1–13.',
          content: 'Paste or type your reading passage paragraphs here...',
          questionGroups: [
            {
              id: 'r-p1-g1',
              title: 'Questions 1–3',
              instruction: 'Choose TRUE, FALSE, or NOT GIVEN.',
              type: 'true-false-ng',
              options: ['TRUE', 'FALSE', 'NOT GIVEN'],
              questions: [
                { number: 1, prompt: 'Sample statement 1.' },
              ],
            },
          ],
        },
      ],
    },
    writing: {
      durationSeconds: 3600,
      tasks: [
        {
          id: 'w-task-1',
          taskNumber: 1,
          title: 'Writing Task 1',
          minWords: 150,
          suggestedMinutes: 20,
          prompt: 'Summarise the information by selecting and reporting the main features.',
        },
        {
          id: 'w-task-2',
          taskNumber: 2,
          title: 'Writing Task 2',
          minWords: 250,
          suggestedMinutes: 40,
          prompt: 'Write an essay of at least 250 words discussing both views and giving your opinion.',
        },
      ],
    },
  };
}

export const TeacherStudio: React.FC<TeacherStudioProps> = ({
  exams,
  onRefreshExams,
  onBackLobby,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<IeltsExam, 'id' | 'createdAt' | 'updatedAt'>>(
    createBlankExam()
  );
  const [rawPasteText, setRawPasteText] = useState('');
  const [activeTab, setActiveTab] = useState<'import' | 'listening' | 'reading' | 'writing' | 'grading' | 'analytics'>('import');
  const [statusMessage, setStatusMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [gradedSubmission, setGradedSubmission] = useState<ParsedStudentDocxSubmission | null>(null);
  const [selectedAnswerExamId, setSelectedAnswerExamId] = useState<string>(exams[0]?.id || '');
  const [gradingSkill, setGradingSkill] = useState<'listening' | 'reading'>('listening');
  const [submissionsRefreshToken, setSubmissionsRefreshToken] = useState(0);

  const loadExamIntoEditor = (exam: IeltsExam) => {
    setEditingId(exam.id);
    setDraft({
      title: exam.title,
      category: exam.category,
      description: exam.description || '',
      listening: exam.listening,
      reading: exam.reading,
      writing: exam.writing,
    });
    setActiveTab('reading');
    setStatusMessage({ type: 'ok', text: `Đang chỉnh sửa đề: ${exam.title}` });
  };

  const handleResetNew = () => {
    setEditingId(null);
    setDraft(createBlankExam());
    setActiveTab('import');
    setStatusMessage(null);
  };

  const handleGradeStudentDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatusMessage(null);
    try {
      const base64Data = await fileToBase64(file);
      const resp = await fetch('/api/parse-docx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, base64Data }),
      });
      if (!resp.ok) throw new Error('Không thể đọc file bài làm .docx của thí sinh.');
      const data = await resp.json();
      const parsed = parseStudentSubmissionText(data.rawText || '');
      setGradedSubmission(parsed);
      const hasL = Object.keys(parsed.listeningAnswers).length > 0;
      const hasR = Object.keys(parsed.readingAnswers).length > 0;
      if (hasL && !hasR) setGradingSkill('listening');
      else if (hasR && !hasL) setGradingSkill('reading');

      const targetExam = exams.find((ex) => ex.id === selectedAnswerExamId) || exams[0];
      if (targetExam) {
        const record = evaluateSubmissionAgainstExam(
          {
            ...parsed,
            candidateName: parsed.candidateName || file.name.replace(/\.docx?$/i, ''),
          },
          targetExam
        );
        await fetch('/api/submissions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        }).catch(() => {});
        setSubmissionsRefreshToken((t) => t + 1);
      }

      setStatusMessage({
        type: 'ok',
        text: `Đã chấm và lưu bài làm của "${parsed.candidateName || file.name}" vào thống kê xu hướng.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Lỗi đọc file bài làm.',
      });
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setStatusMessage(null);

    try {
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.json')) {
        const text = await file.text();
        const json = JSON.parse(text);
        setDraft({
          title: json.title || file.name.replace(/\.json$/i, ''),
          category: json.category === 'General Training' ? 'General Training' : 'Academic',
          description: json.description || '',
          listening: json.listening,
          reading: json.reading,
          writing: json.writing,
        });
        setStatusMessage({ type: 'ok', text: `Đã nhập cấu trúc đề từ file JSON "${file.name}".` });
      } else if (lower.endsWith('.docx') || lower.endsWith('.doc')) {
        const base64Data = await fileToBase64(file);
        const resp = await fetch('/api/parse-docx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, base64Data }),
        });
        if (!resp.ok) throw new Error('Không thể đọc file Word .docx');
        const data = await resp.json();
        setRawPasteText(data.rawText || '');
        setDraft((prev) => ({
          ...prev,
          ...data.parsedExam,
          title: data.parsedExam?.title || file.name.replace(/\.docx?$/i, ''),
        }));
        setStatusMessage({
          type: 'ok',
          text: `Đã tách nội dung từ file Word "${file.name}". Vui lòng kiểm tra các tab Listening / Reading / Writing và nhấn Lưu.`,
        });
      } else {
        const text = await file.text();
        setRawPasteText(text);
        const parsed = parseRawExamText(text, file.name.replace(/\.[^.]+$/, ''));
        setDraft((prev) => ({ ...prev, ...parsed }));
        setStatusMessage({
          type: 'ok',
          text: `Đã đọc tệp "${file.name}" và phân tích các phần thi.`,
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Lỗi khi đọc tệp đề thi.',
      });
    } finally {
      setBusy(false);
      e.target.value = '';
    }
  };

  const handleParsePastedText = () => {
    if (!rawPasteText.trim()) return;
    const parsed = parseRawExamText(rawPasteText, draft.title || 'Đề thi IELTS mới');
    setDraft((prev) => ({
      ...prev,
      listening: parsed.listening ?? prev.listening,
      reading: parsed.reading ?? prev.reading,
      writing: parsed.writing ?? prev.writing,
    }));
    setStatusMessage({
      type: 'ok',
      text: 'Đã phân tích văn bản thành các phần thi. Kiểm tra lại ở từng tab rồi nhấn Lưu đề thi.',
    });
  };

  const handleUploadAsset = async (
    file: File,
    onUrl: (url: string) => void
  ) => {
    setBusy(true);
    try {
      const base64Data = await fileToBase64(file);
      const resp = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, base64Data }),
      });
      if (!resp.ok) throw new Error('Upload tệp thất bại');
      const data = await resp.json();
      onUrl(data.url);
      setStatusMessage({ type: 'ok', text: `Đã tải lên tệp "${file.name}".` });
    } catch (err) {
      setStatusMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Upload thất bại',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSaveExam = async () => {
    if (!draft.title.trim()) {
      setStatusMessage({ type: 'err', text: 'Vui lòng nhập tên đề thi.' });
      return;
    }
    setBusy(true);
    setStatusMessage(null);
    try {
      const url = editingId ? `/api/exams/${editingId}` : '/api/exams';
      const method = editingId ? 'PUT' : 'POST';
      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      });
      if (!resp.ok) throw new Error('Không thể lưu đề thi lên máy chủ.');
      const saved = await resp.json();
      setEditingId(saved.id);
      await onRefreshExams();
      setStatusMessage({
        type: 'ok',
        text: `Đã lưu "${saved.title}" lên hệ thống! Thí sinh có thể thi ngay lập tức.`,
      });
    } catch (err) {
      setStatusMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Lỗi khi lưu đề thi.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteExam = async (id: string, title: string) => {
    setBusy(true);
    try {
      await fetch(`/api/exams/${id}`, { method: 'DELETE' });
      if (editingId === id) handleResetNew();
      await onRefreshExams();
      setStatusMessage({ type: 'ok', text: `Đã xóa đề "${title}".` });
    } finally {
      setBusy(false);
    }
  };

  const handleRestoreDefault = async () => {
    setBusy(true);
    try {
      await fetch('/api/exams/restore-default', { method: 'POST' });
      await onRefreshExams();
      setStatusMessage({ type: 'ok', text: 'Đã khôi phục đề thi Nov 18 đã tải lên.' });
    } finally {
      setBusy(false);
    }
  };

  const updatePassage = (idx: number, patch: Partial<ReadingPassage>) => {
    setDraft((prev) => {
      const passages = [...(prev.reading?.passages || [])];
      passages[idx] = { ...passages[idx], ...patch };
      return {
        ...prev,
        reading: { durationSeconds: prev.reading?.durationSeconds ?? 3600, passages },
      };
    });
  };

  const updateListeningPart = (idx: number, patch: Partial<ListeningPart>) => {
    setDraft((prev) => {
      const parts = [...(prev.listening?.parts || [])];
      parts[idx] = { ...parts[idx], ...patch };
      return {
        ...prev,
        listening: { durationSeconds: prev.listening?.durationSeconds ?? 1920, parts },
      };
    });
  };

  const updateWritingTask = (idx: number, patch: Partial<WritingTask>) => {
    setDraft((prev) => {
      const tasks = [...(prev.writing?.tasks || [])];
      tasks[idx] = { ...tasks[idx], ...patch };
      return {
        ...prev,
        writing: { durationSeconds: prev.writing?.durationSeconds ?? 3600, tasks },
      };
    });
  };

  const addReadingQuestionGroup = (passageIdx: number, type: QuestionType) => {
    const passages = [...(draft.reading?.passages || [])];
    const passage = passages[passageIdx];
    if (!passage) return;
    const allNums = passages.flatMap((p) =>
      p.questionGroups.flatMap((g) => g.questions.map((q) => q.number))
    );
    const nextNum = (allNums.length > 0 ? Math.max(...allNums) : 0) + 1;
    const newGroup: QuestionGroup = {
      id: `grp-${Date.now()}`,
      title: `Question ${nextNum}`,
      instruction:
        type === 'true-false-ng'
          ? 'Choose TRUE, FALSE, or NOT GIVEN.'
          : type === 'multiple-choice'
          ? 'Choose the correct letter, A, B, C, or D.'
          : 'Write ONE WORD AND/OR A NUMBER.',
      type,
      options:
        type === 'true-false-ng'
          ? ['TRUE', 'FALSE', 'NOT GIVEN']
          : type === 'yes-no-ng'
          ? ['YES', 'NO', 'NOT GIVEN']
          : undefined,
      questions: [
        {
          number: nextNum,
          prompt: `Question ${nextNum} prompt...`,
          options:
            type === 'multiple-choice'
              ? ['A. Option A', 'B. Option B', 'C. Option C', 'D. Option D']
              : undefined,
        },
      ],
    };
    updatePassage(passageIdx, {
      questionGroups: [...passage.questionGroups, newGroup],
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 flex flex-col">
      {/* 3-Zone Top Bar */}
      <header className="bg-white border-b border-slate-200 px-6 lg:px-10 h-16 flex items-center justify-between gap-8 shrink-0">
        <div className="flex items-center gap-4 whitespace-nowrap shrink-0">
          <button
            type="button"
            onClick={onBackLobby}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về phòng thi</span>
          </button>
          <span className="text-slate-300" aria-hidden="true">|</span>
          <span className="text-base font-bold text-slate-900">Quản lý & Tải đề thi IELTS</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetNew}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded cursor-pointer whitespace-nowrap"
          >
            + Tạo đề mới
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleSaveExam}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#C8102E] hover:bg-[#A60D25] rounded cursor-pointer whitespace-nowrap disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{editingId ? 'Cập nhật đề lên web' : 'Đưa đề lên web ngay'}</span>
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Sidebar: Published Exams List */}
        <aside className="lg:col-span-4 bg-white rounded-lg border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">Đề thi đã đưa lên web</h2>
            <button
              type="button"
              onClick={handleRestoreDefault}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              title="Khôi phục đề thi mặc định"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Khôi phục đề gốc</span>
            </button>
          </div>

          <div className="space-y-2">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className={`p-3 rounded border text-sm transition-colors ${
                  editingId === exam.id
                    ? 'border-[#C8102E] bg-red-50/40'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => loadExamIntoEditor(exam)}
                    className="text-left font-semibold text-slate-900 hover:text-[#C8102E] cursor-pointer flex-1"
                  >
                    {exam.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExam(exam.id, exam.title)}
                    aria-label={`Xóa đề ${exam.title}`}
                    className="p-1 text-slate-400 hover:text-red-600 cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {exam.category} · {exam.listening ? 'Listening ' : ''}
                  {exam.reading ? 'Reading ' : ''}
                  {exam.writing ? 'Writing' : ''}
                </p>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Editor */}
        <main className="lg:col-span-8 bg-white rounded-lg border border-slate-200 p-6 space-y-6">
          {statusMessage && (
            <div
              role="status"
              className={`px-4 py-3 rounded border text-sm ${
                statusMessage.type === 'ok'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {statusMessage.text}
            </div>
          )}

          {/* Exam Title & Category (shown on exam authoring tabs) */}
          {activeTab !== 'grading' && activeTab !== 'analytics' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="exam-title-input" className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên bộ đề thi
                </label>
                <input
                  id="exam-title-input"
                  type="text"
                  value={draft.title}
                  onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>
              <div>
                <label htmlFor="exam-cat-select" className="block text-xs font-semibold text-slate-700 mb-1">
                  Phân loại
                </label>
                <select
                  id="exam-cat-select"
                  value={draft.category}
                  onChange={(e) =>
                    setDraft((p) => ({
                      ...p,
                      category: e.target.value === 'General Training' ? 'General Training' : 'Academic',
                    }))
                  }
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white"
                >
                  <option value="Academic">Academic</option>
                  <option value="General Training">General Training</option>
                </select>
              </div>
            </div>
          )}

          {/* Section Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-md overflow-x-auto">
            {(
              [
                { id: 'import', label: 'Tải file đề (.docx / .txt / .json)' },
                { id: 'listening', label: 'Listening' },
                { id: 'reading', label: 'Reading' },
                { id: 'writing', label: 'Writing' },
                { id: 'grading', label: 'Đáp án & Chấm bài (.docx)' },
                { id: 'analytics', label: 'Phân tích xu hướng' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded transition-colors whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'import' && (
            <div className="space-y-5">
              <div className="p-6 rounded border border-dashed border-slate-300 bg-slate-50 text-center space-y-3">
                <Upload className="w-7 h-7 text-slate-600 mx-auto" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900">
                    Tải trực tiếp file đề thi từ máy tính
                  </p>
                  <p className="text-xs text-slate-500">
                    Hỗ trợ Microsoft Word (.docx), Text (.txt), hoặc file cấu trúc (.json)
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded cursor-pointer">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Chọn tệp đề thi</span>
                  <input
                    type="file"
                    accept=".docx,.doc,.txt,.md,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-2">
                <label htmlFor="raw-paste-textarea" className="block text-xs font-semibold text-slate-700">
                  Hoặc dán trực tiếp nội dung đề thi (hệ thống tự tách READING / LISTENING / WRITING)
                </label>
                <textarea
                  id="raw-paste-textarea"
                  rows={10}
                  value={rawPasteText}
                  onChange={(e) => setRawPasteText(e.target.value)}
                  placeholder={`Ví dụ:\nREADING\nPASSAGE 1\nTiêu đề bài đọc\nNội dung đoạn văn...\nQUESTIONS 1-3\n1. Câu hỏi...`}
                  className="w-full p-3 text-xs font-mono border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
                <button
                  type="button"
                  onClick={handleParsePastedText}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded cursor-pointer"
                >
                  Phân tích văn bản vào đề thi
                </button>
              </div>
            </div>
          )}

          {activeTab === 'listening' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  Listening Parts ({draft.listening?.parts.length || 0})
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const parts = [...(draft.listening?.parts || [])];
                    parts.push({
                      id: `l-part-${parts.length + 1}`,
                      title: `Part ${parts.length + 1}`,
                      instruction: 'Listen and answer the questions.',
                      questionGroups: [],
                    });
                    setDraft((p) => ({
                      ...p,
                      listening: { durationSeconds: 1920, parts },
                    }));
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Part</span>
                </button>
              </div>

              {(draft.listening?.parts || []).map((part, pIdx) => (
                <div key={part.id} className="p-4 rounded border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <input
                      type="text"
                      value={part.title}
                      onChange={(e) => updateListeningPart(pIdx, { title: e.target.value })}
                      className="px-2.5 py-1 text-sm font-semibold border border-slate-300 rounded"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded cursor-pointer">
                      <Music className="w-3.5 h-3.5" />
                      <span>{part.audioUrl ? 'Đổi file Audio MP3' : 'Tải file Audio (.mp3/.wav)'}</span>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadAsset(f, (url) => updateListeningPart(pIdx, { audioUrl: url }));
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {part.audioUrl && (
                    <p className="text-xs text-emerald-700">Đã gắn audio: {part.audioUrl}</p>
                  )}
                  <textarea
                    rows={2}
                    value={part.instruction}
                    onChange={(e) => updateListeningPart(pIdx, { instruction: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded"
                    placeholder="Hướng dẫn làm bài Part này..."
                  />
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600">
                      Câu hỏi trong {part.title}: {part.questionGroups.reduce((a, g) => a + g.questions.length, 0)} câu
                    </p>
                    {part.questionGroups.map((g, gIdx) => (
                      <div key={g.id} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
                        <p className="text-xs font-semibold text-slate-800">{g.title}</p>
                        {g.questions.map((q, qIdx) => (
                          <div key={q.number} className="flex items-center gap-2">
                            <span className="text-xs font-mono-num font-bold w-7">Q{q.number}</span>
                            <input
                              type="text"
                              value={q.prompt}
                              onChange={(e) => {
                                const groups = [...part.questionGroups];
                                const qs = [...groups[gIdx].questions];
                                qs[qIdx] = { ...qs[qIdx], prompt: e.target.value };
                                groups[gIdx] = { ...groups[gIdx], questions: qs };
                                updateListeningPart(pIdx, { questionGroups: groups });
                              }}
                              className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded"
                            />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reading' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">
                  Reading Passages ({draft.reading?.passages.length || 0})
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const passages = [...(draft.reading?.passages || [])];
                    passages.push({
                      id: `r-passage-${passages.length + 1}`,
                      title: `Reading Passage ${passages.length + 1}`,
                      content: '',
                      questionGroups: [],
                    });
                    setDraft((p) => ({
                      ...p,
                      reading: { durationSeconds: 3600, passages },
                    }));
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Passage</span>
                </button>
              </div>

              {(draft.reading?.passages || []).map((passage, pIdx) => (
                <div key={passage.id} className="p-4 rounded border border-slate-200 space-y-3">
                  <input
                    type="text"
                    value={passage.title}
                    onChange={(e) => updatePassage(pIdx, { title: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm font-semibold border border-slate-300 rounded"
                    placeholder="Tiêu đề bài đọc..."
                  />
                  <textarea
                    rows={6}
                    value={passage.content}
                    onChange={(e) => updatePassage(pIdx, { content: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded leading-relaxed"
                    placeholder="Nội dung bài đọc (các đoạn cách nhau bằng Enter)..."
                  />
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-xs font-semibold text-slate-600">Thêm nhóm câu hỏi:</span>
                    <button
                      type="button"
                      onClick={() => addReadingQuestionGroup(pIdx, 'true-false-ng')}
                      className="px-2.5 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
                    >
                      + TRUE/FALSE/NG
                    </button>
                    <button
                      type="button"
                      onClick={() => addReadingQuestionGroup(pIdx, 'multiple-choice')}
                      className="px-2.5 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
                    >
                      + Trắc nghiệm
                    </button>
                    <button
                      type="button"
                      onClick={() => addReadingQuestionGroup(pIdx, 'fill-blank')}
                      className="px-2.5 py-1 text-xs border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
                    >
                      + Điền từ
                    </button>
                  </div>

                  {passage.questionGroups.map((g, gIdx) => (
                    <div key={g.id} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-2">
                      <p className="text-xs font-semibold text-slate-800">
                        {g.title} ({g.type})
                      </p>
                      {g.questions.map((q, qIdx) => (
                        <div key={q.number} className="flex items-center gap-2">
                          <span className="text-xs font-mono-num font-bold w-7">Q{q.number}</span>
                          <input
                            type="text"
                            value={q.prompt}
                            onChange={(e) => {
                              const groups = [...passage.questionGroups];
                              const qs = [...groups[gIdx].questions];
                              qs[qIdx] = { ...qs[qIdx], prompt: e.target.value };
                              groups[gIdx] = { ...groups[gIdx], questions: qs };
                              updatePassage(pIdx, { questionGroups: groups });
                            }}
                            className="flex-1 px-2.5 py-1 text-xs bg-white border border-slate-300 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'writing' && (
            <div className="space-y-4">
              {(draft.writing?.tasks || []).map((task, tIdx) => (
                <div key={task.id} className="p-4 rounded border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-900">{task.title}</span>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded cursor-pointer">
                      <ImagePlus className="w-3.5 h-3.5" />
                      <span>{task.imageUrl ? 'Đổi hình biểu đồ' : 'Tải ảnh biểu đồ (Task 1)'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadAsset(f, (url) => updateWritingTask(tIdx, { imageUrl: url }));
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {task.imageUrl && (
                    <img
                      src={task.imageUrl}
                      alt={task.title}
                      className="max-h-40 rounded border border-slate-200 object-contain"
                    />
                  )}
                  <textarea
                    rows={5}
                    value={task.prompt}
                    onChange={(e) => updateWritingTask(tIdx, { prompt: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded leading-relaxed"
                    placeholder="Nhập đề bài Writing..."
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === 'grading' && (
            <div className="space-y-6">
              {(() => {
                const targetExam =
                  exams.find((ex) => ex.id === selectedAnswerExamId) || exams[0];
                const listeningQuestions =
                  targetExam?.listening?.parts.flatMap((p) =>
                    p.questionGroups.flatMap((g) => g.questions)
                  ) || [];
                const readingQuestions =
                  targetExam?.reading?.passages.flatMap((p) =>
                    p.questionGroups.flatMap((g) => g.questions)
                  ) || [];
                const hasBothSkills =
                  listeningQuestions.length > 0 && readingQuestions.length > 0;
                const useListening = hasBothSkills
                  ? gradingSkill === 'listening'
                  : listeningQuestions.length > 0;
                const activeQuestions = useListening ? listeningQuestions : readingQuestions;
                const activeStudentAnswers = gradedSubmission
                  ? useListening
                    ? gradedSubmission.listeningAnswers
                    : gradedSubmission.readingAnswers
                  : {};
                const correctCount = gradedSubmission
                  ? activeQuestions.filter((q) =>
                      isIeltsAnswerCorrect(
                        activeStudentAnswers[q.number] || '',
                        q.answerKey
                      )
                    ).length
                  : 0;
                const bandScore = gradedSubmission
                  ? getIeltsAcademicReadingBand(correctCount)
                  : null;

                return (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                      <div>
                        <label
                          htmlFor="grading-exam-select"
                          className="block text-xs font-semibold text-slate-700 mb-1"
                        >
                          Chọn đề thi để đối chiếu đáp án
                        </label>
                        <select
                          id="grading-exam-select"
                          value={targetExam?.id || ''}
                          onChange={(e) => setSelectedAnswerExamId(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded bg-white"
                        >
                          {exams.map((ex) => (
                            <option key={ex.id} value={ex.id}>
                              {ex.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2">
                        {hasBothSkills && (
                          <div className="inline-flex p-1 bg-slate-100 rounded-md">
                            <button
                              type="button"
                              onClick={() => setGradingSkill('listening')}
                              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                                gradingSkill === 'listening'
                                  ? 'bg-white text-slate-900 shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Listening ({listeningQuestions.length} câu)
                            </button>
                            <button
                              type="button"
                              onClick={() => setGradingSkill('reading')}
                              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer whitespace-nowrap ${
                                gradingSkill === 'reading'
                                  ? 'bg-white text-slate-900 shadow-xs'
                                  : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Reading ({readingQuestions.length} câu)
                            </button>
                          </div>
                        )}
                        <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded cursor-pointer whitespace-nowrap">
                          <ClipboardCheck className="w-4 h-4" />
                          <span>Tải file bài làm thí sinh (.docx) để chấm tự động</span>
                          <input
                            type="file"
                            accept=".docx"
                            onChange={handleGradeStudentDocx}
                            className="hidden"
                          />
                        </label>
                      </div>
                    </div>

                    {gradedSubmission && (
                      <div className="p-4 rounded border border-slate-200 bg-slate-50 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="text-sm">
                            <span className="font-semibold text-slate-900">
                              {gradedSubmission.candidateName || 'Thí sinh'}
                            </span>
                            {gradedSubmission.candidateId && (
                              <span className="font-mono-num text-xs text-slate-600 ml-2">
                                · SBD: {gradedSubmission.candidateId}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm font-mono-num">
                            <span className="font-bold text-slate-900">
                              Đúng: {correctCount}/{activeQuestions.length}
                            </span>
                            {bandScore !== null && (
                              <span className="font-bold text-[#C8102E]">
                                Band: {bandScore.toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>

                        {gradedSubmission.auditLine && (
                          <p
                            className={`text-xs px-3 py-2 rounded border ${
                              gradedSubmission.auditLine.includes('PHAT HIEN VI PHAM')
                                ? 'bg-red-50 border-red-200 text-red-900 font-medium'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                            }`}
                          >
                            {gradedSubmission.auditLine}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="overflow-x-auto border border-slate-200 rounded-md">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-slate-100 text-slate-700">
                          <tr>
                            <th className="px-3 py-2.5 font-semibold border-b border-slate-200 w-12">Câu</th>
                            <th className="px-3 py-2.5 font-semibold border-b border-slate-200 w-40">Đáp án chuẩn</th>
                            {gradedSubmission && (
                              <th className="px-3 py-2.5 font-semibold border-b border-slate-200 w-40">Bài làm thí sinh</th>
                            )}
                            <th className="px-3 py-2.5 font-semibold border-b border-slate-200">Vị trí & Giải thích</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 bg-white">
                          {activeQuestions.map((q) => {
                            const studentAns = gradedSubmission
                              ? activeStudentAnswers[q.number] || ''
                              : '';
                            const isCorrect = gradedSubmission
                              ? isIeltsAnswerCorrect(studentAns, q.answerKey)
                              : false;

                            return (
                              <tr key={q.number} className="align-top">
                                <td className="px-3 py-2.5 font-mono-num font-bold text-slate-900">
                                  {q.number}
                                </td>
                                <td className="px-3 py-2.5 font-semibold text-slate-900">
                                  {q.answerKey ? q.answerKey.replace(/\|/g, ' / ') : '—'}
                                </td>
                                {gradedSubmission && (
                                  <td className="px-3 py-2.5">
                                    <span
                                      className={`inline-flex items-center gap-1 font-medium ${
                                        isCorrect ? 'text-emerald-700' : 'text-red-700'
                                      }`}
                                    >
                                      {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                                      <span>{studentAns || '(Bỏ trống)'}</span>
                                    </span>
                                  </td>
                                )}
                                <td className="px-3 py-2.5 text-slate-600 leading-relaxed">
                                  {q.explanation || 'Chưa có giải thích'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {activeTab === 'analytics' && (
            <TeacherAnalyticsDashboard
              exams={exams}
              refreshToken={submissionsRefreshToken}
              onGoToGrading={() => setActiveTab('grading')}
            />
          )}
        </main>
      </div>
    </div>
  );
};

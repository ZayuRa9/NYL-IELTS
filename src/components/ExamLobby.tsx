import React, { useState } from 'react';
import { BookOpen, Clock, Headphones, Maximize2, PenTool, ShieldCheck, Upload } from 'lucide-react';
import { CandidateInfo, ExamSelectionMode, IeltsExam } from '../types/exam';
import { getAvailableModules } from '../utils/examLogic';

interface ExamLobbyProps {
  exams: IeltsExam[];
  loading: boolean;
  onStartExam: (exam: IeltsExam, candidate: CandidateInfo, mode: ExamSelectionMode) => void;
  onOpenTeacherStudio: () => void;
}

export const ExamLobby: React.FC<ExamLobbyProps> = ({
  exams,
  loading,
  onStartExam,
  onOpenTeacherStudio,
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [selectionMode, setSelectionMode] = useState<ExamSelectionMode>('full');
  const [fullName, setFullName] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [formError, setFormError] = useState('');

  const activeExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const availableModules = activeExam ? getAvailableModules(activeExam) : [];
  const effectiveSelectionMode: ExamSelectionMode =
    availableModules.length === 1
      ? availableModules[0]
      : selectionMode === 'full' || availableModules.includes(selectionMode)
      ? selectionMode
      : availableModules[0] || 'reading';

  const handleBegin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeExam) {
      setFormError('Hiện chưa có đề thi nào. Vui lòng vào mục Quản lý đề thi để tải đề lên.');
      return;
    }
    if (!fullName.trim() || !candidateId.trim()) {
      setFormError('Vui lòng nhập đầy đủ Họ tên thí sinh và Số báo danh trước khi vào phòng thi.');
      return;
    }
    setFormError('');
    const resolvedMode: ExamSelectionMode =
      selectionMode === 'full' || availableModules.includes(selectionMode)
        ? selectionMode
        : availableModules[0] || 'reading';

    onStartExam(
      activeExam,
      { fullName: fullName.trim(), candidateId: candidateId.trim() },
      resolvedMode
    );
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 flex flex-col">
      {/* 3-Zone Top Bar Contract */}
      <header className="bg-white border-b border-slate-200 px-6 lg:px-10 h-16 flex items-center justify-between gap-8 shrink-0">
        <a
          href="#exam-lobby"
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          IELTS Computer-Delivered
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <a
            href="#exam-catalog"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Chọn đề thi
          </a>
          <a
            href="#exam-rules"
            className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            Quy chế phòng thi
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenTeacherStudio}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Quản lý & Tải đề thi</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Exam Selection & Candidate Form */}
        <section id="exam-catalog" className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 text-balance">
              Phòng thi IELTS trên máy tính
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
              Giao diện chuẩn kỳ thi IELTS Computer-Delivered chính thức với thời gian thực, công cụ tô
              sáng bài đọc, đếm từ Writing và xuất toàn bộ bài làm ra file Word.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-5">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-base font-semibold text-slate-900">1. Chọn đề thi</h2>
              <span className="text-xs text-slate-500 font-mono-num">
                {exams.length} đề khả dụng
              </span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-sm text-slate-500">Đang tải danh sách đề thi...</div>
            ) : exams.length === 0 ? (
              <div className="p-6 rounded border border-dashed border-slate-300 text-center space-y-3">
                <p className="text-sm text-slate-600">Chưa có đề thi nào được tải lên.</p>
                <button
                  type="button"
                  onClick={onOpenTeacherStudio}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#C8102E] rounded cursor-pointer"
                >
                  Tải đề thi mới ngay
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {exams.map((exam) => {
                  const isSelected = activeExam?.id === exam.id;
                  const mods = getAvailableModules(exam);
                  return (
                    <button
                      key={exam.id}
                      type="button"
                      onClick={() => setSelectedExamId(exam.id)}
                      className={`w-full text-left p-4 rounded-md border transition-colors cursor-pointer ${
                        isSelected
                          ? 'border-[#C8102E] bg-red-50/40'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-900">{exam.title}</p>
                          {exam.description && (
                            <p className="text-xs text-slate-600 line-clamp-2">{exam.description}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                            <span>IELTS {exam.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {mods
                                .map((m) =>
                                  m === 'listening' ? 'Listening' : m === 'reading' ? 'Reading' : 'Writing'
                                )
                                .join(' + ')}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`w-4 h-4 rounded-full border shrink-0 mt-1 flex items-center justify-center ${
                            isSelected ? 'border-[#C8102E]' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <span className="w-2 h-2 rounded-full bg-[#C8102E]" />}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {activeExam && (
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <p className="text-sm font-semibold text-slate-900">2. Chọn phần thi thực hiện</p>
                <div className="flex flex-wrap gap-2">
                  {availableModules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setSelectionMode('full')}
                      className={`px-3.5 py-2 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                        effectiveSelectionMode === 'full'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      Thi đầy đủ (Full Test)
                    </button>
                  )}
                  {availableModules.includes('listening') && (
                    <button
                      type="button"
                      onClick={() => setSelectionMode('listening')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                        effectiveSelectionMode === 'listening'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <Headphones className="w-3.5 h-3.5" />
                      <span>Chỉ Listening</span>
                    </button>
                  )}
                  {availableModules.includes('reading') && (
                    <button
                      type="button"
                      onClick={() => setSelectionMode('reading')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                        effectiveSelectionMode === 'reading'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Chỉ Reading</span>
                    </button>
                  )}
                  {availableModules.includes('writing') && (
                    <button
                      type="button"
                      onClick={() => setSelectionMode('writing')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                        effectiveSelectionMode === 'writing'
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5" />
                      <span>Chỉ Writing</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Candidate Check-in & Proctoring Rules */}
        <section id="exam-rules" className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleBegin}
            className="bg-white rounded-lg border border-slate-200 p-6 space-y-5"
          >
            <h2 className="text-base font-semibold text-slate-900">3. Thông tin thí sinh & Bắt đầu</h2>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="candidate-fullname"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Họ và tên thí sinh
                </label>
                <input
                  id="candidate-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn An"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>

              <div>
                <label
                  htmlFor="candidate-id"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Số báo danh / Mã học viên
                </label>
                <input
                  id="candidate-id"
                  type="text"
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  placeholder="Ví dụ: HV2026-01"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded font-mono-num focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
                />
              </div>
            </div>

            {formError && (
              <p role="alert" className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                {formError}
              </p>
            )}

            <div className="pt-2 border-t border-slate-200 space-y-3">
              <div className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                <Clock className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                <span>
                  Thời gian chuẩn IELTS: Listening <strong>32 phút</strong>, Reading{' '}
                  <strong>60 phút</strong>, Writing <strong>60 phút</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-[#C8102E] shrink-0 mt-0.5" />
                <span>
                  Bài thi chạy ở chế độ <strong>Toàn màn hình</strong>. Nếu thoát màn hình hoặc để phần
                  mềm khác chèn lên, lần 1 sẽ cảnh báo và <strong>lần 2 sẽ tự động xóa bài bắt làm lại từ đầu</strong>.
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!activeExam}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#C8102E] hover:bg-[#A60D25] rounded transition-colors cursor-pointer disabled:opacity-50"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Vào phòng thi (Toàn màn hình)</span>
            </button>
          </form>
        </section>
      </main>
    </div>
  );
};

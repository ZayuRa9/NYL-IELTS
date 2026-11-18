import React, { useState } from 'react';
import { Eye, EyeOff, HelpCircle, Settings, CheckCircle2, X } from 'lucide-react';
import { CdiTextSize, CdiTheme, CandidateInfo, ExamModule } from '../types/exam';
import { formatTimer } from '../utils/examLogic';

interface CdiHeaderProps {
  candidate: CandidateInfo;
  activeModule: ExamModule;
  remainingSeconds: number;
  isLastModule: boolean;
  theme: CdiTheme;
  textSize: CdiTextSize;
  onChangeTheme: (theme: CdiTheme) => void;
  onChangeTextSize: (size: CdiTextSize) => void;
  onFinishModule: () => void;
}

const MODULE_LABELS: Record<ExamModule, string> = {
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
};

export const CdiHeader: React.FC<CdiHeaderProps> = ({
  candidate,
  activeModule,
  remainingSeconds,
  isLastModule,
  theme,
  textSize,
  onChangeTheme,
  onChangeTextSize,
  onFinishModule,
}) => {
  const [timerHidden, setTimerHidden] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  const { minutesText, clockText, urgency } = formatTimer(remainingSeconds);

  const timerColorClass =
    urgency === 'critical'
      ? 'text-red-400'
      : urgency === 'warning'
      ? 'text-amber-300'
      : 'text-white';

  return (
    <>
      <header className="h-14 bg-[#1E293B] text-white border-b border-slate-700 px-4 flex items-center justify-between gap-6 select-none shrink-0">
        {/* Left Zone: Candidate Identity & Module */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="flex items-center gap-2 whitespace-nowrap shrink-0">
            <span className="text-sm font-bold tracking-tight text-white">IELTS</span>
            <span className="text-slate-400" aria-hidden="true">/</span>
            <span className="text-sm font-semibold text-slate-200">{MODULE_LABELS[activeModule]}</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300 truncate">
            <span className="text-slate-400">Test taker:</span>
            <span className="font-medium text-white truncate max-w-[180px]">{candidate.fullName}</span>
            <span className="text-slate-500" aria-hidden="true">·</span>
            <span className="font-mono-num text-slate-300">{candidate.candidateId}</span>
          </div>
        </div>

        {/* Center Zone: Official CDI Countdown Timer */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`flex items-center gap-2.5 ${timerColorClass}`}>
            {!timerHidden ? (
              <div className="flex items-baseline gap-2" aria-live="polite">
                <span className="font-mono-num text-base font-semibold tracking-tight">{clockText}</span>
                <span className="hidden md:inline text-xs text-slate-300 font-normal">
                  {minutesText}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 italic">Timer hidden</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setTimerHidden((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            aria-label={timerHidden ? 'Show timer' : 'Hide timer'}
          >
            {timerHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{timerHidden ? 'Show' : 'Hide'}</span>
          </button>
        </div>

        {/* Right Zone: Settings, Help, Submit */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowSettings(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            aria-label="Exam display settings"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-700 rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            aria-label="Exam help guide"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Help</span>
          </button>
          <button
            type="button"
            onClick={() => setConfirmSubmit(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#C8102E] hover:bg-[#A60D25] rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isLastModule ? 'Nộp bài thi' : 'Xong phần này'}</span>
          </button>
        </div>
      </header>

      {/* Official CDI Settings Dialog */}
      {showSettings && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cdi-settings-title"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="bg-white text-slate-900 w-full max-w-md rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <h2 id="cdi-settings-title" className="text-sm font-semibold text-slate-900">
                Display Settings
              </h2>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="p-1 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                aria-label="Close settings"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Contrast / Colour Scheme</p>
                <div className="grid grid-cols-1 gap-2">
                  {(
                    [
                      { id: 'standard', label: 'Black on white (Standard)' },
                      { id: 'white-on-black', label: 'White on black' },
                      { id: 'yellow-on-black', label: 'Yellow on black' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeTheme(opt.id)}
                      className={`w-full text-left px-3.5 py-2.5 text-sm rounded border transition-colors cursor-pointer ${
                        theme === opt.id
                          ? 'border-[#C8102E] bg-red-50/70 text-slate-900 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700 mb-2">Text Size</p>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'standard', label: 'Standard' },
                      { id: 'large', label: 'Large' },
                      { id: 'extra-large', label: 'Extra Large' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeTextSize(opt.id)}
                      className={`px-3 py-2 text-xs font-medium rounded border transition-colors cursor-pointer ${
                        textSize === opt.id
                          ? 'border-[#C8102E] bg-red-50/70 text-slate-900 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official CDI Help Dialog */}
      {showHelp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cdi-help-title"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50">
              <h2 id="cdi-help-title" className="text-sm font-semibold text-slate-900">
                Hướng dẫn giao diện thi IELTS trên máy tính
              </h2>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="p-1 text-slate-500 hover:text-slate-900 rounded cursor-pointer"
                aria-label="Close help"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-3 text-sm text-slate-700 leading-relaxed">
              <p>
                <strong>Chuyển câu hỏi & Phần thi:</strong> Sử dụng thanh số câu hỏi ở phía dưới cùng
                hoặc nút mũi tên Trái / Phải để chuyển nhanh giữa các câu và các Part/Passage.
              </p>
              <p>
                <strong>Đánh dấu câu cần xem lại (Review):</strong> Tích chọn ô{' '}
                <span className="font-semibold">Review</span> ở thanh dưới cùng để đánh dấu câu hiện tại.
              </p>
              <p>
                <strong>Tô sáng văn bản (Highlight) trong Reading:</strong> Bôi đen bất kỳ đoạn chữ nào
                ở khung bài đọc bên trái, sau đó nhấn nút <strong>Highlight</strong> để tô vàng hoặc ghi chú.
              </p>
              <p>
                <strong>Quy chế toàn màn hình:</strong> Tuyệt đối không nhấn ESC để thoát toàn màn hình
                hoặc mở cửa sổ phần mềm khác chèn lên bài thi. Vi phạm lần 2 sẽ bắt buộc làm lại từ đầu.
              </p>
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded cursor-pointer"
              >
                Đóng hướng dẫn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Submit / Next Section Dialog */}
      {confirmSubmit && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cdi-confirm-submit-title"
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="bg-white text-slate-900 w-full max-w-md rounded-lg shadow-xl border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50">
              <h2 id="cdi-confirm-submit-title" className="text-base font-semibold text-slate-900">
                {isLastModule
                  ? 'Xác nhận nộp toàn bộ bài thi?'
                  : `Hoàn thành phần ${MODULE_LABELS[activeModule]}?`}
              </h2>
            </div>
            <div className="p-5 text-sm text-slate-700 leading-relaxed">
              {isLastModule
                ? 'Sau khi nộp bài, bạn không thể chỉnh sửa lại câu trả lời và sẽ chuyển sang màn hình tải file Word (.docx) bài làm về máy.'
                : `Sau khi xác nhận xong phần ${MODULE_LABELS[activeModule]}, bạn sẽ được hỏi xác nhận sẵn sàng thi tiếp phần tiếp theo hoặc tải bài thi xuống và thoát.`}
            </div>
            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmSubmit(false)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded cursor-pointer"
              >
                Quay lại làm tiếp
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmSubmit(false);
                  onFinishModule();
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#C8102E] hover:bg-[#A60D25] rounded cursor-pointer"
              >
                {isLastModule ? 'Xác nhận nộp bài' : 'Chuyển phần tiếp theo'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

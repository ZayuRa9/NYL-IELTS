import React, { useState } from 'react';
import { CheckCircle2, Download, Home } from 'lucide-react';
import { SubmissionExportPayload } from '../types/exam';
import { countWords } from '../utils/examLogic';
import { downloadSubmissionDocx } from '../utils/docxExport';

interface ExamCompleteViewProps {
  payload: SubmissionExportPayload;
  initialDownloaded?: boolean;
  onReturnLobby: () => void;
}

export const ExamCompleteView: React.FC<ExamCompleteViewProps> = ({
  payload,
  initialDownloaded = false,
  onReturnLobby,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [downloadedOnce, setDownloadedOnce] = useState(initialDownloaded);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadSubmissionDocx(payload);
      setDownloadedOnce(true);
    } finally {
      setDownloading(false);
    }
  };

  const completedSet = new Set(payload.completedModules.map((m) => m.module));
  const listeningAnswered = Object.values(payload.answers.listening).filter((v) => v.trim()).length;
  const readingAnswered = Object.values(payload.answers.reading).filter((v) => v.trim()).length;
  const task1Words = countWords(payload.answers.writing[1] || '');
  const task2Words = countWords(payload.answers.writing[2] || '');

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-8 py-6 bg-[#1E293B] text-white flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h1 className="text-lg font-bold">Hoàn thành bài thi IELTS</h1>
            <p className="text-xs text-slate-300 mt-0.5">{payload.exam.title}</p>
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-200 text-sm">
            <div>
              <p className="text-xs text-slate-500">Thí sinh</p>
              <p className="font-semibold text-slate-900 mt-0.5">{payload.candidate.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Số báo danh (Candidate ID)</p>
              <p className="font-mono-num font-semibold text-slate-900 mt-0.5">
                {payload.candidate.candidateId}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900">Tóm tắt nội dung bài làm đã ghi nhận</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              {payload.exam.listening && completedSet.has('listening') && (
                <div className="p-3.5 rounded border border-slate-200 bg-slate-50">
                  <p className="text-xs text-slate-500">Listening</p>
                  <p className="font-mono-num font-semibold text-slate-900 mt-1">
                    {listeningAnswered} câu đã điền
                  </p>
                </div>
              )}
              {payload.exam.reading && completedSet.has('reading') && (
                <div className="p-3.5 rounded border border-slate-200 bg-slate-50">
                  <p className="text-xs text-slate-500">Reading</p>
                  <p className="font-mono-num font-semibold text-slate-900 mt-1">
                    {readingAnswered} câu đã điền
                  </p>
                </div>
              )}
              {payload.exam.writing && completedSet.has('writing') && (
                <div className="p-3.5 rounded border border-slate-200 bg-slate-50">
                  <p className="text-xs text-slate-500">Writing</p>
                  <p className="font-mono-num font-semibold text-slate-900 mt-1">
                    T1: {task1Words} từ · T2: {task2Words} từ
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded border border-slate-200 bg-slate-50 text-sm text-slate-700 leading-relaxed">
            {downloadedOnce
              ? 'File Word (.docx) bài làm đã được tải xuống. Bạn có thể bấm nút bên dưới nếu cần tải lại, hoặc nhấn "Về trang chủ" để thoát.'
              : 'Vui lòng nhấn nút bên dưới để tải toàn bộ bài thi dưới dạng tệp '}
            {!downloadedOnce && (
              <>
                <strong>Microsoft Word (.docx)</strong> và gửi tệp này cho giáo viên để chấm điểm.
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C8102E] hover:bg-[#A60D25] rounded transition-colors cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              <span>
                {downloading
                  ? 'Đang tạo file Word...'
                  : downloadedOnce
                  ? 'Tải lại bài làm (.docx)'
                  : 'Tải toàn bộ bài làm (.docx)'}
              </span>
            </button>

            <button
              type="button"
              onClick={onReturnLobby}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Về trang chủ</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

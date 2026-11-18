import React from 'react';
import { AlertTriangle, Maximize2, RotateCcw, ShieldAlert } from 'lucide-react';
import { AntiCheatState } from '../types/exam';
import { getViolationReasonLabel } from '../utils/examLogic';

interface AntiCheatOverlayProps {
  antiCheat: AntiCheatState;
  onAcknowledgeAndEnterFullscreen: () => void;
}

export const AntiCheatOverlay: React.FC<AntiCheatOverlayProps> = ({
  antiCheat,
  onAcknowledgeAndEnterFullscreen,
}) => {
  if (antiCheat.activeLockModal === 'none') return null;

  const reasonText = getViolationReasonLabel(antiCheat.lastViolationReason);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="proctor-modal-title"
      className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-6"
    >
      <div className="bg-white text-slate-900 w-full max-w-lg rounded-lg shadow-2xl border border-slate-200 overflow-hidden">
        {antiCheat.activeLockModal === 'enter_fullscreen' && (
          <>
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center gap-3">
              <Maximize2 className="w-5 h-5 text-white shrink-0" />
              <h2 id="proctor-modal-title" className="text-base font-semibold">
                Kích hoạt chế độ thi Toàn màn hình (Fullscreen)
              </h2>
            </div>
            <div className="p-6 space-y-3 text-sm text-slate-700 leading-relaxed">
              <p>
                Hệ thống thi IELTS yêu cầu làm bài ở chế độ <strong>Toàn màn hình</strong> và không được
                thoát ra ngoài trong suốt thời gian làm bài.
              </p>
              <p>
                Nếu bạn nhấn <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-xs">ESC</kbd>,
                chuyển cửa sổ hoặc để phần mềm khác chèn lên màn hình thi:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-800">
                <li><strong>Lần 1:</strong> Hệ thống cảnh báo và tạm khóa bài thi.</li>
                <li><strong>Lần 2 trở đi:</strong> Toàn bộ bài làm bị xóa và <strong>bắt buộc thi lại từ đầu</strong>.</li>
              </ul>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={onAcknowledgeAndEnterFullscreen}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C8102E] hover:bg-[#A60D25] rounded cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Vào Toàn màn hình & Bắt đầu thi</span>
              </button>
            </div>
          </>
        )}

        {antiCheat.activeLockModal === 'warning_1' && (
          <>
            <div className="px-6 py-4 bg-amber-600 text-white flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 id="proctor-modal-title" className="text-base font-semibold">
                Cảnh báo vi phạm quy chế thi (Lần 1)
              </h2>
            </div>
            <div className="p-6 space-y-3 text-sm text-slate-700 leading-relaxed">
              <p className="font-medium text-slate-900">
                Lý do ghi nhận: {reasonText}.
              </p>
              <p>
                Bạn không được phép thoát khỏi màn hình thi hoặc sử dụng phần mềm khác chèn lên cửa sổ
                làm bài. Đây là cảnh báo đầu tiên.
              </p>
              <p className="font-semibold text-red-700">
                Nếu tái phạm lần thứ 2, toàn bộ câu trả lời hiện tại sẽ bị hủy và bạn phải thi lại từ đầu.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={onAcknowledgeAndEnterFullscreen}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded cursor-pointer"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Quay lại Toàn màn hình & Tiếp tục</span>
              </button>
            </div>
          </>
        )}

        {antiCheat.activeLockModal === 'forced_restart' && (
          <>
            <div className="px-6 py-4 bg-[#C8102E] text-white flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h2 id="proctor-modal-title" className="text-base font-semibold">
                Vi phạm lần {antiCheat.violationCount} — Bắt buộc thi lại từ đầu
              </h2>
            </div>
            <div className="p-6 space-y-3 text-sm text-slate-700 leading-relaxed">
              <p className="font-medium text-slate-900">
                Lý do ghi nhận: {reasonText}.
              </p>
              <p>
                Do đã vi phạm quy chế toàn màn hình từ lần thứ hai trở lên, toàn bộ nội dung bài làm và thời
                gian thi của phần hiện tại đã được <strong>đặt lại từ đầu</strong>.
              </p>
              <p>
                Vui lòng quay lại chế độ toàn màn hình và không mở bất kỳ cửa sổ hay phần mềm nào khác trong
                quá trình làm bài.
              </p>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={onAcknowledgeAndEnterFullscreen}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#C8102E] hover:bg-[#A60D25] rounded cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Bắt đầu thi lại từ đầu (Toàn màn hình)</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

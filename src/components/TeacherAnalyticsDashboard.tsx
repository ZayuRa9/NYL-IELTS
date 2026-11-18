import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BarChart3, RefreshCw, Search, Trash2, Upload } from 'lucide-react';
import { GradedSubmissionRecord, IeltsExam, QuestionType } from '../types/exam';
import {
  computeQuestionTypeAnalytics,
  evaluateSubmissionAgainstExam,
  parseStudentSubmissionText,
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_SHORT_LABELS,
} from '../utils/examLogic';

interface TeacherAnalyticsDashboardProps {
  exams: IeltsExam[];
  refreshToken: number;
  onGoToGrading: () => void;
}

const QUESTION_TYPE_COLORS: Record<QuestionType, string> = {
  'true-false-ng': '#C8102E',
  'yes-no-ng': '#1D4ED8',
  'multiple-choice': '#047857',
  'fill-blank': '#B45309',
  'flow-chart': '#6D28D9',
  matching: '#0F766E',
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Không thể đọc tệp .docx'));
    reader.readAsDataURL(file);
  });
}

export const TeacherAnalyticsDashboard: React.FC<TeacherAnalyticsDashboardProps> = ({
  exams,
  refreshToken,
  onGoToGrading,
}) => {
  const [records, setRecords] = useState<GradedSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const [examFilter, setExamFilter] = useState<string>('all');
  const [batchExamId, setBatchExamId] = useState<string>(exams[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleTypes, setVisibleTypes] = useState<QuestionType[] | null>(null);

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/submissions');
      if (!resp.ok) throw new Error('Không thể tải dữ liệu phân tích từ máy chủ.');
      const data = await resp.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi tải dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubmissions();
  }, [loadSubmissions, refreshToken]);

  useEffect(() => {
    if (!batchExamId && exams[0]?.id) {
      setBatchExamId(exams[0].id);
    }
  }, [exams, batchExamId]);

  const analytics = useMemo(
    () => computeQuestionTypeAnalytics(records, examFilter, searchQuery),
    [records, examFilter, searchQuery]
  );

  const activeSeriesTypes = useMemo(() => {
    if (!visibleTypes) return analytics.activeQuestionTypes;
    const activeSet = new Set(visibleTypes);
    return analytics.activeQuestionTypes.filter((qt) => activeSet.has(qt));
  }, [analytics.activeQuestionTypes, visibleTypes]);

  const handleToggleType = (qt: QuestionType) => {
    setVisibleTypes((prev) => {
      const current = prev ?? analytics.activeQuestionTypes;
      if (current.includes(qt)) {
        if (current.length === 1) return null; // Reset to all if clicking the last active one
        return current.filter((item) => item !== qt);
      }
      return [...current, qt];
    });
  };

  const handleBatchUploadDocx = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const targetExam = exams.find((ex) => ex.id === batchExamId) || exams[0];
    if (!targetExam) {
      setError('Không tìm thấy đề thi để đối chiếu đáp án.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    setError(null);
    setUploadStatus(null);

    try {
      const evaluatedRecords: GradedSubmissionRecord[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64Data = await fileToBase64(file);
        const resp = await fetch('/api/parse-docx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filename: file.name, base64Data }),
        });
        if (!resp.ok) {
          throw new Error(`Không thể đọc tệp "${file.name}".`);
        }
        const data = await resp.json();
        const parsed = parseStudentSubmissionText(data.rawText || '');
        const fallbackName = file.name.replace(/\.docx?$/i, '');
        const normalizedParsed = {
          ...parsed,
          candidateName: parsed.candidateName || fallbackName,
        };
        const timestamp = new Date(Date.now() + i * 1000).toISOString();
        evaluatedRecords.push(evaluateSubmissionAgainstExam(normalizedParsed, targetExam, timestamp));
      }

      const saveResp = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evaluatedRecords),
      });
      if (!saveResp.ok) throw new Error('Không thể lưu dữ liệu chấm bài.');
      const updated = await saveResp.json();
      setRecords(Array.isArray(updated) ? updated : []);
      setUploadStatus(
        `Đã chấm và thêm ${evaluatedRecords.length} bài làm vào biểu đồ phân tích (${targetExam.title}).`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi nhập hàng loạt bài làm .docx.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const resp = await fetch(`/api/submissions/${id}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Không thể xóa bản ghi.');
      const updated = await resp.json();
      setRecords(Array.isArray(updated) ? updated : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi xóa bản ghi.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col gap-4 pb-4 border-b border-slate-200">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Phân tích xu hướng kết quả theo dạng câu hỏi IELTS
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {analytics.summary.submissionCount} bài làm đã chấm ·{' '}
              {analytics.activeQuestionTypes.length} dạng câu hỏi đang theo dõi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Chọn đề thi để chấm hàng loạt"
              value={batchExamId}
              onChange={(e) => setBatchExamId(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded bg-white text-slate-700 max-w-[220px] truncate"
            >
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  Đáp án: {ex.title}
                </option>
              ))}
            </select>

            <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer whitespace-nowrap">
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span>{uploading ? 'Đang phân tích...' : 'Nhập bài làm (.docx)'}</span>
              <input
                type="file"
                multiple
                accept=".docx"
                disabled={uploading}
                onChange={handleBatchUploadDocx}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên thí sinh hoặc SBD..."
                aria-label="Tìm tên thí sinh hoặc số báo danh"
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
              />
            </div>

            <select
              aria-label="Lọc theo đề thi"
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-300 rounded bg-white text-slate-700 max-w-[260px] truncate"
            >
              <option value="all">Tất cả đề thi</option>
              {exams.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.title}
                </option>
              ))}
            </select>
          </div>

          {analytics.activeQuestionTypes.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-md">
              <button
                type="button"
                onClick={() => setVisibleTypes(null)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                  !visibleTypes
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả
              </button>
              {analytics.activeQuestionTypes.map((qt) => {
                const isActive = activeSeriesTypes.includes(qt);
                return (
                  <button
                    key={qt}
                    type="button"
                    onClick={() => handleToggleType(qt)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-xs shrink-0"
                      style={{ backgroundColor: QUESTION_TYPE_COLORS[qt] }}
                      aria-hidden="true"
                    />
                    <span>{QUESTION_TYPE_SHORT_LABELS[qt]}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {uploadStatus && (
        <div role="status" className="px-4 py-2.5 text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded">
          {uploadStatus}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="px-4 py-3 text-xs text-red-900 bg-red-50 border border-red-200 rounded flex items-center justify-between gap-4"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={loadSubmissions}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white border border-red-300 rounded hover:bg-red-50 cursor-pointer whitespace-nowrap"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* Loading Skeleton State */}
      {loading && (
        <div className="space-y-4" aria-busy="true" aria-label="Đang tải dữ liệu thống kê">
          <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-200 rounded-md divide-x divide-slate-200 bg-white">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="p-4 space-y-2">
                <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                <div className="h-6 w-16 bg-slate-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-72 border border-slate-200 rounded-md bg-slate-50 animate-pulse" />
        </div>
      )}

      {/* Empty State */}
      {!loading && analytics.filteredRecords.length === 0 && (
        <div className="p-8 rounded-md border border-dashed border-slate-300 bg-slate-50 text-center space-y-4">
          <BarChart3 className="w-8 h-8 text-slate-400 mx-auto" />
          <div className="space-y-1 max-w-lg mx-auto">
            <p className="text-sm font-semibold text-slate-900">
              {records.length === 0
                ? 'Chưa có bài làm học viên nào được chấm để thống kê'
                : 'Không có bài làm nào khớp với bộ lọc hiện tại'}
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              {records.length === 0
                ? 'Hãy chọn một hoặc nhiều file bài làm (.docx) mà thí sinh gửi về để hệ thống chấm tự động theo đáp án và vẽ biểu đồ xu hướng từng dạng câu hỏi (TFNG, YNNG, Flow-Chart, Matching, MCQ).'
                : 'Hãy thử xóa từ khóa tìm kiếm hoặc chọn "Tất cả đề thi" để xem dữ liệu.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <label className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#C8102E] hover:bg-[#A60D25] rounded cursor-pointer whitespace-nowrap">
              <Upload className="w-3.5 h-3.5" />
              <span>Tải nhiều file bài làm (.docx)</span>
              <input
                type="file"
                multiple
                accept=".docx"
                onChange={handleBatchUploadDocx}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={onGoToGrading}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded cursor-pointer whitespace-nowrap"
            >
              Sang mục Chấm từng bài
            </button>
          </div>
        </div>
      )}

      {/* Populated Dashboard View */}
      {!loading && analytics.filteredRecords.length > 0 && (
        <div className="space-y-6">
          {/* 4-Cell Flat KPI Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-200 rounded-md divide-y lg:divide-y-0 lg:divide-x divide-slate-200 bg-white">
            <div className="p-4">
              <p className="text-xs text-slate-500">Số bài đã chấm</p>
              <p className="text-xl font-bold text-slate-900 font-mono-num mt-1">
                {analytics.summary.submissionCount}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 font-mono-num">
                TB đúng {analytics.summary.avgOverallAccuracyPct}%
              </p>
            </div>

            <div className="p-4">
              <p className="text-xs text-slate-500">Band điểm trung bình</p>
              <p className="text-xl font-bold text-[#C8102E] font-mono-num mt-1">
                {analytics.summary.avgBandScore.toFixed(1)}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Thang điểm IELTS 9.0</p>
            </div>

            <div className="p-4">
              <p className="text-xs text-slate-500">Dạng làm tốt nhất</p>
              <p className="text-sm font-bold text-emerald-700 mt-1 leading-snug">
                {analytics.summary.strongestType
                  ? analytics.summary.strongestType.label
                  : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 font-mono-num">
                {analytics.summary.strongestType
                  ? `${analytics.summary.strongestType.avgAccuracyPct}% (${analytics.summary.strongestType.totalCorrect}/${analytics.summary.strongestType.totalQuestions})`
                  : ''}
              </p>
            </div>

            <div className="p-4">
              <p className="text-xs text-slate-500">Dạng cần cải thiện</p>
              <p className="text-sm font-bold text-amber-700 mt-1 leading-snug">
                {analytics.summary.weakestType ? analytics.summary.weakestType.label : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 font-mono-num">
                {analytics.summary.weakestType
                  ? `${analytics.summary.weakestType.avgAccuracyPct}% (${analytics.summary.weakestType.totalCorrect}/${analytics.summary.weakestType.totalQuestions})`
                  : ''}
              </p>
            </div>
          </div>

          {/* Primary Recharts Trend LineChart */}
          <section className="border border-slate-200 rounded-md bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Xu hướng tỷ lệ làm đúng (%) theo từng dạng câu hỏi qua các lần nộp
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Theo thứ tự thời gian từ trái sang phải · Nhấn vào dạng câu hỏi ở thanh lọc trên để tách hoặc so sánh
                </p>
              </div>
              <span className="text-xs font-mono-num text-slate-500">
                Mục tiêu chuẩn: 70%
              </span>
            </div>

            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={analytics.trendSeries}
                  margin={{ top: 10, right: 38, left: -12, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="sequenceLabel"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    stroke="#CBD5E1"
                  />
                  <YAxis
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    stroke="#CBD5E1"
                  />
                  <ReferenceLine
                    y={70}
                    stroke="#94A3B8"
                    strokeDasharray="4 4"
                    label={{ value: '70%', position: 'right', fill: '#64748B', fontSize: 10 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const pt = payload[0].payload as Record<string, unknown>;
                      return (
                        <div className="bg-white border border-slate-200 rounded shadow-md px-3.5 py-2.5 text-xs space-y-1.5">
                          <div className="font-semibold text-slate-900">
                            {String(pt.candidateName)} ({String(pt.candidateId)})
                          </div>
                          <div className="text-slate-500 font-mono-num">
                            Band {Number(pt.bandScore).toFixed(1)} · Tổng {String(pt.overallPct)}%
                          </div>
                          <div className="pt-1 border-t border-slate-100 space-y-1">
                            {payload.map((entry) => (
                              <div
                                key={String(entry.dataKey)}
                                className="flex items-center justify-between gap-4"
                              >
                                <span className="flex items-center gap-1.5 text-slate-700">
                                  <span
                                    className="w-2 h-2 rounded-xs shrink-0"
                                    style={{ backgroundColor: entry.color }}
                                  />
                                  <span>{String(entry.name)}</span>
                                </span>
                                <span className="font-mono-num font-semibold text-slate-900">
                                  {String(entry.value)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }}
                  />
                  {activeSeriesTypes.map((qt) => (
                    <Line
                      key={qt}
                      type="monotone"
                      dataKey={qt}
                      name={QUESTION_TYPE_LABELS[qt]}
                      stroke={QUESTION_TYPE_COLORS[qt]}
                      strokeWidth={2.2}
                      dot={{ r: 3.5, fill: QUESTION_TYPE_COLORS[qt], strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                      connectNulls
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Question Type Average BarChart */}
          <section className="border border-slate-200 rounded-md bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Độ chính xác trung bình theo từng dạng câu hỏi
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tổng hợp tỷ lệ đúng (%) trên tất cả lượt làm bài trong bộ lọc hiện tại
                </p>
              </div>
              <span className="text-xs font-mono-num text-slate-500">
                Đường chuẩn: 70%
              </span>
            </div>

            <div className="w-full h-[260px]">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={analytics.typeAverages}
                  layout="vertical"
                  margin={{ top: 5, right: 28, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    stroke="#CBD5E1"
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={165}
                    tick={{ fontSize: 11, fill: '#1E293B', fontWeight: 500 }}
                    stroke="#CBD5E1"
                  />
                  <ReferenceLine x={70} stroke="#94A3B8" strokeDasharray="4 4" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const item = payload[0].payload as (typeof analytics.typeAverages)[number];
                      return (
                        <div className="bg-white border border-slate-200 rounded shadow-md px-3 py-2 text-xs space-y-1">
                          <p className="font-semibold text-slate-900">{item.label}</p>
                          <p className="font-mono-num text-slate-700">
                            Chính xác: <strong>{item.avgAccuracyPct}%</strong> ({item.totalCorrect}/{item.totalQuestions} câu)
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Bar
                    dataKey="avgAccuracyPct"
                    radius={[0, 4, 4, 0]}
                    barSize={24}
                    isAnimationActive={false}
                  >
                    {analytics.typeAverages.map((entry) => (
                      <Cell
                        key={entry.questionType}
                        fill={QUESTION_TYPE_COLORS[entry.questionType]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Recent Graded Submissions Table (Full-Width Clean Alignment) */}
          <section className="border border-slate-200 rounded-md bg-white overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Danh sách bài làm đã thống kê
              </h3>
              <span className="text-xs text-slate-500 font-mono-num">
                {analytics.filteredRecords.length} bản ghi
              </span>
            </div>

            <div className="overflow-x-auto max-h-[320px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold border-b border-slate-200 whitespace-nowrap">Thí sinh</th>
                    <th className="px-4 py-2.5 font-semibold border-b border-slate-200 whitespace-nowrap">SBD</th>
                    <th className="px-4 py-2.5 font-semibold border-b border-slate-200 whitespace-nowrap">Đề thi</th>
                    <th className="px-4 py-2.5 font-semibold border-b border-slate-200 text-right whitespace-nowrap">Số câu đúng</th>
                    <th className="px-4 py-2.5 font-semibold border-b border-slate-200 text-right whitespace-nowrap">Band</th>
                    <th className="px-4 py-2.5 font-semibold border-b border-slate-200 text-right whitespace-nowrap">Vi phạm</th>
                    <th className="px-4 py-2.5 font-semibold border-b border-slate-200 text-right whitespace-nowrap w-14">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {analytics.filteredRecords.map((rec) => (
                    <tr key={rec.id} className="hover:bg-slate-50 h-10">
                      <td className="px-4 py-2 font-medium text-slate-900 whitespace-nowrap">
                        {rec.candidateName}
                      </td>
                      <td className="px-4 py-2 font-mono-num text-slate-600 whitespace-nowrap">
                        {rec.candidateId}
                      </td>
                      <td className="px-4 py-2 text-slate-600 max-w-[220px] truncate">
                        {rec.examTitle}
                      </td>
                      <td className="px-4 py-2 font-mono-num text-right text-slate-900 whitespace-nowrap">
                        {rec.readingCorrect}/{rec.readingTotal}
                      </td>
                      <td className="px-4 py-2 font-mono-num text-right font-bold text-[#C8102E] whitespace-nowrap">
                        {rec.bandScore.toFixed(1)}
                      </td>
                      <td
                        className={`px-4 py-2 font-mono-num text-right whitespace-nowrap ${
                          rec.violationCount > 0 ? 'text-red-700 font-semibold' : 'text-slate-600'
                        }`}
                      >
                        {rec.violationCount} lần
                      </td>
                      <td className="px-4 py-2 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(rec.id)}
                          aria-label={`Xóa kết quả của ${rec.candidateName}`}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

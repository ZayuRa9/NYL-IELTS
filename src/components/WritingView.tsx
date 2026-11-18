import React, { useRef, useState } from 'react';
import { Clipboard, Copy, Scissors } from 'lucide-react';
import { WritingTask } from '../types/exam';
import { countWords } from '../utils/examLogic';

interface WritingViewProps {
  tasks: WritingTask[];
  activeTaskIndex: number;
  answers: Record<number, string>;
  textSizeClass: string;
  onChangeAnswer: (taskNumber: number, value: string) => void;
}

const RenewableEnergySvgChart: React.FC = () => {
  const countries = [
    { name: 'Denmark', solar: 14, wind: 58, hydro: 2 },
    { name: 'Germany', solar: 21, wind: 32, hydro: 6 },
    { name: 'Spain', solar: 27, wind: 29, hydro: 13 },
    { name: 'Austria', solar: 11, wind: 16, hydro: 57 },
  ];

  return (
    <div className="p-4 rounded border border-slate-200 bg-white text-slate-900">
      <p className="text-xs font-bold text-slate-900 mb-3">
        Renewable Electricity Generation by Source (2024, % of total national electricity)
      </p>
      <svg
        viewBox="0 0 520 250"
        className="w-full h-auto"
        role="img"
        aria-label="Bar chart comparing solar, wind, and hydro electricity percentages in Denmark, Germany, Spain, and Austria"
      >
        {/* Grid lines */}
        {[0, 20, 40, 60].map((val) => {
          const y = 200 - val * 2.5;
          return (
            <g key={val}>
              <line x1="45" y1={y} x2="500" y2={y} stroke="#E2E8F0" strokeWidth="1" />
              <text x="36" y={y + 4} textAnchor="end" fontSize="10" fill="#64748B">
                {val}%
              </text>
            </g>
          );
        })}
        <line x1="45" y1="200" x2="500" y2="200" stroke="#94A3B8" strokeWidth="1.2" />

        {countries.map((c, idx) => {
          const baseX = 72 + idx * 108;
          return (
            <g key={c.name}>
              {/* Solar */}
              <rect x={baseX} y={200 - c.solar * 2.5} width="22" height={c.solar * 2.5} fill="#D97706" />
              <text x={baseX + 11} y={196 - c.solar * 2.5} textAnchor="middle" fontSize="9" fill="#334155">
                {c.solar}
              </text>

              {/* Wind */}
              <rect x={baseX + 26} y={200 - c.wind * 2.5} width="22" height={c.wind * 2.5} fill="#0284C7" />
              <text x={baseX + 37} y={196 - c.wind * 2.5} textAnchor="middle" fontSize="9" fill="#334155">
                {c.wind}
              </text>

              {/* Hydro */}
              <rect x={baseX + 52} y={200 - c.hydro * 2.5} width="22" height={c.hydro * 2.5} fill="#0F766E" />
              <text x={baseX + 63} y={196 - c.hydro * 2.5} textAnchor="middle" fontSize="9" fill="#334155">
                {c.hydro}
              </text>

              <text x={baseX + 37} y="218" textAnchor="middle" fontSize="11" fontWeight="600" fill="#1E293B">
                {c.name}
              </text>
            </g>
          );
        })}

        {/* Legend */}
        <g transform="translate(150, 232)">
          <rect x="0" y="0" width="10" height="10" fill="#D97706" />
          <text x="14" y="9" fontSize="10" fill="#334155">Solar</text>
          <rect x="70" y="0" width="10" height="10" fill="#0284C7" />
          <text x="84" y="9" fontSize="10" fill="#334155">Wind</text>
          <rect x="140" y="0" width="10" height="10" fill="#0F766E" />
          <text x="154" y="9" fontSize="10" fill="#334155">Hydro</text>
        </g>
      </svg>
    </div>
  );
};

const WfhLineSvgChart: React.FC = () => {
  const years = [2016, 2018, 2020, 2022, 2024, 2026];
  const series = [
    { name: 'Canada', color: '#C8102E', dash: undefined, values: [6, 8, 38, 30, 27, 29] },
    { name: 'Japan', color: '#0369A1', dash: '6 4', values: [3, 4, 22, 18, 15, 14] },
    { name: 'Brazil', color: '#15803D', dash: '2 4', values: [5, 6, 28, 20, 17, 16] },
    { name: 'Sweden', color: '#D97706', dash: undefined, values: [9, 11, 45, 41, 44, 48] },
  ];

  const xPos = (idx: number) => 60 + idx * 84;
  const yPos = (val: number) => 210 - (val / 60) * 170;

  return (
    <div className="p-4 rounded border border-slate-200 bg-white text-slate-900">
      <p className="text-xs font-bold text-center text-slate-900 mb-2">
        Employees working from home at least three days a week (%), 2016–2026
      </p>
      <svg
        viewBox="0 0 520 260"
        className="w-full h-auto"
        role="img"
        aria-label="Line graph showing percentage of employees working from home at least three days a week in Canada, Japan, Brazil, and Sweden from 2016 to 2026"
      >
        {/* Horizontal Gridlines & Y-Axis Labels */}
        {[0, 10, 20, 30, 40, 50, 60].map((val) => {
          const y = yPos(val);
          return (
            <g key={val}>
              <line x1="52" y1={y} x2="495" y2={y} stroke="#E2E8F0" strokeWidth="1" />
              <text x="44" y={y + 3.5} textAnchor="end" fontSize="10" fill="#475569">
                {val}
              </text>
            </g>
          );
        })}

        {/* Axes */}
        <line x1="52" y1="40" x2="52" y2="210" stroke="#475569" strokeWidth="1.2" />
        <line x1="52" y1="210" x2="495" y2="210" stroke="#475569" strokeWidth="1.2" />

        {/* Y-Axis Title */}
        <text
          x="16"
          y="125"
          textAnchor="middle"
          fontSize="10"
          fill="#334155"
          transform="rotate(-90 16 125)"
        >
          % of employees
        </text>

        {/* X-Axis Ticks & Labels */}
        {years.map((yr, idx) => {
          const x = xPos(idx);
          return (
            <g key={yr}>
              <line x1={x} y1="210" x2={x} y2="215" stroke="#475569" strokeWidth="1.2" />
              <text x={x} y="229" textAnchor="middle" fontSize="10" fill="#334155">
                {yr}
              </text>
            </g>
          );
        })}
        <text x="273" y="247" textAnchor="middle" fontSize="10" fill="#334155">
          Year
        </text>

        {/* Legend at top-left inside plot */}
        <g transform="translate(65, 48)">
          {series.map((s, idx) => (
            <g key={s.name} transform={`translate(${idx * 80}, 0)`}>
              <line
                x1="0"
                y1="5"
                x2="18"
                y2="5"
                stroke={s.color}
                strokeWidth="2"
                strokeDasharray={s.dash}
              />
              <circle cx="9" cy="5" r="2.5" fill={s.color} />
              <text x="22" y="8.5" fontSize="10" fill="#1E293B">
                {s.name}
              </text>
            </g>
          ))}
        </g>

        {/* Series Lines & Points */}
        {series.map((s) => {
          const pts = s.values.map((v, i) => `${xPos(i)},${yPos(v)}`).join(' ');
          return (
            <g key={s.name}>
              <polyline
                fill="none"
                stroke={s.color}
                strokeWidth="2.2"
                strokeDasharray={s.dash}
                points={pts}
              />
              {s.values.map((v, i) => (
                <circle key={i} cx={xPos(i)} cy={yPos(v)} r="3.2" fill={s.color} />
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const WritingView: React.FC<WritingViewProps> = ({
  tasks,
  activeTaskIndex,
  answers,
  textSizeClass,
  onChangeAnswer,
}) => {
  const task = tasks[activeTaskIndex] || tasks[0];
  const [leftWidthPct, setLeftWidthPct] = useState(45);
  const [clipboardBuffer, setClipboardBuffer] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const draggingRef = useRef(false);

  if (!task) return null;

  const essay = answers[task.taskNumber] ?? '';
  const wordCount = countWords(essay);

  const handleMouseDownDivider = () => {
    draggingRef.current = true;
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidthPct(Math.min(65, Math.max(30, pct)));
    };
    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleCutOrCopy = (mode: 'cut' | 'copy') => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    if (start === end) return;
    const selected = essay.slice(start, end);
    setClipboardBuffer(selected);
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(selected).catch(() => {});
    }
    if (mode === 'cut') {
      const updated = essay.slice(0, start) + essay.slice(end);
      onChangeAnswer(task.taskNumber, updated);
    }
  };

  const handlePaste = async () => {
    const el = textareaRef.current;
    if (!el) return;
    let pasteText = clipboardBuffer;
    try {
      if (navigator.clipboard?.readText) {
        const systemClip = await navigator.clipboard.readText();
        if (systemClip) pasteText = systemClip;
      }
    } catch {
      // Fallback to in-app clipboard buffer if browser denies clipboard read
    }
    if (!pasteText) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const updated = essay.slice(0, start) + pasteText + essay.slice(end);
    onChangeAnswer(task.taskNumber, updated);
  };

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col lg:flex-row min-h-0 bg-[var(--cdi-bg)] text-[var(--cdi-text)] overflow-hidden"
    >
      {/* Left Pane: Task Prompt & Visual */}
      <div
        style={{ width: `${leftWidthPct}%` }}
        className="w-full lg:w-auto overflow-y-auto cdi-scroll px-6 py-5 space-y-5 border-b lg:border-b-0 border-[var(--cdi-border)]"
      >
        <div className="pb-3 border-b border-[var(--cdi-border)] flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-bold">{task.title}</h2>
          <span className="text-xs text-[var(--cdi-muted)] whitespace-nowrap">
            Gợi ý {task.suggestedMinutes} phút · Tối thiểu {task.minWords} từ
          </span>
        </div>

        <div className={`space-y-3 whitespace-pre-line leading-relaxed ${textSizeClass}`}>
          {task.prompt}
        </div>

        {task.imageUrl && (
          <div className="rounded border border-[var(--cdi-border)] overflow-hidden bg-white p-2">
            <img
              src={task.imageUrl}
              alt={`${task.title} visual diagram`}
              referrerPolicy="no-referrer"
              className="w-full h-auto object-contain max-h-96"
            />
          </div>
        )}

        {!task.imageUrl && task.svgChartType === 'bar-energy-2026' && <RenewableEnergySvgChart />}
        {!task.imageUrl && task.svgChartType === 'line-wfh-2016-2026' && <WfhLineSvgChart />}
      </div>

      {/* Draggable Vertical Splitter */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize writing prompt and editor panels"
        onMouseDown={handleMouseDownDivider}
        className="hidden lg:flex w-2 bg-[var(--cdi-surface)] hover:bg-slate-400/40 border-x border-[var(--cdi-border)] cursor-col-resize items-center justify-center shrink-0 transition-colors"
      >
        <div className="w-0.5 h-8 bg-slate-400 rounded-full" />
      </div>

      {/* Right Pane: Essay Editor + Word Count */}
      <div className="flex-1 flex flex-col min-h-0 p-5 gap-3">
        <div className="flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleCutOrCopy('cut')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-[var(--cdi-border)] bg-[var(--cdi-surface)] rounded hover:opacity-80 cursor-pointer"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Cut</span>
            </button>
            <button
              type="button"
              onClick={() => handleCutOrCopy('copy')}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-[var(--cdi-border)] bg-[var(--cdi-surface)] rounded hover:opacity-80 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium border border-[var(--cdi-border)] bg-[var(--cdi-surface)] rounded hover:opacity-80 cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          </div>

          <div className="text-xs font-mono-num font-semibold text-[var(--cdi-text)]">
            Words: <span className={wordCount >= task.minWords ? 'text-emerald-600' : ''}>{wordCount}</span>
          </div>
        </div>

        <textarea
          ref={textareaRef}
          aria-label={`${task.title} essay editor`}
          value={essay}
          onChange={(e) => onChangeAnswer(task.taskNumber, e.target.value)}
          spellCheck={false}
          placeholder={`Viết bài ${task.title} của bạn tại đây...`}
          className={`flex-1 w-full p-4 rounded border border-[var(--cdi-input-border)] bg-[var(--cdi-input-bg)] text-[var(--cdi-text)] leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-[#C8102E] ${textSizeClass}`}
        />
      </div>
    </div>
  );
};

import React, { useRef, useState } from 'react';
import { Highlighter, StickyNote, Trash2 } from 'lucide-react';
import { ReadingPassage, TextHighlight } from '../types/exam';
import { QuestionRenderer } from './QuestionRenderer';

interface ReadingViewProps {
  passages: ReadingPassage[];
  activePassageIndex: number;
  answers: Record<number, string>;
  currentQuestionNumber: number;
  textSizeClass: string;
  highlights: TextHighlight[];
  onAddHighlight: (item: TextHighlight) => void;
  onRemoveHighlight: (id: string) => void;
  onChangeAnswer: (questionNumber: number, value: string) => void;
  onFocusQuestion: (questionNumber: number) => void;
}

export const ReadingView: React.FC<ReadingViewProps> = ({
  passages,
  activePassageIndex,
  answers,
  currentQuestionNumber,
  textSizeClass,
  highlights,
  onAddHighlight,
  onRemoveHighlight,
  onChangeAnswer,
  onFocusQuestion,
}) => {
  const passage = passages[activePassageIndex] || passages[0];
  const [leftWidthPct, setLeftWidthPct] = useState(50);
  const [selectedSnippet, setSelectedSnippet] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  if (!passage) return null;

  const passageHighlights = highlights.filter((h) => h.passageId === passage.id);

  const handleMouseDownDivider = () => {
    draggingRef.current = true;
    const onMove = (e: MouseEvent) => {
      if (!draggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setLeftWidthPct(Math.min(70, Math.max(30, pct)));
    };
    const onUp = () => {
      draggingRef.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const captureSelection = () => {
    const sel = window.getSelection()?.toString().trim() || '';
    if (sel.length >= 2 && sel.length <= 400) {
      setSelectedSnippet(sel);
    }
  };

  const applyHighlight = (withNote = false) => {
    if (!selectedSnippet) return;
    onAddHighlight({
      id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      passageId: passage.id,
      text: selectedSnippet,
      note: withNote && noteInput.trim() ? noteInput.trim() : undefined,
    });
    setSelectedSnippet('');
    setNoteInput('');
    setShowNoteForm(false);
    window.getSelection()?.removeAllRanges();
  };

  const renderParagraphWithHighlights = (para: string) => {
    if (passageHighlights.length === 0) return para;
    let segments: (string | { text: string; id: string; note?: string })[] = [para];

    passageHighlights.forEach((hl) => {
      const nextSegments: typeof segments = [];
      segments.forEach((seg) => {
        if (typeof seg !== 'string') {
          nextSegments.push(seg);
          return;
        }
        const idx = seg.indexOf(hl.text);
        if (idx === -1) {
          nextSegments.push(seg);
          return;
        }
        if (idx > 0) nextSegments.push(seg.slice(0, idx));
        nextSegments.push({ text: hl.text, id: hl.id, note: hl.note });
        const after = seg.slice(idx + hl.text.length);
        if (after) nextSegments.push(after);
      });
      segments = nextSegments;
    });

    return segments.map((seg, i) =>
      typeof seg === 'string' ? (
        <React.Fragment key={i}>{seg}</React.Fragment>
      ) : (
        <mark
          key={`${seg.id}-${i}`}
          title={seg.note ? `Note: ${seg.note}` : 'Highlighted text'}
          style={{
            backgroundColor: 'var(--cdi-highlight)',
            color: 'var(--cdi-highlight-text)',
          }}
          className="px-0.5 rounded-xs"
        >
          {seg.text}
        </mark>
      )
    );
  };

  const paragraphs = passage.content.split(/\n\s*\n/).filter((p) => p.trim());

  return (
    <div
      ref={containerRef}
      className="flex-1 flex flex-col lg:flex-row min-h-0 bg-[var(--cdi-bg)] text-[var(--cdi-text)] overflow-hidden"
    >
      {/* Left Pane: Reading Passage + CDI Highlighter Toolbar */}
      <div
        style={{ width: `${leftWidthPct}%` }}
        className="w-full lg:w-auto flex flex-col min-h-0 border-b lg:border-b-0 border-[var(--cdi-border)]"
      >
        <div className="px-5 py-2 border-b border-[var(--cdi-border)] bg-[var(--cdi-surface)] flex flex-wrap items-center justify-between gap-2 shrink-0">
          <span className="text-xs font-semibold text-[var(--cdi-muted)]">
            Passage {activePassageIndex + 1} · Bôi đen văn bản để Highlight hoặc ghi chú
          </span>
          <div className="flex items-center gap-2">
            {selectedSnippet && (
              <>
                <button
                  type="button"
                  onClick={() => applyHighlight(false)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-300 text-slate-900 rounded hover:bg-amber-400 cursor-pointer"
                >
                  <Highlighter className="w-3.5 h-3.5" />
                  <span>Highlight</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowNoteForm((prev) => !prev)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <StickyNote className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              </>
            )}
          </div>
        </div>

        {showNoteForm && selectedSnippet && (
          <div className="px-5 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2 text-slate-900 shrink-0">
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Nhập ghi chú cho đoạn đã chọn..."
              className="flex-1 px-2.5 py-1 text-xs bg-white border border-amber-300 rounded focus:outline-none"
            />
            <button
              type="button"
              onClick={() => applyHighlight(true)}
              className="px-3 py-1 text-xs font-semibold bg-slate-900 text-white rounded cursor-pointer"
            >
              Lưu
            </button>
          </div>
        )}

        <article
          onMouseUp={captureSelection}
          className="flex-1 overflow-y-auto cdi-scroll px-6 py-5 space-y-4"
        >
          <header className="space-y-1.5 pb-3 border-b border-[var(--cdi-border)]">
            {passage.subtitle && (
              <p className="text-xs italic text-[var(--cdi-muted)]">{passage.subtitle}</p>
            )}
            <h2 className="text-xl font-bold font-passage text-[var(--cdi-text)] leading-snug">
              {passage.title}
            </h2>
          </header>

          <div className={`font-passage space-y-4 leading-relaxed ${textSizeClass}`}>
            {paragraphs.map((para, idx) =>
              para.trim() === '[[FIGURE:rotor-sail]]' ? (
                <figure
                  key={idx}
                  className="my-4 p-4 rounded border border-slate-200 bg-white text-slate-900"
                >
                  <figcaption className="text-xs font-semibold text-slate-800 mb-3">
                    Figure 1: A spinning rotor turns a crosswind into forward thrust (seen from above)
                  </figcaption>
                  <svg
                    viewBox="0 0 460 190"
                    className="w-full max-w-md mx-auto h-auto"
                    role="img"
                    aria-label="Diagram showing wind blowing from the left across a spinning rotor on a ship hull, generating forward thrust at right angles to the wind"
                  >
                    <defs>
                      <marker id="arrow-grey" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#94A3B8" />
                      </marker>
                      <marker id="arrow-blue" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                        <path d="M0,0 L6,3 L0,6 Z" fill="#0284C7" />
                      </marker>
                    </defs>
                    {/* Wind arrows */}
                    <text x="20" y="88" fontSize="11" fontWeight="700" fill="#1E293B">Wind</text>
                    <line x1="20" y1="100" x2="210" y2="100" stroke="#CBD5E1" strokeWidth="1.5" markerEnd="url(#arrow-grey)" />
                    <line x1="20" y1="118" x2="210" y2="118" stroke="#CBD5E1" strokeWidth="1.5" markerEnd="url(#arrow-grey)" />
                    <line x1="20" y1="136" x2="210" y2="136" stroke="#CBD5E1" strokeWidth="1.5" markerEnd="url(#arrow-grey)" />

                    {/* Ship hull seen from above */}
                    <path
                      d="M 275 170 L 275 75 Q 275 45 305 28 Q 335 45 335 75 L 335 170 Z"
                      fill="#F8FAFC"
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                    />

                    {/* Forward Thrust vector */}
                    <line x1="305" y1="108" x2="305" y2="10" stroke="#0284C7" strokeWidth="2" markerEnd="url(#arrow-blue)" />
                    <text x="318" y="20" fontSize="11" fontWeight="700" fill="#1E293B">Thrust</text>
                    <text x="318" y="34" fontSize="9.5" fill="#475569">at right angles to the wind</text>

                    {/* Rotor cylinder */}
                    <circle cx="305" cy="122" r="14" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.5" />
                    <text x="305" y="125" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="#1E293B">Rotor</text>

                    {/* Spin arc */}
                    <path d="M 284 128 A 22 22 0 0 0 326 128" fill="none" stroke="#B45309" strokeWidth="1.3" />
                    <text x="305" y="160" textAnchor="middle" fontSize="9.5" fill="#64748B">Spin</text>
                  </svg>
                </figure>
              ) : (
                <p key={idx} className="leading-[1.7]">
                  {renderParagraphWithHighlights(para)}
                </p>
              )
            )}
          </div>

          {passageHighlights.length > 0 && (
            <div className="pt-4 mt-6 border-t border-[var(--cdi-border)] space-y-2">
              <p className="text-xs font-semibold text-[var(--cdi-muted)]">
                Highlights & Notes ({passageHighlights.length})
              </p>
              <div className="space-y-1.5">
                {passageHighlights.map((hl) => (
                  <div
                    key={hl.id}
                    className="flex items-start justify-between gap-2 px-3 py-2 rounded border border-[var(--cdi-border)] bg-[var(--cdi-surface)] text-xs"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">"{hl.text}"</p>
                      {hl.note && <p className="text-[var(--cdi-muted)] mt-0.5">Note: {hl.note}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveHighlight(hl.id)}
                      aria-label="Remove highlight"
                      className="p-1 text-[var(--cdi-muted)] hover:text-red-600 shrink-0 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>

      {/* Draggable Vertical Splitter */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize reading passage and questions panels"
        onMouseDown={handleMouseDownDivider}
        className="hidden lg:flex w-2 bg-[var(--cdi-surface)] hover:bg-slate-400/40 border-x border-[var(--cdi-border)] cursor-col-resize items-center justify-center shrink-0 transition-colors"
      >
        <div className="w-0.5 h-8 bg-slate-400 rounded-full" />
      </div>

      {/* Right Pane: Questions */}
      <div className="flex-1 overflow-y-auto cdi-scroll px-6 py-5 space-y-6 min-h-0">
        {passage.questionGroups.map((group) => (
          <QuestionRenderer
            key={group.id}
            group={group}
            answers={answers}
            currentQuestionNumber={currentQuestionNumber}
            textSizeClass={textSizeClass}
            onChangeAnswer={onChangeAnswer}
            onFocusQuestion={onFocusQuestion}
          />
        ))}
      </div>
    </div>
  );
};

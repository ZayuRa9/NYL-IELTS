import React, { useRef, useState } from 'react';
import { ReadingPassage, TextHighlight } from '../types/exam';
import { getHighlightScopeId } from '../utils/highlightLogic';
import { HighlightableText } from './HighlightableText';
import {
  HighlightsNotesList,
  HighlightToolbar,
  useTextSelectionCapture,
} from './HighlightToolbar';
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
  onUpdateHighlightNote?: (id: string, note: string) => void;
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
  onUpdateHighlightNote,
  onChangeAnswer,
  onFocusQuestion,
}) => {
  const passage = passages[activePassageIndex] || passages[0];
  const [leftWidthPct, setLeftWidthPct] = useState(50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  const scopeId = passage ? getHighlightScopeId('reading', passage.id) : 'reading:none';
  const { selectedSnippet, captureSelection, clearSelection } = useTextSelectionCapture(scopeId);

  if (!passage) return null;

  const passageHighlights = highlights.filter((h) => h.passageId === scopeId);

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
        <HighlightToolbar
          scopeId={scopeId}
          hintText={`Passage ${activePassageIndex + 1} · Bôi đen văn bản để Highlight hoặc ghi chú`}
          highlights={passageHighlights}
          selectedSnippet={selectedSnippet}
          onClearSelection={clearSelection}
          onAddHighlight={onAddHighlight}
          onRemoveHighlight={onRemoveHighlight}
          onUpdateHighlightNote={onUpdateHighlightNote}
          notePlaceholder={`Nhập ghi chú cho Passage ${activePassageIndex + 1}...`}
        />

        <article
          onMouseUp={captureSelection}
          onKeyUp={captureSelection}
          className="flex-1 overflow-y-auto cdi-scroll px-6 py-5 space-y-4"
        >
          <header className="space-y-1.5 pb-3 border-b border-[var(--cdi-border)]">
            {passage.subtitle && (
              <p className="text-xs italic text-[var(--cdi-muted)]">
                <HighlightableText text={passage.subtitle} highlights={passageHighlights} />
              </p>
            )}
            <h2 className="text-xl font-bold font-passage text-[var(--cdi-text)] leading-snug">
              <HighlightableText text={passage.title} highlights={passageHighlights} />
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
                  <HighlightableText text={para} highlights={passageHighlights} />
                </p>
              )
            )}
          </div>

          <HighlightsNotesList
            highlights={passageHighlights}
            onRemoveHighlight={onRemoveHighlight}
            onUpdateHighlightNote={onUpdateHighlightNote}
          />
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
      <div
        onMouseUp={captureSelection}
        onKeyUp={captureSelection}
        className="flex-1 overflow-y-auto cdi-scroll px-6 py-5 space-y-6 min-h-0"
      >
        {passage.questionGroups.map((group) => (
          <QuestionRenderer
            key={group.id}
            group={group}
            answers={answers}
            currentQuestionNumber={currentQuestionNumber}
            textSizeClass={textSizeClass}
            highlights={passageHighlights}
            onChangeAnswer={onChangeAnswer}
            onFocusQuestion={onFocusQuestion}
          />
        ))}
      </div>
    </div>
  );
};

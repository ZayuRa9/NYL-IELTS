import React from 'react';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';
import { FlattenedQuestionRef } from '../utils/examLogic';

interface CdiBottomNavProps {
  containers: { label: string; index: number }[];
  activeContainerIndex: number;
  questions: FlattenedQuestionRef[];
  currentQuestionNumber: number;
  answers: Record<number, string>;
  flaggedQuestions: number[];
  onSelectContainer: (index: number) => void;
  onSelectQuestion: (questionNumber: number, containerIndex: number) => void;
  onToggleReview: (questionNumber: number) => void;
}

export const CdiBottomNav: React.FC<CdiBottomNavProps> = ({
  containers,
  activeContainerIndex,
  questions,
  currentQuestionNumber,
  answers,
  flaggedQuestions,
  onSelectContainer,
  onSelectQuestion,
  onToggleReview,
}) => {
  const currentIdx = questions.findIndex((q) => q.number === currentQuestionNumber);
  const prevQ = currentIdx > 0 ? questions[currentIdx - 1] : null;
  const nextQ = currentIdx >= 0 && currentIdx < questions.length - 1 ? questions[currentIdx + 1] : null;
  const isCurrentFlagged = flaggedQuestions.includes(currentQuestionNumber);

  return (
    <footer className="bg-[#F1F5F9] border-t border-slate-300 px-3 py-2 flex flex-col gap-1.5 select-none shrink-0 text-slate-900">
      {/* Top Row: Part/Passage Tabs + Review Checkbox + Prev/Next */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {containers.map((c) => {
            const isActive = c.index === activeContainerIndex;
            const partQuestions = questions.filter((q) => q.containerIndex === c.index);
            const answeredCount = partQuestions.filter((q) => Boolean(answers[q.number]?.trim())).length;
            return (
              <button
                key={c.index}
                type="button"
                onClick={() => onSelectContainer(c.index)}
                className={`px-3 py-1 text-xs font-semibold rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {c.label}{' '}
                <span className={`font-mono-num ml-1 ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                  {answeredCount}/{partQuestions.length}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer whitespace-nowrap">
            <input
              type="checkbox"
              checked={isCurrentFlagged}
              onChange={() => onToggleReview(currentQuestionNumber)}
              className="w-3.5 h-3.5 accent-amber-600 rounded cursor-pointer"
            />
            <Flag className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'text-amber-600 fill-amber-500' : 'text-slate-500'}`} />
            <span>Review</span>
          </label>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={!prevQ}
              onClick={() => prevQ && onSelectQuestion(prevQ.number, prevQ.containerIndex)}
              aria-label="Previous question"
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={!nextQ}
              onClick={() => nextQ && onSelectQuestion(nextQ.number, nextQ.containerIndex)}
              aria-label="Next question"
              className="p-1.5 rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Row: Official Question Number Grid */}
      <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
        {questions.map((q) => {
          const isCurrent = q.number === currentQuestionNumber;
          const isAnswered = Boolean(answers[q.number]?.trim());
          const isFlagged = flaggedQuestions.includes(q.number);

          return (
            <button
              key={q.number}
              type="button"
              onClick={() => onSelectQuestion(q.number, q.containerIndex)}
              aria-label={`Question ${q.number}${isAnswered ? ' answered' : ''}${isFlagged ? ' flagged for review' : ''}`}
              className={`relative min-w-[28px] h-7 px-1.5 text-xs font-mono-num font-medium flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                isFlagged ? 'rounded-full' : 'rounded'
              } ${
                isCurrent
                  ? 'bg-[#C8102E] text-white ring-2 ring-offset-1 ring-[#C8102E]'
                  : isAnswered
                  ? 'bg-slate-800 text-white hover:bg-slate-700'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-100'
              }`}
            >
              {q.number}
              {isFlagged && !isCurrent && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 border border-white" />
              )}
            </button>
          );
        })}
      </div>
    </footer>
  );
};

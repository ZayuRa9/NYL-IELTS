import React from 'react';
import { ArrowDown } from 'lucide-react';
import { QuestionGroup, TextHighlight } from '../types/exam';
import { HighlightableText } from './HighlightableText';

interface QuestionRendererProps {
  group: QuestionGroup;
  answers: Record<number, string>;
  currentQuestionNumber: number;
  textSizeClass: string;
  highlights?: TextHighlight[];
  onChangeAnswer: (questionNumber: number, value: string) => void;
  onFocusQuestion: (questionNumber: number) => void;
}

function renderInlineBlankPrompt(
  prompt: string,
  qNumber: number,
  value: string,
  highlights: TextHighlight[],
  onChangeAnswer: (questionNumber: number, value: string) => void,
  onFocusQuestion: (questionNumber: number) => void
) {
  const blankMatch = prompt.match(/_{4,}|…{2,}|\.{4,}/);
  if (!blankMatch) {
    return (
      <>
        <span>
          <HighlightableText text={prompt} highlights={highlights} />
        </span>
        <input
          type="text"
          aria-label={`Answer for question ${qNumber}`}
          value={value}
          onFocus={() => onFocusQuestion(qNumber)}
          onChange={(e) => onChangeAnswer(qNumber, e.target.value)}
          placeholder={`Q${qNumber}`}
          className="w-40 px-2.5 py-1 text-sm font-medium bg-[var(--cdi-input-bg)] text-[var(--cdi-text)] border border-[var(--cdi-input-border)] rounded focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
        />
      </>
    );
  }

  const parts = prompt.split(/_{4,}|…{2,}|\.{4,}/);
  return parts.map((part, idx) => (
    <React.Fragment key={idx}>
      <span>
        <HighlightableText text={part} highlights={highlights} />
      </span>
      {idx < parts.length - 1 && (
        <input
          type="text"
          aria-label={`Answer for question ${qNumber}`}
          value={value}
          onFocus={() => onFocusQuestion(qNumber)}
          onChange={(e) => onChangeAnswer(qNumber, e.target.value)}
          placeholder={`Q${qNumber}`}
          className="inline-block w-36 px-2.5 py-0.5 text-sm font-medium bg-[var(--cdi-input-bg)] text-[var(--cdi-text)] border border-[var(--cdi-input-border)] rounded focus:outline-none focus:ring-2 focus:ring-[#C8102E]"
        />
      )}
    </React.Fragment>
  ));
}

function renderTableCellWithInputs(
  cellText: string,
  answers: Record<number, string>,
  currentQuestionNumber: number,
  highlights: TextHighlight[],
  onChangeAnswer: (questionNumber: number, value: string) => void,
  onFocusQuestion: (questionNumber: number) => void
) {
  const tokens = cellText.split(/(\{\{\d+\}\})/g);
  return (
    <span className="whitespace-pre-line leading-relaxed">
      {tokens.map((tok, idx) => {
        const match = tok.match(/^\{\{(\d+)\}\}$/);
        if (!match) {
          return (
            <React.Fragment key={idx}>
              <HighlightableText text={tok} highlights={highlights} />
            </React.Fragment>
          );
        }
        const qNum = parseInt(match[1], 10);
        const isCurrent = qNum === currentQuestionNumber;
        return (
          <span
            key={idx}
            id={`question-block-${qNum}`}
            className="inline-flex items-center gap-1 mx-1 my-0.5 align-baseline"
          >
            <span className="font-mono-num font-bold text-[11px] px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-900">
              {qNum}
            </span>
            <input
              type="text"
              aria-label={`Answer for question ${qNum}`}
              value={answers[qNum] ?? ''}
              onFocus={() => onFocusQuestion(qNum)}
              onClick={() => onFocusQuestion(qNum)}
              onChange={(e) => onChangeAnswer(qNum, e.target.value)}
              placeholder={`Q${qNum}`}
              className={`w-32 px-2 py-0.5 text-sm font-medium bg-[var(--cdi-input-bg)] text-[var(--cdi-text)] border rounded focus:outline-none focus:ring-2 focus:ring-[#C8102E] ${
                isCurrent ? 'border-[#C8102E]' : 'border-[var(--cdi-input-border)]'
              }`}
            />
          </span>
        );
      })}
    </span>
  );
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  group,
  answers,
  currentQuestionNumber,
  textSizeClass,
  highlights = [],
  onChangeAnswer,
  onFocusQuestion,
}) => {
  const sharedOptions = group.options || [];
  const isMultiSelectPair =
    group.type === 'multiple-choice' &&
    Boolean(group.maxSelect && group.maxSelect > 1) &&
    group.questions.length === group.maxSelect;

  const preventToggleWhileHighlighting = (e: React.MouseEvent<HTMLLabelElement>) => {
    const sel = window.getSelection()?.toString().trim() || '';
    if (sel.length >= 2) {
      e.preventDefault();
    }
  };

  const renderMultiSelectBlock = () => {
    const qNums = group.questions.map((q) => q.number);
    const firstNum = qNums[0];
    const lastNum = qNums[qNums.length - 1];
    const maxSelect = group.maxSelect || qNums.length;
    const isCurrent = qNums.includes(currentQuestionNumber);
    const options =
      group.questions[0]?.options && group.questions[0].options.length > 0
        ? group.questions[0].options
        : sharedOptions;

    const selectedLetters = qNums
      .map((num) => (answers[num] || '').trim().toUpperCase())
      .filter(Boolean);

    const handleToggleLetter = (letter: string) => {
      let next: string[];
      if (selectedLetters.includes(letter)) {
        next = selectedLetters.filter((l) => l !== letter);
      } else if (selectedLetters.length < maxSelect) {
        next = [...selectedLetters, letter].sort();
      } else {
        // Replace oldest/last if already at cap so user isn't stuck
        next = [...selectedLetters.slice(0, maxSelect - 1), letter].sort();
      }
      qNums.forEach((num, idx) => {
        onChangeAnswer(num, next[idx] || '');
      });
      onFocusQuestion(firstNum);
    };

    return (
      <div
        id={`question-block-${firstNum}`}
        onClick={() => onFocusQuestion(firstNum)}
        className={`p-3 rounded border transition-colors ${
          isCurrent
            ? 'border-[#C8102E] bg-[var(--cdi-surface)]'
            : 'border-transparent hover:border-[var(--cdi-border)]'
        }`}
      >
        {qNums.slice(1).map((num) => (
          <span key={num} id={`question-block-${num}`} className="sr-only" />
        ))}
        <div className={`flex items-start gap-2.5 ${textSizeClass} text-[var(--cdi-text)]`}>
          <span className="font-mono-num font-bold text-xs px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-900 shrink-0 mt-0.5">
            {firstNum}–{lastNum}
          </span>
          <div className="flex-1 space-y-2.5 min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="leading-relaxed font-medium">
                <HighlightableText
                  text={group.sharedPrompt || group.questions[0]?.prompt || ''}
                  highlights={highlights}
                />
              </p>
              <span className="text-xs font-mono-num text-[var(--cdi-muted)]">
                Đã chọn {selectedLetters.length}/{maxSelect}
              </span>
            </div>

            <div className="space-y-1.5 pt-0.5">
              {options.map((opt) => {
                const letterMatch = opt.match(/^([A-H])\.\s/);
                const optionValue = letterMatch ? letterMatch[1] : opt;
                const isChecked = selectedLetters.includes(optionValue.toUpperCase());

                return (
                  <label
                    key={opt}
                    onClick={preventToggleWhileHighlighting}
                    className={`flex items-start gap-2.5 px-3 py-1.5 rounded border text-sm cursor-pointer transition-colors ${
                      isChecked
                        ? 'border-[#C8102E] bg-red-500/10 font-medium'
                        : 'border-[var(--cdi-border)] hover:bg-[var(--cdi-surface)]'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onFocus={() => onFocusQuestion(firstNum)}
                      onChange={() => handleToggleLetter(optionValue.toUpperCase())}
                      className="mt-1 accent-[#C8102E] cursor-pointer"
                    />
                    <span className="leading-snug">
                      <HighlightableText text={opt} highlights={highlights} />
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-4 pb-6 border-b border-[var(--cdi-border)] last:border-b-0">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-[var(--cdi-text)]">
          <HighlightableText text={group.title} highlights={highlights} />
        </h3>
        <p className="text-xs text-[var(--cdi-muted)] leading-relaxed">
          <HighlightableText text={group.instruction} highlights={highlights} />
        </p>
      </div>

      {group.sharedPrompt && !isMultiSelectPair && (
        <div className="px-3.5 py-2.5 rounded border border-[var(--cdi-border)] bg-[var(--cdi-surface)] text-xs font-semibold tracking-wide text-[var(--cdi-text)] whitespace-pre-line">
          <HighlightableText text={group.sharedPrompt} highlights={highlights} />
        </div>
      )}

      {group.type === 'matching' && sharedOptions.length > 0 && (
        <div className="p-3.5 rounded border border-[var(--cdi-border)] bg-[var(--cdi-surface)] space-y-1 text-xs text-[var(--cdi-text)]">
          {sharedOptions.map((opt) => (
            <div key={opt} className="leading-relaxed">
              <HighlightableText text={opt} highlights={highlights} />
            </div>
          ))}
        </div>
      )}

      {group.table ? (
        <div className="overflow-x-auto rounded border border-[var(--cdi-border)]">
          <table className={`w-full text-left border-collapse ${textSizeClass} text-[var(--cdi-text)]`}>
            <thead className="bg-[var(--cdi-surface)]">
              <tr>
                {group.table.headers.map((header) => (
                  <th
                    key={header}
                    className="px-3.5 py-2.5 text-xs font-bold border-b border-r last:border-r-0 border-[var(--cdi-border)]"
                  >
                    <HighlightableText text={header} highlights={highlights} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {group.table.rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="border-b last:border-b-0 border-[var(--cdi-border)] align-top"
                >
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      className="px-3.5 py-3 text-sm border-r last:border-r-0 border-[var(--cdi-border)]"
                    >
                      {renderTableCellWithInputs(
                        cell,
                        answers,
                        currentQuestionNumber,
                        highlights,
                        onChangeAnswer,
                        onFocusQuestion
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : isMultiSelectPair ? (
        renderMultiSelectBlock()
      ) : group.type === 'flow-chart' ? (
        <div className="space-y-0">
          {group.questions.map((q, idx) => {
            const isCurrent = q.number === currentQuestionNumber;
            const value = answers[q.number] ?? '';
            return (
              <React.Fragment key={q.number}>
                <div
                  id={`question-block-${q.number}`}
                  onClick={() => onFocusQuestion(q.number)}
                  className={`p-3 rounded border transition-colors ${
                    isCurrent
                      ? 'border-[#C8102E] bg-[var(--cdi-surface)]'
                      : 'border-[var(--cdi-border)] bg-[var(--cdi-bg)]'
                  }`}
                >
                  <div className={`flex flex-wrap sm:flex-nowrap items-center gap-3 ${textSizeClass} text-[var(--cdi-text)]`}>
                    {q.stepLabel && (
                      <span className="w-24 text-xs font-semibold text-[var(--cdi-muted)] shrink-0">
                        {q.stepLabel}
                      </span>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 flex-1 leading-relaxed">
                      {renderInlineBlankPrompt(
                        q.prompt,
                        q.number,
                        value,
                        highlights,
                        onChangeAnswer,
                        onFocusQuestion
                      )}
                    </div>
                  </div>
                </div>
                {idx < group.questions.length - 1 && (
                  <div className="flex justify-center py-1" aria-hidden="true">
                    <ArrowDown className="w-4 h-4 text-[var(--cdi-muted)]" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3.5">
          {group.questions.map((q) => {
            const isCurrent = q.number === currentQuestionNumber;
            const value = answers[q.number] ?? '';
            const options = q.options && q.options.length > 0 ? q.options : sharedOptions;

            return (
              <div
                key={q.number}
                id={`question-block-${q.number}`}
                onClick={() => onFocusQuestion(q.number)}
                className={`p-3 rounded border transition-colors ${
                  isCurrent
                    ? 'border-[#C8102E] bg-[var(--cdi-surface)]'
                    : 'border-transparent hover:border-[var(--cdi-border)]'
                }`}
              >
                <div className={`flex items-start gap-2.5 ${textSizeClass} text-[var(--cdi-text)]`}>
                  <span className="font-mono-num font-bold text-xs px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-900 shrink-0 mt-0.5">
                    {q.number}
                  </span>

                  <div className="flex-1 space-y-2.5 min-w-0">
                    {group.type === 'fill-blank' ? (
                      <div className="flex flex-wrap items-center gap-1.5 leading-relaxed">
                        {renderInlineBlankPrompt(
                          q.prompt,
                          q.number,
                          value,
                          highlights,
                          onChangeAnswer,
                          onFocusQuestion
                        )}
                      </div>
                    ) : (
                      <p className="leading-relaxed">
                        <HighlightableText text={q.prompt} highlights={highlights} />
                      </p>
                    )}

                    {(group.type === 'multiple-choice' ||
                      group.type === 'true-false-ng' ||
                      group.type === 'yes-no-ng') &&
                      options.length > 0 && (
                        <div className="space-y-1.5 pt-0.5">
                          {options.map((opt) => {
                            const letterMatch = opt.match(/^([A-H])\.\s/);
                            const optionValue =
                              group.type === 'multiple-choice' && letterMatch ? letterMatch[1] : opt;
                            const isChecked = value === optionValue || value === opt;

                            return (
                              <label
                                key={opt}
                                onClick={preventToggleWhileHighlighting}
                                className={`flex items-start gap-2.5 px-3 py-1.5 rounded border text-sm cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'border-[#C8102E] bg-red-500/10 font-medium'
                                    : 'border-[var(--cdi-border)] hover:bg-[var(--cdi-surface)]'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`q-${q.number}`}
                                  value={optionValue}
                                  checked={isChecked}
                                  onFocus={() => onFocusQuestion(q.number)}
                                  onChange={() => onChangeAnswer(q.number, optionValue)}
                                  className="mt-1 accent-[#C8102E] cursor-pointer"
                                />
                                <span className="leading-snug">
                                  <HighlightableText text={opt} highlights={highlights} />
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      )}

                    {group.type === 'matching' && (
                      <div className="pt-1">
                        <select
                          aria-label={`Select answer for question ${q.number}`}
                          value={value}
                          onFocus={() => onFocusQuestion(q.number)}
                          onChange={(e) => onChangeAnswer(q.number, e.target.value)}
                          className="w-full sm:w-auto max-w-full px-3 py-1.5 text-sm bg-[var(--cdi-input-bg)] text-[var(--cdi-text)] border border-[var(--cdi-input-border)] rounded focus:outline-none focus:ring-2 focus:ring-[#C8102E] cursor-pointer"
                        >
                          <option value="">-- Choose answer --</option>
                          {options.map((opt) => {
                            const code =
                              opt.match(/^([ivx]+|[A-H])(?:\s|[.)]|$)/)?.[1] || opt;
                            return (
                              <option key={opt} value={code}>
                                {opt}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

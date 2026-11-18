import React from 'react';
import { TextHighlight } from '../types/exam';
import { splitTextByHighlights } from '../utils/highlightLogic';

interface HighlightableTextProps {
  text: string;
  highlights?: TextHighlight[];
}

export const HighlightableText: React.FC<HighlightableTextProps> = ({
  text,
  highlights = [],
}) => {
  if (!text) return null;
  if (highlights.length === 0) return <>{text}</>;

  const segments = splitTextByHighlights(text, highlights);

  return (
    <>
      {segments.map((seg, idx) =>
        seg.type === 'text' ? (
          <React.Fragment key={idx}>{seg.text}</React.Fragment>
        ) : (
          <mark
            key={`${seg.highlight.id}-${idx}`}
            title={seg.highlight.note ? `Note: ${seg.highlight.note}` : 'Highlighted text'}
            style={{
              backgroundColor: 'var(--cdi-highlight)',
              color: 'var(--cdi-highlight-text)',
            }}
            className={`px-0.5 rounded-xs ${
              seg.highlight.note ? 'underline decoration-dotted underline-offset-2' : ''
            }`}
          >
            {seg.text}
          </mark>
        )
      )}
    </>
  );
};

import { ExamModule, TextHighlight } from '../types/exam';

export type HighlightSegment =
  | { type: 'text'; text: string }
  | { type: 'highlight'; text: string; highlight: TextHighlight };

export function getHighlightScopeId(module: ExamModule, itemId: string): string {
  return `${module}:${itemId}`;
}

export function splitTextByHighlights(
  content: string,
  highlights: TextHighlight[]
): HighlightSegment[] {
  if (!content) return [];
  const textHighlights = highlights.filter((h) => h.text && h.text.trim().length > 0);
  if (textHighlights.length === 0) {
    return [{ type: 'text', text: content }];
  }

  // Deduplicate identical highlight text strings, prioritizing entries that have notes
  const orderedHighlights = [...textHighlights].sort((a, b) => {
    const noteScore = (b.note ? 1 : 0) - (a.note ? 1 : 0);
    if (noteScore !== 0) return noteScore;
    return b.text.length - a.text.length;
  });

  let segments: HighlightSegment[] = [{ type: 'text', text: content }];

  for (const hl of orderedHighlights) {
    const nextSegments: HighlightSegment[] = [];
    for (const seg of segments) {
      if (seg.type !== 'text') {
        nextSegments.push(seg);
        continue;
      }

      let remaining = seg.text;
      let matchIdx = remaining.indexOf(hl.text);
      if (matchIdx === -1) {
        nextSegments.push(seg);
        continue;
      }

      while (matchIdx !== -1) {
        if (matchIdx > 0) {
          nextSegments.push({ type: 'text', text: remaining.slice(0, matchIdx) });
        }
        nextSegments.push({ type: 'highlight', text: hl.text, highlight: hl });
        remaining = remaining.slice(matchIdx + hl.text.length);
        matchIdx = remaining.indexOf(hl.text);
      }

      if (remaining.length > 0) {
        nextSegments.push({ type: 'text', text: remaining });
      }
    }
    segments = nextSegments;
  }

  return segments;
}

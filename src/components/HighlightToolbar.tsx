import React, { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, Highlighter, Pencil, Plus, StickyNote, Trash2, X } from 'lucide-react';
import { TextHighlight } from '../types/exam';

interface HighlightToolbarProps {
  scopeId: string;
  hintText: string;
  highlights: TextHighlight[];
  selectedSnippet: string;
  onClearSelection: () => void;
  onAddHighlight: (item: TextHighlight) => void;
  onRemoveHighlight?: (id: string) => void;
  onUpdateHighlightNote?: (id: string, note: string) => void;
  notePlaceholder?: string;
}

export function useTextSelectionCapture(scopeKey: string) {
  const [selectedSnippet, setSelectedSnippet] = useState('');

  useEffect(() => {
    setSelectedSnippet('');
  }, [scopeKey]);

  const captureSelection = useCallback((e?: React.MouseEvent | React.KeyboardEvent) => {
    const targetEl = e?.target as HTMLElement | null;
    if (
      targetEl &&
      (targetEl.tagName === 'INPUT' ||
        targetEl.tagName === 'TEXTAREA' ||
        targetEl.tagName === 'SELECT' ||
        targetEl.closest('input, textarea, select'))
    ) {
      return;
    }

    const activeEl = document.activeElement;
    if (
      activeEl &&
      (activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.tagName === 'SELECT')
    ) {
      const selStr = window.getSelection()?.toString().trim() || '';
      if (!selStr) {
        setSelectedSnippet('');
      }
      return;
    }

    const sel = window.getSelection()?.toString().trim() || '';
    if (sel.length >= 2 && sel.length <= 400) {
      setSelectedSnippet(sel);
    } else if (!sel) {
      setSelectedSnippet('');
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSnippet('');
    window.getSelection()?.removeAllRanges();
  }, []);

  return { selectedSnippet, captureSelection, clearSelection };
}

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  scopeId,
  hintText,
  highlights,
  selectedSnippet,
  onClearSelection,
  onAddHighlight,
  onRemoveHighlight,
  onUpdateHighlightNote,
  notePlaceholder = 'Nhập ghi chú...',
}) => {
  const [noteInput, setNoteInput] = useState('');
  const [noteMode, setNoteMode] = useState<'none' | 'selection' | 'standalone'>('none');
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setNoteInput('');
    setNoteMode('none');
    setDrawerOpen(false);
  }, [scopeId]);

  const applySelectionHighlight = (withNote: boolean) => {
    if (!selectedSnippet) return;
    const trimmedNote = noteInput.trim();
    if (withNote && !trimmedNote) return;

    onAddHighlight({
      id: `hl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      passageId: scopeId,
      text: selectedSnippet,
      note: withNote ? trimmedNote : undefined,
    });
    setNoteInput('');
    setNoteMode('none');
    if (withNote) setDrawerOpen(true);
    onClearSelection();
  };

  const applyStandaloneNote = () => {
    const trimmedNote = noteInput.trim();
    if (!trimmedNote) return;

    onAddHighlight({
      id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      passageId: scopeId,
      text: '',
      note: trimmedNote,
    });
    setNoteInput('');
    setNoteMode('none');
    setDrawerOpen(true);
  };

  const handleSaveNote = () => {
    if (noteMode === 'selection' && selectedSnippet) {
      applySelectionHighlight(true);
    } else {
      applyStandaloneNote();
    }
  };

  const toggleSelectionNoteForm = () => {
    setNoteMode((prev) => (prev === 'selection' ? 'none' : 'selection'));
  };

  const toggleStandaloneNoteForm = () => {
    setNoteMode((prev) => (prev === 'standalone' ? 'none' : 'standalone'));
  };

  return (
    <div className="shrink-0 border-b border-[var(--cdi-border)] bg-[var(--cdi-surface)]">
      <div className="px-5 py-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold text-[var(--cdi-muted)]">{hintText}</span>

        <div className="flex flex-wrap items-center gap-2">
          {selectedSnippet && (
            <>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => applySelectionHighlight(false)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-300 text-slate-900 rounded hover:bg-amber-400 transition-colors cursor-pointer"
              >
                <Highlighter className="w-3.5 h-3.5" />
                <span>Highlight</span>
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={toggleSelectionNoteForm}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-white text-slate-800 border border-slate-300 rounded hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <StickyNote className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </>
          )}

          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={toggleStandaloneNoteForm}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-[var(--cdi-bg)] text-[var(--cdi-text)] border border-[var(--cdi-border)] rounded hover:opacity-85 transition-opacity cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm Note</span>
          </button>

          {highlights.length > 0 && onRemoveHighlight && (
            <button
              type="button"
              onClick={() => setDrawerOpen((prev) => !prev)}
              aria-expanded={drawerOpen}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-950 border border-amber-300 rounded hover:bg-amber-200 transition-colors cursor-pointer"
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>Notes ({highlights.length})</span>
              {drawerOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {noteMode !== 'none' && (
        <div className="px-5 py-2.5 bg-amber-50 border-t border-amber-200 flex flex-wrap sm:flex-nowrap items-center gap-2 text-slate-900">
          {noteMode === 'selection' && selectedSnippet && (
            <span className="text-[11px] font-medium text-amber-900 bg-amber-200/80 px-2 py-0.5 rounded max-w-[200px] truncate shrink-0">
              "{selectedSnippet}"
            </span>
          )}
          <input
            type="text"
            autoFocus
            aria-label={
              noteMode === 'selection' && selectedSnippet
                ? 'Ghi chú cho đoạn đã chọn'
                : 'Ghi chú mới'
            }
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveNote();
              } else if (e.key === 'Escape') {
                setNoteMode('none');
              }
            }}
            placeholder={
              noteMode === 'selection' && selectedSnippet
                ? 'Nhập ghi chú cho đoạn đã chọn...'
                : notePlaceholder
            }
            className="flex-1 min-w-[180px] px-2.5 py-1 text-xs bg-white text-slate-900 border border-amber-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <button
            type="button"
            onClick={handleSaveNote}
            disabled={!noteInput.trim()}
            className="px-3 py-1 text-xs font-semibold bg-slate-900 text-white rounded disabled:opacity-40 cursor-pointer"
          >
            Lưu Note
          </button>
          <button
            type="button"
            onClick={() => {
              setNoteMode('none');
              setNoteInput('');
            }}
            aria-label="Đóng khung ghi chú"
            className="p-1 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {drawerOpen && highlights.length > 0 && onRemoveHighlight && (
        <div className="px-5 py-3 border-t border-[var(--cdi-border)] bg-[var(--cdi-bg)] max-h-52 overflow-y-auto cdi-scroll">
          <HighlightsNotesList
            highlights={highlights}
            onRemoveHighlight={onRemoveHighlight}
            onUpdateHighlightNote={onUpdateHighlightNote}
            compact
          />
        </div>
      )}
    </div>
  );
};

interface HighlightsNotesListProps {
  highlights: TextHighlight[];
  onRemoveHighlight: (id: string) => void;
  onUpdateHighlightNote?: (id: string, note: string) => void;
  compact?: boolean;
}

export const HighlightsNotesList: React.FC<HighlightsNotesListProps> = ({
  highlights,
  onRemoveHighlight,
  onUpdateHighlightNote,
  compact = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState('');

  if (highlights.length === 0) return null;

  const startEdit = (hl: TextHighlight) => {
    setEditingId(hl.id);
    setDraftNote(hl.note || '');
  };

  const saveEdit = (id: string) => {
    if (onUpdateHighlightNote) {
      onUpdateHighlightNote(id, draftNote.trim());
    }
    setEditingId(null);
    setDraftNote('');
  };

  return (
    <div className={compact ? 'space-y-2' : 'pt-4 mt-6 border-t border-[var(--cdi-border)] space-y-2'}>
      <p className="text-xs font-semibold text-[var(--cdi-muted)]">
        Highlights &amp; Notes ({highlights.length})
      </p>
      <div className="space-y-1.5">
        {highlights.map((hl, idx) => {
          const isEditing = editingId === hl.id;
          return (
            <div
              key={hl.id}
              className="flex items-start justify-between gap-2 px-3 py-2 rounded border border-[var(--cdi-border)] bg-[var(--cdi-surface)] text-xs"
            >
              <div className="min-w-0 flex-1 space-y-1">
                {hl.text ? (
                  <p className="font-medium break-words">
                    <span
                      style={{
                        backgroundColor: 'var(--cdi-highlight)',
                        color: 'var(--cdi-highlight-text)',
                      }}
                      className="px-1 py-0.5 rounded-xs"
                    >
                      "{hl.text}"
                    </span>
                  </p>
                ) : (
                  <p className="font-semibold text-[var(--cdi-muted)]">Ghi chú #{idx + 1}</p>
                )}

                {isEditing ? (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <input
                      type="text"
                      aria-label={`Edit note ${idx + 1}`}
                      value={draftNote}
                      onChange={(e) => setDraftNote(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          saveEdit(hl.id);
                        } else if (e.key === 'Escape') {
                          setEditingId(null);
                        }
                      }}
                      className="flex-1 px-2 py-1 text-xs bg-[var(--cdi-input-bg)] text-[var(--cdi-text)] border border-[var(--cdi-input-border)] rounded focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(hl.id)}
                      className="px-2 py-1 text-[11px] font-semibold bg-slate-900 text-white rounded cursor-pointer"
                    >
                      Lưu
                    </button>
                  </div>
                ) : (
                  hl.note && (
                    <p className="text-[var(--cdi-muted)] whitespace-pre-line break-words">
                      Note: {hl.note}
                    </p>
                  )
                )}
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {onUpdateHighlightNote && !isEditing && (
                  <button
                    type="button"
                    onClick={() => startEdit(hl)}
                    aria-label={hl.note ? `Edit note for item ${idx + 1}` : `Add note for item ${idx + 1}`}
                    className="p-1 text-[var(--cdi-muted)] hover:text-[var(--cdi-text)] cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onRemoveHighlight(hl.id)}
                  aria-label={`Remove highlight ${idx + 1}`}
                  className="p-1 text-[var(--cdi-muted)] hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

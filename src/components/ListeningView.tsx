import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2 } from 'lucide-react';
import { ListeningPart } from '../types/exam';
import { QuestionRenderer } from './QuestionRenderer';

interface ListeningViewProps {
  parts: ListeningPart[];
  activePartIndex: number;
  answers: Record<number, string>;
  currentQuestionNumber: number;
  textSizeClass: string;
  onChangeAnswer: (questionNumber: number, value: string) => void;
  onFocusQuestion: (questionNumber: number) => void;
}

export const ListeningView: React.FC<ListeningViewProps> = ({
  parts,
  activePartIndex,
  answers,
  currentQuestionNumber,
  textSizeClass,
  onChangeAnswer,
  onFocusQuestion,
}) => {
  const part = parts[activePartIndex] || parts[0];
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0.85);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  useEffect(() => {
    setIsPlaying(false);
    setAudioProgress(0);
    setAudioDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.load();
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [activePartIndex, part?.id, part?.audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!part) return null;

  const hasAudioFile = Boolean(part.audioUrl);

  const togglePlay = () => {
    if (hasAudioFile && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {
          setIsPlaying(false);
        });
        setIsPlaying(true);
      }
      return;
    }

    // Fallback Web Speech narration for scripts without MP3
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && part.audioScript) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        setIsPlaying(false);
      } else {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(part.audioScript);
        utter.lang = 'en-GB';
        utter.rate = 0.95;
        utter.volume = volume;
        utter.onend = () => setIsPlaying(false);
        utter.onerror = () => setIsPlaying(false);
        window.speechSynthesis.speak(utter);
        setIsPlaying(true);
      }
    }
  };

  const progressPct =
    audioDuration > 0 ? Math.min(100, Math.round((audioProgress / audioDuration) * 100)) : 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[var(--cdi-bg)] text-[var(--cdi-text)]">
      {/* Authentic CDI Listening Audio Bar */}
      <div className="px-6 py-2.5 border-b border-[var(--cdi-border)] bg-[var(--cdi-surface)] flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <button
            type="button"
            onClick={togglePlay}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors cursor-pointer whitespace-nowrap"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Audio' : `Play ${part.title} Audio`}</span>
          </button>

          {hasAudioFile ? (
            <div className="flex items-center gap-3 flex-1 max-w-md text-xs font-mono-num text-[var(--cdi-muted)]">
              <audio
                ref={audioRef}
                preload="metadata"
                src={part.audioUrl}
                onTimeUpdate={(e) => setAudioProgress(e.currentTarget.currentTime)}
                onLoadedMetadata={(e) => setAudioDuration(e.currentTarget.duration || 0)}
                onEnded={() => setIsPlaying(false)}
              />
              <div className="flex-1 h-1.5 bg-[var(--cdi-border)] rounded-full overflow-hidden min-w-[80px]">
                <div
                  className="h-full bg-[#C8102E] transition-[width] duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="shrink-0">
                {Math.floor(audioProgress / 60)}:{String(Math.floor(audioProgress % 60)).padStart(2, '0')}
                {audioDuration > 0 &&
                  ` / ${Math.floor(audioDuration / 60)}:${String(Math.floor(audioDuration % 60)).padStart(2, '0')}`}
              </span>
            </div>
          ) : (
            <span className="text-xs text-[var(--cdi-muted)]">
              Built-in voice narration ready (teacher can attach MP3 in Exam Studio)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <Volume2 className="w-4 h-4 text-[var(--cdi-muted)]" aria-hidden="true" />
          <label htmlFor="cdi-volume-slider" className="text-xs text-[var(--cdi-muted)]">
            Volume
          </label>
          <input
            id="cdi-volume-slider"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-24 accent-[#C8102E] cursor-pointer"
          />
          <span className="text-xs font-mono-num text-[var(--cdi-muted)] w-9">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Main Listening Question Sheet */}
      <div className="flex-1 overflow-y-auto cdi-scroll px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="pb-4 border-b border-[var(--cdi-border)]">
            <h2 className="text-lg font-bold text-[var(--cdi-text)]">{part.title}</h2>
            <p className="text-sm text-[var(--cdi-muted)] mt-1">{part.instruction}</p>
          </div>

          <div className="space-y-6">
            {part.questionGroups.map((group) => (
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
      </div>
    </div>
  );
};

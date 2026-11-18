import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, Download } from 'lucide-react';
import {
  AntiCheatState,
  CandidateInfo,
  CdiTextSize,
  CdiTheme,
  CompletedModuleRecord,
  ExamAttemptAnswers,
  ExamFlaggedQuestions,
  ExamModule,
  ExamSelectionMode,
  IeltsExam,
  SubmissionExportPayload,
  TextHighlight,
  ViolationEvent,
} from './types/exam';
import {
  createEmptyAnswers,
  createEmptyFlagged,
  flattenModuleQuestions,
  getInitialDurationSeconds,
  getModuleSequence,
  processAntiCheatViolation,
} from './utils/examLogic';
import { downloadSubmissionDocx } from './utils/docxExport';
import { DEFAULT_EXAMS } from './data/defaultExams';
import { ExamLobby } from './components/ExamLobby';
import { TeacherStudio } from './components/TeacherStudio';
import { CdiHeader } from './components/CdiHeader';
import { CdiBottomNav } from './components/CdiBottomNav';
import { ListeningView } from './components/ListeningView';
import { ReadingView } from './components/ReadingView';
import { WritingView } from './components/WritingView';
import { AntiCheatOverlay } from './components/AntiCheatOverlay';
import { ExamCompleteView } from './components/ExamCompleteView';

type AppScreen = 'lobby' | 'teacher' | 'exam' | 'complete';

const INITIAL_ANTI_CHEAT: AntiCheatState = {
  violationCount: 0,
  restartCount: 0,
  violationHistory: [],
  activeLockModal: 'none',
};

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('lobby');
  const [exams, setExams] = useState<IeltsExam[]>(DEFAULT_EXAMS);
  const [loadingExams, setLoadingExams] = useState(true);

  // Active exam session state
  const [activeExam, setActiveExam] = useState<IeltsExam | null>(null);
  const [candidate, setCandidate] = useState<CandidateInfo>({ fullName: '', candidateId: '' });
  const [selectionMode, setSelectionMode] = useState<ExamSelectionMode>('full');
  const [moduleSequence, setModuleSequence] = useState<ExamModule[]>([]);
  const [moduleIndex, setModuleIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(3600);
  const [activeContainerIndex, setActiveContainerIndex] = useState(0);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);

  const [answers, setAnswers] = useState<ExamAttemptAnswers>(createEmptyAnswers);
  const [flagged, setFlagged] = useState<ExamFlaggedQuestions>(createEmptyFlagged);
  const [highlights, setHighlights] = useState<TextHighlight[]>([]);
  const [completedModules, setCompletedModules] = useState<CompletedModuleRecord[]>([]);
  const [pendingNextModuleIndex, setPendingNextModuleIndex] = useState<number | null>(null);
  const [submissionPayload, setSubmissionPayload] = useState<SubmissionExportPayload | null>(null);
  const [autoDownloadedOnExit, setAutoDownloadedOnExit] = useState(false);

  // CDI Display Preferences
  const [cdiTheme, setCdiTheme] = useState<CdiTheme>('standard');
  const [cdiTextSize, setCdiTextSize] = useState<CdiTextSize>('standard');

  // Anti-cheat proctoring state
  const [antiCheat, setAntiCheat] = useState<AntiCheatState>(INITIAL_ANTI_CHEAT);
  const fullscreenEnteredRef = useRef(false);
  const gracePeriodUntilRef = useRef<number>(0);

  const fetchExams = useCallback(async () => {
    setLoadingExams(true);
    try {
      const resp = await fetch('/api/exams');
      if (resp.ok) {
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) {
          setExams(data);
        }
      }
    } catch {
      // Retain default fallback exams if offline
    } finally {
      setLoadingExams(false);
    }
  }, []);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const activeModule: ExamModule | undefined = moduleSequence[moduleIndex];

  const flattenedQuestions = useMemo(() => {
    if (!activeExam || !activeModule) return [];
    return flattenModuleQuestions(activeExam, activeModule);
  }, [activeExam, activeModule]);

  const containers = useMemo(() => {
    if (!activeExam || !activeModule) return [];
    if (activeModule === 'listening' && activeExam.listening) {
      return activeExam.listening.parts.map((p, index) => ({ label: p.title, index }));
    }
    if (activeModule === 'reading' && activeExam.reading) {
      return activeExam.reading.passages.map((_, index) => ({ label: `Passage ${index + 1}`, index }));
    }
    if (activeModule === 'writing' && activeExam.writing) {
      return activeExam.writing.tasks.map((t, index) => ({ label: `Task ${t.taskNumber}`, index }));
    }
    return [];
  }, [activeExam, activeModule]);

  const requestEnterFullscreen = useCallback(async () => {
    gracePeriodUntilRef.current = Date.now() + 900;
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        fullscreenEnteredRef.current = true;
      }
    } catch {
      // Headless or restricted iframe fallback
    }
    setAntiCheat((prev) => ({ ...prev, activeLockModal: 'none' }));
  }, []);

  const beginExamSession = useCallback(
    (exam: IeltsExam, cand: CandidateInfo, mode: ExamSelectionMode, skipModal = false) => {
      const seq = getModuleSequence(exam, mode);
      const firstMod = seq[0] || 'reading';
      const firstQs = flattenModuleQuestions(exam, firstMod);

      setActiveExam(exam);
      setCandidate(cand);
      setSelectionMode(mode);
      setModuleSequence(seq);
      setModuleIndex(0);
      setRemainingSeconds(getInitialDurationSeconds(exam, firstMod));
      setActiveContainerIndex(0);
      setCurrentQuestionNumber(firstQs[0]?.number ?? 1);
      setAnswers(createEmptyAnswers());
      setFlagged(createEmptyFlagged());
      setHighlights([]);
      setCompletedModules([]);
      setPendingNextModuleIndex(null);
      setSubmissionPayload(null);
      setAutoDownloadedOnExit(false);
      fullscreenEnteredRef.current = false;
      setAntiCheat({
        ...INITIAL_ANTI_CHEAT,
        activeLockModal: 'none',
      });
      setScreen('exam');

      if (!skipModal) {
        gracePeriodUntilRef.current = Date.now() + 900;
        if (document.documentElement.requestFullscreen) {
          document.documentElement
            .requestFullscreen()
            .then(() => {
              fullscreenEnteredRef.current = true;
            })
            .catch(() => {
              setAntiCheat((prev) => ({ ...prev, activeLockModal: 'enter_fullscreen' }));
            });
        }
      }
    },
    []
  );

  // ?autostart=1 support for quick verification into exam view
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1' && screen === 'lobby' && exams.length > 0 && !activeExam) {
      beginExamSession(
        exams[0],
        { fullName: 'Nguyen Minh Anh', candidateId: 'IELTS-2026-01' },
        'reading',
        true
      );
    }
  }, [exams, screen, activeExam, beginExamSession]);

  const handleViolation = useCallback(
    (reason: ViolationEvent['reason']) => {
      if (screen !== 'exam' || !activeExam) return;
      if (Date.now() < gracePeriodUntilRef.current) return;

      setAntiCheat((prev) => {
        const { nextState, shouldResetExam } = processAntiCheatViolation(prev, reason);
        if (shouldResetExam) {
          const firstMod = moduleSequence[0] || 'reading';
          const firstQs = flattenModuleQuestions(activeExam, firstMod);
          setModuleIndex(0);
          setRemainingSeconds(getInitialDurationSeconds(activeExam, firstMod));
          setActiveContainerIndex(0);
          setCurrentQuestionNumber(firstQs[0]?.number ?? 1);
          setAnswers(createEmptyAnswers());
          setFlagged(createEmptyFlagged());
          setHighlights([]);
          setCompletedModules([]);
          setPendingNextModuleIndex(null);
        }
        return nextState;
      });
    },
    [screen, activeExam, moduleSequence]
  );

  // Fullscreen, tab-switch, and external window overlay (blur) listeners
  useEffect(() => {
    if (screen !== 'exam') return;

    const onFullscreenChange = () => {
      if (document.fullscreenElement) {
        fullscreenEnteredRef.current = true;
      } else if (fullscreenEnteredRef.current) {
        handleViolation('fullscreen_exit');
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleViolation('tab_hidden');
      }
    };

    const onWindowBlur = () => {
      setTimeout(() => {
        if (!document.hasFocus()) {
          handleViolation('window_blur');
        }
      }, 100);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
      }
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onWindowBlur);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onWindowBlur);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [screen, handleViolation]);

  const finishCurrentModule = useCallback(() => {
    if (!activeExam || !activeModule) return;

    const initialSec = getInitialDurationSeconds(activeExam, activeModule);
    const usedSec = Math.max(0, initialSec - remainingSeconds);
    const nextRecord: CompletedModuleRecord = {
      module: activeModule,
      durationUsedSeconds: usedSec,
      submittedAt: new Date().toISOString(),
    };
    const updatedCompleted = [
      ...completedModules.filter((m) => m.module !== activeModule),
      nextRecord,
    ];

    if (moduleIndex + 1 < moduleSequence.length) {
      setCompletedModules(updatedCompleted);
      setPendingNextModuleIndex(moduleIndex + 1);
    } else {
      const payload: SubmissionExportPayload = {
        exam: activeExam,
        candidate,
        selectionMode,
        answers,
        completedModules: updatedCompleted,
        submittedAt: new Date().toISOString(),
        antiCheat: {
          violationCount: antiCheat.violationCount,
          restartCount: antiCheat.restartCount,
          violationHistory: antiCheat.violationHistory,
        },
      };
      setCompletedModules(updatedCompleted);
      setPendingNextModuleIndex(null);
      setAutoDownloadedOnExit(false);
      setSubmissionPayload(payload);
      setScreen('complete');

      if (document.fullscreenElement && document.exitFullscreen) {
        fullscreenEnteredRef.current = false;
        document.exitFullscreen().catch(() => {});
      }
    }
  }, [
    activeExam,
    activeModule,
    remainingSeconds,
    completedModules,
    moduleIndex,
    moduleSequence,
    candidate,
    selectionMode,
    answers,
    antiCheat,
  ]);

  const handleProceedToNextModule = useCallback(() => {
    if (!activeExam || pendingNextModuleIndex === null) return;
    const nextMod = moduleSequence[pendingNextModuleIndex];
    if (!nextMod) return;
    const nextQs = flattenModuleQuestions(activeExam, nextMod);

    gracePeriodUntilRef.current = Date.now() + 900;
    setModuleIndex(pendingNextModuleIndex);
    setRemainingSeconds(getInitialDurationSeconds(activeExam, nextMod));
    setActiveContainerIndex(0);
    setCurrentQuestionNumber(nextQs[0]?.number ?? 1);
    setPendingNextModuleIndex(null);
  }, [activeExam, pendingNextModuleIndex, moduleSequence]);

  const handleStopAndDownloadNow = useCallback(() => {
    if (!activeExam) return;
    const payload: SubmissionExportPayload = {
      exam: activeExam,
      candidate,
      selectionMode,
      answers,
      completedModules,
      submittedAt: new Date().toISOString(),
      antiCheat: {
        violationCount: antiCheat.violationCount,
        restartCount: antiCheat.restartCount,
        violationHistory: antiCheat.violationHistory,
      },
    };

    downloadSubmissionDocx(payload).catch(() => {});
    setPendingNextModuleIndex(null);
    setAutoDownloadedOnExit(true);
    setSubmissionPayload(payload);
    setScreen('complete');

    if (document.fullscreenElement && document.exitFullscreen) {
      fullscreenEnteredRef.current = false;
      document.exitFullscreen().catch(() => {});
    }
  }, [activeExam, candidate, selectionMode, answers, completedModules, antiCheat]);

  // Countdown timer tick (pauses while anti-cheat lock modal or readiness check is displayed)
  useEffect(() => {
    if (
      screen !== 'exam' ||
      antiCheat.activeLockModal !== 'none' ||
      pendingNextModuleIndex !== null
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [screen, antiCheat.activeLockModal, pendingNextModuleIndex]);

  // Auto-advance/submit when timer hits 0
  useEffect(() => {
    if (
      screen === 'exam' &&
      remainingSeconds === 0 &&
      antiCheat.activeLockModal === 'none' &&
      pendingNextModuleIndex === null
    ) {
      finishCurrentModule();
    }
  }, [
    screen,
    remainingSeconds,
    antiCheat.activeLockModal,
    pendingNextModuleIndex,
    finishCurrentModule,
  ]);

  const handleSelectQuestion = (questionNumber: number, containerIndex: number) => {
    setActiveContainerIndex(containerIndex);
    setCurrentQuestionNumber(questionNumber);
    setTimeout(() => {
      const el = document.getElementById(`question-block-${questionNumber}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 30);
  };

  const handleSelectContainer = (containerIndex: number) => {
    setActiveContainerIndex(containerIndex);
    const firstInContainer = flattenedQuestions.find((q) => q.containerIndex === containerIndex);
    if (firstInContainer) {
      setCurrentQuestionNumber(firstInContainer.number);
    }
  };

  const handleToggleReview = (questionNumber: number) => {
    if (!activeModule) return;
    setFlagged((prev) => {
      const list = prev[activeModule];
      const exists = list.includes(questionNumber);
      return {
        ...prev,
        [activeModule]: exists
          ? list.filter((n) => n !== questionNumber)
          : [...list, questionNumber],
      };
    });
  };

  const handleAnswerChange = (questionNumber: number, value: string) => {
    if (!activeModule) return;
    setAnswers((prev) => ({
      ...prev,
      [activeModule]: {
        ...prev[activeModule],
        [questionNumber]: value,
      },
    }));
  };

  const textSizeClass =
    cdiTextSize === 'extra-large'
      ? 'text-lg'
      : cdiTextSize === 'large'
      ? 'text-base'
      : 'text-[15px]';

  const themeClass =
    cdiTheme === 'white-on-black'
      ? 'cdi-theme-white-on-black'
      : cdiTheme === 'yellow-on-black'
      ? 'cdi-theme-yellow-on-black'
      : 'cdi-theme-standard';

  if (screen === 'teacher') {
    return (
      <TeacherStudio
        exams={exams}
        onRefreshExams={fetchExams}
        onBackLobby={() => setScreen('lobby')}
      />
    );
  }

  if (screen === 'complete' && submissionPayload) {
    return (
      <ExamCompleteView
        payload={submissionPayload}
        initialDownloaded={autoDownloadedOnExit}
        onReturnLobby={() => {
          setSubmissionPayload(null);
          setActiveExam(null);
          setAutoDownloadedOnExit(false);
          setScreen('lobby');
        }}
      />
    );
  }

  if (screen === 'exam' && activeExam && activeModule) {
    return (
      <div
        data-state="exam-active"
        data-violations={antiCheat.violationCount}
        className={`h-screen w-screen flex flex-col overflow-hidden ${themeClass}`}
      >
        <CdiHeader
          candidate={candidate}
          activeModule={activeModule}
          remainingSeconds={remainingSeconds}
          isLastModule={moduleIndex === moduleSequence.length - 1}
          theme={cdiTheme}
          textSize={cdiTextSize}
          onChangeTheme={setCdiTheme}
          onChangeTextSize={setCdiTextSize}
          onFinishModule={finishCurrentModule}
        />

        {activeModule === 'listening' && activeExam.listening && (
          <ListeningView
            parts={activeExam.listening.parts}
            activePartIndex={activeContainerIndex}
            answers={answers.listening}
            currentQuestionNumber={currentQuestionNumber}
            textSizeClass={textSizeClass}
            highlights={highlights}
            onAddHighlight={(item) => setHighlights((prev) => [...prev, item])}
            onRemoveHighlight={(id) =>
              setHighlights((prev) => prev.filter((item) => item.id !== id))
            }
            onUpdateHighlightNote={(id, note) =>
              setHighlights((prev) =>
                prev.map((item) =>
                  item.id === id ? { ...item, note: note || undefined } : item
                )
              )
            }
            onChangeAnswer={handleAnswerChange}
            onFocusQuestion={setCurrentQuestionNumber}
          />
        )}

        {activeModule === 'reading' && activeExam.reading && (
          <ReadingView
            passages={activeExam.reading.passages}
            activePassageIndex={activeContainerIndex}
            answers={answers.reading}
            currentQuestionNumber={currentQuestionNumber}
            textSizeClass={textSizeClass}
            highlights={highlights}
            onAddHighlight={(item) => setHighlights((prev) => [...prev, item])}
            onRemoveHighlight={(id) =>
              setHighlights((prev) => prev.filter((item) => item.id !== id))
            }
            onUpdateHighlightNote={(id, note) =>
              setHighlights((prev) =>
                prev.map((item) =>
                  item.id === id ? { ...item, note: note || undefined } : item
                )
              )
            }
            onChangeAnswer={handleAnswerChange}
            onFocusQuestion={setCurrentQuestionNumber}
          />
        )}

        {activeModule === 'writing' && activeExam.writing && (
          <WritingView
            tasks={activeExam.writing.tasks}
            activeTaskIndex={activeContainerIndex}
            answers={answers.writing}
            textSizeClass={textSizeClass}
            highlights={highlights}
            onAddHighlight={(item) => setHighlights((prev) => [...prev, item])}
            onRemoveHighlight={(id) =>
              setHighlights((prev) => prev.filter((item) => item.id !== id))
            }
            onUpdateHighlightNote={(id, note) =>
              setHighlights((prev) =>
                prev.map((item) =>
                  item.id === id ? { ...item, note: note || undefined } : item
                )
              )
            }
            onChangeAnswer={handleAnswerChange}
          />
        )}

        <CdiBottomNav
          containers={containers}
          activeContainerIndex={activeContainerIndex}
          questions={flattenedQuestions}
          currentQuestionNumber={currentQuestionNumber}
          answers={answers[activeModule]}
          flaggedQuestions={flagged[activeModule]}
          onSelectContainer={handleSelectContainer}
          onSelectQuestion={handleSelectQuestion}
          onToggleReview={handleToggleReview}
        />

        <AntiCheatOverlay
          antiCheat={antiCheat}
          onAcknowledgeAndEnterFullscreen={requestEnterFullscreen}
        />

        {pendingNextModuleIndex !== null && antiCheat.activeLockModal === 'none' && (() => {
          const nextMod = moduleSequence[pendingNextModuleIndex];
          if (!nextMod) return null;
          const formatName = (m: ExamModule) =>
            m === 'listening' ? 'Listening' : m === 'reading' ? 'Reading' : 'Writing';
          const currentLabel = formatName(activeModule);
          const nextLabel = formatName(nextMod);
          const nextMinutes = Math.round(getInitialDurationSeconds(activeExam, nextMod) / 60);

          return (
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="inter-module-readiness-title"
              className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4"
            >
              <div className="bg-white text-slate-900 w-full max-w-xl rounded-lg shadow-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-[#1E293B] text-white flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <h2 id="inter-module-readiness-title" className="text-base font-bold">
                      Đã hoàn thành phần {currentLabel}
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">{activeExam.title}</p>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-base font-semibold text-slate-900">
                    Bạn đã sẵn sàng thi tiếp phần {nextLabel} ({nextMinutes} phút) chưa?
                  </p>
                  <div className="p-4 rounded border border-slate-200 bg-slate-50 space-y-2 text-sm text-slate-700 leading-relaxed">
                    <p>
                      • <strong>Nếu đã sẵn sàng:</strong> Hệ thống sẽ chuyển ngay sang phần{' '}
                      <strong>{nextLabel}</strong> và bắt đầu tính giờ ({nextMinutes} phút).
                    </p>
                    <p>
                      • <strong>Nếu chưa sẵn sàng:</strong> Bạn có thể tải bài thi{' '}
                      <strong>{currentLabel}</strong> vừa làm dưới dạng file Word (.docx) và thoát
                      khỏi phòng thi ngay.
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleStopAndDownloadNow}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 hover:bg-slate-100 rounded transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <Download className="w-4 h-4 shrink-0" />
                    <span>Chưa sẵn sàng — Tải bài & Thoát</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleProceedToNextModule}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#C8102E] hover:bg-[#A60D25] rounded transition-colors whitespace-nowrap cursor-pointer"
                  >
                    <span>Tôi đã sẵn sàng — Thi tiếp {nextLabel}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  return (
    <ExamLobby
      exams={exams}
      loading={loadingExams}
      onStartExam={(exam, cand, mode) => beginExamSession(exam, cand, mode, false)}
      onOpenTeacherStudio={() => setScreen('teacher')}
    />
  );
}

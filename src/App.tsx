import React, { useState, useEffect } from "react";
import {
  Award,
  BookOpen,
  ChartNoAxesColumn,
  CheckCircle2,
  ChevronRight,
  Flame,
  House,
  Keyboard,
  Music2,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  X,
  Zap,
} from "lucide-react";
import { DashboardView } from "./components/views/DashboardView";
import { LessonsView } from "./components/views/LessonsView";
import { LessonActiveView } from "./components/views/LessonActiveView";
import { PlayStudioView } from "./components/views/PlayStudioView";
import { ProgressView } from "./components/views/ProgressView";
import { KeyboardGuideView } from "./components/views/KeyboardGuideView";
import { InteractiveQuiz } from "./components/interactive-quiz";
import { CertificateModal } from "./components/certificate-modal";

import {
  loadProgress,
  saveProgress,
  checkAndUnlockAchievements,
  recordDayActivity,
} from "./lib/progress-store";
import { playNote } from "./lib/audio";
import { ALL_LESSONS } from "./lib/music-data";
import type { Lesson, NotationSystem, RecordedSong, UserProgress } from "./types/music";

type View = "dashboard" | "lessons" | "lesson" | "play" | "progress" | "guide";

export default function App() {
  const [view, setView] = useState<View>("dashboard");
  const [progress, setProgress] = useState<UserProgress>(loadProgress());
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Modals & Overlays
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active playing note for dashboard mini-piano
  const [activeNote, setActiveNote] = useState<string | null>(null);

  // Initialize and check streak on mount
  useEffect(() => {
    const updated = recordDayActivity(progress);
    setProgress(updated);
    saveProgress(updated);
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const updateProgressAndCheckAchievements = (
    updater: (prev: UserProgress) => UserProgress
  ) => {
    setProgress((prev) => {
      const next = updater(prev);
      const withAchievements = checkAndUnlockAchievements(next, (badgeName) => {
        triggerToast(`🎉 Neues Abzeichen freigeschaltet: ${badgeName}!`);
      });
      saveProgress(withAchievements);
      return withAchievements;
    });
  };

  // Lesson actions
  const handleStartLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setView("lesson");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLessonComplete = (lessonId: string, stars: number, accuracy: number) => {
    updateProgressAndCheckAchievements((prev) => {
      const completed = new Set(prev.completedLessonIds);
      completed.add(lessonId);

      const lessonStars = {
        ...prev.lessonStars,
        [lessonId]: Math.max(prev.lessonStars[lessonId] || 0, stars),
      };

      const lessonAccuracies = {
        ...prev.lessonAccuracies,
        [lessonId]: Math.max(prev.lessonAccuracies[lessonId] || 0, accuracy),
      };

      return {
        ...prev,
        completedLessonIds: Array.from(completed),
        lessonStars,
        lessonAccuracies,
        lastPracticedAt: new Date().toISOString(),
      };
    });
  };

  // Record practice note
  const handlePlayNote = (noteId: string) => {
    playNote(noteId, "piano", progress.soundVolume);
    setActiveNote(noteId);
    setTimeout(() => setActiveNote(null), 300);

    updateProgressAndCheckAchievements((prev) => ({
      ...prev,
      totalNotesPlayed: prev.totalNotesPlayed + 1,
      practiceSeconds: prev.practiceSeconds + 2,
    }));
  };

  const handleSaveRecording = (recording: RecordedSong) => {
    updateProgressAndCheckAchievements((prev) => ({
      ...prev,
      recordings: [recording, ...prev.recordings],
    }));
    triggerToast("Melodie erfolgreich im Studio gespeichert!");
  };

  const handleDeleteRecording = (id: string) => {
    updateProgressAndCheckAchievements((prev) => ({
      ...prev,
      recordings: prev.recordings.filter((r) => r.id !== id),
    }));
  };

  const handleUpdateNotation = (notationSystem: NotationSystem) => {
    updateProgressAndCheckAchievements((prev) => ({
      ...prev,
      notationSystem,
    }));
  };

  const handleUpdateStudentName = (studentName: string) => {
    updateProgressAndCheckAchievements((prev) => ({
      ...prev,
      studentName,
    }));
  };

  const handleQuizScore = (score: number) => {
    updateProgressAndCheckAchievements((prev) => ({
      ...prev,
      quizHighScore: Math.max(prev.quizHighScore, score),
    }));
    triggerToast(`Wissens-Check beendet! Score: ${score} Punkte`);
  };

  const toggleMute = () => {
    updateProgressAndCheckAchievements((prev) => ({
      ...prev,
      isMuted: !prev.isMuted,
      soundVolume: prev.isMuted ? 0.7 : 0,
    }));
  };

  const navItems = [
    { id: "dashboard" as const, label: "Übersicht", icon: House },
    { id: "lessons" as const, label: "Lernpfad", icon: BookOpen },
    { id: "play" as const, label: "Freies Spielen", icon: Music2 },
    { id: "progress" as const, label: "Fortschritt", icon: ChartNoAxesColumn },
    { id: "guide" as const, label: "Mein Keyboard", icon: Keyboard },
  ];

  const currentNav = view === "lesson" ? "lessons" : view;

  return (
    <div className="min-h-screen flex bg-[#faf9fb]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-white border-r border-[#eeeaf0] p-6 z-30">
        {/* Brand Mark */}
        <button
          type="button"
          onClick={() => setView("dashboard")}
          className="flex items-center gap-3 text-left mb-8 group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#ed78a0] to-[#de5f8c] flex items-center justify-center text-white shadow-md shadow-[#e889a944] -rotate-6 group-hover:rotate-0 transition-transform">
            <Music2 size={24} strokeWidth={2.6} />
          </div>
          <div>
            <span className="text-2xl font-black text-[#2e263d] tracking-tighter leading-none block">
              klimper<span className="text-[#ed78a0]">.</span>
            </span>
            <span className="text-[9px] font-black tracking-widest uppercase text-[#a9a4b1] block mt-1">
              DEIN MUSIKSTUDIO
            </span>
          </div>
        </button>

        {/* Navigation list */}
        <div className="text-[10px] font-black uppercase tracking-widest text-[#b1aeba] mb-3 px-3">
          ENTDECKEN
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = currentNav === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setView(item.id);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-black transition-all ${
                  isActive
                    ? "bg-[#fff0f5] text-[#de5f8c] shadow-sm"
                    : "text-[#777487] hover:bg-[#faf7fc] hover:text-[#de5f8c]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-[#e5729a]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Quiz launcher in sidebar */}
        <div className="mt-6 p-4 rounded-2xl bg-[#faf5fc] border border-[#f1e6f7] text-left">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#987fc2] mb-1">
            <Zap size={15} /> LERNKONTROLLE
          </div>
          <strong className="text-xs font-black text-[#30263f] block">
            Noten- & Gehör-Check
          </strong>
          <p className="text-[11px] text-[#847794] mt-1 mb-3">
            Teste spielerisch dein Wissen und schalte Trophäen frei.
          </p>
          <button
            type="button"
            onClick={() => setShowQuizModal(true)}
            className="w-full py-2 rounded-xl bg-white hover:bg-[#f6eff9] text-[#8e6ebc] border border-[#ecd9f2] text-xs font-black shadow-sm transition-all text-center"
          >
            Jetzt prüfen
          </button>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-6" />

        {/* Motivation Card */}
        <div className="relative overflow-hidden rounded-2xl bg-[#f2edfc] p-4 text-left mb-4">
          <div className="w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center text-[#8f75c3] mb-2">
            <Sparkles size={16} />
          </div>
          <strong className="text-xs font-black text-[#30263d] block">
            Musik macht glücklich!
          </strong>
          <p className="text-[11px] text-[#80778f] mt-1 m-0 leading-relaxed">
            Du musst nicht perfekt sein. Hab einfach Freude an jedem Ton!
          </p>
        </div>

        {/* Profile / Certificate Button */}
        <button
          type="button"
          onClick={() => setShowCertificateModal(true)}
          className="flex items-center gap-3 p-3 rounded-2xl border border-[#f0ecf2] hover:bg-[#faf7fc] transition-colors text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-[#fff0f5] text-[#de5f8c] flex items-center justify-center font-bold">
            <Award size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <strong className="text-xs font-black text-[#2f273c] block truncate">
              {progress.studentName}
            </strong>
            <span className="text-[10px] text-[#9b90a3] block">
              Meisterurkunde öffnen
            </span>
          </div>
          <ChevronRight size={16} className="text-[#b9b0c2]" />
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Topbar */}
        <header className="h-16 px-4 sm:px-8 bg-white border-b border-[#eeebf0] flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-white/90">
          {/* Mobile brand & breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setView("dashboard")}
              className="lg:hidden flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#ed78a0] to-[#de5f8c] flex items-center justify-center text-white shadow-sm">
                <Music2 size={16} />
              </div>
              <span className="text-xl font-black text-[#2e263d]">
                klimper<span className="text-[#ed78a0]">.</span>
              </span>
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-[#a5a0af]">
              <span>klimper. Musikstudio</span>
              <ChevronRight size={14} className="text-[#c7c0cf]" />
              <strong className="text-[#595267]">
                {view === "dashboard"
                  ? "Übersicht"
                  : view === "lessons"
                  ? "Lernpfad (16 Lektionen)"
                  : view === "lesson"
                  ? `Lektion: ${activeLesson?.title || ""}`
                  : view === "play"
                  ? "Freies Musikstudio"
                  : view === "progress"
                  ? "Fortschritt & Erfolge"
                  : "Mein Keyboard (Guide)"}
              </strong>
            </div>
          </div>

          {/* Topbar Actions */}
          <div className="flex items-center gap-3">
            {/* Daily streak indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#fff2ea] text-[#d66536] text-xs font-black border border-[#fed6c3]">
              <Flame size={15} className="fill-[#e5774a]" />
              <span>{progress.dailyStreak} Tage</span>
            </div>

            {/* Mute / Unmute Button */}
            <button
              type="button"
              onClick={toggleMute}
              className="w-9 h-9 rounded-xl border border-[#eeeaf0] bg-white hover:bg-[#fff6f9] text-[#777182] hover:text-[#de5f8c] flex items-center justify-center transition-colors"
              title={progress.isMuted ? "Ton einschalten" : "Stummschalten"}
            >
              {progress.isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>

            {/* Certificate trigger */}
            <button
              type="button"
              onClick={() => setShowCertificateModal(true)}
              className="w-9 h-9 rounded-xl bg-[#fff0f5] text-[#de5f8c] hover:scale-105 flex items-center justify-center transition-transform"
              title="Urkunde ansehen"
            >
              <Award size={18} />
            </button>
          </div>
        </header>

        {/* Main Routed Page Content */}
        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto pb-24 lg:pb-12">
          {view === "dashboard" && (
            <DashboardView
              progress={progress}
              onNavigate={(v) => {
                setView(v);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onStartLesson={handleStartLesson}
              onOpenQuiz={() => setShowQuizModal(true)}
              onOpenCertificate={() => setShowCertificateModal(true)}
              activeNote={activeNote}
              onPlayNote={handlePlayNote}
            />
          )}

          {view === "lessons" && (
            <LessonsView
              progress={progress}
              onStartLesson={handleStartLesson}
              onOpenCertificate={() => setShowCertificateModal(true)}
            />
          )}

          {view === "lesson" && activeLesson && (
            <LessonActiveView
              lesson={activeLesson}
              progress={progress}
              onBack={() => setView("lessons")}
              onLessonComplete={handleLessonComplete}
              onStartLesson={handleStartLesson}
              onPlayFree={() => setView("play")}
            />
          )}

          {view === "play" && (
            <PlayStudioView
              progress={progress}
              onSaveRecording={handleSaveRecording}
              onDeleteRecording={handleDeleteRecording}
              onUpdateNotation={handleUpdateNotation}
              onPlayNoteRecord={handlePlayNote}
            />
          )}

          {view === "progress" && (
            <ProgressView
              progress={progress}
              onOpenQuiz={() => setShowQuizModal(true)}
              onOpenCertificate={() => setShowCertificateModal(true)}
              onStartLesson={handleStartLesson}
              onUpdateName={handleUpdateStudentName}
            />
          )}

          {view === "guide" && (
            <KeyboardGuideView
              notationSystem={progress.notationSystem}
              onStartFirstLesson={() => handleStartLesson(ALL_LESSONS[0])}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#edeaf0] py-6 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#aaa4b1] gap-2">
          <span>Mit Freude gemacht für kleine & große Musikmomente. 🎹</span>
          <span>klimper. · Dein Musikstudio</span>
        </footer>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#ede8ef] z-30 flex items-center justify-around py-2 px-1 safe-bottom shadow-lg">
        {navItems.map((item) => {
          const isActive = currentNav === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setView(item.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`flex flex-col items-center justify-center flex-1 py-1 rounded-xl text-[10px] font-bold transition-all ${
                isActive ? "text-[#de5f8c] font-black" : "text-[#978f9f]"
              }`}
            >
              <item.icon size={19} strokeWidth={isActive ? 2.5 : 2} />
              <span className="mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Interactive Quiz Modal */}
      {showQuizModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <InteractiveQuiz
              notationSystem={progress.notationSystem}
              progress={progress}
              onUpdateScore={handleQuizScore}
              onClose={() => setShowQuizModal(false)}
            />
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertificateModal && (
        <CertificateModal
          studentName={progress.studentName}
          completedLessonsCount={progress.completedLessonIds.length}
          totalLessonsCount={ALL_LESSONS.length}
          onClose={() => setShowCertificateModal(false)}
          onNameChange={handleUpdateStudentName}
        />
      )}

      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#302942] text-white rounded-2xl shadow-xl border border-white/10 text-xs font-bold animate-bounce-short">
          <CheckCircle2 size={16} className="text-[#65d3a3]" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-white/60 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

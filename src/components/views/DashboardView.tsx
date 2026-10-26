import React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock3,
  Flame,
  HelpCircle,
  Keyboard,
  Music2,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { PianoKeyboard } from "../piano-keyboard";
import { LESSON_MODULES, ALL_LESSONS, ACHIEVEMENTS } from "../../lib/music-data";
import type { Lesson, UserProgress } from "../../types/music";

interface DashboardViewProps {
  progress: UserProgress;
  onNavigate: (view: "dashboard" | "lessons" | "play" | "progress" | "guide") => void;
  onStartLesson: (lesson: Lesson) => void;
  onOpenQuiz: () => void;
  onOpenCertificate: () => void;
  activeNote: string | null;
  onPlayNote: (noteId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  progress,
  onNavigate,
  onStartLesson,
  onOpenQuiz,
  onOpenCertificate,
  activeNote,
  onPlayNote,
}) => {
  const completedCount = progress.completedLessonIds.length;
  const percent = Math.round((completedCount / ALL_LESSONS.length) * 100);
  const nextLesson = ALL_LESSONS.find((l) => !progress.completedLessonIds.includes(l.id)) ?? ALL_LESSONS[0];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Intro greeting & streak badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[#e16e96] text-xs font-black tracking-widest uppercase">
            <span className="w-4 h-0.5 rounded bg-[#e781a3]" />
            DEIN PLATZ FÜR MUSIK
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#302941] tracking-tight mt-1 mb-1">
            Hallo, {progress.studentName || "Musikstar"}!{" "}
            <span className="text-[#e8a0ba] font-serif">✨</span>
          </h1>
          <p className="text-sm text-[#898396]">
            Schön, dass du da bist. Dein Keyboard wartet schon auf dich!
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Flame streak */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-[#fff2ea] border border-[#fbd6c4] text-[#d66536] shadow-sm">
            <Flame size={20} className="fill-[#e5774a]" />
            <div className="text-left">
              <span className="text-[10px] font-black uppercase tracking-wider block leading-none">
                Übe-Serie
              </span>
              <strong className="text-xs font-black">
                {progress.dailyStreak} {progress.dailyStreak === 1 ? "Tag" : "Tage"} am Stück
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate("play")}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#e9e4ec] bg-white hover:bg-[#fff6f9] text-[#655d73] hover:text-[#d8608b] text-xs font-extrabold shadow-sm transition-all"
          >
            Einfach losspielen <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* Hero Card with stylish illustrated keyboard */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#ebdffa] via-[#f7eaf4] to-[#ffedf4] border border-[#ecd9ec] p-7 sm:p-9 shadow-sm">
        {/* Subtle decorative musical notes background */}
        <div className="absolute right-4 -top-6 text-[#ebd2ea]/60 text-9xl font-serif select-none pointer-events-none">
          ♫
        </div>
        <div className="absolute right-36 bottom-2 text-[#ebd2ea]/40 text-7xl font-serif select-none pointer-events-none">
          ♩
        </div>

        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/80 border border-white text-[#8d74ac] text-[10px] font-black tracking-widest uppercase mb-3">
            <Sparkles size={14} className="text-[#e57ea1]" />
            {completedCount === ALL_LESSONS.length
              ? "ALLE LEKTIONEN GEMEISTERT"
              : `DEIN NÄCHSTER SCHRITT · WELT ${nextLesson.number <= "04" ? "1" : nextLesson.number <= "08" ? "2" : nextLesson.number <= "12" ? "3" : "4"}`}
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#302942] tracking-tight leading-snug mb-2">
            {completedCount === ALL_LESSONS.length
              ? "Wahnsinn! Du hast alle 16 Lektionen geschafft!"
              : `Lektion ${nextLesson.number}: ${nextLesson.title}`}
          </h2>

          <p className="text-xs sm:text-sm text-[#756d87] leading-relaxed mb-6">
            {completedCount === ALL_LESSONS.length
              ? "Du beherrschst weiße und schwarze Tasten, Notenlesen und die schönsten Lieder. Hol dir jetzt deine offizielle Urkunde!"
              : nextLesson.description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => (completedCount === ALL_LESSONS.length ? onNavigate("play") : onStartLesson(nextLesson))}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#302942] hover:bg-[#493756] text-white text-xs font-black shadow-md hover:translate-y-[-1px] transition-all"
            >
              {completedCount === ALL_LESSONS.length ? "Freies Musikstudio" : "Lektion jetzt starten"}
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              onClick={onOpenCertificate}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white/90 hover:bg-white text-[#d65f8a] border border-[#f3cadc] text-xs font-black shadow-sm transition-all"
            >
              <Award size={16} /> Meine Urkunde ansehen
            </button>

            <span className="text-xs font-bold text-[#887d9a] flex items-center gap-1.5 ml-1">
              <Clock3 size={15} /> {nextLesson.duration}
            </span>
          </div>
        </div>
      </section>

      {/* 4 Interactive Feature Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Tile 1: Lernpfad */}
        <button
          type="button"
          onClick={() => onNavigate("lessons")}
          className="text-left p-5 rounded-2xl bg-white border border-[#eeebf0] hover:border-[#f1b4cb] shadow-sm hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#fff0f5] text-[#e06892] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <BookOpen size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#d97c9c] block">
            16 Lektionen
          </span>
          <strong className="text-base font-black text-[#2f273b] block mt-0.5">
            Lernpfad öffnen
          </strong>
          <p className="text-xs text-[#958c9c] mt-1 m-0">
            {completedCount} von {ALL_LESSONS.length} geschafft
          </p>
        </button>

        {/* Tile 2: Gehör- & Noten-Check */}
        <button
          type="button"
          onClick={onOpenQuiz}
          className="text-left p-5 rounded-2xl bg-white border border-[#eeebf0] hover:border-[#cfb6ec] shadow-sm hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#f4edfd] text-[#9375c3] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Zap size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#997fc2] block">
            Fortschrittskontrolle
          </span>
          <strong className="text-base font-black text-[#2f273b] block mt-0.5">
            Wissens-Check
          </strong>
          <p className="text-xs text-[#958c9c] mt-1 m-0">
            Gehörtraining & Noten-Quiz
          </p>
        </button>

        {/* Tile 3: Freies Spielen */}
        <button
          type="button"
          onClick={() => onNavigate("play")}
          className="text-left p-5 rounded-2xl bg-white border border-[#eeebf0] hover:border-[#bde3d2] shadow-sm hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#e7f8f1] text-[#55ab8d] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Music2 size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#63ad92] block">
            5 Instrumente
          </span>
          <strong className="text-base font-black text-[#2f273b] block mt-0.5">
            Musikstudio
          </strong>
          <p className="text-xs text-[#958c9c] mt-1 m-0">
            8 Lieder & eigener Recorder
          </p>
        </button>

        {/* Tile 4: Keyboard Guide */}
        <button
          type="button"
          onClick={() => onNavigate("guide")}
          className="text-left p-5 rounded-2xl bg-white border border-[#eeebf0] hover:border-[#fedbb6] shadow-sm hover:shadow-md transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#fff2e3] text-[#d99d52] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Keyboard size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#d89f5c] block">
            Geräte-Tipps
          </span>
          <strong className="text-base font-black text-[#2f273b] block mt-0.5">
            Mein Keyboard
          </strong>
          <p className="text-xs text-[#958c9c] mt-1 m-0">
            Tastenaufkleber & Knöpfe
          </p>
        </button>
      </div>

      {/* Main Grid: Recommended Lessons & Progress Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#de6a91]">
                SCHRITT FÜR SCHRITT
              </span>
              <h2 className="text-xl font-black text-[#2d263b] m-0">
                Die nächsten Lektionen
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("lessons")}
              className="text-xs font-bold text-[#d85885] hover:text-[#b83b66] flex items-center gap-1"
            >
              Alle 16 anzeigen <ArrowRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {ALL_LESSONS.slice(0, 3).map((lesson) => {
              const isDone = progress.completedLessonIds.includes(lesson.id);
              const isNext = lesson.id === nextLesson.id && completedCount < ALL_LESSONS.length;
              const stars = progress.lessonStars[lesson.id] || (isDone ? 3 : 0);

              return (
                <button
                  key={lesson.id}
                  type="button"
                  onClick={() => onStartLesson(lesson)}
                  className={`text-left p-4 rounded-2xl bg-white border transition-all hover:translate-y-[-2px] flex flex-col justify-between min-h-[175px] ${
                    isNext
                      ? "border-[#f1b7ca] ring-2 ring-[#ffdbe8] shadow-sm"
                      : "border-[#edeaf0] hover:border-[#f1b7ca]"
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <span className="w-8 h-8 rounded-xl bg-[#fff0f5] text-[#df7498] flex items-center justify-center font-bold text-xs">
                      {lesson.number}
                    </span>
                    {isDone ? (
                      <span className="text-[#55ab8d] flex items-center gap-0.5 text-xs font-bold">
                        <CheckCircle2 size={18} />
                      </span>
                    ) : isNext ? (
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-[#fff0f5] text-[#d65c89]">
                        Neu
                      </span>
                    ) : null}
                  </div>

                  <div className="my-2">
                    <h3 className="text-sm font-black text-[#2d263b] m-0 leading-snug">
                      {lesson.title}
                    </h3>
                    <p className="text-[11px] text-[#938a9b] mt-1 line-clamp-2">
                      {lesson.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[#9a91a0] font-bold pt-2 border-t border-[#f4f1f6]">
                    <span>{lesson.duration}</span>
                    <span className="text-[#de628e] flex items-center gap-1">
                      Öffnen <ArrowRight size={13} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Card */}
        <aside className="rounded-3xl bg-white border border-[#eeebf0] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#9f94a8]">
              <Trophy size={16} className="text-[#e29d44]" />
              DEIN FORTSCHRITT
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-28 h-28 mx-auto my-5">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r="48" stroke="#f6edf3" strokeWidth="10" fill="none" />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  stroke="#ed78a0"
                  strokeWidth="10"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - percent / 100)}
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <strong className="text-2xl font-black text-[#30263f] leading-none">
                  {percent}%
                </strong>
                <span className="text-[9px] font-bold text-[#a79cb0] mt-1">
                  geschafft
                </span>
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-base font-black text-[#2e263d] m-0">
                {completedCount === 0
                  ? "Du bist startklar!"
                  : completedCount === ALL_LESSONS.length
                  ? "Meisterhaft abgeschlossen!"
                  : "Super Fortschritt!"}
              </h3>
              <p className="text-xs text-[#958c9c] mt-1">
                {completedCount} von {ALL_LESSONS.length} Lektionen gemeistert
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#f4f1f6] flex items-center justify-between text-xs font-bold text-[#7f748d]">
            <span>Gespielte Töne</span>
            <strong className="text-[#2e263d]">
              {progress.totalNotesPlayed.toLocaleString("de-DE")}
            </strong>
          </div>
        </aside>
      </div>

      {/* Quick Play Mini Keyboard Section */}
      <section className="rounded-3xl bg-gradient-to-br from-[#fff8fa] via-[#fff5f8] to-[#fbf2fa] border border-[#f0e0ea] p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#de6a91]">
              KLEINE MUSIKPAUSE?
            </span>
            <h3 className="text-xl font-black text-[#2f273b] m-0">
              Einfach mal drauflosspielen
            </h3>
            <p className="text-xs text-[#8c8293] mt-0.5">
              Tippe die Tasten an oder nutze A, S, D, F, G, H, J, K auf der Tastatur.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("play")}
            className="text-xs font-extrabold text-[#d85885] hover:text-[#b83b66] flex items-center gap-1.5 self-start sm:self-center"
          >
            Großes Studio öffnen <ArrowRight size={15} />
          </button>
        </div>

        <div className="max-w-xl mx-auto">
          <PianoKeyboard
            onPress={onPlayNote}
            activeNote={activeNote}
            whiteCount={8}
            showShortcuts
            compact
            notationSystem={progress.notationSystem}
          />
        </div>
      </section>
    </div>
  );
};

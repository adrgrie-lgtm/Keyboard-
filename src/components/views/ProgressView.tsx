import React, { useState } from "react";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock3,
  Flame,
  Heart,
  Keyboard,
  Medal,
  Music,
  Music2,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { ACHIEVEMENTS, ALL_LESSONS, LESSON_MODULES } from "../../lib/music-data";
import type { Lesson, UserProgress } from "../../types/music";

interface ProgressViewProps {
  progress: UserProgress;
  onOpenQuiz: () => void;
  onOpenCertificate: () => void;
  onStartLesson: (lesson: Lesson) => void;
  onUpdateName: (name: string) => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  progress,
  onOpenQuiz,
  onOpenCertificate,
  onStartLesson,
  onUpdateName,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(progress.studentName);

  const completedCount = progress.completedLessonIds.length;
  const percent = Math.round((completedCount / ALL_LESSONS.length) * 100);

  // Compute average accuracy across completed lessons
  const accuracyValues = Object.values(progress.lessonAccuracies);
  const avgAccuracy = accuracyValues.length > 0
    ? Math.round(accuracyValues.reduce((a, b) => a + b, 0) / accuracyValues.length)
    : 92;

  const formatPracticeTime = (seconds: number) => {
    if (seconds === 0) return "0 Min";
    if (seconds < 60) return "< 1 Min";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} Min`;
    const hours = (minutes / 60).toFixed(1);
    return `${hours} Std`;
  };

  const handleSaveName = () => {
    onUpdateName(tempName.trim() || "Kleiner Musikstar");
    setEditingName(false);
  };

  // Generate last 7 days for the streak tracker
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const iso = d.toISOString().slice(0, 10);
    const dayName = d.toLocaleDateString("de-DE", { weekday: "short" });
    const isDone = (progress.activeDays || []).includes(iso);
    return { iso, dayName, isDone };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[#e16e96] text-xs font-black tracking-widest uppercase">
            <span className="w-4 h-0.5 rounded bg-[#e781a3]" />
            DEINE MUSIKALISCHE REISE
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#302941] tracking-tight mt-1 mb-1">
            Schau, was du schon kannst!
          </h1>
          <p className="text-sm text-[#898396]">
            Jeder gespielte Ton und jede geschaffte Übung bringen dich ein Stück näher an dein großes Konzert.
          </p>
        </div>

        {/* Student Name & Certificate CTA */}
        <div className="flex items-center gap-3">
          {editingName ? (
            <div className="flex items-center gap-2 bg-white border border-[#ebdce6] p-1.5 rounded-2xl shadow-sm">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                className="px-2 py-1 text-xs font-bold text-[#30263f] focus:outline-none"
                placeholder="Dein Name"
              />
              <button
                type="button"
                onClick={handleSaveName}
                className="px-3 py-1 bg-[#302942] text-white rounded-xl text-xs font-black"
              >
                Fertig
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setTempName(progress.studentName);
                setEditingName(true);
              }}
              className="text-xs font-bold text-[#8a7f94] hover:text-[#de628e] px-2 py-1 underline underline-offset-4"
            >
              Lernprofil: <strong className="text-[#30263f] font-black">{progress.studentName}</strong>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCertificate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ed78a0] to-[#d8618a] hover:from-[#de628e] hover:to-[#c84f79] text-white text-xs font-black shadow-md hover:scale-105 transition-all"
          >
            <Award size={16} /> Meisterurkunde
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Lektionen */}
        <div className="p-5 rounded-3xl bg-white border border-[#eeebf0] shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-[#fff0f5] text-[#e06892] flex items-center justify-center font-bold mb-3">
            <BookOpen size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#a49ba8] block">
            LEKTIONEN GEMEISTERT
          </span>
          <strong className="text-2xl sm:text-3xl font-black text-[#2f273b] block mt-1">
            {completedCount} <span className="text-sm font-bold text-[#beb5c3]">/ {ALL_LESSONS.length}</span>
          </strong>
          <span className="text-xs text-[#958c9c] mt-0.5 block">{percent}% abgeschlossen</span>
        </div>

        {/* Stat 2: Gespielte Töne */}
        <div className="p-5 rounded-3xl bg-white border border-[#eeebf0] shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-[#f4edfd] text-[#9375c3] flex items-center justify-center font-bold mb-3">
            <Music2 size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#a49ba8] block">
            TÖNE GESPIELT
          </span>
          <strong className="text-2xl sm:text-3xl font-black text-[#2f273b] block mt-1">
            {progress.totalNotesPlayed.toLocaleString("de-DE")}
          </strong>
          <span className="text-xs text-[#958c9c] mt-0.5 block">Jeder Ton zählt</span>
        </div>

        {/* Stat 3: Treffsicherheit */}
        <div className="p-5 rounded-3xl bg-white border border-[#eeebf0] shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-[#e7f8f1] text-[#55ab8d] flex items-center justify-center font-bold mb-3">
            <Target size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#a49ba8] block">
            TREFFERQUOTE
          </span>
          <strong className="text-2xl sm:text-3xl font-black text-[#2f273b] block mt-1">
            {avgAccuracy}%
          </strong>
          <span className="text-xs text-[#958c9c] mt-0.5 block">Auf Anhieb getroffen</span>
        </div>

        {/* Stat 4: Übezeit */}
        <div className="p-5 rounded-3xl bg-white border border-[#eeebf0] shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-[#fff2e3] text-[#d99d52] flex items-center justify-center font-bold mb-3">
            <Clock3 size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#a49ba8] block">
            ZEIT MIT MUSIK
          </span>
          <strong className="text-2xl sm:text-3xl font-black text-[#2f273b] block mt-1">
            {formatPracticeTime(progress.practiceSeconds)}
          </strong>
          <span className="text-xs text-[#958c9c] mt-0.5 block">In eigenem Tempo</span>
        </div>
      </div>

      {/* Streak Tracker & Interactive Quiz Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* Streak Tracker */}
        <section className="bg-white rounded-3xl border border-[#eeebf0] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame className="text-[#e26938] fill-[#e26938]" size={22} />
                <h3 className="text-base font-black text-[#2e263d] m-0">
                  Tages-Serie & Übe-Tagebuch
                </h3>
              </div>
              <span className="text-xs font-black text-[#de628e] bg-[#fff0f5] px-2.5 py-1 rounded-full">
                {progress.dailyStreak} {progress.dailyStreak === 1 ? "Tag" : "Tage"} aktiv
              </span>
            </div>

            <p className="text-xs text-[#8c8296] leading-relaxed mb-4">
              Wer jeden Tag nur 5 Minuten klimpert, lernt Klavier spielen doppelt so schnell wie bei seltenem Üben!
            </p>

            {/* 7 Days Mini Calendar */}
            <div className="grid grid-cols-7 gap-2 text-center">
              {last7Days.map((d, i) => (
                <div
                  key={d.iso}
                  className={`p-2.5 rounded-2xl flex flex-col items-center justify-center transition-all ${
                    d.isDone
                      ? "bg-[#eaf8f1] border border-[#bee6d3] text-[#2e825f]"
                      : "bg-[#faf8fb] border border-[#f0ebf3] text-[#a49ca9]"
                  }`}
                >
                  <span className="text-[10px] font-extrabold uppercase mb-1">{d.dayName}</span>
                  {d.isDone ? (
                    <CheckCircle2 size={18} className="text-[#4bb587]" />
                  ) : (
                    <span className="w-4 h-4 rounded-full border border-dashed border-[#c5bccb] inline-block" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#f4f1f6] flex items-center justify-between text-xs text-[#8c8196] font-bold">
            <span>Rekord-Serie:</span>
            <strong className="text-[#2e263d]">{progress.highestStreak} Tage am Stück</strong>
          </div>
        </section>

        {/* Interactive Quiz Launcher Card */}
        <section className="bg-gradient-to-br from-[#f8f2fe] via-[#faf5fc] to-[#fff3f7] rounded-3xl border border-[#ede0f4] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#8e6ebc] mb-1">
              <Zap size={16} /> INTERAKTIVE LERNKONTROLLE
            </div>
            <h3 className="text-xl font-black text-[#2e263d] m-0 mb-2">
              Wissens- & Gehör-Check
            </h3>
            <p className="text-xs text-[#7b6d8a] leading-relaxed mb-4">
              Teste dein Können: Erkennst du Töne nur am Gehör? Findest du die Noten auf den Notenlinien?
              Sammle bis zu 120 Punkte und meistere das Abzeichen "Fledermaus-Gehör"!
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#ecd9f2]">
            <div>
              <span className="text-[10px] font-bold text-[#9d8da8] block uppercase">Beste Punktzahl</span>
              <strong className="text-lg font-black text-[#30263f]">
                {progress.quizHighScore} Punkte
              </strong>
            </div>

            <button
              type="button"
              onClick={onOpenQuiz}
              className="px-5 py-2.5 rounded-xl bg-[#302942] hover:bg-[#493858] text-white text-xs font-black shadow-md flex items-center gap-2 hover:scale-105 transition-all"
            >
              Jetzt Quiz starten <Zap size={16} />
            </button>
          </div>
        </section>
      </div>

      {/* 12 Badges (Abzeichen) Gallery */}
      <section className="bg-white rounded-3xl border border-[#eeebf0] p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#f3edf5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#fff2db] text-[#dea85b] flex items-center justify-center font-bold">
              <Trophy size={22} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#dca658]">
                SAMMLE DEINE ERFOLGE
              </span>
              <h3 className="text-lg font-black text-[#2e263d] m-0">
                Deine 12 Abzeichen & Trophäen
              </h3>
            </div>
          </div>

          <span className="text-xs font-extrabold text-[#7e7389] bg-[#f7f4f9] px-3 py-1 rounded-full">
            {progress.unlockedAchievementIds.length} von {ACHIEVEMENTS.length} freigeschaltet
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {ACHIEVEMENTS.map((badge) => {
            const isUnlocked = progress.unlockedAchievementIds.includes(badge.id);

            const iconElement =
              badge.icon === "music" ? <Music2 size={20} /> :
              badge.icon === "keyboard" ? <Keyboard size={20} /> :
              badge.icon === "sparkles" ? <Sparkles size={20} /> :
              badge.icon === "trophy" ? <Trophy size={20} /> :
              badge.icon === "flame" ? <Flame size={20} /> :
              badge.icon === "zap" ? <Zap size={20} /> :
              badge.icon === "medal" ? <Medal size={20} /> :
              badge.icon === "heart" ? <Heart size={20} /> :
              <Star size={20} />;

            return (
              <div
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
                  isUnlocked
                    ? "bg-[#fffbfd] border-[#f4d1df] shadow-sm"
                    : "bg-[#fbfafc] border-[#eeeaf0] opacity-55 grayscale"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    isUnlocked
                      ? "bg-[#fff0f5] text-[#de628e] shadow-sm"
                      : "bg-[#f0ebf2] text-[#9c91a3]"
                  }`}
                >
                  {iconElement}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-black text-[#2e263d] block truncate">
                      {badge.name}
                    </strong>
                    {isUnlocked && (
                      <CheckCircle2 size={15} className="text-[#49b380] shrink-0 ml-1" />
                    )}
                  </div>
                  <p className="text-[11px] text-[#8e8496] leading-snug mt-0.5 m-0 line-clamp-2">
                    {badge.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Module Overview with Stars */}
      <section className="bg-white rounded-3xl border border-[#eeebf0] p-6 shadow-sm space-y-4">
        <h3 className="text-base font-black text-[#2e263d] m-0">
          Deine gemeisterten Lektionen im Überblick
        </h3>

        <div className="space-y-2">
          {ALL_LESSONS.map((lesson) => {
            const isDone = progress.completedLessonIds.includes(lesson.id);
            const stars = progress.lessonStars[lesson.id] || (isDone ? 3 : 0);

            return (
              <div
                key={lesson.id}
                className="flex items-center justify-between p-3 rounded-2xl border border-[#f2edf4] hover:border-[#ecdde8] transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black ${
                      isDone ? "bg-[#eaf8f1] text-[#429a77]" : "bg-[#f5f1f7] text-[#9b90a4]"
                    }`}
                  >
                    {isDone ? <CheckCircle2 size={16} /> : lesson.number}
                  </div>
                  <div>
                    <strong className="text-xs font-black text-[#2d263b] block">
                      Lektion {lesson.number}: {lesson.title}
                    </strong>
                    <span className="text-[10px] text-[#9c91a3]">
                      {lesson.subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {isDone ? (
                    <div className="flex items-center gap-0.5 text-[#e5a342]">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          size={14}
                          className={starIdx <= stars ? "fill-[#e5a342]" : "text-[#ded7e1]"}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold text-[#b4acba]">Noch offen</span>
                  )}

                  <button
                    type="button"
                    onClick={() => onStartLesson(lesson)}
                    className="p-1.5 rounded-lg bg-[#faf6fc] hover:bg-[#fff0f5] text-[#d65c89] text-xs font-bold"
                    title="Lektion starten"
                  >
                    <Play size={14} fill="currentColor" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

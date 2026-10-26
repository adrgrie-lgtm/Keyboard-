import React, { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Keyboard,
  Music2,
  Sparkles,
  Star,
  Trophy,
  WandSparkles,
  Zap,
} from "lucide-react";
import { LESSON_MODULES, ALL_LESSONS } from "../../lib/music-data";
import type { Lesson, UserProgress } from "../../types/music";

interface LessonsViewProps {
  progress: UserProgress;
  onStartLesson: (lesson: Lesson) => void;
  onOpenCertificate: () => void;
}

export const LessonsView: React.FC<LessonsViewProps> = ({
  progress,
  onStartLesson,
  onOpenCertificate,
}) => {
  const [selectedModuleId, setSelectedModuleId] = useState<string>("all");

  const completedCount = progress.completedLessonIds.length;
  const percent = Math.round((completedCount / ALL_LESSONS.length) * 100);
  const nextLesson = ALL_LESSONS.find((l) => !progress.completedLessonIds.includes(l.id)) ?? ALL_LESSONS[0];

  const modulesToDisplay =
    selectedModuleId === "all"
      ? LESSON_MODULES
      : LESSON_MODULES.filter((m) => m.id === selectedModuleId);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[#e16e96] text-xs font-black tracking-widest uppercase">
            <span className="w-4 h-0.5 rounded bg-[#e781a3]" />
            DER GROSSE LERNPFAD
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#302941] tracking-tight mt-1 mb-1">
            Ein Ton nach dem anderen.
          </h1>
          <p className="text-sm text-[#898396]">
            16 aufeinander abgestimmte Lektionen in 4 musikalischen Welten begleiten dich bis zum Meisterkonzert.
          </p>
        </div>

        {completedCount >= 4 && (
          <button
            type="button"
            onClick={onOpenCertificate}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#eed0de] text-[#d65f8a] text-xs font-extrabold hover:bg-[#fff0f5] shadow-sm transition-all"
          >
            <Trophy size={16} /> Meisterurkunde ansehen
          </button>
        )}
      </div>

      {/* Progress Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-[#fff3f7] via-[#faf5fe] to-[#f4f7ff] border border-[#f0e2ef] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-[#e281a3]">
            <WandSparkles size={26} />
          </div>
          <div>
            <strong className="text-base font-black text-[#2f273c] block">
              Deine musikalische Reise
            </strong>
            <span className="text-xs text-[#897f94]">
              Du hast {completedCount} von {ALL_LESSONS.length} Lektionen erfolgreich gemeistert.
            </span>
          </div>
        </div>

        <div className="w-full sm:w-48 text-right">
          <strong className="text-lg font-black text-[#30273f] block mb-1">
            {completedCount} / {ALL_LESSONS.length} Lektionen
          </strong>
          <div className="w-full h-2 rounded-full bg-[#e8deea] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ed78a0] to-[#b483eb] transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Module Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedModuleId("all")}
          className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
            selectedModuleId === "all"
              ? "bg-[#302942] text-white shadow-sm"
              : "bg-white text-[#7b7285] border border-[#eeeaf0] hover:bg-[#faf8fb]"
          }`}
        >
          Alle 4 Welten ({ALL_LESSONS.length})
        </button>
        {LESSON_MODULES.map((mod) => {
          const modCompleted = mod.lessons.filter((l) => progress.completedLessonIds.includes(l.id)).length;
          const isCurrent = selectedModuleId === mod.id;
          return (
            <button
              key={mod.id}
              type="button"
              onClick={() => setSelectedModuleId(mod.id)}
              className={`px-4 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-2 ${
                isCurrent
                  ? "bg-[#302942] text-white shadow-sm"
                  : "bg-white text-[#7b7285] border border-[#eeeaf0] hover:bg-[#faf8fb]"
              }`}
            >
              <span>{mod.title.split(":")[0]}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isCurrent ? "bg-white/20 text-white" : "bg-[#f2edf4] text-[#8e8596]"}`}>
                {modCompleted}/{mod.lessons.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Modules & Lessons List */}
      <div className="space-y-10">
        {modulesToDisplay.map((mod) => {
          const modCompleted = mod.lessons.filter((l) => progress.completedLessonIds.includes(l.id)).length;
          const modAllDone = modCompleted === mod.lessons.length;

          return (
            <section key={mod.id} className="space-y-4">
              {/* Module Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#eeeaf0]">
                <div>
                  <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#d86d94]">
                    <span>STUFE {mod.level}</span>
                    <span>·</span>
                    <span>{mod.subtitle}</span>
                  </div>
                  <h2 className="text-xl font-black text-[#2d263b] m-0">
                    {mod.title}
                  </h2>
                  <p className="text-xs text-[#8c8294] mt-0.5">
                    {mod.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-xl text-xs font-extrabold ${modAllDone ? "bg-[#eaf8f1] text-[#47a683]" : "bg-[#f5f1f7] text-[#7d7286]"}`}>
                    {modAllDone ? "Welt abgeschlossen ✓" : `${modCompleted} von ${mod.lessons.length} gemeistert`}
                  </span>
                </div>
              </div>

              {/* Lessons Grid in this module */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {mod.lessons.map((lesson) => {
                  const isDone = progress.completedLessonIds.includes(lesson.id);
                  const isNext = lesson.id === nextLesson.id && completedCount < ALL_LESSONS.length;
                  const stars = progress.lessonStars[lesson.id] || (isDone ? 3 : 0);
                  const accuracy = progress.lessonAccuracies[lesson.id];

                  return (
                    <button
                      key={lesson.id}
                      type="button"
                      onClick={() => onStartLesson(lesson)}
                      className={`text-left p-5 rounded-3xl bg-white border transition-all hover:translate-y-[-3px] flex flex-col justify-between min-h-[240px] shadow-sm hover:shadow-md ${
                        isNext
                          ? "border-[#f1b7ca] ring-2 ring-[#ffe3ec]"
                          : isDone
                          ? "border-[#e0f1e8]"
                          : "border-[#edeaf0] hover:border-[#f1b7ca]"
                      }`}
                    >
                      {/* Top icon & status */}
                      <div className="flex items-start justify-between w-full">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm ${
                          isDone
                            ? "bg-[#eaf8f1] text-[#47a683]"
                            : isNext
                            ? "bg-[#fff0f5] text-[#d65c89]"
                            : "bg-[#f8f5fa] text-[#867a92]"
                        }`}>
                          {lesson.number}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {isDone ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#eaf8f1] text-[#47a683]">
                              <Check size={12} strokeWidth={3} /> GEMEISTERT
                            </span>
                          ) : isNext ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#fff0f5] text-[#d65c89]">
                              ALS NÄCHSTES
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-[#b4acba]">
                              {lesson.duration}
                            </span>
                          )}

                          {/* Star Ratings */}
                          {isDone && (
                            <div className="flex items-center gap-0.5 text-[#e5a342]">
                              {[1, 2, 3].map((starIdx) => (
                                <Star
                                  key={starIdx}
                                  size={13}
                                  className={starIdx <= stars ? "fill-[#e5a342]" : "text-[#dfd7e2]"}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="my-3">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#d6688e] block">
                          LEKTION {lesson.number}
                        </span>
                        <h3 className="text-base font-black text-[#2e263d] m-0 leading-tight mt-0.5">
                          {lesson.title}
                        </h3>
                        <p className="text-xs text-[#8c8296] mt-1.5 line-clamp-2 leading-relaxed">
                          {lesson.description}
                        </p>
                      </div>

                      {/* Footer */}
                      <div className="pt-3 border-t border-[#f4f1f6] flex items-center justify-between text-xs font-extrabold w-full">
                        <span className="text-[#a49ba9] flex items-center gap-1">
                          <Clock3 size={14} /> {lesson.duration}
                        </span>
                        <span className="text-[#de628e] flex items-center gap-1 hover:translate-x-0.5 transition-transform">
                          {isDone ? "Nochmal spielen" : "Starten"} <ArrowRight size={15} />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};

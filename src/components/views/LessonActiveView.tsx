import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  AudioLines,
  CheckCircle2,
  Clock3,
  HelpCircle,
  Lightbulb,
  Mic,
  MicOff,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Volume2,
} from "lucide-react";
import confetti from "canvas-confetti";
import { PianoKeyboard } from "../piano-keyboard";
import { SheetMusicStave } from "../sheet-music-stave";
import { playNote, playSuccessChime, playGentleTryAgain, playMetronomeClick } from "../../lib/audio";
import { NOTE_BY_ID, ALL_LESSONS, getNoteLabel } from "../../lib/music-data";
import { usePitchDetection } from "../../hooks/use-pitch-detection";
import type { Lesson, UserProgress, PracticeMode } from "../../types/music";

interface LessonActiveViewProps {
  lesson: Lesson;
  progress: UserProgress;
  onBack: () => void;
  onLessonComplete: (lessonId: string, stars: number, accuracy: number) => void;
  onStartLesson: (nextLesson: Lesson) => void;
  onPlayFree: () => void;
}

export const LessonActiveView: React.FC<LessonActiveViewProps> = ({
  lesson,
  progress,
  onBack,
  onLessonComplete,
  onStartLesson,
  onPlayFree,
}) => {
  const [step, setStep] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("screen");
  const [feedback, setFeedback] = useState<{ kind: "good" | "try"; text: string } | null>(null);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [metronomeEnabled, setMetronomeEnabled] = useState(false);
  const [bpm, setBpm] = useState(80);

  // Accuracy tracking
  const firstTryCorrectRef = useRef<number>(0);
  const totalAttemptsRef = useRef<number>(0);
  const activeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const demoRunRef = useRef(0);

  const currentTargetId = !isFinished && step < lesson.notes.length ? lesson.notes[step] : null;
  const targetNoteData = currentTargetId ? NOTE_BY_ID[currentTargetId] : null;

  // Metronome interval
  useEffect(() => {
    if (!metronomeEnabled || isFinished) return;
    const intervalMs = (60 / bpm) * 1000;
    let beat = 0;
    const timer = setInterval(() => {
      beat = (beat + 1) % 4;
      playMetronomeClick(beat === 0, 0.4);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [metronomeEnabled, bpm, isFinished]);

  // Demo playback handler
  const stopDemo = () => {
    demoRunRef.current += 1;
    setIsDemoPlaying(false);
    setActiveNote(null);
  };

  const playDemo = async () => {
    if (isDemoPlaying) {
      stopDemo();
      return;
    }
    const run = ++demoRunRef.current;
    setIsDemoPlaying(true);
    const speed = Math.max(380, Math.min(650, Math.round(60000 / bpm)));

    for (let i = 0; i < lesson.notes.length; i++) {
      if (demoRunRef.current !== run) return;
      const nId = lesson.notes[i];
      setActiveNote(nId);
      playNote(nId, "piano", 0.7, 0.85);
      await new Promise((res) => setTimeout(res, speed));
    }

    if (demoRunRef.current === run) {
      setIsDemoPlaying(false);
      setActiveNote(null);
    }
  };

  // Note played handler
  const handleNote = (noteId: string, source: "screen" | "mic" = "screen") => {
    if (!NOTE_BY_ID[noteId]) return;

    if (source === "screen") {
      playNote(noteId, "piano", progress.soundVolume);
    }
    setActiveNote(noteId);
    if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
    activeTimerRef.current = setTimeout(() => setActiveNote(null), 350);

    if (isFinished || !currentTargetId) return;

    totalAttemptsRef.current += 1;

    if (noteId === currentTargetId) {
      // Hit correct note!
      if (totalAttemptsRef.current === step + 1) {
        firstTryCorrectRef.current += 1;
      }
      playSuccessChime(0.4);

      if (step === lesson.notes.length - 1) {
        // Finished whole lesson!
        const total = Math.max(1, totalAttemptsRef.current);
        const acc = Math.min(100, Math.round((lesson.notes.length / total) * 100));
        const stars = acc >= 90 ? 3 : acc >= 70 ? 2 : 1;

        setIsFinished(true);
        setFeedback({ kind: "good", text: "Fantastisch! Du hast alle Töne gemeistert." });
        onLessonComplete(lesson.id, stars, acc);

        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#ed78a0", "#8f75c3", "#68b9a2", "#e7a370"],
          });
        } catch {
          // Fallback
        }
      } else {
        setStep((s) => s + 1);
        setFeedback({ kind: "good", text: "Super! Genau der richtige Ton." });
      }
    } else {
      // Miss
      playGentleTryAgain(0.3);
      setFeedback({
        kind: "try",
        text: `Fast! Als Nächstes ist ${getNoteLabel(targetNoteData!, progress.notationSystem)} dran.`,
      });
    }
  };

  // Microphone pitch detection
  const microphone = usePitchDetection((detectedNoteId) => {
    if (practiceMode === "keyboard") {
      handleNote(detectedNoteId, "mic");
    }
  });

  // Computer keyboard shortcuts listener
  useEffect(() => {
    const keyMap: Record<string, string> = {
      a: "C4",
      w: "C#4",
      s: "D4",
      e: "D#4",
      d: "E4",
      f: "F4",
      t: "F#4",
      g: "G4",
      z: "G#4",
      y: "G#4", // for english layout QWERTY
      h: "A4",
      u: "A#4",
      j: "B4",
      k: "C5",
      l: "D5",
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA"].includes(tag) || e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
      const mapped = keyMap[e.key.toLowerCase()];
      if (mapped) {
        e.preventDefault();
        handleNote(mapped, "screen");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const nextLesson = ALL_LESSONS.find((l) => l.number === String(Number(lesson.number) + 1).padStart(2, "0"));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top back & lesson info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            stopDemo();
            microphone.stop();
            onBack();
          }}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#8f839c] hover:text-[#d65c89] transition-colors self-start"
        >
          <ArrowLeft size={16} /> Zurück zum Lernpfad
        </button>

        <div className="flex items-center gap-2">
          {/* Metronome toggle */}
          <div className="flex items-center gap-1 bg-white border border-[#eeeaf0] px-3 py-1.5 rounded-xl text-xs font-bold text-[#6a5e78]">
            <button
              type="button"
              onClick={() => setMetronomeEnabled(!metronomeEnabled)}
              className={`px-2 py-0.5 rounded text-[10px] font-black uppercase transition-colors ${
                metronomeEnabled ? "bg-[#eaf8f1] text-[#429a77]" : "bg-[#f5f1f7] text-[#867a92]"
              }`}
            >
              Metronom: {metronomeEnabled ? "An" : "Aus"}
            </button>
            {metronomeEnabled && (
              <span className="text-[11px] text-[#9a8ea4] ml-1">{bpm} BPM</span>
            )}
          </div>

          {/* Mode switch (screen vs mic) */}
          <div className="inline-flex p-1 bg-[#f5f1f7] rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                microphone.stop();
                setPracticeMode("screen");
              }}
              className={`px-3 py-1 rounded-lg transition-all ${
                practiceMode === "screen"
                  ? "bg-white text-[#d65c89] shadow-sm font-black"
                  : "text-[#877c93]"
              }`}
            >
              Bildschirm
            </button>
            <button
              type="button"
              onClick={() => setPracticeMode("keyboard")}
              className={`px-3 py-1 rounded-lg transition-all ${
                practiceMode === "keyboard"
                  ? "bg-white text-[#d65c89] shadow-sm font-black"
                  : "text-[#877c93]"
              }`}
            >
              Mein Keyboard
            </button>
          </div>
        </div>
      </div>

      {/* Lesson Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-[#d86d94]">
            LEKTION {lesson.number} VON 16
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2f273b] m-0">
            {lesson.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#8c8296] mt-0.5">
            {lesson.description}
          </p>
        </div>

        <button
          type="button"
          onClick={playDemo}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 border transition-all ${
            isDemoPlaying
              ? "bg-[#fff0f5] border-[#f2adc5] text-[#d65c89]"
              : "bg-white border-[#e9e3ed] text-[#655874] hover:bg-[#faf6fc]"
          }`}
        >
          {isDemoPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
          {isDemoPlaying ? "Demo stoppen" : "Melodie anhören"}
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <section className="lg:col-span-2 bg-white rounded-3xl border border-[#eeeaf0] p-6 shadow-sm space-y-5">
          {isFinished ? (
            /* Celebration Screen */
            <div className="text-center py-10 space-y-4">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-[#fff2db] text-[#dea85b] shadow-lg transform -rotate-6">
                <Trophy size={48} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#de6a91]">
                  LEKTION ERFOLGREICH GEMEISTERT
                </span>
                <h2 className="text-3xl font-black text-[#2e263d] mt-1 mb-2">
                  Das klang meisterhaft!
                </h2>
                <p className="text-sm text-[#897e93] max-w-md mx-auto">
                  Du hast alle {lesson.notes.length} Töne fehlerfrei gespielt und dir das Abzeichen{" "}
                  <strong className="text-[#de628e] font-black">{lesson.reward}</strong> verdient!
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                {nextLesson ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStep(0);
                      setIsFinished(false);
                      onStartLesson(nextLesson);
                    }}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ed78a0] to-[#d8618a] hover:from-[#de628e] hover:to-[#c84f79] text-white font-black text-xs flex items-center gap-2 shadow-md hover:scale-105 transition-all"
                  >
                    Nächste Lektion starten <ArrowRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onPlayFree}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ed78a0] to-[#d8618a] text-white font-black text-xs flex items-center gap-2 shadow-md"
                  >
                    Freies Musikstudio öffnen <Sparkles size={16} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setStep(0);
                    setIsFinished(false);
                    firstTryCorrectRef.current = 0;
                    totalAttemptsRef.current = 0;
                  }}
                  className="px-5 py-3 rounded-xl bg-white border border-[#e4dbe8] text-[#554865] hover:bg-[#faf6fc] font-bold text-xs flex items-center gap-2"
                >
                  <RotateCcw size={15} /> Nochmal spielen
                </button>
              </div>
            </div>
          ) : (
            /* Active Lesson Flow */
            <>
              {/* Step indicator & counter */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#de6a91]">
                    JETZT BIST DU DRAN
                  </span>
                  <h3 className="text-xl font-black text-[#2e263d] m-0">
                    Spiele die Melodie Note für Note
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-[#de628e]">
                    {step + 1}
                  </span>
                  <span className="text-sm font-bold text-[#b4abbc]">
                    {" "}/ {lesson.notes.length}
                  </span>
                </div>
              </div>

              {/* Progress step bar */}
              <div className="flex gap-1.5 h-2">
                {lesson.notes.map((_, idx) => (
                  <div
                    key={idx}
                    className={`flex-1 rounded-full transition-all ${
                      idx < step
                        ? "bg-[#8ad0b3]"
                        : idx === step
                        ? "bg-[#ed78a0] ring-2 ring-[#ffd8e6]"
                        : "bg-[#eeeaf0]"
                    }`}
                  />
                ))}
              </div>

              {/* Sheet Music Stave Visualizer */}
              <SheetMusicStave
                currentNoteId={currentTargetId}
                targetNoteId={currentTargetId}
                noteSequence={lesson.notes}
                currentIndex={step}
                notationSystem={progress.notationSystem}
              />

              {/* Target Note Hero Card */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#fff3f7] via-[#fff7fa] to-[#f8f3fb] border border-[#f5dce6]">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white text-[#d85885] font-black text-2xl flex items-center justify-center shadow-sm border border-[#f5dce6]">
                    {targetNoteData ? getNoteLabel(targetNoteData, progress.notationSystem) : "-"}
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#d86d94]">
                      DEIN NÄCHSTER TON
                    </span>
                    <h4 className="text-lg font-black text-[#2d263b] m-0">
                      Spiele das {targetNoteData ? getNoteLabel(targetNoteData, progress.notationSystem) : ""}
                    </h4>
                    <p className="text-xs text-[#8c8296] m-0 mt-0.5">
                      {lesson.lyrics ? `Silbe: "${lesson.lyrics[step] || ""}"` : "Finde die leuchtende Taste auf dem Keyboard."}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => targetNoteData && playNote(targetNoteData.id, "piano", 0.7, 1.1)}
                  className="w-10 h-10 rounded-xl bg-white border border-[#f1d0de] text-[#d85885] flex items-center justify-center hover:scale-105 transition-transform shadow-sm"
                  title="Diesen Ton vorhören"
                >
                  <Volume2 size={18} />
                </button>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold animate-fade-in ${
                    feedback.kind === "good"
                      ? "bg-[#eaf8f1] text-[#3d9876] border border-[#caeedf]"
                      : "bg-[#fff8ea] text-[#b8853b] border border-[#fae7c3]"
                  }`}
                >
                  {feedback.kind === "good" ? <CheckCircle2 size={16} /> : <Lightbulb size={16} />}
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Microphone tuner banner if practiceMode === keyboard */}
              {practiceMode === "keyboard" && (
                <div className={`p-4 rounded-2xl border transition-all ${
                  microphone.isListening ? "bg-[#f4fcf7] border-[#c0ebd4]" : "bg-[#faf7fc] border-[#ede3f2]"
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        microphone.isListening ? "bg-[#dff5ea] text-[#429a77]" : "bg-[#f0e8f7] text-[#9375c3]"
                      }`}>
                        {microphone.isListening ? <AudioLines size={20} /> : <Mic size={20} />}
                      </div>
                      <div>
                        <strong className="text-xs font-black text-[#2e263d] block">
                          {microphone.isListening ? "Mikrofon hört zu..." : "Echtes Keyboard verbinden"}
                        </strong>
                        <span className="text-[11px] text-[#867c91]">
                          {microphone.isListening
                            ? microphone.detectedNote
                              ? `Erkannt: ${getNoteLabel(NOTE_BY_ID[microphone.detectedNote] || microphone.detectedNote, progress.notationSystem)} (${microphone.frequency} Hz)`
                              : "Spiele einen klaren Ton auf deinem echten Instrument."
                            : "Aktiviere das Mikrofon, damit die App deine echten Töne erkennt."}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => (microphone.isListening ? microphone.stop() : void microphone.start())}
                      className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-sm transition-all ${
                        microphone.isListening
                          ? "bg-white border border-[#cbeada] text-[#3e9371]"
                          : "bg-[#302942] text-white"
                      }`}
                    >
                      {microphone.isListening ? <><MicOff size={15} /> Ausschalten</> : <><Mic size={15} /> Mikrofon starten</>}
                    </button>
                  </div>
                  {microphone.error && (
                    <p className="text-[11px] text-[#d65275] font-bold mt-2 m-0">
                      {microphone.error}
                    </p>
                  )}
                </div>
              )}

              {/* The Interactive Piano Keyboard */}
              <div className="pt-2">
                <PianoKeyboard
                  onPress={(nId) => handleNote(nId, "screen")}
                  activeNote={activeNote}
                  targetNote={currentTargetId}
                  whiteCount={8}
                  showShortcuts
                  notationSystem={progress.notationSystem}
                  isMetronomeActive={metronomeEnabled}
                />
              </div>
            </>
          )}
        </section>

        {/* Sidebar: Hints, Finger Tips & Fun Facts */}
        <aside className="space-y-4">
          {/* Finger placement tip */}
          {lesson.fingerTip && (
            <div className="p-5 rounded-3xl bg-[#f5edfe] border border-[#ebdcf8]">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#9171be] mb-2">
                <Lightbulb size={16} />
                FINGER-TIPP
              </div>
              <h4 className="text-sm font-black text-[#2f263d] m-0 mb-1">
                Richtige Handhaltung
              </h4>
              <p className="text-xs text-[#7e728d] leading-relaxed m-0">
                {lesson.fingerTip}
              </p>
            </div>
          )}

          {/* Hint Card */}
          <div className="p-5 rounded-3xl bg-[#fff2f6] border border-[#f9dce7]">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#d6688e] mb-2">
              <Sparkles size={16} />
              WIE DU DEN TON FINDEST
            </div>
            <h4 className="text-sm font-black text-[#2f263d] m-0 mb-1">
              Orientierungshilfe
            </h4>
            <p className="text-xs text-[#8c7886] leading-relaxed m-0">
              {lesson.hint}
            </p>
          </div>

          {/* Schon gewusst? Fact */}
          <div className="p-5 rounded-3xl bg-[#fff8eb] border border-[#fae8c8]">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#d89f4b] mb-2">
              <Star size={16} />
              SCHON GEWUSST?
            </div>
            <h4 className="text-sm font-black text-[#2f263d] m-0 mb-1">
              Musikwissen
            </h4>
            <p className="text-xs text-[#8f8069] leading-relaxed m-0">
              {lesson.fact}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import {
  Volume2,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Trophy,
  ArrowRight,
  RotateCcw,
  Music,
  Eye,
  Award
} from "lucide-react";
import confetti from "canvas-confetti";
import { playNote, playSuccessChime, playGentleTryAgain } from "../lib/audio";
import { NOTE_BY_ID, WHITE_NOTES, getNoteLabel } from "../lib/music-data";
import { SheetMusicStave } from "./sheet-music-stave";
import type { NotationSystem, UserProgress } from "../types/music";

interface InteractiveQuizProps {
  notationSystem: NotationSystem;
  progress: UserProgress;
  onUpdateScore: (score: number) => void;
  onClose?: () => void;
}

type QuizType = "ear" | "stave" | "theory";

interface Question {
  type: QuizType;
  prompt: string;
  targetNoteId: string;
  options: string[];
  explanation: string;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    type: "ear",
    prompt: "Höre genau hin: Welcher Ton wurde gerade gespielt?",
    targetNoteId: "C4",
    options: ["C4", "E4", "G4"],
    explanation: "Das C ist der tiefste dieser drei Grundtöne und klingt wie zuhause ankommen.",
  },
  {
    type: "stave",
    prompt: "Welche Note siehst du auf den Notenlinien?",
    targetNoteId: "E4",
    options: ["C4", "E4", "G4", "B4"],
    explanation: "Das E liegt genau auf der ersten (untersten) Notenlinie des Violinschlüssels.",
  },
  {
    type: "ear",
    prompt: "Höre dir diesen Ton an. Ist es C, D oder G?",
    targetNoteId: "G4",
    options: ["C4", "D4", "G4"],
    explanation: "Das G ist die 5. Stufe (Quinte) und klingt strahlend und offen.",
  },
  {
    type: "stave",
    prompt: "Welcher Ton hat eine eigene Hilfslinie unter dem Notensystem?",
    targetNoteId: "C4",
    options: ["C4", "D4", "F4", "A4"],
    explanation: "Das eingestrichene C (C4) hat immer eine kleine waagerechte Hilfslinie!",
  },
  {
    type: "ear",
    prompt: "Höre zu: Welcher helle Ton klingt hier?",
    targetNoteId: "C5",
    options: ["C4", "F4", "C5"],
    explanation: "Das ist das hohe C' (eine ganze Oktave über dem mittleren C)!",
  },
  {
    type: "stave",
    prompt: "Welche Note liegt genau auf der zweiten Notenlinie von unten?",
    targetNoteId: "G4",
    options: ["E4", "F4", "G4", "A4"],
    explanation: "Auf der zweiten Linie sitzt das G – genau darum heißt dieser Schlüssel auch G-Schlüssel!",
  },
];

export const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({
  notationSystem,
  progress,
  onUpdateScore,
  onClose,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "ear" | "stave">("all");

  const currentQ = SAMPLE_QUESTIONS[currentIdx];

  // Auto-play sound for ear training questions
  useEffect(() => {
    if (currentQ?.type === "ear" && !isFinished) {
      const timer = setTimeout(() => {
        playNote(currentQ.targetNoteId, "piano", 0.7, 1.2);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, isFinished, currentQ]);

  const handlePlaySound = () => {
    if (currentQ) {
      playNote(currentQ.targetNoteId, "piano", 0.7, 1.2);
    }
  };

  const handleSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
    setIsAnswered(true);

    const isCorrect = option === currentQ.targetNoteId;
    if (isCorrect) {
      playSuccessChime();
      setScore((s) => s + 20);
    } else {
      playGentleTryAgain();
    }
  };

  const handleNext = () => {
    if (currentIdx < SAMPLE_QUESTIONS.length - 1) {
      setCurrentIdx((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Finished
      const finalScore = score + (selectedOption === currentQ.targetNoteId ? 20 : 0);
      setIsFinished(true);
      onUpdateScore(finalScore);
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
          colors: ["#ed78a0", "#8f75c3", "#68b9a2", "#e7a370"],
        });
      } catch {
        // Safe fallback
      }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div className="bg-white rounded-3xl border border-[#edeaf0] p-6 shadow-md transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#f3edf5]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#fff0f5] text-[#e06892] flex items-center justify-center font-bold">
            <Award size={22} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#d86d94]">
              Interaktive Lernkontrolle
            </span>
            <h3 className="text-xl font-black text-[#2e273a] m-0">
              Noten- & Gehör-Check
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-[#f6f2f8] text-[#7d718a] text-xs font-black">
            Punkte: <span className="text-[#de628e] font-extrabold">{score}</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs font-bold text-[#9f95a7] hover:text-[#2e273a] px-2 py-1"
            >
              Schließen
            </button>
          )}
        </div>
      </div>

      {!isFinished ? (
        <div className="mt-5">
          {/* Progress bar */}
          <div className="flex items-center justify-between text-xs font-bold text-[#a69dae] mb-2">
            <span>Frage {currentIdx + 1} von {SAMPLE_QUESTIONS.length}</span>
            <span>{Math.round(((currentIdx) / SAMPLE_QUESTIONS.length) * 100)}% abgeschlossen</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#f3edf5] overflow-hidden mb-6">
            <div
              className="h-full bg-gradient-to-r from-[#ed78a0] to-[#b388eb] transition-all duration-300"
              style={{ width: `${((currentIdx + 1) / SAMPLE_QUESTIONS.length) * 100}%` }}
            />
          </div>

          {/* Question Banner */}
          <div className="rounded-2xl bg-[#faf7fc] border border-[#eee4f2] p-5 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-black tracking-wider uppercase bg-[#fff] text-[#8e73bc] border border-[#e8ddf1]">
                {currentQ.type === "ear" ? "🎧 Gehörtraining" : "👀 Notenlinien-Detektiv"}
              </span>
            </div>
            <h4 className="text-lg font-black text-[#322942] m-0">
              {currentQ.prompt}
            </h4>

            {/* Visual element depending on type */}
            {currentQ.type === "ear" && (
              <div className="mt-4 flex flex-col items-center justify-center py-6 bg-white rounded-xl border border-[#ece4f1]">
                <button
                  type="button"
                  onClick={handlePlaySound}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#ed78a0] to-[#d8618a] text-white font-extrabold text-sm shadow-md hover:scale-105 transition-transform"
                >
                  <Volume2 size={20} /> Ton noch einmal anhören
                </button>
                <span className="text-[11px] text-[#9a8ea3] mt-2 font-medium">
                  Klicke den Button, um den Ton erneut abzuspielen
                </span>
              </div>
            )}

            {currentQ.type === "stave" && (
              <div className="mt-4">
                <SheetMusicStave
                  currentNoteId={currentQ.targetNoteId}
                  targetNoteId={currentQ.targetNoteId}
                  notationSystem={notationSystem}
                  compact
                />
              </div>
            )}
          </div>

          {/* Answer Options */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {currentQ.options.map((option) => {
              const noteData = NOTE_BY_ID[option];
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQ.targetNoteId;

              let btnClass = "bg-white border-[#e9e3ed] text-[#423751] hover:bg-[#fff5f9] hover:border-[#f1b4cb]";
              if (isAnswered) {
                if (isCorrect) {
                  btnClass = "bg-[#ecf9f2] border-[#72caa0] text-[#2b7e57] font-black scale-102";
                } else if (isSelected) {
                  btnClass = "bg-[#fff0f3] border-[#f29eb5] text-[#b43e62]";
                } else {
                  btnClass = "opacity-50 bg-white border-[#eee]";
                }
              }

              return (
                <button
                  key={option}
                  type="button"
                  disabled={isAnswered}
                  onClick={() => handleSelect(option)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all font-black text-lg ${btnClass}`}
                >
                  <span className="text-xl">
                    {noteData ? getNoteLabel(noteData, notationSystem) : option}
                  </span>
                  <span className="text-[10px] text-[#9c91a5] font-semibold mt-1">
                    {noteData?.octave ? `Oktave ${noteData.octave}` : ""}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback & Continue */}
          {isAnswered && (
            <div className="rounded-2xl p-4 bg-[#f8f5fb] border border-[#ebdff0] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-3">
                {selectedOption === currentQ.targetNoteId ? (
                  <CheckCircle2 size={24} className="text-[#49b380] shrink-0" />
                ) : (
                  <XCircle size={24} className="text-[#d8587d] shrink-0" />
                )}
                <div>
                  <strong className="text-sm text-[#30263f] block">
                    {selectedOption === currentQ.targetNoteId
                      ? "Ausgezeichnet gelöst! +20 Punkte"
                      : `Nicht ganz. Richtig war ${getNoteLabel(currentQ.targetNoteId, notationSystem)}.`}
                  </strong>
                  <p className="text-xs text-[#827690] m-0 mt-0.5">
                    {currentQ.explanation}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#302942] hover:bg-[#473656] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 shrink-0"
              >
                {currentIdx < SAMPLE_QUESTIONS.length - 1 ? (
                  <>Weiter zur nächsten Frage <ArrowRight size={16} /></>
                ) : (
                  <>Ergebnis anzeigen <Trophy size={16} /></>
                )}
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Finished Screen */
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-[#fff2db] text-[#dca64f] shadow-md mb-4 transform -rotate-3">
            <Trophy size={42} />
          </div>
          <h3 className="text-2xl font-black text-[#2e263c] mb-1">
            Lernkontrolle abgeschlossen!
          </h3>
          <p className="text-sm text-[#7f738c] max-w-md mx-auto mb-6">
            Du hast <strong className="text-[#de628e]">{score} von {SAMPLE_QUESTIONS.length * 20} Punkten</strong> erzielt.
            {score >= 100
              ? " Großartig! Du hast das Gehör eines echten Konzertmeisters!"
              : " Ein starker Auftritt! Übe weiter fleißig, um noch treffsicherer zu werden."}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="px-5 py-3 rounded-xl bg-white border border-[#e4dbe8] text-[#554865] hover:bg-[#faf6fc] font-bold text-xs flex items-center gap-2"
            >
              <RotateCcw size={16} /> Nochmal versuchen
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ed78a0] to-[#d8618a] text-white font-black text-xs flex items-center gap-2 shadow-md hover:scale-105 transition-transform"
              >
                Zurück zur Übersicht <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

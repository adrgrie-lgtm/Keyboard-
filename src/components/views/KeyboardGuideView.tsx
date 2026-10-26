import React, { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Headphones,
  HelpCircle,
  Keyboard,
  Lightbulb,
  Mic,
  Music2,
  Sliders,
  Sparkles,
  Volume2,
} from "lucide-react";
import { playNote } from "../../lib/audio";
import { WHITE_NOTES, getNoteLabel } from "../../lib/music-data";
import type { Lesson, NotationSystem } from "../../types/music";

interface KeyboardGuideViewProps {
  notationSystem: NotationSystem;
  onStartFirstLesson: () => void;
}

export const KeyboardGuideView: React.FC<KeyboardGuideViewProps> = ({
  notationSystem,
  onStartFirstLesson,
}) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const keyItems = [
    { name: "C", num: "1", noteId: "C4", desc: "Der Heimatton. Sitzt links neben den 2 schwarzen Tasten." },
    { name: "D", num: "2", noteId: "D4", desc: "Liegt genau mittig zwischen den zwei schwarzen Tasten wie in einer Garage." },
    { name: "E", num: "3", noteId: "E4", desc: "Liegt rechts neben den zwei schwarzen Tasten." },
    { name: "F", num: "4", noteId: "F4", desc: "Startet vor den DREI schwarzen Tasten." },
    { name: "G", num: "5", noteId: "G4", desc: "Zentraler Ton, nach dem der Violinschlüssel (G-Schlüssel) benannt ist." },
    { name: "A", num: "6", noteId: "A4", desc: "Der berühmte Kammerton (440 Hz), nach dem alle Orchester stimmen." },
    { name: "H / B", num: "7", noteId: "B4", desc: "Der siebte Ton direkt vor dem nächsten C." },
  ];

  const handleKeyClick = (noteId: string) => {
    playNote(noteId, "piano", 0.7);
    setActiveKey(noteId);
    setTimeout(() => setActiveKey(null), 350);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[#e16e96] text-xs font-black tracking-widest uppercase">
            <span className="w-4 h-0.5 rounded bg-[#e781a3]" />
            DEIN INSTRUMENT VERSTEHEN
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#302941] tracking-tight mt-1 mb-1">
            Lern dein Keyboard kennen.
          </h1>
          <p className="text-sm text-[#898396]">
            Alles, was du für die ersten Töne auf deinem rosa Keyboard wissen musst.
          </p>
        </div>

        <button
          type="button"
          onClick={onStartFirstLesson}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#302942] hover:bg-[#493858] text-white text-xs font-black shadow-md transition-all"
        >
          Erste Lektion starten <ArrowRight size={16} />
        </button>
      </div>

      {/* Hero Welcome Card */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ebdff8] via-[#f5ebf7] to-[#ffeef4] border border-[#ecd9ec] p-7 sm:p-9 shadow-sm">
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/80 border border-white text-[#8d74ac] text-[10px] font-black tracking-widest uppercase mb-3">
            <Sparkles size={14} className="text-[#e57ea1]" />
            DEIN TREUER MUSIKBEGLEITER
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-[#302942] tracking-tight leading-snug mb-2">
            Hallo, kleines Keyboard!
          </h2>

          <p className="text-xs sm:text-sm text-[#756d87] leading-relaxed mb-6">
            Auf deinem Keyboard stehen oft Buchstaben und Zahlen (1 bis 7) direkt auf den weißen Tasten.
            Genau diese einfachen Kennzeichnungen nutzen wir zusammen – ganz ohne komplizierte Vorkenntnisse!
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onStartFirstLesson}
              className="px-6 py-3 rounded-xl bg-[#302942] hover:bg-[#493756] text-white text-xs font-black shadow-md transition-all"
            >
              Jetzt loslegen <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* 3 Steps to First Sound */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#d6688e]">
          SO EINFACH GEHT'S
        </div>
        <h2 className="text-xl font-black text-[#2f273b] m-0">
          In 3 einfachen Schritten zum ersten Ton
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 rounded-3xl bg-white border border-[#eeebf0] shadow-sm relative">
            <span className="absolute top-5 right-5 text-xl font-black text-[#ebdbe5]">01</span>
            <div className="w-11 h-11 rounded-2xl bg-[#fff0f5] text-[#df7498] flex items-center justify-center mb-4">
              <Sliders size={22} />
            </div>
            <h3 className="text-base font-black text-[#2e263d] m-0 mb-1.5">
              1. Keyboard einschalten
            </h3>
            <p className="text-xs text-[#8c8296] leading-relaxed m-0">
              Schiebe den <strong>POWER</strong>-Schalter auf ON. Stelle die Lautstärke (VOLUME) am Anfang gemütlich leise ein.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#eeebf0] shadow-sm relative">
            <span className="absolute top-5 right-5 text-xl font-black text-[#ebdbe5]">02</span>
            <div className="w-11 h-11 rounded-2xl bg-[#f4edfd] text-[#9375c3] flex items-center justify-center mb-4">
              <Keyboard size={22} />
            </div>
            <h3 className="text-base font-black text-[#2e263d] m-0 mb-1.5">
              2. Das Schloss-C finden
            </h3>
            <p className="text-xs text-[#8c8296] leading-relaxed m-0">
              Suche zwei schwarze Tasten nebeneinander. Die weiße Taste direkt links daneben ist immer das <strong>C</strong> (Taste 1).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-[#eeebf0] shadow-sm relative">
            <span className="absolute top-5 right-5 text-xl font-black text-[#ebdbe5]">03</span>
            <div className="w-11 h-11 rounded-2xl bg-[#e7f8f1] text-[#55ab8d] flex items-center justify-center mb-4">
              <Music2 size={22} />
            </div>
            <h3 className="text-base font-black text-[#2e263d] m-0 mb-1.5">
              3. Einfach losklimpern
            </h3>
            <p className="text-xs text-[#8c8296] leading-relaxed m-0">
              Drücke C, D und E nacheinander. Oder starte Lektion 1 und lass dich Schritt für Schritt von der App begleiten.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Key Explorer */}
      <section className="bg-white rounded-3xl border border-[#eeebf0] p-6 sm:p-7 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#f3edf5]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#d6688e]">
              INTERAKTIVER TASTEN-EXPLORER
            </span>
            <h3 className="text-lg font-black text-[#2e263d] m-0">
              Ein Buchstabe · Eine Zahl · Ein Ton
            </h3>
            <p className="text-xs text-[#8d8296] mt-0.5">
              Tippe eine Taste an, um ihren Klang und ihre Besonderheit kennenzulernen.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {keyItems.map((item) => {
            const isPlaying = activeKey === item.noteId;

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => handleKeyClick(item.noteId)}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-between min-h-[140px] hover:translate-y-[-2px] ${
                  isPlaying
                    ? "bg-[#fff0f5] border-[#f1adc6] ring-2 ring-[#ffdbe8] scale-102"
                    : "bg-[#fffdfd] border-[#ede7ef] hover:border-[#f1adc6]"
                }`}
              >
                <span className="w-6 h-6 rounded-full bg-[#f8f3fa] text-[#d65f8a] text-xs font-black flex items-center justify-center">
                  {item.num}
                </span>

                <div className="my-2">
                  <strong className="text-2xl font-black text-[#2e263d] block">
                    {item.name}
                  </strong>
                  <span className="text-[10px] text-[#9b90a3] font-semibold mt-0.5 block">
                    Tippen & hören
                  </span>
                </div>

                <div className="w-2 h-2 rounded-full bg-[#e8a3be]" />
              </button>
            );
          })}
        </div>

        {/* German H vs English B explanation box */}
        <div className="p-4 rounded-2xl bg-[#fff8eb] border border-[#fae8c8] flex items-start gap-3">
          <Lightbulb size={20} className="text-[#d89f4b] shrink-0 mt-0.5" />
          <div className="text-xs text-[#867560] leading-relaxed">
            <strong className="text-[#322718] font-bold block mb-0.5">
              Gut zu wissen: Warum heißt die 7. Taste manchmal H und manchmal B?
            </strong>
            Im deutschen Sprachraum heißen die Töne C-D-E-F-G-A-<strong>H</strong>. Auf den allermeisten elektronischen Keyboards steht jedoch das internationale <strong>B</strong> für genau denselben Ton.
            Der Grund liegt in einem 500 Jahre alten Schreibfehler mittelalterlicher Mönche! Du kannst in den Einstellungen oben jederzeit zwischen beiden Schreibweisen wechseln.
          </div>
        </div>
      </section>

      {/* Guide Cards: Hand placement & Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Handhaltung */}
        <div className="p-6 rounded-3xl bg-white border border-[#eeebf0] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#f4edfd] text-[#9375c3] flex items-center justify-center font-bold">
            <Sparkles size={20} />
          </div>
          <h3 className="text-base font-black text-[#2e263d] m-0">
            Die geheime Handhaltung: Die kleine Mandarine
          </h3>
          <p className="text-xs text-[#83778f] leading-relaxed">
            Stell dir vor, du hältst eine kleine, zarte Mandarine oder einen Tischtennisball ganz locker in deiner Hand.
            Deine Finger sind sanft gewölbt wie ein kleines Dach, und du drückst die Tasten mit den weichen Fingerkuppen – nicht mit flachen Fingern!
          </p>
        </div>

        {/* Card 2: Finger Nummern */}
        <div className="p-6 rounded-3xl bg-white border border-[#eeebf0] shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#fff0f5] text-[#e06892] flex items-center justify-center font-bold">
            <CheckCircle2 size={20} />
          </div>
          <h3 className="text-base font-black text-[#2e263d] m-0">
            Die Fingersatz-Regel (1 bis 5)
          </h3>
          <p className="text-xs text-[#83778f] leading-relaxed">
            In allen Klaviernoten der Welt haben die Finger Nummern:
            <strong> 1 = Daumen, 2 = Zeigefinger, 3 = Mittelfinger, 4 = Ringfinger, 5 = kleiner Finger.</strong>{" "}
            Wenn du Finger 1 auf das C legst, liegt jeder Finger ganz von alleine auf seiner eigenen Taste!
          </p>
        </div>
      </div>
    </div>
  );
};

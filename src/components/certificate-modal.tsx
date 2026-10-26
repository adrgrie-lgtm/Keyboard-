import React, { useRef } from "react";
import { Award, Printer, X, Sparkles, CheckCircle2, Star } from "lucide-react";

interface CertificateModalProps {
  studentName: string;
  completedLessonsCount: number;
  totalLessonsCount: number;
  onClose: () => void;
  onNameChange: (newName: string) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  studentName,
  completedLessonsCount,
  totalLessonsCount,
  onClose,
  onNameChange,
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const today = new Date().toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const levelTitle =
    completedLessonsCount >= 16
      ? "Großer Konzertmeister & Tastenvirtuose"
      : completedLessonsCount >= 12
      ? "Klavier-Meister (Stufe 3)"
      : completedLessonsCount >= 8
      ? "Melodie-Macher & Taktkünstler (Stufe 2)"
      : completedLessonsCount >= 4
      ? "Tasten-Entdecker (Stufe 1)"
      : "Startklarer Nachwuchs-Pianist";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#ebdff0] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f3edf5] bg-[#fffafc]">
          <div className="flex items-center gap-2">
            <Award className="text-[#de628e]" size={20} />
            <h3 className="text-base font-black text-[#2e263d] m-0">
              Deine persönliche Musikurkunde
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#f3eef4] text-[#8e8499] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Certificate container (print area) */}
        <div className="p-6 overflow-y-auto">
          {/* Name customization input */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-[#fdf5f8] p-3 rounded-2xl border border-[#f5dce6]">
            <label className="text-xs font-bold text-[#8f4763] flex items-center gap-1.5">
              <span>Name auf der Urkunde:</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => onNameChange(e.target.value)}
                placeholder="Dein Name"
                className="bg-white border border-[#f0c2d3] rounded-lg px-2.5 py-1 text-xs font-bold text-[#30263f] focus:outline-none focus:ring-2 focus:ring-[#ed78a0]"
              />
            </label>
            <button
              onClick={handlePrint}
              type="button"
              className="px-3.5 py-1.5 rounded-xl bg-[#302942] hover:bg-[#4a395b] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
            >
              <Printer size={15} /> Urkunde drucken
            </button>
          </div>

          {/* Styled Diploma Certificate */}
          <div
            ref={certificateRef}
            className="relative bg-gradient-to-br from-[#fffdfa] via-[#ffffff] to-[#fff8fb] rounded-2xl border-[6px] border-[#eedac4] p-8 text-center shadow-inner print:m-0 print:border-[8px] print:p-12 print:shadow-none"
          >
            {/* Ornamental Corners */}
            <div className="absolute top-2 left-2 text-[#d8ad7b] text-xl font-serif select-none">❧</div>
            <div className="absolute top-2 right-2 text-[#d8ad7b] text-xl font-serif select-none">☙</div>
            <div className="absolute bottom-2 left-2 text-[#d8ad7b] text-xl font-serif select-none">❧</div>
            <div className="absolute bottom-2 right-2 text-[#d8ad7b] text-xl font-serif select-none">☙</div>

            {/* Inner dashed ring */}
            <div className="border border-dashed border-[#e6c8a7] rounded-xl p-6">
              <div className="flex items-center justify-center gap-1.5 text-[#de628e] text-xs font-black tracking-widest uppercase mb-1">
                <Sparkles size={14} /> Musikalische Auszeichnung <Sparkles size={14} />
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-[#2e263d] tracking-tight mb-1">
                klimper. Meisterbrief
              </h2>
              <p className="text-xs text-[#9c91a3] font-serif italic mb-6">
                Offizielles Ehren-Diplom für herausragende Tastenfreude
              </p>

              <div className="my-4">
                <span className="text-xs uppercase font-extrabold tracking-widest text-[#a89fad] block mb-1">
                  Diese Urkunde wird verliehen an
                </span>
                <span className="text-3xl sm:text-4xl font-black text-[#d85885] underline decoration-[#f8bfd4] decoration-4 underline-offset-8">
                  {studentName || "Kleiner Musikstar"}
                </span>
              </div>

              <p className="text-sm text-[#5d5469] max-w-md mx-auto my-6 leading-relaxed">
                für die erfolgreiche Erarbeitung und das Meistern von{" "}
                <strong className="text-[#322741] font-black">{completedLessonsCount} von {totalLessonsCount} Lektionen</strong>{" "}
                auf dem Keyboard sowie das fehlerfreie Nachspielen schöner Melodien.
              </p>

              {/* Awarded rank badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#fff2db] border border-[#f5dcad] text-[#8e6022] font-black text-sm mb-6">
                <Star size={18} className="text-[#e29d3b] fill-[#e29d3b]" />
                <span>{levelTitle}</span>
              </div>

              {/* Signatures & Seal */}
              <div className="flex items-end justify-between pt-6 border-t border-[#f0e4d7] mt-4 text-left">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#aaa0b1] block">Datum</span>
                  <span className="text-xs font-bold text-[#453c52]">{today}</span>
                </div>

                {/* Gold Seal Graphic */}
                <div className="relative flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#e5a952] to-[#f7d68a] text-white flex items-center justify-center shadow-md border-2 border-white">
                    <Award size={28} />
                  </div>
                  <span className="text-[9px] font-black tracking-widest uppercase text-[#be8532] mt-1">
                    KLIMPER SIEGEL
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-[#aaa0b1] block">Musikstudio</span>
                  <span className="text-xs font-black text-[#de628e] font-sans">klimper. Musikschule</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

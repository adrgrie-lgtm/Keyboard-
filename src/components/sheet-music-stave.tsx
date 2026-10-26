import React from "react";
import { NOTE_BY_ID, getNoteLabel } from "../lib/music-data";
import type { NotationSystem } from "../types/music";

interface SheetMusicStaveProps {
  currentNoteId: string | null;
  targetNoteId?: string | null;
  notationSystem?: NotationSystem;
  noteSequence?: string[];
  currentIndex?: number;
  compact?: boolean;
}

export const SheetMusicStave: React.FC<SheetMusicStaveProps> = ({
  currentNoteId,
  targetNoteId,
  notationSystem = "deutsch",
  noteSequence,
  currentIndex = 0,
  compact = false,
}) => {
  // Stave line Y coordinates (total viewBox 100 height, lines at 25, 35, 45, 55, 65)
  // Line 5 (top) = F5 (pos 8) => Y = 25
  // Line 4 = D5 (pos 6) => Y = 35
  // Line 3 = B4 / H4 (pos 4) => Y = 45
  // Line 2 = G4 (pos 2) => Y = 55
  // Line 1 (bottom) = E4 (pos 0) => Y = 65
  // D4 (pos -1) => space below line 1 => Y = 70
  // C4 (pos -2) => ledger line below line 1 => Y = 75

  const calculateY = (pos: number): number => {
    // Each stavePosition step is 5 units (half-line/space)
    // pos 0 (E4) is at Y = 65
    return 65 - pos * 5;
  };

  // If a sequence is provided, show upcoming notes
  const sequenceToShow = noteSequence
    ? noteSequence.slice(Math.max(0, currentIndex - 1), Math.min(noteSequence.length, currentIndex + 7))
    : [];
  const offsetIndex = Math.max(0, currentIndex - 1);

  return (
    <div className={`relative w-full rounded-2xl bg-white border border-[#eeeaf0] p-4 shadow-sm select-none transition-all ${compact ? "py-2.5" : "py-4"}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-[#ed78a0]"></span>
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#a59ea9]">
            Interaktive Notenlinien
          </span>
        </div>
        {targetNoteId && NOTE_BY_ID[targetNoteId] && (
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#fff0f5] text-[#d65c89]">
            Zielnote: {getNoteLabel(NOTE_BY_ID[targetNoteId], notationSystem)}
          </span>
        )}
      </div>

      <div className="relative w-full overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 600 110"
          className="w-full h-auto max-h-[110px]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stave 5 lines */}
          <line x1="20" y1="25" x2="580" y2="25" stroke="#ded8e2" strokeWidth="1.5" />
          <line x1="20" y1="35" x2="580" y2="35" stroke="#ded8e2" strokeWidth="1.5" />
          <line x1="20" y1="45" x2="580" y2="45" stroke="#ded8e2" strokeWidth="1.5" />
          <line x1="20" y1="55" x2="580" y2="55" stroke="#ded8e2" strokeWidth="1.5" />
          <line x1="20" y1="65" x2="580" y2="65" stroke="#ded8e2" strokeWidth="1.5" />

          {/* Bar lines at ends */}
          <line x1="20" y1="25" x2="20" y2="65" stroke="#cbbecf" strokeWidth="2" />
          <line x1="575" y1="25" x2="575" y2="65" stroke="#cbbecf" strokeWidth="2" />
          <line x1="580" y1="25" x2="580" y2="65" stroke="#cbbecf" strokeWidth="3" />

          {/* Treble Clef (G-Schlüssel) rendered path */}
          <g transform="translate(32, 12) scale(0.65)">
            <path
              d="M24 68 C22 66, 17 62, 18 55 C19 46, 27 44, 31 46 C36 49, 37 54, 35 59 C33 63, 27 64, 25 61 C23 58, 25 54, 29 54 C31 54, 31 56, 30 57 C29 57, 28 56, 27 55 C25 56, 25 60, 27 61 C29 62, 33 61, 33 57 C33 51, 26 48, 21 52 C17 56, 16 63, 20 68 C24 73, 31 73, 35 69 C39 64, 40 57, 39 50 C38 43, 35 34, 33 25 C32 17, 34 8, 38 4 C41 1, 45 3, 44 8 C43 17, 38 35, 34 52 C32 60, 31 69, 32 77 C33 86, 35 94, 31 99 C27 104, 19 104, 17 99 C15 95, 17 90, 21 90 C25 90, 26 94, 24 97 C22 98, 20 97, 19 96"
              stroke="#544860"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>

          {/* Time Signature (4/4) */}
          <text x="82" y="44" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="18" fill="#80728c">4</text>
          <text x="82" y="64" fontFamily="Nunito, sans-serif" fontWeight="900" fontSize="18" fill="#80728c">4</text>

          {/* Notes display */}
          {sequenceToShow.length > 0 ? (
            sequenceToShow.map((nId, idx) => {
              const actualIdx = offsetIndex + idx;
              const isTarget = actualIdx === currentIndex;
              const isPast = actualIdx < currentIndex;
              const noteData = NOTE_BY_ID[nId];
              if (!noteData) return null;

              const x = 140 + idx * 56;
              const y = calculateY(noteData.stavePosition);
              const needsLedgerC4 = noteData.stavePosition <= -2; // C4 or below
              const needsLedgerA5 = noteData.stavePosition >= 10; // A5 or above

              return (
                <g key={`${nId}-${idx}`} className="transition-all duration-200">
                  {/* Ledger lines (Hilfslinien) */}
                  {needsLedgerC4 && (
                    <line x1={x - 14} y1={75} x2={x + 14} y2={75} stroke={isTarget ? "#e5729a" : "#b0a5b8"} strokeWidth="1.6" />
                  )}
                  {needsLedgerA5 && (
                    <line x1={x - 14} y1={15} x2={x + 14} y2={15} stroke={isTarget ? "#e5729a" : "#b0a5b8"} strokeWidth="1.6" />
                  )}

                  {/* Target glow ring */}
                  {isTarget && (
                    <circle cx={x} cy={y} r="15" fill="#fce4ee" fillOpacity="0.8" className="animate-pulse" />
                  )}

                  {/* Note head (oval tilted) */}
                  <ellipse
                    cx={x}
                    cy={y}
                    rx="8"
                    ry="6"
                    transform={`rotate(-20 ${x} ${y})`}
                    fill={isTarget ? "#e5729a" : isPast ? "#88cbb0" : "#4c3e58"}
                    stroke={isTarget ? "#be4770" : "none"}
                    strokeWidth={isTarget ? 1.5 : 0}
                  />

                  {/* Stem (Notenhals) */}
                  {noteData.stavePosition < 4 ? (
                    <line x1={x + 6} y1={y} x2={x + 6} y2={y - 28} stroke={isTarget ? "#e5729a" : isPast ? "#88cbb0" : "#4c3e58"} strokeWidth="1.8" />
                  ) : (
                    <line x1={x - 6} y1={y} x2={x - 6} y2={y + 28} stroke={isTarget ? "#e5729a" : isPast ? "#88cbb0" : "#4c3e58"} strokeWidth="1.8" />
                  )}

                  {/* Note label below stave */}
                  <text
                    x={x}
                    y="102"
                    textAnchor="middle"
                    fontFamily="Nunito, sans-serif"
                    fontWeight={isTarget ? "900" : "700"}
                    fontSize={isTarget ? "12" : "10"}
                    fill={isTarget ? "#be4770" : isPast ? "#59af87" : "#8d8199"}
                  >
                    {getNoteLabel(noteData, notationSystem)}
                  </text>
                </g>
              );
            })
          ) : (
            /* Single Target / Active note representation */
            targetNoteId && NOTE_BY_ID[targetNoteId] && (() => {
              const noteData = NOTE_BY_ID[targetNoteId];
              const x = 300;
              const y = calculateY(noteData.stavePosition);
              const needsLedgerC4 = noteData.stavePosition <= -2;

              return (
                <g>
                  {needsLedgerC4 && (
                    <line x1={x - 22} y1={75} x2={x + 22} y2={75} stroke="#e5729a" strokeWidth="2" />
                  )}
                  <circle cx={x} cy={y} r="22" fill="#ffe3ef" className="animate-ping opacity-30" />
                  <ellipse
                    cx={x}
                    cy={y}
                    rx="11"
                    ry="8"
                    transform={`rotate(-20 ${x} ${y})`}
                    fill="#e5729a"
                  />
                  {noteData.stavePosition < 4 ? (
                    <line x1={x + 9} y1={y} x2={x + 9} y2={y - 36} stroke="#e5729a" strokeWidth="2.5" />
                  ) : (
                    <line x1={x - 9} y1={y} x2={x - 9} y2={y + 36} stroke="#e5729a" strokeWidth="2.5" />
                  )}
                  <text
                    x={x}
                    y="102"
                    textAnchor="middle"
                    fontFamily="Nunito, sans-serif"
                    fontWeight="900"
                    fontSize="14"
                    fill="#be4770"
                  >
                    {getNoteLabel(noteData, notationSystem)}
                  </text>
                </g>
              );
            })()
          )}
        </svg>
      </div>
    </div>
  );
};

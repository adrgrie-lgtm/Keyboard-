import React, { type CSSProperties } from "react";
import { BLACK_NOTES, WHITE_NOTES, NOTE_BY_ID, getNoteLabel } from "../lib/music-data";
import type { NotationSystem } from "../types/music";

export interface PianoKeyboardProps {
  onPress: (noteId: string) => void;
  activeNote?: string | null;
  targetNote?: string | null;
  whiteCount?: 8 | 15;
  showNames?: boolean;
  showNumbers?: boolean;
  showShortcuts?: boolean;
  notationSystem?: NotationSystem;
  compact?: boolean;
  lcdMessage?: string;
  isMetronomeActive?: boolean;
}

export const PianoKeyboard: React.FC<PianoKeyboardProps> = ({
  onPress,
  activeNote,
  targetNote,
  whiteCount = 8,
  showNames = true,
  showNumbers = true,
  showShortcuts = false,
  notationSystem = "deutsch",
  compact = false,
  lcdMessage = "LET'S PLAY",
  isMetronomeActive = false,
}) => {
  // If whiteCount is 8, use C4 to C5 (middle octave)
  // If whiteCount is 15, use C4 to C6 (two full octaves)
  const startIndex = whiteCount === 8 ? 4 : 4; // C4 is index 4 in WHITE_NOTES
  const whiteNotes = WHITE_NOTES.slice(startIndex, startIndex + whiteCount);

  // Filter black notes that belong between these white keys
  const whiteIds = new Set(whiteNotes.map((n) => n.id));
  const blackNotes = BLACK_NOTES.filter((b) => {
    // If whiteCount is 8: C#4, D#4, F#4, G#4, A#4
    if (whiteCount === 8) {
      return ["C#4", "D#4", "F#4", "G#4", "A#4"].includes(b.id);
    }
    // If whiteCount is 15: include octave 4 and 5
    return ["C#4", "D#4", "F#4", "G#4", "A#4", "C#5", "D#5", "F#5", "G#5", "A#5"].includes(b.id);
  });

  const activeNoteData = activeNote ? NOTE_BY_ID[activeNote] : null;

  return (
    <div className={`piano-shell ${compact ? "piano-shell-compact" : ""}`}>
      {/* Top Console Bar */}
      <div className="piano-console" aria-hidden="true">
        {/* Left Speaker */}
        <div className="piano-speaker">
          <span /><span /><span /><span /><span />
        </div>

        {/* Center LCD & Controls */}
        <div className="piano-console-center">
          <div className="piano-lcd">
            <span className="text-[#f6b6cb] font-bold">♫</span>{" "}
            {activeNoteData ? (
              <span className="text-[#ffd6e6] font-black tracking-widest">
                {getNoteLabel(activeNoteData, notationSystem)}
              </span>
            ) : (
              <span>{lcdMessage}</span>
            )}
          </div>
          <div className="piano-console-controls">
            <i className={isMetronomeActive ? "bg-[#ff7aa4] animate-ping" : ""} title="Status" />
            <i />
            <i />
          </div>
        </div>

        {/* Right Speaker */}
        <div className="piano-speaker">
          <span /><span /><span /><span /><span />
        </div>
      </div>

      {/* Keyboard Area */}
      <div className="keyboard-scroll">
        <div className={`piano-keys ${whiteCount === 15 ? "piano-keys-wide" : ""}`}>
          {/* White Keys */}
          <div className="white-key-row">
            {whiteNotes.map((note) => {
              const isPlaying = activeNote === note.id;
              const isTarget = targetNote === note.id;
              const label = getNoteLabel(note, notationSystem);

              return (
                <button
                  key={note.id}
                  type="button"
                  className={`white-key ${isPlaying ? "is-playing" : ""} ${isTarget ? "is-target" : ""}`}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    onPress(note.id);
                  }}
                  aria-label={`Taste ${label}${note.number ? `, Nummer ${note.number}` : ""}`}
                >
                  {showNumbers && note.number && (
                    <span className="key-number">{note.number}</span>
                  )}
                  <span className="key-bottom">
                    {showNames && <span className="key-name">{label}</span>}
                    {showShortcuts && note.shortcut && (
                      <span className="key-shortcut">{note.shortcut}</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Black Keys */}
          {blackNotes.map((note) => {
            const isPlaying = activeNote === note.id;
            const isTarget = targetNote === note.id;
            const label = getNoteLabel(note, notationSystem);

            // Compute relative horizontal position based on the corresponding white key
            // For whiteCount=8, keys are C4(0), D4(1), E4(2), F4(3), G4(4), A4(5), B4(6), C5(7)
            let relativeWhiteIndex = 0;
            if (note.id === "C#4") relativeWhiteIndex = 0;
            else if (note.id === "D#4") relativeWhiteIndex = 1;
            else if (note.id === "F#4") relativeWhiteIndex = 3;
            else if (note.id === "G#4") relativeWhiteIndex = 4;
            else if (note.id === "A#4") relativeWhiteIndex = 5;
            else if (note.id === "C#5") relativeWhiteIndex = 7;
            else if (note.id === "D#5") relativeWhiteIndex = 8;
            else if (note.id === "F#5") relativeWhiteIndex = 10;
            else if (note.id === "G#5") relativeWhiteIndex = 11;
            else if (note.id === "A#5") relativeWhiteIndex = 12;

            const leftPercent = ((relativeWhiteIndex + 1) / whiteCount) * 100;

            return (
              <button
                key={note.id}
                type="button"
                className={`black-key ${isPlaying ? "is-playing" : ""} ${isTarget ? "is-target" : ""}`}
                style={{ left: `${leftPercent}%` } as CSSProperties}
                onPointerDown={(e) => {
                  e.preventDefault();
                  onPress(note.id);
                }}
                aria-label={`Schwarze Taste ${label}`}
                title={label}
              >
                {showShortcuts && note.shortcut ? (
                  <span>{note.shortcut}</span>
                ) : showNames ? (
                  <span className="text-[9px] font-bold tracking-tighter opacity-80">{label}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="piano-front-edge" aria-hidden="true" />
    </div>
  );
};

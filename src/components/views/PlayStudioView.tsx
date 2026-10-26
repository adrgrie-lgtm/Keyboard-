import React, { useState, useRef, useEffect } from "react";
import {
  ArrowRight,
  AudioLines,
  BookOpen,
  CheckCircle2,
  Disc3,
  Heart,
  Keyboard,
  Music2,
  Pause,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { PianoKeyboard } from "../piano-keyboard";
import { SheetMusicStave } from "../sheet-music-stave";
import { playNote, playSuccessChime } from "../../lib/audio";
import { SONGS, NOTE_BY_ID, getNoteLabel } from "../../lib/music-data";
import type { Instrument, NotationSystem, RecordedSong, Song, UserProgress } from "../../types/music";

interface PlayStudioViewProps {
  progress: UserProgress;
  onSaveRecording: (recording: RecordedSong) => void;
  onDeleteRecording: (id: string) => void;
  onUpdateNotation: (system: NotationSystem) => void;
  onPlayNoteRecord: (noteId: string) => void;
}

export const PlayStudioView: React.FC<PlayStudioViewProps> = ({
  progress,
  onSaveRecording,
  onDeleteRecording,
  onUpdateNotation,
  onPlayNoteRecord,
}) => {
  const [instrument, setInstrument] = useState<Instrument>("piano");
  const [volume, setVolume] = useState<number>(0.7);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [whiteCount, setWhiteCount] = useState<8 | 15>(15);
  const [showShortcuts, setShowShortcuts] = useState(true);

  // Guided Song follow-along state
  const [guidedSong, setGuidedSong] = useState<Song | null>(null);
  const [guidedStep, setGuidedStep] = useState(0);
  const [guidedFinished, setGuidedFinished] = useState(false);

  // Demo playback
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const demoRunRef = useRef(0);

  // Recorder state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<string[]>([]);
  const [recordingTitle, setRecordingTitle] = useState("");
  const recordingStartRef = useRef<number | null>(null);

  const activeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopDemo = () => {
    demoRunRef.current += 1;
    setIsDemoPlaying(false);
    setPlayingSongId(null);
    setActiveNote(null);
  };

  const playDemo = async (notes: string[], songId?: string, bpm = 90) => {
    if (isDemoPlaying) {
      stopDemo();
      return;
    }
    const run = ++demoRunRef.current;
    setIsDemoPlaying(true);
    if (songId) setPlayingSongId(songId);

    const speed = Math.max(300, Math.min(650, Math.round(60000 / bpm)));

    for (let i = 0; i < notes.length; i++) {
      if (demoRunRef.current !== run) return;
      const nId = notes[i];
      setActiveNote(nId);
      playNote(nId, instrument, volume, 0.8);
      await new Promise((res) => setTimeout(res, speed));
    }

    if (demoRunRef.current === run) {
      setIsDemoPlaying(false);
      setPlayingSongId(null);
      setActiveNote(null);
    }
  };

  const handleNote = (noteId: string) => {
    if (!NOTE_BY_ID[noteId]) return;
    playNote(noteId, instrument, volume);
    setActiveNote(noteId);
    onPlayNoteRecord(noteId);

    if (activeTimerRef.current) clearTimeout(activeTimerRef.current);
    activeTimerRef.current = setTimeout(() => setActiveNote(null), 350);

    // If recording
    if (isRecording) {
      setRecordedNotes((prev) => [...prev, noteId]);
    }

    // If in guided song mode
    if (guidedSong && !guidedFinished) {
      const expected = guidedSong.notes[guidedStep];
      if (noteId === expected) {
        if (guidedStep === guidedSong.notes.length - 1) {
          setGuidedFinished(true);
          playSuccessChime();
        } else {
          setGuidedStep((s) => s + 1);
        }
      }
    }
  };

  // Keyboard shortcut listener
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
      y: "G#4",
      h: "A4",
      u: "A#4",
      j: "B4",
      k: "C5",
      o: "C#5",
      l: "D5",
      p: "D#5",
      ö: "E5",
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (["INPUT", "TEXTAREA"].includes(tag) || e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
      const mapped = keyMap[e.key.toLowerCase()];
      if (mapped) {
        e.preventDefault();
        handleNote(mapped);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const startGuided = (song: Song) => {
    stopDemo();
    setGuidedSong(song);
    setGuidedStep(0);
    setGuidedFinished(false);
    document.getElementById("studio-keyboard-anchor")?.scrollIntoView({ behavior: "smooth" });
  };

  const startRecording = () => {
    stopDemo();
    setRecordedNotes([]);
    setIsRecording(true);
    recordingStartRef.current = Date.now();
  };

  const finishRecording = () => {
    setIsRecording(false);
    const duration = recordingStartRef.current
      ? Math.max(1, Math.round((Date.now() - recordingStartRef.current) / 1000))
      : 3;
    const title = recordingTitle.trim() || `Mein Stück #${progress.recordings.length + 1}`;

    const newSong: RecordedSong = {
      id: "rec-" + Date.now(),
      title,
      date: new Date().toLocaleDateString("de-DE"),
      notes: recordedNotes,
      durationSeconds: duration,
      instrument,
    };

    onSaveRecording(newSong);
    setRecordingTitle("");
  };

  const currentTargetNote = guidedSong && !guidedFinished ? guidedSong.notes[guidedStep] : null;

  return (
    <div className="space-y-8 animate-fade-in" id="studio-keyboard-anchor">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-[#e16e96] text-xs font-black tracking-widest uppercase">
            <span className="w-4 h-0.5 rounded bg-[#e781a3]" />
            DEIN KLEINES MUSIKSTUDIO
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#302941] tracking-tight mt-1 mb-1">
            Spiel, was dein Herz hört. <span className="text-[#e8a0ba] font-serif">♫</span>
          </h1>
          <p className="text-sm text-[#898396]">
            Wähle dein Lieblingsinstrument, spiele bekannte Hits mit oder nimm eigene Ideen auf.
          </p>
        </div>

        {/* Notation System Selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-white border border-[#eeeaf0] p-1 rounded-2xl shadow-sm text-xs font-bold">
          <span className="text-[10px] uppercase font-black text-[#9e94a6] px-2">Noten:</span>
          {(["deutsch", "international", "solfege"] as NotationSystem[]).map((sys) => (
            <button
              key={sys}
              type="button"
              onClick={() => onUpdateNotation(sys)}
              className={`px-3 py-1 rounded-xl capitalize transition-all ${
                progress.notationSystem === sys
                  ? "bg-[#302942] text-white shadow-sm font-black"
                  : "text-[#7f748d] hover:text-[#2d263d]"
              }`}
            >
              {sys === "deutsch" ? "Deutsch (H)" : sys === "international" ? "Inter. (B)" : "Do-Re-Mi"}
            </button>
          ))}
        </div>
      </div>

      {/* Studio Piano Console */}
      <section className="bg-white rounded-3xl border border-[#eeebf0] p-6 sm:p-7 shadow-sm space-y-5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#f3edf5]">
          {/* Instrument Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#a59ea9] mr-1">
              KLANG:
            </span>
            {(
              [
                { id: "piano", label: "Flügel" },
                { id: "bell", label: "Spieluhr" },
                { id: "marimba", label: "Marimba" },
                { id: "synth", label: "Synth" },
                { id: "flute", label: "Flöte" },
              ] as { id: Instrument; label: string }[]
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setInstrument(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                  instrument === item.id
                    ? "bg-[#fff0f5] text-[#d65c89] border border-[#f3cadc] shadow-sm"
                    : "text-[#83788f] hover:bg-[#faf6fb]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Keyboard size & Volume */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[#867b93]">
              <Volume2 size={16} />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-20 accent-[#ed78a0] cursor-pointer"
              />
            </div>

            <button
              type="button"
              onClick={() => setWhiteCount(whiteCount === 8 ? 15 : 8)}
              className="px-3 py-1 rounded-xl bg-[#f7f3f9] text-[#71657f] hover:text-[#2d263b] text-xs font-bold"
            >
              {whiteCount === 8 ? "2 Oktaven zeigen (15 Tasten)" : "1 Oktave (8 Tasten)"}
            </button>
          </div>
        </div>

        {/* Guided song active banner */}
        {guidedSong && (
          <div className={`p-4 rounded-2xl border transition-all ${
            guidedFinished ? "bg-[#eaf8f1] border-[#caeedf]" : "bg-[#fff5f8] border-[#f4cfdf]"
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#d6688e]">
                  MITPLAY-MODUS · {guidedSong.title.toUpperCase()}
                </span>
                <h4 className="text-base font-black text-[#2f273b] m-0 mt-0.5">
                  {guidedFinished
                    ? "Wunderbar zu Ende gespielt! 👏"
                    : `Nächste Taste: ${currentTargetNote ? getNoteLabel(NOTE_BY_ID[currentTargetNote] || currentTargetNote, progress.notationSystem) : ""}`}
                </h4>
                {guidedSong.lyrics && !guidedFinished && (
                  <p className="text-xs text-[#8d7e93] m-0 mt-0.5">
                    Silbe: "{guidedSong.lyrics[guidedStep] || ""}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-[#de628e]">
                  {guidedStep + (guidedFinished ? 1 : 0)} / {guidedSong.notes.length} Töne
                </span>
                <button
                  type="button"
                  onClick={() => setGuidedSong(null)}
                  className="p-1 rounded-lg bg-white/80 hover:bg-white text-[#998da0] hover:text-[#32263d]"
                  title="Beenden"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sheet Music Stave in Play mode if note is active */}
        <SheetMusicStave
          currentNoteId={activeNote || currentTargetNote}
          targetNoteId={currentTargetNote}
          noteSequence={guidedSong?.notes}
          currentIndex={guidedStep}
          notationSystem={progress.notationSystem}
          compact
        />

        {/* Big Interactive Piano Keyboard */}
        <PianoKeyboard
          onPress={handleNote}
          activeNote={activeNote}
          targetNote={currentTargetNote}
          whiteCount={whiteCount}
          showShortcuts={showShortcuts}
          notationSystem={progress.notationSystem}
        />

        {/* Shortcuts Hint */}
        <div className="flex flex-wrap items-center justify-between text-xs font-bold text-[#a097a8] pt-2">
          <span className="flex items-center gap-1.5">
            <Keyboard size={15} /> Computertastatur aktiv: Tasten A S D F G H J K (Weiß) & W E T Z U (Schwarz)
          </span>
          <button
            type="button"
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="hover:text-[#de628e] underline underline-offset-4"
          >
            {showShortcuts ? "Tastaturkürzel ausblenden" : "Tastaturkürzel einblenden"}
          </button>
        </div>
      </section>

      {/* Bottom 2 Columns: Song Library & Recorder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 1. Song Library */}
        <section className="bg-white rounded-3xl border border-[#eeebf0] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f3edf5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#f4edfd] text-[#9375c3] flex items-center justify-center font-bold">
                <BookOpen size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#987fc2]">
                  8 BELIEBTE LIEDER
                </span>
                <h3 className="text-lg font-black text-[#2e263d] m-0">
                  Melodien-Bibliothek
                </h3>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {SONGS.map((song) => {
              const isPlaying = isDemoPlaying && playingSongId === song.id;

              return (
                <div
                  key={song.id}
                  className="flex items-center justify-between p-3 rounded-2xl border border-[#f0ebf3] hover:border-[#ebdcf2] hover:bg-[#faf7fc] transition-all"
                >
                  <div>
                    <strong className="text-sm font-black text-[#2e263d] block leading-tight">
                      {song.title}
                    </strong>
                    <span className="text-xs text-[#958c9c]">
                      {song.subtitle} · {song.notes.length} Töne
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => playDemo(song.notes, song.id, song.tempoBpm)}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all ${
                        isPlaying
                          ? "bg-[#fff0f5] border-[#f2adc5] text-[#d65c89]"
                          : "bg-white border-[#e9e3ed] text-[#71657f] hover:bg-[#fbf7fc]"
                      }`}
                      title={isPlaying ? "Stoppen" : "Anhören"}
                    >
                      {isPlaying ? <Pause size={15} /> : <Play size={15} fill="currentColor" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => startGuided(song)}
                      className="px-3 py-1.5 rounded-xl bg-[#302942] hover:bg-[#483756] text-white text-xs font-black shadow-sm flex items-center gap-1.5"
                    >
                      Mitspielen <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 2. Recorder & Saved Creations */}
        <section className="bg-white rounded-3xl border border-[#eeebf0] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#f3edf5]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fff0f5] text-[#e06892] flex items-center justify-center font-bold">
                <Disc3 size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#d6688e]">
                  EIGENE MELODIEN AUFNEHMEN
                </span>
                <h3 className="text-lg font-black text-[#2e263d] m-0">
                  Komponisten-Studio
                </h3>
              </div>
            </div>
          </div>

          {/* Recording Status Box */}
          <div className="p-4 rounded-2xl bg-[#faf7fc] border border-[#eee4f2] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    isRecording ? "bg-[#e54a74] animate-ping" : "bg-[#c7becd]"
                  }`}
                />
                <span className="text-xs font-extrabold text-[#3d334d]">
                  {isRecording
                    ? `Aufnahme läuft... (${recordedNotes.length} Töne)`
                    : recordedNotes.length > 0
                    ? `${recordedNotes.length} Töne aufgenommen`
                    : "Bereit für deine Melodie"}
                </span>
              </div>

              {isRecording ? (
                <button
                  type="button"
                  onClick={finishRecording}
                  className="px-4 py-1.5 rounded-xl bg-[#e54a74] hover:bg-[#cb365e] text-white text-xs font-black shadow-sm"
                >
                  Aufnahme stoppen
                </button>
              ) : (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-4 py-1.5 rounded-xl bg-[#302942] hover:bg-[#483756] text-white text-xs font-black shadow-sm"
                >
                  Aufnahme starten
                </button>
              )}
            </div>

            {/* If recorded notes exist and not recording, allow playback and title */}
            {!isRecording && recordedNotes.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-[#eee4f2]">
                <button
                  type="button"
                  onClick={() => playDemo(recordedNotes, undefined, 100)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#e4dbe8] text-[#554865] hover:bg-[#faf6fc] font-bold text-xs flex items-center gap-1.5"
                >
                  <Play size={14} fill="currentColor" /> Anhören
                </button>

                <input
                  type="text"
                  placeholder="Name deines Stücks..."
                  value={recordingTitle}
                  onChange={(e) => setRecordingTitle(e.target.value)}
                  className="flex-1 bg-white border border-[#e4dbe8] rounded-xl px-3 py-1.5 text-xs font-bold text-[#30263f] focus:outline-none focus:ring-2 focus:ring-[#ed78a0]"
                />

                <button
                  type="button"
                  onClick={finishRecording}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#ed78a0] to-[#d8618a] text-white text-xs font-black shadow-sm"
                >
                  Speichern
                </button>
              </div>
            )}
          </div>

          {/* List of Saved Recordings */}
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#9b90a3] block">
              GESPEICHERTE STÜCKE ({progress.recordings.length})
            </span>

            {progress.recordings.length === 0 ? (
              <p className="text-xs text-[#a39aa9] italic py-2 m-0">
                Noch keine Aufnahmen gespeichert. Drücke auf "Aufnahme starten" und spiele eine Melodie!
              </p>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {progress.recordings.map((rec) => (
                  <div
                    key={rec.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#f0ebf3]"
                  >
                    <div>
                      <strong className="text-xs font-black text-[#2e263d] block leading-tight">
                        {rec.title}
                      </strong>
                      <span className="text-[10px] text-[#9a91a1]">
                        {rec.date} · {rec.notes.length} Töne · {rec.durationSeconds}s
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => playDemo(rec.notes, undefined, 100)}
                        className="p-1.5 rounded-lg bg-[#faf6fc] hover:bg-[#fff0f5] text-[#d65c89]"
                        title="Abspielen"
                      >
                        <Play size={14} fill="currentColor" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRecording(rec.id)}
                        className="p-1.5 rounded-lg bg-[#faf6fc] hover:bg-[#fff0f3] text-[#a59ba9] hover:text-[#e04d72]"
                        title="Löschen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

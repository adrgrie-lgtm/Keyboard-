import { NOTE_BY_ID } from "./music-data";
import type { Instrument } from "../types/music";

let audioContext: AudioContext | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioContext = new AudioContextClass();
    }
  }
  if (audioContext && audioContext.state === "suspended") {
    void audioContext.resume();
  }
  return audioContext;
}

export function playNote(
  noteId: string,
  instrument: Instrument = "piano",
  volume = 0.65,
  duration = 0.95
) {
  const note = NOTE_BY_ID[noteId];
  const context = getAudioContext();
  if (!context || !note || volume <= 0) return;

  const now = context.currentTime;
  const master = context.createGain();
  master.gain.value = Math.min(1, Math.max(0, volume)) * 0.42;
  master.connect(context.destination);

  let voices: { ratio: number; level: number; type: OscillatorType; decay: number }[];

  switch (instrument) {
    case "bell":
      // Music Box / Celeste: Crystal pure bell tones with lingering high harmonics
      voices = [
        { ratio: 1.0, level: 0.90, type: "sine", decay: 1.6 },
        { ratio: 2.003, level: 0.40, type: "sine", decay: 1.1 },
        { ratio: 3.01, level: 0.15, type: "sine", decay: 0.7 },
        { ratio: 4.02, level: 0.08, type: "sine", decay: 0.4 },
      ];
      break;

    case "synth":
      // Soft analog synthesizer with warm pulse
      voices = [
        { ratio: 1.0, level: 0.65, type: "sawtooth", decay: 0.9 },
        { ratio: 1.004, level: 0.35, type: "triangle", decay: 0.85 },
        { ratio: 2.0, level: 0.20, type: "sine", decay: 0.6 },
      ];
      break;

    case "marimba":
      // Wooden percussion mallets: punchy attack, fast decay
      voices = [
        { ratio: 1.0, level: 1.0, type: "sine", decay: 0.45 },
        { ratio: 4.0, level: 0.35, type: "triangle", decay: 0.18 },
        { ratio: 9.9, level: 0.12, type: "sine", decay: 0.08 },
      ];
      break;

    case "flute":
      // Soft woodwind / melodica with breathing warmth
      voices = [
        { ratio: 1.0, level: 0.85, type: "sine", decay: 1.2 },
        { ratio: 2.0, level: 0.22, type: "triangle", decay: 0.95 },
        { ratio: 3.0, level: 0.07, type: "sine", decay: 0.7 },
      ];
      break;

    case "piano":
    default:
      // Grand Piano acoustic blend: triangle fundamentals + harmonic body
      voices = [
        { ratio: 1.0, level: 0.75, type: "triangle", decay: 1.15 },
        { ratio: 2.0, level: 0.28, type: "sine", decay: 0.85 },
        { ratio: 3.0, level: 0.14, type: "sine", decay: 0.55 },
        { ratio: 4.0, level: 0.06, type: "sine", decay: 0.35 },
      ];
      break;
  }

  voices.forEach((voice) => {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    const end = now + Math.max(0.25, duration * voice.decay);

    oscillator.type = voice.type;
    oscillator.frequency.setValueAtTime(note.frequency * voice.ratio, now);

    envelope.gain.setValueAtTime(0.0001, now);
    envelope.gain.exponentialRampToValueAtTime(Math.max(0.001, voice.level), now + 0.015);
    envelope.gain.exponentialRampToValueAtTime(0.0001, end);

    oscillator.connect(envelope);
    envelope.connect(master);

    oscillator.start(now);
    oscillator.stop(end + 0.02);
  });
}

// Gentle success chime for note hit
export function playSuccessChime(volume = 0.5) {
  const context = getAudioContext();
  if (!context || volume <= 0) return;

  const now = context.currentTime;
  const master = context.createGain();
  master.gain.value = volume * 0.25;
  master.connect(context.destination);

  // Quick 2-tone pleasant interval (G5 -> C6)
  const notes = [783.99, 1046.50];
  notes.forEach((freq, i) => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    const startTime = now + i * 0.07;
    const endTime = startTime + 0.35;

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.7, startTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

    osc.connect(gain);
    gain.connect(master);

    osc.start(startTime);
    osc.stop(endTime);
  });
}

// Gentle soft "try again" sound
export function playGentleTryAgain(volume = 0.35) {
  const context = getAudioContext();
  if (!context || volume <= 0) return;

  const now = context.currentTime;
  const master = context.createGain();
  master.gain.value = volume * 0.2;
  master.connect(context.destination);

  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(196, now + 0.22);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.5, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

  osc.connect(gain);
  gain.connect(master);
  osc.start(now);
  osc.stop(now + 0.23);
}

// Metronome click
export function playMetronomeClick(accent = false, volume = 0.5) {
  const context = getAudioContext();
  if (!context || volume <= 0) return;

  const now = context.currentTime;
  const osc = context.createOscillator();
  const gain = context.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(accent ? 1200 : 800, now);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(accent ? volume * 0.3 : volume * 0.18, now + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

  osc.connect(gain);
  gain.connect(context.destination);

  osc.start(now);
  osc.stop(now + 0.05);
}

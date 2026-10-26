import { useCallback, useEffect, useRef, useState } from "react";
import { NOTE_BY_ID } from "../lib/music-data";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

type MicrophoneResources = {
  stream: MediaStream;
  context: AudioContext;
  source: MediaStreamAudioSourceNode;
  analyser: AnalyserNode;
  timer: number;
};

// Autocorrelation pitch detection algorithm
function estimateFrequency(buffer: Float32Array, sampleRate: number): { freq: number; clarity: number } | null {
  let energy = 0;
  for (let i = 0; i < buffer.length; i++) {
    energy += buffer[i] * buffer[i];
  }
  const rms = Math.sqrt(energy / buffer.length);
  // Noise gate: ignore quiet background noise
  if (rms < 0.018) return null;

  // Search lags corresponding to typical keyboard range (approx 130 Hz to 1100 Hz)
  const minLag = Math.floor(sampleRate / 1100);
  const maxLag = Math.min(Math.floor(sampleRate / 130), Math.floor(buffer.length / 2));
  const correlations: number[] = [];
  let strongest = 0;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let sum = 0;
    let left = 0;
    let right = 0;
    for (let i = 0; i < buffer.length - lag; i += 2) {
      const a = buffer[i];
      const b = buffer[i + lag];
      sum += a * b;
      left += a * a;
      right += b * b;
    }
    const correlation = sum / Math.sqrt(left * right + 0.000001);
    correlations.push(correlation);
    if (correlation > strongest) strongest = correlation;
  }

  if (strongest < 0.65) return null;

  for (let i = 1; i < correlations.length - 1; i++) {
    if (
      correlations[i] >= Math.max(0.65, strongest * 0.90) &&
      correlations[i] >= correlations[i - 1] &&
      correlations[i] > correlations[i + 1]
    ) {
      const a = correlations[i - 1];
      const b = correlations[i];
      const c = correlations[i + 1];
      const offset = (a - c) / (2 * (a - 2 * b + c) || 1);
      const exactLag = minLag + i + Math.max(-0.5, Math.min(0.5, offset));
      return { freq: sampleRate / exactLag, clarity: strongest };
    }
  }

  return null;
}

export function usePitchDetection(onNote: (noteId: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [detectedNote, setDetectedNote] = useState<string | null>(null);
  const [frequency, setFrequency] = useState<number | null>(null);
  const [cents, setCents] = useState<number>(0);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const resourcesRef = useRef<MicrophoneResources | null>(null);
  const onNoteRef = useRef(onNote);
  const stabilityRef = useRef({ note: "", count: 0, emitted: "", silentFrames: 0 });

  useEffect(() => {
    onNoteRef.current = onNote;
  }, [onNote]);

  const stop = useCallback(() => {
    const res = resourcesRef.current;
    if (res) {
      window.clearInterval(res.timer);
      try {
        res.source.disconnect();
        res.stream.getTracks().forEach((track) => track.stop());
        void res.context.close();
      } catch (e) {
        console.warn("Error cleaning up audio resources", e);
      }
      resourcesRef.current = null;
    }
    stabilityRef.current = { note: "", count: 0, emitted: "", silentFrames: 0 };
    setIsListening(false);
    setDetectedNote(null);
    setFrequency(null);
    setCents(0);
    setVolumeLevel(0);
  }, []);

  const start = useCallback(async () => {
    if (resourcesRef.current) return;
    setError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Dein Browser unterstützt leider kein Mikrofon. Du kannst die Bildschirm- oder Computertasten benutzen.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const context = new AudioContextClass();
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 4096;
      source.connect(analyser);

      const buffer = new Float32Array(analyser.fftSize);

      const timer = window.setInterval(() => {
        analyser.getFloatTimeDomainData(buffer);

        // Calculate audio RMS for volume level indicator
        let sumSquares = 0;
        for (let i = 0; i < buffer.length; i++) {
          sumSquares += buffer[i] * buffer[i];
        }
        const rms = Math.sqrt(sumSquares / buffer.length);
        setVolumeLevel(Math.min(100, Math.round(rms * 450)));

        const result = estimateFrequency(buffer, context.sampleRate);
        const stable = stabilityRef.current;

        if (!result) {
          stable.silentFrames++;
          if (stable.silentFrames >= 3) {
            stable.note = "";
            stable.count = 0;
            stable.emitted = "";
            setDetectedNote(null);
            setFrequency(null);
          }
          return;
        }

        stable.silentFrames = 0;
        const freq = result.freq;
        const midi = Math.round(69 + 12 * Math.log2(freq / 440));
        const noteIndex = ((midi % 12) + 12) % 12;
        const octave = Math.floor(midi / 12) - 1;
        const noteId = `${NOTE_NAMES[noteIndex]}${octave}`;

        const exactFreq = 440 * Math.pow(2, (midi - 69) / 12);
        const centDiff = Math.round(1200 * Math.log2(freq / exactFreq));

        // Filter out unreasonable out-of-range notes or high cents deviations
        if (!NOTE_BY_ID[noteId] || Math.abs(centDiff) > 48) return;

        setFrequency(Math.round(freq * 10) / 10);
        setCents(centDiff);

        if (stable.note === noteId) {
          stable.count++;
        } else {
          stable.note = noteId;
          stable.count = 1;
        }

        if (stable.count >= 2) {
          setDetectedNote(noteId);
        }

        if (stable.count >= 2 && stable.emitted !== noteId) {
          stable.emitted = noteId;
          onNoteRef.current(noteId);
        }
      }, 85);

      resourcesRef.current = { stream, context, source, analyser, timer };
      setIsListening(true);
    } catch (err) {
      console.error(err);
      setError("Mikrofon-Zugriff nicht gestattet. Klicke auf 'Erlauben' oder nutze die Bildschirm-Tasten.");
    }
  }, []);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    isListening,
    detectedNote,
    frequency,
    cents,
    volumeLevel,
    error,
    start,
    stop,
  };
}

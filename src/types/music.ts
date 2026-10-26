export type Accent = "rose" | "violet" | "peach" | "mint" | "blue" | "yellow" | "emerald";

export type NotationSystem = "deutsch" | "international" | "solfege";

export type Instrument = "piano" | "bell" | "synth" | "marimba" | "flute";

export type PracticeMode = "screen" | "keyboard";

export type PianoNote = {
  id: string;
  name: string;
  octave: number;
  display: string;
  displayGerman: string;
  displaySolfege: string;
  number?: string;
  frequency: number;
  black?: boolean;
  afterWhite?: number;
  shortcut?: string;
  stavePosition: number; // 0 is bottom line (E4), -2 is C4 (with ledger line), etc.
};

export type Lesson = {
  id: string;
  moduleId: string;
  number: string;
  title: string;
  subtitle: string;
  description: string;
  duration: string;
  accent: Accent;
  icon: "keyboard" | "notes" | "arrows" | "song" | "sparkles" | "star" | "trophy" | "flame";
  notes: string[];
  rhythm?: number[]; // relative note durations in beats (1 = quarter, 2 = half, etc.)
  lyrics?: string[]; // optional text syllables for singing along
  hint: string;
  fact: string;
  fingerTip?: string; // Finger number recommendations (1 = Daumen, 5 = kleiner Finger)
  reward: string;
  requiredStarsToUnlock?: number;
};

export type LessonModule = {
  id: string;
  title: string;
  subtitle: string;
  level: number;
  accent: Accent;
  description: string;
  lessons: Lesson[];
};

export type Song = {
  id: string;
  title: string;
  subtitle: string;
  category: "kinderlieder" | "klassik" | "volkslieder";
  notes: string[];
  rhythm?: number[];
  lyrics?: string[];
  accent: Accent;
  tempoBpm: number;
  difficulty: "Leicht" | "Mittel" | "Konzert";
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: "music" | "keyboard" | "sparkles" | "trophy" | "flame" | "star" | "medal" | "heart" | "zap";
  accent: Accent;
  category: "beginner" | "practice" | "mastery" | "fun";
};

export type RecordedSong = {
  id: string;
  title: string;
  date: string;
  notes: string[];
  durationSeconds: number;
  instrument: Instrument;
};

export type UserProgress = {
  studentName: string;
  completedLessonIds: string[];
  lessonStars: Record<string, number>; // 1, 2, or 3 stars
  lessonAccuracies: Record<string, number>; // percentage of first-try correct hits
  totalNotesPlayed: number;
  practiceSeconds: number;
  lastPracticedAt: string | null;
  dailyStreak: number;
  highestStreak: number;
  activeDays: string[]; // ['2026-10-25', '2026-10-26']
  unlockedAchievementIds: string[];
  quizHighScore: number;
  recordings: RecordedSong[];
  notationSystem: NotationSystem;
  soundVolume: number;
  isMuted: boolean;
};

export type PitchTuningData = {
  isListening: boolean;
  detectedNote: string | null;
  frequency: number | null;
  cents: number; // -50 to +50
  clarity: number; // 0 to 1
  error: string | null;
};

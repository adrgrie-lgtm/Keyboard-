import type { UserProgress, RecordedSong, NotationSystem } from "../types/music";
import { ACHIEVEMENTS, ALL_LESSONS } from "./music-data";

const STORAGE_KEY = "klimper_user_progress_v2";

export const DEFAULT_PROGRESS: UserProgress = {
  studentName: "Kleiner Musikstar",
  completedLessonIds: [],
  lessonStars: {},
  lessonAccuracies: {},
  totalNotesPlayed: 0,
  practiceSeconds: 0,
  lastPracticedAt: null,
  dailyStreak: 1,
  highestStreak: 1,
  activeDays: [new Date().toISOString().slice(0, 10)],
  unlockedAchievementIds: [],
  quizHighScore: 0,
  recordings: [],
  notationSystem: "deutsch",
  soundVolume: 0.7,
  isMuted: false,
};

export function loadProgress(): UserProgress {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      lessonStars: parsed.lessonStars || {},
      lessonAccuracies: parsed.lessonAccuracies || {},
      completedLessonIds: parsed.completedLessonIds || [],
      unlockedAchievementIds: parsed.unlockedAchievementIds || [],
      recordings: parsed.recordings || [],
      activeDays: parsed.activeDays || [new Date().toISOString().slice(0, 10)],
    };
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn("Could not save progress to localStorage", err);
  }
}

export function checkAndUnlockAchievements(
  progress: UserProgress,
  onNewUnlock?: (badgeName: string) => void
): UserProgress {
  const unlocked = new Set(progress.unlockedAchievementIds);
  const newlyUnlocked: string[] = [];

  const check = (id: string, condition: boolean) => {
    if (condition && !unlocked.has(id)) {
      unlocked.add(id);
      newlyUnlocked.push(id);
    }
  };

  // 1. first note
  check("first_note", progress.totalNotesPlayed > 0);

  // 2. first lesson
  check("lesson_1", progress.completedLessonIds.length >= 1);

  // 3. world 1 master (lessons 1, 2, 3, 4)
  const world1Ids = ["l01-erste-tasten", "l02-die-nachbarn", "l03-volle-leiter", "l04-die-oktave"];
  const hasWorld1 = world1Ids.every((id) => progress.completedLessonIds.includes(id));
  check("world_1_master", hasWorld1);

  // 4. streak 3 days
  check("streak_3", (progress.activeDays?.length || 0) >= 3 || progress.dailyStreak >= 3);

  // 5. accuracy 90%
  const maxAcc = Math.max(0, ...Object.values(progress.lessonAccuracies || {}));
  check("accuracy_90", maxAcc >= 90);

  // 6. ear genius
  check("ear_genius", (progress.quizHighScore || 0) >= 100);

  // 7. 100 notes
  check("notes_100", progress.totalNotesPlayed >= 100);

  // 8. 500 notes
  check("notes_500", progress.totalNotesPlayed >= 500);

  // 9. black keys
  const blackKeyLessons = ["l13-schwarze-zwillinge", "l14-schwarze-drillinge"];
  const hasBlack = blackKeyLessons.some((id) => progress.completedLessonIds.includes(id));
  check("black_keys", hasBlack);

  // 10. composer
  check("composer", (progress.recordings?.length || 0) >= 1);

  // 11. song master
  check("song_master", progress.completedLessonIds.includes("l08-entchen-voll") || progress.completedLessonIds.includes("l09-bruder-jakob"));

  // 12. all 16 lessons
  check("all_lessons", progress.completedLessonIds.length >= ALL_LESSONS.length);

  if (newlyUnlocked.length > 0 && onNewUnlock) {
    newlyUnlocked.forEach((id) => {
      const b = ACHIEVEMENTS.find((a) => a.id === id);
      if (b) onNewUnlock(b.name);
    });
  }

  return {
    ...progress,
    unlockedAchievementIds: Array.from(unlocked),
  };
}

export function recordDayActivity(progress: UserProgress): UserProgress {
  const today = new Date().toISOString().slice(0, 10);
  const activeDays = new Set(progress.activeDays || []);

  // Today already recorded: nothing to update, streak stays as-is.
  if (activeDays.has(today)) {
    return progress;
  }

  // Streak continues only if the user also practiced yesterday.
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streak = activeDays.has(yesterday) ? progress.dailyStreak + 1 : 1;

  activeDays.add(today);

  const updated: UserProgress = {
    ...progress,
    activeDays: Array.from(activeDays),
    dailyStreak: streak,
    highestStreak: Math.max(progress.highestStreak, streak),
    lastPracticedAt: new Date().toISOString(),
  };

  return updated;
}

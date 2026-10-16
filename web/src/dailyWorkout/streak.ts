import { previousUtcDate, utcDate } from "./date";
import { STREAK_KEY, readJson, writeJson } from "./storage";

export interface StreakState {
  /** The last UTC day a workout was completed, or null if never. */
  lastDate: string | null;
  streak: number;
}

const NONE: StreakState = { lastDate: null, streak: 0 };

function readStreak(): StreakState {
  const value = readJson(STREAK_KEY);
  if (!value || typeof value !== "object") return NONE;
  const { lastDate, streak } = value as Partial<StreakState>;
  if (typeof streak !== "number" || !Number.isInteger(streak) || streak < 0) return NONE;
  if (lastDate !== null && typeof lastDate !== "string") return NONE;
  return { lastDate: lastDate ?? null, streak };
}

/**
 * The streak as it stands on `today`. It stays alive through today and yesterday,
 * so a missed day shows as 0 until the next workout starts a new one.
 */
export function loadStreak(today: string = utcDate()): StreakState {
  const stored = readStreak();
  const alive = stored.lastDate === today || stored.lastDate === previousUtcDate(today);
  return alive ? stored : { lastDate: stored.lastDate, streak: 0 };
}

/**
 * Records a completed workout on `date` and returns the new streak.
 * Finishing twice on the same day changes nothing. Finishing the day after the last
 * completion adds one. Any other gap starts again at 1.
 */
export function recordCompletion(date: string): number {
  const stored = readStreak();
  if (stored.lastDate === date) return stored.streak;
  const streak = stored.lastDate === previousUtcDate(date) ? stored.streak + 1 : 1;
  writeJson(STREAK_KEY, { lastDate: date, streak });
  return streak;
}

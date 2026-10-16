import type { DrillId } from "../drills/ids";

/** Key for the streak record, `{ lastDate, streak }`. */
export const STREAK_KEY = "zap-daily-streak";

/** Key for one day's finished workout. */
export const dayKey = (date: string) => `zap-daily-${date}`;

export interface DayResult {
  date: string;
  drills: DrillId[];
  /** One score per drill, in the order played. */
  scores: number[];
  total: number;
}

/** Reads and parses a JSON value. Missing, corrupt or blocked storage all read as null. */
export function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Writes a JSON value. If storage is full or blocked, progress just isn't kept. */
export function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or a full quota: the workout still runs, it just isn't saved.
  }
}

export function saveDayResult(result: DayResult): void {
  writeJson(dayKey(result.date), result);
}

export function loadDayResult(date: string): DayResult | null {
  const value = readJson(dayKey(date));
  if (!value || typeof value !== "object") return null;
  const r = value as Partial<DayResult>;
  const valid =
    r.date === date &&
    Array.isArray(r.drills) &&
    Array.isArray(r.scores) &&
    r.scores.length === r.drills.length &&
    r.scores.every((s) => typeof s === "number") &&
    typeof r.total === "number";
  return valid ? (r as DayResult) : null;
}

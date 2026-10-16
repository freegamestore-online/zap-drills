import type { DrillId } from "../drills/ids";
import { previousUtcDate, utcDate } from "../dailyWorkout/date";
import { readJson, writeJson } from "../dailyWorkout/storage";

/** Days of history kept per drill, today included. */
export const HISTORY_DAYS = 14;

export interface HistoryEntry {
  /** UTC day, YYYY-MM-DD. */
  date: string;
  /** Best score for that day. */
  score: number;
}

export const personalBestKey = (id: DrillId) => `zd_pb_${id}`;
export const historyKey = (id: DrillId) => `zd_history_${id}`;

/** The 14 UTC days ending on `today`, oldest first. */
export function windowDates(today: string = utcDate(), days: number = HISTORY_DAYS): string[] {
  const dates = [today];
  for (let i = 1; i < days; i++) dates.unshift(previousUtcDate(dates[0]!));
  return dates;
}

/** The first date still inside the window that ends on `today`. Older entries are dropped. */
export function windowStart(today: string): string {
  return windowDates(today)[0]!;
}

export function loadPersonalBest(id: DrillId): number | null {
  const value = readJson(personalBestKey(id));
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isEntry(value: unknown): value is HistoryEntry {
  if (!value || typeof value !== "object") return false;
  const e = value as Partial<HistoryEntry>;
  return typeof e.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(e.date) && typeof e.score === "number" && Number.isFinite(e.score);
}

/** Every stored entry for a drill, oldest first. Corrupt entries are skipped. */
function readHistory(id: DrillId): HistoryEntry[] {
  const value = readJson(historyKey(id));
  if (!Array.isArray(value)) return [];
  return value.filter(isEntry).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/** The entries inside the 14-day window ending on `today`, oldest first. */
export function loadHistory(id: DrillId, today: string = utcDate()): HistoryEntry[] {
  const start = windowStart(today);
  return readHistory(id).filter((e) => e.date >= start && e.date <= today);
}

/**
 * Records a finished run. The personal best only moves up on a strictly higher score.
 * The day's history entry keeps the best score of that day and drops anything older
 * than the window.
 */
export function recordRun(
  id: DrillId,
  score: number,
  date: string = utcDate(),
): { personalBest: number; isNewBest: boolean } {
  const previous = loadPersonalBest(id);
  const isNewBest = previous === null || score > previous;
  const personalBest = isNewBest ? score : previous!;
  if (isNewBest) writeJson(personalBestKey(id), score);

  const stored = readHistory(id);
  const start = windowStart(date);
  const todays = stored.find((e) => e.date === date);
  const entries = stored.filter((e) => e.date >= start && e.date !== date);
  entries.push({ date, score: todays ? Math.max(todays.score, score) : score });
  entries.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  writeJson(historyKey(id), entries);

  return { personalBest, isNewBest };
}

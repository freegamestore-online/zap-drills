import type { Rng } from "../rng";

/** Shortest wait before the target appears. */
export const MIN_DELAY_MS = 1000;
/** Longest wait before the target appears. */
export const MAX_DELAY_MS = 4000;
/** How long the target stays up before it counts as a miss. */
export const TARGET_TIMEOUT_MS = 2000;

/** A random wait between MIN_DELAY_MS and MAX_DELAY_MS, in whole milliseconds. */
export function randomDelay(rng: Rng): number {
  return MIN_DELAY_MS + Math.floor(rng() * (MAX_DELAY_MS - MIN_DELAY_MS + 1));
}

/** Milliseconds from the target appearing to the tap. */
export function reactionTime(shownAt: number, tappedAt: number): number {
  return Math.max(0, Math.round(tappedAt - shownAt));
}

/** Mean of the reaction times, rounded to whole milliseconds. Null when there are none yet. */
export function averageReaction(times: readonly number[]): number | null {
  if (times.length === 0) return null;
  return Math.round(times.reduce((sum, t) => sum + t, 0) / times.length);
}

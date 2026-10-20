/** Length of every drill. */
export const DRILL_MS = 60_000;

/** Elapsed wall-clock time, including time while the browser throttles animation frames. */
export function elapsedMs(startedAt: number, now: number): number {
  return Math.max(0, now - startedAt);
}

/** Share of the drill still left: 1 at the start, 0 at the buzzer. */
export function timeLeftFraction(elapsedMs: number, durationMs = DRILL_MS): number {
  return Math.min(1, Math.max(0, 1 - elapsedMs / durationMs));
}

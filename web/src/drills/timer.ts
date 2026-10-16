/** Length of every drill. */
export const DRILL_MS = 60_000;

/** Share of the drill still left: 1 at the start, 0 at the buzzer. */
export function timeLeftFraction(elapsedMs: number, durationMs = DRILL_MS): number {
  return Math.min(1, Math.max(0, 1 - elapsedMs / durationMs));
}

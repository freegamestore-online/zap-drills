import { randInt, shuffle, type Rng } from "../rng";

/** Most numbers on one board. */
export const MAX_COUNT = 12;

export interface Tile {
  /** The number printed on the tile, 1-based. */
  value: number;
  /** Centre position, as a percentage of the field. */
  x: number;
  y: number;
}

/** Numbers on the board: 4 at the start, one more per completed board, up to MAX_COUNT. */
export function countFor(streak: number): number {
  return Math.min(4 + streak, MAX_COUNT);
}

/**
 * Scatters 1..count over a 4×4 grid of cells. Each number takes its own cell and is
 * jittered inside it, so tiles never overlap however the board is shuffled.
 */
export function generateBoard(rng: Rng, count: number): Tile[] {
  const cells = shuffle(
    rng,
    Array.from({ length: 16 }, (_, i) => i),
  ).slice(0, count);
  const cell = 25;
  const jitter = 5;
  return cells.map((index, i) => {
    const col = index % 4;
    const row = Math.floor(index / 4);
    return {
      value: i + 1,
      x: col * cell + cell / 2 + (randInt(rng, -jitter, jitter)),
      y: row * cell + cell / 2 + (randInt(rng, -jitter, jitter)),
    };
  });
}

/** True when `tapped` is the next number the player should hit after `cleared` taps. */
export function isNextInOrder(cleared: number, tapped: number): boolean {
  return tapped === cleared + 1;
}

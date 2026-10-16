import { shuffle, type Rng } from "../rng";

/** How long the lit cells stay up before they blank. */
export const SHOW_MS = 1500;
/** The shorter reveal used under reduced motion. */
export const REDUCED_SHOW_MS = 500;

/** A 3×3 grid until the player reaches a streak of 5, then 4×4. */
export const STREAK_TO_LARGE_GRID = 5;

export interface Round {
  gridSize: number;
  /** Indices (row-major, 0-based) of the cells that light up. Sorted, no duplicates. */
  litCells: number[];
}

export function gridSizeFor(streak: number): number {
  return streak >= STREAK_TO_LARGE_GRID ? 4 : 3;
}

/** Two lit cells at the start, one more every two streak steps, never the whole grid. */
export function litCountFor(gridSize: number, streak: number): number {
  return Math.min(2 + Math.floor(streak / 2), gridSize * gridSize - 2);
}

export function generateRound(rng: Rng, streak: number): Round {
  const gridSize = gridSizeFor(streak);
  const count = litCountFor(gridSize, streak);
  const cells = Array.from({ length: gridSize * gridSize }, (_, i) => i);
  const litCells = shuffle(rng, cells)
    .slice(0, count)
    .sort((a, b) => a - b);
  return { gridSize, litCells };
}

/** True when the player picked exactly the lit cells, in any order. */
export function checkAnswer(litCells: readonly number[], playerCells: readonly number[]): boolean {
  const lit = new Set(litCells);
  const picked = new Set(playerCells);
  if (lit.size !== picked.size) return false;
  return [...lit].every((cell) => picked.has(cell));
}

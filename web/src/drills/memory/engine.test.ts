import { describe, expect, it } from "vitest";
import { checkAnswer, generateRound, gridSizeFor, litCountFor, STREAK_TO_LARGE_GRID } from "./engine";
import { seededRng } from "../rng";

describe("gridSizeFor", () => {
  it("uses a 3×3 grid until the streak reaches the threshold, then 4×4", () => {
    for (let streak = 0; streak < STREAK_TO_LARGE_GRID; streak++) expect(gridSizeFor(streak)).toBe(3);
    for (let streak = STREAK_TO_LARGE_GRID; streak < STREAK_TO_LARGE_GRID + 10; streak++) {
      expect(gridSizeFor(streak)).toBe(4);
    }
  });
});

describe("litCountFor", () => {
  it("grows with the streak and never lights the whole grid", () => {
    for (const size of [3, 4]) {
      let previous = 0;
      for (let streak = 0; streak <= 30; streak++) {
        const count = litCountFor(size, streak);
        expect(count).toBeGreaterThanOrEqual(previous);
        expect(count).toBeLessThan(size * size);
        previous = count;
      }
    }
  });

  it("lights more cells at a higher streak than at the start", () => {
    expect(litCountFor(3, 0)).toBe(2);
    expect(litCountFor(3, 4)).toBeGreaterThan(litCountFor(3, 0));
    expect(litCountFor(3, 8)).toBeGreaterThan(litCountFor(3, 4));
  });
});

describe("generateRound", () => {
  it("picks grid size and lit count from the streak", () => {
    const rng = seededRng(21);
    for (const streak of [0, 3, 5, 9]) {
      const round = generateRound(rng, streak);
      expect(round.gridSize).toBe(gridSizeFor(streak));
      expect(round.litCells).toHaveLength(litCountFor(round.gridSize, streak));
    }
  });

  it("returns sorted, unique, in-range cell indices", () => {
    const rng = seededRng(22);
    for (let i = 0; i < 500; i++) {
      const { gridSize, litCells } = generateRound(rng, i % 12);
      const max = gridSize * gridSize;
      expect(new Set(litCells).size).toBe(litCells.length);
      expect([...litCells].sort((a, b) => a - b)).toEqual(litCells);
      for (const cell of litCells) {
        expect(cell).toBeGreaterThanOrEqual(0);
        expect(cell).toBeLessThan(max);
      }
    }
  });
});

describe("checkAnswer", () => {
  it("accepts the exact lit cells in any order", () => {
    expect(checkAnswer([0, 4, 8], [8, 0, 4])).toBe(true);
  });

  it("rejects a missing cell", () => {
    expect(checkAnswer([0, 4, 8], [0, 4])).toBe(false);
  });

  it("rejects an extra cell", () => {
    expect(checkAnswer([0, 4], [0, 4, 8])).toBe(false);
  });

  it("rejects a swapped cell", () => {
    expect(checkAnswer([0, 4], [0, 5])).toBe(false);
  });

  it("ignores duplicate taps on the same cell", () => {
    expect(checkAnswer([1, 2], [1, 1, 2])).toBe(true);
  });

  it("treats an empty pick as wrong unless nothing was lit", () => {
    expect(checkAnswer([3], [])).toBe(false);
    expect(checkAnswer([], [])).toBe(true);
  });
});

import { describe, expect, it } from "vitest";
import { MAX_COUNT, countFor, generateBoard, isNextInOrder } from "./engine";
import { seededRng } from "../rng";

describe("countFor", () => {
  it("starts at four and grows with the streak up to the cap", () => {
    expect(countFor(0)).toBe(4);
    expect(countFor(3)).toBe(7);
    expect(countFor(100)).toBe(MAX_COUNT);
  });

  it("never decreases", () => {
    let previous = 0;
    for (let streak = 0; streak < 30; streak++) {
      expect(countFor(streak)).toBeGreaterThanOrEqual(previous);
      previous = countFor(streak);
    }
  });
});

describe("generateBoard", () => {
  it("numbers the tiles 1..count with no gaps", () => {
    const rng = seededRng(31);
    for (const count of [4, 8, MAX_COUNT]) {
      const values = generateBoard(rng, count).map((t) => t.value);
      expect(values).toEqual(Array.from({ length: count }, (_, i) => i + 1));
    }
  });

  it("keeps every tile inside the field", () => {
    const rng = seededRng(32);
    for (let i = 0; i < 500; i++) {
      for (const tile of generateBoard(rng, MAX_COUNT)) {
        expect(tile.x).toBeGreaterThanOrEqual(0);
        expect(tile.x).toBeLessThanOrEqual(100);
        expect(tile.y).toBeGreaterThanOrEqual(0);
        expect(tile.y).toBeLessThanOrEqual(100);
      }
    }
  });

  it("never places two tiles on top of each other", () => {
    const rng = seededRng(33);
    for (let i = 0; i < 500; i++) {
      const tiles = generateBoard(rng, MAX_COUNT);
      for (let a = 0; a < tiles.length; a++) {
        for (let b = a + 1; b < tiles.length; b++) {
          const dx = tiles[a]!.x - tiles[b]!.x;
          const dy = tiles[a]!.y - tiles[b]!.y;
          expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(10);
        }
      }
    }
  });

  it("scatters the tiles rather than laying them out in order", () => {
    const rng = seededRng(34);
    const boards = Array.from({ length: 50 }, () => generateBoard(rng, 6));
    const firstTileXs = new Set(boards.map((b) => b[0]!.x));
    expect(firstTileXs.size).toBeGreaterThan(10);
  });
});

describe("isNextInOrder", () => {
  it("accepts only the next number", () => {
    expect(isNextInOrder(0, 1)).toBe(true);
    expect(isNextInOrder(3, 4)).toBe(true);
    expect(isNextInOrder(3, 5)).toBe(false);
    expect(isNextInOrder(3, 3)).toBe(false);
  });
});

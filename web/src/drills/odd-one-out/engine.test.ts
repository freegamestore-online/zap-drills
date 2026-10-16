import { describe, expect, it } from "vitest";
import { COLOUR_RING, SHAPES, generateBoard, isOddTap, tierFor, type Tile } from "./engine";
import { seededRng } from "../rng";

const sameTile = (a: Tile, b: Tile) => a.shape === b.shape && a.colour === b.colour;

describe("tierFor", () => {
  it("steps up every three streak steps and then stays at the top tier", () => {
    expect(tierFor(0)).toBe(0);
    expect(tierFor(2)).toBe(0);
    expect(tierFor(3)).toBe(1);
    expect(tierFor(5)).toBe(1);
    expect(tierFor(6)).toBe(2);
    expect(tierFor(50)).toBe(2);
  });
});

describe("generateBoard", () => {
  it("has exactly one odd tile, and the others are all identical", () => {
    const rng = seededRng(41);
    for (let streak = 0; streak < 9; streak++) {
      for (let i = 0; i < 100; i++) {
        const board = generateBoard(rng, streak);
        const common = board.tiles[board.oddIndex === 0 ? 1 : 0]!;
        board.tiles.forEach((tile, index) => {
          if (index === board.oddIndex) expect(sameTile(tile, common)).toBe(false);
          else expect(sameTile(tile, common)).toBe(true);
        });
      }
    }
  });

  it("grows the grid with difficulty: 3×3 at tier 0, 4×4 above", () => {
    const rng = seededRng(42);
    expect(generateBoard(rng, 0)).toMatchObject({ gridSize: 3 });
    expect(generateBoard(rng, 0).tiles).toHaveLength(9);
    expect(generateBoard(rng, 3)).toMatchObject({ gridSize: 4 });
    expect(generateBoard(rng, 6).tiles).toHaveLength(16);
  });

  it("varies shape alone at tier 0, with colour fixed", () => {
    const rng = seededRng(43);
    for (let i = 0; i < 200; i++) {
      const board = generateBoard(rng, 0);
      const odd = board.tiles[board.oddIndex]!;
      const common = board.tiles[board.oddIndex === 0 ? 1 : 0]!;
      expect(odd.colour).toBe(common.colour);
      expect(odd.shape).not.toBe(common.shape);
      expect(SHAPES).toContain(odd.shape);
    }
  });

  it("varies colour alone at tiers 1 and 2, with shape fixed", () => {
    const rng = seededRng(44);
    for (const streak of [3, 6]) {
      for (let i = 0; i < 200; i++) {
        const board = generateBoard(rng, streak);
        const odd = board.tiles[board.oddIndex]!;
        const common = board.tiles[board.oddIndex === 0 ? 1 : 0]!;
        expect(odd.shape).toBe(common.shape);
        expect(odd.colour).not.toBe(common.colour);
      }
    }
  });

  it("at tier 2 the odd colour is a neighbour on the colour ring", () => {
    const rng = seededRng(45);
    for (let i = 0; i < 200; i++) {
      const board = generateBoard(rng, 6);
      const odd = board.tiles[board.oddIndex]!;
      const common = board.tiles[board.oddIndex === 0 ? 1 : 0]!;
      const gap = Math.abs(COLOUR_RING.indexOf(odd.colour) - COLOUR_RING.indexOf(common.colour));
      expect([1, COLOUR_RING.length - 1]).toContain(gap);
    }
  });

  it("puts the odd tile at a random position", () => {
    const rng = seededRng(46);
    const positions = new Set(Array.from({ length: 200 }, () => generateBoard(rng, 0).oddIndex));
    expect(positions.size).toBeGreaterThan(5);
  });
});

describe("isOddTap", () => {
  it("is true only for the odd tile", () => {
    const board = generateBoard(seededRng(47), 0);
    expect(isOddTap(board, board.oddIndex)).toBe(true);
    const other = board.oddIndex === 0 ? 1 : 0;
    expect(isOddTap(board, other)).toBe(false);
  });
});

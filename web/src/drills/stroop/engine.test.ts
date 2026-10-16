import { describe, expect, it } from "vitest";
import { COLOUR_NAMES, PALETTE, generateCard, type ColourName } from "./engine";
import { seededRng } from "../rng";

const SAMPLES = 10_000;

function sample(seed: number) {
  const rng = seededRng(seed);
  return Array.from({ length: SAMPLES }, () => generateCard(rng));
}

describe("PALETTE", () => {
  it("uses the five colour-blind-safe hues", () => {
    expect(PALETTE).toEqual({
      blue: "#0077BB",
      orange: "#EE7733",
      green: "#009988",
      red: "#CC3311",
      grey: "#BBBBBB",
    });
  });

  it("has five distinct hues", () => {
    expect(new Set(Object.values(PALETTE)).size).toBe(5);
    expect(COLOUR_NAMES).toHaveLength(5);
  });
});

describe("generateCard", () => {
  it("makes about half the cards mismatched", () => {
    const matches = sample(11).filter((c) => c.isMatch).length;
    expect(matches / SAMPLES).toBeGreaterThan(0.47);
    expect(matches / SAMPLES).toBeLessThan(0.53);
  });

  it("sets isMatch exactly when the word and ink agree", () => {
    for (const card of sample(12)) {
      expect(card.isMatch).toBe(card.word === card.inkColor);
    }
  });

  it("can produce every word and ink combination (25 in all)", () => {
    const seen = new Set(sample(13).map((c) => `${c.word}/${c.inkColor}`));
    const all = new Set<string>();
    for (const word of COLOUR_NAMES) for (const ink of COLOUR_NAMES) all.add(`${word}/${ink}`);
    expect(seen).toEqual(all);
  });

  it("only uses palette colours", () => {
    const names = new Set<ColourName>(COLOUR_NAMES);
    for (const card of sample(14).slice(0, 500)) {
      expect(names.has(card.word)).toBe(true);
      expect(names.has(card.inkColor)).toBe(true);
    }
  });
});

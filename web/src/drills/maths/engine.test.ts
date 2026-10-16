import { describe, expect, it } from "vitest";
import { OPERATORS, generateQuestion, trueResult } from "./engine";
import { seededRng } from "../rng";

const SAMPLES = 10_000;

function sample(seed: number) {
  const rng = seededRng(seed);
  return Array.from({ length: SAMPLES }, () => generateQuestion(rng));
}

describe("generateQuestion", () => {
  it("makes about half the questions wrong", () => {
    const wrong = sample(1).filter((q) => !q.isCorrect).length;
    expect(wrong / SAMPLES).toBeGreaterThan(0.47);
    expect(wrong / SAMPLES).toBeLessThan(0.53);
  });

  it("shows the real result when the question is correct and a different one when it is not", () => {
    for (const q of sample(2)) {
      const real = trueResult(q.lhs, q.operator, q.rhs);
      if (q.isCorrect) expect(q.shownResult).toBe(real);
      else expect(q.shownResult).not.toBe(real);
    }
  });

  it("covers every operator", () => {
    const seen = new Set(sample(3).map((q) => q.operator));
    expect(seen).toEqual(new Set(OPERATORS));
  });

  it("keeps operands and results in range and never shows a negative result", () => {
    for (const q of sample(4)) {
      expect(q.shownResult).toBeGreaterThanOrEqual(0);
      expect(q.shownResult).toBeLessThanOrEqual(400);
      if (q.operator === "+") {
        expect(q.lhs).toBeGreaterThanOrEqual(1);
        expect(q.rhs).toBeLessThanOrEqual(20);
      }
      if (q.operator === "−") {
        expect(q.rhs).toBeGreaterThanOrEqual(0);
        expect(q.rhs).toBeLessThanOrEqual(q.lhs);
      }
      if (q.operator === "×") {
        expect(q.lhs).toBeGreaterThanOrEqual(2);
        expect(q.rhs).toBeLessThanOrEqual(9);
      }
    }
  });

  it("is deterministic for a given seed", () => {
    expect(sample(5).slice(0, 20)).toEqual(sample(5).slice(0, 20));
  });
});

describe("trueResult", () => {
  it("applies each operator", () => {
    expect(trueResult(3, "+", 4)).toBe(7);
    expect(trueResult(9, "−", 4)).toBe(5);
    expect(trueResult(6, "×", 7)).toBe(42);
  });
});

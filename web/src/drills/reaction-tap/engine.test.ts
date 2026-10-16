import { describe, expect, it } from "vitest";
import {
  MAX_DELAY_MS,
  MIN_DELAY_MS,
  TARGET_TIMEOUT_MS,
  averageReaction,
  randomDelay,
  reactionTime,
} from "./engine";
import { seededRng } from "../rng";

describe("randomDelay", () => {
  it("stays between the minimum and maximum wait", () => {
    const rng = seededRng(51);
    for (let i = 0; i < 5_000; i++) {
      const delay = randomDelay(rng);
      expect(delay).toBeGreaterThanOrEqual(MIN_DELAY_MS);
      expect(delay).toBeLessThanOrEqual(MAX_DELAY_MS);
      expect(Number.isInteger(delay)).toBe(true);
    }
  });

  it("spreads across the whole range", () => {
    const rng = seededRng(52);
    const delays = Array.from({ length: 2_000 }, () => randomDelay(rng));
    expect(Math.min(...delays)).toBeLessThan(MIN_DELAY_MS + 200);
    expect(Math.max(...delays)).toBeGreaterThan(MAX_DELAY_MS - 200);
  });

  it("gives the target a timeout well under the longest wait", () => {
    expect(TARGET_TIMEOUT_MS).toBeLessThan(MAX_DELAY_MS);
  });
});

describe("reactionTime", () => {
  it("is the time from target shown to tap, in whole milliseconds", () => {
    expect(reactionTime(1000, 1245.4)).toBe(245);
  });

  it("never goes negative", () => {
    expect(reactionTime(1000, 990)).toBe(0);
  });
});

describe("averageReaction", () => {
  it("is null before any taps", () => {
    expect(averageReaction([])).toBeNull();
  });

  it("is the rounded mean of the reaction times", () => {
    expect(averageReaction([200, 300])).toBe(250);
    expect(averageReaction([250, 251, 250])).toBe(250);
    expect(averageReaction([100])).toBe(100);
  });
});

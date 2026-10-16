import { describe, expect, it } from "vitest";
import { DRILL_MS, timeLeftFraction } from "./timer";

describe("timeLeftFraction", () => {
  it("runs from full at the start to empty at 60 s", () => {
    expect(DRILL_MS).toBe(60_000);
    expect(timeLeftFraction(0)).toBe(1);
    expect(timeLeftFraction(30_000)).toBe(0.5);
    expect(timeLeftFraction(DRILL_MS)).toBe(0);
  });

  it("clamps outside the drill", () => {
    expect(timeLeftFraction(-500)).toBe(1);
    expect(timeLeftFraction(DRILL_MS + 1_000)).toBe(0);
  });
});

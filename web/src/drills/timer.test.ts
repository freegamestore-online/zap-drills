import { describe, expect, it } from "vitest";
import { DRILL_MS, elapsedMs, timeLeftFraction } from "./timer";

describe("elapsedMs", () => {
  it("uses wall-clock time across a throttled or suspended animation loop", () => {
    expect(elapsedMs(10_000, 71_000)).toBe(61_000);
  });

  it("does not report negative elapsed time", () => {
    expect(elapsedMs(20, 10)).toBe(0);
  });
});

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

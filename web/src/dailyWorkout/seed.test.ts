import { describe, expect, it, vi, afterEach } from "vitest";
import { DRILL_IDS } from "../drills/ids";
import { drillById } from "../drills/registry";
import { getDrillsForDate, getTodayDrills, hashDate, WORKOUT_LENGTH } from "./seed";
import { utcDate } from "./date";

afterEach(() => vi.useRealTimers());

const dates = Array.from({ length: 120 }, (_, i) => {
  const d = new Date(Date.UTC(2026, 0, 1 + i));
  return d.toISOString().slice(0, 10);
});

describe("getDrillsForDate", () => {
  it("gives the same three drills for the same date", () => {
    expect(getDrillsForDate("2026-10-16")).toEqual(getDrillsForDate("2026-10-16"));
  });

  it("returns three distinct valid drill ids", () => {
    for (const date of dates) {
      const drills = getDrillsForDate(date);
      expect(drills).toHaveLength(WORKOUT_LENGTH);
      expect(new Set(drills).size).toBe(WORKOUT_LENGTH);
      for (const id of drills) expect(DRILL_IDS).toContain(id);
    }
  });

  it("varies from day to day", () => {
    const workouts = new Set(dates.map((d) => getDrillsForDate(d).join("|")));
    expect(workouts.size).toBeGreaterThan(30);
  });

  it("gives different drills to neighbouring days, not the same set every time", () => {
    const sameAsYesterday = dates
      .slice(1)
      .filter((d, i) => getDrillsForDate(d).join() === getDrillsForDate(dates[i]!).join());
    expect(sameAsYesterday.length).toBeLessThan(dates.length / 10);
  });

  it("is stable for a fixed date string", () => {
    expect(hashDate("2026-10-16")).toBe(hashDate("2026-10-16"));
    expect(hashDate("2026-10-16")).not.toBe(hashDate("2026-10-17"));
  });

  it("only picks drills that exist in the registry", () => {
    for (const id of DRILL_IDS) expect(drillById(id).id).toBe(id);
  });
});

describe("getTodayDrills", () => {
  it("uses the UTC date, so the drills change at UTC midnight", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-16T23:59:00Z"));
    expect(utcDate()).toBe("2026-10-16");
    expect(getTodayDrills()).toEqual(getDrillsForDate("2026-10-16"));
    vi.setSystemTime(new Date("2026-10-17T00:01:00Z"));
    expect(getTodayDrills()).toEqual(getDrillsForDate("2026-10-17"));
  });
});

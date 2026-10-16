import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { dayKey, loadDayResult, saveDayResult, STREAK_KEY, type DayResult } from "./storage";
import { createMemoryStorage } from "../test/memoryStorage";

let store: ReturnType<typeof createMemoryStorage>;

beforeEach(() => {
  store = createMemoryStorage();
  vi.stubGlobal("localStorage", store);
});

afterEach(() => vi.unstubAllGlobals());

const day: DayResult = {
  date: "2026-10-16",
  drills: ["maths", "reaction-tap", "memory-grid"],
  scores: [12, 4, 9],
  total: 25,
};

describe("day results", () => {
  it("round-trips a finished workout under its date key", () => {
    saveDayResult(day);
    expect(store.getItem(dayKey("2026-10-16"))).not.toBeNull();
    expect(loadDayResult("2026-10-16")).toEqual(day);
  });

  it("reads nothing for a day with no workout", () => {
    expect(loadDayResult("2026-10-17")).toBeNull();
  });

  it("rejects a stored value with the wrong shape", () => {
    store.setItem(dayKey("2026-10-16"), JSON.stringify({ ...day, scores: [1, 2] }));
    expect(loadDayResult("2026-10-16")).toBeNull();
  });

  it("treats corrupt JSON as nothing stored", () => {
    store.setItem(dayKey("2026-10-16"), "{not json");
    expect(loadDayResult("2026-10-16")).toBeNull();
  });

  it("does not crash when storage throws", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(() => saveDayResult(day)).not.toThrow();
    expect(loadDayResult("2026-10-16")).toBeNull();
  });

  it("keeps the streak key separate from day keys", () => {
    expect(STREAK_KEY).not.toBe(dayKey("2026-10-16"));
  });
});

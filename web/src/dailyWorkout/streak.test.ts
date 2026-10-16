import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { loadStreak, recordCompletion } from "./streak";
import { STREAK_KEY } from "./storage";
import { createMemoryStorage } from "../test/memoryStorage";

let store: ReturnType<typeof createMemoryStorage>;

beforeEach(() => {
  store = createMemoryStorage();
  vi.stubGlobal("localStorage", store);
});

afterEach(() => vi.unstubAllGlobals());

describe("recordCompletion", () => {
  it("starts a streak of 1 on the first completion", () => {
    expect(recordCompletion("2026-10-16")).toBe(1);
    expect(JSON.parse(store.getItem(STREAK_KEY)!)).toEqual({ lastDate: "2026-10-16", streak: 1 });
  });

  it("increments on consecutive days", () => {
    expect(recordCompletion("2026-10-16")).toBe(1);
    expect(recordCompletion("2026-10-17")).toBe(2);
    expect(recordCompletion("2026-10-18")).toBe(3);
  });

  it("does not double-count a second completion on the same day", () => {
    recordCompletion("2026-10-16");
    recordCompletion("2026-10-17");
    expect(recordCompletion("2026-10-17")).toBe(2);
    expect(JSON.parse(store.getItem(STREAK_KEY)!).streak).toBe(2);
  });

  it("resets to 1 after a missed day", () => {
    recordCompletion("2026-10-16");
    recordCompletion("2026-10-17");
    expect(recordCompletion("2026-10-19")).toBe(1);
  });

  it("carries the streak across a month boundary", () => {
    recordCompletion("2026-01-31");
    expect(recordCompletion("2026-02-01")).toBe(2);
  });

  it("starts again after a corrupt record instead of throwing", () => {
    store.setItem(STREAK_KEY, "garbage");
    expect(recordCompletion("2026-10-16")).toBe(1);
  });

  it("ignores a record with an invalid streak value", () => {
    store.setItem(STREAK_KEY, JSON.stringify({ lastDate: "2026-10-15", streak: -4 }));
    expect(recordCompletion("2026-10-16")).toBe(1);
  });

  it("still returns a count when storage is blocked", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    });
    expect(recordCompletion("2026-10-16")).toBe(1);
  });
});

describe("loadStreak", () => {
  it("is 0 before anything is recorded", () => {
    expect(loadStreak("2026-10-16")).toEqual({ lastDate: null, streak: 0 });
  });

  it("stays alive through the next day until a workout is done", () => {
    recordCompletion("2026-10-16");
    recordCompletion("2026-10-17");
    expect(loadStreak("2026-10-18").streak).toBe(2);
  });

  it("shows 0 once a day has been missed", () => {
    recordCompletion("2026-10-16");
    expect(loadStreak("2026-10-18").streak).toBe(0);
  });

  it("does not write to storage", () => {
    recordCompletion("2026-10-16");
    const before = store.getItem(STREAK_KEY);
    loadStreak("2026-10-20");
    expect(store.getItem(STREAK_KEY)).toBe(before);
  });
});

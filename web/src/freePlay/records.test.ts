import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createMemoryStorage } from "../test/memoryStorage";
import { historyKey, loadHistory, loadPersonalBest, loadReactionBest, personalBestKey, reactionBestKey, recordReactionBest, recordRun, windowDates } from "./records";

let store: ReturnType<typeof createMemoryStorage>;

beforeEach(() => {
  store = createMemoryStorage();
  vi.stubGlobal("localStorage", store);
});

afterEach(() => vi.unstubAllGlobals());

const TODAY = "2026-10-16";

describe("personal bests", () => {
  it("keeps the fastest reaction average as the reaction personal best", () => {
    expect(recordReactionBest(310)).toBe(310);
    expect(recordReactionBest(340)).toBe(310);
    expect(recordReactionBest(275)).toBe(275);
    expect(loadReactionBest()).toBe(275);
    expect(JSON.parse(store.getItem(reactionBestKey)!)).toBe(275);
  });
  it("is null before any run", () => {
    expect(loadPersonalBest("maths")).toBeNull();
  });

  it("writes the first run and reads it back under zd_pb_<drill>", () => {
    expect(recordRun("maths", 12, TODAY)).toEqual({ personalBest: 12, isNewBest: true });
    expect(store.getItem(personalBestKey("maths"))).toBe("12");
    expect(loadPersonalBest("maths")).toBe(12);
  });

  it("updates when a run beats it", () => {
    recordRun("maths", 12, TODAY);
    expect(recordRun("maths", 20, TODAY)).toEqual({ personalBest: 20, isNewBest: true });
    expect(loadPersonalBest("maths")).toBe(20);
  });

  it("keeps the old best when a run is lower or equal", () => {
    recordRun("maths", 20, TODAY);
    expect(recordRun("maths", 15, TODAY)).toEqual({ personalBest: 20, isNewBest: false });
    expect(recordRun("maths", 20, TODAY)).toEqual({ personalBest: 20, isNewBest: false });
    expect(loadPersonalBest("maths")).toBe(20);
  });

  it("keeps each drill's best separate", () => {
    recordRun("maths", 9, TODAY);
    recordRun("memory-grid", 3, TODAY);
    expect(loadPersonalBest("maths")).toBe(9);
    expect(loadPersonalBest("memory-grid")).toBe(3);
  });

  it("ignores a corrupt stored value", () => {
    store.setItem(personalBestKey("maths"), "\"lots\"");
    expect(loadPersonalBest("maths")).toBeNull();
  });
});

describe("30-day history", () => {
  it("writes an entry and reads it back", () => {
    recordRun("maths", 7, TODAY);
    expect(loadHistory("maths", TODAY)).toEqual([{ date: TODAY, score: 7 }]);
    expect(JSON.parse(store.getItem(historyKey("maths"))!)).toEqual([{ date: TODAY, score: 7 }]);
  });

  it("keeps only the best score of each day", () => {
    recordRun("maths", 7, TODAY);
    recordRun("maths", 4, TODAY);
    recordRun("maths", 9, TODAY);
    expect(loadHistory("maths", TODAY)).toEqual([{ date: TODAY, score: 9 }]);
  });

  it("returns exactly the 30 days ending on today, oldest first", () => {
    const dates = windowDates(TODAY);
    expect(dates).toHaveLength(30);
    expect(dates[0]).toBe("2026-09-17");
    expect(dates[29]).toBe(TODAY);
  });

  it("trims entries older than the 30-day window when a run is recorded", () => {
    // The window is 30 days ending today, so 2026-09-17 is the oldest day kept.
    recordRun("maths", 5, "2026-09-16");
    recordRun("maths", 6, "2026-09-17");
    recordRun("maths", 8, TODAY);
    const stored = JSON.parse(store.getItem(historyKey("maths"))!) as { date: string }[];
    expect(stored.map((e) => e.date)).toEqual(["2026-09-17", TODAY]);
  });

  it("hides entries outside the window when reading, even if stored", () => {
    store.setItem(
      historyKey("maths"),
      JSON.stringify([
        { date: "2026-09-02", score: 1 },
        { date: "2026-09-17", score: 2 },
        { date: TODAY, score: 3 },
      ]),
    );
    expect(loadHistory("maths", TODAY)).toEqual([
      { date: "2026-09-17", score: 2 },
      { date: TODAY, score: 3 },
    ]);
  });

  it("skips corrupt entries", () => {
    store.setItem(historyKey("maths"), JSON.stringify([{ date: "nope", score: 1 }, { date: TODAY, score: "x" }, { date: TODAY, score: 4 }]));
    expect(loadHistory("maths", TODAY)).toEqual([{ date: TODAY, score: 4 }]);
  });

  it("keeps each drill's history separate", () => {
    recordRun("maths", 7, TODAY);
    expect(loadHistory("odd-one-out", TODAY)).toEqual([]);
  });
});

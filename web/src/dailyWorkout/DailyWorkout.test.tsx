import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLeaderboard } from "@freegamestore/games";
import { DailyWorkout } from "./DailyWorkout";
import { getDrillsForDate } from "./seed";
import { utcDate } from "./date";
import { drillById } from "../drills/registry";
import { loadDayResult, STREAK_KEY } from "./storage";
import { createMemoryStorage } from "../test/memoryStorage";

vi.mock("@freegamestore/games", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@freegamestore/games")>();
  return {
    ...actual,
    useLeaderboard: vi.fn(() => ({
      topScores: [],
      recentScores: [],
      loading: false,
      submitScore: vi.fn().mockResolvedValue({ ok: true }),
      refresh: vi.fn(),
    })),
  };
});

const DRILL_MS = 60_000;

let store: ReturnType<typeof createMemoryStorage>;

beforeEach(() => {
  vi.mocked(useLeaderboard).mockReturnValue({
    topScores: [],
    recentScores: [],
    loading: false,
    submitScore: vi.fn().mockResolvedValue({ ok: true }),
    refresh: vi.fn(),
  });
  store = createMemoryStorage();
  vi.stubGlobal("localStorage", store);
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame", "performance", "Date"] });
  // 2026-10-20 includes Reaction tap, covering its hosted leaderboard behavior.
  vi.setSystemTime(new Date("2026-10-20T12:00:00Z"));
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function playDrill(name: string) {
  fireEvent.click(screen.getByRole("button", { name: `Start ${name}` }));
  // Advance the 60 s clock in frame-sized steps so the drill's loop sees every frame.
  act(() => {
    vi.advanceTimersByTime(DRILL_MS + 100);
  });
}

async function renderDailyWorkout() {
  render(<DailyWorkout onExit={() => {}} />);
  // useLeaderboard settles its initial two fetches asynchronously after mount.
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
  });
}

/** Starts today's workout and plays all three drills to the results screen. */
async function playWholeWorkout() {
  const names = getDrillsForDate(utcDate()).map((id) => drillById(id).name);
  await renderDailyWorkout();
  fireEvent.click(screen.getByRole("button", { name: "Start workout" }));

  playDrill(names[0]!);
  fireEvent.click(screen.getByRole("button", { name: "Next drill (2 of 3)" }));
  playDrill(names[1]!);
  fireEvent.click(screen.getByRole("button", { name: "Next drill (3 of 3)" }));
  playDrill(names[2]!);
  fireEvent.click(screen.getByRole("button", { name: "See results" }));
  return names;
}

describe("DailyWorkout", () => {
  it("plays the three drills for today in order, then records the streak", async () => {
    const today = utcDate();
    const ids = getDrillsForDate(today);
    const names = await playWholeWorkout();

    expect(screen.getByRole("heading", { name: "Workout complete" })).toBeInTheDocument();
    for (const name of names) expect(screen.getByText(name)).toBeInTheDocument();
    expect(screen.getByText("Total")).toBeInTheDocument();
    expect(screen.getByText("Streak: 1 day")).toBeInTheDocument();

    const saved = loadDayResult(today);
    expect(saved).not.toBeNull();
    expect(saved!.drills).toEqual(ids);
    expect(saved!.scores).toHaveLength(3);
    expect(saved!.total).toBe(saved!.scores.reduce((a, b) => a + b, 0));
    expect(JSON.parse(store.getItem(STREAK_KEY)!)).toEqual({ lastDate: today, streak: 1 });
  });

  it("shows the saved result, without replaying, once today's workout is done", async () => {
    const today = utcDate();
    store.setItem(
      `zap-daily-${today}`,
      JSON.stringify({ date: today, drills: getDrillsForDate(today), scores: [3, 5, 7], total: 15 }),
    );
    await renderDailyWorkout();
    expect(screen.getByRole("heading", { name: "Workout complete" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start workout" })).toBeNull();
    expect(screen.getByText("15")).toBeInTheDocument();
  });
});

describe("leaderboard submission", () => {
  let submitScore: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    submitScore = vi.fn().mockResolvedValue({ ok: true });
    vi.mocked(useLeaderboard).mockReturnValue({
      topScores: [],
      recentScores: [],
      loading: false,
      submitScore,
      refresh: vi.fn(),
    });
  });

  it("submits the combined total when the workout is finished", async () => {
    await playWholeWorkout();

    expect(submitScore).toHaveBeenCalledOnce();
    expect(submitScore).toHaveBeenCalledWith(loadDayResult(utcDate())!.total);
  });

  it("handles an 'Invalid game' rejection quietly and still shows the results", async () => {
    submitScore.mockResolvedValue({ ok: false });

    await playWholeWorkout();

    expect(submitScore).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { name: "Workout complete" })).toBeInTheDocument();
    expect(screen.queryByText(/invalid game/i)).toBeNull();
    expect(loadDayResult(utcDate())).not.toBeNull();
  });

  it("survives a dropped connection without an unhandled error", async () => {
    submitScore.mockResolvedValue({ ok: false });

    await playWholeWorkout();

    expect(submitScore).toHaveBeenCalledOnce();
    expect(screen.getByRole("heading", { name: "Workout complete" })).toBeInTheDocument();
    expect(loadDayResult(utcDate())).not.toBeNull();
  });
});

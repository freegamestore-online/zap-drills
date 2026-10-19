import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DailyWorkout } from "./DailyWorkout";
import { getDrillsForDate } from "./seed";
import { utcDate } from "./date";
import { drillById } from "../drills/registry";
import { loadDayResult, STREAK_KEY } from "./storage";
import { createMemoryStorage } from "../test/memoryStorage";
import { GAME_ID } from "../config";

const DRILL_MS = 60_000;

let store: ReturnType<typeof createMemoryStorage>;

beforeEach(() => {
  store = createMemoryStorage();
  vi.stubGlobal("localStorage", store);
  vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame", "performance", "Date"] });
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
  /** The POST requests the workout sent to the leaderboard API. */
  function scorePosts(fetchMock: ReturnType<typeof vi.fn>) {
    return fetchMock.mock.calls.filter(([, init]) => (init as RequestInit | undefined)?.method === "POST");
  }

  it("submits the combined total when the workout is finished", async () => {
    const fetchMock = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({ ok: true, rank: 4 }) }));
    vi.stubGlobal("fetch", fetchMock);

    await playWholeWorkout();

    const [url, init] = scorePosts(fetchMock)[0]!;
    expect(String(url)).toMatch(/\/api\/scores$/);
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body).toEqual({ game: GAME_ID, score: loadDayResult(utcDate())!.total });
  });

  it("handles an 'Invalid game' rejection quietly and still shows the results", async () => {
    const fetchMock = vi.fn(() =>
      Promise.resolve({ ok: false, status: 400, json: () => Promise.resolve({ error: "Invalid game" }) }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await playWholeWorkout();

    expect(scorePosts(fetchMock)).toHaveLength(1);
    expect(screen.getByRole("heading", { name: "Workout complete" })).toBeInTheDocument();
    expect(screen.queryByText(/invalid game/i)).toBeNull();
    expect(loadDayResult(utcDate())).not.toBeNull();
  });

  it("survives a dropped connection without an unhandled error", async () => {
    const fetchMock = vi.fn(() => Promise.reject(new TypeError("Failed to fetch")));
    vi.stubGlobal("fetch", fetchMock);

    await playWholeWorkout();
    act(() => {
      vi.runOnlyPendingTimers();
    });

    expect(screen.getByRole("heading", { name: "Workout complete" })).toBeInTheDocument();
    expect(loadDayResult(utcDate())).not.toBeNull();
  });
});

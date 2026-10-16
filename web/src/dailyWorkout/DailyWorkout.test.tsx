import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DailyWorkout } from "./DailyWorkout";
import { getDrillsForDate } from "./seed";
import { utcDate } from "./date";
import { drillById } from "../drills/registry";
import { loadDayResult, STREAK_KEY } from "./storage";
import { createMemoryStorage } from "../test/memoryStorage";

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

describe("DailyWorkout", () => {
  it("plays the three drills for today in order, then records the streak", () => {
    const today = utcDate();
    const ids = getDrillsForDate(today);
    const names = ids.map((id) => drillById(id).name);

    render(<DailyWorkout onExit={() => {}} />);
    expect(names.every((n) => screen.getByText(n))).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Start workout" }));

    playDrill(names[0]!);
    expect(screen.getByRole("button", { name: "Next drill (2 of 3)" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next drill (2 of 3)" }));

    playDrill(names[1]!);
    expect(screen.getByRole("button", { name: "Next drill (3 of 3)" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Next drill (3 of 3)" }));

    playDrill(names[2]!);
    fireEvent.click(screen.getByRole("button", { name: "See results" }));

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

  it("shows the saved result, without replaying, once today's workout is done", () => {
    const today = utcDate();
    store.setItem(
      `zap-daily-${today}`,
      JSON.stringify({ date: today, drills: getDrillsForDate(today), scores: [3, 5, 7], total: 15 }),
    );
    render(<DailyWorkout onExit={() => {}} />);
    expect(screen.getByRole("heading", { name: "Workout complete" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Start workout" })).toBeNull();
    expect(screen.getByText("15")).toBeInTheDocument();
  });
});

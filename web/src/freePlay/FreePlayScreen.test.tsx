import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { FreePlayScreen } from "./FreePlayScreen";
import { createMemoryStorage } from "../test/memoryStorage";
import { personalBestKey } from "./records";

let store: ReturnType<typeof createMemoryStorage>;

beforeEach(() => {
  store = createMemoryStorage();
  vi.stubGlobal("localStorage", store);
});

afterEach(() => vi.unstubAllGlobals());

describe("FreePlayScreen", () => {
  it("lists all six drills", () => {
    render(<FreePlayScreen onExit={() => {}} />);
    for (const name of ["Quick maths", "Colour word", "Memory grid", "Number order", "Odd one out", "Reaction tap"]) {
      expect(screen.getByRole("button", { name: `Play ${name}` })).toBeInTheDocument();
    }
  });

  it("shows each drill's stored personal best, or none yet", () => {
    store.setItem(personalBestKey("maths"), "42");
    render(<FreePlayScreen onExit={() => {}} />);
    const maths = screen.getByRole("button", { name: "Play Quick maths" });
    expect(maths).toHaveTextContent("Best 42");
    expect(screen.getByRole("button", { name: "Play Colour word" })).toHaveTextContent("No best yet");
  });

  it("switches the chart to the drill picked in the selector", () => {
    const today = new Date().toISOString().slice(0, 10);
    store.setItem("zd_history_maths", JSON.stringify([{ date: today, score: 3 }]));
    store.setItem("zd_history_odd-one-out", JSON.stringify([{ date: today, score: 5 }]));
    render(<FreePlayScreen onExit={() => {}} />);
    expect(screen.getByRole("img", { name: /Quick maths/ })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "Drill to chart" }), { target: { value: "odd-one-out" } });
    expect(screen.getByRole("img", { name: /Odd one out/ })).toBeInTheDocument();
  });

  it("starts a drill when tapped and returns to the list from its Back button", () => {
    render(<FreePlayScreen onExit={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Play Quick maths" }));
    expect(screen.getByRole("button", { name: "Start Quick maths" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("button", { name: "Play Quick maths" })).toBeInTheDocument();
  });

  it("calls onExit from the header Back button", () => {
    const onExit = vi.fn();
    render(<FreePlayScreen onExit={onExit} />);
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(onExit).toHaveBeenCalledOnce();
  });
});

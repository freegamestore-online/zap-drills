import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("lists all six drills on the menu", () => {
    render(<App />);
    for (const name of ["Quick maths", "Colour word", "Memory grid", "Number order", "Odd one out", "Reaction tap"]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("opens each drill with a tap-to-start overlay and returns to the menu", () => {
    render(<App />);
    for (const [menu, start] of [
      ["Quick maths", "Start Quick maths"],
      ["Colour word", "Start Colour word"],
      ["Memory grid", "Start Memory grid"],
      ["Number order", "Start Number order"],
      ["Odd one out", "Start Odd one out"],
      ["Reaction tap", "Start Reaction tap"],
    ] as const) {
      fireEvent.click(screen.getByRole("button", { name: menu }));
      expect(screen.getByRole("button", { name: start })).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Back" }));
      expect(screen.getByRole("button", { name: menu })).toBeInTheDocument();
    }
  });

  it("starts a drill and shows its answer buttons", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Quick maths" }));
    fireEvent.click(screen.getByRole("button", { name: "Start Quick maths" }));
    expect(screen.getByRole("button", { name: "YES" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "NO" })).toBeEnabled();
  });
});

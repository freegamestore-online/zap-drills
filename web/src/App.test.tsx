import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("lists the three drills on the menu", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "Quick maths" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Colour word" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Memory grid" })).toBeInTheDocument();
  });

  it("opens each drill with a tap-to-start overlay and returns to the menu", () => {
    render(<App />);
    for (const [menu, start] of [
      ["Quick maths", "Start Quick maths"],
      ["Colour word", "Start Colour word"],
      ["Memory grid", "Start Memory grid"],
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

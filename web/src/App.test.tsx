import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("offers the daily workout and free play on the menu", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: "Daily workout" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Free play" })).toBeInTheDocument();
  });

  it("opens the daily workout intro with three drills and a start button", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Daily workout" }));
    expect(screen.getByRole("heading", { name: "Daily workout" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Start workout" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("button", { name: "Daily workout" })).toBeInTheDocument();
  });

  it("opens the free play list with all six drills", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Free play" }));
    expect(screen.getByRole("heading", { name: "Free play" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play Reaction tap" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByRole("button", { name: "Free play" })).toBeInTheDocument();
  });

  it("starts a drill from free play and shows its answer buttons", () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Free play" }));
    fireEvent.click(screen.getByRole("button", { name: "Play Quick maths" }));
    fireEvent.click(screen.getByRole("button", { name: "Start Quick maths" }));
    expect(screen.getByRole("button", { name: "YES" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "NO" })).toBeEnabled();
  });
});

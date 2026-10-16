import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DayBarChart } from "./DayBarChart";

const TODAY = "2026-10-16";

describe("DayBarChart", () => {
  it("draws one bar per day that has a score", () => {
    const history = [
      { date: "2026-10-03", score: 4 },
      { date: "2026-10-10", score: 8 },
      { date: TODAY, score: 2 },
    ];
    const { container } = render(<DayBarChart label="Quick maths" history={history} today={TODAY} />);
    expect(container.querySelectorAll('[data-testid="chart-bar"]')).toHaveLength(3);
  });

  it("leaves gaps for days with no run", () => {
    const { container } = render(
      <DayBarChart label="Quick maths" history={[{ date: TODAY, score: 5 }]} today={TODAY} />,
    );
    expect(container.querySelectorAll('[data-testid="chart-bar"]')).toHaveLength(1);
  });

  it("never draws more than 14 bars", () => {
    const history = Array.from({ length: 14 }, (_, i) => ({
      date: new Date(Date.UTC(2026, 9, 3 + i)).toISOString().slice(0, 10),
      score: i + 1,
    }));
    const { container } = render(<DayBarChart label="Quick maths" history={history} today={TODAY} />);
    expect(container.querySelectorAll('[data-testid="chart-bar"]')).toHaveLength(14);
  });

  it("scales the tallest bar to the full height", () => {
    const { container } = render(
      <DayBarChart
        label="Quick maths"
        history={[
          { date: "2026-10-15", score: 5 },
          { date: TODAY, score: 10 },
        ]}
        today={TODAY}
      />,
    );
    const bars = container.querySelectorAll<SVGRectElement>('[data-testid="chart-bar"]');
    expect(bars[1]!.getAttribute("height")).toBe("110");
    expect(bars[0]!.getAttribute("height")).toBe("55");
  });

  it("labels the chart and says so when there is no data", () => {
    render(<DayBarChart label="Odd one out" history={[]} today={TODAY} />);
    expect(screen.getByText(/No runs in the last 14 days yet/)).toBeInTheDocument();
  });

  it("has an accessible label", () => {
    render(<DayBarChart label="Odd one out" history={[{ date: TODAY, score: 1 }]} today={TODAY} />);
    expect(screen.getByRole("img", { name: /Odd one out/ })).toBeInTheDocument();
  });
});

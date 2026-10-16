import { describe, expect, it, vi, afterEach } from "vitest";
import { previousUtcDate, utcDate } from "./date";

afterEach(() => vi.useRealTimers());

describe("utcDate", () => {
  it("uses the UTC calendar day, not the local one", () => {
    expect(utcDate(new Date("2026-10-16T23:59:59Z"))).toBe("2026-10-16");
    expect(utcDate(new Date("2026-10-17T00:00:00Z"))).toBe("2026-10-17");
  });
});

describe("previousUtcDate", () => {
  it("steps back one day", () => {
    expect(previousUtcDate("2026-10-16")).toBe("2026-10-15");
  });

  it("crosses month boundaries", () => {
    expect(previousUtcDate("2026-03-01")).toBe("2026-02-28");
    expect(previousUtcDate("2026-05-01")).toBe("2026-04-30");
  });

  it("crosses year boundaries", () => {
    expect(previousUtcDate("2026-01-01")).toBe("2025-12-31");
  });

  it("handles leap days", () => {
    expect(previousUtcDate("2028-03-01")).toBe("2028-02-29");
  });
});

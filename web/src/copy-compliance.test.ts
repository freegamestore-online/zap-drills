import { describe, expect, it } from "vitest";
import indexHtml from "../index.html?raw";

// Zap Drills makes no cognitive-benefit claims. The FTC fined Lumosity $2M in 2016 for
// similar claims, so the shipped copy must say "fun quick puzzles", never these.
const BANNED: RegExp[] = [
  /improve memory/i,
  /boost.*brain/i,
  /\bIQ\b/i,
  /brain health/i,
  /cognitive benefit/i,
  /make you smarter/i,
  /enhance.*cognit/i,
];

// Every source file under src, as raw text. This file is excluded because it lists the banned phrases.
const sources = import.meta.glob<string>(["./**/*.{ts,tsx}", "!./copy-compliance.test.ts"], {
  query: "?raw",
  import: "default",
  eager: true,
});

describe("shipped copy", () => {
  it("contains no cognitive-benefit claims", () => {
    const violations: string[] = [];
    for (const [file, text] of Object.entries(sources)) {
      text.split("\n").forEach((line, index) => {
        if (BANNED.some((pattern) => pattern.test(line))) {
          violations.push(`${file}:${index + 1}: ${line.trim()}`);
        }
      });
    }
    expect(violations).toEqual([]);
  });

  it("covers the HTML shell (title and meta description) too", () => {
    const violations = indexHtml
      .split("\n")
      .filter((line) => BANNED.some((pattern) => pattern.test(line)));
    expect(violations).toEqual([]);
  });

  it("scans the drill sources", () => {
    expect(Object.keys(sources)).toContain("./drills/maths/MathsDrill.tsx");
  });
});

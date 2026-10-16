import { randInt, type Rng } from "../rng";

export const OPERATORS = ["+", "−", "×"] as const;
export type Operator = (typeof OPERATORS)[number];

export interface Question {
  lhs: number;
  rhs: number;
  operator: Operator;
  /** The result printed on screen. Equals the real result when isCorrect is true. */
  shownResult: number;
  isCorrect: boolean;
}

/** The real result of `lhs operator rhs`. */
export function trueResult(lhs: number, operator: Operator, rhs: number): number {
  switch (operator) {
    case "+":
      return lhs + rhs;
    case "−":
      return lhs - rhs;
    case "×":
      return lhs * rhs;
  }
}

// Small nudges off the real answer, so a wrong result looks plausible.
const WRONG_OFFSETS = [-3, -2, -1, 1, 2, 3];

function wrongResult(rng: Rng, correct: number): number {
  // Keep the result non-negative. Always at least one option survives (correct + 1 or + 2).
  const options = WRONG_OFFSETS.map((d) => correct + d).filter((v) => v >= 0);
  return options[randInt(rng, 0, options.length - 1)]!;
}

/** Generates one true/false question. About half the shown results are wrong. */
export function generateQuestion(rng: Rng): Question {
  const operator = OPERATORS[randInt(rng, 0, OPERATORS.length - 1)]!;
  let lhs: number;
  let rhs: number;
  switch (operator) {
    case "+":
      lhs = randInt(rng, 1, 20);
      rhs = randInt(rng, 1, 20);
      break;
    case "−":
      lhs = randInt(rng, 1, 20);
      rhs = randInt(rng, 0, lhs); // never a negative result
      break;
    case "×":
      lhs = randInt(rng, 2, 9);
      rhs = randInt(rng, 2, 9);
      break;
  }

  const correct = trueResult(lhs, operator, rhs);
  const isCorrect = rng() < 0.5;
  return {
    lhs,
    rhs,
    operator,
    shownResult: isCorrect ? correct : wrongResult(rng, correct),
    isCorrect,
  };
}

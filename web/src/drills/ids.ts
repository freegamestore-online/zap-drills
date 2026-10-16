/** Every drill, in menu order. The daily workout picks three of these. */
export const DRILL_IDS = [
  "maths",
  "colour-word",
  "memory-grid",
  "number-order",
  "odd-one-out",
  "reaction-tap",
] as const;

export type DrillId = (typeof DRILL_IDS)[number];

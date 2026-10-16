import { pick, type Rng } from "../rng";

/**
 * Colour-blind-safe inks: five hues that stay distinct under protanopia, deuteranopia
 * and tritanopia. Each colour is also named in the word, so colour is never the only cue.
 */
export const PALETTE = {
  blue: "#0077BB",
  orange: "#EE7733",
  green: "#009988",
  red: "#CC3311",
  grey: "#BBBBBB",
} as const;

export type ColourName = keyof typeof PALETTE;
export const COLOUR_NAMES = Object.keys(PALETTE) as ColourName[];

export interface StroopCard {
  /** The colour the word names. */
  word: ColourName;
  /** The colour the word is drawn in. Equals `word` when isMatch is true. */
  inkColor: ColourName;
  isMatch: boolean;
}

/** Generates one card. About half the cards are mismatched. */
export function generateCard(rng: Rng): StroopCard {
  const word = pick(rng, COLOUR_NAMES);
  const isMatch = rng() < 0.5;
  const inkColor = isMatch ? word : pick(rng, COLOUR_NAMES.filter((c) => c !== word));
  return { word, inkColor, isMatch };
}

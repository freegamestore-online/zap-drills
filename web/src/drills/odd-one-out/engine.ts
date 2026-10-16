import { pick, randInt, type Rng } from "../rng";
import { COLOUR_NAMES, type ColourName } from "../stroop/engine";

export const SHAPES = ["circle", "square", "triangle", "diamond"] as const;
export type ShapeName = (typeof SHAPES)[number];

/**
 * Colours in ring order. Tier 2 picks neighbours on this ring, so the odd colour is
 * the hardest to spot. The palette is colour-blind safe, so neighbours stay distinct.
 */
export const COLOUR_RING: readonly ColourName[] = ["blue", "green", "grey", "red", "orange"];

export interface Tile {
  shape: ShapeName;
  colour: ColourName;
}

export interface Board {
  gridSize: number;
  tiles: Tile[];
  /** Index into `tiles` of the odd one out. */
  oddIndex: number;
}

/** 0 = shape differs on a 3×3 grid, 1 = colour differs on a 4×4 grid, 2 = colour differs by a neighbour on the ring. */
export function tierFor(streak: number): 0 | 1 | 2 {
  return Math.min(2, Math.floor(streak / 3)) as 0 | 1 | 2;
}

export function generateBoard(rng: Rng, streak: number): Board {
  const tier = tierFor(streak);
  const gridSize = tier === 0 ? 3 : 4;
  const count = gridSize * gridSize;

  let common: Tile = { shape: pick(rng, SHAPES), colour: "blue" };
  let odd: Tile;
  if (tier === 0) {
    const shape = pick(rng, SHAPES.filter((s) => s !== common.shape));
    odd = { shape, colour: common.colour };
  } else {
    common = { shape: "circle", colour: pick(rng, COLOUR_NAMES) };
    if (tier === 1) {
      const colour = pick(rng, COLOUR_NAMES.filter((c) => c !== common.colour));
      odd = { shape: common.shape, colour };
    } else {
      const ringIndex = COLOUR_RING.indexOf(common.colour);
      const step = rng() < 0.5 ? 1 : -1;
      const neighbour = COLOUR_RING[(ringIndex + step + COLOUR_RING.length) % COLOUR_RING.length]!;
      odd = { shape: common.shape, colour: neighbour };
    }
  }

  const oddIndex = randInt(rng, 0, count - 1);
  const tiles = Array.from({ length: count }, (_, i) => (i === oddIndex ? odd : common));
  return { gridSize, tiles, oddIndex };
}

/** True when the tapped tile is the odd one out. */
export function isOddTap(board: Board, tapped: number): boolean {
  return tapped === board.oddIndex;
}

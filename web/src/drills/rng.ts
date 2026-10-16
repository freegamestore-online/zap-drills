/** A source of random numbers in [0, 1). Math.random in the app, a seeded one in tests. */
export type Rng = () => number;

/** Inclusive integer in [min, max]. */
export function randInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

/** Uniformly random element. Throws on an empty list. */
export function pick<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) throw new Error("pick: empty list");
  return items[randInt(rng, 0, items.length - 1)]!;
}

/** Fisher–Yates shuffle. Returns a new array and leaves the input alone. */
export function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randInt(rng, 0, i);
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** Deterministic generator (mulberry32) so tests can check distributions. */
export function seededRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

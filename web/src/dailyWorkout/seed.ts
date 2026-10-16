import { DRILL_IDS, type DrillId } from "../drills/ids";
import { seededRng, shuffle } from "../drills/rng";
import { utcDate } from "./date";

/** How many drills make up one workout. */
export const WORKOUT_LENGTH = 3;

/** FNV-1a, 32-bit: a small, stable hash of the date string. */
export function hashDate(date: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < date.length; i++) {
    hash ^= date.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** The workout for a date: the same three drills for everyone on that UTC day. */
export function getDrillsForDate(date: string): DrillId[] {
  return shuffle(seededRng(hashDate(date)), DRILL_IDS).slice(0, WORKOUT_LENGTH);
}

export function getTodayDrills(): DrillId[] {
  return getDrillsForDate(utcDate());
}

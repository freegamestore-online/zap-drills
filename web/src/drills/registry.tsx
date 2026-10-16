import type { ComponentType } from "react";
import { MathsDrill } from "./maths/MathsDrill";
import { StroopDrill } from "./stroop/StroopDrill";
import { MemoryDrill } from "./memory/MemoryDrill";
import { NumberOrderDrill } from "./number-order/NumberOrderDrill";
import { OddOneOutDrill } from "./odd-one-out/OddOneOutDrill";
import { ReactionTapDrill } from "./reaction-tap/ReactionTapDrill";
import type { DrillId } from "./ids";

export interface DrillInfo {
  id: DrillId;
  name: string;
  Component: ComponentType<{ onExit: () => void }>;
}

export const DRILLS: DrillInfo[] = [
  { id: "maths", name: "Quick maths", Component: MathsDrill },
  { id: "colour-word", name: "Colour word", Component: StroopDrill },
  { id: "memory-grid", name: "Memory grid", Component: MemoryDrill },
  { id: "number-order", name: "Number order", Component: NumberOrderDrill },
  { id: "odd-one-out", name: "Odd one out", Component: OddOneOutDrill },
  { id: "reaction-tap", name: "Reaction tap", Component: ReactionTapDrill },
];

export function drillById(id: DrillId): DrillInfo {
  const drill = DRILLS.find((d) => d.id === id);
  if (!drill) throw new Error(`Unknown drill: ${id}`);
  return drill;
}

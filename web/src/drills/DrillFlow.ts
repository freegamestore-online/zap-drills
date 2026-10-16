import { createContext } from "react";

/**
 * Lets a host (the daily workout) hear a drill's score and drive what comes next.
 * Drills run standalone when no host provides this, so the default does nothing.
 */
export interface DrillFlow {
  /** Called once when the drill finishes, with its score. */
  onFinish?: (score: number) => void;
  /** Replaces "Play again" on the drill-complete card with a button that moves the host on. */
  next?: { label: string; onNext: () => void };
}

export const DrillFlowContext = createContext<DrillFlow>({});

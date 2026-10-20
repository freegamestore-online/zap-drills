import { useCallback, useEffect, useRef, useState } from "react";
import { useGameLoop } from "../hooks/useGameLoop";
import { DRILL_MS, elapsedMs, timeLeftFraction } from "./timer";

export type DrillStatus = "ready" | "running" | "done";

/** The result of the last answer. A new object each time, so the same result can flash twice. */
export interface Verdict {
  correct: boolean;
}

export interface DrillSession {
  status: DrillStatus;
  /** Share of the 60 s left, for the timer bar. */
  timeLeft: number;
  score: number;
  total: number;
  verdict: Verdict | null;
  start: () => void;
  record: (correct: boolean) => void;
}

const FLASH_MS = 450;

/**
 * Clock, score and feedback shared by every drill. The clock runs only while the
 * drill is running and moves it to "done" after 60 s.
 */
export function useDrillSession(): DrillSession {
  const [status, setStatus] = useState<DrillStatus>("ready");
  const [timeLeft, setTimeLeft] = useState(1);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const elapsedRef = useRef(0);
  const startedAtRef = useRef(0);

  useGameLoop(() => {
    elapsedRef.current = elapsedMs(startedAtRef.current, performance.now());
    setTimeLeft(timeLeftFraction(elapsedRef.current));
    if (elapsedRef.current >= DRILL_MS) setStatus("done");
  }, status !== "running");

  const start = useCallback(() => {
    startedAtRef.current = performance.now();
    elapsedRef.current = 0;
    setTimeLeft(1);
    setScore(0);
    setTotal(0);
    setVerdict(null);
    setStatus("running");
  }, []);

  const record = useCallback((correct: boolean) => {
    setTotal((t) => t + 1);
    if (correct) setScore((s) => s + 1);
    setVerdict({ correct });
  }, []);

  useEffect(() => {
    if (!verdict) return;
    const timer = setTimeout(() => setVerdict(null), FLASH_MS);
    return () => clearTimeout(timer);
  }, [verdict]);

  return { status, timeLeft, score, total, verdict, start, record };
}

import { useState } from "react";
import { GameButton } from "@freegamestore/games";
import { DrillFlowContext } from "../drills/DrillFlow";
import { drillById } from "../drills/registry";
import type { DrillId } from "../drills/ids";
import { utcDate } from "./date";
import { getDrillsForDate, WORKOUT_LENGTH } from "./seed";
import { loadStreak, recordCompletion } from "./streak";
import { loadDayResult, saveDayResult, type DayResult } from "./storage";

type Phase = "intro" | "playing" | "results";

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const days = (n: number) => `${n} ${n === 1 ? "day" : "days"}`;

/**
 * Today's three drills, played in order. Each drill's score is kept, the total is shown
 * at the end, and the streak moves on once the workout is complete.
 */
export function DailyWorkout({ onExit }: { onExit: () => void }) {
  // Fixed for this visit, so a run that crosses midnight still finishes against its own date.
  const [today] = useState(utcDate);
  const [drillIds] = useState<DrillId[]>(() => getDrillsForDate(today));
  const [saved] = useState(() => loadDayResult(today));
  const [phase, setPhase] = useState<Phase>(saved ? "results" : "intro");
  const [index, setIndex] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [result, setResult] = useState<DayResult | null>(saved);
  const [streak, setStreak] = useState(() => loadStreak(today).streak);

  const start = () => {
    setIndex(0);
    setScores([]);
    setPhase("playing");
  };

  const finish = () => {
    const day: DayResult = { date: today, drills: drillIds, scores, total: sum(scores) };
    saveDayResult(day);
    setStreak(recordCompletion(today));
    setResult(day);
    setPhase("results");
  };

  const next = () => {
    if (index + 1 < WORKOUT_LENGTH) setIndex(index + 1);
    else finish();
  };

  if (phase === "playing") {
    const isLast = index + 1 === WORKOUT_LENGTH;
    const { Component } = drillById(drillIds[index]!);
    return (
      // Keyed by position so each drill mounts fresh.
      <DrillFlowContext.Provider
        key={index}
        value={{
          onFinish: (score) => setScores((prev) => [...prev, score]),
          next: {
            label: isLast ? "See results" : `Next drill (${index + 2} of ${WORKOUT_LENGTH})`,
            onNext: next,
          },
        }}
      >
        <Component onExit={onExit} />
      </DrillFlowContext.Provider>
    );
  }

  if (phase === "results" && result) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4" style={{ textAlign: "center" }}>
        <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
          Workout complete
        </h1>
        <p style={{ color: "var(--muted)" }}>
          {saved ? "You finished today's workout. Come back tomorrow." : "Nice work. Come back tomorrow."}
        </p>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, width: "100%", maxWidth: 320 }}>
          {result.drills.map((id, i) => (
            <li
              key={id}
              style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--line)" }}
            >
              <span>{drillById(id).name}</span>
              <span style={{ fontWeight: 700 }}>{result.scores[i]}</span>
            </li>
          ))}
          <li style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontWeight: 800 }}>
            <span>Total</span>
            <span>{result.total}</span>
          </li>
        </ul>
        <p style={{ fontWeight: 700 }}>Streak: {days(streak)}</p>
        <GameButton size="lg" onClick={onExit}>
          Back to menu
        </GameButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-4" style={{ textAlign: "center" }}>
      <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
        Daily workout
      </h1>
      <p style={{ color: "var(--muted)" }}>Three drills, the same for everyone today ({today} UTC).</p>
      <ol style={{ margin: 0, padding: 0, listStyle: "none", fontWeight: 700 }}>
        {drillIds.map((id) => (
          <li key={id} style={{ padding: "4px 0" }}>
            {drillById(id).name}
          </li>
        ))}
      </ol>
      <p style={{ fontWeight: 700 }}>Streak: {days(loadStreak(today).streak)}</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 320 }}>
        <GameButton size="lg" block onClick={start}>
          Start workout
        </GameButton>
        <GameButton variant="ghost" size="md" block onClick={onExit}>
          Back
        </GameButton>
      </div>
    </div>
  );
}

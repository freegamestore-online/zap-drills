import { useEffect, useState } from "react";
import { GameButton } from "@freegamestore/games";
import { prefersReducedMotion } from "../../feel";
import { DrillShell } from "../DrillShell";
import { useDrillSession } from "../useDrillSession";
import { checkAnswer, generateRound, REDUCED_SHOW_MS, SHOW_MS, type Round } from "./engine";

/** Pause on the verdict before the next grid appears. */
const RESULT_MS = 600;

type Phase = "show" | "recall" | "result";

const rollRound = (streak: number): Round => generateRound(Math.random, streak);

export function MemoryDrill({ onExit }: { onExit: () => void }) {
  const session = useDrillSession();
  const running = session.status === "running";
  const [round, setRound] = useState<Round>({ gridSize: 3, litCells: [] });
  const [phase, setPhase] = useState<Phase>("show");
  const [picked, setPicked] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);

  const start = () => {
    setStreak(0);
    setRound(rollRound(0));
    setPicked([]);
    setPhase("show");
    session.start();
  };

  // Lit cells stay up, then blank so the player has to recall them.
  useEffect(() => {
    if (!running || phase !== "show") return;
    const timer = setTimeout(() => setPhase("recall"), prefersReducedMotion() ? REDUCED_SHOW_MS : SHOW_MS);
    return () => clearTimeout(timer);
  }, [running, phase]);

  // After the verdict, move on to a new round. The streak sets the difficulty.
  useEffect(() => {
    if (!running || phase !== "result") return;
    const timer = setTimeout(() => {
      setRound(rollRound(streak));
      setPicked([]);
      setPhase("show");
    }, RESULT_MS);
    return () => clearTimeout(timer);
  }, [running, phase, streak]);

  const toggle = (cell: number) => {
    if (!running || phase !== "recall") return;
    setPicked((p) => (p.includes(cell) ? p.filter((c) => c !== cell) : [...p, cell]));
  };

  const submit = () => {
    if (!running || phase !== "recall") return;
    const correct = checkAnswer(round.litCells, picked);
    session.record(correct);
    setStreak((s) => (correct ? s + 1 : 0));
    setPhase("result");
  };

  const cells = Array.from({ length: round.gridSize * round.gridSize }, (_, i) => i);
  const litCells = new Set(round.litCells);
  const revealing = phase === "show" || phase === "result";

  return (
    <DrillShell
      title="Memory grid"
      instructions="Remember the lit cells, then tap them back. Get a streak to unlock a bigger grid."
      session={session}
      onStart={start}
      onExit={onExit}
    >
      <p style={{ color: "var(--muted)", fontWeight: 700 }}>
        {phase === "show" ? "Remember these" : phase === "recall" ? "Tap the cells, then submit" : " "}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${round.gridSize}, 1fr)`,
          gap: 8,
          width: "min(100%, 42svh)",
        }}
      >
        {cells.map((cell) => {
          const lit = litCells.has(cell);
          const selected = picked.includes(cell);
          const wrongPick = phase === "result" && selected && !lit;
          let background = "var(--panel)";
          let border = "var(--line)";
          if (revealing && lit) background = "var(--accent)";
          if (phase === "recall" && selected) {
            background = "var(--accent-soft)";
            border = "var(--accent)";
          }
          if (wrongPick) background = "var(--error)";

          return (
            <button
              key={cell}
              type="button"
              aria-label={`Cell ${cell + 1}`}
              aria-pressed={phase === "recall" ? selected : undefined}
              disabled={phase !== "recall" || !running}
              onClick={() => toggle(cell)}
              style={{
                aspectRatio: "1 / 1",
                minWidth: 44,
                minHeight: 44,
                borderRadius: 12,
                border: `2px solid ${border}`,
                background,
                padding: 0,
                cursor: phase === "recall" ? "pointer" : "default",
              }}
            />
          );
        })}
      </div>

      <div style={{ width: "100%", maxWidth: 420 }}>
        <GameButton size="lg" block disabled={phase !== "recall" || !running} onClick={submit}>
          Submit
        </GameButton>
      </div>
    </DrillShell>
  );
}

import { useState } from "react";
import { DrillShell } from "../DrillShell";
import { useDrillSession } from "../useDrillSession";
import { countFor, generateBoard, isNextInOrder, type Tile } from "./engine";

const rollBoard = (streak: number): Tile[] => generateBoard(Math.random, countFor(streak));

export function NumberOrderDrill({ onExit }: { onExit: () => void }) {
  const session = useDrillSession();
  const running = session.status === "running";
  const [streak, setStreak] = useState(0);
  const [board, setBoard] = useState<Tile[]>(() => rollBoard(0));
  // How many numbers on this board have been tapped in order.
  const [cleared, setCleared] = useState(0);

  const start = () => {
    setStreak(0);
    setBoard(rollBoard(0));
    setCleared(0);
    session.start();
  };

  const tap = (tile: Tile) => {
    if (!running || tile.value <= cleared) return;
    if (isNextInOrder(cleared, tile.value)) {
      session.record(true);
      if (cleared + 1 === board.length) {
        // Board finished: the next one is bigger.
        const next = streak + 1;
        setStreak(next);
        setBoard(rollBoard(next));
        setCleared(0);
      } else {
        setCleared(cleared + 1);
      }
    } else {
      // Wrong number: start over with a small board.
      session.record(false);
      setStreak(0);
      setBoard(rollBoard(0));
      setCleared(0);
    }
  };

  return (
    <DrillShell
      title="Number order"
      instructions="Tap the numbers from 1 upwards, as fast as you can. Each finished board adds a number."
      session={session}
      onStart={start}
      onExit={onExit}
    >
      <div style={{ position: "relative", flex: 1, width: "100%", minHeight: 0 }}>
        <p
          style={{ position: "absolute", top: 0, left: 0, right: 0, textAlign: "center", color: "var(--muted)", fontWeight: 700 }}
        >
          Next: {cleared + 1}
        </p>
        {board.map((tile) => {
          const done = tile.value <= cleared;
          return (
            <button
              key={tile.value}
              type="button"
              aria-label={`Number ${tile.value}`}
              disabled={!running || done}
              onClick={() => tap(tile)}
              style={{
                position: "absolute",
                left: `${tile.x}%`,
                top: `${tile.y}%`,
                transform: "translate(-50%, -50%)",
                width: "min(15vw, 13svh, 72px)",
                aspectRatio: "1 / 1",
                minWidth: 44,
                minHeight: 44,
                borderRadius: "50%",
                border: `2px solid ${done ? "var(--line)" : "var(--accent)"}`,
                background: done ? "var(--panel)" : "var(--paper)",
                color: done ? "var(--muted)" : "var(--ink)",
                fontWeight: 800,
                fontSize: "clamp(1.1rem, 4svh, 1.6rem)",
                fontVariantNumeric: "tabular-nums",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {tile.value}
            </button>
          );
        })}
      </div>
    </DrillShell>
  );
}

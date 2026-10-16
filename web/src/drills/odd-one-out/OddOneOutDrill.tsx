import { useState, type ReactElement } from "react";
import { DrillShell } from "../DrillShell";
import { useDrillSession } from "../useDrillSession";
import { PALETTE } from "../stroop/engine";
import { generateBoard, isOddTap, type Board, type ShapeName, type Tile } from "./engine";

const rollBoard = (streak: number): Board => generateBoard(Math.random, streak);

// Shapes drawn in a 100×100 box so every one fills the tile the same way.
const SHAPE_PATHS: Record<ShapeName, ReactElement> = {
  circle: <circle cx="50" cy="50" r="40" />,
  square: <rect x="12" y="12" width="76" height="76" />,
  triangle: <polygon points="50,10 90,88 10,88" />,
  diamond: <polygon points="50,6 94,50 50,94 6,50" />,
};

function ShapeTile({ tile }: { tile: Tile }) {
  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true" focusable="false">
      <g fill={PALETTE[tile.colour]}>{SHAPE_PATHS[tile.shape]}</g>
    </svg>
  );
}

export function OddOneOutDrill({ onExit }: { onExit: () => void }) {
  const session = useDrillSession();
  const running = session.status === "running";
  const [streak, setStreak] = useState(0);
  const [board, setBoard] = useState<Board>(() => rollBoard(0));

  const start = () => {
    setStreak(0);
    setBoard(rollBoard(0));
    session.start();
  };

  const tap = (index: number) => {
    if (!running) return;
    const correct = isOddTap(board, index);
    session.record(correct);
    // A right answer raises the streak, which raises the difficulty. A wrong one resets it.
    const next = correct ? streak + 1 : 0;
    setStreak(next);
    setBoard(rollBoard(next));
  };

  return (
    <DrillShell
      title="Odd one out"
      instructions="One shape is different. Tap the odd one out. It gets harder as your streak grows."
      session={session}
      onStart={start}
      onExit={onExit}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${board.gridSize}, 1fr)`,
          gap: 8,
          width: "min(100%, 56svh)",
        }}
      >
        {board.tiles.map((tile, index) => (
          <button
            // Tiles have no stable identity and the whole grid is replaced each round.
            // biome-ignore lint/suspicious/noArrayIndexKey: position is the only key a round has
            key={index}
            type="button"
            aria-label={`Tile ${index + 1}`}
            disabled={!running}
            onClick={() => tap(index)}
            style={{
              aspectRatio: "1 / 1",
              minWidth: 44,
              minHeight: 44,
              padding: "12%",
              borderRadius: 12,
              border: "2px solid var(--line)",
              background: "var(--panel)",
              cursor: "pointer",
            }}
          >
            <ShapeTile tile={tile} />
          </button>
        ))}
      </div>
    </DrillShell>
  );
}

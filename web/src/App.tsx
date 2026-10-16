import { useState, type ComponentType } from "react";
import { GameAuth, GameButton, GameTopbar } from "@freegamestore/games";
import GameShell from "./GameShell";
import { MathsDrill } from "./drills/maths/MathsDrill";
import { StroopDrill } from "./drills/stroop/StroopDrill";
import { MemoryDrill } from "./drills/memory/MemoryDrill";

interface Drill {
  id: string;
  name: string;
  Component: ComponentType<{ onExit: () => void }>;
}

const DRILLS: Drill[] = [
  { id: "maths", name: "Quick maths", Component: MathsDrill },
  { id: "colour-word", name: "Colour word", Component: StroopDrill },
  { id: "memory-grid", name: "Memory grid", Component: MemoryDrill },
];

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = DRILLS.find((d) => d.id === activeId);

  return (
    <GameShell topbar={<GameTopbar title="Zap Drills" />}>
      <GameAuth />
      {active ? (
        <active.Component onExit={() => setActiveId(null)} />
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
            Zap Drills
          </h1>
          <p style={{ color: "var(--muted)" }}>Fun quick puzzles. Pick a 60-second drill.</p>
          <div className="flex flex-col gap-3 w-full" style={{ maxWidth: 360 }}>
            {DRILLS.map((drill) => (
              <GameButton key={drill.id} size="lg" block onClick={() => setActiveId(drill.id)}>
                {drill.name}
              </GameButton>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}

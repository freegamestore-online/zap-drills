import { useState } from "react";
import { GameAuth, GameButton, GameTopbar } from "@freegamestore/games";
import GameShell from "./GameShell";
import { DRILLS } from "./drills/registry";
import { DailyWorkout } from "./dailyWorkout";

const DAILY = "daily";

export default function App() {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = DRILLS.find((d) => d.id === activeId);

  return (
    <GameShell topbar={<GameTopbar title="Zap Drills" />}>
      <GameAuth />
      {activeId === DAILY ? (
        <DailyWorkout onExit={() => setActiveId(null)} />
      ) : active ? (
        <active.Component onExit={() => setActiveId(null)} />
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
            Zap Drills
          </h1>
          <p style={{ color: "var(--muted)" }}>Fun quick puzzles. Pick a 60-second drill.</p>
          <div className="grid gap-3 w-full" style={{ maxWidth: 360, gridTemplateColumns: "1fr 1fr" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <GameButton size="md" block onClick={() => setActiveId(DAILY)}>
                Daily workout
              </GameButton>
            </div>
            {DRILLS.map((drill) => (
              <GameButton key={drill.id} size="md" block onClick={() => setActiveId(drill.id)}>
                {drill.name}
              </GameButton>
            ))}
          </div>
        </div>
      )}
    </GameShell>
  );
}

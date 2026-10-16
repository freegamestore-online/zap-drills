import { useState } from "react";
import { GameAuth, GameButton, GameTopbar } from "@freegamestore/games";
import GameShell from "./GameShell";
import { DailyWorkout } from "./dailyWorkout";
import { FreePlayScreen } from "./freePlay";

type Screen = "daily" | "free" | null;

export default function App() {
  const [screen, setScreen] = useState<Screen>(null);

  return (
    <GameShell topbar={<GameTopbar title="Zap Drills" actions={<GameAuth />} />}>
      {screen === "daily" ? (
        <DailyWorkout onExit={() => setScreen(null)} />
      ) : screen === "free" ? (
        <FreePlayScreen onExit={() => setScreen(null)} />
      ) : (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
            Zap Drills
          </h1>
          <p style={{ color: "var(--muted)" }}>Fun quick puzzles. Pick a 60-second drill.</p>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            Free to play.{" "}
            <a href="https://freegamestore.online" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent)" }}>
              Built for freegamestore.online
            </a>
          </p>
          <div className="grid gap-3 w-full" style={{ maxWidth: 360, gridTemplateColumns: "1fr 1fr" }}>
            <GameButton size="md" block onClick={() => setScreen("daily")}>
              Daily workout
            </GameButton>
            <GameButton size="md" block onClick={() => setScreen("free")}>
              Free play
            </GameButton>
          </div>
        </div>
      )}
    </GameShell>
  );
}

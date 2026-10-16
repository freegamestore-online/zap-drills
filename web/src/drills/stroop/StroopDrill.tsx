import { useState } from "react";
import { GameButton } from "@freegamestore/games";
import { DrillShell } from "../DrillShell";
import { useDrillSession } from "../useDrillSession";
import { PALETTE, generateCard, type StroopCard } from "./engine";

const rollCard = (): StroopCard => generateCard(Math.random);

export function StroopDrill({ onExit }: { onExit: () => void }) {
  const session = useDrillSession();
  const [card, setCard] = useState<StroopCard>(rollCard);
  const running = session.status === "running";

  const start = () => {
    setCard(rollCard());
    session.start();
  };

  const answer = (saysMatch: boolean) => {
    if (!running) return;
    session.record(card.isMatch === saysMatch);
    setCard(rollCard());
  };

  return (
    <DrillShell
      title="Colour word"
      instructions="Does the word match its colour? The word names a colour, the ink may be another one."
      session={session}
      onStart={start}
      onExit={onExit}
    >
      <p
        style={{
          fontSize: "clamp(3rem, 14svh, 5rem)",
          fontWeight: 800,
          color: PALETTE[card.inkColor],
          letterSpacing: "0.04em",
        }}
      >
        {card.word.toUpperCase()}
      </p>
      <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 420 }}>
        <GameButton size="lg" block disabled={!running} onClick={() => answer(true)}>
          MATCH
        </GameButton>
        <GameButton size="lg" block variant="secondary" disabled={!running} onClick={() => answer(false)}>
          NO MATCH
        </GameButton>
      </div>
    </DrillShell>
  );
}

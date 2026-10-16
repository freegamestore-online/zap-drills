import { useState } from "react";
import { GameButton } from "@freegamestore/games";
import { DrillShell } from "../DrillShell";
import { useDrillSession } from "../useDrillSession";
import { generateQuestion, type Question } from "./engine";

const rollQuestion = (): Question => generateQuestion(Math.random);

export function MathsDrill({ onExit }: { onExit: () => void }) {
  const session = useDrillSession();
  const [question, setQuestion] = useState<Question>(rollQuestion);
  const running = session.status === "running";

  const start = () => {
    setQuestion(rollQuestion());
    session.start();
  };

  const answer = (saysYes: boolean) => {
    if (!running) return;
    session.record(question.isCorrect === saysYes);
    setQuestion(rollQuestion());
  };

  return (
    <DrillShell
      title="Quick maths"
      instructions="Is the equation right? Tap YES or NO as fast as you can."
      session={session}
      onStart={start}
      onExit={onExit}
    >
      <p style={{ fontSize: "clamp(2.5rem, 12svh, 4.5rem)", fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
        {question.lhs} {question.operator} {question.rhs} = {question.shownResult}
      </p>
      <div style={{ display: "flex", gap: 12, width: "100%", maxWidth: 420 }}>
        <GameButton size="lg" block disabled={!running} onClick={() => answer(true)}>
          YES
        </GameButton>
        <GameButton size="lg" block variant="secondary" disabled={!running} onClick={() => answer(false)}>
          NO
        </GameButton>
      </div>
    </DrillShell>
  );
}

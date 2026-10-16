import { useContext, useEffect, useRef, type ReactNode } from "react";
import { GameButton } from "@freegamestore/games";
import { useHaptics, useShake } from "../feel";
import { DrillFlowContext } from "./DrillFlow";
import type { DrillSession } from "./useDrillSession";

// A short single pulse on a wrong answer. Haptics are feedback, not motion, so reduced motion keeps them.
const WRONG_PULSE = 40;

interface DrillShellProps {
  title: string;
  instructions: string;
  session: DrillSession;
  onStart: () => void;
  onExit: () => void;
  children: ReactNode;
  /** Header score text. Defaults to the correct count. */
  scoreText?: string;
  /** Drill-complete summary. Defaults to "N right out of M". */
  summaryText?: string;
}

/**
 * Layout shared by all drills: a header, the 60 s timer bar, feedback, a tap-to-start
 * overlay over the live field, and the drill-complete card.
 */
export function DrillShell({
  title,
  instructions,
  session,
  onStart,
  onExit,
  children,
  scoreText,
  summaryText,
}: DrillShellProps) {
  const { status, timeLeft, score, total, verdict } = session;
  const fieldRef = useRef<HTMLDivElement>(null);
  const shake = useShake(fieldRef);
  const haptics = useHaptics();
  const flow = useContext(DrillFlowContext);
  const reported = useRef(false);

  useEffect(() => {
    if (!verdict || verdict.correct) return;
    shake();
    haptics.pulse(WRONG_PULSE);
  }, [verdict, shake, haptics]);

  // Report the score once per run, when the drill reaches "done".
  useEffect(() => {
    if (status !== "done") {
      reported.current = false;
      return;
    }
    if (reported.current) return;
    reported.current = true;
    flow.onFinish?.(score);
  }, [status, score, flow]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 12, gap: 12, boxSizing: "border-box" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <GameButton variant="ghost" size="sm" onClick={onExit}>
          Back
        </GameButton>
        <h1 className="text-xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
          {title}
        </h1>
        <span style={{ color: "var(--muted)", fontWeight: 700, minWidth: 64, textAlign: "right" }}>
          {scoreText ?? `Score ${score}`}
        </span>
      </header>

      <div
        role="progressbar"
        aria-label="Time left"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(timeLeft * 100)}
        style={{ height: 8, borderRadius: 4, background: "var(--line)", overflow: "hidden" }}
      >
        <div style={{ height: "100%", width: `${timeLeft * 100}%`, background: "var(--accent)" }} />
      </div>

      {status === "done" ? (
        <section
          aria-label="Drill complete"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: "var(--radius)",
            padding: 24,
          }}
        >
          <h2 className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
            Drill complete
          </h2>
          <p style={{ color: "var(--muted)" }}>
            {summaryText ?? `${score} right out of ${total}`}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 320 }}>
            {flow.next ? (
              <>
                <GameButton size="lg" block onClick={flow.next.onNext}>
                  {flow.next.label}
                </GameButton>
                <GameButton variant="secondary" size="md" block onClick={onExit}>
                  Leave workout
                </GameButton>
              </>
            ) : (
              <>
                <GameButton size="lg" block onClick={onStart}>
                  Play again
                </GameButton>
                <GameButton variant="secondary" size="md" block onClick={onExit}>
                  Back to drills
                </GameButton>
              </>
            )}
          </div>
        </section>
      ) : (
        <div
          ref={fieldRef}
          style={{
            flex: 1,
            minHeight: 0,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
          }}
        >
          <p
            aria-live="polite"
            style={{
              minHeight: "1.5em",
              fontWeight: 700,
              color: verdict ? (verdict.correct ? "var(--success)" : "var(--error)") : "transparent",
            }}
          >
            {verdict ? (verdict.correct ? "Correct" : "Wrong") : "."}
          </p>

          {children}

          {status === "ready" && (
            <button
              type="button"
              onClick={onStart}
              aria-label={`Start ${title}`}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
                border: "none",
                borderRadius: "var(--radius)",
                background: "var(--glass)",
                color: "var(--ink)",
                cursor: "pointer",
                padding: 16,
              }}
            >
              <span className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
                Tap to start
              </span>
              <span style={{ color: "var(--muted)", textAlign: "center", maxWidth: 320 }}>{instructions}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

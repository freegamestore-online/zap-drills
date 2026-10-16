import { useEffect, useRef, useState } from "react";
import { DrillShell } from "../DrillShell";
import { useDrillSession } from "../useDrillSession";
import { TARGET_TIMEOUT_MS, averageReaction, randomDelay, reactionTime } from "./engine";

type Phase = "waiting" | "target";

export function ReactionTapDrill({ onExit }: { onExit: () => void }) {
  const session = useDrillSession();
  const { record } = session;
  const running = session.status === "running";
  const [phase, setPhase] = useState<Phase>("waiting");
  // A new object for every wait, so each wait gets a fresh random delay.
  const [wait, setWait] = useState(() => ({ ms: randomDelay(Math.random) }));
  const [times, setTimes] = useState<number[]>([]);
  const shownAt = useRef(0);

  const average = averageReaction(times);
  const last = times[times.length - 1];

  const start = () => {
    setTimes([]);
    setPhase("waiting");
    setWait({ ms: randomDelay(Math.random) });
    session.start();
  };

  const advance = () => {
    setPhase("waiting");
    setWait({ ms: randomDelay(Math.random) });
  };

  // Wait a random delay, then show the target.
  useEffect(() => {
    if (!running || phase !== "waiting") return;
    const timer = setTimeout(() => {
      shownAt.current = performance.now();
      setPhase("target");
    }, wait.ms);
    return () => clearTimeout(timer);
  }, [running, phase, wait]);

  // A target nobody taps in time counts as a miss.
  useEffect(() => {
    if (!running || phase !== "target") return;
    const timer = setTimeout(() => {
      record(false);
      setPhase("waiting");
      setWait({ ms: randomDelay(Math.random) });
    }, TARGET_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [running, phase, record]);

  const tapTarget = () => {
    if (!running || phase !== "target") return;
    const ms = reactionTime(shownAt.current, performance.now());
    record(true);
    setTimes((t) => [...t, ms]);
    advance();
  };

  // Tapping before the target appears is a false start.
  const tapField = () => {
    if (!running || phase !== "waiting") return;
    record(false);
    advance();
  };

  return (
    <DrillShell
      title="Reaction tap"
      instructions="Wait for the target, then tap it as fast as you can. Tapping early counts as a miss."
      session={session}
      onStart={start}
      onExit={onExit}
      scoreText={average === null ? "Avg –" : `Avg ${average} ms`}
      summaryText={
        average === null ? "No taps yet" : `Average ${average} ms over ${times.length} ${times.length === 1 ? "tap" : "taps"}`
      }
    >
      <div
        onPointerDown={tapField}
        style={{
          position: "relative",
          flex: 1,
          width: "100%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <p style={{ color: "var(--muted)", fontWeight: 700, minHeight: "1.5em" }}>
          {last === undefined ? " " : `Last: ${last} ms`}
        </p>
        {phase === "target" && running ? (
          <button
            type="button"
            aria-label="Target: tap now"
            onClick={tapTarget}
            style={{
              width: "min(60vw, 50svh, 260px)",
              aspectRatio: "1 / 1",
              borderRadius: "50%",
              border: "none",
              background: "var(--accent)",
              color: "#fff",
              fontWeight: 800,
              fontSize: "1.25rem",
              cursor: "pointer",
            }}
          >
            TAP
          </button>
        ) : (
          <p style={{ color: "var(--muted)" }}>{running ? "Wait for it…" : " "}</p>
        )}
      </div>
    </DrillShell>
  );
}

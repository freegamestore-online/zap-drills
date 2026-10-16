import { useState } from "react";
import { GameButton } from "@freegamestore/games";
import { DrillFlowContext } from "../drills/DrillFlow";
import { DRILLS, drillById } from "../drills/registry";
import type { DrillId } from "../drills/ids";
import { utcDate } from "../dailyWorkout/date";
import { DayBarChart } from "./DayBarChart";
import { loadHistory, loadPersonalBest, recordRun } from "./records";

/**
 * Any drill, any time. Each finished run updates the drill's personal best and today's
 * point on its 14-day chart.
 */
export function FreePlayScreen({ onExit }: { onExit: () => void }) {
  const [playing, setPlaying] = useState<DrillId | null>(null);
  const [chartId, setChartId] = useState<DrillId>(DRILLS[0]!.id);
  // Bumped after each run so bests and history are read again.
  const [, setRuns] = useState(0);

  if (playing) {
    const { Component } = drillById(playing);
    return (
      <DrillFlowContext.Provider
        value={{
          onFinish: (score) => {
            recordRun(playing, score, utcDate());
            setRuns((n) => n + 1);
          },
        }}
      >
        <Component onExit={() => setPlaying(null)} />
      </DrillFlowContext.Provider>
    );
  }

  const today = utcDate();
  const chartDrill = drillById(chartId);

  return (
    <div className="flex flex-col h-full gap-3 p-3" style={{ boxSizing: "border-box" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <GameButton variant="ghost" size="sm" onClick={onExit}>
          Back
        </GameButton>
        <h1 className="text-xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
          Free play
        </h1>
        <span style={{ minWidth: 64 }} />
      </header>

      <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {DRILLS.map((drill) => {
          const best = loadPersonalBest(drill.id);
          return (
            <button
              key={drill.id}
              type="button"
              onClick={() => setPlaying(drill.id)}
              aria-label={`Play ${drill.name}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 2,
                minHeight: 56,
                padding: "8px 10px",
                borderRadius: 12,
                border: "1px solid var(--line)",
                background: "var(--panel)",
                color: "var(--ink)",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              <span style={{ fontWeight: 700 }}>{drill.name}</span>
              <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                {best === null ? "No best yet" : `Best ${best}`}
              </span>
            </button>
          );
        })}
      </div>

      <section aria-label="History" style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1, minHeight: 0 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--muted)", fontWeight: 700 }}>
          Last 14 days
          <select
            value={chartId}
            onChange={(e) => setChartId(e.target.value as DrillId)}
            aria-label="Drill to chart"
            style={{
              flex: 1,
              minWidth: 0,
              padding: "6px 8px",
              borderRadius: 8,
              border: "1px solid var(--line)",
              background: "var(--paper)",
              color: "var(--ink)",
              fontWeight: 600,
            }}
          >
            {DRILLS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
        <DayBarChart label={chartDrill.name} history={loadHistory(chartId, today)} today={today} />
      </section>
    </div>
  );
}

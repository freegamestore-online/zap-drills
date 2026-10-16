import { utcDate } from "../dailyWorkout/date";
import { HISTORY_DAYS, windowDates, type HistoryEntry } from "./records";

const WIDTH = 280;
const HEIGHT = 110;
const LABEL_HEIGHT = 16;

/**
 * One bar per day that has a score, over the last 14 UTC days. Days with no run leave
 * a gap. Drawn as SVG, so there's no chart library and it scales with its container.
 */
export function DayBarChart({
  label,
  history,
  today = utcDate(),
}: {
  label: string;
  history: HistoryEntry[];
  today?: string;
}) {
  const dates = windowDates(today, HISTORY_DAYS);
  const byDate = new Map(history.map((e) => [e.date, e.score]));
  const max = Math.max(1, ...dates.map((d) => byDate.get(d) ?? 0));
  const slot = WIDTH / HISTORY_DAYS;
  const barWidth = slot * 0.7;

  if (history.length === 0) {
    return (
      <p style={{ color: "var(--muted)", textAlign: "center", padding: "24px 0" }}>
        No runs in the last {HISTORY_DAYS} days yet.
      </p>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT + LABEL_HEIGHT}`}
      width="100%"
      role="img"
      aria-label={`${label}: best score per day for the last ${HISTORY_DAYS} days`}
    >
      {dates.map((date, i) => {
        const score = byDate.get(date);
        if (score === undefined) return null;
        const height = (score / max) * HEIGHT;
        return (
          <rect
            key={date}
            data-testid="chart-bar"
            x={i * slot + (slot - barWidth) / 2}
            y={HEIGHT - height}
            width={barWidth}
            height={height}
            rx={2}
            fill="var(--accent)"
          >
            <title>{`${date}: ${score}`}</title>
          </rect>
        );
      })}
      <text x={0} y={HEIGHT + LABEL_HEIGHT - 3} fontSize="10" fill="var(--muted)">
        {dates[0]!.slice(5)}
      </text>
      <text x={WIDTH} y={HEIGHT + LABEL_HEIGHT - 3} fontSize="10" fill="var(--muted)" textAnchor="end">
        {dates[dates.length - 1]!.slice(5)}
      </text>
    </svg>
  );
}

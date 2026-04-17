import { PACE_OPTIONS, BUDGET_OPTIONS } from "@/lib/preferences";
import type { AggregatedPreferences } from "@/lib/preferences";

const PACE_LABELS = Object.fromEntries(PACE_OPTIONS.map((o) => [o.value, o.label]));
const BUDGET_LABELS = Object.fromEntries(BUDGET_OPTIONS.map((o) => [o.value, o.label]));

type Props = {
  aggregated: AggregatedPreferences;
  totalSubmitted: number;
};

export default function GroupSummary({ aggregated, totalSubmitted }: Props) {
  if (totalSubmitted === 0) return null;

  const { pace, budget, priorities } = aggregated;

  return (
    <div
      className="mb-6 rounded-[1.25rem] p-5"
      style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-5"
        style={{ color: "#434654" }}
      >
        Group Summary
      </p>

      <div className="grid gap-5">
        {/* Pace */}
        <div>
          <p className="text-xs font-medium mb-2.5" style={{ color: "#434654" }}>
            Pace
          </p>
          <div className="flex flex-wrap gap-2">
            {PACE_OPTIONS.map((opt) => {
              const count = pace[opt.value] ?? 0;
              if (count === 0) return null;
              return (
                <span
                  key={opt.value}
                  className="rounded-full px-3 py-1 text-sm font-medium"
                  style={{ background: "#F2F4F7", color: "#191C1E" }}
                >
                  {PACE_LABELS[opt.value]}{" "}
                  <span style={{ color: "#434654", fontSize: "0.7rem" }}>×{count}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Budget */}
        <div>
          <p className="text-xs font-medium mb-2.5" style={{ color: "#434654" }}>
            Budget
          </p>
          <div className="flex flex-wrap gap-2">
            {BUDGET_OPTIONS.map((opt) => {
              const count = budget[opt.value] ?? 0;
              if (count === 0) return null;
              return (
                <span
                  key={opt.value}
                  className="rounded-full px-3 py-1 text-sm font-medium"
                  style={{ background: "#F2F4F7", color: "#191C1E" }}
                >
                  {BUDGET_LABELS[opt.value]}{" "}
                  <span style={{ color: "#434654", fontSize: "0.7rem" }}>×{count}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Priorities */}
        {priorities.length > 0 && (
          <div>
            <p className="text-xs font-medium mb-2.5" style={{ color: "#434654" }}>
              Top priorities
            </p>
            <div className="flex flex-wrap gap-2">
              {priorities.map(({ name, count }) => (
                <span
                  key={name}
                  className="rounded-full px-3 py-1 text-sm font-medium"
                  style={{ background: "#006661", color: "#5DE7DE" }}
                >
                  {name}{" "}
                  <span style={{ color: "#4edbd2", fontSize: "0.7rem" }}>×{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

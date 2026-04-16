import { Card, CardContent } from "@/components/ui/card";
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
    <Card className="mb-6">
      <CardContent className="px-5 py-4 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Group summary
        </p>

        {/* Pace */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Pace</p>
          <div className="flex flex-wrap gap-2">
            {PACE_OPTIONS.map((opt) => {
              const count = pace[opt.value] ?? 0;
              if (count === 0) return null;
              return (
                <span
                  key={opt.value}
                  className="rounded-full border bg-muted/50 px-3 py-1 text-sm"
                >
                  {PACE_LABELS[opt.value]}{" "}
                  <span className="text-muted-foreground text-xs">×{count}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Budget */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1.5">Budget</p>
          <div className="flex flex-wrap gap-2">
            {BUDGET_OPTIONS.map((opt) => {
              const count = budget[opt.value] ?? 0;
              if (count === 0) return null;
              return (
                <span
                  key={opt.value}
                  className="rounded-full border bg-muted/50 px-3 py-1 text-sm"
                >
                  {BUDGET_LABELS[opt.value]}{" "}
                  <span className="text-muted-foreground text-xs">×{count}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Priorities */}
        {priorities.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1.5">
              Top priorities
            </p>
            <div className="flex flex-wrap gap-2">
              {priorities.map(({ name, count }) => (
                <span
                  key={name}
                  className="rounded-full border bg-muted/50 px-3 py-1 text-sm"
                >
                  {name}{" "}
                  <span className="text-muted-foreground text-xs">×{count}</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

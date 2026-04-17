"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlaneTakeoff, ArrowRight, Star } from "lucide-react";

type State = "idle" | "loading" | "success" | "error";

type FlightPlan = {
  title: string;
  summary: string;
  flights: {
    rank: number;
    airline: string;
    route: string;
    price_per_person: number;
    duration_minutes: number;
    departure_time: string;
    arrival_time: string;
    aircraft: string;
    stops: number;
    pros: string[];
    cons: string[];
    best_for: string;
  }[];
  recommendation: {
    best_option_rank: number;
    reason: string;
  };
};

function safeParseFlightPlan(value: string | null): FlightPlan | null {
  if (!value) return null;
  try { return JSON.parse(value); } catch { return null; }
}

export default function FlightPlan({
  tripId,
  existingPlan,
  ready,
}: {
  tripId: string;
  existingPlan: string | null;
  ready: boolean;
}) {
  const [state, setState] = useState<State>(
    existingPlan ? "success" : ready ? "loading" : "idle"
  );
  const [plan, setPlan] = useState<FlightPlan | null>(safeParseFlightPlan(existingPlan));

  async function generate() {
    setState("loading");
    try {
      const res = await fetch(`/api/trips/${tripId}/flights`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate");
      let parsed: FlightPlan | null = null;
      try {
        parsed = typeof data.plan === "string" ? JSON.parse(data.plan) : data.plan;
      } catch {
        throw new Error("Invalid flight plan format from server");
      }
      setPlan(parsed);
      setState("success");
    } catch (err) {
      console.error(err);
      setState("error");
    }
  }

  useEffect(() => {
    if (!existingPlan && ready) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "idle") return null;

  if (state === "loading") {
    return (
      <div
        className="mb-6 rounded-[1.25rem] p-5 animate-pulse"
        style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
      >
        <div className="h-3 w-32 bg-[#F2F4F7] rounded mb-3" />
        <div className="space-y-2">
          <div className="h-3 w-full bg-[#F2F4F7] rounded" />
          <div className="h-3 w-5/6 bg-[#F2F4F7] rounded" />
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div
        className="mb-6 rounded-[1.25rem] p-5 flex justify-between items-center"
        style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
      >
        <p className="text-sm" style={{ color: "#434654" }}>Could not generate flights.</p>
        <Button onClick={generate} variant="outline" size="sm" className="rounded-xl">
          Retry
        </Button>
      </div>
    );
  }

  if (state === "success" && plan) {
    return (
      <div className="mb-6 space-y-4">
        {/* Header card */}
        <div
          className="rounded-[1.25rem] p-5"
          style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{ background: "#003D9B" }}
            >
              <PlaneTakeoff className="h-3.5 w-3.5 text-white" />
            </div>
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#003D9B" }}
            >
              {plan.title}
            </p>
          </div>
          <p className="text-sm" style={{ color: "#434654", fontFamily: "var(--font-inter, system-ui)" }}>
            {plan.summary}
          </p>
        </div>

        {/* Flight cards */}
        {plan.flights.map((f) => (
          <div
            key={f.rank}
            className="rounded-[1.25rem] p-5"
            style={{
              background: "#ffffff",
              boxShadow: "0px 12px 32px rgba(25,28,30,0.06)",
              outline: f.rank === plan.recommendation.best_option_rank
                ? "2px solid #003D9B"
                : "none",
            }}
          >
            {f.rank === plan.recommendation.best_option_rank && (
              <div
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold mb-3"
                style={{ background: "#003D9B", color: "#ffffff" }}
              >
                <Star className="h-3 w-3" />
                Recommended
              </div>
            )}

            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <p className="font-semibold" style={{ color: "#191C1E" }}>
                  {f.airline}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className="chip-route text-xs"
                    style={{ background: "#F2F4F7", color: "#434654", borderRadius: "9999px", padding: "0.15rem 0.6rem" }}
                  >
                    {f.route}
                  </span>
                  <span className="text-xs" style={{ color: "#434654" }}>
                    {f.duration_minutes} min • {f.stops} stop{f.stops !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p
                  className="text-xl font-bold"
                  style={{ color: "#003D9B", fontFamily: "var(--font-jakarta, system-ui)" }}
                >
                  ${f.price_per_person}
                </p>
                <p className="text-xs" style={{ color: "#434654" }}>per person</p>
              </div>
            </div>

            <p className="text-sm mb-3" style={{ color: "#434654" }}>
              <span className="font-medium" style={{ color: "#191C1E" }}>Best for: </span>
              {f.best_for}
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div
                className="rounded-xl p-3"
                style={{ background: "#F2F4F7" }}
              >
                <p className="font-semibold mb-1" style={{ color: "#004C48" }}>Pros</p>
                <ul className="space-y-0.5">
                  {f.pros.map((p, i) => (
                    <li key={i} style={{ color: "#434654" }}>+ {p}</li>
                  ))}
                </ul>
              </div>
              <div
                className="rounded-xl p-3"
                style={{ background: "#F2F4F7" }}
              >
                <p className="font-semibold mb-1 text-red-500">Cons</p>
                <ul className="space-y-0.5">
                  {f.cons.map((c, i) => (
                    <li key={i} style={{ color: "#434654" }}>− {c}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}

        {/* Recommendation summary */}
        <div
          className="rounded-[1.25rem] p-5"
          style={{ background: "#F2F4F7" }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: "#434654" }}>
            Our Recommendation
          </p>
          <p className="font-semibold mb-1" style={{ color: "#191C1E" }}>
            Option #{plan.recommendation.best_option_rank}
          </p>
          <p className="text-sm" style={{ color: "#434654" }}>
            {plan.recommendation.reason}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

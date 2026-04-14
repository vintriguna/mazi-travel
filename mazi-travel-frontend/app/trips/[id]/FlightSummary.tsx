"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type State = "loading" | "success" | "error";

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

  try {
    return JSON.parse(value);
  } catch (err) {
    console.error("❌ Failed to parse flight plan:", value);
    return null; // fail gracefully instead of crashing UI
  }
}

export default function FlightPlan({
  tripId,
  existingPlan,
}: {
  tripId: string;
  existingPlan: string | null;
}) {
  const [state, setState] = useState<State>(
    existingPlan ? "success" : "loading"
  );

  const [plan, setPlan] = useState<FlightPlan | null>(
    safeParseFlightPlan(existingPlan)
    );

  async function generate() {
    setState("loading");

    try {
      const res = await fetch(`/api/trips/${tripId}/flights`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Failed to generate");

      // IMPORTANT: ensure object format
      let parsed: FlightPlan | null = null;

        try {
        parsed =
            typeof data.plan === "string"
            ? JSON.parse(data.plan)
            : data.plan;
        } catch (err) {
        console.error("❌ API returned invalid JSON:", data.plan);
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
    if (!existingPlan) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ⏳ LOADING
  if (state === "loading") {
    return (
      <Card className="mb-6 animate-pulse">
        <CardContent className="px-5 py-4 space-y-2">
          <div className="h-3 w-32 bg-muted rounded" />
          <div className="h-3 w-full bg-muted rounded" />
          <div className="h-3 w-5/6 bg-muted rounded" />
        </CardContent>
      </Card>
    );
  }

  // ❌ ERROR
  if (state === "error") {
    return (
      <Card className="mb-6">
        <CardContent className="px-5 py-4 flex justify-between">
          <p className="text-sm text-muted-foreground">
            Could not generate flights.
          </p>
          <Button onClick={generate} variant="outline" size="sm">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ✅ SUCCESS
  if (state === "success" && plan) {
    return (
      <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
        <CardContent className="px-5 py-4">
          {/* HEADER */}
          <p className="text-xs font-semibold uppercase text-blue-600 mb-2">
            {plan.title}
          </p>

          {/* SUMMARY */}
          <p className="text-sm text-muted-foreground mb-4">
            {plan.summary}
          </p>

          {/* FLIGHTS */}
          <div className="space-y-4">
            {plan.flights.map((f) => (
              <div key={f.rank} className="border rounded-lg p-4 bg-white/60">
                <div className="flex justify-between">
                  <p className="font-semibold">
                    #{f.rank} {f.airline}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    ${f.price_per_person}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground mb-2">
                  {f.route} • {f.duration_minutes} min • {f.stops} stop(s)
                </p>

                <p className="text-sm mb-2">
                  <span className="font-medium">Best for:</span> {f.best_for}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-green-600 font-semibold">Pros</p>
                    <ul className="list-disc ml-4">
                      {f.pros.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-red-600 font-semibold">Cons</p>
                    <ul className="list-disc ml-4">
                      {f.cons.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* RECOMMENDATION */}
          <div className="mt-4 p-3 bg-blue-100/40 rounded-md">
            <p className="text-sm font-semibold">
              Recommended Option: #{plan.recommendation.best_option_rank}
            </p>
            <p className="text-sm text-muted-foreground">
              {plan.recommendation.reason}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}
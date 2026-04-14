"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type State = "loading" | "success" | "error";

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
  const [plan, setPlan] = useState<string | null>(existingPlan);

  async function generate() {
    setState("loading");
    try {
      const res = await fetch(`/api/trips/${tripId}/flights`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Failed to generate");

      // 👇 matches your backend return
      setPlan(data.plan);
      setState("success");
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    if (!existingPlan) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ SUCCESS STATE
  if (state === "success" && plan) {
    return (
      <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
        <CardContent className="px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600 mb-2">
            AI Flight Recommendations
          </p>

          <p className="text-sm leading-relaxed whitespace-pre-line">
            {plan}
          </p>
        </CardContent>
      </Card>
    );
  }

  // ❌ ERROR STATE
  if (state === "error") {
    return (
      <Card className="mb-6">
        <CardContent className="px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t generate flight recommendations.
          </p>
          <Button variant="outline" size="sm" onClick={generate}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  // ⏳ LOADING STATE
  return (
    <Card className="mb-6 animate-pulse">
      <CardContent className="px-5 py-4">
        <div className="h-3 w-32 rounded bg-muted mb-3" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
          <div className="h-3 w-4/6 rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type State = "idle" | "loading" | "success" | "error";

export default function TripSummary({
  tripId,
  existingSummary,
  ready,
}: {
  tripId: string;
  existingSummary: string | null;
  ready: boolean;
}) {
  const [state, setState] = useState<State>(
    existingSummary ? "success" : ready ? "loading" : "idle"
  );
  const [summary, setSummary] = useState<string | null>(existingSummary);

  async function generate() {
    setState("loading");
    try {
      const res = await fetch(`/api/trips/${tripId}/summary`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate");
      setSummary(data.summary);
      setState("success");
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    if (!existingSummary && ready) generate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "success" && summary) {
    return (
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-primary mb-2">
            AI Summary
          </p>
          <p className="text-sm leading-relaxed">{summary}</p>
        </CardContent>
      </Card>
    );
  }

  if (state === "error") {
    return (
      <Card className="mb-6">
        <CardContent className="px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Couldn&apos;t generate summary.</p>
          <Button variant="outline" size="sm" onClick={generate}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state === "idle") return null;

  // loading
  return (
    <Card className="mb-6 animate-pulse">
      <CardContent className="px-5 py-4">
        <div className="h-3 w-20 rounded bg-muted mb-3" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-4/5 rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

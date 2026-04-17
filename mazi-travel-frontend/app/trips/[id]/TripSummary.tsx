"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

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
      <div
        className="mb-6 rounded-[1.25rem] p-5"
        style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-full"
            style={{ background: "#004C48" }}
          >
            <Sparkles className="h-3.5 w-3.5 text-[#5DE7DE]" />
          </div>
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#004C48" }}
          >
            AI Summary
          </p>
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "#434654", fontFamily: "var(--font-inter, system-ui)" }}
        >
          {summary}
        </p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div
        className="mb-6 rounded-[1.25rem] p-5 flex items-center justify-between gap-4"
        style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
      >
        <p className="text-sm" style={{ color: "#434654" }}>Couldn&apos;t generate summary.</p>
        <Button variant="outline" size="sm" onClick={generate} className="rounded-xl">
          Retry
        </Button>
      </div>
    );
  }

  if (state === "idle") return null;

  // loading skeleton
  return (
    <div
      className="mb-6 rounded-[1.25rem] p-5 animate-pulse"
      style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="h-7 w-7 rounded-full bg-[#F2F4F7]" />
        <div className="h-3 w-20 rounded bg-[#F2F4F7]" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-[#F2F4F7]" />
        <div className="h-3 w-4/5 rounded bg-[#F2F4F7]" />
        <div className="h-3 w-3/5 rounded bg-[#F2F4F7]" />
      </div>
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { PACE_OPTIONS, BUDGET_OPTIONS, PRIORITY_OPTIONS } from "@/lib/preferences";
import { ArrowLeft, Zap, Coffee, BarChart2, DollarSign, Gem, Sparkles } from "lucide-react";
import Link from "next/link";

const PACE_ICONS = [
  <Coffee key="relaxed" className="h-5 w-5" />,
  <BarChart2 key="balanced" className="h-5 w-5" />,
  <Zap key="packed" className="h-5 w-5" />,
];

const BUDGET_ICONS = [
  <DollarSign key="budget" className="h-5 w-5" />,
  <DollarSign key="mid" className="h-5 w-5" />,
  <Gem key="luxury" className="h-5 w-5" />,
];

export default function PreferencesPage() {
  const params = useParams();
  const tripId = params.id as string;
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [tripPace, setTripPace] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);
  const [aiNotes, setAiNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkAlreadySubmitted() {
      try {
        const res = await fetch(`/api/trips/${tripId}/preferences`);
        if (res.ok) {
          const data = await res.json();
          if (data.currentUserSubmitted) {
            router.replace(`/trips/${tripId}`);
            return;
          }
        }
      } catch {
        // ignore
      }
      setChecking(false);
    }
    checkAlreadySubmitted();
  }, [tripId, router]);

  function togglePriority(option: string) {
    setPriorities((prev) =>
      prev.includes(option) ? prev.filter((p) => p !== option) : [...prev, option]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!tripPace || !budgetRange || priorities.length === 0) {
      setError("Please fill out all required fields.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripPace,
          budgetRange,
          topPriorities: priorities,
          aiNotes: aiNotes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      router.push(`/trips/${tripId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit preferences.");
      setLoading(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm" style={{ color: "#434654" }}>Loading…</p>
      </div>
    );
  }

  return (
    <div className="px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link
          href={`/trips/${tripId}`}
          className="mb-8 inline-flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "#434654" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to trip
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-display mb-2"
            style={{ color: "#191C1E" }}
          >
            Your Preferences
          </h1>
          <p
            className="text-base"
            style={{
              color: "#434654",
              fontFamily: "var(--font-inter, system-ui)",
            }}
          >
            Tell us what matters to you. This helps personalize the group plan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* Trip pace */}
          <div
            className="rounded-[1.5rem] p-6"
            style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#434654" }}
            >
              Trip Pace
            </p>
            <div className="grid grid-cols-3 gap-3">
              {PACE_OPTIONS.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTripPace(opt.value)}
                  className="flex flex-col items-center gap-2 rounded-xl py-4 px-3 text-center transition-all"
                  style={
                    tripPace === opt.value
                      ? {
                          background: "linear-gradient(135deg, #003D9B 0%, #0052CC 100%)",
                          color: "#ffffff",
                          boxShadow: "0px 8px 20px rgba(0,61,155,0.2)",
                        }
                      : { background: "#F2F4F7", color: "#434654" }
                  }
                >
                  {PACE_ICONS[i]}
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Budget */}
          <div
            className="rounded-[1.5rem] p-6"
            style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#434654" }}
            >
              Budget Range
            </p>
            <div className="grid grid-cols-3 gap-3">
              {BUDGET_OPTIONS.map((opt, i) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setBudgetRange(opt.value)}
                  className="flex flex-col items-center gap-2 rounded-xl py-4 px-3 text-center transition-all"
                  style={
                    budgetRange === opt.value
                      ? {
                          background: "linear-gradient(135deg, #003D9B 0%, #0052CC 100%)",
                          color: "#ffffff",
                          boxShadow: "0px 8px 20px rgba(0,61,155,0.2)",
                        }
                      : { background: "#F2F4F7", color: "#434654" }
                  }
                >
                  {BUDGET_ICONS[i]}
                  <span className="text-xs font-semibold">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Top priorities */}
          <div
            className="rounded-[1.5rem] p-6"
            style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: "#434654" }}
            >
              Top Priorities
            </p>
            <p className="text-xs mb-4" style={{ color: "#C3C6D6" }}>
              Pick 1–3
            </p>
            <div className="flex flex-wrap gap-2">
              {PRIORITY_OPTIONS.map((option) => {
                const selected = priorities.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => togglePriority(option)}
                    disabled={!selected && priorities.length >= 3}
                    className="rounded-full px-4 py-1.5 text-sm font-semibold transition-all disabled:opacity-40"
                    style={
                      selected
                        ? { background: "#006661", color: "#5DE7DE" }
                        : { background: "#F2F4F7", color: "#434654" }
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI notes */}
          <div
            className="rounded-[1.5rem] p-6"
            style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-[#904D00]" />
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "#434654" }}
              >
                Notes for AI
                <span className="ml-1.5 text-xs font-normal" style={{ color: "#C3C6D6" }}>
                  (optional)
                </span>
              </p>
            </div>
            <textarea
              rows={3}
              placeholder="Dietary restrictions, accessibility needs, must-see spots…"
              value={aiNotes}
              onChange={(e) => setAiNotes(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003D9B] placeholder:text-[#C3C6D6]"
              style={{
                background: "#F2F4F7",
                color: "#191C1E",
                border: "none",
                fontFamily: "var(--font-inter, system-ui)",
              }}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-gradient w-full rounded-xl py-3 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? "Saving…" : "Submit Preferences"}
          </button>
        </form>
      </div>
    </div>
  );
}

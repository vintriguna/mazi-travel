"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PACE_OPTIONS, BUDGET_OPTIONS, PRIORITY_OPTIONS } from "@/lib/preferences";

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
        // ignore — let the user try to submit
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
      <div className="flex min-h-screen items-center justify-center bg-muted/40">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Your preferences</CardTitle>
          <p className="text-sm text-muted-foreground">
            Tell us what matters to you. This helps personalize the group plan.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">

            {/* Trip pace */}
            <div className="grid gap-1.5">
              <Label>Trip pace</Label>
              <div className="flex rounded-lg border bg-muted p-1 gap-1">
                {PACE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={tripPace === opt.value ? "default" : "ghost"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setTripPace(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Budget range */}
            <div className="grid gap-1.5">
              <Label>Budget range</Label>
              <div className="flex rounded-lg border bg-muted p-1 gap-1">
                {BUDGET_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={budgetRange === opt.value ? "default" : "ghost"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setBudgetRange(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Top priorities */}
            <div className="grid gap-2">
              <Label>
                Top priorities
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  (pick 1–3)
                </span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map((option) => {
                  const selected = priorities.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => togglePriority(option)}
                      disabled={!selected && priorities.length >= 3}
                      className={cn(
                        "rounded-full border px-3 py-1 text-sm transition-colors",
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 hover:bg-muted border-border",
                        !selected && priorities.length >= 3 && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI notes */}
            <div className="grid gap-1.5">
              <Label htmlFor="aiNotes">
                Notes for AI
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <textarea
                id="aiNotes"
                rows={3}
                placeholder="Dietary restrictions, accessibility needs, must-see spots…"
                value={aiNotes}
                onChange={(e) => setAiNotes(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Saving…" : "Submit preferences"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

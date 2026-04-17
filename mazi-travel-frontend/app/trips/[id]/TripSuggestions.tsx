"use client";

import { useEffect, useState } from "react";
import { getTripImage } from "@/lib/ai/generate-images";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Activity = {
  name: string;
  category: string;
  why: string;
};

type Suggestion = {
  rank: number;
  title: string;
  tagline: string;
  vibe: string;
  why_it_fits: string;
  candidate_neighborhoods: string[];
  candidate_activities: Activity[];
  budget_note: string;
  weather_note: string;
  grounding_notes: string;
};

type SuggestionRow = {
  id: string;
  rank: number;
  title: string;
  tagline: string | null;
  content: Suggestion | string;
};

type State = "idle" | "loading" | "success" | "error";

const CATEGORY_LABELS: Record<string, string> = {
  food: "Food",
  sights: "Sights",
  outdoors: "Outdoors",
  nightlife: "Nightlife",
  culture: "Culture",
  wellness: "Wellness",
  adventure: "Adventure",
  shopping: "Shopping",
  local: "Local",
};

function SuggestionCard({ row, index }: { row: SuggestionRow; index: number }) {
  const s: Suggestion = typeof row.content === "string"
    ? JSON.parse(row.content)
    : row.content;
  const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
      let ignore = false;
      async function fetchImage() {
        if (row.title && row.id) {
          try {
            // Compose query: destination city + first activity
            let query = row.title;
            const s: Suggestion = typeof row.content === "string" ? JSON.parse(row.content) : row.content;
            if (s.candidate_activities && s.candidate_activities.length > 0) {
              query = `${row.title} ${s.candidate_activities[0].name}`;
            }
            const res = await fetch("/api/images", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query }),
            });
            const data = await res.json();
            const url = data.imageUrl ?? null;
            if (!ignore) setImageUrl(url);
            // Save image URL to backend
            if (url) {
              await fetch(`/api/trip-suggestions`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image_url: url }),
              });
            }
          } catch {
            if (!ignore) setImageUrl(null);
          }
        }
      }
      fetchImage();
      return () => { ignore = true; };
    }, [row.title ?? "", row.id ?? ""]);

  return (
    <Card className="overflow-hidden">
      {imageUrl && (
        <div className="w-full bg-muted/40 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={row.title}
            className="w-full object-cover"
            style={{ display: 'block' }}
          />
        </div>
      )}
      <CardContent className="px-5 py-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Option {index + 1}
              </span>
              <Badge variant="outline" className="text-xs">{s.vibe}</Badge>
            </div>
            <h3 className="text-base font-semibold leading-snug">{row.title}</h3>
            {row.tagline && (
              <p className="text-sm text-muted-foreground mt-0.5">{row.tagline}</p>
            )}
          </div>
        </div>

        {/* Why it fits */}
        <p className="text-sm leading-relaxed mb-4">{s.why_it_fits}</p>

        {/* Neighborhoods */}
        {s.candidate_neighborhoods?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Neighborhoods to consider
            </p>
            <div className="flex flex-wrap gap-1.5">
              {s.candidate_neighborhoods.map((n) => (
                <Badge key={n} variant="secondary" className="text-xs font-normal">
                  {n}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Activities */}
        {s.candidate_activities?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
              Activities
            </p>
            <div className="space-y-1.5">
              {s.candidate_activities.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <Badge variant="outline" className="text-xs shrink-0 mt-0.5 font-normal">
                    {CATEGORY_LABELS[a.category] ?? a.category}
                  </Badge>
                  <span>
                    <span className="font-medium">{a.name}</span>
                    {a.why && <span className="text-muted-foreground"> — {a.why}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes row */}
        <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t text-xs text-muted-foreground">
          {s.budget_note && (
            <div>
              <span className="font-medium text-foreground">Budget: </span>
              {s.budget_note}
            </div>
          )}
          {s.weather_note && (
            <div>
              <span className="font-medium text-foreground">Weather: </span>
              {s.weather_note}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card className="animate-pulse overflow-hidden">
      <CardContent className="px-5 py-5">
        <div className="flex items-center gap-2 mb-2">
          <div className="h-3 w-16 rounded bg-muted" />
          <div className="h-5 w-20 rounded bg-muted" />
        </div>
        <div className="h-4 w-2/3 rounded bg-muted mb-1" />
        <div className="h-3 w-1/2 rounded bg-muted mb-4" />
        <div className="space-y-2 mb-4">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
        </div>
        <div className="flex gap-1.5 mb-4">
          <div className="h-5 w-16 rounded bg-muted" />
          <div className="h-5 w-20 rounded bg-muted" />
          <div className="h-5 w-14 rounded bg-muted" />
        </div>
        <div className="space-y-1.5">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-4/5 rounded bg-muted" />
          <div className="h-3 w-3/4 rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function TripSuggestions({
  tripId,
  existingSuggestions,
  ready,
}: {
  tripId: string;
  existingSuggestions: SuggestionRow[] | null;
  ready: boolean;
}) {
  const hasCached = existingSuggestions && existingSuggestions.length > 0;
  const [state, setState] = useState<State>(
    hasCached ? "success" : ready ? "loading" : "idle"
  );
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>(
    existingSuggestions ?? []
  );

  async function generate() {
    setState("loading");
    try {
      const res = await fetch(`/api/trips/${tripId}/suggestions`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to generate");
      setSuggestions(data.suggestions ?? []);
      setState("success");
    } catch {
      setState("error");
    }
  }

  useEffect(() => {
    if (!hasCached && ready) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === "idle") return null;

  if (state === "error") {
    return (
      <Card>
        <CardContent className="px-5 py-4 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Couldn&apos;t generate trip suggestions.
          </p>
          <Button variant="outline" size="sm" onClick={generate}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (state === "loading") {
    return (
      <div className="space-y-4">
        <p className="text-xs text-muted-foreground">
          Generating suggestions — this takes about 10 seconds…
        </p>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-4">
      {suggestions.map((row, i) => (
        <SuggestionCard key={row.id ?? row.rank} row={row} index={i} />
      ))}
    </div>
  );
}

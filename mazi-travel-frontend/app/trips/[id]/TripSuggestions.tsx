"use client";

import { useEffect, useState } from "react";
import { getTripImage } from "@/lib/ai/generate-images";
import { Button } from "@/components/ui/button";
import { Sparkles, MapPin } from "lucide-react";

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
    <div
      className="overflow-hidden"
      style={{
        background: "#ffffff",
        borderRadius: "1.5rem",
        boxShadow: "0px 12px 32px rgba(25,28,30,0.06)",
      }}
    >
      {/* Hero image */}
      {imageUrl ? (
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={row.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div>
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wide mb-0.5">
                Option {index + 1}
              </p>
              <h3 className="text-white text-lg font-bold leading-snug"
                style={{ fontFamily: "var(--font-jakarta, system-ui)", letterSpacing: "-0.01em" }}>
                {row.title}
              </h3>
            </div>
            <span
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0"
              style={{ background: "rgba(255,255,255,0.2)", color: "#ffffff", backdropFilter: "blur(8px)" }}
            >
              {s.vibe}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="h-28 w-full flex items-end p-5"
          style={{
            background: `linear-gradient(135deg, hsl(${(index * 60 + 220) % 360}, 70%, 25%) 0%, hsl(${(index * 60 + 240) % 360}, 60%, 35%) 100%)`,
          }}
        >
          <h3
            className="text-white text-lg font-bold"
            style={{ fontFamily: "var(--font-jakarta, system-ui)", letterSpacing: "-0.01em" }}
          >
            {row.title}
          </h3>
        </div>
      )}

      <div className="p-5">
        {/* Tagline */}
        {row.tagline && (
          <p className="text-sm mb-3" style={{ color: "#434654", fontStyle: "italic" }}>
            &ldquo;{row.tagline}&rdquo;
          </p>
        )}

        {/* Why it fits */}
        <p
          className="text-sm leading-relaxed mb-4"
          style={{ color: "#191C1E", fontFamily: "var(--font-inter, system-ui)" }}
        >
          {s.why_it_fits}
        </p>

        {/* Neighborhoods */}
        {s.candidate_neighborhoods?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#434654" }}>
              Neighborhoods
            </p>
            <div className="flex flex-wrap gap-1.5">
              {s.candidate_neighborhoods.map((n) => (
                <span
                  key={n}
                  className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
                  style={{ background: "#F2F4F7", color: "#191C1E" }}
                >
                  <MapPin className="h-3 w-3 text-[#003D9B]" />
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Activities */}
        {s.candidate_activities?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "#434654" }}>
              Activities
            </p>
            <div className="space-y-2">
              {s.candidate_activities.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 mt-0.5"
                    style={{ background: "#006661", color: "#5DE7DE" }}
                  >
                    {CATEGORY_LABELS[a.category] ?? a.category}
                  </span>
                  <span>
                    <span className="font-medium" style={{ color: "#191C1E" }}>{a.name}</span>
                    {a.why && <span style={{ color: "#434654" }}> — {a.why}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div
          className="grid grid-cols-2 gap-3 pt-4 text-xs"
          style={{ borderTop: "1px solid rgba(195,198,214,0.2)" }}
        >
          {s.budget_note && (
            <div>
              <p className="font-semibold mb-0.5" style={{ color: "#191C1E" }}>Budget</p>
              <p style={{ color: "#434654" }}>{s.budget_note}</p>
            </div>
          )}
          {s.weather_note && (
            <div>
              <p className="font-semibold mb-0.5" style={{ color: "#191C1E" }}>Weather</p>
              <p style={{ color: "#434654" }}>{s.weather_note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      className="animate-pulse overflow-hidden"
      style={{ background: "#ffffff", borderRadius: "1.5rem", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
    >
      <div className="h-48 w-full bg-[#F2F4F7]" />
      <div className="p-5">
        <div className="h-3 w-16 rounded bg-[#F2F4F7] mb-1" />
        <div className="h-4 w-2/3 rounded bg-[#F2F4F7] mb-1" />
        <div className="h-3 w-1/2 rounded bg-[#F2F4F7] mb-4" />
        <div className="space-y-2 mb-4">
          <div className="h-3 w-full rounded bg-[#F2F4F7]" />
          <div className="h-3 w-5/6 rounded bg-[#F2F4F7]" />
        </div>
      </div>
    </div>
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
      <div
        className="rounded-[1.25rem] p-5 flex items-center justify-between gap-4"
        style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
      >
        <p className="text-sm" style={{ color: "#434654" }}>
          Couldn&apos;t generate trip suggestions.
        </p>
        <Button variant="outline" size="sm" onClick={generate} className="rounded-xl">
          Retry
        </Button>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#904D00]" />
          <p className="text-xs" style={{ color: "#434654" }}>
            Generating suggestions — this takes about 10 seconds…
          </p>
        </div>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (suggestions.length === 0) return null;

  return (
    <div className="space-y-5">
      {suggestions.map((row, i) => (
        <SuggestionCard key={row.id ?? row.rank} row={row} index={i} />
      ))}
    </div>
  );
}

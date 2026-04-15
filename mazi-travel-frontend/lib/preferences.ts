export const PACE_OPTIONS = [
  { value: "relaxed", label: "Relaxed" },
  { value: "balanced", label: "Balanced" },
  { value: "packed", label: "Packed" },
] as const;

export const BUDGET_OPTIONS = [
  { value: "budget", label: "Budget-friendly" },
  { value: "moderate", label: "Moderate" },
  { value: "comfortable", label: "Comfortable" },
  { value: "luxury", label: "Luxury" },
] as const;

export const PRIORITY_OPTIONS = [
  "Food & dining",
  "Nightlife",
  "Outdoor activities",
  "Beach / water",
  "Museums & culture",
  "Shopping",
  "Adventure sports",
  "Relaxation & wellness",
  "Local experiences",
] as const;

export type ParticipantPreference = {
  id: string;
  trip_id: string;
  user_id: string;
  trip_pace: string;
  budget_range: string;
  top_priorities: string[];
  ai_notes: string | null;
  submitted_at: string;
};

export type AggregatedPreferences = {
  pace: Record<string, number>;
  budget: Record<string, number>;
  priorities: { name: string; count: number }[];
};

export function aggregatePreferences(prefs: ParticipantPreference[]): AggregatedPreferences {
  const pace: Record<string, number> = {};
  const budget: Record<string, number> = {};
  const priorityCounts: Record<string, number> = {};

  for (const p of prefs) {
    pace[p.trip_pace] = (pace[p.trip_pace] ?? 0) + 1;
    budget[p.budget_range] = (budget[p.budget_range] ?? 0) + 1;
    for (const pri of p.top_priorities) {
      priorityCounts[pri] = (priorityCounts[pri] ?? 0) + 1;
    }
  }

  const priorities = Object.entries(priorityCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return { pace, budget, priorities };
}

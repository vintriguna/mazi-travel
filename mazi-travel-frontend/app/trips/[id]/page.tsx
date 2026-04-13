import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";

const BUDGET_LABELS: Record<string, string> = {
  under_500: "Under $500",
  "500_1500": "$500 – $1,500",
  "1500_3000": "$1,500 – $3,000",
  "3000_plus": "$3,000+",
};

const PURPOSE_LABELS: Record<string, string> = {
  leisure: "Leisure",
  adventure: "Adventure",
  business: "Business",
  other: "Other",
};

export default async function TripDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch trip via service-role client (bypasses RLS)
  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !trip) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Trip not found.</p>
      </div>
    );
  }

  // Check ownership
  const sessionClient = await createClient();
  const { data: claimsData } = await sessionClient.auth.getClaims();
  const isOwner = claimsData?.claims?.sub === trip.user_id;

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="mx-auto max-w-lg">
        <Link
          href="/trips"
          className="mb-8 inline-block text-sm text-zinc-500 hover:text-black dark:hover:text-white"
        >
          ← All trips
        </Link>

        <div className="mb-2 flex items-center gap-3">
          <h1 className="text-3xl font-semibold text-black dark:text-white">
            {trip.name}
          </h1>
          {isOwner && (
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
              Owner
            </span>
          )}
        </div>

        <div className="mt-6 grid gap-4">
          <Row label="Destination" value={trip.destination} />
          <Row
            label="Dates"
            value={
              trip.start_date && trip.end_date
                ? `${trip.start_date} → ${trip.end_date}`
                : trip.start_date || trip.end_date || "—"
            }
          />
          <Row
            label="Budget"
            value={
              trip.budget_range
                ? (BUDGET_LABELS[trip.budget_range] ?? trip.budget_range)
                : "—"
            }
          />
          <Row
            label="Purpose"
            value={
              trip.trip_purpose
                ? (PURPOSE_LABELS[trip.trip_purpose] ?? trip.trip_purpose)
                : "—"
            }
          />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {label}
      </div>
      <div className="mt-1 text-sm text-black dark:text-white">{value}</div>
    </div>
  );
}

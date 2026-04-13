import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  const { data: trip, error } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !trip) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-destructive">Trip not found.</p>
      </div>
    );
  }

  const sessionClient = await createClient();
  const { data: claimsData } = await sessionClient.auth.getClaims();
  const isOwner = claimsData?.claims?.sub === trip.user_id;

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Link
          href="/trips"
          className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← All trips
        </Link>

        <div className="mb-6 flex items-center gap-3">
          <h1 className="text-3xl font-semibold">{trip.name}</h1>
          {isOwner && <Badge variant="secondary">Owner</Badge>}
        </div>

        <div className="grid gap-3">
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
    <Card>
      <CardContent className="px-5 py-4">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </div>
        <div className="mt-1 text-sm">{value}</div>
      </CardContent>
    </Card>
  );
}

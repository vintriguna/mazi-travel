import Link from "next/link";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CopyInviteLink from "./CopyInviteLink";
import TripSummary from "./TripSummary";
import FlightSummary from "./FlightSummary";

const TRIP_TYPE_LABELS: Record<string, string> = {
  vacation: "Vacation",
  event_celebration: "Event / celebration",
  work_conference: "Work / conference",
};

const PACE_LABELS: Record<string, string> = {
  relaxed: "Relaxed",
  balanced: "Balanced",
  packed: "Packed",
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

  // Current user
  const sessionClient = await createClient();
  const { data: claimsData } = await sessionClient.auth.getClaims();
  const currentUserId = claimsData?.claims?.sub;
  const isOwner = currentUserId === trip.user_id;

  // Participants
  const { data: participants } = await supabase
    .from("trip_participants")
    .select("user_id, role, joined_at")
    .eq("trip_id", id)
    .order("joined_at", { ascending: true });

  type ParticipantRow = { user_id: string; role: string; joined_at: string };
  type ParticipantDisplay = ParticipantRow & { email: string };

  let participantList: ParticipantDisplay[] = [];
  if (participants && participants.length > 0) {
    const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const userMap = new Map(usersData?.users.map((u) => [u.id, u.email ?? u.id]));
    participantList = participants.map((p) => ({
      ...p,
      email: userMap.get(p.user_id) ?? p.user_id,
    }));
  }

  // Build invite link
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const inviteLink = `${protocol}://${host}/trips/join?code=${trip.invite_code}`;

  const dateValue =
    trip.start_date && trip.end_date
      ? `${trip.start_date} → ${trip.end_date}`
      : trip.start_date || trip.end_date || null;

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10">
      <div className="mx-auto max-w-2xl">

        {/* Back nav */}
        <Link
          href="/trips"
          className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← All trips
        </Link>

        {/* Hero header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight">{trip.name}</h1>
              {trip.destination && (
                <p className="mt-1.5 text-lg text-muted-foreground">{trip.destination}</p>
              )}
              {dateValue && (
                <p className="mt-1 text-sm text-muted-foreground">{dateValue}</p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0 pt-1">
              {isOwner && <Badge variant="secondary">Owner</Badge>}
              {trip.trip_type && (
                <Badge variant="outline">
                  {TRIP_TYPE_LABELS[trip.trip_type] ?? trip.trip_type}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* AI summary */}
        <TripSummary tripId={id} existingSummary={trip.ai_summary ?? null} />

        <FlightSummary tripId={id} existingPlan={trip.flight_summary ?? null} />

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard
            label="Group size"
            value={trip.group_size ? `${trip.group_size} people` : "—"}
          />
          <StatCard
            label="Total budget"
            value={trip.total_budget ? `$${trip.total_budget.toLocaleString()}` : "—"}
          />
          <StatCard
            label="Pace"
            value={trip.trip_pace ? (PACE_LABELS[trip.trip_pace] ?? trip.trip_pace) : "—"}
          />
        </div>

        {/* Priorities */}
        {trip.top_priorities?.length > 0 && (
          <div className="mb-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Priorities
            </p>
            <div className="flex flex-wrap gap-2">
              {trip.top_priorities.map((p: string) => (
                <span
                  key={p}
                  className="rounded-full border bg-background px-3 py-1 text-sm"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Additional notes */}
        {trip.ai_notes && (
          <Card className="mb-6">
            <CardContent className="px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Notes
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">{trip.ai_notes}</p>
            </CardContent>
          </Card>
        )}

        <Separator className="my-8" />

        {/* Participants */}
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Participants
          </h2>
          <div className="grid gap-2">
            {participantList.map((p) => (
              <Card key={p.user_id}>
                <CardContent className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm">
                    {p.email}
                    {p.user_id === currentUserId && (
                      <span className="ml-1.5 text-muted-foreground">(you)</span>
                    )}
                  </span>
                  <Badge variant={p.role === "owner" ? "default" : "secondary"}>
                    {p.role}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Invite link — owners only */}
        {isOwner && (
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Invite link
            </h2>
            <CopyInviteLink code={trip.invite_code} link={inviteLink} />
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="px-4 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1.5 text-base font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

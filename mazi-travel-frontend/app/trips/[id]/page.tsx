import Link from "next/link";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CopyInviteLink from "./CopyInviteLink";
import TripSummary from "./TripSummary";

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

  // Fetch emails for participants via admin API
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

        {/* AI summary */}
        <TripSummary tripId={id} existingSummary={trip.ai_summary ?? null} />

        {/* Trip details */}
        <div className="grid gap-3">
          <Row label="Destination" value={trip.destination ?? "—"} />
          <Row
            label="Dates"
            value={
              trip.start_date && trip.end_date
                ? `${trip.start_date} → ${trip.end_date}`
                : trip.start_date || trip.end_date || "—"
            }
          />
          <Row
            label="Trip type"
            value={trip.trip_type ? (TRIP_TYPE_LABELS[trip.trip_type] ?? trip.trip_type) : "—"}
          />
          <Row
            label="Group size"
            value={trip.group_size ? `${trip.group_size} people` : "—"}
          />
          <Row
            label="Total budget"
            value={trip.total_budget ? `$${trip.total_budget.toLocaleString()}` : "—"}
          />
          <Row
            label="Pace"
            value={trip.trip_pace ? (PACE_LABELS[trip.trip_pace] ?? trip.trip_pace) : "—"}
          />
          <Row
            label="Priorities"
            value={trip.top_priorities?.length ? trip.top_priorities.join(", ") : "—"}
          />
          {trip.ai_notes && <Row label="Notes" value={trip.ai_notes} />}
        </div>

        {/* Participants */}
        <div className="mt-8">
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
          <div className="mt-8">
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

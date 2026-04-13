import Link from "next/link";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CopyInviteLink from "./CopyInviteLink";

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

        {/* Trip details */}
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

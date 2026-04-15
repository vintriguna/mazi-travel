import Link from "next/link";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import CopyInviteLink from "./CopyInviteLink";
import TripSummary from "./TripSummary";
import FlightSummary from "./FlightSummary";
import GroupSummary from "./GroupSummary";
import TripSuggestions from "./TripSuggestions";
import { aggregatePreferences } from "@/lib/preferences";
import type { ParticipantPreference } from "@/lib/preferences";
import UpdateGroupSize from "./UpdateGroupSize";

const TRIP_TYPE_LABELS: Record<string, string> = {
  vacation: "Vacation",
  event_celebration: "Event / celebration",
  work_conference: "Work / conference",
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

  // Participant preferences
  const { data: prefsData } = await supabase
    .from("participant_preferences")
    .select("*")
    .eq("trip_id", id);

  const preferences: ParticipantPreference[] = prefsData ?? [];
  const participantsJoined = participants?.length ?? 0;
  const preferencesSubmitted = preferences.length;
  const groupSize = trip.group_size ?? 0;
  const allReady =
    groupSize > 0 &&
    participantsJoined >= groupSize &&
    preferencesSubmitted >= groupSize;

  const currentUserIsParticipant = participants?.some((p) => p.user_id === currentUserId) ?? false;
  const currentUserSubmitted = preferences.some((p) => p.user_id === currentUserId);

  const aggregated = aggregatePreferences(preferences);

  // Existing suggestions
  const { data: suggestionsData } = await supabase
    .from("trip_suggestions")
    .select("*")
    .eq("trip_id", id)
    .order("rank", { ascending: true });

  const existingSuggestions = suggestionsData && suggestionsData.length > 0
    ? suggestionsData
    : null;

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
              <div className="mt-1.5 flex items-center gap-2 text-lg text-muted-foreground">
                <span className="font-medium text-foreground">
                  {trip.origin ?? "—"}
                </span>
                <span>→</span>
                <span className="font-medium text-foreground">
                  {trip.destination ?? "—"}
                </span>
              </div>
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

        {/* Stats grid */}
        <div className="mb-6">
          <Card>
            <CardContent className="px-4 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Group size
              </p>
              <p className="mt-1.5 text-base font-semibold flex items-center">
                {groupSize ? `${groupSize} people` : "—"}
                {isOwner && groupSize > 0 && (
                  <UpdateGroupSize tripId={id} currentSize={groupSize} />
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Submit preferences CTA */}
        {currentUserIsParticipant && !currentUserSubmitted && (
          <Card className="mb-6 border-primary/30 bg-primary/5">
            <CardContent className="px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">Your preferences are needed</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submit your preferences so the group plan can be generated.
                </p>
              </div>
              <Link href={`/trips/${id}/preferences`}>
                <Button size="sm">Submit now</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Group summary (non-AI) */}
        {preferencesSubmitted > 0 && (
          <GroupSummary aggregated={aggregated} totalSubmitted={preferencesSubmitted} />
        )}

        <Separator className="my-8" />

        {/* AI summary */}
        {allReady ? (
          <TripSummary tripId={id} existingSummary={trip.ai_summary ?? null} ready={true} />
        ) : (
          <Card className="mb-6">
            <CardContent className="px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                AI Summary
              </p>
              <p className="text-sm text-muted-foreground">
                Will generate once all {groupSize} participants submit their preferences.
              </p>
            </CardContent>
          </Card>
        )}

        <Separator className="my-8" />

        {/* Trip suggestions */}
        <div className="mb-8">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Trip Suggestions
          </h2>
          {allReady ? (
            <TripSuggestions
              tripId={id}
              existingSuggestions={existingSuggestions}
              ready={true}
            />
          ) : (
            <Card>
              <CardContent className="px-5 py-4">
                <p className="text-sm text-muted-foreground">
                  Will generate once all {groupSize} participants submit their preferences.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <Separator className="my-8" />

        {/* Participants */}
        <div className="mb-8">
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Participants
            </h2>
            <span className="text-sm text-muted-foreground">
              {preferencesSubmitted} of {groupSize} joined
            </span>
          </div>
          <div className="grid gap-2">
            {participantList.map((p) => {
              const submitted = preferences.some((pref) => pref.user_id === p.user_id);
              return (
                <Card key={p.user_id}>
                  <CardContent className="flex items-center justify-between px-4 py-3">
                    <span className="text-sm">
                      {p.email}
                      {p.user_id === currentUserId && (
                        <span className="ml-1.5 text-muted-foreground">(you)</span>
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      {submitted ? (
                        <span className="text-xs text-green-600">Joined</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not yet joined</span>
                      )}
                      <Badge variant={p.role === "owner" ? "default" : "secondary"}>
                        {p.role}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Invite link — owners only */}
        {isOwner && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Invite link
            </h2>
            <CopyInviteLink code={trip.invite_code} link={inviteLink} />
          </div>
        )}

        <Separator className="my-8" />

        {/* Flight summary */}
        <div className="mb-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Flight summary
          </h2>
          {allReady ? (
            <FlightSummary tripId={id} existingPlan={trip.flight_summary ?? null} ready={true} />
          ) : (
            <Card>
              <CardContent className="px-5 py-4">
                <p className="text-sm text-muted-foreground">
                  Will generate once all {groupSize} participants submit their preferences.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}

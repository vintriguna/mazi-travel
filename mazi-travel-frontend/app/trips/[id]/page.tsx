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

import CompletionProgress from "./CompletionProgress";
import { aggregatePreferences } from "@/lib/preferences";
import type { ParticipantPreference } from "@/lib/preferences";
import UpdateGroupSize from "./UpdateGroupSize";
import TripTabs from "./TripTabs";


export const TRIP_TYPE_LABELS: Record<string, string> = {
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
  // Tabs state (client component)
  // This is a workaround for Next.js server components: tabs will be rendered as a client component below

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

  // Tabs UI as a client component
  // This must be rendered as a client component, so we use a wrapper
  return <TripTabs
    trip={trip}
    isOwner={isOwner}
    id={id}
    groupSize={groupSize}
    participantsJoined={participantsJoined}
    preferencesSubmitted={preferencesSubmitted}
    currentUserIsParticipant={currentUserIsParticipant}
    currentUserSubmitted={currentUserSubmitted}
    aggregated={aggregated}
    preferences={preferences}
    participantList={participantList}
    inviteLink={inviteLink}
    allReady={allReady}
    existingSuggestions={existingSuggestions}
    existingSummary={trip.ai_summary ?? null}
    existingPlan={trip.flight_summary ?? null}
    TRIP_TYPE_LABELS={TRIP_TYPE_LABELS}
  />;
}

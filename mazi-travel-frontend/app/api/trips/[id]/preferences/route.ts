import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { PACE_OPTIONS, BUDGET_OPTIONS, PRIORITY_OPTIONS } from "@/lib/preferences";

const VALID_PACES = PACE_OPTIONS.map((o) => o.value);
const VALID_BUDGETS = BUDGET_OPTIONS.map((o) => o.value);
const VALID_PRIORITIES = new Set(PRIORITY_OPTIONS as readonly string[]);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sessionClient = await createClient();
  const { data: claimsData } = await sessionClient.auth.getClaims();
  if (!claimsData?.claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = claimsData.claims.sub;

  // Verify caller is a participant
  const { data: participant } = await supabase
    .from("trip_participants")
    .select("id")
    .eq("trip_id", id)
    .eq("user_id", userId)
    .single();

  if (!participant) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });
  }

  // Fetch trip group_size
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("group_size")
    .eq("id", id)
    .single();

  if (tripError || !trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  // Count participants joined
  const { count: participantsJoined } = await supabase
    .from("trip_participants")
    .select("*", { count: "exact", head: true })
    .eq("trip_id", id);

  // Fetch all submitted preferences
  const { data: preferences, error: prefsError } = await supabase
    .from("participant_preferences")
    .select("*")
    .eq("trip_id", id);

  if (prefsError) {
    return NextResponse.json({ error: prefsError.message }, { status: 500 });
  }

  const preferencesSubmitted = preferences?.length ?? 0;
  const groupSize = trip.group_size ?? 0;
  const allReady =
    groupSize > 0 &&
    (participantsJoined ?? 0) >= groupSize &&
    preferencesSubmitted >= groupSize;

  return NextResponse.json({
    preferences: preferences ?? [],
    groupSize,
    participantsJoined: participantsJoined ?? 0,
    preferencesSubmitted,
    allReady,
    currentUserSubmitted: preferences?.some((p) => p.user_id === userId) ?? false,
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sessionClient = await createClient();
  const { data: claimsData } = await sessionClient.auth.getClaims();
  if (!claimsData?.claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = claimsData.claims.sub;

  // Verify caller is a participant
  const { data: participant } = await supabase
    .from("trip_participants")
    .select("id")
    .eq("trip_id", id)
    .eq("user_id", userId)
    .single();

  if (!participant) {
    return NextResponse.json({ error: "Not a participant" }, { status: 403 });
  }

  // Check if already submitted
  const { data: existing } = await supabase
    .from("participant_preferences")
    .select("id")
    .eq("trip_id", id)
    .eq("user_id", userId)
    .single();

  if (existing) {
    return NextResponse.json({ error: "Preferences already submitted" }, { status: 409 });
  }

  const body = await req.json();
  const { tripPace, budgetRange, topPriorities, aiNotes } = body;

  // Validate
  if (!VALID_PACES.includes(tripPace)) {
    return NextResponse.json({ error: "Invalid trip pace" }, { status: 400 });
  }
  if (!VALID_BUDGETS.includes(budgetRange)) {
    return NextResponse.json({ error: "Invalid budget range" }, { status: 400 });
  }
  if (
    !Array.isArray(topPriorities) ||
    topPriorities.length < 1 ||
    topPriorities.length > 3 ||
    !topPriorities.every((p: unknown) => typeof p === "string" && VALID_PRIORITIES.has(p))
  ) {
    return NextResponse.json(
      { error: "top_priorities must be 1–3 items from the allowed list" },
      { status: 400 }
    );
  }

  const { error: insertError } = await supabase
    .from("participant_preferences")
    .insert({
      trip_id: id,
      user_id: userId,
      trip_pace: tripPace,
      budget_range: budgetRange,
      top_priorities: topPriorities,
      ai_notes: aiNotes || null,
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

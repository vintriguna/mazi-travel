import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { generateFlightPlan } from "@/lib/ai/generate-flights";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log("🚀 [FLIGHTS] Starting request for trip:", id);

  // Auth check
  const sessionClient = await createClient();
  const { data: claimsData, error: authError } = await sessionClient.auth.getClaims();

  if (authError) {
    return NextResponse.json({ error: "Auth error" }, { status: 401 });
  }
  if (!claimsData?.claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch trip
  const { data: trip, error: tripError } = await sessionClient
    .from("trips")
    .select("origin, destination, start_date, end_date, trip_type, group_size, flight_summary")
    .eq("id", id)
    .single();

  if (tripError || !trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  // Readiness check: all participants must have submitted preferences
  const { count: participantsJoined } = await supabase
    .from("trip_participants")
    .select("*", { count: "exact", head: true })
    .eq("trip_id", id);

  const { data: preferences, count: preferencesSubmitted } = await supabase
    .from("participant_preferences")
    .select("*", { count: "exact" })
    .eq("trip_id", id);

  const groupSize = trip.group_size ?? 0;
  const allReady =
    groupSize > 0 &&
    (participantsJoined ?? 0) >= groupSize &&
    (preferencesSubmitted ?? 0) >= groupSize;

  if (!allReady) {
    return NextResponse.json(
      { error: "not_ready", message: "Waiting for all participants to submit preferences" },
      { status: 400 }
    );
  }

  // Idempotent check
  if (trip.flight_summary) {
    console.log("⚡ Returning cached flight summary");
    return NextResponse.json({ plan: trip.flight_summary });
  }

  try {
    console.log("✈️ Generating flight plan...");
    const flights = await generateFlightPlan({
      ...trip,
      participant_preferences: preferences ?? [],
    });

    const { error: updateError } = await sessionClient
      .from("trips")
      .update({ flight_summary: flights })
      .eq("id", id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ plan: flights });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("🔥 Route error:", message, err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

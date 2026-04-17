import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { generateTripSummary } from "@/lib/ai/generate-summary";
// import { generateFlightSummary } from "@/lib/ai/generate-flights";
import { NextResponse } from "next/server";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verify auth
  const sessionClient = await createClient();
  const { data: claimsData } = await sessionClient.auth.getClaims();
  if (!claimsData?.claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch the trip
  const { data: trip, error } = await supabase
    .from("trips")
    .select("origin, destination, start_date, end_date, trip_type, group_size, ai_summary, flight_summary")
    .eq("id", id)
    .single();

  if (error || !trip) {
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

  // Idempotent: return cached summary if already generated
  if (trip.ai_summary) {
    return NextResponse.json({ summary: trip.ai_summary });
  }

  try {
    const summary = await generateTripSummary({
      ...trip,
      participant_preferences: preferences ?? [],
    });

    await supabase
      .from("trips")
      .update({ ai_summary: summary })
      // .update({ ai_summary: summary, flight_summary: flights })
      .eq("id", id);

    return NextResponse.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[summary route]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { generateTripSummary } from "@/lib/ai/generate-summary";
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
    .select("destination, start_date, end_date, trip_type, group_size, total_budget, trip_pace, top_priorities, ai_notes, ai_summary")
    .eq("id", id)
    .single();

  if (error || !trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  // Idempotent: return cached summary if already generated
  if (trip.ai_summary) {
    return NextResponse.json({ summary: trip.ai_summary });
  }

  try {
    const summary = await generateTripSummary(trip);

    await supabase
      .from("trips")
      .update({ ai_summary: summary })
      .eq("id", id);

    return NextResponse.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[summary route]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

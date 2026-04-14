import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { generateFlightPlan } from "@/lib/ai/generate-flights";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // avoid caching issues

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  console.log("🚀 [FLIGHTS] Starting request for trip:", id);

  // ✅ Auth check
  const sessionClient = await createClient();
  const { data: claimsData, error: authError } =
    await sessionClient.auth.getClaims();

  if (authError) {
    console.error("❌ Auth error:", authError);
    return NextResponse.json({ error: "Auth error" }, { status: 401 });
  }

  if (!claimsData?.claims) {
    console.warn("⚠️ No auth claims found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  console.log("✅ Authenticated user:", claimsData.claims.sub);

  // ✅ Fetch trip
  const { data: trip, error: tripError } = await sessionClient
    .from("trips")
    .select(
      "destination, start_date, end_date, trip_type, group_size, total_budget, trip_pace, top_priorities, ai_notes, ai_summary, flight_summary"
    )
    .eq("id", id)
    .single();

  if (tripError) {
    console.error("❌ Trip fetch error:", tripError);
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  console.log("📦 Trip data:", trip);

  // ✅ Idempotent check (FIXED)
  if (trip.flight_summary) {
    console.log("⚡ Returning cached flight summary");
    return NextResponse.json({ plan: trip.flight_summary });
  }

  try {
    // ✅ Generate flights
    console.log("✈️ Generating flight plan...");
    const flights = await generateFlightPlan(trip);

    console.log("🧠 AI flight result:", flights);

    // ✅ Update DB (IMPORTANT: use sessionClient)
    const { data: updateData, error: updateError } = await sessionClient
      .from("trips")
      .update({ flight_summary: flights })
      .eq("id", id)
      .select();

    if (updateError) {
      console.error("❌ Supabase update error:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    console.log("✅ Supabase update success:", updateData);

    return NextResponse.json({ plan: flights });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    console.error("🔥 Route error:", message);
    console.error("🔥 Full error:", err);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
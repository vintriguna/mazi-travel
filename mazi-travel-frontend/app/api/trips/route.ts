// app/api/trips/route.ts
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Verify the caller is authenticated
  const sessionClient = await createClient();
  const { data: claimsData } = await sessionClient.auth.getClaims();
  if (!claimsData?.claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = claimsData.claims.sub;

  const body = await req.json();
  const {
    name,
    destination,
    startDate,
    endDate,
    tripType,
    groupSize,
    totalBudget,
    tripPace,
    topPriorities,
    aiNotes,
  } = body;

  try {
    // Use the service-role client for the insert so it bypasses RLS cleanly
    const { data: trip, error } = await supabase
      .from("trips")
      .insert({
        name,
        destination,
        start_date: startDate || null,
        end_date: endDate || null,
        trip_type: tripType || null,
        group_size: groupSize ? Number(groupSize) : null,
        total_budget: totalBudget ? Number(totalBudget) : null,
        trip_pace: tripPace || null,
        top_priorities: topPriorities?.length ? topPriorities : null,
        ai_notes: aiNotes || null,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    // Add the creator as the owner participant
    const { error: participantError } = await supabase
      .from("trip_participants")
      .insert({ trip_id: trip.id, user_id: userId, role: "owner" });

    if (participantError) throw participantError;

    return NextResponse.json({ success: true, tripId: trip.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

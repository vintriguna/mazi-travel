import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Verify auth
  const sessionClient = await createClient();
  const { data: claimsData } = await sessionClient.auth.getClaims();
  if (!claimsData?.claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = claimsData.claims.sub;

  const { code } = await req.json();
  if (!code) {
    return NextResponse.json({ error: "Missing invite code" }, { status: 400 });
  }

  // Find the trip
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("id, user_id")
    .eq("invite_code", code)
    .single();

  if (tripError || !trip) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  // Check if already a participant
  const { data: existing } = await supabase
    .from("trip_participants")
    .select("id")
    .eq("trip_id", trip.id)
    .eq("user_id", userId)
    .single();

  if (existing) {
    // Already a member — just redirect them to the trip
    return NextResponse.json({ tripId: trip.id, alreadyJoined: true });
  }

  // Insert as member
  const { error: insertError } = await supabase
    .from("trip_participants")
    .insert({ trip_id: trip.id, user_id: userId, role: "member" });

  if (insertError) {
    const message = insertError.message ?? "Failed to join trip";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ tripId: trip.id });
}

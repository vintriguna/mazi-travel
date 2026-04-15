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
  const { name, origin, destination, startDate, endDate, tripType, groupSize } = body;

  // Validate group size
  const parsedGroupSize = groupSize ? Number(groupSize) : null;
  if (!parsedGroupSize || parsedGroupSize < 1 || parsedGroupSize > 4) {
    return NextResponse.json(
      { error: "Group size must be between 1 and 4" },
      { status: 400 }
    );
  }

  try {
    const { data: trip, error } = await supabase
      .from("trips")
      .insert({
        name,
        origin,
        destination,
        start_date: startDate || null,
        end_date: endDate || null,
        trip_type: tripType || null,
        group_size: parsedGroupSize,
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

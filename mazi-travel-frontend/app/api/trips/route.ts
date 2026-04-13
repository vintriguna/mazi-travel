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
  const { name, destination, startDate, endDate, budgetRange, tripPurpose } = body;

  try {
    // Use the service-role client for the insert so it bypasses RLS cleanly
    const { data: trip, error } = await supabase
      .from("trips")
      .insert({
        name,
        destination,
        start_date: startDate || null,
        end_date: endDate || null,
        budget_range: budgetRange || null,
        trip_purpose: tripPurpose || null,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, tripId: trip.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

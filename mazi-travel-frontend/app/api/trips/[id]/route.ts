import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// PATCH /api/trips/[id] — owner updates group size
export async function PATCH(
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

  // Verify caller is the owner
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("user_id, group_size")
    .eq("id", id)
    .single();

  if (tripError || !trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  if (trip.user_id !== userId) {
    return NextResponse.json({ error: "Only the owner can update group size" }, { status: 403 });
  }

  const { groupSize } = await req.json();
  const newSize = Number(groupSize);

  if (!newSize || newSize < 1 || newSize > 4) {
    return NextResponse.json({ error: "Group size must be 1–4" }, { status: 400 });
  }

  // Cannot shrink below current participant count
  const { count: participantCount } = await supabase
    .from("trip_participants")
    .select("*", { count: "exact", head: true })
    .eq("trip_id", id);

  if (newSize < (participantCount ?? 0)) {
    return NextResponse.json(
      { error: `Cannot set group size below current participant count (${participantCount})` },
      { status: 400 }
    );
  }

  // If group size changes, clear cached AI output so it re-generates with updated group
  const updates: Record<string, unknown> = { group_size: newSize };
  if (newSize !== trip.group_size) {
    updates.ai_summary = null;
    updates.flight_summary = null;
  }

  const { error: updateError } = await supabase
    .from("trips")
    .update(updates)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/trips/[id] — owner deletes trip
export async function DELETE(
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

  // Verify trip exists and user is owner
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("user_id")
    .eq("id", id)
    .single();

  if (tripError || !trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  if (trip.user_id !== userId) {
    return NextResponse.json(
      { error: "Only the owner can delete this trip" },
      { status: 403 }
    );
  }

  // Optional: delete related participants first (if no cascade in DB)
  const { error: participantsError } = await supabase
    .from("trip_participants")
    .delete()
    .eq("trip_id", id);

  if (participantsError) {
    return NextResponse.json(
      { error: participantsError.message },
      { status: 500 }
    );
  }

  // Delete the trip
  const { error: deleteError } = await supabase
    .from("trips")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json(
      { error: deleteError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}


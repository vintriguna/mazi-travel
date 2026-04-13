import { supabase } from "@/lib/supabase";
import { NextResponse, type NextRequest } from "next/server";

// Public endpoint — no auth required — returns minimal trip info for the join confirmation page
export async function GET(request: NextRequest) {
  const code = new URL(request.url).searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const { data: trip, error } = await supabase
    .from("trips")
    .select("id, name, destination")
    .eq("invite_code", code)
    .single();

  if (error || !trip) {
    return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  }

  return NextResponse.json(trip);
}

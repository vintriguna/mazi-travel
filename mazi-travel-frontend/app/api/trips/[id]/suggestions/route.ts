import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL!; // e.g. https://vtriguna.app.n8n.cloud/webhook/trip-suggestions
const N8N_WEBHOOK_SECRET = process.env.N8N_WEBHOOK_SECRET!;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sessionClient = await createClient();
  const { data: claimsData } = await sessionClient.auth.getClaims();
  if (!claimsData?.claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: suggestions, error } = await supabase
    .from("trip_suggestions")
    .select("*")
    .eq("trip_id", id)
    .order("rank", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ suggestions: suggestions ?? [] });
}

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const sessionClient = await createClient();
  const { data: claimsData } = await sessionClient.auth.getClaims();
  if (!claimsData?.claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Readiness check mirrors the summary/flights routes
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("group_size")
    .eq("id", id)
    .single();

  if (tripError || !trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  const { count: participantsJoined } = await supabase
    .from("trip_participants")
    .select("*", { count: "exact", head: true })
    .eq("trip_id", id);

  const { count: preferencesSubmitted } = await supabase
    .from("participant_preferences")
    .select("*", { count: "exact", head: true })
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

  if (!N8N_WEBHOOK_URL) {
    return NextResponse.json({ error: "N8N_WEBHOOK_URL is not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "mazi-webhook-secret": N8N_WEBHOOK_SECRET,
      },
      body: JSON.stringify({ trip_id: id }),
    });

    const rawText = await response.text();
    console.log("[suggestions route] n8n status:", response.status, "body:", rawText.slice(0, 500));

    if (!response.ok) {
      let body: Record<string, unknown> = {};
      try { body = JSON.parse(rawText); } catch {}
      const status = response.status === 409 ? 400 : 502;
      return NextResponse.json(
        { error: body.error ?? "workflow_error", message: body.message ?? `n8n returned ${response.status}`, raw: rawText.slice(0, 200) },
        { status }
      );
    }

    if (!rawText) {
      return NextResponse.json({ error: "n8n returned empty response" }, { status: 502 });
    }

    try {
      const result = JSON.parse(rawText);
      return NextResponse.json(result);
    } catch {
      console.error("[suggestions route] non-JSON response:", rawText.slice(0, 500));
      return NextResponse.json({ error: "n8n returned non-JSON response", raw: rawText.slice(0, 200) }, { status: 502 });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[suggestions route]", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// PATCH /api/trip-suggestions/[id]/image
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const { image_url } = await req.json();
  if (!image_url) {
    return NextResponse.json({ error: "Missing image_url" }, { status: 400 });
  }

  const { error } = await supabase
    .from("trip_suggestions")
    .update({ image_url })
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

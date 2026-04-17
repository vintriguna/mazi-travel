import { NextResponse } from "next/server";
import { getTripImage } from "@/lib/ai/generate-images";

// POST /api/images
export async function POST(req: Request) {
  const { query } = await req.json();
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }
  try {
    const url = await getTripImage(query);
    return NextResponse.json({ imageUrl: url });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 });
  }
}

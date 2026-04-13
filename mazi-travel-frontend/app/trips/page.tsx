import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function TripsPage() {
  const { data: trips } = await supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen p-10">
      <h1 className="text-3xl font-semibold mb-6">Trips</h1>

      <div className="grid gap-4">
        {trips?.map((trip) => (
          <Link
            key={trip.id}
            href={`/trips/${trip.id}`}
            className="p-4 border rounded-xl hover:bg-zinc-100"
          >
            <div className="font-semibold">{trip.name}</div>
            <div className="text-sm text-zinc-500">
              {trip.start_date} → {trip.end_date}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
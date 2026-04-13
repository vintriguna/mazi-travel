import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase";
import LogoutButton from "@/components/LogoutButton";

export default async function TripsPage() {
  const sessionClient = await createClient();
  const { data: claimsData } = await sessionClient.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/auth/login");
  }

  const { data: trips } = await supabase
    .from("trips")
    .select("id, name, destination, start_date, end_date")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10 dark:bg-black">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold text-black dark:text-white">
            Trips
          </h1>
          <div className="flex items-center gap-3">
            <Link
              href="/trips/new"
              className="rounded-2xl bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-black"
            >
              + New trip
            </Link>
            <LogoutButton />
          </div>
        </div>

        {trips && trips.length > 0 ? (
          <div className="grid gap-3">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="block rounded-2xl border border-zinc-200 bg-white px-5 py-4 transition hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="font-semibold text-black dark:text-white">
                  {trip.name}
                </div>
                {trip.destination && (
                  <div className="mt-1 text-sm text-zinc-500">
                    {trip.destination}
                  </div>
                )}
                {(trip.start_date || trip.end_date) && (
                  <div className="mt-1 text-xs text-zinc-400">
                    {trip.start_date}{trip.end_date ? ` → ${trip.end_date}` : ""}
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400">
            No trips yet.{" "}
            <Link href="/trips/new" className="underline">
              Create one.
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

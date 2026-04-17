import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase";
import TripCard from "@/components/TripCard";
import { MapPin } from "lucide-react";

type Trip = {
  id: string;
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
  image_url?: string | null;
};

export default async function TripsPage() {
  const sessionClient = await createClient();
  const { data: claimsData } = await sessionClient.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) redirect("/auth/login");

  const { data: ownedTrips } = await supabase
    .from("trips")
    .select("id, name, destination, start_date, end_date, image_url")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const { data: participantRows } = await supabase
    .from("trip_participants")
    .select("trip_id, trips(id, name, destination, start_date, end_date, image_url)")
    .eq("user_id", userId)
    .eq("role", "member");

  const joinedTrips: Trip[] = (participantRows ?? [])
    .map((row) => row.trips as unknown as Trip)
    .filter(Boolean);

  const hasAnyTrips = (ownedTrips?.length ?? 0) > 0 || joinedTrips.length > 0;

  return (
    <div className="px-4 py-12">
      <div className="mx-auto max-w-5xl">
        {/* Page header */}
        <div className="mb-10">
          <h1
            className="text-display mb-2"
            style={{ color: "#191C1E" }}
          >
            My Trips
          </h1>
          <p
            className="text-base"
            style={{
              color: "#434654",
              fontFamily: "var(--font-inter, system-ui)",
            }}
          >
            Your adventures, organized.
          </p>
        </div>

        {/* Empty state */}
        {!hasAnyTrips && (
          <div
            className="flex flex-col items-center justify-center py-24 rounded-[1.5rem]"
            style={{ background: "#ffffff", boxShadow: "0px 12px 32px rgba(25,28,30,0.06)" }}
          >
            <MapPin className="h-12 w-12 text-[#C3C6D6] mb-4" />
            <p
              className="text-lg font-semibold mb-1"
              style={{ color: "#191C1E", fontFamily: "var(--font-jakarta, system-ui)" }}
            >
              No trips yet
            </p>
            <p className="text-sm text-[#434654] mb-6">
              Create your first trip and invite your crew.
            </p>
            <Link
              href="/trips/new"
              className="btn-gradient rounded-xl px-6 py-2.5 text-sm font-semibold"
            >
              Plan your first trip
            </Link>
          </div>
        )}

        {/* Your trips */}
        {ownedTrips && ownedTrips.length > 0 && (
          <section className="mb-12">
            <h2
              className="mb-5 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#434654" }}
            >
              Your trips
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {ownedTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} isOwner />
              ))}
            </div>
          </section>
        )}

        {/* Joined trips */}
        {joinedTrips.length > 0 && (
          <section
            className="rounded-[1.5rem] px-6 pt-6 pb-8"
            style={{ background: "#F2F4F7" }}
          >
            <h2
              className="mb-5 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#434654" }}
            >
              Joined trips
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {joinedTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

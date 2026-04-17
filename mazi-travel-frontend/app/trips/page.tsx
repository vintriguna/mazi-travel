import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import LogoutButton from "@/components/LogoutButton";
import TripCard from "@/components/TripCard";

type Trip = {
  id: string;
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
};

function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="transition-colors hover:bg-accent cursor-pointer">
        <CardContent className="px-5 py-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="font-semibold">{trip.name}</div>
              {trip.destination && (
                <div className="mt-1 text-sm text-muted-foreground">
                  {trip.destination}
                </div>
              )}
              {(trip.start_date || trip.end_date) && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {trip.start_date}
                  {trip.end_date ? ` → ${trip.end_date}` : ""}
                </div>
              )}
            </div>
            <span className="text-muted-foreground shrink-0">→</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default async function TripsPage() {
  const sessionClient = await createClient();
  const { data: claimsData } = await sessionClient.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) redirect("/auth/login");

  // Trips the user created
  const { data: ownedTrips } = await supabase
    .from("trips")
    .select("id, name, destination, start_date, end_date")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  // Trips the user joined (but didn't create)
  const { data: participantRows } = await supabase
    .from("trip_participants")
    .select("trip_id, trips(id, name, destination, start_date, end_date)")
    .eq("user_id", userId)
    .eq("role", "member");

  const joinedTrips: Trip[] = (participantRows ?? [])
    .map((row) => row.trips as unknown as Trip)
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Trips</h1>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/trips/join">Join a trip</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/trips/new">+ New trip</Link>
            </Button>
          </div>
        </div>

        {/* Trips you're hosting */}
        <section className="mb-8">
          <h2 className="mb-3 text-xs uppercase tracking-widest font-semibold text-muted-foreground">
            Your trips
          </h2>
          {ownedTrips && ownedTrips.length > 0 ? (
            <div className="grid gap-3">
              {ownedTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} isOwner />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No trips yet —{" "}
              <Link href="/trips/new" className="underline underline-offset-4">
                create your first one.
              </Link>
            </p>
          )}
        </section>

        {/* Trips you've joined */}
        {joinedTrips.length > 0 && (
          <section>
            <h2 className="mb-3 text-xs uppercase tracking-widest font-semibold text-muted-foreground">
              Joined trips
            </h2>
            <div className="grid gap-3">
              {joinedTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 flex justify-center">
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}

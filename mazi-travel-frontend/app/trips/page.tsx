import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="min-h-screen bg-muted/40 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-semibold">Trips</h1>
          <div className="flex items-center gap-2">
            <Button asChild size="sm">
              <Link href="/trips/new">+ New trip</Link>
            </Button>
            <LogoutButton />
          </div>
        </div>

        {trips && trips.length > 0 ? (
          <div className="grid gap-3">
            {trips.map((trip) => (
              <Link key={trip.id} href={`/trips/${trip.id}`}>
                <Card className="transition-colors hover:bg-accent cursor-pointer">
                  <CardContent className="px-5 py-4">
                    <div className="font-semibold">{trip.name}</div>
                    {trip.destination && (
                      <div className="mt-1 text-sm text-muted-foreground">
                        {trip.destination}
                      </div>
                    )}
                    {(trip.start_date || trip.end_date) && (
                      <div className="mt-1 text-xs text-muted-foreground">
                        {trip.start_date}{trip.end_date ? ` → ${trip.end_date}` : ""}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No trips yet.{" "}
            <Link href="/trips/new" className="underline underline-offset-4">
              Create one.
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

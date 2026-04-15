"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Trip = {
  id: string;
  name: string;
  destination: string | null;
  start_date: string | null;
  end_date: string | null;
};

export default function TripCard({
  trip,
  isOwner,
}: {
  trip: Trip;
  isOwner?: boolean;
}) {
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // prevent Link navigation
    e.stopPropagation();

    const confirmed = confirm("Are you sure you want to delete this trip?");
    if (!confirmed) return;

    const res = await fetch(`/api/trips/${trip.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete trip");
      return;
    }

    // refresh list
    router.refresh();
  };

  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="transition-colors hover:bg-accent cursor-pointer">
        <CardContent className="px-5 py-4 flex items-start justify-between gap-4">
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

          {isOwner && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              Delete
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
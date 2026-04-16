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
  image_url?: string | null;
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
      <Card className="transition-colors hover:bg-accent cursor-pointer overflow-hidden">
        {trip.image_url && (
          <div className="w-full bg-muted/40 flex items-center justify-center">
            <img
              src={trip.image_url}
              alt={trip.destination ?? "Trip image"}
              className="w-full object-cover"
              style={{ display: 'block' }}
            />
          </div>
        )}
        <CardContent className="px-5 py-4 flex flex-col gap-2">
          <div className="font-semibold text-lg">{trip.name}</div>
          {trip.destination && (
            <div className="text-sm text-muted-foreground">
              {trip.destination}
            </div>
          )}
          {(trip.start_date || trip.end_date) && (
            <div className="text-xs text-muted-foreground">
              {trip.start_date}
              {trip.end_date ? ` → ${trip.end_date}` : ""}
            </div>
          )}
          {isOwner && (
            <div className="mt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
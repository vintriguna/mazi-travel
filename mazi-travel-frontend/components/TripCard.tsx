"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, Trash2 } from "lucide-react";

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
    e.preventDefault();
    e.stopPropagation();

    const confirmed = confirm("Are you sure you want to delete this trip?");
    if (!confirmed) return;

    const res = await fetch(`/api/trips/${trip.id}`, { method: "DELETE" });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to delete trip");
      return;
    }
    router.refresh();
  };

  const dateLabel =
    trip.start_date && trip.end_date
      ? `${trip.start_date} → ${trip.end_date}`
      : trip.start_date || trip.end_date || null;

  return (
    <Link href={`/trips/${trip.id}`}>
      <div
        className="group relative overflow-hidden cursor-pointer transition-all duration-200"
        style={{
          background: "#ffffff",
          borderRadius: "1.5rem",
          boxShadow: "0px 12px 32px rgba(25, 28, 30, 0.06)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0px 20px 48px rgba(25, 28, 30, 0.12)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow =
            "0px 12px 32px rgba(25, 28, 30, 0.06)";
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        }}
      >
        {/* Hero image */}
        {trip.image_url ? (
          <div className="relative h-44 w-full overflow-hidden">
            <img
              src={trip.image_url}
              alt={trip.destination ?? "Trip image"}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        ) : (
          <div
            className="h-28 w-full"
            style={{
              background: "linear-gradient(135deg, #003D9B 0%, #0052CC 60%, #004C48 100%)",
              opacity: 0.85,
            }}
          />
        )}

        {/* Content */}
        <div className="px-5 py-4">
          <div
            className="text-lg font-bold leading-snug mb-1"
            style={{
              fontFamily: "var(--font-jakarta, system-ui)",
              color: "#191C1E",
              letterSpacing: "-0.01em",
            }}
          >
            {trip.name}
          </div>

          {trip.destination && (
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin className="h-3.5 w-3.5 text-[#434654]" />
              <span className="text-sm text-[#434654]">{trip.destination}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            {dateLabel ? (
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-[#434654]" />
                <span className="text-xs text-[#434654]">{dateLabel}</span>
              </div>
            ) : (
              <div />
            )}

            {isOwner && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

import { supabase } from "@/lib/supabase";
import { BackButton } from "@/components/BackButton";

export default async function TripDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: trip, error } = await supabase
    .from("trips")
    .select(`
      *,
      transportation_legs (*),
      housing_stays (*)
    `)
    .eq("id", id)
    .single();

  if (error || !trip) {
    return <div className="p-10 text-red-500">Trip not found</div>;
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-10 dark:bg-black">
      <BackButton />

      <h1 className="text-3xl font-semibold">{trip.name}</h1>

      <p className="text-zinc-600 mt-2">{trip.description}</p>

      <div className="mt-2 text-sm text-zinc-500">
        {trip.start_date} → {trip.end_date}
      </div>

      {/* DIETARY */}
      <div className="mt-6">
        <h2 className="font-semibold">Dietary Restrictions</h2>
        <p>{trip.dietary_restrictions || "None"}</p>
      </div>

      {/* TRANSPORT */}
      <div className="mt-6">
        <h2 className="font-semibold mb-2">Transportation</h2>

        {trip.transportation_legs?.map((leg: any) => (
          <div key={leg.id} className="p-3 border rounded-xl mb-2">
            <div>
              {leg.departure_location} → {leg.arrival_location}
            </div>
            <div className="text-sm text-zinc-500">
              {leg.transportation_type} • {leg.carrier}
            </div>
            <div className="text-sm">
              {leg.departure_date} → {leg.arrival_date}
            </div>
            <div className="text-sm">Cost: ${leg.cost}</div>
          </div>
        ))}
      </div>

      {/* HOUSING */}
      <div className="mt-6">
        <h2 className="font-semibold mb-2">Housing</h2>

        {trip.housing_stays?.map((h: any) => (
          <div key={h.id} className="p-3 border rounded-xl mb-2">
            <div className="font-semibold">{h.name}</div>
            <div className="text-sm text-zinc-500">{h.address}</div>
            <div className="text-sm">
              {h.check_in} → {h.check_out}
            </div>
            <div className="text-sm">Cost: ${h.cost}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
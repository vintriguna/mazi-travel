// app/api/trips/route.ts
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const {
    name,
    description,
    startDate,
    endDate,
    destination,
    status,
    dietaryRestrictions,
    dietaryOther,
    transportation,
    housing,
  } = body;

  try {
    /* ================= CREATE TRIP ================= */
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .insert({
        name,
        description,
        start_date: startDate,
        end_date: endDate,
        destination,
        status,
        dietary_restrictions: dietaryRestrictions,
        dietary_other: dietaryOther,
      })
      .select()
      .single();

    if (tripError) throw tripError;

    const tripId = trip.id;

    /* ================= INSERT TRANSPORT ================= */
    if (transportation?.length) {
      const transportRows = transportation.map((leg: any) => ({
        trip_id: tripId,
        transportation_type: leg.transportationType,
        carrier: leg.carrier,
        departure_location: leg.departureLocation,
        arrival_location: leg.arrivalLocation,
        departure_date: leg.departureDate,
        arrival_date: leg.arrivalDate,
        booking_ref: leg.bookingRef,
        cost: Number(leg.cost || 0),
      }));

      const { error } = await supabase
        .from("transportation_legs")
        .insert(transportRows);

      if (error) throw error;
    }

    /* ================= INSERT HOUSING ================= */
    if (housing?.length) {
      const housingRows = housing.map((h: any) => ({
        trip_id: tripId,
        name: h.name,
        address: h.address,
        check_in: h.checkIn,
        check_out: h.checkOut,
        booking_ref: h.bookingRef,
        cost: Number(h.cost || 0),
      }));

      const { error } = await supabase
        .from("housing_stays")
        .insert(housingRows);

      if (error) throw error;
    }

    return NextResponse.json({
        success: true,
        tripId: trip.id,
        });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";



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

    return NextResponse.json({ success: true, tripId });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin() {
    // Accept any username/password and navigate to the hello page.
    router.push("/hello");
    console.log("Logged in with username:", username);
    console.log("Logged in with password:", password);

  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl dark:bg-zinc-950">
        <h1 className="mb-8 text-center text-3xl font-semibold text-black dark:text-white">
          Log in
        </h1>
        <div className="space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              type="text"
              placeholder="Enter username"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Enter password"
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </label>
          <button
            type="button"
            onClick={handleLogin}
            className="w-full rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            Log in
          </button>
        </div>
      </main>
    </div>
  );
}

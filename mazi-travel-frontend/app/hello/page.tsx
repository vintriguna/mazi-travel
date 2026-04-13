"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

type TransportLeg = {
  id: string;
  transportationType: string;
  carrier: string;
  departureLocation: string;
  arrivalLocation: string;
  departureDate: string;
  arrivalDate: string;
  bookingRef: string;
  cost: string;
};

type HousingStay = {
  id: string;
  name: string;
  address: string;
  checkIn: string;
  checkOut: string;
  bookingRef: string;
  cost: string;
};

type Mode = "housing" | "transportation";

type TripData = {
  name: string;
  description: string;

  startDate: string;
  endDate: string;

  destination: string;
  status: string;

  dietaryRestrictions: string;

  mode: Mode;

  housing: HousingStay[];
  transportation: TransportLeg[];
};

/* ================= HELPERS ================= */

function createEmptyLeg(): TransportLeg {
  return {
    id: crypto.randomUUID(),
    transportationType: "",
    carrier: "",
    departureLocation: "",
    arrivalLocation: "",
    departureDate: "",
    arrivalDate: "",
    bookingRef: "",
    cost: "",
  };
}

function createEmptyHousing(): HousingStay {
  return {
    id: crypto.randomUUID(),
    name: "",
    address: "",
    checkIn: "",
    checkOut: "",
    bookingRef: "",
    cost: "",
  };
}

/* ================= INITIAL ================= */

const emptyTrip: TripData = {
  name: "",
  description: "",
  startDate: "",
  endDate: "",
  destination: "",
  status: "",

  dietaryRestrictions: "",

  mode: "transportation",

  housing: [createEmptyHousing()],
  transportation: [createEmptyLeg()],
};

/* ================= COMPONENT ================= */

export default function HelloPage() {
  const [trip, setTrip] = useState<TripData>(emptyTrip);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  function handleChange(field: keyof TripData, value: string) {
    setTrip((t) => ({ ...t, [field]: value }));
  }

  /* ================= HOUSING ================= */

  function handleHousingChange(id: string, field: keyof HousingStay, value: string) {
    setTrip((t) => ({
      ...t,
      housing: t.housing.map((h) =>
        h.id === id ? { ...h, [field]: value } : h
      ),
    }));
  }

  function addHousing() {
    setTrip((t) => ({
      ...t,
      housing: [...t.housing, createEmptyHousing()],
    }));
  }

  function removeHousing(id: string) {
    setTrip((t) => ({
      ...t,
      housing: t.housing.filter((h) => h.id !== id),
    }));
  }

  /* ================= TRANSPORT ================= */

  function handleLegChange(id: string, field: keyof TransportLeg, value: string) {
    setTrip((t) => ({
      ...t,
      transportation: t.transportation.map((leg) =>
        leg.id === id ? { ...leg, [field]: value } : leg
      ),
    }));
  }

  function addLeg() {
    setTrip((t) => ({
      ...t,
      transportation: [...t.transportation, createEmptyLeg()],
    }));
  }

  function removeLeg(id: string) {
    setTrip((t) => ({
      ...t,
      transportation: t.transportation.filter((l) => l.id !== id),
    }));
  }

  /* ================= COST ================= */

  function calculateTransportTotal() {
    return trip.transportation.reduce((sum, leg) => sum + Number(leg.cost || 0), 0);
  }

  function calculateHousingTotal() {
    return trip.housing.reduce((sum, h) => sum + Number(h.cost || 0), 0);
  }

  function calculateTotal() {
    return calculateTransportTotal() + calculateHousingTotal();
  }

  /* ================= SUBMIT ================= */

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    try {
        const res = await fetch("/api/trips", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(trip),
        });

        const data = await res.json();

        if (!res.ok) {
        throw new Error(data.error || "Failed to save trip");
        }

        console.log("Trip saved:", data.tripId);

        // go to detail page
        router.push(`/trips/${data.tripId}`);
        setSubmitted(true);
    } catch (err) {
        console.error(err);
        alert("Failed to save trip");
    }
    }

  /* ================= UI ================= */

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <main className="w-full max-w-5xl rounded-3xl bg-white p-10 shadow-lg dark:bg-zinc-950">
        <h1 className="text-4xl font-semibold mb-6">Create Trip</h1>

        <form onSubmit={handleSubmit} className="grid gap-6">
          {/* BASIC */}
          <input
            placeholder="Trip name"
            value={trip.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="input"
          />

          <textarea
            placeholder="Description"
            value={trip.description}
            onChange={(e) => handleChange("description", e.target.value)}
            className="input"
          />

          {/* TRIP DATES */}
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              type="date"
              value={trip.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
              className="input"
            />
            <input
              type="date"
              value={trip.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
              className="input"
            />
          </div>

          {/* NEW: DIETARY RESTRICTIONS */}
          <div className="card">
            <h3 className="font-semibold">Dietary restrictions</h3>
            <textarea
              placeholder="e.g. vegetarian, nut allergy, halal, gluten-free..."
              value={trip.dietaryRestrictions}
              onChange={(e) => handleChange("dietaryRestrictions", e.target.value)}
              className="input"
            />
          </div>

          {/* MODE SWITCH */}
          <div className="flex gap-4">
            <button type="button" onClick={() => handleChange("mode", "transportation")} className={trip.mode==="transportation"?"btn-active":"btn"}>
              Transportation
            </button>
            <button type="button" onClick={() => handleChange("mode", "housing")} className={trip.mode==="housing"?"btn-active":"btn"}>
              Housing
            </button>
          </div>

          {/* TRANSPORT */}
          {trip.mode === "transportation" && (
            <>
              {trip.transportation.map((leg, i) => (
                <div key={leg.id} className="card">
                  <div className="flex justify-between">
                    <strong>Leg {i + 1}</strong>
                    {trip.transportation.length > 1 && (
                      <button type="button" onClick={() => removeLeg(leg.id)}>Remove</button>
                    )}
                  </div>

                  <input placeholder="Type" value={leg.transportationType} onChange={(e)=>handleLegChange(leg.id,"transportationType",e.target.value)} className="input"/>
                  <input placeholder="Carrier" value={leg.carrier} onChange={(e)=>handleLegChange(leg.id,"carrier",e.target.value)} className="input"/>

                  <div className="grid sm:grid-cols-2 gap-2">
                    <input placeholder="From" value={leg.departureLocation} onChange={(e)=>handleLegChange(leg.id,"departureLocation",e.target.value)} className="input"/>
                    <input placeholder="To" value={leg.arrivalLocation} onChange={(e)=>handleLegChange(leg.id,"arrivalLocation",e.target.value)} className="input"/>
                  </div>

                  <input type="date" value={leg.departureDate} onChange={(e)=>handleLegChange(leg.id,"departureDate",e.target.value)} className="input"/>
                  <input type="date" value={leg.arrivalDate} onChange={(e)=>handleLegChange(leg.id,"arrivalDate",e.target.value)} className="input"/>

                  <input placeholder="Booking ref" value={leg.bookingRef} onChange={(e)=>handleLegChange(leg.id,"bookingRef",e.target.value)} className="input"/>
                  <input type="number" placeholder="Cost" value={leg.cost} onChange={(e)=>handleLegChange(leg.id,"cost",e.target.value)} className="input"/>
                </div>
              ))}

              <button type="button" onClick={addLeg} className="btn">+ Add leg</button>
            </>
          )}

          {/* HOUSING */}
          {trip.mode === "housing" && (
            <>
              {trip.housing.map((h, i) => (
                <div key={h.id} className="card">
                  <div className="flex justify-between">
                    <strong>Stay {i + 1}</strong>
                    {trip.housing.length > 1 && (
                      <button type="button" onClick={() => removeHousing(h.id)}>Remove</button>
                    )}
                  </div>

                  <input placeholder="Name" value={h.name} onChange={(e)=>handleHousingChange(h.id,"name",e.target.value)} className="input"/>
                  <input placeholder="Address" value={h.address} onChange={(e)=>handleHousingChange(h.id,"address",e.target.value)} className="input"/>

                  <div className="grid sm:grid-cols-2 gap-2">
                    <input type="date" value={h.checkIn} onChange={(e)=>handleHousingChange(h.id,"checkIn",e.target.value)} className="input"/>
                    <input type="date" value={h.checkOut} onChange={(e)=>handleHousingChange(h.id,"checkOut",e.target.value)} className="input"/>
                  </div>

                  <input placeholder="Booking ref" value={h.bookingRef} onChange={(e)=>handleHousingChange(h.id,"bookingRef",e.target.value)} className="input"/>
                  <input type="number" placeholder="Cost" value={h.cost} onChange={(e)=>handleHousingChange(h.id,"cost",e.target.value)} className="input"/>
                </div>
              ))}

              <button type="button" onClick={addHousing} className="btn">+ Add stay</button>
            </>
          )}

          {/* COST */}
          <div className="card bg-zinc-100">
            <h3 className="font-semibold">Cost estimate</h3>
            <div>Transport: ${calculateTransportTotal()}</div>
            <div>Housing: ${calculateHousingTotal()}</div>
            <div className="font-bold">Total: ${calculateTotal()}</div>
          </div>

          <button className="btn-active">Save Trip</button>
        </form>

        {submitted && <div className="mt-6">Trip saved!</div>}
      </main>

      <style jsx>{`
        .input {
          border: 1px solid #e4e4e7;
          padding: 10px;
          border-radius: 12px;
        }
        .btn {
          background: #e4e4e7;
          padding: 10px;
          border-radius: 12px;
        }
        .btn-active {
          background: black;
          color: white;
          padding: 10px;
          border-radius: 12px;
        }
        .card {
          border: 1px solid #e4e4e7;
          padding: 12px;
          border-radius: 16px;
          display: grid;
          gap: 8px;
        }
      `}</style>
    </div>
  );
}

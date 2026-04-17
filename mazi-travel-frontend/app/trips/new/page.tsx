"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, MapPin, PlaneTakeoff, Calendar, Users, Map, ArrowLeft } from "lucide-react";
import Link from "next/link";

const TRIP_TYPES = [
  { value: "vacation", label: "Vacation" },
  { value: "event_celebration", label: "Event / Celebration" },
  { value: "work_conference", label: "Work / Conference" },
];

const inputClass =
  "rounded-xl border-0 pl-10 focus-visible:ring-2 focus-visible:ring-[#003D9B] focus-visible:ring-offset-0";
const inputStyle = { background: "#F2F4F7" };

export default function NewTripPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [origin, setOrigin] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripType, setTripType] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validateDates(): boolean {
    if (startDate && endDate && endDate < startDate) {
      setDateError("End date must be on or after start date.");
      return false;
    }
    setDateError(null);
    return true;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validateDates()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          origin,
          destination,
          startDate: startDate || null,
          endDate: endDate || null,
          tripType: tripType || null,
          groupSize: groupSize ? Number(groupSize) : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save trip");
      router.push(`/trips/${data.tripId}/preferences`);
    } catch (err) {
      console.error(err);
      alert("Failed to save trip. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="px-4 py-10">
      <div className="mx-auto max-w-xl">
        {/* Back */}
        <Link
          href="/trips"
          className="mb-8 inline-flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "#434654" }}
        >
          <ArrowLeft className="h-4 w-4" />
          All trips
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-display mb-2"
            style={{ color: "#191C1E" }}
          >
            Plan Your Next<br />Adventure
          </h1>
          <p
            className="text-base"
            style={{
              color: "#434654",
              fontFamily: "var(--font-inter, system-ui)",
            }}
          >
            Turn your bucket list into a curated reality.
          </p>
        </div>

        {/* Form card */}
        <div
          style={{
            background: "#ffffff",
            borderRadius: "1.5rem",
            boxShadow: "0px 12px 32px rgba(25,28,30,0.06)",
            padding: "2rem",
          }}
        >
          <form onSubmit={handleSubmit} className="grid gap-5">
            {/* Trip name */}
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium" style={{ color: "#434654" }}>
                Trip name
              </Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C3C6D6]" />
                <Input
                  required
                  placeholder="e.g. Tokyo Spring 2025"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Origin */}
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium" style={{ color: "#434654" }}>
                Origin city
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C3C6D6]" />
                <Input
                  required
                  placeholder="e.g. Chicago, New York, London"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Destination */}
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium" style={{ color: "#434654" }}>
                Destination city
              </Label>
              <div className="relative">
                <PlaneTakeoff className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C3C6D6]" />
                <Input
                  required
                  placeholder="e.g. Tokyo, Paris, Bali"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium" style={{ color: "#434654" }}>
                Dates
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C3C6D6]" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setDateError(null); }}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C3C6D6]" />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setDateError(null); }}
                    className={inputClass}
                    style={inputStyle}
                  />
                </div>
              </div>
              {dateError && (
                <p className="text-xs text-red-500">{dateError}</p>
              )}
            </div>

            {/* Trip type */}
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium" style={{ color: "#434654" }}>
                Trip type
              </Label>
              <div className="flex gap-2">
                {TRIP_TYPES.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTripType(tripType === opt.value ? "" : opt.value)}
                    className="flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all"
                    style={
                      tripType === opt.value
                        ? {
                            background: "linear-gradient(135deg, #003D9B 0%, #0052CC 100%)",
                            color: "#ffffff",
                            boxShadow: "0px 8px 20px rgba(0,61,155,0.2)",
                          }
                        : {
                            background: "#F2F4F7",
                            color: "#434654",
                          }
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Group size */}
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium" style={{ color: "#434654" }}>
                Group size
                <span className="ml-1.5 text-xs font-normal" style={{ color: "#C3C6D6" }}>
                  (max 4)
                </span>
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C3C6D6]" />
                <Input
                  type="number"
                  min={1}
                  max={4}
                  required
                  placeholder="1–4"
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gradient mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold disabled:opacity-60"
            >
              <Map className="h-4 w-4" />
              {loading ? "Saving…" : "Create Trip"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

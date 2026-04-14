"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const TRIP_TYPES = [
  { value: "vacation", label: "Vacation" },
  { value: "event_celebration", label: "Event / celebration" },
  { value: "work_conference", label: "Work / conference" },
];

const PACE_OPTIONS = [
  { value: "relaxed", label: "Relaxed" },
  { value: "balanced", label: "Balanced" },
  { value: "packed", label: "Packed" },
];

const PRIORITY_OPTIONS = [
  "Food & dining",
  "Nightlife",
  "Outdoor activities",
  "Beach / water",
  "Museums & culture",
  "Shopping",
  "Adventure sports",
  "Relaxation & wellness",
  "Local experiences",
];

export default function NewTripPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [origin, setOrigin] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripType, setTripType] = useState("");
  const [groupSize, setGroupSize] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [tripPace, setTripPace] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);
  const [aiNotes, setAiNotes] = useState("");
  const [dateError, setDateError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function togglePriority(option: string) {
    setPriorities((prev) =>
      prev.includes(option) ? prev.filter((p) => p !== option) : [...prev, option]
    );
  }

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
          origin: origin || null,
          destination,
          startDate: startDate || null,
          endDate: endDate || null,
          tripType: tripType || null,
          groupSize: groupSize ? Number(groupSize) : null,
          totalBudget: totalBudget ? Number(totalBudget) : null,
          tripPace: tripPace || null,
          topPriorities: priorities.length ? priorities : null,
          aiNotes: aiNotes || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save trip");
      router.push(`/trips/${data.tripId}`);
    } catch (err) {
      console.error(err);
      alert("Failed to save trip. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create a trip</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-6">

            {/* Trip name */}
            <div className="grid gap-1.5">
              <Label htmlFor="name">Trip name</Label>
              <Input
                id="name"
                required
                placeholder="e.g. Tokyo Spring 2025"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Origin city */}
            <div className="grid gap-1.5">
              <Label htmlFor="origin">Origin city</Label>
              <Input
                id="origin"
                required
                placeholder="e.g. Chicago, New York, London"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>

            {/* Destination */}
            <div className="grid gap-1.5">
              <Label htmlFor="destination">Destination city</Label>
              <Input
                id="destination"
                required
                placeholder="e.g. Tokyo, Paris, Bali"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>

            {/* Dates */}
            <div className="grid gap-1.5">
              <Label>Dates</Label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setDateError(null); }}
                />
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setDateError(null); }}
                />
              </div>
              {dateError && (
                <p className="text-xs text-destructive">{dateError}</p>
              )}
            </div>

            {/* Trip type */}
            <div className="grid gap-1.5">
              <Label>Trip type</Label>
              <div className="flex rounded-lg border bg-muted p-1 gap-1">
                {TRIP_TYPES.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={tripType === opt.value ? "default" : "ghost"}
                    size="sm"
                    className="flex-1 text-xs"
                    onClick={() => setTripType(tripType === opt.value ? "" : opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Group size + Total budget */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="groupSize">Group size</Label>
                <Input
                  id="groupSize"
                  type="number"
                  min={1}
                  placeholder="e.g. 6"
                  value={groupSize}
                  onChange={(e) => setGroupSize(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="totalBudget">Total budget</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="totalBudget"
                    type="number"
                    min={0}
                    placeholder="e.g. 3000"
                    className="pl-6"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Trip pace */}
            <div className="grid gap-1.5">
              <Label>Trip pace</Label>
              <div className="flex rounded-lg border bg-muted p-1 gap-1">
                {PACE_OPTIONS.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={tripPace === opt.value ? "default" : "ghost"}
                    size="sm"
                    className="flex-1"
                    onClick={() => setTripPace(tripPace === opt.value ? "" : opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Top priorities */}
            <div className="grid gap-2">
              <Label>
                Top priorities
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  (pick up to 3)
                </span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {PRIORITY_OPTIONS.map((option) => {
                  const selected = priorities.includes(option);
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => togglePriority(option)}
                      disabled={!selected && priorities.length >= 3}
                      className={cn(
                        "rounded-full border px-3 py-1 text-sm transition-colors",
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted/50 hover:bg-muted border-border",
                        !selected && priorities.length >= 3 && "opacity-40 cursor-not-allowed"
                      )}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI notes */}
            <div className="grid gap-1.5">
              <Label htmlFor="aiNotes">
                Notes for AI
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <textarea
                id="aiNotes"
                rows={3}
                placeholder="Anything else the AI should know — dietary restrictions, accessibility needs, must-see spots…"
                value={aiNotes}
                onChange={(e) => setAiNotes(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring placeholder:text-muted-foreground"
              />
            </div>

            <Button type="submit" disabled={loading} className="mt-1 w-full">
              {loading ? "Saving…" : "Create trip"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

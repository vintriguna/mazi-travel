"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TripForm = {
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budgetRange: string;
  tripPurpose: string;
};

const empty: TripForm = {
  name: "",
  destination: "",
  startDate: "",
  endDate: "",
  budgetRange: "",
  tripPurpose: "",
};

export default function NewTripPage() {
  const [form, setForm] = useState<TripForm>(empty);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function set(field: keyof TripForm, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
          <form onSubmit={handleSubmit} className="grid gap-5">
            <div className="grid gap-1.5">
              <Label htmlFor="name">Trip name</Label>
              <Input
                id="name"
                required
                placeholder="e.g. Tokyo Spring 2025"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="destination">Destination / region</Label>
              <Input
                id="destination"
                required
                placeholder="e.g. Japan, Southeast Asia"
                value={form.destination}
                onChange={(e) => set("destination", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="startDate">Start date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="endDate">End date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label>Budget range</Label>
              <Select
                value={form.budgetRange}
                onValueChange={(v) => set("budgetRange", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="under_500">Under $500</SelectItem>
                  <SelectItem value="500_1500">$500 – $1,500</SelectItem>
                  <SelectItem value="1500_3000">$1,500 – $3,000</SelectItem>
                  <SelectItem value="3000_plus">$3,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label>Trip purpose</Label>
              <Select
                value={form.tripPurpose}
                onValueChange={(v) => set("tripPurpose", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a purpose" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leisure">Leisure</SelectItem>
                  <SelectItem value="adventure">Adventure</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={loading} className="mt-2 w-full">
              {loading ? "Saving…" : "Create trip"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

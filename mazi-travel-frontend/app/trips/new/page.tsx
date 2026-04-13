"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-10 dark:bg-black">
      <main className="w-full max-w-lg rounded-3xl bg-white p-10 shadow-xl dark:bg-zinc-950">
        <h1 className="mb-8 text-3xl font-semibold text-black dark:text-white">
          Create a trip
        </h1>

        <form onSubmit={handleSubmit} className="grid gap-5">
          <label className="block">
            <span className="label">Trip name</span>
            <input
              required
              placeholder="e.g. Tokyo Spring 2025"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="input"
            />
          </label>

          <label className="block">
            <span className="label">Destination / region</span>
            <input
              required
              placeholder="e.g. Japan, Southeast Asia"
              value={form.destination}
              onChange={(e) => set("destination", e.target.value)}
              className="input"
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="label">Start date</span>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => set("startDate", e.target.value)}
                className="input"
              />
            </label>
            <label className="block">
              <span className="label">End date</span>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => set("endDate", e.target.value)}
                className="input"
              />
            </label>
          </div>

          <label className="block">
            <span className="label">Budget range</span>
            <select
              value={form.budgetRange}
              onChange={(e) => set("budgetRange", e.target.value)}
              className="input"
            >
              <option value="">Select a range</option>
              <option value="under_500">Under $500</option>
              <option value="500_1500">$500 – $1,500</option>
              <option value="1500_3000">$1,500 – $3,000</option>
              <option value="3000_plus">$3,000+</option>
            </select>
          </label>

          <label className="block">
            <span className="label">Trip purpose</span>
            <select
              value={form.tripPurpose}
              onChange={(e) => set("tripPurpose", e.target.value)}
              className="input"
            >
              <option value="">Select a purpose</option>
              <option value="leisure">Leisure</option>
              <option value="adventure">Adventure</option>
              <option value="business">Business</option>
              <option value="other">Other</option>
            </select>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {loading ? "Saving…" : "Create trip"}
          </button>
        </form>
      </main>

      <style jsx>{`
        .label {
          display: block;
          margin-bottom: 6px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #52525b;
        }
        .input {
          width: 100%;
          border: 1px solid #e4e4e7;
          background: #fafafa;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 0.875rem;
          color: #09090b;
          outline: none;
          transition: border-color 0.15s;
        }
        .input:focus {
          border-color: #09090b;
          box-shadow: 0 0 0 2px rgba(9,9,11,0.08);
        }
      `}</style>
    </div>
  );
}

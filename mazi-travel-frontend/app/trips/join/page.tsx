"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Hash, MapPin } from "lucide-react";
import Link from "next/link";

type TripPreview = {
  id: string;
  name: string;
  destination: string;
};

type Status = "enter_code" | "loading" | "ready" | "not_found" | "joining" | "error";

function JoinTripInner() {
  const searchParams = useSearchParams();
  const urlCode = searchParams.get("code") ?? "";
  const router = useRouter();

  const [code, setCode] = useState(urlCode);
  const [trip, setTrip] = useState<TripPreview | null>(null);
  const [status, setStatus] = useState<Status>(urlCode ? "loading" : "enter_code");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!urlCode) return;
    lookUpCode(urlCode);
  }, [urlCode]);

  async function lookUpCode(c: string) {
    setStatus("loading");
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/trips/preview?code=${encodeURIComponent(c)}`);
      if (res.status === 404) { setStatus("not_found"); return; }
      const data = await res.json();
      setTrip(data);
      setStatus("ready");
    } catch {
      setStatus("not_found");
    }
  }

  function handleCodeSubmit(e: FormEvent) {
    e.preventDefault();
    if (code.trim()) lookUpCode(code.trim());
  }

  async function handleJoin() {
    setStatus("joining");
    try {
      const res = await fetch("/api/trips/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to join");
      router.push(`/trips/${data.tripId}/preferences`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  const cardStyle = {
    background: "#ffffff",
    borderRadius: "1.5rem",
    boxShadow: "0px 12px 32px rgba(25,28,30,0.06)",
    padding: "2rem",
  };

  return (
    <div className="w-full max-w-md">
      {/* Code entry */}
      {status === "enter_code" && (
        <div style={cardStyle}>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: "var(--font-jakarta, system-ui)", color: "#191C1E", letterSpacing: "-0.02em" }}
          >
            Join a Trip
          </h2>
          <p className="text-sm mb-6" style={{ color: "#434654" }}>
            Enter the invite code your trip organizer shared with you.
          </p>
          <form onSubmit={handleCodeSubmit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label className="text-sm font-medium" style={{ color: "#434654" }}>
                Invite code
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C3C6D6]" />
                <Input
                  placeholder="e.g. a1b2c3d4"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoComplete="off"
                  autoFocus
                  className="rounded-xl border-0 pl-10 focus-visible:ring-2 focus-visible:ring-[#003D9B] focus-visible:ring-offset-0"
                  style={{ background: "#F2F4F7" }}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!code.trim()}
              className="btn-gradient w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-50"
            >
              Look up trip
            </button>
          </form>
        </div>
      )}

      {/* Loading */}
      {status === "loading" && (
        <div style={cardStyle} className="flex items-center justify-center py-16">
          <p className="text-sm" style={{ color: "#434654" }}>Looking up invite…</p>
        </div>
      )}

      {/* Not found */}
      {status === "not_found" && (
        <div style={cardStyle}>
          <h2
            className="text-2xl font-bold mb-2"
            style={{ fontFamily: "var(--font-jakarta, system-ui)", color: "#191C1E", letterSpacing: "-0.02em" }}
          >
            Code not found
          </h2>
          <p className="text-sm mb-6" style={{ color: "#434654" }}>
            That invite code is invalid. Double-check and try again.
          </p>
          <div className="grid gap-3">
            <button
              onClick={() => { setCode(""); setStatus("enter_code"); }}
              className="w-full rounded-xl py-2.5 text-sm font-semibold transition-colors"
              style={{ background: "#F2F4F7", color: "#191C1E" }}
            >
              Try a different code
            </button>
            <button
              onClick={() => router.push("/trips")}
              className="w-full rounded-xl py-2.5 text-sm font-medium transition-colors"
              style={{ color: "#434654" }}
            >
              Back to my trips
            </button>
          </div>
        </div>
      )}

      {/* Confirmation */}
      {(status === "ready" || status === "joining" || status === "error") && trip && (
        <div style={cardStyle}>
          <h2
            className="text-2xl font-bold mb-6"
            style={{ fontFamily: "var(--font-jakarta, system-ui)", color: "#191C1E", letterSpacing: "-0.02em" }}
          >
            You&apos;re invited!
          </h2>

          {/* Trip preview */}
          <div
            className="rounded-xl p-4 mb-6 flex items-start gap-3"
            style={{ background: "#F2F4F7" }}
          >
            <MapPin className="h-5 w-5 text-[#003D9B] mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold" style={{ color: "#191C1E" }}>{trip.name}</p>
              {trip.destination && (
                <p className="text-sm mt-0.5" style={{ color: "#434654" }}>{trip.destination}</p>
              )}
            </div>
          </div>

          {status === "error" && (
            <p className="text-sm text-red-500 mb-4">{errorMsg}</p>
          )}

          <div className="grid gap-3">
            <button
              onClick={handleJoin}
              disabled={status === "joining"}
              className="btn-gradient w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60"
            >
              {status === "joining" ? "Joining…" : "Join trip"}
            </button>
            <button
              onClick={() => { setCode(""); setTrip(null); setStatus("enter_code"); }}
              className="w-full rounded-xl py-2.5 text-sm font-medium transition-colors"
              style={{ color: "#434654" }}
            >
              Use a different code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function JoinTripPage() {
  return (
    <div className="px-4 py-10">
      <div className="mx-auto max-w-xl">
        <Link
          href="/trips"
          className="mb-8 inline-flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: "#434654" }}
        >
          <ArrowLeft className="h-4 w-4" />
          All trips
        </Link>
        <div className="flex justify-center">
          <Suspense
            fallback={
              <div
                className="w-full max-w-md flex items-center justify-center py-16"
                style={{
                  background: "#ffffff",
                  borderRadius: "1.5rem",
                  boxShadow: "0px 12px 32px rgba(25,28,30,0.06)",
                }}
              >
                <p className="text-sm" style={{ color: "#434654" }}>Loading…</p>
              </div>
            }
          >
            <JoinTripInner />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

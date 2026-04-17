"use client";

import { FormEvent, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

  // Auto-look up when code comes from the URL
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

  return (
    <Card className="w-full max-w-md">
      {/* Code entry form — shown when no URL code */}
      {status === "enter_code" && (
        <>
          <CardHeader>
            <CardTitle>Join a trip</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCodeSubmit} className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="code">Invite code</Label>
                <Input
                  id="code"
                  placeholder="e.g. a1b2c3d4"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoComplete="off"
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={!code.trim()} className="w-full">
                Look up trip
              </Button>
            </form>
          </CardContent>
        </>
      )}

      {/* Loading */}
      {status === "loading" && (
        <CardContent className="py-10 text-center text-muted-foreground">
          Looking up invite…
        </CardContent>
      )}

      {/* Not found — with option to try again */}
      {status === "not_found" && (
        <>
          <CardHeader>
            <CardTitle>Code not found</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <p className="text-sm text-muted-foreground">
              That invite code is invalid. Double-check the code and try again.
            </p>
            <Button variant="outline" onClick={() => { setCode(""); setStatus("enter_code"); }}>
              Try a different code
            </Button>
            <Button variant="ghost" onClick={() => router.push("/trips")}>
              Back to my trips
            </Button>
          </CardContent>
        </>
      )}

      {/* Confirmation */}
      {(status === "ready" || status === "joining" || status === "error") && trip && (
        <>
          <CardHeader>
            <CardTitle>You&apos;re invited</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="rounded-xl border bg-muted/50 px-4 py-4">
              <p className="font-semibold">{trip.name}</p>
              {trip.destination && (
                <p className="mt-0.5 text-sm text-muted-foreground">{trip.destination}</p>
              )}
            </div>

            {status === "error" && (
              <p className="text-sm text-destructive">{errorMsg}</p>
            )}
            <Button onClick={handleJoin} disabled={status === "joining"} className="w-full">
              {status === "joining" ? "Joining…" : "Join trip"}
            </Button>
            <Button variant="ghost" onClick={() => { setCode(""); setTrip(null); setStatus("enter_code"); }}>
              Use a different code
            </Button>
          </CardContent>
        </>
      )}
    </Card>
  );
}

export default function JoinTripPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardContent className="py-10 text-center text-muted-foreground">
              Loading…
            </CardContent>
          </Card>
        }
      >
        <JoinTripInner />
      </Suspense>
    </div>
  );
}

"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Compass } from "lucide-react";

type Mode = "signin" | "signup";

function LoginForm() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmationError = searchParams.get("error");

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
    setMessage(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push("/trips");
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        router.push("/trips");
      }
    }
  }

  return (
    <div
      className="w-full max-w-md"
      style={{
        background: "#ffffff",
        borderRadius: "1.5rem",
        boxShadow: "0px 12px 32px rgba(25, 28, 30, 0.06)",
        padding: "2.5rem",
      }}
    >
      {/* Mode toggle */}
      <div
        className="flex rounded-xl p-1 gap-1 mb-6"
        style={{ background: "#F2F4F7" }}
      >
        <button
          type="button"
          onClick={() => switchMode("signin")}
          className="flex-1 rounded-lg py-2 text-sm font-semibold transition-all"
          style={
            mode === "signin"
              ? {
                  background: "#ffffff",
                  color: "#003D9B",
                  boxShadow: "0px 2px 8px rgba(25,28,30,0.08)",
                }
              : { color: "#434654" }
          }
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => switchMode("signup")}
          className="flex-1 rounded-lg py-2 text-sm font-semibold transition-all"
          style={
            mode === "signup"
              ? {
                  background: "#ffffff",
                  color: "#003D9B",
                  boxShadow: "0px 2px 8px rgba(25,28,30,0.08)",
                }
              : { color: "#434654" }
          }
        >
          Sign up
        </button>
      </div>

      <h2
        className="mb-6 text-2xl font-bold"
        style={{
          fontFamily: "var(--font-jakarta, system-ui)",
          color: "#191C1E",
          letterSpacing: "-0.02em",
        }}
      >
        {mode === "signin" ? "Welcome back" : "Create an account"}
      </h2>

      {confirmationError === "confirmation_failed" && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>Email confirmation failed. Please try again.</AlertDescription>
        </Alert>
      )}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {message && (
        <Alert className="mb-4">
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-1.5">
          <Label
            htmlFor="email"
            className="text-sm font-medium"
            style={{ color: "#434654" }}
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border-0 focus-visible:ring-2 focus-visible:ring-[#003D9B] focus-visible:ring-offset-0"
            style={{ background: "#F2F4F7" }}
          />
        </div>

        <div className="grid gap-1.5">
          <Label
            htmlFor="password"
            className="text-sm font-medium"
            style={{ color: "#434654" }}
          >
            Password
          </Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border-0 focus-visible:ring-2 focus-visible:ring-[#003D9B] focus-visible:ring-offset-0"
            style={{ background: "#F2F4F7" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gradient mt-2 w-full rounded-xl py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {loading
            ? mode === "signin"
              ? "Signing in…"
              : "Creating account…"
            : mode === "signin"
            ? "Sign in"
            : "Sign up"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      {/* Brand */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-[#003D9B]">
          <Compass className="h-8 w-8" />
          <span
            className="text-3xl font-bold"
            style={{ fontFamily: "var(--font-jakarta, system-ui)", letterSpacing: "-0.02em" }}
          >
            Mazi
          </span>
        </div>
        <p
          className="text-sm text-center max-w-xs"
          style={{ color: "#434654", fontFamily: "var(--font-inter, system-ui)" }}
        >
          Plan trips together, without the chaos.
        </p>
      </div>

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
            <p className="text-sm text-[#434654]">Loading…</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
    <Card className="w-full max-w-md">
      <CardHeader className="pb-2">
        {/* Mode toggle */}
        <div className="flex rounded-lg border bg-muted p-1 gap-1">
          <Button
            type="button"
            variant={mode === "signin" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => switchMode("signin")}
          >
            Sign in
          </Button>
          <Button
            type="button"
            variant={mode === "signup" ? "default" : "ghost"}
            size="sm"
            className="flex-1"
            onClick={() => switchMode("signup")}
          >
            Sign up
          </Button>
        </div>
        <CardTitle className="pt-4 text-2xl">
          {mode === "signin" ? "Welcome back" : "Create an account"}
        </CardTitle>
      </CardHeader>

      <CardContent className="grid gap-4">
        {confirmationError === "confirmation_failed" && (
          <Alert variant="destructive">
            <AlertDescription>
              Email confirmation failed. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid gap-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full mt-2">
            {loading
              ? mode === "signin" ? "Signing in…" : "Creating account…"
              : mode === "signin" ? "Sign in" : "Sign up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-muted/40 px-4">
      <div className="text-center">
        <p className="text-4xl font-bold tracking-tight text-primary">Mazi</p>
        <p className="mt-1 text-sm text-muted-foreground">Plan trips together, without the chaos.</p>
      </div>
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardContent className="py-10 text-center text-muted-foreground">Loading…</CardContent>
        </Card>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}

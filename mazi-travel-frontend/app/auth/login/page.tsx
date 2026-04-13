"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "signin" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();
  const confirmationError = searchParams.get("error");

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
        setMessage("Check your email to confirm your account, then sign in.");
        setLoading(false);
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <main className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl dark:bg-zinc-950">
        {/* Mode toggle */}
        <div className="mb-8 flex rounded-2xl border border-zinc-200 p-1 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => { setMode("signin"); setError(null); setMessage(null); }}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
              mode === "signin"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => { setMode("signup"); setError(null); setMessage(null); }}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition ${
              mode === "signup"
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-zinc-500 hover:text-black dark:hover:text-white"
            }`}
          >
            Sign up
          </button>
        </div>

        <h1 className="mb-6 text-2xl font-semibold text-black dark:text-white">
          {mode === "signin" ? "Welcome back" : "Create an account"}
        </h1>

        {confirmationError === "confirmation_failed" && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Email confirmation failed. Please try again.
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {message && (
          <p className="mb-4 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-600 dark:text-zinc-400">
              Password
            </span>
            <input
              type="password"
              required
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-black outline-none transition focus:border-black focus:ring-2 focus:ring-black/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-2xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black"
          >
            {loading
              ? mode === "signin" ? "Signing in…" : "Creating account…"
              : mode === "signin" ? "Sign in" : "Sign up"}
          </button>
        </form>
      </main>
    </div>
  );
}

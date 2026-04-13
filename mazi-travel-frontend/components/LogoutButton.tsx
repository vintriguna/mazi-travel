"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-400 hover:text-black dark:border-zinc-700 dark:text-zinc-400 dark:hover:text-white"
    >
      Sign out
    </button>
  );
}

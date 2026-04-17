"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Plus, Compass } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  const linkClass = (href: string) =>
    `text-sm font-medium transition-colors ${
      pathname === href
        ? "text-[#003D9B]"
        : "text-[#434654] hover:text-[#191C1E]"
    }`;

  return (
    <nav
      className="glass-nav sticky top-0 z-50 w-full"
      style={{ boxShadow: "0px 1px 0px rgba(195,198,214,0.3)" }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link
          href="/trips"
          className="flex items-center gap-2 text-[#003D9B] font-bold text-xl"
          style={{ fontFamily: "var(--font-jakarta, system-ui)" }}
        >
          <Compass className="h-5 w-5" />
          Mazi
        </Link>

        {/* Center nav links */}
        <div className="hidden sm:flex items-center gap-6">
          <Link href="/trips" className={linkClass("/trips")}>
            My Trips
          </Link>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/trips/join"
            className="text-sm font-medium text-[#434654] hover:text-[#191C1E] transition-colors"
          >
            Join a trip
          </Link>
          <Link
            href="/trips/new"
            className="btn-gradient flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            New Trip
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-[#434654] hover:text-[#191C1E] transition-colors ml-1"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

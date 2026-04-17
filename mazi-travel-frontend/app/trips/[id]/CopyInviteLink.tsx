"use client";

import { useState } from "react";
import { Copy, Check, Link } from "lucide-react";

type Copied = "code" | "link" | null;

export default function CopyInviteLink({ code, link }: { code: string; link: string }) {
  const [copied, setCopied] = useState<Copied>(null);

  async function copy(text: string, which: Copied) {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div
      className="rounded-[1.25rem] p-5 grid gap-4"
      style={{ background: "#F2F4F7" }}
    >
      {/* Invite code */}
      <div className="flex items-center justify-between gap-4">
        <span
          className="font-mono text-2xl font-bold tracking-widest"
          style={{ color: "#003D9B" }}
        >
          {code}
        </span>
        <button
          onClick={() => copy(code, "code")}
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
          style={
            copied === "code"
              ? { background: "#004C48", color: "#5DE7DE" }
              : { background: "#ffffff", color: "#434654", boxShadow: "0px 2px 8px rgba(25,28,30,0.08)" }
          }
        >
          {copied === "code" ? (
            <><Check className="h-3.5 w-3.5" />Copied!</>
          ) : (
            <><Copy className="h-3.5 w-3.5" />Copy code</>
          )}
        </button>
      </div>

      {/* Full link */}
      <div
        className="flex items-center justify-between gap-4 pt-3"
        style={{ borderTop: "1px solid rgba(195,198,214,0.3)" }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Link className="h-3.5 w-3.5 shrink-0 text-[#C3C6D6]" />
          <span className="font-mono text-xs truncate" style={{ color: "#434654" }}>
            {link}
          </span>
        </div>
        <button
          onClick={() => copy(link, "link")}
          className="shrink-0 text-xs font-medium transition-colors"
          style={{ color: copied === "link" ? "#004C48" : "#434654" }}
        >
          {copied === "link" ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}

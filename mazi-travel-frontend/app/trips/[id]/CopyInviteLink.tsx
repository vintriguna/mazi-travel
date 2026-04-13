"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Copied = "code" | "link" | null;

export default function CopyInviteLink({ code, link }: { code: string; link: string }) {
  const [copied, setCopied] = useState<Copied>(null);

  async function copy(text: string, which: Copied) {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="rounded-xl border bg-muted/50 px-5 py-4 grid gap-3">
      {/* Code — prominent */}
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-2xl font-semibold tracking-widest">{code}</span>
        <Button variant="outline" size="sm" onClick={() => copy(code, "code")} className="shrink-0">
          {copied === "code" ? "Copied!" : "Copy code"}
        </Button>
      </div>

      {/* Full link — secondary */}
      <div className="flex items-center justify-between gap-4 border-t pt-3">
        <span className="font-mono text-xs text-muted-foreground truncate">{link}</span>
        <Button variant="ghost" size="sm" onClick={() => copy(link, "link")} className="shrink-0">
          {copied === "link" ? "Copied!" : "Copy link"}
        </Button>
      </div>
    </div>
  );
}

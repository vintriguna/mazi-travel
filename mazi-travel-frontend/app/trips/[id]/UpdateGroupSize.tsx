"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UpdateGroupSize({
  tripId,
  currentSize,
}: {
  tripId: string;
  currentSize: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(currentSize));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupSize: Number(value) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setLoading(false);
    }
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="ml-1.5 text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
      >
        Edit
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 ml-2">
      <Input
        type="number"
        min={1}
        max={4}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-6 w-14 text-xs px-2"
      />
      <Button size="sm" className="h-6 text-xs px-2" onClick={handleSave} disabled={loading}>
        Save
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-6 text-xs px-2"
        onClick={() => { setEditing(false); setValue(String(currentSize)); setError(null); }}
        disabled={loading}
      >
        Cancel
      </Button>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </span>
  );
}

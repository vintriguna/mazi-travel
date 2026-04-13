"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="mb-4 -ml-2"
      onClick={() => router.push("/trips")}
    >
      <ChevronLeft className="mr-1 h-4 w-4" />
      Back to Trips
    </Button>
  );
}

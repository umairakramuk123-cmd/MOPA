"use client";

import { useEffect } from "react";
import { Button, Card } from "@/components/ui/primitives";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function PortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production this would be forwarded to the NITB monitoring endpoint.
    console.error("Portal error:", error);
  }, [error]);

  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-[14px] bg-danger-soft text-danger">
        <AlertTriangle size={20} />
      </span>
      <p className="eyebrow mt-4">Something went wrong</p>
      <h1 className="mt-1.5 text-[20px] font-semibold tracking-[-0.03em] text-ink">
        This view failed to load
      </h1>
      <p className="mx-auto mt-2 max-w-sm text-[12px] leading-5 text-muted">
        The record was not changed. Retry the view — if the problem persists, quote reference{" "}
        <span className="font-mono text-ink">{error.digest ?? "MOPA-UI-500"}</span> to the NITB service
        desk.
      </p>
      <Button variant="primary" size="md" className="mt-5" onClick={reset}>
        <RotateCcw size={13} /> Try again
      </Button>
    </Card>
  );
}

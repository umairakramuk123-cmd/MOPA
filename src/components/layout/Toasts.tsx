"use client";

import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";

export function Toasts() {
  const { toasts, dismissToast } = useStore();

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[calc(100vw-32px)] max-w-[356px] flex-col gap-2"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => {
        const tone = t.tone ?? "default";
        const Icon =
          tone === "success" ? CheckCircle2 : tone === "danger" ? XCircle : tone === "warning" ? AlertTriangle : Info;
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto animate-rise overflow-hidden rounded-[13px] border bg-surface shadow-[var(--shadow-pop)]",
              tone === "success"
                ? "border-success/25"
                : tone === "danger"
                  ? "border-danger/25"
                  : tone === "warning"
                    ? "border-warning/25"
                    : "border-line",
            )}
            role="status"
          >
            <div className="flex gap-2.5 p-3">
              <Icon
                size={16}
                className={cn(
                  "mt-0.5 shrink-0",
                  tone === "success"
                    ? "text-success"
                    : tone === "danger"
                      ? "text-danger"
                      : tone === "warning"
                        ? "text-warning"
                        : "text-info",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-semibold text-ink">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-[10.5px] leading-[1.5] text-muted">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                className="grid h-5 w-5 shrink-0 place-items-center rounded text-faint hover:bg-surface-3 hover:text-ink"
                aria-label="Dismiss"
              >
                <X size={12} />
              </button>
            </div>
            <div className="h-0.5 w-full bg-surface-3">
              <div
                className={cn(
                  "h-full",
                  tone === "success"
                    ? "bg-success"
                    : tone === "danger"
                      ? "bg-danger"
                      : tone === "warning"
                        ? "bg-warning"
                        : "bg-info",
                )}
                style={{ animation: "shrink-bar 5.2s linear forwards" }}
              />
            </div>
          </div>
        );
      })}
      <style>{`@keyframes shrink-bar { from { width: 100% } to { width: 0% } }`}</style>
    </div>
  );
}

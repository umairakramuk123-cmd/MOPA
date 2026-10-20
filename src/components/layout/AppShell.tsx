"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { CommandPalette } from "./CommandPalette";
import { Toasts } from "./Toasts";
import { Button } from "@/components/ui/primitives";
import { TimerReset, Lock } from "lucide-react";

function IdleBanner() {
  const { idleWarning, extendSession, signOut } = useStore();
  if (!idleWarning) return null;
  return (
    <div className="fixed bottom-4 left-1/2 z-[75] w-[calc(100vw-32px)] max-w-[440px] -translate-x-1/2 animate-rise rounded-[14px] border border-warning/30 bg-surface p-3 shadow-[var(--shadow-pop)]">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-warning-soft text-warning">
          <TimerReset size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold text-ink">Still there?</p>
          <p className="mt-0.5 text-[10.5px] leading-[1.5] text-muted">
            For security, you will be signed out after 15 minutes of inactivity.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <Button size="sm" variant="primary" onClick={extendSession}>
            Stay signed in
          </Button>
          <Button size="sm" variant="ghost" onClick={() => signOut("Signed out for security.")} aria-label="Sign out">
            <Lock size={12} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { collapsed } = useStore();
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-canvas">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-lg focus:bg-brand focus:px-3 focus:py-2 focus:text-[12px] focus:font-semibold focus:text-white dark:focus:text-[#04140f]"
      >
        Skip to main content
      </a>
      <div className="no-print">
        <Sidebar />
      </div>
      <div
        className={cn(
          "app-shell flex min-h-dvh flex-col transition-[padding] duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[268px]",
        )}
      >
        <Topbar />
        <main
          id="main-content"
          key={pathname}
          className="flex-1 animate-rise px-4 py-5 lg:px-7 lg:py-6"
        >
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
        <footer className="shrink-0 border-t border-line px-4 py-4 lg:px-7">
          <div className="mx-auto flex w-full max-w-[1440px] flex-col items-start justify-between gap-2 text-[10px] text-faint sm:flex-row sm:items-center">
            <p>
              © 2026 Ministry of Parliamentary Affairs · Legislative Monitoring Dashboard{" "}
              <span className="text-line-strong">|</span> Implemented by NITB
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> All systems operational
              </span>
              <span className="font-mono">v1.2.0</span>
              <span className="hidden sm:inline">Data classification: Restricted</span>
            </div>
          </div>
        </footer>
      </div>
      <IdleBanner />
      <CommandPalette />
      <Toasts />
    </div>
  );
}

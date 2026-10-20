import Link from "next/link";
import { Logo } from "@/components/ui/primitives";

export default function NotFound() {
  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-canvas px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--brand-soft),transparent_68%)]" />
        <div className="grid-lines absolute inset-0 opacity-40" />
      </div>
      <div className="relative w-full max-w-md text-center">
        <Logo size={44} className="mx-auto" />
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-faint">
          Error 404 · Record not found
        </p>
        <h1 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.04em] text-ink">
          This page is not in the registry
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-5 text-muted">
          The link may be outdated, or the record was merged after duplicate detection. Try the bill
          registry or return to your dashboard.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href="/dashboard"
            className="pressable inline-flex h-10 items-center rounded-[10px] bg-brand px-4 text-[12.5px] font-semibold text-white dark:text-[#04140f]"
          >
            Back to dashboard
          </Link>
          <Link
            href="/bills"
            className="pressable inline-flex h-10 items-center rounded-[10px] border border-line-strong bg-surface px-4 text-[12.5px] font-medium text-ink"
          >
            Browse bills
          </Link>
        </div>
        <p className="mt-8 text-[9px] text-faint">
          Ministry of Parliamentary Affairs · Legislative Monitoring Dashboard · NITB
        </p>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { cn } from "@/lib/format";
import { Card, Delta, Gauge, Progress, Sparkline } from "@/components/ui/primitives";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, Info } from "lucide-react";

type Accent = "brand" | "blue" | "gold" | "violet" | "danger" | "neutral";

const accentMap: Record<Accent, { bg: string; text: string; ring: string }> = {
  brand: { bg: "bg-brand-soft", text: "text-brand-ink", ring: "ring-brand/10" },
  blue: { bg: "bg-info-soft", text: "text-info", ring: "ring-info/10" },
  gold: { bg: "bg-gold-soft", text: "text-gold", ring: "ring-gold/10" },
  violet: { bg: "bg-violet-soft", text: "text-violet", ring: "ring-violet/10" },
  danger: { bg: "bg-danger-soft", text: "text-danger", ring: "ring-danger/10" },
  neutral: { bg: "bg-surface-3", text: "text-ink-2", ring: "ring-line" },
};

export function KpiCard({
  label,
  value,
  unit,
  delta,
  deltaSuffix,
  invertDelta,
  icon: Icon,
  accent = "brand",
  spark,
  sparkColor,
  footer,
  hint,
  progress,
  className,
  onClick,
}: {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaSuffix?: string;
  invertDelta?: boolean;
  icon?: LucideIcon;
  accent?: Accent;
  spark?: number[];
  sparkColor?: string;
  footer?: React.ReactNode;
  hint?: string;
  progress?: { value: number; tone?: "brand" | "success" | "warning" | "danger" | "info" };
  className?: string;
  onClick?: () => void;
}) {
  const style = accentMap[accent];
  return (
    <Card
      hover={!!onClick}
      onClick={onClick}
      className={cn("group relative overflow-hidden p-4", onClick && "cursor-pointer", className)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && (
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-[9px] ring-1 ring-inset transition-transform duration-300 group-hover:scale-105",
                style.bg,
                style.text,
                style.ring,
              )}
            >
              <Icon size={15} strokeWidth={1.9} />
            </span>
          )}
          <p className="truncate text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted">
            {label}
          </p>
          {hint && (
            <span className="group/hint relative hidden shrink-0 sm:inline-flex" aria-label={hint}>
              <Info size={11} className="text-faint" />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden w-[190px] -translate-x-1/2 rounded-lg border border-line bg-surface p-2 text-[10px] font-normal leading-snug text-muted shadow-[var(--shadow-pop)] group-hover/hint:block">
                {hint}
              </span>
            </span>
          )}
        </div>
        {spark && (
          <div className="shrink-0 opacity-80">
            <Sparkline data={spark} color={sparkColor ?? "var(--chart-1)"} width={62} height={24} id={`k-${label.replace(/\W/g, "")}`} />
          </div>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-baseline gap-1">
            <span className="num text-[30px] font-semibold leading-none tracking-[-0.055em] text-ink">
              {value}
            </span>
            {unit && <span className="text-[11px] font-medium text-muted">{unit}</span>}
          </p>
          {progress ? (
            <div className="mt-2.5 w-full max-w-[150px]">
              <Progress value={progress.value} tone={progress.tone ?? "brand"} height={5} />
            </div>
          ) : (
            delta !== undefined && (
              <div className="mt-2">
                <Delta value={delta} suffix={deltaSuffix ?? "vs last month"} invert={invertDelta} />
              </div>
            )
          )}
        </div>
      </div>

      {footer && <div className="mt-3 border-t border-line pt-2.5">{footer}</div>}

      <span className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-gradient-to-br from-brand/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </Card>
  );
}

/* ---------------------------- Spotlight metric ---------------------------- */
export function SpotlightMetric({
  eyebrow,
  title,
  value,
  caption,
  gauge,
  tone = "var(--brand)",
  action,
}: {
  eyebrow: string;
  title: string;
  value: string;
  caption: string;
  gauge: number;
  tone?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="texture relative overflow-hidden p-5">
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full opacity-[0.09] blur-2xl"
        style={{ background: tone }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">{eyebrow}</p>
          <h3 className="mt-2 max-w-[22ch] text-[17px] font-semibold leading-tight tracking-[-0.03em] text-ink">
            {title}
          </h3>
          <p className="mt-3 num text-[36px] font-semibold leading-none tracking-[-0.06em] text-ink">{value}</p>
          <p className="mt-2 max-w-[30ch] text-[11px] leading-[1.55] text-muted">{caption}</p>
          {action && <div className="mt-4">{action}</div>}
        </div>
        <div className="shrink-0">
          <Gauge value={gauge} size={86} label="health" tone={tone} />
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------- Stat strip ------------------------------- */
export function StatStrip({
  items,
  className,
}: {
  items: { label: string; value: string | number; tone?: string; hint?: string }[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-px overflow-hidden rounded-[14px] border border-line bg-line sm:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="bg-surface px-4 py-3">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-faint">{item.label}</p>
          <p className="mt-1 flex items-baseline gap-1.5">
            <span
              className="num text-[19px] font-semibold tracking-[-0.04em]"
              style={{ color: item.tone ?? "var(--ink)" }}
            >
              {item.value}
            </span>
            {item.hint && <span className="text-[10px] text-faint">{item.hint}</span>}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------- Insight row ------------------------------ */
export function InsightCard({
  icon: Icon,
  title,
  description,
  action,
  tone = "brand",
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; href?: string; onClick?: () => void };
  tone?: Accent;
}) {
  const style = accentMap[tone];
  return (
    <div className="flex items-start gap-3 rounded-[12px] border border-line bg-surface-2 p-3">
      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-[8px]", style.bg, style.text)}>
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-[10.5px] leading-[1.5] text-muted">{description}</p>
      </div>
      {action && (
        <a
          href={action.href ?? "#"}
          onClick={action.onClick}
          className="mt-0.5 flex shrink-0 items-center gap-0.5 text-[10.5px] font-medium text-brand hover:underline"
        >
          {action.label} <ArrowUpRight size={11} />
        </a>
      )}
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { cn, daysBetween, deadlineLabel, formatDateShort, SYSTEM_DATE } from "@/lib/format";
import { ministryShort } from "@/lib/data";
import { OUTCOME_META, STAGE_LIBRARY, TYPE_LABEL, stagesFor } from "@/lib/workflows";
import { Bill, Priority } from "@/lib/types";
import { Badge, type Tone } from "./primitives";
import { AlertTriangle, ChevronRight, Clock3, Minus, TrendingUp } from "lucide-react";

/* -------------------------------- Type chip ------------------------------- */
export function TypeChip({ type, className }: { type: Bill["type"]; className?: string }) {
  const map: Record<Bill["type"], { tone: Tone; short: string }> = {
    official: { tone: "brand", short: "Official" },
    private: { tone: "gold", short: "Private" },
    joint: { tone: "violet", short: "Joint" },
  };
  return (
    <Badge tone={map[type].tone} size="xs" className={className}>
      {map[type].short}
    </Badge>
  );
}

/* ------------------------------ House chip -------------------------------- */
export function HouseChip({ house }: { house: Bill["house"] }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10.5px] text-muted">
      <span
        className={cn(
          "grid h-4 w-4 place-items-center rounded-[3px] border font-mono text-[7.5px] font-bold",
          house === "NA"
            ? "border-chart-1/25 bg-chart-1/10 text-chart-1"
            : house === "Senate"
              ? "border-chart-4/25 bg-chart-4/10 text-chart-4"
              : "border-chart-5/25 bg-chart-5/10 text-chart-5",
        )}
      >
        {house === "NA" ? "NA" : house === "Senate" ? "S" : "JS"}
      </span>
      {house === "NA" ? "National Assembly" : house === "Senate" ? "Senate" : "Joint Sitting"}
    </span>
  );
}

/* ------------------------------- Priority -------------------------------- */
export function PriorityMark({ priority }: { priority: Priority }) {
  if (priority === "high")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-danger">
        <TrendingUp size={11} /> High
      </span>
    );
  if (priority === "low")
    return (
      <span className="inline-flex items-center gap-1 text-[10px] text-faint">
        <Minus size={11} /> Low
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-muted">
      <Clock3 size={11} /> Normal
    </span>
  );
}

/* ------------------------------- Deadline -------------------------------- */
export function DeadlineChip({
  dueAt,
  compact,
}: {
  dueAt?: string;
  compact?: boolean;
}) {
  if (!dueAt) return <span className="text-[10.5px] text-faint">—</span>;
  const delta = daysBetween(SYSTEM_DATE, dueAt);
  const tone: Tone = delta < 0 ? "danger" : delta <= 7 ? "warning" : "success";
  if (compact) {
    return (
      <Badge tone={tone} size="xs">
        {deadlineLabel(dueAt)}
      </Badge>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-0.5 text-[10.5px] font-medium",
        delta < 0
          ? "border-danger/20 bg-danger-soft text-danger"
          : delta <= 7
            ? "border-warning/20 bg-warning-soft text-warning"
            : "border-success/20 bg-success-soft text-success",
      )}
    >
      {delta < 0 ? <AlertTriangle size={11} /> : <Clock3 size={11} />}
      {deadlineLabel(dueAt)}
      <span className="font-normal opacity-60">· {formatDateShort(dueAt)}</span>
    </span>
  );
}

/* ----------------------------- Stage progress ---------------------------- */
export function StageProgress({
  bill,
  size = "sm",
  showLabel = false,
}: {
  bill: Bill;
  size?: "sm" | "md";
  showLabel?: boolean;
}) {
  const stages = stagesFor(bill.type);
  const idx = Math.max(0, stages.findIndex((s) => s.key === bill.stage));
  const progress = Math.round(((idx + 1) / stages.length) * 100);
  return (
    <div className="min-w-0">
      <div className={cn("flex items-center gap-1", size === "sm" ? "h-1.5" : "h-2")}>
        {stages.map((s, i) => (
          <span
            key={`${s.key}-${i}`}
            className={cn(
              "flex-1 rounded-full transition-colors",
              i < idx
                ? "bg-brand/45"
                : i === idx
                  ? "bg-brand"
                  : "bg-surface-3",
            )}
            title={s.label}
          />
        ))}
      </div>
      {showLabel && (
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <span className="truncate text-[10.5px] font-medium text-ink-2">
            {STAGE_LIBRARY[bill.stage]?.label ?? bill.stage}
          </span>
          <span className="num shrink-0 font-mono text-[9.5px] text-faint">
            {idx + 1}/{stages.length} · {progress}%
          </span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Stage badge ------------------------------ */
export function StageBadge({ bill }: { bill: Bill }) {
  const overdue = bill.committeeDueAt && daysBetween(SYSTEM_DATE, bill.committeeDueAt) < 0;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md border px-1.5 py-[2px] text-[10.5px] font-medium",
          overdue
            ? "border-danger/20 bg-danger-soft text-danger"
            : "border-line bg-surface-2 text-ink-2",
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", overdue ? "bg-danger" : "bg-brand")} />
        {STAGE_LIBRARY[bill.stage]?.short ?? bill.stage}
      </span>
    </span>
  );
}

/* ------------------------------- Outcome -------------------------------- */
export function OutcomeBadge({ outcome }: { outcome: Bill["outcome"] }) {
  const meta = OUTCOME_META[outcome];
  return (
    <Badge tone={meta.tone} dot size="xs">
      {meta.label}
    </Badge>
  );
}

/* ------------------------------- Age label ------------------------------- */
export function AgeLabel({ days, warn = 45 }: { days: number; warn?: number }) {
  return (
    <span
      className={cn(
        "num inline-flex items-center gap-1 font-mono text-[10.5px]",
        days > warn ? "text-warning" : "text-muted",
      )}
    >
      {days}d
    </span>
  );
}

/* -------------------------------- Bill row ------------------------------- */
export function BillRowCompact({ bill }: { bill: Bill }) {
  const stageAge = Math.max(0, daysBetween(bill.stageEnteredAt, SYSTEM_DATE));
  return (
    <Link
      href={`/bills/${bill.id}`}
      className="group relative flex items-start gap-3 border-b border-line px-4 py-3 transition-colors last:border-0 hover:bg-surface-2"
    >
      <span
        className={cn(
          "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border font-mono text-[8px] font-semibold",
          bill.type === "official"
            ? "border-brand/20 bg-brand-soft text-brand-ink"
            : bill.type === "private"
              ? "border-gold/20 bg-gold-soft text-gold"
              : "border-violet/20 bg-violet-soft text-violet",
        )}
      >
        {bill.type === "official" ? "OB" : bill.type === "private" ? "PMB" : "JS"}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <p className="line-clamp-1 text-[12px] font-medium leading-4 text-ink group-hover:text-brand-ink">
            {bill.shortTitle}
          </p>
          <ChevronRight
            size={13}
            className="mt-0.5 shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100"
          />
        </div>
        <p className="mt-0.5 truncate font-mono text-[9px] text-faint">
          {bill.id} · {ministryShort(bill.ministryId)}
        </p>
        <div className="mt-1.5 flex items-center gap-2">
          <StageBadge bill={bill} />
          <span className="text-[9.5px] text-faint">{stageAge}d at stage</span>
          <OutcomeBadge outcome={bill.outcome} />
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------- Type label ------------------------------ */
export function typeLabel(type: Bill["type"]) {
  return TYPE_LABEL[type];
}

/* -------------------------------- Progress ring -------------------------- */
export function MiniRing({ value, tone = "var(--brand)", size = 30 }: { value: number; tone?: string; size?: number }) {
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={3} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={tone}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (value / 100) * c}
      />
    </svg>
  );
}

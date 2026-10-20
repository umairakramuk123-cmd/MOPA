import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Deterministic "today" for the demo dataset (Asia/Karachi). */
export const SYSTEM_DATE = new Date("2026-10-20T11:00:00+05:00");

const DAY = 86_400_000;

export function daysBetween(a: Date | string, b: Date | string = SYSTEM_DATE): number {
  const start = typeof a === "string" ? new Date(a) : a;
  const end = typeof b === "string" ? new Date(b) : b;
  return Math.round((end.getTime() - start.getTime()) / DAY);
}

export function addDays(base: Date, days: number): Date {
  return new Date(base.getTime() + days * DAY);
}

export function formatDate(iso: string | Date, opts: Intl.DateTimeFormatOptions = {}): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Karachi",
    ...opts,
  }).format(d);
}

export function formatDateShort(iso: string | Date): string {
  return formatDate(iso, { day: "2-digit", month: "short" });
}

export function formatDateTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Karachi",
  }).format(d);
}

export function formatTime(iso: string | Date): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Karachi",
  }).format(d);
}

export function relativeTime(iso: string | Date): string {
  const diff = daysBetween(iso as string, SYSTEM_DATE);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  if (diff < 365) return `${Math.floor(diff / 30)}mo ago`;
  return `${Math.floor(diff / 365)}y ago`;
}

/** Signed deadline: negative = overdue by n days. */
export function deadlineDelta(dueIso: string): number {
  return daysBetween(SYSTEM_DATE, dueIso);
}

export function deadlineLabel(dueIso: string): string {
  const d = deadlineDelta(dueIso);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return "Due today";
  return `${d}d left`;
}

export function dueTone(dueIso: string): "danger" | "warning" | "success" {
  const d = deadlineDelta(dueIso);
  if (d < 0) return "danger";
  if (d <= 7) return "warning";
  return "success";
}

export function initials(name: string): string {
  return name
    .replace(/^(Mr\.|Ms\.|Mrs\.|Sen\.|Dr\.|Hon\.)\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

export function pct(value: number, total: number): number {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

export function compact(n: number): string {
  return new Intl.NumberFormat("en-GB", { notation: n > 9999 ? "compact" : "standard" }).format(n);
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function monthKey(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "Asia/Karachi" }).format(
    new Date(iso),
  );
}

export function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

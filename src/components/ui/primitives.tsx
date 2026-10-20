"use client";

import * as React from "react";
import { cn } from "@/lib/format";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

/* ---------------------------------- Logo --------------------------------- */
export function Logo({
  size = 34,
  className,
  tone = "brand",
}: {
  size?: number;
  className?: string;
  tone?: "brand" | "inverse";
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-[11px]",
        tone === "brand"
          ? "bg-brand text-white shadow-[0_6px_18px_-8px_rgba(11,107,79,0.7)] dark:text-[#062018]"
          : "bg-white/10 text-[#e9dfc4] ring-1 ring-white/15 backdrop-blur",
        className,
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg viewBox="0 0 32 32" width={size * 0.64} height={size * 0.64} fill="none">
        <path
          d="M5.5 26.2V15.4c0-5.8 4.7-10.5 10.5-10.5s10.5 4.7 10.5 10.5v10.8"
          stroke="currentColor"
          strokeWidth="2.1"
          strokeLinecap="round"
        />
        <path
          d="M11.6 26.2v-9.1a4.4 4.4 0 0 1 8.8 0v9.1"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          opacity="0.72"
        />
        <path d="M3 26.2h26" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" />
        <circle cx="16" cy="7.4" r="1.5" fill="currentColor" />
      </svg>
    </span>
  );
}

export function Wordmark({ compactMode = false }: { compactMode?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="flex items-baseline gap-[7px]">
        <span className="text-[17px] font-semibold tracking-[-0.03em] text-ink">MOPA</span>
        {!compactMode && (
          <span className="rounded-[4px] border border-line-strong px-1 py-px font-mono text-[8.5px] font-medium uppercase tracking-[0.14em] text-muted">
            GOP
          </span>
        )}
      </div>
      <p className="truncate text-[10px] font-medium leading-4 text-muted">
        Legislative Monitoring
      </p>
    </div>
  );
}

/* --------------------------------- Button -------------------------------- */
type ButtonVariant = "primary" | "secondary" | "ghost" | "soft" | "danger" | "gold";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-brand text-white hover:bg-brand-strong dark:text-[#04140f] shadow-[0_1px_0_rgba(255,255,255,0.14)_inset,0_8px_20px_-12px_var(--brand)]",
  secondary:
    "bg-surface text-ink border border-line-strong hover:bg-surface-3 hover:border-line-strong",
  ghost: "text-ink-2 hover:bg-surface-3 hover:text-ink",
  soft: "bg-brand-soft text-brand-ink hover:bg-brand/15",
  danger: "bg-danger-soft text-danger hover:bg-danger/15",
  gold: "bg-gold-soft text-gold hover:bg-gold/15",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[12.5px] rounded-lg gap-1.5",
  md: "h-10 px-4 text-[13px] rounded-[10px] gap-2",
  lg: "h-11 px-5 text-[13.5px] rounded-[11px] gap-2",
  icon: "h-9 w-9 rounded-[10px]",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "secondary", size = "md", loading, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "pressable inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
});

/* ---------------------------------- Badge -------------------------------- */
export type Tone = "brand" | "success" | "warning" | "danger" | "info" | "neutral" | "violet" | "gold";

const toneStyles: Record<Tone, string> = {
  brand: "bg-brand-soft text-brand-ink border-brand/15",
  success: "bg-success-soft text-success border-success/15",
  warning: "bg-warning-soft text-warning border-warning/20",
  danger: "bg-danger-soft text-danger border-danger/15",
  info: "bg-info-soft text-info border-info/15",
  neutral: "bg-surface-3 text-muted border-line",
  violet: "bg-violet-soft text-violet border-violet/15",
  gold: "bg-gold-soft text-gold border-gold/20",
};

export function Badge({
  tone = "neutral",
  children,
  dot,
  className,
  size = "sm",
}: {
  tone?: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
  size?: "xs" | "sm";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "xs" ? "px-1.5 py-[1px] text-[10px]" : "px-2 py-[2.5px] text-[11px]",
        toneStyles[tone],
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />}
      {children}
    </span>
  );
}

export function StatusDot({ tone = "success", pulse }: { tone?: Tone; pulse?: boolean }) {
  const color =
    tone === "danger" ? "bg-danger" : tone === "warning" ? "bg-warning" : tone === "info" ? "bg-info" : tone === "neutral" ? "bg-muted" : "bg-success";
  return (
    <span className="relative inline-flex h-2 w-2">
      {pulse && <span className={cn("absolute inset-0 rounded-full opacity-40", color, "animate-ping")} />}
      <span className={cn("relative h-2 w-2 rounded-full", color)} />
    </span>
  );
}

/* --------------------------------- Avatar -------------------------------- */
export function Avatar({
  name,
  initials,
  size = 32,
  tone = "brand",
  className,
  ring,
}: {
  name?: string;
  initials?: string;
  size?: number;
  tone?: Tone;
  className?: string;
  ring?: boolean;
}) {
  const text = initials ?? (name ? name.slice(0, 2).toUpperCase() : "MO");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-[-0.02em]",
        toneStyles[tone].replace("border", "").split(" ").slice(0, 2).join(" "),
        ring && "ring-2 ring-surface",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(9, size * 0.34) }}
      aria-hidden
    >
      {text}
    </span>
  );
}

/* ---------------------------------- Card --------------------------------- */
export function Card({
  className,
  children,
  hover,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { hover?: boolean }) {
  return (
    <div className={cn("card", hover && "card-hover", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className,
  icon,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  actions?: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 px-5 pt-5", className)}>
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-line bg-surface-2 text-muted">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
          <h3 className="text-[14.5px] font-semibold tracking-[-0.02em] text-ink">{title}</h3>
          {subtitle && <p className="mt-0.5 text-[12px] leading-5 text-muted">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </div>
  );
}

/* ------------------------------ Section header --------------------------- */
export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="text-[26px] font-semibold leading-[1.15] tracking-[-0.035em] text-ink sm:text-[30px]">
          {title}
        </h1>
        {description && (
          <p className="mt-1.5 max-w-2xl text-[13px] leading-5 text-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* -------------------------------- Progress ------------------------------- */
export function Progress({
  value,
  tone = "brand",
  className,
  height = 6,
}: {
  value: number;
  tone?: Tone;
  className?: string;
  height?: number;
}) {
  const bg: Record<Tone, string> = {
    brand: "bg-brand",
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
    info: "bg-info",
    neutral: "bg-muted",
    violet: "bg-violet",
    gold: "bg-gold",
  };
  return (
    <div
      className={cn("w-full overflow-hidden rounded-full bg-surface-3", className)}
      style={{ height }}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", bg[tone])}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/* --------------------------------- Delta --------------------------------- */
export function Delta({
  value,
  suffix = "vs last month",
  invert,
}: {
  value: number;
  suffix?: string;
  invert?: boolean;
}) {
  const positive = invert ? value < 0 : value > 0;
  const neutral = value === 0;
  const Icon = neutral ? Minus : value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="inline-flex items-center gap-1 text-[11px]">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-md px-1 py-0.5 font-medium",
          neutral
            ? "bg-surface-3 text-muted"
            : positive
              ? "bg-success-soft text-success"
              : "bg-danger-soft text-danger",
        )}
      >
        <Icon size={11} strokeWidth={2.4} />
        {Math.abs(value)}%
      </span>
      <span className="text-faint">{suffix}</span>
    </span>
  );
}

/* -------------------------------- Sparkline ------------------------------ */
export function Sparkline({
  data,
  color = "var(--chart-1)",
  width = 96,
  height = 32,
  fill = true,
  strokeWidth = 1.6,
  id,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  strokeWidth?: number;
  id?: string;
}) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = width / Math.max(1, data.length - 1);
  const pts = data.map((d, i) => [i * step, height - ((d - min) / range) * (height - 4) - 2]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;
  const gid = id ?? `sp-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------------------------------- Gauge -------------------------------- */
export function Gauge({
  value,
  size = 92,
  stroke = 7,
  label,
  tone = "var(--brand)",
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  tone?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.max(0, Math.min(100, value)) / 100) * c;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-[17px] font-semibold tracking-[-0.04em] text-ink">{value}%</span>
        {label && <span className="mt-0.5 text-[9px] uppercase tracking-[0.14em] text-faint">{label}</span>}
      </div>
    </div>
  );
}

/* ------------------------------- EmptyState ------------------------------ */
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-14 text-center", className)}>
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-[14px] border border-dashed border-line-strong bg-surface-2 text-muted">
          {icon}
        </div>
      )}
      <p className="text-[14px] font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[12.5px] leading-5 text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ------------------------------- Segmented ------------------------------- */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size = "sm",
  className,
}: {
  options: { value: T; label: string; icon?: React.ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[10px] border border-line bg-surface-2 p-0.5",
        className,
      )}
      role="tablist"
    >
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-[8px] font-medium transition-all duration-200",
            size === "sm" ? "h-7 px-2.5 text-[11.5px]" : "h-8 px-3 text-[12.5px]",
            o.value === value
              ? "bg-surface text-ink shadow-[0_1px_2px_rgba(10,21,18,0.08)]"
              : "text-muted hover:text-ink",
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------- KeyValue ------------------------------- */
export function KeyValue({
  label,
  value,
  className,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
  mono?: boolean;
}) {
  return (
    <div className={cn("min-w-0", className)}>
      <dt className="text-[10.5px] font-medium uppercase tracking-[0.12em] text-faint">{label}</dt>
      <dd className={cn("mt-1 truncate text-[12.5px] font-medium text-ink", mono && "font-mono text-[11.5px]")}>
        {value}
      </dd>
    </div>
  );
}

/* ---------------------------------- Tabs --------------------------------- */
export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  className,
}: {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("scroll-thin flex gap-1 overflow-x-auto border-b border-line", className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "relative shrink-0 px-3 pb-2.5 pt-2 text-[12.5px] font-medium transition-colors",
            value === t.value ? "text-ink" : "text-muted hover:text-ink-2",
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            {t.label}
            {t.count !== undefined && (
              <span
                className={cn(
                  "num rounded px-1 py-px text-[10px]",
                  value === t.value ? "bg-brand-soft text-brand-ink" : "bg-surface-3 text-muted",
                )}
              >
                {t.count}
              </span>
            )}
          </span>
          {value === t.value && <span className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-brand" />}
        </button>
      ))}
    </div>
  );
}

/* --------------------------------- Tooltip ------------------------------- */
export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-[10.5px] font-medium text-surface shadow-lg group-hover/tt:block"
      >
        {label}
      </span>
    </span>
  );
}

/* --------------------------------- Divider ------------------------------- */
export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} />;
}

/* ------------------------------- Form fields ----------------------------- */
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <span className="relative block">
      <select
        ref={ref}
        className={cn(
          "field appearance-none pr-8",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-faint"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden
      >
        <path d="M3 4.5 6 7.5 9 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
});

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn("field", className)} {...props} />;
  },
);

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn("field h-auto min-h-[88px] resize-y py-2.5 leading-relaxed", className)}
      {...props}
    />
  );
});

export function FieldLabel({
  label,
  required,
  hint,
  children,
  className,
  error,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  error?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[11px] font-medium text-ink-2">
          {label}
          {required && <span className="ml-0.5 text-danger">*</span>}
        </span>
        {hint && <span className="text-[9.5px] text-faint">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-[10px] text-danger">{error}</span>}
    </label>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      {(label || description) && (
        <div className="min-w-0">
          {label && <p className="text-[12px] font-medium text-ink">{label}</p>}
          {description && <p className="mt-0.5 text-[10.5px] leading-snug text-muted">{description}</p>}
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-[21px] w-[37px] shrink-0 items-center rounded-full border transition-colors duration-200",
          checked ? "border-brand bg-brand" : "border-line-strong bg-surface-3",
          disabled && "opacity-50",
        )}
      >
        <span
          className={cn(
            "absolute h-[15px] w-[15px] rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-[19px]" : "translate-x-[3px]",
          )}
        />
      </button>
    </div>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-3.5 w-3.5 cursor-pointer rounded border-line-strong accent-[var(--brand)]"
      />
      <span className="min-w-0">
        <span className="block text-[11.5px] font-medium text-ink">{label}</span>
        {description && <span className="mt-0.5 block text-[10px] text-muted">{description}</span>}
      </span>
    </label>
  );
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("font-mono text-[9px] uppercase tracking-[0.16em] text-faint", className)}>
      {children}
    </span>
  );
}

"use client";

import * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/format";
import { Card, CardHeader, Segmented } from "@/components/ui/primitives";
import { ArrowUpRight, Download, MoreHorizontal } from "lucide-react";

const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fill: "var(--faint)", fontSize: 10.5, fontFamily: "var(--font-mono)" },
  dy: 6,
};

/* ------------------------------ Chart frame ------------------------------ */
export function ChartFrame({
  title,
  subtitle,
  eyebrow,
  actions,
  children,
  className,
  range,
  onRange,
  ranges,
  footer,
  height = "h-[248px]",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  range?: string;
  onRange?: (v: string) => void;
  ranges?: { value: string; label: string }[];
  footer?: React.ReactNode;
  height?: string;
}) {
  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <CardHeader
        title={title}
        subtitle={subtitle}
        eyebrow={eyebrow}
        actions={
          actions ?? (
            <>
              {ranges && range && onRange && (
                <Segmented options={ranges} value={range} onChange={onRange} />
              )}
              <button
                className="pressable grid h-7 w-7 place-items-center rounded-md text-faint transition-colors hover:bg-surface-3 hover:text-ink"
                aria-label="More options"
              >
                <MoreHorizontal size={15} />
              </button>
            </>
          )
        }
      />
      <div className={cn("mt-4 w-full px-2 pb-2", height)}>{children}</div>
      {footer && <div className="mt-auto border-t border-line px-5 py-3">{footer}</div>}
    </Card>
  );
}

/* -------------------------------- Tooltip -------------------------------- */
type TipPayload = {
  name?: string;
  dataKey?: string | number;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
};

function ChartTip({
  active,
  payload,
  label,
  formatter,
  suffix = "",
}: {
  active?: boolean;
  payload?: TipPayload[];
  label?: string | number;
  formatter?: (v: number | string, key?: string) => string;
  suffix?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="pointer-events-none rounded-[11px] border border-line bg-surface/95 px-3 py-2 shadow-[var(--shadow-pop)] backdrop-blur-md">
      {label !== undefined && (
        <p className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-faint">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-5">
            <span className="flex items-center gap-1.5 text-[11.5px] text-muted">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: p.color ?? p.payload?.fill as string }} />
              {p.name}
            </span>
            <span className="num text-[11.5px] font-semibold text-ink">
              {formatter ? formatter(p.value ?? 0, String(p.dataKey)) : `${p.value}${suffix}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------ Trend chart ------------------------------ */
export function RegistrationTrend({ data }: { data: { month: string; registered: number; passed: number; assented: number }[] }) {
  const [range, setRange] = React.useState("12m");
  const [visible, setVisible] = React.useState({ registered: true, passed: true, assented: true });
  const series = [
    { key: "registered" as const, label: "Registered", color: "var(--chart-1)" },
    { key: "passed" as const, label: "Passed", color: "var(--chart-4)" },
    { key: "assented" as const, label: "Assented", color: "var(--chart-3)" },
  ];
  const slice = range === "3m" ? data.slice(-3) : range === "6m" ? data.slice(-6) : data;

  return (
    <ChartFrame
      eyebrow="Flow"
      title="Legislative throughput"
      subtitle="Bills registered against those cleared by both Houses and assented."
      range={range}
      onRange={setRange}
      ranges={[
        { value: "3m", label: "3M" },
        { value: "6m", label: "6M" },
        { value: "12m", label: "12M" },
      ]}
      height="h-[264px]"
      footer={
        <div className="flex flex-wrap items-center gap-4">
          {series.map((s) => (
            <button
              key={s.key}
              onClick={() => setVisible((v) => ({ ...v, [s.key]: !v[s.key] }))}
              className={cn(
                "group flex items-center gap-1.5 text-[11px] transition-opacity",
                visible[s.key] ? "opacity-100" : "opacity-40",
              )}
            >
              <span
                className="h-2 w-2 rounded-[2px] transition-transform group-hover:scale-125"
                style={{ background: s.color }}
              />
              <span className="text-muted">{s.label}</span>
            </button>
          ))}
          <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-success">
            <ArrowUpRight size={12} /> 16.4% YTD
          </span>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={slice} margin={{ top: 8, right: 16, left: 6, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={s.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...axisProps} width={26} tickLine={false} allowDecimals={false} />
          <Tooltip content={<ChartTip />} cursor={{ stroke: "var(--line-strong)", strokeDasharray: "3 4" }} />
          {series.map((s) =>
            visible[s.key] ? (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={s.color}
                strokeWidth={1.9}
                fill={`url(#grad-${s.key})`}
                dot={false}
                activeDot={{ r: 3.5, strokeWidth: 2, stroke: "var(--surface)" }}
                animationDuration={900}
              />
            ) : null,
          )}
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* -------------------------------- Donut ---------------------------------- */
export function TypeDonut({
  data,
  total,
  className,
}: {
  data: { key: string; label: string; value: number; color: string }[];
  total: number;
  className?: string;
}) {
  const [active, setActive] = React.useState<string | null>(null);
  return (
    <Card className={cn("flex flex-col overflow-hidden", className)}>
      <CardHeader
        eyebrow="Composition"
        title="Bill portfolio"
        subtitle="Official, private members' and joint sitting bills."
        actions={
          <button className="pressable grid h-7 w-7 place-items-center rounded-md text-faint hover:bg-surface-3 hover:text-ink" aria-label="More">
            <MoreHorizontal size={15} />
          </button>
        }
      />
      <div className="flex flex-1 flex-col items-center gap-2 px-4 pb-4 pt-1 sm:flex-row sm:gap-0">
        <div className="relative h-[168px] w-full shrink-0 sm:w-[52%]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                innerRadius="66%"
                outerRadius="92%"
                paddingAngle={3}
                cornerRadius={5}
                stroke="none"
                animationDuration={850}
                onMouseEnter={(_, i) => setActive(data[i]?.key ?? null)}
                onMouseLeave={() => setActive(null)}
              >
                {data.map((d) => (
                  <Cell
                    key={d.key}
                    fill={d.color}
                    opacity={active && active !== d.key ? 0.32 : 1}
                    style={{ transition: "opacity 200ms ease", outline: "none" }}
                  />
                ))}
              </Pie>
              <Tooltip content={<ChartTip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="num text-[28px] font-semibold leading-none tracking-[-0.05em] text-ink">{total}</span>
            <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-faint">Total bills</span>
          </div>
        </div>
        <div className="w-full flex-1 space-y-2.5 sm:pl-1">
          {data.map((d) => (
            <div key={d.key} className="group flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-[11.5px] text-muted">
                <span className="h-2 w-2 rounded-[2px]" style={{ background: d.color }} />
                {d.label}
              </span>
              <span className="flex items-baseline gap-1.5">
                <span className="num text-[12px] font-semibold text-ink">{d.value}</span>
                <span className="num text-[10px] text-faint">
                  {total ? Math.round((d.value / total) * 100) : 0}%
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------ Stage bars ------------------------------- */
export function StageBars({
  data,
  title = "Stage distribution",
  subtitle = "Active bills by workflow milestone.",
  className,
  max = 9,
}: {
  data: { stage: string; count: number }[];
  title?: string;
  subtitle?: string;
  className?: string;
  max?: number;
}) {
  const trimmed = data.slice(0, max);
  return (
    <ChartFrame title={title} subtitle={subtitle} eyebrow="Pipeline" className={className} height="h-[268px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={trimmed} layout="vertical" margin={{ top: 4, right: 22, left: 4, bottom: 2 }}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 5" horizontal={false} />
          <XAxis type="number" {...axisProps} allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="stage"
            {...axisProps}
            width={76}
            tick={{ fill: "var(--muted)", fontSize: 10.5 }}
          />
          <Tooltip content={<ChartTip formatter={(v) => `${v} bills`} />} cursor={{ fill: "var(--surface-3)", opacity: 0.6 }} />
          <Bar dataKey="count" name="Bills" radius={[3, 6, 6, 3]} barSize={13} animationDuration={800}>
            {trimmed.map((_, i) => (
              <Cell key={i} fill={i === 0 ? "var(--chart-1)" : i < 3 ? "var(--chart-2)" : "var(--chart-4)"} fillOpacity={1 - Math.min(i * 0.055, 0.45)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ----------------------------- Ministry bars ----------------------------- */
export function MinistryBars({
  data,
  className,
}: {
  data: { short: string; total: number; overdue: number }[];
  className?: string;
}) {
  const [metric, setMetric] = React.useState<"total" | "overdue">("total");
  return (
    <ChartFrame
      eyebrow="Workload"
      title="Bills by division"
      subtitle="Top sponsoring divisions across both Houses."
      className={className}
      height="h-[284px]"
      actions={
        <Segmented
          options={[
            { value: "total", label: "All bills" },
            { value: "overdue", label: "Overdue" },
          ]}
          value={metric}
          onChange={(v) => setMetric(v as "total" | "overdue")}
        />
      }
      footer={
        <div className="flex items-center justify-between text-[10.5px] text-faint">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-chart-1" /> All registered bills
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-[2px] bg-chart-3" /> Past committee window
          </span>
        </div>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.slice(0, 8)} margin={{ top: 6, right: 14, left: 0, bottom: 22 }} barGap={2}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 5" vertical={false} />
          <XAxis
            dataKey="short"
            {...axisProps}
            interval={0}
            angle={-32}
            textAnchor="end"
            height={46}
            tick={{ fill: "var(--muted)", fontSize: 9.5 }}
          />
          <YAxis {...axisProps} width={24} allowDecimals={false} />
          <Tooltip content={<ChartTip />} cursor={{ fill: "var(--surface-3)", opacity: 0.5 }} />
          {metric === "total" ? (
            <Bar dataKey="total" name="All bills" radius={[4, 4, 0, 0]} fill="var(--chart-1)" barSize={18} animationDuration={750} />
          ) : (
            <Bar dataKey="overdue" name="Overdue" radius={[4, 4, 0, 0]} fill="var(--chart-3)" barSize={18} animationDuration={750} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ----------------------------- Ageing chart ------------------------------ */
export function AgeingBars({
  data,
  className,
}: {
  data: { label: string; NA: number; Senate: number; Joint: number }[];
  className?: string;
}) {
  return (
    <ChartFrame
      eyebrow="Ageing"
      title="Time in current stage"
      subtitle="Distribution of elapsed days, split by House."
      className={className}
      height="h-[240px]"
      footer={
        <div className="flex flex-wrap items-center gap-4 text-[10.5px] text-muted">
          {[
            { key: "NA", color: "var(--chart-1)" },
            { key: "Senate", color: "var(--chart-2)" },
            { key: "Joint", color: "var(--chart-5)" },
          ].map((s) => (
            <span key={s.key} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: s.color }} />
              {s.key === "NA" ? "National Assembly" : s.key}
            </span>
          ))}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }} barGap={1}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="label" {...axisProps} />
          <YAxis {...axisProps} width={24} allowDecimals={false} />
          <Tooltip content={<ChartTip formatter={(v) => `${v} bills`} />} cursor={{ fill: "var(--surface-3)", opacity: 0.5 }} />
          <Bar dataKey="NA" stackId="a" fill="var(--chart-1)" barSize={34} radius={[0, 0, 0, 0]} animationDuration={780} />
          <Bar dataKey="Senate" stackId="a" fill="var(--chart-2)" barSize={34} animationDuration={780} />
          <Bar dataKey="Joint" stackId="a" fill="var(--chart-5)" barSize={34} radius={[4, 4, 0, 0]} animationDuration={780} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* ---------------------------- Mini area chart ---------------------------- */
export function MiniTrend({
  data,
  dataKey = "value",
  color = "var(--chart-1)",
  height = 46,
}: {
  data: { [k: string]: string | number }[];
  dataKey?: string;
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`mini-${dataKey}-${color.replace(/\W/g, "")}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.7} fill={`url(#mini-${dataKey}-${color.replace(/\W/g, "")})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------ Activity bars ---------------------------- */
export function ActivityBars({ data }: { data: { day: string; logins: number; updates: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }} barGap={3}>
        <CartesianGrid stroke="var(--line)" strokeDasharray="3 5" vertical={false} />
        <XAxis dataKey="day" {...axisProps} />
        <YAxis {...axisProps} width={24} />
        <Tooltip content={<ChartTip />} cursor={{ fill: "var(--surface-3)", opacity: 0.5 }} />
        <Bar dataKey="logins" name="Logins" fill="var(--chart-4)" radius={[3, 3, 0, 0]} barSize={11} />
        <Bar dataKey="updates" name="Updates" fill="var(--chart-1)" radius={[3, 3, 0, 0]} barSize={11} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------ SLA line --------------------------------- */
export function ComplianceLine({
  data,
  className,
}: {
  data: { month: string; compliance: number; target: number }[];
  className?: string;
}) {
  return (
    <ChartFrame
      eyebrow="Compliance"
      title="Deadline compliance"
      subtitle="Share of active bills inside their statutory window."
      className={className}
      height="h-[200px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 6, right: 18, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--line)" strokeDasharray="3 5" vertical={false} />
          <XAxis dataKey="month" {...axisProps} />
          <YAxis {...axisProps} width={30} domain={[60, 100]} unit="%" />
          <Tooltip content={<ChartTip suffix="%" />} />
          <ReferenceLine y={95} stroke="var(--chart-3)" strokeDasharray="4 4" strokeOpacity={0.7} />
          <Line type="monotone" dataKey="compliance" name="Compliance" stroke="var(--chart-1)" strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

/* --------------------------- Export / print bar -------------------------- */
export function ChartActions({ onExport }: { onExport?: () => void }) {
  return (
    <button
      onClick={onExport}
      className="pressable inline-flex h-7 items-center gap-1.5 rounded-md border border-line bg-surface px-2 text-[10.5px] font-medium text-muted transition-colors hover:text-ink"
    >
      <Download size={12} /> Export
    </button>
  );
}

/* ------------------------------ Heatmap ---------------------------------- */
export function DivisionHeatmap({
  rows,
  columns,
  className,
}: {
  rows: { id: string; short: string; cells: number[]; total: number }[];
  columns: string[];
  className?: string;
}) {
  const max = Math.max(1, ...rows.flatMap((r) => r.cells));
  const tint = (v: number) => {
    if (v === 0) return "var(--surface-2)";
    const intensity = 16 + Math.round((v / max) * 78);
    return `color-mix(in oklab, var(--brand) ${intensity}%, var(--surface-2))`;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader
        eyebrow="Density"
        title="Division × milestone"
        subtitle="Where legislative work is concentrated across the session."
        actions={
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-faint">low</span>
            {[16, 38, 60, 82, 94].map((v) => (
              <span
                key={v}
                className="h-2.5 w-3.5 rounded-[2px]"
                style={{ background: `color-mix(in oklab, var(--brand) ${v}%, var(--surface-2))` }}
              />
            ))}
            <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-faint">high</span>
          </div>
        }
      />
      <div className="scroll-thin overflow-x-auto p-4">
        <div className="min-w-[560px]">
          <div
            className="grid gap-1"
            style={{ gridTemplateColumns: `132px repeat(${columns.length}, minmax(0, 1fr))` }}
          >
            <div />
            {columns.map((c) => (
              <div key={c} className="pb-1 text-center font-mono text-[8px] uppercase tracking-[0.08em] text-faint">
                {c}
              </div>
            ))}
          </div>
          {rows.map((row) => (
            <div
              key={row.id}
              className="grid items-center gap-1 py-[2px]"
              style={{ gridTemplateColumns: `132px repeat(${columns.length}, minmax(0, 1fr))` }}
            >
              <div className="flex items-center gap-1.5 pr-2">
                <span className="truncate text-[10px] text-ink-2">{row.short}</span>
                <span className="num ml-auto shrink-0 font-mono text-[8.5px] text-faint">{row.total}</span>
              </div>
              {row.cells.map((v, i) => (
                <span
                  key={i}
                  title={`${row.short} · ${columns[i]}: ${v} bill${v === 1 ? "" : "s"}`}
                  className="flex h-7 w-full items-center justify-center rounded-[4px] border border-line/50 text-[9.5px] font-medium transition-transform hover:scale-[1.04]"
                  style={{
                    background: tint(v),
                    color: v / max > 0.55 ? "var(--surface)" : v === 0 ? "var(--faint)" : "var(--ink-2)",
                  }}
                  aria-label={`${row.short}, ${columns[i]}: ${v} bills`}
                >
                  {v || ""}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

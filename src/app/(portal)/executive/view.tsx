"use client";

import * as React from "react";
import Link from "next/link";
import { cn, formatDate, pct, SYSTEM_DATE } from "@/lib/format";
import { useStore } from "@/lib/store";
import { MONTHLY_TREND, SESSION } from "@/lib/data";
import {
  ageingBuckets,
  houseStats,
  isOverdue,
  ministryStats,
  outcomeDistribution,
  overview,
  stageDistribution,
  typeSplit,
} from "@/lib/metrics";
import { OUTCOME_META } from "@/lib/workflows";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Gauge,
  Progress,
  Segmented,
  StatusDot,
} from "@/components/ui/primitives";
import { AgeingBars, RegistrationTrend, StageBars, TypeDonut } from "@/components/charts";
import { KpiCard } from "@/components/kpi";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Download,
  FileStack,
  Landmark,
  Printer,
  Scale,
  ShieldCheck,
  Stamp,
  TrendingUp,
  Users,
} from "lucide-react";

export function ExecutiveView() {
  const { bills } = useStore();
  const [period, setPeriod] = React.useState("session");
  const stats = overview(bills);
  const houses = houseStats(bills);
  const ministries = ministryStats(bills);
  const outcomes = outcomeDistribution(bills);
  const types = typeSplit(bills);

  const funnel = [
    { label: "Registered", value: stats.total, tone: "var(--chart-4)" },
    { label: "Introduced", value: bills.filter((b) => b.stage !== "pre-introduction" && b.stage !== "pre-admissibility").length, tone: "var(--chart-1)" },
    { label: "Committee reported", value: bills.filter((b) => ["consideration", "transmitted", "assent", "president", "gazette", "js-decision", "returned"].includes(b.stage)).length, tone: "var(--chart-2)" },
    { label: "Passed by a House", value: stats.passed, tone: "var(--chart-3)" },
    { label: "Assented", value: stats.assented, tone: "var(--chart-5)" },
  ];

  const risks = [...bills]
    .filter((b) => b.outcome === "in-progress")
    .sort((a, b) => (isOverdue(b) ? -1 : 1) - (isOverdue(a) ? -1 : 1))
    .slice(0, 6);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">Executive · BRD §13</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
            The legislative picture
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-5 text-muted">
            A consolidated read for the Secretary and the Prime Minister&apos;s Office — by House,
            division, stage and outcome. No manual compilation required.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { value: "session", label: "This session" },
              { value: "year", label: "Year to date" },
              { value: "all", label: "All time" },
            ]}
            value={period}
            onChange={setPeriod}
            size="md"
          />
          <Button variant="secondary" size="md" onClick={() => window.print()}>
            <Printer size={13} /> Print brief
          </Button>
          <Button variant="primary" size="md" onClick={() => window.print()}>
            <Download size={13} /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total legislative business" value={stats.total} unit="bills" icon={FileStack} delta={12} accent="brand" footer={<span className="text-[10px] text-muted">{stats.active} active · {stats.passed} resolved</span>} />
        <KpiCard label="Government success rate" value={`${stats.assentRate}%`} icon={TrendingUp} accent="blue" progress={{ value: stats.assentRate, tone: "info" }} footer={<span className="text-[10px] text-muted">{stats.assented} of {stats.passed} passed bills assented</span>} />
        <KpiCard label="Statutory compliance" value={`${stats.compliance}%`} icon={ShieldCheck} accent="violet" progress={{ value: stats.compliance, tone: "brand" }} footer={<span className="text-[10px] text-muted">{stats.overdue} breaches across {stats.total} records</span>} />
        <KpiCard label="Ministry responsiveness" value={`${100 - pct(stats.responsePending, stats.private)}%`} icon={Users} accent="gold" progress={{ value: 100 - pct(stats.responsePending, stats.private), tone: "success" }} footer={<span className="text-[10px] text-muted">{stats.responsePending} Article 74 responses outstanding</span>} />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <RegistrationTrend data={MONTHLY_TREND} />

          <Card className="overflow-hidden">
            <CardHeader
              eyebrow="Funnel"
              title="From registration to Gazette"
              subtitle="Conversion across the legislative lifecycle this session."
              actions={<Badge tone="brand">{stats.assentRate}% assent rate</Badge>}
            />
            <div className="space-y-3 p-4">
              {funnel.map((step, i) => {
                const percent = Math.round((step.value / funnel[0].value) * 100);
                return (
                  <div key={step.label} className="flex items-center gap-3">
                    <span className="w-[136px] shrink-0 text-[10.5px] font-medium text-ink-2">{step.label}</span>
                    <div className="relative h-6 flex-1 overflow-hidden rounded-[6px] bg-surface-3">
                      <div
                        className="flex h-full items-center justify-end rounded-[6px] px-2 transition-[width] duration-700"
                        style={{ width: `${Math.max(percent, 7)}%`, background: step.tone, opacity: 1 - i * 0.06 }}
                      >
                        <span className="num font-mono text-[9px] font-semibold text-white/95">{step.value}</span>
                      </div>
                    </div>
                    <span className="num w-9 shrink-0 text-right font-mono text-[9.5px] text-faint">{percent}%</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between border-t border-line bg-surface-2 px-4 py-2.5">
              <p className="text-[9.5px] text-muted">
                As at {formatDate(SYSTEM_DATE)} · {SESSION.sitting}
              </p>
              <Link href="/bills" className="flex items-center gap-1 text-[9.5px] font-medium text-brand hover:underline">
                Open registry <ArrowRight size={10} />
              </Link>
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <StageBars data={stageDistribution(bills)} title="Stage concentration" subtitle="Where attention is required." max={8} />
            <AgeingBars data={ageingBuckets(bills)} />
          </div>
        </div>

        <div className="space-y-4 xl:col-span-4">
          <TypeDonut data={types} total={stats.total} />

          <Card className="overflow-hidden">
            <CardHeader eyebrow="Chambers" title="House-wise position" />
            <div className="space-y-3 p-4">
              {houses.map((h) => (
                <div key={h.key} className="rounded-[10px] border border-line bg-surface-2 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-medium text-ink">
                      <Landmark size={12} className="text-faint" />
                      {h.label}
                    </span>
                    <span className="num text-[12px] font-semibold text-ink">{h.total}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.08em] text-faint">Active</p>
                      <p className="num text-[11px] font-medium text-ink-2">{h.active}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.08em] text-faint">Assented</p>
                      <p className="num text-[11px] font-medium text-success">{h.assented}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[8px] uppercase tracking-[0.08em] text-faint">Overdue</p>
                      <p className={cn("num text-[11px] font-medium", h.overdue > 0 ? "text-danger" : "text-faint")}>{h.overdue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Outcomes</p>
                <p className="mt-1.5 text-[12.5px] font-semibold text-ink">Decision mix</p>
              </div>
              <Gauge value={stats.assentRate} size={64} label="assent" />
            </div>
            <div className="mt-3 space-y-1.5">
              {outcomes.map((o) => {
                const meta = OUTCOME_META[o.key];
                return (
                  <div key={o.key} className="flex items-center gap-2">
                    <span className="w-[74px] shrink-0 text-[10px] text-muted">{meta.label}</span>
                    <Progress
                      value={pct(o.value, stats.total)}
                      tone={meta.tone === "success" ? "success" : meta.tone === "warning" ? "warning" : meta.tone === "danger" ? "danger" : "brand"}
                      height={4}
                      className="flex-1"
                    />
                    <span className="num w-4 text-right font-mono text-[9px] text-faint">{o.value}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="overflow-hidden lg:col-span-7">
          <CardHeader
            eyebrow="Watchlist"
            title="Bills needing executive attention"
            subtitle="Ordered by statutory risk, then time at stage."
            actions={
              <Link href="/bills" className="flex items-center gap-1 text-[10px] font-medium text-brand hover:underline">
                All bills <ArrowUpRight size={10} />
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left">
              <thead className="bg-surface-2">
                <tr className="border-y border-line">
                  {["Bill", "Division", "Stage", "Risk"].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2 text-[9px] font-medium uppercase tracking-[0.1em] text-faint">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {risks.map((bill) => (
                  <tr key={bill.id} className="group border-b border-line last:border-0 hover:bg-surface-2">
                    <td className="max-w-[260px] px-3 py-2.5">
                      <Link href={`/bills/${bill.id}`} className="block">
                        <p className="truncate text-[11px] font-medium text-ink group-hover:text-brand-ink">{bill.shortTitle}</p>
                        <p className="font-mono text-[8.5px] text-faint">{bill.id}</p>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-[10px] text-muted">
                      {ministries.find((m) => m.id === bill.ministryId)?.short}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      <Badge tone={isOverdue(bill) ? "danger" : "neutral"} size="xs">
                        {bill.stage.replace(/-/g, " ")}
                      </Badge>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5">
                      {isOverdue(bill) ? (
                        <span className="flex items-center gap-1 text-[9.5px] font-medium text-danger">
                          <AlertTriangle size={10} /> breach
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9.5px] text-success">
                          <ShieldCheck size={10} /> inside window
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-5">
          <Card className="overflow-hidden">
            <CardHeader eyebrow="Divisions" title="Sponsorship league" subtitle="Top five by volume this session." />
            <div className="divide-y divide-line">
              {ministries.slice(0, 5).map((m, i) => (
                <div key={m.id} className="flex items-center gap-2.5 px-4 py-2.5">
                  <span className="num w-4 font-mono text-[9px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-surface-3 text-muted">
                    <Building2 size={11} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-medium text-ink">{m.short}</p>
                    <Progress value={(m.total / Math.max(1, ministries[0].total)) * 100} height={3} className="mt-1" />
                  </div>
                  <span className="num shrink-0 text-[11px] font-semibold text-ink">{m.total}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="texture relative overflow-hidden bg-gradient-to-br from-surface to-brand-soft/40 p-4">
            <div className="relative">
              <p className="eyebrow">Assurance</p>
              <p className="mt-2 text-[12.5px] font-semibold leading-[1.4] text-ink">
                Every number on this page is traceable
              </p>
              <p className="mt-1.5 text-[10px] leading-[1.7] text-muted">
                Each figure is generated by querying the live registry. Drill into any value to see the
                underlying bills, stage history and audit entries.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Badge tone="success" dot>
                  Live data
                </Badge>
                <Badge tone="neutral">
                  <Scale size={9} /> Audit-backed
                </Badge>
                <Badge tone="gold">
                  <Stamp size={9} /> Assent tracked
                </Badge>
              </div>
              <p className="mt-3 flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.12em] text-faint">
                <StatusDot tone="success" /> data cut-off {formatDate(SYSTEM_DATE)}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

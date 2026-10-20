"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { cn, daysBetween, formatDate, formatDateShort, relativeTime, SYSTEM_DATE } from "@/lib/format";
import { useStore } from "@/lib/store";
import { MONTHLY_TREND, SESSION, USER_ACTIVITY } from "@/lib/data";
import {
  ageingBuckets,
  deadlineState,
  houseStats,
  isCommitteeStage,
  ministryStats,
  overview,
  recentBills,
  stageAge,
  stageDistribution,
  typeSplit,
} from "@/lib/metrics";
import { can } from "@/lib/roles";
import { ALERT_TYPE_META, STAGE_LIBRARY } from "@/lib/workflows";
import { BillType } from "@/lib/types";
import { Badge, Button, Card, CardHeader, Gauge, Progress, Segmented, StatusDot } from "@/components/ui/primitives";
import { DeadlineChip, HouseChip, StageProgress } from "@/components/ui/bill-bits";
import { KpiCard } from "@/components/kpi";
import { AgeingBars, ActivityBars, MinistryBars, RegistrationTrend, StageBars, TypeDonut } from "@/components/charts";
import { BillTable } from "@/components/BillTable";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  CalendarClock,
  CheckCircle2,
  FilePlus2,
  FileStack,
  ScrollText,
  ShieldCheck,
  Stamp,
  Timer,
  GitBranch,
  BellRing,
} from "lucide-react";

const TYPE_FILTERS = [
  { value: "all", label: "All bills" },
  { value: "official", label: "Official" },
  { value: "private", label: "Private" },
  { value: "joint", label: "Joint" },
] as const;

export function DashboardView() {
  const { session, bills, alerts, acknowledgeAlert } = useStore();
  const [scope, setScope] = React.useState<"all" | BillType>("all");
  const role = session.role;

  const scoped = React.useMemo(
    () => (scope === "all" ? bills : bills.filter((b) => b.type === scope)),
    [bills, scope],
  );

  const stats = overview(scoped);
  const typeData = typeSplit(scoped);
  const ministryData = ministryStats(scoped);
  const houses = houseStats(scoped);
  const recent = recentBills(scoped, 5);
  const distribution = stageDistribution(scoped);

  const myAlerts = React.useMemo(() => {
    const seen = new Set<string>();
    return alerts
      .filter((a) => a.status !== "resolved")
      .filter((a) => {
        if (seen.has(a.id)) return false;
        seen.add(a.id);
        return true;
      })
      .filter((a) => a.audience.includes(role.id) || role.scope === "nation")
      .slice(0, 4);
  }, [alerts, role]);

  const committeeClocks = React.useMemo(
    () =>
      scoped
        .filter((b) => b.committeeDueAt && isCommitteeStage(b))
        .sort((a, b) => new Date(a.committeeDueAt!).getTime() - new Date(b.committeeDueAt!).getTime())
        .slice(0, 4),
    [scoped],
  );

  const greeting = React.useMemo(() => {
    const hour = Number(
      new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: "Asia/Karachi" }).format(
        SYSTEM_DATE,
      ),
    );
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const firstName = session.user.name.split(" ")[0];
  const openAlerts = alerts.filter((a) => a.status === "open").length;
  const approvalsDue = scoped.filter((b) => b.stage === "assent").length;

  return (
    <div className="space-y-5">
      {/* ------------------------------ Hero ------------------------------ */}
      <section className="card texture relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-28 h-[24rem] w-[24rem] rounded-full bg-[radial-gradient(circle_at_center,var(--brand-soft),transparent_66%)]" />
          <div className="absolute -bottom-24 left-1/3 h-[18rem] w-[18rem] rounded-full bg-[radial-gradient(circle_at_center,var(--gold-soft),transparent_70%)] opacity-60" />
        </div>

        <div className="relative flex flex-col gap-5 p-5 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="eyebrow flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5">
                  <StatusDot tone="success" pulse /> {SESSION.name}
                </span>
                <span className="text-line-strong">/</span>
                <span>{formatDate(SYSTEM_DATE, { weekday: "long", day: "numeric", month: "long" })}</span>
              </p>
              <h1 className="mt-2.5 text-[27px] font-semibold leading-[1.08] tracking-[-0.04em] text-ink sm:text-[33px]">
                {greeting}, {firstName}.
              </h1>
              <p className="mt-2 max-w-[62ch] text-[12.5px] leading-5 text-muted">
                {stats.active} bills are moving through the legislative pipeline today.{" "}
                {stats.overdue > 0 ? (
                  <>
                    <span className="font-medium text-danger">{stats.overdue} past their statutory window</span>{" "}
                    and {stats.dueSoon} due within seven days.
                  </>
                ) : (
                  <>Every committee clock is inside its statutory window.</>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Segmented
                options={TYPE_FILTERS.map((t) => ({ value: t.value, label: t.label }))}
                value={scope}
                onChange={(v) => setScope(v as typeof scope)}
                size="md"
              />
              {can(role, "bills.create") && (
                <Button variant="primary" size="md" onClick={() => (window.location.href = "/bills/new")}>
                  <FilePlus2 size={14} /> Register bill
                </Button>
              )}
              <Button variant="secondary" size="md" onClick={() => window.print()}>
                <FileStack size={14} /> Brief
              </Button>
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: ScrollText,
                label: "Registry",
                value: `${stats.total} bills`,
                sub: `${stats.official} official · ${stats.private} private · ${stats.joint} joint`,
                href: "/bills",
              },
              {
                icon: Timer,
                label: "Statutory clock",
                value:
                  stats.overdue > 0
                    ? `${stats.overdue} overdue`
                    : `${stats.dueSoon} due soon`,
                sub: `NA 30d · Senate 60d · transmission 90d`,
                href: "/committees",
                tone: stats.overdue > 0 ? "danger" : "success",
              },
              {
                icon: ShieldCheck,
                label: "Compliance",
                value: `${stats.compliance}%`,
                sub: `${stats.total - stats.overdue} of ${stats.total} inside window`,
                href: "/executive",
                tone: "brand",
              },
              {
                icon: BellRing,
                label: "Escalations",
                value: `${openAlerts} open`,
                sub: `${alerts.filter((a) => a.severity === "critical").length} critical · ${approvalsDue} endorsements`,
                href: "/alerts",
                tone: openAlerts > 0 ? "warning" : "success",
              },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.06, duration: 0.45 }}
              >
                <Link
                  href={item.href}
                  className="group flex items-center gap-2.5 rounded-[12px] border border-line bg-surface/70 p-2.5 backdrop-blur-sm transition-all hover:border-line-strong hover:bg-surface"
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-[9px]",
                      item.tone === "danger"
                        ? "bg-danger-soft text-danger"
                        : item.tone === "warning"
                          ? "bg-warning-soft text-warning"
                          : item.tone === "success"
                            ? "bg-success-soft text-success"
                            : "bg-brand-soft text-brand",
                    )}
                  >
                    <item.icon size={14} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono text-[8.5px] uppercase tracking-[0.14em] text-faint">
                      {item.label}
                    </span>
                    <span className="block truncate text-[12.5px] font-semibold text-ink">{item.value}</span>
                    <span className="block truncate text-[9.5px] text-muted">{item.sub}</span>
                  </span>
                  <ArrowUpRight
                    size={12}
                    className="shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100"
                  />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------ KPIs ------------------------------ */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total registered"
          value={stats.total}
          unit="bills"
          delta={12}
          icon={FileStack}
          accent="brand"
          spark={[28, 31, 34, 33, 39, 44, 47, 51, stats.total]}
          footer={
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted">This session</span>
              <span className="num font-medium text-ink">+{stats.official + stats.private - 40} net</span>
            </div>
          }
        />
        <KpiCard
          label="Active in pipeline"
          value={stats.active}
          unit={`of ${stats.total}`}
          icon={GitBranch}
          accent="blue"
          progress={{ value: Math.round((stats.active / stats.total) * 100), tone: "info" }}
          footer={
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted">Committee pending</span>
              <span className="num font-medium text-ink">{stats.committeePending}</span>
            </div>
          }
        />
        <KpiCard
          label="Awaiting assent"
          value={stats.awaitingAssent}
          unit="bills"
          delta={-8}
          invertDelta
          icon={Stamp}
          accent="gold"
          spark={[2, 4, 3, 5, 4, 6, 5, 4, stats.awaitingAssent]}
          sparkColor="var(--chart-3)"
          footer={
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted">Assented to date</span>
              <span className="num font-medium text-success">{stats.assented}</span>
            </div>
          }
        />
        <KpiCard
          label="Deadline breaches"
          value={stats.overdue}
          unit="overdue"
          delta={stats.overdue > 2 ? 15 : -22}
          invertDelta
          icon={AlertTriangle}
          accent={stats.overdue > 2 ? "danger" : "neutral"}
          footer={
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-muted">Due in 7 days</span>
              <span className="num font-medium text-warning">{stats.dueSoon}</span>
            </div>
          }
        />
      </div>

      {/* ---------------------------- Main grid --------------------------- */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <RegistrationTrend data={MONTHLY_TREND} />

          <Card className="overflow-hidden">
            <CardHeader
              eyebrow="Registry"
              title="Recently moved bills"
              subtitle="The last stage updates recorded across all workflows."
              actions={
                <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/bills")}>
                  Open registry <ArrowRight size={12} />
                </Button>
              }
            />
            <div className="mt-3">
              {recent.map((bill) => (
                <div key={bill.id} className="border-b border-line last:border-0">
                  <Link
                    href={`/bills/${bill.id}`}
                    className="group flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-surface-2 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="num font-mono text-[9px] text-faint">{bill.id}</span>
                        <span className="h-2.5 w-px bg-line-strong" />
                        <span className="truncate text-[9.5px] text-muted">
                          {bill.memberInCharge}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[12.5px] font-medium text-ink group-hover:text-brand-ink">
                        {bill.shortTitle}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <HouseChip house={bill.house} />
                        <span className="text-[9.5px] text-faint">·</span>
                        <span className="text-[10px] text-muted">
                          {STAGE_LIBRARY[bill.stage]?.label}
                        </span>
                        <span className="text-[9.5px] text-faint">· {relativeTime(bill.stageEnteredAt)}</span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 sm:w-[190px]">
                      <div className="min-w-0 flex-1">
                        <StageProgress bill={bill} />
                        <p className="mt-1 text-right font-mono text-[9px] text-faint">
                          {stageAge(bill)}d at stage
                        </p>
                      </div>
                      <ArrowRight
                        size={13}
                        className="shrink-0 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                      />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <StageBars data={distribution} />
            <MinistryBars data={ministryData.map((m) => ({ short: m.short, total: m.total, overdue: m.overdue }))} />
          </div>
        </div>

        <div className="space-y-4 xl:col-span-4">
          <TypeDonut data={typeData} total={scoped.length} />

          {/* Committee clocks */}
          <Card className="overflow-hidden">
            <CardHeader
              eyebrow="Statutory clocks"
              title="Committee windows"
              subtitle="Nearest deadlines under the 30 / 60-day rules."
              actions={
                <Link
                  href="/committees"
                  className="text-[10.5px] font-medium text-brand hover:underline"
                >
                  All
                </Link>
              }
            />
            <div className="mt-3 space-y-2.5 px-4 pb-4">
              {committeeClocks.length === 0 && (
                <p className="py-6 text-center text-[11px] text-muted">No committee clocks running.</p>
              )}
              {committeeClocks.map((bill) => {
                const delta = daysBetween(SYSTEM_DATE, bill.committeeDueAt!);
                const limit = bill.house === "Senate" ? 60 : 30;
                const elapsed = Math.min(limit, Math.max(0, limit - Math.max(0, delta)));
                const percent = Math.round((elapsed / limit) * 100);
                const tone =
                  deadlineState(bill) === "overdue" ? "danger" : deadlineState(bill) === "due-soon" ? "warning" : "brand";
                return (
                  <Link key={bill.id} href={`/bills/${bill.id}`} className="group block">
                    <div className="flex items-start justify-between gap-2">
                      <p className="line-clamp-1 text-[11.5px] font-medium text-ink group-hover:text-brand-ink">
                        {bill.shortTitle}
                      </p>
                      <DeadlineChip dueAt={bill.committeeDueAt} compact />
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Progress value={percent} tone={tone} height={4} className="flex-1" />
                      <span className="num shrink-0 font-mono text-[9px] text-faint">
                        {elapsed}/{limit}d
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Card>

          {/* Alerts */}
          <Card className="overflow-hidden">
            <CardHeader
              eyebrow="Exceptions"
              title="Needs attention"
              subtitle="Milestone and deadline escalations for your role."
              actions={
                <Link href="/alerts" className="text-[10.5px] font-medium text-brand hover:underline">
                  All
                </Link>
              }
            />
            <div className="mt-2">
              {myAlerts.map((alert) => {
                const meta = ALERT_TYPE_META[alert.type];
                const tone =
                  alert.severity === "critical"
                    ? "bg-danger-soft text-danger"
                    : alert.severity === "warning"
                      ? "bg-warning-soft text-warning"
                      : "bg-info-soft text-info";
                return (
                  <button
                    key={alert.id}
                    onClick={() => acknowledgeAlert(alert.id)}
                    title="Acknowledge this alert"
                    className="group flex w-full gap-2.5 border-b border-line px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-surface-2"
                  >
                    <span className={cn("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md", tone)}>
                      <AlertTriangle size={11} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-medium text-ink">{alert.title}</span>
                      <span className="mt-0.5 block truncate font-mono text-[9px] text-faint">
                        {alert.billId} · {meta.label} · {relativeTime(alert.createdAt)}
                      </span>
                    </span>
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-warning opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                );
              })}
              {myAlerts.length === 0 && (
                <div className="flex flex-col items-center py-8 text-center">
                  <CheckCircle2 size={20} className="text-success" />
                  <p className="mt-2 text-[11px] font-medium text-ink">Nothing needs your action</p>
                  <p className="mt-0.5 text-[10px] text-muted">Every escalation has been resolved.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Compliance gauge */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Compliance</p>
                <p className="mt-1.5 text-[13px] font-semibold text-ink">Statutory discipline</p>
                <p className="mt-0.5 text-[10px] text-muted">Bills inside their legal window</p>
              </div>
              <Gauge value={stats.compliance} size={74} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
              <div>
                <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-faint">Assent rate</p>
                <p className="num mt-0.5 text-[15px] font-semibold text-ink">{stats.assentRate}%</p>
              </div>
              <div>
                <p className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-faint">Avg. stage age</p>
                <p className="num mt-0.5 text-[15px] font-semibold text-ink">{stats.avgStageAge}d</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ------------------------- Secondary analytics ------------------------- */}
      <div className="grid gap-4 lg:grid-cols-12">
        <AgeingBars data={ageingBuckets(scoped)} className="lg:col-span-5" />
        <Card className="overflow-hidden lg:col-span-4">
          <CardHeader
            eyebrow="Houses"
            title="Chamber workload"
            subtitle="Where legislative business currently sits."
          />
          <div className="space-y-3 p-4">
            {houses.map((h) => (
              <div key={h.key}>
                <div className="flex items-baseline justify-between">
                  <span className="text-[11.5px] font-medium text-ink">{h.label}</span>
                  <span className="flex items-baseline gap-1.5">
                    <span className="num text-[13px] font-semibold text-ink">{h.total}</span>
                    <span className="text-[9.5px] text-faint">bills</span>
                    {h.overdue > 0 && (
                      <Badge tone="danger" size="xs">
                        {h.overdue} overdue
                      </Badge>
                    )}
                  </span>
                </div>
                <Progress
                  value={Math.round((h.total / scoped.length) * 100)}
                  tone={h.key === "NA" ? "brand" : h.key === "Senate" ? "info" : "violet"}
                  className="mt-1.5"
                  height={5}
                />
                <p className="mt-1 flex justify-between text-[9px] text-faint">
                  <span>{h.active} active</span>
                  <span>{h.assented} assented</span>
                </p>
              </div>
            ))}
            <div className="rounded-[10px] border border-dashed border-line-strong bg-surface-2 p-2.5">
              <p className="flex items-center gap-1.5 text-[9.5px] text-muted">
                <CalendarClock size={11} className="text-brand" />
                Next sitting {formatDateShort(SESSION.nextSitting)} · {SESSION.remainingSittings} sittings
                remain
              </p>
            </div>
          </div>
        </Card>

        <Card className="overflow-hidden lg:col-span-3">
          <CardHeader eyebrow="Adoption" title="Portal activity" subtitle="Last 7 days" />
          <div className="h-[150px] px-1 pt-3">
            <ActivityBars data={USER_ACTIVITY} />
          </div>
          <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
            <span className="flex items-center gap-1.5 text-[9.5px] text-muted">
              <span className="h-2 w-2 rounded-[2px] bg-chart-4" /> Logins
            </span>
            <span className="flex items-center gap-1.5 text-[9.5px] text-muted">
              <span className="h-2 w-2 rounded-[2px] bg-chart-1" /> Record updates
            </span>
          </div>
        </Card>
      </div>

      {/* ----------------------------- Table ----------------------------- */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow mb-1.5">Registry</p>
            <h2 className="text-[19px] font-semibold tracking-[-0.03em] text-ink">
              Every bill, one source of truth
            </h2>
            <p className="mt-1 text-[11.5px] text-muted">
              Filter by type, House, division or deadline. Row density and columns adapt to your screen.
            </p>
          </div>
          <Link
            href="/bills"
            className="group flex items-center gap-1 text-[11.5px] font-medium text-brand hover:underline"
          >
            Full registry <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
        <BillTable bills={scoped} pageSize={6} title="Search the legislative registry…" />
      </div>
    </div>
  );
}

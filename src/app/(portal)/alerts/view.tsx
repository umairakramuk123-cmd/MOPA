"use client";

import * as React from "react";
import Link from "next/link";
import { cn, formatDate, formatDateTime, relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import { can } from "@/lib/roles";
import { ALERT_TYPE_META } from "@/lib/workflows";
import { AlertSeverity, AlertType } from "@/lib/types";
import { Badge, Button, Card, CardHeader, EmptyState, Segmented, Select } from "@/components/ui/primitives";
import { StatStrip } from "@/components/kpi";
import {
  AlertTriangle,
  ArrowRight,
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Clock3,
  Info,
  Mail,
  MessageSquareReply,
  Scale,
  Settings2,
  ShieldAlert,
  Stamp,
  Newspaper,
  Flag,
  SlidersHorizontal,
} from "lucide-react";

const ICONS: Record<AlertType, React.ElementType> = {
  milestone: Flag,
  deadline: Clock3,
  response: MessageSquareReply,
  constitutional: Scale,
  assent: Stamp,
  gazette: Newspaper,
};

const SEVERITY_TONE: Record<AlertSeverity, { tone: "danger" | "warning" | "info"; bg: string }> = {
  critical: { tone: "danger", bg: "bg-danger-soft text-danger" },
  warning: { tone: "warning", bg: "bg-warning-soft text-warning" },
  info: { tone: "info", bg: "bg-info-soft text-info" },
};

export function AlertsView() {
  const { alerts, session, acknowledgeAlert, resolveAlert, toast } = useStore();
  const [status, setStatus] = React.useState<"all" | "open" | "acknowledged" | "resolved">("all");
  const [severity, setSeverity] = React.useState<"all" | AlertSeverity>("all");
  const [type, setType] = React.useState<"all" | AlertType>("all");
  const quota = can(session.role, "alerts.configure");

  const visible = alerts.filter((a) => a.audience.includes(session.role.id) || session.role.scope === "nation");
  const filtered = visible.filter((a) => {
    if (status !== "all" && a.status !== status) return false;
    if (severity !== "all" && a.severity !== severity) return false;
    if (type !== "all" && a.type !== type) return false;
    return true;
  });

  const open = visible.filter((a) => a.status === "open").length;
  const critical = visible.filter((a) => a.severity === "critical" && a.status !== "resolved").length;
  const resolved = visible.filter((a) => a.status === "resolved").length;

  const markAll = () => {
    visible.filter((a) => a.status === "open").forEach((a) => acknowledgeAlert(a.id));
    toast({ title: "All alerts acknowledged", description: "They remain in the exception list until resolved.", tone: "success" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">Alerts · BRD §15</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
            Nothing slips quietly
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-5 text-muted">
            The scheduler compares milestone dates against configured rules. Escalations stay in your
            action list until addressed — reminders first, then an overdue flag.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="md" onClick={markAll}>
            <CheckCheck size={14} /> Acknowledge all
          </Button>
          {quota && (
            <Link href="/settings">
              <Button variant="primary" size="md">
                <SlidersHorizontal size={14} /> Alert rules
              </Button>
            </Link>
          )}
        </div>
      </div>

      <StatStrip
        items={[
          { label: "Open", value: open, tone: "var(--warning)" },
          { label: "Critical", value: critical, tone: "var(--danger)" },
          { label: "Resolved", value: resolved, tone: "var(--success)" },
          { label: "In your scope", value: visible.length, tone: "var(--ink)" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          <Card className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Segmented
                options={[
                  { value: "all", label: "All" },
                  { value: "open", label: "Open", icon: <Bell size={11} /> },
                  { value: "acknowledged", label: "Acknowledged" },
                  { value: "resolved", label: "Resolved" },
                ]}
                value={status}
                onChange={(v) => setStatus(v as typeof status)}
              />
              <div className="ml-auto flex items-center gap-1.5">
                <Select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as typeof severity)}
                  className="h-8 w-[124px] text-[11px]"
                  aria-label="Severity"
                >
                  <option value="all">All severities</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </Select>
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value as typeof type)}
                  className="h-8 w-[148px] text-[11px]"
                  aria-label="Alert type"
                >
                  <option value="all">All types</option>
                  {Object.entries(ALERT_TYPE_META).map(([k, v]) => (
                    <option key={k} value={k}>
                      {v.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          </Card>

          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={<BellOff size={19} />}
                title="No alerts in this view"
                description="Everything in this category has been resolved, or the filters are too narrow. Adjust them to see the full exception list."
                action={
                  <Button size="sm" variant="secondary" onClick={() => { setStatus("all"); setSeverity("all"); setType("all"); }}>
                    Reset filters
                  </Button>
                }
              />
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((alert) => {
                const meta = ALERT_TYPE_META[alert.type];
                const Icon = ICONS[alert.type];
                const sev = SEVERITY_TONE[alert.severity];
                const resolved = alert.status === "resolved";
                return (
                  <Card
                    key={alert.id}
                    className={cn(
                      "overflow-hidden p-0 transition-colors",
                      resolved && "opacity-65",
                    )}
                  >
                    <div className="flex gap-3 p-3.5">
                      <span className={cn("mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[9px]", sev.bg)}>
                        <Icon size={15} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <p className="text-[12.5px] font-semibold text-ink">{alert.title}</p>
                              <Badge tone={sev.tone} size="xs">
                                {alert.severity}
                              </Badge>
                              <Badge tone="neutral" size="xs">
                                {meta.label}
                              </Badge>
                              {alert.status !== "open" && (
                                <Badge tone={resolved ? "success" : "info"} size="xs">
                                  {alert.status}
                                </Badge>
                              )}
                            </div>
                            <p className="mt-1.5 text-[11px] leading-[1.6] text-muted">{alert.message}</p>
                          </div>
                          <span className="shrink-0 font-mono text-[9px] text-faint">
                            {relativeTime(alert.createdAt)}
                          </span>
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center gap-2">
                          <Link
                            href={`/bills/${alert.billId}`}
                            className="flex items-center gap-1 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] text-brand transition-colors hover:bg-brand-soft"
                          >
                            {alert.billId} <ArrowRight size={9} />
                          </Link>
                          <span className="font-mono text-[9px] text-faint">
                            {formatDateTime(alert.createdAt)}
                          </span>
                          {alert.dueAt && (
                            <span className="font-mono text-[9px] text-faint">
                              · due {formatDate(alert.dueAt)}
                            </span>
                          )}
                          <div className="ml-auto flex items-center gap-1.5">
                            {alert.status === "open" && (
                              <Button size="sm" variant="ghost" onClick={() => acknowledgeAlert(alert.id)}>
                                <Check size={11} /> Acknowledge
                              </Button>
                            )}
                            {!resolved && (
                              <Button size="sm" variant="secondary" onClick={() => resolveAlert(alert.id)}>
                                Resolve
                              </Button>
                            )}
                            <Link href={`/bills/${alert.billId}`}>
                              <Button size="sm" variant="primary">
                                Open bill
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Card className="overflow-hidden">
            <CardHeader eyebrow="Configuration" title="Alert rules" subtitle="Configurable by administrators — no code change required." />
            <div className="divide-y divide-line">
              {[
                { label: "Committee reminder (Senate)", value: "45 days" },
                { label: "Committee reminder (NA)", value: "23 days" },
                { label: "Transmission limit", value: "90 days" },
                { label: "Ministry response window", value: "30 days" },
                { label: "Assent escalation", value: "7 days" },
                { label: "Gazette follow-up", value: "15 days" },
              ].map((rule) => (
                <div key={rule.label} className="flex items-center justify-between px-4 py-2">
                  <span className="text-[10.5px] text-ink-2">{rule.label}</span>
                  <span className="num rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[9.5px] font-medium text-muted">
                    {rule.value}
                  </span>
                </div>
              ))}
            </div>
            {quota && (
              <div className="border-t border-line p-3">
                <Link href="/settings">
                  <Button size="sm" variant="secondary" className="w-full">
                    <Settings2 size={12} /> Manage rules
                  </Button>
                </Link>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <p className="eyebrow">Delivery</p>
            <div className="mt-3 space-y-2">
              {[
                { icon: Bell, label: "In-portal action list", state: "Active" },
                { icon: Mail, label: "Email to focal persons", state: "Active" },
                { icon: ShieldAlert, label: "Secretary escalation", state: "Critical only" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2.5 rounded-[9px] border border-line bg-surface-2 px-2.5 py-2">
                  <row.icon size={12} className="text-muted" />
                  <span className="min-w-0 flex-1 truncate text-[10.5px] text-ink-2">{row.label}</span>
                  <span className="shrink-0 font-mono text-[8.5px] uppercase tracking-[0.1em] text-success">
                    {row.state}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-surface-2 p-4">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-ink">
              <Info size={12} className="text-brand" /> Why escalations matter
            </p>
            <p className="mt-1 text-[9.5px] leading-[1.7] text-muted">
              A bill that lapses its 90-day transmission window must be referred to Joint Sitting. Early
              escalation is the difference between a scheduled referral and a constitutional breach.
            </p>
            <div className="mt-2 flex items-center gap-1.5">
              <AlertTriangle size={11} className="text-warning" />
              <span className="text-[9px] text-warning">
                {critical} critical item{critical === 1 ? "" : "s"} in your scope
              </span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

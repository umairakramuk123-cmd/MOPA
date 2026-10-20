"use client";

import * as React from "react";
import Link from "next/link";
import { cn, formatDate, formatDateTime, formatTime, relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import { AUDIT } from "@/lib/data";
import { ROLES } from "@/lib/roles";
import { AuditEntry } from "@/lib/types";
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, Select } from "@/components/ui/primitives";
import { StatStrip } from "@/components/kpi";
import {
  ChevronDown,
  Clock3,
  Download,
  FileText,
  Fingerprint,
  History,
  Info,
  Lock,
  Search,
  ShieldCheck,
} from "lucide-react";

const ACTION_TONE: Record<string, string> = {
  "Bill registered": "bg-brand-soft text-brand",
  "Stage updated": "bg-info-soft text-info",
  "User invited": "bg-violet-soft text-violet",
  "Alert rule updated": "bg-warning-soft text-warning",
  "Endorsement approved": "bg-success-soft text-success",
  "Document uploaded": "bg-surface-3 text-ink-2",
  "Legal review recorded": "bg-info-soft text-info",
  "Role permissions changed": "bg-violet-soft text-violet",
  "Stage update rejected": "bg-danger-soft text-danger",
  "Export generated": "bg-surface-3 text-ink-2",
  "Ministry stance submitted": "bg-gold-soft text-gold",
};

export function AuditView() {
  const { toast, session } = useStore();
  const [query, setQuery] = React.useState("");
  const [action, setAction] = React.useState("all");
  const [actor, setActor] = React.useState("all");
  const [expanded, setExpanded] = React.useState<string | null>(AUDIT[0]?.id ?? null);

  const actions = Array.from(new Set(AUDIT.map((a) => a.action)));
  const actors = Array.from(new Set(AUDIT.map((a) => a.actor)));

  const filtered = AUDIT.filter((e) => {
    if (action !== "all" && e.action !== action) return false;
    if (actor !== "all" && e.actor !== actor) return false;
    if (query && !`${e.actor} ${e.entityId} ${e.action} ${e.reason ?? ""}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const grouped = filtered.reduce<Record<string, AuditEntry[]>>((acc, entry) => {
    const key = entry.at.slice(0, 10);
    acc[key] = acc[key] ?? [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">Audit trail · BRD §8</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
            Every change, on the record
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-5 text-muted">
            Old value, new value, user ID, exact timestamp and reason for change. The log is read-only and
            cannot be altered by regular users — only viewed by administrators.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone="neutral">
            <Lock size={9} /> Immutable
          </Badge>
          <Button
            variant="secondary"
            size="md"
            onClick={() =>
              toast({
                title: "Audit extract generated",
                description: `${filtered.length} entries · SHA-256 sealed export.`,
                tone: "success",
              })
            }
          >
            <Download size={13} /> Export extract
          </Button>
        </div>
      </div>

      <StatStrip
        items={[
          { label: "Entries retained", value: AUDIT.length, tone: "var(--ink)" },
          { label: "Active actors", value: actors.length, tone: "var(--chart-4)" },
          { label: "Change types", value: actions.length, tone: "var(--chart-1)" },
          { label: "Retention", value: "Permanent", tone: "var(--brand)" },
        ]}
      />

      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[190px] flex-1">
            <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search actor, bill ID or reason…"
              className="field h-8 pl-8 text-[11.5px]"
            />
          </div>
          <Select value={action} onChange={(e) => setAction(e.target.value)} className="h-8 w-[190px] text-[11px]" aria-label="Action">
            <option value="all">All actions</option>
            {actions.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </Select>
          <Select value={actor} onChange={(e) => setActor(e.target.value)} className="h-8 w-[160px] text-[11px]" aria-label="Actor">
            <option value="all">All actors</option>
            {actors.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </Select>
          <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
            {filtered.length} entries
          </span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {filtered.length === 0 && (
            <Card>
              <EmptyState
                icon={<History size={18} />}
                title="No audit entries match"
                description="Adjust the filters to review a different window. The full trail is retained permanently."
              />
            </Card>
          )}

          {Object.entries(grouped).map(([day, entries]) => (
            <div key={day}>
              <div className="mb-2 flex items-center gap-2 px-0.5">
                <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-faint">
                  {formatDate(day, { weekday: "short" })}
                </span>
                <span className="h-px flex-1 bg-line" />
                <span className="num font-mono text-[9px] text-faint">{entries.length}</span>
              </div>
              <Card className="overflow-hidden">
                {entries.map((entry) => {
                  const isOpen = expanded === entry.id;
                  const tone = ACTION_TONE[entry.action] ?? "bg-surface-3 text-ink-2";
                  const role = ROLES[entry.actorRole];
                  return (
                    <div key={entry.id} className="border-b border-line last:border-0">
                      <button
                        onClick={() => setExpanded(isOpen ? null : entry.id)}
                        className="flex w-full items-center gap-3 px-3.5 py-2.5 text-left transition-colors hover:bg-surface-2"
                      >
                        <span className="w-[38px] shrink-0 font-mono text-[9px] text-faint">{formatTime(entry.at)}</span>
                        <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-[7px]", tone)}>
                          <FileText size={12} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-medium text-ink">{entry.action}</span>
                            {entry.entity === "Bill" ? (
                              <Link
                                href={`/bills/${entry.entityId}`}
                                onClick={(e) => e.stopPropagation()}
                                className="num font-mono text-[8.5px] text-brand hover:underline"
                              >
                                {entry.entityId}
                              </Link>
                            ) : (
                              <span className="truncate font-mono text-[8.5px] text-faint">{entry.entityId}</span>
                            )}
                          </div>
                          <p className="mt-0.5 truncate text-[9.5px] text-muted">
                            {entry.actor} · {role.short} · {entry.ip}
                          </p>
                        </div>
                        <ChevronDown
                          size={13}
                          className={cn("shrink-0 text-faint transition-transform", isOpen && "rotate-180")}
                        />
                      </button>
                      {isOpen && (
                        <div className="animate-rise border-t border-line bg-surface-2 px-3.5 py-3">
                          <div className="grid gap-2 sm:grid-cols-3">
                            <div>
                              <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-faint">Before</p>
                              <p className="mt-1 rounded border border-line bg-surface px-2 py-1 font-mono text-[9.5px] text-muted">
                                {entry.before ?? "—"}
                              </p>
                            </div>
                            <div>
                              <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-faint">After</p>
                              <p className="mt-1 rounded border border-brand/20 bg-brand-soft px-2 py-1 font-mono text-[9.5px] text-brand-ink">
                                {entry.after ?? "—"}
                              </p>
                            </div>
                            <div>
                              <p className="font-mono text-[8px] uppercase tracking-[0.12em] text-faint">Timestamp</p>
                              <p className="mt-1 text-[9.5px] text-ink-2">{formatDateTime(entry.at)}</p>
                            </div>
                          </div>
                          {entry.reason && (
                            <div className="mt-2 flex items-start gap-1.5 rounded border border-line bg-surface p-2">
                              <Info size={10} className="mt-0.5 shrink-0 text-faint" />
                              <p className="text-[9.5px] leading-[1.6] text-muted">{entry.reason}</p>
                            </div>
                          )}
                          <div className="mt-2 flex items-center gap-2">
                            <Avatar name={entry.actor} size={16} />
                            <span className="text-[9px] text-faint">
                              Digitally attributed to {entry.actor} ({entry.actorRole})
                            </span>
                            <span className="ml-auto flex items-center gap-1 font-mono text-[8px] text-success">
                              <ShieldCheck size={9} /> hash verified
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </Card>
            </div>
          ))}
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Card className="overflow-hidden">
            <CardHeader eyebrow="Activity" title="Change types" subtitle="Distribution across the trail." />
            <div className="space-y-2 p-4">
              {actions.slice(0, 6).map((a) => {
                const count = AUDIT.filter((e) => e.action === a).length;
                return (
                  <div key={a}>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="truncate text-ink-2">{a}</span>
                      <span className="num ml-2 shrink-0 font-mono text-[9px] text-faint">{count}</span>
                    </div>
                    <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-3">
                      <div
                        className="h-full rounded-full bg-brand/70"
                        style={{ width: `${(count / AUDIT.length) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <p className="eyebrow">Integrity</p>
            <div className="mt-2.5 space-y-2">
              {[
                { icon: Lock, label: "Append-only storage", note: "Updates and deletes blocked" },
                { icon: Fingerprint, label: "User attribution", note: "ID, role and IP retained" },
                { icon: ShieldCheck, label: "Hash verification", note: "Tamper-evident entries" },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-2 rounded-[9px] border border-line bg-surface-2 px-2.5 py-2">
                  <row.icon size={12} className="mt-0.5 shrink-0 text-brand" />
                  <div>
                    <p className="text-[10px] font-medium text-ink">{row.label}</p>
                    <p className="text-[8.5px] text-faint">{row.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2.5 text-[9px] leading-[1.6] text-faint">
              Only Administrators can view this trail. Retention is permanent per the BRD compliance
              requirements.
            </p>
          </Card>

          <Card className="bg-surface-2 p-4">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-ink">
              <Clock3 size={12} className="text-brand" /> Last reviewed
            </p>
            <p className="mt-1 text-[9.5px] leading-[1.6] text-muted">
              {session.user.name} · {relativeTime(AUDIT[0].at)}. Quarterly access reviews are recorded as
              their own audit entries.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

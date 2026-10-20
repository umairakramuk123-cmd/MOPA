"use client";

import * as React from "react";
import Link from "next/link";
import { cn, SYSTEM_DATE } from "@/lib/format";
import { useStore } from "@/lib/store";
import { MINISTRIES } from "@/lib/data";
import { ministryStats } from "@/lib/metrics";
import type { Ministry } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Progress,
  Segmented,
} from "@/components/ui/primitives";
import { StatStrip } from "@/components/kpi";
import { Drawer } from "@/components/ui/overlay";
import { MinistryBars } from "@/components/charts";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Mail,
  MapPin,
  MessageSquareReply,
  Phone,
  Search,
  UserRound,
  Users,
} from "lucide-react";

export function MinistriesView() {
  const { bills } = useStore();
  const [query, setQuery] = React.useState("");
  const [sort, setSort] = React.useState<"total" | "overdue" | "responses">("total");
  const [selected, setSelected] = React.useState<Ministry | null>(null);

  const stats = ministryStats(bills);
  const filtered = stats
    .filter((m) => `${m.name} ${m.code} ${m.focalPerson}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === "overdue") return b.overdue - a.overdue;
      if (sort === "responses") return b.pendingResponses - a.pendingResponses;
      return b.total - a.total;
    });

  const pending = stats.reduce((s, m) => s + m.pendingResponses, 0);
  const overdue = stats.reduce((s, m) => s + m.overdue, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">Directory</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
            Ministries &amp; Divisions
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-5 text-muted">
            Who is sponsoring what, which division owes a response, and where the committee clocks are
            running out.
          </p>
        </div>
        <Segmented
          options={[
            { value: "total", label: "By workload" },
            { value: "overdue", label: "By breaches" },
            { value: "responses", label: "By responses" },
          ]}
          value={sort}
          onChange={(v) => setSort(v as typeof sort)}
          size="md"
        />
      </div>

      <StatStrip
        items={[
          { label: "Divisions", value: MINISTRIES.length, tone: "var(--ink)" },
          { label: "Bills sponsored", value: bills.length, tone: "var(--chart-1)" },
          { label: "Pending responses", value: pending, tone: "var(--warning)" },
          { label: "Overdue items", value: overdue, tone: "var(--danger)" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          <Card className="p-2.5">
            <div className="relative">
              <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search divisions, codes or focal persons…"
                className="field h-9 pl-8 text-[12px]"
              />
            </div>
          </Card>

          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((m) => (
              <Card key={m.id} hover className="group cursor-pointer p-3.5" onClick={() => setSelected(m)}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded-[10px] border border-line bg-surface-2 text-muted">
                      <Building2 size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold text-ink">{m.short}</p>
                      <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-faint">{m.code}</p>
                    </div>
                  </div>
                  <span className="num text-[20px] font-semibold tracking-[-0.05em] text-ink">{m.total}</span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { label: "Active", value: m.active, tone: "text-ink" },
                    { label: "Assented", value: m.assented, tone: "text-success" },
                    { label: "Overdue", value: m.overdue, tone: m.overdue > 0 ? "text-danger" : "text-faint" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-faint">{s.label}</p>
                      <p className={cn("num text-[13px] font-semibold", s.tone)}>{s.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-2.5">
                  <div className="flex items-center justify-between text-[8.5px] text-faint">
                    <span>Share of registry</span>
                    <span className="num">{Math.round((m.total / bills.length) * 100)}%</span>
                  </div>
                  <Progress value={(m.total / bills.length) * 100} className="mt-1" height={3} />
                </div>

                <div className="mt-2.5 flex items-center justify-between border-t border-line pt-2">
                  <span className="truncate text-[9px] text-muted">{m.focalPerson}</span>
                  {m.pendingResponses > 0 ? (
                    <Badge tone="warning" size="xs">
                      {m.pendingResponses} response{m.pendingResponses === 1 ? "" : "s"} due
                    </Badge>
                  ) : (
                    <span className="font-mono text-[8.5px] text-success">clear</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4 lg:col-span-4">
          <MinistryBars data={stats.map((m) => ({ short: m.short, total: m.total, overdue: m.overdue }))} />
          <Card className="overflow-hidden">
            <CardHeader eyebrow="Attention" title="Response queue" subtitle="Private Members' Bills awaiting a division view." />
            <div className="divide-y divide-line">
              {stats
                .filter((m) => m.pendingResponses > 0)
                .slice(0, 5)
                .map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelected(m)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-surface-2"
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-warning-soft text-warning">
                      <MessageSquareReply size={11} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[10.5px] font-medium text-ink">{m.short}</span>
                      <span className="block text-[8.5px] text-faint">{m.pendingResponses} response(s) outstanding</span>
                    </span>
                    <ChevronRight size={12} className="shrink-0 text-faint" />
                  </button>
                ))}
              {stats.every((m) => m.pendingResponses === 0) && (
                <p className="px-4 py-6 text-center text-[10.5px] text-success">All responses filed.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      <MinistryDrawer ministry={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function MinistryDrawer({ ministry, onClose }: { ministry: (Ministry & { total?: number }) | null; onClose: () => void }) {
  const { bills } = useStore();
  const stat = ministry ? ministryStats(bills).find((m) => m.id === ministry.id) : null;
  const own = ministry ? bills.filter((b) => b.ministryId === ministry.id) : [];

  return (
    <Drawer
      open={!!ministry}
      onClose={onClose}
      eyebrow={ministry?.code ?? ""}
      title={ministry?.name ?? ""}
      description="Division profile, workload and outstanding legislative actions."
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            <Mail size={12} /> Email focal person
          </Button>
        </>
      }
    >
      {ministry && stat && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Bills", value: stat.total },
              { label: "Pending replies", value: stat.pendingResponses },
              { label: "Overdue", value: stat.overdue },
            ].map((s) => (
              <div key={s.label} className="rounded-[10px] border border-line bg-surface-2 p-2.5">
                <p className="font-mono text-[8px] uppercase tracking-[0.1em] text-faint">{s.label}</p>
                <p className="num mt-1 text-[18px] font-semibold tracking-[-0.04em] text-ink">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2 rounded-[11px] border border-line p-3">
            <p className="eyebrow">Focal person</p>
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft text-brand">
                <UserRound size={14} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-medium text-ink">{ministry.focalPerson}</p>
                <p className="truncate text-[9px] text-faint">Legislative focal person</p>
              </div>
            </div>
            <div className="space-y-1 pt-1">
              <p className="flex items-center gap-1.5 text-[9.5px] text-muted">
                <Mail size={10} className="text-faint" /> {ministry.email}
              </p>
              <p className="flex items-center gap-1.5 text-[9.5px] text-muted">
                <Phone size={10} className="text-faint" /> {ministry.phone}
              </p>
              <p className="flex items-center gap-1.5 text-[9.5px] text-muted">
                <MapPin size={10} className="text-faint" /> {ministry.contact}
              </p>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="eyebrow">Sponsored bills</p>
              <Link href="/bills" className="text-[9.5px] font-medium text-brand hover:underline">
                Registry
              </Link>
            </div>
            <div className="space-y-1.5">
              {own.slice(0, 6).map((bill) => (
                <Link
                  key={bill.id}
                  href={`/bills/${bill.id}`}
                  className="flex items-center gap-2 rounded-[9px] border border-line px-2.5 py-2 transition-colors hover:bg-surface-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-medium text-ink">{bill.shortTitle}</p>
                    <p className="font-mono text-[8.5px] text-faint">
                      {bill.id} · {bill.house} · {bill.outcome}
                    </p>
                  </div>
                  <ArrowRight size={11} className="shrink-0 text-faint" />
                </Link>
              ))}
              {own.length === 0 && <p className="text-[10px] text-muted">No bills sponsored in this session.</p>}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-[10px] border border-line bg-surface-2 p-2.5">
            <Users size={12} className="mt-0.5 shrink-0 text-faint" />
            <p className="text-[9px] leading-[1.6] text-muted">
              Divisions see only their own bills and can file responses — they cannot edit stage records.
              Data as of {SYSTEM_DATE.toISOString().slice(0, 10)}.
            </p>
          </div>
        </div>
      )}
    </Drawer>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { overview } from "@/lib/metrics";
import { can } from "@/lib/roles";
import { SESSION } from "@/lib/data";
import { WORKFLOW_META } from "@/lib/workflows";
import { Badge, Button, Card, SectionHeader } from "@/components/ui/primitives";
import { StatStrip } from "@/components/kpi";
import { BillTable } from "@/components/BillTable";
import {
  ArrowRight,
  FilePlus2,
  Download,
  ShieldQuestion,
  Stamp,
  ScrollText,
  Layers,
  GitBranch,
  CircleDot,
} from "lucide-react";

export function BillsRegistryView() {
  const { bills, session } = useStore();
  const stats = overview(bills);
  const role = session.role;
  const pendingResponses = bills.filter((b) => b.ministryStance === "pending");

  return (
    <div className="space-y-5">
      <SectionHeader
        eyebrow="Legislative registry"
        title="Bills, end to end"
        description={`${stats.total} bills registered for the ${SESSION.name}. Each record carries a unique system-generated ID, stage history, documents and an immutable audit trail.`}
        actions={
          <>
            <Button variant="secondary" onClick={() => window.print()}>
              <Download size={14} /> Export registry
            </Button>
            {can(role, "bills.create") && (
              <Link href="/bills/new">
                <Button variant="primary">
                  <FilePlus2 size={14} /> Register new bill
                </Button>
              </Link>
            )}
          </>
        }
      />

      {role.scope === "ministry" && (
        <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-info/25 bg-info-soft px-3.5 py-2.5">
          <ShieldQuestion size={13} className="shrink-0 text-info" />
          <p className="text-[10.5px] text-info">
            You are signed in as a division user — only bills sponsored by or referred to your division
            are visible. Records outside this scope are filtered server-side.
          </p>
          <Badge tone="info" size="xs" className="ml-auto">
            scoped
          </Badge>
        </div>
      )}

      <StatStrip
        items={[
          { label: "Official bills", value: stats.official, tone: "var(--chart-1)" },
          { label: "Private members'", value: stats.private, tone: "var(--chart-3)" },
          { label: "Joint sitting", value: stats.joint, tone: "var(--chart-5)" },
          { label: "Awaiting assent", value: stats.awaitingAssent, tone: "var(--ink)" },
        ]}
      />

      <div className="grid gap-3 lg:grid-cols-3">
        {(["official", "private", "joint"] as const).map((type) => {
          const meta = WORKFLOW_META[type];
          const count = bills.filter((b) => b.type === type).length;
          const active = bills.filter((b) => b.type === type && b.outcome === "in-progress").length;
          return (
            <Card key={type} hover className="group p-4">
              <div className="flex items-start justify-between">
                <span
                  className="grid h-8 w-8 place-items-center rounded-[9px]"
                  style={{ background: `color-mix(in oklab, ${meta.color} 14%, transparent)`, color: meta.color }}
                >
                  {type === "official" ? <Layers size={15} /> : type === "private" ? <ScrollText size={15} /> : <GitBranch size={15} />}
                </span>
                <span className="num text-[22px] font-semibold tracking-[-0.05em] text-ink">{count}</span>
              </div>
              <p className="mt-3 text-[12.5px] font-semibold text-ink">{meta.label}</p>
              <p className="mt-0.5 text-[10px] text-muted">{meta.sub} · {active} active</p>
              <p className="mt-2 text-[10px] leading-4 text-faint">{meta.houseRules}</p>
              <Link
                href={`/tracking?type=${type}`}
                className="mt-3 flex items-center gap-1 text-[10.5px] font-medium text-brand group-hover:underline"
              >
                View workflow <ArrowRight size={11} />
              </Link>
            </Card>
          );
        })}
      </div>

      {pendingResponses.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-warning/25 bg-warning-soft px-4 py-3">
          <div className="flex items-start gap-2.5">
            <ShieldQuestion size={16} className="mt-0.5 shrink-0 text-warning" />
            <div>
              <p className="text-[12px] font-semibold text-warning">
                {pendingResponses.length} Ministry responses outstanding
              </p>
              <p className="mt-0.5 text-[10.5px] leading-4 text-warning/80">
                Article 74 stance or Cabinet consent has not been recorded for these Private Members&apos; Bills.
                They are flagged in the ageing report until a response is filed.
              </p>
            </div>
          </div>
          <Link href="/alerts">
            <Button size="sm" variant="secondary">
              Review queue <ArrowRight size={12} />
            </Button>
          </Link>
        </div>
      )}

      <BillTable bills={bills} pageSize={12} />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: ScrollText, label: "Unique Bill ID", text: "System-generated primary key linking data, documents, alerts and history." },
          { icon: CircleDot, label: "Duplicate detection", text: "Title, sponsor, House and year are matched before a record can be created." },
          { icon: Stamp, label: "Mandatory date + reference", text: "Stage updates require a date and a supporting document or a logged reason." },
          { icon: Layers, label: "Three workflows", text: "Official, Private Members' and Joint Sitting templates with independent stages." },
        ].map((f) => (
          <div key={f.label} className="rounded-[13px] border border-line bg-surface-2 p-3.5">
            <f.icon size={15} className="text-brand" />
            <p className="mt-2 text-[11.5px] font-semibold text-ink">{f.label}</p>
            <p className="mt-0.5 text-[10px] leading-[1.6] text-muted">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

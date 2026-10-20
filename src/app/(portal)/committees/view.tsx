"use client";

import * as React from "react";
import Link from "next/link";
import { cn, daysBetween, formatDate, SYSTEM_DATE } from "@/lib/format";
import { useStore } from "@/lib/store";
import { ministryShort } from "@/lib/data";
import { deadlineState, isCommitteeStage } from "@/lib/metrics";
import { COMMITTEE_LIMITS } from "@/lib/workflows";
import { Bill } from "@/lib/types";
import { Badge, Button, Card, CardHeader, EmptyState, Progress, Segmented } from "@/components/ui/primitives";
import { StatStrip } from "@/components/kpi";
import { DeadlineChip, HouseChip, StageBadge } from "@/components/ui/bill-bits";
import { Modal } from "@/components/ui/overlay";
import {
  AlertTriangle,
  CalendarDays,
  Check,
  ClipboardCheck,
  Clock3,
  FileText,
  Gavel,
  Info,
  MessageSquare,
  UsersRound,
} from "lucide-react";

export function CommitteesView() {
  const { bills, toast } = useStore();
  const [house, setHouse] = React.useState<"all" | "NA" | "Senate" | "Joint">("all");
  const [filter, setFilter] = React.useState<"all" | "overdue" | "approaching">("all");
  const [meetOpen, setMeetOpen] = React.useState<Bill | null>(null);

  const committeeBills = bills.filter(isCommitteeStage);
  const scoped = committeeBills.filter((b) => {
    if (house !== "all" && b.house !== house) return false;
    if (filter === "overdue") return deadlineState(b) === "overdue";
    if (filter === "approaching") return deadlineState(b) === "due-soon";
    return true;
  });

  const overdue = committeeBills.filter((b) => deadlineState(b) === "overdue").length;
  const approaching = committeeBills.filter((b) => deadlineState(b) === "due-soon").length;
  const avgElapsed = Math.round(
    committeeBills.reduce((sum, b) => sum + Math.max(0, daysBetween(b.stageEnteredAt, SYSTEM_DATE)), 0) /
      Math.max(1, committeeBills.length),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">Committees · BRD §8</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
            Standing Committee clocks
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-5 text-muted">
            Elapsed days are calculated automatically on entry to committee — 60 days for the Senate,
            30 for the National Assembly, with escalating reminders before each limit.
          </p>
        </div>
        <Segmented
          options={[
            { value: "all", label: "All Houses" },
            { value: "NA", label: "National Assembly" },
            { value: "Senate", label: "Senate" },
            { value: "Joint", label: "Joint" },
          ]}
          value={house}
          onChange={(v) => setHouse(v as typeof house)}
          size="md"
        />
      </div>

      <StatStrip
        items={[
          { label: "Under review", value: committeeBills.length, tone: "var(--chart-4)" },
          { label: "Past the limit", value: overdue, tone: "var(--danger)" },
          { label: "Due within 7 days", value: approaching, tone: "var(--warning)" },
          { label: "Average elapsed", value: `${avgElapsed}d`, hint: "at stage", tone: "var(--ink)" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="overflow-hidden lg:col-span-8">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line p-4">
            <div>
              <p className="text-[13px] font-semibold text-ink">Committee pendency</p>
              <p className="mt-0.5 text-[10.5px] text-muted">
                {scoped.length} of {committeeBills.length} referrals shown
              </p>
            </div>
            <Segmented
              options={[
                { value: "all", label: "All" },
                { value: "overdue", label: "Overdue" },
                { value: "approaching", label: "Approaching" },
              ]}
              value={filter}
              onChange={(v) => setFilter(v as typeof filter)}
            />
          </div>

          {scoped.length === 0 ? (
            <EmptyState
              icon={<UsersRound size={18} />}
              title="No referrals in this view"
              description="Every committee referral under this filter has been reported out, or the filter is too narrow."
              action={
                <Button size="sm" variant="secondary" onClick={() => { setFilter("all"); setHouse("all"); }}>
                  Reset filters
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-line">
              {scoped.map((bill) => {
                const limit = bill.house === "Senate" ? COMMITTEE_LIMITS.Senate : COMMITTEE_LIMITS.NA;
                const elapsed = Math.max(0, daysBetween(bill.stageEnteredAt, SYSTEM_DATE));
                const percent = Math.min(100, Math.round((elapsed / limit) * 100));
                const state = deadlineState(bill);
                return (
                  <div key={bill.id} className="group p-4 transition-colors hover:bg-surface-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="num font-mono text-[9px] text-faint">{bill.id}</span>
                          <HouseChip house={bill.house} />
                          <StageBadge bill={bill} />
                          {state === "overdue" && (
                            <Badge tone="danger" size="xs" dot>
                              Overdue
                            </Badge>
                          )}
                        </div>
                        <Link
                          href={`/bills/${bill.id}`}
                          className="mt-1 block text-[12.5px] font-medium text-ink hover:text-brand-ink"
                        >
                          {bill.shortTitle}
                        </Link>
                        <p className="mt-0.5 text-[9.5px] text-muted">
                          Referred {formatDate(bill.stageEnteredAt)} · {ministryShort(bill.ministryId)} ·{" "}
                          {bill.memberInCharge}
                        </p>
                      </div>
                      <DeadlineChip dueAt={bill.committeeDueAt} compact />
                    </div>

                    <div className="mt-2.5 flex items-center gap-3">
                      <Progress
                        value={percent}
                        tone={state === "overdue" ? "danger" : state === "due-soon" ? "warning" : "brand"}
                        height={5}
                        className="flex-1"
                      />
                      <span className="num shrink-0 font-mono text-[9px] text-muted">
                        {elapsed}/{limit} days
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setMeetOpen(bill)}
                        className="shrink-0"
                      >
                        <CalendarDays size={11} /> Record meeting
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        <div className="space-y-4 lg:col-span-4">
          <Card className="overflow-hidden">
            <CardHeader
              eyebrow="Health"
              title="Committee load by House"
              subtitle="Referrals and breaches at a glance."
            />
            <div className="space-y-3 p-4">
              {(["NA", "Senate", "Joint"] as const).map((h) => {
                const own = committeeBills.filter((b) => b.house === h);
                const bad = own.filter((b) => deadlineState(b) === "overdue").length;
                const label = h === "NA" ? "National Assembly" : h === "Senate" ? "Senate" : "Joint Sitting";
                return (
                  <div key={h}>
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-medium text-ink">{label}</span>
                      <span className="flex items-center gap-1.5">
                        <span className="num text-[12px] font-semibold text-ink">{own.length}</span>
                        {bad > 0 && <Badge tone="danger" size="xs">{bad} late</Badge>}
                      </span>
                    </div>
                    <Progress
                      value={Math.round((own.length / Math.max(1, committeeBills.length)) * 100)}
                      tone={bad > 0 ? "danger" : "brand"}
                      className="mt-1.5"
                      height={4}
                    />
                  </div>
                );
              })}
              <div className="flex items-start gap-2 rounded-[10px] border border-line bg-surface-2 p-2.5">
                <Info size={12} className="mt-0.5 shrink-0 text-faint" />
                <p className="text-[9.5px] leading-[1.6] text-muted">
                  Delay at committee level is recorded separately and feeds the Bill Ageing &amp; Delay
                  Report (Report 12).
                </p>
              </div>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader eyebrow="Notifications" title="Milestone alerts" subtitle="Generated automatically at each threshold." />
            <div className="divide-y divide-line">
              {[
                { icon: Clock3, label: "Reminder — 7 days before limit", tone: "text-warning" },
                { icon: AlertTriangle, label: "Overdue — limit exceeded", tone: "text-danger" },
                { icon: FileText, label: "Report presented in House", tone: "text-info" },
                { icon: MessageSquare, label: "Extension recorded with reason", tone: "text-muted" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2.5 px-4 py-2.5">
                  <row.icon size={12} className={row.tone} />
                  <span className="text-[10.5px] text-ink-2">{row.label}</span>
                  <Check size={11} className="ml-auto text-success" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-surface-2 p-4">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-ink">
              <Gavel size={12} className="text-brand" /> Rulings &amp; records
            </p>
            <p className="mt-1 text-[9.5px] leading-[1.65] text-muted">
              Speaker&apos;s rulings, Chairman Senate decisions and committee report status are logged as
              formal decisions — separate from routine stage dates.
            </p>
          </Card>
        </div>
      </div>

      <MeetingModal bill={meetOpen} onClose={() => setMeetOpen(null)} onSave={() => {
        toast({
          title: "Meeting recorded",
          description: `${meetOpen?.id} · committee meeting logged with date and reference. Delay clock updated.`,
          tone: "success",
        });
        setMeetOpen(null);
      }} />
    </div>
  );
}

function MeetingModal({ bill, onClose, onSave }: { bill: Bill | null; onClose: () => void; onSave: () => void }) {
  const [date, setDate] = React.useState("2026-10-20");
  const [reference, setReference] = React.useState("");
  const [outcome, setOutcome] = React.useState("deliberated");
  const [note, setNote] = React.useState("");

  return (
    <Modal
      open={!!bill}
      onClose={onClose}
      eyebrow="Committee record"
      title="Record a committee meeting"
      description={bill ? `${bill.id} · ${bill.shortTitle}` : ""}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={onSave} disabled={!date || !reference}>
            <Check size={12} /> Save meeting
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-ink-2">
              Meeting date <span className="text-danger">*</span>
            </span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field h-10 text-[12px]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-ink-2">
              Minute reference <span className="text-danger">*</span>
            </span>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="SC/NA/2026/MTG-14"
              className="field h-10 text-[12px]"
            />
          </label>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-medium text-ink-2">Committee outcome</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { key: "deliberated", label: "Deliberated — no report" },
              { key: "report-adopted", label: "Report adopted" },
              { key: "extension", label: "Extension sought" },
              { key: "deferred", label: "Deferred to next meeting" },
            ].map((o) => (
              <button
                key={o.key}
                onClick={() => setOutcome(o.key)}
                className={cn(
                  "rounded-[9px] border px-2.5 py-2 text-left text-[10.5px] transition-colors",
                  outcome === o.key
                    ? "border-brand bg-brand-soft font-medium text-brand-ink"
                    : "border-line text-ink-2 hover:border-line-strong",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Minutes note</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Attendance, evidence received and any direction issued to the Ministry…"
            className="field h-auto min-h-[76px] py-2 text-[12px]"
          />
        </label>

        <div className="flex items-start gap-2 rounded-[9px] border border-line bg-surface-2 p-2.5">
          <ClipboardCheck size={12} className="mt-0.5 shrink-0 text-brand" />
          <p className="text-[9.5px] leading-[1.6] text-muted">
            A meeting entry resets the delay flag but does not stop the statutory clock. The 60 / 30-day
            limit remains visible on the dashboard.
          </p>
        </div>
      </div>
    </Modal>
  );
}

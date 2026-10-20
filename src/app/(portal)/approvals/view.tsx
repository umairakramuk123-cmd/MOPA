"use client";

import * as React from "react";
import Link from "next/link";
import { cn, formatDateTime, relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import { can } from "@/lib/roles";
import type { ApprovalRequest } from "@/lib/types";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  Segmented,
} from "@/components/ui/primitives";
import { StatStrip } from "@/components/kpi";
import { Modal } from "@/components/ui/overlay";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCheck,
  ChevronRight,
  Clock3,
  FileSignature,
  Info,
  RotateCcw,
  ShieldCheck,
  Stamp,
  X,
} from "lucide-react";

const KIND_ICON: Record<ApprovalRequest["kind"], React.ElementType> = {
  "Assent endorsement": Stamp,
  "Stage verification": ShieldCheck,
  "Response review": FileSignature,
};

export function ApprovalsView() {
  const { approvals, bills, session, decideApproval } = useStore();
  const [status, setStatus] = React.useState<"pending" | "all" | "approved" | "returned">("pending");
  const [active, setActive] = React.useState<ApprovalRequest | null>(null);
  const [decision, setDecision] = React.useState<"approved" | "returned">("approved");
  const [note, setNote] = React.useState("");
  const canAct = can(session.role, "approvals.act");

  const filtered = approvals.filter((a) => status === "all" || a.status === status);
  const pending = approvals.filter((a) => a.status === "pending").length;

  const open = (a: ApprovalRequest, d: "approved" | "returned") => {
    setActive(a);
    setDecision(d);
    setNote("");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">Approvals</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
            Decisions that need a signature
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-5 text-muted">
            Endorsements for Presidential assent, stage verifications and ministry response reviews.
            Every decision is timestamped and attributed.
          </p>
        </div>
        <Segmented
          options={[
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "returned", label: "Returned" },
            { value: "all", label: "All" },
          ]}
          value={status}
          onChange={(v) => setStatus(v as typeof status)}
          size="md"
        />
      </div>

      <StatStrip
        items={[
          { label: "Awaiting decision", value: pending, tone: "var(--warning)" },
          { label: "Approved", value: approvals.filter((a) => a.status === "approved").length, tone: "var(--success)" },
          { label: "Returned", value: approvals.filter((a) => a.status === "returned").length, tone: "var(--danger)" },
          { label: "Median turnaround", value: "1.4d", tone: "var(--ink)" },
        ]}
      />

      {!canAct && (
        <div className="flex items-center gap-2 rounded-[12px] border border-line bg-surface-2 px-3.5 py-2.5">
          <Info size={13} className="shrink-0 text-info" />
          <p className="text-[10.5px] text-muted">
            Your role can review this queue but not decide on it. Approvals require the{" "}
            <span className="font-medium text-ink">Approve endorsements</span> permission.
          </p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-2 lg:col-span-8">
          {filtered.length === 0 ? (
            <Card>
              <EmptyState
                icon={<CheckCheck size={19} />}
                title="Queue is clear"
                description="No approvals match this filter. New endorsements appear here as soon as they are routed."
                action={
                  <Button size="sm" variant="secondary" onClick={() => setStatus("all")}>
                    View all decisions
                  </Button>
                }
              />
            </Card>
          ) : (
            filtered.map((req) => {
              const Icon = KIND_ICON[req.kind];
              const bill = bills.find((b) => b.id === req.billId);
              return (
                <Card key={req.id} className={cn("overflow-hidden p-0", req.status !== "pending" && "opacity-80")}>
                  <div className="flex gap-3 p-3.5">
                    <span
                      className={cn(
                        "mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[9px]",
                        req.status === "pending"
                          ? "bg-warning-soft text-warning"
                          : req.status === "approved"
                            ? "bg-success-soft text-success"
                            : "bg-danger-soft text-danger",
                      )}
                    >
                      <Icon size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-[12.5px] font-semibold text-ink">{req.title}</p>
                        <Badge
                          tone={req.status === "pending" ? "warning" : req.status === "approved" ? "success" : "danger"}
                          size="xs"
                        >
                          {req.status}
                        </Badge>
                        <span className="num font-mono text-[8.5px] text-faint">{req.id}</span>
                      </div>
                      <p className="mt-1 text-[10.5px] leading-[1.6] text-muted">{req.note}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Link
                          href={`/bills/${req.billId}`}
                          className="flex items-center gap-1 rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] text-brand hover:bg-brand-soft"
                        >
                          {req.billId} <ArrowRight size={9} />
                        </Link>
                        <span className="truncate text-[9px] text-faint">
                          {bill?.shortTitle ?? "Linked bill"} · submitted by {req.submittedBy}{" "}
                          {relativeTime(req.submittedAt)}
                        </span>
                      </div>
                    </div>
                    {req.status === "pending" && canAct && (
                      <div className="flex shrink-0 flex-col gap-1.5">
                        <Button size="sm" variant="primary" onClick={() => open(req, "approved")}>
                          <Check size={11} /> Approve
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => open(req, "returned")}>
                          <RotateCcw size={11} /> Return
                        </Button>
                      </div>
                    )}
                    {req.status !== "pending" && <ChevronRight size={14} className="mt-2 shrink-0 text-faint" />}
                  </div>
                </Card>
              );
            })
          )}
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Card className="overflow-hidden">
            <CardHeader eyebrow="Workflow" title="Decision path" subtitle="From submission to signature." />
            <ol className="space-y-0 p-4">
              {[
                { label: "Data manager submits", note: "Document set and reference attached" },
                { label: "Law & Justice review", note: "Legal requirements checked" },
                { label: "Secretary approves", note: "Endorsement signed and stamped" },
                { label: "Assent forwarded", note: "MoPA endorsement to the President" },
              ].map((step, i) => (
                <li key={step.label} className="flex gap-2.5 pb-3.5 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span className="grid h-4 w-4 place-items-center rounded-full border border-brand/30 bg-brand-soft text-[8px] font-semibold text-brand">
                      {i + 1}
                    </span>
                    {i < 3 && <span className="mt-1 h-full w-px bg-line" />}
                  </div>
                  <div className="-mt-0.5 pb-1">
                    <p className="text-[10.5px] font-medium text-ink">{step.label}</p>
                    <p className="text-[9px] text-faint">{step.note}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-4">
            <p className="eyebrow">SLA</p>
            <div className="mt-2.5 space-y-2">
              {[
                { label: "Assent endorsements", target: "48 hours", actual: "31 hours" },
                { label: "Stage verifications", target: "24 hours", actual: "19 hours" },
                { label: "Response reviews", target: "72 hours", actual: "80 hours" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-ink-2">{row.label}</span>
                    <span className="num font-mono text-[9px] text-faint">
                      {row.actual} / {row.target}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2 rounded-[9px] border border-line bg-surface-2 p-2.5">
              <Clock3 size={11} className="mt-0.5 shrink-0 text-faint" />
              <p className="text-[9px] leading-[1.6] text-muted">
                Response reviews are currently above the target. Two items have been waiting more than
                three days.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        eyebrow={decision === "approved" ? "Approve" : "Return for revision"}
        title={decision === "approved" ? "Sign the endorsement" : "Return to the submitter"}
        description={active ? `${active.id} · ${active.billId}` : ""}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setActive(null)}>
              Cancel
            </Button>
            <Button
              variant={decision === "approved" ? "primary" : "danger"}
              size="sm"
              onClick={() => {
                if (active) decideApproval(active.id, decision, note);
                setActive(null);
              }}
            >
              {decision === "approved" ? <BadgeCheck size={12} /> : <X size={12} />}
              {decision === "approved" ? "Approve & sign" : "Return"}
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div className="rounded-[10px] border border-line bg-surface-2 p-3">
            <p className="text-[10.5px] font-medium text-ink">{active?.kind}</p>
            <p className="mt-1 text-[10px] leading-[1.7] text-muted">{active?.note}</p>
            <p className="mt-2 font-mono text-[9px] text-faint">
              Submitted {active ? formatDateTime(active.submittedAt) : ""} · {active?.submittedBy}
            </p>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-ink-2">
              {decision === "approved" ? "Approval note (optional)" : "Reason for return (required)"}
            </span>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder={
                decision === "approved"
                  ? "Legal review complete; committee report verified."
                  : "Justification note is missing. Complete and resubmit."
              }
              className="field h-auto min-h-[84px] py-2 text-[12px]"
            />
          </label>

          <div className="flex items-start gap-2 rounded-[9px] border border-line bg-surface-2 p-2.5">
            <ShieldCheck size={12} className="mt-0.5 shrink-0 text-brand" />
            <p className="text-[9.5px] leading-[1.6] text-muted">
              Decisions are final for this request. A returned item goes back to the submitter with your
              reason attached, and both actions appear in the audit trail.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}

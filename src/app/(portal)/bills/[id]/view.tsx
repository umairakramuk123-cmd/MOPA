"use client";

import * as React from "react";
import Link from "next/link";
import { cn, daysBetween, formatDate, formatDateTime, SYSTEM_DATE } from "@/lib/format";
import { useStore } from "@/lib/store";
import { AUDIT, DOCUMENTS, ministryById } from "@/lib/data";
import { billAge, stageAge, stageIndex } from "@/lib/metrics";
import { can } from "@/lib/roles";
import { COMMITTEE_LIMITS, STAGE_LIBRARY, TYPE_LABEL, WORKFLOW_META, stagesFor } from "@/lib/workflows";
import { Bill, StageKey } from "@/lib/types";
import { Avatar, Badge, Button, Card, CardHeader, Divider, EmptyState, KeyValue, Tabs } from "@/components/ui/primitives";
import { DeadlineChip, HouseChip, OutcomeBadge, PriorityMark, TypeChip } from "@/components/ui/bill-bits";
import { Modal } from "@/components/ui/overlay";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  FolderClosed,
  Gavel,
  History,
  Info,
  Landmark,
  Lock,
  MessageSquareReply,
  Pencil,
  Plus,
  ShieldCheck,
  Stamp,
  Upload,
} from "lucide-react";

type Tab = "timeline" | "documents" | "compliance" | "audit";

export function BillDetailView({ id }: { id: string }) {
  const { bills, session, toast } = useStore();
  const [tab, setTab] = React.useState<Tab>("timeline");
  const [stageOpen, setStageOpen] = React.useState(false);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [stanceOpen, setStanceOpen] = React.useState(false);

  const bill = bills.find((b) => b.id === id);
  const role = session.role;

  if (!bill) {
    return (
      <Card>
        <EmptyState
          icon={<FileText size={20} />}
          title="Bill record not found"
          description={`No record exists for ${id}. It may have been merged after duplicate detection, or the link is incorrect.`}
          action={
            <Link href="/bills">
              <Button size="sm" variant="secondary">
                Back to registry
              </Button>
            </Link>
          }
        />
      </Card>
    );
  }

  const ministry = ministryById(bill.ministryId);
  const stages = stagesFor(bill.type);
  const { index, total } = stageIndex(bill);
  const history = [...bill.history].reverse();
  const docs = DOCUMENTS.filter((d) => d.billId === bill.id);
  const audit = AUDIT.filter((a) => a.entityId === bill.id);
  const overdue = bill.committeeDueAt ? daysBetween(SYSTEM_DATE, bill.committeeDueAt) < 0 : false;
  const canEdit = can(role, "stages.update");
  const canRespond = can(role, "stance.submit") && bill.type === "private";
  const canUpload = can(role, "documents.upload");

  return (
    <div className="space-y-4">
      <Link
        href="/bills"
        className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft size={12} /> Back to registry
      </Link>

      {/* ------------------------------ Header ------------------------------ */}
      <Card className="texture relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle_at_center,var(--brand-soft),transparent_70%)]" />
        <div className="relative p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="num rounded-md border border-line-strong bg-surface px-1.5 py-0.5 font-mono text-[10px] font-medium text-ink-2">
                  {bill.id}
                </span>
                <TypeChip type={bill.type} />
                <HouseChip house={bill.house} />
                <OutcomeBadge outcome={bill.outcome} />
                <PriorityMark priority={bill.priority} />
                {overdue && (
                  <Badge tone="danger" dot>
                    Breach
                  </Badge>
                )}
              </div>
              <h1 className="mt-3 max-w-[52ch] text-[24px] font-semibold leading-[1.15] tracking-[-0.04em] text-ink sm:text-[28px]">
                {bill.title}
              </h1>
              <p className="mt-2 max-w-[68ch] text-[12px] leading-[1.7] text-muted">{bill.summary}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {canUpload && (
                <Button variant="secondary" size="md" onClick={() => setUploadOpen(true)}>
                  <Upload size={13} /> Upload
                </Button>
              )}
              {canRespond && (
                <Button variant="secondary" size="md" onClick={() => setStanceOpen(true)}>
                  <MessageSquareReply size={13} /> Ministry stance
                </Button>
              )}
              {canEdit ? (
                <Button variant="primary" size="md" onClick={() => setStageOpen(true)}>
                  <Pencil size={13} /> Update stage
                </Button>
              ) : (
                <Badge tone="neutral" className="h-9 px-3">
                  <Lock size={11} /> Read-only access
                </Badge>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 sm:grid-cols-3 lg:grid-cols-6">
            <KeyValue label="Sponsoring division" value={ministry.short} />
            <KeyValue label="Member in charge" value={bill.memberInCharge} />
            <KeyValue label="Registered" value={formatDate(bill.registeredAt)} />
            <KeyValue label="Current stage" value={STAGE_LIBRARY[bill.stage]?.label ?? bill.stage} />
            <KeyValue label="Time at stage" value={`${stageAge(bill)} days`} />
            <KeyValue label="Document set" value={`${bill.documentCount} files`} />
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          {/* tabs */}
          <Card className="overflow-hidden">
            <Tabs
              tabs={[
                { value: "timeline", label: "Stage history", count: bill.history.length },
                { value: "documents", label: "Documents", count: docs.length },
                { value: "compliance", label: "Compliance" },
                { value: "audit", label: "Audit", count: audit.length },
              ]}
              value={tab}
              onChange={setTab}
              className="px-3 pt-2"
            />

            {tab === "timeline" && (
              <div className="p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[12.5px] font-semibold text-ink">Recorded milestones</p>
                    <p className="mt-0.5 text-[10.5px] text-muted">
                      Newest first · every entry carries the authorised user, timestamp and reference.
                    </p>
                  </div>
                  <Badge tone="neutral">{WORKFLOW_META[bill.type].label} workflow</Badge>
                </div>

                <ol className="relative space-y-0">
                  {history.map((event, i) => {
                    const isCurrent = i === 0;
                    const stageMeta =
                      event.stage === "registered" ? null : STAGE_LIBRARY[event.stage as StageKey];
                    return (
                      <li key={event.id} className="relative flex gap-3 pb-5 last:pb-0">
                        {/* rail */}
                        <div className="relative flex w-4 shrink-0 flex-col items-center">
                          <span
                            className={cn(
                              "relative z-10 mt-1 grid h-4 w-4 place-items-center rounded-full border-2",
                              isCurrent
                                ? "border-brand bg-brand text-white dark:text-[#04140f]"
                                : "border-line-strong bg-surface",
                            )}
                          >
                            {isCurrent ? (
                              <Check size={8} strokeWidth={3} />
                            ) : (
                              <span className="h-1 w-1 rounded-full bg-line-strong" />
                            )}
                          </span>
                          {i < history.length - 1 && (
                            <span className="absolute bottom-0 top-5 w-px bg-line" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 pb-0.5">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className={cn("text-[12px] font-semibold", isCurrent ? "text-ink" : "text-ink-2")}>
                              {event.stage === "registered" ? "Bill registered" : stageMeta?.label}
                            </p>
                            {isCurrent && (
                              <Badge tone="brand" size="xs">
                                Current
                              </Badge>
                            )}
                            <span className="font-mono text-[9px] text-faint">{formatDateTime(event.at)}</span>
                          </div>
                          <p className="mt-1 text-[11px] leading-[1.6] text-muted">{event.note}</p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1.5">
                              <Avatar name={event.actor} size={16} />
                              <span className="text-[10px] font-medium text-ink-2">{event.actor}</span>
                            </span>
                            {event.reference && (
                              <span className="num rounded border border-line bg-surface-2 px-1 py-px font-mono text-[9px] text-muted">
                                {event.reference}
                              </span>
                            )}
                            {stageMeta?.gate && (
                              <span className="text-[9px] text-faint">· Gate: {stageMeta.gate}</span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>

                <div className="mt-2 flex items-start gap-2 rounded-[10px] border border-dashed border-line-strong bg-surface-2 p-2.5">
                  <Info size={12} className="mt-0.5 shrink-0 text-faint" />
                  <p className="text-[9.5px] leading-[1.6] text-muted">
                    Past stages remain in this log and are editable only through a new audited entry —
                    historical values are preserved, never overwritten.
                  </p>
                </div>
              </div>
            )}

            {tab === "documents" && (
              <div className="p-5">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[12.5px] font-semibold text-ink">Central document repository</p>
                  <Button size="sm" variant="secondary" onClick={() => setUploadOpen(true)}>
                    <Plus size={12} /> Add document
                  </Button>
                </div>
                {docs.length === 0 ? (
                  <EmptyState
                    icon={<FolderClosed size={18} />}
                    title="No documents linked yet"
                    description="Bill copies, Orders of the Day, committee reports and Gazette notifications appear here once uploaded against this record."
                  />
                ) : (
                  <div className="space-y-2">
                    {docs.map((doc) => (
                      <div
                        key={doc.id}
                        className="group flex items-center gap-3 rounded-[10px] border border-line bg-surface px-3 py-2.5 transition-colors hover:bg-surface-2"
                      >
                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] bg-surface-3 text-muted">
                          <FileText size={14} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11.5px] font-medium text-ink">{doc.name}</p>
                          <p className="truncate font-mono text-[9px] text-faint">
                            {doc.type} · v{doc.version} · {doc.size} · {doc.uploadedBy} ·{" "}
                            {formatDate(doc.uploadedAt)}
                          </p>
                        </div>
                        {doc.classification !== "public" && (
                          <Badge tone={doc.classification === "classified" ? "danger" : "warning"} size="xs">
                            {doc.classification}
                          </Badge>
                        )}
                        <button
                          onClick={() =>
                            toast({
                              title: "Download started",
                              description: `${doc.name} · ${doc.size}. Access recorded against your user ID.`,
                              tone: "success",
                            })
                          }
                          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-faint opacity-0 transition-all hover:bg-surface-3 hover:text-ink group-hover:opacity-100"
                          aria-label={`Download ${doc.name}`}
                        >
                          <Download size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-[9px] leading-[1.6] text-faint">
                  Classification follows role permissions — classified files are hidden from users
                  without the corresponding access.
                </p>
              </div>
            )}

            {tab === "compliance" && (
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-[12.5px] font-semibold text-ink">Constitutional checks</p>
                  <p className="mt-0.5 text-[10.5px] text-muted">
                    Required for Private Members&apos; Bills under Article 74, and for every bill at assent.
                  </p>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2">
                  {[
                    {
                      label: "Article 74 applicability",
                      value:
                        bill.article74 === "applicable"
                          ? "Applicable"
                          : bill.article74 === "not-applicable"
                            ? "Not applicable"
                            : bill.article74 === "under-review"
                              ? "Under review"
                              : "Not required",
                      tone: bill.article74 === "applicable" ? "warning" : bill.article74 === "under-review" ? "info" : "success",
                      icon: Gavel,
                    },
                    {
                      label: "Federal Government consent",
                      value:
                        bill.cabinetConsent === "received"
                          ? "Received"
                          : bill.cabinetConsent === "pending"
                            ? "Pending"
                            : "Not required",
                      tone: bill.cabinetConsent === "pending" ? "warning" : "success",
                      icon: ShieldCheck,
                    },
                    {
                      label: "Ministry stance",
                      value:
                        bill.ministryStance === "support"
                          ? "Support"
                          : bill.ministryStance === "oppose"
                            ? "Oppose"
                            : bill.ministryStance === "conditional"
                              ? "Conditional"
                              : bill.ministryStance === "pending"
                                ? "Pending response"
                                : "Not applicable",
                      tone:
                        bill.ministryStance === "pending"
                          ? "warning"
                          : bill.ministryStance === "oppose"
                            ? "danger"
                            : "success",
                      icon: MessageSquareReply,
                    },
                    {
                      label: "Law & Justice review",
                      value:
                        bill.legalReview === "cleared"
                          ? "Cleared"
                          : bill.legalReview === "objection"
                            ? "Objection raised"
                            : bill.legalReview === "pending"
                              ? "Pending review"
                              : "Not required",
                      tone: bill.legalReview === "pending" ? "warning" : bill.legalReview === "objection" ? "danger" : "success",
                      icon: FileCheck2,
                    },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3 rounded-[10px] border border-line bg-surface px-3 py-2.5">
                      <span className="flex min-w-0 items-center gap-2">
                        <row.icon size={13} className="shrink-0 text-faint" />
                        <span className="truncate text-[11px] text-ink-2">{row.label}</span>
                      </span>
                      <Badge tone={row.tone as "warning"} size="xs">
                        {row.value}
                      </Badge>
                    </div>
                  ))}
                </div>

                <Divider />

                <div>
                  <p className="text-[12.5px] font-semibold text-ink">Statutory deadlines</p>
                  <div className="mt-2 space-y-2">
                    {[
                      {
                        label:
                          bill.house === "Senate"
                            ? "Senate Standing Committee window"
                            : bill.type === "joint"
                              ? "Committee on Bills window"
                              : "National Assembly committee window",
                        limit: bill.house === "Senate" ? COMMITTEE_LIMITS.Senate : COMMITTEE_LIMITS.NA,
                        due: bill.committeeDueAt,
                      },
                      { label: "Inter-House transmission limit", limit: 90, due: bill.transmissionAt ? bill.committeeDueAt : undefined },
                      { label: "Gazette notification window", limit: 15, due: bill.stage === "gazette" ? bill.committeeDueAt : undefined },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between gap-3 rounded-[10px] border border-line bg-surface-2 px-3 py-2">
                        <span className="flex items-center gap-2 text-[11px] text-ink-2">
                          <Clock3 size={12} className="text-faint" />
                          {row.label}
                          <span className="font-mono text-[9px] text-faint">({row.limit} days)</span>
                        </span>
                        <DeadlineChip dueAt={row.due} compact />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-[10px] border border-brand/20 bg-brand-soft p-3">
                  <ShieldCheck size={14} className="mt-0.5 shrink-0 text-brand" />
                  <p className="text-[10px] leading-[1.65] text-brand-ink">
                    Validation is enforced before save: a stage date and a supporting reference are
                    mandatory. If a document is genuinely unavailable, the user must record a reason,
                    which is written to the audit trail.
                  </p>
                </div>
              </div>
            )}

            {tab === "audit" && (
              <div className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[12.5px] font-semibold text-ink">Immutable change log</p>
                  <Badge tone="neutral">
                    <Lock size={9} /> Read-only
                  </Badge>
                </div>
                {audit.length === 0 ? (
                  <EmptyState
                    icon={<History size={18} />}
                    title="No audit entries yet"
                    description="The next stage update or document action will appear here with before/after values."
                  />
                ) : (
                  <div className="space-y-2">
                    {audit.map((entry) => (
                      <div key={entry.id} className="rounded-[10px] border border-line bg-surface px-3 py-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-[11.5px] font-medium text-ink">{entry.action}</p>
                          <span className="font-mono text-[9px] text-faint">{formatDateTime(entry.at)}</span>
                        </div>
                        <p className="mt-1 text-[10px] text-muted">
                          {entry.actor} · {entry.ip}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <span className="rounded bg-surface-3 px-1.5 py-px font-mono text-[9px] text-muted">
                            {entry.before ?? "—"}
                          </span>
                          <ChevronRight size={9} className="text-faint" />
                          <span className="rounded bg-brand-soft px-1.5 py-px font-mono text-[9px] text-brand-ink">
                            {entry.after ?? "—"}
                          </span>
                        </div>
                        {entry.reason && <p className="mt-1.5 text-[9.5px] leading-4 text-faint">{entry.reason}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* ------------------------------ Rail ------------------------------ */}
        <div className="space-y-4 xl:col-span-4">
          <Card className="overflow-hidden">
            <CardHeader
              eyebrow="Progress"
              title="Lifecycle position"
              subtitle={`${index + 1} of ${total} milestones recorded`}
              actions={<Badge tone="brand">{Math.round(((index + 1) / total) * 100)}%</Badge>}
            />
            <div className="p-4">
              <div className="space-y-1.5">
                {stages.map((stage, i) => {
                  const done = i < index;
                  const current = i === index;
                  return (
                    <div
                      key={`${stage.key}-${i}`}
                      className={cn(
                        "flex items-center gap-2 rounded-[8px] px-2 py-1.5",
                        current ? "bg-brand-soft" : "hover:bg-surface-2",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                          done
                            ? "border-brand/30 bg-brand/15 text-brand"
                            : current
                              ? "border-brand bg-brand text-white dark:text-[#04140f]"
                              : "border-line-strong bg-surface",
                        )}
                      >
                        {done ? <Check size={8} strokeWidth={3} /> : current ? <span className="h-1 w-1 rounded-full bg-current" /> : null}
                      </span>
                      <span
                        className={cn(
                          "min-w-0 flex-1 truncate text-[10.5px]",
                          current ? "font-semibold text-brand-ink" : done ? "text-ink-2" : "text-faint",
                        )}
                      >
                        {stage.label}
                      </span>
                      {current && (
                        <span className="shrink-0 font-mono text-[8.5px] uppercase tracking-[0.1em] text-brand">
                          now
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <p className="eyebrow">Record</p>
            <dl className="mt-3 space-y-2.5">
              {[
                { label: "Bill type", value: TYPE_LABEL[bill.type] },
                { label: "House of origin", value: bill.house === "NA" ? "National Assembly" : bill.house === "Senate" ? "Senate" : "Joint Sitting" },
                { label: "Total age", value: `${billAge(bill)} days` },
                { label: "Last action", value: bill.lastAction },
                { label: "Workflow gates", value: `${stages.filter((s) => s.gate).length} mandatory` },
              ].map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-3">
                  <dt className="text-[10px] uppercase tracking-[0.08em] text-faint">{row.label}</dt>
                  <dd className="max-w-[62%] text-right text-[10.5px] font-medium text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
            <Divider className="my-3" />
            <div className="flex items-center gap-2">
              <Avatar name={ministry.focalPerson} size={26} />
              <div className="min-w-0">
                <p className="truncate text-[10.5px] font-medium text-ink">{ministry.focalPerson}</p>
                <p className="truncate text-[9px] text-faint">Focal person · {ministry.code}</p>
              </div>
              <a
                href={`mailto:${ministry.email}`}
                className="ml-auto shrink-0 rounded-md border border-line px-1.5 py-0.5 text-[9px] font-medium text-muted hover:text-ink"
              >
                Contact
              </a>
            </div>
          </Card>

          <Card className="p-4">
            <p className="eyebrow">Quick actions</p>
            <div className="mt-3 space-y-1.5">
              {[
                { icon: Stamp, label: "Prepare assent endorsement", show: ["assent", "president"].includes(bill.stage), action: () => toast({ title: "Endorsement drafted", description: "Routed to the Secretary for approval.", tone: "success" }) },
                { icon: FileText, label: "Download bill brief", show: true, action: () => window.print() },
                { icon: Landmark, label: "View Order of the Day", show: true, action: () => toast({ title: "OD reference", description: "Linked OD copies are in the Documents tab.", tone: "default" }) },
                { icon: MessageSquareReply, label: "File ministry response", show: bill.type === "private", action: () => setStanceOpen(true) },
              ]
                .filter((a) => a.show)
                .map((a) => (
                  <button
                    key={a.label}
                    onClick={a.action}
                    className="flex w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left text-[11px] text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink"
                  >
                    <a.icon size={12} className="text-faint" />
                    {a.label}
                    <ChevronRight size={11} className="ml-auto text-faint" />
                  </button>
                ))}
            </div>
          </Card>
        </div>
      </div>

      <StageUpdateModal open={stageOpen} onClose={() => setStageOpen(false)} bill={bill} />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} bill={bill} />
      <StanceModal open={stanceOpen} onClose={() => setStanceOpen(false)} bill={bill} />
    </div>
  );
}

/* ------------------------------ Stage update ----------------------------- */
function StageUpdateModal({ open, onClose, bill }: { open: boolean; onClose: () => void; bill: Bill }) {
  const { updateStage } = useStore();
  const stages = stagesFor(bill.type);
  const currentIdx = stages.findIndex((s) => s.key === bill.stage);
  const nextStage = stages[Math.min(currentIdx + 1, stages.length - 1)];
  const [stage, setStage] = React.useState<StageKey>(nextStage.key);
  const [date, setDate] = React.useState("2026-10-20");
  const [reference, setReference] = React.useState("");
  const [note, setNote] = React.useState("");
  const [notAvailable, setNotAvailable] = React.useState(false);
  const [reason, setReason] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (open) {
      setStage(nextStage.key);
      setDate("2026-10-20");
      setReference("");
      setNote("");
      setNotAvailable(false);
      setReason("");
      setErrors({});
    }
  }, [open, nextStage.key]);

  const submit = () => {
    const errs: Record<string, string> = {};
    if (!date) errs.date = "Stage date is mandatory before saving.";
    if (!reference && !notAvailable) errs.reference = "Attach a reference or record a reason.";
    if (notAvailable && reason.trim().length < 12) errs.reason = "Explain why the document is unavailable (min. 12 characters).";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    updateStage(
      bill.id,
      stage,
      note || `${STAGE_LIBRARY[stage].label} recorded${reference ? ` against ${reference}` : ""}.${notAvailable ? ` Document not available: ${reason}` : ""}`,
      reference || `NA/${Date.now().toString().slice(-6)}`,
    );
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Stage tracking"
      title="Record a stage update"
      description={`${bill.id} · ${bill.shortTitle}`}
      size="lg"
      footer={
        <>
          <span className="mr-auto flex items-center gap-1.5 text-[9.5px] text-faint">
            <Lock size={10} /> Audit entry written on save
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={submit}>
            <Check size={12} /> Save stage
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <div>
          <p className="mb-1.5 text-[11px] font-medium text-ink-2">Stage</p>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {stages.map((s, i) => (
              <button
                key={`${s.key}-${i}`}
                onClick={() => setStage(s.key)}
                className={cn(
                  "flex items-center gap-2 rounded-[9px] border px-2.5 py-2 text-left text-[11px] transition-colors",
                  stage === s.key
                    ? "border-brand bg-brand-soft font-medium text-brand-ink"
                    : "border-line bg-surface text-ink-2 hover:border-line-strong",
                )}
              >
                <span
                  className={cn(
                    "grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border",
                    stage === s.key ? "border-brand bg-brand text-white dark:text-[#04140f]" : "border-line-strong",
                  )}
                >
                  {stage === s.key && <Check size={7} strokeWidth={3} />}
                </span>
                <span className="truncate">{s.label}</span>
                {i < currentIdx && <span className="ml-auto font-mono text-[8px] text-faint">done</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-ink-2">
              Stage date <span className="text-danger">*</span>
            </span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field h-10 text-[12px]" />
            {errors.date && <span className="mt-1 block text-[10px] text-danger">{errors.date}</span>}
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Reference / OD number</span>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="NA/OD/2026/204"
              className="field h-10 text-[12px]"
            />
            {errors.reference && <span className="mt-1 block text-[10px] text-danger">{errors.reference}</span>}
          </label>
        </div>

        <label className="flex items-start gap-2 rounded-[9px] border border-line bg-surface-2 p-2.5">
          <input
            type="checkbox"
            checked={notAvailable}
            onChange={(e) => setNotAvailable(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 rounded border-line-strong accent-[var(--brand)]"
          />
          <span>
            <span className="block text-[11px] font-medium text-ink">Supporting document not available</span>
            <span className="mt-0.5 block text-[9.5px] leading-4 text-muted">
              A written reason is mandatory and will be stored in the audit trail.
            </span>
          </span>
        </label>

        {notAvailable && (
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Reason</span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              placeholder="Order of the Day has not yet been circulated by the Secretariat."
              className="field h-auto min-h-[64px] py-2 text-[12px]"
            />
            {errors.reason && <span className="mt-1 block text-[10px] text-danger">{errors.reason}</span>}
          </label>
        )}

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Note for the record</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Short factual note that will be visible in the stage history."
            className="field h-auto min-h-[64px] py-2 text-[12px]"
          />
        </label>

        <div className="flex items-start gap-2 rounded-[9px] border border-dashed border-line-strong bg-surface-2 p-2.5">
          <AlertTriangle size={12} className="mt-0.5 shrink-0 text-warning" />
          <p className="text-[9.5px] leading-[1.6] text-muted">
            This action triggers the configured alerts for{" "}
            <span className="font-medium text-ink">{STAGE_LIBRARY[stage].label}</span> and notifies the
            concerned Ministry/Division.
          </p>
        </div>
      </div>
    </Modal>
  );
}

/* -------------------------------- Upload -------------------------------- */
function UploadModal({ open, onClose, bill }: { open: boolean; onClose: () => void; bill: Bill }) {
  const { toast } = useStore();
  const [type, setType] = React.useState("Bill Copy");
  const [classification, setClassification] = React.useState("public");
  const [fileName, setFileName] = React.useState("");

  const submit = () => {
    toast({
      title: "Document linked to bill",
      description: `${type} · ${classification} · ${bill.id}. Repository and audit updated.`,
      tone: "success",
    });
    onClose();
    setFileName("");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Repository"
      title="Upload a document"
      description={`${bill.id} · documents are stored centrally against this Bill ID`}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={submit}>
            <Upload size={12} /> Link document
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Document type</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className="field h-10 text-[12px]">
            {["Bill Copy", "Order of the Day", "Committee Report", "Ministry Response", "Transmitted Copy", "Presidential Message", "Gazette Notification"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>

        <div className="rounded-[11px] border border-dashed border-line-strong bg-surface-2 p-5 text-center">
          <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-surface text-muted">
            <Upload size={15} />
          </span>
          <p className="mt-2 text-[11.5px] font-medium text-ink">Drop a file or click to browse</p>
          <p className="mt-0.5 text-[9.5px] text-muted">PDF, DOCX or XLSX · maximum 20 MB per file</p>
          <input
            type="file"
            onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
            className="mt-2 w-full text-[10px] text-muted file:mr-2 file:rounded-md file:border file:border-line-strong file:bg-surface file:px-2 file:py-1 file:text-[10px] file:font-medium file:text-ink"
          />
          {fileName && <p className="mt-1 truncate font-mono text-[9px] text-brand">{fileName}</p>}
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-medium text-ink-2">Classification</p>
          <div className="flex flex-wrap gap-1.5">
            {["public", "restricted", "classified"].map((c) => (
              <button
                key={c}
                onClick={() => setClassification(c)}
                className={cn(
                  "rounded-md border px-2 py-1 text-[10.5px] font-medium capitalize transition-colors",
                  classification === c
                    ? "border-brand bg-brand-soft text-brand-ink"
                    : "border-line text-muted hover:text-ink",
                )}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-[9px] leading-4 text-faint">
            Restricted and classified files are only visible to roles holding the matching document
            permission.
          </p>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------- Stance modal ---------------------------- */
function StanceModal({ open, onClose, bill }: { open: boolean; onClose: () => void; bill: Bill }) {
  const { toast } = useStore();
  const [stance, setStance] = React.useState(bill.ministryStance ?? "pending");
  const [a74, setA74] = React.useState(bill.article74 ?? "under-review");
  const [consent, setConsent] = React.useState(bill.cabinetConsent ?? "pending");
  const [comment, setComment] = React.useState("");

  const submit = () => {
    toast({
      title: "Ministry stance recorded",
      description: `${stance} · Article 74 ${a74} · consent ${consent}. Previous values preserved in the audit trail.`,
      tone: "success",
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Article 74 · BRD UC-03"
      title="Record ministry stance"
      description={`${bill.id} · ${bill.shortTitle}`}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={submit}>
            <Check size={12} /> Submit response
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-[11px] font-medium text-ink-2">Position on the bill</p>
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {["support", "oppose", "conditional", "pending"].map((s) => (
              <button
                key={s}
                onClick={() => setStance(s as typeof stance)}
                className={cn(
                  "rounded-[8px] border px-2 py-1.5 text-[10.5px] font-medium capitalize transition-colors",
                  stance === s
                    ? s === "oppose"
                      ? "border-danger bg-danger-soft text-danger"
                      : "border-brand bg-brand-soft text-brand-ink"
                    : "border-line text-muted hover:text-ink",
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Article 74 applicability</span>
            <select value={a74} onChange={(e) => setA74(e.target.value as typeof a74)} className="field h-10 text-[12px]">
              <option value="applicable">Applicable</option>
              <option value="not-applicable">Not applicable</option>
              <option value="under-review">Under review</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Cabinet consent</span>
            <select value={consent} onChange={(e) => setConsent(e.target.value as typeof consent)} className="field h-10 text-[12px]">
              <option value="received">Received</option>
              <option value="pending">Pending</option>
              <option value="not-required">Not required</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Justification</span>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Reasoning recorded against the Ministry's response…"
            className="field h-auto min-h-[76px] py-2 text-[12px]"
          />
        </label>

        <div className="flex items-start gap-2 rounded-[9px] border border-info/20 bg-info-soft p-2.5">
          <Info size={12} className="mt-0.5 shrink-0 text-info" />
          <p className="text-[9.5px] leading-[1.6] text-info">
            If the stance changes later, this value is not overwritten — the new value is appended with
            the reason for change.
          </p>
        </div>
      </div>
    </Modal>
  );
}

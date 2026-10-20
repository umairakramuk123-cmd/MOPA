"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn, daysBetween, formatDate, SYSTEM_DATE } from "@/lib/format";
import { useStore } from "@/lib/store";
import { ministryShort } from "@/lib/data";
import { deadlineState, stageIndex } from "@/lib/metrics";
import { STAGE_LIBRARY, WORKFLOW_META, stagesFor } from "@/lib/workflows";
import { BillType } from "@/lib/types";
import { Badge, Card, CardHeader, Segmented } from "@/components/ui/primitives";
import { DeadlineChip, HouseChip, OutcomeBadge, StageProgress } from "@/components/ui/bill-bits";
import { StageBars } from "@/components/charts";
import { ChevronRight, Clock3, Columns3, GitBranch, Info, LayoutList, Timer } from "lucide-react";
import { stageDistribution } from "@/lib/metrics";

export function TrackingView() {
  const params = useSearchParams();
  const initial = (params.get("type") as BillType | null) ?? "official";
  const { bills } = useStore();
  const [type, setType] = React.useState<BillType>(
    initial === "official" || initial === "private" || initial === "joint" ? initial : "official",
  );
  const [view, setView] = React.useState<"board" | "list">("board");

  const meta = WORKFLOW_META[type];
  const stages = stagesFor(type);
  const scoped = bills.filter((b) => b.type === type);

  const board = stages.map((stage) => ({
    stage,
    bills: scoped.filter((b) => b.stage === stage.key),
  }));

  const overdue = scoped.filter((b) => deadlineState(b) === "overdue").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">Stage tracking · BRD §8</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
            Watch every milestone
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-5 text-muted">
            Each workflow has fixed stages and its own rules. Current stage is visible instantly; every
            past stage remains in an editable but audited log.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            options={[
              { value: "official", label: "Official" },
              { value: "private", label: "Private" },
              { value: "joint", label: "Joint" },
            ]}
            value={type}
            onChange={(v) => setType(v as BillType)}
            size="md"
          />
          <Segmented
            options={[
              { value: "board", label: "Board", icon: <Columns3 size={12} /> },
              { value: "list", label: "List", icon: <LayoutList size={12} /> },
            ]}
            value={view}
            onChange={(v) => setView(v as typeof view)}
            size="md"
          />
        </div>
      </div>

      {/* Workflow summary */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-4">
          <div className="flex items-start gap-3">
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px]"
              style={{ background: `color-mix(in oklab, ${meta.color} 14%, transparent)`, color: meta.color }}
            >
              <GitBranch size={15} />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-ink">
                {meta.label} <span className="font-normal text-muted">workflow</span>
              </p>
              <p className="mt-0.5 text-[10.5px] text-muted">{meta.houseRules}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral">{stages.length} milestones</Badge>
            <Badge tone="brand">{scoped.filter((b) => b.outcome === "in-progress").length} active</Badge>
            {overdue > 0 && (
              <Badge tone="danger" dot>
                {overdue} overdue
              </Badge>
            )}
          </div>
        </div>
        <div className="scroll-thin flex items-stretch gap-1 overflow-x-auto p-4">
          {stages.map((stage, i) => {
            const count = scoped.filter((b) => b.stage === stage.key).length;
            const passed = scoped.filter((b) => {
              const idx = stagesFor(b.type).findIndex((s) => s.key === b.stage);
              return Math.max(0, idx) > i - 1 && b.outcome !== "withdrawn";
            }).length;
            return (
              <React.Fragment key={`${stage.key}-${i}`}>
                <div className="min-w-[92px] shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={cn(
                        "grid h-4 w-4 place-items-center rounded-full border text-[8px]",
                        count > 0
                          ? "border-brand bg-brand text-white dark:text-[#04140f]"
                          : "border-line-strong bg-surface text-faint",
                      )}
                    >
                      {count > 0 ? count : ""}
                    </span>
                    <span className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-faint">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[10px] font-medium leading-3 text-ink-2">{stage.short}</p>
                  <p className="mt-0.5 font-mono text-[8.5px] text-faint">
                    {passed}/{scoped.length}
                  </p>
                </div>
                {i < stages.length - 1 && (
                  <div className="flex min-w-[16px] flex-1 items-start pt-2">
                    <span className="h-px w-full bg-line" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </Card>

      {view === "board" ? (
        <div className="scroll-thin -mx-1 overflow-x-auto px-1 pb-2">
          <div className="flex min-w-max gap-3">
            {board.map(({ stage, bills: stageBills }, i) => {
              const hasDeadline = stage.deadlineDays !== undefined;
              return (
                <div key={`${stage.key}-${i}`} className="w-[254px] shrink-0">
                  <div className="mb-2 flex items-center justify-between px-0.5">
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold text-ink">{stage.short}</p>
                      <p className="font-mono text-[8.5px] uppercase tracking-[0.1em] text-faint">
                        {stageBills.length} bill{stageBills.length === 1 ? "" : "s"}
                        {hasDeadline ? ` · ${stage.deadlineDays}d limit` : ""}
                      </p>
                    </div>
                    <span className="num rounded bg-surface-3 px-1.5 py-0.5 text-[9px] font-medium text-muted">
                      {stageBills.length}
                    </span>
                  </div>
                  <div className="min-h-[120px] space-y-2 rounded-[12px] border border-dashed border-line bg-surface-2/60 p-2">
                    {stageBills.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-7 text-center">
                        <span className="h-1.5 w-1.5 rounded-full bg-line-strong" />
                        <p className="mt-1.5 text-[9px] text-faint">No bills at this stage</p>
                      </div>
                    )}
                    {stageBills.map((bill) => (
                      <Link
                        key={bill.id}
                        href={`/bills/${bill.id}`}
                        className="group block rounded-[10px] border border-line bg-surface p-2.5 shadow-[0_1px_2px_rgba(10,21,18,0.03)] transition-all hover:-translate-y-px hover:border-line-strong hover:shadow-[var(--shadow-card)]"
                      >
                        <div className="flex items-center justify-between">
                          <span className="num font-mono text-[8.5px] text-faint">{bill.id}</span>
                          <OutcomeBadge outcome={bill.outcome} />
                        </div>
                        <p className="mt-1.5 line-clamp-2 text-[10.5px] font-medium leading-[1.45] text-ink group-hover:text-brand-ink">
                          {bill.shortTitle}
                        </p>
                        <p className="mt-1 truncate text-[9px] text-muted">{ministryShort(bill.ministryId)}</p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="flex items-center gap-1 font-mono text-[8.5px] text-faint">
                            <Clock3 size={9} /> {daysBetween(bill.stageEnteredAt, SYSTEM_DATE)}d
                          </span>
                          <DeadlineChip dueAt={bill.committeeDueAt} compact />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="divide-y divide-line">
            {scoped.map((bill) => {
              const { index, total } = stageIndex(bill);
              return (
                <Link
                  key={bill.id}
                  href={`/bills/${bill.id}`}
                  className="group flex flex-col gap-3 px-4 py-3 transition-colors hover:bg-surface-2 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="num font-mono text-[9px] text-faint">{bill.id}</span>
                      <HouseChip house={bill.house} />
                      <OutcomeBadge outcome={bill.outcome} />
                    </div>
                    <p className="mt-1 line-clamp-1 text-[12px] font-medium text-ink group-hover:text-brand-ink">
                      {bill.shortTitle}
                    </p>
                    <p className="mt-0.5 text-[9.5px] text-muted">
                      {ministryShort(bill.ministryId)} · entered stage {formatDate(bill.stageEnteredAt)}
                    </p>
                  </div>
                  <div className="w-full shrink-0 sm:w-[220px]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-ink-2">
                        {STAGE_LIBRARY[bill.stage]?.short}
                      </span>
                      <span className="font-mono text-[9px] text-faint">
                        {index + 1}/{total}
                      </span>
                    </div>
                    <StageProgress bill={bill} />
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="font-mono text-[8.5px] text-faint">
                        {daysBetween(bill.stageEnteredAt, SYSTEM_DATE)}d at stage
                      </span>
                      <DeadlineChip dueAt={bill.committeeDueAt} compact />
                    </div>
                  </div>
                  <ChevronRight size={14} className="hidden shrink-0 text-faint group-hover:text-brand sm:block" />
                </Link>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <StageBars
          data={stageDistribution(bills)}
          title="All workflows by stage"
          subtitle="Where the whole registry currently sits."
          className="lg:col-span-7"
          max={10}
        />
        <Card className="overflow-hidden lg:col-span-5">
          <CardHeader
            eyebrow="Rules"
            title="Deadline engine"
            subtitle="Escalating reminders before each statutory limit."
          />
          <div className="space-y-2.5 p-4">
            {[
              { label: "NA Standing Committee", days: 30, note: "Reminder at 23 days · overdue at 31" },
              { label: "Senate Standing Committee", days: 60, note: "Reminder at 45 days · overdue at 61" },
              { label: "Inter-House transmission", days: 90, note: "Joint Sitting referral on lapse" },
              { label: "Gazette notification", days: 15, note: "Escalation to the Secretariat" },
            ].map((rule) => (
              <div key={rule.label} className="flex items-center gap-3 rounded-[10px] border border-line bg-surface-2 px-3 py-2">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-surface text-muted">
                  <Timer size={12} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10.5px] font-medium text-ink">{rule.label}</p>
                  <p className="truncate text-[9px] text-faint">{rule.note}</p>
                </div>
                <span className="num shrink-0 rounded bg-brand-soft px-1.5 py-0.5 font-mono text-[9.5px] font-medium text-brand-ink">
                  {rule.days}d
                </span>
              </div>
            ))}
            <div className="flex items-start gap-2 rounded-[10px] border border-info/20 bg-info-soft p-2.5">
              <Info size={12} className="mt-0.5 shrink-0 text-info" />
              <p className="text-[9.5px] leading-[1.6] text-info">
                Alert rules are configurable in Settings — no code change is needed to adjust recipients
                or thresholds.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

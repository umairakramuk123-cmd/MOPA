import { SYSTEM_DATE, daysBetween } from "./format";
import { BILLS, MINISTRIES } from "./data";
import { STAGE_LIBRARY, stagesFor } from "./workflows";
import type { Alert, Bill, BillType, House, Outcome, RoleDefinition } from "./types";

export function stageAge(bill: Bill): number {
  return Math.max(0, daysBetween(bill.stageEnteredAt, SYSTEM_DATE));
}

export function billAge(bill: Bill): number {
  return Math.max(0, daysBetween(bill.registeredAt, SYSTEM_DATE));
}

export function deadlineState(bill: Bill): "overdue" | "due-soon" | "on-track" | "none" {
  if (!bill.committeeDueAt) return "none";
  const delta = daysBetween(SYSTEM_DATE, bill.committeeDueAt);
  if (delta < 0) return "overdue";
  if (delta <= 7) return "due-soon";
  return "on-track";
}

export function isOverdue(bill: Bill): boolean {
  return deadlineState(bill) === "overdue";
}

export function isCommitteeStage(bill: Bill): boolean {
  return ["standing-committee", "other-house-committee", "js-committee"].includes(bill.stage);
}

export function overview(bills: Bill[] = BILLS) {
  const total = bills.length;
  const byType = (t: BillType) => bills.filter((b) => b.type === t).length;
  const byOutcome = (o: Outcome) => bills.filter((b) => b.outcome === o).length;
  const active = byOutcome("in-progress");
  const assented = byOutcome("assented");
  const withdrawn = byOutcome("withdrawn");
  const deferred = byOutcome("deferred");
  const passed = bills.filter(
    (b) => b.outcome === "passed" || b.outcome === "assented",
  ).length;
  const overdue = bills.filter(isOverdue).length;
  const dueSoon = bills.filter((b) => deadlineState(b) === "due-soon").length;
  const committeePending = bills.filter(isCommitteeStage).length;
  const responsePending = bills.filter(
    (b) => b.type === "private" && b.ministryStance === "pending",
  ).length;
  const awaitingAssent = bills.filter((b) => b.stage === "assent" || b.stage === "president").length;
  const avgStageAge = Math.round(
    bills.reduce((sum, b) => sum + stageAge(b), 0) / Math.max(1, bills.length),
  );
  const avgAge = Math.round(
    bills.reduce((sum, b) => sum + billAge(b), 0) / Math.max(1, bills.length),
  );
  const assentRate = Math.round((assented / Math.max(1, passed)) * 100);
  const compliance = Math.round(((total - overdue) / Math.max(1, total)) * 100);

  return {
    total,
    official: byType("official"),
    private: byType("private"),
    joint: byType("joint"),
    active,
    assented,
    passed,
    withdrawn,
    deferred,
    overdue,
    dueSoon,
    committeePending,
    responsePending,
    awaitingAssent,
    avgStageAge,
    avgAge,
    assentRate,
    compliance,
  };
}

export function stageDistribution(bills: Bill[] = BILLS) {
  const counts = new Map<string, number>();
  bills.forEach((bill) => {
    const label = STAGE_LIBRARY[bill.stage]?.short ?? bill.stage;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });
  return [...counts.entries()]
    .map(([stage, count]) => ({ stage, count }))
    .sort((a, b) => b.count - a.count);
}

export function ministryStats(bills: Bill[] = BILLS) {
  const rows = MINISTRIES.map((ministry) => {
    const own = bills.filter((b) => b.ministryId === ministry.id);
    return {
      ...ministry,
      total: own.length,
      active: own.filter((b) => b.outcome === "in-progress").length,
      assented: own.filter((b) => b.outcome === "assented").length,
      overdue: own.filter(isOverdue).length,
      committee: own.filter(isCommitteeStage).length,
      pendingResponses: own.filter(
        (b) => b.type === "private" && b.ministryStance === "pending",
      ).length,
      privateBills: own.filter((b) => b.type === "private").length,
    };
  });
  return rows.sort((a, b) => b.total - a.total);
}

export function houseStats(bills: Bill[] = BILLS) {
  const houses: { key: House; label: string }[] = [
    { key: "NA", label: "National Assembly" },
    { key: "Senate", label: "Senate" },
    { key: "Joint", label: "Joint Sitting" },
  ];
  return houses.map((h) => {
    const own = bills.filter((b) => b.house === h.key);
    return {
      ...h,
      total: own.length,
      active: own.filter((b) => b.outcome === "in-progress").length,
      assented: own.filter((b) => b.outcome === "assented").length,
      overdue: own.filter(isOverdue).length,
    };
  });
}

export function outcomeDistribution(bills: Bill[] = BILLS) {
  const keys: Outcome[] = ["in-progress", "assented", "passed", "deferred", "withdrawn"];
  return keys.map((key) => ({
    key,
    value: bills.filter((b) => b.outcome === key).length,
  }));
}

export function ageingBuckets(bills: Bill[] = BILLS) {
  const buckets = [
    { label: "0–30d", min: 0, max: 30 },
    { label: "31–60d", min: 31, max: 60 },
    { label: "61–90d", min: 61, max: 90 },
    { label: "90d+", min: 91, max: 10000 },
  ];
  return buckets.map((b) => ({
    ...b,
    NA: bills.filter((x) => x.house === "NA" && stageAge(x) >= b.min && stageAge(x) <= b.max).length,
    Senate: bills.filter(
      (x) => x.house === "Senate" && stageAge(x) >= b.min && stageAge(x) <= b.max,
    ).length,
    Joint: bills.filter(
      (x) => x.house === "Joint" && stageAge(x) >= b.min && stageAge(x) <= b.max,
    ).length,
  }));
}

export function typeSplit(bills: Bill[] = BILLS) {
  return [
    { key: "official", label: "Official Bills", value: bills.filter((b) => b.type === "official").length, color: "var(--chart-1)" },
    { key: "private", label: "Private Members'", value: bills.filter((b) => b.type === "private").length, color: "var(--chart-3)" },
    { key: "joint", label: "Joint Sitting", value: bills.filter((b) => b.type === "joint").length, color: "var(--chart-5)" },
  ];
}

export function alertsFor(role: RoleDefinition, alerts: Alert[], ministryId?: string) {
  return alerts.filter(
    (a) =>
      a.audience.includes(role.id) ||
      (role.scope === "ministry" && ministryId && a.ministryId === ministryId),
  );
}

export function stageIndex(bill: Bill): { index: number; total: number } {
  const stages = stagesFor(bill.type);
  const idx = stages.findIndex((s) => s.key === bill.stage);
  return { index: Math.max(0, idx), total: stages.length };
}

export function upcomingMilestones(bills: Bill[] = BILLS, limit = 5) {
  return bills
    .filter((b) => b.committeeDueAt && deadlineState(b) !== "none")
    .sort(
      (a, b) =>
        new Date(a.committeeDueAt!).getTime() - new Date(b.committeeDueAt!).getTime(),
    )
    .slice(0, limit);
}

export function recentBills(bills: Bill[] = BILLS, limit = 6) {
  return [...bills]
    .sort((a, b) => new Date(b.stageEnteredAt).getTime() - new Date(a.stageEnteredAt).getTime())
    .slice(0, limit);
}

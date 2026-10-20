import { describe, expect, it } from "vitest";
import { BILLS, DOCUMENTS, MINISTRIES, REPORTS, USERS } from "../data";
import { PERMISSION_GROUPS, ROLES, ROLE_ORDER, can, permissionLabel } from "../roles";
import { COMMITTEE_LIMITS, STAGE_LIBRARY, TRANSMISSION_LIMIT, stagesFor } from "../workflows";
import {
  ageingBuckets,
  deadlineState,
  houseStats,
  ministryStats,
  overview,
  stageDistribution,
  typeSplit,
} from "../metrics";
import { SYSTEM_DATE, daysBetween, deadlineDelta, deadlineLabel } from "../format";
import type { BillType, Permission } from "../types";

const TYPES: BillType[] = ["official", "private", "joint"];

describe("seeded legislative data", () => {
  it("registers a meaningful number of bills with unique IDs", () => {
    expect(BILLS.length).toBeGreaterThan(40);
    const ids = BILLS.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("uses the documented Bill ID format", () => {
    for (const bill of BILLS) {
      expect(bill.id).toMatch(/^MOPA-\d{4}-\d{4}$/);
    }
  });

  it("keeps every bill on a stage that exists in its own workflow", () => {
    for (const bill of BILLS) {
      const keys = stagesFor(bill.type).map((s) => s.key);
      expect(keys).toContain(bill.stage);
    }
  });

  it("records stage history in chronological order and starts with registration", () => {
    for (const bill of BILLS) {
      const times = bill.history.map((e) => new Date(e.at).getTime());
      const sorted = [...times].sort((a, b) => a - b);
      expect(times).toEqual(sorted);
      expect(bill.history[0].stage).toBe("registered");
    }
  });

  it("never registers a bill in the future", () => {
    for (const bill of BILLS) {
      expect(new Date(bill.registeredAt).getTime()).toBeLessThanOrEqual(SYSTEM_DATE.getTime());
    }
  });

  it("only sets committee deadlines on stages that carry one", () => {
    const committeeStages = [
      "standing-committee",
      "other-house-committee",
      "js-committee",
      "pre-admissibility",
      "transmitted",
    ];
    for (const bill of BILLS) {
      if (bill.committeeDueAt) {
        expect(committeeStages).toContain(bill.stage);
      }
    }
  });

  it("references real ministries and users", () => {
    const ministryIds = new Set(MINISTRIES.map((m) => m.id));
    for (const bill of BILLS) expect(ministryIds.has(bill.ministryId)).toBe(true);
    for (const user of USERS) expect(ROLE_ORDER).toContain(user.role);
  });

  it("ships all fifteen BRD reports with sequential numbering", () => {
    expect(REPORTS).toHaveLength(15);
    REPORTS.forEach((report, index) => expect(report.no).toBe(index + 1));
  });
});

describe("role-based access control", () => {
  it("defines every role exactly once", () => {
    expect(new Set(ROLE_ORDER).size).toBe(ROLE_ORDER.length);
    expect(ROLE_ORDER).toHaveLength(7);
    for (const id of ROLE_ORDER) expect(ROLES[id].id).toBe(id);
  });

  it("keeps the Prime Minister's Office strictly read-only", () => {
    const pmo = ROLES.pmo;
    const writes: Permission[] = [
      "bills.create",
      "bills.edit",
      "bills.delete",
      "stages.update",
      "documents.upload",
      "stance.submit",
      "approvals.act",
      "users.manage",
      "settings.manage",
    ];
    writes.forEach((permission) => expect(can(pmo, permission)).toBe(false));
    expect(can(pmo, "bills.view")).toBe(true);
    expect(can(pmo, "executive.view")).toBe(true);
  });

  it("lets the Super Admin do everything, including administration", () => {
    const admin = ROLES["super-admin"];
    expect(admin.permissions.length).toBeGreaterThan(20);
    expect(can(admin, "users.manage")).toBe(true);
    expect(can(admin, "audit.view")).toBe(true);
    expect(can(admin, "bills.delete")).toBe(true);
  });

  it("restricts ministries to responses, not stage records", () => {
    const ministry = ROLES.ministry;
    expect(can(ministry, "stance.submit")).toBe(true);
    expect(can(ministry, "stages.update")).toBe(false);
    expect(can(ministry, "bills.create")).toBe(false);
    expect(ministry.scope).toBe("ministry");
  });

  it("gives data managers create/update rights but no user administration", () => {
    const manager = ROLES["data-manager"];
    expect(can(manager, "bills.create")).toBe(true);
    expect(can(manager, "stages.update")).toBe(true);
    expect(can(manager, "users.manage")).toBe(false);
    expect(can(manager, "settings.manage")).toBe(false);
  });

  it("only grants approvals to senior roles", () => {
    const approvers = ROLE_ORDER.filter((r) => can(ROLES[r], "approvals.act"));
    expect(approvers.sort()).toEqual(["secretary", "super-admin"]);
  });

  it("labels every permission used in the matrix", () => {
    for (const group of PERMISSION_GROUPS) {
      for (const permission of group.permissions) {
        expect(permissionLabel(permission)).toBeTruthy();
      }
    }
  });
});

describe("workflows", () => {
  it("exposes three independent, non-empty templates", () => {
    const shapes = TYPES.map((type) => stagesFor(type).map((s) => s.key).join(">"));
    expect(shapes).toHaveLength(3);
    expect(new Set(shapes).size).toBe(3);
    TYPES.forEach((type) => expect(stagesFor(type).length).toBeGreaterThan(8));
  });

  it("only references defined stages", () => {
    for (const type of TYPES) {
      for (const stage of stagesFor(type)) {
        expect(STAGE_LIBRARY[stage.key]).toBeDefined();
      }
    }
  });

  it("requires Article 74 pre-admissibility for private members only", () => {
    const privateKeys = stagesFor("private").map((s) => s.key);
    const officialKeys = stagesFor("official").map((s) => s.key);
    expect(privateKeys).toContain("pre-admissibility");
    expect(officialKeys).not.toContain("pre-admissibility");
  });

  it("routes joint sitting bills through the committee on bills", () => {
    const jointKeys = stagesFor("joint").map((s) => s.key);
    expect(jointKeys).toContain("js-committee");
    expect(jointKeys).toContain("js-decision");
    expect(jointKeys[0]).toBe("js-reference");
  });

  it("encodes the statutory limits from the BRD", () => {
    expect(COMMITTEE_LIMITS.NA).toBe(30);
    expect(COMMITTEE_LIMITS.Senate).toBe(60);
    expect(TRANSMISSION_LIMIT).toBe(90);
  });
});

describe("dashboard metrics", () => {
  const stats = overview(BILLS);

  it("keeps portfolio totals internally consistent", () => {
    expect(stats.official + stats.private + stats.joint).toBe(stats.total);
    expect(stats.total).toBe(BILLS.length);
    expect(typeSplit(BILLS).reduce((sum, t) => sum + t.value, 0)).toBe(stats.total);
  });

  it("accounts for every bill in the stage distribution", () => {
    const sum = stageDistribution(BILLS).reduce((acc, row) => acc + row.count, 0);
    expect(sum).toBe(BILLS.length);
  });

  it("accounts for every bill across ministries and houses", () => {
    expect(ministryStats(BILLS).reduce((sum, m) => sum + m.total, 0)).toBe(BILLS.length);
    expect(houseStats(BILLS).reduce((sum, h) => sum + h.total, 0)).toBe(BILLS.length);
    expect(ageingBuckets(BILLS).reduce((sum, b) => sum + b.NA + b.Senate + b.Joint, 0)).toBe(
      BILLS.length,
    );
  });

  it("links every repository document to a registered bill", () => {
    const ids = new Set(BILLS.map((b) => b.id));
    for (const doc of DOCUMENTS) {
      expect(ids.has(doc.billId)).toBe(true);
    }
    expect(new Set(DOCUMENTS.map((d) => d.id)).size).toBe(DOCUMENTS.length);
  });

  it("keeps each bill's document counter aligned with the repository", () => {
    for (const bill of BILLS) {
      const filed = DOCUMENTS.filter((d) => d.billId === bill.id).length;
      expect(bill.documentCount).toBe(filed);
    }
  });

  it("derives the overdue count from the same deadline rule as the UI", () => {
    const overdue = BILLS.filter((bill) => deadlineState(bill) === "overdue").length;
    expect(stats.overdue).toBe(overdue);
  });

  it("keeps the executive summary within plausible bounds", () => {
    expect(stats.compliance).toBeGreaterThanOrEqual(0);
    expect(stats.compliance).toBeLessThanOrEqual(100);
    expect(stats.assentRate).toBeGreaterThanOrEqual(0);
    expect(stats.assentRate).toBeLessThanOrEqual(100);
    expect(stats.active).toBeLessThanOrEqual(stats.total);
  });
});

describe("date and deadline helpers", () => {
  it("measures elapsed days from the fixed system date", () => {
    expect(daysBetween(SYSTEM_DATE, SYSTEM_DATE)).toBe(0);
    expect(daysBetween("2026-10-10T00:00:00+05:00")).toBe(10);
  });

  it("describes overdue and upcoming deadlines", () => {
    expect(deadlineDelta("2026-10-15T00:00:00+05:00")).toBe(-5);
    expect(deadlineLabel("2026-10-15T00:00:00+05:00")).toBe("5d overdue");
    expect(deadlineLabel("2026-10-25T00:00:00+05:00")).toBe("5d left");
    expect(deadlineLabel("2026-10-20T00:00:00+05:00")).toBe("Due today");
  });
});

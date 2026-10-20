import type { Permission, RoleDefinition, RoleId } from "./types";

const ALL: Permission[] = [
  "bills.view",
  "bills.create",
  "bills.edit",
  "bills.delete",
  "bills.export",
  "stages.update",
  "documents.view",
  "documents.upload",
  "documents.classified",
  "stance.submit",
  "legal.review",
  "approvals.act",
  "od.manage",
  "alerts.view",
  "alerts.configure",
  "reports.view",
  "reports.generate",
  "audit.view",
  "users.manage",
  "settings.manage",
  "executive.view",
  "ministries.view",
];

export const ROLES: Record<RoleId, RoleDefinition> = {
  "super-admin": {
    id: "super-admin",
    name: "Super Admin",
    short: "Super Admin",
    org: "Ministry of Parliamentary Affairs",
    description:
      "Full system control — users, audit, configuration, every bill and correspondence.",
    brdRef: "BRD §13 · MoPA",
    permissions: ALL,
    scope: "nation",
    accent: "var(--brand)",
  },
  "data-manager": {
    id: "data-manager",
    name: "Legislative Data Manager",
    short: "Data Manager",
    org: "MoPA · Legislative Branch",
    description:
      "Registers bills, records stage updates, maintains documents and monitors deadlines.",
    brdRef: "BRD §13 · Branch User",
    permissions: [
      "bills.view",
      "bills.create",
      "bills.edit",
      "bills.export",
      "stages.update",
      "documents.view",
      "documents.upload",
      "stance.submit",
      "alerts.view",
      "reports.view",
      "reports.generate",
      "executive.view",
      "ministries.view",
    ],
    scope: "lodge",
    accent: "var(--chart-4)",
  },
  secretary: {
    id: "secretary",
    name: "Secretary / Senior Management",
    short: "Secretary",
    org: "Ministry of Parliamentary Affairs",
    description:
      "Approves endorsements, monitors the legislative pipeline and reads the executive view.",
    brdRef: "BRD §13 · Senior Management",
    permissions: [
      "bills.view",
      "bills.export",
      "documents.view",
      "approvals.act",
      "alerts.view",
      "reports.view",
      "reports.generate",
      "executive.view",
      "ministries.view",
      "audit.view",
    ],
    scope: "nation",
    accent: "var(--violet)",
  },
  ministry: {
    id: "ministry",
    name: "Concerned Ministry / Division",
    short: "Ministry",
    org: "Federal Ministry / Division",
    description:
      "Views bills received from MoPA and files Article 74 stances and consent responses.",
    brdRef: "BRD §13 · Ministries",
    permissions: [
      "bills.view",
      "documents.view",
      "documents.upload",
      "stance.submit",
      "alerts.view",
      "reports.view",
      "ministries.view",
    ],
    scope: "ministry",
    accent: "var(--gold)",
  },
  "law-justice": {
    id: "law-justice",
    name: "Law & Justice Division",
    short: "Law & Justice",
    org: "Ministry of Law and Justice",
    description:
      "Reviews legal requirements of every bill and records remarks before secretariat routing.",
    brdRef: "BRD §13 · Law & Justice",
    permissions: [
      "bills.view",
      "documents.view",
      "documents.upload",
      "legal.review",
      "alerts.view",
      "reports.view",
      "ministries.view",
    ],
    scope: "nation",
    accent: "var(--info)",
  },
  pmo: {
    id: "pmo",
    name: "Prime Minister's Office",
    short: "PMO",
    org: "Prime Minister's Office",
    description:
      "Read-only transparency across every bill, stage and outcome. No write path exists.",
    brdRef: "BRD §7, §8 · Read-only",
    permissions: ["bills.view", "documents.view", "alerts.view", "reports.view", "executive.view"],
    scope: "nation",
    accent: "var(--chart-6)",
  },
  secretariat: {
    id: "secretariat",
    name: "NA / Senate Secretariat",
    short: "Secretariat",
    org: "National Assembly & Senate",
    description:
      "Issues Orders of the Day, confirms receipt in House and records House decisions.",
    brdRef: "BRD §7 · Secretariats",
    permissions: [
      "bills.view",
      "bills.export",
      "documents.view",
      "documents.upload",
      "od.manage",
      "alerts.view",
      "reports.view",
      "reports.generate",
      "ministries.view",
    ],
    scope: "nation",
    accent: "var(--chart-2)",
  },
};

export const ROLE_ORDER: RoleId[] = [
  "super-admin",
  "data-manager",
  "secretary",
  "ministry",
  "law-justice",
  "pmo",
  "secretariat",
];

export function can(role: RoleDefinition | undefined, permission: Permission): boolean {
  return !!role?.permissions.includes(permission);
}

export function isReadOnly(role: RoleDefinition | undefined): boolean {
  return !can(role, "stages.update") && !can(role, "stance.submit") && !can(role, "legal.review");
}

const PERMISSION_LABELS: Record<Permission, string> = {
  "bills.view": "View bills",
  "bills.create": "Register bills",
  "bills.edit": "Edit bill records",
  "bills.delete": "Delete records",
  "bills.export": "Export data",
  "stages.update": "Update stages",
  "documents.view": "View documents",
  "documents.upload": "Upload documents",
  "documents.classified": "Classified files",
  "stance.submit": "Submit ministry stance",
  "legal.review": "Legal review",
  "approvals.act": "Approve endorsements",
  "od.manage": "Manage Orders of the Day",
  "alerts.view": "View alerts",
  "alerts.configure": "Configure alert rules",
  "reports.view": "View reports",
  "reports.generate": "Generate reports",
  "audit.view": "Read audit trail",
  "users.manage": "Manage users",
  "settings.manage": "System settings",
  "executive.view": "Executive dashboard",
  "ministries.view": "Ministry directory",
};

export const PERMISSION_GROUPS: { label: string; permissions: Permission[] }[] = [
  {
    label: "Legislative records",
    permissions: ["bills.view", "bills.create", "bills.edit", "bills.delete", "stages.update", "bills.export"],
  },
  {
    label: "Documents",
    permissions: ["documents.view", "documents.upload", "documents.classified"],
  },
  {
    label: "Responses & review",
    permissions: ["stance.submit", "legal.review", "approvals.act", "od.manage"],
  },
  {
    label: "Monitoring",
    permissions: ["alerts.view", "alerts.configure", "reports.view", "reports.generate", "audit.view"],
  },
  {
    label: "Administration",
    permissions: ["users.manage", "settings.manage"],
  },
];

export function permissionLabel(permission: Permission): string {
  return PERMISSION_LABELS[permission];
}

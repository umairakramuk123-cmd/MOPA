export type RoleId =
  | "super-admin"
  | "data-manager"
  | "secretary"
  | "ministry"
  | "law-justice"
  | "pmo"
  | "secretariat";

export type Permission =
  | "bills.view"
  | "bills.create"
  | "bills.edit"
  | "bills.delete"
  | "bills.export"
  | "stages.update"
  | "documents.view"
  | "documents.upload"
  | "documents.classified"
  | "stance.submit"
  | "legal.review"
  | "approvals.act"
  | "od.manage"
  | "alerts.view"
  | "alerts.configure"
  | "reports.view"
  | "reports.generate"
  | "audit.view"
  | "users.manage"
  | "settings.manage"
  | "executive.view"
  | "ministries.view";

export type BillType = "official" | "private" | "joint";
export type House = "NA" | "Senate" | "Joint";
export type Outcome =
  | "in-progress"
  | "passed"
  | "assented"
  | "withdrawn"
  | "deferred"
  | "lapsed";
export type Priority = "high" | "normal" | "low";

export type StageKey =
  // shared
  | "pre-introduction"
  | "pre-admissibility"
  | "admitted"
  | "order-of-the-day"
  | "introduced"
  | "standing-committee"
  | "report-presented"
  | "consideration"
  | "transmitted"
  | "other-house"
  | "other-house-committee"
  | "returned"
  | "joint-sitting"
  | "joint-committee"
  | "joint-report"
  | "assent"
  | "president"
  | "gazette"
  // joint sitting-specific
  | "js-reference"
  | "js-od"
  | "js-consideration"
  | "js-committee"
  | "js-report"
  | "js-decision";

export interface RoleDefinition {
  id: RoleId;
  name: string;
  short: string;
  org: string;
  description: string;
  brdRef: string;
  permissions: Permission[];
  scope: "ministry" | "lodge" | "nation";
  accent: string;
}

export interface BillEvent {
  id: string;
  at: string;
  stage: StageKey | "registered" | "response" | "legal-review" | "approval";
  actor: string;
  actorRole: RoleId;
  note: string;
  reference?: string;
}

export interface Bill {
  id: string;
  title: string;
  shortTitle: string;
  type: BillType;
  house: House;
  ministryId: string;
  memberInCharge: string;
  registeredAt: string;
  stage: StageKey;
  stageEnteredAt: string;
  outcome: Outcome;
  priority: Priority;
  documentCount: number;
  lastAction: string;
  summary: string;
  article74?: "applicable" | "not-applicable" | "under-review";
  cabinetConsent?: "received" | "pending" | "not-required";
  ministryStance?: "support" | "oppose" | "conditional" | "pending";
  legalReview?: "cleared" | "pending" | "objection";
  committeeDueAt?: string;
  transmissionAt?: string;
  history: BillEvent[];
}

export interface Ministry {
  id: string;
  name: string;
  short: string;
  code: string;
  contact: string;
  focalPerson: string;
  email: string;
  phone: string;
}

export interface User {
  id: string;
  name: string;
  initials: string;
  email: string;
  role: RoleId;
  ministryId?: string;
  status: "active" | "invited" | "disabled";
  mfa: boolean;
  lastActive: string;
  joinedAt: string;
}

export type AlertType =
  | "milestone"
  | "deadline"
  | "response"
  | "constitutional"
  | "assent"
  | "gazette";
export type AlertSeverity = "critical" | "warning" | "info";

export interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  billId: string;
  title: string;
  message: string;
  createdAt: string;
  dueAt?: string;
  status: "open" | "acknowledged" | "resolved";
  audience: RoleId[];
  ministryId?: string;
}

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  actorRole: RoleId;
  action: string;
  entity: string;
  entityId: string;
  before?: string;
  after?: string;
  reason?: string;
  ip: string;
}

export interface BillDocument {
  id: string;
  name: string;
  type:
    | "Bill Copy"
    | "Order of the Day"
    | "Committee Report"
    | "Ministry Response"
    | "Transmitted Copy"
    | "Presidential Message"
    | "Gazette Notification";
  billId: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  classification: "public" | "restricted" | "classified";
  version: number;
}

export interface ApprovalRequest {
  id: string;
  billId: string;
  title: string;
  submittedBy: string;
  submittedAt: string;
  status: "pending" | "approved" | "returned";
  kind: "Assent endorsement" | "Stage verification" | "Response review";
  note: string;
}

export interface ReportDefinition {
  id: string;
  no: number;
  name: string;
  description: string;
  category: "Registry" | "Progress" | "Compliance" | "Operations";
  fields: string[];
  formats: ("PDF" | "Excel")[];
  lastGenerated?: string;
}

export interface Session {
  user: User;
  role: RoleDefinition;
}

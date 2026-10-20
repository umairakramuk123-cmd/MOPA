import type { BillType, Outcome, StageKey } from "./types";

export interface StageDefinition {
  key: StageKey;
  label: string;
  short: string;
  description: string;
  gate: string;
  deadlineDays?: number;
}

const S = {
  preIntroduction: {
    key: "pre-introduction",
    label: "Pre-Introduction",
    short: "Pre-Intro",
    description: "Bill copy forwarded to the respective Secretariat after Law & Justice clearance.",
    gate: "Bill copy + forwarding date",
  },
  preAdmissibility: {
    key: "pre-admissibility",
    label: "Pre-Admissibility",
    short: "Pre-Adm.",
    description: "Article 74 stance and Federal Government consent captured from the concerned Ministry.",
    gate: "Article 74 stance + consent date",
    deadlineDays: 30,
  },
  admitted: {
    key: "admitted",
    label: "Admitted by Secretariat",
    short: "Admitted",
    description: "Secretariat admits the Private Member's Bill and schedules it for the House.",
    gate: "Admission date",
  },
  od: {
    key: "order-of-the-day",
    label: "Order of the Day",
    short: "OD",
    description: "Bill included in the Order of the Day and agenda of the sitting.",
    gate: "OD document + issuance date",
  },
  introduced: {
    key: "introduced",
    label: "Introduced & Referred",
    short: "Introduced",
    description: "Bill introduced in the House and referred to the Standing Committee.",
    gate: "Introduction + referral date",
  },
  sc: {
    key: "standing-committee",
    label: "Standing Committee",
    short: "Committee",
    description: "Standing Committee deliberations, meetings and delay recording.",
    gate: "Committee meeting dates",
    deadlineDays: 60,
  },
  report: {
    key: "report-presented",
    label: "Committee Report",
    short: "Report",
    description: "Committee report prepared, included in the OD and presented in the House.",
    gate: "Report document + OD date",
    deadlineDays: 30,
  },
  consideration: {
    key: "consideration",
    label: "Consideration & Passage",
    short: "Passage",
    description: "Bill considered in the House and put to decision — passed, deferred or withdrawn.",
    gate: "House decision date",
  },
  transmitted: {
    key: "transmitted",
    label: "Transmitted",
    short: "Transmitted",
    description: "Bill transmitted to the other House with a copy of the transmitted document.",
    gate: "Transmission date + copy",
    deadlineDays: 90,
  },
  otherHouse: {
    key: "other-house",
    label: "Other House",
    short: "Other House",
    description: "Circulation, notice and agenda inclusion in the receiving House.",
    gate: "Circulation date",
  },
  otherHouseCommittee: {
    key: "other-house-committee",
    label: "Other House Committee",
    short: "OH Committee",
    description: "Standing Committee of the receiving House reviews the transmitted Bill.",
    gate: "Committee dates",
    deadlineDays: 60,
  },
  returned: {
    key: "returned",
    label: "Referred Back",
    short: "Returned",
    description: "Bill passed with amendments and referred back to the originating House.",
    gate: "Amendment copy",
  },
  assent: {
    key: "assent",
    label: "MoPA Endorsement",
    short: "Endorsement",
    description: "MoPA endorses the Bill for the President's assent.",
    gate: "Endorsement date",
  },
  president: {
    key: "president",
    label: "President's Decision",
    short: "President",
    description: "Assented by the President or returned with a message.",
    gate: "Decision date",
  },
  gazette: {
    key: "gazette",
    label: "Gazette Notification",
    short: "Gazette",
    description: "Notification received by MoPA and Gazette copy of the notified Act archived.",
    gate: "Gazette copy of the Act",
    deadlineDays: 15,
  },
  jsReference: {
    key: "js-reference",
    label: "Referred to Joint Sitting",
    short: "Joint Ref.",
    description: "Bill referred to Joint Sitting after the 90-day Constitutional limit lapsed.",
    gate: "Referral date + reason",
  },
  jsOd: {
    key: "js-od",
    label: "Joint Sitting OD",
    short: "JS OD",
    description: "Order of the Day issued by the NA Secretariat for the Joint Sitting.",
    gate: "OD copy + date",
  },
  jsConsideration: {
    key: "js-consideration",
    label: "Joint Consideration",
    short: "JS Consider",
    description: "Bill considered by the Joint Sitting and referred to the Committee on Bills.",
    gate: "Consideration date",
  },
  jsCommittee: {
    key: "js-committee",
    label: "Committee on Bills",
    short: "JS Committee",
    description: "Committee on Bills meets and finalises its findings for the Joint Sitting.",
    gate: "Meeting dates",
    deadlineDays: 30,
  },
  jsReport: {
    key: "js-report",
    label: "JS Report",
    short: "JS Report",
    description: "Committee report included in the OD and presented in Joint Sitting.",
    gate: "Report document",
  },
  jsDecision: {
    key: "js-decision",
    label: "Joint Sitting Decision",
    short: "JS Decision",
    description: "Joint Sitting decides the Bill — passed, deferred or withdrawn.",
    gate: "Decision date",
  },
} satisfies Record<string, StageDefinition>;

const OFFICIAL: StageKey[] = [
  "pre-introduction",
  "order-of-the-day",
  "introduced",
  "standing-committee",
  "report-presented",
  "consideration",
  "transmitted",
  "other-house",
  "other-house-committee",
  "report-presented",
  "assent",
  "president",
  "gazette",
];

const PRIVATE: StageKey[] = [
  "pre-admissibility",
  "admitted",
  "order-of-the-day",
  "introduced",
  "standing-committee",
  "report-presented",
  "consideration",
  "transmitted",
  "other-house",
  "other-house-committee",
  "assent",
  "president",
  "gazette",
];

const JOINT: StageKey[] = [
  "js-reference",
  "js-od",
  "js-consideration",
  "js-committee",
  "js-report",
  "js-decision",
  "assent",
  "president",
  "gazette",
];

export const STAGE_LIBRARY: Record<StageKey, StageDefinition> = {
  "pre-introduction": S.preIntroduction,
  "pre-admissibility": S.preAdmissibility,
  admitted: S.admitted,
  "order-of-the-day": S.od,
  introduced: S.introduced,
  "standing-committee": S.sc,
  "report-presented": S.report,
  consideration: S.consideration,
  transmitted: S.transmitted,
  "other-house": S.otherHouse,
  "other-house-committee": S.otherHouseCommittee,
  returned: S.returned,
  "joint-sitting": S.jsReference,
  "joint-committee": S.jsCommittee,
  "joint-report": S.jsReport,
  assent: S.assent,
  president: S.president,
  gazette: S.gazette,
  "js-reference": S.jsReference,
  "js-od": S.jsOd,
  "js-consideration": S.jsConsideration,
  "js-committee": S.jsCommittee,
  "js-report": S.jsReport,
  "js-decision": S.jsDecision,
};

export function stagesFor(type: BillType): StageDefinition[] {
  const keys = type === "official" ? OFFICIAL : type === "private" ? PRIVATE : JOINT;
  return keys.map((k) => STAGE_LIBRARY[k]);
}

export const WORKFLOW_META: Record<
  BillType,
  { label: string; sub: string; color: string; houseRules: string }
> = {
  official: {
    label: "Official Bill",
    sub: "Government Bill",
    color: "var(--chart-1)",
    houseRules: "Law & Justice clearance → Secretariat forwarding → both Houses.",
  },
  private: {
    label: "Private Members' Bill",
    sub: "Non-Official Bill",
    color: "var(--chart-3)",
    houseRules: "Article 74 stance → Ministry consent → admission by Secretariat.",
  },
  joint: {
    label: "Joint Sitting",
    sub: "Constitutional referral",
    color: "var(--chart-5)",
    houseRules: "Triggered when the 90-day transmission limit lapses.",
  },
};

export const COMMITTEE_LIMITS = {
  NA: 30,
  Senate: 60,
  Joint: 30,
} as const;

export const TRANSMISSION_LIMIT = 90;

export const OUTCOME_META: Record<
  Outcome,
  { label: string; tone: "success" | "info" | "neutral" | "warning" | "danger" }
> = {
  "in-progress": { label: "In progress", tone: "info" },
  passed: { label: "Passed", tone: "success" },
  assented: { label: "Assented", tone: "success" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
  deferred: { label: "Deferred", tone: "warning" },
  lapsed: { label: "Lapsed", tone: "danger" },
};

export const TYPE_LABEL: Record<BillType, string> = {
  official: "Official",
  private: "Private Member",
  joint: "Joint Sitting",
};

export const HOUSE_LABEL: Record<string, string> = {
  NA: "National Assembly",
  Senate: "Senate",
  Joint: "Joint Sitting",
};

export const ALERT_TYPE_META = {
  milestone: { label: "Milestone", icon: "flag", tone: "info" as const },
  deadline: { label: "Deadline", icon: "clock", tone: "warning" as const },
  response: { label: "Ministry response", icon: "reply", tone: "warning" as const },
  constitutional: { label: "Constitutional limit", icon: "scale", tone: "danger" as const },
  assent: { label: "Presidential decision", icon: "stamp", tone: "info" as const },
  gazette: { label: "Gazette", icon: "newspaper", tone: "success" as const },
};

export const DOC_TYPES = [
  "Bill Copy",
  "Order of the Day",
  "Committee Report",
  "Ministry Response",
  "Transmitted Copy",
  "Presidential Message",
  "Gazette Notification",
] as const;

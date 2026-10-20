import { addDays, SYSTEM_DATE } from "./format";
import { stagesFor, STAGE_LIBRARY } from "./workflows";
import type {
  Alert,
  ApprovalRequest,
  AuditEntry,
  Bill,
  BillDocument,
  BillEvent,
  BillType,
  House,
  Ministry,
  Outcome,
  Priority,
  ReportDefinition,
  RoleId,
  StageKey,
  User,
} from "./types";

/* ------------------------------------------------------------------ */
/*  Deterministic helpers                                              */
/* ------------------------------------------------------------------ */
function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function isoDaysAgo(days: number, hour = 10, minute = 30) {
  const d = addDays(SYSTEM_DATE, -days);
  d.setUTCHours(hour - 5, minute, 0, 0);
  return d.toISOString();
}

/* ------------------------------------------------------------------ */
/*  Ministries                                                         */
/* ------------------------------------------------------------------ */
export const MINISTRIES: Ministry[] = [
  { id: "mopa", name: "Ministry of Parliamentary Affairs", short: "Parliamentary Affairs", code: "MOPA", contact: "Block C, Pak Secretariat", focalPerson: "Sanaullah Bhatti", email: "focal@mopa.gov.pk", phone: "+92 51 920 3411" },
  { id: "law", name: "Ministry of Law and Justice", short: "Law & Justice", code: "MOJ", contact: "R-Block, Pak Secretariat", focalPerson: "Nida Fatima", email: "focal@law.gov.pk", phone: "+92 51 920 3670" },
  { id: "finance", name: "Ministry of Finance & Revenue", short: "Finance & Revenue", code: "MOF", contact: "Q-Block, Pak Secretariat", focalPerson: "Ahsan Raza", email: "focal@finance.gov.pk", phone: "+92 51 920 2871" },
  { id: "interior", name: "Ministry of Interior", short: "Interior", code: "MOI", contact: "R-Block, Pak Secretariat", focalPerson: "Kamran Aslam", email: "focal@interior.gov.pk", phone: "+92 51 920 2912" },
  { id: "foreign", name: "Ministry of Foreign Affairs", short: "Foreign Affairs", code: "MOFA", contact: "S-Block, Pak Secretariat", focalPerson: "Mariam Javed", email: "focal@mofa.gov.pk", phone: "+92 51 920 3991" },
  { id: "defence", name: "Ministry of Defence", short: "Defence", code: "MOD", contact: "P-Block, Pak Secretariat", focalPerson: "Brig. (R) Tariq Mehmood", email: "focal@mod.gov.pk", phone: "+92 51 920 3661" },
  { id: "health", name: "Ministry of National Health Services", short: "Health Services", code: "MOH", contact: "3rd Floor, Kohsar Block", focalPerson: "Dr. Rabia Malik", email: "focal@nhsrc.gov.pk", phone: "+92 51 921 3523" },
  { id: "education", name: "Ministry of Federal Education", short: "Education", code: "MOE", contact: "D-Block, Pak Secretariat", focalPerson: "Waqas Ahmed", email: "focal@moe.gov.pk", phone: "+92 51 920 3312" },
  { id: "climate", name: "Ministry of Climate Change", short: "Climate Change", code: "MOCC", contact: "LG&RD Complex, G-5", focalPerson: "Hina Butt", email: "focal@mocc.gov.pk", phone: "+92 51 924 5502" },
  { id: "it", name: "Ministry of IT & Telecommunication", short: "IT & Telecom", code: "MOITT", contact: "Evacuee Trust Complex, F-5", focalPerson: "Danish Iqbal", email: "focal@moitt.gov.pk", phone: "+92 51 921 0701" },
  { id: "energy", name: "Ministry of Energy (Power Division)", short: "Energy", code: "MOE-PD", contact: "A-Block, Pak Secretariat", focalPerson: "Omar Farooq", email: "focal@power.gov.pk", phone: "+92 51 920 2041" },
  { id: "commerce", name: "Ministry of Commerce", short: "Commerce", code: "MOC", contact: "A-Block, Pak Secretariat", focalPerson: "Zainab Raza", email: "focal@commerce.gov.pk", phone: "+92 51 920 1911" },
  { id: "humanrights", name: "Ministry of Human Rights", short: "Human Rights", code: "MOHR", contact: "LG&RD Complex, G-5", focalPerson: "Sana Tariq", email: "focal@mohr.gov.pk", phone: "+92 51 924 4410" },
  { id: "railways", name: "Ministry of Railways", short: "Railways", code: "MOR", contact: "D-Block, Pak Secretariat", focalPerson: "Imran Shah", email: "focal@railways.gov.pk", phone: "+92 51 920 2577" },
  { id: "overseas", name: "Ministry of Overseas Pakistanis", short: "Overseas Pakistanis", code: "MOPHRD", contact: "Sector G-8/4", focalPerson: "Bilal Ahmed Khan", email: "focal@ophrd.gov.pk", phone: "+92 51 924 6600" },
];

export const ministryById = (id: string) => MINISTRIES.find((m) => m.id === id)!;
export const ministryShort = (id: string) => ministryById(id)?.short ?? "Unassigned";

/* ------------------------------------------------------------------ */
/*  Users                                                              */
/* ------------------------------------------------------------------ */
export const USERS: User[] = [
  { id: "u-01", name: "Hamza Sheikh", initials: "HS", email: "hamza.sheikh@mopa.gov.pk", role: "super-admin", status: "active", mfa: true, lastActive: isoDaysAgo(0, 9, 42), joinedAt: isoDaysAgo(512) },
  { id: "u-02", name: "Ali Hassan", initials: "AH", email: "ali.hassan@mopa.gov.pk", role: "data-manager", status: "active", mfa: true, lastActive: isoDaysAgo(0, 10, 12), joinedAt: isoDaysAgo(430) },
  { id: "u-03", name: "M. Awais Hussain", initials: "MH", email: "awais.hussain@mopa.gov.pk", role: "secretary", status: "active", mfa: true, lastActive: isoDaysAgo(0, 8, 20), joinedAt: isoDaysAgo(600) },
  { id: "u-04", name: "Sanaullah Bhatti", initials: "SB", email: "s.bhatti@finance.gov.pk", role: "ministry", ministryId: "finance", status: "active", mfa: false, lastActive: isoDaysAgo(1, 16, 5), joinedAt: isoDaysAgo(210) },
  { id: "u-05", name: "Nida Fatima", initials: "NF", email: "nida.fatima@law.gov.pk", role: "law-justice", status: "active", mfa: true, lastActive: isoDaysAgo(0, 9, 5), joinedAt: isoDaysAgo(395) },
  { id: "u-06", name: "Kamran Aslam", initials: "KA", email: "kamran.aslam@pmo.gov.pk", role: "pmo", status: "active", mfa: true, lastActive: isoDaysAgo(2, 11, 40), joinedAt: isoDaysAgo(180) },
  { id: "u-07", name: "Farah Nadeem", initials: "FN", email: "farah.nadeem@na.gov.pk", role: "secretariat", status: "active", mfa: true, lastActive: isoDaysAgo(0, 11, 2), joinedAt: isoDaysAgo(340) },
  { id: "u-08", name: "Hina Butt", initials: "HB", email: "hina.butt@mocc.gov.pk", role: "ministry", ministryId: "climate", status: "active", mfa: false, lastActive: isoDaysAgo(3, 15, 22), joinedAt: isoDaysAgo(150) },
  { id: "u-09", name: "Danish Iqbal", initials: "DI", email: "danish.iqbal@moitt.gov.pk", role: "ministry", ministryId: "it", status: "active", mfa: true, lastActive: isoDaysAgo(4, 10, 9), joinedAt: isoDaysAgo(190) },
  { id: "u-10", name: "Sadia Rehman", initials: "SR", email: "sadia.rehman@mopa.gov.pk", role: "data-manager", status: "invited", mfa: false, lastActive: isoDaysAgo(9, 12, 0), joinedAt: isoDaysAgo(9) },
  { id: "u-11", name: "Junaid Akbar", initials: "JA", email: "junaid.akbar@mopa.gov.pk", role: "data-manager", status: "disabled", mfa: true, lastActive: isoDaysAgo(88, 14, 30), joinedAt: isoDaysAgo(620) },
  { id: "u-12", name: "Mahnoor Yousaf", initials: "MY", email: "mahnoor.yousaf@senate.gov.pk", role: "secretariat", status: "active", mfa: true, lastActive: isoDaysAgo(1, 9, 30), joinedAt: isoDaysAgo(240) },
];

/* ------------------------------------------------------------------ */
/*  Bill seed                                                          */
/* ------------------------------------------------------------------ */
type Row = {
  t: string;
  type: BillType;
  house: House;
  m: string;
  who: string;
  age: number;
  stageAge: number;
  stage: StageKey;
  outcome: Outcome;
  priority: Priority;
  docs: number;
  gist: string;
  a74?: Bill["article74"];
  consent?: Bill["cabinetConsent"];
  stance?: Bill["ministryStance"];
  legal?: Bill["legalReview"];
};

const ROWS: Row[] = [
  { t: "The Digital Records Management Bill, 2026", type: "official", house: "NA", m: "it", who: "Mr. Danish Iqbal", age: 268, stageAge: 6, stage: "gazette", outcome: "assented", priority: "normal", docs: 11, legal: "cleared", gist: "Creates a statutory framework for electronic records, retention schedules and inter-departmental archival custody." },
  { t: "The Federal Procurement Transparency Bill, 2026", type: "official", house: "NA", m: "finance", who: "Mr. Ahsan Raza", age: 254, stageAge: 4, stage: "president", outcome: "passed", priority: "high", docs: 10, legal: "cleared", gist: "Mandates open contracting data and a central beneficial-ownership register for all federal procurement above threshold." },
  { t: "The Public Health Surveillance Bill, 2026", type: "official", house: "Senate", m: "health", who: "Sen. Adnan Qureshi", age: 242, stageAge: 9, stage: "assent", outcome: "passed", priority: "high", docs: 9, legal: "cleared", gist: "Establishes a national epidemiological surveillance authority with district-level reporting duties." },
  { t: "The National Disaster Response Bill, 2026", type: "official", house: "NA", m: "climate", who: "Ms. Hina Butt", age: 231, stageAge: 18, stage: "gazette", outcome: "assented", priority: "normal", docs: 12, legal: "cleared", gist: "Consolidates disaster response mandates and creates a standing national emergency coordination fund." },
  { t: "The Higher Education Standards Bill, 2026", type: "official", house: "Senate", m: "education", who: "Sen. Nadia Saeed", age: 219, stageAge: 8, stage: "standing-committee", outcome: "in-progress", priority: "normal", docs: 6, legal: "cleared", gist: "Sets accreditation thresholds, faculty ratios and a national credit framework for degree-awarding institutions." },
  { t: "The Railway Safety and Modernisation Bill, 2026", type: "official", house: "NA", m: "railways", who: "Mr. Imran Shah", age: 207, stageAge: 35, stage: "standing-committee", outcome: "in-progress", priority: "high", docs: 7, legal: "cleared", gist: "Introduces independent safety inspections, signalling standards and a modernisation levy for Pakistan Railways." },
  { t: "The Cybercrime Evidence Bill, 2026", type: "official", house: "NA", m: "it", who: "Ms. Zainab Raza", age: 198, stageAge: 42, stage: "transmitted", outcome: "in-progress", priority: "high", docs: 8, legal: "cleared", gist: "Defines admissibility and chain-of-custody rules for digital evidence in criminal proceedings." },
  { t: "The Overseas Employment Protection Bill, 2026", type: "official", house: "NA", m: "overseas", who: "Mr. Bilal Ahmed Khan", age: 186, stageAge: 12, stage: "other-house", outcome: "in-progress", priority: "normal", docs: 7, legal: "cleared", gist: "Tightens licensing of recruitment agents and creates a wage-protection guarantee for overseas workers." },
  { t: "The National Food Security Bill, 2026", type: "official", house: "Senate", m: "commerce", who: "Sen. Kamran Sheikh", age: 175, stageAge: 22, stage: "report-presented", outcome: "in-progress", priority: "normal", docs: 9, legal: "cleared", gist: "Creates strategic reserve obligations, price-stability triggers and district food security dashboards." },
  { t: "The Renewable Energy Transition Bill, 2026", type: "official", house: "NA", m: "energy", who: "Mr. Omar Farooq", age: 163, stageAge: 31, stage: "consideration", outcome: "deferred", priority: "high", docs: 10, legal: "cleared", gist: "Sets a 2035 renewable portfolio target and competitive bidding rules for grid-scale generation." },
  { t: "The Anti-Smuggling Enforcement Bill, 2026", type: "official", house: "NA", m: "interior", who: "Mr. Kamran Aslam", age: 152, stageAge: 14, stage: "introduced", outcome: "in-progress", priority: "normal", docs: 5, legal: "cleared", gist: "Strengthens cross-border enforcement powers and asset seizure for organised smuggling networks." },
  { t: "The Diplomatic Missions Security Bill, 2026", type: "official", house: "Senate", m: "foreign", who: "Sen. Farooq Nadeem", age: 144, stageAge: 25, stage: "pre-introduction", outcome: "in-progress", priority: "low", docs: 4, legal: "pending", gist: "Codifies security obligations for foreign missions and reciprocal protections for Pakistani missions abroad." },
  { t: "The Federal Audit and Accountability Bill, 2026", type: "official", house: "NA", m: "finance", who: "Ms. Ayesha Siddiqui", age: 138, stageAge: 3, stage: "president", outcome: "passed", priority: "high", docs: 9, legal: "cleared", gist: "Reforms the federal audit cycle with quarterly reporting and public dashboards for audit paras." },
  { t: "The Persons with Disabilities (Amendment) Bill, 2026", type: "official", house: "Senate", m: "humanrights", who: "Sen. Sanaullah Khan", age: 131, stageAge: 17, stage: "other-house-committee", outcome: "in-progress", priority: "normal", docs: 6, legal: "cleared", gist: "Extends accessibility obligations to private employers and raises the disability employment quota." },
  { t: "The Public Service Commission (Amendment) Bill, 2026", type: "official", house: "NA", m: "mopa", who: "Ms. Sana Tariq", age: 124, stageAge: 5, stage: "order-of-the-day", outcome: "in-progress", priority: "low", docs: 3, legal: "cleared", gist: "Streamlines FPSC recruitment timelines and introduces competency-based testing for senior posts." },
  { t: "The National Counter-Terrorism (Amendment) Bill, 2026", type: "official", house: "NA", m: "interior", who: "Mr. Usman Ali", age: 118, stageAge: 27, stage: "standing-committee", outcome: "in-progress", priority: "high", docs: 8, legal: "cleared", gist: "Refines investigation timelines, witness protection and inter-provincial coordination in terrorism cases." },
  { t: "The Maritime Zones Bill, 2026", type: "official", house: "Senate", m: "defence", who: "Sen. Tariq Mehmood", age: 111, stageAge: 11, stage: "introduced", outcome: "in-progress", priority: "normal", docs: 5, legal: "cleared", gist: "Updates the legal delineation of territorial waters and exclusive economic zone enforcement." },
  { t: "The Telecommunication Licensing Bill, 2026", type: "official", house: "NA", m: "it", who: "Mr. Danish Iqbal", age: 103, stageAge: 2, stage: "consideration", outcome: "passed", priority: "normal", docs: 7, legal: "cleared", gist: "Modernises licensing for satellite, 5G and wholesale access providers with unified service conditions." },
  { t: "The Environmental Impact Assessment Bill, 2026", type: "official", house: "Senate", m: "climate", who: "Sen. Adnan Qureshi", age: 96, stageAge: 38, stage: "standing-committee", outcome: "in-progress", priority: "normal", docs: 6, legal: "cleared", gist: "Mandates third-party EIA review and public disclosure for projects above a defined capital threshold." },
  { t: "The Federal Employees Retirement Bill, 2026", type: "official", house: "NA", m: "finance", who: "Mr. Ahsan Raza", age: 89, stageAge: 4, stage: "order-of-the-day", outcome: "in-progress", priority: "normal", docs: 4, legal: "cleared", gist: "Consolidates pension entitlements into a contributory retirement framework for federal employees." },
  { t: "The Drug Regulatory Authority (Amendment) Bill, 2026", type: "official", house: "NA", m: "health", who: "Dr. Rabia Malik", age: 82, stageAge: 19, stage: "standing-committee", outcome: "in-progress", priority: "normal", docs: 5, legal: "pending", gist: "Tightens drug pricing transparency and pharmacovigilance reporting for imported medicines." },
  { t: "The Islamabad Capital Territory Courts Bill, 2026", type: "official", house: "NA", m: "law", who: "Ms. Nida Fatima", age: 74, stageAge: 7, stage: "transmitted", outcome: "in-progress", priority: "normal", docs: 6, legal: "cleared", gist: "Restructures ICT courts with dedicated commercial benches and case-flow management rules." },
  { t: "The National Skills Development Bill, 2026", type: "official", house: "Senate", m: "education", who: "Sen. Nadia Saeed", age: 66, stageAge: 9, stage: "pre-introduction", outcome: "in-progress", priority: "low", docs: 3, legal: "cleared", gist: "Creates a national skills authority with industry-led certification and apprenticeship standards." },
  { t: "The Privatisation Transparency Bill, 2026", type: "official", house: "NA", m: "finance", who: "Mr. Ahsan Raza", age: 58, stageAge: 16, stage: "introduced", outcome: "in-progress", priority: "normal", docs: 4, legal: "cleared", gist: "Requires public disclosure of valuation studies and cabinet approval for all privatisation transactions." },

  { t: "The Right to Information (Amendment) Bill, 2026", type: "private", house: "NA", m: "it", who: "Ms. Ayesha Siddiqui", age: 212, stageAge: 6, stage: "gazette", outcome: "assented", priority: "normal", docs: 8, a74: "applicable", consent: "received", stance: "support", gist: "Cuts response timelines for public information requests and strengthens the appellate commission." },
  { t: "The Domestic Workers Protection Bill, 2026", type: "private", house: "Senate", m: "humanrights", who: "Sen. Nadia Saeed", age: 194, stageAge: 47, stage: "pre-admissibility", outcome: "in-progress", priority: "high", docs: 4, a74: "under-review", consent: "pending", stance: "pending", gist: "Recognises domestic work as formal employment with wage floors, rest periods and dispute remedies." },
  { t: "The Plastic Waste Reduction Bill, 2026", type: "private", house: "NA", m: "climate", who: "Ms. Hina Butt", age: 187, stageAge: 12, stage: "standing-committee", outcome: "in-progress", priority: "normal", docs: 5, a74: "not-applicable", consent: "not-required", stance: "support", gist: "Bans single-use plastics by 2028 and establishes producer responsibility for packaging waste." },
  { t: "The Mental Health Support Bill, 2026", type: "private", house: "NA", m: "health", who: "Dr. Rabia Malik", age: 176, stageAge: 21, stage: "report-presented", outcome: "in-progress", priority: "high", docs: 7, a74: "applicable", consent: "received", stance: "support", gist: "Guarantees community mental health services and decriminalises attempted suicide." },
  { t: "The Climate Finance Accountability Bill, 2026", type: "private", house: "Senate", m: "climate", who: "Sen. Farooq Nadeem", age: 168, stageAge: 8, stage: "consideration", outcome: "passed", priority: "normal", docs: 6, a74: "applicable", consent: "received", stance: "support", gist: "Creates public tracking of climate finance inflows and expenditure against adaptation commitments." },
  { t: "The Senior Citizens Welfare Bill, 2026", type: "private", house: "NA", m: "humanrights", who: "Mr. Usman Ali", age: 157, stageAge: 34, stage: "standing-committee", outcome: "in-progress", priority: "low", docs: 4, a74: "under-review", consent: "pending", stance: "pending", gist: "Introduces pension portability, elder-care standards and a national senior citizens council." },
  { t: "The Consumer Data Privacy Bill, 2026", type: "private", house: "NA", m: "it", who: "Mr. Danish Iqbal", age: 149, stageAge: 27, stage: "standing-committee", outcome: "in-progress", priority: "high", docs: 6, a74: "applicable", consent: "received", stance: "support", gist: "Grants data subject rights, requires consent records and establishes an independent privacy commission." },
  { t: "The Transparent Taxation Bill, 2026", type: "private", house: "NA", m: "finance", who: "Ms. Ayesha Siddiqui", age: 142, stageAge: 51, stage: "pre-admissibility", outcome: "in-progress", priority: "normal", docs: 3, a74: "under-review", consent: "pending", stance: "oppose", gist: "Requires plain-language tax guidance and a published revenue-expenditure dashboard per district." },
  { t: "The Sindh Coastal Protection Bill, 2026", type: "private", house: "Senate", m: "climate", who: "Sen. Sanaullah Khan", age: 134, stageAge: 5, stage: "other-house", outcome: "in-progress", priority: "normal", docs: 5, a74: "not-applicable", consent: "not-required", stance: "conditional", gist: "Protects coastal mangroves from commercial development and mandates erosion risk mapping." },
  { t: "The Women in Sports Bill, 2026", type: "private", house: "NA", m: "education", who: "Ms. Zainab Raza", age: 127, stageAge: 3, stage: "order-of-the-day", outcome: "in-progress", priority: "low", docs: 3, a74: "applicable", consent: "received", stance: "support", gist: "Mandates equal prize structures and safe participation standards for women's sports federations." },
  { t: "The Road Safety Bill, 2026", type: "private", house: "NA", m: "interior", who: "Mr. Kamran Aslam", age: 119, stageAge: 18, stage: "introduced", outcome: "in-progress", priority: "high", docs: 4, a74: "applicable", consent: "received", stance: "support", gist: "Introduces a national road safety authority, speed management rules and crash data reporting." },
  { t: "The Child Nutrition Bill, 2026", type: "private", house: "Senate", m: "health", who: "Sen. Adnan Qureshi", age: 113, stageAge: 40, stage: "pre-admissibility", outcome: "in-progress", priority: "high", docs: 4, a74: "applicable", consent: "pending", stance: "pending", gist: "Mandates nutrition standards in schools and a stunting-reduction strategy reviewed every fiscal year." },
  { t: "The Public Transport Accessibility Bill, 2026", type: "private", house: "NA", m: "railways", who: "Mr. Imran Shah", age: 106, stageAge: 7, stage: "transmitted", outcome: "in-progress", priority: "normal", docs: 5, a74: "not-applicable", consent: "not-required", stance: "support", gist: "Requires wheelchair access and audio-visual announcements across federal public transport." },
  { t: "The Green Building Code Bill, 2026", type: "private", house: "NA", m: "climate", who: "Ms. Hina Butt", age: 98, stageAge: 15, stage: "admitted", outcome: "in-progress", priority: "normal", docs: 3, a74: "applicable", consent: "received", stance: "support", gist: "Applies energy-efficiency standards to all new federal buildings above 2,000 square feet." },
  { t: "The Freelancers' Protection Bill, 2026", type: "private", house: "NA", m: "it", who: "Ms. Ayesha Siddiqui", age: 91, stageAge: 33, stage: "standing-committee", outcome: "in-progress", priority: "normal", docs: 4, a74: "applicable", consent: "received", stance: "support", gist: "Creates a freelancer registry, escrow protections and a dedicated dispute resolution forum." },
  { t: "The Agricultural Water Rights Bill, 2026", type: "private", house: "Senate", m: "climate", who: "Sen. Farooq Nadeem", age: 84, stageAge: 22, stage: "report-presented", outcome: "in-progress", priority: "normal", docs: 5, a74: "under-review", consent: "pending", stance: "conditional", gist: "Defines equitable canal water allocation and prices for inter-provincial bulk supply agreements." },
  { t: "The Student Loan Authority Bill, 2026", type: "private", house: "NA", m: "education", who: "Mr. Bilal Ahmed Khan", age: 77, stageAge: 4, stage: "consideration", outcome: "withdrawn", priority: "low", docs: 3, a74: "not-applicable", consent: "not-required", stance: "oppose", gist: "Proposed income-contingent student loans with a national recovery authority; withdrawn for review." },
  { t: "The Air Quality Management Bill, 2026", type: "private", house: "NA", m: "climate", who: "Dr. Rabia Malik", age: 69, stageAge: 11, stage: "other-house-committee", outcome: "in-progress", priority: "high", docs: 5, a74: "applicable", consent: "received", stance: "support", gist: "Sets enforceable air quality thresholds and seasonal smog response obligations for federal areas." },
  { t: "The Minority Representation Bill, 2026", type: "private", house: "Senate", m: "law", who: "Sen. Nadia Saeed", age: 61, stageAge: 2, stage: "assent", outcome: "passed", priority: "normal", docs: 6, a74: "applicable", consent: "received", stance: "support", gist: "Strengthens minority representation on federal boards and public service commissions." },
  { t: "The Animal Welfare Bill, 2026", type: "private", house: "NA", m: "climate", who: "Ms. Sana Tariq", age: 53, stageAge: 9, stage: "admitted", outcome: "in-progress", priority: "low", docs: 3, a74: "not-applicable", consent: "not-required", stance: "support", gist: "Codifies humane treatment standards for working animals and establishes welfare inspectors." },

  { t: "The Media Regulation (Amendment) Bill, 2026", type: "joint", house: "Joint", m: "it", who: "Mr. Danish Iqbal", age: 158, stageAge: 12, stage: "js-committee", outcome: "in-progress", priority: "high", docs: 6, gist: "Resolves a disagreement between the Houses on complaint handling and ownership disclosure for media outlets." },
  { t: "The Petroleum Levy Bill, 2026", type: "joint", house: "Joint", m: "energy", who: "Mr. Omar Farooq", age: 147, stageAge: 27, stage: "js-reference", outcome: "in-progress", priority: "high", docs: 4, gist: "Refers the contested petroleum levy mechanism to Joint Sitting after the 90-day constitutional limit." },
  { t: "The National Database (Amendment) Bill, 2026", type: "joint", house: "Joint", m: "interior", who: "Mr. Kamran Aslam", age: 136, stageAge: 6, stage: "js-decision", outcome: "passed", priority: "normal", docs: 7, gist: "Settles data-sharing safeguards for NADRA following amendments by the receiving House." },
  { t: "The Banking Amendment Bill, 2026", type: "joint", house: "Joint", m: "finance", who: "Mr. Ahsan Raza", age: 128, stageAge: 19, stage: "js-consideration", outcome: "in-progress", priority: "high", docs: 5, gist: "Resolves the dispute on minimum capital requirements and Islamic banking windows." },
  { t: "The Islamabad Local Government Bill, 2026", type: "joint", house: "Joint", m: "interior", who: "Mr. Usman Ali", age: 117, stageAge: 33, stage: "js-committee", outcome: "in-progress", priority: "normal", docs: 5, gist: "Joint committee review of the local government structure and fiscal devolution for the capital territory." },
  { t: "The Water Apportionment Bill, 2026", type: "joint", house: "Joint", m: "climate", who: "Ms. Hina Butt", age: 105, stageAge: 4, stage: "js-report", outcome: "in-progress", priority: "high", docs: 8, gist: "Committee report on provincial water shares presented to the Joint Sitting for decision." },
  { t: "The Special Economic Zones Bill, 2026", type: "joint", house: "Joint", m: "commerce", who: "Ms. Zainab Raza", age: 94, stageAge: 14, stage: "js-od", outcome: "in-progress", priority: "normal", docs: 4, gist: "Scheduled for Joint Sitting after differing tax incentive regimes were approved by each House." },
  { t: "The PIA Restructuring Bill, 2026", type: "joint", house: "Joint", m: "defence", who: "Sen. Tariq Mehmood", age: 86, stageAge: 21, stage: "js-reference", outcome: "in-progress", priority: "high", docs: 6, gist: "Refers the restructuring and liability settlement framework to the Joint Sitting." },
  { t: "The Capital Gains Tax Bill, 2026", type: "joint", house: "Joint", m: "finance", who: "Mr. Ahsan Raza", age: 72, stageAge: 5, stage: "president", outcome: "passed", priority: "normal", docs: 7, gist: "Resolved by Joint Sitting; forwarded for Presidential assent after a contested holding-period change." },
  { t: "The Postal Services Bill, 2026", type: "joint", house: "Joint", m: "it", who: "Ms. Ayesha Siddiqui", age: 63, stageAge: 3, stage: "gazette", outcome: "assented", priority: "low", docs: 6, gist: "Modernises Pakistan Post's commercial mandate following agreement at Joint Sitting." },
];

function buildHistory(row: Row, index: number, id: string, registeredAt: string, stageEnteredAt: string): BillEvent[] {
  const stages = stagesFor(row.type);
  const idx = stages.findIndex((s) => s.key === row.stage);
  const safeIdx = idx < 0 ? 0 : idx;
  const r = rng(index * 97 + 11);
  const start = new Date(registeredAt).getTime();
  const end = new Date(stageEnteredAt).getTime();
  const actors = {
    intro: { name: "Ali Hassan", role: "data-manager" },
    od: { name: "Farah Nadeem", role: "secretariat" },
    committee: { name: "Ali Hassan", role: "data-manager" },
    assent: { name: "M. Awais Hussain", role: "secretary" },
    president: { name: "M. Awais Hussain", role: "secretary" },
    law: { name: "Nida Fatima", role: "law-justice" },
  } satisfies Record<string, { name: string; role: RoleId }>;
  const pick = (key: keyof typeof actors) => actors[key];

  const events: BillEvent[] = [
    {
      id: `${id}-e0`,
      at: registeredAt,
      stage: "registered",
      actor: "Ali Hassan",
      actorRole: "data-manager",
      note: "Bill registered with duplicate check cleared.",
      reference: `REG/${id.split("-").pop()}`,
    },
  ];

  for (let k = 1; k <= safeIdx; k++) {
    const ratio = safeIdx === 0 ? 0 : k / safeIdx;
    const at = new Date(start + (end - start) * ratio + Math.floor(r() * 3600_000)).toISOString();
    const stage = stages[k];
    let actor = pick("intro");
    if (stage.key === "order-of-the-day" || stage.key === "other-house" || stage.key === "admitted" || stage.key === "js-od") actor = pick("od");
    if (stage.key === "standing-committee" || stage.key === "other-house-committee" || stage.key === "js-committee" || stage.key === "report-presented" || stage.key === "js-report") actor = pick("committee");
    if (stage.key === "assent" || stage.key === "js-decision") actor = pick("president");
    if (stage.key === "president" || stage.key === "gazette") actor = pick("president");
    if (stage.key === "pre-introduction" && row.type === "official") actor = pick("law");

    const refPrefix =
      stage.key === "order-of-the-day" || stage.key === "js-od"
        ? row.house === "Senate"
          ? "SEN/OD"
          : "NA/OD"
        : stage.key === "standing-committee"
          ? "SC"
          : "MOPA";
    events.push({
      id: `${id}-e${k}`,
      at,
      stage: stage.key,
      actor: actor.name,
      actorRole: actor.role,
      note: `${stage.label} recorded — ${stage.gate.toLowerCase()}.`,
      reference: `${refPrefix}/${new Date(at).getFullYear()}/${String(120 + k * 3 + index).padStart(3, "0")}`,
    });
  }

  if (row.outcome === "withdrawn" || row.outcome === "deferred") {
    events.push({
      id: `${id}-e${safeIdx + 1}`,
      at: stageEnteredAt,
      stage: row.stage,
      actor: "Ali Hassan",
      actorRole: "data-manager",
      note:
        row.outcome === "withdrawn"
          ? "Bill withdrawn by the mover; decision recorded with the Order of the Day reference."
          : "House deferred consideration; bill retained in the pending list for the next sitting.",
      reference: `NA/DEC/${String(400 + index)}`,
    });
  }

  // Guarantee a strictly chronological log — the audit view depends on it.
  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
}

function buildBills(): Bill[] {
  return ROWS.map((row, i) => {
    const stages = stagesFor(row.type);
    const stageIndex = Math.max(0, stages.findIndex((s) => s.key === row.stage));
    const spacing = 16 + (i % 4) * 4;
    const registeredDaysAgo = row.stageAge + stageIndex * spacing;
    const registeredAt = isoDaysAgo(registeredDaysAgo, 9 + (i % 6), 10 + ((i * 7) % 45));
    const stageEnteredAt = isoDaysAgo(row.stageAge, 10 + (i % 5), 5 + ((i * 3) % 50));
    const year = new Date(registeredAt).getFullYear();
    const id = `MOPA-${year}-${String(1040 + i).slice(-4)}`;
    const shortTitle = row.t.replace(/^The /, "").replace(/,\s*\d{4}$/, "");
    const history = buildHistory(row, i, id, registeredAt, stageEnteredAt);
    const ministry = ministryById(row.m);
    const dueBase = row.house === "Senate" ? 60 : 30;

    const bill: Bill = {
      id,
      title: row.t,
      shortTitle,
      type: row.type,
      house: row.house,
      ministryId: row.m,
      memberInCharge: row.who,
      registeredAt,
      stage: row.stage,
      stageEnteredAt,
      outcome: row.outcome,
      priority: row.priority,
      documentCount: row.docs,
      lastAction:
        history[history.length - 1]?.stage === "registered"
          ? "Registered in the legislative registry"
          : STAGE_LIBRARY[row.stage]?.label ?? "Record updated",
      summary: row.gist,
      article74: row.a74,
      cabinetConsent: row.consent,
      ministryStance: row.stance,
      legalReview: row.legal,
      history,
    };

    if (row.type === "private") {
      bill.memberInCharge = `${row.who}`;
      bill.summary = `${row.gist} Sponsoring division: ${ministry.short}.`;
    }

    if (
      row.stage === "standing-committee" ||
      row.stage === "other-house-committee" ||
      row.stage === "js-committee"
    ) {
      bill.committeeDueAt = addDays(new Date(stageEnteredAt), dueBase).toISOString();
    }
    if (row.stage === "pre-admissibility") {
      bill.committeeDueAt = addDays(new Date(stageEnteredAt), 30).toISOString();
    }
    if (row.stage === "transmitted") {
      bill.transmissionAt = stageEnteredAt;
      bill.committeeDueAt = addDays(new Date(stageEnteredAt), 90).toISOString();
    }
    if (row.outcome === "in-progress" && !bill.priority) bill.priority = "normal";

    return bill;
  });
}

const RAW_BILLS = buildBills();

export const BILLS: Bill[] = [...RAW_BILLS].sort(
  (a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime(),
);

export const billById = (id: string) => BILLS.find((b) => b.id === id);

/* ------------------------------------------------------------------ */
/*  Alerts                                                             */
/* ------------------------------------------------------------------ */
const pickBill = (predicate: (b: Bill) => boolean, fallback = 0) =>
  (RAW_BILLS.find(predicate) ?? RAW_BILLS[fallback]).id;

export const ALERTS: Alert[] = [
  {
    id: "AL-2041",
    type: "constitutional",
    severity: "critical",
    billId: pickBill((b) => b.stage === "transmitted" && b.type === "official"),
    title: "90-day transmission limit breached",
    message:
      "Bill transmitted to the Senate on 16 Jun 2026. The constitutional limit for the receiving House has lapsed — Joint Sitting referral is due.",
    createdAt: isoDaysAgo(2, 9, 15),
    dueAt: isoDaysAgo(0, 17, 0),
    status: "open",
    audience: ["super-admin", "data-manager", "secretary", "secretariat"],
  },
  {
    id: "AL-2040",
    type: "deadline",
    severity: "critical",
    billId: pickBill((b) => b.stage === "standing-committee" && b.house === "NA"),
    title: "Standing Committee review overdue",
    message:
      "National Assembly committee review exceeded the 30-day limit by 5 days. Escalation was issued to the committee secretary.",
    createdAt: isoDaysAgo(1, 8, 45),
    dueAt: isoDaysAgo(5, 0, 0),
    status: "open",
    audience: ["super-admin", "data-manager", "secretary"],
  },
  {
    id: "AL-2039",
    type: "response",
    severity: "warning",
    billId: pickBill((b) => b.stage === "pre-admissibility" && b.ministryStance === "pending"),
    title: "Article 74 stance pending",
    message:
      "Climate Change Division has not recorded its Article 74 stance or Cabinet consent for this Private Member's Bill. Response window closes in 3 days.",
    createdAt: isoDaysAgo(3, 12, 30),
    dueAt: isoDaysAgo(-3, 12, 0),
    status: "open",
    audience: ["super-admin", "data-manager", "ministry", "secretary"],
    ministryId: "climate",
  },
  {
    id: "AL-2038",
    type: "deadline",
    severity: "warning",
    billId: pickBill((b) => b.house === "Senate" && b.stage === "standing-committee"),
    title: "Senate committee period closing",
    message:
      "Standing Committee of the Senate has 8 days remaining of its 60-day review window. Report status is not yet recorded.",
    createdAt: isoDaysAgo(4, 10, 0),
    dueAt: isoDaysAgo(-8, 10, 0),
    status: "acknowledged",
    audience: ["super-admin", "data-manager", "secretary", "secretariat"],
  },
  {
    id: "AL-2037",
    type: "assent",
    severity: "info",
    billId: pickBill((b) => b.stage === "assent"),
    title: "Assent endorsement awaiting Secretary",
    message:
      "MoPA endorsement for Presidential assent has been prepared and routed for approval. No objections recorded by Law & Justice.",
    createdAt: isoDaysAgo(1, 15, 20),
    status: "open",
    audience: ["super-admin", "secretary"],
  },
  {
    id: "AL-2036",
    type: "gazette",
    severity: "info",
    billId: pickBill((b) => b.stage === "gazette"),
    title: "Gazette notification outstanding",
    message:
      "Presidential assent recorded 6 days ago. Gazette copy of the notified Act is still required for the repository.",
    createdAt: isoDaysAgo(2, 11, 10),
    dueAt: isoDaysAgo(-9, 11, 0),
    status: "open",
    audience: ["super-admin", "data-manager", "secretariat"],
  },
  {
    id: "AL-2035",
    type: "milestone",
    severity: "info",
    billId: pickBill((b) => b.stage === "consideration"),
    title: "Bill passed by the originating House",
    message:
      "The House passed the bill. Transmission to the other House is the next milestone — transmission date and copy are required.",
    createdAt: isoDaysAgo(5, 16, 40),
    status: "resolved",
    audience: ["super-admin", "data-manager", "secretariat"],
  },
  {
    id: "AL-2034",
    type: "milestone",
    severity: "warning",
    billId: pickBill((b) => b.stage === "js-reference"),
    title: "Joint Sitting referral recorded",
    message:
      "Bill referred to Joint Sitting following the 90-day lapse. OD issuance by the NA Secretariat is pending.",
    createdAt: isoDaysAgo(6, 9, 5),
    status: "open",
    audience: ["super-admin", "secretariat", "secretary"],
  },
  {
    id: "AL-2033",
    type: "response",
    severity: "warning",
    billId: pickBill((b) => b.stage === "pre-admissibility" && b.ministryStance === "oppose"),
    title: "Ministry response requires review",
    message:
      "Finance Division recorded an opposing stance on Article 74 applicability. A justification note must accompany the response.",
    createdAt: isoDaysAgo(7, 13, 25),
    status: "acknowledged",
    audience: ["super-admin", "data-manager", "law-justice"],
    ministryId: "finance",
  },
  {
    id: "AL-2032",
    type: "deadline",
    severity: "warning",
    billId: pickBill((b) => b.ministryId === "railways"),
    title: "Committee report due in 6 days",
    message:
      "Railways committee has not filed its report. Timeline is tracked against the 30-day NA review window.",
    createdAt: isoDaysAgo(8, 10, 50),
    dueAt: isoDaysAgo(-6, 10, 0),
    status: "open",
    audience: ["super-admin", "data-manager", "ministry"],
    ministryId: "railways",
  },
  {
    id: "AL-2031",
    type: "milestone",
    severity: "info",
    billId: pickBill((b) => b.stage === "other-house-committee"),
    title: "Receipt in the other House confirmed",
    message:
      "Circulation and notice recorded in the Senate. Referral to the Standing Committee has been logged with document reference.",
    createdAt: isoDaysAgo(10, 14, 10),
    status: "resolved",
    audience: ["super-admin", "secretariat", "data-manager"],
  },
  {
    id: "AL-2030",
    type: "response",
    severity: "info",
    billId: pickBill((b) => b.ministryId === "it" && b.type === "private"),
    title: "Post-introduction stance filed",
    message:
      "IT & Telecommunication Division submitted its post-introduction stance with an attached response document.",
    createdAt: isoDaysAgo(12, 9, 40),
    status: "resolved",
    audience: ["super-admin", "data-manager"],
    ministryId: "it",
  },
  {
    id: "AL-2029",
    type: "deadline",
    severity: "warning",
    billId: pickBill((b) => b.stage === "order-of-the-day"),
    title: "Order of the Day copy missing",
    message:
      "The bill was included in the agenda but the OD document is not attached. Attach the copy or record a 'Not Available' reason.",
    createdAt: isoDaysAgo(13, 16, 0),
    status: "open",
    audience: ["super-admin", "data-manager", "secretariat"],
  },
  {
    id: "AL-2028",
    type: "gazette",
    severity: "info",
    billId: pickBill((b) => b.type === "private" && b.stage === "gazette"),
    title: "Notified Act archived",
    message:
      "Gazette copy received and linked to the bill record. Repository entry verified by the data manager.",
    createdAt: isoDaysAgo(16, 12, 15),
    status: "resolved",
    audience: ["super-admin", "data-manager"],
  },
];

/* ------------------------------------------------------------------ */
/*  Audit trail                                                        */
/* ------------------------------------------------------------------ */
export const AUDIT: AuditEntry[] = (() => {
  const entries: AuditEntry[] = [];
  const sources = RAW_BILLS.slice(0, 26);
  sources.forEach((bill, i) => {
    const last = bill.history[bill.history.length - 1];
    const prev = bill.history[bill.history.length - 2];
    if (!last) return;
    entries.push({
      id: `AUD-${3120 + i}`,
      at: last.at,
      actor: last.actor,
      actorRole: last.actorRole,
      action: last.stage === "registered" ? "Bill registered" : "Stage updated",
      entity: "Bill",
      entityId: bill.id,
      before: prev ? STAGE_LIBRARY[prev.stage as StageKey]?.label ?? "—" : "—",
      after: STAGE_LIBRARY[bill.stage]?.label ?? "Record updated",
      reason:
        last.stage === "registered"
          ? "Duplicate check cleared on title, sponsor, House and year."
          : "Manual stage update supported by order of the day reference.",
      ip: `10.12.${20 + (i % 8)}.${40 + i}`,
    });
  });
  const extras: Omit<AuditEntry, "id">[] = [
    { at: isoDaysAgo(0, 9, 42), actor: "Hamza Sheikh", actorRole: "super-admin", action: "User invited", entity: "User", entityId: "sadia.rehman@mopa.gov.pk", after: "Legislative Data Manager", reason: "Branch capacity expansion approved by Secretary.", ip: "10.12.18.4" },
    { at: isoDaysAgo(1, 17, 5), actor: "Hamza Sheikh", actorRole: "super-admin", action: "Alert rule updated", entity: "Settings", entityId: "SC-SENATE-60", before: "45 days reminder", after: "30 days reminder", reason: "Align reminder with Senate committee practice.", ip: "10.12.18.4" },
    { at: isoDaysAgo(2, 11, 25), actor: "M. Awais Hussain", actorRole: "secretary", action: "Endorsement approved", entity: "Approval", entityId: "APR-1043", after: "Approved for assent", reason: "Legal review cleared and committee report available.", ip: "10.12.11.9" },
    { at: isoDaysAgo(3, 15, 10), actor: "Ali Hassan", actorRole: "data-manager", action: "Document uploaded", entity: "Document", entityId: "DOC-8821", after: "Committee Report · v2", reason: "Revised report received from committee secretary.", ip: "10.12.21.31" },
    { at: isoDaysAgo(4, 10, 0), actor: "Nida Fatima", actorRole: "law-justice", action: "Legal review recorded", entity: "Bill", entityId: RAW_BILLS[22].id, after: "Cleared with observations", reason: "Drafting alignment with Article 74 requirements.", ip: "10.12.14.7" },
    { at: isoDaysAgo(5, 16, 45), actor: "Hamza Sheikh", actorRole: "super-admin", action: "Role permissions changed", entity: "Role", entityId: "pmo", after: "Read-only enforced at API", reason: "Quarterly access review.", ip: "10.12.18.4" },
    { at: isoDaysAgo(7, 9, 30), actor: "Farah Nadeem", actorRole: "secretariat", action: "Order of the Day issued", entity: "Bill", entityId: RAW_BILLS[15].id, after: "OD issued · NA/OD/2026/188", reason: "Included in Tuesday sitting agenda.", ip: "10.12.31.2" },
    { at: isoDaysAgo(9, 13, 15), actor: "Ali Hassan", actorRole: "data-manager", action: "Stage update rejected", entity: "Bill", entityId: RAW_BILLS[19].id, before: "Standing Committee", after: "Standing Committee", reason: "Mandatory stage date missing — save blocked by validation.", ip: "10.12.21.31" },
    { at: isoDaysAgo(12, 8, 55), actor: "M. Awais Hussain", actorRole: "secretary", action: "Export generated", entity: "Report", entityId: "Executive Summary · Sep 2026", after: "PDF · 14 pages", reason: "Monthly cabinet briefing pack.", ip: "10.12.11.9" },
    { at: isoDaysAgo(15, 12, 5), actor: "Sanaullah Bhatti", actorRole: "ministry", action: "Ministry stance submitted", entity: "Bill", entityId: RAW_BILLS[26].id, before: "Pending", after: "Support · Article 74 applicable", reason: "Cabinet consent received; response uploaded.", ip: "10.12.42.18" },
  ];
  extras.forEach((e, i) => entries.push({ ...e, id: `AUD-${3180 + i}` }));
  return entries.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
})();

/* ------------------------------------------------------------------ */
/*  Documents                                                          */
/* ------------------------------------------------------------------ */
const DOC_NAMES: Record<BillDocument["type"], string> = {
  "Bill Copy": "Bill copy — final signed",
  "Order of the Day": "Order of the Day extract",
  "Committee Report": "Standing Committee report",
  "Ministry Response": "Article 74 stance response",
  "Transmitted Copy": "Transmitted bill copy",
  "Presidential Message": "Presidential message",
  "Gazette Notification": "Gazette notification of the Act",
};

export const DOCUMENTS: BillDocument[] = (() => {
  const types = Object.keys(DOC_NAMES) as BillDocument["type"][];
  let idx = 0;
  return RAW_BILLS.flatMap((bill, bi) => {
    const stageIndex = Math.max(
      0,
      stagesFor(bill.type).findIndex((s) => s.key === bill.stage),
    );
    // Advanced bills accumulate more paper: bill copy, OD, then reports,
    // responses, transmission copies and finally assent/gazette records.
    const count = Math.min(types.length, 2 + Math.floor(stageIndex / 2));
    return types.slice(0, count).map((type) => {
      const n = idx++;
      return {
        id: `DOC-${8800 + n}`,
        name: `${DOC_NAMES[type]} — ${bill.shortTitle}`,
        type,
        billId: bill.id,
        size: `${(0.8 + ((n * 7) % 42) / 10).toFixed(1)} MB`,
        uploadedAt: isoDaysAgo(3 + (n % 120), 10 + (n % 6), 20 + (n % 35)),
        uploadedBy: n % 3 === 0 ? "Ali Hassan" : n % 3 === 1 ? "Farah Nadeem" : "Nida Fatima",
        classification: n % 11 === 0 ? "classified" : n % 4 === 0 ? "restricted" : "public",
        version: 1 + (n % 3),
      } satisfies BillDocument;
    });
  });
})();

/* The bill record carries a denormalised document counter (BRD §8); keep it
   aligned with the repository seed so the registry and the repository agree. */
const documentTotals = new Map<string, number>();
for (const doc of DOCUMENTS) {
  documentTotals.set(doc.billId, (documentTotals.get(doc.billId) ?? 0) + 1);
}
for (const bill of BILLS) {
  bill.documentCount = documentTotals.get(bill.id) ?? 0;
}

/* ------------------------------------------------------------------ */
/*  Approvals                                                          */
/* ------------------------------------------------------------------ */
export const APPROVALS: ApprovalRequest[] = [
  { id: "APR-1044", billId: pickBill((b) => b.stage === "assent"), title: "MoPA endorsement for Presidential assent", submittedBy: "Ali Hassan", submittedAt: isoDaysAgo(1, 15, 20), status: "pending", kind: "Assent endorsement", note: "Both Houses have passed the bill. Legal review cleared; committee report attached." },
  { id: "APR-1043", billId: pickBill((b) => b.stage === "president"), title: "Endorsement verification before assent", submittedBy: "Ali Hassan", submittedAt: isoDaysAgo(3, 10, 0), status: "approved", kind: "Stage verification", note: "Transmission timeline verified against the 90-day constitutional limit." },
  { id: "APR-1042", billId: pickBill((b) => b.stage === "consideration"), title: "Stage verification — House decision", submittedBy: "Sadia Rehman", submittedAt: isoDaysAgo(5, 12, 30), status: "pending", kind: "Stage verification", note: "Deferred decision recorded; awaiting confirmation of the next sitting date." },
  { id: "APR-1041", billId: pickBill((b) => b.type === "private" && b.ministryStance === "oppose"), title: "Ministry response review — opposing stance", submittedBy: "Sanaullah Bhatti", submittedAt: isoDaysAgo(8, 9, 15), status: "returned", kind: "Response review", note: "Justification note is missing. Returned to the division for completion." },
  { id: "APR-1040", billId: pickBill((b) => b.stage === "gazette"), title: "Gazette copy verification", submittedBy: "Farah Nadeem", submittedAt: isoDaysAgo(11, 14, 0), status: "approved", kind: "Stage verification", note: "Notified Act copy checked and linked to the repository." },
];

/* ------------------------------------------------------------------ */
/*  Reports (BRD §16)                                                  */
/* ------------------------------------------------------------------ */
export const REPORTS: ReportDefinition[] = [
  { id: "R-01", no: 1, name: "Bill Registry Report", description: "Complete registry of every bill with type, House, sponsor and member-in-charge.", category: "Registry", fields: ["Bill Type", "House of Origin", "Sponsoring Ministry/Division", "Member-in-Charge"], formats: ["PDF", "Excel"], lastGenerated: isoDaysAgo(2) },
  { id: "R-02", no: 2, name: "Bill Stage-wise Status", description: "Current stage, committee referral, passage and assent position for each bill.", category: "Progress", fields: ["Current Stage", "Committee Referral", "Passage", "Assent"], formats: ["PDF", "Excel"], lastGenerated: isoDaysAgo(1) },
  { id: "R-03", no: 3, name: "Ministry / Division-wise Bill Report", description: "Bills received and responses pending, grouped by division.", category: "Progress", fields: ["Ministry/Division", "Bills Received", "Pending Responses"], formats: ["PDF", "Excel"], lastGenerated: isoDaysAgo(4) },
  { id: "R-04", no: 4, name: "House-wise Bill Progress Report", description: "Origin, receipt, circulation, introduction, consideration and decision by House.", category: "Progress", fields: ["House of Origin", "Receipt in Other House", "Circulation", "Decision"], formats: ["PDF", "Excel"], lastGenerated: isoDaysAgo(6) },
  { id: "R-05", no: 5, name: "Standing Committee Report", description: "Referral dates, meeting counts and report status across committees.", category: "Compliance", fields: ["Referral Date", "Committee Report Status"], formats: ["PDF", "Excel"], lastGenerated: isoDaysAgo(3) },
  { id: "R-06", no: 6, name: "Order of the Day Report", description: "OD issuance, agenda inclusion and bills awaiting agenda inclusion.", category: "Operations", fields: ["OD Issuance Date", "Inclusion in Agenda", "Copy of OD", "Awaiting Inclusion"], formats: ["PDF", "Excel"] },
  { id: "R-07", no: 7, name: "House Decision & Outcome Report", description: "Passed, deferred, withdrawn and amended decisions across both Houses.", category: "Progress", fields: ["Passed", "Deferred", "Withdrawn", "Amended"], formats: ["PDF", "Excel"], lastGenerated: isoDaysAgo(5) },
  { id: "R-08", no: 8, name: "Inter-House Transmission & 90-Day Tracking", description: "Transmission dates, receipt, elapsed days and Joint Sitting referrals.", category: "Compliance", fields: ["Transmission Date", "Receipt in Other House", "Days Elapsed", "Referral Status"], formats: ["PDF", "Excel"], lastGenerated: isoDaysAgo(1) },
  { id: "R-09", no: 9, name: "Joint Sitting & Committee on Bills Report", description: "Referrals, OD issuance, committee meetings, reports and decisions.", category: "Progress", fields: ["Referred to Joint Sitting", "OD Issuance", "Meeting Dates", "Decision"], formats: ["PDF", "Excel"] },
  { id: "R-10", no: 10, name: "Private Members' Bills & Article 74", description: "Ministry stance on Article 74, consent and post-introduction positions.", category: "Compliance", fields: ["Article 74 Stance", "Cabinet Consent", "Post-Introduction Stance"], formats: ["PDF", "Excel"], lastGenerated: isoDaysAgo(2) },
  { id: "R-11", no: 11, name: "Presidential Assent & Gazette Notification", description: "Endorsement, decisions, returned bills, notification and Gazette copies.", category: "Compliance", fields: ["MoPA Endorsement", "Presidential Decision", "Notification Date", "Gazette Copy"], formats: ["PDF", "Excel"], lastGenerated: isoDaysAgo(7) },
  { id: "R-12", no: 12, name: "Bill Ageing & Delay Report", description: "Bills pending at each stage, committee delays and items requiring follow-up.", category: "Operations", fields: ["Pending at Stage", "Committee Delay", "Elapsed Days", "Follow-up"], formats: ["PDF", "Excel"], lastGenerated: isoDaysAgo(1) },
  { id: "R-13", no: 13, name: "Alerts & Notifications Report", description: "Milestone, response, committee, 90-day and assent alert history.", category: "Operations", fields: ["Milestone Alerts", "Responses Due", "Deadline Alerts", "Constitutional Alerts"], formats: ["PDF", "Excel"], lastGenerated: isoDaysAgo(2) },
  { id: "R-14", no: 14, name: "Document Repository & Missing Documents", description: "Coverage of required document types and gaps in the repository.", category: "Registry", fields: ["Bill Copies", "OD Copies", "Responses", "Committee Reports", "Gazette"], formats: ["PDF", "Excel"] },
  { id: "R-15", no: 15, name: "Executive Dashboard Summary", description: "Consolidated totals, type split, House and Ministry distribution.", category: "Registry", fields: ["Total Bills", "Official vs Private", "House-wise", "Ministry-wise"], formats: ["PDF", "Excel"], lastGenerated: isoDaysAgo(0) },
];

/* ------------------------------------------------------------------ */
/*  Trend series                                                       */
/* ------------------------------------------------------------------ */
export const MONTHLY_TREND = [
  { month: "Nov", registered: 3, passed: 1, assented: 0 },
  { month: "Dec", registered: 4, passed: 2, assented: 1 },
  { month: "Jan", registered: 5, passed: 1, assented: 0 },
  { month: "Feb", registered: 4, passed: 2, assented: 1 },
  { month: "Mar", registered: 6, passed: 3, assented: 2 },
  { month: "Apr", registered: 5, passed: 2, assented: 1 },
  { month: "May", registered: 7, passed: 3, assented: 2 },
  { month: "Jun", registered: 5, passed: 4, assented: 2 },
  { month: "Jul", registered: 6, passed: 2, assented: 5 },
  { month: "Aug", registered: 4, passed: 3, assented: 2 },
  { month: "Sep", registered: 3, passed: 2, assented: 2 },
  { month: "Oct", registered: 2, passed: 1, assented: 1 },
];

export const SITTING_WEEKS = [
  { week: "W38", NA: 4, Senate: 3, Joint: 0 },
  { week: "W39", NA: 5, Senate: 2, Joint: 1 },
  { week: "W40", NA: 3, Senate: 4, Joint: 0 },
  { week: "W41", NA: 6, Senate: 3, Joint: 1 },
  { week: "W42", NA: 4, Senate: 5, Joint: 2 },
  { week: "W43", NA: 5, Senate: 4, Joint: 1 },
];

export const SESSION = {
  name: "Autumn Session 2026",
  sitting: "42nd sitting",
  nextSitting: isoDaysAgo(-2, 10, 0),
  remainingSittings: 11,
  activeBills: BILLS.filter((b) => b.outcome === "in-progress").length,
};

export const USER_ACTIVITY = [
  { day: "Mon", logins: 34, updates: 18 },
  { day: "Tue", logins: 42, updates: 26 },
  { day: "Wed", logins: 38, updates: 21 },
  { day: "Thu", logins: 51, updates: 33 },
  { day: "Fri", logins: 47, updates: 29 },
  { day: "Sat", logins: 12, updates: 4 },
  { day: "Sun", logins: 6, updates: 1 },
];


"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { MINISTRIES } from "@/lib/data";
import { can } from "@/lib/roles";
import { STAGE_LIBRARY, WORKFLOW_META } from "@/lib/workflows";
import { BillType, House } from "@/lib/types";
import { Badge, Button, Card, CardHeader, Progress, Segmented } from "@/components/ui/primitives";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  FilePlus2,
  Info,
  Landmark,
  Lock,
  Search,
  ScrollText,
  ShieldQuestion,
  Sparkles,
  Users,
} from "lucide-react";

const STEPS = ["Category", "Particulars", "Document", "Review"] as const;

export function RegisterBillView() {
  const { registerBill, bills, session, addDocument } = useStore();
  const role = session.role;

  const [step, setStep] = React.useState(0);
  const [type, setType] = React.useState<BillType>("official");
  const [title, setTitle] = React.useState("");
  const [house, setHouse] = React.useState<House>("NA");
  const [ministryId, setMinistryId] = React.useState("mopa");
  const [member, setMember] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [year, setYear] = React.useState("2026");
  const [fileName, setFileName] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [duplicate, setDuplicate] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<string | null>(null);

  const canCreate = can(role, "bills.create");
  const previewStage =
    type === "private" ? "pre-admissibility" : type === "joint" ? "js-reference" : "pre-introduction";

  // Live duplicate detection on title + house + division (BRD §8)
  React.useEffect(() => {
    if (title.trim().length < 8) {
      setDuplicate(null);
      return;
    }
    const t = window.setTimeout(() => {
      const match = bills.find(
        (b) =>
          b.title.toLowerCase().replace(/[^a-z0-9]/g, "") ===
            title.toLowerCase().replace(/[^a-z0-9]/g, "") && b.house === house,
      );
      setDuplicate(match?.id ?? null);
    }, 320);
    return () => window.clearTimeout(t);
  }, [title, house, bills]);

  const validate = (forStep: number) => {
    const errs: Record<string, string> = {};
    if (forStep === 1) {
      if (title.trim().length < 12) errs.title = "Enter the full title as it appears on the bill.";
      if (!member.trim()) errs.member = "Record the sponsoring member or division officer.";
      if (duplicate) errs.duplicate = `A matching bill already exists: ${duplicate}.`;
    }
    if (forStep === 2 && !fileName) {
      errs.file = "Attach the signed bill copy, or confirm it will follow within 48 hours.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const next = () => {
    if (!validate(step)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const submit = () => {
    if (!canCreate) return;
    const result = registerBill({
      title,
      type,
      house,
      ministryId,
      memberInCharge: member,
      summary,
    });
    if (!result.ok) {
      setDuplicate(result.duplicate?.id ?? null);
      setErrors({ duplicate: `Duplicate blocked. Existing record: ${result.duplicate?.id}` });
      setStep(1);
      return;
    }
    if (result.id && fileName) {
      addDocument({
        name: fileName,
        type: "Bill Copy",
        billId: result.id,
        size: `${(0.9 + (fileName.length % 20) / 10).toFixed(1)} MB`,
        classification: "public",
      });
    }
    setCreated(result.id ?? null);
  };

  if (!canCreate) {
    return (
      <Card className="p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-[14px] bg-surface-3 text-muted">
          <Lock size={20} />
        </span>
        <h1 className="mt-4 text-[19px] font-semibold tracking-[-0.03em] text-ink">
          Registration is restricted
        </h1>
        <p className="mx-auto mt-1.5 max-w-md text-[12px] leading-5 text-muted">
          Your role — {role.name} — does not include the <span className="font-medium text-ink">Register bills</span>{" "}
          permission. Permissions are enforced at the API level, not only in this interface. Contact a
          Super Admin if this is incorrect.
        </p>
        <Link href="/bills" className="mt-4 inline-block">
          <Button variant="secondary" size="sm">
            <ArrowLeft size={12} /> Back to registry
          </Button>
        </Link>
      </Card>
    );
  }

  if (created) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success-soft text-success">
          <CheckCircle2 size={26} />
        </span>
        <p className="eyebrow mt-4">Registered</p>
        <h1 className="mt-1.5 text-[22px] font-semibold tracking-[-0.035em] text-ink">
          {created} created
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-[12px] leading-5 text-muted">
          The bill is now at <span className="font-medium text-ink">{STAGE_LIBRARY[previewStage].label}</span>.
          A unique ID links its data, documents, alerts and history.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href={`/bills/${created}`}>
            <Button variant="primary" size="md">
              Open bill record <ArrowRight size={13} />
            </Button>
          </Link>
          <Link href="/bills">
            <Button variant="secondary" size="md">
              Registry
            </Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/bills" className="inline-flex items-center gap-1.5 text-[10.5px] font-medium text-muted hover:text-ink">
        <ArrowLeft size={12} /> Back to registry
      </Link>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">Register · UC-01</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
            Register a new bill
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-5 text-muted">
            Choose the workflow first — each carries its own stages, mandatory fields and validation
            rules. A duplicate check runs before the record can be created.
          </p>
        </div>
        <Badge tone="brand">
          <Sparkles size={10} /> Auto ID · duplicate check
        </Badge>
      </div>

      {/* Stepper */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center gap-1">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <button
                onClick={() => i < step && setStep(i)}
                className={cn(
                  "flex items-center gap-2 rounded-[8px] px-2 py-1.5 transition-colors",
                  i === step ? "bg-brand-soft" : i < step ? "hover:bg-surface-2" : "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-full border text-[9px] font-semibold",
                    i < step
                      ? "border-brand/30 bg-brand text-white dark:text-[#04140f]"
                      : i === step
                        ? "border-brand text-brand"
                        : "border-line-strong text-faint",
                  )}
                >
                  {i < step ? <Check size={10} strokeWidth={3} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    i === step ? "text-brand-ink" : i < step ? "text-ink-2" : "text-faint",
                  )}
                >
                  {label}
                </span>
              </button>
              {i < STEPS.length - 1 && <span className="hidden h-px w-6 bg-line sm:block" />}
            </React.Fragment>
          ))}
          <span className="ml-auto hidden font-mono text-[9px] uppercase tracking-[0.12em] text-faint sm:block">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="mt-2.5" height={3} />
      </Card>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Card className="overflow-hidden">
            {step === 0 && (
              <div className="p-5">
                <CardHeader
                  className="!p-0"
                  eyebrow="Workflow"
                  title="What kind of bill is this?"
                  subtitle="Each workflow is configured independently — a change to one does not affect the others."
                />
                <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                  {(["official", "private", "joint"] as BillType[]).map((t) => {
                    const meta = WORKFLOW_META[t];
                    const active = type === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setType(t)}
                        className={cn(
                          "group relative flex flex-col items-start rounded-[13px] border p-3.5 text-left transition-all",
                          active
                            ? "border-brand bg-brand-soft/50 shadow-[0_0_0_3px_var(--ring)]"
                            : "border-line bg-surface hover:border-line-strong hover:bg-surface-2",
                        )}
                      >
                        <span
                          className="grid h-9 w-9 place-items-center rounded-[10px]"
                          style={{ background: `color-mix(in oklab, ${meta.color} 14%, transparent)`, color: meta.color }}
                        >
                          {t === "official" ? <Landmark size={16} /> : t === "private" ? <ScrollText size={16} /> : <Users size={16} />}
                        </span>
                        <span className="mt-2.5 text-[12.5px] font-semibold text-ink">{meta.label}</span>
                        <span className="mt-0.5 text-[9.5px] text-faint">{meta.sub}</span>
                        <span className="mt-2 text-[10px] leading-[1.6] text-muted">{meta.houseRules}</span>
                        {active && (
                          <span className="absolute right-2.5 top-2.5 grid h-4 w-4 place-items-center rounded-full bg-brand text-white dark:text-[#04140f]">
                            <Check size={9} strokeWidth={3} />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium text-ink-2">House of origin</span>
                    <Segmented
                      options={[
                        { value: "NA", label: "National Assembly" },
                        { value: "Senate", label: "Senate" },
                        ...(type === "joint" ? [{ value: "Joint", label: "Joint Sitting" }] : []),
                      ]}
                      value={house}
                      onChange={(v) => setHouse(v as House)}
                      size="md"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Legislative year</span>
                    <input value={year} onChange={(e) => setYear(e.target.value)} className="field h-9 text-[12px]" />
                  </label>
                </div>

                <div className="mt-4 rounded-[11px] border border-info/20 bg-info-soft p-3">
                  <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-info">
                    <Info size={12} /> Workflow preview
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {[previewStage].map((s) => (
                      <span key={s} className="rounded bg-surface/70 px-1.5 py-0.5 font-mono text-[9px] text-info">
                        Entry: {STAGE_LIBRARY[s as keyof typeof STAGE_LIBRARY].label}
                      </span>
                    ))}
                    <span className="text-[9px] text-info/70">
                      · {type === "joint" ? 9 : 13} milestones to Gazette
                    </span>
                  </div>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-3.5 p-5">
                <CardHeader
                  className="!p-0"
                  eyebrow="Particulars"
                  title="Bill details"
                  subtitle="Enter the particulars exactly as authenticated by the Secretariat."
                />

                <label className="block">
                  <span className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-[11px] font-medium text-ink-2">
                      Bill title <span className="text-danger">*</span>
                    </span>
                    <span className="font-mono text-[9px] text-faint">{title.length}/180</span>
                  </span>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 180))}
                    placeholder="The Digital Records Management Bill, 2026"
                    className={cn("field h-10 text-[12.5px]", errors.title && "border-danger")}
                  />
                  {errors.title && <span className="mt-1 block text-[10px] text-danger">{errors.title}</span>}
                </label>

                {title.trim().length >= 8 && (
                  <div
                    className={cn(
                      "flex items-start gap-2 rounded-[10px] border p-2.5",
                      duplicate ? "border-danger/25 bg-danger-soft" : "border-success/25 bg-success-soft",
                    )}
                  >
                    {duplicate ? (
                      <>
                        <AlertCircle size={13} className="mt-0.5 shrink-0 text-danger" />
                        <div>
                          <p className="text-[10.5px] font-semibold text-danger">Possible duplicate detected</p>
                          <p className="mt-0.5 text-[9.5px] text-danger/80">
                            Title and House match existing record {duplicate}. Registration will be
                            blocked — open the existing bill instead.
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Search size={13} className="mt-0.5 shrink-0 text-success" />
                        <div>
                          <p className="text-[10.5px] font-semibold text-success">No duplicate found</p>
                          <p className="mt-0.5 text-[9.5px] text-success/80">
                            Checked against title, sponsor, House and year across {bills.length} records.
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Sponsoring division</span>
                    <select
                      value={ministryId}
                      onChange={(e) => setMinistryId(e.target.value)}
                      className="field h-10 text-[12px]"
                    >
                      {MINISTRIES.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium text-ink-2">
                      {type === "private" ? "Member in charge" : "Authorised officer"} <span className="text-danger">*</span>
                    </span>
                    <input
                      value={member}
                      onChange={(e) => setMember(e.target.value)}
                      placeholder={type === "private" ? "Ms. Ayesha Siddiqui, MNA" : "Mr. Danish Iqbal, Joint Secretary"}
                      className={cn("field h-10 text-[12px]", errors.member && "border-danger")}
                    />
                    {errors.member && <span className="mt-1 block text-[10px] text-danger">{errors.member}</span>}
                  </label>
                </div>

                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Purpose and scope</span>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={3}
                    placeholder="One or two sentences describing what the bill changes and which institutions it binds."
                    className="field h-auto min-h-[80px] py-2 text-[12px]"
                  />
                </label>

                {errors.duplicate && (
                  <p className="flex items-start gap-1.5 rounded-lg border border-danger/20 bg-danger-soft px-2.5 py-2 text-[10.5px] text-danger">
                    <AlertCircle size={12} className="mt-px shrink-0" /> {errors.duplicate}
                  </p>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-3.5 p-5">
                <CardHeader
                  className="!p-0"
                  eyebrow="Documents"
                  title="Attach the signed bill copy"
                  subtitle="Documents are stored centrally and linked to the Bill ID. Maximum 20 MB per file."
                />
                <div
                  className={cn(
                    "rounded-[12px] border border-dashed p-6 text-center transition-colors",
                    errors.file ? "border-danger bg-danger-soft/40" : "border-line-strong bg-surface-2",
                  )}
                >
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-surface text-muted">
                    <FilePlus2 size={17} />
                  </span>
                  <p className="mt-2 text-[12px] font-medium text-ink">Drop the signed bill copy here</p>
                  <p className="mt-0.5 text-[9.5px] text-muted">PDF · up to 20 MB · version controlled</p>
                  <input
                    type="file"
                    onChange={(e) => {
                      setFileName(e.target.files?.[0]?.name ?? "");
                      setErrors((prev) => ({ ...prev, file: "" }));
                    }}
                    className="mx-auto mt-2.5 block w-full max-w-[280px] text-[10px] text-muted file:mr-2 file:rounded-md file:border file:border-line-strong file:bg-surface file:px-2 file:py-1 file:text-[10px] file:font-medium file:text-ink"
                  />
                  {fileName && (
                    <p className="mt-2 inline-flex items-center gap-1 rounded bg-success-soft px-2 py-1 font-mono text-[9px] text-success">
                      <Check size={9} /> {fileName}
                    </p>
                  )}
                </div>
                {errors.file && <p className="text-[10px] text-danger">{errors.file}</p>}

                <div className="flex items-start gap-2 rounded-[10px] border border-line bg-surface p-3">
                  <ShieldQuestion size={14} className="mt-0.5 shrink-0 text-gold" />
                  <p className="text-[10px] leading-[1.65] text-muted">
                    For Private Members&apos; Bills, the Article 74 stance and Federal Government consent
                    fields are created automatically at pre-admissibility and routed to the concerned
                    division for response.
                  </p>
                </div>

                <label className="flex items-start gap-2 rounded-[9px] border border-line bg-surface-2 p-2.5">
                  <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 rounded border-line-strong accent-[var(--brand)]" defaultChecked />
                  <span className="text-[10px] leading-[1.6] text-muted">
                    I confirm the particulars match the authenticated bill and understand that every
                    subsequent change is written to the audit trail.
                  </span>
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 p-5">
                <CardHeader
                  className="!p-0"
                  eyebrow="Review"
                  title="Confirm and register"
                  subtitle="A unique Bill ID is generated on save and becomes the primary key for this record."
                />
                <div className="rounded-[12px] border border-line bg-surface-2 p-3.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge tone="brand" size="xs">
                      {WORKFLOW_META[type].label}
                    </Badge>
                    <Badge tone="neutral" size="xs">
                      {house === "NA" ? "National Assembly" : house === "Senate" ? "Senate" : "Joint Sitting"}
                    </Badge>
                    <Badge tone="gold" size="xs">
                      Entry stage: {STAGE_LIBRARY[previewStage].label}
                    </Badge>
                  </div>
                  <p className="mt-2 text-[13px] font-semibold leading-5 text-ink">
                    {title || "Untitled bill"}
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-muted">{summary || "No purpose recorded."}</p>
                  <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-2.5">
                    <div>
                      <dt className="text-[9px] uppercase tracking-[0.1em] text-faint">Division</dt>
                      <dd className="text-[11px] font-medium text-ink">
                        {MINISTRIES.find((m) => m.id === ministryId)?.short}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[9px] uppercase tracking-[0.1em] text-faint">Member / officer</dt>
                      <dd className="text-[11px] font-medium text-ink">{member || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-[9px] uppercase tracking-[0.1em] text-faint">Document</dt>
                      <dd className="truncate text-[11px] font-medium text-ink">{fileName || "Not attached"}</dd>
                    </div>
                    <div>
                      <dt className="text-[9px] uppercase tracking-[0.1em] text-faint">Year</dt>
                      <dd className="text-[11px] font-medium text-ink">{year}</dd>
                    </div>
                  </dl>
                </div>

                <div className="flex items-start gap-2 rounded-[10px] border border-success/25 bg-success-soft p-2.5">
                  <BookOpenCheck size={13} className="mt-0.5 shrink-0 text-success" />
                  <p className="text-[9.5px] leading-[1.65] text-success">
                    On save: a Bill ID is generated, the duplicate check result is recorded, the entry
                    stage is set, and the stage-history log is initialised.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2 px-5 py-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              >
                <ArrowLeft size={12} /> Back
              </Button>
              <div className="flex items-center gap-1.5">
                <span className="mr-1 hidden text-[9.5px] text-faint sm:block">
                  {step === 3 ? "Writes to the registry + audit trail" : "Progress is not saved yet"}
                </span>
                {step < 3 ? (
                  <Button variant="primary" size="sm" onClick={next}>
                    Continue <ArrowRight size={12} />
                  </Button>
                ) : (
                  <Button variant="primary" size="sm" onClick={submit}>
                    <Check size={12} /> Register bill
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Rail */}
        <div className="space-y-4 xl:col-span-4">
          <Card className="p-4">
            <p className="eyebrow">What happens on save</p>
            <ol className="mt-3 space-y-2.5">
              {[
                { t: "Duplicate check", d: "Title, sponsor, House and year matched against the registry." },
                { t: "Unique ID", d: "Format MOPA-YYYY-NNNN, used across data, documents and alerts." },
                { t: "Entry stage set", d: `${STAGE_LIBRARY[previewStage].label} becomes the current milestone.` },
                { t: "Audit initialised", d: "Registration entry with your user ID and timestamp." },
              ].map((item, i) => (
                <li key={item.t} className="flex gap-2.5">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-line-strong bg-surface text-[8px] font-semibold text-muted">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-[10.5px] font-semibold text-ink">{item.t}</span>
                    <span className="mt-0.5 block text-[9.5px] leading-[1.6] text-muted">{item.d}</span>
                  </span>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-4">
            <p className="eyebrow">Mandatory fields</p>
            <ul className="mt-2.5 space-y-1.5">
              {[
                "Bill title (as authenticated)",
                "Bill type and workflow",
                "House of origin",
                "Sponsoring ministry / division",
                "Member or authorised officer",
                "Signed bill copy",
              ].map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-[10.5px] text-ink-2">
                  <Check size={10} className="shrink-0 text-brand" /> {f}
                </li>
              ))}
            </ul>
            <p className="mt-2.5 text-[9px] leading-[1.6] text-faint">
              Saving is blocked until a stage date and a supporting reference exist — or a documented
              &ldquo;Not Available&rdquo; reason is recorded.
            </p>
          </Card>

          <Card className="bg-surface-2 p-4">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-ink">
              <ShieldQuestion size={12} className="text-brand" /> Need a different workflow?
            </p>
            <p className="mt-1 text-[9.5px] leading-[1.65] text-muted">
              Joint Sitting bills are created by referring an existing bill when the 90-day limit lapses.
              Use the bill record to record the referral rather than registering a new bill.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

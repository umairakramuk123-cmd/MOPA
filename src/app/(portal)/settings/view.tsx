"use client";

import * as React from "react";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { can } from "@/lib/roles";
import { SESSION } from "@/lib/data";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Divider,
  Segmented,
  Select,
  Switch,
  Tabs,
} from "@/components/ui/primitives";
import {
  BellRing,
  Check,
  Clock3,
  Download,
  Globe2,
  Info,
  Lock,
  Monitor,
  Moon,
  Palette,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Timer,
  Users,
} from "lucide-react";

type Section = "deadlines" | "alerts" | "security" | "appearance" | "organisation";

export function SettingsView() {
  const { theme, toggleTheme, toast, session, collapsed, setCollapsed } = useStore();
  const [section, setSection] = React.useState<Section>("deadlines");
  const [notify, setNotify] = React.useState({ portal: true, email: true, sms: false, digest: true });
  const [rules, setRules] = React.useState({
    naCommittee: "30",
    senateCommittee: "60",
    transmission: "90",
    gazette: "15",
    responseWindow: "30",
    reminderLead: "7",
  });
  const [security, setSecurity] = React.useState({
    mfa: true,
    autoLogout: true,
    ipAllowlist: false,
    auditExports: true,
    strongPasswords: true,
  });
  const [density, setDensity] = React.useState("comfortable");
  const [org, setOrg] = React.useState({
    name: "Ministry of Parliamentary Affairs",
    code: "MOPA",
    city: "Islamabad",
    language: "English",
    timezone: "Asia/Karachi (PKT)",
    session: SESSION.name,
  });
  const canManage = can(session.role, "settings.manage");

  const save = () =>
    toast({
      title: "Settings saved",
      description: "Configuration changes are versioned and recorded in the audit trail.",
      tone: "success",
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">Administration</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
            System settings
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-5 text-muted">
            Deadline rules, alert thresholds, security policy and appearance. Every change is audited
            with the user who made it.
          </p>
        </div>
        {canManage ? (
          <Button variant="primary" size="md" onClick={save}>
            <Save size={14} /> Save changes
          </Button>
        ) : (
          <Badge tone="neutral" className="h-9 px-3">
            <Lock size={11} /> Read-only for your role
          </Badge>
        )}
      </div>

      <Tabs
        tabs={[
          { value: "deadlines", label: "Deadlines" },
          { value: "alerts", label: "Alerts" },
          { value: "security", label: "Security" },
          { value: "appearance", label: "Appearance" },
          { value: "organisation", label: "Organisation" },
        ]}
        value={section}
        onChange={setSection}
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {section === "deadlines" && (
            <>
              <Card>
                <CardHeader
                  eyebrow="Statutory windows"
                  title="Deadline configuration"
                  subtitle="Elapsed days are calculated from the stage entry date. Changes apply to future referrals."
                  icon={<Timer size={14} />}
                />
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  {[
                    { key: "naCommittee", label: "NA Standing Committee", hint: "BRD §8 · 30 days" },
                    { key: "senateCommittee", label: "Senate Standing Committee", hint: "BRD §8 · 60 days" },
                    { key: "transmission", label: "Inter-House transmission", hint: "Constitutional limit" },
                    { key: "gazette", label: "Gazette notification", hint: "Post-assent follow-up" },
                    { key: "responseWindow", label: "Ministry response window", hint: "Article 74 stance" },
                    { key: "reminderLead", label: "Reminder lead time", hint: "Before the limit" },
                  ].map((field) => (
                    <label key={field.key} className="block">
                      <span className="mb-1.5 flex items-baseline justify-between">
                        <span className="text-[11px] font-medium text-ink-2">{field.label}</span>
                        <span className="font-mono text-[8.5px] text-faint">{field.hint}</span>
                      </span>
                      <span className="relative block">
                        <input
                          type="number"
                          value={rules[field.key as keyof typeof rules]}
                          onChange={(e) => setRules((r) => ({ ...r, [field.key]: e.target.value }))}
                          className="field h-10 pr-12 text-[12px]"
                        />
                        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[9.5px] text-faint">
                          days
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mx-4 mb-4 flex items-start gap-2 rounded-[10px] border border-info/20 bg-info-soft p-2.5">
                  <Info size={12} className="mt-0.5 shrink-0 text-info" />
                  <p className="text-[9.5px] leading-[1.6] text-info">
                    Reducing a limit does not retroactively flag existing bills — open records are
                    re-evaluated on the next stage update.
                  </p>
                </div>
              </Card>

              <Card>
                <CardHeader
                  eyebrow="Escalation"
                  title="Escalation ladder"
                  subtitle="Who is notified as a deadline approaches and passes."
                  icon={<BellRing size={14} />}
                />
                <div className="divide-y divide-line">
                  {[
                    { step: "7 days before", audience: "Division focal person", channel: "Portal + email" },
                    { step: "3 days before", audience: "Division + Data Manager", channel: "Portal + email" },
                    { step: "On the deadline", audience: "Data Manager + Secretary", channel: "Portal" },
                    { step: "After the limit", audience: "Secretary + Super Admin", channel: "Portal + email" },
                  ].map((row, i) => (
                    <div key={row.step} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="num grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface-3 font-mono text-[8px] font-semibold text-muted">
                        {i + 1}
                      </span>
                      <div className="w-[112px] shrink-0 text-[10.5px] font-medium text-ink">{row.step}</div>
                      <div className="min-w-0 flex-1 truncate text-[10px] text-muted">{row.audience}</div>
                      <span className="shrink-0 font-mono text-[8.5px] text-faint">{row.channel}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {section === "alerts" && (
            <>
              <Card>
                <CardHeader
                  eyebrow="Channels"
                  title="Notification delivery"
                  subtitle="Where alerts are sent when a configured threshold is reached."
                  icon={<BellRing size={14} />}
                />
                <div className="space-y-3 p-4">
                  {[
                    { key: "portal", label: "In-portal action list", description: "Every alert appears in the role-scoped exception list." },
                    { key: "email", label: "Email to focal persons", description: "Sent to the registered focal person for the concerned division." },
                    { key: "sms", label: "SMS escalation", description: "Reserved for critical constitutional breaches." },
                    { key: "digest", label: "Daily digest", description: "One consolidated summary at 08:00 PKT." },
                  ].map((row) => (
                    <div key={row.key} className="rounded-[10px] border border-line bg-surface p-2.5">
                      <Switch
                        checked={notify[row.key as keyof typeof notify]}
                        onChange={(v) => setNotify((n) => ({ ...n, [row.key]: v }))}
                        label={row.label}
                        description={row.description}
                        disabled={!canManage}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader eyebrow="Milestones" title="Alert triggers" subtitle="BRD §15 milestone events." icon={<SlidersHorizontal size={14} />} />
                <div className="grid gap-x-6 gap-y-2 p-4 sm:grid-cols-2">
                  {[
                    "Bill forwarded to Secretariat",
                    "Included in the Order of the Day",
                    "Introduced in either House",
                    "Referred to Standing Committee",
                    "Committee report presented",
                    "Passed by a House",
                    "Transmitted to the other House",
                    "90-day limit approaching",
                    "Ministry response due",
                    "Presidential decision recorded",
                    "Gazette notification received",
                    "Assent endorsement pending",
                  ].map((item, i) => (
                    <label key={item} className="flex items-center gap-2 py-1">
                      <input
                        type="checkbox"
                        defaultChecked={i !== 2 && i !== 10}
                        disabled={!canManage}
                        className="h-3.5 w-3.5 rounded border-line-strong accent-[var(--brand)]"
                      />
                      <span className="text-[10.5px] text-ink-2">{item}</span>
                    </label>
                  ))}
                </div>
              </Card>
            </>
          )}

          {section === "security" && (
            <>
              <Card>
                <CardHeader
                  eyebrow="Policy"
                  title="Access & session security"
                  subtitle="BRD §14 — HTTPS, RBAC, OTP two-factor and a 15-minute inactivity cut-off."
                  icon={<ShieldCheck size={14} />}
                />
                <div className="space-y-3 p-4">
                  {[
                    { key: "mfa", label: "Require OTP for sensitive roles", description: "Admin, Secretary, Data Manager and Secretariat accounts." },
                    { key: "autoLogout", label: "15-minute inactivity logout", description: "Sessions expire automatically after 15 minutes without activity." },
                    { key: "strongPasswords", label: "Strong password policy", description: "Minimum 12 characters with a rotation reminder every 90 days." },
                    { key: "ipAllowlist", label: "IP allowlist for administrators", description: "Restrict administrative access to Government network ranges." },
                    { key: "auditExports", label: "Audit every export", description: "Record who exported what, when, and with which filters." },
                  ].map((row) => (
                    <div key={row.key} className="rounded-[10px] border border-line bg-surface p-2.5">
                      <Switch
                        checked={security[row.key as keyof typeof security]}
                        onChange={(v) => setSecurity((s) => ({ ...s, [row.key]: v }))}
                        label={row.label}
                        description={row.description}
                        disabled={!canManage}
                      />
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <CardHeader eyebrow="Compliance" title="Data handling" subtitle="Government of Pakistan IT and cybersecurity policy." />
                <div className="divide-y divide-line">
                  {[
                    { label: "Transport", value: "TLS 1.3 · HSTS enforced" },
                    { label: "Password storage", value: "Argon2id hashing" },
                    { label: "Document uploads", value: "20 MB per file · malware scanned" },
                    { label: "Audit retention", value: "Permanent · append-only" },
                    { label: "Backup cadence", value: "Hourly incremental · daily full" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-2">
                      <span className="text-[10.5px] text-ink-2">{row.label}</span>
                      <span className="font-mono text-[9px] text-muted">{row.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {section === "appearance" && (
            <>
              <Card>
                <CardHeader eyebrow="Interface" title="Theme" subtitle="Applied immediately and remembered on this device." icon={<Palette size={14} />} />
                <div className="grid gap-2.5 p-4 sm:grid-cols-3">
                  {[
                    { key: "light", label: "Civic light", icon: Sun, note: "Paper canvas · evergreen accents" },
                    { key: "dark", label: "Chamber dark", icon: Moon, note: "Low-light · mint accents" },
                    { key: "system", label: "System", icon: Monitor, note: "Follow the operating system" },
                  ].map((t) => {
                    const active = t.key === theme || t.key === "system";
                    return (
                      <button
                        key={t.key}
                        onClick={() => {
                          if (t.key === "system") {
                            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                            if ((prefersDark && theme !== "dark") || (!prefersDark && theme !== "light")) toggleTheme();
                          } else if (t.key !== theme) {
                            toggleTheme();
                          }
                        }}
                        className={cn(
                          "rounded-[11px] border p-3 text-left transition-colors",
                          active ? "border-brand bg-brand-soft/50" : "border-line hover:border-line-strong",
                        )}
                      >
                        <t.icon size={16} className={active ? "text-brand" : "text-muted"} />
                        <p className="mt-2 text-[11px] font-semibold text-ink">{t.label}</p>
                        <p className="mt-0.5 text-[9px] text-muted">{t.note}</p>
                        <div className="mt-2 flex gap-1">
                          {["bg-[#0b6b4f]", "bg-[#a9822f]", "bg-[#34688f]", "bg-[#f4f6f2] border border-line"].map((c) => (
                            <span key={c} className={cn("h-4 w-4 rounded-[3px]", c)} />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>

              <Card>
                <CardHeader eyebrow="Density" title="Layout preferences" subtitle="Adjust how much fits on screen." />
                <div className="space-y-3 p-4">
                  <div className="rounded-[10px] border border-line bg-surface p-2.5">
                    <Switch
                      checked={collapsed}
                      onChange={(v) => setCollapsed(v)}
                      label="Collapse the sidebar"
                      description="Keep icons only — more room for tables and charts."
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-[10px] border border-line bg-surface p-2.5">
                    <div>
                      <p className="text-[12px] font-medium text-ink">Row density</p>
                      <p className="mt-0.5 text-[10.5px] text-muted">Applied to registry tables.</p>
                    </div>
                    <Segmented
                      options={[
                        { value: "comfortable", label: "Comfortable" },
                        { value: "compact", label: "Compact" },
                      ]}
                      value={density}
                      onChange={setDensity}
                    />
                  </div>
                </div>
              </Card>
            </>
          )}

          {section === "organisation" && (
            <>
              <Card>
                <CardHeader eyebrow="Profile" title="Organisation details" subtitle="Shown in the header, reports and printed briefs." icon={<Globe2 size={14} />} />
                <div className="grid gap-3 p-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Organisation</span>
                    <input value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} className="field h-10 text-[12px]" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Short code</span>
                    <input value={org.code} onChange={(e) => setOrg({ ...org, code: e.target.value })} className="field h-10 text-[12px]" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium text-ink-2">City</span>
                    <input value={org.city} onChange={(e) => setOrg({ ...org, city: e.target.value })} className="field h-10 text-[12px]" />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Interface language</span>
                    <Select value={org.language} onChange={(e) => setOrg({ ...org, language: e.target.value })} className="h-10 text-[12px]">
                      <option>English</option>
                      <option>اردو (Urdu)</option>
                    </Select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Timezone</span>
                    <Select value={org.timezone} onChange={(e) => setOrg({ ...org, timezone: e.target.value })} className="h-10 text-[12px]">
                      <option>Asia/Karachi (PKT)</option>
                      <option>UTC</option>
                    </Select>
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Current session</span>
                    <input value={org.session} onChange={(e) => setOrg({ ...org, session: e.target.value })} className="field h-10 text-[12px]" />
                  </label>
                </div>
              </Card>

              <Card>
                <CardHeader eyebrow="Data" title="Export & retention" subtitle="What leaves the portal, and how long it is kept." />
                <div className="divide-y divide-line">
                  {[
                    { label: "Registry export", note: "CSV / Excel · unlimited rows", action: true },
                    { label: "Audit extract", note: "Sealed PDF with hash verification", action: true },
                    { label: "Document archive", note: "ZIP · classified files excluded", action: true },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between px-4 py-2.5">
                      <div>
                        <p className="text-[10.5px] font-medium text-ink">{row.label}</p>
                        <p className="text-[9px] text-faint">{row.note}</p>
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => toast({ title: "Export queued", description: row.label, tone: "success" })}>
                        <Download size={11} /> Export
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Card className="p-4">
            <p className="eyebrow">Governance</p>
            <div className="mt-3 space-y-2.5">
              {[
                { icon: ShieldCheck, label: "Government IT policy", note: "Aligned" },
                { icon: Lock, label: "RBAC enforcement", note: "API-level" },
                { icon: Clock3, label: "Audit retention", note: "Permanent" },
                { icon: Users, label: "Role coverage", note: "7 roles" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-surface-3 text-muted">
                    <row.icon size={12} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-medium text-ink">{row.label}</p>
                    <p className="text-[8.5px] text-faint">{row.note}</p>
                  </div>
                  <Check size={11} className="shrink-0 text-success" />
                </div>
              ))}
            </div>
            <Divider className="my-3" />
            <p className="text-[9px] leading-[1.6] text-faint">
              Configuration v1.2.0 · last changed by {session.user.name}. Changes are versioned so a prior
              configuration can be restored by a Super Admin.
            </p>
          </Card>

          <Card className="bg-surface-2 p-4">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-ink">
              <Info size={12} className="text-brand" /> Need a rule changed?
            </p>
            <p className="mt-1 text-[9.5px] leading-[1.65] text-muted">
              Alert recipients and thresholds are administratively configurable — no code change is
              required. Raise a request with the MoPA IT focal person and it will be versioned here.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

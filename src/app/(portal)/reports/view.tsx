"use client";

import * as React from "react";
import { cn, formatDate, relativeTime, SYSTEM_DATE } from "@/lib/format";
import { useStore } from "@/lib/store";
import { REPORTS, SESSION } from "@/lib/data";
import { can } from "@/lib/roles";
import { ReportDefinition } from "@/lib/types";
import { Badge, Button, Card, CardHeader, EmptyState, Segmented, Select } from "@/components/ui/primitives";
import { StatStrip } from "@/components/kpi";
import { Drawer } from "@/components/ui/overlay";
import {
  CalendarClock,
  Check,
  ChevronRight,
  Clock3,
  Download,
  FileBarChart2,
  FileSpreadsheet,
  FileText,
  Info,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";

const CATEGORIES = ["All", "Registry", "Progress", "Compliance", "Operations"] as const;

const CATEGORY_TONE: Record<string, "brand" | "info" | "warning" | "violet"> = {
  Registry: "brand",
  Progress: "info",
  Compliance: "warning",
  Operations: "violet",
};

export function ReportsView() {
  const { toast, session } = useStore();
  const [category, setCategory] = React.useState<(typeof CATEGORIES)[number]>("All");
  const [query, setQuery] = React.useState("");
  const [builderOpen, setBuilderOpen] = React.useState(false);
  const [generating, setGenerating] = React.useState<string | null>(null);

  const canGenerate = can(session.role, "reports.generate");

  const filtered = REPORTS.filter((r) => {
    if (category !== "All" && r.category !== category) return false;
    if (query && !`${r.name} ${r.description}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const generate = (report: ReportDefinition, format: "PDF" | "Excel") => {
    setGenerating(`${report.id}-${format}`);
    window.setTimeout(() => {
      setGenerating(null);
      toast({
        title: `${report.name} generated`,
        description: `${format} · ${report.fields.length} columns · compiled from live records at ${formatDate(SYSTEM_DATE)}.`,
        tone: "success",
      });
    }, 1200);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">Reports · BRD §16</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
            Numbers that match the record
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-5 text-muted">
            Fifteen statutory reports query the live registry directly — no spreadsheets, no version
            mismatch. Run on demand or schedule a recurring summary.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" onClick={() => generate(REPORTS[14], "PDF")}>
            <Zap size={13} /> Executive summary
          </Button>
          {canGenerate && (
            <Button variant="primary" size="md" onClick={() => setBuilderOpen(true)}>
              <Plus size={14} /> Custom report
            </Button>
          )}
        </div>
      </div>

      <StatStrip
        items={[
          { label: "Report templates", value: REPORTS.length, tone: "var(--ink)" },
          { label: "Generated this month", value: 42, tone: "var(--chart-1)" },
          { label: "Scheduled", value: 3, tone: "var(--chart-4)" },
          { label: "Avg. build time", value: "4.2s", hint: "target ≤ 10s", tone: "var(--chart-3)" },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1 sm:max-w-[320px]">
          <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reports…"
            className="field h-9 pl-8 text-[12px]"
          />
        </div>
        <Segmented
          options={CATEGORIES.map((c) => ({ value: c, label: c }))}
          value={category}
          onChange={(v) => setCategory(v as typeof category)}
        />
        <span className="ml-auto font-mono text-[9.5px] uppercase tracking-[0.12em] text-faint">
          {filtered.length} of {REPORTS.length} reports
        </span>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FileBarChart2 size={19} />}
            title="No reports match this search"
            description="Try a broader keyword or select another category. Reports are grouped by the legislative question they answer."
            action={
              <Button size="sm" variant="secondary" onClick={() => { setQuery(""); setCategory("All"); }}>
                Reset
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((report) => {
            const busyPdf = generating === `${report.id}-PDF`;
            const busyXls = generating === `${report.id}-Excel`;
            return (
              <Card key={report.id} hover className="group flex flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="num grid h-7 w-7 place-items-center rounded-[7px] border border-line bg-surface-2 font-mono text-[9.5px] font-semibold text-muted">
                      {String(report.no).padStart(2, "0")}
                    </span>
                    <Badge tone={CATEGORY_TONE[report.category]} size="xs">
                      {report.category}
                    </Badge>
                  </div>
                  {report.lastGenerated && (
                    <span className="flex items-center gap-1 font-mono text-[8.5px] text-faint">
                      <Clock3 size={9} /> {relativeTime(report.lastGenerated)}
                    </span>
                  )}
                </div>

                <h3 className="mt-2.5 text-[12.5px] font-semibold leading-[1.35] text-ink">{report.name}</h3>
                <p className="mt-1 line-clamp-2 text-[10px] leading-[1.6] text-muted">{report.description}</p>

                <div className="mt-2.5 flex flex-wrap gap-1">
                  {report.fields.slice(0, 3).map((f) => (
                    <span key={f} className="rounded border border-line bg-surface-2 px-1.5 py-px text-[8.5px] text-muted">
                      {f}
                    </span>
                  ))}
                  {report.fields.length > 3 && (
                    <span className="rounded border border-line bg-surface-2 px-1.5 py-px text-[8.5px] text-faint">
                      +{report.fields.length - 3}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-2.5">
                  <button
                    onClick={() => generate(report, "PDF")}
                    disabled={busyPdf}
                    className="pressable inline-flex h-7 items-center gap-1 rounded-md border border-line bg-surface px-2 text-[9.5px] font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink disabled:opacity-60"
                  >
                    {busyPdf ? <Loader2 size={10} className="animate-spin" /> : <FileText size={10} />}
                    PDF
                  </button>
                  <button
                    onClick={() => generate(report, "Excel")}
                    disabled={busyXls}
                    className="pressable inline-flex h-7 items-center gap-1 rounded-md border border-line bg-surface px-2 text-[9.5px] font-medium text-ink-2 transition-colors hover:border-line-strong hover:text-ink disabled:opacity-60"
                  >
                    {busyXls ? <Loader2 size={10} className="animate-spin" /> : <FileSpreadsheet size={10} />}
                    Excel
                  </button>
                  <button
                    onClick={() => setBuilderOpen(true)}
                    className="ml-auto inline-flex items-center gap-0.5 text-[9.5px] font-medium text-brand opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    Configure <ChevronRight size={10} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="overflow-hidden lg:col-span-5">
          <CardHeader eyebrow="Schedule" title="Recurring reports" subtitle="Delivered to the Secretary's brief every cycle." />
          <div className="divide-y divide-line">
            {[
              { name: "Executive Dashboard Summary", cadence: "Every Monday · 08:00", format: "PDF", next: "26 Oct" },
              { name: "Bill Ageing & Delay Report", cadence: "Fortnightly · Thursday", format: "Excel", next: "29 Oct" },
              { name: "Alerts & Notifications Report", cadence: "Monthly · 1st", format: "PDF", next: "01 Nov" },
            ].map((row) => (
              <div key={row.name} className="flex items-center gap-2.5 px-4 py-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-surface-3 text-muted">
                  <CalendarClock size={12} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10.5px] font-medium text-ink">{row.name}</p>
                  <p className="font-mono text-[8.5px] text-faint">{row.cadence}</p>
                </div>
                <Badge tone="neutral" size="xs">{row.format}</Badge>
                <span className="shrink-0 font-mono text-[8.5px] text-muted">next {row.next}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-line p-3">
            <p className="flex items-center gap-1.5 text-[9px] text-faint">
              <RefreshCw size={10} /> Data source: live registry · last sync {formatDate(SYSTEM_DATE)}
            </p>
          </div>
        </Card>

        <Card className="overflow-hidden lg:col-span-4">
          <CardHeader eyebrow="History" title="Recently generated" />
          <div className="divide-y divide-line">
            {[
              { name: "Bill Stage-wise Status", by: "Ali Hassan", when: "2h ago", fmt: "PDF" },
              { name: "Inter-House Transmission", by: "Farah Nadeem", when: "Yesterday", fmt: "Excel" },
              { name: "Private Members' Bills", by: "M. Awais Hussain", when: "2 days ago", fmt: "PDF" },
              { name: "Ministry-wise Bill Report", by: "Ali Hassan", when: "4 days ago", fmt: "Excel" },
            ].map((row) => (
              <div key={row.name} className="flex items-center gap-2 px-4 py-2.5">
                <FileBarChart2 size={12} className="shrink-0 text-faint" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[10.5px] text-ink-2">{row.name}</p>
                  <p className="truncate text-[8.5px] text-faint">
                    {row.by} · {row.when}
                  </p>
                </div>
                <span className="font-mono text-[8px] text-faint">{row.fmt}</span>
                <button className="grid h-6 w-6 shrink-0 place-items-center rounded text-faint hover:text-ink" aria-label="Download">
                  <Download size={11} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-surface-2 p-4 lg:col-span-3">
          <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-ink">
            <Sparkles size={12} className="text-brand" /> {SESSION.name}
          </p>
          <p className="mt-1 text-[9.5px] leading-[1.7] text-muted">
            Reports reflect records as of the moment they are generated. Every export is stamped with the
            user, timestamp and data cut-off so a printed brief can always be traced back.
          </p>
          <div className="mt-3 flex items-center gap-1.5">
            <Info size={10} className="text-faint" />
            <span className="text-[9px] text-faint">PDF and Excel supported</span>
          </div>
        </Card>
      </div>

      <ReportBuilder open={builderOpen} onClose={() => setBuilderOpen(false)} onRun={(name, format) => {
        setBuilderOpen(false);
        toast({ title: "Report queued", description: `${name} · ${format}. You will be notified when the file is ready.`, tone: "success" });
      }} />
    </div>
  );
}

function ReportBuilder({ open, onClose, onRun }: { open: boolean; onClose: () => void; onRun: (name: string, format: string) => void }) {
  const [template, setTemplate] = React.useState(REPORTS[0].name);
  const [format, setFormat] = React.useState("PDF");
  const [from, setFrom] = React.useState("2026-07-01");
  const [to, setTo] = React.useState("2026-10-20");

  return (
    <Drawer
      open={open}
      onClose={onClose}
      eyebrow="Report builder"
      title="Configure a report"
      description="Choose a template, narrow the scope, then generate from live records."
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={() => onRun(template, format)}>
            <FileBarChart2 size={12} /> Generate report
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Report template</span>
          <Select value={template} onChange={(e) => setTemplate(e.target.value)} className="h-10 text-[12px]">
            {REPORTS.map((r) => (
              <option key={r.id} value={r.name}>
                {String(r.no).padStart(2, "0")} · {r.name}
              </option>
            ))}
          </Select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-ink-2">From</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="field h-10 text-[12px]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-ink-2">To</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field h-10 text-[12px]" />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Bill type</span>
            <Select className="h-10 text-[12px]">
              <option>All workflows</option>
              <option>Official bills</option>
              <option>Private Members&apos; bills</option>
              <option>Joint Sitting</option>
            </Select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-ink-2">House</span>
            <Select className="h-10 text-[12px]">
              <option>Both Houses</option>
              <option>National Assembly</option>
              <option>Senate</option>
            </Select>
          </label>
        </div>

        <div>
          <p className="mb-1.5 text-[11px] font-medium text-ink-2">Format</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: "PDF", icon: FileText, note: "Print-ready brief" },
              { key: "Excel", icon: FileSpreadsheet, note: "Working data set" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFormat(f.key)}
                className={cn(
                  "flex items-start gap-2 rounded-[10px] border p-2.5 text-left transition-colors",
                  format === f.key ? "border-brand bg-brand-soft" : "border-line hover:border-line-strong",
                )}
              >
                <f.icon size={14} className={format === f.key ? "text-brand" : "text-muted"} />
                <span>
                  <span className="block text-[11px] font-semibold text-ink">{f.key}</span>
                  <span className="block text-[9px] text-muted">{f.note}</span>
                </span>
                {format === f.key && <Check size={12} className="ml-auto text-brand" />}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[10px] border border-line bg-surface-2 p-3">
          <p className="text-[10px] font-semibold text-ink">Preview</p>
          <p className="mt-1 text-[9.5px] leading-[1.7] text-muted">
            {template} · {formatDate(from)} to {formatDate(to)} · compiled from{" "}
            <span className="font-medium text-ink">live records</span>. Every page will carry the export
            stamp, data cut-off and your user ID.
          </p>
        </div>

        <div className="flex items-start gap-2 rounded-[10px] border border-success/25 bg-success-soft p-2.5">
          <Zap size={12} className="mt-0.5 shrink-0 text-success" />
          <p className="text-[9.5px] leading-[1.6] text-success">
            Estimated build time: 4 seconds. Reports are generated server-side and never cached across
            different users.
          </p>
        </div>
      </div>
    </Drawer>
  );
}

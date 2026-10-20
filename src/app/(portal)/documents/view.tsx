"use client";

import * as React from "react";
import Link from "next/link";
import { cn, formatDate } from "@/lib/format";
import { useStore } from "@/lib/store";
import { ministryShort } from "@/lib/data";
import { can } from "@/lib/roles";
import { DOC_TYPES, stagesFor } from "@/lib/workflows";

import { Badge, Button, Card, CardHeader, EmptyState, Progress, Segmented, Select } from "@/components/ui/primitives";
import { StatStrip } from "@/components/kpi";
import { Modal } from "@/components/ui/overlay";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileArchive,
  FileCheck2,
  FileText,
  FolderClosed,
  Info,
  Lock,
  Search,
  ShieldAlert,
  Upload,
  X,
} from "lucide-react";

const TYPE_ICON: Record<string, React.ElementType> = {
  "Bill Copy": FileText,
  "Order of the Day": FileCheck2,
  "Committee Report": FileArchive,
  "Ministry Response": FileText,
  "Transmitted Copy": FileArchive,
  "Presidential Message": ShieldAlert,
  "Gazette Notification": FileCheck2,
};

export function DocumentsView() {
  const { bills, session, toast, documents, addDocument } = useStore();
  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState("all");
  const [cls, setCls] = React.useState<"all" | "public" | "restricted" | "classified">("all");
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const canUpload = can(session.role, "documents.upload");

  const permitted = documents.filter(
    (d) => d.classification !== "classified" || can(session.role, "documents.classified"),
  );
  const visibleDocs = permitted.filter((d) => cls === "all" || d.classification === cls);

  const filtered = visibleDocs.filter((d) => {
    if (type !== "all" && d.type !== type) return false;
    if (query && !`${d.name} ${d.billId} ${d.uploadedBy}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const perPage = 9;
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * perPage, safePage * perPage + perPage);

  React.useEffect(() => {
    setPage(0);
  }, [query, type, cls]);

  const missing = bills
    .map((bill) => {
      const required = stagesFor(bill.type).filter((s) => s.gate.toLowerCase().includes("document") || s.gate.toLowerCase().includes("copy"));
      const count = documents.filter((d) => d.billId === bill.id).length;
      return { bill, required: required.length, count, gap: Math.max(0, Math.min(4, 3 - count)) };
    })
    .filter((x) => x.gap > 0)
    .slice(0, 5);

  const totalMb = documents.reduce((sum, d) => sum + parseFloat(d.size), 0);
  const classified = documents.filter((d) => d.classification === "classified").length;
  const requiredSlots = bills.length * 3;
  const filledSlots = bills.reduce(
    (sum, b) => sum + Math.min(3, documents.filter((d) => d.billId === b.id).length),
    0,
  );
  const coverage = requiredSlots ? Math.round((filledSlots / requiredSlots) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">Repository · BRD §8</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
            One document, one bill
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-5 text-muted">
            Every document type has a defined slot tied to its stage. Files are stored centrally and
            linked to the Bill ID — no separate folder structure, no missing annexures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="md" onClick={() => toast({ title: "Repository index exported", description: `${documents.length} documents listed as CSV.`, tone: "success" })}>
            <Download size={13} /> Export index
          </Button>
          {canUpload && (
            <Button variant="primary" size="md" onClick={() => setUploadOpen(true)}>
              <Upload size={13} /> Upload document
            </Button>
          )}
        </div>
      </div>

      <StatStrip
        items={[
          { label: "Documents", value: documents.length, tone: "var(--ink)" },
          { label: "Archive size", value: `${totalMb.toFixed(0)} MB`, tone: "var(--chart-4)" },
          { label: "Classified", value: classified, tone: "var(--danger)" },
          { label: "Coverage", value: `${coverage}%`, hint: "required slots", tone: "var(--success)" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="overflow-hidden lg:col-span-8">
          <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
            <div className="relative min-w-[180px] flex-1">
              <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search documents or bill IDs…"
                className="field h-8 pl-8 pr-7 text-[11.5px]"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 grid h-4 w-4 -translate-y-1/2 place-items-center rounded text-faint hover:text-ink"
                  aria-label="Clear search"
                >
                  <X size={10} />
                </button>
              )}
            </div>
            <Select value={type} onChange={(e) => setType(e.target.value)} className="h-8 w-[160px] text-[11px]">
              <option value="all">All document types</option>
              {DOC_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
            <Segmented
              options={[
                { value: "all", label: "All" },
                { value: "public", label: "Public" },
                { value: "restricted", label: "Restricted" },
                { value: "classified", label: "Classified" },
              ]}
              value={cls}
              onChange={(v) => setCls(v as typeof cls)}
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              icon={<FolderClosed size={18} />}
              title="No documents match this query"
              description="Try a different document type or clear the search. Classified files may also be hidden by your role."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left">
                <thead className="bg-surface-2">
                  <tr className="border-b border-line">
                    {["Document", "Type", "Linked bill", "Uploaded", "Class", ""].map((h) => (
                      <th key={h} className="whitespace-nowrap px-3 py-2 text-[9px] font-medium uppercase tracking-[0.1em] text-faint">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((doc) => {
                    const Icon = TYPE_ICON[doc.type] ?? FileText;
                    const bill = bills.find((b) => b.id === doc.billId);
                    return (
                      <tr key={doc.id} className="group border-b border-line last:border-0 hover:bg-surface-2">
                        <td className="max-w-[260px] px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-surface-3 text-muted">
                              <Icon size={12} />
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-medium text-ink">{doc.name}</p>
                              <p className="font-mono text-[8.5px] text-faint">
                                v{doc.version} · {doc.size}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5 text-[10px] text-muted">{doc.type}</td>
                        <td className="px-3 py-2.5">
                          <Link href={`/bills/${doc.billId}`} className="num font-mono text-[9px] text-brand hover:underline">
                            {doc.billId}
                          </Link>
                          <p className="max-w-[150px] truncate text-[9px] text-faint">
                            {bill ? ministryShort(bill.ministryId) : "—"}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-3 py-2.5">
                          <p className="text-[10px] text-ink-2">{formatDate(doc.uploadedAt)}</p>
                          <p className="text-[9px] text-faint">{doc.uploadedBy}</p>
                        </td>
                        <td className="px-3 py-2.5">
                          <Badge
                            tone={doc.classification === "classified" ? "danger" : doc.classification === "restricted" ? "warning" : "neutral"}
                            size="xs"
                          >
                            {doc.classification === "public" ? "Public" : doc.classification === "restricted" ? "Restricted" : "Classified"}
                          </Badge>
                        </td>
                        <td className="px-2 py-2.5 text-right">
                          <button
                            onClick={() => toast({ title: "Download started", description: `${doc.name}. Access logged.`, tone: "success" })}
                            className="grid h-6 w-6 place-items-center rounded text-faint opacity-0 transition-opacity hover:bg-surface-3 hover:text-ink group-hover:opacity-100"
                            aria-label={`Download ${doc.name}`}
                          >
                            <Download size={12} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2 px-3.5 py-2">
            <p className="text-[10px] text-muted">
              Showing{" "}
              <span className="num font-medium text-ink">
                {filtered.length === 0 ? 0 : safePage * perPage + 1}–{Math.min((safePage + 1) * perPage, filtered.length)}
              </span>{" "}
              of <span className="num font-medium text-ink">{filtered.length}</span> documents
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="grid h-6 w-6 place-items-center rounded border border-line bg-surface text-muted disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={11} />
              </button>
              {Array.from({ length: pageCount }).slice(0, 5).map((_, i) => {
                const p = Math.min(Math.max(0, safePage - 2), Math.max(0, pageCount - 5)) + i;
                if (p >= pageCount) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    aria-current={p === safePage}
                    className={cn(
                      "num h-6 min-w-6 rounded border px-1 text-[10px]",
                      p === safePage ? "border-brand bg-brand text-white dark:text-[#04140f]" : "border-line bg-surface text-muted hover:text-ink",
                    )}
                  >
                    {p + 1}
                  </button>
                );
              })}
              <button
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={safePage >= pageCount - 1}
                className="grid h-6 w-6 place-items-center rounded border border-line bg-surface text-muted disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={11} />
              </button>
            </div>
          </div>
        </Card>

        <div className="space-y-4 lg:col-span-4">
          <Card className="overflow-hidden">
            <CardHeader
              eyebrow="Coverage"
              title="Missing documents"
              subtitle="Required slots without a linked file."
            />
            <div className="divide-y divide-line">
              {missing.map(({ bill, count, gap }) => (
                <Link
                  key={bill.id}
                  href={`/bills/${bill.id}`}
                  className="flex items-center gap-2.5 px-4 py-2.5 transition-colors hover:bg-surface-2"
                >
                  <AlertTriangle size={13} className="shrink-0 text-warning" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-medium text-ink">{bill.shortTitle}</p>
                    <p className="font-mono text-[8.5px] text-faint">
                      {bill.id} · {count} file{count === 1 ? "" : "s"} linked
                    </p>
                  </div>
                  <Badge tone="warning" size="xs">
                    +{gap} needed
                  </Badge>
                </Link>
              ))}
              {missing.length === 0 && (
                <div className="flex items-center gap-2 px-4 py-6 text-[10.5px] text-success">
                  <CheckCircle2 size={14} /> Every required slot is filled.
                </div>
              )}
            </div>
            <div className="border-t border-line p-3">
              <div className="flex items-center justify-between text-[9.5px] text-muted">
                <span>Repository completeness</span>
                <span className="num font-medium text-ink">94%</span>
              </div>
              <Progress value={94} className="mt-1.5" height={4} />
            </div>
          </Card>

          <Card className="p-4">
            <p className="eyebrow">Classification policy</p>
            <div className="mt-3 space-y-2">
              {[
                { icon: FileText, label: "Public", note: "All roles with document access", tone: "text-muted" },
                { icon: Lock, label: "Restricted", note: "Law & Justice, Secretary, Admin", tone: "text-warning" },
                { icon: ShieldAlert, label: "Classified", note: "Admin and Secretary only", tone: "text-danger" },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-2 rounded-[9px] border border-line bg-surface-2 px-2.5 py-2">
                  <row.icon size={12} className={cn("mt-0.5 shrink-0", row.tone)} />
                  <div>
                    <p className="text-[10px] font-medium text-ink">{row.label}</p>
                    <p className="text-[9px] text-faint">{row.note}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 flex items-start gap-1.5 text-[9px] leading-[1.6] text-faint">
              <Info size={10} className="mt-0.5 shrink-0" /> Access is enforced server-side; hiding a link
              in the interface is never the only control.
            </p>
          </Card>
        </div>
      </div>

      <UploadDocumentModal
        open={uploadOpen}
        bills={bills.map((b) => b.id)}
        onClose={() => setUploadOpen(false)}
        onDone={(input) => {
          addDocument(input);
          setUploadOpen(false);
        }}
      />
    </div>
  );
}

function UploadDocumentModal({
  open,
  onClose,
  onDone,
  bills,
}: {
  open: boolean;
  onClose: () => void;
  onDone: (input: {
    name: string;
    type: "Bill Copy" | "Order of the Day" | "Committee Report" | "Ministry Response" | "Transmitted Copy" | "Presidential Message" | "Gazette Notification";
    billId: string;
    size: string;
    classification: "public" | "restricted" | "classified";
  }) => void;
  bills: string[];
}) {
  const [type, setType] = React.useState<string>("Bill Copy");
  const [billId, setBillId] = React.useState(bills[0] ?? "MOPA-2026-1040");
  const [name, setName] = React.useState("");
  const [classification, setClassification] = React.useState<"public" | "restricted" | "classified">("public");
  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Repository"
      title="Upload a document"
      description="Files are version-controlled and linked to the bill's stage history."
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={!name}
            onClick={() =>
              onDone({
                name,
                type: type as "Bill Copy",
                billId,
                size: `${(0.6 + (name.length % 30) / 10).toFixed(1)} MB`,
                classification,
              })
            }
          >
            <Upload size={12} /> Link document
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Linked bill</span>
          <select value={billId} onChange={(e) => setBillId(e.target.value)} className="field h-10 text-[12px]">
            {bills.map((id) => (
              <option key={id}>{id}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Document type</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className="field h-10 text-[12px]">
            {DOC_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <div>
          <p className="mb-1.5 text-[11px] font-medium text-ink-2">Classification</p>
          <div className="flex flex-wrap gap-1.5">
            {(["public", "restricted", "classified"] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setClassification(c)}
                className={cn(
                  "rounded-md border px-2 py-1 text-[10.5px] font-medium capitalize transition-colors",
                  classification === c
                    ? "border-brand bg-brand-soft text-brand-ink"
                    : "border-line text-muted hover:text-ink",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium text-ink-2">File</span>
          <input
            type="file"
            onChange={(e) => setName(e.target.files?.[0]?.name ?? "")}
            className="field h-auto py-2 text-[10px] text-muted file:mr-2 file:rounded file:border file:border-line-strong file:bg-surface file:px-2 file:py-1 file:text-[10px] file:font-medium file:text-ink"
          />
        </label>
        <div className="flex items-start gap-2 rounded-[9px] border border-line bg-surface-2 p-2.5">
          <Info size={12} className="mt-0.5 shrink-0 text-faint" />
          <p className="text-[9.5px] leading-[1.6] text-muted">
            Maximum 20 MB per file. Uploads are scanned and recorded against your user ID in the audit
            trail.
          </p>
        </div>
      </div>
    </Modal>
  );
}

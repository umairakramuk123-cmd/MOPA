"use client";

import * as React from "react";
import Link from "next/link";
import { cn, daysBetween, formatDateShort, SYSTEM_DATE } from "@/lib/format";
import { MINISTRIES, ministryShort } from "@/lib/data";
import { OUTCOME_META, TYPE_LABEL } from "@/lib/workflows";
import { Bill, BillType, House, Outcome } from "@/lib/types";
import { Badge, Button, EmptyState, Segmented, Select } from "@/components/ui/primitives";
import { DeadlineChip, HouseChip, OutcomeBadge, StageBadge, StageProgress, TypeChip } from "@/components/ui/bill-bits";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";

type SortKey = "title" | "id" | "registeredAt" | "stage" | "ministry" | "deadline" | "outcome";

const PAGE_SIZE = 10;

export function BillTable({
  bills,
  compact,
  initialType = "all",
  showSearch = true,
  pageSize = PAGE_SIZE,
  title,
}: {
  bills: Bill[];
  compact?: boolean;
  initialType?: "all" | BillType;
  showSearch?: boolean;
  pageSize?: number;
  title?: string;
}) {
  const { toast } = useStore();
  const [query, setQuery] = React.useState("");
  const [type, setType] = React.useState<"all" | BillType>(initialType);
  const [house, setHouse] = React.useState<"all" | House>("all");
  const [ministry, setMinistry] = React.useState("all");
  const [outcome, setOutcome] = React.useState<"all" | Outcome>("all");
  const [flag, setFlag] = React.useState<"all" | "overdue" | "due-soon">("all");
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" }>({
    key: "registeredAt",
    dir: "desc",
  });
  const [page, setPage] = React.useState(0);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = React.useState(false);
  const [density, setDensity] = React.useState<"comfortable" | "compact">("comfortable");

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = bills.filter((b) => {
      if (type !== "all" && b.type !== type) return false;
      if (house !== "all" && b.house !== house) return false;
      if (ministry !== "all" && b.ministryId !== ministry) return false;
      if (outcome !== "all" && b.outcome !== outcome) return false;
      if (flag !== "all") {
        if (!b.committeeDueAt) return false;
        const d = daysBetween(SYSTEM_DATE, b.committeeDueAt);
        if (flag === "overdue" && d >= 0) return false;
        if (flag === "due-soon" && (d < 0 || d > 7)) return false;
      }
      if (q) {
        const hay = `${b.id} ${b.title} ${b.memberInCharge} ${ministryShort(b.ministryId)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    rows = [...rows].sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.key) {
        case "title":
          return a.title.localeCompare(b.title) * dir;
        case "id":
          return a.id.localeCompare(b.id) * dir;
        case "ministry":
          return ministryShort(a.ministryId).localeCompare(ministryShort(b.ministryId)) * dir;
        case "stage":
          return a.stage.localeCompare(b.stage) * dir;
        case "outcome":
          return a.outcome.localeCompare(b.outcome) * dir;
        case "deadline":
          return (
            ((a.committeeDueAt ? new Date(a.committeeDueAt).getTime() : Infinity) -
              (b.committeeDueAt ? new Date(b.committeeDueAt).getTime() : Infinity)) *
            dir
          );
        default:
          return (new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime()) * dir;
      }
    });
    return rows;
  }, [bills, query, type, house, ministry, outcome, flag, sort]);

  React.useEffect(() => setPage(0), [query, type, house, ministry, outcome, flag, sort, pageSize]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const activeFilters =
    (type !== "all" ? 1 : 0) +
    (house !== "all" ? 1 : 0) +
    (ministry !== "all" ? 1 : 0) +
    (outcome !== "all" ? 1 : 0) +
    (flag !== "all" ? 1 : 0);

  const reset = () => {
    setType("all");
    setHouse("all");
    setMinistry("all");
    setOutcome("all");
    setFlag("all");
    setQuery("");
  };

  const toggleSort = (key: SortKey) => {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  };

  const allOnPageSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));

  const SortHead = ({ label, k, className }: { label: string; k: SortKey; className?: string }) => (
    <th className={cn("whitespace-nowrap px-3 py-2 text-left font-medium", className)}>
      <button
        onClick={() => toggleSort(k)}
        className="group inline-flex items-center gap-1 text-[9.5px] uppercase tracking-[0.1em] text-faint transition-colors hover:text-ink"
      >
        {label}
        {sort.key === k ? (
          sort.dir === "asc" ? (
            <ArrowUp size={10} className="text-brand" />
          ) : (
            <ArrowDown size={10} className="text-brand" />
          )
        ) : (
          <ArrowUpDown size={10} className="opacity-0 transition-opacity group-hover:opacity-60" />
        )}
      </button>
    </th>
  );

  return (
    <div className="card overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-line p-3.5">
        <div className="flex flex-wrap items-center gap-2">
          {showSearch && (
            <div className="relative min-w-0 flex-1 sm:min-w-[220px]">
              <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={title ?? "Search by title, bill ID, division or member…"}
                className="field h-9 pl-8 pr-8 text-[12px]"
                aria-label="Search bills"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 grid h-5 w-5 -translate-y-1/2 place-items-center rounded text-faint hover:bg-surface-3 hover:text-ink"
                  aria-label="Clear search"
                >
                  <X size={11} />
                </button>
              )}
            </div>
          )}

          {!compact && (
            <Segmented
              options={[
                { value: "all", label: "All" },
                { value: "official", label: "Official" },
                { value: "private", label: "Private" },
                { value: "joint", label: "Joint" },
              ]}
              value={type}
              onChange={(v) => setType(v as typeof type)}
            />
          )}

          <div className="ml-auto flex items-center gap-1.5">
            <Button
              size="sm"
              variant={activeFilters > 0 ? "soft" : "secondary"}
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
            >
              <Filter size={12} />
              Filters
              {activeFilters > 0 && (
                <span className="num rounded bg-brand/15 px-1 text-[9.5px] font-semibold">{activeFilters}</span>
              )}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                setDensity((d) => (d === "comfortable" ? "compact" : "comfortable"))
              }
              aria-label="Toggle density"
              title="Toggle row density"
            >
              <SlidersHorizontal size={12} />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                toast({
                  title: "Export prepared",
                  description: `${filtered.length} records queued as Excel export. Download will appear in Reports.`,
                  tone: "success",
                })
              }
            >
              <Download size={12} />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 gap-2 rounded-[11px] border border-line bg-surface-2 p-2.5 sm:grid-cols-4">
            <label className="block">
              <span className="mb-1 block text-[9.5px] font-medium uppercase tracking-[0.1em] text-faint">House</span>
              <Select value={house} onChange={(e) => setHouse(e.target.value as typeof house)} className="h-8 text-[11.5px]">
                <option value="all">All Houses</option>
                <option value="NA">National Assembly</option>
                <option value="Senate">Senate</option>
                <option value="Joint">Joint Sitting</option>
              </Select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[9.5px] font-medium uppercase tracking-[0.1em] text-faint">Division</span>
              <Select value={ministry} onChange={(e) => setMinistry(e.target.value)} className="h-8 text-[11.5px]">
                <option value="all">All divisions</option>
                {MINISTRIES.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.short}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[9.5px] font-medium uppercase tracking-[0.1em] text-faint">Outcome</span>
              <Select value={outcome} onChange={(e) => setOutcome(e.target.value as typeof outcome)} className="h-8 text-[11.5px]">
                <option value="all">All outcomes</option>
                {(Object.keys(OUTCOME_META) as Outcome[]).map((o) => (
                  <option key={o} value={o}>
                    {OUTCOME_META[o].label}
                  </option>
                ))}
              </Select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[9.5px] font-medium uppercase tracking-[0.1em] text-faint">Deadline</span>
              <Select value={flag} onChange={(e) => setFlag(e.target.value as typeof flag)} className="h-8 text-[11.5px]">
                <option value="all">Any</option>
                <option value="overdue">Overdue only</option>
                <option value="due-soon">Due in 7 days</option>
              </Select>
            </label>
            {activeFilters > 0 && (
              <div className="col-span-2 flex items-center gap-2 sm:col-span-4">
                <Button size="sm" variant="ghost" onClick={reset}>
                  <X size={12} /> Clear all filters
                </Button>
                <span className="text-[10px] text-faint">{filtered.length} matching records</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bulk bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-line bg-brand-soft px-3.5 py-2">
          <span className="num text-[11px] font-medium text-brand-ink">{selected.size} selected</span>
          <span className="text-line-strong">|</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              toast({
                title: "Export queued",
                description: `${selected.size} records will be compiled into a PDF report.`,
                tone: "success",
              })
            }
          >
            <Download size={11} /> Export selection
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Table */}
      {rows.length === 0 ? (
        <EmptyState
          icon={<Search size={19} />}
          title="No bills match these filters"
          description="Adjust the filters or clear the search to see the full registry. Nothing is hidden from your role — the query simply returned no records."
          action={
            <Button size="sm" variant="secondary" onClick={reset}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <div className="scroll-thin overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-left">
            <thead className="bg-surface-2">
              <tr className="border-b border-line">
                <th className="w-9 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={() =>
                      setSelected((prev) => {
                        const next = new Set(prev);
                        if (allOnPageSelected) rows.forEach((r) => next.delete(r.id));
                        else rows.forEach((r) => next.add(r.id));
                        return next;
                      })
                    }
                    aria-label="Select all rows on this page"
                    className="h-3.5 w-3.5 cursor-pointer rounded border-line-strong accent-[var(--brand)]"
                  />
                </th>
                <SortHead label="Bill" k="title" />
                <SortHead label="Stage" k="stage" className="hidden md:table-cell" />
                <th className="hidden px-3 py-2 text-left text-[9.5px] font-medium uppercase tracking-[0.1em] text-faint lg:table-cell">
                  House
                </th>
                <SortHead label="Division" k="ministry" className="hidden xl:table-cell" />
                <SortHead label="Deadline" k="deadline" className="hidden sm:table-cell" />
                <SortHead label="Outcome" k="outcome" className="hidden md:table-cell" />
                <SortHead label="Registered" k="registeredAt" className="hidden lg:table-cell" />
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((bill) => {
                const isSelected = selected.has(bill.id);
                return (
                  <tr
                    key={bill.id}
                    className={cn(
                      "group border-b border-line transition-colors last:border-0 hover:bg-surface-2",
                      isSelected && "bg-brand-soft/40",
                    )}
                  >
                    <td className={cn("px-3", density === "compact" ? "py-1.5" : "py-2.5")}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          setSelected((prev) => {
                            const next = new Set(prev);
                            next.has(bill.id) ? next.delete(bill.id) : next.add(bill.id);
                            return next;
                          })
                        }
                        aria-label={`Select ${bill.id}`}
                        className="h-3.5 w-3.5 cursor-pointer rounded border-line-strong accent-[var(--brand)]"
                      />
                    </td>
                    <td className={cn("max-w-[330px] px-3", density === "compact" ? "py-1.5" : "py-2.5")}>
                      <Link href={`/bills/${bill.id}`} className="block min-w-0">
                        <div className="flex items-center gap-1.5">
                          <TypeChip type={bill.type} />
                          <span className="num font-mono text-[9px] text-faint">{bill.id}</span>
                          {bill.priority === "high" && (
                            <span className="h-1.5 w-1.5 rounded-full bg-danger" title="High priority" />
                          )}
                        </div>
                        <p className="mt-1 line-clamp-1 text-[12px] font-medium leading-4 text-ink group-hover:text-brand-ink">
                          {bill.shortTitle}
                        </p>
                        {density === "comfortable" && (
                          <p className="mt-0.5 line-clamp-1 text-[10px] text-muted">{bill.memberInCharge}</p>
                        )}
                      </Link>
                    </td>
                    <td className={cn("hidden w-[150px] px-3 md:table-cell", density === "compact" ? "py-1.5" : "py-2.5")}>
                      <StageBadge bill={bill} />
                      <div className="mt-1.5">
                        <StageProgress bill={bill} />
                      </div>
                    </td>
                    <td className={cn("hidden px-3 lg:table-cell", density === "compact" ? "py-1.5" : "py-2.5")}>
                      <HouseChip house={bill.house} />
                    </td>
                    <td className={cn("hidden px-3 text-[11px] text-ink-2 xl:table-cell", density === "compact" ? "py-1.5" : "py-2.5")}>
                      {ministryShort(bill.ministryId)}
                    </td>
                    <td className={cn("hidden px-3 sm:table-cell", density === "compact" ? "py-1.5" : "py-2.5")}>
                      <DeadlineChip dueAt={bill.committeeDueAt} compact />
                    </td>
                    <td className={cn("hidden px-3 md:table-cell", density === "compact" ? "py-1.5" : "py-2.5")}>
                      <OutcomeBadge outcome={bill.outcome} />
                    </td>
                    <td className={cn("hidden whitespace-nowrap px-3 text-[10.5px] text-muted lg:table-cell", density === "compact" ? "py-1.5" : "py-2.5")}>
                      {formatDateShort(bill.registeredAt)}
                    </td>
                    <td className={cn("px-2 text-right", density === "compact" ? "py-1.5" : "py-2.5")}>
                      <Link
                        href={`/bills/${bill.id}`}
                        className="inline-flex h-6 items-center gap-0.5 rounded-md px-1.5 text-[10px] font-medium text-brand opacity-0 transition-opacity hover:bg-brand-soft group-hover:opacity-100 focus-visible:opacity-100"
                      >
                        Open <ChevronRight size={11} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface-2 px-3.5 py-2.5">
        <p className="text-[10.5px] text-muted">
          Showing{" "}
          <span className="num font-medium text-ink">
            {filtered.length === 0 ? 0 : safePage * pageSize + 1}–
            {Math.min((safePage + 1) * pageSize, filtered.length)}
          </span>{" "}
          of <span className="num font-medium text-ink">{filtered.length}</span> bills
          {activeFilters > 0 && <span className="text-faint"> · {activeFilters} filters applied</span>}
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={safePage === 0}
            className="pressable grid h-7 w-7 place-items-center rounded-md border border-line bg-surface text-muted transition-colors hover:text-ink disabled:opacity-40"
            aria-label="Previous page"
          >
            <ChevronLeft size={13} />
          </button>
          {Array.from({ length: Math.min(5, pageCount) }).map((_, i) => {
            const start = Math.max(0, Math.min(safePage - 2, pageCount - 5));
            const p = Math.max(0, start) + i;
            if (p >= pageCount) return null;
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                aria-current={p === safePage}
                className={cn(
                  "num h-7 min-w-7 rounded-md border px-1.5 text-[10.5px] font-medium transition-colors",
                  p === safePage
                    ? "border-brand bg-brand text-white dark:text-[#04140f]"
                    : "border-line bg-surface text-muted hover:text-ink",
                )}
              >
                {p + 1}
              </button>
            );
          })}
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={safePage >= pageCount - 1}
            className="pressable grid h-7 w-7 place-items-center rounded-md border border-line bg-surface text-muted transition-colors hover:text-ink disabled:opacity-40"
            aria-label="Next page"
          >
            <ChevronRight size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Simplified list card -------------------------- */
export function BillListCard({
  bills,
  title,
  subtitle,
  limit = 5,
  href = "/bills",
}: {
  bills: Bill[];
  title: string;
  subtitle?: string;
  limit?: number;
  href?: string;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div>
          <p className="text-[13px] font-semibold text-ink">{title}</p>
          {subtitle && <p className="mt-0.5 text-[10.5px] text-muted">{subtitle}</p>}
        </div>
        <Link href={href} className="text-[10.5px] font-medium text-brand hover:underline">
          View all
        </Link>
      </div>
      <div>
        {bills.slice(0, limit).map((bill) => (
          <Link
            key={bill.id}
            href={`/bills/${bill.id}`}
            className="group flex items-center gap-3 border-b border-line px-4 py-2.5 last:border-0 hover:bg-surface-2"
          >
            <span
              className={cn(
                "grid h-7 w-7 shrink-0 place-items-center rounded-md border font-mono text-[7.5px] font-semibold",
                bill.type === "official"
                  ? "border-brand/20 bg-brand-soft text-brand-ink"
                  : bill.type === "private"
                    ? "border-gold/20 bg-gold-soft text-gold"
                    : "border-violet/20 bg-violet-soft text-violet",
              )}
            >
              {bill.type === "official" ? "OB" : bill.type === "private" ? "PMB" : "JS"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11.5px] font-medium text-ink group-hover:text-brand-ink">
                {bill.shortTitle}
              </p>
              <p className="truncate font-mono text-[9px] text-faint">
                {bill.id} · {ministryShort(bill.ministryId)} · {TYPE_LABEL[bill.type]}
              </p>
            </div>
            <Badge tone={OUTCOME_META[bill.outcome].tone} size="xs">
              {OUTCOME_META[bill.outcome].label}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}

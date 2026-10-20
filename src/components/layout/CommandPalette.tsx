"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { NAV_GROUPS, UTILITY_NAV } from "@/lib/nav";
import { can } from "@/lib/roles";
import { ministryShort } from "@/lib/data";
import { TYPE_LABEL } from "@/lib/workflows";
import {
  ArrowRight,
  CornerDownLeft,
  FileSearch,
  Moon,
  ScrollText,
  Search,
  Sun,
  X,
} from "lucide-react";

type Result = {
  id: string;
  label: string;
  sub: string;
  group: string;
  href?: string;
  action?: "theme" | "signout";
  icon: React.ReactNode;
};

export function CommandPalette() {
  const { commandOpen, setCommandOpen, bills, session, toggleTheme, theme } = useStore();
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const role = session.role;

  const filtered = React.useMemo<Result[]>(() => {
    const pages: Result[] = [
      ...NAV_GROUPS.flatMap((g) =>
        g.items
          .filter((i) => !i.permission || can(role, i.permission))
          .map((i) => ({
            id: `nav-${i.href}`,
            label: i.label,
            sub: i.hint ?? g.label,
            group: "Navigate",
            href: i.href,
            icon: <i.icon size={15} />,
          })),
      ),
      ...UTILITY_NAV.map((i) => ({
        id: `nav-${i.href}`,
        label: i.label,
        sub: "Support",
        group: "Navigate",
        href: i.href,
        icon: <i.icon size={15} />,
      })),
    ];

    const billResults: Result[] = bills.slice(0, 40).map((b) => ({
      id: b.id,
      label: b.title,
      sub: `${b.id} · ${TYPE_LABEL[b.type]} · ${ministryShort(b.ministryId)}`,
      group: "Bills",
      href: `/bills/${b.id}`,
      icon: <ScrollText size={15} />,
    }));

    const actions: Result[] = [
      {
        id: "act-theme",
        label: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        sub: "Appearance",
        group: "Actions",
        action: "theme",
        icon: theme === "dark" ? <Sun size={15} /> : <Moon size={15} />,
      },
    ];

    const q = query.trim().toLowerCase();
    if (!q) return [...pages.slice(0, 5), ...billResults.slice(0, 3), ...actions];
    return [...pages, ...billResults, ...actions]
      .filter((r) => `${r.label} ${r.sub}`.toLowerCase().includes(q))
      .slice(0, 9);
  }, [query, bills, role, theme]);

  React.useEffect(() => {
    if (commandOpen) {
      setQuery("");
      setActive(0);
      const t = window.setTimeout(() => inputRef.current?.focus(), 40);
      return () => window.clearTimeout(t);
    }
  }, [commandOpen]);

  const run = React.useCallback(
    (r: Result) => {
      setCommandOpen(false);
      if (r.action === "theme") {
        toggleTheme();
        return;
      }
      if (r.href) router.push(r.href);
    },
    [router, setCommandOpen, toggleTheme],
  );

  React.useEffect(() => {
    if (!commandOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((v) => (v + 1) % Math.max(1, filtered.length));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((v) => (v - 1 + filtered.length) % Math.max(1, filtered.length));
      }
      if (e.key === "Enter" && filtered[active]) {
        e.preventDefault();
        run(filtered[active]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commandOpen, filtered, active, run]);

  if (!commandOpen) return null;

  const groups = [...new Set(filtered.map((r) => r.group))];

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]">
      <div
        className="absolute inset-0 bg-ink/45 backdrop-blur-[3px]"
        onClick={() => setCommandOpen(false)}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative w-full max-w-[560px] animate-scale-in overflow-hidden rounded-[18px] border border-line bg-surface shadow-[var(--shadow-pop)]"
      >
        <div className="flex items-center gap-2.5 border-b border-line px-4">
          <Search size={17} className="shrink-0 text-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            placeholder="Search bills, reports, divisions or jump to a page…"
            className="h-[52px] w-full bg-transparent text-[13.5px] text-ink outline-none placeholder:text-faint"
          />
          <button
            onClick={() => setCommandOpen(false)}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-faint hover:bg-surface-3 hover:text-ink"
            aria-label="Close search"
          >
            <X size={14} />
          </button>
        </div>

        <div className="scroll-thin max-h-[52vh] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center py-10 text-center">
              <FileSearch size={22} className="mb-2 text-faint" />
              <p className="text-[12.5px] font-medium text-ink">No matches found</p>
              <p className="mt-1 text-[11px] text-muted">Try a bill ID, a division name or a report.</p>
            </div>
          )}
          {groups.map((group) => {
            const items = filtered.filter((r) => r.group === group);
            return (
              <div key={group} className="mb-1.5">
                <p className="px-2 pb-1 pt-1.5 font-mono text-[8.5px] uppercase tracking-[0.16em] text-faint">
                  {group}
                </p>
                {items.map((r) => {
                  const index = filtered.indexOf(r);
                  return (
                    <button
                      key={r.id}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => run(r)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-[9px] px-2 py-2 text-left transition-colors",
                        index === active ? "bg-brand-soft" : "hover:bg-surface-2",
                      )}
                    >
                      <span
                        className={cn(
                          "grid h-7 w-7 shrink-0 place-items-center rounded-md border",
                          index === active
                            ? "border-brand/20 bg-surface text-brand"
                            : "border-line bg-surface-2 text-muted",
                        )}
                      >
                        {r.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-medium text-ink">{r.label}</span>
                        <span className="block truncate text-[10px] text-muted">{r.sub}</span>
                      </span>
                      {index === active && <CornerDownLeft size={12} className="shrink-0 text-brand" />}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-line bg-surface-2 px-3.5 py-2">
          <div className="flex items-center gap-3 font-mono text-[9px] text-faint">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-line bg-surface px-1 py-0.5">↑</kbd>
              <kbd className="rounded border border-line bg-surface px-1 py-0.5">↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-line bg-surface px-1 py-0.5">↵</kbd> open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-line bg-surface px-1 py-0.5">esc</kbd> close
            </span>
          </div>
          <span className="flex items-center gap-1 font-mono text-[8.5px] uppercase tracking-[0.14em] text-faint">
            MoPA <ArrowRight size={9} /> Command
          </span>
        </div>
      </div>
    </div>
  );
}

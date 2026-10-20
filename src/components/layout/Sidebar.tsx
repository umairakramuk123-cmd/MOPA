"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";
import { NAV_GROUPS, UTILITY_NAV } from "@/lib/nav";
import { useStore } from "@/lib/store";
import { can } from "@/lib/roles";
import { Logo, Wordmark, Avatar } from "@/components/ui/primitives";
import { CalendarDays, ChevronsLeft, ChevronsRight, LogOut, X, ArrowUpRight } from "lucide-react";
import { SESSION } from "@/lib/data";

export function SidebarContent({
  onNavigate,
  mobile,
}: {
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  const pathname = usePathname();
  const { session, collapsed, setCollapsed, alerts, approvals, signOut, setMobileNavOpen } = useStore();
  const role = session.role;
  const showLabels = mobile || !collapsed;

  const visibleGroup = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.permission || can(role, item.permission)),
  })).filter((group) => group.items.length > 0);

  const openAlerts = alerts.filter(
    (a) => a.status !== "resolved" && a.audience.includes(role.id),
  ).length;
  const pendingApprovals = approvals.filter((a) => a.status === "pending").length;

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  const badgeValue = (badge?: "alerts" | "approvals") =>
    badge === "alerts" ? openAlerts : badge === "approvals" ? pendingApprovals : 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Brand */}
      <div
        className={cn(
          "flex h-[68px] shrink-0 items-center border-b border-line px-4",
          showLabels ? "justify-between" : "justify-center px-0",
        )}
      >
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className={cn("flex min-w-0 items-center gap-2.5", !showLabels && "justify-center")}
        >
          <Logo size={showLabels ? 36 : 34} />
          {showLabels && <Wordmark />}
        </Link>
        {showLabels && (
          <button
            onClick={() => (mobile ? setMobileNavOpen(false) : setCollapsed(true))}
            className="pressable grid h-7 w-7 place-items-center rounded-md text-faint transition-colors hover:bg-surface-3 hover:text-ink"
            aria-label={mobile ? "Close navigation" : "Collapse sidebar"}
          >
            {mobile ? <X size={16} /> : <ChevronsLeft size={16} />}
          </button>
        )}
      </div>

      {/* Session strip */}
      {showLabels && (
        <div className="px-3 pt-3">
          <div className="texture relative overflow-hidden rounded-[12px] border border-brand/15 bg-gradient-to-br from-brand-soft to-surface-2 px-3 py-2.5">
            <div className="relative flex items-center justify-between">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-brand-ink/70">
                  <CalendarDays size={10} /> {SESSION.name}
                </p>
                <p className="mt-0.5 truncate text-[12px] font-semibold text-ink">{SESSION.sitting}</p>
              </div>
              <span className="num shrink-0 rounded-md bg-surface/70 px-1.5 py-0.5 text-[9.5px] font-medium text-brand-ink ring-1 ring-inset ring-brand/10">
                {SESSION.remainingSittings} left
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className={cn("scroll-thin min-h-0 flex-1 overflow-y-auto pb-4", showLabels ? "px-3" : "px-2")}>
        {visibleGroup.map((group) => (
          <div key={group.label} className="mt-4">
            {showLabels ? (
              <p className="mb-1.5 px-2 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-faint">
                {group.label}
              </p>
            ) : (
              <div className="mx-auto mb-2 h-px w-6 bg-line" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                const count = badgeValue(item.badge);
                return (
                  <li key={item.href} className="relative">
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      title={!showLabels ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center rounded-[9px] font-medium transition-all duration-200",
                        showLabels ? "h-9 gap-2.5 px-2 text-[12.5px]" : "h-10 justify-center",
                        active
                          ? "bg-brand-soft text-brand-ink"
                          : "text-ink-2 hover:bg-surface-3 hover:text-ink",
                      )}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-brand" />
                      )}
                      <item.icon
                        size={16}
                        strokeWidth={active ? 2.1 : 1.85}
                        className={cn("shrink-0", active ? "text-brand" : "text-faint group-hover:text-ink-2")}
                      />
                      {showLabels && <span className="truncate">{item.label}</span>}
                      {showLabels && count > 0 && (
                        <span
                          className={cn(
                            "num ml-auto rounded-[5px] px-1.5 py-px text-[9.5px] font-semibold",
                            item.badge === "alerts"
                              ? "bg-danger-soft text-danger"
                              : "bg-gold-soft text-gold",
                          )}
                        >
                          {count}
                        </span>
                      )}
                      {!showLabels && count > 0 && (
                        <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-danger" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="mt-4">
          {showLabels && (
            <p className="mb-1.5 px-2 font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-faint">
              Support
            </p>
          )}
          <ul className="space-y-0.5">
            {UTILITY_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    title={!showLabels ? item.label : undefined}
                    className={cn(
                      "group flex items-center rounded-[9px] font-medium transition-colors",
                      showLabels ? "h-9 gap-2.5 px-2 text-[12.5px]" : "h-10 justify-center",
                      active ? "bg-brand-soft text-brand-ink" : "text-ink-2 hover:bg-surface-3 hover:text-ink",
                    )}
                  >
                    <item.icon size={16} strokeWidth={1.85} className={cn("shrink-0", active ? "text-brand" : "text-faint group-hover:text-ink-2")} />
                    {showLabels && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Footer */}
      <div className={cn("shrink-0 border-t border-line", showLabels ? "p-3" : "px-2 py-3")}>
        {showLabels && (
          <div className="mb-2.5 flex items-center justify-between rounded-[10px] border border-line bg-surface-2 px-2.5 py-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="relative">
                <Avatar name={session.user.name} initials={session.user.initials} size={28} tone="brand" />
                <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-surface bg-success" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[11.5px] font-semibold leading-tight text-ink">{session.user.name}</p>
                <p className="truncate text-[9.5px] leading-3 text-faint">{role.short}</p>
              </div>
            </div>
            <button
              onClick={() => signOut("You signed out of the portal.")}
              className="pressable grid h-6 w-6 shrink-0 place-items-center rounded-md text-faint transition-colors hover:bg-danger-soft hover:text-danger"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
        {showLabels ? (
          <div className="flex items-center justify-between px-1">
            <p className="text-[9px] leading-3 text-faint">
              © 2026 MoPA · Built by <span className="font-medium text-muted">NITB</span>
            </p>
            <Link
              href="/help"
              onClick={onNavigate}
              className="flex items-center gap-0.5 text-[9px] font-medium text-brand hover:underline"
            >
              Guide <ArrowUpRight size={9} />
            </Link>
          </div>
        ) : (
          <button
            onClick={() => setCollapsed(false)}
            className="pressable mx-auto grid h-8 w-8 place-items-center rounded-md text-faint hover:bg-surface-3 hover:text-ink"
            aria-label="Expand sidebar"
          >
            <ChevronsRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const { collapsed, mobileNavOpen, setMobileNavOpen } = useStore();
  return (
    <>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden shrink-0 border-r border-line bg-surface transition-[width] duration-300 ease-[cubic-bezier(.22,1,.36,1)] lg:block",
          collapsed ? "w-[76px]" : "w-[268px]",
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileNavOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileNavOpen}
      >
        <div
          onClick={() => setMobileNavOpen(false)}
          className={cn(
            "absolute inset-0 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300",
            mobileNavOpen ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-[282px] border-r border-line bg-surface shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)]",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <SidebarContent mobile onNavigate={() => setMobileNavOpen(false)} />
        </div>
      </div>
    </>
  );
}

"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn, formatDateShort, relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import { ROLE_ORDER, ROLES, isReadOnly } from "@/lib/roles";
import { SESSION } from "@/lib/data";
import { Avatar, Badge, StatusDot, Tooltip } from "@/components/ui/primitives";
import { ALERT_TYPE_META } from "@/lib/workflows";
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  Eye,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings2,
  Sun,
  UserRound,
  X,
} from "lucide-react";

function useOutsideClose(onClose: () => void) {
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);
  return ref;
}

/* ------------------------------- Breadcrumbs ------------------------------ */
function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const billId = segments[0] === "bills" && segments[1] ? segments[1] : null;
  const labels: Record<string, string> = {
    dashboard: "Dashboard",
    executive: "Executive",
    bills: "Bills Registry",
    tracking: "Stage Tracking",
    committees: "Committees",
    documents: "Documents",
    alerts: "Alerts",
    reports: "Reports",
    ministries: "Ministries",
    approvals: "Approvals",
    users: "Users & Roles",
    audit: "Audit Trail",
    settings: "Settings",
    profile: "Profile",
    help: "Help",
  };
  const base = segments[0] ?? "dashboard";

  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
        <span>MoPA</span>
        <ChevronRight size={9} />
        <span className="text-muted">{labels[base] ?? base}</span>
        {billId && (
          <>
            <ChevronRight size={9} />
            <span className="num truncate text-brand">{billId}</span>
          </>
        )}
      </div>
      <div className="mt-0.5 flex items-baseline gap-2">
        <p className="truncate text-[13px] font-semibold tracking-[-0.015em] text-ink">
          {billId ? "Bill record" : labels[base] ?? "Legislative Monitoring"}
        </p>
        <span className="hidden h-1 w-1 shrink-0 rounded-full bg-line-strong sm:block" />
        <p className="hidden shrink-0 items-center gap-1.5 font-mono text-[9.5px] text-faint sm:flex">
          <StatusDot tone="success" /> Live
        </p>
      </div>
    </div>
  );
}

/* ----------------------------- Notifications ----------------------------- */
function NotificationsMenu({ onClose }: { onClose: () => void }) {
  const { alerts, session, acknowledgeAlert } = useStore();
  const router = useRouter();
  const role = session.role;
  const visible = alerts.filter((a) => a.audience.includes(role.id));
  const open = visible.filter((a) => a.status === "open");
  const ref = useOutsideClose(onClose);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-[calc(100%+10px)] z-50 w-[calc(100vw-24px)] max-w-[386px] origin-top-right animate-scale-in overflow-hidden rounded-[16px] border border-line bg-surface shadow-[var(--shadow-pop)]"
    >
      <div className="flex items-start justify-between border-b border-line px-4 py-3">
        <div>
          <p className="text-[13px] font-semibold text-ink">Notifications</p>
          <p className="mt-0.5 text-[10.5px] text-muted">
            {open.length} open · {SESSION.name}
          </p>
        </div>
        <button
          onClick={onClose}
          className="grid h-6 w-6 place-items-center rounded-md text-faint hover:bg-surface-3 hover:text-ink"
          aria-label="Close notifications"
        >
          <X size={14} />
        </button>
      </div>
      <div className="scroll-thin max-h-[330px] overflow-y-auto">
        {visible.slice(0, 5).map((alert) => {
          const meta = ALERT_TYPE_META[alert.type];
          const tone = alert.severity === "critical" ? "bg-danger" : alert.severity === "warning" ? "bg-warning" : "bg-info";
          return (
            <button
              key={alert.id}
              onClick={() => {
                acknowledgeAlert(alert.id);
                onClose();
                router.push("/alerts");
              }}
              className={cn(
                "flex w-full gap-3 border-b border-line px-4 py-3 text-left transition-colors last:border-0 hover:bg-surface-2",
                alert.status === "resolved" && "opacity-55",
              )}
            >
              <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", tone)} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-[11.5px] font-medium text-ink">{alert.title}</span>
                  <span className="shrink-0 font-mono text-[9px] text-faint">{relativeTime(alert.createdAt)}</span>
                </span>
                <span className="mt-0.5 line-clamp-2 block text-[10.5px] leading-[1.5] text-muted">
                  {alert.message}
                </span>
                <span className="mt-1 flex items-center gap-1.5">
                  <span className="num font-mono text-[9px] text-brand">{alert.billId}</span>
                  <span className="text-[9px] text-faint">· {meta.label}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-between border-t border-line bg-surface-2 px-4 py-2.5">
        <span className="flex items-center gap-1.5 text-[9.5px] text-faint">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Alerts engine active
        </span>
        <button
          onClick={() => {
            onClose();
            router.push("/alerts");
          }}
          className="text-[10.5px] font-medium text-brand hover:underline"
        >
          View all alerts →
        </button>
      </div>
    </div>
  );
}

/* -------------------------------- User menu ------------------------------ */
function UserMenu({ onClose }: { onClose: () => void }) {
  const { session, switchRole, signOut, theme, toggleTheme } = useStore();
  const router = useRouter();
  const ref = useOutsideClose(onClose);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-[calc(100%+10px)] z-50 w-[318px] origin-top-right animate-scale-in overflow-hidden rounded-[16px] border border-line bg-surface shadow-[var(--shadow-pop)]"
    >
      <div className="border-b border-line bg-surface-2 px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <Avatar name={session.user.name} initials={session.user.initials} size={38} tone="brand" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-ink">{session.user.name}</p>
            <p className="truncate text-[10.5px] text-muted">{session.user.email}</p>
          </div>
          <Badge tone={session.user.mfa ? "success" : "warning"} dot className="ml-auto shrink-0">
            {session.user.mfa ? "MFA" : "MFA off"}
          </Badge>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1.5">
          <Eye size={11} className="text-faint" />
          <span className="text-[10px] text-muted">Signed in as</span>
          <span className="ml-auto text-[10.5px] font-medium text-ink">{session.role.name}</span>
        </div>
      </div>

      <div className="px-2 py-2">
        <p className="px-2 pb-1 font-mono text-[8.5px] uppercase tracking-[0.16em] text-faint">
          Preview access as
        </p>
        <div className="scroll-thin max-h-[196px] overflow-y-auto">
          {ROLE_ORDER.map((id) => {
            const role = ROLES[id];
            const active = id === session.role.id;
            return (
              <button
                key={id}
                onClick={() => {
                  switchRole(id);
                  onClose();
                }}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
                  active ? "bg-brand-soft" : "hover:bg-surface-3",
                )}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: role.accent }}
                />
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-[11px] font-medium", active ? "text-brand-ink" : "text-ink-2")}>
                    {role.name}
                  </span>
                  <span className="block truncate text-[9px] text-faint">{role.org}</span>
                </span>
                {active && <Check size={12} className="shrink-0 text-brand" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-line px-2 py-2">
        {[
          { label: "My profile", href: "/profile", icon: UserRound },
          { label: "Settings", href: "/settings", icon: Settings2 },
          { label: "Help & glossary", href: "/help", icon: CircleHelp },
        ].map((item) => (
          <button
            key={item.href}
            onClick={() => {
              onClose();
              router.push(item.href);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-[11.5px] text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <item.icon size={13} className="text-faint" />
            {item.label}
          </button>
        ))}
        <button
          onClick={toggleTheme}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-[11.5px] text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink"
        >
          {theme === "dark" ? <Sun size={13} className="text-faint" /> : <Moon size={13} className="text-faint" />}
          {theme === "dark" ? "Light mode" : "Dark mode"}
          <span className="ml-auto font-mono text-[9px] text-faint">T</span>
        </button>
      </div>

      <div className="border-t border-line p-2">
        <button
          onClick={() => signOut("You signed out of the portal.")}
          className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-[11.5px] font-medium text-danger transition-colors hover:bg-danger-soft"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- Topbar -------------------------------- */
export function Topbar() {
  const { setMobileNavOpen, setCommandOpen, alerts, session, theme, toggleTheme } = useStore();
  const [openMenu, setOpenMenu] = React.useState<"bell" | "user" | null>(null);
  const role = session.role;
  const openAlerts = alerts.filter(
    (a) => a.status === "open" && a.audience.includes(role.id),
  ).length;
  const readOnly = isReadOnly(role);

  React.useEffect(() => {
    const close = () => setOpenMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-[64px] shrink-0 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur-xl lg:px-7">
      <button
        onClick={() => setMobileNavOpen(true)}
        className="pressable grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-surface text-ink-2 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={17} />
      </button>

      <Breadcrumbs />

      <div className="ml-auto flex items-center gap-1.5">
        {readOnly && (
          <span className="mr-1 hidden items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[10px] font-medium text-muted xl:flex">
            <Eye size={11} /> View only
          </span>
        )}

        <button
          onClick={() => setCommandOpen(true)}
          className="pressable group hidden h-9 items-center gap-2 rounded-lg border border-line bg-surface pl-2.5 pr-1.5 text-[11.5px] text-faint transition-colors hover:border-line-strong hover:text-muted sm:flex md:w-[204px]"
        >
          <Search size={14} />
          <span className="hidden md:block">Search bills, reports…</span>
          <kbd className="ml-auto hidden items-center gap-0.5 rounded border border-line bg-surface-2 px-1 py-0.5 font-mono text-[9px] md:flex">
            ⌘K
          </kbd>
        </button>

        <Tooltip label="Search · ⌘K">
          <button
            onClick={() => setCommandOpen(true)}
            className="pressable grid h-9 w-9 place-items-center rounded-lg text-muted hover:bg-surface-3 hover:text-ink sm:hidden"
            aria-label="Search"
          >
            <Search size={17} />
          </button>
        </Tooltip>

        <div className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 xl:flex">
          <StatusDot tone="success" pulse />
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted">
            {SESSION.sitting}
          </span>
          <span className="text-[9px] text-faint">· next {formatDateShort(SESSION.nextSitting)}</span>
        </div>

        <Tooltip label={theme === "dark" ? "Light mode" : "Dark mode"}>
          <button
            onClick={toggleTheme}
            className="pressable grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-3 hover:text-ink"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </Tooltip>

        <div className="relative">
          <button
            onClick={() => setOpenMenu((v) => (v === "bell" ? null : "bell"))}
            className={cn(
              "pressable relative grid h-9 w-9 place-items-center rounded-lg transition-colors",
              openMenu === "bell" ? "bg-surface-3 text-ink" : "text-muted hover:bg-surface-3 hover:text-ink",
            )}
            aria-label={`Notifications (${openAlerts} open)`}
            aria-expanded={openMenu === "bell"}
          >
            <Bell size={17} />
            {openAlerts > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-full border-2 border-canvas bg-danger px-0.5 text-[8px] font-bold text-white">
                {openAlerts > 9 ? "9+" : openAlerts}
              </span>
            )}
          </button>
          {openMenu === "bell" && <NotificationsMenu onClose={() => setOpenMenu(null)} />}
        </div>

        <div className="mx-1 hidden h-5 w-px bg-line sm:block" />

        <div className="relative">
          <button
            onClick={() => setOpenMenu((v) => (v === "user" ? null : "user"))}
            className={cn(
              "pressable flex h-9 items-center gap-2 rounded-lg pl-1 pr-1.5 transition-colors",
              openMenu === "user" ? "bg-surface-3" : "hover:bg-surface-3",
            )}
            aria-expanded={openMenu === "user"}
            aria-label="Account menu"
          >
            <Avatar name={session.user.name} initials={session.user.initials} size={28} tone="brand" />
            <div className="hidden min-w-0 text-left md:block">
              <p className="max-w-[120px] truncate text-[11px] font-semibold leading-tight text-ink">
                {session.user.name}
              </p>
              <p className="max-w-[120px] truncate text-[9px] leading-3 text-faint">{role.short}</p>
            </div>
            <ChevronDown size={13} className={cn("hidden text-faint transition-transform md:block", openMenu === "user" && "rotate-180")} />
          </button>
          {openMenu === "user" && <UserMenu onClose={() => setOpenMenu(null)} />}
        </div>
      </div>
    </header>
  );
}

"use client";

import * as React from "react";
import { formatDate, relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import { PERMISSION_GROUPS, ROLES, ROLE_ORDER, can, permissionLabel } from "@/lib/roles";
import { RoleId } from "@/lib/types";
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, Select, Switch, Tabs } from "@/components/ui/primitives";
import { StatStrip } from "@/components/kpi";
import { Modal } from "@/components/ui/overlay";
import {
  Check,
  CircleSlash,
  Info,
  KeyRound,
  Lock,
  Mail,
  Minus,
  Search,
  ShieldCheck,
  UserCheck,
  UserPlus,
  UserX,
} from "lucide-react";

export function UsersView() {
  const { users, session, toast, switchRole } = useStore();
  const [tab, setTab] = React.useState<"people" | "matrix">("people");
  const [query, setQuery] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState<"all" | RoleId>("all");
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const canManage = can(session.role, "users.manage");

  const filtered = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (query && !`${u.name} ${u.email}`.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  const mfaCoverage = Math.round((users.filter((u) => u.mfa).length / users.length) * 100);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">Administration</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
            Users &amp; access control
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-5 text-muted">
            Seven roles, each mapped to the permissions defined in the BRD. Permissions are enforced at
            the API layer — hiding an action is never the only control.
          </p>
        </div>
        {canManage && (
          <Button variant="primary" size="md" onClick={() => setInviteOpen(true)}>
            <UserPlus size={14} /> Invite user
          </Button>
        )}
      </div>

      <StatStrip
        items={[
          { label: "Active accounts", value: users.filter((u) => u.status === "active").length, tone: "var(--success)" },
          { label: "Invitations pending", value: users.filter((u) => u.status === "invited").length, tone: "var(--warning)" },
          { label: "MFA coverage", value: `${mfaCoverage}%`, tone: "var(--brand)" },
          { label: "Roles configured", value: ROLE_ORDER.length, tone: "var(--ink)" },
        ]}
      />

      <Tabs
        tabs={[
          { value: "people", label: "People", count: users.length },
          { value: "matrix", label: "Permission matrix" },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === "people" && (
        <>
          <Card className="p-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[180px] flex-1">
                <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-faint" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or email…"
                  className="field h-8 pl-8 text-[11.5px]"
                />
              </div>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as typeof roleFilter)}
                className="h-8 w-[200px] text-[11px]"
                aria-label="Filter by role"
              >
                <option value="all">All roles</option>
                {ROLE_ORDER.map((r) => (
                  <option key={r} value={r}>
                    {ROLES[r].name}
                  </option>
                ))}
              </Select>
              <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
                {filtered.length} accounts
              </span>
            </div>
          </Card>

          <Card className="overflow-hidden">
            {filtered.length === 0 ? (
              <EmptyState
                icon={<UserX size={18} />}
                title="No accounts match"
                description="Try a different name, email or role. Deactivated accounts remain listed for audit continuity."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                  <thead className="bg-surface-2">
                    <tr className="border-b border-line">
                      {["User", "Role", "Scope", "MFA", "Last active", "Status", ""].map((h) => (
                        <th key={h} className="whitespace-nowrap px-3 py-2 text-[9px] font-medium uppercase tracking-[0.1em] text-faint">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((user) => {
                      const role = ROLES[user.role];
                      return (
                        <tr key={user.id} className="group border-b border-line last:border-0 hover:bg-surface-2">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <Avatar name={user.name} initials={user.initials} size={28} tone={user.status === "active" ? "brand" : "neutral"} />
                              <div className="min-w-0">
                                <p className="truncate text-[11px] font-medium text-ink">{user.name}</p>
                                <p className="truncate font-mono text-[8.5px] text-faint">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full" style={{ background: role.accent }} />
                              <span className="whitespace-nowrap text-[10px] text-ink-2">{role.short}</span>
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="font-mono text-[8.5px] uppercase tracking-[0.08em] text-faint">
                              {user.ministryId ? user.ministryId.toUpperCase() : role.scope === "nation" ? "Federal" : "MoPA"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            {user.mfa ? (
                              <Badge tone="success" size="xs">
                                <ShieldCheck size={8} /> on
                              </Badge>
                            ) : (
                              <Badge tone="warning" size="xs">
                                off
                              </Badge>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2.5">
                            <p className="text-[10px] text-ink-2">{relativeTime(user.lastActive)}</p>
                            <p className="font-mono text-[8.5px] text-faint">{formatDate(user.lastActive)}</p>
                          </td>
                          <td className="px-3 py-2.5">
                            <Badge
                              tone={user.status === "active" ? "success" : user.status === "invited" ? "info" : "neutral"}
                              size="xs"
                              dot
                            >
                              {user.status}
                            </Badge>
                          </td>
                          <td className="px-2 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  toast({
                                    title: "Password reset link sent",
                                    description: `${user.email} · expires in 30 minutes.`,
                                    tone: "success",
                                  })
                                }
                                className="grid h-6 w-6 place-items-center rounded text-faint opacity-0 transition-opacity hover:bg-surface-3 hover:text-ink group-hover:opacity-100"
                                aria-label={`Reset password for ${user.name}`}
                              >
                                <KeyRound size={11} />
                              </button>
                              <button
                                onClick={() => switchRole(user.role)}
                                className="grid h-6 w-6 place-items-center rounded text-faint opacity-0 transition-opacity hover:bg-surface-3 hover:text-ink group-hover:opacity-100"
                                aria-label={`Preview as ${user.name}`}
                              >
                                <UserCheck size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {tab === "matrix" && (
        <Card className="overflow-hidden">
          <CardHeader
            eyebrow="RBAC"
            title="Permission matrix"
            subtitle="Derived from BRD §13 — each role carries a fixed capability set."
            actions={<Badge tone="neutral">{ROLE_ORDER.length} roles</Badge>}
          />
          <div className="scroll-thin overflow-x-auto">
            <table className="w-full min-w-[880px] text-left">
              <thead className="bg-surface-2">
                <tr className="border-y border-line">
                  <th className="sticky left-0 z-10 bg-surface-2 px-3 py-2 text-[9px] font-medium uppercase tracking-[0.1em] text-faint">
                    Capability
                  </th>
                  {ROLE_ORDER.map((r) => (
                    <th key={r} className="whitespace-nowrap px-2 py-2 text-center">
                      <span className="flex flex-col items-center gap-1">
                        <span className="grid h-5 w-5 place-items-center rounded-md text-[8px] font-semibold" style={{ background: `color-mix(in oklab, ${ROLES[r].accent} 15%, transparent)`, color: ROLES[r].accent }}>
                          {ROLES[r].short.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="text-[8.5px] font-medium text-ink-2">{ROLES[r].short}</span>
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_GROUPS.map((group) => (
                  <React.Fragment key={group.label}>
                    <tr className="bg-surface-3/50">
                      <td colSpan={ROLE_ORDER.length + 1} className="px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.14em] text-faint">
                        {group.label}
                      </td>
                    </tr>
                    {group.permissions.map((p) => (
                      <tr key={p} className="border-b border-line last:border-0">
                        <td className="sticky left-0 z-10 whitespace-nowrap bg-surface px-3 py-1.5 text-[10px] text-ink-2">
                          {permissionLabel(p)}
                        </td>
                        {ROLE_ORDER.map((r) => (
                          <td key={r} className="px-2 py-1.5 text-center">
                            {ROLES[r].permissions.includes(p) ? (
                              <Check size={11} className="mx-auto text-success" strokeWidth={2.6} />
                            ) : (
                              <Minus size={10} className="mx-auto text-line-strong" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface-2 px-4 py-2.5">
            <Info size={11} className="text-faint" />
            <p className="text-[9.5px] text-muted">
              PMO is read-only by design — no create, edit or delete route exists for that role at the API
              layer.
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { icon: Lock, title: "Least privilege", text: "Accounts are provisioned with the narrowest role that satisfies the task." },
          { icon: KeyRound, title: "MFA for sensitive roles", text: "Admin, Secretary and Data Manager accounts require OTP at every sign-in." },
          { icon: CircleSlash, title: "Immediate revocation", text: "Disabling an account invalidates every active session on the next request." },
        ].map((c) => (
          <Card key={c.title} className="p-3.5">
            <c.icon size={15} className="text-brand" />
            <p className="mt-2 text-[11.5px] font-semibold text-ink">{c.title}</p>
            <p className="mt-0.5 text-[9.5px] leading-[1.6] text-muted">{c.text}</p>
          </Card>
        ))}
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={(name) => {
        toast({ title: "Invitation sent", description: `${name} · role assigned and MFA enrolment required at first sign-in.`, tone: "success" });
        setInviteOpen(false);
      }} />
    </div>
  );
}

function InviteModal({ open, onClose, onInvite }: { open: boolean; onClose: () => void; onInvite: (name: string) => void }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<RoleId>("data-manager");
  const [mfa, setMfa] = React.useState(true);

  const roleDef = ROLES[role];

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Access control"
      title="Invite a user"
      description="The invitee receives a single-use link and must enrol in MFA before first access."
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onInvite(name || email)}
            disabled={!name || !email.includes("@")}
          >
            <Mail size={12} /> Send invitation
          </Button>
        </>
      }
    >
      <div className="space-y-3.5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sadia Rehman" className="field h-10 text-[12px]" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Official email</span>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@mopa.gov.pk" className="field h-10 text-[12px]" />
          </label>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-[11px] font-medium text-ink-2">Role</span>
          <Select value={role} onChange={(e) => setRole(e.target.value as RoleId)} className="h-10 text-[12px]">
            {ROLE_ORDER.map((r) => (
              <option key={r} value={r}>
                {ROLES[r].name}
              </option>
            ))}
          </Select>
        </label>

        <div className="rounded-[10px] border border-line bg-surface-2 p-3">
          <p className="text-[10px] font-semibold text-ink">{roleDef.name}</p>
          <p className="mt-0.5 text-[9.5px] leading-[1.6] text-muted">{roleDef.description}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {roleDef.permissions.slice(0, 6).map((p) => (
              <span key={p} className="rounded border border-line bg-surface px-1.5 py-px text-[8px] text-muted">
                {permissionLabel(p)}
              </span>
            ))}
            {roleDef.permissions.length > 6 && (
              <span className="rounded border border-line bg-surface px-1.5 py-px text-[8px] text-faint">
                +{roleDef.permissions.length - 6}
              </span>
            )}
          </div>
        </div>

        <div className="rounded-[10px] border border-line p-3">
          <Switch
            checked={mfa}
            onChange={setMfa}
            label="Require MFA enrolment"
            description="Recommended for every role with write access."
          />
        </div>

        <p className="flex items-start gap-1.5 text-[9px] leading-[1.6] text-faint">
          <Info size={10} className="mt-0.5 shrink-0" />
          Accounts are created disabled until the invitee completes enrolment. The invitation expires in
          72 hours.
        </p>
      </div>
    </Modal>
  );
}

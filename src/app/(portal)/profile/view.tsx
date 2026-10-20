"use client";

import * as React from "react";
import Link from "next/link";
import { cn, formatDate, relativeTime } from "@/lib/format";
import { useStore } from "@/lib/store";
import { AUDIT } from "@/lib/data";
import { PERMISSION_GROUPS, ROLES, ROLE_ORDER, permissionLabel } from "@/lib/roles";
import { ActivityBars } from "@/components/charts";
import { USER_ACTIVITY } from "@/lib/data";
import { Avatar, Badge, Button, Card, CardHeader, Divider, Segmented, Switch, StatusDot } from "@/components/ui/primitives";
import {
  ArrowRight,
  Check,
  Clock3,
  Fingerprint,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  ShieldCheck,
  Smartphone,
  UserRound,
} from "lucide-react";

export function ProfileView() {
  const { session, switchRole, signOut, toast } = useStore();
  const [mfa, setMfa] = React.useState(true);
  const [alertsEmail, setAlertsEmail] = React.useState(true);
  const role = session.role;
  const user = session.user;
  const activity = AUDIT.filter((a) => a.actor === user.name).slice(0, 5);

  return (
    <div className="space-y-4">
      <div>
        <p className="eyebrow mb-2">Account</p>
        <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
          My profile
        </h1>
        <p className="mt-1.5 max-w-2xl text-[12.5px] leading-5 text-muted">
          Your identity, role permissions and the actions recorded against your account.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-4">
          <Card className="texture relative overflow-hidden p-5 text-center">
            <div className="pointer-events-none absolute -top-16 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--brand-soft),transparent_70%)]" />
            <div className="relative">
              <span className="relative mx-auto inline-block">
                <Avatar name={user.name} initials={user.initials} size={64} tone="brand" className="mx-auto text-[20px]" />
                <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-surface bg-success text-white">
                  <Check size={10} strokeWidth={3} />
                </span>
              </span>
              <h2 className="mt-3 text-[16px] font-semibold tracking-[-0.02em] text-ink">{user.name}</h2>
              <p className="mt-0.5 text-[11px] text-muted">{role.name}</p>
              <div className="mt-2 flex flex-wrap justify-center gap-1.5">
                <Badge tone="brand" dot>
                  Active
                </Badge>
                <Badge tone={user.mfa ? "success" : "warning"}>{user.mfa ? "MFA enrolled" : "MFA pending"}</Badge>
              </div>

              <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-left">
                {[
                  { icon: Mail, value: user.email },
                  { icon: UserRound, value: role.org },
                  { icon: MapPin, value: "Islamabad, Pakistan" },
                  { icon: Clock3, value: `Last active ${relativeTime(user.lastActive)}` },
                ].map((row) => (
                  <p key={row.value} className="flex items-center gap-2 text-[10px] text-muted">
                    <row.icon size={11} className="shrink-0 text-faint" /> <span className="truncate">{row.value}</span>
                  </p>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="secondary" className="flex-1" onClick={() => toast({ title: "Profile saved", description: "Your display details were updated.", tone: "success" })}>
                  Edit profile
                </Button>
                <Button size="sm" variant="ghost" onClick={() => signOut("Signed out from your profile.")}>
                  <LogOut size={12} /> Sign out
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <p className="eyebrow">Security</p>
            <div className="mt-3 space-y-3">
              <Switch checked={mfa} onChange={setMfa} label="Two-factor authentication" description="OTP to your registered device at each sign-in." />
              <Divider />
              <Switch checked={alertsEmail} onChange={setAlertsEmail} label="Email notifications" description="Deadline and milestone alerts to your inbox." />
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-[9px] border border-line bg-surface-2 px-2.5 py-2">
              <Smartphone size={12} className="text-faint" />
              <span className="text-[9.5px] text-muted">Registered device · +92 ••• ••• 41</span>
              <Badge tone="success" size="xs" className="ml-auto">
                2FA
              </Badge>
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-[9px] border border-line bg-surface-2 px-2.5 py-2">
              <Fingerprint size={12} className="text-faint" />
              <span className="text-[9.5px] text-muted">Passkey · enrolled {formatDate(user.joinedAt)}</span>
              <Badge tone="neutral" size="xs" className="ml-auto">
                backup
              </Badge>
            </div>
          </Card>
        </div>

        <div className="space-y-4 lg:col-span-8">
          <Card className="overflow-hidden">
            <CardHeader
              eyebrow="Role"
              title={role.name}
              subtitle={role.description}
              actions={<Badge tone="neutral">{role.brdRef}</Badge>}
            />
            <div className="grid gap-2 p-4 sm:grid-cols-2">
              {PERMISSION_GROUPS.map((group) => {
                const granted = group.permissions.filter((p) => role.permissions.includes(p));
                return (
                  <div key={group.label} className="rounded-[10px] border border-line bg-surface-2 p-2.5">
                    <p className="font-mono text-[8px] uppercase tracking-[0.13em] text-faint">{group.label}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {group.permissions.map((p) => {
                        const has = role.permissions.includes(p);
                        return (
                          <span
                            key={p}
                            className={cn(
                              "inline-flex items-center gap-1 rounded px-1.5 py-px text-[9px]",
                              has ? "bg-brand-soft text-brand-ink" : "bg-surface-3 text-faint line-through opacity-70",
                            )}
                          >
                            {has && <Check size={8} />}
                            {permissionLabel(p)}
                          </span>
                        );
                      })}
                    </div>
                    <p className="mt-1.5 text-[8px] text-faint">
                      {granted.length} of {group.permissions.length} granted
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-line bg-surface-2 p-3.5">
              <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.13em] text-faint">Preview another role</p>
              <Segmented
                options={ROLE_ORDER.slice(0, 4).map((r) => ({ value: r, label: ROLES[r].short }))}
                value={role.id}
                onChange={(v) => switchRole(v)}
              />
              <p className="mt-2 flex items-center gap-1.5 text-[9px] text-faint">
                <ShieldCheck size={10} /> Role switching is available in this demonstration build only.
              </p>
            </div>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader eyebrow="Activity" title="Recent actions" subtitle="Recorded against your account." />
              <div className="divide-y divide-line">
                {activity.length === 0 && (
                  <p className="px-4 py-6 text-center text-[10.5px] text-muted">No recorded actions yet.</p>
                )}
                {activity.map((entry) => (
                  <div key={entry.id} className="flex items-center gap-2 px-4 py-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-medium text-ink">{entry.action}</p>
                      <p className="truncate font-mono text-[8.5px] text-faint">{entry.entityId}</p>
                    </div>
                    <span className="shrink-0 font-mono text-[8px] text-faint">{relativeTime(entry.at)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-line px-4 py-2">
                <Link href="/audit" className="flex items-center gap-1 text-[9.5px] font-medium text-brand hover:underline">
                  Full audit trail <ArrowRight size={10} />
                </Link>
              </div>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader eyebrow="Usage" title="Your week" subtitle="Sign-ins and record updates." />
              <div className="h-[140px] px-1 pt-3">
                <ActivityBars data={USER_ACTIVITY} />
              </div>
              <div className="flex items-center justify-between border-t border-line px-4 py-2">
                <span className="flex items-center gap-1.5 text-[9px] text-muted">
                  <StatusDot tone="success" /> Session healthy
                </span>
                <span className="font-mono text-[8.5px] text-faint">timeout 15m</span>
              </div>
            </Card>
          </div>

          <Card className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-[9px] bg-brand-soft text-brand">
                  <KeyRound size={14} />
                </span>
                <div>
                  <p className="text-[11.5px] font-semibold text-ink">Password & sessions</p>
                  <p className="mt-0.5 text-[9.5px] text-muted">
                    Last changed 42 days ago · one active session on this device.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => toast({ title: "Reset email sent", description: "Follow the link in your inbox to choose a new password.", tone: "success" })}>
                  Change password
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toast({ title: "Other sessions revoked", description: "Only this device remains signed in.", tone: "success" })}>
                  Revoke others
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

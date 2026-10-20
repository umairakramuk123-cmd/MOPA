"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { cn, formatDateTime, SYSTEM_DATE } from "@/lib/format";
import { ROLES } from "@/lib/roles";
import { SESSION_COOKIE } from "@/lib/session";
import type { RoleId } from "@/lib/types";
import { Logo } from "@/components/ui/primitives";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
  Timer,
} from "lucide-react";

const ROTATING = [
  "Tracking every Bill from registration to Gazette.",
  "Monitoring the 60-day Senate committee window.",
  "Escalating the 90-day constitutional limit.",
  "Recording Ministry stances on Article 74.",
];

const FLOATING_STATS = [
  { label: "Active bills", value: "54", sub: "across 3 workflows", accent: "text-[#8ff0cc]" },
  { label: "Committee clocks", value: "11", sub: "3 require escalation", accent: "text-[#f0d79a]" },
  { label: "Assent awaited", value: "04", sub: "President's decision", accent: "text-[#a8c8f0]" },
];

export function LoginClient() {
  const router = useRouter();
  const params = useSearchParams();
  const reason = params.get("reason");

  const [step, setStep] = React.useState<"credentials" | "otp" | "success">("credentials");
  const [role, setRole] = React.useState<RoleId>("super-admin");
  const [email, setEmail] = React.useState("hamza.sheikh@mopa.gov.pk");
  const [password, setPassword] = React.useState("Parliament@2026");
  const [showPassword, setShowPassword] = React.useState(false);
  const [remember, setRemember] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [otp, setOtp] = React.useState<string[]>(Array(6).fill(""));
  const [rolePickerOpen, setRolePickerOpen] = React.useState(false);
  const [phrase, setPhrase] = React.useState(0);
  const [resendIn, setResendIn] = React.useState(0);
  const otpRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const roleMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!rolePickerOpen) return;
    const onDown = (e: MouseEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(e.target as Node)) {
        setRolePickerOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setRolePickerOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [rolePickerOpen]);

  React.useEffect(() => {
    const t = window.setInterval(() => setPhrase((p) => (p + 1) % ROTATING.length), 3800);
    return () => window.clearInterval(t);
  }, []);

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const t = window.setTimeout(() => setResendIn((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [resendIn]);

  const activeRole = ROLES[role];

  const pickRole = (id: RoleId) => {
    setRole(id);
    const map: Record<RoleId, string> = {
      "super-admin": "hamza.sheikh@mopa.gov.pk",
      "data-manager": "ali.hassan@mopa.gov.pk",
      secretary: "awais.hussain@mopa.gov.pk",
      ministry: "s.bhatti@finance.gov.pk",
      "law-justice": "nida.fatima@law.gov.pk",
      pmo: "kamran.aslam@pmo.gov.pk",
      secretariat: "farah.nadeem@na.gov.pk",
    };
    setEmail(map[id]);
    setRolePickerOpen(false);
    setError(null);
  };

  const submitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid official email address.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setStep("otp");
      setResendIn(28);
      window.setTimeout(() => otpRefs.current[0]?.focus(), 320);
    }, 950);
  };

  const setDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    setError(null);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const onOtpKey = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const onOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = Array(6).fill("");
    text.split("").forEach((c, i) => (next[i] = c));
    setOtp(next);
    otpRefs.current[Math.min(5, text.length)]?.focus();
  };

  const verify = (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = otp.join("");
    if (code.length < 6) {
      setError("Enter all six digits of your verification code.");
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setStep("success");
      document.cookie = `${SESSION_COOKIE}=${role}; path=/; max-age=28800; samesite=lax`;
      window.setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 900);
    }, 1100);
  };

  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[1.08fr_1fr] xl:grid-cols-[1.12fr_1fr]">
      {/* ---------------------------- Brand panel ---------------------------- */}
      <div className="relative hidden overflow-hidden bg-[#04110d] lg:block">
        {/* aurora */}
        <div className="absolute inset-0">
          <div className="animate-aurora absolute -left-[10%] top-[-14%] h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(15,138,102,0.42),transparent_62%)] blur-[60px]" />
          <div className="animate-aurora-2 absolute -bottom-[22%] right-[-12%] h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(169,130,47,0.26),transparent_65%)] blur-[70px]" />
          <div className="animate-aurora absolute left-[38%] top-[34%] h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(52,104,143,0.28),transparent_68%)] blur-[60px]" />
        </div>
        <div className="login-grid absolute inset-0 opacity-70" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,17,13,0.2)_0%,rgba(4,17,13,0.55)_62%,rgba(4,17,13,0.92)_100%)]" />

        <div className="relative flex h-full min-h-[640px] flex-col justify-between p-9 xl:p-12">
          {/* header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Logo size={40} tone="inverse" />
              <div>
                <p className="text-[17px] font-semibold tracking-[-0.03em] text-[#f2f7f4]">
                  Ministry of Parliamentary Affairs
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-[#9fb2a9]">
                  Legislative Monitoring Dashboard
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-[#3dd3a1] opacity-60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-[#3dd3a1]" />
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#b9cbc3]">
                Secure session
              </span>
            </span>
          </motion.div>

          {/* centre */}
          <div className="relative max-w-[36rem]">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.7 }}
              className="mb-5 flex items-center gap-2 font-mono text-[9.5px] uppercase tracking-[0.28em] text-[#8ff0cc]"
            >
              <Sparkles size={12} /> Parliament · Islamabad · 2026
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="text-[44px] font-semibold leading-[1.02] tracking-[-0.045em] text-[#f4f8f5] xl:text-[54px]"
            >
              Every Bill.
              <br />
              <span className="text-[#8ff0cc]">Every stage.</span>
              <br />
              <span className="font-serif font-normal tracking-[-0.01em] text-[#e9e2cf]">
                One record of truth.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.8 }}
              className="mt-5 max-w-[30rem] text-[13.5px] leading-[1.7] text-[#b6c9c0]"
            >
              Official Bills, Private Members&apos; Bills and Joint Sitting cases — tracked from
              pre-introduction to Gazette notification, with an immutable audit trail behind every
              decision.
            </motion.p>

            {/* rotating line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-7 flex h-6 items-center gap-2 overflow-hidden"
            >
              <span className="h-1 w-1 shrink-0 rounded-full bg-[#3dd3a1]" />
              <AnimatePresence mode="wait">
                <motion.p
                  key={phrase}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.45 }}
                  className="truncate font-mono text-[10.5px] tracking-[0.02em] text-[#8ba79c]"
                >
                  {ROTATING[phrase]}
                </motion.p>
              </AnimatePresence>
            </motion.div>

            {/* floating stats */}
            <div className="mt-9 grid grid-cols-3 gap-2.5">
              {FLOATING_STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + i * 0.09, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "rounded-[13px] border border-white/[0.09] bg-white/[0.035] p-3 backdrop-blur-md",
                    i === 1 && "lg:animate-float",
                  )}
                  style={{ animationDelay: `${i * 0.6}s` }}
                >
                  <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[#7f9a8f]">
                    {stat.label}
                  </p>
                  <p className={cn("num mt-1.5 text-[22px] font-semibold tracking-[-0.05em]", stat.accent)}>
                    {stat.value}
                  </p>
                  <p className="mt-0.5 truncate text-[9px] text-[#8ba79c]">{stat.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-5"
          >
            <div className="flex items-center gap-4">
              {[
                { icon: ShieldCheck, label: "RBAC enforced at API" },
                { icon: LockKeyhole, label: "TLS 1.3 encrypted" },
                { icon: Timer, label: "15-min auto-logout" },
              ].map((b) => (
                <span key={b.label} className="flex items-center gap-1.5 text-[9.5px] text-[#8ba79c]">
                  <b.icon size={11} className="text-[#5f8a7b]" /> {b.label}
                </span>
              ))}
            </div>
            <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-[#5f7a6f]">
              NITB · v1.2.0
            </span>
          </motion.div>
        </div>
      </div>

      {/* ----------------------------- Form panel --------------------------- */}
      <div className="relative flex min-h-dvh flex-col bg-canvas">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_center,var(--brand-soft),transparent_65%)]" />
          <div className="absolute -bottom-32 -left-20 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle_at_center,var(--gold-soft),transparent_70%)] opacity-70" />
        </div>

        {/* mobile brand */}
        <div className="relative flex items-center justify-between px-5 pt-5 lg:hidden">
          <div className="flex items-center gap-2.5">
            <Logo size={34} />
            <div>
              <p className="text-[14px] font-semibold tracking-[-0.03em] text-ink">MOPA</p>
              <p className="text-[9px] text-muted">Legislative Monitoring</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-line bg-surface px-2 py-1">
            <ShieldCheck size={11} className="text-brand" />
            <span className="font-mono text-[8.5px] uppercase tracking-[0.12em] text-muted">Secure</span>
          </span>
        </div>

        <div className="relative flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-[404px]">
            <AnimatePresence mode="wait">
              {step === "credentials" && (
                <motion.div
                  key="credentials"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mb-7">
                    <p className="eyebrow mb-2.5">Government of Pakistan</p>
                    <h2 className="text-[27px] font-semibold leading-[1.12] tracking-[-0.04em] text-ink sm:text-[31px]">
                      Sign in to the portal
                    </h2>
                    <p className="mt-2 text-[12.5px] leading-5 text-muted">
                      Authorised users only. Every sign-in attempt is recorded against your
                      credentials.
                    </p>
                  </div>

                  {reason && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mb-4 flex items-start gap-2 rounded-[11px] border border-warning/25 bg-warning-soft p-2.5"
                    >
                      <AlertCircle size={14} className="mt-0.5 shrink-0 text-warning" />
                      <p className="text-[10.5px] leading-[1.5] text-warning">{reason}</p>
                    </motion.div>
                  )}

                  <form onSubmit={submitCredentials} className="space-y-3.5">
                    {/* role selector */}
                    <div className="relative" ref={roleMenuRef}>
                      <p className="mb-1.5 text-[11px] font-medium text-ink-2">Sign in as</p>
                      <button
                        type="button"
                        onClick={() => setRolePickerOpen((v) => !v)}
                        aria-expanded={rolePickerOpen}
                        className="flex w-full items-center gap-2.5 rounded-[11px] border border-line-strong bg-surface px-3 py-2.5 text-left transition-colors hover:border-brand/40"
                      >
                        <span
                          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[10px] font-semibold"
                          style={{
                            background: `color-mix(in oklab, ${activeRole.accent} 14%, transparent)`,
                            color: activeRole.accent,
                          }}
                        >
                          {activeRole.short.slice(0, 2).toUpperCase()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[12px] font-semibold text-ink">
                            {activeRole.name}
                          </span>
                          <span className="block truncate text-[9.5px] text-faint">
                            {activeRole.brdRef}
                          </span>
                        </span>
                        <ChevronDown
                          size={14}
                          className={cn("shrink-0 text-faint transition-transform", rolePickerOpen && "rotate-180")}
                        />
                      </button>

                      <AnimatePresence>
                        {rolePickerOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -6, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -6, scale: 0.98 }}
                            transition={{ duration: 0.18 }}
                            className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-[300px] overflow-y-auto rounded-[13px] border border-line bg-surface p-1.5 shadow-[var(--shadow-pop)] scroll-thin"
                          >
                            <p className="px-2 pb-1 pt-1 font-mono text-[8px] uppercase tracking-[0.16em] text-faint">
                              Roles defined in BRD §13
                            </p>
                            {Object.values(ROLES).map((r) => (
                              <button
                                key={r.id}
                                type="button"
                                onClick={() => pickRole(r.id)}
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors",
                                  r.id === role ? "bg-brand-soft" : "hover:bg-surface-2",
                                )}
                              >
                                <span
                                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                                  style={{ background: r.accent }}
                                />
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-[11px] font-medium text-ink">
                                    {r.name}
                                  </span>
                                  <span className="block truncate text-[9px] text-faint">{r.org}</span>
                                </span>
                                {r.id === role && <Check size={12} className="shrink-0 text-brand" />}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <label className="block">
                      <span className="mb-1.5 block text-[11px] font-medium text-ink-2">
                        Official email
                      </span>
                      <span className="relative block">
                        <Mail size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError(null);
                          }}
                          autoComplete="username"
                          className="field h-11 pl-9 text-[12.5px]"
                          placeholder="name@mopa.gov.pk"
                        />
                      </span>
                    </label>

                    <label className="block">
                      <span className="mb-1.5 flex items-baseline justify-between">
                        <span className="text-[11px] font-medium text-ink-2">Password</span>
                        <button
                          type="button"
                          onClick={() => setError("Password resets are issued by the Super Admin. Contact the MoPA IT focal person.")}
                          className="text-[10px] font-medium text-brand hover:underline"
                        >
                          Forgot password?
                        </button>
                      </span>
                      <span className="relative block">
                        <LockKeyhole size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError(null);
                          }}
                          autoComplete="current-password"
                          className="field h-11 pl-9 pr-9 text-[12.5px]"
                          placeholder="••••••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-faint hover:text-ink"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </span>
                    </label>

                    <div className="flex items-center justify-between pt-0.5">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={remember}
                          onChange={(e) => setRemember(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border-line-strong accent-[var(--brand)]"
                        />
                        <span className="text-[10.5px] text-muted">Remember this device</span>
                      </label>
                      <span className="flex items-center gap-1 font-mono text-[9px] text-faint">
                        <KeyRound size={9} /> 2FA enforced
                      </span>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <p className="flex items-start gap-1.5 rounded-lg border border-danger/20 bg-danger-soft px-2.5 py-2 text-[10.5px] leading-[1.5] text-danger">
                            <AlertCircle size={12} className="mt-px shrink-0" /> {error}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <button
                      type="submit"
                      disabled={loading}
                      className="pressable group relative mt-1 flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-[11px] bg-brand text-[13px] font-semibold text-white shadow-[0_10px_24px_-14px_var(--brand)] transition-colors hover:bg-brand-strong disabled:opacity-70 dark:text-[#04140f]"
                    >
                      <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)] transition-transform duration-700 group-hover:translate-x-full" />
                      {loading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" /> Verifying credentials…
                        </>
                      ) : (
                        <>
                          Continue securely
                          <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 flex items-center gap-3">
                    <span className="h-px flex-1 bg-line" />
                    <span className="font-mono text-[8.5px] uppercase tracking-[0.16em] text-faint">
                      Protected environment
                    </span>
                    <span className="h-px flex-1 bg-line" />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {[
                      { icon: ShieldCheck, label: "Role-based access" },
                      { icon: Fingerprint, label: "OTP two-factor" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-1.5 rounded-lg border border-line bg-surface/70 px-2.5 py-2"
                      >
                        <item.icon size={12} className="shrink-0 text-brand" />
                        <span className="truncate text-[9.5px] font-medium text-muted">{item.label}</span>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 text-center text-[9px] leading-[1.7] text-faint">
                    By continuing you accept the Government of Pakistan IT and cybersecurity
                    policy. Unauthorised access is an offence under the Prevention of Electronic
                    Crimes Act.
                  </p>
                </motion.div>
              )}

              {step === "otp" && (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <button
                    onClick={() => {
                      setStep("credentials");
                      setOtp(Array(6).fill(""));
                      setError(null);
                    }}
                    className="mb-6 inline-flex items-center gap-1.5 text-[10.5px] font-medium text-muted transition-colors hover:text-ink"
                  >
                    <ArrowLeft size={12} /> Back to credentials
                  </button>

                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.08, type: "spring", stiffness: 220, damping: 18 }}
                    className="mb-5 grid h-11 w-11 place-items-center rounded-[13px] border border-brand/20 bg-brand-soft text-brand"
                  >
                    <ShieldCheck size={20} />
                  </motion.div>

                  <p className="eyebrow mb-2.5">Step 2 of 2 · Verification</p>
                  <h2 className="text-[27px] font-semibold leading-[1.12] tracking-[-0.04em] text-ink sm:text-[30px]">
                    Enter your access code
                  </h2>
                  <p className="mt-2 text-[12.5px] leading-5 text-muted">
                    A six-digit code was sent to your registered device for{" "}
                    <span className="font-medium text-ink">{email}</span>.
                  </p>

                  <form onSubmit={verify} className="mt-6">
                    <div className="flex items-center justify-between gap-2" onPaste={onOtpPaste}>
                      {otp.map((digit, i) => (
                        <motion.input
                          key={i}
                          ref={(el) => {
                            otpRefs.current[i] = el;
                          }}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 + i * 0.045 }}
                          value={digit}
                          onChange={(e) => setDigit(i, e.target.value)}
                          onKeyDown={(e) => onOtpKey(i, e)}
                          inputMode="numeric"
                          maxLength={1}
                          aria-label={`Digit ${i + 1}`}
                          className={cn(
                            "num h-[52px] w-full rounded-[11px] border bg-surface text-center text-[19px] font-semibold text-ink outline-none transition-all duration-200",
                            digit
                              ? "border-brand shadow-[0_0_0_3px_var(--ring)]"
                              : "border-line-strong",
                            "focus:border-brand focus:shadow-[0_0_0_3px_var(--ring)]",
                          )}
                        />
                      ))}
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-2.5 flex items-center gap-1.5 text-[10.5px] text-danger"
                        >
                          <AlertCircle size={12} /> {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <p className="mt-3 flex items-center justify-between text-[10px] text-muted">
                      <span className="flex items-center gap-1.5">
                        <Timer size={10} /> {resendIn > 0 ? `Code expires in ${resendIn}s` : "Code expired"}
                      </span>
                      <button
                        type="button"
                        disabled={resendIn > 0}
                        onClick={() => {
                          setResendIn(30);
                          setOtp(Array(6).fill(""));
                          setError(null);
                          otpRefs.current[0]?.focus();
                        }}
                        className="font-medium text-brand hover:underline disabled:text-faint disabled:no-underline"
                      >
                        Resend code
                      </button>
                    </p>

                    <div className="mt-3 rounded-[10px] border border-dashed border-line-strong bg-surface-2 px-3 py-2">
                      <p className="text-[9.5px] leading-[1.6] text-muted">
                        <span className="font-medium text-ink">Demonstration build:</span> enter any
                        six digits to continue. In production this step is replaced by the NITB OTP
                        gateway and bound to the user&apos;s registered device.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="pressable mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-[11px] bg-brand text-[13px] font-semibold text-white transition-colors hover:bg-brand-strong disabled:opacity-70 dark:text-[#04140f]"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" /> Verifying…
                        </>
                      ) : (
                        <>
                          Verify & enter portal <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 flex items-center gap-2.5 rounded-[11px] border border-line bg-surface/60 p-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-surface-3 text-[9px] font-semibold text-muted">
                      {activeRole.short.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[10.5px] font-medium text-ink">{activeRole.name}</p>
                      <p className="truncate text-[9px] text-faint">
                        {activeRole.permissions.length} permissions · {activeRole.brdRef}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === "success" && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center text-center"
                >
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 16 }}
                    className="relative grid h-16 w-16 place-items-center rounded-full bg-brand-soft"
                  >
                    <span className="absolute inset-0 animate-ping rounded-full bg-brand/15" />
                    <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                      <motion.path
                        d="M8 17.5 14 23.5 26.5 11"
                        stroke="var(--brand)"
                        strokeWidth="2.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
                      />
                    </svg>
                  </motion.div>
                  <h2 className="mt-5 text-[25px] font-semibold tracking-[-0.04em] text-ink">
                    Access granted
                  </h2>
                  <p className="mt-1.5 max-w-[28ch] text-[12px] leading-5 text-muted">
                    Loading your {activeRole.short} workspace and the live legislative registry…
                  </p>
                  <div className="mt-6 w-full max-w-[240px] overflow-hidden rounded-full bg-surface-3">
                    <motion.div
                      initial={{ width: "8%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 1.05, ease: "easeInOut" }}
                      className="h-1 rounded-full bg-brand"
                    />
                  </div>
                  <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-faint">
                    {formatDateTime(SYSTEM_DATE)} · Islamabad
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="relative px-5 pb-5 text-center lg:px-8">
          <p className="text-[9px] text-faint">
            © 2026 Ministry of Parliamentary Affairs · Implemented by NITB · H-9/1, Islamabad
          </p>
        </div>
      </div>
    </div>
  );
}

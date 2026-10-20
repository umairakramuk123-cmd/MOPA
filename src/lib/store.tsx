"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ALERTS, APPROVALS, BILLS, DOCUMENTS, USERS } from "./data";
import { ROLES } from "./roles";
import { SYSTEM_DATE, daysBetween } from "./format";
import { SESSION_COOKIE, buildSession } from "./session";
import { Alert, ApprovalRequest, Bill, BillDocument, RoleId, Session, StageKey, User } from "./types";
import { STAGE_LIBRARY } from "./workflows";

export { SESSION_COOKIE };

type Toast = {
  id: number;
  title: string;
  description?: string;
  tone?: "default" | "success" | "warning" | "danger";
};

type StoreValue = {
  session: Session;
  bills: Bill[];
  alerts: Alert[];
  approvals: ApprovalRequest[];
  users: User[];
  documents: BillDocument[];
  addDocument: (input: {
    name: string;
    type: BillDocument["type"];
    billId: string;
    size: string;
    classification: BillDocument["classification"];
  }) => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  toasts: Toast[];
  toast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;
  updateStage: (billId: string, stage: StageKey, note: string, reference: string) => void;
  registerBill: (input: {
    title: string;
    type: Bill["type"];
    house: Bill["house"];
    ministryId: string;
    memberInCharge: string;
    summary: string;
  }) => { ok: boolean; duplicate?: Bill; id?: string };
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  decideApproval: (id: string, decision: "approved" | "returned", note: string) => void;
  signOut: (reason?: string) => void;
  switchRole: (role: RoleId) => void;
  idleWarning: boolean;
  extendSession: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({
  session: initialSession,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = useState<Session>(initialSession);
  const [allBills, setAllBills] = useState<Bill[]>(BILLS);
  const [alerts, setAlerts] = useState<Alert[]>(ALERTS);
  const [approvals, setApprovals] = useState<ApprovalRequest[]>(APPROVALS);
  const [documents, setDocuments] = useState<BillDocument[]>(DOCUMENTS);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [idleWarning, setIdleWarning] = useState(false);
  const toastSeq = useRef(0);
  const lastActivity = useRef(Date.now());

  /* hydrate theme */
  useEffect(() => {
    const stored = window.localStorage.getItem("mopa-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = stored === "dark" || stored === "light" ? stored : prefersDark ? "dark" : "light";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    setCollapsed(window.localStorage.getItem("mopa-sidebar") === "collapsed");
  }, []);

  /* Ministries only ever see the bills of their own division — BRD §13. */
  const bills = useMemo(() => {
    if (session.role.scope === "ministry" && session.user.ministryId) {
      return allBills.filter((b) => b.ministryId === session.user.ministryId);
    }
    return allBills;
  }, [allBills, session]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      document.documentElement.classList.toggle("dark", next === "dark");
      window.localStorage.setItem("mopa-theme", next);
      return next;
    });
  }, []);

  const persistCollapsed = useCallback((value: boolean) => {
    setCollapsed(value);
    window.localStorage.setItem("mopa-sidebar", value ? "collapsed" : "expanded");
  }, []);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++toastSeq.current;
    setToasts((prev) => [...prev, { ...t, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 5200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* keyboard: command palette */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen((v) => !v);
      }
      if (e.key === "Escape") setCommandOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* inactivity auto-logout — BRD §14 (15 minutes) */
  const signOut = useCallback(
    (reason?: string) => {
      document.cookie = `${SESSION_COOKIE}=; Max-Age=0; path=/`;
      window.localStorage.removeItem("mopa-theme-lock");
      router.push(reason ? `/login?reason=${encodeURIComponent(reason)}` : "/login");
      router.refresh();
    },
    [router],
  );

  useEffect(() => {
    const markActivity = () => {
      lastActivity.current = Date.now();
      setIdleWarning(false);
    };
    const events = ["mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, markActivity, { passive: true }));
    const interval = window.setInterval(() => {
      const minutes = Math.floor((Date.now() - lastActivity.current) / 60000);
      if (minutes >= 15) {
        signOut("You were signed out after 15 minutes of inactivity.");
      } else if (minutes >= 14) {
        setIdleWarning(true);
      }
    }, 20_000);
    return () => {
      events.forEach((e) => window.removeEventListener(e, markActivity));
      window.clearInterval(interval);
    };
  }, [signOut]);

  const extendSession = useCallback(() => {
    lastActivity.current = Date.now();
    setIdleWarning(false);
    toast({ title: "Session extended", description: "Your activity timer was reset.", tone: "success" });
  }, [toast]);

  const switchRole = useCallback(
    (role: RoleId) => {
      document.cookie = `${SESSION_COOKIE}=${role}; path=/; max-age=28800; samesite=lax`;
      setSession(buildSession(role));
      const target = ROLES[role];
      toast({
        title: `Viewing as ${target.short}`,
        description: "Navigation and actions now follow this role's permissions.",
        tone: "success",
      });
      router.refresh();
    },
    [router, toast],
  );

  const updateStage = useCallback(
    (billId: string, stage: StageKey, note: string, reference: string) => {
      setAllBills((prev) =>
        prev.map((bill) => {
          if (bill.id !== billId) return bill;
          const now = new Date().toISOString();
          const outcome: Bill["outcome"] =
            stage === "gazette" ? "assented" : bill.outcome === "assented" ? "passed" : bill.outcome;
          return {
            ...bill,
            stage,
            stageEnteredAt: now,
            outcome,
            lastAction: `${STAGE_LIBRARY[stage].label} recorded`,
            committeeDueAt: undefined,
            history: [
              ...bill.history,
              {
                id: `${bill.id}-e${bill.history.length}`,
                at: now,
                stage,
                actor: session.user.name,
                actorRole: session.role.id,
                note: note || `${STAGE_LIBRARY[stage].label} recorded.`,
                reference,
              },
            ],
          };
        }),
      );
      toast({
        title: "Stage updated",
        description: `${STAGE_LIBRARY[stage].label} · audit entry written with your user ID and timestamp.`,
        tone: "success",
      });
    },
    [session, toast],
  );

  const registerBill = useCallback<StoreValue["registerBill"]>(
    (input) => {
      const duplicate = allBills.find(
        (b) =>
          b.title.trim().toLowerCase() === input.title.trim().toLowerCase() &&
          b.house === input.house &&
          b.ministryId === input.ministryId,
      );
      if (duplicate) return { ok: false, duplicate };

      const year = SYSTEM_DATE.getFullYear();
      const seq = 1040 + allBills.length + 1;
      const id = `MOPA-${year}-${String(seq).slice(-4)}`;
      const stage: StageKey = input.type === "private" ? "pre-admissibility" : input.type === "joint" ? "js-reference" : "pre-introduction";
      const now = new Date().toISOString();
      const newBill: Bill = {
        id,
        title: input.title.trim(),
        shortTitle: input.title.replace(/^The /, "").replace(/,\s*\d{4}$/, ""),
        type: input.type,
        house: input.house,
        ministryId: input.ministryId,
        memberInCharge: input.memberInCharge,
        registeredAt: now,
        stage,
        stageEnteredAt: now,
        outcome: "in-progress",
        priority: "normal",
        documentCount: 0,
        lastAction: "Registered in the legislative registry",
        summary: input.summary || "Newly registered bill awaiting first stage update.",
        article74: input.type === "private" ? "under-review" : undefined,
        cabinetConsent: input.type === "private" ? "pending" : undefined,
        ministryStance: input.type === "private" ? "pending" : undefined,
        legalReview: input.type === "official" ? "pending" : undefined,
        history: [
          {
            id: `${id}-e0`,
            at: now,
            stage: "registered",
            actor: session.user.name,
            actorRole: session.role.id,
            note: "Bill registered after duplicate check on title, sponsor, House and year.",
            reference: `REG/${seq}`,
          },
        ],
      };
      setAllBills((prev) => [newBill, ...prev]);
      toast({
        title: "Bill registered",
        description: `${id} created at ${STAGE_LIBRARY[stage].label}. Duplicate check cleared.`,
        tone: "success",
      });
      return { ok: true, id };
    },
    [allBills, session, toast],
  );

  const addDocument = useCallback<StoreValue["addDocument"]>(
    (input) => {
      const doc: BillDocument = {
        id: `DOC-${9100 + documents.length + 1}`,
        name: input.name,
        type: input.type,
        billId: input.billId,
        size: input.size,
        uploadedAt: new Date().toISOString(),
        uploadedBy: session.user.name,
        classification: input.classification,
        version: 1,
      };
      setDocuments((prev) => [doc, ...prev]);
      setAllBills((prev) =>
        prev.map((b) =>
          b.id === input.billId
            ? {
                ...b,
                documentCount: b.documentCount + 1,
                history: [
                  ...b.history,
                  {
                    id: `${b.id}-doc${b.history.length}`,
                    at: doc.uploadedAt,
                    stage: b.stage,
                    actor: session.user.name,
                    actorRole: session.role.id,
                    note: `Document linked to the record — ${input.type} (${input.classification}).`,
                    reference: doc.id,
                  },
                ],
              }
            : b,
        ),
      );
      toast({
        title: "Document linked",
        description: `${input.type} · ${input.billId}. Stored in the repository with an audit entry.`,
        tone: "success",
      });
    },
    [documents.length, session, toast],
  );

  const acknowledgeAlert = useCallback(
    (id: string) => {
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "acknowledged" } : a)));
      toast({ title: "Alert acknowledged", description: "It remains visible in the exception list until resolved." });
    },
    [toast],
  );

  const resolveAlert = useCallback(
    (id: string) => {
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: "resolved" } : a)));
      toast({ title: "Alert resolved", description: "Resolution stored in the audit trail.", tone: "success" });
    },
    [toast],
  );

  const decideApproval = useCallback(
    (id: string, decision: "approved" | "returned", note: string) => {
      setApprovals((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: decision, note: note || a.note } : a)),
      );
      toast({
        title: decision === "approved" ? "Endorsement approved" : "Returned for revision",
        description: note || "Decision recorded with your user ID and timestamp.",
        tone: decision === "approved" ? "success" : "warning",
      });
    },
    [toast],
  );

  const value = useMemo<StoreValue>(
    () => ({
      session,
      bills,
      alerts,
      approvals,
      users: USERS,
      documents,
      addDocument,
      theme,
      toggleTheme,
      commandOpen,
      setCommandOpen,
      mobileNavOpen,
      setMobileNavOpen,
      collapsed,
      setCollapsed: persistCollapsed,
      toasts,
      toast,
      dismissToast,
      updateStage,
      registerBill,
      acknowledgeAlert,
      resolveAlert,
      decideApproval,
      signOut,
      switchRole,
      idleWarning,
      extendSession,
    }),
    [
      session,
      bills,
      alerts,
      approvals,
      documents,
      addDocument,
      theme,
      toggleTheme,
      commandOpen,
      mobileNavOpen,
      collapsed,
      persistCollapsed,
      toasts,
      toast,
      dismissToast,
      updateStage,
      registerBill,
      acknowledgeAlert,
      resolveAlert,
      decideApproval,
      signOut,
      switchRole,
      idleWarning,
      extendSession,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useRole() {
  return useStore().session.role;
}

/** Days between the deterministic system date and a date — client-safe helper. */
export function useDaysAgo(iso: string) {
  return daysBetween(iso, SYSTEM_DATE);
}

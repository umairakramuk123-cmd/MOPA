"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/format";
import { useStore } from "@/lib/store";
import { SERVICES_GLOSSARY, FAQS, SHORTCUTS } from "@/lib/help-content";
import { Button, Card, CardHeader } from "@/components/ui/primitives";

import {
  BookOpen,
  ChevronDown,
  CircleHelp,
  ExternalLink,
  Info,
  Keyboard,
  Landmark,
  LifeBuoy,
  Mail,
  MessageSquare,
  Phone,
  Search as SearchIcon,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export function HelpView() {
  const { setCommandOpen, toast } = useStore();
  const [tab, setTab] = React.useState<"glossary" | "faq" | "support">("glossary");
  const [query, setQuery] = React.useState("");
  const [openFaq, setOpenFaq] = React.useState<number | null>(0);

  const glossary = SERVICES_GLOSSARY.filter((g) =>
    `${g.term} ${g.definition}`.toLowerCase().includes(query.toLowerCase()),
  );
  const faqs = FAQS.filter((f) => `${f.q} ${f.a}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow mb-2">Support</p>
          <h1 className="text-[26px] font-semibold leading-tight tracking-[-0.04em] text-ink sm:text-[30px]">
            Help &amp; glossary
          </h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-5 text-muted">
            Parliamentary terminology, how the portal behaves, and who to contact when something needs a
            human.
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={() => setCommandOpen(true)}>
          <SearchIcon size={13} /> Search the portal
        </Button>
      </div>

      <div className="relative">
        <SearchIcon size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search glossary and frequently asked questions…"
          className="field h-10 pl-9 text-[12px]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {[
          { key: "glossary", label: "Glossary", icon: BookOpen },
          { key: "faq", label: "How it works", icon: CircleHelp },
          { key: "support", label: "Support", icon: LifeBuoy },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key as typeof tab)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
              tab === t.key
                ? "border-brand bg-brand-soft text-brand-ink"
                : "border-line bg-surface text-muted hover:text-ink",
            )}
          >
            <t.icon size={11} /> {t.label}
          </button>
        ))}
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-faint">
          {tab === "faq" ? `${faqs.length} answers` : tab === "glossary" ? `${glossary.length} terms` : "3 channels"}
        </span>
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <div className="space-y-3 lg:col-span-8">
          {tab === "glossary" && (
            <Card className="overflow-hidden">
              <CardHeader
                eyebrow="BRD §17"
                title="Parliamentary glossary"
                subtitle="Terms used across the portal, defined as they appear in the Business Requirements Document."
              />
              <div className="divide-y divide-line">
                {glossary.map((g) => (
                  <div key={g.term} className="flex gap-3 px-4 py-2.5">
                    <span className="shrink-0 rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-ink-2">
                      {g.term}
                    </span>
                    <p className="text-[10.5px] leading-[1.65] text-muted">{g.definition}</p>
                  </div>
                ))}
                {glossary.length === 0 && (
                  <p className="px-4 py-8 text-center text-[11px] text-muted">No terms match “{query}”.</p>
                )}
              </div>
            </Card>
          )}

          {tab === "faq" && (
            <div className="space-y-2">
              {faqs.map((f, i) => (
                <Card key={f.q} className="overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left"
                  >
                    <span className="num shrink-0 font-mono text-[9px] text-faint">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 text-[11.5px] font-medium text-ink">{f.q}</span>
                    <ChevronDown size={13} className={cn("shrink-0 text-faint transition-transform", openFaq === i && "rotate-180")} />
                  </button>
                  {openFaq === i && (
                    <div className="animate-rise border-t border-line px-4 py-3">
                      <p className="text-[10.5px] leading-[1.75] text-muted">{f.a}</p>
                      {f.link && (
                        <Link href={f.link.href} className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-brand hover:underline">
                          {f.link.label} <ExternalLink size={9} />
                        </Link>
                      )}
                    </div>
                  )}
                </Card>
              ))}
              {faqs.length === 0 && (
                <Card>
                  <p className="px-4 py-8 text-center text-[11px] text-muted">No answers match “{query}”.</p>
                </Card>
              )}
            </div>
          )}

          {tab === "support" && (
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                {
                  icon: Mail,
                  title: "MoPA IT focal person",
                  detail: "it.support@mopa.gov.pk",
                  note: "Access issues, role changes, password resets.",
                  action: "Email support",
                },
                {
                  icon: Phone,
                  title: "Helpdesk",
                  detail: "+92 51 926 5375",
                  note: "Weekdays 09:00–17:00 PKT.",
                  action: "Call",
                },
                {
                  icon: ShieldCheck,
                  title: "NITB service desk",
                  detail: "support@nitb.gov.pk",
                  note: "Platform incidents and uptime escalations.",
                  action: "Raise ticket",
                },
                {
                  icon: MessageSquare,
                  title: "In-portal feedback",
                  detail: "Report a data issue",
                  note: "Flags a record for review without editing it.",
                  action: "Open form",
                },
              ].map((c) => (
                <Card key={c.title} className="p-4">
                  <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-brand-soft text-brand">
                    <c.icon size={15} />
                  </span>
                  <p className="mt-2.5 text-[12px] font-semibold text-ink">{c.title}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-brand">{c.detail}</p>
                  <p className="mt-1.5 text-[9.5px] leading-[1.6] text-muted">{c.note}</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2.5 w-full"
                    onClick={() => toast({ title: c.action, description: `${c.title} · request queued for the support desk.`, tone: "success" })}
                  >
                    {c.action}
                  </Button>
                </Card>
              ))}
            </div>
          )}

          {tab !== "support" && (
            <Card className="overflow-hidden">
              <CardHeader
                eyebrow="Keyboard"
                title="Move faster"
                subtitle="Shortcuts available anywhere in the portal."
                icon={<Keyboard size={14} />}
              />
              <div className="grid gap-1.5 p-4 sm:grid-cols-2">
                {SHORTCUTS.map((s) => (
                  <div key={s.label} className="flex items-center justify-between rounded-[9px] border border-line bg-surface-2 px-2.5 py-2">
                    <span className="text-[10.5px] text-ink-2">{s.label}</span>
                    <span className="flex items-center gap-1">
                      {s.keys.map((k) => (
                        <kbd key={k} className="rounded border border-line-strong bg-surface px-1.5 py-0.5 font-mono text-[9px] text-muted">
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        <div className="space-y-4 lg:col-span-4">
          <Card className="texture relative overflow-hidden p-4">
            <div className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full bg-[radial-gradient(circle_at_center,var(--brand-soft),transparent_70%)]" />
            <div className="relative">
              <p className="eyebrow">Getting started</p>
              <p className="mt-2 text-[12.5px] font-semibold leading-[1.4] text-ink">
                Four things this portal does
              </p>
              <ol className="mt-2.5 space-y-2">
                {[
                  "Tracks every bill through fixed workflow stages.",
                  "Runs the statutory clocks and escalates before they lapse.",
                  "Holds the document set against each Bill ID.",
                  "Records who changed what, when and why.",
                ].map((item, i) => (
                  <li key={item} className="flex gap-2 text-[10px] leading-[1.6] text-muted">
                    <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-brand/25 bg-brand-soft font-mono text-[8px] font-semibold text-brand">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </div>
          </Card>

          <Card className="p-4">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-ink">
              <Sparkles size={12} className="text-brand" /> Tip
            </p>
            <p className="mt-1 text-[9.5px] leading-[1.7] text-muted">
              Press <kbd className="rounded border border-line-strong bg-surface-2 px-1 font-mono text-[8.5px]">⌘K</kbd>{" "}
              anywhere to jump to a bill, report or page by name. Try a Bill ID like{" "}
              <span className="font-mono text-ink">MOPA-2026-1040</span>.
            </p>
          </Card>

          <Card className="bg-surface-2 p-4">
            <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-ink">
              <Info size={12} className="text-brand" /> Data questions
            </p>
            <p className="mt-1 text-[9.5px] leading-[1.65] text-muted">
              If a figure looks wrong, open the bill record and check the stage history and audit tab
              before raising a ticket. Every number links back to source records.
            </p>
            <Link href="/audit" className="mt-2 inline-flex items-center gap-1 text-[9.5px] font-medium text-brand hover:underline">
              Open audit trail <ExternalLink size={9} />
            </Link>
          </Card>

          <div className="rounded-[13px] border border-line bg-surface p-3">
            <p className="flex items-center gap-1.5 font-mono text-[8.5px] uppercase tracking-[0.13em] text-faint">
              <Landmark size={10} /> Implemented by NITB
            </p>
            <p className="mt-1 text-[9px] leading-[1.6] text-muted">
              National Information Technology Board · H-9/1, Islamabad · Ministry of IT &amp;
              Telecommunication.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

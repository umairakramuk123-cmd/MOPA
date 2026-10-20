# MoPA — Legislative Monitoring Dashboard

A production-grade, fully responsive portal for the **Ministry of Parliamentary Affairs (MoPA)**, built from the requirements in **MOPA BRD 1.2**. It tracks Official Bills, Private Members' Bills and Joint Sitting cases across every legislative milestone — registration to Gazette notification — with statutory deadline clocks, ministry responses, document control and an immutable audit trail.

Implemented as a modern Next.js App Router application with a bespoke institutional design system.

---

## The design direction

**"Institutional Modern"** — gravitas without the visual baggage of legacy government software.

| Decision | Rationale |
| --- | --- |
| **Warm paper canvas** (`#f4f6f2`) instead of grey | Reduces the clinical feel of admin tooling while keeping tables legible |
| **Evergreen primary** (`#0b6b4f`) + muted gold | Parliamentary, official, and distinguishable from corporate blue SaaS |
| **Inter Variable** for UI, **Instrument Serif** for editorial accents, **JetBrains Mono** for IDs, timestamps and eyebrow labels | Three clear registers: interface, narrative, record |
| **Tabular numerals everywhere** | Figures align in tables and metric cards |
| **Hairline 1px borders + layered soft shadows** | Depth without decoration |
| **18px card radius, 10–11px controls** | Soft enough to feel contemporary, tight enough for dense data |
| **Dark mode as a first-class palette** (deep forest, mint, sand) | Long shifts, projector rooms, late sittings |

Design tokens live in `src/app/globals.css` — light and dark values for every surface, text, accent, chart series and shadow.

---

## Screens

| Route | What it does |
| --- | --- |
| `/login` | Animated two-step sign-in: role selector, credentials, OTP verification, success transition. Aurora + grid backdrop, floating live-stat cards, rotating legislative feed. |
| `/dashboard` | Command centre: greeting, session strip, four headline KPIs, throughput area chart with series toggles, bill portfolio donut, committee clocks, escalations, compliance gauge, stage/ministry/ageing charts, chamber workload, activity and the registry table. |
| `/executive` | Board-level view: legislative funnel, outcome mix, house-wise position, sponsorship league, risk watchlist, print/export brief. |
| `/bills` | Registry: workflow cards, pending-response banner, searchable/sortable/selectable table with filters, density toggle, CSV-style export and pagination. |
| `/bills/new` | Four-step registration wizard with live duplicate detection, validation gates, document attach and review. |
| `/bills/[id]` | Bill record: stage history timeline, documents, compliance checks (Article 74, consent, stance, legal review), audit entries, lifecycle rail, and modals to record a stage update, upload a document or file a ministry stance. |
| `/tracking` | Stage board and list views for each of the three workflows, plus the deadline-rule engine. |
| `/committees` | Committee pendency with 30/60-day progress clocks, meeting recording and report status. |
| `/documents` | Repository with classification-aware filtering, coverage gaps and upload flow. |
| `/alerts` | Exception list with severity/type/status filters, acknowledge/resolve, delivery channels and rule summary. |
| `/reports` | All fifteen BRD reports, category filters, PDF/Excel generation, schedules and history, plus a report builder drawer. |
| `/ministries` | Division directory with workload, breaches, response queue and a detail drawer. |
| `/approvals` | Endorsements and stage verifications with approve/return decisions and SLA tracking. |
| `/users` | Accounts, MFA status, invitations and a full RBAC permission matrix. |
| `/audit` | Append-only trail with before/after diffs, reasons, actor attribution and integrity notes. |
| `/settings` | Deadline configuration, escalation ladder, notification channels, security policy, theme, density and organisation profile. |
| `/profile` | Identity, role permissions, recent actions, security and session controls. |
| `/help` | BRD glossary, how-it-works answers, keyboard shortcuts and support channels. |

Global surfaces: command palette (`⌘K`), notification centre, account menu with role preview, toast system, idle-session warning and 15-minute auto-logout.

---

## Roles (BRD §13)

| Role | Scope | Capabilities |
| --- | --- | --- |
| **Super Admin** (MoPA) | Federal | Everything: users, settings, audit, all bills and exports |
| **Legislative Data Manager** | MoPA | Register/edit bills, stage updates, documents, deadlines, reports |
| **Secretary / Senior Management** | Federal | Approve endorsements, executive dashboard, reports, audit |
| **Concerned Ministry / Division** | Own division | View its bills, file Article 74 stance and responses, upload documents |
| **Law & Justice Division** | Federal | Legal review and remarks on every bill |
| **Prime Minister's Office** | Federal | Strictly read-only — no write path exists |
| **NA / Senate Secretariat** | Federal | Orders of the Day, receipt and House decisions |

Permissions are declared in `src/lib/roles.ts` and checked with `can(role, permission)` throughout the UI. Ministry accounts are **data-scoped**: they only receive their own division's bills from the store, so the restriction is not merely a hidden button.

Use the avatar menu → **Preview access as** to switch roles instantly and see navigation, actions and data change.

---

## What is real vs. demonstration

**Real**
- Full interface, routing, role model, permission gating and data scoping
- Consistent seeded dataset: 54 bills across 3 workflows, 15 ministries, 12 users, alerts, approvals, 15 reports, documents and audit entries
- Working interactions: register a bill (with duplicate blocking), record stage updates (validated), upload documents, file stances, acknowledge/resolve alerts, approve/return requests, filter/sort/paginate, switch theme, print briefs
- Deterministic "system date" (`20 Oct 2026`) so ageing, deadlines and charts are reproducible

**Demonstration only**
- Authentication is a cookie that records the selected role — no password verification, no OTP gateway. Every role's credentials are pre-filled and any six digits pass the OTP step.
- Data is in-memory and resets on reload; exports and downloads are simulated.
- For production: replace `src/lib/store.tsx` data operations with API calls, move permission checks to the server/API layer, wire the OTP provider and persist to the MoPA database. The UI contracts are already shaped for this.

---

## Tech stack

- **Next.js 15** (App Router, React 19, server components for route gating)
- **TypeScript** strict + `noUnusedLocals`
- **Tailwind CSS v4** with a token layer in `globals.css`
- **Motion** for page, modal and login choreography
- **Recharts** for all data visualisation
- **Lucide** icon set
- **Fontsource** self-hosted Inter Variable, Instrument Serif and JetBrains Mono

No component library is used — every primitive in `src/components/ui` is purpose-built so the identity is consistent and the bundle stays lean.

---

## Getting started

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # production build
npm start              # serve the production build
npm run typecheck      # tsc --noEmit
npm run lint           # ESLint CLI (eslint-config-next / core-web-vitals)
npm test               # Vitest domain suite (29 tests)
npm run verify:portal  # jsdom end-to-end pass over the single-file portal
```

Node 20.9+ required. The dev server binds to `0.0.0.0` so it can be previewed through a proxied environment.

**Sign in:** pick a role on `/login` (credentials are pre-filled), press **Continue securely**, then enter any six digits.

---

## Single-file edition

`public/mopa-portal.html` is the whole portal as **one self-contained HTML file** — no build step, no network calls:

- Manrope embedded as a base64 WOFF2, ApexCharts 8 inlined, all CSS and JavaScript in the document
- The same seven roles, permissions, seeded registry (54 bills, 215 documents), and fifteen views
- Animated login with role picker and OTP step, glass surfaces, green/blue gradients on white
- Every text size between 13px and 16px; charts re-render per role and view
- In-memory edits (register bill, stage update, OD, documents, stance, legal review, approvals, alerts)
- Deep-linkable views (`#bills`, `#committees`, `#documents` …) with browser back/forward, permission-checked on entry
- Sortable tables — registry (7), documents (7), users (6), divisions (8) — with `aria-sort`, announcements and focus retained
- In-place division search that keeps keyboard focus
- Shortcut sheet on `?` (also in Help), listing every real binding
- CSV exports follow the active filters and say so in the confirmation
- Audit trail pages through every event; the inter-House clock is derived from history when the field is absent
- Command palette on `⌘K` across bills, documents, divisions, reports and pages, with arrow-key navigation
- All fifteen statutory reports open a live preview built from the current records, exportable as CSV or via print/PDF
- Settings that actually apply: alert rules mute notifications everywhere, compact density, OTP on/off, idle logout, IP-range chip
- Session reset from Settings restores the seeded dataset without signing out
- Idle sessions warn 60 seconds ahead, with a countdown and a one-click stay-signed-in
- Single file, no cookies, no storage: closing the tab discards the session

Open it directly in a browser, or run the dev server and visit `http://localhost:3000/mopa-portal.html`.

### Verifying the single file

```bash
npm run verify:portal
```

Boots `public/mopa-portal.html` in jsdom and drives it like a user — sign-in and OTP, all fifteen views, sortable registry, command palette, every one of the fifteen reports (preview, CSV, print sheet), alert-rule settings, dataset reset, focus traps, an accessibility sweep over every view, cross-view number consistency, and all seven role scopes, plus the idle-session warning filtered exports, transmission tracking and table paging. 31 checks, exits non-zero on the first regression.

---

## Project structure

```
src/
├─ app/
│  ├─ layout.tsx              # fonts, metadata, theme bootstrap
│  ├─ globals.css             # design tokens, primitives, motion, print
│  ├─ page.tsx                # session-aware redirect
│  ├─ login/                  # animated sign-in (client)
│  └─ (portal)/               # authenticated shell
│     ├─ layout.tsx           # cookie gate + store + app shell
│     ├─ dashboard|executive|bills|tracking|committees|documents|
│     │  alerts|reports|ministries|approvals|users|audit|settings|
│     │  profile|help/
│     └─ loading.tsx, error.tsx
├─ components/
│  ├─ layout/                 # sidebar, topbar, command palette, toasts, shell
│  ├─ ui/                     # primitives, form kit, overlays
│  ├─ charts.tsx              # chart frames and visualisations
│  ├─ kpi.tsx                 # metric cards, spotlight, stat strip
│  └─ BillTable.tsx           # registry data table
└─ lib/
   ├─ types.ts roles.ts workflows.ts      # domain model + RBAC + stage templates
   ├─ data.ts metrics.ts                  # deterministic dataset + computations
   ├─ store.tsx session.ts                # client store, role scoping, auth cookie
   ├─ format.ts nav.ts help-content.ts    # utilities, navigation, glossary
scripts/
└─ verify-portal/                        # jsdom end-to-end pass over the single file
   ├─ lib.mjs                            # boot helper (Apex stub, stubs, captures)
   └─ verify.mjs                         # 25 checks: views, a11y, reports, roles
```

---

## Accessibility & quality

- Semantic landmarks, skip link, labelled controls, `aria-current` navigation
- Visible focus rings on every interactive element
- Keyboard: `⌘K` palette with arrow/enter navigation, `?` shortcut sheet, `Esc` to close overlays, paste support in OTP
- Focus is trapped inside open modals and drawers, and restored to the page on close
- Charts expose an accessible text summary (`role="img"` with a generated label)
- Live region announces view changes and table sorting to screen readers
- `prefers-reduced-motion` disables all animation, including chart and KPI motion
- Colour is never the only signal — badges carry text and icons
- Every white-on-colour surface (KPI cards, brand gradient, nav, chips, icon tiles) clears WCAG AA at 4.5:1
- Print stylesheet produces a clean legislative brief (chrome hidden, cards unshadowed)
- TypeScript strict, zero unused code, production build verified
- Animated KPI counters respect `prefers-reduced-motion`
- `npm run lint` and `npx tsc --noEmit` report zero warnings/errors
- `npm audit --omit=dev` reports zero vulnerabilities

---

## BRD traceability

| BRD requirement | Where |
| --- | --- |
| §8 Unique Bill ID, duplicate detection | Register wizard, registry, bill record |
| §8 Three separate workflows | `/tracking`, stage templates in `workflows.ts` |
| §8 Stage-wise tracking + mandatory date/reference | Stage update modal with validation and "Not Available" reason |
| §8 Audit trail (read-only) | `/audit`, bill record → Audit tab |
| §8 RBAC | `/users`, role switcher, server-side data scoping |
| §8 Article 74 & consent tracking | Bill record → Compliance, stance modal |
| §8 Document repository | `/documents`, bill record → Documents |
| §8 Automated alerts & deadline tracking | `/alerts`, committee clocks, dashboard escalations |
| §8 Role-based dashboards | Role-aware navigation, KPIs and scopes |
| §13 Seven user roles | `roles.ts`, `/users` matrix |
| §14 Security (MFA, inactivity logout) | Login OTP, idle banner, settings policy |
| §15 Milestone notifications | Alert types, catalogue and delivery settings |
| §16 Fifteen reports | `/reports` |
| §17 Glossary | `/help` |

---

© 2026 Ministry of Parliamentary Affairs · Implemented by NITB · Data classification: Restricted

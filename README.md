# Kryon CRM

A custom B2B CRM for **Kryon**, a manufacturer of BLDC motor controllers sold to OEM
appliance makers (Room AC, Air Cooler, Washing Machine, Ceiling Fan, etc.). It manages the
full sales cycle — **Lead → Discussion → NDA → Sample → Testing → Negotiation → PFI → PO →
Closed** — with industry-specific commercial logic (BOM costing, discount-approval tiers,
GST calculation, PFI generation, PO mismatch flagging).

This is **not** a generic CRM. The pricing, GST, and approval workflows are modelled on
Kryon's actual motor-component sales process.

---

## Current status (at a glance)

- ✅ **Frontend: fully built and working** — all 14 modules below are interactive.
- ✅ **Business logic implemented** — GST split, discount routing, auto-numbering, cold-lead
  rule, PO↔PFI matching, price-advantage / annual-value calculations.
- 🟡 **Data layer is a local demo store** — everything runs in the browser (persisted to
  `localStorage`). The backend is scaffolded but **not yet wired** to the CRM modules.
- ⛔ **Not hosted yet** — runs locally only (see *Hosting* and *Where it runs* below).

> **Demo mode:** On the login screen, click **"Enter demo mode"** to explore the whole app
> on sample data with no backend or database required. (Dev builds only.)

---

## Modules — requirement met & how it flows

| Module | Requirement it covers | Flow |
|---|---|---|
| **Dashboard** | KPI cards (active leads, pipeline value, conversion, POs, stuck deals), pipeline funnel | Landing page; all numbers computed live from your data |
| **Customer Master** | Full OEM profile — segment, **GSTIN (validated)**, billing/shipping state, classification (Priority A/B/C, Tier), vendor registration, annual potential | New Customer → form → save. Row → detail panel (linked contacts + deals) → Edit. Add/remove contacts & deals inline |
| **Contact Directory** | Multiple contacts per customer — department, buying role, primary flag | New Contact → pick customer → save. Row → edit |
| **Product Master** | Kryon SKU catalogue — motor type, V/W/poles, sensor, HSN, price | New Product → save. Row → edit |
| **Deal Pipeline** | 11-stage Lead→PO journey, confidence scoring, auto **price-advantage %** & **annual value**, **cold-lead flag** (no activity 14+ days), activity timeline | Board (kanban) or list → New Deal (live auto-calcs) → click card → move stage, log activity, timeline |
| **Visit & Meeting Log** | Type/purpose, attendees, summary, decisions, sentiment, competitor, next visit | Log Visit → save; auto-appends to the linked deal's timeline |
| **Documents & NDA** | Doc types (NDA, spec, BIS, test report…), direction, status, version, validity, signed flag | Record Document → save; change status inline |
| **Samples & Testing** | Auto `SAM-YYYY-XXXX`, dispatch/courier, test feedback, issues by severity, final result, **rework loop** | New Sample → dispatch. Row → enter feedback. "Raise Rework" spawns v2 and fails the old one |
| **Quotations** | **BOM build-up → margin → price**, market-position band, price advantage, **discount-approval routing** (Auto/Manager/VP/CEO), auto `QOT-YYYY-XXXX` | New Quote → enter BOM (live total) → set margin → final price → see realized margin, approval tier, market band → save |
| **PFI (Proforma Invoice)** | Generate from approved quote, **GST auto-split** (CGST+SGST same state / IGST inter-state from addresses), amount-in-words, auto `PFI-YYYY-XXXX`, **3-step approval** | Generate PFI → pick approved quote → GST computes → approve Rep → Commercial → Management |
| **Purchase Orders** | Capture customer PO, **line-by-line match vs PFI** with qty/price mismatch flags, mismatch notes required | Capture PO → pick PFI → enter lines; mismatches highlight & force a note; saves Validated / Mismatch Flagged |
| **Market Intelligence** | Competitor pricing per customer, auto price-advantage %, annual revenue potential, tech/quality/sourcing notes | Capture Intel → enter competitor + volumes → metrics compute → shown as cards |
| **Travel Planner** | Trips with linked deals, budget, expense logging, **cost-per-visit** KPI | Plan Trip → pick deals + budget. Trip → add expenses; cost/visit computes |
| **Reports** | Stage funnel, segment split, sales-rep performance, win/loss, weighted forecast | Read-only analytics, derived live from deals (Excel export stubbed for backend) |
| **Users & Roles (Admin)** | Account list with roles | Lists users; full role management is a later phase |

### Business rules implemented (in `frontend/src/lib/business.ts`)
1. **Cold-lead auto-flag** — Hot lead with no activity 14+ days is flagged Cold.
2. **GST calc** — same billing/shipping state → CGST+SGST; different → IGST.
3. **Discount approval routing** — 0–10% auto · 10–15% Sales Manager · 15–25% VP/Director · >25% CEO.
4. **Auto-numbering** — `QOT-YYYY-XXXX`, `PFI-YYYY-XXXX`, `SAM-YYYY-XXXX`.
5. **PO vs PFI matching** — per-line qty & price mismatch flags; notes required on mismatch.
6. **Price advantage %** — `(customer price − our price) / customer price`.
7. **Estimated annual value** — `quantity × our price`.
8. **GSTIN validation** — 15-char format check.

---

## 1. Tech stack

**Frontend (`/frontend`) — built & running**
- **React 19** + **TypeScript** (strict mode)
- **Vite 8** (build/dev)
- **TanStack Query 5** (server-state — for when the API is wired)
- **Zustand 5** (client/UI + the demo data store, persisted to `localStorage`)
- **Tailwind CSS 4** + shadcn-style components on **@base-ui/react**
- **react-router 7**, **lucide-react** (icons), **Zod 4** (env validation)
- Typography: **Fraunces / Hanken Grotesk / IBM Plex Mono** (Google Fonts)
- Testing: **Vitest** + Testing Library + **MSW** (configured)

**Backend (`/backend`) — scaffolded, not yet wired to the CRM**
- **NestJS 11** + **Fastify** adapter
- **Prisma 7** + **PostgreSQL** (Neon)
- **JWT auth** (access + refresh) via `passport-jwt`, password hashing with **bcrypt**
- **class-validator** + **class-transformer**, **Zod** env validation
- **@fastify/helmet** (security headers), **Pino** structured logging
- Testing: **Jest** + Supertest

## 2. Tools used
- **Claude Code** (Anthropic) — built the application
- **npm** (package manager / scripts)
- **ESLint** (zero-warning gate) + **Prettier** + **tsc** (strict typecheck)
- **Vite** production build; **Git** for version control
- VS Code as the editor/IDE

## 3. Where it will be hosted
**Not decided / not hosted yet.** The app currently runs locally. Recommended path when you're
ready to deploy (frontend and backend deploy separately):
- **Frontend (static SPA):** Vercel, Netlify, or Cloudflare Pages.
- **Backend (NestJS API):** Railway, Render, Fly.io, or a container on AWS/Azure/GCP.
- **Database (PostgreSQL):** Neon, Supabase, or managed RDS/Cloud SQL.
- **File uploads** (NDAs, POs, spec sheets): S3-compatible object storage.

No infrastructure has been provisioned yet — this is a recommendation, pending your decision.

## 4. Security — done & to-do
**Already in place (mostly in the backend scaffold):**
- JWT access + refresh tokens; passwords hashed with **bcrypt**.
- **@fastify/helmet** security headers; global `ValidationPipe` (`whitelist` strips unknown
  fields); class-validator DTOs.
- **Zod**-validated environment variables — the app refuses to start on missing/invalid secrets.
- No secrets in source; `.env` files are git-ignored.
- Frontend GSTIN/format validation on inputs.
- "Demo mode" auth bypass is **dev-only** (`import.meta.env.DEV`) and never ships in a
  production build.

**To be added before production:**
- Wire the frontend to the real API (today it uses a local demo store — no server-side
  enforcement yet).
- **Server-side RBAC** — enforce the 8 roles/permissions on every endpoint (frontend role
  gating is **not** a security boundary).
- **HTTPS/TLS** everywhere; secure, httpOnly refresh-token cookies.
- **Rate limiting / brute-force protection** on auth endpoints; account lockout.
- **File-upload hardening** — type/size limits, virus scanning, signed URLs.
- **CORS** locked to known origins; CSRF protection as applicable.
- **Audit logging** of approvals (quotes, PFI, PO); secrets management (a vault + rotation).
- Dependency scanning (`npm audit`) and a security review before launch.

## 5. Where is it running — locally or hosted?
**Locally only**, via the Vite dev server.
- Frontend: `http://localhost:5173`
- Data persists in your browser's `localStorage` (per machine — not shared between users).
- The backend (`http://localhost:3000`) is **not currently running** and requires a
  PostgreSQL database + migrations to start. Use **demo mode** to explore without it.

---

## Running it locally

### Frontend (works standalone via demo mode)
```bash
cd frontend
npm install
npm run dev          # http://localhost:5173  → click "Enter demo mode"
```

### Backend (optional — needed for real login & persistence)
Requires PostgreSQL (local Docker or a cloud Postgres like Neon).
```bash
cd backend
cp .env.example .env         # set DATABASE_URL, JWT_SECRET, ADMIN_DEFAULT_* etc.
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed          # creates the admin login from ADMIN_DEFAULT_* in .env
npm run start:dev            # http://localhost:3000
```

### Quality gates (must pass)
```bash
# frontend
npm run typecheck && npm run lint && npm run build
# backend
npm run typecheck && npm run lint && npm run build
```

---

## Project structure
```
/frontend          React app (all CRM modules — built)
  src/
    data/          central demo store (Zustand + localStorage), types, seed data
    lib/           business.ts (the 8 rules), format.ts
    features/      one folder per module (customers, deals, quotes, pfi, …)
    components/ui/ shared primitives (Drawer, Field, Badge, Table, Toast, …)
/backend           NestJS + Fastify + Prisma (auth/users built; CRM modules pending)
Kryon_Demo_Prototype_v2.html   original design reference (Quote engine)
```

## What's next (suggested)
1. Wire the backend: Prisma models for every entity, REST endpoints mirroring the store
   actions, swap the demo store for TanStack Query.
2. Move the business rules server-side (GST, discount routing, auto-numbering, PO matching).
3. Server-side RBAC for the 8 roles.
4. File uploads (NDA / PO / spec sheets) + PFI PDF generation.
5. Tests for the new modules, then deploy.

---

## Appendix — Backend database workflow (Neon + Prisma)

> Reference for when the backend is wired up. Carried over from the project scaffold.

**Architecture:** a schema-only **dev branch** (local development, `migrate dev`, faker seed)
and a **prod branch** holding real data (touched only by `migrate deploy` via CI on merge to
`main`).

**Schema change loop**
```
1. Edit backend/prisma/schema.prisma
2. npx prisma migrate dev --name <description>   ← dev branch
3. Commit the migration file (prisma/migrations/)
4. Push / merge to main
5. CI runs: npx prisma migrate deploy             ← prod branch
```

**Rules**
| Rule | Why |
|------|-----|
| Local `.env` holds **dev branch strings only** | Prevent accidental writes to production |
| Prod strings live in **CI secrets only** | Never committed to source |
| Only `prisma migrate deploy` (CI) touches prod | Safe, non-interactive |
| **Never** run `migrate dev` / `migrate reset` / `db push` on prod | Destructive/interactive |
| Seed script **refuses** if `DATABASE_URL` is the prod host | Hard guard in `prisma/seed.ts` |
| `prisma/migrations/` is **always committed** | Migrations are the source of truth |

**CI gates (both apps):** `lint` (zero warnings) · `typecheck` · `test:coverage` (lines 80%,
branches 75%) · `build`.

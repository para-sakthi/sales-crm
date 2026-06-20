# Kryon CRM — Project Context for Claude Code

## What This Is

A custom B2B CRM for **Kryon**, a manufacturer of BLDC motor controllers sold to OEM appliance makers (Room AC, Washing Machine, Ceiling Fan, etc.). The CRM manages their entire sales cycle: Lead → Discussion → NDA → Sample → Testing → Negotiation → PFI → PO → Closed.

This is not a generic CRM. It is industry-specific to B2B motor component sales, with deep commercial workflow logic (BOM costing, discount approval tiers, GST calculation, PFI generation, PO mismatch flagging).

---

## Reference Files (all in this folder)

| File | What it is |
|------|-----------|
| `kryon-crm-requirements (1).docx` | Full requirements spec — read this first for any new module |
| `Kryon_Demo_Prototype_v2.html` | Working HTML prototype of the Quote Decision Intelligence Engine — open in browser to see the target UI quality and interaction patterns |
| `app-bootstraper.zip` | Full-stack monorepo starter — **extract this into the workspace root** before starting |

### First-time setup
```bash
# From the KRYON/ folder
unzip app-bootstraper.zip
mv app-bootstraper/* .
mv app-bootstraper/.* . 2>/dev/null || true
rmdir app-bootstraper
# You now have /frontend and /backend folders at root level
```

---

## Tech Stack

### Frontend (`/frontend`)
- React 18 + TypeScript (strict mode)
- Vite
- TanStack Query (server state — no useEffect for data fetching)
- Zustand or Jotai (client/UI state)
- shadcn/ui components (already configured via `components.json`)
- Tailwind CSS
- MSW for API mocking in tests
- Vitest + Testing Library

### Backend (`/backend`)
- NestJS + Fastify adapter
- TypeScript (strict mode)
- Prisma ORM + PostgreSQL
- JWT auth (access + refresh tokens) — already implemented
- class-validator + class-transformer
- Pino (structured logging)

### What already exists in the bootstrapper
- Auth module: register, login, refresh token, JWT strategy
- User entity + roles decorator
- Global exception filter, response transform interceptor
- Prisma setup with migrations
- Example module (use as reference pattern for new modules)
- Frontend: LoginPage, WelcomePage, UsersPage, auth store (Zustand)
- shadcn/ui: Button, Card, Input, Label, Table

---

## Code Conventions (from bootstrapper CLAUDE.md files)

### Backend patterns
- Controllers are thin — no business logic, no direct DB access
- All business logic in Services; all DB access in Repositories
- Services depend on repository interfaces, not concrete classes
- All service/repository methods must be `async` returning `Promise<T>`, even if currently synchronous
- Response envelope: `{ data: T }` (single) or `{ data: T[], meta: { offset, limit, total, hasMore } }` (list)
- Pagination: offset-based — `?offset=0&limit=20` (max 100)
- HTTP status: 201 create, 204 delete, 422 validation error, 404 not found
- Module folder: `src/modules/feature-name/` with controller, service, module, dto/, entities/, repositories/

### Frontend patterns
- Feature-based folder structure: `src/features/feature-name/` with components/, hooks/, api/, types/, index.ts
- `@/` path alias for all internal imports
- One component per file; named exports (default export only for route-level pages)
- No prop drilling beyond 2 levels — use Zustand/Jotai
- All API calls through `src/api/` — never fetch directly from components
- Test files colocated: `Component.test.tsx`

### TypeScript
- No `any` — use `unknown` and narrow, or define proper types
- No `@ts-ignore` without explanatory comment

### Commits
- Conventional commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`
- Scope when relevant: `feat(frontend):`, `fix(backend):`

---

## Requirements Summary

Read the full DOCX for detail. This is a quick-reference map of all modules.

### Masters
**Customer Master** — Central company profile per OEM customer. Fields: company name, OEM segment (dropdown: Room AC / Air Cooler / Washing Machine / Refrigerator / Ceiling Fan / Exhaust Fan / Water Purifier / Other), lead source, plant locations, production capacity, annual revenue range, GSTIN (15-char, validate format), website, addresses. Vendor registration section (status, dates, vendor code on approval, document uploads). Classification (Priority A/B/C, Account Owner, Customer Tier 1/2/3, annual potential, tags, notes). Download option for full DB.

**Contact Directory** — Multiple contacts per customer. Fields: name, designation, department (R&D / Purchase / Vendor Development / Quality / Management / Operations / Finance / Other), mobile, email, role in buying decision (Decision Maker / Influencer / Gatekeeper / User / Champion), primary contact flag, LinkedIn, birthday, notes.

**Product Master (Kryon SKUs)** — Kryon's own catalog. Fields: SKU/part number, model name, motor/controller type (BLDC Indoor/Outdoor, PSC, Universal, Direct Drive, Stepper, PMSM, Other), voltage (V), wattage (W), poles (2–16), sensor type (Hall / Sensorless Back-EMF / Encoder Optical/Magnetic / Resolver), HSN code (8-digit), current selling price (INR), description, spec sheet upload.

Also **Customer Product Details** per customer — what they currently buy: SKU, annual qty, current purchase price, tech specs, current primary/secondary supplier.

### Deal Pipeline (Lead → PO)

11 stages: `Lead - Hot` → `Lead - Cold` → `Discussion` → `NDA` → `Sample Submitted` → `Testing` → `Commercial Negotiation` → `PFI Sent` → `PO Received` → `Closed Won` → `Closed Lost`

**Auto-rule:** No activity logged in 14+ days → Hot auto-flags to Cold (backend scheduled job).

**Discussion Stage** — Confidence scoring: 100% / 75% / 50% / 25% / Not confident. All comms (visit/email/call) logged chronologically.

**Deal/Opportunity form fields:** Customer (search by phone/name/city), linked contact, OEM segment (auto from customer), product category + SKU, quantity, estimated annual value (auto = qty × price), current supplier + their price, our quoted price, price advantage % (auto-calc), confidence level, current stage, log, next action + date, deal owner.

### Visit / Meeting Log
Per meeting: user, date/time (auto), visit type (In-Person / Virtual / Phone), purpose (Discovery / Follow-up / Sample Review / Negotiation / Plant Audit / Relationship / Other), linked customer, linked deal, our attendees (multi-select from users), customer attendees (from contact master), discussion summary (rich text), key decisions, action items (task + owner + deadline), confidence level updated, customer sentiment (Very Positive → Very Negative), competitor discussed (optional), attachments, next visit date.

### NDA & Document Exchange
Document types: NDA (Mutual/One-way), Technical Spec Sheet, Product Datasheet, Vendor Registration Form, BIS Certificate, Test Report, Brochure/Catalog, Other. Direction: Sent / Received. Status: Draft / Sent / Signed / Expired. File upload, validity date, version number, signed copy flag. **Note:** E-sign integration to be decided (DocuSign / Zoho Sign / manual upload — clarification pending).

### Sample Submission & Testing
Auto-generated ID: `SAM-YYYY-XXXX`. Fields: linked customer + deal, product SKU, quantity sent, dispatch date, courier details, tracking, delivery confirmation. Testing feedback per sample: status (Not Started / In Progress / Passed / Failed / Rework), test types (Reliability / Performance / Other), test result summary, customer feedback verbatim, issues with severity (High/Medium/Low), R&D coordinator, rework required. Final result: Approved / Rejected / Conditional. **Rework loop:** if test fails → new sample version → re-test (linked to same deal). R&D auto-notified on customer feedback received.

### Commercial Negotiation & Pricing
**Quotation form:** BOM cost build-up (raw material + conversion + consumables + packaging + freight = total BOM). Target contribution margin (%) → target selling price (auto = BOM / (1 - margin%)). Market benchmark low/high, customer's current price, our final quoted price, price advantage % (auto). Auto-generated quote number: `QOT-YYYY-XXXX`. Validity period (default 30 days). Payment terms + delivery terms dropdowns. Manager approval.

**Negotiation Log:** Round-by-round — our price vs customer counter, gap (INR + %), concessions, outcome (Ongoing / Agreed / Deadlocked), escalation.

**Discount Approval Tiers:**
- 0–10%: Auto-approved
- 10–15%: Sales Manager approval
- 15–25%: VP/Director approval
- >25%: CEO approval

### PFI Generation (Proforma Invoice)
Auto-generated: `PFI-YYYY-XXXX`. Header auto-populated from agreed quotation. Line items with HSN code, qty, unit price, discount %, line total, GST rate (5/12/18/28/0%). **GST auto-calc:** CGST+SGST if billing and shipping in same state; IGST if different states (detect from addresses). Grand total + amount in words (auto). 3-step approval: Sales Rep → Commercial Manager → Management. **PDF output:** auto-generate with company letterhead, bank details, T&C, authorized signatory.

### PO Upload & Capture
Upload customer's scanned PO PDF. Enter PO line items. **Auto-compare with PFI:** flag qty mismatches (TRUE/FALSE), flag price mismatches (TRUE/FALSE). Mismatch notes required if any flag is FALSE. Validation workflow (Pending → Validated / Mismatch Flagged / Accepted with Deviation / Rejected). Production notification auto-sent on validation.

### Market Intelligence Form
Captured during customer visits from 3 contacts: Purchase Head (supplier/sourcing data), R&D Head (tech specs), Quality Head (quality parameters). See DOCX Section "Market Intelligence Form" for full field list — very detailed with "Must Capture / Try to Get / If Available" tiers. Includes competitive landscape per competitor and opportunity sizing (auto-calc: price advantage %, estimated annual revenue potential).

### Travel Planner & Visit Efficiency
Trip header: name (auto = city + dates), type, start/end date, destination, travel mode, traveling employees, budget, advance request, manager approval. Planned visits per trip linked to deals. Post-trip: visit outcome, expense logging per item (transport/hotel/food/DA/local), receipt upload. Trip expense summary (auto). Visit efficiency KPIs: cost per visit, visit productivity rate, average visits to close, cost per conversion, pipeline ROI.

### Dashboards & Reports
KPI cards: Total Active Leads, Pipeline Value (INR), Conversion Rate, Leads Added This Month, POs Received This Month, Average Days/Stage, Stuck Deals (no activity >14 days), Active Orders, Revenue Collected/Pending, Product-wise Analysis.

Standard reports: Pipeline Summary, Deal Cycle Trends, Stage Conversion Funnel, Revenue Forecast (weighted pipeline), Segment-wise Split, Sales Rep Performance, Win/Loss Analysis, Competitor Win-rate Comparison, Visit Frequency vs Conversion, Stuck Deals Aging, Monthly MIS Export (Excel download), Scheduled Weekly Email to Management.

### User Roles & Permissions

| Role | Can Create | Can View | Can Approve | Dashboard |
|------|-----------|---------|------------|-----------|
| Sales Rep | Leads, Deals, Visits, Quotes | Own deals only | No | Own pipeline |
| Sales Manager | All + assign deals | Team deals | Quotes, Discounts ≤15% | Team pipeline |
| Commercial Mgr | Quotes, PFI | All deals + pricing | PFI review, Disc ≤25% | Full pipeline + pricing |
| VP / Director | — | All | PFI final, Disc >25% | Full + strategy |
| R&D | Sample feedback, test results | Assigned samples | No | Sample tracker |
| Quality | Test reports | Quality items | No | Quality dashboard |
| Finance | PO, Invoices, Payments | PO + payment data | No | Revenue dashboard |
| Admin | All masters, users, config | Everything | System config | All dashboards |

---

## What the HTML Prototype Implements

`Kryon_Demo_Prototype_v2.html` is the **Quote Decision Intelligence Engine** only — one of 6 planned "agents" on a broader platform (5 others are "coming soon"). Open it in a browser to see the UI quality target.

**Implemented in the prototype:**
- Login screen (dual role: Commercial Manager / Sales Rep)
- Home screen with 6 agent cards (only Quote Engine is live)
- Quote flow (3 steps): customer + product selection → pricing mode selection → AI recommendation with margin badge, approval routing, BOM build-up, market positioning band
- Master Data (8 panels): Item Master (BOM + FX rates), Indirect Cost Stack, FG Inventory, Capacity & Commitment, Working Capital / Customer Terms, Market Benchmarks, Margin Policy & Approval
- Add Customer modal (minimal — 4 fields only, not the full Customer Master)
- Add Product modal

**What's genuinely well done in the prototype (preserve these patterns):**
- Typography system: Fraunces (serif headings) + Hanken Grotesk (body sans) + IBM Plex Mono (data/labels) — distinctive and professional
- Color system: `--ink` (near-black), `--pass` (green), `--warn` (amber), `--block` (red) semantic colors
- Pricing calculation: BOM → margin → recommended price → approval routing is correctly modeled
- Market positioning band (visual showing where our price sits vs. competitor range)
- Approval routing visualization (shows who needs to sign off based on discount %)
- FX rate management for imported BOM components

---

## Gap Analysis — What Still Needs to Be Built

Everything except the Quote Engine is unbuilt. Priority order for building:

### Phase 1 — Shell & Foundation
- [ ] App layout shell (sidebar nav + topbar + content area)
- [ ] Sidebar navigation with all module groups
- [ ] Dashboard / landing page with KPI cards
- [ ] Role-aware rendering (connect to existing JWT roles)

### Phase 2 — Core Masters
- [ ] Customer Master (full form + list + detail view)
- [ ] Contact Directory (per customer, multi-contact)
- [ ] Product Master / Kryon SKUs

### Phase 3 — Deal Pipeline
- [ ] Deal creation form
- [ ] Pipeline board (Kanban by stage or list view)
- [ ] Cold lead auto-flag (backend scheduled job + frontend badge)
- [ ] Deal detail page (timeline of all activities)

### Phase 4 — Activity Modules
- [ ] Visit / Meeting Log (create + list + link to deal)
- [ ] NDA & Document Exchange (file upload + status tracking)
- [ ] Sample Submission + Testing (with rework loop)

### Phase 5 — Commercial Workflow
- [ ] Quotation form (BOM build-up, margin calc, approval)
- [ ] Negotiation Log (round-by-round tracking)
- [ ] PFI Generation (form + 3-step approval + PDF output)
- [ ] PO Upload & Capture (with PFI comparison + mismatch flagging)

### Phase 6 — Intelligence & Reporting
- [ ] Market Intelligence Form (per customer, from visit)
- [ ] Travel Planner + Expense Logging
- [ ] Reports & Analytics
- [ ] User / Role management UI

---

## Key Business Logic Rules (implement carefully)

1. **Cold Lead Auto-flag:** If a deal in "Lead - Hot" stage has no activity (no visit log, no document, no note) for 14+ days → automatically move to "Lead - Cold". This is a backend scheduled job (`@Cron`), surface in UI as a badge/tag.

2. **GST Calc:** Compare billing address state vs. shipping address state (from customer master). Same state → split into CGST + SGST (each = GST rate / 2). Different states → IGST (full GST rate). Logic lives in backend service.

3. **Discount Approval Routing:** Calculated from `(list_price - quoted_price) / list_price * 100`. 0–10% = auto, 10–15% = Sales Manager, 15–25% = VP/Director, >25% = CEO. Enforce in PFI approval workflow.

4. **Auto-numbering:** PFI → `PFI-YYYY-XXXX`, Quotes → `QOT-YYYY-XXXX`, Samples → `SAM-YYYY-XXXX`. Generate in backend on create, expose as read-only in frontend.

5. **PO vs PFI Matching:** On PO upload, line-item compare quantity and unit price vs. linked PFI. Flag individual line mismatches. Store mismatch flag as boolean on each PO line item. Require mismatch notes if any flag is true.

6. **Price Advantage %:** Auto-calc = `(customer_current_price - our_quoted_price) / customer_current_price * 100`. Show in deal form and quote form.

7. **Estimated Annual Value:** Auto-calc = `quantity_required * our_quoted_price`. Show in deal creation form.

8. **GSTIN Validation:** 15-character alphanumeric format: `[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}`. Validate on customer master form.

---

## Pending Clarifications (from requirements doc)

These need client decisions before building the relevant features:

- E-sign provider: DocuSign / Zoho Sign / manual upload only
- PFI PDF template: letterhead design, bank details, T&C text (client to supply)
- GST logic: Finance team to confirm CGST+SGST vs IGST rules
- ERP integration: Tally / Zoho Books / SAP B1 (or none for now)
- Mobile screens: which specific screens need mobile-optimized design
- Notification channels: email vs push vs SMS per alert type
- Data migration: volume of existing customers/deals from Excel

---

## Current Build Status

- Backend auth: ✅ Working (register, login, refresh token, JWT)
- Backend users: ✅ Working (list users with roles)
- Frontend auth: ✅ Working (login page, auth store)
- Frontend layout: ❌ Not started (bare login → welcome → users list)
- All CRM modules: ❌ Not started

**Start here:** Build the frontend layout shell first (sidebar + topbar + routing structure), then the dashboard, then Customer Master. Use the HTML prototype's visual design as the quality and style reference.

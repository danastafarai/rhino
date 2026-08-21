# Sprint 0 Engineering Report — Repository Discovery, Technical Audit & Planning

**Repository:** `danastafarai/rhino`
**Date:** 2026-07-08
**Sprint:** 0 (Discovery — understand everything before changing anything)
**Audited revision:** `c994b82` (`main`) plus side branch `claude/edtech-mvp-architecture-g7xozh` (`368a93f`)

---

## 1. Executive Summary

**The single most important finding of this audit: there is no software to audit yet.**

The `rhino` repository is a **pre-code greenfield project**. The `main` branch contains exactly
two files — an Apache-2.0 `LICENSE` and a Rust-template `.gitignore` — from a single
"Initial commit". There is no application code, no build system, no database, no CI/CD, no
tests, no deployment, and no README. There are no GitHub issues and no pull requests.

What _does_ exist is valuable: an unmerged side branch
(`claude/edtech-mvp-architecture-g7xozh`) carries two well-reasoned German-language planning
documents:

1. **`docs/edtech-mvp-architektur.md`** — an MVP architecture for a children's self-paced
   learning platform (courses, lessons, projects, progress tracking, optional Raspberry Pi
   hardware guides), including a recommended tech stack, data model, GDPR Art. 8 child-data
   strategy, and a build/buy/manual decision framework.
2. **`docs/roadmap-phase-a-b.md`** — a milestone roadmap: **Phase A** (weeks 1–6, no-code
   validation with a Go/No-Go gate at ≥10 paying families) and **Phase B** (weeks 7–22,
   custom platform build in five milestones B1–B5, each with explicit exit criteria).

These documents align almost perfectly with the product vision given for this engagement
(self-paced learning, children first, Raspberry Pi programming path, future audiences later).
They are the de-facto architecture decision record for this project, and this report treats
them as the baseline.

**Consequently, Sprint 0's deliverable is not a defect list — it is a validated starting
plan.** This report:

- documents the true state of the repository (sections 2–15),
- reviews the _proposed_ architecture instead of a nonexistent implementation (section 4),
- surfaces the small number of real inconsistencies and risks that exist today — notably the
  Rust `.gitignore` vs. the documented Next.js/TypeScript stack decision, the stranded
  planning docs on an unmerged branch, and the strategic dependency on the Phase A validation
  gate (sections 14, 16, 20),
- and converts the planning documents into a Scrum-ready product backlog, epic breakdown,
  4-sprint roadmap, risk register, and Definition of Done (sections 17–24).

**Headline recommendation:** Sprint 1 should be a _foundation sprint_ (roadmap milestone B1):
ratify the tech stack in an ADR, scaffold the repository (Next.js + TypeScript, CI, linting,
testing), and implement parent accounts + child profiles + the consent flow — the
privacy-by-design core that the architecture document correctly identifies as "hard to
retrofit". One strategic caveat applies and is discussed in section 20: the existing roadmap
gates custom development on Phase A market validation, and engineering should confirm with
the product owner that this gate has been (or is deliberately being) waived before Sprint 1
begins feature work.

---

## 2. Repository Overview

### 2.1 Facts

| Property                                             | Value                                                                                                                                         |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository                                           | `danastafarai/rhino` (GitHub)                                                                                                                 |
| Default branch                                       | `main`                                                                                                                                        |
| Commits on `main`                                    | 1 (`c994b82`, "Initial commit", 2026-02-23)                                                                                                   |
| Files on `main`                                      | `.gitignore` (Rust template), `LICENSE` (Apache-2.0)                                                                                          |
| Other branches                                       | `claude/edtech-mvp-architecture-g7xozh` (+2 commits: two docs under `docs/`), `claude/edtech-sprint-zero-audit-bf64ge` (this Sprint 0 branch) |
| Open issues / PRs                                    | 0 / 0                                                                                                                                         |
| Project type                                         | None yet (pre-code)                                                                                                                           |
| Monorepo                                             | N/A — no packages exist                                                                                                                       |
| Package manager / build system / framework / runtime | None present                                                                                                                                  |
| Languages                                            | Markdown (docs branch) only                                                                                                                   |
| Deployment platform                                  | None configured                                                                                                                               |

### 2.2 Repository map

```
rhino/  (main)
├── .gitignore      # Rust/Cargo template — inconsistent with documented stack (see §14)
└── LICENSE         # Apache License 2.0

rhino/  (branch claude/edtech-mvp-architecture-g7xozh)
└── docs/
    ├── edtech-mvp-architektur.md   # MVP architecture, stack, data model, privacy (German)
    └── roadmap-phase-a-b.md        # Phase A/B milestone roadmap with gates (German)
```

### 2.3 Observations

- The Rust `.gitignore` is almost certainly an artifact of GitHub's repo-creation dialog, not
  a deliberate stack decision — it contradicts the architecture document, which recommends
  Next.js/TypeScript. This must be resolved explicitly (see §16, backlog story F-2).
- The Apache-2.0 license is a real decision worth keeping in mind: it is permissive and
  business-friendly. If the platform code is intended to remain proprietary, the license file
  applies only to what is published in this repo; no action needed now, but the product owner
  should confirm the repo's intended visibility before shipping paid content into it
  (course content in Git _is_ the CMS in the proposed architecture).
- The planning documents live on an unmerged branch, invisible to anyone browsing `main`.
  They should be merged (backlog story F-1).

---

## 3. Technology Stack

### 3.1 Current stack

**None.** No languages, frameworks, dependencies, databases, or tooling are present.

### 3.2 Proposed stack (from `edtech-mvp-architektur.md`, endorsed by this audit)

| Layer         | Choice                                                            | Rationale (summarized from the doc, reviewed by this audit)   |
| ------------- | ----------------------------------------------------------------- | ------------------------------------------------------------- |
| App framework | **Next.js (React, TypeScript)**, single monolith                  | One codebase, SSG for lesson content, large hiring pool       |
| UI            | Tailwind CSS + shadcn/ui, child-friendly theme                    | Fast, consistent UI without a designer bottleneck             |
| Content       | **MDX in the Git repo** (lessons, tasks, Pi guides)               | Git is the CMS: PR review, versioning, interactive components |
| Database      | **PostgreSQL** (Supabase or Neon, EU region)                      | Relational fit; Supabase adds Auth + Row Level Security       |
| Auth          | Supabase Auth or Auth.js — **email on parent account only**       | Child profiles without email (GDPR/COPPA-friendly)            |
| Payments      | **Stripe** (Checkout, Subscriptions, Customer Portal, webhooks)   | Buy, don't build                                              |
| Video         | Cloudflare Stream or Mux (no YouTube embeds for children)         | No third-party tracking in the child area                     |
| Email         | Resend or Postmark                                                | Transactional only in MVP                                     |
| Hosting       | Vercel (fastest) or Hetzner + Coolify (EU, data-protection-first) | Decide in ADR-001                                             |
| Analytics     | Plausible or PostHog EU (cookieless / EU-hosted)                  | Mandatory posture for a children's product                    |
| Monitoring    | Sentry (EU region), no PII                                        | Wire in early                                                 |

**Explicitly out of scope for the MVP** (per the docs, confirmed by this audit): native mobile
apps, microservices, Kubernetes, a self-hosted CMS, real-time features, community/forum,
leaderboards, AI tutor features.

### 3.3 Audit verdict on the proposed stack

The stack is appropriate, boring in the good sense, and consistent with the constraint set
(one developer-founder, children's privacy, EU market, evolve-don't-rewrite). Every specialist
lens on the virtual team reviewed it; the notable observations:

- **CTO / Cloud Architect:** the Vercel-vs-Hetzner choice is genuinely open and has data-
  residency implications; it must be an ADR, not a default (backlog F-3).
- **Database Architect:** Supabase vs. Neon changes the auth story (Supabase bundles Auth +
  RLS; Neon needs Auth.js). Decide together with the auth choice in the same ADR.
- **Security Engineer:** the "no third-party trackers in the child area" rule should be
  enforced by CI (CSP header test), not by convention (backlog C-4).
- **Frontend/A11y:** child-friendly UI is _more_ demanding than adult UI (reading level,
  target sizes, reduced text). An accessibility baseline belongs in the Definition of Done
  from Sprint 1, not retrofitted (see §21).

---

## 4. Architecture Review

There is no implemented architecture to review, so this section reviews the **proposed**
architecture from the planning documents against the requested principles.

### 4.1 Proposed system (Phase B target)

```
[Browser: child / parent / admin]
        │
        ▼
[Next.js monolith (Vercel or Hetzner)]
  ├─ Course/lesson rendering (SSG from MDX)
  ├─ Auth & roles (parent account + child profiles)
  ├─ Progress API
  └─ Minimal admin
        │
        ▼
[PostgreSQL (EU)]     [Object storage: Cloudflare R2 + Stream]
        │
[Stripe]              [Email: Resend/Postmark]
```

One deployable artifact, one database, no queues, no microservices. Content lives in Git as
MDX. Scaling (Phase C) is planned as _evolutionary extraction_ from the monolith (content
service/headless CMS, billing service, notification service, AI tutor service, event bus)
only when a concrete bottleneck exists.

### 4.2 Evaluation against principles

| Principle                       | Assessment                                                                                                                                                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KISS / YAGNI                    | **Excellent.** The docs explicitly defer microservices, CMS, mobile, AI, and even automation until pain is demonstrated ("manual until it costs >1 day/week").                                                                                                            |
| SOLID / separation of concerns  | Achievable in a Next.js monolith but **not automatic** — Next.js invites mixing data access into route handlers and components. Recommendation: a thin internal layering convention (route → service → repository) documented in CONTRIBUTING from day one (backlog F-5). |
| DRY                             | N/A yet; enforce via shared UI components and a single data-access layer.                                                                                                                                                                                                 |
| Clean/Hexagonal Architecture    | Full hexagonal architecture would be over-engineering at this size. A pragmatic "modular monolith" with feature folders and one dependency direction is the right calibration.                                                                                            |
| Domain-Driven Design            | The docs implicitly define clean bounded contexts: **Identity & Consent**, **Catalog/Content**, **Learning Progress**, **Billing**. Keep these as top-level modules; they are exactly the Phase C extraction seams.                                                       |
| Feature-based / Vertical slices | Recommended folder organization for the app code (e.g. `features/profiles`, `features/player`, `features/billing`).                                                                                                                                                       |
| Modular monolith readiness      | **High** — the plan is a modular monolith by design.                                                                                                                                                                                                                      |
| Microservice readiness          | Deliberately deferred; the `organization_id` field and event naming (`lesson.completed`) are sensible forward-compatibility hooks that cost nothing now.                                                                                                                  |

### 4.3 Architecture risks worth naming now (recommendations only, per Sprint 0 rules)

1. **MDX-as-CMS couples content deploys to code deploys.** Acceptable and even desirable in
   the MVP (CI validates content), but the content schema (frontmatter fields, widget props)
   should be validated in CI from the first lesson, or authoring errors become runtime errors
   (backlog C-2).
2. **Progress writes are the only hot write path.** Design the `LessonProgress` upsert to be
   idempotent from the start; children on flaky tablets will retry.
3. **Stripe webhooks are the only asynchronous integration.** They must be idempotent and
   signature-verified (the roadmap already says so — carry it into acceptance criteria, B-2).
4. **Multi-audience future (schools, companies)** is adequately covered by the unused
   `organization_id` recommendation. Do not build tenancy now.

---

## 5. Frontend Audit

**Current state: no frontend exists.** No routing, layouts, pages, components, state
management, forms, or styling system are present.

**Planned frontend** (from the docs): Next.js App Router pages, SSG lesson pages from MDX,
Tailwind + shadcn/ui, a child-oriented "learn player" (large targets, minimal text, streaming-
style profile switcher, immediate visual feedback), and a parent dashboard.

**Audit recommendations for when the frontend is born (Sprint 1–2):**

- **Accessibility (Accessibility Engineer):** target WCAG 2.1 AA as the floor. For children
  specifically: minimum 44×44 px touch targets, reading-age-appropriate copy, no time
  pressure, captions on all videos, full keyboard operability, `prefers-reduced-motion`
  respected. Add automated checks (eslint-plugin-jsx-a11y + Playwright + axe) to CI early.
- **Responsiveness:** tablets are likely the primary child device; design lesson layouts
  tablet-first, test at 768×1024 and small laptop sizes.
- **State management:** none needed beyond React Query/server components + a tiny client
  store for the active child profile. Do not add Redux et al.
- **Forms:** parent-facing only (registration, consent). react-hook-form + zod gives shared
  client/server validation schemas.

---

## 6. Backend Audit

**Current state: no backend exists.** No framework, services, controllers, routes,
middleware, authentication, authorization, validation, or business logic.

**Planned backend:** Next.js route handlers / server actions inside the monolith; auth via
Supabase Auth or Auth.js; Stripe webhooks; progress API.

**Audit recommendations:**

- **Authorization is the crown jewel.** Every query must be scoped to the authenticated
  parent account (`account_id`), and child-profile access must verify
  `child_profile.account_id = session.account_id`. This is the single most dangerous class of
  bug in this product (child data leakage across families). Make it structural: either
  Postgres Row Level Security (if Supabase) or a mandatory repository layer that takes the
  account context as a required parameter — never ad-hoc `where` clauses (backlog C-1).
- **Validation:** zod schemas at every route boundary, shared with the frontend.
- **Coupling / separation of concerns:** adopt the route → service → repository convention
  and feature folders (§4.2) before the first feature lands; retrofitting layering is the
  classic Next.js debt.
- **Rate limiting** on auth and progress endpoints from day one (middleware or platform
  feature).

---

## 7. Database Audit

**Current state: no database, ORM, migrations, schema, or entities exist.**

**Planned data model** (from `edtech-mvp-architektur.md`) — reproduced as an ER sketch:

```
Account (parent) 1──n ChildProfile
Account 1──n Subscription (Stripe mirror)
Account 1──n Enrollment n──1 Course
ChildProfile 1──n Enrollment            (enrollment names both account and child)
Course 1──n Lesson (ordered; content_ref → MDX path; type: lesson|task|project|hw_guide)
ChildProfile 1──n LessonProgress n──1 Lesson   (status: open|in_progress|done)
ChildProfile 1──n TaskSubmission n──1 Lesson   (JSON payload, optional media_url)
ChildProfile n──n Badge (via ChildBadge, Phase B+)
```

**Audit of the proposed model (Database Architect):** the model is sound — data-minimized
child records (nickname, avatar, birth _year_ only), contracts/payments on the parent,
content referenced by path rather than stored. Gaps to close when the schema is first
implemented (these become acceptance criteria in backlog stories, not changes made now):

1. **Uniqueness constraints:** `(child_profile_id, lesson_id)` unique on `LessonProgress`
   (enables idempotent upsert); `Account.email` unique; `Course.slug` and
   `(course_id, slug)` on `Lesson` unique; `(account_id, child_profile_id, course_id)`
   unique on `Enrollment`.
2. **Indexes:** FK indexes on every `account_id` / `child_profile_id` / `course_id` column;
   `LessonProgress(child_profile_id, lesson_id)` covers the hot path.
3. **Cascade & deletion design:** GDPR deletion is a feature (parent-triggered). Define
   `ON DELETE CASCADE` from Account → ChildProfile → progress/submissions explicitly, and
   decide what survives for accounting (Stripe records are kept at Stripe; local
   `Subscription` rows likely anonymized, not deleted). Needs a short design note (B-4).
4. **`organization_id`** nullable column on `Account` (or a future join table) reserved but
   unused — cheap forward compatibility for schools/companies.
5. **Migrations:** pick one tool (Prisma Migrate, Drizzle Kit, or Supabase migrations) in
   ADR-001; never mutate schema by hand.
6. **Anti-patterns to avoid:** storing MDX content in the DB (the doc already avoids this);
   JSON `payload` on `TaskSubmission` is fine, but version it (`payload_version`) so widget
   schema changes don't corrupt history.

---

## 8. Infrastructure Audit

**Current state: nothing exists.** No Docker, docker-compose, Kubernetes, Terraform, GitHub
Actions, or platform configuration of any kind. There is no deployment flow.

**Planned:** Vercel _or_ Hetzner+Coolify; Supabase/Neon Postgres (EU); Cloudflare R2/Stream;
CI with preview deployments (roadmap milestone B1).

**Recommendations:**

- **CI first, deploy second.** A GitHub Actions workflow (install → typecheck → lint → test →
  build) should be the first piece of infrastructure, landing with the scaffold in Sprint 1
  (F-4). Content validation (MDX lint, link check) joins in Sprint 2 (C-2).
- **The hosting ADR (F-3) is the one genuinely open infrastructure decision.** Decision
  drivers: data residency posture (Hetzner/EU strengthens the parent-facing privacy story),
  operational effort (Vercel is near-zero), cost at small scale (comparable), exit cost
  (Next.js is portable either way). Either answer is defensible; make it explicit.
- **Environments:** production + preview deployments are sufficient for the MVP. A separate
  staging environment is YAGNI until real customers migrate (milestone B4).
- **Backups:** managed-Postgres backups plus **one rehearsed restore** are explicitly (and
  correctly) required by roadmap Gate B1 — keep that as an acceptance criterion, it is the
  kind that silently gets dropped.
- **Secrets:** platform-managed env vars; `.env.example` in repo; no secrets in Git ever.
  (Nothing to remediate today — the repo contains no secrets; verified.)

---

## 9. Security Assessment

**Current exposure: minimal, because nothing runs.** Verified: no secrets, keys, or
credentials in the repository or its history (2 commits on `main`, docs-only side branch).
No dependencies exist, so there are no dependency vulnerabilities. There is no
authentication, authorization, or input handling to assess.

**Repository-level findings (actionable today):**

| #   | Severity | Finding                                                                                       | Recommendation                                                                                   |
| --- | -------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| S-1 | Medium   | Branch protection status for `main` unknown/likely absent; no CODEOWNERS, no required reviews | Enable branch protection + required CI once CI exists (Sprint 1)                                 |
| S-2 | Low      | No `SECURITY.md`, no dependabot/renovate config                                               | Add with the scaffold (F-4)                                                                      |
| S-3 | Info     | Apache-2.0 public repo will eventually contain paid course content (MDX-as-CMS)               | Product owner to confirm repo visibility/licensing strategy before content lands (F-1 follow-up) |

**Forward-looking assessment of the planned security posture:** the architecture document's
child-data section is unusually strong for a pre-code project — parent-only accounts, data
minimization (nickname/birth-year/avatar-from-set), no third-party trackers in the child
area, EU hosting, consent timestamps, deletion/export as first-class features, RLS/rate
limiting/argon2 named explicitly. This audit endorses it and converts it into backlog epic
**C (Compliance & Child Safety)** with these top risks carried into the risk register (§20):

- **Critical (if it ever occurs):** cross-account authorization failure exposing another
  family's child data (mitigation: structural authorization, C-1; tests in DoD).
- **High:** child PII collected without parental consent flow; public exposure of child
  project photo uploads (mitigation: uploads visible only in the parent dashboard, never
  public — already the documented plan).
- **High:** third-party trackers/embeds creeping into the child area (mitigation: CSP
  enforced and CI-tested, C-4; no YouTube embeds).
- **Medium:** US data transfers without a legal basis; missing deletion concept (mitigation:
  EU-region services and B-4 deletion/export story).
- **Medium:** Stripe webhook forgery/replay (mitigation: signature verification +
  idempotency, acceptance criteria on B-2).

No fixes were applied in Sprint 0 (none are applicable to an empty repository).

---

## 10. Performance Assessment

**Current state: N/A — nothing to measure.** No bundles, queries, caches, or endpoints exist.

**Forward-looking assessment of the planned architecture:**

- **Strengths:** SSG for lesson content is the single best performance decision available —
  lessons become static pages on a CDN; the only dynamic traffic is auth, progress
  read/write, and Stripe. For the MVP's scale (tens to hundreds of families) there is no
  plausible bottleneck.
- **Watchpoints to bake into acceptance criteria (not build now):**
  - _N+1 risk:_ the parent dashboard (progress for n children × m courses) is the first
    query that tempts an N+1; write it as one aggregate query.
  - _Video:_ never self-host; Cloudflare Stream/Mux with adaptive bitrate (already planned).
  - _Images in lessons:_ use Next.js image optimization from the first lesson.
  - _Bundle discipline:_ interactive MDX widgets should be client components loaded per
    lesson, not a global bundle; set a soft budget (e.g. <200 KB JS on lesson pages) in the
    DoD.
  - _Progress writes:_ idempotent single-row upserts; no fan-out.

Performance budgets belong in the Definition of Done (§21) rather than in tooling today.

---

## 11. Code Quality Assessment

**Current state: N/A — there is no code.** No naming, complexity, duplication, dead code, or
dependency findings are possible.

**Standards recommended for Sprint 1 onward (Engineering Standards deliverable):**

| Area           | Standard                                                                                                 |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| Formatting     | Prettier, default config, enforced in CI (no debates)                                                    |
| Linting        | ESLint (next/core-web-vitals) + typescript-eslint strict + jsx-a11y                                      |
| Types          | TypeScript `strict: true` from the first commit; no `any` without a comment                              |
| Testing        | Vitest (unit), Playwright (E2E); testing pyramid per §21                                                 |
| Commits        | Conventional Commits (`feat:`, `fix:`, `docs:`…) — enables changelogs later                              |
| Pull requests  | Small PRs to `main` via required review + green CI; PR template with a "child-data impact" checkbox      |
| Documentation  | README + CONTRIBUTING + ADRs in `docs/adr/` (MADR format); every architectural decision gets an ADR      |
| Error handling | Typed error results at service boundaries; user-facing errors are child-appropriate; Sentry for the rest |
| Logging        | Structured logs, **no PII ever** (child data makes this non-negotiable); log levels via env              |
| Env & config   | Single `env.ts` with zod validation at boot; `.env.example` maintained; fail fast on missing config      |
| Feature flags  | Plain env-var flags in MVP; no flag service (YAGNI)                                                      |
| Secrets        | Platform secret manager only; secret scanning enabled on the repo                                        |
| Dependencies   | Renovate/Dependabot weekly; prefer few, boring dependencies; lockfile committed                          |

---

## 12. Existing Product Features

Audited against the requested feature checklist:

| Feature                     | Status                                                                                                           |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Authentication              | ❌ Not implemented (planned: parent-only accounts)                                                               |
| Courses / Lessons           | ❌ Not implemented (planned: MDX pipeline + learn player)                                                        |
| Users / Profiles            | ❌ Not implemented (planned: parent account + child profiles)                                                    |
| Admin panel                 | ❌ Not implemented (planned: minimal — user search, manual enrollment, progress reset)                           |
| CMS                         | ❌ Not implemented (planned: Git/MDX **is** the CMS)                                                             |
| Progress tracking           | ❌ Not implemented (planned: LessonProgress + progress bars)                                                     |
| Assignments / submissions   | ❌ Not implemented (planned: task widgets + TaskSubmission)                                                      |
| Payments                    | ❌ Not implemented (planned: Stripe Checkout + webhooks + Customer Portal)                                       |
| Notifications / Email       | ❌ Not implemented (planned: transactional via Resend/Postmark; weekly parent report)                            |
| Analytics / Dashboards      | ❌ Not implemented (planned: Plausible/PostHog EU; SQL-based internal reporting)                                 |
| Parent accounts             | ❌ Not implemented (planned — core concept)                                                                      |
| Gamification / Achievements | ❌ Not implemented (planned: light badges; **leaderboards deliberately excluded**)                               |
| Leaderboards                | 🚫 Deliberately out of scope (comparison pressure + privacy)                                                     |
| Hardware integration        | ❌ Not implemented (planned: Pi guides as content — checklists + parts lists, **no device connectivity** in MVP) |

**The only existing product assets are the two planning documents.** They are current
(July 2026), mutually consistent, and consistent with the stated product vision.

## 13. Missing MVP Features (MoSCoW)

Everything is missing; what matters is the cut. Based on the planning docs and the
"children learning programming" MVP focus:

- **Must Have:** parent registration/login/reset + email verification; consent flow with
  stored timestamps; child profiles (nickname, avatar picker, birth year) with streaming-
  style switcher; MDX content pipeline with CI validation; learn player (lesson view,
  next-navigation, video embed, resume position); task widgets v1 (multiple choice with
  instant feedback, "done" checklist); per-course progress; Stripe checkout + webhook-driven
  enrollment; parent dashboard (progress, subscription via Stripe portal, consents); data
  export + account/profile deletion with cascade; transactional emails; minimal admin;
  Sentry + EU analytics; one complete pilot course.
- **Should Have:** photo upload on project tasks (parent-dashboard-visible only); simple
  badges; weekly parent email report; second course through the pipeline (proves content
  scalability).
- **Could Have:** avatar variety, printable certificates for parents, basic i18n scaffolding
  (content is German-first).
- **Won't Have (this MVP):** mobile apps; community/forum/galleries; leaderboards; AI
  tutor; self-serve authoring portal; school/company tenancy; real device connectivity to
  the Raspberry Pi; additional learning paths (Python, JS, Rust, PLC/FUP/KOP, robotics,
  electronics, AI, Linux, networking — future paths only need to be _representable_ in the
  course data model, which they are: a course is a course).

---

## 14. Technical Debt

For an empty repository the debt list is short, real, and cheap — all are quick wins:

| #   | Item                                                                                                                                         | Type    | Effort | Priority                                        |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------ | ----------------------------------------------- |
| D-1 | Planning docs stranded on unmerged branch `claude/edtech-mvp-architecture-g7xozh` — invisible on `main`, at risk of divergence               | Process | XS     | High                                            |
| D-2 | `.gitignore` is a Rust template contradicting the documented Next.js/TS stack — misleads every future contributor about the project's nature | Config  | XS     | High                                            |
| D-3 | No README — repository communicates nothing about what `rhino` is                                                                            | Docs    | S      | High                                            |
| D-4 | Planning docs are German-only; if any collaborator/contractor is non-German-speaking, the architecture is opaque to them                     | Docs    | S      | Medium (defer until a non-German reader exists) |
| D-5 | No ADR structure — the stack recommendation lives in prose and was never formally accepted; the Rust-vs-TS ambiguity (D-2) is a symptom      | Process | S      | High                                            |
| D-6 | No branch protection / required checks on `main`                                                                                             | Process | XS     | Medium (meaningful once CI exists)              |

There is no legacy code, fragile code, dead code, duplication, or deprecated dependency —
the codebase's greatest current asset is that it has no debt to carry into Sprint 1.

---

## 15. Documentation Review

**Existing documentation:**

| Document                    | Location    | Assessment                                                                                                                        |
| --------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `edtech-mvp-architektur.md` | side branch | High quality: options analysis, stack rationale, data model, privacy/GDPR Art. 8 strategy, scaling sketch, build/buy/manual rules |
| `roadmap-phase-a-b.md`      | side branch | High quality: milestone plan with explicit, testable gates                                                                        |
| `LICENSE`                   | `main`      | Apache-2.0, fine                                                                                                                  |

**Missing documentation (in priority order):**

1. **README** — created in this sprint (see repository root).
2. **ADRs** — `docs/adr/` with ADR-001 (stack + hosting + auth provider ratification) as the
   first entry; template: MADR (F-3).
3. **CONTRIBUTING** — layering conventions, standards from §11 (F-5, Sprint 1).
4. **Environment/setup docs** — `.env.example` + local dev guide (with the scaffold, F-4).
5. **API documentation** — deferred; the API is internal to the monolith in the MVP.
6. **Deployment guide / runbook** — with the first deploy (Sprint 1).
7. **Content authoring guide** — how to write a lesson in MDX (Sprint 2, with C-2).
8. **Records of processing / privacy docs (GDPR)** — start in Sprint 3 alongside billing;
   legally required before real customer data arrives (roadmap milestone B4 checklist).

---

## 16. Recommended Improvements

Ordered, smallest first; items 1–3 are Sprint 0/1 housekeeping, the rest fold into the backlog:

1. **Merge the planning-docs branch into `main`** (D-1) and treat those docs as living
   architecture documentation.
2. **Replace the Rust `.gitignore`** with a Node/Next.js one when the scaffold lands (D-2) —
   done as part of F-4 rather than as a standalone change, per the "avoid unnecessary code
   changes" rule of Sprint 0.
3. **Adopt ADRs; write ADR-001** ratifying stack, hosting (Vercel vs. Hetzner), database
   provider (Supabase vs. Neon), and auth (Supabase Auth vs. Auth.js) — the three genuinely
   open pairs of options in the architecture doc (F-3).
4. **Scaffold with quality gates on day one** (F-4): TypeScript strict, ESLint+Prettier,
   Vitest, Playwright, GitHub Actions, `.env.example`, branch protection (S-1, D-6).
5. **Make authorization structural, not conventional** (C-1) — RLS or a context-requiring
   repository layer; plus cross-account access tests in the DoD.
6. **Enforce the child-area tracker ban with a CSP tested in CI** (C-4).
7. **Validate content in CI from the first lesson** (C-2): MDX schema (frontmatter, widget
   props), link check.
8. **Confirm the Phase A gate status with the product owner** before Sprint 1 feature work
   (risk R-1, §20) — engineering can build the foundation either way, but the roadmap's own
   rule says custom development starts only after validation.

---

## 17. Product Backlog

Story-point scale: Fibonacci (1, 2, 3, 5, 8, 13). Priorities: P0 (blocking) → P3.
The backlog is organized under six epics (detailed in §18):

| ID  | Story                                                                                                                                        | Epic       | Priority | Points | Depends on |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------- | ------ | ---------- |
| F-1 | Merge planning docs to `main`; confirm repo visibility/licensing intent                                                                      | Foundation | P0       | 1      | —          |
| F-2 | Kernel decisions: confirm Phase A gate status with product owner                                                                             | Foundation | P0       | 1      | —          |
| F-3 | ADR-001: ratify stack, hosting, DB provider, auth provider                                                                                   | Foundation | P0       | 2      | F-2        |
| F-4 | Scaffold app: Next.js+TS strict, lint/format, Vitest, Playwright, GitHub Actions CI, `.env.example`, correct `.gitignore`, branch protection | Foundation | P0       | 5      | F-3        |
| F-5 | CONTRIBUTING: layering convention (route→service→repo), feature folders, standards                                                           | Foundation | P1       | 2      | F-4        |
| F-6 | Provision Postgres (EU) + migration tooling + core schema v1 with constraints/indexes per §7                                                 | Foundation | P0       | 5      | F-3        |
| F-7 | Deploy pipeline: production + preview deployments; Sentry EU wired; backup restore rehearsed                                                 | Foundation | P0       | 5      | F-4        |
| A-1 | Parent registration, login, logout, password reset, email verification                                                                       | Accounts   | P0       | 8      | F-6        |
| A-2 | Consent flow: terms + child-data consent with stored timestamps                                                                              | Accounts   | P0       | 3      | A-1        |
| A-3 | Child profiles: create/edit (nickname, avatar from set, birth year), max n per account                                                       | Accounts   | P0       | 5      | A-1        |
| A-4 | Streaming-style profile switcher; active-profile session context                                                                             | Accounts   | P0       | 3      | A-3        |
| A-5 | Rate limiting on auth endpoints; argon2/bcrypt hashing (if Auth.js path)                                                                     | Accounts   | P1       | 2      | A-1        |
| L-1 | MDX content pipeline: course/lesson structure, frontmatter schema, build-time generation                                                     | Learning   | P0       | 8      | F-4        |
| L-2 | Learn player: lesson view, next-navigation, resume at last position                                                                          | Learning   | P0       | 8      | L-1, A-4   |
| L-3 | Video embedding via Cloudflare Stream/Mux (no third-party trackers)                                                                          | Learning   | P1       | 3      | L-1        |
| L-4 | Task widgets v1: multiple choice with instant feedback; "done" checklist                                                                     | Learning   | P0       | 5      | L-2        |
| L-5 | Progress tracking: idempotent lesson completion, per-course progress bar                                                                     | Learning   | P0       | 5      | L-2        |
| L-6 | Pilot course fully migrated to MDX incl. Pi guide (checklists, parts list)                                                                   | Learning   | P0       | 8      | L-1, L-4   |
| L-7 | Project photo upload — visible only in parent dashboard, never public                                                                        | Learning   | P2       | 5      | L-4, P-1   |
| B-1 | Stripe Checkout (subscription and/or one-time) + Customer Portal link                                                                        | Billing    | P0       | 5      | A-1        |
| B-2 | Stripe webhooks → enrollment on purchase, revoke on cancel/failure (idempotent, signature-verified)                                          | Billing    | P0       | 5      | B-1, F-6   |
| B-3 | Transactional email: purchase confirmation, password reset, course-completed                                                                 | Billing    | P1       | 3      | B-1        |
| B-4 | Data export (JSON/CSV) + account/profile deletion with cascade, parent-triggered                                                             | Billing    | P0       | 5      | A-3        |
| P-1 | Parent dashboard: per-child progress, subscription management, consents view                                                                 | Parent     | P0       | 5      | L-5, B-1   |
| P-2 | Weekly parent progress report email (cron + template)                                                                                        | Parent     | P2       | 3      | P-1        |
| P-3 | Minimal admin: user search, manual enrollment toggle, progress reset                                                                         | Parent     | P1       | 5      | A-1, L-5   |
| C-1 | Structural authorization: RLS or account-scoped repository layer + cross-account access tests                                                | Compliance | P0       | 5      | F-6        |
| C-2 | Content validation in CI: MDX schema, link check                                                                                             | Compliance | P1       | 3      | L-1        |
| C-3 | EU analytics (Plausible/PostHog EU), cookieless; no trackers in child area                                                                   | Compliance | P1       | 2      | F-7        |
| C-4 | CSP enforcing the child-area tracker ban, asserted by a CI test                                                                              | Compliance | P1       | 3      | F-7        |
| C-5 | GDPR paperwork: records of processing, DPAs collected, privacy policy pages                                                                  | Compliance | P1       | 3      | B-4        |
| G-1 | Simple badges ("first lesson", "course completed")                                                                                           | Growth     | P2       | 3      | L-5        |
| G-2 | Second course published via pipeline with zero code changes                                                                                  | Growth     | P2       | 5      | L-6        |
| G-3 | Metrics-light: 5–6 SQL queries for activation, completion, churn                                                                             | Growth     | P2       | 2      | L-5, B-2   |

Total: ~135 points. At an assumed 20–25 points per two-week sprint for a 1–2 person team,
this is ~5–6 sprints of work, consistent with the roadmap's 14-week Phase B estimate.

---

## 18. Epic Breakdown

**Epic F — Foundation & Infrastructure** (23 pts)
_Goal:_ a deployable, CI-guarded, correctly configured skeleton with a migrated schema.
_Why first:_ everything depends on it; roadmap milestone B1's infrastructure half.
Acceptance (epic level): CI green on every PR; preview deployments work; schema v1 migrated
with constraints from §7; a backup restore has been performed once; ADR-001 merged.

**Epic A — Accounts, Profiles & Consent** (21 pts)
_Goal:_ parents register and consent; children get data-minimized profiles with a
streaming-style switcher.
_Why early:_ the privacy-by-design core that is "hard to retrofit"; roadmap Gate B1 is
literally "a parent registers, creates two child profiles, and switches between them, in
production".
Acceptance: Gate B1 wording passes in production; consent timestamps stored; no child
email/full-name/birth-date fields exist anywhere in the schema.

**Epic L — Learning Experience (Content Pipeline + Player + Progress)** (42 pts)
_Goal:_ a child can work through the full pilot course with progress that survives
logout/login and device switches.
Acceptance: roadmap Gate B2 wording passes with a real test child; lesson pages are SSG;
progress upserts idempotent.

**Epic B — Billing & Data Rights** (18 pts)
_Goal:_ purchase-to-cancellation lifecycle fully automated; parents can export and delete.
Acceptance: roadmap Gate B3 — full Stripe test-mode cycle without errors; deleting a test
account demonstrably removes all associated data.

**Epic P — Parent Dashboard & Admin** (13 pts)
_Goal:_ parents see progress and manage the relationship; founder has a minimal admin.
Acceptance: parent dashboard shows all children's progress in one aggregate query (no N+1);
admin can enroll/reset manually.

**Epic C — Compliance & Child Safety** (16 pts)
_Goal:_ the privacy promises are enforced by structure and CI, not by convention.
Acceptance: cross-account access tests in CI; CSP test proves no third-party requests from
child pages; GDPR paperwork exists before customer migration.

**Epic G — Growth & Retention Basics** (10 pts)
_Goal:_ light gamification, second course, weekly parent report, basic metrics.
Acceptance: roadmap Gate B→C measurables are queryable.

---

## 19. Sprint Roadmap

Two-week sprints; capacity assumption 20–25 pts (1–2 engineers). Maps to roadmap milestones
B1–B5. **Precondition: F-2 (Phase A gate confirmation) resolved before Sprint 1 planning.**

| Sprint                               | Objective                                                    | Stories                     | Milestone       |
| ------------------------------------ | ------------------------------------------------------------ | --------------------------- | --------------- |
| **Sprint 1 — Foundation**            | Decisions ratified; deployable skeleton; schema; auth begins | F-1..F-7, C-1 (start)       | B1 (infra half) |
| **Sprint 2 — Accounts & Consent**    | Gate B1 passes in production                                 | A-1..A-5, C-1 (done), C-3   | B1 complete     |
| **Sprint 3 — Content & Player**      | Pilot course playable end-to-end with progress               | L-1..L-6, C-2               | B2              |
| **Sprint 4 — Billing & Data Rights** | Gate B3: full purchase lifecycle + export/deletion           | B-1..B-4, C-4, C-5          | B3              |
| _(Sprint 5)_                         | Parent dashboard, admin, photo upload, launch prep           | P-1, P-3, L-7, C-5 finish   | B3/B4           |
| _(Sprint 6)_                         | Beta, migration, launch; badges, report, second course       | B4 checklist, G-1..G-3, P-2 | B4/B5           |

Sprints 5–6 are shown for context; only 1–4 are committed by this report, per the deliverable
spec. If capacity is a single part-time founder, double the calendar (the roadmap doc itself
says so).

---

## 20. Risk Register

| ID   | Risk                                                                                                                                                                                                        | Likelihood               | Impact   | Mitigation                                                                                                                                       | Priority |
| ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| R-1  | **Building before validating:** the project's own roadmap gates custom development on Phase A (≥10 paying families). Starting Sprint 1 feature work without a Go decision risks months of unvalidated build | Medium                   | High     | F-2: explicit product-owner confirmation that Phase A passed, is running in parallel, or is deliberately waived — documented in ADR/decision log | **P0**   |
| R-2  | Cross-account authorization bug exposes one family's child data to another                                                                                                                                  | Medium (if conventional) | Critical | C-1 structural authorization; cross-account tests in DoD; security review before B4 migration                                                    | **P0**   |
| R-3  | Child PII handled without valid parental consent (GDPR Art. 8)                                                                                                                                              | Low (design is good)     | Critical | A-2 consent flow with timestamps; data-minimized schema; C-5 paperwork                                                                           | P1       |
| R-4  | Third-party trackers/embeds enter the child area via a dependency or embed                                                                                                                                  | Medium                   | High     | C-4 CSP + CI test; no-YouTube rule; dependency review                                                                                            | P1       |
| R-5  | Solo-founder bus factor and capacity volatility                                                                                                                                                             | High                     | High     | Boring stack, managed services, small sprints, docs current; nothing exotic to hand over                                                         | P1       |
| R-6  | Stripe webhook mishandling (missed/duplicated events) grants or revokes access wrongly                                                                                                                      | Medium                   | Medium   | B-2 idempotency + signature verification + replay tests                                                                                          | P2       |
| R-7  | MDX content pipeline schema drift breaks lessons at runtime                                                                                                                                                 | Medium                   | Medium   | C-2 CI validation from first lesson; versioned widget payloads                                                                                   | P2       |
| R-8  | Public repo + MDX-as-CMS leaks paid course content                                                                                                                                                          | Medium                   | Medium   | F-1 visibility decision: private repo or separate private content repo                                                                           | P2       |
| R-9  | Hosting/provider choice churn (Vercel↔Hetzner, Supabase↔Neon) after code is written                                                                                                                         | Low                      | Medium   | F-3 ADR-001 decides once, with drivers recorded; portable choices (Next.js, Postgres) keep exit cost low                                         | P3       |
| R-10 | Planning docs (German, side branch) diverge from what gets built                                                                                                                                            | Medium                   | Low      | F-1 merge; docs updated in the same PR as behavior changes (DoD)                                                                                 | P3       |

---

## 21. Definition of Done

Applies to every story from Sprint 1 onward. A story is Done only when:

**Code quality**

- TypeScript strict passes; ESLint/Prettier clean; CI green.
- Follows the layering convention (route → service → repository) and feature-folder layout.
- No `any` without justification; no TODOs without a linked backlog item.

**Testing**

- Unit tests for service-layer logic; integration tests for API routes touching the DB.
- **Every endpoint that reads or writes account/child data has a cross-account
  authorization test** (attempt access with a different account → 403/404).
- E2E (Playwright) for the story's happy path when it is user-facing.
- No failing or skipped tests on `main`.

**Security & privacy**

- Input validated with zod at the boundary; no PII in logs or Sentry.
- No new third-party requests from child-area pages (CSP test passes).
- Schema changes reviewed against data-minimization rules (no child email/full name/DOB).

**Accessibility**

- Keyboard operable; axe checks pass; touch targets ≥44 px in child UI; captions on video.

**Performance**

- Lesson pages remain statically generated; no N+1 introduced (checked in review);
  lesson-page JS stays under the agreed budget.

**Documentation & deployment**

- README/CONTRIBUTING/ADRs updated if behavior or decisions changed; `.env.example` current.
- Migrations are forward-only and applied in preview; feature works on a preview deployment.
- Reviewed and merged to `main` via PR with green CI; deployable at all times.

---

## 22. Sprint Review (Sprint 0)

**Sprint goal:** understand everything before changing anything. **Achieved.**

**Delivered:**

- Complete repository discovery: `main` is pre-code; all prior work identified (two planning
  docs on a side branch); no issues/PRs; no secrets in history.
- This 24-section engineering report, including audits of every requested dimension (with
  honest "N/A — does not exist yet" verdicts where applicable), a review of the _proposed_
  architecture, a 33-story product backlog under 7 epics (~135 pts), a 4-sprint roadmap
  mapped to the existing milestone plan, a 10-item risk register, and a Definition of Done.
- A README for the repository (previously missing — created as permitted "create missing
  documentation" work).

**Deliberately not done (per Sprint 0 constraints):** no code scaffolding, no `.gitignore`
replacement, no merging of the side branch (it belongs to another line of work; merging is
backlog item F-1 and a product-owner call), no fixes of any kind — there was nothing broken
to trivially fix.

## 23. Sprint Retrospective (Sprint 0)

**What went well**

- Discovery was fast and exhaustive because the surface is small; zero ambiguity remains
  about the repo's true state.
- The pre-existing planning documents are high quality and removed the need to invent an
  architecture — Sprint 0 could _validate and operationalize_ instead of speculate.
- The audit found the plan and the stated product vision to be mutually consistent.

**What was learned**

- The most important risks here are not technical; they are sequencing (R-1: build vs.
  validate) and child-data safety (R-2/R-3). Both are addressable by process decisions
  before code exists — the cheapest possible time.
- Two artifacts contradict each other (Rust `.gitignore` vs. TS stack); small, but it shows
  decisions aren't yet captured where contributors look. Hence ADRs (F-3, D-5).

**What to improve going forward**

- Capture decisions as ADRs in-repo rather than in chat/branches.
- Keep planning docs on `main` and evolve them with the code (DoD covers this).
- Establish the English-vs-German documentation policy when the first additional
  contributor joins (D-4).

## 24. Recommendation for Sprint 1

**Sprint goal:** _"A deployable, CI-guarded foundation with ratified decisions and the core
schema — ready for accounts."_

**Before planning:** resolve F-2 (Phase A gate status) with the product owner. This is a
one-conversation item and de-risks the entire build (R-1).

**Committed scope (≈21 pts):**

1. **F-1** Merge planning docs to `main`; decide repo visibility (1)
2. **F-3** ADR-001: stack, hosting, DB provider, auth provider (2)
3. **F-4** Scaffold: Next.js + TS strict, ESLint/Prettier, Vitest, Playwright, GitHub
   Actions, `.env.example`, corrected `.gitignore`, branch protection (5)
4. **F-6** Postgres (EU) + migrations + schema v1 with the §7 constraints (5)
5. **F-7** Deploy pipeline + Sentry EU + rehearsed backup restore (5)
6. **F-5** CONTRIBUTING with layering/standards (2)
7. **C-1 (start)** Structural authorization approach decided and spiked (in-sprint spike)

**Sprint 1 exit criteria:** CI green on PRs; a preview and a production deployment exist;
`SELECT 1` through the app against the EU database; schema v1 migrated; one backup restored
successfully; ADR-001 and CONTRIBUTING merged; team (even a team of one) can start A-1 on
day 1 of Sprint 2 with zero setup friction.

This positions Sprint 2 to pass the project's own Gate B1 — "a parent registers, creates two
child profiles, and switches between them, in production" — which is the first moment the
platform becomes demonstrably real.

# rhino

An EdTech platform for **self-paced learning**, starting with children learning programming
through practical projects (first learning path: Raspberry Pi). Future audiences (teens,
career changers, adults, seniors, schools, companies) and paths (Python, JavaScript, Rust,
PLC, robotics, electronics, AI, Linux, networking) are part of the long-term vision but out
of scope for the first MVP.

## Current status

**Pre-code / planning stage.** No application has been built yet. The repository currently
contains planning and audit documentation:

| Document | Purpose |
|---|---|
| [`docs/sprint-0-report.md`](docs/sprint-0-report.md) | Sprint 0 engineering audit: repository discovery, architecture review, product backlog, sprint roadmap, risk register, Definition of Done |
| `docs/edtech-mvp-architektur.md` (branch `claude/edtech-mvp-architecture-g7xozh`) | MVP architecture: tech stack, data model, child-data privacy strategy, build/buy/manual rules (German) |
| `docs/roadmap-phase-a-b.md` (same branch) | Phase A (no-code validation) and Phase B (custom build) milestone roadmap with Go/No-Go gates (German) |

## Planned architecture (summary)

A single **Next.js (TypeScript) monolith** with **PostgreSQL (EU region)**, course content
authored as **MDX in this repository** (Git is the CMS), **Stripe** for billing, and managed
services for video, email, analytics, and monitoring. Parents own the accounts; children get
data-minimized profiles (nickname, avatar, birth year only) — privacy by design under GDPR
Art. 8 is a product core, not an afterthought.

See the Sprint 0 report for the full technology stack, backlog, and roadmap.

## Next steps

Sprint 1 (foundation): ratify stack decisions in ADR-001, scaffold the application with CI
and quality gates, provision the database, and set up the deploy pipeline. Details in
[`docs/sprint-0-report.md`](docs/sprint-0-report.md), section 24.

## License

[Apache License 2.0](LICENSE)

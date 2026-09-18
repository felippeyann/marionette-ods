# MARIONETTE · unified revenue data platform (demo)

> The platforms are puppets. The intelligence lives in the data.

**Live demo:** https://felippeyann.github.io/marionette-ods/

Marionette is an interactive, fully synthetic demo of an **operational data store (ODS)** for revenue teams: one governed platform that ingests commercial SaaS (CRM, marketing automation) and Brazilian regulatory sources (**CVM, ANCORD, BCB-SGS**, public sanction lists), resolves identities into a golden record, scores leads, evaluates sales meetings with LLMs under deterministic scoring, and then **writes decisions back** into the commercial platforms, using them as execution puppets while the intelligence stays in the data layer.

Everything on screen belongs to **Alvor Capital**, a fictitious investment advisory. Every record is generated in the browser from a fixed seed (`assets/datakit.js`): same seed, same world, so the numbers agree across modules by construction. Nothing here is real data and nothing leaves your browser.

## Modules

| Module | Status | What it shows |
|---|---|---|
| Overview | live | North-star metrics, commercial funnel, live write-back feed, source health |
| Integrations & sync health | live | Source map with lag/volume/error, documented false alarms per integration, dead-letter queue with simulated retry |
| Golden Record (MDM) | planned | Entity search, field provenance and sovereignty, 3-layer identity resolution, quarantine and merge walkthrough |
| Puppeteer (write-back) | planned | ODS decisions (fill/merge/keep/suggest), before/after diffs, queue with locks and retries, overwrite protection |
| Revenue Intelligence | planned | Config-driven lead scoring with per-dimension breakdown, LLM meeting evaluation with deterministic scoring |
| Engineering Observability | planned | Cron and queue health, LLM token/cost ledger with P95 latency, migrations gate |
| Architecture | planned | End-to-end system diagram and engineering decisions |

## Design notes

- **No backend, no build.** Single-file HTML + vanilla JS + ECharts, served as static files. The source you are reading is the artifact.
- **One synthetic world.** All pages read the same seeded generator, which is what makes it feel like a platform instead of disconnected mockups.
- **EN/PT and light/dark** are first-class: the shell drives both across pages.
- Regulatory sources keep their real names because integrating public Brazilian regulatory data is the point; commercial vendors stay generic on purpose.

## Provenance

Built by [Felippe Yann](https://felippeyann.github.io/) as a portfolio demonstration of data platform engineering patterns: operational data stores, master data management, reverse ETL and LLM observability. It reimplements *patterns* from scratch with synthetic data; it contains no code, data or documents from any employer or client.

MIT License.

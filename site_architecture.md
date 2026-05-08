# College Outcome Analyst — Site Architecture

**Status:** **National build complete — 50 states + DC + PR (52 jurisdictions).** Multi-vintage history wired through every entity, anomaly engine running, deterministic templates. Architecture mirrors the pollution-analyst stack (federal-data-only, no LLM), with a college-outcome-specific three-tier hierarchy (state → city → institution → program).

**National coverage:** 5,059 Title-IV main-campus institutions · 204,101 program × institution × credential entity pages · 29 years of history (1996–2024) · ~211,000 published JSON payloads in `data/published/`.

**Companion docs:**
- [`page_templates.md`](page_templates.md) — per-template section breakdowns + payload contract.
- [`roi_calculator.md`](roi_calculator.md) — ROI calculator design (Mincer projection, Dale-Krueger toggle, schema, methodology). Embedded as a section on Program and Institution templates; constants in `data/published/roi_constants.json`.

## Positioning

Trend intelligence and entity reference for **college outcomes** — earnings, debt, completion — drawn directly from federal records.

- **Federal-only sourcing:** College Scorecard (institution-level + Field of Study + 1996–2010 historical bulk archive) + IPEDS HD2023. No PayScale, no Niche, no reviews, no rankings inferred from non-federal proxies.
- **Descriptive, not predictive.** No earnings forecasts. No causal claims. Earnings are reported as "graduates of X earned a median of $Y," never "X causes you to earn $Y."
- **Suppression-honest.** Federal privacy rules suppress small-cohort cells; we render those as em-dashes rather than imputing.
- **Deterministic templates.** No LLM in the loop. Template prose only. Rationale: annual cadence + causal-claim risk on outcomes data + 36k+ program pages → defensibility wins over freshness.

## Live Coverage (national)

| Tier | Count |
|---|---|
| State hubs | 52 (50 states + DC + PR) |
| City hubs | **2,445** (places with ≥1 institution) |
| Institution entity pages | **5,059** (Title-IV, main-campus only) |
| Programs (rendered as embedded grid on institution pages — see "Program consolidation" below) | 204,101 |
| Static (home, methodology, /rankings/states, /rankings/cities, /rankings/institutions, /rankings/programs) | 8 |
| **Total Next.js routes generated** | **7,564** |

Pipeline run time: ~3 minutes per state (warm cache); ~3 hours sequential for all 51 + DC + PR. Static build of the 7,564 pages: 37.6 seconds in 12 workers. Output: 2.2 GB in `.next/`. Underlying JSON corpus: 211k files, 2.5 GB in `data/published/`.

## Program consolidation (2026-05-08)

The per-program standalone route `/state/[state]/institution/[slug]/program/[program]` was removed. Reason: returning 204,101 entries from `generateStaticParams` triggered a stack overflow during Next.js's `Collecting page data` phase. Programs are now embedded as a CIP-family-grouped grid inside the institution page, drawing from `programs_by_family` in the institution payload — same data, no separate route. The 204k program JSONs in `data/published/program/` remain on disk for future use (peer-comparison sections, ROI calculator inputs, etc.).

## Multi-Vintage History (the v2 difference)

The first build was single-vintage; this build threads history arrays through every payload using a three-source merge.

| Source | Vintages | Years covered |
|---|---|---|
| College Scorecard institution-level — bulk MERGED files | **14** | 1996–97 → 2009–10 (`MERGED<year>_<year+1>_PP.csv`) |
| College Scorecard institution-level — **API** (api.data.gov) | **23** | 2002 → 2024 cohort years (Treasury earnings + completion + tuition + debt + default + enrollment + retention + admission + Pell) |
| College Scorecard institution-level — current snapshot | 1 | May 2025 release (`Most-Recent-Cohorts-Institution_05192025.csv`); same as API's `latest.<metric>` resolver |
| College Scorecard Field-of-Study — historical | **6** | 2014–15 → 2019–20 (`FieldOfStudyData<...>_PP.csv`) |
| College Scorecard Field-of-Study — current | 1 | 2025 most-recent |
| IPEDS HD | 1 | 2023 (institution directory) |

**Continuous range now covered:** 1996 – 2024 institution-level (29 years), with API filling the 2010–2024 gap that bulk MERGED files don't ship. Verified on Reed College: 27-point completion history through 2023, 27-point enrollment history, 24-point tuition history ($25k → $67k, +168% long-arc), 9-point earnings history.

**About 2025:** the May 2025 release file is named "Most-Recent-Cohorts" and the API exposes a `latest.<metric>` resolver, but **there is no "2025 cohort year" yet** — the 2025 academic year isn't complete and outcomes for it haven't been published. `latest.` and the Most-Recent-Cohorts CSV both resolve per-metric to the most-recent-non-null cohort year (2024 for fast-cycling metrics like enrollment / completion / tuition / default; earlier years for slow-cycling Treasury earnings and median debt). The next "real" 2025 cohort vintage will appear in the Sept 2026 release.

**Cohort cadence by metric** (when each metric's cohort year T becomes available):
- Enrollment, completion, tuition, default rate → ~12 months after T
- Median debt → ~24 months after T (graduate cohort + clearing)
- Treasury earnings 6yr → ~9 years after T (entrants in T who completed and worked 6 years)
- Treasury earnings 8yr / 10yr → ~11–13 years after T

This is why the 2024 cohort surfaces enrollment / completion / tuition values immediately but Treasury earnings 10yr won't reach the 2024 cohort until ~2035.

**What history drives:**
- **Sparklines** on every institution card — completion-rate, enrollment, tuition, retention, debt, earnings — up to 28-vintage spans.
- **Hero charts** at state / city / institution level.
- **Long-arc shifts** — descriptive multi-year change detection. Reed alone surfaces 8 detected shifts (completion +30% since 1997, tuition +168% since 2000, debt +134% since 1997, 10-yr earnings +65% since 2007, etc.). Past-tense only; never predictive.
- **Earnings progression** at institution level (4 → 5 → 6 → 8 → 10 yr post-entry, Treasury-reported).
- **Earnings trends** at program level (5-yr earnings across 6 FoS vintages).

**API key:** required to populate the 2002–2023 institution-level history. Free key from `https://api.data.gov/signup/`, set in project-root `.env` as `COLLEGE_SCORECARD_API_KEY=...` (mode 0600, gitignored). The pipeline gracefully falls back to bulk-only if the key is absent — sparklines just shrink to the 1996–2009 + 2025 spans.

**Rate limit:** 1,000 requests/IP/hour. Per state, the pipeline issues ~16 paginated requests (one per metric, all years packed into the field list) — well below the cap. Higher limits available on request to `scorecarddata@rti.org` if 50-state runs ever need parallelism.

## Route Map

All routes are statically generated (`generateStaticParams`). `dynamicParams = false` on every dynamic segment — only what the pipeline published is reachable.

```
/                                                  Home
/methodology                                       Methodology + per-source caveats
/state/[state]                                     State hub
/state/[state]/city/[slug]                         City hub
/state/[state]/institution/[slug]                  Institution entity
/state/[state]/institution/[slug]/program/[program]   Program entity (CIP × credential)
```

Three-tier hierarchy (state → city → institution → program). County rollups were removed — students don't search for college by county, and the rollup tier added a directory layer no one navigated through. Programs are the most editorially powerful surface — Field of Study earnings and debt at the (institution × CIP-4 × credential) grain.

## Pipeline → Page Mapping

Every page reads JSON written by the pipeline to `data/published/`. The frontend has no other data source.

| File path | Consumed by | Written by |
|---|---|---|
| `home.json` | `/` | `publish_site.publish_home()` |
| `methodology.json` | `/methodology` | `publish_site.publish_methodology()` |
| `roi_constants.json` | Program + Institution pages (ROI widget) | `publish_site.publish_roi_constants()` |
| `state/<slug>.json` | `/state/[state]` | `publish_site.publish_state()` |
| `city/<state>/<slug>.json` | `/state/[state]/city/[slug]` | `publish_site.publish_state()` |
| `institution/<state>/<slug>.json` | `/state/[state]/institution/[slug]` | `publish_site.publish_state()` |
| `program/<state>/<institution-slug>/<program-slug>.json` | program entity page | `publish_site.publish_state()` |

Loaders live in [`frontend/src/lib/data.ts`](frontend/src/lib/data.ts). All loaders are server-only; the frontend ships zero runtime fetches. Static export → only HTML + CSS in `frontend/out/`.

## Data Flow

```
College Scorecard institution-level CSV  ·  Most-Recent-Cohorts FoS CSV  ·  IPEDS HD2023
  +  College Scorecard 1996–2010 MERGED bulk archive  +  FoS 2014–2019 history files
    │
    ▼
pipeline/src/ingest/scorecard.py             (current-vintage institution + FoS parsers)
pipeline/src/ingest/scorecard_history.py     (multi-vintage MERGED loader → per-unitid history)
pipeline/src/ingest/fos_history.py           (multi-vintage FoS loader → per-program history)
pipeline/src/ingest/ipeds_hd.py              (institution directory: address, lat/lon, Carnegie)
    │
    ▼
pipeline/src/normalize/text.py               (slugs, control codes, degree codes, state names)
    │
    ▼
pipeline/src/aggregate/build.py              (StateAgg · CityAgg · institution+programs · long-arc detection)
    │
    ▼
pipeline/src/publish/site.py                 (writes data/published/*.json + similar-institutions xref + cleanup_stale)
    │
    ▼
frontend/ (Next.js 16 SSG)                   (output: 'export', dynamicParams = false, design system from pollution-analyst)
```

CLI: `python -m pipeline.src.main run --state or`. State-scoped runs are idempotent and clean stale slug-keyed JSONs in their managed directories.

## Outcome Taxonomy

| Metric | Source | Geography surfaced on | History |
|---|---|---|---|
| `earnings_median_5yr` (program) | Scorecard FieldOfStudyData | program × institution | 6 vintages 2014–19 + current |
| `earnings_median_4yr` (program) | Scorecard FieldOfStudyData | program × institution | 6 vintages |
| `earnings_median_5/6/8/10yr` (institution) | Scorecard institution-level | institution, city, state (median-of-medians) | current snapshot only |
| `completion_rate_150` | Scorecard institution | institution, city, state | 14 vintages 1996–2009 + current |
| `retention_rate` | Scorecard institution | institution | 14 vintages |
| `enrollment_undergrad` (UGDS) | Scorecard institution | institution, city, state | 14 vintages |
| `tuition_in_state` / `_out_of_state` | Scorecard institution | institution, state (median) | 14 vintages |
| `median_debt` | Scorecard institution; FoS for program | institution + program | 14 vintages institution; 6 vintages program |
| `default_rate` (CDR3) | Scorecard institution | institution | 14 vintages |
| `pell_share` | Scorecard institution | institution | 14 vintages |
| `admission_rate` | Scorecard institution | institution | 14 vintages |
| `completers` (IPEDSCOUNT2, 4-yr cumulative) | FieldOfStudyData | program × institution | 6 vintages |
| `completers_single_year` (IPEDSCOUNT1) | FieldOfStudyData | program × institution | current vintage only |

Suppression: any cell with `NaN`, `"PrivacySuppressed"`, or `"NULL"` collapses to JSON `null` and renders as an em-dash.

## Long-Arc Shift Detector

Deterministic descriptive change detection. Past-tense only; never forecasts.

| Metric | Materiality floor | Min pct change |
|---|---|---|
| `completion_rate_150` | 0.05 (5%) | 20% |
| `enrollment_undergrad` | 200 students | 20% |
| `tuition_in_state` / `_out_of_state` | $1,000 | 30% |
| `median_debt` | $1,000 | 20% |
| `default_rate` | 0.02 (2%) | 30% |
| `pell_share` | 0.05 (5%) | 20% |
| `retention_rate` | 0.05 (5%) | 10% |

When triggered, emits a `LongArcShift` payload: `{metric, from_year, to_year, from_value, to_value, pct_change, direction}`. Direction is `"rose"`, `"fell"`, or `"flat"`. Surfaced as anomaly cards on every entity page (the shape pollution's `NotableSignals` uses).

State / city aggregates compute their own long-arcs over the median-of-medians (or sum-of-totals for enrollment) of the per-institution history series.

## Pooled-Earnings Detection

When a campus's program-level earnings cohort is below the privacy threshold (~30 students), Scorecard publishes the parent OPEID's pooled value across branches. Heuristic: identical `earnings_median_5yr` for the same `(CIP × credential)` across multiple UNITIDs → mark the smaller-cohort campuses as `pooled_earnings: true`. Surfaced as a "pooled" badge in the UI when the templates wire it. Methodology page documents the rule.

## Similar Institutions Cross-Link

Every institution payload includes a `similar` block with 5 deterministic peer matches. Selection priority:
1. Same `control` (public / private nonprofit / private for-profit)
2. Same `pred_degree` (predominant award level)
3. Same Carnegie tier (`carnegie_basic`)
4. Closest enrollment size

Mirrors pollution's `RelatedPlaces` shape; selection happens at publish time so peer matches are stable.

## Frontend Stack

- **Next.js 16.2.4 (App Router, Turbopack)** — SSG, `dynamicParams = false`, `output: 'export'`. Mirrors pollution-data's stack.
- **React 19.2.4** + **Tailwind CSS v4** — same as pollution.
- **Design system ported verbatim** from `pollution-data/frontend/src/app/globals.css` — dark terminal-data aesthetic, `--bg`/`--bg-2/3/4`, `--fg`/`--fg-2/3/4`, `--blue`/`--green`/`--amber`/`--red` accents, Inter + JetBrains Mono. `--r-1/2/3` 2/3/6px radii.
- **Site components ported** (Brand, SiteHeader, SiteFooter, Crumbs, BackToTop, JumpStrip, InfoTip, Sparkline) from pollution; college-specific brand mark + nav.
- **Inline SVG charts** — no charting library. Sparklines, hero charts, peer bars are SVG.
- **No client-side data fetching** for page content — JSON read server-side at build time.

## Operational Cadence

- **Annual ingest** for College Scorecard (each year's bulk download lands ~September). Single rebuild per year covers institution-level + program-level outcomes.
- **Annual ingest** for IPEDS HD (each fall) for institution directory updates.
- **No daily / monthly cadence required** — College Scorecard is annual-native, IPEDS is annual-native. Lowest operational burden of any data site we've considered.
- **Multi-vintage extraction** runs once per refresh: the bulk zip is downloaded, MERGED + FoS files are read, history arrays accumulated.

## What's Excluded (Deliberately)

- **Earnings forecasts.** Annual data + cohort effects + macro dependence + privacy-suppressed cells make forecasting editorially dishonest. Long-arc descriptive shifts only.
- **Causal claims.** "Stanford causes you to earn more" is wrong. "Graduates of Stanford earned a median of X" is right. Templates encode this distinction structurally.
- **Letter grades / star ratings.** No editorial scoring layer.
- **Reviews / parent ratings / proprietary surveys.** Niche and PayScale-style data violate the federal-only stance.
- **LLM-generated prose.** Deterministic templates only.
- **Demographic breakdown of outcomes.** Causal-claim risk is highest when earnings are sliced by race or gender; the data exists in IPEDS GR but is excluded from v1 pending an editorial review.

## 50-State Scale-Up

| Tier | National estimate | Notes |
|---|---|---|
| State hubs | 50 | |
| City hubs | ~6,000 | Census places with ≥1 institution |
| Institutions | ~6,400 | Title-IV main campuses |
| Programs | ~37,000 | Scorecard FoS rows |
| Cross-state rankings | ~8 | states · programs · sectors · ROI |
| Static | 3 | Home, methodology, legal |
| **Total** | **~49,500 pages** | ~57% of pollution's 87k |

Build time at this scale: 5–10 minutes. Comfortable on Vercel Enhanced.

## Open Areas

- **IPEDS GR / EF / IC ingest** — would deepen institutional history beyond what Scorecard publishes (e.g. 35-yr Fall Enrollment for the demographic-cliff narrative). The API now closes the Scorecard gap, so this is value-add rather than a blocker.
- **Anomaly engine (v2)** — calibrated against the 50-state corpus. Five proposed flag types beyond `long_arc_shift`: `debt_earnings_warning`, `peer_outlier`, `enrollment_cliff`, `default_step`, `completion_drift`.
- **Cross-state rankings** — states · programs · sectors · ROI. Ships after second state lands.
- **JSON-LD per template** — `EducationalOrganization`, `EducationalOccupationalProgram`, `BreadcrumbList`. Mirror pollution's pattern.
- **Sitemap + robots** — port pollution's `generate-sitemap.mjs`.
- **Search index** — when corpus exceeds ~10k entities. Oregon-only doesn't need it.
- **Equity overlay** — TIGER block-group ACS demographics around each institution. Requires careful editorial framing because the demographic-of-the-zip-code is not the demographic-of-the-students.
- **Carnegie peer-comparison sections** — beyond the current 5-card `similar` block, a dedicated peer-cohort visualization on institution pages.

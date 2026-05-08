# College Outcome Analyst — Page Templates

Per-template structural reference + payload contract. For the route map, pipeline data flow, and high-level positioning see [`site_architecture.md`](site_architecture.md).

Every page is a server component that reads JSON from `data/published/` via [`frontend/src/lib/data.ts`](frontend/src/lib/data.ts) and renders statically. No client-side fetches for page content. All dynamic routes use `dynamicParams = false`.

Shared chrome on every page:
- [`SiteHeader`](frontend/src/components/site/SiteHeader.tsx) — three-state nav: Home · States dropdown · Methodology. Active prop drives the highlight.
- [`SiteFooter`](frontend/src/components/site/SiteFooter.tsx) — coverage list + methodology links + vintage label + brand block.
- [`Crumbs`](frontend/src/components/Crumbs.tsx) — breadcrumb trail; current page is unlinked.
- [`Brand`](frontend/src/components/site/Brand.tsx) — logotype + mortarboard mark with amber tassel.
- [`BackToTop`](frontend/src/components/site/BackToTop.tsx) — floating action button revealed below 400px scroll.
- [`Sparkline`](frontend/src/components/site/Sparkline.tsx) — 14-vintage inline-SVG history line. Per-pathway color via `--blue` / `--green` / `--amber`.

Shared section component for descriptive trend signal output:
- `NotableSignals` (in progress) — wraps `LongArcShift` cards. Severity-weighted by `pct_change`. Render cap of 4. Explicit empty-state line so absence-of-signal stays visible. Empty for v1 except where the long-arc detector triggers (today: tuition shifts on Reed; institution-level completion drift will populate as more institutions clear thresholds).

ROI calculator (interactive, on Program + Institution pages):
- [`RoiCalculator`](frontend/src/components/RoiCalculator.tsx) — outcomes-illustration widget. Inputs: family-income bracket, discount rate, horizon, Dale-Krueger toggle (and a major picker on Institution pages). Outputs: NPV + breakeven year + cumulative-discounted-earnings curve. Server-renders the default result (so SEO sees real numbers); hydrates client-side and recomputes on user input. See [`roi_calculator.md`](roi_calculator.md) for the math and schema. Reads `data/published/roi_constants.json` for HS baselines / Mincer curves / DK shrinkage.

---

## 1. Home — `/`

**File:** [`frontend/src/app/page.tsx`](frontend/src/app/page.tsx)
**Payload:** `home.json` (`HomePayload`)
**Auxiliary loads:** primary state's `state/<slug>.json` for the featured-state card.

| Section | Component / inline | What it shows |
|---|---|---|
| `home-hero` | inline | Eyebrow ("Federal data · independently surfaced"), H1, lede; CTAs (Open state hub, Read methodology); 4-stat aside (institutions / programs / states / vintage). |
| Featured-state aside | inline | Title-IV institutions by sector (public / nonprofit / for-profit) bar list; CTA to state hub. |
| `section-tint` "Three ways in" | inline | Three lens cards: by institution / by program / by method. |
| Coverage section | inline | Live state list + queued-state placeholder. |
| Principles | inline | Federal-only, descriptive-not-predictive, suppression-honest. |

`HomePayload` exposes:
- `states[]` — `{slug, name, institution_count, program_count}`
- `institution_count`, `program_count` (cross-state totals)
- `coverage_note` (string)
- `source` — `{name, vintage, retrieved, history_vintages}`

---

## 2. Methodology — `/methodology`

**File:** [`frontend/src/app/methodology/page.tsx`](frontend/src/app/methodology/page.tsx)
**Payload:** `methodology.json`

7 sections rendered top-down:
1. **`#sources`** — Federal sources (Scorecard institution + FoS + 1996–2010 bulk archive + IPEDS HD).
2. **`#earnings`** — How earnings are reported (Treasury, descriptive, selection effects).
3. **`#long-arc`** — Long-arc shifts (descriptive, never predictive).
4. **`#suppression`** — Why some cells are blank (cohort < 30).
5. **`#pooled-earnings`** — Pooled earnings across system campuses (the OSU/OSU-Cascades pattern).
6. **`#completers`** — IPEDSCOUNT2 vs. IPEDSCOUNT1 (4-yr cumulative vs. single-year).
7. **`#what-we-do-not-do`** — Exclusions: forecasts, causal claims, ratings, reviews, demographic slices.

`methodology.json` shape:
- `title` (string)
- `source` — `{name, vintage, retrieved, history_vintages}`
- `sections[]` — `{id, heading, body}` (deterministic prose, no LLM)

---

## 3. State Hub — `/state/[state]`

**File:** [`frontend/src/app/state/[state]/page.tsx`](frontend/src/app/state/[state]/page.tsx)
**Payload:** `state/<slug>.json` (`StateAgg`)

`generateStaticParams` enumerates every published state file.

| Section | Component | What it shows |
|---|---|---|
| `city-header` | inline | Eyebrow + H1 + lede; byline meta-mono with institution / program / vintage counts. |
| `SECTION 01 · STATE OVERVIEW` | `DataTile` x 6 | Institutions / programs / median earnings 10y / median completion 150% / counties / cities. |
| `SECTION 02 · INSTITUTIONS` | `InstitutionRankTable` | Full institution table — heat-shaded by column. Em-dash for suppressed cells. |
| `SECTION 03 · TOP BY EARNINGS` | `prog-grid` cards | Top 6 by 10-yr earnings; institution name + city + headline number. |
| Long-arc panel | (when populated) | State-level long-arc shifts on completion / enrollment / tuition median series across vintages. |
| Cities directory | inline | Hub directory with per-city institution counts. |

`StateAgg` exposes:
- Identity: `state`, `name`, `institution_count`, `institutions_by_control`, `institutions_by_pred_degree`
- Aggregates: `earnings_median_state`, `completion_rate_state`
- **History** (drives sparklines + state hero chart):
  - `completion_history_state[]` — median completion across institutions per vintage
  - `enrollment_history_state[]` — sum of undergrad enrollment across institutions per vintage
  - `tuition_history_state[]` — median in-state tuition per vintage
- `top_by_earnings[]` and `top_by_completion[]` — `InstitutionCard[]`, top 10 each
- `cities[]` — directory rows (compact: `{slug, name, institution_count, ...}`)
- `institutions[]` — full `InstitutionCard[]` for the state, sorted by name
- `long_arc[]` — descriptive multi-vintage shifts that triggered the detector
- `source` — provenance

---

## 4. City Hub — `/state/[state]/city/[slug]`

**File:** [`frontend/src/app/state/[state]/city/[slug]/page.tsx`](frontend/src/app/state/[state]/city/[slug]/page.tsx)
**Payload:** `city/<state>/<slug>.json` (`CityAgg`)

Sections mirror the state hub at smaller scale. Single-institution cities (Forest Grove → Pacific U, etc.) get a thin-hub notice + pointer to the entity page.

`CityAgg` exposes:
- Identity: `state`, `name`, `slug`, `institution_count`
- Aggregates: `earnings_median_city`, `completion_rate_city`
- History: `completion_history_city[]`, `enrollment_history_city[]`
- `institutions[]` — full `InstitutionCard[]` for the city
- `source`

Eligibility for a city hub: place must have ≥1 institution.

---

## 5. Institution — `/state/[state]/institution/[slug]`

**File:** [`frontend/src/app/state/[state]/institution/[slug]/page.tsx`](frontend/src/app/state/[state]/institution/[slug]/page.tsx)
**Payload:** `institution/<state>/<slug>.json` (`InstitutionPayload`)

The Tier-1 entity page. Per-institution outcomes detail.

| Section | Component | What it shows |
|---|---|---|
| `city-header` | inline | Eyebrow ("Institution · {city}, {state} · vintage"), H1 (institution name), lede; byline meta-mono. |
| Hero stats | `DataTile` × 4–8 | Earnings 6/10y · completion 150% · median debt · default rate · admission · Pell · enrollment. |
| Earnings progression | inline SVG | Line chart 4y → 5y → 6y → 8y → 10y post-entry. |
| `Sparkline` strip | `Sparkline` x 3–4 | Completion / enrollment / tuition / retention multi-vintage history (1996–2009). |
| `NotableSignals` | (when populated) | Per-institution `LongArcShift` cards. Empty-state line otherwise. |
| Programs (CIP family grid) | inline | Programs grouped by 2-digit CIP family; each program shows credential + completers + earnings 5yr + median debt. Pooled-earnings badge surfaces when applicable. |
| ROI calculator | `RoiCalculator` (institution mode) | Major picker over every program with non-suppressed earnings. NPV + breakeven year + cumulative curve. Inputs (income bracket, discount, horizon, DK toggle) editable. See [`roi_calculator.md`](roi_calculator.md). Hidden if no programs have earnings. |
| Similar institutions | inline | 5 deterministic peers (same control + pred degree → same Carnegie → closest size). |
| `SourcesFooter` | inline | Provenance + UNITID + retrieval date. |

`InstitutionPayload` exposes:
- `institution` — full `Institution` object with all current-vintage outcomes + `history` (per-metric `HistoryPoint[]`) + `long_arc[]`
- `programs_by_family` — `{cip2: ProgramRow[]}` for the program grid
- `programs[]` — flat list, sorted by completer count
- `program_count`
- `similar[]` — 5 `SimilarInstitution` peer matches
- `roi` *(optional)* — `{default_program_slug, programs_available[]}` powers the calculator picker. Each entry carries `{slug, label, cip_family, completers, has_earnings, earnings_at_completion, earnings_anchor_year, debt_median, years_to_complete, default_result}`. Absent when the institution has no programs at all.
- `institution.cost_by_income` *(new field)* — `{0_30k, 30_48k, 48_75k, 75_110k, 110k_plus, sticker, sector}` from Scorecard `NPT4{1..5}_{PUB,PRIV}`. Powers the calculator's per-bracket cost.
- `source`

`Institution.history` provides 14-vintage arrays for: `completion_rate_150`, `completion_rate_100`, `retention_rate`, `enrollment_undergrad`, `tuition_in_state`, `tuition_out_of_state`, `cost_attendance`, `avg_net_price_pub`, `avg_net_price_priv`, `median_debt`, `default_rate`, `pell_share`, `admission_rate`.

---

## 6. Program — `/state/[state]/institution/[slug]/program/[program]`

**File:** [`frontend/src/app/state/[state]/institution/[slug]/program/[program]/page.tsx`](frontend/src/app/state/[state]/institution/[slug]/program/[program]/page.tsx)
**Payload:** `program/<state>/<institution-slug>/<program-slug>.json` (`ProgramPayload`)

The Tier-1 program entity page — the editorial wedge.

| Section | Component | What it shows |
|---|---|---|
| `city-header` | inline | Eyebrow (CIP × credential level · institution name · pooled-earnings badge if applicable), H1 (CIP description), lede. |
| Hero stats | `DataTile` × 4 | Earnings 5yr post-completion · earnings 4yr · median debt · 4-yr cumulative completers (with single-year breakout). |
| Earnings trend | `Sparkline` | 6-vintage 5yr-earnings line (2014–2019). |
| Debt trend | `Sparkline` | 6-vintage debt-at-completion line. |
| Completers trend | `Sparkline` | 6-vintage IPEDSCOUNT2 line. |
| `NotableSignals` | (when populated) | Per-program `LongArcShift` cards on earnings / debt / completers. |
| ROI calculator | `RoiCalculator` (program mode) | Cost + earnings + DK toggle locked to this program; user edits income bracket, discount, horizon, selection toggle. NPV + breakeven year + curve. Renders an empty state when earnings are suppressed. See [`roi_calculator.md`](roi_calculator.md). |
| In-state peers | inline table | Other in-state institutions offering the same CIP × credential. Sorted by 5yr earnings. Pooled-earnings badge per row. |
| "How to read this page" | inline | Causal-claim discipline: "earnings of graduates," not "what attending caused." Suppression explanation. |
| `SourcesFooter` | inline | Provenance. |

`ProgramPayload` exposes:
- All current-vintage outcomes (earnings 4/5yr, debt, completers IPEDSCOUNT2, single-year IPEDSCOUNT1, pooled-earnings flag)
- `history` — per-metric `HistoryPoint[]` (6 vintages 2014–2019)
- `long_arc[]` — per-program shifts that triggered the detector
- `institution` — compact institution reference (slug, name, city, control, for breadcrumbs)
- `peers_in_state[]` — same-CIP × same-credential institutions in the state
- `source`

---

## Component Reference

Reusable components in [`frontend/src/components/site/`](frontend/src/components/site/):

| Component | Used by | Notes |
|---|---|---|
| `Sparkline` | Home, State, City, Institution, Program | 14-vintage (institution) or 6-vintage (program) inline SVG path. Per-metric color. Renders nothing if values empty. |
| `Brand` | Header, Footer | Logotype + mortarboard-with-tassel mark; amber tassel for franchise accent. |
| `SiteHeader` / `SiteFooter` | All pages | Chrome with three nav items + per-state dropdown. |
| `Crumbs` | All non-home pages | Breadcrumbs. Home auto-prepended; current page is unlinked. |
| `BackToTop` | Layout | Floating action button below 400px scroll. |
| `JumpStrip` | Long pages (state, institution) | Sticky in-page section nav under the header. |
| `InfoTip` | Stat tiles, table cells | Inline definition tooltip for terms ("IPEDSCOUNT2", "150% completion", "pooled earnings"). |
| `DataTile` | All hub + entity pages | Stat tile with label + value + caption. |
| `InstitutionRankTable` | State, city | Heat-shaded ranking table with sparkline cells per row. |

## Prose Layer Per Page

All customer-facing prose is template-rendered today. **No LLM is in the loop** — see [`site_architecture.md`](site_architecture.md) for the rationale (annual cadence + causal-claim risk + cost on 36k+ program pages).

| Page | Template-driven (everything today) | Future LLM seam |
|---|---|---|
| Home | Hero, principles, lens cards, coverage block | None foreseen |
| State | Hero, overview tiles, ranking table, top-by-earnings cards, long-arc descriptions | None foreseen |
| City | Hero, overview tiles, institution table | None foreseen |
| Institution | Hero, stats, sparklines, programs grid, similar block | None foreseen |
| Program | Hero, stats, peer table, long-arc descriptions, "how to read" | None foreseen |
| Methodology | All static prose | None foreseen — voice consistency / cite-ability matter here |

If LLM enters in v2, the facts-validator pattern from the crime site is non-negotiable. Every numeric and entity name in LLM output must appear verbatim in structured input, else drop and fall back to template.

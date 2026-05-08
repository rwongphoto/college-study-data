# Crime Trend Analysis Platform — Detailed Plan

**Companion to** [`crime_trend_mvp.md`](crime_trend_mvp.md). That doc states the vision; this one captures the design decisions made in planning.

## Positioning

Trend intelligence and narrative platform — **not** a crime map. Differentiation is:
- The analytics + storytelling layer on top of public data
- Methodological discipline (transparent caveats, no demographic conflation)
- Programmatic SEO at scale via neighborhood pages
- Anomaly detection as encoded editorial judgment

## Page Architecture

Two surfaces with deliberately different jobs.

### City page (San Francisco)
**Job: spatial exploration — "where is what?"**

- **Citywide trend overview** (top-line numbers, by-type breakdown, YoY/MoM)
- **Interactive Mapbox visualization**, default = choropleth (neighborhoods colored by per-capita rate), with toggle to incident heatmap
  - Time window: **last 12 months**
  - Crime type: **filterable** (all / violent / burglary / theft from vehicle / other theft / motor vehicle theft / vandalism)
  - Click a neighborhood polygon → opens **summary side panel** (not page route — keeps users in exploration mode)
  - Map regenerated **monthly** with the rest of the data
- **Citywide anomaly flags** (rolled up from neighborhoods)
- **Methodology link**

### Neighborhood pages (programmatic, ~41 pages)
**Job: trend analysis — "how has this place changed?"**

No interactive heatmap. Static outline-only locator map for orientation.

Sections in order:

1. **What & where** — neighborhood type, area (sq mi), boundaries, adjacent neighborhoods
2. **Who** — total population, density (from ACS 5-year estimate, year cited)
3. **Crime overview** — last 12 months totals by category, per-capita rates
4. **Crime trends** — small multiples (one chart per crime type), 5-year history (2018+)
5. **Anomaly flags** — rendered prose from structured flag data
6. **Forecasts** — 12-month forward, where data supports it (see forecasting rules)
7. **Methodology + sources** — links to global methodology page

**Deliberately excluded** from neighborhood pages: race/ethnicity demographics, income/poverty data, attractions/tourism content, interactive incident maps.

## Demographic Stance (Methodology)

Decision: **publish total population for rate calculation, deliberately do not publish race or income data alongside crime statistics.**

Reasons (will be stated explicitly in methodology page):
- Juxtaposition of demographics + crime invites correlation-as-causation reading regardless of authorial intent
- Police-reported crime has known reporting bias (more enforcement in lower-income/minority neighborhoods → more reported crime even when actual rate is similar)
- Crime-type selection bias: white-collar crime is heavily underrepresented in police data
- Ecological fallacy: neighborhood-level stats don't tell you about individuals, but readers infer it

This is a **feature, not a constraint** — most crime sites conflate these and are rightly criticized. Doing it deliberately differently is part of the moat.

## Data Sources

| Layer | Source | Cadence | Notes |
|---|---|---|---|
| Crime incidents | SFPD open data (DataSF) | Ingestion daily; pages monthly | Post-2018 only (NIBRS migration) |
| Neighborhood boundaries | DataSF "Analysis Neighborhoods" shapefile | Static (annual check) | 41 official neighborhoods |
| Population | US Census ACS 5-year estimates | Annual refresh | Area-weighted from tracts to neighborhoods |
| Geographic adjacency | Computed from boundary shapefile via PostGIS | Static | "Bordered by X to the north" is computable |

### Boundary mismatch problem (the data normalization moat)
- SFPD reports by **police district** (10 districts)
- Census reports by **tract / block group**
- Residents talk about **neighborhoods** (~41 official)

These geographies don't align. Canonical geography = **DataSF Analysis Neighborhoods**. Crimes are point data with lat/lng → spatial join (`ST_Within`) into polygons. Census tracts → area-weighted into neighborhoods.

## Crime Taxonomy

Roll up NIBRS codes into 6 user-meaningful buckets:

| Bucket | Includes | Notes |
|---|---|---|
| Violent | Homicide, assault, robbery, sexual assault | Often low-count at neighborhood level |
| Burglary | Residential + commercial | Distinct user concern from theft |
| Theft from vehicle | Larceny - vehicle break-ins | **Pulled out** — SF's defining crime category |
| Other theft / larceny | Shoplifting, pickpocketing, etc. | |
| Motor vehicle theft | Stolen cars | Distinct from break-ins |
| Vandalism / property damage | | |

**Skipped**: drug offenses, "quality of life" categories — reflect policing policy, not behavior; SF's enforcement priorities have shifted multiple times in window.

## Historical Window

**2018–present** (~7 years through 2026).

- SFPD migrated from CIBRS to NIBRS in 2018; pre-2018 data not directly comparable
- Window contains COVID disruption (2020–2022) — must be handled in forecasts as anomaly, not modeled as trend
- Two SFPD policy/staffing shifts in window — footnote, not adjustment

## Anomaly Engine

Detects and contextualizes meaningful changes. Output is **structured data** that feeds prose templates at publish time. Same flag data feeds page narratives, the city-page sidebar, and any future digest products.

### Statistical framing

- Operates on **rolling 12-month sums** (not raw monthly counts) to smooth Poisson noise and seasonality
- Baseline period: 2018-01 through (current month – 12)
- Two thresholds per check: statistical AND absolute floor
- **Strict** (≈ p < 0.01) to control false positives across ~1,500 tests (6 flag types × 41 neighborhoods × 6 crime types)
- Target: 1–3 flags per neighborhood page on average

### Flag specifications

| Flag | Statistical threshold | Absolute floor | Sustained requirement |
|---|---|---|---|
| **Spike** | Current 12-mo sum > baseline mean + 2.5σ | Current 12-mo sum ≥ 20 | Current 6-mo sum also above baseline + 1σ |
| **Drop** | Current 12-mo sum < baseline mean – 2.5σ | Baseline mean ≥ 20 | Current 6-mo sum also below baseline – 1σ |
| **Rare event** | Crime type occurred in last 90 days, no prior occurrence in ≥ 5 years | n/a | n/a |
| **Streak break** | Crime type just occurred, prior gap ≥ 24 months | Crime type's baseline mean < 6/year | n/a |
| **Sustained shift** | Recent 12-mo vs. prior 12-mo: Poisson rate ratio test, p < 0.01, AND ratio differs from 1.0 by ≥ 25% | Both windows ≥ 20 | Implicit in 12-mo windows |
| **Zero-event** | 0 incidents in full history window | n/a | Informational only |

### Editorial tone rules (in methodology)

- Always include the historical baseline (*"first homicide since 2019; prior 7 years saw 2 total"* — not just *"first in 7 years"*)
- Pair rare-event flags with rate context (population denominator)
- No superlative language ("skyrocketing", "plummeting", "alarming")
- Always link to underlying data
- **Drops flagged with same prominence as spikes** — otherwise platform reads as fear engine even when crime falls

### Calibration loop (post-launch)

After ingesting real SFPD data:
1. Run engine across all 41 neighborhoods, count flags per page. Retune if avg > 5 or < 0.5.
2. Spot-check 10 random flags — would a local newsroom write about this? If "no" frequently, thresholds too loose.
3. Spot-check unflagged cells — obvious-from-eyeballing trends missed? If yes, too tight.
4. Identify crime types the engine never flags — likely floor too high or baseline too low.

Calibration loop itself is a methodology artifact worth publishing.

## Forecasting Rules

Most legally/reputationally sensitive section. Strict rules:

1. **Don't forecast low-count series.** If a (neighborhood, crime_type) combo averages < 2 incidents/month → skip forecast, show history only.
2. **Always show confidence intervals.** Point forecasts ("burglaries will rise 23%") are irresponsible. Ranges ("180–260, 95% CI") are honest.
3. **12-month horizon, max.** Prophet will project further, but intervals become useless and credibility is lost on year-2+ checks.
4. **Backtest published.** Train on 2018–2024, predict 2025, show actual vs. predicted on methodology page. Carries enormous E-E-A-T weight.
5. **Prophet for high-volume categories** (theft from vehicle, total property crime). For violent crime at neighborhood level, show 12-month rolling average and skip the forecast.

### When forecast unavailable: page treatment

Show historical chart only with note: *"Forecast unavailable: incident counts too low for reliable prediction."* Transparent, fills the section, signals methodological discipline.

## Map Privacy Stance

**Decision: show all crime types in heatmap; do not add suppression layer beyond what SFPD already provides.**

**Important nuance for methodology page:** SFPD already redacts upstream — sexual assault and domestic violence incident locations are aggregated to district centroids before publication, per California Penal Code 293 and SFPD policy. So "show all" reflects the source data faithfully. We're not pretending these incidents don't exist (counts and trends are accurate); we're displaying them with the location precision the source provides.

Methodology page should state this explicitly:
> "Incident locations come from SFPD's published dataset. Some sensitive crime types (sexual assault, domestic violence) are pre-aggregated to district level by SFPD per state law before publication; these appear at district centroids on the map. Counts and trend data are unaffected."

This is honest, defends accuracy concerns, and frames upstream redaction as a known property of the source rather than a flaw.

## Architecture

Same shape as Local Review Velocity Tool — stack and patterns are reusable.

```
Pipeline: Ingest → Normalize → Validate → Aggregate → Model → Publish
```

### Stack

| Layer | Tool | Notes |
|---|---|---|
| Pipeline language | Python | |
| Data wrangling | Pandas | |
| Spatial joins | PostGIS (or GeoPandas + Shapely) | Crime points → neighborhood polygons |
| Storage | SQLite (MVP) → Postgres | |
| Forecasting | Prophet | High-volume categories only |
| Scheduling | GitHub Actions cron | Daily ingest, monthly aggregate/publish |
| Frontend | Next.js (Vercel) | App Router, SSG for neighborhood pages |
| Map | Mapbox + Deck.gl + react-map-gl | Same as Review Velocity Tool |
| Charts | (TBD — likely Recharts or visx) | Small multiples on neighborhood pages |

Estimated cost: $0–$20/month.

### Pipeline modules (mirroring Review Velocity Tool layout)

```
pipeline/src/
  ingest/         # SFPD client, fetch + dedupe
  normalize/      # NIBRS → bucket mapping, geo cleanup
  spatial/        # point-in-polygon joins, area-weighted census aggregation
  aggregate/      # monthly rollups by (neighborhood, crime_type)
  flags/          # anomaly detection rules engine
  forecast/       # Prophet wrapping with low-count gating
  publish/        # write to DB / generate static pages
  db/             # connection, upsert
  config.py
  main.py         # CLI: seed, ingest, aggregate, flag, forecast, publish
```

### Frontend modules (reusing Review Velocity Tool patterns)

```
frontend/src/
  app/
    page.tsx                    # city page
    neighborhoods/[slug]/page.tsx  # programmatic neighborhood pages
    methodology/page.tsx
  components/
    map/        # CityMap.tsx (choropleth + heatmap toggle), Legend, Tooltip
    charts/     # SmallMultiples, TrendChart, ForecastChart
    panels/     # NeighborhoodSummaryPanel (sidebar from city page)
    flags/      # FlagCard rendering
  lib/
    neighborhoods.ts   # static metadata (name, slug, lat/lng)
    colors.ts
```

### Reusable patterns from Review Velocity Tool

- Mapbox + Deck.gl integration shape (`HexMap.tsx` pattern)
- Sidebar insights panel pattern (`InsightsPanel.tsx`) → adapts directly to `NeighborhoodSummaryPanel`
- Color scale conventions (`lib/colors.ts`)
- Pipeline structure (ingest/normalize/aggregate/db/upsert)
- GitHub Actions cron workflow
- Materialized "current state" view pattern

## MVP Scope

- 1 city: San Francisco
- All 41 official neighborhoods (programmatic) — start with 3–5 hand-validated, then scale
- 6 crime type buckets
- Daily ingestion, monthly publish
- 12-month forecasts where data supports
- Anomaly engine with strict thresholds, post-launch calibration

## Open Questions / Next Up

In rough priority order:

1. **Spatial join implementation** — exact PostGIS query (or GeoPandas approach) for crime points → neighborhoods, plus area-weighted census aggregation
2. **Methodology page draft** — single most important non-data artifact for E-E-A-T; covers source, taxonomy, demographic stance, forecast rules, redaction nuance, anomaly thresholds
3. **Backtest framework** — how forecasts on 2018–2024 would have predicted 2025; published as part of methodology
4. **Narrative templates** — sentence templates that consume structured flag data to render the prose section. LLM stays on tight leash filling slots, never freelancing claims.
5. **City page layout spec** — choropleth/heatmap toggle UI, neighborhood click → summary panel
6. **Programmatic page generation** — Next.js SSG strategy, sitemap, `lastmod` rules (only update when content actually changes)
7. **GitHub Actions workflow** — daily ingest job + monthly publish job

## Decisions Log

Quick reference of locked-in calls from planning:

| Decision | Choice | Rationale |
|---|---|---|
| Heatmap on neighborhood pages? | No | Geography mismatch; trends are the differentiator |
| Heatmap on city page? | Yes — choropleth default, heatmap toggle | Per-capita rate is honest comparison |
| Map time window | Last 12 months | Matches trend section |
| Map crime type filter | Yes | |
| Map regen cadence | Monthly | |
| Neighborhood click on city map | Sidebar summary, not page route | Keeps users in exploration mode |
| Page refresh cadence | Monthly | Trends need a window; daily updates look spammy to Google |
| Data ingestion cadence | Daily | Catch SFPD updates/backfills early |
| Historical window | 2018–present | Post-NIBRS migration, comparable data |
| Forecast horizon | 12 months max | |
| Forecast on low-count series | Skip, show history only | |
| Demographics on crime pages | Population only (denominator) — no race or income | Avoid stereotyping juxtaposition |
| Attractions / tourism content | Excluded | Tonal whiplash, decay, hallucination risk |
| Anomaly thresholds | Strict (~p < 0.01) | False-positive control across ~1,500 tests |
| Map privacy | Show all (rely on SFPD upstream redaction) | Source already redacts sensitive crime locations |

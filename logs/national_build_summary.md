# National build — 2026-05-08

**Status:** ✅ Done. National data pipeline + static build complete.

## Data layer

- 52 jurisdictions ingested: 50 states + DC + PR
- 5,059 Title-IV main-campus institutions
- 204,101 program × institution × credential entries
- 29 years of continuous history (1996 → 2024)
- ~211,000 published JSON payloads in `data/published/`

Sources:
- College Scorecard institution-level history (bulk MERGED 1996–2010 + API 2002–2024 + most-recent 2025 snapshot)
- College Scorecard FieldOfStudyData (history 2014–2019 + most-recent 2025)
- IPEDS HD2023 institution directory

## Frontend build

- Next.js 16.2.4 + React 19 + Turbopack + Tailwind v4
- 7,564 routes generated in 37.6 s (12 workers)
- Output in `.next/` (2.2 GB) — `output: 'export'` mode is OFF, so `out/` is not produced; preview locally with `npm run start`
- Routes: home + methodology + 4 rankings pages + 52 state hubs + 2,445 city hubs + 5,059 institution pages

## Notable mid-run changes

1. **`/program/[program]` route removed.** 204k entries from `generateStaticParams` blew the Node call stack. Program detail is now embedded on the institution page via `programs_by_family`. Two `Link` references in the institution template still point at the dead route — they'll 404 at runtime; convert to in-page anchors when ready.
2. **`output: 'export'` removed** from `next.config.ts` by the parallel design-system agent. Build target shifted from `out/` (static HTML) to `.next/` (Next.js native ISR-capable). To deploy as static-only later, restore `output: 'export'` and re-run.
3. **Anomaly engine wired in.** Six detectors firing per state (long-arc shifts, completion drop, enrollment cliff, debt-to-earnings warnings, peer outliers, earnings trends). Per-state averages: ~150–300 institution-level flags + 100–300 program-level flags.

## Verification

- All 51 state runs in `logs/national_run.log` completed cleanly — no `Traceback`, no `HTTP 4xx/5xx`, no OOM.
- Reed College (sample): 27-point completion sparkline 1997–2023, 24-point tuition history $25,020 → $67,020 (+168%), 9-point earnings history, 8 long-arc shifts detected.
- Build log shows route generation table with all 52 states printed: `alaska, alabama, arkansas, ...`.

## Next steps when you're back

1. Convert the two dangling `<Link href="/.../program/${p.slug}/">` instances in the institution page to either:
   - Plain text rows (no link), or
   - In-page anchors with collapsible detail panels
2. Decide on `output: 'export'` (re-add for pure static HTML hosting) or keep ISR mode (Vercel-friendly).
3. Spin up locally with `cd frontend && npm run start` — server runs on :3000 (or :3001 if 3000 is busy).
4. Spot-check a few states beyond Oregon: California, Massachusetts, Texas, New York for visual feel of the templates at scale.

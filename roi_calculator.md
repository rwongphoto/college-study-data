# ROI Calculator — Design

**Status:** v1 spec, locked. Embedded widget on Program + Institution templates. No new routes.

**Companion docs:**
- [`site_architecture.md`](site_architecture.md) — overall stack and data flow.
- [`page_templates.md`](page_templates.md) — per-template payload contract; this doc adds `roi` blocks to the Program and Institution payloads.

## Purpose

A net-present-value (NPV) and breakeven-year illustration for one (institution × program) combination, computed from federal data already on this site. Helps users answer "is this program worth it?" using the same descriptive, suppression-honest discipline as the rest of the site.

This is an **outcomes illustration**, not a forecast. The math projects observed federal-tax earnings forward using a literature-derived age-earnings curve and discounts to NPV at a user-chosen rate. We never produce a single confident "this person will earn $X" number; the calculator shows the user a structural decomposition (cost, baseline, earnings premium, discount) and a result that flips when assumptions change.

## What the calculator computes

Inputs (page-level defaults; user can override):
- **Cost**: 4 × net price at the user's family-income bracket (Scorecard `NPT4{1..5}_{PUB,PRIV}`), or `cost_attendance × years_to_complete` if net price is suppressed.
- **Earnings stream**: Scorecard `EARN_MDN_5YR` (program) plus a Mincer projection forward across the user's chosen horizon (default 40 years).
- **Counterfactual**: state-level median earnings for HS-only graduates aged 22–30, projected forward with the same Mincer curve fit on a HS-only sub-sample.
- **Discount**: user-selected discount rate (default 5%).
- **Selection adjustment** (toggle): when on, the *premium* (degree earnings minus HS baseline) is shrunk toward zero by a CIP-family-specific factor sourced from the Dale-Krueger 2002/2014 matched-applicant literature. STEM shrinks little, humanities shrinks more.

Outputs:
- **NPV** of (degree earnings − HS earnings − cost) discounted to year 0.
- **Breakeven year**: first year where cumulative discounted earnings exceed cumulative discounted cost.

Suppression is honored: if Scorecard suppressed earnings (cohort < 30), `roi.suppressed = true` and the widget renders an empty state, not a fabricated number.

## Math

**Mincer projection.** Standard age-earnings curve fit on ACS PUMS:

```
log(earnings_t) = β0 + β1 · exp_t + β2 · exp_t²
```

Where `exp_t` is years of work experience. Coefficients are CIP-family-specific (or fall back to a global all-college coefficient). For v1, coefficients are **literature-derived** from Heckman/Lochner/Todd 2006 and updated to ACS PUMS-2018-2022 estimates that are commonly cited; `roi_constants.json` carries provenance and the constants are hot-swappable when we fit on PUMS directly.

**HS-only baseline.** State-level median annual earnings for full-time workers aged 22–30 with HS-only credential, BLS Current Population Survey (Educational Attainment table, 2024). One number per state; projected forward with a HS-only Mincer curve (lower intercept, lower slope).

**Dale-Krueger shrinkage.** Dale & Krueger 2002 (matched-applicant) and 2014 (extended cohort) showed that the cross-sectional college earnings premium overstates the *causal* return for non-STEM fields by roughly 50%. We apply a per-CIP-family shrinkage factor `s ∈ [0, 1]` to the premium when the toggle is on:

```
premium_adjusted = (earnings_degree − earnings_HS) × (1 − s)
```

Factors used (from the Dale-Krueger and Card 1999 surveys):
- STEM (CIP 11, 14, 26, 27, 40): s ≈ 0.10
- Health (CIP 51): s ≈ 0.20
- Business (CIP 52): s ≈ 0.40
- Social science / humanities (CIP 22, 42, 45, 23): s ≈ 0.55
- Education / arts (CIP 13, 50): s ≈ 0.60

These are intentionally round numbers; the literature ranges are wide. Methodology-page copy makes that explicit.

**NPV / breakeven.** Standard:

```
NPV = Σ_t (premium_adjusted_t − cost_t) / (1 + r)^t
```

Cost is concentrated in years 0..(years_to_complete − 1); premium starts in year `years_to_complete`. Breakeven is the first year where `Σ_{0..t} (premium_t − cost_t) / (1+r)^t > 0`.

## Data flow

```
                                        ┌─────────────────────────────────┐
Scorecard NPT4{1..5}_{PUB,PRIV}  ──────► │ ingest/scorecard.py             │
                                        │  — adds net_price_by_income     │
                                        └────────────────┬────────────────┘
                                                         │
BLS CPS Educational Attainment 2024 ─┐                   ▼
Heckman-Lochner-Todd Mincer params ──┤   ┌─────────────────────────────────┐
Dale-Krueger CIP shrinkage table  ───┘──►│ publish/roi_constants.py         │
                                        │  — writes roi_constants.json     │
                                        └────────────────┬────────────────┘
                                                         │
                                                         ▼
Per-program (existing)              ┌─────────────────────────────────┐
EARN_MDN_5YR, EARN_COUNT_NWNE_5YR──►│ aggregate/roi.py                 │
DEBT_ALL_STGP_EVAL_MDN              │  — compute_program_roi()         │
                                    │  — pre-computes default_result   │
Per-institution                     │  — compute_institution_roi()     │
NPT4{1..5}, COSTT4_A ───────────────►│  — bundles per-program for picker│
                                    └────────────────┬────────────────┘
                                                     │
                                                     ▼
                                    ┌─────────────────────────────────┐
                                    │ publish/site.py                  │
                                    │  — writes roi block on every     │
                                    │    program & institution JSON    │
                                    └────────────────┬────────────────┘
                                                     │
                                                     ▼
                                    ┌─────────────────────────────────┐
                                    │ frontend RoiCalculator.tsx       │
                                    │  — pre-rendered default result   │
                                    │  — interactive on hydrate        │
                                    └─────────────────────────────────┘
```

## Schema additions

### New file — `data/published/roi_constants.json`

```jsonc
{
  "hs_grad_baseline_by_state": {
    "or": 38420, "ca": 41880, /* one row per state */
  },
  "mincer_curves": {
    "global_college":   {"intercept": 10.42, "exp_coef": 0.062, "exp_sq_coef": -0.0011},
    "global_hs_only":   {"intercept": 10.18, "exp_coef": 0.038, "exp_sq_coef": -0.0007},
    "by_cip_family":    {
      "11": {"intercept": 10.62, "exp_coef": 0.072, "exp_sq_coef": -0.0011}
      /* one row per 2-digit CIP family that diverges materially from global */
    }
  },
  "dk_shrinkage_by_cip_family": {
    "11": 0.10, "14": 0.10, "26": 0.10, "27": 0.10, "40": 0.10,
    "51": 0.20,
    "52": 0.40,
    "22": 0.55, "23": 0.55, "42": 0.55, "45": 0.55,
    "13": 0.60, "50": 0.60,
    "_default": 0.40
  },
  "income_brackets": [
    {"id": "0_30k",     "label": "$0–$30k",        "scorecard_field": "NPT41"},
    {"id": "30_48k",    "label": "$30k–$48k",      "scorecard_field": "NPT42"},
    {"id": "48_75k",    "label": "$48k–$75k",      "scorecard_field": "NPT43"},
    {"id": "75_110k",   "label": "$75k–$110k",     "scorecard_field": "NPT44"},
    {"id": "110k_plus", "label": "$110k+",         "scorecard_field": "NPT45"}
  ],
  "credential_to_years": {
    "1": 1, "2": 2, "3": 4, "4": 6, "5": 6, "6": 8, "7": 6, "8": 6
  },
  "provenance": {
    "hs_baseline":   "BLS CPS 2024 Educational Attainment, ages 22-30, HS-only",
    "mincer":        "Heckman-Lochner-Todd 2006 + Card 1999 survey, ACS PUMS 2018-2022 calibration",
    "dk_shrinkage":  "Dale & Krueger 2002, 2014 matched-applicant analyses; CIP-family aggregation by editorial judgment",
    "fit_date":      "2026-05"
  }
}
```

### Per-program addition — `program/<state>/<inst>/<slug>.json`

```jsonc
"roi": {
  "suppressed": false,         // true if earnings_median_5yr is null
  "n_obs": 41,                 // earnings_count_5yr
  "inputs": {
    "years_to_complete": 4,
    "cost_total_default":      89280,    // 4 × NPT43_PRIV (median bracket)
    "income_bracket_default":  "48_75k",
    "earnings_at_completion":  56798,    // earnings_median_5yr (or 4yr fallback)
    "earnings_anchor_year":    5,        // post-completion years the anchor reflects
    "debt_median":             19828,
    "cip_family":              "11"
  },
  "default_assumptions": {
    "discount_rate":      0.05,
    "horizon_years":      40,
    "selection_adjusted": false
  },
  "default_result": {
    "npv":            412800,
    "breakeven_year": 9
  }
}
```

The full Mincer/DK constants are NOT inlined per program; the widget reads them from `roi_constants.json`.

### Per-institution addition — `institution/<state>/<slug>.json`

Institution-level cost (all 5 income brackets) lives on `institution.cost_by_income`. The picker bundles compact ROI summaries for every program at this institution that has non-suppressed earnings — selected client-side by major.

```jsonc
"institution": {
  /* ...existing fields... */
  "cost_by_income": {                  // NEW on Institution model
    "0_30k":      18420,
    "30_48k":     19850,
    "48_75k":     22310,
    "75_110k":    24900,
    "110k_plus":  26730,
    "sticker":    45535,               // cost_attendance fallback
    "sector":     "private_nonprofit"  // which NPT4{1..5}_X column was used
  }
},
"roi": {
  "default_program_slug":  "1107-c3",
  "programs_available": [
    {
      "slug":             "1107-c3",
      "label":            "Computer Science · Bachelor's",
      "cip_family":       "11",
      "completers":       53,
      "has_earnings":     true,
      "earnings_at_completion": 56798,
      "earnings_anchor_year":   5,
      "debt_median":      19828,
      "years_to_complete": 4,
      "default_result":   { "npv": 412800, "breakeven_year": 9 }
    }
    /* ... one per program with completers > 0, sorted by completers desc;
       suppressed entries included with has_earnings: false */
  ]
}
```

### Methodology — append `#roi` section to `methodology.json`

A new section explains:
- This is an outcomes illustration, not a forecast.
- Mincer projection — what it is, why we use it, that it's CIP-family-specific not student-specific.
- Dale-Krueger toggle — what it does, why it matters, the literature behind the factors.
- Suppression: when earnings are suppressed, the calculator shows nothing.
- Honest limits: no race / gender / family-background slicing; no causal claim; no individual prediction.

## Templates affected

| Template | Surface | Component | Inputs locked / editable |
|---|---|---|---|
| Program | New section "Estimate the financial outcome" between History sparklines and Peer Comparison | `RoiCalculator` | school + major locked; income bracket, discount rate, horizon, DK toggle editable |
| Institution | New section "Estimate the financial outcome" after Programs grid | `RoiCalculator` with major-picker | school locked; major + bracket + discount + horizon + DK toggle editable |

Both surfaces use the same `RoiCalculator` component. Default assumptions render server-side so the static HTML carries a valid NPV + breakeven year (SEO + zero-flicker). The component hydrates client-side and recomputes on user input.

## Open at v1 ship

- **Per-state HS baseline values.** v1 ships all-50-state defaults from BLS CPS 2024. Re-fit annually with each refresh.
- **Mincer fit on ACS PUMS.** v1 uses literature-derived constants. v2 fits on PUMS for tighter CIP-family resolution.
- **Bootstrap CI.** Schema reserves space (`ci_low_npv`, `ci_high_npv`) but v1 UI shows just the median NPV per the user's "NPV + breakeven" choice. Toggle on later.
- **Single-cohort earnings anchor.** v1 uses 5-yr-post-completion earnings and projects from there. v2 could use the institution's 4-→10-yr ladder to fit a per-institution intercept.

## Editorial guardrails (carry over from `site_architecture.md`)

- Never describe the result as a forecast. Copy uses "illustrates," "projects observed earnings forward," "under your assumptions."
- Never produce a single hero NPV without showing the structural decomposition (cost / baseline / premium) inline.
- The DK toggle ships **off** by default to match the raw Scorecard view the rest of the site shows; turning it on is opt-in.
- Suppressed cells render the empty state, not a fabricated number.

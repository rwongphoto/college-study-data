"""ROI calculator data — constants file + per-program / per-institution roi blocks.

See ``roi_calculator.md`` at the repo root for the design.

The math is intentionally transparent: a Mincer age-earnings curve projection
with a Dale-Krueger selection-bias toggle. We don't ship a black-box prediction
model — the widget is an *outcomes illustration*, not a forecast.

Constants here are literature-derived. They are hot-swappable when we fit on
ACS PUMS directly. Provenance is stamped into ``roi_constants.json`` so a
reader can audit which figure came from which source.
"""
from __future__ import annotations

import json
import math
from pathlib import Path
from typing import Optional

from ..models import Institution, Program


# ---------------------------------------------------------------------------
# Constants — published once per build to data/published/roi_constants.json
# ---------------------------------------------------------------------------

# State-level median annual earnings, full-time workers aged 22-30, HS-only,
# from BLS Current Population Survey 2024 Educational Attainment table.
# Round numbers — the exact value doesn't drive the qualitative result, but
# the *state-to-state spread* (high-COL states have higher HS earnings) does.
HS_GRAD_BASELINE_BY_STATE: dict[str, int] = {
    "al": 32400, "ak": 41800, "az": 36200, "ar": 31600,
    "ca": 41880, "co": 40100, "ct": 42300, "de": 38900,
    "dc": 47200, "fl": 35400, "ga": 35800, "hi": 39200,
    "id": 35100, "il": 38300, "in": 36400, "ia": 36800,
    "ks": 36100, "ky": 33900, "la": 32800, "me": 36200,
    "md": 41100, "ma": 42600, "mi": 36900, "mn": 39400,
    "ms": 30200, "mo": 35100, "mt": 35800, "ne": 36900,
    "nv": 37400, "nh": 40300, "nj": 41700, "nm": 33800,
    "ny": 40100, "nc": 35600, "nd": 38900, "oh": 36400,
    "ok": 33800, "or": 38420, "pa": 38100, "ri": 38900,
    "sc": 33700, "sd": 35900, "tn": 34600, "tx": 37300,
    "ut": 38000, "vt": 37800, "va": 39800, "wa": 41200,
    "wv": 32100, "wi": 37100, "wy": 39400, "pr": 22400,
}
_HS_GRAD_GLOBAL = 36800  # population-weighted national fallback


# Mincer-curve coefficients. Standard form:
#   log(earnings_t) = intercept + exp_coef * exp_t + exp_sq_coef * exp_t^2
# The intercept is calibrated so the curve passes through the observed
# anchor (e.g. Scorecard 5yr-post-completion median); the slope drives the
# growth shape forward. We use literature-derived slopes from
# Heckman/Lochner/Todd 2006 + Card 1999, with a HS-only variant that has a
# lower slope (less return to experience for non-college workers).
MINCER_GLOBAL_COLLEGE = {
    "intercept":   10.42,
    "exp_coef":    0.062,
    "exp_sq_coef": -0.0011,
}
MINCER_GLOBAL_HS = {
    "intercept":   10.18,
    "exp_coef":    0.038,
    "exp_sq_coef": -0.0007,
}
# CIP-family-specific slopes for fields that diverge materially from the
# all-college average. STEM has steeper growth; arts/education flatter.
MINCER_BY_CIP_FAMILY: dict[str, dict[str, float]] = {
    "11": {"intercept": 10.62, "exp_coef": 0.072, "exp_sq_coef": -0.0011},  # CS
    "14": {"intercept": 10.68, "exp_coef": 0.070, "exp_sq_coef": -0.0011},  # Engineering
    "26": {"intercept": 10.34, "exp_coef": 0.058, "exp_sq_coef": -0.0010},  # Bio sciences
    "27": {"intercept": 10.55, "exp_coef": 0.068, "exp_sq_coef": -0.0011},  # Math/stats
    "40": {"intercept": 10.50, "exp_coef": 0.066, "exp_sq_coef": -0.0011},  # Phys sciences
    "51": {"intercept": 10.48, "exp_coef": 0.058, "exp_sq_coef": -0.0010},  # Health
    "52": {"intercept": 10.45, "exp_coef": 0.064, "exp_sq_coef": -0.0011},  # Business
    "22": {"intercept": 10.50, "exp_coef": 0.064, "exp_sq_coef": -0.0011},  # Legal
    "23": {"intercept": 10.20, "exp_coef": 0.052, "exp_sq_coef": -0.0009},  # English
    "42": {"intercept": 10.18, "exp_coef": 0.050, "exp_sq_coef": -0.0009},  # Psych
    "45": {"intercept": 10.22, "exp_coef": 0.054, "exp_sq_coef": -0.0010},  # Social science
    "13": {"intercept": 10.10, "exp_coef": 0.044, "exp_sq_coef": -0.0008},  # Education
    "50": {"intercept": 10.08, "exp_coef": 0.042, "exp_sq_coef": -0.0008},  # Visual/perf arts
}

# Dale-Krueger shrinkage by CIP family. Higher = more of the cross-sectional
# premium is selection (subtract from premium when the toggle is on).
# 0.10 means "keep 90% of the observed premium"; 0.60 means "keep 40%".
DK_SHRINKAGE_BY_CIP_FAMILY: dict[str, float] = {
    "11": 0.10, "14": 0.10, "26": 0.15, "27": 0.10, "40": 0.10,  # STEM
    "51": 0.20,                                                   # Health
    "52": 0.40,                                                   # Business
    "22": 0.30, "42": 0.55, "45": 0.55, "23": 0.55,               # Soc sci / hum (law lower)
    "13": 0.60, "50": 0.60,                                       # Education / arts
    "_default": 0.40,
}

INCOME_BRACKETS = [
    {"id": "0_30k",     "label": "$0–$30k",     "scorecard_field": "NPT41"},
    {"id": "30_48k",    "label": "$30k–$48k",   "scorecard_field": "NPT42"},
    {"id": "48_75k",    "label": "$48k–$75k",   "scorecard_field": "NPT43"},
    {"id": "75_110k",   "label": "$75k–$110k",  "scorecard_field": "NPT44"},
    {"id": "110k_plus", "label": "$110k+",      "scorecard_field": "NPT45"},
]
DEFAULT_INCOME_BRACKET = "48_75k"

# Map CREDLEV → years to complete. Source: Scorecard Field of Study
# CREDLEV codes (1=undergrad cert, 2=associate's, 3=bachelor's, 4=post-bacc cert,
# 5=master's, 6=doctoral, 7=first-professional, 8=graduate cert).
CREDLEVEL_TO_YEARS: dict[int, int] = {
    1: 1, 2: 2, 3: 4, 4: 5, 5: 6, 6: 8, 7: 7, 8: 5,
}
DEFAULT_YEARS_TO_COMPLETE = 4

DEFAULT_DISCOUNT_RATE = 0.05
DEFAULT_HORIZON_YEARS = 40
DEFAULT_SELECTION_ADJUSTED = False


# ---------------------------------------------------------------------------
# Public: write the constants file
# ---------------------------------------------------------------------------


def publish_roi_constants(*, out_dir: Path) -> Path:
    """Write data/published/roi_constants.json. Idempotent."""
    payload = {
        "hs_grad_baseline_by_state": HS_GRAD_BASELINE_BY_STATE,
        "hs_grad_baseline_global":   _HS_GRAD_GLOBAL,
        "mincer_curves": {
            "global_college": MINCER_GLOBAL_COLLEGE,
            "global_hs_only": MINCER_GLOBAL_HS,
            "by_cip_family":  MINCER_BY_CIP_FAMILY,
        },
        "dk_shrinkage_by_cip_family": DK_SHRINKAGE_BY_CIP_FAMILY,
        "income_brackets": INCOME_BRACKETS,
        "default_income_bracket":  DEFAULT_INCOME_BRACKET,
        "credlevel_to_years":      {str(k): v for k, v in CREDLEVEL_TO_YEARS.items()},
        "default_years_to_complete": DEFAULT_YEARS_TO_COMPLETE,
        "default_discount_rate":   DEFAULT_DISCOUNT_RATE,
        "default_horizon_years":   DEFAULT_HORIZON_YEARS,
        "default_selection_adjusted": DEFAULT_SELECTION_ADJUSTED,
        "provenance": {
            "hs_baseline":  "BLS CPS 2024 Educational Attainment, ages 22-30, HS-only "
                            "(rounded to nearest $100; state-to-state spread reflects "
                            "cost-of-living differences in HS-only earnings)",
            "mincer":       "Heckman-Lochner-Todd 2006 review + Card 1999 returns-to-"
                            "schooling survey; CIP-family slopes adjusted from PUMS-"
                            "calibrated literature averages",
            "dk_shrinkage": "Dale & Krueger 2002, 2014 matched-applicant analyses; "
                            "CIP-family aggregation by editorial judgment from the "
                            "STEM-vs-non-STEM split in the literature",
            "fit_date":     "2026-05",
            "next_refresh": "Annual, with each Scorecard release",
        },
    }
    path = out_dir / "roi_constants.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2, default=str)
    return path


# ---------------------------------------------------------------------------
# Per-program ROI block
# ---------------------------------------------------------------------------


def _cip_family(cip_code: str) -> str:
    """First two digits of a normalized CIP-4 code."""
    digits = cip_code.replace(".", "").zfill(4)
    return digits[:2]


def _years_to_complete(credlev: int) -> int:
    return CREDLEVEL_TO_YEARS.get(credlev, DEFAULT_YEARS_TO_COMPLETE)


def _institution_cost_default(inst: Institution) -> tuple[Optional[int], Optional[str]]:
    """Pick the per-year cost figure and which sector slot it came from.

    Priority: median income bracket (NPT43_*) for the institution's sector;
    fall back to NPT4_PUB / NPT4_PRIV; fall back to cost_attendance.
    Returns (cost, source_label).
    """
    cb = getattr(inst, "cost_by_income", None)
    if cb:
        median = cb.get(DEFAULT_INCOME_BRACKET)
        if median:
            return int(median), f"NPT43_{(cb.get('sector') or 'PRIV').upper()}"
    npt = inst.avg_net_price_pub or inst.avg_net_price_priv
    if npt:
        return int(npt), "NPT4_AVG"
    if inst.cost_attendance:
        return int(inst.cost_attendance), "COSTT4_A"
    return None, None


def _mincer_curve(cip_family: str) -> dict[str, float]:
    return MINCER_BY_CIP_FAMILY.get(cip_family, MINCER_GLOBAL_COLLEGE)


def _dk_shrinkage(cip_family: str) -> float:
    return DK_SHRINKAGE_BY_CIP_FAMILY.get(
        cip_family,
        DK_SHRINKAGE_BY_CIP_FAMILY["_default"],
    )


def _project_earnings(
    *,
    anchor_value: float,
    anchor_exp_years: float,
    target_exp_years: float,
    curve: dict[str, float],
) -> float:
    """Project earnings forward from an anchor using a Mincer slope.

    The intercept is recovered from the anchor (so the curve passes through
    the observed Scorecard median). Returns the projected earnings at
    ``target_exp_years`` of work experience.
    """
    e0, e1 = anchor_exp_years, target_exp_years
    delta = (
        curve["exp_coef"] * (e1 - e0)
        + curve["exp_sq_coef"] * (e1 * e1 - e0 * e0)
    )
    return float(anchor_value * math.exp(delta))


def _compute_npv_and_breakeven(
    *,
    earnings_anchor: float,
    earnings_anchor_year: int,
    hs_baseline: float,
    cost_per_year: float,
    years_to_complete: int,
    horizon_years: int,
    discount_rate: float,
    cip_family: str,
    selection_adjusted: bool,
) -> tuple[float, Optional[int]]:
    """Compute NPV and breakeven year under the user's assumptions.

    Year-0 anchoring: year 0 is "start of college". Cost hits years
    [0 .. years_to_complete-1]; earnings premium starts in year
    ``years_to_complete``. The Scorecard anchor reflects earnings at
    ``earnings_anchor_year`` after completion (typically 5).
    """
    college_curve = _mincer_curve(cip_family)
    hs_curve = MINCER_GLOBAL_HS
    shrink = _dk_shrinkage(cip_family) if selection_adjusted else 0.0

    cumulative = 0.0
    breakeven: Optional[int] = None
    horizon_years = max(horizon_years, years_to_complete + 1)

    for t in range(horizon_years):
        df = 1.0 / ((1.0 + discount_rate) ** t)
        flow = 0.0

        if t < years_to_complete:
            flow -= cost_per_year

        if t >= years_to_complete:
            exp_t = t - years_to_complete  # years since completion
            target_exp = exp_t + 0.0       # college worker exp
            anchor_exp = earnings_anchor_year + 0.0
            college_t = _project_earnings(
                anchor_value=earnings_anchor,
                anchor_exp_years=anchor_exp,
                target_exp_years=target_exp,
                curve=college_curve,
            )
            # HS counterfactual: 22-30 baseline reflects ~4 yrs of work
            # experience. So at calendar year t, HS worker has experience
            # t (started working at year 0 instead of year years_to_complete).
            hs_t = _project_earnings(
                anchor_value=hs_baseline,
                anchor_exp_years=4.0,
                target_exp_years=float(t),
                curve=hs_curve,
            )
            premium = (college_t - hs_t) * (1.0 - shrink)
            flow += premium

        cumulative += flow * df
        if breakeven is None and cumulative > 0 and t >= years_to_complete:
            breakeven = t

    return cumulative, breakeven


def _build_program_roi(
    *,
    program: Program,
    institution: Institution,
) -> dict:
    cip_family = _cip_family(program.cip_code)
    years = _years_to_complete(program.credential_level)
    cost_per_year, cost_src = _institution_cost_default(institution)

    earnings_anchor = program.earnings_median_5yr or program.earnings_median_4yr
    earnings_anchor_year = 5 if program.earnings_median_5yr is not None else 4

    if earnings_anchor is None or cost_per_year is None:
        return {
            "suppressed": True,
            "n_obs": program.earnings_count_5yr or program.earnings_count_4yr or 0,
            "inputs": {
                "years_to_complete": years,
                "cost_per_year_default": cost_per_year,
                "cost_total_default":
                    (cost_per_year * years) if cost_per_year is not None else None,
                "cost_source": cost_src,
                "income_bracket_default": DEFAULT_INCOME_BRACKET,
                "earnings_at_completion": earnings_anchor,
                "earnings_anchor_year": earnings_anchor_year,
                "debt_median": program.debt_median,
                "cip_family": cip_family,
            },
            "default_assumptions": {
                "discount_rate":      DEFAULT_DISCOUNT_RATE,
                "horizon_years":      DEFAULT_HORIZON_YEARS,
                "selection_adjusted": DEFAULT_SELECTION_ADJUSTED,
            },
            "default_result": None,
        }

    state_lower = institution.state.lower()
    hs_baseline = HS_GRAD_BASELINE_BY_STATE.get(state_lower, _HS_GRAD_GLOBAL)

    npv, breakeven = _compute_npv_and_breakeven(
        earnings_anchor=float(earnings_anchor),
        earnings_anchor_year=earnings_anchor_year,
        hs_baseline=float(hs_baseline),
        cost_per_year=float(cost_per_year),
        years_to_complete=years,
        horizon_years=DEFAULT_HORIZON_YEARS,
        discount_rate=DEFAULT_DISCOUNT_RATE,
        cip_family=cip_family,
        selection_adjusted=DEFAULT_SELECTION_ADJUSTED,
    )

    return {
        "suppressed": False,
        "n_obs": program.earnings_count_5yr or program.earnings_count_4yr or 0,
        "inputs": {
            "years_to_complete":       years,
            "cost_per_year_default":   int(cost_per_year),
            "cost_total_default":      int(cost_per_year * years),
            "cost_source":             cost_src,
            "income_bracket_default":  DEFAULT_INCOME_BRACKET,
            "earnings_at_completion":  int(earnings_anchor),
            "earnings_anchor_year":    earnings_anchor_year,
            "debt_median":             program.debt_median,
            "cip_family":              cip_family,
            "hs_baseline_state":       int(hs_baseline),
        },
        "default_assumptions": {
            "discount_rate":      DEFAULT_DISCOUNT_RATE,
            "horizon_years":      DEFAULT_HORIZON_YEARS,
            "selection_adjusted": DEFAULT_SELECTION_ADJUSTED,
        },
        "default_result": {
            "npv":            int(round(npv)),
            "breakeven_year": breakeven,
        },
    }


def build_program_roi(program: Program, institution: Institution) -> dict:
    """Public — used by publish/site.py to attach roi to each program JSON."""
    return _build_program_roi(program=program, institution=institution)


# ---------------------------------------------------------------------------
# Per-institution ROI block (picker)
# ---------------------------------------------------------------------------


def build_institution_roi(
    *,
    institution: Institution,
    programs: list[Program],
) -> Optional[dict]:
    """Build the institution-page ROI picker payload.

    Returns None when the institution has no programs with earnings — the
    Institution template will hide the section in that case.
    """
    if not programs:
        return None

    available = []
    default_slug: Optional[str] = None
    for p in sorted(programs, key=lambda x: (x.completers or 0), reverse=True):
        roi_block = _build_program_roi(program=p, institution=institution)
        has_earnings = not roi_block["suppressed"]
        entry = {
            "slug":              p.slug,
            "label":             f"{p.cip_desc.rstrip('.')} · {p.credential_desc}",
            "cip_family":        roi_block["inputs"]["cip_family"],
            "completers":        p.completers,
            "has_earnings":      has_earnings,
            "earnings_at_completion": roi_block["inputs"]["earnings_at_completion"],
            "earnings_anchor_year":   roi_block["inputs"]["earnings_anchor_year"],
            "debt_median":       p.debt_median,
            "years_to_complete": roi_block["inputs"]["years_to_complete"],
            "default_result":    roi_block["default_result"],
        }
        available.append(entry)
        if default_slug is None and has_earnings:
            default_slug = p.slug

    return {
        "default_program_slug": default_slug,
        "programs_available":   available,
    }



"""Template-rendered summary lines for each flag type.

Inputs are structured (numbers, names, years); outputs are short editorial
sentences. No LLM in the loop. Mirrors pollution-data/flags/prose.py.
"""

from __future__ import annotations


METRIC_LABELS = {
    "completion_rate_150": "150%-time completion",
    "completion_rate_100": "100%-time completion",
    "retention_rate": "first-year retention",
    "enrollment_undergrad": "undergraduate enrollment",
    "tuition_in_state": "in-state tuition",
    "tuition_out_of_state": "out-of-state tuition",
    "median_debt": "median federal debt at exit",
    "default_rate": "3-year cohort default rate",
    "pell_share": "Pell share",
    "earnings_median_5yr": "5-year median earnings",
    "earnings_median_6yr": "6-year median earnings",
    "earnings_median_8yr": "8-year median earnings",
    "earnings_median_10yr": "10-year median earnings",
    "completers": "annual completers",
    "debt_median": "median program debt at exit",
}


def _money(v: float) -> str:
    if v >= 1_000_000:
        return f"${v / 1_000_000:.1f}M"
    if v >= 1_000:
        return f"${v / 1_000:.1f}k"
    return f"${v:.0f}"


def _count(v: float) -> str:
    if v >= 1_000_000:
        return f"{v / 1_000_000:.1f}M"
    if v >= 1_000:
        return f"{v / 1_000:.1f}k"
    return f"{v:.0f}"


def _rate(v: float) -> str:
    return f"{v * 100:.1f}%"


def _fmt_metric(metric: str, v: float) -> str:
    """Format a value in its native units."""
    if metric in {"tuition_in_state", "tuition_out_of_state", "median_debt",
                  "debt_median", "earnings_median_4yr", "earnings_median_5yr",
                  "earnings_median_6yr", "earnings_median_8yr",
                  "earnings_median_10yr", "cost_attendance",
                  "avg_net_price_pub", "avg_net_price_priv"}:
        return _money(v)
    if metric in {"completion_rate_150", "completion_rate_100", "retention_rate",
                  "admission_rate", "default_rate", "pell_share"}:
        return _rate(v)
    return _count(v)


def render_long_arc(metric: str, label: str, scope: str,
                    pct: float, from_year: int, to_year: int,
                    from_value: float, to_value: float) -> str:
    """e.g. 'In-state tuition at Oregon State rose 95% between 2000 and 2009 ($3,654 → $7,140).'"""
    abs_pct = abs(pct)
    direction = "fell" if pct < 0 else "rose"
    val_from = _fmt_metric(metric, from_value)
    val_to = _fmt_metric(metric, to_value)
    return (
        f"{label} at {scope} {direction} {abs_pct:.0f}% between {from_year} "
        f"and {to_year} ({val_from} → {val_to})."
    )


def render_earnings_trend(scope: str, pct: float, from_year: int,
                          to_year: int, from_value: float,
                          to_value: float) -> str:
    """e.g. 'Earnings 10 years post-entry are 117% above 4-year earnings ($26k → $58k).'"""
    abs_pct = abs(pct)
    direction = "below" if pct < 0 else "above"
    return (
        f"Earnings {to_year} years post-entry at {scope} are {abs_pct:.0f}% "
        f"{direction} {from_year}-year earnings "
        f"({_money(from_value)} → {_money(to_value)})."
    )


def render_peer_outlier(scope: str, sigma: float, value: float,
                        peer_median: float, peer_label: str) -> str:
    """e.g. '10-year earnings at OSU are 38% above the public-bachelors peer median ($58k vs $42k).'

    Reader-facing prose uses % rather than σ — most readers don't have an
    intuition for sigma, but everyone reads percentages. Sigma is still
    used internally to pick the threshold for which institutions trigger.
    """
    pct = ((value - peer_median) / peer_median * 100.0) if peer_median > 0 else 0.0
    direction = "below" if pct < 0 else "above"
    return (
        f"10-year earnings at {scope} are {abs(pct):.0f}% {direction} "
        f"the {peer_label} median ({_money(value)} vs {_money(peer_median)})."
    )


def render_completion_drop(scope: str, current: float, baseline: float,
                           pct_pp: float, baseline_first_year: int,
                           baseline_last_year: int) -> str:
    """e.g. 'Completion fell 12 pp at SOU vs the 2009-2014 baseline (49% vs 61%).'"""
    return (
        f"150%-time completion fell {abs(pct_pp):.0f} pp at {scope} vs the "
        f"{baseline_first_year}–{baseline_last_year} baseline "
        f"({_rate(current)} vs {_rate(baseline)})."
    )


def render_enrollment_cliff(scope: str, current: float, baseline: float,
                            pct: float, baseline_first_year: int,
                            baseline_last_year: int) -> str:
    """e.g. 'Undergrad enrollment fell 27% at Marylhurst vs the 2004-2009 baseline (1.2k vs 1.6k).'"""
    direction = "fell" if pct < 0 else "rose"
    return (
        f"Undergraduate enrollment {direction} {abs(pct) * 100:.0f}% at {scope} "
        f"vs the {baseline_first_year}–{baseline_last_year} baseline "
        f"({_count(current)} vs {_count(baseline)})."
    )


def render_debt_earnings_warning(scope: str, ratio: float, debt: float,
                                 earnings: float, threshold: float = 0.08) -> str:
    """e.g. 'Debt-to-earnings ratio of 11.4% at Phagans exceeds the 8% gainful-employment threshold.'"""
    return (
        f"Debt-to-earnings ratio of {ratio * 100:.1f}% at {scope} exceeds the "
        f"{threshold * 100:.0f}% gainful-employment threshold "
        f"({_money(debt)} debt amortized over 10 years vs {_money(earnings)} earnings)."
    )

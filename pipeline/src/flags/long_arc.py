"""long_arc_shift detector — wraps existing aggregate.compute_long_arc results.

The pipeline already emits ``LongArcShift`` records on every entity. This
detector promotes the editorially-loaded ones (rose tuition, fell completion,
etc.) into typed Flag rows so they sort alongside the other anomalies.

The ``detect_short_arcs`` helper computes a parallel set of arcs over a much
shorter lookback (default 8 years) for the anomaly engine — 25-year tuition
drift mostly tracks inflation and produces astronomical % changes that drown
out genuine recent signals.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..models import HistoryPoint, Institution, LongArcShift
from .prose import METRIC_LABELS, render_long_arc
from .types import Flag, FlagSeverity


# Direction → severity mapping per metric. Same convention as the frontend's
# LongArcCards: rose enrollment/completion/retention is good; rose tuition /
# debt / default is bad. "neutral" metrics suppress the flag (no editorial
# signal worth surfacing as a separate card).
ROSE_IS_REGRESSION: dict[str, bool] = {
    "tuition_in_state": True,
    "tuition_out_of_state": True,
    "median_debt": True,
    "default_rate": True,
    "cost_attendance": True,
    "avg_net_price_pub": True,
    "avg_net_price_priv": True,
    "enrollment_undergrad": False,
    "completion_rate_150": False,
    "completion_rate_100": False,
    "retention_rate": False,
    "completers": False,
    "earnings_median_5yr": False,
    "earnings_median_4yr": False,
    "earnings_median_6yr": False,
    "earnings_median_8yr": False,
    "earnings_median_10yr": False,
    "debt_median": True,
}


def _classify(arc: LongArcShift) -> FlagSeverity:
    rose_is_bad = ROSE_IS_REGRESSION.get(arc.metric)
    if rose_is_bad is None:
        return "neutral"
    if arc.direction == "flat":
        return "neutral"
    rose = arc.direction == "rose"
    if rose_is_bad:
        return "regression" if rose else "improvement"
    return "improvement" if rose else "regression"


SHORT_ARC_LOOKBACK_YEARS = 3
SHORT_ARC_MIN_PCT_CHANGE = 0.10


def detect_short_arcs(inst: Institution, *,
                      lookback_years: int = SHORT_ARC_LOOKBACK_YEARS) -> list[Flag]:
    """Compute Flag records for shifts in the last N years of each metric.

    Used by the anomaly engine instead of the 25-year ``inst.long_arc``
    records. Same metric coverage and direction-tone mapping as the long-arc
    cards; just scoped to the recent window so the % changes are meaningful.
    """
    from ..ingest.scorecard_history import compute_long_arc
    history_attrs: dict[str, list[HistoryPoint]] = {
        "completion_rate_150": inst.history.completion_rate_150,
        "completion_rate_100": inst.history.completion_rate_100,
        "retention_rate": inst.history.retention_rate,
        "enrollment_undergrad": inst.history.enrollment_undergrad,
        "tuition_in_state": inst.history.tuition_in_state,
        "tuition_out_of_state": inst.history.tuition_out_of_state,
        "median_debt": inst.history.median_debt,
        "default_rate": inst.history.default_rate,
        "earnings_median_10yr": inst.history.earnings_median_10yr,
    }
    out: list[Flag] = []
    for metric, history in history_attrs.items():
        result = compute_long_arc(
            history,
            metric=metric,
            min_baseline=0.0,
            min_pct_change=SHORT_ARC_MIN_PCT_CHANGE,
            lookback_years=lookback_years,
        )
        if result is None:
            continue
        from ..models import LongArcShift  # local import to avoid cycle
        arc = LongArcShift(**result)
        flag = long_arc_to_flag(arc, scope=inst.name)
        if flag.severity == "neutral":
            continue
        out.append(flag)
    return out


def long_arc_to_flag(arc: LongArcShift, scope: str,
                     history: list[dict] | None = None) -> Flag:
    severity = _classify(arc)
    label = METRIC_LABELS.get(arc.metric, arc.metric)
    summary = render_long_arc(
        metric=arc.metric,
        label=label.capitalize(),
        scope=scope,
        pct=arc.pct_change * 100,
        from_year=arc.from_year,
        to_year=arc.to_year,
        from_value=arc.from_value,
        to_value=arc.to_value,
    )
    return Flag(
        type="long_arc_shift",
        severity=severity,
        label=label.capitalize(),
        summary=summary,
        magnitude_pct=round(arc.pct_change * 100, 1),
        magnitude_abs=round(arc.to_value - arc.from_value, 2),
        baseline_year=arc.from_year,
        recent_year=arc.to_year,
        units="%" if "rate" in arc.metric or "share" in arc.metric else None,
        history=history or [],
        metric=arc.metric,
    )

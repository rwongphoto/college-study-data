"""Roll institutions + programs up into state / city payloads.

Computes long-arc shifts deterministically — never predictive. Suppressed cells
stay None throughout; integer-typed history points are coerced back to int when
required.

No anomaly engine yet: that ships in v2 calibrated against the 50-state corpus.
"""
from __future__ import annotations

import statistics
from collections import defaultdict
from typing import Optional

from ..ingest.scorecard_history import compute_long_arc
from ..models import (
    CityAgg,
    HistoryPoint,
    Institution,
    LongArcShift,
    Program,
    Source,
    StateAgg,
)
from ..normalize.text import STATE_NAMES


# Long-arc trigger thresholds per metric (kept conservative). Calibration will
# tighten these against the national corpus; for the Oregon test we use generic
# materiality floors that surface visible movement without false positives.
LONG_ARC_THRESHOLDS = {
    "completion_rate_150": dict(min_baseline=0.05, min_pct_change=0.20),
    "enrollment_undergrad": dict(min_baseline=200, min_pct_change=0.20),
    "tuition_in_state": dict(min_baseline=1000, min_pct_change=0.30),
    "tuition_out_of_state": dict(min_baseline=1000, min_pct_change=0.30),
    "median_debt": dict(min_baseline=1000, min_pct_change=0.20),
    "default_rate": dict(min_baseline=0.02, min_pct_change=0.30),
    "pell_share": dict(min_baseline=0.05, min_pct_change=0.20),
    "retention_rate": dict(min_baseline=0.05, min_pct_change=0.10),
    "earnings_median_10yr": dict(min_baseline=15000, min_pct_change=0.20),
    "earnings_median_8yr": dict(min_baseline=15000, min_pct_change=0.20),
    "earnings_median_6yr": dict(min_baseline=15000, min_pct_change=0.20),
}


def _median_or_none(values: list[Optional[float]]) -> Optional[float]:
    cleaned = [v for v in values if v is not None]
    if not cleaned:
        return None
    return float(statistics.median(cleaned))


def _institution_card(inst: Institution) -> dict:
    """Compact institution dict embedded in rollups."""
    completion_history = [p.model_dump() for p in inst.history.completion_rate_150]
    enrollment_history = [p.model_dump() for p in inst.history.enrollment_undergrad]
    earnings_history = [
        {"year": 4, "value": inst.earnings_median_4yr},
        {"year": 5, "value": inst.earnings_median_5yr},
        {"year": 6, "value": inst.earnings_median_6yr},
        {"year": 8, "value": inst.earnings_median_8yr},
        {"year": 10, "value": inst.earnings_median_10yr},
    ]
    return {
        "unitid": inst.unitid,
        "slug": inst.slug,
        "name": inst.name,
        "city": inst.city,
        "city_slug": inst.city_slug,
        "control": inst.control,
        "pred_degree": inst.pred_degree,
        "earnings_median_5yr": inst.earnings_median_5yr,
        "earnings_median_10yr": inst.earnings_median_10yr,
        "earnings_progression": earnings_history,
        "completion_rate_150": inst.completion_rate_150,
        "completion_rate_history": completion_history,
        "enrollment_undergrad": inst.enrollment_undergrad,
        "enrollment_history": enrollment_history,
        "median_debt": inst.median_debt,
        "default_rate": inst.default_rate,
        "tuition_in_state": inst.tuition_in_state,
        "tuition_out_of_state": inst.tuition_out_of_state,
        "long_arc": [la.model_dump() for la in inst.long_arc],
    }


def detect_institution_long_arcs(inst: Institution) -> list[LongArcShift]:
    """Run the long-arc detector across every metric with history on this inst."""
    out: list[LongArcShift] = []
    history_attrs = {
        "completion_rate_150": inst.history.completion_rate_150,
        "completion_rate_100": inst.history.completion_rate_100,
        "retention_rate": inst.history.retention_rate,
        "enrollment_undergrad": inst.history.enrollment_undergrad,
        "tuition_in_state": inst.history.tuition_in_state,
        "tuition_out_of_state": inst.history.tuition_out_of_state,
        "median_debt": inst.history.median_debt,
        "default_rate": inst.history.default_rate,
        "pell_share": inst.history.pell_share,
        "earnings_median_10yr": inst.history.earnings_median_10yr,
        "earnings_median_8yr": inst.history.earnings_median_8yr,
        "earnings_median_6yr": inst.history.earnings_median_6yr,
    }
    for metric, history in history_attrs.items():
        thresholds = LONG_ARC_THRESHOLDS.get(metric, dict(min_baseline=0.0, min_pct_change=0.20))
        result = compute_long_arc(history, metric=metric, **thresholds)
        if result is not None:
            out.append(LongArcShift(**result))
    return out


def detect_program_long_arcs(prog: Program) -> list[LongArcShift]:
    """Long-arc on program-level earnings + debt across FoS vintages."""
    out: list[LongArcShift] = []
    history_attrs = {
        "earnings_median_5yr": prog.history.earnings_median_5yr,
        "earnings_median_4yr": prog.history.earnings_median_4yr,
        "debt_median": prog.history.debt_median,
        "completers": prog.history.completers,
    }
    for metric, history in history_attrs.items():
        result = compute_long_arc(
            history,
            metric=metric,
            min_baseline=1000,
            min_pct_change=0.20,
        )
        if result is not None:
            out.append(LongArcShift(**result))
    return out


def _state_history(
    institutions: list[Institution],
    metric: str,
    *,
    aggregator: str = "median",
) -> list[HistoryPoint]:
    """Collapse all institutions' per-year values for a metric into one series.

    `aggregator='median'` — median across institutions reporting that year (best
    for rate metrics like completion).
    `aggregator='sum'` — sum (best for enrollment).
    """
    by_year: dict[int, list[float]] = defaultdict(list)
    for inst in institutions:
        history = getattr(inst.history, metric, [])
        for p in history:
            if p.value is not None:
                by_year[p.year].append(float(p.value))
    out: list[HistoryPoint] = []
    for year in sorted(by_year):
        values = by_year[year]
        if not values:
            continue
        if aggregator == "sum":
            out.append(HistoryPoint(year=year, value=float(sum(values))))
        else:
            out.append(HistoryPoint(year=year, value=float(statistics.median(values))))
    return out


def build_state_agg(
    state: str,
    institutions: list[Institution],
    cities: list[CityAgg],
    source: Source,
) -> StateAgg:
    by_control: dict[str, int] = defaultdict(int)
    by_pred: dict[str, int] = defaultdict(int)
    for i in institutions:
        by_control[i.control] += 1
        by_pred[i.pred_degree] += 1

    top_earnings = sorted(
        [i for i in institutions if i.earnings_median_10yr is not None],
        key=lambda i: i.earnings_median_10yr or 0,
        reverse=True,
    )[:10]
    top_completion = sorted(
        [i for i in institutions if i.completion_rate_150 is not None],
        key=lambda i: i.completion_rate_150 or 0.0,
        reverse=True,
    )[:10]

    state_earn_median = _median_or_none(
        [i.earnings_median_10yr for i in institutions]
    )
    state_compl_median = _median_or_none(
        [i.completion_rate_150 for i in institutions]
    )

    completion_history = _state_history(institutions, "completion_rate_150", aggregator="median")
    enrollment_history = _state_history(institutions, "enrollment_undergrad", aggregator="sum")
    tuition_history = _state_history(institutions, "tuition_in_state", aggregator="median")

    # State-level long-arc on aggregated history series
    state_long_arcs: list[LongArcShift] = []
    for hist, metric, base, mp in [
        (completion_history, "completion_rate_150", 0.05, 0.10),
        (enrollment_history, "enrollment_undergrad", 5000, 0.10),
        (tuition_history, "tuition_in_state", 1000, 0.20),
    ]:
        result = compute_long_arc(hist, metric=metric, min_baseline=base, min_pct_change=mp)
        if result is not None:
            state_long_arcs.append(LongArcShift(**result))

    return StateAgg(
        state=state.lower(),
        name=STATE_NAMES.get(state.upper(), state),
        institution_count=len(institutions),
        institutions_by_control=dict(by_control),
        institutions_by_pred_degree=dict(by_pred),
        earnings_median_state=int(state_earn_median) if state_earn_median is not None else None,
        completion_rate_state=state_compl_median,
        completion_history_state=completion_history,
        enrollment_history_state=enrollment_history,
        tuition_history_state=tuition_history,
        top_by_earnings=[_institution_card(i) for i in top_earnings],
        top_by_completion=[_institution_card(i) for i in top_completion],
        cities=[
            {
                "slug": c.slug,
                "name": c.name,
                "institution_count": c.institution_count,
                "earnings_median_city": c.earnings_median_city,
                "completion_rate_city": c.completion_rate_city,
            }
            for c in sorted(cities, key=lambda c: c.institution_count, reverse=True)
        ],
        institutions=[_institution_card(i) for i in sorted(institutions, key=lambda i: i.name)],
        long_arc=state_long_arcs,
        source=source,
    )


def build_city_aggs(
    state: str,
    institutions: list[Institution],
    source: Source,
) -> list[CityAgg]:
    by_city: dict[tuple[str, str], list[Institution]] = defaultdict(list)
    for i in institutions:
        key = (i.city, i.city_slug)
        by_city[key].append(i)

    out: list[CityAgg] = []
    for (city, slug), members in by_city.items():
        completion_history = _state_history(members, "completion_rate_150", aggregator="median")
        enrollment_history = _state_history(members, "enrollment_undergrad", aggregator="sum")
        out.append(
            CityAgg(
                state=state.lower(),
                name=city,
                slug=slug,
                institution_count=len(members),
                institutions=[_institution_card(i) for i in sorted(members, key=lambda i: i.name)],
                earnings_median_city=int(_median_or_none([i.earnings_median_10yr for i in members]) or 0) or None,
                completion_rate_city=_median_or_none([i.completion_rate_150 for i in members]),
                completion_history_city=completion_history,
                enrollment_history_city=enrollment_history,
                source=source,
            )
        )
    return out


def attach_programs(
    institution: Institution,
    programs: list[Program],
) -> dict:
    """Build the institution-page payload."""
    by_family: dict[str, list[dict]] = defaultdict(list)
    flat: list[dict] = []
    for p in programs:
        cip4 = p.cip_code.replace(".", "").zfill(4)
        cip2 = cip4[:2]
        record = {
            "slug": p.slug,
            "cip_code": p.cip_code,
            "cip_desc": p.cip_desc,
            "credential_level": p.credential_level,
            "credential_desc": p.credential_desc,
            "earnings_median_5yr": p.earnings_median_5yr,
            "earnings_median_4yr": p.earnings_median_4yr,
            "earnings_history_5yr": [pt.model_dump() for pt in p.history.earnings_median_5yr],
            "earnings_history_4yr": [pt.model_dump() for pt in p.history.earnings_median_4yr],
            "debt_median": p.debt_median,
            "debt_history": [pt.model_dump() for pt in p.history.debt_median],
            "completers": p.completers,
            "completers_single_year": p.completers_single_year,
            "completers_history": [pt.model_dump() for pt in p.history.completers],
            "long_arc": [la.model_dump() for la in p.long_arc],
        }
        by_family[cip2].append(record)
        flat.append(record)

    for cip2 in by_family:
        by_family[cip2].sort(
            key=lambda r: (r["completers"] or 0),
            reverse=True,
        )
    flat.sort(key=lambda r: (r["completers"] or 0), reverse=True)

    return {
        "institution": institution.model_dump(),
        "programs_by_family": dict(sorted(by_family.items())),
        "programs": flat,
        "program_count": len(flat),
    }

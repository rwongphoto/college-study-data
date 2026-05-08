"""Anomaly engine orchestration — load institutions, run all 6 detectors,
return Flag rows. Mirrors pollution-data/flags/engine.py.

Caps per geography (calibrated for an Oregon test build; will be tightened
once we go national):
- institution: ≤ 4 flags
- state:       ≤ 8 flags
- program:     ≤ 3 flags
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..models import Institution, Program, StateAgg

from .completion_drop import detect_completion_drop
from .debt_earnings import (
    detect_institution_debt_earnings,
    detect_program_debt_earnings,
)
from .earnings_trend import detect_earnings_trend
from .enrollment_cliff import detect_enrollment_cliff
from .long_arc import detect_short_arcs, long_arc_to_flag
from .peer_outlier import detect_peer_outlier
from .types import Flag, severity_weight


log = logging.getLogger(__name__)


CAPS = {
    "institution": 4,
    "state": 8,
    "program": 3,
}


def _sort_and_cap(flags: list[Flag], cap: int | None) -> list[Flag]:
    flags.sort(
        key=lambda f: (
            severity_weight(f.severity),
            abs(f.magnitude_pct or 0),
        ),
        reverse=True,
    )
    if cap is None:
        return flags
    return flags[:cap]


def run_institution(
    inst: Institution,
    *,
    pool: list[Institution],
) -> list[Flag]:
    """Detect every flag type that applies to one institution."""
    out: list[Flag] = []

    # Short-arc shifts (recent 3-year window). 25-year drift mostly tracks
    # inflation; a 3-year move is a real present-day signal. The full
    # long-arc records still feed the dedicated LongArcCards section.
    out.extend(detect_short_arcs(inst))

    cd = detect_completion_drop(inst)
    if cd:
        out.append(cd)
    ec = detect_enrollment_cliff(inst)
    if ec:
        out.append(ec)
    de = detect_institution_debt_earnings(inst)
    if de:
        out.append(de)
    po = detect_peer_outlier(inst, pool=pool)
    if po:
        out.append(po)
    et = detect_earnings_trend(inst, pool=pool)
    if et:
        out.append(et)

    return _sort_and_cap(out, CAPS["institution"])


def run_program(prog: Program, scope: str) -> list[Flag]:
    """Detect program-level flags. Currently just D/E and program long-arcs."""
    out: list[Flag] = []
    for arc in prog.long_arc:
        flag = long_arc_to_flag(arc, scope=scope)
        if flag.severity == "neutral":
            continue
        out.append(flag)
    de = detect_program_debt_earnings(prog, scope=scope)
    if de:
        out.append(de)
    return _sort_and_cap(out, CAPS["program"])


def run_state(state_agg: StateAgg) -> list[Flag]:
    """Detect state-level flags. Long-arcs only — peer/completion/enrollment
    detectors are institution-scoped."""
    out: list[Flag] = []
    for arc in state_agg.long_arc:
        flag = long_arc_to_flag(arc, scope=state_agg.name + " statewide")
        if flag.severity == "neutral":
            continue
        out.append(flag)
    return _sort_and_cap(out, CAPS["state"])


def aggregate_state_flags(institutions: list[Institution]) -> list[Flag]:
    """Roll up institution-level flags to surface on the state hub.

    Picks a small set of the most editorially weighted institution flags
    (severity desc, then magnitude). Used to populate the state's "Watch
    list" section without re-running detectors against state aggregates.
    """
    pool = institutions
    rolled: list[Flag] = []
    for inst in institutions:
        for f in run_institution(inst, pool=pool):
            # Prefix the label with the institution name so the card is
            # legible without scope context.
            f2 = f.model_copy(update={"label": f"{inst.name} · {f.label}"})
            rolled.append(f2)
    return _sort_and_cap(rolled, CAPS["state"])


def __init__() -> None:  # pragma: no cover - module init only
    pass

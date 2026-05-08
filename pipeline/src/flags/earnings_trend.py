"""earnings_trend detector — uses 4/5/6/8/10y horizon progression.

College Scorecard publishes earnings at multiple post-entry horizons in a
single vintage. We surface a flag when the slope from the earliest horizon
to 10y differs from what the sector-peer set sees. Interpretive
shorthand: "earnings rose more than peers" / "earnings flatter than peers".
"""

from __future__ import annotations

import statistics
from typing import Optional

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..models import Institution
from .prose import render_earnings_trend
from .types import Flag


PEER_SET_MIN = 5
SLOPE_DIFF_THRESHOLD = 0.20  # 20 percentage points difference vs peer median


def _horizon_pct(inst: Institution) -> Optional[tuple[int, int, float, float, float]]:
    """Earliest available earnings horizon → 10y, return (from_yr, to_yr, from_v, to_v, pct_change)."""
    if inst.earnings_median_10yr is None:
        return None
    horizons = [
        (4, inst.earnings_median_4yr),
        (5, inst.earnings_median_5yr),
        (6, inst.earnings_median_6yr),
        (8, inst.earnings_median_8yr),
    ]
    earliest = next(((y, v) for y, v in horizons if v is not None and v > 0), None)
    if earliest is None:
        return None
    from_yr, from_v = earliest
    to_v = float(inst.earnings_median_10yr)
    if from_v <= 0:
        return None
    return from_yr, 10, float(from_v), to_v, (to_v - from_v) / from_v


def detect_earnings_trend(
    inst: Institution,
    *,
    pool: list[Institution],
) -> Optional[Flag]:
    """Compare this institution's 4y→10y slope against sector peers'."""
    own = _horizon_pct(inst)
    if own is None:
        return None
    own_pct = own[4]

    peer_pcts: list[float] = []
    for i in pool:
        if i.unitid == inst.unitid:
            continue
        if i.control != inst.control or i.pred_degree != inst.pred_degree:
            continue
        peer_h = _horizon_pct(i)
        if peer_h is not None:
            peer_pcts.append(peer_h[4])
    if len(peer_pcts) < PEER_SET_MIN:
        return None

    peer_med = statistics.median(peer_pcts)
    slope_diff = own_pct - peer_med
    if abs(slope_diff) < SLOPE_DIFF_THRESHOLD:
        return None

    severity = "improvement" if slope_diff > 0 else "regression"
    summary = render_earnings_trend(
        scope=inst.name,
        pct=own_pct * 100,
        from_year=own[0],
        to_year=own[1],
        from_value=own[2],
        to_value=own[3],
    )
    return Flag(
        type="earnings_trend",
        severity=severity,
        label="Earnings trend · post-entry horizons",
        summary=summary,
        magnitude_pct=round(own_pct * 100, 1),
        magnitude_abs=round(own[3] - own[2], 0),
        baseline_year=own[0],
        recent_year=own[1],
        units="$",
        metric="earnings_progression",
    )

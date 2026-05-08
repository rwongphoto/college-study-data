"""peer_outlier detector — institution earnings σ-score vs sector peer median.

Peers are defined as institutions in the same state with the same control
(public / private nonprofit / for-profit) and the same predominant credential
level. We use median + median absolute deviation rather than mean + stdev so
the score isn't pulled by a single OHSU-style outlier.
"""

from __future__ import annotations

import statistics
from typing import Optional

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..models import Institution
from .prose import render_peer_outlier
from .types import Flag


# Trigger thresholds. Tighter than the +/- 2σ floor used in the design mock
# because federal Scorecard data has a long tail at both ends and triggering
# at 2.0 fires too often.
PEER_SET_MIN = 5
ABS_FLOOR_EARNINGS = 25_000
SIGMA_THRESHOLD = 1.5


def _peer_label(control: str, pred_degree: str) -> str:
    """Match render_peer_outlier — short editorial label for the peer set."""
    pretty_control = {
        "public": "public",
        "private_nonprofit": "private nonprofit",
        "private_forprofit": "for-profit",
    }.get(control, control)
    pretty_pred = {
        "certificate": "certificate",
        "associates": "associate's",
        "bachelors": "bachelor's",
        "graduate": "graduate",
    }.get(pred_degree, pred_degree)
    return f"{pretty_control} {pretty_pred}-predominant peer"


def _madn(values: list[float], median: float) -> float:
    """Median absolute deviation, scaled by 1.4826 to approximate σ."""
    if not values:
        return 0.0
    abs_dev = [abs(v - median) for v in values]
    mad = statistics.median(abs_dev)
    return mad * 1.4826


def detect_peer_outlier(
    inst: Institution,
    *,
    pool: list[Institution],
) -> Optional[Flag]:
    """Score one institution's 10y earnings against its sector-peer median.

    Returns a Flag when |σ| ≥ SIGMA_THRESHOLD with a peer set of ≥ 5.
    """
    if inst.earnings_median_10yr is None:
        return None
    if inst.earnings_median_10yr < ABS_FLOOR_EARNINGS:
        return None

    peers = [
        i for i in pool
        if i.unitid != inst.unitid
        and i.control == inst.control
        and i.pred_degree == inst.pred_degree
        and i.earnings_median_10yr is not None
    ]
    if len(peers) < PEER_SET_MIN:
        return None

    peer_values = [float(i.earnings_median_10yr or 0) for i in peers]
    peer_median = statistics.median(peer_values)
    sigma_unit = _madn(peer_values, peer_median)
    if sigma_unit <= 0:
        return None

    sigma = (inst.earnings_median_10yr - peer_median) / sigma_unit
    if abs(sigma) < SIGMA_THRESHOLD:
        return None

    severity = "warning" if sigma < 0 else "improvement"
    label = _peer_label(inst.control, inst.pred_degree)
    summary = render_peer_outlier(
        scope=inst.name,
        sigma=sigma,
        value=float(inst.earnings_median_10yr),
        peer_median=peer_median,
        peer_label=label,
    )
    return Flag(
        type="peer_outlier",
        severity=severity,
        label=label.capitalize(),
        summary=summary,
        magnitude_pct=round(
            (inst.earnings_median_10yr - peer_median) / peer_median * 100, 1
        ),
        magnitude_abs=round(inst.earnings_median_10yr - peer_median, 2),
        recent_year=0,  # current vintage; no year tag
        units="$",
        metric="earnings_median_10yr",
    )

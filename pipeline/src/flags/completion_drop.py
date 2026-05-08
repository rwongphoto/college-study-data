"""completion_drop detector — completion fell sharply vs 5-year baseline.

Mirrors the design mock's "Completion drop −12pp at SOU vs 5-year baseline".
We require a baseline of ≥ 4 historical points to avoid noisy single-year
deltas, and a current value below baseline mean − threshold (in pp).
"""

from __future__ import annotations

import statistics
from typing import Optional

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..models import Institution
from .prose import render_completion_drop
from .types import Flag


BASELINE_LOOKBACK_YEARS = 6   # most-recent baseline window starts ~6yr ago
BASELINE_MIN_POINTS = 4       # need ≥4 historical points
DROP_PP_THRESHOLD = 0.05      # 5 percentage points


def detect_completion_drop(inst: Institution) -> Optional[Flag]:
    """Compare current 150% completion to the institution's older baseline."""
    current = inst.completion_rate_150
    if current is None:
        return None

    history = inst.history.completion_rate_150
    if not history:
        return None

    most_recent_year = max(p.year for p in history)
    baseline_pts = [
        p for p in history
        if p.value is not None
        and p.year < most_recent_year - 1
        and p.year >= most_recent_year - BASELINE_LOOKBACK_YEARS
    ]
    if len(baseline_pts) < BASELINE_MIN_POINTS:
        return None

    baseline_mean = statistics.mean([p.value for p in baseline_pts])
    delta = current - baseline_mean
    if delta > -DROP_PP_THRESHOLD:
        return None

    baseline_first = min(p.year for p in baseline_pts)
    baseline_last = max(p.year for p in baseline_pts)

    summary = render_completion_drop(
        scope=inst.name,
        current=current,
        baseline=baseline_mean,
        pct_pp=delta * 100,
        baseline_first_year=baseline_first,
        baseline_last_year=baseline_last,
    )
    return Flag(
        type="completion_drop",
        severity="regression",
        label="150%-time completion",
        summary=summary,
        magnitude_pct=round(delta * 100, 1),
        magnitude_abs=round(current - baseline_mean, 4),
        baseline_year=baseline_last,
        recent_year=most_recent_year,
        units="pp",
        history=[{"year": p.year, "value": p.value}
                 for p in history if p.value is not None],
        metric="completion_rate_150",
    )

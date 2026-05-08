"""enrollment_cliff detector — undergrad enrollment fell sharply vs baseline.

The design mock surfaces "Enrollment down 18% YoY". We compute against the
5-year mean rather than YoY because IPEDS has missing-vintage gaps and
single-year deltas are noisy. Floor of 200 students keeps tiny-cohort noise
out.
"""

from __future__ import annotations

import statistics
from typing import Optional

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..models import Institution
from .prose import render_enrollment_cliff
from .types import Flag


BASELINE_LOOKBACK_YEARS = 6
BASELINE_MIN_POINTS = 4
CLIFF_PCT_THRESHOLD = 0.20    # 20% decline
ABSOLUTE_FLOOR = 200          # current enrollment must be ≥ 200


def detect_enrollment_cliff(inst: Institution) -> Optional[Flag]:
    current = inst.enrollment_undergrad
    if current is None or current < ABSOLUTE_FLOOR:
        return None

    history = inst.history.enrollment_undergrad
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
    if baseline_mean <= 0:
        return None
    pct = (current - baseline_mean) / baseline_mean
    if pct > -CLIFF_PCT_THRESHOLD:
        return None

    baseline_first = min(p.year for p in baseline_pts)
    baseline_last = max(p.year for p in baseline_pts)

    summary = render_enrollment_cliff(
        scope=inst.name,
        current=float(current),
        baseline=baseline_mean,
        pct=pct,
        baseline_first_year=baseline_first,
        baseline_last_year=baseline_last,
    )
    return Flag(
        type="enrollment_cliff",
        severity="regression",
        label="Undergraduate enrollment",
        summary=summary,
        magnitude_pct=round(pct * 100, 1),
        magnitude_abs=round(current - baseline_mean, 0),
        baseline_year=baseline_last,
        recent_year=most_recent_year,
        units="students",
        history=[{"year": p.year, "value": p.value}
                 for p in history if p.value is not None],
        metric="enrollment_undergrad",
    )

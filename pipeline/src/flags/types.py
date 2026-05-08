"""Flag dataclass + literal types. Mirrors ``frontend/src/lib/types.ts`` Flag.

Mirrors the pollution-data anomaly engine shape so the frontend rendering
component can be ported directly. ``severity`` is editorially loaded — a
positive trend (rose enrollment, fell debt) lands as ``improvement``; a
negative one as ``regression``. ``surge`` / ``drop`` are reserved for
year-over-year movements where the editorial weight is "this changed
sharply" rather than "this drifted across a decade."
"""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


FlagType = Literal[
    "long_arc_shift",          # multi-year first→last delta on any metric
    "earnings_trend",          # earnings rose/fell across 4/5/6/8/10y horizons
    "peer_outlier",            # institution σ-score vs sector-peer median
    "completion_drop",         # completion fell sharply vs 5-year baseline
    "enrollment_cliff",        # enrollment fell sharply vs 5-year baseline
    "debt_earnings_warning",   # D/E ratio above gainful-employment threshold
]


FlagSeverity = Literal[
    "improvement",   # long-arc decline in something bad (debt, default) or rise in something good
    "regression",    # long-arc move the wrong direction
    "surge",         # sharp recent rise (good or bad depending on metric)
    "drop",          # sharp recent decline (good or bad depending on metric)
    "warning",       # threshold-crossing event (D/E > 8%, peer outlier ≥ 2σ)
    "neutral",       # informational, no editorial weight
]


class Flag(BaseModel):
    """One detected anomaly. The summary is template-rendered at detect-time."""

    model_config = ConfigDict(extra="forbid")

    type: FlagType
    severity: FlagSeverity
    label: str           # short headline ("Computer Science", "Statewide")
    summary: str         # one-sentence prose
    magnitude_pct: Optional[float] = None  # signed percentage points
    magnitude_abs: Optional[float] = None  # native-units delta
    baseline_year: Optional[int] = None
    recent_year: int = 0
    units: Optional[str] = None  # "$", "%", "lb", "students"
    history: list[dict] = []     # [{year, value}] points for the sparkline
    metric: Optional[str] = None # e.g. "completion_rate_150"


# Severity weights for sorting flags within a section. Higher = more
# editorial weight = sorted first. Mirrors pollution-data's table.
_SEVERITY_WEIGHT: dict[str, int] = {
    "warning": 100,
    "regression": 80,
    "surge": 70,
    "drop": 30,
    "improvement": 20,
    "neutral": 10,
}


def severity_weight(s: str) -> int:
    return _SEVERITY_WEIGHT.get(s, 0)

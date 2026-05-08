"""Anomaly engine — emits Flag objects for institutions, programs, and states.

Mirrors the pollution-data anomaly engine architecture. Six detectors:
- long_arc_shift   — first→last vintage delta (rose tuition, fell completion, …)
- earnings_trend   — 4/5/6/8/10y horizon slope vs sector peers
- peer_outlier     — institution earnings σ-score vs sector-peer median
- completion_drop  — completion fell ≥ 5pp vs 5-year baseline
- enrollment_cliff — undergrad enrollment fell ≥ 20% vs 5-year baseline
- debt_earnings_warning — debt-to-earnings ratio above 8% gainful-employment line
"""

from .engine import (
    aggregate_state_flags,
    run_institution,
    run_program,
    run_state,
)
from .types import Flag, FlagSeverity, FlagType, severity_weight

__all__ = [
    "Flag",
    "FlagSeverity",
    "FlagType",
    "aggregate_state_flags",
    "run_institution",
    "run_program",
    "run_state",
    "severity_weight",
]

"""Multi-vintage Scorecard ingest — builds per-institution history arrays.

Reads each MERGED<year>_<year+1>_PP.csv inside the bulk archive, filters to a
state, and accumulates {year, value} points per metric per UNITID. We only keep
metrics with long-arc value: completion (C150), retention, enrollment (UGDS),
tuition (TUITIONFEE_IN/OUT), net price, default rate (CDR3), Pell share. Earnings
columns weren't published in pre-2014 MERGEDs, so we skip them here — earnings
history comes from FieldOfStudyData (program-level) and the current Most-Recent
snapshot (institution-level).
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Optional

import pandas as pd

from ..models import HistoryPoint
from .scorecard import _to_float, _to_int


# Columns we read from each MERGED vintage (subset that has long history).
# UNITID is the join key. STABBR filters by state.
_HISTORY_COLS = {
    "UNITID": "string",
    "STABBR": "string",
    "C150_4": "float",
    "C150_L4": "float",
    "C100_4": "float",
    "C100_L4": "float",
    "RET_FT4": "float",
    "RET_FTL4": "float",
    "ADM_RATE": "float",
    "UGDS": "int",
    "TUITIONFEE_IN": "int",
    "TUITIONFEE_OUT": "int",
    "COSTT4_A": "int",
    "COSTT4_P": "int",
    "NPT4_PUB": "int",
    "NPT4_PRIV": "int",
    "DEBT_MDN": "int",
    "CDR3": "float",
    "PCTPELL": "float",
}


# Maps the metric name on InstitutionHistory → list of source columns
# (ordered by preference; first non-null wins).
_METRIC_SOURCES = {
    "completion_rate_150": ["C150_4", "C150_L4"],
    "completion_rate_100": ["C100_4", "C100_L4"],
    "retention_rate": ["RET_FT4", "RET_FTL4"],
    "admission_rate": ["ADM_RATE"],
    "enrollment_undergrad": ["UGDS"],
    "tuition_in_state": ["TUITIONFEE_IN"],
    "tuition_out_of_state": ["TUITIONFEE_OUT"],
    "cost_attendance": ["COSTT4_A", "COSTT4_P"],
    "avg_net_price_pub": ["NPT4_PUB"],
    "avg_net_price_priv": ["NPT4_PRIV"],
    "median_debt": ["DEBT_MDN"],
    "default_rate": ["CDR3"],
    "pell_share": ["PCTPELL"],
}

_INTEGER_METRICS = {
    "enrollment_undergrad",
    "tuition_in_state",
    "tuition_out_of_state",
    "cost_attendance",
    "avg_net_price_pub",
    "avg_net_price_priv",
    "median_debt",
}


def discover_merged_files(bulk_dir: Path) -> list[tuple[int, Path]]:
    """Find all MERGED<year>_<year+1>_PP.csv files; return (year, path) sorted ascending."""
    out: list[tuple[int, Path]] = []
    pat = re.compile(r"MERGED(\d{4})_(\d{2})_PP\.csv$")
    for p in bulk_dir.rglob("MERGED*_PP.csv"):
        m = pat.search(p.name)
        if m:
            out.append((int(m.group(1)), p))
    out.sort(key=lambda t: t[0])
    return out


def load_state_history(
    bulk_dir: Path,
    state: str,
    *,
    extra_vintages: Optional[list[tuple[int, Path]]] = None,
) -> tuple[dict[str, dict[str, list[HistoryPoint]]], list[int]]:
    """Build per-(unitid, metric) history arrays for one state.

    Returns:
      - history_by_unitid[unitid][metric] → sorted list of HistoryPoint
      - sorted list of vintages successfully ingested
    """
    by_state, vintages = _load_history_internal(bulk_dir, extra_vintages=extra_vintages)
    return by_state.get(state.upper(), {}), vintages


def load_national_history(
    bulk_dir: Path,
    *,
    extra_vintages: Optional[list[tuple[int, Path]]] = None,
) -> tuple[dict[str, dict[str, dict[str, list[HistoryPoint]]]], list[int]]:
    """Build per-(state, unitid, metric) history arrays for ALL states.

    Loads each MERGED file ONCE and partitions by state — much faster than
    calling `load_state_history` 50 times (avoids re-parsing 14 × ~500 MB CSVs
    per state).

    Returns:
      - history_by_state[STATE][unitid][metric] → list of HistoryPoint
      - sorted list of vintages successfully ingested
    """
    return _load_history_internal(bulk_dir, extra_vintages=extra_vintages)


def _load_history_internal(
    bulk_dir: Path,
    *,
    extra_vintages: Optional[list[tuple[int, Path]]] = None,
) -> tuple[dict[str, dict[str, dict[str, list[HistoryPoint]]]], list[int]]:
    """Single-pass over MERGED files; partition by state and accumulate per-
    metric, per-unitid history. Internal helper for both per-state and
    national entry points.
    """
    files = discover_merged_files(bulk_dir)
    if extra_vintages:
        files = sorted(files + extra_vintages, key=lambda t: t[0])

    if not files:
        return {}, []

    # accumulator: {state: {unitid: {metric: {year: value}}}}
    accum: dict[str, dict[str, dict[str, dict[int, float]]]] = {}
    vintages_used: list[int] = []

    for year, path in files:
        try:
            df = pd.read_csv(
                path,
                usecols=lambda c: c in _HISTORY_COLS,
                dtype={"UNITID": str},
                low_memory=False,
            )
        except (FileNotFoundError, ValueError) as exc:
            print(f"  skip {path.name}: {exc}")
            continue
        if "STABBR" not in df.columns or "UNITID" not in df.columns:
            continue
        if df.empty:
            continue
        vintages_used.append(year)

        for _, row in df.iterrows():
            state_code = str(row.get("STABBR") or "").upper()
            if not state_code:
                continue
            unitid = str(row["UNITID"])
            state_acc = accum.setdefault(state_code, {})
            inst_acc = state_acc.setdefault(unitid, {})
            for metric, srcs in _METRIC_SOURCES.items():
                v: Optional[float] = None
                for col in srcs:
                    if col in df.columns:
                        cell = row.get(col)
                        if metric in _INTEGER_METRICS:
                            cv = _to_int(cell)
                            if cv is not None:
                                v = float(cv)
                                break
                        else:
                            cv = _to_float(cell)
                            if cv is not None:
                                v = float(cv)
                                break
                if v is not None:
                    inst_acc.setdefault(metric, {})[year] = v

    # Convert nested dicts to HistoryPoint lists
    history_by_state: dict[str, dict[str, dict[str, list[HistoryPoint]]]] = {}
    for state_code, by_unitid in accum.items():
        history_by_state[state_code] = {}
        for unitid, by_metric in by_unitid.items():
            history_by_state[state_code][unitid] = {}
            for metric, by_year in by_metric.items():
                pts = [
                    HistoryPoint(year=y, value=v)
                    for y, v in sorted(by_year.items())
                ]
                history_by_state[state_code][unitid][metric] = pts

    return history_by_state, sorted(set(vintages_used))


def compute_long_arc(
    history: list[HistoryPoint],
    *,
    metric: str,
    min_baseline: float = 0.0,
    min_pct_change: float = 0.10,
    lookback_years: Optional[int] = None,
) -> Optional[dict]:
    """Detect a meaningful long-arc shift in a metric's history.

    Triggers when |to_value − from_value| / max(from_value, min_baseline) ≥
    `min_pct_change`. Returns a dict matching `LongArcShift` shape.

    When `lookback_years` is set, only points within N years before the most
    recent observation are considered — used by the anomaly engine to surface
    *recent* shifts rather than 25-year drift that mostly reflects inflation.
    """
    points = [p for p in history if p.value is not None]
    if len(points) < 2:
        return None
    if lookback_years is not None:
        cutoff = points[-1].year - lookback_years
        points = [p for p in points if p.year >= cutoff]
        if len(points) < 2:
            return None
    first = points[0]
    last = points[-1]
    if first.value is None or last.value is None:
        return None
    base = max(float(first.value), min_baseline)
    if base == 0:
        return None
    pct = (float(last.value) - float(first.value)) / base
    if abs(pct) < min_pct_change:
        return None
    direction = "rose" if pct > 0 else ("fell" if pct < 0 else "flat")
    return {
        "metric": metric,
        "from_year": first.year,
        "to_year": last.year,
        "from_value": float(first.value),
        "to_value": float(last.value),
        "pct_change": pct,
        "direction": direction,
    }

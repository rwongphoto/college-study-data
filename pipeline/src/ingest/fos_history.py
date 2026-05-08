"""Multi-vintage FieldOfStudyData ingest — per-program history arrays.

Each FieldOfStudyData<YYYY>_<YYYY+1>_PP.csv represents one academic year's
publication of program-level outcomes. Earnings are 4 or 5 yr post-completion;
debt is at completion. Reading 6+ vintages gives genuine sparklines on program
pages (the editorial wedge).

Vintage years are taken from the file name's first-period year — for
FieldOfStudyData1819_1920_PP.csv, the year is 2018.
"""
from __future__ import annotations

import re
from pathlib import Path
from typing import Optional

import pandas as pd

from ..models import HistoryPoint
from .scorecard import _to_int


_FOS_HISTORY_COLS = [
    "UNITID",
    "CIPCODE",
    "CREDLEV",
    "EARN_MDN_4YR",
    "EARN_MDN_5YR",
    "DEBT_ALL_STGP_EVAL_MDN",
    "IPEDSCOUNT2",
]

_METRIC_SOURCES = {
    "earnings_median_4yr": ["EARN_MDN_4YR"],
    "earnings_median_5yr": ["EARN_MDN_5YR"],
    "debt_median": ["DEBT_ALL_STGP_EVAL_MDN"],
    "completers": ["IPEDSCOUNT2"],
}


def discover_fos_files(bulk_dir: Path) -> list[tuple[int, Path]]:
    """Find FieldOfStudyData<YY>_<YY+1>_PP.csv files; return (year, path) sorted asc."""
    out: list[tuple[int, Path]] = []
    pat = re.compile(r"FieldOfStudyData(\d{2})(\d{2})_\d{2}\d{2}_PP\.csv$")
    for p in bulk_dir.rglob("FieldOfStudyData*_PP.csv"):
        m = pat.search(p.name)
        if m:
            yy = int(m.group(1))  # e.g. "18" → 2018
            year = 2000 + yy if yy < 80 else 1900 + yy
            out.append((year, p))
    out.sort(key=lambda t: t[0])
    return out


def load_program_history(
    bulk_dir: Path,
    *,
    unitid_filter: Optional[set[str]] = None,
) -> tuple[dict[tuple[str, str, int], dict[str, list[HistoryPoint]]], list[int]]:
    """Build per-(unitid, cip_code, credlev, metric) history arrays.

    `unitid_filter=None` loads all institutions nationally — used by the
    `run-all` command so we don't re-parse 6 FoS files per state.

    Returns:
      - history_by_key[(unitid, cip_code, credlev)][metric] → list of HistoryPoint
      - sorted list of vintages successfully ingested
    """
    files = discover_fos_files(bulk_dir)
    if not files:
        return {}, []

    # accumulator: {(unitid, cip, credlev): {metric: {year: value}}}
    accum: dict[tuple[str, str, int], dict[str, dict[int, float]]] = {}

    vintages_used: list[int] = []
    for year, path in files:
        try:
            df = pd.read_csv(
                path,
                usecols=lambda c: c in _FOS_HISTORY_COLS,
                dtype={"UNITID": str, "CIPCODE": str},
                low_memory=False,
            )
        except (FileNotFoundError, ValueError) as exc:
            print(f"  skip {path.name}: {exc}")
            continue
        if "UNITID" not in df.columns:
            continue
        if unitid_filter is not None:
            df = df[df["UNITID"].astype(str).isin(unitid_filter)]
        if df.empty:
            continue
        vintages_used.append(year)

        for _, row in df.iterrows():
            unitid = str(row["UNITID"])
            cip = str(row.get("CIPCODE") or "").strip()
            credlev_raw = row.get("CREDLEV")
            credlev = _to_int(credlev_raw)
            if not cip or credlev is None:
                continue
            key = (unitid, cip, credlev)
            inst_acc = accum.setdefault(key, {})
            for metric, srcs in _METRIC_SOURCES.items():
                v: Optional[int] = None
                for col in srcs:
                    if col in df.columns:
                        cell = row.get(col)
                        cv = _to_int(cell)
                        if cv is not None:
                            v = cv
                            break
                if v is not None:
                    inst_acc.setdefault(metric, {})[year] = float(v)

    history_by_key: dict[tuple[str, str, int], dict[str, list[HistoryPoint]]] = {}
    for key, by_metric in accum.items():
        history_by_key[key] = {}
        for metric, by_year in by_metric.items():
            pts = [
                HistoryPoint(year=y, value=v)
                for y, v in sorted(by_year.items())
            ]
            history_by_key[key][metric] = pts

    return history_by_key, sorted(set(vintages_used))

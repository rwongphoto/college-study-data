"""College Scorecard API — fills the 2011-2024 institution-level history gap
the bulk archive doesn't cover.

The bulk `College_Scorecard_Raw_Data_05192025.zip` ships MERGED files only
through 2010-11. The API at `https://api.data.gov/ed/collegescorecard/v1/schools`
exposes every published cohort year via the `<year>.<metric_path>` field syntax.
We pull just the metrics we already surface in InstitutionHistory and emit the
same `{unitid: {metric: list[HistoryPoint]}}` shape as `scorecard_history.py`,
so the two sources merge cleanly.

Auth: free API key from https://api.data.gov/signup/. Pass via env var
`COLLEGE_SCORECARD_API_KEY` or by reading `.env` at project root.

Rate limit: 1,000 requests/IP/hour. Our worst-case run is ~10 requests per
state (one per metric, all years packed into the field list), so we're never
close to the cap.
"""
from __future__ import annotations

import os
import time
from pathlib import Path
from typing import Optional

import httpx

from ..models import HistoryPoint


API_BASE = "https://api.data.gov/ed/collegescorecard/v1/schools"


# Maps InstitutionHistory metric → API field path (dotted, year-prefixed).
# `{year}` placeholder is filled per-vintage when building the request.
_METRIC_API_PATHS = {
    "completion_rate_150": [
        "{year}.completion.completion_rate_4yr_150nt",
        "{year}.completion.completion_rate_l4yr_150nt",
    ],
    "completion_rate_100": [
        "{year}.completion.completion_rate_4yr_100nt",
        "{year}.completion.completion_rate_l4yr_100nt",
    ],
    "retention_rate": [
        "{year}.student.retention_rate.four_year.full_time",
        "{year}.student.retention_rate.lt_four_year.full_time",
    ],
    "admission_rate": [
        "{year}.admissions.admission_rate.overall",
    ],
    "enrollment_undergrad": [
        "{year}.student.size",
    ],
    "tuition_in_state": [
        "{year}.cost.tuition.in_state",
    ],
    "tuition_out_of_state": [
        "{year}.cost.tuition.out_of_state",
    ],
    "cost_attendance": [
        "{year}.cost.attendance.academic_year",
        "{year}.cost.attendance.program_year",
    ],
    "avg_net_price_pub": [
        "{year}.cost.avg_net_price.public",
    ],
    "avg_net_price_priv": [
        "{year}.cost.avg_net_price.private",
    ],
    "median_debt": [
        "{year}.aid.median_debt.completers.overall",
    ],
    "default_rate": [
        "{year}.repayment.3_yr_default_rate",
    ],
    "pell_share": [
        "{year}.aid.pell_grant_rate",
    ],
    # Earnings — only Treasury-published metric. Available 2002 cohort onward
    # in the API. Surfaced into separate "earnings" history because they're
    # institution-level Treasury data, not InstitutionHistory's existing fields.
    "earnings_median_10yr": [
        "{year}.earnings.10_yrs_after_entry.median",
    ],
    "earnings_median_8yr": [
        # 8yr field name differs from 6yr/10yr — uses `.median_earnings` leaf
        # (the others use `.median`). Confirmed via API probe.
        "{year}.earnings.8_yrs_after_entry.median_earnings",
    ],
    "earnings_median_6yr": [
        "{year}.earnings.6_yrs_after_entry.median",
    ],
}


def _load_env(project_root: Path) -> None:
    """Load `<project_root>/.env` into os.environ (set-default; no override)."""
    path = project_root / ".env"
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def _get_api_key(project_root: Path) -> Optional[str]:
    _load_env(project_root)
    return os.environ.get("COLLEGE_SCORECARD_API_KEY") or os.environ.get("DATA_GOV_API_KEY")


def _walk(obj, dotted: str):
    """Look up a dotted key. The Scorecard API returns flat keys with dots in
    them ('2018.earnings.10_yrs_after_entry.median' is the literal JSON key),
    so we try the flat lookup first and fall back to nested-dict walk for
    callers that pass already-walked sub-objects.
    """
    if isinstance(obj, dict) and dotted in obj:
        return obj[dotted]
    cur = obj
    for seg in dotted.split("."):
        if not isinstance(cur, dict):
            return None
        cur = cur.get(seg)
        if cur is None:
            return None
    return cur


def fetch_state_api_history(
    *,
    state: str,
    years: list[int],
    project_root: Path,
    timeout: float = 60.0,
    per_page: int = 100,
) -> tuple[dict[str, dict[str, list[HistoryPoint]]], list[int]]:
    """Pull per-(unitid, metric) history from the API for one state."""
    return _fetch_api_history(
        years=years,
        project_root=project_root,
        state_filter=state.upper(),
        timeout=timeout,
        per_page=per_page,
    )


def fetch_national_api_history(
    *,
    years: list[int],
    project_root: Path,
    timeout: float = 60.0,
    per_page: int = 100,
) -> tuple[dict[str, dict[str, dict[str, list[HistoryPoint]]]], list[int]]:
    """Pull per-(state, unitid, metric) history from the API for ALL states.

    One paginated query per metric (no `school.state` filter), packing all
    years into the field list. Returns a state-keyed map for symmetry with
    `load_national_history()`.
    """
    flat, years_used = _fetch_api_history(
        years=years,
        project_root=project_root,
        state_filter=None,
        timeout=timeout,
        per_page=per_page,
        emit_state_in_results=True,
    )
    # `flat` here is actually a state-nested dict because emit_state_in_results=True
    # promotes the by-state shape — see implementation below.
    return flat, years_used  # type: ignore[return-value]


def _fetch_api_history(
    *,
    years: list[int],
    project_root: Path,
    state_filter: Optional[str],
    timeout: float,
    per_page: int,
    emit_state_in_results: bool = False,
) -> tuple[dict, list[int]]:
    """Internal: paginates over /schools, accumulates history.

    When `emit_state_in_results=True`, returns
        {STATE: {unitid: {metric: list[HistoryPoint]}}}
    When False (per-state mode), returns
        {unitid: {metric: list[HistoryPoint]}}
    """
    api_key = _get_api_key(project_root)
    if not api_key:
        print("  [api] No COLLEGE_SCORECARD_API_KEY set; skipping API history.")
        return ({}, [])

    # accumulator: per-metric → (state, unitid) → year → value
    # We accumulate per-metric so we can print progress + handle pagination
    # cleanly. Final reshape happens after all metrics are pulled.
    accum_per_metric: dict[str, dict[tuple[str, str], dict[int, float]]] = {}
    years_used: set[int] = set()

    with httpx.Client(timeout=timeout) as client:
        for metric, path_templates in _METRIC_API_PATHS.items():
            requested_fields = ["id", "school.name", "school.state"]
            for year in years:
                for tmpl in path_templates:
                    requested_fields.append(tmpl.format(year=year))

            params: dict = {
                "api_key": api_key,
                "fields": ",".join(requested_fields),
                "per_page": per_page,
                "page": 0,
            }
            if state_filter:
                params["school.state"] = state_filter

            metric_acc = accum_per_metric.setdefault(metric, {})
            metric_cells_before = sum(len(yrs) for yrs in metric_acc.values())
            page = 0
            while True:
                params["page"] = page
                try:
                    resp = client.get(API_BASE, params=params)
                except httpx.HTTPError as exc:
                    print(f"  [api] {metric}: network error {exc}")
                    break
                if resp.status_code == 429:
                    print(f"  [api] rate-limited at {metric}; sleeping 60s")
                    time.sleep(60)
                    continue
                if resp.status_code != 200:
                    print(f"  [api] {metric}: HTTP {resp.status_code}: {resp.text[:200]}")
                    break

                payload = resp.json()
                results = payload.get("results", [])
                metadata = payload.get("metadata", {})
                if not results:
                    break

                for school in results:
                    unitid = str(school.get("id"))
                    if not unitid:
                        continue
                    state_code = str(
                        school.get("school.state") or _walk(school, "school.state") or ""
                    ).upper()
                    if not state_code:
                        # Some 'territories' / oddities — skip
                        continue
                    key = (state_code, unitid)
                    cell_acc = metric_acc.setdefault(key, {})
                    for year in years:
                        v = None
                        for tmpl in path_templates:
                            cell = _walk(school, tmpl.format(year=year))
                            if cell is not None and cell != "":
                                try:
                                    v = float(cell)
                                except (TypeError, ValueError):
                                    pass
                                if v is not None:
                                    break
                        if v is not None:
                            cell_acc[year] = v
                            years_used.add(year)

                total = metadata.get("total", 0)
                if (page + 1) * per_page >= total:
                    break
                page += 1

            metric_cells_after = sum(len(yrs) for yrs in metric_acc.values())
            print(f"  [api] {metric}: {metric_cells_after - metric_cells_before} cells")

    # Reshape
    if emit_state_in_results:
        out: dict[str, dict[str, dict[str, list[HistoryPoint]]]] = {}
        for metric, by_key in accum_per_metric.items():
            for (state_code, unitid), by_year in by_key.items():
                state_dict = out.setdefault(state_code, {})
                inst_dict = state_dict.setdefault(unitid, {})
                inst_dict[metric] = [
                    HistoryPoint(year=y, value=v)
                    for y, v in sorted(by_year.items())
                ]
        return out, sorted(years_used)
    else:
        flat: dict[str, dict[str, list[HistoryPoint]]] = {}
        for metric, by_key in accum_per_metric.items():
            for (state_code, unitid), by_year in by_key.items():
                inst_dict = flat.setdefault(unitid, {})
                inst_dict[metric] = [
                    HistoryPoint(year=y, value=v)
                    for y, v in sorted(by_year.items())
                ]
        return flat, sorted(years_used)


def merge_history(
    bulk: dict[str, dict[str, list[HistoryPoint]]],
    api: dict[str, dict[str, list[HistoryPoint]]],
) -> dict[str, dict[str, list[HistoryPoint]]]:
    """Merge two history-by-unitid maps. API values take precedence on year
    collisions (the API has the most up-to-date retroactive corrections;
    historical bulk MERGED files are a snapshot from when they were
    published)."""
    merged: dict[str, dict[str, list[HistoryPoint]]] = {}
    all_unitids = set(bulk) | set(api)
    for unitid in all_unitids:
        b = bulk.get(unitid, {})
        a = api.get(unitid, {})
        all_metrics = set(b) | set(a)
        for metric in all_metrics:
            by_year: dict[int, float] = {}
            for pt in b.get(metric, []):
                if pt.value is not None:
                    by_year[pt.year] = float(pt.value)
            for pt in a.get(metric, []):
                if pt.value is not None:
                    by_year[pt.year] = float(pt.value)  # API wins
            merged.setdefault(unitid, {})[metric] = [
                HistoryPoint(year=y, value=v) for y, v in sorted(by_year.items())
            ]
    return merged

"""Cross-state rankings publisher.

Reads the per-page JSONs already written by `publish_state` (state hubs,
city hubs, institution payloads, program payloads) and emits a single
`rankings.json` payload that powers the four /rankings pages:

- /rankings/states       — top 10 most/least, per outcome lane
- /rankings/cities       — top 10 most/least, per outcome lane
- /rankings/institutions — top N most/least across published institutions
- /rankings/programs     — top N programs by 5-yr earnings / lowest debt /
                           largest completer cohort

Reading the published JSONs (rather than re-deriving from the in-memory
aggregates) keeps this step fully decoupled from the build orchestration —
running it after a partial state publish naturally limits the ranking pool
to whatever is currently on disk.

Mirrors the design of pollution-data's publish/rankings.py. Suppression-
honest: rows with null metric values are filtered out (rather than coerced
to zero, which would parade privacy-suppressed institutions at the bottom
of every "least" table).
"""

from __future__ import annotations

import json
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path


# ---- Lane definition ----------------------------------------------------
# A "lane" is one rankable indicator. Each lane reads one numeric field from
# a published payload. value_format controls the display label rendered in
# the table; the comparable value used for sorting is the raw float.

@dataclass(frozen=True)
class _Lane:
    key: str               # short id used by the frontend
    label: str             # display label on the table heading
    field: str             # field path within the payload (top-level only)
    units: str             # display units
    value_format: str      # "currency" | "percent" | "count" | "ratio"
    most_n: int = 10
    least_n: int = 10
    # min_undergrad: optional floor — institutions / programs / places below
    # this enrollment threshold are excluded from the comparable pool. Used
    # for completion-rate lanes where tiny cohorts skew toward 100%.
    min_undergrad: int = 0
    # least pool requires the metric to be > 0 (true for completers, debt,
    # default rate — a row with 0 isn't editorially meaningful in the
    # "least" direction either).
    positive_only: bool = False


def _format_value(value: float, fmt: str) -> str:
    if fmt == "currency":
        if value >= 1_000_000:
            return f"${value/1_000_000:.1f}M"
        if value >= 1_000:
            return f"${value/1_000:.1f}k"
        return f"${value:,.0f}"
    if fmt == "percent":
        return f"{value*100:.1f}%"
    if fmt == "count":
        return f"{int(value):,}"
    if fmt == "ratio":
        return f"{value:.2f}"
    return f"{value}"


# ---- Lane registries ----------------------------------------------------

STATE_LANES: tuple[_Lane, ...] = (
    _Lane(
        key="earnings_10yr",
        label="Median earnings · 10y after entry",
        field="earnings_median_state",
        units="USD",
        value_format="currency",
    ),
    _Lane(
        key="completion_150",
        label="Completion rate · 150% time",
        field="completion_rate_state",
        units="share of cohort",
        value_format="percent",
    ),
)

CITY_LANES: tuple[_Lane, ...] = (
    _Lane(
        key="earnings_10yr",
        label="Median earnings · 10y after entry",
        field="earnings_median_city",
        units="USD",
        value_format="currency",
    ),
    _Lane(
        key="completion_150",
        label="Completion rate · 150% time",
        field="completion_rate_city",
        units="share of cohort",
        value_format="percent",
    ),
)

# Institution lanes mirror the pollution facility surface — but with both
# directions enabled because "best earnings" and "lowest debt" are equally
# meaningful editorial cuts. Every lane applies the 1,000-undergrad floor:
# small-cohort campuses (cosmetology, barbering, single-program institutes)
# arithmetically dominate the extremes on every metric — completion pins to
# 100% on tiny cohorts; earnings + debt + Pell share have huge sample-size
# noise — and including them produces a top-10 that's structurally
# misleading rather than editorially informative.
INSTITUTION_MIN_UNDERGRAD = 1000


INSTITUTION_LANES: tuple[_Lane, ...] = (
    _Lane(
        key="earnings_10yr",
        label="Median earnings · 10y after entry",
        field="earnings_median_10yr",
        units="USD",
        value_format="currency",
        min_undergrad=INSTITUTION_MIN_UNDERGRAD,
    ),
    _Lane(
        key="earnings_6yr",
        label="Median earnings · 6y after entry",
        field="earnings_median_6yr",
        units="USD",
        value_format="currency",
        min_undergrad=INSTITUTION_MIN_UNDERGRAD,
    ),
    _Lane(
        key="completion_150",
        label="Completion rate · 150% time",
        field="completion_rate_150",
        units="share of cohort",
        value_format="percent",
        min_undergrad=INSTITUTION_MIN_UNDERGRAD,
    ),
    _Lane(
        key="median_debt",
        label="Median debt at completion",
        field="median_debt",
        units="USD",
        value_format="currency",
        positive_only=True,
        min_undergrad=INSTITUTION_MIN_UNDERGRAD,
    ),
    _Lane(
        key="default_rate",
        label="Cohort default rate (3-year)",
        field="default_rate",
        units="share of borrowers",
        value_format="percent",
        min_undergrad=INSTITUTION_MIN_UNDERGRAD,
    ),
    _Lane(
        key="admission_rate",
        label="Admission rate",
        field="admission_rate",
        units="share of applicants",
        value_format="percent",
        min_undergrad=INSTITUTION_MIN_UNDERGRAD,
    ),
    _Lane(
        key="pell_share",
        label="Pell-recipient share",
        field="pell_share",
        units="share of undergrads",
        value_format="percent",
        min_undergrad=INSTITUTION_MIN_UNDERGRAD,
    ),
)

# Programs are the editorial wedge — Field of Study × institution. We expose
# four lanes: best earnings 5yr-after-completion, lowest debt, largest
# completer cohorts (IPEDSCOUNT2 4-year cumulative). The "most-completers"
# lane is `most`-only — a 1-completer program isn't editorially noteworthy
# at the bottom of a "least" table.
PROGRAM_LANES: tuple[_Lane, ...] = (
    _Lane(
        key="earnings_5yr",
        label="Median earnings · 5y after completion",
        field="earnings_median_5yr",
        units="USD",
        value_format="currency",
        most_n=20,
        least_n=20,
    ),
    _Lane(
        key="median_debt",
        label="Median debt at completion",
        field="debt_median",
        units="USD",
        value_format="currency",
        most_n=20,
        least_n=20,
        positive_only=True,
    ),
    _Lane(
        key="completers",
        label="Cumulative completers · 4-year",
        field="completers",
        units="degrees awarded",
        value_format="count",
        most_n=25,
        least_n=0,
        positive_only=True,
    ),
)

# Tighter lane set used by the per-credential rankings page. Each credential
# bucket renders its own most/least tables — multiplied across 5+ credentials,
# the full PROGRAM_LANES set is too dense; this trims to the four most
# editorially distinct cuts (best earnings, worst earnings, lowest debt,
# largest cohorts).
CREDENTIAL_LANES: tuple[_Lane, ...] = (
    _Lane(
        key="earnings_5yr",
        label="Median earnings · 5y after completion",
        field="earnings_median_5yr",
        units="USD",
        value_format="currency",
        most_n=10,
        least_n=10,
    ),
    _Lane(
        key="median_debt",
        label="Median debt at completion",
        field="debt_median",
        units="USD",
        value_format="currency",
        most_n=0,
        least_n=10,
        positive_only=True,
    ),
    _Lane(
        key="completers",
        label="Cumulative completers · 4-year",
        field="completers",
        units="degrees awarded",
        value_format="count",
        most_n=10,
        least_n=0,
        positive_only=True,
    ),
)

# Per-CIP-family rankings page renders 15 family sections × 2 lanes — keep it
# to the two highest-signal cuts so the page stays scannable.
FIELD_LANES: tuple[_Lane, ...] = (
    _Lane(
        key="earnings_5yr",
        label="Median earnings · 5y after completion",
        field="earnings_median_5yr",
        units="USD",
        value_format="currency",
        most_n=10,
        least_n=0,
    ),
    _Lane(
        key="median_debt",
        label="Median debt at completion",
        field="debt_median",
        units="USD",
        value_format="currency",
        most_n=0,
        least_n=10,
        positive_only=True,
    ),
)


# College Scorecard Field-of-Study CREDLEV codes. Order on the page follows
# the natural credential ladder (sub-baccalaureate → graduate). Code 4 is
# unused by Scorecard; codes 1/2/3/5/6/7/8 are the canonical FoS values.
CREDENTIAL_LABELS: dict[int, str] = {
    1: "Undergraduate Certificate",
    2: "Associate's Degree",
    3: "Bachelor's Degree",
    5: "Master's Degree",
    6: "Doctoral Degree",
    7: "First-Professional Degree",
    8: "Graduate Certificate",
}
CREDENTIAL_ORDER: tuple[int, ...] = (1, 2, 3, 5, 6, 7, 8)


# CIP-2 family display names (NCES taxonomy). The /rankings/fields page
# renders only the top 15 families by national completer volume; the rest of
# the dict is here for label resolution if other surfaces ever consume it.
CIP2_LABELS: dict[str, str] = {
    "01": "Agriculture & Related Sciences",
    "03": "Natural Resources & Conservation",
    "04": "Architecture",
    "05": "Area, Ethnic & Cultural Studies",
    "09": "Communication & Journalism",
    "10": "Communications Technologies",
    "11": "Computer & Information Sciences",
    "12": "Personal & Culinary Services",
    "13": "Education",
    "14": "Engineering",
    "15": "Engineering Technologies",
    "16": "Foreign Languages & Linguistics",
    "19": "Family & Consumer Sciences",
    "22": "Legal Professions & Studies",
    "23": "English Language & Literature",
    "24": "Liberal Arts & General Studies",
    "25": "Library Science",
    "26": "Biological & Biomedical Sciences",
    "27": "Mathematics & Statistics",
    "29": "Military Technologies",
    "30": "Multi/Interdisciplinary Studies",
    "31": "Parks, Recreation & Fitness",
    "38": "Philosophy & Religious Studies",
    "39": "Theology & Religious Vocations",
    "40": "Physical Sciences",
    "41": "Science Technologies",
    "42": "Psychology",
    "43": "Homeland Security & Law Enforcement",
    "44": "Public Administration & Social Service",
    "45": "Social Sciences",
    "46": "Construction Trades",
    "47": "Mechanic & Repair Technologies",
    "48": "Precision Production",
    "49": "Transportation & Materials Moving",
    "50": "Visual & Performing Arts",
    "51": "Health Professions",
    "52": "Business, Management & Marketing",
    "54": "History",
}
FIELD_PAGE_TOP_N: int = 25


# ---- Payload readers ----------------------------------------------------

def _read_state_files(root: Path) -> list[tuple[str, dict]]:
    """Yield every (state_slug, state_agg) pair under data/published/state/."""
    out: list[tuple[str, dict]] = []
    if not root.exists():
        return out
    for jf in sorted(root.glob("*.json")):
        try:
            out.append((jf.stem, json.loads(jf.read_text())))
        except Exception:  # noqa: BLE001
            continue
    return out


def _read_state_partitioned(root: Path) -> list[tuple[str, str, dict]]:
    """Yield (state_slug, slug, payload) for each per-state-per-entity JSON.
    Used for city / institution surfaces, which live in
    data/published/<surface>/<state>/<slug>.json.
    """
    out: list[tuple[str, str, dict]] = []
    if not root.exists():
        return out
    for state_dir in sorted(root.iterdir()):
        if not state_dir.is_dir():
            continue
        for jf in sorted(state_dir.glob("*.json")):
            try:
                out.append((state_dir.name, jf.stem, json.loads(jf.read_text())))
            except Exception:  # noqa: BLE001
                continue
    return out


def _read_program_files(root: Path) -> list[tuple[str, str, str, dict]]:
    """Yield (state_slug, institution_slug, program_slug, payload) for every
    published program JSON. Programs are nested one extra level under
    data/published/program/<state>/<institution-slug>/<program-slug>.json."""
    out: list[tuple[str, str, str, dict]] = []
    if not root.exists():
        return out
    for state_dir in sorted(root.iterdir()):
        if not state_dir.is_dir():
            continue
        for inst_dir in sorted(state_dir.iterdir()):
            if not inst_dir.is_dir():
                continue
            for jf in sorted(inst_dir.glob("*.json")):
                try:
                    out.append((
                        state_dir.name,
                        inst_dir.name,
                        jf.stem,
                        json.loads(jf.read_text()),
                    ))
                except Exception:  # noqa: BLE001
                    continue
    return out


# ---- Row builders --------------------------------------------------------

def _state_rows(lane: _Lane, payloads: list[tuple[str, dict]]) -> list[dict]:
    rows: list[dict] = []
    for state_slug, p in payloads:
        v = p.get(lane.field)
        if v is None:
            continue
        rows.append({
            "state": state_slug,
            "state_label": p.get("name") or state_slug.upper(),
            "slug": state_slug,
            "name": p.get("name") or state_slug.upper(),
            "institution_count": p.get("institution_count"),
            "value": float(v),
            "value_label": _format_value(float(v), lane.value_format),
        })
    return rows


def _city_rows(lane: _Lane, payloads: list[tuple[str, str, dict]]) -> list[dict]:
    rows: list[dict] = []
    for state_slug, _slug, p in payloads:
        v = p.get(lane.field)
        if v is None:
            continue
        rows.append({
            "state": state_slug,
            "state_label": state_slug.upper(),
            "slug": p.get("slug") or _slug,
            "name": p.get("name") or _slug,
            "institution_count": p.get("institution_count"),
            "value": float(v),
            "value_label": _format_value(float(v), lane.value_format),
        })
    return rows


def _institution_rows(
    lane: _Lane, payloads: list[tuple[str, str, dict]]
) -> list[dict]:
    rows: list[dict] = []
    for state_slug, _slug, payload in payloads:
        inst = payload.get("institution") or {}
        v = inst.get(lane.field)
        if v is None:
            continue
        if lane.min_undergrad:
            ug = inst.get("enrollment_undergrad")
            if ug is None or ug < lane.min_undergrad:
                continue
        rows.append({
            "state": state_slug,
            "state_label": state_slug.upper(),
            "slug": inst.get("slug") or _slug,
            "name": inst.get("name") or _slug,
            "city": inst.get("city"),
            "control": inst.get("control"),
            "pred_degree": inst.get("pred_degree"),
            "enrollment_undergrad": inst.get("enrollment_undergrad"),
            "value": float(v),
            "value_label": _format_value(float(v), lane.value_format),
        })
    return rows


def _program_rows(
    lane: _Lane,
    payloads: list[tuple[str, str, str, dict]],
    inst_undergrad: dict[tuple[str, str], int | None],
    min_undergrad: int,
) -> list[dict]:
    rows: list[dict] = []
    for state_slug, inst_slug, prog_slug, p in payloads:
        v = p.get(lane.field)
        if v is None:
            continue
        # Editorial floor: drop programs hosted at sub-1k-undergrad
        # institutions. Programs at small specialty institutes
        # (cosmetology, technical, single-credential) arithmetically
        # dominate every program ranking otherwise — same selection-bias
        # problem as the institution-level floor.
        if min_undergrad:
            ug = inst_undergrad.get((state_slug, inst_slug))
            if ug is None or ug < min_undergrad:
                continue
        inst = p.get("institution") or {}
        # Mirror the frontend's static-page gate (listProgramsWithEarnings):
        # a standalone program page is only generated when both 4yr and 5yr
        # post-completion earnings are present. Rows that lack either window
        # render their Program cell as plain text in the ranking table.
        has_page = (
            p.get("earnings_median_4yr") is not None
            and p.get("earnings_median_5yr") is not None
        )
        rows.append({
            "state": state_slug,
            "state_label": state_slug.upper(),
            "slug": p.get("slug") or prog_slug,
            "name": (p.get("cip_desc") or "").rstrip("."),
            "credential_desc": p.get("credential_desc"),
            "institution_slug": inst.get("slug") or inst_slug,
            "institution_name": p.get("institution_name") or inst.get("name"),
            "city": inst.get("city"),
            "completers": p.get("completers"),
            "pooled_earnings": bool(p.get("pooled_earnings")),
            "program_page": has_page,
            "value": float(v),
            "value_label": _format_value(float(v), lane.value_format),
        })
    return rows


# ---- Table assembly ------------------------------------------------------

def _build_tables(
    lanes: tuple[_Lane, ...],
    rows_for_lane,
) -> list[dict]:
    """Generic most/least table builder for a set of lanes + a row builder."""
    tables: list[dict] = []
    for lane in lanes:
        rows = rows_for_lane(lane)
        if not rows:
            continue
        pool = [r for r in rows if r["value"] > 0] if lane.positive_only else rows
        if lane.most_n:
            most_sorted = sorted(pool, key=lambda r: r["value"], reverse=True)[: lane.most_n]
            if most_sorted:
                tables.append({
                    "lane": lane.key,
                    "label": lane.label,
                    "units": lane.units,
                    "direction": "most",
                    "positive_only": lane.positive_only,
                    "rows": [{"rank": i + 1, **r} for i, r in enumerate(most_sorted)],
                })
        if lane.least_n:
            least_sorted = sorted(pool, key=lambda r: r["value"])[: lane.least_n]
            if least_sorted:
                tables.append({
                    "lane": lane.key,
                    "label": lane.label,
                    "units": lane.units,
                    "direction": "least",
                    "positive_only": lane.positive_only,
                    "rows": [{"rank": i + 1, **r} for i, r in enumerate(least_sorted)],
                })
    return tables


# ---- Top-level publisher -------------------------------------------------

def _now_iso() -> str:
    return datetime.now(tz=timezone.utc).isoformat(timespec="seconds")


def publish_rankings(*, out_dir: Path, reporting_year: int) -> Path:
    """Read every published state / city / institution / program JSON
    and write rankings.json under out_dir. `reporting_year` is the latest
    fast-cycling cohort year — used as the headline date stamp on the page."""

    states = _read_state_files(out_dir / "state")
    cities = _read_state_partitioned(out_dir / "city")
    institutions = _read_state_partitioned(out_dir / "institution")
    programs = _read_program_files(out_dir / "program")

    # (state_slug, institution_slug) → enrollment_undergrad. Used by the
    # program ranking row builder to apply the same 1k-undergrad floor that
    # gates the institution rankings, since program rows don't carry
    # parent-institution enrollment in their own payload.
    inst_undergrad: dict[tuple[str, str], int | None] = {}
    for state_slug, inst_slug, payload in institutions:
        inst = payload.get("institution") or {}
        inst_undergrad[(state_slug, inst_slug)] = inst.get("enrollment_undergrad")

    states_covered = sorted({
        s
        for s, *_ in (
            [(s,) for s, _ in states]
            + [(s,) for s, _, _ in cities]
            + [(s,) for s, _, _ in institutions]
            + [(s,) for s, _, _, _ in programs]
        )
    })

    # Pre-bucket the program payload list once for the sliced surfaces.
    by_cred: dict[int, list[tuple[str, str, str, dict]]] = defaultdict(list)
    by_field: dict[str, list[tuple[str, str, str, dict]]] = defaultdict(list)
    field_completer_total: dict[str, int] = defaultdict(int)
    for entry in programs:
        _, _, _, p = entry
        cred = p.get("credential_level")
        if isinstance(cred, int) and cred in CREDENTIAL_LABELS:
            by_cred[cred].append(entry)
        cip4 = (p.get("cip_code") or "").strip()
        if len(cip4) >= 2:
            cip2 = cip4[:2]
            if cip2 in CIP2_LABELS:
                by_field[cip2].append(entry)
                # Use completers as a national-volume proxy for ordering the
                # field-page sections; null/zero rows simply don't bias the
                # ranking.
                c = p.get("completers")
                if isinstance(c, (int, float)) and c > 0:
                    field_completer_total[cip2] += int(c)

    credential_buckets: list[dict] = []
    for code in CREDENTIAL_ORDER:
        bucket_progs = by_cred.get(code) or []
        if not bucket_progs:
            continue
        tables = _build_tables(
            CREDENTIAL_LANES,
            lambda lane, _bp=bucket_progs: _program_rows(
                lane, _bp, inst_undergrad, INSTITUTION_MIN_UNDERGRAD
            ),
        )
        if not tables:
            continue
        credential_buckets.append({
            "code": code,
            "label": CREDENTIAL_LABELS[code],
            "tables": tables,
        })

    field_codes_ranked = sorted(
        by_field.keys(),
        key=lambda c: (-field_completer_total.get(c, 0), c),
    )[:FIELD_PAGE_TOP_N]
    field_buckets: list[dict] = []
    for code in field_codes_ranked:
        bucket_progs = by_field[code]
        tables = _build_tables(
            FIELD_LANES,
            lambda lane, _bp=bucket_progs: _program_rows(
                lane, _bp, inst_undergrad, INSTITUTION_MIN_UNDERGRAD
            ),
        )
        if not tables:
            continue
        field_buckets.append({
            "code": code,
            "label": CIP2_LABELS[code],
            "tables": tables,
        })

    payload = {
        "_published_at": _now_iso(),
        "reporting_year": reporting_year,
        "states_covered": states_covered,
        "counts": {
            "states": len(states),
            "cities": len(cities),
            "institutions": len(institutions),
            "programs": len(programs),
        },
        "states": {
            "tables": _build_tables(STATE_LANES, lambda lane: _state_rows(lane, states)),
        },
        "cities": {
            "tables": _build_tables(CITY_LANES, lambda lane: _city_rows(lane, cities)),
        },
        "institutions": {
            "tables": _build_tables(
                INSTITUTION_LANES, lambda lane: _institution_rows(lane, institutions)
            ),
        },
        "programs": {
            "tables": _build_tables(
                PROGRAM_LANES,
                lambda lane: _program_rows(
                    lane, programs, inst_undergrad, INSTITUTION_MIN_UNDERGRAD
                ),
            ),
        },
        "by_credential": {"buckets": credential_buckets},
        "by_field": {"buckets": field_buckets},
    }

    out_path = out_dir / "rankings.json"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2, default=str)
    return out_path

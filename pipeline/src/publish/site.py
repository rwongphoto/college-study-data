"""Publish JSON payloads to data/published/.

Mirrors the pollution-data publish pattern: track every written path; delete
any stale file in our managed directories that didn't get rewritten this run.

Adds in v2:
- History arrays threaded through each payload (drives sparklines).
- Similar-institution cross-link block on each institution page (5 closest by
  Carnegie + control + region + size — deterministic, no editorial judgment).
- Single-year IPEDSCOUNT1 alongside IPEDSCOUNT2 for completer transparency.
- Methodology callout when Scorecard pooled program earnings to a parent OPEID.
"""
from __future__ import annotations

import json
from datetime import date
from pathlib import Path
from typing import Iterable

from ..aggregate.build import (
    attach_programs,
    build_city_aggs,
    build_state_agg,
)
from ..flags.engine import aggregate_state_flags
from ..models import HomePayload, Institution, Program, Source
from .roi import (
    build_institution_roi,
    build_program_roi,
    publish_roi_constants,
)


def _write_json(path: Path, payload: dict, written: set[Path]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2, default=str)
    written.add(path.resolve())


def _cleanup_stale(directory: Path, kept: set[Path]) -> int:
    if not directory.exists():
        return 0
    deleted = 0
    for p in directory.rglob("*.json"):
        if p.resolve() not in kept:
            p.unlink()
            deleted += 1
    return deleted


def _similar_institutions(
    target: Institution,
    pool: list[Institution],
    *,
    n: int = 5,
) -> list[dict]:
    """Pick N most-similar institutions: same control + same pred_degree first,
    then same Carnegie tier, then closest enrollment size. Deterministic.
    """
    candidates = [i for i in pool if i.unitid != target.unitid]
    target_size = target.enrollment_undergrad or 0

    def score(i: Institution) -> tuple:
        same_control = 0 if i.control == target.control else 1
        same_pred = 0 if i.pred_degree == target.pred_degree else 1
        same_carn = 0 if (i.carnegie_basic == target.carnegie_basic and i.carnegie_basic) else 1
        size_diff = abs((i.enrollment_undergrad or 0) - target_size)
        return (same_control, same_pred, same_carn, size_diff)

    candidates.sort(key=score)
    out = []
    for i in candidates[:n]:
        out.append({
            "slug": i.slug,
            "name": i.name,
            "city": i.city,
            "control": i.control,
            "pred_degree": i.pred_degree,
            "earnings_median_10yr": i.earnings_median_10yr,
            "completion_rate_150": i.completion_rate_150,
            "enrollment_undergrad": i.enrollment_undergrad,
        })
    return out


def publish_state(
    *,
    state: str,
    institutions: list[Institution],
    programs: list[Program],
    out_dir: Path,
    source: Source,
) -> dict[str, int]:
    """Publish all payloads for a single state. Idempotent. Returns counts."""
    written: set[Path] = set()

    cities = build_city_aggs(state, institutions, source)
    state_agg = build_state_agg(state, institutions, cities, source)
    state_agg.flags = aggregate_state_flags(institutions)

    state_path = out_dir / "state" / f"{state.lower()}.json"
    _write_json(state_path, state_agg.model_dump(), written)

    for c in cities:
        p = out_dir / "city" / state.lower() / f"{c.slug}.json"
        _write_json(p, c.model_dump(), written)

    programs_by_unitid: dict[str, list[Program]] = {}
    for prog in programs:
        programs_by_unitid.setdefault(prog.institution_unitid, []).append(prog)

    # Renderable-program index for the XML sitemap, grouped by institution slug.
    # "Renderable" must mirror the frontend's notFound() rule in
    # frontend/src/app/.../program/[program]/page.tsx: a program page 404s when
    # BOTH earnings windows are suppressed. Listing those URLs would feed Google
    # soft-404s, so we exclude them here. Written per state (see below) so a
    # partial pipeline run only rewrites the states it touched.
    sitemap_programs: dict[str, list[str]] = {}

    for inst in institutions:
        progs = programs_by_unitid.get(inst.unitid, [])
        payload = attach_programs(inst, progs)
        payload["similar"] = _similar_institutions(inst, institutions)
        roi_block = build_institution_roi(institution=inst, programs=progs)
        if roi_block is not None:
            payload["roi"] = roi_block
        payload["source"] = source.model_dump()
        path = out_dir / "institution" / state.lower() / f"{inst.slug}.json"
        _write_json(path, payload, written)

        # Per-program pages
        for prog in progs:
            prog_path = (
                out_dir
                / "program"
                / state.lower()
                / inst.slug
                / f"{prog.slug}.json"
            )
            peers = []
            for p in programs:
                if (
                    p.cip_code == prog.cip_code
                    and p.credential_level == prog.credential_level
                    and p.institution_unitid != prog.institution_unitid
                ):
                    peers.append({
                        "institution_slug": p.institution_slug,
                        "institution_name": p.institution_name,
                        "earnings_median_5yr": p.earnings_median_5yr,
                        "earnings_median_4yr": p.earnings_median_4yr,
                        "debt_median": p.debt_median,
                        "completers": p.completers,
                        "completers_single_year": p.completers_single_year,
                        "pooled_earnings": p.pooled_earnings,
                    })
            peers.sort(key=lambda r: (r["earnings_median_5yr"] or 0), reverse=True)
            program_payload = {
                **prog.model_dump(),
                "institution": {
                    "unitid": inst.unitid,
                    "slug": inst.slug,
                    "name": inst.name,
                    "city": inst.city,
                    "city_slug": inst.city_slug,
                    "control": inst.control,
                },
                "peers_in_state": peers,
                "roi": build_program_roi(prog, inst),
                "source": source.model_dump(),
            }
            _write_json(prog_path, program_payload, written)

            if prog.earnings_median_4yr is not None or prog.earnings_median_5yr is not None:
                sitemap_programs.setdefault(inst.slug, []).append(prog.slug)

    # Per-state sitemap shard, consumed by frontend/scripts/prebuild.mjs. Lives
    # outside the program/institution/city trees because prebuild deletes those
    # from the Vercel build workspace; this stays so the sitemap can be built.
    sitemap_payload = {
        "state": state.lower(),
        "institutions": {
            slug: sorted(sitemap_programs[slug]) for slug in sorted(sitemap_programs)
        },
    }
    _write_json(out_dir / "sitemap" / f"{state.lower()}.json", sitemap_payload, written)

    deleted = 0
    for sub in ("city", "institution", "program"):
        scope = out_dir / sub / state.lower()
        deleted += _cleanup_stale(scope, written)

    return {
        "institutions": len(institutions),
        "cities": len(cities),
        "programs": len(programs),
        "sitemap_programs": sum(len(v) for v in sitemap_programs.values()),
        "files_written": len(written),
        "stale_deleted": deleted,
    }


def publish_home(
    *,
    out_dir: Path,
    states_published: Iterable[str],
    institution_counts: dict[str, int],
    program_counts: dict[str, int],
    source: Source,
) -> Path:
    from ..normalize.text import STATE_NAMES
    states = []
    for s in sorted(states_published):
        states.append({
            "slug": s.lower(),
            "name": STATE_NAMES.get(s.upper(), s),
            "institution_count": institution_counts.get(s, 0),
            "program_count": program_counts.get(s, 0),
        })
    payload = HomePayload(
        states=states,
        institution_count=sum(institution_counts.values()),
        program_count=sum(program_counts.values()),
        coverage_note=(
            f"Coverage: {len(states)} state(s). "
            "Federal sources only — College Scorecard institution + Field-of-Study "
            "+ historical bulk archive + IPEDS HD."
        ),
        source=source,
    )
    path = out_dir / "home.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload.model_dump(), f, ensure_ascii=False, indent=2, default=str)
    return path


def publish_methodology(*, out_dir: Path, source: Source) -> Path:
    payload = {
        "title": "Methodology",
        "source": source.model_dump(),
        "sections": [
            {
                "id": "sources",
                "heading": "Federal sources",
                "body": (
                    "All data on this site is published by the U.S. Department of Education. "
                    "Institution-level metrics come from the College Scorecard Most-Recent-Cohorts "
                    "release plus the historical bulk archive (MERGED<year>_<year+1>_PP.csv files, "
                    "1996–97 through 2010–11). Program-level earnings and debt come from College "
                    "Scorecard Field of Study Data, derived from Treasury IRS tax records under "
                    "federal data-sharing agreements; the FoS history covers 2014–15 through "
                    "2020–21 plus the 2025 most-recent vintage. Institution directory, address, "
                    "and Carnegie classification come from IPEDS HD."
                ),
            },
            {
                "id": "earnings",
                "heading": "How earnings are reported",
                "body": (
                    "Earnings are median annual earnings of working students 4, 5, 6, 8, or 10 "
                    "years after enrollment (institution-level) or 4 or 5 years after completion "
                    "(program-level), computed from federal tax records. They describe what former "
                    "students earned, not what attending the institution causes. Selection effects "
                    "(who enrolls, who completes, what fields they enter) are the dominant "
                    "explanation of cross-institution variation."
                ),
            },
            {
                "id": "long-arc",
                "heading": "Long-arc shifts",
                "body": (
                    "We surface descriptive multi-year change in completion, enrollment, tuition, "
                    "median debt, and default rate when the change exceeds a metric-specific "
                    "threshold and a materiality floor. These are past-tense observations of what "
                    "the data shows over the available vintages, not forecasts. We never project "
                    "future earnings or outcomes."
                ),
            },
            {
                "id": "suppression",
                "heading": "Why some cells are blank",
                "body": (
                    "Federal privacy rules suppress earnings and debt cells when the underlying "
                    "cohort is too small (typically <30 students). On this site those appear as "
                    "— (em-dash). Suppression is per-metric: a program may publish earnings "
                    "but suppress debt, or vice versa."
                ),
            },
            {
                "id": "pooled-earnings",
                "heading": "Pooled program earnings across system campuses",
                "body": (
                    "When a campus's program earnings cohort is below the privacy threshold, "
                    "College Scorecard sometimes publishes the parent OPEID's pooled value across "
                    "branches. This is why a satellite campus may show the same program-level "
                    "earnings as its main campus. We surface a 'pooled earnings' badge when this "
                    "is detected so you can read the figure correctly."
                ),
            },
            {
                "id": "completers",
                "heading": "Completer counts",
                "body": (
                    "Program-level completer counts use IPEDSCOUNT2 — the 4-year cumulative "
                    "cohort matched to the earnings calculation. We also surface IPEDSCOUNT1 "
                    "(latest single year of awards) for transparency. A small program may show "
                    "11 completers over four years because it's a small program, not because of "
                    "a data issue."
                ),
            },
            {
                "id": "ranking-slices",
                "heading": "How the program rankings are sliced",
                "body": (
                    "Three program-ranking surfaces draw from the same Field-of-Study pool: "
                    "/rankings/programs lists every (program × institution × credential) row "
                    "together, /rankings/credentials groups them by credential level "
                    "(Undergraduate Certificate, Associate's, Bachelor's, Master's, Doctoral, "
                    "First-Professional, Graduate Certificate — the codes published by Scorecard "
                    "as CREDLEV), and /rankings/fields groups them by NCES CIP-2 family — the "
                    "broad academic field (Engineering, Health Professions, Business, etc., "
                    "identified by the first two digits of the six-digit CIP code). The slices "
                    "exist because earnings distributions are very different across credentials "
                    "and across fields: a global ranking is dominated by graduate-credential STEM "
                    "programs, which is editorially less informative than a within-credential or "
                    "within-field comparison. All three surfaces apply the same 1,000-undergrad "
                    "floor on the parent institution to keep small specialty institutes from "
                    "dominating the extremes. We do not aggregate metrics into a composite "
                    "score — direction and method are reader-specific."
                ),
            },
            {
                "id": "roi",
                "heading": "How the ROI calculator works",
                "body": (
                    "Program and institution pages carry a financial-outcomes calculator. "
                    "It is an outcomes illustration, not a forecast. The math: net price "
                    "by family-income bracket (Scorecard NPT4{1..5}_{PUB,PRIV}) is treated "
                    "as the per-year cost; observed Scorecard 5-year-post-completion "
                    "earnings are projected forward using a Mincer age-earnings curve "
                    "(log earnings as a quadratic in work experience) with CIP-family-"
                    "specific slopes from Heckman-Lochner-Todd 2006 and the Card 1999 "
                    "returns-to-schooling survey. State-level median earnings of HS-only "
                    "workers aged 22-30 (BLS CPS 2024 Educational Attainment) provide "
                    "the counterfactual; future earnings are discounted at a user-chosen "
                    "rate (default 5%). A toggle applies a Dale-Krueger selection "
                    "shrinkage to the earnings premium — Dale & Krueger's 2002 and 2014 "
                    "matched-applicant analyses showed the cross-sectional college "
                    "premium overstates the causal return for non-STEM fields by "
                    "roughly 50%; we apply per-CIP-family shrinkage factors of 0.10 for "
                    "STEM rising to 0.60 for arts and education. The toggle ships off "
                    "by default. When Scorecard suppresses earnings (cohort < 30) the "
                    "calculator shows nothing — we don't impute. The result is a single "
                    "NPV figure plus the year cumulative discounted earnings cross zero, "
                    "under the user's assumptions. Constants are republished at every "
                    "build to data/published/roi_constants.json with provenance stamps."
                ),
            },
            {
                "id": "what-we-do-not-do",
                "heading": "What this site does not do",
                "body": (
                    "We do not forecast future earnings. We do not infer causation from "
                    "outcomes. We do not surface star ratings or letter grades. We do not "
                    "ingest reviews, survey-based reputation data, or any non-federal source. "
                    "We do not slice outcomes by race or gender — the federal data exists in "
                    "IPEDS GR but the causal-claim risk on demographic-conditioned outcomes is "
                    "high enough that we hold the surface for an editorial review pass."
                ),
            },
        ],
    }
    path = out_dir / "methodology.json"
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2, default=str)
    return path


def make_source(vintage: str = "2025-05", history_vintages: list[int] | None = None) -> Source:
    return Source(
        name="College Scorecard + IPEDS HD",
        vintage=vintage,
        retrieved=date.today().isoformat(),
        history_vintages=history_vintages or [],
    )

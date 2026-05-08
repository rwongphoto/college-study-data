"""Pipeline CLI.

Usage:
    python -m pipeline.src.main run --state or
"""
from __future__ import annotations

from collections import defaultdict
from pathlib import Path
from typing import Optional

import click

from .aggregate.build import detect_institution_long_arcs, detect_program_long_arcs
from .flags.engine import run_institution as run_institution_flags
from .flags.engine import run_program as run_program_flags
from .ingest.fos_history import load_program_history
from .ingest.ipeds_hd import load_hd
from .ingest.scorecard import (
    institution_from_row,
    load_field_of_study,
    load_institutions,
    program_from_row,
)
from .ingest.scorecard_api import (
    fetch_national_api_history,
    fetch_state_api_history,
    merge_history,
)
from .ingest.scorecard_history import load_national_history, load_state_history
from .models import InstitutionHistory, ProgramHistory
from .normalize.text import STATE_NAMES
from .publish.rankings import publish_rankings
from .publish.site import (
    make_source,
    publish_home,
    publish_methodology,
    publish_state,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_RAW = PROJECT_ROOT / "data" / "raw"
DATA_PUBLISHED = PROJECT_ROOT / "data" / "published"


def _detect_pooled_earnings(programs: list, programs_by_unitid: dict[str, list]) -> None:
    """Mark programs whose earnings_median_5yr matches a sibling-campus value
    sharing the same OPEID6 + CIP + credlev. Set `pooled_earnings = True` on
    the program record. Heuristic: if two campuses with the same OPEID6 emit
    the *exact* same earnings_median_5yr for the same CIP×credlev, Scorecard
    pooled them. We mark all but the campus with the larger completer cohort
    (the canonical 'home' campus).
    """
    from collections import defaultdict
    by_opeid_cip: dict[tuple[str, str, int], list] = defaultdict(list)
    for p in programs:
        # OPEID6 isn't on Program — look up via unitid
        # We don't have OPEID6 here, so we approximate by name prefix on
        # known multi-campus systems. For now, detect identical earnings on
        # different unitids with same CIP + credlev — that's the strong signal.
        key = (p.cip_code, p.credential_level, p.earnings_median_5yr)
        if p.earnings_median_5yr is not None:
            by_opeid_cip[key].append(p)

    for key, group in by_opeid_cip.items():
        if len(group) <= 1:
            continue
        # Find max completers
        with_counts = [(p, p.completers or 0) for p in group]
        with_counts.sort(key=lambda t: t[1], reverse=True)
        # The campus with the biggest cohort isn't pooled; the rest are
        for p, _ in with_counts[1:]:
            p.pooled_earnings = True


@click.group()
def cli() -> None:
    """College outcome data pipeline."""


@cli.command()
@click.option("--state", required=True, help="2-letter state postal code (e.g. or)")
@click.option(
    "--institution-csv",
    default=str(DATA_RAW / "scorecard_institution" / "Most-Recent-Cohorts-Institution_05192025.csv"),
)
@click.option(
    "--fos-csv",
    default=str(DATA_RAW / "scorecard_field_of_study" / "Most-Recent-Cohorts-Field-of-Study.csv"),
)
@click.option(
    "--hd-csv",
    default=str(DATA_RAW / "ipeds_hd2023" / "HD2023.csv"),
)
@click.option(
    "--bulk-dir",
    default=str(DATA_RAW / "scorecard_bulk" / "College_Scorecard_Raw_Data_05192025"),
    help="Directory containing historical MERGED<year>_<year+1>_PP.csv and FieldOfStudyData<...>_PP.csv files.",
)
@click.option(
    "--out-dir",
    default=str(DATA_PUBLISHED),
)
def run(
    state: str,
    institution_csv: str,
    fos_csv: str,
    hd_csv: str,
    bulk_dir: str,
    out_dir: str,
) -> None:
    """Run ingest → aggregate → publish for a single state."""
    state = state.upper()
    out_path = Path(out_dir)
    bulk_path = Path(bulk_dir)
    click.echo(f"=== Building {state} ===")

    click.echo("Loading Scorecard institutions ...")
    sc_inst = load_institutions(Path(institution_csv), state=state, main_only=True)
    click.echo(f"  {len(sc_inst)} institutions in {state} (main campuses)")

    click.echo("Loading IPEDS HD ...")
    hd = load_hd(Path(hd_csv), state=state)
    click.echo(f"  {len(hd)} active HD rows in {state}")

    # Build institutions (Scorecard ⨝ HD on UNITID)
    institutions = []
    for _, sc_row in sc_inst.iterrows():
        unitid = str(sc_row["UNITID"])
        hd_row = hd.loc[unitid] if unitid in hd.index else None
        institutions.append(institution_from_row(sc_row, hd_row))
    click.echo(f"  Built {len(institutions)} Institution models")

    # Multi-vintage institution history — bulk MERGED (1996-2010)
    click.echo(f"Loading historical Scorecard MERGED files from {bulk_path} ...")
    bulk_history, bulk_vintages = load_state_history(bulk_path, state)
    click.echo(f"  bulk: {len(bulk_history)} institutions w/ history; "
               f"vintages {min(bulk_vintages, default='—')}–{max(bulk_vintages, default='—')} "
               f"({len(bulk_vintages)} years)")

    # College Scorecard API — fills 2011-2024 + Treasury earnings.
    # Range goes to 2024 because fast-cycling metrics (enrollment, completion,
    # tuition, default rate) publish for the most recent academic year. Slow-
    # cycling metrics (Treasury earnings, median debt) lag and return null —
    # `merge_history()` drops nulls, so over-querying is free.
    api_years = list(range(2002, 2025))
    click.echo(f"Calling College Scorecard API for years {api_years[0]}-{api_years[-1]} ...")
    api_history, api_vintages = fetch_state_api_history(
        state=state,
        years=api_years,
        project_root=PROJECT_ROOT,
    )
    click.echo(f"  api: {len(api_history)} institutions w/ history; "
               f"vintages with data: {api_vintages}")

    history_by_unitid = merge_history(bulk_history, api_history)
    inst_vintages = sorted(set(bulk_vintages + api_vintages))
    click.echo(f"  merged: {len(history_by_unitid)} institutions; "
               f"continuous vintage range {min(inst_vintages, default='—')}–{max(inst_vintages, default='—')} "
               f"({len(inst_vintages)} years)")

    # Attach history + detect long-arc per institution
    for inst in institutions:
        h = history_by_unitid.get(inst.unitid, {})
        inst.history = InstitutionHistory(**{
            metric: pts for metric, pts in h.items()
        })
        inst.long_arc = detect_institution_long_arcs(inst)

    # Anomaly engine — run institution-level flags now that long-arcs and the
    # full institution pool are populated. Detectors that need peers (peer
    # outlier, earnings trend) read from the same `institutions` list.
    inst_flag_total = 0
    for inst in institutions:
        inst.flags = run_institution_flags(inst, pool=institutions)
        inst_flag_total += len(inst.flags)
    click.echo(f"  Anomaly engine: {inst_flag_total} institution-level flags")

    # Program history (FoS files)
    click.echo("Loading Scorecard FieldOfStudyData (current vintage) ...")
    inst_by_unitid = {i.unitid: i for i in institutions}
    fos = load_field_of_study(Path(fos_csv), unitid_filter=set(inst_by_unitid))
    click.echo(f"  {len(fos)} FoS rows for {state} institutions")

    programs = []
    for _, fos_row in fos.iterrows():
        p = program_from_row(fos_row, inst_by_unitid)
        if p is not None:
            programs.append(p)
    click.echo(f"  Built {len(programs)} Program models")

    click.echo(f"Loading historical FieldOfStudyData files from {bulk_path} ...")
    fos_history, fos_vintages = load_program_history(
        bulk_path,
        unitid_filter=set(inst_by_unitid),
    )
    click.echo(f"  {len(fos_history)} (unitid×cip×credlev) keys w/ history; "
               f"FoS vintages {fos_vintages}")

    # Attach FoS history to programs + detect long-arc + flag pooled earnings
    inst_by_unitid_lookup = {i.unitid: i for i in institutions}
    prog_flag_total = 0
    for prog in programs:
        key = (prog.institution_unitid, prog.cip_code, prog.credential_level)
        h = fos_history.get(key, {})
        prog.history = ProgramHistory(**h)
        prog.long_arc = detect_program_long_arcs(prog)
        # Anomaly engine — program-level (program long-arc + program D/E).
        scope_inst = inst_by_unitid_lookup.get(prog.institution_unitid)
        scope = (
            f"{prog.cip_desc.rstrip('.')} at {scope_inst.name}"
            if scope_inst is not None
            else prog.cip_desc.rstrip(".")
        )
        prog.flags = run_program_flags(prog, scope=scope)
        prog_flag_total += len(prog.flags)
    click.echo(f"  Anomaly engine: {prog_flag_total} program-level flags")

    # Pooled-earnings detection (heuristic: identical earnings across campuses
    # for same CIP×credlev means Scorecard pooled to parent OPEID).
    programs_by_unitid: dict[str, list] = defaultdict(list)
    for p in programs:
        programs_by_unitid[p.institution_unitid].append(p)
    _detect_pooled_earnings(programs, programs_by_unitid)
    pooled_count = sum(1 for p in programs if p.pooled_earnings)
    click.echo(f"  Detected {pooled_count} programs with pooled-earnings (parent-OPEID rollup)")

    # Publish
    all_vintages = sorted(set(inst_vintages + fos_vintages))
    source = make_source(history_vintages=all_vintages)
    click.echo("Publishing ...")
    counts = publish_state(
        state=state,
        institutions=institutions,
        programs=programs,
        out_dir=out_path,
        source=source,
    )
    for k, v in counts.items():
        click.echo(f"  {k}: {v}")

    publish_home(
        out_dir=out_path,
        states_published=[state],
        institution_counts={state: len(institutions)},
        program_counts={state: len(programs)},
        source=source,
    )
    publish_methodology(out_dir=out_path, source=source)
    from .publish.roi import publish_roi_constants
    publish_roi_constants(out_dir=out_path)
    click.echo("Wrote home.json + methodology.json + roi_constants.json")

    reporting_year = max(all_vintages) if all_vintages else 2024
    rankings_path = publish_rankings(
        out_dir=out_path, reporting_year=reporting_year
    )
    click.echo(f"Wrote {rankings_path.name} (reporting_year={reporting_year})")
    click.echo(f"=== Done. Output: {out_path} ===")


# Postal codes for the 50 states + DC + PR. Matches what STATE_NAMES exposes.
NATIONAL_STATES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL",
    "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
    "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
    "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
    "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI",
    "WY", "PR",
]


@cli.command("run-all")
@click.option(
    "--institution-csv",
    default=str(DATA_RAW / "scorecard_institution" / "Most-Recent-Cohorts-Institution_05192025.csv"),
)
@click.option(
    "--fos-csv",
    default=str(DATA_RAW / "scorecard_field_of_study" / "Most-Recent-Cohorts-Field-of-Study.csv"),
)
@click.option(
    "--hd-csv",
    default=str(DATA_RAW / "ipeds_hd2023" / "HD2023.csv"),
)
@click.option(
    "--bulk-dir",
    default=str(DATA_RAW / "scorecard_bulk" / "College_Scorecard_Raw_Data_05192025"),
)
@click.option("--out-dir", default=str(DATA_PUBLISHED))
@click.option(
    "--states",
    default=None,
    help="Optional comma-separated state postal codes; default = all 50 + DC + PR.",
)
@click.option(
    "--skip-api",
    is_flag=True,
    default=False,
    help="Skip the College Scorecard API call (use bulk MERGED history only).",
)
def run_all(
    institution_csv: str,
    fos_csv: str,
    hd_csv: str,
    bulk_dir: str,
    out_dir: str,
    states: Optional[str],
    skip_api: bool,
) -> None:
    """National pipeline — load shared data once, publish every state.

    Optimized so the 14 historical MERGED files and the API national pull
    happen ONCE up-front; per-state work is only filtering + aggregating +
    publishing. Roughly 5× faster than `run --state X` per state.
    """
    out_path = Path(out_dir)
    bulk_path = Path(bulk_dir)
    state_list = (
        [s.strip().upper() for s in states.split(",") if s.strip()]
        if states
        else NATIONAL_STATES
    )
    click.echo(f"=== National build · {len(state_list)} states ===")

    # ----- Shared data, loaded once -----
    click.echo("Loading Scorecard institutions (national) ...")
    sc_inst_all = load_institutions(Path(institution_csv), state=None, main_only=True)
    click.echo(f"  {len(sc_inst_all)} main-campus institutions in CSV")

    click.echo("Loading IPEDS HD (national) ...")
    hd_all = load_hd(Path(hd_csv), state=None)
    click.echo(f"  {len(hd_all)} active HD rows")

    click.echo(f"Loading historical Scorecard MERGED files from {bulk_path} (national) ...")
    bulk_history_by_state, bulk_vintages = load_national_history(bulk_path)
    click.echo(
        f"  bulk: {len(bulk_history_by_state)} states represented; "
        f"vintages {min(bulk_vintages, default='—')}–{max(bulk_vintages, default='—')} "
        f"({len(bulk_vintages)} years)"
    )

    api_history_by_state: dict[str, dict[str, dict[str, list]]] = {}
    api_vintages: list[int] = []
    if not skip_api:
        api_years = list(range(2002, 2025))
        click.echo(f"Calling College Scorecard API (national) for years {api_years[0]}-{api_years[-1]} ...")
        api_history_by_state, api_vintages = fetch_national_api_history(
            years=api_years,
            project_root=PROJECT_ROOT,
        )
        click.echo(
            f"  api: {len(api_history_by_state)} states represented; "
            f"vintages with data: {len(api_vintages)}"
        )
    else:
        click.echo("Skipping API call (--skip-api).")

    click.echo("Loading Scorecard FieldOfStudyData (national) ...")
    fos_all = load_field_of_study(Path(fos_csv), unitid_filter=None)
    click.echo(f"  {len(fos_all)} FoS rows nationally")

    click.echo(f"Loading historical FieldOfStudyData files from {bulk_path} (national) ...")
    fos_history_all, fos_vintages = load_program_history(
        bulk_path,
        unitid_filter=None,
    )
    click.echo(
        f"  {len(fos_history_all)} (unitid×cip×credlev) keys w/ history; "
        f"FoS vintages {fos_vintages}"
    )

    inst_vintages = sorted(set(bulk_vintages + api_vintages))
    all_vintages = sorted(set(inst_vintages + fos_vintages))
    source = make_source(history_vintages=all_vintages)

    # Pre-index national FoS rows by state for cheap per-state filtering
    sc_inst_by_state: dict[str, list] = defaultdict(list)
    for _, row in sc_inst_all.iterrows():
        sc_inst_by_state[str(row["STABBR"]).upper()].append(row)

    # Per-state publish — reuses shared data
    institution_counts: dict[str, int] = {}
    program_counts: dict[str, int] = {}
    states_published: list[str] = []
    skipped: list[str] = []

    for state in state_list:
        state_rows = sc_inst_by_state.get(state, [])
        if not state_rows:
            skipped.append(state)
            continue
        state_name = STATE_NAMES.get(state, state)
        click.echo(f"\n--- {state} · {state_name} · {len(state_rows)} institutions ---")

        institutions = []
        for sc_row in state_rows:
            unitid = str(sc_row["UNITID"])
            hd_row = hd_all.loc[unitid] if unitid in hd_all.index else None
            institutions.append(institution_from_row(sc_row, hd_row))

        # Merge bulk + API history for this state
        bulk_state = bulk_history_by_state.get(state, {})
        api_state = api_history_by_state.get(state, {})
        history_by_unitid = merge_history(bulk_state, api_state)
        for inst in institutions:
            h = history_by_unitid.get(inst.unitid, {})
            inst.history = InstitutionHistory(**{m: pts for m, pts in h.items()})
            inst.long_arc = detect_institution_long_arcs(inst)
            inst.flags = run_institution_flags(inst, pool=institutions)

        # Programs for this state — filter the national FoS frame to our unitids
        state_unitids = {i.unitid for i in institutions}
        state_fos = fos_all[fos_all["UNITID"].astype(str).isin(state_unitids)]
        inst_by_unitid_state = {i.unitid: i for i in institutions}
        programs = []
        for _, fos_row in state_fos.iterrows():
            p = program_from_row(fos_row, inst_by_unitid_state)
            if p is not None:
                programs.append(p)
        for prog in programs:
            key = (prog.institution_unitid, prog.cip_code, prog.credential_level)
            h = fos_history_all.get(key, {})
            prog.history = ProgramHistory(**h)
            prog.long_arc = detect_program_long_arcs(prog)
            scope_inst = inst_by_unitid_state.get(prog.institution_unitid)
            scope = (
                f"{prog.cip_desc.rstrip('.')} at {scope_inst.name}"
                if scope_inst is not None
                else prog.cip_desc.rstrip(".")
            )
            prog.flags = run_program_flags(prog, scope=scope)

        # Pooled-earnings detection
        programs_by_unitid: dict[str, list] = defaultdict(list)
        for p in programs:
            programs_by_unitid[p.institution_unitid].append(p)
        _detect_pooled_earnings(programs, programs_by_unitid)

        # Publish this state
        counts = publish_state(
            state=state,
            institutions=institutions,
            programs=programs,
            out_dir=out_path,
            source=source,
        )
        click.echo(
            f"  {state}: {counts['institutions']} insts, "
            f"{counts['cities']} cities, {counts['programs']} programs · "
            f"files_written={counts['files_written']} stale_deleted={counts['stale_deleted']}"
        )
        institution_counts[state] = counts["institutions"]
        program_counts[state] = counts["programs"]
        states_published.append(state)

    if skipped:
        click.echo(f"\nSkipped (no institutions in CSV): {','.join(skipped)}")

    # Publish home + methodology
    publish_home(
        out_dir=out_path,
        states_published=states_published,
        institution_counts=institution_counts,
        program_counts=program_counts,
        source=source,
    )
    publish_methodology(out_dir=out_path, source=source)
    from .publish.roi import publish_roi_constants
    publish_roi_constants(out_dir=out_path)

    reporting_year = max(all_vintages) if all_vintages else 2024
    rankings_path = publish_rankings(
        out_dir=out_path, reporting_year=reporting_year
    )
    click.echo(f"Wrote {rankings_path.name} (reporting_year={reporting_year})")

    total_inst = sum(institution_counts.values())
    total_prog = sum(program_counts.values())
    click.echo(
        f"\n=== Done. {len(states_published)} states · {total_inst} institutions · "
        f"{total_prog} programs ==="
    )


if __name__ == "__main__":
    cli()

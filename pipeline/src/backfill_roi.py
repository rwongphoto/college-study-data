"""Backfill ``institution.cost_by_income`` + program ``roi`` on existing
published JSONs.

The May 9 republish for AK/AL/AR/AZ/CA dropped two fields:
  - ``institution.cost_by_income`` (the NPT4{1..5} per-bracket net price)
  - per-program ``roi`` block

Without ``cost_by_income``, the frontend ROI calculator's family-income
toggle has nothing to swap and NPV doesn't move. This script reads the
raw Scorecard CSV, patches ``cost_by_income`` into each affected
institution JSON, then recomputes the ``roi`` block on every program
JSON in those states. Only those two keys are touched; every other
field is preserved exactly.

    python -m pipeline.src.backfill_roi --states ak,al,ar,az,ca
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Optional

import click
import pandas as pd

from .ingest.scorecard import _cost_by_income, _to_int
from .models import Institution, Program
from .publish.roi import build_program_roi


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_PUBLISHED = PROJECT_ROOT / "data" / "published"
INSTITUTION_CSV = (
    PROJECT_ROOT / "data" / "raw" / "scorecard_institution"
    / "Most-Recent-Cohorts-Institution_05192025.csv"
)

CONTROL_MAP = {1: "public", 2: "private_nonprofit", 3: "private_forprofit"}


def _load_cost_by_unitid() -> dict[str, Optional[dict]]:
    """Return UNITID → cost_by_income dict (or None when fully suppressed)."""
    cols = {
        "UNITID", "CONTROL",
        "NPT41_PUB", "NPT42_PUB", "NPT43_PUB", "NPT44_PUB", "NPT45_PUB",
        "NPT41_PRIV", "NPT42_PRIV", "NPT43_PRIV", "NPT44_PRIV", "NPT45_PRIV",
        "COSTT4_A", "COSTT4_P",
    }
    df = pd.read_csv(
        INSTITUTION_CSV,
        usecols=lambda c: c in cols,
        dtype={"UNITID": str},
        low_memory=False,
    )
    out: dict[str, Optional[dict]] = {}
    for _, row in df.iterrows():
        control = CONTROL_MAP.get(_to_int(row.get("CONTROL")), "unknown")
        out[str(row["UNITID"])] = _cost_by_income(row, control)
    return out


def _patch_institution_cost(
    state: str,
    cost_by_unitid: dict[str, Optional[dict]],
) -> tuple[int, int]:
    inst_dir = DATA_PUBLISHED / "institution" / state
    if not inst_dir.is_dir():
        return 0, 0
    patched = 0
    unchanged = 0
    for path in sorted(inst_dir.glob("*.json")):
        raw = json.loads(path.read_text())
        inst = raw.get("institution") or {}
        unitid = inst.get("unitid")
        if unitid is None:
            unchanged += 1
            continue
        new_val = cost_by_unitid.get(str(unitid))
        if inst.get("cost_by_income") == new_val:
            unchanged += 1
            continue
        inst["cost_by_income"] = new_val
        path.write_text(json.dumps(raw, ensure_ascii=False, indent=2))
        patched += 1
    return patched, unchanged


def _load_institution_model(state: str, inst_slug: str) -> Optional[Institution]:
    path = DATA_PUBLISHED / "institution" / state / f"{inst_slug}.json"
    if not path.is_file():
        return None
    raw = json.loads(path.read_text())
    data = raw.get("institution")
    if data is None:
        return None
    allowed = set(Institution.model_fields.keys())
    cleaned = {k: v for k, v in data.items() if k in allowed}
    return Institution(**cleaned)


def _load_program_model(raw: dict) -> Program:
    allowed = set(Program.model_fields.keys())
    cleaned = {k: v for k, v in raw.items() if k in allowed}
    return Program(**cleaned)


def _backfill_program_roi(state: str) -> tuple[int, int]:
    prog_dir = DATA_PUBLISHED / "program" / state
    if not prog_dir.is_dir():
        return 0, 0
    inst_cache: dict[str, Institution] = {}
    patched = 0
    failed = 0
    for inst_dir in sorted(prog_dir.iterdir()):
        if not inst_dir.is_dir():
            continue
        inst_slug = inst_dir.name
        if inst_slug not in inst_cache:
            m = _load_institution_model(state, inst_slug)
            if m is None:
                click.echo(f"  ! no institution payload for {inst_slug}", err=True)
                continue
            inst_cache[inst_slug] = m
        inst = inst_cache[inst_slug]
        for prog_path in sorted(inst_dir.glob("*.json")):
            raw = json.loads(prog_path.read_text())
            try:
                prog = _load_program_model(raw)
                raw["roi"] = build_program_roi(prog, inst)
            except Exception as e:  # noqa: BLE001
                click.echo(f"  ! failed {prog_path.name}: {e}", err=True)
                failed += 1
                continue
            prog_path.write_text(json.dumps(raw, ensure_ascii=False, indent=2))
            patched += 1
    return patched, failed


@click.command()
@click.option(
    "--states",
    required=True,
    help="Comma-separated 2-letter state codes (lowercase or upper).",
)
def main(states: str) -> None:
    state_list = [s.strip().lower() for s in states.split(",") if s.strip()]
    click.echo(f"Loading Scorecard institution CSV ({INSTITUTION_CSV.name}) ...")
    cost_by_unitid = _load_cost_by_unitid()
    click.echo(f"  {len(cost_by_unitid)} UNITIDs indexed")

    grand_inst = 0
    grand_prog = 0
    grand_failed = 0
    for state in state_list:
        click.echo(f"\n=== {state.upper()} ===")
        ip, iu = _patch_institution_cost(state, cost_by_unitid)
        click.echo(f"  institutions patched={ip} unchanged={iu}")
        pp, pf = _backfill_program_roi(state)
        click.echo(f"  programs roi rebuilt={pp} failed={pf}")
        grand_inst += ip
        grand_prog += pp
        grand_failed += pf

    click.echo(
        f"\nTotal: institutions={grand_inst}  programs={grand_prog}  failed={grand_failed}"
    )
    if grand_failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()

"""Backfill the ``roi`` block on existing published program JSONs.

For each ``data/published/program/<state>/<inst>/<prog>.json`` in the given
state(s), reconstructs ``Program`` + ``Institution`` from the published
artifacts and patches in ``"roi": build_program_roi(prog, inst)``. Touches
only that single key; preserves everything else exactly as-is.

Use when a state was published by an older pipeline version that didn't
attach roi yet:

    python -m pipeline.src.backfill_roi --states ak,al,ar,az,ca
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import click

from .models import Institution, Program
from .publish.roi import build_program_roi


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_PUBLISHED = PROJECT_ROOT / "data" / "published"


def _load_institution(state: str, inst_slug: str) -> Institution | None:
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


def _load_program(raw: dict) -> Program:
    allowed = set(Program.model_fields.keys())
    cleaned = {k: v for k, v in raw.items() if k in allowed}
    return Program(**cleaned)


def _backfill_state(state: str) -> tuple[int, int, int]:
    prog_dir = DATA_PUBLISHED / "program" / state
    if not prog_dir.is_dir():
        click.echo(f"  no program dir at {prog_dir}", err=True)
        return 0, 0, 0

    inst_cache: dict[str, Institution] = {}
    patched = 0
    skipped_already = 0
    failed = 0

    for inst_dir in sorted(prog_dir.iterdir()):
        if not inst_dir.is_dir():
            continue
        inst_slug = inst_dir.name
        if inst_slug not in inst_cache:
            inst = _load_institution(state, inst_slug)
            if inst is None:
                click.echo(f"  ! no institution payload for {inst_slug}", err=True)
                continue
            inst_cache[inst_slug] = inst
        inst = inst_cache[inst_slug]

        for prog_path in sorted(inst_dir.glob("*.json")):
            raw = json.loads(prog_path.read_text())
            if "roi" in raw:
                skipped_already += 1
                continue
            try:
                prog = _load_program(raw)
                raw["roi"] = build_program_roi(prog, inst)
            except Exception as e:  # noqa: BLE001
                click.echo(f"  ! failed {prog_path.name}: {e}", err=True)
                failed += 1
                continue
            prog_path.write_text(
                json.dumps(raw, ensure_ascii=False, indent=2)
            )
            patched += 1

    return patched, skipped_already, failed


@click.command()
@click.option(
    "--states",
    required=True,
    help="Comma-separated 2-letter state codes (lowercase or upper).",
)
def main(states: str) -> None:
    state_list = [s.strip().lower() for s in states.split(",") if s.strip()]
    grand_patched = 0
    grand_skipped = 0
    grand_failed = 0
    for state in state_list:
        click.echo(f"=== {state.upper()} ===")
        patched, skipped, failed = _backfill_state(state)
        click.echo(
            f"  patched={patched}  already_had_roi={skipped}  failed={failed}"
        )
        grand_patched += patched
        grand_skipped += skipped
        grand_failed += failed
    click.echo(
        f"\nTotal: patched={grand_patched}  already_had_roi={grand_skipped}  "
        f"failed={grand_failed}"
    )
    if grand_failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()

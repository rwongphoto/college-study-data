"""Regenerate flags on existing published JSONs without re-running ingest.

Reads ``data/published/institution/<state>/*.json``, reconstructs
``Institution`` models from the JSON, runs the anomaly engine, and writes
the JSON back with a populated ``institution.flags`` array. Then updates
``state/<state>.json`` with rolled-up state-level flags.

Use after editing detector code to refresh published artifacts without
hitting the Scorecard API.

    python -m pipeline.src.regenerate_flags --state or
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import click

from .flags.engine import aggregate_state_flags, run_institution
from .models import Institution


PROJECT_ROOT = Path(__file__).resolve().parents[2]
DATA_PUBLISHED = PROJECT_ROOT / "data" / "published"


def _load_institution(path: Path) -> Institution | None:
    raw = json.loads(path.read_text())
    inst_data = raw.get("institution")
    if inst_data is None:
        return None
    try:
        # The JSON includes fields not on Institution (e.g. nothing extra here,
        # but the strict ConfigDict will throw on unknowns). Filter to known
        # keys to be safe across schema drift.
        allowed = set(Institution.model_fields.keys())
        cleaned = {k: v for k, v in inst_data.items() if k in allowed}
        # `flags` may be missing on older JSONs — that's fine, default is [].
        return Institution(**cleaned)
    except Exception as e:  # noqa: BLE001
        click.echo(f"  ! parse failed for {path.name}: {e}", err=True)
        return None


@click.command()
@click.option("--state", required=True)
def main(state: str) -> None:
    state = state.lower()
    inst_dir = DATA_PUBLISHED / "institution" / state
    if not inst_dir.is_dir():
        click.echo(f"No institution directory at {inst_dir}", err=True)
        sys.exit(1)

    inst_paths = sorted(inst_dir.glob("*.json"))
    click.echo(f"Loading {len(inst_paths)} institutions from {inst_dir} ...")

    pairs: list[tuple[Path, Institution, dict]] = []
    for path in inst_paths:
        raw = json.loads(path.read_text())
        inst = _load_institution(path)
        if inst is None:
            continue
        pairs.append((path, inst, raw))

    pool = [inst for _, inst, _ in pairs]
    click.echo(f"Running anomaly engine across {len(pool)} institutions ...")

    total_flags = 0
    severity_counts: dict[str, int] = {}
    for path, inst, raw in pairs:
        flags = run_institution(inst, pool=pool)
        inst.flags = flags
        total_flags += len(flags)
        for f in flags:
            severity_counts[f.severity] = severity_counts.get(f.severity, 0) + 1

        # Patch the published JSON in place: keep the existing structure and
        # only swap the ``institution.flags`` array.
        raw["institution"]["flags"] = [f.model_dump() for f in flags]
        path.write_text(json.dumps(raw, ensure_ascii=False, indent=2))

    click.echo(f"  {total_flags} institution flags")
    for sev, count in sorted(severity_counts.items(), key=lambda x: -x[1]):
        click.echo(f"    {sev}: {count}")

    # State-level rollup.
    state_path = DATA_PUBLISHED / "state" / f"{state}.json"
    if state_path.is_file():
        rolled = aggregate_state_flags(pool)
        state_raw = json.loads(state_path.read_text())
        state_raw["flags"] = [f.model_dump() for f in rolled]
        state_path.write_text(json.dumps(state_raw, ensure_ascii=False, indent=2))
        click.echo(f"  {len(rolled)} state-level flags written to {state_path.name}")
    else:
        click.echo(f"  state/{state}.json not found; skipping state rollup")


if __name__ == "__main__":
    main()

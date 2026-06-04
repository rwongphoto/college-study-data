"""Shared filesystem paths for the pipeline."""
from __future__ import annotations

from pathlib import Path

# pipeline/src/config.py → parents[2] == repo root (same anchor main.py uses).
REPO_ROOT = Path(__file__).resolve().parents[2]
PUBLISHED_ROOT = REPO_ROOT / "data" / "published"

# Changed-entity tags dropped by a publish run, consumed by `pipeline revalidate`.
# Lives OUTSIDE PUBLISHED_ROOT so it isn't served from the data CDN. Gitignored.
REVALIDATE_QUEUE = REPO_ROOT / "data" / "_revalidate_queue.json"

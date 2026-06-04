"""On-demand cache revalidation for the deployed site.

After a publish run writes fresh JSON and that JSON is pushed to the data CDN
(raw.githubusercontent), this step tells the site to regenerate exactly the
entity pages whose content changed — instead of letting every page expire on the
30-day ISR timer or cold-start on the next deploy.

Flow:
    pipeline run        -> writes data/_revalidate_queue.json (changed tags)
    git commit && push  -> new JSON live on the data CDN
    pipeline revalidate -> POSTs the tags to {site}/api/revalidate

The endpoint (frontend/src/app/api/revalidate/route.ts) revalidates each tag,
busting both the CDN fetch cache and the page that rendered it. Ordering matters:
run `revalidate` AFTER the push, or the regenerate will just re-pull stale CDN
data.

Auth: the shared secret in $REVALIDATE_SECRET, sent as the x-revalidate-secret
header and matched against the same env var set on the Vercel project.
"""

from __future__ import annotations

import json
import logging
import os
import urllib.error
import urllib.request
from pathlib import Path

from ..config import REPO_ROOT, REVALIDATE_QUEUE

DEFAULT_SITE_URL = "https://www.collegegradanalyst.com"


def _load_env_file() -> None:
    """Load KEY=VALUE pairs from a gitignored `.env` at the repo root into the
    process environment, without overriding anything already set in the real
    shell. Lets `pipeline revalidate` find REVALIDATE_SECRET / SITE_URL with no
    manual `export` step."""
    env = REPO_ROOT / ".env"
    if not env.exists():
        return
    for line in env.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, val = line.partition("=")
        os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))


def _post_batch(endpoint: str, secret: str, tags: list[str], timeout: int = 30) -> None:
    body = json.dumps({"tags": tags}).encode("utf-8")
    req = urllib.request.Request(
        endpoint,
        data=body,
        method="POST",
        headers={
            "Content-Type": "application/json",
            "x-revalidate-secret": secret,
        },
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        resp.read()


def run_revalidate(
    site_url: str | None = None,
    queue_path: str | None = None,
    batch_size: int = 500,
    dry_run: bool = False,
) -> int:
    """Read the revalidate queue and POST its tags to the site in batches.
    Returns a process exit code (0 ok, non-zero on failure)."""
    _load_env_file()
    queue = Path(queue_path) if queue_path else REVALIDATE_QUEUE
    site = (site_url or os.environ.get("SITE_URL") or DEFAULT_SITE_URL).rstrip("/")
    endpoint = f"{site}/api/revalidate"

    if not queue.exists():
        logging.warning("revalidate: no queue at %s — nothing to do "
                        "(run a publish first)", queue)
        return 0

    try:
        tags = sorted(set(json.loads(queue.read_text()).get("tags", [])))
    except (json.JSONDecodeError, OSError) as e:
        logging.error("revalidate: cannot read queue %s: %s", queue, e)
        return 1

    if not tags:
        logging.info("revalidate: queue empty — no pages changed since last run")
        return 0

    batches = [tags[i:i + batch_size] for i in range(0, len(tags), batch_size)]

    if dry_run:
        logging.info("revalidate: DRY RUN — would POST %d tag(s) in %d batch(es) "
                    "to %s", len(tags), len(batches), endpoint)
        for t in tags[:20]:
            logging.info("  %s", t)
        if len(tags) > 20:
            logging.info("  ... and %d more", len(tags) - 20)
        return 0

    secret = os.environ.get("REVALIDATE_SECRET")
    if not secret:
        logging.error("revalidate: REVALIDATE_SECRET not set in environment")
        return 1

    for i, batch in enumerate(batches, 1):
        try:
            _post_batch(endpoint, secret, batch)
        except urllib.error.HTTPError as e:
            logging.error("revalidate: batch %d/%d failed — HTTP %s: %s",
                          i, len(batches), e.code, e.read().decode("utf-8", "replace"))
            return 1
        except urllib.error.URLError as e:
            logging.error("revalidate: batch %d/%d failed — %s", i, len(batches), e.reason)
            return 1
        logging.info("revalidate: batch %d/%d ok (%d tags)", i, len(batches), len(batch))

    logging.info("revalidate: done — %d page(s) invalidated at %s", len(tags), endpoint)
    return 0

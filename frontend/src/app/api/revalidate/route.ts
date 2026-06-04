import { revalidatePath, revalidateTag } from "next/cache";

// On-demand cache invalidation for the big-tree entity pages (city,
// institution, program). The publish pipeline POSTs here AFTER pushing fresh
// JSON to the data CDN, so only the entities whose content actually changed get
// regenerated — instead of every page expiring on the 30d ISR timer or
// cold-starting on the next deploy. See pipeline/src/publish/revalidate.py.
//
// Auth: shared secret in the `x-revalidate-secret` header, matched against
// REVALIDATE_SECRET (set on the Vercel project and in the pipeline's env).
//
// Body: { "tags": ["/program/ca/foo-univ/nursing.json", ...], "paths": ["/state/ca/"]? }
// `tags` is the primary path — each entity's CDN fetch is tagged with its
// published-relative path in src/lib/data.ts, so revalidating the tag busts the
// data-fetch cache and the page that rendered it in one shot. `paths` is an
// optional escape hatch for revalidating a literal route.

// Cap one request so a malformed/oversized body can't fan out unboundedly.
const MAX_ITEMS = 5000;

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return Response.json({ error: "REVALIDATE_SECRET not configured" }, { status: 500 });
  }
  if (request.headers.get("x-revalidate-secret") !== secret) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const { tags: rawTags, paths: rawPaths } = (body ?? {}) as Record<string, unknown>;
  const tags = asStringArray(rawTags);
  const paths = asStringArray(rawPaths);

  if (tags.length + paths.length === 0) {
    return Response.json({ error: "no tags or paths provided" }, { status: 400 });
  }
  if (tags.length + paths.length > MAX_ITEMS) {
    return Response.json({ error: `too many items (max ${MAX_ITEMS})` }, { status: 413 });
  }

  // "max" = longest stale-while-revalidate window; a publish is a background
  // refresh, so serving slightly-stale while the page regenerates is fine.
  for (const tag of tags) revalidateTag(tag, "max");
  for (const path of paths) revalidatePath(path);

  return Response.json({ revalidated: true, tags: tags.length, paths: paths.length });
}

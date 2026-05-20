// Prebuild: two jobs, both cheap (no walking the multi-GB program tree).
//
// 1. Emit a small manifest of state/city/institution slugs so the sitemap
//    function can iterate without reading the on-disk data tree (which isn't
//    bundled into Vercel functions — see src/lib/data.ts for the CDN strategy).
// 2. Emit XML sitemaps for the ~45k renderable program pages, one file per
//    state, plus a sitemap index. The renderable-program lists come from
//    per-state shards the Python pipeline writes to data/published/sitemap/
//    (publish_state). We never re-scan the 200k+ program JSONs here — that
//    would add ~1 min to every billed Vercel build.
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND = resolve(__dirname, "..");
const PUBLISHED = resolve(FRONTEND, "..", "data", "published");

if (!existsSync(PUBLISHED)) {
  console.error(`prebuild: ${PUBLISHED} does not exist`);
  process.exit(1);
}

// Keep in sync with src/lib/seo.ts SITE_URL so static sitemap URLs match the
// canonical domain the rest of the site emits.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.collegegradanalyst.com";

// Postal abbr → URL slug. Mirror of ABBR_TO_SLUG in src/lib/state.ts (the
// route layer can't be imported from this plain-Node build script). State
// slugs are immutable, so drift risk is effectively nil.
const ABBR_TO_SLUG = {
  al: "alabama", ak: "alaska", az: "arizona", ar: "arkansas", ca: "california",
  co: "colorado", ct: "connecticut", de: "delaware", dc: "district-of-columbia",
  fl: "florida", ga: "georgia", hi: "hawaii", id: "idaho", il: "illinois",
  in: "indiana", ia: "iowa", ks: "kansas", ky: "kentucky", la: "louisiana",
  me: "maine", md: "maryland", ma: "massachusetts", mi: "michigan",
  mn: "minnesota", ms: "mississippi", mo: "missouri", mt: "montana",
  ne: "nebraska", nv: "nevada", nh: "new-hampshire", nj: "new-jersey",
  nm: "new-mexico", ny: "new-york", nc: "north-carolina", nd: "north-dakota",
  oh: "ohio", ok: "oklahoma", or: "oregon", pa: "pennsylvania",
  ri: "rhode-island", sc: "south-carolina", sd: "south-dakota", tn: "tennessee",
  tx: "texas", ut: "utah", vt: "vermont", va: "virginia", wa: "washington",
  wv: "west-virginia", wi: "wisconsin", wy: "wyoming", pr: "puerto-rico",
};

// Google's hard cap is 50,000 URLs per sitemap file. Warn before we hit it so
// a fast-growing state gets bucketed before search engines reject the file.
const URLS_PER_FILE_WARN = 45000;

const listJson = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((n) => n.endsWith(".json"))
        .map((n) => n.replace(/\.json$/, ""))
        .sort()
    : [];

// ---- 1. Slug manifest (state/city/institution) ----

// Clean up legacy public/data symlinks left over from a previous architecture.
const PUBLIC_DATA = join(FRONTEND, "public", "data");
if (existsSync(PUBLIC_DATA)) {
  rmSync(PUBLIC_DATA, { recursive: true, force: true });
}

const states = listJson(join(PUBLISHED, "state"));
const cities = {};
const institutions = {};
for (const s of states) {
  cities[s] = listJson(join(PUBLISHED, "city", s));
  institutions[s] = listJson(join(PUBLISHED, "institution", s));
}

writeFileSync(
  join(PUBLISHED, "_manifest.json"),
  JSON.stringify({ states, cities, institutions }),
);

const cityCount = Object.values(cities).reduce((n, x) => n + x.length, 0);
const instCount = Object.values(institutions).reduce((n, x) => n + x.length, 0);
console.log(
  `prebuild: ${states.length} states, ${cityCount} cities, ${instCount} institutions`,
);

// ---- 2. Program XML sitemaps + sitemap index ----

const xmlEscape = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SITEMAP_SHARDS = join(PUBLISHED, "sitemap");
const PUBLIC_SITEMAPS = join(FRONTEND, "public", "sitemaps");

// Rebuild from scratch so a removed state can't leave a stale program-*.xml.
rmSync(PUBLIC_SITEMAPS, { recursive: true, force: true });
mkdirSync(PUBLIC_SITEMAPS, { recursive: true });

const today = new Date().toISOString().slice(0, 10);
// Index always references the Next-generated core sitemap (home, rankings,
// states, cities, institutions). Program shards are appended below.
const indexEntries = [`${SITE_URL}/sitemap.xml`];
let programUrlTotal = 0;

const shardFiles = existsSync(SITEMAP_SHARDS)
  ? readdirSync(SITEMAP_SHARDS).filter((n) => n.endsWith(".json")).sort()
  : [];

if (shardFiles.length === 0) {
  console.warn(
    "prebuild: WARNING — no program sitemap shards in data/published/sitemap/. " +
      "Program URLs will be ABSENT from the sitemap. Run the pipeline " +
      "(publish_state writes these shards) to populate them.",
  );
}

for (const file of shardFiles) {
  const shard = JSON.parse(readFileSync(join(SITEMAP_SHARDS, file), "utf-8"));
  const abbr = shard.state;
  const stateSlug = ABBR_TO_SLUG[abbr] ?? abbr;

  const urls = [];
  for (const [instSlug, progSlugs] of Object.entries(shard.institutions)) {
    for (const progSlug of progSlugs) {
      urls.push(
        `${SITE_URL}/state/${stateSlug}/institution/${instSlug}/program/${progSlug}/`,
      );
    }
  }
  if (urls.length === 0) continue;
  if (urls.length > URLS_PER_FILE_WARN) {
    console.warn(
      `prebuild: WARNING — ${abbr} has ${urls.length} program URLs, nearing ` +
        "the 50,000-per-file limit. Consider bucketing this state.",
    );
  }

  const body = urls
    .map((u) => `  <url><loc>${xmlEscape(u)}</loc></url>`)
    .join("\n");
  const doc =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${body}\n</urlset>\n`;
  writeFileSync(join(PUBLIC_SITEMAPS, `programs-${stateSlug}.xml`), doc);

  indexEntries.push(`${SITE_URL}/sitemaps/programs-${stateSlug}.xml`);
  programUrlTotal += urls.length;
}

const indexBody = indexEntries
  .map(
    (loc) =>
      `  <sitemap><loc>${xmlEscape(loc)}</loc><lastmod>${today}</lastmod></sitemap>`,
  )
  .join("\n");
writeFileSync(
  join(FRONTEND, "public", "sitemap-index.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${indexBody}\n</sitemapindex>\n`,
);

console.log(
  `prebuild: ${shardFiles.length} program sitemaps, ${programUrlTotal} program URLs; ` +
    `sitemap-index.xml lists ${indexEntries.length} sitemaps`,
);

// ---- 3. Shrink the function bundle on Vercel/CI ----

// Delete the big trees from the build workspace AFTER reading them for the
// manifest. Next.js's file tracer keeps finding them and bundling them into
// every function (~376 MB → busts the 300 MB cap), even with all the
// public/ symlinks gone. Git on GitHub still has them so the data CDN keeps
// serving. Guarded so local builds don't nuke your data. (The program sitemap
// shards in data/published/sitemap/ are tiny and already consumed above, so
// they're left in place.)
if (process.env.VERCEL || process.env.CI) {
  for (const sub of ["program", "institution", "city"]) {
    const target = join(PUBLISHED, sub);
    if (existsSync(target)) {
      rmSync(target, { recursive: true, force: true });
    }
  }
  console.log(
    "prebuild: removed program/institution/city from build workspace (served via CDN)",
  );
}

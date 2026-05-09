// Prebuild: emit a small manifest of state/city/institution slugs so the
// sitemap function can iterate without walking the on-disk data tree (which
// isn't bundled into Vercel functions — see src/lib/data.ts for the data
// CDN strategy).
import {
  existsSync,
  readdirSync,
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

// Clean up legacy public/data symlinks left over from a previous architecture.
const PUBLIC_DATA = join(FRONTEND, "public", "data");
if (existsSync(PUBLIC_DATA)) {
  rmSync(PUBLIC_DATA, { recursive: true, force: true });
}

const listJson = (dir) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((n) => n.endsWith(".json"))
        .map((n) => n.replace(/\.json$/, ""))
        .sort()
    : [];

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

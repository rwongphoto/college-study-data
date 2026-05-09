// Local dev only: symlink the data tree into public/ so the Next dev server
// can serve it, and emit the manifest. Vercel's prebuild does NOT do the
// symlink — its standalone packaging would copy them into every function
// bundle and bust the 300 MB cap (jsDelivr handles prod fetches instead).
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FRONTEND = resolve(__dirname, "..");
const PUBLISHED = resolve(FRONTEND, "..", "data", "published");
const PUBLIC_DATA = join(FRONTEND, "public", "data");

if (!existsSync(PUBLISHED)) {
  console.error(`predev: ${PUBLISHED} does not exist`);
  process.exit(1);
}

mkdirSync(PUBLIC_DATA, { recursive: true });

for (const sub of ["program", "institution", "city"]) {
  const linkPath = join(PUBLIC_DATA, sub);
  const target = resolve(PUBLISHED, sub);
  if (lstatSyncSafe(linkPath)) {
    rmSync(linkPath, { recursive: true, force: true });
  }
  symlinkSync(target, linkPath, "dir");
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
  `predev: ${states.length} states, ${cityCount} cities, ${instCount} institutions; symlinks in public/data/`,
);

function lstatSyncSafe(p) {
  try {
    return lstatSync(p);
  } catch {
    return null;
  }
}

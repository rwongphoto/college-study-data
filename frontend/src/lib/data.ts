// Server-only loaders.
//
// Two strategies:
//   - Small artifacts (home/rankings/state/methodology/roi_constants/manifest)
//     are read from disk via outputFileTracingIncludes — tiny enough to
//     bundle into every serverless function.
//   - Large trees (program/, institution/, city/) are served by jsDelivr
//     directly from the public GitHub repo and fetched at request time.
//     Keeps function bundles tiny: data is never near the Vercel deployment.
//     Configurable via NEXT_PUBLIC_DATA_CDN_BASE for staging/branch overrides.
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import type {
  CityAgg,
  HomePayload,
  InstitutionPayload,
  ProgramPayload,
  RankingsPayload,
  RoiConstants,
  StateAgg,
} from "./types";

const PUBLISHED_DIR = resolve(process.cwd(), "..", "data", "published");

const DATA_CDN_BASE =
  process.env.NEXT_PUBLIC_DATA_CDN_BASE ??
  "https://cdn.jsdelivr.net/gh/rwongphoto/college-study-data@main/data/published";

function readJSON<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

export class DataNotFoundError extends Error {
  constructor(url: string) {
    super(`fetchJSON ${url} → 404`);
    this.name = "DataNotFoundError";
  }
}

async function fetchJSON<T>(relPath: string): Promise<T> {
  const url = `${DATA_CDN_BASE}${relPath}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (res.status === 404) {
    // Genuine "this JSON does not exist" — caller should notFound().
    throw new DataNotFoundError(url);
  }
  if (!res.ok) {
    // 5xx and similar are transient — jsDelivr origin failures, edge
    // hiccups. Throw a normal Error so Next.js returns 500 and does
    // NOT cache the page as a 404; the next request will retry.
    throw new Error(`fetchJSON ${url} → ${res.status}`);
  }
  return (await res.json()) as T;
}

// ---- Small files: bundled into the function (fs reads) ----

export function loadHome(): HomePayload {
  return readJSON<HomePayload>(join(PUBLISHED_DIR, "home.json"));
}

export function loadRankings(): RankingsPayload {
  return readJSON<RankingsPayload>(join(PUBLISHED_DIR, "rankings.json"));
}

export function loadRoiConstants(): RoiConstants {
  return readJSON<RoiConstants>(join(PUBLISHED_DIR, "roi_constants.json"));
}

export function loadMethodology(): {
  title: string;
  source: { name: string; vintage: string; retrieved: string };
  sections: Array<{ id: string; heading: string; body: string }>;
} {
  return readJSON(join(PUBLISHED_DIR, "methodology.json"));
}

export function loadState(state: string): StateAgg {
  return readJSON<StateAgg>(
    join(PUBLISHED_DIR, "state", `${state.toLowerCase()}.json`),
  );
}

// ---- Manifest: directory listings, used by sitemap ----

type Manifest = {
  states: string[];
  cities: Record<string, string[]>;
  institutions: Record<string, string[]>;
};

let manifestCache: Manifest | null = null;
function loadManifest(): Manifest {
  if (manifestCache) return manifestCache;
  manifestCache = readJSON<Manifest>(join(PUBLISHED_DIR, "_manifest.json"));
  return manifestCache;
}

export function listStates(): string[] {
  return loadManifest().states;
}

export function listCities(state: string): string[] {
  return loadManifest().cities[state.toLowerCase()] ?? [];
}

export function listInstitutions(state: string): string[] {
  return loadManifest().institutions[state.toLowerCase()] ?? [];
}

// ---- Big files: served as CDN assets, fetched at request time ----

export function loadCity(state: string, slug: string): Promise<CityAgg> {
  return fetchJSON<CityAgg>(`/city/${state.toLowerCase()}/${slug}.json`);
}

export function loadInstitution(
  state: string,
  slug: string,
): Promise<InstitutionPayload> {
  return fetchJSON<InstitutionPayload>(
    `/institution/${state.toLowerCase()}/${slug}.json`,
  );
}

export function loadProgram(
  state: string,
  institutionSlug: string,
  programSlug: string,
): Promise<ProgramPayload> {
  return fetchJSON<ProgramPayload>(
    `/program/${state.toLowerCase()}/${institutionSlug}/${programSlug}.json`,
  );
}

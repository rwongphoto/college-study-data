// Server-only loaders.
//
// Two strategies:
//   - Small artifacts (home/rankings/state/methodology/roi_constants/manifest)
//     are read from disk via outputFileTracingIncludes — they're tiny enough
//     to bundle into every serverless function.
//   - Large trees (program/, institution/, city/) are served as static CDN
//     assets from frontend/public/data/ (symlinked in by scripts/prebuild.mjs)
//     and fetched at request time. Keeps function bundles under Vercel's
//     300 MB cap.
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

function readJSON<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T;
}

function originForFetch(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

async function fetchJSON<T>(path: string): Promise<T> {
  const url = `${originForFetch()}${path}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) {
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
  return fetchJSON<CityAgg>(`/data/city/${state.toLowerCase()}/${slug}.json`);
}

export function loadInstitution(
  state: string,
  slug: string,
): Promise<InstitutionPayload> {
  return fetchJSON<InstitutionPayload>(
    `/data/institution/${state.toLowerCase()}/${slug}.json`,
  );
}

export function loadProgram(
  state: string,
  institutionSlug: string,
  programSlug: string,
): Promise<ProgramPayload> {
  return fetchJSON<ProgramPayload>(
    `/data/program/${state.toLowerCase()}/${institutionSlug}/${programSlug}.json`,
  );
}

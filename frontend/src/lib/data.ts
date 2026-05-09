// Server-only loaders. Each page imports just what it needs.
import { readFileSync, existsSync, readdirSync } from "node:fs";
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
  const raw = readFileSync(path, "utf-8");
  return JSON.parse(raw) as T;
}

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

export function listStates(): string[] {
  const dir = join(PUBLISHED_DIR, "state");
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => n.endsWith(".json"))
    .map((n) => n.replace(/\.json$/, ""));
}

export function loadCity(state: string, slug: string): CityAgg {
  return readJSON<CityAgg>(
    join(PUBLISHED_DIR, "city", state.toLowerCase(), `${slug}.json`),
  );
}

export function listCities(state: string): string[] {
  const dir = join(PUBLISHED_DIR, "city", state.toLowerCase());
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => n.endsWith(".json"))
    .map((n) => n.replace(/\.json$/, ""));
}

export function loadInstitution(state: string, slug: string): InstitutionPayload {
  return readJSON<InstitutionPayload>(
    join(PUBLISHED_DIR, "institution", state.toLowerCase(), `${slug}.json`),
  );
}

export function listInstitutions(state: string): string[] {
  const dir = join(PUBLISHED_DIR, "institution", state.toLowerCase());
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => n.endsWith(".json"))
    .map((n) => n.replace(/\.json$/, ""));
}

export function loadProgram(
  state: string,
  institutionSlug: string,
  programSlug: string,
): ProgramPayload {
  return readJSON<ProgramPayload>(
    join(
      PUBLISHED_DIR,
      "program",
      state.toLowerCase(),
      institutionSlug,
      `${programSlug}.json`,
    ),
  );
}

export function listPrograms(
  state: string,
  institutionSlug: string,
): string[] {
  const dir = join(
    PUBLISHED_DIR,
    "program",
    state.toLowerCase(),
    institutionSlug,
  );
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => n.endsWith(".json"))
    .map((n) => n.replace(/\.json$/, ""));
}

export function listAllPrograms(state: string): Array<{
  institution: string;
  program: string;
}> {
  const root = join(PUBLISHED_DIR, "program", state.toLowerCase());
  if (!existsSync(root)) return [];
  const out: Array<{ institution: string; program: string }> = [];
  for (const inst of readdirSync(root)) {
    const dir = join(root, inst);
    for (const prog of readdirSync(dir)) {
      if (prog.endsWith(".json")) {
        out.push({ institution: inst, program: prog.replace(/\.json$/, "") });
      }
    }
  }
  return out;
}

export type ProgramTuple = {
  state: string;
  institution: string;
  program: string;
};

// Programs with both 4-yr AND 5-yr post-completion earnings reported — two
// post-completion windows of federal salary data is the minimum density for
// a defensible standalone page (every headline tile renders a real number,
// not an em-dash). Reads institution payloads (~5k) rather than program
// payloads (~200k). Used by program-route generateStaticParams as the SSG
// allowlist; programs without both windows return 404.
export function listProgramsWithEarnings(): ProgramTuple[] {
  const out: ProgramTuple[] = [];
  for (const state of listStates()) {
    for (const slug of listInstitutions(state)) {
      const payload = loadInstitution(state, slug);
      for (const row of payload.programs) {
        if (row.earnings_median_5yr == null) continue;
        if (row.earnings_median_4yr == null) continue;
        out.push({ state, institution: slug, program: row.slug });
      }
    }
  }
  return out;
}

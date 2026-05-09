// Mirrors pipeline/src/models.py. Keep in sync.

export type Source = {
  name: string;
  vintage: string;
  retrieved: string;
  history_vintages: number[]; // academic years included in history arrays
};

export type HistoryPoint = {
  year: number;
  value: number | null;
};

export type LongArcShift = {
  metric: string;
  from_year: number;
  to_year: number;
  from_value: number;
  to_value: number;
  pct_change: number; // signed; negative = decreased
  direction: "rose" | "fell" | "flat" | string;
};

export type EarningsProgressionPoint = {
  year: number; // years post-entry: 4, 5, 6, 8, or 10
  value: number | null;
};

// ---- Anomaly engine flags ------------------------------------------------

export type FlagType =
  | "long_arc_shift"
  | "earnings_trend"
  | "peer_outlier"
  | "completion_drop"
  | "enrollment_cliff"
  | "debt_earnings_warning";

export type FlagSeverity =
  | "improvement"
  | "regression"
  | "surge"
  | "drop"
  | "warning"
  | "neutral";

export interface Flag {
  type: FlagType;
  severity: FlagSeverity;
  label: string;
  summary: string;
  magnitude_pct: number | null;
  magnitude_abs: number | null;
  baseline_year: number | null;
  recent_year: number;
  units: string | null;
  history: HistoryPoint[];
  metric: string | null;
}

export type InstitutionCard = {
  unitid: string;
  slug: string;
  name: string;
  city: string;
  city_slug: string;
  control: "public" | "private_nonprofit" | "private_forprofit" | string;
  pred_degree: string;
  earnings_median_5yr: number | null;
  earnings_median_10yr: number | null;
  earnings_progression: EarningsProgressionPoint[];
  completion_rate_150: number | null;
  completion_rate_history: HistoryPoint[];
  enrollment_undergrad: number | null;
  enrollment_history: HistoryPoint[];
  median_debt: number | null;
  default_rate: number | null;
  tuition_in_state: number | null;
  tuition_out_of_state: number | null;
  long_arc: LongArcShift[];
};

export type InstitutionHistory = {
  completion_rate_150: HistoryPoint[];
  completion_rate_100: HistoryPoint[];
  retention_rate: HistoryPoint[];
  admission_rate: HistoryPoint[];
  enrollment_undergrad: HistoryPoint[];
  tuition_in_state: HistoryPoint[];
  tuition_out_of_state: HistoryPoint[];
  cost_attendance: HistoryPoint[];
  avg_net_price_pub: HistoryPoint[];
  avg_net_price_priv: HistoryPoint[];
  median_debt: HistoryPoint[];
  default_rate: HistoryPoint[];
  pell_share: HistoryPoint[];
  // Treasury earnings histories — API-only, sparse
  earnings_median_6yr: HistoryPoint[];
  earnings_median_8yr: HistoryPoint[];
  earnings_median_10yr: HistoryPoint[];
};

export type Institution = {
  unitid: string;
  opeid6: string | null;
  name: string;
  slug: string;
  state: string;
  city: string;
  city_slug: string;
  zip5: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  control: string;
  pred_degree: string;
  highest_degree: string;
  main_campus: boolean;
  locale: string | null;
  carnegie_basic: number | null;
  sector_code: number | null;
  hbcu: boolean;
  tribal: boolean;
  earnings_median_4yr: number | null;
  earnings_median_5yr: number | null;
  earnings_median_6yr: number | null;
  earnings_median_8yr: number | null;
  earnings_median_10yr: number | null;
  completion_rate_150: number | null;
  completion_rate_100: number | null;
  retention_rate: number | null;
  admission_rate: number | null;
  enrollment_undergrad: number | null;
  enrollment_total: number | null;
  cost_attendance: number | null;
  tuition_in_state: number | null;
  tuition_out_of_state: number | null;
  avg_net_price_pub: number | null;
  avg_net_price_priv: number | null;
  cost_by_income: CostByIncome | null;
  median_debt: number | null;
  default_rate: number | null;
  pell_share: number | null;
  history: InstitutionHistory;
  long_arc: LongArcShift[];
  flags?: Flag[];
};

export type ProgramRow = {
  slug: string;
  cip_code: string;
  cip_desc: string;
  credential_level: number;
  credential_desc: string;
  earnings_median_5yr: number | null;
  earnings_median_4yr: number | null;
  earnings_history_5yr: HistoryPoint[];
  earnings_history_4yr: HistoryPoint[];
  debt_median: number | null;
  debt_history: HistoryPoint[];
  completers: number | null;
  completers_single_year: number | null;
  completers_history: HistoryPoint[];
  long_arc: LongArcShift[];
  flags?: Flag[];
};

export type CostByIncome = {
  "0_30k": number | null;
  "30_48k": number | null;
  "48_75k": number | null;
  "75_110k": number | null;
  "110k_plus": number | null;
  sticker: number | null;
  sector: "pub" | "priv" | string;
};

// ---- ROI calculator ------------------------------------------------------
// Per-program block written by pipeline/src/publish/roi.py.

export type IncomeBracketId =
  | "0_30k"
  | "30_48k"
  | "48_75k"
  | "75_110k"
  | "110k_plus";

export interface RoiInputs {
  years_to_complete: number;
  cost_per_year_default: number | null;
  cost_total_default: number | null;
  cost_source: string | null;
  income_bracket_default: IncomeBracketId;
  earnings_at_completion: number | null;
  earnings_anchor_year: number;
  debt_median: number | null;
  cip_family: string;
  hs_baseline_state?: number;
}

export interface RoiAssumptions {
  discount_rate: number;
  horizon_years: number;
  selection_adjusted: boolean;
}

export interface RoiResult {
  npv: number;
  breakeven_year: number | null;
}

export interface ProgramRoi {
  suppressed: boolean;
  n_obs: number;
  inputs: RoiInputs;
  default_assumptions: RoiAssumptions;
  default_result: RoiResult | null;
}

export interface InstitutionRoiProgramEntry {
  slug: string;
  label: string;
  cip_family: string;
  completers: number | null;
  has_earnings: boolean;
  earnings_at_completion: number | null;
  earnings_anchor_year: number;
  debt_median: number | null;
  years_to_complete: number;
  default_result: RoiResult | null;
}

export interface InstitutionRoi {
  default_program_slug: string | null;
  programs_available: InstitutionRoiProgramEntry[];
}

// Constants file — data/published/roi_constants.json
export interface MincerCurve {
  intercept: number;
  exp_coef: number;
  exp_sq_coef: number;
}

export interface RoiConstants {
  hs_grad_baseline_by_state: Record<string, number>;
  hs_grad_baseline_global: number;
  mincer_curves: {
    global_college: MincerCurve;
    global_hs_only: MincerCurve;
    by_cip_family: Record<string, MincerCurve>;
  };
  dk_shrinkage_by_cip_family: Record<string, number>;
  income_brackets: Array<{
    id: IncomeBracketId;
    label: string;
    scorecard_field: string;
  }>;
  default_income_bracket: IncomeBracketId;
  credlevel_to_years: Record<string, number>;
  default_years_to_complete: number;
  default_discount_rate: number;
  default_horizon_years: number;
  default_selection_adjusted: boolean;
  provenance: {
    hs_baseline: string;
    mincer: string;
    dk_shrinkage: string;
    fit_date: string;
    next_refresh: string;
  };
}

export type SimilarInstitution = {
  slug: string;
  name: string;
  city: string;
  control: string;
  pred_degree: string;
  earnings_median_10yr: number | null;
  completion_rate_150: number | null;
  enrollment_undergrad: number | null;
};

export type InstitutionPayload = {
  institution: Institution;
  programs_by_family: Record<string, ProgramRow[]>;
  programs: ProgramRow[];
  program_count: number;
  similar: SimilarInstitution[];
  roi?: InstitutionRoi;
  source: Source;
};

export type ProgramHistory = {
  earnings_median_4yr: HistoryPoint[];
  earnings_median_5yr: HistoryPoint[];
  debt_median: HistoryPoint[];
  completers: HistoryPoint[];
};

export type ProgramPayload = {
  institution_unitid: string;
  institution_name: string;
  institution_slug: string;
  state: string;
  cip_code: string;
  cip_desc: string;
  credential_level: number;
  credential_desc: string;
  slug: string;
  earnings_median_4yr: number | null;
  earnings_median_5yr: number | null;
  earnings_count_4yr: number | null;
  earnings_count_5yr: number | null;
  debt_median: number | null;
  completers: number | null;
  completers_single_year: number | null;
  pooled_earnings: boolean;
  history: ProgramHistory;
  long_arc: LongArcShift[];
  flags?: Flag[];
  institution: {
    unitid: string;
    slug: string;
    name: string;
    city: string;
    city_slug: string;
    control: string;
  };
  peers_in_state: Array<{
    institution_slug: string;
    institution_name: string;
    earnings_median_5yr: number | null;
    earnings_median_4yr: number | null;
    debt_median: number | null;
    completers: number | null;
    completers_single_year: number | null;
    pooled_earnings: boolean;
  }>;
  roi?: ProgramRoi;
  source: Source;
};

export type CityAgg = {
  state: string;
  name: string;
  slug: string;
  institution_count: number;
  institutions: InstitutionCard[];
  earnings_median_city: number | null;
  completion_rate_city: number | null;
  completion_history_city: HistoryPoint[];
  enrollment_history_city: HistoryPoint[];
  source: Source;
};

export type StateCityEntry = {
  slug: string;
  name: string;
  institution_count: number;
  earnings_median_city: number | null;
  completion_rate_city: number | null;
};

export type StateAgg = {
  state: string;
  name: string;
  institution_count: number;
  institutions_by_control: Record<string, number>;
  institutions_by_pred_degree: Record<string, number>;
  earnings_median_state: number | null;
  completion_rate_state: number | null;
  completion_history_state: HistoryPoint[];
  enrollment_history_state: HistoryPoint[];
  tuition_history_state: HistoryPoint[];
  top_by_earnings: InstitutionCard[];
  top_by_completion: InstitutionCard[];
  cities: StateCityEntry[];
  institutions: InstitutionCard[];
  long_arc: LongArcShift[];
  flags?: Flag[];
  source: Source;
};

export type HomePayload = {
  states: Array<{
    slug: string;
    name: string;
    institution_count: number;
    program_count: number;
  }>;
  institution_count: number;
  program_count: number;
  coverage_note: string;
  source: Source;
};

// ---- Rankings (cross-state, per-outcome top-N tables) -------------------
// Powers /rankings/{states,cities,institutions,programs}.
// Written by pipeline/src/publish/rankings.py — one file at
// data/published/rankings.json. Each surface lists multiple tables; each
// table holds an ordered list of rows for one outcome lane + direction.

export type RankingDirection = "most" | "least";

export interface RankingRow {
  rank: number;
  state: string;
  state_label: string;
  slug: string;
  name: string;
  value: number;
  value_label: string;
  // Place + state surfaces
  institution_count?: number;
  // Institution surface
  city?: string | null;
  control?: string | null;
  pred_degree?: string | null;
  enrollment_undergrad?: number | null;
  // Program surface
  credential_desc?: string | null;
  institution_slug?: string;
  institution_name?: string;
  completers?: number | null;
  pooled_earnings?: boolean;
  // True when a static program page exists (both 4yr + 5yr earnings present).
  program_page?: boolean;
}

export interface RankingTable {
  lane: string;            // e.g. "earnings_10yr" / "completion_150"
  label: string;           // table heading
  units: string;           // value units, e.g. "USD"
  direction: RankingDirection;
  positive_only?: boolean;
  rows: RankingRow[];
}

export interface RankingsSurface {
  tables: RankingTable[];
}

export interface CredentialBucket {
  code: number;        // CREDLEV (1, 2, 3, 5, 6, 7, 8)
  label: string;       // human-readable, e.g. "Bachelor's Degree"
  tables: RankingTable[];
}

export interface FieldBucket {
  code: string;        // CIP-2, e.g. "14"
  label: string;       // e.g. "Engineering"
  tables: RankingTable[];
}

export interface RankingsPayload {
  reporting_year: number;
  states_covered: string[];
  counts: {
    states: number;
    cities: number;
    institutions: number;
    programs: number;
  };
  states: RankingsSurface;
  cities: RankingsSurface;
  institutions: RankingsSurface;
  programs: RankingsSurface;
  by_credential?: { buckets: CredentialBucket[] };
  by_field?: { buckets: FieldBucket[] };
  _published_at?: string;
}

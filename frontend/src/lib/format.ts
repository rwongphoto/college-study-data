// Deterministic formatters. No locale variance, no rounding tricks.

import type { HistoryPoint } from "./types";

const USD = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const NUM = new Intl.NumberFormat("en-US");

export function fmtCurrency(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return USD.format(v);
}

export function fmtNumber(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return NUM.format(v);
}

export function fmtPercent(v: number | null | undefined, digits = 1): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  return `${(v * 100).toFixed(digits)}%`;
}

export function fmtPctSigned(v: number | null | undefined, digits = 0): string {
  if (v === null || v === undefined || Number.isNaN(v)) return "—";
  const sign = v > 0 ? "+" : v < 0 ? "" : "±";
  return `${sign}${(v * 100).toFixed(digits)}%`;
}

export function fmtControl(c: string): string {
  switch (c) {
    case "public":
      return "Public";
    case "private_nonprofit":
      return "Private nonprofit";
    case "private_forprofit":
      return "Private for-profit";
    default:
      return c;
  }
}

export function fmtPredDegree(d: string): string {
  switch (d) {
    case "non_degree":
      return "Non-degree";
    case "certificate":
      return "Predominantly certificates";
    case "associates":
      return "Predominantly associate's";
    case "bachelors":
      return "Predominantly bachelor's";
    case "graduate":
      return "Predominantly graduate";
    default:
      return d;
  }
}

// Friendly label for a metric name in a long_arc shift.
export function fmtMetricLabel(metric: string): string {
  switch (metric) {
    case "enrollment_undergrad":
      return "Undergrad enrollment";
    case "tuition_in_state":
      return "In-state tuition";
    case "tuition_out_of_state":
      return "Out-of-state tuition";
    case "completion_rate_150":
      return "Completion · 150%";
    case "completion_rate_100":
      return "Completion · 100%";
    case "median_debt":
      return "Median debt";
    case "retention_rate":
      return "Retention";
    case "admission_rate":
      return "Admission rate";
    case "default_rate":
      return "Cohort default rate";
    case "pell_share":
      return "Pell share";
    case "completers":
      return "Annual completers";
    case "earnings_median_5yr":
      return "Median earnings · 5y";
    case "earnings_median_4yr":
      return "Median earnings · 4y";
    case "cost_attendance":
      return "Cost of attendance";
    case "avg_net_price_pub":
      return "Avg net price";
    case "avg_net_price_priv":
      return "Avg net price";
    default:
      return metric;
  }
}

// Pull the numeric values out of a HistoryPoint[] in chronological order,
// skipping nulls. Returns [] if fewer than two points have data, since a
// sparkline of one point isn't readable.
export function historyValues(points: HistoryPoint[] | undefined): number[] {
  if (!points || points.length < 2) return [];
  const out: number[] = [];
  for (const p of points) {
    if (p.value != null && !Number.isNaN(p.value)) out.push(p.value);
  }
  return out.length >= 2 ? out : [];
}

// Same null-skipping rule as historyValues, returning the years aligned
// with the value indices. Use when the caller needs to label endpoints.
export function historyYears(points: HistoryPoint[] | undefined): number[] {
  if (!points || points.length < 2) return [];
  const out: number[] = [];
  for (const p of points) {
    if (p.value != null && !Number.isNaN(p.value)) out.push(p.year);
  }
  return out.length >= 2 ? out : [];
}

// First→last percent change from a HistoryPoint series, ignoring nulls.
// Returns null when fewer than two non-null points exist or the first
// value is zero (would divide-by-zero).
export function historyDelta(
  points: HistoryPoint[] | undefined,
): { pct: number; fromYear: number; toYear: number } | null {
  if (!points || points.length < 2) return null;
  const valid = points.filter(
    (p): p is { year: number; value: number } => p.value != null,
  );
  if (valid.length < 2) return null;
  const first = valid[0];
  const last = valid[valid.length - 1];
  if (first.value === 0) return null;
  return {
    pct: (last.value - first.value) / Math.abs(first.value),
    fromYear: first.year,
    toYear: last.year,
  };
}

// Direction-aware tone for a delta. `roseIsGood` flips for metrics where
// rising is bad (debt, tuition, default-rate). `roseIsGood = "neutral"`
// renders flat (admission rate, etc.).
export function deltaTone(
  pct: number,
  roseIsGood: boolean | "neutral",
): "up" | "down" | "flat" {
  if (Math.abs(pct) < 0.005) return "flat";
  if (roseIsGood === "neutral") return "flat";
  if (pct > 0) return roseIsGood ? "up" : "down";
  return roseIsGood ? "down" : "up";
}

// Standard 10-year amortization at 6% APR — matches federal Direct
// student-loan terms — applied to median debt and divided by median
// earnings to produce a debt-to-earnings ratio used for the Gainful
// Employment threshold (8%).
export function debtToEarningsRatio(
  medianDebt: number | null | undefined,
  medianEarnings: number | null | undefined,
  rate = 0.06,
  years = 10,
): number | null {
  if (
    medianDebt == null ||
    medianEarnings == null ||
    medianEarnings <= 0 ||
    medianDebt <= 0
  ) {
    return null;
  }
  const monthlyRate = rate / 12;
  const months = years * 12;
  const monthlyPayment =
    (medianDebt * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  const annualPayment = monthlyPayment * 12;
  return annualPayment / medianEarnings;
}

export function cipFamilyLabel(cip2: string): string {
  // 2-digit CIP family labels — abridged. Falls back to "CIP {cip2}".
  const map: Record<string, string> = {
    "01": "Agriculture",
    "03": "Natural resources & conservation",
    "04": "Architecture",
    "05": "Area, ethnic & cultural studies",
    "09": "Communication & journalism",
    "10": "Communications technologies",
    "11": "Computer & information sciences",
    "12": "Personal & culinary services",
    "13": "Education",
    "14": "Engineering",
    "15": "Engineering technologies",
    "16": "Foreign languages",
    "19": "Family & consumer sciences",
    "22": "Legal professions",
    "23": "English language & literature",
    "24": "Liberal arts & general studies",
    "25": "Library science",
    "26": "Biological & biomedical sciences",
    "27": "Mathematics & statistics",
    "29": "Military technologies",
    "30": "Multi/interdisciplinary studies",
    "31": "Parks, recreation & fitness",
    "32": "Basic skills",
    "33": "Citizenship activities",
    "34": "Health-related",
    "35": "Interpersonal skills",
    "36": "Leisure & recreational activities",
    "37": "Personal awareness",
    "38": "Philosophy & religious studies",
    "39": "Theology & religious vocations",
    "40": "Physical sciences",
    "41": "Science technologies",
    "42": "Psychology",
    "43": "Homeland security & protective services",
    "44": "Public administration & social services",
    "45": "Social sciences",
    "46": "Construction trades",
    "47": "Mechanic & repair technologies",
    "48": "Precision production",
    "49": "Transportation & materials moving",
    "50": "Visual & performing arts",
    "51": "Health professions",
    "52": "Business, management & marketing",
    "54": "History",
    "60": "Residency programs",
  };
  return map[cip2] ?? `CIP ${cip2}`;
}

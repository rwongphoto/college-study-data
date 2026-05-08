import Sparkline from "./Sparkline";
import type { Flag, FlagSeverity, FlagType } from "@/lib/types";

// Maps + helpers --------------------------------------------------------

const SEVERITY_LABEL: Record<FlagSeverity, string> = {
  warning: "WARNING",
  regression: "TRENDING WORSE",
  surge: "SHARP RISE",
  drop: "SHARP DECLINE",
  improvement: "TRENDING BETTER",
  neutral: "INFORMATIONAL",
};

const TYPE_LABEL: Record<FlagType, string> = {
  long_arc_shift: "LONG-ARC SHIFT",
  earnings_trend: "EARNINGS TREND",
  peer_outlier: "PEER OUTLIER",
  completion_drop: "COMPLETION DROP",
  enrollment_cliff: "ENROLLMENT CLIFF",
  debt_earnings_warning: "DEBT–EARNINGS WARNING",
};

// Map flag severity to the .flag-card visual variant + sparkline color.
function variantFor(s: FlagSeverity): "warn" | "good" | "neutral" {
  switch (s) {
    case "warning":
    case "regression":
    case "surge":
      return "warn";
    case "improvement":
    case "drop":
      return "good";
    default:
      return "neutral";
  }
}

function variantColor(s: FlagSeverity): string {
  switch (variantFor(s)) {
    case "warn":
      return "var(--red)";
    case "good":
      return "var(--green)";
    default:
      return "var(--amber)";
  }
}

function fmtMagnitude(flag: Flag): string {
  // Render the headline number on the card. Order of preference: explicit
  // magnitude_pct (signed %), magnitude_abs in $ for currency-flavoured
  // metrics, otherwise the recent year.
  if (flag.magnitude_pct != null) {
    const sign = flag.magnitude_pct > 0 ? "+" : "";
    if (flag.units === "pp") {
      return `${sign}${flag.magnitude_pct.toFixed(0)}pp`;
    }
    if (flag.type === "debt_earnings_warning") {
      return `${flag.magnitude_pct.toFixed(1)}%`;
    }
    return `${sign}${flag.magnitude_pct.toFixed(0)}%`;
  }
  if (flag.recent_year) return String(flag.recent_year);
  return "";
}

// Severity weights for client-side sort (mirrors pipeline severity_weight).
const SEVERITY_WEIGHT: Record<FlagSeverity, number> = {
  warning: 100,
  regression: 80,
  surge: 70,
  drop: 30,
  improvement: 20,
  neutral: 10,
};

function sortFlags(flags: Flag[]): Flag[] {
  return [...flags].sort((a, b) => {
    const sw = SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity];
    if (sw !== 0) return sw;
    return Math.abs(b.magnitude_pct ?? 0) - Math.abs(a.magnitude_pct ?? 0);
  });
}

// Pick a balanced set when the caller caps the number of cards. Without
// this, "warning" outranks every "improvement" by severity weight and the
// good-news flags never appear at all. We alternate warn / good while both
// buckets have material so the visible set is mixed in tone.
function pickMixed(flags: Flag[], cap: number): Flag[] {
  const ranked = sortFlags(flags);
  const warn: Flag[] = [];
  const good: Flag[] = [];
  const neutral: Flag[] = [];
  for (const f of ranked) {
    const v = variantFor(f.severity);
    if (v === "warn") warn.push(f);
    else if (v === "good") good.push(f);
    else neutral.push(f);
  }
  const out: Flag[] = [];
  let preferWarn = true;
  while (out.length < cap && (warn.length || good.length)) {
    const primary = preferWarn ? warn : good;
    const fallback = preferWarn ? good : warn;
    if (primary.length) out.push(primary.shift()!);
    else if (fallback.length) out.push(fallback.shift()!);
    preferWarn = !preferWarn;
  }
  while (out.length < cap && neutral.length) out.push(neutral.shift()!);
  return out;
}

// Rewrite the σ-phrased peer_outlier summary baked in older JSON to use
// percentages — the canonical prose was changed in pipeline/src/flags/prose.py
// but published payloads may still carry the legacy form until re-run.
function readableSummary(flag: Flag): string {
  if (
    flag.type === "peer_outlier" &&
    flag.magnitude_pct != null &&
    /\dσ\s+(above|below)/.test(flag.summary)
  ) {
    const sign = flag.magnitude_pct < 0 ? "below" : "above";
    const pct = Math.abs(flag.magnitude_pct).toFixed(0);
    return flag.summary.replace(
      /[\d.]+σ\s+(above|below)/,
      `${pct}% ${sign}`,
    );
  }
  return flag.summary;
}

// Card -------------------------------------------------------------------

export function FlagCard({ flag }: { flag: Flag }) {
  const variant = variantFor(flag.severity);
  const sparkColor = variantColor(flag.severity);
  const headline = fmtMagnitude(flag);
  const summary = readableSummary(flag);
  const values = (flag.history ?? [])
    .map((h) => h.value)
    .filter((v): v is number => v != null);
  return (
    <article className={`flag-card ${variant}`}>
      <div className="flag-row">
        <span className="meta-mono">
          {TYPE_LABEL[flag.type]} · {SEVERITY_LABEL[flag.severity]}
        </span>
        {headline && (
          <span
            className="num-mono"
            style={{ color: sparkColor, fontWeight: 600 }}
          >
            {headline}
          </span>
        )}
      </div>
      <h4>{flag.label}</h4>
      <p>{summary}</p>
      {values.length >= 2 && (
        <div className="hflag-spark" style={{ marginTop: 12 }}>
          <Sparkline values={values} color={sparkColor} height={28} />
        </div>
      )}
    </article>
  );
}

// Section ----------------------------------------------------------------

export default function FlagCards({
  flags,
  cap,
}: {
  flags: Flag[];
  cap?: number;
}) {
  // Anomaly engine only wants short, recent shifts. Drop any long_arc_shift
  // whose window exceeds 3 years — stale 25-year flags from older pipeline
  // runs would otherwise dominate the section. The dedicated LongArcCards
  // component owns the multi-decade view.
  const ANOMALY_MAX_WINDOW = 3;
  const filtered = flags.filter((f) => {
    if (f.type !== "long_arc_shift") return true;
    if (f.baseline_year == null) return true;
    return f.recent_year - f.baseline_year <= ANOMALY_MAX_WINDOW;
  });
  const visible = cap ? pickMixed(filtered, cap) : sortFlags(filtered);
  if (visible.length === 0) return null;
  return (
    <div className="flag-grid">
      {visible.map((f, i) => (
        <FlagCard key={`${f.type}-${f.label}-${i}`} flag={f} />
      ))}
    </div>
  );
}

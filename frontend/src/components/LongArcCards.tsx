import type { LongArcShift } from "@/lib/types";
import { fmtMetricLabel, fmtPctSigned } from "@/lib/format";

// Renders a `flag-grid` of long-arc shifts (rose/fell/flat) using the
// design's flag-card pattern. The semantic of each card:
//   - rose tuition / debt / default → warn (red)
//   - rose enrollment / completion / earnings → good (green)
//   - fell completion / enrollment → warn (red)
//   - fell debt / default → good (green)
//   - flat → neutral (amber)
const ROSE_IS_BAD = new Set([
  "tuition_in_state",
  "tuition_out_of_state",
  "median_debt",
  "default_rate",
  "cost_attendance",
  "avg_net_price_pub",
  "avg_net_price_priv",
]);
const ROSE_IS_GOOD = new Set([
  "enrollment_undergrad",
  "completion_rate_150",
  "completion_rate_100",
  "completers",
  "retention_rate",
  "earnings_median_5yr",
  "earnings_median_4yr",
]);

function classify(arc: LongArcShift): "warn" | "good" | "neutral" {
  if (arc.direction === "flat") return "neutral";
  const rose = arc.direction === "rose";
  if (ROSE_IS_BAD.has(arc.metric)) return rose ? "warn" : "good";
  if (ROSE_IS_GOOD.has(arc.metric)) return rose ? "good" : "warn";
  return "neutral";
}

function fmtFromTo(arc: LongArcShift): string {
  // Currency-ish metrics get $; rate metrics get %; counts get number.
  const isCurrency = arc.metric.startsWith("tuition_") ||
    arc.metric === "median_debt" ||
    arc.metric === "cost_attendance" ||
    arc.metric.startsWith("avg_net_price") ||
    arc.metric.startsWith("earnings_");
  const isRate = arc.metric.startsWith("completion_") ||
    arc.metric === "retention_rate" ||
    arc.metric === "admission_rate" ||
    arc.metric === "default_rate" ||
    arc.metric === "pell_share";
  const fmt = (v: number) => {
    if (isCurrency) return `$${v.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    if (isRate) return `${(v * 100).toFixed(1)}%`;
    return v.toLocaleString("en-US");
  };
  return `${fmt(arc.from_value)} → ${fmt(arc.to_value)}`;
}

export default function LongArcCards({
  arcs,
  scope,
}: {
  arcs: LongArcShift[];
  scope: string; // e.g. "Statewide", "Oregon State", "CS at OSU"
}) {
  if (arcs.length === 0) return null;
  return (
    <div className="flag-grid">
      {arcs.map((arc, i) => {
        const tone = classify(arc);
        const label = fmtMetricLabel(arc.metric);
        const headlineSign = fmtPctSigned(arc.pct_change, 0);
        return (
          <div key={i} className={`flag-card ${tone}`}>
            <div className="flag-row">
              <span className="meta-mono">
                {label.toUpperCase()} · {arc.from_year}→{arc.to_year}
              </span>
              <span
                className="num-mono"
                style={{
                  color:
                    tone === "warn"
                      ? "#FF6B6B"
                      : tone === "good"
                        ? "#6FCF97"
                        : "#E6B450",
                }}
              >
                {headlineSign}
              </span>
            </div>
            <h3>
              {scope} · {label.toLowerCase()} {arc.direction}
            </h3>
            <p>{fmtFromTo(arc)}</p>
          </div>
        );
      })}
    </div>
  );
}

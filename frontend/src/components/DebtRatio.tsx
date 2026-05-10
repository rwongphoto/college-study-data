// Debt-to-earnings ratio bar with the 8% gainful-employment threshold.
// Mirrors DebtRatio from college-shared.jsx. Caller supplies the computed
// ratio (use lib/format.debtToEarningsRatio).

export default function DebtRatio({
  ratio,
  threshold = 0.08,
  label,
  sub,
}: {
  ratio: number;
  threshold?: number;
  label: string;
  sub?: string;
}) {
  // Bar maxes out at 20% so we have room above the threshold.
  const max = 0.2;
  const pct = (Math.min(ratio, max) / max) * 100;
  const thrPct = (threshold / max) * 100;
  const over = ratio > threshold;
  return (
    <div className="dr-card">
      <div className="dr-head">
        <h3>{label}</h3>
        <span className={`pill ${over ? "bad" : "good"}`}>
          {(ratio * 100).toFixed(1)}%
        </span>
      </div>
      <div className="dr-bar">
        <i
          style={{
            width: `${pct}%`,
            background: over ? "var(--red-2)" : "var(--green)",
          }}
        />
        <span
          className="thr"
          style={{ left: `${thrPct}%` }}
          title="Gainful employment threshold"
        />
      </div>
      <div className="dr-meta">
        <span className="meta-mono">0%</span>
        <span
          className="meta-mono"
          style={{
            position: "absolute",
            left: `${thrPct}%`,
            transform: "translateX(-50%)",
          }}
        >
          {(threshold * 100).toFixed(0)}% · GE
        </span>
        <span className="meta-mono">{(max * 100).toFixed(0)}%+</span>
      </div>
      {sub && <p className="dr-sub">{sub}</p>}
    </div>
  );
}

import Link from "next/link";

import { fmtPctSigned } from "@/lib/format";

import Sparkline from "./Sparkline";

// Stat tile in the design system's "data-tile" pattern. Optionally a link
// (renders as <a> with hover affordance), optionally with a sparkline strip,
// and optionally with a trend-change chip beside the value.

export type DataTileDelta = {
  pct: number; // signed fraction (0.6 = +60%)
  fromYear: number;
  toYear: number;
  tone: "up" | "down" | "flat";
};

export type DataTileProps = {
  label: string;
  value: string;
  note?: string;
  spark?: number[];
  sparkColor?: string;
  delta?: DataTileDelta;
  href?: string;
};

function formatYearRange(fromYear: number, toYear: number): string {
  // Years like 4/5/6/8/10 (post-entry horizons): show as-is.
  // Calendar years (>=1000): show last two digits with apostrophe.
  if (toYear >= 1000) {
    const f = String(fromYear).slice(-2);
    const t = String(toYear).slice(-2);
    return `'${f}→'${t}`;
  }
  return `${fromYear}→${toYear}y`;
}

export default function DataTile({
  label,
  value,
  note,
  spark,
  sparkColor = "#E6B450",
  delta,
  href,
}: DataTileProps) {
  const inner = (
    <>
      <span className="meta-mono tile-cat">{label.toUpperCase()}</span>
      <div className="tile-val">
        <span className="num">{value}</span>
        {delta && (
          <span className={`delta ${delta.tone}`}>
            {fmtPctSigned(delta.pct, 0)} ·{" "}
            {formatYearRange(delta.fromYear, delta.toYear)}
          </span>
        )}
      </div>
      {spark && spark.length >= 2 && (
        <div className="tile-spark">
          <Sparkline values={spark} color={sparkColor} />
        </div>
      )}
      {note && <span className="tile-note">{note}</span>}
    </>
  );
  return href ? (
    <Link href={href} className="data-tile">
      {inner}
    </Link>
  ) : (
    <div className="data-tile">{inner}</div>
  );
}

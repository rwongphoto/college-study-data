import type { EarningsProgressionPoint } from "@/lib/types";

// Earnings horizon visualization — single-median version of EarningsBand from
// the design. We only have a single median per horizon (4/5/6/8/10 yr) in the
// federal data, not the p25/p75 band the design's EarningsBand assumes — so
// this renders just the median curve with labelled dots and a labelled axis.

export default function EarningsHorizon({
  points,
  height = 280,
}: {
  points: EarningsProgressionPoint[];
  height?: number;
}) {
  const valid = points.filter(
    (p): p is EarningsProgressionPoint & { value: number } => p.value != null,
  );
  if (valid.length < 2) return null;

  const W = 540;
  const H = height;
  const padL = 60;
  const padR = 24;
  const padT = 24;
  const padB = 44;

  const ys = valid.map((p) => p.value);
  const yMin = Math.floor(Math.min(...ys) / 10000) * 10000;
  const yMax = Math.ceil(Math.max(...ys) / 10000) * 10000;
  const yRange = yMax - yMin || 1;

  const sx = (i: number) =>
    padL + (i / (valid.length - 1)) * (W - padL - padR);
  const sy = (v: number) =>
    H - padB - ((v - yMin) / yRange) * (H - padT - padB);

  const yTicks: number[] = [];
  for (let i = 0; i <= 4; i++) yTicks.push(yMin + (yRange * i) / 4);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto", display: "block" }}
      aria-hidden="true"
    >
      <g stroke="#2A3142" strokeWidth="1">
        {yTicks.map((t, i) => (
          <line
            key={i}
            x1={padL}
            x2={W - padR}
            y1={sy(t)}
            y2={sy(t)}
            strokeDasharray="2 3"
          />
        ))}
      </g>
      <line x1={padL} x2={padL} y1={padT} y2={H - padB} stroke="#3A4257" />
      <line
        x1={padL}
        x2={W - padR}
        y1={H - padB}
        y2={H - padB}
        stroke="#3A4257"
      />
      <polyline
        points={valid.map((p, i) => `${sx(i)},${sy(p.value)}`).join(" ")}
        fill="none"
        stroke="#E6B450"
        strokeWidth="2.5"
      />
      {valid.map((p, i) => (
        <g key={i}>
          <circle
            cx={sx(i)}
            cy={sy(p.value)}
            r="4"
            fill="#0E1116"
            stroke="#E6B450"
            strokeWidth="2"
          />
          <text
            x={sx(i)}
            y={sy(p.value) - 14}
            textAnchor="middle"
            fontFamily="Inter, sans-serif"
            fontSize="12"
            fontWeight="600"
            fill="#E8ECF2"
          >
            ${(p.value / 1000).toFixed(0)}k
          </text>
        </g>
      ))}
      <g
        fontFamily="JetBrains Mono, monospace"
        fontSize="11"
        fill="#8A93A6"
      >
        {valid.map((p, i) => (
          <text key={i} x={sx(i)} y={H - padB + 18} textAnchor="middle">
            {p.year}y after entry
          </text>
        ))}
      </g>
      <g
        fontFamily="JetBrains Mono, monospace"
        fontSize="10"
        fill="#8A93A6"
      >
        {yTicks.map((t, i) => (
          <text key={i} x={padL - 8} y={sy(t) + 3} textAnchor="end">
            ${(t / 1000).toFixed(0)}k
          </text>
        ))}
      </g>
    </svg>
  );
}

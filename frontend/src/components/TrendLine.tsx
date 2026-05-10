// Larger trend line for use inside .figure-frame .fig-canvas.
// Mirrors CTrend from college-shared.jsx: a smooth polyline with dashed
// gridlines and an optional highlight dot on the latest point.

export default function TrendLine({
  values,
  color = "var(--amber)",
  height = 96,
  highlightLast = true,
  startYear,
  endYear,
  formatValue,
}: {
  values: number[];
  color?: string;
  height?: number;
  highlightLast?: boolean;
  startYear?: number;
  endYear?: number;
  formatValue?: (v: number) => string;
}) {
  if (values.length < 2) return null;
  const W = 320;
  const H = height;
  const PAD_LEFT = 44;
  const PAD_RIGHT = 8;
  const PAD_TOP = 10;
  const PAD_BOTTOM = startYear != null || endYear != null ? 18 : 8;
  const innerW = W - PAD_LEFT - PAD_RIGHT;
  const innerH = H - PAD_TOP - PAD_BOTTOM;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = PAD_LEFT + (i / (values.length - 1)) * innerW;
    const y = PAD_TOP + innerH - ((v - min) / range) * innerH;
    return [x, y] as const;
  });
  const last = pts[pts.length - 1];
  const fmt = formatValue ?? ((v: number) => String(Math.round(v)));
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block", width: "100%", height: "auto" }}
      role="img"
      aria-label={
        startYear != null && endYear != null
          ? `Trend ${startYear} to ${endYear}, range ${fmt(min)} to ${fmt(max)}`
          : `Trend, range ${fmt(min)} to ${fmt(max)}`
      }
    >
      <g stroke="var(--line)" strokeWidth="1">
        {[0.25, 0.5, 0.75].map((p, i) => (
          <line
            key={i}
            x1={PAD_LEFT}
            x2={W - PAD_RIGHT}
            y1={PAD_TOP + innerH * p}
            y2={PAD_TOP + innerH * p}
            strokeDasharray="2 3"
          />
        ))}
      </g>
      <g fill="var(--fg-3)" fontSize="10" fontFamily="ui-monospace, monospace">
        <text x={PAD_LEFT - 4} y={PAD_TOP + 4} textAnchor="end">
          {fmt(max)}
        </text>
        <text x={PAD_LEFT - 4} y={PAD_TOP + innerH} textAnchor="end">
          {fmt(min)}
        </text>
        {startYear != null && (
          <text x={PAD_LEFT} y={H - 4} textAnchor="start">
            {startYear}
          </text>
        )}
        {endYear != null && (
          <text x={W - PAD_RIGHT} y={H - 4} textAnchor="end">
            {endYear}
          </text>
        )}
      </g>
      <polyline
        points={pts.map((p) => p.join(",")).join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
      />
      {highlightLast && last && (
        <circle
          cx={last[0]}
          cy={last[1]}
          r="4"
          fill={color}
          stroke="var(--bg)"
          strokeWidth="2"
        />
      )}
    </svg>
  );
}

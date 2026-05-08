// Larger trend line for use inside .figure-frame .fig-canvas.
// Mirrors CTrend from college-shared.jsx: a smooth polyline with dashed
// gridlines and an optional highlight dot on the latest point.

export default function TrendLine({
  values,
  color = "#E6B450",
  height = 80,
  highlightLast = true,
}: {
  values: number[];
  color?: string;
  height?: number;
  highlightLast?: boolean;
}) {
  if (values.length < 2) return null;
  const W = 320;
  const H = height;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = 8 + (i / (values.length - 1)) * (W - 16);
    const y = H - 8 - ((v - min) / range) * (H - 16);
    return [x, y] as const;
  });
  const last = pts[pts.length - 1];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ display: "block", width: "100%", height: "auto" }}
      aria-hidden="true"
    >
      <g stroke="#2A3142" strokeWidth="1">
        {[0.25, 0.5, 0.75].map((p, i) => (
          <line
            key={i}
            x1="8"
            x2={W - 8}
            y1={H * p}
            y2={H * p}
            strokeDasharray="2 3"
          />
        ))}
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
          stroke="#0E1116"
          strokeWidth="2"
        />
      )}
    </svg>
  );
}

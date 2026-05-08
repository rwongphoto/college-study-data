/* global React */

// ============================================================
// Reusable sketchy bits used across wireframes
// ============================================================

const HandIcon = ({ kind = "dot", size = 16, color = "currentColor" }) => {
  const s = { width: size, height: size, display: "inline-block", verticalAlign: "middle" };
  switch (kind) {
    case "search":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M16 16 L21 21" />
        </svg>
      );
    case "filter":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
          <path d="M3 5h18 M6 12h12 M10 19h4" />
        </svg>
      );
    case "x":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
          <path d="M5 5l14 14 M19 5L5 19" />
        </svg>
      );
    case "info":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 11v5 M12 8v.01" />
        </svg>
      );
    case "down":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      );
    case "arrow-up":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 19V5 M5 12l7-7 7 7" />
        </svg>
      );
    case "arrow-down":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
          <path d="M12 5v14 M5 12l7 7 7-7" />
        </svg>
      );
    case "spark":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 17 L7 11 L11 14 L15 7 L21 13" />
        </svg>
      );
    case "share":
      return (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
          <path d="M4 12v7h16v-7 M12 3v12 M8 7l4-4 4 4" />
        </svg>
      );
    default:
      return <span style={{ ...s, background: color, borderRadius: "50%" }} />;
  }
};

// Hand-drawn squiggly underline as inline SVG (so wires don't depend on bg image)
const Squig = ({ width = 70, color = "#15181C" }) => (
  <svg width={width} height="6" viewBox={`0 0 ${width} 6`} style={{ display: "block" }}>
    <path
      d={`M0 3 ${Array.from({ length: Math.floor(width / 10) })
        .map((_, i) => `Q ${i * 10 + 5} ${i % 2 ? 6 : 0}, ${i * 10 + 10} 3`)
        .join(" ")}`}
      stroke={color}
      strokeWidth="1.2"
      fill="none"
    />
  </svg>
);

// A sketchy hex grid SVG used for the Mapbox map placeholder
const HexMapSketch = ({ dark = false, mode = "choropleth" }) => {
  const ink = dark ? "#E9E2D2" : "#15181C";
  const muted = dark ? "#5A5F69" : "#8A8E93";
  const street = dark ? "#3a3e44" : "#cdc6b3";
  // colors echo the score triad / heatmap
  const fills = mode === "choropleth"
    ? ["#DCEAE0", "#E7E5C4", "#F4E6C8", "#EFCDB6", "#EBB7A8", "#E59A8E"]
    : ["#DCEAE0", "#F4E6C8", "#EFCDB6", "#EBB7A8", "#E59A8E", "#D87C70"];
  const darkFills = ["#2a4d36", "#5b6029", "#8a6d28", "#a86424", "#b33a3a", "#822e2e"];
  const palette = dark ? darkFills : fills;

  // hex layout — pointy-top hexagons in a 5×4 staggered grid
  const W = 1000, H = 580;
  const hexR = 56;
  const hexW = Math.sqrt(3) * hexR;     // width
  const hexH = 2 * hexR;
  const cols = 8, rows = 5;
  const startX = 80, startY = 60;
  const hexes = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * hexW + (r % 2 ? hexW / 2 : 0);
      const y = startY + r * (hexH * 0.75);
      // pseudo-random fill index based on coords
      const idx = Math.abs((c * 7 + r * 13 + r * c) % palette.length);
      hexes.push({ x, y, idx });
    }
  }
  const hexPath = (cx, cy) => {
    const pts = [];
    for (let i = 0; i < 6; i++) {
      const a = Math.PI / 3 * i + Math.PI / 6;
      pts.push(`${(cx + hexR * Math.cos(a)).toFixed(1)},${(cy + hexR * Math.sin(a)).toFixed(1)}`);
    }
    return `M${pts.join(" L")} Z`;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block" }}>
      {/* faux street grid */}
      <g stroke={street} strokeWidth="1" opacity="0.55" fill="none">
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={`v${i}`} x1={i * 70 - 20} y1="0" x2={i * 70 + 80} y2={H} />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 70 - 10} x2={W} y2={i * 70 + 30} />
        ))}
      </g>
      {/* a couple of curved "highway" strokes */}
      <path d="M -20 220 Q 300 180 600 240 T 1020 280" stroke={dark ? "#4a4e58" : "#a89e83"} strokeWidth="6" fill="none" opacity="0.6" />
      <path d="M 380 -10 Q 420 180 360 360 T 380 600" stroke={dark ? "#4a4e58" : "#a89e83"} strokeWidth="5" fill="none" opacity="0.5" />

      {/* hexagons */}
      <g>
        {hexes.map((h, i) => (
          <path
            key={i}
            d={hexPath(h.x, h.y)}
            fill={palette[h.idx]}
            opacity={dark ? 0.78 : 0.7}
            stroke={dark ? "rgba(255,255,255,0.18)" : "rgba(21,24,28,0.35)"}
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        ))}
      </g>

      {/* a couple of neighborhood labels */}
      <g fill={ink} fontFamily="Architects Daughter, Kalam, cursive" fontSize="13" opacity="0.8">
        <text x="160" y="55">Richmond</text>
        <text x="430" y="55">Pacific Heights</text>
        <text x="730" y="60">North Beach</text>
        <text x="200" y="380">Sunset</text>
        <text x="500" y="350">Mission</text>
        <text x="780" y="380">Bayview</text>
      </g>
    </svg>
  );
};

// Outline-only locator map (used on neighborhood pages)
const LocatorMap = ({ name = "Mission", w = "100%", h = 200 }) => {
  return (
    <svg viewBox="0 0 400 220" style={{ width: w, height: h, display: "block" }}>
      {/* outer city outline (sketchy) */}
      <path
        d="M 30 40 Q 80 20 150 30 Q 220 40 300 30 Q 360 25 380 70 Q 385 130 370 180 Q 320 210 250 200 Q 180 195 100 200 Q 40 205 25 160 Q 18 100 30 40 Z"
        fill="#EEE8DC"
        stroke="#15181C"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* neighborhood polygon highlighted */}
      <path
        d="M 170 100 L 230 95 L 250 130 L 235 165 L 180 168 L 155 135 Z"
        fill="#2B6CFF"
        fillOpacity="0.18"
        stroke="#2B6CFF"
        strokeWidth="2"
      />
      {/* center pin */}
      <circle cx="198" cy="132" r="4" fill="#2B6CFF" />
      {/* adjacent ghosts */}
      <path d="M 230 95 L 290 90 L 295 130 L 250 130 Z" fill="none" stroke="#15181C" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <path d="M 155 135 L 100 145 L 110 180 L 180 168 Z" fill="none" stroke="#15181C" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      <path d="M 170 100 L 110 90 L 100 145 L 155 135 Z" fill="none" stroke="#15181C" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
      {/* label */}
      <text x="198" y="150" fontFamily="Caveat, cursive" fontSize="20" fontWeight="700" textAnchor="middle">{name}</text>
      {/* compass */}
      <g transform="translate(355, 50)" stroke="#15181C" strokeWidth="1.25" fill="none" fontFamily="Architects Daughter">
        <circle r="14" />
        <path d="M0 -10 L 4 0 L 0 10 L -4 0 Z" fill="#15181C" />
        <text x="0" y="-18" textAnchor="middle" fontSize="11" fill="#15181C" stroke="none">N</text>
      </g>
    </svg>
  );
};

// Sketchy line chart placeholder
const TrendChart = ({ height = 80, color = "#15181C", showCI = false, dashed = false }) => (
  <svg viewBox="0 0 240 80" style={{ width: "100%", height, display: "block" }}>
    {/* baseline grid */}
    <g stroke="#D9D1BD" strokeWidth="1">
      <line x1="0" y1="20" x2="240" y2="20" strokeDasharray="2 3" />
      <line x1="0" y1="50" x2="240" y2="50" strokeDasharray="2 3" />
    </g>
    {/* CI band */}
    {showCI && (
      <path d="M 130 50 Q 160 35 190 30 Q 220 26 240 22 L 240 60 Q 220 56 190 58 Q 160 60 130 50 Z"
        fill={color} opacity="0.12" />
    )}
    {/* historical line */}
    <path
      d="M 0 55 Q 20 50 40 48 Q 60 60 80 52 Q 100 38 120 42 Q 140 30 160 35 Q 180 28 200 30 Q 220 22 240 26"
      fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round"
      strokeDasharray={dashed ? "4 3" : "0"}
    />
    {/* forecast portion */}
    {showCI && (
      <path d="M 130 50 Q 160 40 190 35 Q 220 32 240 28"
        fill="none" stroke={color} strokeWidth="1.7" strokeDasharray="4 3" />
    )}
  </svg>
);

// Tiny inline sparkline for table rows
const Spark = ({ down = false, w = 60, h = 20, color }) => {
  const c = color || (down ? "#B33A3A" : "#2E7D4F");
  const path = down
    ? "M 2 6 Q 12 5 22 9 Q 32 15 42 13 Q 52 11 58 17"
    : "M 2 16 Q 12 14 22 11 Q 32 6 42 8 Q 52 10 58 4";
  return (
    <svg width={w} height={h} viewBox={`0 0 60 20`} style={{ display: "block" }}>
      <path d={path} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

// Bar chart placeholder (small)
const BarMini = ({ data, height = 70, color = "#15181C" }) => {
  const max = Math.max(...data);
  const W = 240, gap = 4;
  const bw = (W - gap * (data.length - 1)) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} style={{ width: "100%", height, display: "block" }}>
      {data.map((v, i) => (
        <rect
          key={i}
          x={i * (bw + gap)}
          y={height - (v / max) * (height - 6)}
          width={bw}
          height={(v / max) * (height - 6)}
          fill={color}
          opacity={0.85}
        />
      ))}
    </svg>
  );
};

Object.assign(window, { HandIcon, Squig, HexMapSketch, LocatorMap, TrendChart, Spark, BarMini });

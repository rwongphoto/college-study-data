/* global React */
const { useState, useEffect } = React;

// ============================================================
// Shared icons (Lucide-style, 1.5px stroke)
// ============================================================
const Ic = {
  search: (p={}) => <svg width={p.s||18} height={p.s||18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  arrow: (p={}) => <svg width={p.s||16} height={p.s||16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  ext: (p={}) => <svg width={p.s||13} height={p.s||13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3h7v7"/><path d="M21 3 10 14"/></svg>,
  trend: (p={}) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m7 15 4-4 4 4 5-5"/></svg>,
  shield: (p={}) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  layers: (p={}) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/></svg>,
  doc: (p={}) => <svg width={p.s||22} height={p.s||22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>,
  arrowUp: (p={}) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
  arrowDown: (p={}) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>,
  download: (p={}) => <svg width={p.s||14} height={p.s||14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/></svg>,
};

// ============================================================
// Brand + chrome
// ============================================================
const Brand = ({ small }) => (
  <a href="#" className="brand" style={{ fontSize: small ? 17 : 19 }}>
    Crime Trends<span className="dot">.</span><em>sf</em>
  </a>
);

const SiteHeader = ({ active = "home", subActive = null }) => {
  const citiesOpen = active === "home" || active === "city" || active === "nbhd";
  return (
    <header className="site-header">
      <div className="wrap row">
        <Brand />
        <nav className="site-nav">
          <div className={`nav-item ${citiesOpen ? "open-able" : ""}`}>
            <a href="#" className={active === "home" || active === "city" || active === "nbhd" ? "active" : ""}>
              Cities<span className="caret" aria-hidden="true"></span>
            </a>
            <div className="submenu" role="menu">
              <div className="sm-section">Live</div>
              <a href="#" className={active === "city" || active === "nbhd" ? "active" : ""}>
                <span>San Francisco</span>
                <span className="sub-meta">41 NBHDS</span>
              </a>
              {active === "nbhd" && (
                <a href="#" className="active" style={{ paddingLeft: 28 }}>
                  <span>↳ Outer Sunset</span>
                  <span className="sub-meta">NBHD</span>
                </a>
              )}
              <hr />
              <div className="sm-section">Queued</div>
              <a href="#" className="muted"><span>Oakland</span><span className="sub-meta">SOON</span></a>
              <a href="#" className="muted"><span>Los Angeles</span><span className="sub-meta">SOON</span></a>
              <a href="#" className="muted"><span>Seattle</span><span className="sub-meta">SOON</span></a>
              <a href="#" className="muted"><span>Chicago</span><span className="sub-meta">SOON</span></a>
              <a href="#" className="muted"><span>New York</span><span className="sub-meta">SOON</span></a>
              <hr />
              <a href="#"><span>All cities →</span></a>
            </div>
          </div>
          <a href="#" className={active === "method" ? "active" : ""}>Methodology</a>
          <a href="#" className={active === "about" ? "active" : ""}>About</a>
        </nav>
        <a href="#" className="btn btn-primary btn-sm">Open SF<span style={{marginLeft: 4}}>→</span></a>
      </div>
    </header>
  );
};

const Crumbs = ({ items }) => (
  <div className="wrap">
    <div className="crumbs">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="sep">/</span>}
          {it.href ? <a href={it.href}>{it.label}</a> : <span className="here">{it.label}</span>}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const SiteFooter = () => (
  <footer className="site-footer">
    <div className="wrap">
      <div className="grid">
        <div>
          <Brand small />
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, marginTop: 14, maxWidth: "32ch" }}>
            Crime trend intelligence built from public data. Methodology-first. Updated monthly.
          </p>
        </div>
        <div className="col">
          <h5>Cities</h5>
          <a href="#">San Francisco</a>
          <a href="#" className="muted">Oakland · soon</a>
          <a href="#" className="muted">Los Angeles · soon</a>
          <a href="#" className="muted">Seattle · soon</a>
        </div>
        <div className="col">
          <h5>Method</h5>
          <a href="#">How we flag</a>
          <a href="#">Forecast rules</a>
          <a href="#">Backtest</a>
          <a href="#">Data sources</a>
        </div>
        <div className="col">
          <h5>Elsewhere</h5>
          <a href="#">RSS</a>
          <a href="#">Contact</a>
        </div>
      </div>
      <div className="legal">
        <span>© 2026 Crime Trends</span>
        <span>Built on public open data · Last refreshed Apr 2026</span>
      </div>
    </div>
  </footer>
);

// ============================================================
// Charts (svg, no deps)
// ============================================================
const TrendLine = ({ height = 80, color = "#E8ECF2", showCI = false, dashed = false }) => (
  <svg viewBox="0 0 240 80" style={{ width: "100%", height, display: "block" }} preserveAspectRatio="none">
    <g stroke="#2A3142" strokeWidth="1">
      <line x1="0" y1="20" x2="240" y2="20" strokeDasharray="2 3" />
      <line x1="0" y1="50" x2="240" y2="50" strokeDasharray="2 3" />
    </g>
    {showCI && <path d="M 130 50 Q 160 35 190 30 Q 220 26 240 22 L 240 60 Q 220 56 190 58 Q 160 60 130 50 Z" fill={color} opacity="0.15" />}
    <path d="M 0 55 Q 20 50 40 48 Q 60 60 80 52 Q 100 38 120 42 Q 140 30 160 35 Q 180 28 200 30 Q 220 22 240 26"
      fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round" strokeDasharray={dashed ? "4 3" : "0"} />
    {showCI && <path d="M 130 50 Q 160 40 190 35 Q 220 32 240 28" fill="none" stroke={color} strokeWidth="1.7" strokeDasharray="4 3" />}
  </svg>
);

const Spark = ({ down = false, w = 80, h = 22, color }) => {
  const c = color || (down ? "#FF6B6B" : "#6FCF97");
  const path = down
    ? "M 2 6 Q 14 5 26 9 Q 38 15 50 13 Q 62 11 76 17"
    : "M 2 16 Q 14 14 26 11 Q 38 6 50 8 Q 62 10 76 4";
  return (
    <svg width={w} height={h} viewBox="0 0 78 20" style={{ display: "block" }}>
      <path d={path} fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
};

// Mapbox-style hex map placeholder (dark, matches Review Velocity)
const HexMapDark = () => {
  const W = 1000, H = 540;
  const hexR = 48;
  const hexW = Math.sqrt(3) * hexR;
  const hexH = 2 * hexR;
  // green → amber → red, like the map heat scale
  const palette = ["#3a7a55", "#5a8c4a", "#8a8c3a", "#b58a30", "#d18040", "#d85a4a", "#a83a3a"];
  const hexes = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 10; c++) {
      const x = 60 + c * hexW + (r % 2 ? hexW / 2 : 0);
      const y = 60 + r * (hexH * 0.75);
      const idx = Math.abs((c * 7 + r * 13 + r * c * 3) % palette.length);
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
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block", background: "#060810" }}>
      {/* faint street grid */}
      <g stroke="#1a2030" strokeWidth="1" fill="none">
        {Array.from({ length: 22 }).map((_, i) => <line key={`v${i}`} x1={i * 50 - 20} y1="0" x2={i * 50 + 60} y2={H} />)}
        {Array.from({ length: 14 }).map((_, i) => <line key={`h${i}`} x1="0" y1={i * 45 - 10} x2={W} y2={i * 45 + 20} />)}
      </g>
      {/* major arteries */}
      <path d="M -20 240 Q 300 200 600 260 T 1020 290" stroke="#2a3142" strokeWidth="4" fill="none" />
      <path d="M 380 -10 Q 420 200 360 380 T 380 600" stroke="#2a3142" strokeWidth="3" fill="none" />
      <path d="M -20 100 Q 250 90 520 110 T 1020 130" stroke="#2a3142" strokeWidth="3" fill="none" />
      {/* hex cells */}
      <g>
        {hexes.map((h, i) => (
          <path key={i} d={hexPath(h.x, h.y)} fill={palette[h.idx]} opacity="0.80" stroke="rgba(232,236,242,0.18)" strokeWidth="0.8" />
        ))}
      </g>
      {/* highlighted "selected" hex */}
      <path d={hexPath(180, 350)} fill="none" stroke="#3B82F6" strokeWidth="2.5" />
      {/* labels */}
      <g fill="#BFC6D4" fontFamily="JetBrains Mono, monospace" fontSize="10" opacity="0.85" fontWeight="500" letterSpacing="1">
        <text x="120" y="60">RICHMOND</text>
        <text x="420" y="60">PAC HTS</text>
        <text x="720" y="65">N BEACH</text>
        <text x="160" y="380">SUNSET</text>
        <text x="490" y="360">MISSION</text>
        <text x="770" y="380">BAYVIEW</text>
      </g>
    </svg>
  );
};

// Locator map (small, dark) for neighborhood pages
const Locator = ({ name = "Mission", h = 200 }) => (
  <svg viewBox="0 0 400 220" style={{ width: "100%", height: h, display: "block", background: "#060810" }}>
    <path d="M 30 40 Q 80 20 150 30 Q 220 40 300 30 Q 360 25 380 70 Q 385 130 370 180 Q 320 210 250 200 Q 180 195 100 200 Q 40 205 25 160 Q 18 100 30 40 Z" fill="#141821" stroke="#3A4257" strokeWidth="1.25" strokeLinejoin="round" />
    <g stroke="#232938" strokeWidth="0.6" fill="none">
      <line x1="60" y1="40" x2="60" y2="200" /><line x1="120" y1="40" x2="120" y2="200" />
      <line x1="200" y1="40" x2="200" y2="200" /><line x1="280" y1="40" x2="280" y2="200" />
      <line x1="30" y1="80" x2="380" y2="80" /><line x1="30" y1="130" x2="380" y2="80" />
      <line x1="30" y1="170" x2="380" y2="170" />
    </g>
    <path d="M 170 100 L 230 95 L 250 130 L 235 165 L 180 168 L 155 135 Z" fill="#3B82F6" fillOpacity="0.22" stroke="#3B82F6" strokeWidth="1.5" />
    <circle cx="198" cy="132" r="3.5" fill="#60A5FA" />
    <text x="198" y="150" fontFamily="JetBrains Mono, monospace" fontSize="11" fontWeight="500" textAnchor="middle" fill="#E8ECF2" letterSpacing="1">{name.toUpperCase()}</text>
    <g transform="translate(355, 50)" stroke="#5C6478" strokeWidth="1" fill="none">
      <circle r="11" />
      <path d="M0 -7 L 2.5 0 L 0 7 L -2.5 0 Z" fill="#8A93A6" stroke="none" />
      <text x="0" y="-14" textAnchor="middle" fontSize="9" fill="#8A93A6" stroke="none" fontFamily="JetBrains Mono">N</text>
    </g>
  </svg>
);

Object.assign(window, { Ic, Brand, SiteHeader, Crumbs, SiteFooter, TrendLine, Spark, HexMapDark, Locator });

/* global React */
const { useState: useStateEpa, useEffect: useEffectEpa } = React;

// Reuse Ic from site-shared if loaded; otherwise inline minimal
const EpaIc = (window.Ic) || {
  arrow: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7"/></svg>,
  ext: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3h7v7"/><path d="M21 3 10 14"/></svg>,
};

const EpaBrand = ({ small }) => (
  <a href="#" className="brand brand-lockup" style={{ fontSize: small ? 17 : 19, gap: small ? 8 : 10 }}>
    <svg width={small ? 22 : 26} height={small ? 22 : 26} viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id={`smk-${small?"s":"l"}`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#E6B450" stopOpacity="0.95"/>
          <stop offset="0.55" stopColor="#D97A30" stopOpacity="0.85"/>
          <stop offset="1" stopColor="#C44545" stopOpacity="0.55"/>
        </linearGradient>
      </defs>
      <circle cx="14" cy="20" r="3.0" fill={`url(#smk-${small?"s":"l"})`} opacity="0.55"/>
      <circle cx="18" cy="14" r="3.8" fill={`url(#smk-${small?"s":"l"})`} opacity="0.75"/>
      <circle cx="13" cy="11" r="2.6" fill={`url(#smk-${small?"s":"l"})`} opacity="0.6"/>
      <circle cx="32" cy="8"  r="4.6" fill={`url(#smk-${small?"s":"l"})`} opacity="0.85"/>
      <circle cx="38" cy="13" r="3.4" fill={`url(#smk-${small?"s":"l"})`} opacity="0.7"/>
      <circle cx="26" cy="13" r="3.2" fill={`url(#smk-${small?"s":"l"})`} opacity="0.65"/>
      <circle cx="50" cy="18" r="3.2" fill={`url(#smk-${small?"s":"l"})`} opacity="0.6"/>
      <circle cx="46" cy="13" r="3.6" fill={`url(#smk-${small?"s":"l"})`} opacity="0.75"/>
      <circle cx="54" cy="13" r="2.4" fill={`url(#smk-${small?"s":"l"})`} opacity="0.55"/>
      <rect x="11" y="22" width="8" height="34" rx="1.2" fill="#E8ECF2"/>
      <rect x="9" y="22" width="12" height="2.6" rx="0.6" fill="#E8ECF2"/>
      <rect x="28" y="18" width="10" height="38" rx="1.4" fill="#E8ECF2"/>
      <rect x="26" y="18" width="14" height="3" rx="0.7" fill="#E8ECF2"/>
      <rect x="46" y="22" width="8" height="34" rx="1.2" fill="#E8ECF2"/>
      <rect x="44" y="22" width="12" height="2.6" rx="0.6" fill="#E8ECF2"/>
    </svg>
    <span>Pollution Analyst<span className="dot">.</span><em>bay</em></span>
  </a>
);

const EpaHeader = ({ active = "region", subActive = null }) => {
  const placesOpen = active === "region" || active === "tract";
  return (
    <header className="site-header">
      <div className="wrap row">
        <EpaBrand />
        <nav className="site-nav">
          <div className={`nav-item ${placesOpen ? "open-able" : ""}`}>
            <a href="#" className={placesOpen ? "active" : ""}>
              Places<span className="caret" aria-hidden="true"></span>
            </a>
            <div className="submenu" role="menu">
              <div className="sm-section">Live</div>
              <a href="#" className={active === "region" || active === "tract" ? "active" : ""}>
                <span>SF Bay Area</span>
                <span className="sub-meta">1,588 TRACTS</span>
              </a>
              {active === "tract" && (
                <a href="#" className="active" style={{ paddingLeft: 28 }}>
                  <span>↳ Tract 06075061500</span>
                  <span className="sub-meta">BAYVIEW</span>
                </a>
              )}
              <hr/>
              <div className="sm-section">Queued</div>
              <a href="#" className="muted"><span>LA Basin</span><span className="sub-meta">SOON</span></a>
              <a href="#" className="muted"><span>Houston Ship Channel</span><span className="sub-meta">SOON</span></a>
              <a href="#" className="muted"><span>Pittsburgh</span><span className="sub-meta">SOON</span></a>
              <hr/>
              <a href="#"><span>All places →</span></a>
            </div>
          </div>
          <a href="#">Datasets</a>
          <a href="#">Methodology</a>
          <a href="#">About</a>
        </nav>
        <a href="#" className="btn btn-primary btn-sm">Open Bay Area<span style={{marginLeft: 4}}>→</span></a>
      </div>
    </header>
  );
};

const EpaFooter = () => (
  <footer className="site-footer">
    <div className="wrap">
      <div className="grid">
        <div>
          <EpaBrand small />
          <p className="muted" style={{ fontSize: 13.5, lineHeight: 1.55, marginTop: 14, maxWidth: "32ch" }}>
            Historical EPA data, tract by tract. Built on AQS, TRI, ECHO, SEMS, FLIGHT, SDWIS, and Census ACS.
          </p>
        </div>
        <div className="col">
          <h5>Datasets</h5>
          <a href="#">Air Quality (AQS)</a>
          <a href="#">Toxic Releases (TRI)</a>
          <a href="#">Superfund (SEMS)</a>
          <a href="#">Drinking Water (SDWIS)</a>
          <a href="#">GHG (FLIGHT)</a>
          <a href="#">Enforcement (ECHO)</a>
        </div>
        <div className="col">
          <h5>Method</h5>
          <a href="#">How we trend</a>
          <a href="#">EJ overlays</a>
          <a href="#">Tract joins</a>
          <a href="#">Limitations</a>
        </div>
        <div className="col">
          <h5>Elsewhere</h5>
          <a href="#">RSS</a>
          <a href="#">Contact</a>
        </div>
      </div>
      <div className="legal">
        <span>© 2026 Environmental Analyst</span>
        <span>Built on EPA + Census public data · Last refreshed Apr 2026</span>
      </div>
    </div>
  </footer>
);

// Long-arc trend line (1990–2025), with optional CAA-era annotation marker
const EpaTrend = ({ height = 110, color = "#60A5FA", direction = "down", showRule = false, ruleLabel = "Std." }) => {
  const path = direction === "down"
    ? "M 0 22 Q 30 28 60 35 Q 90 50 120 58 Q 150 65 180 70 Q 210 76 240 80"
    : direction === "up"
    ? "M 0 80 Q 30 75 60 70 Q 90 60 120 50 Q 150 38 180 30 Q 210 24 240 20"
    : "M 0 50 Q 30 45 60 52 Q 90 60 120 48 Q 150 36 180 44 Q 210 50 240 46";
  return (
    <svg viewBox="0 0 240 100" style={{ width: "100%", height, display: "block" }} preserveAspectRatio="none">
      <g stroke="#2A3142" strokeWidth="1">
        <line x1="0" y1="20" x2="240" y2="20" strokeDasharray="2 3"/>
        <line x1="0" y1="50" x2="240" y2="50" strokeDasharray="2 3"/>
        <line x1="0" y1="80" x2="240" y2="80" strokeDasharray="2 3"/>
      </g>
      {showRule && (
        <g>
          <line x1="0" y1="40" x2="240" y2="40" stroke="#FF6B6B" strokeWidth="1" strokeDasharray="4 3" opacity="0.7"/>
          <text x="236" y="36" textAnchor="end" fontFamily="JetBrains Mono, monospace" fontSize="9" fill="#FF6B6B" letterSpacing="0.5">{ruleLabel}</text>
        </g>
      )}
      <path d={path} fill="none" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/>
    </svg>
  );
};

// EPA static map placeholder — looks like a Mapbox screenshot of Bay Area with choropleth
const EpaMap = ({ style = "dark", overlay = "pm25", showLabels = true }) => {
  const palettes = {
    pm25:    ["#1a3a4a", "#2a5a6a", "#4a7a7a", "#7aa57a", "#c5a945", "#d97a30", "#c44545"],
    tri:     ["#1a2a4a", "#2a3a6a", "#3a5a8a", "#5a7aa5", "#8a9ac5", "#b58ae0", "#d06ad0"],
    ej:      ["#1a3a30", "#2a5a40", "#4a7a40", "#a59a30", "#d97a30", "#c44545", "#8a2a2a"],
  };
  const palette = palettes[overlay] || palettes.pm25;
  const baseBg = style === "light" ? "#f0ede4" : style === "satellite" ? "#1a2018" : "#06080d";
  const landFill = style === "light" ? "#e6e2d4" : style === "satellite" ? "#2a3024" : "#10141c";
  const waterFill = style === "light" ? "#c8d4dc" : style === "satellite" ? "#0a1a2a" : "#040608";
  const stroke = style === "light" ? "#9aa099" : style === "satellite" ? "#3a4030" : "#2a3142";
  const textCol = style === "light" ? "#3a4050" : "#BFC6D4";
  return (
    <svg viewBox="0 0 1000 600" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: "100%", display: "block", background: baseBg }}>
      <rect width="1000" height="600" fill={waterFill}/>
      {/* Bay Area land masses, abstracted */}
      <path d="M 80 80 L 380 60 L 460 140 L 480 240 L 440 320 L 460 420 L 410 520 L 320 540 L 220 520 L 140 460 L 100 360 L 70 250 Z" fill={landFill} stroke={stroke} strokeWidth="1.5"/>
      <path d="M 540 100 L 760 80 L 880 140 L 920 240 L 900 360 L 850 460 L 760 520 L 660 540 L 580 500 L 540 420 L 520 320 L 530 200 Z" fill={landFill} stroke={stroke} strokeWidth="1.5"/>
      <path d="M 470 360 L 540 350 L 555 420 L 535 470 L 480 460 Z" fill={landFill} stroke={stroke} strokeWidth="1.5"/>

      {/* Choropleth tracts */}
      <g opacity="0.78" stroke={style === "light" ? "rgba(0,0,0,0.15)" : "rgba(255,255,255,0.10)"} strokeWidth="0.6">
        {(() => {
          const cells = [];
          for (let r = 0; r < 18; r++) {
            for (let c = 0; c < 30; c++) {
              const x = 70 + c * 30, y = 60 + r * 28;
              const inside = ((x > 90 && x < 460 && y > 70 && y < 530) || (x > 540 && x < 900 && y > 90 && y < 530));
              if (!inside) continue;
              const idx = Math.abs((c*7 + r*13 + (c%5)*(r%4)*3) % palette.length);
              cells.push(<rect key={`${r}-${c}`} x={x-14} y={y-12} width="28" height="24" fill={palette[idx]}/>);
            }
          }
          return cells;
        })()}
      </g>

      {/* Highways */}
      <g stroke={stroke} strokeWidth="2.5" fill="none" opacity="0.85">
        <path d="M 200 60 Q 260 200 280 360 Q 300 500 350 560"/>
        <path d="M 540 100 Q 620 240 660 380 Q 700 500 740 560"/>
        <path d="M 80 280 Q 280 290 470 380 Q 660 460 920 420"/>
      </g>

      {/* Bay water bodies */}
      <path d="M 470 80 Q 510 200 480 360 Q 470 460 520 540" fill="none" stroke={waterFill} strokeWidth="48" opacity="0.9"/>

      {/* Selected tract highlight */}
      <rect x="416" y="408" width="28" height="24" fill="none" stroke="#3B82F6" strokeWidth="2.5"/>

      {/* Industrial site dots (TRI) */}
      <g fill="#FF6B6B" stroke={baseBg} strokeWidth="1.5">
        <circle cx="270" cy="380" r="5"/>
        <circle cx="410" cy="430" r="6"/>
        <circle cx="690" cy="280" r="5"/>
        <circle cx="780" cy="440" r="4"/>
        <circle cx="340" cy="480" r="4"/>
      </g>

      {showLabels && (
        <g fill={textCol} fontFamily="JetBrains Mono, monospace" fontWeight="500" letterSpacing="1.2">
          <text x="180" y="180" fontSize="11">SAN FRANCISCO</text>
          <text x="640" y="220" fontSize="11">OAKLAND</text>
          <text x="280" y="500" fontSize="11">SAN MATEO</text>
          <text x="800" y="380" fontSize="11">FREMONT</text>
          <text x="200" y="120" fontSize="9" opacity="0.6">MARIN</text>
          <text x="490" y="460" fontSize="9" opacity="0.6" textAnchor="middle">BAY</text>
        </g>
      )}

      {/* Map chrome — attribution + scale */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="9" letterSpacing="0.5" fill={textCol} opacity="0.7">
        <rect x="14" y="572" width="120" height="16" fill={baseBg} opacity="0.7"/>
        <text x="20" y="583">© Mapbox · © OSM</text>
        <line x1="880" y1="580" x2="960" y2="580" stroke={textCol} strokeWidth="1.5"/>
        <line x1="880" y1="576" x2="880" y2="584" stroke={textCol} strokeWidth="1.5"/>
        <line x1="960" y1="576" x2="960" y2="584" stroke={textCol} strokeWidth="1.5"/>
        <text x="920" y="572" textAnchor="middle">10 mi</text>
      </g>
    </svg>
  );
};

Object.assign(window, { EpaIc, EpaBrand, EpaHeader, EpaFooter, EpaTrend, EpaMap });

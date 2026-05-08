/* global React, EpaHeader, EpaFooter, EpaTrend, EpaMap */
const { useState: useStateCorr } = React;

// ============================================================
// Scatter chart — one dot per tract, regression line
// ============================================================
function Scatter({
  xLabel, yLabel, xRange = [0, 16], yRange = [0, 20],
  // pre-computed dots: {x, y, hi}  (hi flags a highlighted/selected one)
  dots, slope = 0.6, intercept = 4, r2 = 0.42,
  color = "#60A5FA",
}) {
  const W = 540, H = 360;
  const padL = 56, padR = 24, padT = 24, padB = 48;
  const sx = v => padL + (v - xRange[0]) / (xRange[1] - xRange[0]) * (W - padL - padR);
  const sy = v => H - padB - (v - yRange[0]) / (yRange[1] - yRange[0]) * (H - padT - padB);
  // regression line endpoints
  const x1 = xRange[0], x2 = xRange[1];
  const y1 = intercept + slope * x1;
  const y2 = intercept + slope * x2;
  // gridlines
  const xTicks = [], yTicks = [];
  for (let i = 0; i <= 4; i++) {
    xTicks.push(xRange[0] + (xRange[1] - xRange[0]) * i / 4);
    yTicks.push(yRange[0] + (yRange[1] - yRange[0]) * i / 4);
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {/* gridlines */}
      <g stroke="#2A3142" strokeWidth="1">
        {yTicks.map((t,i) => <line key={`y${i}`} x1={padL} x2={W-padR} y1={sy(t)} y2={sy(t)} strokeDasharray="2 3"/>)}
        {xTicks.map((t,i) => <line key={`x${i}`} x1={sx(t)} x2={sx(t)} y1={padT} y2={H-padB} strokeDasharray="2 3"/>)}
      </g>
      {/* axes */}
      <line x1={padL} x2={padL} y1={padT} y2={H-padB} stroke="#3A4257" strokeWidth="1"/>
      <line x1={padL} x2={W-padR} y1={H-padB} y2={H-padB} stroke="#3A4257" strokeWidth="1"/>
      {/* tick labels */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#8A93A6" letterSpacing="0.5">
        {xTicks.map((t,i) => <text key={`xl${i}`} x={sx(t)} y={H-padB+16} textAnchor="middle">{t.toFixed(t < 1 ? 2 : 0)}</text>)}
        {yTicks.map((t,i) => <text key={`yl${i}`} x={padL-8} y={sy(t)+3} textAnchor="end">{t.toFixed(t < 1 ? 2 : 0)}</text>)}
      </g>
      {/* axis labels */}
      <text x={W/2} y={H-10} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#BFC6D4">{xLabel}</text>
      <text x={14} y={H/2} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#BFC6D4" transform={`rotate(-90 14 ${H/2})`}>{yLabel}</text>
      {/* regression line */}
      <line x1={sx(x1)} y1={sy(y1)} x2={sx(x2)} y2={sy(y2)} stroke={color} strokeWidth="2" strokeDasharray="6 4" opacity="0.7"/>
      {/* dots */}
      <g>
        {dots.map((d,i) => (
          <circle key={i} cx={sx(d.x)} cy={sy(d.y)} r={d.hi ? 5 : 3}
            fill={d.hi ? "#FF6B6B" : color} fillOpacity={d.hi ? 1 : 0.55}
            stroke={d.hi ? "var(--bg)" : "none"} strokeWidth="1.5"/>
        ))}
      </g>
      {/* r² badge */}
      <g transform={`translate(${W-padR-100}, ${padT+8})`}>
        <rect x="0" y="0" width="100" height="22" rx="3" fill="var(--bg-3)" stroke="#3A4257"/>
        <text x="50" y="15" textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#E8ECF2">R² = {r2.toFixed(2)}</text>
      </g>
    </svg>
  );
}

// generate plausible scattered tract dots
const seed = (n) => () => { n = (n * 9301 + 49297) % 233280; return n / 233280; };
function genDots(count, slope, intercept, noise, xRange, hiIndices = [], seedN = 1) {
  const rnd = seed(seedN);
  const dots = [];
  for (let i = 0; i < count; i++) {
    const x = xRange[0] + rnd() * (xRange[1] - xRange[0]);
    const y = intercept + slope * x + (rnd() - 0.5) * noise * 2;
    dots.push({ x, y, hi: hiIndices.includes(i) });
  }
  return dots;
}

// ============================================================
// Side-by-side dual-overlay map
// ============================================================
function DualMap({ left = "pm25", right = "places-asthma" }) {
  return (
    <div className="dual-map">
      <div className="dm-side">
        <div className="dm-tag"><span className="meta-mono">EPA · PM2.5 ANNUAL MEAN (2024)</span></div>
        <div className="dm-canvas"><EpaMap style="dark" overlay={left}/></div>
      </div>
      <div className="dm-side">
        <div className="dm-tag"><span className="meta-mono">CDC PLACES · ADULT ASTHMA PREVALENCE (2024 EST.)</span></div>
        <div className="dm-canvas"><EpaMap style="dark" overlay="ej"/></div>
      </div>
    </div>
  );
}

// ============================================================
// Page sections
// ============================================================
function CorrHero() {
  return (
    <section className="city-header">
      <div className="wrap">
        <div className="eyebrow">SF Bay Area · 9 counties · 1,588 census tracts</div>
        <h1>Environment × Health</h1>
        <p className="lede" style={{ marginTop: 18, maxWidth: "62ch" }}>
          Joining EPA exposure data to CDC health indicators at matching geographic units. Scatter plots, side-by-side maps, and lag analyses — across 1,588 tracts and 9 counties.
        </p>
        <div className="byline">
          <span className="meta-mono">EPA AQS · TRI · CDC PLACES · CDC WONDER · CDC TRACKING NETWORK</span>
          <span className="meta-mono">JOIN GEOGRAPHIC · TRACT (PREVALENCE) · COUNTY (MORTALITY)</span>
        </div>
      </div>
    </section>
  );
}

function ScatterPanel() {
  const [pair, setPair] = useStateCorr("pm-asthma");
  const presets = {
    "pm-asthma": {
      x: "PM2.5 annual mean (µg/m³, 2024)",
      y: "Adult asthma prevalence (%, 2024 est.)",
      r2: 0.41, slope: 0.42, intercept: 6.5,
      xRange: [4, 16], yRange: [4, 14],
      seedN: 7,
      headline: "Tracts with higher PM2.5 show higher adult asthma prevalence.",
      note: "Ecological relationship. CDC PLACES uses BRFSS-modeled small-area estimates; not individual-level data.",
      x_source: "EPA AQS · interpolated to tract centroids",
      y_source: "CDC PLACES · 2024 release",
    },
    "tri-cancer": {
      x: "TRI carcinogen releases (lbs/sq mi, 2014)",
      y: "All-cancer mortality (per 100k, 2019–2023, county)",
      r2: 0.18, slope: 0.0014, intercept: 165,
      xRange: [0, 4000], yRange: [140, 220],
      seedN: 11,
      headline: "Counties with higher historical carcinogen releases show modestly elevated cancer mortality.",
      note: "Ecological. 10-year lag applied. Cancer outcomes have many confounders (age structure, smoking, screening access).",
      x_source: "EPA TRI · 2014 reporting year",
      y_source: "CDC WONDER · 5-year aggregate",
    },
    "ozone-cvd": {
      x: "Ozone 4th-max 8-hr (ppm, 2024)",
      y: "Cardiovascular disease prevalence (%, adults)",
      r2: 0.07, slope: 12, intercept: 6.2,
      xRange: [0.05, 0.085], yRange: [4, 12],
      seedN: 17,
      headline: "Weak association between ozone and CVD prevalence at the tract level.",
      note: "Low R². Ecological correlations on chronic conditions are noisy; CDC PLACES is modeled, not measured.",
      x_source: "EPA AQS",
      y_source: "CDC PLACES",
    },
    "lead-bli": {
      x: "Pre-1980 housing × poverty (composite)",
      y: "Children with elevated blood lead (per 1k tested)",
      r2: 0.34, slope: 8, intercept: 1.2,
      xRange: [0, 1], yRange: [0, 12],
      seedN: 23,
      headline: "Lead-exposure risk composite tracks childhood blood-lead surveillance data.",
      note: "Surveillance bias: areas with more screening detect more cases. CDC Tracking Network publishes both rates and screening counts.",
      x_source: "Census ACS · pre-1980 housing × % below poverty",
      y_source: "CDC Childhood Blood Lead Surveillance",
    },
  };
  const p = presets[pair];
  const dots = genDots(80, p.slope, p.intercept, (p.yRange[1]-p.yRange[0]) * 0.30, p.xRange, [37, 52, 19], p.seedN);
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 01 · EXPOSURE → OUTCOME</div>
            <h2>Each dot is a tract.</h2>
          </div>
          <p className="sec-sub">Pick a pairing. Regression line is OLS, single-variable; <a href="#">no covariates adjusted</a>. R² is pure association strength, not causal weight.</p>
        </header>
        <div className="pair-toolbar">
          <span className="meta-mono">PAIRING</span>
          {Object.entries(presets).map(([k, v]) => (
            <button key={k} className={`mt-btn ${pair===k?"active":""}`} onClick={()=>setPair(k)}>
              {k === "pm-asthma" ? "PM2.5 ↔ Asthma" :
               k === "tri-cancer" ? "TRI ↔ Cancer mortality" :
               k === "ozone-cvd" ? "Ozone ↔ CVD" :
               "Lead risk ↔ Blood lead"}
            </button>
          ))}
        </div>
        <div className="scatter-grid">
          <div className="figure-frame">
            <div className="fig-head">
              <span className="meta-mono">{p.x_source.split(" · ")[0]} × {p.y_source.split(" · ")[0]}</span>
              <span className="meta-mono">N = 1,588 tracts</span>
            </div>
            <div className="fig-canvas big" style={{padding:"24px 32px"}}>
              <Scatter xLabel={p.x} yLabel={p.y} xRange={p.xRange} yRange={p.yRange}
                dots={dots} slope={p.slope} intercept={p.intercept} r2={p.r2}/>
            </div>
            <div className="fig-foot">
              <span style={{color:"var(--fg-2)"}}>{p.headline}</span>
              <a href="#" className="link-mono">Methodology →</a>
            </div>
          </div>
          <aside className="scatter-side">
            <div className="ss-block">
              <div className="kicker">WHAT YOU'RE SEEING</div>
              <p>{p.headline}</p>
            </div>
            <div className="ss-block">
              <div className="kicker">CAVEAT</div>
              <p>{p.note}</p>
            </div>
            <div className="ss-block">
              <div className="kicker">SOURCES</div>
              <ul className="ss-sources">
                <li><span>X</span> {p.x_source}</li>
                <li><span>Y</span> {p.y_source}</li>
              </ul>
            </div>
            <div className="ss-block">
              <div className="kicker">3 OUTLIERS HIGHLIGHTED</div>
              <p style={{fontSize:13.5}}>The red dots are tracts where the actual outcome diverges most from what the regression predicts — worth investigating, in either direction.</p>
              <a href="#" className="link-mono">View outlier list →</a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function CoLocatedSection() {
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 02 · CO-LOCATED BURDEN</div>
            <h2>The same tracts, two ways.</h2>
          </div>
          <p className="sec-sub">Side-by-side rather than overlaid — overlapping the layers makes false patterns look real. The user does the visual join.</p>
        </header>
        <DualMap />
        <div className="overlap-tags">
          <div className="tag">
            <span className="meta-mono">TRACTS IN TOP DECILE OF BOTH</span>
            <span className="num">94</span>
          </div>
          <div className="tag">
            <span className="meta-mono">TOP-DECILE PM2.5 ONLY</span>
            <span className="num">65</span>
          </div>
          <div className="tag">
            <span className="meta-mono">TOP-DECILE ASTHMA ONLY</span>
            <span className="num">65</span>
          </div>
          <div className="tag">
            <span className="meta-mono">JACCARD OVERLAP</span>
            <span className="num">0.42</span>
          </div>
        </div>
        <p className="meta-mono" style={{ marginTop: 24, color: "var(--fg-4)", maxWidth: "70ch", lineHeight: 1.6, letterSpacing: "0.04em" }}>
          DEFINITIONS · TOP DECILE = ABOVE 90TH PERCENTILE WITHIN BAY AREA. JACCARD = INTERSECTION ÷ UNION OF THE TWO SETS. 1.0 = PERFECT OVERLAP, 0 = NO OVERLAP.
        </p>
      </div>
    </section>
  );
}

function RankedJoinTable() {
  const rows = [
    { tract:"06001405100", nbhd:"W. Oakland", pm:14.2, asth:13.4, copd:9.8, cvd:8.1, mhd:18.2 },
    { tract:"06013351200", nbhd:"Richmond N", pm:13.5, asth:12.1, copd:8.4, cvd:7.6, mhd:17.0 },
    { tract:"06075061500", nbhd:"Bayview SF", pm:12.8, asth:11.9, copd:7.2, cvd:7.1, mhd:16.8 },
    { tract:"06013355000", nbhd:"Pittsburg", pm:11.0, asth:10.4, copd:8.1, cvd:8.4, mhd:15.6 },
    { tract:"06001408400", nbhd:"E. Oakland", pm:11.9, asth:11.7, copd:9.0, cvd:8.0, mhd:17.4 },
    { tract:"06081609800", nbhd:"E. Palo Alto", pm:10.1, asth:10.8, copd:6.8, cvd:6.7, mhd:15.1 },
    { tract:"06001408700", nbhd:"San Leandro", pm:10.7, asth:9.9, copd:7.4, cvd:7.0, mhd:14.8 },
    { tract:"06097153100", nbhd:"Santa Rosa SE", pm:10.4, asth:10.1, copd:8.0, cvd:8.2, mhd:16.0 },
  ];
  // for column shading
  const max = (key) => Math.max(...rows.map(r => r[key]));
  const min = (key) => Math.min(...rows.map(r => r[key]));
  const heat = (v, key) => {
    const t = (v - min(key)) / (max(key) - min(key));
    return `rgba(255,107,107,${0.10 + t*0.45})`;
  };
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 03 · RANKED JOIN</div>
            <h2>Top-PM2.5 tracts, with their CDC PLACES indicators.</h2>
          </div>
          <p className="sec-sub">Sorted by PM2.5 descending. Color-shaded by within-table percentile per column. Click a row for the tract profile.</p>
        </header>
        <div className="rank-table">
          <div className="rt-th">
            <span>TRACT</span>
            <span>NEIGHBORHOOD</span>
            <span className="r">PM2.5</span>
            <span className="r">ASTHMA</span>
            <span className="r">COPD</span>
            <span className="r">CVD</span>
            <span className="r">MENTAL HEALTH</span>
          </div>
          {rows.map(r => (
            <a className="rt-tr" href="#" key={r.tract}>
              <span className="num-mono">{r.tract}</span>
              <span className="nbhd">{r.nbhd}</span>
              <span className="r heat" style={{background:heat(r.pm,"pm")}}>{r.pm.toFixed(1)}</span>
              <span className="r heat" style={{background:heat(r.asth,"asth")}}>{r.asth.toFixed(1)}%</span>
              <span className="r heat" style={{background:heat(r.copd,"copd")}}>{r.copd.toFixed(1)}%</span>
              <span className="r heat" style={{background:heat(r.cvd,"cvd")}}>{r.cvd.toFixed(1)}%</span>
              <span className="r heat" style={{background:heat(r.mhd,"mhd")}}>{r.mhd.toFixed(1)}%</span>
            </a>
          ))}
        </div>
        <div className="rt-foot">
          <span>Showing top 8 of 159 tracts in the Bay Area top decile.</span>
          <a href="#" className="link-mono">See full ranking →</a>
        </div>
      </div>
    </section>
  );
}

function LagSection() {
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 04 · LAG ANALYSIS</div>
            <h2>Industrial release history, county-level cancer mortality.</h2>
          </div>
          <p className="sec-sub">Contra Costa County. TRI carcinogen releases lagged 0–20 years against all-cancer mortality (CDC WONDER). Pearson correlation peaks at 12-year lag.</p>
        </header>
        <div className="lag-grid">
          <div className="figure-frame">
            <div className="fig-head">
              <span className="meta-mono">CONTRA COSTA · TRI lag → cancer mortality</span>
              <span className="meta-mono">1990–2024</span>
            </div>
            <div className="fig-canvas big">
              <svg viewBox="0 0 540 280" style={{width:"100%", height:"auto", display:"block"}}>
                {/* axes */}
                <g stroke="#2A3142" strokeWidth="1">
                  {[0,1,2,3,4].map(i => <line key={i} x1="50" x2="520" y1={40+i*48} y2={40+i*48} strokeDasharray="2 3"/>)}
                  {[0,5,10,15,20].map(i => <line key={i} x1={50+(i/20)*470} x2={50+(i/20)*470} y1="40" y2="232" strokeDasharray="2 3"/>)}
                </g>
                {/* zero line */}
                <line x1="50" x2="520" y1="136" y2="136" stroke="#3A4257" strokeWidth="1"/>
                {/* bars: correlation values 0..20 lag yrs */}
                {[0.05, 0.08, 0.12, 0.15, 0.19, 0.24, 0.31, 0.36, 0.41, 0.45, 0.51, 0.56, 0.58, 0.55, 0.49, 0.41, 0.34, 0.27, 0.21, 0.16, 0.11].map((c,i) => {
                  const x = 50 + (i/20)*470 - 8;
                  const h = c * 96;
                  const y = 136 - h;
                  const peak = i === 12;
                  return <rect key={i} x={x} y={y} width="14" height={h} fill={peak?"#FF6B6B":"#60A5FA"} fillOpacity={peak?1:0.65}/>;
                })}
                {/* y axis labels */}
                <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#8A93A6">
                  <text x="44" y="44" textAnchor="end">0.8</text>
                  <text x="44" y="92" textAnchor="end">0.6</text>
                  <text x="44" y="140" textAnchor="end">0</text>
                  <text x="44" y="188" textAnchor="end">−0.6</text>
                  <text x="44" y="236" textAnchor="end">−0.8</text>
                </g>
                {/* x axis labels */}
                <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#8A93A6">
                  {[0,5,10,15,20].map(i => <text key={i} x={50+(i/20)*470} y="252" textAnchor="middle">{i}y</text>)}
                </g>
                <text x="285" y="270" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#BFC6D4">Lag (years)</text>
                <text x="14" y="140" textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#BFC6D4" transform="rotate(-90 14 140)">Pearson r</text>
                {/* peak label */}
                <line x1={50+(12/20)*470} y1="40" x2={50+(12/20)*470} y2={136-0.58*96 - 6} stroke="#FF6B6B" strokeWidth="1" strokeDasharray="3 3"/>
                <text x={50+(12/20)*470 + 6} y="50" fontFamily="Inter, sans-serif" fontSize="11" fontWeight="600" fill="#FF6B6B">Peak r = 0.58 at 12 years</text>
              </svg>
            </div>
            <div className="fig-foot">
              <span>Strongest association at a 12-year lag. Latency consistent with literature on solid-tumor onset after exposure.</span>
              <a href="#" className="link-mono">Methodology →</a>
            </div>
          </div>
          <aside className="lag-side">
            <div className="kicker">READ THIS</div>
            <p>A 12-year peak-correlation lag is consistent with cancer latency literature, but the ecological design and small county-N (9 counties × 35 years) means CIs are wide.</p>
            <p>Don't read this chart as "industrial releases caused these cancers" — read it as "this pattern warrants the closer-grain analyses you can run from the linked methodology."</p>
            <div className="kicker" style={{marginTop:18}}>NUMBERS</div>
            <ul className="ss-sources">
              <li><span>N</span> 9 counties × 35 years</li>
              <li><span>r</span> 0.58 at 12y lag</li>
              <li><span>CI</span> 0.31–0.76 (95%)</li>
              <li><span>p</span> &lt; 0.01 (uncorrected)</li>
            </ul>
          </aside>
        </div>
      </div>
    </section>
  );
}

function HealthFirstSection() {
  const conditions = [
    { name: "Asthma (adult)", cdcMetric:"BRFSS PLACES", topCorr:"PM2.5", r:0.41, dir:"up" },
    { name: "COPD",            cdcMetric:"BRFSS PLACES", topCorr:"PM2.5",  r:0.36, dir:"up" },
    { name: "CVD",             cdcMetric:"BRFSS PLACES", topCorr:"Diesel NOx", r:0.22, dir:"up" },
    { name: "Cancer mortality (all)", cdcMetric:"CDC WONDER", topCorr:"TRI carcinogens (12y lag)", r:0.58, dir:"up" },
    { name: "Asthma ED visits (kids)", cdcMetric:"Tracking Net", topCorr:"PM2.5 + diesel", r:0.49, dir:"up" },
    { name: "Low birth weight", cdcMetric:"Tracking Net", topCorr:"PM2.5 (3rd trimester)", r:0.27, dir:"up" },
    { name: "Mental distress", cdcMetric:"BRFSS PLACES", topCorr:"% poverty (confounder)", r:0.62, dir:"up" },
    { name: "Childhood blood lead", cdcMetric:"CBLS", topCorr:"Pre-1980 housing × poverty", r:0.34, dir:"up" },
  ];
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 05 · HEALTH-FIRST</div>
            <h2>Start from the disease.</h2>
          </div>
          <p className="sec-sub">For each CDC indicator, the EPA exposure variable that best correlates Bay Area-wide. Use this to find which environmental factor a given health pattern co-varies with most.</p>
        </header>
        <div className="hf-grid">
          {conditions.map((c, i) => (
            <a key={i} className="hf-card" href="#">
              <div className="hf-head">
                <h4>{c.name}</h4>
                <span className="meta-mono">{c.cdcMetric}</span>
              </div>
              <div className="hf-body">
                <div className="hf-corr">
                  <span className="meta-mono">TOP EPA CORRELATE</span>
                  <span className="hf-x">{c.topCorr}</span>
                </div>
                <div className="hf-r">
                  <span className="hf-num">{c.r.toFixed(2)}</span>
                  <span className="meta-mono">PEARSON r</span>
                </div>
              </div>
              <div className="hf-bar"><i style={{width: `${Math.abs(c.r)*100}%`, background: c.dir==="up" ? "#FF6B6B" : "#6FCF97"}}/></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function MethodCallout() {
  return (
    <section className="section section-tint">
      <div className="wrap">
        <div className="method-promo">
          <div>
            <div className="kicker">METHODOLOGY</div>
            <h3>What these correlations are — and aren't.</h3>
            <p>All analyses on this page are <strong>ecological</strong> (group-level, not individual). PLACES is <strong>modeled</strong> from BRFSS, not measured. WONDER is real mortality but at the county level. Correlations are unadjusted; we don't control for smoking, age structure, screening access, or income directly. Use this to <em>find</em> patterns. Don't use this to <em>prove</em> them.</p>
          </div>
          <a href="#" className="btn btn-primary">Read full methodology →</a>
        </div>
      </div>
    </section>
  );
}

function EpaCorrelationsPage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <EpaHeader active="region" />
      <CorrHero />
      <ScatterPanel />
      <CoLocatedSection />
      <RankedJoinTable />
      <LagSection />
      <HealthFirstSection />
      <MethodCallout />
      <EpaFooter />
    </div>
  );
}

window.EpaCorrelationsPage = EpaCorrelationsPage;

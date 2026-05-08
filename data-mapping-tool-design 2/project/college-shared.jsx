/* global React */
const { useState: cuState, useEffect: cuEffect } = React;

// ============================================================
// Brand mark — graduation cap (mortarboard) with amber tassel
// ============================================================
const CollegeMark = ({ size = 26, idSuffix = "l" }) => (
  <svg width={size} height={size * (56/64)} viewBox="0 0 64 56" aria-hidden="true">
    {/* Cap crown */}
    <path d="M16 26 Q16 40 22 42 L42 42 Q48 40 48 26 Z" fill="#E8ECF2"/>
    {/* Mortarboard (diamond) */}
    <path d="M32 6 L58 18 L32 30 L6 18 Z" fill="#E8ECF2"/>
    {/* Center button */}
    <circle cx="32" cy="18" r="1.6" fill="#0E1116"/>
    {/* Tassel cord */}
    <path d="M32 18 Q44 18 49 25" fill="none" stroke="#E6B450" strokeWidth="2" strokeLinecap="round"/>
    {/* Tassel knot */}
    <circle cx="49" cy="27" r="2.2" fill="#E6B450"/>
    {/* Tassel fringe */}
    <path d="M47 29 L47 38 M49 29 L49 39 M51 29 L51 38" stroke="#E6B450" strokeWidth="1.6" strokeLinecap="round"/>
    {/* hidden so existing prop chain stays valid */}
    <g style={{display:"none"}}>
      <rect x="10" y="14" width="36" height="28" rx="2"/>
      <path d="M10 22 h36"/>
      <path d="M16 30 h18 M16 34 h22 M16 38 h14"/>
    </g>
    <g>
      <path d={`M48 22 q10 8 10 18`} fill="none" stroke="#E6B450" strokeWidth="2"/>
      <circle cx={58} cy={42} r={4} fill="#E6B450"/>
      <circle cx={58} cy={42} r={2} fill="#0E1116"/>
    </g>
  </svg>
);

const CollegeBrand = ({ small }) => (
  <a href="#" className="brand brand-lockup" style={{ fontSize: small ? 17 : 19, gap: small ? 8 : 10 }}>
    <CollegeMark size={small ? 22 : 26}/>
    <span>College Outcome<span className="dot">.</span><em>analyst</em></span>
  </a>
);

// ============================================================
// Header / Footer
// ============================================================
function CollegeHeader({ active }) {
  const [open, setOpen] = cuState(false);
  return (
    <header className="site-header">
      <div className="wrap row">
        <CollegeBrand />
        <nav className="site-nav">
          <a className={active==="home" ? "active" : ""} href="#">Home</a>
          <div className={`nav-dd ${open ? "open" : ""}`} onMouseEnter={()=>setOpen(true)} onMouseLeave={()=>setOpen(false)}>
            <a className={active==="state" ? "active" : ""} href="#">States ▾</a>
            <div className="dd-menu">
              <a className="dd-item active" href="#">
                <span className="dd-name">Oregon</span>
                <span className="meta-mono">75 INSTITUTIONS · LIVE</span>
              </a>
              <a className="dd-item" href="#"><span className="dd-name">California</span><span className="meta-mono">QUEUED</span></a>
              <a className="dd-item" href="#"><span className="dd-name">Washington</span><span className="meta-mono">QUEUED</span></a>
              <a className="dd-item" href="#"><span className="dd-name">All 50 states</span><span className="meta-mono">2026 PHASE 2</span></a>
            </div>
          </div>
          <a className={active==="programs" ? "active" : ""} href="#">Programs</a>
          <a className={active==="rankings" ? "active" : ""} href="#">Rankings</a>
          <a className={active==="methodology" ? "active" : ""} href="#">Methodology</a>
        </nav>
        <a href="#" className="btn btn-primary btn-sm">Open Oregon →</a>
      </div>
    </header>
  );
}

function CollegeFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="f-brand">
            <CollegeBrand small />
            <p>Federal earnings, debt, and completion data — surfaced per institution and per program.</p>
            <div className="meta-mono" style={{color:"var(--fg-4)"}}>FED. SOURCED · IPEDS · COLLEGE SCORECARD · TREASURY</div>
          </div>
          <div>
            <div className="f-head">Coverage</div>
            <ul><li><a href="#">Oregon (75 institutions)</a></li><li><a href="#">All states (queued)</a></li><li><a href="#">Program rollups</a></li></ul>
          </div>
          <div>
            <div className="f-head">Methodology</div>
            <ul><li><a href="#">Sources & vintages</a></li><li><a href="#">Suppression rules</a></li><li><a href="#">Earnings cohorts</a></li><li><a href="#">Causal-claim discipline</a></li></ul>
          </div>
          <div>
            <div className="f-head">Elsewhere</div>
            <ul><li><a href="#">RSS</a></li><li><a href="#">Contact</a></li></ul>
          </div>
        </div>
        <div className="f-bot">
          <span className="meta-mono">COLLEGE OUTCOME ANALYST · v0.1 · OREGON · MAY 2026</span>
          <span className="meta-mono">DATA SHIP CADENCE · ANNUAL · NEXT VINTAGE SEPT 2026</span>
        </div>
      </div>
    </footer>
  );
}

// ============================================================
// Crumbs
// ============================================================
function CCrumbs({ items }) {
  return (
    <div className="crumbs wrap">
      {items.map((it, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="sep">/</span>}
          {it.href ? <a href={it.href}>{it.label}</a> : <span className="cur">{it.label}</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

// ============================================================
// Sparkline — small inline trend
// ============================================================
function CSpark({ values, color = "#E6B450", height = 24, width = 120 }) {
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - 2 - ((v - min) / range) * (height - 4);
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{display:"block", width:"100%", height}}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5"/>
    </svg>
  );
}

// ============================================================
// Earnings distribution chart — median + p25/p75 bands across 6/8/10y
// ============================================================
function EarningsBand({ data }) {
  // data: [{horizon: '6y', p25, p50, p75}, ...]
  const W = 540, H = 280;
  const padL = 60, padR = 24, padT = 24, padB = 44;
  const all = data.flatMap(d => [d.p25, d.p50, d.p75]);
  const yMin = Math.floor(Math.min(...all) / 10000) * 10000;
  const yMax = Math.ceil(Math.max(...all) / 10000) * 10000;
  const sx = i => padL + (i / (data.length - 1)) * (W - padL - padR);
  const sy = v => H - padB - ((v - yMin) / (yMax - yMin)) * (H - padT - padB);
  const yTicks = [];
  for (let v = yMin; v <= yMax; v += (yMax - yMin) / 4) yTicks.push(v);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%", height:"auto", display:"block"}}>
      <g stroke="#2A3142" strokeWidth="1">
        {yTicks.map((t,i) => <line key={i} x1={padL} x2={W-padR} y1={sy(t)} y2={sy(t)} strokeDasharray="2 3"/>)}
      </g>
      <line x1={padL} x2={padL} y1={padT} y2={H-padB} stroke="#3A4257"/>
      <line x1={padL} x2={W-padR} y1={H-padB} y2={H-padB} stroke="#3A4257"/>
      {/* p25-p75 band as a polygon */}
      <polygon
        points={[
          ...data.map((d, i) => `${sx(i)},${sy(d.p75)}`),
          ...[...data].reverse().map((d, i) => `${sx(data.length - 1 - i)},${sy(d.p25)}`)
        ].join(" ")}
        fill="#E6B450" fillOpacity="0.18" stroke="none"
      />
      {/* median line */}
      <polyline
        points={data.map((d,i) => `${sx(i)},${sy(d.p50)}`).join(" ")}
        fill="none" stroke="#E6B450" strokeWidth="2.5"
      />
      {/* dots */}
      {data.map((d, i) => (
        <g key={i}>
          <circle cx={sx(i)} cy={sy(d.p50)} r="4" fill="#0E1116" stroke="#E6B450" strokeWidth="2"/>
          <text x={sx(i)} y={sy(d.p50) - 14} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fontWeight="600" fill="#E8ECF2">${(d.p50/1000).toFixed(0)}k</text>
        </g>
      ))}
      {/* x labels */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="11" fill="#8A93A6">
        {data.map((d, i) => <text key={i} x={sx(i)} y={H - padB + 18} textAnchor="middle">{d.horizon} after entry</text>)}
      </g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#8A93A6">
        {yTicks.map((t,i) => <text key={i} x={padL - 8} y={sy(t)+3} textAnchor="end">${(t/1000).toFixed(0)}k</text>)}
      </g>
    </svg>
  );
}

// ============================================================
// Debt-to-earnings ratio bar with threshold
// ============================================================
function DebtRatio({ ratio, threshold = 0.08, label, sub }) {
  const pct = Math.min(ratio, 0.20) / 0.20 * 100;
  const thrPct = threshold / 0.20 * 100;
  const over = ratio > threshold;
  return (
    <div className="dr-card">
      <div className="dr-head">
        <h4>{label}</h4>
        <span className={`pill ${over ? "bad" : "good"}`}>{(ratio*100).toFixed(1)}%</span>
      </div>
      <div className="dr-bar">
        <i style={{ width: `${pct}%`, background: over ? "#C44545" : "#6FCF97" }}/>
        <span className="thr" style={{ left: `${thrPct}%` }} title="Gainful employment threshold">
          <span className="thr-tick"/>
        </span>
      </div>
      <div className="dr-meta">
        <span className="meta-mono">0%</span>
        <span className="meta-mono" style={{position:"absolute", left:`${thrPct}%`, transform:"translateX(-50%)"}}>{(threshold*100).toFixed(0)}% · GAINFUL EMPLOYMENT</span>
        <span className="meta-mono">20%+</span>
      </div>
      <p className="dr-sub">{sub}</p>
    </div>
  );
}

// ============================================================
// Trend line — simple
// ============================================================
function CTrend({ values, color = "#E6B450", height = 80, hi }) {
  const W = 320, H = height;
  const min = Math.min(...values), max = Math.max(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = 8 + (i / (values.length - 1)) * (W - 16);
    const y = H - 8 - ((v - min) / range) * (H - 16);
    return [x, y];
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{display:"block", width:"100%", height:"auto"}}>
      <g stroke="#2A3142" strokeWidth="1">
        {[0.25, 0.5, 0.75].map((p, i) => <line key={i} x1="8" x2={W-8} y1={H*p} y2={H*p} strokeDasharray="2 3"/>)}
      </g>
      <polyline points={pts.map(p => p.join(",")).join(" ")} fill="none" stroke={color} strokeWidth="2"/>
      {hi != null && pts[hi] && (
        <circle cx={pts[hi][0]} cy={pts[hi][1]} r="4" fill={color} stroke="#0E1116" strokeWidth="2"/>
      )}
    </svg>
  );
}

// ============================================================
// Peer scatter — earnings (Y) vs debt (X)
// ============================================================
function PeerScatter({ dots, focusIdx = 0, xLabel = "Median debt at completion", yLabel = "Median earnings (10y)" }) {
  const W = 540, H = 360;
  const padL = 70, padR = 24, padT = 24, padB = 50;
  const xs = dots.map(d => d.x), ys = dots.map(d => d.y);
  const xMin = Math.floor(Math.min(...xs)/5000)*5000;
  const xMax = Math.ceil(Math.max(...xs)/5000)*5000;
  const yMin = Math.floor(Math.min(...ys)/10000)*10000;
  const yMax = Math.ceil(Math.max(...ys)/10000)*10000;
  const sx = v => padL + (v - xMin)/(xMax - xMin) * (W - padL - padR);
  const sy = v => H - padB - (v - yMin)/(yMax - yMin) * (H - padT - padB);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%", height:"auto", display:"block"}}>
      <g stroke="#2A3142" strokeWidth="1">
        {[0,1,2,3,4].map(i => {
          const v = yMin + (yMax-yMin)*i/4;
          return <line key={`y${i}`} x1={padL} x2={W-padR} y1={sy(v)} y2={sy(v)} strokeDasharray="2 3"/>;
        })}
        {[0,1,2,3,4].map(i => {
          const v = xMin + (xMax-xMin)*i/4;
          return <line key={`x${i}`} x1={sx(v)} x2={sx(v)} y1={padT} y2={H-padB} strokeDasharray="2 3"/>;
        })}
      </g>
      <line x1={padL} x2={padL} y1={padT} y2={H-padB} stroke="#3A4257"/>
      <line x1={padL} x2={W-padR} y1={H-padB} y2={H-padB} stroke="#3A4257"/>
      {dots.map((d, i) => i !== focusIdx && (
        <circle key={i} cx={sx(d.x)} cy={sy(d.y)} r="4" fill="#60A5FA" fillOpacity="0.55"/>
      ))}
      {dots[focusIdx] && (
        <g>
          <circle cx={sx(dots[focusIdx].x)} cy={sy(dots[focusIdx].y)} r="9" fill="none" stroke="#E6B450" strokeWidth="2"/>
          <circle cx={sx(dots[focusIdx].x)} cy={sy(dots[focusIdx].y)} r="5" fill="#E6B450" stroke="#0E1116" strokeWidth="1.5"/>
          <text x={sx(dots[focusIdx].x)+12} y={sy(dots[focusIdx].y)+4} fontFamily="Inter, sans-serif" fontSize="12" fontWeight="600" fill="#E6B450">{dots[focusIdx].label}</text>
        </g>
      )}
      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="#8A93A6">
        {[0,1,2,3,4].map(i => {
          const v = yMin + (yMax-yMin)*i/4;
          return <text key={i} x={padL-8} y={sy(v)+3} textAnchor="end">${(v/1000).toFixed(0)}k</text>;
        })}
        {[0,1,2,3,4].map(i => {
          const v = xMin + (xMax-xMin)*i/4;
          return <text key={i} x={sx(v)} y={H-padB+16} textAnchor="middle">${(v/1000).toFixed(0)}k</text>;
        })}
      </g>
      <text x={W/2} y={H-10} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#BFC6D4">{xLabel}</text>
      <text x={16} y={H/2} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="12" fill="#BFC6D4" transform={`rotate(-90 16 ${H/2})`}>{yLabel}</text>
    </svg>
  );
}

window.CollegeMark = CollegeMark;
window.CollegeBrand = CollegeBrand;
window.CollegeHeader = CollegeHeader;
window.CollegeFooter = CollegeFooter;
window.CCrumbs = CCrumbs;
window.CSpark = CSpark;
window.EarningsBand = EarningsBand;
window.DebtRatio = DebtRatio;
window.CTrend = CTrend;
window.PeerScatter = PeerScatter;

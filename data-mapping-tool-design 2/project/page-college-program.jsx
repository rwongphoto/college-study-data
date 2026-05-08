/* global React, CollegeHeader, CollegeFooter, CCrumbs, EarningsBand, DebtRatio, CTrend, PeerScatter, CSpark */

function ProgHero() {
  return (
    <section className="city-header">
      <div className="wrap">
        <div className="eyebrow">CIP 11.0701 · Bachelor of Science · Oregon State University</div>
        <h1>Computer Science</h1>
        <p className="lede" style={{marginTop:18, maxWidth:"62ch"}}>
          Federal outcomes for the bachelor's degree in Computer Science at OSU. 142 students in the most recent earnings cohort. Median earnings 10 years after entry: <strong style={{color:"var(--fg)"}}>$92,400</strong>.
        </p>
        <div className="byline">
          <span className="meta-mono">SCORECARD FIELDOFSTUDYDATA · COHORT 2014 · N=142</span>
          <span className="meta-mono">PEER SET · 24 R1/R2 PUBLICS · 11.07 CIP-4</span>
        </div>
      </div>
    </section>
  );
}

function ProgKeyStats() {
  const tiles = [
    { lbl: "Median earnings · 10y",     num: "$92,400", sub: "OR CS median $84.1k", tone: "good"},
    { lbl: "Median debt · exit",         num: "$21,800", sub: "OSU median $22.5k",  tone: "good"},
    { lbl: "Debt-to-earnings",           num: "2.6%",    sub: "8% threshold",       tone: "good"},
    { lbl: "Completers · most recent",   num: "142",     sub: "fall 2023 graduates", tone: "neutral"},
  ];
  return (
    <section className="section">
      <div className="wrap">
        <div className="data-tiles">
          {tiles.map((t,i) => (
            <div key={i} className="data-tile">
              <span className="meta-mono tile-cat">{t.lbl.toUpperCase()}</span>
              <div className="tile-val"><span className="num">{t.num}</span></div>
              <span className="tile-note">{t.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgEarnings() {
  const data = [
    { horizon: "6y", p25: 62400, p50: 78800, p75: 96400 },
    { horizon: "8y", p25: 71200, p50: 86400, p75: 108200 },
    { horizon: "10y", p25: 78600, p50: 92400, p75: 124100 },
  ];
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">EARNINGS · 6/8/10 YEARS</div>
            <h2>Distribution of CS-at-OSU earnings</h2>
          </div>
          <p className="sec-sub">Median in gold; p25–p75 band shaded. Earnings 10 years after entry are 17% above the Oregon CS median across all institutions.</p>
        </header>
        <div className="figure-frame">
          <div className="fig-head">
            <span className="meta-mono">CS BACHELOR · OSU · ENTRY COHORTS 2012–2014</span>
            <span className="meta-mono">N = 142 · TREASURY TAX RECORDS</span>
          </div>
          <div className="fig-canvas big" style={{padding:"32px 32px 12px"}}>
            <EarningsBand data={data}/>
          </div>
          <div className="fig-foot">
            <span>10-year p75 reaches $124k. Selection: federal aid recipients only — not all CS graduates.</span>
            <a href="#" className="link-mono">Methodology →</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgPeerCompare() {
  // Peer = same CIP-4 across OR (or US) institutions
  const peers = [
    { inst: "Oregon State University",        kind: "R1 public",  earn: 92400, debt: 21800, n: 142, focus: true },
    { inst: "Univ. of Oregon",                kind: "R1 public",  earn: 88600, debt: 22100, n:  84 },
    { inst: "Portland State University",      kind: "R2 public",  earn: 86200, debt: 24400, n: 118 },
    { inst: "Oregon Tech",                    kind: "M1 public",  earn: 84100, debt: 23800, n:  44 },
    { inst: "Reed College",                   kind: "BACC priv.", earn: 82200, debt: 19200, n:  21 },
    { inst: "Lewis & Clark College",          kind: "BACC priv.", earn: 79100, debt: 25700, n:  18 },
    { inst: "Eastern Oregon University",      kind: "M2 public",  earn: 71400, debt: 21800, n:  16 },
    { inst: "Linfield University",            kind: "BACC priv.", earn: 76800, debt: 28900, n:  12 },
  ];
  const max = Math.max(...peers.map(p => p.earn));
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">PEER COMPARISON · CIP 11.0701</div>
            <h2>Computer Science across Oregon institutions</h2>
          </div>
          <p className="sec-sub">Same program (CIP-4 = 11.07), bachelor's level, all Oregon Title-IV institutions where Scorecard publishes outcomes.</p>
        </header>
        <div className="prog-rank">
          {peers.map(p => {
            const w = (p.earn / max) * 100;
            return (
              <div className={`pr-row ${p.focus ? "focus" : ""}`} key={p.inst}>
                <span className="pr-name">{p.inst}</span>
                <span className="meta-mono pr-cip">{p.kind}</span>
                <span className="pr-bar"><i style={{width: `${w}%`, background: p.focus ? "#E6B450" : "#60A5FA"}}/></span>
                <span className="pr-earn">${(p.earn/1000).toFixed(1)}k</span>
                <span className="meta-mono pr-n">N={p.n}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function ProgDebt() {
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">DEBT-TO-EARNINGS</div>
            <h2>What CS debt costs CS earners</h2>
          </div>
          <p className="sec-sub">Annual debt payment as a share of median earnings. The 8% line is the gainful-employment threshold. Below 4% is unusually low — typical of high-earning STEM programs at public flagships.</p>
        </header>
        <div style={{display:"grid", gridTemplateColumns:"repeat(2, 1fr)", gap:"14px"}}>
          <DebtRatio ratio={0.026} threshold={0.08} label="CS at OSU" sub="$2,400 annual debt payment / $92,400 median earnings."/>
          <DebtRatio ratio={0.034} threshold={0.08} label="CS at Oregon (statewide)" sub="Statewide median across all OR CS bachelors programs."/>
        </div>
      </div>
    </section>
  );
}

function ProgFlags() {
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">ANOMALY FLAGS</div>
            <h2>What the data flags</h2>
          </div>
          <p className="sec-sub">Same engine that runs across all 36k program × institution pages. No editorial prose — the flag IS the editorial signal.</p>
        </header>
        <div className="flag-grid">
          <div className="flag-card neutral">
            <div className="flag-row"><span className="meta-mono">EARNINGS SHIFT · +24%</span><span className="num-mono">5Y</span></div>
            <h4>Above state CS baseline</h4>
            <p>5-year median earnings rose 24% — well above the Oregon CS baseline of +11%.</p>
          </div>
          <div className="flag-card neutral">
            <div className="flag-row"><span className="meta-mono">PEER OUTLIER · +1.4σ</span><span className="num-mono">10Y</span></div>
            <h4>Above R1-public peer median</h4>
            <p>Median earnings 1.4σ above the peer-Carnegie median for CIP 11.07 nationwide.</p>
          </div>
          <div className="flag-card neutral">
            <div className="flag-row"><span className="meta-mono">DEBT-EARNINGS · 2.6%</span><span className="num-mono">PASS</span></div>
            <h4>Far below GE threshold</h4>
            <p>Annual debt payment is 2.6% of median earnings, well under the 8% gainful-employment line.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function MethodCallout3() {
  return (
    <section className="section section-tint">
      <div className="wrap">
        <div className="method-promo">
          <div>
            <div className="kicker">SUPPRESSION</div>
            <h3>What's not on this page, and why</h3>
            <p>ED suppresses program-level data when cohort N &lt; 30 to protect privacy. Demographic breakdowns, race/ethnicity earnings, and gender pay gaps are <strong>not</strong> published per program in Scorecard. Earnings exclude graduate degrees attained later — a 10-year-out CS bachelor who went on to law school is still counted as a CS bachelor's outcome.</p>
          </div>
          <a href="#" className="btn btn-primary">Methodology →</a>
        </div>
      </div>
    </section>
  );
}

function CollegeProgramPage() {
  return (
    <div style={{background:"var(--bg)", color:"var(--fg)"}}>
      <CollegeHeader active="state"/>
      <CCrumbs items={[
        {label:"Home", href:"#"},
        {label:"Oregon", href:"#"},
        {label:"Oregon State University", href:"#"},
        {label:"Computer Science"},
      ]}/>
      <ProgHero/>
      <ProgKeyStats/>
      <ProgEarnings/>
      <ProgPeerCompare/>
      <ProgDebt/>
      <ProgFlags/>
      <MethodCallout3/>
      <CollegeFooter/>
    </div>
  );
}
window.CollegeProgramPage = CollegeProgramPage;

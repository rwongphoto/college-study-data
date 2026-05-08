/* global React, CollegeHeader, CollegeFooter, CCrumbs, EarningsBand, DebtRatio, CTrend, PeerScatter, CSpark */

function InstHero() {
  return (
    <section className="city-header">
      <div className="wrap">
        <div className="eyebrow">Oregon · 4-year public · Carnegie R1</div>
        <h1>Oregon State University</h1>
        <p className="lede" style={{marginTop:18, maxWidth:"62ch"}}>
          Land-grant public university in Corvallis. 28,114 students enrolled. 84 undergraduate programs in the federal earnings dataset.
        </p>
        <div className="byline">
          <span className="meta-mono">OPEID 003210 · UNITID 209542 · IPEDS HD2023</span>
          <span className="meta-mono">VINTAGE · SCORECARD SEPT 2024 · ENTRY COHORT 2014</span>
        </div>
      </div>
    </section>
  );
}

function InstStats() {
  const tiles = [
    { lbl: "Median earnings · 10y", num: "$58,400", sub: "OR median $54,200", tone: "good", spark: [44,46,48,50,53,56,58.4] },
    { lbl: "Median debt · exit", num: "$22,500", sub: "OR median $22,800", tone: "neutral", spark: [21,21.5,22,22.3,22.5] },
    { lbl: "Completion · 150%", num: "67.2%", sub: "OR median 63.4%", tone: "good", spark: [60,62,63,65,66,67.2] },
    { lbl: "3-yr cohort default", num: "3.1%", sub: "OR median 5.1%", tone: "good", spark: [4.8,4.2,3.8,3.4,3.1] },
    { lbl: "Retention rate", num: "84.6%", sub: "first-time, full-time", tone: "good", spark: [80,81,82,83,84,84.6] },
    { lbl: "Admit rate", num: "82%", sub: "Fall 2023 cohort", tone: "neutral", spark: [78,79,81,82,82] },
    { lbl: "Net price", num: "$18,400", sub: "after grants, family <$48k", tone: "neutral", spark: [17,17.4,17.8,18.1,18.4] },
    { lbl: "Pell share", num: "31%", sub: "of undergrads", tone: "neutral", spark: [27,28,29,30,31] },
  ];
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 01 · OUTCOMES SNAPSHOT</div>
            <h2>The numbers, vs. Oregon</h2>
          </div>
          <p className="sec-sub">Each tile compares this institution to the Oregon median for the same metric. Sub-line shows the comparison value, not an interpretation.</p>
        </header>
        <div className="data-tiles">
          {tiles.map((t,i) => (
            <div key={i} className="data-tile">
              <span className="meta-mono tile-cat">{t.lbl.toUpperCase()}</span>
              <div className="tile-val"><span className="num">{t.num}</span></div>
              <div className="tile-spark"><CSpark values={t.spark} color={t.tone==="good"?"#6FCF97":t.tone==="bad"?"#C44545":"#E6B450"}/></div>
              <span className="tile-note">{t.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EarningsSection() {
  const data = [
    { horizon: "6y", p25: 32400, p50: 47200, p75: 64800 },
    { horizon: "8y", p25: 38600, p50: 53100, p75: 71400 },
    { horizon: "10y", p25: 42100, p50: 58400, p75: 78600 },
  ];
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 02 · EARNINGS HORIZONS</div>
            <h2>How earnings spread, 6 to 10 years after entry</h2>
          </div>
          <p className="sec-sub">Median in gold; 25th–75th percentile band shaded. Treasury tax-record earnings for federally aided students who first enrolled 6, 8, and 10 years before measurement.</p>
        </header>
        <div className="figure-frame">
          <div className="fig-head">
            <span className="meta-mono">ALL COMPLETERS · TAX-RECORD EARNINGS</span>
            <span className="meta-mono">N = 18,400 · COHORT 2014</span>
          </div>
          <div className="fig-canvas big" style={{padding:"32px 32px 12px"}}>
            <EarningsBand data={data}/>
          </div>
          <div className="fig-foot">
            <span>Earnings widen with time post-entry, as expected. The 75th percentile rises faster than the median.</span>
            <a href="#" className="link-mono">Methodology →</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function DebtSection() {
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 03 · DEBT-TO-EARNINGS</div>
            <h2>What loans cost relative to earnings</h2>
          </div>
          <p className="sec-sub">Annual debt payment as a share of median earnings. The 8% line is the gainful-employment threshold from federal regulation. Above 12% is considered a "failing" program under prior rule cycles.</p>
        </header>
        <div style={{display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"14px"}}>
          <DebtRatio ratio={0.054} threshold={0.08} label="Institution-wide" sub="Comfortably below the gainful-employment threshold."/>
          <DebtRatio ratio={0.038} threshold={0.08} label="STEM programs" sub="Engineering & CS pull the institution-wide ratio down."/>
          <DebtRatio ratio={0.094} threshold={0.08} label="Humanities (median)" sub="Above the 8% threshold — driven by lower earnings, not higher debt."/>
        </div>
      </div>
    </section>
  );
}

function CompletionSection() {
  const completion = [58, 60, 61, 62, 63, 64, 65, 66, 67, 67.2];
  const defaults = [4.8, 4.5, 4.4, 4.2, 4.0, 3.8, 3.6, 3.4, 3.2, 3.1];
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 04 · COMPLETION & DEFAULT</div>
            <h2>Ten-year arc</h2>
          </div>
          <p className="sec-sub">Completion at 150% of normal time (IPEDS GR). 3-year cohort default rate (CDR). Both improving steadily.</p>
        </header>
        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px"}}>
          <div className="figure-frame">
            <div className="fig-head">
              <span className="meta-mono">COMPLETION RATE · 2014–2024</span>
              <span className="meta-mono">+9.2pp · 10Y</span>
            </div>
            <div className="fig-canvas"><CTrend values={completion} color="#6FCF97" hi={9}/></div>
            <div className="fig-foot">
              <span>67.2% of first-time full-time freshmen complete within 6 years.</span>
              <a href="#" className="link-mono">IPEDS GR →</a>
            </div>
          </div>
          <div className="figure-frame">
            <div className="fig-head">
              <span className="meta-mono">3-YR COHORT DEFAULT · 2015–2024</span>
              <span className="meta-mono">−1.7pp · 10Y</span>
            </div>
            <div className="fig-canvas"><CTrend values={defaults} color="#6FCF97" hi={9}/></div>
            <div className="fig-foot">
              <span>3.1%, vs. Oregon median 5.1%.</span>
              <a href="#" className="link-mono">CDR →</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PeerSection() {
  const dots = [
    { x: 22500, y: 58400, label: "Oregon State" },
    { x: 22100, y: 54900 },
    { x: 24600, y: 53200 },
    { x: 19200, y: 48900 },
    { x: 25700, y: 51200 },
    { x: 38200, y: 96400 },
    { x: 22900, y: 44800 },
    { x: 21800, y: 41600 },
    { x: 28900, y: 50400 },
    { x: 27100, y: 52800 },
    { x: 30100, y: 44200 },
    { x: 19800, y: 42400 },
    { x: 26200, y: 47100 },
    { x: 31200, y: 49800 },
    { x: 23100, y: 46200 },
    { x: 24800, y: 50100 },
  ];
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 05 · PEER COMPARISON</div>
            <h2>Where Oregon State sits among peers</h2>
          </div>
          <p className="sec-sub">Oregon Title-IV institutions, 4-year. X-axis: median debt at completion. Y-axis: median earnings 10 years after entry. Up and to the left is the desirable corner.</p>
        </header>
        <div className="figure-frame">
          <div className="fig-head">
            <span className="meta-mono">N = 16 · 4YR · OREGON</span>
            <span className="meta-mono">CARNEGIE: R1, R2, M1, M2, BACC</span>
          </div>
          <div className="fig-canvas big" style={{padding:"32px 32px 12px"}}>
            <PeerScatter dots={dots} focusIdx={0}/>
          </div>
          <div className="fig-foot">
            <span>Top quartile earnings, lower-than-median debt. OHSU sits off-chart at $96k earnings (medical/health graduate-heavy).</span>
            <a href="#" className="link-mono">Methodology →</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProgramRanking() {
  const progs = [
    { name: "Computer Science",                cip: "11.0701", earn: 92400, n: 142, debt: 21800 },
    { name: "Electrical Engineering",          cip: "14.1001", earn: 89100, n: 84,  debt: 22400 },
    { name: "Chemical Engineering",            cip: "14.0701", earn: 86700, n: 41,  debt: 22100 },
    { name: "Mechanical Engineering",          cip: "14.1901", earn: 78600, n: 116, debt: 22600 },
    { name: "Pharmacy",                        cip: "51.2001", earn: 102400, n: 58, debt: 84200 },
    { name: "Business Administration",         cip: "52.0201", earn: 62100, n: 320, debt: 23100 },
    { name: "Biology",                         cip: "26.0101", earn: 51400, n: 218, debt: 22900 },
    { name: "Psychology",                      cip: "42.0101", earn: 42400, n: 188, debt: 22700 },
    { name: "Liberal Arts & Sciences",         cip: "24.0101", earn: 43800, n: 92,  debt: 22500 },
    { name: "Communication Studies",           cip: "09.0101", earn: 47600, n: 102, debt: 22800 },
    { name: "English Language & Literature",   cip: "23.0101", earn: 39900, n: 64,  debt: 22600 },
    { name: "Fine Arts",                       cip: "50.0701", earn: 36800, n: 38,  debt: 23400 },
  ];
  const max = Math.max(...progs.map(p => p.earn));
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 06 · PROGRAMS AT THIS INSTITUTION</div>
            <h2>Ranked by 10-year earnings</h2>
          </div>
          <p className="sec-sub">Bachelor's degrees only. Cohort floor: 30 students. Programs below this are suppressed by ED. Click any row for the program × institution page.</p>
        </header>
        <div className="prog-rank">
          {progs.map(p => {
            const w = (p.earn / max) * 100;
            return (
              <a className="pr-row" href="#" key={p.cip}>
                <span className="pr-name">{p.name}</span>
                <span className="meta-mono pr-cip">CIP {p.cip}</span>
                <span className="pr-bar"><i style={{width: `${w}%`}}/></span>
                <span className="pr-earn">${(p.earn/1000).toFixed(1)}k</span>
                <span className="meta-mono pr-n">N={p.n}</span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MethodCallout2() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="method-promo">
          <div>
            <div className="kicker">CAUSAL DISCIPLINE</div>
            <h3>"OSU graduates earn $X" — not "OSU makes you earn $X"</h3>
            <p>Median earnings describe what cohorts earned. They do not describe what attending OSU caused. Selection effects (who admits, who enrolls, who completes) are real. We publish federal data with strict descriptive phrasing — and link the methodology where you can read about the limitations directly.</p>
          </div>
          <a href="#" className="btn btn-primary">Methodology →</a>
        </div>
      </div>
    </section>
  );
}

function CollegeInstitutionPage() {
  return (
    <div style={{background:"var(--bg)", color:"var(--fg)"}}>
      <CollegeHeader active="state"/>
      <CCrumbs items={[{label:"Home", href:"#"},{label:"States", href:"#"},{label:"Oregon", href:"#"},{label:"Oregon State University"}]}/>
      <InstHero/>
      <InstStats/>
      <EarningsSection/>
      <DebtSection/>
      <CompletionSection/>
      <PeerSection/>
      <ProgramRanking/>
      <MethodCallout2/>
      <CollegeFooter/>
    </div>
  );
}
window.CollegeInstitutionPage = CollegeInstitutionPage;

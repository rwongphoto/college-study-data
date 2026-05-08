/* global React, CollegeHeader, CollegeFooter, CCrumbs, CSpark */

function StateHero() {
  return (
    <section className="city-header">
      <div className="wrap">
        <div className="eyebrow">State hub · Oregon · vintage 2024</div>
        <h1>What an Oregon degree is actually worth</h1>
        <p className="lede" style={{ marginTop: 18, maxWidth: "62ch" }}>
          Earnings, debt, completion, and default rates for every Title-IV institution in Oregon — and every program where federal data is published. Sourced from College Scorecard, IPEDS, and Treasury tax records.
        </p>
        <div className="byline">
          <span className="meta-mono">75 INSTITUTIONS · 1,284 PROGRAMS · 6/8/10Y EARNINGS HORIZONS</span>
          <span className="meta-mono">VINTAGE · COLLEGE SCORECARD SEPT 2024 · IPEDS HD2023</span>
        </div>
      </div>
    </section>
  );
}

function StateTiles() {
  const tiles = [
    { lbl: "Institutions", num: "75", sub: "Title-IV eligible", spark: [62,64,68,70,72,73,75,75], color: "#E6B450" },
    { lbl: "Programs (CIP-4)", num: "1,284", sub: "with published outcomes", spark: [800,920,1010,1100,1180,1240,1284], color: "#60A5FA" },
    { lbl: "Median earnings · 10y", num: "$54,200", sub: "all completers, 2024 cohort", spark: [44,46,48,49,51,52,54], color: "#6FCF97" },
    { lbl: "Median debt at exit", num: "$22,800", sub: "Title-IV completers", spark: [21,21.5,22,22.4,22.6,22.8], color: "#E6B450" },
    { lbl: "Completion rate", num: "63.4%", sub: "150% of normal time", spark: [58,59,60,61,62,63,63.4], color: "#6FCF97" },
    { lbl: "3-yr cohort default", num: "5.1%", sub: "all institutions, weighted", spark: [9.2,8.4,7.6,6.8,5.9,5.1], color: "#6FCF97" },
  ];
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 01 · STATE OVERVIEW</div>
            <h2>The numbers</h2>
          </div>
          <p className="sec-sub">All figures are statewide aggregates across Oregon Title-IV institutions. Earnings are 10 years post-entry, computed by Treasury tax records on federally aided students.</p>
        </header>
        <div className="data-tiles" style={{gridTemplateColumns: "repeat(3, 1fr)"}}>
          {tiles.map((t,i) => (
            <a key={i} className="data-tile" href="#">
              <span className="meta-mono tile-cat">{t.lbl.toUpperCase()}</span>
              <div className="tile-val"><span className="num">{t.num}</span></div>
              <div className="tile-spark"><CSpark values={t.spark} color={t.color}/></div>
              <span className="tile-note">{t.sub}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function InstitutionList() {
  const rows = [
    { name: "Oregon State University",      kind: "4yr · public",  city: "Corvallis",   enroll: 28114, earn: 58400, debt: 22500, comp: 67, def: 3.1 },
    { name: "University of Oregon",          kind: "4yr · public",  city: "Eugene",      enroll: 22376, earn: 54900, debt: 22100, comp: 75, def: 2.8 },
    { name: "Portland State University",     kind: "4yr · public",  city: "Portland",    enroll: 21320, earn: 53200, debt: 24600, comp: 51, def: 4.4 },
    { name: "Reed College",                  kind: "4yr · private", city: "Portland",    enroll:  1432, earn: 48900, debt: 19200, comp: 81, def: 1.4 },
    { name: "Lewis & Clark College",         kind: "4yr · private", city: "Portland",    enroll:  3380, earn: 51200, debt: 25700, comp: 76, def: 2.0 },
    { name: "Oregon Health & Science U.",    kind: "4yr · public",  city: "Portland",    enroll:  3115, earn: 96400, debt: 38200, comp: 88, def: 1.1 },
    { name: "Southern Oregon University",    kind: "4yr · public",  city: "Ashland",     enroll:  4620, earn: 44800, debt: 22900, comp: 49, def: 5.4 },
    { name: "Eastern Oregon University",     kind: "4yr · public",  city: "La Grande",   enroll:  3018, earn: 41600, debt: 21800, comp: 47, def: 5.8 },
    { name: "Linfield University",           kind: "4yr · private", city: "McMinnville", enroll:  2104, earn: 50400, debt: 28900, comp: 71, def: 2.3 },
    { name: "Willamette University",         kind: "4yr · private", city: "Salem",       enroll:  2316, earn: 52800, debt: 27100, comp: 73, def: 2.0 },
    { name: "Portland Community College",    kind: "2yr · public",  city: "Portland",    enroll: 39800, earn: 38400, debt:  9200, comp: 28, def: 8.6 },
    { name: "Lane Community College",        kind: "2yr · public",  city: "Eugene",      enroll: 14200, earn: 36900, debt:  8800, comp: 31, def: 9.1 },
  ];
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 02 · INSTITUTIONS</div>
            <h2>All 75, ranked by 10-year earnings</h2>
          </div>
          <p className="sec-sub">Sortable. Click any row for the full institution page. Heat-shading is within-table percentile, by column.</p>
        </header>
        <div className="rank-table">
          <div className="rt-th">
            <span>INSTITUTION</span>
            <span>SECTOR / CITY</span>
            <span className="r">ENROLL</span>
            <span className="r">EARN 10Y</span>
            <span className="r">DEBT</span>
            <span className="r">COMP %</span>
            <span className="r">CDR</span>
          </div>
          {rows.map((r, i) => (
            <a className="rt-tr" href="#" key={i}>
              <span className="nbhd">{r.name}</span>
              <span className="num-mono">{r.kind} · {r.city}</span>
              <span className="r heat">{r.enroll.toLocaleString()}</span>
              <span className="r heat" style={{background: r.earn>50000 ? "rgba(111,207,151,0.18)" : "rgba(196,69,69,0.12)"}}>${(r.earn/1000).toFixed(1)}k</span>
              <span className="r heat" style={{background: r.debt<23000 ? "rgba(111,207,151,0.15)" : "rgba(196,69,69,0.15)"}}>${(r.debt/1000).toFixed(1)}k</span>
              <span className="r heat" style={{background: r.comp>65 ? "rgba(111,207,151,0.18)" : r.comp<50 ? "rgba(196,69,69,0.18)" : "rgba(230,180,80,0.15)"}}>{r.comp}%</span>
              <span className="r heat" style={{background: r.def<3 ? "rgba(111,207,151,0.18)" : r.def>6 ? "rgba(196,69,69,0.20)" : "rgba(230,180,80,0.15)"}}>{r.def.toFixed(1)}%</span>
            </a>
          ))}
        </div>
        <div className="rt-foot">
          <span>Showing 12 of 75. Filters: sector · level · region.</span>
          <a href="#" className="link-mono">See all 75 →</a>
        </div>
      </div>
    </section>
  );
}

function TopPrograms() {
  const programs = [
    { cip: "26.0101", name: "Biology, General",                     bach: 78, earn10: 62100 },
    { cip: "11.0701", name: "Computer Science",                      bach: 41, earn10: 89400 },
    { cip: "14.1001", name: "Electrical Engineering",                bach: 22, earn10: 91200 },
    { cip: "51.3801", name: "Registered Nursing",                    asoc: 38, earn10: 78600 },
    { cip: "52.0201", name: "Business Administration",               bach: 84, earn10: 60400 },
    { cip: "13.1202", name: "Elementary Education",                  bach: 31, earn10: 44200 },
    { cip: "42.0101", name: "Psychology, General",                   bach: 56, earn10: 41800 },
    { cip: "23.0101", name: "English Language & Literature",         bach: 24, earn10: 39200 },
    { cip: "50.0701", name: "Fine Arts, General",                    bach: 18, earn10: 36400 },
    { cip: "09.0101", name: "Communication Studies",                 bach: 27, earn10: 47100 },
  ];
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 03 · PROGRAMS</div>
            <h2>Top programs by earnings · Oregon, 4-year bachelors</h2>
          </div>
          <p className="sec-sub">Median earnings 10 years after entry, weighted across all institutions offering the program. Cohort floor: 30 students. Programs below this threshold are suppressed by ED.</p>
        </header>
        <div className="prog-grid">
          {programs.map(p => (
            <a key={p.cip} className="prog-card" href="#">
              <div className="prog-head">
                <span className="meta-mono">CIP {p.cip}</span>
                <span className="prog-num">${(p.earn10/1000).toFixed(1)}k</span>
              </div>
              <h4>{p.name}</h4>
              <div className="prog-meta">
                <span>Offered at <strong>{p.bach || p.asoc}</strong> {p.bach ? "OR institutions (bachelors)" : "OR institutions (associates)"}</span>
              </div>
              <div className="prog-bar"><i style={{width: `${Math.min(p.earn10/100000*100, 100)}%`}}/></div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function FlagsCallout() {
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 04 · WATCH LIST</div>
            <h2>Where the data flags something</h2>
          </div>
          <p className="sec-sub">Anomaly engine surfaces year-over-year shifts. Each flag links to the institution page. No editorial prose — the flag IS the editorial signal.</p>
        </header>
        <div className="flag-grid">
          <a className="flag-card warn" href="#">
            <div className="flag-row"><span className="meta-mono">DEBT–EARNINGS WARNING</span><span className="num-mono">12.4%</span></div>
            <h4>Cosmetology · Phagans School of Hair Design</h4>
            <p>Annual debt payment exceeds 8% of median earnings — gainful-employment threshold breached.</p>
          </a>
          <a className="flag-card warn" href="#">
            <div className="flag-row"><span className="meta-mono">PEER OUTLIER · −2.1σ</span><span className="num-mono">$32k</span></div>
            <h4>Business Admin · Eastern Oregon University</h4>
            <p>Median earnings 10y are 2.1σ below the peer-Carnegie median for this CIP. Cohort N=84.</p>
          </a>
          <a className="flag-card neutral" href="#">
            <div className="flag-row"><span className="meta-mono">EARNINGS SHIFT</span><span className="num-mono">+24%</span></div>
            <h4>Computer Science · Portland State</h4>
            <p>5-year median earnings rose 24% — well above the state CS baseline of +11%.</p>
          </a>
          <a className="flag-card warn" href="#">
            <div className="flag-row"><span className="meta-mono">COMPLETION DROP · −12pp</span><span className="num-mono">38%</span></div>
            <h4>Southern Oregon University · institution-wide</h4>
            <p>150%-of-normal completion fell 12 percentage points vs. 5-year baseline. IPEDS GR.</p>
          </a>
          <a className="flag-card warn" href="#">
            <div className="flag-row"><span className="meta-mono">DEFAULT STEP · +6.4pp</span><span className="num-mono">14.2%</span></div>
            <h4>Lane Community College</h4>
            <p>3-yr cohort default rose 6.4pp YoY. Above floor of 8%.</p>
          </a>
          <a className="flag-card neutral" href="#">
            <div className="flag-row"><span className="meta-mono">ENROLLMENT CLIFF</span><span className="num-mono">−18%</span></div>
            <h4>Pioneer Pacific College</h4>
            <p>Enrollment down 18% YoY. IPEDS EF Fall 2024.</p>
          </a>
        </div>
      </div>
    </section>
  );
}

function MethodCallout() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="method-promo">
          <div>
            <div className="kicker">METHODOLOGY</div>
            <h3>What these numbers are — and aren't</h3>
            <p>Earnings are <strong>median tax-record earnings</strong> for federally aided students, 6/8/10 years after first enrollment. They describe cohorts who entered ~2014–2018. They are <em>not</em> "what graduates earn" — they include non-completers and out-of-state movers. Selection bias is real: high-earning programs may attract higher-earning students. We surface descriptive numbers, not causal claims.</p>
          </div>
          <a href="#" className="btn btn-primary">Read full methodology →</a>
        </div>
      </div>
    </section>
  );
}

function CollegeStatePage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <CollegeHeader active="state"/>
      <CCrumbs items={[{label:"Home", href:"#"}, {label:"States", href:"#"}, {label:"Oregon"}]}/>
      <StateHero/>
      <StateTiles/>
      <InstitutionList/>
      <TopPrograms/>
      <FlagsCallout/>
      <MethodCallout/>
      <CollegeFooter/>
    </div>
  );
}
window.CollegeStatePage = CollegeStatePage;

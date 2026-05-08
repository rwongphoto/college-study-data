/* global React, CollegeHeader, CollegeFooter, CSpark, CTrend */

function CHomeHero() {
  return (
    <section className="home-hero">
      <div className="wrap">
        <div className="hh-grid">
          <div className="hh-copy">
            <div className="eyebrow">Federal data · independently surfaced</div>
            <h1>The numbers schools don't put on the brochure.</h1>
            <p className="lede">
              Earnings, debt, completion, and default — for every Title-IV institution and every program where the federal government publishes outcomes. Sourced from the College Scorecard, IPEDS, and Treasury tax records. Updated annually.
            </p>
            <div className="hh-ctas">
              <a className="btn btn-primary" href="#">Open the Oregon hub →</a>
              <a className="btn btn-ghost" href="#">Read methodology</a>
            </div>
            <div className="hh-stats">
              <div><span className="num">75</span><span className="meta-mono">OR INSTITUTIONS</span></div>
              <div><span className="num">1,284</span><span className="meta-mono">PROGRAMS (CIP-4)</span></div>
              <div><span className="num">3</span><span className="meta-mono">EARNINGS HORIZONS · 6/8/10Y</span></div>
              <div><span className="num">2024</span><span className="meta-mono">VINTAGE · ANNUAL SHIP</span></div>
            </div>
          </div>
          <aside className="hh-card">
            <div className="hhc-tag">
              <span className="meta-mono">FEATURED · OREGON</span>
              <span className="hhc-pulse"><i/> LIVE</span>
            </div>
            <div className="hhc-headline">Median 10-year earnings, by sector</div>
            <ul className="hhc-rows">
              <li>
                <span className="hhc-name">4-year public</span>
                <span className="hhc-bar"><i style={{width:"68%", background:"#6FCF97"}}/></span>
                <span className="num-mono">$56.4k</span>
              </li>
              <li>
                <span className="hhc-name">4-year private</span>
                <span className="hhc-bar"><i style={{width:"62%", background:"#6FCF97"}}/></span>
                <span className="num-mono">$51.1k</span>
              </li>
              <li>
                <span className="hhc-name">2-year public</span>
                <span className="hhc-bar"><i style={{width:"45%", background:"#E6B450"}}/></span>
                <span className="num-mono">$37.6k</span>
              </li>
              <li>
                <span className="hhc-name">For-profit</span>
                <span className="hhc-bar"><i style={{width:"38%", background:"#C44545"}}/></span>
                <span className="num-mono">$31.8k</span>
              </li>
            </ul>
            <div className="hhc-foot">
              <span className="meta-mono">SOURCE · COLLEGE SCORECARD 2024</span>
              <a className="link-mono" href="#">See all 75 →</a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function CHomeWhat() {
  const items = [
    {
      kicker: "BY INSTITUTION",
      title: "Every Title-IV school in the state.",
      body: "Median earnings at 6/8/10 years after entry. Median debt at exit. Cohort default. 150%-time completion. Net price. Pell share.",
      link: "Browse Oregon →"
    },
    {
      kicker: "BY PROGRAM",
      title: "What a major is actually worth, where.",
      body: "CIP-4 program outcomes per institution. Compare CS at OSU to CS at PSU. Same federal data, same horizon, same suppression rules.",
      link: "Browse programs →"
    },
    {
      kicker: "BY ROLLUP",
      title: "Programs across the state.",
      body: "Computer Science across all 24 Oregon institutions that offer it. Earnings range, debt range, where the cohort is largest.",
      link: "See rollups →"
    },
  ];
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 01 · WHAT'S HERE</div>
            <h2>Three ways in.</h2>
          </div>
          <p className="sec-sub">Same data, three lenses. Pick the one that matches your question — institution, program at an institution, or program across the state.</p>
        </header>
        <div className="lens-grid">
          {items.map((it, i) => (
            <a key={i} className="lens-card" href="#">
              <div className="lens-num">0{i+1}</div>
              <div className="meta-mono">{it.kicker}</div>
              <h3>{it.title}</h3>
              <p>{it.body}</p>
              <span className="link-mono">{it.link}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function CHomeFlags() {
  const flags = [
    { kind:"warn", k:"DEBT–EARNINGS WARNING", num:"12.4%", title:"Cosmetology · Phagans School of Hair Design", body:"Annual debt payment exceeds 8% of median earnings.", trend:[7.8,8.6,9.2,10.1,11.4,12.4] },
    { kind:"warn", k:"PEER OUTLIER · −2.1σ", num:"$32k", title:"Business Admin · Eastern Oregon University", body:"10-year median earnings 2.1σ below peer-Carnegie median.", trend:[42,40,38,35,33,32] },
    { kind:"good", k:"EARNINGS SHIFT", num:"+24%", title:"Computer Science · Portland State", body:"5-year median earnings rose 24% — vs. state CS baseline of +11%.", trend:[68,72,76,80,86,89] },
    { kind:"warn", k:"COMPLETION DROP · −12pp", num:"38%", title:"Southern Oregon University", body:"150%-of-normal completion fell 12pp vs. 5-year baseline.", trend:[50,49,48,46,42,38] },
  ];
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 02 · WATCH LIST</div>
            <h2>Where the data is flagging something.</h2>
          </div>
          <p className="sec-sub">Anomaly detection runs on every annual data ship — debt-to-earnings ratios, peer-outlier earnings, year-over-year shifts in completion and default. The flag is the signal; no editorial prose required.</p>
        </header>
        <div className="hflag-grid">
          {flags.map((f, i) => (
            <a key={i} className={`hflag-card ${f.kind}`} href="#">
              <div className="hflag-top">
                <span className="meta-mono">{f.k}</span>
                <span className="num-mono">{f.num}</span>
              </div>
              <h4>{f.title}</h4>
              <p>{f.body}</p>
              <div className="hflag-spark">
                <CSpark values={f.trend} color={f.kind==="warn" ? "#C44545" : "#6FCF97"} height={32}/>
              </div>
            </a>
          ))}
        </div>
        <div className="rt-foot">
          <span>27 active flags across Oregon institutions. Filter on the state hub.</span>
          <a href="#" className="link-mono">All flags →</a>
        </div>
      </div>
    </section>
  );
}

function CHomePrograms() {
  const programs = [
    { cip:"11.0701", name:"Computer Science",          earn:89, n:24 },
    { cip:"14.1001", name:"Electrical Engineering",    earn:91, n:6  },
    { cip:"51.3801", name:"Registered Nursing",        earn:78, n:18 },
    { cip:"52.0201", name:"Business Administration",   earn:60, n:42 },
    { cip:"26.0101", name:"Biology, General",          earn:62, n:21 },
    { cip:"42.0101", name:"Psychology, General",       earn:41, n:28 },
  ];
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 03 · PROGRAM SPOTLIGHT</div>
            <h2>Top programs in Oregon, by 10-year earnings.</h2>
          </div>
          <p className="sec-sub">Cohort-weighted across every institution offering each program. Suppression floor: 30 students per cohort.</p>
        </header>
        <div className="prog-spotlight">
          {programs.map(p => (
            <a key={p.cip} className="ps-row" href="#">
              <span className="meta-mono">CIP {p.cip}</span>
              <span className="ps-name">{p.name}</span>
              <span className="ps-bar"><i style={{width: `${(p.earn/100)*100}%`}}/></span>
              <span className="num-mono">${p.earn}k</span>
              <span className="meta-mono ps-n">{p.n} INST.</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function CHomeMethod() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="method-promo">
          <div>
            <div className="kicker">METHODOLOGY · THE SHORT VERSION</div>
            <h3>Descriptive numbers. Not causal claims.</h3>
            <p>
              Earnings are <strong>median tax-record earnings</strong> for federally aided students, 6/8/10 years after first enrollment. The cohort includes non-completers and people who left the state. Selection bias is real — high-earning programs often attract higher-earning students. We publish the federal data as it is, with the caveats it deserves. We don't tell you which school to go to.
            </p>
          </div>
          <a href="#" className="btn btn-primary">Full methodology →</a>
        </div>
      </div>
    </section>
  );
}

function CHomeCoverage() {
  const states = [
    { code:"OR", name:"Oregon",     status:"live",   n:"75 institutions" },
    { code:"CA", name:"California", status:"queued", n:"PHASE 2 · Q3 2026" },
    { code:"WA", name:"Washington", status:"queued", n:"PHASE 2 · Q3 2026" },
    { code:"NV", name:"Nevada",     status:"queued", n:"PHASE 2 · Q4 2026" },
    { code:"ID", name:"Idaho",      status:"queued", n:"PHASE 2 · Q4 2026" },
    { code:"+45", name:"All other states", status:"phase3", n:"PHASE 3 · 2027" },
  ];
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 04 · COVERAGE</div>
            <h2>Oregon now. Other states next.</h2>
          </div>
          <p className="sec-sub">Federal data covers all 50 states, but each state's institutions need vetting against IPEDS and local accreditor records before we publish. Oregon is live; the rest are queued.</p>
        </header>
        <div className="cov-grid">
          {states.map((s, i) => (
            <div key={i} className={`cov-card ${s.status}`}>
              <div className="cov-code">{s.code}</div>
              <div className="cov-meta">
                <div className="cov-name">{s.name}</div>
                <div className="meta-mono">{s.n}</div>
              </div>
              <div className={`cov-pill ${s.status}`}>
                {s.status === "live" ? "● LIVE" : s.status === "queued" ? "○ QUEUED" : "○ ROADMAP"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CHomeCTA() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="hcta">
          <div className="hcta-l">
            <div className="kicker">START HERE</div>
            <h2>Open the Oregon hub.</h2>
            <p>Every Title-IV institution. Every published program. Sortable, filterable, with the flags surfaced.</p>
          </div>
          <div className="hcta-r">
            <a className="btn btn-primary" href="#">Oregon hub →</a>
            <a className="btn btn-ghost" href="#">Browse programs</a>
            <span className="meta-mono" style={{color:"var(--fg-4)"}}>NEXT VINTAGE · SEPT 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CollegeHomePage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <CollegeHeader active="home"/>
      <CHomeHero/>
      <CHomeWhat/>
      <CHomeFlags/>
      <CHomePrograms/>
      <CHomeCoverage/>
      <CHomeMethod/>
      <CHomeCTA/>
      <CollegeFooter/>
    </div>
  );
}
window.CollegeHomePage = CollegeHomePage;

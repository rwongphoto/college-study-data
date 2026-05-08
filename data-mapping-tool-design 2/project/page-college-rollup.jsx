/* global React, CollegeHeader, CollegeFooter, CCrumbs, CSpark, CTrend */

function RollupHero() {
  return (
    <section className="city-header">
      <div className="wrap">
        <div className="eyebrow">Cross-cut · CIP 11.07 · Computer Science · Oregon</div>
        <h1>What a CS degree is worth in Oregon</h1>
        <p className="lede" style={{marginTop:18, maxWidth:"62ch"}}>
          Eight Oregon institutions publish federal earnings outcomes for bachelor's-level Computer Science. Together they enrolled 1,142 students in the most recent reporting year.
        </p>
        <div className="byline">
          <span className="meta-mono">8 INSTITUTIONS · 1,142 ANNUAL COMPLETERS · MEDIAN EARN $84,100 · 10Y</span>
          <span className="meta-mono">CIP 11.07 · BACHELOR'S · COHORT 2014 · SCORECARD VINTAGE 2024</span>
        </div>
      </div>
    </section>
  );
}

function RollupTiles() {
  const tiles = [
    { lbl: "Statewide median · 10y", num: "$84,100", sub: "OR CS bachelors", spark: [62,68,72,76,80,82,84.1] },
    { lbl: "Highest median",          num: "$92.4k", sub: "Oregon State Univ.", spark: [70,75,80,84,88,90,92.4] },
    { lbl: "Lowest median",           num: "$71.4k", sub: "Eastern Oregon Univ.", spark: [56,60,63,66,68,70,71.4] },
    { lbl: "Median debt at exit",     num: "$22,400", sub: "OR CS bachelors", spark: [21,21.4,21.8,22,22.2,22.4] },
    { lbl: "Debt-earnings ratio",     num: "3.4%",   sub: "well under 8%", spark: [4.4,4.1,3.9,3.7,3.5,3.4] },
    { lbl: "Completers · 5yr trend",  num: "+38%",   sub: "1,142 in 2024 vs. 828 in 2019", spark: [828,910,980,1040,1100,1142] },
  ];
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 01 · STATEWIDE</div>
            <h2>The CS-in-Oregon picture</h2>
          </div>
          <p className="sec-sub">Aggregates across all eight Oregon institutions reporting bachelor's CS outcomes. Weighted by completer count.</p>
        </header>
        <div className="data-tiles" style={{gridTemplateColumns:"repeat(3, 1fr)"}}>
          {tiles.map((t,i) => (
            <div key={i} className="data-tile">
              <span className="meta-mono tile-cat">{t.lbl.toUpperCase()}</span>
              <div className="tile-val"><span className="num">{t.num}</span></div>
              <div className="tile-spark"><CSpark values={t.spark} color="#E6B450"/></div>
              <span className="tile-note">{t.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RollupTable() {
  const rows = [
    { inst:"Oregon State University", kind:"R1 public", earn:92400, debt:21800, n:142, dte:2.6, comp:67 },
    { inst:"University of Oregon",     kind:"R1 public", earn:88600, debt:22100, n: 84, dte:2.7, comp:75 },
    { inst:"Portland State University", kind:"R2 public", earn:86200, debt:24400, n:118, dte:3.0, comp:51 },
    { inst:"Oregon Tech",               kind:"M1 public", earn:84100, debt:23800, n: 44, dte:3.0, comp:46 },
    { inst:"Reed College",              kind:"BACC priv.", earn:82200, debt:19200, n: 21, dte:2.5, comp:81 },
    { inst:"Lewis & Clark College",     kind:"BACC priv.", earn:79100, debt:25700, n: 18, dte:3.5, comp:76 },
    { inst:"Linfield University",       kind:"BACC priv.", earn:76800, debt:28900, n: 12, dte:4.0, comp:71 },
    { inst:"Eastern Oregon University", kind:"M2 public", earn:71400, debt:21800, n: 16, dte:3.3, comp:47 },
  ];
  const heat = (v, all, invert=false) => {
    const min = Math.min(...all), max = Math.max(...all);
    const t = (v - min) / (max - min || 1);
    const tt = invert ? 1 - t : t;
    return tt > 0.66 ? "rgba(111,207,151,0.18)" : tt < 0.33 ? "rgba(196,69,69,0.16)" : "rgba(230,180,80,0.14)";
  };
  const earns = rows.map(r=>r.earn), debts = rows.map(r=>r.debt), comps = rows.map(r=>r.comp), dtes = rows.map(r=>r.dte);
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 02 · INSTITUTIONS COMPARED</div>
            <h2>Eight Oregon CS programs, one table</h2>
          </div>
          <p className="sec-sub">Sortable. Heat-shaded by within-table percentile. Click any row for the program × institution page.</p>
        </header>
        <div className="rank-table">
          <div className="rt-th">
            <span>INSTITUTION</span>
            <span>SECTOR</span>
            <span className="r">EARN 10Y</span>
            <span className="r">DEBT</span>
            <span className="r">D/E</span>
            <span className="r">COMP %</span>
            <span className="r">N</span>
          </div>
          {rows.map(r => (
            <a className="rt-tr" href="#" key={r.inst}>
              <span className="nbhd">{r.inst}</span>
              <span className="num-mono">{r.kind}</span>
              <span className="r heat" style={{background: heat(r.earn, earns)}}>${(r.earn/1000).toFixed(1)}k</span>
              <span className="r heat" style={{background: heat(r.debt, debts, true)}}>${(r.debt/1000).toFixed(1)}k</span>
              <span className="r heat" style={{background: heat(r.dte, dtes, true)}}>{r.dte.toFixed(1)}%</span>
              <span className="r heat" style={{background: heat(r.comp, comps)}}>{r.comp}%</span>
              <span className="r heat">{r.n}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function RollupNational() {
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 03 · NATIONAL CONTEXT</div>
            <h2>Oregon CS vs. the rest of the country</h2>
          </div>
          <p className="sec-sub">CS is a high-earning major nationwide. Oregon's median sits comfortably above the national bachelor's median for CIP 11.07. Data-pending: full state rollups for the other 49 states.</p>
        </header>
        <div className="data-tiles" style={{gridTemplateColumns:"repeat(4, 1fr)"}}>
          <div className="data-tile">
            <span className="meta-mono tile-cat">OREGON · 10Y MEDIAN</span>
            <div className="tile-val"><span className="num">$84.1k</span></div>
            <span className="tile-note">8 institutions</span>
          </div>
          <div className="data-tile">
            <span className="meta-mono tile-cat">NATIONAL · 10Y MEDIAN</span>
            <div className="tile-val"><span className="num">$78.6k</span></div>
            <span className="tile-note">~480 institutions</span>
          </div>
          <div className="data-tile">
            <span className="meta-mono tile-cat">OR vs. NATIONAL</span>
            <div className="tile-val"><span className="num" style={{color:"#6FCF97"}}>+7.0%</span></div>
            <span className="tile-note">at the median</span>
          </div>
          <div className="data-tile">
            <span className="meta-mono tile-cat">PERCENTILE NATIONALLY</span>
            <div className="tile-val"><span className="num">62nd</span></div>
            <span className="tile-note">across CIP-4 11.07</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function RollupAllOregon() {
  const programs = [
    { name: "Computer Science",          cip:"11.0701", earn:84100, focus:true },
    { name: "Electrical Engineering",    cip:"14.1001", earn:91200, focus:false },
    { name: "Registered Nursing",        cip:"51.3801", earn:78600 },
    { name: "Mechanical Engineering",    cip:"14.1901", earn:74400 },
    { name: "Business Administration",   cip:"52.0201", earn:60400 },
    { name: "Biology",                   cip:"26.0101", earn:51400 },
    { name: "Communication Studies",     cip:"09.0101", earn:47100 },
    { name: "Elementary Education",      cip:"13.1202", earn:44200 },
    { name: "Psychology",                cip:"42.0101", earn:41800 },
    { name: "English Language & Lit.",   cip:"23.0101", earn:39200 },
    { name: "Fine Arts",                 cip:"50.0701", earn:36400 },
  ];
  const max = Math.max(...programs.map(p => p.earn));
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 04 · IN CONTEXT</div>
            <h2>Where CS sits among Oregon majors</h2>
          </div>
          <p className="sec-sub">Bachelor's-level statewide medians, ranked. CS is the 2nd-highest-paying major in the Oregon dataset, behind Electrical Engineering.</p>
        </header>
        <div className="prog-rank">
          {programs.map(p => (
            <div className={`pr-row ${p.focus ? "focus" : ""}`} key={p.cip}>
              <span className="pr-name">{p.name}</span>
              <span className="meta-mono pr-cip">CIP {p.cip}</span>
              <span className="pr-bar"><i style={{width: `${(p.earn/max)*100}%`, background: p.focus ? "#E6B450" : "#60A5FA"}}/></span>
              <span className="pr-earn">${(p.earn/1000).toFixed(1)}k</span>
              <span className="meta-mono pr-n"></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MethodCallout4() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="method-promo">
          <div>
            <div className="kicker">SCOPE</div>
            <h3>"Best CS school in Oregon" — what we don't claim</h3>
            <p>This page surfaces federal earnings, debt, and completion data for bachelor's-level CS at every Oregon institution that reports it. It does <em>not</em> rank schools, judge teaching quality, or weight the metrics into a single score. Decide for yourself what tradeoffs you care about.</p>
          </div>
          <a href="#" className="btn btn-primary">Methodology →</a>
        </div>
      </div>
    </section>
  );
}

function CollegeRollupPage() {
  return (
    <div style={{background:"var(--bg)", color:"var(--fg)"}}>
      <CollegeHeader active="programs"/>
      <CCrumbs items={[
        {label:"Home", href:"#"},
        {label:"Programs", href:"#"},
        {label:"Computer Science (CIP 11.07)", href:"#"},
        {label:"Oregon"},
      ]}/>
      <RollupHero/>
      <RollupTiles/>
      <RollupTable/>
      <RollupNational/>
      <RollupAllOregon/>
      <MethodCallout4/>
      <CollegeFooter/>
    </div>
  );
}
window.CollegeRollupPage = CollegeRollupPage;

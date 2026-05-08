/* global React, Ic, SiteHeader, SiteFooter, Crumbs, TrendLine, Spark */

// ============================================================
// Year-in-review — annual summary report (different from monthly)
// ============================================================

function YearHero() {
  return (
    <section className="year-hero">
      <div className="wrap">
        <div className="yh-grid">
          <div>
            <div className="eyebrow">San Francisco · annual report</div>
            <h1>2025</h1>
            <p className="kicker">A year of crime trends, summarized.</p>
            <p className="lede">
              An annual companion to the monthly briefings: the calls we got right, the spikes that mattered, the structural shifts that emerged, and the methodology lessons we learned. Twelve briefings, condensed.
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 24, flexWrap: "wrap" }}>
              <a href="#chapters" className="btn btn-primary">Jump to chapters<Ic.arrow s={14} /></a>
              <a href="#" className="btn btn-ghost"><Ic.download s={13} />Download PDF</a>
            </div>
          </div>
          <aside className="yh-side">
            <div className="ys-stat large">
              <div className="num signal">−6.1%</div>
              <div className="label">overall incident volume vs 2024</div>
            </div>
            <div className="ys-row">
              <div className="ys-stat"><div className="num">52</div><div className="label">anomalies flagged across the year</div></div>
              <div className="ys-stat"><div className="num">12</div><div className="label">monthly briefings published</div></div>
            </div>
            <div className="ys-row">
              <div className="ys-stat"><div className="num">81%</div><div className="label">forecast accuracy (within 90% CI)</div></div>
              <div className="ys-stat"><div className="num">3</div><div className="label">categories that reset baseline</div></div>
            </div>
            <span className="meta-mono" style={{ color: "var(--fg-4)", display: "block", textAlign: "center", marginTop: 12 }}>PUBLISHED JAN 8, 2026 · K. ALMEIDA</span>
          </aside>
        </div>
      </div>
    </section>
  );
}

// Chapter index sidebar / TOC
function YearChapters() {
  const chapters = [
    { n: "01", t: "The big picture", d: "How 2025 looked at the city level — totals, indices, year-over-year." },
    { n: "02", t: "The five stories", d: "Auto theft, the Mission burglary cluster, robbery's quiet decline, two arson clusters, and the Tenderloin assault drop." },
    { n: "03", t: "By category", d: "All ten categories, ranked by 2025 movement." },
    { n: "04", t: "By neighborhood", d: "Forty-one neighborhoods, sorted by total flagged anomalies." },
    { n: "05", t: "Forecast scorecard", d: "How well our forecasts performed; where we missed and why." },
    { n: "06", t: "Methodology updates", d: "What we changed during the year and why." },
    { n: "07", t: "What we'll watch in 2026", d: "Three patterns from 2025 that we expect to keep moving." },
  ];
  return (
    <section id="chapters" className="year-chapters">
      <div className="wrap">
        <div className="yc-head">
          <div className="eyebrow">Contents</div>
          <h2 className="h-display" style={{ fontSize: "clamp(24px,2.6vw,32px)", margin: "8px 0 0" }}>Seven chapters.</h2>
        </div>
        <div className="yc-grid">
          {chapters.map(c => (
            <a key={c.n} href={`#ch-${c.n}`} className="yc-link">
              <span className="num">{c.n}</span>
              <div>
                <h4>{c.t}</h4>
                <p>{c.d}</p>
              </div>
              <Ic.arrow s={14} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// 12-month bar (one bar per month) showing total incident volume
function YearVolumeChart() {
  const data = [
    { m: "Jan", v: 1820 }, { m: "Feb", v: 1745 }, { m: "Mar", v: 1860 },
    { m: "Apr", v: 1790 }, { m: "May", v: 1820 }, { m: "Jun", v: 1880 },
    { m: "Jul", v: 1910 }, { m: "Aug", v: 1845 }, { m: "Sep", v: 1720 },
    { m: "Oct", v: 1810 }, { m: "Nov", v: 1690 }, { m: "Dec", v: 1665 },
  ];
  const max = 2000;
  const W = 720, H = 240, pad = { l: 44, r: 14, t: 16, b: 28 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const bw = innerW / data.length;
  const x = (i) => pad.l + i * bw + bw * 0.18;
  const w = bw * 0.64;
  const y = (v) => pad.t + innerH - (v / max) * innerH;
  // 2024 reference (slightly higher)
  const ref = data.map(d => d.v * 1.065);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <g stroke="var(--line)" strokeWidth="1">
        {[1000, 1500, 2000].map(v => <line key={v} x1={pad.l} y1={y(v)} x2={W - pad.r} y2={y(v)} strokeDasharray="2 4" />)}
      </g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--fg-4)">
        {[1000, 1500, 2000].map(v => <text key={v} x={pad.l - 7} y={y(v) + 3} textAnchor="end">{v}</text>)}
      </g>
      {/* 2024 reference line */}
      <path d={ref.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i) + w / 2} ${y(v)}`).join(" ")} fill="none" stroke="var(--fg-4)" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* 2025 bars */}
      {data.map((d, i) => (
        <rect key={i} x={x(i)} y={y(d.v)} width={w} height={pad.t + innerH - y(d.v)} fill="var(--blue)" opacity="0.85" />
      ))}
      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--fg-3)">
        {data.map((d, i) => <text key={i} x={x(i) + w / 2} y={H - 12} textAnchor="middle">{d.m}</text>)}
      </g>
      {/* legend */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--fg-3)">
        <rect x={W - 250} y={pad.t + 4} width={10} height={10} fill="var(--blue)" opacity="0.85" />
        <text x={W - 236} y={pad.t + 13}>2025</text>
        <line x1={W - 200} y1={pad.t + 9} x2={W - 188} y2={pad.t + 9} stroke="var(--fg-4)" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x={W - 184} y={pad.t + 13}>2024 monthly</text>
      </g>
    </svg>
  );
}

function YearBigPicture() {
  return (
    <section id="ch-01" className="year-section">
      <div className="wrap">
        <div className="yc-section-head">
          <span className="ch-num">01</span>
          <h2>The big picture</h2>
        </div>
        <div className="yc-section-grid">
          <div className="yc-prose">
            <p className="lead">
              San Francisco closed 2025 with overall incident volume <strong>down 6.1%</strong> against 2024, the third consecutive year of measured decline. The story underneath that headline is mixed: violent categories continued their long-running drop, while property crime ran roughly flat with a sharp downward turn in the final quarter.
            </p>
            <p>
              Three categories moved enough to reset their trailing baselines: <strong>auto theft</strong> (the year's biggest story), <strong>robbery</strong>, and <strong>residential burglary</strong>. Two categories — assault and larceny — moved within their normal ranges and are calibrated against the same baselines we used at the start of the year.
            </p>
          </div>
          <div className="yc-figure">
            <div className="fig-head">
              <span className="meta-mono">FIG 1.1 · MONTHLY INCIDENT VOLUME · 2025</span>
              <span className="meta-mono" style={{ color: "var(--fg-4)" }}>VS 2024</span>
            </div>
            <div className="fig-body"><YearVolumeChart /></div>
          </div>
        </div>
        <div className="yc-grid-stats">
          <div><span className="num signal">−6.1%</span><span className="lbl">total volume vs 2024</span></div>
          <div><span className="num">21,754</span><span className="lbl">total incidents</span></div>
          <div><span className="num">52</span><span className="lbl">anomalies flagged</span></div>
          <div><span className="num">3</span><span className="lbl">baselines reset</span></div>
          <div><span className="num">81%</span><span className="lbl">forecast accuracy</span></div>
          <div><span className="num">41 / 41</span><span className="lbl">neighborhoods covered</span></div>
        </div>
      </div>
    </section>
  );
}

function YearStories() {
  const stories = [
    { num: "01", title: "Auto theft's long decline", subtitle: "JUN '25 → DEC '25 · sustained drop", body: "What started as a barely-flagged sub-trend reading in June became 2025's biggest story. Six consecutive months below trend across most districts; trailing 12-month mean dropped 33%. We reset the baseline in March 2026.", color: "#6FCF97", trend: "drop" },
    { num: "02", title: "Mission burglary cluster", subtitle: "OCT '25 · spike", body: "October's headline anomaly: +48% MoM, concentrated along 24th Street. Two-thirds of incidents in commercial structures between midnight and 4 AM. Resolved within six weeks of the first flag.", color: "#FF6B6B", trend: "spike" },
    { num: "03", title: "Robbery's quiet decline", subtitle: "NOV '25 → ongoing · sustained drop", body: "Five consecutive sub-trend months across the eastern half of the city. Less dramatic than auto theft, more durable. Tightening variance suggests a baseline reset in 2026.", color: "#6FCF97", trend: "drop" },
    { num: "04", title: "Two arson clusters", subtitle: "JUL & DEC '25 · rare events", body: "Russian Hill in July (n=3 in eight days) and Bayview in December (n=4 in eleven days). Neither developed into a sustained pattern, but both met our rare-event threshold.", color: "#E6B450", trend: "rare" },
    { num: "05", title: "Tenderloin assault drop", subtitle: "JUN '25 → AUG '25 · sustained drop", body: "Three consecutive months below trend in the Tenderloin's violent crime category — the longest sustained drop we've recorded in any violent category. Coincides with mid-Market response zone changes.", color: "#6FCF97", trend: "drop" },
  ];
  return (
    <section id="ch-02" className="year-section section-tint">
      <div className="wrap">
        <div className="yc-section-head">
          <span className="ch-num">02</span>
          <h2>The five stories</h2>
          <p className="yc-section-sub">Five anomalies we'd point a 2025 reader to. The big picture lives in the data; these are the moments where it bent.</p>
        </div>
        <div className="story-strip">
          {stories.map(s => (
            <div key={s.num} className="story-card">
              <div className="sc-head">
                <span className="sc-num">{s.num}</span>
                <span className={`chip ${s.trend === "spike" ? "low" : s.trend === "drop" ? "high" : "mid"}`}>
                  {s.trend === "spike" ? "SPIKE" : s.trend === "drop" ? "SUSTAINED DROP" : "RARE EVENT"}
                </span>
              </div>
              <h3>{s.title}</h3>
              <span className="meta-mono" style={{ color: "var(--fg-3)" }}>{s.subtitle}</span>
              <p>{s.body}</p>
              <div style={{ height: 44, marginTop: 12 }}>
                <TrendLine height={44} color={s.color} />
              </div>
              <a href="#" className="meta-mono" style={{ color: "var(--blue)", marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4 }}>READ THE BRIEFING<Ic.arrow s={11} /></a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function YearByCategory() {
  const cats = [
    { n: "Auto theft",   change: "−18%", flags: 14, dir: "down", color: "#6FCF97", note: "Year's biggest mover. Baseline reset in March." },
    { n: "Robbery",      change: "−12%", flags: 8,  dir: "down", color: "#6FCF97", note: "Sustained decline, tightening variance." },
    { n: "Burglary",     change: "+4%",  flags: 11, dir: "up",   color: "#FF6B6B", note: "Net flat after the October Mission cluster resolved." },
    { n: "Vandalism",    change: "+3%",  flags: 4,  dir: "up",   color: "#E8ECF2", note: "Within normal range." },
    { n: "Larceny",      change: "−2%",  flags: 6,  dir: "down", color: "#6FCF97", note: "Mostly noise; reclassification effects still present." },
    { n: "Assault",      change: "−6%",  flags: 5,  dir: "down", color: "#6FCF97", note: "Tenderloin drop accounts for most of the move." },
    { n: "Arson",        change: "+22%", flags: 2,  dir: "up",   color: "#E6B450", note: "Two rare-event clusters; volume too low for trend." },
    { n: "Drug offenses",change: "−14%", flags: 1,  dir: "down", color: "#6FCF97", note: "Added to coverage in Jan 2026; partial year only." },
    { n: "Robbery — armed",change: "−24%",flags: 1, dir: "down", color: "#6FCF97", note: "Subset of robbery; tracked separately." },
    { n: "Weapons",      change: "—",    flags: 0,  dir: "flat", color: "#5C6478", note: "Below volume threshold for flagging." },
  ];
  return (
    <section id="ch-03" className="year-section">
      <div className="wrap">
        <div className="yc-section-head">
          <span className="ch-num">03</span>
          <h2>By category</h2>
          <p className="yc-section-sub">Ten categories, ranked by 2025 movement.</p>
        </div>
        <div className="yc-cattable">
          <div className="yct-row yct-head">
            <span>#</span><span>Category</span><span className="right">YoY</span><span className="right">Flags</span><span>Trend</span><span>Note</span>
          </div>
          {cats.map((c, i) => (
            <div key={c.n} className="yct-row">
              <span className="num-mono muted">{String(i + 1).padStart(2, "0")}</span>
              <span className="cat-name">{c.n}</span>
              <span className={`right num-mono ${c.dir === "down" ? "delta-up" : c.dir === "up" ? "delta-down" : ""}`}>{c.change}</span>
              <span className="right num-mono">{c.flags}</span>
              <span><Spark down={c.dir === "down"} color={c.color} w={90} /></span>
              <span className="muted" style={{ fontSize: 13 }}>{c.note}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function YearByNeighborhood() {
  const nbhds = [
    { n: "Outer Sunset",   flags: 6, lead: "Burglary spike (May, repeated Mar '26)" },
    { n: "Mission",        flags: 5, lead: "Auto theft drop, Oct burglary cluster" },
    { n: "Tenderloin",     flags: 5, lead: "Sustained assault drop" },
    { n: "Bayview",        flags: 4, lead: "Auto theft −41% YoY, Dec arson cluster" },
    { n: "Russian Hill",   flags: 3, lead: "July arson cluster" },
    { n: "SoMa",           flags: 3, lead: "Larceny decline (Q4)" },
    { n: "Marina",         flags: 2, lead: "Spring burglary spike" },
    { n: "Castro",         flags: 2, lead: "Vandalism drop" },
    { n: "North Beach",    flags: 2, lead: "Robbery drop" },
    { n: "Hayes Valley",   flags: 1, lead: "Burglary drop (Q4)" },
    { n: "Excelsior",      flags: 1, lead: "Robbery spike (Q3)" },
    { n: "Pacific Heights",flags: 1, lead: "Vandalism cluster" },
  ];
  const max = 6;
  return (
    <section id="ch-04" className="year-section section-tint">
      <div className="wrap">
        <div className="yc-section-head">
          <span className="ch-num">04</span>
          <h2>By neighborhood</h2>
          <p className="yc-section-sub">Twelve of forty-one neighborhoods registered at least one flagged anomaly in 2025. The other twenty-nine had a quiet year.</p>
        </div>
        <div className="nbhd-bars">
          {nbhds.map((n, i) => (
            <a key={n.n} href="#" className="nb-row">
              <span className="rank num-mono">{String(i + 1).padStart(2, "0")}</span>
              <span className="nm">{n.n}</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${(n.flags / max) * 100}%` }} />
                <span className="num-mono bar-val">{n.flags}</span>
              </div>
              <span className="lead-text">{n.lead}</span>
              <Ic.arrow s={13} />
            </a>
          ))}
        </div>
        <p className="muted" style={{ fontSize: 13, marginTop: 16, textAlign: "center" }}>29 other neighborhoods registered no flagged anomalies in 2025.</p>
      </div>
    </section>
  );
}

function YearForecastScorecard() {
  // 12 forecasts; some inside CI, some outside
  const forecasts = [
    { m: "Jan", inside: 6, total: 7 },
    { m: "Feb", inside: 7, total: 7 },
    { m: "Mar", inside: 5, total: 7 },
    { m: "Apr", inside: 6, total: 7 },
    { m: "May", inside: 5, total: 7 },
    { m: "Jun", inside: 6, total: 7 },
    { m: "Jul", inside: 7, total: 8 },
    { m: "Aug", inside: 7, total: 8 },
    { m: "Sep", inside: 8, total: 8 },
    { m: "Oct", inside: 6, total: 8 },
    { m: "Nov", inside: 7, total: 8 },
    { m: "Dec", inside: 6, total: 8 },
  ];
  const totalIn = forecasts.reduce((s, f) => s + f.inside, 0);
  const totalAll = forecasts.reduce((s, f) => s + f.total, 0);
  return (
    <section id="ch-05" className="year-section">
      <div className="wrap">
        <div className="yc-section-head">
          <span className="ch-num">05</span>
          <h2>Forecast scorecard</h2>
          <p className="yc-section-sub">Of {totalAll} monthly point-estimate forecasts issued in 2025, {totalIn} ({Math.round(totalIn / totalAll * 100)}%) landed inside their 90% prediction intervals. Below: month by month.</p>
        </div>
        <div className="scorecard">
          {forecasts.map(f => (
            <div key={f.m} className="sc-month">
              <span className="m-label">{f.m}</span>
              <div className="sc-cells">
                {Array.from({ length: f.total }).map((_, i) => (
                  <span key={i} className={`sc-cell ${i < f.inside ? "in" : "out"}`}></span>
                ))}
              </div>
              <span className="sc-frac">{f.inside}/{f.total}</span>
            </div>
          ))}
        </div>
        <div className="sc-legend">
          <span><i className="in" /> Inside 90% CI</span>
          <span><i className="out" /> Outside 90% CI (model miss)</span>
        </div>
        <p style={{ marginTop: 24, fontSize: 15, color: "var(--fg-2)", maxWidth: "70ch" }}>
          The biggest single miss was the October Mission burglary spike (predicted 21; actual 38). Two of December's misses were related to the same arson cluster. We are not changing the seasonal-naïve forecast model on the strength of 2025; if 2026 starts with another bad quarter, that's a different conversation.
        </p>
      </div>
    </section>
  );
}

function YearMethodologyUpdates() {
  const updates = [
    { d: "FEB '25", t: "Daytime-population denominators added", b: "Per-capita rate calculations now use ACS commuting data to estimate daytime population, not just resident population. Affects rate calculations in SoMa, FiDi, and the Embarcadero." },
    { d: "MAY '25", t: "Spike rule tightened", b: "Raised z-score threshold from 1.8 to 2.0 to reduce false positives during seasonal transitions. Estimated effect: 12% fewer flags, with the trade-off of slightly later detection." },
    { d: "AUG '25", t: "Reclassification window extended", b: "Q3 2024 reclassification effects extended through end of 2024. Larceny baselines exclude that window through April 2026." },
    { d: "OCT '25", t: "Cluster geometry refined", b: "Rare-event cluster definition now uses convex hull area (not radius) to reduce false positives in corridor patterns." },
    { d: "JAN '26", t: "Drug offenses added to coverage", b: "Tenth incident category added; baselines built from Jan 2023 onward." },
  ];
  return (
    <section id="ch-06" className="year-section section-tint">
      <div className="wrap">
        <div className="yc-section-head">
          <span className="ch-num">06</span>
          <h2>Methodology updates</h2>
          <p className="yc-section-sub">Five changes during the year. We log each one in version-control alongside the code that runs the model.</p>
        </div>
        <ul className="update-list">
          {updates.map((u, i) => (
            <li key={i}>
              <span className="meta-mono">{u.d}</span>
              <div>
                <h4>{u.t}</h4>
                <p>{u.b}</p>
              </div>
              <a href="#" className="meta-mono">VIEW DIFF →</a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function YearWatchlist() {
  const items = [
    { t: "Auto theft baseline reset", b: "We expect to formally reset the auto theft baseline downward in spring 2026 if the trend holds another two months." },
    { t: "Robbery's quiet decline", b: "Five consecutive sub-trend months across the eastern half of the city. If June 2026 still shows the pattern, baseline will reset." },
    { t: "Outer Sunset burglary recurrence", b: "Two distinct burglary spikes in Outer Sunset in 12 months — May 2025 and March 2026. If a third occurs in 2026, we'll investigate whether the underlying baseline has changed." },
  ];
  return (
    <section id="ch-07" className="year-section">
      <div className="wrap">
        <div className="yc-section-head">
          <span className="ch-num">07</span>
          <h2>What we'll watch in 2026</h2>
          <p className="yc-section-sub">Three patterns from 2025 that we expect to keep moving — and what we'd need to see to call each one.</p>
        </div>
        <ol className="watch-list">
          {items.map((it, i) => (
            <li key={i}>
              <span className="num-mono wn">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>{it.t}</h3>
                <p>{it.b}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="year-end">
          <div>
            <span className="meta-mono">END OF REPORT · SAN FRANCISCO · 2025</span>
            <p style={{ fontSize: 13.5, color: "var(--fg-3)", margin: "10px 0 0", maxWidth: "60ch" }}>
              Cite as: Crime Trends, "San Francisco — 2025 in review," published Jan 8, 2026. Permanent URL: /sf/2025/year-in-review.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="#" className="btn btn-ghost btn-sm"><Ic.download s={13} />Download PDF</a>
            <a href="#" className="btn btn-ghost btn-sm">2024 in review →</a>
            <a href="#" className="btn btn-primary btn-sm">All briefings →</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function YearReviewPage() {
  return (
    <div style={{ background: "var(--paper)" }}>
      <SiteHeader active="city" />
      <Crumbs items={[
        { label: "Cities", href: "#" },
        { label: "San Francisco", href: "#" },
        { label: "Archive", href: "#" },
        { label: "2025 in review" },
      ]} />
      <YearHero />
      <YearChapters />
      <YearBigPicture />
      <YearStories />
      <YearByCategory />
      <YearByNeighborhood />
      <YearForecastScorecard />
      <YearMethodologyUpdates />
      <YearWatchlist />
      <SiteFooter />
    </div>
  );
}

window.YearReviewPage = YearReviewPage;

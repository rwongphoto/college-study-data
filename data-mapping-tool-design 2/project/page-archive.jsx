/* global React, Ic, SiteHeader, SiteFooter, Crumbs, TrendLine, Spark */
const { useState: useStateArc } = React;

// ---------------------------------------------------------
// Mock data: 16 months of briefings (Jan 2025 → Apr 2026)
// ---------------------------------------------------------
const BRIEFINGS = [
  { y: 2026, m: 4, mn: "April",     headline: "A quiet month, with one loud exception in the Outer Sunset.", excerpt: "Citywide volume is down 7.4% against trend, with declines distributed broadly. The Outer Sunset burglary spike is the singular exception — and the headline of the month.", anomalies: { spike: 9, drop: 11, rare: 3 }, lead: { type: "spike", cat: "Burglary", nbhd: "Outer Sunset", v: "+63%" }, top: ["Outer Sunset", "Bayview", "Russian Hill"], cats: ["Burglary", "Auto theft", "Arson"], chart: "spike" },
  { y: 2026, m: 3, mn: "March",     headline: "Auto theft's six-month run finally resets the baseline.", excerpt: "What was an emerging story in November is now a structural shift: trailing 12-month means dropped 33% across four districts. We reset baselines for May.", anomalies: { spike: 4, drop: 14, rare: 1 }, lead: { type: "drop", cat: "Auto theft", nbhd: "Citywide", v: "−24%" }, top: ["Bayview", "Mission", "SoMa"], cats: ["Auto theft", "Larceny"], chart: "drop" },
  { y: 2026, m: 2, mn: "February",  headline: "Robbery quietly declining; the drop is real.", excerpt: "Five consecutive months below 12-month moving average across the eastern half of the city. Tightening variance suggests a baseline reset is imminent.", anomalies: { spike: 3, drop: 12, rare: 0 }, lead: { type: "drop", cat: "Robbery", nbhd: "Tenderloin", v: "−21%" }, top: ["Tenderloin", "SoMa", "Mission"], cats: ["Robbery", "Auto theft"], chart: "drop" },
  { y: 2026, m: 1, mn: "January",   headline: "First briefing of 2026: quiet open, 2025 trends carrying through.", excerpt: "The new year opens within historical norms. We expanded coverage to a tenth category (drug offenses) and rebuilt the seasonal forecast from the 2023–2025 backtest.", anomalies: { spike: 5, drop: 9, rare: 1 }, lead: { type: "rare", cat: "Arson", nbhd: "North Beach", v: "n=4" }, top: ["North Beach", "Castro", "Marina"], cats: ["Arson", "Burglary"], chart: "rare" },
  { y: 2025, m: 12, mn: "December", headline: "Holiday-week larceny lower than 2024; the citywide decline broadens.", excerpt: "Holiday retail-corridor larceny ran below 2024 levels for the first time in three years. We discuss whether that's seasonal or structural.", anomalies: { spike: 2, drop: 13, rare: 0 }, lead: { type: "drop", cat: "Larceny", nbhd: "Union Square", v: "−18%" }, top: ["Union Square", "Hayes Valley", "Marina"], cats: ["Larceny"], chart: "drop" },
  { y: 2025, m: 11, mn: "November", headline: "Robbery starts what may be a sustained decline.", excerpt: "First month with five consecutive sub-trend readings across multiple districts. Too early to call a trend, but worth flagging early.", anomalies: { spike: 4, drop: 10, rare: 0 }, lead: { type: "drop", cat: "Robbery", nbhd: "SoMa", v: "−14%" }, top: ["SoMa", "Tenderloin"], cats: ["Robbery"], chart: "drop" },
  { y: 2025, m: 10, mn: "October",  headline: "Mission burglary spike — the first big anomaly since launch.", excerpt: "Concentrated along 24th Street; +48% MoM. We discussed the geographic clustering at length and what we excluded from the flag.", anomalies: { spike: 7, drop: 6, rare: 1 }, lead: { type: "spike", cat: "Burglary", nbhd: "Mission", v: "+48%" }, top: ["Mission", "Castro", "Bernal Heights"], cats: ["Burglary"], chart: "spike" },
  { y: 2025, m: 9, mn: "September", headline: "Calm month, model behaving well.", excerpt: "Forecast accuracy at 88% for the trailing quarter. We published our first backtest and explained where the seasonal-naïve model still fails.", anomalies: { spike: 3, drop: 7, rare: 0 }, lead: { type: "drop", cat: "Vandalism", nbhd: "Castro", v: "−9%" }, top: ["Castro", "Hayes Valley"], cats: ["Vandalism"], chart: "drop" },
  { y: 2025, m: 8, mn: "August",    headline: "Tenderloin assault drop — third consecutive month.", excerpt: "Now the longest sustained drop we've recorded in any violent category. Coincides with the city's mid-Market response zone changes.", anomalies: { spike: 4, drop: 11, rare: 0 }, lead: { type: "drop", cat: "Assault", nbhd: "Tenderloin", v: "−16%" }, top: ["Tenderloin"], cats: ["Assault"], chart: "drop" },
  { y: 2025, m: 7, mn: "July",      headline: "First Russian Hill arson cluster of 2025.", excerpt: "Three incidents in eight days within a 0.3 mile radius. We discuss the cluster definition rule and how to interpret rare-event flags.", anomalies: { spike: 5, drop: 8, rare: 1 }, lead: { type: "rare", cat: "Arson", nbhd: "Russian Hill", v: "n=3" }, top: ["Russian Hill"], cats: ["Arson"], chart: "rare" },
  { y: 2025, m: 6, mn: "June",      headline: "Auto theft begins its multi-month decline.", excerpt: "The story that would dominate the back half of 2025 starts here, quietly. The first sub-trend reading was easy to miss; we wrote about why we still flagged it.", anomalies: { spike: 4, drop: 9, rare: 0 }, lead: { type: "drop", cat: "Auto theft", nbhd: "Mission", v: "−7%" }, top: ["Mission", "Bayview"], cats: ["Auto theft"], chart: "drop" },
  { y: 2025, m: 5, mn: "May",       headline: "Outer Sunset burglary, season one.", excerpt: "A milder version of what would recur in April 2026. Fifteen incidents above trend over six weeks. We discuss seasonality vs. cluster.", anomalies: { spike: 6, drop: 6, rare: 0 }, lead: { type: "spike", cat: "Burglary", nbhd: "Outer Sunset", v: "+34%" }, top: ["Outer Sunset"], cats: ["Burglary"], chart: "spike" },
  { y: 2025, m: 4, mn: "April",     headline: "Spring-into-summer pattern emerges.", excerpt: "Burglary seasonality steepens; we publish for the first time the year-over-year seasonal index by category.", anomalies: { spike: 5, drop: 5, rare: 0 }, lead: { type: "spike", cat: "Burglary", nbhd: "Marina", v: "+22%" }, top: ["Marina", "Pacific Heights"], cats: ["Burglary"], chart: "spike" },
  { y: 2025, m: 3, mn: "March",     headline: "Larceny reclassification — what we exclude and why.", excerpt: "Q3 2024 reclassification effects are still visible. We document the exclusion rule and how it affects baselines through 2026.", anomalies: { spike: 2, drop: 6, rare: 0 }, lead: { type: "drop", cat: "Larceny", nbhd: "Citywide", v: "−11%" }, top: ["Union Square", "SoMa"], cats: ["Larceny"], chart: "drop" },
  { y: 2025, m: 2, mn: "February",  headline: "Quiet month, infrastructure month.", excerpt: "We rebuilt the data pipeline and added daytime-population denominators. Few flags, lots of methodology.", anomalies: { spike: 2, drop: 3, rare: 0 }, lead: { type: "spike", cat: "Vandalism", nbhd: "SoMa", v: "+18%" }, top: ["SoMa"], cats: ["Vandalism"], chart: "spike" },
  { y: 2025, m: 1, mn: "January",   headline: "Crime Trends launches with the SF dataset.", excerpt: "Our first briefing. We explain the project, the data, the methodology, and the four anomalies the model would have flagged in December 2024.", anomalies: { spike: 3, drop: 4, rare: 1 }, lead: { type: "rare", cat: "Burglary", nbhd: "Marina", v: "n=5" }, top: ["Marina", "Castro"], cats: ["Burglary", "Auto theft"], chart: "rare" },
];

const ALL_NBHDS = ["Outer Sunset", "Bayview", "Russian Hill", "Mission", "Tenderloin", "SoMa", "Marina", "North Beach", "Castro", "Hayes Valley", "Union Square", "Pacific Heights", "Bernal Heights"];
const ALL_CATS = ["Burglary", "Auto theft", "Robbery", "Assault", "Larceny", "Vandalism", "Arson"];

// ---------------------------------------------------------
// Mini-chart per card (matches lead anomaly type)
// ---------------------------------------------------------
function ArcMini({ kind = "spike" }) {
  const color = kind === "spike" ? "#FF6B6B" : kind === "drop" ? "#6FCF97" : "#E6B450";
  // 12 bars; index 11 highlighted to match the "lead" anomaly
  const heights = kind === "spike"
    ? [22, 26, 24, 28, 30, 25, 27, 26, 29, 28, 27, 48]
    : kind === "drop"
    ? [42, 40, 38, 36, 35, 33, 32, 28, 26, 24, 22, 20]
    : [12, 14, 11, 13, 10, 12, 11, 9, 13, 12, 14, 28];
  const W = 200, H = 56, pad = 4;
  const bw = (W - pad * 2) / heights.length;
  const max = 52;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
      {/* baseline */}
      <line x1={pad} y1={H - pad} x2={W - pad} y2={H - pad} stroke="var(--line)" strokeWidth="1" />
      {/* mean dashed line */}
      <line x1={pad} y1={H - pad - (28 / max) * (H - pad * 2)} x2={W - pad} y2={H - pad - (28 / max) * (H - pad * 2)} stroke="var(--fg-4)" strokeWidth="1" strokeDasharray="2 3" />
      {heights.map((h, i) => {
        const last = i === heights.length - 1;
        return (
          <rect key={i}
            x={pad + i * bw + bw * 0.15}
            y={H - pad - (h / max) * (H - pad * 2)}
            width={bw * 0.7}
            height={(h / max) * (H - pad * 2)}
            fill={last ? color : "var(--fg-4)"}
            opacity={last ? 1 : 0.45}
          />
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------
// Header
// ---------------------------------------------------------
function ArchiveHeader({ count }) {
  return (
    <section className="archive-header">
      <div className="wrap">
        <div className="top">
          <div>
            <div className="eyebrow">San Francisco · briefing archive</div>
            <h1>The archive</h1>
            <p className="lede">
              Every monthly briefing we've published for San Francisco, in chronological order. Each entry preserves the narrative as written that month — anomalies, context, and the chart that explained the headline. The data on the live city page is current; the data on each archived month is not.
            </p>
          </div>
          <div className="meta-col">
            <div className="stat-row">
              <div className="stat"><div className="num">{count}</div><div className="label">briefings published</div></div>
              <div className="stat"><div className="num">16</div><div className="label">months of coverage</div></div>
            </div>
            <a href="#" className="btn btn-ghost btn-sm"><Ic.download s={13} />Download all (CSV)</a>
            <span className="meta-mono" style={{ textAlign: "center", marginTop: 4 }}>UPDATED APR 14, 2026</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------
// Filter bar
// ---------------------------------------------------------
function FilterBar({ filters, setFilters, results }) {
  const set = (k, v) => setFilters({ ...filters, [k]: v });
  const toggle = (k, v) => {
    const cur = filters[k];
    set(k, cur === v ? null : v);
  };
  return (
    <section className="archive-filters">
      <div className="wrap">
        <div className="filter-row">
          <span className="grouplabel">Year</span>
          {[null, 2026, 2025, 2024].map((y, i) => (
            <button key={i} type="button" className={`pill ${filters.year === y ? "active" : ""}`} onClick={() => set("year", y)}>
              {y === null ? "All" : y}
            </button>
          ))}
          <span className="divider" />
          <span className="grouplabel">Type</span>
          {[
            { v: null, l: "All" },
            { v: "spike", l: "Spike", c: "low" },
            { v: "drop", l: "Drop", c: "high" },
            { v: "rare", l: "Rare event", c: "mid" },
          ].map((t) => (
            <button key={t.l} type="button" className={`pill ${filters.type === t.v ? "active" : ""} ${t.c || ""}`} onClick={() => set("type", t.v)}>
              {t.l}
            </button>
          ))}
        </div>
        <div className="filter-row">
          <span className="grouplabel">Category</span>
          <select className="select" value={filters.cat || ""} onChange={(e) => set("cat", e.target.value || null)}>
            <option value="">All categories</option>
            {ALL_CATS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="grouplabel">Neighborhood</span>
          <select className="select" value={filters.nbhd || ""} onChange={(e) => set("nbhd", e.target.value || null)}>
            <option value="">All neighborhoods</option>
            {ALL_NBHDS.sort().map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="result-count">{results} {results === 1 ? "briefing" : "briefings"}</span>
          {(filters.year || filters.type || filters.cat || filters.nbhd) && (
            <button type="button" className="btn-clear" onClick={() => setFilters({ year: null, type: null, cat: null, nbhd: null })}>Clear ✕</button>
          )}
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------
// Card
// ---------------------------------------------------------
function ArchiveCard({ b }) {
  const flagClass = b.lead.type === "spike" ? "low" : b.lead.type === "drop" ? "high" : "mid";
  const flagLabel = b.lead.type === "spike" ? "SPIKE" : b.lead.type === "drop" ? "SUSTAINED DROP" : "RARE EVENT";
  return (
    <a href="#" className="arc-card">
      <div className="arc-card-head">
        <div className="date">
          <span className="month">{b.mn}</span>
          <span className="year">{b.y}</span>
        </div>
        <div className="head-meta">
          <span className={`chip ${flagClass}`}>{flagLabel} · {b.lead.cat.toUpperCase()}</span>
        </div>
      </div>
      <h3 className="arc-headline">{b.headline}</h3>
      <p className="arc-excerpt">{b.excerpt}</p>

      <div className="arc-chart">
        <ArcMini kind={b.chart} />
        <div className="arc-chart-meta">
          <span className="meta-mono">{b.lead.cat.toUpperCase()} · {b.lead.nbhd.toUpperCase()}</span>
          <span className="lead-v" style={{ color: b.lead.type === "drop" ? "var(--green)" : b.lead.type === "spike" ? "var(--red)" : "var(--amber)" }}>{b.lead.v}</span>
        </div>
      </div>

      <div className="arc-stats">
        <div><span className="n" style={{ color: "var(--red)" }}>{b.anomalies.spike}</span><span className="l">spikes</span></div>
        <div><span className="n" style={{ color: "var(--green)" }}>{b.anomalies.drop}</span><span className="l">drops</span></div>
        <div><span className="n" style={{ color: "var(--amber)" }}>{b.anomalies.rare}</span><span className="l">rare</span></div>
        <div><span className="n">{b.anomalies.spike + b.anomalies.drop + b.anomalies.rare}</span><span className="l">total</span></div>
      </div>

      <div className="arc-foot">
        <div className="arc-top">
          <span className="meta-mono">TOP NBHDS</span>
          {b.top.slice(0, 3).map((n, i) => <span key={i} className="nb">{n}</span>)}
        </div>
        <span className="read">Read briefing<Ic.arrow s={12} /></span>
      </div>
    </a>
  );
}

// ---------------------------------------------------------
// Year section header
// ---------------------------------------------------------
function YearSeparator({ year, count }) {
  return (
    <div className="arc-year">
      <h2>{year}</h2>
      <span className="meta-mono">{count} BRIEFINGS</span>
      <span className="line" />
      <a href="#" className="meta-mono">View {year} year-in-review →</a>
    </div>
  );
}

// ---------------------------------------------------------
// Page
// ---------------------------------------------------------
function ArchivePage() {
  const [filters, setFilters] = useStateArc({ year: null, type: null, cat: null, nbhd: null });

  const filtered = BRIEFINGS.filter(b => {
    if (filters.year && b.y !== filters.year) return false;
    if (filters.type && b.lead.type !== filters.type) return false;
    if (filters.cat && !b.cats.includes(filters.cat)) return false;
    if (filters.nbhd && !b.top.includes(filters.nbhd)) return false;
    return true;
  });

  // group by year
  const byYear = filtered.reduce((acc, b) => {
    (acc[b.y] = acc[b.y] || []).push(b);
    return acc;
  }, {});
  const years = Object.keys(byYear).sort((a, b) => b - a);

  return (
    <div style={{ background: "var(--paper)" }}>
      <SiteHeader active="city" />
      <Crumbs items={[{ label: "Cities", href: "#" }, { label: "San Francisco", href: "#" }, { label: "Archive" }]} />
      <ArchiveHeader count={BRIEFINGS.length} />
      <FilterBar filters={filters} setFilters={setFilters} results={filtered.length} />

      <section className="archive-grid-section">
        <div className="wrap">
          {filtered.length === 0 ? (
            <div className="empty">
              <p>No briefings match those filters.</p>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFilters({ year: null, type: null, cat: null, nbhd: null })}>Clear filters</button>
            </div>
          ) : (
            years.map(y => (
              <React.Fragment key={y}>
                <YearSeparator year={y} count={byYear[y].length} />
                <div className="arc-grid">
                  {byYear[y].map(b => <ArchiveCard key={`${b.y}-${b.m}`} b={b} />)}
                </div>
              </React.Fragment>
            ))
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

window.ArchivePage = ArchivePage;

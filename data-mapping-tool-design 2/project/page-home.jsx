/* global React, Ic, SiteHeader, SiteFooter, TrendLine, Spark */

function HomeHero() {
  return (
    <section className="home-hero">
      <div className="wrap">
        <div className="grid">
          <div>
            <div className="eyebrow">Crime trend intelligence · public data</div>
            <h1>
              What's actually <em>changing</em> in your city, this month.
            </h1>
            <p className="lead lede">
              Crime Trends turns raw incident data into <strong>flagged anomalies</strong>, neighborhood-level forecasts, and human-readable monthly briefings. No scoreboards. No dashboards-for-the-sake-of-it. Just the changes that matter.
            </p>
            <div className="actions">
              <a href="#" className="btn btn-primary">Explore San Francisco<Ic.arrow s={14} /></a>
              <a href="#" className="btn btn-ghost">How it works</a>
            </div>
          </div>
          <aside style={{ borderLeft: "1px solid var(--rule)", paddingLeft: 32 }}>
            <div className="kicker" style={{ marginBottom: 10 }}>This month, in SF</div>
            <p className="h-display" style={{ fontSize: 22, lineHeight: 1.3, margin: "0 0 14px", letterSpacing: "-0.01em" }}>
              <strong style={{ fontWeight: 500 }}>23 anomalies</strong> flagged across 41 neighborhoods. Auto theft sustained −18% YoY. Burglary spike in <strong style={{ fontWeight: 500 }}>Outer Sunset</strong>.
            </p>
            <a href="#" className="pill signal" style={{ fontSize: 12 }}>Read April briefing<Ic.arrow s={12} /></a>
          </aside>
        </div>
      </div>
    </section>
  );
}

function CitiesSection() {
  const cities = [
    { name: "San Francisco", state: "CA", pop: "808K", neigh: 41, status: "live", desc: "41 neighborhoods. Daily incident feed. Monthly briefings since Jan 2026." },
    { name: "Oakland", state: "CA", pop: "440K", neigh: 36, status: "soon", desc: "Beat-level incident data, anomaly model in calibration." },
    { name: "Los Angeles", state: "CA", pop: "3.8M", neigh: 114, status: "soon", desc: "Largest expansion. LAPD RIPA data piping through validation." },
    { name: "Seattle", state: "WA", pop: "750K", neigh: 53, status: "soon", desc: "Open Data Portal pipeline up. Forecast backtests in progress." },
    { name: "Chicago", state: "IL", pop: "2.7M", neigh: 77, status: "soon", desc: "Community-area level reporting. Targeting Q3 launch." },
    { name: "New York", state: "NY", pop: "8.3M", neigh: 195, status: "soon", desc: "NYPD CompStat 2.0 integration in scoping." },
  ];
  return (
    <section className="section section-tint">
      <div className="wrap">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="eyebrow">Coverage</div>
            <h2 className="h-display" style={{ fontSize: "clamp(28px,3vw,40px)", margin: "8px 0 0" }}>Six cities. One live, five queued.</h2>
          </div>
          <a href="#" className="muted" style={{ fontSize: 14, textDecoration: "underline", textUnderlineOffset: 3 }}>Request your city →</a>
        </div>
        <div className="cities-grid">
          {cities.map((c) => (
            <a key={c.name} href="#" className={`city-tile ${c.status}`}>
              <div className="tile-meta">
                <span>{c.state}</span><span>POP {c.pop}</span><span>{c.neigh} NBHDS</span>
              </div>
              <h3>{c.name}</h3>
              <p className="desc">{c.desc}</p>
              <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                {c.status === "live"
                  ? <span style={{ color: "var(--signal)", fontSize: 13, fontWeight: 500, display: "inline-flex", alignItems: "center", gap: 6 }}>Open city <Ic.arrow s={13} /></span>
                  : <span className="muted" style={{ fontSize: 13 }}>Get notified</span>}
                <span className="meta-mono">→</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrinciplesSection() {
  const items = [
    { ic: Ic.trend, t: "Trend, not totals", d: "Counts mislead. We index on month-over-month change, seasonality, and direction — what's actually moving." },
    { ic: Ic.shield, t: "Anomaly-first", d: "Statistical flags surface unusual movement before you notice it. No more reading rank-order tables." },
    { ic: Ic.layers, t: "Neighborhood scale", d: "City totals hide everything. We aggregate to neighborhoods so the story is locally legible." },
    { ic: Ic.doc, t: "Methodology open", d: "Every flag, every forecast, every backtest — fully documented. Read the rules; reproduce the numbers." },
  ];
  return (
    <section className="section">
      <div className="wrap">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 64, marginBottom: 48, alignItems: "end" }}>
          <div>
            <div className="eyebrow">How it works</div>
            <h2 className="h-display" style={{ fontSize: "clamp(28px,3vw,40px)", margin: "8px 0 0" }}>Four principles.</h2>
          </div>
          <p className="lead" style={{ margin: 0, maxWidth: "60ch" }}>
            Most "crime maps" are just heatmaps of arrest counts. We built this because we wanted something that could tell us whether last month was actually different — and where.
          </p>
        </div>
        <div className="principles">
          {items.map((p, i) => (
            <div key={i} className="principle">
              <div className="ic"><p.ic s={26} /></div>
              <h4>{p.t}</h4>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AnomalyExamples() {
  const items = [
    { kind: "spike", chip: "SPIKE", title: "Outer Sunset · burglary +63% MoM", body: "March count 47 vs 12-mo avg 28.8 (z=2.6). Concentrated west of 41st Ave; weekday afternoons.", time: "Apr 03" },
    { kind: "drop", chip: "SUSTAINED DROP", title: "Bayview · auto theft −41% YoY", body: "Six straight months below trend. Coincides with bait-vehicle program rollout in Q4 2025.", time: "Mar 28" },
    { kind: "rare", chip: "RARE EVENT", title: "Russian Hill · arson cluster", body: "5 incidents within 0.4 mi over 11 days. Last comparable cluster: Aug 2019.", time: "Apr 11" },
  ];
  return (
    <section className="section section-tint">
      <div className="wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="eyebrow">What you'll get</div>
            <h2 className="h-display" style={{ fontSize: "clamp(28px,3vw,40px)", margin: "8px 0 0" }}>Three flagged anomalies, three weeks ago.</h2>
          </div>
          <span className="meta-mono">PUBLISHED · APR 2026 BRIEFING</span>
        </div>
        <div className="anomaly-strip">
          {items.map((a, i) => (
            <div key={i} className={`anomaly-card ${a.kind}`}>
              <div className="head">
                <span className={`chip ${a.kind === "spike" ? "low" : a.kind === "drop" ? "high" : "mid"}`}>{a.chip}</span>
                <span className="meta-mono" style={{ marginLeft: "auto" }}>{a.time}</span>
              </div>
              <h4>{a.title}</h4>
              <p>{a.body}</p>
              <div style={{ marginTop: 14, height: 44 }}>
                <TrendLine height={44} color={a.kind === "drop" ? "#6FCF97" : a.kind === "spike" ? "#FF6B6B" : "#E6B450"} />
              </div>
              <a href="#" style={{ color: "var(--signal)", fontSize: 13, marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6 }}>Read the analysis<Ic.arrow s={13} /></a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CityShowcase() {
  return (
    <section className="story-band">
      <div className="wrap">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64, alignItems: "center" }}>
          <div>
            <div className="eyebrow">Live now · San Francisco</div>
            <h2 className="h-display" style={{ fontSize: "clamp(32px,3.6vw,48px)", margin: "12px 0 18px", lineHeight: 1.05 }}>
              Every neighborhood, <em className="h-italic">explained</em>.
            </h2>
            <p className="lead" style={{ margin: "0 0 24px", maxWidth: "48ch" }}>
              The city hub gives you the interactive map. Each neighborhood gets its own page — a long-form briefing assembled from this month's data: anomalies, sustained shifts, forecasts, and the methodology behind every flag.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="#" className="btn btn-primary">Open San Francisco<Ic.arrow s={14} /></a>
              <a href="#" className="btn btn-ghost">See a neighborhood</a>
            </div>
          </div>
          <div style={{ background: "var(--graphite)", borderRadius: 10, overflow: "hidden", border: "1px solid var(--ink)" }}>
            <div style={{ padding: "10px 14px", background: "var(--graphite-2)", color: "#BFC6D4", fontFamily: "var(--font-mono)", fontSize: 11, letterSpacing: "0.08em", borderBottom: "1px solid var(--graphite-3)", display: "flex", justifyContent: "space-between" }}>
              <span>SAN FRANCISCO · APR 2026 · BURGLARY</span>
              <span>Z-SCORE → COLOR</span>
            </div>
            <div style={{ height: 320, position: "relative" }}>
              <window.HexMapDark />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeCTA() {
  return (
    <section className="section" style={{ textAlign: "center" }}>
      <div className="wrap-narrow">
        <p className="h-display" style={{ fontWeight: 400, fontSize: "clamp(28px,3.6vw,46px)", lineHeight: 1.12, margin: 0, textWrap: "balance" }}>
          Your city. Only the things that <em className="h-italic">actually changed</em>, every month.
        </p>
        <div style={{ marginTop: 32, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="#" className="btn btn-primary">Open San Francisco<Ic.arrow s={14} /></a>
          <a href="#" className="btn btn-ghost">Read the methodology</a>
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: 18 }}>Free. No accounts. No tracking. Bookmark the city page and check back monthly.</p>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <div style={{ background: "var(--paper)" }}>
      <SiteHeader active="home" />
      <HomeHero />
      <CitiesSection />
      <PrinciplesSection />
      <AnomalyExamples />
      <CityShowcase />
      <HomeCTA />
      <SiteFooter />
    </div>
  );
}

window.HomePage = HomePage;

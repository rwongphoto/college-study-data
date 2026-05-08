/* global React, Ic, SiteHeader, SiteFooter, Crumbs, TrendLine, Spark, Locator */
const { useState: useStateNbhd, useEffect: useEffectNbhd } = React;

function NbhdHero() {
  return (
    <section className="nbhd-hero">
      <div className="wrap">
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className="chip low">SPIKE · BURGLARY</span>
          <span className="chip ink">APRIL 2026 BRIEFING</span>
          <span className="meta-mono" style={{ marginLeft: "auto" }}>SF · DISTRICT 4 · ZIP 94122 · 35.2K RESIDENTS</span>
        </div>
        <h1>Outer Sunset</h1>
        <div className="summary">
          <p className="lede">
            Burglary in Outer Sunset jumped <strong>63% month-over-month</strong> in March, the largest spike anywhere in the city — concentrated west of 41st Avenue, on weekday afternoons. Auto theft, by contrast, kept its multi-month decline. This is what's worth knowing about Outer Sunset right now, and how confident we are in each call.
          </p>
          <div className="hero-chart">
            <div className="hc-head">
              <span className="meta-mono">BURGLARY · 24-MO COUNT</span>
              <span className="meta-mono" style={{ color: "var(--score-low)" }}>MAR ↑ 47</span>
            </div>
            <div className="hc-canvas">
              <BurglaryHeroChart />
            </div>
            <div className="hc-foot">
              <div className="hc-stat"><span className="num signal">+63%</span><span className="lbl">MoM</span></div>
              <div className="hc-stat"><span className="num">+22%</span><span className="lbl">YoY</span></div>
              <div className="hc-stat"><span className="num">2.6σ</span><span className="lbl">vs 12-mo μ</span></div>
              <div className="hc-stat"><span className="num">47</span><span className="lbl">Mar count</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Hero "anomaly in context" chart: 24-month count series with rolling mean,
// ±1σ band, and the flagged March bar highlighted in red.
function BurglaryHeroChart() {
  const W = 480, H = 200, pad = { l: 28, r: 12, t: 14, b: 22 };
  const counts = [22, 26, 31, 28, 33, 30, 25, 22, 24, 21, 27, 30, 29, 25, 31, 28, 26, 23, 22, 25, 27, 29, 26, 47];
  const months = ["A","M","J","J","A","S","O","N","D","J","F","M","A","M","J","J","A","S","O","N","D","J","F","M"];
  const max = 55, min = 0;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const bw = innerW / counts.length;
  const x = (i) => pad.l + i * bw + bw * 0.18;
  const w = bw * 0.64;
  const y = (v) => pad.t + innerH - ((v - min) / (max - min)) * innerH;

  // rolling 12-month mean (computed on the prior 12 of the trailing 23 → simple version)
  const mean = 27.4, sigma = 7.0;
  const meanY = y(mean), upY = y(mean + sigma), loY = y(mean - sigma);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      {/* sigma band */}
      <rect x={pad.l} y={upY} width={innerW} height={loY - upY} fill="var(--blue-wash)" opacity="0.55" />
      {/* mean line */}
      <line x1={pad.l} y1={meanY} x2={W - pad.r} y2={meanY} stroke="var(--fg-4)" strokeDasharray="3 3" strokeWidth="1" />
      {/* y-axis ticks */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--fg-4)">
        {[0, 20, 40].map(v => (
          <g key={v}>
            <line x1={pad.l - 3} y1={y(v)} x2={pad.l} y2={y(v)} stroke="var(--fg-5)" />
            <text x={pad.l - 6} y={y(v) + 3} textAnchor="end">{v}</text>
          </g>
        ))}
        <text x={W - pad.r} y={meanY - 4} textAnchor="end" fill="var(--fg-3)">μ 27.4 · σ 7.0</text>
      </g>
      {/* bars */}
      {counts.map((v, i) => {
        const last = i === counts.length - 1;
        const fill = last ? "var(--score-low)" : "var(--fg-3)";
        const op = last ? 1 : 0.55;
        return (
          <rect key={i} x={x(i)} y={y(v)} width={w} height={pad.t + innerH - y(v)} fill={fill} opacity={op} rx="0.5" />
        );
      })}
      {/* spike annotation */}
      <g>
        <line x1={x(counts.length - 1) + w / 2} y1={y(47) - 4} x2={x(counts.length - 1) + w / 2} y2={y(47) - 22} stroke="var(--score-low)" strokeWidth="1" />
        <circle cx={x(counts.length - 1) + w / 2} cy={y(47) - 24} r="2" fill="var(--score-low)" />
        <text x={x(counts.length - 1) + w / 2 - 6} y={y(47) - 28} fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill="var(--score-low)" textAnchor="end" fontWeight="500">SPIKE z=2.6</text>
      </g>
      {/* x-axis labels (every 4th) */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="var(--fg-4)">
        {months.map((m, i) => (i % 4 === 0 || i === months.length - 1) && (
          <text key={i} x={x(i) + w / 2} y={H - 8} textAnchor="middle">{m}</text>
        ))}
        <text x={pad.l} y={H - 2} fontSize="8.5" fill="var(--fg-5)">APR '24</text>
        <text x={W - pad.r} y={H - 2} textAnchor="end" fontSize="8.5" fill="var(--fg-5)">MAR '26</text>
      </g>
    </svg>
  );
}

function Toc({ active }) {
  const items = [
    { id: "tldr", n: "01", t: "TL;DR" },
    { id: "anomalies", n: "02", t: "Flagged anomalies" },
    { id: "categories", n: "03", t: "By category" },
    { id: "trends", n: "04", t: "Sustained trends" },
    { id: "forecast", n: "05", t: "Forecast" },
    { id: "context", n: "06", t: "Context & comps" },
    { id: "methodology", n: "07", t: "Methodology" },
  ];
  return (
    <aside className="toc">
      <h5>On this page</h5>
      <ol>
        {items.map((it) => (
          <li key={it.id}>
            <a href={`#${it.id}`} className={active === it.id ? "active" : ""}>
              <span className="meta-mono" style={{ marginRight: 8, color: "var(--ink-4)" }}>{it.n}</span>{it.t}
            </a>
          </li>
        ))}
      </ol>
      <div style={{ marginTop: 28, fontSize: 12 }}>
        <h5>Quick stats</h5>
        <div className="nbhd-meta">
          <div className="stat"><div className="num signal">+63%</div><div className="label">MoM burglary</div></div>
          <div className="stat"><div className="num">2.6σ</div><div className="label">vs trailing 12mo</div></div>
        </div>
      </div>
    </aside>
  );
}

function NbhdBody() {
  return (
    <div className="nbhd-content">
      <section id="tldr">
        <div className="kicker">01 · TL;DR</div>
        <h2 style={{ marginTop: 8 }}>One bad month for burglary; everything else is fine.</h2>
        <p className="lede">
          Outer Sunset is having a noisy month: a sharp, geographically concentrated burglary spike sits on top of an otherwise calm picture. Auto theft and robbery are both below trend; assault is flat. This briefing leads on the spike because it is genuinely unusual; the rest is unchanged.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          <span className="pill signal">1 spike flagged</span>
          <span className="pill">2 sustained drops</span>
          <span className="pill">0 rare events</span>
          <span className="pill">7 categories below trend</span>
        </div>
      </section>

      <section id="anomalies">
        <div className="kicker">02 · Flagged anomalies</div>
        <h2>Flagged anomalies <span className="count">3</span></h2>

        <div className="flag spike">
          <div className="head">
            <span className="chip low">SPIKE</span>
            <span className="meta-mono">FLAGGED APR 03 · BURGLARY · z = 2.6</span>
          </div>
          <h3>Burglary count nearly doubled in March (+63% MoM, +22% YoY).</h3>
          <p>March 2026 logged 47 burglary incidents in Outer Sunset, against a trailing 12-month average of 28.8 (σ = 7.0). 36 of the 47 occurred west of 41st Avenue, and 71% were on weekdays between 11am and 4pm — a pattern consistent with daytime residential burglary, not commercial.</p>
          <div style={{ height: 80, margin: "12px 0" }}>
            <TrendLine height={80} color="#FF6B6B" />
          </div>
          <div className="actions">
            <a href="#">See incident map →</a>
            <a href="#">Compare to 2019 cluster →</a>
            <a href="#">Methodology for spike rule →</a>
          </div>
        </div>

        <div className="flag drop">
          <div className="head">
            <span className="chip high">SUSTAINED DROP</span>
            <span className="meta-mono">FLAGGED MAR 14 · AUTO THEFT · z = −2.1</span>
          </div>
          <h3>Auto theft now five months below trend, citywide-aligned.</h3>
          <p>This isn't a local story — auto theft is down across SF — but Outer Sunset is one of the steeper declines, with March count 19 vs. a trailing average of 31. We expect the trend to continue through Q2 based on the citywide pattern.</p>
          <div className="actions">
            <a href="#">View citywide auto theft →</a>
            <a href="#">Read why auto theft is dropping →</a>
          </div>
        </div>

        <div className="flag drop sustained">
          <div className="head">
            <span className="chip high">SUSTAINED DROP</span>
            <span className="meta-mono">FLAGGED FEB 09 · ROBBERY · z = −1.8</span>
          </div>
          <h3>Robbery quietly declining since November.</h3>
          <p>Five consecutive months below the 12-month moving average. The decline is monotonic and has tightened the trailing variance — this is the kind of move that often precedes the average resetting downward.</p>
        </div>
      </section>

      <section id="categories">
        <div className="kicker">03 · By category</div>
        <h2>All ten categories, last 90 days.</h2>
        <p>Each panel: 90-day daily count, with 12-month mean as a dashed reference. Boxed border = anomaly. Grey out = below-volume threshold for statistical flagging.</p>
        <div className="sm-grid" style={{ marginTop: 18 }}>
          {[
            { n: "Burglary", v: "+63%", spike: true, color: "#FF6B6B" },
            { n: "Auto theft", v: "−12%", drop: true, color: "#6FCF97" },
            { n: "Robbery", v: "−21%", drop: true, color: "#6FCF97" },
            { n: "Assault", v: "+4%", color: "#E8ECF2" },
            { n: "Larceny", v: "−8%", color: "#E8ECF2" },
            { n: "Vandalism", v: "+2%", color: "#E8ECF2" },
            { n: "Arson", v: "—", muted: true, color: "#5C6478" },
            { n: "Drug offenses", v: "+1%", color: "#E8ECF2" },
            { n: "Weapons", v: "—", muted: true, color: "#5C6478" },
          ].map((c, i) => (
            <div key={i} className={`sm ${c.spike ? "spike" : ""} ${c.drop ? "drop" : ""}`}>
              <div className="head"><span>{c.n}</span><span style={{ color: c.muted ? "var(--ink-4)" : c.spike ? "var(--score-low)" : c.drop ? "var(--score-high)" : "var(--ink)", fontFamily: "var(--font-mono)", fontSize: 12 }}>{c.v}</span></div>
              <div style={{ height: 50 }}><TrendLine height={50} color={c.color} dashed={c.muted} /></div>
              <div className="foot"><span>JAN '26</span><span>APR '26</span></div>
            </div>
          ))}
        </div>
      </section>

      <section id="trends">
        <div className="kicker">04 · Sustained trends</div>
        <h2>What's been quietly true for a year.</h2>
        <p>Spikes get attention. Sustained shifts shape policy. Three multi-quarter patterns we're tracking in Outer Sunset:</p>
        <ul style={{ listStyle: "none", padding: 0, margin: "20px 0", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { t: "Auto theft has reset to a lower baseline.", b: "The trailing 12-month mean dropped from 36/mo to 24/mo over Jul 2025 → Apr 2026. Likely to be permanent if the citywide trend holds." },
            { t: "Burglary seasonality is steepening.", b: "Winter trough is shallower year-over-year, summer peak is taller. The March spike is consistent with an earlier-arriving peak." },
            { t: "Reported vandalism is below capture threshold.", b: "Counts have been low enough that we no longer flag anomalies in this category. We'll re-enable when the trailing 90-day count crosses 10." },
          ].map((t, i) => (
            <li key={i} style={{ paddingLeft: 20, borderLeft: "2px solid var(--ink)" }}>
              <strong style={{ fontWeight: 500 }}>{t.t}</strong>
              <p style={{ margin: "6px 0 0", fontSize: 15 }}>{t.b}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="forecast">
        <div className="kicker">05 · Forecast</div>
        <h2>What May 2026 likely looks like.</h2>
        <p>Naïve seasonal forecast (12-month seasonal mean × trailing 3-month adjustment), with a 90% prediction interval. We don't claim these are good. We claim they are honest about uncertainty.</p>
        <div className="forecast-grid" style={{ marginTop: 18 }}>
          {[
            { n: "Burglary", v: "38", ci: "[24 – 56]", color: "#FF6B6B" },
            { n: "Auto theft", v: "21", ci: "[14 – 30]", color: "#6FCF97" },
            { n: "Assault", v: "12", ci: "[7 – 18]", color: "#E8ECF2" },
            { n: "Robbery", v: "5", ci: "[2 – 9]", color: "#6FCF97" },
          ].map((f, i) => (
            <div key={i} className="forecast-block">
              <div className="head"><h4>{f.n}</h4><span className="meta-mono">MAY '26</span></div>
              <div style={{ height: 60 }}><TrendLine height={60} color={f.color} showCI /></div>
              <div className="ci">point estimate <strong style={{ color: "var(--ink)", fontWeight: 500 }}>{f.v}</strong> · 90% CI {f.ci}</div>
            </div>
          ))}
          <div className="forecast-block no-data">
            <div className="head"><h4>Arson</h4><span className="meta-mono">—</span></div>
            <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "8px 0 0" }}>Below volume threshold (n &lt; 10 in trailing window). No forecast issued.</p>
          </div>
          <div className="forecast-block no-data">
            <div className="head"><h4>Weapons</h4><span className="meta-mono">—</span></div>
            <p style={{ fontSize: 13, color: "var(--ink-3)", margin: "8px 0 0" }}>Below volume threshold. No forecast issued.</p>
          </div>
        </div>
      </section>

      <section id="context">
        <div className="kicker">06 · Context & comps</div>
        <h2>How Outer Sunset compares.</h2>
        <p>Three peer comparisons. We pick peers by demographic + housing-stock similarity, not by adjacency.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginTop: 18 }}>
          {[
            { n: "Inner Sunset", note: "Adjacent peer · burglary +14% MoM" },
            { n: "Richmond (Outer)", note: "Demographic peer · burglary +9% MoM" },
            { n: "Excelsior", note: "Housing-stock peer · burglary +3% MoM" },
          ].map((p, i) => (
            <div key={i} className="card">
              <div className="kicker" style={{ marginBottom: 6 }}>PEER NEIGHBORHOOD</div>
              <h4 className="h-display" style={{ fontSize: 20, margin: "0 0 8px" }}>{p.n}</h4>
              <p style={{ fontSize: 13, color: "var(--ink-2)", margin: "0 0 12px" }}>{p.note}</p>
              <div style={{ height: 44 }}><TrendLine height={44} color="#E8ECF2" /></div>
              <a href="#" style={{ color: "var(--signal)", fontSize: 13, marginTop: 10, display: "inline-flex", alignItems: "center", gap: 4 }}>Open page<Ic.arrow s={12} /></a>
            </div>
          ))}
        </div>
      </section>

      <section id="methodology">
        <div className="kicker">07 · Methodology</div>
        <h2>How we built this page.</h2>
        <div className="method">
          <h3>Data → Anomalies → Forecast → Page</h3>
          <p style={{ margin: "0 0 10px", fontSize: 15 }}>
            Incident data is pulled nightly from SFPD's open dataset, cleaned for known reclassification periods, aggregated to neighborhood × category × month. Anomalies are flagged using the rules below. Forecasts are seasonal-naïve with trailing adjustment. Each section above is auto-generated from these outputs; the prose is written by a human against the numbers.
          </p>
          <p style={{ margin: 0, fontSize: 14, color: "var(--ink-3)" }}>
            <strong style={{ color: "var(--ink)", fontWeight: 500 }}>Spike rule:</strong> z ≥ 2.0 AND MoM% ≥ 25%. <strong style={{ color: "var(--ink)", fontWeight: 500, marginLeft: 12 }}>Drop rule:</strong> z ≤ −1.8 AND ≥ 3 consecutive months below mean. <strong style={{ color: "var(--ink)", fontWeight: 500, marginLeft: 12 }}>Rare event:</strong> n ≥ 5 within 0.5 mi over ≤ 14 days, no equal cluster in trailing 36 months.
          </p>
          <div className="links">
            <a href="#">Read full methodology →</a>
            <a href="#">View backtest →</a>
            <a href="#">Download this neighborhood as CSV →</a>
            <a href="#">Source: SFPD Open Data →</a>
          </div>
        </div>
      </section>

      <div style={{ marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--rule)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <a href="#" className="muted" style={{ fontSize: 14, textDecoration: "none" }}>← Inner Sunset</a>
        <a href="#" className="btn btn-ghost btn-sm">Back to San Francisco map</a>
        <a href="#" className="muted" style={{ fontSize: 14, textDecoration: "none" }}>Parkside →</a>
      </div>
    </div>
  );
}

function NbhdPage() {
  return (
    <div style={{ background: "var(--paper)" }}>
      <SiteHeader active="nbhd" />
      <Crumbs items={[{ label: "Cities", href: "#" }, { label: "San Francisco", href: "#" }, { label: "Outer Sunset" }]} />
      <NbhdHero />
      <div className="wrap">
        <div className="nbhd-layout">
          <Toc active="anomalies" />
          <NbhdBody />
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

window.NbhdPage = NbhdPage;

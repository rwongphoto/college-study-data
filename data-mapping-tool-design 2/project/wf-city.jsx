/* global React, HandIcon, Squig, HexMapSketch, TrendChart, Spark, BarMini */

// ============================================================
// CITY PAGE WIREFRAMES — three variations on "where is what?"
// ============================================================

// ------------------------------------------------------------
// V1 — Faithful: classic exploration (map + filters + side panel + ranking table)
// Closest to the Review Velocity inspiration but reskinned for crime.
// ------------------------------------------------------------
const CityV1 = () => (
  <div className="frame">
    <div className="frame-head">
      <span className="lights"><span /><span /><span /></span>
      <span className="url">crimetrends.sf / explore</span>
      <span className="muted">city · sf · v1 — faithful</span>
    </div>

    {/* top toolbar — search + global controls */}
    <div style={{ display: "flex", gap: 8, padding: "10px 14px", borderBottom: "1.5px solid #15181C", alignItems: "center", background: "#EEE8DC" }}>
      <div className="h-display" style={{ fontSize: 22, marginRight: 12 }}>
        Crime Trends <em style={{ color: "#B33A3A", fontStyle: "italic" }}>SF</em>
      </div>
      <div className="sk-input" style={{ flex: 1, maxWidth: 360, display: "flex", alignItems: "center", gap: 8 }}>
        <HandIcon kind="search" size={14} color="#55595F" />
        <span className="muted">Search neighborhood or address…</span>
      </div>
      <span style={{ flex: 1 }} />
      <span className="tiny">Last 12 months · updated Apr 2026</span>
      <span className="sk-pill ghost"><HandIcon kind="info" size={12} /> Methodology</span>
    </div>

    {/* filter rail */}
    <div className="map-controls">
      <span className="tiny" style={{ marginRight: 4 }}>View</span>
      <span className="sk-pill active">Choropleth</span>
      <span className="sk-pill">Heatmap</span>
      <span className="sk-pill">Hex grid</span>
      <span style={{ width: 12, borderLeft: "1px solid #B8AE96", height: 22 }} />
      <span className="tiny" style={{ margin: "0 4px" }}>Type</span>
      <span className="sk-pill active">All</span>
      <span className="sk-pill">Violent</span>
      <span className="sk-pill">Burglary</span>
      <span className="sk-pill">Theft from vehicle</span>
      <span className="sk-pill">Other theft</span>
      <span className="sk-pill">MV theft</span>
      <span className="sk-pill">Vandalism</span>
      <span style={{ flex: 1 }} />
      <span className="sk-pill ghost"><HandIcon kind="share" size={12} /> Share view</span>
    </div>

    {/* main split */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", minHeight: 540 }}>
      {/* MAP */}
      <div style={{ position: "relative", borderRight: "1.5px solid #15181C" }}>
        <div className="sk-map" style={{ border: "none", borderRadius: 0, height: 540, position: "relative" }}>
          <HexMapSketch mode="choropleth" />
          {/* legend */}
          <div className="legend">
            <div style={{ marginBottom: 4 }}>Per-capita rate (12mo)</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10 }}>low</span>
              <span className="legend-grad" />
              <span style={{ fontSize: 10 }}>high</span>
            </div>
          </div>
          {/* time scrubber bottom right */}
          <div style={{ position: "absolute", right: 12, bottom: 12, background: "rgba(245,241,234,0.92)", border: "1.25px solid #15181C", padding: "6px 10px", borderRadius: 4, width: 200 }}>
            <div className="tiny" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Apr '25</span><span>Apr '26</span>
            </div>
            <svg viewBox="0 0 180 14" style={{ width: "100%", height: 14 }}>
              <line x1="2" y1="7" x2="178" y2="7" stroke="#55595F" strokeWidth="1.5" />
              <circle cx="155" cy="7" r="5" fill="#2B6CFF" stroke="#15181C" strokeWidth="1" />
            </svg>
          </div>
          {/* annotation */}
          <div className="sk-anno" style={{ top: 18, right: 200 }}>
            ↓ click any neighborhood
          </div>
        </div>
      </div>

      {/* SIDE PANEL — neighborhood summary */}
      <div className="side-panel" style={{ background: "#F5F1EA" }}>
        <div className="row between center">
          <span className="eyebrow">neighborhood</span>
          <HandIcon kind="x" size={14} color="#55595F" />
        </div>
        <h4>Mission</h4>
        <div className="muted" style={{ fontSize: 13, marginTop: -8 }}>
          1.2 sq mi · pop. 60,318 · 2024 ACS
        </div>
        <a href="#" style={{ fontSize: 13, color: "#2B6CFF", textDecoration: "underline" }}>Open full neighborhood page →</a>

        <div className="sk-line" />

        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>last 12 months</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <div className="sk-box tint" style={{ padding: "8px 10px" }}>
              <div className="tiny">Total incidents</div>
              <div className="h-display" style={{ fontSize: 26 }}>4,217</div>
              <div style={{ fontSize: 12, color: "#B33A3A", display: "flex", alignItems: "center", gap: 4 }}>
                <HandIcon kind="arrow-up" size={11} color="#B33A3A" /> +18% vs prior 12mo
              </div>
            </div>
            <div className="sk-box tint" style={{ padding: "8px 10px" }}>
              <div className="tiny">Per 1,000 residents</div>
              <div className="h-display" style={{ fontSize: 26 }}>69.9</div>
              <div style={{ fontSize: 12, color: "#55595F" }}>city avg 51.2</div>
            </div>
          </div>
        </div>

        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>by category</div>
          {[
            ["Theft from vehicle", 1820, "up"],
            ["Other theft",         920, "up"],
            ["Burglary",            410, "down"],
            ["MV theft",            320, "up"],
            ["Vandalism",           480, "flat"],
            ["Violent",             267, "flat"],
          ].map(([k, n, dir]) => (
            <div key={k} style={{ display: "grid", gridTemplateColumns: "1fr auto 60px", gap: 10, alignItems: "center", padding: "5px 0", borderBottom: "1px dashed #D9D1BD" }}>
              <span style={{ fontSize: 14 }}>{k}</span>
              <span className="mono-tiny" style={{ fontSize: 12 }}>{n.toLocaleString()}</span>
              <Spark down={dir === "down"} color={dir === "flat" ? "#8A8E93" : undefined} />
            </div>
          ))}
        </div>

        <div className="flag-card" style={{ borderColor: "#B33A3A", background: "#F5DDDD" }}>
          <div className="flag-head"><span className="sk-chip low">SPIKE</span> <span className="muted">theft from vehicle</span></div>
          <div className="flag-body">
            12-mo total of <b>1,820</b> is 2.7σ above the 2018–2024 baseline mean of 1,210.
            6-mo trend confirms.
          </div>
        </div>

        <a href="#" style={{ fontSize: 13, color: "#2B6CFF" }}>3 more flags →</a>
      </div>
    </div>

    {/* bottom rankings table */}
    <div style={{ borderTop: "1.5px solid #15181C", padding: "12px 16px", background: "#EEE8DC" }}>
      <div className="row between center" style={{ marginBottom: 8 }}>
        <div className="h-display" style={{ fontSize: 18 }}>Neighborhood rankings</div>
        <div className="row gap-2 center">
          <span className="sk-pill active">Per capita</span>
          <span className="sk-pill">Total</span>
          <span className="sk-pill">Δ vs prior year</span>
          <span className="sk-pill">Flags</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "30px 1.5fr .8fr .8fr .8fr 1fr 80px", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "1.5px solid #15181C", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#55595F" }}>
        <span>#</span><span>Neighborhood</span><span>Total</span><span>Per 1k</span><span>Δ YoY</span><span>Trend</span><span>Flags</span>
      </div>
      {[
        [1, "Tenderloin",        5612, 132.4, "+22%", "down", 2],
        [2, "South of Market",   4980,  98.6, "+11%", "down", 1],
        [3, "Mission",           4217,  69.9, "+18%", "down", 4],
        [4, "Bayview",           3104,  82.1, "-4%",  "up",   0],
        [5, "Castro / Upper Mkt",2018,  56.3, "+9%",  "down", 1],
      ].map(([rank, name, total, pc, delta, dir, flags]) => (
        <div key={name} style={{ display: "grid", gridTemplateColumns: "30px 1.5fr .8fr .8fr .8fr 1fr 80px", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: "1px dashed #D9D1BD", fontFamily: "Kalam, cursive", fontSize: 14 }}>
          <span className="muted">{rank}</span>
          <span><a href="#" style={{ color: "#15181C", textDecoration: "underline", textDecorationColor: "#B8AE96" }}>{name}</a></span>
          <span className="mono-tiny" style={{ fontSize: 13 }}>{total.toLocaleString()}</span>
          <span className="mono-tiny" style={{ fontSize: 13 }}>{pc}</span>
          <span style={{ color: delta.startsWith("-") ? "#2E7D4F" : "#B33A3A" }}>{delta}</span>
          <Spark down={dir === "down"} />
          <span>{flags ? <span className="sk-chip low">{flags} flag{flags > 1 ? "s" : ""}</span> : <span className="muted" style={{ fontSize: 12 }}>—</span>}</span>
        </div>
      ))}
      <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>+ 36 more · all 41 SF analysis neighborhoods</div>
    </div>
  </div>
);

// ------------------------------------------------------------
// V2 — Story-led: editorial framing. Map smaller, anomaly headlines lead.
// "What's worth talking about this month?" — for journalists / civic readers.
// ------------------------------------------------------------
const CityV2 = () => (
  <div className="frame">
    <div className="frame-head">
      <span className="lights"><span /><span /><span /></span>
      <span className="url">crimetrends.sf / explore</span>
      <span className="muted">city · sf · v2 — story-led</span>
    </div>

    {/* editorial banner */}
    <div style={{ padding: "20px 28px 14px", borderBottom: "1.5px solid #15181C", background: "#F5F1EA" }}>
      <div className="row between" style={{ alignItems: "flex-end" }}>
        <div>
          <div className="tiny" style={{ marginBottom: 4 }}>San Francisco · Apr 2026 issue</div>
          <div className="h-display" style={{ fontSize: 38, lineHeight: 1, letterSpacing: "-0.01em" }}>
            What changed in the city <em style={{ color: "#B33A3A", fontStyle: "italic" }}>this month.</em>
          </div>
          <div className="muted" style={{ fontSize: 14, marginTop: 8, maxWidth: "60ch" }}>
            12 anomaly flags worth a second look across 41 neighborhoods. We rank by how unusual the change is, not how alarming.
          </div>
        </div>
        <div className="row gap-2">
          <span className="sk-pill ghost">All categories</span>
          <span className="sk-pill ghost">Last 12 months</span>
          <span className="sk-pill ghost"><HandIcon kind="info" size={11} /> Methodology</span>
        </div>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1.1fr .9fr", minHeight: 600 }}>
      {/* LEFT — editorial story feed */}
      <div style={{ padding: "20px 28px", borderRight: "1.5px solid #15181C", display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="row gap-2 center">
          <span className="tiny">Sort</span>
          <span className="sk-pill active">Most unusual</span>
          <span className="sk-pill">Largest change</span>
          <span className="sk-pill">Newest</span>
        </div>

        {/* hero story */}
        <div className="sk-box thick" style={{ padding: 16, background: "#F5DDDD", borderColor: "#B33A3A" }}>
          <div className="row gap-2 center" style={{ marginBottom: 6 }}>
            <span className="sk-chip low">SPIKE</span>
            <span className="sk-chip">Mission</span>
            <span className="sk-chip">Theft from vehicle</span>
            <span className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>flagged Apr 2026</span>
          </div>
          <div className="h-display" style={{ fontSize: 22, lineHeight: 1.15 }}>
            Mission's car break-ins are running 50% above the 7-year baseline.
          </div>
          <div className="muted" style={{ fontSize: 14, marginTop: 6 }}>
            The 12-month rolling sum of <b>1,820</b> is 2.7σ above the 2018–2024 mean of 1,210. The 6-month window confirms — this isn't a one-month blip.
          </div>
          <div style={{ marginTop: 10 }}>
            <TrendChart height={60} color="#B33A3A" />
          </div>
          <div className="row gap-3" style={{ marginTop: 8, fontSize: 13 }}>
            <a href="#" style={{ color: "#B33A3A" }}>Open Mission →</a>
            <a href="#" style={{ color: "#55595F" }}>Show on map</a>
            <a href="#" style={{ color: "#55595F" }}>Download data</a>
          </div>
        </div>

        {/* secondary stories */}
        {[
          {
            chip: "DROP",         chipCls: "high",
            place: "Bayview",     cat: "Burglary",
            head: "Burglary in Bayview is at its lowest sustained level since 2019.",
            body: "12-mo total of 162 vs baseline mean of 251 (2.6σ below). 6-mo also confirms.",
            color: "#2E7D4F", wash: "#DCEAE0",
          },
          {
            chip: "RARE EVENT",   chipCls: "mid",
            place: "Sea Cliff",   cat: "Robbery",
            head: "First reported armed robbery in Sea Cliff since 2019.",
            body: "Prior 7 years: 2 incidents total. One incident, March 2026.",
            color: "#B5842A", wash: "#F4E6C8",
          },
          {
            chip: "SUSTAINED",    chipCls: "low",
            place: "SoMa",        cat: "Other theft",
            head: "SoMa's other-theft rate has held 28% above 2023 for twelve months running.",
            body: "Poisson rate-ratio test, p < 0.001. Not a spike — a new floor.",
            color: "#B33A3A", wash: "#F5DDDD",
          },
        ].map((s, i) => (
          <div key={i} className="sk-box" style={{ padding: 14 }}>
            <div className="row gap-2 center" style={{ marginBottom: 6 }}>
              <span className={`sk-chip ${s.chipCls}`}>{s.chip}</span>
              <span className="sk-chip">{s.place}</span>
              <span className="sk-chip">{s.cat}</span>
            </div>
            <div className="h-display" style={{ fontSize: 18, lineHeight: 1.2 }}>{s.head}</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>{s.body}</div>
          </div>
        ))}

        <a href="#" className="muted" style={{ fontSize: 13 }}>+ 8 more flags this month →</a>
      </div>

      {/* RIGHT — small map + citywide topline */}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <div className="eyebrow tiny">citywide · this month</div>
          <div className="h-display" style={{ fontSize: 28, marginTop: 4 }}>52,118 incidents</div>
          <div className="muted" style={{ fontSize: 13 }}>+6% vs prior 12mo · per-capita 64.0/1k</div>
          <div style={{ marginTop: 8 }}><TrendChart height={56} /></div>
        </div>

        <div className="sk-box" style={{ padding: 0, overflow: "hidden", height: 240 }}>
          <div className="sk-map" style={{ border: "none", borderRadius: 0, height: 240, position: "relative" }}>
            <HexMapSketch mode="choropleth" />
            <div className="legend">12-mo · all categories</div>
            <div style={{ position: "absolute", right: 8, top: 8 }}>
              <span className="sk-pill ghost" style={{ background: "#F5F1EA" }}>Open full map</span>
            </div>
          </div>
        </div>

        <div>
          <div className="eyebrow tiny">by category, 12mo</div>
          <BarMini data={[1820, 920, 410, 320, 480, 267]} />
          <div className="row between" style={{ fontSize: 11, color: "#55595F", marginTop: 4 }}>
            <span>theft·v</span><span>theft</span><span>burg</span><span>mv</span><span>vand</span><span>viol</span>
          </div>
        </div>

        <div className="sk-box dashed" style={{ padding: 12, background: "#EEE8DC" }}>
          <div className="tiny" style={{ marginBottom: 4 }}>about this view</div>
          <div style={{ fontSize: 13, color: "#2A2E34" }}>
            We use rolling 12-month sums and strict thresholds (~p&lt;0.01). Drops get the same prominence as spikes.
            <a href="#" style={{ color: "#2B6CFF", marginLeft: 6 }}>How we flag →</a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ------------------------------------------------------------
// V3 — Analyst-grade: dense dashboard. Map dominant, multiple sidebars,
// timeline rail at the bottom. For the "I have 30 minutes and want every signal" user.
// ------------------------------------------------------------
const CityV3 = () => (
  <div className="frame">
    <div className="frame-head">
      <span className="lights"><span /><span /><span /></span>
      <span className="url">crimetrends.sf / explore</span>
      <span className="muted">city · sf · v3 — analyst-grade</span>
    </div>

    {/* dense top bar */}
    <div style={{ display: "flex", padding: "8px 12px", borderBottom: "1.5px solid #15181C", background: "#1B1E23", color: "#F5F1EA", alignItems: "center", gap: 10 }}>
      <div className="h-display" style={{ fontSize: 17 }}>Crime Trends</div>
      <span style={{ width: 1, height: 18, background: "#55595F" }} />
      <span className="tiny" style={{ color: "#B8AE96" }}>SF · 2018→2026 · 41 nbhds · 6 cats</span>
      <span style={{ flex: 1 }} />
      <span className="sk-pill ghost" style={{ background: "transparent", color: "#F5F1EA", borderColor: "#55595F" }}>Compare 2 places</span>
      <span className="sk-pill ghost" style={{ background: "transparent", color: "#F5F1EA", borderColor: "#55595F" }}>Export</span>
      <span className="sk-pill ghost" style={{ background: "transparent", color: "#F5F1EA", borderColor: "#55595F" }}>API</span>
    </div>

    {/* 3-column dense layout */}
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 320px", minHeight: 600 }}>
      {/* LEFT FILTER RAIL */}
      <div style={{ padding: 14, borderRight: "1.5px solid #15181C", background: "#EEE8DC", fontSize: 13 }}>
        <div className="eyebrow tiny" style={{ marginBottom: 6 }}>view</div>
        <div className="col gap-2">
          {["Choropleth (per capita)", "Choropleth (total)", "Heatmap", "Hex grid (H3 r9)", "Incident points"].map((v, i) => (
            <label key={v} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 13 }}>
              <span style={{ width: 12, height: 12, border: "1.25px solid #15181C", borderRadius: 99, background: i === 0 ? "#15181C" : "transparent", boxShadow: i === 0 ? "inset 0 0 0 2px #EEE8DC" : "none" }} />
              {v}
            </label>
          ))}
        </div>

        <div className="sk-line dashed" />

        <div className="eyebrow tiny" style={{ marginBottom: 6 }}>category</div>
        <div className="col gap-1">
          {[
            ["All", "52,118"],
            ["Violent", "2,140"],
            ["Burglary", "3,901"],
            ["Theft from vehicle", "18,402"],
            ["Other theft", "11,780"],
            ["MV theft", "6,320"],
            ["Vandalism", "5,260"],
          ].map(([k, n], i) => (
            <label key={k} style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ width: 12, height: 12, border: "1.25px solid #15181C", background: i === 0 ? "#15181C" : "transparent" }} />
                {k}
              </span>
              <span className="mono-tiny">{n}</span>
            </label>
          ))}
        </div>

        <div className="sk-line dashed" />

        <div className="eyebrow tiny" style={{ marginBottom: 6 }}>flag types</div>
        <div className="row wrap gap-1">
          {["Spike","Drop","Rare","Streak","Sustained"].map(f => (
            <span key={f} className="sk-chip" style={{ fontSize: 11 }}>{f}</span>
          ))}
        </div>

        <div className="sk-line dashed" />

        <div className="eyebrow tiny" style={{ marginBottom: 6 }}>privacy</div>
        <div style={{ fontSize: 12, color: "#55595F" }}>
          Sensitive crime types pre-aggregated to district centroids by SFPD per CA Penal Code 293.
          <a href="#" style={{ color: "#2B6CFF" }}> Read more</a>
        </div>
      </div>

      {/* CENTER — dark map */}
      <div style={{ position: "relative" }}>
        <div className="sk-map dark" style={{ border: "none", borderRadius: 0, height: "100%", position: "relative" }}>
          <HexMapSketch mode="choropleth" dark />
          <div className="legend">
            <div style={{ marginBottom: 4 }}>per capita · 12mo</div>
            <span className="legend-grad dark" />
          </div>
          {/* mini map controls */}
          <div style={{ position: "absolute", top: 12, right: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {["+","−","⌖"].map(s => (
              <span key={s} className="sk-pill" style={{ background: "#24272D", color: "#F5F1EA", borderColor: "#55595F", padding: "2px 9px" }}>{s}</span>
            ))}
          </div>
          {/* selected hex callout */}
          <div style={{ position: "absolute", left: "42%", top: "38%", background: "#F5F1EA", border: "1.5px solid #B33A3A", padding: "6px 10px", fontFamily: "Kalam", fontSize: 12, borderRadius: 4 }}>
            <div className="h-display" style={{ fontSize: 14 }}>Mission · h-3845</div>
            <div className="muted">12mo: 412 · +18% YoY</div>
          </div>
          {/* time scrubber bottom */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "8px 14px", borderTop: "1px solid #3A3E44", background: "rgba(20,22,28,0.88)", color: "#F5F1EA" }}>
            <div className="row between center" style={{ marginBottom: 4, fontSize: 11, fontFamily: "Architects Daughter" }}>
              <span>2018-01</span>
              <span style={{ color: "#2B6CFF" }}>showing: rolling 12mo ending Apr 2026</span>
              <span>2026-04</span>
            </div>
            <svg viewBox="0 0 600 16" style={{ width: "100%", height: 16 }}>
              <line x1="2" y1="8" x2="598" y2="8" stroke="#55595F" strokeWidth="1.5" />
              {/* tick markers */}
              {Array.from({ length: 9 }).map((_, i) => (
                <line key={i} x1={2 + i * 75} y1="4" x2={2 + i * 75} y2="12" stroke="#55595F" strokeWidth="1" />
              ))}
              {/* range brush */}
              <rect x="500" y="4" width="80" height="8" fill="#2B6CFF" opacity="0.35" />
              <circle cx="500" cy="8" r="5" fill="#2B6CFF" stroke="#F5F1EA" strokeWidth="1" />
              <circle cx="580" cy="8" r="5" fill="#2B6CFF" stroke="#F5F1EA" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>

      {/* RIGHT — selected nbhd + flags */}
      <div className="side-panel" style={{ background: "#F5F1EA", padding: 14 }}>
        <div className="row between center">
          <span className="eyebrow">selected</span>
          <span className="muted" style={{ fontSize: 12 }}>hex h-3845</span>
        </div>
        <h4 style={{ marginBottom: 0 }}>Mission</h4>
        <div className="muted" style={{ fontSize: 12 }}>1.2 sq mi · pop 60,318</div>

        {/* tabs */}
        <div className="row gap-1" style={{ borderBottom: "1.5px solid #15181C", marginTop: 6 }}>
          {["Overview","Flags","Trend","Compare","Data"].map((t, i) => (
            <span key={t} style={{ padding: "5px 9px", fontFamily: "Architects Daughter", fontSize: 12, borderBottom: i === 0 ? "2px solid #15181C" : "none", marginBottom: -1.5 }}>{t}</span>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
          {[["12mo","4,217"],["per 1k","69.9"],["YoY","+18%"]].map(([k,v]) => (
            <div key={k} className="sk-box tint" style={{ padding: "6px 8px", textAlign: "center" }}>
              <div className="tiny">{k}</div>
              <div className="h-display" style={{ fontSize: 18 }}>{v}</div>
            </div>
          ))}
        </div>

        <div className="eyebrow tiny">trend · 5 yr</div>
        <TrendChart height={70} showCI dashed={false} color="#15181C" />

        <div className="eyebrow tiny">flags · 4</div>
        <div className="col gap-2">
          {[
            ["SPIKE", "low", "theft from vehicle", "+50% vs baseline"],
            ["SUSTAINED", "low", "other theft", "+28% for 12mo"],
            ["DROP", "high", "burglary", "−35% sustained"],
            ["RARE", "mid", "homicide", "first since 2022"],
          ].map(([chip, cls, cat, body]) => (
            <div key={cat} className="flag-card" style={{ padding: "8px 10px" }}>
              <div className="flag-head"><span className={`sk-chip ${cls}`}>{chip}</span> {cat}</div>
              <div className="flag-body" style={{ fontSize: 13 }}>{body}</div>
            </div>
          ))}
        </div>

        <a href="#" style={{ fontSize: 13, color: "#2B6CFF" }}>Open full Mission page →</a>
      </div>
    </div>
  </div>
);

Object.assign(window, { CityV1, CityV2, CityV3 });

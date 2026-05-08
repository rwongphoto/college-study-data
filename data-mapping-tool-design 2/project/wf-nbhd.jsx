/* global React, HandIcon, Squig, LocatorMap, TrendChart, Spark, BarMini */

// ============================================================
// NEIGHBORHOOD PAGE WIREFRAMES — three variations on "how has this place changed?"
// No interactive heatmap. Trends are the differentiator.
// ============================================================

// ------------------------------------------------------------
// V4 — Vertical narrative: long-form editorial scroll.
// Reads like a feature article. Best for SEO + civic readers.
// ------------------------------------------------------------
const NbhdV4 = () => (
  <div className="frame">
    <div className="frame-head">
      <span className="lights"><span /><span /><span /></span>
      <span className="url">crimetrends.sf / mission</span>
      <span className="muted">neighborhood · v4 — vertical narrative</span>
    </div>

    {/* sticky header */}
    <div style={{ display: "flex", padding: "10px 28px", borderBottom: "1.5px solid #15181C", background: "#EEE8DC", alignItems: "center", gap: 14 }}>
      <span className="h-display" style={{ fontSize: 18 }}>Crime Trends <em style={{ color: "#B33A3A" }}>SF</em></span>
      <span className="muted" style={{ fontSize: 13 }}>· Mission</span>
      <span style={{ flex: 1 }} />
      <span className="sk-pill ghost">Back to map</span>
      <span className="sk-pill ghost">All neighborhoods ▾</span>
    </div>

    <div style={{ maxWidth: 880, margin: "0 auto", padding: "36px 28px 80px" }}>
      {/* hero */}
      <div className="tiny" style={{ marginBottom: 8 }}>San Francisco · Analysis Neighborhood · Updated Apr 2026</div>
      <div className="h-display" style={{ fontSize: 48, lineHeight: 1.05, letterSpacing: "-0.01em", marginBottom: 12 }}>
        How crime has changed in the <em style={{ color: "#B33A3A", fontStyle: "italic" }}>Mission</em>, 2018&ndash;2026.
      </div>
      <div style={{ fontSize: 17, color: "#2A2E34", maxWidth: "62ch", lineHeight: 1.55 }}>
        Theft from vehicles is running at its highest sustained level in the seven-year window. Burglary is at a multi-year low.
        Violent crime has held roughly flat. Below, the data behind each of those statements.
      </div>

      {/* what & where */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 28, marginTop: 36 }}>
        <div>
          <div className="eyebrow tiny" style={{ marginBottom: 6 }}>what & where</div>
          <div style={{ fontSize: 16, color: "#2A2E34" }}>
            The Mission is a 1.2 sq mi residential and commercial neighborhood in central San Francisco,
            bounded by SoMa to the north, Bernal Heights to the south, the 101 to the east, and Castro to the west.
            It is one of 41 official Analysis Neighborhoods used by the city.
          </div>
          <div className="row gap-2 wrap" style={{ marginTop: 12 }}>
            {["SoMa", "Bernal Heights", "Mission Dolores", "Castro", "Potrero Hill"].map(n => (
              <a key={n} href="#" className="sk-pill ghost" style={{ fontSize: 12 }}>{n}</a>
            ))}
          </div>
        </div>
        <div className="sk-box" style={{ padding: 6, background: "#F5F1EA" }}>
          <LocatorMap name="Mission" h={200} />
          <div className="tiny" style={{ textAlign: "center", padding: "6px 0" }}>locator · static</div>
        </div>
      </div>

      <hr style={{ border: 0, borderTop: "1.5px solid #B8AE96", margin: "36px 0" }} />

      {/* who */}
      <div className="eyebrow tiny" style={{ marginBottom: 6 }}>who lives here</div>
      <div className="row gap-5" style={{ marginBottom: 8, alignItems: "baseline" }}>
        <div>
          <div className="h-display" style={{ fontSize: 36 }}>60,318</div>
          <div className="muted" style={{ fontSize: 13 }}>residents · ACS 2024 5-yr</div>
        </div>
        <div>
          <div className="h-display" style={{ fontSize: 36 }}>50,265</div>
          <div className="muted" style={{ fontSize: 13 }}>per sq mi · density</div>
        </div>
      </div>
      <div className="muted" style={{ fontSize: 13, fontStyle: "italic" }}>
        We publish total population only — used as a denominator. We do not publish race or income data alongside crime statistics.
        <a href="#" style={{ color: "#2B6CFF", marginLeft: 4 }}>Why →</a>
      </div>

      <hr style={{ border: 0, borderTop: "1.5px solid #B8AE96", margin: "36px 0" }} />

      {/* overview numbers */}
      <div className="h-display" style={{ fontSize: 28, marginBottom: 14 }}>The last 12 months in numbers.</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 12 }}>
        {[
          ["Total incidents", "4,217", "+18% vs prior 12mo", "#B33A3A"],
          ["Per 1,000 residents", "69.9", "city avg 51.2", "#55595F"],
          ["Anomaly flags", "4", "1 spike · 1 drop · 1 sustained · 1 rare", "#55595F"],
        ].map(([k, v, d, c]) => (
          <div key={k} className="sk-box tint" style={{ padding: "12px 14px" }}>
            <div className="tiny">{k}</div>
            <div className="h-display" style={{ fontSize: 30, lineHeight: 1.05 }}>{v}</div>
            <div style={{ fontSize: 13, color: c }}>{d}</div>
          </div>
        ))}
      </div>

      <hr style={{ border: 0, borderTop: "1.5px solid #B8AE96", margin: "36px 0" }} />

      {/* small multiples */}
      <div className="h-display" style={{ fontSize: 28, marginBottom: 6 }}>Five years, six categories.</div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 18, maxWidth: "60ch" }}>
        Each chart shows monthly incidents 2018&ndash;present. Shaded band is the COVID disruption window (Mar 2020&ndash;Dec 2021),
        treated as anomaly, not trend.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {[
          ["Theft from vehicle", 1820, "spike", "+50%"],
          ["Other theft",         920, null,    "+8%"],
          ["Burglary",            410, "drop",  "−35%"],
          ["MV theft",            320, null,    "+12%"],
          ["Vandalism",           480, null,    "flat"],
          ["Violent",             267, null,    "+2%"],
        ].map(([cat, n, flag, delta]) => (
          <div key={cat} className="sm-cell">
            <div className="label">
              <span>{cat}</span>
              {flag === "spike" && <span className="sk-chip low" style={{ fontSize: 10 }}>SPIKE</span>}
              {flag === "drop"  && <span className="sk-chip high" style={{ fontSize: 10 }}>DROP</span>}
            </div>
            <TrendChart height={50} color={flag === "spike" ? "#B33A3A" : flag === "drop" ? "#2E7D4F" : "#15181C"} />
            <div className="row between" style={{ marginTop: 4, fontSize: 12 }}>
              <span className="mono-tiny">{n.toLocaleString()}/yr</span>
              <span className="mono-tiny" style={{ color: delta.startsWith("−") ? "#2E7D4F" : delta.startsWith("+") ? "#B33A3A" : "#55595F" }}>{delta}</span>
            </div>
          </div>
        ))}
      </div>

      <hr style={{ border: 0, borderTop: "1.5px solid #B8AE96", margin: "36px 0" }} />

      {/* anomaly flags as prose */}
      <div className="h-display" style={{ fontSize: 28, marginBottom: 14 }}>What's worth flagging.</div>
      <div className="col gap-4">
        <div className="sk-box thick" style={{ padding: 16, background: "#F5DDDD", borderColor: "#B33A3A" }}>
          <div className="row gap-2 center" style={{ marginBottom: 6 }}><span className="sk-chip low">SPIKE</span><span className="muted">theft from vehicle</span></div>
          <div style={{ fontSize: 16, lineHeight: 1.5 }}>
            The 12-month rolling sum of <b>1,820</b> is 2.7σ above the 2018&ndash;2024 baseline mean of 1,210.
            The 6-month window also sits above baseline + 1σ, so this is sustained, not a single-month blip.
            <a href="#" style={{ color: "#2B6CFF", marginLeft: 4 }}>See the data →</a>
          </div>
        </div>
        <div className="sk-box" style={{ padding: 14, background: "#DCEAE0", borderColor: "#2E7D4F" }}>
          <div className="row gap-2 center" style={{ marginBottom: 6 }}><span className="sk-chip high">DROP</span><span className="muted">burglary</span></div>
          <div style={{ fontSize: 15, lineHeight: 1.5 }}>
            12-mo total of <b>410</b> is 2.6σ below the baseline mean of 631 — the lowest sustained level in the window.
          </div>
        </div>
        <div className="sk-box" style={{ padding: 14, background: "#F4E6C8", borderColor: "#B5842A" }}>
          <div className="row gap-2 center" style={{ marginBottom: 6 }}><span className="sk-chip mid">RARE</span><span className="muted">homicide</span></div>
          <div style={{ fontSize: 15, lineHeight: 1.5 }}>
            One incident in March 2026. Prior 7 years saw 2 total in this neighborhood.
          </div>
        </div>
      </div>

      <hr style={{ border: 0, borderTop: "1.5px solid #B8AE96", margin: "36px 0" }} />

      {/* forecast */}
      <div className="h-display" style={{ fontSize: 28, marginBottom: 6 }}>Where the data supports it: a 12-month forecast.</div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 18 }}>
        We forecast only categories with ≥ 2 incidents/month average. Confidence intervals are 95%.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="sk-box" style={{ padding: 12 }}>
          <div className="row between" style={{ marginBottom: 6 }}>
            <span className="h-display" style={{ fontSize: 16 }}>Theft from vehicle · Apr '27</span>
            <span className="sk-chip">forecast</span>
          </div>
          <TrendChart height={100} showCI color="#B33A3A" />
          <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>1,650&ndash;2,010 (95% CI) · trained 2018&ndash;Mar 2026</div>
        </div>
        <div className="sk-box dashed" style={{ padding: 12, background: "#EEE8DC" }}>
          <div className="row between" style={{ marginBottom: 6 }}>
            <span className="h-display" style={{ fontSize: 16 }}>Violent crime</span>
            <span className="sk-chip ghost">no forecast</span>
          </div>
          <TrendChart height={100} color="#15181C" />
          <div className="muted" style={{ fontSize: 12, marginTop: 4, fontStyle: "italic" }}>
            Forecast unavailable: incident counts too low for reliable prediction. History shown.
          </div>
        </div>
      </div>

      <hr style={{ border: 0, borderTop: "1.5px solid #B8AE96", margin: "36px 0" }} />

      {/* methodology footer */}
      <div className="sk-box dashed" style={{ padding: 18, background: "#EEE8DC" }}>
        <div className="eyebrow tiny" style={{ marginBottom: 6 }}>methodology & sources</div>
        <div style={{ fontSize: 14, color: "#2A2E34", lineHeight: 1.55 }}>
          Crime data: SFPD open dataset via DataSF, post-NIBRS migration (2018&ndash;present). Boundaries: DataSF Analysis Neighborhoods.
          Population: US Census ACS 5-year, area-weighted from tracts. Some sensitive crime types (sexual assault, domestic violence)
          are pre-aggregated to district centroids by SFPD per CA Penal Code 293; counts and trends are unaffected.
          <div className="row gap-3" style={{ marginTop: 10 }}>
            <a href="#" style={{ color: "#2B6CFF" }}>Full methodology →</a>
            <a href="#" style={{ color: "#2B6CFF" }}>Backtest 2025 →</a>
            <a href="#" style={{ color: "#2B6CFF" }}>Download CSV</a>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ------------------------------------------------------------
// V5 — Summary cards: dashboard-style. TL;DR top, then drill-downs.
// Best for analyst / decision-maker who wants the numbers fast.
// ------------------------------------------------------------
const NbhdV5 = () => (
  <div className="frame">
    <div className="frame-head">
      <span className="lights"><span /><span /><span /></span>
      <span className="url">crimetrends.sf / mission</span>
      <span className="muted">neighborhood · v5 — summary cards</span>
    </div>

    <div style={{ display: "flex", padding: "10px 24px", borderBottom: "1.5px solid #15181C", background: "#1B1E23", color: "#F5F1EA", alignItems: "center", gap: 12 }}>
      <span className="h-display" style={{ fontSize: 18 }}>Mission</span>
      <span className="tiny" style={{ color: "#B8AE96" }}>SF · 1.2 sq mi · pop 60,318</span>
      <span style={{ flex: 1 }} />
      <span className="sk-pill ghost" style={{ background: "transparent", borderColor: "#55595F", color: "#F5F1EA" }}>Compare</span>
      <span className="sk-pill ghost" style={{ background: "transparent", borderColor: "#55595F", color: "#F5F1EA" }}>Download data</span>
      <span className="sk-pill ghost" style={{ background: "transparent", borderColor: "#55595F", color: "#F5F1EA" }}>Methodology</span>
    </div>

    <div style={{ padding: "24px 28px 60px" }}>
      {/* hero strip — at-a-glance */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
        <div className="sk-box thick" style={{ padding: 16 }}>
          <div className="tiny">12-month summary</div>
          <div className="h-display" style={{ fontSize: 36, lineHeight: 1.05, marginTop: 4 }}>4,217 <span style={{ fontSize: 16, color: "#55595F" }}>incidents</span></div>
          <div style={{ fontSize: 14, color: "#B33A3A", marginTop: 2 }}>+18% YoY · 69.9 per 1,000 residents</div>
          <div style={{ marginTop: 8 }}><TrendChart height={42} /></div>
        </div>
        {[
          ["Highest spike",     "Theft from vehicle", "+50%", "spike", "#B33A3A"],
          ["Largest drop",      "Burglary",           "−35%", "drop",  "#2E7D4F"],
          ["Rare event",        "Homicide",           "1 in 90d", "rare", "#B5842A"],
        ].map(([k, cat, val, kind, color]) => (
          <div key={k} className="sk-box" style={{ padding: 14, background: kind === "spike" ? "#F5DDDD" : kind === "drop" ? "#DCEAE0" : "#F4E6C8", borderColor: color }}>
            <div className="tiny">{k}</div>
            <div className="h-display" style={{ fontSize: 18, marginTop: 2 }}>{cat}</div>
            <div style={{ fontSize: 22, color, fontFamily: "Caveat, cursive", fontWeight: 700 }}>{val}</div>
            <Spark down={kind === "drop"} color={color} w={120} h={22} />
          </div>
        ))}
      </div>

      {/* tabs */}
      <div className="row gap-1" style={{ borderBottom: "1.5px solid #15181C", marginBottom: 18 }}>
        {["Overview","Trends","Flags","Forecast","Compare","Methodology"].map((t, i) => (
          <span key={t} style={{ padding: "8px 14px", fontFamily: "Architects Daughter", fontSize: 14, borderBottom: i === 0 ? "2.5px solid #15181C" : "none", marginBottom: -1.5, fontWeight: i === 0 ? 700 : 400 }}>{t}</span>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
        {/* main: trends grid */}
        <div>
          <div className="row between" style={{ marginBottom: 12 }}>
            <div className="h-display" style={{ fontSize: 22 }}>Trends by category</div>
            <div className="row gap-2">
              <span className="sk-pill ghost">12mo</span>
              <span className="sk-pill active">5yr</span>
              <span className="sk-pill ghost">All</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              ["Theft from vehicle", 1820, "spike", "+50%"],
              ["Other theft",         920, null,    "+8%"],
              ["Burglary",            410, "drop",  "−35%"],
              ["MV theft",            320, null,    "+12%"],
              ["Vandalism",           480, null,    "flat"],
              ["Violent",             267, null,    "+2%"],
            ].map(([cat, n, flag, delta]) => (
              <div key={cat} className="sk-box" style={{ padding: 12 }}>
                <div className="row between" style={{ marginBottom: 4 }}>
                  <span className="h-display" style={{ fontSize: 16 }}>{cat}</span>
                  {flag === "spike" && <span className="sk-chip low">SPIKE</span>}
                  {flag === "drop"  && <span className="sk-chip high">DROP</span>}
                </div>
                <TrendChart height={70} color={flag === "spike" ? "#B33A3A" : flag === "drop" ? "#2E7D4F" : "#15181C"} />
                <div className="row between" style={{ fontSize: 12, marginTop: 4 }}>
                  <span className="mono-tiny">{n.toLocaleString()} 12mo</span>
                  <span style={{ color: delta.startsWith("−") ? "#2E7D4F" : delta.startsWith("+") ? "#B33A3A" : "#55595F" }}>{delta} YoY</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* sidebar: locator + flags + meta */}
        <div className="col gap-4">
          <div className="sk-box" style={{ padding: 8 }}>
            <LocatorMap name="Mission" h={180} />
          </div>

          <div>
            <div className="eyebrow tiny" style={{ marginBottom: 6 }}>4 anomaly flags</div>
            <div className="col gap-2">
              {[
                ["SPIKE", "low",  "Theft from vehicle", "+50% vs baseline"],
                ["DROP",  "high", "Burglary",           "−35% sustained"],
                ["RARE",  "mid",  "Homicide",           "First since 2022"],
                ["SUSTAINED", "low", "Other theft",     "+28% for 12mo"],
              ].map(([chip, cls, cat, body]) => (
                <div key={cat} className="flag-card">
                  <div className="flag-head"><span className={`sk-chip ${cls}`}>{chip}</span> {cat}</div>
                  <div className="flag-body">{body}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="sk-box dashed" style={{ padding: 12 }}>
            <div className="eyebrow tiny" style={{ marginBottom: 4 }}>adjacent</div>
            <div className="row wrap gap-1">
              {["SoMa", "Bernal Heights", "Castro", "Potrero Hill"].map(n => (
                <a key={n} href="#" className="sk-pill ghost">{n}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ------------------------------------------------------------
// V6 — Sidebar-anchored: persistent TOC on the left, scroll content on the right.
// Like a Wikipedia / docs-style reference. Best for power users + linkability.
// ------------------------------------------------------------
const NbhdV6 = () => (
  <div className="frame">
    <div className="frame-head">
      <span className="lights"><span /><span /><span /></span>
      <span className="url">crimetrends.sf / mission#flags</span>
      <span className="muted">neighborhood · v6 — sidebar-anchored</span>
    </div>

    <div style={{ display: "flex", padding: "10px 28px", borderBottom: "1.5px solid #15181C", background: "#EEE8DC", alignItems: "center", gap: 14 }}>
      <span className="h-display" style={{ fontSize: 18 }}>Crime Trends <em style={{ color: "#B33A3A" }}>SF</em></span>
      <span className="muted" style={{ fontSize: 13 }}>· Mission</span>
      <span style={{ flex: 1 }} />
      <span className="sk-pill ghost"><HandIcon kind="search" size={11} /> Jump to neighborhood…</span>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 280px", minHeight: 700 }}>
      {/* TOC sidebar */}
      <div style={{ padding: 24, borderRight: "1.5px solid #B8AE96", background: "#F5F1EA" }}>
        <div className="eyebrow tiny" style={{ marginBottom: 10 }}>on this page</div>
        <div className="col gap-2" style={{ fontFamily: "Architects Daughter", fontSize: 14 }}>
          {[
            ["What & where", false],
            ["Who lives here", false],
            ["12-month overview", false],
            ["Trends by category", false],
            ["Anomaly flags", true],
            ["12-month forecast", false],
            ["Methodology & sources", false],
          ].map(([t, active]) => (
            <a key={t} href="#" style={{
              color: active ? "#15181C" : "#55595F",
              textDecoration: "none",
              borderLeft: active ? "2px solid #B33A3A" : "2px solid transparent",
              paddingLeft: 10,
              fontWeight: active ? 700 : 400,
            }}>{t}</a>
          ))}
        </div>

        <div className="sk-line dashed" />

        <div className="eyebrow tiny" style={{ marginBottom: 8 }}>adjacent neighborhoods</div>
        <div className="col gap-1">
          {["SoMa", "Bernal Heights", "Mission Dolores", "Castro", "Potrero Hill"].map(n => (
            <a key={n} href="#" style={{ fontFamily: "Kalam", fontSize: 13, color: "#2B6CFF" }}>→ {n}</a>
          ))}
        </div>

        <div className="sk-line dashed" />

        <div className="eyebrow tiny" style={{ marginBottom: 6 }}>compare to…</div>
        <div className="sk-input" style={{ fontSize: 12, padding: "5px 8px" }}>another neighborhood</div>
      </div>

      {/* main content area — currently scrolled to "flags" */}
      <div style={{ padding: "32px 32px 60px" }}>
        <div className="tiny" style={{ marginBottom: 6 }}>Mission · Section 5 of 7</div>
        <div className="h-display" style={{ fontSize: 36, marginBottom: 6, letterSpacing: "-0.01em" }}>
          Anomaly flags <span style={{ color: "#B33A3A" }}>(4)</span>
        </div>
        <div className="muted" style={{ fontSize: 14, marginBottom: 20, maxWidth: "62ch" }}>
          Flags fire when a 12-month rolling change is statistically significant (~p&lt;0.01) AND clears an absolute floor.
          <a href="#" style={{ color: "#2B6CFF", marginLeft: 4 }}>How we flag →</a>
        </div>

        <div className="col gap-4">
          <div className="sk-box thick" style={{ padding: 16, background: "#F5DDDD", borderColor: "#B33A3A" }}>
            <div className="row gap-2 center" style={{ marginBottom: 6 }}>
              <span className="sk-chip low">SPIKE</span>
              <span className="sk-chip">Theft from vehicle</span>
              <span className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>fired Apr 2026</span>
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.55 }}>
              The 12-month rolling sum of <b>1,820</b> is <b>2.7σ</b> above the 2018&ndash;2024 baseline mean of 1,210.
              The 6-month window also sits above baseline + 1σ. Sustained, not a blip.
            </div>
            <div style={{ marginTop: 10 }}><TrendChart height={70} color="#B33A3A" /></div>
            <div className="row gap-3" style={{ marginTop: 8, fontSize: 13 }}>
              <a href="#">Show on city map</a>
              <a href="#">CSV</a>
              <a href="#">Permalink</a>
            </div>
          </div>

          <div className="sk-box thick" style={{ padding: 16, background: "#DCEAE0", borderColor: "#2E7D4F" }}>
            <div className="row gap-2 center" style={{ marginBottom: 6 }}>
              <span className="sk-chip high">DROP</span>
              <span className="sk-chip">Burglary</span>
              <span className="muted" style={{ fontSize: 12, marginLeft: "auto" }}>fired Mar 2026</span>
            </div>
            <div style={{ fontSize: 15, lineHeight: 1.55 }}>
              12-mo total of <b>410</b> is 2.6σ below the baseline mean of 631 — the lowest sustained level in the window.
            </div>
            <div style={{ marginTop: 10 }}><TrendChart height={70} color="#2E7D4F" /></div>
          </div>

          <div className="sk-box" style={{ padding: 14, background: "#F4E6C8", borderColor: "#B5842A" }}>
            <div className="row gap-2 center" style={{ marginBottom: 6 }}>
              <span className="sk-chip mid">RARE EVENT</span>
              <span className="sk-chip">Homicide</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
              One incident in March 2026. Prior 7 years: 2 incidents total in the Mission (2019, 2022).
            </div>
          </div>

          <div className="sk-box" style={{ padding: 14, background: "#F5DDDD", borderColor: "#B33A3A" }}>
            <div className="row gap-2 center" style={{ marginBottom: 6 }}>
              <span className="sk-chip low">SUSTAINED SHIFT</span>
              <span className="sk-chip">Other theft</span>
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5 }}>
              Recent 12 months vs prior 12 months: rate ratio 1.28, p &lt; 0.001. Not a spike — a new floor.
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display: "flex", justifyContent: "space-between", borderTop: "1px dashed #B8AE96", paddingTop: 14 }}>
          <a href="#" className="muted" style={{ fontSize: 13 }}>← Trends by category</a>
          <a href="#" className="muted" style={{ fontSize: 13 }}>12-month forecast →</a>
        </div>
      </div>

      {/* meta rail */}
      <div style={{ padding: 24, borderLeft: "1.5px solid #B8AE96", background: "#F5F1EA" }}>
        <div className="eyebrow tiny" style={{ marginBottom: 10 }}>at a glance</div>
        <div className="col gap-3">
          <div>
            <div className="tiny">Population</div>
            <div className="h-display" style={{ fontSize: 22 }}>60,318</div>
          </div>
          <div>
            <div className="tiny">Area</div>
            <div className="h-display" style={{ fontSize: 22 }}>1.2 sq mi</div>
          </div>
          <div>
            <div className="tiny">12mo total</div>
            <div className="h-display" style={{ fontSize: 22 }}>4,217</div>
            <div style={{ fontSize: 12, color: "#B33A3A" }}>+18% YoY</div>
          </div>
          <div>
            <div className="tiny">Per 1k residents</div>
            <div className="h-display" style={{ fontSize: 22 }}>69.9</div>
            <div className="muted" style={{ fontSize: 12 }}>city avg 51.2</div>
          </div>
        </div>

        <div className="sk-line dashed" />

        <div className="eyebrow tiny" style={{ marginBottom: 6 }}>data lineage</div>
        <div style={{ fontSize: 12, color: "#55595F", lineHeight: 1.5 }}>
          SFPD via DataSF · 2018&ndash;present · regenerated monthly · ACS 2024 5-yr for population
        </div>

        <div className="sk-line dashed" />

        <div className="sk-box dashed" style={{ padding: 10, background: "#EEE8DC" }}>
          <div className="tiny" style={{ marginBottom: 4 }}>cite this page</div>
          <div className="mono-tiny" style={{ fontSize: 11 }}>crimetrends.sf/mission · accessed Apr 2026</div>
        </div>
      </div>
    </div>
  </div>
);

Object.assign(window, { NbhdV4, NbhdV5, NbhdV6 });

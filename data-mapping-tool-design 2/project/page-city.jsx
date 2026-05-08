/* global React, Ic, SiteHeader, SiteFooter, Crumbs, TrendLine, Spark, HexMapDark */
const { useState: useStateCity } = React;

function CityHeader() {
  return (
    <section className="city-header">
      <div className="wrap">
        <div className="top">
          <div>
            <div className="eyebrow">San Francisco · April 2026 briefing</div>
            <h1>San Francisco</h1>
            <p className="lede">
              The city, by the numbers we publish each month: 41 neighborhoods, ten incident categories, twelve months of trailing comparison. Browse the map, scan the rankings, or read a neighborhood-level breakdown.
            </p>
          </div>
          <div style={{ minWidth: 240, display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
            <a href="#april-briefing" className="btn btn-primary">Read April briefing<Ic.arrow s={14} /></a>
            <a href="#" className="btn btn-ghost btn-sm"><Ic.download s={13} />Download data (CSV)</a>
            <span className="meta-mono" style={{ textAlign: "center", marginTop: 4 }}>UPDATED APR 14, 2026 · 04:12 UTC</span>
          </div>
        </div>
      </div>

      <div className="wrap">
        <div className="city-stats">
          <div className="stat"><div className="num">23</div><div className="label">anomalies flagged this month — 9 spikes, 11 drops, 3 rare events.</div></div>
          <div className="stat"><div className="num signal">−7.4%</div><div className="label">overall city incident volume vs. trailing 12-month avg.</div></div>
          <div className="stat"><div className="num">41</div><div className="label">neighborhoods covered. Each gets a long-form page.</div></div>
          <div className="stat"><div className="num">10</div><div className="label">incident categories tracked, from auto theft to assault.</div></div>
        </div>
      </div>
    </section>
  );
}

function CityBriefing() {
  return (
    <section id="april-briefing" className="city-briefing">
      <div className="wrap">
        <div className="cb-grid">
          <aside className="cb-meta">
            <div className="kicker">April 2026 · monthly narrative</div>
            <h2 className="h-display" style={{ fontSize: "clamp(28px,3vw,40px)", margin: "10px 0 14px", lineHeight: 1.1 }}>
              A quiet month, with one loud exception<em className="h-italic"> in the Outer Sunset</em>.
            </h2>
            <div className="cb-byline">
              <span className="meta-mono">PUBLISHED APR 14, 2026</span>
              <span className="meta-mono">5 MIN READ</span>
              <span className="meta-mono">EDITOR · K. ALMEIDA</span>
            </div>
            <ul className="cb-tldr">
              <li><strong>Citywide volume −7.4%</strong> vs. trailing 12-mo average — broad, not concentrated.</li>
              <li><strong>9 spikes, 11 drops, 3 rare events</strong> flagged across 41 neighborhoods.</li>
              <li><strong>Outer Sunset burglary +63% MoM</strong> — the month's headline anomaly.</li>
              <li><strong>Auto theft</strong> continues its multi-quarter decline; six straight months below trend.</li>
              <li><strong>Russian Hill arson cluster</strong> — first comparable cluster since Aug 2019.</li>
            </ul>
            <div className="cb-archive">
              <span className="meta-mono">PAST BRIEFINGS</span>
              <a href="#">Mar '26</a>
              <a href="#">Feb '26</a>
              <a href="#">Jan '26</a>
              <a href="#" className="muted">All →</a>
            </div>
          </aside>

          <div className="cb-body">
            <p className="lead">
              April's briefing is, on the whole, an unexciting one — and that's worth saying out loud. Citywide incident volume is down 7.4% against the trailing twelve months, with declines distributed broadly rather than driven by any one category or district. Were it not for a single neighborhood spike, this would be the calmest month we've published since the project went live in January.
            </p>
            <p>
              That spike is in the <a href="#">Outer Sunset</a>, where burglary jumped 63% month-over-month, the largest standalone move anywhere in the city. Thirty-six of the forty-seven incidents occurred west of 41st Avenue, and seventy-one percent took place on weekday afternoons — a pattern consistent with daytime residential burglary. We discuss it in detail on the neighborhood page, including how it compares to a similar 2019 cluster.
            </p>
            <p>
              Two stories deserve mention beyond the lead. First, <strong>auto theft</strong> is now five straight months below trend citywide, with the steepest declines in <a href="#">Bayview</a> (−41% YoY) and the <a href="#">Mission</a> (−24% YoY). The pattern began in late 2025 and has tightened the trailing variance enough that we expect to reset the baseline downward in the May briefing. Second, a small <strong>arson cluster in <a href="#">Russian Hill</a></strong> — five incidents within 0.4 miles over eleven days — triggered our rare-event flag. The last comparable cluster in that geography was in August 2019. We are not yet calling this a sustained change.
            </p>
            <p>
              Forecasts from last month: of the seven point-estimates we issued in March, six landed inside their 90% prediction intervals. The miss was the Outer Sunset burglary forecast (predicted 28; actual 47) — the spike <em>is</em>, by definition, the model being wrong, and we say so plainly in the methodology.
            </p>
            <div className="cb-sectionhead">
              <span className="meta-mono">WHAT TO READ NEXT</span>
            </div>
            <div className="cb-next">
              <a href="#" className="cb-next-link">
                <span className="chip low">SPIKE · BURGLARY</span>
                <span className="t">Outer Sunset — full briefing</span>
                <Ic.arrow s={13} />
              </a>
              <a href="#" className="cb-next-link">
                <span className="chip high">SUSTAINED DROP · AUTO THEFT</span>
                <span className="t">Bayview — six months below trend</span>
                <Ic.arrow s={13} />
              </a>
              <a href="#" className="cb-next-link">
                <span className="chip mid">RARE EVENT · ARSON</span>
                <span className="t">Russian Hill — cluster analysis</span>
                <Ic.arrow s={13} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CityProfile() {
  // small inline bar for tenure/age splits
  const Stack = ({ rows }) => (
    <div className="stack">
      <div className="stack-bar">
        {rows.map((r, i) => (
          <div key={i} style={{ width: `${r.pct}%`, background: r.color }} title={`${r.label} ${r.pct}%`} />
        ))}
      </div>
      <div className="stack-legend">
        {rows.map((r, i) => (
          <span key={i}><i style={{ background: r.color }} />{r.label} <em>{r.pct}%</em></span>
        ))}
      </div>
    </div>
  );

  return (
    <section className="city-profile">
      <div className="wrap">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="eyebrow">City profile</div>
            <h2 className="h-display" style={{ fontSize: "clamp(24px,2.6vw,32px)", margin: "8px 0 0" }}>The denominators behind the numbers.</h2>
          </div>
          <span className="meta-mono">SOURCES · US CENSUS ACS 2024 · SFMTA · DATASF</span>
        </div>

        <div className="profile-grid">
          {/* Geography & shape */}
          <div className="prof-card">
            <div className="kicker">Geography</div>
            <div className="kv">
              <div><span className="k">Land area</span><span className="v">46.9 mi²</span></div>
              <div><span className="k">Water area</span><span className="v">185 mi²</span></div>
              <div><span className="k">Coastline</span><span className="v">3 sides · Pacific + Bay</span></div>
              <div><span className="k">Elevation</span><span className="v">0–925 ft</span></div>
              <div><span className="k">Police districts</span><span className="v">10</span></div>
              <div><span className="k">Neighborhoods</span><span className="v">41 (analysis units)</span></div>
            </div>
            <p className="note">Peninsula city; sharp microclimate and topography breaks (hills, parks, freeways) define neighborhood boundaries more than political ones.</p>
          </div>

          {/* Population & density */}
          <div className="prof-card">
            <div className="kicker">Population</div>
            <div className="big-num">
              <span className="num-mono">808,437</span>
              <span className="delta down">−1.2% YoY</span>
            </div>
            <div className="kv">
              <div><span className="k">Density</span><span className="v">17,243 / mi²</span></div>
              <div><span className="k">Daytime pop.</span><span className="v">≈1.10M</span></div>
              <div><span className="k">Visitors / day</span><span className="v">≈70K</span></div>
              <div><span className="k">Median age</span><span className="v">38.7</span></div>
              <div><span className="k">Households</span><span className="v">362,400</span></div>
              <div><span className="k">Avg. HH size</span><span className="v">2.21</span></div>
            </div>
            <p className="note">Daytime swing matters for rate calcs: SoMa &amp; Financial District triple in population on weekdays.</p>
          </div>

          {/* Housing */}
          <div className="prof-card">
            <div className="kicker">Housing</div>
            <div className="kv">
              <div><span className="k">Units</span><span className="v">410,300</span></div>
              <div><span className="k">Median rent</span><span className="v">$2,840</span></div>
              <div><span className="k">Median home value</span><span className="v">$1.31M</span></div>
              <div><span className="k">Vacancy</span><span className="v">8.4%</span></div>
            </div>
            <div className="prof-sub">Tenure</div>
            <Stack rows={[
              { label: "Renter", pct: 62, color: "var(--blue)" },
              { label: "Owner", pct: 38, color: "var(--fg-3)" },
            ]} />
            <div className="prof-sub">Stock</div>
            <Stack rows={[
              { label: "SFH", pct: 32, color: "var(--green)" },
              { label: "2–4 unit", pct: 27, color: "var(--amber)" },
              { label: "5+ unit", pct: 41, color: "var(--blue)" },
            ]} />
          </div>

          {/* Economy & demographics */}
          <div className="prof-card">
            <div className="kicker">Economy & people</div>
            <div className="kv">
              <div><span className="k">Median HH income</span><span className="v">$141,400</span></div>
              <div><span className="k">Poverty rate</span><span className="v">10.2%</span></div>
              <div><span className="k">Unemployment</span><span className="v">3.6%</span></div>
              <div><span className="k">Bachelor's+</span><span className="v">61.8%</span></div>
              <div><span className="k">Foreign-born</span><span className="v">33.7%</span></div>
              <div><span className="k">Languages spoken</span><span className="v">112</span></div>
            </div>
            <div className="prof-sub">Age distribution</div>
            <Stack rows={[
              { label: "<18", pct: 13, color: "var(--fg-4)" },
              { label: "18–34", pct: 27, color: "var(--blue)" },
              { label: "35–64", pct: 43, color: "var(--blue-2)" },
              { label: "65+", pct: 17, color: "var(--fg-3)" },
            ]} />
          </div>

          {/* Transport & built environment */}
          <div className="prof-card">
            <div className="kicker">Built environment</div>
            <div className="kv">
              <div><span className="k">Street miles</span><span className="v">1,260</span></div>
              <div><span className="k">Parks (acres)</span><span className="v">5,860</span></div>
              <div><span className="k">Transit stops</span><span className="v">3,420</span></div>
              <div><span className="k">Vehicles / 1K res.</span><span className="v">487</span></div>
              <div><span className="k">Walk score</span><span className="v">88 (high)</span></div>
              <div><span className="k">Lighting coverage</span><span className="v">94% of arterials</span></div>
            </div>
            <p className="note">High pedestrian + transit exposure shifts crime-rate denominators away from "per resident" toward "per person-hour outdoors".</p>
          </div>

          {/* Policing context */}
          <div className="prof-card">
            <div className="kicker">Policing context</div>
            <div className="kv">
              <div><span className="k">SFPD sworn officers</span><span className="v">1,537</span></div>
              <div><span className="k">Officers / 10K res.</span><span className="v">19.0</span></div>
              <div><span className="k">911 calls / yr</span><span className="v">1.21M</span></div>
              <div><span className="k">Avg. response (P1)</span><span className="v">5.8 min</span></div>
              <div><span className="k">Reporting platform</span><span className="v">Crime Data Warehouse v2</span></div>
              <div><span className="k">Open data lag</span><span className="v">≈48 hrs</span></div>
            </div>
            <p className="note">A reclassification in Q3 2024 changed how thefts &lt; $950 are coded — we exclude that window from baselines.</p>
          </div>
        </div>

        <div className="profile-foot">
          <a href="#">Full data sources →</a>
          <a href="#">How we compute rates per capita →</a>
          <a href="#">Daytime-population methodology →</a>
        </div>
      </div>
    </section>
  );
}

function MultiYearTrends() {
  const [cat, setCat] = useStateCity("Burglary");
  // 10 years of monthly indexed data (Jan 2016 → Mar 2026 = 123 points)
  // Each category has its own trajectory; values normalized to ~30-100 range for chart math
  const series = {
    "Burglary":   { color: "#FF6B6B", peak: "2017", now: 28.8, peakV: 62, trough: "2021", troughV: 18, ytd: "+4%", fiveY: "−18%", tenY: "−42%", noteY: 2020.3, noteT: "Pandemic shutdown — sharp drop, slow rebound" },
    "Auto theft": { color: "#6FCF97", peak: "2022", now: 24.0, peakV: 71, trough: "2017", troughV: 24, ytd: "−12%", fiveY: "+22%", tenY: "+8%", noteY: 2022.0, noteT: "Kia/Hyundai TikTok cluster" },
    "Assault":    { color: "#E6B450", now: 42.0, peak: "2016", peakV: 55, trough: "2021", troughV: 30, ytd: "+4%", fiveY: "−6%", tenY: "−14%", noteY: 2020.3, noteT: "Reporting lag during shutdowns" },
    "Robbery":    { color: "#60A5FA", now: 18.0, peak: "2016", peakV: 48, trough: "2021", troughV: 14, ytd: "−8%", fiveY: "−24%", tenY: "−51%", noteY: 2018.0, noteT: "Steepest sustained decline among violent cats" },
    "Larceny":    { color: "#A78BFA", now: 88.0, peak: "2017", peakV: 134, trough: "2020", troughV: 52, ytd: "−6%", fiveY: "−14%", tenY: "−22%", noteY: 2024.5, noteT: "Reclassification — Q3 2024 (excluded from baseline)" },
    "Vandalism":  { color: "#22D3EE", now: 26.0, peak: "2023", peakV: 38, trough: "2017", troughV: 22, ytd: "+2%", fiveY: "+12%", tenY: "+4%" },
  };

  const cats = Object.keys(series);
  const cur = series[cat];

  // Build a 10-yr indexed series for the active category — deterministic pseudo-random walk
  const buildSeries = (key) => {
    const s = series[key];
    const N = 123; // months
    const out = [];
    let v = s.now;
    let seed = key.charCodeAt(0) + key.charCodeAt(1);
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
    // walk backwards from now to 10 years ago
    for (let i = N - 1; i >= 0; i--) {
      out[i] = v;
      const t = i / (N - 1); // 0=oldest, 1=newest
      const seasonal = Math.sin((i / 12) * Math.PI * 2) * (s.now * 0.08);
      const drift = (rand() - 0.5) * (s.now * 0.10);
      // ramp toward peak/trough
      const target = key === "Burglary" ? 50 - t * 20 :
                     key === "Auto theft" ? 30 + Math.sin(t * 3) * 18 + t * 14 :
                     key === "Assault" ? 50 - t * 8 :
                     key === "Robbery" ? 42 - t * 22 :
                     key === "Larceny" ? 110 - Math.pow(1 - t, 2) * 60 :
                     30 - Math.sin(t * 2) * 6;
      v = v + (target - v) * 0.02 + drift + seasonal * 0.3;
      v = Math.max(5, v);
    }
    return out;
  };

  const data = buildSeries(cat);
  const W = 1100, H = 280, pad = { l: 40, r: 14, t: 18, b: 36 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  const maxV = Math.max(...data, cur.peakV) * 1.05;
  const x = (i) => pad.l + (i / (data.length - 1)) * innerW;
  const y = (v) => pad.t + innerH - (v / maxV) * innerH;

  // smoothed line
  const linePath = data.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
  // 12-month rolling mean
  const roll = data.map((_, i) => {
    const a = Math.max(0, i - 11);
    const slice = data.slice(a, i + 1);
    return slice.reduce((s, n) => s + n, 0) / slice.length;
  });
  const rollPath = roll.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");

  // year ticks (Jan 2016, 2018, 2020, 2022, 2024, 2026)
  const yearTicks = [0, 24, 48, 72, 96, 120];
  const yearLabels = ["2016", "2018", "2020", "2022", "2024", "2026"];
  // event annotations
  const events = [
    { i: 50, label: "COVID-19", color: "var(--fg-3)" },
    { i: 102, label: "Reclass Q3'24", color: "var(--amber)" },
  ];

  return (
    <section className="multi-year section-tint" style={{ borderTop: "1px solid var(--rule)" }}>
      <div className="wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="eyebrow">Multi-year trends</div>
            <h2 className="h-display" style={{ fontSize: "clamp(26px,3vw,36px)", margin: "8px 0 0" }}>The long arc — ten years of monthly counts.</h2>
          </div>
          <div className="rankings-controls">
            <button type="button" className="pill active">Index</button>
            <button type="button" className="pill">Per 10K</button>
            <button type="button" className="pill">Raw count</button>
            <a href="#" className="btn btn-ghost btn-sm"><Ic.download s={12} />CSV</a>
          </div>
        </div>

        <div className="my-shell">
          <div className="my-tabs">
            {cats.map(c => (
              <button key={c} type="button" className={`my-tab ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>
                <span className="dot" style={{ background: series[c].color }} />
                <span>{c}</span>
                <span className={`delta ${series[c].tenY.startsWith("−") ? "down" : "up"}`}>{series[c].tenY}</span>
              </button>
            ))}
          </div>

          <div className="my-canvas">
            <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }} preserveAspectRatio="none">
              {/* y gridlines */}
              <g stroke="var(--line)" strokeWidth="1">
                {[0.25, 0.5, 0.75, 1].map((p, i) => (
                  <line key={i} x1={pad.l} y1={pad.t + innerH * (1 - p)} x2={W - pad.r} y2={pad.t + innerH * (1 - p)} strokeDasharray="2 4" />
                ))}
              </g>
              {/* y labels */}
              <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--fg-4)">
                {[0, 0.25, 0.5, 0.75, 1].map((p, i) => (
                  <text key={i} x={pad.l - 8} y={pad.t + innerH * (1 - p) + 3} textAnchor="end">{Math.round(maxV * p)}</text>
                ))}
              </g>
              {/* event vertical bands */}
              {events.map((e, i) => (
                <g key={i}>
                  <line x1={x(e.i)} y1={pad.t} x2={x(e.i)} y2={pad.t + innerH} stroke={e.color} strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
                  <text x={x(e.i) + 4} y={pad.t + 12} fontFamily="JetBrains Mono, monospace" fontSize="9.5" fill={e.color} letterSpacing="0.05em">{e.label.toUpperCase()}</text>
                </g>
              ))}
              {/* monthly line (faint) */}
              <path d={linePath} fill="none" stroke={cur.color} strokeWidth="1" opacity="0.35" />
              {/* 12-mo rolling mean (bold) */}
              <path d={rollPath} fill="none" stroke={cur.color} strokeWidth="2" strokeLinejoin="round" />
              {/* x ticks */}
              <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--fg-3)">
                {yearTicks.map((i, k) => (
                  <g key={k}>
                    <line x1={x(i)} y1={pad.t + innerH} x2={x(i)} y2={pad.t + innerH + 4} stroke="var(--line-2)" />
                    <text x={x(i)} y={H - 18} textAnchor="middle">{yearLabels[k]}</text>
                  </g>
                ))}
              </g>
              {/* legend */}
              <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--fg-3)">
                <line x1={W - 220} y1={H - 6} x2={W - 200} y2={H - 6} stroke={cur.color} strokeWidth="1" opacity="0.35" />
                <text x={W - 196} y={H - 3}>monthly</text>
                <line x1={W - 130} y1={H - 6} x2={W - 110} y2={H - 6} stroke={cur.color} strokeWidth="2" />
                <text x={W - 106} y={H - 3}>12-mo rolling mean</text>
              </g>
            </svg>
          </div>

          <div className="my-stats">
            <div className="my-stat">
              <span className="lbl">YTD vs prior</span>
              <span className={`v ${cur.ytd.startsWith("−") ? "down" : "up"}`}>{cur.ytd}</span>
            </div>
            <div className="my-stat">
              <span className="lbl">5-year change</span>
              <span className={`v ${cur.fiveY.startsWith("−") ? "down" : "up"}`}>{cur.fiveY}</span>
            </div>
            <div className="my-stat">
              <span className="lbl">10-year change</span>
              <span className={`v ${cur.tenY.startsWith("−") ? "down" : "up"}`}>{cur.tenY}</span>
            </div>
            <div className="my-stat">
              <span className="lbl">Decade peak</span>
              <span className="v">{cur.peakV} <em>· {cur.peak}</em></span>
            </div>
            <div className="my-stat">
              <span className="lbl">Decade trough</span>
              <span className="v">{cur.troughV} <em>· {cur.trough}</em></span>
            </div>
            <div className="my-stat">
              <span className="lbl">Now (Mar '26)</span>
              <span className="v">{cur.now.toFixed(1)} <em>· /mo</em></span>
            </div>
          </div>

          {cur.noteT && (
            <div className="my-note">
              <span className="meta-mono" style={{ color: "var(--amber)" }}>NOTE</span>
              <span>{cur.noteT}</span>
            </div>
          )}
        </div>

        {/* Decade-at-a-glance bands for all categories */}
        <div className="my-bands">
          <div className="my-bands-head">
            <div className="meta-mono">ALL CATEGORIES · 10-YEAR ARC · 12-MO ROLLING MEAN</div>
            <div className="meta-mono" style={{ color: "var(--fg-4)" }}>2016 ────────────────── 2026</div>
          </div>
          {cats.map(c => {
            const s = series[c];
            const d = buildSeries(c);
            const r = d.map((_, i) => {
              const a = Math.max(0, i - 11);
              const sl = d.slice(a, i + 1);
              return sl.reduce((acc, n) => acc + n, 0) / sl.length;
            });
            const mx = Math.max(...r);
            const path = r.map((v, i) => `${i === 0 ? "M" : "L"} ${(i / (r.length - 1) * 100).toFixed(2)} ${(40 - (v / mx) * 36).toFixed(2)}`).join(" ");
            return (
              <button key={c} type="button" className={`my-band ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>
                <span className="bn">{c}</span>
                <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="bs">
                  <path d={path} fill="none" stroke={s.color} strokeWidth="1.5" />
                </svg>
                <span className={`bd ${s.tenY.startsWith("−") ? "down" : "up"}`}>{s.tenY}</span>
                <span className="bm meta-mono">10Y</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function MapBlock() {
  const [cat, setCat] = useStateCity("All");
  const cats = ["All", "Burglary", "Auto theft", "Assault", "Robbery", "Larceny", "Vandalism"];
  const [layer, setLayer] = useStateCity("Z-score");
  return (
    <section className="map-block">
      <div className="wrap-wide">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="eyebrow">Interactive map</div>
            <h2 className="h-display" style={{ fontSize: "clamp(26px,3vw,36px)", margin: "8px 0 0" }}>Every neighborhood, color-coded.</h2>
          </div>
          <div className="meta-mono">CLICK A HEX → OPEN NEIGHBORHOOD PAGE</div>
        </div>

        <div className="map-shell">
          <div className="toolbar">
            <span className="grouplabel">Category</span>
            {cats.map((c) => (
              <button key={c} type="button" className={`pill ${cat === c ? "active" : ""}`} onClick={() => setCat(c)}>{c}</button>
            ))}
            <span style={{ width: 1, height: 18, background: "var(--graphite-3)", margin: "0 8px" }} />
            <span className="grouplabel">Layer</span>
            {["Z-score", "MoM %", "YoY %", "Raw count"].map((l) => (
              <button key={l} type="button" className={`pill ${layer === l ? "active" : ""}`} onClick={() => setLayer(l)}>{l}</button>
            ))}
            <span style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
              <span className="grouplabel">Window</span>
              <button type="button" className="pill">30d</button>
              <button type="button" className="pill active">90d</button>
              <button type="button" className="pill">1y</button>
            </span>
          </div>

          <div className="canvas">
            <HexMapDark />
            <div className="map-legend">
              <span style={{ color: "#5C6478", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em" }}>{layer.toUpperCase()}</span>
              <span className="legend-grad" />
              <div style={{ display: "flex", justifyContent: "space-between", color: "#BFC6D4", fontFamily: "var(--font-mono)", fontSize: 10 }}>
                <span>−2.5σ</span><span>0</span><span>+2.5σ</span>
              </div>
            </div>
            <div className="map-time">
              <span style={{ color: "#5C6478", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.08em" }}>TIME</span>
              <input type="range" min="0" max="11" defaultValue="11" style={{ width: "100%" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-mono)", fontSize: 10, color: "#BFC6D4" }}>
                <span>MAY '25</span><span style={{ color: "var(--paper)" }}>APR '26</span>
              </div>
            </div>
          </div>

          <aside className="side">
            <div>
              <div className="kicker" style={{ color: "var(--ink-3)" }}>HOVERING</div>
              <h3>Outer Sunset</h3>
              <p className="muted" style={{ fontSize: 13, margin: "0 0 6px" }}>Sunset District · 35.2K residents</p>
              <span className="chip low">SPIKE · BURGLARY</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="stat"><div className="num" style={{ fontSize: 28 }}>+63%</div><div className="label">MoM burglary</div></div>
              <div className="stat"><div className="num" style={{ fontSize: 28, color: "var(--score-low)" }}>z=2.6</div><div className="label">vs trailing 12-mo</div></div>
            </div>

            <div>
              <div className="eyebrow" style={{ marginBottom: 8 }}>By category — 90 days</div>
              {[
                { n: "Burglary", v: "+63%", d: false },
                { n: "Auto theft", v: "−12%", d: true },
                { n: "Assault", v: "+4%", d: false },
                { n: "Larceny", v: "−8%", d: true },
                { n: "Vandalism", v: "+2%", d: false },
              ].map((r, i) => (
                <div key={i} className="cat-row">
                  <span>{r.n}</span>
                  <Spark down={r.d} w={70} />
                  <span className="num-mono" style={{ fontFamily: "var(--font-mono)", fontSize: 13, textAlign: "right", color: r.d ? "var(--score-high)" : "var(--score-low)" }}>{r.v}</span>
                </div>
              ))}
            </div>

            <a href="#" className="btn btn-primary btn-sm" style={{ alignSelf: "flex-start" }}>Open Outer Sunset page<Ic.arrow s={13} /></a>
          </aside>
        </div>
      </div>
    </section>
  );
}

function Rankings() {
  const rows = [
    { rank: 1, name: "Outer Sunset", cat: "Burglary", mom: "+63%", yoy: "+22%", z: "2.6", flag: "spike", down: false },
    { rank: 2, name: "Russian Hill", cat: "Arson", mom: "+340%", yoy: "+180%", z: "3.4", flag: "rare", down: false },
    { rank: 3, name: "Mission", cat: "Auto theft", mom: "−18%", yoy: "−24%", z: "−1.9", flag: "drop", down: true },
    { rank: 4, name: "Bayview", cat: "Auto theft", mom: "−9%", yoy: "−41%", z: "−2.3", flag: "drop", down: true },
    { rank: 5, name: "Tenderloin", cat: "Assault", mom: "+8%", yoy: "+3%", z: "0.6", flag: null, down: false },
    { rank: 6, name: "SoMa", cat: "Larceny", mom: "−14%", yoy: "−8%", z: "−1.2", flag: null, down: true },
    { rank: 7, name: "Marina", cat: "Burglary", mom: "+19%", yoy: "+11%", z: "1.4", flag: null, down: false },
    { rank: 8, name: "Excelsior", cat: "Robbery", mom: "+22%", yoy: "+7%", z: "1.8", flag: null, down: false },
  ];
  return (
    <section className="rankings section-tint" style={{ borderTop: "1px solid var(--rule)" }}>
      <div className="wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="eyebrow">Rankings</div>
            <h2 className="h-display" style={{ fontSize: "clamp(26px,3vw,36px)", margin: "8px 0 0" }}>Largest moves this month.</h2>
          </div>
          <div className="rankings-controls">
            <button type="button" className="pill active">By |z|</button>
            <button type="button" className="pill">By MoM</button>
            <button type="button" className="pill">By YoY</button>
            <a href="#" className="btn btn-ghost btn-sm"><Ic.download s={12} />CSV</a>
          </div>
        </div>

        <table className="tbl">
          <thead>
            <tr>
              <th style={{ width: 36 }}>#</th>
              <th>Neighborhood</th>
              <th>Category</th>
              <th className="right">MoM</th>
              <th className="right">YoY</th>
              <th className="right">|z|</th>
              <th>90-day trend</th>
              <th>Flag</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rank}>
                <td className="num-mono muted">{String(r.rank).padStart(2, "0")}</td>
                <td className="name"><a href="#">{r.name}</a></td>
                <td>{r.cat}</td>
                <td className={`right num-mono ${r.mom.startsWith("−") ? "delta-up" : "delta-down"}`}>{r.mom}</td>
                <td className={`right num-mono ${r.yoy.startsWith("−") ? "delta-up" : "delta-down"}`}>{r.yoy}</td>
                <td className="right num-mono">{r.z}</td>
                <td><Spark down={r.down} /></td>
                <td>{r.flag ? <span className={`chip ${r.flag === "spike" ? "low" : r.flag === "drop" ? "high" : "mid"}`}>{r.flag.toUpperCase()}</span> : <span className="muted" style={{ fontSize: 12 }}>—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="muted" style={{ fontSize: 13 }}>Showing 8 of 41 neighborhoods</span>
          <a href="#" style={{ fontSize: 14, color: "var(--ink)", textDecoration: "underline", textUnderlineOffset: 3 }}>See all →</a>
        </div>
      </div>
    </section>
  );
}

function ReadNbhdGrid() {
  const items = [
    { n: "Outer Sunset", chip: { t: "SPIKE · BURGLARY", k: "low" }, blurb: "March count 47 vs 12-mo avg 28.8 (z=2.6). Concentrated west of 41st Ave; weekday afternoons." },
    { n: "Bayview", chip: { t: "SUSTAINED DROP · AUTO THEFT", k: "high" }, blurb: "Six straight months below trend. Coincides with bait-vehicle program rollout in Q4 2025." },
    { n: "Russian Hill", chip: { t: "RARE EVENT · ARSON", k: "mid" }, blurb: "5 incidents within 0.4 mi over 11 days. Last comparable cluster: Aug 2019." },
    { n: "Mission", chip: { t: "BIGGEST MOVER", k: "ink" }, blurb: "Auto theft −18% MoM, but assault is creeping up; the net story is more nuanced than the headline." },
  ];
  return (
    <section className="section">
      <div className="wrap">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 32, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="eyebrow">Read this month</div>
            <h2 className="h-display" style={{ fontSize: "clamp(26px,3vw,36px)", margin: "8px 0 0" }}>Four neighborhoods worth your time.</h2>
          </div>
          <a href="#" className="muted" style={{ fontSize: 14, textDecoration: "underline", textUnderlineOffset: 3 }}>All 41 neighborhoods →</a>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {items.map((it, i) => (
            <a key={i} href="#" className="card" style={{ display: "flex", flexDirection: "column", gap: 12, textDecoration: "none", color: "var(--ink)" }}>
              <span className={`chip ${it.chip.k}`} style={{ alignSelf: "flex-start" }}>{it.chip.t}</span>
              <h3 className="h-display" style={{ fontSize: 24, margin: "4px 0 0" }}>{it.n}</h3>
              <p style={{ fontSize: 14, lineHeight: 1.55, color: "var(--ink-2)", margin: 0 }}>{it.blurb}</p>
              <span style={{ marginTop: "auto", color: "var(--signal)", fontSize: 13, display: "inline-flex", alignItems: "center", gap: 4, paddingTop: 8 }}>Read briefing<Ic.arrow s={13} /></span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function MethodPromo() {
  return (
    <section className="section section-dark">
      <div className="wrap">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 64, alignItems: "center" }}>
          <div>
            <div className="eyebrow">Methodology</div>
            <h2 className="h-display" style={{ fontSize: "clamp(28px,3.4vw,44px)", margin: "12px 0 18px", color: "var(--paper)" }}>
              Every flag, every forecast, <em className="h-italic">documented</em>.
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.55, color: "#BFC6D4", margin: "0 0 24px", maxWidth: "44ch" }}>
              Open about how we define spikes, what we exclude as noise, where the data comes from, and how often the model is wrong.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="#" className="btn btn-signal">Read the methodology</a>
              <a href="#" className="btn" style={{ color: "var(--paper)", border: "1px solid #6B6F76" }}>Backtest →</a>
            </div>
          </div>
          <div style={{ background: "var(--graphite-2)", border: "1px solid var(--graphite-3)", borderRadius: 8, padding: 28, fontFamily: "var(--font-mono)", fontSize: 13, lineHeight: 1.7, color: "#BFC6D4" }}>
            <div style={{ color: "#5C6478", marginBottom: 8 }}># anomaly rule — spike</div>
            <div><span style={{ color: "var(--signal)" }}>flag</span> = (z &gt;= 2.0) AND (mom_pct &gt;= 25%)</div>
            <div><span style={{ color: "var(--signal)" }}>where</span> z = (count − μ_12mo) / σ_12mo</div>
            <div style={{ marginTop: 14, color: "#5C6478" }}># exclusions</div>
            <div>· event-day spikes (parade, marathon)</div>
            <div>· categories with n &lt; 10 in window</div>
            <div>· reclassification periods (2024-Q3)</div>
            <div style={{ marginTop: 14, color: "#5C6478" }}># backtest — Jan 2023 → Mar 2026</div>
            <div>precision <span style={{ color: "#6FCF97" }}>0.81</span> · recall <span style={{ color: "#E6B450" }}>0.66</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CityPage() {
  return (
    <div style={{ background: "var(--paper)" }}>
      <SiteHeader active="city" />
      <Crumbs items={[{ label: "Cities", href: "#" }, { label: "San Francisco" }]} />
      <CityHeader />
      <CityBriefing />
      <CityProfile />
      <MapBlock />
      <Rankings />
      <MultiYearTrends />
      <ReadNbhdGrid />
      <MethodPromo />
      <SiteFooter />
    </div>
  );
}

window.CityPage = CityPage;

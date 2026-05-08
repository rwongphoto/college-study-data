/* global React, EpaHeader, EpaFooter, EpaTrend, EpaMap, Crumbs */
const { useState: useStateTract } = React;

function TractHero() {
  return (
    <section className="city-header">
      <div className="wrap">
        <div className="eyebrow">Bayview · Hunters Point · San Francisco County</div>
        <h1>Tract 06075061500</h1>
        <p className="lede" style={{ marginTop: 18, maxWidth: "62ch" }}>
          A 0.42 sq mi tract in southeast San Francisco. PM2.5 has fallen 58% since 1999, but remains 14% above the regional median. Two active Superfund sites within 2 miles. EJ index in the 91st percentile nationally.
        </p>
        <div className="byline">
          <span className="meta-mono">POP 4,820 · MEDIAN AGE 33 · MEDIAN INCOME $58,400</span>
          <span className="meta-mono">EJ INDEX <strong style={{color:"var(--red)"}}>0.91</strong></span>
        </div>
      </div>
    </section>
  );
}

function TractKeyChart() {
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 01 · LEAD INDICATOR</div>
            <h2>PM2.5, monthly mean — 1999 to 2025</h2>
          </div>
          <p className="sec-sub">Nearest monitor: SFO-040 (1.4 mi). Annual mean shown as bold line; NAAQS standard at 9 µg/m³ (revised 2024) shown as red dashed.</p>
        </header>
        <div className="figure-frame">
          <div className="fig-head">
            <span className="meta-mono">PM2.5 µg/m³ · 312 monthly observations · 1999–2025</span>
            <span className="meta-mono">SOURCE EPA AQS</span>
          </div>
          <div className="fig-canvas big">
            <EpaTrend height={320} direction="down" color="#60A5FA" showRule ruleLabel="NAAQS 9 µg/m³"/>
            <div className="chart-axis lg"><span>1999</span><span>2005</span><span>2010</span><span>2015</span><span>2020</span><span>2025</span></div>
          </div>
          <div className="fig-foot">
            <span>Annual mean now 9.2 µg/m³ — at the revised standard, down from 22 µg/m³ in 1999.</span>
            <a href="#" className="link-mono">Download CSV →</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function TractDataGrid() {
  const tiles = [
    { cat:"PM2.5", val:"9.2", unit:"µg/m³", trend:"down", note:"At NAAQS std" },
    { cat:"Ozone", val:"0.068", unit:"ppm", trend:"down", note:"Below std" },
    { cat:"TRI within 1 mi", val:"4", unit:"facilities", trend:"flat", note:"68k lbs/yr" },
    { cat:"Superfund within 2 mi", val:"2", unit:"active", trend:"flat", note:"Hunters Pt; India Bay" },
    { cat:"Drinking water", val:"0", unit:"violations '24", trend:"flat", note:"SFPUC" },
    { cat:"GHG within 5 mi", val:"3", unit:"reporters", trend:"down", note:"−18% since 2015" },
    { cat:"ECHO actions", val:"7", unit:"since 2015", trend:"flat", note:"3 unresolved" },
    { cat:"Pre-1980 housing", val:"71%", unit:"of units", trend:"flat", note:"Lead risk" },
  ];
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 02 · SCORECARD</div>
            <h2>All datasets, this tract</h2>
          </div>
          <p className="sec-sub">Each tile links to the full historical series and source dataset.</p>
        </header>
        <div className="data-tiles">
          {tiles.map((t,i) => (
            <a className="data-tile" href="#" key={i}>
              <div className="tile-cat meta-mono">{t.cat}</div>
              <div className="tile-val">
                <span className="num">{t.val}</span>
                <span className="unit">{t.unit}</span>
              </div>
              <div className="tile-spark">
                <EpaTrend height={36} direction={t.trend} color={t.trend==="down"?"#6FCF97":t.trend==="up"?"#FF6B6B":"#8A93A6"}/>
              </div>
              <div className="tile-note">{t.note}</div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function TractMap() {
  const [overlay, setOverlay] = useStateTract("ej");
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 03 · CONTEXT</div>
            <h2>Within 2 miles</h2>
          </div>
          <p className="sec-sub">Selected tract outlined in blue. Red dots = TRI facilities. Toggle the overlay to compare burden vs. vulnerability.</p>
        </header>
        <div className="map-toolbar">
          <div className="mt-group">
            <span className="meta-mono">OVERLAY</span>
            <button className={`mt-btn ${overlay==="pm25"?"active":""}`} onClick={()=>setOverlay("pm25")}>PM2.5</button>
            <button className={`mt-btn ${overlay==="tri"?"active":""}`} onClick={()=>setOverlay("tri")}>TRI density</button>
            <button className={`mt-btn ${overlay==="ej"?"active":""}`} onClick={()=>setOverlay("ej")}>EJ index</button>
          </div>
        </div>
        <div className="map-frame small">
          <EpaMap style="dark" overlay={overlay}/>
        </div>
      </div>
    </section>
  );
}

function TractNarrative() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="narr-grid">
          <aside className="narr-side">
            <div className="kicker">ON THIS PAGE</div>
            <ul className="toc">
              <li><a href="#">PM2.5 long arc</a></li>
              <li><a href="#">Superfund — Hunters Point</a></li>
              <li><a href="#">TRI history</a></li>
              <li><a href="#">Demographic shift</a></li>
              <li><a href="#">Open enforcement</a></li>
            </ul>
            <div className="kicker" style={{marginTop:24}}>RELATED</div>
            <ul className="toc">
              <li><a href="#">Tract 06075060700 → Visitacion</a></li>
              <li><a href="#">Tract 06075023400 → Mission Bay</a></li>
              <li><a href="#">Compare to W. Oakland</a></li>
            </ul>
          </aside>
          <article className="narr-body">
            <p className="lead">Three things define this tract environmentally: a 60-year industrial legacy on the waterfront, a sustained but uneven decline in particulate pollution, and a population that has changed faster than its infrastructure.</p>
            <h3>The long arc — better, but uneven.</h3>
            <p>Annual PM2.5 fell from 22 µg/m³ in 1999 to 9.2 in 2024 — a 58% drop, slightly steeper than the regional 54% decline. Most of the gain came between 2003 and 2014, when refinery rules and freight regulations took hold. Since 2018, the trend has flattened, and 2020 wildfire smoke pushed the annual mean back to 13.4 — a one-year setback that took two years to walk off.</p>
            <h3>The Hunters Point shadow.</h3>
            <p>The former Hunters Point Naval Shipyard was added to the National Priorities List in 1989 and remains in active remediation. Parcel B was reclassified in 2018 after retesting found radiological contamination above original assessments. Cleanup will continue past 2030.</p>
            <h3>What we're watching.</h3>
            <p>Three open ECHO enforcement actions on facilities within 2 miles. A new GHG reporter coming online in 2026. And a 2024 amendment to the NAAQS PM2.5 standard that brings this tract from "compliant" to "at the line" — a change in the standard, not the air.</p>
            <p className="byline-mono">Last updated 2026-04-15 · <a href="#">view all data sources</a></p>
          </article>
        </div>
      </div>
    </section>
  );
}

function TractHealth() {
  const tiles = [
    { cat:"Adult asthma", val:"11.9%", cmpClass:"bad", cmp:"+38% vs region", note:"CDC PLACES, 2024" },
    { cat:"Childhood asthma ED", val:"94", unit:"per 10k", cmpClass:"bad", cmp:"+62% vs county", note:"CDPH, 2023" },
    { cat:"COPD prevalence", val:"7.2%", cmpClass:"bad", cmp:"+24% vs region", note:"CDC PLACES" },
    { cat:"CVD prevalence", val:"7.1%", cmpClass:"neutral", cmp:"+8% vs region", note:"CDC PLACES" },
    { cat:"Low birth weight", val:"9.4%", cmpClass:"bad", cmp:"+31% vs region", note:"CDPH, 2018–2022" },
    { cat:"Frequent mental distress", val:"16.8%", cmpClass:"bad", cmp:"+19% vs region", note:"CDC PLACES" },
    { cat:"Life expectancy", val:"76.2", unit:"yrs", cmpClass:"bad", cmp:"−5.8 vs SF", note:"CDC USALEEP" },
    { cat:"Children w/ elev. blood lead", val:"3.1", unit:"per 1k tested", cmpClass:"bad", cmp:"+2.1× state avg", note:"CDPH CLPPB, 2023" },
  ];
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 04 · HEALTH CONTEXT</div>
            <h2>Co-located health indicators.</h2>
          </div>
          <p className="sec-sub">Modeled and surveillance data from CDC PLACES, California Department of Public Health, and the CDC Tracking Network — at the smallest geography each dataset publishes. Comparisons are ecological, not causal.</p>
        </header>
        <div className="health-grid">
          {tiles.map((t,i) => (
            <div className="health-tile" key={i}>
              <div className="meta-mono">{t.cat}</div>
              <div className="h-val">{t.val}{t.unit ? <span style={{fontFamily:"var(--font-mono)", fontSize:11, color:"var(--fg-3)", marginLeft:6, letterSpacing:"0.06em"}}>{t.unit}</span> : null}</div>
              <div className="h-cmp"><span className={`pill ${t.cmpClass}`}>{t.cmp}</span></div>
              <div className="meta-mono" style={{color:"var(--fg-4)"}}>{t.note}</div>
            </div>
          ))}
        </div>
        <div className="health-context">
          <div className="figure-frame">
            <div className="fig-head">
              <span className="meta-mono">Childhood asthma ED visits · tract vs county · 2010–2023</span>
              <span className="meta-mono">CDPH</span>
            </div>
            <div className="fig-canvas big">
              <EpaTrend height={220} direction="flat" color="#FF6B6B"/>
              <div className="chart-axis lg"><span>2010</span><span>2014</span><span>2018</span><span>2023</span></div>
            </div>
            <div className="fig-foot">
              <span>Tract rate has held 50–70% above county across 14 years, even as PM2.5 has fallen.</span>
              <a href="#" className="link-mono">Compare ↗</a>
            </div>
          </div>
          <div className="figure-frame">
            <div className="fig-head">
              <span className="meta-mono">Local TRI carcinogen lag → tract cancer mortality</span>
              <span className="meta-mono">CDC WONDER · county-allocated</span>
            </div>
            <div className="fig-canvas big">
              <EpaTrend height={220} direction="up" color="#FF6B6B"/>
              <div className="chart-axis lg"><span>0y</span><span>5y</span><span>10y</span><span>15y</span><span>20y</span></div>
            </div>
            <div className="fig-foot">
              <span>Peak Pearson r = 0.61 at 13-year lag for this tract's TRI history. Wide CIs at this geography.</span>
              <a href="#" className="link-mono">Methodology →</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EpaTractPage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <EpaHeader active="tract" />
      <Crumbs items={[{label:"Bay Area", href:"#"}, {label:"San Francisco", href:"#"}, {label:"Bayview"}, {label:"Tract 06075061500"}]}/>
      <TractHero />
      <TractKeyChart />
      <TractDataGrid />
      <TractMap />
      <TractHealth />
      <TractNarrative />
      <EpaFooter />
    </div>
  );
}

window.EpaTractPage = EpaTractPage;

/* global React, EpaHeader, EpaFooter, EpaTrend, EpaMap */
const { useState: useStateRegion } = React;

function EpaRegionHero() {
  return (
    <section className="city-header">
      <div className="wrap">
        <div className="eyebrow">SF Bay Area · 9 counties · 1,588 census tracts</div>
        <h1>San Francisco Bay Area</h1>
        <p className="lede" style={{ marginTop: 18, maxWidth: "62ch" }}>
          Three decades of environmental measurements, joined to demographics. Air quality, toxic releases, Superfund cleanups, drinking water, greenhouse gas emissions, and enforcement actions — at the tract level, since 1990.
        </p>
        <div className="meta-mono" style={{ marginTop: 22, color: "var(--fg-3)" }}>
          DATA · EPA AQS · TRI · ECHO · SEMS · SDWIS · FLIGHT · CENSUS ACS · LAST REFRESH 2026-04
        </div>
      </div>
    </section>
  );
}

function MapStylePicker({ style, setStyle, overlay, setOverlay }) {
  const styles = [["dark","Dark"], ["light","Light"], ["satellite","Satellite"], ["terrain","Terrain"]];
  const overlays = [
    ["pm25","PM2.5 annual avg"],
    ["tri","TRI releases"],
    ["ej","EJ index"],
  ];
  return (
    <div className="map-toolbar">
      <div className="mt-group">
        <span className="meta-mono">STYLE</span>
        {styles.map(([k,v]) => (
          <button key={k} className={`mt-btn ${style===k?"active":""}`} onClick={()=>setStyle(k)}>{v}</button>
        ))}
      </div>
      <div className="mt-group">
        <span className="meta-mono">OVERLAY</span>
        {overlays.map(([k,v]) => (
          <button key={k} className={`mt-btn ${overlay===k?"active":""}`} onClick={()=>setOverlay(k)}>{v}</button>
        ))}
      </div>
    </div>
  );
}

function MapSection() {
  const [style, setStyle] = useStateRegion("dark");
  const [overlay, setOverlay] = useStateRegion("pm25");
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 01</div>
            <h2>Where the burden sits</h2>
          </div>
          <p className="sec-sub">Tract-level choropleth. Switch the overlay to compare datasets against the same boundary set.</p>
        </header>
        <MapStylePicker style={style} setStyle={setStyle} overlay={overlay} setOverlay={setOverlay} />
        <div className="map-frame">
          <EpaMap style={style} overlay={overlay} />
          <div className="map-legend">
            <span className="meta-mono">{overlay==="pm25"?"PM2.5 µg/m³ (2024)":overlay==="tri"?"TRI lbs released (2023)":"EJ index (2024)"}</span>
            <div className="ramp">
              <i style={{background: overlay==="pm25"?"#1a3a4a":overlay==="tri"?"#1a2a4a":"#1a3a30"}}/>
              <i style={{background: overlay==="pm25"?"#4a7a7a":overlay==="tri"?"#3a5a8a":"#4a7a40"}}/>
              <i style={{background: overlay==="pm25"?"#c5a945":overlay==="tri"?"#8a9ac5":"#a59a30"}}/>
              <i style={{background: overlay==="pm25"?"#d97a30":overlay==="tri"?"#b58ae0":"#d97a30"}}/>
              <i style={{background: overlay==="pm25"?"#c44545":overlay==="tri"?"#d06ad0":"#8a2a2a"}}/>
            </div>
            <span className="meta-mono" style={{ color: "var(--fg-4)" }}>LOW → HIGH</span>
          </div>
        </div>
        <div className="map-stats">
          <div><div className="num">1,588</div><div className="lbl">Census tracts</div></div>
          <div><div className="num">487</div><div className="lbl">TRI facilities</div></div>
          <div><div className="num">42</div><div className="lbl">Active Superfund sites</div></div>
          <div><div className="num">28</div><div className="lbl">AQS air monitors</div></div>
          <div><div className="num">211</div><div className="lbl">Public water systems</div></div>
          <div><div className="num">7.7M</div><div className="lbl">Population covered</div></div>
        </div>
      </div>
    </section>
  );
}

function CategoryRow({ n, title, sub, value, unit, direction, deltaLabel, color = "#60A5FA", showRule = false }) {
  return (
    <div className="cat-row">
      <div className="cat-num">{n}</div>
      <div className="cat-label">
        <h3>{title}</h3>
        <p>{sub}</p>
      </div>
      <div className="cat-value">
        <div className="num">{value}</div>
        <div className="meta-mono">{unit}</div>
      </div>
      <div className="cat-chart">
        <EpaTrend direction={direction} color={color} showRule={showRule} ruleLabel={showRule?"NAAQS":""} />
        <div className="chart-axis"><span>1990</span><span>2025</span></div>
      </div>
      <div className={`cat-delta ${direction==="down"?"good":direction==="up"?"bad":"neutral"}`}>
        <span className="arrow">{direction==="down"?"↓":direction==="up"?"↑":"→"}</span>
        <span>{deltaLabel}</span>
      </div>
    </div>
  );
}

function CategoriesSection() {
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 02</div>
            <h2>The long arc, by category</h2>
          </div>
          <p className="sec-sub">1990 → 2025. Each category aggregated across the 9-county region. Direction reflects net 35-year change.</p>
        </header>
        <div className="cat-list">
          <CategoryRow n="01" title="Air quality — PM2.5" sub="Annual mean, 28 monitors" value="9.2" unit="µg/m³" direction="down" deltaLabel="−54% since 1999" color="#6FCF97" showRule />
          <CategoryRow n="02" title="Air quality — Ozone" sub="4th-max 8-hour average" value="0.071" unit="ppm" direction="down" deltaLabel="−28% since 1990" color="#6FCF97" showRule />
          <CategoryRow n="03" title="Toxic releases (TRI)" sub="Total reported pounds" value="14.8M" unit="lbs/yr" direction="down" deltaLabel="−71% since 1990" color="#60A5FA" />
          <CategoryRow n="04" title="GHG emissions (FLIGHT)" sub="Reporting facilities" value="22.4M" unit="MT CO₂e" direction="flat" deltaLabel="±2% since 2010" color="#E6B450" />
          <CategoryRow n="05" title="Superfund — active" sub="National Priorities List" value="42" unit="sites" direction="down" deltaLabel="−18 since 1995" color="#6FCF97" />
          <CategoryRow n="06" title="Drinking water violations" sub="Public water systems, MCL" value="34" unit="violations" direction="up" deltaLabel="+18% vs. 5-yr avg" color="#FF6B6B" />
          <CategoryRow n="07" title="ECHO enforcement actions" sub="Federal + delegated state" value="186" unit="actions/yr" direction="flat" deltaLabel="−6% vs. 5-yr avg" color="#E6B450" />
          <CategoryRow n="08" title="Lead exposure risk" sub="Pre-1980 housing × poverty" value="312" unit="tracts ≥ p90" direction="down" deltaLabel="−9% since 2010" color="#60A5FA" />
        </div>
      </div>
    </section>
  );
}

function EJSection() {
  const rows = [
    { tract:"06001405100", nbhd:"W. Oakland", pm:14.2, tri:680, ej:0.94, mins:0.78, pov:0.31 },
    { tract:"06075061500", nbhd:"Bayview", pm:12.8, tri:420, ej:0.91, mins:0.85, pov:0.27 },
    { tract:"06013351200", nbhd:"Richmond N", pm:13.5, tri:910, ej:0.93, mins:0.71, pov:0.24 },
    { tract:"06001408400", nbhd:"E. Oakland", pm:11.9, tri:240, ej:0.86, mins:0.82, pov:0.29 },
    { tract:"06081609800", nbhd:"E. Palo Alto", pm:10.1, tri:55, ej:0.78, mins:0.74, pov:0.18 },
    { tract:"06013355000", nbhd:"Pittsburg", pm:11.0, tri:710, ej:0.81, mins:0.66, pov:0.21 },
    { tract:"06001408700", nbhd:"San Leandro", pm:10.7, tri:160, ej:0.74, mins:0.68, pov:0.16 },
  ];
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 03</div>
            <h2>Burden vs. demographics</h2>
          </div>
          <p className="sec-sub">EJ index = product of pollution-burden percentile and demographic-vulnerability percentile (EPA EJScreen formula). Top tracts shown.</p>
        </header>
        <div className="ej-grid">
          <div className="ej-table">
            <div className="ej-th">
              <span>TRACT</span>
              <span>NEIGHBORHOOD</span>
              <span className="r">PM2.5</span>
              <span className="r">TRI (k lbs)</span>
              <span className="r">% MINORITY</span>
              <span className="r">% POVERTY</span>
              <span className="r">EJ INDEX</span>
            </div>
            {rows.map(r => (
              <a className="ej-tr" href="#" key={r.tract}>
                <span className="num-mono">{r.tract}</span>
                <span className="nbhd">{r.nbhd}</span>
                <span className="r num-mono">{r.pm.toFixed(1)}</span>
                <span className="r num-mono">{r.tri}</span>
                <span className="r num-mono">{Math.round(r.mins*100)}%</span>
                <span className="r num-mono">{Math.round(r.pov*100)}%</span>
                <span className="r ej-cell">
                  <span className="ej-bar"><i style={{ width: `${r.ej*100}%` }}/></span>
                  <span className="ej-num">{r.ej.toFixed(2)}</span>
                </span>
              </a>
            ))}
          </div>
          <aside className="ej-side">
            <h4>Read this carefully.</h4>
            <p>EJ index is a flag, not a verdict. A tract scoring 0.94 means "in the top 6% nationally on combined burden + vulnerability" — it doesn't say what's causing the burden, or what would help.</p>
            <p>Always pair the index with the underlying datasets — toggle the overlay above to see PM2.5 alone, then TRI alone, then the combined EJ score. The patterns that overlap matter more than any single number.</p>
            <a href="#" className="link-mono">Read the methodology →</a>
          </aside>
        </div>
      </div>
    </section>
  );
}

function FacilitiesSection() {
  const f = [
    { name:"Chevron Refinery", city:"Richmond", lbs:1.4e6, ghg:4.2e6, last:"2024-09" },
    { name:"Phillips 66 Refinery", city:"Rodeo", lbs:880000, ghg:3.6e6, last:"2024-08" },
    { name:"Marathon Petroleum", city:"Martinez", lbs:540000, ghg:3.1e6, last:"2024-11" },
    { name:"Tesoro Golden Eagle", city:"Pacheco", lbs:410000, ghg:2.8e6, last:"2024-07" },
    { name:"Lehigh Cement", city:"Cupertino", lbs:280000, ghg:1.4e6, last:"2024-10" },
    { name:"Owens-Brockway Glass", city:"Oakland", lbs:185000, ghg:340000, last:"2024-08" },
  ];
  const fmtK = n => n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : `${(n/1000).toFixed(0)}k`;
  return (
    <section className="section section-tint">
      <div className="wrap">
        <header className="sec-head">
          <div>
            <div className="kicker">SECTION 04</div>
            <h2>Top emitters, last reporting year</h2>
          </div>
          <p className="sec-sub">Facilities by 2023 TRI total releases and 2023 FLIGHT GHG reporting.</p>
        </header>
        <div className="fac-list">
          {f.map(x => (
            <a className="fac-row" href="#" key={x.name}>
              <span className="dot"/>
              <span className="fac-name">{x.name}<span className="fac-city">{x.city}</span></span>
              <span className="fac-stat"><span className="num-mono">{fmtK(x.lbs)}</span><span className="meta-mono">lbs TRI</span></span>
              <span className="fac-stat"><span className="num-mono">{fmtK(x.ghg)}</span><span className="meta-mono">MT CO₂e</span></span>
              <span className="fac-meta">Last inspection {x.last}</span>
              <span className="fac-arrow">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function MethodPromo() {
  return (
    <section className="section">
      <div className="wrap">
        <div className="method-promo">
          <div>
            <div className="kicker">METHODOLOGY</div>
            <h3>How we trend across 35 years of changing reporting rules.</h3>
            <p>EPA datasets are not stable. TRI thresholds change. Air monitors come and go. We document every join, every imputation, and every break — so you can see where the trend ends and the methodology change begins.</p>
          </div>
          <a href="#" className="btn btn-primary">Read methodology →</a>
        </div>
      </div>
    </section>
  );
}

function EpaRegionPage() {
  return (
    <div style={{ background: "var(--bg)", color: "var(--fg)" }}>
      <EpaHeader active="region" />
      <EpaRegionHero />
      <MapSection />
      <CategoriesSection />
      <EJSection />
      <FacilitiesSection />
      <MethodPromo />
      <EpaFooter />
    </div>
  );
}

window.EpaRegionPage = EpaRegionPage;

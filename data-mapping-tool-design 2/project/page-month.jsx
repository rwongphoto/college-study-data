/* global React, Ic, SiteHeader, SiteFooter, Crumbs, TrendLine */

// Banner: clear visual treatment when viewing a past month
function ArchivedBanner({ month, year }) {
  return (
    <div className="archive-banner">
      <div className="wrap row">
        <div className="ab-left">
          <span className="ab-icon" aria-hidden="true">◴</span>
          <div className="ab-text">
            <span className="ab-label">Archived snapshot</span>
            <span className="ab-meta">{month} {year} · narrative + chart preserved as published · live data has moved on</span>
          </div>
        </div>
        <a href="#" className="ab-cta">
          Return to current month<Ic.arrow s={13} />
        </a>
      </div>
    </div>
  );
}

// Hero chart for the lead anomaly — same kind of chart we use elsewhere,
// but stamped "ARCHIVED" so it can't be mistaken for live.
function MonthLeadChart() {
  const W = 880, H = 280, pad = { l: 44, r: 24, t: 24, b: 32 };
  const innerW = W - pad.l - pad.r, innerH = H - pad.t - pad.b;
  // 24 months
  const counts = [21, 25, 27, 24, 29, 31, 25, 22, 26, 24, 28, 30, 27, 24, 28, 26, 25, 22, 21, 23, 26, 27, 25, 47];
  const months = ["A","M","J","J","A","S","O","N","D","J","F","M","A","M","J","J","A","S","O","N","D","J","F","M"];
  const max = 55;
  const bw = innerW / counts.length;
  const x = (i) => pad.l + i * bw + bw * 0.18;
  const w = bw * 0.64;
  const y = (v) => pad.t + innerH - (v / max) * innerH;
  const mean = 25.6, sigma = 6.2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <rect x={pad.l} y={y(mean + sigma)} width={innerW} height={y(mean - sigma) - y(mean + sigma)} fill="var(--blue-wash)" opacity="0.5" />
      <line x1={pad.l} y1={y(mean)} x2={W - pad.r} y2={y(mean)} stroke="var(--fg-4)" strokeDasharray="3 3" strokeWidth="1" />
      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--fg-4)">
        {[0, 20, 40].map(v => (
          <g key={v}>
            <line x1={pad.l - 4} y1={y(v)} x2={pad.l} y2={y(v)} stroke="var(--fg-5)" />
            <text x={pad.l - 7} y={y(v) + 3} textAnchor="end">{v}</text>
          </g>
        ))}
        <text x={W - pad.r} y={y(mean) - 4} textAnchor="end" fill="var(--fg-3)">μ 25.6 · σ 6.2 · trailing 12-mo (as of Apr '26)</text>
      </g>
      {counts.map((v, i) => {
        const last = i === counts.length - 1;
        return (
          <rect key={i} x={x(i)} y={y(v)} width={w} height={pad.t + innerH - y(v)}
            fill={last ? "var(--score-low)" : "var(--fg-3)"}
            opacity={last ? 1 : 0.5} />
        );
      })}
      <g>
        <line x1={x(counts.length - 1) + w / 2} y1={y(47) - 6} x2={x(counts.length - 1) + w / 2} y2={y(47) - 28} stroke="var(--score-low)" strokeWidth="1" />
        <circle cx={x(counts.length - 1) + w / 2} cy={y(47) - 30} r="3" fill="var(--score-low)" />
        <text x={x(counts.length - 1) + w / 2 - 8} y={y(47) - 36} fontFamily="JetBrains Mono, monospace" fontSize="11" fill="var(--score-low)" textAnchor="end" fontWeight="500">SPIKE z = 2.6</text>
      </g>
      <g fontFamily="JetBrains Mono, monospace" fontSize="10" fill="var(--fg-4)">
        {months.map((m, i) => (i % 4 === 0 || i === months.length - 1) && (
          <text key={i} x={x(i) + w / 2} y={H - 14} textAnchor="middle">{m}</text>
        ))}
        <text x={pad.l} y={H - 4} fontSize="9" fill="var(--fg-5)">APR '24</text>
        <text x={W - pad.r} y={H - 4} textAnchor="end" fontSize="9" fill="var(--fg-5)">MAR '26</text>
      </g>
      {/* archived watermark */}
      <text x={W / 2} y={H / 2} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize="64" fill="var(--fg-5)" opacity="0.10" letterSpacing="0.1em" fontWeight="500">ARCHIVED</text>
    </svg>
  );
}

function MonthHero() {
  return (
    <section className="month-hero">
      <div className="wrap">
        <div className="eyebrow">San Francisco · monthly briefing</div>
        <h1>April 2026</h1>
        <p className="lede">A quiet month, with one loud exception in the Outer Sunset.</p>
        <div className="month-byline">
          <span className="meta-mono">PUBLISHED APR 14, 2026</span>
          <span className="meta-mono">5 MIN READ</span>
          <span className="meta-mono">EDITOR · K. ALMEIDA</span>
          <span className="meta-mono" style={{ color: "var(--fg-4)" }}>· /sf/2026/april</span>
        </div>
      </div>
    </section>
  );
}

function MonthBody() {
  return (
    <section className="month-body">
      <div className="wrap">
        <div className="mb-grid">
          <aside className="mb-side">
            <div className="kicker">TL;DR</div>
            <ul className="mb-tldr">
              <li><strong>Citywide volume −7.4%</strong> vs. trailing 12-mo average.</li>
              <li><strong>23 anomalies</strong> — 9 spikes, 11 drops, 3 rare events.</li>
              <li><strong>Outer Sunset burglary +63% MoM</strong> — the headline.</li>
              <li><strong>Auto theft</strong> continues its multi-quarter decline.</li>
              <li><strong>Russian Hill arson cluster</strong> — first since Aug 2019.</li>
            </ul>
            <div className="mb-anom">
              <div className="kicker">FLAGS THIS MONTH</div>
              <div className="anom-list">
                <div><span className="chip low">SPIKE</span><span>Outer Sunset · burglary +63%</span></div>
                <div><span className="chip high">DROP</span><span>Bayview · auto theft −41% YoY</span></div>
                <div><span className="chip mid">RARE</span><span>Russian Hill · arson cluster (n=5)</span></div>
                <div><span className="chip high">DROP</span><span>Mission · auto theft −24% YoY</span></div>
                <div><span className="chip high">DROP</span><span>SoMa · larceny −14%</span></div>
                <div className="more">+ 18 more →</div>
              </div>
            </div>

            <div className="mb-archive">
              <div className="kicker">NAVIGATE</div>
              <a href="#" className="nav-link prev">
                <span className="meta-mono">← PREVIOUS</span>
                <span>March 2026</span>
              </a>
              <a href="#" className="nav-link next disabled">
                <span className="meta-mono">NEXT →</span>
                <span>May 2026 (not published)</span>
              </a>
              <a href="#" className="meta-mono" style={{ marginTop: 12, display: "inline-flex", color: "var(--blue)" }}>All briefings →</a>
            </div>
          </aside>

          <article className="mb-article">
            <p className="lead">
              April's briefing is, on the whole, an unexciting one — and that's worth saying out loud. Citywide incident volume is down 7.4% against the trailing twelve months, with declines distributed broadly rather than driven by any one category or district. Were it not for a single neighborhood spike, this would be the calmest month we've published since the project went live in January.
            </p>

            <p>
              That spike is in the <a href="#">Outer Sunset</a>, where burglary jumped 63% month-over-month, the largest standalone move anywhere in the city. Thirty-six of the forty-seven incidents occurred west of 41st Avenue, and seventy-one percent took place on weekday afternoons — a pattern consistent with daytime residential burglary. The detail of that spike, including its comparison to a similar 2019 cluster, is on the <a href="#">Outer Sunset neighborhood page</a>.
            </p>

            <figure className="mb-figure">
              <div className="fig-head">
                <span className="meta-mono">FIG 1 · LEAD ANOMALY</span>
                <span className="meta-mono" style={{ color: "var(--fg-4)" }}>BURGLARY · OUTER SUNSET · 24-MO COUNT</span>
              </div>
              <div className="fig-canvas">
                <MonthLeadChart />
              </div>
              <figcaption>
                Outer Sunset burglary, monthly count. The trailing 12-month mean and ±1σ band are shown for context. March 2026 (final bar) sits at 47, against a 12-month mean of 25.6 and σ of 6.2 — a z-score of 2.6, well past our 2.0 spike threshold. The chart is a frozen view as of April 14, 2026.
              </figcaption>
            </figure>

            <h3>Sustained drops worth naming</h3>

            <p>
              <strong>Auto theft</strong> is now five straight months below trend citywide, with the steepest declines in <a href="#">Bayview</a> (−41% YoY) and the <a href="#">Mission</a> (−24% YoY). The pattern began in late 2025 and has tightened the trailing variance enough that we expect to reset the baseline downward in the May briefing. We've been calling this an emerging story since November; this month it's safe to call it a structural change.
            </p>

            <p>
              <strong>Robbery</strong> has had five consecutive months below the 12-month moving average across the eastern half of the city. The decline is monotonic and the variance has tightened — characteristics that often precede a new lower baseline. We aren't there yet, but it's worth flagging that we expect another reset in the May or June briefing.
            </p>

            <h3>Rare events</h3>

            <p>
              A small <strong>arson cluster in <a href="#">Russian Hill</a></strong> — five incidents within 0.4 miles over eleven days — triggered our rare-event flag. The last comparable cluster in that geography was in August 2019. We are not yet calling this a sustained change; rare-event flags are deliberately conservative and the threshold is high. We'll watch May closely.
            </p>

            <h3>How last month's forecasts performed</h3>

            <p>
              Of the seven point-estimates we issued in March, six landed inside their 90% prediction intervals. The miss was the Outer Sunset burglary forecast (predicted 28; actual 47) — the spike <em>is</em>, by definition, the model being wrong, and we say so plainly in the methodology. We are not changing the forecast model on the strength of one miss; if April also lands outside the interval, that is a different conversation.
            </p>

            <h3>Reading next month</h3>

            <p>
              May's briefing will likely lead on whether the Outer Sunset spike is a cluster or a seasonal early arrival, the auto theft baseline reset, and whatever the Russian Hill arson situation looks like in another four weeks. As always: only the things that actually changed.
            </p>

            <div className="mb-foot">
              <div className="mb-cite">
                <span className="kicker">CITE</span>
                <code>Crime Trends, "April 2026 — San Francisco," published Apr 14, 2026.</code>
                <span style={{ color: "var(--fg-4)", fontSize: 12 }}>Permanent URL: /sf/2026/april</span>
              </div>
              <div className="mb-tools">
                <a href="#" className="btn btn-ghost btn-sm"><Ic.download s={13} />Download PDF</a>
                <a href="#" className="btn btn-ghost btn-sm">Methodology →</a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

function MonthPage() {
  return (
    <div style={{ background: "var(--paper)" }}>
      <SiteHeader active="city" />
      <ArchivedBanner month="April" year="2026" />
      <Crumbs items={[
        { label: "Cities", href: "#" },
        { label: "San Francisco", href: "#" },
        { label: "Archive", href: "#" },
        { label: "April 2026" },
      ]} />
      <MonthHero />
      <MonthBody />
      <SiteFooter />
    </div>
  );
}

window.MonthPage = MonthPage;

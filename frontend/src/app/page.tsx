import type { Metadata } from "next";
import Link from "next/link";

import FlagCards from "@/components/FlagCards";
import LongArcCards from "@/components/LongArcCards";
import { JumpStrip } from "@/components/site/JumpStrip";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { listStates, loadHome, loadState } from "@/lib/data";
import { fmtNumber } from "@/lib/format";
import { stateSlug } from "@/lib/state";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  const home = loadHome();
  // primary.slug here is a URL slug ("oregon"); primary.abbr keeps the postal
  // code so loadState() can still find the JSON.
  const primary = home.states[0]
    ? {
        ...home.states[0],
        slug: stateSlug(home.states[0].slug),
        abbr: home.states[0].slug,
      }
    : null;
  const primaryAgg = primary ? loadState(primary.abbr) : null;
  const allLive = listStates();

  // Sector breakdown for the featured-state card. Counts come from state agg.
  const sectorRows: Array<{ name: string; count: number; pct: number; color: string }> = [];
  if (primaryAgg) {
    const total = primaryAgg.institution_count || 1;
    const buckets: Array<[string, string, string]> = [
      ["public", "Public", "#6FCF97"],
      ["private_nonprofit", "Private nonprofit", "#60A5FA"],
      ["private_forprofit", "For-profit", "#C44545"],
    ];
    for (const [key, label, color] of buckets) {
      const count = primaryAgg.institutions_by_control[key] ?? 0;
      sectorRows.push({
        name: label,
        count,
        pct: count / total,
        color,
      });
    }
  }
  const maxSectorPct = Math.max(0.001, ...sectorRows.map((r) => r.pct));

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.collegegradanalyst.com";
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "College Grad Analyst",
    url: siteUrl,
    description:
      "Federal college outcomes — earnings, debt, completion, and default — for every Title-IV institution and program.",
    publisher: {
      "@type": "Organization",
      name: "College Grad Analyst",
      url: siteUrl,
    },
  };

  return (
    <>
      <SiteHeader active="home" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <JumpStrip
        items={[
          { id: "ways-in", label: "Three Ways In" },
          { id: "coverage", label: "Coverage" },
          {
            id: "flags",
            label: "Signals",
            show: !!(primaryAgg && (primaryAgg.flags ?? []).length > 0),
          },
          {
            id: "shifts",
            label: "Shifts",
            show: !!(primaryAgg && primaryAgg.long_arc.length > 0),
          },
          { id: "methodology", label: "Methodology" },
          { id: "start", label: "Start Here", show: !!primary },
        ]}
      />
      <main>

      <section className="home-hero">
        <div className="wrap">
          <div className="hh-grid">
            <div className="hh-copy">
              <div className="eyebrow">Federal data · independently surfaced</div>
              <h1>The numbers schools don&apos;t put on the brochure.</h1>
              <p className="lede">
                Earnings, debt, completion, and default — for every Title-IV
                institution and every program where the federal government
                publishes outcomes. Sourced from the College Scorecard, IPEDS,
                and Treasury tax records. Updated annually.
              </p>
              <div className="hh-ctas">
                {primary && (
                  <Link className="btn btn-primary" href={`/state/${primary.slug}/`}>
                    Open the {primary.name} hub →
                  </Link>
                )}
                <Link className="btn btn-ghost" href="/methodology">
                  Read methodology
                </Link>
              </div>
              <div className="hh-stats">
                <div>
                  <span className="num">{fmtNumber(home.institution_count)}</span>
                  <span className="meta-mono">TITLE-IV INSTITUTIONS</span>
                </div>
                <div>
                  <span className="num">{fmtNumber(home.program_count)}</span>
                  <span className="meta-mono">PROGRAMS · CIP × CREDENTIAL</span>
                </div>
                <div>
                  <span className="num">{home.states.length}</span>
                  <span className="meta-mono">STATE{home.states.length === 1 ? "" : "S"} LIVE</span>
                </div>
                <div>
                  <span className="num">{home.source.vintage}</span>
                  <span className="meta-mono">VINTAGE · ANNUAL SHIP</span>
                </div>
              </div>
            </div>
            {primary && primaryAgg && (
              <aside className="hh-card">
                <div className="hhc-tag">
                  <span className="meta-mono">FEATURED · {primary.name.toUpperCase()}</span>
                  <span className="hhc-pulse">
                    <span className="hhc-pulse-dot" aria-hidden="true" /> LIVE
                  </span>
                </div>
                <div className="hhc-headline">Title-IV institutions, by sector</div>
                <ul className="hhc-rows">
                  {sectorRows.map((r) => (
                    <li key={r.name}>
                      <span className="hhc-name">{r.name}</span>
                      <span className="hhc-bar">
                        <i
                          style={{
                            width: `${(r.pct / maxSectorPct) * 100}%`,
                            background: r.color,
                          }}
                        />
                      </span>
                      <span className="num-mono">{r.count}</span>
                    </li>
                  ))}
                </ul>
                <div className="hhc-foot">
                  <span className="meta-mono">
                    SOURCE · {home.source.name.toUpperCase()}
                  </span>
                  <Link className="link-mono" href={`/state/${primary.slug}/`}>
                    See all {primary.institution_count} →
                  </Link>
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>

      <section id="ways-in" className="section section-tint">
        <div className="wrap">
          <header className="sec-head">
            <div>
              <div className="kicker">SECTION 01 · WHAT&apos;S HERE</div>
              <h2>Three ways in.</h2>
            </div>
            <p className="sec-sub">
              Same data, three lenses. Pick the one that matches your question
              — institution, program at an institution, or programs across the
              state.
            </p>
          </header>
          <div className="lens-grid">
            <Link
              className="lens-card"
              href={primary ? `/state/${primary.slug}/` : "/"}
            >
              <div className="lens-num">01</div>
              <div className="meta-mono">BY INSTITUTION</div>
              <h3>Every Title-IV school in the state.</h3>
              <p>
                Median earnings 6/8/10 years after entry. Median debt at exit.
                Cohort default. 150%-time completion. Net price. Pell share.
              </p>
              <span className="link-mono">
                Browse{primary ? ` ${primary.name}` : ""} →
              </span>
            </Link>
            <Link
              className="lens-card"
              href={primary ? `/state/${primary.slug}/` : "/"}
            >
              <div className="lens-num">02</div>
              <div className="meta-mono">BY PROGRAM</div>
              <h3>What a major is actually worth, where.</h3>
              <p>
                CIP-4 program outcomes per institution. Compare CS at one
                school to CS at another. Same federal data, same horizon, same
                suppression rules.
              </p>
              <span className="link-mono">Browse programs →</span>
            </Link>
            <Link className="lens-card" href="/methodology">
              <div className="lens-num">03</div>
              <div className="meta-mono">BY METHOD</div>
              <h3>Why the numbers are honest.</h3>
              <p>
                Federal-source-only sourcing. Suppression-honest rendering.
                Descriptive prose only. No causal claims, no rankings, no LLM.
              </p>
              <span className="link-mono">Read methodology →</span>
            </Link>
          </div>
        </div>
      </section>

      <section id="coverage" className="section">
        <div className="wrap">
          <header className="sec-head">
            <div>
              <div className="kicker">SECTION 02 · COVERAGE</div>
              <h2>{primary ? `${primary.name} now.` : "Live coverage."} Other states next.</h2>
            </div>
            <p className="sec-sub">
              Federal data covers all 50 states, but each state&apos;s
              institutions need vetting against IPEDS and local accreditor
              records before we publish. {allLive.length === 1 ? "First state is live; the rest are queued." : `${allLive.length} states live; the rest are queued.`}
            </p>
          </header>
          <div className="cov-grid">
            {home.states.map((s) => (
              <Link
                key={s.slug}
                className="cov-card live"
                href={`/state/${stateSlug(s.slug)}/`}
                style={{ textDecoration: "none" }}
              >
                <div className="cov-code">{s.slug.toUpperCase()}</div>
                <div className="cov-meta">
                  <div className="cov-name">{s.name}</div>
                  <div className="meta-mono">{fmtNumber(s.institution_count)} INSTITUTIONS</div>
                </div>
                <div className="cov-pill live">● LIVE</div>
              </Link>
            ))}
            <div className="cov-card queued">
              <div className="cov-code">+49</div>
              <div className="cov-meta">
                <div className="cov-name">All other states</div>
                <div className="meta-mono">PHASE 2 · ANNUAL</div>
              </div>
              <div className="cov-pill queued">○ QUEUED</div>
            </div>
          </div>
        </div>
      </section>

      {primaryAgg && (primaryAgg.flags ?? []).length > 0 && (
        <section id="flags" className="section section-tint">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">ANOMALY ENGINE · NOTABLE SIGNALS</div>
                <h2>What the data flags in {primary?.name}</h2>
              </div>
              <p className="sec-sub">
                Six detectors run on every institution: short-arc shift
                (recent 3-year window), earnings trend, peer outlier,
                completion drop, enrollment cliff, and debt-to-earnings
                warning — a mix of warnings and improvements. Multi-decade
                shifts are reported separately in the Long Arc section.
              </p>
            </header>
            <FlagCards flags={primaryAgg.flags ?? []} cap={6} />
          </div>
        </section>
      )}

      {primaryAgg && primaryAgg.long_arc.length > 0 && (
        <section id="shifts" className="section">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">SECTION 03 · LONG ARC</div>
                <h2>How {primary?.name} has shifted</h2>
              </div>
              <p className="sec-sub">
                Long-arc shifts the federal data records. Each card is a
                first-year-to-last-year comparison; coverage varies by metric.
              </p>
            </header>
            <LongArcCards
              arcs={primaryAgg.long_arc}
              scope={`${primary?.name} statewide`}
            />
          </div>
        </section>
      )}

      <section id="methodology" className="section">
        <div className="wrap">
          <div className="method-promo">
            <div>
              <div className="kicker">METHODOLOGY · THE SHORT VERSION</div>
              <h3>Descriptive numbers. Not causal claims.</h3>
              <p>
                Earnings are <strong>median tax-record earnings</strong> for
                federally aided students, 4–10 years after first enrollment.
                The cohort includes non-completers and people who left the
                state. Selection bias is real — high-earning programs often
                attract higher-earning students. We publish the federal data as
                it is, with the caveats it deserves. We don&apos;t tell you
                which school to go to.
              </p>
            </div>
            <Link href="/methodology" className="btn btn-primary">
              Full methodology →
            </Link>
          </div>
        </div>
      </section>

      {primary && (
        <section id="start" className="section">
          <div className="wrap">
            <div className="hcta">
              <div className="hcta-l">
                <div className="kicker">START HERE</div>
                <h2>Open the {primary.name} hub.</h2>
                <p>
                  Every Title-IV institution. Every published program.
                  Sortable, filterable, with the source caveats inline.
                </p>
              </div>
              <div className="hcta-r">
                <Link className="btn btn-primary" href={`/state/${primary.slug}/`}>
                  {primary.name} hub →
                </Link>
                <Link className="btn btn-ghost" href="/methodology">
                  Methodology
                </Link>
                <span className="meta-mono" style={{ color: "var(--fg-4)" }}>
                  VINTAGE · {home.source.vintage.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      </main>
      <SiteFooter vintageLabel={`${home.source.vintage}`} />
    </>
  );
}

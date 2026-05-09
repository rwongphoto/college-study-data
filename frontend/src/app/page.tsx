import type { Metadata } from "next";
import Link from "next/link";

import { Ic } from "@/components/site/icons";
import { JumpStrip } from "@/components/site/JumpStrip";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { loadHome, loadRankings } from "@/lib/data";
import { fmtNumber } from "@/lib/format";
import { stateSlug } from "@/lib/state";
import type { RankingRow, RankingTable } from "@/lib/types";

const HOME_DESCRIPTION =
  "Federal college outcomes — earnings, debt, completion, and default — for every Title-IV institution and program. Sourced from the College Scorecard, IPEDS, and Treasury tax records.";

const HOME_TITLE = "College Rankings — Earnings, Debt, Completion | College Grad Analyst";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { url: "/", title: HOME_TITLE, description: HOME_DESCRIPTION },
  twitter: { title: HOME_TITLE, description: HOME_DESCRIPTION },
};

function findTable(
  tables: RankingTable[],
  lane: string,
  direction: "most" | "least",
): RankingTable | null {
  return tables.find((t) => t.lane === lane && t.direction === direction) ?? null;
}

function HomeHero({
  totals,
  reportingYear,
  vintage,
  headline,
}: {
  totals: { institutions: number; programs: number; states: number; cities: number };
  reportingYear: number;
  vintage: string;
  headline: { row: RankingRow; lane: string; label: string } | null;
}) {
  const headlineHref = headline
    ? `/state/${stateSlug(headline.row.state)}/institution/${headline.row.slug}/`
    : "/rankings/institutions";

  return (
    <section className="home-hero">
      <div className="wrap">
        <div className="grid">
          <div>
            <div className="eyebrow">Federal data · independently surfaced</div>
            <h1>
              The numbers schools don&apos;t put on the <em>brochure</em>.
            </h1>
            <p className="lead lede">
              Earnings, debt, completion, and default — for every Title-IV
              institution and every program where the federal government
              publishes outcomes. Sourced from College Scorecard, IPEDS, and
              Treasury tax records. {reportingYear} reporting year.
            </p>
            <div className="actions">
              <Link href="/rankings/institutions" className="btn btn-primary">
                Browse rankings <Ic.arrow s={14} />
              </Link>
              <Link href="/rankings/programs" className="btn btn-ghost">
                Programs by major
              </Link>
              <Link href="/methodology" className="btn btn-ghost">
                How it works
              </Link>
            </div>
          </div>
          <aside style={{ borderLeft: "1px solid var(--rule)", paddingLeft: 32 }}>
            <div className="kicker" style={{ marginBottom: 10 }}>
              Coverage · vintage {vintage}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 8 }}>
              <li className="meta-mono" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>TITLE-IV INSTITUTIONS</span>
                <span>{fmtNumber(totals.institutions)}</span>
              </li>
              <li className="meta-mono" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>PROGRAMS · CIP × CRED</span>
                <span>{fmtNumber(totals.programs)}</span>
              </li>
              <li className="meta-mono" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>STATES + DC + PR</span>
                <span>{fmtNumber(totals.states)}</span>
              </li>
              <li className="meta-mono" style={{ display: "flex", justifyContent: "space-between" }}>
                <span>CITIES TRACKED</span>
                <span>{fmtNumber(totals.cities)}</span>
              </li>
            </ul>
            {headline && (
              <div
                style={{
                  marginTop: 18,
                  padding: 14,
                  borderTop: "1px solid var(--rule)",
                  background: "var(--bg-2)",
                }}
              >
                <div className="kicker" style={{ marginBottom: 6, color: "var(--blue)" }}>
                  Headline this update
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.45, margin: 0, color: "var(--fg-2)" }}>
                  Highest {headline.label} —{" "}
                  <Link
                    href={headlineHref}
                    style={{ color: "var(--fg)", fontWeight: 500 }}
                  >
                    {headline.row.name}
                  </Link>{" "}
                  ({headline.row.city ?? headline.row.state_label}) at{" "}
                  <span className="num-mono" style={{ color: "var(--fg)" }}>
                    {headline.row.value_label}
                  </span>
                  .
                </p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}

function StartHereSection() {
  const surfaces = [
    {
      label: "INSTITUTION RANKINGS",
      title: "Colleges by Outcomes",
      desc:
        "Title-IV institutions ranked on earnings 10y after entry, 150%-time completion, median debt, default rate, admission rate, and Pell share. Filtered to 1,000+ undergrads so specialty institutes don't dominate the extremes.",
      href: "/rankings/institutions",
      cta: "See institution rankings",
    },
    {
      label: "PROGRAM RANKINGS",
      title: "Majors by What They Pay",
      desc:
        "CIP × credential programs ranked by median earnings 5 years after completion, plus median debt and largest cohorts. Same federal data, same horizon, same suppression rules across schools.",
      href: "/rankings/programs",
      cta: "See program rankings",
    },
    {
      label: "STATE RANKINGS",
      title: "States by Median Outcome",
      desc:
        "All 52 states (plus DC and Puerto Rico) ranked by statewide median earnings, completion, debt, and Pell share — useful when the question is geographic, not institutional.",
      href: "/rankings/states",
      cta: "See state rankings",
    },
  ];
  return (
    <section className="section section-tint" id="start">
      <div className="wrap">
        <div style={{ marginBottom: 40 }}>
          <div className="eyebrow">Where to start</div>
          <h2 className="h-display" style={{ fontSize: "clamp(28px,3vw,40px)", margin: "8px 0 0" }}>
            Outcomes, At Every Scale
          </h2>
          <p className="lead" style={{ maxWidth: "62ch", marginTop: 14 }}>
            Federal outcome data lives at different scales because the
            questions do. Pick the ranking that matches what you actually want
            to know — institutions, programs, or states.
          </p>
        </div>
        <div className="cities-grid">
          {surfaces.map((s) => (
            <Link key={s.label} href={s.href} className="city-tile live">
              <div className="tile-meta">
                <span>{s.label}</span>
              </div>
              <h3>{s.title}</h3>
              <p className="desc">{s.desc}</p>
              <div
                style={{
                  marginTop: "auto",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "var(--blue)",
                    fontSize: 13,
                    fontWeight: 500,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {s.cta} <Ic.arrow s={13} />
                </span>
                <span className="meta-mono">→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function PrinciplesSection() {
  const items = [
    {
      ic: Ic.trend,
      t: "Trend, not totals",
      d: "Earnings cohorts move slowly. We surface 4-to-29-year long-arc shifts in completion, enrollment, and tuition — not just last year's number.",
    },
    {
      ic: Ic.shield,
      t: "Descriptive, not causal",
      d: "Selection effects (who enrolls, who completes, what fields they pick) drive most cross-school variation. We publish the federal data; we don't tell you which school to attend.",
    },
    {
      ic: Ic.layers,
      t: "Federal-only sources",
      d: "College Scorecard for Treasury earnings + Field-of-Study, IPEDS HD for institutional structure, FSA for default rate. All public-domain, all reproducible from the methodology page.",
    },
    {
      ic: Ic.doc,
      t: "Methodology open",
      d: "Every metric, every cohort definition, every suppression rule is on the methodology page. Read the rules; reproduce the numbers.",
    },
  ];
  return (
    <section className="section" id="principles">
      <div className="wrap">
        <div className="how-intro-grid">
          <div>
            <div className="eyebrow">How it works</div>
            <h2 className="h-display" style={{ fontSize: "clamp(28px,3vw,40px)", margin: "8px 0 0" }}>
              Four Principles For Federal College Data
            </h2>
          </div>
          <p className="lead" style={{ margin: 0, maxWidth: "60ch" }}>
            The federal data is rich, public, and underused outside compliance
            offices. We built this so the analytics-and-narrative layer most
            people actually need is one URL away — without the marketing layer
            schools paint over it.
          </p>
        </div>
        <div className="principles">
          {items.map((p, i) => (
            <div key={i} className="principle">
              <div className="ic">
                <p.ic s={26} />
              </div>
              <h3>{p.t}</h3>
              <p>{p.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

type FeaturedItem = {
  kind: "spike" | "drop" | "rare";
  chip: string;
  row: RankingRow;
  href: string;
  caption: string;
  metric: string;
};

function FeaturedSection({ items }: { items: FeaturedItem[] }) {
  if (items.length === 0) return null;
  return (
    <section className="section section-tint" id="featured">
      <div className="wrap">
        <div style={{ marginBottom: 32 }}>
          <div className="eyebrow">Featured this update</div>
          <h2 className="h-display" style={{ fontSize: "clamp(28px,3vw,40px)", margin: "8px 0 0" }}>
            Three Signals Worth A Read
          </h2>
          <p className="lead" style={{ maxWidth: "62ch", marginTop: 14 }}>
            One row from each of three ranking tables — pulled live from this
            update so the homepage tracks the data, not a hand-picked story.
          </p>
        </div>
        <div className="anomaly-strip">
          {items.map((a) => (
            <div key={a.chip} className={`anomaly-card ${a.kind}`}>
              <div className="head">
                <span className="chip ink">{a.chip}</span>
              </div>
              <h3>
                <Link href={a.href} style={{ color: "inherit", textDecoration: "none" }}>
                  {a.row.name}
                </Link>
              </h3>
              <p>{a.caption}</p>
              <p
                className="meta-mono"
                style={{ color: "var(--fg-3)", fontSize: 11, marginTop: 12 }}
              >
                {a.metric.toUpperCase()} · {a.row.value_label}
              </p>
              <Link
                href={a.href}
                style={{
                  color: "var(--blue)",
                  fontSize: 13,
                  marginTop: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Open the page <Ic.arrow s={13} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function MethodologyPromo() {
  return (
    <section className="section" id="methodology">
      <div className="wrap">
        <div className="method-promo">
          <div>
            <div className="kicker">Methodology · the short version</div>
            <h3>Descriptive numbers. Not causal claims.</h3>
            <p>
              Earnings are <strong>median tax-record earnings</strong> for
              federally aided students, 4–10 years after first enrollment. The
              cohort includes non-completers and people who left the state.
              Selection bias is real — high-earning programs often attract
              higher-earning students. We publish the federal data as it is,
              with the caveats it deserves. We don&apos;t tell you which school
              to go to.
            </p>
          </div>
          <Link href="/methodology" className="btn btn-primary">
            Full methodology →
          </Link>
        </div>
      </div>
    </section>
  );
}

function HomeCTA() {
  return (
    <section className="section" style={{ textAlign: "center" }}>
      <div className="wrap-narrow">
        <p
          className="h-display"
          style={{
            fontWeight: 400,
            fontSize: "clamp(28px,3.6vw,46px)",
            lineHeight: 1.12,
            margin: 0,
            textWrap: "balance",
          }}
        >
          Federal college outcomes, with the <em className="h-italic">analytics layer</em> already done.
        </p>
        <div
          style={{
            marginTop: 32,
            display: "flex",
            gap: 10,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Link href="/rankings/institutions" className="btn btn-primary">
            Browse colleges <Ic.arrow s={14} />
          </Link>
          <Link href="/rankings/programs" className="btn btn-ghost">
            Browse programs
          </Link>
          <Link href="/methodology" className="btn btn-ghost">
            Read the methodology
          </Link>
        </div>
        <p className="muted" style={{ fontSize: 12, marginTop: 18 }}>
          Free. No accounts. No tracking. Built on public-domain federal data.
        </p>
      </div>
    </section>
  );
}

export default function HomePage() {
  const home = loadHome();
  const rankings = loadRankings();

  const totals = {
    institutions: rankings.counts.institutions,
    programs: rankings.counts.programs,
    states: rankings.counts.states,
    cities: rankings.counts.cities,
  };

  // Pull featured rows live from rankings.json so the homepage tracks the
  // data instead of a hand-picked story. Each card is one row from a
  // different table — institution earnings, institution completion, program
  // earnings — to vary the lens.
  const earningsTopInst = findTable(rankings.institutions.tables, "earnings_10yr", "most");
  const completionTopInst = findTable(rankings.institutions.tables, "completion_150", "most");
  const programEarningsTop = findTable(rankings.programs.tables, "earnings_5yr", "most");

  const headline = earningsTopInst?.rows[0]
    ? {
        row: earningsTopInst.rows[0],
        lane: "earnings_10yr",
        label: "10-year earnings",
      }
    : null;

  const featured: FeaturedItem[] = [];
  if (earningsTopInst?.rows[0]) {
    const r = earningsTopInst.rows[0];
    featured.push({
      kind: "spike",
      chip: "INSTITUTION · EARNINGS 10Y",
      row: r,
      href: `/state/${stateSlug(r.state)}/institution/${r.slug}/`,
      caption:
        "Highest median earnings 10 years after first enrollment among Title-IV institutions with 1,000+ undergrads. Treasury IRS cohort; selection effects drive most of the gap.",
      metric: "Median earnings · 10y",
    });
  }
  if (completionTopInst?.rows[0]) {
    const r = completionTopInst.rows[0];
    featured.push({
      kind: "drop",
      chip: "INSTITUTION · COMPLETION 150%",
      row: r,
      href: `/state/${stateSlug(r.state)}/institution/${r.slug}/`,
      caption:
        "Highest 150%-time completion rate. IPEDS first-time, full-time entering cohort; institutions enrolling 1,000+ undergrads only.",
      metric: "Completion · 150%",
    });
  }
  if (programEarningsTop?.rows[0]) {
    const r = programEarningsTop.rows[0];
    const href =
      r.program_page && r.institution_slug
        ? `/state/${stateSlug(r.state)}/institution/${r.institution_slug}/program/${r.slug}/`
        : r.institution_slug
          ? `/state/${stateSlug(r.state)}/institution/${r.institution_slug}/`
          : "/rankings/programs";
    featured.push({
      kind: "rare",
      chip: "PROGRAM · EARNINGS 5Y",
      row: { ...r, name: `${r.name} · ${r.institution_name ?? ""}`.trim() },
      href,
      caption: `${r.credential_desc ?? "Program"} at ${r.institution_name ?? "the institution"}, with the highest median earnings 5 years after completion. College Scorecard Field-of-Study; ${r.completers ?? "—"} completers in the cohort.`,
      metric: "Median earnings · 5y",
    });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.collegegradanalyst.com";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: "College Grad Analyst",
        description: HOME_DESCRIPTION,
        publisher: { "@id": `${siteUrl}/#org` },
        inLanguage: "en-US",
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#org`,
        name: "College Grad Analyst",
        url: `${siteUrl}/`,
        description: HOME_DESCRIPTION,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/icon.svg`,
        },
      },
    ],
  };

  return (
    <>
      <SiteHeader active="home" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JumpStrip
        items={[
          { id: "start", label: "Where to Start" },
          { id: "principles", label: "How It Works" },
          { id: "featured", label: "Featured", show: featured.length > 0 },
          { id: "methodology", label: "Methodology" },
        ]}
      />
      <main>
        <HomeHero
          totals={totals}
          reportingYear={rankings.reporting_year}
          vintage={home.source.vintage}
          headline={headline}
        />
        <StartHereSection />
        <PrinciplesSection />
        <FeaturedSection items={featured} />
        <MethodologyPromo />
        <HomeCTA />
      </main>
      <SiteFooter vintageLabel={`${home.source.vintage}`} />
    </>
  );
}

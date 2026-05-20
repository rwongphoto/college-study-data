import { notFound } from "next/navigation";
import { Suspense } from "react";

import Crumbs from "@/components/Crumbs";
import DataTile from "@/components/DataTile";
import InstitutionRankTable from "@/components/InstitutionRankTable";
import TrendLine from "@/components/TrendLine";
import { JumpStrip } from "@/components/site/JumpStrip";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  loadCity,
  loadState,
} from "@/lib/data";
import {
  fmtCurrency,
  fmtNumber,
  fmtPercent,
  historyValues,
  historyYears,
} from "@/lib/format";
import { pageMeta, SITE_URL } from "@/lib/seo";
import { stateAbbr } from "@/lib/state";

// On-demand ISR: pre-rendering all ~2.4k city pages contributes to build
// OOM. Pages generate on first request and cache for 24h. Sitemap still
// lists every city URL so crawlers find them.
export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; slug: string }>;
}) {
  const { state, slug } = await params;
  const abbr = stateAbbr(state);
  try {
    const c = await loadCity(abbr, slug);
    return pageMeta({
      title: `${c.name} College Earnings | College Grad Analyst`,
      description: `Federal-data view of ${c.institution_count} colleges in ${c.name}, ${abbr.toUpperCase()}.`,
      path: `/state/${state}/city/${slug}/`,
    });
  } catch {
    return { title: "City College Earnings | College Grad Analyst" };
  }
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ state: string; slug: string }>;
}) {
  const { state, slug } = await params;
  const abbr = stateAbbr(state);
  let city, stateAgg;
  try {
    city = await loadCity(abbr, slug);
    stateAgg = loadState(abbr);
  } catch {
    notFound();
  }

  const isThin = city.institution_count <= 1;

  const enrollSpark = historyValues(city.enrollment_history_city);
  const enrollYears = historyYears(city.enrollment_history_city);
  const completionSpark = historyValues(city.completion_history_city);
  const completionYears = historyYears(city.completion_history_city);

  const cityUrl = `${SITE_URL}/state/${state}/city/${slug}/`;
  const pageTitle = `${city.name} College Earnings | College Grad Analyst`;
  const pageDescription = `Federal-data view of ${city.institution_count} colleges in ${city.name}, ${abbr.toUpperCase()}.`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Place",
        name: city.name,
        url: cityUrl,
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: stateAgg.name,
          url: `${SITE_URL}/state/${state}/`,
        },
        description: pageDescription,
        address: {
          "@type": "PostalAddress",
          addressLocality: city.name,
          addressRegion: abbr.toUpperCase(),
          addressCountry: "US",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          {
            "@type": "ListItem",
            position: 2,
            name: stateAgg.name,
            item: `${SITE_URL}/state/${state}/`,
          },
          { "@type": "ListItem", position: 3, name: city.name, item: cityUrl },
        ],
      },
      {
        "@type": "CreativeWork",
        name: pageTitle,
        description: pageDescription,
        url: cityUrl,
        inLanguage: "en-US",
        author: {
          "@type": "Organization",
          "@id": `${SITE_URL}/`,
          name: "College Grad Analyst",
          url: `${SITE_URL}/`,
        },
        datePublished: city.source.vintage,
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/`,
        name: "College Grad Analyst",
        url: `${SITE_URL}/`,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
        description:
          "Federal earnings, debt, and completion data — surfaced per institution and per program.",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader active="state" />
      <Crumbs
        items={[
          { label: "Home", href: "/" },
          { label: stateAgg.name, href: `/state/${state}/` },
          { label: city.name },
        ]}
      />
      <JumpStrip
        items={[
          { id: "numbers", label: "The Numbers", show: !isThin },
          {
            id: "shifts",
            label: "Shifts",
            show: enrollSpark.length >= 2 || completionSpark.length >= 2,
          },
          { id: "institutions", label: "Institutions" },
        ]}
      />
      <main>

      <section className="city-header">
        <div className="wrap">
          <div className="eyebrow">
            City hub · {stateAgg.name} · vintage {city.source.vintage}
          </div>
          <h1>{city.name} Colleges</h1>
          <p className="lede" style={{ marginTop: 18, maxWidth: "62ch" }}>
            {fmtNumber(city.institution_count)} Title-IV institution
            {city.institution_count === 1 ? "" : "s"} located in {city.name}.{" "}
            {isThin
              ? "Single-institution cities link directly to the institution page."
              : "Cells below show the median across in-city institutions."}
          </p>
          <div className="byline">
            <span className="meta-mono">
              {fmtNumber(city.institution_count)} INSTITUTIONS
            </span>
            <span className="meta-mono">
              VINTAGE · {city.source.name.toUpperCase()} ·{" "}
              {city.source.vintage.toUpperCase()}
            </span>
          </div>
        </div>
      </section>

      {!isThin && (
        <section id="numbers" className="section">
          <div className="wrap">
            <div className="data-tiles data-tiles--2col">
              <DataTile
                label="City median earnings · 10y"
                value={fmtCurrency(city.earnings_median_city)}
                note={`Across in-city institutions · ${stateAgg.name} median ${fmtCurrency(stateAgg.earnings_median_state)}`}
              />
              <DataTile
                label="City completion · 150%"
                value={fmtPercent(city.completion_rate_city)}
                note={`Across in-city institutions · ${stateAgg.name} median ${fmtPercent(stateAgg.completion_rate_state)}`}
                spark={completionSpark}
                sparkColor="var(--green)"
              />
            </div>
          </div>
        </section>
      )}

      {(enrollSpark.length >= 2 || completionSpark.length >= 2) && (
        <section id="shifts" className="section section-tint">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">LONG ARC</div>
                <h2>How {city.name} has shifted</h2>
              </div>
              <p className="sec-sub">
                Federally available history for in-city institutions.
              </p>
            </header>
            <div
              data-pngable
              style={{
                display: "grid",
                gridTemplateColumns:
                  enrollSpark.length >= 2 && completionSpark.length >= 2
                    ? "1fr 1fr"
                    : "1fr",
                gap: 14,
              }}
            >
              {enrollSpark.length >= 2 && (
                <div className="figure-frame">
                  <div className="fig-head">
                    <span className="meta-mono">
                      UNDERGRAD ENROLLMENT ·{" "}
                      {city.enrollment_history_city[0].year}–
                      {
                        city.enrollment_history_city[
                          city.enrollment_history_city.length - 1
                        ].year
                      }
                    </span>
                    <span className="meta-mono">
                      {fmtNumber(enrollSpark[enrollSpark.length - 1])}
                    </span>
                  </div>
                  <div className="fig-canvas">
                    <TrendLine
                      values={enrollSpark}
                      color="var(--blue-2)"
                      startYear={enrollYears[0]}
                      endYear={enrollYears[enrollYears.length - 1]}
                      formatValue={fmtNumber}
                    />
                  </div>
                  <div className="fig-foot">
                    <span>Undergraduate enrollment in-city.</span>
                    <span className="meta-mono">IPEDS EF</span>
                  </div>
                </div>
              )}
              {completionSpark.length >= 2 && (
                <div className="figure-frame">
                  <div className="fig-head">
                    <span className="meta-mono">
                      COMPLETION 150% ·{" "}
                      {city.completion_history_city[0].year}–
                      {
                        city.completion_history_city[
                          city.completion_history_city.length - 1
                        ].year
                      }
                    </span>
                    <span className="meta-mono">
                      {fmtPercent(
                        completionSpark[completionSpark.length - 1],
                      )}
                    </span>
                  </div>
                  <div className="fig-canvas">
                    <TrendLine
                      values={completionSpark}
                      color="var(--green)"
                      startYear={completionYears[0]}
                      endYear={completionYears[completionYears.length - 1]}
                      formatValue={(v) => `${(v * 100).toFixed(0)}%`}
                    />
                  </div>
                  <div className="fig-foot">
                    <span>Median completion rate in-city.</span>
                    <span className="meta-mono">IPEDS GR</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section id="institutions" className="section">
        <div className="wrap">
          <header className="sec-head">
            <div>
              <div className="kicker">INSTITUTIONS</div>
              <h2>All {fmtNumber(city.institution_count)} in {city.name}</h2>
            </div>
            <p className="sec-sub">
              Click any column header to sort. Click any row for the full
              institution page. Heat-shading runs against the displayed values.
            </p>
          </header>
          <Suspense fallback={null}>
            <InstitutionRankTable rows={city.institutions} state={state} />
          </Suspense>
        </div>
      </section>

      </main>
      <SiteFooter vintageLabel={city.source.vintage} />
    </>
  );
}

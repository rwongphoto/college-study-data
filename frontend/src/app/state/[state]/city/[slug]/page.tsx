import { notFound } from "next/navigation";

import Crumbs from "@/components/Crumbs";
import DataTile from "@/components/DataTile";
import InstitutionRankTable from "@/components/InstitutionRankTable";
import TrendLine from "@/components/TrendLine";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  listCities,
  listStates,
  loadCity,
  loadState,
} from "@/lib/data";
import {
  fmtCurrency,
  fmtNumber,
  fmtPercent,
  historyValues,
} from "@/lib/format";
import { stateAbbr, stateSlug } from "@/lib/state";

export const revalidate = 86400;

export function generateStaticParams() {
  const out: Array<{ state: string; slug: string }> = [];
  for (const abbr of listStates()) {
    for (const slug of listCities(abbr)) {
      out.push({ state: stateSlug(abbr), slug });
    }
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; slug: string }>;
}) {
  const { state, slug } = await params;
  const abbr = stateAbbr(state);
  try {
    const c = loadCity(abbr, slug);
    return {
      title: `${c.name} Colleges | College Analyst`,
      description: `Federal-data view of ${c.institution_count} colleges in ${c.name}, ${abbr.toUpperCase()}.`,
    };
  } catch {
    return { title: "City Colleges | College Analyst" };
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
    city = loadCity(abbr, slug);
    stateAgg = loadState(abbr);
  } catch {
    notFound();
  }

  const isThin = city.institution_count <= 1;

  const enrollSpark = historyValues(city.enrollment_history_city);
  const completionSpark = historyValues(city.completion_history_city);

  return (
    <>
      <SiteHeader active="state" />
      <Crumbs
        items={[
          { label: "Home", href: "/" },
          { label: stateAgg.name, href: `/state/${state}/` },
          { label: city.name },
        ]}
      />

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
        <section className="section">
          <div className="wrap">
            <div
              className="data-tiles"
              style={{ gridTemplateColumns: "repeat(2, 1fr)" }}
            >
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
                sparkColor="#6FCF97"
              />
            </div>
          </div>
        </section>
      )}

      {(enrollSpark.length >= 2 || completionSpark.length >= 2) && (
        <section className="section section-tint">
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
                    <TrendLine values={enrollSpark} color="#60A5FA" />
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
                    <TrendLine values={completionSpark} color="#6FCF97" />
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

      <section className="section">
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
          <InstitutionRankTable rows={city.institutions} state={state} />
        </div>
      </section>

      <SiteFooter vintageLabel={city.source.vintage} />
    </>
  );
}

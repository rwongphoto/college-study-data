import type { Metadata } from "next";
import Link from "next/link";

import Crumbs from "@/components/Crumbs";
import { InfoTip } from "@/components/site/InfoTip";
import { JumpStrip } from "@/components/site/JumpStrip";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { loadHome, loadRankings } from "@/lib/data";
import { buildRankingJumpItems } from "@/lib/rankingJump";
import { buildRankingsJsonLd } from "@/lib/rankingJsonLd";
import { LANE_METHODOLOGY, LANE_OVERRIDES } from "@/lib/rankingLanes";
import { pageMeta, SITE_URL } from "@/lib/seo";
import { stateSlug } from "@/lib/state";
import type { RankingTable } from "@/lib/types";

const CITY_TABLE_CAPTIONS: Record<string, string> = {
  "earnings_10yr:most":
    "Cities whose Title-IV institutions report the highest median 10-year-after-entry earnings — Treasury cohorts, all federally aided enrollees.",
  "earnings_10yr:least":
    "Cities whose Title-IV institutions report the lowest median 10-year-after-entry earnings.",
  "completion_150:most":
    "Cities with the highest median 150%-time completion rate across in-city Title-IV institutions.",
  "completion_150:least":
    "Cities with the lowest median 150%-time completion rate across in-city Title-IV institutions.",
};

export const metadata: Metadata = pageMeta({
  title: "Best Cities for College Outcomes — National Rankings | College Outcome Analyst",
  description:
    "Cities ranked by median college outcomes — 10-year-after-entry earnings, 150%-time completion — across all Title-IV institutions located in each city.",
  path: "/rankings/cities",
});

export default async function RankingsCitiesPage() {
  const data = loadRankings();
  const home = loadHome();
  const tables = data.cities.tables;

  const pageUrl = `${SITE_URL}/rankings/cities`;
  const jsonLd = buildRankingsJsonLd({
    pageUrl,
    pageTitle: "Best & Worst Cities for College Outcomes — National Rankings",
    pageDescription:
      "Cities ranked by median college outcomes — 10-year-after-entry earnings, 150%-time completion — across all Title-IV institutions located in each city.",
    surfaceLabel: "Cities Rankings",
    tables,
    rowUrl: (r) => `${SITE_URL}/state/${stateSlug(r.state)}/city/${r.slug}`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader active="rankings-cities" />
      <Crumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Rankings" },
          { label: "Cities" },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">National rankings · {data.reporting_year}</div>
          <h1
            className="h-display"
            style={{ fontSize: "clamp(32px,4vw,52px)", margin: "8px 0 16px" }}
          >
            Best &amp; Worst Cities for College Outcomes
          </h1>
          <p className="lede" style={{ maxWidth: "62ch" }}>
            City rollups of every Title-IV institution that sits inside the
            place polygon. Each city&apos;s value is the median across its
            in-city institutions, weighted equally per institution. College-town
            single-institution cities effectively read out that institution&apos;s
            value — those rows are kept intentionally so they stay visible in
            the ranking.{" "}
            {data.states_covered.length === 1 ? (
              <>
                Only <strong>{data.states_covered[0].toUpperCase()}</strong> is
                ingested today; rankings expand to the rest of the country as
                additional states land.
              </>
            ) : (
              <>
                Spans <strong>{data.states_covered.length}</strong> ingested
                states ({data.counts.cities} cities total).
              </>
            )}
          </p>
        </div>
      </section>

      <JumpStrip items={buildRankingJumpItems(tables)} />

      {tables.map((t) => (
        <RankingTableSection key={`${t.lane}-${t.direction}`} table={t} />
      ))}

      <SiteFooter vintageLabel={home.source.vintage} />
    </>
  );
}

function RankingTableSection({ table }: { table: RankingTable }) {
  const isMost = table.direction === "most";
  const override = LANE_OVERRIDES[table.lane];
  const displayLabel = override?.label ?? table.label;
  const tooltip = override?.tooltip;
  const methodologyHref = LANE_METHODOLOGY[table.lane] ?? "/methodology";
  return (
    <section
      className={`section ${isMost ? "" : "section-tint"}`}
      id={`${table.lane}-${table.direction}`}
    >
      <div className="wrap">
        <div style={{ marginBottom: 24 }}>
          <div className="eyebrow">
            {isMost ? "Top 10 highest" : "Top 10 lowest"}
          </div>
          <h2
            className="h-display"
            style={{ fontSize: "clamp(24px,2.6vw,34px)", margin: "8px 0 0" }}
          >
            {displayLabel} <span className="muted">({table.units})</span>
            {tooltip ? (
              <InfoTip
                heading={tooltip.heading}
                body={tooltip.body}
                ariaLabel={`About ${displayLabel}`}
              />
            ) : null}
          </h2>
          {(() => {
            const caption =
              CITY_TABLE_CAPTIONS[`${table.lane}:${table.direction}`];
            return caption ? (
              <p
                className="muted"
                style={{ fontSize: 14, marginTop: 10, maxWidth: "62ch" }}
              >
                {caption}
              </p>
            ) : null;
          })()}
          <p className="muted" style={{ margin: "8px 0 0", fontSize: 13 }}>
            <Link href={methodologyHref}>Methodology &rarr;</Link>
          </p>
        </div>
        <table className="tbl">
          <caption className="sr-only">
            Cities ranked by {displayLabel.toLowerCase()} ({table.units}),{" "}
            {isMost ? "highest first" : "lowest first"}.
          </caption>
          <thead>
            <tr>
              <th scope="col" style={{ width: 60 }}>
                #
              </th>
              <th scope="col">City</th>
              <th scope="col">State</th>
              <th scope="col" className="right">
                Institutions
              </th>
              <th scope="col" className="right">
                {displayLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r) => (
              <tr key={`${r.state}/${r.slug}`}>
                <td className="num-mono">{r.rank}</td>
                <td className="name">
                  <Link
                    href={`/state/${stateSlug(r.state)}/city/${r.slug}/`}
                  >
                    {r.name}
                  </Link>
                </td>
                <td>{r.state_label}</td>
                <td className="right num-mono">
                  {r.institution_count != null
                    ? r.institution_count.toLocaleString()
                    : "—"}
                </td>
                <td className="right num-mono">{r.value_label}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

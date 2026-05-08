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

const INSTITUTION_TABLE_CAPTIONS: Record<string, string> = {
  "earnings_10yr:most":
    "Institutions reporting the highest median earnings 10 years after entry — Treasury cohorts, includes non-completers and out-of-state movers.",
  "earnings_10yr:least":
    "Institutions reporting the lowest median earnings 10 years after entry. Selection effects (who enrolls, who completes, what fields they enter) drive most of the variation.",
  "earnings_6yr:most":
    "Institutions reporting the highest median earnings 6 years after entry — earlier in the trajectory than the 10-year cut.",
  "earnings_6yr:least":
    "Institutions reporting the lowest median earnings 6 years after entry.",
  "completion_150:most":
    "Institutions with the highest 150%-time completion rate.",
  "completion_150:least":
    "Institutions with the lowest 150%-time completion rate.",
  "median_debt:most":
    "Institutions whose completers carry the highest median federal student-loan debt at graduation.",
  "median_debt:least":
    "Institutions whose completers carry the lowest median federal student-loan debt at graduation.",
  "default_rate:most":
    "Institutions with the highest 3-year cohort default rate among federal-loan borrowers.",
  "default_rate:least":
    "Institutions with the lowest 3-year cohort default rate among federal-loan borrowers.",
  "admission_rate:most":
    "Institutions admitting the largest share of applicants. Higher admission rate ≠ lower quality — it reflects applicant volume relative to bed count.",
  "admission_rate:least":
    "Institutions admitting the smallest share of applicants. Selectivity reflects applicant volume relative to bed count, not instructional outcomes.",
  "pell_share:most":
    "Institutions enrolling the largest share of Pell-recipient undergraduates — a proxy for the institution's role in serving lower-income students.",
  "pell_share:least":
    "Institutions enrolling the smallest share of Pell-recipient undergraduates.",
};

export const metadata: Metadata = pageMeta({
  title: "College Rankings — Earnings, Completion, Debt | College Outcome Analyst",
  description:
    "Title-IV institutions ranked by federal outcome data — earnings 10y after entry, 150%-time completion, median debt, default rate, admission rate, and Pell share.",
  path: "/rankings/institutions",
});

export default async function RankingsInstitutionsPage() {
  const data = loadRankings();
  const home = loadHome();
  const tables = data.institutions.tables;

  const pageUrl = `${SITE_URL}/rankings/institutions`;
  const jsonLd = buildRankingsJsonLd({
    pageUrl,
    pageTitle: "College Rankings — Earnings, Completion, Debt",
    pageDescription:
      "Title-IV institutions ranked by federal outcome data — earnings 10y after entry, 150%-time completion, median debt, default rate, admission rate, and Pell share.",
    surfaceLabel: "Institutions Rankings",
    tables,
    rowUrl: (r) =>
      `${SITE_URL}/state/${stateSlug(r.state)}/institution/${r.slug}`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader active="rankings-institutions" />
      <Crumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Rankings" },
          { label: "Institutions" },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">National rankings · {data.reporting_year}</div>
          <h1
            className="h-display"
            style={{ fontSize: "clamp(32px,4vw,52px)", margin: "8px 0 16px" }}
          >
            College Rankings — Outcomes, Not Reputation
          </h1>
          <p className="lede" style={{ maxWidth: "62ch" }}>
            Title-IV main campuses ranked by federal-data outcomes —
            College Scorecard for Treasury earnings + IPEDS completion + Pell
            share, Federal Student Aid for default rate, IPEDS Admissions for
            selectivity. Each table reads one cohort metric in one direction;
            we don&apos;t aggregate metrics into a composite score because the
            tradeoffs are real and reader-specific. Earnings cuts are
            descriptive, not predictive — selection effects drive most of the
            cross-institution variation. Every table is filtered to
            institutions with <strong>1,000+ undergrads</strong> — small
            specialty institutes (cosmetology, single-credential schools)
            arithmetically dominate the extremes on every metric and crowd
            out the editorially comparable schools.{" "}
            {data.states_covered.length === 1 ? (
              <>
                Only <strong>{data.states_covered[0].toUpperCase()}</strong> is
                ingested today; the ranking expands as additional states land.
              </>
            ) : (
              <>
                Spans <strong>{data.states_covered.length}</strong> ingested
                states ({data.counts.institutions.toLocaleString()} institutions
                total).
              </>
            )}
          </p>
        </div>
      </section>

      <JumpStrip items={buildRankingJumpItems(tables)} />

      {tables.map((t) => (
        <InstitutionRankingSection
          key={`${t.lane}-${t.direction}`}
          table={t}
        />
      ))}

      <SiteFooter vintageLabel={home.source.vintage} />
    </>
  );
}

function InstitutionRankingSection({ table }: { table: RankingTable }) {
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
          {INSTITUTION_TABLE_CAPTIONS[`${table.lane}:${table.direction}`] ? (
            <p
              className="muted"
              style={{ fontSize: 14, marginTop: 10, maxWidth: "62ch" }}
            >
              {INSTITUTION_TABLE_CAPTIONS[`${table.lane}:${table.direction}`]}
            </p>
          ) : null}
          <p className="muted" style={{ margin: "8px 0 0", fontSize: 13 }}>
            <Link href={methodologyHref}>Methodology &rarr;</Link>
          </p>
        </div>
        <table className="tbl">
          <caption className="sr-only">
            Institutions ranked by {displayLabel.toLowerCase()} ({table.units}),{" "}
            {isMost ? "highest first" : "lowest first"}.
          </caption>
          <thead>
            <tr>
              <th scope="col" style={{ width: 60 }}>
                #
              </th>
              <th scope="col">Institution</th>
              <th scope="col">City</th>
              <th scope="col">State</th>
              <th scope="col">Sector</th>
              <th scope="col" className="right">
                Undergrads
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
                    href={`/state/${stateSlug(r.state)}/institution/${r.slug}/`}
                  >
                    {r.name}
                  </Link>
                </td>
                <td>{r.city ?? "—"}</td>
                <td>{r.state_label}</td>
                <td>{formatControl(r.control)}</td>
                <td className="right num-mono">
                  {r.enrollment_undergrad != null && r.enrollment_undergrad > 0
                    ? r.enrollment_undergrad.toLocaleString()
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

function formatControl(control: string | null | undefined): string {
  if (!control) return "—";
  if (control === "public") return "Public";
  if (control === "private_nonprofit") return "Nonprofit";
  if (control === "private_forprofit") return "For-profit";
  return control;
}

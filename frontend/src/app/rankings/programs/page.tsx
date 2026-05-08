import type { Metadata } from "next";

import Crumbs from "@/components/Crumbs";
import { ProgramRankingTable } from "@/components/site/ProgramRankingTable";
import { JumpStrip } from "@/components/site/JumpStrip";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { loadHome, loadRankings } from "@/lib/data";
import { buildRankingJumpItems } from "@/lib/rankingJump";
import { buildRankingsJsonLd } from "@/lib/rankingJsonLd";
import { pageMeta, SITE_URL } from "@/lib/seo";
import { stateSlug } from "@/lib/state";

const PROGRAM_TABLE_CAPTIONS: Record<string, string> = {
  "earnings_5yr:most":
    "Programs whose completers reported the highest median earnings 5 years after finishing — Treasury IRS records via College Scorecard Field of Study. Cohort selectivity, geography, and graduate-school rates drive most of the variation.",
  "earnings_5yr:least":
    "Programs reporting the lowest median earnings 5 years after completion. Many appear here because graduates pursued additional schooling rather than entering the labor market.",
  "median_debt:most":
    "Programs whose completers carry the highest median federal student-loan debt. Concentrated in graduate and professional credentials.",
  "median_debt:least":
    "Programs whose completers carry the lowest median federal student-loan debt — often programs with strong aid, lower published prices, or low federal-loan utilization.",
  "completers:most":
    "Programs with the largest 4-year cumulative completer cohorts. Bigger cohorts produce more reliable downstream-earnings signals.",
};

export const metadata: Metadata = pageMeta({
  title: "Program Rankings — Earnings, Debt, Completers | College Outcome Analyst",
  description:
    "Field-of-Study programs ranked by federal-data outcomes — Treasury earnings 5y after completion, median federal-loan debt, and 4-year completer cohorts.",
  path: "/rankings/programs",
});

export default async function RankingsProgramsPage() {
  const data = loadRankings();
  const home = loadHome();
  const tables = data.programs.tables;

  const pageUrl = `${SITE_URL}/rankings/programs`;
  const jsonLd = buildRankingsJsonLd({
    pageUrl,
    pageTitle: "Program Rankings — Earnings, Debt, Completers",
    pageDescription:
      "Field-of-Study programs ranked by federal-data outcomes — Treasury earnings 5y after completion, median federal-loan debt, and 4-year completer cohorts.",
    surfaceLabel: "Program Rankings",
    tables,
    rowUrl: (r) =>
      `${SITE_URL}/state/${stateSlug(r.state)}/institution/${r.institution_slug ?? ""}`,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader active="rankings-programs" />
      <Crumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Rankings" },
          { label: "Programs" },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">National rankings · {data.reporting_year}</div>
          <h1
            className="h-display"
            style={{ fontSize: "clamp(32px,4vw,52px)", margin: "8px 0 16px" }}
          >
            Program Rankings — Field of Study × Institution
          </h1>
          <p className="lede" style={{ maxWidth: "62ch" }}>
            Each row is one program at one school — College Scorecard Field of
            Study earnings (Treasury IRS records, 5 years after completion),
            median federal-loan debt at graduation, and the 4-year cumulative
            completer cohort. Programs are mixed across credential levels and
            fields here; for a per-credential or per-field cut, see{" "}
            <a href="/rankings/credentials/">Credentials</a> and{" "}
            <a href="/rankings/fields/">Fields</a>. Tables exclude programs at
            institutions with fewer than <strong>1,000 undergrads</strong> to
            avoid small-cohort distortion.{" "}
            {data.states_covered.length === 1 ? (
              <>
                Only <strong>{data.states_covered[0].toUpperCase()}</strong> is
                ingested today.
              </>
            ) : (
              <>
                Spans <strong>{data.states_covered.length}</strong> ingested
                states ({data.counts.programs.toLocaleString()} programs total).
              </>
            )}
          </p>
        </div>
      </section>

      <JumpStrip items={buildRankingJumpItems(tables)} />

      {tables.map((t, i) => (
        <ProgramRankingTable
          key={`${t.lane}-${t.direction}`}
          table={t}
          captions={PROGRAM_TABLE_CAPTIONS}
          tint={i % 2 === 1}
        />
      ))}

      <SiteFooter vintageLabel={home.source.vintage} />
    </>
  );
}

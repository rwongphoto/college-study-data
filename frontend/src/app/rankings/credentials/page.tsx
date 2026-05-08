import type { Metadata } from "next";

import Crumbs from "@/components/Crumbs";
import { JumpStrip } from "@/components/site/JumpStrip";
import { ProgramRankingTable } from "@/components/site/ProgramRankingTable";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { loadHome, loadRankings } from "@/lib/data";
import { buildRankingsJsonLd } from "@/lib/rankingJsonLd";
import { pageMeta, SITE_URL } from "@/lib/seo";
import { stateSlug } from "@/lib/state";

const CREDENTIAL_TABLE_CAPTIONS: Record<string, string> = {
  "earnings_5yr:most":
    "Highest median earnings 5y after completion, restricted to programs at this credential level.",
  "earnings_5yr:least":
    "Lowest median earnings 5y after completion at this credential level — often programs whose graduates pursued additional schooling.",
  "median_debt:least":
    "Lowest median federal student-loan debt at completion, at this credential level.",
  "completers:most":
    "Largest 4-year cumulative completer cohorts at this credential level.",
};

export const metadata: Metadata = pageMeta({
  title:
    "Rankings by Degree Level — Bachelor's, Master's, Doctorate | College Outcome Analyst",
  description:
    "Field-of-Study programs ranked within each credential level — Bachelor's, Master's, Doctorate, Associate's, Certificate — using federal Treasury earnings, debt, and completer data.",
  path: "/rankings/credentials",
});

function bucketSlug(label: string): string {
  return label
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default async function RankingsCredentialsPage() {
  const data = loadRankings();
  const home = loadHome();
  const buckets = data.by_credential?.buckets ?? [];

  // Flatten all tables across buckets so the JSON-LD ItemList block emits one
  // entry per ranking table — same shape as /rankings/programs uses.
  const allTables = buckets.flatMap((b) => b.tables);

  const pageUrl = `${SITE_URL}/rankings/credentials`;
  const jsonLd = buildRankingsJsonLd({
    pageUrl,
    pageTitle: "Rankings by Degree Level",
    pageDescription:
      "Field-of-Study programs ranked within each credential level using federal Treasury earnings, debt, and completer data.",
    surfaceLabel: "Credential Rankings",
    tables: allTables,
    rowUrl: (r) =>
      `${SITE_URL}/state/${stateSlug(r.state)}/institution/${r.institution_slug ?? ""}`,
  });

  const jumpItems = buckets.map((b) => ({
    id: bucketSlug(b.label),
    label: b.label,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader active="rankings-credentials" />
      <Crumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Rankings" },
          { label: "Credentials" },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">National rankings · {data.reporting_year}</div>
          <h1
            className="h-display"
            style={{ fontSize: "clamp(32px,4vw,52px)", margin: "8px 0 16px" }}
          >
            Rankings by Degree Level
          </h1>
          <p className="lede" style={{ maxWidth: "62ch" }}>
            The same Field-of-Study program pool, sliced by credential. Earnings
            distributions are very different across credential levels —
            comparing a Bachelor's program against a Master's program rewards
            credential, not curriculum. Each section ranks programs within its
            level. Tables exclude programs at institutions with fewer than{" "}
            <strong>1,000 undergrads</strong>.
          </p>
        </div>
      </section>

      <JumpStrip items={jumpItems} />

      {buckets.map((bucket, idx) => (
        <CredentialBucketSection
          key={bucket.code}
          label={bucket.label}
          slug={bucketSlug(bucket.label)}
          tables={bucket.tables}
          baseTint={idx % 2 === 1}
        />
      ))}

      <SiteFooter vintageLabel={home.source.vintage} />
    </>
  );
}

function CredentialBucketSection({
  label,
  slug,
  tables,
  baseTint,
}: {
  label: string;
  slug: string;
  tables: import("@/lib/types").RankingTable[];
  baseTint: boolean;
}) {
  return (
    <>
      <section
        className={`section ${baseTint ? "section-tint" : ""}`}
        id={slug}
        style={{ paddingBottom: 8 }}
      >
        <div className="wrap">
          <div className="eyebrow">Credential bucket</div>
          <h2
            className="h-display"
            style={{ fontSize: "clamp(28px,3vw,40px)", margin: "8px 0 0" }}
          >
            {label}
          </h2>
        </div>
      </section>
      {tables.map((t, i) => (
        <ProgramRankingTable
          key={`${slug}-${t.lane}-${t.direction}`}
          table={t}
          captions={CREDENTIAL_TABLE_CAPTIONS}
          tint={baseTint ? i % 2 === 0 : i % 2 === 1}
          id={`${slug}-${t.lane}-${t.direction}`}
          headingPrefix={`${label} · `}
          headingLevel={3}
        />
      ))}
    </>
  );
}

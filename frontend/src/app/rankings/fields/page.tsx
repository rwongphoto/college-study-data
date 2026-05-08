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

const FIELD_TABLE_CAPTIONS: Record<string, string> = {
  "earnings_5yr:most":
    "Highest median earnings 5y after completion among programs in this CIP-2 family.",
  "median_debt:least":
    "Lowest median federal student-loan debt at completion among programs in this CIP-2 family.",
};

export const metadata: Metadata = pageMeta({
  title:
    "Rankings by Field of Study — Engineering, Business, Health | College Outcome Analyst",
  description:
    "Programs ranked within each field of study (CIP-2 family) — Engineering, Business, Health, Computer Science, and more — using federal earnings and debt data.",
  path: "/rankings/fields",
});

function bucketSlug(code: string, label: string): string {
  return `cip-${code}-${label
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

export default async function RankingsFieldsPage() {
  const data = loadRankings();
  const home = loadHome();
  const buckets = data.by_field?.buckets ?? [];

  const allTables = buckets.flatMap((b) => b.tables);
  const pageUrl = `${SITE_URL}/rankings/fields`;
  const jsonLd = buildRankingsJsonLd({
    pageUrl,
    pageTitle: "Rankings by Field of Study",
    pageDescription:
      "Programs ranked within each CIP-2 family using federal Treasury earnings and debt data.",
    surfaceLabel: "Field of Study Rankings",
    tables: allTables,
    rowUrl: (r) =>
      `${SITE_URL}/state/${stateSlug(r.state)}/institution/${r.institution_slug ?? ""}`,
  });

  const jumpItems = buckets.map((b) => ({
    id: bucketSlug(b.code, b.label),
    label: b.label,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader active="rankings-fields" />
      <Crumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Rankings" },
          { label: "Fields" },
        ]}
      />

      <section className="section">
        <div className="wrap">
          <div className="eyebrow">National rankings · {data.reporting_year}</div>
          <h1
            className="h-display"
            style={{ fontSize: "clamp(32px,4vw,52px)", margin: "8px 0 16px" }}
          >
            Rankings by Field of Study
          </h1>
          <p className="lede" style={{ maxWidth: "62ch" }}>
            Programs sliced by NCES CIP-2 family — the broad academic field
            (Engineering, Business, Health, etc.). Each section ranks the
            highest-earning and lowest-debt programs within its family across
            credential levels. Sections are ordered by national completer
            volume; only the top {buckets.length} families render here. Tables
            exclude programs at institutions with fewer than{" "}
            <strong>1,000 undergrads</strong>.
          </p>
        </div>
      </section>

      <JumpStrip items={jumpItems} />

      {buckets.map((bucket, idx) => (
        <FieldBucketSection
          key={bucket.code}
          code={bucket.code}
          label={bucket.label}
          slug={bucketSlug(bucket.code, bucket.label)}
          tables={bucket.tables}
          baseTint={idx % 2 === 1}
        />
      ))}

      <SiteFooter vintageLabel={home.source.vintage} />
    </>
  );
}

function FieldBucketSection({
  code,
  label,
  slug,
  tables,
  baseTint,
}: {
  code: string;
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
          <div className="eyebrow">Field · CIP-{code}</div>
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
          captions={FIELD_TABLE_CAPTIONS}
          tint={baseTint ? i % 2 === 0 : i % 2 === 1}
          id={`${slug}-${t.lane}-${t.direction}`}
          headingPrefix={`${label} · `}
          headingLevel={3}
        />
      ))}
    </>
  );
}

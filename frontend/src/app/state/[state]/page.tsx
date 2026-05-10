import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import Crumbs from "@/components/Crumbs";
import DataTile from "@/components/DataTile";
import FlagCards from "@/components/FlagCards";
import InstitutionRankTable from "@/components/InstitutionRankTable";
import LongArcCards from "@/components/LongArcCards";
import TrendLine from "@/components/TrendLine";
import { JumpStrip } from "@/components/site/JumpStrip";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { listStates, loadHome, loadState } from "@/lib/data";
import {
  fmtCurrency,
  fmtNumber,
  fmtPercent,
  historyValues,
  historyYears,
} from "@/lib/format";
import { pageMeta, SITE_URL } from "@/lib/seo";
import { stateAbbr, stateSlug } from "@/lib/state";
import { buildStateJsonLd } from "@/lib/stateJsonLd";

export const revalidate = 86400;

export function generateStaticParams() {
  return listStates().map((abbr) => ({ state: stateSlug(abbr) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  try {
    const s = loadState(stateAbbr(state));
    return pageMeta({
      title: `Are ${s.name} Colleges Worth It? | College Grad Analyst`,
      description: `Federal-data view of ${s.institution_count} ${s.name} institutions: median earnings, debt, and completion rates from College Scorecard.`,
      path: `/state/${state}/`,
    });
  } catch {
    return { title: "Are State Colleges Worth It? | College Grad Analyst" };
  }
}

export default async function StatePage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  let data;
  try {
    data = loadState(stateAbbr(state));
  } catch {
    notFound();
  }

  const home = loadHome();

  const programCount =
    home.states.find((s) => s.slug === stateAbbr(state))?.program_count ?? 0;
  const sectorPublic = data.institutions_by_control.public ?? 0;
  const sectorPriv = data.institutions_by_control.private_nonprofit ?? 0;
  const sectorFP = data.institutions_by_control.private_forprofit ?? 0;

  // History sparkline data (each is an array of values in chronological order).
  const enrollSpark = historyValues(data.enrollment_history_state);
  const enrollYears = historyYears(data.enrollment_history_state);
  const completionSpark = historyValues(data.completion_history_state);
  const completionYears = historyYears(data.completion_history_state);
  const tuitionSpark = historyValues(data.tuition_history_state);

  const histRange =
    data.source.history_vintages && data.source.history_vintages.length > 0
      ? `${data.source.history_vintages[0]}–${data.source.history_vintages[data.source.history_vintages.length - 1]}`
      : null;

  const pageUrl = `${SITE_URL}/state/${state}/`;
  const description = `Federal-data view of ${data.institution_count} ${data.name} institutions: median earnings, debt, and completion rates from College Scorecard.`;
  const jsonLd = buildStateJsonLd({
    pageUrl,
    stateName: data.name,
    institutionCount: data.institution_count,
    programCount,
    vintage: data.source.vintage,
    description,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SiteHeader active="state" />
      <Crumbs items={[{ label: "Home", href: "/" }, { label: data.name }]} />
      <JumpStrip
        items={[
          { id: "flags", label: "Signals", show: (data.flags?.length ?? 0) > 0 },
          { id: "numbers", label: "The Numbers" },
          { id: "shifts", label: "Shifts", show: (data.long_arc?.length ?? 0) > 0 },
          { id: "institutions", label: "Institutions" },
          { id: "top-earnings", label: "Top Earnings" },
          { id: "top-completion", label: "Top Completion" },
          { id: "cities", label: "Cities", show: data.cities.length > 0 },
          { id: "methodology", label: "Methodology" },
        ]}
      />
      <main>

      <section className="city-header">
        <div className="wrap">
          <div className="eyebrow">
            State hub · {data.name} · vintage {data.source.vintage}
          </div>
          <h1>{data.name} Colleges</h1>
          <p className="lede" style={{ marginTop: 18, maxWidth: "62ch" }}>
            Earnings, debt, completion, and default rates for every Title-IV
            institution in {data.name} — and every program where federal data
            is published. Sourced from College Scorecard, IPEDS, and Treasury
            tax records.
          </p>
          <div className="byline">
            <span className="meta-mono">
              {fmtNumber(data.institution_count)} INSTITUTIONS ·{" "}
              {fmtNumber(programCount)} PROGRAMS · 4/5/6/8/10Y EARNINGS HORIZONS
            </span>
            <span className="meta-mono">
              VINTAGE · {data.source.name.toUpperCase()} ·{" "}
              {data.source.vintage.toUpperCase()}
              {histRange ? ` · HISTORY ${histRange}` : ""}
            </span>
          </div>
        </div>
      </section>

      {(data.flags ?? []).length > 0 && (
        <section id="flags" className="section section-tint">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">ANOMALY ENGINE · NOTABLE SIGNALS</div>
                <h2>What the data flags across {data.name}</h2>
              </div>
              <p className="sec-sub">
                Top signals rolled up across {data.name} institutions — a
                mix of warnings and improvements, alternating so the page
                isn&apos;t skewed in either direction. Detectors: short-arc
                shift (recent 3-year window), earnings trend, peer outlier,
                completion drop, enrollment cliff, and debt-to-earnings
                warning. Multi-decade shifts are reported separately in the
                Long Arc section.
              </p>
            </header>
            <FlagCards flags={data.flags ?? []} cap={6} />
          </div>
        </section>
      )}

      <section id="numbers" className="section">
        <div className="wrap">
          <header className="sec-head">
            <div>
              <div className="kicker">SECTION 01 · STATE OVERVIEW</div>
              <h2>The numbers</h2>
            </div>
            <p className="sec-sub">
              Statewide aggregates across {data.name} Title-IV institutions.
              Earnings are 10 years after entry, computed by Treasury tax
              records on federally aided students. Sparklines trace the
              federally available history.
            </p>
          </header>
          <div
            className="data-tiles"
            style={{ gridTemplateColumns: "repeat(3, 1fr)" }}
          >
            <DataTile
              label="Institutions"
              value={fmtNumber(data.institution_count)}
              note="Title-IV main campuses"
            />
            <DataTile
              label="Programs (CIP × credential)"
              value={fmtNumber(programCount)}
              note="with published outcomes"
            />
            <DataTile
              label="Median earnings · 10y"
              value={fmtCurrency(data.earnings_median_state)}
              note="across institutions"
            />
            <DataTile
              label="Completion · 150%"
              value={fmtPercent(data.completion_rate_state)}
              note="median across institutions"
              spark={completionSpark}
              sparkColor="var(--green)"
            />
            <DataTile
              label="Undergrad enrollment"
              value={fmtNumber(
                data.enrollment_history_state[
                  data.enrollment_history_state.length - 1
                ]?.value ?? null,
              )}
              note="latest historical vintage"
              spark={enrollSpark}
              sparkColor="var(--blue-2)"
            />
            <DataTile
              label="In-state tuition"
              value={fmtCurrency(
                data.tuition_history_state[
                  data.tuition_history_state.length - 1
                ]?.value ?? null,
              )}
              note="median across institutions"
              spark={tuitionSpark}
              sparkColor="var(--amber)"
            />
          </div>
        </div>
      </section>

      {(enrollSpark.length >= 2 || completionSpark.length >= 2) && (
        <section id="shifts" className="section section-tint">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">SECTION 02 · LONG ARC</div>
                <h2>How {data.name} has shifted</h2>
              </div>
              <p className="sec-sub">
                Federally available history. Sparkline coverage varies by
                metric — IPEDS publishes some series only after 2009 and others
                only before.
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
                      UNDERGRAD ENROLLMENT · {data.enrollment_history_state[0].year}–
                      {
                        data.enrollment_history_state[
                          data.enrollment_history_state.length - 1
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
                    <span>
                      Statewide undergraduate enrollment, all Title-IV
                      institutions.
                    </span>
                    <span className="meta-mono">IPEDS EF</span>
                  </div>
                </div>
              )}
              {completionSpark.length >= 2 && (
                <div className="figure-frame">
                  <div className="fig-head">
                    <span className="meta-mono">
                      COMPLETION · 150% · {data.completion_history_state[0].year}–
                      {
                        data.completion_history_state[
                          data.completion_history_state.length - 1
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
                    <span>
                      Median completion rate within 150% of expected time.
                    </span>
                    <span className="meta-mono">IPEDS GR</span>
                  </div>
                </div>
              )}
            </div>
            {data.long_arc.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <LongArcCards arcs={data.long_arc} scope="Statewide" />
              </div>
            )}
          </div>
        </section>
      )}

      {(() => {
        const TABLE_MIN_UNDERGRAD = 1000;
        const tableRows = data.institutions.filter(
          (r) => (r.enrollment_undergrad ?? 0) >= TABLE_MIN_UNDERGRAD,
        );
        return (
          <section id="institutions" className="section">
            <div className="wrap">
              <header className="sec-head">
                <div>
                  <div className="kicker">SECTION 03 · INSTITUTIONS</div>
                  <h2>
                    {fmtNumber(tableRows.length)} institutions with{" "}
                    {fmtNumber(TABLE_MIN_UNDERGRAD)}+ undergrads, ranked by
                    10-year earnings
                  </h2>
                </div>
                <p className="sec-sub">
                  Click any column header to sort. Click any row for the full
                  institution page. Heat-shading runs against the displayed
                  values; em-dash means the cell was suppressed by federal
                  privacy rules. Institutions with fewer than{" "}
                  {fmtNumber(TABLE_MIN_UNDERGRAD)} undergrads are filtered out
                  here — small specialty schools (cosmetology, barbering,
                  single-credential institutes) arithmetically dominate the
                  extremes on every metric and aren&apos;t comparable to larger
                  schools.
                </p>
              </header>
              <Suspense fallback={null}>
                <InstitutionRankTable rows={tableRows} state={state} />
              </Suspense>
              <div className="rt-foot">
                <span>
                  Showing {fmtNumber(tableRows.length)} of{" "}
                  {fmtNumber(data.institution_count)} Title-IV institutions ·{" "}
                  Public {sectorPublic} · Private {sectorPriv} · For-profit{" "}
                  {sectorFP}
                </span>
              </div>
            </div>
          </section>
        );
      })()}

      {data.top_by_earnings.length > 0 && (
        <section id="top-earnings" className="section section-tint">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">SECTION 04 · TOP BY EARNINGS</div>
                <h2>Highest 10-year median earnings</h2>
              </div>
              <p className="sec-sub">
                Treasury earnings, 10 years after entry. Includes
                non-completers and out-of-state movers in the cohort.
              </p>
            </header>
            <div className="prog-grid">
              {data.top_by_earnings.slice(0, 6).map((r) => (
                <Link
                  key={r.unitid}
                  className="prog-card"
                  href={`/state/${state}/institution/${r.slug}/`}
                >
                  <div className="prog-head">
                    <span className="meta-mono">{r.city.toUpperCase()}</span>
                    <span className="prog-num">
                      {r.earnings_median_10yr != null
                        ? `$${(r.earnings_median_10yr / 1000).toFixed(1)}k`
                        : "—"}
                    </span>
                  </div>
                  <h3>{r.name}</h3>
                  <div className="prog-meta">
                    <span>
                      {r.enrollment_undergrad != null
                        ? `${fmtNumber(r.enrollment_undergrad)} undergrads`
                        : "—"}
                      {r.completion_rate_150 != null && (
                        <>
                          {" · "}
                          <strong>
                            {(r.completion_rate_150 * 100).toFixed(0)}%
                          </strong>{" "}
                          completion
                        </>
                      )}
                    </span>
                  </div>
                  {r.earnings_median_10yr != null && (
                    <div className="prog-bar">
                      <i
                        style={{
                          width: `${Math.min(
                            (r.earnings_median_10yr / 100000) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {(() => {
        const COMPLETION_MIN_UNDERGRAD = 1000;
        const eligible = data.top_by_completion.filter(
          (r) =>
            r.enrollment_undergrad != null &&
            r.enrollment_undergrad > COMPLETION_MIN_UNDERGRAD,
        );
        if (eligible.length === 0) return null;
        return (
        <section id="top-completion" className="section">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">SECTION 05 · TOP BY COMPLETION</div>
                <h2>Highest 150%-time completion</h2>
              </div>
              <p className="sec-sub">
                Share of first-time, full-time freshmen who complete within
                150% of expected time (IPEDS GR). Filtered to institutions with
                more than {fmtNumber(COMPLETION_MIN_UNDERGRAD)} undergrads —
                tiny cohorts skew toward 100% and aren&apos;t comparable to
                larger schools.
              </p>
            </header>
            <div className="prog-grid">
              {eligible.slice(0, 6).map((r) => (
                <Link
                  key={r.unitid}
                  className="prog-card"
                  href={`/state/${state}/institution/${r.slug}/`}
                >
                  <div className="prog-head">
                    <span className="meta-mono">{r.city.toUpperCase()}</span>
                    <span className="prog-num" style={{ color: "var(--green)" }}>
                      {r.completion_rate_150 != null
                        ? `${(r.completion_rate_150 * 100).toFixed(0)}%`
                        : "—"}
                    </span>
                  </div>
                  <h3>{r.name}</h3>
                  <div className="prog-meta">
                    <span>
                      {r.earnings_median_10yr != null
                        ? `$${(r.earnings_median_10yr / 1000).toFixed(1)}k earnings · 10y`
                        : "earnings —"}
                      {r.enrollment_undergrad != null && (
                        <>
                          {" · "}
                          <strong>{fmtNumber(r.enrollment_undergrad)}</strong>{" "}
                          undergrads
                        </>
                      )}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        );
      })()}

      {data.cities.length > 0 && (
        <section id="cities" className="section">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">BY CITY</div>
                <h2>
                  All {fmtNumber(data.cities.length)} {data.name}{" "}
                  {data.cities.length === 1 ? "city" : "cities"} with colleges
                </h2>
              </div>
              <p className="sec-sub">
                Each city has its own hub with the colleges located there.
                Alphabetical.
              </p>
            </header>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "6px 18px",
              }}
            >
              {[...data.cities]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/state/${state}/city/${c.slug}/`}
                      style={{
                        fontSize: 14,
                        color: "var(--fg-2)",
                        display: "block",
                        padding: "4px 0",
                        textDecoration: "none",
                      }}
                    >
                      {c.name}
                      <span
                        className="meta-mono"
                        style={{ color: "var(--fg-4)", marginLeft: 6 }}
                      >
                        · {c.institution_count}{" "}
                        {c.institution_count === 1 ? "college" : "colleges"}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </section>
      )}

      <section id="methodology" className="section section-tint">
        <div className="wrap">
          <div className="method-promo">
            <div>
              <div className="kicker">METHODOLOGY</div>
              <h3>What these numbers are — and aren&apos;t</h3>
              <p>
                Earnings are <strong>median tax-record earnings</strong> for
                federally aided students, 4–10 years after first enrollment.
                They describe cohorts, not future outcomes — and they include
                non-completers and out-of-state movers. Selection bias is real:
                high-earning programs may attract higher-earning students. We
                surface descriptive numbers, not causal claims.
              </p>
            </div>
            <a href="/methodology" className="btn btn-primary">
              Read full methodology →
            </a>
          </div>
        </div>
      </section>

      </main>
      <SiteFooter vintageLabel={data.source.vintage} />
    </>
  );
}

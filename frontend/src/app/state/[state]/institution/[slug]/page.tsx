import Link from "next/link";
import { notFound } from "next/navigation";

import Crumbs from "@/components/Crumbs";
import DataTile, { type DataTileDelta } from "@/components/DataTile";
import DebtRatio from "@/components/DebtRatio";
import EarningsHorizon from "@/components/EarningsHorizon";
import FlagCards from "@/components/FlagCards";
import LongArcCards from "@/components/LongArcCards";
import RoiCalculator from "@/components/RoiCalculator";
import TrendLine from "@/components/TrendLine";
import { JumpStrip } from "@/components/site/JumpStrip";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  listInstitutions,
  listStates,
  loadInstitution,
  loadRoiConstants,
  loadState,
} from "@/lib/data";
import {
  cipFamilyLabel,
  debtToEarningsRatio,
  deltaTone,
  fmtControl,
  fmtCurrency,
  fmtNumber,
  fmtPercent,
  fmtPredDegree,
  historyDelta,
  historyValues,
} from "@/lib/format";
import { stateAbbr, stateSlug } from "@/lib/state";
import type {
  EarningsProgressionPoint,
  HistoryPoint,
} from "@/lib/types";

export const revalidate = 86400;

export function generateStaticParams() {
  const out: Array<{ state: string; slug: string }> = [];
  for (const abbr of listStates()) {
    for (const slug of listInstitutions(abbr)) {
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
  try {
    const p = loadInstitution(stateAbbr(state), slug);
    const i = p.institution;
    const desc = i.earnings_median_10yr
      ? `Federal-data outcomes for ${i.name}: median earnings 10 yr post-entry ${fmtCurrency(i.earnings_median_10yr)}, completion ${fmtPercent(i.completion_rate_150)}, ${p.program_count} programs covered.`
      : `Federal-data outcomes for ${i.name} in ${i.city}, ${i.state.toUpperCase()}.`;
    return {
      title: `${i.name} · ${i.city}, ${i.state.toUpperCase()}`,
      description: desc,
    };
  } catch {
    return { title: "Institution" };
  }
}

export default async function InstitutionPage({
  params,
}: {
  params: Promise<{ state: string; slug: string }>;
}) {
  const { state, slug } = await params;
  const abbr = stateAbbr(state);
  let payload, stateAgg, roiConstants;
  try {
    payload = loadInstitution(abbr, slug);
    stateAgg = loadState(abbr);
    roiConstants = loadRoiConstants();
  } catch {
    notFound();
  }
  const i = payload.institution;

  const crumbs: Array<{ label: string; href?: string }> = [
    { label: "Home", href: "/" },
    { label: stateAgg.name, href: `/state/${state}/` },
    { label: i.city, href: `/state/${state}/city/${i.city_slug}/` },
    { label: i.name },
  ];

  // Earnings progression (4/5/6/8/10 yr after entry).
  const earningsProgression: EarningsProgressionPoint[] = [
    { year: 4, value: i.earnings_median_4yr },
    { year: 5, value: i.earnings_median_5yr },
    { year: 6, value: i.earnings_median_6yr },
    { year: 8, value: i.earnings_median_8yr },
    { year: 10, value: i.earnings_median_10yr },
  ];
  const hasEarningsCurve =
    earningsProgression.filter((p) => p.value != null).length >= 2;

  // History sparkline data per metric.
  const enrollSpark = historyValues(i.history.enrollment_undergrad);
  const completionSpark = historyValues(i.history.completion_rate_150);
  const debtSpark = historyValues(i.history.median_debt);
  const tuitionInSpark = historyValues(i.history.tuition_in_state);
  const retentionSpark = historyValues(i.history.retention_rate);
  const admitSpark = historyValues(i.history.admission_rate);

  // Trend deltas (first → last historical value, % change). Direction-aware
  // tone: rose enrollment/completion/retention is good (green); rose debt /
  // tuition is bad (red); admission rate is neutral (selection signal).
  const toDelta = (
    points: HistoryPoint[] | undefined,
    roseIsGood: boolean | "neutral",
  ): DataTileDelta | undefined => {
    const d = historyDelta(points);
    if (!d) return undefined;
    return { ...d, tone: deltaTone(d.pct, roseIsGood) };
  };
  const completionDelta = toDelta(i.history.completion_rate_150, true);
  const debtDelta = toDelta(i.history.median_debt, false);
  const enrollDelta = toDelta(i.history.enrollment_undergrad, true);
  const retentionDelta = toDelta(i.history.retention_rate, true);
  const admitDelta = toDelta(i.history.admission_rate, "neutral");
  const tuitionDelta = toDelta(i.history.tuition_in_state, false);

  // Earnings horizon delta — first non-null to last non-null point in the
  // 4/5/6/8/10y progression.
  const earningsValid = earningsProgression.filter(
    (p): p is { year: 4 | 5 | 6 | 8 | 10; value: number } => p.value != null,
  );
  const earnings10yDelta: DataTileDelta | undefined =
    earningsValid.length >= 2 && earningsValid[0].value > 0
      ? {
          pct:
            (earningsValid[earningsValid.length - 1].value -
              earningsValid[0].value) /
            earningsValid[0].value,
          fromYear: earningsValid[0].year,
          toYear: earningsValid[earningsValid.length - 1].year,
          tone: "up",
        }
      : undefined;
  // 6y tile shows the slope from the earliest available horizon to 6y.
  const earnings6yPoint = earningsProgression.find((p) => p.year === 6);
  const earningsBeforeSix = earningsValid.filter((p) => p.year < 6)[0];
  const earnings6yDelta: DataTileDelta | undefined =
    earnings6yPoint &&
    earnings6yPoint.value != null &&
    earningsBeforeSix &&
    earningsBeforeSix.value > 0
      ? {
          pct:
            (earnings6yPoint.value - earningsBeforeSix.value) /
            earningsBeforeSix.value,
          fromYear: earningsBeforeSix.year,
          toYear: 6,
          tone: "up",
        }
      : undefined;

  // Debt-to-earnings ratio (10y horizon) — federal Direct loan amortization.
  const dteRatio10y = debtToEarningsRatio(
    i.median_debt,
    i.earnings_median_10yr,
  );

  // Sort programs by earnings (5yr) desc.
  const programsRanked = [...payload.programs]
    .filter((p) => p.earnings_median_5yr != null)
    .sort(
      (a, b) =>
        (b.earnings_median_5yr ?? 0) - (a.earnings_median_5yr ?? 0),
    );
  const maxEarn = programsRanked.length
    ? programsRanked[0].earnings_median_5yr ?? 1
    : 1;

  const stateMedianEarn = stateAgg.earnings_median_state;
  const stateMedianComp = stateAgg.completion_rate_state;
  const tone = (
    v: number | null,
    median: number | null,
    higherIsBetter = true,
  ): "good" | "bad" | "neutral" => {
    if (v == null || median == null) return "neutral";
    return higherIsBetter
      ? v >= median
        ? "good"
        : "bad"
      : v <= median
        ? "good"
        : "bad";
  };
  const sparkColor = (t: string) =>
    t === "good" ? "#6FCF97" : t === "bad" ? "#C44545" : "#E6B450";

  const histRange =
    payload.source.history_vintages && payload.source.history_vintages.length > 0
      ? `${payload.source.history_vintages[0]}–${payload.source.history_vintages[payload.source.history_vintages.length - 1]}`
      : null;

  return (
    <>
      <SiteHeader active="state" />
      <Crumbs items={crumbs} />
      <JumpStrip
        items={[
          { id: "flags", label: "Signals", show: (i.flags?.length ?? 0) > 0 },
          { id: "numbers", label: "The Numbers" },
          { id: "earnings-horizon", label: "Earnings Horizon", show: hasEarningsCurve },
          { id: "debt", label: "Debt", show: dteRatio10y != null },
          {
            id: "long-arc",
            label: "Long Arc",
            show:
              enrollSpark.length >= 2 ||
              completionSpark.length >= 2 ||
              debtSpark.length >= 2,
          },
          { id: "programs", label: "Programs", show: programsRanked.length > 0 },
          {
            id: "roi",
            label: "ROI Calculator",
            show: !!(payload.roi && payload.roi.programs_available.length > 0),
          },
          { id: "similar", label: "Similar", show: payload.similar.length > 0 },
          { id: "methodology", label: "Methodology" },
        ]}
      />
      <main>

      <section className="city-header">
        <div className="wrap">
          <div className="eyebrow">
            {stateAgg.name} · {fmtControl(i.control)} · {fmtPredDegree(i.pred_degree)}
          </div>
          <h1>{i.name}</h1>
          <p className="lede" style={{ marginTop: 18, maxWidth: "62ch" }}>
            {i.city}, {stateAgg.name}.{" "}
            {i.enrollment_undergrad != null && (
              <>
                <strong style={{ color: "var(--fg)" }}>
                  {fmtNumber(i.enrollment_undergrad)}
                </strong>{" "}
                undergraduate students.{" "}
              </>
            )}
            {payload.program_count} programs in the federal Field-of-Study
            dataset.
          </p>
          <div className="byline">
            <span className="meta-mono">
              UNITID {i.unitid}
              {i.opeid6 ? ` · OPEID ${i.opeid6}` : ""} · IPEDS HD
            </span>
            <span className="meta-mono">
              VINTAGE · COLLEGE SCORECARD · {payload.source.vintage.toUpperCase()}
              {histRange ? ` · HISTORY ${histRange}` : ""}
            </span>
          </div>
        </div>
      </section>

      {(i.flags ?? []).length > 0 && (
        <section id="flags" className="section section-tint">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">ANOMALY ENGINE · NOTABLE SIGNALS</div>
                <h2>What the data flags at {i.name}</h2>
              </div>
              <p className="sec-sub">
                Short-arc shifts (recent 3-year window), peer outliers,
                earnings trend breaks, completion drops, enrollment cliffs,
                and debt-to-earnings warnings — surfaced deterministically
                from the federal record. Multi-decade shifts are reported
                separately in the Long Arc section, since 25-year tuition
                drift isn&apos;t really an anomaly.
              </p>
            </header>
            <FlagCards flags={i.flags ?? []} cap={6} />
          </div>
        </section>
      )}

      <section id="numbers" className="section">
        <div className="wrap">
          <header className="sec-head">
            <div>
              <div className="kicker">SECTION 01 · OUTCOMES SNAPSHOT</div>
              <h2>The numbers, vs. {stateAgg.name}</h2>
            </div>
            <p className="sec-sub">
              Each tile compares this institution to the {stateAgg.name} median
              for the same metric. Sub-line shows the comparison value, not an
              interpretation. Sparklines trace the federally available history.
            </p>
          </header>
          <div className="data-tiles">
            <DataTile
              label="Median earnings · 10y"
              value={fmtCurrency(i.earnings_median_10yr)}
              note={
                stateMedianEarn != null
                  ? `${stateAgg.name} median ${fmtCurrency(stateMedianEarn)}`
                  : "Treasury earnings · 10y post-entry"
              }
              delta={earnings10yDelta}
            />
            <DataTile
              label="Median earnings · 6y"
              value={fmtCurrency(i.earnings_median_6yr)}
              note="Treasury earnings · 6y post-entry"
              delta={earnings6yDelta}
            />
            <DataTile
              label="Completion · 150%"
              value={fmtPercent(i.completion_rate_150)}
              note={
                stateMedianComp != null
                  ? `${stateAgg.name} median ${fmtPercent(stateMedianComp)}`
                  : "Within 150% of expected time"
              }
              spark={completionSpark}
              sparkColor={sparkColor(
                tone(i.completion_rate_150, stateMedianComp, true),
              )}
              delta={completionDelta}
            />
            <DataTile
              label="Median federal debt"
              value={fmtCurrency(i.median_debt)}
              note="At program completion"
              spark={debtSpark}
              sparkColor={sparkColor(tone(i.median_debt, 25000, false))}
              delta={debtDelta}
            />
            <DataTile
              label="Undergrad enrollment"
              value={fmtNumber(i.enrollment_undergrad)}
              note="latest IPEDS"
              spark={enrollSpark}
              sparkColor="#60A5FA"
              delta={enrollDelta}
            />
            <DataTile
              label="Retention"
              value={fmtPercent(i.retention_rate)}
              note="first-time, full-time"
              spark={retentionSpark}
              sparkColor="#6FCF97"
              delta={retentionDelta}
            />
            <DataTile
              label="Admission rate"
              value={fmtPercent(i.admission_rate)}
              note="latest cohort"
              spark={admitSpark}
              sparkColor="#E6B450"
              delta={admitDelta}
            />
            <DataTile
              label="In-state tuition"
              value={fmtCurrency(i.tuition_in_state)}
              note={
                i.tuition_out_of_state != null
                  ? `out-of-state ${fmtCurrency(i.tuition_out_of_state)}`
                  : "annual"
              }
              spark={tuitionInSpark}
              sparkColor="#E6B450"
              delta={tuitionDelta}
            />
          </div>
        </div>
      </section>

      {hasEarningsCurve && (
        <section id="earnings-horizon" className="section section-tint">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">SECTION 02 · EARNINGS HORIZONS</div>
                <h2>How earnings spread, 4 to 10 years after entry</h2>
              </div>
              <p className="sec-sub">
                Treasury tax-record earnings for federally aided students who
                first enrolled at this institution. Each point is a horizon
                from the most-recent vintage. Single median per horizon (no
                p25/p75 publishing).
              </p>
            </header>
            <div className="figure-frame">
              <div className="fig-head">
                <span className="meta-mono">
                  ALL FEDERALLY AIDED STUDENTS · TAX-RECORD EARNINGS
                </span>
                <span className="meta-mono">
                  VINTAGE {payload.source.vintage.toUpperCase()}
                </span>
              </div>
              <div
                className="fig-canvas big"
                style={{ padding: "32px 32px 12px" }}
              >
                <EarningsHorizon points={earningsProgression} />
              </div>
              <div className="fig-foot">
                <span>
                  Earnings widen with time post-entry. Selection: federal-aid
                  recipients only — not all graduates.
                </span>
                <Link href="/methodology#earnings" className="link-mono">
                  Methodology →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {dteRatio10y != null && (
        <section id="debt" className="section">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">SECTION 03 · DEBT-TO-EARNINGS</div>
                <h2>What loans cost relative to earnings</h2>
              </div>
              <p className="sec-sub">
                Annual debt service as a share of median earnings 10 years
                after entry, computed under federal Direct loan terms (10-year
                fixed at 6%). The 8% line is the gainful-employment threshold
                from federal regulation; above 12% has historically been
                considered &ldquo;failing&rdquo; under prior rule cycles.
              </p>
            </header>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 540px)",
                gap: 14,
              }}
            >
              <DebtRatio
                ratio={dteRatio10y}
                threshold={0.08}
                label="Institution-wide"
                sub={`Median federal debt ${fmtCurrency(i.median_debt)} amortized over 10 years vs. median earnings ${fmtCurrency(i.earnings_median_10yr)} (10y after entry).`}
              />
            </div>
          </div>
        </section>
      )}

      {(enrollSpark.length >= 2 || completionSpark.length >= 2 ||
        debtSpark.length >= 2) && (
        <section id="long-arc" className="section section-tint">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">SECTION 04 · LONG ARC</div>
                <h2>Ten-plus year arc</h2>
              </div>
              <p className="sec-sub">
                Federally available history. Coverage varies by metric — IPEDS
                publishes some series only after 2009 and others only before.
              </p>
            </header>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${
                  [enrollSpark, completionSpark, debtSpark].filter(
                    (a) => a.length >= 2,
                  ).length
                }, 1fr)`,
                gap: 14,
              }}
            >
              {enrollSpark.length >= 2 && (
                <div className="figure-frame">
                  <div className="fig-head">
                    <span className="meta-mono">
                      UNDERGRAD · {i.history.enrollment_undergrad[0].year}–
                      {
                        i.history.enrollment_undergrad[
                          i.history.enrollment_undergrad.length - 1
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
                    <span>Undergraduate enrollment.</span>
                    <span className="meta-mono">IPEDS EF</span>
                  </div>
                </div>
              )}
              {completionSpark.length >= 2 && (
                <div className="figure-frame">
                  <div className="fig-head">
                    <span className="meta-mono">
                      COMPLETION 150% · {i.history.completion_rate_150[0].year}–
                      {
                        i.history.completion_rate_150[
                          i.history.completion_rate_150.length - 1
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
                    <span>150%-time completion rate.</span>
                    <span className="meta-mono">IPEDS GR</span>
                  </div>
                </div>
              )}
              {debtSpark.length >= 2 && (
                <div className="figure-frame">
                  <div className="fig-head">
                    <span className="meta-mono">
                      MEDIAN DEBT · {i.history.median_debt[0].year}–
                      {
                        i.history.median_debt[i.history.median_debt.length - 1]
                          .year
                      }
                    </span>
                    <span className="meta-mono">
                      {fmtCurrency(debtSpark[debtSpark.length - 1])}
                    </span>
                  </div>
                  <div className="fig-canvas">
                    <TrendLine values={debtSpark} color="#E6B450" />
                  </div>
                  <div className="fig-foot">
                    <span>Median federal student debt at exit.</span>
                    <span className="meta-mono">SCORECARD</span>
                  </div>
                </div>
              )}
            </div>
            {i.long_arc.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <LongArcCards arcs={i.long_arc} scope={i.name} />
              </div>
            )}
          </div>
        </section>
      )}

      {programsRanked.length > 0 && (
        <section id="programs" className="section">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">SECTION 05 · PROGRAMS</div>
                <h2>Ranked by 5-year earnings</h2>
              </div>
              <p className="sec-sub">
                Each row is one (CIP × credential) program reported by the
                institution in College Scorecard&apos;s Field-of-Study data.
                Cohort floor is 30 students; below this, federal data is
                suppressed.
              </p>
            </header>
            <div className="prog-rank">
              {programsRanked.slice(0, 24).map((p) => {
                const w =
                  ((p.earnings_median_5yr ?? 0) / Number(maxEarn)) * 100;
                return (
                  <Link
                    key={p.slug}
                    className="pr-row"
                    href={`/state/${state}/institution/${slug}/program/${p.slug}/`}
                  >
                    <span className="pr-name">{p.cip_desc}</span>
                    <span className="meta-mono pr-cip">
                      CIP {p.cip_code} · {p.credential_desc}
                    </span>
                    <span className="pr-bar">
                      <i style={{ width: `${w}%` }} />
                    </span>
                    <span className="pr-earn">
                      {fmtCurrency(p.earnings_median_5yr)}
                    </span>
                    <span className="meta-mono pr-n">
                      {p.completers != null ? `${fmtNumber(p.completers)} grads` : "—"}
                    </span>
                  </Link>
                );
              })}
            </div>
            {programsRanked.length > 24 && (
              <div className="rt-foot">
                <span>
                  Showing top 24 of {programsRanked.length} ranked programs.
                </span>
                <span className="meta-mono">
                  {fmtNumber(payload.program_count)} TOTAL PROGRAMS
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {(() => {
        const familyEntries = Object.entries(payload.programs_by_family)
          .map(
            ([cip2, rows]) =>
              [cip2, rows.filter((p) => p.earnings_median_5yr != null)] as const,
          )
          .filter(([, rows]) => rows.length > 0);
        const shownCount = familyEntries.reduce(
          (acc, [, rows]) => acc + rows.length,
          0,
        );
        return familyEntries.length > 0 && (
        <section id="by-family" className="section section-tint">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">SECTION 06 · BY CIP FAMILY</div>
                <h2>{fmtNumber(shownCount)} programs with earnings, grouped</h2>
              </div>
              <p className="sec-sub">
                Programs are grouped by 2-digit CIP family. Programs without
                reported earnings are hidden to keep the list focused.
              </p>
            </header>
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              {familyEntries.map(([cip2, rows]) => (
                <div key={cip2}>
                  <h3
                    className="meta-mono"
                    style={{
                      color: "var(--fg)",
                      letterSpacing: "0.10em",
                      fontWeight: 600,
                      fontSize: 12,
                      margin: "0 0 10px",
                    }}
                  >
                    {cipFamilyLabel(cip2).toUpperCase()} · CIP {cip2}
                  </h3>
                  <div className="prog-rank">
                    {rows.map((p) => (
                      <Link
                        key={p.slug}
                        className="pr-row"
                        href={`/state/${state}/institution/${slug}/program/${p.slug}/`}
                      >
                        <span className="pr-name">{p.cip_desc}</span>
                        <span className="meta-mono pr-cip">
                          {p.credential_desc}
                        </span>
                        <span className="pr-bar">
                          <i
                            style={{
                              width: `${
                                p.earnings_median_5yr != null
                                  ? ((p.earnings_median_5yr ?? 0) /
                                      Number(maxEarn)) *
                                    100
                                  : 0
                              }%`,
                            }}
                          />
                        </span>
                        <span className="pr-earn">
                          {fmtCurrency(p.earnings_median_5yr)}
                        </span>
                        <span className="meta-mono pr-n">
                          {p.completers != null ? `${fmtNumber(p.completers)} grads` : "—"}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        );
      })()}

      {payload.roi && payload.roi.programs_available.length > 0 && (
        <section id="roi" className="section">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">FINANCIAL OUTCOME · ILLUSTRATION</div>
                <h2>Estimate the financial outcome at {i.name}</h2>
              </div>
              <p className="sec-sub">
                Pick a program. Cost from Scorecard net price by family income;
                earnings from Treasury 5-year-post-completion median, projected
                forward with a Mincer age-earnings curve. The selection-bias
                toggle applies the Dale-Krueger shrinkage. Outcomes
                illustration, not a forecast — see{" "}
                <Link href="/methodology#roi">methodology</Link>.
              </p>
            </header>
            <RoiCalculator
              mode="institution"
              institutionRoi={payload.roi}
              constants={roiConstants}
              costByIncome={i.cost_by_income ?? null}
              fallbackCostPerYear={
                i.avg_net_price_pub ?? i.avg_net_price_priv ?? i.cost_attendance
              }
              stateLower={i.state}
              schoolName={i.name}
            />
          </div>
        </section>
      )}

      {payload.similar.length > 0 && (
        <section id="similar" className="section">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">SECTION 07 · SIMILAR INSTITUTIONS</div>
                <h2>Same sector and degree mix in {stateAgg.name}</h2>
              </div>
              <p className="sec-sub">
                Picked by Carnegie sector × predominant credential level.
                These are <em>not</em> rankings — just nearest-neighbour
                surfaces for comparison.
              </p>
            </header>
            <div className="prog-grid">
              {payload.similar.map((s) => (
                <Link
                  key={s.slug}
                  className="prog-card"
                  href={`/state/${state}/institution/${s.slug}/`}
                >
                  <div className="prog-head">
                    <span className="meta-mono">{s.city.toUpperCase()}</span>
                    <span className="prog-num">
                      {s.earnings_median_10yr != null
                        ? `$${(s.earnings_median_10yr / 1000).toFixed(1)}k`
                        : "—"}
                    </span>
                  </div>
                  <h3>{s.name}</h3>
                  <div className="prog-meta">
                    <span>
                      {fmtControl(s.control)} · {fmtPredDegree(s.pred_degree)}
                      {s.completion_rate_150 != null && (
                        <>
                          {" · "}
                          <strong>
                            {(s.completion_rate_150 * 100).toFixed(0)}%
                          </strong>{" "}
                          completion
                        </>
                      )}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section id="methodology" className="section section-tint">
        <div className="wrap">
          <div className="method-promo">
            <div>
              <div className="kicker">CAUSAL DISCIPLINE</div>
              <h3>
                &ldquo;{i.name} graduates earn $X&rdquo; — not &ldquo;{i.name}{" "}
                makes you earn $X&rdquo;
              </h3>
              <p>
                Median earnings describe what cohorts earned. They do not
                describe what attending {i.name} caused. Selection effects (who
                admits, who enrolls, who completes) are real. We publish
                federal data with strict descriptive phrasing — and link the
                methodology where you can read about the limitations directly.
              </p>
            </div>
            <Link href="/methodology" className="btn btn-primary">
              Methodology →
            </Link>
          </div>
        </div>
      </section>

      </main>
      <SiteFooter vintageLabel={payload.source.vintage} />
    </>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";

import Crumbs from "@/components/Crumbs";
import DataTile from "@/components/DataTile";
import DebtRatio from "@/components/DebtRatio";
import LongArcCards from "@/components/LongArcCards";
import RoiCalculator from "@/components/RoiCalculator";
import TrendLine from "@/components/TrendLine";
import { JumpStrip } from "@/components/site/JumpStrip";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import {
  loadInstitution,
  loadProgram,
  loadRoiConstants,
  loadState,
} from "@/lib/data";
import {
  debtToEarningsRatio,
  fmtCurrency,
  fmtNumber,
  historyValues,
  historyYears,
} from "@/lib/format";
import { displayName } from "@/lib/institutionCommonName";
import { buildProgramJsonLd } from "@/lib/programJsonLd";
import { pageMeta, SITE_URL } from "@/lib/seo";
import { stateAbbr } from "@/lib/state";

// On-demand ISR: pre-rendering all ~41k program pages OOMs the Vercel
// build container. Pages are generated on first request and cached for
// 24h. SEO is unaffected — program URLs aren't listed in sitemap.xml.
// 404 only when BOTH earnings windows are suppressed; the 5yr window is
// the primary anchor, and pages render fine when just one is present
// (e.g. Stanford EE PhD reports 5yr only).
export const revalidate = 86400;

export function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string; slug: string; program: string }>;
}) {
  const { state, slug, program } = await params;
  try {
    const p = await loadProgram(stateAbbr(state), slug, program);
    const cip = p.cip_desc.replace(/\.$/, "");
    const inst = displayName(p.institution_name.replace(/\.$/, ""), p.institution_unitid);
    return pageMeta({
      title: `Is ${cip} ${p.credential_desc} at ${inst} Worth It? | College Grad Analyst`,
      description: `Median earnings 5 yr post-completion ${fmtCurrency(p.earnings_median_5yr)}, median debt ${fmtCurrency(p.debt_median)} for ${cip} (${p.credential_desc}) at ${inst}.`,
      path: `/state/${state}/institution/${slug}/program/${program}/`,
    });
  } catch {
    return { title: "Program" };
  }
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ state: string; slug: string; program: string }>;
}) {
  const { state, slug, program } = await params;
  const abbr = stateAbbr(state);
  let p, stateAgg, instPayload, roiConstants;
  try {
    p = await loadProgram(abbr, slug, program);
    stateAgg = loadState(abbr);
    instPayload = await loadInstitution(abbr, slug);
    roiConstants = loadRoiConstants();
  } catch {
    notFound();
  }
  if (p.earnings_median_4yr == null && p.earnings_median_5yr == null) {
    notFound();
  }
  const i = instPayload.institution;
  const iDisplay = displayName(i.name, i.unitid);
  const instDisplay = displayName(p.institution_name, p.institution_unitid);

  const peers = p.peers_in_state.filter(
    (peer) => peer.earnings_median_5yr != null,
  );
  const allPeers = [
    {
      institution_slug: slug,
      institution_name: p.institution_name,
      earnings_median_5yr: p.earnings_median_5yr,
      debt_median: p.debt_median,
      completers: p.completers,
      pooled_earnings: p.pooled_earnings,
      focus: true as const,
    },
    ...peers.map((x) => ({ ...x, focus: false as const })),
  ].sort(
    (a, b) =>
      (b.earnings_median_5yr ?? 0) - (a.earnings_median_5yr ?? 0),
  );
  const maxEarn = allPeers.reduce(
    (m, x) => Math.max(m, x.earnings_median_5yr ?? 0),
    0,
  ) || 1;

  const peerEarns = peers
    .map((x) => x.earnings_median_5yr!)
    .sort((a, b) => a - b);
  const peerMedian =
    peerEarns.length > 0 ? peerEarns[Math.floor(peerEarns.length / 2)] : null;
  const peerNote =
    peerMedian != null
      ? `${stateAgg.name} CIP-4 median ${fmtCurrency(peerMedian)}`
      : `Statewide peers reporting · ${peers.length}`;

  const earn5Spark = historyValues(p.history.earnings_median_5yr);
  const earn5Years = historyYears(p.history.earnings_median_5yr);
  const earn4Spark = historyValues(p.history.earnings_median_4yr);
  const debtSpark = historyValues(p.history.debt_median);
  const debtYears = historyYears(p.history.debt_median);
  const completersSpark = historyValues(p.history.completers);
  const completersYears = historyYears(p.history.completers);

  const dteRatio = debtToEarningsRatio(p.debt_median, p.earnings_median_5yr);
  const dteRatioPeerMedian = debtToEarningsRatio(
    p.debt_median,
    peerMedian,
  );

  const histRange =
    p.source.history_vintages && p.source.history_vintages.length > 0
      ? `${p.source.history_vintages[0]}–${p.source.history_vintages[p.source.history_vintages.length - 1]}`
      : null;

  const pageUrl = `${SITE_URL}/state/${state}/institution/${slug}/program/${program}/`;
  const jsonLdDescription = `Median earnings 5 yr post-completion ${fmtCurrency(p.earnings_median_5yr)}, median debt ${fmtCurrency(p.debt_median)} for ${p.cip_desc.replace(/\.$/, "")} (${p.credential_desc}) at ${p.institution_name.replace(/\.$/, "")}.`;
  const jsonLd = buildProgramJsonLd({
    pageUrl,
    stateName: stateAgg.name,
    stateSlug: state,
    program: p,
    description: jsonLdDescription,
  });

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
          { label: iDisplay, href: `/state/${state}/institution/${slug}/` },
          { label: p.cip_desc },
        ]}
      />
      <JumpStrip
        items={[
          { id: "numbers", label: "The Numbers" },
          { id: "debt", label: "Debt", show: dteRatio != null },
          {
            id: "shifts",
            label: "Shifts",
            show:
              earn5Spark.length >= 2 ||
              debtSpark.length >= 2 ||
              completersSpark.length >= 2,
          },
          { id: "roi", label: "ROI Calculator", show: !!p.roi },
          { id: "peers", label: "Peers", show: peers.length > 0 },
          { id: "methodology", label: "Methodology" },
        ]}
      />
      <main>

      <section className="city-header">
        <div className="wrap">
          <div className="eyebrow">
            CIP {p.cip_code} · {p.credential_desc} · {instDisplay}
          </div>
          <h1>
            {p.cip_desc.replace(/\.$/, "")} at {instDisplay.replace(/\.$/, "")}
          </h1>
          <p className="lede" style={{ marginTop: 18, maxWidth: "62ch" }}>
            Federal outcomes for {p.credential_desc.toLowerCase()} graduates of{" "}
            <Link href={`/state/${state}/institution/${slug}/`}>
              {instDisplay}
            </Link>
            .{" "}
            {p.completers != null && (
              <>
                <strong style={{ color: "var(--fg)" }}>
                  {fmtNumber(p.completers)}
                </strong>{" "}
                completers in the most recent 4-year window
                {p.completers_single_year != null
                  ? ` (${fmtNumber(p.completers_single_year)} in the latest year alone)`
                  : ""}
                .{" "}
              </>
            )}
            {p.earnings_median_5yr != null && (
              <>
                Median earnings 5 years after completion:{" "}
                <strong style={{ color: "var(--fg)" }}>
                  {fmtCurrency(p.earnings_median_5yr)}
                </strong>
                {p.pooled_earnings ? " (pooled)" : ""}.
              </>
            )}
          </p>
          <div className="byline">
            <span className="meta-mono">
              SCORECARD FIELDOFSTUDYDATA · CIP {p.cip_code} ·{" "}
              {p.credential_desc.toUpperCase()}
            </span>
            <span className="meta-mono">
              PEER SET · {peers.length} {stateAgg.name.toUpperCase()} INSTITUTIONS
              {histRange ? ` · HISTORY ${histRange}` : ""}
            </span>
          </div>
        </div>
      </section>

      <section id="numbers" className="section">
        <div className="wrap">
          <div className="data-tiles">
            <DataTile
              label="Median earnings · 5y"
              value={fmtCurrency(p.earnings_median_5yr)}
              note={peerNote}
              spark={earn5Spark}
              sparkColor="var(--green)"
            />
            <DataTile
              label="Median earnings · 4y"
              value={fmtCurrency(p.earnings_median_4yr)}
              note="Treasury · 4y post-completion"
              spark={earn4Spark}
              sparkColor="var(--green)"
            />
            <DataTile
              label="Median federal debt"
              value={fmtCurrency(p.debt_median)}
              note="At program completion"
              spark={debtSpark}
              sparkColor="var(--amber)"
            />
            <DataTile
              label="Completers · 4y window"
              value={fmtNumber(p.completers)}
              note={
                p.completers_single_year != null
                  ? `${fmtNumber(p.completers_single_year)} most recent year`
                  : "IPEDS award counts"
              }
              spark={completersSpark}
              sparkColor="var(--blue-2)"
            />
          </div>
        </div>
      </section>

      {dteRatio != null && (
        <section id="debt" className="section section-tint">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">DEBT-TO-EARNINGS</div>
                <h2>What this program&apos;s debt costs its graduates</h2>
              </div>
              <p className="sec-sub">
                Annual debt service as a share of median 5-year-post-completion
                earnings, computed under federal Direct loan terms (10-year
                fixed at 6%). The 8% line is the gainful-employment threshold
                from federal regulation.
              </p>
            </header>
            <div
              data-pngable
              style={{
                display: "grid",
                gridTemplateColumns:
                  dteRatioPeerMedian != null ? "1fr 1fr" : "minmax(0, 540px)",
                gap: 14,
              }}
            >
              <DebtRatio
                ratio={dteRatio}
                threshold={0.08}
                label={`This program at ${iDisplay}`}
                sub={`Median federal debt ${fmtCurrency(p.debt_median)} amortized over 10 years vs. median 5-year earnings ${fmtCurrency(p.earnings_median_5yr)}.`}
              />
              {dteRatioPeerMedian != null && (
                <DebtRatio
                  ratio={dteRatioPeerMedian}
                  threshold={0.08}
                  label={`Statewide CIP-4 peer median`}
                  sub={`Same debt against the ${stateAgg.name} CIP ${p.cip_code} peer-median earnings ${fmtCurrency(peerMedian)}.`}
                />
              )}
            </div>
          </div>
        </section>
      )}

      {(earn5Spark.length >= 2 || debtSpark.length >= 2 ||
        completersSpark.length >= 2) && (
        <section id="shifts" className="section">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">SECTION 02 · PROGRAM HISTORY</div>
                <h2>How this program has shifted</h2>
              </div>
              <p className="sec-sub">
                Federal Field-of-Study history covers 2014–15 onward.
                Vintage-by-vintage values for earnings, debt, and completers.
              </p>
            </header>
            <div
              data-pngable
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${
                  [earn5Spark, debtSpark, completersSpark].filter(
                    (a) => a.length >= 2,
                  ).length
                }, 1fr)`,
                gap: 14,
              }}
            >
              {earn5Spark.length >= 2 && (
                <div className="figure-frame">
                  <div className="fig-head">
                    <span className="meta-mono">
                      EARNINGS · 5Y · {p.history.earnings_median_5yr[0].year}–
                      {
                        p.history.earnings_median_5yr[
                          p.history.earnings_median_5yr.length - 1
                        ].year
                      }
                    </span>
                    <span className="meta-mono">
                      {fmtCurrency(earn5Spark[earn5Spark.length - 1])}
                    </span>
                  </div>
                  <div className="fig-canvas">
                    <TrendLine
                      values={earn5Spark}
                      color="var(--green)"
                      startYear={earn5Years[0]}
                      endYear={earn5Years[earn5Years.length - 1]}
                      formatValue={fmtCurrency}
                    />
                  </div>
                  <div className="fig-foot">
                    <span>5-year post-completion earnings.</span>
                    <span className="meta-mono">FoS</span>
                  </div>
                </div>
              )}
              {debtSpark.length >= 2 && (
                <div className="figure-frame">
                  <div className="fig-head">
                    <span className="meta-mono">
                      DEBT · {p.history.debt_median[0].year}–
                      {
                        p.history.debt_median[p.history.debt_median.length - 1]
                          .year
                      }
                    </span>
                    <span className="meta-mono">
                      {fmtCurrency(debtSpark[debtSpark.length - 1])}
                    </span>
                  </div>
                  <div className="fig-canvas">
                    <TrendLine
                      values={debtSpark}
                      color="var(--amber)"
                      startYear={debtYears[0]}
                      endYear={debtYears[debtYears.length - 1]}
                      formatValue={fmtCurrency}
                    />
                  </div>
                  <div className="fig-foot">
                    <span>Median federal debt at program exit.</span>
                    <span className="meta-mono">FoS</span>
                  </div>
                </div>
              )}
              {completersSpark.length >= 2 && (
                <div className="figure-frame">
                  <div className="fig-head">
                    <span className="meta-mono">
                      COMPLETERS · {p.history.completers[0].year}–
                      {
                        p.history.completers[p.history.completers.length - 1]
                          .year
                      }
                    </span>
                    <span className="meta-mono">
                      {fmtNumber(completersSpark[completersSpark.length - 1])}
                    </span>
                  </div>
                  <div className="fig-canvas">
                    <TrendLine
                      values={completersSpark}
                      color="var(--blue-2)"
                      startYear={completersYears[0]}
                      endYear={completersYears[completersYears.length - 1]}
                      formatValue={fmtNumber}
                    />
                  </div>
                  <div className="fig-foot">
                    <span>Annual completers (IPEDS C).</span>
                    <span className="meta-mono">IPEDS</span>
                  </div>
                </div>
              )}
            </div>
            {p.long_arc.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <LongArcCards
                  arcs={p.long_arc}
                  scope={`${p.cip_desc.replace(/\.$/, "")} at ${iDisplay}`}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {p.roi && (
        <section id="roi" className="section">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">FINANCIAL OUTCOME · ILLUSTRATION</div>
                <h2>Estimate the financial outcome of this program</h2>
              </div>
              <p className="sec-sub">
                Cost from Scorecard net price by family income; earnings from
                Treasury 5-year-post-completion median, projected forward with
                a Mincer age-earnings curve. Selection-bias toggle applies the
                Dale-Krueger shrinkage. This is an outcomes illustration, not a
                forecast — see <Link href="/methodology#roi">methodology</Link>.
              </p>
            </header>
            <RoiCalculator
              mode="program"
              roi={p.roi}
              constants={roiConstants}
              costByIncome={i.cost_by_income ?? null}
              fallbackCostPerYear={
                i.avg_net_price_pub ?? i.avg_net_price_priv ?? i.cost_attendance
              }
              stateLower={p.state}
              schoolName={instDisplay}
              programLabel={`${p.cip_desc.replace(/\.$/, "")} · ${p.credential_desc}`}
            />
          </div>
        </section>
      )}

      {peers.length > 0 && (
        <section id="peers" className="section">
          <div className="wrap">
            <header className="sec-head">
              <div>
                <div className="kicker">PEER COMPARISON · CIP {p.cip_code}</div>
                <h2>
                  {p.cip_desc.replace(/\.$/, "")} across {stateAgg.name} institutions
                </h2>
              </div>
              <p className="sec-sub">
                Same CIP-4 code and credential level, all {stateAgg.name}{" "}
                Title-IV institutions where Scorecard publishes outcomes.
                Cohort floor is 30 students.
              </p>
            </header>
            <div className="prog-rank">
              {allPeers.map((peer) => {
                const w = ((peer.earnings_median_5yr ?? 0) / maxEarn) * 100;
                const inner = (
                  <>
                    <span className="pr-name">{displayName(peer.institution_name, peer.institution_slug)}</span>
                    <span className="meta-mono pr-cip">
                      {peer.focus ? "THIS PROGRAM" : "PEER"}
                      {peer.pooled_earnings ? " · POOLED" : ""}
                    </span>
                    <span className="pr-bar">
                      <i
                        style={{
                          width: `${w}%`,
                          background: peer.focus ? "var(--amber)" : "var(--blue-2)",
                        }}
                      />
                    </span>
                    <span className="pr-earn">
                      {fmtCurrency(peer.earnings_median_5yr)}
                    </span>
                    <span className="meta-mono pr-n">
                      {peer.completers != null ? `${fmtNumber(peer.completers)} grads` : "—"}
                    </span>
                  </>
                );
                if (peer.focus) {
                  return (
                    <div key={peer.institution_slug} className="pr-row focus">
                      {inner}
                    </div>
                  );
                }
                return (
                  <Link
                    key={peer.institution_slug}
                    className="pr-row"
                    href={`/state/${state}/institution/${peer.institution_slug}/program/${program}/`}
                  >
                    {inner}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section id="methodology" className="section section-tint">
        <div className="wrap">
          <div className="method-promo">
            <div>
              <div className="kicker">SUPPRESSION & SELECTION</div>
              <h3>What this page tells you, and what it doesn&apos;t</h3>
              <p>
                Earnings are <strong>median annual earnings</strong> of
                federally aided students who completed this program at this
                institution, drawn from federal tax records. They describe
                cohorts. They do not predict your earnings, and they do not
                claim that this program <em>caused</em> those outcomes —
                selection effects (who enrolls, who finishes, what fields they
                enter) dominate cross-program differences.
                {p.pooled_earnings && (
                  <>
                    {" "}
                    <em>Pooled</em> means earnings here combine multiple cohorts
                    to clear the privacy floor.
                  </>
                )}{" "}
                Em-dashes mean the federal data was suppressed because the
                cohort was below the 30-student floor.
              </p>
            </div>
            <Link href="/methodology" className="btn btn-primary">
              Methodology →
            </Link>
          </div>
        </div>
      </section>

      </main>
      <SiteFooter vintageLabel={p.source.vintage} />
    </>
  );
}

"use client";

// Outcomes-illustration calculator. See ../../../roi_calculator.md for the
// design and editorial guardrails.
//
// The math mirrors pipeline/src/publish/roi.py exactly so the SSR pre-computed
// `default_result` matches what the client recomputes on user input. Keep
// these two implementations in sync — if you change one, change the other.

import { useMemo, useState } from "react";

import { fmtCurrency } from "@/lib/format";
import type {
  CostByIncome,
  IncomeBracketId,
  InstitutionRoi,
  InstitutionRoiProgramEntry,
  ProgramRoi,
  RoiConstants,
} from "@/lib/types";

type CommonProps = {
  constants: RoiConstants;
  costByIncome: CostByIncome | null;
  fallbackCostPerYear: number | null;
  stateLower: string;
  schoolName: string;
  programLabel?: string;
};

type ProgramModeProps = CommonProps & {
  mode: "program";
  roi: ProgramRoi;
};

type InstitutionModeProps = CommonProps & {
  mode: "institution";
  institutionRoi: InstitutionRoi;
};

type Props = ProgramModeProps | InstitutionModeProps;

const BRACKET_ORDER: IncomeBracketId[] = [
  "0_30k",
  "30_48k",
  "48_75k",
  "75_110k",
  "110k_plus",
];

function pickCostPerYear(
  cost: CostByIncome | null,
  bracket: IncomeBracketId,
  fallback: number | null,
): number | null {
  if (cost) {
    const exact = cost[bracket];
    if (exact != null) return exact;
    // graceful fallback inside bracket order
    for (const id of BRACKET_ORDER) {
      const v = cost[id];
      if (v != null) return v;
    }
    if (cost.sticker != null) return cost.sticker;
  }
  return fallback;
}

function projectEarnings(
  anchorValue: number,
  anchorExpYears: number,
  targetExpYears: number,
  curve: { intercept: number; exp_coef: number; exp_sq_coef: number },
): number {
  const e0 = anchorExpYears;
  const e1 = targetExpYears;
  const delta =
    curve.exp_coef * (e1 - e0) +
    curve.exp_sq_coef * (e1 * e1 - e0 * e0);
  return anchorValue * Math.exp(delta);
}

function computeNpvAndBreakeven(args: {
  earningsAnchor: number;
  earningsAnchorYear: number;
  hsBaseline: number;
  costPerYear: number;
  yearsToComplete: number;
  horizonYears: number;
  discountRate: number;
  cipFamily: string;
  selectionAdjusted: boolean;
  constants: RoiConstants;
}): { npv: number; breakeven: number | null; series: { year: number; cumulative: number }[] } {
  const collegeCurve =
    args.constants.mincer_curves.by_cip_family[args.cipFamily] ??
    args.constants.mincer_curves.global_college;
  const hsCurve = args.constants.mincer_curves.global_hs_only;
  const shrink = args.selectionAdjusted
    ? args.constants.dk_shrinkage_by_cip_family[args.cipFamily] ??
      args.constants.dk_shrinkage_by_cip_family["_default"] ??
      0.4
    : 0;

  let cumulative = 0;
  let breakeven: number | null = null;
  const series: { year: number; cumulative: number }[] = [];
  const horizon = Math.max(args.horizonYears, args.yearsToComplete + 1);

  for (let t = 0; t < horizon; t++) {
    const df = 1 / Math.pow(1 + args.discountRate, t);
    let flow = 0;
    if (t < args.yearsToComplete) {
      flow -= args.costPerYear;
    }
    if (t >= args.yearsToComplete) {
      const expT = t - args.yearsToComplete;
      const collegeT = projectEarnings(
        args.earningsAnchor,
        args.earningsAnchorYear,
        expT,
        collegeCurve,
      );
      const hsT = projectEarnings(args.hsBaseline, 4, t, hsCurve);
      const premium = (collegeT - hsT) * (1 - shrink);
      flow += premium;
    }
    cumulative += flow * df;
    series.push({ year: t, cumulative });
    if (breakeven == null && cumulative > 0 && t >= args.yearsToComplete) {
      breakeven = t;
    }
  }
  return { npv: cumulative, breakeven, series };
}

function NpvSeriesChart({
  series,
  yearsToComplete,
  breakeven,
  width = 460,
  height = 130,
}: {
  series: { year: number; cumulative: number }[];
  yearsToComplete: number;
  breakeven: number | null;
  width?: number;
  height?: number;
}) {
  if (series.length < 2) return null;
  const xs = series.map((p) => p.year);
  const ys = series.map((p) => p.cumulative);
  const xMin = Math.min(...xs);
  const xMax = Math.max(...xs);
  const yMin = Math.min(...ys, 0);
  const yMax = Math.max(...ys, 0);
  const xScale = (x: number) =>
    ((x - xMin) / Math.max(1, xMax - xMin)) * (width - 40) + 30;
  const yScale = (y: number) =>
    height - 18 - ((y - yMin) / Math.max(1, yMax - yMin)) * (height - 36);
  const path = series
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.year).toFixed(1)} ${yScale(p.cumulative).toFixed(1)}`)
    .join(" ");
  const zeroY = yScale(0);
  const beX = breakeven != null ? xScale(breakeven) : null;
  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      style={{ display: "block", overflow: "visible" }}
    >
      <line
        x1={30}
        x2={width - 10}
        y1={zeroY}
        y2={zeroY}
        stroke="var(--bg-4, #2a2a2a)"
        strokeWidth={1}
      />
      <line
        x1={xScale(yearsToComplete)}
        x2={xScale(yearsToComplete)}
        y1={12}
        y2={height - 14}
        stroke="var(--bg-4, #2a2a2a)"
        strokeDasharray="3 3"
        strokeWidth={1}
      />
      <text
        x={xScale(yearsToComplete) + 4}
        y={16}
        fontSize="10"
        fill="var(--fg-3, #9aa)"
      >
        graduation
      </text>
      <path d={path} fill="none" stroke="var(--green, #6FCF97)" strokeWidth={1.8} />
      {beX != null && (
        <>
          <circle cx={beX} cy={zeroY} r={3.5} fill="var(--amber, #E6B450)" />
          <text x={beX + 6} y={zeroY - 6} fontSize="10" fill="var(--amber, #E6B450)">
            breakeven · year {breakeven}
          </text>
        </>
      )}
      <text x={30} y={height - 2} fontSize="10" fill="var(--fg-3, #9aa)">
        year 0
      </text>
      <text
        x={width - 38}
        y={height - 2}
        fontSize="10"
        fill="var(--fg-3, #9aa)"
      >
        year {xMax}
      </text>
    </svg>
  );
}

function pctLabel(v: number): string {
  return `${(v * 100).toFixed(1)}%`;
}

export default function RoiCalculator(props: Props) {
  const { constants, costByIncome, fallbackCostPerYear, stateLower, schoolName } =
    props;

  const isProgram = props.mode === "program";

  // Active program: program mode locks to one; institution mode uses a picker.
  const [selectedSlug, setSelectedSlug] = useState<string>(
    isProgram
      ? "" // unused in program mode
      : props.institutionRoi.default_program_slug ??
          props.institutionRoi.programs_available[0]?.slug ??
          "",
  );

  const activeEntry: ProgramModeProps["roi"] | InstitutionRoiProgramEntry | null =
    useMemo(() => {
      if (isProgram) return props.roi;
      const list = props.institutionRoi.programs_available;
      return list.find((e) => e.slug === selectedSlug) ?? list[0] ?? null;
    }, [isProgram, props, selectedSlug]);

  // Default assumptions seeded from server-rendered defaults.
  const initialAssumptions = isProgram
    ? props.roi.default_assumptions
    : {
        discount_rate: constants.default_discount_rate,
        horizon_years: constants.default_horizon_years,
        selection_adjusted: constants.default_selection_adjusted,
      };

  const [bracket, setBracket] = useState<IncomeBracketId>(
    isProgram
      ? props.roi.inputs.income_bracket_default
      : constants.default_income_bracket,
  );
  const [discountRate, setDiscountRate] = useState<number>(
    initialAssumptions.discount_rate,
  );
  const [horizonYears, setHorizonYears] = useState<number>(
    initialAssumptions.horizon_years,
  );
  const [selectionAdjusted, setSelectionAdjusted] = useState<boolean>(
    initialAssumptions.selection_adjusted,
  );

  // Derive everything we need from the active entry + constants.
  const computed = useMemo(() => {
    if (!activeEntry) return null;

    let earningsAnchor: number | null = null;
    let earningsAnchorYear = 5;
    let yearsToComplete = constants.default_years_to_complete;
    let cipFamily = "_default";
    let suppressed = false;

    if (isProgram) {
      const r = activeEntry as ProgramRoi;
      suppressed = r.suppressed;
      earningsAnchor = r.inputs.earnings_at_completion;
      earningsAnchorYear = r.inputs.earnings_anchor_year;
      yearsToComplete = r.inputs.years_to_complete;
      cipFamily = r.inputs.cip_family;
    } else {
      const e = activeEntry as InstitutionRoiProgramEntry;
      suppressed = !e.has_earnings;
      earningsAnchor = e.earnings_at_completion;
      earningsAnchorYear = e.earnings_anchor_year;
      yearsToComplete = e.years_to_complete;
      cipFamily = e.cip_family;
    }

    const costPerYear = pickCostPerYear(costByIncome, bracket, fallbackCostPerYear);
    const hsBaseline =
      constants.hs_grad_baseline_by_state[stateLower] ??
      constants.hs_grad_baseline_global;

    if (suppressed || earningsAnchor == null || costPerYear == null) {
      return {
        suppressed: true,
        costPerYear,
        hsBaseline,
        cipFamily,
        yearsToComplete,
        npv: null,
        breakeven: null,
        series: [],
      };
    }

    const { npv, breakeven, series } = computeNpvAndBreakeven({
      earningsAnchor,
      earningsAnchorYear,
      hsBaseline,
      costPerYear,
      yearsToComplete,
      horizonYears,
      discountRate,
      cipFamily,
      selectionAdjusted,
      constants,
    });

    return {
      suppressed: false,
      costPerYear,
      hsBaseline,
      cipFamily,
      yearsToComplete,
      npv,
      breakeven,
      series,
    };
  }, [
    activeEntry,
    bracket,
    costByIncome,
    fallbackCostPerYear,
    constants,
    stateLower,
    horizonYears,
    discountRate,
    selectionAdjusted,
    isProgram,
  ]);

  const programLabel: string =
    isProgram
      ? props.programLabel ?? "this program"
      : (activeEntry as InstitutionRoiProgramEntry | null)?.label ??
        "this program";

  const programs: InstitutionRoiProgramEntry[] = isProgram
    ? []
    : props.institutionRoi.programs_available;

  return (
    <div className="roi-card">
      <div className="roi-grid">
        {/* ---- Inputs column ---- */}
        <div className="roi-inputs">
          {!isProgram && programs.length > 0 && (
            <div className="roi-row">
              <label htmlFor="roi-prog">Program</label>
              <select
                id="roi-prog"
                value={selectedSlug}
                onChange={(e) => setSelectedSlug(e.target.value)}
              >
                {programs.map((p) => (
                  <option key={p.slug} value={p.slug} disabled={!p.has_earnings}>
                    {p.label}
                    {!p.has_earnings ? " · earnings suppressed" : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="roi-row">
            <label htmlFor="roi-bracket">Family income</label>
            <select
              id="roi-bracket"
              value={bracket}
              onChange={(e) => setBracket(e.target.value as IncomeBracketId)}
            >
              {constants.income_brackets.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <div className="roi-row">
            <label htmlFor="roi-rate">
              Discount rate · {pctLabel(discountRate)}
            </label>
            <input
              id="roi-rate"
              type="range"
              min={0}
              max={0.12}
              step={0.005}
              value={discountRate}
              onChange={(e) => setDiscountRate(parseFloat(e.target.value))}
            />
          </div>

          <div className="roi-row">
            <label htmlFor="roi-horizon">Horizon · {horizonYears} years</label>
            <input
              id="roi-horizon"
              type="range"
              min={10}
              max={45}
              step={1}
              value={horizonYears}
              onChange={(e) => setHorizonYears(parseInt(e.target.value, 10))}
            />
          </div>

          <div className="roi-row roi-toggle">
            <label htmlFor="roi-dk">
              <input
                id="roi-dk"
                type="checkbox"
                checked={selectionAdjusted}
                onChange={(e) => setSelectionAdjusted(e.target.checked)}
              />
              <span>Apply Dale-Krueger selection shrinkage</span>
            </label>
            <p className="roi-hint">
              Shrinks the earnings premium toward the matched-applicant mean.
              STEM &lt;15%, business ~40%, arts &amp; education ~60%.
            </p>
          </div>
        </div>

        {/* ---- Result column ---- */}
        <div className="roi-result">
          {computed?.suppressed ? (
            <div className="roi-empty">
              <div className="kicker">EARNINGS SUPPRESSED</div>
              <p>
                Federal privacy rules suppressed earnings for {programLabel} at{" "}
                {schoolName} (cohort below 30 students). The calculator can&rsquo;t
                produce a number we&rsquo;d stand behind, so we don&rsquo;t.
              </p>
            </div>
          ) : computed && computed.npv != null ? (
            <>
              <div className="roi-headline">
                <div>
                  <div className="kicker">NET PRESENT VALUE</div>
                  <div className="roi-big">
                    {fmtCurrency(Math.round(computed.npv))}
                  </div>
                  <div className="roi-sub">
                    Over {horizonYears} years, discounted {pctLabel(discountRate)}
                  </div>
                </div>
                <div>
                  <div className="kicker">BREAKEVEN</div>
                  <div className="roi-big">
                    {computed.breakeven != null
                      ? `Year ${computed.breakeven}`
                      : "—"}
                  </div>
                  <div className="roi-sub">
                    {computed.breakeven != null
                      ? "First year cumulative discounted earnings cross zero"
                      : "Doesn’t reach breakeven within the horizon"}
                  </div>
                </div>
              </div>
              <NpvSeriesChart
                series={computed.series}
                yearsToComplete={computed.yearsToComplete}
                breakeven={computed.breakeven}
              />
              <dl className="roi-decomp">
                <div>
                  <dt>Cost per year</dt>
                  <dd>{fmtCurrency(computed.costPerYear)}</dd>
                </div>
                <div>
                  <dt>HS-only baseline · {stateLower.toUpperCase()}</dt>
                  <dd>{fmtCurrency(computed.hsBaseline)}</dd>
                </div>
                <div>
                  <dt>Years to complete</dt>
                  <dd>{computed.yearsToComplete}</dd>
                </div>
                <div>
                  <dt>CIP family</dt>
                  <dd>{computed.cipFamily}</dd>
                </div>
              </dl>
            </>
          ) : (
            <div className="roi-empty">
              <div className="kicker">UNAVAILABLE</div>
              <p>Insufficient inputs to compute an outcome illustration.</p>
            </div>
          )}
          <p className="roi-disclaimer">
            Outcomes illustration · not a forecast. Projects observed Scorecard
            earnings forward with a Mincer age-earnings curve under your
            assumptions. See{" "}
            <a href="/methodology#roi">methodology</a> for the math.
          </p>
        </div>
      </div>
    </div>
  );
}

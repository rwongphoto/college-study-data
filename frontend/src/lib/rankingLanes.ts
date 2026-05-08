// Per-lane display metadata for the /rankings/* pages — the page renderers
// look up the heading label and (optional) InfoTip text by lane key. Mirrors
// pollution-data's rankingLanes module; the lane keys here match the ones
// emitted by pipeline/src/publish/rankings.py.

export type LaneOverride = {
  label: string;
  tooltip?: { heading: string; body: string };
};

export const LANE_OVERRIDES: Record<string, LaneOverride> = {
  earnings_10yr: {
    label: "Median earnings · 10 years after entry",
    tooltip: {
      heading: "What this means",
      body: "Median annual earnings of federally aided students 10 years after first enrolling, computed from Treasury IRS tax records. The cohort includes non-completers and out-of-state movers — selection effects (who enrolls, who completes, what fields they enter) drive most of the variation across institutions.",
    },
  },
  earnings_6yr: {
    label: "Median earnings · 6 years after entry",
    tooltip: {
      heading: "What this means",
      body: "Median annual earnings of federally aided students 6 years after first enrolling. Earlier in the post-college trajectory than the 10-year cut — fields that lead to graduate school (medicine, law, academia) generally show lower 6-year earnings than 10-year.",
    },
  },
  earnings_5yr: {
    label: "Median earnings · 5 years after completion",
    tooltip: {
      heading: "What this means",
      body: "Median annual earnings of program completers 5 years after finishing a degree, computed from Treasury IRS tax records. Program-level cut from College Scorecard Field of Study Data — distinct from the institution-level 'years after entry' figure.",
    },
  },
  completion_150: {
    label: "Completion rate · 150% of expected time",
    tooltip: {
      heading: "What this means",
      body: "Share of first-time, full-time freshmen who complete their program within 150% of expected time (six years for a four-year degree, three years for a two-year degree). Reported by IPEDS Graduation Rate survey. Tiny cohorts skew toward 100% — top tables apply a 1,000-undergrad floor where editorially relevant.",
    },
  },
  median_debt: {
    label: "Median debt at completion",
    tooltip: {
      heading: "What this means",
      body: "Median federal-student-loan debt of completers at graduation, reported by College Scorecard. Excludes private and parent loans. Lower values can indicate generous aid, lower published prices, or a high share of completers who used federal loans sparingly.",
    },
  },
  default_rate: {
    label: "Cohort default rate (3-year)",
    tooltip: {
      heading: "What this means",
      body: "Share of federal-loan borrowers who entered repayment in a given fiscal year and defaulted within three years. Federal Student Aid's official default-rate metric — lower means more borrowers stayed current after leaving the institution.",
    },
  },
  admission_rate: {
    label: "Admission rate",
    tooltip: {
      heading: "What this means",
      body: "Share of applicants who were offered admission, reported by IPEDS Admissions. A lower admission rate signals selectivity, not quality — selectivity reflects applicant volume relative to bed count more than instructional outcomes.",
    },
  },
  pell_share: {
    label: "Pell-recipient share",
    tooltip: {
      heading: "What this means",
      body: "Share of undergraduates who received a federal Pell Grant. A proxy for the institution's role in serving lower-income students; higher values often correlate with public and minority-serving institutions.",
    },
  },
  completers: {
    label: "Cumulative completers · 4-year",
    tooltip: {
      heading: "What this means",
      body: "IPEDSCOUNT2 — the rolling four-year sum of degrees awarded in this CIP × credential, matched to the cohort whose earnings are reported in College Scorecard FoS. Larger programs have more reliable downstream-earnings signals.",
    },
  },
};

export const LANE_METHODOLOGY: Record<string, string> = {
  earnings_10yr: "/methodology#earnings",
  earnings_6yr: "/methodology#earnings",
  earnings_5yr: "/methodology#earnings",
  completion_150: "/methodology#sources",
  median_debt: "/methodology#suppression",
  default_rate: "/methodology#sources",
  admission_rate: "/methodology#sources",
  pell_share: "/methodology#sources",
  completers: "/methodology#completers",
};

// Short labels for the JumpStrip on each /rankings/* page. Most/least tables
// for the same lane share one entry — the strip is per-metric, not per-table.
export const LANE_JUMP_LABEL: Record<string, string> = {
  earnings_10yr: "Earnings · 10y",
  earnings_6yr: "Earnings · 6y",
  earnings_5yr: "Earnings · 5y",
  completion_150: "Completion",
  median_debt: "Median debt",
  default_rate: "Default rate",
  admission_rate: "Admission rate",
  pell_share: "Pell share",
  completers: "Completers",
};

"""Pydantic models for institutions, programs, and place rollups.

Naming: a `Program` here is one (institution × CIP-4 × credential level) row from
Scorecard FieldOfStudyData. Suppressed cells are `None`, never zero.

History arrays are sparse: only vintages where the source published a non-null,
non-suppressed value appear. Every history point carries an integer `year`
(the academic year the value pertains to — for MERGED2018_19_PP.csv this is
2018; for FieldOfStudyData1819_1920 this is 2018) so the frontend can plot
gaps faithfully.
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, ConfigDict

from .flags.types import Flag


class Source(BaseModel):
    """Provenance stamp embedded in every published JSON payload."""

    model_config = ConfigDict(extra="forbid")
    name: str
    vintage: str  # e.g. "2025-05" for Most-Recent-Cohorts release date
    retrieved: str  # ISO date the local cache was downloaded
    history_vintages: list[int] = []  # academic years included in history arrays


class HistoryPoint(BaseModel):
    """One vintage's value for a metric. None means suppressed/missing for that year."""

    model_config = ConfigDict(extra="forbid")
    year: int
    value: Optional[float] = None


class LongArcShift(BaseModel):
    """Descriptive long-arc change for a metric. Past tense — never predictive.

    `from_year` and `to_year` are academic years; `from_value` and `to_value` are
    in the metric's native units; `pct_change` is signed (negative = decreased).
    """

    model_config = ConfigDict(extra="forbid")
    metric: str  # e.g. "completion_rate_150" | "enrollment_undergrad" | "tuition_in_state"
    from_year: int
    to_year: int
    from_value: float
    to_value: float
    pct_change: float
    direction: str  # "rose" | "fell" | "flat"


# ---------------------------------------------------------------------------
# Entity models
# ---------------------------------------------------------------------------


class InstitutionHistory(BaseModel):
    """Multi-vintage history arrays for one institution.

    Sparse — only vintages with non-null, non-suppressed values are included.
    Bulk MERGED files (1996-2010) cover non-earnings metrics; the College
    Scorecard API fills 2011 onward including Treasury-published earnings.
    """

    model_config = ConfigDict(extra="forbid")
    completion_rate_150: list[HistoryPoint] = []
    completion_rate_100: list[HistoryPoint] = []
    retention_rate: list[HistoryPoint] = []
    admission_rate: list[HistoryPoint] = []
    enrollment_undergrad: list[HistoryPoint] = []
    tuition_in_state: list[HistoryPoint] = []
    tuition_out_of_state: list[HistoryPoint] = []
    cost_attendance: list[HistoryPoint] = []
    avg_net_price_pub: list[HistoryPoint] = []
    avg_net_price_priv: list[HistoryPoint] = []
    median_debt: list[HistoryPoint] = []
    default_rate: list[HistoryPoint] = []
    pell_share: list[HistoryPoint] = []
    # Treasury earnings history (API-only; bulk MERGED files don't carry
    # earnings before 2014). Cohort years documented per metric in the
    # College Scorecard data dictionary.
    earnings_median_6yr: list[HistoryPoint] = []
    earnings_median_8yr: list[HistoryPoint] = []
    earnings_median_10yr: list[HistoryPoint] = []


class Institution(BaseModel):
    """One Title-IV-eligible institution from IPEDS HD + Scorecard."""

    model_config = ConfigDict(extra="forbid")

    unitid: str
    opeid6: Optional[str] = None
    name: str
    slug: str

    # Geography
    state: str
    city: str
    city_slug: str
    zip5: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    # Sector / type
    control: str  # "public" | "private_nonprofit" | "private_forprofit"
    pred_degree: str  # "certificate" | "associates" | "bachelors" | "graduate"
    highest_degree: str
    main_campus: bool
    locale: Optional[str] = None  # IPEDS LOCALE rolled up
    carnegie_basic: Optional[int] = None
    sector_code: Optional[int] = None
    hbcu: bool = False
    tribal: bool = False

    # Outcome metrics — institution-level (current vintage)
    earnings_median_4yr: Optional[int] = None  # MD_EARN_WNE_P10 (10yr post-entry equivalent)
    earnings_median_5yr: Optional[int] = None  # MD_EARN_WNE_P5
    earnings_median_6yr: Optional[int] = None  # MD_EARN_WNE_P6
    earnings_median_8yr: Optional[int] = None  # MD_EARN_WNE_P8
    earnings_median_10yr: Optional[int] = None  # MD_EARN_WNE_P10
    completion_rate_150: Optional[float] = None  # C150_4 / C150_L4
    completion_rate_100: Optional[float] = None  # C100_4 / C100_L4
    retention_rate: Optional[float] = None  # RET_FT4 / RET_FTL4
    admission_rate: Optional[float] = None  # ADM_RATE
    enrollment_undergrad: Optional[int] = None  # UGDS
    enrollment_total: Optional[int] = None
    cost_attendance: Optional[int] = None  # COSTT4_A or COSTT4_P
    tuition_in_state: Optional[int] = None  # TUITIONFEE_IN
    tuition_out_of_state: Optional[int] = None  # TUITIONFEE_OUT
    avg_net_price_pub: Optional[int] = None  # NPT4_PUB
    avg_net_price_priv: Optional[int] = None  # NPT4_PRIV
    cost_by_income: Optional[dict] = None  # NPT4{1..5}_{PUB,PRIV} by income bracket
    median_debt: Optional[int] = None  # DEBT_MDN
    default_rate: Optional[float] = None  # CDR3
    pell_share: Optional[float] = None  # PCTPELL

    # Historical vintages (sparse) — drives sparklines and long-arc copy.
    history: InstitutionHistory = InstitutionHistory()
    long_arc: list[LongArcShift] = []
    # Anomaly-engine output. Empty until the engine has run.
    flags: list[Flag] = []


class ProgramHistory(BaseModel):
    """Multi-vintage history arrays for one program (CIP × credential × institution)."""

    model_config = ConfigDict(extra="forbid")
    earnings_median_4yr: list[HistoryPoint] = []
    earnings_median_5yr: list[HistoryPoint] = []
    debt_median: list[HistoryPoint] = []
    completers: list[HistoryPoint] = []  # IPEDSCOUNT2 (4-yr window)


class Program(BaseModel):
    """One (institution × CIP-4 × credential) program row from FieldOfStudyData."""

    model_config = ConfigDict(extra="forbid")

    institution_unitid: str
    institution_name: str
    institution_slug: str
    state: str
    cip_code: str  # 4-digit normalized
    cip_desc: str
    credential_level: int  # CREDLEV
    credential_desc: str
    slug: str  # cip-credential composite

    earnings_median_4yr: Optional[int] = None  # EARN_MDN_4YR
    earnings_median_5yr: Optional[int] = None  # EARN_MDN_5YR
    earnings_count_4yr: Optional[int] = None  # EARN_COUNT_NWNE_4YR
    earnings_count_5yr: Optional[int] = None  # EARN_COUNT_NWNE_5YR
    debt_median: Optional[int] = None  # DEBT_ALL_STGP_EVAL_MDN
    completers: Optional[int] = None  # IPEDSCOUNT2 — 4-yr cumulative cohort
    completers_single_year: Optional[int] = None  # IPEDSCOUNT1 — single-year awards
    pooled_earnings: bool = False  # True if Scorecard pooled earnings to parent OPEID

    history: ProgramHistory = ProgramHistory()
    long_arc: list[LongArcShift] = []
    flags: list[Flag] = []


# ---------------------------------------------------------------------------
# Aggregate / rollup models
# ---------------------------------------------------------------------------


class StateAgg(BaseModel):
    """State hub rollup."""

    model_config = ConfigDict(extra="forbid")
    state: str  # 2-letter postal code, lowercase
    name: str
    institution_count: int
    institutions_by_control: dict[str, int]  # public | private_nonprofit | private_forprofit
    institutions_by_pred_degree: dict[str, int]
    earnings_median_state: Optional[int] = None  # population-weighted median across institutions
    completion_rate_state: Optional[float] = None
    completion_history_state: list[HistoryPoint] = []  # state-level median completion across vintages
    enrollment_history_state: list[HistoryPoint] = []  # state-level total undergrad enrollment
    tuition_history_state: list[HistoryPoint] = []  # state-level median in-state tuition
    top_by_earnings: list[dict]
    top_by_completion: list[dict]
    cities: list[dict]  # {slug, name, institution_count}
    institutions: list[dict]  # {slug, name, city, control, pred_degree, ...}
    long_arc: list[LongArcShift] = []
    flags: list[Flag] = []
    source: Source


class CityAgg(BaseModel):
    model_config = ConfigDict(extra="forbid")
    state: str
    name: str
    slug: str
    institution_count: int
    institutions: list[dict]
    earnings_median_city: Optional[int] = None
    completion_rate_city: Optional[float] = None
    completion_history_city: list[HistoryPoint] = []
    enrollment_history_city: list[HistoryPoint] = []
    source: Source


class HomePayload(BaseModel):
    """Cross-state home payload."""

    model_config = ConfigDict(extra="forbid")
    states: list[dict]  # {slug, name, institution_count, program_count}
    institution_count: int
    program_count: int
    coverage_note: str
    source: Source

"""Ingest College Scorecard institution-level + field-of-study CSVs.

Scorecard has 3,300 columns; we read only the subset we surface. Suppressed
cells in Scorecard are NaN, "PrivacySuppressed", or "NULL" — all collapse to
None via `_to_int` / `_to_float`.
"""
from __future__ import annotations

from pathlib import Path
from typing import Any, Optional

import pandas as pd

from ..models import Institution, Program
from ..normalize.text import (
    CONTROL_MAP,
    HIGHEST_DEGREE_MAP,
    PRED_DEGREE_MAP,
    institution_slug,
    program_slug,
    slugify,
)


_SC_INSTITUTION_COLS = [
    "UNITID", "OPEID6", "INSTNM", "CITY", "STABBR", "ZIP",
    "LATITUDE", "LONGITUDE", "CONTROL", "PREDDEG", "HIGHDEG",
    "MAIN", "CCBASIC", "CCSIZSET", "HBCU", "TRIBAL",
    "ADM_RATE", "UGDS",
    "C100_4", "C100_L4", "C150_4", "C150_L4",
    "RET_FT4", "RET_FTL4",
    "COSTT4_A", "COSTT4_P",
    "TUITIONFEE_IN", "TUITIONFEE_OUT",
    "NPT4_PUB", "NPT4_PRIV",
    "NPT41_PUB", "NPT42_PUB", "NPT43_PUB", "NPT44_PUB", "NPT45_PUB",
    "NPT41_PRIV", "NPT42_PRIV", "NPT43_PRIV", "NPT44_PRIV", "NPT45_PRIV",
    "PCTPELL", "DEBT_MDN", "CDR3",
    "MD_EARN_WNE_P5", "MD_EARN_WNE_P6", "MD_EARN_WNE_P8", "MD_EARN_WNE_P10",
    "MN_EARN_WNE_P10",
]


_SC_FOS_COLS = [
    "UNITID", "OPEID6", "INSTNM", "CONTROL", "MAIN",
    "CIPCODE", "CIPDESC", "CREDLEV", "CREDDESC",
    "EARN_MDN_4YR", "EARN_MDN_5YR",
    "EARN_COUNT_NWNE_4YR", "EARN_COUNT_NWNE_5YR",
    "DEBT_ALL_STGP_EVAL_MDN",
    "IPEDSCOUNT1", "IPEDSCOUNT2",
]


def _to_int(v: Any) -> Optional[int]:
    if v is None or pd.isna(v):
        return None
    if isinstance(v, str):
        s = v.strip()
        if s == "" or s.lower() in ("privacysuppressed", "null", "nulldata", "na"):
            return None
        try:
            return int(float(s))
        except ValueError:
            return None
    try:
        return int(float(v))
    except (TypeError, ValueError):
        return None


def _to_float(v: Any) -> Optional[float]:
    if v is None or pd.isna(v):
        return None
    if isinstance(v, str):
        s = v.strip()
        if s == "" or s.lower() in ("privacysuppressed", "null", "nulldata", "na"):
            return None
        try:
            return float(s)
        except ValueError:
            return None
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def _to_str(v: Any) -> Optional[str]:
    if v is None or pd.isna(v):
        return None
    s = str(v).strip()
    if s == "" or s.lower() in ("nan", "null"):
        return None
    return s


def _cost_by_income(sc_row: pd.Series, control: str) -> Optional[dict]:
    """Build the institution.cost_by_income dict from a Scorecard row.

    Picks NPT4{1..5}_PUB or NPT4{1..5}_PRIV based on control. Returns None if
    every bracket is suppressed and there's no sticker fallback either.
    """
    sector = "PUB" if control == "public" else "PRIV"
    by_bracket = {
        "0_30k":     _to_int(sc_row.get(f"NPT41_{sector}")),
        "30_48k":    _to_int(sc_row.get(f"NPT42_{sector}")),
        "48_75k":    _to_int(sc_row.get(f"NPT43_{sector}")),
        "75_110k":   _to_int(sc_row.get(f"NPT44_{sector}")),
        "110k_plus": _to_int(sc_row.get(f"NPT45_{sector}")),
    }
    sticker = _to_int(sc_row.get("COSTT4_A")) or _to_int(sc_row.get("COSTT4_P"))
    if all(v is None for v in by_bracket.values()) and sticker is None:
        return None
    return {**by_bracket, "sticker": sticker, "sector": sector.lower()}


def load_institutions(
    csv_path: Path,
    *,
    state: Optional[str] = None,
    main_only: bool = True,
) -> pd.DataFrame:
    """Load Scorecard institution CSV and (optionally) filter to one state.

    `main_only=True` drops branch campuses to align with IPEDS HD's parent-only
    institution surfaces; you can flip this off if you want branches as separate
    entity pages.
    """
    df = pd.read_csv(
        csv_path,
        usecols=lambda c: c in _SC_INSTITUTION_COLS,
        dtype={"UNITID": str, "OPEID6": str, "ZIP": str},
        low_memory=False,
    )
    if state:
        df = df[df["STABBR"].str.upper() == state.upper()].copy()
    if main_only:
        df = df[df["MAIN"] == 1].copy()
    return df.reset_index(drop=True)


def load_field_of_study(
    csv_path: Path,
    *,
    unitid_filter: Optional[set[str]] = None,
) -> pd.DataFrame:
    """Load Scorecard FieldOfStudyData and filter to a UNITID set."""
    df = pd.read_csv(
        csv_path,
        usecols=lambda c: c in _SC_FOS_COLS,
        dtype={"UNITID": str, "OPEID6": str, "CIPCODE": str},
        low_memory=False,
    )
    if unitid_filter is not None:
        df = df[df["UNITID"].astype(str).isin(unitid_filter)].copy()
    return df.reset_index(drop=True)


def institution_from_row(
    sc_row: pd.Series,
    hd_row: Optional[pd.Series],
) -> Institution:
    """Merge Scorecard institution row + IPEDS HD row → Institution model."""
    unitid = str(sc_row["UNITID"])
    name = str(sc_row["INSTNM"])
    state = str(sc_row["STABBR"]).upper()

    # Address / locale come from IPEDS HD; outcomes from Scorecard.
    if hd_row is not None:
        address = _to_str(hd_row.get("ADDR"))
        # IPEDS lat/lon often present where Scorecard is null
        lat = _to_float(hd_row.get("LATITUDE")) or _to_float(sc_row.get("LATITUDE"))
        lon = _to_float(hd_row.get("LONGITUD")) or _to_float(sc_row.get("LONGITUDE"))
        locale = _to_str(hd_row.get("LOCALE"))
        carnegie = _to_int(hd_row.get("CCBASIC")) or _to_int(sc_row.get("CCBASIC"))
        sector = _to_int(hd_row.get("SECTOR"))
    else:
        address = None
        lat = _to_float(sc_row.get("LATITUDE"))
        lon = _to_float(sc_row.get("LONGITUDE"))
        locale = None
        carnegie = _to_int(sc_row.get("CCBASIC"))
        sector = None

    city = _to_str(sc_row.get("CITY")) or "Unknown"
    control = CONTROL_MAP.get(_to_int(sc_row.get("CONTROL")), "unknown")
    pred = PRED_DEGREE_MAP.get(_to_int(sc_row.get("PREDDEG")), "unknown")
    high = HIGHEST_DEGREE_MAP.get(_to_int(sc_row.get("HIGHDEG")), "unknown")

    return Institution(
        unitid=unitid,
        opeid6=_to_str(sc_row.get("OPEID6")),
        name=name,
        slug=institution_slug(name, unitid),
        state=state.lower(),
        city=city,
        city_slug=slugify(city),
        zip5=_to_str(sc_row.get("ZIP", ""))[:5] if _to_str(sc_row.get("ZIP")) else None,
        address=address,
        latitude=lat,
        longitude=lon,
        control=control,
        pred_degree=pred,
        highest_degree=high,
        main_campus=bool(_to_int(sc_row.get("MAIN")) == 1),
        locale=locale,
        carnegie_basic=carnegie,
        sector_code=sector,
        hbcu=bool(_to_int(sc_row.get("HBCU")) == 1),
        tribal=bool(_to_int(sc_row.get("TRIBAL")) == 1),
        # outcomes
        earnings_median_5yr=_to_int(sc_row.get("MD_EARN_WNE_P5")),
        earnings_median_6yr=_to_int(sc_row.get("MD_EARN_WNE_P6")),
        earnings_median_8yr=_to_int(sc_row.get("MD_EARN_WNE_P8")),
        earnings_median_10yr=_to_int(sc_row.get("MD_EARN_WNE_P10")),
        completion_rate_150=_to_float(sc_row.get("C150_4")) or _to_float(sc_row.get("C150_L4")),
        completion_rate_100=_to_float(sc_row.get("C100_4")) or _to_float(sc_row.get("C100_L4")),
        retention_rate=_to_float(sc_row.get("RET_FT4")) or _to_float(sc_row.get("RET_FTL4")),
        admission_rate=_to_float(sc_row.get("ADM_RATE")),
        enrollment_undergrad=_to_int(sc_row.get("UGDS")),
        cost_attendance=_to_int(sc_row.get("COSTT4_A")) or _to_int(sc_row.get("COSTT4_P")),
        tuition_in_state=_to_int(sc_row.get("TUITIONFEE_IN")),
        tuition_out_of_state=_to_int(sc_row.get("TUITIONFEE_OUT")),
        avg_net_price_pub=_to_int(sc_row.get("NPT4_PUB")),
        avg_net_price_priv=_to_int(sc_row.get("NPT4_PRIV")),
        cost_by_income=_cost_by_income(sc_row, control),
        median_debt=_to_int(sc_row.get("DEBT_MDN")),
        default_rate=_to_float(sc_row.get("CDR3")),
        pell_share=_to_float(sc_row.get("PCTPELL")),
    )


def program_from_row(
    fos_row: pd.Series,
    institutions_by_unitid: dict[str, Institution],
) -> Optional[Program]:
    """Build a Program from a FieldOfStudyData row.

    Returns None if the institution is not in our published set (e.g. branch
    campus filtered out, or different state) — we want program pages anchored
    to institutions we publish.
    """
    unitid = str(fos_row["UNITID"])
    inst = institutions_by_unitid.get(unitid)
    if inst is None:
        return None

    cred_level = _to_int(fos_row.get("CREDLEV"))
    if cred_level is None:
        return None

    cip_code = _to_str(fos_row.get("CIPCODE")) or "00.0000"
    cip_desc = _to_str(fos_row.get("CIPDESC")) or "Unknown program"
    cred_desc = _to_str(fos_row.get("CREDDESC")) or f"Level {cred_level}"

    return Program(
        institution_unitid=unitid,
        institution_name=inst.name,
        institution_slug=inst.slug,
        state=inst.state,
        cip_code=cip_code,
        cip_desc=cip_desc,
        credential_level=cred_level,
        credential_desc=cred_desc,
        slug=program_slug(cip_code, cred_level),
        earnings_median_4yr=_to_int(fos_row.get("EARN_MDN_4YR")),
        earnings_median_5yr=_to_int(fos_row.get("EARN_MDN_5YR")),
        earnings_count_4yr=_to_int(fos_row.get("EARN_COUNT_NWNE_4YR")),
        earnings_count_5yr=_to_int(fos_row.get("EARN_COUNT_NWNE_5YR")),
        debt_median=_to_int(fos_row.get("DEBT_ALL_STGP_EVAL_MDN")),
        completers=_to_int(fos_row.get("IPEDSCOUNT2")),
        completers_single_year=_to_int(fos_row.get("IPEDSCOUNT1")),
    )

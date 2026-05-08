"""Ingest IPEDS HD (institution directory) for address, lat/lon, Carnegie."""
from __future__ import annotations

from pathlib import Path
from typing import Optional

import pandas as pd


_HD_COLS = [
    "UNITID", "INSTNM", "ADDR", "CITY", "STABBR", "ZIP",
    "FIPS", "OBEREG", "OPEFLAG", "SECTOR", "CONTROL",
    "HLOFFER", "UGOFFER", "DEGGRANT", "HBCU", "TRIBAL",
    "LOCALE", "CYACTIVE", "CCBASIC", "CARNEGIE",
    "LONGITUD", "LATITUDE",
]


def load_hd(csv_path: Path, *, state: Optional[str] = None) -> pd.DataFrame:
    """Load IPEDS HD2023, optionally filtered to one state.

    HD ships in latin-1 encoding (some legacy institution names with é, ñ, etc.).
    """
    df = pd.read_csv(
        csv_path,
        dtype={"UNITID": str, "ZIP": str},
        encoding="latin-1",
        low_memory=False,
    )
    # IPEDS files are latin-1 but ship a UTF-8 BOM; strip from first col name.
    df.columns = [c.lstrip("﻿").lstrip("ï»¿") for c in df.columns]
    df = df[[c for c in _HD_COLS if c in df.columns]].copy()
    # dtype hints didn't apply to BOM'd UNITID column at read time — recast.
    if "UNITID" in df.columns:
        df["UNITID"] = df["UNITID"].astype(str)
    if "ZIP" in df.columns:
        df["ZIP"] = df["ZIP"].astype(str)
    if state:
        df = df[df["STABBR"].str.upper() == state.upper()].copy()
    # Active only — drop institutions IPEDS no longer surveys
    if "CYACTIVE" in df.columns:
        df = df[df["CYACTIVE"] == 1].copy()
    return df.set_index("UNITID")

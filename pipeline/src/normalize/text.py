"""Text normalization helpers — slugs, control codes, degree codes."""
from __future__ import annotations

from slugify import slugify as _slugify


def slugify(value: str) -> str:
    return _slugify(value, lowercase=True, max_length=80)


def institution_slug(name: str, unitid: str) -> str:
    """Slug for institution. UNITID disambiguator is appended only when needed.

    For now, always append because: (a) some chains share names across campuses
    (Concorde, Pioneer Pacific), (b) it makes URLs unambiguous and stable, and
    (c) UNITIDs are stable identifiers from IPEDS.
    """
    base = slugify(name)
    return f"{base}-{unitid}"


def program_slug(cip_code: str, credential_level: int) -> str:
    """Stable slug for program: CIP-4 + credential level integer."""
    cip4 = cip_code.replace(".", "").zfill(4)[:4]
    return f"{cip4}-c{credential_level}"


CONTROL_MAP = {
    "1": "public",
    "2": "private_nonprofit",
    "3": "private_forprofit",
    1: "public",
    2: "private_nonprofit",
    3: "private_forprofit",
}

PRED_DEGREE_MAP = {
    "0": "non_degree",
    "1": "certificate",
    "2": "associates",
    "3": "bachelors",
    "4": "graduate",
    0: "non_degree",
    1: "certificate",
    2: "associates",
    3: "bachelors",
    4: "graduate",
}

HIGHEST_DEGREE_MAP = {
    "0": "non_degree",
    "1": "certificate",
    "2": "associates",
    "3": "bachelors",
    "4": "masters",
    "5": "doctoral",
    "6": "first_professional",
    "7": "graduate",
    0: "non_degree",
    1: "certificate",
    2: "associates",
    3: "bachelors",
    4: "masters",
    5: "doctoral",
    6: "first_professional",
    7: "graduate",
}

STATE_NAMES = {
    "AL": "Alabama", "AK": "Alaska", "AZ": "Arizona", "AR": "Arkansas",
    "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DE": "Delaware",
    "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "ID": "Idaho",
    "IL": "Illinois", "IN": "Indiana", "IA": "Iowa", "KS": "Kansas",
    "KY": "Kentucky", "LA": "Louisiana", "ME": "Maine", "MD": "Maryland",
    "MA": "Massachusetts", "MI": "Michigan", "MN": "Minnesota", "MS": "Mississippi",
    "MO": "Missouri", "MT": "Montana", "NE": "Nebraska", "NV": "Nevada",
    "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NY": "New York",
    "NC": "North Carolina", "ND": "North Dakota", "OH": "Ohio", "OK": "Oklahoma",
    "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina",
    "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah",
    "VT": "Vermont", "VA": "Virginia", "WA": "Washington", "WV": "West Virginia",
    "WI": "Wisconsin", "WY": "Wyoming", "DC": "District of Columbia",
    "PR": "Puerto Rico",
}

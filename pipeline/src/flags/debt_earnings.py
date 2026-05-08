"""debt_earnings_warning detector — D/E ratio above gainful-employment threshold.

Annual debt service is computed under federal Direct loan terms (10-year
fixed-rate amortization at 6%) — same formula as
``frontend/src/lib/format.ts::debtToEarningsRatio``. The 8% threshold is the
GE rule's "passing" line; ≥ 12% is the "failing" line under prior cycles.
"""

from __future__ import annotations

from typing import Optional

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from ..models import Institution, Program
from .prose import render_debt_earnings_warning
from .types import Flag


GE_THRESHOLD = 0.08
WARNING_AMORT_RATE = 0.06
WARNING_AMORT_YEARS = 10


def _annual_payment(debt: float, *, rate: float = WARNING_AMORT_RATE,
                    years: int = WARNING_AMORT_YEARS) -> float:
    monthly_rate = rate / 12
    months = years * 12
    monthly_payment = (debt * monthly_rate) / (1 - (1 + monthly_rate) ** -months)
    return monthly_payment * 12


def _ratio(debt: Optional[float], earnings: Optional[float]) -> Optional[float]:
    if debt is None or earnings is None:
        return None
    if debt <= 0 or earnings <= 0:
        return None
    return _annual_payment(float(debt)) / float(earnings)


def detect_institution_debt_earnings(inst: Institution) -> Optional[Flag]:
    ratio = _ratio(inst.median_debt, inst.earnings_median_10yr)
    if ratio is None or ratio < GE_THRESHOLD:
        return None
    summary = render_debt_earnings_warning(
        scope=inst.name,
        ratio=ratio,
        debt=float(inst.median_debt or 0),
        earnings=float(inst.earnings_median_10yr or 0),
        threshold=GE_THRESHOLD,
    )
    return Flag(
        type="debt_earnings_warning",
        severity="warning",
        label="Debt-to-earnings",
        summary=summary,
        magnitude_pct=round(ratio * 100, 1),
        magnitude_abs=round((ratio - GE_THRESHOLD) * 100, 1),
        units="%",
        metric="debt_earnings_ratio",
    )


def detect_program_debt_earnings(prog: Program, scope: str) -> Optional[Flag]:
    """Same threshold, but applied to program-level debt vs 5y earnings."""
    ratio = _ratio(prog.debt_median, prog.earnings_median_5yr)
    if ratio is None or ratio < GE_THRESHOLD:
        return None
    summary = render_debt_earnings_warning(
        scope=scope,
        ratio=ratio,
        debt=float(prog.debt_median or 0),
        earnings=float(prog.earnings_median_5yr or 0),
        threshold=GE_THRESHOLD,
    )
    return Flag(
        type="debt_earnings_warning",
        severity="warning",
        label="Debt-to-earnings",
        summary=summary,
        magnitude_pct=round(ratio * 100, 1),
        magnitude_abs=round((ratio - GE_THRESHOLD) * 100, 1),
        units="%",
        metric="debt_earnings_ratio",
    )

"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { fmtControl } from "@/lib/format";
import type { InstitutionCard } from "@/lib/types";

type SortKey =
  | "name"
  | "sector_city"
  | "enrollment_undergrad"
  | "earnings_median_10yr"
  | "median_debt"
  | "completion_rate_150";

type SortDir = "asc" | "desc";

const DEFAULT_KEY: SortKey = "earnings_median_10yr";

const DEFAULT_DIR: Record<SortKey, SortDir> = {
  name: "asc",
  sector_city: "asc",
  enrollment_undergrad: "desc",
  earnings_median_10yr: "desc",
  median_debt: "asc",
  completion_rate_150: "desc",
};

const VALID_KEYS = new Set<SortKey>([
  "name",
  "sector_city",
  "enrollment_undergrad",
  "earnings_median_10yr",
  "median_debt",
  "completion_rate_150",
]);

function compare(
  a: InstitutionCard,
  b: InstitutionCard,
  key: SortKey,
  dir: SortDir,
): number {
  const sign = dir === "asc" ? 1 : -1;
  const get = (row: InstitutionCard): string | number | null => {
    switch (key) {
      case "name":
        return row.name.toLocaleLowerCase();
      case "sector_city":
        return `${fmtControl(row.control)} · ${row.city}`.toLocaleLowerCase();
      case "enrollment_undergrad":
        return row.enrollment_undergrad;
      case "earnings_median_10yr":
        return row.earnings_median_10yr;
      case "median_debt":
        return row.median_debt;
      case "completion_rate_150":
        return row.completion_rate_150;
    }
  };
  const av = get(a);
  const bv = get(b);
  const aMissing = av === null || av === undefined;
  const bMissing = bv === null || bv === undefined;
  if (aMissing && bMissing) return 0;
  if (aMissing) return 1;
  if (bMissing) return -1;
  if (typeof av === "number" && typeof bv === "number") {
    return sign * (av - bv);
  }
  return sign * String(av).localeCompare(String(bv));
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function heat(
  v: number | null,
  med: number | null,
  invert = false,
): string | undefined {
  if (v == null || med == null) return undefined;
  const above = invert ? v < med : v > med;
  return above ? "rgba(111,207,151,0.18)" : "rgba(196,69,69,0.12)";
}

export default function InstitutionRankTable({
  rows,
  state,
}: {
  rows: InstitutionCard[];
  state: string;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const rawKey = searchParams.get("sort");
  const rawDir = searchParams.get("dir");
  const sortKey: SortKey = VALID_KEYS.has(rawKey as SortKey)
    ? (rawKey as SortKey)
    : DEFAULT_KEY;
  const sortDir: SortDir = rawDir === "asc" || rawDir === "desc"
    ? rawDir
    : DEFAULT_DIR[sortKey];

  const sorted = useMemo(() => {
    return rows.slice().sort((a, b) => compare(a, b, sortKey, sortDir));
  }, [rows, sortKey, sortDir]);

  const earnMed = median(
    sorted.map((r) => r.earnings_median_10yr).filter((v): v is number => v != null),
  );
  const debtMed = median(
    sorted.map((r) => r.median_debt).filter((v): v is number => v != null),
  );
  const compMed = median(
    sorted
      .map((r) => r.completion_rate_150)
      .filter((v): v is number => v != null),
  );

  if (rows.length === 0) {
    return (
      <p className="muted" style={{ fontStyle: "italic" }}>
        No institutions in this rollup.
      </p>
    );
  }

  function sortHref(k: SortKey): string {
    const active = sortKey === k;
    const nextDir: SortDir = active
      ? sortDir === "asc"
        ? "desc"
        : "asc"
      : DEFAULT_DIR[k];
    return `${pathname}?sort=${k}&dir=${nextDir}`;
  }

  function HeaderLink({
    k,
    label,
    align = "left",
  }: {
    k: SortKey;
    label: string;
    align?: "left" | "right";
  }) {
    const active = sortKey === k;
    const nextDir: SortDir = active
      ? sortDir === "asc"
        ? "desc"
        : "asc"
      : DEFAULT_DIR[k];
    const ariaLabel = `Sort by ${label.toLowerCase()}, ${
      nextDir === "asc" ? "ascending" : "descending"
    }`;
    return (
      <Link
        href={sortHref(k)}
        scroll={false}
        replace
        className={`rt-sort ${active ? "active" : ""} ${
          align === "right" ? "r" : ""
        }`}
        aria-label={ariaLabel}
        aria-sort={
          active ? (sortDir === "asc" ? "ascending" : "descending") : "none"
        }
      >
        <span aria-hidden="true">{label}</span>
        <span className="rt-arrow" aria-hidden="true">
          {active ? (sortDir === "asc" ? "▲" : "▼") : ""}
        </span>
      </Link>
    );
  }

  return (
    <div className="rank-table">
      <div className="rt-th">
        <HeaderLink k="name" label="INSTITUTION" />
        <HeaderLink k="sector_city" label="SECTOR / CITY" />
        <HeaderLink k="enrollment_undergrad" label="UNDERGRAD" align="right" />
        <HeaderLink k="earnings_median_10yr" label="EARN 10Y" align="right" />
        <HeaderLink k="median_debt" label="DEBT" align="right" />
        <HeaderLink k="completion_rate_150" label="COMP %" align="right" />
      </div>
      {sorted.map((r) => (
        <Link
          key={r.unitid}
          href={`/state/${state}/institution/${r.slug}/`}
          className="rt-tr"
        >
          <span className="nbhd">{r.name}</span>
          <span className="num-mono">
            {fmtControl(r.control)} · {r.city}
          </span>
          <span className="r heat">
            {r.enrollment_undergrad?.toLocaleString() ?? "—"}
          </span>
          <span
            className="r heat"
            style={{ background: heat(r.earnings_median_10yr, earnMed) }}
          >
            {r.earnings_median_10yr != null
              ? `$${(r.earnings_median_10yr / 1000).toFixed(1)}k`
              : "—"}
          </span>
          <span
            className="r heat"
            style={{ background: heat(r.median_debt, debtMed, true) }}
          >
            {r.median_debt != null
              ? `$${(r.median_debt / 1000).toFixed(1)}k`
              : "—"}
          </span>
          <span
            className="r heat"
            style={{ background: heat(r.completion_rate_150, compMed) }}
          >
            {r.completion_rate_150 != null
              ? `${(r.completion_rate_150 * 100).toFixed(0)}%`
              : "—"}
          </span>
        </Link>
      ))}
    </div>
  );
}

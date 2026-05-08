import Link from "next/link";

import { InfoTip } from "@/components/site/InfoTip";
import { LANE_METHODOLOGY, LANE_OVERRIDES } from "@/lib/rankingLanes";
import { stateSlug } from "@/lib/state";
import type { RankingTable } from "@/lib/types";

// Per-table caption keyed by `${lane}:${direction}`. Each new ranking page
// can pass its own captions dict; entries fall back to no caption when a
// key isn't present.
export type CaptionMap = Record<string, string>;

interface Props {
  table: RankingTable;
  captions?: CaptionMap;
  // When true, the section uses the alternating tinted background that the
  // institutions page applies to "least"-direction sections.
  tint?: boolean;
  // Optional id override; defaults to `${lane}-${direction}`.
  id?: string;
  // Optional credential prefix in the heading (e.g. "Bachelor's Degree · ").
  // Used by the credentials page to make sub-section headings self-describing.
  headingPrefix?: string;
  // Heading level for the section title. Default h2; per-bucket pages use
  // h3 because the bucket label is itself the h2.
  headingLevel?: 2 | 3;
}

export function ProgramRankingTable({
  table,
  captions,
  tint = false,
  id,
  headingPrefix,
  headingLevel = 2,
}: Props) {
  const isMost = table.direction === "most";
  const override = LANE_OVERRIDES[table.lane];
  const displayLabel = override?.label ?? table.label;
  const tooltip = override?.tooltip;
  const methodologyHref = LANE_METHODOLOGY[table.lane] ?? "/methodology";
  const captionKey = `${table.lane}:${table.direction}`;
  const caption = captions?.[captionKey];
  const Heading: keyof React.JSX.IntrinsicElements =
    headingLevel === 3 ? "h3" : "h2";
  const headingFontSize =
    headingLevel === 3
      ? "clamp(20px,2vw,26px)"
      : "clamp(24px,2.6vw,34px)";

  return (
    <section
      className={`section ${tint ? "section-tint" : ""}`}
      id={id ?? `${table.lane}-${table.direction}`}
    >
      <div className="wrap">
        <div style={{ marginBottom: 24 }}>
          <div className="eyebrow">
            {isMost ? "Top 10 highest" : "Top 10 lowest"}
          </div>
          <Heading
            className="h-display"
            style={{ fontSize: headingFontSize, margin: "8px 0 0" }}
          >
            {headingPrefix ? <span>{headingPrefix}</span> : null}
            {displayLabel} <span className="muted">({table.units})</span>
            {tooltip ? (
              <InfoTip
                heading={tooltip.heading}
                body={tooltip.body}
                ariaLabel={`About ${displayLabel}`}
              />
            ) : null}
          </Heading>
          {caption ? (
            <p
              className="muted"
              style={{ fontSize: 14, marginTop: 10, maxWidth: "62ch" }}
            >
              {caption}
            </p>
          ) : null}
          <p className="muted" style={{ margin: "8px 0 0", fontSize: 13 }}>
            <Link href={methodologyHref}>Methodology &rarr;</Link>
          </p>
        </div>
        <table className="tbl">
          <caption className="sr-only">
            Programs ranked by {displayLabel.toLowerCase()} ({table.units}),{" "}
            {isMost ? "highest first" : "lowest first"}.
          </caption>
          <thead>
            <tr>
              <th scope="col" style={{ width: 60 }}>
                #
              </th>
              <th scope="col">Program</th>
              <th scope="col">Credential</th>
              <th scope="col">Institution</th>
              <th scope="col">State</th>
              <th scope="col" className="right">
                Completers
              </th>
              <th scope="col" className="right">
                {displayLabel}
              </th>
            </tr>
          </thead>
          <tbody>
            {table.rows.map((r) => {
              const instHref = r.institution_slug
                ? `/state/${stateSlug(r.state)}/institution/${r.institution_slug}/`
                : null;
              return (
                <tr key={`${r.state}/${r.institution_slug ?? ""}/${r.slug}`}>
                  <td className="num-mono">{r.rank}</td>
                  <td className="name">{r.name}</td>
                  <td>{r.credential_desc ?? "—"}</td>
                  <td className="name">
                    {instHref ? (
                      <Link href={instHref}>
                        {r.institution_name ?? "—"}
                      </Link>
                    ) : (
                      r.institution_name ?? "—"
                    )}
                  </td>
                  <td>{r.state_label}</td>
                  <td className="right num-mono">
                    {r.completers != null && r.completers > 0
                      ? r.completers.toLocaleString()
                      : "—"}
                  </td>
                  <td className="right num-mono">
                    {r.value_label}
                    {r.pooled_earnings ? (
                      <span
                        title="Earnings pooled with parent OPEID — see methodology"
                        style={{
                          marginLeft: 6,
                          fontSize: 11,
                          padding: "1px 6px",
                          borderRadius: 4,
                          background: "var(--bg-3)",
                          color: "var(--fg-3)",
                          fontFamily: "var(--font-mono)",
                        }}
                      >
                        pooled
                      </span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

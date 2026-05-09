import Crumbs from "@/components/Crumbs";
import { JumpStrip } from "@/components/site/JumpStrip";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { loadMethodology } from "@/lib/data";

export const metadata = {
  title: "Methodology",
  description:
    "Sources, suppression rules, and editorial discipline for College Grad Analyst.",
};

export default function MethodologyPage() {
  const m = loadMethodology();

  return (
    <>
      <SiteHeader active="method" />
      <Crumbs items={[{ label: "Home", href: "/" }, { label: "Methodology" }]} />
      <JumpStrip
        items={m.sections.map((s) => ({ id: s.id, label: s.heading }))}
      />
      <main>

      <section className="city-header">
        <div className="wrap">
          <div className="eyebrow">
            Methodology · vintage {m.source.vintage} · retrieved{" "}
            {m.source.retrieved}
          </div>
          <h1>{m.title}</h1>
          <p className="lede" style={{ marginTop: 18, maxWidth: "62ch" }}>
            What the numbers are, where they come from, what they don&apos;t
            claim, and why we render some cells as em-dashes.
          </p>
          <div className="byline">
            <span className="meta-mono">
              SOURCE · {m.source.name.toUpperCase()}
            </span>
            <span className="meta-mono">
              VINTAGE · {m.source.vintage.toUpperCase()} · RETRIEVED{" "}
              {m.source.retrieved.toUpperCase()}
            </span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <article
            style={{
              maxWidth: 700,
              fontSize: 16,
              lineHeight: 1.7,
              color: "var(--fg-2)",
            }}
          >
            {m.sections.map((s) => (
              <section key={s.id} id={s.id} style={{ marginBottom: 36 }}>
                <h2
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 600,
                    fontSize: 22,
                    letterSpacing: "-0.01em",
                    margin: "0 0 12px",
                    color: "var(--fg)",
                  }}
                >
                  {s.heading}
                </h2>
                <p style={{ margin: 0, color: "var(--fg-2)" }}>{s.body}</p>
              </section>
            ))}
          </article>
        </div>
      </section>

      </main>
      <SiteFooter vintageLabel={m.source.vintage} />
    </>
  );
}

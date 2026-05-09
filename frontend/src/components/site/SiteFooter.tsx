import Link from "next/link";

import { Brand } from "./Brand";

export function SiteFooter({ vintageLabel }: { vintageLabel?: string }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <div className="footer-grid">
          <div className="f-brand">
            <Brand small />
            <p>
              Federal earnings, debt, and completion data — surfaced per
              institution and per program.
            </p>
            <div className="meta-mono" style={{ color: "var(--fg-4)" }}>
              FED. SOURCED · IPEDS · COLLEGE SCORECARD · TREASURY
            </div>
          </div>
          <nav className="col" aria-label="Rankings">
            <p className="col-title">Rankings</p>
            <Link href="/rankings/states/">States</Link>
            <Link href="/rankings/cities/">Cities</Link>
            <Link href="/rankings/institutions/">Institutions</Link>
          </nav>
          <nav className="col" aria-label="Methodology">
            <p className="col-title">Method</p>
            <Link href="/methodology">Methodology overview</Link>
            <Link href="/methodology#suppression">Suppression rules</Link>
            <Link href="/methodology#earnings">Earnings cohorts</Link>
          </nav>
        </div>
        <div className="f-bot">
          <span className="meta-mono">
            COLLEGE GRAD ANALYST · v0.1
            {vintageLabel ? ` · ${vintageLabel.toUpperCase()}` : ""}
          </span>
          <span className="meta-mono">
            DATA SHIP CADENCE · ANNUAL · NEXT VINTAGE SEPT {new Date().getFullYear()}
          </span>
        </div>
      </div>
    </footer>
  );
}

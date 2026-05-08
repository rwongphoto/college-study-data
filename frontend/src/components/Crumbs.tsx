import Link from "next/link";

export type Crumb = { label: string; href?: string };

// Sitewide breadcrumbs. Wrapped to align with the site grid (.wrap).
// Last item has no href and renders as the "you are here" element.
export default function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="wrap" aria-label="Breadcrumb">
      <div className="crumbs">
        {items.map((c, i) => (
          <span key={i}>
            {i > 0 && (
              <span className="sep" aria-hidden="true">
                /
              </span>
            )}
            {c.href ? (
              <Link href={c.href}>{c.label}</Link>
            ) : (
              <span className="cur" aria-current="page">
                {c.label}
              </span>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}

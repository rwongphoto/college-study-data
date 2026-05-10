// Sticky in-page navigation strip — sits just below SiteHeader and lists
// the page's major sections as anchor links. Items are filtered by `show`
// so pages can pass a static list and conditionally hide entries that
// won't render for the current data shape.
//
// `variant="block"` switches to a non-sticky multi-column grid for pages
// with too many sections to fit on one horizontal line (e.g. /rankings/fields).

export type JumpItem = {
  id: string;
  label: string;
  show?: boolean;
};

export function JumpStrip({
  items,
  variant = "strip",
}: {
  items: JumpItem[];
  variant?: "strip" | "block";
}) {
  const visible = items.filter((it) => it.show !== false);
  if (visible.length === 0) return null;
  if (variant === "block") {
    return (
      <nav className="jump-block" aria-label="Jump to section">
        <div className="wrap">
          <span className="jump-block-label">Jump to</span>
          <ul>
            {visible.map((it) => (
              <li key={it.id}>
                <a href={`#${it.id}`}>{it.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    );
  }
  return (
    <nav className="jump-strip" aria-label="Jump to section">
      <div className="wrap">
        <span className="jump-strip-label">Jump to</span>
        <ul>
          {visible.map((it) => (
            <li key={it.id}>
              <a href={`#${it.id}`}>{it.label}</a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

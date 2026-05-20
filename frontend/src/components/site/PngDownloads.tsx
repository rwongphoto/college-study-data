"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const PROCESSED_ATTR = "data-png-processed";

// One button per shareable data module — tables, the div-based rank table,
// stat-tile grids, ranked-bar lists, card grids, flag/long-arc grids, and
// any element opted in with `data-pngable` (figure groups, debt-ratio
// groups, the standalone earnings figure). Each is a block-level child of
// its section's content well, so the button sits cleanly above it.
const MODULE_SEL = [
  "table.tbl",
  ".rank-table",
  ".data-tiles",
  ".prog-rank",
  ".prog-grid",
  ".cities-grid",
  ".flag-grid",
  "[data-pngable]",
].join(", ");

// Theme palette, read from the live CSS variables at capture time so the
// export matches whichever theme (light/dark) the visitor is viewing.
// Defaults are the dark-theme values.
let BG = "#0E1116";
let FG = "#E8ECF2";
let FG_2 = "#BFC6D4";
let FG_3 = "#8A93A6";
let LINE = "#2A3142";
let AMBER = "#E6B450";

function refreshPalette(el: Element) {
  const cs = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    cs.getPropertyValue(name).trim() || fallback;
  FG = read("--fg", FG);
  FG_2 = read("--fg-2", FG_2);
  FG_3 = read("--fg-3", FG_3);
  LINE = read("--line", LINE);
  AMBER = read("--amber", AMBER);
  // Section background: tinted sections carry a real colour; plain sections
  // are transparent, so fall back to the page background variable.
  const section = el.closest("section");
  let bg = section ? getComputedStyle(section).backgroundColor : "";
  if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") {
    bg = read("--bg", BG);
  }
  BG = bg;
}

// Mounts once at the root layout. On hydration it scans the DOM for
// shareable modules and injects a "DOWNLOAD PNG" button above each.
// Clicking rasterises the target with html2canvas-pro and composites a
// self-contained PNG: title (nearest heading), snapshot, divider, College
// Grad Analyst brand mark, and page URL.
export function PngDownloads() {
  // Re-scan on every client-side navigation. This component lives in the
  // root layout and mounts only once, so without keying the effect on the
  // pathname a soft navigation would render a new page whose modules never
  // get buttons — until a full reload remounted the effect.
  const pathname = usePathname();
  useEffect(() => {
    let cancelled = false;

    const attach = () => {
      if (cancelled) return;
      document
        .querySelectorAll<HTMLElement>(`main :is(${MODULE_SEL})`)
        .forEach((el) => attachButton(el));
    };

    attach();
    // Some modules (ROI calculator, jump strips) hydrate a frame or two
    // after first paint; re-scan as a safety net.
    const t1 = window.setTimeout(attach, 300);
    const t2 = window.setTimeout(attach, 1200);

    return () => {
      cancelled = true;
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pathname]);

  return null;
}

function attachButton(el: Element) {
  if (el.hasAttribute(PROCESSED_ATTR)) return;
  // Skip a module nested inside another already-flagged module so a
  // data-pngable group and a table inside it don't both get a button.
  if (el.parentElement?.closest(`[${PROCESSED_ATTR}]`)) return;
  el.setAttribute(PROCESSED_ATTR, "1");

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "png-export-btn";
  btn.setAttribute("aria-label", "Download as PNG");
  btn.title = "Download as PNG";
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg><span>Download PNG</span>`;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    void downloadPng(el, btn);
  });

  // Sits as the module's preceding sibling — above the block, outside the
  // captured element, never disrupting a grid's internal layout.
  el.parentNode?.insertBefore(btn, el);
}

async function downloadPng(el: Element, btn: HTMLButtonElement) {
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "<span>Rendering…</span>";

  // Hide every export button so none appear in the snapshot.
  const allBtns = Array.from(
    document.querySelectorAll<HTMLElement>(".png-export-btn"),
  );
  const prevDisplay = allBtns.map((b) => b.style.display);
  allBtns.forEach((b) => (b.style.display = "none"));

  try {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    refreshPalette(el);

    const mod = await import("html2canvas-pro");
    const html2canvas = mod.default;

    const snapshot = await html2canvas(el as HTMLElement, {
      backgroundColor: BG,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const title = findNearestHeading(el) ?? "College Grad Analyst";
    const final = await composeFinal(snapshot, title, window.location.href);
    const filename = sanitizeFilename(title) + ".png";
    final.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke after a tick so Safari has time to start the download.
      window.setTimeout(() => URL.revokeObjectURL(url), 1500);
    }, "image/png");
  } catch (err) {
    console.error("PNG export failed", err);
  } finally {
    allBtns.forEach((b, i) => (b.style.display = prevDisplay[i]));
    btn.disabled = false;
    btn.innerHTML = original;
  }
}

function findNearestHeading(el: Element): string | null {
  // Walk up to a section/article/main and pick the first h1/h2/h3 that
  // precedes the element in document order. Falls back to the document <h1>.
  let scope: Element | null = el.parentElement;
  while (scope) {
    const tag = scope.tagName.toLowerCase();
    if (tag === "section" || tag === "article" || tag === "main") break;
    scope = scope.parentElement;
  }
  const root = scope ?? document.body;
  const headings = root.querySelectorAll<HTMLElement>("h1, h2, h3");
  let best: string | null = null;
  for (const h of Array.from(headings)) {
    const pos = el.compareDocumentPosition(h);
    const before = (pos & Node.DOCUMENT_POSITION_PRECEDING) !== 0;
    if (before || h.contains(el)) {
      best = headingText(h) || best;
    }
  }
  if (!best) {
    const h1 = document.querySelector<HTMLElement>("h1");
    best = h1 ? headingText(h1) : null;
  }
  return best;
}

// Visible heading text only — strips embedded InfoTips so a hidden tooltip
// body (and its "i" icon) doesn't bleed into the PNG title.
function headingText(h: HTMLElement): string {
  const clone = h.cloneNode(true) as HTMLElement;
  clone
    .querySelectorAll(".info-tip, [role='tooltip']")
    .forEach((n) => n.remove());
  return (clone.textContent ?? "").replace(/\s+/g, " ").trim();
}

function sanitizeFilename(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "college-grad-analyst"
  );
}

async function composeFinal(
  snapshot: HTMLCanvasElement,
  title: string,
  pageUrl: string,
): Promise<HTMLCanvasElement> {
  const scale = 2;
  const padX = 32 * scale;
  const padTop = 28 * scale;
  const titleSize = 22 * scale;
  const titleGap = 24 * scale;
  const footerGap = 24 * scale;
  const footerH = 56 * scale;

  // Cap the snapshot width so very wide tables don't blow out the PNG.
  const maxSnapW = 2400; // device pixels
  const drawSnapW = Math.min(snapshot.width, maxSnapW);
  const drawSnapH = (snapshot.height * drawSnapW) / snapshot.width;

  const finalW = drawSnapW + padX * 2;
  const finalH =
    padTop + titleSize + titleGap + drawSnapH + footerGap + footerH;

  const canvas = document.createElement("canvas");
  canvas.width = finalW;
  canvas.height = finalH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return snapshot;

  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, finalW, finalH);

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = FG;
  ctx.font = `600 ${titleSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
  drawWrappedText(
    ctx,
    title,
    padX,
    padTop + titleSize,
    finalW - padX * 2,
    titleSize * 1.25,
    2,
  );

  ctx.drawImage(
    snapshot,
    padX,
    padTop + titleSize + titleGap,
    drawSnapW,
    drawSnapH,
  );

  // Divider above footer.
  const footerY = padTop + titleSize + titleGap + drawSnapH + footerGap;
  ctx.strokeStyle = LINE;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(padX, footerY);
  ctx.lineTo(finalW - padX, footerY);
  ctx.stroke();

  // Footer: brand mark + name (left), URL (right).
  await drawBrandFooter(ctx, padX, footerY + 8 * scale, scale);
  drawFooterRight(ctx, pageUrl, finalW - padX, footerY + 8 * scale, scale);

  return canvas;
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    const next = current ? current + " " + w : w;
    if (ctx.measureText(next).width <= maxWidth) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = w;
      if (lines.length >= maxLines) break;
    }
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (lines.length === maxLines) {
    const last = lines[maxLines - 1];
    const remaining = words.slice(words.indexOf(last.split(" ").pop()!) + 1);
    if (remaining.length > 0) {
      let truncated = last;
      while (
        ctx.measureText(truncated + "…").width > maxWidth &&
        truncated.length > 0
      ) {
        truncated = truncated.slice(0, -1);
      }
      lines[maxLines - 1] = truncated + "…";
    }
  }
  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * lineHeight);
  });
}

async function drawBrandFooter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  scale: number,
) {
  const markH = 32 * scale;
  const markW = markH * (64 / 56); // mortarboard viewBox is 64×56
  const img = await loadBrandMark(markW, markH);
  ctx.drawImage(img, x, y, markW, markH);

  const labelX = x + markW + 10 * scale;
  ctx.fillStyle = FG;
  ctx.font = `600 ${15 * scale}px Inter, -apple-system, sans-serif`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("College Grad Analyst", labelX, y + markH / 2 + 1 * scale);

  ctx.fillStyle = FG_3;
  ctx.font = `500 ${10 * scale}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.fillText("COLLEGEGRADANALYST.COM", labelX, y + markH / 2 + 16 * scale);
}

function drawFooterRight(
  ctx: CanvasRenderingContext2D,
  pageUrl: string,
  rightX: number,
  y: number,
  scale: number,
) {
  let display = pageUrl;
  try {
    const u = new URL(pageUrl);
    display = u.host + u.pathname;
  } catch {
    /* keep raw */
  }
  display = display.replace(/\/$/, "");

  ctx.textAlign = "right";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = FG_2;
  ctx.font = `500 ${11 * scale}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.fillText("SOURCE", rightX, y + 14 * scale);
  ctx.fillStyle = FG;
  ctx.font = `500 ${12 * scale}px "JetBrains Mono", ui-monospace, monospace`;
  // Truncate long URLs from the left so the most specific path stays visible.
  const maxW = 600 * scale;
  let trimmed = display;
  while (ctx.measureText(trimmed).width > maxW && trimmed.length > 4) {
    trimmed = trimmed.slice(1);
  }
  if (trimmed !== display) trimmed = "…" + trimmed.slice(1);
  ctx.fillText(trimmed, rightX, y + 30 * scale);
  ctx.textAlign = "start";
}

let cachedBrandImg: { key: string; img: HTMLImageElement } | null = null;

// Mortarboard with amber tassel — the CollegeMark from Brand.tsx, with its
// CSS-variable fills baked to the current theme's resolved colours so the
// rasterised SVG carries colour without a :root context.
function loadBrandMark(w: number, h: number): Promise<HTMLImageElement> {
  const key = `${w}x${h}:${FG}:${AMBER}:${BG}`;
  if (cachedBrandImg && cachedBrandImg.key === key) {
    return Promise.resolve(cachedBrandImg.img);
  }
  return new Promise((resolve, reject) => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 56" width="${w}" height="${h}">
  <path d="M16 26 Q16 40 22 42 L42 42 Q48 40 48 26 Z" fill="${FG}"/>
  <path d="M32 6 L58 18 L32 30 L6 18 Z" fill="${FG}"/>
  <circle cx="32" cy="18" r="1.6" fill="${BG}"/>
  <path d="M32 18 Q44 18 49 25" fill="none" stroke="${AMBER}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="49" cy="27" r="2.2" fill="${AMBER}"/>
  <path d="M47 29 L47 38 M49 29 L49 39 M51 29 L51 38" stroke="${AMBER}" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M48 22 q10 8 10 18" fill="none" stroke="${AMBER}" stroke-width="2"/>
  <circle cx="58" cy="42" r="4" fill="${AMBER}"/>
  <circle cx="58" cy="42" r="2" fill="${BG}"/>
</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      cachedBrandImg = { key, img };
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

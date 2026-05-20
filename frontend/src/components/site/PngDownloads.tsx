"use client";

import { useEffect } from "react";

const PROCESSED_ATTR = "data-png-processed";

// Selectors that mark a <section> as holding shareable data. A download
// button is injected only into sections matching at least one of these, so
// prose / call-to-action sections (the hero, the methodology promo) stay
// button-free.
const DATA_MODULE_SEL = [
  "table.tbl",
  ".rank-table",
  ".figure-frame",
  ".data-tiles",
  ".prog-rank",
  ".prog-grid",
  ".cities-grid",
  ".flag-grid",
  ".flag-row",
  ".dr-card",
  ".roi-card",
  "svg[role='img']",
].join(", ");

// Mounts once at the root layout. On hydration it scans every <main>
// section and, for each one that holds a data module — and isn't a hero or
// the methodology call-to-action — injects a "DOWNLOAD PNG" button at the
// top of the section's content well. Clicking rasterises that well (.wrap)
// with html2canvas-pro and composites a self-contained, theme-matched PNG:
// the section exactly as rendered (kicker, heading, charts/tables/tiles), a
// divider, the College Grad Analyst brand mark, and the page URL. Colours
// are read from the live CSS variables at capture time, so the export
// matches whichever theme (light/dark) the visitor is viewing.
export function PngDownloads() {
  useEffect(() => {
    let cancelled = false;

    const attach = () => {
      if (cancelled) return;
      document
        .querySelectorAll<HTMLElement>("main section")
        .forEach((section) => {
          if (section.hasAttribute(PROCESSED_ATTR)) return;
          if (shouldSkip(section)) return;
          const well = section.querySelector<HTMLElement>(
            ".wrap, .wrap-narrow, .wrap-wide",
          );
          if (!well) return;
          if (!section.querySelector(DATA_MODULE_SEL)) return;
          section.setAttribute(PROCESSED_ATTR, "1");
          attachButton(well);
        });
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
  }, []);

  return null;
}

function shouldSkip(section: HTMLElement): boolean {
  return (
    section.classList.contains("city-header") ||
    section.classList.contains("home-hero") ||
    section.querySelector(".method-promo") != null
  );
}

function attachButton(well: HTMLElement) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "png-export-btn";
  btn.setAttribute("aria-label", "Download this section as a PNG");
  btn.title = "Download this section as a PNG";
  btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg><span>Download PNG</span>`;
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    void downloadPng(well, btn);
  });
  // First child of the content well: appears above the section heading and,
  // because every export button is hidden during capture, never lands in
  // the PNG itself.
  well.insertBefore(btn, well.firstChild);
}

type Theme = {
  bg: string;
  fg: string;
  fg2: string;
  fg3: string;
  line: string;
  amber: string;
};

// Resolve the active theme's colours from the live CSS variables. The
// section background is read from the section itself (tinted sections carry
// a real colour); plain sections are transparent, so fall back to the page
// background variable.
function readTheme(section: HTMLElement): Theme {
  const root = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) =>
    root.getPropertyValue(name).trim() || fallback;

  let bg = getComputedStyle(section).backgroundColor;
  if (!bg || bg === "transparent" || bg === "rgba(0, 0, 0, 0)") {
    bg = v("--bg", "#0E1116");
  }
  return {
    bg,
    fg: v("--fg", "#E8ECF2"),
    fg2: v("--fg-2", "#BFC6D4"),
    fg3: v("--fg-3", "#8A93A6"),
    line: v("--line", "#2A3142"),
    amber: v("--amber", "#E6B450"),
  };
}

async function downloadPng(well: HTMLElement, btn: HTMLButtonElement) {
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

    const section = (well.closest("section") as HTMLElement | null) ?? well;
    const theme = readTheme(section);

    const mod = await import("html2canvas-pro");
    const html2canvas = mod.default;

    const snapshot = await html2canvas(well, {
      backgroundColor: theme.bg,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const title = findSectionTitle(well);
    const final = await composeFinal(snapshot, theme, window.location.href);
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

// Section heading drives the download filename. The heading is already part
// of the captured well, so it's not redrawn in the composite.
function findSectionTitle(well: HTMLElement): string {
  const h = well.querySelector<HTMLElement>("h1, h2, h3");
  const t = h ? (h.textContent ?? "").replace(/\s+/g, " ").trim() : "";
  if (t) return t;
  const h1 = document.querySelector<HTMLElement>("h1");
  return (h1?.textContent ?? "College Grad Analyst")
    .replace(/\s+/g, " ")
    .trim();
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
  theme: Theme,
  pageUrl: string,
): Promise<HTMLCanvasElement> {
  const scale = 2;
  const padX = 28 * scale;
  const padTop = 28 * scale;
  const footerGap = 22 * scale;
  const footerH = 52 * scale;

  // Cap snapshot width so very wide tables don't blow out the PNG.
  const maxSnapW = 2400; // device pixels
  const drawSnapW = Math.min(snapshot.width, maxSnapW);
  const drawSnapH = (snapshot.height * drawSnapW) / snapshot.width;

  const finalW = drawSnapW + padX * 2;
  const finalH = padTop + drawSnapH + footerGap + footerH;

  const canvas = document.createElement("canvas");
  canvas.width = finalW;
  canvas.height = finalH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return snapshot;

  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, finalW, finalH);

  ctx.drawImage(snapshot, padX, padTop, drawSnapW, drawSnapH);

  // Divider above footer.
  const footerY = padTop + drawSnapH + footerGap;
  ctx.strokeStyle = theme.line;
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(padX, footerY);
  ctx.lineTo(finalW - padX, footerY);
  ctx.stroke();

  // Footer: brand mark + name (left), source URL (right).
  await drawBrandFooter(ctx, theme, padX, footerY + 8 * scale, scale);
  drawFooterRight(ctx, theme, pageUrl, finalW - padX, footerY + 8 * scale, scale);

  return canvas;
}

async function drawBrandFooter(
  ctx: CanvasRenderingContext2D,
  theme: Theme,
  x: number,
  y: number,
  scale: number,
) {
  const markH = 30 * scale;
  const markW = markH * (64 / 56); // mortarboard viewBox is 64×56
  const img = await loadBrandMark(markW, markH, theme);
  ctx.drawImage(img, x, y, markW, markH);

  const labelX = x + markW + 10 * scale;
  ctx.fillStyle = theme.fg;
  ctx.font = `600 ${15 * scale}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText("College Grad Analyst", labelX, y + markH / 2);

  ctx.fillStyle = theme.fg3;
  ctx.font = `500 ${10 * scale}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.fillText("COLLEGEGRADANALYST.COM", labelX, y + markH / 2 + 15 * scale);
}

function drawFooterRight(
  ctx: CanvasRenderingContext2D,
  theme: Theme,
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
  ctx.fillStyle = theme.fg2;
  ctx.font = `500 ${10 * scale}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.fillText("SOURCE", rightX, y + 13 * scale);

  ctx.fillStyle = theme.fg;
  ctx.font = `500 ${12 * scale}px "JetBrains Mono", ui-monospace, monospace`;
  // Truncate long URLs from the left so the most specific path stays visible.
  const maxW = 620 * scale;
  let trimmed = display;
  while (ctx.measureText(trimmed).width > maxW && trimmed.length > 4) {
    trimmed = trimmed.slice(1);
  }
  if (trimmed !== display) trimmed = "…" + trimmed.slice(1);
  ctx.fillText(trimmed, rightX, y + 29 * scale);
  ctx.textAlign = "start";
}

let cachedMark: { key: string; img: HTMLImageElement } | null = null;

// Mortarboard with amber tassel — the CollegeMark from Brand.tsx, with its
// CSS-variable fills baked to the current theme's resolved colours so the
// rasterised SVG carries colour without a :root context.
function loadBrandMark(
  w: number,
  h: number,
  theme: Theme,
): Promise<HTMLImageElement> {
  const key = `${w}x${h}:${theme.fg}:${theme.amber}:${theme.bg}`;
  if (cachedMark && cachedMark.key === key) {
    return Promise.resolve(cachedMark.img);
  }
  return new Promise((resolve, reject) => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 56" width="${w}" height="${h}">
  <path d="M16 26 Q16 40 22 42 L42 42 Q48 40 48 26 Z" fill="${theme.fg}"/>
  <path d="M32 6 L58 18 L32 30 L6 18 Z" fill="${theme.fg}"/>
  <circle cx="32" cy="18" r="1.6" fill="${theme.bg}"/>
  <path d="M32 18 Q44 18 49 25" fill="none" stroke="${theme.amber}" stroke-width="2" stroke-linecap="round"/>
  <circle cx="49" cy="27" r="2.2" fill="${theme.amber}"/>
  <path d="M47 29 L47 38 M49 29 L49 39 M51 29 L51 38" stroke="${theme.amber}" stroke-width="1.6" stroke-linecap="round"/>
  <path d="M48 22 q10 8 10 18" fill="none" stroke="${theme.amber}" stroke-width="2"/>
  <circle cx="58" cy="42" r="4" fill="${theme.amber}"/>
  <circle cx="58" cy="42" r="2" fill="${theme.bg}"/>
</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      cachedMark = { key, img };
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

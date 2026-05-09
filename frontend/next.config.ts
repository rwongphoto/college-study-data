import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  outputFileTracingRoot: path.join(__dirname, ".."),
  // Bundle only the small artifacts. The big trees (program/, institution/,
  // city/) are served as static CDN assets from public/data — see
  // scripts/prebuild.mjs and src/lib/data.ts.
  outputFileTracingIncludes: {
    "/**": [
      "../data/published/home.json",
      "../data/published/rankings.json",
      "../data/published/methodology.json",
      "../data/published/roi_constants.json",
      "../data/published/_manifest.json",
      "../data/published/state/**",
    ],
  },
  turbopack: {
    // src/lib/data.ts reads per-page JSON artifacts from ../data/published.
    // Turbopack 16.2 traces those dynamic fs paths and warns about broad
    // patterns. Suppress the noise — loaders run server-side at request time
    // and during ISR regen; the JSON is not bundled into client output.
    ignoreIssue: [{ path: "**/src/lib/data.ts" }],
  },
};

export default nextConfig;

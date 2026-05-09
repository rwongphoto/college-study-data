import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  outputFileTracingRoot: path.join(__dirname, ".."),
  outputFileTracingIncludes: {
    "/**": ["../data/published/**"],
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

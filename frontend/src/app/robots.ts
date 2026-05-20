import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    // Index fans out to the Next-generated core sitemap (/sitemap.xml) plus the
    // per-state program sitemaps emitted by scripts/prebuild.mjs.
    sitemap: `${SITE_URL}/sitemap-index.xml`,
    host: SITE_URL,
  };
}

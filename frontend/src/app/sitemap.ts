import type { MetadataRoute } from "next";

import { listCities, listInstitutions, listStates } from "@/lib/data";
import { stateSlug } from "@/lib/state";

const SITE_URL =
  process.env.SITE_URL ?? "https://collegedataanalyst.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/methodology/`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/rankings/institutions/`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/rankings/cities/`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/rankings/states/`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/rankings/programs/`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/rankings/credentials/`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/rankings/fields/`, changeFrequency: "weekly", priority: 0.7 },
  ];

  for (const abbr of listStates()) {
    const stateUrlPart = stateSlug(abbr);
    entries.push({
      url: `${SITE_URL}/state/${stateUrlPart}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
    for (const city of listCities(abbr)) {
      entries.push({
        url: `${SITE_URL}/state/${stateUrlPart}/city/${city}/`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
    for (const inst of listInstitutions(abbr)) {
      entries.push({
        url: `${SITE_URL}/state/${stateUrlPart}/institution/${inst}/`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  return entries;
}

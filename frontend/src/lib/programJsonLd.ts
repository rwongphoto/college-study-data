import { SITE_URL } from "./seo";
import type { ProgramPayload } from "./types";

export interface ProgramJsonLdInput {
  pageUrl: string;
  stateName: string;
  stateSlug: string;
  program: ProgramPayload;
  description: string;
}

export function buildProgramJsonLd(input: ProgramJsonLdInput) {
  const { pageUrl, stateName, stateSlug, program: p, description } = input;
  const stateUrl = `${SITE_URL}/state/${stateSlug}/`;
  const institutionUrl = `${stateUrl}institution/${p.institution_slug}/`;
  const cityUrl = `${stateUrl}city/${p.institution.city_slug}/`;
  const programName = `${p.cip_desc.replace(/\.$/, "")} (${p.credential_desc}) at ${p.institution_name.replace(/\.$/, "")}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: stateName, item: stateUrl },
          { "@type": "ListItem", position: 3, name: p.institution.city, item: cityUrl },
          { "@type": "ListItem", position: 4, name: p.institution_name, item: institutionUrl },
          { "@type": "ListItem", position: 5, name: p.cip_desc.replace(/\.$/, ""), item: pageUrl },
        ],
      },
      {
        "@type": "EducationalOccupationalProgram",
        "@id": `${pageUrl}#program`,
        name: programName,
        description,
        url: pageUrl,
        educationalCredentialAwarded: p.credential_desc,
        identifier: [
          { "@type": "PropertyValue", propertyID: "CIP", value: p.cip_code },
          { "@type": "PropertyValue", propertyID: "CREDLEV", value: String(p.credential_level) },
        ],
        provider: {
          "@type": "CollegeOrUniversity",
          "@id": `${institutionUrl}#institution`,
          name: p.institution_name,
          url: institutionUrl,
          address: {
            "@type": "PostalAddress",
            addressLocality: p.institution.city,
            addressRegion: p.state.toUpperCase(),
            addressCountry: "US",
          },
          identifier: {
            "@type": "PropertyValue",
            propertyID: "IPEDS UNITID",
            value: p.institution_unitid,
          },
        },
      },
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: programName,
        description,
        inLanguage: "en-US",
        about: { "@id": `${pageUrl}#program` },
        isPartOf: {
          "@type": "WebSite",
          "@id": `${SITE_URL}/`,
          name: "College Grad Analyst",
        },
        publisher: {
          "@type": "Organization",
          name: "College Grad Analyst",
          url: SITE_URL,
        },
      },
    ],
  };
}

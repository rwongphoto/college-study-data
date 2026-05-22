import { SITE_URL } from "./seo";
import type { Institution, ProgramRow } from "./types";

export interface InstitutionJsonLdInput {
  pageUrl: string;
  stateName: string;
  stateSlug: string;
  institution: Institution;
  description: string;
  programs?: ProgramRow[];
}

export function buildInstitutionJsonLd(input: InstitutionJsonLdInput) {
  const {
    pageUrl,
    stateName,
    stateSlug,
    institution: i,
    description,
    programs = [],
  } = input;
  const stateUrl = `${SITE_URL}/state/${stateSlug}/`;
  const cityUrl = `${stateUrl}city/${i.city_slug}/`;
  const collegeId = `${pageUrl}#institution`;

  const address: Record<string, string> = {
    "@type": "PostalAddress",
    addressLocality: i.city,
    addressRegion: i.state.toUpperCase(),
    addressCountry: "US",
  };
  if (i.address) address.streetAddress = i.address;
  if (i.zip5) address.postalCode = i.zip5;

  const college: Record<string, unknown> = {
    "@type": "CollegeOrUniversity",
    "@id": collegeId,
    name: i.name,
    url: pageUrl,
    address,
    identifier: [
      { "@type": "PropertyValue", propertyID: "IPEDS UNITID", value: i.unitid },
      ...(i.opeid6
        ? [{ "@type": "PropertyValue", propertyID: "OPEID6", value: i.opeid6 }]
        : []),
    ],
  };
  if (i.latitude != null && i.longitude != null) {
    college.geo = {
      "@type": "GeoCoordinates",
      latitude: i.latitude,
      longitude: i.longitude,
    };
  }

  const courses = programs.map((p) => {
    const courseName = `${p.cip_desc.replace(/\.$/, "")} - ${p.credential_desc}`;
    return {
      "@type": "Course",
      name: courseName,
      description: `Federal-data outcomes for the ${courseName} program at ${i.name}, including post-graduation earnings, debt, and completion.`,
      url: `${pageUrl}program/${p.slug}/`,
      provider: {
        "@type": "CollegeOrUniversity",
        name: i.name,
        "@id": collegeId,
        url: pageUrl,
      },
    };
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/`,
        name: "College Grad Analyst",
        url: `${SITE_URL}/`,
        description:
          "Federal earnings, debt, and completion data — surfaced per institution and per program.",
        logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: stateName, item: stateUrl },
          { "@type": "ListItem", position: 3, name: i.city, item: cityUrl },
          { "@type": "ListItem", position: 4, name: i.name, item: pageUrl },
        ],
      },
      college,
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: `${i.name} · ${i.city}, ${i.state.toUpperCase()}`,
        description,
        inLanguage: "en-US",
        about: { "@id": collegeId },
        isPartOf: {
          "@type": "WebSite",
          "@id": `${SITE_URL}/`,
          name: "College Grad Analyst",
        },
        publisher: {
          "@type": "Organization",
          "@id": `${SITE_URL}/`,
          name: "College Grad Analyst",
          url: SITE_URL,
        },
      },
      ...courses,
    ],
  };
}

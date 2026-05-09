import { SITE_URL } from "./seo";

export interface StateJsonLdInput {
  pageUrl: string;
  stateName: string;
  institutionCount: number;
  programCount: number;
  vintage: string;
  description: string;
}

export function buildStateJsonLd(input: StateJsonLdInput) {
  const { pageUrl, stateName, institutionCount, programCount, vintage, description } = input;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
        headline: `${stateName} Colleges`,
        description,
        image: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
        author: {
          "@type": "Organization",
          name: "College Grad Analyst",
          url: SITE_URL,
        },
        publisher: {
          "@type": "Organization",
          name: "College Grad Analyst",
          url: SITE_URL,
          logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: `${stateName} Colleges`, item: pageUrl },
        ],
      },
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: `${stateName} Colleges | College Grad Analyst`,
        description,
        inLanguage: "en-US",
        isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/`, name: "College Grad Analyst" },
        publisher: {
          "@type": "Organization",
          name: "College Grad Analyst",
          url: SITE_URL,
        },
      },
      {
        "@type": "Place",
        name: stateName,
        containedInPlace: { "@type": "Country", name: "United States" },
        url: pageUrl,
        description,
      },
      {
        "@type": "Dataset",
        "@id": `${pageUrl}#dataset`,
        name: `${stateName} College Outcomes — ${vintage}`,
        description: `Federal outcomes (Treasury earnings, IPEDS completion, College Scorecard debt) for ${institutionCount} Title-IV institutions and ${programCount} programs in ${stateName}, vintage ${vintage}.`,
        keywords: [
          stateName,
          "college outcomes",
          "earnings",
          "completion",
          "debt",
          "Title IV",
          "College Scorecard",
          "IPEDS",
        ],
        license: "https://www.usa.gov/government-works",
        isAccessibleForFree: true,
        creator: {
          "@type": "Organization",
          name: "U.S. Department of Education",
          url: "https://www.ed.gov",
        },
        publisher: {
          "@type": "Organization",
          name: "College Grad Analyst",
          url: SITE_URL,
        },
        spatialCoverage: {
          "@type": "Place",
          name: stateName,
          containedInPlace: { "@type": "Country", name: "United States" },
        },
        url: pageUrl,
        distribution: [
          {
            "@type": "DataDownload",
            encodingFormat: "text/html",
            contentUrl: pageUrl,
          },
        ],
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/`,
        name: "College Grad Analyst",
        url: `${SITE_URL}/`,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.png` },
      },
    ],
  };
}

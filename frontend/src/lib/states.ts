// Static registry of live state hubs. Drives the SiteHeader mega-nav and
// SiteFooter so neither has to read the filesystem at request time.
//
// `slug` is the URL slug used in /state/<slug>/ (full name, e.g. "oregon").
// `abbr` is the postal code (matches data/published/state/<abbr>.json).

export type Region =
  | "Pacific"
  | "Southwest"
  | "Rocky Mountain"
  | "Midwest"
  | "South"
  | "Northeast";

export type LiveState = {
  slug: string;
  abbr: string;
  name: string;
  region: Region;
};

// Display order for the States mega-nav (west → east).
export const REGION_ORDER: readonly Region[] = [
  "Pacific",
  "Southwest",
  "Rocky Mountain",
  "Midwest",
  "South",
  "Northeast",
];

export const LIVE_STATES: LiveState[] = [
  { slug: "alabama", abbr: "AL", name: "Alabama", region: "South" },
  { slug: "alaska", abbr: "AK", name: "Alaska", region: "Pacific" },
  { slug: "arizona", abbr: "AZ", name: "Arizona", region: "Southwest" },
  { slug: "arkansas", abbr: "AR", name: "Arkansas", region: "South" },
  { slug: "california", abbr: "CA", name: "California", region: "Pacific" },
  { slug: "colorado", abbr: "CO", name: "Colorado", region: "Rocky Mountain" },
  { slug: "connecticut", abbr: "CT", name: "Connecticut", region: "Northeast" },
  { slug: "delaware", abbr: "DE", name: "Delaware", region: "South" },
  { slug: "district-of-columbia", abbr: "DC", name: "District of Columbia", region: "South" },
  { slug: "florida", abbr: "FL", name: "Florida", region: "South" },
  { slug: "georgia", abbr: "GA", name: "Georgia", region: "South" },
  { slug: "hawaii", abbr: "HI", name: "Hawaii", region: "Pacific" },
  { slug: "idaho", abbr: "ID", name: "Idaho", region: "Rocky Mountain" },
  { slug: "illinois", abbr: "IL", name: "Illinois", region: "Midwest" },
  { slug: "indiana", abbr: "IN", name: "Indiana", region: "Midwest" },
  { slug: "iowa", abbr: "IA", name: "Iowa", region: "Midwest" },
  { slug: "kansas", abbr: "KS", name: "Kansas", region: "Midwest" },
  { slug: "kentucky", abbr: "KY", name: "Kentucky", region: "South" },
  { slug: "louisiana", abbr: "LA", name: "Louisiana", region: "South" },
  { slug: "maine", abbr: "ME", name: "Maine", region: "Northeast" },
  { slug: "maryland", abbr: "MD", name: "Maryland", region: "South" },
  { slug: "massachusetts", abbr: "MA", name: "Massachusetts", region: "Northeast" },
  { slug: "michigan", abbr: "MI", name: "Michigan", region: "Midwest" },
  { slug: "minnesota", abbr: "MN", name: "Minnesota", region: "Midwest" },
  { slug: "mississippi", abbr: "MS", name: "Mississippi", region: "South" },
  { slug: "missouri", abbr: "MO", name: "Missouri", region: "Midwest" },
  { slug: "montana", abbr: "MT", name: "Montana", region: "Rocky Mountain" },
  { slug: "nebraska", abbr: "NE", name: "Nebraska", region: "Midwest" },
  { slug: "nevada", abbr: "NV", name: "Nevada", region: "Rocky Mountain" },
  { slug: "new-hampshire", abbr: "NH", name: "New Hampshire", region: "Northeast" },
  { slug: "new-jersey", abbr: "NJ", name: "New Jersey", region: "Northeast" },
  { slug: "new-mexico", abbr: "NM", name: "New Mexico", region: "Southwest" },
  { slug: "new-york", abbr: "NY", name: "New York", region: "Northeast" },
  { slug: "north-carolina", abbr: "NC", name: "North Carolina", region: "South" },
  { slug: "north-dakota", abbr: "ND", name: "North Dakota", region: "Rocky Mountain" },
  { slug: "ohio", abbr: "OH", name: "Ohio", region: "Midwest" },
  { slug: "oklahoma", abbr: "OK", name: "Oklahoma", region: "Southwest" },
  { slug: "oregon", abbr: "OR", name: "Oregon", region: "Pacific" },
  { slug: "pennsylvania", abbr: "PA", name: "Pennsylvania", region: "Northeast" },
  { slug: "puerto-rico", abbr: "PR", name: "Puerto Rico", region: "South" },
  { slug: "rhode-island", abbr: "RI", name: "Rhode Island", region: "Northeast" },
  { slug: "south-carolina", abbr: "SC", name: "South Carolina", region: "South" },
  { slug: "south-dakota", abbr: "SD", name: "South Dakota", region: "Rocky Mountain" },
  { slug: "tennessee", abbr: "TN", name: "Tennessee", region: "South" },
  { slug: "texas", abbr: "TX", name: "Texas", region: "Southwest" },
  { slug: "utah", abbr: "UT", name: "Utah", region: "Rocky Mountain" },
  { slug: "vermont", abbr: "VT", name: "Vermont", region: "Northeast" },
  { slug: "virginia", abbr: "VA", name: "Virginia", region: "South" },
  { slug: "washington", abbr: "WA", name: "Washington", region: "Pacific" },
  { slug: "west-virginia", abbr: "WV", name: "West Virginia", region: "South" },
  { slug: "wisconsin", abbr: "WI", name: "Wisconsin", region: "Midwest" },
  { slug: "wyoming", abbr: "WY", name: "Wyoming", region: "Rocky Mountain" },
];

// Regions in REGION_ORDER, omitting any with no live states. Each region's
// states are sorted by name so the column reads alphabetically.
export const LIVE_STATES_BY_REGION: { region: Region; states: LiveState[] }[] =
  REGION_ORDER.flatMap((region) => {
    const states = LIVE_STATES.filter((s) => s.region === region).sort(
      (a, b) => a.name.localeCompare(b.name),
    );
    return states.length ? [{ region, states }] : [];
  });

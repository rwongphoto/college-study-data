// Institution common-name lookup, keyed by IPEDS unitid.
//
// IPEDS official names are authoritative for structured data (JSON-LD), but
// they're hostile to organic search — "University of California-Berkeley"
// loses to "UC Berkeley", "Massachusetts Institute of Technology" loses to
// "MIT". This map supplies the widely-used short name for visible UI
// surfaces (H1, <title>, meta description, table rows, breadcrumbs, body
// copy). JSON-LD continues to use the official name.
//
// Keys are IPEDS unitids (stable across vintages). To add an entry: find
// the institution's unitid in the data files (slugs end with `-{unitid}`)
// and add `"<unitid>": "<common name>"`.

const COMMON_NAMES: Record<string, string> = {
  "100654": "Alabama A&M",                  // Alabama A & M University
  "100724": "Alabama State",                // Alabama State University
  "100751": "Alabama",                      // The University of Alabama
  "100858": "Auburn",                       // Auburn University
  "102377": "Tuskegee",                     // Tuskegee University
  "104151": "ASU",                          // Arizona State University Campus Immersion
  "104179": "Arizona",                      // University of Arizona
  "106397": "Arkansas",                     // University of Arkansas
  "110404": "Caltech",                      // California Institute of Technology
  "110422": "Cal Poly SLO",                 // California Polytechnic State University-San Luis Obispo
  "110486": "Cal State Bakersfield",        // California State University-Bakersfield
  "110495": "Cal State Stanislaus",         // California State University-Stanislaus
  "110510": "Cal State San Bernardino",     // California State University-San Bernardino
  "110529": "Cal Poly Pomona",              // California State Polytechnic University-Pomona
  "110538": "Chico State",                  // California State University-Chico
  "110547": "Cal State Dominguez Hills",    // California State University-Dominguez Hills
  "110556": "Fresno State",                 // California State University-Fresno
  "110565": "Cal State Fullerton",          // California State University-Fullerton
  "110574": "Cal State East Bay",           // California State University-East Bay
  "110583": "Cal State Long Beach",         // California State University-Long Beach
  "110592": "Cal State LA",                 // California State University-Los Angeles
  "110608": "Cal State Northridge",         // California State University-Northridge
  "110617": "Sacramento State",             // California State University-Sacramento
  "110635": "UC Berkeley",                  // University of California-Berkeley
  "110644": "UC Davis",                     // University of California-Davis
  "110653": "UC Irvine",                    // University of California-Irvine
  "110662": "UCLA",                         // University of California-Los Angeles
  "110671": "UC Riverside",                 // University of California-Riverside
  "110680": "UC San Diego",                 // University of California-San Diego
  "110705": "UC Santa Barbara",             // University of California-Santa Barbara
  "110714": "UC Santa Cruz",                // University of California-Santa Cruz
  "112260": "CMC",                          // Claremont McKenna College
  "115409": "Harvey Mudd",                  // Harvey Mudd College
  "115755": "Cal Poly Humboldt",            // California State Polytechnic University-Humboldt
  "117946": "LMU",                          // Loyola Marymount University
  "121150": "Pepperdine",                   // Pepperdine University
  "121257": "Pitzer",                       // Pitzer College
  "121345": "Pomona",                       // Pomona College
  "122409": "San Diego State",              // San Diego State University
  "122597": "SF State",                     // San Francisco State University
  "122755": "San Jose State",               // San Jose State University
  "123165": "Scripps",                      // Scripps College
  "123572": "Sonoma State",                 // Sonoma State University
  "123961": "USC",                          // University of Southern California
  "126614": "CU Boulder",                   // University of Colorado Boulder
  "126775": "Mines",                        // Colorado School of Mines
  "126818": "Colorado State",               // Colorado State University-Fort Collins
  "128328": "Air Force Academy",            // United States Air Force Academy
  "129020": "UConn",                        // University of Connecticut
  "130624": "Coast Guard Academy",          // United States Coast Guard Academy
  "130697": "Wesleyan",                     // Wesleyan University
  "130794": "Yale",                         // Yale University
  "130943": "UDel",                         // University of Delaware
  "131283": "Catholic University",          // The Catholic University of America
  "131469": "GW",                           // George Washington University
  "131496": "Georgetown",                   // Georgetown University
  "131520": "Howard",                       // Howard University
  "132903": "UCF",                          // University of Central Florida
  "133650": "FAMU",                         // Florida Agricultural and Mechanical University
  "133669": "FAU",                          // Florida Atlantic University
  "133951": "FIU",                          // Florida International University
  "134097": "FSU",                          // Florida State University
  "134130": "UF",                           // University of Florida
  "137351": "USF",                          // University of South Florida
  "139658": "Emory",                        // Emory University
  "139755": "Georgia Tech",                 // Georgia Institute of Technology-Main Campus
  "139959": "UGA",                          // University of Georgia
  "140553": "Morehouse",                    // Morehouse College
  "141060": "Spelman",                      // Spelman College
  "141574": "UH Mānoa",                     // University of Hawaii at Manoa
  "142285": "Idaho",                        // University of Idaho
  "143048": "SAIC",                         // School of the Art Institute of Chicago
  "144050": "UChicago",                     // University of Chicago
  "144740": "DePaul",                       // DePaul University
  "145600": "UIC",                          // University of Illinois Chicago
  "145637": "UIUC",                         // University of Illinois Urbana-Champaign
  "145725": "Illinois Tech",                // Illinois Institute of Technology
  "146719": "Loyola Chicago",               // Loyola University Chicago
  "147767": "Northwestern",                 // Northwestern University
  "151351": "IU Bloomington",               // Indiana University-Bloomington
  "152080": "Notre Dame",                   // University of Notre Dame
  "153384": "Grinnell",                     // Grinnell College
  "153603": "Iowa State",                   // Iowa State University
  "153658": "Iowa",                         // University of Iowa
  "155317": "KU",                           // University of Kansas
  "155399": "K-State",                      // Kansas State University
  "157085": "Kentucky",                     // University of Kentucky
  "157289": "Louisville",                   // University of Louisville
  "159391": "LSU",                          // Louisiana State University and Agricultural & Mechanical College
  "159647": "Louisiana Tech",               // Louisiana Tech University
  "160755": "Tulane",                       // Tulane University of Louisiana
  "160904": "Xavier (Louisiana)",           // Xavier University of Louisiana
  "160977": "Bates",                        // Bates College
  "161004": "Bowdoin",                      // Bowdoin College
  "161086": "Colby",                        // Colby College
  "161253": "Maine",                        // University of Maine
  "162928": "Johns Hopkins",                // Johns Hopkins University
  "163268": "UMBC",                         // University of Maryland-Baltimore County
  "163286": "UMD",                          // University of Maryland-College Park
  "164155": "Naval Academy",                // United States Naval Academy
  "164465": "Amherst",                      // Amherst College
  "164580": "Babson",                       // Babson College
  "164739": "Bentley",                      // Bentley University
  "164748": "Berklee",                      // Berklee College of Music
  "164924": "BC",                           // Boston College
  "164988": "BU",                           // Boston University
  "165015": "Brandeis",                     // Brandeis University
  "166027": "Harvard",                      // Harvard University
  "166513": "UMass Lowell",                 // University of Massachusetts-Lowell
  "166629": "UMass Amherst",                // University of Massachusetts-Amherst
  "166638": "UMass Boston",                 // University of Massachusetts-Boston
  "166683": "MIT",                          // Massachusetts Institute of Technology
  "166939": "Mount Holyoke",                // Mount Holyoke College
  "167358": "Northeastern",                 // Northeastern University
  "167835": "Smith",                        // Smith College
  "167987": "UMass Dartmouth",              // University of Massachusetts-Dartmouth
  "168148": "Tufts",                        // Tufts University
  "168218": "Wellesley",                    // Wellesley College
  "168342": "Williams",                     // Williams College
  "168421": "WPI",                          // Worcester Polytechnic Institute
  "170976": "Michigan",                     // University of Michigan-Ann Arbor
  "171100": "Michigan State",               // Michigan State University
  "172644": "Wayne State",                  // Wayne State University
  "173258": "Carleton",                     // Carleton College
  "173902": "Macalester",                   // Macalester College
  "174066": "Minnesota",                    // University of Minnesota-Twin Cities
  "175856": "Jackson State",                // Jackson State University
  "176017": "Ole Miss",                     // University of Mississippi
  "176080": "Mississippi State",            // Mississippi State University
  "178396": "Mizzou",                       // University of Missouri-Columbia
  "179159": "SLU",                          // Saint Louis University
  "179867": "WashU",                        // Washington University in St Louis
  "181464": "Nebraska",                     // University of Nebraska-Lincoln
  "182281": "UNLV",                         // University of Nevada-Las Vegas
  "182290": "Nevada",                       // University of Nevada-Reno
  "182670": "Dartmouth",                    // Dartmouth College
  "183044": "UNH",                          // University of New Hampshire-Main Campus
  "185828": "NJIT",                         // New Jersey Institute of Technology
  "186131": "Princeton",                    // Princeton University
  "186380": "Rutgers",                      // Rutgers University-New Brunswick
  "186867": "Stevens",                      // Stevens Institute of Technology
  "187134": "TCNJ",                         // The College of New Jersey
  "187985": "UNM",                          // University of New Mexico-Main Campus
  "189097": "Barnard",                      // Barnard College
  "190099": "Colgate",                      // Colgate University
  "190150": "Columbia",                     // Columbia University in the City of New York
  "190372": "Cooper Union",                 // The Cooper Union for the Advancement of Science and Art
  "190415": "Cornell",                      // Cornell University
  "191241": "Fordham",                      // Fordham University
  "191515": "Hamilton",                     // Hamilton College
  "192110": "Juilliard",                    // The Juilliard School
  "193654": "New School",                   // The New School
  "193900": "NYU",                          // New York University
  "194578": "Pratt",                        // Pratt Institute-Main
  "194824": "RPI",                          // Rensselaer Polytechnic Institute
  "195003": "RIT",                          // Rochester Institute of Technology
  "195030": "Rochester",                    // University of Rochester
  "196060": "UAlbany",                      // University at Albany
  "196079": "Binghamton",                   // Binghamton University
  "196088": "UB",                           // University at Buffalo
  "196097": "Stony Brook",                  // Stony Brook University
  "196413": "Syracuse",                     // Syracuse University
  "197027": "Merchant Marine Academy",      // United States Merchant Marine Academy
  "197036": "West Point",                   // United States Military Academy
  "197133": "Vassar",                       // Vassar College
  "198385": "Davidson",                     // Davidson College
  "198419": "Duke",                         // Duke University
  "198464": "ECU",                          // East Carolina University
  "199102": "NC A&T",                       // North Carolina A & T State University
  "199120": "UNC",                          // University of North Carolina at Chapel Hill
  "199157": "NCCU",                         // North Carolina Central University
  "199193": "NC State",                     // North Carolina State University at Raleigh
  "199847": "Wake Forest",                  // Wake Forest University
  "200280": "UND",                          // University of North Dakota
  "200332": "NDSU",                         // North Dakota State University-Main Campus
  "201885": "Cincinnati",                   // University of Cincinnati-Main Campus
  "203535": "Kenyon",                       // Kenyon College
  "204501": "Oberlin",                      // Oberlin College
  "204796": "Ohio State",                   // Ohio State University-Main Campus
  "207388": "Oklahoma State",               // Oklahoma State University-Main Campus
  "207500": "OU",                           // University of Oklahoma-Norman Campus
  "209542": "Oregon State",                 // Oregon State University
  "209551": "Oregon",                       // University of Oregon
  "209922": "Reed",                         // Reed College
  "211273": "Bryn Mawr",                    // Bryn Mawr College
  "211440": "Carnegie Mellon",              // Carnegie Mellon University
  "212054": "Drexel",                       // Drexel University
  "212911": "Haverford",                    // Haverford College
  "214777": "Penn State",                   // Pennsylvania State University-Main Campus
  "215062": "Penn",                         // University of Pennsylvania
  "215293": "Pitt",                         // University of Pittsburgh-Pittsburgh Campus
  "216287": "Swarthmore",                   // Swarthmore College
  "216339": "Temple",                       // Temple University
  "216597": "Villanova",                    // Villanova University
  "217156": "Brown",                        // Brown University
  "217484": "URI",                          // University of Rhode Island
  "217493": "RISD",                         // Rhode Island School of Design
  "217882": "Clemson",                      // Clemson University
  "218663": "South Carolina",               // University of South Carolina-Columbia
  "221759": "Tennessee",                    // The University of Tennessee-Knoxville
  "221838": "Tennessee State",              // Tennessee State University
  "221999": "Vanderbilt",                   // Vanderbilt University
  "223232": "Baylor",                       // Baylor University
  "225511": "UH",                           // University of Houston
  "227526": "Prairie View A&M",             // Prairie View A & M University
  "227757": "Rice",                         // Rice University
  "228246": "SMU",                          // Southern Methodist University
  "228723": "Texas A&M",                    // Texas A & M University-College Station
  "228769": "UT Arlington",                 // The University of Texas at Arlington
  "228778": "UT Austin",                    // The University of Texas at Austin
  "228787": "UT Dallas",                    // The University of Texas at Dallas
  "228796": "UTEP",                         // The University of Texas at El Paso
  "228875": "TCU",                          // Texas Christian University
  "229027": "UTSA",                         // The University of Texas at San Antonio
  "229063": "Texas Southern",               // Texas Southern University
  "229115": "Texas Tech",                   // Texas Tech University
  "230038": "BYU",                          // Brigham Young University
  "230728": "Utah State",                   // Utah State University
  "230764": "Utah",                         // University of Utah
  "230959": "Middlebury",                   // Middlebury College
  "231174": "UVM",                          // University of Vermont
  "232186": "George Mason",                 // George Mason University
  "232265": "Hampton",                      // Hampton University
  "232423": "JMU",                          // James Madison University
  "232557": "Liberty",                      // Liberty University
  "233921": "Virginia Tech",                // Virginia Polytechnic Institute and State University
  "234030": "VCU",                          // Virginia Commonwealth University
  "234076": "UVA",                          // University of Virginia-Main Campus
  "236939": "Washington State",             // Washington State University
  "236948": "UW",                           // University of Washington-Seattle Campus
  "238032": "WVU",                          // West Virginia University
  "239105": "Marquette",                    // Marquette University
  "240444": "Wisconsin",                    // University of Wisconsin-Madison
  "240453": "UW-Milwaukee",                 // University of Wisconsin-Milwaukee
  "240727": "Wyoming",                      // University of Wyoming
  "243744": "Stanford",                     // Stanford University
  "243780": "Purdue",                       // Purdue University-Main Campus
  "366711": "Cal State San Marcos",         // California State University-San Marcos
  "409698": "Cal State Monterey Bay",       // California State University-Monterey Bay
  "441937": "Cal State Channel Islands",    // California State University-Channel Islands
  "441982": "Olin",                         // Franklin W Olin College of Engineering
  "445188": "UC Merced",                    // University of California-Merced
};

// Slugs are formatted `name-with-dashes-{unitid}` (e.g.
// `university-of-california-berkeley-110635`). Extract the trailing numeric
// segment when only a slug is available (e.g. RankingRow, peers_in_state).
export function unitidFromSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  const m = slug.match(/-(\d+)$/);
  return m ? m[1] : null;
}

// Returns the common short name for the institution if we have one mapped,
// otherwise the official name. Pass either a unitid or a slug as the second
// argument — pure-numeric strings are treated as a unitid, otherwise we
// extract one from the slug suffix.
export function displayName(
  officialName: string,
  unitidOrSlug?: string | null,
): string {
  if (!unitidOrSlug) return officialName;
  const unitid = /^\d+$/.test(unitidOrSlug)
    ? unitidOrSlug
    : unitidFromSlug(unitidOrSlug);
  if (unitid && COMMON_NAMES[unitid]) return COMMON_NAMES[unitid];
  return officialName;
}

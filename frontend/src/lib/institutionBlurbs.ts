// Short "what this institution is" blurbs, keyed by IPEDS UNITID.
//
// Scope: the ~111 institutions that appear in the national /rankings/institutions
// leaderboards. Every other school falls back to the data-driven lede.
//
// Editorial rule: lead with what the institution IS (type + place), then what it
// is notable for or specializes in. Grounded in federal classification (Carnegie
// basic, control, HBCU/tribal status) plus well-established, verifiable public
// facts (founding, system membership, signature programs/affiliations). No
// ranking puffery ("No. 7 globally"), no marketing superlatives.

export const INSTITUTION_BLURBS: Record<string, string> = {
  // ---- Alabama ----------------------------------------------------------
  "100654":
    "Alabama A&M University is a public, historically Black land-grant university in Normal, Alabama, just outside Huntsville. Founded in 1875, it grants bachelor's and master's degrees with strengths in agriculture, engineering, and the sciences.",
  "100724":
    "Alabama State University is a public, historically Black university in Montgomery, Alabama. Chartered in 1867, it is one of the nation's oldest HBCUs and was closely tied to the Montgomery civil-rights movement.",
  "100812":
    "Athens State University is a public upper-division university in Athens, Alabama, admitting transfer students at the junior and senior level to complete bachelor's degrees. It traces its roots to 1822, making it one of Alabama's oldest institutions of higher learning.",
  "100858":
    "Auburn University is a public land-grant research university in Auburn, Alabama, and one of the state's two flagship institutions. Established in 1856, it is known for its engineering, agriculture, veterinary, and business programs.",
  "100830":
    "Auburn University at Montgomery is a public university in Montgomery, Alabama, part of the Auburn University system. It grants bachelor's and master's degrees serving the state-capital region.",
  "100760":
    "Central Alabama Community College is a public community college in Alexander City, Alabama, offering associate degrees, certificates, and workforce training across campuses in east-central Alabama.",
  "101028":
    "Chattahoochee Valley Community College is a public community college in Phenix City, Alabama, near the Georgia border, offering associate degrees plus transfer and career-technical programs.",

  // ---- Alaska -----------------------------------------------------------
  "102845":
    "Charter College is a private, for-profit college headquartered in Anchorage, Alaska, offering career-focused certificate and associate programs, many of them delivered online.",
  "102553":
    "The University of Alaska Anchorage is a public university in Anchorage and the largest institution in the University of Alaska System, granting programs from certificates through graduate degrees.",
  "102614":
    "The University of Alaska Fairbanks is a public land-grant research university in Fairbanks and the flagship of the University of Alaska System, recognized as a leading center for Arctic and climate research.",

  // ---- Arizona ----------------------------------------------------------
  "421708":
    "Arizona College of Nursing–Tempe is a for-profit nursing school in Tempe, Arizona, offering accelerated Bachelor of Science in Nursing (BSN) degrees.",
  "105297":
    "Diné College is a public tribal college in Tsaile, Arizona, chartered by the Navajo Nation in 1968 as the first tribally controlled college in the United States.",
  "105349":
    "Northland Pioneer College is a public community college serving Navajo and Apache counties in northeastern Arizona, offering associate degrees and certificates across a network of rural campuses.",
  "105668":
    "Rio Salado College is a public community college based in Tempe, Arizona, part of the Maricopa Community Colleges and one of the country's largest providers of online associate-degree education.",

  // ---- Arkansas ---------------------------------------------------------
  "107044":
    "Harding University is a private Christian university in Searcy, Arkansas, affiliated with the Churches of Christ and the largest private university in the state.",
  "107585":
    "The University of Arkansas Community College at Morrilton is a public two-year college in Morrilton, Arkansas, part of the University of Arkansas System, offering associate degrees and technical certificates.",

  // ---- California -------------------------------------------------------
  "109651":
    "ArtCenter College of Design is a private, nonprofit art and design college in Pasadena, California, internationally known for its transportation (automotive) and industrial-design programs.",
  "154022":
    "Ashford University was a large for-profit online university based in San Diego, California, enrolling most students in fully online bachelor's and master's programs. Its academic operations were acquired by the University of Arizona in 2020 to form the University of Arizona Global Campus.",
  "109907":
    "Barstow Community College is a public community college in Barstow, California, in the Mojave Desert, offering associate degrees, transfer pathways, and career-technical programs.",
  "110404":
    "The California Institute of Technology (Caltech) is a private research university in Pasadena, California, focused on science and engineering. It manages NASA's Jet Propulsion Laboratory and counts dozens of Nobel laureates among its faculty and alumni.",
  "489201":
    "Clovis Community College is a public community college serving the Fresno–Clovis area of California's Central Valley, part of the State Center Community College District.",
  "114789":
    "Fresno City College is a public community college in Fresno, California, founded in 1910 as one of the oldest community colleges in the state and the West.",
  "118976":
    "Modesto Junior College is a public community college in Modesto, California, founded in 1921 in the Central Valley, offering associate degrees plus transfer and career programs.",
  "120953":
    "Palo Verde College is a public community college in Blythe, California, near the Arizona border, offering associate degrees, transfer programs, and career-technical training.",
  "122931":
    "Santa Clara University is a private Jesuit Catholic university in Santa Clara, California, in the heart of Silicon Valley. Founded in 1851, it is the oldest operating institution of higher learning in the state.",
  "243744":
    "Stanford University is a private research university in Stanford, California, near Palo Alto. Founded in 1885, it is a defining institution of Silicon Valley, with signature strengths across engineering, computer science, business, and medicine.",
  "443331":
    "West Coast University is a private, for-profit health-sciences university with a campus in the Los Angeles area, specializing in nursing and allied-health degrees.",
  "490133":
    "Westcliff University is a private, for-profit university in Irvine, California, offering business, technology, and education programs to a largely international and online student body.",
  "126119":
    "Yuba College is a public community college in Marysville, California, serving the Sacramento Valley and foothills with associate degrees plus transfer and career programs.",

  // ---- Colorado ---------------------------------------------------------
  "128106":
    "Colorado State University Pueblo is a public regional university in Pueblo, Colorado, part of the Colorado State University System, granting bachelor's and master's degrees.",

  // ---- Connecticut ------------------------------------------------------
  "129242":
    "Fairfield University is a private Jesuit Catholic university in Fairfield, Connecticut, granting degrees across the liberal arts, business, nursing, and engineering.",
  "130794":
    "Yale University is a private Ivy League research university in New Haven, Connecticut. Founded in 1701, it is the third-oldest institution of higher education in the United States, with renowned law, drama, and medical schools.",

  // ---- Florida ----------------------------------------------------------
  "132374":
    "Atlantic Technical College is a public technical college in Coconut Creek, Florida, operated by Broward County Public Schools, offering career and technical certificate programs.",
  "132602":
    "Bethune-Cookman University is a private, historically Black university in Daytona Beach, Florida, affiliated with the United Methodist Church. It was founded in 1904 by educator and civil-rights leader Mary McLeod Bethune.",
  "408844":
    "Florida National University is a private, for-profit university in Hialeah, Florida, serving a largely Hispanic student body with career-oriented associate, bachelor's, and certificate programs.",
  "367875":
    "H.W. Brewster Technical College is a public technical college in Tampa, Florida, part of Hillsborough County Public Schools, offering certificate programs in health care, the trades, and business.",
  "136774":
    "Ringling College of Art and Design is a private, nonprofit art and design college in Sarasota, Florida, known for its computer-animation, illustration, and game-art programs.",

  // ---- Georgia ----------------------------------------------------------
  "138956":
    "Augusta Technical College is a public technical college in Augusta, Georgia, part of the Technical College System of Georgia, offering associate degrees and career certificates.",
  "140678":
    "North Georgia Technical College is a public technical college in Clarkesville, Georgia, part of the Technical College System of Georgia, serving the state's northeastern mountains.",
  "420431":
    "Oconee Fall Line Technical College is a public technical college in Sandersville, Georgia, part of the Technical College System of Georgia, serving central Georgia with career and technical programs.",
  "140942":
    "Savannah Technical College is a public technical college in Savannah, Georgia, part of the Technical College System of Georgia, offering associate degrees and career certificates in the coastal region.",
  "368911":
    "Southeastern Technical College is a public technical college in Vidalia, Georgia, part of the Technical College System of Georgia, serving southeastern Georgia.",
  "141255":
    "Wiregrass Georgia Technical College is a public technical college in Valdosta, Georgia, part of the Technical College System of Georgia, serving the state's southern “Wiregrass” region.",

  // ---- Illinois ---------------------------------------------------------
  "143084":
    "Augustana College is a private, nonprofit liberal arts college in Rock Island, Illinois, one of the Quad Cities on the Mississippi River. Founded in 1860, it grew out of the Swedish Lutheran tradition.",
  "146205":
    "John A. Logan College is a public community college in Carterville, Illinois, serving the southern Illinois region with associate degrees plus transfer and career-technical programs.",
  "144050":
    "The University of Chicago is a private research university in Chicago, Illinois. Founded in 1890, it is known for its rigorous core curriculum and its influence on economics, physics, and the social sciences, with dozens of Nobel laureates in its history.",

  // ---- Indiana ----------------------------------------------------------
  "152080":
    "The University of Notre Dame is a private Roman Catholic research university near South Bend, Indiana. Founded in 1842, it is among the most prominent Catholic universities in the country, known for its undergraduate education and football tradition.",

  // ---- Louisiana --------------------------------------------------------
  "160649":
    "Southern University at Shreveport is a public, historically Black community college in Shreveport, Louisiana, part of the Southern University System.",

  // ---- Massachusetts ----------------------------------------------------
  "164580":
    "Babson College is a private, nonprofit business college in Wellesley, Massachusetts, known worldwide for its focus on entrepreneurship education.",
  "164739":
    "Bentley University is a private, nonprofit university in Waltham, Massachusetts, specializing in business and its intersection with technology and the liberal arts.",
  "166027":
    "Harvard University is a private Ivy League research university in Cambridge, Massachusetts. Founded in 1636, it is the oldest institution of higher education in the United States and one of the most influential in the world.",
  "166656":
    "MCPHS University (the Massachusetts College of Pharmacy and Health Sciences) is a private, nonprofit health-sciences university in Boston. Founded in 1823, it focuses on pharmacy and the health professions.",
  "166683":
    "The Massachusetts Institute of Technology (MIT) is a private research university in Cambridge, Massachusetts. Founded in 1861, it is widely regarded as one of the world's leading institutions for science, engineering, and technology.",
  "167358":
    "Northeastern University is a private research university in Boston, Massachusetts. Founded in 1898, it is known nationally for its cooperative-education (co-op) program that integrates full-time professional work into the degree.",
  "167631":
    "Roxbury Community College is a public community college in the Roxbury neighborhood of Boston, Massachusetts, serving a diverse urban student body with associate degrees and transfer programs.",
  "168342":
    "Williams College is a private, nonprofit liberal arts college in Williamstown, Massachusetts, in the Berkshire Mountains. Founded in 1793, it is one of the country's leading undergraduate liberal arts colleges.",
  "168421":
    "Worcester Polytechnic Institute (WPI) is a private research university in Worcester, Massachusetts. Founded in 1865, it was one of the nation's first engineering and technology universities and is known for its project-based curriculum.",

  // ---- Michigan ---------------------------------------------------------
  "170240":
    "Henry Ford College is a public community college in Dearborn, Michigan, founded in 1938, offering associate degrees, certificates, and select bachelor's programs.",
  "170286":
    "Hillsdale College is a private, nonprofit liberal arts college in Hillsdale, Michigan. Founded in 1844, it is known for its classical curriculum and its policy of accepting no federal or state funding.",
  "169983":
    "Kettering University is a private, nonprofit university in Flint, Michigan, specializing in engineering, science, and management. Formerly the General Motors Institute, it is known for its cooperative-education model pairing coursework with paid industry work.",

  // ---- Mississippi ------------------------------------------------------
  "175519":
    "Coahoma Community College is a public, historically Black community college in Clarksdale, Mississippi, in the heart of the Mississippi Delta.",
  "176035":
    "Mississippi University for Women is a public university in Columbus, Mississippi. Chartered in 1884 as the first state-supported college for women in the United States, it has been coeducational since 1982.",

  // ---- Nebraska ---------------------------------------------------------
  "181002":
    "Creighton University is a private Jesuit Catholic research university in Omaha, Nebraska, known for its health-sciences and professional programs, including medicine, dentistry, pharmacy, and law.",

  // ---- New Hampshire ----------------------------------------------------
  "182670":
    "Dartmouth College is a private Ivy League research university in Hanover, New Hampshire. Founded in 1769, it is the ninth-oldest college in the United States and the smallest of the Ivy League.",
  "183239":
    "Saint Anselm College is a private Benedictine Catholic liberal arts college in Manchester, New Hampshire, well known as a venue for presidential-primary campaign events.",

  // ---- New Jersey -------------------------------------------------------
  "183804":
    "Beth Medrash Govoha is a private Orthodox Jewish rabbinical academy (yeshiva) in Lakewood, New Jersey, and one of the largest yeshivas in the world outside Israel.",
  "186131":
    "Princeton University is a private Ivy League research university in Princeton, New Jersey. Founded in 1746, it is the fourth-oldest college in the United States, distinguished by its emphasis on undergraduate teaching and research.",
  "186867":
    "Stevens Institute of Technology is a private research university in Hoboken, New Jersey, overlooking Manhattan across the Hudson River. Founded in 1870, it is one of the oldest technological universities in the country.",

  // ---- New York ---------------------------------------------------------
  "190150":
    "Columbia University is a private Ivy League research university in New York City. Established in 1754 as King's College, it is the oldest institution of higher education in New York and one of the oldest in the country.",
  "196389":
    "The Swedish Institute is a private college of health sciences in New York City, specializing in massage therapy and allied-health and nursing training.",
  "197018":
    "United Talmudical Seminary is a private Orthodox (Satmar Hasidic) rabbinical seminary in the Williamsburg section of Brooklyn, New York, providing advanced religious education.",
  "446604":
    "UTA Mesivta of Kiryas Joel is a private Orthodox (Satmar Hasidic) rabbinical academy in Kiryas Joel, a village within the town of Monroe, New York, providing advanced Talmudic education.",

  // ---- North Carolina ---------------------------------------------------
  "197966":
    "Beaufort County Community College is a public community college in Washington, North Carolina, serving the state's coastal plain with associate degrees, transfer pathways, and workforce training.",
  "198321":
    "Cleveland Community College is a public community college in Shelby, North Carolina, providing associate degrees, college-transfer pathways, and workforce training.",
  "198367":
    "Craven Community College is a public community college in New Bern, North Carolina, serving the coastal region with associate degrees, transfer programs, and workforce training.",
  "456968":
    "The Health and Style Institute is a private, for-profit school in Greensboro, North Carolina, offering certificate programs in cosmetology and the beauty and wellness trades.",
  "199768":
    "Surry Community College is a public community college in Dobson, North Carolina, serving the state's northwestern foothills, with a noted viticulture and enology (winemaking) program.",

  // ---- North Dakota / South Dakota -------------------------------------
  "219277":
    "Oglala Lakota College is a public tribal college on the Pine Ridge Reservation in Kyle, South Dakota, chartered by the Oglala Sioux Tribe to serve the Lakota community.",

  // ---- Oklahoma ---------------------------------------------------------
  "418296":
    "Indian Capital Technology Center is a public career and technology center in Muskogee, Oklahoma, part of Oklahoma's CareerTech system, offering workforce certificate programs.",
  "461087":
    "Northeast Technology Center is a public career and technology district based in Pryor, Oklahoma, part of Oklahoma CareerTech, delivering workforce certificate training across northeastern-Oklahoma campuses.",
  "207865":
    "Southwestern Oklahoma State University is a public regional university in Weatherford, Oklahoma, granting bachelor's and master's degrees and home to a well-established College of Pharmacy.",

  // ---- Pennsylvania -----------------------------------------------------
  "210809":
    "The American College of Financial Services is a private, nonprofit institution in King of Prussia, Pennsylvania, specializing in professional education and credentialing for the insurance and financial-planning industries.",
  "211440":
    "Carnegie Mellon University is a private research university in Pittsburgh, Pennsylvania, formed from the 1967 merger of the Carnegie Institute of Technology and the Mellon Institute. It is a global leader in computer science, robotics, and the arts.",
  "212805":
    "Grove City College is a private, nonprofit Christian liberal arts college in Grove City, Pennsylvania, known for its conservative values and for declining most federal funding to preserve its independence.",
  "215062":
    "The University of Pennsylvania is a private Ivy League research university in Philadelphia. Founded in 1740 and associated with Benjamin Franklin, it is home to the Wharton School, the first collegiate business school in the country.",
  "215743":
    "Saint Francis University is a private Franciscan Catholic university in Loretto, Pennsylvania, among the oldest Catholic universities in the United States.",
  "216278":
    "Susquehanna University is a private, nonprofit liberal arts college in Selinsgrove, Pennsylvania, affiliated with the Lutheran church and set in the Susquehanna River valley.",

  // ---- Puerto Rico ------------------------------------------------------
  "241216":
    "Atlantic University is a private institution in Guaynabo, Puerto Rico, offering baccalaureate programs with a focus on design, media, and creative-technology fields.",
  "241304":
    "Columbia Central University is a private, for-profit institution in Caguas, Puerto Rico, offering career-oriented certificate and degree programs.",
  "243832":
    "EDP University is a private, nonprofit institution in San Juan, Puerto Rico, offering career-focused associate and bachelor's programs in technology, health, and business.",
  "242626":
    "The Inter American University of Puerto Rico–Aguadilla is a private, nonprofit campus of the Inter American University system, serving northwestern Puerto Rico with bachelor's and master's programs.",
  "242635":
    "The Inter American University of Puerto Rico–Arecibo is a private, nonprofit campus of the Inter American University system, serving the Arecibo region on Puerto Rico's north coast.",
  "242680":
    "The Inter American University of Puerto Rico–Fajardo is a private, nonprofit campus of the Inter American University system, serving the Fajardo area of eastern Puerto Rico.",
  "414461":
    "Mech-Tech College is a private, for-profit institution in Caguas, Puerto Rico, specializing in automotive, mechanical, and industrial technical training.",
  "241410":
    "The Pontifical Catholic University of Puerto Rico is a private Roman Catholic university in Ponce, one of only a few pontifical universities in the United States and its territories.",
  "243346":
    "Universidad Ana G. Méndez–Carolina Campus is a private, nonprofit university in Carolina, Puerto Rico, part of the Ana G. Méndez University System, one of the island's largest private higher-education networks.",
  "241739":
    "Universidad Ana G. Méndez–Cupey Campus is a private, nonprofit university in the Cupey area of San Juan and the flagship campus of the Ana G. Méndez University System.",
  "243106":
    "The University of Puerto Rico at Aguadilla is a public university in Aguadilla, part of the University of Puerto Rico, the island's public university system, serving the northwestern region.",
  "243115":
    "The University of Puerto Rico at Arecibo is a public university in Arecibo, part of the University of Puerto Rico system, serving the north-central coast.",
  "243179":
    "The University of Puerto Rico at Humacao is a public university in Humacao, part of the University of Puerto Rico system, serving the eastern region with programs in nursing and the sciences.",

  // ---- Rhode Island -----------------------------------------------------
  "217156":
    "Brown University is a private Ivy League research university in Providence, Rhode Island. Founded in 1764, it is the seventh-oldest college in the United States and is known for its open curriculum.",
  "217402":
    "Providence College is a private Roman Catholic college in Providence, Rhode Island, run by the Dominican Order and known for its liberal-arts core and Division I athletics.",
  "217536":
    "Salve Regina University is a private Roman Catholic university in Newport, Rhode Island, set on a seaside campus of historic Gilded Age mansions.",

  // ---- Tennessee --------------------------------------------------------
  "443650":
    "Miller-Motte College is a private, for-profit college with a campus in Chattanooga, Tennessee, offering career-focused associate degrees and certificates in health care, business, and the trades.",
  "221096":
    "Motlow State Community College is a public community college in Tullahoma, Tennessee, serving the state's south-central region with associate degrees and transfer pathways.",
  "222062":
    "Walters State Community College is a public community college in Morristown, Tennessee, serving the state's northeastern region with associate degrees, transfer pathways, and workforce programs.",

  // ---- Texas ------------------------------------------------------------
  "226134":
    "Laredo College is a public community college in Laredo, Texas, on the U.S.–Mexico border, serving a predominantly Hispanic student body with associate degrees, transfer pathways, and workforce programs.",
  "483036":
    "Texas A&M University–Central Texas is a public upper-division university in Killeen, Texas, part of the Texas A&M University System, serving transfer and graduate students in the greater Killeen–Temple region.",
  "228796":
    "The University of Texas at El Paso is a public research university in El Paso, on the U.S.–Mexico border. Part of the University of Texas System, it is a national model for serving Hispanic and first-generation students.",

  // ---- Utah -------------------------------------------------------------
  "448248":
    "Mountainland Technical College is a public technical college in Lehi, Utah, part of the Utah System of Higher Education's technical-college network, offering competency-based career certificates.",

  // ---- Virginia / West Virginia ----------------------------------------
  "487977":
    "Martinsburg College is a private, for-profit college in Martinsburg, West Virginia, offering career-focused certificate and associate programs, many online, in health care and business.",
};

export function institutionBlurb(unitid: string): string | null {
  return INSTITUTION_BLURBS[unitid] ?? null;
}

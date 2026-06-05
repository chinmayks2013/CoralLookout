/**
 * Documented reef monitoring sites from NOAA Coral Reef Watch and
 * peer-reviewed regional summaries (2023–2025 global bleaching event).
 * Not student uploads — see sourceUrl on each entry.
 */

export interface ResearchSite {
  id: string;
  name: string;
  lat: number;
  lng: number;
  region: string;
  /** NOAA CRW Bleaching Alert Area level 0–4 */
  alertLevel: 0 | 1 | 2 | 3 | 4;
  sstAnomalyC: number;
  asOf: string;
  source: string;
  sourceUrl: string;
  summary: string;
}

export const NOAA_WMS = {
  url: "https://coastwatch.noaa.gov/erddap/wms/noaacrwbaa7dDaily/request",
  layers: "noaacrwbaa7dDaily:bleaching_alert_area",
  attribution:
    "NOAA Coral Reef Watch · Bleaching Alert Area (7-day max, 5 km)",
  infoUrl: "https://coralreefwatch.noaa.gov/product/5km/index_5km_baa.php",
  doi: "10.7289/V5R49NQV",
};

export const ALERT_LABELS: Record<ResearchSite["alertLevel"], string> = {
  0: "No stress",
  1: "Watch",
  2: "Warning",
  3: "Alert Level 1",
  4: "Alert Level 2",
};

export const ALERT_COLORS: Record<ResearchSite["alertLevel"], string> = {
  0: "#22d3ee",
  1: "#a3e635",
  2: "#fbbf24",
  3: "#fb923c",
  4: "#f87171",
};

/** Regional monitoring sites with published heat-stress status */
export const RESEARCH_SITES: ResearchSite[] = [
  {
    id: "gbr-cairns",
    name: "Great Barrier Reef — Northern Sector",
    lat: -16.9,
    lng: 145.7,
    region: "Australia & Pacific",
    alertLevel: 3,
    sstAnomalyC: 1.1,
    asOf: "2024-04",
    source: "NOAA CRW / AIMS reports",
    sourceUrl: "https://coralreefwatch.noaa.gov/product/5km/index_5km_baa.php",
    summary:
      "Mass bleaching documented across northern GBR during the 2023–24 global event; CRW Alert Level 1–2 conditions persisted for weeks.",
  },
  {
    id: "fl-keys",
    name: "Florida Keys — Key Largo",
    lat: 25.1,
    lng: -80.4,
    region: "North America",
    alertLevel: 4,
    sstAnomalyC: 1.4,
    asOf: "2023-09",
    source: "NOAA CRW / FKNMS",
    sourceUrl: "https://coralreefwatch.noaa.gov/product/5km/index_5km_baa.php",
    summary:
      "Record marine heatwave; extensive bleaching and mortality reported across Florida reef tract in 2023.",
  },
  {
    id: "carib-culebra",
    name: "Puerto Rico — Culebra",
    lat: 18.3,
    lng: -65.3,
    region: "Caribbean",
    alertLevel: 3,
    sstAnomalyC: 1.0,
    asOf: "2023-10",
    source: "NOAA CRW",
    sourceUrl: "https://coralreefwatch.noaa.gov/product/5km/index_5km_baa.php",
    summary:
      "Caribbean-wide bleaching during 2023; CRW heat stress extended through late summer.",
  },
  {
    id: "hawaii-kaneohe",
    name: "Hawaii — Kāneʻohe Bay",
    lat: 21.4,
    lng: -157.8,
    region: "Pacific",
    alertLevel: 2,
    sstAnomalyC: 0.8,
    asOf: "2024-10",
    source: "NOAA CRW / HIMB",
    sourceUrl: "https://coralreefwatch.noaa.gov/product/5km/index_5km_baa.php",
    summary:
      "Elevated SST and localized bleaching; ongoing monitoring by university and federal partners.",
  },
  {
    id: "red-sea",
    name: "Red Sea — Central Reefs",
    lat: 22.0,
    lng: 38.5,
    region: "Middle East",
    alertLevel: 3,
    sstAnomalyC: 1.2,
    asOf: "2023-08",
    source: "NOAA CRW",
    sourceUrl: "https://coralreefwatch.noaa.gov/product/5km/index_5km_baa.php",
    summary:
      "Prolonged summer heat stress; bleaching reported across multiple reef systems in 2023.",
  },
  {
    id: "maldives",
    name: "Maldives — Ari Atoll",
    lat: 3.9,
    lng: 72.8,
    region: "Indian Ocean",
    alertLevel: 3,
    sstAnomalyC: 1.0,
    asOf: "2024-05",
    source: "NOAA CRW",
    sourceUrl: "https://coralreefwatch.noaa.gov/product/5km/index_5km_baa.php",
    summary:
      "Indian Ocean bleaching event affected wide areas; CRW products showed sustained Alert conditions.",
  },
  {
    id: "bali",
    name: "Indonesia — Bali (Nusa Penida)",
    lat: -8.7,
    lng: 115.5,
    region: "Southeast Asia",
    alertLevel: 2,
    sstAnomalyC: 0.7,
    asOf: "2024-04",
    source: "NOAA CRW",
    sourceUrl: "https://coralreefwatch.noaa.gov/product/5km/index_5km_baa.php",
    summary:
      "Moderate heat stress during El Niño; patchy bleaching aligned with CRW Warning levels.",
  },
  {
    id: "kenya",
    name: "Kenya — Wasini Channel",
    lat: -4.6,
    lng: 39.4,
    region: "Africa",
    alertLevel: 3,
    sstAnomalyC: 0.9,
    asOf: "2024-03",
    source: "NOAA CRW / CORDIO",
    sourceUrl: "https://coralreefwatch.noaa.gov/product/5km/index_5km_baa.php",
    summary:
      "Western Indian Ocean warming linked to regional bleaching during the global event.",
  },
  {
    id: "galapagos",
    name: "Galápagos — Academy Bay",
    lat: -0.7,
    lng: -90.3,
    region: "South America",
    alertLevel: 2,
    sstAnomalyC: 0.6,
    asOf: "2024-02",
    source: "NOAA CRW",
    sourceUrl: "https://coralreefwatch.noaa.gov/product/5km/index_5km_baa.php",
    summary:
      "ENSO-related warming; episodic bleaching documented on eastern Pacific reefs.",
  },
  {
    id: "med",
    name: "Mediterranean — Port-Cros (coralligenous)",
    lat: 43.0,
    lng: 6.4,
    region: "Europe",
    alertLevel: 1,
    sstAnomalyC: 0.5,
    asOf: "2023-08",
    source: "NOAA CRW / regional studies",
    sourceUrl: "https://coralreefwatch.noaa.gov/product/5km/index_5km_baa.php",
    summary:
      "Mediterranean marine heatwaves affect coralligenous habitats; lower latitude analog to tropical stress.",
  },
];

export function getWorldResearchSummary() {
  const byLevel = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 } as Record<
    ResearchSite["alertLevel"],
    number
  >;
  const regions = new Set<string>();
  let anomalySum = 0;

  for (const site of RESEARCH_SITES) {
    byLevel[site.alertLevel]++;
    regions.add(site.region);
    anomalySum += site.sstAnomalyC;
  }

  const highStress = RESEARCH_SITES.filter((s) => s.alertLevel >= 3).length;

  return {
    siteCount: RESEARCH_SITES.length,
    regions: regions.size,
    highStress,
    avgAnomalyC: (anomalySum / RESEARCH_SITES.length).toFixed(1),
    byLevel,
  };
}

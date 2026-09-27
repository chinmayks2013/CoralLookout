import type { LucideIcon } from "lucide-react";
import {
  Globe2,
  Camera,
  Microscope,
  Database,
  Users,
  FileBarChart,
  LineChart,
  Box,
  Code2,
  BadgeCheck,
  Network,
} from "lucide-react";

export type PillarStatus = "live" | "building" | "planned";

export interface VisionPillar {
  id: string;
  rank: number;
  title: string;
  stars: number;
  icon: LucideIcon;
  status: PillarStatus;
  summary: string;
  details: string[];
  href?: string;
  hrefLabel?: string;
  featured?: boolean;
}

export interface VisionPhase {
  id: string;
  phase: number;
  title: string;
  description: string;
  status: PillarStatus;
}

export const VISION_TAGLINE =
  "No single feature is worth $100,000/year. Organizations pay when Coral Lookout becomes mission-critical — because of accumulated data, workflows, integrations, and trust.";

export const VISION_THESIS = {
  eyebrow: "Data moat & workflow moat",
  headline: "Build the network. Own the history. Become infrastructure.",
  body: "A competitor can copy our code. They cannot instantly copy years of curated reef observations, school workflows, research integrations, and verified trust. We obsess over network effects — not one killer feature.",
};

export const VISION_PILLARS: VisionPillar[] = [
  {
    id: "global-intelligence",
    rank: 1,
    title: "Global Coral Intelligence Network",
    stars: 5,
    icon: Globe2,
    status: "building",
    featured: true,
    summary:
      "The place universities, aquariums, schools, divers, and NGOs contribute reef observations — becoming the world’s shared coral intelligence layer.",
    details: [
      "Universities upload reef surveys",
      "Aquariums contribute observations",
      "Schools submit class projects",
      "Divers upload geotagged reef photos",
      "NGOs monitor restoration projects",
      "Long-term: time-series change, species distributions, bleaching trends, restoration metrics",
    ],
    href: "/map",
    hrefLabel: "Explore the map",
  },
  {
    id: "automated-monitoring",
    rank: 2,
    title: "Automated Reef Monitoring",
    stars: 4,
    icon: Camera,
    status: "planned",
    summary:
      "Move beyond one-off uploads. Connect drones, underwater robots, GoPros, and fixed cameras so monitoring becomes daily infrastructure.",
    details: [
      "Connect drones, ROVs, GoPros, and underwater cameras",
      "Daily alerts: health decline, new bleaching, crown-of-thorns detections",
      "Turn Coral Lookout from software into reef infrastructure",
    ],
    href: "/scanner",
    hrefLabel: "Try the scanner today",
  },
  {
    id: "scientific-ai",
    rank: 3,
    title: "Scientific-grade AI",
    stars: 4,
    icon: Microscope,
    status: "building",
    summary:
      "Go beyond a single health score. Deliver species and disease signals, bleaching probability, confidence intervals, uncertainty maps, explainability, citations, and downloadable reports researchers can trust.",
    details: [
      "Species & disease identification",
      "Bleaching probability with confidence intervals",
      "Uncertainty maps and explainability",
      "Citations and downloadable scientific reports",
    ],
    href: "/scanner",
    hrefLabel: "Run the AI pipeline",
  },
  {
    id: "benchmark-database",
    rank: 4,
    title: "Benchmark Database",
    stars: 4,
    icon: Database,
    status: "building",
    summary:
      "Type a reef region and instantly compare growth, bleaching trends, historical change, and restoration outcomes against nearby reefs — a corpus nobody builds overnight.",
    details: [
      "Regional reef benchmarks",
      "Growth vs nearby reefs",
      "Bleaching trends and historical change",
      "Restoration comparisons",
    ],
    href: "/research",
    hrefLabel: "Open research dashboard",
  },
  {
    id: "research-collaboration",
    rank: 5,
    title: "Research Collaboration Platform",
    stars: 4,
    icon: Users,
    status: "building",
    summary:
      "Where marine science happens: shared datasets, annotations, publications, project workspaces, AI-assisted labeling, and reviewer mode.",
    details: [
      "Research CSV / GeoJSON exports",
      "Educator-verified review badges (stub)",
      "Annotations and publication workspaces (next)",
      "AI-assisted labeling (planned)",
    ],
    href: "/research",
    hrefLabel: "See research tools",
  },
  {
    id: "government-reporting",
    rank: 6,
    title: "Government Reporting",
    stars: 3,
    icon: FileBarChart,
    status: "planned",
    summary:
      "One-click standardized outputs: NOAA-style reports, restoration reports, grant reports, and biodiversity summaries governments already require.",
    details: [
      "NOAA-style reef status reports",
      "Restoration and grant reporting packs",
      "Biodiversity summaries for agencies",
    ],
    href: "/business",
    hrefLabel: "Partner for reports",
  },
  {
    id: "predictive-ai",
    rank: 7,
    title: "Predictive AI",
    stars: 4,
    icon: LineChart,
    status: "planned",
    summary:
      "Don’t only analyze today. Forecast bleaching risk, disease spread, storm impact, and restoration success — insights that save organizations money.",
    details: [
      "Bleaching risk next month",
      "Disease spread forecasts",
      "Storm impact estimates",
      "Restoration success prediction",
    ],
    href: "/research",
    hrefLabel: "View bleaching insights",
  },
  {
    id: "digital-twin",
    rank: 8,
    title: "Digital Twin",
    stars: 3,
    icon: Box,
    status: "planned",
    summary:
      "A living 3D model of each reef where every coral colony is tracked across years — compare 2026 → 2027 → 2028 → 2032.",
    details: [
      "Living 3D reef models",
      "Year-over-year visual comparison",
      "Colony-level tracking over time",
    ],
    href: "/map",
    hrefLabel: "Explore reef map",
  },
  {
    id: "api-platform",
    rank: 9,
    title: "API Platform",
    stars: 4,
    icon: Code2,
    status: "building",
    summary:
      "Sell infrastructure, not only software. When every conservation app calls Coral Lookout’s API, usage becomes embedded and renewals become inevitable.",
    details: [
      "Private partner read API preview (keyed)",
      "Upload and health-trend endpoints (roadmap)",
      "Public marketplace deferred until contracts require it",
    ],
    href: "/business",
    hrefLabel: "Research & NGO tier",
  },
  {
    id: "verified-dataset",
    rank: 10,
    title: "Verified Global Dataset",
    stars: 5,
    icon: BadgeCheck,
    status: "building",
    summary:
      "Every observation carries GPS, timestamp, contributor, validation score, and expert review — a citable dataset for scientific papers.",
    details: [
      "GPS + timestamp on every observation",
      "Contributor identity and provenance",
      "Validation scores and expert review",
      "Citable outputs for publications",
    ],
    href: "/gallery",
    hrefLabel: "Browse Reef Gallery",
  },
];

export const VISION_PHASES: VisionPhase[] = [
  {
    id: "phase-1",
    phase: 1,
    title: "AI scanner",
    description:
      "Ship a usable scan → share → map → learn loop so students and teachers contribute real observations today.",
    status: "live",
  },
  {
    id: "phase-2",
    phase: 2,
    title: "Best reef monitoring platform",
    description:
      "Unite gallery, map, academy, school chapters, and research tools into one workflow organizations depend on.",
    status: "building",
  },
  {
    id: "phase-3",
    phase: 3,
    title: "Largest reef dataset in the world",
    description:
      "Accumulate verified, geotagged, time-stamped observations at global scale — the data moat competitors cannot clone overnight.",
    status: "building",
  },
  {
    id: "phase-4",
    phase: 4,
    title: "Standard platform for science & policy",
    description:
      "Researchers, schools, NGOs, and governments run on Coral Lookout because everyone else already does — historical data and workflows live here.",
    status: "planned",
  },
];

export const VISION_MOAT_SUMMARY = {
  title: "The biggest moat",
  icon: Network,
  body: "If we are building a lasting company, we obsess over network effects — not features. At Phase 4, people are not paying because the scanner is amazing. They are paying because everyone else is already using Coral Lookout, the historical data lives here, and their workflows depend on it.",
};

export const STATUS_LABEL: Record<PillarStatus, string> = {
  live: "Live now",
  building: "Building",
  planned: "Planned",
};

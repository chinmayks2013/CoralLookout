import type { LucideIcon } from "lucide-react";
import {
  GraduationCap,
  FlaskConical,
  Handshake,
  Leaf,
} from "lucide-react";

export interface PricingTier {
  id: string;
  name: string;
  price: string;
  priceDetail: string;
  annualPrice?: string;
  annualPriceDetail?: string;
  description: string;
  audience: string;
  features: string[];
  cta: string;
  href: string;
  highlighted?: boolean;
}

export interface RevenueStream {
  icon: LucideIcon;
  title: string;
  description: string;
  shareLabel: string;
}

export interface BusinessFaq {
  question: string;
  answer: string;
}

export const BUSINESS_TAGLINE =
  "Free for students. Sustainable through schools, science partners, and mission-aligned sponsors.";

export const PRICING_TIERS: PricingTier[] = [
  {
    id: "enthusiast",
    name: "Coral Enthusiast",
    price: "$0",
    priceDetail: "forever",
    description:
      "Every student, diver, and volunteer can join, scan, learn, and participate in the global reef community.",
    audience: "Individuals & classroom participants",
    features: [
      "AI reef scanner & health insights",
      "Reef Gallery, forum & corals economy",
      "Reef Academy lessons & challenges",
      "Public profile & global map contributions",
      "Compete on leaderboards with your school",
    ],
    cta: "Join free",
    href: "/community",
  },
  {
    id: "school",
    name: "School Chapter",
    price: "$49",
    priceDetail: "/ month per school",
    annualPrice: "$490",
    annualPriceDetail: "/ year founding (prepaid)",
    description:
      "Teachers run structured reef programs with dashboards, exports, and moderated classroom spaces.",
    audience: "K–12 schools, clubs & universities",
    features: [
      "Everything in Coral Enthusiast",
      "Teacher admin dashboard & class roster",
      "Bulk student onboarding & school branding",
      "Assignment-ready exports (CSV & print reports)",
      "Private chapter leaderboard & progress",
      "Annual prepaid option for procurement",
      "Priority email support",
    ],
    cta: "Start school chapter",
    href: "/teacher",
    highlighted: true,
  },
  {
    id: "partner",
    name: "Research & NGO",
    price: "Custom",
    priceDetail: "annual partnership",
    description:
      "Marine labs, NGOs, and governments access aggregated reef intelligence and co-branded programs.",
    audience: "Researchers, NGOs & conservation agencies",
    features: [
      "Anonymized regional data exports",
      "API access to upload & health trends",
      "Sponsored challenges & map layers",
      "White-label reports for grants & donors",
      "Path to verified datasets & government reporting",
      "Dedicated onboarding & SLA",
    ],
    cta: "Partner with us",
    href: "/community?partner=inquiry",
  },
];

export const REVENUE_STREAMS: RevenueStream[] = [
  {
    icon: GraduationCap,
    title: "School subscriptions",
    description:
      "Recurring plans for schools that want dashboards, exports, and structured reef education programs.",
    shareLabel: "~55% of projected revenue",
  },
  {
    icon: FlaskConical,
    title: "Research & NGO licenses",
    description:
      "Annual data and API partnerships for scientists tracking bleaching, restoration, and regional stress.",
    shareLabel: "~25%",
  },
  {
    icon: Handshake,
    title: "CSR & brand sponsors",
    description:
      "Ocean-minded brands fund themed challenges, map features, and student grants in exchange for visibility.",
    shareLabel: "~15%",
  },
  {
    icon: Leaf,
    title: "Grants & philanthropy",
    description:
      "Climate and education foundations support free student access and underserved coastal schools.",
    shareLabel: "~5% (subsidy)",
  },
];

export const SUSTAINABILITY_POINTS = [
  {
    title: "Students never pay",
    body: "Core conservation tools stay free so participation is limited only by curiosity—not income.",
  },
  {
    title: "Schools fund scale",
    body: "Institutions pay for admin tools, compliance-friendly exports, and classroom management at low per-student cost.",
  },
  {
    title: "Science validates trust",
    body: "NGO and research partners pay for reliable data pipelines—keeping AI insights accountable to the field.",
  },
  {
    title: "Impact over ads",
    body: "We avoid invasive advertising; sponsors align with conservation missions, not clickbait.",
  },
];

export const BUSINESS_FAQS: BusinessFaq[] = [
  {
    question: "Why not charge students directly?",
    answer:
      "Our mission is the world's largest student-driven reef network. Paywalls would exclude the communities most affected by reef loss. Schools and partners subsidize free access.",
  },
  {
    question: "What do schools get for $49/month or $490/year?",
    answer:
      "A managed chapter for up to ~200 students: teacher dashboard, exports for grading, private leaderboards, assignments, and support. Annual prepaid is designed for school procurement cycles (~2 months free vs monthly).",
  },
  {
    question: "How does procurement work?",
    answer:
      "Most schools pay by card via Stripe on the teacher dashboard. For POs, wire transfers, or district procurement, email schools@corallookout.org and we will issue an invoice for the founding annual plan.",
  },
  {
    question: "How is student privacy handled?",
    answer:
      "Students control what appears on public gallery posts. Chapter rosters are for classroom management. See /privacy for a plain-language student-data summary written for school procurement.",
  },
  {
    question: "What does a pilot include?",
    answer:
      "Join codes, printable student quick start, AI scanner with honest methodology labels, class map filters (including Puerto Rico / Caribbean cohorts), CSV exports, and teacher onboarding support. Custom research exports are available for NGO partners.",
  },
  {
    question: "How do coral donations work financially?",
    answer:
      "Corals are in-app engagement credits, not cryptocurrency. They reward participation; they are not sold for cash. Optional future sponsor pools could fund real restoration grants.",
  },
];

export const PILOT_METRICS = [
  { label: "Year 1 goal", value: "25 school chapters" },
  { label: "Year 1 ARR target", value: "$180K" },
  { label: "Students reached", value: "12,000+" },
  { label: "Cost to serve (free tier)", value: "< $0.10 / user / mo" },
];

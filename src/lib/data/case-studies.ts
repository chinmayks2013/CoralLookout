export type CaseStudyStatus = "in_progress" | "planned" | "complete";

export interface CaseStudyMetric {
  label: string;
  value: string;
  placeholder: boolean;
}

export interface CaseStudy {
  id: string;
  cohortId: string;
  title: string;
  region: string;
  status: CaseStudyStatus;
  summary: string;
  goals: string[];
  metrics: CaseStudyMetric[];
  quote: {
    text: string;
    attribution: string;
    placeholder: boolean;
  };
  mapHref: string;
  featured?: boolean;
}

export const STATUS_LABEL: Record<CaseStudyStatus, string> = {
  in_progress: "Pilot in progress",
  planned: "Planned",
  complete: "Complete",
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "puerto-rico-pilot",
    cohortId: "puerto-rico",
    title: "Puerto Rico Classroom Pilot",
    region: "Puerto Rico",
    status: "in_progress",
    featured: true,
    summary:
      "Our first cohort pilot: classrooms in Puerto Rico using Coral Lookout to scan local and coastal reef images, build a shared class dataset, and learn reef science hands-on. Results are still coming in — this page will update as real numbers land.",
    goals: [
      "Validate the join-code onboarding flow with real classrooms",
      "Collect verified, geotagged scans from a coastal region",
      "Test the teacher dashboard, exports, and private leaderboard under real use",
      "Gather honest feedback before broader school rollout",
    ],
    metrics: [
      { label: "Students enrolled", value: "Live when available", placeholder: true },
      { label: "Reef scans logged", value: "Live when available", placeholder: true },
      { label: "Classrooms participating", value: "Live when available", placeholder: true },
    ],
    quote: {
      text: "Placeholder quote — pending pilot partner approval before publishing.",
      attribution: "Pilot educator, Puerto Rico (name pending)",
      placeholder: true,
    },
    mapHref: "/map?cohort=puerto-rico",
  },
];

export function getCaseStudy(id: string): CaseStudy | null {
  return CASE_STUDIES.find((c) => c.id === id) ?? null;
}

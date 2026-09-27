export interface CitationInput {
  schoolName: string;
  cohort: string;
  year: number | string;
}

/**
 * Builds a citable, MLA/APA-ish text snippet for a class's Coral Lookout
 * dataset — for students and researchers who want to cite classroom
 * observations in a report or paper. Not a formal, style-guide-checked
 * citation — just an honest, reasonable starting point.
 */
export function buildDatasetCitation({ schoolName, cohort, year }: CitationInput): string {
  const school = schoolName.trim() || "Coral Lookout classroom";
  const cohortLabel = cohort.trim() || "General";
  return `${school}. (${year}). Coral Lookout Reef Observation Dataset — ${cohortLabel} Cohort [Data set]. Coral Lookout. Retrieved from https://corallookout.org/case-studies`;
}

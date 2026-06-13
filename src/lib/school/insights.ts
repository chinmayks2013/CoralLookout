import type { ReefHealth } from "@/lib/types";
import { CORAL_GUIDE_LESSONS } from "@/lib/academy/course";

/** Reef vocabulary teachers care about — matched in forum posts & comments. */
export const CONCEPT_PATTERNS: {
  id: string;
  label: string;
  patterns: RegExp[];
}[] = [
  {
    id: "zooxanthellae",
    label: "Zooxanthellae / coral symbiosis",
    patterns: [
      /\bzooxanthellae\b/i,
      /\bsymbiont/i,
      /\balgae partner/i,
      /\bcoral.?algae/i,
    ],
  },
  {
    id: "bleaching",
    label: "Coral bleaching",
    patterns: [/\bbleach/i, /\bwhite coral/i, /\bcoral.?white/i],
  },
  {
    id: "heat_stress",
    label: "Ocean heat stress",
    patterns: [
      /\bheat stress/i,
      /\bwarm(er)? ocean/i,
      /\btemperature/i,
      /\bsst\b/i,
      /\bocean.?hot/i,
    ],
  },
  {
    id: "conservation",
    label: "Reef protection actions",
    patterns: [
      /\bprotect/i,
      /\bconserv/i,
      /\bsave energy/i,
      /\breduce emission/i,
      /\breef.?guard/i,
    ],
  },
];

export interface HealthBreakdown {
  healthy: number;
  mild_stress: number;
  bleaching: number;
  severe_damage: number;
  total: number;
}

export interface ConceptMasteryRow {
  conceptId: string;
  label: string;
  studentsWithEvidence: number;
  rosterSize: number;
  percent: number;
}

export interface LessonMasteryRow {
  lessonId: string;
  title: string;
  studentsPassed: number;
  studentsAttempted: number;
  passRate: number;
  avgScore: number;
}

export interface ChapterInsights {
  rosterSize: number;
  scansThisWeek: number;
  scansPriorWeek: number;
  healthThisWeek: HealthBreakdown;
  healthPriorWeek: HealthBreakdown;
  mildStressChangePercent: number | null;
  academyCompletionRate: number;
  lessonMastery: LessonMasteryRow[];
  conceptMastery: ConceptMasteryRow[];
  narrativeBullets: string[];
  generatedAt: string;
}

const HEALTH_KEYS: ReefHealth[] = [
  "healthy",
  "mild_stress",
  "bleaching",
  "severe_damage",
];

export function emptyHealthBreakdown(): HealthBreakdown {
  return {
    healthy: 0,
    mild_stress: 0,
    bleaching: 0,
    severe_damage: 0,
    total: 0,
  };
}

export function addHealth(
  breakdown: HealthBreakdown,
  health: string | null | undefined
): HealthBreakdown {
  const next = { ...breakdown };
  const key = health as ReefHealth;
  if (HEALTH_KEYS.includes(key)) {
    next[key] += 1;
    next.total += 1;
  }
  return next;
}

export function percentChange(current: number, prior: number): number | null {
  if (prior === 0) return current > 0 ? 100 : null;
  return Math.round(((current - prior) / prior) * 100);
}

export function textMentionsConcept(text: string, conceptId: string): boolean {
  const concept = CONCEPT_PATTERNS.find((c) => c.id === conceptId);
  if (!concept) return false;
  return concept.patterns.some((p) => p.test(text));
}

export function scanConceptMastery(
  rosterUserIds: Set<string>,
  textsByUser: Map<string, string[]>
): ConceptMasteryRow[] {
  const rosterSize = rosterUserIds.size;
  return CONCEPT_PATTERNS.map((concept) => {
    let studentsWithEvidence = 0;
    for (const userId of rosterUserIds) {
      const texts = textsByUser.get(userId) ?? [];
      if (texts.some((t) => concept.patterns.some((p) => p.test(t)))) {
        studentsWithEvidence += 1;
      }
    }
    const percent =
      rosterSize > 0
        ? Math.round((studentsWithEvidence / rosterSize) * 100)
        : 0;
    return {
      conceptId: concept.id,
      label: concept.label,
      studentsWithEvidence,
      rosterSize,
      percent,
    };
  });
}

export function buildInsightNarratives(input: {
  rosterSize: number;
  scansThisWeek: number;
  mildStressChangePercent: number | null;
  healthThisWeek: HealthBreakdown;
  conceptMastery: ConceptMasteryRow[];
  lessonMastery: LessonMasteryRow[];
  academyCompletionRate: number;
}): string[] {
  const bullets: string[] = [];

  if (input.scansThisWeek > 0) {
    let stressLine = `Your class scanned ${input.scansThisWeek} coral${
      input.scansThisWeek === 1 ? "" : "s"
    } this week`;
    if (input.mildStressChangePercent !== null && input.healthThisWeek.total > 0) {
      const dir =
        input.mildStressChangePercent > 0 ? "increase" : "decrease";
      const abs = Math.abs(input.mildStressChangePercent);
      if (abs > 0) {
        stressLine += ` and saw a ${abs}% ${dir} in Mild Stress markers vs. last week`;
      }
    }
    bullets.push(`${stressLine}.`);
  } else if (input.rosterSize > 0) {
    bullets.push(
      "No reef scans yet this week — assign a scanner mission to measure classification skills."
    );
  }

  const zoox = input.conceptMastery.find((c) => c.conceptId === "zooxanthellae");
  if (zoox && zoox.rosterSize > 0 && zoox.studentsWithEvidence > 0) {
    bullets.push(
      `${zoox.percent}% of students demonstrated Zooxanthellae / symbiosis vocabulary in forum discussions.`
    );
  }

  const bleachLesson = input.lessonMastery.find(
    (l) => l.lessonId === "lesson-1-bleaching"
  );
  if (bleachLesson && bleachLesson.studentsAttempted > 0) {
    bullets.push(
      `${bleachLesson.passRate}% passed the “What Is Coral Bleaching?” quiz (avg score ${Math.round(bleachLesson.avgScore * 100)}%).`
    );
  }

  if (input.academyCompletionRate > 0) {
    bullets.push(
      `${input.academyCompletionRate}% of your class completed the full Reef Academy guide.`
    );
  }

  const heat = input.conceptMastery.find((c) => c.conceptId === "heat_stress");
  if (heat && heat.percent >= 50 && heat.studentsWithEvidence > 0) {
    bullets.push(
      `${heat.percent}% of students connected reef health to ocean heat in forum posts — strong climate literacy signal.`
    );
  }

  if (bullets.length === 0) {
    bullets.push(
      "Insights will populate as students scan reefs, complete Reef Academy, and join forum discussions."
    );
  }

  return bullets;
}

export function lessonTitles(): Record<string, string> {
  return Object.fromEntries(
    CORAL_GUIDE_LESSONS.map((l) => [l.id, l.title])
  );
}

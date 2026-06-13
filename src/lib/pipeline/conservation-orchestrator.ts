import type {
  ClassificationOutput,
  ConservationPlan,
  ConservationUrgency,
} from "./types";

const URGENCY_WEIGHT: Record<string, number> = {
  healthy: 15,
  mild_stress: 42,
  bleaching: 72,
  severe_damage: 94,
};

function urgencyFromHealth(
  health: ClassificationOutput["health"],
  confidence: number
): ConservationUrgency {
  const score = URGENCY_WEIGHT[health] * (confidence / 100);
  if (score >= 80) return "critical";
  if (score >= 58) return "high";
  if (score >= 35) return "medium";
  return "low";
}

export function orchestrateConservationPlan(
  classification: ClassificationOutput
): ConservationPlan {
  const { health, confidence } = classification;
  const urgency = urgencyFromHealth(health, confidence);
  const priorityScore = Math.round(URGENCY_WEIGHT[health] * (confidence / 100));

  const baseActions = [
    {
      order: 1,
      type: "monitor" as const,
      title: "Log baseline observation",
      detail: "Save this scan with GPS so researchers can track change over time.",
      href: "/scanner",
    },
    {
      order: 2,
      type: "map" as const,
      title: "Pin on global reef map",
      detail: "Add your observation to the student monitoring layer.",
      href: "/map",
    },
    {
      order: 3,
      type: "community" as const,
      title: "Share with reef community",
      detail: "Publish to the gallery so classmates and scientists can review.",
      href: "/gallery",
    },
  ];

  const stressActions =
    health === "healthy"
      ? []
      : [
          {
            order: 4,
            type: "learn" as const,
            title: "Complete bleaching Academy lesson",
            detail: "Understand stress signals and what students can do locally.",
            href: "/academy",
          },
        ];

  const alertActions =
    health === "bleaching" || health === "severe_damage"
      ? [
          {
            order: 5,
            type: "alert" as const,
            title: "Alert your class chapter",
            detail: "Join a school class and surface this on the private leaderboard.",
            href: "/class",
          },
          {
            order: 6,
            type: "restore" as const,
            title: "Find restoration projects",
            detail: "Explore documented restoration sites on the research map.",
            href: "/research",
          },
        ]
      : [];

  const actions = [...baseActions, ...stressActions, ...alertActions].sort(
    (a, b) => a.order - b.order
  );

  const summary =
    urgency === "critical"
      ? "Critical reef stress detected — execute the full conservation sequence immediately."
      : urgency === "high"
        ? "Significant bleaching risk — prioritize mapping, learning, and class alerts."
        : urgency === "medium"
          ? "Early stress signals — monitor weekly and share data with your chapter."
          : "Reef looks resilient — keep monitoring and contribute baseline data.";

  return { urgency, priorityScore, summary, actions };
}

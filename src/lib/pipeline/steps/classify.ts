import type { ReefHealth } from "@/lib/types";
import type { ClassificationOutput, ImageMetrics } from "../types";

function scoreHealth(metrics: ImageMetrics): Record<ReefHealth, number> {
  const { whiteness, colorfulness, brightness, greenRatio } = metrics;

  const severe =
    whiteness * 2.4 + (brightness > 170 ? 0.35 : 0) + (colorfulness < 25 ? 0.2 : 0);
  const bleaching =
    whiteness * 1.8 + (brightness > 150 ? 0.15 : 0) + (greenRatio < 0.28 ? 0.25 : 0);
  const mild =
    whiteness * 1.1 +
    (colorfulness < 35 ? 0.35 : 0) +
    (greenRatio < 0.32 ? 0.15 : 0);
  const healthy =
    colorfulness / 55 +
    (whiteness < 0.1 ? 0.45 : 0) +
    greenRatio * 0.8 +
    (brightness > 80 && brightness < 170 ? 0.1 : 0);

  return {
    severe_damage: severe,
    bleaching,
    mild_stress: mild,
    healthy,
  };
}

export function classifyReefHealth(metrics: ImageMetrics): ClassificationOutput {
  const scores = scoreHealth(metrics);
  const ranked = (
    Object.entries(scores) as [ReefHealth, number][]
  ).sort((a, b) => b[1] - a[1]);

  const [health, topScore] = ranked[0];
  const secondScore = ranked[1][1];
  const margin = Math.max(0, topScore - secondScore);
  const confidence = Math.min(
    96,
    Math.max(58, Math.round(62 + margin * 40 + topScore * 8))
  );

  return { health, confidence, scores };
}

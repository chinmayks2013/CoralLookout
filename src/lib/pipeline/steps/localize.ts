import type { ReefHealth } from "@/lib/types";
import type { ClassificationOutput, ImageMetrics } from "../types";
import { HEALTH_CONFIG } from "../health-config";

function zoneSeed(metrics: ImageMetrics, index: number): number {
  const base =
    metrics.whiteness * 1000 +
    metrics.colorfulness * 10 +
    metrics.brightness +
    index * 137;
  return base - Math.floor(base);
}

export function localizeDamage(
  health: ReefHealth,
  metrics: ImageMetrics
): { x: number; y: number; w: number; h: number }[] {
  if (health === "healthy") return [];

  const count =
    health === "mild_stress" ? 1 : health === "bleaching" ? 2 : 3;

  return Array.from({ length: count }, (_, i) => {
    const sx = zoneSeed(metrics, i * 3);
    const sy = zoneSeed(metrics, i * 3 + 1);
    const sw = zoneSeed(metrics, i * 3 + 2);
    return {
      x: 12 + sx * 58,
      y: 12 + sy * 58,
      w: 14 + sw * 22,
      h: 14 + (1 - sw) * 22,
    };
  });
}

export function buildScanResult(
  classification: ClassificationOutput,
  metrics: ImageMetrics
) {
  const config = HEALTH_CONFIG[classification.health];
  return {
    health: classification.health,
    label: config.label,
    confidence: classification.confidence,
    damageZones: localizeDamage(classification.health, metrics),
    explanation: config.explanation,
    recommendations: config.recommendations,
  };
}

import type { ReefHealth } from "@/lib/types";
import { HEALTH_CONFIG } from "@/lib/pipeline/health-config";

/** @deprecated Use runPipelineAnalysis() — server orchestrator replaces client heuristics */
export { runPipelineAnalysis } from "@/lib/pipeline/client";
export type { PipelineRunResult } from "@/lib/pipeline/types";

export async function analyzeReefImage(
  _imageUrl: string
): Promise<never> {
  throw new Error(
    "Client-side analysis removed. Upload via the scanner to run the coral-saving pipeline."
  );
}

export function getHealthColor(health: ReefHealth): string {
  const colors: Record<ReefHealth, string> = {
    healthy: "#22d3ee",
    mild_stress: "#fbbf24",
    bleaching: "#fb923c",
    severe_damage: "#f87171",
  };
  return colors[health];
}

export function getHealthLabel(health: ReefHealth): string {
  return HEALTH_CONFIG[health].label;
}

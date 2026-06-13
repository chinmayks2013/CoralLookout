import type {
  ClassificationOutput,
  ConservationPlan,
  ImageMetrics,
  PipelineStepTrace,
} from "./types";
import {
  getWandbEntity,
  getWandbProject,
  isWandbEnabled,
} from "./config";

export interface WandbLogInput {
  runId: string;
  userId?: string;
  metrics: ImageMetrics;
  classification: ClassificationOutput;
  plan: ConservationPlan;
  steps: PipelineStepTrace[];
  modelVersion: string;
  totalDurationMs: number;
}

let weaveClientPromise: Promise<unknown> | null = null;

async function getWeaveClient(): Promise<unknown | null> {
  if (!isWandbEnabled()) return null;
  if (!weaveClientPromise) {
    weaveClientPromise = (async () => {
      const weave = await import("weave");
      if (process.env.WANDB_API_KEY) {
        await weave.login(process.env.WANDB_API_KEY);
      }
      return weave.init(getWandbProject());
    })();
  }
  return weaveClientPromise;
}

function buildRunUrl(): string {
  const projectPath = getWandbProject();
  if (projectPath.includes("/")) {
    return `https://wandb.ai/${projectPath}`;
  }
  const entity = getWandbEntity();
  return entity
    ? `https://wandb.ai/${entity}/${projectPath}`
    : `https://wandb.ai/${projectPath}`;
}

export async function logPipelineRun(
  input: WandbLogInput
): Promise<{ runUrl?: string }> {
  if (!isWandbEnabled()) return {};

  try {
    await getWeaveClient();
    const weave = await import("weave");

    const pipelineOp = weave.op(
      async (payload: WandbLogInput) => ({
        run_id: payload.runId,
        user_id: payload.userId ?? "anonymous",
        model_version: payload.modelVersion,
        health: payload.classification.health,
        confidence: payload.classification.confidence,
        health_scores: payload.classification.scores,
        urgency: payload.plan.urgency,
        priority_score: payload.plan.priorityScore,
        whiteness: Number(payload.metrics.whiteness.toFixed(4)),
        colorfulness: Number(payload.metrics.colorfulness.toFixed(2)),
        brightness: Number(payload.metrics.brightness.toFixed(2)),
        pipeline_steps: payload.steps.map((s) => s.id),
        step_durations_ms: payload.steps.map((s) => s.durationMs),
        total_duration_ms: payload.totalDurationMs,
      }),
      { name: "coral_saving_pipeline" }
    );

    await pipelineOp(input);
    return { runUrl: buildRunUrl() };
  } catch (e) {
    console.warn("[wandb] Pipeline trace failed:", e);
    return {};
  }
}

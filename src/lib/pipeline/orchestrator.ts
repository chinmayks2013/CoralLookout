import type { PipelineContext, PipelineRunResult, PipelineStepTrace } from "./types";
import { PIPELINE_MODEL_VERSION } from "./config";
import { preprocessImage } from "./steps/preprocess";
import { validateReefImage } from "./steps/validate-reef";
import { classifyReefHealth } from "./steps/classify";
import { buildScanResult } from "./steps/localize";
import { orchestrateConservationPlan } from "./conservation-orchestrator";
import { logPipelineRun } from "./wandb";

type StepRunner = (
  ctx: PipelineContext
) => Promise<Partial<PipelineContext>>;

async function runStep(
  ctx: PipelineContext,
  id: PipelineStepTrace["id"],
  name: string,
  fn: StepRunner
): Promise<void> {
  const started = performance.now();
  try {
    const patch = await fn(ctx);
    Object.assign(ctx, patch);
    ctx.traces.push({
      id,
      name,
      status: "ok",
      durationMs: Math.round(performance.now() - started),
      output: summarizeStepOutput(id, ctx),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Step failed";
    ctx.traces.push({
      id,
      name,
      status: "error",
      durationMs: Math.round(performance.now() - started),
      error: message,
    });
    throw e;
  }
}

function summarizeStepOutput(
  id: PipelineStepTrace["id"],
  ctx: PipelineContext
): Record<string, unknown> | undefined {
  switch (id) {
    case "preprocess":
      return ctx.metrics
        ? {
            width: ctx.metrics.width,
            height: ctx.metrics.height,
            whiteness: Number(ctx.metrics.whiteness.toFixed(3)),
            colorfulness: Number(ctx.metrics.colorfulness.toFixed(1)),
          }
        : undefined;
    case "validate":
      return ctx.validation
        ? {
            isCoralReef: ctx.validation.isCoralReef,
            confidence: Number((ctx.validation.confidence * 100).toFixed(0)),
            subject: ctx.validation.detectedSubject,
            provider: ctx.validation.provider,
          }
        : undefined;
    case "classify":
      return ctx.classification
        ? {
            health: ctx.classification.health,
            confidence: ctx.classification.confidence,
          }
        : undefined;
    case "localize":
      return ctx.scan
        ? { zones: ctx.scan.damageZones.length, label: ctx.scan.label }
        : undefined;
    case "conserve":
      return ctx.plan
        ? {
            urgency: ctx.plan.urgency,
            priorityScore: ctx.plan.priorityScore,
            actionCount: ctx.plan.actions.length,
          }
        : undefined;
    default:
      return undefined;
  }
}

export async function runCoralSavingPipeline(input: {
  imageBuffer: Buffer;
  mimeType: string;
  userId?: string;
}): Promise<PipelineRunResult> {
  const started = performance.now();
  const runId = crypto.randomUUID();

  const ctx: PipelineContext = {
    runId,
    userId: input.userId,
    imageBuffer: input.imageBuffer,
    mimeType: input.mimeType,
    traces: [],
  };

  await runStep(ctx, "ingest", "Ingest & validate image", async () => {
    if (input.imageBuffer.length === 0) {
      throw new Error("Empty image payload");
    }
    if (input.imageBuffer.length > 12 * 1024 * 1024) {
      throw new Error("Image must be under 12 MB");
    }
    return {};
  });

  await runStep(ctx, "preprocess", "Preprocess & extract features", async () => {
    const { metrics } = await preprocessImage(ctx.imageBuffer);
    return { metrics };
  });

  await runStep(ctx, "validate", "AI reef detection", async () => {
    const validation = await validateReefImage(ctx.imageBuffer, ctx.mimeType);
    return { validation };
  });

  await runStep(ctx, "classify", "Classify reef health", async () => {
    if (!ctx.metrics) throw new Error("Missing image metrics");
    const classification = classifyReefHealth(ctx.metrics);
    return { classification };
  });

  await runStep(ctx, "localize", "Localize stress regions", async () => {
    if (!ctx.metrics || !ctx.classification) {
      throw new Error("Missing classification inputs");
    }
    const scan = buildScanResult(ctx.classification, ctx.metrics);
    return { scan };
  });

  await runStep(ctx, "conserve", "Orchestrate conservation plan", async () => {
    if (!ctx.classification) throw new Error("Missing classification");
    const plan = orchestrateConservationPlan(ctx.classification);
    return { plan };
  });

  let wandbRunUrl: string | undefined;
  const traceStarted = performance.now();
  try {
    const logged = await logPipelineRun({
      runId,
      userId: input.userId,
      metrics: ctx.metrics!,
      classification: ctx.classification!,
      plan: ctx.plan!,
      steps: ctx.traces,
      modelVersion: PIPELINE_MODEL_VERSION,
      totalDurationMs: Math.round(performance.now() - started),
    });
    wandbRunUrl = logged.runUrl;
    ctx.traces.push({
      id: "trace",
      name: "Trace run to Weights & Biases",
      status: wandbRunUrl ? "ok" : "skipped",
      durationMs: Math.round(performance.now() - traceStarted),
      output: wandbRunUrl ? { project: wandbRunUrl } : { reason: "WANDB not configured" },
    });
  } catch (e) {
    ctx.traces.push({
      id: "trace",
      name: "Trace run to Weights & Biases",
      status: "error",
      durationMs: Math.round(performance.now() - traceStarted),
      error: e instanceof Error ? e.message : "Trace failed",
    });
  }

  return {
    runId,
    scan: ctx.scan!,
    plan: ctx.plan!,
    metrics: ctx.metrics!,
    validation: ctx.validation!,
    classification: ctx.classification!,
    steps: ctx.traces,
    modelVersion: PIPELINE_MODEL_VERSION,
    wandbEnabled: Boolean(wandbRunUrl),
    wandbRunUrl,
    totalDurationMs: Math.round(performance.now() - started),
  };
}

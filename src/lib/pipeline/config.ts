export const PIPELINE_MODEL_VERSION = "coral-v2-ai-validated";

export function isWandbEnabled(): boolean {
  return Boolean(
    process.env.WANDB_API_KEY?.trim() &&
      process.env.WANDB_PROJECT?.trim()
  );
}

export function getWandbProject(): string {
  return (
    process.env.WANDB_PROJECT?.trim() || "corallookout/coral-saving-pipeline"
  );
}

export function getWandbEntity(): string | undefined {
  const entity = process.env.WANDB_ENTITY?.trim();
  return entity || undefined;
}

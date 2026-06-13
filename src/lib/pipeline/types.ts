import type { ReefHealth, ScanResult } from "@/lib/types";

export type PipelineStepId =
  | "ingest"
  | "preprocess"
  | "validate"
  | "classify"
  | "localize"
  | "conserve"
  | "trace";

export interface ReefValidationResult {
  isCoralReef: boolean;
  confidence: number;
  detectedSubject: string;
  reason: string;
  provider: "gemini" | "openai" | "huggingface" | "ollama" | "local";
  model: string;
}

export type ConservationUrgency = "low" | "medium" | "high" | "critical";

export type ConservationActionType =
  | "monitor"
  | "map"
  | "learn"
  | "alert"
  | "restore"
  | "community";

export interface ImageMetrics {
  width: number;
  height: number;
  brightness: number;
  whiteness: number;
  colorfulness: number;
  greenRatio: number;
  blueRatio: number;
}

export interface ClassificationOutput {
  health: ReefHealth;
  confidence: number;
  scores: Record<ReefHealth, number>;
}

export interface ConservationAction {
  order: number;
  type: ConservationActionType;
  title: string;
  detail: string;
  href: string;
}

export interface ConservationPlan {
  urgency: ConservationUrgency;
  priorityScore: number;
  summary: string;
  actions: ConservationAction[];
}

export interface PipelineStepTrace {
  id: PipelineStepId;
  name: string;
  status: "ok" | "skipped" | "error";
  durationMs: number;
  output?: Record<string, unknown>;
  error?: string;
}

export interface PipelineContext {
  runId: string;
  userId?: string;
  imageBuffer: Buffer;
  mimeType: string;
  metrics?: ImageMetrics;
  validation?: ReefValidationResult;
  classification?: ClassificationOutput;
  scan?: ScanResult;
  plan?: ConservationPlan;
  traces: PipelineStepTrace[];
}

export interface PipelineRunResult {
  runId: string;
  scan: ScanResult;
  plan: ConservationPlan;
  metrics: ImageMetrics;
  validation: ReefValidationResult;
  classification: ClassificationOutput;
  steps: PipelineStepTrace[];
  modelVersion: string;
  wandbEnabled: boolean;
  wandbRunUrl?: string;
  totalDurationMs: number;
}

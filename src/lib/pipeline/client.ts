import type { PipelineRunResult, ReefValidationResult } from "@/lib/pipeline/types";

export type { PipelineRunResult, ReefValidationResult };

export class PipelineAnalysisError extends Error {
  readonly code?: string;
  readonly validation?: ReefValidationResult;

  constructor(
    message: string,
    options?: { code?: string; validation?: ReefValidationResult }
  ) {
    super(message);
    this.name = "PipelineAnalysisError";
    this.code = options?.code;
    this.validation = options?.validation;
  }
}

export async function runPipelineAnalysis(
  file: File,
  userId?: string
): Promise<PipelineRunResult> {
  const form = new FormData();
  form.append("image", file);
  if (userId) form.append("userId", userId);

  let res: Response;
  try {
    res = await fetch("/api/pipeline/analyze", {
      method: "POST",
      body: form,
    });
  } catch {
    throw new PipelineAnalysisError(
      "Could not reach the analysis server. Make sure npm run dev is running and try again."
    );
  }

  let data: {
    error?: string;
    code?: string;
    validation?: ReefValidationResult;
  };
  try {
    data = await res.json();
  } catch {
    throw new PipelineAnalysisError(
      "Analysis server returned an invalid response. Restart the dev server and try again."
    );
  }

  if (!res.ok) {
    throw new PipelineAnalysisError(data.error ?? "Pipeline analysis failed", {
      code: data.code,
      validation: data.validation,
    });
  }

  return data as PipelineRunResult;
}

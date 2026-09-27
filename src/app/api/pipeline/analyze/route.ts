import { NextResponse } from "next/server";
import { runCoralSavingPipeline } from "@/lib/pipeline/orchestrator";
import { isWandbEnabled } from "@/lib/pipeline/config";
import { NotACoralReefError, getVisionProvider, warmupVisionModel } from "@/lib/pipeline/steps/validate-reef";
import { checkRateLimitForRequest } from "@/lib/api/rate-limit";

export const runtime = "nodejs";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

// Demo-grade protection — see src/lib/api/rate-limit.ts.
const RATE_LIMIT = { windowMs: 60_000, max: 30, scope: "pipeline-analyze" };

export async function POST(request: Request) {
  const limit = checkRateLimitForRequest(request, RATE_LIMIT);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many analyze requests. Please slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("image");
    const userId = form.get("userId");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing image file" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Unsupported image type. Use JPG, PNG, or WebP." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await runCoralSavingPipeline({
      imageBuffer: buffer,
      mimeType: file.type,
      userId: typeof userId === "string" ? userId : undefined,
    });

    return NextResponse.json({
      ...result,
      wandbConfigured: isWandbEnabled(),
    });
  } catch (e) {
    if (e instanceof NotACoralReefError) {
      return NextResponse.json(
        {
          error: e.message,
          code: "not_a_coral_reef",
          validation: e.validation,
        },
        { status: 422 }
      );
    }
    const message =
      e instanceof Error ? e.message : "Coral saving pipeline failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  warmupVisionModel();
  return NextResponse.json({
    name: "coral-saving-pipeline",
    version: "2.0.0",
    steps: [
      "ingest",
      "preprocess",
      "validate",
      "classify",
      "localize",
      "conserve",
      "trace",
    ],
    wandbEnabled: isWandbEnabled(),
    visionProvider: getVisionProvider(),
  });
}

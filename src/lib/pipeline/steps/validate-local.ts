import sharp from "sharp";
import type { ReefValidationResult } from "../types";

const REEF_LABELS = [
  "underwater coral reef",
  "coral colony close-up",
  "bleached coral underwater",
  "coral reef with fish",
];

const NON_REEF_LABELS = [
  "person portrait",
  "indoor room",
  "food on a plate",
  "city street",
  "forest or grass",
  "screenshot or document",
  "pet animal",
  "swimming pool",
];

const MIN_CLIP_REEF_SCORE = 0.22;
const MIN_HEURISTIC_SCORE = 0.52;
const HF_CLIP_MODEL =
  process.env.HF_VISION_MODEL?.trim() || "openai/clip-vit-base-patch16";

interface ClipScore {
  label: string;
  score: number;
}

function scoreClipResults(raw: ClipScore[]): ReefValidationResult {
  const sorted = [...raw].sort((a, b) => b.score - a.score);
  const top = sorted[0];
  const reefScores = sorted.filter((s) => REEF_LABELS.includes(s.label));
  const bestReef = reefScores[0];
  const bestNonReef = sorted.find((s) => NON_REEF_LABELS.includes(s.label));

  const isCoralReef =
    REEF_LABELS.includes(top.label) &&
    top.score >= MIN_CLIP_REEF_SCORE &&
    (!bestNonReef || (bestReef?.score ?? 0) >= bestNonReef.score * 0.85);

  return {
    isCoralReef,
    confidence: bestReef?.score ?? top.score,
    detectedSubject: top.label,
    reason: isCoralReef
      ? "CLIP matched coral reef labels."
      : `Top match was "${top.label}" — not a coral reef image.`,
    provider: "local",
    model: HF_CLIP_MODEL,
  };
}

async function validateWithHfClip(
  visionBuffer: Buffer
): Promise<ReefValidationResult | null> {
  const token =
    process.env.HF_TOKEN?.trim() ||
    process.env.HUGGINGFACE_API_KEY?.trim();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `https://router.huggingface.co/hf-inference/models/${HF_CLIP_MODEL}`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        inputs: `data:image/jpeg;base64,${visionBuffer.toString("base64")}`,
        parameters: {
          candidate_labels: [...REEF_LABELS, ...NON_REEF_LABELS],
        },
      }),
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!res.ok) return null;

  const raw = (await res.json()) as ClipScore[];
  if (!Array.isArray(raw) || raw.length === 0) return null;

  return scoreClipResults(raw);
}

/** Fast on-device fallback when cloud CLIP is unavailable. */
async function validateWithSharpHeuristics(
  visionBuffer: Buffer
): Promise<ReefValidationResult> {
  const { data, info } = await sharp(visionBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let blueSum = 0;
  let greenSum = 0;
  let warmSum = 0;
  let graySum = 0;
  let samples = 0;
  const step = 4;

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    blueSum += b;
    greenSum += g;
    warmSum += r > g && r > b ? 1 : 0;
    const spread = Math.max(r, g, b) - Math.min(r, g, b);
    graySum += spread < 25 ? 1 : 0;
    samples++;
  }

  const blueRatio = blueSum / samples / 255;
  const greenRatio = greenSum / samples / 255;
  const warmRatio = warmSum / samples;
  const grayRatio = graySum / samples;

  const reefScore =
    blueRatio * 0.45 +
    greenRatio * 0.35 +
    (1 - warmRatio) * 0.15 +
    (1 - grayRatio) * 0.05;
  const isCoralReef = reefScore >= MIN_HEURISTIC_SCORE;
  const confidence = isCoralReef
    ? Math.min(0.92, Math.max(MIN_HEURISTIC_SCORE + 0.08, reefScore))
    : Math.min(0.85, Math.max(0.35, 1 - reefScore));

  let detectedSubject = "unknown scene";
  if (warmRatio > 0.35) detectedSubject = "warm-toned photo (likely not underwater)";
  else if (grayRatio > 0.45) detectedSubject = "indoor or grayscale scene";
  else if (blueRatio > 0.38 && greenRatio > 0.32)
    detectedSubject = "underwater reef-like colors";
  else detectedSubject = "non-reef image";

  return {
    isCoralReef,
    confidence,
    detectedSubject,
    reason: isCoralReef
      ? "Underwater color profile matches coral reef imagery."
      : `Image looks like ${detectedSubject}.`,
    provider: "local",
    model: "sharp-heuristic-v1",
  };
}

export async function validateWithLocalClip(
  visionBuffer: Buffer
): Promise<ReefValidationResult> {
  try {
    const hf = await validateWithHfClip(visionBuffer);
    if (hf) return hf;
  } catch {
    // HF unavailable — fall through to heuristics
  }
  return validateWithSharpHeuristics(visionBuffer);
}

export function warmupLocalVision(): void {
  // No-op — HF/heuristic path needs no preload
}

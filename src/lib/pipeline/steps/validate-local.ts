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
/**
 * Pass bar for local color heuristic.
 * Warm tropical coral (pink/orange polyps) often has coolBias ≤ 0, so the score
 * also credits cyan water, coral pigments, and colorfulness — not blue cast alone.
 */
const MIN_HEURISTIC_SCORE = 0.28;
/** validate-reef requires ≥0.55 confidence even when isCoralReef is true. */
const MIN_ACCEPT_CONFIDENCE = 0.58;
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
  const { data } = await sharp(visionBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let redSum = 0;
  let blueSum = 0;
  let greenSum = 0;
  let warmSum = 0;
  let graySum = 0;
  let cyanSum = 0;
  let coralPigmentSum = 0;
  let chromaSum = 0;
  let samples = 0;
  const step = 4;

  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    redSum += r;
    blueSum += b;
    greenSum += g;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const spread = max - min;
    chromaSum += spread;

    warmSum += r > g && r > b ? 1 : 0;
    graySum += spread < 25 ? 1 : 0;

    // Teal / cyan water — blue+green ahead of red.
    if (b > r + 8 && g > r - 8 && (b + g) / 2 > 70) cyanSum++;

    // Saturated coral pigments (stricter than skin tones).
    const isOrange =
      r > 110 && r > g + 25 && g > b + 5 && r - b > 55 && spread > 55;
    const isPink =
      r > 110 &&
      b > 90 &&
      r > g + 15 &&
      b > g &&
      Math.abs(r - b) < 70 &&
      (r + b) / 2 - g > 30 &&
      spread > 45;
    const isYellowGreen =
      g > 100 && r > 70 && g >= r && g > b + 20 && spread > 40;
    if (isOrange || isPink || isYellowGreen) coralPigmentSum++;

    samples++;
  }

  const redRatio = redSum / samples / 255;
  const blueRatio = blueSum / samples / 255;
  const greenRatio = greenSum / samples / 255;
  const warmRatio = warmSum / samples;
  const grayRatio = graySum / samples;
  const cyanRatio = cyanSum / samples;
  const coralPigmentRatio = coralPigmentSum / samples;
  const colorfulness = chromaSum / samples / 255;
  const coolBias = (blueRatio + greenRatio) / 2 - redRatio;
  const blueOverRed = blueRatio / Math.max(redRatio, 0.01);

  // Soft penalties only — pink/orange coral is normal underwater.
  const grayPenalty = Math.max(0, grayRatio - 0.6) * 0.15;
  const warmPenalty = Math.max(0, warmRatio - 0.55) * 0.08;

  const reefScore =
    Math.max(0, coolBias) * 0.22 +
    blueRatio * 0.18 +
    greenRatio * 0.14 +
    cyanRatio * 0.22 +
    coralPigmentRatio * 0.28 +
    colorfulness * 0.18 +
    Math.max(0, 0.4 - grayRatio) * 0.08 -
    warmPenalty -
    grayPenalty;

  // Classic blue-water reef (relaxed vs v2 — shallow reefs are often warm).
  const looksUnderwater =
    (coolBias > 0.015 || cyanRatio > 0.1) &&
    blueRatio > 0.26 &&
    greenRatio > 0.22 &&
    warmRatio < 0.58;

  const looksBleachedReef =
    grayRatio > 0.25 &&
    (coolBias > 0.015 || blueRatio >= redRatio * 0.95) &&
    blueRatio > 0.26 &&
    warmRatio < 0.4;

  // Orange/pink coral close-ups — require some water/cyan so skin tones fail.
  const looksTropicalCoral =
    colorfulness > 0.1 &&
    coralPigmentRatio > 0.05 &&
    grayRatio < 0.55 &&
    cyanRatio > 0.04 &&
    (blueRatio > 0.2 || greenRatio > 0.25 || coolBias > -0.06);

  // Hard rejects for common false positives (portraits / indoor).
  const looksSkinOrPortrait =
    warmRatio > 0.45 &&
    cyanRatio < 0.05 &&
    coolBias < -0.06 &&
    redRatio > greenRatio &&
    greenRatio >= blueRatio - 0.02 &&
    blueOverRed < 0.75;

  const looksIndoorGray =
    grayRatio > 0.62 && coolBias < 0.02 && colorfulness < 0.09;

  const isCoralReef =
    !looksSkinOrPortrait &&
    !looksIndoorGray &&
    (reefScore >= MIN_HEURISTIC_SCORE ||
      looksUnderwater ||
      looksBleachedReef ||
      looksTropicalCoral);

  const confidence = isCoralReef
    ? Math.min(
        0.92,
        Math.max(
          MIN_ACCEPT_CONFIDENCE,
          reefScore +
            (looksUnderwater || looksBleachedReef || looksTropicalCoral
              ? 0.18
              : 0.1)
        )
      )
    : Math.min(0.85, Math.max(0.3, 1 - reefScore));

  let detectedSubject = "unknown scene";
  if (isCoralReef && looksBleachedReef) {
    detectedSubject = "bleached or pale coral reef";
  } else if (isCoralReef && looksTropicalCoral && !looksUnderwater) {
    detectedSubject = "tropical coral colony colors";
  } else if (isCoralReef || looksUnderwater) {
    detectedSubject = "underwater reef-like colors";
  } else if (looksSkinOrPortrait) {
    detectedSubject = "warm-toned photo (likely not underwater)";
  } else if (looksIndoorGray || (grayRatio > 0.55 && coolBias < 0.02)) {
    detectedSubject = "indoor or grayscale scene";
  } else {
    detectedSubject = "non-reef image";
  }

  return {
    isCoralReef,
    confidence,
    detectedSubject,
    reason: isCoralReef
      ? "Color profile matches coral reef / underwater imagery."
      : `Color profile does not match underwater coral reef imagery (detected: ${detectedSubject}).`,
    provider: "local",
    model: "sharp-heuristic-v3",
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

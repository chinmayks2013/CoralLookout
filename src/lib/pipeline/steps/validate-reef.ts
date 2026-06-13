import sharp from "sharp";
import type { ReefValidationResult } from "../types";
import {
  validateWithLocalClip,
  warmupLocalVision,
} from "./validate-local";

export class NotACoralReefError extends Error {
  readonly validation: ReefValidationResult;

  constructor(validation: ReefValidationResult) {
    super(
      validation.reason ||
        `This doesn't look like a coral reef (detected: ${validation.detectedSubject}).`
    );
    this.name = "NotACoralReefError";
    this.validation = validation;
  }
}

const VALIDATION_PROMPT = `Is this a coral reef or underwater coral (including bleached coral close-ups)?
Reply JSON only: {"is_coral_reef":boolean,"confidence":0-1,"detected_subject":"brief label","reason":"one sentence"}
Reject people, pets, food, landscapes, buildings, and non-coral photos.`;

const VISION_MAX_EDGE = Number(process.env.AI_VISION_MAX_EDGE ?? 256);
const OLLAMA_NUM_PREDICT = Number(process.env.OLLAMA_NUM_PREDICT ?? 64);
const OLLAMA_KEEP_ALIVE = process.env.OLLAMA_KEEP_ALIVE?.trim() || "30m";

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

const MIN_REEF_CONFIDENCE = 0.55;
const MIN_CLIP_REEF_SCORE = 0.22;

function bufferToBase64(buffer: Buffer): string {
  return buffer.toString("base64");
}

/** Downscale before vision — full uploads slow LLaVA/Moondream dramatically. */
async function prepareVisionBuffer(imageBuffer: Buffer): Promise<Buffer> {
  return sharp(imageBuffer)
    .rotate()
    .resize(VISION_MAX_EDGE, VISION_MAX_EDGE, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: 72, mozjpeg: true })
    .toBuffer();
}

function parseVisionJson(text: string): {
  is_coral_reef?: boolean;
  confidence?: number;
  detected_subject?: string;
  reason?: string;
} {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI vision returned an invalid response");
  }
  return JSON.parse(jsonMatch[0]) as {
    is_coral_reef?: boolean;
    confidence?: number;
    detected_subject?: string;
    reason?: string;
  };
}

function toValidationResult(
  parsed: {
    is_coral_reef?: boolean;
    confidence?: number;
    detected_subject?: string;
    reason?: string;
  },
  provider: ReefValidationResult["provider"],
  model: string
): ReefValidationResult {
  const confidence =
    typeof parsed.confidence === "number"
      ? Math.min(1, Math.max(0, parsed.confidence))
      : 0;

  return {
    isCoralReef: Boolean(parsed.is_coral_reef),
    confidence,
    detectedSubject: parsed.detected_subject?.trim() || "unknown subject",
    reason: parsed.reason?.trim() || "Could not verify coral reef content.",
    provider,
    model,
  };
}

async function validateWithOllama(
  imageBuffer: Buffer,
  _mimeType: string
): Promise<ReefValidationResult> {
  const baseUrl =
    process.env.OLLAMA_BASE_URL?.trim() || "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_VISION_MODEL?.trim() || "llava";

  const visionBuffer = await prepareVisionBuffer(imageBuffer);

  const res = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: VALIDATION_PROMPT,
          images: [bufferToBase64(visionBuffer)],
        },
      ],
      stream: false,
      format: "json",
      keep_alive: OLLAMA_KEEP_ALIVE,
      options: {
        temperature: 0,
        num_predict: OLLAMA_NUM_PREDICT,
        num_ctx: 2048,
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(
      `Ollama vision failed (${res.status}). Is Ollama running? Try: ollama pull ${model} && ollama serve — ${detail.slice(0, 160)}`
    );
  }

  const data = (await res.json()) as {
    message?: { content?: string };
  };
  const text = data.message?.content;
  if (!text) throw new Error("Ollama returned an empty vision response");

  return toValidationResult(parseVisionJson(text), "ollama", model);
}

async function validateWithGemini(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ReefValidationResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

  const model = process.env.GEMINI_VISION_MODEL?.trim() || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: VALIDATION_PROMPT },
            {
              inline_data: {
                mime_type: mimeType,
                data: bufferToBase64(imageBuffer),
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gemini vision failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned an empty vision response");

  return toValidationResult(parseVisionJson(text), "gemini", model);
}

async function validateWithOpenAI(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ReefValidationResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

  const model = process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o-mini";

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: VALIDATION_PROMPT },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${bufferToBase64(imageBuffer)}`,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`OpenAI vision failed (${res.status}): ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenAI returned an empty vision response");

  return toValidationResult(parseVisionJson(text), "openai", model);
}

interface ClipScore {
  label: string;
  score: number;
}

async function validateWithHuggingFace(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ReefValidationResult> {
  const token =
    process.env.HF_TOKEN?.trim() ||
    process.env.HUGGINGFACE_API_KEY?.trim();
  if (!token) throw new Error("HF_TOKEN not configured");

  const model =
    process.env.HF_VISION_MODEL?.trim() ||
    "openai/clip-vit-large-patch14-336";

  const res = await fetch(
    `https://router.huggingface.co/hf-inference/models/${model}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: `data:${mimeType};base64,${bufferToBase64(imageBuffer)}`,
        parameters: {
          candidate_labels: [...REEF_LABELS, ...NON_REEF_LABELS],
        },
      }),
    }
  );

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(
      `Hugging Face vision failed (${res.status}): ${detail.slice(0, 200)}`
    );
  }

  const scores = (await res.json()) as ClipScore[];
  if (!Array.isArray(scores) || scores.length === 0) {
    throw new Error("Hugging Face returned an empty classification");
  }

  const sorted = [...scores].sort((a, b) => b.score - a.score);
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
      ? "CLIP zero-shot classification matched coral reef labels."
      : `Top match was "${top.label}" — not a coral reef image.`,
    provider: "huggingface",
    model,
  };
}

export function getVisionProvider(): ReefValidationResult["provider"] {
  const preferred = process.env.AI_VISION_PROVIDER?.trim().toLowerCase();

  if (preferred === "ollama") return "ollama";
  if (preferred === "local") return "local";
  if (preferred === "gemini" && process.env.GEMINI_API_KEY?.trim()) {
    return "gemini";
  }
  if (preferred === "openai" && process.env.OPENAI_API_KEY?.trim()) {
    return "openai";
  }
  if (
    preferred === "huggingface" &&
    (process.env.HF_TOKEN?.trim() || process.env.HUGGINGFACE_API_KEY?.trim())
  ) {
    return "huggingface";
  }

  if (process.env.GEMINI_API_KEY?.trim()) return "gemini";
  if (process.env.OPENAI_API_KEY?.trim()) return "openai";
  if (process.env.HF_TOKEN?.trim() || process.env.HUGGINGFACE_API_KEY?.trim()) {
    return "huggingface";
  }
  return "local";
}

export async function validateReefImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ReefValidationResult> {
  const provider = getVisionProvider();
  const visionBuffer = await prepareVisionBuffer(imageBuffer);

  let result: ReefValidationResult;
  switch (provider) {
    case "local":
      result = await validateWithLocalClip(visionBuffer);
      break;
    case "ollama":
      result = await validateWithOllama(visionBuffer, mimeType);
      break;
    case "gemini":
      result = await validateWithGemini(visionBuffer, mimeType);
      break;
    case "openai":
      result = await validateWithOpenAI(visionBuffer, mimeType);
      break;
    case "huggingface":
      result = await validateWithHuggingFace(visionBuffer, mimeType);
      break;
  }

  if (!result.isCoralReef || result.confidence < MIN_REEF_CONFIDENCE) {
    throw new NotACoralReefError(result);
  }

  return result;
}

function warmupOllamaVision(): void {
  const baseUrl =
    process.env.OLLAMA_BASE_URL?.trim() || "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_VISION_MODEL?.trim() || "llava";

  void fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: "ready" }],
      stream: false,
      keep_alive: OLLAMA_KEEP_ALIVE,
      options: { num_predict: 1, temperature: 0 },
    }),
  }).catch(() => {});
}

/** Preload vision model so the first scan is fast. */
export function warmupVisionModel(): void {
  const provider = getVisionProvider();
  if (provider === "local") warmupLocalVision();
  else if (provider === "ollama") warmupOllamaVision();
}

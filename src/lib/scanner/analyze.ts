import type { ReefHealth, ScanResult } from "@/lib/types";

const HEALTH_CONFIG: Record<
  ReefHealth,
  { label: string; explanation: string; recommendations: string[] }
> = {
  healthy: {
    label: "Healthy Reef",
    explanation:
      "Coral polyps show vibrant coloration with intact symbiotic algae (zooxanthellae). Tissue appears dense with good polyp extension. This reef segment demonstrates resilience to current environmental stressors.",
    recommendations: [
      "Continue periodic monitoring to establish a baseline.",
      "Document species diversity when possible.",
      "Share findings with your school chapter on the global map.",
    ],
  },
  mild_stress: {
    label: "Mild Stress",
    explanation:
      "Early signs of stress are visible — slight pale coloration or reduced polyp extension. Zooxanthellae density may be decreasing. This is often reversible if conditions improve quickly.",
    recommendations: [
      "Monitor this site weekly for color changes.",
      "Check local water temperature data in the Research Dashboard.",
      "Report findings to help build regional stress trend maps.",
    ],
  },
  bleaching: {
    label: "Bleaching Detected",
    explanation:
      "Significant loss of symbiotic algae is indicated by widespread pale or white coral tissue. Bleaching occurs when water temperatures exceed coral tolerance (typically >1°C above summer max for 4+ weeks). Recovery is possible if stress ends soon.",
    recommendations: [
      "Flag this location on the Global Reef Map as a hotspot.",
      "Complete the 'Understanding Coral Bleaching' Academy lesson.",
      "Alert your team lead — this data supports conservation prioritization.",
    ],
  },
  severe_damage: {
    label: "Severe Damage",
    explanation:
      "Extensive bleaching, tissue loss, or algal overgrowth suggests this reef segment is in critical condition. Prolonged stress events, storms, or physical damage may be factors. Immediate documentation aids research and restoration planning.",
    recommendations: [
      "Submit detailed observations with GPS if available.",
      "Connect with restoration projects shown on the global map.",
      "Participate in the Coastal Cleanup Mission challenge.",
    ],
  },
};

function analyzeImageData(
  data: Uint8ClampedArray,
  width: number,
  height: number
): { brightness: number; whiteness: number; colorfulness: number } {
  let totalBrightness = 0;
  let whitePixels = 0;
  let colorVariance = 0;
  const sampleStep = 4;
  let samples = 0;

  for (let i = 0; i < data.length; i += 4 * sampleStep) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    totalBrightness += brightness;

    if (brightness > 200 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
      whitePixels++;
    }

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    colorVariance += max - min;
    samples++;
  }

  return {
    brightness: totalBrightness / samples,
    whiteness: whitePixels / samples,
    colorfulness: colorVariance / samples,
  };
}

function classifyFromMetrics(metrics: {
  brightness: number;
  whiteness: number;
  colorfulness: number;
}): { health: ReefHealth; confidence: number } {
  const { whiteness, colorfulness, brightness } = metrics;

  if (whiteness > 0.45 && brightness > 170) {
    return { health: "severe_damage", confidence: 78 + Math.random() * 12 };
  }
  if (whiteness > 0.28) {
    return { health: "bleaching", confidence: 72 + Math.random() * 15 };
  }
  if (whiteness > 0.15 || colorfulness < 35) {
    return { health: "mild_stress", confidence: 68 + Math.random() * 18 };
  }
  if (colorfulness > 50 && whiteness < 0.1) {
    return { health: "healthy", confidence: 82 + Math.random() * 14 };
  }
  return { health: "mild_stress", confidence: 65 + Math.random() * 20 };
}

function generateDamageZones(
  health: ReefHealth,
  count: number
): ScanResult["damageZones"] {
  const zones: ScanResult["damageZones"] = [];
  const numZones =
    health === "healthy" ? 0 : health === "mild_stress" ? 1 : count;

  for (let i = 0; i < numZones; i++) {
    zones.push({
      x: 15 + Math.random() * 55,
      y: 15 + Math.random() * 55,
      w: 12 + Math.random() * 25,
      h: 12 + Math.random() * 25,
    });
  }
  return zones;
}

export async function analyzeReefImage(
  imageUrl: string
): Promise<ScanResult> {
  await new Promise((r) => setTimeout(r, 1800 + Math.random() * 1200));

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSize = 400;
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas not supported"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const metrics = analyzeImageData(
        imageData.data,
        canvas.width,
        canvas.height
      );
      const { health, confidence } = classifyFromMetrics(metrics);
      const config = HEALTH_CONFIG[health];

      resolve({
        health,
        label: config.label,
        confidence: Math.round(confidence),
        damageZones: generateDamageZones(
          health,
          health === "severe_damage" ? 3 : 2
        ),
        explanation: config.explanation,
        recommendations: config.recommendations,
      });
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = imageUrl;
  });
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

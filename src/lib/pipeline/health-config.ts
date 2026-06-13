import type { ReefHealth } from "@/lib/types";

export const HEALTH_CONFIG: Record<
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

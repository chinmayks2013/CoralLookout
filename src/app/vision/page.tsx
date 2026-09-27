import type { Metadata } from "next";
import { VisionMoatView } from "@/components/vision/VisionMoatView";

export const metadata: Metadata = {
  title: "Vision & Data Moat | Coral Lookout",
  description:
    "How Coral Lookout builds a $100k+ mission-critical platform through a global coral intelligence network, verified data, and network effects — not one killer feature.",
  openGraph: {
    title: "Coral Lookout — Vision & Data Moat",
    description:
      "The ten-pillar roadmap and honest AI methodology behind Coral Lookout's reef intelligence network — what's live, what's building, and what's explicitly deferred.",
    type: "website",
  },
};

export default function VisionPage() {
  return <VisionMoatView />;
}

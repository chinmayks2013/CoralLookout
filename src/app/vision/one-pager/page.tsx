import type { Metadata } from "next";
import { OnePagerView } from "@/components/vision/OnePagerView";

export const metadata: Metadata = {
  title: "Partner One-Pager | Coral Lookout",
  description:
    "A print-ready one-pager summarizing Coral Lookout's vision, roadmap, and pilot program — for professors and partners.",
};

export default function VisionOnePagerPage() {
  return <OnePagerView />;
}

import type { Metadata } from "next";
import { CaseStudiesView } from "@/components/case-studies/CaseStudiesView";

export const metadata: Metadata = {
  title: "Case Studies | Coral Lookout",
  description:
    "Real classroom pilots using Coral Lookout, starting with the Puerto Rico cohort — honest, in-progress numbers, not polished marketing stats.",
  openGraph: {
    title: "Coral Lookout Case Studies",
    description:
      "Follow the Puerto Rico classroom pilot and future school partnerships as real results come in.",
  },
};

export default function CaseStudiesPage() {
  return <CaseStudiesView />;
}

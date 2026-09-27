import type { Metadata } from "next";
import { ReleaseNotesView } from "@/components/docs/ReleaseNotesView";

export const metadata: Metadata = {
  title: "Release Notes | Coral Lookout",
  description:
    "What shipped during Coral Lookout's 60-day sales sprint — cohorts, partner tools, moderation, exports, and honest AI methodology.",
};

export default function ReleaseNotesPage() {
  return <ReleaseNotesView />;
}

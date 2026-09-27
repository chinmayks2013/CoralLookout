import type { Metadata } from "next";
import { JoinGuideView } from "@/components/teacher/JoinGuideView";

export const metadata: Metadata = {
  title: "Printable Join Guide | Coral Lookout",
  description:
    "Printable classroom instructions for students to sign in, join a class with a join code, and open the AI reef scanner.",
};

export default function JoinGuidePage() {
  return <JoinGuideView />;
}

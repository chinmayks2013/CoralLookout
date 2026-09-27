import type { Metadata } from "next";
import { SchoolsLandingView } from "@/components/schools/SchoolsLandingView";

export const metadata: Metadata = {
  title: "For Schools | Coral Lookout",
  description:
    "Bring reef monitoring to your classroom: a free AI scanner for students, a teacher dashboard for admins, and a founding pilot program for schools.",
  openGraph: {
    title: "Coral Lookout for Schools",
    description:
      "A reef-monitoring program students finish and teachers trust — dashboards, exports, private leaderboards, and a pilot program for founding schools.",
  },
};

export default function SchoolsPage() {
  return <SchoolsLandingView />;
}

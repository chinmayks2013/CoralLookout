import type { Metadata } from "next";
import { PilotQuickStartView } from "@/components/pilot/PilotQuickStartView";

export const metadata: Metadata = {
  title: "Pilot quick start | Coral Lookout",
  description:
    "Student quick start for Puerto Rico and Caribbean classroom pilots — join, scan, pin, gallery.",
  openGraph: {
    title: "Coral Lookout pilot quick start",
    description:
      "Join your class, scan a reef image, pin a location, and share to the gallery.",
  },
};

export default function PilotPage() {
  return <PilotQuickStartView />;
}

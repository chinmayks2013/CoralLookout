import type { Metadata } from "next";
import { BusinessModelView } from "@/components/business/BusinessModelView";

export const metadata: Metadata = {
  title: "Business Model | Coral Lookout",
  description:
    "How Coral Lookout stays free for students through school subscriptions, research partnerships, and mission-aligned sponsors.",
  openGraph: {
    title: "Coral Lookout — Business Model",
    description:
      "Pricing tiers, revenue streams, and sustainability plan for Coral Lookout's school and research partnerships — built for professors and partners evaluating a pilot.",
    type: "website",
  },
};

export default function BusinessPage() {
  return <BusinessModelView />;
}

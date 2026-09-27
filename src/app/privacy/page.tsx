import type { Metadata } from "next";
import { PrivacyView } from "@/components/privacy/PrivacyView";

export const metadata: Metadata = {
  title: "Privacy & Student Data | Coral Lookout",
  description:
    "A plain-language summary of what Coral Lookout collects, student account rules, gallery image rights, school chapter data, and retention — for school procurement.",
};

export default function PrivacyPage() {
  return <PrivacyView />;
}

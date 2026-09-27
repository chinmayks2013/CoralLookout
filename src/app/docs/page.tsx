import type { Metadata } from "next";
import { DocsView } from "@/components/docs/DocsView";

export const metadata: Metadata = {
  title: "Guides & Docs | Coral Lookout",
  description:
    "Teacher guide, student guide, and partner overview for Coral Lookout — plus a printable join guide for classrooms.",
};

export default function DocsPage() {
  return <DocsView />;
}

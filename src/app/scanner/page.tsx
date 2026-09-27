import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { CoralScanner } from "@/components/scanner/CoralScanner";

export const metadata: Metadata = {
  title: "AI Coral Scanner | Coral Lookout",
  description:
    "Upload a reef photo for instant AI health analysis — confidence scores, damage zones, and a conservation plan. Free for students and classrooms.",
  openGraph: {
    title: "Coral Lookout — AI Coral Scanner",
    description:
      "Free AI-powered reef health scanner for students and researchers — instant analysis, honest confidence scores, and a shareable conservation plan.",
    type: "website",
  },
};

export default function ScannerPage() {
  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12 min-w-0">
      <PageHeader
        badge="Main Feature"
        title="AI Coral Scanner"
        subtitle="Upload coral reef images for instant AI analysis — health status, confidence scores, damage zones, and educational insights."
      />
      <Suspense
        fallback={
          <p className="text-center text-slate-400 text-sm py-12">Loading scanner…</p>
        }
      >
        <CoralScanner />
      </Suspense>
    </div>
  );
}

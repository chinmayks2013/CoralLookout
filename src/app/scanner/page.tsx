import { PageHeader } from "@/components/ui/PageHeader";
import { CoralScanner } from "@/components/scanner/CoralScanner";

export default function ScannerPage() {
  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-12 min-w-0">
      <PageHeader
        badge="Main Feature"
        title="AI Coral Scanner"
        subtitle="Upload coral reef images for instant AI analysis — health status, confidence scores, damage zones, and educational insights."
      />
      <CoralScanner />
    </div>
  );
}

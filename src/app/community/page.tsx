import { Suspense } from "react";
import { CommunityView } from "@/components/community/CommunityView";

export default function CommunityPage() {
  return (
    <Suspense
      fallback={
        <section className="mx-auto max-w-7xl px-4 py-12 text-center text-slate-400">
          Loading community…
        </section>
      }
    >
      <CommunityView />
    </Suspense>
  );
}